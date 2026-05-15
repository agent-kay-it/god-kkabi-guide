/**
 * 모더레이션 사전 외부화 Server Actions — Firestore + seed fallback.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/moderation-policy.md §2
 *
 * 흐름:
 *  - Firestore `moderation_dictionaries` 컬렉션에서 active=true 항목 로드
 *  - Admin SDK 미설정 / 빈 컬렉션 시 SEED_DICTIONARIES (v2 11종) fallback
 *  - server-side 5분 캐시
 *
 * 타입/sync helper는 lib/moderation/dict-types.ts에 분리
 * (Server Actions 모듈은 async function만 export 가능).
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth/auth';
import {
  getAdminFirestore,
  hasAdminCredentials,
} from '@/lib/firebase/admin';
import {
  SEED_DICTIONARIES,
  type DictInputAdmin,
  type ModerationDict,
} from './dict-types';

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { data: readonly ModerationDict[]; expiresAt: number } | null = null;

/**
 * server-side에서 모더레이션 사전 로드 (5분 캐시).
 * 채팅 / 게시물 / 댓글 Server Action의 마스킹 적용에 사용.
 */
export async function loadDictionaries(): Promise<readonly ModerationDict[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;
  if (!hasAdminCredentials()) return SEED_DICTIONARIES;
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('moderation_dictionaries')
      .where('active', '==', true)
      .limit(500)
      .get();
    if (snap.empty) return SEED_DICTIONARIES;
    const data = snap.docs.map((d) => {
      const raw = d.data() as Omit<ModerationDict, 'createdAtMs'> & {
        createdAt?: { toMillis(): number };
      };
      return {
        id: raw.id,
        category: raw.category,
        pattern: raw.pattern,
        isRegex: Boolean(raw.isRegex),
        severity: raw.severity,
        active: Boolean(raw.active),
        createdBy: raw.createdBy,
        createdAtMs: raw.createdAt?.toMillis() ?? 0,
      } as ModerationDict;
    });
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch {
    return SEED_DICTIONARIES;
  }
}

// ─────────────────────────────────────────────────────────────────
// admin CRUD
// ─────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<
  { ok: true; uid: string } | { ok: false; error: 'FORBIDDEN' | 'ADMIN_NOT_CONFIGURED' }
> {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { ok: false, error: 'FORBIDDEN' };
  if (!hasAdminCredentials()) return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  return { ok: true, uid: session.user.id ?? 'admin' };
}

export async function createDictionary(
  input: DictInputAdmin,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };
  if (!input.pattern.trim()) return { ok: false, error: 'EMPTY_PATTERN' };

  try {
    const db = getAdminFirestore();
    const ref = db.collection('moderation_dictionaries').doc();
    await ref.set({
      id: ref.id,
      category: input.category,
      pattern: input.pattern.trim(),
      isRegex: input.isRegex,
      severity: input.severity,
      active: true,
      createdBy: guard.uid,
      createdAt: FieldValue.serverTimestamp(),
    });
    cache = null;
    revalidatePath('/admin/dictionaries');
    return { ok: true, id: ref.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'INTERNAL' };
  }
}

export async function toggleDictionaryActive(
  id: string,
  active: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };
  try {
    const db = getAdminFirestore();
    await db.collection('moderation_dictionaries').doc(id).update({
      active,
      updatedAt: FieldValue.serverTimestamp(),
    });
    cache = null;
    revalidatePath('/admin/dictionaries');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'INTERNAL' };
  }
}

export async function deleteDictionary(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };
  try {
    const db = getAdminFirestore();
    // soft delete (active=false)
    await db.collection('moderation_dictionaries').doc(id).update({
      active: false,
      deletedAt: FieldValue.serverTimestamp(),
    });
    cache = null;
    revalidatePath('/admin/dictionaries');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'INTERNAL' };
  }
}

export async function listDictionariesForAdmin(): Promise<readonly ModerationDict[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('moderation_dictionaries')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get();
    return snap.docs.map((d) => {
      const raw = d.data() as Omit<ModerationDict, 'createdAtMs'> & {
        createdAt?: { toMillis(): number };
      };
      return {
        id: raw.id,
        category: raw.category,
        pattern: raw.pattern,
        isRegex: Boolean(raw.isRegex),
        severity: raw.severity,
        active: Boolean(raw.active),
        createdBy: raw.createdBy,
        createdAtMs: raw.createdAt?.toMillis() ?? 0,
      } as ModerationDict;
    });
  } catch {
    return [];
  }
}
