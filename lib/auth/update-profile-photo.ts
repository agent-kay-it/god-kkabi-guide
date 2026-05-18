/**
 * 프로필 사진 URL 갱신 Server Action.
 * 출처: docs/sprint/11-sprint-images/design.md §4 + Sprint 11 Phase E 추가 요구
 *
 * Sprint 11 Phase E:
 *  - 사용자가 직접 업로드한 아바타 URL을 Firestore users/{uid}.customPhotoURL에 저장
 *  - Google OAuth `photoURL`은 그대로 유지 (Google 동기화 데이터 보존)
 *  - 표시 우선순위: customPhotoURL > photoURL > AvatarFallback
 *  - 업로드 자체는 lib/storage/upload-profile-image.ts가 처리 — 본 Action은 URL 등록만
 *
 * 보안:
 *  - 입력 URL은 CDN 도메인 화이트리스트 검증 (cdn(-staging)?.kkaebizigi.com)
 *  - 다른 도메인은 거부 (SSRF/저장공간 외부 의존성 방지)
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';

const CDN_URL_RE = /^https:\/\/cdn(-staging)?\.kkaebizigi\.com\/profiles\//;

const PhotoSchema = z.object({
  photoUrl: z
    .string()
    .url()
    .regex(CDN_URL_RE, '프로필 사진 URL은 kkaebizigi CDN의 profiles/ 경로만 허용'),
});

export type UpdateProfilePhotoResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'VALIDATION_FAILED'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INTERNAL';
      message?: string;
    };

/**
 * 사용자가 새로 업로드한 프로필 사진 URL을 Firestore에 등록.
 * customPhotoURL을 null로 보내면 사용자 정의 사진 제거(Google photoURL로 회귀).
 */
export async function updateProfilePhoto(
  raw: { photoUrl: string | null },
): Promise<UpdateProfilePhotoResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!session.user?.registered) return { ok: false, error: 'NOT_REGISTERED' };

  if (!hasAdminCredentials()) {
    return {
      ok: false,
      error: 'ADMIN_NOT_CONFIGURED',
      message: 'FIREBASE_SERVICE_ACCOUNT_JSON 환경변수 설정 후 재시도',
    };
  }

  if (raw.photoUrl !== null) {
    const parsed = PhotoSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: 'VALIDATION_FAILED',
        message: parsed.error.issues[0]?.message ?? '유효하지 않은 사진 URL',
      };
    }
  }

  try {
    const db = getAdminFirestore();
    await db.collection('users').doc(uid).set(
      {
        customPhotoURL: raw.photoUrl ?? FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
