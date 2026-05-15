/**
 * 채팅 메시지 신고 Server Action.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/firestore-schema.md §2.5 (chat_reports)
 *      + design.md §14 (모더레이션)
 *
 * 정책:
 *  - 같은 메시지를 같은 사용자가 신고 → 1회만 인정
 *  - 누적 3건 시 RTDB 메시지에 hidden=true 자동 마킹 (운영자 검토 전까지 자동 숨김)
 *  - 운영자가 keptByOperator=true 처리 시 hidden 우회
 *  - 자기 신고 차단 (보안 룰 + Server Action 양쪽)
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
import { recordReport } from '@/lib/penalty/actions';
import type { ChatReportInput, ReportReason } from '@/types/chat';

const AUTO_HIDE_THRESHOLD = 3;

export type ReportResult =
  | { ok: true; autoHidden: boolean }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'SELF_REPORT'
        | 'ADMIN_NOT_CONFIGURED'
        | 'NO_REASON'
        | 'INTERNAL';
      message?: string;
    };

export async function reportChatMessage(
  input: ChatReportInput,
): Promise<ReportResult> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'UNAUTHENTICATED' };
  if (!session?.user?.registered) return { ok: false, error: 'NOT_REGISTERED' };
  if (input.reportedUid === uid) return { ok: false, error: 'SELF_REPORT' };
  if (input.reasons.length === 0) return { ok: false, error: 'NO_REASON' };
  if (!hasAdminCredentials()) {
    return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  }

  try {
    const db = getAdminFirestore();
    const reportId = `${input.messageId}__${uid}`;
    const reportRef = db.collection('chat_reports').doc(reportId);
    const messageCountRef = db
      .collection('chat_report_counts')
      .doc(input.messageId);

    let autoHidden = false;

    await db.runTransaction(async (tx) => {
      const existing = await tx.get(reportRef);
      if (existing.exists) {
        return; // 중복 신고 차단
      }
      const countSnap = await tx.get(messageCountRef);
      const currentCount = (countSnap.data()?.count as number | undefined) ?? 0;

      tx.set(reportRef, {
        id: reportId,
        messageId: input.messageId,
        channelId: input.channelId,
        reporterUid: uid,
        reportedUid: input.reportedUid,
        reasons: input.reasons as ReportReason[],
        message_snapshot: input.messageSnapshot,
        ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
        ...(input.extraText ? { extraText: input.extraText } : {}),
        resolved: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(
        messageCountRef,
        {
          messageId: input.messageId,
          channelId: input.channelId,
          count: currentCount + 1,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      autoHidden = currentCount + 1 >= AUTO_HIDE_THRESHOLD;
    });

    if (autoHidden) {
      // RTDB에 hidden=true 마킹 (Admin SDK)
      try {
        const rtdb = getAdminDatabase();
        await rtdb
          .ref(`chat/messages/${input.channelId}/${input.messageId}`)
          .update({ hidden: true });
      } catch (err) {
        // RTDB 마킹 실패 시 신고는 성공 처리 (운영자 큐에 들어가므로 사후 처리 가능)
        console.error('[reportChatMessage] RTDB hidden mark failed', err);
      }
    }

    // Sprint V1: 사용자 누적 신고 페널티 자동화 트리거
    await recordReport({
      targetUid: input.reportedUid,
      source: 'chat',
      sourceId: input.messageId,
    });

    revalidatePath('/admin');
    return { ok: true, autoHidden };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
