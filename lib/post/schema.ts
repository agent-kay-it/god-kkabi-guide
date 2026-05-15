/**
 * 게시물 입력 Zod schema — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1 + types/post.ts POST_LIMITS
 *
 * 'use server' 모듈 제약 회피를 위해 별도 schema 모듈로 분리
 * (Server Action 파일은 async function만 export 가능).
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
