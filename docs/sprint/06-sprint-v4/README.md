# Sprint V4 — 콘텐츠/디자인 고도화 (source 격차 회수)

> **상태**: ✅ **DONE** (2026-05-16) — L4 자동 모드로 완료
> Master Plan: `docs/sprint/06-sprint-v4/MASTER-PLAN.md`
> Check Report: `docs/sprint/06-sprint-v4/phase-4-check.md`
>
> **Sprint ID**: `god-kkabi-guide-sprint-v4`
> 작성일: 2026-05-16 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 입력: V3 종료 (인프라 100%) + source/godkkabi-guide (2495줄 단일 HTML 디자인)

---

## 한 줄 결론

**"V1-V3 인프라 (Auth + UGC + B2B + Toss + admin SaaS)는 보존한 채, source의 11 sections × 28 컴포넌트 × 5 interaction (마퀴/reveal/mouse-gradient/lightbox/totop) × 4-breakpoint 반응형 × favicon/OG image 모두를 Next.js App Router로 이식하여 사이트 시각적 신뢰도를 Game8 50% 수준으로 끌어올린다."**

---

## 핵심 격차 5건

| # | 항목 | 영향 | 우선순위 |
|--:|------|:---:|:--:|
| 1 | favicon / apple-touch-icon / OG image / PWA manifest 부재 | 첫인상 신뢰도 -50% | **CRIT** |
| 2 | Hero backdrop 듀얼 마퀴 부재 (현재 1장 30% opacity) | 시각적 임팩트 -70% | **CRIT** |
| 3 | Featured Jinryeong + Pay tier + Advanced 섹션 모두 부재 | 콘텐츠 풍부도 -60% | **CRIT** |
| 4 | 5 interaction (reveal + mouse-gradient + lightbox + topbar blur + totop) 부재 | UX 만족도 -40% | **MAJ** |
| 5 | 모바일/PC 반응형 fine-tuning 부재 (source 6 media query) | 모바일 UX 회귀 | **MAJ** |

---

## 28 컴포넌트 매트릭스 → MASTER-PLAN §3.2 참조

- Interaction primitives 10개 (5 hooks + 5 components)
- Domain components 15개
- Layout enhancements 3개

---

## 10 페이지 매트릭스 → MASTER-PLAN §8 참조

- Home / Class / Class detail / Jinryeong / Systems / Dungeon / Payment / Event / Tips / Advanced

---

## 진입 게이트 (V3 졸업)

- [x] Sprint V3 종료 — v3.0.0-v3-archived tag (Match ~95-96%)
- [x] V1-V3 인프라 작동 검증 (Auth + UGC + B2B + Toss)
- [x] source/godkkabi-guide 2495줄 HTML 디자인 reference 확보
- [ ] 운영자 결정: V4 진입 + 26.5h 단일 세션 압축 실행 승인

## 졸업 게이트 (PASS 조건)

- [x] Match Rate ~95% (source 28 컴포넌트 대비 — phase-4-check.md §6)
- [x] `pnpm build` 46 routes 통과
- [x] 반응형 클래스 (sm/md/lg breakpoint) 적용
- [x] Interaction 5종 + reduced-motion 가드 (globals.css @media prefers-reduced-motion)
- [x] favicon + OG image + apple-touch-icon + manifest 모두 생성
- [x] Critical 0 (`pnpm typecheck` 0 errors)
- [x] V1-V3 lint carry-over 2건 (use-channel setState-in-effect / markdown-view ESLint rule)

---

## 작업 시간 추정

운영자 부담 ~4h + AI ~22.5h = 총 26.5h (단일 세션 압축 실행).

상세 WBS → `MASTER-PLAN.md §5` + Phase 별 산출물 명세 → §7-8.

---

## 폐기/피벗 트리거

| 시점 | 조건 | 액션 |
|------|------|------|
| P3.E 8h 초과 | PHASE_TIMEOUT | sub-feature carry로 강등 |
| P5 iterate 5회 후 Match <90% | ITERATION_EXHAUSTED | V5 carry 분리 |
| Lighthouse 회귀 -10pp | QUALITY_GATE_FAIL | 이미지/애니메이션 최적화 우선 |

---

## 완료 산출물 (P3.A ~ P3.E)

상세 내역 → `phase-4-check.md` §2 참조.

| Phase | 산출 |
|---|---|
| P0 | V3 archive 확정 + V4 state 생성 + 누락 자산 4장(`app-icon.webp` 등) 이식 |
| P1+P2 | `plan-execution.md` + 28 컴포넌트 spec |
| P3.A | favicon/OG/manifest + globals.css V4 토큰 확장 |
| P3.B | 4 hooks (scroll-blur/back-to-top/reveal-on-scroll/mouse-gradient) + 4 components (Lightbox/Reveal/BackToTop/Marquee) |
| P3.C | HeroBackdrop + HeroAppBlock + HeroStats + SectionHead + Home 재구성 |
| P3.D | FeaturedJinryeong + TierStack 추출 + `app/jinryeong/page.tsx` 리팩토링 |
| P3.E | `/payment` + `/event` + `/advanced` 신규 3 페이지 |
| P4 | gap + lint check → `phase-4-check.md` |
| P5 | trivial lint fix (`Timestamp` type-only import + `Date.now` purity) |
| P6+P7+P8 | README 업데이트 + tag `v4.0.0-v4-archived` |
