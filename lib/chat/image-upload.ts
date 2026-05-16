/**
 * 채팅 이미지 업로드 — Firebase Storage + 1MB 자동 압축.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §6 (G3 image policy 1MB)
 *
 * 흐름:
 *  1. browser-image-compression으로 클라이언트에서 1MB 미만으로 압축
 *  2. JPG/PNG/WebP만 허용 (MIME 화이트리스트)
 *  3. Firebase Storage chat/{channelId}/{uid}/{timestamp}.{ext}에 업로드
 *  4. 다운로드 URL 반환 (RTDB 메시지 페이로드의 imageUrl)
 *
 * Storage rules (P3.D.4 firebase-rules.md 참조):
 *  - 인증 + registered=true 사용자만 write
 *  - 본인 폴더만 write 가능 (uid 기반)
 *  - 1MB 제한 + MIME 검증
 */
'use client';

import imageCompression from 'browser-image-compression';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { getFirebaseApp } from '@/lib/firebase/client';

const MAX_SIZE_MB = 1;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadImageInput {
  readonly file: File;
  readonly channelId: string;
  readonly uid: string;
}

export type UploadImageResult =
  | { ok: true; url: string }
  | {
      ok: false;
      error: 'UNSUPPORTED_TYPE' | 'TOO_LARGE_BEFORE_COMPRESS' | 'COMPRESS_FAILED' | 'UPLOAD_FAILED';
      message?: string;
    };

const MAX_RAW_SIZE_BYTES = 10 * 1024 * 1024; // 10MB raw 한도 — 압축 비용 보호

export async function uploadChatImage(input: UploadImageInput): Promise<UploadImageResult> {
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
      maxWidthOrHeight: 1600,
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
    const ext = compressed.type === 'image/png' ? 'png' : compressed.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `chat/${input.channelId}/${input.uid}/${Date.now()}.${ext}`;
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
