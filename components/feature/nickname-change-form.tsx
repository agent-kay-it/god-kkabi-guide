/**
 * <NicknameChangeForm> — 마스터 V2 F3.6 UI.
 * 출처: docs/sprint/22-sprint-v3-ga-prep/design.md §4.3
 *
 * 30일 cooldown + 닉네임 변경 입력 + Server Action 호출 + 토스트.
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { changeNickname } from '@/lib/auth/change-nickname';
import { NICKNAME_COOLDOWN_MS } from '@/lib/auth/cooldown';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface NicknameChangeFormProps {
  readonly currentNickname: string;
  readonly cooldownRemainingMs: number;
  readonly className?: string;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0초';
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) {
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    return `${hours}시간 ${minutes}분`;
  }
  const minutes = Math.floor(ms / 60_000);
  return `${minutes}분`;
}

export function NicknameChangeForm({
  currentNickname,
  cooldownRemainingMs,
  className,
}: NicknameChangeFormProps): React.JSX.Element {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isPending, startTransition] = useTransition();

  const canChangeNow = cooldownRemainingMs <= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newNickname.trim()) {
      toast.error('새 닉네임을 입력해주세요');
      return;
    }
    startTransition(async () => {
      const r = await changeNickname({ newNickname: newNickname.trim() });
      if (r.ok) {
        toast.success('닉네임이 변경되었습니다');
        setEditing(false);
        setNewNickname('');
        router.refresh();
      } else {
        const msg =
          r.error === 'COOLDOWN'
            ? `30일에 한 번만 변경 가능합니다 (${formatDuration(r.cooldownRemainingMs ?? 0)} 후 가능)`
            : r.error === 'DUPLICATE'
              ? '이미 사용 중인 닉네임입니다'
              : r.error === 'VALIDATION_FAILED'
                ? (r.message ?? '닉네임 형식이 올바르지 않습니다')
                : r.error === 'UNAUTHENTICATED'
                  ? '로그인이 필요합니다'
                  : '닉네임 변경에 실패했습니다';
        toast.error(msg);
      }
    });
  }

  return (
    <GlassCard className={cn('space-y-3 p-5', className)} aria-label="닉네임 변경">
      <header className="flex items-center gap-2">
        <Pencil className="h-4 w-4 text-bronze" aria-hidden />
        <h2 className="text-base font-semibold text-text">닉네임</h2>
      </header>

      {!editing ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-text">{currentNickname}</span>
          {canChangeNow ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              변경
            </Button>
          ) : (
            <div className="flex items-center gap-1 text-xs text-text-mute">
              <Clock className="h-3 w-3" aria-hidden />
              <span>{formatDuration(cooldownRemainingMs)} 후 변경 가능</span>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="new-nickname" className="text-xs text-text-soft">
              새 닉네임 (2-12자, 한글/영문/숫자/_)
            </label>
            <Input
              id="new-nickname"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="새 닉네임"
              maxLength={12}
              disabled={isPending}
              autoFocus
            />
          </div>
          <p className="text-xs text-text-mute">
            * 닉네임 변경 후 30일간 재변경 불가능합니다.
          </p>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              <Check className="h-3.5 w-3.5" aria-hidden /> 변경
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setNewNickname('');
              }}
              disabled={isPending}
            >
              취소
            </Button>
          </div>
        </form>
      )}

      <p className="text-[0.7rem] text-text-mute">
        정책: {Math.floor(NICKNAME_COOLDOWN_MS / 86_400_000)}일에 1회 변경 / 2-12자 / 한글·영문·숫자·언더스코어만 허용.
      </p>
    </GlassCard>
  );
}
