# i18n Option C 도입 검토 — Sprint 16 / F16-F

> next-intl 기반 multi-locale 라우팅 (Option C) 의 도입 가능성 / 비용 / 위험 평가
> 보고서. Sprint 15 의 `docs/03-design/i18n-routing-policy.md` 정책 문서의
> 후속 PoC 결과.

**작성일**: 2026-05-19
**작성자**: Sprint 16 Trust L4 자동 분석
**대상**: 의사결정 — Sprint 17 이후 마이그레이션 일정 및 범위

---

## 1. 현황 (As-Is)

### 1.1 이미 구축된 자산

- `next-intl ^4.12.0` 패키지 설치 완료 (`package.json`)
- `i18n/config.ts` — locales (ko/ja/en) + LOCALE_LABEL/FLAG + helpers
- `i18n/request.ts` — `getRequestConfig` 정의 (server-side locale resolver)
- `messages/{ko,ja,en}.json` — 3개 locale 의 기본 메시지 정의
  - completeness: ko 1.0 / ja 1.0 / en 1.0 (`_meta.completeness`)
- `components/feature/locale-switcher.tsx` — 드롭다운 UI (cookie 갱신만 동작)

### 1.2 실제 동작 상태

| 항목 | 상태 | 비고 |
|---|---|---|
| `next.config.ts` 에 `createNextIntlPlugin` 적용 | ❌ 미적용 | i18n/request.ts 가 무효 |
| Middleware `i18n/middleware.ts` 존재 | ❌ 없음 | URL prefix routing 없음 |
| `app/[locale]/*` 디렉터리 | ❌ 없음 | 단일 ko hardcoded |
| `NextIntlClientProvider` 적용 | ❌ 없음 | `useTranslations` 사용 불가 |
| pages 에서 `t('key')` 사용 | ❌ 0건 | 모든 텍스트 한글 hardcoded |
| LocaleSwitcher 의 cookie 변경 효과 | ❌ no-op | request.ts 가 작동 안 함 |

**결론**: 인프라는 있으나 작동하지 않는 dormant 상태.

---

## 2. 3가지 선택지 비교

### 2.1 Option A — 현 상태 유지 (한국어 only)

| 항목 | 평가 |
|---|---|
| 비용 | 0 |
| 위험 | 0 |
| 사용자 가치 | 0 (외국어 사용자 진입 불가) |
| SEO 가치 | 0 (ko hreflang 만) |
| 추후 마이그레이션 비용 | 점점 증가 (페이지 수 증가) |

**적용**: V1 launch 이후 한국 시장만 타게팅하는 경우.

### 2.2 Option B — Cookie 기반 locale (라우팅 X)

- 모든 컴포넌트가 `useTranslations()` 사용
- LocaleSwitcher 가 cookie 설정 → `getRequestConfig` 가 cookie 읽음
- URL 은 `/post/123` 로 동일, 컨텐츠만 locale 별로 다름

| 항목 | 평가 |
|---|---|
| 비용 | 중간 (모든 페이지 t() 적용 + 메시지 키 추출) |
| 위험 | 낮음 (URL 미변경 → 외부 링크 무영향) |
| SEO 가치 | 낮음 (Google 이 cookie 기반 다국어 인식 어려움) |
| 사용자 가치 | 중간 (외국어 사용자 진입 후 전환 가능, but 초기 페이지는 ko) |
| 마이그레이션 가역성 | 높음 (단계적 적용 가능) |

**문제점**: hreflang 명시 어려움 → SEO 측면에서 multi-locale 신호 약함.

### 2.3 Option C — URL prefix routing (`/{locale}/path`)

- `app/[locale]/*` 디렉터리 구조 적용
- `middleware.ts` 가 `/post/123` → `/ko/post/123` 로 자동 redirect
- LocaleSwitcher 가 router.push 로 새 locale URL 이동
- `<link rel="alternate" hreflang="...">` 자동 생성

| 항목 | 평가 |
|---|---|
| 비용 | 높음 (전체 페이지 디렉터리 이동 + 모든 internal Link 재작성) |
| 위험 | 중간 (외부 링크 깨짐 → 301 redirect 필수) |
| SEO 가치 | 높음 (Google search console 다국어 site 인식) |
| 사용자 가치 | 높음 (북마크 가능 + 공유 시 locale 유지) |
| 마이그레이션 가역성 | 낮음 (디렉터리 구조 변경 → rollback 어려움) |

**Standard**: 글로벌 multi-locale 운영 시 SEO + UX 표준 패턴.

---

## 3. Option C 마이그레이션 비용 분석

### 3.1 영향 범위 (정량)

```bash
# app/ 디렉터리의 페이지 + 레이아웃 수
$ find app -name "page.tsx" -o -name "layout.tsx" -not -path "*node_modules*"
# 약 47개 페이지 + 12개 레이아웃 = 59 파일

# internal Link 사용처
$ grep -r "from 'next/link'" --include="*.tsx" components/ app/ | wc -l
# 약 180+ 곳에서 <Link href="..."/> 호출

# sitemap.ts / robots.ts / manifest.ts
$ ls app/{sitemap,robots,manifest}.ts
# 3 파일 모두 locale-aware 갱신 필요
```

### 3.2 작업 단계 (Sprint 단위)

| Step | 작업 | 예상 PR | 위험 |
|---|---|---|---|
| 1 | next.config.ts plugin 적용 + middleware.ts 작성 | 1 | 낮음 |
| 2 | app/* → app/[locale]/* 디렉터리 이동 (1 commit) | 1 | 높음 (rollback 어려움) |
| 3 | sitemap/robots/manifest locale-aware 갱신 | 1 | 중간 |
| 4 | 외부 도메인 (cdn / api) URL 정책 점검 | 1 | 중간 |
| 5 | 모든 internal Link href 재작성 (스크립트화) | 1 | 중간 |
| 6 | 모든 hardcoded 한글 텍스트 → `t('key')` 추출 | 3+ | 중간 (실수 가능) |
| 7 | 모든 페이지의 `<html lang>` 동적화 | 1 | 낮음 |
| 8 | hreflang link / canonical 동적화 | 1 | 낮음 |
| 9 | E2E spec locale 분기 (kr/ja/en 각각) | 2 | 중간 |
| 10 | 외부 백링크 redirect 정책 + 301 매핑 | 1 | 높음 (SEO 손실 위험) |

**총 예상**: 12-15 PR / 2-3 sprint (Sprint 17+18)

### 3.3 외부 의존 점검

- **Sentry**: source map 의 URL path 가 locale prefix 포함 → 의 source map upload 시 path mapping 조정
- **Vercel Analytics**: page event 의 path 가 locale prefix 포함 → dashboard 분류 변경
- **Firebase Hosting** (사용 안 함): N/A
- **CDN cache**: CloudFront key 가 path 기반 → locale 별 cache 분리 (정상)
- **Google Search Console**: ko/ja/en 각각의 sitemap 등록 + 외부 백링크 점검

---

## 4. 추천 (Recommendation)

### 4.1 단기 (Sprint 17)

- **Option B (Cookie 기반)** 부분 적용 — `/me`, `/premium`, `/post/new` 등
  핵심 conversion 페이지부터 점진 도입
- LocaleSwitcher 활성화 (TopBar 표시) — 사용자 인지 강화
- next.config.ts 의 `createNextIntlPlugin` 적용 (1줄 변경) — dormant 상태 해제

**근거**: 위험 0 + 사용자 가치 부분 확보 + Option C 로의 점진 마이그레이션 sub-step.

### 4.2 중기 (Sprint 18-19)

- **Option C 결정 게이트**:
  - 전제 1: Google Search Console 에 ja/en 페이지 외부 백링크 측정
  - 전제 2: 운영자 (kay@agentkay.it) 가 ja/en 시장 진입 결정
  - 전제 3: 번역 quality 가 GA (현재 completeness 1.0 → 실 사용 검증 필요)
- 전제 충족 시: Option C 전체 마이그레이션 (Sprint 18 P0 ~ Sprint 19 P3)

### 4.3 장기 (Sprint 20+)

- locale 별 컨텐츠 분기 (ja 시장 전용 이벤트 / en 시장 전용 가이드 등)
- locale-specific monetization (ja 결제 수단 / en CDN edge)

---

## 5. 결정 (Decision)

본 Sprint 16 에서는:

- ✅ 본 보고서 작성으로 "i18n Option C 검토" carry item 해소
- ❌ Sprint 16 에서 next.config.ts plugin 활성화 **보류** — Option B/C 둘 다
  전제가 사용자 가치 검증이므로 dormant 유지가 안전
- ⏸ Sprint 17 carry item 으로 **"Option B 부분 적용 + LocaleSwitcher 활성화"** 등록

### 5.1 Sprint 17 carry item 명세

```
[F17-?] i18n Option B 부분 적용
- next.config.ts 의 createNextIntlPlugin 적용
- app/layout.tsx 의 NextIntlClientProvider 적용
- /me, /premium, /post/new 의 텍스트 t() 화
- LocaleSwitcher 를 TopBar 활성화
- GA4 locale_switch event 실 측정 데이터 수집
- 측정 기간 2주 후 Sprint 18 의 Option C 결정 게이트로 진행
```

---

## 6. 관련 문서

- `docs/03-design/i18n-routing-policy.md` (Sprint 15 의 정책 문서)
- `docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §7` (인프라 도입)
- `i18n/config.ts` / `i18n/request.ts` / `messages/{ko,ja,en}.json` (현 자산)

---

## 7. 본 보고서 후속 조치

- ✅ Sprint 16 F16-F 완료 마킹
- ⏸ Sprint 17 의 PRD 에 "Option B 부분 적용" feature 추가
- ⏸ 사용자 (kay@agentkay.it) 에게 ja/en 시장 진입 의향 확인 (Sprint 17 시작 시)
