/**
 * robots-config 단위 테스트 — Sprint 12 / F12-D-1.
 * 출처: docs/sprint/12-sprint-perf/plan.md §F12-D-1
 *
 * vitest 의 process.env mutation 으로 env 토글 검증.
 * import 시점에 evaluate 되므로 vi.resetModules 로 module cache 재로드.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
});

describe('robots-config', () => {
  it('NEXT_PUBLIC_ROBOTS_INDEX 미설정 시 noindex/nofollow', async () => {
    delete process.env.NEXT_PUBLIC_ROBOTS_INDEX;
    const { robotsConfig, isProductionIndexing } = await import('../robots-config');
    expect(isProductionIndexing).toBe(false);
    expect(robotsConfig).toEqual({ index: false, follow: false });
  });

  it('NEXT_PUBLIC_ROBOTS_INDEX="true" 시 index/follow + googleBot 옵션', async () => {
    process.env.NEXT_PUBLIC_ROBOTS_INDEX = 'true';
    const { robotsConfig, isProductionIndexing } = await import('../robots-config');
    expect(isProductionIndexing).toBe(true);
    expect(robotsConfig).toMatchObject({
      index: true,
      follow: true,
      googleBot: expect.objectContaining({
        index: true,
        follow: true,
        'max-image-preview': 'large',
      }),
    });
  });

  it('truthy 우회 차단 — "TRUE" (대문자) 미허용', async () => {
    process.env.NEXT_PUBLIC_ROBOTS_INDEX = 'TRUE';
    const { isProductionIndexing } = await import('../robots-config');
    expect(isProductionIndexing).toBe(false);
  });

  it('truthy 우회 차단 — "1" 미허용', async () => {
    process.env.NEXT_PUBLIC_ROBOTS_INDEX = '1';
    const { isProductionIndexing } = await import('../robots-config');
    expect(isProductionIndexing).toBe(false);
  });

  it('robotsAlwaysNoIndex 는 env 와 무관하게 항상 noindex', async () => {
    process.env.NEXT_PUBLIC_ROBOTS_INDEX = 'true';
    const { robotsAlwaysNoIndex } = await import('../robots-config');
    expect(robotsAlwaysNoIndex).toEqual({ index: false, follow: false });
  });
});
