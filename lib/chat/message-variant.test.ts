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

  // ========================================================================
  // Sprint 11 Phase D — image variant
  // ========================================================================

  it('returns image variant when imageUrl present and content empty', () => {
    const v = resolveMessageVariant(
      msgOf({
        content: '',
        imageUrl: 'https://cdn-staging.kkaebizigi.com/chat/u1/20260518/abc.webp',
      }),
    );
    expect(v.type).toBe('image');
    if (v.type === 'image') {
      expect(v.imageUrl).toBe('https://cdn-staging.kkaebizigi.com/chat/u1/20260518/abc.webp');
      expect(v.content).toBeUndefined();
    }
  });

  it('returns image variant with content when both present', () => {
    const v = resolveMessageVariant(
      msgOf({
        content: '여기 스샷',
        imageUrl: 'https://cdn.kkaebizigi.com/chat/u1/20260518/x.webp',
      }),
    );
    expect(v.type).toBe('image');
    if (v.type === 'image') {
      expect(v.content).toBe('여기 스샷');
      expect(v.imageUrl).toBe('https://cdn.kkaebizigi.com/chat/u1/20260518/x.webp');
    }
  });

  it('prioritizes image over link when both present', () => {
    const v = resolveMessageVariant(
      msgOf({
        content: 'see https://example.com',
        imageUrl: 'https://cdn.kkaebizigi.com/chat/u1/20260518/x.webp',
        linkPreview: {
          url: 'https://example.com',
          title: 'Example',
          domain: 'example.com',
        },
      }),
    );
    expect(v.type).toBe('image');
  });

  it('prioritizes deleted/operator over image (image ignored when deleted)', () => {
    const v = resolveMessageVariant(
      msgOf({
        deletedByOperator: true,
        imageUrl: 'https://cdn.kkaebizigi.com/chat/u1/20260518/x.webp',
      }),
    );
    expect(v).toEqual({ type: 'deleted', reason: 'operator' });
  });

  it('prioritizes deleted/hidden over image', () => {
    const v = resolveMessageVariant(
      msgOf({
        hidden: true,
        imageUrl: 'https://cdn.kkaebizigi.com/chat/u1/20260518/x.webp',
      }),
    );
    expect(v).toEqual({ type: 'deleted', reason: 'hidden' });
  });

  it('returns image variant when hidden but keptByOperator', () => {
    const v = resolveMessageVariant(
      msgOf({
        hidden: true,
        keptByOperator: true,
        imageUrl: 'https://cdn-staging.kkaebizigi.com/chat/u1/20260518/x.webp',
      }),
    );
    expect(v.type).toBe('image');
  });

  it('treats empty-string imageUrl as no image (falls back to text/link)', () => {
    const v = resolveMessageVariant(msgOf({ content: 'hi', imageUrl: '' }));
    expect(v).toEqual({ type: 'text', content: 'hi' });
  });
});
