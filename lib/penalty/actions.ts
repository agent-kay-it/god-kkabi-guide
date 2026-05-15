/**
 * 신고 페널티 Server Actions — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/moderation-policy.md §1
 *      + design.md §3.4
 *
 * 자동 페널티 룰:
 *  - 5건 누적: warning + users.warningCount++
 *  - 10건 누적: ban_7d + bannedUntil=now+7d
 *  - 20건 누적: ban_permanent + custom claim role=banned
 *
 * 호출 순서:
 *  - report Server Action (chat / post / comment 신고)에서 마지막에 recordReport 호출
 *  - recordReport가 트랜잭션으로 reportedTotal++ 후 applyAutoPenalty 트리거
 *  - audit log + penalties 컬렉션에 동시 기록
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
  BAN_7D_DURATION_MS,
  PENALTY_THRESHOLDS,
  determinePenaltyLevel,
  type PenaltyLevel,
  type RecordReportResult,
} from '@/types/penalty';

interface RecordReportInput {
  readonly targetUid: string;
  /** 신고가 발생한 컨텍스트 (audit 메타데이터용) */
  readonly source: 'chat' | 'post' | 'comment';
  readonly sourceId: string;
}

/**
 * 신고 1건 발생 → reportedTotal++ → 임계값 도달 시 자동 페널티 적용.
 * Server Action 또는 server-only 함수에서만 호출.
 *
 * 트랜잭션으로 동시성 안전 (5건 동시 신고 → 정확히 한 번 임계값 발동).
 */
export async function recordReport(
  input: RecordReportInput,
): Promise<RecordReportResult> {
  if (!hasAdminCredentials()) {
    return { ok: false, error: 'INTERNAL', message: 'admin_not_configured' };
  }

  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(input.targetUid);

    let newTotal = 0;
    let penaltyApplied: PenaltyLevel | null = null;
    let triggeredThreshold = false;

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const currentTotal = (userSnap.data()?.reportedTotal as number | undefined) ?? 0;
      newTotal = currentTotal + 1;

      // 임계값 도달 여부: 현재값 < 임계값 ≤ 새값
      const oldLevel = determinePenaltyLevel(currentTotal);
      const next = determinePenaltyLevel(newTotal);
      triggeredThreshold = next !== null && next !== oldLevel;
      if (triggeredThreshold) penaltyApplied = next;

      // users.reportedTotal 증가 + 페널티 필드 동시 갱신
      const updates: Record<string, unknown> = {
        reportedTotal: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (triggeredThreshold && next === 'warning') {
        updates.warningCount = FieldValue.increment(1);
      }
      if (triggeredThreshold && next === 'ban_7d') {
        updates.banned = true;
        updates.bannedUntil = new Date(Date.now() + BAN_7D_DURATION_MS);
        updates.banReason = '자동 7일 정지 (신고 누적 10건)';
      }
      if (triggeredThreshold && next === 'ban_permanent') {
        updates.banned = true;
        updates.banReason = '자동 영구 정지 (신고 누적 20건)';
      }

      tx.set(userRef, updates, { merge: true });

      // penalties 컬렉션 audit (트리거 시점에만 추가)
      if (triggeredThreshold && next) {
        const penaltyRef = db.collection('penalties').doc();
        const penaltyDoc: Record<string, unknown> = {
          id: penaltyRef.id,
          targetUid: input.targetUid,
          level: next,
          reason: 'auto_threshold',
          appliedBy: 'system',
          appliedAt: FieldValue.serverTimestamp(),
          reportedCountAtTime: newTotal,
          sourceContext: { source: input.source, sourceId: input.sourceId },
        };
        if (next === 'ban_7d') {
          penaltyDoc.expiresAt = new Date(Date.now() + BAN_7D_DURATION_MS);
        }
        tx.set(penaltyRef, penaltyDoc);
      }
    });

    // 트랜잭션 외: claim 변경 (Admin Auth) — Firestore와 동일 트랜잭션 불가
    if (penaltyApplied === 'ban_permanent') {
      await setUserClaims(input.targetUid, { role: 'banned' });
    }

    // audit log
    if (triggeredThreshold && penaltyApplied) {
      await logAutoPenalty(input.targetUid, penaltyApplied, newTotal, input);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/penalties');

    return { ok: true, newTotal, penaltyApplied };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}

/**
 * 운영자가 false positive를 결정한 경우 reportedTotal -= 1.
 * 정지 해제는 별도 unbanUser Server Action (lib/moderation/actions.ts)에서 처리.
 */
export async function recoverFromPenalty(
  targetUid: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return { ok: false, error: 'FORBIDDEN' };
  }
  if (!hasAdminCredentials()) {
    return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  }

  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(targetUid);
    await userRef.update({
      reportedTotal: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 가장 최근 active penalty 1건 revoke
    const recent = await db
      .collection('penalties')
      .where('targetUid', '==', targetUid)
      .where('appliedBy', '==', 'system')
      .orderBy('appliedAt', 'desc')
      .limit(1)
      .get();
    if (!recent.empty) {
      const doc = recent.docs[0];
      if (doc) {
        await doc.ref.update({
          revokedBy: session.user.id,
          revokedAt: FieldValue.serverTimestamp(),
          revokedReason: reason,
        });
      }
    }

    await db.collection('moderation_logs').add({
      actorUid: session.user.id ?? 'admin',
      action: 'penalty_revoked',
      targetUid,
      metadata: { reason },
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/penalties');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'INTERNAL',
    };
  }
}

/**
 * 만료된 7일 정지 lazy 해제 — 사용자 로그인 또는 진입 시 호출 가능.
 * Cloud Function이 없는 V1 MVP의 fallback.
 */
export async function liftExpiredBan(uid: string): Promise<void> {
  if (!hasAdminCredentials()) return;
  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const data = snap.data();
    if (!data?.banned) return;
    const bannedUntil = data.bannedUntil as { toMillis(): number } | undefined;
    if (!bannedUntil) return;
    if (bannedUntil.toMillis() > Date.now()) return;

    await userRef.update({
      banned: false,
      bannedUntil: FieldValue.delete(),
      banReason: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await db.collection('moderation_logs').add({
      actorUid: 'system',
      action: 'auto_unban_expired',
      targetUid: uid,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // silent — 다음 진입 시 재시도
  }
}

// ─────────────────────────────────────────────────────────────────
// Internal: audit log helper
// ─────────────────────────────────────────────────────────────────

async function logAutoPenalty(
  targetUid: string,
  level: PenaltyLevel,
  reportedTotal: number,
  source: RecordReportInput,
): Promise<void> {
  try {
    const db = getAdminFirestore();
    const action =
      level === 'warning'
        ? 'auto_penalty_warning'
        : level === 'ban_7d'
          ? 'auto_penalty_7d'
          : 'auto_penalty_permanent';
    await db.collection('moderation_logs').add({
      actorUid: 'system',
      action,
      targetUid,
      metadata: {
        trigger: 'reported_total_threshold',
        threshold: PENALTY_THRESHOLDS[level],
        reportedTotal,
        source: source.source,
        sourceId: source.sourceId,
      },
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[logAutoPenalty] failed', err);
  }
}
