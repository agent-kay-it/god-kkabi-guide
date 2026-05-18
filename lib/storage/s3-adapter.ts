/**
 * Sprint 11 Phase B — S3 client + env reader (server-only).
 * 출처: docs/sprint/11-sprint-images/design.md §4.3
 *
 * Singleton 패턴으로 S3Client를 캐싱한다 (Vercel Fluid Compute에서 인스턴스 재사용 시
 * cold start 비용 최소화). 자격증명은 Vercel 환경변수에서만 읽으며, hardcode 절대 금지.
 *
 * 주의: Vercel은 Lambda 런타임에서 `AWS_REGION`을 자동 주입한다(예: "iad1"). 충돌을
 * 피하기 위해 본 모듈은 `AWS_S3_REGION` / `AWS_S3_ACCESS_KEY_ID` /
 * `AWS_S3_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET` / `NEXT_PUBLIC_CDN_URL`을 사용한다.
 */
import 'server-only';

import { S3Client } from '@aws-sdk/client-s3';

let cachedClient: S3Client | null = null;

/**
 * 캐싱된 S3Client를 반환. 첫 호출 시 환경변수에서 자격증명을 읽어 초기화.
 *
 * @throws Error 환경변수 누락 시
 */
export function getS3Client(): S3Client {
  if (cachedClient) return cachedClient;
  const region = process.env.AWS_S3_REGION;
  const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS_S3_REGION / AWS_S3_ACCESS_KEY_ID / AWS_S3_SECRET_ACCESS_KEY env not configured');
  }
  cachedClient = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

/** 환경변수에서 bucket 이름을 읽어 반환. */
export function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error('AWS_S3_BUCKET env not configured');
  return bucket;
}

/** CDN viewer base URL (trailing slash 제거). */
export function getCdnBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_CDN_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CDN_URL env not configured');
  return url.replace(/\/$/, '');
}

/**
 * 테스트용 — 캐싱된 client를 재설정.
 * 프로덕션 코드에서 호출하면 안 됨.
 */
export function __resetS3ClientCacheForTest(): void {
  cachedClient = null;
}
