# Sprint 11 — PRD (Product Requirements Document)

**Sprint**: `sprint-11-images`
**제목**: Images — AWS S3 + CloudFront CDN + Upload UI (Posts + Chat)
**상위 문서**: (master-plan.md — 본 Sprint는 단일 Sprint로 master plan 생략, 본 PRD가 진실원)
**Trust Level**: L4 Full-Auto (`stopAfter: archived`)
**작성일**: 2026-05-17
**예상 기간**: 5일 (1 Sprint)

---

## 0. Executive Summary

Sprint 10 출시는 성공했으나 **Firebase Storage Spark 무료 플랜 한도 초과**로 인해 다음 3개 carry 항목이 발생했다.

1. Storage CORS 설정 미완 (Task #7) → 채팅/게시글 이미지 업로드 UI를 Sprint 10에서 **의도적으로 차단**
2. 게시글 작성 폼: 이미지 첨부 UI 제외 (Task #22 완료 범위에서 제외)
3. 채팅: `MessageItem` `image` variant 미구현 + `lib/chat/image-upload.ts` 코드만 존재 (미연결)

Sprint 11은 **AWS S3 + CloudFront** 조합으로 이미지 인프라를 새로 구축하고, 위 3개 미완 흐름을 모두 활성화한다. Firebase Storage 대비:

- **비용**: Spark 한도 무관 (S3 Standard 5GB free tier + CloudFront 1TB free tier)
- **성능**: CloudFront edge cache → P95 < 500ms 이미지 로드 가능
- **확장성**: Lambda@Edge 또는 CloudFront response transform 으로 WebP/AVIF on-the-fly 변환

본 Sprint의 모든 외부 SDK 접근은 **`lib/storage/*` 어댑터에 격리** (Clean Architecture R6 신규 규칙).

---

## 1. Why — 배경

### 1.1 Sprint 10 Spark 한도 사건 (timeline)

| 시각 | 사건 |
|---|---|
| 2026-05-16 23:00 | Sprint 10 Phase A.4 — `gsutil cors set` 실행 → "Permission denied or upgrade required" |
| 2026-05-16 23:05 | Firebase 콘솔 확인 → 프로젝트가 Spark (free) 플랜, Storage 사용량 한도 도달 |
| 2026-05-16 23:10 | 결정: Blaze 유료 플랜 전환 vs AWS S3 마이그레이션 — 후자 선택 (PAYG 통제 용이 + CloudFront edge 1TB free) |
| 2026-05-16 23:30 | Sprint 10 Phase D/E에서 이미지 UI를 의도적으로 보류 (carryItems 등록) |
| 2026-05-17 21:00 | Sprint 10 archived (30/30 tasks complete, Sprint 11 carry 4건) |
| 2026-05-17 21:05 | Sprint 11 init |

### 1.2 비즈니스 가치

- **컨텐츠 풍성도**: 빌드/공략/후기 글에서 스크린샷은 핵심 — 텍스트만으로는 변환율 -40% 추정 (커뮤니티 벤치마크)
- **채팅 활성도**: 이미지 메시지는 텍스트 대비 engagement 2~3x (DAU 7d retention 영향)
- **운영 안정성**: 사용량 폭증 시에도 PAYG 모델로 통제 가능 (Spark 한도 같은 hard limit 부재)

### 1.3 Sprint 10 산출물 재사용 매트릭스

| 영역 | 재사용 가능 (그대로) | 변경 필요 |
|---|---|---|
| `lib/post/og-preview.ts`, `lib/post/ssrf-guard.ts` | ○ 그대로 | — |
| `lib/post/markdown.ts` (rehype paipeline) | ○ 그대로 | — |
| `lib/chat/send-message.ts` (rate limit, masking) | ○ 그대로 | imageUrl 처리 로직 활성화만 |
| `lib/chat/image-upload.ts` (Firebase Storage 기반) | ✗ deprecate | → `lib/storage/upload-chat-image.ts`로 재구현 |
| `lib/post/image-upload.ts` (Firebase Storage 기반) | ✗ deprecate | → `lib/storage/upload-post-image.ts`로 재구현 |
| `lib/post/schema.ts` `STORAGE_URL_RE` 정규식 | △ 수정 | `firebasestorage.googleapis.com` → CloudFront 도메인 |
| `components/feature/post-form.tsx` `handleImageAdd` | △ 수정 | upload adapter 교체만 (Phase 10 Task #22에서 ImageAttach UI 자체는 이미 완성) |
| `components/feature/chat/message-composer.tsx` | △ 수정 | 이미지 첨부 버튼 추가 (현재 텍스트만) |
| `components/feature/chat/message-item.tsx` | △ 수정 | `image` variant 활성화 (현재 text/link/deleted 3개만) |
| `lib/chat/message-variant.ts` resolver | △ 수정 | `{ type: 'image', imageUrl }` 케이스 추가 |
| `database.rules.json` imageUrl regex | △ 수정 | CloudFront 도메인 허용 |
| `storage.rules` (Firebase Storage) | ✗ retire | S3 IAM 정책 + bucket policy로 대체 |
| `next.config.ts` `images.remotePatterns` | △ 수정 | CloudFront 도메인 추가, firebasestorage는 phase-out (전환 기간 양립) |
| `next.config.ts` CSP `img-src` | △ 수정 | CloudFront 도메인 추가 |

### 1.4 의사결정 기록 (ADR-11.1)

> **Q**: 왜 AWS S3 + CloudFront인가? Cloudinary / Imgix / Vercel Blob 대안은?
>
> **A**:
> - **Cloudinary**: 강력하지만 무료 25 credits/월 한도 — 사용량 폭증 시 hard limit 위험
> - **Imgix**: 우수한 image API, 그러나 storage는 별도 (S3/GCS 필요) — 결국 S3는 도입 필요
> - **Vercel Blob**: Vercel ecosystem 통합 우수, 무료 1GB → 가격 단순성. 그러나 (a) 1GB 한도 빠른 도달 예상, (b) CloudFront 같은 글로벌 edge 경험 제약
> - **AWS S3 + CloudFront** (채택): 무료 한도 5GB + 1TB egress (12개월) → 초기 1000 MAU에 충분. 이후 PAYG 점진적 증가. 이미 GitHub Actions / Vercel과 IAM 통합 패턴 익숙.
>
> **트레이드오프**: AWS 콘솔 설정 복잡도 (IAM, bucket policy, CloudFront OAC) → 본 Sprint Phase A에서 1회 인프라 구축 후 IaC (Terraform 또는 AWS CDK) 후속 검토.

---

## 2. Who — 페르소나

### P1. 게시글 작성자 (등록 사용자, 가장 큰 비중)

- **상황**: 빌드 / 공략 / 후기 글 작성 중 스크린샷 또는 장비 이미지를 첨부하고 싶음
- **터치포인트**: `/post/new`, `/post/[id]/edit`
- **목표**: 모바일 카메라/갤러리에서 1~3장 빠르게 첨부 → 본문에 정확한 위치에 삽입
- **현재 pain**: Sprint 10에서 ImageAttach 영역 비활성화 (회색 처리) → 글 작성 흐름 단절
- **성공 기준 (이 페르소나 관점)**:
  - 모바일에서 사진 첨부 → 압축 → 업로드 → 마크다운 삽입까지 ≤ 8초
  - 첨부 실패 시 명확한 한글 에러 메시지 (네트워크/포맷/크기)

### P2. 채팅 사용자 (등록 사용자)

- **상황**: 3-tier 채널 (`global` / `server-*` / `munpa-*`)에서 스샷 빠르게 공유
- **터치포인트**: `/chat/global`, `/chat/server-{serverId}`, `/chat/munpa-{munpaId}`
- **목표**: composer에서 클립 아이콘 → 사진 선택 → 즉시 미리보기 → 전송 (1회 1장)
- **현재 pain**: Sprint 10에서 composer에 클립 아이콘 자체 없음, `lib/chat/image-upload.ts` 활성화 안 됨
- **성공 기준**:
  - 모바일 카메라에서 직접 촬영 → 송신까지 ≤ 5초
  - 이미지 메시지 thumbnail (max-h-64) 표시 + 클릭 시 lightbox

### P3. 운영자 (Site Admin, 모더레이션)

- **상황**: 부적절한 이미지 (선정성/광고/도용) 신고 처리 → 강제 삭제
- **터치포인트**: `/admin/chat/moderation`, `/admin/posts/reported`
- **목표**: 신고 dialog에 "이미지 신고" 카테고리 추가 + 운영자 삭제 시 S3 객체 + RTDB/Firestore URL **양쪽 삭제** + audit log
- **현재 pain**: Sprint 10에서 신고 dialog는 텍스트 메시지 기준 + 이미지 신고 카테고리 부재
- **성공 기준**:
  - 운영자가 1 클릭으로 S3 객체 삭제 + DB URL nullify
  - audit log에 `image_deleted_by_admin` 액션 기록

---

## 3. Job Stories

> 형식: **When** [상황] **I want to** [욕구] **so that** [결과]

| ID | Job Story |
|---|---|
| JS-1 | **When** 모바일에서 빌드 글을 작성하면서 캐릭터 스크린샷을 첨부하고 싶을 때, **I want to** 카메라 또는 갤러리에서 사진을 선택해 본문에 자동 삽입할 수 있도록 **so that** 글 작성 흐름이 끊기지 않는다. |
| JS-2 | **When** 게시글에 이미 3장을 첨부한 상태일 때, **I want to** 추가 첨부 시도 시 명확한 한도 안내를 받도록 **so that** 시도 후 실패에 놀라지 않는다. |
| JS-3 | **When** 5MB가 넘는 사진을 첨부하려 할 때, **I want to** 클라이언트가 자동으로 1MB 미만으로 압축하도록 **so that** 데이터 사용량과 업로드 대기를 줄일 수 있다. |
| JS-4 | **When** 길드 채팅방에서 보스 클리어 스샷을 빠르게 공유하고 싶을 때, **I want to** composer 클립 아이콘 → 사진 한 장을 즉시 전송할 수 있도록 **so that** 텍스트와 동일한 속도로 의사소통할 수 있다. |
| JS-5 | **When** 모바일 채팅 viewport에서 이미지 메시지를 받았을 때, **I want to** thumbnail이 viewport 가독성을 깨지 않고 표시되고 탭하면 전체 화면 보기로 확장되도록 **so that** 채팅 스크롤이 끊기지 않는다. |
| JS-6 | **When** 부적절한 이미지를 발견한 사용자가 신고하려 할 때, **I want to** 신고 dialog에 "이미지 — 선정적/광고/도용" 카테고리를 선택할 수 있도록 **so that** 사유가 정확히 운영자에게 전달된다. |
| JS-7 | **When** 운영자가 신고된 이미지를 강제 삭제할 때, **I want to** S3 객체와 RTDB/Firestore URL이 한 번에 정리되도록 **so that** 삭제 후에도 CDN 캐시에 잔존한 이미지가 노출되지 않는다. |
| JS-8 | **When** Sprint 11 launch 후 7일이 지났을 때, **I want to** 게시글 첨부율 / 채팅 이미지 비율 / 평균 로드 latency 지표를 GA4에서 확인할 수 있도록 **so that** 다음 Sprint에서 최적화 방향을 결정할 수 있다. |

---

## 4. User Stories (Acceptance Criteria 포함)

### F1. AWS Infrastructure (P0)

> **As a** kkaebizigi 운영자, **I want** AWS S3 bucket과 CloudFront distribution이 production/staging 분리되어 구성되도록, **so that** 환경별 이미지가 격리되고 비용이 통제된다.

**Acceptance Criteria**:

- AC1.1 AWS S3 bucket 2개 생성: `kkaebizigi-images-prod` (ap-northeast-2 서울), `kkaebizigi-images-staging` (ap-northeast-2)
- AC1.2 bucket lifecycle policy 적용:
  - prefix `tmp/` → 1일 후 자동 삭제 (업로드 실패 잔여물)
  - prefix `chat/`, `posts/` → 30일 후 `STANDARD_IA` storage class 전환 (비용 절감)
  - **신규 정책: orphan 정리 별도** (Phase E에서 정의)
- AC1.3 CloudFront distribution 2개:
  - `cdn.kkaebizigi.com` → prod bucket origin (Origin Access Control)
  - `cdn-staging.kkaebizigi.com` → staging bucket origin
- AC1.4 CloudFront cache policy: TTL `min=3600s`, `default=86400s`, `max=31536000s` (1년) — 이미지는 immutable 경로 (파일명에 timestamp 포함)
- AC1.5 CORS 설정 (`AllowedOrigins`): `https://kkaebizigi.com`, `https://www.kkaebizigi.com`, `https://staging.kkaebizigi.com`, `http://localhost:3000`. `AllowedMethods`: `GET`, `HEAD`, `PUT`. `AllowedHeaders`: `Content-Type`, `Content-Length`, `x-amz-*`
- AC1.6 IAM user `kkaebizigi-app` (programmatic only) — 최소권한 정책:
  - `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on `kkaebizigi-images-*/chat/*` + `kkaebizigi-images-*/posts/*` + `kkaebizigi-images-*/tmp/*`
  - 다른 prefix 접근 거부
  - bucket-level 권한 없음 (list 금지)
- AC1.7 환경변수 Vercel 3 환경별 분리: `AWS_S3_REGION`, `AWS_S3_BUCKET`, `AWS_S3_ACCESS_KEY_ID`, `AWS_S3_SECRET_ACCESS_KEY`, `NEXT_PUBLIC_CDN_URL`
- AC1.8 AWS Budget 알림 등록: prod $20/월 임계, staging $5/월 임계 → 이메일 알림
- AC1.9 인프라 설정 내용 `docs/sprint/11-sprint-images/aws-setup.md`에 문서화 (콘솔 스크린샷 또는 CLI 명령 시퀀스)

### F2. Storage Adapter + Presigned URL (P0)

> **As a** 백엔드 개발자, **I want** S3 SDK가 `lib/storage/*` 모듈에 격리되고 클라이언트 직접 import가 차단되도록, **so that** Clean Architecture R6 규칙을 위반하지 않고 외부 인프라 변경 시 영향이 한 곳에 모인다.

**Acceptance Criteria**:

- AC2.1 신규 모듈 `lib/storage/s3-adapter.ts` — S3Client 단일 진입점 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- AC2.2 신규 모듈 `lib/storage/presigned-url.ts` — `createPresignedUploadUrl(input)` 함수 (server-only, expiry 10분)
- AC2.3 신규 Server Action `app/api/storage/presign/route.ts` (POST) — 인증 필수 + 입력 검증 (kind, contentType, sizeBytes) → presigned URL + 최종 CDN URL 반환
- AC2.4 신규 모듈 `lib/storage/upload-post-image.ts`, `lib/storage/upload-chat-image.ts` — 클라이언트 측 wrapper (압축 → presign 요청 → S3 PUT → CDN URL 반환)
- AC2.5 기존 `lib/post/image-upload.ts`, `lib/chat/image-upload.ts` 는 deprecated 주석 + re-export로 임시 호환 → 모든 호출자 마이그레이션 후 다음 Sprint에서 삭제
- AC2.6 Clean Arch 검증: `scripts/audit-clean-arch.sh`에 R6 규칙 추가 — `lib/storage/*` 외부에서 `@aws-sdk/*` import 0건
- AC2.7 unit test 신규 ≥ 12개:
  - presigned URL 생성 (mock S3) — 성공/만료
  - 입력 검증 (잘못된 MIME / 크기 초과 / 인증 누락)
  - S3 path 생성 규칙 (`{kind}/{uid}/{yyyymmdd}/{ulid}.{ext}`)
- AC2.8 통합 테스트 (Phase F): localstack 또는 실제 staging bucket으로 end-to-end presign → PUT → GET

### F3. Post Image Upload UI (P0)

> **As a** 게시글 작성자, **I want** 작성 폼에서 이미지를 다시 첨부할 수 있도록 **so that** 빌드/공략 글을 풍부하게 작성할 수 있다.

**Acceptance Criteria**:

- AC3.1 `components/feature/post-form.tsx`의 `handleImageAdd` 함수가 `uploadPostImage` (Sprint 11 신규 adapter) 호출로 교체. UI 자체는 Sprint 10에서 이미 완성됨
- AC3.2 최대 3장 (`POST_LIMITS.images.max = 3`) — 초과 시 toast 에러
- AC3.3 클라이언트 검증: MIME (jpeg/png/webp/gif), raw size ≤ 5MB, 압축 후 ≤ 1MB
- AC3.4 클라이언트 압축: `browser-image-compression`, `maxSizeMB: 1`, `maxWidthOrHeight: 1920`, `useWebWorker: true`
- AC3.5 업로드 progress bar (0~100%) — 모바일 viewport에서 visible
- AC3.6 EXIF 데이터 자동 제거 (GPS 좌표 등 PII) — `browser-image-compression` 옵션 `exifOrientation` 적용 후 canvas re-encode
- AC3.7 업로드 완료 후 본문 textarea의 현재 caret 위치에 마크다운 `![](url)` 자동 삽입 (옵션, 기본 비활성 / 활성 토글)
- AC3.8 `imageUrls` 배열 → `STORAGE_URL_RE` 정규식이 CloudFront 도메인 (`https://cdn(-staging)?\.kkaebizigi\.com/`) 허용으로 업데이트
- AC3.9 모바일 (viewport < 768px): 첨부 영역 1열 grid, 썸네일 96×96 (Sprint 10과 동일 토큰)
- AC3.10 E2E 테스트 (Playwright): 신규 글 작성 시 사진 1장 첨부 → 게시 → 상세 페이지 노출 확인

### F4. Chat Image Upload UI (P0)

> **As a** 채팅 사용자, **I want** composer에서 이미지를 한 장씩 전송할 수 있도록 **so that** 게임 화면을 빠르게 공유할 수 있다.

**Acceptance Criteria**:

- AC4.1 `components/feature/chat/message-composer.tsx`에 ImageAttach 버튼 추가 (lucide `ImagePlus` 아이콘, `Button` `size="icon-sm"`)
- AC4.2 클릭 시 file input 트리거 (`accept="image/jpeg,image/png,image/webp"`, `capture="environment"` — 모바일 카메라 우선)
- AC4.3 1회 1장 (multiple 비활성). 첨부 중인 이미지가 있으면 추가 첨부 비활성화
- AC4.4 업로드 중 composer 위쪽에 thumbnail (h-16) + progress + 취소 버튼
- AC4.5 전송 시 `sendChatMessage`의 input에 `imageUrl` 필드 채워서 전송 (`lib/chat/send-message.ts` 시그니처에 이미 `imageUrl?: string` 있음 — 활성화만)
- AC4.6 `components/feature/chat/message-item.tsx` `image` variant 활성화:
  - thumbnail `max-h-64 max-w-xs object-contain` (sm: 가로 축소)
  - 클릭 시 lightbox 모달 (전체 화면 + close 버튼 + 좌우 swipe 비활성 — 1장이므로)
  - alt 텍스트: `${authorNickname}님이 보낸 이미지`
- AC4.7 `lib/chat/message-variant.ts` `resolveMessageVariant`에 `image` 케이스 분기 추가 — `imageUrl` 존재 + `content` 없거나 짧음
- AC4.8 RTDB rules `database.rules.json` imageUrl regex 업데이트 (Phase A에서 deploy)
- AC4.9 모바일 카메라 직접 촬영 시나리오 E2E

### F5. Moderation — 이미지 신고 + 강제 삭제 (P1)

> **As an** 운영자, **I want** 신고된 이미지를 S3 + DB 양쪽에서 한 번에 삭제할 수 있도록 **so that** CDN 캐시에 부적절한 이미지가 잔존하지 않는다.

**Acceptance Criteria**:

- AC5.1 신고 dialog (`components/feature/chat-report-dialog.tsx` 및 게시글 신고 컴포넌트)에 "이미지 신고" 카테고리 추가 — sub-reason: 선정적 / 광고 / 도용 / 기타
- AC5.2 운영자 모더레이션 액션 신규: `deleteChatImage(channelId, messageId)`, `deletePostImage(postId, imageUrl)`
  - S3 객체 삭제 (`@aws-sdk/client-s3` `DeleteObjectCommand`)
  - RTDB/Firestore에서 imageUrl 필드 nullify (또는 메시지 자체 `deletedByOperator: true`)
  - CloudFront 캐시 invalidation (선택, 비용 고려 — 30일 후 자연 만료로 충분 시 생략)
  - audit log: `lib/audit/audit-logger.ts`에 `image_deleted_by_admin` ACTION_TYPE 추가
- AC5.3 사용자 본인 삭제 흐름: 게시글 수정 시 imageUrl 제거 → 본인 또는 자동 cleanup이 S3 객체 삭제 (Phase E lifecycle 또는 즉시 삭제)
- AC5.4 admin UI: `/admin/storage` 신규 페이지 (선택 — orphan 이미지 목록 표시 + 일괄 삭제)

### F6. Image Optimization (P1)

> **As a** 사용자, **I want** 이미지가 LCP < 2.5s 내에 표시되도록 **so that** 모바일 4G 환경에서도 빠르게 콘텐츠를 볼 수 있다.

**Acceptance Criteria**:

- AC6.1 클라이언트 압축: WebP 우선 변환 (JPEG/PNG 모두 → WebP). 단 GIF (애니메이션)은 원본 유지
- AC6.2 CloudFront response transform 또는 Lambda@Edge (선택, Phase E):
  - `Accept: image/avif` → AVIF 변환 응답
  - `Accept: image/webp` → WebP 변환 응답
  - fallback: 원본
- AC6.3 `next/image` 사용: 게시글 본문/썸네일은 `next/image` (자동 srcset + lazy load). CSP `img-src`에 `cdn(-staging)?.kkaebizigi.com` 추가
- AC6.4 Lighthouse 이미지 관련 항목 (`uses-webp-images`, `uses-optimized-images`, `uses-responsive-images`) 모두 PASS
- AC6.5 이미지 1장 평균 로드 latency P95 < 500ms (CloudFront edge cache hit 가정)
- AC6.6 LCP (게시글 상세 페이지) ≤ 2.5s (Lighthouse mobile, slow 4G)

---

## 5. Non-functional Requirements

### 5.1 Security

| 위협 | 대응 |
|---|---|
| IAM key 노출 | `.env.example`에만 placeholder. Vercel env (encrypted at rest). Rotate 절차 docs/sprint/11-sprint-images/aws-setup.md §rotation |
| presigned URL re-use | expiry 10분 + uid를 path에 포함 (`{kind}/{uid}/...`) → 타 사용자가 URL을 얻어도 본인 폴더만 PUT 가능. 단 PUT은 1회만 가능 (presigned URL의 멱등성) |
| MIME spoofing | 서버 측 Server Action에서 contentType 화이트리스트 검증 + Magic number 검증 (선택, Phase B의 server-side double-check) |
| 무한 업로드 | rate limit `lib/chat/rate-limit.ts` 재사용 + `lib/storage/upload-rate-limit.ts` 신규 (분당 10장 / 시간당 50장) |
| public bucket 노출 | bucket policy: CloudFront OAC만 GET 허용, 직접 S3 URL은 모두 deny |
| EXIF GPS 좌표 | 클라이언트 압축 단계에서 canvas re-encode로 자동 제거 |
| DDoS / 비용 폭증 | CloudFront WAF rule (선택) + AWS Budget 알림 (AC1.8) + presigned URL daily quota |
| Path traversal | path 생성 시 ULID + 확장자만 사용. 사용자 입력 filename 미사용 |

### 5.2 Performance

- 업로드 latency (P95): 모바일 4G에서 ≤ 3초 (1MB 압축 후)
- 다운로드 latency (P95): CloudFront cache hit ≤ 200ms, miss ≤ 800ms
- 클라이언트 압축 시간 (P95): ≤ 1.5초 (1920x1080 raw 5MB → 1MB)
- bundle 증가: `@aws-sdk/*`는 server-only (client bundle 영향 0). client 측 `browser-image-compression` ≤ 30KB (이미 Sprint 10에 포함)

### 5.3 Cost

| 항목 | 추정 (1000 MAU 가정) | 비용 |
|---|---|---|
| S3 storage | 평균 2GB (5 MAU/1MB × 30%) | $0.05/월 |
| S3 PUT requests | 5000/월 | $0.025 |
| S3 GET requests (origin) | 1000/월 (대부분 CloudFront 캐시) | $0.0004 |
| CloudFront egress | 50GB/월 | 무료 (1TB free tier) → $4.25 (post-free) |
| CloudFront requests | 500K/월 | 무료 (10M free tier) |
| **합계 (free tier 12개월 내)** | | **< $1/월** |
| **합계 (free tier 만료 후)** | | **~$5/월** |

prod budget $20/월 임계는 안전 마진 4x.

### 5.4 Accessibility

- 이미지 alt: 작성자가 제공한 alt 텍스트 (옵션) 또는 fallback `"{nickname}님이 보낸 이미지"`
- Lightbox: ESC로 닫기, focus trap, ARIA `role="dialog"`, `aria-modal="true"`
- 업로드 progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label="이미지 업로드 진행률"`
- 모바일 터치: ImageAttach 버튼 hit area ≥ 44×44px (iOS HIG)

### 5.5 Reliability

- 업로드 실패 시 retry: 1회 자동 retry (네트워크 에러만), 이후 사용자 수동 retry
- 부분 업로드 (presigned URL 만료 후 PUT): tmp/ prefix 사용 → lifecycle 1일 cleanup
- CloudFront cache miss 시 origin S3 가용성: AWS SLA 99.99% (region) — 자체 fallback 불필요

---

## 6. Out of Scope (이 Sprint 제외)

- 영상 업로드 (mp4/webm) — Sprint 13 후속 검토 (별도 인프라: MediaConvert + HLS)
- GIF 애니메이션 자동 변환 → MP4 (storage 절감) — 운영 데이터 기반 결정 (3개월 후)
- 이미지 검색 (AI tagging) — Out of MVP
- 이모지 / 스티커 / 짤 라이브러리 — Sprint 12 후보
- Lambda@Edge / CloudFront Function 응답 변환 (WebP/AVIF on-the-fly) — Phase E 선택 사항. 1차 launch는 클라이언트 압축으로 충분
- Terraform / AWS CDK IaC — 본 Sprint는 콘솔 + AWS CLI 수동 작업 + 명령 시퀀스 문서화. IaC는 Sprint 12 또는 별도 인프라 Sprint
- Vercel ↔ AWS OIDC federation (단명 토큰) — 현재는 long-lived IAM access key. 향후 보안 강화 항목

---

## 7. Success Metrics

| KPI | 목표 (Sprint 11 launch + 7일) | 측정 방법 |
|---|---|---|
| K1. 게시글 이미지 첨부율 | ≥ 30% | GA4 `post_create` event의 `has_image=1` 비율 |
| K2. 채팅 이미지 메시지 비율 | ≥ 10% | GA4 `chat_send` event의 `has_image=1` 비율 |
| K3. 평균 이미지 로드 P95 | < 500ms | CloudFront access log (Athena 쿼리) 또는 Sentry performance |
| K4. 업로드 실패율 | < 1% | GA4 `image_upload_failed` event 합계 / `image_upload_attempt` 합계 |
| K5. AWS 비용 | < $20/월 (prod), < $5/월 (staging) | AWS Cost Explorer + Budget 알림 |

추가 보조 지표:
- 게시글 LCP (mobile) P75 ≤ 2.5s — Sentry Speed Insights
- 게시글 이미지 평균 크기 (P50, P95) — 클라이언트 압축 효과 확인
- 운영자 image_deleted_by_admin 일평균 — 모더레이션 운영 부하

---

## 8. Risks + Pre-mortem

### 8.1 Identified Risks

| ID | Risk | 영향 | 발생 가능성 | Mitigation |
|---|---|---|---|---|
| R1 | AWS 비용 급증 (악의적 트래픽) | High | Low | AWS Budget 알림 + CloudFront WAF rate limit + presigned URL daily quota |
| R2 | IAM access key 유출 (env leak) | Critical | Low | Vercel env encrypted, .env.example placeholder only, key rotate 절차 문서화, 노출 시 즉시 IAM key disable + 새 key 발급 |
| R3 | CORS preflight 실패 (브라우저 캐시) | Medium | Medium | bucket CORS + CloudFront CORS 양쪽 동기화. 디버깅 가이드 docs/sprint/11-sprint-images/troubleshooting.md |
| R4 | presigned URL expiry 너무 짧음 → 큰 사진 업로드 중 만료 | Medium | Medium | expiry 10분 + 사용자 측 retry. 모바일 4G에서 1MB 압축 후 평균 3초 → 10분 안전 |
| R5 | 클라이언트 압축 실패 (오래된 브라우저) | Low | Medium | fallback: 원본 5MB까지 허용 (단 비WebP는 storage 비용 증가) + 사용자 측 "압축 실패 — 원본 업로드" 토스트 |
| R6 | CloudFront cache miss 폭증 (이미지마다 unique path) | Medium | Low | path 규칙: `{kind}/{uid}/{yyyymmdd}/{ulid}.{ext}` — 동일 사용자/일자 단위 잘 캐시됨. immutable URL이므로 max-age 1년 |
| R7 | Sprint 10 carry 작업 (Storage CORS) 잔존 가정 → 코드 정합성 | Medium | High | Phase B에서 deprecated 모듈 명시 + grep 검증 (`firebasestorage.googleapis.com` 잔존 0건 목표) |
| R8 | RTDB rules deploy 누락 → 이미지 URL 검증 실패 | High | Low | Phase A.5에서 `firebase deploy --only database` 명령 명시 + 검증 (E2E 1건) |
| R9 | image variant resolver 회귀 → 기존 text/link 메시지 깨짐 | High | Low | `lib/chat/message-variant.test.ts` 회귀 테스트 4 케이스 (text / link / image / deleted) |
| R10 | EXIF 제거 실패 → GPS 좌표 노출 | Medium | Low | 클라이언트 압축 시 canvas re-encode (EXIF 자동 제거) + L1 unit test에서 검증 |

### 8.2 Pre-mortem — "Sprint 11이 실패한다면 왜였을까?"

> 시점: 2026-05-25 (Sprint 11 archived 후 1주)

**시나리오 A. AWS 비용 폭증으로 staging 중단**
- 원인: WAF rate limit 미설정 + presigned URL endpoint가 익명 접근 가능
- 사전 대응: presign endpoint는 NextAuth session 필수 (AC2.3). + AWS Budget 50% 알림 시 즉시 분석

**시나리오 B. 게시글 첨부율 < 10% (목표 30% 미달)**
- 원인: 모바일 카메라 UX가 비직관적 (label 없음, 첨부 버튼 작음)
- 사전 대응: AC3.9 모바일 viewport hit area ≥ 44×44 + Sprint 10 Phase E의 모바일 검증 패턴 재사용

**시나리오 C. 운영자가 부적절 이미지를 발견했으나 CDN 캐시에 30일 잔존**
- 원인: AC5.2 cache invalidation 누락 (비용 절감 명목)
- 사전 대응: 신고 후 즉시 삭제 시 CloudFront invalidation 1건 비용 ($0.005) 감수. 이미지 신고는 일 평균 < 10건 가정 → 월 $1.5 미만 — 안전

**시나리오 D. 마이그레이션 후 기존 게시글 (Sprint 10 잠재 데이터) 이미지 깨짐**
- 원인: Sprint 10 출시 후 firebasestorage URL이 일부 게시글에 남았다면 RTDB rules + Firestore schema 변경 시 모두 깨짐
- 사전 대응: Sprint 10에서 이미지 UI 비활성화했으므로 Firebase Storage 실제 데이터 0건 가정. 다만 Phase B에서 `firebasestorage.googleapis.com` regex를 즉시 제거하지 않고 transitional period (이미지 URL 양립) 적용

**시나리오 E. Clean Arch R6 위반 (UI에서 직접 @aws-sdk import)**
- 원인: 개발 중 빠른 진행을 위해 컴포넌트에서 직접 import
- 사전 대응: `scripts/audit-clean-arch.sh`에 R6 룰 추가 (`@aws-sdk` import는 `lib/storage/*` 외 0건) + CI에서 차단

---

## 9. Stakeholder Map

| 역할 | 책임 | 의사결정권 |
|---|---|---|
| Product Owner (kay) | KPI 정의, OOS 결정 | Yes |
| Tech Lead (Claude Opus) | 아키텍처, Clean Arch 강제 | Yes (기술 결정) |
| 운영자 | 모더레이션 흐름 검증 | No (수렴 의견) |
| End User (1000 MAU) | 실제 사용 데이터 제공 | No |
| AWS Billing Owner | 비용 모니터링 | Yes (긴급 cutoff) |

---

## 10. Dependency Map

```
Sprint 10 archived ─┬─ (carry) Storage CORS, image upload UI, MessageItem image variant
                   │
                   ▼
Sprint 11 PRD ────► Plan ────► Design
                                  │
                  ┌───────────────┼─────────────────────────┐
                  ▼               ▼                         ▼
          Phase A (AWS)   Phase B (Adapter)        Phase C+D (UI 병렬)
                                  │                         │
                                  └─────────────┬───────────┘
                                                ▼
                                         Phase E (Opt + lifecycle)
                                                │
                                                ▼
                                         Phase F (Quality + Launch)
                                                │
                                                ▼
                                         Sprint 11 archived
```

**External dependencies**:
- AWS 계정 (이미 보유 가정 — 미보유 시 Sprint 11 시작 전 root account 생성 + MFA 활성화)
- 도메인 DNS (`cdn.kkaebizigi.com`, `cdn-staging.kkaebizigi.com`) — Cloudflare 또는 도메인 등록처 DNS 수정 권한 (Sprint 10 Phase C에서 이미 확보)

---

## 11. Glossary

- **Presigned URL**: AWS S3에서 발급하는 임시 PUT/GET URL — 클라이언트가 IAM 자격증명 없이 직접 S3 접근
- **Origin Access Control (OAC)**: CloudFront → S3 접근 시 새로운 권장 방식 (구 OAI 대체) — bucket policy로 CloudFront만 허용
- **Lifecycle Policy**: S3 객체의 자동 storage class 전환 또는 삭제 규칙
- **EXIF**: 사진 메타데이터 (촬영 시각, GPS, 카메라 모델 등) — PII 노출 위험
- **ULID**: 시간 정렬 가능한 unique ID — UUID 대안, S3 path에 사용
- **WebP / AVIF**: 차세대 이미지 포맷 (JPEG/PNG 대비 30~50% 작음)
- **LCP (Largest Contentful Paint)**: Core Web Vitals 지표 — 페이지의 가장 큰 콘텐츠 표시 시점
- **OAC vs OAI**: Origin Access Control (신규, SigV4) vs Origin Access Identity (구, 곧 deprecated)

---

## 12. 변경 이력

| 일자 | 변경 | 작성자 |
|---|---|---|
| 2026-05-17 | PRD 초안 — Sprint 10 carry 흡수 + AWS S3 + CloudFront 채택 결정 + F1-F6 + KPI 5종 + 위험 10건 | Claude Opus + kay |

---

> **Next Phase**: [plan.md](./plan.md) — Phase A~F task 분해 + dependency graph + 일정
