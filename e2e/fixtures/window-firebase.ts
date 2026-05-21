/**
 * Sprint 28 F28-B 단계 2 — E2E 전용 window.__e2eFirebase 타입.
 *
 * lib/firebase/client.ts 의 emulator 분기에서 window 에 expose 한 firebase
 * client SDK module 들의 타입 선언.
 *
 * 모든 e2e spec 의 page.evaluate 안에서 `window.__e2eFirebase` 로 접근.
 * 이전 bare specifier `await import('firebase/auth')` 가 브라우저 컨텍스트
 * 에서 resolve 안 되는 문제 회피.
 *
 * 사용법:
 *   await page.waitForFunction(() => Boolean((window as any).__e2eFirebase?.auth));
 *   const uid = await page.evaluate(() => {
 *     const fb = (window as any).__e2eFirebase;
 *     return fb.auth.getAuth().currentUser?.uid ?? null;
 *   });
 */
import type { Page } from '@playwright/test';
import type * as FirebaseAuth from 'firebase/auth';
import type * as FirebaseFirestore from 'firebase/firestore';
import type * as FirebaseStorage from 'firebase/storage';
import type * as FirebaseDatabase from 'firebase/database';

/**
 * page.evaluate 안에서 사용할 namespace 의 형태 (런타임 검증용 안내 타입).
 * lib/firebase/client.ts 가 동적 import 한 module 객체를 그대로 노출하므로
 * 형 검사보다는 함수 접근 용도. spec 안에서는 (window as any).__e2eFirebase 로 사용.
 */
export interface E2eFirebaseNamespace {
  readonly app: unknown;
  readonly auth: typeof FirebaseAuth | null;
  readonly firestore: typeof FirebaseFirestore | null;
  readonly storage: typeof FirebaseStorage | null;
  readonly database: typeof FirebaseDatabase | null;
}

/**
 * page.evaluate 호출 전에 window.__e2eFirebase 가 준비될 때까지 대기.
 *
 * Sprint 28 F28-B 단계 17 — emulator wire idempotent 강제.
 * wireErrors 가 빈 array 임에도 client SDK 가 production endpoint 사용하는 잔여
 * 케이스 (Next.js dev + turbopack 의 module evaluation 순서 race 가능성). spec 의
 * page.evaluate 안에서 명시 connectAuthEmulator/Firestore/Storage/Database 호출
 * (try-catch 로 idempotent) → 이미 wired 면 throw 무시, 아니면 강제 wire.
 *
 * 이 호출이 page.evaluate signInWithCustomToken / getIdToken / getDownloadURL 등
 * 모든 client SDK 사용 전에 실행되도록 spec 안 helper.
 */
export async function waitForE2eFirebase(page: Page, timeoutMs = 10000): Promise<void> {
  await page.waitForFunction(
    () => {
      const fb = (window as unknown as { __e2eFirebase?: { auth?: unknown } }).__e2eFirebase;
      return Boolean(fb?.auth);
    },
    { timeout: timeoutMs },
  );

  // 명시 connectAuthEmulator/... 호출 — 이미 wired 면 silent throw → catch 무시.
  // Next.js dev + turbopack 의 module evaluation 순서 race condition 대응 (단계 5
  // sync wire 가 안 동작하는 잔여 케이스 보호).
  await page.evaluate(() => {
    const fb = (window as unknown as {
      __e2eFirebase?: {
        app: unknown;
        auth?: {
          getAuth: (app: unknown) => unknown;
          connectAuthEmulator: (auth: unknown, url: string, opts?: unknown) => void;
        };
        firestore?: {
          getFirestore: (app: unknown) => unknown;
          connectFirestoreEmulator: (db: unknown, host: string, port: number) => void;
        };
        storage?: {
          getStorage: (app: unknown) => unknown;
          connectStorageEmulator: (storage: unknown, host: string, port: number) => void;
        };
        database?: {
          getDatabase: (app: unknown) => unknown;
          connectDatabaseEmulator: (db: unknown, host: string, port: number) => void;
        };
      };
    }).__e2eFirebase;
    if (!fb) return;
    try {
      fb.auth?.connectAuthEmulator(fb.auth.getAuth(fb.app), 'http://localhost:9099', {
        disableWarnings: true,
      });
    } catch {
      // already wired or instance used
    }
    try {
      fb.firestore?.connectFirestoreEmulator(fb.firestore.getFirestore(fb.app), 'localhost', 8080);
    } catch {}
    try {
      fb.storage?.connectStorageEmulator(fb.storage.getStorage(fb.app), 'localhost', 9199);
    } catch {}
    try {
      fb.database?.connectDatabaseEmulator(fb.database.getDatabase(fb.app), 'localhost', 9000);
    } catch {}
  });
}
