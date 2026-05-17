/**
 * <LinkPreviewInMessage> — 메시지 본문 내 OG 미리보기 카드 (compact).
 * 출처: docs/sprint/10-sprint-launch/design.md §7.2 (link variant)
 *
 * Phase D LinkPreview 패턴 재사용:
 *  - linkPreview meta는 메시지 전송 시점에 사전 fetch되어 RTDB에 동봉됨
 *    → 본 컴포넌트는 fetch 없이 props만 render (1초 단위 실시간 채팅에서
 *      매번 OG fetch는 비용 과다 + N+1 문제)
 *  - Server Component 의 link-preview.tsx 와 디자인 토큰 일치 — bg-ink-card-strong,
 *    border-ink-line, rounded-[var(--radius-card)]
 *  - 채팅 카드는 컴팩트 — 이미지 56px (Post용 96/128 보다 작게)
 *
 * 보안:
 *  - meta는 RTDB rules에서 화이트리스트 검증 (url https only, image https only)
 *  - 본 컴포넌트는 추가 검증 없이 표시 (도메인 라우터 화이트리스트는 RTDB 단)
 *  - eslint @next/next/no-img-element disable — 임의 외부 OG 이미지 (next/image 도메인 화이트리스트 불가)
 */
import { ExternalLink } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { LinkPreviewMeta } from '@/lib/chat/types';

export interface LinkPreviewInMessageProps {
  readonly meta: LinkPreviewMeta;
  readonly className?: string;
}

export function LinkPreviewInMessage({
  meta,
  className,
}: LinkPreviewInMessageProps): React.JSX.Element {
  return (
    <a
      href={meta.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={`외부 링크: ${meta.title} (${meta.domain})`}
      className={cn(
        'mt-2 flex max-w-md gap-2.5 overflow-hidden rounded-[var(--radius-card)] border border-ink-line bg-ink-elev/60 p-2 no-underline transition-colors',
        'hover:border-bronze/40 hover:bg-ink-elev',
        'focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-1',
        className,
      )}
    >
      {meta.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- 임의 외부 OG 이미지 (next/image 화이트리스트 불가)
        <img
          src={meta.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-14 w-14 flex-shrink-0 rounded-md border border-ink-line bg-ink-base object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md border border-ink-line bg-ink-base text-text-mute"
        >
          <ExternalLink className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0 flex-1 self-center">
        <p className="flex items-center gap-1 text-[0.65rem] text-text-mute">
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{meta.domain}</span>
        </p>
        <p className="line-clamp-1 text-xs font-semibold text-text">{meta.title}</p>
        {meta.description ? (
          <p className="line-clamp-1 text-[0.7rem] text-text-soft">{meta.description}</p>
        ) : null}
      </div>
    </a>
  );
}
