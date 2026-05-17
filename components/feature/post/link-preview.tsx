/**
 * <LinkPreview> — Server Component. OG fetch + 카드 렌더.
 * 출처: docs/sprint/10-sprint-launch/design.md §6.5
 *
 * 동작:
 *  - Server에서 fetchOgPreview(url) 호출 (SSRF 방어 포함)
 *  - 성공 시 카드 (이미지 + 도메인 + 제목 + 설명)
 *  - 실패 시 plain external link fallback
 *
 * 디자인 토큰:
 *  - rounded-[var(--radius-card)], border-ink-line, bg-ink-card-strong, text-text-soft, text-text-mute
 *  - hover: bg-ink-card-strong → bg-ink-elev/80
 *
 * 모바일/데스크톱: 동일 — flex row, 이미지 96px (sm:128px). 콘텐츠 영역 truncate.
 */
import { ExternalLink } from 'lucide-react';

import { fetchOgPreview } from '@/lib/post/og-preview';
import { cn } from '@/lib/utils';

export interface LinkPreviewProps {
  readonly url: string;
  readonly className?: string;
}

export async function LinkPreview({ url, className }: LinkPreviewProps): Promise<React.JSX.Element> {
  const preview = await fetchOgPreview(url);

  if (!preview) {
    // OG 실패 — 단순 외부 링크 표시 (Server Component이므로 그대로 렌더)
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={cn(
          'my-4 inline-flex items-center gap-1.5 text-bronze-soft underline underline-offset-2 hover:text-bronze',
          className,
        )}
      >
        <span className="break-all">{url}</span>
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn(
        'my-4 flex w-full gap-3 overflow-hidden rounded-[var(--radius-card)] border border-ink-line bg-ink-card-strong p-3 no-underline transition hover:border-bronze/40 hover:bg-ink-elev/80 sm:gap-4 sm:p-4',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze',
        className,
      )}
      aria-label={`외부 링크: ${preview.title} (${preview.domain})`}
    >
      {preview.image ? (
        // 외부 이미지 — next/image 도메인 등록 불가능 (사용자가 임의 URL 입력).
        // facade 패턴 + 작은 사이즈로 비용 최소화.
        // eslint-disable-next-line @next/next/no-img-element -- 임의 외부 OG 이미지는 next/image 사용 불가 (도메인 화이트리스트 운용 불가)
        <img
          src={preview.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-20 w-20 flex-shrink-0 rounded-md border border-ink-line bg-ink-elev object-cover sm:h-28 sm:w-28"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border border-ink-line bg-ink-elev text-text-mute sm:h-28 sm:w-28"
        >
          <ExternalLink className="h-6 w-6" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-xs text-text-mute">
          <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{preview.domain}</span>
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-base font-semibold text-text">{preview.title}</h3>
        {preview.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-text-soft">{preview.description}</p>
        ) : null}
      </div>
    </a>
  );
}
