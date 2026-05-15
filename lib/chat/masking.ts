/**
 * 한국어 금칙어 마스킹 — 클라이언트 사전 처리.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §14 (모더레이션 정책)
 *
 * 정책:
 *  - 명백한 욕설/모욕성 단어는 클라이언트에서 즉시 마스킹 (***)
 *  - 운영자 사후 검토 가능 (chat_reports에 messageSnapshot 보관)
 *  - 우회 시도(공백 삽입, 영문 변환 등)는 기본만 처리 (V1+ 강화)
 *
 * 본 모듈은 최소 기본 사전. 운영자가 admin 콘솔에서 추가 등록 예정 (P3.D admin).
 */

const KOREAN_BAD_WORDS: readonly string[] = [
  // 욕설 기본
  '시발',
  '씨발',
  '병신',
  '븅신',
  '개새',
  '좆',
  '존나',
  '미친',
  '닥쳐',
  // 모욕
  '바보',
  '멍청',
  '븅',
];

const COMPILED_PATTERN = new RegExp(
  `(${KOREAN_BAD_WORDS.map((w) => w.split('').join('\\s*')).join('|')})`,
  'gi',
);

export function maskBadWords(input: string): string {
  if (!input) return input;
  return input.replace(COMPILED_PATTERN, (match) => '*'.repeat(match.length));
}

/** 마스킹이 한 군데라도 적용되었는지 — 신고/카운트 용 */
export function containsBadWord(input: string): boolean {
  if (!input) return false;
  COMPILED_PATTERN.lastIndex = 0;
  return COMPILED_PATTERN.test(input);
}
