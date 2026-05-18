/**
 * Sprint 11 Phase E — 프로필 아바타 업로드 클라이언트 헬퍼.
 * 출처: docs/sprint/11-sprint-images/design.md §4.6 (post 변형)
 *
 * post/chat 흐름과 동일하되 압축 maxWidthOrHeight=512 (아바타에 적정).
 * GIF는 원본 유지 (애니메이션 보존).
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

const MAX_RAW = 5 * 1024 * 1024;

export interface UploadProfileImageInput {
  readonly file: File;
  readonly onProgress?: (pct: number) => void;
}

interface PresignResponse {
  readonly presignedUrl: string;
  readonly cdnUrl: string;
}

export async function uploadProfileImage(
  input: UploadProfileImageInput,
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
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
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
        kind: 'profiles',
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
    default:
      return code
        ? { ok: false, error: 'PRESIGN_FAILED', message: code }
        : { ok: false, error: 'PRESIGN_FAILED' };
  }
}
