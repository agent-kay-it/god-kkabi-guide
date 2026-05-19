/**
 * Sprint 18 / F18-A — types/firestore.ts unit test.
 *
 * isBuildTag / isClassId 타입 guard 검증.
 */
import { describe, it, expect } from 'vitest';
import { isBuildTag, isClassId, BUILD_TAGS } from './firestore';

describe('isBuildTag()', () => {
  it('BUILD_TAGS 에 포함된 모든 값 true', () => {
    for (const tag of BUILD_TAGS) {
      expect(isBuildTag(tag)).toBe(true);
    }
  });

  it('빈 문자열 false', () => {
    expect(isBuildTag('')).toBe(false);
  });

  it('무관한 문자열 false', () => {
    expect(isBuildTag('not_a_tag')).toBe(false);
    expect(isBuildTag('random123')).toBe(false);
  });

  it('대소문자 구분', () => {
    // BUILD_TAGS 는 lowercase 한글 라벨
    expect(isBuildTag('PVP')).toBe(false);
  });

  it('BUILD_TAGS 가 비어있지 않음', () => {
    expect(BUILD_TAGS.length).toBeGreaterThan(0);
  });
});

describe('isClassId()', () => {
  it('warrior true', () => {
    expect(isClassId('warrior')).toBe(true);
  });

  it('swordsman true', () => {
    expect(isClassId('swordsman')).toBe(true);
  });

  it('medium true', () => {
    expect(isClassId('medium')).toBe(true);
  });

  it('mage false (없는 직업)', () => {
    expect(isClassId('mage')).toBe(false);
  });

  it('대소문자 구분', () => {
    expect(isClassId('Warrior')).toBe(false);
    expect(isClassId('WARRIOR')).toBe(false);
  });

  it('빈 문자열 false', () => {
    expect(isClassId('')).toBe(false);
  });
});
