/**
 * Next.js 16 metadata file — PWA manifest.
 * Sprint V4 P3.A (M11) — 모바일 홈화면 추가 지원.
 *
 * icons는 app/icon.tsx, app/apple-icon.tsx가 자동 처리하므로 별도 reference 없음.
 */
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '갓깨비 키우기 비공식 팬 가이드',
    short_name: '갓깨비 가이드',
    description:
      '갓깨비 키우기 위키 · 직업 · 진령 · 과금 · 이벤트 · 고급 메커니즘 한 페이지 정리. 1인 팬 운영, 매주 검증.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07070b',
    theme_color: '#07070b',
    orientation: 'portrait-primary',
    categories: ['games', 'entertainment', 'reference'],
    lang: 'ko-KR',
  };
}
