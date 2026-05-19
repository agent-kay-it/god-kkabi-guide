/**
 * Sprint 15 / F15-I — escapeJsonLd 의 실제 schema.org payload integration.
 *
 * 본 test 는 production 에서 실제 사용되는 JSON-LD payload (WebSite, Article,
 * BreadcrumbList) 가 escape 후에도 valid JSON 으로 parse 되는지 검증.
 */
import { describe, it, expect } from 'vitest';
import { escapeJsonLd } from '../json-ld';

function unescape(s: string): string {
  return s
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>')
    .replace(/\\u0026/g, '&')
    .replace(/\\u0027/g, "'")
    .replace(/\\u2028/g, String.fromCharCode(0x2028))
    .replace(/\\u2029/g, String.fromCharCode(0x2029));
}

describe('escapeJsonLd integration (real schema.org payloads)', () => {
  it('WebSite + SearchAction payload', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '갓깨비 키우기 비공식 팬 가이드',
      url: 'https://kkaebizigi.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://kkaebizigi.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    };
    const out = escapeJsonLd(payload);
    expect(JSON.parse(unescape(out))).toEqual(payload);
  });

  it('Article payload (한국어 + 특수 문자)', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: '갓깨비 키우기 < 가이드 >',
      author: { '@type': 'Person', name: '무명랑' },
      datePublished: '2026-05-19',
      image: ['https://cdn.kkaebizigi.com/post-1.webp'],
    };
    const out = escapeJsonLd(payload);
    // < > 모두 escape 되었는지 확인
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    // 원본으로 복원 가능
    expect(JSON.parse(unescape(out))).toEqual(payload);
  });

  it('BreadcrumbList payload', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://kkaebizigi.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: '직업',
          item: 'https://kkaebizigi.com/class',
        },
      ],
    };
    const out = escapeJsonLd(payload);
    expect(JSON.parse(unescape(out))).toEqual(payload);
  });

  it('script injection payload — `</script>` 시퀀스 차단', () => {
    const payload = {
      description: '본문 </script><script>alert(1)</script>',
    };
    const out = escapeJsonLd(payload);
    // 결과 문자열에 `</script>` 시퀀스가 그대로 남아있지 않아야 함
    expect(out).not.toMatch(/<\/script>/i);
    // 모든 < > 가 escape 되었으므로 HTML 컨텍스트에 그대로 inject 해도 안전
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
  });

  it('U+2028 line separator 가 payload 본문에 들어가도 JS literal 안전', () => {
    const ls = String.fromCharCode(0x2028);
    const ps = String.fromCharCode(0x2029);
    const payload = { description: `본문${ls}줄바꿈${ps}문단` };
    const out = escapeJsonLd(payload);
    expect(out).not.toContain(ls);
    expect(out).not.toContain(ps);
    expect(JSON.parse(unescape(out))).toEqual(payload);
  });
});
