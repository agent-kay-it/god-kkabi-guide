# Firebase Emulator Suite — Sprint 14 / F14-A

이 디렉토리는 Sprint 14 의 통합 e2e 테스트를 위해 Firebase emulator (Auth + Firestore + Storage + Realtime Database) 를 사용하는 fixture / helper 를 제공한다.

## 로컬 실행

```bash
# 1. firebase-tools + Java 17 사전 설치
brew install --cask temurin@17
pnpm add -D firebase-tools

# 2. emulator suite 시작 (백그라운드)
pnpm exec firebase emulators:start --only auth,firestore,storage,database --project demo-kkaebizigi-test

# 3. 다른 터미널에서 dev server (emulator 모드)
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true NEXT_PUBLIC_E2E_MODE=true pnpm dev

# 4. 또 다른 터미널에서 Playwright
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true FIREBASE_USE_EMULATOR=true E2E_USE_EMULATOR=true \
  pnpm playwright test --project chromium-desktop

# 또는 wrapper:
./scripts/test-e2e.sh --use-emulator
```

## CI 실행

`.github/workflows/e2e.yml` 가 자동으로:
1. Java 17 + firebase-tools 설치
2. emulator 백그라운드 시작 + 포트 대기
3. Playwright 실행 with emulator env

## 환경 변수

| 변수 | 값 | 의미 |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_USE_EMULATOR` | `true` | 클라이언트 Firebase SDK 가 emulator 에 연결 |
| `FIREBASE_USE_EMULATOR` | `true` | Admin SDK 가 emulator 에 연결 |
| `E2E_USE_EMULATOR` | `true` | Playwright globalSetup 이 seed 실행 |
| `NEXT_PUBLIC_E2E_MODE` | `true` | AdSense / Sentry / Speed Insights 비활성화 |

## 4 Test User Roles

| Role | UID | Email | Claims |
|---|---|---|---|
| admin | `e2e-admin` | `e2e-admin@test.local` | `{ role: 'admin' }` |
| regular | `e2e-regular` | `e2e-regular@test.local` | `{ role: 'user', registered: true }` |
| banned | `e2e-banned` | `e2e-banned@test.local` | `{ role: 'banned' }` |
| new | `e2e-new` | `e2e-new@test.local` | `{ registered: false }` |

## 파일 구조

- `seed-fixtures.ts` — emulator seed (users + posts + dictionaries)
- `auth-token-helper.ts` — `loginAs(page, role)` 로 OAuth 우회
- `wait-for-emulator.ts` — emulator 포트 ready 폴링
