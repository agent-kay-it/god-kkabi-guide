/**
 * OG Preview — 외부 URL의 OpenGraph 미리보기 + SSRF 방어 + Firestore 캐시.
 * 출처: docs/sprint/10-sprint-launch/design.md §6.6
 *
 * 책임:
 *  1. URL 정규화 + https 검증
 *  2. SSRF 방어 — DNS 조회 후 private/reserved IP 거부 (lib/post/ssrf-guard)
 *  3. Firestore 캐시 hit/miss (linkPreviewCache/{urlHash}, TTL 7일)
 *  4. fetch — 5초 timeout, 2MB body limit, User-Agent 명시, redirect follow + 재검증
 *  5. parse — og-parser.ts
 *
 * 보안 critical:
 *  - private IP 거부 (SSRF)
 *  - DNS rebinding: fetch 직전 hostname을 한 번 더 검증 (이중 방어 — fetch가 다른 IP로 가도 dns lookup이 캐시될 가능성에 대비)
 *  - 리다이렉트 후 final URL의 hostname도 재검증
 *  - HTML body size limit (2MB)
 *
 * 본 모듈은 server-only. Server Component 또는 Server Action에서만 호출.
 */
import 'server-only';
import crypto from 'node:crypto';

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';

import { isHostnamePrivate } from './ssrf-guard';
import { parseOgFromHtml, type OgParsedResult } from './og-parser';

export interface OgPreviewResult {
  url: string;
  title: string;
  description?: string;
  image?: string;
  domain: string;
}

const FETCH_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2MB
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일
const USER_AGENT = 'kkaebizigi-link-preview/1.0 (+https://kkaebizigi.com)';

/** Firestore 캐시 문서 ID — URL 의 SHA-256 prefix 32자. */
function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 32);
}

/** Firestore 캐시 entry 타입 (Admin SDK 직접 반환 — Timestamp는 .toMillis() 가능). */
interface CachedEntry {
  url: string;
  title: string;
  description?: string;
  image?: string;
  domain: string;
  fetchedAt: { toMillis: () => number };
  ttlExpiresAt: { toMillis: () => number };
}

/** Firestore에서 캐시 조회. credential 없으면 (로컬 등) null. */
async function readCache(urlHash: string): Promise<OgPreviewResult | null> {
  if (!hasAdminCredentials()) return null;
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('linkPreviewCache').doc(urlHash).get();
    if (!snap.exists) return null;
    const data = snap.data() as CachedEntry | undefined;
    if (!data) return null;
    if (data.ttlExpiresAt.toMillis() <= Date.now()) return null;
    return {
      url: data.url,
      title: data.title,
      ...(data.description ? { description: data.description } : {}),
      ...(data.image ? { image: data.image } : {}),
      domain: data.domain,
    };
  } catch {
    // Firestore 접근 실패 — 캐시 없는 상태로 fallthrough
    return null;
  }
}

/** Firestore에 캐시 저장. credential 없으면 무시 (best-effort). */
async function writeCache(urlHash: string, result: OgPreviewResult): Promise<void> {
  if (!hasAdminCredentials()) return;
  try {
    const db = getAdminFirestore();
    const now = Date.now();
    await db.collection('linkPreviewCache').doc(urlHash).set({
      url: result.url,
      title: result.title,
      ...(result.description ? { description: result.description } : {}),
      ...(result.image ? { image: result.image } : {}),
      domain: result.domain,
      fetchedAt: new Date(now),
      ttlExpiresAt: new Date(now + CACHE_TTL_MS),
    });
  } catch {
    // 캐시 저장 실패 — silent (페이지 렌더에 영향 없음)
  }
}

/**
 * URL → HTML body (size limit 적용).
 * - 5초 timeout (AbortController)
 * - HEAD request 없이 GET 단일 호출 (대부분의 사이트가 OG meta를 본문 head에 인라인)
 * - redirect 'follow' (브라우저 등 일반 패턴) → 단, fetch 종료 후 res.url의 hostname을 재검증
 * - User-Agent 명시
 * - body size 2MB 초과 시 throw
 */
async function fetchHtmlWithLimit(url: string): Promise<{ html: string; finalUrl: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('text/html')) return null;

    // 리다이렉트 final URL 의 hostname 재검증 (DNS rebinding 2차 방어)
    let finalUrl: URL;
    try {
      finalUrl = new URL(res.url);
    } catch {
      return null;
    }
    if (finalUrl.protocol !== 'https:') return null;
    if (await isHostnamePrivate(finalUrl.hostname)) return null;

    // body — Content-Length 헤더 우선, 없으면 reader로 누적
    const declaredLen = Number.parseInt(res.headers.get('content-length') ?? '', 10);
    if (Number.isFinite(declaredLen) && declaredLen > MAX_HTML_BYTES) {
      return null;
    }

    // ReadableStream으로 누적하며 2MB 초과 시 중단
    const body = res.body;
    if (!body) {
      const html = await res.text();
      if (html.length > MAX_HTML_BYTES) return null;
      return { html, finalUrl: res.url };
    }
    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let html = '';
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_HTML_BYTES) {
        await reader.cancel();
        return null;
      }
      html += decoder.decode(value, { stream: true });
    }
    html += decoder.decode();
    return { html, finalUrl: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * OG Preview 메인 진입점.
 * 1. URL 검증 (https only)
 * 2. SSRF 방어 (hostname 사설/예약 IP 거부)
 * 3. Firestore 캐시 hit?
 * 4. fetch + parse
 * 5. 캐시 저장 + 반환
 *
 * 실패 시 null 반환 (호출자가 raw URL fallback 렌더).
 */
export async function fetchOgPreview(rawUrl: string): Promise<OgPreviewResult | null> {
  // 1. URL 정규화 + 검증
  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return null;
  }
  if (target.protocol !== 'https:') return null;

  // 2. SSRF — hostname 사설 IP 검증 (DNS rebinding 1차 방어)
  if (await isHostnamePrivate(target.hostname)) return null;

  // 3. 캐시 조회 (정규화된 URL 기준)
  const normalizedUrl = target.toString();
  const urlHash = hashUrl(normalizedUrl);
  const cached = await readCache(urlHash);
  if (cached) return cached;

  // 4. fetch + parse
  const fetched = await fetchHtmlWithLimit(normalizedUrl);
  if (!fetched) return null;
  const parsed: OgParsedResult | null = parseOgFromHtml(fetched.html, target.hostname);
  if (!parsed) return null;

  const result: OgPreviewResult = {
    url: normalizedUrl,
    title: parsed.title,
    ...(parsed.description ? { description: parsed.description } : {}),
    ...(parsed.image ? { image: parsed.image } : {}),
    domain: parsed.domain,
  };

  // 5. 캐시 저장 (best-effort, await로 한 번에 marshal)
  await writeCache(urlHash, result);
  return result;
}
