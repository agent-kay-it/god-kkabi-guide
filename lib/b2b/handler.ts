/**
 * B2B API route handler 공통 wrapper — Sprint V3 P3.B.
 *
 * 모든 /api/v1/* 라우트는 본 wrapper로 통일:
 *  1) OPTIONS preflight → CORS 헤더만 반환
 *  2) GET → auth + rate limit + handler 실행 → 표준 envelope
 *  3) 그 외 메소드 → 405
 */
import 'server-only';

import type { NextRequest, NextResponse } from 'next/server';

import { verifyApiAuthAndIncrementUsage, type ApiAuthOk } from './auth';
import { b2bOk, b2bError, b2bOptions } from './response';
import { API_RATE_LIMITS, type ApiTier } from '@/types/b2b';

type B2bHandler<T> = (
  req: NextRequest,
  auth: ApiAuthOk,
) => Promise<T> | T;

export interface B2bRouteOptions {
  /** 최소 요구 tier. 기본 'starter' (전 tier 허용). */
  readonly minTier?: ApiTier;
}

const TIER_RANK: Record<ApiTier, number> = { starter: 0, pro: 1, enterprise: 2 };

export function createB2bRoute<T>(
  handler: B2bHandler<T>,
  options: B2bRouteOptions = {},
): {
  GET: (req: NextRequest) => Promise<NextResponse>;
  OPTIONS: (req: NextRequest) => Promise<NextResponse>;
} {
  const minTier = options.minTier ?? 'starter';

  async function GET(req: NextRequest): Promise<NextResponse> {
    const origin = req.headers.get('origin');
    const startMs = Date.now();
    const auth = await verifyApiAuthAndIncrementUsage(
      req.headers.get('authorization'),
      req.headers.get('x-api-key'),
    );
    if (!auth.ok) return b2bError(auth, origin);

    // Tier 가드 — 일일 카운트는 이미 증가되었으나 의도된 동작 (남용 방지).
    if (TIER_RANK[auth.tier] < TIER_RANK[minTier]) {
      return b2bError(
        {
          ok: false,
          status: 403,
          code: 'FORBIDDEN',
          message: `endpoint_requires_${minTier}_tier (current: ${auth.tier}, limit ${API_RATE_LIMITS[auth.tier]})`,
        },
        origin,
      );
    }

    try {
      const data = await handler(req, auth);
      // GAP-V3-MAJ-1: B2B funnel server-side audit log (b2b_api_call).
      // GA4 측정은 추후 measurement protocol 도입 시 server-side fire — 본 핸들러는
      // JSON audit log로 우선 보존 (Vercel logs / DataDog 등에서 집계 가능).
      const url = new URL(req.url);
      console.info(
        JSON.stringify({
          event: 'b2b_api_call',
          tenantId: auth.client.tenantId,
          tier: auth.tier,
          path: url.pathname,
          tookMs: Date.now() - startMs,
          remaining: Number.isFinite(auth.remaining) ? auth.remaining : -1,
        }),
      );
      return b2bOk(auth, data, startMs, origin);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      console.error('[lib/b2b/handler] handler error:', err);
      return b2bError(
        { ok: false, status: 500, code: 'INTERNAL', message },
        origin,
      );
    }
  }

  async function OPTIONS(req: NextRequest): Promise<NextResponse> {
    return b2bOptions(req.headers.get('origin'));
  }

  return { GET, OPTIONS };
}
