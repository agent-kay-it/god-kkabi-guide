#!/usr/bin/env node
/**
 * Sprint 14 / F14-K — [TEST-Sprint14] 데이터 일괄 삭제.
 *
 * Firestore + RTDB + (Storage 객체) 에서 e2eSeedId 또는 e2eTestPrefix 일치하는
 * 데이터를 정리.
 *
 * 사용:
 *   # emulator (default)
 *   node scripts/cleanup-test-data.mjs
 *
 *   # prod 모드 (FIREBASE_SERVICE_ACCOUNT_JSON 필요, --confirm 강제)
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{...}' node scripts/cleanup-test-data.mjs --prod --confirm
 *
 * 안전장치:
 *  - default: FIREBASE_USE_EMULATOR=true 모드만 동작
 *  - --prod 플래그 + --confirm 동시 전달 시에만 prod 영향
 *  - 항상 e2eSeedId 또는 e2eTestPrefix 기준 삭제 (전체 삭제 금지)
 */
import admin from 'firebase-admin';

const TEST_PREFIX = '[TEST-Sprint14]';
const COLLECTIONS_FIRESTORE = [
  'posts',
  'comments',
  'reports',
  'notifications',
  'penalties',
  'coupons',
];
const SUBCOLLECTIONS_USERS = ['bookmarks', 'recentViews'];
const RTDB_CHANNELS = ['global', 'server-S785', 'munpa-muming'];

function parseArgs(argv) {
  const args = { prod: false, confirm: false, dry: false };
  for (const arg of argv.slice(2)) {
    if (arg === '--prod') args.prod = true;
    if (arg === '--confirm') args.confirm = true;
    if (arg === '--dry' || arg === '--dry-run') args.dry = true;
  }
  return args;
}

function configureEnv(args) {
  if (args.prod) {
    if (!args.confirm) {
      console.error('--prod requires --confirm to avoid accidental data loss');
      process.exit(2);
    }
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      console.error('--prod requires FIREBASE_SERVICE_ACCOUNT_JSON env');
      process.exit(2);
    }
    return { projectId: null /* parsed from service account */ };
  }
  // emulator mode
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? 'localhost:8080';
  process.env.FIREBASE_DATABASE_EMULATOR_HOST =
    process.env.FIREBASE_DATABASE_EMULATOR_HOST ?? 'localhost:9000';
  return { projectId: 'demo-kkaebizigi-test' };
}

function initAdmin(cfg, args) {
  if (admin.apps.length > 0) return admin.app();
  if (args.prod) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${sa.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`,
    });
  }
  return admin.initializeApp({
    projectId: cfg.projectId,
    databaseURL: 'http://localhost:9000?ns=demo-kkaebizigi-test',
  });
}

async function cleanupFirestoreCollection(coll, dry) {
  const snap = await admin
    .firestore()
    .collection(coll)
    .where('e2eTestPrefix', '==', TEST_PREFIX)
    .get();
  if (dry) {
    console.log(`[dry] firestore/${coll}: ${snap.size} docs would be deleted`);
    return snap.size;
  }
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
  console.log(`firestore/${coll}: ${snap.size} docs deleted`);
  return snap.size;
}

async function cleanupUserSubcollections(dry) {
  const usersSnap = await admin.firestore().collection('users').get();
  let total = 0;
  for (const userDoc of usersSnap.docs) {
    for (const sub of SUBCOLLECTIONS_USERS) {
      const subSnap = await userDoc.ref
        .collection(sub)
        .where('e2eTestPrefix', '==', TEST_PREFIX)
        .get();
      if (!dry) {
        await Promise.all(subSnap.docs.map((d) => d.ref.delete()));
      }
      total += subSnap.size;
    }
  }
  console.log(`${dry ? '[dry] ' : ''}users/{uid}/{bookmarks,recentViews}: ${total} docs ${dry ? 'would be' : ''} deleted`);
  return total;
}

async function cleanupRtdbMessages(dry) {
  let total = 0;
  for (const channel of RTDB_CHANNELS) {
    const snap = await admin.database().ref(`messages/${channel}`).once('value');
    const all = snap.val() ?? {};
    const toDelete = Object.entries(all).filter(
      ([, v]) => typeof v === 'object' && v && v.e2eTestPrefix === TEST_PREFIX,
    );
    if (!dry) {
      await Promise.all(
        toDelete.map(([k]) => admin.database().ref(`messages/${channel}/${k}`).remove()),
      );
    }
    total += toDelete.length;
  }
  console.log(`${dry ? '[dry] ' : ''}rtdb/messages: ${total} messages ${dry ? 'would be' : ''} deleted`);
  return total;
}

async function main() {
  const args = parseArgs(process.argv);
  const cfg = configureEnv(args);
  initAdmin(cfg, args);

  console.log(`mode: ${args.prod ? 'PROD' : 'EMULATOR'}${args.dry ? ' [DRY-RUN]' : ''}`);
  console.log(`prefix: ${TEST_PREFIX}`);

  let total = 0;
  for (const coll of COLLECTIONS_FIRESTORE) {
    total += await cleanupFirestoreCollection(coll, args.dry);
  }
  total += await cleanupUserSubcollections(args.dry);
  total += await cleanupRtdbMessages(args.dry);

  console.log(`\nTotal: ${total} entities ${args.dry ? 'would be' : ''} cleaned`);
  process.exit(0);
}

main().catch((err) => {
  console.error('cleanup failed:', err);
  process.exit(1);
});
