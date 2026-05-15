# Sprint MVP Scope Change Decision Record

> 운영자: kay@agentkay.it
> 결정일: 2026-05-15
> 결정자: kay@agentkay.it (단독)
> 영향 Sprint: `god-kkabi-guide-sprint-mvp` → `god-kkabi-guide-sprint-mvp-v2`

---

## 1. 결정 요약

기존 Sprint MVP (정적 가이드 사이트, 16 페이지) 결과물은 **공개되지 않은 상태에서 폐기**하고, 새로운 MVP v2 (커뮤니티 위키 + 인증 + 채팅 + UGC + 북마크)로 범위를 재정의한다.

기존 MVP는 운영자가 별도로 [GitHub Pages](https://agent-kay-it.github.io/godkkabi-guide/)로 simplified 정적 HTML을 임시 공개하여 게임 유저들에게 배포하였고, **반응 검증 + 콘텐츠 풍부화 후 본격 플랫폼화** 필요성이 확인되었다.

---

## 2. 변경 동기 (Why)

### 2.1 외부 검증 결과
1. **GitHub Pages 정적 HTML 임시 공개** (운영자 직접) → 게임 유저 커뮤니티에 배포
2. **반응 우수** — 콘텐츠 풍부도 증가, 게임 유저 참여 의지 확인
3. **단순 정적 가이드 한계** — 사용자 데이터 수집·소통·재방문 동기 부족

### 2.2 신규 비즈니스 요구
1. **사용자 DB 확보** — Auth + 사용자 등록으로 DAU·MAU 측정 가능 + V3 B2B 매각 핵심 자산
2. **커뮤니티 형성** — 같은 서버·문파 유저 간 채팅·이미지 공유로 재방문율 + 체류 시간 증가
3. **콘텐츠 심층화** — 단순 가이드 → 위키 (whiteoutsurvival.wiki 모델) 수준 엔티티별 상세 페이지
4. **개인화** — 북마크로 사용자별 유용 정보 모음 → "이 사이트가 내 도구" 인식 형성

### 2.3 게임 콘텐츠 확장 (source/godkkabi-guide 분석)
운영자가 source/godkkabi-guide에 고도화한 콘텐츠 분석 결과 다음이 발견됨:
- **이미지 자산 11종** (게임 마케팅 배너 + 인게임 스크린샷) 자체 호스팅 가능
- **문파(길드) 시스템** 신규 카테고리 (기존 plan에 누락됨)
- **고급 메커니즘 섹션** — 진령 소환 PUR, 강화수정 효율, 자동사냥 미세 조정 등
- **카테고리 6종** — 직업·장비·스킬·진령·문파·콘텐츠 이벤트로 wiki 화

---

## 3. 폐기 자산 (Sunset)

### 3.1 코드 자산 (full sunset)
| 자산 | 폐기 이유 |
|------|----------|
| `app/page.tsx` (홈) | 신규 디자인 시스템·콘텐츠로 재작성 필요 |
| `app/coupon/page.tsx` | 디자인 + 데이터 모델 변경 |
| `app/class-quiz/page.tsx` | 콘텐츠 톤·UI 재정의 |
| `app/builds/meta-swordsman/page.tsx` | wiki 엔티티 페이지로 통합 예정 |
| `app/class/*` (4 페이지) | wiki `/wiki/class/{id}` 라우트로 이전 |
| `app/jinryeong/page.tsx` | wiki `/wiki/jinryeong/{id}` 11종 분리 |
| `app/skill-equip/page.tsx`, `app/dungeon/page.tsx`, `app/payment/page.tsx` | wiki / 콘텐츠 카탈로그로 재배치 |
| `app/event/page.tsx`, `app/tips/page.tsx`, `app/sources/page.tsx`, `app/intro/page.tsx` | UGC 가능 영역으로 통합 (Tips는 운영자 + 사용자 작성 혼합) |

### 3.2 디자인 자산 (full sunset)
| 자산 | 폐기 이유 |
|------|----------|
| 22 토큰 (gold #e8b860 + 9 colors) | source/godkkabi-guide 신규 토큰 (bronze #c89968 + jade/vermilion/indigo)로 교체 |
| Noto Sans KR 폰트 | Pretendard Variable로 교체 (한국형 본문 폰트 표준) |
| Magic UI 모션 3종 (BlurFade, AnimatedGradientText, ShimmerButton) | 새 디자인 시스템에 맞춘 모션 재선정 (위키 톤은 더 정적) |

### 3.3 컴포넌트 자산 (partial reuse / full sunset)
| 컴포넌트 | 처리 |
|----------|------|
| `<Hero>` | 새 디자인으로 재작성 (banner-fantasy-explore 배경 적용) |
| `<TOC>` | 재사용 가능 — 색상 토큰만 교체 |
| `<ClassCard>` | wiki 카드로 재작성 (data-class 패턴 + 통계 그리드 추가) |
| `<JinryeongCard>` | wiki 카드로 재작성 (catalog-jinryeong-ssr 모티프) |
| `<TierList>` | 재사용 가능 (vermilion/bronze/indigo 매핑) |
| `<CouponCode>` | 사용자 신고/추가 가능한 UGC 카드로 확장 |
| `<Alert>`, `<TipCard>`, `<EventCard>`, `<PayTier>`, `<PriorityFlow>` | 색상 토큰 교체로 재사용 |
| `<BuildTagBadge>`, `<ScreenshotStrip>`, `<Footer>` | 재사용 |
| `<ComboCard>` | wiki 엔티티 페이지 내부 추천 시너지로 흡수 |

---

## 4. 재사용 자산 (Carry-over)

### 4.1 인프라 (그대로 유지)
| 자산 | 상태 |
|------|------|
| Next.js 16.2.6 + React 19.2.6 + Tailwind v4 + TypeScript strict | ✅ |
| ESLint flat + Prettier + Vitest | ✅ |
| Firebase Web SDK (firestore.ts, client.ts, analytics.ts) | ✅ (확장) |
| Vercel 배포 + GitHub repo + main/staging 브랜치 정책 | ✅ |
| tene 3환경 시크릿 관리 + Vercel env vars | ✅ |
| 클린 아키텍처 4 레이어 (`ui/motion/domain/feature`) | ✅ (재사용) |
| Ports & Adapters (`lib/firebase/*`, `lib/firestore/*`) | ✅ (확장) |
| sitemap.ts + robots.ts 자동 생성 | ✅ |
| Lighthouse iterate 패턴 (preconnect + idle defer) | ✅ |

### 4.2 운영 자산
| 자산 | 상태 |
|------|------|
| Production URL `https://god-kkabi-guide.vercel.app` | ✅ (재배포로 교체) |
| Vercel project ID + Firebase project | ✅ |
| 운영자 12주 플레이 데이터 | ✅ (콘텐츠 작성 자산) |
| Sprint 0 R.A.T. + 보강 A/B/C/D 결정 | ✅ |

### 4.3 문서 자산
| 문서 | 상태 |
|------|------|
| Phase 1 plan 6 산출물 (design-system-research, content-policy, seo-keyword-50, gtm-seed-guide, component-inventory, operator-checklist) | ✅ (참조 + 부분 갱신) |
| Phase 2 design 3 산출물 (coding-conventions, design-tokens.json, firestore-rules) | ✅ (확장 갱신) |
| design.md (1005 lines) | ✅ (확장 갱신) |
| prd.md (357 lines) | ⚠️ v2 신규 작성 |
| plan.md (411 lines) | ⚠️ v2 신규 작성 |

---

## 5. 신규 추가 자산 (New in v2)

### 5.1 시스템 기능
- **Firebase Auth** (Google OAuth + Kakao OAuth 또는 익명) — 사용자 세션 관리
- **사용자 등록 폼** — 서버ID(S+숫자) / UID(게임에서 복사) / 문파 / 닉네임 / 직업
- **실시간 채팅** (Firestore onSnapshot 또는 Realtime DB) — 서버별 / 문파별 / 전체 3 채널
- **이미지 업로드** (Firebase Storage) — 사용자 게시 이미지 + 메타데이터
- **북마크 시스템** — Tips/wiki 페이지/사용자 게시물 북마크 + "내 북마크" 모아보기
- **알림** (브라우저 Push 또는 in-app 토스트) — 채팅 멘션 + 새 메시지

### 5.2 콘텐츠 카테고리 (위키화)
1. **직업 (Class)** — 3 직업 wiki 페이지 + 통계 그리드 + 추천 빌드 + 사용자 후기
2. **장비 (Equipment)** — 무기/방어구 카탈로그 + 강화 단계별 가치 + 제련 시스템
3. **스킬 (Skill)** — Core/Active/Passive 3 계열 × 직업별 + 시너지 매트릭스
4. **진령 (Jinryeong)** — 11종 wiki + 0/1/2 티어 + 시너지 + 운용 패턴
5. **문파 (Munpa, 신규)** — 길드 시스템 + 자원 수익 + 가입 가이드
6. **콘텐츠/이벤트 (Content & Event)** — 던전/이벤트/콜라보 카탈로그

### 5.3 데이터 모델 (Firestore 12+ 컬렉션)
| 컬렉션 | 상태 | 비고 |
|--------|------|------|
| `users` | 신규 활성 | 서버ID + UID + 문파 + 닉네임 + 직업 + 북마크 IDs |
| `servers` | 신규 활성 | S로 시작하는 서버 ID 마스터 |
| `munpas` | 신규 활성 | 문파 마스터 (server_id + munpa_name 복합) |
| `chat_channels` | 신규 활성 | 전체/서버별/문파별 채널 |
| `chat_messages` | 신규 활성 | 메시지 + 첨부 이미지 URL + 멘션 |
| `bookmarks` | 신규 활성 | uid + target_type + target_id |
| `wiki_classes` | 신규 활성 | 3 직업 entity |
| `wiki_equipments` | 신규 활성 | 장비 entity (~50-100건) |
| `wiki_skills` | 신규 활성 | 스킬 entity (~30-50건) |
| `wiki_jinryeong` | 신규 활성 | 11종 진령 entity |
| `wiki_munpas` | 신규 활성 | 문파 시스템 정보 |
| `wiki_contents` | 신규 활성 | 던전/이벤트 entity |
| `tips` | 확장 | 운영자 + 사용자 작성 혼합 |
| `user_posts` | 신규 활성 | 사용자 게시물 (노하우 공유) |
| `coupons` | 유지 | 기존 스키마 |
| `events` (GA4 backup) | 유지 | 기존 스키마 |
| `builds` | 유지 | admin-seed 1건 + V1 UGC 활성화 |
| `tier_votes`, `pain_topics` | V2+ 활성 | MVP 비활성 유지 |

---

## 6. M3 졸업 조건 재정의

| 항목 | 기존 (v1) | v2 (변경) | 사유 |
|------|----------|----------|------|
| Lighthouse Mobile Performance | ≥ 90 | ≥ 85 | 인증/실시간 채팅으로 JS 번들 증가 영향 |
| Accessibility | ≥ 90 | ≥ 90 | 동일 |
| Best Practices | ≥ 90 | ≥ 90 | 동일 |
| SEO | ≥ 90 | ≥ 90 | 동일 |
| DAU | 100+ @ M+30 | 100+ @ M+30 | 동일 |
| **사용자 가입 수** | (해당 없음) | **30+ @ M+30** | v2 신규 — 인증 도입 |
| **채팅 메시지 수** | (해당 없음) | **200+ @ M+30** | v2 신규 — 커뮤니티 활성도 |
| **북마크 사용** | (해당 없음) | **사용자 평균 3+** | v2 신규 — 도구 가치 검증 |
| **위키 페이지 수** | 16 페이지 | **80+ 엔티티** | wiki 모델 |
| Production 배포 | 완료 | 완료 | 동일 |

---

## 7. 폐기/유지/신규 자산 요약

| 영역 | 폐기 | 유지 | 신규 |
|------|------|------|------|
| 페이지 | 16 페이지 (v1) | sitemap/robots | 약 20-30 페이지 (위키 80+ entity는 동적 라우트) |
| 컴포넌트 | 8 (Hero/JinryeongCard/CouponCode 등 재작성) | 7 (TOC/TierList/Alert/TipCard/EventCard/PayTier/Footer 토큰 교체) | 약 15-20 신규 (Auth UI / 채팅 / 북마크 / 알림) |
| Firestore 컬렉션 | (없음) | 3 (coupons/events/builds) | 약 12 신규 |
| 디자인 토큰 | 22 (Gold/Noto Sans KR) | (없음) | 약 18-22 (Bronze/Jade/Vermilion/Indigo + Pretendard) |

---

## 8. 일정/예산 영향

### 8.1 일정
- 기존 v1: 12주 (M1-M3)
- v2 신규: **약 6-8주 가속** (인프라/문서/패턴 재사용 가능 → 페이지 작성 단축 + 신규 시스템 추가 상쇄)
- 시작: 2026-05-15
- 졸업 평가: 2026-07-01 (6주차) 또는 2026-07-15 (8주차)

### 8.2 예산
- 기존: $0/월 (Spark Plan + Vercel Hobby)
- v2 예상: $0~$5/월 (Spark Plan 한도 내 — 채팅 메시지 50K read/일 + 이미지 5GB)
- **위험점**: DAU 200+ 도달 시 Firestore Spark 한도 초과 → Blaze 전환 필요 ($5-10/월)
- **운영자 결정**: M3 시점에 Blaze 전환 여부 재평가

---

## 9. 운영자 추가 결정 게이트 (v2 신규)

| 게이트 | 시점 | 결정 사항 |
|--------|------|----------|
| G1 — Auth Provider | Phase 2 design | Google OAuth 단일 vs Google + 카카오 듀얼 |
| G2 — 채팅 백엔드 | Phase 2 design | Firestore onSnapshot vs Realtime DB (성능·비용 트레이드오프) |
| G3 — 이미지 정책 | Phase 3 do.C | 사용자 업로드 최대 크기 (1MB?) + 모더레이션 (V1+ NSFW 자동 차단) |
| G4 — 도메인 등록 | Phase 3 do.D | kkaebizigi.com / gokkaebi.guide / jinryeong.kr 중 선택 (브랜딩 답변 기준) |
| G5 — Blaze 전환 | M3 graduation | DAU/메시지 증가 시 유료 플랜 전환 |

---

## 10. 본 결정의 효력

본 문서가 작성된 시점부터 다음이 적용된다:

1. **기존 sprint-mvp**는 archived 상태로 유지 (참고용)
2. **신규 sprint-mvp-v2**가 Active sprint로 등록
3. **production URL** `https://god-kkabi-guide.vercel.app/`는 신규 MVP v2 배포 시점까지 v1 콘텐츠 유지 (또는 임시 "준비 중" 페이지로 교체 — Phase 3 do.A 결정)
4. **GitHub Pages** `https://agent-kay-it.github.io/godkkabi-guide/` 정적 페이지는 v2 production 배포 전까지 유지 (운영자 직접 갱신)

---

> **다음 단계**: PRD v2 작성 → Plan v2 작성 → Design v2 작성 → MASTER-PLAN.md 최종 갱신
