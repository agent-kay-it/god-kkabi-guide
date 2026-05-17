/**
 * Chat 모더레이션 admin 조회 — Firestore Admin SDK (server-only).
 * 출처: docs/sprint/10-sprint-launch/design.md §14 + Task #27
 *
 * 책임:
 *  - listRecentChatRateLimitOffenders: 최근 rate limit 초과/높은 사용자 (분석용)
 *  - countPendingChatReports: 신고 queue 갯수 (admin dashboard widget)
 *
 * 모든 함수는 admin 인증 자체 검증을 수행한다 — 호출자 가드 우회 방지.
 */
import 'server-only';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';

export interface RateLimitOffender {
  readonly uid: string;
  readonly minuteCount: number;
  readonly hourCount: number;
  readonly updatedAtMs: number;
}

export async function listRecentChatRateLimitOffenders(
  limit = 20,
): Promise<readonly RateLimitOffender[]> {
  const session = await auth();
  if (session?.user?.role !== 'admin' || !hasAdminCredentials()) return [];
  try {
    const db = getAdminFirestore();
    // 최근 갱신된 doc 중 hourCount가 높은 사용자
    const snap = await db
      .collection('chat_rate_limits')
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((doc) => {
      const data = doc.data() as {
        minuteCount?: number;
        hourCount?: number;
        updatedAt?: FirebaseFirestore.Timestamp;
      };
      return {
        uid: doc.id,
        minuteCount: data.minuteCount ?? 0,
        hourCount: data.hourCount ?? 0,
        updatedAtMs: data.updatedAt?.toMillis() ?? 0,
      };
    });
  } catch {
    return [];
  }
}

export async function countPendingChatReports(): Promise<number> {
  const session = await auth();
  if (session?.user?.role !== 'admin' || !hasAdminCredentials()) return 0;
  try {
    const db = getAdminFirestore();
    // count() aggregation은 Firestore Admin SDK >= v11에서 지원.
    // count 미지원 환경은 limit 100으로 cap.
    const snap = await db
      .collection('chat_reports')
      .where('resolved', '==', 'pending')
      .limit(100)
      .get();
    return snap.size;
  } catch {
    return 0;
  }
}
