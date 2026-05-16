/**
 * <AdminB2bIssueForm> — admin이 B2B API client 발급 (Sprint V3 P3.B+C).
 * 출처: docs/sprint/05-sprint-v3/design.md §2.4
 *
 * 발급 직후 plaintext API Key를 1회만 표시. 새로고침 시 사라짐 → 운영자가 즉시 복사 필요.
 */
'use client';

import { useState, useTransition } from 'react';
import { Crown, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { issueApiClient } from '@/lib/b2b/actions';
import type { ApiTier } from '@/types/b2b';
import { logEvent } from '@/lib/firebase/analytics';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Note } from '@/components/domain';

export function AdminB2bIssueForm(): React.JSX.Element {
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tier, setTier] = useState<ApiTier>('starter');
  const [monthlyFeeKrw, setMonthlyFeeKrw] = useState('5000000');
  const [contractMonths, setContractMonths] = useState('12');
  const [issued, setIssued] = useState<{
    plaintext: string;
    prefix: string;
    tenantName: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!tenantId || !tenantName || !tenantEmail) {
      toast.error('필수 입력 누락');
      return;
    }
    const fee = Number(monthlyFeeKrw);
    const months = Number(contractMonths);
    if (!Number.isFinite(fee) || fee < 0) {
      toast.error('월 요금 형식 오류');
      return;
    }
    if (!Number.isFinite(months) || months <= 0) {
      toast.error('계약 기간 형식 오류');
      return;
    }
    const now = Date.now();
    const endMs = now + months * 30 * 86400000;
    startTransition(async () => {
      const result = await issueApiClient({
        tenantId,
        tenantName,
        tenantEmail,
        tier,
        contractStartsAtMs: now,
        contractEndsAtMs: endMs,
        monthlyFeeKrw: fee,
      });
      if (!result.ok) {
        toast.error(`발급 실패: ${result.error}${result.message ? ` (${result.message})` : ''}`);
        return;
      }
      setIssued({
        plaintext: result.result.apiKeyPlaintext,
        prefix: result.result.client.apiKeyPrefix,
        tenantName: result.result.client.tenantName,
      });
      // GAP-V3-MAJ-1: B2B funnel — tenant 발급 이벤트
      void logEvent('b2b_tenant_login', {
        tenant_id: result.result.client.tenantId,
        tier: result.result.client.tier,
        monthly_fee_krw: result.result.client.monthlyFeeKrw,
      });
      toast.success('API Key 발급 완료 — 1회만 표시됩니다. 즉시 복사하세요.');
    });
  }

  async function copyKey() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.plaintext);
      toast.success('API Key 클립보드 복사');
    } catch {
      toast.error('클립보드 복사 실패 — 수동 선택');
    }
  }

  if (issued) {
    return (
      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-jade">
          <Crown className="h-5 w-5" aria-hidden />
          <h2 className="text-lg font-bold tracking-tight">발급 완료 — {issued.tenantName}</h2>
        </div>
        <Note variant="warn" title="API Key는 1회만 표시됩니다.">
          새로고침 시 사라집니다. 게임사에게 안전한 채널 (Signal / 1Password / 암호화된 이메일)로 즉시 전달 후, 본 화면을 닫아주세요.
        </Note>
        <div className="rounded-md border border-bronze/40 bg-ink-elev p-4 font-mono text-sm">
          <div className="flex items-center justify-between gap-3">
            <code className="break-all text-bronze">{issued.plaintext}</code>
            <Button onClick={copyKey} size="sm" variant="bronze">
              <Copy className="mr-1 h-3.5 w-3.5" /> 복사
            </Button>
          </div>
          <p className="mt-2 text-xs text-text-mute">표시 prefix: {issued.prefix}</p>
        </div>
        <Button onClick={() => setIssued(null)} variant="outline" size="sm">
          새 client 발급
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4 p-6">
      <h2 className="text-lg font-bold tracking-tight text-text">새 API Client 발급</h2>
      <div className="space-y-3">
        <Input
          placeholder="tenantId (예: joy-net-games)"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value.trim())}
          aria-label="Tenant ID"
        />
        <Input
          placeholder="Tenant 이름 (예: Joy Net Games)"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          aria-label="Tenant 이름"
        />
        <Input
          type="email"
          placeholder="Tenant 연락 이메일"
          value={tenantEmail}
          onChange={(e) => setTenantEmail(e.target.value.trim())}
          aria-label="Tenant 이메일"
        />
        <div className="flex gap-2">
          {(['starter', 'pro', 'enterprise'] as const).map((t) => (
            <Button
              key={t}
              type="button"
              variant={tier === t ? 'bronze' : 'outline'}
              size="sm"
              onClick={() => setTier(t)}
            >
              {t}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="월 요금 (KRW)"
            value={monthlyFeeKrw}
            onChange={(e) => setMonthlyFeeKrw(e.target.value)}
            aria-label="월 요금"
            min={0}
            step={100000}
          />
          <Input
            type="number"
            placeholder="계약 (개월)"
            value={contractMonths}
            onChange={(e) => setContractMonths(e.target.value)}
            aria-label="계약 개월"
            min={1}
            max={60}
            step={1}
          />
        </div>
      </div>
      <Button onClick={submit} disabled={isPending} variant="bronze" size="lg" className="w-full gap-2">
        {isPending ? (
          <>처리 중...</>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4" />
            발급 (plaintext는 1회만 표시)
          </>
        )}
      </Button>
    </GlassCard>
  );
}
