/**
 * <RelatedItems> — Sprint V7 P3.B.
 *
 * 도메인 카드 하단에 cross-reference 표시 (직업→진령, 진령→직업 등).
 * Server-renderable. Link 클릭 시 다음 페이지로 이동.
 *
 * 사용:
 *   <RelatedItems
 *     title="추천 진령"
 *     items={[
 *       { href: '/jinryeong#hong', label: '홍길동' },
 *       { href: '/jinryeong#yongwang', label: '서해용왕' },
 *     ]}
 *   />
 *
 * 디자인 (V4 토큰):
 *  - bronze 점선 stripe + uppercase eyebrow
 *  - chip row: hover 시 bronze border + translate
 *
 * 출처: docs/sprint/09-sprint-v7/MASTER-PLAN.md §3
 */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface RelatedItem {
  readonly href: string;
  readonly label: string;
  /** 부가 설명 (예: "DPS", "치명타 버프") */
  readonly note?: string;
}

export interface RelatedItemsProps {
  readonly title: string;
  readonly items: readonly RelatedItem[];
  /** 우측 "더 보기" 링크 (선택) */
  readonly seeAllHref?: string;
  readonly className?: string;
}

export function RelatedItems({
  title,
  items,
  seeAllHref,
  className,
}: RelatedItemsProps): React.JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        'mt-6 rounded-[var(--radius-card)] border border-bronze/20 bg-bronze/5 p-4',
        className,
      )}
      aria-label={title}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h4 className="text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-bronze-soft">
          {title}
        </h4>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-1 text-[0.72rem] text-text-mute transition-colors hover:text-bronze-soft"
          >
            모두 보기
            <ArrowRight aria-hidden className="h-3 w-3" />
          </Link>
        ) : null}
      </div>
      <ul className="flex flex-wrap gap-1.5" role="list">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-ink-line-strong bg-ink-elev/70 px-3 py-1 text-xs font-medium text-text',
                'transition-all duration-150 ease-out',
                'hover:-translate-y-[1px] hover:border-bronze hover:text-bronze-soft',
                'focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2',
              )}
            >
              <span>{item.label}</span>
              {item.note ? (
                <span className="text-[0.65rem] font-normal text-text-mute">
                  {item.note}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
