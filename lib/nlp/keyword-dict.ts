/**
 * Pain Point KR 키워드 사전 — Sprint V2 F3.5.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §5.1
 *
 * 운영자가 점진 보강. 초기 ~40 핵심 키워드.
 * 매칭은 정확 단어 + aliases 정규식 OR 매칭.
 */

import type { PainKeyword } from '@/types/nlp';

export const PAIN_KEYWORDS: readonly PainKeyword[] = [
  // ─── bug ───
  { id: 'b_bug', term: '버그', aliases: ['벅스', '버그발생', '오작동'], category: 'bug', severity: 'major' },
  { id: 'b_error', term: '에러', aliases: ['오류', 'error'], category: 'bug', severity: 'major' },
  { id: 'b_crash', term: '튕김', aliases: ['튕겨', '강제종료', '크래시'], category: 'bug', severity: 'major' },
  { id: 'b_lag', term: '랙', aliases: ['렉', '버벅', '프레임드랍'], category: 'bug', severity: 'minor' },
  { id: 'b_notwork', term: '안됨', aliases: ['안 됨', '작동안함', '안돼'], category: 'bug', severity: 'major' },
  { id: 'b_disconnect', term: '접속끊김', aliases: ['렉걸려', '서버다운'], category: 'bug', severity: 'major' },

  // ─── balance ───
  { id: 'l_nerf', term: '너프', aliases: ['하향'], category: 'balance', severity: 'major' },
  { id: 'l_buff', term: '버프', aliases: ['상향', '강화'], category: 'balance', severity: 'minor' },
  { id: 'l_op', term: 'OP', aliases: ['오피', '사기'], category: 'balance', severity: 'major' },
  { id: 'l_weak', term: '약함', aliases: ['약해', '쓰레기'], category: 'balance', severity: 'minor' },
  { id: 'l_imba', term: '밸런스', aliases: ['밸붕', '밸런스망함'], category: 'balance', severity: 'major' },

  // ─── monetization ───
  { id: 'm_pay', term: '과금', aliases: ['현질', '결제', '돈쓴', '돈써야'], category: 'monetization', severity: 'major' },
  { id: 'm_expensive', term: '비싸', aliases: ['비쌈', '가격', '돈없'], category: 'monetization', severity: 'minor' },
  { id: 'm_coupon', term: '쿠폰', aliases: ['혜택', '무료', '이벤트쿠폰'], category: 'monetization', severity: 'minor' },
  { id: 'm_p2w', term: 'P2W', aliases: ['pay to win', '돈게임'], category: 'monetization', severity: 'major' },
  { id: 'm_gacha', term: '뽑기', aliases: ['가챠', '확률조작'], category: 'monetization', severity: 'major' },

  // ─── qol ───
  { id: 'q_inconvenient', term: '불편', aliases: ['답답', '귀찮'], category: 'qol', severity: 'minor' },
  { id: 'q_ui', term: 'UI', aliases: ['인터페이스', '메뉴구조', '메뉴이상'], category: 'qol', severity: 'minor' },
  { id: 'q_auto', term: '자동사냥', aliases: ['오토', '자동'], category: 'qol', severity: 'minor' },
  { id: 'q_slow', term: '느림', aliases: ['로딩', '느려'], category: 'qol', severity: 'minor' },
  { id: 'q_translation', term: '번역', aliases: ['오타', '한글', '한국어'], category: 'qol', severity: 'minor' },

  // ─── event ───
  { id: 'e_event', term: '이벤트', aliases: ['이벤트보상'], category: 'event', severity: 'minor' },
  { id: 'e_attendance', term: '출석', aliases: ['출석보상'], category: 'event', severity: 'minor' },
  { id: 'e_seasonal', term: '시즌', aliases: ['시즌패스', '시즌이벤트'], category: 'event', severity: 'minor' },

  // ─── class ───
  { id: 'c_warrior', term: '전사', aliases: [], category: 'class', severity: 'minor' },
  { id: 'c_swordsman', term: '검객', aliases: [], category: 'class', severity: 'minor' },
  { id: 'c_medium', term: '영매', aliases: [], category: 'class', severity: 'minor' },
];

const KEYWORD_PATTERNS: ReadonlyMap<string, RegExp> = new Map(
  PAIN_KEYWORDS.map((kw) => {
    const terms = [kw.term, ...kw.aliases].map(escapeRegex).join('|');
    return [kw.id, new RegExp(`(${terms})`, 'gi')];
  }),
);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface PainExtractMatch {
  readonly keywordId: string;
  readonly count: number;
  readonly firstIndex: number;
}

/**
 * 텍스트에서 pain keyword 매칭 추출. case-insensitive.
 * 동일 키워드 다중 매칭 = count 합산.
 *
 * Sprint V2 P5 (CA2-I6): matchAll 사용 — exec 루프의 lastIndex 부작용 제거 +
 * Iterator 한 번 순회로 즉시 firstIndex/count 계산. 매칭 객체 생성 비용은 동일.
 */
export function extractPainKeywords(text: string): readonly PainExtractMatch[] {
  if (!text) return [];
  const matches: PainExtractMatch[] = [];
  for (const [keywordId, pattern] of KEYWORD_PATTERNS) {
    let count = 0;
    let firstIndex = -1;
    for (const m of text.matchAll(pattern)) {
      if (firstIndex < 0 && m.index !== undefined) firstIndex = m.index;
      count++;
    }
    if (count > 0) matches.push({ keywordId, count, firstIndex });
  }
  return matches;
}

/**
 * 매칭 위치 주변 ±50자 excerpt 추출.
 */
export function excerptAround(text: string, index: number, radius = 50): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  const slice = text.slice(start, end).replace(/\s+/g, ' ').trim();
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${slice}${suffix}`;
}

export function getKeywordById(id: string): PainKeyword | undefined {
  return PAIN_KEYWORDS.find((k) => k.id === id);
}
