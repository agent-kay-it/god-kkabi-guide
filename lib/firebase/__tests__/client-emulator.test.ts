/**
 * Sprint 15 / F15-I — lib/firebase/client.ts 의 isFirebaseEmulator() 분기 검증.
 *
 * 본 test 는 모듈의 emulator 분기 로직만 검증 (초기화 자체는 e2e 영역).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isFirebaseEmulator } from '../client';

describe('isFirebaseEmulator()', () => {
  const original = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR;
    } else {
      process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR = original;
    }
  });

  it('env 미설정 시 false (production / staging 보호)', () => {
    expect(isFirebaseEmulator()).toBe(false);
  });

  it('env = "true" 시 true', () => {
    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR = 'true';
    expect(isFirebaseEmulator()).toBe(true);
  });

  it('env = "false" 시 false (문자열 비교)', () => {
    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR = 'false';
    expect(isFirebaseEmulator()).toBe(false);
  });

  it('env = "1" 등 truthy 값은 false (오타 보호 — strict equality)', () => {
    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR = '1';
    expect(isFirebaseEmulator()).toBe(false);

    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR = 'TRUE';
    expect(isFirebaseEmulator()).toBe(false);

    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR = 'yes';
    expect(isFirebaseEmulator()).toBe(false);
  });
});
