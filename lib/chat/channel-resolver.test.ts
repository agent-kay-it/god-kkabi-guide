/**
 * vitest — channel-resolver pure domain tests.
 * 출처: docs/sprint/10-sprint-launch/design.md §4 + §7.3
 */
import { describe, it, expect } from 'vitest';

import {
  channelLabel,
  defaultChannelFor,
  formatChannelId,
  makeMunpaId,
  parseChannelId,
  resolveUserChannels,
  validateChannelId,
} from './channel-resolver';
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

describe('validateChannelId', () => {
  it('accepts global', () => {
    expect(validateChannelId('global')).toBe(true);
  });

  it('accepts well-formed server- prefix', () => {
    expect(validateChannelId('server-S785')).toBe(true);
    expect(validateChannelId('server-S1')).toBe(true);
    expect(validateChannelId('server-S9999')).toBe(true);
  });

  it('accepts well-formed munpa- prefix with korean name', () => {
    expect(validateChannelId('munpa-S785_갓깨비길드')).toBe(true);
    expect(validateChannelId('munpa-S1_ABC')).toBe(true);
  });

  it('rejects unknown prefix', () => {
    expect(validateChannelId('guild-S785')).toBe(false);
    expect(validateChannelId('room-1')).toBe(false);
    expect(validateChannelId('admin-S785')).toBe(false);
  });

  it('rejects control characters and path traversal', () => {
    expect(validateChannelId('global/../admin')).toBe(false);
    expect(validateChannelId('server-S785/foo')).toBe(false);
    expect(validateChannelId('server-S785.com')).toBe(false);
    expect(validateChannelId('munpa-x\n')).toBe(false);
    expect(validateChannelId('')).toBe(false);
  });

  it('rejects non-string', () => {
    // @ts-expect-error intentional invalid input
    expect(validateChannelId(123)).toBe(false);
    // @ts-expect-error intentional invalid input
    expect(validateChannelId(null)).toBe(false);
    // @ts-expect-error intentional invalid input
    expect(validateChannelId(undefined)).toBe(false);
  });

  it('rejects empty suffix', () => {
    expect(validateChannelId('server-')).toBe(false);
    expect(validateChannelId('munpa-')).toBe(false);
  });

  it('rejects overlong suffix', () => {
    expect(validateChannelId('server-' + 'A'.repeat(41))).toBe(false);
    expect(validateChannelId('munpa-' + 'A'.repeat(81))).toBe(false);
  });

  it('accepts boundary lengths', () => {
    expect(validateChannelId('server-' + 'A'.repeat(40))).toBe(true);
    expect(validateChannelId('munpa-' + 'A'.repeat(80))).toBe(true);
  });
});

describe('parseChannelId', () => {
  it('parses global', () => {
    expect(parseChannelId('global')).toEqual({ kind: 'global' });
  });

  it('parses server', () => {
    expect(parseChannelId('server-S785')).toEqual({
      kind: 'server',
      suffix: 'S785',
    });
  });

  it('parses munpa', () => {
    expect(parseChannelId('munpa-S785_갓깨비길드')).toEqual({
      kind: 'munpa',
      suffix: 'S785_갓깨비길드',
    });
  });

  it('returns null on invalid', () => {
    expect(parseChannelId('invalid')).toBeNull();
    expect(parseChannelId('server-')).toBeNull();
  });
});

describe('formatChannelId', () => {
  it('returns global', () => {
    expect(formatChannelId('global')).toBe('global');
  });

  it('formats server', () => {
    expect(formatChannelId('server', 'S785')).toBe('server-S785');
  });

  it('formats munpa', () => {
    expect(formatChannelId('munpa', 'S785_갓깨비길드')).toBe('munpa-S785_갓깨비길드');
  });

  it('throws when non-global is missing suffix', () => {
    expect(() => formatChannelId('server')).toThrow();
    expect(() => formatChannelId('munpa')).toThrow();
  });
});

describe('channelLabel', () => {
  it('labels global', () => {
    expect(channelLabel({ kind: 'global' })).toBe('전체');
  });

  it('labels server with id', () => {
    expect(channelLabel({ kind: 'server', suffix: 'S785' })).toBe('서버 S785');
  });

  it('labels munpa with name extracted', () => {
    expect(channelLabel({ kind: 'munpa', suffix: 'S785_갓깨비길드' })).toBe('문파 갓깨비길드');
  });
});

describe('resolveUserChannels', () => {
  it('returns 3 entries for fully-registered user', () => {
    const entries = resolveUserChannels(userOf());
    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({ kind: 'global', available: true });
    expect(entries[1]).toMatchObject({
      kind: 'server',
      id: 'server-S785',
      available: true,
    });
    expect(entries[2]).toMatchObject({
      kind: 'munpa',
      id: 'munpa-S785_갓깨비길드',
      available: true,
    });
  });

  it('disables server tab when serverId missing', () => {
    const entries = resolveUserChannels(userOf({ serverId: undefined }));
    expect(entries[1]).toMatchObject({ available: false, disabledReason: 'NO_SERVER' });
  });

  it('disables munpa tab when munpaId missing', () => {
    const entries = resolveUserChannels(userOf({ munpaId: undefined }));
    expect(entries[2]).toMatchObject({ available: false, disabledReason: 'NO_MUNPA' });
  });

  it('disables all channels for banned user', () => {
    const entries = resolveUserChannels(userOf({ role: 'banned' }));
    expect(entries.every((e) => !e.available)).toBe(true);
    expect(entries.every((e) => e.disabledReason === 'BANNED')).toBe(true);
  });
});

describe('defaultChannelFor', () => {
  it('prefers munpa over server', () => {
    expect(defaultChannelFor(userOf())).toBe('munpa-S785_갓깨비길드');
  });

  it('falls back to server when munpa missing', () => {
    expect(defaultChannelFor(userOf({ munpaId: undefined }))).toBe('server-S785');
  });

  it('falls back to global when both missing', () => {
    expect(defaultChannelFor(userOf({ serverId: undefined, munpaId: undefined }))).toBe('global');
  });

  it('returns global for banned user', () => {
    expect(defaultChannelFor(userOf({ role: 'banned' }))).toBe('global');
  });
});

describe('makeMunpaId', () => {
  it('formats stable munpa id', () => {
    expect(makeMunpaId('S785', '갓깨비길드')).toBe('S785_갓깨비길드');
  });
});
