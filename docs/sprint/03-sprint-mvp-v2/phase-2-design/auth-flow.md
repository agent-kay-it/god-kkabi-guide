# Auth Flow v2 — NextAuth.js v5 + Google/Kakao + Firebase Adapter

> 출처: `design.md` §4 + 운영자 결정 G1 (Google + Kakao 듀얼)
> 작성일: 2026-05-15

---

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│ Next.js App Router                                          │
│  ├── app/(auth)/sign-in       — NextAuth UI                 │
│  ├── app/(auth)/register      — 사용자 정보 등록             │
│  ├── api/auth/[...nextauth]/route.ts  — NextAuth handler    │
│  └── api/auth/register/route.ts        — 등록 Server Action │
├─────────────────────────────────────────────────────────────┤
│ NextAuth.js v5 (Auth.js)                                    │
│  ├── Providers:                                              │
│  │   ├── Google (OAuth 2.0 표준)                             │
│  │   └── Kakao (Custom OIDC config)                         │
│  └── Firebase Adapter (세션 → Firestore /users 동기화)        │
├─────────────────────────────────────────────────────────────┤
│ Firebase                                                     │
│  ├── Auth (백엔드 user 관리, custom token 발급)              │
│  ├── Firestore /users/{uid}   — 사용자 등록 데이터            │
│  ├── Realtime DB              — 채팅 (auth 검증)             │
│  └── Storage                  — 이미지 (auth 검증)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 시퀀스 다이어그램 — Google 로그인 → 등록

```
사용자                NextAuth         Google OAuth      Firebase Auth    Firestore
  │                     │                   │                  │              │
  │── 1) /sign-in ────►│                   │                  │              │
  │                     │── 2) redirect ──►│                  │              │
  │                     │   to Google      │                  │              │
  │                     │                   │                  │              │
  │── 3) 로그인 → 콜백 ──────────────────────┤                  │              │
  │                     │◄── 4) code ──────┤                  │              │
  │                     │── 5) exchange ──►│                  │              │
  │                     │    code → token  │                  │              │
  │                     │◄── 6) token ──────┤                  │              │
  │                     │                   │                  │              │
  │                     │── 7) verify ID ───┼─────────────────►│              │
  │                     │   token (Firebase Adapter)            │              │
  │                     │                   │                  │── 8) signIn ─►│
  │                     │                   │                  │              │
  │                     │◄────── 9) Firebase user + uid ───────│              │
  │                     │                   │                  │              │
  │                     │── 10) read users/{uid} ──────────────────────────────►│
  │                     │                                                       │
  │                     │◄── 11) not found ──────────────────────────────────────┤
  │                     │                                                       │
  │◄── 12) redirect /register ──┤
  │                                                                              │
  │── 13) /register 폼 입력 (서버ID/UID/문파/닉네임/직업) ──────────────────────►│
  │                     │                                                       │
  │                     │── 14) POST /api/auth/register ───────────────────────►│
  │                     │                                                       │
  │                     │   ├── Zod 검증 (5필드 + PIPA 4동의)                    │
  │                     │   ├── gameUid 중복 검증                                │
  │                     │   ├── 닉네임 server scope 중복 검증                    │
  │                     │   ├── /users/{uid} 생성 (트랜잭션)                     │
  │                     │   ├── /servers/{serverId} upsert + userCount++         │
  │                     │   ├── /munpas/{id} upsert + memberCount++              │
  │                     │   ├── /chat_channels/{server:S785, munpa:...} upsert   │
  │                     │   └── Firebase custom claim 설정 (server, munpa)        │
  │                     │                                                       │
  │◄── 15) redirect / ──┤                                                       │
```

---

## 3. Kakao OAuth 통합 (Custom Token Bridge)

Kakao는 OIDC 비호환이므로 다음 흐름:

```
사용자 ── 1) NextAuth /sign-in/kakao ──► NextAuth
                                          │
                                          │── 2) redirect to Kakao OAuth
                                          │
사용자 ── 3) Kakao 로그인 ──►
사용자 ── 4) callback to NextAuth (code) ──►
                                          │
                                          │── 5) Server Action: Kakao token API
                                          │   POST kauth.kakao.com/oauth/token
                                          │   → { access_token, id_token (없음) }
                                          │
                                          │── 6) Kakao user info API
                                          │   GET kapi.kakao.com/v2/user/me
                                          │   → { id, email, profile }
                                          │
                                          │── 7) Firebase Admin SDK
                                          │   admin.auth().createCustomToken(
                                          │     `kakao_${kakaoId}`,
                                          │     { kakaoId, provider: 'kakao' }
                                          │   )
                                          │
                                          │── 8) client signInWithCustomToken(token)
                                          │   → Firebase Auth uid 생성
                                          │
                                          │── 9) NextAuth session 동기화
                                          │   (Firebase Adapter)
                                          │
                                          │── 10) 이후 흐름은 Google과 동일
                                          │   (users/{uid} 조회 → register or home)
```

---

## 4. NextAuth.js v5 설정 코드

### 4.1 `auth.config.ts`

```typescript
// auth.config.ts (NextAuth v5 base config)
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/sign-in',
    newUser: '/auth/register',
  },
  callbacks: {
    authorized({ auth, request }) {
      const isAuthed = !!auth?.user;
      const protectedPaths = ['/settings', '/my', '/admin', '/tips/new', '/chat'];
      const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
      if (isProtected && !isAuthed) {
        return Response.redirect(new URL('/auth/sign-in', request.nextUrl));
      }
      return true;
    },
    async signIn({ user, account }) {
      // Firebase custom token 발급 + signInWithCustomToken은 별도 클라이언트 흐름
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  trustHost: true,
};
```

### 4.2 `auth.ts` (root export)

```typescript
// auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

### 4.3 `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

### 4.4 `middleware.ts`

```typescript
import { auth } from '@/auth';
import { authConfig } from '@/auth.config';

export default auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
```

---

## 5. Firebase Custom Token Bridge (Server Action)

```typescript
// app/api/auth/kakao/callback/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  const { kakaoAccessToken } = await req.json();

  // 1. Kakao user info 조회
  const kakaoUserRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${kakaoAccessToken}` },
  });
  const kakaoUser = await kakaoUserRes.json();

  // 2. Firebase Custom Token 발급
  const firebaseUid = `kakao_${kakaoUser.id}`;
  const customToken = await adminAuth.createCustomToken(firebaseUid, {
    provider: 'kakao',
    kakaoId: kakaoUser.id,
    email: kakaoUser.kakao_account?.email,
    nickname: kakaoUser.kakao_account?.profile?.nickname,
  });

  return NextResponse.json({ customToken });
}
```

### 5.1 클라이언트 사용

```typescript
// components/feature/kakao-sign-in.tsx
'use client';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { signInWithCustomToken } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase/auth';

export async function signInWithKakao() {
  // 1. NextAuth Kakao 흐름 (access_token까지)
  const result = await nextAuthSignIn('kakao', { redirect: false });
  if (!result?.ok) return;

  // 2. Custom Token 발급
  const tokenRes = await fetch('/api/auth/kakao/callback', {
    method: 'POST',
    body: JSON.stringify({ kakaoAccessToken: result.access_token }),
  });
  const { customToken } = await tokenRes.json();

  // 3. Firebase signInWithCustomToken
  await signInWithCustomToken(getAuthClient(), customToken);
}
```

---

## 6. 사용자 등록 Server Action

```typescript
// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminFirestore } from '@/lib/firebase/admin';
import { auth } from '@/auth';
import { FieldValue } from 'firebase-admin/firestore';

const RegisterSchema = z.object({
  serverId: z.string().regex(/^S\d{1,4}$/, '서버ID는 S+숫자 형식 (예: S785)'),
  gameUid: z.string().min(5).max(20),
  munpa: z.string().min(1).max(30),
  nickname: z.string().min(1).max(12),
  classId: z.enum(['warrior', 'swordsman', 'medium']),
  consent: z.object({
    age14plus: z.literal(true),
    chatPublic: z.literal(true),
    unofficial: z.literal(true),
    operator24h: z.literal(true),
    analytics: z.boolean(),
  }),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid', details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const uid = session.user.id;
  const db = adminFirestore;

  // gameUid 중복 검증
  const gameUidQuery = await db.collection('users').where('gameUid', '==', data.gameUid).limit(1).get();
  if (!gameUidQuery.empty) {
    return NextResponse.json({ error: 'gameUid_duplicate' }, { status: 409 });
  }

  // 닉네임 server scope 중복 검증
  const nicknameQuery = await db.collection('users')
    .where('serverId', '==', data.serverId)
    .where('nickname', '==', data.nickname)
    .limit(1).get();
  if (!nicknameQuery.empty) {
    return NextResponse.json({ error: 'nickname_duplicate' }, { status: 409 });
  }

  const munpaId = `${data.serverId}_${data.munpa}`;
  const munpaChannelId = `munpa:${data.serverId}:${data.munpa}`;
  const serverChannelId = `server:${data.serverId}`;

  // Firestore 트랜잭션
  await db.runTransaction(async (tx) => {
    // 1) users/{uid} 생성
    tx.set(db.collection('users').doc(uid), {
      uid,
      email: session.user.email,
      displayName: session.user.name,
      photoURL: session.user.image,
      authProvider: session.user.image?.includes('kakao') ? 'kakao' : 'google',
      serverId: data.serverId,
      gameUid: data.gameUid,
      munpa: data.munpa,
      nickname: data.nickname,
      classId: data.classId,
      role: 'user',
      banned: false,
      bookmarkIds: [],
      reportedTotal: 0,
      warningCount: 0,
      consent: { ...data.consent, consentedAt: FieldValue.serverTimestamp() },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    });

    // 2) servers/{serverId} upsert
    tx.set(
      db.collection('servers').doc(data.serverId),
      {
        id: data.serverId,
        userCount: FieldValue.increment(1),
        munpaCount: FieldValue.increment(0), // 신규 문파일 경우 +1 (Cloud Function으로 후속)
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // 3) munpas/{id} upsert
    tx.set(
      db.collection('munpas').doc(munpaId),
      {
        id: munpaId,
        serverId: data.serverId,
        name: data.munpa,
        memberCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // 4) chat_channels upsert (server + munpa)
    tx.set(
      db.collection('chat_channels').doc(serverChannelId),
      {
        id: serverChannelId,
        type: 'server',
        serverId: data.serverId,
        memberCount: FieldValue.increment(1),
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    tx.set(
      db.collection('chat_channels').doc(munpaChannelId),
      {
        id: munpaChannelId,
        type: 'munpa',
        serverId: data.serverId,
        munpaName: data.munpa,
        memberCount: FieldValue.increment(1),
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  // Firebase custom claim 설정 (server, munpa)
  await adminAuth.setCustomUserClaims(uid, {
    server: data.serverId,
    munpa: munpaId,
    classId: data.classId,
  });

  return NextResponse.json({ success: true });
}
```

---

## 7. 환경변수 (tene + Vercel)

| 변수 | 환경 | 출처 |
|------|------|------|
| `NEXTAUTH_SECRET` | local/staging/prod | `openssl rand -hex 32` |
| `NEXTAUTH_URL` | local/staging/prod | `http://localhost:3000` / `https://...` |
| `GOOGLE_CLIENT_ID` | local/staging/prod | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | local/staging/prod | Google Cloud Console |
| `KAKAO_CLIENT_ID` | local/staging/prod | Kakao Developers REST API 키 |
| `KAKAO_CLIENT_SECRET` | local/staging/prod | Kakao Developers (선택, 클라이언트 시크릿) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | local/staging/prod | Firebase Admin SDK JSON |
| `NEXT_PUBLIC_FIREBASE_*` (기존 7) | local/staging/prod | (v1 유지) |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | local/staging/prod | Realtime DB URL (`https://*-default-rtdb.firebaseio.com`) |

### 7.1 운영자 액션 (P3.A 진입 전)

```bash
# tene에 등록 (3환경 각각)
for ENV in local staging prod; do
  tene set NEXTAUTH_SECRET "$(openssl rand -hex 32)" --env $ENV
  tene set NEXTAUTH_URL "https://god-kkabi-guide.vercel.app" --env $ENV
  tene set GOOGLE_CLIENT_ID "${GOOGLE_CLIENT_ID}" --env $ENV
  tene set GOOGLE_CLIENT_SECRET "${GOOGLE_CLIENT_SECRET}" --env $ENV
  tene set KAKAO_CLIENT_ID "${KAKAO_CLIENT_ID}" --env $ENV
  tene set FIREBASE_SERVICE_ACCOUNT_JSON --stdin --env $ENV < ./serviceAccountKey.json
done

# 등록 후 serviceAccountKey.json 즉시 삭제
rm ./serviceAccountKey.json
```

---

## 8. 보안 체크리스트

- [ ] NEXTAUTH_SECRET 최소 32 bytes
- [ ] Firebase Service Account JSON git commit 금지 (.gitignore)
- [ ] CSP `frame-src https://accounts.google.com https://accounts.kakao.com`
- [ ] CSRF: NextAuth 기본 SameSite cookies
- [ ] OAuth redirect URI 등록:
  - Google Cloud Console: `https://god-kkabi-guide.vercel.app/api/auth/callback/google`
  - Kakao Developers: `https://god-kkabi-guide.vercel.app/api/auth/callback/kakao`
- [ ] gameUid는 절대 변경 불가 (Security Rules + Zod)
- [ ] 등록 폼 PIPA 4 동의 모두 `true` 강제

---

> **다음 산출물**: `design-tokens-v2.json`, `component-inventory-v2.md`
