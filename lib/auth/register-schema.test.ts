/**
 * Sprint 15 / F15-I — RegisterFormSchema unit test.
 */
import { describe, it, expect } from 'vitest';
import { RegisterFormSchema } from './register-schema';

const valid = {
  serverId: 'S785',
  gameUid: 'abc123',
  munpa: '무명',
  nickname: '무명랑',
  classId: 'swordsman' as const,
  age14plus: true,
  chatPublic: true,
  unofficial: true,
  operator24h: true,
  analytics: false,
  advertising: false,
};

describe('RegisterFormSchema', () => {
  it('valid input → success', () => {
    expect(RegisterFormSchema.safeParse(valid).success).toBe(true);
  });

  describe('gameUid', () => {
    it('4~20자 영문/숫자 → 통과', () => {
      for (const v of ['abcd', 'A1234567890', 'abcdefghij1234567890']) {
        expect(RegisterFormSchema.safeParse({ ...valid, gameUid: v }).success).toBe(true);
      }
    });
    it('3자 이하 → 실패', () => {
      expect(RegisterFormSchema.safeParse({ ...valid, gameUid: 'abc' }).success).toBe(false);
    });
    it('21자 이상 → 실패', () => {
      expect(
        RegisterFormSchema.safeParse({ ...valid, gameUid: 'a'.repeat(21) }).success,
      ).toBe(false);
    });
    it('특수문자 포함 → 실패', () => {
      expect(RegisterFormSchema.safeParse({ ...valid, gameUid: 'abc-123' }).success).toBe(false);
      expect(RegisterFormSchema.safeParse({ ...valid, gameUid: 'abc 123' }).success).toBe(false);
    });
  });

  describe('PIPA 필수 동의', () => {
    it('age14plus = false → 실패', () => {
      expect(RegisterFormSchema.safeParse({ ...valid, age14plus: false }).success).toBe(false);
    });
    it('chatPublic = false → 실패', () => {
      expect(RegisterFormSchema.safeParse({ ...valid, chatPublic: false }).success).toBe(false);
    });
    it('unofficial = false → 실패', () => {
      expect(RegisterFormSchema.safeParse({ ...valid, unofficial: false }).success).toBe(false);
    });
    it('operator24h = false → 실패', () => {
      expect(RegisterFormSchema.safeParse({ ...valid, operator24h: false }).success).toBe(false);
    });
  });

  describe('PIPA 선택 동의', () => {
    it('analytics = false 도 통과', () => {
      expect(RegisterFormSchema.safeParse({ ...valid, analytics: false }).success).toBe(true);
    });
    it('advertising = false 도 통과', () => {
      expect(RegisterFormSchema.safeParse({ ...valid, advertising: false }).success).toBe(true);
    });
  });

  describe('strict', () => {
    it('알 수 없는 필드 추가 → 실패', () => {
      expect(
        RegisterFormSchema.safeParse({ ...valid, unknown: 'x' } as unknown as typeof valid).success,
      ).toBe(false);
    });
  });
});
