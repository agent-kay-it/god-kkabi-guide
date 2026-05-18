/**
 * Sprint 11 Phase C — UploadError 코드 → 한국어 사용자 메시지 매핑.
 * 출처: docs/sprint/11-sprint-images/design.md §5.1 (PostForm) + §6.3 (ChatComposer)
 *
 * PostForm + MessageComposer 양쪽에서 동일 매핑을 재사용하여 UX 일관성 보장.
 * `lib/storage/types.ts`의 UploadError 8종을 모두 커버 — 누락 시 fallback 문구 반환.
 */
import type { UploadError } from './types';

const MESSAGES: Readonly<Record<UploadError, string>> = {
  UNSUPPORTED_TYPE: 'JPG / PNG / WebP / GIF만 업로드할 수 있어요.',
  TOO_LARGE_BEFORE_COMPRESS: '파일이 너무 큽니다 (5MB 이하만 가능).',
  COMPRESS_FAILED: '이미지 압축 중 오류가 발생했어요. 다른 파일로 시도해주세요.',
  PRESIGN_FAILED: '업로드 URL 발급에 실패했어요. 잠시 후 다시 시도해주세요.',
  RATE_LIMIT_EXCEEDED: '업로드 횟수 제한을 초과했어요. 잠시 후 다시 시도해주세요.',
  UNAUTHENTICATED: '로그인 후 다시 시도해주세요.',
  NOT_REGISTERED: '가입을 마친 회원만 이미지를 업로드할 수 있어요.',
  CHANNEL_FORBIDDEN: '이 채널에는 이미지를 올릴 수 없어요.',
  S3_PUT_FAILED: '업로드가 중단됐어요. 네트워크 상태를 확인하고 다시 시도해주세요.',
};

/**
 * UploadError 코드 → 한국어 메시지.
 * 알 수 없는 코드(타입 시스템상 발생 불가하지만 런타임 안전망)는 fallback 문구 반환.
 */
export function uploadErrorMessage(error: UploadError): string {
  return MESSAGES[error] ?? '업로드에 실패했어요. 잠시 후 다시 시도해주세요.';
}
