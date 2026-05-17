/**
 * GET /api/og-preview?url=https://...
 * 출처: docs/sprint/10-sprint-launch/design.md §6 (Posts Enrichment — Form UX)
 *
 * 책임:
 *  - 인증된 등록 사용자만 호출 가능 (스크래퍼 남용 방지)
 *  - URL https 검증 + SSRF guard
 *  - lib/post/og-preview.fetchOgPreview 호출 (Firestore 캐시 활용)
 *  - JSON 응답 (캐시 control: 24h browser cache)
 *
 * 보안:
 *  - 인증 필수 — 미인증 시 401
 *  - lib/post/ssrf-guard 가 hostname private/reserved 거부
 *  - 응답에 fetched HTML 노출 금지 (title/description/image/domain만)
 *  - cache-control: private (사용자별 응답 — 광고/지역 등 컨텐츠 다양성 고려)
 */
import 'server-only';

import { auth } from '@/lib/auth/auth';
import { fetchOgPreview } from '@/lib/post/og-preview';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  // 1. 인증 검사
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: 'UNAUTHORIZED', message: '로그인 후 이용 가능합니다.' },
      { status: 401 },
    );
  }
  if (session.user.role === 'banned') {
    return Response.json(
      { error: 'FORBIDDEN', message: '정지된 사용자입니다.' },
      { status: 403 },
    );
  }

  // 2. URL 파라미터 추출
  const url = new URL(req.url).searchParams.get('url');
  if (!url) {
    return Response.json(
      { error: 'MISSING_URL', message: 'url 파라미터가 필요합니다.' },
      { status: 400 },
    );
  }
  if (url.length > 2048) {
    return Response.json(
      { error: 'URL_TOO_LONG', message: 'URL이 너무 깁니다.' },
      { status: 400 },
    );
  }

  // 3. OG fetch (SSRF defense 포함)
  const preview = await fetchOgPreview(url);
  if (!preview) {
    return Response.json(
      { error: 'PREVIEW_UNAVAILABLE', message: '미리보기를 가져올 수 없습니다.' },
      { status: 404 },
    );
  }

  // 4. 응답 — 24h private cache (Firestore 캐시는 7일이지만 client는 단기)
  return Response.json(preview, {
    status: 200,
    headers: {
      'Cache-Control': 'private, max-age=86400',
    },
  });
}
