/**
 * ChatReportDialog — 채팅 메시지 신고 모달.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §14 (모더레이션) + auth-flow.md §재신고 정책
 *
 * 사유 다중 선택 + 추가 텍스트 (선택) + 자기 신고 차단.
 */
'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { reportChatMessage } from '@/lib/chat/report-action';
import { logEvent } from '@/lib/firebase/analytics';

function channelKindOf(channelId: string): 'global' | 'server' | 'munpa' {
  // Sprint 10 Phase E: 하이픈 prefix (server- / munpa-) + 기존 widget 콜론 prefix 양쪽 지원
  if (channelId.startsWith('munpa-') || channelId.startsWith('munpa:')) return 'munpa';
  if (channelId.startsWith('server-') || channelId.startsWith('server:')) return 'server';
  return 'global';
}
import {
  REPORT_REASON_LABEL,
  type ReportReason,
} from '@/types/chat';

export interface ChatReportDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly messageId: string;
  readonly channelId: string;
  readonly reportedUid: string;
  readonly messageSnapshot: string;
  readonly imageUrl?: string;
}

const REASONS: readonly ReportReason[] = [
  'spam',
  'abusive',
  'nsfw',
  'off_topic',
  'impersonation',
  'other',
];

export function ChatReportDialog(props: ChatReportDialogProps): React.JSX.Element {
  const [reasons, setReasons] = useState<Set<ReportReason>>(new Set());
  const [extraText, setExtraText] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggleReason(r: ReportReason) {
    setReasons((prev) => {
      const next = new Set(prev);
      if (next.has(r)) {
        next.delete(r);
      } else {
        next.add(r);
      }
      return next;
    });
  }

  function handleSubmit() {
    if (reasons.size === 0) {
      toast.error('신고 사유를 1개 이상 선택하세요');
      return;
    }
    startTransition(async () => {
      const result = await reportChatMessage({
        messageId: props.messageId,
        channelId: props.channelId,
        reportedUid: props.reportedUid,
        reasons: Array.from(reasons),
        messageSnapshot: props.messageSnapshot,
        ...(props.imageUrl ? { imageUrl: props.imageUrl } : {}),
        ...(extraText.trim() ? { extraText: extraText.trim() } : {}),
      });
      if (result.ok) {
        toast.success(
          result.autoHidden
            ? '신고가 접수되어 메시지가 자동 숨김 처리되었습니다.'
            : '신고가 접수되었습니다. 운영자가 검토 후 처리합니다.',
        );
        void logEvent('chat_report', {
          channel_kind: channelKindOf(props.channelId),
          // GA4 primitive 제약 — 배열은 comma-join으로 직렬화
          reasons: Array.from(reasons).join(','),
          auto_hidden: result.autoHidden,
        });
        setReasons(new Set());
        setExtraText('');
        props.onOpenChange(false);
        return;
      }
      const msg =
        result.error === 'SELF_REPORT'
          ? '본인 메시지는 신고할 수 없습니다'
          : result.error === 'NOT_REGISTERED'
            ? '등록 완료한 사용자만 신고할 수 있습니다'
            : result.error === 'ADMIN_NOT_CONFIGURED'
              ? '서비스 점검 중입니다'
              : (result.message ?? '신고 처리에 실패했습니다');
      toast.error(msg);
    });
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>메시지 신고</DialogTitle>
          <DialogDescription>
            신고 사유를 선택하세요. 운영자가 24시간 이내 검토합니다. 3건 누적 시 자동 숨김.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {REASONS.map((r) => {
            const id = `report-reason-${r}`;
            const checked = reasons.has(r);
            return (
              <div key={r} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => toggleReason(r)}
                />
                <Label htmlFor={id} className="cursor-pointer text-sm">
                  {REPORT_REASON_LABEL[r]}
                </Label>
              </div>
            );
          })}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="report-extra-text" className="text-xs text-text-soft">
            추가 설명 (선택)
          </Label>
          <textarea
            id="report-extra-text"
            value={extraText}
            onChange={(e) => setExtraText(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="운영자 검토에 참고할 정보가 있다면 작성해주세요"
            className="w-full rounded-md border border-ink-line bg-ink-elev px-3 py-2 text-sm text-text placeholder:text-text-mute focus:border-bronze focus:outline-none"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="warrior"
            onClick={handleSubmit}
            disabled={isPending || reasons.size === 0}
          >
            {isPending ? '제출 중…' : '신고 제출'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
