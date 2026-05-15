# Sprint V6 — Discovery & Engagement

> **Sprint ID**: `god-kkabi-guide-sprint-v6`
> 작성일: 2026-05-16 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 입력: V5 종료 (typecheck/lint 0, 9 페이지 통일) + V5 carry-over 없음
> 모드: **/control level 4 — 완전 자동 PDCA**

## 한 줄 결론

**"V1-V5로 누적된 ~100여 위키 항목을 사용자가 즉시 발견할 수 있도록 (1) 사이트 통합 검색 + (2) 북마크 대시보드 폴리시 + (3) admin 페이지 V4 디자인 통일 + (4) sitemap/canonical 인프라를 추가하여 검색 도달성(discoverability)을 최대화한다."**

## 1. 격차 매트릭스

| # | 영역 | 현재 | 목표 (V6) | 우선순위 |
|--:|------|---|---|:--:|
| 1 | 사이트 검색 | 없음 (개별 페이지에서만 탐색) | `/search` + TopBar 진입 + 한글 자소 매칭 | **CRIT** |
| 2 | 북마크 대시보드 | 카테고리 필터만 | + 정렬 (최신/가나다) + count badge 정밀화 | **MAJ** |
| 3 | Admin 페이지 디자인 | V2 패턴 (title-gradient h1) | V4 SectionHead/Eyebrow/Title/Lead | **MAJ** |
| 4 | sitemap.xml | 일부 라우트만 | V4 신규 (/payment, /event, /advanced, /search) + canonical | **MIN** |

## 2. 검색 설계 (P3.A + P3.B)

### Index 구조
- Build-time 정적 JSON (`lib/search/wiki-search-index.ts` server module)
- 항목 ~100개 (직업 3 + 진령 11 + 스킬 31 + 장비 12 + 콘텐츠 22 + 팁 12 + 문파 12)
- 각 entry: `{ id, type, title, description, href, emoji?, tokens[] }`

### 매칭 전략
1. 정규화: lowercase + NFC normalize + whitespace collapse
2. Token substring match (Korean+English 단순)
3. Score: title hit > description hit
4. 선택적 한글 자소 분리 (`ㄱ` → `가/까/까/...`) — V6에선 단순 substring으로 시작, V7에서 자소 검색 고려

### `/search` 페이지
- Server: `getSearchIndex()` 호출 → JSON 직렬화 → client component에 props
- Client (`<SearchResults>`): debounced input + 카테고리별 결과 그룹
- Empty state: 인기 검색어 안내 (정적)

### TopBar 진입
- TopBar에 magnifier 아이콘 버튼 → `/search` 이동
- 키보드 단축키 `/` (input 외 focus일 때) → `/search` navigate

## 3. 북마크 대시보드 폴리시 (P3.C)

- 정렬 옵션 — '최신순' (createdAt desc) / '가나다순' (title asc)
- 빈 카테고리 메시지 정리
- (기존) 카테고리 필터 + 낙관적 제거 유지

## 4. Admin V4 디자인 (P3.D)

8 admin 페이지에 V4 SectionHead 적용:
- `/admin` (모더레이션)
- `/admin/coupons`
- `/admin/penalties`
- `/admin/dictionaries`
- `/admin/external-signals`
- `/admin/insights/pain`
- `/admin/posts/pending`
- `/admin/b2b/clients`

추가:
- `/me/bookmarks` 헤더도 V4로 통일

## 5. SEO 인프라 (P3.E)

- `app/sitemap.ts`에 신규 라우트 추가:
  - `/payment`, `/event`, `/advanced`, `/search`
- 페이지별 `metadata.alternates.canonical` 점검 — V4 신규 페이지 명시
- robots: index:false 유지 (1인 운영 정책)

## 6. 졸업 게이트

- [x] V5 종료 (typecheck/lint 0)
- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm lint` 0 errors + 0 warnings
- [ ] `pnpm build` 모든 route 통과 (+ /search 신규)
- [ ] 검색 페이지 100여 항목 색인 + 카테고리별 결과 그룹
- [ ] TopBar 검색 진입점
- [ ] 8 admin + bookmarks 헤더 V4 SectionHead
- [ ] sitemap.xml에 V4 + V6 신규 라우트 포함

## 7. WBS

| Phase | 작업 |
|---|---|
| P0+P1+P2 | V5 tag 확인 + master plan |
| P3.A | lib/search/wiki-search-index.ts + app/search/page.tsx + components/feature/search-results.tsx |
| P3.B | components/feature/top-bar.tsx 수정 + 키보드 hook + magnifier button |
| P3.C | components/feature/bookmark-list.tsx 정렬 추가 + /me/bookmarks 헤더 V4 |
| P3.D | 8 admin 페이지 V4 헤더 |
| P3.E | sitemap.ts + canonical 점검 |
| P4+P5 | typecheck/lint/build 통과 |
| P6+P7+P8 | phase-4-check.md + commit + tag v6.0.0-v6-archived |

## 8. 폐기 기준

| 시점 | 조건 | 액션 |
|------|------|------|
| P3.A 검색 인덱스 30분 초과 | 복잡도 폭증 | 자소분리 제거 / substring만 |
| P3.D 8개 페이지 회귀 5개 이상 | typecheck 실패 | 핵심 3개만 처리 |
