/**
 * 채널 ID 파싱 + 사용자 채널 nav 계산 — Pure 도메인 함수.
 * 출처: docs/sprint/10-sprint-launch/design.md §4.3 + §7.3
 *
 * 책임:
 *  1. `validateChannelId` — RTDB rules와 동일 정규식으로 입력 검증
 *  2. `parseChannelId` — channelId → { kind, suffix } 파싱
 *  3. `formatChannelId` — kind+suffix → channelId (생성 측)
 *  4. `resolveUserChannels` — 사용자 컨텍스트 → 3 nav 엔트리
 *
 * 본 모듈은 외부 의존성 0 — server (SSR) + client (sidebar UI) 양쪽에서 import.
 */
import type {
  ChannelKind,
  ChannelNavEntry,
  ChatUserContext,
  ParsedChannel,
} from './types';

/**
 * RTDB 경로 + 보안 rule (database.rules.json) 와 일치하는 ID 패턴:
 *   - `global`
 *   - `server-{serverId}`        serverId = `S\d{1,4}` (ProfileEditSchema 기준)
 *   - `munpa-{munpaId}`          munpaId  = `${serverId}_${munpaName}` (Firestore 문서 ID 패턴)
 *
 * 영문/숫자/한글/언더스코어/하이픈을 허용한다 (Firestore 문서 ID는 한글 허용,
 * RTDB 경로도 URI-encode 후 한글 허용). 제어 문자 / 슬래시 / 점 등은 차단.
 */
const GLOBAL_ID = 'global';
const SERVER_REGEX = /^server-[A-Za-z0-9_가-힣-]{1,40}$/;
const MUNPA_REGEX = /^munpa-[A-Za-z0-9_가-힣-]{1,80}$/;

/** RTDB rules와 동일 패턴으로 channelId 검증. */
export function validateChannelId(channelId: string): boolean {
  if (typeof channelId !== 'string') return false;
  if (channelId === GLOBAL_ID) return true;
  if (SERVER_REGEX.test(channelId)) return true;
  if (MUNPA_REGEX.test(channelId)) return true;
  return false;
}

/** channelId → ParsedChannel. 잘못된 ID이면 null. */
export function parseChannelId(channelId: string): ParsedChannel | null {
  if (!validateChannelId(channelId)) return null;
  if (channelId === GLOBAL_ID) return { kind: 'global' };
  if (channelId.startsWith('server-')) {
    return { kind: 'server', suffix: channelId.slice('server-'.length) };
  }
  return { kind: 'munpa', suffix: channelId.slice('munpa-'.length) };
}

/** kind + suffix → channelId. global은 suffix 무시. */
export function formatChannelId(kind: ChannelKind, suffix?: string): string {
  if (kind === 'global') return GLOBAL_ID;
  if (!suffix) {
    throw new Error(`formatChannelId: ${kind} requires suffix`);
  }
  return `${kind}-${suffix}`;
}

/** 안전한 channel label 생성 (UI 표시용 — XSS 방지는 React가 처리). */
export function channelLabel(parsed: ParsedChannel): string {
  if (parsed.kind === 'global') return '전체';
  if (parsed.kind === 'server') return `서버 ${parsed.suffix ?? ''}`.trim();
  // munpa suffix는 "{serverId}_{munpaName}" 형식 — UI에서는 문파명만 표시
  const munpaName = parsed.suffix?.includes('_')
    ? parsed.suffix.split('_').slice(1).join('_')
    : (parsed.suffix ?? '');
  return `문파 ${munpaName}`.trim();
}

/**
 * 사용자 컨텍스트 → 3-tier 채널 nav 엔트리.
 *
 * - banned: 모든 채널 비활성 (BANNED)
 * - !registered: global만 read 가능하지만 send 불가 — UI는 표시 + tier에서 차단
 * - !serverId: server 탭 비활성 (NO_SERVER)
 * - !munpaId: munpa 탭 비활성 (NO_MUNPA)
 */
export function resolveUserChannels(user: ChatUserContext): readonly ChannelNavEntry[] {
  const isBanned = user.role === 'banned';

  const entries: ChannelNavEntry[] = [
    {
      id: GLOBAL_ID,
      kind: 'global',
      label: '전체',
      available: !isBanned,
      ...(isBanned ? { disabledReason: 'BANNED' as const } : {}),
    },
  ];

  if (isBanned) {
    entries.push(
      { id: 'server-', kind: 'server', label: '서버', available: false, disabledReason: 'BANNED' },
      { id: 'munpa-', kind: 'munpa', label: '문파', available: false, disabledReason: 'BANNED' },
    );
    return entries;
  }

  if (user.serverId) {
    entries.push({
      id: formatChannelId('server', user.serverId),
      kind: 'server',
      label: `서버 ${user.serverId}`,
      available: true,
    });
  } else {
    entries.push({
      id: 'server-',
      kind: 'server',
      label: '서버',
      available: false,
      disabledReason: 'NO_SERVER',
    });
  }

  if (user.munpaId) {
    const munpaName = user.munpaId.includes('_')
      ? user.munpaId.split('_').slice(1).join('_')
      : user.munpaId;
    entries.push({
      id: formatChannelId('munpa', user.munpaId),
      kind: 'munpa',
      label: `문파 ${munpaName}`,
      available: true,
    });
  } else {
    entries.push({
      id: 'munpa-',
      kind: 'munpa',
      label: '문파',
      available: false,
      disabledReason: 'NO_MUNPA',
    });
  }

  return entries;
}

/**
 * 사용자 → 기본 채널 (가장 우선순위 높은 active 채널).
 * 우선순위: munpa > server > global. 없으면 global.
 */
export function defaultChannelFor(user: ChatUserContext): string {
  if (user.role === 'banned') return GLOBAL_ID;
  if (user.munpaId) return formatChannelId('munpa', user.munpaId);
  if (user.serverId) return formatChannelId('server', user.serverId);
  return GLOBAL_ID;
}

/**
 * Firestore에 저장된 munpa doc ID 생성. update-profile.ts / register.ts 와 동일한
 * 패턴을 보장하기 위해 단일 진실의 원천 (DRY).
 */
export function makeMunpaId(serverId: string, munpaName: string): string {
  return `${serverId}_${munpaName}`;
}
