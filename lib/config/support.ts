/**
 * Support / Contact 정보 — Sprint V3 P3.A (CA2-I7).
 *
 * env 우선 + 기본값 fallback. metadata.ts 또는 client에서 동일하게 import.
 * 운영자가 영업 명의 변경 시 env만 갱신하면 전 site 반영.
 */

const DEFAULT_SUPPORT_EMAIL = 'kay@agentkay.it';
const DEFAULT_AUTHOR_NAME = 'kay@agentkay.it';

/** 운영자 연락 이메일 (서버/클라이언트 양쪽 안전 — public env) */
export const SUPPORT_EMAIL: string =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;

/** SEO metadata authors/publisher 이름 */
export const AUTHOR_NAME: string =
  process.env.NEXT_PUBLIC_AUTHOR_NAME?.trim() || DEFAULT_AUTHOR_NAME;

/** mailto: 링크 (RFC 6068 — 추가 query parameters 가능) */
export function supportMailto(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return `mailto:${SUPPORT_EMAIL}${query ? `?${query}` : ''}`;
}
