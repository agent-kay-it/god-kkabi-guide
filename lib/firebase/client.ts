/**
 * Firebase App 초기화 — Ports & Adapters 경계.
 * 출처: docs/sprint/02-sprint-mvp/design.md §10.2.1
 *
 * 규칙:
 *  - Firebase SDK 의존성은 본 디렉토리(`lib/firebase/*`)에만 격리.
 *  - 도메인/UI 레이어는 본 디렉토리를 통해서만 Firebase에 접근.
 *  - 환경변수는 tene가 주입 (CLAUDE.md tene policy 준수).
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

function resolveFirebaseConfig(): FirebaseOptions {
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

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(resolveFirebaseConfig());
}
