/**
 * Sprint 16 / F16-A — lib/subscription/guards unit test.
 */
import { describe, it, expect } from 'vitest';
import type { Session } from 'next-auth';
import { isPremium, shouldShowAds } from './guards';

function makeSession(overrides: Partial<Session['user']> = {}): Session {
  return {
    user: {
      id: 'uid-1',
      name: 'tester',
      email: 'a@b.com',
      role: 'user',
      registered: true,
      advertisingConsent: true,
      ...overrides,
    },
    expires: '2099-01-01',
  } as unknown as Session;
}

describe('isPremium()', () => {
  it('null session → false', () => {
    expect(isPremium(null)).toBe(false);
  });
  it('no user → false', () => {
    expect(isPremium({ user: null } as unknown as Session)).toBe(false);
  });
  it('tier=premium → true', () => {
    const s = makeSession({ tier: 'premium' } as unknown as Session['user']);
    expect(isPremium(s)).toBe(true);
  });
  it('tier=free → false', () => {
    const s = makeSession({ tier: 'free' } as unknown as Session['user']);
    expect(isPremium(s)).toBe(false);
  });
  it('tier 미설정 → false', () => {
    expect(isPremium(makeSession())).toBe(false);
  });
});

describe('shouldShowAds() — 우선순위 검증', () => {
  it('1순위: anonymous → false, reason=anonymous', () => {
    expect(shouldShowAds(null)).toEqual({ show: false, reason: 'anonymous' });
  });

  it('2순위: banned > 다른 모든 권한 → reason=banned', () => {
    const s = makeSession({ role: 'banned' });
    expect(shouldShowAds(s)).toEqual({ show: false, reason: 'banned' });
  });

  it('3순위: admin > premium/consent → reason=admin', () => {
    const s = makeSession({ role: 'admin' });
    expect(shouldShowAds(s)).toEqual({ show: false, reason: 'admin' });
  });

  it('4순위: premium > consent → reason=premium', () => {
    const s = makeSession({ tier: 'premium' } as unknown as Session['user']);
    expect(shouldShowAds(s)).toEqual({ show: false, reason: 'premium' });
  });

  it('5순위: !advertisingConsent → reason=no_consent', () => {
    const s = makeSession({ advertisingConsent: false });
    expect(shouldShowAds(s)).toEqual({ show: false, reason: 'no_consent' });
  });

  it('6순위: 모두 통과 → show=true', () => {
    expect(shouldShowAds(makeSession())).toEqual({ show: true });
  });

  it('banned + premium 동시 → banned 우선', () => {
    const s = makeSession({ role: 'banned', tier: 'premium' } as unknown as Session['user']);
    expect(shouldShowAds(s)).toEqual({ show: false, reason: 'banned' });
  });
});
