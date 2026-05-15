/**
 * 모더레이션 Server Actions — 운영자 콘솔에서 호출.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §14 + firestore-schema.md §2.13 (moderation_logs)
 *
 * 권한: role=admin 필수.
 *
 * 액션:
 *  - banUser: 사용자 정지 (custom claim role=banned + users.banned=true)
 *  - unbanUser: 정지 해제
 *  - resetUser: 닉네임/문파/직업 초기화 후 재등록 유도 (registered=false)
 *  - resolveReport: 메시지 신고 처리 (delete / keep_by_operator)
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth/auth';
import {
  getAdminDatabase,
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';

export type ModerationResult =
  | { ok: true; message?: string }
  | {
      ok: false;
      error: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ADMIN_NOT_CONFIGURED' | 'NOT_FOUND' | 'INTERNAL';
      message?: string;
    };

async function requireAdmin(): Promise<
  { ok: true; uid: string } | { ok: false; result: ModerationResult }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, result: { ok: false, error: 'UNAUTHENTICATED' } };
  }
  if (session.user.role !== 'admin') {
    return { ok: false, result: { ok: false, error: 'FORBIDDEN' } };
  }
  if (!hasAdminCredentials()) {
    return { ok: false, result: { ok: false, error: 'ADMIN_NOT_CONFIGURED' } };
  }
  return { ok: true, uid: session.user.id };
}

async function logModeration(
  actorUid: string,
  action: string,
  targetUid: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('moderation_logs').add({
      actorUid,
      action,
      targetUid,
      metadata,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[moderation_logs] failed', err);
  }
}

export async function banUser(
  targetUid: string,
  reason: string,
): Promise<ModerationResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.result;

  try {
    const db = getAdminFirestore();
    await db.collection('users').doc(targetUid).update({
      banned: true,
      banReason: reason || '운영자 정지',
      updatedAt: FieldValue.serverTimestamp(),
    });
    // Sprint V3 P3.A (CA2-I11): retry queue로 일시 장애 대비.
    await setUserClaimsWithRetry(targetUid, {
      role: 'banned',
      bannedReason: reason || '운영자 정지',
    });
    await logModeration(guard.uid, 'ban', targetUid, { reason });
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}

export async function unbanUser(targetUid: string): Promise<ModerationResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.result;

  try {
    const db = getAdminFirestore();
    await db.collection('users').doc(targetUid).update({
      banned: false,
      banReason: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // Sprint V3 P3.A (CA2-I11): retry queue로 일시 장애 대비.
    await setUserClaimsWithRetry(targetUid, { role: 'user' });
    await logModeration(guard.uid, 'unban', targetUid);
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}

/**
 * 사용자 재등록 강제 — 닉네임/문파/직업 초기화 + registered=false.
 * 등록 폼 재진입 시 새 값 입력 강제. gameUid는 변경 불가.
 */
export async function resetUserRegistration(
  targetUid: string,
): Promise<ModerationResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.result;

  try {
    const db = getAdminFirestore();
    await db.collection('users').doc(targetUid).update({
      registered: false,
      nickname: FieldValue.delete(),
      munpa: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await logModeration(guard.uid, 'reset_registration', targetUid);
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}

export async function resolveReport(
  reportId: string,
  decision: 'kept_by_operator' | 'deleted',
  messageId: string,
  channelId: string,
): Promise<ModerationResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.result;

  try {
    const db = getAdminFirestore();
    await db.collection('chat_reports').doc(reportId).update({
      resolved: decision,
      resolvedBy: guard.uid,
      resolvedAt: FieldValue.serverTimestamp(),
    });

    // RTDB 메시지 처리
    try {
      const rtdb = getAdminDatabase();
      const ref = rtdb.ref(`chat/messages/${channelId}/${messageId}`);
      if (decision === 'deleted') {
        await ref.update({ deletedByOperator: true, hidden: true });
      } else {
        await ref.update({ keptByOperator: true, hidden: false });
      }
    } catch (err) {
      console.error('[resolveReport] RTDB update failed', err);
    }

    await logModeration(guard.uid, `resolve_${decision}`, null, {
      reportId,
      messageId,
      channelId,
    });
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// 운영자 콘솔 데이터 조회 (Server Component에서 직접 호출)
// ─────────────────────────────────────────────────────────────────

export interface PendingReportSummary {
  readonly id: string;
  readonly messageId: string;
  readonly channelId: string;
  readonly reporterUid: string;
  readonly reportedUid: string;
  readonly reasons: readonly string[];
  readonly messageSnapshot: string;
  readonly imageUrl?: string;
  readonly extraText?: string;
  readonly createdAtMs: number;
}

export async function listPendingReports(): Promise<readonly PendingReportSummary[]> {
  const session = await auth();
  if (session?.user?.role !== 'admin' || !hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('chat_reports')
      .where('resolved', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    return snap.docs.map((doc) => {
      const data = doc.data() as {
        messageId: string;
        channelId: string;
        reporterUid: string;
        reportedUid: string;
        reasons?: string[];
        message_snapshot?: string;
        imageUrl?: string;
        extraText?: string;
        createdAt?: FirebaseFirestore.Timestamp;
      };
      return {
        id: doc.id,
        messageId: data.messageId,
        channelId: data.channelId,
        reporterUid: data.reporterUid,
        reportedUid: data.reportedUid,
        reasons: data.reasons ?? [],
        messageSnapshot: data.message_snapshot ?? '',
        ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
        ...(data.extraText ? { extraText: data.extraText } : {}),
        createdAtMs: data.createdAt?.toMillis() ?? 0,
      };
    });
  } catch {
    return [];
  }
}

export interface BannedUserSummary {
  readonly uid: string;
  readonly nickname?: string;
  readonly serverId?: string;
  readonly munpa?: string;
  readonly banReason?: string;
}

export async function listBannedUsers(): Promise<readonly BannedUserSummary[]> {
  const session = await auth();
  if (session?.user?.role !== 'admin' || !hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('users')
      .where('banned', '==', true)
      .limit(50)
      .get();
    return snap.docs.map((doc) => {
      const data = doc.data() as {
        uid: string;
        nickname?: string;
        serverId?: string;
        munpa?: string;
        banReason?: string;
      };
      return {
        uid: data.uid,
        ...(data.nickname ? { nickname: data.nickname } : {}),
        ...(data.serverId ? { serverId: data.serverId } : {}),
        ...(data.munpa ? { munpa: data.munpa } : {}),
        ...(data.banReason ? { banReason: data.banReason } : {}),
      };
    });
  } catch {
    return [];
  }
}
