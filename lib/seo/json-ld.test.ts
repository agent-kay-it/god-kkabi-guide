/**
 * Sprint 15 / F15-I — escapeJsonLd unit test.
 */
import { describe, it, expect } from 'vitest';
import { escapeJsonLd } from './json-ld';

describe('escapeJsonLd', () => {
  it('일반 객체를 JSON 문자열로 직렬화', () => {
    expect(escapeJsonLd({ a: 1, b: 'hello' })).toBe('{"a":1,"b":"hello"}');
  });

  it('< > & 를 unicode escape (XSS 차단)', () => {
    const out = escapeJsonLd({ html: '<script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).toContain('\\u003c');
    expect(out).toContain('\\u003e');
  });

  it('& 도 escape (parent script context attribute 우회 방지)', () => {
    const out = escapeJsonLd({ q: 'a&b' });
    expect(out).toContain('\\u0026');
    expect(out).not.toContain('a&b');
  });

  it("' 도 escape (single-quote attribute 우회)", () => {
    const out = escapeJsonLd({ q: "it's" });
    expect(out).toContain('\\u0027');
    expect(out).not.toContain("it's");
  });

  it('U+2028 line separator escape (JS literal SyntaxError 방지)', () => {
    const ls = String.fromCharCode(0x2028);
    const out = escapeJsonLd({ q: `before${ls}after` });
    expect(out).toContain('\\u2028');
    expect(out).not.toContain(ls);
  });

  it('U+2029 paragraph separator escape', () => {
    const ps = String.fromCharCode(0x2029);
    const out = escapeJsonLd({ q: `before${ps}after` });
    expect(out).toContain('\\u2029');
    expect(out).not.toContain(ps);
  });

  it('실제 JSON-LD 의 구조 보존 (객체 / 배열 / 중첩)', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'test',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://example.com?q={search_term_string}',
      },
    };
    const out = escapeJsonLd(data);
    const parsed = JSON.parse(
      out
        .replace(/\\u003c/g, '<')
        .replace(/\\u003e/g, '>')
        .replace(/\\u0026/g, '&')
        .replace(/\\u0027/g, "'"),
    );
    expect(parsed).toEqual(data);
  });

  it('null 처리 (undefined 는 JSON.stringify 가 undefined 반환 → 의도된 동작)', () => {
    expect(escapeJsonLd(null)).toBe('null');
    // JSON.stringify(undefined) === undefined → .replace 호출 시 TypeError
    expect(() => escapeJsonLd(undefined)).toThrow();
  });

  it('숫자 / 불리언', () => {
    expect(escapeJsonLd(42)).toBe('42');
    expect(escapeJsonLd(true)).toBe('true');
    expect(escapeJsonLd(false)).toBe('false');
  });
});
