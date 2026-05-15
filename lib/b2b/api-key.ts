/**
 * B2B API Key 발급 + 해시 + 검증 — Sprint V3 P3.B.
 *
 * 보안:
 *  - plaintext key는 발급 시점에만 반환. Firestore에는 sha256 hex digest만 저장.
 *  - timing-safe 비교 (Buffer.equals).
 *  - prefix는 표시용 (식별 가능, 보안 영향 없음).
 *
 * Format: `gkg_${24 hex chars}` (총 28 chars + prefix 4 = 32 chars).
 *
 * 본 파일은 서버 전용. Firebase Admin SDK 없이 Node.js 표준 crypto만 사용.
 */
import 'server-only';

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { API_KEY_BYTE_LENGTH } from '@/types/b2b';

const KEY_PREFIX = 'gkg_';

/** plaintext API Key 생성 — `gkg_${32 hex chars}` */
export function generateApiKey(): string {
  const random = randomBytes(API_KEY_BYTE_LENGTH).toString('hex');
  return `${KEY_PREFIX}${random}`;
}

/** sha256 hex digest */
export function hashApiKey(plaintext: string): string {
  return createHash('sha256').update(plaintext, 'utf8').digest('hex');
}

/** UI 표시용 — `gkg_a1b2...` (8 chars + ellipsis) */
export function maskApiKey(plaintext: string): string {
  if (!plaintext.startsWith(KEY_PREFIX)) return '****';
  return `${plaintext.slice(0, KEY_PREFIX.length + 4)}...`;
}

/**
 * Authorization 헤더 파싱 + 정규화.
 * 허용 포맷:
 *  - `Bearer <plaintext>`  (REST 표준)
 *  - `<plaintext>`         (X-API-Key 헤더 직접 전달)
 */
export function parseAuthorizationHeader(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('Bearer ')) return trimmed.slice('Bearer '.length).trim();
  if (trimmed.startsWith('bearer ')) return trimmed.slice('bearer '.length).trim();
  return trimmed;
}

/** timing-safe hash 비교 */
export function timingSafeHashEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}
