/**
 * <UrlPreviewInline> — 작성 폼 본문에서 단독 URL 줄을 감지 → debounced OG 카드 미리보기.
 * 출처: docs/sprint/10-sprint-launch/design.md §6 (Posts Enrichment — Form UX)
 *
 * 동작:
 *  - 본문 텍스트(value)에서 "한 줄 = URL" 패턴을 정규식으로 추출 (최대 3개)
 *  - 1초 debounce — 사용자가 입력 중일 때 매번 fetch하지 않음
 *  - YouTube URL은 inline preview에서 제외 (단순 표시) — 실제 임베드는 게시 후
 *  - 비-YouTube URL은 /api/og-preview 호출 → OG 카드 (이미지/제목/설명)
 *
 * 보안:
 *  - 본 컴포넌트는 미리보기 전용 — 실제 fetch는 server route handler (OG-preview API)에서 수행
 *  - URL은 client → server로 전달되나, server에서 SSRF 검증 (lib/post/ssrf-guard) 적용
 *
 * 본 컴포넌트는 Client Component ('use client').
 */
'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Youtube, Loader2 } from 'lucide-react';

import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { extractYoutubeId } from '@/lib/post/rehype-youtube-embed';
import { cn } from '@/lib/utils';

export interface UrlPreviewInlineProps {
  /** 본문 markdown 텍스트 (전체) */
  readonly body: string;
  readonly className?: string;
}

interface OgPreviewClient {
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly image?: string;
  readonly domain: string;
}

type PreviewState =
  | { type: 'youtube'; url: string; videoId: string }
  | { type: 'og-loading'; url: string }
  | { type: 'og-error'; url: string }
  | { type: 'og-ready'; url: string; data: OgPreviewClient };

const STANDALONE_URL_LINE_REGEX = /^[\t ]*(https:\/\/\S+)[\t ]*$/gm;
const MAX_PREVIEWS = 3;

function extractStandaloneUrls(body: string): string[] {
  const urls: string[] = [];
  let match: RegExpExecArray | null;
  STANDALONE_URL_LINE_REGEX.lastIndex = 0;
  while ((match = STANDALONE_URL_LINE_REGEX.exec(body)) !== null) {
    const url = match[1];
    if (!url) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') continue;
      if (urls.includes(url)) continue;
      urls.push(url);
      if (urls.length >= MAX_PREVIEWS) break;
    } catch {
      // invalid URL — skip
    }
  }
  return urls;
}

export function UrlPreviewInline({ body, className }: UrlPreviewInlineProps): React.JSX.Element | null {
  const debouncedBody = useDebouncedValue(body, 1000);
  const urls = extractStandaloneUrls(debouncedBody);
  const [previews, setPreviews] = useState<Map<string, PreviewState>>(new Map());

  // 신규 URL만 server fetch — previews는 비동기 콜백에서만 setState (effect body 동기 setState 회피).
  // - urls 빈 배열 → render-time에 null 반환 (state reset 불필요)
  // - 등록되지 않은 URL → render-time에 PreviewSkeleton (state 'og-loading' 사전 등록 불필요)
  // - YouTube ID 추출 후 즉시 'youtube' state 등록은 fetch와 무관하므로 마이크로태스크로 지연
  useEffect(() => {
    if (urls.length === 0) return;
    let cancelled = false;
    const targetUrls = urls.filter((u) => !previews.has(u));
    if (targetUrls.length === 0) return;

    // YouTube URL은 비동기 fetch가 불필요하지만, 일관성을 위해 마이크로태스크에서 setState.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setPreviews((prev) => {
        const next = new Map(prev);
        for (const u of targetUrls) {
          if (next.has(u)) continue;
          const ytId = extractYoutubeId(u);
          if (ytId) next.set(u, { type: 'youtube', url: u, videoId: ytId });
        }
        return next;
      });
    });

    // 비-YouTube URL만 server fetch — 결과만 setState
    const ogTargets = targetUrls.filter((u) => !extractYoutubeId(u));
    void Promise.all(
      ogTargets.map(async (url) => {
        try {
          const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) {
            if (!cancelled) {
              setPreviews((prev) => {
                const next = new Map(prev);
                next.set(url, { type: 'og-error', url });
                return next;
              });
            }
            return;
          }
          const data = (await res.json()) as OgPreviewClient | { error: string };
          if (cancelled) return;
          if ('error' in data) {
            setPreviews((prev) => {
              const next = new Map(prev);
              next.set(url, { type: 'og-error', url });
              return next;
            });
            return;
          }
          setPreviews((prev) => {
            const next = new Map(prev);
            next.set(url, { type: 'og-ready', url, data });
            return next;
          });
        } catch {
          if (!cancelled) {
            setPreviews((prev) => {
              const next = new Map(prev);
              next.set(url, { type: 'og-error', url });
              return next;
            });
          }
        }
      }),
    );
    return () => {
      cancelled = true;
    };
    // previews는 의도적으로 dep 제외 (set 호출 → 재실행 무한 루프 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join('|')]);

  if (urls.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)} aria-label="URL 미리보기">
      <p className="text-xs text-text-mute">URL 미리보기 ({urls.length})</p>
      <div className="space-y-2">
        {urls.map((url) => {
          const state = previews.get(url);
          if (!state) {
            return (
              <PreviewSkeleton key={url} url={url} />
            );
          }
          if (state.type === 'youtube') {
            return <YoutubePreviewCard key={url} url={url} videoId={state.videoId} />;
          }
          if (state.type === 'og-loading') {
            return <PreviewSkeleton key={url} url={url} />;
          }
          if (state.type === 'og-error') {
            return <PreviewError key={url} url={url} />;
          }
          return <OgPreviewCard key={url} data={state.data} />;
        })}
      </div>
    </div>
  );
}

function PreviewSkeleton({ url }: { url: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-ink-line bg-ink-card-strong p-3 text-sm text-text-mute">
      <Loader2 className="h-4 w-4 animate-spin text-text-soft" aria-hidden="true" />
      <span className="truncate">{url}</span>
    </div>
  );
}

function PreviewError({ url }: { url: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-ink-line bg-ink-card-strong p-3 text-sm text-text-mute">
      <ExternalLink className="h-4 w-4 text-text-mute" aria-hidden="true" />
      <span className="truncate">{url}</span>
      <span className="ml-auto flex-shrink-0 text-xs text-vermilion-soft">미리보기 불가</span>
    </div>
  );
}

function YoutubePreviewCard({ url, videoId }: { url: string; videoId: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-ink-line bg-ink-card-strong p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- 외부 i.ytimg.com 도메인 임시 미리보기 */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-16 w-28 flex-shrink-0 rounded-md border border-ink-line bg-ink-elev object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-xs text-vermilion-soft">
          <Youtube className="h-3 w-3" aria-hidden="true" />
          <span>YouTube 임베드</span>
        </p>
        <p className="mt-0.5 truncate text-sm text-text-soft">{url}</p>
      </div>
    </div>
  );
}

function OgPreviewCard({ data }: { data: OgPreviewClient }): React.JSX.Element {
  return (
    <div className="flex gap-3 rounded-[var(--radius-card)] border border-ink-line bg-ink-card-strong p-3">
      {data.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- 임의 외부 OG 이미지
        <img
          src={data.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-16 w-16 flex-shrink-0 rounded-md border border-ink-line bg-ink-elev object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border border-ink-line bg-ink-elev text-text-mute"
        >
          <ExternalLink className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-text-mute">{data.domain}</p>
        <p className="line-clamp-1 text-sm font-semibold text-text">{data.title}</p>
        {data.description ? (
          <p className="line-clamp-1 text-xs text-text-soft">{data.description}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Export internal regex helper for unit testing (see url-preview-inline.test.ts). */
export const __internal = { extractStandaloneUrls };
