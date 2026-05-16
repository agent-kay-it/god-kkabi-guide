# Sprint 10 — PRD (Product Requirements Document)

**Sprint**: `10-sprint-launch`
**상위 문서**: [master-plan.md](./master-plan.md)
**작성일**: 2026-05-16

---

## 1. 페르소나 (Personas)

### P1. 가이드 탐색자 (게스트, 로그인 전)
- **상황**: 게임 검색 중 깨비지기 가이드 발견. 로그인 없이 위키/공략 글 보러 옴
- **요구**: 빠른 로딩, 모바일 가독성, 쉬운 검색
- **터치포인트**: `/`, `/wiki/*`, `/post`

### P2. 등록 사용자 (게이머)
- **상황**: 게임 길드원 또는 단독 플레이어. Google 계정으로 가입. 빌드/팁/공략 글 작성 + 채팅
- **요구**: Google 1-tap 로그인, 모바일 작성 UX, YouTube 임베드, 길드 채팅
- **터치포인트**: `/login`, `/post/new`, `/chat`, `/me`

### P3. 길드 운영자 (Guild Master)
- **상황**: 게임 길드 운영자. 길드원 모집/공지 + 길드 전용 채팅 채널 운영
- **요구**: 길드 채널 격리, 멤버 관리, 공지 핀
- **터치포인트**: `/chat/guild/{guildId}`, `/admin/guild`

### P4. 운영자 (Site Admin)
- **상황**: 사이트 모더레이션, 신고 처리, 통계
- **요구**: Admin 대시보드, 신고 처리 큐, 사용자 검색/제재
- **터치포인트**: `/admin/*`

---

## 2. Feature Area 1 — Authentication (Google sign-in 단일)

### F1.1 Google sign-in (필수, 우선순위 P0)

**User Story**:
> 가이드 탐색자로서 `/login` 페이지에서 "Google로 시작하기" 버튼 한 번 클릭으로 회원가입과 로그인을 동시에 완료하고 싶다. Kakao 등 다른 옵션은 보이지 않아야 한다.

**Acceptance Criteria**:
- AC1.1.1 `/login` 페이지에 **"Google로 시작하기" 버튼만 노출** (Kakao 버튼 0건)
- AC1.1.2 버튼 클릭 → Google OAuth consent 화면 → callback → Firestore `users/{uid}` 자동 생성 → `/` 또는 `returnTo` redirect
- AC1.1.3 NextAuth session.user.id 와 Firebase Auth uid가 **항상 일치** (Custom Token bridge)
- AC1.1.4 Firebase Auth Authorized Domains에 `kkaebizigi.com`, `staging.kkaebizigi.com`, `localhost` 포함
- AC1.1.5 GCP OAuth client에 redirect URI 등록: `https://kkaebizigi.com/api/auth/callback/google`, `https://staging.kkaebizigi.com/api/auth/callback/google`, `http://localhost:3000/api/auth/callback/google`
- AC1.1.6 로그아웃 시 NextAuth + Firebase Auth 양쪽 세션 모두 destroy
- AC1.1.7 로그인 실패 시 사용자 친화적 에러 메시지 + Sentry 에러 캡처

**Non-functional**:
- 로그인 흐름 ≤ 3초 (Google consent 제외, callback → home redirect)
- 모바일에서 1-tap (Google One Tap 라이브러리 사용 검토)

### F1.2 회원가입 보강 폼 (P1)

**User Story**:
> Google로 첫 가입한 사용자로서 닉네임/직업/광고 동의를 추가 입력하는 폼을 자동으로 만나고 싶다. 입력 완료 전까지는 글쓰기/채팅이 제한되어야 한다.

**Acceptance Criteria**:
- AC1.2.1 Google sign-in 직후 `users/{uid}.registered` 가 false면 `/register` 강제 redirect
- AC1.2.2 폼 필드: 닉네임 (2~12자, 한글/영문/숫자), 직업 (warrior/swordsman/medium), PIPA 4 동의 (필수 3 + 선택 1: 광고)
- AC1.2.3 제출 시 Server Action으로 Firestore `users/{uid}` update + Firebase Auth custom claims (`registered: true`)
- AC1.2.4 미등록 사용자는 `/post/new`, `/chat` 접근 차단 (server-side guard)
- AC1.2.5 기존 Kakao 가입 코드 제거 시 회원가입 흐름 회귀 없음 (E2E 검증)

### F1.3 Kakao 코드 전면 제거 (P0)

**Acceptance Criteria**:
- AC1.3.1 `grep -rni "kakao" --include="*.ts" --include="*.tsx"` 결과 **0건** (코드 + 타입)
- AC1.3.2 `lib/auth/kakao.ts`, `app/api/auth/kakao-exchange/route.ts` 삭제
- AC1.3.3 UI 컴포넌트 (auth-buttons, login-success-tracker, register-form, footer) Kakao 언급 제거
- AC1.3.4 `types/{firestore,ga4,next-auth}.d.ts` Kakao provider type 제거
- AC1.3.5 `next.config.ts` Kakao 이미지 도메인 (kakaocdn.net 등) 제거
- AC1.3.6 `data/wiki/contents.ts` 위키 본문 내 "카카오 로그인" 언급 → "Google 로그인"으로 교체 또는 삭제
- AC1.3.7 Sentry/Analytics 이벤트 (`kakao_login_*`) → `google_login_*`로 rename

---

## 3. Feature Area 2 — Posts (게시글 enrichment)

### F2.1 YouTube 임베드 (P0)

**User Story**:
> 등록 사용자로서 게시글 본문에 YouTube URL을 붙여넣으면 자동으로 영상 임베드 카드로 변환되어 표시되길 원한다. 모바일에서도 끊김 없이 재생되어야 한다.

**Acceptance Criteria**:
- AC2.1.1 본문에 `https://www.youtube.com/watch?v={id}` 또는 `https://youtu.be/{id}` 또는 `https://www.youtube.com/shorts/{id}` URL이 **단독 줄**로 있을 경우 임베드 카드로 자동 변환
- AC2.1.2 임베드 카드: 16:9 비율 iframe + 썸네일 lazy load + 클릭 시 재생 시작 (lite-youtube-embed 패턴)
- AC2.1.3 markdown rehype plugin으로 변환 (server-side render, dangerouslySetInnerHTML sanitize 통과)
- AC2.1.4 CSP `frame-src https://www.youtube.com https://youtube.com` 추가
- AC2.1.5 게시글 미리보기 (목록)에는 썸네일만 표시, 본문에서만 재생 가능
- AC2.1.6 모바일 반응형: 320~1920 viewport에서 16:9 유지

### F2.2 링크 OG 미리보기 (P0)

**User Story**:
> 등록 사용자로서 게시글 본문에 일반 URL을 붙여넣으면 사이트 제목/설명/썸네일이 있는 카드로 자동 변환되길 원한다.

**Acceptance Criteria**:
- AC2.2.1 본문에 일반 URL (YouTube 외)이 **단독 줄**로 있을 경우 미리보기 카드로 자동 변환
- AC2.2.2 카드: 썸네일 (og:image) + 제목 (og:title) + 설명 (og:description) + 도메인 표시
- AC2.2.3 서버 측 API route `/api/og-preview?url=...` 신규 구현
   - SSRF 방어: 도메인 화이트리스트 (또는 IP 차단), private IP/loopback 차단, timeout 5s
   - 캐싱: Firestore `linkPreviewCache/{urlHash}` 또는 Vercel KV (없으면 in-memory)
- AC2.2.4 미리보기 fetch 실패 시 plain URL link로 fallback
- AC2.2.5 미리보기 카드 클릭 시 새 탭 (`rel="noopener noreferrer"`)
- AC2.2.6 markdown rehype plugin으로 통합 (YouTube 임베드와 동일 흐름)

### F2.3 게시글 작성 UX 개선 (P1)

- AC2.3.1 작성 폼에 URL 붙여넣기 시 즉시 미리보기 (client-side preview, debounce 500ms)
- AC2.3.2 이미지 업로드: 드래그앤드롭 + 클립보드 붙여넣기 (현재 button만 있으면 보강)
- AC2.3.3 작성 중 자동 저장 (localStorage, 5초마다)
- AC2.3.4 markdown 라이브 프리뷰 토글

---

## 4. Feature Area 3 — Chat (3-tier 채널 + 신규 UI)

### F3.1 채널 토폴로지 (P0)

**채널 종류**:
1. **Global** — 전체 사용자 1개 (`global`)
2. **Server (서버 전체)** — 게임 서버 단위 (`server-{serverId}`). 게임 내 동일 서버 사용자만 접근
3. **Guild (문파별)** — 길드 단위 (`guild-{guildId}`). 동일 길드 멤버만 접근

**User Story**:
> 사용자로서 자기 게임 서버와 길드에 맞는 채팅 채널에 자동으로 입장하고, 전체 채팅도 따로 참여하고 싶다.

**Acceptance Criteria**:
- AC3.1.1 RTDB 경로: `chat/messages/{channelId}/{messageId}`
- AC3.1.2 사용자 Firestore `users/{uid}.serverId` + `users/{uid}.guildId` 필드 추가 (회원가입 폼에서 선택)
- AC3.1.3 채널 접근 권한 RTDB rules:
   - `global`: 인증된 모든 사용자
   - `server-{serverId}`: 인증된 사용자 + `users/{uid}.serverId == $serverId`
   - `guild-{guildId}`: 인증된 사용자 + `users/{uid}.guildId == $guildId`
- AC3.1.4 채널 목록 UI: 사이드바에 Global + 자기 server + 자기 guild 3개 동시 표시
- AC3.1.5 채널 전환 시 메시지 빠르게 swap (50ms 이내 첫 메시지 표시)

### F3.2 채팅 UI 컴포넌트 (P0, 신규 구현)

**Components 신규 (예상 10개)**:
- `ChatLayout` — 사이드바 + 메시지 영역 + 입력창 grid
- `ChannelSidebar` — 채널 목록 + active 표시 + 안 읽은 수
- `MessageList` — 메시지 가상화 (react-virtual or 단순 limit)
- `MessageItem` — 일반 / 이미지 / 링크 미리보기 / 운영자 핀 variant
- `MessageComposer` — 텍스트 + 이미지 첨부 + 이모지 (선택) + 전송 버튼
- `ImageUploadPreview` — 업로드 전 썸네일 + 제거 + 1MB 검증
- `LinkPreviewInMessage` — 채팅 메시지 내 링크 미리보기 (F2.2와 공유 컴포넌트)
- `MessageContextMenu` — 신고, 복사, 운영자 (숨김/삭제) 액션
- `ReportDialog` — 신고 사유 선택 + 제출
- `TypingIndicator` — 누가 입력 중인지 (선택, RTDB presence)

### F3.3 메시지 기능 (P0)

- AC3.3.1 텍스트 메시지 (≤ 500자), 마스킹 (`lib/chat/masking.ts` 재사용)
- AC3.3.2 이미지 업로드 (Storage `/chat/{channelId}/{uid}/{filename}`, 1MB, image/jpeg|png|webp)
- AC3.3.3 메시지 내 URL → 링크 미리보기 카드 자동 (F2.2와 동일 OG fetch)
- AC3.3.4 메시지 페이지네이션: 최근 50개 → 위로 스크롤 시 50개 추가 로드 (`loadOlder` 사용)
- AC3.3.5 새 메시지 도착 시 자동 스크롤 (사용자가 맨 아래에 있을 때만)
- AC3.3.6 신고: 메시지별 우클릭/롱프레스 → 신고 다이얼로그 → Firestore `reports/{reportId}`
- AC3.3.7 운영자: 메시지 hidden/deletedByOperator 토글 (기존 `lib/chat/report-action.ts` 재사용)

### F3.4 채팅 모더레이션 (P1)

- AC3.4.1 동일 사용자 5초 이내 5건 이상 → rate limit (RTDB rules 또는 client-side)
- AC3.4.2 부적절한 단어 자동 마스킹 (`maskBadWords` 사용)
- AC3.4.3 banned 사용자 작성 차단 (custom claims `role: 'banned'` 검증)

---

## 5. Feature Area 4 — Domain Cutover

### F4.1 Vercel Domain 등록 (P0)

- AC4.1.1 `staging.kkaebizigi.com` 추가 → Git Branch = `staging`
- AC4.1.2 `www.kkaebizigi.com` 추가 → Redirect to `kkaebizigi.com` (308)
- AC4.1.3 모든 도메인 verified + SSL 자동 발급 완료
- AC4.1.4 구 `god-kkabi-guide.vercel.app` 유지 (외부 공유 fallback)

### F4.2 환경변수 분리 (P0)

- AC4.2.1 Vercel Project Env: Production/Preview/Development 3 환경 모두에 다음 7+2 키 설정
   - `NEXT_PUBLIC_FIREBASE_*` (7개) — 환경 무관 동일값
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — 환경 무관 동일값
   - `NEXT_PUBLIC_SITE_URL` — production: `https://kkaebizigi.com`, preview: `https://staging.kkaebizigi.com`, development: `http://localhost:3000`
   - `AUTH_URL` — 동일 패턴
   - `AUTH_SECRET` — production/preview 분리 (보안)
- AC4.2.2 Preview 빌드에서 Firebase env 누락 0건 검증

### F4.3 코드 fallback 정리 (P0)

- AC4.3.1 `app/{layout,robots,sitemap}.ts` fallback URL → `https://kkaebizigi.com`
- AC4.3.2 `components/feature/premium-checkout-button.tsx` 빈 fallback → env 의존
- AC4.3.3 `.env.example` `NEXT_PUBLIC_SITE_URL` 예제 값 업데이트

### F4.4 DNS 검증 (P0)

- AC4.4.1 `dig +short kkaebizigi.com NS` → ns1/ns2.vercel-dns.com
- AC4.4.2 `dig +short kkaebizigi.com A` → 76.76.21.21
- AC4.4.3 `curl -sI https://kkaebizigi.com` → 200 또는 308
- AC4.4.4 `curl -sI https://staging.kkaebizigi.com` → 200
- AC4.4.5 SSL Labs 등급 A+ (선택)

---

## 6. Feature Area 5 — Firebase Backend Activation

### F5.1 Firestore 초기 구조 + rules (P0)

- AC5.1.1 12개 컬렉션 schema 정의 (design.md §3.1 참조)
- AC5.1.2 `firestore.indexes.json` 모든 query에 대한 인덱스 정의
- AC5.1.3 `firebase deploy --only firestore:rules,firestore:indexes` 성공
- AC5.1.4 emulator 통합 테스트 통과

### F5.2 Realtime Database 활성화 + rules (P0)

- AC5.2.1 Firebase 콘솔에서 RTDB instance 생성 (region: asia-southeast1)
- AC5.2.2 `NEXT_PUBLIC_FIREBASE_DATABASE_URL` env 값 추가 (`https://god-kkabi-guide-default-rtdb.asia-southeast1.firebasedatabase.app`)
- AC5.2.3 `database.rules.json`에 멀티채널 권한 추가 (global / server-{} / guild-{})
- AC5.2.4 `firebase deploy --only database` 성공

### F5.3 Storage 활성화 + CORS (P0)

- AC5.3.1 Firebase 콘솔에서 Storage bucket 활성화
- AC5.3.2 `storage.rules` deploy
- AC5.3.3 `gsutil cors set cors.json gs://god-kkabi-guide.firebasestorage.app` 실행
- AC5.3.4 도메인 화이트리스트: localhost / kkaebizigi.com / staging.kkaebizigi.com

### F5.4 .firebaserc 생성 (P1)

- AC5.4.1 프로젝트 루트에 `.firebaserc` 추가
- AC5.4.2 `firebase deploy --only <target>` 명령에서 `--project` 플래그 생략 가능

---

## 7. Feature Area 6 — Quality & Launch

### F6.1 Clean Architecture 감사 (P0)

- AC6.1.1 Firebase SDK 직접 import는 `lib/firebase/*`에만 존재 — 위반 0건
- AC6.1.2 domain 레이어 (`lib/post/*`, `lib/chat/*`)는 infra 직접 의존 X — adapter 통과
- AC6.1.3 UI 컴포넌트는 Server Action 또는 hook 통해서만 데이터 접근
- AC6.1.4 grep 기반 자동 감사 스크립트 추가 (`scripts/audit-clean-arch.sh`)

### F6.2 디자인 시스템 일관성 (P0)

- AC6.2.1 모든 페이지가 디자인 토큰 v2 사용 (`design-tokens-v2.json` 매핑)
- AC6.2.2 하드코딩 색상 (#xxx, rgb()) 0건 — `tailwind.config.ts` token 사용
- AC6.2.3 하드코딩 spacing (px) 0건 — Tailwind scale 사용
- AC6.2.4 shadcn/ui + Magic UI 컴포넌트만 사용 (커스텀 컴포넌트는 components/feature/* 에)

### F6.3 코딩 컨벤션 (P0)

- AC6.3.1 ESLint 0 error, ≤5 warning
- AC6.3.2 Prettier 모든 파일 format 통과
- AC6.3.3 TypeScript strict mode, `tsc --noEmit` 0 error
- AC6.3.4 docs/02-design/coding-convention.md 100% 준수

### F6.4 E2E + Lighthouse (P0)

- AC6.4.1 7-Layer dataFlowIntegrity 시나리오 7개 통과
   - 로그인 / 게시글 작성 / 게시글 조회 / 북마크 / 채팅 / 이미지 업로드 / 신고
- AC6.4.2 Lighthouse mobile + desktop 모두 90+
- AC6.4.3 Sentry 통합 + 5xx 알림

### F6.5 출시 (P0)

- AC6.5.1 출시 체크리스트 (master-plan.md §9) 모든 항목 ✓
- AC6.5.2 production 도메인 publicly accessible
- AC6.5.3 출시 공지 (선택)

---

## 8. Stakeholder Map

| Stakeholder | 역할 | 의사결정 권한 |
|---|---|---|
| kay (Product Owner) | PRD 승인, 디자인 결정, 출시 결정 | 모든 결정 |
| Claude (AI Engineering Pair) | 구현, 분석, 코드 리뷰 | 기술 결정 (구조/구현) |
| Firebase / Google Cloud | OAuth client 발급, Spark 한도 | (외부) |
| Vercel | 도메인/SSL 자동, deployment | (외부) |
| 후이즈 | 도메인 등록 + NS 설정 | (외부, 결제 완료) |

---

## 9. Pre-mortem (출시 실패 시나리오)

### S1. 출시 후 30분 내 5xx 폭주
- 원인: Firebase rules 잘못 (deny 너무 강함) 또는 환경변수 누락
- 완화: 출시 직전 staging에서 전체 시나리오 검증, rules emulator 테스트 필수, Sentry 알림 즉시 받기
- 롤백: Vercel deployment rollback (이전 prod로) + `god-kkabi-guide.vercel.app` 트래픽 유도

### S2. Google sign-in 실패율 50%+
- 원인: OAuth client redirect URI 누락, Authorized domains 누락
- 완화: Phase B 첫 작업에 redirect URI 등록 + 사전 검증
- 롤백: 로그인 없이 읽기만 가능한 mode로 임시 전환 (feature flag)

### S3. Spark 한도 도달 (Firestore reads, Storage egress)
- 원인: 캐싱 부재 + 이미지 최적화 부족
- 완화: SWR/React Query 캐싱, Vercel edge cache, WebP 변환
- 롤백/긴급조치: Blaze 업그레이드 즉시 (월 ~$25)

### S4. 채팅 RTDB 동시접속 100명+에서 지연
- 원인: 단일 채널에 모든 사용자 (global 채널)
- 완화: 채널 분할 (server/guild) + limitToLast 50 + indexOn 적용
- 롤백: Global 채널 임시 비활성화

---

## 10. 변경 이력

| 일자 | 변경 | 작성자 |
|---|---|---|
| 2026-05-16 | PRD 초안 — 6 feature area + 페르소나 4 + acceptance criteria 60+ | Claude + kay |
