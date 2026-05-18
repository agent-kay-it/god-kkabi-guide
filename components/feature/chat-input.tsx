/**
 * ChatInput — 채팅 메시지 입력 (텍스트 + 이미지 + 마스킹).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §6 + lib/chat/{send-message,masking}
 *      + docs/sprint/11-sprint-images/design.md §6 (Sprint 11: S3 + CloudFront 마이그레이션)
 *
 * - Enter = 전송 / Shift+Enter = 줄바꿈
 * - 이미지 첨부: Sprint 11 — S3 presigned URL + CloudFront CDN
 *   (lib/storage/upload-chat-image.ts, uid는 서버 session에서 추출)
 * - 진행률 콜백 (압축 20% / presign 40% / PUT 100%)
 * - 마스킹: 클라이언트 즉시 (전송 전 확인)
 */
'use client';

import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { ImagePlus, Send, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { sendChatMessage } from '@/lib/chat/send-message';
import { uploadChatImage } from '@/lib/storage/upload-chat-image';
import { uploadErrorMessage } from '@/lib/storage/error-messages';
import { containsBadWord, maskBadWords } from '@/lib/chat/masking';
import { logEvent } from '@/lib/firebase/analytics';
import { cn } from '@/lib/utils';

/** channelId → 채널 종류 (GA4 이벤트 파라미터용) */
function channelKindOf(channelId: string): 'global' | 'server' | 'munpa' {
  if (channelId.startsWith('munpa:')) return 'munpa';
  if (channelId.startsWith('server:')) return 'server';
  return 'global';
}

export interface ChatInputProps {
  readonly channelId: string;
  readonly disabled?: boolean;
  readonly author: {
    readonly uid: string;
    readonly nickname: string;
    readonly classId?: 'warrior' | 'swordsman' | 'medium';
    readonly role?: 'admin' | 'user';
  };
}

export function ChatInput({
  channelId,
  disabled,
  author,
}: ChatInputProps): React.JSX.Element {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
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

  function handleSubmit() {
    if (disabled) return;
    const trimmed = text.trim();
    if (!trimmed && !imageUrl) return;

    if (containsBadWord(trimmed)) {
      toast.message('욕설이 감지되어 마스킹 후 전송됩니다.', {
        description: maskBadWords(trimmed),
      });
    }

    const hasImage = Boolean(imageUrl);
    const hadBadWord = containsBadWord(trimmed);
    startTransition(async () => {
      const result = await sendChatMessage({
        channelId,
        content: trimmed,
        ...(imageUrl ? { imageUrl } : {}),
        author,
      });
      if (result.ok) {
        setText('');
        setImageUrl(null);
        void logEvent('chat_send', {
          channel_kind: channelKindOf(channelId),
          has_image: hasImage,
          masked_count: hadBadWord ? 1 : 0,
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

  return (
    <div className={cn('space-y-2 border-t border-ink-line bg-ink-card-strong p-3')}>
      {imageUrl ? (
        <div className="relative inline-block">
          <Image
            src={imageUrl}
            alt="첨부 이미지 미리보기"
            width={80}
            height={80}
            sizes="80px"
            className="h-20 w-auto rounded-md border border-ink-line object-cover"
          />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            aria-label="이미지 제거"
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-vermilion text-ink-base hover:bg-vermilion-soft"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : isUploading ? (
        <div
          className="flex h-20 w-32 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-bronze bg-ink-elev px-2"
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

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || disabled}
          aria-label="이미지 첨부"
          className="shrink-0"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          rows={1}
          maxLength={500}
          placeholder={disabled ? '로그인 후 등록을 완료해주세요' : '메시지 입력 (Enter 전송)'}
          disabled={disabled || isPending}
          className="flex-1 resize-none rounded-md border border-ink-line bg-ink-elev px-3 py-2 text-sm text-text placeholder:text-text-mute focus:border-bronze focus:outline-none disabled:opacity-50"
          aria-label="채팅 메시지 입력"
        />

        <Button
          type="button"
          variant="bronze"
          size="icon-sm"
          onClick={handleSubmit}
          disabled={disabled || isPending || (!text.trim() && !imageUrl)}
          aria-label="메시지 전송"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
