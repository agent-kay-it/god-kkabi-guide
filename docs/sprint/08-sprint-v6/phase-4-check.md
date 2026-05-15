# Sprint V6 — Phase 4 Check Report

> 작성: 2026-05-16
> 출처: Sprint V6 PDCA L4 자동 실행 완료

## 1. Build Quality (게이트 통과)

| 항목 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ **0 errors** |
| `pnpm lint` | ✅ **0 errors / 0 warnings** |
| `pnpm build` (Next.js 16.2.6) | ✅ **47 routes** (V5 46 → V6 47, +1 `/search`) |

## 2. Sprint V6 산출물

### P3.A — 사이트 통합 검색
- `lib/search/wiki-search-index.ts` 신규 — 7 카테고리 (직업 3 + 진령 11 + 스킬 ~31 + 장비 ~12 + 콘텐츠 ~22 + 팁 ~12 + 문파 ~12) build-time index + `normalizeQuery` + `searchIndex(query, limit)` 점수 함수
- `app/search/page.tsx` 신규 — server component, `getSearchIndex()` 호출 → client에 props 전달
- `components/feature/search-results.tsx` 신규 — debounced input + URL ?q= sync + 카테고리 그룹화 + 인기 카테고리 빈 상태

### P3.B — TopBar 검색 진입
- `components/feature/top-bar.tsx` 갱신 — 우측에 magnifier `<Link href="/search">` + 'aria-label="사이트 검색 (단축키 /)"'
- 키보드 단축키 `/` 추가 — input/textarea/contentEditable focus 시 무시 (충돌 방지) → 그 외 `e.preventDefault()` + `router.push('/search')`

### P3.C — 북마크 대시보드 폴리시
- `components/feature/bookmark-list.tsx` — 정렬 모드 추가 (`latest` createdAtMs desc / `alpha` localeCompare ko)
- `app/me/bookmarks/page.tsx` — V4 SectionHead/Eyebrow/Title/Lead 적용

### P3.D — Admin V4 디자인 통일 (8 페이지)
- `/admin` (Moderation)
- `/admin/coupons` (Coupons)
- `/admin/external-signals` (ETL)
- `/admin/dictionaries` (Dictionary)
- `/admin/penalties` (Penalties)
- `/admin/posts/pending` (Posts)
- `/admin/b2b/clients` (B2B)
- `/admin/insights/pain` (NLP)

각 페이지 헤더 → `<HeroMeta>` + `<SectionHead><SectionEyebrow label /><SectionTitle as="h1" /><SectionLead /></SectionHead>` 패턴 통일.

### P3.E — SEO 인프라
- `app/sitemap.ts` 확장 — V2~V3 위키 9 + V4 신규 3 + V6 신규 1 + 도구 2 = 총 **15 정적 라우트** 등록 (이전: 1)
- `metadata.alternates.canonical` 추가: `/payment`, `/event`, `/advanced` (이전: 없음. `/search`는 신규 페이지에서 기본 포함)

## 3. 검색 인덱스 메트릭

```
직업    3 entries
진령   11 entries
스킬   ~31 entries
장비   ~12 entries
콘텐츠 ~22 entries
팁     ~12 entries
문파   ~12 entries
─────────────────
TOTAL  ~103 entries (build-time, cached)
```

매칭 점수:
- title prefix → 100
- title contains → 70
- description contains → 40
- token contains → 20
- 결과 정렬: score desc, limit 40

## 4. 무회귀 검증

- 모든 기존 V1-V5 페이지 build 통과
- TopBar 신규 search button + '/' 단축키 → 기존 nav menu / UserMenu 회귀 없음
- BookmarkList 정렬 추가 → 기존 필터/낙관적 제거 그대로 동작
- Admin 페이지 8개 헤더 변경 → 본문 (테이블/큐) 무손실

## 5. Carry-over (V6 → V7)

없음. V6은 master plan §1 격차 4건을 모두 해소.

향후 향상 후보 (정식 carry-over 아님):
- 한글 자소 분리 검색 (현재는 단순 substring) — 사용 데이터 확보 후 V7+에서 고려
- 검색 결과 미리보기 모달 (이동 없이 빠른 preview)
- per-page OG image 동적 생성 (`/class/[id]` 등 detail page 추가 시)
- robots index:true 전환 후 JSON-LD structured data 추가

## 6. 졸업 게이트 PASS

- [x] V5 종료 (typecheck/lint 0)
- [x] `pnpm typecheck` 0 errors
- [x] `pnpm lint` 0 errors + 0 warnings
- [x] `pnpm build` 47 routes 통과 (`/search` 신규)
- [x] 검색 페이지 ~103 항목 build-time 색인 + 카테고리별 결과 그룹
- [x] TopBar magnifier + '/' 키보드 단축키
- [x] 9 admin/bookmarks 헤더 V4 SectionHead
- [x] sitemap.xml 15 라우트 + canonical 점검
