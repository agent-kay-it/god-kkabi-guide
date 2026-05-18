/**
 * <ProfileImageUploader> — 프로필 아바타 업로드 + 미리보기 + 제거.
 * 출처: Sprint 11 Phase E 사용자 추가 요구 (프로필 이미지 업로드)
 *
 * 책임:
 *  - 현재 아바타(customPhotoURL → photoURL → fallback)를 큰 썸네일로 표시
 *  - "사진 변경" 버튼으로 file picker 열기 → uploadProfileImage → updateProfilePhoto
 *  - 업로드 진행률 표시 (압축 20% / presign 40% / PUT 100%)
 *  - "기본 사진으로" 버튼으로 customPhotoURL 제거 → Google photoURL로 회귀
 *  - 성공 시 router.refresh() 호출하여 server-rendered 부분 갱신
 *
 * UX:
 *  - 모바일: capture="environment" (후면 카메라 우선)
 *  - 압축 후 maxWidthOrHeight=512 (avatar 적정 크기)
 *  - JPG/PNG/WebP/GIF 허용
 */
'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { uploadProfileImage } from '@/lib/storage/upload-profile-image';
import { uploadErrorMessage } from '@/lib/storage/error-messages';
import { updateProfilePhoto } from '@/lib/auth/update-profile-photo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export interface ProfileImageUploaderProps {
  readonly nickname: string;
  readonly customPhotoURL: string | null;
  readonly googlePhotoURL: string | null;
}

/** 현재 표시할 아바타 URL — customPhotoURL > googlePhotoURL > null(fallback). */
function resolveAvatarUrl(custom: string | null, google: string | null): string | null {
  if (custom) return custom;
  if (google) return google;
  return null;
}

export function ProfileImageUploader({
  nickname,
  customPhotoURL,
  googlePhotoURL,
}: ProfileImageUploaderProps): React.JSX.Element {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimisticCustom, setOptimisticCustom] = useState<string | null>(customPhotoURL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = resolveAvatarUrl(optimisticCustom, googlePhotoURL);
  const usingCustom = Boolean(optimisticCustom);

  async function handleFile(file: File) {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadProfileImage({
        file,
        onProgress: (pct) => setUploadProgress(pct),
      });
      if (!result.ok) {
        toast.error(uploadErrorMessage(result.error));
        return;
      }
      // Optimistic update + Server Action
      setOptimisticCustom(result.url);
      startTransition(async () => {
        const saveResult = await updateProfilePhoto({ photoUrl: result.url });
        if (saveResult.ok) {
          toast.success('프로필 사진이 변경되었습니다');
          router.refresh();
        } else {
          // 롤백
          setOptimisticCustom(customPhotoURL);
          toast.error(
            saveResult.error === 'VALIDATION_FAILED'
              ? (saveResult.message ?? 'URL 검증 실패')
              : '저장에 실패했습니다',
          );
        }
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleReset() {
    if (!usingCustom) return;
    const previous = optimisticCustom;
    setOptimisticCustom(null);
    startTransition(async () => {
      const result = await updateProfilePhoto({ photoUrl: null });
      if (result.ok) {
        toast.success('기본 사진으로 되돌렸습니다');
        router.refresh();
      } else {
        setOptimisticCustom(previous);
        toast.error('기본 사진 복원에 실패했습니다');
      }
    });
  }

  const initial = nickname.slice(0, 1) || '?';
  const disabled = isUploading || isPending;

  return (
    <GlassCard className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
      <div className="relative">
        <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={`${nickname}님의 프로필 사진`}
              width={112}
              height={112}
              sizes="(max-width: 640px) 96px, 112px"
              className="h-full w-full object-cover"
              priority
              unoptimized={!displayUrl.includes('kkaebizigi.com')}
            />
          ) : (
            <AvatarFallback className="bg-bronze/15 text-2xl text-bronze-soft">
              {initial}
            </AvatarFallback>
          )}
        </Avatar>
        {isUploading ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-ink-base/85 p-2"
            role="status"
            aria-live="polite"
            aria-label={`프로필 사진 업로드 ${uploadProgress}%`}
          >
            <span className="text-[0.65rem] text-text-soft">업로드 중…</span>
            <div className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-ink-card-strong">
              <div
                className="h-full bg-bronze transition-[width] duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="mt-0.5 font-mono text-[0.6rem] text-text-mute">{uploadProgress}%</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-base font-semibold text-text">프로필 사진</h3>
        <p className="text-xs text-text-mute">
          {usingCustom
            ? '직접 업로드한 사진을 사용 중입니다.'
            : googlePhotoURL
              ? 'Google 계정 사진을 사용 중입니다.'
              : '기본 아바타를 사용 중입니다.'}
        </p>
        <p className="text-xs text-text-mute">JPG / PNG / WebP / GIF · 최대 5MB · 자동 압축</p>

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
          aria-label="프로필 사진 추가"
        />

        <div className="mt-1 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={cn('gap-2')}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            사진 변경
          </Button>
          {usingCustom ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
              className="gap-2 text-text-mute hover:text-vermilion"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              기본 사진으로
            </Button>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
