/**
 * MessageVariant resolver — RTDB ChatMessage → render variant.
 * 출처: docs/sprint/10-sprint-launch/design.md §7.2
 *      + docs/sprint/11-sprint-images/design.md §6.7 (Sprint 11 image variant)
 *
 * 우선순위:
 *   1. deletedByOperator → { type: 'deleted', reason: 'operator' }
 *   2. hidden && !keptByOperator → { type: 'deleted', reason: 'hidden' }
 *   3. imageUrl 존재 → { type: 'image', imageUrl, content? }  ← Sprint 11
 *   4. linkPreview 존재 → { type: 'link', content, linkPreview }
 *   5. default → { type: 'text', content }
 *
 * image > link 우선: 메시지가 이미지와 링크를 둘 다 동봉하면 시각적으로 더 강한
 * 이미지를 메인 콘텐츠로 표시한다 (디자인 §6.7).
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
  // Sprint 11 Phase D — image가 link보다 우선 (시각적 우선순위).
  // RTDB rules가 imageUrl 도메인을 cdn(-staging)?.kkaebizigi.com으로 1차 검증.
  if (typeof message.imageUrl === 'string' && message.imageUrl.length > 0) {
    return {
      type: 'image',
      imageUrl: message.imageUrl,
      ...(message.content ? { content: message.content } : {}),
    };
  }
  const linkPreview = extractLinkPreview(message);
  if (linkPreview) {
    return { type: 'link', content: message.content, linkPreview };
  }
  return { type: 'text', content: message.content };
}
