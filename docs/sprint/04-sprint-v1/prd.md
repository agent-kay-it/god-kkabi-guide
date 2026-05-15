# PRD — Sprint V1: UGC + 카카오 + AdSense + 댓글 + 페널티

> **갓깨비 키우기 비공식 팬 가이드 — V1**
> **출처**: MASTER-PLAN.md + Sprint v2 P7 SPRINT-REPORT.md §6 V1 인풋

---

## 1. 문제 정의

### 1.1 Sprint v2 종료 시점 한계

- **운영자 1인 콘텐츠 한계**: 위키 102 시드 (v2)는 정적 / 메타 변화 대응 어려움
- **사용자 참여 채널 부재**: 채팅(휘발성) + 북마크(개인용)만 있고 공개 게시 채널 없음
- **수익화 부재**: Firebase Spark 무료 플랜 한계 + 운영비 회수 채널 없음
- **모더레이션 1인 의존**: 신고 누적이 운영자 큐에만 쌓임 → 응답 지연 시 악성 사용자 누적

### 1.2 V1 해결 가설

| 가설 | 검증 지표 |
|---|---|
| UGC 도입 시 사용자 공급으로 메타 콘텐츠 확장 | 게시물 50건 + 댓글 500건 (V1 졸업) |
| 카카오 OAuth 본격 활성화 시 한국 사용자 가입률 +50% | 등록 사용자 30 → 200 (v2 졸업 → V1 졸업) |
| 비침입적 AdSense는 retention 영향 < 5% | retention30d 30% → 45% (UGC 효과 + AdSense 영향 검증) |
| 누적 페널티 자동화 시 운영자 처리 부담 70% 감소 | moderation_auto_rate ≥ 0.7 |

---

## 2. 사용자 시나리오

### Persona A — 무과금 유저 "민준" (28세, 직장인, 갓깨비 입문 6개월)

- 메타 변화 따라가기 위해 빌드 글 검색
- v1: 검색해도 운영자 글만 나옴 → 외부 카페로 이탈
- V1: `/post?category=build&class=swordsman` → 사용자 빌드 글 30+ 노출 + 본인도 후기 작성 가능

### Persona B — 헤비 유저 "지우" (32세, 4년차, 검객 8000레벨)

- 본인 빌드 공유 욕구
- v1: 외부 카페에만 작성
- V1: 사이트 내 빌드 작성 + 좋아요 / 댓글 / 본인 글 통계

### Persona C — 운영자 "kay@agentkay.it" (1인 개인)

- 모더레이션 부담
- v1: 모든 신고 수동 처리 → 응답 24h+
- V1: 누적 5/10/20건 자동 페널티 → 본인은 audit + 우회 결정만

---

## 3. 기능 요구사항

### 3.1 사용자 게시물 (Post)

#### F-1.1 게시물 작성

```
@route POST (Server Action) — /post/new (Client UI)
@auth required, registered=true, role!='banned'
@validation Zod
  title: string, 4-60자
  body: string, 30-5000자, Markdown lite (h2/h3/strong/em/code/blockquote/ul/ol/link/image)
  category: 'build' | 'guide' | 'review'
  tags: string[] (0-5개, 사전 정의된 화이트리스트 — classId / jinryeong_id / content_id)
  images: string[] (0-3개, Firebase Storage URL 화이트리스트)
@side-effect
  posts.add(authorUid, ...) — Firestore 트랜잭션
  users.postCount += 1
  GA4 logEvent('post_create', { category, tags_count, has_image })
```

#### F-1.2 게시물 조회

```
@route /post (리스트) + /post/[id] (상세)
@auth optional (게시물 read는 공개)
@filter category (3-tab) + class (warrior/swordsman/medium 3-chip) + sort (latest/popular/hot)
@pagination cursor-based (createdAt desc) 20건/페이지
@view-count posts.viewCount += 1 (1 user/1 day 디바운스 — IP+date hash localStorage)
```

#### F-1.3 게시물 수정/삭제

```
@policy
  본인 수정: createdAt + 24h 이내 자유
  본인 수정 (24h 후): 운영자 승인 큐 (`posts.pendingEditBy=authorUid` + `pendingEdit=...`)
  본인 삭제: 즉시
  운영자 삭제: 즉시 + audit (moderation_logs.action='post_delete_by_admin')
@cache revalidatePath('/post', '/post/[id]', '/me/posts')
```

### 3.2 댓글 (Comment)

#### F-2.1 댓글 작성

```
@route POST (Server Action)
@auth required, registered=true, role!='banned'
@validation
  body: string, 1-500자
  parentCommentId: string | null (null = top-level, non-null = depth 2 답글)
@constraint
  depth = 2 강제 — parentCommentId가 가리키는 댓글의 parentCommentId가 non-null이면 reject
@side-effect
  posts/{postId}/comments.add(authorUid, body, parentCommentId, ...)
  posts.commentCount += 1
  GA4 logEvent('comment_create', { has_parent, post_category })
```

#### F-2.2 댓글 수정 / 삭제

- 수정: 본인만 5분 내
- 삭제: 본인 / 운영자

### 3.3 리액션 (Reaction — Like)

```
@route POST (Server Action) — toggleReaction({ targetType, targetId })
@auth required, registered=true
@constraint 본인 게시물/댓글 좋아요 금지
@idempotent reactions/{uid} doc deterministic
@side-effect
  posts.likeCount ± 1 (denormalize)
  reactions/{uid} set/delete
  GA4 logEvent('post_like' | 'comment_like', { target_id })
```

### 3.4 신고 페널티 (Penalty Automation)

#### F-4.1 신고 누적 카운트

기존 chat_reports + 신규 post_reports + comment_reports 통합:
- `users.reportedTotal` denormalize (모든 신고 누적)

#### F-4.2 자동 페널티 룰

```
@trigger users.reportedTotal 증가 시
@logic
  if (reportedTotal >= 20) → setUserClaims(uid, { role: 'banned' }) + users.banned=true + 영구
  else if (reportedTotal >= 10) → users.banned=true + bannedUntil=now+7d
  else if (reportedTotal >= 5) → users.warningCount += 1 + 토스트 통지
@audit
  moderation_logs.add({ actorUid: 'system', action: 'auto_penalty_warning'|'auto_penalty_7d'|'auto_penalty_permanent', targetUid, metadata: { trigger: reportedTotal } })
@admin-override
  운영자가 unbanUser / kept_by_operator 처리 시 reportedTotal -= 1 (recovery)
```

### 3.5 카카오 OAuth 본격 활성화

```
@gate 운영자 게이트 — Kakao Developers 비즈니스 앱 전환 (사업자 등록증 또는 개인사업자)
@scope 동의 항목: 이메일 (필수) + 닉네임 (필수) + 프로필 이미지 (선택)
@flow v2 P3.A에서 작성된 lib/auth/kakao.ts + /api/auth/kakao-exchange 그대로 활성화
@no-code-change 운영자 게이트 후 Vercel env (KAKAO_REST_API_KEY 갱신)만으로 동작
```

### 3.6 Google AdSense

```
@gate 운영자 게이트 — AdSense 가입 + 사이트 등록 + ~14일 검토 + 광고 단위 발급
@components
  - components/feature/adsense-script.tsx — ads.google.com 스크립트 lazy load (사용자 동의 후만)
  - components/feature/ad-slot-sticky.tsx — 하단 고정 320x50/728x90
  - components/feature/ad-slot-infeed.tsx — 게시물 리스트 5번째 슬롯 (인피드)
@consent
  - PIPA 4 동의 (v2) → V1에서 `advertising` 동의 항목 추가 (5번째)
  - 미동의 시 광고 미노출 + GDPR 준수
@policy
  - dev 환경 (NODE_ENV=development) 광고 미노출 (정책 위반 방지)
  - 본인 광고 클릭 차단 — admin role 사용자에게 광고 미노출
@measurement GA4 자동 (AdSense ↔ GA4 연동)
```

### 3.7 Pretendard Subset

```
@trigger M9 Mobile lab 게이트 통과 (75 → 85+)
@build
  pip install fonttools brotli
  pyftsubset PretendardVariable.woff2 \
    --output-file=PretendardVariable-Korean.woff2 \
    --flavor=woff2 \
    --unicodes=U+0020-007E,U+00A0-00FF,U+AC00-D7A3,U+3131-318E,U+1100-11FF,U+3200-32FF,U+2010-203E \
    --layout-features='*'
@result 2MB → ~400KB (실측 후 결정)
@replace public/fonts/PretendardVariable.woff2 덮어쓰기 + Git LFS 또는 직접 commit
```

### 3.8 GA4 STUB 활성화 (2건)

```
@login
  components/feature/login-success-tracker.tsx 신규 (use client)
  app/login/page.tsx 또는 /api/auth/callback 후 cookie flag 기반 1회 발화
  logEvent('login', { method: 'google' | 'kakao' })

@wiki_card_click
  components/domain/{class,jinryeong,skill,equipment,content,munpa}-card.tsx에 'use client' wrapper 또는 onClick prop 추가
  consumer (app/*/page.tsx)에서 트래커 주입 (Clean Arch 일방향 유지)
  logEvent('wiki_card_click', { category, target_id })
```

---

## 4. 비기능 요구사항

### 4.1 성능 (M9 V1 게이트)

| 환경 | Performance | LCP | TBT | CLS |
|---|---|---|---|---|
| Mobile lab (Lighthouse simulate) | ≥85 | <2.5s | <300ms | <0.1 |
| Mobile real-world (Vercel CDN + LTE/5G) | ≥90 | <1.5s | <100ms | <0.1 |
| Desktop | ≥95 | <1.0s | <50ms | <0.05 |

### 4.2 접근성 (M7)

- WCAG 2.1 AA 유지 (v2 통과 상태)
- 신규 게시물 / 댓글 폼: `aria-required` + `aria-invalid` + `role="form"` + 키보드 네비게이션
- AdSense iframe: `title` 속성 + aria-hidden 처리

### 4.3 보안 (M2)

- Server Action 신규 6종 (post create/edit/delete, comment create/delete, reaction toggle): `'use server'` + `'server-only'` + `auth()` + role guard 표준
- Firestore rules 신규 4 컬렉션 (posts/comments/reactions/penalties) — `isAuth() / isOwner() / isAdmin() / isRegistered()` helper 확장
- Markdown lite 렌더: `rehype-sanitize` 또는 manual whitelist (XSS 방어 critical)
- AdSense 스크립트: nonce 또는 CSP 'unsafe-inline' 명시 + dev 차단

### 4.4 모더레이션 (M12)

- 자동 페널티 100% audit
- 운영자 수동 우회 가능 (false positive 방지)
- 페널티 통지: 본인 로그인 시 토스트 + 7일 정지 시 expiry 표시

### 4.5 광고 정책 (M11)

- PIPA + GDPR 동의 게이트
- 미동의 시 광고 0개 노출
- dev 환경 0개 노출
- admin role 0개 노출 (본인 클릭 차단)

---

## 5. KPI (V1 졸업 기준)

| KPI | 목표 | 측정 | 추적 |
|---|---|---|---|
| DAU | 300 | GA4 | 일별 |
| Lighthouse Mobile real-world | 90 | Vercel Speed Insights | 주간 |
| 등록 사용자 누계 | 200 | Firestore `users` count | 주간 |
| 사용자 게시물 누계 | 50 | Firestore `posts` count | 주간 |
| 사용자 댓글 누계 | 500 | Firestore comments aggregate | 주간 |
| 채팅 일평균 | 100건 | RTDB `chat/messages/*` 일 단위 export | 일별 |
| AdSense 월 수익 | $10 (검증용) | AdSense 대시보드 | 월별 |
| 30일 retention | 0.45 | GA4 cohort | 월별 |
| 모더레이션 자동 비율 | ≥0.7 | (auto_penalty / total_penalty) | 주간 |

---

## 6. 의존성

- ✅ Sprint MVP v2 archived (commit `152bcdd`)
- ✅ Firebase Hybrid (Firestore + RTDB + Storage + Auth) 운영자 게이트 통과 가정
- ⏳ Kakao Developers 비즈니스 앱 전환 (P3.E 게이트)
- ⏳ Google AdSense 가입 + 검토 (P3.D 게이트)
- ⏳ Pretendard subset 빌드 (P3.A 게이트 — 운영자 1회 작업)

---

## 7. 리스크 + 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| AdSense 검토 거부 (~14일 대기) | P3.D 블로커 | 대체: Coupang Partners / 카카오 ADfit (V1.5에서 검토) |
| 카카오 비즈니스 전환 거부 | P3.E 블로커 | Google OAuth만으로 V1 진입 + 카카오는 V1.5 |
| Pretendard subset 빌드 실패 | M9 Mobile 미달 | 폴백: 시스템 폰트만 사용 (font-display: swap) |
| UGC 신고 폭주 | 모더레이션 큐 폭증 | M12 자동 페널티 + admin 우회 |
| 마크다운 XSS | 보안 사고 | `rehype-sanitize` 또는 strict whitelist + dompurify (이중 방어) |

---

## 8. 결정

> Sprint V1 PRD 완료. **다음**: plan.md (P3 Do sub-phase 분해 + 산출물 명세).
