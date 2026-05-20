/**
 * components/feature/recommendation-card.tsx — Sprint 21 F21-D RTL 테스트.
 */
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { RecommendationCard } from './recommendation-card';
import type { RecommendationResult } from '@/lib/simulator/recommend';

afterEach(() => cleanup());

const tier1Synergy = {
  synergy: {
    comboId: 'chiwoo_hangah_hong_gildong',
    jinryeongIds: ['chiwoo', 'hangah', 'hong_gildong'] as never,
    synergyScore: 95,
    tier: 'S' as const,
    recommendedClass: 'warrior' as const,
    description: '전사 메타 — 치우 광역',
    note: '결투장 1티어',
  },
  rank: 1,
  missingFromOwned: [],
  matchesClass: true,
};

const tier2Synergy = {
  synergy: {
    comboId: 'a_b_c',
    jinryeongIds: ['a', 'b', 'c'] as never,
    synergyScore: 85,
    tier: 'A' as const,
    description: '균형 빌드',
  },
  rank: 2,
  missingFromOwned: ['a' as never],
  matchesClass: false,
};

describe('RecommendationCard', () => {
  it('헤더 "추천 빌드 top 3" 표시', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: true,
      ownedCount: 3,
      synergies: [tier1Synergy],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.getByText('추천 빌드 top 3')).toBeTruthy();
  });

  it('userClass 지정 시 헤더에 Badge 표시', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: true,
      ownedCount: 3,
      synergies: [tier1Synergy],
    };
    render(<RecommendationCard result={result} userClass="warrior" />);
    expect(screen.getByText('warrior')).toBeTruthy();
  });

  it('hasEnoughJinryeong=false → 안내 메시지', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: false,
      ownedCount: 2,
      synergies: [tier1Synergy],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.getByText(/보유 진령이 2개입니다/)).toBeTruthy();
  });

  it('hasEnoughJinryeong=true → 안내 메시지 없음', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: true,
      ownedCount: 5,
      synergies: [tier1Synergy],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.queryByText(/보유 진령이/)).toBeNull();
  });

  it('각 추천의 score / tier / description 표시', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: true,
      ownedCount: 3,
      synergies: [tier1Synergy],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.getByText('#1')).toBeTruthy();
    expect(screen.getByText(/점수 95/)).toBeTruthy();
    expect(screen.getByText('전사 메타 — 치우 광역')).toBeTruthy();
    expect(screen.getByText('결투장 1티어')).toBeTruthy();
  });

  it('matchesClass=true → "직업 적합" Badge', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: true,
      ownedCount: 3,
      synergies: [tier1Synergy],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.getByText('직업 적합')).toBeTruthy();
  });

  it('matchesClass=false → "직업 적합" Badge 없음', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: true,
      ownedCount: 3,
      synergies: [tier2Synergy],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.queryByText('직업 적합')).toBeNull();
  });

  it('missingFromOwned 표시', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: false,
      ownedCount: 2,
      synergies: [tier2Synergy],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.getByText(/미보유: a/)).toBeTruthy();
  });

  it('missingFromOwned 빈 배열 → 미보유 텍스트 없음', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: true,
      ownedCount: 3,
      synergies: [tier1Synergy],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.queryByText(/미보유:/)).toBeNull();
  });

  it('list role + listitem 3개', () => {
    const result: RecommendationResult = {
      hasEnoughJinryeong: true,
      ownedCount: 6,
      synergies: [tier1Synergy, tier2Synergy, { ...tier1Synergy, rank: 3, synergy: { ...tier1Synergy.synergy, comboId: 'x_y_z' } }],
    };
    render(<RecommendationCard result={result} />);
    expect(screen.getAllByRole('listitem').length).toBe(3);
  });
});
