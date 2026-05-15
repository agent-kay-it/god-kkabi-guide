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
  setUserClaims,
} from '@/lib/firebase/admin';
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
    const subRef = db.collection('subscriptions').doc();
    const histRef = db.collection('payment_history').doc();

    await db.runTransaction(async (tx) => {
      // 기존 active 구독 있으면 ALREADY_ACTIVE
      const existingSnap = await tx.get(
        db.collection('subscriptions').where('uid', '==', guard.uid).where('status', '==', 'active').limit(1),
      );
      if (!existingSnap.empty) {
        throw new Error('ALREADY_ACTIVE');
      }

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
      tx.set(histRef, {
        id: histRef.id,
        uid: guard.uid,
        subscriptionId: subRef.id,
        orderId: input.orderId,
        paymentKey: input.paymentKey,
        status: 'completed',
        amount: input.amount,
        currency: 'KRW',
        ...(confirmed.method ? { method: confirmed.method } : {}),
        paidAtMs: now,
      });
      tx.set(
        db.collection('users').doc(guard.uid),
        { tier: 'premium', updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
    });

    // Firebase Auth custom claim (RTDB/Storage rules 등에서 사용 가능)
    try {
      await setUserClaims(guard.uid, { role: 'user', registered: true, tier: 'premium' });
    } catch (err) {
      console.error('[lib/subscription/actions] setUserClaims:', err);
    }

    revalidatePath('/me/subscription');
    revalidatePath('/premium');
    return { ok: true, subscriptionId: subRef.id };
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
