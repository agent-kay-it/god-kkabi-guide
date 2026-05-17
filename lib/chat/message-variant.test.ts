/**
 * vitest — resolveMessageVariant tests.
 */
import { describe, it, expect } from 'vitest';

import { resolveMessageVariant } from './message-variant';
import type { ChatMessage } from '@/types/chat';

function msgOf(over: Partial<ChatMessage> & Record<string, unknown> = {}): ChatMessage {
  return {
    id: 'm1',
    channelId: 'global',
    authorUid: 'u1',
    authorNickname: 'tester',
    content: 'hello',
    createdAt: 1_700_000_000_000,
    ...over,
  } as ChatMessage;
}

describe('resolveMessageVariant', () => {
  it('returns deleted/operator when deletedByOperator', () => {
    expect(resolveMessageVariant(msgOf({ deletedByOperator: true }))).toEqual({
      type: 'deleted',
      reason: 'operator',
    });
  });

  it('returns deleted/hidden when hidden and not kept', () => {
    expect(resolveMessageVariant(msgOf({ hidden: true }))).toEqual({
      type: 'deleted',
      reason: 'hidden',
    });
  });

  it('returns text when hidden but keptByOperator', () => {
    expect(
      resolveMessageVariant(msgOf({ hidden: true, keptByOperator: true })),
    ).toEqual({ type: 'text', content: 'hello' });
  });

  it('returns link variant when linkPreview is well-formed', () => {
    const v = resolveMessageVariant(
      msgOf({
        content: 'check this https://example.com',
        linkPreview: {
          url: 'https://example.com',
          title: 'Example',
          domain: 'example.com',
          description: 'desc',
          image: 'https://cdn.example.com/x.jpg',
        },
      }),
    );
    expect(v.type).toBe('link');
    if (v.type === 'link') {
      expect(v.linkPreview.url).toBe('https://example.com');
      expect(v.linkPreview.title).toBe('Example');
      expect(v.linkPreview.description).toBe('desc');
      expect(v.linkPreview.image).toBe('https://cdn.example.com/x.jpg');
    }
  });

  it('falls back to text when linkPreview is malformed', () => {
    expect(
      resolveMessageVariant(
        msgOf({ linkPreview: { url: 'http://insecure.com', title: 't', domain: 'd' } }),
      ),
    ).toEqual({ type: 'text', content: 'hello' });
  });

  it('returns text by default', () => {
    expect(resolveMessageVariant(msgOf())).toEqual({ type: 'text', content: 'hello' });
  });

  it('rejects linkPreview with non-https image', () => {
    const v = resolveMessageVariant(
      msgOf({
        linkPreview: {
          url: 'https://example.com',
          title: 'X',
          domain: 'example.com',
          image: 'http://insecure-img.com/a.jpg',
        },
      }),
    );
    if (v.type === 'link') {
      expect(v.linkPreview.image).toBeUndefined();
    }
  });
});
