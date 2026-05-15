/**
 * <ExternalLink> — 외부 링크 클릭 시 logEvent('external_link_click') 발화.
 * 출처: docs/sprint/02-sprint-mvp/design.md §6 GA4 이벤트
 *
 * Client Component. rel="nofollow noopener noreferrer" 자동 적용.
 */
'use client';

import { useCallback } from 'react';
import { logEvent } from '@/lib/firebase/analytics';

interface ExternalLinkProps {
  url: string;
  source: string;
  children: React.ReactNode;
  className?: string;
}

export function ExternalLink({
  url,
  source,
  children,
  className,
}: ExternalLinkProps): React.JSX.Element {
  const handleClick = useCallback(() => {
    void logEvent('external_link_click', { url, source });
  }, [url, source]);

  return (
    <a
      href={url}
      target="_blank"
      rel="nofollow noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
