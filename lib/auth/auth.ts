/**
 * NextAuth.js v5 — full server config (Node runtime).
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §3-4
 *
 * Edge runtime용 config (Firebase Adapter 제외)는 lib/auth/config.ts.
 *
 * 본 모듈은 Server Component / Route Handler / Server Action에서 import.
 * Firebase Adapter로 user/account/session/verificationToken 4 컬렉션을 자동 관리.
 *
 * Lazy adapter:
 *  - 빌드 단계에서 FIREBASE_SERVICE_ACCOUNT_JSON 누락 시에도 빌드 성공
 *  - 런타임 호출 (signIn / auth() / handlers) 시점에 자격증명 검증
 *  - 자격증명 누락 시 adapter 없이 동작 (등록 폼 단계 전까지 NextAuth만으로 충분)
 *
 * `auth()` 헬퍼는 서버에서 현재 세션을 가져올 때 사용.
 * `signIn` / `signOut`은 Server Action으로 호출.
 */
import 'server-only';

import NextAuth from 'next-auth';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import type { Adapter } from 'next-auth/adapters';

import { authConfig } from './config';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';

/**
 * Firebase Adapter — 자격증명 확보된 경우에만 초기화 (lazy).
 * 미확보 시 NextAuth는 JWT-only 모드로 동작 (DB 저장 없음, 세션은 토큰 기반).
 */
function createAdapter(): Adapter | undefined {
  if (!hasAdminCredentials()) {
    return undefined;
  }
  return FirestoreAdapter({
    firestore: getAdminFirestore(),
  });
}

const firestoreAdapter = createAdapter();

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  ...(firestoreAdapter ? { adapter: firestoreAdapter } : {}),
  callbacks: {
    ...authConfig.callbacks,
    /**
     * signIn 콜백 — 차단 사용자 거부.
     */
    async signIn({ user }) {
      if (user.role === 'banned') {
        return false;
      }
      return true;
    },
  },
});
