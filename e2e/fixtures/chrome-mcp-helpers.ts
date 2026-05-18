/**
 * Chrome MCP Helpers — Sprint 13 / F13-A-5.
 * 출처: docs/sprint/13-sprint-qa/design.md §3 (Chrome MCP Scenario Template)
 *
 * 본 파일은 **Playwright e2e spec 안에서 MCP 시나리오를 직접 호출하지 않는다**.
 * Chrome MCP 는 AI agent (Claude Code) 가 운영하는 ad-hoc 탐색 도구이며,
 * Playwright spec 은 코드화된 결정론 e2e 를 담당 — 두 layer 가 명확히 분리.
 *
 * 본 헬퍼는:
 *  1. Chrome MCP scenario markdown 의 schema 검증 (steps + acceptance + persona)
 *  2. Playwright Page 와 동일 API 로 MCP scenario 의 expected DOM 검증 헬퍼
 *  3. console-error / network-error 추적 패턴 — MCP scenario 가 read_console_messages 로
 *     가져온 결과를 본 helper 가 normalize
 *
 * Chrome MCP scenario 실행 자체는 `docs/sprint/13-sprint-qa/scenarios/*.md` 파일에
 * 정의되고, Claude Code 가 read 후 실행 — 본 helper 는 결과 비교/문서화 목적.
 */
import type { Page, ConsoleMessage, Response } from '@playwright/test';

export interface ConsoleError {
  readonly type: 'error' | 'warning';
  readonly text: string;
  readonly location?: string;
}

/**
 * 의도적 console error allowlist.
 * Sprint 13 발견 P2 (third-party noise) — 본 매칭에 해당하면 consoleErrors 에 포함하지 않음.
 * 운영 영향 없는 외부 SDK 또는 measurement-only.
 *
 * 발견된 P1 (CSP 차단)은 본 allowlist 에 포함하지 않음 — bug-tracker.md 에서 추적,
 * F13-Iterate Phase 에서 next.config.ts CSP 갱신 PR 로 fix.
 */
const ALLOWED_CONSOLE_ERRORS: readonly RegExp[] = [
  // PostHog/Mixpanel/etc. cookie-less measurement
  /Failed to load resource.*\/decide/i,
  // Chrome extension noise
  /chrome-extension:\/\//,
];

function isAllowedConsoleError(text: string): boolean {
  return ALLOWED_CONSOLE_ERRORS.some((re) => re.test(text));
}

export interface NetworkError {
  readonly status: number;
  readonly url: string;
  readonly method?: string;
}

export interface ErrorTracker {
  readonly consoleErrors: ConsoleError[];
  readonly networkErrors: NetworkError[];
  readonly detach: () => void;
}

/**
 * Playwright Page 에 console + network error tracker 부착.
 * 모든 test 의 afterEach 에서 `expect(tracker.consoleErrors).toHaveLength(0)` 강제.
 */
export function attachErrorTracker(page: Page): ErrorTracker {
  const consoleErrors: ConsoleError[] = [];
  const networkErrors: NetworkError[] = [];

  const onConsole = (msg: ConsoleMessage): void => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (isAllowedConsoleError(text)) return;
      consoleErrors.push({
        type: 'error',
        text,
        location: msg.location().url,
      });
    }
  };
  const onResponse = (resp: Response): void => {
    if (resp.status() >= 400 && resp.status() < 600) {
      // Vercel _next/static, OG image preload 등 일부 404 는 의도적 — allowlist.
      if (isAllowedNetworkError(resp.url(), resp.status())) return;
      networkErrors.push({
        status: resp.status(),
        url: resp.url(),
        method: resp.request().method(),
      });
    }
  };

  page.on('console', onConsole);
  page.on('response', onResponse);

  return {
    consoleErrors,
    networkErrors,
    detach: () => {
      page.off('console', onConsole);
      page.off('response', onResponse);
    },
  };
}

/**
 * 의도적 4xx/5xx allowlist — perf 측정 / favicon / DevTools probe 등.
 * 본 매칭에 해당하면 networkErrors 에 포함하지 않음.
 */
function isAllowedNetworkError(url: string, status: number): boolean {
  // favicon.ico — Next.js 16 metadata 파일 사용 시 일부 404 정상
  if (url.endsWith('/favicon.ico') && status === 404) return true;
  // Sentry/PostHog 등 광고 차단기 우회 시 발생 가능
  if (url.includes('/monitoring') && status === 404) return true;
  // Speed Insights — production 외 환경에서 비활성, 일부 prefetch 404
  if (url.includes('vitals.vercel-insights.com') && status === 404) return true;
  return false;
}

/**
 * Chrome MCP scenario markdown 의 frontmatter 검증.
 * 사용처: Sprint 13 F13-H scenarios 작성 시 spec validation 도구.
 */
export interface ChromeMCPScenarioMeta {
  readonly id: string;
  readonly title: string;
  readonly persona: 'admin' | 'regular' | 'banned' | 'new' | 'anonymous';
  readonly device: 'mobile' | 'desktop';
  readonly expectedDurationMin: number;
  readonly prerequisites?: readonly string[];
}

export function isValidScenarioMeta(value: unknown): value is ChromeMCPScenarioMeta {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.persona === 'string' &&
    ['admin', 'regular', 'banned', 'new', 'anonymous'].includes(v.persona as string) &&
    ['mobile', 'desktop'].includes(v.device as string) &&
    typeof v.expectedDurationMin === 'number'
  );
}

/**
 * 7-Layer dataFlowIntegrity matrix cell.
 * Sprint 13 F13-H-15 의 reports/data-flow-matrix.md 자동 생성용.
 */
export type DataFlowLayer =
  | 'UI'
  | 'Client'
  | 'API'
  | 'Validation'
  | 'DB'
  | 'Response'
  | 'ClientReturn'
  | 'UIReturn';

export interface DataFlowCell {
  readonly feature:
    | 'Auth'
    | 'Post'
    | 'Chat'
    | 'Profile'
    | 'Admin'
    | 'Search'
    | 'Bookmark'
    | 'Subscription';
  readonly layer: DataFlowLayer;
  readonly status: 'pending' | 'passed' | 'failed' | 'skipped';
  readonly evidence?: string;
}

export const DATA_FLOW_LAYERS: readonly DataFlowLayer[] = [
  'UI',
  'Client',
  'API',
  'Validation',
  'DB',
  'Response',
  'ClientReturn',
  'UIReturn',
];

export const DATA_FLOW_FEATURES: readonly DataFlowCell['feature'][] = [
  'Auth',
  'Post',
  'Chat',
  'Profile',
  'Admin',
  'Search',
  'Bookmark',
  'Subscription',
];
