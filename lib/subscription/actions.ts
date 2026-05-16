/**
 * F3.6 구독 Server Actions — Sprint V2 P3.E.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';
import {
  SUBSCRIPTION_PRICE,
  type SubscriptionDoc,
  type SubscriptionStatus,
} from '@/types/subscription';
import { tossConfirmPayment } from './toss-client';

export type SubscriptionResult =
  | { ok: true; subscriptionId?: string }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'BANNED'
        | 'ALREADY_ACTIVE'
        | 'NOT_FOUND'
        | 'TOSS_CONFIRM_FAILED'
        | 'AMOUNT_MISMATCH'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INTERNAL';
      message?: string;
    };

async function requireGuard(): Promise<
  | { ok: true; uid: string }
  | { ok: false; result: SubscriptionResult }
> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, result: { ok: false, error: 'UNAUTHENTICATED' } };
  if (!session.user.registered) return { ok: false, result: { ok: false, error: 'NOT_REGISTERED' } };
  if (session.user.role === 'banned') return { ok: false, result: { ok: false, error: 'BANNED' } };
  if (!hasAdminCredentials()) return { ok: false, result: { ok: false, error: 'ADMIN_NOT_CONFIGURED' } };
  return { ok: true, uid: session.user.id };
}

/**
 * 결제 confirm — Toss 위젯이 결제 완료 후 client→Server Action 호출.
 *
 * 흐름:
 *  1) Toss API 호출 (paymentKey + orderId + amount 검증)
 *  2) DONE 상태면 Firestore subscriptions 생성 (status='active')
 *  3) setUserClaims tier='premium' 갱신 → JWT 다음 refresh 시 반영
 *  4) payment_history 기록
 */
export async function confirmSubscription(input: {
  readonly orderId: string;
  readonly paymentKey: string;
  readonly amount: number;
}): Promise<SubscriptionResult> {
  const guard = await requireGuard();
  if (!guard.ok) return guard.result;

  const expectedAmount = SUBSCRIPTION_PRICE.premium_monthly.amount;
  if (input.amount !== expectedAmount) {
    return { ok: false, error: 'AMOUNT_MISMATCH', message: `expected ${expectedAmount}` };
  }

  // Sprint V3 GAP-P6-IMP-1: Toss API confirm fast-path skip.
  // 이미 처리된 orderId면 Toss API를 다시 호출하지 않는다 (Toss는 이미 confirmed
  // orderId에 4xx 반환 → 잘못된 "결제 검증 실패" UI 노출 위험). payment_history
  // doc id == orderId 멱등성을 활용해 fast-path 종료.
  try {
    const db = getAdminFirestore();
    const fastSnap = await db.collection('payment_history').doc(input.orderId).get();
    if (fastSnap.exists) {
      const fastData = fastSnap.data() as { subscriptionId?: string; status?: string; uid?: string };
      if (
        fastData.status === 'completed' &&
        fastData.subscriptionId &&
        fastData.uid === guard.uid
      ) {
        return { ok: true, subscriptionId: fastData.subscriptionId };
      }
    }
  } catch (err) {
    // fast-path 실패는 정상 흐름으로 fallthrough — 멱등성은 트랜잭션에서 다시 보장.
    console.warn('[lib/subscription/actions] fast-path lookup:', err);
  }

  let confirmed;
  try {
    confirmed = await tossConfirmPayment(input);
  } catch (err) {
    console.error('[lib/subscription/actions] tossConfirmPayment:', err);
    return { ok: false, error: 'TOSS_CONFIRM_FAILED', message: err instanceof Error ? err.message : 'unknown' };
  }
  if (confirmed.status !== 'DONE') {
    return { ok: false, error: 'TOSS_CONFIRM_FAILED', message: `status=${confirmed.status}` };
  }

  try {
    const db = getAdminFirestore();
    const now = Date.now();
    const period = 30 * 86400000; // 30일

    // Sprint V2 P5 — CA2-C1/C3 멱등성: payment_history doc id = orderId (Toss 중복 방어).
    // 동일 orderId 재요청 시 set({merge: true})로 idempotent. confirmSubscription의 새로고침/RSC prefetch 다중 호출 안전.
    const histRef = db.collection('payment_history').doc(input.orderId);
    let subscriptionIdResult: string;

    await db.runTransaction(async (tx) => {
      // 0) 멱등성 체크 — 이미 처리된 orderId면 기존 subscriptionId 반환
      const histSnap = await tx.get(histRef);
      if (histSnap.exists) {
        const existingHist = histSnap.data() as { subscriptionId?: string };
        if (existingHist.subscriptionId) {
          subscriptionIdResult = existingHist.subscriptionId;
          return;
        }
      }

      // 1) 기존 active 구독 있으면 ALREADY_ACTIVE (다른 orderId)
      const existingSnap = await tx.get(
        db.collection('subscriptions').where('uid', '==', guard.uid).where('status', '==', 'active').limit(1),
      );
      if (!existingSnap.empty) {
        throw new Error('ALREADY_ACTIVE');
      }

      const subRef = db.collection('subscriptions').doc();
      subscriptionIdResult = subRef.id;

      tx.set(subRef, {
        id: subRef.id,
        uid: guard.uid,
        plan: 'premium_monthly',
        status: 'active' as SubscriptionStatus,
        provider: 'toss',
        tossCustomerKey: guard.uid,
        startedAtMs: now,
        currentPeriodStartMs: now,
        currentPeriodEndMs: now + period,
        nextChargeAtMs: now + period,
        amount: expectedAmount,
        currency: 'KRW',
      });
      tx.set(
        histRef,
        {
          id: input.orderId,
          uid: guard.uid,
          subscriptionId: subRef.id,
          orderId: input.orderId,
          paymentKey: input.paymentKey,
          status: 'completed',
          amount: input.amount,
          currency: 'KRW',
          ...(confirmed.method ? { method: confirmed.method } : {}),
          paidAtMs: now,
        },
        { merge: true },
      );
      tx.set(
        db.collection('users').doc(guard.uid),
        { tier: 'premium', updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
    });

    // Firebase Auth custom claim (RTDB/Storage rules 등에서 사용 가능).
    // Sprint V3 P3.A (CA2-I11): 실패 시 Firestore retry queue로 fallthrough.
    await setUserClaimsWithRetry(guard.uid, {
      role: 'user',
      registered: true,
      tier: 'premium',
    });

    revalidatePath('/me/subscription');
    revalidatePath('/premium');
    return { ok: true, subscriptionId: subscriptionIdResult! };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'INTERNAL';
    if (msg === 'ALREADY_ACTIVE') return { ok: false, error: 'ALREADY_ACTIVE' };
    console.error('[lib/subscription/actions] confirmSubscription:', err);
    return { ok: false, error: 'INTERNAL', message: msg };
  }
}

/**
 * 구독 취소 — currentPeriodEnd까지 유지 후 expired 전환.
 */
export async function cancelSubscription(): Promise<SubscriptionResult> {
  const guard = await requireGuard();
  if (!guard.ok) return guard.result;
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('subscriptions')
      .where('uid', '==', guard.uid)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    if (snap.empty) return { ok: false, error: 'NOT_FOUND' };
    const docRef = snap.docs[0]!.ref;
    await docRef.update({
      status: 'canceled',
      canceledAtMs: Date.now(),
      nextChargeAtMs: FieldValue.delete(),
    });
    revalidatePath('/me/subscription');
    return { ok: true, subscriptionId: docRef.id };
  } catch (err) {
    console.error('[lib/subscription/actions] cancelSubscription:', err);
    return { ok: false, error: 'INTERNAL', message: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function getActiveSubscription(): Promise<SubscriptionDoc | null> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid || !hasAdminCredentials()) return null;
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('subscriptions')
      .where('uid', '==', uid)
      .orderBy('startedAtMs', 'desc')
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0]!.data() as SubscriptionDoc;
  } catch (err) {
    console.error('[lib/subscription/actions] getActiveSubscription:', err);
    return null;
  }
}
