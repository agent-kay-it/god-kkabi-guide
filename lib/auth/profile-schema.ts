/**
 * 사용자 프로필 수정 Zod 스키마.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.4 (회원 정보 수정)
 *
 * RegisterFormSchema와 분리한 이유:
 * - gameUid는 수정 불가 (게임 식별자, 변경 시 데이터 정합성 깨짐)
 * - PIPA 동의는 한 번 동의 후 변경 불가 (별도 광고 동의 토글만 분리 가능)
 * - 부분 업데이트(.partial())가 아니라 4 필드 모두 받는 strict 패턴 — 폼이 전체 상태를 가짐
 */
import { z } from 'zod';

export const ProfileEditSchema = z
  .object({
    serverId: z
      .string()
      .regex(/^S\d{1,4}$/, '서버ID는 S로 시작하고 숫자 1-4자 (예: S785)'),
    munpa: z
      .string()
      .min(1, '문파 이름을 입력하세요')
      .max(30, '문파 이름은 30자 이하'),
    nickname: z
      .string()
      .min(2, '닉네임은 2자 이상')
      .max(12, '닉네임은 12자 이하'),
    classId: z.enum(['warrior', 'swordsman', 'medium']),
  })
  .strict();

export type ProfileEditInput = z.infer<typeof ProfileEditSchema>;

export type ProfileEditResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | 'UNAUTHENTICATED'
        | 'NOT_REGISTERED'
        | 'VALIDATION_FAILED'
        | 'NICKNAME_TAKEN_IN_SERVER'
        | 'ADMIN_NOT_CONFIGURED'
        | 'INTERNAL';
      fieldErrors?: Partial<Record<keyof ProfileEditInput, string>>;
      message?: string;
    };
