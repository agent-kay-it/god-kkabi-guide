#!/usr/bin/env bash
# audit-clean-arch.sh — Sprint 10 / Phase F-final Task #29
#
# Bash wrapper for scripts/audit-clean-arch.mjs. CI 진입점 + 빠른 grep 보조 검증.
# 출처: docs/sprint/10-sprint-launch/design.md §1.1 (R1-R5)
#
# 사용:
#   ./scripts/audit-clean-arch.sh                  # mjs 호출 (full)
#   ./scripts/audit-clean-arch.sh --quick          # grep 전용 빠른 검증
#   ./scripts/audit-clean-arch.sh --report         # 보고서까지
#
# Exit code: mjs와 동일.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="full"
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --quick) MODE="quick" ;;
    --report) ARGS+=("--report") ;;
    --json) ARGS+=("--json") ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if [[ "$MODE" == "quick" ]]; then
  echo "[quick] Clean Arch grep audit"
  echo "─────────────────────────────"
  echo
  echo "R1 — domain → firebase/* (whitelist 제외):"
  ERR_COUNT=0
  while IFS= read -r line; do
    file="${line%%:*}"
    case "$file" in
      lib/post/image-upload.ts|lib/chat/image-upload.ts|lib/chat/send-message.ts|lib/chat/use-channel.ts)
        continue ;;
    esac
    echo "   $line"
    ERR_COUNT=$((ERR_COUNT + 1))
  done < <(grep -rn "from ['\"]firebase/" lib/post lib/chat lib/auth lib/b2b lib/bookmark lib/comment lib/coupon lib/insights lib/moderation lib/nlp lib/observability lib/penalty lib/personalization lib/reaction lib/search lib/simulator lib/subscription lib/wiki lib/etl 2>/dev/null || true)
  echo "   ($ERR_COUNT violations)"
  echo
  echo "R3 — 'use client' + firebase-admin:"
  R3_COUNT=0
  while IFS= read -r file; do
    if head -5 "$file" 2>/dev/null | grep -q "^['\"]use client['\"]"; then
      echo "   $file"
      R3_COUNT=$((R3_COUNT + 1))
    fi
  done < <(grep -rl "firebase-admin" lib app components 2>/dev/null || true)
  echo "   ($R3_COUNT violations)"
  echo
  if [[ $ERR_COUNT -eq 0 && $R3_COUNT -eq 0 ]]; then
    echo "[quick] PASS"
    exit 0
  else
    echo "[quick] FAIL — run full mode for details"
    exit 1
  fi
fi

# Full mode via mjs
exec node scripts/audit-clean-arch.mjs "${ARGS[@]}"
