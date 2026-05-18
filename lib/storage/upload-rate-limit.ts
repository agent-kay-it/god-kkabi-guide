/**
 * Sprint 11 Phase B — 이미지 업로드 Rate Limit (server-only).
 * 출처: docs/sprint/11-sprint-images/design.md §4.4 + §8.1 T5
 *
 * Firestore counter 기반 분당/시간당 슬라이딩 윈도 제한.
 * - 분당 10회, 시간당 50회를 초과하면 RATE_LIMIT_EXCEEDED.
 * - 비용 DoS (T5 threat) 방어와 사용자 실수 양쪽을 커버.
 *
 * 데이터 위치: `uploadRate/{uid}` Firestore document.
 *   {
 *     minute: { windowStart: number, count: number },
 *     hour:   { windowStart: number, count: number },
 *     updatedAt: number,
 *   }
 *
 * 트랜잭션 보장: read-modify-write가 동시 호출 시에도 atomic하도록 Firestore
 * runTransaction을 사용.
 */
import 'server-only';

import { FieldValue, type Firestore } from 'firebase-admin/firestore';

import { getAdminFirestore } from '@/lib/firebase/admin';

export const RATE_LIMIT_PER_MINUTE = 10;
export const RATE_LIMIT_PER_HOUR = 50;

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

export type RateLimitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly retryAfterMs: number; readonly reason: 'minute' | 'hour' };

interface WindowDoc {
  readonly windowStart: number;
  readonly count: number;
}

interface RateLimitDoc {
  readonly minute?: WindowDoc;
  readonly hour?: WindowDoc;
}

/**
 * 사용자의 업로드 시도를 카운트하고 제한을 강제.
 * 통과 시 카운트 +1, 거부 시 카운트 변경 없음.
 *
 * @param uid NextAuth session user id
 * @param now Date.now() — 테스트 주입 가능
 * @param db Firestore admin instance — 테스트 주입 가능
 */
export async function enforceUploadRateLimit(
  uid: string,
  now: number = Date.now(),
  db: Firestore = getAdminFirestore(),
): Promise<RateLimitResult> {
  if (!uid) {
    return { ok: false, retryAfterMs: 0, reason: 'minute' };
  }
  const ref = db.collection('uploadRate').doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = (snap.data() ?? {}) as RateLimitDoc;
    const nextMinute = slideWindow(data.minute, now, MINUTE_MS);
    const nextHour = slideWindow(data.hour, now, HOUR_MS);

    if (nextMinute.count + 1 > RATE_LIMIT_PER_MINUTE) {
      const retryAfterMs = nextMinute.windowStart + MINUTE_MS - now;
      return { ok: false, retryAfterMs: Math.max(retryAfterMs, 0), reason: 'minute' };
    }
    if (nextHour.count + 1 > RATE_LIMIT_PER_HOUR) {
      const retryAfterMs = nextHour.windowStart + HOUR_MS - now;
      return { ok: false, retryAfterMs: Math.max(retryAfterMs, 0), reason: 'hour' };
    }

    tx.set(
      ref,
      {
        minute: { windowStart: nextMinute.windowStart, count: nextMinute.count + 1 },
        hour: { windowStart: nextHour.windowStart, count: nextHour.count + 1 },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { ok: true };
  });
}

function slideWindow(
  current: WindowDoc | undefined,
  now: number,
  windowMs: number,
): WindowDoc {
  if (!current || now - current.windowStart >= windowMs) {
    return { windowStart: now, count: 0 };
  }
  return current;
}
