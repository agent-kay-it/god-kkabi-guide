/**
 * E2E Bridge — Sprint 28 / F28-B.
 *
 * 목적: Playwright E2E 가 OAuth UI 우회하고 NextAuth session 으로 직접 로그인.
 *
 * 이전 패턴 (Sprint 14, broken 1주일):
 *   page.evaluate(async () => {
 *     const { signInWithCustomToken } = await import('firebase/auth');  // ❌ bare specifier fail
 *   });
 *
 * 신규 패턴:
 *   1. e2e helper 가 Admin SDK 로 Firebase custom token 발급 (admin auth-token-helper)
 *   2. emulator REST 로 ID token 교환 (별도)
 *   3. 본 endpoint 가 NextAuth JWT 직접 발급 + cookie set
 *   4. 다음 navigation 시 인증된 세션 동작
 *
 * 보안:
 *   - production / staging 에서는 즉시 404 (FIREBASE_USE_EMULATOR=true 필수)
 *   - AUTH_SECRET 으로 서명되므로 secret 모르면 위조 불가
 *   - body validation (uid + claims 형식)
 *   - cookie name 은 NextAuth v5 표준 (authjs.session-token / __Secure-authjs.session-token)
 */
import 'server-only';

import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';

interface E2eBridgeBody {
  readonly uid: string;
  readonly claims?: {
    readonly role?: 'admin' | 'user' | 'banned';
    readonly registered?: boolean;
    readonly nickname?: string;
    readonly serverId?: string;
    readonly munpa?: string;
    readonly munpaId?: string;
    readonly classId?: string;
    readonly tier?: 'free' | 'premium';
  };
}

/**
 * E2E / emulator 환경에서만 사용 가능 (production 영향 0).
 *  - NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true (build-time)
 *  - 또는 FIREBASE_USE_EMULATOR=true (runtime)
 *  - 또는 NODE_ENV=test
 */
function isE2eEnvironment(): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  if (process.env.FIREBASE_USE_EMULATOR === 'true') return true;
  if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true') return true;
  return false;
}

export async function POST(req: Request): Promise<NextResponse> {
  // production 등 비-E2E 환경에서는 404 (endpoint 자체 존재 X)
  if (!isE2eEnvironment()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  let body: E2eBridgeBody;
  try {
    body = (await req.json()) as E2eBridgeBody;
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  // 입력 validation — uid 는 영문 숫자 hyphen underscore 만, 최대 64자
  if (
    typeof body.uid !== 'string' ||
    body.uid.length === 0 ||
    body.uid.length > 64 ||
    !/^[A-Za-z0-9_-]+$/.test(body.uid)
  ) {
    return NextResponse.json({ error: 'INVALID_UID' }, { status: 400 });
  }

  // Sprint 28 F28-B — `||` 사용 (`??` 는 empty string fall-through 안 함)
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'e2e-test-secret-do-not-use-in-production';

  const claims = body.claims ?? {};
  const role = claims.role ?? 'user';
  if (role !== 'admin' && role !== 'user' && role !== 'banned') {
    return NextResponse.json({ error: 'INVALID_ROLE' }, { status: 400 });
  }

  // NextAuth v5 cookie 이름 규칙:
  //   - http (dev): 'authjs.session-token'
  //   - https (prod/preview): '__Secure-authjs.session-token'
  // E2E 는 localhost http 이므로 unprefixed.
  const cookieName = 'authjs.session-token';
  const isSecureCookie = false;

  const tokenPayload: Record<string, unknown> = {
    sub: body.uid,
    role,
    registered: claims.registered ?? true,
  };
  if (claims.nickname !== undefined) tokenPayload.nickname = claims.nickname;
  if (claims.serverId !== undefined) tokenPayload.serverId = claims.serverId;
  if (claims.munpa !== undefined) tokenPayload.munpa = claims.munpa;
  if (claims.munpaId !== undefined) tokenPayload.munpaId = claims.munpaId;
  if (claims.classId !== undefined) tokenPayload.classId = claims.classId;
  if (claims.tier !== undefined) tokenPayload.tier = claims.tier;

  const jwt = await encode({
    token: tokenPayload,
    secret,
    salt: cookieName,
    maxAge: 30 * 24 * 60 * 60,
  });

  const res = NextResponse.json({ ok: true, cookieName });
  res.cookies.set(cookieName, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookie,
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
