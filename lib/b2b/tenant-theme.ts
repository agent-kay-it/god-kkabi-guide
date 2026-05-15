/**
 * Tenant theme lookup — Sprint V3 P5 (GAP-V3-MAJ-2).
 *
 * /(admin-saas)/layout이 tenant_id query 또는 admin demo 모드로 호출.
 * tenant_themes/{tenantId}에서 logo/primary/secondary 조회 후 CSS variable override.
 */
import 'server-only';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import type { TenantThemeDoc } from '@/types/b2b';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export interface TenantThemeView {
  readonly tenantId: string;
  readonly tenantName?: string;
  readonly logoUrl?: string;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
}

function sanitizeHex(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  return HEX_RE.test(v) ? v : undefined;
}

function sanitizeUrl(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  try {
    const u = new URL(v);
    // Firebase Storage 또는 https만 허용 (XSS / open redirect 방어)
    if (u.protocol !== 'https:') return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

export async function getTenantTheme(
  tenantId: string | undefined,
): Promise<TenantThemeView | null> {
  if (!tenantId) return null;
  if (!hasAdminCredentials()) return null;
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('tenant_themes').doc(tenantId).get();
    if (!snap.exists) return null;
    const data = snap.data() as TenantThemeDoc & { tenantName?: string };
    return {
      tenantId,
      ...(data.tenantName ? { tenantName: data.tenantName } : {}),
      ...(sanitizeUrl(data.logoUrl) ? { logoUrl: sanitizeUrl(data.logoUrl)! } : {}),
      ...(sanitizeHex(data.primaryColor) ? { primaryColor: sanitizeHex(data.primaryColor)! } : {}),
      ...(sanitizeHex(data.secondaryColor) ? { secondaryColor: sanitizeHex(data.secondaryColor)! } : {}),
    };
  } catch (err) {
    console.error('[lib/b2b/tenant-theme] getTenantTheme:', err);
    return null;
  }
}

/**
 * CSS custom property override — admin SaaS layout에 inline style로 적용.
 * 색상이 정의 안 된 경우 빈 객체 → 기본 디자인 토큰 유지.
 */
export function tenantThemeStyle(theme: TenantThemeView | null): React.CSSProperties {
  if (!theme) return {};
  const style: React.CSSProperties & Record<string, string> = {};
  if (theme.primaryColor) style['--bronze'] = theme.primaryColor;
  if (theme.secondaryColor) style['--jade'] = theme.secondaryColor;
  return style;
}
