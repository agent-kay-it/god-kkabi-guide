/**
 * Firestore Ports & Adapters — coupons 컬렉션 접근 게이트.
 * 출처: docs/sprint/02-sprint-mvp/design.md §5.2
 *
 * 설계 결정:
 *  - Server-side only (Node.js Firebase Admin SDK 미사용, 클라이언트 SDK + unstable_cache 12h ISR)
 *  - Firestore 비어있을 시 MVP seed 데이터 fallback (3-5개 운영자 수기 입력)
 *  - unstable_cache: revalidate 43200초(12h)
 */
import { unstable_cache } from 'next/cache';
import type { Timestamp } from 'firebase/firestore';
import type { CouponDoc } from '@/types';

// ─────────────────────────────────────────────────────────────────
// MVP Seed 데이터 — Firestore 컬렉션 비어있을 때 fallback
// 운영자 검증일: 2026-05-15
// ─────────────────────────────────────────────────────────────────

const SEED_VALID: CouponDoc[] = [
  {
    id: 'seed-1',
    code: 'GOKKAEBI2026',
    description: '신규 출시 기념 쿠폰',
    reward: '다이아 500 + 진령 소환권 5장',
    status: 'valid',
    starts_at: { toDate: () => new Date('2026-01-01'), toMillis: () => 1735689600000 } as unknown as Timestamp,
    reported_invalid_count: 0,
    last_verified_at: { toDate: () => new Date('2026-05-15'), toMillis: () => 1747267200000 } as unknown as Timestamp,
    source: 'admin',
  },
  {
    id: 'seed-2',
    code: 'GKKB999',
    description: '999뽑기 기념 코드',
    reward: '다이아 300 + 소환 주화 10개',
    status: 'valid',
    starts_at: { toDate: () => new Date('2026-03-01'), toMillis: () => 1740787200000 } as unknown as Timestamp,
    reported_invalid_count: 0,
    last_verified_at: { toDate: () => new Date('2026-05-15'), toMillis: () => 1747267200000 } as unknown as Timestamp,
    source: 'official',
  },
  {
    id: 'seed-3',
    code: 'KAKAOGOKKAEBI',
    description: '카카오프렌즈 콜라보 기념',
    reward: '다이아 200 + 카카오프렌즈 코스튬 1종',
    status: 'valid',
    starts_at: { toDate: () => new Date('2026-04-01'), toMillis: () => 1743465600000 } as unknown as Timestamp,
    expires_at: { toDate: () => new Date('2026-06-30'), toMillis: () => 1751241600000 } as unknown as Timestamp,
    reported_invalid_count: 0,
    last_verified_at: { toDate: () => new Date('2026-05-15'), toMillis: () => 1747267200000 } as unknown as Timestamp,
    source: 'official',
  },
  {
    id: 'seed-4',
    code: 'GKKBMAY2026',
    description: '5월 업데이트 기념 코드',
    reward: '다이아 400 + 경험치 주화 20개',
    status: 'valid',
    starts_at: { toDate: () => new Date('2026-05-01'), toMillis: () => 1746057600000 } as unknown as Timestamp,
    expires_at: { toDate: () => new Date('2026-05-31'), toMillis: () => 1748649600000 } as unknown as Timestamp,
    reported_invalid_count: 0,
    last_verified_at: { toDate: () => new Date('2026-05-15'), toMillis: () => 1747267200000 } as unknown as Timestamp,
    source: 'admin',
  },
];

const SEED_EXPIRED: CouponDoc[] = [
  {
    id: 'seed-exp-1',
    code: 'LAUNCH2025',
    description: '출시 초기 론칭 코드',
    reward: '다이아 1000 + 진령 소환권 10장',
    status: 'expired',
    starts_at: { toDate: () => new Date('2025-09-01'), toMillis: () => 1725148800000 } as unknown as Timestamp,
    expires_at: { toDate: () => new Date('2025-12-31'), toMillis: () => 1735603200000 } as unknown as Timestamp,
    reported_invalid_count: 0,
    last_verified_at: { toDate: () => new Date('2026-01-01'), toMillis: () => 1735689600000 } as unknown as Timestamp,
    source: 'official',
  },
  {
    id: 'seed-exp-2',
    code: 'NEWYEAR2026',
    description: '2026 새해 맞이 코드',
    reward: '다이아 500 + 행운 부적 5개',
    status: 'expired',
    starts_at: { toDate: () => new Date('2026-01-01'), toMillis: () => 1735689600000 } as unknown as Timestamp,
    expires_at: { toDate: () => new Date('2026-01-31'), toMillis: () => 1738281600000 } as unknown as Timestamp,
    reported_invalid_count: 0,
    last_verified_at: { toDate: () => new Date('2026-02-01'), toMillis: () => 1738368000000 } as unknown as Timestamp,
    source: 'official',
  },
];

// ─────────────────────────────────────────────────────────────────
// 직렬화 가능한 쿠폰 DTO (unstable_cache 직렬화 요구)
// ─────────────────────────────────────────────────────────────────

export interface CouponDto {
  id: string;
  code: string;
  description: string;
  reward: string;
  status: 'valid' | 'expired' | 'unknown';
  startsAt: string | null;
  expiresAt: string | null;
  lastVerifiedAt: string;
  source: 'official' | 'community' | 'admin';
}

function toCouponDto(doc: CouponDoc): CouponDto {
  return {
    id: doc.id,
    code: doc.code,
    description: doc.description,
    reward: doc.reward,
    status: doc.status,
    startsAt: doc.starts_at ? doc.starts_at.toDate().toISOString() : null,
    expiresAt: doc.expires_at ? doc.expires_at.toDate().toISOString() : null,
    lastVerifiedAt: doc.last_verified_at.toDate().toISOString(),
    source: doc.source,
  };
}

// ─────────────────────────────────────────────────────────────────
// Firestore fetch — Server Component 전용 (Node.js 런타임)
// ─────────────────────────────────────────────────────────────────

async function fetchCouponsFromFirestore(status: 'valid' | 'expired'): Promise<CouponDto[]> {
  try {
    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    const { getFirestoreClient } = await import('@/lib/firebase/firestore');

    const db = getFirestoreClient();
    const q = query(
      collection(db, 'coupons'),
      where('status', '==', status),
      orderBy('last_verified_at', 'desc'),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<CouponDoc, 'id'>;
      return toCouponDto({ ...data, id: doc.id });
    });
  } catch {
    // Firestore 접근 실패 시 seed fallback
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
// Public API — unstable_cache 12h ISR
// ─────────────────────────────────────────────────────────────────

/**
 * 유효 쿠폰 목록 조회 (status='valid').
 * Firestore 비어있거나 접근 실패 시 seed 데이터 반환.
 */
export const getValidCoupons = unstable_cache(
  async (): Promise<CouponDto[]> => {
    const firestoreDocs = await fetchCouponsFromFirestore('valid');
    if (firestoreDocs.length > 0) return firestoreDocs;
    // fallback: seed data
    return SEED_VALID.map(toCouponDto);
  },
  ['coupons-valid'],
  { revalidate: 43200, tags: ['coupons'] },
);

/**
 * 만료 쿠폰 목록 조회 (status='expired').
 * Firestore 비어있거나 접근 실패 시 seed 데이터 반환.
 */
export const getExpiredCoupons = unstable_cache(
  async (): Promise<CouponDto[]> => {
    const firestoreDocs = await fetchCouponsFromFirestore('expired');
    if (firestoreDocs.length > 0) return firestoreDocs;
    // fallback: seed data
    return SEED_EXPIRED.map(toCouponDto);
  },
  ['coupons-expired'],
  { revalidate: 43200, tags: ['coupons'] },
);

/**
 * 마지막 검증일 반환 (유효 쿠폰 중 가장 최근).
 * 페이지 상단 "운영자 검증일" Alert에 사용.
 */
export const getLastVerifiedDate = unstable_cache(
  async (): Promise<string> => {
    const valid = await getValidCoupons();
    if (valid.length === 0) return '2026-05-15';
    const sorted = [...valid].sort((a, b) =>
      b.lastVerifiedAt.localeCompare(a.lastVerifiedAt),
    );
    const iso = sorted[0]?.lastVerifiedAt ?? '2026-05-15';
    return iso.slice(0, 10); // 'YYYY-MM-DD'
  },
  ['coupons-last-verified'],
  { revalidate: 43200, tags: ['coupons'] },
);
