/**
 * <YoutubeEmbed> — Facade 패턴 YouTube 임베드.
 * 출처: docs/sprint/10-sprint-launch/design.md §6.4
 *
 * 동작:
 *  - 초기 렌더: 썸네일 이미지 + 재생 버튼 오버레이 (lazy, iframe 로드 안 함 — CWV 보호)
 *  - 클릭 시 youtube-nocookie.com iframe으로 교체 (autoplay=1)
 *
 * 디자인 토큰:
 *  - aspect-video, rounded-[var(--radius-card)], bg-ink-elev, border-ink-line
 *
 * 접근성:
 *  - 버튼에 aria-label
 *  - focus-visible ring (디자인 시스템 토큰)
 */
'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface YoutubeEmbedProps {
  readonly videoId: string;
  readonly className?: string;
}

export function YoutubeEmbed({ videoId, className }: YoutubeEmbedProps): React.JSX.Element {
  const [activated, setActivated] = useState<boolean>(false);
  // YouTube 썸네일: maxresdefault 실패 시 hqdefault fallback (img onError)
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      className={cn(
        'relative my-4 aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-ink-line bg-ink-elev',
        className,
      )}
    >
      {activated ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube 영상 플레이어"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActivated(true)}
          aria-label={`YouTube 영상 재생 (videoId: ${videoId})`}
          className="group relative h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 외부 i.ytimg.com 도메인은 next.config images에 등록되지 않음 + facade 패턴에서는 img가 더 가벼움 */}
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== fallbackThumbnail) img.src = fallbackThumbnail;
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-ink-base/40 transition group-hover:bg-ink-base/55"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-vermilion/90 text-text shadow-lg transition group-hover:bg-vermilion sm:h-20 sm:w-20">
              <Play className="h-8 w-8 fill-current sm:h-10 sm:w-10" />
            </span>
          </span>
          <span className="sr-only">YouTube 영상 — 클릭하여 재생</span>
        </button>
      )}
    </div>
  );
}
