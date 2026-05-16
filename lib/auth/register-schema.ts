/**
 * 사용자 등록 폼 Zod 스키마 — Server Action과 Client 폼에서 공통 사용.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §7
 *
 * 별도 파일 사유: lib/auth/register.ts는 'use server' 디렉티브가 적용되어
 * async function만 export 가능. 스키마/타입은 본 파일에서 분리.
 */
import { z } from 'zod';

export const RegisterFormSchema = z
  .object({
    serverId: z
      .string()
      .regex(/^S\d{1,4}$/, '서버ID는 S로 시작하고 숫자 1-4자 (예: S785)'),
    gameUid: z
      .string()
      .min(4, '게임 UID는 4자 이상')
      .max(20, '게임 UID는 20자 이하')
      .regex(/^[A-Za-z0-9]+$/, '게임 UID는 영문/숫자만 허용'),
    munpa: z
      .string()
      .min(1, '문파 이름을 입력하세요')
      .max(30, '문파 이름은 30자 이하'),
    nickname: z
      .string()
      .min(2, '닉네임은 2자 이상')
      .max(12, '닉네임은 12자 이하'),
    classId: z.enum(['warrior', 'swordsman', 'medium']),

    // PIPA 4 동의 (전부 true 필수)
    age14plus: z
      .boolean()
      .refine((v) => v === true, '만 14세 이상 동의 필수'),
    chatPublic: z
      .boolean()
      .refine((v) => v === true, '채팅 공개 정보 처리 동의 필수'),
    unofficial: z
      .boolean()
      .refine((v) => v === true, '비공식 팬 가이드 동의 필수'),
    operator24h: z
      .boolean()
      .refine((v) => v === true, '운영자 24시간 응대 동의 필수'),
    analytics: z.boolean(), // 선택 동의
    // Sprint V1: PIPA 5번째 동의 — AdSense (선택)
    advertising: z.boolean(),
  })
  .strict();

export type RegisterFormInput = z.infer<typeof RegisterFormSchema>;

export type RegisterResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'VALIDATION_FAILED'
        | 'GAMEUID_TAKEN'
        | 'NICKNAME_TAKEN_IN_SERVER'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INTERNAL';
      fieldErrors?: Partial<Record<keyof RegisterFormInput, string>>;
      message?: string;
    };
