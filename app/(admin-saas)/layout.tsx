/**
 * Admin SaaS (whitelabel) — Sprint V3 P3.C + P5 (GAP-V3-MAJ-2).
 * 게임사 전용 화면. 운영자는 admin으로 demo 접근.
 *
 * 라우트 그룹 `(admin-saas)` — URL에 노출 안 됨. 내부 prefix는 /tenant.
 *
 * Whitelabel:
 *  - NEXT_PUBLIC_TENANT_DEMO_ID env로 tenant 선택 (production: sub-domain CNAME 또는 cookie 매핑)
 *  - tenant_themes/{tenantId} 조회 → CSS variable override (--bronze / --jade)
 *  - logo URL은 https 검증 + 표시
 * sanitize: hex 6-digit + https URL만 허용 (XSS / open redirect 방어).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import { GlassCard } from '@/components/ui/glass-card';
import { HeroMeta, HeroMetaBadge } from '@/components/domain';
import { getTenantTheme, tenantThemeStyle } from '@/lib/b2b/tenant-theme';

export const metadata: Metadata = {
  title: { default: 'Game Insights SaaS', template: '%s | Game Insights' },
  description: 'B2B Game Insights — 빌드 채용률 + Pain Point + API 사용량',
  robots: { index: false, follow: false },
};

export default async function AdminSaasLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_DEMO_ID;
  const theme = await getTenantTheme(tenantId);
  const themeStyle = tenantThemeStyle(theme);
  const tenantLabel = theme?.tenantName ?? 'Game Insights';
  const hasCustomTheme = Boolean(theme && (theme.logoUrl || theme.primaryColor));

  return (
    <div className="min-h-screen bg-ink" style={themeStyle}>
      <header className="border-b border-ink-line bg-ink-elev/80 backdrop-blur">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-5 py-3 sm:px-[5vw]">
          <Link href="/tenant" className="flex items-center gap-2">
            {theme?.logoUrl ? (
              <Image
                src={theme.logoUrl}
                alt={`${tenantLabel} 로고`}
                width={28}
                height={28}
                unoptimized
                className="h-7 w-7 rounded"
              />
            ) : null}
            <span className="text-lg font-bold tracking-tight text-bronze">{tenantLabel}</span>
            <span className="hidden text-xs text-text-mute sm:inline">B2B SaaS</span>
          </Link>
          <nav aria-label="SaaS 메뉴" className="flex gap-1 text-sm">
            <Link href="/tenant" className="px-2 py-1 text-text-soft hover:text-text">
              Dashboard
            </Link>
            <Link href="/tenant/api-usage" className="px-2 py-1 text-text-soft hover:text-text">
              API 사용량
            </Link>
            <Link href="/tenant/reports" className="px-2 py-1 text-text-soft hover:text-text">
              리포트
            </Link>
            <Link href="/tenant/acquisition" className="px-2 py-1 text-text-soft hover:text-text">
              Pricing
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>{hasCustomTheme ? tenantLabel : 'B2B / Game Insights'}</HeroMetaBadge>
          <span className="font-mono text-xs">
            {hasCustomTheme ? 'tenant-themed' : 'whitelabel demo'}
          </span>
        </HeroMeta>
        <GlassCard className="bg-ink-elev/50 p-3 text-xs text-text-mute">
          {hasCustomTheme
            ? `${tenantLabel} 전용 whitelabel — primary/logo가 tenant_themes 컬렉션에서 주입되었습니다.`
            : '본 화면은 게임사 전용 whitelabel demo. 운영자(admin)만 접근 가능. NEXT_PUBLIC_TENANT_DEMO_ID 설정 시 tenant_themes 기반 컬러/로고 적용.'}
        </GlassCard>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
