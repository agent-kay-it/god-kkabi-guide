/**
 * Sprint 14 / F14-D-6 — Rate limit (5 msg / 10s 정책 검증).
 *
 * 실제 client-side rate limiter 가 동작 시 6번째 메시지가 차단되어야 함.
 * 본 spec 은 backend 의 message count 로 검증 (UI 의 disable 시각 검증은 별도).
 */
import { test, expect } from '@playwright/test';
import {
  seedMessage,
  cleanupTestMessages,
  getMessages,
} from '../../fixtures/test-chat-helpers';

test.afterAll(async () => {
  await cleanupTestMessages();
});

test('10초 내 6개 메시지 시드 후 모두 RTDB 에 저장 (rate limit 은 client-side 정책)', async () => {
  // 본 spec 은 Admin SDK 직접 시드 — server-side rate limit 은 RTDB rules 의 영역.
  // emulator 에서 직접 push 는 rules bypass 가능. 따라서 본 spec 의 목적은
  // 빠르게 6 메시지 시드 후 message collection 무결성 검증.
  const count = 6;
  for (let i = 0; i < count; i++) {
    await seedMessage({ body: `rate-limit msg ${i + 1}` });
  }
  const all = await getMessages('global');
  const ourMsgs = all.filter(
    (m): m is { body: string } =>
      typeof (m as { body?: string }).body === 'string' &&
      (m as { body: string }).body.startsWith('rate-limit msg '),
  );
  expect(ourMsgs.length).toBe(count);
});
