/**
 * NextAuth.js v5 (Auth.js) — edge-compatible config (middleware에서 import).
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §3-4
 *
 * 본 모듈은 Edge runtime 호환 — Firebase Adapter / firebase-admin 같은 Node 전용 의존성 제외.
 * 풀 config (Firebase Adapter 포함)는 lib/auth/auth.ts.
 *
 * 책임:
 *  - Provider 정의 (Google + Kakao)
 *  - JWT/Session 콜백 (custom claims 노출)
 *  - 페이지 라우팅 (/login, /register)
 *  - authorized 콜백 (보호 라우트 판정 — middleware에서 사용)
 */
import type { NextAuthConfig, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Google from 'next-auth/providers/google';

interface KakaoProfile {
  readonly id: number;
  readonly properties?: {
    readonly nickname?: string;
    readonly profile_image?: string;
    readonly thumbnail_image?: string;
  };
  readonly kakao_account?: {
    readonly email?: string;
    readonly profile?: {
      readonly nickname?: string;
      readonly profile_image_url?: string;
    };
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`환경변수 ${key} 누락. tene run -- 로 주입 필요 (auth-flow.md §환경변수 참조).`);
  }
  return value;
}

function optionalEnv(key: string): string {
  // OAuth provider clientSecret이 빌드 타임에는 비어있을 수 있으므로
  // runtime 사용 시점에만 검증, 빌드 시점에는 empty string 반환.
  return process.env[key] ?? '';
}

/**
 * Kakao OAuth provider (NextAuth v5 OAuth 2.0 RFC 표준 형식).
 * Kakao 공식 문서: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
 */
function KakaoProvider() {
  return {
    id: 'kakao',
    name: 'Kakao',
    type: 'oauth' as const,
    authorization: {
      url: 'https://kauth.kakao.com/oauth/authorize',
      params: {
        scope: 'profile_nickname profile_image account_email',
      },
    },
    token: 'https://kauth.kakao.com/oauth/token',
    userinfo: 'https://kapi.kakao.com/v2/user/me',
    clientId: optionalEnv('KAKAO_CLIENT_ID'),
    clientSecret: optionalEnv('KAKAO_CLIENT_SECRET'),
    profile(profile: KakaoProfile): {
      id: string;
      name: string;
      email: string | null;
      image: string | null;
    } {
      const properties = profile.properties ?? {};
      const account = profile.kakao_account ?? {};
      return {
        id: String(profile.id),
        name: properties.nickname ?? account.profile?.nickname ?? '',
        email: account.email ?? null,
        image:
          properties.profile_image ?? account.profile?.profile_image_url ?? null,
      };
    },
  };
}

/**
 * Edge-compatible config — middleware.ts에서 사용.
 * Session / User / JWT 타입 확장은 types/next-auth.d.ts.
 * Firebase Adapter는 lib/auth/auth.ts에서 추가.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  providers: [
    Google({
      clientId: optionalEnv('GOOGLE_CLIENT_ID'),
      clientSecret: optionalEnv('GOOGLE_CLIENT_SECRET'),
    }),
    KakaoProvider(),
  ],
  callbacks: {
    /**
     * 보호 라우트 판정 (middleware 트리거).
     *  - /me/* / /admin/* → 로그인 필수
     *  - /admin/* → role=admin 필수
     *  - /register → 로그인했고 등록 안 한 사용자만
     */
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isLoggedIn = Boolean(auth?.user);
      const isRegistered = Boolean(auth?.user?.registered);
      const isAdmin = auth?.user?.role === 'admin';

      if (pathname.startsWith('/me') || pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false;
        if (pathname.startsWith('/admin') && !isAdmin) return false;
        if (!isRegistered && pathname !== '/register') {
          return Response.redirect(new URL('/register', request.nextUrl));
        }
      }

      if (pathname === '/register' && isLoggedIn && isRegistered) {
        return Response.redirect(new URL('/', request.nextUrl));
      }

      return true;
    },

    /**
     * JWT 콜백 — token에 사용자 메타 정보 누적.
     * exactOptionalPropertyTypes 준수: undefined 필드는 조건부로만 할당.
     */
    jwt({ token, user, account }) {
      if (user) {
        if (user.id !== undefined) token.sub = user.id;
        if (user.role !== undefined) token.role = user.role;
        if (user.registered !== undefined) token.registered = user.registered;
        if (user.serverId !== undefined) token.serverId = user.serverId;
        if (user.gameUid !== undefined) token.gameUid = user.gameUid;
        if (user.munpa !== undefined) token.munpa = user.munpa;
        if (user.nickname !== undefined) token.nickname = user.nickname;
        if (user.classId !== undefined) token.classId = user.classId;
      }
      if (account?.provider) {
        token.provider = account.provider;
        // Kakao Custom Token bridge용 access_token 영속화
        // (auth-flow.md §5 — /api/auth/kakao-exchange에서 사용)
        if (account.provider === 'kakao' && account.access_token) {
          token.accessToken = account.access_token;
        }
      }
      return token;
    },

    /**
     * Session 콜백 — 클라이언트 노출용 (useSession()).
     * NextAuth v5 discriminated union 회피를 위해 명시 캐스트.
     */
    session(params) {
      const session = params.session as Session;
      const token = params.token as JWT | undefined;
      if (session.user && token) {
        // Kakao access_token을 session에 노출 (서버 endpoint /api/auth/kakao-exchange에서만 사용)
        if (token.accessToken) {
          session.accessToken = token.accessToken;
        }
        session.user.id = token.sub ?? '';
        if (token.role !== undefined) session.user.role = token.role;
        if (token.registered !== undefined) session.user.registered = token.registered;
        if (token.serverId !== undefined) session.user.serverId = token.serverId;
        if (token.gameUid !== undefined) session.user.gameUid = token.gameUid;
        if (token.munpa !== undefined) session.user.munpa = token.munpa;
        if (token.nickname !== undefined) session.user.nickname = token.nickname;
        if (token.classId !== undefined) session.user.classId = token.classId;
        // Sprint V1: AdSense 동의 (PIPA 5번째)
        if (token.advertisingConsent !== undefined) {
          session.user.advertisingConsent = token.advertisingConsent;
        }
        // Sprint V2: 프리미엄 구독 등급
        if (token.tier === 'free' || token.tier === 'premium') {
          session.user.tier = token.tier;
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  trustHost: true,
};

export { requireEnv };
