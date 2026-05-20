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

  it('Sprint 22 F22-C 이후 165 전체 시드 → "미시드 조합" 자체 없음', () => {
    // Sprint 22 F22-C 에서 165 전체 조합 시드 완료.
    // 이전 default fallback (B tier 50) 케이스는 invalid input (ids != 3) 에서만 발생.
    const synergy = getSynergy([
      'gunggwi',
      'sansin',
      'hong_gildong',
    ] as WikiJinryeongId[]);
    expect(synergy).not.toBeNull();
    expect(synergy?.tier).toBe('B'); // Sprint 22 placeholder 의 tier
    // score 는 시드된 값 (50-58 placeholder 또는 기존 시드)
    expect(synergy?.synergyScore).toBeGreaterThanOrEqual(50);
  });

  it('시드 결과의 ids 는 정렬됨 (alpha-sorted comboId 의 jinryeongIds)', () => {
    const synergy = getSynergy([
      'gunggwi',
      'hong_gildong',
      'sansin',
    ] as WikiJinryeongId[]);
    // 시드된 jinryeongIds 는 시드 작성 순서 그대로 (정렬은 comboId 만)
    expect(synergy?.jinryeongIds.length).toBe(3);
    expect(synergy?.comboId).toBe('gunggwi_hong_gildong_sansin');
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

  // ─── Sprint 19 F19-E — 32 → 51 확장 ───
  it('Sprint 19 F19-E — SEED 50+ 조합 정의됨', () => {
    expect(listAllSynergies().length).toBeGreaterThanOrEqual(50);
  });

  it('Sprint 19 F19-E — 직업별 분포 (warrior 8+ / swordsman 10+ / medium 12+)', () => {
    const all = listAllSynergies();
    const warriorCount = all.filter((x) => x.recommendedClass === 'warrior').length;
    const swordsmanCount = all.filter((x) => x.recommendedClass === 'swordsman').length;
    const mediumCount = all.filter((x) => x.recommendedClass === 'medium').length;
    expect(warriorCount).toBeGreaterThanOrEqual(8);
    expect(swordsmanCount).toBeGreaterThanOrEqual(10);
    expect(mediumCount).toBeGreaterThanOrEqual(12);
  });

  it('Sprint 19 F19-E — 미할당 (recommendedClass 없음) 6+ 존재', () => {
    const all = listAllSynergies();
    const unassigned = all.filter((x) => x.recommendedClass === undefined).length;
    expect(unassigned).toBeGreaterThanOrEqual(6);
  });

  it('Sprint 19 F19-E — score 50-95 범위 (미할당은 60대 이하)', () => {
    // Sprint 21 F21-B 에서 미할당 score 가 50 까지 확장됨
    for (const s of listAllSynergies()) {
      expect(s.synergyScore).toBeGreaterThanOrEqual(50);
      expect(s.synergyScore).toBeLessThanOrEqual(95);
    }
  });

  it('Sprint 19 F19-E — Sprint 18 의 32 기존 조합 score 변경 없음 (회귀)', () => {
    // 핵심 회귀 보호: Sprint 17/18 의 시드 score 가 유지되어야 함
    const all = listAllSynergies();
    const chiwooHangahHong = all.find(
      (s) =>
        s.jinryeongIds.includes('chiwoo' as never) &&
        s.jinryeongIds.includes('hangah' as never) &&
        s.jinryeongIds.includes('hong_gildong' as never),
    );
    expect(chiwooHangahHong?.synergyScore).toBe(95);
    expect(chiwooHangahHong?.tier).toBe('S');
  });

  // ─── Sprint 20 F20-E — 51 → 80 확장 ───
  it('Sprint 20 F20-E — SEED 80+ 조합 정의됨', () => {
    expect(listAllSynergies().length).toBeGreaterThanOrEqual(80);
  });

  it('Sprint 20 F20-E — 직업별 분포 (warrior 13+ / swordsman 15+ / medium 17+)', () => {
    const all = listAllSynergies();
    const warriorCount = all.filter((x) => x.recommendedClass === 'warrior').length;
    const swordsmanCount = all.filter((x) => x.recommendedClass === 'swordsman').length;
    const mediumCount = all.filter((x) => x.recommendedClass === 'medium').length;
    expect(warriorCount).toBeGreaterThanOrEqual(13);
    expect(swordsmanCount).toBeGreaterThanOrEqual(15);
    expect(mediumCount).toBeGreaterThanOrEqual(17);
  });

  it('Sprint 20 F20-E — 미할당 12+ 존재 (운영자 메타 검증 대기)', () => {
    const all = listAllSynergies();
    const unassigned = all.filter((x) => x.recommendedClass === undefined).length;
    expect(unassigned).toBeGreaterThanOrEqual(12);
  });

  it('Sprint 20 F20-E — Sprint 19 51 조합 score 변경 없음 (회귀)', () => {
    // Sprint 19 의 chiwoo + gyeoktugwi + sansin score=89 유지 확인
    const all = listAllSynergies();
    const sprint19 = all.find(
      (s) =>
        s.jinryeongIds.includes('chiwoo' as never) &&
        s.jinryeongIds.includes('gyeoktugwi' as never) &&
        s.jinryeongIds.includes('sansin' as never),
    );
    expect(sprint19?.synergyScore).toBe(89);
    expect(sprint19?.recommendedClass).toBe('warrior');
  });

  it('Sprint 20 F20-E — 모든 score 50-95 범위', () => {
    for (const s of listAllSynergies()) {
      expect(s.synergyScore).toBeGreaterThanOrEqual(50);
      expect(s.synergyScore).toBeLessThanOrEqual(95);
    }
  });

  // ─── Sprint 21 F21-B — 80 → 120 확장 ───
  it('Sprint 21 F21-B — SEED 120+ 조합 정의됨 (165 중 73%+)', () => {
    expect(listAllSynergies().length).toBeGreaterThanOrEqual(120);
  });

  it('Sprint 21 F21-B — 직업별 분포 (warrior 18+ / swordsman 19+ / medium 23+)', () => {
    const all = listAllSynergies();
    const warriorCount = all.filter((x) => x.recommendedClass === 'warrior').length;
    const swordsmanCount = all.filter((x) => x.recommendedClass === 'swordsman').length;
    const mediumCount = all.filter((x) => x.recommendedClass === 'medium').length;
    expect(warriorCount).toBeGreaterThanOrEqual(18);
    expect(swordsmanCount).toBeGreaterThanOrEqual(19);
    expect(mediumCount).toBeGreaterThanOrEqual(23);
  });

  it('Sprint 21 F21-B — 미할당 24+', () => {
    const unassigned = listAllSynergies().filter(
      (x) => x.recommendedClass === undefined,
    ).length;
    expect(unassigned).toBeGreaterThanOrEqual(24);
  });

  it('Sprint 21 F21-B — Sprint 20 의 80 조합 score 회귀 보호', () => {
    const all = listAllSynergies();
    // Sprint 20 의 chiwoo + gumiyoho + sansin 의 score 81 유지 확인
    const sprint20 = all.find(
      (s) =>
        s.jinryeongIds.includes('chiwoo' as never) &&
        s.jinryeongIds.includes('gumiyoho' as never) &&
        s.jinryeongIds.includes('sansin' as never),
    );
    expect(sprint20?.synergyScore).toBe(81);
    expect(sprint20?.recommendedClass).toBe('medium');
  });

  // ─── Sprint 22 F22-C — 165 전체 커버리지 ───
  it('Sprint 22 F22-C — SEED 165 (전체 C(11,3) 커버리지)', () => {
    expect(listAllSynergies().length).toBe(165);
  });

  it('Sprint 22 F22-C — comboId 165 unique', () => {
    const ids = listAllSynergies().map((s) => s.comboId);
    expect(new Set(ids).size).toBe(165);
  });

  it('Sprint 22 F22-C — Sprint 21 의 120 조합 score 회귀 보호', () => {
    const all = listAllSynergies();
    // Sprint 21 의 hong_gildong + myeongwang + seohaeyongwang score 88 유지
    const sprint21 = all.find(
      (s) =>
        s.jinryeongIds.includes('hong_gildong' as never) &&
        s.jinryeongIds.includes('myeongwang' as never) &&
        s.jinryeongIds.includes('seohaeyongwang' as never),
    );
    expect(sprint21?.synergyScore).toBe(88);
    expect(sprint21?.recommendedClass).toBe('warrior');
  });

  it('Sprint 22 F22-C — Sprint 22 placeholder 의 score 50-58', () => {
    const all = listAllSynergies();
    const placeholders = all.filter((s) =>
      s.description.includes('Sprint 22 placeholder'),
    );
    expect(placeholders.length).toBe(45);
    placeholders.forEach((p) => {
      expect(p.synergyScore).toBeGreaterThanOrEqual(50);
      expect(p.synergyScore).toBeLessThanOrEqual(58);
      expect(p.recommendedClass).toBeUndefined(); // 미할당
    });
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
