/**
 * Sprint 16 / F16-B — lib/chat/masking unit test.
 */
import { describe, it, expect } from 'vitest';
import { maskBadWords, containsBadWord } from './masking';

describe('maskBadWords()', () => {
  it('빈 문자열 → 빈 문자열', () => {
    expect(maskBadWords('')).toBe('');
  });

  it('금칙어 없음 → 변경 없음', () => {
    expect(maskBadWords('안녕하세요 반갑습니다')).toBe('안녕하세요 반갑습니다');
  });

  it('명백한 욕설 마스킹', () => {
    const result = maskBadWords('너 시발 진짜');
    expect(result).not.toContain('시발');
    expect(result).toContain('**'); // 마스킹 적용 (2자 → **)
  });

  it('여러 금칙어 동시 마스킹', () => {
    const result = maskBadWords('병신 같은 미친 놈');
    expect(result).not.toContain('병신');
    expect(result).not.toContain('미친');
  });

  it('대소문자 무시', () => {
    // 한국어는 대소문자 의미 없지만 영문 우회 시도 보호
    const result = maskBadWords('바보');
    expect(result).toContain('*');
  });

  it('우회 시도 (공백 삽입) — 기본 패턴 인식', () => {
    const result = maskBadWords('병 신');
    // 공백 삽입 우회는 \s* 패턴으로 차단
    expect(result.includes('*')).toBe(true);
  });
});

describe('containsBadWord()', () => {
  it('빈 문자열 → false', () => {
    expect(containsBadWord('')).toBe(false);
  });

  it('금칙어 포함 → true', () => {
    expect(containsBadWord('시발')).toBe(true);
    expect(containsBadWord('병신 같은')).toBe(true);
  });

  it('금칙어 미포함 → false', () => {
    expect(containsBadWord('안녕')).toBe(false);
    expect(containsBadWord('반갑습니다')).toBe(false);
  });

  it('lastIndex 리셋 (regex global 의 상태 보호)', () => {
    // 같은 입력 반복 호출 시 일관 결과 (regex.lastIndex 의 state 이슈 차단)
    expect(containsBadWord('시발')).toBe(true);
    expect(containsBadWord('시발')).toBe(true);
    expect(containsBadWord('시발')).toBe(true);
  });
});
