/**
 * Sprint 16 / F16-A — lib/simulator/synergy-matrix unit test.
 */
import { describe, it, expect } from 'vitest';
import { getSynergy, listAllSynergies, suggestClass } from './synergy-matrix';
import type { WikiJinryeongId } from '@/types/wiki';

describe('getSynergy()', () => {
  it('3개 미만 ids → null', () => {
    expect(getSynergy([] as unknown as WikiJinryeongId[])).toBeNull();
    expect(getSynergy(['chiwoo'] as WikiJinryeongId[])).toBeNull();
    expect(getSynergy(['chiwoo', 'hangah'] as WikiJinryeongId[])).toBeNull();
  });

  it('3개 초과 ids → null', () => {
    expect(
      getSynergy([
        'chiwoo',
        'hangah',
        'hong_gildong',
        'sansin',
      ] as WikiJinryeongId[]),
    ).toBeNull();
  });

  it('시드된 조합 (전사 메타) → S tier 95점', () => {
    const synergy = getSynergy(['chiwoo', 'hangah', 'hong_gildong'] as WikiJinryeongId[]);
    expect(synergy).not.toBeNull();
    expect(synergy?.tier).toBe('S');
    expect(synergy?.synergyScore).toBe(95);
    expect(synergy?.recommendedClass).toBe('warrior');
  });

  it('시드 순서 무관 (정렬 후 comboId)', () => {
    const a = getSynergy(['chiwoo', 'hangah', 'hong_gildong'] as WikiJinryeongId[]);
    const b = getSynergy(['hong_gildong', 'chiwoo', 'hangah'] as WikiJinryeongId[]);
    const c = getSynergy(['hangah', 'hong_gildong', 'chiwoo'] as WikiJinryeongId[]);
    expect(a?.comboId).toBe(b?.comboId);
    expect(b?.comboId).toBe(c?.comboId);
    expect(a?.tier).toBe(b?.tier);
  });

  it('시드 안 된 조합 → B tier 50점 default', () => {
    const synergy = getSynergy([
      'gunggwi',
      'sansin',
      'hong_gildong',
    ] as WikiJinryeongId[]);
    expect(synergy).not.toBeNull();
    expect(synergy?.tier).toBe('B');
    expect(synergy?.synergyScore).toBe(50);
  });

  it('default 결과의 ids 는 정렬됨', () => {
    const synergy = getSynergy([
      'gunggwi',
      'hong_gildong',
      'sansin',
    ] as WikiJinryeongId[]);
    expect(synergy?.jinryeongIds).toEqual([...synergy!.jinryeongIds].sort());
  });
});

describe('listAllSynergies()', () => {
  it('seed 가 1개 이상 존재', () => {
    expect(listAllSynergies().length).toBeGreaterThan(0);
  });

  it('모든 seed 는 tier 가 정의됨', () => {
    for (const s of listAllSynergies()) {
      expect(['S', 'A', 'B', 'C']).toContain(s.tier);
    }
  });

  it('모든 seed 의 synergyScore 는 0~100', () => {
    for (const s of listAllSynergies()) {
      expect(s.synergyScore).toBeGreaterThanOrEqual(0);
      expect(s.synergyScore).toBeLessThanOrEqual(100);
    }
  });

  it('S tier 는 score 85+', () => {
    for (const s of listAllSynergies().filter((x) => x.tier === 'S')) {
      expect(s.synergyScore).toBeGreaterThanOrEqual(85);
    }
  });

  // Sprint 18 F18-D — 30+ seed coverage 검증
  it('Sprint 18 F18-D — SEED 30+ 조합 정의됨', () => {
    expect(listAllSynergies().length).toBeGreaterThanOrEqual(30);
  });

  it('Sprint 18 F18-D — 직업별 추천 분포 (warrior + swordsman + medium 각 5+)', () => {
    const all = listAllSynergies();
    const warriorCount = all.filter((x) => x.recommendedClass === 'warrior').length;
    const swordsmanCount = all.filter((x) => x.recommendedClass === 'swordsman').length;
    const mediumCount = all.filter((x) => x.recommendedClass === 'medium').length;
    expect(warriorCount).toBeGreaterThanOrEqual(5);
    expect(swordsmanCount).toBeGreaterThanOrEqual(5);
    expect(mediumCount).toBeGreaterThanOrEqual(5);
  });

  it('Sprint 18 F18-D — comboId 중복 없음 (alpha-sorted unique key)', () => {
    const all = listAllSynergies();
    const ids = all.map((x) => x.comboId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('Sprint 18 F18-D — 모든 score 50-95 범위', () => {
    for (const s of listAllSynergies()) {
      expect(s.synergyScore).toBeGreaterThanOrEqual(50);
      expect(s.synergyScore).toBeLessThanOrEqual(95);
    }
  });

  it('Sprint 18 F18-D — 모든 tier 가 S/A/B/C 중 하나', () => {
    const validTiers = ['S', 'A', 'B', 'C'];
    for (const s of listAllSynergies()) {
      expect(validTiers).toContain(s.tier);
    }
  });

  it('Sprint 18 F18-D — description 비어있지 않음', () => {
    for (const s of listAllSynergies()) {
      expect(s.description).toBeTruthy();
      expect(s.description.length).toBeGreaterThan(0);
    }
  });
});

describe('suggestClass()', () => {
  it('recommendedClass 반환', () => {
    const synergy = getSynergy(['chiwoo', 'hangah', 'hong_gildong'] as WikiJinryeongId[])!;
    expect(suggestClass(synergy)).toBe('warrior');
  });

  it('recommendedClass undefined → undefined', () => {
    const synergy = {
      comboId: 'x',
      jinryeongIds: ['a', 'b', 'c'] as unknown as [
        WikiJinryeongId,
        WikiJinryeongId,
        WikiJinryeongId,
      ],
      synergyScore: 50,
      tier: 'B' as const,
      description: '',
    };
    expect(suggestClass(synergy)).toBeUndefined();
  });
});
