/**
 * Sprint 14 / F14-D — Chat 시나리오 공통 헬퍼.
 *
 * 채팅 메시지는 Realtime Database (RTDB) 에 저장.
 * 모든 메시지에 [TEST-Sprint14] 프리픽스 + e2eSeedId.
 */
import admin from 'firebase-admin';

export const TEST_PREFIX = '[TEST-Sprint14]';
export const SEED_ID = 'sprint-14-d-chat';

function ensureAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.app();
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
  return admin.initializeApp({
    projectId: 'demo-kkaebizigi-test',
    databaseURL: 'http://localhost:9000?ns=demo-kkaebizigi-test',
  });
}

export type ChannelType = 'global' | 'server-S785' | 'munpa-muming';

export interface SeedMessageOptions {
  readonly channel?: ChannelType;
  readonly authorUid?: string;
  readonly authorName?: string;
  readonly body?: string;
  readonly imageUrl?: string;
  readonly hidden?: boolean;
}

export async function seedMessage(opts: SeedMessageOptions = {}): Promise<string> {
  ensureAdmin();
  const channel = opts.channel ?? 'global';
  const ref = admin.database().ref(`messages/${channel}`).push();
  const id = ref.key!;
  await ref.set({
    id,
    authorUid: opts.authorUid ?? 'e2e-regular',
    authorName: opts.authorName ?? 'E2E Regular',
    body: opts.body ?? `${TEST_PREFIX} 자동 시드 메시지`,
    imageUrl: opts.imageUrl ?? null,
    hidden: opts.hidden ?? false,
    createdAt: admin.database.ServerValue.TIMESTAMP,
    e2eTestPrefix: TEST_PREFIX,
    e2eSeedId: SEED_ID,
  });
  return id;
}

export async function cleanupTestMessages(): Promise<void> {
  ensureAdmin();
  const channels: ChannelType[] = ['global', 'server-S785', 'munpa-muming'];
  for (const c of channels) {
    const snap = await admin.database().ref(`messages/${c}`).once('value');
    const all = (snap.val() ?? {}) as Record<string, { e2eSeedId?: string }>;
    const toDelete = Object.entries(all).filter(([, v]) => v.e2eSeedId === SEED_ID);
    await Promise.all(
      toDelete.map(([k]) => admin.database().ref(`messages/${c}/${k}`).remove()),
    );
  }
}

export async function getMessages(channel: ChannelType): Promise<unknown[]> {
  ensureAdmin();
  const snap = await admin.database().ref(`messages/${channel}`).once('value');
  const all = (snap.val() ?? {}) as Record<string, unknown>;
  return Object.values(all);
}
