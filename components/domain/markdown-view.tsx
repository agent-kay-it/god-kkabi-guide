/**
 * <MarkdownView> — sanitize된 HTML + custom embed/preview React 컴포넌트를 안전하게 렌더링.
 * 출처: docs/sprint/04-sprint-v1/design.md §4 (Markdown Lite Renderer)
 *      + docs/sprint/10-sprint-launch/design.md §6 (Posts Enrichment)
 *
 * 보안 critical:
 *  - safeHtml prop은 반드시 `lib/post/markdown.ts:renderMarkdownToSafeHtml`로 사전 처리된 값
 *  - rehype-sanitize 화이트리스트 통과 + youtube-embed/link-preview placeholder는 SAFE_SCHEMA에서 videoId/url 속성만 허용
 *  - 사용자 입력을 그대로 dangerouslySetInnerHTML에 넣지 말 것
 *
 * 동작:
 *  - segmentMarkdownHtml로 placeholder 태그 위치 분리
 *  - 일반 HTML segment → dangerouslySetInnerHTML (사전 sanitize된 값)
 *  - youtube-embed → <YoutubeEmbed videoId>
 *  - link-preview → <LinkPreview url> (async Server Component — OG fetch + SSRF 방어)
 *
 * 본 컴포넌트는 async Server Component. LinkPreview의 OG fetch가 SSR 시점에 해소된다.
 */
import { cn } from '@/lib/utils';
import { segmentMarkdownHtml } from '@/lib/post/markdown-render';
import { YoutubeEmbed } from '@/components/feature/post/youtube-embed';
import { LinkPreview } from '@/components/feature/post/link-preview';

export interface MarkdownViewProps {
  /** lib/post/markdown.ts:renderMarkdownToSafeHtml 결과 */
  readonly safeHtml: string;
  readonly className?: string;
}

const PROSE_CLASSES = [
  'prose prose-invert max-w-none text-text',
  // editorial 톤
  'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-text',
  'prose-h2:mt-8 prose-h2:text-xl sm:prose-h2:text-2xl',
  'prose-h3:mt-6 prose-h3:text-lg sm:prose-h3:text-xl',
  // 본문
  'prose-p:my-3 prose-p:leading-relaxed prose-p:text-text-soft',
  // 강조
  'prose-strong:text-text prose-em:text-bronze-soft',
  // 인용
  'prose-blockquote:border-l-bronze prose-blockquote:bg-ink-elev/40 prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-text-soft',
  // 코드
  'prose-code:rounded prose-code:bg-ink-elev prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.875em] prose-code:text-bronze-soft',
  'prose-pre:rounded-md prose-pre:border prose-pre:border-ink-line prose-pre:bg-ink-elev',
  // 리스트
  'prose-li:marker:text-bronze',
  // 링크
  'prose-a:text-bronze-soft prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-bronze',
  // 이미지
  'prose-img:rounded-md prose-img:border prose-img:border-ink-line',
  // 구분선
  'prose-hr:border-ink-line',
];

export async function MarkdownView({
  safeHtml,
  className,
}: MarkdownViewProps): Promise<React.JSX.Element> {
  const segments = segmentMarkdownHtml(safeHtml);

  // 단일 segment(=HTML only)일 때 기존 동작 유지 — 성능 최적화 + 기존 SSR 출력 동일
  if (segments.length === 1 && segments[0]?.type === 'html') {
    return (
      <article
        // 사전 sanitize된 HTML — XSS-safe (rehype-sanitize 화이트리스트 통과).
        dangerouslySetInnerHTML={{ __html: segments[0].html }}
        className={cn(...PROSE_CLASSES, className)}
      />
    );
  }

  return (
    <article className={cn(...PROSE_CLASSES, className)}>
      {segments.map((segment, idx) => {
        if (segment.type === 'html') {
          return (
            <div
              key={`md-html-${idx}`}
              // 사전 sanitize된 HTML segment — XSS-safe.
              dangerouslySetInnerHTML={{ __html: segment.html }}
            />
          );
        }
        if (segment.type === 'youtube') {
          return (
            <YoutubeEmbed
              key={`md-yt-${idx}-${segment.videoId}`}
              videoId={segment.videoId}
            />
          );
        }
        // segment.type === 'link-preview' — async Server Component
        return (
          <LinkPreview
            key={`md-lp-${idx}-${segment.url}`}
            url={segment.url}
          />
        );
      })}
    </article>
  );
}
