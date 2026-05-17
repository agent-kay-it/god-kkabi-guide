/**
 * Vitest 설정 — Sprint 10 / Phase D 단위 테스트 도입.
 *
 * 환경: node (rehype plugin + SSRF guard + OG parser는 server-only).
 * 추후 React 컴포넌트 테스트 추가 시 environment: 'jsdom'으로 별도 분기.
 */
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'hooks/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // Next.js의 'server-only' 가드는 client 번들 누출 방지용. 테스트 환경에선 의미가 없으므로 빈 모듈로 stub.
      'server-only': path.resolve(__dirname, 'lib/__tests__/server-only.stub.ts'),
    },
  },
});
