# Sprint 28 — PRD (V3 GA Stabilization — 인프라 안정화 + 회귀 방지)

> Sprint 28 V3 GA 안정화 — 누적 사고 3건 + 회귀 방지 + carry P0 처리.

**작성일**: 2026-05-20
**작성자**: kay@agentkay.it (Sprint 27 archive 직후, 결함 발견 후 시작)

---

## 0. 배경 — 발견된 결함 3건

Sprint 25~27 진행 중 다음 3건의 누적 사고가 식별됨:

### 사고 #1 — Vercel staging.kkaebizigi.com 4시간 동안 옛 코드 노출

- PR #134 (10:12 UTC, 2026-05-20) 머지 후 staging 브랜치 deployment 가 PR #135~#148 머지로 14개 단절
- 원인: Vercel SHA dedupe + 머지 폭주 + Hobby tier 정책
- 영향: 사용자가 Sprint 25 c (metadata) + Sprint 26 (Sentry / 운영자 UI) + Sprint 27 a/b/c (Infinity fix / lib/auth / HowTo+FAQ) 모든 변경사항이 staging 에 안 보이는 상태
- 임시 해결: PR #149 머지 + vercel CLI 로 staging.kkaebizigi.com 수동 alias (시간 21:24 KST)

### 사고 #2 — Sprint 27 F27-C visible-content 미완

- HowTo (/skill) + FAQ (/class, /jinryeong) schema 가 JSON-LD 만 주입되고 가시 콘텐츠는 페이지에 추가 안 됨
- 원인: 작업자(나)가 design.md §3 "페이지 가시 콘텐츠와 1:1 매칭" 요구를 코드에 반영 못 함
- 영향: Google rich result 가이드라인 위반 + 사용자 가시성 0
- 임시 해결: PR #149 hotfix 로 visible HowTo 5단계 + FAQ Q&A 가시 섹션 추가

### 사고 #3 — E2E 1주일째 100% fail

- `e2e/emulator/auth-token-helper.ts:54` 의 `page.evaluate(async () => { await import('firebase/auth') })` 가 브라우저 컨텍스트에서 bare module specifier resolve 실패
- 원인: Sprint 14 (2026-05-13) 도입 시점부터 broken — 머지와 무관
- 영향: 1주일 동안 E2E 결과 전부 무의미. 운영자/사용자가 E2E 결과 신뢰 못함

---

## 1. Goal & Non-Goal

### Goal

- **G1 (P0)**: Vercel staging auto-deploy 안정화 → 사고 #1 재발 방지
- **G2 (P0)**: E2E auth-token-helper 수정 → 사고 #3 해결
- **G3 (P0)**: Structured data visible-content 회귀 방지 단위 테스트 → 사고 #2 재발 방지
- **G4 (P1)**: lib/auth/auth.ts + register.ts coverage 50%+ (Sprint 27 carry)
- **G5 (P1)**: Chrome QA 8 페이지 7-Layer + visible-text 매트릭스 (사용자 요청 정확 반영)

### Non-Goal

- SENTRY_DSN production 등록 (사용자 명시 action — Sprint 29 carry)
- Sentry alarm 정책 운영 (Pro+ 기능, 사용자 결정 필요)
- Vercel Hobby → Pro upgrade (사용자 결정 필요)
- HowTo schema 다른 페이지 확장 (Sprint 29 carry)

---

## 2. 사용자 시나리오

### Scenario A — Vercel staging auto-deploy (G1)

1. 운영자가 PR 머지
2. GitHub Action `staging-alias-sync` 가 자동 실행:
   - staging 브랜치 head SHA 로 Vercel API 조회
   - 매칭 deployment 가 있으면 alias set
   - 없으면 PR head deployment 로 fallback
3. 5분 내 staging.kkaebizigi.com 갱신

### Scenario B — E2E 정상 작동 (G2)

1. PR open / staging push 시 E2E workflow trigger
2. Playwright 가 emulator + Next.js dev 위에서 a11y / regression test 실행
3. `loginAs(page, 'regular')` 가 정상 작동 (브라우저 컨텍스트 import 회피)
4. 모든 test 통과 → Vercel 배포 trust 회복

### Scenario C — Structured data 회귀 방지 (G3)

1. 개발자가 HowTo step 또는 FAQ Q&A 콘텐츠를 페이지에서 누락
2. CI 단위 테스트가 JSON-LD 와 visible-text 의 1:1 매칭 검증
3. 매칭 실패 시 PR fail → 결함이 staging 에 머지되기 전 차단

---

## 3. 성공 기준 (DoD)

| ID | Criterion |
|---|---|
| DoD-1 | `.github/workflows/staging-alias-sync.yml` 추가 + 1 회 실행 성공 |
| DoD-2 | E2E auth-token-helper.ts 수정 + PR head E2E 통과 (3 projects: chromium-desktop / chromium-mobile / webkit-mobile) |
| DoD-3 | visible-content 회귀 방지 테스트 +4 (skill HowTo + class/jinryeong/advanced FAQ) — 통과 |
| DoD-4 | lib/auth coverage 51.34% → 60%+ (auth.ts + register.ts 통합 mock) |
| DoD-5 | Chrome QA 8 페이지 visible-text + view-source 매트릭스 문서화 |
| DoD-6 | Sprint 28 종합 보고서 + Sprint 29 carry |
| DoD-7 | 사용자 명시 승인 후 archive (앞으로 모든 머지도 user-gated) |

---

## 4. 위험 / 의존성

- **R1**: GitHub Action 에 VERCEL_TOKEN secret 필요 — 사용자 action (`tene set` 또는 GitHub secret 등록)
- **R2**: E2E auth-token-helper 수정이 firebase emulator 설정 변경 필요할 수 있음
- **R3**: lib/auth/auth.ts NextAuth init 패턴이 vi.mock 으로 풀기 까다로움 — 별도 hoist 패턴 필요

---

## 5. 측정 지표

- Coverage Lines: 76.43% → **78%+** (DoD-4 stretch)
- E2E pass rate: 0% → **100%** (DoD-2)
- staging.kkaebizigi.com 자동 갱신 latency: ∞ → **<5분** (DoD-1)
- visible-text 회귀 보호: 0 → **4 페이지** (DoD-3)

---

## 6. 사용자 새 규칙 (Sprint 28부터 영구 적용)

> **앞으로 staging 머지는 사용자 명시 승인 후만**.

본 sprint 도 PRD/Plan/Design + 각 feature PR 생성까지만 자동 진행, **머지는 사용자가 "머지해" 등 명시한 후에만**.

---

## 7. 참고

- Sprint 27 report.md §5 carry items
- Sprint 25 design.md F25-C JSON-LD 패턴 (이번 sprint 에서 회귀 방지 테스트로 확장)
- e2e/emulator/auth-token-helper.ts:54 (1주일 broken)
- 사용자 메모리: `feedback_pr_merge_approval.md`
