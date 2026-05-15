/**
 * <MarkdownView> — sanitize된 HTML을 안전하게 렌더링.
 * 출처: docs/sprint/04-sprint-v1/design.md §4 (Markdown Lite Renderer)
 *
 * 보안 critical:
 *  - html prop은 반드시 `lib/post/markdown.ts:renderMarkdownToSafeHtml`로 사전 처리된 값
 *  - 사용자 입력을 그대로 dangerouslySetInnerHTML에 넣지 말 것
 *  - 본 컴포넌트는 Server Component에서 호출 (사전 sanitize 후 HTML 문자열 전달)
 */
import { cn } from '@/lib/utils';

export interface MarkdownViewProps {
  /** lib/post/markdown.ts:renderMarkdownToSafeHtml 결과 */
  readonly safeHtml: string;
  readonly className?: string;
}

export function MarkdownView({
  safeHtml,
  className,
}: MarkdownViewProps): React.JSX.Element {
  return (
    <article
      // safeHtml은 lib/post/markdown.ts:renderMarkdownToSafeHtml에서
      // rehype-sanitize 화이트리스트로 필터된 HTML — XSS-safe.
      // (react/no-danger 룰은 현재 eslint flat config에 미정의 — 보안 검증은 source에서 보장)
      dangerouslySetInnerHTML={{ __html: safeHtml }}
      className={cn(
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
        className,
      )}
    />
  );
}
