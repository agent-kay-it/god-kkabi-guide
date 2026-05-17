/**
 * MessageVariant resolver — RTDB ChatMessage → render variant.
 * 출처: docs/sprint/10-sprint-launch/design.md §7.2
 *
 * 우선순위:
 *   1. deletedByOperator → { type: 'deleted', reason: 'operator' }
 *   2. hidden && !keptByOperator → { type: 'deleted', reason: 'hidden' }
 *   3. linkPreview 존재 → { type: 'link', content, linkPreview }
 *   4. default → { type: 'text', content }
 *
 * Sprint 11+: image variant 추가 예정 (현재 단계에서는 image variant 제거 — UI에서
 * image 첨부 기능 미노출).
 */
import type { ChatMessage } from '@/types/chat';
import type { MessageVariant, LinkPreviewMeta } from './types';

interface RawLinkPreview {
  url?: unknown;
  title?: unknown;
  description?: unknown;
  image?: unknown;
  domain?: unknown;
}

/** RTDB raw 값에서 LinkPreviewMeta로 안전 변환 (정규식 검증 RTDB rule이 1차로 거름). */
function toLinkPreview(raw: unknown): LinkPreviewMeta | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as RawLinkPreview;
  if (typeof r.url !== 'string') return null;
  if (typeof r.title !== 'string') return null;
  if (typeof r.domain !== 'string') return null;
  if (!r.url.startsWith('https://')) return null;
  return {
    url: r.url,
    title: r.title,
    domain: r.domain,
    ...(typeof r.description === 'string' ? { description: r.description } : {}),
    ...(typeof r.image === 'string' && r.image.startsWith('https://') ? { image: r.image } : {}),
  };
}

/** ChatMessage에 linkPreview가 동봉되었는지 확인 (types/chat.ts에 정의되지 않은 확장 필드). */
function extractLinkPreview(message: ChatMessage): LinkPreviewMeta | null {
  const raw = (message as ChatMessage & { linkPreview?: unknown }).linkPreview;
  return toLinkPreview(raw);
}

export function resolveMessageVariant(message: ChatMessage): MessageVariant {
  if (message.deletedByOperator) {
    return { type: 'deleted', reason: 'operator' };
  }
  if (message.hidden && !message.keptByOperator) {
    return { type: 'deleted', reason: 'hidden' };
  }
  const linkPreview = extractLinkPreview(message);
  if (linkPreview) {
    return { type: 'link', content: message.content, linkPreview };
  }
  return { type: 'text', content: message.content };
}
