/**
 * <AdminDictionaryTable> — 모더레이션 사전 CRUD.
 * 출처: docs/sprint/04-sprint-v1/phase-2-design/moderation-policy.md §2.4
 */
'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  createDictionary,
  deleteDictionary,
  toggleDictionaryActive,
} from '@/lib/moderation/dictionaries';
import type {
  DictCategory,
  DictSeverity,
  ModerationDict,
} from '@/lib/moderation/dict-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassCard } from '@/components/ui/glass-card';

const CATEGORIES: readonly DictCategory[] = ['badword', 'spam_keyword', 'whitelisted'];
const CATEGORY_LABEL: Record<DictCategory, string> = {
  badword: '욕설/모욕',
  spam_keyword: '스팸 키워드',
  whitelisted: '화이트리스트',
};
const SEVERITIES: readonly DictSeverity[] = ['mask', 'block'];
const SEVERITY_LABEL: Record<DictSeverity, string> = { mask: '마스킹', block: '전체 거부' };

export interface AdminDictionaryTableProps {
  readonly initial: readonly ModerationDict[];
}

export function AdminDictionaryTable({
  initial,
}: AdminDictionaryTableProps): React.JSX.Element {
  const [pattern, setPattern] = useState('');
  const [category, setCategory] = useState<DictCategory>('badword');
  const [severity, setSeverity] = useState<DictSeverity>('mask');
  const [isRegex, setIsRegex] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    const trimmed = pattern.trim();
    if (!trimmed) {
      toast.error('패턴을 입력하세요');
      return;
    }
    startTransition(async () => {
      const r = await createDictionary({ category, pattern: trimmed, isRegex, severity });
      if (r.ok) {
        toast.success('사전에 추가되었습니다');
        setPattern('');
      } else {
        toast.error('추가 실패: ' + (r.error ?? 'unknown'));
      }
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      const r = await toggleDictionaryActive(id, !current);
      if (!r.ok) toast.error('변경 실패');
    });
  }

  function handleDelete(id: string) {
    if (!confirm('이 항목을 비활성화 처리합니다 (soft delete). 계속할까요?')) return;
    startTransition(async () => {
      const r = await deleteDictionary(id);
      if (r.ok) toast.success('항목이 비활성화되었습니다');
      else toast.error('삭제 실패');
    });
  }

  return (
    <div className="space-y-6">
      {/* 추가 폼 */}
      <GlassCard className="space-y-4 p-5">
        <h2 className="text-lg font-bold text-text">사전 항목 추가</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="dict-pattern" className="text-xs text-text-mute">
              패턴
            </Label>
            <Input
              id="dict-pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="단어 또는 정규식"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dict-category" className="text-xs text-text-mute">
              카테고리
            </Label>
            <select
              id="dict-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DictCategory)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="dict-severity" className="text-xs text-text-mute">
              처리 강도
            </Label>
            <select
              id="dict-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as DictSeverity)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {SEVERITY_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Checkbox
              id="dict-regex"
              checked={isRegex}
              onCheckedChange={(v) => setIsRegex(Boolean(v))}
            />
            <Label htmlFor="dict-regex" className="cursor-pointer text-sm">
              정규식
            </Label>
          </div>
        </div>
        <Button type="button" variant="bronze" onClick={handleAdd} disabled={isPending} className="gap-2">
          <Plus className="h-4 w-4" />
          추가
        </Button>
      </GlassCard>

      {/* 목록 */}
      {initial.length === 0 ? (
        <GlassCard className="p-8 text-center text-text-mute">
          등록된 사전 항목이 없습니다. Firestore 시드 11종이 fallback으로 사용 중입니다.
        </GlassCard>
      ) : (
        <ul className="space-y-2" role="list">
          {initial.map((d) => (
            <li key={d.id}>
              <GlassCard
                className={
                  d.active
                    ? 'flex flex-wrap items-center justify-between gap-3 p-3'
                    : 'flex flex-wrap items-center justify-between gap-3 p-3 opacity-50'
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      d.category === 'badword'
                        ? 'vermilion'
                        : d.category === 'spam_keyword'
                          ? 'bronze'
                          : 'jade'
                    }
                  >
                    {CATEGORY_LABEL[d.category]}
                  </Badge>
                  <code className="font-mono text-sm text-text">{d.pattern}</code>
                  {d.isRegex ? (
                    <span className="font-mono text-[0.65rem] text-text-mute">regex</span>
                  ) : null}
                  <Badge variant="muted">{SEVERITY_LABEL[d.severity]}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`dict-active-${d.id}`}
                    checked={d.active}
                    onCheckedChange={() => handleToggle(d.id, d.active)}
                  />
                  <Label htmlFor={`dict-active-${d.id}`} className="cursor-pointer text-xs">
                    활성
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(d.id)}
                    disabled={isPending}
                    aria-label="삭제"
                    className="text-text-mute hover:text-vermilion"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
