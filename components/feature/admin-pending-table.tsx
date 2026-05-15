/**
 * <AdminPendingTable> — 운영자 승인 큐 (24h 이후 수정).
 * 출처: Sprint V2 P3.A (GAP-M3) + V1 prd.md §3.1.3
 *
 * Clean Arch: feature 컴포넌트, lib/post/admin-pending Server Actions 호출.
 *  - approvePendingEdit (reason 선택)
 *  - rejectPendingEdit (reason 필수)
 */
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import {
  approvePendingEdit,
  rejectPendingEdit,
  type PendingPostListItem,
} from '@/lib/post/admin-pending';
import { POST_CATEGORY_LABEL } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface AdminPendingTableProps {
  readonly initial: readonly PendingPostListItem[];
}

export function AdminPendingTable({
  initial,
}: AdminPendingTableProps): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleApprove(postId: string) {
    startTransition(async () => {
      const r = await approvePendingEdit(postId);
      if (r.ok) {
        toast.success('수정이 승인되었습니다');
        setOpenId(null);
      } else {
        toast.error(`승인 실패: ${r.error}`);
      }
    });
  }

  function handleReject(postId: string) {
    const reason = (rejectReason[postId] ?? '').trim();
    if (!reason) {
      toast.error('거절 사유를 입력하세요');
      return;
    }
    startTransition(async () => {
      const r = await rejectPendingEdit(postId, reason);
      if (r.ok) {
        toast.success('수정이 거절되었습니다');
        setOpenId(null);
        setRejectReason((prev) => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
      } else {
        toast.error(`거절 실패: ${r.error}`);
      }
    });
  }

  return (
    <ul className="space-y-3" role="list">
      {initial.map((item) => {
        const isOpen = openId === item.id;
        const before = { title: item.title, body: '(현재 본문은 게시물에서 확인)' };
        const after = item.pendingEdit;
        const requestedAt = item.pendingEditRequestedAtMs
          ? new Date(item.pendingEditRequestedAtMs).toLocaleString('ko-KR')
          : '—';
        return (
          <li key={item.id}>
            <GlassCard className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="bronze">{POST_CATEGORY_LABEL[item.category]}</Badge>
                    <span className="font-mono text-xs text-text-mute">
                      요청 {requestedAt}
                    </span>
                    <Link
                      href={`/post/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-text-mute hover:text-bronze"
                    >
                      원본 보기
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <p className="text-sm font-medium text-text">
                    작성자 {item.authorNickname}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="bronze"
                    size="sm"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="gap-1"
                  >
                    {isOpen ? '닫기' : 'Diff 보기'}
                  </Button>
                </div>
              </div>

              {isOpen ? (
                <div className="space-y-3 border-t border-ink-line pt-3">
                  <DiffView
                    beforeTitle={before.title}
                    afterTitle={after.title}
                    beforeBody={before.body}
                    afterBody={after.body}
                  />
                  <div className="space-y-2">
                    <Label htmlFor={`reject-reason-${item.id}`} className="text-xs text-text-mute">
                      거절 사유 (rejection 시 필수)
                    </Label>
                    <Textarea
                      id={`reject-reason-${item.id}`}
                      placeholder="예: 정책 위반 / 광고성 내용 등"
                      value={rejectReason[item.id] ?? ''}
                      onChange={(e) =>
                        setRejectReason((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(item.id)}
                      disabled={isPending}
                      className="gap-1 text-vermilion"
                      aria-label="거절"
                    >
                      <X className="h-4 w-4" />
                      거절
                    </Button>
                    <Button
                      type="button"
                      variant="bronze"
                      size="sm"
                      onClick={() => handleApprove(item.id)}
                      disabled={isPending}
                      className="gap-1"
                      aria-label="승인"
                    >
                      <Check className="h-4 w-4" />
                      승인
                    </Button>
                  </div>
                </div>
              ) : null}
            </GlassCard>
          </li>
        );
      })}
    </ul>
  );
}

function DiffView({
  beforeTitle,
  afterTitle,
  beforeBody,
  afterBody,
}: {
  beforeTitle: string;
  afterTitle: string;
  beforeBody: string;
  afterBody: string;
}): React.JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <div className="text-xs font-bold text-text-mute">BEFORE</div>
        <div className="rounded-md border border-ink-line bg-ink-elev p-3">
          <p className="text-sm font-medium text-text">{beforeTitle}</p>
          <p className="mt-2 whitespace-pre-wrap font-mono text-xs text-text-soft">
            {beforeBody}
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-xs font-bold text-bronze-soft">AFTER (제안)</div>
        <div className="rounded-md border border-bronze/40 bg-bronze/5 p-3">
          <p className="text-sm font-medium text-text">{afterTitle}</p>
          <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-text-soft">
            {afterBody}
          </p>
        </div>
      </div>
    </div>
  );
}
