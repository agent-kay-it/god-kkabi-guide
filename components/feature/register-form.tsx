/**
 * 등록 폼 — Google/Kakao 로그인 후 1회 입력하는 5필드 + PIPA 4 동의.
 * 출처: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md §7
 *
 * 책임:
 *  - react-hook-form + Zod (lib/auth/register.ts의 RegisterFormSchema 재사용)
 *  - 5필드: serverId / gameUid / munpa / nickname / classId
 *  - PIPA 4 체크박스 (필수) + analytics (선택)
 *  - Server Action registerUser() 호출
 *  - 성공 시 router.push('/')
 *
 * 디자인 (design.md §3.4):
 *  - GlassCard wrapper + bronze accent
 *  - JetBrains Mono for serverId / gameUid (데이터 필드)
 *  - 4-색 액센트 (bronze CTA / vermilion 에러)
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { registerUser } from '@/lib/auth/register';
import { logEvent } from '@/lib/firebase/analytics';
import { RegisterFormSchema, type RegisterFormInput } from '@/lib/auth/register-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { cn } from '@/lib/utils';

// V7 P5: Select dropdown은 작은 inline 영역 → emoji 제거, 텍스트만.
const CLASS_OPTIONS: ReadonlyArray<{
  value: 'warrior' | 'swordsman' | 'medium';
  label: string;
}> = [
  { value: 'warrior', label: '전사 (도깨비)' },
  { value: 'swordsman', label: '검객 (무당)' },
  { value: 'medium', label: '영매 (저승사자)' },
];

export function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // /class-quiz 결과의 prefilledClass=warrior|swordsman|medium 사전 매칭
  const prefilledClass = searchParams.get('prefilledClass');
  const initialClass: RegisterFormInput['classId'] =
    prefilledClass === 'warrior' || prefilledClass === 'swordsman' || prefilledClass === 'medium'
      ? prefilledClass
      : 'warrior';

  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      serverId: '',
      gameUid: '',
      munpa: '',
      nickname: '',
      classId: initialClass,
      age14plus: false,
      chatPublic: false,
      unofficial: false,
      operator24h: false,
      analytics: true,
      advertising: false, // Sprint V1: AdSense 선택 동의
    },
  });

  function onSubmit(values: RegisterFormInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await registerUser(values);
      if (result.ok) {
        toast.success('등록이 완료되었습니다');
        void logEvent('register_complete', {
          class_id: values.classId,
          server_id: values.serverId,
          analytics_consent: values.analytics,
        });
        router.push('/');
        router.refresh();
        return;
      }

      if (result.error === 'VALIDATION_FAILED' && result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            form.setError(key as keyof RegisterFormInput, {
              type: 'server',
              message,
            });
          }
        }
        return;
      }

      const fallback =
        result.error === 'GAMEUID_TAKEN'
          ? '이미 등록된 게임 UID입니다'
          : result.error === 'NICKNAME_TAKEN_IN_SERVER'
            ? '같은 서버에 이미 사용 중인 닉네임입니다'
            : result.error === 'UNAUTHENTICATED'
              ? '로그인이 필요합니다'
              : result.error === 'ADMIN_NOT_CONFIGURED'
                ? '서비스 점검 중입니다. 잠시 후 다시 시도해주세요.'
                : (result.message ?? '등록에 실패했습니다');
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
              사용자 등록
            </p>
            <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
              게임 정보를 알려주세요
            </h2>
            <p className="text-sm text-text-soft">
              서버 / 문파 / 닉네임은 채팅과 북마크 동기화에 사용됩니다.
            </p>
          </header>

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
                  <FormDescription>게임 내 서버명 (S + 숫자)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gameUid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>게임 UID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="게임 내 UID"
                      className="font-mono"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>변경 불가. 영문/숫자 4-20자</FormDescription>
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

          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>직업</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </GlassCard>

        <GlassCard className="space-y-4 p-6 sm:p-8">
          <header className="space-y-1">
            <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-jade-soft">
              개인정보 동의
            </p>
            <h2 className="text-lg font-bold tracking-tight text-text">PIPA 4 항목 동의</h2>
            <p className="text-sm text-text-soft">
              아래 4 항목 모두 동의해야 등록할 수 있습니다.
            </p>
          </header>

          <ConsentCheckbox
            control={form.control}
            name="age14plus"
            label="만 14세 이상입니다."
            description="개인정보 보호법에 따라 14세 미만은 보호자 동의가 필요합니다."
          />
          <ConsentCheckbox
            control={form.control}
            name="chatPublic"
            label="채팅 메시지는 공개 정보로 처리됩니다."
            description="다른 사용자가 채널에서 확인할 수 있으며, 운영자는 신고 검토를 위해 30일간 보관합니다."
          />
          <ConsentCheckbox
            control={form.control}
            name="unofficial"
            label="본 사이트는 비공식 팬 가이드입니다."
            description="갓깨비 키우기 운영사와 무관하며, 권리자 요청 시 24시간 내 수정/삭제됩니다."
          />
          <ConsentCheckbox
            control={form.control}
            name="operator24h"
            label="운영자는 24시간 이내에 신고에 응대합니다."
            description="명백한 욕설/스팸은 자동 숨김 후 운영자 검토를 거칩니다."
          />

          <div className="space-y-3 border-t border-ink-line pt-4">
            <ConsentCheckbox
              control={form.control}
              name="analytics"
              label="사용 통계 수집에 동의합니다. (선택)"
              description="개선을 위해 익명 이벤트만 수집합니다. 거절해도 모든 기능을 이용할 수 있습니다."
              optional
            />
            <ConsentCheckbox
              control={form.control}
              name="advertising"
              label="맞춤 광고 게시에 동의합니다. (선택)"
              description="Google AdSense 광고 노출 시 GDPR/PIPA 준수. 거절 시 광고가 표시되지 않습니다."
              optional
            />
          </div>
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

        <Button
          type="submit"
          variant="bronze"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? '등록 중…' : '등록하기'}
        </Button>
      </form>
    </Form>
  );
}

/**
 * `useForm<T>()` 반환 객체는 exactOptionalPropertyTypes + 3-generic 추론으로 인해
 * 명시적 `Control<T>` 시그너처와 일치시키기 어렵다.
 * 호출부와 동일 타입을 자동 추론하기 위해 `ReturnType` 패턴 사용.
 */
type RegisterFormReturn = ReturnType<typeof useForm<RegisterFormInput>>;

interface ConsentCheckboxProps {
  control: RegisterFormReturn['control'];
  name: keyof Pick<
    RegisterFormInput,
    'age14plus' | 'chatPublic' | 'unofficial' | 'operator24h' | 'analytics' | 'advertising'
  >;
  label: string;
  description: string;
  optional?: boolean;
}

function ConsentCheckbox({
  control,
  name,
  label,
  description,
  optional = false,
}: ConsentCheckboxProps): React.JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: { field: { value: boolean; onChange: (v: boolean) => void; name: string } }) => (
        <FormItem className="flex items-start gap-3 space-y-0">
          <FormControl>
            <Checkbox
              id={field.name}
              checked={field.value}
              onCheckedChange={(v) => field.onChange(Boolean(v))}
              className="mt-0.5"
            />
          </FormControl>
          <div className="space-y-1 leading-tight">
            <Label
              htmlFor={field.name}
              className={cn(
                'cursor-pointer text-sm font-medium',
                optional ? 'text-text-soft' : 'text-text',
              )}
            >
              {label}
              {!optional ? <span className="ml-1 text-vermilion">*</span> : null}
            </Label>
            <p className="text-xs text-text-mute">{description}</p>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
