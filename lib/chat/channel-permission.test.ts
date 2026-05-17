/**
 * vitest — channel-permission tests (RTDB rules와 동일 결정 트리 검증).
 */
import { describe, it, expect } from 'vitest';

import {
  accessDenyMessage,
  canAccessChannel,
  canSendMessage,
} from './channel-permission';
import type { ChatUserContext } from './types';

function userOf(over: Partial<ChatUserContext> = {}): ChatUserContext {
  return {
    uid: 'u1',
    role: 'user',
    registered: true,
    serverId: 'S785',
    munpaId: 'S785_갓깨비길드',
    ...over,
  };
}

describe('canAccessChannel — global', () => {
  it('allows registered user', () => {
    expect(canAccessChannel('global', userOf())).toEqual({ ok: true });
  });

  it('allows unregistered user (read-only)', () => {
    expect(canAccessChannel('global', userOf({ registered: false }))).toEqual({ ok: true });
  });

  it('denies banned user', () => {
    expect(canAccessChannel('global', userOf({ role: 'banned' }))).toEqual({
      ok: false,
      reason: 'BANNED',
    });
  });

  it('denies anonymous (no uid)', () => {
    expect(canAccessChannel('global', userOf({ uid: '' }))).toEqual({
      ok: false,
      reason: 'NOT_AUTHENTICATED',
    });
  });
});

describe('canAccessChannel — server', () => {
  it('allows matching serverId', () => {
    expect(canAccessChannel('server-S785', userOf())).toEqual({ ok: true });
  });

  it('denies mismatched serverId', () => {
    expect(canAccessChannel('server-S999', userOf())).toEqual({
      ok: false,
      reason: 'SERVER_MISMATCH',
    });
  });

  it('denies when user has no serverId', () => {
    expect(canAccessChannel('server-S785', userOf({ serverId: undefined }))).toEqual({
      ok: false,
      reason: 'SERVER_MISMATCH',
    });
  });
});

describe('canAccessChannel — munpa', () => {
  it('allows matching munpaId', () => {
    expect(canAccessChannel('munpa-S785_갓깨비길드', userOf())).toEqual({ ok: true });
  });

  it('denies mismatched munpaId', () => {
    expect(canAccessChannel('munpa-S785_OtherGuild', userOf())).toEqual({
      ok: false,
      reason: 'MUNPA_MISMATCH',
    });
  });

  it('denies when user has no munpaId', () => {
    expect(canAccessChannel('munpa-S785_x', userOf({ munpaId: undefined }))).toEqual({
      ok: false,
      reason: 'MUNPA_MISMATCH',
    });
  });
});

describe('canAccessChannel — invalid', () => {
  it('denies malformed channelId', () => {
    expect(canAccessChannel('invalid', userOf())).toEqual({
      ok: false,
      reason: 'INVALID_CHANNEL',
    });
    expect(canAccessChannel('admin-S785', userOf())).toEqual({
      ok: false,
      reason: 'INVALID_CHANNEL',
    });
  });
});

describe('canSendMessage', () => {
  it('allows registered user with channel access', () => {
    expect(canSendMessage('global', userOf())).toEqual({ ok: true });
    expect(canSendMessage('server-S785', userOf())).toEqual({ ok: true });
  });

  it('denies unregistered user even on global', () => {
    expect(canSendMessage('global', userOf({ registered: false }))).toEqual({
      ok: false,
      reason: 'NOT_AUTHENTICATED',
    });
  });

  it('denies banned user', () => {
    expect(canSendMessage('global', userOf({ role: 'banned' }))).toEqual({
      ok: false,
      reason: 'BANNED',
    });
  });

  it('allows admin write even on cross-server channel', () => {
    expect(
      canSendMessage('server-S999', userOf({ role: 'admin', serverId: 'S785' })),
    ).toEqual({ ok: false, reason: 'SERVER_MISMATCH' });
    // admin can write to global regardless
    expect(canSendMessage('global', userOf({ role: 'admin', registered: false }))).toEqual({
      ok: true,
    });
  });
});

describe('accessDenyMessage', () => {
  it('returns korean messages for each reason', () => {
    expect(accessDenyMessage('INVALID_CHANNEL')).toContain('채널');
    expect(accessDenyMessage('NOT_AUTHENTICATED')).toContain('로그인');
    expect(accessDenyMessage('BANNED')).toContain('정지');
    expect(accessDenyMessage('SERVER_MISMATCH')).toContain('서버');
    expect(accessDenyMessage('MUNPA_MISMATCH')).toContain('문파');
  });
});
