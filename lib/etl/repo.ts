/**
 * external_signals Firestore repository — Sprint V3 P3.D (F4.1).
 *
 * 모든 ETL adapter는 본 repo를 통해 upsert. doc id 명시 시 deduplication 보장.
 */
import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import type {
  ExternalSignalDoc,
  ExternalSignalSource,
  ExternalSignalType,
  UpsertSignalInput,
} from '@/types/etl';

const COLLECTION = 'external_signals';
const BATCH_LIMIT = 450;

export async function upsertSignal(input: UpsertSignalInput): Promise<{ ok: boolean; id: string }> {
  if (!hasAdminCredentials()) return { ok: false, id: '' };
  const db = getAdminFirestore();
  const ref = input.id
    ? db.collection(COLLECTION).doc(input.id)
    : db.collection(COLLECTION).doc();
  const doc: ExternalSignalDoc = {
    id: ref.id,
    source: input.source,
    signalType: input.signalType,
    payload: input.payload,
    fetchedAtMs: Date.now(),
    ...(input.period ? { period: input.period } : {}),
    ...(input.keywords ? { keywords: input.keywords } : {}),
    ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
    ...(input.manuallyVerified !== undefined
      ? { manuallyVerified: input.manuallyVerified }
      : {}),
    ...(input.language ? { language: input.language } : {}),
  };
  await ref.set(
    {
      ...doc,
      fetchedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return { ok: true, id: ref.id };
}

export async function upsertSignalsBatch(
  inputs: readonly UpsertSignalInput[],
): Promise<{ processed: number; errors: number }> {
  if (!hasAdminCredentials()) return { processed: 0, errors: 0 };
  const db = getAdminFirestore();
  let processed = 0;
  let errors = 0;
  for (let i = 0; i < inputs.length; i += BATCH_LIMIT) {
    const chunk = inputs.slice(i, i + BATCH_LIMIT);
    const batch = db.batch();
    for (const input of chunk) {
      const ref = input.id
        ? db.collection(COLLECTION).doc(input.id)
        : db.collection(COLLECTION).doc();
      const doc: ExternalSignalDoc = {
        id: ref.id,
        source: input.source,
        signalType: input.signalType,
        payload: input.payload,
        fetchedAtMs: Date.now(),
        ...(input.period ? { period: input.period } : {}),
        ...(input.keywords ? { keywords: input.keywords } : {}),
        ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
        ...(input.manuallyVerified !== undefined
          ? { manuallyVerified: input.manuallyVerified }
          : {}),
        ...(input.language ? { language: input.language } : {}),
      };
      batch.set(
        ref,
        {
          ...doc,
          fetchedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
    try {
      await batch.commit();
      processed += chunk.length;
    } catch (err) {
      console.error('[lib/etl/repo] upsertSignalsBatch chunk failed:', err);
      errors += chunk.length;
    }
  }
  return { processed, errors };
}

export interface ListSignalsParams {
  readonly source?: ExternalSignalSource;
  readonly signalType?: ExternalSignalType;
  readonly period?: string;
  readonly keyword?: string;
  readonly limit?: number;
}

export async function listSignals(
  params: ListSignalsParams = {},
): Promise<readonly ExternalSignalDoc[]> {
  if (!hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    let q: FirebaseFirestore.Query = db
      .collection(COLLECTION)
      .orderBy('fetchedAtMs', 'desc')
      .limit(Math.min(Math.max(1, params.limit ?? 50), 200));
    if (params.source) q = q.where('source', '==', params.source);
    if (params.signalType) q = q.where('signalType', '==', params.signalType);
    if (params.period) q = q.where('period', '==', params.period);
    if (params.keyword) q = q.where('keywords', 'array-contains', params.keyword);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as ExternalSignalDoc);
  } catch (err) {
    console.error('[lib/etl/repo] listSignals:', err);
    return [];
  }
}
