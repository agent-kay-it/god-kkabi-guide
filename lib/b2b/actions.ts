/**
 * B2B Admin Server Actions — Sprint V3 P3.B.
 *
 * - issueApiClient: 새 API Key 발급 (admin only). plaintext는 1회만 반환.
 * - listApiClients: 운영자 admin SaaS dashboard에서 목록 조회.
 * - revokeApiClient: 비활성화.
 * - getDailyUsage: 특정 client 일일 사용량 조회.
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import {
  type ApiClientDoc,
  type ApiClientIssueResult,
  type ApiTier,
  type ApiUsageDoc,
} from '@/types/b2b';
import { generateApiKey, hashApiKey, maskApiKey } from './api-key';

export type B2bAdminError =
  | { ok: false; error: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ADMIN_NOT_CONFIGURED' | 'NOT_FOUND' | 'INTERNAL'; message?: string };

async function requireAdmin(): Promise<
  | { ok: true; uid: string }
  | B2bAdminError
> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'UNAUTHENTICATED' };
  if (session.user.role !== 'admin') return { ok: false, error: 'FORBIDDEN' };
  if (!hasAdminCredentials()) return { ok: false, error: 'ADMIN_NOT_CONFIGURED' };
  return { ok: true, uid: session.user.id };
}

export interface IssueApiClientInput {
  readonly tenantId: string;
  readonly tenantName: string;
  readonly tenantEmail: string;
  readonly tier: ApiTier;
  readonly contractStartsAtMs: number;
  readonly contractEndsAtMs: number;
  readonly monthlyFeeKrw: number;
  readonly notes?: string;
}

export async function issueApiClient(
  input: IssueApiClientInput,
): Promise<{ ok: true; result: ApiClientIssueResult } | B2bAdminError> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  if (!input.tenantId || !input.tenantName || !input.tenantEmail) {
    return { ok: false, error: 'INTERNAL', message: 'missing_required_fields' };
  }
  if (input.contractEndsAtMs <= input.contractStartsAtMs) {
    return { ok: false, error: 'INTERNAL', message: 'invalid_contract_window' };
  }

  try {
    const db = getAdminFirestore();
    const ref = db.collection('api_clients').doc();
    const plaintext = generateApiKey();
    const doc: ApiClientDoc = {
      id: ref.id,
      apiKeyHash: hashApiKey(plaintext),
      apiKeyPrefix: maskApiKey(plaintext),
      tenantId: input.tenantId,
      tenantName: input.tenantName,
      tenantEmail: input.tenantEmail,
      tier: input.tier,
      contractStartsAtMs: input.contractStartsAtMs,
      contractEndsAtMs: input.contractEndsAtMs,
      monthlyFeeKrw: input.monthlyFeeKrw,
      isActive: true,
      createdAtMs: Date.now(),
      ...(input.notes ? { notes: input.notes } : {}),
    };
    await ref.set({
      ...doc,
      createdAt: FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin/b2b/clients');
    return { ok: true, result: { client: doc, apiKeyPlaintext: plaintext } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[lib/b2b/actions] issueApiClient:', err);
    return { ok: false, error: 'INTERNAL', message };
  }
}

export async function listApiClients(): Promise<readonly ApiClientDoc[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('api_clients')
      .orderBy('createdAtMs', 'desc')
      .limit(100)
      .get();
    return snap.docs.map((d) => d.data() as ApiClientDoc);
  } catch (err) {
    console.error('[lib/b2b/actions] listApiClients:', err);
    return [];
  }
}

export async function revokeApiClient(
  clientId: string,
): Promise<{ ok: true } | B2bAdminError> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  try {
    const db = getAdminFirestore();
    const ref = db.collection('api_clients').doc(clientId);
    const snap = await ref.get();
    if (!snap.exists) return { ok: false, error: 'NOT_FOUND' };
    await ref.update({
      isActive: false,
      revokedAt: FieldValue.serverTimestamp(),
    });
    revalidatePath('/admin/b2b/clients');
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[lib/b2b/actions] revokeApiClient:', err);
    return { ok: false, error: 'INTERNAL', message };
  }
}

export interface DailyUsageRow {
  readonly date: string;
  readonly count: number;
}

export async function getApiUsageDaily(
  clientId: string,
  days = 30,
): Promise<readonly DailyUsageRow[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];
  try {
    const db = getAdminFirestore();
    const clientSnap = await db.collection('api_clients').doc(clientId).get();
    if (!clientSnap.exists) return [];
    const client = clientSnap.data() as ApiClientDoc;
    const snap = await db
      .collection('api_usage')
      .where('apiKeyHash', '==', client.apiKeyHash)
      .orderBy('date', 'desc')
      .limit(days)
      .get();
    return snap.docs.map((d) => {
      const data = d.data() as ApiUsageDoc;
      return { date: data.date, count: data.count };
    });
  } catch (err) {
    console.error('[lib/b2b/actions] getApiUsageDaily:', err);
    return [];
  }
}
