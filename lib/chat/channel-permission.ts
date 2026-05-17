/**
 * 채널 접근 권한 검증 — Pure 도메인 함수 (server SSR + client UI 공용).
 * 출처: docs/sprint/10-sprint-launch/design.md §7.4
 *
 * 3중 방어 중 첫 번째 레이어:
 *   1. canAccessChannel — Server Component SSR에서 호출 (page.tsx)
 *   2. ChannelSidebar — UI 비활성화 (resolveUserChannels의 available=false)
 *   3. RTDB security rules — 최종 진실 (database.rules.json)
 *
 * 본 함수는 RTDB rules와 정확히 동일한 결정 트리를 구현해야 한다. 차이가
 * 발생하면 사용자는 SSR을 통과하고 RTDB가 거부 → 메시지 로드 실패 UX.
 */
import { parseChannelId } from './channel-resolver';
import type { ChatUserContext } from './types';

export type AccessDenyReason =
  | 'INVALID_CHANNEL'
  | 'NOT_AUTHENTICATED'
  | 'BANNED'
  | 'SERVER_MISMATCH'
  | 'MUNPA_MISMATCH';

export type AccessResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: AccessDenyReason };

/**
 * 사용자가 채널을 read 가능한지 검사 (RTDB `.read` 와 동치).
 *
 * - INVALID_CHANNEL: channelId 패턴 불일치
 * - NOT_AUTHENTICATED: uid 없음
 * - BANNED: role === 'banned'
 * - SERVER_MISMATCH: server-{X} 인데 user.serverId !== X
 * - MUNPA_MISMATCH: munpa-{X} 인데 user.munpaId !== X
 */
export function canAccessChannel(
  channelId: string,
  user: ChatUserContext,
): AccessResult {
  const parsed = parseChannelId(channelId);
  if (!parsed) return { ok: false, reason: 'INVALID_CHANNEL' };
  if (!user.uid) return { ok: false, reason: 'NOT_AUTHENTICATED' };
  if (user.role === 'banned') return { ok: false, reason: 'BANNED' };

  if (parsed.kind === 'global') return { ok: true };

  if (parsed.kind === 'server') {
    if (!user.serverId || parsed.suffix !== user.serverId) {
      return { ok: false, reason: 'SERVER_MISMATCH' };
    }
    return { ok: true };
  }

  // parsed.kind === 'munpa'
  if (!user.munpaId || parsed.suffix !== user.munpaId) {
    return { ok: false, reason: 'MUNPA_MISMATCH' };
  }
  return { ok: true };
}

/**
 * 메시지 write 가능한지 검사 (RTDB `.write` 와 동치).
 * read 권한 + registered === true + 본인 메시지여야 함.
 * admin은 본인 외 메시지도 write 가능 (모더레이션 액션이 별도 경로로 갈 수 있음).
 */
export function canSendMessage(
  channelId: string,
  user: ChatUserContext,
): AccessResult {
  const access = canAccessChannel(channelId, user);
  if (!access.ok) return access;
  if (user.role === 'admin') return { ok: true };
  if (!user.registered) return { ok: false, reason: 'NOT_AUTHENTICATED' };
  return { ok: true };
}

/** 사람이 읽을 수 있는 에러 메시지 (UI 노출용). */
export function accessDenyMessage(reason: AccessDenyReason): string {
  switch (reason) {
    case 'INVALID_CHANNEL':
      return '존재하지 않는 채널입니다.';
    case 'NOT_AUTHENTICATED':
      return '로그인 후 등록을 완료해주세요.';
    case 'BANNED':
      return '정지된 계정은 채팅을 사용할 수 없습니다.';
    case 'SERVER_MISMATCH':
      return '본인 서버 채널만 이용할 수 있습니다.';
    case 'MUNPA_MISMATCH':
      return '본인 문파 채널만 이용할 수 있습니다.';
  }
}
