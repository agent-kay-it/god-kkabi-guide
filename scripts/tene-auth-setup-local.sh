#!/usr/bin/env bash
# Sprint 10 Phase B — tene local environment setup for NextAuth Google sign-in.
#
# Usage: bash scripts/tene-auth-setup-local.sh
# Prerequisites: tene CLI installed, master password ready, GCP OAuth client secret copied to clipboard.

set -euo pipefail

echo "[1/5] AUTH_URL → http://localhost:3000"
tene set AUTH_URL http://localhost:3000 --env local --overwrite

echo "[2/5] AUTH_TRUST_HOST → true"
tene set AUTH_TRUST_HOST true --env local --overwrite

echo "[3/5] AUTH_GOOGLE_ID → (GCP OAuth client ID)"
tene set AUTH_GOOGLE_ID \
  63145875132-p61oi894ksknp82b9ihf525h5impvavb.apps.googleusercontent.com \
  --env local --overwrite

echo "[4/5] AUTH_SECRET → openssl rand -base64 32 (pipe, never visible)"
openssl rand -base64 32 | tene set AUTH_SECRET --stdin --env local --overwrite

echo "[5/5] AUTH_GOOGLE_SECRET → paste from GCP console, then Ctrl+D"
echo "    위치: https://console.cloud.google.com/auth/clients/63145875132-p61oi894ksknp82b9ihf525h5impvavb.apps.googleusercontent.com?project=god-kkabi-guide"
tene set AUTH_GOOGLE_SECRET --stdin --env local --overwrite

echo ""
echo "✅ 완료. 확인: tene list --env local"
echo "다음 단계: tene run -- pnpm dev → http://localhost:3000/login"
