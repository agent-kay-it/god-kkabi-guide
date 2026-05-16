# Sprint V1 Master Plan — UGC + 카카오 + AdSense + 댓글 + 페널티 + Pretendard subset

> **갓깨비 키우기 비공식 팬 가이드 — Sprint V1**
> **버전**: v1.0
> **운영자**: kay@agentkay.it (1인 개인 프로젝트)
> **선행 Sprint**: god-kkabi-guide-sprint-mvp-v2 (archived 2026-05-16, tag=`v2.0.0-mvp-v2-archived`)
> **트러스트 레벨**: L4 Aggressive (자동) + Chrome MCP 시각 검증

---

## 0. Sprint 목적

Sprint MVP v2가 닦은 풀스택 인프라(NextAuth + Firebase Hybrid + 4-색 디자인 + 102 시드 위키 + 채팅 + 북마크 + 모더레이션) 위에 **사용자 생성 콘텐츠(UGC) 생태계**를 얹어 1인 운영 가이드를 **참여형 커뮤니티**로 전환한다.

핵심 가설:
- **공급**: 운영자 1인이 채울 수 없는 메타 변화 / 빌드 / 후기 → 사용자 공급으로 보충
- **수익**: AdSense + 향후 프리미엄 (V2)로 운영비 회수 → 지속 가능성 확보
- **모더레이션**: 1인 운영의 한계 → 신고 누적 자동 페널티 + 운영자 사후 검토

---

## 1. 5 인풋 (Sprint v2 → V1 carry-over)

Sprint MVP v2 P7 보고서(§6)에서 명시한 V1 인풋 5건:

1. **Pretendard Variable woff2 subset** — 2MB → 400KB (Korean 2350자 + Latin 95자 + Latin-1 96자, ~80% 감소). M9 Mobile lab 게이트 통과 목표.
2. **GA4 STUB 2개 활성화** — `login` (NextAuth callback) + `wiki_card_click` (위키 카드)
3. **위키 장비 30+ 데이터 확장** — V2에서 12 카드 → 사용자 게시물 + 운영자 큐레이션으로 30+ 확장
4. **모더레이션 사전 외부화** — `lib/chat/masking.ts` 하드코딩 → Firestore `moderation_dictionaries` 컬렉션 + admin 콘솔 편집
5. **사용자 게시물 시스템** — 빌드/공략/후기 3 카테고리 + 댓글 + 좋아요 + 신고

---

## 2. 신규 기능 스코프

### 2.1 사용자 게시물 (Post)

| 항목 | 명세 |
|---|---|
| 카테고리 | `build` (빌드 공유) / `guide` (공략) / `review` (후기·이벤트 리뷰) |
| 작성 권한 | 등록 완료(registered=true) + role!=banned 사용자만 |
| 본문 | Markdown lite (h2/h3 + bold/italic + code + blockquote + ul/ol + link + image — script/iframe 금지) |
| 이미지 첨부 | 1MB 자동 압축 × 3건/게시물 (chat과 동일 패턴) |
| 길이 제한 | 제목 60자 / 본문 5000자 |
| 태그 | 직업(warrior/swordsman/medium) + 진령 + 콘텐츠 카테고리 매핑 (선택, 최대 5개) |
| 작성 → 노출 | 즉시 노출 (모더레이션 사후) |
| 수정 정책 | 본인 24시간 내 자유 수정 / 이후 운영자 승인 큐 |
| 삭제 | 본인 즉시 / 운영자 즉시 (audit log 남김) |

### 2.2 댓글 (Comment)

| 항목 | 명세 |
|---|---|
| 깊이 | 2-depth (게시물 → 댓글 → 답글). 답글의 답글 금지 |
| 길이 | 500자 |
| 권한 | 등록 + role!=banned |
| 좋아요 | 본인 제외 토글 |
| 신고 | 채팅과 동일 6 reasons + 누적 5건 자동 hidden |
| 수정 | 5분 내 본인만 / 이후 잠금 |

### 2.3 리액션 (Reaction)

| 항목 | 명세 |
|---|---|
| 종류 | `like` (게시물 + 댓글) |
| 정책 | 본인 게시물 좋아요 금지 / 1인 1회 토글 |
| 카운트 | `posts.likeCount` denormalize (게시물 정렬용) |

### 2.4 신고 페널티 (Penalty)

| 누적 신고 | 자동 처리 | 운영자 우회 |
|---|---|---|
| 5건 | 자동 경고 (`users.warningCount++`) + 토스트 통지 | 운영자가 `kept_by_operator`로 누계 -1 |
| 10건 | 자동 7일 정지 (`users.banned=true` + `bannedUntil=now+7d`) | 운영자 즉시 해제 |
| 20건 | 자동 영구 정지 (`role=banned` custom claim) | 운영자 unban으로 해제 가능 |
| audit | `moderation_logs`에 `auto_penalty_*` 액션 기록 | actorUid='system' + reason='auto_threshold' |

### 2.5 카카오 OAuth 본격 활성화

| 항목 | 명세 |
|---|---|
| 카카오 콘솔 | 비즈니스 앱 전환 + 사업자 정보 입력 (운영자 게이트) |
| 동의 항목 | 이메일 + 닉네임 (개인 정보 최소) |
| Custom Token bridge | v2에서 이미 코드 작성 — 게이트 통과 후 활성화 |
| 모바일 SDK | (V2 — Native 앱 진입 시) |

### 2.6 Google AdSense 통합

| 항목 | 명세 |
|---|---|
| 광고 단위 | Sticky 하단 320×50 (mobile) / 728×90 (desktop) + 인피드 1건 (게시물 리스트 5번째) |
| GDPR / PIPA 동의 | 진입 시 동의 모달 (이미 등록 시 PIPA 4 동의 화면에서 `analytics` 확장 → `advertising`) |
| 위치 | 게시물 리스트 + 게시물 상세 (위키 페이지 + 채팅 위젯에는 광고 금지 — UX) |
| 정책 | 본인 광고 클릭 금지 (`AdSense` 가이드라인) — 개발자 도구로 dev 환경 노출 차단 |
| 측정 | GA4 `ad_impression` + `ad_click` 자동 (AdSense — GA4 연동) |

### 2.7 Pretendard Subset

| 항목 | 명세 |
|---|---|
| 도구 | `pyftsubset` (fonttools) Python 패키지 |
| 글리프 | Korean Hangul Syllables (KS X 1001 완성형 2350자) + Latin Basic (95자) + Latin-1 Supplement (96자) + 숫자/기호 |
| 형식 | woff2 (subset) |
| 크기 | 2MB → ~400KB (80% 감소 목표) |
| weight | 45-920 (variable) 유지 |
| 폴백 | 시스템 폰트 (Apple SD Gothic Neo / Malgun Gothic / sans-serif) |
| 운영 | 1회 빌드 → `public/fonts/PretendardVariable-Korean.woff2`로 교체 |

### 2.8 GA4 STUB 활성화

- `login` 이벤트: NextAuth signIn 콜백 → `app/login/page.tsx`의 LoginSuccessTracker client component (`useSearchParams` 또는 cookie flag 기반)
- `wiki_card_click` 이벤트: 위키 카드 컴포넌트 (ClassCard / JinryeongCard 등) 'use client' 래퍼로 분리 + onClick 트래커 추가

---

## 3. 데이터 모델 확장 (Firestore 12 → 16 컬렉션)

신규 컬렉션 4건:
1. **`posts`** — 사용자 게시물 (title + body + category + authorUid + tags + likeCount + viewCount + status + createdAt + updatedAt)
2. **`comments`** — `posts/{postId}/comments` 서브컬렉션 (parentCommentId nullable for 2-depth)
3. **`reactions`** — `posts/{postId}/reactions/{uid}` 서브컬렉션 (type='like') + `comments/{commentId}/reactions`
4. **`penalties`** — 페널티 audit (uid + level + reason + appliedBy='system'|<adminUid> + appliedAt + duration + expiresAt)

기존 12 컬렉션 확장:
- **`users`**: `warningCount` (이미 v2 schema 명시) + `bannedUntil` (timestamp) + `postCount` denormalize
- **`moderation_logs`**: `auto_penalty_warning` / `auto_penalty_7d` / `auto_penalty_permanent` 액션 추가
- **`moderation_dictionaries`** (신규 5번째 컬렉션): admin 콘솔 편집 가능한 금칙어 사전

**총 컬렉션 = 16개** (v2 12 + V1 신규 4 + dictionaries 1 = 17 — dictionaries는 별도 카운트).

---

## 4. Phase 분해

| Phase | 기간 | 산출물 |
|---|---|---|
| **P0 Pre** | 30분 | v2 archive tag + V1 state |
| **P1 Plan** | 2시간 | MASTER-PLAN + PRD + plan (본 문서 포함 3건) |
| **P2 Design** | 3시간 | design.md + phase-2-design/{firestore-schema-v1.md, moderation-policy.md, adsense-strategy.md, pretendard-subset.md} |
| **P3.A** | 6시간 | Pretendard subset + GA4 STUB 2 활성 + types/post.ts + types/comment.ts + types/reaction.ts + types/penalty.ts |
| **P3.B** | 8시간 | posts/comments/reactions Server Actions + 페널티 자동 룰 + moderation_dictionaries CRUD |
| **P3.C** | 10시간 | 5 페이지 (/post 리스트 + /post/[id] + /post/new + /me/posts + admin 페널티 큐) + 댓글 컴포넌트 + 마크다운 lite 렌더러 |
| **P3.D** | 4시간 | AdSense 통합 + GDPR/PIPA 동의 게이트 + Sticky + 인피드 |
| **P3.E** | 2시간 | 카카오 OAuth 비즈니스 앱 전환 게이트 문서 (운영자 작업 가이드) |
| **P4 Check** | 2시간 | Gap + Code + Lighthouse Mobile (Pretendard subset 효과) + WCAG + E2E |
| **P5 Act** | 3시간 | iterate |
| **P6 QA** | 2시간 | GA4 + 7-Layer + E2E |
| **P7 Report** | 1시간 | Sprint V1 완료 보고서 |
| **P8 Archive** | 30분 | v1.0.0-sprint-v1-archived 태그 + state archived |

**총 예상**: ~44시간 (1주 풀타임 + 4일 분산 가능). 10-12 weeks 일정은 운영자 게이트 (카카오 비즈니스 전환 + AdSense 승인) 대기 기간 포함.

---

## 5. 운영자 게이트 (Operator Gates) — 사용자 1인 작업

V1 진행 중 운영자 (kay@agentkay.it) 필수 사전 작업:

### Sprint v2 archive 게이트 (P0 완료 시 가능)

이미 P0에서 완료 가능:
- ✅ Firebase Console: RTDB / Storage / Auth provider 활성화 + role=admin claim
- ✅ Vercel env 14건 + 도메인 G4 + 첫 production deploy
- ✅ Lighthouse Mobile real-world 재측정 → M9 PASS 확인

### V1 신규 게이트

- **카카오 비즈니스 앱** (P3.E 게이트): Kakao Developers → 비즈니스 앱 전환 → 사업자 등록증 또는 개인사업자 신청 → 동의 항목 (이메일 + 닉네임) 승인
- **Google AdSense** (P3.D 게이트): AdSense 가입 → 사이트 도메인 등록 → 정책 검토 (~ 14일) → 광고 단위 발급 + ads.txt 게시
- **Pretendard subset** (P3.A 게이트): 운영자가 `pyftsubset` 1회 실행 후 `public/fonts/PretendardVariable.woff2`에 덮어쓰기 (P3.A 가이드 문서로 제공)

---

## 6. Quality Gates 추가 (M11, M12)

기존 M0-M10에 추가:

| Gate | 조건 |
|---|---|
| **M11 AdSense GDPR/PIPA** | 동의 게이트 + AdSense 정책 준수 (본인 클릭 차단 + dev 노출 차단 + 사용자 미동의 시 광고 미노출) |
| **M12 Moderation Auto Rate** | 신고 누적 5/10/20 자동 페널티 + audit log 100% + admin 우회 가능 |

---

## 7. 결정

> Sprint V1 진입 — P1 Plan 종료. **다음**: P2 Design (firestore-schema-v1 + moderation-policy + adsense-strategy + pretendard-subset 4 문서).

---

**Generated**: 2026-05-16
**Author**: Claude (CTO Lead, L4 Aggressive)
**Operator**: kay@agentkay.it
