/**
 * Sprint 16 / F16-B — lib/utils (cn helper) unit test.
 */
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn() — clsx + tailwind-merge', () => {
  it('단일 string', () => {
    expect(cn('px-2 py-1')).toBe('px-2 py-1');
  });

  it('여러 string 병합', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('conditional object', () => {
    expect(cn('px-2', { 'py-1': true, 'py-4': false })).toBe('px-2 py-1');
  });

  it('Tailwind 충돌 해소 — 뒤쪽이 이김', () => {
    // px-2 vs px-4 → 뒤쪽 (px-4) 이 적용
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('충돌 없는 다른 utility 는 모두 보존', () => {
    expect(cn('px-2 py-1', 'text-red-500')).toBe('px-2 py-1 text-red-500');
  });

  it('null / undefined / false 무시', () => {
    expect(cn('px-2', null, undefined, false, 'py-1')).toBe('px-2 py-1');
  });

  it('빈 입력 → 빈 문자열', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('array 입력', () => {
    expect(cn(['px-2', 'py-1'])).toBe('px-2 py-1');
  });
});
