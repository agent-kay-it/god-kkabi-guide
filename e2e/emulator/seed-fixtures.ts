/**
 * Sprint 14 / F14-A — Emulator Seed Fixtures.
 *
 * Playwright globalSetup 에서 1회 호출 → emulator 에 4 role test user + 기본
 * dictionary / posts 시드.
 *
 * 모든 시드 데이터는 다음 태그를 가짐:
 *   e2eTestPrefix: '[TEST-Sprint14]'
 *   e2eSeedId: 'sprint-14-seed'
 *
 * cleanup 은 scripts/cleanup-test-data.mjs 가 동일 태그 기준으로 일괄 삭제.
 */
import admin from 'firebase-admin';

export const TEST_PREFIX = '[TEST-Sprint14]';
export const SEED_ID = 'sprint-14-seed';

export interface TestUserSeed {
  readonly uid: string;
  readonly email: string;
  readonly displayName: string;
  readonly claims: Record<string, unknown>;
  readonly registered: boolean;
  readonly clan: string | null;
}

export const TEST_USERS: readonly TestUserSeed[] = [
  {
    uid: 'e2e-admin',
    email: 'e2e-admin@test.local',
    displayName: 'E2E Admin',
    claims: { role: 'admin', registered: true },
    registered: true,
    clan: '관리자',
  },
  {
    uid: 'e2e-regular',
    email: 'e2e-regular@test.local',
    displayName: 'E2E Regular',
    claims: { role: 'user', registered: true },
    registered: true,
    clan: '무명',
  },
  {
    uid: 'e2e-banned',
    email: 'e2e-banned@test.local',
    displayName: 'E2E Banned',
    claims: { role: 'banned', registered: true, bannedReason: 'e2e test' },
    registered: true,
    clan: null,
  },
  {
    uid: 'e2e-new',
    email: 'e2e-new@test.local',
    displayName: 'E2E New',
    claims: { registered: false },
    registered: false,
    clan: null,
  },
];

function ensureAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.app();
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
  process.env.STORAGE_EMULATOR_HOST = 'http://localhost:9199';
  return admin.initializeApp({
    projectId: 'demo-kkaebizigi-test',
    databaseURL: 'http://localhost:9000?ns=demo-kkaebizigi-test',
  });
}

async function deleteExistingUser(uid: string): Promise<void> {
  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== 'auth/user-not-found') throw err;
  }
}

export async function seedTestUsers(): Promise<void> {
  ensureAdminApp();

  for (const u of TEST_USERS) {
    await deleteExistingUser(u.uid);
    await admin.auth().createUser({
      uid: u.uid,
      email: u.email,
      emailVerified: true,
      displayName: u.displayName,
      disabled: false,
    });
    await admin.auth().setCustomUserClaims(u.uid, u.claims);

    await admin
      .firestore()
      .collection('users')
      .doc(u.uid)
      .set({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        server: 'S785',
        clan: u.clan,
        classId: 'class_geomgaek',
        registered: u.registered,
        tier: 'free',
        bookmarkCount: 0,
        postCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        e2eTestPrefix: TEST_PREFIX,
        e2eSeedId: SEED_ID,
      });
  }
}

export async function seedBasicDictionaries(): Promise<void> {
  ensureAdminApp();
  const db = admin.firestore();

  // 직업 (class) dictionary
  const classes = [
    { id: 'class_geomgaek', name: '검객', tier: 'T0', subClass: '무당' },
    { id: 'class_jeonsa', name: '전사', tier: 'T1', subClass: null },
    { id: 'class_yongma', name: '영매', tier: 'T1', subClass: null },
  ];
  for (const c of classes) {
    await db.collection('classes').doc(c.id).set({
      ...c,
      e2eTestPrefix: TEST_PREFIX,
      e2eSeedId: SEED_ID,
    });
  }

  // 진령 (jinryeong) dictionary — 11종
  const jinryeongs = Array.from({ length: 11 }, (_, i) => ({
    id: `jinryeong_${i + 1}`,
    name: `진령 ${i + 1}`,
    tier: i < 2 ? 'T0' : i < 6 ? 'T1' : 'T2',
  }));
  for (const j of jinryeongs) {
    await db.collection('jinryeongs').doc(j.id).set({
      ...j,
      e2eTestPrefix: TEST_PREFIX,
      e2eSeedId: SEED_ID,
    });
  }
}

export async function seedBasicPosts(): Promise<void> {
  ensureAdminApp();
  const db = admin.firestore();

  // regular 사용자의 게시물 1건 — read 시나리오 baseline
  await db
    .collection('posts')
    .doc('e2e-seed-post-001')
    .set({
      id: 'e2e-seed-post-001',
      title: `${TEST_PREFIX} 시드 게시물 001`,
      body: '본문 시드 — e2e 시나리오의 read baseline',
      category: 'free',
      authorUid: 'e2e-regular',
      authorName: 'E2E Regular',
      images: [],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      status: 'published',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      e2eTestPrefix: TEST_PREFIX,
      e2eSeedId: SEED_ID,
    });
}

export async function seedAll(): Promise<void> {
   
  console.log(`[emulator-seed] Starting seed (prefix=${TEST_PREFIX}, id=${SEED_ID})`);
  await seedTestUsers();
   
  console.log(`[emulator-seed]  - ${TEST_USERS.length} users created`);
  await seedBasicDictionaries();
   
  console.log('[emulator-seed]  - dictionaries (classes + jinryeongs) seeded');
  await seedBasicPosts();
   
  console.log('[emulator-seed]  - baseline posts seeded');
   
  console.log('[emulator-seed] Done');
}
