/**
 * NextAuth.js v5 Route Handler — Auth.js 표준 endpoint.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §4
 *
 * 핸들러: /api/auth/[...nextauth]
 *  - /api/auth/signin/{provider}
 *  - /api/auth/callback/{provider}
 *  - /api/auth/signout
 *  - /api/auth/session
 *  - /api/auth/csrf
 */
import { handlers } from '@/lib/auth/auth';

export const { GET, POST } = handlers;

// Force Node.js runtime (firebase-admin은 Edge에서 동작 안 함)
export const runtime = 'nodejs';
