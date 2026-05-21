/**
 * Sprint 14 / F14-A + F14-K — Playwright Global Teardown.
 *
 * E2E_USE_EMULATOR=true 시:
 *   - [TEST-Sprint14] 데이터 cleanup 실행 (안전망 — emulator 는 어차피 in-memory)
 *   - emulator process 는 외부에서 관리
 *
 * staging URL 직접 검증 시:
 *   - cleanup 절대 실행 안 함 (운영 데이터 보호)
 */
import admin from 'firebase-admin';
import { ensureE2eAdmin } from './emulator/admin-helper';

const TEST_PREFIX = '[TEST-Sprint14]';
const FIRESTORE_COLLS = ['posts', 'comments', 'reports', 'notifications', 'penalties', 'coupons'];
const RTDB_CHANNELS = ['global', 'server-S785', 'munpa-muming'];

interface PrefixDoc {
  readonly e2eTestPrefix?: string;
}

async function cleanupFirestore(): Promise<number> {
  let total = 0;
  for (const coll of FIRESTORE_COLLS) {
    const snap = await admin
      .firestore()
      .collection(coll)
      .where('e2eTestPrefix', '==', TEST_PREFIX)
      .get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
    total += snap.size;
  }
  return total;
}

async function cleanupRtdb(): Promise<number> {
  let total = 0;
  for (const channel of RTDB_CHANNELS) {
    const snap = await admin.database().ref(`messages/${channel}`).once('value');
    const all = (snap.val() ?? {}) as Record<string, PrefixDoc>;
    const toDelete = Object.entries(all).filter(
      ([, v]) => v.e2eTestPrefix === TEST_PREFIX,
    );
    await Promise.all(
      toDelete.map(([k]) => admin.database().ref(`messages/${channel}/${k}`).remove()),
    );
    total += toDelete.length;
  }
  return total;
}

export default async function globalTeardown(): Promise<void> {
  if (process.env.E2E_USE_EMULATOR !== 'true') {
    console.log('[global-teardown] Non-emulator mode — skipping cleanup');
    return;
  }

  try {
    // Sprint 28 F28-B 단계 2 — 공유 helper 로 통합 (admin app race condition fix)
    ensureE2eAdmin();

    const fsCount = await cleanupFirestore();
    const rtdbCount = await cleanupRtdb();
    console.log(
      `[global-teardown] cleanup: firestore=${fsCount}, rtdb=${rtdbCount} (emulator state will also clear on process exit)`,
    );
  } catch (err) {
    console.warn('[global-teardown] cleanup failed:', err);
  }
}
