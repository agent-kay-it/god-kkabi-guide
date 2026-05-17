/**
 * Chat 도메인 타입 — Sprint 10 Phase E 확장.
 * 출처: docs/sprint/10-sprint-launch/design.md §4 (RTDB Topology) + §7 (Chat UI)
 *
 * 본 모듈은 Pure (React/Next/Firebase 의존성 0) — server + client 양쪽에서 import.
 * 기존 types/chat.ts (Sprint V2 — 콜론 prefix `server:` / `munpa:`)는 ChatWidget 위젯
 * 전용으로 유지하고, 본 모듈은 Phase E 신규 라우팅 ('/chat/[channelId]' — 하이픈
 * prefix `server-` / `munpa-`)에 대응한다. RTDB security rules (database.rules.json)
 * 는 `server-{serverId}` / `munpa-{munpaId}` 패턴으로 deploy되어 있다.
 */

/** 3-tier 채널 종류. */
export type ChannelKind = 'global' | 'server' | 'munpa';

/** 파싱된 채널 식별 정보. */
export interface ParsedChannel {
  readonly kind: ChannelKind;
  /** server-{X} / munpa-{X} 의 X 부분. global이면 undefined. */
  readonly suffix?: string;
}

/** MessageItem render variant. */
export type MessageVariant =
  | { readonly type: 'text'; readonly content: string }
  | { readonly type: 'link'; readonly content: string; readonly linkPreview: LinkPreviewMeta }
  | { readonly type: 'deleted'; readonly reason: 'self' | 'operator' | 'hidden' };

/**
 * RTDB 메시지에 동봉되는 OG 미리보기 메타 — RTDB rules의 linkPreview 노드
 * 화이트리스트와 일치해야 한다 (url/title/description?/image?/domain).
 */
export interface LinkPreviewMeta {
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly image?: string;
  readonly domain: string;
}

/** 채팅 사용자 컨텍스트 (canAccessChannel 등 도메인 함수 입력용). */
export interface ChatUserContext {
  readonly uid: string;
  readonly role: 'admin' | 'user' | 'banned' | undefined;
  readonly registered: boolean | undefined;
  readonly serverId: string | undefined;
  /** 문파 ID — Firestore munpa doc ID와 동일 (`${serverId}_${munpaName}`). */
  readonly munpaId: string | undefined;
}

/** 사용자에게 노출되는 채널 nav 엔트리. */
export interface ChannelNavEntry {
  readonly id: string;
  readonly kind: ChannelKind;
  readonly label: string;
  readonly available: boolean;
  /** 비활성 사유 (UI에 노출). */
  readonly disabledReason?: 'NOT_REGISTERED' | 'NO_SERVER' | 'NO_MUNPA' | 'BANNED';
}
