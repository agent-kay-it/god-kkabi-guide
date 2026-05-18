/**
 * Sprint 11 Phase B — Presigned URL 발급 (server-only).
 * 출처: docs/sprint/11-sprint-images/design.md §4.4
 *
 * S3 PutObject용 presigned URL을 발급하여 클라이언트가 직접 S3에 PUT 할 수 있게 한다.
 * 서버는 객체 데이터를 거치지 않아 Vercel Function 메모리/시간 부담이 없다.
 *
 * 검증 책임:
 *  - MIME 화이트리스트 (4종)
 *  - 파일 크기 ≤ 5MB
 *  - uid 패턴 (영문/숫자/밑줄/하이픈, 1~128자)
 *
 * 미검증 책임 (호출자가 보장):
 *  - 인증 / 가입 / role !== 'banned'
 *  - 채팅 채널 접근권한
 *  - Rate limit
 */
import 'server-only';

import crypto from 'node:crypto';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getS3Client, getBucket, getCdnBaseUrl } from './s3-adapter';
import type { AllowedMime, PresignRequestInput, PresignResult } from './types';

const ALLOWED_MIME: ReadonlySet<AllowedMime> = new Set<AllowedMime>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MIME_TO_EXT: Readonly<Record<AllowedMime, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/** 클라이언트 PUT 시 5MB까지 (압축 후 1MB 권장이지만 안전마진 포함). */
export const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Presigned URL 유효 시간 (초). 10분. */
export const PRESIGN_EXPIRES_IN_SECONDS = 600 as const;

/** uid 검증 정규식 — Firebase Auth UID + NextAuth subject 모두 만족. */
const UID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

/**
 * Presigned PUT URL 발급.
 *
 * @throws Error 입력 검증 실패 또는 AWS SDK 실패
 */
export async function createPresignedUploadUrl(
  input: PresignRequestInput,
): Promise<PresignResult> {
  if (!ALLOWED_MIME.has(input.contentType)) {
    throw new Error(`UNSUPPORTED_TYPE: ${input.contentType}`);
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new Error(`INVALID_SIZE: ${input.sizeBytes}`);
  }
  if (input.sizeBytes > MAX_SIZE_BYTES) {
    throw new Error(`SIZE_EXCEEDED: ${input.sizeBytes}`);
  }
  if (!UID_PATTERN.test(input.uid)) {
    throw new Error('INVALID_UID');
  }

  const ext = MIME_TO_EXT[input.contentType];
  const now = new Date();
  const yyyymmdd =
    `${now.getUTCFullYear()}` +
    `${String(now.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(now.getUTCDate()).padStart(2, '0')}`;
  const id = ulidLite();
  const objectKey = `${input.kind}/${input.uid}/${yyyymmdd}/${id}.${ext}`;

  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: objectKey,
    ContentType: input.contentType,
    ServerSideEncryption: 'AES256',
    Metadata: {
      uid: input.uid,
      kind: input.kind,
      ...(input.channelId ? { channelid: input.channelId } : {}),
    },
  });
  const presignedUrl = await getSignedUrl(client, command, {
    expiresIn: PRESIGN_EXPIRES_IN_SECONDS,
  });

  const cdnUrl = `${getCdnBaseUrl()}/${objectKey}`;

  return {
    presignedUrl,
    cdnUrl,
    objectKey,
    expiresInSeconds: PRESIGN_EXPIRES_IN_SECONDS,
    headers: { 'Content-Type': input.contentType },
  };
}

/**
 * 시간 정렬 가능한 26자 식별자 (ULID lite).
 * 외부 라이브러리 회피를 위해 timestamp(36) + random(16hex).
 */
function ulidLite(): string {
  const ts = Date.now().toString(36).padStart(10, '0');
  const rand = crypto.randomBytes(8).toString('hex');
  return `${ts}${rand}`;
}
