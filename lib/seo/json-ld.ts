/**
 * JSON-LD escape helper — Sprint 15 / F15-I (extracted from
 * components/feature/structured-data.tsx 의 escapeJsonLd).
 *
 * 동일 함수의 단위 테스트 + 향후 다른 컴포넌트 재사용을 위해 lib 으로 분리.
 *
 * 정책:
 * - JSON.stringify 결과의 HTML 특수 문자 + JS literal terminator 모두 escape
 * - 'less-than slash script' 시퀀스 차단 (XSS 방어)
 * - U+2028 / U+2029 line terminator 회피 (JS literal SyntaxError 방지)
 */

const LT_RE = /</g;
const GT_RE = />/g;
const AMP_RE = /&/g;
const APOS_RE = /'/g;
const LINE_SEP_RE = new RegExp(String.fromCharCode(0x2028), 'g');
const PARA_SEP_RE = new RegExp(String.fromCharCode(0x2029), 'g');

export function escapeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(LT_RE, '\\u003c')
    .replace(GT_RE, '\\u003e')
    .replace(AMP_RE, '\\u0026')
    .replace(APOS_RE, '\\u0027')
    .replace(LINE_SEP_RE, '\\u2028')
    .replace(PARA_SEP_RE, '\\u2029');
}
