/**
 * 회원 탈퇴 확인 폼 — 2단계 검증.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.5
 *
 * 2단계 확인:
 *  1) 사용자가 자신의 닉네임을 정확히 입력
 *  2) "탈퇴" 키워드 정확히 입력
 *
 * 성공 시: 즉시 익명화 + 30일 cooldown 시작 → /login으로 redirect.
 */
'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { requestAccountDeletion } from '@/lib/auth/delete-account';
import { logEvent } from '@/lib/firebase/analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';

export interface DeleteAccountFormProps {
  readonly currentNickname: string;
  readonly impact: {
    readonly postCount: number;
    readonly bookmarkCount: number;
  };
}

const REQUIRED_KEYWORD = '탈퇴';

export function DeleteAccountForm({
  currentNickname,
  impact,
}: DeleteAccountFormProps): React.JSX.Element {
  const [nicknameConfirm, setNicknameConfirm] = useState('');
  const [keywordConfirm, setKeywordConfirm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isMatch =
    nicknameConfirm.trim() === currentNickname &&
    keywordConfirm.trim() === REQUIRED_KEYWORD;

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!isMatch) {
      setServerError('두 항목 모두 정확히 입력해주세요.');
      return;
    }
    setServerError(null);
    startTransition(async () => {
      const result = await requestAccountDeletion({
        nicknameConfirm,
        keywordConfirm,
      });
      if (result.ok) {
        void logEvent('account_delete_request', {
          posts_at_deletion: impact.postCount,
          bookmarks_at_deletion: impact.bookmarkCount,
        });
        toast.success('탈퇴가 완료되었습니다. 30일 내 동일 계정으로 재가입하면 복구 가능합니다.');
        // 세션 즉시 삭제됨 — / 로 이동
        window.location.href = '/';
        return;
      }
      const message =
        result.error === 'CONFIRMATION_FAILED'
          ? (result.message ?? '확인 정보가 일치하지 않습니다.')
          : result.error === 'UNAUTHENTICATED'
            ? '로그인이 필요합니다'
            : result.error === 'NOT_REGISTERED'
              ? '등록된 사용자만 탈퇴 가능합니다'
              : result.error === 'ADMIN_NOT_CONFIGURED'
                ? '서비스 점검 중입니다.'
                : (result.message ?? '탈퇴 요청에 실패했습니다');
      setServerError(message);
      toast.error(message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <GlassCard className="space-y-5 p-6 sm:p-8" accent="warrior">
        <header className="space-y-1">
          <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-vermilion-soft">
            Account Deletion
          </p>
          <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">
            정말 탈퇴하시겠어요?
          </h2>
          <p className="text-sm text-text-soft">
            탈퇴 후 <strong>30일</strong> 동안 데이터가 보관되며, 같은 Google 계정으로 재가입 시
            복구할 수 있습니다. 30일 경과 후에는 영구 삭제되어 복구할 수 없습니다.
          </p>
        </header>

        <section className="rounded-md border border-ink-line bg-ink-elev/40 p-4 text-sm">
          <h3 className="mb-2 font-semibold text-text">영향 범위</h3>
          <ul className="space-y-1 text-text-soft">
            <li>
              작성한 게시물 <strong className="text-text">{impact.postCount}건</strong> →
              작성자가 &quot;삭제된 사용자&quot;로 표시됩니다 (콘텐츠는 보존).
            </li>
            <li>
              북마크 <strong className="text-text">{impact.bookmarkCount}개</strong> → 30일 후 영구 삭제.
            </li>
            <li>채팅 메시지는 마스킹된 상태로 30일 보관 후 삭제됩니다.</li>
            <li>서버/문파 채널 멤버 카운트가 즉시 감소합니다.</li>
            <li>닉네임과 프로필 사진은 <strong className="text-text">즉시 익명화</strong>됩니다.</li>
          </ul>
        </section>

        <div className="space-y-4 border-t border-ink-line pt-5">
          <p className="text-sm text-text-soft">
            확인을 위해 본인의 닉네임과 &quot;{REQUIRED_KEYWORD}&quot; 키워드를 정확히 입력해주세요.
          </p>

          <div className="space-y-2">
            <Label htmlFor="nickname-confirm">
              닉네임 (
              <span className="font-mono text-bronze-soft">{currentNickname}</span>) 입력
            </Label>
            <Input
              id="nickname-confirm"
              value={nicknameConfirm}
              onChange={(e) => setNicknameConfirm(e.target.value)}
              autoComplete="off"
              placeholder={currentNickname}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyword-confirm">
              <span className="font-mono text-vermilion-soft">{REQUIRED_KEYWORD}</span> 입력
            </Label>
            <Input
              id="keyword-confirm"
              value={keywordConfirm}
              onChange={(e) => setKeywordConfirm(e.target.value)}
              autoComplete="off"
              placeholder={REQUIRED_KEYWORD}
            />
          </div>
        </div>
      </GlassCard>

      {serverError ? (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-[var(--radius-card)] border border-vermilion/40 bg-vermilion/10 p-3 text-sm text-vermilion-soft"
        >
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="outline" size="lg">
          <a href="/me">취소하고 돌아가기</a>
        </Button>
        <Button
          type="submit"
          variant="bronze"
          size="lg"
          disabled={!isMatch || isPending}
          className="bg-vermilion text-text hover:bg-vermilion/90"
        >
          {isPending ? '탈퇴 진행 중…' : '탈퇴 확인'}
        </Button>
      </div>
    </form>
  );
}
