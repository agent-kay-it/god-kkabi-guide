#!/usr/bin/env bash
# Pretendard Variable woff2 subset 크기 검증
# 출처: docs/sprint/04-sprint-v1/phase-2-design/pretendard-subset.md §3.4
#
# 사용: bash scripts/verify-font-subset.sh
# 종료 코드: 0=OK, 1=초과
set -euo pipefail

FONT="public/fonts/PretendardVariable.woff2"
MAX_KB=500

if [ ! -f "$FONT" ]; then
  echo "❌ Font not found: $FONT" >&2
  exit 1
fi

# macOS: stat -f%z / Linux: stat -c%s
SIZE=$(stat -f%z "$FONT" 2>/dev/null || stat -c%s "$FONT")
SIZE_KB=$((SIZE / 1024))
MAX_BYTES=$((MAX_KB * 1024))

if [ "$SIZE" -gt "$MAX_BYTES" ]; then
  echo "❌ Font subset too large: ${SIZE_KB} KB (max ${MAX_KB} KB)" >&2
  echo "   pyftsubset 명령에서 --unicodes 범위 좁히기 또는 --no-glyph-names 추가 시도" >&2
  exit 1
fi

echo "✓ Font subset OK: ${SIZE_KB} KB (max ${MAX_KB} KB)"
