#!/usr/bin/env bash
# scripts/test-e2e.sh — Sprint 13 / F13-A-7.
#
# Local Playwright 실행 wrapper.
#  - storageState 존재 검사 → 누락 시 사용자에게 안내 + 작업 중단
#  - tene 환경에서 secrets 주입 (선택)
#  - --project / --grep / --headed / --debug 플래그 그대로 전달
#  - --staging 플래그 시 staging.kkaebizigi.com 대상 (default: localhost dev)
#  - --setup 플래그 시 storageState 생성 안내 (현재는 manual 작업)
#
# 사용:
#   ./scripts/test-e2e.sh                              # localhost + chromium-desktop
#   ./scripts/test-e2e.sh --staging                    # staging.kkaebizigi.com
#   ./scripts/test-e2e.sh --project chromium-mobile    # mobile only
#   ./scripts/test-e2e.sh --grep "post-01"             # 특정 spec
#   ./scripts/test-e2e.sh --headed                     # browser 표시 (debug)
#   ./scripts/test-e2e.sh --setup                      # storageState 생성 안내

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

USE_STAGING=false
SETUP_MODE=false
PASSTHROUGH=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --staging) USE_STAGING=true ;;
    --setup) SETUP_MODE=true ;;
    *) PASSTHROUGH+=("$1") ;;
  esac
  shift
done

if [ "$SETUP_MODE" = true ]; then
  cat <<'EOM'

Test User StorageState Setup
────────────────────────────────────
e2e/.storage/{admin,regular,banned,new}.json 파일이 필요합니다.

Firebase 단일 prod 프로젝트 환경 (god-kkabi-guide) 정책상 자동 OAuth flow 는 위험합니다.
다음 순서로 수동 생성:

  1) Chrome 으로 staging.kkaebizigi.com 진입
  2) 각 role 별 Google 계정으로 로그인:
     - admin (Firebase Auth custom claims: role='admin')
     - regular (role='user', registered=true)
     - banned (role='banned')
     - new (registered=false — 첫 진입 user)
  3) DevTools > Application > Storage 에서 cookies + localStorage export
  4) Playwright 의 page.context().storageState({ path: '...' }) 또는
     수동으로 JSON 작성:
       {
         "cookies": [...],
         "origins": [{ "origin": "https://staging.kkaebizigi.com", "localStorage": [...] }]
       }
  5) e2e/.storage/{role}.json 으로 저장 (gitignore)

또는 Playwright 가 제공하는 codegen 도구 활용:
  pnpm playwright codegen --save-storage=e2e/.storage/regular.json https://staging.kkaebizigi.com

CI 에서는 위 4개 JSON 을 base64 인코딩하여 GitHub secret 으로 등록:
  E2E_STORAGE_{ADMIN,REGULAR,BANNED,NEW}_B64
─────────────────────────────────────

EOM
  exit 0
fi

# storageState 검사 — 누락 시 setup 안내
MISSING=()
for role in admin regular banned new; do
  if [ ! -f "e2e/.storage/${role}.json" ]; then
    MISSING+=("$role")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "⚠️  storageState 누락: ${MISSING[*]}" >&2
  echo "   ./scripts/test-e2e.sh --setup 으로 생성 안내 확인" >&2
  echo "   또는 미인증 test 만 실행: --grep \"anonymous\" 사용" >&2
  echo
fi

# E2E_BASE_URL 설정
if [ "$USE_STAGING" = true ]; then
  export E2E_BASE_URL="https://staging.kkaebizigi.com"
  echo "→ E2E_BASE_URL: $E2E_BASE_URL (staging)"
else
  export E2E_BASE_URL="${E2E_BASE_URL:-http://localhost:3000}"
  echo "→ E2E_BASE_URL: $E2E_BASE_URL (local)"
fi

# tene 가용 시 secrets 주입 (FIREBASE_SERVICE_ACCOUNT_JSON 등 seed-data 가 필요)
if command -v tene >/dev/null 2>&1 && [ -d ".tene" ]; then
  echo "→ tene secrets 주입 (interactive)"
  exec tene run -- pnpm playwright test "${PASSTHROUGH[@]}"
else
  echo "→ tene 미사용 — env 변수 그대로 사용"
  exec pnpm playwright test "${PASSTHROUGH[@]}"
fi
