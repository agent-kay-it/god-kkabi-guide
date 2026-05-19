/**
 * Sprint 18 / F18-A — types/chat.ts unit test.
 *
 * channelId / channelLabel + REPORT_REASON_LABEL 검증.
 */
import { describe, it, expect } from 'vitest';
import { channelId, channelLabel, REPORT_REASON_LABEL } from './chat';

describe('channelId()', () => {
  it('global → global', () => {
    expect(channelId({ kind: 'global' })).toBe('global');
  });

  it('server:{serverId}', () => {
    expect(channelId({ kind: 'server', serverId: 'S785' })).toBe('server:S785');
  });

  it('munpa:{serverId}:{munpaName}', () => {
    expect(
      channelId({ kind: 'munpa', serverId: 'S785', munpaName: 'gokkaebi' }),
    ).toBe('munpa:S785:gokkaebi');
  });

  it('server kind 의 serverId undefined → undefined 포함', () => {
    // 정상 시나리오 아니지만 함수 동작 검증
    expect(channelId({ kind: 'server' })).toBe('server:undefined');
  });
});

describe('channelLabel()', () => {
  it('global → "전체"', () => {
    expect(channelLabel({ kind: 'global' })).toBe('전체');
  });

  it('server kind → "서버 {serverId}"', () => {
    expect(channelLabel({ kind: 'server', serverId: 'S785' })).toBe('서버 S785');
  });

  it('munpa kind → munpaName 포함', () => {
    const label = channelLabel({
      kind: 'munpa',
      serverId: 'S785',
      munpaName: '갓깨비문파',
    });
    expect(label).toContain('갓깨비문파');
  });
});

describe('REPORT_REASON_LABEL', () => {
  it('비어있지 않음', () => {
    expect(Object.keys(REPORT_REASON_LABEL).length).toBeGreaterThan(0);
  });

  it('모든 값이 string', () => {
    for (const value of Object.values(REPORT_REASON_LABEL)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
