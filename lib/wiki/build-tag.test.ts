/**
 * Sprint 16 / F16-A — lib/wiki/build-tag unit test.
 */
import { describe, it, expect } from 'vitest';
import { getBuildTagVariant, isMetaTag } from './build-tag';

describe('getBuildTagVariant()', () => {
  it('전투 콘텐츠 → vermilion', () => {
    expect(getBuildTagVariant('pvp')).toBe('vermilion');
    expect(getBuildTagVariant('결투장')).toBe('vermilion');
  });

  it('콘텐츠 클리어 → jade', () => {
    expect(getBuildTagVariant('pve')).toBe('jade');
    expect(getBuildTagVariant('boss')).toBe('jade');
    expect(getBuildTagVariant('무한던전')).toBe('jade');
    expect(getBuildTagVariant('비경')).toBe('jade');
  });

  it('레벨 라벨 + meta → bronze', () => {
    expect(getBuildTagVariant('초보')).toBe('bronze');
    expect(getBuildTagVariant('중수')).toBe('bronze');
    expect(getBuildTagVariant('고수')).toBe('bronze');
    expect(getBuildTagVariant('meta')).toBe('bronze');
  });

  it('experimental → indigo', () => {
    expect(getBuildTagVariant('experimental')).toBe('indigo');
  });
});

describe('isMetaTag()', () => {
  it('meta → true', () => {
    expect(isMetaTag('meta')).toBe(true);
  });

  it('non-meta → false', () => {
    expect(isMetaTag('pvp')).toBe(false);
    expect(isMetaTag('pve')).toBe(false);
    expect(isMetaTag('boss')).toBe(false);
    expect(isMetaTag('experimental')).toBe(false);
    expect(isMetaTag('초보')).toBe(false);
  });
});
