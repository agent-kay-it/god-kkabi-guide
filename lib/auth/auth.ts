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
 *
 * Sprint V1 — Phase 5 Act (GAP-C1):
 *  - jwt 콜백을 Node runtime에서 override하여 Firestore `users/{uid}` 문서에서
 *    advertisingConsent + 등록 필드 hydrate (edge config의 jwt는 user/account 매핑만 담당)
 *  - hydrate 조건: 첫 sign-in (params.user) / 명시적 update 트리거 / token.advertisingConsent === undefined
 *  - 한 번 set되면 30일 토큰 수명 동안 추가 fetch 없음 (사용자 동의 변경 시 update() 트리거)
 */
import 'server-only';

import NextAuth from 'next-auth';
import type { JWT } from 'next-auth/jwt';
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
    /**
     * jwt 콜백 — Node runtime override (Sprint V1 GAP-C1).
     *
     * 흐름:
     *  1) edge config의 jwt 콜백을 먼저 실행 (user/account → token 매핑)
     *  2) Firestore `users/{uid}` 문서에서 advertisingConsent + 등록 필드 hydrate
     *  3) hydrate 조건: 첫 sign-in (params.user) / trigger='signIn'|'update' / token.advertisingConsent === undefined
     *  4) 한 번 set되면 30일 토큰 수명 동안 추가 fetch 없음
     *
     * 미등록 사용자 / Firestore 실패 시: advertisingConsent=false로 set하여 무한 fetch 방지.
     */
    async jwt(params) {
      const baseToken = await authConfig.callbacks!.jwt!(params);
      const token = baseToken as JWT;

      const uid = token.sub;
      if (!uid || !hasAdminCredentials()) return token;

      const needsHydrate =
        Boolean(params.user) ||
        params.trigger === 'signIn' ||
        params.trigger === 'update' ||
        token.advertisingConsent === undefined;
      if (!needsHydrate) return token;

      try {
        const db = getAdminFirestore();
        const snap = await db.collection('users').doc(uid).get();
        const data = snap.data();
        if (data) {
          token.advertisingConsent = Boolean(data.consent?.advertising);
          if (data.registered !== undefined) token.registered = Boolean(data.registered);
          if (data.role === 'admin' || data.role === 'user' || data.role === 'banned') {
            token.role = data.role;
          }
          if (data.tier === 'premium' || data.tier === 'free') {
            token.tier = data.tier;
          }
          if (data.serverId !== undefined) token.serverId = data.serverId;
          if (data.gameUid !== undefined) token.gameUid = data.gameUid;
          if (data.munpa !== undefined) token.munpa = data.munpa;
          // Sprint 10 Phase E: RTDB chat 채널 라우팅용 munpaId — Firestore munpa doc ID 패턴.
          // 기존 사용자는 data.munpaId가 없을 수 있으므로 serverId + munpa로 재구성.
          if (typeof data.serverId === 'string' && typeof data.munpa === 'string') {
            token.munpaId = `${data.serverId}_${data.munpa}`;
          }
          if (data.nickname !== undefined) token.nickname = data.nickname;
          if (data.classId !== undefined) token.classId = data.classId;
        } else if (token.advertisingConsent === undefined) {
          token.advertisingConsent = false;
        }
      } catch (err) {
        console.error('[auth.jwt] hydrate failed:', err);
        if (token.advertisingConsent === undefined) token.advertisingConsent = false;
      }
      return token;
    },
  },
});
