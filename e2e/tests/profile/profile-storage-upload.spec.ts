/**
 * Sprint 15 / F15-F — Storage emulator 실 업로드 e2e.
 * Sprint 28 F28-B 단계 10 — page.evaluate bare specifier 'firebase/storage' 제거.
 * window.__e2eFirebase 사용 (lib/firebase/client.ts emulator 분기 expose).
 *
 * 1) Admin SDK 로 emulator 에 파일 업로드
 * 2) Client (Playwright page) 의 firebase/storage 가 같은 파일 download
 * 3) downloadURL 의 fetch + body 일치 검증
 *
 * (실 S3 / CloudFront 는 production 만, emulator 는 in-memory)
 */
import { test, expect } from '@playwright/test';
import { loginAs } from '../../emulator/auth-token-helper';
import {
  uploadTestFile,
  cleanupTestStorage,
  getEmulatorDownloadURL,
} from '../../fixtures/test-storage-helpers';
import { waitForE2eFirebase } from '../../fixtures/window-firebase';

test.afterAll(async () => {
  await cleanupTestStorage();
});

test('Admin SDK 업로드 → page.evaluate firebase/storage getDownloadURL → fetch 검증', async ({
  page,
}) => {
  const path = `profile/e2e-regular-${Date.now()}.txt`;
  const body = `sprint 15 f15-f upload ${Date.now()}`;
  await uploadTestFile(path, body, 'text/plain');

  await loginAs(page, 'regular');
  await page.goto('/');
  await waitForE2eFirebase(page);

  const downloadResult = await page.evaluate(
    async (storagePath) => {
      const fb = (window as unknown as {
        __e2eFirebase: {
          app: unknown;
          storage: {
            getStorage: (app: unknown) => unknown;
            ref: (storage: unknown, path: string) => unknown;
            getDownloadURL: (ref: unknown) => Promise<string>;
          };
        };
      }).__e2eFirebase;
      const storage = fb.storage.getStorage(fb.app);
      const storageRef = fb.storage.ref(storage, storagePath);
      const url = await fb.storage.getDownloadURL(storageRef);
      const res = await fetch(url);
      const text = await res.text();
      return { url, status: res.status, text };
    },
    path,
  );

  expect(downloadResult.status).toBe(200);
  expect(downloadResult.text).toBe(body);
  // emulator URL 검증
  expect(downloadResult.url).toMatch(/localhost:9199/);
});

test('Client side putString → Admin SDK 로 readback', async ({ page }) => {
  await loginAs(page, 'regular');
  await page.goto('/');
  await waitForE2eFirebase(page);

  const path = `chat/e2e-regular-client-${Date.now()}.txt`;
  const body = `client side upload ${Date.now()}`;

  const uploadResult = await page.evaluate(
    async ({ p, b }) => {
      const fb = (window as unknown as {
        __e2eFirebase: {
          app: unknown;
          storage: {
            getStorage: (app: unknown) => unknown;
            ref: (storage: unknown, path: string) => unknown;
            uploadString: (
              ref: unknown,
              data: string,
            ) => Promise<{ metadata: { fullPath: string } }>;
          };
        };
      }).__e2eFirebase;
      const storage = fb.storage.getStorage(fb.app);
      const storageRef = fb.storage.ref(storage, p);
      const snap = await fb.storage.uploadString(storageRef, b);
      return { fullPath: snap.metadata.fullPath };
    },
    { p: path, b: body },
  );

  expect(uploadResult.fullPath).toBe(path);

  // emulator URL 로 fetch 검증
  const url = getEmulatorDownloadURL(path);
  const res = await page.request.get(url);
  expect(res.status()).toBe(200);
  expect(await res.text()).toBe(body);
});
