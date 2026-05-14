# 환경 정책 (local / staging / prod)

> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 입력: 운영자 결정 (2026-05-14) — tene 3개 환경 + GitHub 브랜치 전략
> 상태: Active

---

## 1. 환경 3종 매핑

| 환경 | 용도 | 트리거 | Vercel 배포 | Firebase 프로젝트 | tene env |
|------|------|--------|------------|-----------------|----------|
| **local** | 운영자 로컬 개발 (`next dev` / unit test) | `pnpm dev` 또는 `tene run -- pnpm dev` | (없음 — localhost:3000) | `god-kkabi-guide` (공유) | local |
| **staging** | 통합 테스트 + Chrome E2E 검증 | `git push origin staging` | Preview (`*-staging.vercel.app` 또는 staging 도메인) | `god-kkabi-guide` (공유) | staging |
| **prod** | 운영 (사용자 트래픽) | `git push origin main` | Production (`gokkaebi-guide.com` 추후) | `god-kkabi-guide` (공유) | prod |

**default 환경 (tene init 자동 생성)**: 0 secrets. **사용 안 함**. 향후 삭제 검토 (`tene env delete default`).

---

## 2. GitHub 브랜치 전략

```
main (prod)
  ↑ PR merge (Auto-deploy → Vercel production)
  │
staging (staging)
  ↑ PR merge (Auto-deploy → Vercel preview = staging URL)
  │
feature/*, fix/*  (작업 브랜치)
  → PR 생성 → CI 통과 → staging merge → main merge
```

### 브랜치 정책

| 브랜치 | 보호 정책 | 자동 배포 | 직접 push |
|--------|---------|---------|----------|
| `main` | required PR review + CI 통과 + linear history | Vercel production | ❌ 금지 |
| `staging` | required CI 통과 | Vercel preview (staging) | ✅ 허용 (긴급) |
| `feature/*`, `fix/*` | (없음) | Vercel preview (PR별) | ✅ |

### 배포 흐름 (L4 Aggressive 자동)

1. **개발**: `feature/xxx` 브랜치에서 작업 → `pnpm dev` (local 환경)
2. **PR**: `staging`으로 PR 생성 → CI (lint + test + build) + Chrome 자동 E2E
3. **staging 머지**: 자동 Vercel preview 배포 → staging Firebase 데이터로 검증
4. **main 머지**: 자동 Vercel production 배포 → 운영 트래픽

---

## 3. tene 사용법

### 환경 전환
```bash
tene env list                   # 현재 환경 + 시크릿 수 확인
tene env local                  # local 환경으로 전환
tene env staging                # staging으로 전환
tene env prod                   # prod로 전환
```

### 시크릿 주입 (개발/빌드/배포)
```bash
# Local 개발 (active 환경 = local)
tene run -- pnpm dev                              # http://localhost:3000

# Staging 배포 시뮬레이션
tene env staging
tene run -- pnpm build
tene run -- pnpm start                            # local에서 staging 시크릿으로 빌드

# Production CI/CD (Vercel에서 자동 — local tene 미사용, Vercel Env Vars 활용)
# Vercel은 별도로 환경변수 등록 필요 (다음 절 참조)
```

### 신규 시크릿 추가 (V1+ 시점)
```bash
# V1 Firebase Admin SDK (모더레이션용 — 모든 환경 공통)
for ENV in local staging prod; do
  tene set FIREBASE_SERVICE_ACCOUNT_JSON --stdin --env $ENV < ./serviceAccountKey.json
done
rm ./serviceAccountKey.json   # 등록 후 평문 JSON 즉시 삭제

# V1 AdSense
tene set NEXT_PUBLIC_ADSENSE_CLIENT_ID "ca-pub-XXXXX" --env prod
tene set NEXT_PUBLIC_ADSENSE_CLIENT_ID "" --env local --overwrite       # local은 빈 값
tene set NEXT_PUBLIC_ADSENSE_CLIENT_ID "" --env staging --overwrite

# V2 Stripe
tene set STRIPE_SECRET_KEY "sk_test_xxx" --env local
tene set STRIPE_SECRET_KEY "sk_test_xxx" --env staging
tene set STRIPE_SECRET_KEY "sk_live_xxx" --env prod
```

---

## 4. 환경 분리 정책 (V1+ 검토)

### 현재 (MVP)
- **Firebase 프로젝트 1개 공유** (`god-kkabi-guide`)
- staging과 prod가 같은 Firestore DB / Auth / Storage 사용
- ⚠️ **위험**: staging 테스트 데이터가 prod로 흘러갈 수 있음

### V1+ 권장 분리안 (Option A — 별도 Firebase 프로젝트)
- staging용 별도 Firebase 프로젝트 `god-kkabi-guide-staging` 생성
- staging 환경 시크릿 7종 모두 별도 값으로 갱신
- 장점: 데이터 완전 격리
- 단점: Spark Plan 2개 (DAU 한도 분산), 시크릿 관리 부담 ↑

### V1+ 권장 분리안 (Option B — Firestore 컬렉션 prefix)
- 같은 Firebase 프로젝트 유지
- staging 환경에서는 `staging_builds`, `staging_comments` 등 prefix
- 장점: 무료 한도 공유, 시크릿 단순
- 단점: 코드에서 환경별 prefix 분기 필요

### 의사결정 시점
- MVP M3 종료 시점 (Phase 7 report)에 결정
- V1 진입 결정 시 Option A vs B 선택

---

## 5. Vercel 환경변수 등록 (CI/CD)

Vercel은 tene와 별개로 자체 환경변수 시스템을 가집니다. CI/CD에서는 tene가 동작하지 않으므로 Vercel 대시보드에 등록 필요.

### Vercel 환경별 변수 매핑

```bash
# vercel CLI로 등록 (--scope 또는 vercel link 후 dashboard)
# Vercel Environment: Development / Preview / Production

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# 입력 프롬프트 → tene 값 복사하여 입력

# 또는 자동화 (tene에서 pull → vercel에 push, V1+ CI에서 처리):
tene run --env prod -- bash -c '
  for KEY in NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN NEXT_PUBLIC_FIREBASE_PROJECT_ID NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID NEXT_PUBLIC_FIREBASE_APP_ID NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; do
    echo "${!KEY}" | vercel env add $KEY production
  done
'
```

### Vercel 환경 매핑

| tene 환경 | Vercel Environment | 트리거 |
|----------|-------------------|--------|
| local | Development | `vercel dev` 실행 시 (로컬) |
| staging | Preview | `staging` 브랜치 push 또는 PR |
| prod | Production | `main` 브랜치 push |

---

## 6. 보안 정책

### Firebase Web API Key (현재 7개 키)
- ✅ **클라이언트 사이드 공개 키** — git public repo에 commit 가능
- ✅ Firestore 보안 규칙 + Firebase App Check로 실제 보안 처리
- ⚠️ 향후 강화: Firebase 콘솔 → 프로젝트 설정 → API 키 제한 → HTTP 리퍼러 도메인 화이트리스트 (V1+ 도메인 결정 후)

### Firebase Service Account JSON (V1+ 추가 예정)
- ❌ **서버 사이드 시크릿** — 절대 git commit 금지
- ✅ tene 등록 후 평문 파일 즉시 삭제
- ✅ Vercel은 Encrypted Environment Variable로 등록

### Vercel/GitHub 토큰 (V1+)
- ❌ 절대 평문 노출 금지
- ✅ `vercel tokens create` / `gh auth token`으로 발급
- ✅ tene에만 저장

---

## 7. 현재 등록 상태 (2026-05-14)

```
tene env list
  default ( 0 secrets) — 사용 안 함
* local (active, 7 secrets)
  prod ( 7 secrets)
  staging ( 7 secrets)
```

각 환경 7개 시크릿:
- NEXT_PUBLIC_FIREBASE_API_KEY (AIzaS*****)
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (god-k*****)
- NEXT_PUBLIC_FIREBASE_PROJECT_ID (god-k*****)
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (god-k*****)
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (63145*****)
- NEXT_PUBLIC_FIREBASE_APP_ID (1:631*****)
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (G-PBS*****)

---

## 8. 다음 단계 체크리스트

- [x] tene 3개 환경 생성 + 7 시크릿 × 3 환경 = 21개 등록 완료
- [x] `.gitignore` 정밀 보강 완료
- [ ] GitHub repo `god-kkabi-guide` 생성 + `main` + `staging` 브랜치 분리
- [ ] Vercel 프로젝트 `god-kkabi-guide` 연결 + GitHub 연동 + 환경 매핑
- [ ] Vercel 환경변수 7종 × 3 환경 = 21개 등록 (Production / Preview / Development)
- [ ] Firebase 프로젝트 god-kkabi-guide 권한 확인 (kay@agentkay.it 계정)
- [ ] Sprint MVP design.md에 Firebase Analytics 통합 반영
- [ ] `/sprint start god-kkabi-guide-sprint-mvp` 실행
