/**
 * /post/[id] 동적 Open Graph 이미지 — Sprint 12 / F12-D-7.
 *
 * Next.js 16 metadata file-based OG. 본 page 의 post.title + bodyExcerpt 를 바탕으로
 * 1200×630 PNG 생성. 첫 이미지가 있으면 thumbnail 로 우측에 표시.
 *
 * Edge runtime 으로 렌더 (Vercel default for opengraph-image).
 */
import { ImageResponse } from 'next/og';

import { getPost } from '@/lib/post/actions';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '갓깨비 키우기 비공식 팬 가이드 — 게시물';

interface ImageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function PostOpenGraphImage({
  params,
}: ImageProps): Promise<ImageResponse> {
  const { id } = await params;
  const post = await getPost(id);
  const title = post?.title?.slice(0, 80) ?? '게시물';
  const excerpt = post?.bodyExcerpt?.slice(0, 160) ?? '';
  const category =
    post?.category === 'build'
      ? '빌드'
      : post?.category === 'guide'
        ? '공략'
        : post?.category === 'review'
          ? '후기'
          : '커뮤니티';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(200,153,104,0.18) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(126,182,168,0.10) 0%, transparent 50%), #07070b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: '#ece7dd',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 22,
            color: '#b8b1a4',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              background: 'rgba(200,153,104,0.18)',
              color: '#e8c79a',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {category}
          </span>
          <span>갓깨비 키우기 비공식 팬 가이드</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#ece7dd',
              display: 'flex',
            }}
          >
            {title}
          </div>
          {excerpt ? (
            <div
              style={{
                fontSize: 26,
                color: '#b8b1a4',
                lineHeight: 1.5,
                maxWidth: 1080,
                display: 'flex',
              }}
            >
              {excerpt}
            </div>
          ) : null}
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#7a7568',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>kkaebizigi.com</span>
          {post?.authorNickname ? <span>by {post.authorNickname}</span> : null}
        </div>
      </div>
    ),
    size,
  );
}
