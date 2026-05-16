/**
 * Kakao Custom Token Bridge — server-only.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §5 (Kakao Custom Token Bridge)
 *
 * 흐름:
 *  1. 사용자 → /api/auth/signin/kakao → Kakao 인증 페이지
 *  2. Kakao → /api/auth/callback/kakao → NextAuth가 Kakao access_token 수령
 *  3. NextAuth Session 생성 (JWT strategy)
 *  4. Client에서 useSession() → registered=false 확인 → /register 폼
 *  5. 등록 폼 완료 시 본 모듈의 issueFirebaseTokenForKakao() 호출 → Firebase signInWithCustomToken
 *
 * Kakao OAuth와 Firebase Auth의 incompatibility를 Firebase Admin SDK createCustomToken으로 해결.
 *
 * 보안:
 *  - Kakao access_token은 서버에서만 검증, client로 노출 금지
 *  - Custom Token은 1회용 (10분 만료) — 클라이언트가 signInWithCustomToken 후 즉시 폐기
 */
import 'server-only';

import { createFirebaseCustomToken } from '@/lib/firebase/admin';

interface KakaoUserInfoResponse {
  readonly id: number;
  readonly properties?: {
    readonly nickname?: string;
    readonly profile_image?: string;
  };
  readonly kakao_account?: {
    readonly email?: string;
    readonly is_email_verified?: boolean;
    readonly profile?: {
      readonly nickname?: string;
      readonly profile_image_url?: string;
    };
  };
}

export interface KakaoExchangeResult {
  readonly customToken: string;
  readonly uid: string;
  readonly profile: {
    readonly kakaoId: string;
    readonly nickname: string;
    readonly email: string | null;
    readonly profileImage: string | null;
    readonly emailVerified: boolean;
  };
}

/**
 * Kakao access_token으로 사용자 정보 조회 후 Firebase Custom Token 발급.
 *
 * @param accessToken Kakao OAuth access_token (NextAuth account.access_token)
 * @returns Firebase signInWithCustomToken에 전달할 token + 사용자 프로필
 * @throws Kakao API 4xx/5xx 또는 Admin SDK 실패 시
 */
export async function issueFirebaseTokenForKakao(
  accessToken: string,
): Promise<KakaoExchangeResult> {
  if (!accessToken) {
    throw new Error('Kakao access_token 누락');
  }

  // 1) Kakao kapi에서 사용자 정보 조회
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    // Kakao API는 5s 안에 응답해야 함 (UX 보호)
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '<empty>');
    throw new Error(`Kakao kapi /v2/user/me 실패 (status=${response.status}): ${text}`);
  }

  const data = (await response.json()) as KakaoUserInfoResponse;

  if (!data.id) {
    throw new Error('Kakao 응답에 id 누락 (scope 미허용 가능성)');
  }

  const kakaoId = String(data.id);
  const uid = `kakao:${kakaoId}`;

  const nickname =
    data.properties?.nickname ??
    data.kakao_account?.profile?.nickname ??
    '';
  const email = data.kakao_account?.email ?? null;
  const profileImage =
    data.properties?.profile_image ??
    data.kakao_account?.profile?.profile_image_url ??
    null;
  const emailVerified = Boolean(data.kakao_account?.is_email_verified);

  // 2) Firebase Custom Token 발급 (provider 정보를 claims에 기록)
  const customToken = await createFirebaseCustomToken(uid, {
    provider: 'kakao',
    kakaoId,
    nickname,
  });

  return {
    customToken,
    uid,
    profile: {
      kakaoId,
      nickname,
      email,
      profileImage,
      emailVerified,
    },
  };
}
