# Sprint V5 — Quality, Polish & Design Propagation

> **Sprint ID**: `god-kkabi-guide-sprint-v5`
> 작성일: 2026-05-16 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 입력: V4 종료 (디자인 격차 회수 ~95%) + V4 carry-over 4건 + V4 미연결 컴포넌트 (Lightbox/BackToTop)
> 모드: **/control level 4 — 완전 자동 PDCA**

---

## 한 줄 결론

**"V4가 신규 컴포넌트와 페이지를 만들었으니, V5는 (1) V4 carry-over 4건 정리 + (2) Lightbox/BackToTop을 root layout에 통합 + (3) V4 SectionHead 디자인 시스템을 기존 8개 페이지에 propagation + (4) 성능/접근성 audit으로 사이트 완성도를 production-ready 수준으로 끌어올린다."**

---

## 1. 격차 매트릭스

| # | 영역 | 현재 (V4 종료 시점) | 목표 (V5) | 우선순위 |
|--:|------|---|---|:--:|
| 1 | V4 lint carry-over | 2 errors + 3 warnings | 0/0 | **CRIT** |
| 2 | LightboxProvider 통합 | components/feature 에만 존재, layout 미통합 | layout wrap, FeaturedJinryeong에서 트리거 | **MAJ** |
| 3 | BackToTop 통합 | components/feature 에만 존재, layout 미통합 | layout 하단 portal | **MAJ** |
| 4 | 디자인 일관성 | /class, /jinryeong, /skill, /equipment, /content, /tips, /coupon, /munpa, /simulator — V2 HeroMeta+h1+p 패턴 | V4 SectionHead+Eyebrow+Title+Lead 통일 | **MAJ** |
| 5 | 이미지 priority hint | Hero LCP 이미지 미식별 | priority 적용 + sizes 점검 | **MIN** |
| 6 | structured data | JSON-LD 없음 | Game/Article schema 추가 | **MIN** |
| 7 | aria audit | 미실행 | manual review + alt 텍스트 강화 | **MIN** |
| 8 | mobile breakpoint | sm/md/lg 적용했으나 480px 미검증 | manual review | **MIN** |

---

## 2. V4 Carry-over 4건 상세

`docs/sprint/06-sprint-v4/phase-4-check.md §3` 인용:

1. **`lib/chat/use-channel.ts:63`** — `setState in effect` (React 19 react-hooks/set-state-in-effect)
   - 원인: Firestore onSnapshot 구독 시작 시 동기적으로 setState 3회 (loading/error/messages reset)
   - 수정: subscription source 변경을 useEffect dep로 받아 처리하되, 초기값 reset을 effect 내부 동기 호출 대신 functional setState로 미루기 + 이전 channelId와 비교 후 변경 시에만 reset
2. **`components/domain/markdown-view.tsx:25`** — ESLint `react/no-danger` rule definition not found
   - 원인: ESLint v9 flat config에 react plugin 룰 정의 누락
   - 수정: `eslint.config.mjs`에 react/no-danger 룰 추가 OR `// eslint-disable-line` 인라인 (sanitize-html 이미 적용)
3. **`lib/b2b/handler.ts:66` + `app/api/cron/etl-external-signals/route.ts:39`** — `console.log` warnings
   - 원인: no-console allow `warn`/`error` 만 허용
   - 수정: `console.warn` 으로 격상 OR 구조화 로깅 함수 도입
4. **`components/feature/post-form.tsx:86`** — react-hook-form `watch()` 메모이제이션 호환성
   - 원인: react-hook-form v7의 `watch()` 가 React Compiler 친화적이지 않음
   - 수정: `useWatch({ control, name: 'imageUrls' })` 로 전환 (memoization-safe)

---

## 3. Layout 통합 명세 (P3.B)

```tsx
// app/layout.tsx (V5 변경)
<TooltipProvider>
  <LightboxProvider>      {/* V5 신규 */}
    ...existing trackers, top bar...
    <div className="...">{children}</div>
    ...existing chat widget, toaster...
    <BackToTop />         {/* V5 신규 */}
  </LightboxProvider>
</TooltipProvider>
```

- `<LightboxProvider>`는 Context 제공 → 모든 자손이 `useLightbox()` 호출 가능.
- `<BackToTop>`은 fixed positioning → portal 불필요, layout 마지막 child.
- `<FeaturedJinryeongZoomable>` 신규 client wrapper → 이미지 클릭 시 lightbox.open(src, alt).

---

## 4. 디자인 시스템 Propagation 명세 (P3.C)

기존 페이지 변환 매핑:

```tsx
// Before (V2 패턴)
<header className="mb-10">
  <HeroMeta className="mb-4">
    <HeroMetaBadge>위키 / 직업</HeroMetaBadge>
    <span>3종</span>
  </HeroMeta>
  <h1 className="title-gradient text-3xl ...">직업 가이드</h1>
  <p>전사·검객·영매 3 직업의 메타 비교</p>
</header>

// After (V4 패턴)
<header className="mb-12">
  <HeroMeta className="mb-5">
    <HeroMetaBadge>위키 / 직업</HeroMetaBadge>
    <span>3종</span>
  </HeroMeta>
  <SectionHead>
    <SectionEyebrow num="02" label="Class" />
    <SectionTitle as="h1">직업 가이드</SectionTitle>
    <SectionLead>전사·검객·영매 3 직업의 메타 비교</SectionLead>
  </SectionHead>
</header>
```

대상 페이지 8개:
- `/class` (num=02)
- `/jinryeong` (num=03)
- `/skill` (num=04a)
- `/equipment` (num=04b)
- `/content` (num=05)
- `/tips` (num=08)
- `/coupon` (이벤트 연동 — num=07b)
- `/munpa` (커뮤니티 — num=10)
- `/simulator` (선택 — 도구로 분리)

---

## 5. 성능 최적화 명세 (P3.D)

1. **이미지 priority hint** — Hero LCP 후보 (hero-app-icon)에 `priority` 적용 검증 (이미 V4에서 적용됨)
2. **이미지 sizes** — banner 마퀴 이미지 sizes prop 정확성 검증
3. **bundle analyzer** — `pnpm next build` 의 output 검사 (이미 build 통과)
4. **dynamic imports** — `/simulator` Phaser 캔버스 등 무거운 module은 dynamic import 적용 검증
5. **font display: swap** — 이미 적용됨

---

## 6. 접근성 + SEO 명세 (P3.E)

1. **aria-label / alt** — banner 이미지 alt 빈 문자열 (decorative) vs 의미적 alt 점검
2. **role="list" / "listitem"** — TOC, HeroStats 등 list 구조 시맨틱
3. **meta description** — robots index:false 유지 (1인 운영 정책) 하지만 description 길이 150자 내외 정합
4. **JSON-LD structured data** — Article schema for guide pages (선택, robots:false 영향으로 효과 제한)
5. **focus-visible 링** — Button/Link focus-visible 상태 일관성

---

## 7. 졸업 게이트

- [x] V4 종료 (Match ~95%)
- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm lint` 0 errors (V4 carry-over 모두 해결)
- [ ] `pnpm build` 모든 route 통과
- [ ] LightboxProvider + BackToTop layout 통합
- [ ] 8개 페이지 SectionHead pattern 적용
- [ ] 모든 변경 사항 무회귀 (manual smoke)

---

## 8. WBS

| Phase | 작업 | 산출 |
|---|---|---|
| P0 | V4 archive 확인 + V5 state init | task #122 |
| P1+P2 | Master plan + 격차 매핑 | 본 문서 |
| P3.A | V4 carry-over 4건 정리 | lib/chat/use-channel.ts, markdown-view.tsx, b2b/handler.ts, etl route, post-form.tsx |
| P3.B | Lightbox + BackToTop layout 통합 + Zoomable wrapper | app/layout.tsx, components/feature/featured-jinryeong-zoom.tsx |
| P3.C | 8 페이지 SectionHead 적용 | /class, /jinryeong, /skill, /equipment, /content, /tips, /coupon, /munpa |
| P3.D | 성능 audit + 이미지 sizes | (audit-only, 필요 시 patch) |
| P3.E | a11y + SEO audit | alt text 강화, aria-label 점검 |
| P4+P5 | typecheck/lint/build | 0/0/통과 |
| P6+P7+P8 | report + commit + tag v5.0.0-v5-archived | phase-4-check.md, README |

---

## 9. 폐기 기준

| 시점 | 조건 | 액션 |
|------|------|------|
| P3.A use-channel 리팩토링 30분 초과 | 복잡도 폭증 | 인라인 disable + V6 carry |
| P3.C 페이지 수정 회귀 | typecheck 5개 이상 fail | scope 축소 (필수 2~3 페이지) |
| P3.D 성능 회귀 -10pp | bundle 증가 | optimization 우선 |
