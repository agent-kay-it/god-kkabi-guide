/**
 * 프로필 수정 폼 — Server Component에서 받은 initialValues로 4필드 수정.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.4
 *
 * 책임:
 *  - react-hook-form + Zod (ProfileEditSchema)
 *  - 4필드: serverId / munpa / nickname / classId (gameUid는 readonly 표시)
 *  - Server Action updateProfile() 호출
 *  - 성공 시 /api/auth/session?update=true 호출 + hard-reload (JWT 재-hydrate)
 *
 * 디자인 (register-form.tsx 패턴 재사용):
 *  - GlassCard wrapper
 *  - JetBrains Mono for serverId / gameUid (데이터 필드)
 *  - bronze CTA / vermilion 에러
 */
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { updateProfile } from '@/lib/auth/update-profile';
import { logEvent } from '@/lib/firebase/analytics';
import {
  ProfileEditSchema,
  type ProfileEditInput,
} from '@/lib/auth/profile-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard } from '@/components/ui/glass-card';

const CLASS_OPTIONS: ReadonlyArray<{
  value: ProfileEditInput['classId'];
  label: string;
}> = [
  { value: 'warrior', label: '전사 (도깨비)' },
  { value: 'swordsman', label: '검객 (무당)' },
  { value: 'medium', label: '영매 (저승사자)' },
];

export interface ProfileEditFormProps {
  readonly initialValues: ProfileEditInput;
  readonly readonlyGameUid: string;
  readonly readonlyEmail: string;
}

export function ProfileEditForm({
  initialValues,
  readonlyGameUid,
  readonlyEmail,
}: ProfileEditFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ProfileEditInput>({
    resolver: zodResolver(ProfileEditSchema),
    defaultValues: initialValues,
  });

  // dirty 상태로 제출 버튼 활성화 제어 — formState 직접 구독 (RHF 권장 패턴).
  const isDirty = form.formState.isDirty;

  function onSubmit(values: ProfileEditInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.ok) {
        toast.success('프로필이 저장되었습니다');
        void logEvent('profile_update', {
          class_id: values.classId,
          server_id: values.serverId,
        });

        // JWT 갱신 — Firestore 새 값으로 token 재-hydrate.
        try {
          await fetch('/api/auth/session?update=true', {
            method: 'POST',
            credentials: 'include',
          });
        } catch {
          // fallback: hard-reload 로 미들웨어 재검증
        }
        // 새 nickname / serverId 가 헤더/사이드바에 반영되도록 hard navigation
        window.location.href = '/me';
        return;
      }

      if (result.error === 'VALIDATION_FAILED' && result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            form.setError(key as keyof ProfileEditInput, {
              type: 'server',
              message,
            });
          }
        }
        return;
      }

      const fallback =
        result.error === 'NICKNAME_TAKEN_IN_SERVER'
          ? '같은 서버에 이미 사용 중인 닉네임입니다'
          : result.error === 'UNAUTHENTICATED'
            ? '로그인이 필요합니다'
            : result.error === 'NOT_REGISTERED'
              ? '먼저 회원가입을 완료해주세요'
              : result.error === 'ADMIN_NOT_CONFIGURED'
                ? '서비스 점검 중입니다. 잠시 후 다시 시도해주세요.'
                : (result.message ?? '프로필 저장에 실패했습니다');
      setServerError(fallback);
      toast.error(fallback);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <GlassCard accent="swordsman" className="space-y-5 p-6 sm:p-8">
          <header className="space-y-1">
            <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-bronze-soft">
              프로필 수정
            </p>
            <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
              내 정보를 업데이트하세요
            </h2>
            <p className="text-sm text-text-soft">
              서버 · 문파 · 닉네임 · 직업은 변경 가능합니다. 게임 UID와 이메일은 식별자로
              변경할 수 없습니다.
            </p>
          </header>

          {/* 변경 불가 필드 — Sprint 14 F14-J: 민감 식별자는 기본 마스킹 + 클릭 노출 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadonlyField
              label="게임 UID (변경 불가)"
              value={readonlyGameUid}
              mono
              mask
            />
            <ReadonlyField
              label="이메일 (Google)"
              value={readonlyEmail}
              mask
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="serverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>서버 ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예) S785"
                      className="font-mono"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>S + 숫자 (예: S785)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>직업</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="직업을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLASS_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="munpa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>문파</FormLabel>
                <FormControl>
                  <Input placeholder="문파명" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>변경 시 기존 문파에서 빠지고 새 문파로 이동</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>닉네임</FormLabel>
                <FormControl>
                  <Input placeholder="2-12자" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>같은 서버 내 중복 불가</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </GlassCard>

        {serverError ? (
          <p
            role="alert"
            aria-live="assertive"
            className="rounded-[var(--radius-card)] border border-vermilion/40 bg-vermilion/10 p-3 text-sm text-vermilion-soft"
          >
            {serverError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isPending}
            onClick={() => {
              form.reset(initialValues);
              setServerError(null);
            }}
          >
            되돌리기
          </Button>
          <Button
            type="submit"
            variant="bronze"
            size="lg"
            disabled={isPending || !isDirty}
          >
            {isPending ? '저장 중…' : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface ReadonlyFieldProps {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
  /**
   * Sprint 14 F14-J (BUG-13-003 fix): 민감 식별자 마스킹.
   * true 면 기본 마스킹 후 클릭 시 노출 (개인정보 노출 UX 개선).
   */
  readonly mask?: boolean;
}

function maskValue(value: string): string {
  if (!value) return '—';
  // 이메일: 로컬 파트 첫 2자 + ***@도메인
  const atIdx = value.indexOf('@');
  if (atIdx > 0) {
    const local = value.slice(0, atIdx);
    const domain = value.slice(atIdx + 1);
    const visible = local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(3, local.length - 2))}@${domain}`;
  }
  // 일반 값: 앞 2자 + ***
  if (value.length <= 4) return '*'.repeat(value.length);
  return `${value.slice(0, 2)}${'*'.repeat(value.length - 2)}`;
}

function ReadonlyField({
  label,
  value,
  mono = false,
  mask = false,
}: ReadonlyFieldProps): React.JSX.Element {
  const [revealed, setRevealed] = useState(false);
  const displayValue = mask && !revealed ? maskValue(value) : value || '—';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-soft">{label}</p>
        {mask && value ? (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="text-xs text-bronze-soft underline-offset-4 hover:underline"
            aria-pressed={revealed}
            aria-label={revealed ? `${label} 가리기` : `${label} 보기`}
          >
            {revealed ? '가리기' : '보기'}
          </button>
        ) : null}
      </div>
      <div
        className={`rounded-md border border-ink-line bg-ink-elev/50 px-3 py-2 text-sm text-text-mute ${
          mono ? 'font-mono' : ''
        }`}
      >
        {displayValue}
      </div>
    </div>
  );
}
