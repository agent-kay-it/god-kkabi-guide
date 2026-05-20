#!/usr/bin/env node
/**
 * 쿠폰 자동 검증 CLI — Sprint 20 F20-G (마스터 V2 F3.4 cron).
 *
 * 사용:
 *   tene run --env prod -- node scripts/run-coupon-auto-validate.mjs        # 실 실행
 *   tene run --env prod -- node scripts/run-coupon-auto-validate.mjs --dry  # dry-run (mutation X)
 *
 * 환경변수 (tene 가 주입):
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY (escaped \n 포함 가능)
 *
 * GitHub Actions cron 에서 호출 — 6시간 마다 자동 실행.
 *
 * 정책 (TOS 안전):
 *   - 실 게임 쿠폰 자동 호출 X (커뮤니티 vote 기반)
 *   - 결정 로직은 lib/coupon/auto-validate.ts (pure function)
 *   - max 200건/회 (성능 가드)
 */

import admin from 'firebase-admin';

import {
  decideCouponValidation,
  decisionToCouponUpdate,
} from '../lib/coupon/auto-validate.js';

const DRY_RUN = process.argv.includes('--dry') || process.argv.includes('--dry-run');
const LIMIT = 200;

function loadCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing FIREBASE_ADMIN_* env. Run via `tene run --env <env> -- node scripts/run-coupon-auto-validate.mjs`.',
    );
  }
  return { projectId, clientEmail, privateKey };
}

async function main() {
  console.log(`[coupon-auto-validate] start (dry=${DRY_RUN})`);

  const creds = loadCredentials();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(creds),
    });
  }

  const db = admin.firestore();
  const pendingSnap = await db
    .collection('coupons')
    .where('status', '==', 'pending')
    .orderBy('reportedAt', 'desc')
    .limit(LIMIT)
    .get();

  console.log(`[coupon-auto-validate] scanned ${pendingSnap.size} pending coupons`);

  const nowMs = Date.now();
  let autoEnabled = 0;
  let autoDisabled = 0;
  let noop = 0;
  const transitions = [];

  for (const doc of pendingSnap.docs) {
    const data = doc.data();
    const createdAtMs = data.reportedAt?.toMillis?.() ?? 0;
    const decision = decideCouponValidation({
      votesUp: data.upvotes ?? 0,
      votesDown: data.downvotes ?? 0,
      status: data.status,
      createdAtMs,
      ...(data.expiresAtMs !== undefined ? { expiresAtMs: data.expiresAtMs } : {}),
      nowMs,
    });

    const update = decisionToCouponUpdate(decision);
    if (!update) {
      noop++;
      continue;
    }

    transitions.push({ id: doc.id, code: data.code, decision });
    if (decision.type === 'auto_enable') autoEnabled++;
    else autoDisabled++;

    if (!DRY_RUN) {
      await doc.ref.update({
        ...update,
        verifiedBy: 'system',
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  console.log(JSON.stringify(
    {
      summary: {
        scanned: pendingSnap.size,
        autoEnabled,
        autoDisabled,
        noop,
        dryRun: DRY_RUN,
      },
      transitions,
    },
    null,
    2,
  ));

  // Successful exit even if 0 transitions — informational run
  process.exit(0);
}

main().catch((err) => {
  console.error('[coupon-auto-validate] failed:', err);
  process.exit(1);
});
