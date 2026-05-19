#!/usr/bin/env bash
# scripts/test-e2e.sh — Sprint 13 / F13-A-7 + Sprint 14 / F14-A.
#
# Local Playwright 실행 wrapper.
#  - --staging          → staging.kkaebizigi.com 대상 (default: localhost dev)
#  - --use-emulator     → Firebase emulator 모드 (Sprint 14 / F14-A)
#  - --setup            → storageState 생성 안내 (manual)
#  - --headed / --debug → Playwright 옵션 그대로 전달
#  - --grep <pattern>   → 특정 spec
#  - --project <name>   → 단일 project
#
# Emulator 모드는 staging URL 과 함께 사용 불가 — 충돌 시 에러.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

USE_STAGING=false
USE_EMULATOR=false
SETUP_MODE=false
PASSTHROUGH=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --staging) USE_STAGING=true ;;
    --use-emulator) USE_EMULATOR=true ;;
    --setup) SETUP_MODE=true ;;
    *) PASSTHROUGH+=("$1") ;;
  esac
  shift
done

if [ "$USE_STAGING" = true ] && [ "$USE_EMULATOR" = true ]; then
  echo "Error: --staging and --use-emulator are mutually exclusive" >&2
  exit 1
fi

if [ "$SETUP_MODE" = true ]; then
  cat <<'EOM'

Test User StorageState Setup
────────────────────────────────────
(Sprint 13 방식 — 인증된 사용자 Chrome 세션 기반)

Sprint 14 부터는 Firebase emulator 모드가 권장됨:
  ./scripts/test-e2e.sh --use-emulator
  → emulator suite 의 4 role test user 자동 사용 (storageState 불필요)

Staging 직접 검증이 필요할 경우에만 storageState 사용:
  1) Chrome 으로 staging.kkaebizigi.com 진입
  2) 각 role 별 Google 계정으로 로그인
  3) DevTools > Application > Storage 에서 cookies + localStorage export
  4) e2e/.storage/{role}.json 으로 저장 (gitignore)

CI 에서는 4 storageState JSON 을 base64 인코딩 → E2E_STORAGE_*_B64 secret 등록
─────────────────────────────────────

EOM
  exit 0
fi

if [ "$USE_EMULATOR" = true ]; then
  echo "→ Firebase emulator mode (Sprint 14 / F14-A)"

  if ! command -v java >/dev/null 2>&1; then
    echo "Error: java not found. Install: brew install --cask temurin@17" >&2
    exit 1
  fi

  if ! command -v firebase >/dev/null 2>&1 && ! command -v pnpm >/dev/null 2>&1; then
    echo "Error: firebase-tools required. Install: pnpm add -D firebase-tools" >&2
    exit 1
  fi

  export NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
  export FIREBASE_USE_EMULATOR=true
  export NEXT_PUBLIC_E2E_MODE=true
  export E2E_USE_EMULATOR=true
  export E2E_BASE_URL="${E2E_BASE_URL:-http://localhost:3000}"

  # emulator 가 이미 실행 중인지 확인 (포트 9099)
  if lsof -i :9099 >/dev/null 2>&1; then
    echo "→ Emulator already running on :9099 (reusing)"
  else
    echo "→ Starting Firebase emulator suite (background)"
    pnpm exec firebase emulators:start \
      --only auth,firestore,storage,database \
      --project demo-kkaebizigi-test \
      > .emulator.log 2>&1 &
    EMULATOR_PID=$!
    echo "  pid=$EMULATOR_PID (logs: .emulator.log)"
    trap "kill $EMULATOR_PID 2>/dev/null || true" EXIT

    # 포트 ready 대기
    for i in {1..60}; do
      if lsof -i :9099 >/dev/null 2>&1 && \
         lsof -i :8080 >/dev/null 2>&1 && \
         lsof -i :9199 >/dev/null 2>&1 && \
         lsof -i :9000 >/dev/null 2>&1; then
        echo "  emulator ready (attempt $i)"
        break
      fi
      sleep 1
    done
  fi

  exec pnpm playwright test "${PASSTHROUGH[@]}"
fi

# storageState 검사 — 누락 시 setup 안내 (legacy staging mode)
MISSING=()
for role in admin regular banned new; do
  if [ ! -f "e2e/.storage/${role}.json" ]; then
    MISSING+=("$role")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "storageState 누락: ${MISSING[*]}" >&2
  echo "   ./scripts/test-e2e.sh --use-emulator  (Sprint 14 권장)" >&2
  echo "   또는 ./scripts/test-e2e.sh --setup" >&2
  echo
fi

if [ "$USE_STAGING" = true ]; then
  export E2E_BASE_URL="https://staging.kkaebizigi.com"
  echo "→ E2E_BASE_URL: $E2E_BASE_URL (staging)"
else
  export E2E_BASE_URL="${E2E_BASE_URL:-http://localhost:3000}"
  echo "→ E2E_BASE_URL: $E2E_BASE_URL (local)"
fi

if command -v tene >/dev/null 2>&1 && [ -d ".tene" ]; then
  echo "→ tene secrets 주입 (interactive)"
  exec tene run -- pnpm playwright test "${PASSTHROUGH[@]}"
else
  echo "→ tene 미사용 — env 변수 그대로 사용"
  exec pnpm playwright test "${PASSTHROUGH[@]}"
fi
