/**
 * <B2bExportLink> — Sprint V3 P5 (GAP-V3-MAJ-1).
 *
 * tenant/reports 페이지의 샘플 JSON 링크 클릭 시 b2b_export GA4 발화.
 * 외부 라우트 (/api/v1/*)로 이동하므로 next/link prefetch 의도 X.
 */
'use client';

import { useCallback } from 'react';
import { FileDown } from 'lucide-react';

import { logEvent } from '@/lib/firebase/analytics';

export interface B2bExportLinkProps {
  readonly href: string;
  readonly reportId: string;
  readonly label?: string;
}

export function B2bExportLink({ href, reportId, label }: B2bExportLinkProps): React.JSX.Element {
  const onClick = useCallback(() => {
    void logEvent('b2b_export', {
      report_id: reportId,
      href,
      format: 'json',
    });
  }, [href, reportId]);

  return (
    <a
      href={href}
      onClick={onClick}
      className="inline-flex items-center gap-1 text-bronze hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FileDown className="h-3 w-3" aria-hidden />
      {label ?? '샘플 JSON'}
    </a>
  );
}
