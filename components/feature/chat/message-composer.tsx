/**
 * <MessageComposer> — 채팅 메시지 입력 (text + 이미지 + URL 자동 미리보기).
 * 출처: docs/sprint/10-sprint-launch/design.md §7.1 + Phase D url-preview-inline 패턴 재사용
 *      + docs/sprint/11-sprint-images/design.md §6.1~6.4 (Sprint 11 이미지 첨부)
 *
 * 정책:
 *  - 500자 limit (Zod 없이 inline 검증 — UI 즉시성 우선, server-side는 send-message.ts)
 *  - Enter = 전송 / Shift+Enter = 줄바꿈
 *  - URL 감지: 본문에 단독 URL line 1개 포함되면 OG 사전 fetch → 전송 시 linkPreview 동봉
 *  - 마스킹: 클라이언트 즉시 (전송 전 사용자 경고)
 *  - rate limit: useChatRateLimit (클라이언트 가드) — 진정한 limit은 server-side
 *  - 이미지 첨부: Sprint 11 Phase D — S3 presigned URL + CloudFront CDN
 *    (lib/storage/upload-chat-image.ts, 압축 20% / presign 40% / PUT 100% 진행률)
 *  - 모바일 키보드 대응: 컨테이너 sticky bottom + safe-area-inset-bottom
 */
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { ImagePlus, Send, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { sendChatMessage } from '@/lib/chat/send-message';
import { uploadChatImage } from '@/lib/storage/upload-chat-image';
import { uploadErrorMessage } from '@/lib/storage/error-messages';
import { containsBadWord, maskBadWords } from '@/lib/chat/masking';
import { enforceChatRateLimit } from '@/lib/chat/rate-limit';
import { useChatRateLimit } from '@/hooks/use-chat-rate-limit';
import { logEvent } from '@/lib/firebase/analytics';
import { cn } from '@/lib/utils';
import type { LinkPreviewMeta } from '@/lib/chat/types';

const MAX_LENGTH = 500;

export interface MessageComposerProps {
  readonly channelId: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string;
  readonly author: {
    readonly uid: string;
    readonly nickname: string;
    readonly classId?: 'warrior' | 'swordsman' | 'medium';
    readonly role?: 'admin' | 'user';
  };
}

/** 본문 첫 번째 단독 URL line 추출 (Phase D url-preview-inline 패턴과 동일). */
function extractFirstStandaloneUrl(body: string): string | null {
  const re = /^[\t ]*(https:\/\/\S+)[\t ]*$/gm;
  const m = re.exec(body);
  if (!m || !m[1]) return null;
  try {
    const u = new URL(m[1]);
    if (u.protocol !== 'https:') return null;
    if (m[1].length > 2048) return null;
    return m[1];
  } catch {
    return null;
  }
}

interface OgPreviewClient {
  url: string;
  title: string;
  description?: string;
  image?: string;
  domain: string;
}

export function MessageComposer({
  channelId,
  disabled,
  disabledReason,
  author,
}: MessageComposerProps): React.JSX.Element {
  const [text, setText] = useState('');
  const [pendingLinkPreview, setPendingLinkPreview] = useState<LinkPreviewMeta | null>(null);
  const [previewFetching, setPreviewFetching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rateLimit = useChatRateLimit();

  async function handleImageAttach(file: File) {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadChatImage({
        file,
        channelId,
        onProgress: (pct) => setUploadProgress(pct),
      });
      if (result.ok) {
        setImageUrl(result.url);
        toast.success('이미지가 첨부되었습니다');
        void logEvent('chat_image_upload', {
          channel_kind: channelKindOf(channelId),
          compressed_size_kb: Math.round(file.size / 1024),
        });
      } else {
        toast.error(uploadErrorMessage(result.error));
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // 본문에서 첫 단독 URL 추출 → debounced OG fetch.
  // setState in effect 패턴 회피: 빈 URL/리셋은 마이크로태스크로 지연, fetch loading flag는 timeout 콜백 내부에서만.
  useEffect(() => {
    const url = extractFirstStandaloneUrl(text);
    if (!url) {
      void Promise.resolve().then(() => {
        setPendingLinkPreview(null);
        setPreviewFetching(false);
      });
      return;
    }
    // 이미 같은 URL이면 재fetch 안 함
    if (pendingLinkPreview && pendingLinkPreview.url === url) return;

    let cancelled = false;
    const handle = setTimeout(() => {
      if (cancelled) return;
      setPreviewFetching(true);
      void (async () => {
        try {
          const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          if (cancelled) return;
          if (!res.ok) {
            setPendingLinkPreview(null);
            setPreviewFetching(false);
            return;
          }
          const data = (await res.json()) as OgPreviewClient | { error: string };
          if (cancelled) return;
          if ('error' in data) {
            setPendingLinkPreview(null);
          } else {
            setPendingLinkPreview({
              url: data.url,
              title: data.title,
              domain: data.domain,
              ...(data.description ? { description: data.description } : {}),
              ...(data.image ? { image: data.image } : {}),
            });
          }
        } catch {
          if (!cancelled) setPendingLinkPreview(null);
        } finally {
          if (!cancelled) setPreviewFetching(false);
        }
      })();
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // pendingLinkPreview.url 변화는 새 URL을 감지했을 때만 — dep에 url 자체 사용
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // textarea auto-resize (1~6 lines)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [text]);

  function handleSend() {
    if (disabled) return;
    const trimmed = text.trim();
    if (!trimmed && !imageUrl) return;
    if (trimmed.length > MAX_LENGTH) {
      toast.error(`500자 이내로 입력하세요 (현재 ${trimmed.length}자)`);
      return;
    }
    const guard = rateLimit.checkNow();
    if (!guard.ok) {
      toast.error(guard.reason);
      return;
    }
    if (trimmed && containsBadWord(trimmed)) {
      toast.message('욕설이 감지되어 마스킹 후 전송됩니다.', {
        description: maskBadWords(trimmed),
      });
    }

    const payloadPreview = pendingLinkPreview;
    const payloadImageUrl = imageUrl;

    startTransition(async () => {
      // Server-side rate limit (Firestore counter) — RTDB push 직전 게이트.
      // Admin SDK 미설정 환경은 fail-open (개발/로컬), prod에서는 진정한 limit.
      const limit = await enforceChatRateLimit();
      if (!limit.ok) {
        if (limit.error === 'RATE_LIMIT_EXCEEDED') {
          const seconds = Math.ceil(limit.retryAfterMs / 1000);
          const scopeLabel = limit.scope === 'minute' ? '분당' : '시간당';
          toast.error(`${scopeLabel} 한도 초과 — ${seconds}초 후 다시 시도하세요.`);
        } else if (limit.error === 'BANNED') {
          toast.error('정지된 계정은 메시지를 보낼 수 없습니다.');
        } else if (limit.error === 'NOT_REGISTERED') {
          toast.error('등록 완료 후 채팅을 이용할 수 있습니다.');
        } else if (limit.error === 'UNAUTHENTICATED') {
          toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        } else {
          toast.error('일시적 오류 — 잠시 후 다시 시도하세요.');
        }
        return;
      }

      const result = await sendChatMessage({
        channelId,
        content: trimmed,
        ...(payloadImageUrl ? { imageUrl: payloadImageUrl } : {}),
        ...(payloadPreview ? { linkPreview: payloadPreview } : {}),
        author,
      });
      if (result.ok) {
        rateLimit.markSent();
        setText('');
        setPendingLinkPreview(null);
        setImageUrl(null);
        void logEvent('chat_send', {
          channel_kind: channelKindOf(channelId),
          has_image: Boolean(payloadImageUrl),
          masked_count: trimmed && containsBadWord(trimmed) ? 1 : 0,
          has_link_preview: payloadPreview ? 1 : 0,
        });
      } else {
        const msg =
          result.error === 'EMPTY'
            ? '메시지를 입력하세요'
            : result.error === 'TOO_LONG'
              ? '500자 이내로 입력하세요'
              : (result.message ?? '메시지 전송에 실패했습니다');
        toast.error(msg);
      }
    });
  }

  const remaining = MAX_LENGTH - text.length;
  const isDisabled = Boolean(disabled) || isPending;

  return (
    <div
      className={cn(
        'sticky bottom-0 border-t border-ink-line bg-ink-card-strong/95 backdrop-blur-md',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 px-3',
      )}
    >
      {pendingLinkPreview ? (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-ink-line bg-ink-elev/50 px-2 py-1.5 text-xs text-text-soft">
          <span className="text-text-mute">미리보기</span>
          <span className="truncate font-medium text-text">{pendingLinkPreview.title}</span>
          <span className="ml-auto truncate text-text-mute">{pendingLinkPreview.domain}</span>
          <button
            type="button"
            onClick={() => setPendingLinkPreview(null)}
            aria-label="미리보기 제거"
            className="text-text-mute hover:text-vermilion"
          >
            ×
          </button>
        </div>
      ) : previewFetching ? (
        <div className="mb-2 px-2 py-1.5 text-xs text-text-mute">미리보기 가져오는 중…</div>
      ) : null}

      {imageUrl ? (
        <div className="mb-2 inline-flex relative">
          <Image
            src={imageUrl}
            alt="첨부 이미지 미리보기"
            width={64}
            height={64}
            sizes="64px"
            className="h-16 w-auto rounded-md border border-ink-line object-cover"
          />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            aria-label="이미지 첨부 제거"
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-vermilion text-ink-base hover:bg-vermilion-soft"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : isUploading ? (
        <div
          className="mb-2 flex w-40 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-bronze bg-ink-elev px-2 py-1.5"
          role="status"
          aria-live="polite"
          aria-label={`이미지 업로드 진행 중 ${uploadProgress}%`}
        >
          <span className="text-[0.65rem] text-text-soft">업로드 중…</span>
          <div className="h-1 w-full overflow-hidden rounded-full bg-ink-card-strong">
            <div
              className="h-full bg-bronze transition-[width] duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="font-mono text-[0.65rem] tabular-nums text-text-mute">
            {uploadProgress}%
          </span>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleImageAttach(f);
        }}
        aria-label="이미지 첨부"
      />

      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled || isUploading || Boolean(imageUrl)}
          aria-label="이미지 첨부"
          className="shrink-0"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
        </Button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          maxLength={MAX_LENGTH}
          placeholder={
            disabled ? (disabledReason ?? '메시지를 보낼 수 없습니다') : '메시지 입력 (Enter 전송, Shift+Enter 줄바꿈)'
          }
          disabled={isDisabled}
          className={cn(
            'flex-1 resize-none rounded-md border border-ink-line bg-ink-elev px-3 py-2 text-sm text-text placeholder:text-text-mute',
            'focus:border-bronze focus:outline-none disabled:opacity-50',
          )}
          aria-label="채팅 메시지 입력"
        />
        <Button
          type="button"
          variant="bronze"
          size="icon-sm"
          onClick={handleSend}
          disabled={isDisabled || (!text.trim() && !imageUrl) || !rateLimit.canSend || isUploading}
          aria-label="메시지 전송"
          className="shrink-0"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-1 flex items-center justify-between px-1 text-[0.65rem] text-text-mute">
        <span className={rateLimit.hint ? 'text-vermilion-soft' : ''}>
          {rateLimit.hint ?? ''}
        </span>
        <span className={remaining < 50 ? 'text-vermilion-soft' : ''}>
          {text.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}

function channelKindOf(channelId: string): 'global' | 'server' | 'munpa' {
  if (channelId.startsWith('munpa-')) return 'munpa';
  if (channelId.startsWith('server-')) return 'server';
  return 'global';
}
