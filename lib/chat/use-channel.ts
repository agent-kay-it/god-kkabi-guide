/**
 * useChannel — React hook으로 RTDB 채팅 채널 구독.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §6 (Realtime DB onValue)
 *
 * 사용 예:
 *   const { messages, isLoading, error } = useChannel('global', 50);
 *
 * 정책:
 *  - 최근 N개 메시지만 구독 (limitToLast)
 *  - 컴포넌트 unmount 시 구독 자동 해제
 *  - hidden=true 메시지는 클라이언트에서 필터 (운영자만 보임)
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  endBefore,
  get,
  limitToLast,
  off,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  orderByKey,
  query,
  ref,
  type DataSnapshot,
} from 'firebase/database';

import { getRealtimeDB } from '@/lib/firebase/realtime-db';
import type { ChatMessage } from '@/types/chat';

/** 빈 채널일 때 isLoading=false로 강제 전환하는 fallback 지연 (ms) */
const EMPTY_CHANNEL_FALLBACK_MS = 5_000;

interface UseChannelOptions {
  /** 최대 메시지 수 (기본 50) */
  readonly limit?: number;
  /** 관리자 보기 (hidden 메시지도 표시) */
  readonly isAdmin?: boolean;
}

export interface UseChannelResult {
  readonly messages: readonly ChatMessage[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly loadOlder: () => Promise<void>;
  readonly hasMore: boolean;
}

export function useChannel(
  channelId: string,
  options: UseChannelOptions = {},
): UseChannelResult {
  const { limit = 50, isAdmin = false } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const oldestKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setMessages([]);

    let db;
    try {
      db = getRealtimeDB();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'RTDB unavailable');
      setIsLoading(false);
      return;
    }

    const messagesRef = ref(db, `chat/messages/${channelId}`);
    const q = query(messagesRef, orderByKey(), limitToLast(limit));

    const handleAdded = (snap: DataSnapshot) => {
      const msg = toChatMessage(snap);
      if (!msg) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const next = [...prev, msg].sort((a, b) => a.createdAt - b.createdAt);
        if (!oldestKeyRef.current || (next[0] && next[0].id < oldestKeyRef.current)) {
          oldestKeyRef.current = next[0]?.id ?? null;
        }
        return next;
      });
      setIsLoading(false);
      setHasMore(true);
    };

    const handleChanged = (snap: DataSnapshot) => {
      const msg = toChatMessage(snap);
      if (!msg) return;
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    };

    const handleRemoved = (snap: DataSnapshot) => {
      setMessages((prev) => prev.filter((m) => m.id !== snap.key));
    };

    onChildAdded(q, handleAdded);
    onChildChanged(q, handleChanged);
    onChildRemoved(q, handleRemoved);

    // 빈 채널 처리 (EMPTY_CHANNEL_FALLBACK_MS 후 isLoading=false)
    const fallback = window.setTimeout(
      () => setIsLoading(false),
      EMPTY_CHANNEL_FALLBACK_MS,
    );

    return () => {
      window.clearTimeout(fallback);
      off(q);
    };
  }, [channelId, limit]);

  /** 더 오래된 메시지 로드 — endBefore(oldestKey)로 추가 50개 */
  async function loadOlder(): Promise<void> {
    if (!oldestKeyRef.current) return;
    try {
      const db = getRealtimeDB();
      const messagesRef = ref(db, `chat/messages/${channelId}`);
      const q = query(
        messagesRef,
        orderByKey(),
        endBefore(oldestKeyRef.current),
        limitToLast(limit),
      );
      const snap = await get(q);
      if (!snap.exists()) {
        setHasMore(false);
        return;
      }
      const older: ChatMessage[] = [];
      snap.forEach((childSnap) => {
        const msg = toChatMessage(childSnap);
        if (msg) older.push(msg);
      });
      older.sort((a, b) => a.createdAt - b.createdAt);
      if (older.length === 0) {
        setHasMore(false);
        return;
      }
      oldestKeyRef.current = older[0]?.id ?? oldestKeyRef.current;
      setMessages((prev) => [...older, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed');
    }
  }

  const visibleMessages = isAdmin
    ? messages
    : messages.filter((m) => !m.deletedByOperator && (!m.hidden || m.keptByOperator));

  return {
    messages: visibleMessages,
    isLoading,
    error,
    loadOlder,
    hasMore,
  };
}

function toChatMessage(snap: DataSnapshot): ChatMessage | null {
  const value = snap.val();
  if (!value || typeof value !== 'object' || !snap.key) return null;
  return {
    id: snap.key,
    channelId: value.channelId ?? '',
    authorUid: value.authorUid ?? '',
    authorNickname: value.authorNickname ?? '?',
    authorClassId: value.authorClassId,
    authorRole: value.authorRole,
    content: value.content ?? '',
    imageUrl: value.imageUrl,
    createdAt: value.createdAt ?? 0,
    hidden: Boolean(value.hidden),
    keptByOperator: Boolean(value.keptByOperator),
    deletedByOperator: Boolean(value.deletedByOperator),
  };
}
