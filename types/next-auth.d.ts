/**
 * NextAuth.js v5 모듈 augmentation — session/user/JWT 타입 확장.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §3
 *
 * 위치: types/ — tsconfig.json include 범위 안에 있어야 augmentation이 활성화됨.
 * 본 파일은 import 없이 ambient 타입만 선언.
 */

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: 'admin' | 'user' | 'banned';
      registered?: boolean;
      serverId?: string;
      gameUid?: string;
      munpa?: string;
      /** Sprint 10 Phase E: RTDB munpa 채널 라우팅용 ID (`${serverId}_${munpa}`). */
      munpaId?: string;
      nickname?: string;
      classId?: string;
      /** Sprint V1: AdSense 동의 (PIPA 5번째) */
      advertisingConsent?: boolean;
      /** Sprint V2: 프리미엄 구독 등급 */
      tier?: 'free' | 'premium';
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'admin' | 'user' | 'banned';
    registered?: boolean;
    serverId?: string;
    gameUid?: string;
    munpa?: string;
    munpaId?: string;
    nickname?: string;
    classId?: string;
    advertisingConsent?: boolean;
    tier?: 'free' | 'premium';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
    role?: 'admin' | 'user' | 'banned';
    registered?: boolean;
    serverId?: string;
    gameUid?: string;
    munpa?: string;
    /** Sprint 10 Phase E: RTDB munpa 채널 라우팅용 ID (`${serverId}_${munpa}`). */
    munpaId?: string;
    nickname?: string;
    classId?: string;
    provider?: string;
    /** Sprint V1: AdSense 동의 (PIPA 5번째) */
    advertisingConsent?: boolean;
    /** Sprint V2: 프리미엄 구독 등급 */
    tier?: 'free' | 'premium';
  }
}

declare module 'next-auth' {
  interface User {
    /** Google OAuth provider id ('google'). Sprint 10에서 Kakao 제거 후 단일. */
    provider?: string;
  }
}
