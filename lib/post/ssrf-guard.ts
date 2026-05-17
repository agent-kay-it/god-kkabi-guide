/**
 * SSRF Guard — DNS resolution + private/reserved IP block.
 * 출처: docs/sprint/10-sprint-launch/design.md §6.6 (보안 critical)
 *
 * 방어 대상:
 *  - IPv4 사설망 (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
 *  - IPv4 loopback / link-local / multicast / broadcast / 0.0.0.0
 *  - IPv4 carrier-grade NAT: 100.64.0.0/10
 *  - IPv6 loopback (::1) / unique-local (fc00::/7) / link-local (fe80::/10) / multicast / unspecified
 *  - localhost / *.local / *.internal / *.lan
 *  - DNS rebinding 방어: fetch 직전 한 번 더 검증한 IP를 직접 사용하도록 호출자가 처리
 *
 * 본 모듈은 server-only.
 */
import 'server-only';
import { promises as dns } from 'node:dns';
import net from 'node:net';

/** 허용되지 않는 hostname 패턴 (DNS 조회 전 빠르게 거부). */
const BLOCKED_HOSTNAME_PATTERNS: ReadonlyArray<RegExp> = [
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /\.lan$/i,
  /\.localhost$/i,
];

/** IPv4 주소가 사설/예약 범위에 속하는지 검사. */
export function isPrivateIPv4(ip: string): boolean {
  if (!net.isIPv4(ip)) return false;
  const partsRaw = ip.split('.').map((s) => Number.parseInt(s, 10));
  if (partsRaw.length !== 4 || partsRaw.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true; // 비정상 → 차단
  }
  const a = partsRaw[0]!;
  const b = partsRaw[1]!;
  // 0.0.0.0/8 — 비특정/예약
  if (a === 0) return true;
  // 10.0.0.0/8 — 사설
  if (a === 10) return true;
  // 127.0.0.0/8 — loopback
  if (a === 127) return true;
  // 100.64.0.0/10 — carrier-grade NAT
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 169.254.0.0/16 — link-local (AWS metadata 등 포함)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 — 사설
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.0.0.0/24 — IETF protocol assignments
  if (a === 192 && b === 0 && partsRaw[2] === 0) return true;
  // 192.0.2.0/24 — TEST-NET-1
  if (a === 192 && b === 0 && partsRaw[2] === 2) return true;
  // 192.168.0.0/16 — 사설
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15 — 벤치마킹
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 198.51.100.0/24 — TEST-NET-2
  if (a === 198 && b === 51 && partsRaw[2] === 100) return true;
  // 203.0.113.0/24 — TEST-NET-3
  if (a === 203 && b === 0 && partsRaw[2] === 113) return true;
  // 224.0.0.0/4 — multicast
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 — reserved
  if (a >= 240) return true;
  return false;
}

/** IPv6 주소가 사설/예약 범위에 속하는지 검사. */
export function isPrivateIPv6(ip: string): boolean {
  if (!net.isIPv6(ip)) return false;
  const normalized = ip.toLowerCase();
  // 표현 다양성을 위해 expand 한 뒤 prefix 비교
  // ::1 — loopback
  if (normalized === '::1' || normalized === '::1/128') return true;
  // :: — unspecified
  if (normalized === '::' || normalized === '::/128') return true;
  // IPv4-mapped IPv6: ::ffff:a.b.c.d — IPv4 검사로 위임
  const v4Mapped = normalized.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4Mapped) return isPrivateIPv4(v4Mapped[1]!);
  // fe80::/10 — link-local
  if (/^fe[89ab][0-9a-f]?:/.test(normalized)) return true;
  // fc00::/7 — unique-local (fc00 - fdff)
  if (/^f[cd][0-9a-f]{2}:/.test(normalized)) return true;
  // ff00::/8 — multicast
  if (/^ff[0-9a-f]{2}:/.test(normalized)) return true;
  return false;
}

/** IP 문자열이 사설/예약 범위에 속하는지 통합 검사. */
export function isPrivateIp(ip: string): boolean {
  return isPrivateIPv4(ip) || isPrivateIPv6(ip);
}

/**
 * hostname의 모든 DNS 응답 IP를 검증.
 * 하나라도 private/reserved면 true 반환.
 * hostname이 IP literal이면 그대로 검증.
 * 차단된 hostname pattern (localhost / *.local 등)도 거부.
 */
export async function isHostnamePrivate(hostname: string): Promise<boolean> {
  const normalized = hostname.toLowerCase().trim();
  if (!normalized) return true;

  // 1. hostname pattern 검사
  for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }

  // 2. IP literal (bracket 제거)
  const ipLiteral = normalized.replace(/^\[|\]$/g, '');
  if (net.isIP(ipLiteral)) {
    return isPrivateIp(ipLiteral);
  }

  // 3. DNS 조회 — 모든 응답 IP 검증 (DNS rebinding 방어 1차)
  try {
    const records = await dns.lookup(normalized, { all: true });
    if (records.length === 0) return true;
    for (const record of records) {
      if (isPrivateIp(record.address)) return true;
    }
    return false;
  } catch {
    // DNS 해석 실패 → 안전을 위해 거부
    return true;
  }
}

/**
 * 검증된 URL의 첫 번째 public IP를 반환 (호출자가 직접 IP로 fetch — DNS rebinding 완전 방어).
 * private/reserved IP가 발견되면 null.
 */
export async function resolvePublicIp(hostname: string): Promise<string | null> {
  const normalized = hostname.toLowerCase().trim();
  if (!normalized) return null;
  for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
    if (pattern.test(normalized)) return null;
  }
  const ipLiteral = normalized.replace(/^\[|\]$/g, '');
  if (net.isIP(ipLiteral)) {
    return isPrivateIp(ipLiteral) ? null : ipLiteral;
  }
  try {
    const records = await dns.lookup(normalized, { all: true });
    if (records.length === 0) return null;
    // 단 하나라도 private이면 전체 거부 (보수적)
    for (const record of records) {
      if (isPrivateIp(record.address)) return null;
    }
    // 첫 번째 public IP 반환
    return records[0]?.address ?? null;
  } catch {
    return null;
  }
}
