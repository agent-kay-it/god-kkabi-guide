/**
 * Realtime DB 채팅 메시지 전송 (Client SDK).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §6 + auth-flow.md §custom-claims
 *
 * 동작:
 *  - RTDB chat/messages/{channelId}/{messageId} 에 push
 *  - 인증된 사용자(Firebase Auth)만 write 가능 (RTDB rules)
 *  - 마스킹은 클라이언트 사전 처리 (containsBadWord 검사 + 텍스트 교체)
 *  - 이미지 URL은 별도로 lib/chat/image-upload.ts에서 발급
 *
 * 보안:
 *  - Firebase Auth uid가 NextAuth session.user.id와 일치하도록 Custom Token bridge 가정
 *  - Storage에 업로드된 URL만 허용 (RTDB rules에서 정규식 검증 — P3.D.4)
 */
'use client';

import { push, ref, serverTimestamp } from 'firebase/database';

import { getRealtimeDB } from '@/lib/firebase/realtime-db';
import { maskBadWords } from './masking';
import type { ChatMessage } from '@/types/chat';

export interface SendMessageInput {
  readonly channelId: string;
  readonly content: string;
  readonly imageUrl?: string;
  readonly author: {
    readonly uid: string;
    readonly nickname: string;
    readonly classId?: 'warrior' | 'swordsman' | 'medium';
    readonly role?: 'admin' | 'user';
  };
}

export interface SendMessageResult {
  readonly ok: boolean;
  readonly messageId?: string;
  readonly error?: 'EMPTY' | 'TOO_LONG' | 'RTDB_FAILED';
  readonly message?: string;
}

const MAX_MESSAGE_LENGTH = 500;

export async function sendChatMessage(
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const trimmed = input.content.trim();
  if (!trimmed && !input.imageUrl) {
    return { ok: false, error: 'EMPTY' };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: 'TOO_LONG' };
  }

  const masked = maskBadWords(trimmed);

  try {
    const db = getRealtimeDB();
    const messagesRef = ref(db, `chat/messages/${input.channelId}`);
    const payload: Omit<ChatMessage, 'id'> = {
      channelId: input.channelId,
      authorUid: input.author.uid,
      authorNickname: input.author.nickname,
      ...(input.author.classId ? { authorClassId: input.author.classId } : {}),
      ...(input.author.role ? { authorRole: input.author.role } : {}),
      content: masked,
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      createdAt: 0, // serverTimestamp() 자리표시자 — push 시 RTDB에서 채움
    };
    const newRef = await push(messagesRef, {
      ...payload,
      createdAt: serverTimestamp(),
    });
    return newRef.key ? { ok: true, messageId: newRef.key } : { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: 'RTDB_FAILED',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
