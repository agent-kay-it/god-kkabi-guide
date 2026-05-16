# Sprint V7 — Personalization & Discovery Enhancement

> **Sprint ID**: `god-kkabi-guide-sprint-v7`
> 작성일: 2026-05-16 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 입력: V6 종료 (검색 + 북마크 + admin V4) + V6 carry-over 없음
> 모드: **/control level 4 — 완전 자동 PDCA**

## 한 줄 결론

**"V6 검색/북마크 인프라 위에 (1) 최근 본 항목 localStorage 트래킹 + (2) 직업↔진령 cross-reference + (3) 검색 v2 (최근/추천/Enter ↩) + (4) /me 허브 대시보드 + (5) TopBar 모바일 드로어를 추가하여 재방문 사용자의 발견·재탐색 경험을 극대화한다."**

## 1. 격차 매트릭스

| # | 영역 | 현재 | 목표 (V7) | 우선순위 |
|--:|------|---|---|:--:|
| 1 | 최근 본 항목 | 추적 없음 | localStorage 5개 + 홈/검색 노출 | **MAJ** |
| 2 | 관련 항목 | 직업/진령 카드에 텍스트 references만 | clickable RelatedItems 컴포넌트 | **MAJ** |
| 3 | 검색 UX v2 | input + filter | + 최근 검색어 + 0건 시 추천 + Enter 첫 결과 | **MAJ** |
| 4 | /me 허브 | 없음 (sub-pages만) | 통합 대시보드 + 빠른 이동 | **MIN** |
| 5 | 모바일 nav | sm: 미만 숨김 | 햄버거 + drawer | **MAJ** |

## 2. Recently Viewed 설계 (P3.A)

### 데이터 어댑터
- `lib/personalization/recently-viewed.ts` — pure functions (`get()`, `add(entry)`, `clear()`)
- localStorage key: `god-kkabi:recently-viewed:v1`
- Schema: `{ id, type, title, href, emoji?, viewedAtMs }[]` (max 5, FIFO)
- `'use client'` 사용처에서만 호출

### React Hook
- `hooks/use-recently-viewed.ts` — `useState` + `useEffect(() => sync from localStorage, [])` + 노출 함수
- SSR-safe: 서버에서는 빈 배열 반환

### Tracker 통합
- 기존 `components/feature/wiki-card-tracker.tsx`에 push 호출 추가
- 또는 별도 `useRecentlyViewedTrack(entry)` hook 사용

### UI
- `components/feature/recently-viewed-list.tsx` — 가로 스크롤 카드 row
- 홈 페이지 (Wiki Categories 아래) + /search 빈 query 시 표시

## 3. Related Items 설계 (P3.B)

### Cross-reference 매핑
- 직업 → recommendedJinryeong (이미 WIKI_CLASSES_SEED에 존재)
- 진령 → recommendedClasses (이미 WIKI_JINRYEONG_SEED에 존재)

### 컴포넌트
- `components/domain/related-items.tsx` — `<RelatedItems title="관련 진령" items={[{href, label, emoji?}]} />`
- 기존 ClassCard 하단 + JinryeongCard 하단에 통합 (또는 페이지 단위로)

## 4. Search v2 (P3.C)

### Recent Searches
- `lib/personalization/recent-searches.ts` — localStorage `god-kkabi:recent-searches:v1`
- max 8, FIFO, dedup (정규화 후)

### SearchResults 확장
- 빈 query → Recent Searches (있으면) + Popular Categories (V6 기존)
- 0 hits → 추천 검색어 (정적 키워드 set: "검객", "서해용왕", "999뽑기" 등)
- Enter 키 → 첫 결과로 navigate (router.push)

## 5. /me 허브 (P3.D)

`app/me/page.tsx` 신규:
- HeroMeta + SectionHead V4 패턴
- 사용자 정보 카드 (닉네임, 직업, 등록일)
- 빠른 이동 grid (북마크 N개 / 게시물 M개 / 구독 tier)
- 최근 본 항목 row

## 6. 모바일 드로어 (P3.E)

### 컴포넌트
- `components/feature/mobile-nav.tsx` — Radix Dialog 기반 (또는 shadcn Sheet)
- TopBar 좌측 햄버거 버튼 (모바일만 노출, sm: hidden)
- 클릭 시 좌→우 슬라이드 drawer
- 8 NAV_ITEMS 세로 리스트 + UserMenu 항목

## 7. 졸업 게이트

- [x] V6 종료 (typecheck/lint 0, 47 routes)
- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm lint` 0 errors + 0 warnings
- [ ] `pnpm build` 모든 route 통과 (+/me 신규)
- [ ] localStorage SSR 안전 (서버 빈 배열, 클라이언트 hydrate)
- [ ] 모바일 드로어 ESC + outside click + scroll lock

## 8. WBS

| Phase | 작업 |
|---|---|
| P0+P1+P2 | V6 tag 확인 + master plan |
| P3.A | recently-viewed adapter + hook + tracker + UI |
| P3.B | related-items domain component + 매핑 + 통합 |
| P3.C | recent-searches + suggested + Enter handler |
| P3.D | /me 허브 페이지 |
| P3.E | mobile-nav 컴포넌트 + TopBar 통합 |
| P4+P5+P6+P7+P8 | typecheck/lint/build + phase-4-check + tag v7.0.0-v7-archived |

## 9. 폐기 기준

| 시점 | 조건 | 액션 |
|------|------|------|
| P3.A SSR hydration mismatch | localStorage 서버 접근 | useEffect 가드 강화 |
| P3.E Radix Dialog 의존성 | 패키지 추가 필요 | shadcn Sheet 사용 (이미 설치) |
