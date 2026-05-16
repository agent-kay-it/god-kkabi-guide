# kkaebizigi.com 도메인 컷오버 + Firebase 통합 작업 계획

**작성일**: 2026-05-16
**작업 브랜치**: `feature/domain-firebase-integration`
**기준 PRD/Design**: docs/sprint/03-sprint-mvp-v2/phase-2-design/auth-flow.md, docs/05-infra/environments.md
**선행 조건**: 도메인 후이즈 입금 완료 (38,200원, 2026-05-16) → 도메인 등록 + NS propagation 대기

---

## 1. 작업 배경

| 항목 | 값 |
|---|---|
| 신규 도메인 | `kkaebizigi.com` (후이즈 등록, 블라인드 등록 포함) |
| 후이즈 NS 설정 | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` (완료) |
| Vercel 프로젝트 | `kkaebizigi` (team: `agent-kay-project`, projectId: `prj_4g0diSvSe4atumw7y0tsNyl2edAG`) |
| Firebase 프로젝트 | `god-kkabi-guide` (projectId 영구 — 변경 불가, displayName만 `kkaebizigi`) |
| 현 fallback 도메인 | `god-kkabi-guide.vercel.app` (구), `kkaebizigi.vercel.app` (코드 fallback, 실제 미점유) |
| Vercel productionBranch | `main` (자동 배포 라인 검증 완료) |
| Vercel preview 대상 브랜치 | `staging` (자동 배포 라인 검증 완료) |

목표: `main` → `https://kkaebizigi.com`, `staging` → `https://staging.kkaebizigi.com` 으로 전환. Firebase의 모든 인증/데이터/스토리지 기능이 새 도메인에서 정상 동작.

---

## 2. Firebase 통합 현황 (현 코드베이스 전수 조사 결과)

### 2.1 활성 Firebase 제품 5개

| 제품 | 사용처 | 핵심 파일 |
|---|---|---|
| **Authentication** | NextAuth v5 + Kakao OAuth + Firebase Custom Token bridge | `lib/auth/auth.ts`, `lib/auth/config.ts`, `app/api/auth/kakao-exchange/route.ts` |
| **Firestore** | users/posts/comments/bookmarks/advertising_consent/user_claims_retry_queue 등 12+ 컬렉션 | `lib/firebase/firestore.ts`, `firestore.rules`, `firestore.indexes.json` |
| **Realtime Database** | chat messages (`/chat/messages/{channelId}/{messageId}`) | `lib/firebase/realtime-db.ts`, `lib/chat/{use-channel,send-message,image-upload}.ts`, `database.rules.json` |
| **Storage** | 채팅/게시물 이미지 (1MB 제한, image/jpeg\|png\|webp) | `storage.rules`, `lib/post/image-upload.ts`, `lib/chat/image-upload.ts` |
| **Analytics** | measurementId: `G-PBS54YVK5F` | `lib/firebase/analytics.ts` |

### 2.2 환경변수 매트릭스

| Env Key | 노출 | 현재 값 (Firebase 콘솔 기준) |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | 클라이언트 | `AIzaSyC1VzDrRpgItCOz0ZM7w6OX0D1-j09TV30` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 클라이언트 | `god-kkabi-guide.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 클라이언트 | `god-kkabi-guide` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | 클라이언트 | `god-kkabi-guide.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 클라이언트 | `63145875132` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 클라이언트 | `1:63145875132:web:3df929ac5e11ed2a4ae2b9` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | 클라이언트 | `G-PBS54YVK5F` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | 서버 | (tene-injected, base64 또는 raw JSON) |
| `NEXT_PUBLIC_SITE_URL` | 클라이언트 | `https://kkaebizigi.vercel.app` ← 깨진 URL |

**중요**: `NEXT_PUBLIC_FIREBASE_*` 7개 값은 **변경 없음**. Firebase project ID(`god-kkabi-guide`)가 영구이므로 그대로 유지. 변경되는 건 `NEXT_PUBLIC_SITE_URL` 1개 + Firebase 콘솔의 **Authorized domains** 화이트리스트.

### 2.3 인증 흐름 (Kakao → Firebase)

```
[Browser] /login 클릭
   ↓
[Kakao OAuth] redirect_uri = https://<DOMAIN>/api/auth/callback/kakao
   ↓
[NextAuth] Kakao access_token 수신 → JWT 세션 생성
   ↓
[Client] POST /api/auth/kakao-exchange
   ↓
[Server] Kakao access_token → Firebase Admin createCustomToken
   ↓
[Client] signInWithCustomToken(customToken) → Firebase Auth 세션
   ↓
[Firestore] users/{uid} 문서 자동 생성/hydrate
```

**도메인 의존 지점**:
- Kakao Developers 콘솔의 **Redirect URI** 화이트리스트
- Firebase **Authorized domains** 화이트리스트 (signInWithCustomToken은 영향 적지만, OAuth provider 직접 사용 시 필수)
- NextAuth `AUTH_URL` 환경변수 (자동 감지하지만 production 명시 권장)

### 2.4 코드 내 도메인 의존 4곳 (수정 필요)

| 파일 | 라인 | 현재 fallback |
|---|---|---|
| `app/layout.tsx` | 47 | `'https://kkaebizigi.vercel.app'` |
| `app/robots.ts` | 4 | `'https://kkaebizigi.vercel.app'` |
| `app/sitemap.ts` | 13 | `'https://kkaebizigi.vercel.app'` |
| `components/feature/premium-checkout-button.tsx` | 104 | `''` (빈 fallback, 토스 결제 success/fail URL) |
| `.env.example` | 14 | `NEXT_PUBLIC_SITE_URL=https://kkaebizigi.vercel.app` |

### 2.5 Firebase 설정 파일

| 파일 | 역할 | 상태 |
|---|---|---|
| `firebase.json` | firestore/database/storage rules 경로 | OK |
| `firestore.rules` | Firestore 보안 규칙 (12+ 컬렉션) | OK |
| `firestore.indexes.json` | 복합 인덱스 정의 | OK |
| `database.rules.json` | RTDB chat 규칙 | OK |
| `storage.rules` | Storage 보안 규칙 (chat/posts) | OK |
| `.firebaserc` | **없음** | Firebase CLI deploy 시 `--project god-kkabi-guide` 명시 필요 (또는 `.firebaserc` 추가) |

### 2.6 Firebase 요금제 제약 (Spark 무료)

- Cloud Functions 불가 — 현재 미사용 (Vercel API Routes로 대체)
- Storage 일일 egress 5GB
- Firestore 50K reads/일, 20K writes/일
- 도메인 작업과는 무관 — 단 추후 트래픽 증가 시 Blaze 업그레이드 검토

---

## 3. 작업 단계

### Step 1 — 코드 fallback URL 정리 [지금 가능, 자동]

수정 파일 4 + `.env.example`. Fallback을 `https://kkaebizigi.com`으로 변경.

```diff
- process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kkaebizigi.vercel.app'
+ process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kkaebizigi.com'
```

`.env.example`:
```diff
- NEXT_PUBLIC_SITE_URL=https://kkaebizigi.vercel.app
+ NEXT_PUBLIC_SITE_URL=https://kkaebizigi.com
```

**커밋 메시지 (제안)**: `fix(domain): replace kkaebizigi.vercel.app fallback with kkaebizigi.com`

### Step 2 — Vercel 환경변수 분리 [사용자 직접, Vercel UI]

Vercel Project → Settings → **Environment Variables**:

| Key | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://kkaebizigi.com` | `https://staging.kkaebizigi.com` | `http://localhost:3000` |
| `AUTH_URL` (선택, NextAuth v5 권장) | `https://kkaebizigi.com` | `https://staging.kkaebizigi.com` | `http://localhost:3000` |

Firebase 7개 env는 환경 무관 동일 값 — 기존 설정 그대로.

### Step 3 — Vercel 도메인 추가 [사용자 직접, Vercel UI]

Vercel Project → Settings → **Domains**:

1. `staging.kkaebizigi.com` Add → **Git Branch** = `staging`
2. `www.kkaebizigi.com` Add → **Redirect to** `kkaebizigi.com` (선택, SEO 분할 방지)

`kkaebizigi.com` apex는 이미 연결됨 (스크린샷 확인).

### Step 4 — DNS propagation 검증 [자동, 폴링]

```
dig +short kkaebizigi.com NS
dig +short kkaebizigi.com A
dig +short staging.kkaebizigi.com CNAME
curl -sI https://kkaebizigi.com | head -1
curl -sI https://staging.kkaebizigi.com | head -1
```

- NS: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- A: `76.76.21.21`
- HTTP: 200 또는 308

전체 propagation은 1~48시간. 통상 1~6시간 내 완료.

### Step 5 — Firebase Authorized Domains 등록 [자동 가능, Firebase CLI 또는 브라우저]

Firebase Console → Authentication → **Settings → Authorized domains**:

추가:
- `kkaebizigi.com`
- `staging.kkaebizigi.com`
- `www.kkaebizigi.com` (선택)

기존 유지: `localhost`, `god-kkabi-guide.firebaseapp.com`, `god-kkabi-guide.web.app`

**자동화 방법 (Firebase CLI)**:
Firebase CLI는 Authorized domains 변경 명령을 표준으로 제공하지 않음 → REST API 또는 브라우저 조작.

브라우저 조작 가능 (claude-in-chrome MCP):
- URL: `https://console.firebase.google.com/u/4/project/god-kkabi-guide/authentication/settings`
- Authorized domains 섹션에서 도메인 추가

### Step 6 — Kakao Developers Redirect URI 추가 [사용자 직접]

Kakao Developers → 내 애플리케이션 → 카카오 로그인 → **Redirect URI**:

추가:
- `https://kkaebizigi.com/api/auth/callback/kakao`
- `https://staging.kkaebizigi.com/api/auth/callback/kakao`

플랫폼 → Web → **사이트 도메인**:
- `https://kkaebizigi.com`
- `https://staging.kkaebizigi.com`

### Step 7 — Firebase Storage CORS [Firebase CLI, 선택]

브라우저에서 Firebase Storage URL로 직접 업로드/다운로드 시 CORS 정책 필요. 현재 코드는 Storage SDK 사용 — Storage SDK는 동일 출처 정책 우회하지만 anonymous URL fetch 시 CORS 발동.

```bash
cat > /tmp/cors.json <<'EOF'
[{
  "origin": [
    "https://kkaebizigi.com",
    "https://staging.kkaebizigi.com",
    "http://localhost:3000"
  ],
  "method": ["GET", "POST", "PUT", "HEAD"],
  "maxAgeSeconds": 3600,
  "responseHeader": ["Content-Type", "Authorization"]
}]
EOF

gsutil cors set /tmp/cors.json gs://god-kkabi-guide.firebasestorage.app
```

(`gcloud auth login` 필요. 또는 Firebase CLI `firebase storage:rules` 별개)

### Step 8 — `.firebaserc` 생성 [선택, 안전성↑]

```json
{
  "projects": {
    "default": "god-kkabi-guide"
  }
}
```

이후 `firebase deploy --only firestore:rules` 등 `--project` 플래그 생략 가능.

### Step 9 — E2E 검증 [수동 + 자동]

- [ ] `https://kkaebizigi.com` 접속 → 200, 홈 화면 정상 렌더
- [ ] `https://staging.kkaebizigi.com` 접속 → staging 빌드 정상 렌더
- [ ] `https://www.kkaebizigi.com` → apex로 308 redirect
- [ ] Kakao 로그인 → callback → 세션 생성 + Firestore `users/{uid}` 생성
- [ ] 게시글 작성 + 이미지 업로드 (Storage `/posts/{uid}/`)
- [ ] 게시글 조회수 증가 (Firestore writes)
- [ ] 북마크 추가/제거
- [ ] 채팅 메시지 송수신 (RTDB)
- [ ] robots.txt: `Sitemap: https://kkaebizigi.com/sitemap.xml`
- [ ] sitemap.xml: 모든 URL이 `https://kkaebizigi.com/...` prefix
- [ ] OG meta: `<meta property="og:url" content="https://kkaebizigi.com/...">`

---

## 4. 위험 & 롤백

| 위험 | 영향 | 완화 |
|---|---|---|
| NS propagation 지연 (>24h) | 일부 ISP에서 도메인 미해결 | DNS check 도구로 영역별 확인. 비상시 `god-kkabi-guide.vercel.app` alias 유지 |
| Authorized domains 누락 | Kakao 로그인 실패 (`auth/unauthorized-domain`) | Step 5 우선 처리. 콘솔에서 즉시 추가 가능 |
| Kakao redirect URI 미등록 | OAuth 흐름 KOE006 에러 | Step 6 도메인 활성 직후 처리 |
| `NEXT_PUBLIC_SITE_URL` 환경변수 누락 (Preview) | sitemap/OG URL 깨짐 | Step 2 환경별 분리 + 코드 fallback (Step 1)이 안전망 |
| Firebase Spark 한도 초과 (Storage 5GB egress) | 이미지 로드 실패 | Spark → Blaze 업그레이드 검토 (월 사용량 모니터링) |

**롤백**:
- 도메인 문제 발생 시 Vercel 대시보드에서 신규 도메인 disable → 기존 `god-kkabi-guide.vercel.app` alias로 fallback (이미 유효 상태로 유지됨)
- 코드 변경은 PR revert 1건으로 즉시 되돌릴 수 있음 (env-driven 설계라 빌드 재실행만 하면 됨)

---

## 5. 의존성 & 순서

```
Step 1 (코드) ──┐
                ├─► PR → main 머지 → production 자동 배포
Step 2 (env) ──┘
                                                ↓
                                          Step 4 (DNS 검증)
                                                ↓
Step 3 (Vercel domain) ─► Step 4 (DNS) ──────► Step 5 (Firebase)
                                                ↓
                                          Step 6 (Kakao)
                                                ↓
                                          Step 7 (Storage CORS)
                                                ↓
                                          Step 9 (E2E)
```

Step 8(.firebaserc)은 어디서든 가능.

---

## 6. 후속 (out of scope, 별도 작업)

- `kkaebizigi.com` Firebase Auth Custom Domain 매핑 (OAuth redirect URL이 `*.firebaseapp.com` 안 보이게)
- Firebase Hosting → Vercel 단일화 (현재 Vercel만 사용, Firebase Hosting 미사용)
- Vercel team을 Pro 업그레이드 후 cron `*/15 * * * *` 복원 (현재 daily로 다운그레이드)
- Firebase Spark → Blaze 업그레이드 검토 (Storage egress 한도 도달 시)

---

## 7. 변경 이력

| 일자 | 변경 | 작성자 |
|---|---|---|
| 2026-05-16 | 초안 작성 (Firebase 코드 전수 조사 + 작업 9단계 정의) | Claude + kay |
