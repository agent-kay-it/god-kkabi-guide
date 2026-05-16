# Sprint 10 — Launch (Custom Domain + Firebase Live + Auth/Posts/Chat Completion)

**Sprint ID**: `10-sprint-launch`
**작성일**: 2026-05-16
**작업 브랜치**: `feature/domain-firebase-integration` (이후 phase별 sub-branch 분기)
**Sprint 형식**: bkit Sprint v2.1.13 (8-phase 컨테이너)
**선행 분석**: docs/05-infra/kkaebizigi-domain-cutover.md, docs/sprint/09-sprint-v7/* (직전 sprint), Firebase 콘솔 + Vercel 콘솔 + 코드베이스 전수 점검 결과

---

## 1. Mission & Vision

**Mission**: 깨비지기를 `kkaebizigi.com` 커스텀 도메인 위에 Firebase 백엔드 풀가동 상태로 정식 출시한다. 인증(Google sign-in 단일), 게시글(텍스트 + 이미지 + YouTube + 링크 미리보기), 채팅(서버 전체 / 문파별 / 전체 채널)이 모두 실 서비스 품질로 동작하며, Clean Architecture / 디자인 시스템 / 코딩 컨벤션이 100% 준수된 상태로 진입.

**Vision (출시 후 사용자 경험)**:
1. 사용자는 `https://kkaebizigi.com` 진입 후 **Google 1-tap 로그인** 한 번으로 모든 기능 사용
2. 게시글에 **YouTube URL 붙여넣으면 자동 임베드**, 일반 URL은 **링크 미리보기 카드**로 자동 변환
3. 채팅은 **3-tier 채널** (전체 / 서버별 / 문파별) 분리, 이미지 + 링크 공유 + 미리보기 모두 지원
4. 모바일 브라우저에서 데스크탑 동등 UX (반응형) + Lighthouse 90+

**Non-Goals (이 sprint 제외)**:
- 네이티브 모바일 앱 (React Native/Expo)
- Play Games / Game Center / Apple Sign-in 연동
- Kakao 로그인 복구
- Firebase Hosting (Vercel만 사용)
- Firebase Blaze 업그레이드 (Spark 한도 내 운영)
- 다국어 (ko 우선, en/jp는 별도 sprint)
- 결제/구독 신규 기능 (기존 Toss 결제 컴포넌트는 도메인 컷오버 영향만 처리)

---

## 2. 분석 요약 (Sprint 진입 전 발견)

### 2.1 Firebase 콘솔 현황 (Chrome 자동화 점검 결과)

| 제품 | 상태 | 영향 |
|---|---|---|
| Authentication | Google sign-in 1개 활성 | OAuth client ID/secret 등록 확인 + redirect URI 검증 |
| Authorized domains | localhost + firebaseapp.com + web.app + **kkaebizigi.com + staging.kkaebizigi.com + www.kkaebizigi.com** (방금 추가) | Sprint 진입 전 완료 |
| **Firestore** | **컬렉션 0개** | 12개 컬렉션 초기 구조 + 인덱스 + rules deploy 필요 |
| **Realtime Database** | **instance 미생성** | RTDB 활성화 + URL 환경변수 + rules deploy 필요 |
| **Storage** | **bucket 미생성** | bucket 활성화 + rules deploy + CORS 정책 |
| 요금제 | Spark $0/월 | Cloud Functions 불가, 일일 read 50K / write 20K / storage egress 5GB 한도 |

### 2.2 Vercel 콘솔 현황

| 항목 | 상태 | 액션 |
|---|---|---|
| Project | `kkaebizigi` (team `agent-kay-project`, Hobby) | 그대로 |
| Production branch | `main` (webhook 자동 배포 검증 완료) | 그대로 |
| Preview branch | `staging` (webhook 자동 배포 검증 완료) | 그대로 |
| Domains | `kkaebizigi.com` (apex, verified), `god-kkabi-guide.vercel.app` (구 alias) | staging / www 추가 필요 |
| Env Vars | development/production 분리, **preview 누락** | preview 전체 환경변수 분리 |
| Cron | 5개 (`*/15 * * * *` daily로 다운그레이드 완료) | 그대로 |

### 2.3 코드베이스 현황

| 영역 | 상태 | 작업량 |
|---|---|---|
| **Kakao 의존** | 17개 파일에 카카오 코드/문구/타입 분산 | **삭제 2 + 수정 15** |
| **Google sign-in** | 미구현 | NextAuth google provider 추가 + UI + Custom Token bridge (Google ID token → Firebase Custom Token) |
| **채팅 라이브러리** | `lib/chat/` 5파일 539줄 (use-channel / send-message / image-upload / masking / report-action) | 거의 완성. 멀티채널 지원 가능 (channelId 인자) |
| **채팅 UI** | `app/chat/` ❌, `components/feature/chat/` ❌ | **신규 구현 (UI 100%)** |
| **게시글 라이브러리** | `lib/post/` 5파일 1169줄 (schema / actions / markdown / admin-pending / image-upload) | 풍부. markdown sanitize는 firebasestorage.googleapis.com 화이트리스트 적용됨 |
| **게시글 페이지** | `app/post/{page, new/page, [id]/page}.tsx` 3개 | 존재. YouTube/링크 임베드 신규 추가 |
| **디자인 시스템** | shadcn/ui + Magic UI + 디자인 토큰 v2 (22개) + `globals.css` 적용 | Sprint V5에서 9 페이지 통일됨. 신규 컴포넌트는 토큰 준수 |
| **Clean Architecture** | Ports & Adapters 패턴 적용 (`lib/firebase/*`에 Firebase SDK 격리). domain ↔ infra ↔ adapter 경계 명확 | 신규 코드도 동일 경계 유지 |

### 2.4 핵심 gap 종합

```
실제 활성:  Authentication (Google) ────────────────────────────┐
                                                              │
코드 가정: Authentication (Kakao) ─┐                          │
            Firestore   12+ 컬렉션  │   ←── gap (실 환경 비어있음)
            RTDB        chat       │
            Storage     이미지     │
                                  │
                          ┌───────┴───────┐
                          │ 이 sprint 작업 │
                          │  으로 메우기  │
                          └───────────────┘
```

---

## 3. Phase 구성 (6 Phase)

bkit Sprint v2.1.13 컨테이너는 8 phase (prd → plan → design → do → check → act → qa → report → archive) 형식이지만, 이 sprint는 **"do" phase가 6개 sub-feature group으로 분할**되는 multi-feature initiative다. 각 sub-feature group은 자체적인 PDCA cycle을 가질 수 있다.

| Phase | 명칭 | 산출물 | 의존성 | 차단 위험 |
|---|---|---|---|---|
| **A** | Firebase 백엔드 활성화 | Firestore 인덱스 + RTDB instance + Storage bucket + rules deploy + .firebaserc | (없음, 가장 먼저) | Spark 한도, gcloud auth, Storage CORS |
| **B** | Auth 마이그레이션 | Kakao 17파일 제거 + Google provider + Custom Token bridge + 회원가입 폼 재설계 | A의 Firestore | NextAuth v5 jwt 콜백, FirestoreAdapter, users collection 시드 |
| **C** | 도메인 컷오버 | Vercel staging/www domain + preview env + 코드 fallback URL + Vercel Chrome 자동화 + DNS/SSL 검증 | (병렬 가능, B와 무관) | DNS propagation, SSL 발급 지연 |
| **D** | 게시글 enrichment | YouTube 임베드 + 링크 OG 미리보기 + markdown 확장 + URL 파서 + 사용자 작성 UX | B 완료 (작성자 인증) | OG fetch SSRF, YouTube iframe CSP |
| **E** | 채팅 UI 신규 구현 | 3-tier 채널 (global/server/guild) + UI 컴포넌트 + 이미지/링크 공유 + 모더레이션 + 실시간 구독 | B 완료 + A의 RTDB | RTDB rules 멀티채널 권한, Spark egress, 메시지 페이지네이션 |
| **F** | 품질/출시 게이트 | Clean Architecture 감사 + 디자인 시스템 검증 + 컨벤션 lint + E2E + Lighthouse + Sentry + 출시 체크리스트 | A~E 완료 | Match rate < 90% 시 iterate, Lighthouse < 90 시 최적화 |

### 의존성 그래프 (Kahn topological)

```
Phase A (Firebase 백엔드)  ────┬──── Phase B (Auth)
                              │           │
                              │           ↓
Phase C (도메인 컷오버)  ─────┼──── Phase D (게시글 enrichment)
                              │           │
                              │           ↓
                              └──── Phase E (채팅 UI) ──┐
                                                        │
                                                        ↓
                                                  Phase F (품질/출시)
```

병렬 처리 가능:
- A + C 병렬 (Phase 진입 직후)
- D + E 병렬 (B 완료 후)

---

## 4. 일정 가정

토큰/시간 비용 무시 — "꼼꼼하고 완벽하게" 기준이라 phase별 sub-PDCA 사이클 + iterate 반복 포함. 작업자 1인 + AI agent 페어 가정.

| Phase | 추정 일수 | 비고 |
|---|---|---|
| A. Firebase 백엔드 | 1~2일 | 콘솔 작업 + rules deploy + 검증 |
| B. Auth 마이그레이션 | 3~5일 | 17파일 영향, NextAuth Google provider, Custom Token bridge, 회원가입 폼 재설계, E2E |
| C. 도메인 컷오버 | 1~2일 (DNS 대기 1~6시간 포함) | Vercel UI + 코드 fallback + 검증. A/B와 병렬 가능 |
| D. 게시글 enrichment | 3~4일 | YouTube 임베드 라이브러리 평가 + 링크 OG fetch API + 미리보기 카드 + 디자인 토큰 적용 |
| E. 채팅 UI | 5~7일 | 3-tier 채널, UI 처음부터 구현, 이미지/링크/페이지네이션/모더레이션 |
| F. 품질/출시 | 2~3일 | 감사 + iterate + Lighthouse + Sentry + 출시 체크리스트 |

**총 예상 15~23일** (3주 작업, 1주 여유 = 4주 sprint).

---

## 5. 품질 게이트 (M1-M10 / bkit Quality Gates)

| 게이트 | 기준 | 측정 방법 |
|---|---|---|
| **M1. typecheck** | `tsc --noEmit` 에러 0 | CI |
| **M2. lint** | `eslint .` 에러 0, warning ≤ 5 | CI |
| **M3. unit test** | vitest 통과율 100%, coverage ≥ 70% (lib/auth, lib/post, lib/chat) | vitest --coverage |
| **M4. design-implementation gap** | gap-detector match rate ≥ 90% | bkit gap-detector |
| **M5. Clean Architecture 경계** | Firebase SDK는 `lib/firebase/*`에만 import. 도메인/UI 직접 의존 0건 | grep + 수동 감사 |
| **M6. 디자인 시스템 일관성** | 모든 페이지가 디자인 토큰 v2 사용. 하드코딩 색상/spacing 0건 | grep + lint rule |
| **M7. E2E 시나리오** | 7-Layer dataFlowIntegrity (UI→Client→API→Validation→DB→Response→Client→UI) 통과 | sprint-qa-flow |
| **M8. Lighthouse (mobile + desktop)** | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 | Vercel Speed Insights + 수동 |
| **M9. 보안 감사** | OWASP Top 10 점검 + Firebase rules audit + CSP + CORS | security-architect agent |
| **M10. 출시 체크리스트** | 도메인 / SSL / Firebase 활성 / Sentry / Analytics / robots+sitemap / OG / 백업 | 수동 체크 |

---

## 6. 위험 & 완화

| 위험 | 영향 | 확률 | 완화 |
|---|---|---|---|
| Firebase Spark 한도 초과 (Storage egress 5GB/일) | 이미지 로드 실패 | 중 | 이미지 lazy + WebP + CDN 캐싱. 한도 도달 시 Blaze 업그레이드 (월 ~$25) |
| Google OAuth client redirect URI 누락 | 로그인 실패 | 높음 | Phase B 첫 작업으로 GCP 콘솔에서 redirect URI 등록 + 검증 |
| RTDB rules 채널별 권한 (서버/문파) | 권한 우회로 다른 길드 채팅 노출 | 중 | rules `$serverId`/`$guildId` 변수 + Firestore users.guildId / serverId 참조 검증 |
| YouTube iframe CSP 차단 | 임베드 깨짐 | 낮음 | next.config.ts `Content-Security-Policy` frame-src 추가 |
| 링크 OG fetch SSRF | 내부 네트워크 스캔 | 중 | 화이트리스트 IP 차단 + 도메인 reputation check + timeout 5s |
| DNS propagation 24h+ 지연 | 출시 지연 | 낮음 | god-kkabi-guide.vercel.app fallback 유지 |
| Kakao 코드 제거 시 회원가입 흐름 회귀 | registered=false 사용자 락아웃 | 높음 | Phase B에 회원가입 폼 재설계 포함 + 마이그레이션 스크립트 + dry-run |
| Firestore 컬렉션 시드 데이터 잘못 작성 | 운영 데이터 깨짐 | 중 | seed는 emulator에서 dry-run 후 production 적용. 백업 dump 사전 확보 |

---

## 7. KPI / 성공 지표 (출시 후 7일)

| 지표 | 목표 |
|---|---|
| 신규 가입 (Google sign-in) | ≥ 50명 |
| 게시글 작성 | ≥ 30건 |
| 채팅 메시지 | ≥ 200건 |
| 채팅 채널 활성 (3 이상 채널에 동시 active 사용자) | yes |
| Lighthouse mobile Performance | ≥ 90 |
| 도메인 가용성 (uptime) | ≥ 99.5% |
| Firestore 일일 read 사용량 | ≤ 30K (Spark 한도의 60%) |
| Sentry 에러율 | ≤ 1% (5xx 요청 비율) |

---

## 8. 산출물 매트릭스 (각 phase별 결과물 위치)

| Phase | 코드 변경 | 콘솔 변경 | 문서 | 인프라 |
|---|---|---|---|---|
| A | `.firebaserc` 신규, `firestore.indexes.json` 확장, `storage.rules` 검증 | Firestore enable, RTDB enable, Storage enable, gsutil CORS set | `docs/sprint/10-sprint-launch/phase-a-backend.md` | Firebase rules deploy |
| B | `lib/auth/*` 재작성, `app/api/auth/google-bridge` 신규, UI 6개 컴포넌트 변경 | GCP OAuth client 등록 | `phase-b-auth.md` + auth-flow v3 | NextAuth v5 google provider |
| C | `app/{layout,robots,sitemap}.ts` fallback, `.env.example`, `premium-checkout-button.tsx` | Vercel staging/www domain + preview env (Chrome 자동화) | `phase-c-domain.md` | DNS A/CNAME 검증 |
| D | `lib/post/markdown.ts` plugin 추가, `app/api/og-preview` 신규, `components/feature/post/{YoutubeEmbed,LinkPreview}` 신규 | (없음) | `phase-d-posts.md` | OG fetch API route |
| E | `lib/chat/*` 확장 (channel-resolver), `components/feature/chat/*` 신규 (8~10 컴포넌트), `app/chat/{layout,page,[channelId]/page}.tsx` 신규 | `database.rules.json` 멀티채널 권한 확장, RTDB 인덱스 | `phase-e-chat.md` + chat-topology.md | RTDB indexOn 확장 |
| F | Clean Arch 감사 fix, 디자인 토큰 위반 fix, Lighthouse 최적화 | Sentry project 생성, Vercel Speed Insights enable | `phase-f-quality.md` + final report | Sentry SDK, Speed Insights |

---

## 9. 출시 체크리스트 (Phase F 마지막 게이트)

- [ ] `https://kkaebizigi.com` 200 OK, Lighthouse mobile P ≥ 90
- [ ] `https://staging.kkaebizigi.com` 200 OK
- [ ] `https://www.kkaebizigi.com` → apex 308 redirect
- [ ] SSL 인증서 자동 갱신 검증 (Vercel 자동)
- [ ] Firebase Auth: Google sign-in 신규 가입 + 기존 가입 분리 처리
- [ ] Firestore: 12 컬렉션 + 인덱스 + rules production deploy 완료
- [ ] RTDB: 3-tier 채널 동작 (global / server-{id} / guild-{id})
- [ ] Storage: chat/posts 폴더 권한 + CORS + 1MB 제한
- [ ] 게시글: YouTube 임베드 + 링크 미리보기 정상 동작
- [ ] 채팅: 메시지 송수신 + 이미지 + 링크 미리보기 + 무한 스크롤
- [ ] robots.txt + sitemap.xml: `kkaebizigi.com` 도메인
- [ ] OG meta: `og:url`, `og:image`, `og:title` 정상
- [ ] Sentry: 5xx 알림 + Slack/email
- [ ] Analytics: GA4 + Firebase Analytics 이벤트 17개 검증
- [ ] 백업: Firestore export 일일 cron (수동 또는 외부)
- [ ] Vercel cron 5개 동작 검증 (daily schedule)
- [ ] Kakao 코드 0 잔존 (grep -i kakao 결과 빈 줄)
- [ ] Clean Architecture 경계 위반 0건
- [ ] 디자인 토큰 위반 0건
- [ ] 모바일 반응형: 320~1920 viewport 정상

---

## 10. 후속 (out of scope, post-launch)

- React Native/Expo 모바일 앱 (Play Games + Game Center 통합)
- Apple Sign-in 추가
- 다국어 (en/jp) 본격 운영
- Firebase Blaze 업그레이드 + Cloud Functions
- Firebase Hosting 고려 (현재 Vercel만)
- 결제/구독 v2 (현재 Toss 인프라 유지)
- AdSense 활성화 (Sprint V1 P3에서 인프라만 구축)
- 데이터 분석 대시보드 (Looker Studio 또는 자체)

---

## 11. 변경 이력

| 일자 | 변경 | 작성자 |
|---|---|---|
| 2026-05-16 | Sprint 10 master plan 초안 — 6 phase + 의존성 + 품질 게이트 정의. Firebase/Vercel/코드 3개 시스템 분석 결과 반영 | Claude + kay |
