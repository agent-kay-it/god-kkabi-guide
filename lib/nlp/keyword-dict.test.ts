/**
 * lib/nlp/keyword-dict.ts — Sprint 22 F22-A 단위 테스트.
 */
import { describe, it, expect } from 'vitest';
import {
  PAIN_KEYWORDS,
  extractPainKeywords,
  excerptAround,
  getKeywordById,
} from './keyword-dict';

describe('PAIN_KEYWORDS 정적 데이터', () => {
  it('30개 미만이 아닌 충분한 키워드 (20+)', () => {
    expect(PAIN_KEYWORDS.length).toBeGreaterThanOrEqual(20);
  });

  it('모든 키워드의 id 가 unique', () => {
    const ids = PAIN_KEYWORDS.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 키워드의 category 가 유효 enum', () => {
    const valid = ['bug', 'balance', 'monetization', 'qol', 'event', 'class'];
    for (const k of PAIN_KEYWORDS) {
      expect(valid).toContain(k.category);
    }
  });

  it('모든 키워드의 severity 가 major/minor', () => {
    for (const k of PAIN_KEYWORDS) {
      expect(['major', 'minor']).toContain(k.severity);
    }
  });

  it('필수 카테고리 각각 1+ 키워드 존재', () => {
    for (const cat of ['bug', 'balance', 'monetization', 'qol']) {
      const count = PAIN_KEYWORDS.filter((k) => k.category === cat).length;
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('extractPainKeywords', () => {
  it('빈 문자열 → 빈 배열', () => {
    expect(extractPainKeywords('')).toEqual([]);
  });

  it('매칭 없는 텍스트 → 빈 배열', () => {
    expect(extractPainKeywords('아무런 내용')).toEqual([]);
  });

  it('단일 매칭 — "버그"', () => {
    const r = extractPainKeywords('버그가 계속 나요');
    expect(r.length).toBe(1);
    expect(r[0]?.keywordId).toBe('b_bug');
    expect(r[0]?.count).toBe(1);
    expect(r[0]?.firstIndex).toBe(0);
  });

  it('alias 매칭 — "벅스"', () => {
    const r = extractPainKeywords('벅스 진짜 많네요');
    expect(r[0]?.keywordId).toBe('b_bug');
  });

  it('case-insensitive — "OP" + "오피"', () => {
    const r = extractPainKeywords('op라서 사기에요');
    expect(r.find((m) => m.keywordId === 'l_op')).toBeDefined();
  });

  it('다중 매칭 — count 누적', () => {
    const r = extractPainKeywords('버그 너무 많아요 버그 버그 진짜');
    const bug = r.find((m) => m.keywordId === 'b_bug');
    expect(bug?.count).toBe(3);
  });

  it('다른 키워드 동시 매칭', () => {
    const r = extractPainKeywords('버그도 많고 너프도 심해요');
    expect(r.find((m) => m.keywordId === 'b_bug')).toBeDefined();
    expect(r.find((m) => m.keywordId === 'l_nerf')).toBeDefined();
  });

  it('firstIndex 정확', () => {
    const r = extractPainKeywords('처음부터 버그 발생');
    const bug = r.find((m) => m.keywordId === 'b_bug');
    expect(bug?.firstIndex).toBe(5);
  });
});

describe('excerptAround', () => {
  it('짧은 텍스트 → 전체 반환', () => {
    expect(excerptAround('짧은 텍스트', 3)).toBe('짧은 텍스트');
  });

  it('긴 텍스트 + 중간 위치 → 양쪽 …', () => {
    const long = 'a'.repeat(200) + 'X' + 'b'.repeat(200);
    const e = excerptAround(long, 200, 10);
    expect(e.startsWith('…')).toBe(true);
    expect(e.endsWith('…')).toBe(true);
    expect(e).toContain('X');
  });

  it('시작 위치 → 앞쪽 … 없음', () => {
    const text = 'X' + 'a'.repeat(200);
    const e = excerptAround(text, 0, 10);
    expect(e.startsWith('…')).toBe(false);
  });

  it('끝 위치 → 뒤쪽 … 없음', () => {
    const text = 'a'.repeat(200) + 'X';
    const e = excerptAround(text, 200, 10);
    expect(e.endsWith('…')).toBe(false);
  });

  it('공백 정규화 (multiple → single)', () => {
    const e = excerptAround('hello   world', 0, 100);
    expect(e).toBe('hello world');
  });

  it('default radius 50', () => {
    const long = 'a'.repeat(200);
    const e = excerptAround(long, 100);
    // 100자 (50 + 50) 정도 + … prefix/suffix
    expect(e.length).toBeLessThanOrEqual(102);
  });
});

describe('getKeywordById', () => {
  it('존재 id → 반환', () => {
    const k = getKeywordById('b_bug');
    expect(k?.term).toBe('버그');
  });

  it('미존재 id → undefined', () => {
    expect(getKeywordById('unknown')).toBeUndefined();
  });
});
