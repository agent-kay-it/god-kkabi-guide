/**
 * 사용자 등록 Server Action — Firestore 트랜잭션 기반.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §7 (등록 폼)
 *      + firestore-schema.md §2.1 (UserDoc) / §2.2 (ServerDoc) / §2.3 (MunpaDoc) / §2.4 (ChatChannelDoc)
 *
 * 흐름:
 *  1. NextAuth 세션 검증 (로그인 필수)
 *  2. Zod 스키마 검증 (5필드 + PIPA 4동의)
 *  3. gameUid unique 검증 (Firestore where 쿼리)
 *  4. nickname server-scope unique 검증
 *  5. Firestore 트랜잭션:
 *     - users/{uid} create
 *     - servers/{serverId} upsert (userCount++)
 *     - munpas/{serverId}_{munpa} upsert (memberCount++)
 *     - chat_channels/server:{serverId} upsert
 *     - chat_channels/munpa:{serverId}:{munpa} upsert
 *  6. Firebase Admin custom claims 설정 (role=user, registered=true)
 *  7. NextAuth 세션 token 갱신 (다음 요청부터 registered=true)
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { auth } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import { setUserClaimsWithRetry } from '@/lib/firebase/claims-retry-queue';
import {
  RegisterFormSchema,
  type RegisterFormInput,
  type RegisterResult,
} from './register-schema';

// ─────────────────────────────────────────────────────────────────
// Server Action
// ─────────────────────────────────────────────────────────────────

export async function registerUser(
  raw: unknown,
): Promise<RegisterResult> {
  // 1) 세션
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return { ok: false, error: 'UNAUTHENTICATED' };
  }

  // 2) Zod 검증
  const parsed = RegisterFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof RegisterFormInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof RegisterFormInput | undefined;
      if (key) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: 'VALIDATION_FAILED', fieldErrors };
  }
  const input = parsed.data;

  // 3) Admin SDK 가용성
  if (!hasAdminCredentials()) {
    return {
      ok: false,
      error: 'ADMIN_NOT_CONFIGURED',
      message:
        'Firebase Admin SDK 자격증명 미설정. 운영자가 tene set FIREBASE_SERVICE_ACCOUNT_JSON ... 실행 후 재시도',
    };
  }

  const db = getAdminFirestore();

  try {
    // 4) gameUid unique 검증 (트랜잭션 외부에서 빠른 거절)
    const gameUidSnap = await db
      .collection('users')
      .where('gameUid', '==', input.gameUid)
      .limit(1)
      .get();
    if (!gameUidSnap.empty) {
      return {
        ok: false,
        error: 'GAMEUID_TAKEN',
        fieldErrors: { gameUid: '이미 등록된 게임 UID' },
      };
    }

    // 5) nickname server-scope unique
    const nicknameSnap = await db
      .collection('users')
      .where('serverId', '==', input.serverId)
      .where('nickname', '==', input.nickname)
      .limit(1)
      .get();
    if (!nicknameSnap.empty) {
      return {
        ok: false,
        error: 'NICKNAME_TAKEN_IN_SERVER',
        fieldErrors: { nickname: '해당 서버에 이미 사용 중인 닉네임' },
      };
    }

    // 6) 트랜잭션: users / servers / munpas / chat_channels upsert
    const munpaDocId = `${input.serverId}_${input.munpa}`;
    const serverChannelId = `server:${input.serverId}`;
    const munpaChannelId = `munpa:${input.serverId}:${input.munpa}`;

    await db.runTransaction(async (tx) => {
      const userRef = db.collection('users').doc(uid);
      const serverRef = db.collection('servers').doc(input.serverId);
      const munpaRef = db.collection('munpas').doc(munpaDocId);
      const serverChannelRef = db.collection('chat_channels').doc(serverChannelId);
      const munpaChannelRef = db.collection('chat_channels').doc(munpaChannelId);

      // ── READS (트랜잭션 규칙: 모든 read는 write 이전)
      const [userSnap, serverSnap, munpaSnap, serverChSnap, munpaChSnap] =
        await Promise.all([
          tx.get(userRef),
          tx.get(serverRef),
          tx.get(munpaRef),
          tx.get(serverChannelRef),
          tx.get(munpaChannelRef),
        ]);

      if (userSnap.exists && userSnap.data()?.registered === true) {
        throw new Error('ALREADY_REGISTERED');
      }

      const now = FieldValue.serverTimestamp();

      // ── WRITES
      // users — create or merge (NextAuth Adapter가 미리 record 생성한 경우 merge)
      tx.set(
        userRef,
        {
          uid,
          email: session.user?.email ?? null,
          displayName: session.user?.name ?? null,
          photoURL: session.user?.image ?? null,
          authProvider: session.accessToken ? 'kakao' : 'google',
          serverId: input.serverId,
          gameUid: input.gameUid,
          munpa: input.munpa,
          nickname: input.nickname,
          classId: input.classId,
          role: 'user',
          registered: true,
          banned: false,
          bookmarkIds: [],
          reportedTotal: 0,
          warningCount: 0,
          consent: {
            age14plus: input.age14plus,
            chatPublic: input.chatPublic,
            unofficial: input.unofficial,
            operator24h: input.operator24h,
            analytics: input.analytics,
            // Sprint V1: AdSense 선택 동의
            advertising: input.advertising ?? false,
            consentedAt: now,
          },
          postCount: 0,
          createdAt: userSnap.exists ? userSnap.data()?.createdAt ?? now : now,
          updatedAt: now,
          lastLoginAt: now,
        },
        { merge: true },
      );

      // servers upsert
      tx.set(
        serverRef,
        {
          id: input.serverId,
          userCount: serverSnap.exists ? FieldValue.increment(1) : 1,
          munpaCount: serverSnap.exists ? serverSnap.data()?.munpaCount ?? 0 : 0,
          createdAt: serverSnap.exists ? serverSnap.data()?.createdAt ?? now : now,
          updatedAt: now,
        },
        { merge: true },
      );

      // munpas upsert
      tx.set(
        munpaRef,
        {
          id: munpaDocId,
          serverId: input.serverId,
          name: input.munpa,
          memberCount: munpaSnap.exists ? FieldValue.increment(1) : 1,
          createdAt: munpaSnap.exists ? munpaSnap.data()?.createdAt ?? now : now,
          updatedAt: now,
        },
        { merge: true },
      );

      // server-channel upsert
      tx.set(
        serverChannelRef,
        {
          id: serverChannelId,
          type: 'server',
          serverId: input.serverId,
          memberCount: serverChSnap.exists ? FieldValue.increment(1) : 1,
          isActive: true,
          createdAt: serverChSnap.exists ? serverChSnap.data()?.createdAt ?? now : now,
        },
        { merge: true },
      );

      // munpa-channel upsert
      tx.set(
        munpaChannelRef,
        {
          id: munpaChannelId,
          type: 'munpa',
          serverId: input.serverId,
          munpaName: input.munpa,
          memberCount: munpaChSnap.exists ? FieldValue.increment(1) : 1,
          isActive: true,
          createdAt: munpaChSnap.exists ? munpaChSnap.data()?.createdAt ?? now : now,
        },
        { merge: true },
      );

      // 신규 문파인 경우 server.munpaCount++
      if (!munpaSnap.exists) {
        tx.update(serverRef, { munpaCount: FieldValue.increment(1) });
      }
    });

    // 7) Firebase Auth custom claims (RTDB rules에서 registered=true claim 평가용)
    // Sprint V3 P3.A (CA2-I11): retry queue로 일시 장애 대비.
    await setUserClaimsWithRetry(uid, { role: 'user', registered: true });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN';
    if (message === 'ALREADY_REGISTERED') {
      return { ok: true };
    }
    return { ok: false, error: 'INTERNAL', message };
  }
}
