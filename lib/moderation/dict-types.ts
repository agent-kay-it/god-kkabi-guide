/**
 * 모더레이션 사전 타입 + 마스킹 helper (sync).
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/moderation-policy.md §2
 *
 * 별도 모듈 사유: lib/moderation/dictionaries.ts는 'use server' 디렉티브가 적용되어
 * async function만 export 가능. 타입/sync helper는 본 파일에서 분리.
 */

export type DictCategory = 'badword' | 'spam_keyword' | 'whitelisted';
export type DictSeverity = 'mask' | 'block';

export interface ModerationDict {
  readonly id: string;
  readonly category: DictCategory;
  readonly pattern: string;
  readonly isRegex: boolean;
  readonly severity: DictSeverity;
  readonly active: boolean;
  readonly createdBy: string;
  readonly createdAtMs: number;
}

export interface DictInputAdmin {
  readonly category: DictCategory;
  readonly pattern: string;
  readonly isRegex: boolean;
  readonly severity: DictSeverity;
}

/**
 * Seed fallback — Sprint v2 `lib/chat/masking.ts` 하드코딩 11종 이관.
 * Admin SDK 미설정 / 빈 컬렉션 / 로드 실패 시 사용.
 */
export const SEED_DICTIONARIES: readonly ModerationDict[] = [
  { id: 'seed_01', category: 'badword', pattern: '시발', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_02', category: 'badword', pattern: '병신', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_03', category: 'badword', pattern: '개새끼', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_04', category: 'badword', pattern: '존나', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_05', category: 'badword', pattern: '좆', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_06', category: 'badword', pattern: '씨발', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_07', category: 'badword', pattern: '븅신', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_08', category: 'badword', pattern: '미친새끼', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_09', category: 'badword', pattern: '쌍놈', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_10', category: 'badword', pattern: '꺼져', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
  { id: 'seed_11', category: 'badword', pattern: '죽어', isRegex: false, severity: 'mask', active: true, createdBy: 'seed', createdAtMs: 0 },
];

/**
 * 마스킹 적용 — badword 패턴을 ★로 치환.
 * client/server 양쪽에서 동일 로직.
 */
export function applyDictionaries(
  text: string,
  dictionaries: readonly ModerationDict[],
): { masked: string; blocked: boolean; matchCount: number } {
  let masked = text;
  let blocked = false;
  let matchCount = 0;
  for (const dict of dictionaries) {
    if (dict.category === 'whitelisted') continue;
    try {
      const re = dict.isRegex
        ? new RegExp(dict.pattern, 'gi')
        : new RegExp(escapeRegex(dict.pattern), 'gi');
      const matches = masked.match(re);
      if (matches && matches.length > 0) {
        matchCount += matches.length;
        if (dict.severity === 'block') blocked = true;
        else masked = masked.replace(re, (m) => '★'.repeat(m.length));
      }
    } catch {
      // invalid regex — skip
    }
  }
  return { masked, blocked, matchCount };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
