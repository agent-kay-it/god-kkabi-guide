/**
 * <AdminB2bClientsTable> — admin B2B clients 목록 + revoke (Sprint V3 P3.C).
 */
'use client';

import { useState, useTransition } from 'react';
import { Ban, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { revokeApiClient } from '@/lib/b2b/actions';
import type { ApiClientDoc } from '@/types/b2b';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';

export interface AdminB2bClientsTableProps {
  readonly initialClients: readonly ApiClientDoc[];
}

const TIER_VARIANT = {
  starter: 'indigo',
  pro: 'jade',
  enterprise: 'bronze',
} as const;

function formatDate(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toISOString().slice(0, 10);
}

function formatKrw(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

export function AdminB2bClientsTable({
  initialClients,
}: AdminB2bClientsTableProps): React.JSX.Element {
  const [clients, setClients] = useState<readonly ApiClientDoc[]>(initialClients);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function onRevoke(clientId: string) {
    if (!window.confirm('해당 client를 비활성화합니다. 진행하시겠습니까?')) return;
    setPendingId(clientId);
    startTransition(async () => {
      const result = await revokeApiClient(clientId);
      setPendingId(null);
      if (!result.ok) {
        toast.error(`비활성화 실패: ${result.error}`);
        return;
      }
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, isActive: false } : c)),
      );
      toast.success('Client 비활성화 완료');
    });
  }

  if (clients.length === 0) {
    return (
      <GlassCard className="p-6">
        <p className="text-center text-sm text-text-mute">발급된 client가 없습니다.</p>
      </GlassCard>
    );
  }

  return (
    <ul className="space-y-2" role="list">
      {clients.map((c) => (
        <li key={c.id}>
          <GlassCard className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text">{c.tenantName}</span>
                <Badge variant={TIER_VARIANT[c.tier]}>{c.tier}</Badge>
                {c.isActive ? (
                  <Badge variant="jade">active</Badge>
                ) : (
                  <Badge variant="vermilion">revoked</Badge>
                )}
              </div>
              <p className="font-mono text-xs text-text-mute">{c.apiKeyPrefix}</p>
              <p className="text-xs text-text-soft">
                {c.tenantEmail} · ₩{formatKrw(c.monthlyFeeKrw)}/월
              </p>
              <p className="text-xs text-text-mute">
                계약: {formatDate(c.contractStartsAtMs)} ~ {formatDate(c.contractEndsAtMs)}
              </p>
            </div>
            {c.isActive ? (
              <Button
                onClick={() => onRevoke(c.id)}
                disabled={pendingId === c.id}
                variant="outline"
                size="sm"
                aria-label={`${c.tenantName} 비활성화`}
              >
                {pendingId === c.id ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="mr-1 h-3.5 w-3.5" />
                )}
                {pendingId === c.id ? '처리 중' : '비활성화'}
              </Button>
            ) : null}
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
