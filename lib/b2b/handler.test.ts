/**
 * lib/b2b/handler.ts — Sprint 27 F27-C 단위 테스트.
 * B2B API route wrapper (createB2bRoute) GET/OPTIONS 동작 검증.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockVerify = vi.fn();
const mockEmitAuditLog = vi.fn();

vi.mock('./auth', () => ({
  verifyApiAuthAndIncrementUsage: (...args: never[]) =>
    (mockVerify as (...a: never[]) => unknown)(...args),
}));
vi.mock('@/lib/observability/audit-log', () => ({
  emitAuditLog: (...args: never[]) =>
    (mockEmitAuditLog as (...a: never[]) => unknown)(...args),
}));

import { createB2bRoute } from './handler';

function fakeReq(
  url: string,
  headers: Record<string, string> = {},
): unknown {
  return {
    url,
    headers: {
      get: (k: string) => headers[k.toLowerCase()] ?? null,
    },
  };
}

beforeEach(() => {
  mockVerify.mockReset();
  mockEmitAuditLog.mockClear();
});

describe('createB2bRoute', () => {
  it('GET — auth 실패 → b2bError 반환 (401)', async () => {
    mockVerify.mockResolvedValue({
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'no key',
    });
    const { GET } = createB2bRoute(async () => ({ data: 1 }));
    const res = await GET(fakeReq('https://x.local/api/v1/x') as never);
    expect(res.status).toBe(401);
  });

  it('GET — tier 부족 → 403 FORBIDDEN', async () => {
    mockVerify.mockResolvedValue({
      ok: true,
      tier: 'starter',
      client: { tenantId: 't1' },
      remaining: 100,
      resetAtMs: 1000000,
    });
    const { GET } = createB2bRoute(async () => ({ data: 1 }), {
      minTier: 'pro',
    });
    const res = await GET(fakeReq('https://x.local/api/v1/x') as never);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('GET — happy: 200 + envelope + audit log', async () => {
    mockVerify.mockResolvedValue({
      ok: true,
      tier: 'pro',
      client: { tenantId: 't1' },
      remaining: 99,
      resetAtMs: 1000000,
    });
    const handler = vi.fn(async () => ({ items: [1, 2] }));
    const { GET } = createB2bRoute(handler);
    const res = await GET(fakeReq('https://x.local/api/v1/x') as never);
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalled();
    expect(mockEmitAuditLog).toHaveBeenCalledWith(
      'b2b_api_call',
      expect.objectContaining({
        tenantId: 't1',
        tier: 'pro',
        path: '/api/v1/x',
      }),
    );
    const body = await res.json();
    expect(body.data).toEqual({ items: [1, 2] });
  });

  it('GET — handler throw → 500 INTERNAL', async () => {
    mockVerify.mockResolvedValue({
      ok: true,
      tier: 'enterprise',
      client: { tenantId: 't1' },
      remaining: Infinity,
      resetAtMs: 0,
    });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { GET } = createB2bRoute(async () => {
      throw new Error('handler boom');
    });
    const res = await GET(fakeReq('https://x.local/api/v1/x') as never);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('INTERNAL');
    expect(body.error.message).toBe('handler boom');
    errSpy.mockRestore();
  });

  it('GET — Infinity remaining 도 audit log에 -1로 기록', async () => {
    mockVerify.mockResolvedValue({
      ok: true,
      tier: 'enterprise',
      client: { tenantId: 't1' },
      remaining: Infinity,
      resetAtMs: 0,
    });
    const { GET } = createB2bRoute(async () => ({ ok: true }));
    await GET(fakeReq('https://x.local/api/v1/x') as never);
    const call = mockEmitAuditLog.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(call.remaining).toBe(-1);
  });

  it('OPTIONS — 204 + CORS preflight', async () => {
    const { OPTIONS } = createB2bRoute(async () => ({}));
    const res = await OPTIONS(fakeReq('https://x.local/api/v1/x') as never);
    expect(res.status).toBe(204);
  });

  it('minTier 기본 starter — pro tier 허용', async () => {
    mockVerify.mockResolvedValue({
      ok: true,
      tier: 'pro',
      client: { tenantId: 't1' },
      remaining: 99,
      resetAtMs: 0,
    });
    const { GET } = createB2bRoute(async () => ({}));
    const res = await GET(fakeReq('https://x.local/api/v1/x') as never);
    expect(res.status).toBe(200);
  });
});
