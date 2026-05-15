# Sprint MVP v2 PRD — 갓깨비 키우기 커뮤니티 위키

> 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 작성일: 2026-05-15
> 적용 Sprint: `god-kkabi-guide-sprint-mvp-v2`
> 입력 산출물: `SCOPE-CHANGE.md`, `source/godkkabi-guide/{index.html, README.md, images/}`
> 참고 모델: [whiteoutsurvival.wiki](https://www.whiteoutsurvival.wiki/) — wiki + community

---

## 1. 비전 (Vision)

갓깨비 키우기 유저가 **"이 사이트가 내 도구"라고 인식하고 매일 방문**할 수 있는, 위키 + 커뮤니티 + 개인화 플랫폼을 1인 개인 프로젝트로 구축한다.

- 사용자가 한 번 등록하면 자기 서버·문파의 정보가 맞춤 표시되고,
- 게임 내 모든 직업·장비·스킬·진령·문파·콘텐츠 정보가 **위키 모델**로 검색 가능하며,
- 같은 서버·문파 유저와 **실시간 채팅·이미지 공유**로 노하우를 나눌 수 있다.
- 유용한 정보는 **북마크하여 모아 보기** 가능하다.

---

## 2. 사용자 페르소나 (User Personas)

### 2.1 P1 — 신규 진입자 ("처음 시작했어요")
- **나이/직업**: 25-40세 직장인, 출퇴근길 모바일 게임
- **상황**: 출시 3일 이내, 직업 결정 + 진령 선택 막막
- **Job-to-be-done (JTBD)**: "30초 안에 나에게 맞는 직업·진령 파악하고 시작하고 싶다"
- **사용 시나리오**:
  1. 사이트 진입 → 홈 Hero에서 "직업 진단" 버튼
  2. 7문항 진단 → 검객 추천
  3. 검객 wiki 페이지 → 추천 진령 3종 + 메타 빌드 확인
  4. 게임 내 적용 후 닉네임/서버ID 등록 + 사이트 사용자 되기

### 2.2 P2 — 중수 유저 ("뭔가 알고 싶어요")
- **나이/직업**: 30-50세, 게임 경력 1-3개월
- **상황**: 결투장 진입 / 무한던전 깊이 푸시 / 진령 영혼 강화 단계
- **JTBD**: "내 빌드의 약점을 파악하고 다음 자원 투자 우선순위를 결정하고 싶다"
- **사용 시나리오**:
  1. 사이트 진입 → 본인 직업·진령 wiki 페이지
  2. "추천 빌드" + "자원 우선순위" + "PvP 팁" 참고
  3. 본인 빌드 스크린샷을 게시 → 같은 문파 유저와 토론
  4. 유용한 팁 북마크

### 2.3 P3 — 고수/문파 리더 ("내 노하우 공유하고 싶어요")
- **나이/직업**: 30-50세, 결투장 TOP 100 또는 문파 리더
- **상황**: 신규 유저 가이드 필요 / 문파 채팅으로 일정 공유
- **JTBD**: "내 노하우를 공유하고 인정받고 싶다 + 문파 구성원 효율적 관리하고 싶다"
- **사용 시나리오**:
  1. 사이트 진입 → 본인 정보 (서버 + 문파) 자동 표시
  2. 문파 채팅에 "오늘 결투장 시즌 막바지 14시 푸시 시간" 공지
  3. 본인 빌드를 user_post로 게시 + 이미지 첨부
  4. 댓글/반응으로 신뢰 점수 누적 (V1+)

### 2.4 P4 — 운영자 본인 ("매주 검증·갱신")
- **나이/직업**: kay@agentkay.it, 1인 개인 프로젝트
- **상황**: 매주 5-15h 운영 SLA
- **JTBD**: "매주 1회 콘텐츠 검증 + 신규 정보 추가 + 사용자 신고/댓글 대응"
- **사용 시나리오**:
  1. Admin 라우트 진입 (V1+ Auth admin custom claim)
  2. wiki 엔티티 수정 + 쿠폰 추가
  3. 사용자 신고 모더레이션 처리
  4. 매주 1회 운영 보고서 자동 생성 확인

---

## 3. 스코프 (In/Out Scope)

### 3.1 In Scope (MVP v2)

#### 3.1.1 인증 (Auth)
- Firebase Authentication 활성화
- Provider: **Google OAuth** (1차) — 카카오는 V1+ (G1 게이트 결정)
- 익명 로그인 비활성 (정체성 명확화)
- Auth state 관리 (Client + Server)
- 사용자 첫 진입 시 등록 폼 강제 (서버ID + UID + 문파 + 닉네임 + 직업)

#### 3.1.2 사용자 등록
- 등록 필수 필드:
  - 서버ID — `S` + 1-4자리 숫자 (예: S785). 정규식 `/^S\d{1,4}$/`
  - UID — 게임에서 복사한 고유 ID (변경 불가)
  - 문파 — 최대 30자, 한글/영문/숫자
  - 닉네임 — 최대 12자, 한글/영문/숫자
  - 직업 — warrior / swordsman / medium 중 1개
- UID 외 모든 필드 사용자 변경 가능 (Settings 페이지)

#### 3.1.3 위키 (Wiki) — 6 카테고리
1. **직업 (`/wiki/class/{warrior,swordsman,medium}`)** — 3 entity
2. **장비 (`/wiki/equipment/[slug]`)** — 약 50-100 entity (MVP 시드 30+ 운영자 작성)
3. **스킬 (`/wiki/skill/[slug]`)** — 약 30-50 entity (MVP 시드 15+ 운영자 작성, 각 직업별 Core/Active/Passive)
4. **진령 (`/wiki/jinryeong/[id]`)** — 11 entity
5. **문파 (`/wiki/munpa-system`)** — 단일 페이지 (V1+ 문파별 페이지 확장)
6. **콘텐츠/이벤트 (`/wiki/content/[slug]`)** — 약 20-30 entity (던전 5 + 이벤트 10-15)

#### 3.1.4 채팅 (Chat)
- 3 채널 타입:
  - **전체 채팅** (`global`) — 모든 사용자 단일 채널
  - **서버별 채팅** (`server:{serverId}`) — 사용자 본인 서버 자동 가입
  - **문파별 채팅** (`munpa:{serverId}:{munpaName}`) — 본인 문파 자동 가입
- 메시지 타입:
  - 텍스트 (최대 500자)
  - 이미지 첨부 (Firebase Storage, 최대 1MB, JPG/PNG/WebP)
  - @멘션 (V1+)
- UI: **플로팅 위젯** (우하단 fixed) — 최소화/확대 토글
- 알림: 새 메시지 시 in-app 토스트 + 브라우저 Notification API (옵션)

#### 3.1.5 북마크 (Bookmark)
- 북마크 가능 대상:
  - Tips 항목 (`tip:{id}`)
  - Wiki 페이지 (`wiki:{type}:{id}`)
  - 사용자 게시물 (`user_post:{id}`, V1+)
- 사용자 본인 페이지 `/my/bookmarks` — 카테고리별 그룹화 + 최근순 정렬

#### 3.1.6 Tips 확장
- 운영자 작성 Tips (기존) + 사용자 작성 Tips (`/tips/new` Auth 필수)
- 카테고리: general/beginner/advanced/pvp/economy + 사용자별 신뢰 점수 (V1+)
- 모든 Tips 북마크 가능

#### 3.1.7 사용자 게시물 (User Posts, V1+ 부분 활성)
- MVP는 채팅에 이미지 첨부로 갈음
- V1에서 본격 게시판 도입 — `/posts/{slug}` 라우트 + 댓글

#### 3.1.8 운영자 도구 (Operator Tools)
- `/admin` 라우트 (Auth custom claim `admin=true`)
- 쿠폰 추가/수정
- 신고 처리
- 콘텐츠 모더레이션
- 사용자 차단 (V1+)

### 3.2 Out of Scope (V1+ 이전)
- AdSense 광고
- 결제 (Stripe / 시즌 패스)
- 댓글 시스템 (V1+ 게시물 도입 시)
- Push Notification (V1+ Firebase Cloud Messaging)
- 다국어 (JP/EN — V2)
- NLP 기반 빌드 분석 (V2)
- BigQuery export (V2+)
- 모더레이션 AI (V2+ NSFW 자동 차단)

---

## 4. 핵심 기능 매트릭스 (Features)

| ID | 기능 | 우선순위 | Phase | 의존성 |
|----|------|---------|-------|--------|
| F1 | Firebase Auth (Google OAuth) | P0 | P3.A | Firebase project |
| F2 | 사용자 등록 폼 (서버ID + UID + 문파 + 닉네임 + 직업) | P0 | P3.A | F1 |
| F3 | 사용자 설정 페이지 (`/settings`) | P0 | P3.A | F1, F2 |
| F4 | 위키 라우트 구조 (`/wiki/...`) | P0 | P3.B | (없음) |
| F5 | 위키 직업 3 entity (실제 데이터) | P0 | P3.B | F4 |
| F6 | 위키 진령 11 entity | P0 | P3.B | F4 |
| F7 | 위키 장비 30+ entity (시드) | P0 | P3.C | F4 |
| F8 | 위키 스킬 15+ entity (시드) | P0 | P3.C | F4 |
| F9 | 위키 문파 시스템 페이지 | P1 | P3.C | F4 |
| F10 | 위키 콘텐츠/이벤트 20+ entity | P1 | P3.C | F4 |
| F11 | 북마크 추가/제거 (별 아이콘) | P0 | P3.B | F1 |
| F12 | 북마크 모음 페이지 (`/my/bookmarks`) | P0 | P3.B | F11 |
| F13 | 전체 채팅 채널 | P0 | P3.D | F1, F2 |
| F14 | 서버별 채팅 채널 | P0 | P3.D | F2, F13 |
| F15 | 문파별 채팅 채널 | P1 | P3.D | F2, F13 |
| F16 | 채팅 플로팅 위젯 (최소화/확대) | P0 | P3.D | F13 |
| F17 | 채팅 이미지 첨부 (Storage 1MB) | P1 | P3.D | F13 |
| F18 | 새 메시지 알림 (in-app 토스트) | P1 | P3.D | F13 |
| F19 | 운영자 admin 라우트 | P1 | P3.D | F1 |
| F20 | Tips 사용자 작성 | P2 | P3.D | F1 |
| F21 | 사용자 후기/노하우 게시 (채팅 통합) | P2 | V1+ | F17 |
| F22 | SEO + sitemap 위키 80+ 페이지 | P0 | P3.D | F4-F10 |
| F23 | GA4 이벤트 통합 (Auth/북마크/채팅) | P0 | 전 Phase | F1 |
| F24 | 도메인 등록 + 리브랜딩 | P1 | P3.D | G4 |
| F25 | 직업 진단 (`/class-quiz`) | P0 | P3.B | F4 |
| F26 | 홈 페이지 신규 디자인 | P0 | P3.B | (없음) |
| F27 | 쿠폰 페이지 (재사용 + UGC 신고) | P1 | P3.C | F1 |

---

## 5. 비기능 요구사항 (Non-Functional Requirements)

### 5.1 성능
- Lighthouse Mobile Performance ≥ 85 (Auth/실시간 채팅으로 v1 90→85 완화)
- LCP ≤ 3.0s (홈 + 위키)
- FCP ≤ 1.8s
- CLS ≤ 0.1
- 채팅 첫 메시지 latency ≤ 500ms
- 위키 페이지 prerender (정적) — 초기 로드 100ms 이내

### 5.2 보안
- Firebase Security Rules:
  - `users/{uid}` — read 본인만 / write 본인만
  - `chat_messages/{messageId}` — read auth required / create auth + 자기 uid / update,delete 본인 또는 admin
  - `bookmarks/{uid}/{bookmarkId}` — read,write 본인만
  - `wiki_*/{id}` — read 모두 / write admin only
  - `user_posts/{id}` — read 모두 / write auth + 자기 uid / delete admin
- XSS 방지: 사용자 입력 sanitize (DOMPurify)
- CSRF: SameSite cookies (Next.js 기본)
- Auth token 검증 (Server Actions)
- Storage 권한: 사용자 본인 폴더만 쓰기 + 이미지 MIME 검증

### 5.3 접근성 (WCAG AA)
- 콘트라스트 비율 모두 4.5:1 이상
- 키보드 네비게이션 가능
- ARIA landmarks + labels
- 채팅 플로팅 위젯 esc 키로 닫기
- 새 메시지 알림 prefers-reduced-motion 존중

### 5.4 SEO
- 모든 wiki 엔티티 페이지 prerender + JSON-LD Article schema
- sitemap.xml 자동 갱신 (모든 동적 페이지 포함)
- 한국어 메타 + 검색 키워드 (직업명/진령명/장비명/스킬명)

### 5.5 비용 (Spark Plan 한도)
- Firestore reads ≤ 50,000/일 (Spark 한도)
- Firestore writes ≤ 20,000/일
- Storage ≤ 5GB
- Bandwidth ≤ 10GB/월
- **위험**: DAU 200+ 시 채팅 reads로 Firestore 한도 도달 → Blaze 전환 ($5-10/월)

### 5.6 운영자 SLA
- 주간 검증: 매주 1회 (운영자 직접)
- 신고 대응: 24시간 이내
- wiki 엔티티 추가: 주 3-5건 (운영자 기여)
- 채팅 모더레이션: 매일 1회 점검

---

## 6. Pre-mortem (실패 시나리오 분석)

### R1 — Auth 진입 장벽 (확률 30%, 영향 高)
- **시나리오**: 사용자가 "왜 로그인 해야 해?" 거부감으로 이탈
- **대응**:
  - Auth 없이도 wiki 읽기 가능 (read-only)
  - 북마크/채팅 시점에만 Auth 강제
  - 등록 폼 단순화 (UID는 안내 + 이미지 가이드 제공)

### R2 — 채팅 비활성 (확률 40%, 영향 中)
- **시나리오**: DAU 부족으로 채팅이 빈 채널
- **대응**:
  - 운영자가 매일 1-2 메시지 시드 (커뮤니티 활성화)
  - 빈 채널에는 "오늘의 팁" 봇 메시지 자동 게시
  - 전체 채널 우선 (DAU 부족 시 서버별 분산 회피)

### R3 — Firestore 한도 초과 (확률 25%, 영향 高)
- **시나리오**: 채팅 + wiki + 북마크로 Spark 50K/일 초과
- **대응**:
  - 채팅 무한 스크롤 페이지네이션 (한 번에 20 메시지만 onSnapshot)
  - wiki 페이지 정적 prerender (Firestore 읽지 않음)
  - 북마크 IDs만 users 문서에 array로 저장 (별도 컬렉션 X)
  - **M3 시점**: DAU 200+ 도달 시 Blaze 전환

### R4 — 사용자 신고/스팸 (확률 20%, 영향 高)
- **시나리오**: 부적절 이미지/메시지 게시
- **대응**:
  - 사용자 신고 버튼 (각 메시지/게시물)
  - 운영자 24시간 이내 검토
  - 차단 사용자 목록 (V1+)
  - 이미지 업로드 모더레이션 AI (V2+)

### R5 — Joy Nice Games 법적 클레임 (확률 5%, 영향 致命)
- **시나리오**: 게임 이미지·로고 무단 사용 신고
- **대응**:
  - 본 사이트는 비공식 명시
  - 게임 이미지는 Google Play CDN 핫링크 (재배포 아님)
  - 운영자 자체 게임 스크린샷은 fair use (비상업 + 인용)
  - 24시간 이내 삭제 약속

### R6 — 디자인 시스템 불일치 (확률 10%, 영향 中)
- **시나리오**: source/godkkabi-guide 톤과 v2 구현 톤 차이
- **대응**:
  - Phase 3 do.B 컴포넌트 단계에서 운영자 시각 검증
  - source/godkkabi-guide/index.html을 디자인 reference로 항시 비교

---

## 7. 성공 지표 (KPI)

### 7.1 M+30 graduation
- DAU ≥ 100
- 사용자 가입 수 ≥ 30
- 채팅 메시지 수 ≥ 200
- 사용자 평균 북마크 ≥ 3
- Wiki 페이지 PV ≥ 1000 누적
- 30일 retention ≥ 30%

### 7.2 M+90 V1 진입 기준
- DAU ≥ 200
- 사용자 가입 ≥ 100
- 채팅 메시지 누적 ≥ 2000
- 사용자 게시물 (Tips/노하우) ≥ 50
- 30일 retention ≥ 40%
- 운영자 매주 5-15h 운영 SLA 유지

### 7.3 abandon triggers
- M+30 DAU < 50 → 톤/콘텐츠 피벗 (위키 깊이 강화)
- M+60 DAU < 100 → Auth 단순화 또는 Auth 제거 검토
- M+90 DAU < 200 → 프로젝트 폐기 또는 후속작 도메인 재활용

---

## 8. 디자인 시스템 (Design System) v2

### 8.1 색상 토큰 (source/godkkabi-guide 기반)
```css
@theme {
  /* ─── Ink (배경 레이어) ─── */
  --color-ink-base: #07070b;
  --color-ink-elev: #0e0e15;
  --color-ink-card: rgba(22, 22, 32, 0.55);
  --color-ink-card-strong: rgba(28, 28, 40, 0.78);
  --color-ink-line: rgba(255, 255, 255, 0.06);
  --color-ink-line-strong: rgba(255, 255, 255, 0.12);

  /* ─── Bronze (메인 액센트) ─── */
  --color-bronze: #c89968;
  --color-bronze-soft: #e8c79a;
  --color-bronze-deep: #8a6841;

  /* ─── Jade (보조 / success / pve) ─── */
  --color-jade: #7eb6a8;
  --color-jade-soft: #a8d4c8;

  /* ─── Vermilion (danger / warrior / pvp) ─── */
  --color-vermilion: #c87870;
  --color-vermilion-soft: #e5a7a1;

  /* ─── Indigo (info / mage / 2티어) ─── */
  --color-indigo: #8b8bc5;

  /* ─── Text ─── */
  --color-text: #ece7dd;
  --color-text-soft: #b8b1a4;
  --color-text-mute: #6e6a64;
}
```

### 8.2 폰트
- **Sans**: Pretendard Variable (한국 표준)
- **Mono**: JetBrains Mono (수치·코드)
- 폴백: Apple SD Gothic Neo · system-ui

### 8.3 직업 색상 매핑
| 직업 | 색상 |
|------|------|
| Warrior (전사) | `--color-vermilion` |
| Swordsman (검객) | `--color-bronze` |
| Mage (영매) | `--color-indigo` |

### 8.4 티어 색상 매핑
| 티어 | 색상 |
|------|------|
| 0 (메타 핵심) | `--color-vermilion` |
| 1 (서브) | `--color-bronze` |
| 2 (상황별) | `--color-indigo` |

---

## 9. 라우트 구조 (Sitemap)

### 9.1 공개 라우트 (No Auth)
```
/                                홈 (Hero + 직업 진단 CTA + Wiki 미리보기 + 쿠폰)
/class-quiz                      직업 진단 (인터랙티브)
/wiki                            위키 인덱스 (6 카테고리)
/wiki/class                      직업 종합 비교
/wiki/class/{warrior|swordsman|medium}    직업 상세 (3)
/wiki/jinryeong                  진령 11종 카탈로그
/wiki/jinryeong/[id]             진령 상세 (11)
/wiki/equipment                  장비 카탈로그
/wiki/equipment/[slug]           장비 상세 (30-100)
/wiki/skill                      스킬 카탈로그
/wiki/skill/[slug]               스킬 상세 (15-50)
/wiki/munpa-system               문파 시스템 가이드
/wiki/content                    콘텐츠/이벤트 카탈로그
/wiki/content/[slug]             콘텐츠 상세 (20-30)
/tips                            팁 모음
/tips/[id]                       팁 상세
/coupon                          쿠폰 (재사용)
/intro                           소개
/sources                         출처
```

### 9.2 Auth 필수 라우트
```
/auth/sign-in                    로그인 (Google OAuth)
/auth/register                   첫 등록 폼 (서버ID + UID + 문파 + 닉네임 + 직업)
/settings                        사용자 설정 (UID 외 모두 수정)
/my/bookmarks                    내 북마크 모음
/my/posts                        내 게시물 (V1+)
/tips/new                        팁 작성
/chat                            채팅 페이지 (또는 플로팅으로 통합)
/admin                           운영자 도구 (admin custom claim)
```

### 9.3 동적 SEO 라우트 합계
- 정적: 약 25 페이지
- 동적 (wiki entity): 약 80-100 페이지
- **sitemap.xml 총 ~120-130 routes**

---

## 10. 데이터 모델 (Firestore 12+ 컬렉션)

상세는 `design.md` §5 참조. 본 PRD는 개요만:

| 컬렉션 | 핵심 필드 | 인덱스 |
|--------|----------|--------|
| `users` | uid, serverId, gameUid, munpa, nickname, classId, role(admin?) | serverId, munpa+serverId |
| `servers` | id (S+숫자), createdAt | (없음) |
| `munpas` | id, serverId, name, memberCount | serverId+name (composite unique) |
| `chat_channels` | id (`global`/`server:{id}`/`munpa:{id}:{name}`), type | (자동) |
| `chat_messages` | id, channelId, uid, text, imageUrl, mentions, createdAt | channelId+createdAt desc |
| `bookmarks` | uid+target_type+target_id 복합 | uid+createdAt |
| `wiki_classes` | id, name, statsGrid, recommendedJinryeong, sources | (자동) |
| `wiki_equipments` | slug, category(weapon/armor/...), grade, effects | category+grade |
| `wiki_skills` | slug, classId, type(core/active/passive), effects | classId+type |
| `wiki_jinryeong` | id, nameKo, rarity, tier, recommendedClass, skill | tier+rarity |
| `wiki_contents` | slug, type(dungeon/event/colab), recommendedBuilds | type+createdAt |
| `tips` | id, category, title, content, authorUid, isOfficial | category+createdAt desc |
| `coupons` | (기존 유지) | (기존) |
| `events` (GA4 backup) | (기존 유지) | (기존) |

---

## 11. PDCA Phase 분해 (요약)

| Phase | 기간 | 주요 산출물 |
|-------|------|------------|
| P0 plan | 1주 (M+0) | PRD v2 + Plan v2 + Design v2 |
| P1 design | 1주 | Firestore 스키마 v2 + 디자인 시스템 v2 + Auth flow |
| P2 do.A 인증 | 1주 | Firebase Auth + 사용자 등록 + Settings |
| P3 do.B 위키 코어 | 1.5주 | 직업·진령 wiki + 북마크 + 신규 홈 |
| P4 do.C 위키 확장 | 1.5주 | 장비·스킬·문파·콘텐츠 wiki + Tips 확장 |
| P5 do.D 채팅 | 1주 | 3 채널 채팅 + 이미지 첨부 + 플로팅 위젯 + 알림 |
| P6 check | 0.5주 | Lighthouse + WCAG + Gap analysis |
| P7 act | 0.5주 | iterate (필요 시) |
| P8 qa | 0.5주 | E2E Chrome + 7-layer dataFlowIntegrity |
| P9 report + archive | 0.5주 | KPI 추적 시작 + V1 인풋 정리 |

**총 8-10주** (가속 효과 적용 시 6-8주 단축 가능).

---

## 12. 운영자 결정 게이트 (D-Gates v2)

(SCOPE-CHANGE.md §9 참조)
- G1 Auth Provider (Phase 2)
- G2 채팅 백엔드 (Phase 2)
- G3 이미지 정책 (Phase 5)
- G4 도메인 등록 (Phase 5)
- G5 Blaze 전환 (M3)

---

> **다음 산출물**: `plan.md` (Phase별 WBS) → `design.md` (기술 설계)
