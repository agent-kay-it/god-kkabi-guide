/**
 * <PostImage> — 게시글 본문 인라인 이미지 렌더러.
 * 출처: Sprint 11 Phase E — markdown 본문 img → next/image 변환 (LCP 최적화)
 *
 * 책임:
 *  - CDN URL 이미지를 next/image로 렌더 (자동 srcset + WebP/AVIF + lazy loading)
 *  - 첫 이미지(`priority=true`)는 eager fetchPriority='high' — LCP candidate
 *  - 나머지는 default lazy + below-the-fold 최적화
 *
 * 폭은 본문 영역(max-w-3xl ≈ 768px) 기준으로 sizes 힌트 — Vercel image optimizer가
 * srcset에서 적절한 너비 선택.
 *
 * 보안: src는 markdown-render.ts:segmentMarkdownHtml의 image segment에서만 들어오므로
 * 이미 화이트리스트(cdn(-staging)?.kkaebizigi.com) 통과한 안전한 URL.
 */
import Image from 'next/image';

import { cn } from '@/lib/utils';

export interface PostImageProps {
  readonly src: string;
  readonly alt: string;
  /**
   * LCP candidate (본문 첫 이미지)에만 true.
   * Next.js가 fetchPriority='high' + preload hint 자동 적용.
   */
  readonly priority?: boolean;
  readonly className?: string;
}

export function PostImage({
  src,
  alt,
  priority = false,
  className,
}: PostImageProps): React.JSX.Element {
  return (
    <span className={cn('my-4 block', className)}>
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1200}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 768px"
        className="h-auto w-full rounded-md border border-ink-line"
        priority={priority}
      />
    </span>
  );
}
