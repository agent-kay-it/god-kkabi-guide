/**
 * Sprint 14 / F14-A — Playwright Global Teardown.
 *
 * E2E_USE_EMULATOR=true 시:
 *   - emulator 는 process exit 시 자동 종료되므로 별도 stop 불필요
 *   - [TEST-Sprint14] 데이터 cleanup 시도 (F14-K 자동화 hook)
 *
 * staging URL 직접 검증 시:
 *   - cleanup 절대 실행 안 함 (운영 데이터 보호)
 */
import admin from 'firebase-admin';

export default async function globalTeardown(): Promise<void> {
  if (process.env.E2E_USE_EMULATOR !== 'true') {
     
    console.log('[global-teardown] Non-emulator mode — skipping cleanup');
    return;
  }

  try {
    if (admin.apps.length === 0) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      admin.initializeApp({ projectId: 'demo-kkaebizigi-test' });
    }

    // F14-K 풀 cleanup 은 별도 script (scripts/cleanup-test-data.mjs).
    // 여기선 emulator 가 in-memory 라 process exit 으로 충분 — log 만 남김.
     
    console.log('[global-teardown] Emulator state will be cleared on process exit');
  } catch (err) {
     
    console.warn('[global-teardown] cleanup probe failed:', err);
  }
}
