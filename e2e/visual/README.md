# Visual Regression Baselines — Sprint 14 / F14-I

Playwright 내장 `toHaveScreenshot()` API 로 시각 회귀 검사.

## 첫 baseline 생성

```bash
# emulator 모드로 baseline 캡처
./scripts/test-e2e.sh --use-emulator -- --update-snapshots
```

이후 baseline PNG 들이 `e2e/visual/snapshots/{spec}/{name}-{project}.png` 에 저장됨.

## PR 마다 diff 비교

CI 의 e2e workflow 가 자동으로 diff 검사. threshold 1% 초과 시 fail + diff PNG artifact 업로드.

## Rebaseline (의도된 UI 변경 후)

새로운 commit 이 의도적으로 UI 를 바꿨을 때:

```bash
./scripts/test-e2e.sh --use-emulator -- --update-snapshots
git add e2e/visual/snapshots/
git commit -m "chore(visual): rebaseline after intentional UI change"
```

별도 PR (`chore(visual): rebaseline ...`) 으로 분리 권장.

## 안정화 정책

- animation duration → 0s 강제
- font ready 대기
- networkidle 대기
- Speed Insights / vercel.live 위젯 hide

## 25 path × 2 project = 50 baseline

Sprint 14 / F14-I 의 원래 plan 은 100 baseline. Public path 25개 × (chromium-desktop + chromium-mobile) = 50 capture. 추후 webkit-mobile + 인증 page 추가 시 100 도달.

## 디렉토리 구조

```
e2e/visual/
├── README.md (이 파일)
└── snapshots/
    └── visual/
        └── regression.spec.ts/
            ├── root-chromium-desktop.png
            ├── root-chromium-mobile.png
            ├── post-chromium-desktop.png
            └── ...
```
