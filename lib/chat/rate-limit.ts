/**
 * Server-side chat rate limit — Firestore transaction (Admin SDK).
 * 출처: docs/sprint/10-sprint-launch/design.md §7 + Task #27
 *
 * 정책 (lib/chat/rate-limit-policy.ts 의 pure 결정 함수에 위임):
 *  - 분당 10 메시지 / 시간당 60 메시지
 *  - admin은 모든 limit 우회
 *  - banned / unregistered는 별도 분기로 거부
 *
 * 구현:
 *  - Firestore `chat_rate_limits/{uid}` doc:
 *    { minuteWindowStart, minuteCount, hourWindowStart, hourCount, updatedAt }
 *  - runTransaction(read → decideRateLimit() → write)
 *  - Window 만료 시 count=1, start=now로 reset
 *  - Admin SDK 미설정 시 fail-open (개발/로컬 — RTDB rules가 backstop)
 *
 * 보안:
 *  - 본 모듈은 `'use server'` Server Action만 export — Next 16 제약 준수
 *  - tx로 race condition 방어 (동시 10개 요청 → 1 합산)
 *  - 클라이언트 useChatRateLimit는 UX hint — 진정한 limit은 본 모듈
 */
'use server';

import 'server-only';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import {
  decideRateLimit,
  RATE_LIMIT_PER_MINUTE_DEFAULT,
  RATE_LIMIT_PER_HOUR_DEFAULT,
} from './rate-limit-policy';

const COLLECTION = 'chat_rate_limits';

interface RateLimitDoc {
  minuteWindowStart?: Timestamp;
  minuteCount?: number;
  hourWindowStart?: Timestamp;
  hourCount?: number;
}

export type EnforceRateLimitResult =
  | { ok: true; remainingMinute: number; remainingHour: number }
  | { ok: false; error: 'UNAUTHENTICATED' | 'BANNED' | 'NOT_REGISTERED' | 'INTERNAL' }
  | {
      ok: false;
      error: 'RATE_LIMIT_EXCEEDED';
      scope: 'minute' | 'hour';
      retryAfterMs: number;
    };

/**
 * 메시지 전송 직전 호출 — limit 초과 시 거부.
 * Admin SDK 미설정 환경에서는 fail-open.
 */
export async function enforceChatRateLimit(): Promise<EnforceRateLimitResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (session?.user?.role === 'banned') return { ok: false, error: 'BANNED' };
  if (!session?.user?.registered) return { ok: false, error: 'NOT_REGISTERED' };

  // Admin은 rate limit 우회
  if (session.user.role === 'admin') {
    return {
      ok: true,
      remainingMinute: RATE_LIMIT_PER_MINUTE_DEFAULT,
      remainingHour: RATE_LIMIT_PER_HOUR_DEFAULT,
    };
  }

  if (!hasAdminCredentials()) {
    return {
      ok: true,
      remainingMinute: RATE_LIMIT_PER_MINUTE_DEFAULT,
      remainingHour: RATE_LIMIT_PER_HOUR_DEFAULT,
    };
  }

  try {
    const db = getAdminFirestore();
    const ref = db.collection(COLLECTION).doc(uid);
    const nowMs = Date.now();

    const result = await db.runTransaction(
      async (tx): Promise<EnforceRateLimitResult> => {
        const snap = await tx.get(ref);
        const data = (snap.data() ?? {}) as RateLimitDoc;

        const decision = decideRateLimit({
          nowMs,
          minuteWindowStartMs: data.minuteWindowStart?.toMillis() ?? 0,
          minuteCount: data.minuteCount ?? 0,
          hourWindowStartMs: data.hourWindowStart?.toMillis() ?? 0,
          hourCount: data.hourCount ?? 0,
        });

        if (!decision.ok) {
          return {
            ok: false,
            error: 'RATE_LIMIT_EXCEEDED',
            scope: decision.scope,
            retryAfterMs: decision.retryAfterMs,
          };
        }

        tx.set(
          ref,
          {
            minuteWindowStart: decision.resetMinuteWindow
              ? Timestamp.fromMillis(nowMs)
              : data.minuteWindowStart ?? Timestamp.fromMillis(nowMs),
            minuteCount: decision.nextMinuteCount,
            hourWindowStart: decision.resetHourWindow
              ? Timestamp.fromMillis(nowMs)
              : data.hourWindowStart ?? Timestamp.fromMillis(nowMs),
            hourCount: decision.nextHourCount,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        return {
          ok: true,
          remainingMinute: RATE_LIMIT_PER_MINUTE_DEFAULT - decision.nextMinuteCount,
          remainingHour: RATE_LIMIT_PER_HOUR_DEFAULT - decision.nextHourCount,
        };
      },
    );

    return result;
  } catch (err) {
    console.error('[enforceChatRateLimit] tx failed, fail-open:', err);
    return {
      ok: true,
      remainingMinute: RATE_LIMIT_PER_MINUTE_DEFAULT,
      remainingHour: RATE_LIMIT_PER_HOUR_DEFAULT,
    };
  }
}
