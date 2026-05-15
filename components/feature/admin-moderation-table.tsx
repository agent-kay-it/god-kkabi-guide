/**
 * AdminModerationTable — 운영자 콘솔의 신고 큐 + 사용자 정지 관리.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §14 + lib/moderation/actions
 */
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Trash2, UserX, UserCheck, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  banUser,
  unbanUser,
  resetUserRegistration,
  resolveReport,
  type PendingReportSummary,
  type BannedUserSummary,
} from '@/lib/moderation/actions';
import { REPORT_REASON_LABEL, type ReportReason } from '@/types/chat';

export interface AdminModerationTableProps {
  readonly pendingReports: readonly PendingReportSummary[];
  readonly bannedUsers: readonly BannedUserSummary[];
}

export function AdminModerationTable({
  pendingReports: initialReports,
  bannedUsers: initialBanned,
}: AdminModerationTableProps): React.JSX.Element {
  const [reports, setReports] = useState(initialReports);
  const [banned, setBanned] = useState(initialBanned);
  const [isPending, startTransition] = useTransition();

  function handleResolve(
    report: PendingReportSummary,
    decision: 'kept_by_operator' | 'deleted',
  ) {
    startTransition(async () => {
      const result = await resolveReport(
        report.id,
        decision,
        report.messageId,
        report.channelId,
      );
      if (result.ok) {
        setReports((prev) => prev.filter((r) => r.id !== report.id));
        toast.success(decision === 'deleted' ? '메시지를 삭제했습니다' : '메시지를 유지했습니다');
      } else {
        toast.error(result.message ?? '처리에 실패했습니다');
      }
    });
  }

  function handleBan(uid: string) {
    const reason = window.prompt('정지 사유 (저장됨):', '운영자 정지');
    if (reason === null) return;
    startTransition(async () => {
      const result = await banUser(uid, reason);
      if (result.ok) {
        toast.success('사용자를 정지했습니다');
      } else {
        toast.error(result.message ?? '정지 처리에 실패했습니다');
      }
    });
  }

  function handleUnban(uid: string) {
    if (!window.confirm('정지를 해제하시겠습니까?')) return;
    startTransition(async () => {
      const result = await unbanUser(uid);
      if (result.ok) {
        setBanned((prev) => prev.filter((u) => u.uid !== uid));
        toast.success('정지를 해제했습니다');
      } else {
        toast.error(result.message ?? '해제에 실패했습니다');
      }
    });
  }

  function handleReset(uid: string) {
    if (!window.confirm('등록 정보를 초기화합니다. 사용자는 재등록이 필요합니다. 계속하시겠습니까?'))
      return;
    startTransition(async () => {
      const result = await resetUserRegistration(uid);
      if (result.ok) {
        toast.success('등록 정보를 초기화했습니다');
      } else {
        toast.error(result.message ?? '초기화에 실패했습니다');
      }
    });
  }

  return (
    <Tabs defaultValue="reports" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-2">
        <TabsTrigger value="reports" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          신고 큐
          <Badge variant="vermilion" className="text-[0.65rem]">
            {reports.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="banned" className="gap-2">
          <UserX className="h-4 w-4" />
          정지 사용자
          <Badge variant="muted" className="text-[0.65rem]">
            {banned.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reports" className="space-y-3">
        {reports.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <ShieldCheck aria-hidden className="mx-auto h-10 w-10 text-jade" />
            <p className="mt-3 text-sm text-text">처리할 신고가 없습니다.</p>
          </GlassCard>
        ) : (
          reports.map((r) => (
            <GlassCard key={r.id} className="space-y-3 p-4">
              <header className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(r.reasons as ReportReason[]).map((reason) => (
                      <Badge key={reason} variant="vermilion" className="text-[0.65rem]">
                        {REPORT_REASON_LABEL[reason]}
                      </Badge>
                    ))}
                    <span className="font-mono text-[0.7rem] text-text-mute">
                      {new Date(r.createdAtMs).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="mt-2 rounded-md bg-ink-elev p-2 text-sm text-text">
                    {r.messageSnapshot}
                  </p>
                  {r.imageUrl ? (
                    <div className="relative mt-2 inline-block max-h-32 overflow-hidden rounded-md border border-ink-line">
                      <Image
                        src={r.imageUrl}
                        alt="신고된 이미지"
                        width={240}
                        height={128}
                        sizes="240px"
                        className="h-auto max-h-32 w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  {r.extraText ? (
                    <p className="mt-2 rounded-md border border-ink-line bg-ink-elev/55 p-2 text-xs italic text-text-soft">
                      "{r.extraText}"
                    </p>
                  ) : null}
                  <p className="mt-2 font-mono text-[0.7rem] text-text-mute">
                    채널 {r.channelId} · 신고자 {r.reporterUid.slice(0, 8)}… · 대상 {r.reportedUid.slice(0, 8)}…
                  </p>
                </div>
              </header>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="warrior"
                  onClick={() => handleResolve(r, 'deleted')}
                  disabled={isPending}
                  className="gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  메시지 삭제
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="success"
                  onClick={() => handleResolve(r, 'kept_by_operator')}
                  disabled={isPending}
                  className="gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  유지 결정
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleBan(r.reportedUid)}
                  disabled={isPending}
                  className="gap-1"
                >
                  <UserX className="h-3.5 w-3.5" />
                  사용자 정지
                </Button>
              </div>
            </GlassCard>
          ))
        )}
      </TabsContent>

      <TabsContent value="banned" className="space-y-3">
        {banned.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-sm text-text">정지된 사용자가 없습니다.</p>
          </GlassCard>
        ) : (
          banned.map((u) => (
            <GlassCard key={u.uid} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">
                    {u.nickname ?? '(닉네임 없음)'}
                  </span>
                  {u.serverId ? (
                    <Badge variant="bronze" className="text-[0.65rem]">
                      {u.serverId}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 font-mono text-[0.7rem] text-text-mute">{u.uid}</p>
                {u.banReason ? (
                  <p className="mt-1 text-xs text-vermilion-soft">사유: {u.banReason}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="xs"
                  variant="success"
                  onClick={() => handleUnban(u.uid)}
                  disabled={isPending}
                  className="gap-1"
                >
                  <UserCheck className="h-3 w-3" />
                  해제
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => handleReset(u.uid)}
                  disabled={isPending}
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  재등록
                </Button>
              </div>
            </GlassCard>
          ))
        )}
      </TabsContent>

      <p className="mt-4 text-center text-xs text-text-mute">
        문의 / 권한 요청 →{' '}
        <Link href="mailto:kay@agentkay.it" className="text-bronze underline-offset-4 hover:underline">
          kay@agentkay.it
        </Link>
      </p>
    </Tabs>
  );
}
