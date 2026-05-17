/**
 * <PostForm> — 게시물 작성/수정 폼.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1 + plan.md §P3.C.3
 *      + docs/sprint/10-sprint-launch/design.md §6 (Posts Enrichment — Form UX, Task #22)
 *
 * 책임:
 *  - react-hook-form + zodResolver (PostInputSchema)
 *  - Markdown lite 입력 (Sprint 10: + 라이브 프리뷰 + URL 미리보기 + autosave)
 *  - 이미지 첨부 3개 (Sprint 11에서 AWS S3로 이전 예정 — Spark plan 제한)
 *  - 태그 5개 (사전 정의 화이트리스트)
 *  - 성공 시 router.push(`/post/${postId}`)
 *
 * Sprint 10 / Phase D 추가:
 *  - localStorage autosave (2s debounce, key = `post-draft-{userId}`, create 모드만)
 *  - 본문 옆 라이브 프리뷰 (md+ split-view, sm 이하 toggle)
 *  - 단독 URL 줄 감지 → 1s debounce → /api/og-preview → 인라인 미리보기 카드
 */
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';

import { createPost, updatePost } from '@/lib/post/actions';
import { uploadPostImage } from '@/lib/post/image-upload';
import { PostInputSchema } from '@/lib/post/schema';
import { logEvent } from '@/lib/firebase/analytics';
import {
  POST_LIMITS,
  POST_CATEGORY_LABEL,
  POST_CATEGORY_DESCRIPTION,
  type PostCategory,
  type PostInput,
} from '@/types/post';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Note } from '@/components/domain';
import { useAutosave } from '@/hooks/use-autosave';
import { LivePreview } from '@/components/feature/post/live-preview';
import { UrlPreviewInline } from '@/components/feature/post/url-preview-inline';

const CATEGORIES: readonly PostCategory[] = ['build', 'guide', 'review'];

export interface PostFormProps {
  readonly authorUid: string;
  readonly mode?: 'create' | 'edit';
  readonly initial?: PostInput;
  readonly postId?: string;
}

export function PostForm({
  authorUid,
  mode = 'create',
  initial,
  postId,
}: PostFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PostInput>({
    resolver: zodResolver(PostInputSchema),
    defaultValues: initial ?? {
      title: '',
      body: '',
      category: 'build',
      tags: [],
      imageUrls: [],
    },
  });

  /**
   * shadcn `FormField`는 `Control<TFieldValues>` 2-generic으로 정의되어
   * useForm의 3-generic 반환 (`Control<PostInput, any, TFieldValues>`)과 호환되지 않는다.
   * 호환성 명시 cast — 시맨틱 동일, 컴파일 오류 회피.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postControl = form.control as any;
  // V5 P3.A: form.watch → useWatch — React Compiler 메모이제이션 호환성 (react-hooks/incompatible-library).
  // useWatch는 subscription을 control 객체로 따로 등록하여 watch()의 비순수 클로저 문제를 회피.
  const imageUrls = useWatch({ control: form.control, name: 'imageUrls' }) ?? [];
  const bodyValue = useWatch({ control: form.control, name: 'body' }) ?? '';

  // Sprint 10 P-D Task #22 — autosave (create 모드만 활성화)
  const autosave = useAutosave(
    { title: form.getValues('title'), body: bodyValue, category: form.getValues('category'), tags: form.getValues('tags') },
    {
      key: 'post-draft',
      userId: authorUid,
      delayMs: 2000,
      enabled: mode === 'create',
    },
  );

  // 마운트 시 draft 복원 제안 — autosave.hasDraft가 true이고 현재 폼이 빈 상태면 1회 복원 시도
  // 게시 성공 시 clearDraft()로 정리.
  const restoredOnceRef = useRef<boolean>(false);
  useEffect(() => {
    if (mode !== 'create') return;
    if (restoredOnceRef.current) return;
    if (!autosave.hasDraft) return;
    const draft = autosave.loadDraft<{
      title: string;
      body: string;
      category: PostCategory;
      tags: string[];
    }>();
    if (!draft) return;
    const current = form.getValues();
    // 사용자가 이미 입력 시작했다면 덮어쓰지 않음
    if (current.title || current.body) return;
    form.reset({
      title: draft.title ?? '',
      body: draft.body ?? '',
      category: (draft.category ?? 'build') as PostCategory,
      tags: Array.isArray(draft.tags) ? draft.tags : [],
      imageUrls: [],
    });
    restoredOnceRef.current = true;
    toast.success('이전 작성 중인 글을 복원했습니다');
  }, [autosave, form, mode]);

  // 라이브 프리뷰 토글 (모바일 — sm 이하). md+ 에서는 항상 split-view.
  const [previewOpenOnMobile, setPreviewOpenOnMobile] = useState<boolean>(false);

  async function handleImageAdd(file: File) {
    const currentCount = imageUrls.length;
    if (currentCount >= POST_LIMITS.images.max) {
      toast.error(`이미지는 최대 ${POST_LIMITS.images.max}개까지`);
      return;
    }
    setUploadingIndex(currentCount);
    try {
      const result = await uploadPostImage({ file, uid: authorUid, index: currentCount });
      if (result.ok) {
        form.setValue('imageUrls', [...imageUrls, result.url], { shouldDirty: true });
        toast.success('이미지가 추가되었습니다');
      } else {
        const msg =
          result.error === 'UNSUPPORTED_TYPE'
            ? 'JPG/PNG/WebP만 허용됩니다'
            : result.error === 'TOO_LARGE_BEFORE_COMPRESS'
              ? '10MB 이하 이미지만 업로드 가능합니다'
              : result.error === 'COMPRESS_FAILED'
                ? '이미지 압축에 실패했습니다'
                : (result.message ?? '업로드 실패');
        toast.error(msg);
      }
    } finally {
      setUploadingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleImageRemove(url: string) {
    form.setValue(
      'imageUrls',
      imageUrls.filter((u) => u !== url),
      { shouldDirty: true },
    );
  }

  function onSubmit(values: PostInput) {
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createPost(values)
          : postId
            ? await updatePost(postId, values)
            : null;
      if (!result) return;

      if (result.ok) {
        if (mode === 'create') {
          toast.success('게시물이 작성되었습니다');
          // Sprint 10 P-D Task #22 — draft 정리
          autosave.clearDraft();
          void logEvent('post_create', {
            category: values.category,
            tags_count: values.tags.length,
            has_image: values.imageUrls.length > 0,
            body_length: values.body.length,
          });
          router.push(`/post/${result.postId ?? ''}`);
          router.refresh();
        } else {
          toast.success('수정이 반영되었습니다');
          router.push(`/post/${postId}`);
          router.refresh();
        }
        return;
      }

      // 에러 매핑
      if (result.error === 'VALIDATION_FAILED' && result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            form.setError(key as keyof PostInput, { type: 'server', message });
          }
        }
        return;
      }
      const errMsg =
        result.error === 'BANNED'
          ? '정지된 사용자는 작성할 수 없습니다'
          : result.error === 'NOT_REGISTERED'
            ? '등록 완료 후 이용 가능합니다'
            : result.error === 'EDIT_WINDOW_EXPIRED'
              ? '작성 24시간 후 수정은 운영자 승인이 필요합니다'
              : (result.message ?? '저장에 실패했습니다');
      toast.error(errMsg);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GlassCard className="space-y-5 p-6">
          {/* 카테고리 */}
          <FormField
            control={postControl}
            name="category"
            render={({ field }: { field: { value: PostCategory; onChange: (v: PostCategory) => void } }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-text">카테고리</FormLabel>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="게시물 카테고리">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      role="radio"
                      aria-checked={field.value === cat}
                      onClick={() => field.onChange(cat)}
                      className={
                        field.value === cat
                          ? 'rounded-full border border-bronze bg-bronze/20 px-4 py-1.5 text-sm font-medium text-bronze-soft'
                          : 'rounded-full border border-ink-line bg-ink-elev px-4 py-1.5 text-sm text-text-soft hover:bg-ink-card-strong'
                      }
                    >
                      {POST_CATEGORY_LABEL[cat]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-mute">
                  {POST_CATEGORY_DESCRIPTION[field.value]}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 제목 */}
          <FormField
            control={postControl}
            name="title"
            render={({ field }: { field: { value: string; onChange: (v: string) => void; name: string; onBlur: () => void } }) => (
              <FormItem>
                <FormLabel htmlFor={field.name} className="text-text">
                  제목 <span className="text-vermilion">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id={field.name}
                    type="text"
                    placeholder="4-60자"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    maxLength={POST_LIMITS.title.max}
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 본문 — Sprint 10 P-D Task #22: split-view 라이브 프리뷰 + URL 인라인 미리보기 */}
          <FormField
            control={postControl}
            name="body"
            render={({ field }: { field: { value: string; onChange: (v: string) => void; name: string; onBlur: () => void } }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor={field.name} className="text-text">
                    본문 <span className="text-vermilion">*</span>
                  </FormLabel>
                  {/* 모바일 프리뷰 토글 (md+ 에서는 split-view 자동) */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpenOnMobile((v) => !v)}
                    className="gap-1.5 md:hidden"
                    aria-pressed={previewOpenOnMobile}
                  >
                    {previewOpenOnMobile ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        편집으로
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        미리보기
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {/* 작성 textarea — 모바일에서 previewOpenOnMobile이면 숨김 */}
                  <div className={previewOpenOnMobile ? 'hidden md:block' : 'block'}>
                    <FormControl>
                      <Textarea
                        id={field.name}
                        rows={14}
                        placeholder={`30-5000자 — Markdown lite 지원\n\n## 헤딩\n**강조** 또는 _기울임_\n\`\`\`\n코드 블록\n\`\`\`\n- 리스트\n[링크](https://...)\n\n단독 줄에 URL을 붙여넣으면\nYouTube 임베드 또는 링크 미리보기가 자동 생성됩니다.`}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        maxLength={POST_LIMITS.body.max}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                  </div>
                  {/* 라이브 프리뷰 — 모바일에서 previewOpenOnMobile이면 표시 */}
                  <div className={previewOpenOnMobile ? 'block md:block' : 'hidden md:block'}>
                    <LivePreview body={field.value} />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-text-mute">
                  <span>Markdown lite: h2/h3, **, _, `code`, &gt;, -, [text](url)</span>
                  <span className="font-mono">
                    {field.value.length} / {POST_LIMITS.body.max}
                  </span>
                </div>
                {/* URL 인라인 미리보기 — 단독 URL 줄 감지 + 1s debounce */}
                <UrlPreviewInline body={field.value} className="mt-3" />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 이미지 첨부 */}
          <div className="space-y-3">
            <Label className="text-text">
              이미지 ({imageUrls.length}/{POST_LIMITS.images.max})
            </Label>
            {imageUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative h-20 w-20 overflow-hidden rounded-md border border-ink-line"
                  >
                    <Image
                      src={url}
                      alt={`첨부 ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(url)}
                      aria-label={`이미지 ${idx + 1} 제거`}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-vermilion text-ink-base hover:bg-vermilion-soft"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {imageUrls.length < POST_LIMITS.images.max ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageAdd(file);
                  }}
                  className="sr-only"
                  aria-label="이미지 추가"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingIndex !== null}
                  className="gap-2"
                >
                  <ImagePlus className="h-4 w-4" />
                  {uploadingIndex !== null ? '업로드 중...' : '이미지 추가'}
                </Button>
              </>
            ) : null}
          </div>
        </GlassCard>

        <Note variant="info" title="작성 정책">
          <ul className="ml-4 list-disc text-sm text-text-soft">
            <li>작성 후 24시간 이내 자유 수정 가능, 이후 운영자 승인 필요</li>
            <li>신고 5건 누적 시 자동 숨김 / 운영자 검토 후 복원 가능</li>
            <li>금칙어는 자동 마스킹 적용 + 누적 신고 시 페널티</li>
          </ul>
        </Note>

        {/* Sprint 10 P-D Task #22 — autosave 상태 표시 (create 모드 only) */}
        {mode === 'create' && autosave.lastSavedAt ? (
          <p className="flex items-center justify-end gap-1.5 text-xs text-text-mute">
            <Save className="h-3 w-3" aria-hidden="true" />
            <span>임시 저장됨</span>
          </p>
        ) : null}

        <Button type="submit" variant="bronze" size="lg" className="w-full" disabled={isPending}>
          {isPending ? '저장 중...' : mode === 'create' ? '게시물 등록' : '수정 사항 저장'}
        </Button>
      </form>
    </Form>
  );
}
