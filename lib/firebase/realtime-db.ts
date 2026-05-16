/**
 * Firebase Realtime Database client SDK 어댑터.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §6 (Hybrid Chat backend — Realtime DB)
 *
 * 책임:
 *  - getDatabase() 1회 lazy init (Client SDK)
 *  - 채팅 메시지 송수신/구독에만 사용 (다른 도메인 데이터는 Firestore)
 *
 * 환경변수: NEXT_PUBLIC_FIREBASE_DATABASE_URL (Spark Plan 활성화 후 등록)
 *
 * 사용 예:
 *   const db = getRealtimeDB();
 *   const messagesRef = ref(db, `chat/messages/${channelId}`);
 *   onValue(messagesRef, (snap) => { ... });
 */
'use client';

import { getDatabase, type Database } from 'firebase/database';
import { getFirebaseApp } from './client';

export function getRealtimeDB(): Database {
  const app = getFirebaseApp();
  const databaseURL =
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
    `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`;
  return getDatabase(app, databaseURL);
}

export function hasRealtimeDB(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}
