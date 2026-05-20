/**
 * app/sitemap.ts — Sprint 24 F24-A 단위 테스트.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/post/actions', () => ({
  listPosts: vi.fn(),
}));

import { listPosts } from '@/lib/post/actions';
import sitemap from './sitemap';

const mockedListPosts = vi.mocked(listPosts);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sitemap()', () => {
  it('정적 라우트 16+ 포함', async () => {
    mockedListPosts.mockResolvedValue({ items: [], nextCursor: null });
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThanOrEqual(16);
    // 홈 진입점 확인 (path '' → SITE_URL 그대로)
    expect(entries[0]?.url).toMatch(/kkaebizigi\.com$/);
    // 위키 진입점 확인
    expect(entries.find((e) => e.url.endsWith('/jinryeong'))).toBeDefined();
    expect(entries.find((e) => e.url.endsWith('/post'))).toBeDefined();
  });

  it('우선순위 분포 — 홈 1.0 / 위키 0.8-0.9', async () => {
    mockedListPosts.mockResolvedValue({ items: [], nextCursor: null });
    const entries = await sitemap();
    const home = entries.find((e) => e.url === 'https://kkaebizigi.com' || e.url === 'https://kkaebizigi.com/');
    expect(home?.priority).toBeGreaterThanOrEqual(1.0);
  });

  it('정적 라우트 모두 lastModified 포함', async () => {
    mockedListPosts.mockResolvedValue({ items: [], nextCursor: null });
    const entries = await sitemap();
    for (const e of entries) {
      expect(e.lastModified).toBeDefined();
    }
  });

  it('최근 게시물 동적 포함 (cursor pagination)', async () => {
    mockedListPosts
      .mockResolvedValueOnce({
        items: [
          {
            id: 'p1',
            authorUid: 'u1',
            authorNickname: 'k',
            category: 'build',
            title: 't',
            bodyExcerpt: 'e',
            tags: [],
            imageUrls: [],
            status: 'published',
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            reportedCount: 0,
            createdAtMs: 1700000000000,
            updatedAtMs: 1700000010000,
          },
        ],
        nextCursor: null,
      });
    const entries = await sitemap();
    expect(entries.find((e) => e.url.endsWith('/post/p1'))).toBeDefined();
  });

  it('listPosts throw → 정적 라우트만 반환 (graceful)', async () => {
    mockedListPosts.mockRejectedValue(new Error('boom'));
    const entries = await sitemap();
    // 정적 라우트는 여전히 포함
    expect(entries.length).toBeGreaterThanOrEqual(16);
    // 게시물 entry 는 없음
    expect(entries.find((e) => e.url.includes('/post/'))).toBeUndefined();
  });

  it('cursor 끝까지 따라감 (max 5 페이지)', async () => {
    let callCount = 0;
    mockedListPosts.mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        items: [],
        nextCursor: callCount < 10 ? 1700000000000 : null,
      });
    });
    await sitemap();
    expect(callCount).toBeLessThanOrEqual(5); // max 5 페이지 가드
  });
});
