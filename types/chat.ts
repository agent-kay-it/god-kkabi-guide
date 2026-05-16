/**
 * 채팅 도메인 타입 — Realtime DB 기반.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §3 (Realtime DB chat)
 *      + design.md §6 (Hybrid Chat backend)
 *
 * 채널:
 *  - global               — 전체 채팅 (모든 사용자)
 *  - server:{serverId}    — 서버별 채팅 (서버 ID로 분리, 예 'server:S785')
 *  - munpa:{serverId}:{munpaName} — 문파별 채팅
 */
export type ChatChannelKind = 'global' | 'server' | 'munpa';

export interface ChatChannelKey {
  readonly kind: ChatChannelKind;
  readonly serverId?: string;
  readonly munpaName?: string;
}

/**
 * Realtime DB 메시지 노드 (`chat/messages/{channelId}/{messageId}`).
 *
 * `id` 는 RTDB push() 자동 생성 키 (시간 순 정렬 가능).
 */
export interface ChatMessage {
  /** RTDB push key */
  readonly id: string;
  readonly channelId: string;
  readonly authorUid: string;
  readonly authorNickname: string;
  readonly authorClassId?: 'warrior' | 'swordsman' | 'medium';
  readonly authorRole?: 'admin' | 'user';
  /** 마스킹 적용 후 본문 (서버에서 처리하지 않고 클라이언트 사전 검증 + admin 사후 검토) */
  readonly content: string;
  /** Storage URL (선택) — 1MB 미만 압축본만 허용 */
  readonly imageUrl?: string;
  /** 메시지 작성 시각 (RTDB serverTimestamp() — 숫자 ms) */
  readonly createdAt: number;
  /** 자동 숨김 (신고 누적 3건 시 true) */
  readonly hidden?: boolean;
  /** 운영자가 명시적으로 유지 결정한 경우 — 자동 숨김 우회 */
  readonly keptByOperator?: boolean;
  /** 운영자가 명시적으로 삭제한 경우 */
  readonly deletedByOperator?: boolean;
}

/** ChatChannel 메타 (Firestore `chat_channels/{channelId}`) — 사용자 카운트 등 denormalized. */
export interface ChatChannelMeta {
  readonly id: string;
  readonly kind: ChatChannelKind;
  readonly serverId?: string;
  readonly munpaName?: string;
  readonly memberCount: number;
  readonly lastMessageAtMs?: number;
  readonly isActive: boolean;
}

/** ChannelKey → RTDB 경로 라벨 변환 */
export function channelId(key: ChatChannelKey): string {
  if (key.kind === 'global') return 'global';
  if (key.kind === 'server') return `server:${key.serverId}`;
  return `munpa:${key.serverId}:${key.munpaName}`;
}

export function channelLabel(key: ChatChannelKey): string {
  if (key.kind === 'global') return '전체';
  if (key.kind === 'server') return `서버 ${key.serverId}`;
  return `문파 ${key.munpaName}`;
}

export type ReportReason = 'spam' | 'abusive' | 'nsfw' | 'off_topic' | 'impersonation' | 'other';

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  spam: '도배·스팸',
  abusive: '욕설·인신공격',
  nsfw: '음란·선정성',
  off_topic: '주제 무관',
  impersonation: '사칭·악용',
  other: '기타',
};

export interface ChatReportInput {
  readonly messageId: string;
  readonly channelId: string;
  readonly reportedUid: string;
  readonly reasons: readonly ReportReason[];
  readonly messageSnapshot: string;
  readonly imageUrl?: string;
  readonly extraText?: string;
}
