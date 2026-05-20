/**
 * app/robots.ts — Sprint 24 F24-A 단위 테스트.
 */
// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

async function loadRobots() {
  // SITE_URL 환경변수가 모듈 로드 시점에 캡처되므로 vi.resetModules + dynamic import 필요.
  const mod = await import('./robots');
  return mod.default;
}

describe('robots()', () => {
  it('production (kkaebizigi.com) — allow + 개인정보/admin disallow', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://kkaebizigi.com');
    const robots = await loadRobots();
    const r = robots();
    expect(Array.isArray(r.rules)).toBe(true);
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule?.allow).toBe('/');
    expect(rule?.disallow).toEqual(
      expect.arrayContaining(['/me', '/admin', '/api/*']),
    );
  });

  it('staging — 전체 disallow', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.kkaebizigi.com');
    const robots = await loadRobots();
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule?.disallow).toBe('/');
    expect(rule?.allow).toBeUndefined();
  });

  it('localhost — 전체 disallow', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    const robots = await loadRobots();
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule?.disallow).toBe('/');
  });

  it('preview URL — 전체 disallow', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://preview.example.com');
    const robots = await loadRobots();
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule?.disallow).toBe('/');
  });

  it('sitemap URL + host 포함', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://kkaebizigi.com');
    const robots = await loadRobots();
    const r = robots();
    expect(r.sitemap).toBe('https://kkaebizigi.com/sitemap.xml');
    expect(r.host).toBe('https://kkaebizigi.com');
  });
});
