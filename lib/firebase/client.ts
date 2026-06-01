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
 *
 * Sprint 28 (F28-B 단계 5) — 동기 emulator wire:
 *  - 기존: dynamic import + fire-and-forget. getFirebaseApp() return 시점에
 *    connectAuthEmulator 미실행 → 다른 모듈이 getAuth(app) 호출 시 production
 *    endpoint 로 internal init 후 lock → 이후 connectAuthEmulator 가 throw →
 *    silent ignore → client Auth 가 production fetch → auth/network-request-failed.
 *  - 해결: static top-level import + 동기 wire. getFirebaseApp() return 시점에
 *    모든 emulator 가 wired. production 에선 isFirebaseEmulator() === false →
 *    wireEmulatorsIfEnabled 가 즉시 return → connect 호출 안 됨.
 *  - bundle: 4 모듈은 이미 lib/firebase/{auth,firestore,storage,realtime-db}.ts
 *    에서 사용되므로 client bundle 에 동일하게 포함. 변화 없음.
 */
import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';
import * as authMod from 'firebase/auth';
import * as firestoreMod from 'firebase/firestore';
import * as storageMod from 'firebase/storage';
import * as databaseMod from 'firebase/database';

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

/**
 * Sprint 14 F14-A — emulator 모드 여부 (서버/클라이언트 양쪽에서 일관)
 *
 * Sprint 28 F28-B 단계 15 — hostname-based fallback.
 * 이전: process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true' 만 검사.
 *   문제: Next.js dev mode + turbopack 환경에서 NEXT_PUBLIC_ env 가 client bundle
 *   에 inline 안 되는 경우 존재 (E2E webServer.env 명시했음에도 fail).
 *   결과: client-side isFirebaseEmulator() === false → wireEmulatorsIfEnabled 의
 *   module-load IIFE skip → emulator wire 미실행 → client SDK 가 production
 *   endpoint 사용 → auth/network-request-failed 4+ spec, chat/post seed render
 *   fail 7+ spec, storage download timeout 2 spec.
 * 수정: hostname=localhost + NODE_ENV!==production 인 경우 emulator 강제. production
 *   build 는 NODE_ENV=production 으로 fallback skip → 영향 0.
 */
export function isFirebaseEmulator(): boolean {
  if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true') return true;
  // Sprint 28 F28-B 단계 15 — NODE_ENV === 'development' 에서만 fallback.
  // 'test' (vitest jsdom) 는 strict 단위 테스트 보호. 'production' 도 skip.
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const { hostname, port } = window.location;
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '3000') {
      return true;
    }
  }
  return false;
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

/**
 * Sprint 28 F28-B 단계 5 — 동기 emulator wire.
 *
 * 이전 dynamic import + async fire-and-forget 패턴은 다음 race condition 유발:
 *  1. getFirebaseApp() 호출 → app 생성 → void wireEmulatorsIfEnabled(app) (fire-and-forget)
 *  2. caller 가 곧바로 getAuth(app) 호출 (예: lib/firebase/auth.ts)
 *  3. internal Auth 인스턴스가 production endpoint 로 init + lock
 *  4. 그 후 connectAuthEmulator(...) 호출 시 throw "Cannot connect ... after used"
 *  5. silent ignore → client SDK 가 production fetch → auth/network-request-failed
 *
 * 동기 wire 로 race window 제거.
 */
function wireEmulatorsIfEnabled(app: FirebaseApp): void {
  if (!isFirebaseEmulator() || emulatorWired) return;
  if (typeof window === 'undefined') return; // client only

  emulatorWired = true;

  // Sprint 28 F28-B 단계 9 — connectAuthEmulator throw 시 actual error 진단.
  // 단계 5 sync wire 후에도 auth/network-request-failed 12회 잔존 → 어떤 throw 가
  // silent catch 됨을 의미. window.__e2eFirebaseWireErrors 에 노출하여 spec 또는
  // chrome devtools 에서 actual cause 확인.
  const wireErrors: { module: string; error: string; stack?: string }[] = [];
  function tryWire(name: string, fn: () => void): void {
    try {
      fn();
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      const entry: { module: string; error: string; stack?: string } = {
        module: name,
        error: err.message,
      };
      if (err.stack !== undefined) entry.stack = err.stack;
      wireErrors.push(entry);
    }
  }

  tryWire('auth', () =>
    authMod.connectAuthEmulator(authMod.getAuth(app), 'http://localhost:9099', {
      disableWarnings: true,
    }),
  );
  tryWire('firestore', () =>
    firestoreMod.connectFirestoreEmulator(firestoreMod.getFirestore(app), 'localhost', 8080),
  );
  tryWire('storage', () =>
    storageMod.connectStorageEmulator(storageMod.getStorage(app), 'localhost', 9199),
  );
  tryWire('database', () =>
    databaseMod.connectDatabaseEmulator(databaseMod.getDatabase(app), 'localhost', 9000),
  );

  if (wireErrors.length > 0) {
    // CI artifact trace 에 console error 가 capture 됨 + spec 에서 직접 읽기 가능
    console.error('[F28-B] emulator wire errors:', wireErrors);
  }

  // Sprint 28 F28-B 단계 2 — E2E 전용 window expose.
  // 이전: Playwright spec 의 page.evaluate 안에서 `await import('firebase/auth')`
  //       시 bare module specifier resolve 실패 → 1주일째 broken (8회 잔존).
  // 해결: emulator 모드 (Production 영향 0) 에서만 client.ts 가 이미 번들된 module 을
  //       window.__e2eFirebase 에 노출. spec 의 page.evaluate 는 bare import 대신
  //       이 namespace 사용.
  // 보안: production / staging 에서는 isFirebaseEmulator() === false → expose 안 함.
  (window as unknown as { __e2eFirebase?: unknown }).__e2eFirebase = {
    app,
    auth: authMod,
    firestore: firestoreMod,
    storage: storageMod,
    database: databaseMod,
  };
  (window as unknown as { __e2eFirebaseWireErrors?: unknown }).__e2eFirebaseWireErrors = wireErrors;
}

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  const app = initializeApp(resolveFirebaseConfig());
  // Sprint 28 F28-B 단계 5 — 동기 wire (race condition 제거)
  wireEmulatorsIfEnabled(app);
  return app;
}

// Sprint 28 F28-B 단계 2 — emulator 모드에서 module load 시점에 자동 init.
//
// 이전 결함: E2E spec 의 loginAs() 가 page.goto('/') 후 window.__e2eFirebase 대기.
// 그러나 홈 페이지 / 가 firebase client SDK 를 즉시 사용 안 함 → getFirebaseApp()
// 미호출 → wireEmulatorsIfEnabled() 미실행 → window.__e2eFirebase 노출 안 됨 →
// waitForE2eFirebase timeout 60초 → loginAs throw → 모든 spec cascade fail.
//
// 해결: emulator 모드에서는 module load 직후 (페이지 진입 시 client.ts 가 import 되면)
// 자동으로 getFirebaseApp() 호출 → wireEmulatorsIfEnabled() 자동 실행 → window 노출.
//
// 보안: production / staging 은 isFirebaseEmulator() === false → 이 분기 실행 안 됨.
// typeof window check: SSR 시점 (server-side) 에는 실행 안 됨.
if (typeof window !== 'undefined' && isFirebaseEmulator()) {
  getFirebaseApp();
}
