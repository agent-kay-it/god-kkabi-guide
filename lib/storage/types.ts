/**
 * Sprint 11 Phase B — Storage 도메인 공통 타입.
 * 출처: docs/sprint/11-sprint-images/design.md §4.2
 *
 * 본 모듈은 Pure (server/client 양쪽에서 import 가능).
 */

/** 업로드 이미지의 용도. */
export type ImageKind = 'post' | 'chat';

/** S3에 허용되는 MIME 화이트리스트. */
export type AllowedMime =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif';

/** Presigned URL 발급 요청 입력. */
export interface PresignRequestInput {
  readonly kind: ImageKind;
  readonly uid: string;
  readonly contentType: AllowedMime;
  readonly sizeBytes: number;
  readonly channelId?: string;
}

/** Presigned URL 발급 결과. */
export interface PresignResult {
  readonly presignedUrl: string;
  readonly cdnUrl: string;
  readonly objectKey: string;
  readonly expiresInSeconds: 600;
  readonly headers: Readonly<{
    'Content-Type': AllowedMime;
  }>;
}

/** 업로드 실패 코드 (UI 토스트와 1:1 매핑). */
export type UploadError =
  | 'UNSUPPORTED_TYPE'
  | 'TOO_LARGE_BEFORE_COMPRESS'
  | 'COMPRESS_FAILED'
  | 'PRESIGN_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHENTICATED'
  | 'NOT_REGISTERED'
  | 'CHANNEL_FORBIDDEN'
  | 'S3_PUT_FAILED';

/** 업로드 결과 — discriminated union. */
export type UploadResult<TOk extends object = { url: string }> =
  | ({ readonly ok: true } & TOk)
  | { readonly ok: false; readonly error: UploadError; readonly message?: string };
