/**
 * <PostReportDialog> — 게시물/댓글 신고 다이얼로그.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.4
 *      + Sprint v2 chat-report-dialog.tsx 패턴 재사용
 */
'use client';

import { useState, useTransition } from 'react';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

import { reportPostOrComment } from '@/lib/post/actions';
import { logEvent } from '@/lib/firebase/analytics';
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
import { Textarea } from '@/components/ui/textarea';
import { REPORT_REASON_LABEL, type ReportReason } from '@/types/chat';

export interface PostReportDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly targetType: 'post' | 'comment';
  readonly targetId: string;
  /** comment의 경우 부모 postId 필수 */
  readonly postId: string;
  readonly reportedUid: string;
  readonly snapshot: string;
}

const ALL_REASONS: readonly ReportReason[] = [
  'spam',
  'abusive',
  'nsfw',
  'off_topic',
  'impersonation',
  'other',
];

export function PostReportDialog(props: PostReportDialogProps): React.JSX.Element {
  const [reasons, setReasons] = useState<Set<ReportReason>>(new Set());
  const [extraText, setExtraText] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggleReason(reason: ReportReason) {
    setReasons((prev) => {
      const next = new Set(prev);
      if (next.has(reason)) next.delete(reason);
      else next.add(reason);
      return next;
    });
  }

  function handleSubmit() {
    if (reasons.size === 0) {
      toast.error('신고 사유를 1개 이상 선택하세요');
      return;
    }
    startTransition(async () => {
      const result = await reportPostOrComment({
        targetType: props.targetType,
        targetId: props.targetId,
        postId: props.postId,
        reportedUid: props.reportedUid,
        reasons: Array.from(reasons),
        snapshot: props.snapshot,
        ...(extraText.trim() ? { extraText: extraText.trim() } : {}),
      });
      if (result.ok) {
        toast.success(
          result.autoHidden
            ? '신고가 접수되어 자동 숨김 처리되었습니다.'
            : '신고가 접수되었습니다. 운영자가 검토 후 처리합니다.',
        );
        void logEvent(props.targetType === 'post' ? 'chat_report' : 'chat_report', {
          channel_kind: 'global',
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
          ? '본인 콘텐츠는 신고할 수 없습니다'
          : result.error === 'NOT_REGISTERED'
            ? '등록 완료 후 신고 가능합니다'
            : result.error === 'TARGET_NOT_FOUND'
              ? '대상을 찾을 수 없습니다'
              : (result.message ?? '신고 처리에 실패했습니다');
      toast.error(msg);
    });
  }

  const targetLabel = props.targetType === 'post' ? '게시물' : '댓글';

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag aria-hidden className="h-4 w-4 text-vermilion" />
            {targetLabel} 신고
          </DialogTitle>
          <DialogDescription>
            신고 사유를 1개 이상 선택해주세요. 동일 {targetLabel}에 5건 누적 시 자동 숨김됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {ALL_REASONS.map((reason) => (
            <div key={reason} className="flex items-start gap-2">
              <Checkbox
                id={`reason-${reason}`}
                checked={reasons.has(reason)}
                onCheckedChange={() => toggleReason(reason)}
              />
              <Label htmlFor={`reason-${reason}`} className="cursor-pointer text-sm">
                {REPORT_REASON_LABEL[reason]}
              </Label>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Label htmlFor="extra-text" className="text-xs text-text-mute">
            상세 설명 (선택, 200자 이내)
          </Label>
          <Textarea
            id="extra-text"
            rows={2}
            value={extraText}
            onChange={(e) => setExtraText(e.target.value.slice(0, 200))}
            placeholder="추가로 알리고 싶은 내용"
            className="text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => props.onOpenChange(false)} disabled={isPending}>
            취소
          </Button>
          <Button variant="warrior" onClick={handleSubmit} disabled={isPending || reasons.size === 0}>
            {isPending ? '제출 중...' : '신고하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
