/**
 * 게시물 입력 Zod schema — Sprint V1 + Sprint V2 보강.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1 + types/post.ts POST_LIMITS
 *      + docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §0 (carry-over CA-m1/CA-M1)
 *
 * 본 모듈은 'use server' 디렉티브가 없어 client/server 양쪽에서 import 가능
 * (form validation 클라이언트 + Server Action 서버). Server Action 파일
 * (lib/post/actions.ts)이 본 schema를 import하여 사용.
 *
 * Sprint V2 P3.A:
 *  - CA-m1 (주석 정리): 'use server' misleading 인용 제거 + import 패턴 명시
 *  - CA-M1 (태그 멤버십): TAG_PREFIX_RE 형식 검증 위에 wiki seed cross-check refine 추가
 *    → lib/wiki/valid-ids-cache.ts에서 5분 캐시된 valid IDs Set 사용
 *    → Server Action에서 async parse 시 활성, 클라이언트는 prefix 형식만 검증 (성능)
 */

import { z } from 'zod';

import { POST_LIMITS, type PostCategory } from '@/types/post';

const POST_CATEGORIES: readonly PostCategory[] = ['build', 'guide', 'review'] as const;

/** 태그 화이트리스트 prefix — 실제 ID는 prefix:value 형태 */
const TAG_PREFIX_RE = /^(class|jinryeong|content|skill|equipment|munpa):[a-z0-9_-]{1,40}$/;

/** Firebase Storage URL 화이트리스트 */
const STORAGE_URL_RE = /^https:\/\/firebasestorage\.googleapis\.com\//;

export const PostInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(POST_LIMITS.title.min, `제목은 ${POST_LIMITS.title.min}자 이상 입력해주세요`)
      .max(POST_LIMITS.title.max, `제목은 최대 ${POST_LIMITS.title.max}자까지`),
    body: z
      .string()
      .trim()
      .min(POST_LIMITS.body.min, `본문은 ${POST_LIMITS.body.min}자 이상 작성해주세요`)
      .max(POST_LIMITS.body.max, `본문은 최대 ${POST_LIMITS.body.max}자까지`),
    category: z.enum(POST_CATEGORIES as readonly [PostCategory, ...PostCategory[]]),
    tags: z
      .array(z.string().regex(TAG_PREFIX_RE, '태그 형식 오류 (prefix:value)'))
      .max(POST_LIMITS.tags.max, `태그는 최대 ${POST_LIMITS.tags.max}개`),
    imageUrls: z
      .array(z.string().regex(STORAGE_URL_RE, '이미지 URL은 Firebase Storage만 허용'))
      .max(POST_LIMITS.images.max, `이미지는 최대 ${POST_LIMITS.images.max}개`),
  })
  .strict();

export type PostInputParsed = z.infer<typeof PostInputSchema>;

/** 24시간 자유 수정 윈도우 (ms) */
export const POST_FREE_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Sprint V2 P3.A — CA-M1 태그 멤버십 검증 helper.
 *
 * Server Action에서 PostInputSchema parse 후 본 함수로 추가 검증.
 * Zod superRefine 대신 분리 — 클라이언트는 형식 검증만, 서버는 형식 + 멤버십 양쪽.
 *
 * @returns null if all tags valid, otherwise array of invalid tag ids
 */
export interface WikiIdSets {
  readonly class: ReadonlySet<string>;
  readonly jinryeong: ReadonlySet<string>;
  readonly content: ReadonlySet<string>;
  readonly skill: ReadonlySet<string>;
  readonly equipment: ReadonlySet<string>;
  readonly munpa: ReadonlySet<string>;
}

export function validateTagMembership(
  tags: readonly string[],
  validIds: WikiIdSets,
): readonly string[] {
  const invalid: string[] = [];
  for (const tag of tags) {
    const [prefix, ...rest] = tag.split(':');
    const id = rest.join(':');
    if (!prefix || !id) {
      invalid.push(tag);
      continue;
    }
    const set = (validIds as unknown as Record<string, ReadonlySet<string>>)[prefix];
    if (!set || !set.has(id)) invalid.push(tag);
  }
  return invalid;
}
