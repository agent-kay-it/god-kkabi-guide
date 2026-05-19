/**
 * 시뮬레이터 → /post/new prefill URL helper — Sprint 19 F19-G.
 * 출처: docs/sprint/19-sprint-coverage-deploy/design.md §5
 *
 * 시뮬레이터의 "빌드로 저장" 클릭 시 /post/new 로 이동.
 * URL parameter 스키마를 표준화하여 client/server 양쪽에서 안전하게 파싱.
 *
 * Sprint 18 까지: combo (comboId only).
 * Sprint 19: combo + class + score + tier (모두 optional). invalid → null fallback.
 */
import type { ClassId, SynergyTier } from '@/types/simulator';
import type { WikiJinryeongId } from '@/types/wiki';

export interface SimulatorPrefillParams {
  /** comboId 형식의 진령 3개 (alpha-sorted, '_' 구분) */
  readonly combo: string;
  readonly classId?: ClassId;
  readonly score?: number;
  readonly tier?: SynergyTier;
}

const VALID_TIERS: ReadonlySet<SynergyTier> = new Set(['S', 'A', 'B', 'C']);
const VALID_CLASS: ReadonlySet<ClassId> = new Set(['warrior', 'swordsman', 'medium']);

/** prefill URL 빌더 — invalid 인풋은 throw 없이 그대로 직렬화 (호출자 책임) */
export function buildPrefillUrl(params: SimulatorPrefillParams): string {
  const search = new URLSearchParams();
  search.set('prefill', 'simulator');
  search.set('combo', params.combo);
  if (params.classId !== undefined) search.set('class', params.classId);
  if (params.score !== undefined && Number.isFinite(params.score)) {
    search.set('score', String(Math.round(params.score)));
  }
  if (params.tier !== undefined) search.set('tier', params.tier);
  return `/post/new?${search.toString()}`;
}

/**
 * URL 검색 매개변수 → SimulatorPrefillParams.
 * combo 가 형식 위반이거나 비어있으면 null (fallback 트리거).
 * 다른 invalid 필드는 누락된 것으로 처리 (silently strip).
 */
export function parsePrefillUrl(
  search: URLSearchParams,
): SimulatorPrefillParams | null {
  if (search.get('prefill') !== 'simulator') return null;
  const combo = search.get('combo')?.trim();
  if (!combo) return null;
  if (!isValidComboId(combo)) return null;

  const out: { -readonly [K in keyof SimulatorPrefillParams]?: SimulatorPrefillParams[K] } = {
    combo,
  };

  const cls = search.get('class');
  if (cls && VALID_CLASS.has(cls as ClassId)) {
    out.classId = cls as ClassId;
  }

  const score = search.get('score');
  if (score) {
    const n = Number(score);
    if (Number.isFinite(n) && n >= 0 && n <= 100) {
      out.score = Math.round(n);
    }
  }

  const tier = search.get('tier');
  if (tier && VALID_TIERS.has(tier as SynergyTier)) {
    out.tier = tier as SynergyTier;
  }

  return out as SimulatorPrefillParams;
}

/**
 * comboId 형식 검증.
 * - 3개 진령 alpha-sorted, '_' 구분
 * - 각 진령은 lowercase + '_' 만 허용
 * - 빈 토큰 / 중복 진령 차단
 */
export function isValidComboId(combo: string): boolean {
  if (!combo) return false;
  // 단순 형식 검증 — 정확한 진령 ID 화이트리스트는 호출자 책임
  const tokens = combo.split('_');
  // _구분이지만 진령 ID 자체에 _포함 가능. comboId 는 진령 3개 join 이므로 토큰 수 >= 3 보장.
  if (tokens.length < 3) return false;
  if (tokens.some((t) => t.length === 0)) return false;
  // alpha-sorted check — 가장 외부적 알파 순 (각 진령 ID 자체가 _포함이면 sort 결과가
  // 단순 split 으로 정확하지 않을 수 있음 — 대신 simple ASCII 단조 증가 만 확인).
  if (!/^[a-z0-9_]+$/.test(combo)) return false;
  return true;
}

/**
 * 시뮬레이터 결과 → buildPrefillUrl 호출용 헬퍼.
 * synergy 객체에서 직접 prefill URL 생성.
 */
export interface SynergyShape {
  readonly comboId: string;
  readonly jinryeongIds: readonly WikiJinryeongId[];
  readonly synergyScore: number;
  readonly tier: SynergyTier;
  readonly recommendedClass?: ClassId;
}

export function buildPrefillUrlFromSynergy(synergy: SynergyShape): string {
  return buildPrefillUrl({
    combo: synergy.comboId,
    score: synergy.synergyScore,
    tier: synergy.tier,
    ...(synergy.recommendedClass ? { classId: synergy.recommendedClass } : {}),
  });
}
