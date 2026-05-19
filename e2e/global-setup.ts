/**
 * Sprint 14 / F14-A — Playwright Global Setup.
 *
 * E2E_USE_EMULATOR=true 시:
 *   1. emulator 포트 ready 대기
 *   2. 4 role test user + dictionary + posts seed
 *
 * 그 외 (staging URL 직접 검증) 에는 no-op.
 */
import { waitForEmulators } from './emulator/wait-for-emulator';
import { seedAll } from './emulator/seed-fixtures';

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_USE_EMULATOR !== 'true') {
     
    console.log('[global-setup] E2E_USE_EMULATOR not set — skipping emulator seed');
    return;
  }
   
  console.log('[global-setup] Emulator mode — waiting for ports + seeding');
  await waitForEmulators();
  await seedAll();
}
