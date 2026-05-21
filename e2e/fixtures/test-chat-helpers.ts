/**
 * Sprint 14 / F14-D — Chat 시나리오 공통 헬퍼.
 *
 * 채팅 메시지는 Realtime Database (RTDB) 에 저장.
 * 모든 메시지에 [TEST-Sprint14] 프리픽스 + e2eSeedId.
 */
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../emulator/admin-helper';

export const TEST_PREFIX = '[TEST-Sprint14]';
export const SEED_ID = 'sprint-14-d-chat';

// Sprint 28 F28-B 단계 2 — admin app race condition fix.
// 이전: 본 파일과 auth-token-helper.ts 가 각자 admin.initializeApp 호출 →
// 먼저 init 된 app 이 누락된 config (storageBucket) 로 재사용되어 cleanupTest*
// 가 throw. 공유 helper 사용으로 통합.
function ensureAdmin(): admin.app.App {
  return ensureE2eAdmin();
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
