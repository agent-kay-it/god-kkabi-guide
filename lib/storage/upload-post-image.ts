/**
 * Sprint 11 Phase B — 게시글 이미지 업로드 클라이언트 헬퍼.
 * 출처: docs/sprint/11-sprint-images/design.md §4.6
 *
 * 흐름: compress → /api/storage/presign → S3 PUT.
 * 압축은 browser-image-compression(WebP 1920px, quality 0.8)로 EXIF/메타데이터를 함께 제거.
 * GIF는 압축 없이 원본 유지 (애니메이션 보존).
 */
'use client';

import imageCompression from 'browser-image-compression';

import type { AllowedMime, UploadResult } from './types';

const ALLOWED: ReadonlySet<AllowedMime> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/** 압축 전 5MB 제한 — server presign과 동일. */
const MAX_RAW = 5 * 1024 * 1024;

export interface UploadPostImageInput {
  readonly file: File;
  /** 진행률 콜백 (0~100). 압축 20%, presign 40%, PUT 100%. */
  readonly onProgress?: (pct: number) => void;
}

interface PresignResponse {
  readonly presignedUrl: string;
  readonly cdnUrl: string;
}

/**
 * 게시글 이미지 업로드 wrapper. UploadResult discriminated union을 반환하므로
 * 호출자는 `result.ok` 분기로 토스트/UI 처리.
 */
export async function uploadPostImage(
  input: UploadPostImageInput,
): Promise<UploadResult> {
  if (!ALLOWED.has(input.file.type as AllowedMime)) {
    return { ok: false, error: 'UNSUPPORTED_TYPE' };
  }
  if (input.file.size > MAX_RAW) {
    return { ok: false, error: 'TOO_LARGE_BEFORE_COMPRESS' };
  }

  let compressed: File;
  try {
    if (input.file.type === 'image/gif') {
      compressed = input.file;
    } else {
      compressed = await imageCompression(input.file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8,
      });
    }
  } catch (err) {
    return {
      ok: false,
      error: 'COMPRESS_FAILED',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
  input.onProgress?.(20);

  let presign: PresignResponse;
  try {
    const res = await fetch('/api/storage/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'posts',
        contentType: compressed.type,
        sizeBytes: compressed.size,
      }),
    });
    if (!res.ok) {
      const code = await readErrorCode(res);
      return mapPresignError(code);
    }
    presign = (await res.json()) as PresignResponse;
  } catch (err) {
    return {
      ok: false,
      error: 'PRESIGN_FAILED',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
  input.onProgress?.(40);

  try {
    const putRes = await fetch(presign.presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': compressed.type },
      body: compressed,
    });
    if (!putRes.ok) {
      return { ok: false, error: 'S3_PUT_FAILED', message: `HTTP ${putRes.status}` };
    }
  } catch (err) {
    return {
      ok: false,
      error: 'S3_PUT_FAILED',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
  input.onProgress?.(100);
  return { ok: true, url: presign.cdnUrl };
}

async function readErrorCode(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error;
  } catch {
    return undefined;
  }
}

function mapPresignError(code: string | undefined): UploadResult {
  switch (code) {
    case 'UNAUTHENTICATED':
      return { ok: false, error: 'UNAUTHENTICATED' };
    case 'NOT_REGISTERED':
    case 'BANNED':
      return { ok: false, error: 'NOT_REGISTERED' };
    case 'RATE_LIMIT_EXCEEDED':
      return { ok: false, error: 'RATE_LIMIT_EXCEEDED' };
    case 'CHANNEL_FORBIDDEN':
      return { ok: false, error: 'CHANNEL_FORBIDDEN' };
    default:
      return code
        ? { ok: false, error: 'PRESIGN_FAILED', message: code }
        : { ok: false, error: 'PRESIGN_FAILED' };
  }
}
