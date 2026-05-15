/**
 * next-intl i18n 설정 — Sprint V2 P3.F (F3.7).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §7
 *
 * 인프라만 V2에서 도입. app/* → app/[locale]/* 전체 마이그레이션은
 * 운영자 게이트 (번역 ja/en 작성 + sitemap/robots locale-aware 갱신 후).
 */

export const locales = ['ko', 'ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ko';

export const LOCALE_LABEL: Record<Locale, string> = {
  ko: '한국어',
  ja: '日本語',
  en: 'English',
};

export const LOCALE_FLAG: Record<Locale, string> = {
  ko: '🇰🇷',
  ja: '🇯🇵',
  en: '🇬🇧',
};

export function isLocale(v: string | undefined): v is Locale {
  return v === 'ko' || v === 'ja' || v === 'en';
}

/** Accept-Language 헤더에서 locale 추정 */
export function detectLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const items = acceptLanguage.split(',').map((p) => p.split(';')[0]!.trim().toLowerCase());
  for (const item of items) {
    if (item.startsWith('ko')) return 'ko';
    if (item.startsWith('ja')) return 'ja';
    if (item.startsWith('en')) return 'en';
  }
  return defaultLocale;
}
