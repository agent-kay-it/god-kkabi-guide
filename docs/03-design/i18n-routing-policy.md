# i18n 라우팅 정책 — Sprint 15 / F15-G

> kkaebizigi 의 다국어 지원 정책. 현재 ko-KR 단일이지만 향후 확장 가능성을 위한 라우팅
> 전략과 SEO / a11y / SSR 고려사항을 명문화.

**작성일**: 2026-05-19
**상태**: 정책만 (실제 구현은 Sprint 16+ 트래픽 확인 후 결정)

---

## 1. 현재 상태 (2026-05-19)

- **단일 locale**: ko-KR
- **next.config.ts**: `i18n` 설정 없음 (기본 동작)
- **HTML lang attribute**: `<html lang="ko">` (app/layout.tsx)
- **콘텐츠**: 100% 한국어 (게시판 / 채팅 / 위키 / UI 라벨)
- **사용자 base**: 한국 게임 "갓깨비 키우기" 의 한국 사용자

---

## 2. 다국어 확장 시 라우팅 전략

### Option A: Path prefix (`/[locale]/...`)
- 장점: 단일 도메인, SEO 명확 (구글 hreflang 지원), CDN 단순
- 단점: 모든 라우트가 path 1 단계 추가, app/[locale]/ rewrite 필요
- 적합: 다국어 콘텐츠가 동일 사이트의 일부일 때

```
kkaebizigi.com/         → ko (default redirect)
kkaebizigi.com/ko/      → 명시적 ko
kkaebizigi.com/en/      → en
```

### Option B: 서브도메인 (`en.kkaebizigi.com`)
- 장점: 도메인 단위 분리, country-specific SEO 가능 (gTLD)
- 단점: SSL 인증서 별도, Vercel 다중 도메인 설정, CSP 도메인 추가
- 적합: 국가별 독립 운영 + 별도 마케팅 채널

### Option C: 동적 콘텐츠 번역 (no routing change)
- 장점: 라우팅 변경 0, 콘텐츠만 번역
- 단점: SEO hreflang 부적합, 사용자 명시적 언어 선택 의존
- 적합: UI 라벨만 다국어, 게시판 콘텐츠는 한국어 유지

---

## 3. kkaebizigi 의 권장 (Sprint 16+ 결정 시 입력)

**1차 확장 시**: Option C → Option A 순차 진행

1. **Phase 1** (Sprint 16 후보): 사용자 트래픽 한국 비중 95%+ → Option C 만
   - UI 라벨 (헤더, 푸터, 폼 라벨) → `next-intl` 또는 `react-intl` 도입
   - 게시판/채팅 콘텐츠는 한국어 유지
2. **Phase 2** (Sprint 18+ 후보): 비한국 사용자 5% 초과 → Option A 전환
   - `app/[locale]/` route group + middleware locale detection
   - `next.config.ts` 의 `i18n.locales` 설정
   - hreflang sitemap 자동 생성

---

## 4. SEO 고려사항

### hreflang 정책 (Option A 전환 시)
```html
<link rel="alternate" hreflang="ko" href="https://kkaebizigi.com/ko/post/123" />
<link rel="alternate" hreflang="en" href="https://kkaebizigi.com/en/post/123" />
<link rel="alternate" hreflang="x-default" href="https://kkaebizigi.com/ko/post/123" />
```

### canonical URL
- 같은 콘텐츠의 다국어 버전은 각 locale 의 path 가 canonical
- ko 가 default 면 `/post/123` ↔ `/ko/post/123` 중 하나로 canonical 통합

### sitemap.xml
- locale 별 sitemap 분리 + sitemap-index.xml 마스터
- `app/sitemap.ts` 의 `MetadataRoute.Sitemap` 에 `alternates` 추가

---

## 5. a11y 고려사항

- HTML `lang` attribute 가 페이지의 실제 locale 와 일치해야 함
- 화면 읽기 (TTS) 의 음성 선택이 lang 에 의존
- locale 전환 UI (드롭다운) 은 `<select aria-label="언어 선택">`

---

## 6. SSR 고려사항

- next-intl + App Router 의 [locale] 패턴은 RSC 호환 (server-side 번역)
- 동적 콘텐츠 (게시판 본문) 의 자동 번역은 별도 (DeepL / Google Translate API)
- ICU 메시지 포맷 (복수형 / 성별 / 날짜) → next-intl 권장

---

## 7. CSP 영향

`next.config.ts` 의 CSP 에 번역 서비스 API 도메인 추가 필요:
- DeepL: `connect-src https://api-free.deepl.com`
- Google Translate: `connect-src https://translation.googleapis.com`

---

## 8. Sprint 14 의 e2e 의 i18n 영향

현재 53 spec 은 한국어 라벨로 selector 작성 (`getByRole({ name: '게시' })`).
다국어 확장 시:
- selector 를 한국어 fallback 유지 + `getByRole({ name: /게시|Submit/i })` 정규식
- 또는 `data-testid="post-submit"` 으로 locale-independent selector 전환

---

## 9. 결론

- **Sprint 15 (현재)**: 정책 문서화만 (구현 0)
- **Sprint 16~17**: 사용자 트래픽 분석 후 Option C 도입 여부 결정
- **Sprint 18+**: 비한국 사용자 비중 5%+ 시 Option A 전환

본 문서는 향후 결정의 입력. 구현 PR 은 별도 sprint 에서 진행.
