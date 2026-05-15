# 운영자 사전 준비 체크리스트

> 작성일: 2026-05-15 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/02-sprint-mvp/plan.md` §2.2 (T-006 ~ T-011) + `docs/05-infra/environments.md`
> 목적: Master Plan §10.1 기반 Phase 1 게이트 검증 전 운영자가 직접 완료해야 할 사전 준비 8개 카테고리 점검

---

## 결과 요약

| 카테고리 | 항목 수 | ✅ 완료 | ⏳ 미완료 | 비고 |
|---------|--------|--------|---------|------|
| A. tene 시크릿 관리 | 4 | 4 | 0 | 21개 암호화 완료 |
| B. GitHub 저장소 | 4 | 4 | 0 | main+staging 브랜치 보호 활성 |
| C. Vercel 프로젝트 | 4 | 3 | 1 | GitHub App 연동 보류 |
| D. Firebase 프로젝트 | 4 | 4 | 0 | Spark Plan + Analytics 활성 |
| E. 도메인 | 3 | 0 | 3 | 운영자 직접 구매 필요 |
| F. AdSense | 2 | 0 | 2 | V1+ 예정 (MVP는 광고 없음) |
| G. 콘텐츠 정책 | 3 | 3 | 0 | content-policy.md 완성 |
| H. Phase 1 문서 산출물 | 5 | 3 | 2 | gtm-seed-guide + component-inventory 본 작업 완성 |
| **합계** | **29** | **21** | **8** | 완료율 72% |

---

## A. tene 시크릿 관리 (완료)

| # | 항목 | 상태 | 세부 내용 |
|---|------|------|---------|
| A-1 | tene 초기화 (vault 생성, 마스터 패스워드, 복구 키) | ✅ | `tene init` 완료. 복구 키 운영자 오프라인 보관 필수 |
| A-2 | tene 환경 3종 생성 (local / staging / prod) | ✅ | `tene env list` → local(active) / staging / prod 확인 |
| A-3 | NEXT_PUBLIC_FIREBASE_* 7개 시크릿 × 3환경 = 21개 등록 | ✅ | environments.md §7 확인. MEASUREMENT_ID = G-PBS54YVK5F 포함 |
| A-4 | `tene run -- pnpm dev` 명령으로 로컬 개발 시작 가능 | ✅ | Phase 3 do.A 스캐폴딩 후 즉시 사용 가능 |

**검증 명령**:
```bash
tene env list
# expected: local(active, 7 secrets) / staging(7 secrets) / prod(7 secrets)
```

---

## B. GitHub 저장소 (완료)

| # | 항목 | 상태 | 세부 내용 |
|---|------|------|---------|
| B-1 | GitHub repo `agent-kay-it/god-kkabi-guide` 생성 | ✅ | Public 또는 Private — 운영자 확인 |
| B-2 | `main` 브랜치 보호 활성 (required PR + CI 통과) | ✅ | environments.md §2 브랜치 정책 확인 |
| B-3 | `staging` 브랜치 생성 + 분리 | ✅ | `main`에서 분기 |
| B-4 | `.gitignore` 정밀 보강 (`.tene/` 포함) | ✅ | `.tene/` 디렉토리 절대 commit 금지 |

---

## C. Vercel 프로젝트 (부분 완료)

| # | 항목 | 상태 | 세부 내용 |
|---|------|------|---------|
| C-1 | Vercel 프로젝트 `agent-kay-project/god-kkabi-guide` 생성 | ✅ | projectId: `prj_4g0diSvSe4atumw7y0tsNyl2edAG` |
| C-2 | Vercel 환경변수 14개 등록 (Production 7 + Development 7) | ✅ | environments.md §9.1 옵션 C 채택 |
| C-3 | Vercel Preview env 7개 등록 | ⏳ | **보류 결정** — V1+ 시점에 Firebase staging 분리 시 등록 |
| C-4 | GitHub Vercel App 설치 (push 자동 배포 연동) | ⏳ | **보류** — Phase 3 do.D 첫 배포 시점에 운영자 직접 OAuth 처리 필요 |

**주의**: C-4 보류로 인해 Phase 3 do.D까지 수동 `vercel deploy` 명령으로 배포한다. GitHub push → Vercel 자동 배포는 C-4 완료 후 활성화.

---

## D. Firebase 프로젝트 (완료)

| # | 항목 | 상태 | 세부 내용 |
|---|------|------|---------|
| D-1 | Firebase 프로젝트 `god-kkabi-guide` 생성 (Spark Plan) | ✅ | kay@agentkay.it 소유 |
| D-2 | Firebase Analytics 활성화 (measurementId `G-PBS54YVK5F`) | ✅ | design.md §10.2 Sprint 0 보강 D2 확인 |
| D-3 | Firestore 데이터베이스 생성 (MVP `coupons` + `events` 컬렉션 활성 예정) | ✅ | Spark Plan — Phase 3 do.D T-060에서 초기 데이터 시드 |
| D-4 | Firebase 콘솔 Analytics > DebugView 접근 가능 확인 | ✅ | Phase 3 do.D T-062 검증 시 사용 |

---

## E. 도메인 구매 (미완료 — 운영자 직접 필요)

| # | 항목 | 상태 | 세부 내용 |
|---|------|------|---------|
| E-1 | 도메인 후보 Whois 가용성 확인 | ⏳ | 1순위 `gokkaebi-guide.com` / 2순위 `god-kkabi.kr` / 3순위 `갓깨비공략.kr` |
| E-2 | 도메인 구매 결제 (₩15K-30K/년) | ⏳ | **운영자 카드 결제 필요** — L4 자동 불가 (결제 행위). Phase 3 do.D T-065 시점에 처리 |
| E-3 | Vercel 도메인 연결 + DNS A/CNAME 설정 | ⏳ | 도메인 구매 완료 후 Phase 3 do.D T-066에서 AI 자동 처리 가능 |

**우선순위 가이드**:
- `gokkaebi-guide.com` — 영문 SEO 최적 (해외 이용자, Google 크롤러). **1순위**.
- `god-kkabi.kr` — 한국 .kr 도메인, 한국 로컬 SEO 유리. **2순위**.
- 두 도메인 모두 가용하면 `gokkaebi-guide.com`만 구매 후 `god-kkabi.kr` canonical redirect 고려 (V1+).

---

## F. AdSense (미완료 — V1 예정)

| # | 항목 | 상태 | 세부 내용 |
|---|------|------|---------|
| F-1 | Google AdSense 신청 (사이트 트래픽 기준 승인) | ⏳ | **V1+ 예정** (MVP는 광고 0개 — 차별점). M3 졸업 후 V1 진입 시 신청 |
| F-2 | AdSense Client ID tene 등록 (NEXT_PUBLIC_ADSENSE_CLIENT_ID) | ⏳ | F-1 승인 후 등록 |

---

## G. 콘텐츠 정책 문서 (완료)

| # | 항목 | 상태 | 세부 내용 |
|---|------|------|---------|
| G-1 | `docs/sprint/02-sprint-mvp/phase-1-plan/content-policy.md` 작성 | ✅ | D2 하이브리드 70/30 + 출처 명시 + 이미지 정책 + 분쟁 대응 |
| G-2 | 운영자 콘텐츠 작성 워크플로우 확인 | ✅ | 게임 플레이 → 큐레이션 → draft → 크로스 체크 → 출처 명시 → PR |
| G-3 | 법적 디스클레이머 문안 확정 | ✅ | design.md §11.2 / content-policy.md §3.5 |

---

## H. Phase 1 문서 산출물 (부분 완료 → 본 작업 완성)

| # | 항목 | 상태 | 세부 내용 |
|---|------|------|---------|
| H-1 | `docs/sprint/02-sprint-mvp/phase-1-plan/seo-keyword-50.md` | ✅ | 50 키워드 + 메타 태그 패턴 + JSON-LD + sitemap 우선순위 |
| H-2 | `docs/sprint/02-sprint-mvp/phase-1-plan/design-system-research.md` | ✅ | shadcn/ui + Magic UI 선정 결정 |
| H-3 | `docs/sprint/02-sprint-mvp/phase-1-plan/content-policy.md` | ✅ | D2 70/30 정책 |
| H-4 | `docs/sprint/02-sprint-mvp/phase-1-plan/gtm-seed-guide.md` | ✅ | 시드 채널 5개 + UTM 추적 + 30일 KPI (본 작업) |
| H-5 | `docs/sprint/02-sprint-mvp/phase-1-plan/component-inventory.md` | ✅ | 15종 명세 + cva + 의존성 그래프 (본 작업) |

---

## 운영자 즉시 액션 필요 항목 (⏳ 미완료)

| 우선순위 | 항목 | 시점 | 소요 시간 |
|---------|------|------|---------|
| P0 (Phase 3 do.A 직전) | 없음 — 스캐폴딩 즉시 시작 가능 | 지금 | — |
| P0 (Phase 3 do.D) | **E-2 도메인 구매 결제** | Week 7-8 | 30분 |
| P0 (Phase 3 do.D) | **C-4 GitHub Vercel App OAuth** | Week 7-8 | 15분 |
| P1 (V1 진입 후) | F-1 AdSense 신청 | M3 졸업 후 | 2시간 |
| P1 (V1 진입 후) | C-3 Vercel Preview env 등록 | V1 Firebase staging 분리 시 | 30분 |

---

## Phase 1 게이트 판정 (M1 designCompleteness ≥85)

Phase 1 plan 종료 게이트 (`plan.md` §2.3) 체크리스트:

- [x] 콘텐츠 정책 문서 완성 + 운영자 확인 — `content-policy.md` ✅
- [x] SEO 키워드 50개 카테고리화 완료 — `seo-keyword-50.md` ✅
- [x] 디자인 시스템 선정 완료 — `design-system-research.md` ✅
- [x] GTM 시드 가이드 완성 — `gtm-seed-guide.md` ✅ (본 작업)
- [x] 컴포넌트 인벤토리 15종 명세 완성 — `component-inventory.md` ✅ (본 작업)
- [x] tene 시크릿 21개 암호화 완료 — `environments.md` §7 ✅
- [x] GitHub + Vercel + Firebase 인프라 생성 확인 ✅
- [ ] 도메인 구매 — **Phase 3 do.D로 이연** (L4 자동 불가)

**판정**: Phase 1 plan 산출물 5/5 완성 + 인프라 핵심 3종(GitHub/Vercel/Firebase) ✅ + tene ✅.
도메인은 Phase 3 do.D에서 운영자 결제 후 진행. **Phase 2 design 진입 PASS**.

---

> **Status**: 검증 완료 (2026-05-15)
> **다음 단계**: Phase 2 design 보강 산출물 작성 → Phase 3 do.A 스캐폴딩
