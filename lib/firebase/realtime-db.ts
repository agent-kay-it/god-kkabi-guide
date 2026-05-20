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
import { getFirebaseApp, isFirebaseEmulator } from './client';

export function getRealtimeDB(): Database {
  const app = getFirebaseApp();
  // Sprint 28 F28-B — emulator 모드는 client.ts FirebaseOptions.databaseURL
  // (http://localhost:9000?ns=demo-kkaebizigi-test) 를 그대로 사용한다.
  // 명시 URL 두번째 인자는 app config 를 override 하므로 emulator 환경에서는 생략.
  //
  // 이전 코드 결함 (E2E 70회 "Can't determine Firebase Database URL" 에러 원인):
  //   - E2E webServer command env 에 NEXT_PUBLIC_FIREBASE_DATABASE_URL 미설정
  //   - NEXT_PUBLIC_FIREBASE_PROJECT_ID 도 미설정
  //   - fallback URL → 'https://undefined-default-rtdb.asia-southeast1.firebasedatabase.app'
  //   - getDatabase(app, 잘못된URL) → emulator config 의 localhost:9000 가 override 됨 → throw
  if (isFirebaseEmulator()) {
    return getDatabase(app);
  }
  const databaseURL =
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
    `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`;
  return getDatabase(app, databaseURL);
}

export function hasRealtimeDB(): boolean {
  // emulator 모드는 항상 RTDB 사용 가능 (env 의존성 X)
  if (isFirebaseEmulator()) return true;
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}
