/**
 * Sprint 17 / F17-A — lib/config/support.ts unit test.
 *
 * supportMailto() helper 검증 + 상수 fallback 검증.
 */
import { describe, it, expect } from 'vitest';
import { supportMailto, SUPPORT_EMAIL, AUTHOR_NAME } from './support';

describe('SUPPORT_EMAIL / AUTHOR_NAME 상수', () => {
  it('SUPPORT_EMAIL 은 비어있지 않은 string', () => {
    expect(typeof SUPPORT_EMAIL).toBe('string');
    expect(SUPPORT_EMAIL.length).toBeGreaterThan(0);
  });

  it('SUPPORT_EMAIL 은 @ 포함', () => {
    expect(SUPPORT_EMAIL).toMatch(/@/);
  });

  it('AUTHOR_NAME 은 비어있지 않은 string', () => {
    expect(typeof AUTHOR_NAME).toBe('string');
    expect(AUTHOR_NAME.length).toBeGreaterThan(0);
  });
});

describe('supportMailto()', () => {
  it('argument 없으면 plain mailto', () => {
    const result = supportMailto();
    expect(result).toBe(`mailto:${SUPPORT_EMAIL}`);
  });

  it('subject 만 전달 시 subject query 포함', () => {
    const result = supportMailto('문의 제목');
    expect(result).toContain('mailto:');
    expect(result).toContain('subject=');
    // URLSearchParams 는 form-urlencoded — space 는 + 로 인코딩.
    const params = new URLSearchParams(result.split('?')[1]);
    expect(params.get('subject')).toBe('문의 제목');
  });

  it('subject + body 모두 전달 시 둘 다 포함', () => {
    const result = supportMailto('제목', '본문 내용');
    expect(result).toContain('subject=');
    expect(result).toContain('body=');
    const params = new URLSearchParams(result.split('?')[1]);
    expect(params.get('subject')).toBe('제목');
    expect(params.get('body')).toBe('본문 내용');
  });

  it('subject 가 빈 문자열이면 query 없음', () => {
    const result = supportMailto('');
    expect(result).toBe(`mailto:${SUPPORT_EMAIL}`);
  });

  it('body 만 전달 (subject 없음) — body 만 query', () => {
    const result = supportMailto(undefined, '본문만');
    expect(result).toContain('body=');
    expect(result).not.toMatch(/subject=/);
  });

  it('한글 + 특수문자 모두 URLSearchParams 안전 처리', () => {
    const result = supportMailto('문의: 도와주세요!', 'hello & world');
    const params = new URLSearchParams(result.split('?')[1]);
    expect(params.get('subject')).toBe('문의: 도와주세요!');
    expect(params.get('body')).toBe('hello & world');
  });

  it('URLSearchParams 형식 (subject & body 사이 &)', () => {
    const result = supportMailto('a', 'b');
    // 첫 ? 이후가 query string
    const queryStart = result.indexOf('?');
    expect(queryStart).toBeGreaterThan(0);
    const query = result.slice(queryStart + 1);
    // & 로 두 파라미터 구분
    expect(query.split('&').length).toBe(2);
  });
});
