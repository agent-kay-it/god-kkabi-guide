/**
 * <Footer> — 디스클레이머 + 출처 + Contact.
 * 출처: docs/sprint/02-sprint-mvp/design.md §3.14
 */
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FooterSource {
  label: string;
  href: string;
}

export interface FooterProps {
  contactEmail?: string;
  lastUpdated?: string;
  sources?: readonly FooterSource[];
  className?: string;
}

const DEFAULT_SOURCES: readonly FooterSource[] = [
  {
    label: 'Google Play (갓깨비 키우기 공식)',
    href: 'https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi',
  },
  {
    label: 'App Store (갓깨비 키우기 공식)',
    href: 'https://apps.apple.com/kr/app/%EA%B0%93%EA%B9%A8%EB%B9%84-%ED%82%A4%EC%9A%B0%EA%B8%B0/id6745617040',
  },
];

export function Footer({
  contactEmail = 'kay@agentkay.it',
  lastUpdated,
  sources = DEFAULT_SOURCES,
  className,
}: FooterProps): React.JSX.Element {
  return (
    <footer
      className={cn(
        'mt-16 space-y-6 border-t border-border-soft px-4 py-10 text-sm text-text-secondary sm:px-6',
        className,
      )}
      role="contentinfo"
    >
      <section className="mx-auto max-w-3xl rounded-card border border-border-soft bg-bg-card p-5 sm:p-6">
        <h2 className="mb-2 text-base font-bold text-accent-gold">비공식 팬 가이드 알림</h2>
        <p className="leading-relaxed">
          본 사이트는 비공식 팬 가이드로, 저작권자(Joy Net Games / JOY MOBILE NETWORK PTE.
          LTD. / 4399 / Kakao Games / 인용된 외부 가이드 저작권자)의 요청 시 24시간 이내에
          해당 콘텐츠를 삭제하거나 수정합니다. 본 사이트는 갓깨비 키우기 게임 운영사와 무관합니다.
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-2">
        <h2 className="text-sm font-bold text-text-secondary">출처</h2>
        <ul className="space-y-1 text-xs">
          {sources.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-accent-gold underline-offset-4 hover:underline"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto flex max-w-3xl flex-col items-start justify-between gap-3 border-t border-border-soft pt-6 text-xs text-text-muted sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} 갓깨비 키우기 비공식 팬 가이드 (1인 개인 프로젝트){' '}
          {lastUpdated ? `· 최종 업데이트 ${lastUpdated}` : null}
        </p>
        <Link
          href={`mailto:${contactEmail}`}
          className="inline-flex items-center gap-1.5 text-accent-gold underline-offset-4 hover:underline"
        >
          <Mail aria-hidden="true" className="h-3.5 w-3.5" />
          {contactEmail}
        </Link>
      </section>
    </footer>
  );
}
