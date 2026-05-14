# Sprint V1 PRD — UGC 커뮤니티 + 매출 시드 (Firebase Auth + 댓글 + 빌드 공유)

> **Sprint ID**: `god-kkabi-guide-sprint-v1`
> 기간: M4-M9 (24주, 약 168일, 2026-08-10 ~ 2027-02-07)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.3, §5.3 · 입력: Sprint MVP M6 졸업 + `docs/01-pm/04-prd.md` §7.3

---

## 1. Mission (한 줄 결론)

**"Sprint MVP의 시드 트래픽(DAU 500+) 위에 Firebase Auth(Google/Kakao) + 댓글 시스템 + UGC 빌드 공유 + AdSense 광고를 도입해 P2 공유러 페르소나를 활성화하고, M9 시점 DAU 2,000+ / 빌드 누적 1,000+ / 댓글 5,000+ / 매출 ₩100K+/월의 V2 진입 졸업 KPI를 달성한다."**

Sprint V1은 MVP가 검증한 시드 채널(디시/네이버 카페/카톡)을 유지하면서 UGC를 통한 자가 증식 루프(PRD §5.2 Loop B Network Loop)를 활성화한다. 광고는 모바일 가독성을 해치지 않는 1-2 슬롯으로 제한하며, Pain Point는 V1에서 raw text 누적만 시작(NLP는 V2). 운영자 모더레이션 부담을 분산하기 위해 욕설 필터 + 신고 시스템을 도입한다.

---

## 2. Beachhead / Target

### 2.1 Primary Activation (P2 공유러)

| 항목 | 값 (PRD 04 §2.2) |
|------|----------------|
| 페르소나 | P2 공유러 (UGC Contributor) |
| 활성화 시점 | V1 진입 직후 (M4-M5) |
| 핵심 행동 | 빌드 작성, 댓글 작성, 좋아요 받음 |
| 동기 | 자존감 충족 (디시처럼 묻히지 않고 자료 누적), 메타 기여자 인정 |
| 이탈 트리거 | 모더레이션 과도 (운영자 검열 인식), 댓글 트롤, 광고 5개+ |

### 2.2 Secondary Retention (P1 검투호 유지)

- MVP에서 침투한 P1 검투호가 V1에서 댓글로 질문하고 빌드 좋아요/북마크 → 회귀율 ↑
- 광고 1-2 슬롯이 P1 이탈 트리거(광고 5개+)를 자극하지 않도록 슬롯 위치 신중

### 2.3 V1 Activation Funnel

```
MVP 진입 유저 (DAU 500+)
    ↓
1. 콘텐츠 페이지 진입 → 댓글 영역 노출 (회원가입 CTA)
    ↓
2. 회원가입 (Google/Kakao 30초 내)
    ↓
3. 첫 댓글 작성 또는 빌드 작성
    ↓
4. 좋아요/댓글 받음 → 자존감 충족
    ↓
5. 카톡/디시에 우리 사이트 자발적 공유 (Loop B)
```

---

## 3. In Scope (Master Plan §1 SCOPE(V1) 구체화)

### 3.1 Firebase Auth (F2.1)
- Google OAuth + Kakao OAuth 2종 제공
- 이메일 가입은 SPAM 방지 위해 도입하지 않음
- PIPA 대응: 가입 시 분석/공개 프로필 동의 체크박스 → `users.consent`에 저장
- 익명 → 회원가입 마이그레이션 (anonymous Firebase Auth → social 전환)

### 3.2 댓글 시스템 (F2.2)
- Firestore `comments` 컬렉션 (V1 신규 추가)
- 빌드 페이지 + 9 콘텐츠 페이지에 댓글 영역
- 페이지네이션 (20개씩 cursor 기반)
- 신고 기능 (사용자 → 운영자 알림)
- 자동 욕설 필터 (한글 욕설 사전 + 정규식)
- **Giscus 대안 검토**: Firestore 비용 ¼ 매출 초과 시 Giscus 마이그레이션 (M9 시점 결정)

### 3.3 빌드 공유 (F2.3)
- 빌드 작성 폼: 직업 + 진령 3개 + 스킬 셋(코어/액티브/패시브) + 제련 등급 + 코멘트 + 태그
- 빌드 영구 URL: `/builds/[slug]` (slug = `class-yyyymmdd-shortid`)
- 빌드 표준 포맷 (Firestore `builds` 스키마, Sprint 0 검증 + V1 활성)
- 빌드 작성자 prefix 공개 옵션 (`users.consent.profile_public`)

### 3.4 좋아요·북마크·신고 (F2.4)
- 빌드/댓글에 좋아요 (denormalized `likes_count` counter)
- 북마크 (사용자별 `users/{uid}/bookmarks` 서브컬렉션)
- 신고: 댓글/빌드 → 운영자 알림 (이메일 또는 admin 페이지)

### 3.5 운영자 모더레이션 도구 (F2.5)
- 관리자 라우트 `/(admin)/moderate` (`users.role: 'admin'` 사용자만)
- 신고된 댓글/빌드 목록 + 삭제/유지 결정
- 욕설 필터 자동 차단 단어 사전 관리
- 쿠폰 관리(`/(admin)/coupons`) — MVP에서 이연된 admin UI 도입

### 3.6 광고 AdSense (F2.6)
- DAU 500+ 도달 후 1-2 슬롯 활성화
- 위치: (1) 콘텐츠 페이지 footer 위 / (2) 빌드 상세 페이지 사이드바
- 모바일 슬롯은 콘텐츠 75% 스크롤 이후만 노출 (이탈 방지)
- 광고 카테고리 필터: 게임 카테고리만 허용 (BlueStacks/디씨 게임 광고 거부)

### 3.7 Pain Point 수집 (F2.7) — raw text 누적
- 댓글에서 부정 감정(만료, 버그, 패치 불만) raw text 누적
- Firestore `pain_topics` 컬렉션 V1 raw 모드: `{ raw_text, source, week, processed: false }`
- V2에서 NLP 클러스터링으로 토픽 추출

---

## 4. Out of Scope (V2+로 이연)

| 항목 | 이연 Sprint | 이연 사유 |
|------|----------|---------|
| 빌드 시뮬레이터 (진령 3선택 시너지 시각화) | V2 (F3.1) | 빌드 1K+ 누적 후 의미 있는 시너지 데이터 |
| 진령 채용률 차트 (주간 추이) | V2 (F3.2) | 빌드 1K+ 누적 필요 |
| 결투장 빌드 트렌드 | V2 (F3.3) | PvP 메타 변화 데이터 |
| 쿠폰 유효성 자동 검증 (커뮤니티 제보) | V2 (F3.4) | 댓글/신고 시스템 안정화 후 |
| Pain Point NLP 클러스터링 | V2 (F3.5) | V1 raw 누적 후 |
| 프리미엄 구독 결제 (Stripe/토스) | V2 (F3.6) | DAU 2K+ + 매출 ₩300K+ 후 |
| 다국어 (JP/EN) | V2 (F3.7) | 한국 단독 출시 게임 |
| B2B API 라이선스 | V3 (F4.2) | 데이터 누적 후 |
| 어드민 SaaS 대시보드 | V3 (F4.3) | B2B 영업 시점 |
| 인수 제안 패키지 | V3 (F4.4) | DAU 5K+ + 빌드 10K+ |

---

## 5. Success Metrics (Sprint V1 졸업 KPI, M9 시점)

### 5.1 Master Plan §8.1 졸업 KPI

| ID | 항목 | 졸업 (PASS) | 보류 | 폐기 |
|----|------|----------|------|------|
| V1-90-01 | DAU (180일 누적) | 2,000+ | 1,000-2,000: V1 6개월 연장 | <1,000: V2 보류 |
| V1-90-02 | 빌드 누적 | 1,000+ | 500-1,000: V1 연장 | <500: UGC 침투 실패 |
| V1-90-03 | 댓글 누적 | 5,000+ | 2,000-5,000: V1 연장 | <2,000 |
| V1-90-04 | 매출 (광고) | ₩100K+/월 | ₩30K-100K: V1 연장 | <₩30K: 광고 모델 재평가 |
| V1-90-05 | 신규 회원가입 | 100/주 | 30-100/주: 가입 마찰 분석 | <30/주: Auth UX 재설계 |

### 5.2 Sprint V1 특화 KPI

| ID | 항목 | 목표 | 근거 |
|----|------|------|------|
| V1-FN-01 | 신규 유저 → 회원가입 전환율 | 5%+ | Auth funnel 효율 |
| V1-FN-02 | 회원가입 → 첫 빌드/댓글 작성 전환율 | 30%+ | UGC 활성화 |
| V1-FN-03 | 신고 처리 SLA | 24h 이내 | 모더레이션 신뢰성 |
| V1-FN-04 | 욕설 필터 적중률 | 80%+ | 모더레이션 자동화 |
| V1-FN-05 | 광고 CTR (모바일) | 1%+ | 매출 효율 |
| V1-FN-06 | 평균 회원 회귀율 (주간) | 40%+ | 자가 증식 루프 |
| V1-FN-07 | 빌드 페이지 평균 좋아요 | 5+/빌드 | UGC 가치 |

---

## 6. Risk → Mitigation (Master Plan §6 매핑)

| Risk ID | V1 시점 적용 | 1차 완화 액션 |
|----|------|------|
| **R1** Joy Games 공식 가이드 | M4-M9 발생 시 가장 큰 영향 | UGC 차별점(빌드 시뮬레이터 V2 예고) + 사용자 인증 후 데이터 자산 누적 가속 |
| **R2** 인벤 갓깨비 도메인 신설 | V1 활성기 6-12개월 윈도우 | Branded Search "갓깨비 가이드" Share 40%+ 목표 (Loop B UGC 가속) |
| **R3** 게임 라이프사이클 | V1 종료 시점(M9)에 진입 가능 | UGC 빌드/댓글이 SEO 자산이 되어 후속작 마이그레이션 시 재활용 가능 |
| **R4** Firebase 무료 한도 | V1에서 가장 큰 리스크 | 댓글은 Giscus fallback 옵션, 빌드는 ISR, BUDGET_EXCEEDED $10/월 모니터링 |
| **R5** 비공식 사이트 법적 압박 | V1 활성기 인지도 ↑ | 모더레이션 도구 + 디스클레이머 강화 + V2 게임사 사전 소개 메일 (M14 시점) |
| **R6** 1인 운영자 번아웃 | V1 24주 가장 위험 | UGC 활성화로 운영자 콘텐츠 작성 부담 분산, 모더레이션 자동화 |
| **R7** 카카오프렌즈 IP | 콜라보 진령 페이지 빌드 작성 시 발생 가능 | 빌드 작성 시 콜라보 진령 사용 가이드라인 명시 |

### 6.1 V1 활성화되는 Auto-Pause Triggers

| Trigger | V1 임계값 | 발동 시 액션 |
|---------|---------|----------|
| QUALITY_GATE_FAIL | M3 Auth 보안 / M7 dataFlowIntegrity / M4 Lighthouse 광고 영향 | Phase act iterate |
| ITERATION_EXHAUSTED | iterate 3회 후 미통과 | 스코프 축소 (광고 제외, 댓글만) |
| BUDGET_EXCEEDED | 월 인프라 > $10 (Firebase 무료 한도 80% 도달) | Giscus 마이그레이션 또는 Blaze 결정 |
| PHASE_TIMEOUT | Phase do 32주 초과 (예상 16주의 2배) | 운영자 시간 재평가, Sprint 일정 조정 |

---

## 7. User Stories (Master Plan §2 V1 Features 매핑 + PRD 04 §7.3)

### 7.1 Story V1-1: 빌드 공유 (F2.3)
- As a P2 공유러, I want to 내가 만든 검객+홍길동/서해용왕/치우 빌드를 표준 포맷으로 공유하고 싶다, So that 디시처럼 묻히지 않고 자료로 남는다.
- 수용 기준:
  - [ ] 빌드 작성 폼: 직업 + 진령 3개 + 스킬 셋 + 제련 + 코멘트 + 태그
  - [ ] 빌드 페이지 URL 영구 보존 (`/builds/[slug]`)
  - [ ] 좋아요/북마크 가능 (Auth 필요)
  - [ ] 모더레이션 도구 (운영자 신고 처리)
  - [ ] 빌드 작성 후 5분 내 GSC 인덱싱 요청

### 7.2 Story V1-2: 댓글 (F2.2)
- As a P1·P2, I want to 빌드/가이드 페이지에서 질문/감사를 남기고 싶다, So that 트롤 없는 토론 가능.
- 수용 기준:
  - [ ] Firestore 댓글 (또는 Giscus fallback) 작동
  - [ ] 신고 기능 → 운영자 알림 24h SLA
  - [ ] 자동 욕설 필터 (한글 사전 + 정규식)
  - [ ] 페이지네이션 20개씩
  - [ ] GA4 `comment_create` 이벤트 발화

### 7.3 Story V1-3: 회원가입 (F2.1)
- As a 신규 유저, I want to Google 또는 Kakao 계정으로 30초 안에 회원가입하고 싶다, So that 별도 비밀번호 관리 부담 없이 빌드 작성·좋아요 가능.
- 수용 기준:
  - [ ] Google OAuth + Kakao OAuth 2종 제공
  - [ ] PIPA 동의 체크박스 (가입 흐름에 포함)
  - [ ] 가입 후 첫 진입 페이지에서 "빌드 작성 시작" CTA
  - [ ] GA4 `signup` 이벤트 발화

### 7.4 Story V1-4: 좋아요 + 북마크 (F2.4)
- As a 회원, I want to 빌드/댓글에 좋아요를 누르고 좋은 빌드를 북마크하고 싶다, So that 나중에 다시 찾아볼 수 있다.
- 수용 기준:
  - [ ] 좋아요 토글 (Optimistic UI)
  - [ ] denormalized counter 1초 내 업데이트
  - [ ] 북마크 페이지 `/my/bookmarks`
  - [ ] GA4 `build_like` 이벤트 발화

### 7.5 Story V1-5: 모더레이션 (F2.5, 운영자 전용)
- As a 운영자, I want to 신고된 댓글/빌드를 한 페이지에서 확인하고 삭제/유지 결정하고 싶다, So that 24h SLA 모더레이션 가능.
- 수용 기준:
  - [ ] `/(admin)/moderate` 라우트 (admin role only)
  - [ ] 신고 큐 (신고일자 desc + 신고 횟수 desc)
  - [ ] 일괄 처리 (10건 단위)
  - [ ] 삭제 시 작성자 알림 (이메일 또는 사이트 내 알림)

---

## 8. Pre-mortem (5종 실패 시나리오)

### 8.1 시나리오 A: 모더레이션 부하 폭증 → 운영자 번아웃 (확률 중-고)
- **증상**: V1 진입 후 댓글/빌드 1주 100건+ 증가 → 신고도 비례 증가 → 운영자 모더레이션 4-6h/주 → 본업 외 시간 초과.
- **근본 원인**: 욕설 필터 적중률 부족, 디시 트롤 유입.
- **사전 방어**: Phase plan에서 욕설 사전 미리 작성 (1000+ 단어), Phase design에서 자동 차단 임계값(같은 단어 3회+ = 자동 삭제) 설정.
- **사후 대응**: 신고 처리 일괄 도구 + 트롤 IP 차단 + Discord 자원봉사 모더레이터 검토.

### 8.2 시나리오 B: Firebase 무료 한도 초과 (R4) (확률 중 40%)
- **증상**: DAU 1,500 도달 시점 Firestore reads 일 40K+ 도달 → BUDGET_EXCEEDED 트리거.
- **근본 원인**: 댓글 페이지 진입마다 댓글 20개 + 좋아요 수 read = 40 reads/페이지.
- **사전 방어**: Phase design에서 ISR + Firestore 캐싱 + denormalized counter 적용.
- **사후 대응**: Giscus(GitHub Discussions) 마이그레이션 또는 Blaze plan 결정 (운영자 수동 게이트).

### 8.3 시나리오 C: 광고 도입 후 Lighthouse <85 만성화 (확률 중)
- **증상**: AdSense 1-2 슬롯 활성화 후 모바일 Lighthouse 90 → 80대 진입 → P1 검투호 이탈 트리거(로딩 3초+) 발동.
- **근본 원인**: AdSense JS 동기 로딩 + 광고 이미지 비최적화.
- **사전 방어**: Phase design에서 AdSense lazy load + Intersection Observer 적용.
- **사후 대응**: 광고 슬롯 1개로 축소 또는 모바일 광고 제외 (데스크탑만).

### 8.4 시나리오 D: 빌드 작성 폼이 너무 복잡 → 작성률 저조 (확률 중)
- **증상**: 회원가입 → 빌드 작성 전환율 30% 목표 → 실측 10% 이하.
- **근본 원인**: 빌드 폼 필드 너무 많음 (직업+진령3+스킬3+제련등급+코멘트+태그 = 9 필드).
- **사전 방어**: Phase design에서 빌드 폼 3단계로 분할 (직업 → 진령 → 코멘트). 진령은 클릭 선택 UI.
- **사후 대응**: 폼 필드 축소 (제련등급 옵션화) + 빌드 작성 가이드 영상/이미지 추가.

### 8.5 시나리오 E: 인벤이 V1 활성기에 갓깨비 도메인 신설 (R2) (확률 중 30%)
- **증상**: M6-M9 사이 `pad.inven.co.kr/gokkaebi` 패턴 도메인 신설 → SERP 즉시 1-3위 점유 → 신규 가입 트래픽 -30~50%.
- **근본 원인**: 우리 사이트가 매출/MAU 임계 도달 시 인벤이 자동 신설 (PRD 04 §4.3).
- **사전 방어**: V1 활성기에 Branded Search "갓깨비 가이드" Share 40%+ 확보. UGC 빌드 1,000+ 누적이 인벤 단순 게시판 모방 어려운 자산.
- **사후 대응**: 빌드 시뮬레이터 V2 진입 가속 (인벤이 만들 수 없는 인터랙티브 차별점).

---

## 9. 의존성 (Sprint MVP 입력 + V2 출력)

### 9.1 MVP에서 받는 입력
- Next.js 16 App Router 코드베이스 (15개 페이지 + 14개 컴포넌트)
- Firestore `coupons` + `events` 활성 컬렉션 (V1에서 4개 추가 활성)
- GA4 9개 이벤트 (V1에서 `signup`, `build_create`, `build_like`, `comment_create`, `report_submit` 5개 추가)
- 디자인 시스템 + tene 시크릿 + 도메인
- MVP 90일 KPI 측정 결과 (DAU 500+ 확인)

### 9.2 V2 입력 출력
- Firebase Auth 활성 + `users` 컬렉션 1,000+ 유저
- `builds` 컬렉션 1,000+ 빌드 (V2 시뮬레이터 데이터 소스)
- `comments` 컬렉션 5,000+ 댓글 (V2 NLP raw 데이터)
- `pain_topics` raw text 누적 (V2 NLP 클러스터링 입력)
- AdSense 매출 ₩100K+/월 (V2 Stripe 구독 베이스라인)

---

## 10. Attribution

| 입력 | 위치 |
|------|------|
| Sprint Master Plan | `docs/sprint/00-master-plan.md` §2 V1 Features, §3.3, §5.3, §8 |
| 통합 PRD | `docs/01-pm/04-prd.md` §7.3 V1 User Stories, §11 데이터 스키마 |
| Sprint MVP 졸업 KPI | `docs/sprint/02-sprint-mvp/report.md` (Sprint MVP 종료 후 작성) |

**프레임워크**: bkit Sprint Management v2.1.13 + pm-skills (MIT) + Gary Klein Pre-mortem.

> **Status**: Draft v1.0 — pending review.
> 다음 산출물: `plan.md` (8 Phase WBS) → `design.md` (Auth 흐름 + UGC 스키마 + 모더레이션).
