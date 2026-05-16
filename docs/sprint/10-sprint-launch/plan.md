# Sprint 10 — Implementation Plan

**Sprint**: `10-sprint-launch`
**상위 문서**: [master-plan.md](./master-plan.md), [prd.md](./prd.md)
**작성일**: 2026-05-16

---

## 0. 작업 단위 및 PR 전략

### Branch 전략
```
main ────────────────────────────────────────────────●  (production)
                              merge ↑↑↑↑↑↑                
staging ──────────●─────────●─────────●─────────────●  (preview)
                  ↑         ↑         ↑           
              feature/A  feature/B  feature/C  ...   (phase별 sub-branch)
```

각 Phase는 `feature/<phase-name>` 브랜치에서 작업 후 staging에 PR. staging에서 검증 후 main에 PR. main 머지가 production 자동 배포 트리거.

**기존 `feature/domain-firebase-integration` 브랜치**는 Phase C (도메인 컷오버) 작업으로 흡수. Phase A/B/D/E/F는 별도 branch 분기.

### PR 전략
- Phase 내 sub-task는 작은 commit 다수 + 단일 PR (squash 또는 merge commit)
- Phase 완료 시 PR 1건 (staging ← feature/X) → 리뷰 → squash merge
- staging 검증 후 PR (main ← staging) → merge commit (sprint 역사 보존)

### Commit Convention (기존 유지)
```
<type>(<scope>): <subject>

[optional body]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```
- `type`: feat / fix / refactor / chore / docs / test / perf / style
- `scope`: phase 약어 (a-backend / b-auth / c-domain / d-posts / e-chat / f-quality) + 영역

---

## 1. Phase A — Firebase Backend Activation (1~2일)

### A.1 Firestore 인덱스 + rules 검토
- **파일**: `firestore.indexes.json`, `firestore.rules`
- **작업**: 기존 indexes/rules 검토 → 누락된 query 인덱스 추가
- **검증**: `firebase deploy --only firestore:rules,firestore:indexes --project god-kkabi-guide`
- **커밋**: `chore(a-backend): Firestore rules + indexes deploy 준비`

### A.2 Realtime Database instance 생성
- **콘솔 작업** (Chrome 자동화 가능):
  1. https://console.firebase.google.com/u/4/project/god-kkabi-guide/database 진입
  2. "데이터베이스 만들기" → 위치: `asia-southeast1` → 시작 모드: 잠금
  3. instance URL 확보: `https://god-kkabi-guide-default-rtdb.asia-southeast1.firebasedatabase.app`
- **환경변수 추가** (Vercel 3 환경 모두):
  - Key: `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
  - Value: 위 URL
- **rules 확장** (A.5 작업)

### A.3 Storage bucket 활성화
- **콘솔 작업** (Chrome 자동화):
  1. https://console.firebase.google.com/u/4/project/god-kkabi-guide/storage 진입
  2. "시작하기" → 위치: `asia-southeast1` (Firestore 동일 region) → 보안 규칙: 잠금 (rules 별도 deploy)
- **rules deploy**: `firebase deploy --only storage`
- **CORS 설정** (A.4)

### A.4 Storage CORS 설정
- **파일 신규**: `infra/cors.json`
  ```json
  [
    {
      "origin": [
        "https://kkaebizigi.com",
        "https://staging.kkaebizigi.com",
        "https://www.kkaebizigi.com",
        "http://localhost:3000"
      ],
      "method": ["GET", "POST", "PUT", "HEAD"],
      "maxAgeSeconds": 3600,
      "responseHeader": ["Content-Type", "Authorization"]
    }
  ]
  ```
- **명령**: `gsutil cors set infra/cors.json gs://god-kkabi-guide.firebasestorage.app`
- **검증**: `gsutil cors get gs://god-kkabi-guide.firebasestorage.app`

### A.5 RTDB 멀티채널 rules 확장
- **파일**: `database.rules.json`
- **변경 사항** (요약, 상세는 design.md §4.2):
  - `chat/messages/{channelId}`의 `$channelId` 변수에 대해 패턴 검증 + 권한 분기
  - `global`: 모든 인증 사용자
  - `server-{$serverId}`: `users/{auth.uid}.serverId == $serverId`
  - `guild-{$guildId}`: `users/{auth.uid}.guildId == $guildId`
- **참고**: Firestore users 컬렉션 lookup이 필요 — RTDB rules는 Firestore 직접 lookup 불가 → **custom claims** 활용
  - `users/{uid}.serverId` 변경 시 Firebase Admin SDK로 custom claim 동기화
  - RTDB rules에서 `auth.token.serverId == $serverId` 검증
- **deploy**: `firebase deploy --only database`

### A.6 .firebaserc 생성
- **파일 신규**: `.firebaserc`
  ```json
  { "projects": { "default": "god-kkabi-guide" } }
  ```
- **이점**: `firebase deploy` 명령에서 `--project` 생략 가능

### A.7 12개 컬렉션 시드 데이터 (선택, Phase B와 병행)
- **파일 신규**: `scripts/seed-firestore.ts`
- **작업**: 신규 컬렉션 (직업 3, 진령 11 등)에 기본 데이터 입력
- **실행 환경**: Firebase emulator에서 dry-run → production 적용 (수동)

---

## 2. Phase B — Auth Migration (3~5일)

### B.1 Kakao 코드 삭제 (Sub-PR 1)

**삭제 (2 파일)**:
```
app/api/auth/kakao-exchange/route.ts
lib/auth/kakao.ts
```

**커밋**: `refactor(b-auth): remove Kakao OAuth bridge files`

### B.2 NextAuth Google provider 통합 (Sub-PR 2)

**수정**: `lib/auth/config.ts`
- providers 배열에서 Kakao 제거 → Google provider 추가
- Google client ID/secret 환경변수: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- jwt 콜백에서 Kakao access_token 저장 로직 제거

**수정**: `lib/auth/auth.ts`
- Kakao 관련 hydrate 로직 제거
- Google 로그인 후 Firestore `users/{uid}` 생성/업데이트 흐름 유지

**수정**: `lib/firebase/admin.ts`
- Kakao Custom Token bridge 코드 제거
- (선택) Google ID token → Firebase Custom Token bridge 함수 신규 (NextAuth + Firebase SDK 통합 검토)

### B.3 Google Bridge endpoint (Sub-PR 3)

**파일 신규**: `app/api/auth/google-bridge/route.ts`
- POST handler: NextAuth session.user.id → Firebase Admin createCustomToken
- 클라이언트는 이 token으로 `signInWithCustomToken` 호출 → Firebase Auth 세션 생성
- 보안: NextAuth session 검증 후에만 발급

**참고**: 또는 Firebase Auth GoogleProvider를 클라이언트에서 직접 호출하고 NextAuth는 사용 안 하는 방식도 가능. Trade-off는 design.md §5에서 분석.

### B.4 UI 컴포넌트 수정 (Sub-PR 4)

| 파일 | 변경 |
|---|---|
| `app/login/page.tsx` | "카카오 로그인" 버튼 → "Google로 시작하기". 색상/아이콘 Google 브랜드 가이드 |
| `app/page.tsx` | 홈 첫 진입 CTA 영역 카카오 언급 → Google |
| `app/event/page.tsx` | 이벤트 페이지 내 카카오 언급 제거 |
| `components/feature/auth-buttons.tsx` | Kakao 버튼 컴포넌트 → Google 버튼 |
| `components/feature/login-success-tracker.tsx` | provider 분기 제거 또는 google으로 단일화 |
| `components/feature/register-form.tsx` | 카카오 사용자 hydrate 로직 → Google |
| `components/domain/footer.tsx` | 푸터 카카오 언급 제거 |

### B.5 타입 정의 수정 (Sub-PR 5)

| 파일 | 변경 |
|---|---|
| `types/firestore.ts` | `users.provider: 'kakao' \| 'google'` → `'google'` 단일 또는 제거 |
| `types/next-auth.d.ts` | session.user 타입에서 카카오 필드 제거 |
| `types/ga4.ts` | `kakao_login_*` 이벤트 → `google_login_*` |

### B.6 next.config.ts 수정 (Sub-PR 6)

- `images.remotePatterns`에서 `kakaocdn.net` 제거
- Google 프로필 이미지 도메인 추가: `lh3.googleusercontent.com`
- CSP `connect-src`에서 카카오 API endpoint 제거

### B.7 회원가입 폼 재설계 (Sub-PR 7)

**수정**: `app/register/page.tsx`, `components/feature/register-form.tsx`, `lib/auth/register.ts`, `lib/auth/register-schema.ts`
- Google sign-in 직후 미등록 사용자 redirect 흐름 검증
- 폼 필드: 닉네임, 직업, PIPA 4 동의 (필수 3 + 광고 1)
- Server Action으로 Firestore `users/{uid}` update + custom claims `registered: true`

### B.8 위키 본문 정리 (Sub-PR 8)

**수정**: `data/wiki/contents.ts`
- 사용자 가이드 본문 내 "카카오로 로그인" → "Google로 로그인"
- 회원가입 안내 본문 업데이트

### B.9 E2E 테스트 (Sub-PR 9)

**파일 신규**: `__tests__/e2e/google-login.spec.ts`
- 시나리오 1: 신규 가입 (Google → /register → 폼 제출 → 홈)
- 시나리오 2: 기존 가입자 로그인 (Google → 홈)
- 시나리오 3: 미등록 사용자가 /post/new 접근 차단

### B.10 GCP OAuth client 등록 (콘솔 작업)

- https://console.cloud.google.com/apis/credentials → OAuth 2.0 client ID 생성
- Authorized JavaScript origins:
  - `https://kkaebizigi.com`
  - `https://staging.kkaebizigi.com`
  - `http://localhost:3000`
- Authorized redirect URIs:
  - `https://kkaebizigi.com/api/auth/callback/google`
  - `https://staging.kkaebizigi.com/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`
- Firebase 콘솔 Authentication > Google provider에 동일 client ID/secret 입력
- 환경변수 추가 (Vercel): `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (3 환경 모두)

### B.11 Firebase Auth 사용자 마이그레이션 검토
- 기존 Kakao 사용자가 있다면? — Firestore `users/` 비어있음 확인됨 → 없음. 마이그레이션 작업 0건.

---

## 3. Phase C — Domain Cutover (1~2일, A/B와 병렬)

이 phase는 기존 `feature/domain-firebase-integration` 브랜치에서 그대로 진행 (이미 만들어진 plan: `docs/05-infra/kkaebizigi-domain-cutover.md`).

### C.1 코드 fallback URL 수정 (Sub-PR 1)
- `app/layout.tsx:47`, `app/robots.ts:4`, `app/sitemap.ts:13` → `'https://kkaebizigi.com'`
- `components/feature/premium-checkout-button.tsx:104` → env 의존 + 명확한 fallback
- `.env.example`: `NEXT_PUBLIC_SITE_URL=https://kkaebizigi.com`

### C.2 Vercel 환경변수 분리 (Sub-PR 2, Chrome 자동화)
- Vercel Project Settings → Environment Variables → 3 환경별 분리
- (스크립트 가능: `vercel env add` CLI도 활용 가능. 단 TTY 필요 → 자동화 어려움)
- **권장: Chrome 자동화로 UI 작업**

### C.3 Vercel 도메인 등록 (Sub-PR 3, Chrome 자동화)
- staging.kkaebizigi.com → Git Branch `staging`
- www.kkaebizigi.com → Redirect to apex

### C.4 .firebaserc 생성 (Phase A.6와 동일, 통합 가능)

### C.5 DNS / SSL 검증
- `dig +short kkaebizigi.com NS A`
- `curl -sI https://kkaebizigi.com`
- 6~24h 대기 가능 (NS propagation)

---

## 4. Phase D — Posts Enrichment (3~4일)

### D.1 markdown plugin 확장 (Sub-PR 1)

**수정**: `lib/post/markdown.ts`
- `rehypeAllowedImgDomainsPlugin`과 동일 흐름으로 신규 plugin 2개 추가:
  - `rehypeYoutubeEmbedPlugin` — `<p><a href="youtube.com/watch?v=...">URL</a></p>` 패턴 감지 → `<youtube-embed videoId="...">` element 변환
  - `rehypeLinkPreviewPlugin` — 단독 `<p><a href="...">URL</a></p>` 패턴 감지 → `<link-preview url="...">` element 변환

### D.2 YouTube Embed 컴포넌트 (Sub-PR 2)

**파일 신규**: `components/feature/post/youtube-embed.tsx`
- Props: `videoId`
- 썸네일 lazy load (`https://i.ytimg.com/vi/{videoId}/maxresdefault.jpg`)
- 클릭 시 iframe 활성화 (privacy-enhanced: youtube-nocookie.com)
- 16:9 비율 유지 (aspect-ratio CSS)
- 디자인 토큰 사용 (border-radius, shadow)

### D.3 OG Preview API (Sub-PR 3)

**파일 신규**: `app/api/og-preview/route.ts`
- `GET ?url=<encoded>` → JSON `{ title, description, image, domain }`
- SSRF 방어:
  - `https://` only
  - private IP (10.x, 192.168.x, 127.x, fc00::) 차단
  - hostname DNS lookup 후 IP 검증
  - timeout 5s
- HTML 파싱: `og:title`, `og:description`, `og:image`, `<title>` fallback
- 캐싱:
  - Firestore `linkPreviewCache/{urlHash}` 7일 TTL
  - 또는 Vercel KV (있으면)
  - 우선: in-memory Map (작은 단계) → Firestore (production)

**파일 신규**: `lib/post/og-preview.ts`
- `fetchOgPreview(url: string): Promise<OgPreviewResult>`
- 캐시 hit/miss 로직
- domain reputation check (선택)

### D.4 Link Preview 컴포넌트 (Sub-PR 4)

**파일 신규**: `components/feature/post/link-preview.tsx`
- Props: `url`
- Server Component (SSR 시 OG fetch + render) 또는 Client Component (lazy)
- 카드 UI: 썸네일 (140x140 정사각) + 제목 + 설명 + 도메인
- 클릭 시 새 탭 (`rel="noopener noreferrer nofollow"`)
- fetch 실패 시 plain `<a>` link fallback

### D.5 CSP 업데이트 (Sub-PR 5)

**수정**: `next.config.ts`
- `Content-Security-Policy` 헤더:
  - `frame-src https://www.youtube.com https://www.youtube-nocookie.com`
  - `img-src` 에 OG 미리보기 이미지 도메인 (또는 모든 https — trade-off)

### D.6 작성 폼 UX (Sub-PR 6)

**수정**: `components/feature/post/post-editor.tsx` (또는 동등 파일)
- URL 붙여넣기 시 미리보기 (debounce 500ms)
- 이미지 드래그앤드롭 + 클립보드 붙여넣기
- localStorage 자동 저장 (5s)
- 라이브 프리뷰 토글

### D.7 게시글 상세 페이지 (Sub-PR 7)

**수정**: `app/post/[id]/page.tsx`
- Server Component에서 markdown 렌더
- YouTube embed / Link preview는 client component (interactive)
- 디자인 토큰 일관성

### D.8 테스트 (Sub-PR 8)

- `__tests__/lib/post/markdown.spec.ts`: rehype plugin unit test
- `__tests__/lib/post/og-preview.spec.ts`: SSRF 방어 + 캐시
- `__tests__/e2e/post-create.spec.ts`: 작성 + YouTube 임베드 + 링크 미리보기

---

## 5. Phase E — Chat UI 신규 구현 (5~7일)

### E.1 채널 토폴로지 인프라 (Sub-PR 1)

**파일 신규**: `lib/chat/channel-resolver.ts`
- 함수: `resolveChannelsForUser(uid: string): Promise<Channel[]>`
- Firestore `users/{uid}` 읽어 serverId/guildId 가져옴 → `['global', 'server-{serverId}', 'guild-{guildId}']` 반환

**파일 신규**: `lib/chat/channel-permission.ts`
- 함수: `canAccessChannel(channelId: string, user: User): boolean`
- 클라이언트 사이드 사전 검증 (rules가 최종 진실)

**수정**: `lib/auth/custom-claims.ts` (신규 또는 기존 extend)
- `users/{uid}.serverId / guildId` 변경 시 Firebase Auth custom claims 동기화
- Server Action 또는 onWrite trigger (Spark에선 Cloud Functions 불가 → Server Action으로 직접 호출 + 사용자 본인 또는 admin만)

### E.2 RTDB rules 멀티채널 (Sub-PR 2 + Phase A.5와 통합)

**수정**: `database.rules.json`
- 채널 패턴별 권한:
  ```json
  "messages": {
    "$channelId": {
      ".read": "auth != null && (
        $channelId === 'global' ||
        ($channelId.matches(/^server-(.+)$/) && auth.token.serverId === $channelId.substring(7)) ||
        ($channelId.matches(/^guild-(.+)$/) && auth.token.guildId === $channelId.substring(6))
      )",
      ".write": "..." (동일 패턴)
    }
  }
  ```
- (RTDB rules의 `$channelId.matches()` 정규식 지원 검증 필요 — 미지원 시 `$channelId.startsWith('server-')` + substring 활용)

### E.3 Chat 레이아웃 + 라우팅 (Sub-PR 3)

**파일 신규**:
- `app/chat/layout.tsx` — 사이드바 grid layout
- `app/chat/page.tsx` — 기본 global 채널 redirect
- `app/chat/[channelId]/page.tsx` — 동적 채널 페이지

### E.4 ChannelSidebar 컴포넌트 (Sub-PR 4)

**파일 신규**: `components/feature/chat/channel-sidebar.tsx`
- 채널 목록: Global / Server-{userServerId} / Guild-{userGuildId}
- active 채널 강조
- 안 읽은 수 (선택, RTDB lastRead timestamp 활용)
- 모바일: Sheet (drawer) 패턴

### E.5 MessageList + MessageItem (Sub-PR 5)

**파일 신규**:
- `components/feature/chat/message-list.tsx` — `useChannel` hook 호출 + 스크롤 관리 + loadOlder
- `components/feature/chat/message-item.tsx` — variants: text / image / link-preview / pinned
- `components/feature/chat/message-context-menu.tsx` — 신고 / 복사 / 운영자 액션

### E.6 MessageComposer (Sub-PR 6)

**파일 신규**: `components/feature/chat/message-composer.tsx`
- Textarea + image attach button + send button
- Image preview before send (1MB 검증)
- Enter 전송, Shift+Enter 줄바꿈
- 마스킹 클라이언트 사전 적용

### E.7 LinkPreviewInMessage (Sub-PR 7)

**파일 신규**: `components/feature/chat/link-preview-in-message.tsx`
- Phase D의 OG preview API 재사용
- 채팅 컨텍스트에 맞게 작은 카드 (게시글보다 컴팩트)

### E.8 ReportDialog (Sub-PR 8)

**파일 신규**: `components/feature/chat/report-dialog.tsx`
- 사유 선택 (욕설/광고/도배/기타)
- `lib/chat/report-action.ts` 재사용
- Firestore `reports/{reportId}` 생성

### E.9 페이지네이션 + 가상화 (Sub-PR 9)

**수정**: `lib/chat/use-channel.ts` (이미 `loadOlder` 있음)
- 50개씩 추가 로드
- 가상화 (`@tanstack/react-virtual`) 도입 검토 — 100건+ 시 성능

### E.10 모더레이션 (Sub-PR 10)

- Rate limit: client-side throttle (5건/5초) + RTDB rules `newData.child('createdAt').val() > data.child('createdAt').val() + 1000` 등
- banned: custom claims `role: 'banned'` 검증 (이미 rules에 있음)

### E.11 E2E + 부하 테스트 (Sub-PR 11)

- E2E: 2 사용자 동시 채팅 + 이미지 + 링크 미리보기
- 부하: 100 메시지 빠른 송수신 → Spark 한도 확인

---

## 6. Phase F — Quality / Launch (2~3일)

### F.1 Clean Architecture 감사 스크립트

**파일 신규**: `scripts/audit-clean-arch.sh`
```bash
#!/bin/bash
# Firebase SDK import는 lib/firebase/*에만
echo "=== Firebase SDK 외부 import 감지 ==="
grep -rln "from 'firebase/" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules \
  | grep -v "^lib/firebase/" | grep -v "^types/" \
  && echo "❌ 위반" || echo "✓ 통과"

# Server-only code는 'server-only' import 필수
echo "=== Server Action / Route Handler 'server-only' 검증 ==="
# ...
```

### F.2 디자인 시스템 감사
- grep `#[0-9a-fA-F]{3,6}` (하드코딩 hex)
- grep `\d+px` (하드코딩 px 외 Tailwind scale 사용 검증)

### F.3 Lighthouse 최적화
- 이미지 next/image + WebP 변환
- 폰트 preload + display: swap
- JS bundle 분석 (`next build` analyze)

### F.4 Sentry 통합
- `@sentry/nextjs` 설치
- production-only 활성화
- 5xx 알림 룰 (Slack/email)

### F.5 출시 체크리스트 실행
- master-plan.md §9 모든 항목 확인
- E2E 7-Layer 전체 통과
- Lighthouse 90+

### F.6 출시 PR + 머지
- staging → main PR
- main 자동 prod 배포 검증
- 출시 보고서 작성 (sprint-report-writer 활용)

---

## 7. 파일별 변경 매트릭스 (요약)

| 파일/디렉토리 | Phase | 변경 종류 |
|---|---|---|
| `app/api/auth/kakao-exchange/route.ts` | B | 삭제 |
| `app/api/auth/google-bridge/route.ts` | B | 신규 |
| `app/api/og-preview/route.ts` | D | 신규 |
| `app/chat/layout.tsx` | E | 신규 |
| `app/chat/page.tsx` | E | 신규 |
| `app/chat/[channelId]/page.tsx` | E | 신규 |
| `app/{login,page,event,register}/page.tsx` | B | 수정 |
| `app/post/[id]/page.tsx` | D | 수정 (embed/preview 렌더) |
| `app/{layout,robots,sitemap}.ts` | C | 수정 (fallback URL) |
| `lib/auth/kakao.ts` | B | 삭제 |
| `lib/auth/{config,auth,register,register-schema}.ts` | B | 수정 |
| `lib/auth/custom-claims.ts` | E | 신규 |
| `lib/chat/channel-resolver.ts` | E | 신규 |
| `lib/chat/channel-permission.ts` | E | 신규 |
| `lib/post/markdown.ts` | D | 수정 (rehype plugins 추가) |
| `lib/post/og-preview.ts` | D | 신규 |
| `lib/firebase/admin.ts` | B | 수정 |
| `components/feature/auth-buttons.tsx` | B | 수정 |
| `components/feature/login-success-tracker.tsx` | B | 수정 |
| `components/feature/register-form.tsx` | B | 수정 |
| `components/feature/post/youtube-embed.tsx` | D | 신규 |
| `components/feature/post/link-preview.tsx` | D | 신규 |
| `components/feature/chat/*` (8~10 파일) | E | 신규 |
| `components/domain/footer.tsx` | B | 수정 |
| `components/feature/premium-checkout-button.tsx` | C | 수정 |
| `types/{firestore,ga4,next-auth}.d.ts` | B | 수정 |
| `data/wiki/contents.ts` | B | 수정 |
| `next.config.ts` | B + D | 수정 (Kakao 도메인 제거, CSP) |
| `database.rules.json` | A + E | 확장 |
| `firestore.rules` | A | 검토 |
| `firestore.indexes.json` | A | 확장 |
| `storage.rules` | A | 검토 |
| `.firebaserc` | A | 신규 |
| `.env.example` | B + C | 수정 |
| `infra/cors.json` | A | 신규 |
| `scripts/seed-firestore.ts` | A | 신규 |
| `scripts/audit-clean-arch.sh` | F | 신규 |
| `__tests__/e2e/*` | B + D + E | 신규 다수 |

**예상 총 변경**: 삭제 2, 신규 ~25, 수정 ~30, 콘솔 작업 ~15

---

## 8. 인프라 변경 (Vercel + Firebase + GCP + 후이즈)

| 시스템 | 변경 | 시점 |
|---|---|---|
| Firebase Console | RTDB instance 생성 (asia-southeast1) | Phase A |
| Firebase Console | Storage bucket 활성화 | Phase A |
| Firebase Console | Authentication > Google provider 활성 + OAuth client 입력 | Phase B (B.10 이후) |
| Firebase Console | Authorized domains (kkaebizigi.com 등 추가) | ✅ 완료 |
| GCP Console | OAuth 2.0 client ID 발급 + redirect URI | Phase B |
| gsutil | Storage CORS 설정 | Phase A |
| firebase CLI | rules/indexes deploy (firestore, database, storage) | Phase A |
| Vercel Console | Domains: staging + www 추가 | Phase C |
| Vercel Console | Env Vars: preview 환경 + 신규 키 (DB_URL, GOOGLE_*) | Phase A + B |
| Vercel Console | Speed Insights / Sentry integration | Phase F |
| 후이즈 | 입금 + 도메인 활성 | ✅ 완료 (대기) |

---

## 9. 검증 시나리오 (각 Phase 종료 시)

### Phase A 종료 시
- [ ] `firebase deploy --only firestore:rules,firestore:indexes,database,storage` 0 에러
- [ ] RTDB 콘솔에서 `chat/messages/global/test` 임의 노드 생성 후 rules 검증
- [ ] Storage 콘솔에서 1MB 이미지 업로드 테스트 (anonymous 차단 검증)

### Phase B 종료 시
- [ ] `grep -rni kakao` 결과 0건 (코드)
- [ ] `localhost:3000`에서 Google sign-in 흐름 신규 + 기존 가입 시나리오 통과
- [ ] `signInWithCustomToken` 후 Firestore `users/{uid}` 자동 생성 확인

### Phase C 종료 시
- [ ] `dig +short kkaebizigi.com A staging.kkaebizigi.com CNAME`
- [ ] `curl -sI https://kkaebizigi.com https://staging.kkaebizigi.com https://www.kkaebizigi.com`
- [ ] preview 빌드에 Firebase env 누락 0건

### Phase D 종료 시
- [ ] 게시글에 YouTube URL → 임베드 변환 시각 확인
- [ ] 일반 URL → 미리보기 카드 변환 시각 확인
- [ ] SSRF 시도 (private IP, localhost) 차단 확인

### Phase E 종료 시
- [ ] 채팅 채널 3개 (global / server-X / guild-Y) 모두 동작
- [ ] 다른 server/guild 사용자가 채널 접근 시 권한 거부
- [ ] 이미지 전송 + 링크 미리보기 + 페이지네이션 시각 확인

### Phase F 종료 시
- [ ] Clean Arch 감사 스크립트 0 위반
- [ ] Lighthouse mobile + desktop 90+
- [ ] Sentry 알림 채널 검증
- [ ] 출시 체크리스트 (master-plan.md §9) 100%

---

## 10. 변경 이력

| 일자 | 변경 | 작성자 |
|---|---|---|
| 2026-05-16 | Implementation plan 초안 — 6 phase x 6~11 sub-PR, 파일 매트릭스, 검증 시나리오 | Claude + kay |
