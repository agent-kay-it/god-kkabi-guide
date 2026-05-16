/**
 * NextAuth.js v5 Edge Proxy (Next.js 16+ middleware → proxy 명칭 변경) — 보호 라우트 인가.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §4
 *       + Next.js 16 deprecation: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Edge runtime 호환 — lib/auth/config.ts (firebase-admin 미포함) 만 import.
 * authorized() 콜백이 /me/*, /admin/*, /register 라우트의 접근을 판정.
 */
import NextAuth from 'next-auth';

import { authConfig } from '@/lib/auth/config';

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Next.js / Auth.js 권장 matcher — 정적 자산과 NextAuth 자체 endpoint는 제외
  matcher: ['/((?!api/auth|_next/static|_next/image|fonts|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)'],
};
