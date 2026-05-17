# Sprint 11 — Implementation Plan

**Sprint**: `sprint-11-images`
**상위 문서**: [prd.md](./prd.md)
**작성일**: 2026-05-17
**예상 기간**: 5일

---

## 0. 전략 — 작업 단위, 브랜치, PR

### 0.1 Branch 전략

```
main ─────────────────────────────────────────────●  (production)
                                    merge ↑↑↑↑↑↑
staging ──────────●─────────●─────────●─────────●  (preview)
                  ↑         ↑         ↑       ↑
              feature/  feature/  feature/  feature/
              11-A-aws  11-B-adp  11-C+D    11-E+F
                                   (병렬)
```

각 Phase는 `feature/sprint-11-<phase>-<scope>` 브랜치에서 작업 후 staging에 PR. staging 검증 후 main에 PR. main 머지가 production 자동 배포 트리거. Sprint 10과 동일한 흐름 유지.

### 0.2 PR 전략

- Phase 내 sub-task는 작은 commit 다수 + 단일 PR (squash 또는 merge commit)
- Phase 완료 시 PR 1건 (staging ← feature/...) → 리뷰 → squash merge
- staging 검증 후 PR (main ← staging) → merge commit (sprint 역사 보존)
- Phase C와 D는 병렬 진행 가능 — Phase B의 storage adapter 시그니처가 확정된 직후 분기

### 0.3 Commit Convention

```
<type>(<scope>): <subject>

[optional body]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

- `type`: feat / fix / refactor / chore / docs / test / perf / style
- `scope`: phase 약어 + 영역
  - `a-aws` — Phase A AWS Infrastructure
  - `b-adapter` — Phase B Storage Adapter
  - `c-post-ui` — Phase C Post Image UI
  - `d-chat-ui` — Phase D Chat Image UI
  - `e-opt` — Phase E Optimization
  - `f-quality` — Phase F Quality + Launch

### 0.4 Sprint 10 산출물 재사용 매트릭스 (Plan 단위 — PRD §1.3 보강)

| Sprint 11 작업 | 재사용 (Sprint 10 → 11) | 신규 |
|---|---|---|
| Phase A.6 CORS 설정 | `infra/cors.json` 패턴 → `infra/aws-s3-cors.json` 재작성 | AWS 콘솔 작업 |
| Phase B.3 Server Action | `app/api/og-preview/route.ts` 인증 + SSRF 방어 패턴 | `app/api/storage/presign/route.ts` |
| Phase B.5 unit test | `lib/post/ssrf-guard.test.ts` 패턴 (input 검증) | `lib/storage/presigned-url.test.ts` |
| Phase C.1 PostForm UI | `components/feature/post-form.tsx` `handleImageAdd` UI 자체는 Sprint 10 완성 | adapter call만 교체 |
| Phase C.5 PostInputSchema | `lib/post/schema.ts` `STORAGE_URL_RE` 변경 | — |
| Phase D.1 MessageComposer | `components/feature/chat/message-composer.tsx` rate limit + masking + URL preview 흐름 | ImageAttach 버튼 추가 |
| Phase D.2 MessageItem | `components/feature/chat/message-item.tsx` text/link/deleted variants | image variant 신규 |
| Phase D.3 message variant resolver | `lib/chat/message-variant.ts` text/link/deleted | image 케이스 |
| Phase D.4 RTDB rules | `database.rules.json` imageUrl regex | regex 변경 (firebasestorage → CDN) |
| Phase E.2 Clean Arch audit | `scripts/audit-clean-arch.sh` R1-R5 | R6 추가 |
| Phase F.1 Lighthouse | Sprint 10 baseline 흐름 | image-specific 항목 강화 |
| Phase F.4 E2E | `__tests__/e2e/` 디렉토리 패턴 | image-upload-post.spec.ts, image-upload-chat.spec.ts |

---

## 1. Phase A — AWS Infrastructure (0.5d, 4h)

### A.1 AWS 계정 + IAM user + MFA 확인

- **콘솔 작업** (Chrome MCP 자동화 가능):
  1. AWS Console 로그인 (root)
  2. IAM → MFA 활성화 확인 (root + admin user)
  3. 신규 IAM user `kkaebizigi-app` 생성 (programmatic access only, no console)
  4. Access key ID + Secret access key 발급 → Vercel env로 즉시 이동 (로컬 저장 금지)

- **검증**:
  - `aws sts get-caller-identity --profile kkaebizigi-app` → arn 확인
  - `aws s3 ls` → AccessDenied (정상 — list 권한 없음)

- **commit**: 없음 (콘솔 작업 only)

### A.2 S3 bucket 2개 생성 (prod / staging)

- **콘솔 또는 CLI**:
  ```bash
  aws s3api create-bucket \
    --bucket kkaebizigi-images-prod \
    --region ap-northeast-2 \
    --create-bucket-configuration LocationConstraint=ap-northeast-2 \
    --acl private

  aws s3api create-bucket \
    --bucket kkaebizigi-images-staging \
    --region ap-northeast-2 \
    --create-bucket-configuration LocationConstraint=ap-northeast-2 \
    --acl private
  ```

- **block public access**: 모두 ON (기본값 — CloudFront OAC만 접근)

- **commit**: 없음 (콘솔/CLI)

### A.3 IAM 최소권한 policy 적용

- **파일 신규**: `infra/aws-iam-policy.json`
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
        "Resource": [
          "arn:aws:s3:::kkaebizigi-images-prod/chat/*",
          "arn:aws:s3:::kkaebizigi-images-prod/posts/*",
          "arn:aws:s3:::kkaebizigi-images-prod/tmp/*",
          "arn:aws:s3:::kkaebizigi-images-staging/chat/*",
          "arn:aws:s3:::kkaebizigi-images-staging/posts/*",
          "arn:aws:s3:::kkaebizigi-images-staging/tmp/*"
        ]
      }
    ]
  }
  ```
- **명령**:
  ```bash
  aws iam create-policy \
    --policy-name kkaebizigi-app-policy \
    --policy-document file://infra/aws-iam-policy.json

  aws iam attach-user-policy \
    --user-name kkaebizigi-app \
    --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/kkaebizigi-app-policy
  ```

- **commit**: `chore(a-aws): IAM minimal policy for kkaebizigi-app user`

### A.4 S3 CORS 설정

- **파일 신규**: `infra/aws-s3-cors.json`
  ```json
  {
    "CORSRules": [
      {
        "AllowedOrigins": [
          "https://kkaebizigi.com",
          "https://www.kkaebizigi.com",
          "https://staging.kkaebizigi.com",
          "http://localhost:3000"
        ],
        "AllowedMethods": ["GET", "HEAD", "PUT"],
        "AllowedHeaders": ["Content-Type", "Content-Length", "x-amz-*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3600
      }
    ]
  }
  ```
- **명령**:
  ```bash
  aws s3api put-bucket-cors --bucket kkaebizigi-images-prod --cors-configuration file://infra/aws-s3-cors.json
  aws s3api put-bucket-cors --bucket kkaebizigi-images-staging --cors-configuration file://infra/aws-s3-cors.json
  ```

- **검증**: `aws s3api get-bucket-cors --bucket kkaebizigi-images-prod`

- **commit**: `chore(a-aws): S3 CORS config for kkaebizigi domains`

### A.5 S3 lifecycle policy

- **파일 신규**: `infra/aws-s3-lifecycle.json`
  ```json
  {
    "Rules": [
      {
        "ID": "expire-tmp-1d",
        "Status": "Enabled",
        "Filter": { "Prefix": "tmp/" },
        "Expiration": { "Days": 1 }
      },
      {
        "ID": "ia-30d-chat",
        "Status": "Enabled",
        "Filter": { "Prefix": "chat/" },
        "Transitions": [{ "Days": 30, "StorageClass": "STANDARD_IA" }]
      },
      {
        "ID": "ia-30d-posts",
        "Status": "Enabled",
        "Filter": { "Prefix": "posts/" },
        "Transitions": [{ "Days": 30, "StorageClass": "STANDARD_IA" }]
      }
    ]
  }
  ```
- **명령**:
  ```bash
  aws s3api put-bucket-lifecycle-configuration --bucket kkaebizigi-images-prod --lifecycle-configuration file://infra/aws-s3-lifecycle.json
  aws s3api put-bucket-lifecycle-configuration --bucket kkaebizigi-images-staging --lifecycle-configuration file://infra/aws-s3-lifecycle.json
  ```

- **commit**: `chore(a-aws): S3 lifecycle policy (tmp 1d / chat+posts IA 30d)`

### A.6 CloudFront distribution 2개 생성

- **콘솔 작업** (Chrome MCP 자동화 가능):
  1. CloudFront → Create distribution
  2. Origin: S3 bucket `kkaebizigi-images-prod` (Origin Access Control 생성)
  3. Viewer protocol: Redirect HTTP to HTTPS
  4. Allowed methods: GET, HEAD
  5. Cache policy: Managed-CachingOptimized (min=1s, default=86400s, max=31536000s)
  6. Response headers policy: Managed-CORS-With-Preflight + add `Cache-Control: public, max-age=31536000, immutable`
  7. Alternate domain (CNAME): `cdn.kkaebizigi.com`
  8. SSL certificate: ACM us-east-1에서 발급 (CloudFront는 us-east-1 cert 필요) — `cdn.kkaebizigi.com` + `cdn-staging.kkaebizigi.com`
  9. WAF: 1차 launch는 disabled (이후 ENH 검토)
  10. Save → distribution ID 확보

  동일 절차로 staging distribution (`cdn-staging.kkaebizigi.com`).

- **bucket policy update** (CloudFront OAC만 허용):
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowCloudFrontOAC",
        "Effect": "Allow",
        "Principal": { "Service": "cloudfront.amazonaws.com" },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::kkaebizigi-images-prod/*",
        "Condition": {
          "StringEquals": {
            "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DIST_ID>"
          }
        }
      }
    ]
  }
  ```

- **commit**: `chore(a-aws): CloudFront distribution config + bucket policy (OAC)`

### A.7 DNS — `cdn.kkaebizigi.com` CNAME

- **콘솔 작업** (도메인 DNS 관리 — Sprint 10 Phase C에서 사용한 동일 provider):
  - `cdn.kkaebizigi.com` CNAME → `<dist-id>.cloudfront.net`
  - `cdn-staging.kkaebizigi.com` CNAME → `<staging-dist-id>.cloudfront.net`
- **검증**: `dig +short cdn.kkaebizigi.com CNAME`, `curl -sI https://cdn.kkaebizigi.com/` (403 또는 PathNotFound 정상)

### A.8 AWS Budget 알림

- **콘솔**:
  - Budget 신규: `kkaebizigi-prod-monthly`, $20/월, 50%/80%/100% 이메일 알림
  - Budget 신규: `kkaebizigi-staging-monthly`, $5/월
- **commit**: 없음 (콘솔)

### A.9 Vercel 환경변수 (3 환경)

| Key | Production | Preview | Development |
|---|---|---|---|
| `AWS_S3_REGION` | `ap-northeast-2` | `ap-northeast-2` | `ap-northeast-2` |
| `AWS_S3_BUCKET` | `kkaebizigi-images-prod` | `kkaebizigi-images-staging` | `kkaebizigi-images-staging` |
| `AWS_S3_ACCESS_KEY_ID` | (prod IAM key) | (preview IAM key — 별개 user 또는 동일) | (동일 preview) |
| `AWS_S3_SECRET_ACCESS_KEY` | (prod secret) | (preview secret) | (동일 preview) |
| `NEXT_PUBLIC_CDN_URL` | `https://cdn.kkaebizigi.com` | `https://cdn-staging.kkaebizigi.com` | `https://cdn-staging.kkaebizigi.com` |
| `AWS_S3_TMP_PREFIX` | `tmp` | `tmp` | `tmp` |

권장: **prod / staging IAM user 분리** (`kkaebizigi-app-prod`, `kkaebizigi-app-staging`) → key 유출 시 영향 격리. 1차 launch는 단일 user 허용.

- **commit**: 없음 (Vercel UI)

### A.10 인프라 문서화

- **파일 신규**: `docs/sprint/11-sprint-images/aws-setup.md`
  - 설정 시퀀스 (콘솔 스크린샷 또는 CLI 명령)
  - 환경변수 매트릭스 (A.9 표)
  - **IAM key rotation 절차** (3개월 권장)
  - **삭제 절차** (Sprint 종료 후 staging cleanup 시)
- **commit**: `docs(a-aws): AWS S3 + CloudFront setup procedure`

**Phase A 산출물**:
- AWS 콘솔 리소스 6개 (bucket × 2, distribution × 2, IAM policy + user)
- 코드 4개 파일 (`infra/aws-iam-policy.json`, `infra/aws-s3-cors.json`, `infra/aws-s3-lifecycle.json`, `docs/sprint/11-sprint-images/aws-setup.md`)
- Vercel env 6개 (3 환경 × 6 키 = 18 entry)

---

## 2. Phase B — Storage Adapter + Presigned URL (1d, 8h)

### B.1 SDK 의존성 설치 (Sub-PR 1)

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
# 또는 npm 사용 시 npm i
```

- bundle 영향: server-only (`lib/storage/*`만 import) → client bundle 영향 0
- 버전 고정: SDK v3.x, 최신 stable

- **commit**: `chore(b-adapter): add @aws-sdk/client-s3 + s3-request-presigner`

### B.2 `lib/storage/s3-adapter.ts` (Sub-PR 2)

- **파일 신규**: `lib/storage/s3-adapter.ts`
  ```typescript
  import 'server-only';
  import { S3Client } from '@aws-sdk/client-s3';

  let cached: S3Client | null = null;

  export function getS3Client(): S3Client {
    if (cached) return cached;
    const region = process.env.AWS_S3_REGION;
    const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS_S3_* env not configured');
    }
    cached = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
    return cached;
  }

  export function getBucket(): string {
    const b = process.env.AWS_S3_BUCKET;
    if (!b) throw new Error('AWS_S3_BUCKET env not configured');
    return b;
  }

  export function getCdnBaseUrl(): string {
    const u = process.env.NEXT_PUBLIC_CDN_URL;
    if (!u) throw new Error('NEXT_PUBLIC_CDN_URL env not configured');
    return u.replace(/\/$/, '');
  }
  ```
- **commit**: `feat(b-adapter): S3Client singleton + env-driven config`

### B.3 `lib/storage/presigned-url.ts` (Sub-PR 3)

- **파일 신규**: `lib/storage/presigned-url.ts`
  - `createPresignedUploadUrl(input)` (server-only)
  - input: `{ kind: 'post' | 'chat', uid: string, contentType: string, sizeBytes: number, channelId?: string }`
  - 검증: MIME 화이트리스트, size ≤ 5MB
  - path 생성: `{kind}/{uid}/{yyyymmdd}/{ulid}.{ext}`
  - return: `{ presignedUrl, cdnUrl, expiresInSeconds: 600, headers: { ... } }`
  - 사용 SDK: `@aws-sdk/s3-request-presigner` `getSignedUrl(client, command, { expiresIn: 600 })`
  - `PutObjectCommand` 사용 — `ContentType`, `Metadata: { uid, kind }`
- **commit**: `feat(b-adapter): createPresignedUploadUrl with kind/uid/timestamp path`

### B.4 Server Action endpoint (Sub-PR 4)

- **파일 신규**: `app/api/storage/presign/route.ts`
  - POST handler
  - 인증: NextAuth `auth()` session 필수 → `session.user.registered === true` 검증
  - rate limit: `lib/storage/upload-rate-limit.ts` (분당 10 / 시간당 50)
  - body: `{ kind, contentType, sizeBytes, channelId? }` Zod schema
  - 출력: `{ presignedUrl, cdnUrl }`
  - 에러: 401 / 403 / 429 / 400 / 500

- **commit**: `feat(b-adapter): /api/storage/presign route handler + auth gate`

### B.5 Rate limit (Sub-PR 5)

- **파일 신규**: `lib/storage/upload-rate-limit.ts`
  - Firestore counter pattern (Sprint 10 `lib/chat/rate-limit.ts` 동일)
  - `enforceUploadRateLimit(uid): Promise<{ ok, retryAfterMs? }>`
- **commit**: `feat(b-adapter): upload rate limit (10/min, 50/hour)`

### B.6 Client uploader (Sub-PR 6)

- **파일 신규**: `lib/storage/upload-chat-image.ts`, `lib/storage/upload-post-image.ts`
  - 클라이언트 모듈 (`'use client'` 가능 — 단 server import 금지)
  - 흐름:
    1. `browser-image-compression`으로 압축 (옵션: WebP 우선)
    2. `POST /api/storage/presign` → presigned URL + cdnUrl 수신
    3. `fetch(presignedUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': mime } })`
    4. 성공 시 `cdnUrl` 반환
  - 인터페이스 호환: 기존 `UploadPostImageInput / Result` 유지 (drop-in 교체)
- **commit**: `feat(b-adapter): client uploaders (post + chat) with presigned PUT`

### B.7 Deprecated alias (Sub-PR 7)

- **수정**: `lib/post/image-upload.ts`
  - re-export `uploadPostImage` from `lib/storage/upload-post-image.ts`
  - JSDoc `@deprecated Use lib/storage/upload-post-image.ts`
- **수정**: `lib/chat/image-upload.ts`
  - re-export from `lib/storage/upload-chat-image.ts`
  - `@deprecated`

- **commit**: `refactor(b-adapter): deprecate old image-upload modules, alias to lib/storage`

### B.8 schema 변경 (Sub-PR 8)

- **수정**: `lib/post/schema.ts`
  ```typescript
  /** CDN URL 화이트리스트 — Sprint 11 AWS CloudFront */
  const STORAGE_URL_RE = /^https:\/\/cdn(-staging)?\.kkaebizigi\.com\//;
  ```
- **수정**: `database.rules.json` (Phase D.4에서 deploy 포함 — 본 task는 파일만 수정)
  - imageUrl regex: `^https:\\/\\/cdn(-staging)?\\.kkaebizigi\\.com\\/`

- **commit**: `refactor(b-adapter): storage URL whitelist to CloudFront domains`

### B.9 next.config.ts 업데이트 (Sub-PR 9)

- **수정**: `next.config.ts`
  - `images.remotePatterns`에 `cdn.kkaebizigi.com`, `cdn-staging.kkaebizigi.com` 추가
  - 기존 `firebasestorage.googleapis.com`은 전환 안전 차원 유지 (다음 Sprint에서 제거 검토)
  - CSP `img-src`에 CDN 도메인 추가
- **commit**: `chore(b-adapter): next.config CSP + image domain for CloudFront`

### B.10 unit test (Sub-PR 10)

- **파일 신규**:
  - `lib/storage/presigned-url.test.ts` — 6 cases (성공, MIME 거부, size 초과, path 생성 규칙, expiry 검증, env 누락)
  - `lib/storage/upload-rate-limit.test.ts` — 4 cases (정상 / 분당 한도 / 시간당 한도 / banned)
  - `app/api/storage/presign/route.test.ts` — 6 cases (인증 / 등록 / rate limit / Zod / 성공 / 500)
- **commit**: `test(b-adapter): unit tests for presigned URL + rate limit + route`

### B.11 통합 테스트 (Sub-PR 11)

- **파일 신규**: `__tests__/integration/storage-presign.spec.ts`
  - localstack 또는 staging bucket에 실제 PUT → GET 흐름
  - CI에서 `STAGING_AWS_TEST=true` 환경에서만 활성
- **commit**: `test(b-adapter): integration test (presign → PUT → GET via staging bucket)`

**Phase B 산출물**:
- 신규 파일 8개 (`lib/storage/s3-adapter.ts`, `presigned-url.ts`, `upload-chat-image.ts`, `upload-post-image.ts`, `upload-rate-limit.ts`, `app/api/storage/presign/route.ts`, 테스트 4개)
- 수정 파일 4개 (`lib/post/schema.ts`, `lib/post/image-upload.ts`, `lib/chat/image-upload.ts`, `next.config.ts`)
- unit + integration test ≥ 22 cases

---

## 3. Phase C — Post Image Upload UI (1d, 8h)

### C.1 PostForm adapter 교체 (Sub-PR 1)

- **수정**: `components/feature/post-form.tsx`
  - import: `uploadPostImage` from `@/lib/storage/upload-post-image` (구 `@/lib/post/image-upload` re-export 사용해도 동작 — 명시적 신규 path 권장)
  - `handleImageAdd` 함수의 에러 매핑 확장: `PRESIGN_FAILED`, `RATE_LIMIT_EXCEEDED`, `S3_PUT_FAILED`
  - progress callback 옵션 활성화

- **commit**: `feat(c-post-ui): switch PostForm to S3 storage adapter`

### C.2 progress UI (Sub-PR 2)

- **수정**: `components/feature/post-form.tsx`
  - 업로드 중 영역에 progress bar 표시 (Tailwind `<progress>` 또는 div bar)
  - `aria-valuenow` ARIA
- **commit**: `feat(c-post-ui): upload progress bar with a11y`

### C.3 마크다운 자동 삽입 옵션 (Sub-PR 3)

- **수정**: `components/feature/post-form.tsx`
  - 첨부 후 옵션: "본문 현재 위치에 ![](...) 삽입" 체크박스
  - textarea selectionStart/End 활용해 caret 위치에 삽입
- **commit**: `feat(c-post-ui): auto-insert markdown for attached image`

### C.4 모바일 카메라 capture (Sub-PR 4)

- **수정**: `components/feature/post-form.tsx`
  - `<input type="file" accept="image/*" capture="environment">` (모바일 카메라 우선)
  - 데스크탑은 capture 무시 → 갤러리 picker
- **commit**: `feat(c-post-ui): mobile camera capture attribute`

### C.5 게시글 본문 next/image 적용 (Sub-PR 5)

- **수정**: `components/feature/post/markdown-image.tsx` (또는 markdown render에 적용)
  - `<img>` 태그 hydration 시 next/image로 교체 (CloudFront 도메인 인식)
- **commit**: `perf(c-post-ui): use next/image for markdown body images`

### C.6 E2E (Sub-PR 6)

- **파일 신규**: `__tests__/e2e/image-upload-post.spec.ts`
  - 시나리오 1: 로그인 → /post/new → 사진 1장 첨부 (file fixture) → 게시 → 상세 페이지에서 이미지 노출
  - 시나리오 2: 3장 첨부 후 4번째 시도 → toast 에러
  - 시나리오 3: 11MB 사진 첨부 시도 → 거부 toast
- **commit**: `test(c-post-ui): E2E post image upload (3 scenarios)`

**Phase C 산출물**:
- 수정 파일 1~3개 (PostForm + markdown render)
- E2E 1 파일 × 3 시나리오

---

## 4. Phase D — Chat Image Upload UI (1d, 8h, Phase C와 병렬 가능)

### D.1 MessageComposer ImageAttach 버튼 (Sub-PR 1)

- **수정**: `components/feature/chat/message-composer.tsx`
  - `<Button variant="bronze" size="icon-sm">` ImagePlus 아이콘 추가 (Send 버튼 좌측)
  - state: `attachedImage: { file: File; previewUrl: string } | null`
  - 업로드 중 thumbnail (h-16) + progress + 취소 버튼 표시
  - `handleSend` 호출 시 첨부된 이미지가 있으면 `imageUrl` 함께 전송

- **commit**: `feat(d-chat-ui): MessageComposer ImageAttach button`

### D.2 chat uploader 연결 (Sub-PR 2)

- **수정**: `components/feature/chat/message-composer.tsx`
  - `uploadChatImage` from `@/lib/storage/upload-chat-image` import
  - 전송 시퀀스: upload → 성공 시 `sendChatMessage({ ..., imageUrl })`
- **commit**: `feat(d-chat-ui): wire chat uploader to composer send flow`

### D.3 message-variant resolver — image 케이스 (Sub-PR 3)

- **수정**: `lib/chat/message-variant.ts`
  ```typescript
  export type MessageVariant =
    | { type: 'text'; content: string }
    | { type: 'link'; content: string; linkPreview: LinkPreviewMeta }
    | { type: 'image'; content?: string; imageUrl: string }   // 신규
    | { type: 'deleted'; reason: 'self' | 'operator' | 'hidden' };

  export function resolveMessageVariant(m: ChatMessage): MessageVariant {
    if (m.deletedByOperator) return { type: 'deleted', reason: 'operator' };
    if (m.hidden && !m.keptByOperator) return { type: 'deleted', reason: 'hidden' };
    if (m.imageUrl) return { type: 'image', imageUrl: m.imageUrl, content: m.content };
    if (m.linkPreview) return { type: 'link', content: m.content, linkPreview: m.linkPreview };
    return { type: 'text', content: m.content };
  }
  ```
- **수정**: `lib/chat/message-variant.test.ts` — 회귀 4 케이스 + image 신규 2 케이스
- **commit**: `feat(d-chat-ui): message-variant image case + 회귀 테스트`

### D.4 MessageItem image variant render (Sub-PR 4)

- **수정**: `components/feature/chat/message-item.tsx`
  - `variant.type === 'image'` 분기 추가
  - thumbnail `max-h-64 max-w-xs` (mobile: `max-w-[80vw]`), next/image
  - 클릭 시 lightbox 모달 (다음 sub-PR)
  - alt: `${authorNickname}님이 보낸 이미지`
- **commit**: `feat(d-chat-ui): MessageItem image variant rendering`

### D.5 Image Lightbox 컴포넌트 (Sub-PR 5)

- **파일 신규**: `components/feature/chat/image-lightbox.tsx`
  - radix-ui Dialog 기반 (shadcn/ui Dialog)
  - 전체 화면 + ESC + backdrop click close + focus trap
  - 모바일: 핀치 줌은 native (touch-action: pinch-zoom)
- **commit**: `feat(d-chat-ui): image lightbox component (Dialog + a11y)`

### D.6 RTDB rules update + deploy (Sub-PR 6)

- **수정**: `database.rules.json`
  ```json
  "imageUrl": { ".validate": "!newData.exists() || (newData.isString() && newData.val().matches(/^https:\\/\\/cdn(-staging)?\\.kkaebizigi\\.com\\//))" },
  ```
- **명령**: `firebase deploy --only database`
- **commit**: `chore(d-chat-ui): RTDB rules imageUrl regex → CloudFront domains + deploy`

### D.7 신고 dialog 이미지 카테고리 (Sub-PR 7)

- **수정**: `components/feature/chat-report-dialog.tsx`
  - "이미지 신고" 카테고리 추가 (sub-reason: 선정적/광고/도용/기타)
  - imageUrl이 있을 때만 카테고리 노출
- **commit**: `feat(d-chat-ui): chat report dialog image category`

### D.8 send-message 활성화 (Sub-PR 8)

- **수정**: `lib/chat/send-message.ts`
  - 이미 `imageUrl?: string` 시그니처 존재 (Sprint 10) → 실제 RTDB write 시 imageUrl 포함되도록 검증
- **commit**: `fix(d-chat-ui): ensure sendChatMessage persists imageUrl field`

### D.9 E2E (Sub-PR 9)

- **파일 신규**: `__tests__/e2e/image-upload-chat.spec.ts`
  - 시나리오 1: 로그인 → /chat/global → 사진 1장 첨부 → 전송 → MessageItem image variant 노출
  - 시나리오 2: 4MB 사진 첨부 시도 → 거부 (compressed > 1MB 시)
  - 시나리오 3: 이미지 메시지 신고 → admin이 강제 삭제 → message는 deleted variant 노출 + S3 객체 deleted
- **commit**: `test(d-chat-ui): E2E chat image upload + moderation`

**Phase D 산출물**:
- 수정 파일 5개 (MessageComposer, MessageItem, message-variant, message-variant.test, send-message)
- 신규 파일 3개 (image-lightbox.tsx, e2e spec, chat-report-dialog 부분 수정)
- RTDB rules deploy 1회

---

## 5. Phase E — Image Optimization + Lifecycle (0.5d, 4h)

### E.1 클라이언트 압축 옵션 강화 (Sub-PR 1)

- **수정**: `lib/storage/upload-post-image.ts`, `lib/storage/upload-chat-image.ts`
  - 옵션: `preferWebp: true` (JPEG/PNG → WebP 변환), 단 GIF는 원본 유지
  - canvas re-encode로 EXIF 자동 제거 보장 (Phase B에서 이미 구현 가정)
- **commit**: `perf(e-opt): client-side WebP conversion + EXIF strip`

### E.2 Clean Arch R6 audit (Sub-PR 2)

- **수정**: `scripts/audit-clean-arch.sh`
  - R6 룰 추가: `lib/storage/*` 외부에서 `@aws-sdk/*` import 검출 시 fail
  - npm script: `pnpm audit:clean-arch`
- **검증**: `pnpm audit:clean-arch` → R6 PASS
- **commit**: `chore(e-opt): clean-arch audit R6 (AWS SDK isolated to lib/storage)`

### E.3 Orphan cleanup script (Sub-PR 3)

- **파일 신규**: `scripts/cleanup-orphan-images.ts`
  - S3에서 30일 이상 객체 list
  - Firestore + RTDB 스캔해 참조되지 않는 객체 식별
  - 1주일 dry-run 후 실제 삭제 활성
  - 일정: GitHub Action cron (월 1회)
- **commit**: `chore(e-opt): orphan image cleanup script (dry-run mode default)`

### E.4 CloudFront cache 검증 (Sub-PR 4)

- **수동 검증**:
  - 동일 이미지 2회 요청 → 첫 요청 `X-Cache: Miss from cloudfront`, 두번째 `Hit`
  - `Cache-Control: public, max-age=31536000, immutable` 헤더 응답
- **문서**: `docs/sprint/11-sprint-images/aws-setup.md` §verification 보강

- **commit**: `docs(e-opt): CloudFront cache verification notes`

### E.5 Sentry image-upload tracing (Sub-PR 5)

- **수정**: Sprint 10에서 통합한 Sentry — `lib/storage/upload-*.ts`에 transaction 추가
  - `image_upload` transaction: 압축 시간, presign 시간, PUT 시간, 총 시간 메트릭
- **commit**: `feat(e-opt): Sentry tracing for image upload (compress + presign + PUT)`

**Phase E 산출물**:
- 수정 파일 4개 (upload-post-image, upload-chat-image, audit-clean-arch.sh, lib/storage/upload-*.ts Sentry)
- 신규 파일 1개 (cleanup-orphan-images.ts)

---

## 6. Phase F — Quality + Launch (1d, 8h)

### F.1 typecheck + lint (Sub-PR 1)

- **명령**: `pnpm typecheck && pnpm lint`
- **목표**: 0 error, 0 warning (이미지 관련 신규 파일)
- **commit**: `chore(f-quality): typecheck + lint pass`

### F.2 unit test 전체 (Sub-PR 2)

- **명령**: `pnpm test`
- **목표**: Sprint 11 신규 ≥ 30 tests 통과 + 회귀 0 (Sprint 10 totals 유지)
- **commit**: 없음 (검증)

### F.3 Lighthouse 재측정 (Sub-PR 3)

- **명령**: `pnpm lighthouse:mobile`, `pnpm lighthouse:desktop` (Sprint 10 흐름)
- **목표** (Sprint 10 baseline 유지 + 이미지 항목 강화):
  - Performance ≥ 90 (mobile)
  - `uses-webp-images` PASS
  - `uses-optimized-images` PASS
  - `uses-responsive-images` PASS
  - LCP ≤ 2.5s (게시글 상세 첨부 이미지 포함 시)
- **commit**: `docs(f-quality): Lighthouse Sprint 11 baseline (mobile + desktop)`

### F.4 E2E 종합 (Sub-PR 4)

- **명령**: `pnpm test:e2e`
- 시나리오 합산: 6 (Sprint 11 신규 3 + 3) + Sprint 10 회귀 ≥ 8
- 부분 실패 허용 0
- **commit**: `test(f-quality): full E2E pass (image upload + regression)`

### F.5 Security audit (Sub-PR 5)

- **체크리스트** (수동):
  - [ ] IAM access key가 Vercel env에만 (로컬 .env 0건)
  - [ ] bucket policy: CloudFront OAC만 GET 허용
  - [ ] CORS: kkaebizigi 도메인만 허용
  - [ ] presigned URL expiry 10분
  - [ ] rate limit 적용 확인
  - [ ] EXIF strip 검증 (sample 이미지 업로드 후 metadata 확인)
  - [ ] CSP `img-src` CloudFront 포함
- **결과 문서**: `docs/sprint/11-sprint-images/security-audit.md`
- **commit**: `docs(f-quality): security audit checklist`

### F.6 Cost monitoring (Sub-PR 6)

- **검증** (launch + 24h):
  - AWS Cost Explorer에서 S3 + CloudFront 비용 < $0.50/24h (prod) 확인
  - Budget 알림 trigger 0
- **commit**: 없음

### F.7 Launch checklist (Sub-PR 7)

- **파일 신규**: `docs/sprint/11-sprint-images/launch-checklist.md` (Sprint 10 형식 유지)
  - [ ] AWS Console: bucket 2 + distribution 2 + IAM user/policy
  - [ ] Vercel env: 6 keys × 3 환경
  - [ ] DNS: cdn + cdn-staging CNAME 정상
  - [ ] RTDB rules deploy
  - [ ] firestore rules: `imageUrls` 정규식 (필요 시)
  - [ ] PostForm 이미지 첨부 확인 (staging)
  - [ ] Chat 이미지 전송 확인 (staging)
  - [ ] Lightbox 검증 (모바일 viewport)
  - [ ] 신고 → 운영자 강제 삭제 검증 (S3 + RTDB)
  - [ ] Sentry image_upload transaction 정상 수집
  - [ ] Lighthouse mobile ≥ 90
  - [ ] AWS Budget 알림 active
- **commit**: `docs(f-quality): Sprint 11 launch checklist`

### F.8 PDCA cycle (Sub-PR 8)

- **PDCA 실행**: `/pdca` skill (Trust L4 — auto-approve gates)
  - Plan ✓ (이 문서)
  - Do ✓ (Phase A-E)
  - Check (Phase F)
  - Act (회귀 발견 시 iterate gate)
- **commit**: `chore(f-quality): Sprint 11 PDCA iterate gate`

### F.9 Sprint archive (Sub-PR 9)

- **명령** (의사 sprint skill): `/sprint archive sprint-11-images`
- **결과**: `.bkit/state/sprints/sprint-11-images.json` `phase: archived`

**Phase F 산출물**:
- 새로운 문서 2개 (security-audit.md, launch-checklist.md)
- Lighthouse 보고서
- archived 상태

---

## 7. Task Breakdown 합계

| Phase | Sub-PR 수 | 신규 파일 | 수정 파일 | E2E | 예상 시간 |
|---|---|---|---|---|---|
| A. AWS Infra | 10 (콘솔 작업 포함) | 4 | 0 | 0 | 4h |
| B. Adapter | 11 | 8 | 4 | 0 | 8h |
| C. Post UI | 6 | 1 | 2 | 1 (3 시나리오) | 8h |
| D. Chat UI | 9 | 3 | 5 | 1 (3 시나리오) | 8h |
| E. Optimization | 5 | 1 | 4 | 0 | 4h |
| F. Quality | 9 | 2 | 0 | 0 | 8h |
| **합계** | **50** | **19** | **15** | **2 (6 시나리오)** | **40h (5일)** |

---

## 8. Dependency Graph

```
Phase A.1-A.4 (계정/IAM/bucket/CORS)
    │
    ├─→ Phase A.5 (lifecycle)
    │
    ├─→ Phase A.6 (CloudFront)
    │       │
    │       ├─→ Phase A.7 (DNS)
    │       │       │
    │       │       └─→ Phase A.10 (문서화)
    │       │
    │       └─→ Phase A.9 (Vercel env)
    │
    └─→ Phase A.8 (Budget)
            │
            └─→ Phase B.1 (SDK 설치)
                    │
                    ├─→ B.2 (s3-adapter)
                    │       │
                    │       └─→ B.3 (presigned-url)
                    │               │
                    │               ├─→ B.4 (route handler)
                    │               ├─→ B.5 (rate limit)
                    │               └─→ B.6 (client uploaders)
                    │                       │
                    │                       ├─→ B.7 (deprecated alias)
                    │                       ├─→ B.8 (schema)
                    │                       ├─→ B.9 (next.config)
                    │                       ├─→ B.10 (unit test)
                    │                       └─→ B.11 (integration test)
                    │                               │
                    │       ┌───────────────────────┴───────────────────────┐
                    │       ▼                                                ▼
                    │   Phase C (Post UI, 6 sub-PR)              Phase D (Chat UI, 9 sub-PR)
                    │       │                                                │
                    │       └────────────────────┬───────────────────────────┘
                    │                            ▼
                    │                    Phase E (Optimization, 5 sub-PR)
                    │                            │
                    │                            ▼
                    │                    Phase F (Quality + Launch, 9 sub-PR)
                    │                            │
                    │                            ▼
                    │                       archived
                    │
                    └─→ (시작 의존성: A 완료 후 B 시작)
```

**Critical path**: A → B → (C ∥ D) → E → F
**병렬 가능 시간**: Phase C와 D는 Phase B 완료 후 병렬 → 1일 단축 가능 (실제 5일 → 4일 가능, 보수적 5일 유지)

---

## 9. Risk Mitigation per Phase

| Phase | Risk | Mitigation |
|---|---|---|
| A | AWS 콘솔 설정 실수 (예: bucket public) | CLI 명령 시퀀스 문서화 + AC1.2 block public access 검증 |
| A | DNS propagation 지연 (cdn.kkaebizigi.com) | 24h 대기 가능, 그동안 distribution domain (`*.cloudfront.net`)로 staging 검증 |
| B | SDK breaking change | 버전 고정 (`@aws-sdk/client-s3@^3.x`) + lockfile commit |
| B | presigned URL 만료 짧음 → 큰 사진 실패 | 클라이언트 압축 후 평균 1MB → 3G 환경에서도 3초 < 10분 |
| C | PostForm refactor 회귀 | Sprint 10 PostForm E2E 회귀 + diff review |
| D | image variant resolver 회귀 (text/link 깨짐) | message-variant.test.ts 4+2 케이스 (text/link/deleted/image 회귀 + image 신규) |
| D | RTDB rules deploy 누락 | Phase D.6 명시 commit + 검증 |
| E | clean-arch R6 위반 잔존 | `pnpm audit:clean-arch` CI gate |
| F | Lighthouse 회귀 | mobile 90+ 강제 gate, 미달 시 iterate |

---

## 10. Definition of Done

본 Sprint는 다음 모두 충족 시 archived:

- [ ] **F1 인프라**: AC1.1~AC1.9 모두 PASS (콘솔/CLI 검증)
- [ ] **F2 Adapter**: 22+ unit test PASS + Clean Arch R6 PASS
- [ ] **F3 Post UI**: AC3.1~AC3.10 모두 PASS + E2E 3 시나리오 PASS
- [ ] **F4 Chat UI**: AC4.1~AC4.9 모두 PASS + E2E 3 시나리오 PASS
- [ ] **F5 Moderation**: AC5.1~AC5.4 PASS
- [ ] **F6 Optimization**: AC6.1~AC6.6 PASS (Lighthouse 4 항목 + LCP)
- [ ] **launch-checklist.md** 12 체크 모두 ✓
- [ ] **security-audit.md** 7 항목 모두 ✓
- [ ] **AWS Budget 알림** 24h 모니터링 정상 (no breach)
- [ ] **production 배포** 후 24h KPI 측정 가능 상태

---

## 11. 변경 이력

| 일자 | 변경 | 작성자 |
|---|---|---|
| 2026-05-17 | Plan 초안 — Phase A~F 50 sub-PR + dependency graph + 재사용 매트릭스 | Claude Opus + kay |

---

> **Next Phase**: [design.md](./design.md) — 인프라/어댑터/UI/보안 상세 설계
