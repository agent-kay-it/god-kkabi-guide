/**
 * <ImageLightbox> — 채팅 이미지 클릭 시 전체화면 확대.
 * 출처: docs/sprint/11-sprint-images/design.md §6.6
 *
 * 동작:
 *  - max-w-[95vw] / max-h-[90vh] — 뷰포트 거의 전체 사용
 *  - 모바일 native pinch-zoom 허용 (touch-action 제한 없음)
 *  - ESC + 우상단 X 버튼 + 오버레이 클릭으로 닫기 (Radix 기본 동작)
 *  - object-contain — aspect ratio 유지
 *
 * 보안:
 *  - imageUrl은 RTDB rules 정규식에서 1차 검증되므로 도메인은 cdn(-staging)?.kkaebizigi.com 또는
 *    Firebase Storage(레거시 잔여). 외부 URL은 RTDB write 단계에서 거부됨.
 *
 * 접근성:
 *  - Dialog.Title sr-only — Radix 요구사항
 *  - alt 텍스트는 호출자가 제공 (예: `${authorNickname}님이 보낸 이미지`)
 */
'use client';

import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ImageLightboxProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly imageUrl: string | null;
  readonly alt: string;
}

export function ImageLightbox({
  open,
  onOpenChange,
  imageUrl,
  alt,
}: ImageLightboxProps): React.JSX.Element | null {
  // imageUrl이 null이면 Dialog를 렌더링하지 않음 — open=true 호출 자체를 방어
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/85 backdrop-blur-sm" />
        <DialogContent
          className={cn(
            'max-h-[90vh] max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[95vw]',
            'flex items-center justify-center',
          )}
          showCloseButton
        >
          <DialogTitle className="sr-only">이미지 크게 보기</DialogTitle>
          <Image
            src={imageUrl}
            alt={alt}
            width={1920}
            height={1080}
            sizes="95vw"
            unoptimized
            className="h-auto max-h-[90vh] w-auto max-w-[95vw] object-contain"
            priority
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
