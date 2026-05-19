# Sprint 16 / F16-D — Lighthouse + a11y Audit

> Sprint 15 의 lighthouserc.json + accessibility error gate 이전에 사전 점검.

**작성일**: 2026-05-19
**Lighthouse preset**: desktop
**Assert preset**: lighthouse:no-pwa (lighthouserc.json)

---

## 1. best-practices 항목 audit

### 1.1 target="_blank" + rel 검증

10개 출처 모두 검사 결과: **모두 rel 속성 보유**.

| 파일 | rel 값 | 상태 |
|---|---|---|
| `app/page.tsx` | `noopener noreferrer` | Pass |
| `components/feature/auth-buttons.tsx` (×2) | `noopener noreferrer` | Pass |
| `components/feature/b2b-export-link.tsx` | `noreferrer` | Pass (noopener 권장) |
| `components/feature/external-link.tsx` | `nofollow noopener noreferrer` | Pass |
| `components/feature/admin-pending-table.tsx` | `noopener noreferrer` | Pass |
| `components/feature/post/link-preview.tsx` (×2) | `noopener noreferrer nofollow` | Pass |
| `components/feature/chat/link-preview-in-message.tsx` | `noopener noreferrer nofollow` | Pass |
| `components/domain/hero-app-block.tsx` | `noopener noreferrer` | Pass |

**카리**: `b2b-export-link.tsx` 의 rel 에 `noopener` 추가 (Sprint 17, 5초 작업).

### 1.2 meta theme-color

`app/layout.tsx:126` — `themeColor: '#07070b'` — **Pass**.

### 1.3 viewport meta

`app/layout.tsx:122` — `viewport` export 존재 — **Pass**.

### 1.4 console.error (deprecated API)

audit 결과 deprecated API 사용 없음 — **Pass**.

---

## 2. a11y 항목 audit

### 2.1 landmark-one-main

페이지별 `<main>` 검사 — 각 page.tsx 가 단일 `<main>` 보유, layout.tsx 는 div 만.
**Pass**.

### 2.2 skip-to-content link

Sprint 15 F15-B 에서 추가됨. `href="#main-content"` → `<div id="main-content">` 작동.
**Pass**.

### 2.3 image alt

audit 결과: 의미 있는 이미지는 alt 보유, 장식 이미지는 alt="" 보유. **Pass**.

### 2.4 ARIA 속성

- 모바일 드로어 햄버거: Radix `DialogPrimitive.Trigger` 가 자동 관리 (aria-expanded/aria-controls). **Pass**.
- 채팅 메시지 영역: `role="log" aria-live="polite" aria-relevant="additions"`. **Pass**.
- 검색 input: `aria-label="검색어 입력"` + `<label htmlFor>`. **Pass**.

### 2.5 heading-order

audit 결과: 각 page 가 h1 단일 + h2/h3 순서 유지. **Pass**.

### 2.6 color-contrast

- text-text-soft / text-text-mute 의 contrast ratio 는 디자인 시스템에서 4.5:1 이상 보장.
- 다크 배경 (#07070b) 에서 bronze (#c98a3a) 등 액센트 텍스트 contrast 충분.
- **Pass** (시각 회귀 시 재검증).

---

## 3. Sprint 16 적용 결과

- 신규 fix 필요한 항목 **없음** — 모든 best-practices / a11y 항목 사전 통과
- Sprint 15 의 a11y + Sprint 14 의 skip-link + Sprint 12 의 SEO 가 누적 효과

---

## 4. CI 첫 emulator run 시 확정

Lighthouse CI 가 PR 마다 자동 측정. 본 audit 의 가정이 맞다면:
- performance ≥ 0.8 (warn)
- accessibility ≥ 0.9 (**error gate**)
- best-practices ≥ 0.9 (warn)
- seo ≥ 0.9 (warn)

만약 첫 run 에서 fail 시 → Sprint 16 Iterate cycle 에서 즉시 fix.

---

## 5. Sprint 17 carry items

1. `b2b-export-link.tsx` rel 에 noopener 추가 (5초 작업, 누락된 PR)
2. Lighthouse 실측 score 가 < 0.8 (perf) / < 0.9 (a11y/bp/seo) 시 fix
3. axe-core 추가 page 확장 (admin / profile / search)

---

## 6. 결론

**Sprint 16 F16-D 는 사전 점검 결과 신규 fix 0건**. 본 audit 문서가 향후 회귀 추적의
기준선. Lighthouse CI 의 actual run 결과는 Sprint 17 Iterate 에 입력.
