/**
 * Sprint 17 / F17-A — lib/chat/session-context.ts unit test.
 *
 * NextAuth Session → ChatUserContext 변환 helper 검증.
 */
import { describe, it, expect } from 'vitest';
import { chatUserFromSession } from './session-context';
import type { Session } from 'next-auth';

function makeSession(over: Record<string, unknown> = {}): Session {
  return {
    user: {
      id: 'u-1',
      role: 'user',
      registered: true,
      serverId: 's-1',
      munpaId: 'm-1',
      ...over,
    },
    expires: '2026-12-31',
  } as Session;
}

describe('chatUserFromSession()', () => {
  it('session 이 null 이면 null 반환', () => {
    expect(chatUserFromSession(null)).toBeNull();
  });

  it('session 이 undefined 이면 null 반환', () => {
    expect(chatUserFromSession(undefined)).toBeNull();
  });

  it('session.user 가 없으면 null 반환', () => {
    expect(chatUserFromSession({ expires: '2026-12-31' } as Session)).toBeNull();
  });

  it('user.id 가 없으면 null 반환 (anonymous)', () => {
    const session = makeSession({ id: undefined });
    expect(chatUserFromSession(session)).toBeNull();
  });

  it('정상 session → ChatUserContext 변환', () => {
    const session = makeSession();
    const ctx = chatUserFromSession(session);
    expect(ctx).toEqual({
      uid: 'u-1',
      role: 'user',
      registered: true,
      serverId: 's-1',
      munpaId: 'm-1',
    });
  });

  it('admin role 보존', () => {
    const session = makeSession({ role: 'admin' });
    const ctx = chatUserFromSession(session);
    expect(ctx?.role).toBe('admin');
  });

  it('banned role 보존', () => {
    const session = makeSession({ role: 'banned' });
    const ctx = chatUserFromSession(session);
    expect(ctx?.role).toBe('banned');
  });

  it('role / registered / serverId / munpaId 가 모두 undefined 인 경우', () => {
    const session = makeSession({
      role: undefined,
      registered: undefined,
      serverId: undefined,
      munpaId: undefined,
    });
    const ctx = chatUserFromSession(session);
    expect(ctx).toEqual({
      uid: 'u-1',
      role: undefined,
      registered: undefined,
      serverId: undefined,
      munpaId: undefined,
    });
  });

  it('registered false 도 보존', () => {
    const session = makeSession({ registered: false });
    const ctx = chatUserFromSession(session);
    expect(ctx?.registered).toBe(false);
  });
});
