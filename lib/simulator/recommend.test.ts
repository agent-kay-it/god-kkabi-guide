/**
 * lib/simulator/recommend.ts — Sprint 20 F20-H 단위 테스트.
 */
import { describe, it, expect } from 'vitest';
import { recommendBuilds, recommendSingleBuild } from './recommend';
import type { WikiJinryeongId } from '@/types/wiki';

const ALL_11: readonly WikiJinryeongId[] = [
  'hong_gildong',
  'seohaeyongwang',
  'eumyeonggwi',
  'myeongwang',
  'chiwoo',
  'hangah',
  'gyeoktugwi',
  'gumiyoho',
  'taeyangyeosin',
  'gunggwi',
  'sansin',
] as never;

describe('recommendBuilds — 보유 진령 < 3', () => {
  it('빈 배열 → hasEnoughJinryeong=false + top 3 (global)', () => {
    const r = recommendBuilds({ ownedJinryeong: [] });
    expect(r.hasEnoughJinryeong).toBe(false);
    expect(r.ownedCount).toBe(0);
    expect(r.synergies.length).toBe(3);
    expect(r.synergies[0]?.rank).toBe(1);
    // 모든 추천이 missingFromOwned 3개 (보유 0)
    r.synergies.forEach((s) => {
      expect(s.missingFromOwned.length).toBe(3);
    });
  });

  it('보유 2개 → hasEnoughJinryeong=false + missingFromOwned 1-3', () => {
    const r = recommendBuilds({
      ownedJinryeong: ['chiwoo', 'hangah'] as never,
    });
    expect(r.hasEnoughJinryeong).toBe(false);
    expect(r.ownedCount).toBe(2);
    expect(r.synergies.length).toBe(3);
    // 각 추천의 missing 은 1-3 사이
    r.synergies.forEach((s) => {
      expect(s.missingFromOwned.length).toBeGreaterThanOrEqual(1);
      expect(s.missingFromOwned.length).toBeLessThanOrEqual(3);
    });
  });

  it('중복 진령 input → set 변환 후 ownedCount 정확', () => {
    const r = recommendBuilds({
      ownedJinryeong: ['chiwoo', 'chiwoo', 'hangah'] as never,
    });
    expect(r.ownedCount).toBe(2); // 중복 제거
    expect(r.hasEnoughJinryeong).toBe(false);
  });

  it('global top 3 의 1번째는 S tier (score 85+)', () => {
    const r = recommendBuilds({ ownedJinryeong: [] });
    expect(r.synergies[0]?.synergy.synergyScore).toBeGreaterThanOrEqual(85);
    expect(r.synergies[0]?.synergy.tier).toBe('S');
  });

  it('classId 지정 시 match 우선 정렬 (warrior)', () => {
    const r = recommendBuilds({
      ownedJinryeong: [],
      classId: 'warrior',
    });
    // top 1 은 warrior 추천이어야 함 (score 동률 시)
    expect(r.synergies[0]?.synergy.recommendedClass).toBe('warrior');
    expect(r.synergies[0]?.matchesClass).toBe(true);
  });

  it('classId 지정 시 match 우선 정렬 (medium)', () => {
    const r = recommendBuilds({
      ownedJinryeong: [],
      classId: 'medium',
    });
    expect(r.synergies[0]?.synergy.recommendedClass).toBe('medium');
    expect(r.synergies[0]?.matchesClass).toBe(true);
  });
});

describe('recommendBuilds — 보유 진령 3+', () => {
  it('정확히 3개 → C(3,3)=1 조합', () => {
    const r = recommendBuilds({
      ownedJinryeong: ['chiwoo', 'hangah', 'hong_gildong'] as never,
    });
    expect(r.hasEnoughJinryeong).toBe(true);
    expect(r.ownedCount).toBe(3);
    expect(r.synergies.length).toBe(1);
    // 보유 진령으로만 조합한 경우 missingFromOwned = []
    expect(r.synergies[0]?.missingFromOwned).toEqual([]);
    // chiwoo+hangah+hong_gildong = score 95 (S tier)
    expect(r.synergies[0]?.synergy.synergyScore).toBe(95);
  });

  it('보유 4개 → C(4,3)=4 → top 3', () => {
    const r = recommendBuilds({
      ownedJinryeong: ['chiwoo', 'hangah', 'hong_gildong', 'sansin'] as never,
    });
    expect(r.synergies.length).toBe(3);
    expect(r.synergies[0]?.rank).toBe(1);
    expect(r.synergies[2]?.rank).toBe(3);
    // score desc 정렬 확인
    for (let i = 1; i < r.synergies.length; i++) {
      const prev = r.synergies[i - 1]?.synergy.synergyScore ?? 0;
      const curr = r.synergies[i]?.synergy.synergyScore ?? 0;
      expect(curr).toBeLessThanOrEqual(prev);
    }
  });

  it('보유 11개 (전체) → C(11,3)=165 → top 3', () => {
    const r = recommendBuilds({ ownedJinryeong: ALL_11 });
    expect(r.hasEnoughJinryeong).toBe(true);
    expect(r.ownedCount).toBe(11);
    expect(r.synergies.length).toBe(3);
    // 1위는 S tier 최고 score
    expect(r.synergies[0]?.synergy.synergyScore).toBe(95);
    // 모든 missing 빈 배열
    r.synergies.forEach((s) => {
      expect(s.missingFromOwned).toEqual([]);
    });
  });

  it('classId 일치 우선 — warrior 보유 시', () => {
    const r = recommendBuilds({
      ownedJinryeong: ALL_11,
      classId: 'warrior',
    });
    // 1위는 warrior 추천
    expect(r.synergies[0]?.synergy.recommendedClass).toBe('warrior');
    expect(r.synergies[0]?.matchesClass).toBe(true);
  });

  it('classId 일치 우선 — medium 보유 시', () => {
    const r = recommendBuilds({
      ownedJinryeong: ALL_11,
      classId: 'medium',
    });
    expect(r.synergies[0]?.synergy.recommendedClass).toBe('medium');
  });

  it('matchesClass 플래그 정확 (mismatch 도 표시)', () => {
    const r = recommendBuilds({
      ownedJinryeong: ALL_11,
      classId: 'swordsman',
    });
    r.synergies.forEach((s) => {
      expect(s.matchesClass).toBe(s.synergy.recommendedClass === 'swordsman');
    });
  });

  it('classId 없음 — pure score desc', () => {
    const r = recommendBuilds({ ownedJinryeong: ALL_11 });
    // matchesClass 는 모두 false (classId 미지정)
    r.synergies.forEach((s) => {
      expect(s.matchesClass).toBe(false);
    });
  });
});

describe('recommendSingleBuild — helper', () => {
  it('진령 3개 정확 → 시너지 반환', () => {
    const r = recommendSingleBuild([
      'chiwoo',
      'hangah',
      'hong_gildong',
    ] as never);
    expect(r).not.toBeNull();
    expect(r?.synergyScore).toBe(95);
  });

  it('진령 < 3 → null', () => {
    expect(recommendSingleBuild(['chiwoo'] as never)).toBeNull();
    expect(recommendSingleBuild(['chiwoo', 'hangah'] as never)).toBeNull();
  });

  it('진령 > 3 → null', () => {
    expect(
      recommendSingleBuild([
        'chiwoo',
        'hangah',
        'hong_gildong',
        'sansin',
      ] as never),
    ).toBeNull();
  });

  it('미시드 조합 → default B tier 50', () => {
    const r = recommendSingleBuild([
      'gunggwi',
      'gumiyoho',
      'myeongwang',
    ] as never);
    expect(r).not.toBeNull();
    if (r) {
      expect(r.tier).toBe('B');
      // score 가 시드 (55) 이거나 default 50 — 둘 다 50 이상
      expect(r.synergyScore).toBeGreaterThanOrEqual(50);
    }
  });
});

describe('회귀 보호', () => {
  it('전체 진령 보유 시 top 3 는 모두 score 90+ (S tier)', () => {
    const r = recommendBuilds({ ownedJinryeong: ALL_11 });
    r.synergies.forEach((s) => {
      expect(s.synergy.synergyScore).toBeGreaterThanOrEqual(90);
    });
  });

  it('보유 진령 0 + classId 지정 → 첫 추천은 해당 classId', () => {
    for (const cls of ['warrior', 'swordsman', 'medium'] as const) {
      const r = recommendBuilds({ ownedJinryeong: [], classId: cls });
      expect(r.synergies[0]?.synergy.recommendedClass).toBe(cls);
    }
  });
});
