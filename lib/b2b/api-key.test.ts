/**
 * lib/b2b/api-key.ts — Sprint 26 F26-C 단위 테스트 (pure crypto helpers).
 */
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  generateApiKey,
  hashApiKey,
  maskApiKey,
  parseAuthorizationHeader,
  timingSafeHashEqual,
} from './api-key';

describe('generateApiKey', () => {
  it('gkg_ prefix + 32 hex chars', () => {
    const k = generateApiKey();
    expect(k.startsWith('gkg_')).toBe(true);
    expect(k.length).toBeGreaterThanOrEqual(36); // gkg_ + 32 hex
    expect(/^gkg_[0-9a-f]+$/i.test(k)).toBe(true);
  });

  it('두 번 생성 시 다른 값 (random)', () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a).not.toBe(b);
  });
});

describe('hashApiKey', () => {
  it('sha256 hex 64 chars', () => {
    const h = hashApiKey('test_key');
    expect(h.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(h)).toBe(true);
  });

  it('같은 입력 → 같은 hash (deterministic)', () => {
    expect(hashApiKey('x')).toBe(hashApiKey('x'));
  });

  it('다른 입력 → 다른 hash', () => {
    expect(hashApiKey('x')).not.toBe(hashApiKey('y'));
  });
});

describe('maskApiKey', () => {
  it('gkg_ 시작 → prefix + 4자 + ...', () => {
    expect(maskApiKey('gkg_abcdef12345678')).toBe('gkg_abcd...');
  });

  it('gkg_ 가 아니면 ****', () => {
    expect(maskApiKey('other_key')).toBe('****');
  });

  it('빈 문자열도 안전', () => {
    expect(maskApiKey('')).toBe('****');
  });
});

describe('parseAuthorizationHeader', () => {
  it('null → null', () => {
    expect(parseAuthorizationHeader(null)).toBeNull();
  });

  it('Bearer <token> → token 만', () => {
    expect(parseAuthorizationHeader('Bearer gkg_abc')).toBe('gkg_abc');
  });

  it('bearer (lowercase) 도 인식', () => {
    expect(parseAuthorizationHeader('bearer gkg_abc')).toBe('gkg_abc');
  });

  it('X-API-Key 직접 전달 — plaintext 그대로', () => {
    expect(parseAuthorizationHeader('gkg_abc')).toBe('gkg_abc');
  });

  it('whitespace 정리', () => {
    expect(parseAuthorizationHeader('  gkg_abc  ')).toBe('gkg_abc');
    expect(parseAuthorizationHeader('Bearer   gkg_abc')).toBe('gkg_abc');
  });
});

describe('timingSafeHashEqual', () => {
  it('같은 hash → true', () => {
    expect(timingSafeHashEqual('aaaa', 'aaaa')).toBe(true);
  });

  it('다른 hash → false', () => {
    expect(timingSafeHashEqual('aaaa', 'bbbb')).toBe(false);
  });

  it('길이 다름 → false (timing-safe 진입 차단)', () => {
    expect(timingSafeHashEqual('aaa', 'aaaa')).toBe(false);
  });

  it('빈 문자열 vs 빈 문자열 → true', () => {
    expect(timingSafeHashEqual('', '')).toBe(true);
  });
});

describe('round-trip — generate → hash → compare', () => {
  it('생성된 key 의 hash 가 동일하게 비교됨', () => {
    const plain = generateApiKey();
    const h1 = hashApiKey(plain);
    const h2 = hashApiKey(plain);
    expect(timingSafeHashEqual(h1, h2)).toBe(true);
  });

  it('다른 key 의 hash 는 비교 실패', () => {
    const a = hashApiKey(generateApiKey());
    const b = hashApiKey(generateApiKey());
    expect(timingSafeHashEqual(a, b)).toBe(false);
  });
});
