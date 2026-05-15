/**
 * 시뮬레이터 통계 기록 Server Action — Sprint V2 F3.1.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §1.4
 *
 * 책임:
 *  - simulator_runs Firestore 컬렉션에 저장 (uid 옵셔널, 익명 허용)
 *  - 주간 채용률 집계의 데이터 소스 (F3.2)
 *  - 익명 사용자는 IP rate-limit 없이 허용 (스팸 위험 낮음, 클라이언트만 영향)
 */
'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { buildComboId, type ClassId, type SynergyTier } from '@/types/simulator';
import type { WikiJinryeongId } from '@/types/wiki';

export interface RecordSimulatorRunInput {
  readonly jinryeongIds: readonly WikiJinryeongId[];
  readonly synergyScore: number;
  readonly tier: SynergyTier;
  readonly classId?: ClassId;
}

export async function recordSimulatorRun(
  input: RecordSimulatorRunInput,
): Promise<{ ok: boolean; id?: string }> {
  if (input.jinryeongIds.length !== 3) return { ok: false };
  if (!hasAdminCredentials()) return { ok: false };

  const session = await auth();
  const uid = session?.user?.id;

  try {
    const db = getAdminFirestore();
    const ref = db.collection('simulator_runs').doc();
    await ref.set({
      id: ref.id,
      ...(uid ? { uid } : {}),
      comboId: buildComboId(input.jinryeongIds),
      jinryeongIds: input.jinryeongIds,
      ...(input.classId ? { classId: input.classId } : {}),
      synergyScore: input.synergyScore,
      tier: input.tier,
      timestamp: FieldValue.serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (err) {
    console.error('[lib/simulator/actions] recordSimulatorRun:', err);
    return { ok: false };
  }
}
