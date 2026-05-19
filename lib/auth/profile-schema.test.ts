/**
 * Sprint 15 / F15-I — ProfileEditSchema unit test.
 */
import { describe, it, expect } from 'vitest';
import { ProfileEditSchema } from './profile-schema';

describe('ProfileEditSchema', () => {
  const validInput = {
    serverId: 'S785',
    munpa: '무명',
    nickname: '무명랑',
    classId: 'swordsman' as const,
  };

  it('valid input → success', () => {
    expect(ProfileEditSchema.safeParse(validInput).success).toBe(true);
  });

  describe('serverId', () => {
    it('S 로 시작하고 1~4자리 숫자 → 통과', () => {
      for (const v of ['S1', 'S99', 'S785', 'S9999']) {
        expect(ProfileEditSchema.safeParse({ ...validInput, serverId: v }).success).toBe(true);
      }
    });
    it('S 없이 숫자만 → 실패', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, serverId: '785' }).success).toBe(false);
    });
    it('S + 5자리 이상 → 실패', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, serverId: 'S12345' }).success).toBe(false);
    });
    it('빈 문자열 → 실패', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, serverId: '' }).success).toBe(false);
    });
  });

  describe('munpa', () => {
    it('1~30자 → 통과', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, munpa: 'A' }).success).toBe(true);
      expect(ProfileEditSchema.safeParse({ ...validInput, munpa: 'A'.repeat(30) }).success).toBe(true);
    });
    it('빈 문자열 → 실패', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, munpa: '' }).success).toBe(false);
    });
    it('31자 이상 → 실패', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, munpa: 'A'.repeat(31) }).success).toBe(false);
    });
  });

  describe('nickname', () => {
    it('2~12자 → 통과', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, nickname: 'AB' }).success).toBe(true);
      expect(ProfileEditSchema.safeParse({ ...validInput, nickname: 'A'.repeat(12) }).success).toBe(true);
    });
    it('1자 → 실패', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, nickname: 'A' }).success).toBe(false);
    });
    it('13자 이상 → 실패', () => {
      expect(ProfileEditSchema.safeParse({ ...validInput, nickname: 'A'.repeat(13) }).success).toBe(false);
    });
  });

  describe('classId', () => {
    it('warrior / swordsman / medium → 통과', () => {
      for (const v of ['warrior', 'swordsman', 'medium'] as const) {
        expect(ProfileEditSchema.safeParse({ ...validInput, classId: v }).success).toBe(true);
      }
    });
    it('잘못된 enum → 실패', () => {
      expect(
        ProfileEditSchema.safeParse({
          ...validInput,
          classId: 'archer' as unknown as 'warrior',
        }).success,
      ).toBe(false);
    });
  });

  describe('strict', () => {
    it('알 수 없는 필드 추가 → 실패 (strict)', () => {
      expect(
        ProfileEditSchema.safeParse({ ...validInput, extraField: 'x' } as unknown as typeof validInput).success,
      ).toBe(false);
    });
  });
});
