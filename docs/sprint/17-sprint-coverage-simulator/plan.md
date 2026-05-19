# Sprint 17 Plan — Feature 별 Task Breakdown

> Sprint 17 PRD 의 8 features 를 PR / task 단위로 분해.
> 모든 feature 는 squash merge PR 1개로 staging 진입.

**작성일**: 2026-05-19
**의존**: prd.md
**Trust Level**: L4 (full-auto)

---

## F17-A — lib/ unit test 확대 part 3 (5+ 모듈)

**목적**: Sprint 16 의 20.62% 에서 35%+ 로 이동.

**대상 모듈 (5+)** — 현재 0% 또는 저커버리지 모듈 우선:

| 모듈 | 현재 lines | 목표 |
|---|---|---|
| lib/personalization/bookmark-store.ts | 0% (의심) | 80%+ |
| lib/wiki/queries.ts | 0% | 60%+ (Firestore mock) |
| lib/post/reaction-aggregator.ts | 0% (의심) | 80%+ |
| lib/auth/role-helpers.ts | 0% | 90%+ |
| lib/firebase/analytics-events.ts | 0% | 70%+ (mock window.gtag) |

**Task**:
1. 각 모듈의 export 함수 단위 분석
2. vitest 환경 분기 (jsdom vs node)
3. test 파일 작성 (lib/{module}/{file}.test.ts 또는 lib/{module}/__tests__/{file}.test.ts)
4. typecheck + lint pass
5. PR 작성 + squash merge

**예상**: 50+ tests / 1 PR

---

## F17-B — components/feature/ unit test 도입 (RTL + jsdom)

**목적**: lib/ 외 component/ coverage 0% → 시작점 확보.

**대상 컴포넌트 (5+)**:

| 컴포넌트 | 이유 |
|---|---|
| components/feature/build-tag.tsx | F16-B 의 build-tag.ts 와 짝 |
| components/feature/b2b-export-link.tsx | F16-D 의 a11y 점검 후속 |
| components/feature/post/url-preview-inline.tsx | 이미 .test.ts 존재 → RTL 보강 |
| components/feature/post/comment-mask-preview.tsx | masking 시각화 (F16-B 후속) |
| components/feature/recently-viewed-list.tsx | personalization (F16-B 와 짝) |

**Task**:
1. @testing-library/react 설치 확인 (이미 의존성 존재 가능)
2. vitest setup 파일에 jsdom 환경 분기 + globals 설정
3. 각 컴포넌트의 props / render / a11y assertion test 작성
4. snapshot test 회피 (changeable) — role/text/label 기반 assertion 우선

**예상**: 25+ tests / 1 PR

---

## F17-C — CI emulator dynamic run 첫 실행 + iterate

**목적**: Sprint 14/15/16 의 53 spec 이 emulator 환경에서 실 통과 확인.

**Task**:
1. GitHub Actions workflow_dispatch 트리거 — 모든 e2e 매트릭스 (chromium-desktop, chromium-mobile, webkit-mobile)
2. 결과 회수 (실패 spec 목록)
3. 실패 spec 별 fix iterate (max 5회)
4. CI green 확보 또는 iterate 한도 도달 시 잔여 spec carry

**예상**: dynamic verification + fix patches / 1 PR

---

## F17-D — 빌드 시뮬레이터 점검 + synergy 확장

**목적**: 마스터 §2 F3.1 (V2 P0) 의 빌드 시뮬레이터가 실제 사용자 가치를 전달하는지 점검.

**현재 자산**:
- lib/simulator/synergy-matrix.ts (Sprint 16 F16-A 에서 unit test 추가)
- /simulator 페이지 (app/simulator/)

**Task**:
1. /simulator 페이지의 현재 UX 분석 (UI 컴포넌트 / 상호작용 / 응답성)
2. synergy matrix 의 데이터 완성도 점검 (모든 진령 11종 + 클래스 4종 매트릭스)
3. synergy 결과 시각화 (현재 list / 향후 chart 가능성)
4. **개선 백로그 작성** (Sprint 18+ 후속) — 본 sprint 는 점검만, 신규 feature 추가 X
5. 점검 보고서: docs/sprint/17-sprint-coverage-simulator/reports/simulator-audit.md

**예상**: 점검 보고서 + 미세 수정 / 1 PR

---

## F17-E — Visual baseline workflow_dispatch 트리거 + diff 검증

**목적**: Sprint 16 F16-E 의 workflow 가 실 실행 시 정상 작동 확인.

**Task**:
1. workflow_dispatch 수동 트리거 (gh workflow run)
2. 결과 회수 (artifact: visual-baseline screenshots)
3. e2e/visual/baselines/ 디렉토리에 commit
4. 동일 페이지 재실행 시 diff 0 확인 (회귀 보호)
5. 결과 보고서: docs/sprint/17-sprint-coverage-simulator/reports/visual-baseline-result.md

**예상**: baselines 디렉토리 + 보고서 / 1 PR

---

## F17-F — Lighthouse perf 실측 + 5 URLs 분석

**목적**: Sprint 15 의 lighthouserc.json 가 staging 에서 실 측정값 기록.

**Task**:
1. Lighthouse CI 또는 lighthouse-cli 로 5 URLs 측정
   - /
   - /jinryeong (진령)
   - /class (직업)
   - /post (커뮤니티)
   - /me
2. perf / a11y / best-practices / seo 점수 회수
3. < 0.9 항목 분석 (어디서 점수 낙오)
4. 결과 보고서: docs/sprint/17-sprint-coverage-simulator/reports/lighthouse-perf-result.md
5. 개선 항목 Sprint 18 carry

**예상**: 측정 결과 + 보고서 / 1 PR

---

## F17-G — S3 staging cutover dry-run script + 시뮬

**목적**: Sprint 16 F16-G 의 체크리스트가 실제 작동 가능한지 사전 검증.

**Task**:
1. scripts/s3-cutover-dryrun.mjs 작성 (env / IAM / CORS / Lifecycle / CloudFront 점검 자동화)
2. AWS CLI 또는 SDK 로 dry-run 검증 (실 mutation 없음)
3. 결과 보고서: docs/sprint/17-sprint-coverage-simulator/reports/s3-dryrun-result.md
4. 실 cutover 는 사용자 명시 승인 후 별도 sprint

**중요**: tene 시크릿 management 규칙 준수 (NEVER `tene get` / `tene export`).

**예상**: dry-run script + 보고서 / 1 PR

---

## F17-H — lib/storage/upload-*-image.ts unit test (0% → 80%+)

**목적**: Sprint 16 coverage 측정 시 lib/storage/upload-{chat,post,profile}-image.ts 가 모두 0% lines.

**대상**:
- lib/storage/upload-chat-image.ts (line 10-137 미커버리)
- lib/storage/upload-post-image.ts (line 11-142 미커버리)
- lib/storage/upload-profile-image.ts (line 10-133 미커버리)

**Task**:
1. 각 함수의 input/output 분석
2. firebase storage + admin SDK mock 설정
3. presigned URL 생성 / upload / error case 테스트
4. ContentType validation / size limit / rate limit 검증

**예상**: 30+ tests / 1 PR

---

## 전체 일정

```
Phase 1: plan (본 문서) — done
Phase 2: design — 다음
Phase 3: do — F17-A ~ F17-H 순차 (혹은 병렬)
Phase 4: iterate — typecheck/lint/test 0
Phase 5: qa — DoD 10항 검증
Phase 6: report — KPI snapshot + lessons + Sprint 18 carry
Phase 7: archived — 사용자 승인 후
```

---

## 의존성 그래프

```
F17-A ──┐
        ├─→ F17-C (CI dynamic run, A 의 coverage 확보 후)
F17-B ──┘

F17-D (independent)
F17-E (independent)
F17-F (independent)
F17-G (independent)
F17-H (independent)
```

F17-A 와 F17-B 는 병렬 가능, F17-C 는 F17-A 결과 활용.
F17-D ~ F17-H 는 모두 독립적 — sequential dispatch 또는 parallel 가능.
