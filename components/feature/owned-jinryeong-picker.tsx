/**
 * <OwnedJinryeongPicker> — Sprint 26 F26-B.
 *
 * /me 페이지의 보유 진령 토글 UI.
 * 사용자가 진령 11종 카드를 토글 → updateOwnedJinryeong Server Action
 * → Firestore users.ownedJinryeong 저장 → /simulator 추천 정확도 향상.
 *
 * 데이터 흐름:
 *   [1 UI]    카드 클릭 → toggle local Set state
 *   [2 Client] "저장" 버튼 클릭 → useTransition pending
 *   [3 API]   updateOwnedJinryeong(uids[]) Server Action
 *   [4 DB]    Firestore users/{uid}.ownedJinryeong set merge
 *   [5 Resp]  { ok: true, saved: [...] } or { ok: false, error }
 *   [6 Client] toast.success + router.refresh() (revalidatePath cascade)
 *   [7 UI]    재진입 시 initialOwned 반영
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { updateOwnedJinryeong } from '@/lib/auth/update-owned-jinryeong';
import { WIKI_JINRYEONG_SEED } from '@/data/wiki/jinryeong';
import { cn } from '@/lib/utils';
import type { WikiJinryeongId } from '@/types/wiki';

export interface OwnedJinryeongPickerProps {
  readonly initialOwned: readonly WikiJinryeongId[];
}

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: '로그인이 필요합니다.',
  NOT_REGISTERED: '회원가입을 완료해주세요.',
  BANNED: '정지된 계정입니다.',
  INVALID_INPUT: '유효하지 않은 진령 id 입니다.',
  NO_CREDENTIALS: '서버 자격증명 누락',
  INTERNAL: '저장에 실패했습니다.',
};

export function OwnedJinryeongPicker({
  initialOwned,
}: OwnedJinryeongPickerProps): React.JSX.Element {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialOwned),
  );
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = (): void => {
    startTransition(async () => {
      const result = await updateOwnedJinryeong({ uids: Array.from(selected) });
      if (result.ok) {
        toast.success(`보유 진령 ${result.saved.length}개 저장됨`);
        router.refresh();
      } else {
        toast.error(
          ERROR_MESSAGES[result.error] ?? `오류: ${result.error}`,
        );
      }
    });
  };

  const dirty = !setsEqual(selected, new Set(initialOwned));

  return (
    <div className="space-y-4">
      <ul
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
        role="list"
        aria-label="보유 진령 목록"
      >
        {WIKI_JINRYEONG_SEED.map((j) => {
          const isOn = selected.has(j.id);
          return (
            <li key={j.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isOn}
                aria-label={`${j.name} 보유 토글`}
                disabled={isPending}
                onClick={() => toggle(j.id)}
                className={cn(
                  'group flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition',
                  isOn
                    ? 'border-bronze bg-bronze/10 text-text'
                    : 'border-line/40 bg-mute/40 text-text-soft hover:border-bronze/40',
                  isPending && 'opacity-50',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    isOn ? 'border-bronze bg-bronze text-bg' : 'border-line/60',
                  )}
                >
                  {isOn ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{j.name}</span>
                  <span className="text-xs opacity-70">
                    {j.tier}티어 · {factionLabel(j.faction)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-text-soft">
          {selected.size}/{WIKI_JINRYEONG_SEED.length} 선택됨
          {dirty ? ' · 변경사항 있음' : null}
        </span>
        <Button onClick={save} disabled={isPending || !dirty} size="sm">
          {isPending ? '저장 중…' : '보유 진령 저장'}
        </Button>
      </div>
    </div>
  );
}

function factionLabel(faction: 'sin' | 'yo' | 'in'): string {
  if (faction === 'sin') return '신';
  if (faction === 'yo') return '요';
  return '인';
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}
