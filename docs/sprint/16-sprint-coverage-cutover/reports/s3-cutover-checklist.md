# S3 Staging Cutover Checklist — Sprint 16 / F16-G

> Sprint 14 의 emulator Storage 모드에서 staging S3 (실 AWS) 로 cutover 시 안전 체크리스트.
> prod cutover 도 동일 절차 적용 가능 — 단, prod 는 별도 sprint 의 prod-cutover-checklist
> 와 함께 이중 검증.

**작성일**: 2026-05-19
**대상**: staging 환경 (`https://staging.kkaebizigi.com`)
**의존**: Sprint 11 (Storage Images), Sprint 14 (Emulator), Sprint 15 (Storage e2e)

---

## 1. 환경 변수 비교

### 1.1 Emulator vs Staging 분기

| 변수 | Emulator | Staging |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_USE_EMULATOR` | `true` | (unset) |
| `FIREBASE_USE_EMULATOR` | `true` | (unset) |
| `NEXT_PUBLIC_E2E_MODE` | `true` | (unset) |
| `STORAGE_PROVIDER` (가상) | `emulator` | `s3` |
| `AWS_REGION` | (미사용) | `ap-northeast-2` |
| `AWS_S3_BUCKET_*` | (미사용) | tene 의 prod secret |
| `AWS_ACCESS_KEY_ID` / `SECRET` | (미사용) | tene 의 prod secret |
| `NEXT_PUBLIC_CDN_BASE_URL` | `http://localhost:9199/...` | `https://cdn-staging.kkaebizigi.com` |

### 1.2 사전 점검 명령

```bash
# tene 의 staging env 에 필요한 secret 확인
tene env staging
tene list

# 다음이 모두 존재해야 함:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_S3_BUCKET_POSTS
# - AWS_S3_BUCKET_CHAT
# - AWS_S3_BUCKET_PROFILES
# - NEXT_PUBLIC_CDN_BASE_URL=https://cdn-staging.kkaebizigi.com
```

---

## 2. AWS S3 정책 점검

### 2.1 IAM Policy

각 bucket 의 IAM policy 가 다음 action 허용:
- `s3:PutObject` (presigned URL 발급용)
- `s3:GetObject` (CloudFront origin)
- `s3:DeleteObject` (delete-image)
- `s3:ListBucket` (운영 도구용)

prefix 정책:
- `posts/*`
- `chat/*`
- `profiles/*`

### 2.2 CORS Rule (각 bucket)

```json
[
  {
    "AllowedOrigins": [
      "https://staging.kkaebizigi.com",
      "https://kkaebizigi.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 2.3 Lifecycle Rule

- `posts/*`: 운영 정책에 따라 — 영구 보관 또는 90일 후 IA (Infrequent Access)
- `chat/*`: 30일 후 자동 삭제 (운영 정책)
- `profiles/*`: 영구 보관 (사용자 사진)

### 2.4 Tag

모든 S3 bucket 에 `kkaebizigi` tag 부착 (Sprint 11 의 prod 정책).

---

## 3. CloudFront 정책

### 3.1 Distribution

- Origin: 각 S3 bucket
- Origin Access Identity (OAI) 또는 OAC (Origin Access Control) 활용
- TTL: `max-age=31536000, immutable` (이미지 hash 기반 URL)

### 3.2 Custom Domain

- `cdn-staging.kkaebizigi.com` → CloudFront distribution (staging)
- `cdn.kkaebizigi.com` → CloudFront distribution (prod, 별도)

### 3.3 Cache Invalidation 절차

```bash
aws cloudfront create-invalidation \
  --distribution-id E1XXXXXXXXX \
  --paths "/*"

# 또는 특정 path 만:
aws cloudfront create-invalidation \
  --distribution-id E1XXXXXXXXX \
  --paths "/posts/*"
```

---

## 4. Presigned URL 정책 점검

| 항목 | 값 | 출처 |
|---|---|---|
| TTL | 5분 (300s) | Sprint 11 / Phase B |
| ContentType 화이트리스트 | jpeg/png/webp/gif | `lib/storage/types.ts` |
| Max size | 클라이언트 압축 후 < 1MB | `lib/storage/upload-*.ts` |
| Rate limit | 분당 10건 / 사용자 | `lib/storage/upload-rate-limit.ts` |

---

## 5. Cutover 절차

### 5.1 사전 (T-30분)

- [ ] Sprint 14 F14-K 의 cleanup script 로 emulator [TEST-Sprint14] 데이터 0 확인
- [ ] tene 의 staging env 에 AWS secret 모두 존재 확인 (`tene list`)
- [ ] S3 bucket lifecycle / CORS / IAM 모두 정책 일치 확인
- [ ] CloudFront distribution status: Deployed
- [ ] DNS `cdn-staging.kkaebizigi.com` → CloudFront 도메인 CNAME 확인

### 5.2 cutover 시점 (T0)

- [ ] Vercel project env 의 `NEXT_PUBLIC_FIREBASE_USE_EMULATOR` 제거
- [ ] Vercel project env 의 `STORAGE_PROVIDER=s3` (또는 default branch)
- [ ] `git push staging → main` (Vercel auto deploy)
- [ ] Deploy 완료 후 staging.kkaebizigi.com 진입 검증

### 5.3 직후 (T+10분 smoke)

다음 페이지를 사용자 실 세션으로 확인:
- [ ] `/me/profile` — 프로필 이미지 upload 시 S3 + CloudFront URL 발급
- [ ] `/post/new` — 게시물 이미지 upload + CloudFront 노출
- [ ] `/chat/server-S785` — 채팅 이미지 upload + CloudFront 노출
- [ ] `/post/{id}` — 기존 firebase storage URL (legacy) 정상 노출 (회귀 보호)

### 5.4 24h 모니터링

| 메트릭 | 임계값 | 대응 |
|---|---|---|
| S3 PutObject 성공률 | > 99% | < 95% 시 IAM/CORS 점검 |
| CloudFront 4xx | < 0.1% | 1% 초과 시 cache invalidation |
| CloudFront 5xx | < 0.05% | 0.5% 초과 시 origin 점검 |
| presigned URL 발급 실패 | < 1% | rate-limit 정책 검토 |
| Sentry storage error rate | < 0.1% | 0.5% 초과 시 rollback |

---

## 6. Rollback 절차

문제 발견 시:

1. Vercel dashboard → 직전 안정 배포 promote
2. AWS S3 + CloudFront 는 데이터 유지 (read-only 안전)
3. emulator 모드 임시 복귀 시:
   - Vercel env 의 `NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true` 설정
   - 단, 사용자 실 세션의 staging 진입은 emulator 모드로 가지 않음 (env 충돌)
4. Sentry / Vercel logs 분석 → incident postmortem 작성

---

## 7. Prod Cutover 시 추가 점검 (Sprint 17+)

본 staging cutover 통과 후 prod 적용 시:
- [ ] CloudFront prod distribution 별도 (`cdn.kkaebizigi.com`)
- [ ] tene 의 prod env 의 AWS secret 분리 (staging 과 별도 IAM)
- [ ] prod-cutover-checklist.md (Sprint 13 의 문서) 동시 점검
- [ ] 사용자 트래픽이 적은 시간대 (한국 새벽 3-5시) 진행

---

## 8. 본 체크리스트 사용 방법

PR 또는 GitHub issue 의 task list 로 복사하여 진행 추적. 완료 후 본 파일 갱신
(commit history 가 cutover audit log).

실제 cutover 는 **사용자 (kay@agentkay.it) 의 명시적 승인 후** 진행. 자동화 금지.
