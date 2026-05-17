#!/usr/bin/env bash
# lighthouse-ci.sh — Sprint 10 / Phase F-final Task #31
#
# Lighthouse CI를 staging.kkaebizigi.com에 대해 desktop + mobile 모드로 실행.
# 출처: docs/sprint/10-sprint-launch/design.md §10 (Performance Budget)
#
# 사용:
#   ./scripts/lighthouse-ci.sh                 # desktop + mobile 둘 다
#   ./scripts/lighthouse-ci.sh --desktop       # desktop만
#   ./scripts/lighthouse-ci.sh --mobile        # mobile만
#   ./scripts/lighthouse-ci.sh --url <url>     # 다른 URL
#
# 사전 조건:
#   - Chrome 또는 Chromium 설치 (`brew install --cask google-chrome` on macOS)
#   - Node.js 20+
#   - 인터넷 연결 (staging.kkaebizigi.com 접근)
#
# lhci는 dlx로 호출 (devDep로 무겁게 가져오지 않음).
#
# Exit code: lhci 결과 그대로 전파 (assert 위반 시 1).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="both"
URL_OVERRIDE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --desktop) MODE="desktop" ;;
    --mobile) MODE="mobile" ;;
    --url) URL_OVERRIDE="$2"; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
  shift
done

# Chrome 감지
if ! command -v google-chrome >/dev/null 2>&1 \
  && ! command -v chrome >/dev/null 2>&1 \
  && ! command -v chromium >/dev/null 2>&1 \
  && ! [[ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]]; then
  echo "[lighthouse-ci] Chrome not found. Install:"
  echo "  macOS:   brew install --cask google-chrome"
  echo "  Linux:   apt install chromium-browser"
  exit 3
fi

run_lhci() {
  local config="$1"
  local label="$2"
  echo "[lighthouse-ci] running $label (config: $config)"
  if [[ -n "$URL_OVERRIDE" ]]; then
    pnpm dlx @lhci/cli@latest autorun --config="$config" --collect.url="$URL_OVERRIDE"
  else
    pnpm dlx @lhci/cli@latest autorun --config="$config"
  fi
}

case "$MODE" in
  desktop) run_lhci lighthouse-ci.json desktop ;;
  mobile)  run_lhci lighthouse-ci.mobile.json mobile ;;
  both)
    run_lhci lighthouse-ci.json desktop
    run_lhci lighthouse-ci.mobile.json mobile
    ;;
esac

echo "[lighthouse-ci] reports written to:"
[[ -d .lighthouseci ]] && echo "  desktop: $(ls .lighthouseci/*.html 2>/dev/null | head -1)"
[[ -d .lighthouseci-mobile ]] && echo "  mobile:  $(ls .lighthouseci-mobile/*.html 2>/dev/null | head -1)"
