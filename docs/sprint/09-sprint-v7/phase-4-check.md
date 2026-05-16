# Sprint V7 — Phase 4 Check Report

> 작성: 2026-05-16
> 출처: Sprint V7 PDCA L4 자동 실행 완료

## 1. Build Quality (게이트 통과)

| 항목 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ **0 errors** |
| `pnpm lint` | ✅ **0 errors / 0 warnings** |
| `pnpm build` (Next.js 16.2.6) | ✅ **48 routes** (V6 47 → V7 48, +1 `/me`) |

## 2. Sprint V7 산출물

### P3.A — Recently Viewed Infrastructure
- `lib/personalization/recently-viewed.ts` — 5-entry FIFO + dedup + SSR-safe
- `hooks/use-recently-viewed.ts` — useSyncExternalStore 기반 (P4 리팩토링)
- `components/feature/wiki-card-tracker.tsx` 확장 — `recentlyViewed` prop으로 자동 push
- `components/feature/recently-viewed-list.tsx` 신규 — 카드 grid UI
- `app/page.tsx` 통합 — Wiki Categories 위 Recently Viewed 섹션
- `app/class/page.tsx` + `app/jinryeong/page.tsx` — WikiCardTracker에 recentlyViewed prop 추가

### P3.B — Related Items Cross-references
- `components/domain/related-items.tsx` 신규 — 일반 RelatedItem chip-list 컴포넌트
- `lib/personalization/related.ts` 신규 — `buildRelatedJinryeongForClass` + `buildRelatedClassesForJinryeong`
- `components/domain/class-card.tsx` 확장 — optional `relatedJinryeong` prop, 미제공 시 기존 정적 Badge fallback (하위 호환)
- `app/class/page.tsx` 통합 — 클릭 가능한 추천 진령 chip

### P3.C — Search v2
- `lib/personalization/recent-searches.ts` — dedup + max 8 + suggested queries
- `hooks/use-recent-searches.ts` 신규 — useSyncExternalStore 기반 (P4)
- `components/feature/search-results.tsx` 확장:
  - 빈 query → Recent + Popular 동시 표시
  - 0 hits → Empty + Suggested
  - Enter 키 → 첫 결과 navigate
  - 의미 있는 결과 자동으로 recent에 저장

### P3.D — /me 허브
- `app/me/page.tsx` 신규 — 통계 카드 3종 (북마크/게시물/구독) + admin 콘솔 링크 (admin only) + RecentlyViewedList

### P3.E — Mobile Drawer
- `components/feature/mobile-nav.tsx` 신규 — Radix Dialog 기반 좌→우 슬라이드 drawer
- `components/feature/top-bar.tsx` 통합 — 햄버거 버튼 (sm:hidden) + drawer + active link 하이라이트

### P4 — useSyncExternalStore 리팩토링
초기 P3.A/P3.C 구현은 useState + useEffect로 localStorage hydrate → `react-hooks/set-state-in-effect` 룰 위반 (3건).

리팩토링:
- `lib/personalization/storage-store.ts` 신규 — `createStorageStore<T>()` 팩토리
  - `getSnapshot` / `getServerSnapshot` / `subscribe` / `set`
  - 동일 탭 변경은 custom event broadcast로 다른 컴포넌트도 즉시 동기화
- `lib/personalization/recently-viewed.ts` + `recent-searches.ts` → store API 사용
- `hooks/use-recently-viewed.ts` + `hooks/use-recent-searches.ts` → `useSyncExternalStore`

결과: 3 lint errors → 0. setState-in-effect 회피 (canonical React 18+ pattern).

## 3. 무회귀 검증

- 모든 기존 V1-V6 페이지 build 통과
- ClassCard 신규 prop은 optional (하위 호환)
- WikiCardTracker `recentlyViewed`는 optional (미제공 시 GA만 발화)
- TopBar에 모바일 햄버거 추가했으나 sm: 이상 데스크톱 layout 무영향
- /me 추가는 새 라우트, 기존 /me/* sub-pages 무영향

## 4. Carry-over (V7 → V8)

없음. master plan §1 격차 5건 모두 해소.

향후 향상 후보 (정식 carry-over 아님):
- 한글 자소 분리 검색 (V6 carry-over → V7에서도 미진행)
- 모바일 drawer에 /me 빠른 진입 추가
- Recently Viewed 빈 상태 안내 메시지

## 5. 졸업 게이트 PASS

- [x] V6 종료 (typecheck/lint 0)
- [x] `pnpm typecheck` 0 errors
- [x] `pnpm lint` 0 errors + 0 warnings
- [x] `pnpm build` 48 routes 통과 (`/me` 신규)
- [x] localStorage SSR 안전 (useSyncExternalStore + getServerSnapshot)
- [x] 모바일 드로어 ESC + outside click + scroll lock (Radix Dialog)
- [x] 5 격차 모두 해소
