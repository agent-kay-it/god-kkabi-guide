/**
 * Auth Buttons — Google sign-in 단일 (NextAuth signIn Server Action).
 * 출처: docs/sprint/10-sprint-launch/design.md §2 (Auth flow v3)
 *      + docs/sprint/10-sprint-launch/prd.md §2.F1.1
 *
 * Server Action (signIn)을 form action으로 사용하여 JS 미사용 환경에서도 동작.
 * Sprint 10에서 Kakao 버튼 제거 — 모든 사용자가 Google 1-tap 흐름.
 */
import { signIn } from '@/lib/auth/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthButtonsProps {
  readonly callbackUrl?: string;
  readonly className?: string;
}

/**
 * callbackUrl에 GA4 login 이벤트 발화용 search param을 합성한다.
 * LoginSuccessTracker가 ?login=success&method=google 을 감지하여 logEvent('login') 발화.
 */
function withLoginSuccessParam(base: string): string {
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}login=success&method=google`;
}

export function AuthButtons({
  callbackUrl = '/',
  className,
}: AuthButtonsProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <form
        action={async () => {
          'use server';
          await signIn('google', {
            redirectTo: withLoginSuccessParam(callbackUrl),
          });
        }}
      >
        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="w-full justify-center gap-3 border-ink-line-strong bg-ink-elev font-medium hover:bg-ink-card-strong"
        >
          <GoogleIcon />
          Google로 시작하기
        </Button>
      </form>

      <p className="mt-2 text-center text-xs text-text-mute">
        로그인 시{' '}
        <span className="text-bronze-soft">이용약관 / 개인정보처리방침</span>에 동의한 것으로
        간주됩니다.
      </p>
    </div>
  );
}

function GoogleIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.501 12.233c0-.85-.075-1.667-.21-2.45H12v4.633h5.873a5.025 5.025 0 0 1-2.176 3.296v2.74h3.522c2.062-1.9 3.252-4.7 3.252-8.22z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.94 0 5.402-.973 7.218-2.638l-3.522-2.74c-.977.658-2.226 1.046-3.696 1.046-2.836 0-5.236-1.913-6.094-4.49H2.273v2.815C4.083 20.582 7.768 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.906 14.178A6.612 6.612 0 0 1 5.557 12c0-.756.13-1.49.349-2.178V7.007H2.273A10.949 10.949 0 0 0 1 12c0 1.776.424 3.456 1.273 4.993l3.633-2.815z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.51c1.601 0 3.037.55 4.169 1.629l3.126-3.126C17.398 2.246 14.936 1 12 1 7.768 1 4.083 3.418 2.273 7.007l3.633 2.815C6.764 7.423 9.164 5.51 12 5.51z"
        fill="#EA4335"
      />
    </svg>
  );
}
