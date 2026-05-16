/**
 * B2B API 인증 + Rate Limit guard — Sprint V3 P3.B.
 *
 * 흐름:
 *  1) parseAuthorizationHeader → plaintext API Key 추출
 *  2) hashApiKey → Firestore api_clients에서 hash로 lookup
 *  3) contract_starts/ends + is_active 검증
 *  4) api_usage 일일 카운트 증가 + tier 한도 검증 (트랜잭션)
 *
 * 반환:
 *  - { ok: true, client, remaining, resetAtMs } — 성공 (Rate Limit 헤더용)
 *  - { ok: false, status, error } — 4xx
 */
import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import {
  API_RATE_LIMITS,
  type ApiClientDoc,
  type ApiTier,
} from '@/types/b2b';
import { hashApiKey, parseAuthorizationHeader } from './api-key';

export interface ApiAuthOk {
  readonly ok: true;
  readonly client: ApiClientDoc;
  readonly tier: ApiTier;
  readonly remaining: number;
  readonly resetAtMs: number;
}

export interface ApiAuthFail {
  readonly ok: false;
  readonly status: 401 | 403 | 429 | 500;
  readonly code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'RATE_LIMITED' | 'INTERNAL';
  readonly message: string;
  /** RATE_LIMITED 응답에 사용 */
  readonly retryAfterMs?: number;
  /** 외부 노출용 — Rate Limit reset 시각 */
  readonly resetAtMs?: number;
}

export type ApiAuthResult = ApiAuthOk | ApiAuthFail;

/** UTC 자정까지 남은 ms */
function msToNextUtcMidnight(now: Date): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function todayKey(now: Date): string {
  return now.toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

export async function verifyApiAuthAndIncrementUsage(
  authorizationHeader: string | null,
  xApiKey: string | null,
): Promise<ApiAuthResult> {
  if (!hasAdminCredentials()) {
    return { ok: false, status: 500, code: 'INTERNAL', message: 'admin_not_configured' };
  }

  const plaintext =
    parseAuthorizationHeader(authorizationHeader) ?? (xApiKey ?? '').trim() ?? '';
  if (!plaintext) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'API key required (Authorization: Bearer <key> or X-API-Key header)',
    };
  }
  const keyHash = hashApiKey(plaintext);

  const db = getAdminFirestore();
  const clientSnap = await db
    .collection('api_clients')
    .where('apiKeyHash', '==', keyHash)
    .limit(1)
    .get();
  if (clientSnap.empty) {
    return { ok: false, status: 401, code: 'UNAUTHORIZED', message: 'invalid_api_key' };
  }
  const client = clientSnap.docs[0]!.data() as ApiClientDoc;

  if (!client.isActive) {
    return { ok: false, status: 403, code: 'FORBIDDEN', message: 'client_inactive' };
  }
  const now = new Date();
  const nowMs = now.getTime();
  if (nowMs < client.contractStartsAtMs) {
    return { ok: false, status: 403, code: 'FORBIDDEN', message: 'contract_not_started' };
  }
  if (nowMs > client.contractEndsAtMs) {
    return { ok: false, status: 403, code: 'FORBIDDEN', message: 'contract_expired' };
  }

  const tier = client.tier;
  const limit = API_RATE_LIMITS[tier];
  const dateKey = todayKey(now);
  const usageId = `${client.apiKeyHash}_${dateKey}`;
  const usageRef = db.collection('api_usage').doc(usageId);
  const resetAtMs = nowMs + msToNextUtcMidnight(now);

  // Enterprise는 무제한 — 카운트만 기록 (분석용).
  if (!Number.isFinite(limit)) {
    await usageRef.set(
      {
        id: usageId,
        apiKeyHash: client.apiKeyHash,
        date: dateKey,
        count: FieldValue.increment(1),
        lastCalledAtMs: nowMs,
      },
      { merge: true },
    );
    return {
      ok: true,
      client,
      tier,
      remaining: Number.POSITIVE_INFINITY,
      resetAtMs,
    };
  }

  // Starter/Pro — 트랜잭션 안에서 한도 검증 + 증가.
  let blocked = false;
  let after = 0;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(usageRef);
    const current = snap.exists ? ((snap.data() as { count?: number }).count ?? 0) : 0;
    if (current >= limit) {
      blocked = true;
      after = current;
      return;
    }
    after = current + 1;
    tx.set(
      usageRef,
      {
        id: usageId,
        apiKeyHash: client.apiKeyHash,
        date: dateKey,
        count: after,
        lastCalledAtMs: nowMs,
      },
      { merge: true },
    );
  });

  if (blocked) {
    return {
      ok: false,
      status: 429,
      code: 'RATE_LIMITED',
      message: `daily_limit_reached (${limit})`,
      retryAfterMs: resetAtMs - nowMs,
      resetAtMs,
    };
  }
  return {
    ok: true,
    client,
    tier,
    remaining: Math.max(0, limit - after),
    resetAtMs,
  };
}
