#!/usr/bin/env bash
# Sprint 10 Phase B — tene local의 AUTH_GOOGLE_SECRET을 Vercel × 3 환경에 동기화.
#
# 사용법:
#   tene run --env local -- bash scripts/sync-auth-google-secret-to-vercel.sh

set -euo pipefail

if [ -z "${AUTH_GOOGLE_SECRET:-}" ]; then
  echo "❌ AUTH_GOOGLE_SECRET이 env var에 없습니다. tene run으로 실행하세요:"
  echo "   tene run --env local -- bash scripts/sync-auth-google-secret-to-vercel.sh"
  exit 1
fi

VERCEL_AUTH_FILE="$HOME/Library/Application Support/com.vercel.cli/auth.json"
if [ ! -f "$VERCEL_AUTH_FILE" ]; then
  echo "❌ Vercel auth file 없음. 'vercel login' 먼저 실행."
  exit 1
fi

export VERCEL_TOKEN=$(python3 -c "import json; print(json.load(open('$VERCEL_AUTH_FILE')).get('token',''))")
export VERCEL_PROJECT_ID=$(python3 -c "import json; print(json.load(open('.vercel/project.json'))['projectId'])")
export VERCEL_TEAM_ID=$(python3 -c "import json; print(json.load(open('.vercel/project.json'))['orgId'])")
export SECRET_KEY="AUTH_GOOGLE_SECRET"
export SECRET_VALUE="$AUTH_GOOGLE_SECRET"

python3 "$(dirname "$0")/_sync-secret-to-vercel.py"

echo ""
echo "검증: vercel env ls | grep AUTH_GOOGLE_SECRET"
