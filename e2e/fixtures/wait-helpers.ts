/**
 * Sprint 15 / F15-A — Playwright 공통 wait 헬퍼.
 *
 * spec flake 감소를 위한 정형 비동기 대기 패턴.
 * networkidle + waitForFunction 조합으로 race condition 차단.
 */
import type { Page } from '@playwright/test';

/**
 * Firebase Auth currentUser 로딩 완료 대기.
 *
 * loginAs() 직후 SSR/CSR 의 race 를 피하기 위해 호출 권장.
 */
export async function waitForUserLoaded(
  page: Page,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        return !!getAuth().currentUser;
      } catch {
        return false;
      }
    },
    { timeout: timeoutMs },
  );
}

/**
 * Firestore listener attach 완료 대기.
 *
 * collection 의 size >= 0 이면 listener 가 정상 attach 된 것으로 간주.
 */
export async function waitForFirestoreData(
  page: Page,
  collection: string,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    async (coll) => {
      try {
        const { getFirestore, collection: collRef, getDocs } = await import(
          'firebase/firestore'
        );
        const snap = await getDocs(collRef(getFirestore(), coll));
        return snap.size >= 0;
      } catch {
        return false;
      }
    },
    collection,
    { timeout: timeoutMs },
  );
}

/**
 * 클라이언트 hydration 완료 대기.
 *
 * Next.js App Router 의 RSC streaming + client hydration 의 race 차단.
 * document.documentElement 의 hydration root 가 mount 된 후 약간 더 대기.
 */
export async function waitForHydration(page: Page, settleMs = 200): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.evaluate((ms) => new Promise<void>((r) => setTimeout(r, ms)), settleMs);
}

/**
 * Firebase emulator 의 RTDB 연결 완료 대기.
 *
 * webkit 의 long-polling 초기 연결 시점을 고려.
 */
export async function waitForRtdbConnected(
  page: Page,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    async () => {
      try {
        const { getDatabase, ref, get } = await import('firebase/database');
        const snap = await get(ref(getDatabase(), '/.info/connected'));
        return snap.val() === true;
      } catch {
        return false;
      }
    },
    { timeout: timeoutMs },
  );
}

/**
 * 이미지 lazy mount 대기 — IntersectionObserver 가 트리거되도록
 * window scroll 이벤트 발생 시 사용.
 */
export async function triggerLazyMount(page: Page, settleMs = 300): Promise<void> {
  await page.evaluate(() => {
    window.scrollTo({ top: 1, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.evaluate((ms) => new Promise<void>((r) => setTimeout(r, ms)), settleMs);
}
