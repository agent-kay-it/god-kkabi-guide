/**
 * lib/auth/config.ts — Sprint 25 F25-A 단위 테스트.
 * Edge-compat config: requireEnv + authorized/jwt/session 콜백.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn((opts: unknown) => ({ id: 'google', name: 'Google', options: opts })),
}));

import { authConfig, requireEnv } from './config';

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('requireEnv', () => {
  it('값이 있으면 그대로 반환', () => {
    vi.stubEnv('TEST_ENV_ABC', 'hello');
    expect(requireEnv('TEST_ENV_ABC')).toBe('hello');
  });

  it('미설정 시 throw', () => {
    vi.stubEnv('TEST_ENV_MISSING', '');
    expect(() => requireEnv('TEST_ENV_MISSING')).toThrow(/누락/);
  });
});

describe('authConfig.providers', () => {
  it('Google provider 1개 등록', () => {
    expect(authConfig.providers).toHaveLength(1);
  });
});

describe('authConfig.callbacks.authorized', () => {
  // NOTE: NextAuthConfig.callbacks.authorized 시그니처는 매우 좁음.
  //       타입 안전을 위해 helper로 호출.
  type AuthArg = Parameters<NonNullable<NonNullable<typeof authConfig.callbacks>['authorized']>>[0];
  const callAuthorized = (arg: AuthArg) =>
    authConfig.callbacks!.authorized!(arg);

  function buildArg(pathname: string, user?: Partial<Session['user']> | null): AuthArg {
    return {
      auth: user ? ({ user } as never) : null,
      request: {
        nextUrl: {
          pathname,
          // Response.redirect 가 URL 객체를 요구하므로 origin 채움
          toString: () => `https://test.local${pathname}`,
        } as never,
      } as never,
    } as AuthArg;
  }

  it('public 라우트 — 로그인 안 한 사용자도 true', () => {
    expect(callAuthorized(buildArg('/', null))).toBe(true);
    expect(callAuthorized(buildArg('/wiki', null))).toBe(true);
  });

  it('/me — 로그인 안 함 → false', () => {
    expect(callAuthorized(buildArg('/me', null))).toBe(false);
  });

  it('/me — 로그인 + 등록 → true', () => {
    expect(
      callAuthorized(
        buildArg('/me', { id: 'u1', registered: true, role: 'user' }),
      ),
    ).toBe(true);
  });

  it('/me — 로그인 + 미등록 → /register 로 redirect (Response)', () => {
    // jsdom 없는 node 환경에서도 Response.redirect 가능
    vi.stubGlobal('URL', URL);
    // request.nextUrl 객체에 URL 메서드가 필요하므로 보완
    const result = authConfig.callbacks!.authorized!({
      auth: { user: { id: 'u1', registered: false } } as never,
      request: {
        nextUrl: new URL('https://test.local/me'),
      } as never,
    } as Parameters<NonNullable<NonNullable<typeof authConfig.callbacks>['authorized']>>[0]);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toContain('/register');
  });

  it('/admin — admin 이 아니면 false', () => {
    expect(
      callAuthorized(
        buildArg('/admin/dashboard', { id: 'u1', registered: true, role: 'user' }),
      ),
    ).toBe(false);
  });

  it('/admin — admin 인 경우 true', () => {
    expect(
      callAuthorized(
        buildArg('/admin/dashboard', { id: 'u1', registered: true, role: 'admin' }),
      ),
    ).toBe(true);
  });

  it('/chat — 로그인 + 등록 → true', () => {
    expect(
      callAuthorized(
        buildArg('/chat', { id: 'u1', registered: true, role: 'user' }),
      ),
    ).toBe(true);
  });

  it('/register — 이미 등록된 사용자 → 홈으로 redirect', () => {
    const result = authConfig.callbacks!.authorized!({
      auth: { user: { id: 'u1', registered: true, role: 'user' } } as never,
      request: {
        nextUrl: new URL('https://test.local/register'),
      } as never,
    } as Parameters<NonNullable<NonNullable<typeof authConfig.callbacks>['authorized']>>[0]);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toContain('/');
  });

  it('/register — 미등록 사용자 → true', () => {
    expect(
      callAuthorized(
        buildArg('/register', { id: 'u1', registered: false }),
      ),
    ).toBe(true);
  });
});

describe('authConfig.callbacks.jwt', () => {
  it('user 의 모든 필드 token 에 매핑', () => {
    const token: JWT = {};
    const result = authConfig.callbacks!.jwt!({
      token,
      user: {
        id: 'u1',
        role: 'admin',
        registered: true,
        serverId: 'S1',
        gameUid: 'G1',
        munpa: 'munpa-a',
        munpaId: 'S1_munpa-a',
        nickname: '깨비',
        classId: 'warrior',
        name: '깨비',
        email: 'kay@x.com',
      } as never,
      account: { provider: 'google', providerAccountId: 'g1', type: 'oauth' } as never,
    } as never);

    expect((result as JWT).sub).toBe('u1');
    expect((result as JWT).role).toBe('admin');
    expect((result as JWT).registered).toBe(true);
    expect((result as JWT).serverId).toBe('S1');
    expect((result as JWT).gameUid).toBe('G1');
    expect((result as JWT).munpa).toBe('munpa-a');
    expect((result as JWT).munpaId).toBe('S1_munpa-a');
    expect((result as JWT).nickname).toBe('깨비');
    expect((result as JWT).classId).toBe('warrior');
    expect((result as JWT).provider).toBe('google');
  });

  it('user 없으면 기존 token 유지 (refresh 흐름)', () => {
    const token: JWT = { sub: 'existing', role: 'user' };
    const result = authConfig.callbacks!.jwt!({
      token,
      user: undefined as never,
      account: null as never,
    } as never);
    expect((result as JWT).sub).toBe('existing');
    expect((result as JWT).role).toBe('user');
  });

  it('user.id 가 undefined 면 token.sub 미할당', () => {
    const token: JWT = { sub: 'before' };
    authConfig.callbacks!.jwt!({
      token,
      user: { id: undefined } as never,
      account: null as never,
    } as never);
    expect(token.sub).toBe('before');
  });
});

describe('authConfig.callbacks.session', () => {
  it('token 의 모든 필드 session.user 에 매핑', () => {
    const session = {
      user: {},
      expires: '2099-01-01',
    } as Session;
    const token: JWT = {
      sub: 'u1',
      role: 'admin',
      registered: true,
      serverId: 'S1',
      gameUid: 'G1',
      munpa: 'munpa-a',
      munpaId: 'S1_munpa-a',
      nickname: '깨비',
      classId: 'warrior',
      advertisingConsent: true,
      tier: 'premium',
    };
    const result = authConfig.callbacks!.session!({
      session,
      token,
    } as never) as Session;
    expect(result.user!.id).toBe('u1');
    expect(result.user!.role).toBe('admin');
    expect(result.user!.registered).toBe(true);
    expect(result.user!.serverId).toBe('S1');
    expect(result.user!.gameUid).toBe('G1');
    expect(result.user!.munpa).toBe('munpa-a');
    expect(result.user!.munpaId).toBe('S1_munpa-a');
    expect(result.user!.nickname).toBe('깨비');
    expect(result.user!.classId).toBe('warrior');
    expect(result.user!.advertisingConsent).toBe(true);
    expect(result.user!.tier).toBe('premium');
  });

  it('token.sub 가 undefined 면 session.user.id = ""', () => {
    const session = { user: {}, expires: '2099-01-01' } as Session;
    const result = authConfig.callbacks!.session!({
      session,
      token: {} as JWT,
    } as never) as Session;
    expect(result.user!.id).toBe('');
  });

  it('token.tier=free 도 정상 매핑', () => {
    const session = { user: {}, expires: '2099-01-01' } as Session;
    const result = authConfig.callbacks!.session!({
      session,
      token: { sub: 'u1', tier: 'free' } as JWT,
    } as never) as Session;
    expect(result.user!.tier).toBe('free');
  });

  it('token 없으면 session 그대로 반환', () => {
    const session = { user: { id: 'pre' }, expires: '2099-01-01' } as Session;
    const result = authConfig.callbacks!.session!({
      session,
      token: undefined as never,
    } as never) as Session;
    // user.id 는 pre 그대로 유지
    expect(result.user!.id).toBe('pre');
  });
});

describe('authConfig.session', () => {
  it('strategy=jwt, maxAge 30일', () => {
    expect(authConfig.session?.strategy).toBe('jwt');
    expect(authConfig.session?.maxAge).toBe(60 * 60 * 24 * 30);
  });

  it('trustHost=true', () => {
    expect(authConfig.trustHost).toBe(true);
  });

  it('pages 설정', () => {
    expect(authConfig.pages?.signIn).toBe('/login');
    expect(authConfig.pages?.newUser).toBe('/register');
  });
});
