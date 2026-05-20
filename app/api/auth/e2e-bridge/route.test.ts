/**
 * app/api/auth/e2e-bridge/route.ts — Sprint 28 F28-B 단위 테스트.
 *
 * 검증 범위:
 *  - production / staging (emulator off, NODE_ENV != test) 에서 404
 *  - E2E / emulator 환경에서 정상 JWT 발급 + cookie set
 *  - 입력 validation (uid format / role / JSON parse)
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEncode = vi.fn(() => Promise.resolve('mock-jwt-token'));

vi.mock('next-auth/jwt', () => ({
  encode: (...args: unknown[]) =>
    (mockEncode as unknown as (...a: unknown[]) => unknown)(...args),
}));

import { POST } from './route';

function makeReq(body: unknown): Request {
  return new Request('http://localhost:3000/api/auth/e2e-bridge', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  mockEncode.mockClear();
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('E2E Bridge security — production / staging 차단', () => {
  it('NODE_ENV=production + FIREBASE_USE_EMULATOR 없음 → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('FIREBASE_USE_EMULATOR', '');
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_USE_EMULATOR', '');
    const res = await POST(makeReq({ uid: 'e2e-regular' }));
    expect(res.status).toBe(404);
  });

  it('staging 시뮬 (NODE_ENV=production + emulator off) → 404 + encode 미호출', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'false');
    const res = await POST(makeReq({ uid: 'e2e-regular' }));
    expect(res.status).toBe(404);
    expect(mockEncode).not.toHaveBeenCalled();
  });
});

describe('E2E Bridge — E2E 환경 정상 동작', () => {
  beforeEach(() => {
    // E2E / emulator 환경 simulate
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
    vi.stubEnv('AUTH_SECRET', 'test-secret');
  });

  it('happy: uid 만 — 기본 role=user, registered=true → JWT cookie set', async () => {
    const res = await POST(makeReq({ uid: 'e2e-regular' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; cookieName: string };
    expect(body.ok).toBe(true);
    expect(body.cookieName).toBe('authjs.session-token');
    // Set-Cookie 헤더 검증
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('authjs.session-token=mock-jwt-token');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie.toLowerCase()).toContain('samesite=lax');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).not.toContain('Secure'); // localhost http
  });

  it('happy: 모든 claims 전달 → encode token payload 에 포함', async () => {
    await POST(
      makeReq({
        uid: 'e2e-admin',
        claims: {
          role: 'admin',
          registered: true,
          nickname: 'kay',
          serverId: 'S1',
          munpa: 'munpa-a',
          munpaId: 'S1_munpa-a',
          classId: 'warrior',
          tier: 'premium',
        },
      }),
    );
    const encodeArg = (mockEncode.mock.calls[0] as unknown as unknown[])[0] as {
      token: Record<string, unknown>;
      salt: string;
      secret: string;
      maxAge: number;
    };
    expect(encodeArg.token).toMatchObject({
      sub: 'e2e-admin',
      role: 'admin',
      registered: true,
      nickname: 'kay',
      serverId: 'S1',
      munpa: 'munpa-a',
      munpaId: 'S1_munpa-a',
      classId: 'warrior',
      tier: 'premium',
    });
    expect(encodeArg.salt).toBe('authjs.session-token');
    expect(encodeArg.secret).toBe('test-secret');
    expect(encodeArg.maxAge).toBe(30 * 24 * 60 * 60);
  });

  it('default role=user 적용', async () => {
    await POST(makeReq({ uid: 'e2e-new' }));
    const encodeArg = (mockEncode.mock.calls[0] as unknown as unknown[])[0] as { token: Record<string, unknown> };
    expect(encodeArg.token.role).toBe('user');
    expect(encodeArg.token.registered).toBe(true);
  });

  it('role=banned 정상 처리', async () => {
    const res = await POST(makeReq({ uid: 'e2e-banned', claims: { role: 'banned' } }));
    expect(res.status).toBe(200);
    const encodeArg = (mockEncode.mock.calls[0] as unknown as unknown[])[0] as { token: Record<string, unknown> };
    expect(encodeArg.token.role).toBe('banned');
  });

  it('AUTH_SECRET 없으면 fallback secret 사용', async () => {
    vi.stubEnv('AUTH_SECRET', '');
    vi.stubEnv('NEXTAUTH_SECRET', '');
    await POST(makeReq({ uid: 'e2e-regular' }));
    const encodeArg = (mockEncode.mock.calls[0] as unknown as unknown[])[0] as { secret: string };
    expect(encodeArg.secret).toContain('e2e-test-secret');
  });

  it('NEXTAUTH_SECRET 도 인식 (NextAuth v5 호환)', async () => {
    vi.stubEnv('AUTH_SECRET', '');
    vi.stubEnv('NEXTAUTH_SECRET', 'nextauth-secret');
    await POST(makeReq({ uid: 'e2e-regular' }));
    const encodeArg = (mockEncode.mock.calls[0] as unknown as unknown[])[0] as { secret: string };
    expect(encodeArg.secret).toBe('nextauth-secret');
  });

  it('NODE_ENV=test 단독 — emulator off 여도 OK (단위 테스트 호환)', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('FIREBASE_USE_EMULATOR', '');
    const res = await POST(makeReq({ uid: 'e2e-regular' }));
    expect(res.status).toBe(200);
  });
});

describe('E2E Bridge — 입력 validation', () => {
  beforeEach(() => {
    vi.stubEnv('FIREBASE_USE_EMULATOR', 'true');
  });

  it('JSON parse 실패 → 400 INVALID_JSON', async () => {
    const req = new Request('http://localhost:3000/api/auth/e2e-bridge', {
      method: 'POST',
      body: '{invalid-json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'INVALID_JSON' });
  });

  it('uid 누락 → 400 INVALID_UID', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'INVALID_UID' });
  });

  it('uid 빈 문자열 → 400', async () => {
    const res = await POST(makeReq({ uid: '' }));
    expect(res.status).toBe(400);
  });

  it('uid 특수문자 (XSS 시도) → 400', async () => {
    const res = await POST(makeReq({ uid: '<script>alert(1)</script>' }));
    expect(res.status).toBe(400);
  });

  it('uid 65자 (너무 김) → 400', async () => {
    const res = await POST(makeReq({ uid: 'a'.repeat(65) }));
    expect(res.status).toBe(400);
  });

  it('role 이 알 수 없는 값 → 400 INVALID_ROLE', async () => {
    const res = await POST(
      makeReq({ uid: 'e2e-x', claims: { role: 'superuser' as 'admin' } }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'INVALID_ROLE' });
  });

  it('uid 정상 (영문/숫자/_-) — pass', async () => {
    const res = await POST(makeReq({ uid: 'e2e-regular_v2' }));
    expect(res.status).toBe(200);
  });
});
