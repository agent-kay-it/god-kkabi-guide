/**
 * E2E Seed Data Fixture — Sprint 13 / F13-A-4.
 * 출처: docs/sprint/13-sprint-qa/design.md §1.3
 *
 * **Firebase 단일 prod 프로젝트 (god-kkabi-guide) 안전 정책**:
 *  - 모든 seed 도큐먼트에 `e2eSeedId` sentinel 필수 부착
 *  - nickname / title 모두 `e2e_` prefix — 실 사용자 영역에서 자동 필터 (Firestore rules
 *    또는 client filter)
 *  - afterAll 에서 sentinel 매칭 도큐먼트 일괄 cleanup
 *  - cleanup 실패 시 alert 후 폐기 (메모리 누수보다 안전 우선)
 *  - DRY_RUN env=true 시 실제 write 없이 동작 검증만
 *
 * Sprint 12 lesson: tene 환경에 FIREBASE_SERVICE_ACCOUNT_JSON 없음 → Vercel env 사용.
 *  Local 실행 시 사용자가 별도 service-account.json 제공 필요 (e2e/.secrets/sa.json).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Playwright 는 CJS 컨텍스트로 실행 — __dirname 직접 사용 (import.meta.url 미사용).
const PROJECT_ROOT = resolve(__dirname, '../..');

/**
 * 모든 e2e seed 도큐먼트 sentinel.
 * cleanup 시 본 값이 일치하는 도큐먼트만 삭제 — 실 데이터 보호 안전망.
 */
export const E2E_SEED_SENTINEL = `sprint-13-qa-${new Date().toISOString().slice(0, 10)}`;

/**
 * service account JSON 로드 — 우선순위:
 *  1. env FIREBASE_SERVICE_ACCOUNT_JSON (CI / Vercel env pull)
 *  2. e2e/.secrets/service-account.json (local 사용자가 직접 제공)
 *  3. throw — admin 작업 불가능 알림
 */
function loadServiceAccount(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (fromEnv) {
    let jsonString = fromEnv;
    if (!fromEnv.trim().startsWith('{')) {
      jsonString = Buffer.from(fromEnv, 'base64').toString('utf8');
    }
    const parsed = JSON.parse(jsonString);
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, '\n'),
    };
  }

  const localPath = resolve(PROJECT_ROOT, 'e2e/.secrets/service-account.json');
  if (existsSync(localPath)) {
    const parsed = JSON.parse(readFileSync(localPath, 'utf8'));
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, '\n'),
    };
  }

  throw new Error(
    'Firebase service account 누락.\n' +
      '옵션 A: process.env.FIREBASE_SERVICE_ACCOUNT_JSON 주입 (Vercel env pull)\n' +
      '옵션 B: e2e/.secrets/service-account.json 파일 배치 (gitignore)\n' +
      '※ 본 sprint는 단일 Firebase 프로젝트라 seed 작성 시 prod 데이터 영향 — e2eSeedId sentinel 보호 필수.',
  );
}

let adminAppRef: App | null = null;

export function ensureAdmin(): App {
  if (adminAppRef) return adminAppRef;
  if (getApps().length > 0) {
    adminAppRef = getApps()[0]!;
    return adminAppRef;
  }
  const sa = loadServiceAccount();
  adminAppRef = initializeApp({ credential: cert(sa) });
  return adminAppRef;
}

export interface SeededPost {
  readonly id: string;
  readonly title: string;
  readonly authorUid: string;
  readonly category: 'build' | 'guide' | 'review';
}

/**
 * e2e seed post 1개 생성. 모든 e2e seed 의 sentinel + e2e_ prefix 필수.
 * DRY_RUN=true 면 write 없이 placeholder 반환.
 */
export async function seedPost(input: {
  authorUid: string;
  category?: 'build' | 'guide' | 'review';
  title?: string;
  body?: string;
  imageUrls?: readonly string[];
}): Promise<SeededPost> {
  const dryRun = process.env.E2E_DRY_RUN === 'true';
  const id = `e2e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const title = input.title ?? `e2e_seed Post — ${id}`;
  const category = input.category ?? 'guide';

  if (dryRun) {
    return { id, title, authorUid: input.authorUid, category };
  }

  ensureAdmin();
  const db = getFirestore();
  const now = FieldValue.serverTimestamp();
  await db.collection('posts').doc(id).set({
    id,
    authorUid: input.authorUid,
    authorNickname: input.authorUid.startsWith('e2e_') ? input.authorUid : `e2e_${input.authorUid.slice(0, 8)}`,
    category,
    title,
    body: input.body ?? `[e2e seed] ${title}\n\n자동 cleanup 대상 — 무시해주세요.`,
    bodyExcerpt: (input.body ?? title).slice(0, 150),
    tags: [],
    imageUrls: [...(input.imageUrls ?? [])],
    status: 'published',
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    reportedCount: 0,
    createdAt: now,
    updatedAt: now,
    e2eSeedId: E2E_SEED_SENTINEL,
  });

  return { id, title, authorUid: input.authorUid, category };
}

/**
 * sentinel 매칭 도큐먼트 일괄 삭제.
 * - posts collection 만 대상 (chat 은 RTDB 별도)
 * - sentinel 미일치 도큐먼트는 절대 건드리지 않음 (실 데이터 안전)
 */
export async function cleanupSeededPosts(): Promise<{ deleted: number }> {
  if (process.env.E2E_DRY_RUN === 'true') {
    return { deleted: 0 };
  }
  ensureAdmin();
  const db = getFirestore();
  const snap = await db
    .collection('posts')
    .where('e2eSeedId', '==', E2E_SEED_SENTINEL)
    .get();
  if (snap.empty) return { deleted: 0 };
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return { deleted: snap.size };
}

/**
 * 전역 cleanup — 본일 sentinel 매칭 도큐먼트 모두 삭제. 운영자가 수동 실행 가능.
 * 사용: `tene run -- node e2e/scripts/cleanup-seed.mjs` (별도 script 필요)
 */
export async function nuclearCleanup(): Promise<{ deleted: number }> {
  // posts only — RTDB seed 는 chat fixture 별도
  return cleanupSeededPosts();
}
