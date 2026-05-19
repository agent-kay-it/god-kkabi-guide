/**
 * Sprint 17 / F17-A — lib/personalization/related.ts unit test.
 *
 * 직업 → 추천 진령 / 진령 → 추천 직업 cross-reference 변환 검증.
 */
import { describe, it, expect } from 'vitest';
import {
  buildRelatedJinryeongForClass,
  buildRelatedClassesForJinryeong,
} from './related';
import type { WikiClassDoc, WikiJinryeongDoc } from '@/types/wiki';

describe('buildRelatedJinryeongForClass()', () => {
  it('recommendedJinryeong 없으면 빈 배열', () => {
    const classDoc: Omit<WikiClassDoc, 'updatedAt'> = {
      id: 'warrior',
      name: '전사',
      tagline: '근접 탱커',
      slug: 'warrior',
    } as unknown as Omit<WikiClassDoc, 'updatedAt'>;
    expect(buildRelatedJinryeongForClass(classDoc)).toEqual([]);
  });

  it('빈 배열이면 빈 결과', () => {
    const classDoc = {
      id: 'warrior',
      name: '전사',
      recommendedJinryeong: [],
    } as unknown as Omit<WikiClassDoc, 'updatedAt'>;
    expect(buildRelatedJinryeongForClass(classDoc)).toEqual([]);
  });

  it('시드에 없는 이름은 라벨만 표시 + /jinryeong fallback', () => {
    const classDoc = {
      id: 'warrior',
      name: '전사',
      recommendedJinryeong: ['존재하지않는진령'],
    } as unknown as Omit<WikiClassDoc, 'updatedAt'>;
    const result = buildRelatedJinryeongForClass(classDoc);
    expect(result.length).toBe(1);
    expect(result[0]?.href).toBe('/jinryeong');
    expect(result[0]?.label).toBe('존재하지않는진령');
  });

  it('각 항목은 href + label 필수', () => {
    const classDoc = {
      id: 'warrior',
      name: '전사',
      recommendedJinryeong: ['A', 'B'],
    } as unknown as Omit<WikiClassDoc, 'updatedAt'>;
    const result = buildRelatedJinryeongForClass(classDoc);
    for (const item of result) {
      expect(item.href).toBeTruthy();
      expect(item.label).toBeTruthy();
    }
  });
});

describe('buildRelatedClassesForJinryeong()', () => {
  it('recommendedClasses 없으면 빈 배열', () => {
    const jinryeong = {
      id: 'test-jin',
      name: '테스트진령',
    } as unknown as Omit<WikiJinryeongDoc, 'updatedAt'>;
    expect(buildRelatedClassesForJinryeong(jinryeong)).toEqual([]);
  });

  it('warrior/swordsman/medium 클래스 ID는 한글 라벨 변환', () => {
    const jinryeong = {
      id: 'jin-1',
      name: '진령1',
      recommendedClasses: ['warrior', 'swordsman', 'medium'],
    } as unknown as Omit<WikiJinryeongDoc, 'updatedAt'>;
    const result = buildRelatedClassesForJinryeong(jinryeong);
    expect(result.length).toBe(3);
    expect(result.map((r) => r.label)).toEqual(['전사', '검객', '영매']);
  });

  it('href 는 /class#{id} 형식', () => {
    const jinryeong = {
      id: 'jin-1',
      name: '진령1',
      recommendedClasses: ['warrior'],
    } as unknown as Omit<WikiJinryeongDoc, 'updatedAt'>;
    const result = buildRelatedClassesForJinryeong(jinryeong);
    expect(result[0]?.href).toBe('/class#warrior');
  });

  it('빈 배열이면 빈 결과', () => {
    const jinryeong = {
      id: 'jin-1',
      name: '진령1',
      recommendedClasses: [],
    } as unknown as Omit<WikiJinryeongDoc, 'updatedAt'>;
    expect(buildRelatedClassesForJinryeong(jinryeong)).toEqual([]);
  });
});
