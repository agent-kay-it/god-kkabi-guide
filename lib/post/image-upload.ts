/**
 * 게시물 이미지 업로드 — Firebase Storage + 1MB 자동 압축.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1 (post images)
 *      + Sprint v2 lib/chat/image-upload.ts 패턴 재사용
 *
 * 흐름:
 *  1. browser-image-compression으로 클라이언트에서 1MB 미만으로 압축
 *  2. JPG/PNG/WebP만 허용 (MIME 화이트리스트)
 *  3. Firebase Storage `posts/{uid}/{timestamp}-{idx}.{ext}`에 업로드
 *  4. 다운로드 URL 반환 (PostDoc.imageUrls 페이로드)
 *
 * Storage rules:
 *  - 인증 + registered=true 사용자만 write
 *  - 본인 폴더만 write 가능 (uid 기반)
 *  - 1MB 제한 + MIME 검증
 */
'use client';

import imageCompression from 'browser-image-compression';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { getFirebaseApp } from '@/lib/firebase/client';

const MAX_SIZE_MB = 1;
const MAX_RAW_SIZE_BYTES = 10 * 1024 * 1024; // 10MB raw 한도
const MAX_WIDTH_OR_HEIGHT = 1920;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadPostImageInput {
  readonly file: File;
  readonly uid: string;
  /** 같은 게시물 내 인덱스 (0-2) — 파일명 분리용 */
  readonly index: number;
}

export type UploadPostImageResult =
  | { ok: true; url: string }
  | {
      ok: false;
      error:
        | 'UNSUPPORTED_TYPE'
        | 'TOO_LARGE_BEFORE_COMPRESS'
        | 'COMPRESS_FAILED'
        | 'UPLOAD_FAILED';
      message?: string;
    };

export async function uploadPostImage(
  input: UploadPostImageInput,
): Promise<UploadPostImageResult> {
  if (!ALLOWED_MIME.has(input.file.type)) {
    return { ok: false, error: 'UNSUPPORTED_TYPE' };
  }
  if (input.file.size > MAX_RAW_SIZE_BYTES) {
    return { ok: false, error: 'TOO_LARGE_BEFORE_COMPRESS' };
  }

  let compressed: File;
  try {
    compressed = await imageCompression(input.file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      fileType: input.file.type as 'image/jpeg' | 'image/png' | 'image/webp',
    });
  } catch (err) {
    return {
      ok: false,
      error: 'COMPRESS_FAILED',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }

  try {
    const storage = getStorage(getFirebaseApp());
    const ext =
      compressed.type === 'image/png'
        ? 'png'
        : compressed.type === 'image/webp'
          ? 'webp'
          : 'jpg';
    const path = `posts/${input.uid}/${Date.now()}-${input.index}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressed, { contentType: compressed.type });
    const url = await getDownloadURL(storageRef);
    return { ok: true, url };
  } catch (err) {
    return {
      ok: false,
      error: 'UPLOAD_FAILED',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
