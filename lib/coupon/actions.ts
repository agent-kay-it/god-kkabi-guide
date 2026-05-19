/**
 * F3.4 쿠폰 Server Actions — Sprint V2 P3.C.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §4
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import {
  COUPON_LIMITS,
  type CouponDoc,
  type CouponStatus,
} from '@/types/coupon';

const CouponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(COUPON_LIMITS.code.min)
      .max(COUPON_LIMITS.code.max)
      .regex(/^[A-Z0-9_-]+$/i, '영문/숫자/_/- 만 허용'),
    title: z.string().trim().min(COUPON_LIMITS.title.min).max(COUPON_LIMITS.title.max),
    rewards: z
      .string()
      .trim()
      .min(COUPON_LIMITS.rewards.min)
      .max(COUPON_LIMITS.rewards.max),
    expiresAtMs: z.number().int().positive(),
  })
  .strict();

export type CouponActionResult =
  | { ok: true; couponId?: string }
  | {
      ok: false;
      error: 'UNAUTHENTICATED' | 'NOT_REGISTERED' | 'BANNED' | 'VALIDATION_FAILED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL' | 'ADMIN_NOT_CONFIGURED';
      message?: string;
      fieldErrors?: Partial<Record<'code' | 'title' | 'rewards' | 'expiresAtMs', string>>;
    };

async function requireUnbanned(): Promise<
  | { ok: true; uid: string; nickname: string }
  | { ok: false; result: CouponActionResult }
> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, result: { ok: false, error: 'UNAUTHENTICATED' } };
  if (!session.user.registered) return { ok: false, result: { ok: false, error: 'NOT_REGISTERED' } };
  if (session.user.role === 'banned') return { ok: false, result: { ok: false, error: 'BANNED' } };
  if (!hasAdminCredentials()) return { ok: false, result: { ok: false, error: 'ADMIN_NOT_CONFIGURED' } };
  return { ok: true, uid, nickname: session.user.nickname ?? '익명' };
}

export async function submitCoupon(raw: unknown): Promise<CouponActionResult> {
  const guard = await requireUnbanned();
  if (!guard.ok) return guard.result;

  const parsed = CouponInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<'code' | 'title' | 'rewards' | 'expiresAtMs', string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        key === 'code' ||
        key === 'title' ||
        key === 'rewards' ||
        key === 'expiresAtMs'
      ) {
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, error: 'VALIDATION_FAILED', fieldErrors };
  }
  const input = parsed.data;

  try {
    const db = getAdminFirestore();
    const ref = db.collection('coupons').doc();
    await ref.set({
      id: ref.id,
      code: input.code.toUpperCase(),
      title: input.title,
      rewards: input.rewards,
      expiresAtMs: input.expiresAtMs,
      status: 'pending' as CouponStatus,
      submittedBy: guard.uid,
      submittedByNickname: guard.nickname,
      upvotes: 0,
      downvotes: 0,
      reportedAt: FieldValue.serverTimestamp(),
    });
    revalidatePath('/coupon');
    revalidatePath('/admin/coupons');
    return { ok: true, couponId: ref.id };
  } catch (err) {
    console.error('[lib/coupon/actions] submitCoupon:', err);
    return { ok: false, error: 'INTERNAL', message: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function verifyCoupon(
  couponId: string,
  next: 'verified' | 'rejected',
  rejectionReason?: string,
): Promise<CouponActionResult> {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' };
  if (!hasAdminCredentials()) return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  if (next === 'rejected' && !rejectionReason?.trim()) {
    return { ok: false, error: 'VALIDATION_FAILED', message: 'REJECTION_REASON_REQUIRED' };
  }

  try {
    const db = getAdminFirestore();
    await db
      .collection('coupons')
      .doc(couponId)
      .update({
        status: next,
        verifiedBy: session.user.id,
        verifiedAt: FieldValue.serverTimestamp(),
        ...(next === 'rejected' && rejectionReason ? { rejectionReason } : {}),
      });
    revalidatePath('/coupon');
    revalidatePath('/admin/coupons');
    return { ok: true, couponId };
  } catch (err) {
    console.error('[lib/coupon/actions] verifyCoupon:', err);
    return { ok: false, error: 'INTERNAL', message: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function voteCoupon(
  couponId: string,
  direction: 'up' | 'down',
): Promise<CouponActionResult> {
  const guard = await requireUnbanned();
  if (!guard.ok) return guard.result;
  try {
    const db = getAdminFirestore();
    const couponRef = db.collection('coupons').doc(couponId);
    const voteRef = couponRef.collection('votes').doc(guard.uid);
    await db.runTransaction(async (tx) => {
      const voteSnap = await tx.get(voteRef);
      const prev = (voteSnap.data() as { direction?: 'up' | 'down' } | undefined)?.direction;
      if (prev === direction) return; // no-op
      tx.set(voteRef, { uid: guard.uid, direction, timestamp: FieldValue.serverTimestamp() });
      const upDelta = direction === 'up' ? 1 : prev === 'up' ? -1 : 0;
      const downDelta = direction === 'down' ? 1 : prev === 'down' ? -1 : 0;
      tx.update(couponRef, {
        upvotes: FieldValue.increment(upDelta),
        downvotes: FieldValue.increment(downDelta),
      });
    });
    revalidatePath('/coupon');
    return { ok: true, couponId };
  } catch (err) {
    console.error('[lib/coupon/actions] voteCoupon:', err);
    return { ok: false, error: 'INTERNAL', message: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function listCoupons(
  status: CouponStatus = 'verified',
): Promise<readonly CouponDoc[]> {
  if (!hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('coupons')
      .where('status', '==', status)
      .orderBy('reportedAt', 'desc')
      .limit(50)
      .get();
    return snap.docs.map((d) => d.data() as CouponDoc);
  } catch (err) {
    console.error('[lib/coupon/actions] listCoupons:', err);
    return [];
  }
}

export async function listPendingCouponsAdmin(): Promise<readonly CouponDoc[]> {
  const session = await auth();
  if (session?.user?.role !== 'admin') return [];
  if (!hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('coupons')
      .where('status', '==', 'pending')
      .orderBy('reportedAt', 'desc')
      .limit(100)
      .get();
    return snap.docs.map((d) => d.data() as CouponDoc);
  } catch (err) {
    console.error('[lib/coupon/actions] listPendingCouponsAdmin:', err);
    return [];
  }
}

/**
 * 자동 검증 batch 실행 — Sprint 19 F19-H (마스터 V2 F3.4 1차).
 *
 * pending 쿠폰을 조회하여 lib/coupon/auto-validate 의 정책으로 일괄 판정 후
 * 상태 업데이트. admin 전용 (운영자 수동 또는 향후 cron 트리거).
 *
 * 출처: docs/sprint/19-sprint-coverage-deploy/design.md §6
 */
export interface AutoValidateRunSummary {
  readonly ok: true;
  readonly scanned: number;
  readonly autoEnabled: number;
  readonly autoDisabled: number;
  readonly noop: number;
}

export type AutoValidateRunResult =
  | AutoValidateRunSummary
  | { ok: false; error: 'FORBIDDEN' | 'ADMIN_NOT_CONFIGURED' | 'INTERNAL'; message?: string };

export async function runCouponAutoValidation(): Promise<AutoValidateRunResult> {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' };
  if (!hasAdminCredentials()) return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };

  const { decideCouponValidation, decisionToCouponUpdate } = await import('./auto-validate');

  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('coupons')
      .where('status', '==', 'pending')
      .orderBy('reportedAt', 'desc')
      .limit(200)
      .get();

    let autoEnabled = 0;
    let autoDisabled = 0;
    let noop = 0;
    const nowMs = Date.now();

    for (const docSnap of snap.docs) {
      const d = docSnap.data() as CouponDoc & {
        reportedAt?: { toMillis(): number };
      };
      const createdAtMs = d.reportedAt?.toMillis() ?? 0;
      const decision = decideCouponValidation({
        votesUp: d.upvotes ?? 0,
        votesDown: d.downvotes ?? 0,
        status: d.status,
        createdAtMs,
        ...(d.expiresAtMs !== undefined ? { expiresAtMs: d.expiresAtMs } : {}),
        nowMs,
      });
      const update = decisionToCouponUpdate(decision);
      if (!update) {
        noop++;
        continue;
      }
      await docSnap.ref.update({
        ...update,
        verifiedBy: 'system',
        verifiedAt: FieldValue.serverTimestamp(),
      });
      if (decision.type === 'auto_enable') autoEnabled++;
      else autoDisabled++;
    }

    revalidatePath('/coupon');
    revalidatePath('/admin/coupons');

    return {
      ok: true,
      scanned: snap.docs.length,
      autoEnabled,
      autoDisabled,
      noop,
    };
  } catch (err) {
    console.error('[lib/coupon/actions] runCouponAutoValidation:', err);
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
