/**
 * Sprint 28 F28-B 단계 2 — Firebase Admin SDK 공유 init helper.
 *
 * 목적: 모든 e2e helper (auth-token-helper / test-chat-helpers /
 * test-storage-helpers) 가 동일한 admin app config 를 사용하도록 통합.
 *
 * 이전 결함 (90회 E2E 에러 원인):
 *   - 3 파일이 각자 `admin.initializeApp(...)` 호출
 *   - 각자 일부 config 만 명시 (databaseURL OR storageBucket)
 *   - 먼저 init 한 파일이 잡은 app 이 그 후 다른 파일에서 그대로 재사용
 *     (admin.apps.length > 0 분기) → 누락된 config 의 호출은 throw
 *
 * 해결: 단일 helper `ensureE2eAdmin()` 이 모든 emulator 설정을 한 번에 명시.
 * 어느 helper 가 먼저 호출되어도 일관된 admin app 사용 보장.
 *
 * 적용 범위:
 *   - Firebase Auth Emulator (localhost:9099)
 *   - Firestore Emulator (localhost:8080) — Admin SDK 자동 인식
 *   - Realtime Database Emulator (localhost:9000)
 *   - Storage Emulator (localhost:9199)
 *
 * 보안: e2e/ 하위 전용. 본 helper 는 Next.js bundle 에 포함되지 않음.
 */
import admin from 'firebase-admin';

const PROJECT_ID = 'demo-kkaebizigi-test';
const DATABASE_URL = 'http://localhost:9000?ns=demo-kkaebizigi-test';
const STORAGE_BUCKET = 'demo-kkaebizigi-test.appspot.com';

/**
 * 모든 emulator host env 와 admin app config 를 1 회만 설정.
 * 두 번째 이후 호출은 기존 app 반환 — 단, 이전에 본 helper 가 init 한 경우만
 * 일관성 보장됨. (직접 admin.initializeApp 을 호출하는 다른 코드가 있으면 race.)
 */
export function ensureE2eAdmin(): admin.app.App {
  // emulator host env — admin SDK 가 init 전후 모두 인식 (init 후엔 무시되지만
  // process 시작 시점에 set 되어야 admin 가 emulator 로 라우팅).
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST ?? 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST ?? 'localhost:8080';
  process.env.FIREBASE_DATABASE_EMULATOR_HOST =
    process.env.FIREBASE_DATABASE_EMULATOR_HOST ?? 'localhost:9000';
  process.env.STORAGE_EMULATOR_HOST =
    process.env.STORAGE_EMULATOR_HOST ?? 'http://localhost:9199';

  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    projectId: PROJECT_ID,
    databaseURL: DATABASE_URL,
    storageBucket: STORAGE_BUCKET,
  });
}

/** 외부에서 emulator project id 가 필요한 경우 single source. */
export const E2E_ADMIN_PROJECT_ID = PROJECT_ID;
export const E2E_ADMIN_DATABASE_URL = DATABASE_URL;
export const E2E_ADMIN_STORAGE_BUCKET = STORAGE_BUCKET;
