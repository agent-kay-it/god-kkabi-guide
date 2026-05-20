/**
 * B2B API 표준 응답 helper — Sprint V3 P3.B.
 *
 * - envelope `{data, meta}` / `{error}`
 * - Rate Limit 헤더 일관성 (X-RateLimit-* + Retry-After)
 * - CORS — game-co.* whitelist 또는 wildcard (운영자 환경변수)
 */
import 'server-only';

import { NextResponse } from 'next/server';

import type {
  ApiAuthOk,
  ApiAuthFail,
} from './auth';
import type {
  ApiResponseEnvelope,
  ApiErrorEnvelope,
  ApiTier,
} from '@/types/b2b';

const CORS_ALLOWED_ORIGINS = (process.env.B2B_API_CORS_ORIGINS ?? '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allow =
    CORS_ALLOWED_ORIGINS.includes('*') ||
    (origin && CORS_ALLOWED_ORIGINS.includes(origin))
      ? origin || '*'
      : '';
  if (!allow) return {};
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, X-API-Key, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function rateLimitHeaders(
  tier: ApiTier,
  remaining: number,
  resetAtMs: number,
): Record<string, string> {
  // Sprint 27 F27-A — Infinity remaining → '-1' (관례: -1 = 무제한, enterprise tier).
  // 이전: '∞' (U+221E) 는 ASCII 가 아니어서 NextResponse.json headers Map (ByteString
  // 만 허용) 에서 throw → 500. envelope.meta.rateLimitRemaining 도 -1 로 이미 일관.
  return {
    'X-RateLimit-Tier': tier,
    'X-RateLimit-Remaining': Number.isFinite(remaining) ? String(remaining) : '-1',
    'X-RateLimit-Reset': Math.floor(resetAtMs / 1000).toString(),
  };
}

export function b2bOk<T>(
  auth: ApiAuthOk,
  data: T,
  startMs: number,
  origin: string | null,
): NextResponse {
  const body: ApiResponseEnvelope<T> = {
    data,
    meta: {
      source: 'kkaebizigi',
      tier: auth.tier,
      rateLimitRemaining: Number.isFinite(auth.remaining) ? auth.remaining : -1,
      rateLimitResetAtMs: auth.resetAtMs,
      tookMs: Date.now() - startMs,
      version: 'v1',
    },
  };
  return NextResponse.json(body, {
    headers: {
      ...rateLimitHeaders(auth.tier, auth.remaining, auth.resetAtMs),
      ...buildCorsHeaders(origin),
      'Cache-Control': 'private, max-age=60',
    },
  });
}

export function b2bError(
  auth: ApiAuthFail,
  origin: string | null,
): NextResponse {
  const body: ApiErrorEnvelope = {
    error: {
      code: auth.code,
      message: auth.message,
      ...(auth.retryAfterMs !== undefined ? { retryAfterMs: auth.retryAfterMs } : {}),
    },
  };
  const headers: Record<string, string> = {
    ...buildCorsHeaders(origin),
  };
  if (auth.retryAfterMs !== undefined) {
    headers['Retry-After'] = Math.ceil(auth.retryAfterMs / 1000).toString();
  }
  if (auth.resetAtMs !== undefined) {
    headers['X-RateLimit-Reset'] = Math.floor(auth.resetAtMs / 1000).toString();
  }
  return NextResponse.json(body, { status: auth.status, headers });
}

export function b2bBadRequest(
  message: string,
  origin: string | null,
): NextResponse {
  const body: ApiErrorEnvelope = {
    error: { code: 'BAD_REQUEST', message },
  };
  return NextResponse.json(body, { status: 400, headers: buildCorsHeaders(origin) });
}

export function b2bOptions(origin: string | null): NextResponse {
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(origin) });
}
