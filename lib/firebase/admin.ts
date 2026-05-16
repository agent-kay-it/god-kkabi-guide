/**
 * Firebase Admin SDK 어댑터 — server-only, lazy init.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §6
 *
 * 책임:
 *  - Firebase Admin App 1회 초기화 (Node.js runtime 한정, lazy init)
 *  - createCustomToken (Google sign-in bridge용 — Sprint 10 / Phase B에서 NextAuth session.user.id → Firebase Auth uid)
 *  - Firestore Admin (Server Action 트랜잭션용)
 *  - Auth Admin (사용자 정지/리셋, custom claims)
 *
 * 환경변수: FIREBASE_SERVICE_ACCOUNT_JSON (tene-injected, base64 또는 raw JSON 둘 다 지원)
 *
 * Lazy init 정책:
 *  - 빌드 단계 (next build)에서 env 누락 시에도 모듈 import는 성공해야 함
 *  - 실제 호출 시점에만 env 검증 + Admin App 초기화
 *  - hasAdminCredentials()로 사전 체크 가능
 *
 * 경고: 본 파일은 'use server' 또는 Server Action / Route Handler에서만 import.
 *      Client Component에서 import 시 빌드 에러 (firebase-admin은 Node-only).
 */
import 'server-only';

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getDatabase, type Database } from 'firebase-admin/database';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

interface ParsedServiceAccount {
  readonly project_id?: string;
  readonly client_email?: string;
  readonly private_key?: string;
}

/** 빌드/런타임에서 Firebase Admin SDK 자격증명이 있는지 확인 (오류 없이) */
export function hasAdminCredentials(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}

function parseServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON 누락. Run with `tene run --` to inject (auth-flow.md §환경변수 참조).',
    );
  }

  let jsonString = raw;
  // base64 인코딩 지원 (multi-line JSON을 환경변수로 안전 전달)
  if (!raw.trim().startsWith('{')) {
    try {
      jsonString = Buffer.from(raw, 'base64').toString('utf8');
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON 이 JSON 또는 base64 형식이 아님');
    }
  }

  const parsed = JSON.parse(jsonString) as ParsedServiceAccount;
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON 에 project_id / client_email / private_key 누락');
  }

  // private_key의 `\n` 이스케이프 해제 (env에 single-line으로 들어온 경우)
  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key.replace(/\\n/g, '\n'),
  };
}

function ensureAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return getApp();
  }
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const databaseURL =
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
    (projectId
      ? `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`
      : undefined);
  return initializeApp({
    credential: cert(parseServiceAccount()),
    ...(projectId ? { projectId } : {}),
    ...(storageBucket ? { storageBucket } : {}),
    ...(databaseURL ? { databaseURL } : {}),
  });
}

/** Firebase Admin Auth 인스턴스 (custom token, 사용자 정지 등). 환경변수 누락 시 throw. */
export function getAdminAuth(): Auth {
  return getAuth(ensureAdminApp());
}

/** Firebase Admin Firestore 인스턴스 (Server Action 트랜잭션). 환경변수 누락 시 throw. */
export function getAdminFirestore(): Firestore {
  return getFirestore(ensureAdminApp());
}

/** Firebase Admin Realtime Database (채팅 메시지 hidden 마킹 등 Server 측 변경).
 *
 * databaseURL은 initializeApp의 옵션 또는 appConfig에 의해 결정.
 * 환경변수 NEXT_PUBLIC_FIREBASE_DATABASE_URL 미설정 시 기본 URL 자동 생성.
 */
export function getAdminDatabase(): Database {
  return getDatabase(ensureAdminApp());
}

/**
 * Firebase Custom Token 발급 (NextAuth ↔ Firebase Auth bridge).
 *
 * Sprint 10 / Phase B: NextAuth Google sign-in 후 session.user.id를 그대로 Firebase Auth uid로 사용.
 * client에서 signInWithCustomToken으로 Firebase 세션 활성화 → Firestore/RTDB/Storage 접근 가능.
 *
 * @param uid Firebase Auth uid (NextAuth session.user.id와 동일)
 * @param claims 선택적 추가 custom claims (예: role, registered, serverId, munpaId)
 * @returns Firebase Auth에 signInWithCustomToken으로 전달할 JWT
 *
 * 사용 시점: client POST /api/auth/google-bridge → 서버에서 본 함수 호출 → 응답 token으로 signInWithCustomToken
 */
export async function createFirebaseCustomToken(
  uid: string,
  claims?: Record<string, unknown>,
): Promise<string> {
  const auth = getAdminAuth();
  return auth.createCustomToken(uid, claims);
}

/**
 * 사용자 custom claims 갱신 (role=admin / user / banned).
 * 운영자 콘솔에서 사용자 정지 / 권한 변경 시 호출.
 */
export async function setUserClaims(
  uid: string,
  claims: {
    readonly role: 'admin' | 'user' | 'banned';
    readonly bannedReason?: string;
    /** RTDB rules에서 auth.token.registered 평가용 */
    readonly registered?: boolean;
    /** Sprint V2: 프리미엄 구독 등급 */
    readonly tier?: 'free' | 'premium';
  },
): Promise<void> {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, claims);
}
