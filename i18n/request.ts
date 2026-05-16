/**
 * next-intl request.ts — server-side locale + messages 로드.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §7
 *
 * Server Component에서 locale에 따른 messages 자동 hydrate.
 * 마이그레이션 완료 전까지는 ko fallback.
 */
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
