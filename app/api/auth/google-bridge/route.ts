/**
 * Google sign-in → Firebase Custom Token bridge endpoint.
 * 출처: docs/sprint/10-sprint-launch/design.md §2 (Auth flow v3)
 *      + docs/sprint/10-sprint-launch/plan.md §2.B.3
 *
 * 호출 흐름:
 *  - 클라이언트가 NextAuth Google 로그인 완료 후 본 endpoint를 POST 호출
 *  - 서버에서 NextAuth session 검증 후 Firebase Admin createCustomToken(uid)
 *  - 클라이언트가 받은 token으로 Firebase Auth signInWithCustomToken 호출
 *  - 이후 Firestore/RTDB/Storage SDK가 동일 uid로 인증된 상태로 동작
 *
 * 보안:
 *  - NextAuth 세션 (Google provider)이 있어야 호출 가능 — uid 위조 방지
 *  - 발급된 custom token은 1시간 유효 (Firebase 기본)
 *  - custom claims (role / registered / serverId / munpaId)은 setUserClaims 별도 흐름 (lib/auth/register.ts)
 *
 * 환경변수: FIREBASE_SERVICE_ACCOUNT_JSON (Admin SDK 자격증명)
 */
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/auth';
import {
  createFirebaseCustomToken,
  hasAdminCredentials,
} from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'UNAUTHENTICATED' },
      { status: 401 },
    );
  }

  if (!hasAdminCredentials()) {
    return NextResponse.json(
      {
        error: 'ADMIN_NOT_CONFIGURED',
        hint: 'FIREBASE_SERVICE_ACCOUNT_JSON 누락. Vercel env에 추가 또는 tene set 실행.',
      },
      { status: 503 },
    );
  }

  try {
    const customToken = await createFirebaseCustomToken(session.user.id, {
      // 최소 claims만 — 상세 claims (role/registered/serverId/munpaId)은
      // setUserClaimsWithRetry로 별도 sync (lib/firebase/claims-retry-queue.ts)
      provider: session.user.provider ?? 'google',
    });
    return NextResponse.json({
      customToken,
      uid: session.user.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN';
    return NextResponse.json(
      { error: 'CUSTOM_TOKEN_FAILED', detail: message },
      { status: 500 },
    );
  }
}
