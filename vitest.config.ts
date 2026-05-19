/**
 * Vitest 설정 — Sprint 10 / Phase D 단위 테스트.
 *
 * 환경: node (기본 — rehype plugin + SSRF guard + OG parser).
 *   - jsdom 필요 파일은 상단에 `// @vitest-environment jsdom` 디렉티브 명시.
 *   - hooks/use-autosave.test.ts 는 jsdom (localStorage + React state).
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: [
      'lib/**/*.test.ts',
      'hooks/**/*.test.ts',
      'components/**/*.test.ts',
      'components/**/*.test.tsx',
      // Sprint 18 / F18-A — types/* 의 pure helper functions 검증.
      'types/**/*.test.ts',
    ],
    exclude: ['node_modules/**', '.next/**', 'e2e/**'],
    // Sprint 15 F15-E — coverage (v8 provider).
    // Sprint 18 F18-A — types/* 추가. components/ 는 의도적으로 제외 — 대부분
    // 미테스트 상태 (~10K lines) 이므로 포함 시 denominator 가 과대 평가됨.
    // components/ 는 별도 sprint 에서 (F18-G 외) 점진 추가 후 포함 검토.
    coverage: {
      provider: 'v8',
      include: [
        'lib/**/*.ts',
        'hooks/**/*.ts',
        'types/**/*.ts',
      ],
      exclude: [
        'lib/**/*.test.ts',
        'lib/**/__tests__/**',
        'hooks/**/*.test.ts',
        'types/**/*.test.ts',
        'lib/**/*.d.ts',
        'types/**/*.d.ts',
        'types/**/next-auth.d.ts',
        'lib/firebase/admin.ts',  // server-only, e2e 에서 검증
      ],
      reporter: ['text', 'text-summary', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      // Sprint 15 F15-E — 실측 baseline (12.79% lines).
      // Sprint 16 — 20.62% / Sprint 17 — 25.13% / Sprint 18 target 35%+.
      // 본 threshold 는 회귀 방지선 — 현재보다 떨어지면 CI fail.
      thresholds: {
        lines: 10,
        branches: 40,
        functions: 50,
        statements: 10,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // Next.js의 'server-only' 가드는 client 번들 누출 방지용. 테스트 환경에선 의미가 없으므로 빈 모듈로 stub.
      'server-only': path.resolve(__dirname, 'lib/__tests__/server-only.stub.ts'),
    },
  },
});
