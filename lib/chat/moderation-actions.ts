/**
 * Chat 메시지 모더레이션 액션 — admin 전용 Server Actions.
 * 출처: docs/sprint/10-sprint-launch/design.md §4 (RTDB rules: keptByOperator/deletedByOperator)
 *      + Task #27
 *
 * 책임:
 *  - hideMessage: 신고 누적 전이라도 admin이 즉시 숨김 (hidden=true)
 *  - keepMessage: 자동 숨김된 메시지를 운영자 검토 후 유지 결정 (keptByOperator=true, hidden=false)
 *  - deleteMessage: 메시지 완전 삭제 (deletedByOperator=true + hidden=true — RTDB 노드는 유지하여 신고 trail 보존)
 *
 * 본 액션은 기존 lib/moderation/actions.ts resolveReport와 별개 — context menu에서
 * 신고 → 결정 흐름이 아닌, admin이 채팅 채널에서 직접 호출하는 quick action.
 *
 * 보안:
 *  - requireAdmin 게이트 (role=admin)
 *  - RTDB rules에서도 hidden/keptByOperator/deletedByOperator 필드는 admin만 write 가능
 *  - 모든 액션은 moderation_logs 에 actorUid + targetMessageId 기록
 *
 * channelId는 validateChannelId로 정규식 검증 (path traversal 방어).
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { auth } from '@/lib/auth/auth';
import {
  getAdminDatabase,
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { validateChannelId } from './channel-resolver';

export type ChatModerationResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INVALID_CHANNEL'
        | 'INVALID_MESSAGE_ID'
        | 'INTERNAL';
      message?: string;
    };

async function requireAdmin(): Promise<
  { ok: true; uid: string } | { ok: false; result: ChatModerationResult }
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

/** RTDB 메시지 ID 형식 검증 — push key는 `-Xxxx...` 영숫자/하이픈/언더스코어. */
const RTDB_PUSH_KEY_REGEX = /^[A-Za-z0-9_-]{1,32}$/;

function validateMessageId(id: string): boolean {
  return typeof id === 'string' && RTDB_PUSH_KEY_REGEX.test(id);
}

async function logChatModeration(
  actorUid: string,
  action: 'chat_hide' | 'chat_keep' | 'chat_delete',
  channelId: string,
  messageId: string,
): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('moderation_logs').add({
      actorUid,
      action,
      targetUid: null,
      metadata: { channelId, messageId },
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[chat moderation_logs] failed', err);
  }
}

/** admin: 메시지 즉시 숨김 (신고 누적 우회). */
export async function hideMessage(
  messageId: string,
  channelId: string,
): Promise<ChatModerationResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.result;
  if (!validateChannelId(channelId)) {
    return { ok: false, error: 'INVALID_CHANNEL' };
  }
  if (!validateMessageId(messageId)) {
    return { ok: false, error: 'INVALID_MESSAGE_ID' };
  }
  try {
    const rtdb = getAdminDatabase();
    await rtdb
      .ref(`chat/messages/${channelId}/${messageId}`)
      .update({ hidden: true, keptByOperator: false });
    await logChatModeration(guard.uid, 'chat_hide', channelId, messageId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}

/** admin: 자동 숨김 메시지를 유지 결정 (hidden=false, keptByOperator=true). */
export async function keepMessage(
  messageId: string,
  channelId: string,
): Promise<ChatModerationResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.result;
  if (!validateChannelId(channelId)) {
    return { ok: false, error: 'INVALID_CHANNEL' };
  }
  if (!validateMessageId(messageId)) {
    return { ok: false, error: 'INVALID_MESSAGE_ID' };
  }
  try {
    const rtdb = getAdminDatabase();
    await rtdb
      .ref(`chat/messages/${channelId}/${messageId}`)
      .update({ hidden: false, keptByOperator: true });
    await logChatModeration(guard.uid, 'chat_keep', channelId, messageId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}

/** admin: 메시지 완전 삭제 (deletedByOperator=true, RTDB 노드는 보존 — 신고 trail). */
export async function deleteMessage(
  messageId: string,
  channelId: string,
): Promise<ChatModerationResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.result;
  if (!validateChannelId(channelId)) {
    return { ok: false, error: 'INVALID_CHANNEL' };
  }
  if (!validateMessageId(messageId)) {
    return { ok: false, error: 'INVALID_MESSAGE_ID' };
  }
  try {
    const rtdb = getAdminDatabase();
    await rtdb
      .ref(`chat/messages/${channelId}/${messageId}`)
      .update({ deletedByOperator: true, hidden: true });
    await logChatModeration(guard.uid, 'chat_delete', channelId, messageId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
