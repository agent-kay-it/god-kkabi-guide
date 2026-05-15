/**
 * Kakao → Firebase Custom Token 교환 endpoint.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §5
 *
 * 호출 흐름:
 *  - 클라이언트가 NextAuth Kakao 로그인 완료 후 본 endpoint를 POST 호출
 *  - 서버에서 Kakao access_token → Firebase Custom Token 변환
 *  - 클라이언트가 Custom Token으로 Firebase Auth signInWithCustomToken 호출
 *
 * 보안:
 *  - NextAuth 세션 (Kakao provider)이 있어야 호출 가능
 *  - access_token은 cookie/JWT에 저장되어 있고 본 endpoint가 서버에서 추출
 *  - rate limit는 향후 Vercel Edge Config / Upstash로 추가 예정
 */
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/auth';
import { issueFirebaseTokenForKakao } from '@/lib/auth/kakao';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  // NextAuth는 account.access_token을 JWT에 저장하지 않음 (기본).
  // Kakao provider의 access_token을 사용하려면 jwt 콜백에서 token.accessToken으로 저장 필요.
  // 본 구현에서는 클라이언트가 Kakao 로그인 직후 access_token을 함께 전달하는 변형도 가능 (현재 미사용).
  // 운영자 단계에서 access_token 영속성 정책 결정 게이트 — auth-flow.md §환경변수.
  const accessToken = (session as unknown as { accessToken?: string }).accessToken;

  if (!accessToken) {
    return NextResponse.json(
      {
        error: 'KAKAO_ACCESS_TOKEN_MISSING',
        hint: 'authConfig.callbacks.jwt에서 token.accessToken = account.access_token 저장 필요 (P3.A.4 게이트)',
      },
      { status: 400 },
    );
  }

  try {
    const result = await issueFirebaseTokenForKakao(accessToken);
    return NextResponse.json({
      customToken: result.customToken,
      uid: result.uid,
      profile: result.profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    return NextResponse.json(
      { error: 'KAKAO_EXCHANGE_FAILED', detail: message },
      { status: 500 },
    );
  }
}
