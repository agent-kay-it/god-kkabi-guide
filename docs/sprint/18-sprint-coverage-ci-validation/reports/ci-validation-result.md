# CI Validation 결과 보고서 — Sprint 18 / F18-B + F18-C

> Sprint 17 의 webServer fix 적용 후 CI E2E 의 실 동작 검증 + Lighthouse 측정 시도.

**작성일**: 2026-05-19
**대상 workflow**: E2E + Lighthouse CI + Visual Baseline

---

## 1. F18-B — CI E2E webServer 실 동작 검증

### 1.1 Sprint 17 → Sprint 18 의 점진 fix

```
Sprint 17 / F17-C: Emulator UI port 4400 fix (ui.enabled=false)
   ↓ emulator 정상 시작 — but webServer 미기동
Sprint 18 / 초기: SHOULD_START_WEB_SERVER 조건 fix (CI 포함)
   ↓ webServer 시작 시도 — but "tene: not found"
Sprint 18 / F18-B 최종: tene 우회 fix
```

### 1.2 F18-B 최종 fix

**Root cause**: `pnpm dev` 가 `tene run -- next dev` 호출 → CI runner 에 tene 미설치.

**Fix**: `playwright.config.ts` 의 webServer command 를 CI 환경에서 직접 `npx next dev` 호출.

```typescript
command: IS_CI
  ? 'NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true NEXT_PUBLIC_E2E_MODE=true npx next dev --turbopack -p 3000'
  : process.env.E2E_USE_EMULATOR === 'true'
    ? 'NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true NEXT_PUBLIC_E2E_MODE=true pnpm dev'
    : 'pnpm dev',
```

- CI 에서는 tene 우회 (`npx next dev`) — workflow env 가 NEXT_PUBLIC_* 변수 주입
- Local 에서는 `pnpm dev` 유지 — tene 시크릿 관리 정책 보존

### 1.3 본 PR 의 검증

본 PR 머지 후 자동 트리거되는 E2E workflow 가 첫 spec 실행 단계까지 도달해야 함.
spec 실 통과 결과는 Sprint 19 carry — 잔여 spec fail iterate.

### 1.4 Visual baseline

`.github/workflows/visual-baseline.yml` 도 동일 fix 적용 필요. 본 PR 에 함께 포함.

---

## 2. F18-C — Lighthouse 5 URLs 분석 시도

### 2.1 시도 결과

최근 5 PR 의 Lighthouse CI 실행 모두 실패. 실패 원인:

```
Wait for Vercel preview: Could not find any deployments for actor vercel[bot]
... retry 20번 ...
##[error]no vercel deployment found, exiting...
```

### 2.2 Root cause

`lighthouserc.json` 의 측정 흐름:
1. Vercel preview deployment 대기 (`patrickedqvist/wait-for-vercel-preview@v1.3.2`)
2. preview URL 회수 후 Lighthouse 측정
3. 결과 PR comment

본 repo (agent-kay-it/kkaebizigi) 에는 **Vercel deployment integration 이 미설정** —
PR push 시 Vercel preview 가 생성되지 않으므로 Lighthouse 가 측정 불가.

### 2.3 측정 가능 방안

| 방안 | 비용 | 효과 |
|---|---|---|
| A. Vercel integration 활성화 | 0 (사용자 1회 설정) | preview 자동 + Lighthouse 자동 |
| B. staging.kkaebizigi.com 직접 측정 | 0 | lighthouserc.json 의 base URL 변경 |
| C. Lighthouse 로컬 측정 (운영자 수동) | 0 | pnpm dlx lighthouse <url> |
| D. CI 에서 next start 후 측정 | 5분 추가 빌드 | self-contained |

### 2.4 Sprint 19 carry

본 sprint 의 측정 미달. Sprint 19 P0 carry:
- 운영자 결정: 방안 A / B / D 중 선택
- 결정 후 lighthouserc.json 또는 workflow 갱신
- 5 URLs 측정 결과 + < 0.9 항목 분석

### 2.5 lighthouserc.json 의 5 URLs

현재 설정 (workflow comment 에 표시됨):
- `/`
- `/post`
- `/chat`
- `/me`
- `/search`

마스터 plan §2 F1.7 의 SEO 롱테일 페이지 와 부분 일치.

---

## 3. 본 PR 의 변경 요약

| 파일 | 변경 |
|---|---|
| `playwright.config.ts` | webServer command CI 분기 (tene 우회) |
| `docs/sprint/18-sprint-coverage-ci-validation/reports/ci-validation-result.md` | 본 보고서 |

---

## 4. Sprint 19 carry items (F18-B/C 후속)

1. **CI E2E spec 실 통과 확인** (P0) — 본 PR 머지 후 첫 dynamic run 결과
2. **Lighthouse 측정 인프라 결정** (P0) — Vercel integration / staging URL / CI self-contained 중 선택
3. **5 URLs 측정 데이터 분석** (P1) — 결정 후 실 측정 → < 0.9 항목 식별
4. **Visual baseline 첫 capture** (P1) — workflow_dispatch 1차 실행

---

## 5. 보안 + 안정성

- ✅ playwright.config.ts 변경은 CI 한정 (IS_CI 분기)
- ✅ 로컬 개발 환경 영향 없음 (tene 시크릿 관리 유지)
- ✅ NEXT_PUBLIC_* 변수만 사용 (server-side 시크릿 노출 없음)
