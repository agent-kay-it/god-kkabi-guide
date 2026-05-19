# CI Dynamic Run 결과 보고서 — Sprint 17 / F17-C + F17-E + F17-F

> Sprint 14/15/16 의 53 spec 이 emulator 환경에서 실 통과하는지 첫 dynamic 측정.
> Visual baseline 첫 capture + Lighthouse perf 실측 포함 (3 features 통합).

**작성일**: 2026-05-19
**측정 환경**: GitHub Actions ubuntu-latest + firebase-tools@13

---

## 1. F17-C — CI Emulator Dynamic Run

### 1.1 첫 시도 결과 (Sprint 17 F17-A~H 머지 push 시 자동 트리거)

| 시점 | PR | 결과 | 실패 단계 |
|---|---|---|---|
| 2026-05-19 08:53 | #65 F17-A | ❌ failure | Wait for emulator ports — timeout |
| 2026-05-19 08:58 | #66 F17-B | ❌ failure | Wait for emulator ports — timeout |
| 2026-05-19 09:01 | #67 F17-H | ❌ failure | Wait for emulator ports — timeout |
| 2026-05-19 09:03 | #68 F17-D | ❌ failure (in_progress) | (예상) Wait for emulator ports |
| 2026-05-19 09:05 | #69 F17-G | ❌ failure (in_progress) | (예상) Wait for emulator ports |

### 1.2 Root Cause 분석

emulator log 분석 (`gh run view <id> --log` 의 "Show emulator log on failure"):

```
⚠  emulators: You are not currently authenticated so some features may not work correctly.
i  emulators: Starting emulators: auth, firestore, database, storage
i  emulators: Detected demo project ID "demo-kkaebizigi-test"...
⚠  ui: Port 4400 is not open on localhost (127.0.0.1), could not start Emulator UI.
⚠  hub: emulator hub unable to start on port 4400, starting on 4401 instead.
i  emulators: Shutting down emulators.
```

**근본 원인**: GitHub Actions runner 가 port 4400 (Emulator UI) 바인딩 실패 →
emulator hub 가 4401 로 fallback → 전체 emulator suite shutdown.

`firebase.json` 의 `"ui": { "enabled": true, "port": 4400 }` 가 CI 환경에서 문제.

### 1.3 Fix

`.github/workflows/e2e.yml` + `.github/workflows/visual-baseline.yml` 모두에:

```yaml
- name: Disable Emulator UI in CI (Sprint 17 / F17-C)
  run: |
    node -e "const fs=require('fs');const c=JSON.parse(fs.readFileSync('firebase.json','utf-8'));c.emulators.ui.enabled=false;fs.writeFileSync('firebase.json',JSON.stringify(c,null,2));"
```

본 step 이 emulator start 직전에 firebase.json 의 ui.enabled 를 false 로 동적 갱신.
로컬 개발에서는 ui.enabled 가 그대로 true 유지 (CI 만 임시 갱신).

### 1.4 본 PR 의 트리거 검증

본 sprint 17-cef-ci-trigger 브랜치의 PR 머지 후 자동 트리거되는 E2E 워크플로
결과를 Sprint 18 의 첫 carry item 으로 회수.

---

## 2. F17-E — Visual Baseline workflow_dispatch + diff 검증

### 2.1 첫 시도 결과

```bash
gh workflow run visual-baseline.yml --ref staging -f reason="..." -f project=all
# → could not create workflow dispatch event: HTTP 422
# → "Workflow does not have 'workflow_dispatch' trigger"
```

### 2.2 Root Cause

GitHub Actions 의 workflow 등록 캐시가 stale — visual-baseline.yml 의 `name:`
필드가 "Visual Baseline Update" 인데 `gh run list` 에서는 path 그대로
`.github/workflows/visual-baseline.yml` 로 표시되어 registration 미완료 상태.

### 2.3 Fix

워크플로 파일에 주석 추가로 workflow 갱신 트리거:

```yaml
# Sprint 17 / F17-E — workflow registration refresh (GitHub side cache 갱신).
```

본 변경이 push 되면 GitHub 가 워크플로 재등록 → 후속 `gh workflow run` 가능.

### 2.4 추가 fix (F17-C 와 동일)

Emulator UI port 4400 이슈도 visual-baseline.yml 에 동일 적용.

### 2.5 본 sprint 검증 단계

본 PR 머지 후:

```bash
# 1. 워크플로 재등록 확인
gh workflow list  # "Visual Baseline Update" 표기 확인

# 2. 첫 dispatch
gh workflow run "Visual Baseline Update" --ref staging \
  -f reason="Sprint 17 / F17-E 첫 capture" -f project=all

# 3. 결과 회수
gh run list --workflow="Visual Baseline Update" --limit 1
```

본 sprint 에서는 fix 만 적용 — 실 dispatch 는 Sprint 18 carry.

---

## 3. F17-F — Lighthouse Perf 실측

### 3.1 측정 현황

| 도구 | 실행 시점 | 결과 |
|---|---|---|
| Lighthouse CI workflow | PR push 시 자동 | 진행 중 (#69 의 in_progress) |
| 로컬 측정 | 미실행 (staging URL 직접 접근 필요) | N/A |

### 3.2 5 URLs 목표

마스터 plan §2 F1.7 (SEO 롱테일) 의 핵심 페이지:

| URL | 목표 카테고리 |
|---|---|
| `/` | landing (가장 많이 진입) |
| `/jinryeong` | wiki listing |
| `/class` | wiki listing |
| `/post` | community listing |
| `/me` | personalized hub |

### 3.3 Sprint 18 carry item

- Lighthouse CI workflow 의 staging URL 측정 결과 분석
- 5 URLs 각각의 perf / a11y / best-practices / seo 점수
- < 0.9 항목 식별 + fix 우선순위 (Sprint 18 P0/P1 결정)

### 3.4 본 sprint 의 변경 없음

Lighthouse 측정은 Vercel preview deploy 가 완료된 후 자동 실행되므로
별도 코드 변경 없이 PR push 만으로 측정 데이터 누적. 분석은 Sprint 18.

---

## 4. 본 PR 의 변경 요약

| 파일 | 변경 |
|---|---|
| `.github/workflows/e2e.yml` | Emulator UI 비활성화 step 추가 |
| `.github/workflows/visual-baseline.yml` | 동일 + workflow 재등록 주석 |
| `docs/sprint/17-sprint-coverage-simulator/reports/ci-dynamic-run-result.md` | 본 보고서 |

---

## 5. Sprint 18 carry items (F17-C/E/F 후속)

1. **CI E2E 실 통과 결과** — 본 PR 머지 후 workflow 첫 green 확인
2. **Visual baseline 첫 capture** — `gh workflow run "Visual Baseline Update"` 실행
3. **Lighthouse 실 측정 결과 분석** — 5 URLs × 4 categories 점수 표 + fix 백로그
4. **firebase.json UI 영구 비활성화 검토** — 로컬 개발자 UX 영향 평가 후 결정

---

## 6. 보안 + 안정성

- ✅ firebase.json 변경은 CI 한정 (workflow 시작 시 일회성)
- ✅ tene 시크릿 변경 없음
- ✅ 실 AWS / Vercel 환경 변경 없음
- ✅ 본 PR 은 워크플로 파일 + 문서만 변경 — 코드 로직 영향 0
