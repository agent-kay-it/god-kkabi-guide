#!/usr/bin/env node
/**
 * Sprint 12 / F12-A-1 — Staging Firestore 시드 post 5개 작성.
 *
 * 목적: Perf 측정용 실제 image-rich post 5개를 staging Firestore 에 작성하여
 *       /post/[id] Lighthouse 측정 가능 상태로 전환.
 *
 * 입력:
 *  - docs/sprint/12-sprint-perf/reports/seed-cdn-urls.json (F12-A-2 출력)
 *  - process.env.FIREBASE_SERVICE_ACCOUNT_JSON (tene-injected)
 *  - process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *  - process.env.SEED_AUTHOR_UID (선택 — 미설정 시 'seed-perf-sprint-12')
 *  - process.env.SEED_AUTHOR_NICKNAME (선택 — 미설정 시 'Sprint 12 Seed')
 *
 * 출력:
 *  - docs/sprint/12-sprint-perf/reports/seed-post-ids.json (5개 postId + URL)
 *
 * 사용 (반드시 tene run 으로):
 *   tene run -- node scripts/seed-staging-posts.mjs
 *
 * Idempotency: 동일 sprint sentinel (`seedSprintId: 'sprint-12-perf'`) 가
 * 이미 있으면 skip. 강제 재생성은 --force.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const FORCE = process.argv.includes('--force');
const SPRINT_ID = 'sprint-12-perf';
const SEED_AUTHOR_UID = process.env.SEED_AUTHOR_UID ?? 'seed-perf-sprint-12';
const SEED_AUTHOR_NICKNAME = process.env.SEED_AUTHOR_NICKNAME ?? 'Sprint 12 Seed';

const SEED_URLS_PATH = resolve(
  PROJECT_ROOT,
  'docs/sprint/12-sprint-perf/reports/seed-cdn-urls.json',
);
const OUTPUT_PATH = resolve(
  PROJECT_ROOT,
  'docs/sprint/12-sprint-perf/reports/seed-post-ids.json',
);

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON missing. Run with: tene run -- node scripts/seed-staging-posts.mjs',
    );
  }
  let jsonString = raw;
  if (!raw.trim().startsWith('{')) {
    jsonString = Buffer.from(raw, 'base64').toString('utf8');
  }
  const parsed = JSON.parse(jsonString);
  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key.replace(/\\n/g, '\n'),
  };
}

function ensureAdminApp() {
  if (getApps().length > 0) return;
  initializeApp({ credential: cert(parseServiceAccount()) });
}

function generatePostId() {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `seed-${SPRINT_ID}-${time}-${rand}`;
}

function bodyExcerpt(body) {
  const plain = body.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
  return plain.slice(0, 150);
}

function buildPosts(cdnUrls) {
  // 각 post 는 본문에 markdown image 1~3 개 포함 → next/image 변환 대상
  const items = [
    {
      category: 'guide',
      title: '[Sprint 12 Seed] 무한장비 시스템 완벽 가이드 — LCP 측정용',
      body: `갓깨비 키우기에서 무한장비 시스템은 캐릭터 성장의 핵심 축입니다.

![무한장비 배너](${cdnUrls[0]})

이 글은 Sprint 12 Perf 측정을 위한 시드 데이터로, 본문 첫 이미지가 LCP candidate 가 되는지 검증하기 위해 작성되었습니다.

## 자원 우선순위

장비 강화 자원은 다음과 같은 우선순위로 사용해야 합니다:
- 1순위: 무기 강화석 — 데미지 직접 영향
- 2순위: 방어구 강화석 — 생존력 확보
- 3순위: 액세서리 강화석 — 부가 옵션

![협동 콘텐츠 안내](${cdnUrls[1]})

협동 콘텐츠는 4인 파티로 진행되며, 보스 패턴 숙지가 중요합니다.

## 본문 길이 보강 (Markdown rendering pipeline 측정용)

본 시드 post 는 markdown-render.ts 의 segmenter 가 정상 동작하는지, 본문 첫 이미지가 PostImage(priority=true) 로 렌더되는지를 mobile Lighthouse 에서 측정할 수 있게 합니다. 모바일 LCP 16s 회귀 분석의 baseline 으로 사용됩니다.`,
      tags: ['content:infinite-gear'],
      imageUrls: [cdnUrls[0], cdnUrls[1]],
    },
    {
      category: 'guide',
      title: '[Sprint 12 Seed] 마왕 토벌 4단계 클리어 전략',
      body: `마왕 토벌은 갓깨비 키우기 최종 보스 콘텐츠입니다.

![마왕 보스 이미지](${cdnUrls[2]})

각 단계는 보스 패턴을 외워야 하며, 평균 시도 횟수 8회 후 클리어합니다.

## 추천 직업 조합

- 전사: 광역 어그로 + 탱킹
- 검객: 단일 누킹
- 영매: 힐 + 디버프

이미지 한 장만 포함한 post 입니다. 단일 이미지 LCP behaviour 측정용.`,
      tags: ['content:demon-king'],
      imageUrls: [cdnUrls[2]],
    },
    {
      category: 'build',
      title: '[Sprint 12 Seed] 백귀 진령 빌드 — 3장 이미지 본문 측정용',
      body: `백귀 진령은 0티어 추천 진령 중 하나입니다.

![백귀 진령 메인](${cdnUrls[3]})

## 빌드 구성

본 빌드는 PvP 위주로 구성되었습니다.

![무한장비 활용](${cdnUrls[0]})

장비는 무한장비 시스템에서 얻은 SSR 위주로 세팅합니다.

![협동 콘텐츠 활용](${cdnUrls[1]})

PvE 콘텐츠도 충분히 커버 가능합니다.

본 시드 post 는 3장 이미지가 모두 next/image PostImage 로 렌더되는지, 첫 이미지에만 priority=true 가 적용되는지 검증 목적입니다.`,
      tags: ['jinryeong:baekgwi'],
      imageUrls: [cdnUrls[3], cdnUrls[0], cdnUrls[1]],
    },
    {
      category: 'review',
      title: '[Sprint 12 Seed] 판타지 탐험 콘텐츠 후기',
      body: `판타지 탐험은 새로 추가된 솔로 콘텐츠입니다.

![판타지 탐험 배너](${cdnUrls[4]})

진행 시간은 약 30분, 보상은 SSR 진령 조각 5개입니다.

본 시드는 단일 이미지 post 의 LCP measurement variation 을 위해 작성되었습니다.`,
      tags: ['content:fantasy-explore'],
      imageUrls: [cdnUrls[4]],
    },
    {
      category: 'guide',
      title: '[Sprint 12 Seed] 텍스트 전용 가이드 — 이미지 없음 (baseline 대조군)',
      body: `이 post 는 이미지를 포함하지 않습니다.

Sprint 12 Perf 측정에서 이미지 유/무에 따른 LCP 차이를 비교하기 위한 대조군입니다.

## 텍스트 콘텐츠

갓깨비 키우기 초보자를 위한 7일 로드맵:

- Day 1: 튜토리얼 + 직업 선택
- Day 2: 첫 진령 뽑기 (무료 999회)
- Day 3: 무한장비 시스템 잠금 해제
- Day 4: 협동 던전 입문
- Day 5: PvP 시즌 진입
- Day 6: 길드 가입
- Day 7: 마왕 토벌 1단계

각 단계마다 1-2시간 정도 소요됩니다.

본 baseline post 는 LCP 가 본문 텍스트가 되는지, 또는 다른 element(예: header avatar)가 LCP 가 되는지 측정 가능하게 합니다.`,
      tags: [],
      imageUrls: [],
    },
  ];

  return items;
}

async function checkExisting(db) {
  const snap = await db
    .collection('posts')
    .where('seedSprintId', '==', SPRINT_ID)
    .limit(1)
    .get();
  return !snap.empty;
}

async function deleteExisting(db) {
  const snap = await db
    .collection('posts')
    .where('seedSprintId', '==', SPRINT_ID)
    .get();
  console.log(`Deleting ${snap.size} existing seed posts...`);
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

function ensureDir(path) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function main() {
  if (!existsSync(SEED_URLS_PATH)) {
    console.error(`Seed URLs 파일 누락: ${SEED_URLS_PATH}`);
    console.error('먼저 실행: node scripts/upload-seed-images.mjs');
    process.exit(1);
  }
  const { items: imageItems } = JSON.parse(readFileSync(SEED_URLS_PATH, 'utf8'));
  if (imageItems.length < 5) {
    console.error(`Seed 이미지 5장 필요. 현재 ${imageItems.length}장.`);
    process.exit(1);
  }
  const cdnUrls = imageItems.map((i) => i.cdnUrl);

  ensureAdminApp();
  const db = getFirestore();

  if (await checkExisting(db)) {
    if (!FORCE) {
      console.log(`Seed 이미 존재 (sprint: ${SPRINT_ID}). --force 로 재생성 가능.`);
      process.exit(0);
    }
    await deleteExisting(db);
  }

  const posts = buildPosts(cdnUrls);
  const now = FieldValue.serverTimestamp();
  const results = [];

  console.log(`Creating ${posts.length} seed posts for ${SPRINT_ID}...`);
  for (const post of posts) {
    const id = generatePostId();
    const doc = {
      id,
      authorUid: SEED_AUTHOR_UID,
      authorNickname: SEED_AUTHOR_NICKNAME,
      category: post.category,
      title: post.title,
      body: post.body,
      bodyExcerpt: bodyExcerpt(post.body),
      tags: post.tags,
      imageUrls: post.imageUrls,
      status: 'published',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      reportedCount: 0,
      createdAt: now,
      updatedAt: now,
      // Sprint 12 sentinel — afterAll cleanup + idempotency
      seedSprintId: SPRINT_ID,
    };
    await db.collection('posts').doc(id).set(doc);
    results.push({ id, title: post.title, imageCount: post.imageUrls.length });
    console.log(`  ✅ ${id} — ${post.title.slice(0, 50)}`);
  }

  ensureDir(OUTPUT_PATH);
  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      {
        sprint: SPRINT_ID,
        feature: 'F12-A-1',
        seededAt: new Date().toISOString(),
        authorUid: SEED_AUTHOR_UID,
        items: results.map((r) => ({
          ...r,
          stagingUrl: `https://staging.kkaebizigi.com/post/${r.id}`,
        })),
      },
      null,
      2,
    ) + '\n',
  );

  console.log(`\n✅ ${results.length} posts seeded`);
  console.log(`📝 Output: ${OUTPUT_PATH}`);
  console.log(`\n다음 단계: Lighthouse 측정`);
  console.log(`  pnpm test:lighthouse:baseline`);
}

main().catch((err) => {
  console.error('Seed 실패:', err);
  process.exit(1);
});
