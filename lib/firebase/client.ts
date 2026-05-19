/**
 * Firebase App 초기화 — Ports & Adapters 경계.
 * 출처: docs/sprint/02-sprint-mvp/design.md §10.2.1 + sprint 14/design.md §1
 *
 * 규칙:
 *  - Firebase SDK 의존성은 본 디렉토리(`lib/firebase/*`)에만 격리.
 *  - 도메인/UI 레이어는 본 디렉토리를 통해서만 Firebase에 접근.
 *  - 환경변수는 tene가 주입 (CLAUDE.md tene policy 준수).
 *
 * Sprint 14 (F14-A) — Emulator 분기:
 *  - NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true 시 demo-kkaebizigi-test 더미 프로젝트
 *  - Auth/Firestore/Storage/RTDB 모두 localhost 포트로 자동 연결
 *  - default false (staging+prod 영향 없음)
 */
import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';

interface FirebaseEnv {
  readonly apiKey: string | undefined;
  readonly authDomain: string | undefined;
  readonly projectId: string | undefined;
  readonly storageBucket: string | undefined;
  readonly messagingSenderId: string | undefined;
  readonly appId: string | undefined;
  readonly measurementId: string | undefined;
}

function readFirebaseEnv(): FirebaseEnv {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

/** Sprint 14 F14-A — emulator 모드 여부 (서버/클라이언트 양쪽에서 일관) */
export function isFirebaseEmulator(): boolean {
  return process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true';
}

function resolveFirebaseConfig(): FirebaseOptions {
  if (isFirebaseEmulator()) {
    return {
      apiKey: 'demo-api-key',
      authDomain: 'demo-kkaebizigi-test.firebaseapp.com',
      projectId: 'demo-kkaebizigi-test',
      storageBucket: 'demo-kkaebizigi-test.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000',
      databaseURL: 'http://localhost:9000?ns=demo-kkaebizigi-test',
    };
  }

  const env = readFirebaseEnv();
  const missing = Object.entries(env)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Firebase config missing: ${missing.join(', ')}. Run with \`tene run --\` to inject secrets.`,
    );
  }

  return {
    apiKey: env.apiKey as string,
    authDomain: env.authDomain as string,
    projectId: env.projectId as string,
    storageBucket: env.storageBucket as string,
    messagingSenderId: env.messagingSenderId as string,
    appId: env.appId as string,
    measurementId: env.measurementId as string,
  };
}

/** emulator 연결 1회만 시도 (HMR 재실행 시 중복 throw 방지) */
let emulatorWired = false;

async function wireEmulatorsIfEnabled(app: FirebaseApp): Promise<void> {
  if (!isFirebaseEmulator() || emulatorWired) return;
  if (typeof window === 'undefined') return; // client only

  emulatorWired = true;

  try {
    const { connectAuthEmulator, getAuth } = await import('firebase/auth');
    connectAuthEmulator(getAuth(app), 'http://localhost:9099', {
      disableWarnings: true,
    });
  } catch {
    // 이미 연결됨 / 모듈 없음 — 무시
  }
  try {
    const { connectFirestoreEmulator, getFirestore } = await import('firebase/firestore');
    connectFirestoreEmulator(getFirestore(app), 'localhost', 8080);
  } catch {}
  try {
    const { connectStorageEmulator, getStorage } = await import('firebase/storage');
    connectStorageEmulator(getStorage(app), 'localhost', 9199);
  } catch {}
  try {
    const { connectDatabaseEmulator, getDatabase } = await import('firebase/database');
    connectDatabaseEmulator(getDatabase(app), 'localhost', 9000);
  } catch {}
}

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  const app = initializeApp(resolveFirebaseConfig());
  // 비동기 wire — emulator 모드일 때만 의미 있음, fire-and-forget
  void wireEmulatorsIfEnabled(app);
  return app;
}
