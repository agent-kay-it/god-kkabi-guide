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
 * lib/firebase/client.ts 의 wireEmulatorsIfEnabled() 가 동기 sync 라서 module
 * load 후 즉시 노출.
 *
 * Sprint 28 F28-B 단계 16 — wire 진단.
 * window.__e2eFirebaseWireErrors 가 length>0 면 connectXxxEmulator throw 가 발생.
 * 그 경우 client SDK 가 production endpoint 사용 → spec 호출 시 fail. 명시적으로
 * spec 가 fail 하면서 wire errors 를 message 에 포함 → CI artifact 에 진단 evidence.
 */
export async function waitForE2eFirebase(page: Page, timeoutMs = 10000): Promise<void> {
  await page.waitForFunction(
    () => {
      const fb = (window as unknown as { __e2eFirebase?: { auth?: unknown } }).__e2eFirebase;
      return Boolean(fb?.auth);
    },
    { timeout: timeoutMs },
  );

  // 진단: wire error 가 있으면 명시 fail (silent catch 의 root cause 추적).
  const wireErrors = await page.evaluate(() => {
    return (window as unknown as { __e2eFirebaseWireErrors?: unknown[] }).__e2eFirebaseWireErrors ?? [];
  });
  if (Array.isArray(wireErrors) && wireErrors.length > 0) {
    throw new Error(
      `[waitForE2eFirebase] emulator wire errors detected: ${JSON.stringify(wireErrors)}`,
    );
  }
}
