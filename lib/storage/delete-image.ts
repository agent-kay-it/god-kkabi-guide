/**
 * Sprint 11 Phase B — Admin moderation 이미지 삭제 (server-only).
 * 출처: docs/sprint/11-sprint-images/design.md §4.7 + §8.6
 *
 * 사용처: 신고 처리, 회원 탈퇴 후 잔존 이미지 정리.
 * 본 모듈은 운영자 권한 검증을 책임지지 않는다 — 호출자(moderation-actions 등)가
 * admin role을 사전 확인해야 한다.
 */
import 'server-only';

import { DeleteObjectCommand } from '@aws-sdk/client-s3';

import { getBucket, getCdnBaseUrl, getS3Client } from './s3-adapter';

/**
 * CDN viewer URL에서 S3 object key를 추출.
 * base URL과 prefix가 일치하지 않으면 null (외부 URL 또는 손상된 데이터).
 */
export function extractObjectKey(cdnUrl: string): string | null {
  if (typeof cdnUrl !== 'string' || cdnUrl.length === 0) return null;
  const base = getCdnBaseUrl();
  if (!cdnUrl.startsWith(`${base}/`)) return null;
  const key = cdnUrl.slice(base.length + 1);
  if (key.length === 0) return null;
  return key;
}

export type DeleteImageResult =
  | { readonly ok: true; readonly objectKey: string }
  | { readonly ok: false; readonly reason: 'INVALID_URL' | 'S3_DELETE_FAILED'; readonly message?: string };

/**
 * S3에서 객체를 삭제. (CloudFront 캐시는 자연 만료, 긴급 시 invalidateCdnPath 호출.)
 */
export async function deleteImageObject(cdnUrl: string): Promise<DeleteImageResult> {
  const key = extractObjectKey(cdnUrl);
  if (!key) return { ok: false, reason: 'INVALID_URL' };
  try {
    const client = getS3Client();
    await client.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
    return { ok: true, objectKey: key };
  } catch (err) {
    return {
      ok: false,
      reason: 'S3_DELETE_FAILED',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
