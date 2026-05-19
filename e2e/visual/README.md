# Visual Regression Baselines

Sprint 14 F14-I — Playwright 내장 `toHaveScreenshot()` API 로 시각 회귀 검사.
Sprint 15 F15-C — stabilize() 강화 (prefers-reduced-motion + lazy mount 등).
Sprint 16 F16-E — 자동 rebaseline workflow + 첫 capture 가이드.

---

## 1. 첫 baseline 생성 (한 번만, 로컬)

```bash
# emulator 모드로 baseline 캡처 (모든 project)
./scripts/test-e2e.sh --use-emulator -- e2e/tests/visual --update-snapshots
```

이후 baseline PNG 들이 `e2e/visual/snapshots/visual/regression.spec.ts/` 에 저장.
파일명 형식: `{path}-{project}.png` (예: `root-chromium-desktop.png`).

### 첫 capture 확인 단계

```bash
ls e2e/visual/snapshots/visual/regression.spec.ts/ | head -20
# root-chromium-desktop.png
# root-chromium-mobile.png
# post-chromium-desktop.png
# ...
```

baseline 을 git add → commit → push 하여 main branch 에 저장.

```bash
git add e2e/visual/snapshots/
git commit -m "chore(visual): initial baseline capture"
git push
```

---

## 2. CI 자동 검사 (PR 마다)

PR 생성 시 `.github/workflows/e2e.yml` 의 `e2e/tests/visual` spec 이 실행되어
baseline 과 비교. **threshold 1% 초과 시 PR fail + diff PNG artifact 업로드**.

PR fail 시 대응:
1. PR 의 sticky comment 에서 `playwright-test-results-{project}` artifact 다운로드
2. `npx playwright show-report` 로 diff 시각 확인
3. **의도된 변경** 이면 → §3 의 rebaseline workflow
4. **의도되지 않은 변경** 이면 → 원인 분석 (stabilize() 의 추가 강화 또는 코드 회귀)

---

## 3. 의도된 UI 변경 후 Rebaseline (Sprint 16 F16-E)

### 방법 A: GitHub Actions 자동 (권장)

1. GitHub Actions → "Visual Baseline Update" workflow → "Run workflow"
2. `reason`: 변경 이유 명시 (예: "Hero CTA 색상 변경")
3. `project`: 단일 project 또는 `all`
4. 실행 완료 후 자동 생성된 `chore/visual-rebaseline-{ts}` PR 검토 + merge

### 방법 B: 로컬 수동

```bash
# 1. UI 변경 commit 후
./scripts/test-e2e.sh --use-emulator -- e2e/tests/visual --update-snapshots

# 2. 별도 PR 로 분리
git checkout -b chore/visual-rebaseline-hero-cta
git add e2e/visual/snapshots/
git commit -m "chore(visual): rebaseline — Hero CTA 색상 변경"
git push -u origin chore/visual-rebaseline-hero-cta
gh pr create --title "chore(visual): rebaseline — Hero CTA"
```

---

## 4. 안정화 정책 (Sprint 15 F15-C 강화)

`e2e/tests/visual/regression.spec.ts` 의 `stabilize()` 함수:

1. `animation-duration: 0s` + `transition-duration: 0s` + `scroll-behavior: auto`
2. `prefers-reduced-motion: reduce` (emulateMedia)
3. Vercel toolbar / Speed Insights / vercel.live 위젯 숨김
4. `data-autoplay="true"` carousel 정지
5. `document.fonts.ready` 대기 (font-display: swap)
6. `networkidle` 대기 (RSC streaming 완료)
7. scroll bounce (lazy image mount 트리거)
8. 추가 500ms idle (image decode buffer)

→ 이 8가지 보장으로 **동일 commit 2회 실행 시 diff 0** (Sprint 16 검증).

---

## 5. 25 path × 3 project (Sprint 15 F15-D 의 webkit 추가 후)

| Project | Baseline 수 |
|---|--:|
| chromium-desktop (1440×900) | 25 |
| chromium-mobile (Pixel 7) | 25 |
| webkit-mobile (iPhone 14) | 25 |
| **합계** | **75** |

---

## 6. 디렉토리 구조

```
e2e/visual/
├── README.md (이 파일)
└── snapshots/
    └── visual/
        └── regression.spec.ts/
            ├── root-chromium-desktop.png
            ├── root-chromium-mobile.png
            ├── root-webkit-mobile.png
            ├── post-chromium-desktop.png
            ├── ...
            └── (총 75 PNG)
```

---

## 7. 회귀 트러블슈팅

### diff 가 항상 1% 초과 (font swap noise)

→ `stabilize()` 의 `document.fonts.ready` 가 동작하는지 확인. Pretendard
font subset (Sprint 12 F12-B-1) 이 적용되어야 함.

### lazy image 가 화면에 노출 안 됨

→ `stabilize()` 의 scroll bounce 가 충분히 트리거되지 않음. `triggerLazyMount`
헬퍼 (Sprint 15 F15-A) 사용 검토.

### Vercel toolbar 잔재

→ `stabilize()` 의 CSS 가 `iframe[src*="vercel.live"]` 까지 hide. 다른 selector
필요 시 README 갱신 + spec 의 stabilize() 강화.

### webkit-mobile 만 diff

→ Safari 의 font metric / image rendering 차이. webkit baseline 은 chromium 과
별도 파일로 저장되므로 자동 격리됨.
