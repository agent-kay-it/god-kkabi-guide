/**
 * setUserClaims retry queue — Sprint V3 P3.A (CA2-I11).
 *
 * 동기 setCustomUserClaims가 일시 장애 (Firebase Admin SDK 네트워크 / IAM 일시 거부)로
 * 실패하면 사용자 권한이 JWT refresh까지 stale 상태가 된다. confirmSubscription /
 * banUser / unbanUser 등은 이미 Firestore 트랜잭션이 끝난 뒤이므로 setUserClaims만
 * 실패해도 권한이 코드 측 신뢰선(Firestore)과 어긋난다.
 *
 * 방어 메커니즘:
 *  1) primary: setUserClaims를 즉시 시도.
 *  2) 실패 시 `user_claims_retry_queue/{queueId}` Firestore 문서에 enqueue.
 *  3) cron `/api/cron/retry-user-claims` 또는 다음 setUserClaims 호출 시
 *     pendingClaims를 우선 drain.
 *  4) 5회 실패 시 status='failed' 마킹 → admin 대시보드 알림 대상.
 *
 * 본 파일은 Firestore-backed durable queue. in-memory 대안은 컨테이너 재시작 시 손실.
 */
import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import type { Timestamp } from 'firebase-admin/firestore';

import { getAdminAuth, getAdminFirestore, hasAdminCredentials } from './admin';

const COLLECTION = 'user_claims_retry_queue';
const MAX_ATTEMPTS = 5;
const MAX_DRAIN_PER_RUN = 25;

export interface UserClaimsPayload {
  readonly role: 'admin' | 'user' | 'banned';
  readonly registered?: boolean;
  readonly tier?: 'free' | 'premium';
  readonly bannedReason?: string;
  /**
   * Sprint 10 Phase E (Task #23): RTDB chat 채널 라우팅에 사용.
   * - serverId: 게임 서버 ID (예 'S785') — RTDB rules에서 server-{serverId} 매칭
   * - munpaId : Firestore munpa doc id (`${serverId}_${munpaName}`) — RTDB rules에서 munpa-{munpaId} 매칭
   *
   * 값을 명시적으로 빈 문자열로 설정하면 claim 제거와 동치 (auth.token.serverId == null
   * 평가 결과를 받기 위함). Firestore Admin SDK는 string 빈값을 그대로 설정한다.
   */
  readonly serverId?: string;
  readonly munpaId?: string;
}

interface RetryQueueDoc {
  readonly id: string;
  readonly uid: string;
  readonly claims: UserClaimsPayload;
  readonly attempts: number;
  readonly lastError?: string;
  readonly status: 'pending' | 'failed';
  readonly enqueuedAt: Timestamp | FirebaseFirestore.FieldValue;
  readonly lastAttemptAt?: Timestamp | FirebaseFirestore.FieldValue;
}

/**
 * setUserClaims primary path.
 *
 * 실패 시 enqueue + Promise.resolve (호출처는 항상 성공으로 본다). 멱등성은
 * Firebase Auth 측에서 보장 (동일 claims 다중 적용 안전).
 */
export async function setUserClaimsWithRetry(
  uid: string,
  claims: UserClaimsPayload,
): Promise<{ ok: true; queued?: false } | { ok: true; queued: true }> {
  try {
    const auth = getAdminAuth();
    await auth.setCustomUserClaims(uid, claims);
    return { ok: true };
  } catch (err) {
    console.error('[claims-retry-queue] primary failed, enqueueing:', err);
    if (!hasAdminCredentials()) {
      // Admin SDK 자체가 없는 환경 — queue도 사용 불가.
      return { ok: true };
    }
    try {
      const db = getAdminFirestore();
      const ref = db.collection(COLLECTION).doc();
      const doc: RetryQueueDoc = {
        id: ref.id,
        uid,
        claims,
        attempts: 0,
        ...(err instanceof Error ? { lastError: err.message.slice(0, 500) } : {}),
        status: 'pending',
        enqueuedAt: FieldValue.serverTimestamp(),
      };
      await ref.set(doc);
      return { ok: true, queued: true };
    } catch (enqueueErr) {
      console.error('[claims-retry-queue] enqueue failed:', enqueueErr);
      return { ok: true };
    }
  }
}

/**
 * Queue drain — cron 또는 admin 수동 트리거. 오래된 pending부터 최대
 * MAX_DRAIN_PER_RUN 처리. 동일 uid 중복 enqueue 시 가장 최신 claims가 winner.
 */
export async function drainUserClaimsRetryQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  exhausted: number;
}> {
  if (!hasAdminCredentials()) {
    return { processed: 0, succeeded: 0, failed: 0, exhausted: 0 };
  }
  const db = getAdminFirestore();
  const auth = getAdminAuth();
  const snap = await db
    .collection(COLLECTION)
    .where('status', '==', 'pending')
    .orderBy('enqueuedAt', 'asc')
    .limit(MAX_DRAIN_PER_RUN)
    .get();

  let succeeded = 0;
  let failed = 0;
  let exhausted = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as RetryQueueDoc;
    const nextAttempts = data.attempts + 1;
    try {
      await auth.setCustomUserClaims(data.uid, data.claims);
      await doc.ref.delete();
      succeeded++;
    } catch (err) {
      const message = err instanceof Error ? err.message.slice(0, 500) : 'unknown';
      if (nextAttempts >= MAX_ATTEMPTS) {
        await doc.ref.update({
          attempts: nextAttempts,
          lastError: message,
          status: 'failed',
          lastAttemptAt: FieldValue.serverTimestamp(),
        });
        exhausted++;
      } else {
        await doc.ref.update({
          attempts: nextAttempts,
          lastError: message,
          lastAttemptAt: FieldValue.serverTimestamp(),
        });
        failed++;
      }
    }
  }

  return { processed: snap.size, succeeded, failed, exhausted };
}
