# Sprint MVP PRD — 정적 가이드 사이트 출시 (Beachhead 침투)

> **Sprint ID**: `god-kkabi-guide-sprint-mvp`
> 기간: M1-M3 (12주, 약 84일, 2026-05-17 ~ 2026-08-09)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §2/§3.2/§8 · 입력: Sprint 0 PASS + `docs/01-pm/04-prd.md` §12 + `docs/01-pm/05-decisions.md` 4건

---

## 1. Mission (한 줄 결론)

**"원본 HTML 1444 lines × 9 섹션을 Next.js 16 App Router로 이식하고, 다크/골드 한국 오컬트 무드와 모바일 first 반응형으로 검객 Beachhead(P1 검투호)에 침투해 90일 누적 DAU 100+ / Lighthouse 모바일 ≥90 / SERP "갓깨비 키우기 공략" 상위 30위를 달성한다."**

본 Sprint는 인프라 비용 ≤$5/월, 광고 0개, UGC 미도입 상태에서 정적 SSOT 가이드의 신뢰성·신선도·모바일 가독성만으로 검투호 P1을 침투한다. Sprint 0가 검증한 Firestore 6 컬렉션 스키마 중 `coupons`(운영자 입력) + `events`(GA4 백업) 2종을 활성화하고, 나머지 4종은 V1+ 진입까지 비활성 보존한다.

---

## 2. Beachhead / Target

### 2.1 Primary Target (Master Plan §1 WHO 재인용)

**검객 직업 + 메타 정석 추종 + 디시/네이버 카페 활용 25-40세 남성 소-중과금 유저 (페르소나 P1 "검투호")**

| 항목 | 값 (Master Plan §1, PRD 04 §2.1 일치) |
|------|------|
| 연령 | 25-40세 |
| 성별 | 남성 95%+ |
| 거주 | 수도권 + 광역시 |
| 소득 | 월 250-500만원 |
| 과금 | 월 ₩20K-100K (소-중과금) |
| 플레이 | 평일 30-60분 + 주말 1-2시간, 직업 = 검객 |
| 정보 채널 | 디시 갓깨비 마이너 갤러리(주 5+) / 카톡 단톡 / 가끔 BlueStacks |
| 결정 트리거 | 메타 패치 / 999뽑기 / 쿠폰 발급 / 신규 진령 |
| 반응 시점 | 메타 변화 → 24-48h 내 검색 |
| 이탈 트리거 | 로딩 3초+ / 광고 5개+ / 정보 부정확 / 디자인 조잡 |

### 2.2 Secondary (MVP 가시화만, V1+ 본격 활성화)

- P2 공유러: MVP에서는 "댓글/빌드 공유 V1 예정" 안내 배너만 노출하여 기대치 형성
- P3 정보수집형: MVP에서는 진령 카드 11종 + 검객 메타 빌드 정밀 페이지로 부분 가치 전달

### 2.3 Out of Scope (MVP Target에서 제외)

- 영매·전사 단독 추종자 (MVP 콘텐츠는 검객 우선, 영매/전사는 직업 카드 수준만)
- 무과금 라이트 유저 (체류시간 짧음, 광고 매출 없는 MVP에서 우선순위 ↓)
- 일본·영어권 유저 (V2 후반 검토)

---

## 3. In Scope (12 항목)

> Master Plan §1 SCOPE(MVP)를 구체화. 각 항목은 §2 Features F1.1 ~ F1.9 매핑.

1. **콘텐츠 9섹션 이식** (F1.1)
   - 개요 / 직업 / 진령 / 스킬·제련 / 던전·PvP / 과금 전략 / 이벤트·쿠폰 / 실전 팁 / 출처
   - 원본 HTML `source/original-guide.html` (1444 lines) → Next.js 16 App Router로 1:1 이식 후 정교화
   - 검객 메타 빌드 페이지(`/builds/meta-swordsman`)는 별도 우선순위 P0
2. **디자인 시스템** (F1.2)
   - 다크 베이스(#0a0612) + 골드 액센트(#e8b860) + 퍼플(#8b5cf6) + 시안(#38d9d9)
   - Noto Sans KR + Apple SD Gothic Neo fallback
   - 한국 오컬트/도깨비 무드
   - 컴포넌트 14종 인벤토리(design.md §3 참조)
3. **모바일 first 반응형**
   - 320px / 375px / 414px / 768px / 1024px / 1280px 6개 브레이크포인트
   - Lighthouse 모바일 ≥90 (5개 핵심 페이지)
4. **쿠폰 자동 체커** (F1.3)
   - 운영자 입력 (Firestore `coupons` 컬렉션 활성)
   - 유효/만료 분리 표시
   - 클릭 복사 + Toast 안내 + D-day 카운트다운
   - 운영자 12h SLA 업데이트
5. **직업 진단** (F1.4)
   - 3-5문항으로 검객/전사/영매 추천
   - 결과 페이지에서 해당 직업 카드/빌드 즉시 링크
6. **진령 11종 카드** (F1.5)
   - 홍길동/서해용왕/음영귀/명왕/치우/격투귀/구미요호/태양여신/궁귀/항아/산신
   - 등급(SS/S/A/B) + 추천 직업 + 핵심 스킬 + 마지막 업데이트 일자
7. **검객 메타 빌드 페이지** (F1.5)
   - Beachhead 핵심 페이지
   - 진령 3선택(홍길동+서해용왕+치우 or +음영귀) + 시너지 설명
   - 스킬 우선순위(코어/액티브/패시브) + 제련 부위별 추천
8. **GA4 + Firestore 스키마** (F1.6)
   - GA4 12개 이벤트 활성화 (page_view, coupon_copy, class_diagnose_complete, jinryeong_card_click, tier_view, meta_build_view, external_link_click, scroll_depth_75, dwell_60, build_create(V1+), build_like(V1+), signup(V1+))
   - Firestore 6 컬렉션: MVP는 `coupons` + `events` 활성, 나머지 4종(`users`, `builds`, `tier_votes`, `pain_topics`) 스키마 정의만 + V1+ 활성
9. **SEO 롱테일 50개 키워드** (F1.7)
   - 메타 태그(title, description, og)
   - sitemap.xml + robots.txt
   - JSON-LD 구조화 데이터(Article, FAQPage)
   - 카테고리: 직업(8) / 진령(11) / 스킬(8) / 쿠폰(5) / 이벤트(4) / 메타(6) / 빌드(5) / 공략(3) = 50개
10. **콘텐츠 정책 문서** (F1.8)
    - D2 하이브리드 70/30 (운영자 직접 70% + UGC 가공 인용 30%)
    - 인용 출처 명시 의무, 이미지 핫링크 정책, 분쟁 대응 절차
    - 산출물: `docs/policies/content-policy.md`
11. **도메인 + Vercel 배포** (F1.9)
    - D1 게임-specific 도메인: 1순위 `gokkaebi-guide.com` / 2순위 `god-kkabi.kr`
    - tene 시크릿 11개 (Master Plan §10.1.F)
    - Vercel Hobby + ISR + Image Optimization
12. **법적 디스클레이머**
    - 홈/푸터에 "비공식 팬 가이드, Joy Net Games / JOY MOBILE NETWORK PTE. LTD. / 4399와 무관" 명시
    - 공식 이미지는 Google Play CDN 핫링크만 사용 (미러링/변형 금지)
    - 카카오프렌즈 콜라보 진령 페이지는 텍스트 위주

---

## 4. Out of Scope (V1+로 이연)

> Master Plan §2 Features V1/V2/V3 항목 + PRD 04 §12.2 일치.

| 항목 | 이연 Sprint | 이연 사유 |
|------|----------|---------|
| 사용자 인증 (Firebase Auth Google/Kakao) | V1 (F2.1) | MVP 침투기에는 회원가입 마찰 회피 |
| 댓글 시스템 | V1 (F2.2) | UGC 모더레이션 부담 → V1에서 활성화 |
| 빌드 공유 (UGC) | V1 (F2.3) | 빌드 표준 포맷 + 영구 URL은 Auth 의존 |
| 좋아요·북마크·신고 | V1 (F2.4) | Auth 의존 |
| 운영자 모더레이션 도구 | V1 (F2.5) | 댓글/빌드 활성화 시점에 필요 |
| 광고 (AdSense) | V1 (F2.6) | MVP는 광고 0개 (BlueStacks 차별점) |
| Pain Point 수집 | V1 (F2.7) raw / V2 (F3.5) NLP | 댓글 활성화 시점에 raw 수집, NLP는 V2 |
| 빌드 시뮬레이터 | V2 (F3.1) | 인터랙티브, V1 UGC 누적 후 진입 |
| 진령 채용률 차트 | V2 (F3.2) | 빌드 1K+ 누적 필요 |
| 결투장 빌드 트렌드 | V2 (F3.3) | UGC 빌드 필요 |
| 쿠폰 유효성 자동 검증 (커뮤니티 제보) | V2 (F3.4) | MVP는 운영자 수동 입력 |
| 프리미엄 구독 결제 (Stripe/토스) | V2 (F3.6) | 매출 모델 V2 진입 |
| 다국어 JP/EN | V2 (F3.7) | 한국 단독 출시 게임 - V2 후반 검토 |
| B2B API 라이선스 | V3 (F4.2) | 데이터 누적 후 |
| 어드민 SaaS 대시보드 | V3 (F4.3) | 데이터 누적 후 |
| 인수 제안 패키지 | V3 (F4.4) | DAU 5K+, 빌드 10K+ 후 |
| Cold Outreach | V3 (F4.5) | V2 졸업 후 |
| 모바일 네이티브 앱 | 영구 Out | PWA로 대체 |
| 외부 투자 유치 | 영구 Out | V3 종료 시 인수만 검토 |

---

## 5. Success Metrics (Sprint MVP 졸업 KPI)

### 5.1 30일차 (배포 후) — 단기 검증

| ID | 항목 | 목표 | 측정 도구 | 미달 액션 |
|----|------|------|----------|----------|
| MVP-30-01 | Lighthouse 모바일 점수 | ≥ 90 (5개 핵심 페이지) | Lighthouse CI (GitHub Actions) | 이미지 최적화, 폰트 sub-setting, JS 코드 스플리팅 |
| MVP-30-02 | 페이지 로딩 시간 (FCP, 3G) | < 2.0초 | Lighthouse | Vercel ISR 캐싱 강화 |
| MVP-30-03 | 5개 핵심 키워드 인덱싱 | 모두 GSC 등록 | Google Search Console | sitemap 재제출 |
| MVP-30-04 | GA4 이벤트 발화 | 5개 핵심 이벤트 정상 | GA4 DebugView | 이벤트 코드 디버그 |
| MVP-30-05 | 시드 트래픽 DAU | 30+ | GA4 + Vercel Analytics | 디시 시드 강화 |
| MVP-30-06 | 콘텐츠 9섹션 모두 포함 | 9/9 페이지 | URL 검증 | 누락 페이지 즉시 작성 |

### 5.2 90일차 (M3 졸업 게이트) — Master Plan §8.1 일치

| ID | 항목 | 졸업 KPI (PASS) | 보류 (M3 미달 시 M4.5/M6 분기) | 폐기 |
|----|------|------------|--------------------------|------|
| MVP-90-01 | DAU (90일 누적 일평균) | 100+ (M3) → 500+ (M6) | 200-500 (M6): MVP 6개월 연장 | <200 (M6): 프로젝트 폐기 |
| MVP-90-02 | Lighthouse 모바일 | ≥90 (5개 페이지) | 80-89: Phase act iterate | <80: ITERATION_EXHAUSTED |
| MVP-90-03 | SERP "갓깨비 키우기 공략" | 상위 30위 (M3) → 1페이지 (M6) | 50-100위: 콘텐츠 보강 | >100위: 톤 피벗 |
| MVP-90-04 | 쿠폰 페이지 PV (90일 누적) | 1,000+ | 500-999: 디시 시드 강화 | <500: M4.5 폐기 검토 |
| MVP-90-05 | 평균 체류시간 | 60초+ | 30-59초: UX 개선 | <30초: 첫 페이지 가치 재설계 |
| MVP-90-06 | 이탈률 | <70% | 70-80%: 카드 디자인 개선 | >80%: 콘텐츠 깊이 재평가 |

### 5.3 Sprint MVP 특화 KPI (Beachhead 침투 측정)

| ID | 항목 | 목표 | 근거 |
|----|------|------|------|
| MVP-BH-01 | 검객 메타 빌드 페이지 PV 비중 | 전체 PV의 20%+ | Beachhead P1 침투 시그널 |
| MVP-BH-02 | "검객" 키워드 SERP | 상위 50위 | 단일 직업 키워드 침투 |
| MVP-BH-03 | 디시 마이너 갤러리 referrer | 일평균 5+ | GTM Phase 1 시드 효과 |
| MVP-BH-04 | 직업 진단 완료율 | 70%+ (시작 대비) | UX 흐름 검증 |
| MVP-BH-05 | 쿠폰 클릭 복사율 | 표시된 쿠폰 대비 40%+ | 핵심 Job Story JS-MVP-1 |

---

## 6. Risk → Mitigation (Master Plan §6 매핑)

| Master Plan Risk ID | Sprint MVP 적용 시점 | 1차 완화 액션 (Phase 매핑) | Auto-Pause 트리거 가능성 |
|----|------|------|------|
| **R1** Joy Games 공식 가이드 | M3 이후 발생 가능 | UGC 차별점은 V1, MVP는 모바일 UX·신선도로 사전 방어 | 트래픽 -30%+ 감지 시 운영자 수동 |
| **R2** 인벤 갓깨비 도메인 신설 | M1-M9 선점 윈도우 | Branded Search Share 30%+ M6 진입 목표 | M3 SERP 30위 미달 시 사전 보강 |
| **R3** 게임 인기 6-12개월 라이프사이클 | M6 이후 본격 영향 | 데이터 스키마 게임-agnostic 설계(Sprint 0 검증) | DAU 30% 하락 감지 시 |
| **R4** Firebase 무료 한도 초과 | MVP는 영향 미미 (`coupons` + `events`만 활성) | ISR + 정적 캐싱으로 Firestore reads 최소화 | BUDGET_EXCEEDED ($5/월) |
| **R5** 비공식 사이트 법적 압박 | MVP F1.8 콘텐츠 정책 + 디스클레이머 | 공식 이미지 핫링크만 + 출처 명시 + 24h 삭제 약속 | Cease & Desist 수신 즉시 운영자 수동 |
| **R6** 1인 운영자 번아웃 | MVP 12주 Phase do (8주) 가장 위험 | 주 5-15h SLA 명문화 + AI 보조 비중 ↑ | PHASE_TIMEOUT (2배 초과) |
| **R7** 카카오프렌즈 IP 침해 | 콜라보 진령 페이지 한정 | 텍스트 설명 위주, 공식 핫링크만 | 카카오 게임즈 통지 수신 즉시 |

### 6.1 Sprint MVP에서 활성화되는 4 Auto-Pause Triggers

| Trigger | MVP 임계값 | 운영자 액션 |
|---------|---------|----------|
| QUALITY_GATE_FAIL | Lighthouse 모바일 <90 또는 5개 핵심 GA4 이벤트 1개 이상 미발화 | Phase act에서 iterate (최대 3회) |
| ITERATION_EXHAUSTED | Phase act iterate 3회 후에도 게이트 미통과 | 스코프 축소 (예: 9섹션 → 6섹션) 또는 톤 피벗 |
| BUDGET_EXCEEDED | 월 인프라 비용 > $5 | Firestore reads 분석 후 캐싱 강화 또는 Firebase Blaze 결정 (운영자 수동) |
| PHASE_TIMEOUT | Phase do 16주 초과 (예상 8주의 2배) | 운영자 시간 가용성 재평가, Sprint 일정 조정 |

---

## 7. User Stories / Job Stories

> PRD 04 §7.1, §7.2 재인용 + Sprint MVP 한정 5종.

### 7.1 User Stories (INVEST 적용)

**Story MVP-US-1: 첫 진입 직업 선택**
- As a 새로운 갓깨비 유저 (P1), I want to 단순 진단으로 직업(전사/검객/영매)을 선택하고 싶다, So that 되돌리기 어려운 결정에 확신을 갖는다.
- 수용 기준:
  - [ ] 홈에서 "직업 진단" CTA 30초 내 발견 (스크롤 1회 이내)
  - [ ] 3-5문항으로 직업 추천 결과 도달
  - [ ] 추천 결과 페이지에서 해당 직업 빌드/시너지 즉시 확인 가능
  - [ ] GA4 `class_diagnose_complete` 이벤트 발화

**Story MVP-US-2: 진령 티어 확인**
- As a 검투호 P1, I want to 메타 진령 11종의 티어를 한 페이지에서 보고 싶다, So that 999뽑기 우선순위를 정한다.
- 수용 기준:
  - [ ] 모바일에서 진령 11종 카드 리스트로 스크롤 가능 (320px-414px 깨짐 0)
  - [ ] 각 카드에 등급(SS/S/A/B), 추천 직업, 핵심 스킬 표시
  - [ ] 마지막 업데이트 일자 명시 (신뢰성)
  - [ ] GA4 `tier_view` + 카드 클릭 시 `jinryeong_card_click` 이벤트 발화

**Story MVP-US-3: 쿠폰 자동 만료 확인 (Beachhead 핵심)**
- As a P1, I want to 현재 유효한 쿠폰만 보고 싶다, So that 만료된 쿠폰을 입력하는 시간 낭비 없다.
- 수용 기준:
  - [ ] `/coupon` 페이지에서 유효/만료 쿠폰 분리 표시 (탭 또는 섹션)
  - [ ] 쿠폰 클릭 시 자동 복사 + Toast "복사됨" 안내 (2초 자동 dismiss)
  - [ ] 만료 일자가 있는 쿠폰은 D-day 카운트다운 표시 (예: "D-3", "오늘 만료")
  - [ ] 운영자가 12시간 SLA로 업데이트 (Firestore `coupons` 컬렉션)
  - [ ] GA4 `coupon_copy` 이벤트 발화 (파라미터: code, status)

**Story MVP-US-4: 검객 메타 빌드 검색 (Beachhead 핵심)**
- As a P1 검투호, I want to "검객 메타 빌드"를 검색해 한 페이지에서 진령 3개 + 스킬 + 제련 추천을 보고 싶다, So that 결투장 메타 따라잡기.
- 수용 기준:
  - [ ] `/builds/meta-swordsman` 페이지 존재
  - [ ] 추천 진령 3선택(홍길동/서해용왕/치우) + 시너지 설명
  - [ ] 코어/액티브/패시브 스킬 우선순위 표시
  - [ ] 제련 추천 (장비별 우선 강화 부위)
  - [ ] GA4 `meta_build_view` 이벤트 발화
  - [ ] 페이지가 SERP "검객 메타 빌드" 키워드 인덱싱

**Story MVP-US-5: 모바일 다크 무드**
- As a 모든 페르소나, I want to 모바일에서 한국 오컬트/도깨비 무드의 다크 디자인을 보고 싶다, So that 게임 분위기와 일관성 + 야간 가독성.
- 수용 기준:
  - [ ] 모바일 320px-414px 모두 깨짐 0건
  - [ ] 다크 베이스(#0a0612) + 골드(#e8b860) + 퍼플(#8b5cf6) + 시안(#38d9d9) 일관 적용
  - [ ] 시스템 다크모드와 매핑 (강제 다크 옵션 제공 → MVP는 다크만 + V1+ 라이트 검토)
  - [ ] WCAG AA 콘트라스트 (4.5:1 본문, 3:1 큰 텍스트)

### 7.2 Job Stories (Bob Moesta 6-Part)

**JS-MVP-1 (쿠폰)**:
> "When 게임 내 쿠폰 입력 화면을 열 때, I want to 한 페이지에서 유효 쿠폰만 빠르게 복사하고 싶다, So that 만료 쿠폰 입력 실패 → 짜증 → 게임 이탈을 막을 수 있다."

**JS-MVP-2 (메타)**:
> "When 메타 패치가 떴거나 결투장에서 메타 빌드 유저에게 패했을 때, I want to 24시간 안에 업데이트된 메타 빌드 정보를 모바일에서 확인하고 싶다, So that 결투장 자존감을 유지하고 게임을 계속할 동기가 생긴다."

**JS-MVP-3 (직업)**:
> "When 게임 시작 첫 30분 직업 선택 화면 직전, I want to 디시 노이즈 없이 검증된 직업 추천을 받고 싶다, So that 되돌리기 어려운 결정에 후회가 없다."

---

## 8. Pre-mortem (5종 실패 시나리오)

> "Sprint MVP 90일 후 이 Sprint가 실패했다. 왜 실패했나?" 가상 사후분석.

### 8.1 시나리오 A: Lighthouse <90 만성화 (확률 중)
- **증상**: 90일 차에도 Lighthouse 모바일 70-85대 정체. 폰트 로딩·이미지·JS 번들이 모두 영향.
- **근본 원인**: Noto Sans KR 전체 파일 로딩 + 진령 11종 이미지 미최적화 + Firebase SDK 클라이언트 번들 부담.
- **사전 방어**: Phase design에서 폰트 sub-setting 결정 + Next/Image WebP 변환 + Firebase는 서버 컴포넌트에서만 사용.
- **사후 대응**: Phase act iterate (최대 3회) → 실패 시 콘텐츠 분할 + Skeleton 로딩.

### 8.2 시나리오 B: 디시 시드 trolling으로 사이트 폐쇄 (확률 저-중)
- **증상**: 운영자가 디시 갓깨비 마이너 갤러리에 시드 글 게시 → 디씨러들이 "광고 글" 신고 → 갤러리 차단 → 트래픽 시드 1차 채널 무산.
- **근본 원인**: 시드 글이 가치 없이 단순 링크 공유만 한 경우, 갤러리 운영진이 광고로 판단.
- **사전 방어**: Phase plan에서 GTM 시드 가이드 작성("정보 글이 본론, 링크는 1줄 주석"). 디시 마이너 갤러리 운영진 사전 협의 (가능 시).
- **사후 대응**: 네이버 카페 5곳으로 시드 채널 분산. 카톡 단톡방 확보.

### 8.3 시나리오 C: 인벤이 갓깨비 페이지 신설 → SERP 즉시 1페이지 점유 (확률 중 30%)
- **증상**: M2-M3 사이 `pad.inven.co.kr` 패턴으로 갓깨비 도메인 신설 → 인벤 본 도메인 권위 활용 → SERP 즉시 1-3위 점유 → 우리 사이트 30위 진입 불가.
- **근본 원인**: 인벤 매출/MAU 임계 도달 시 자동 신설되는 패턴 (PRD 04 §4.3).
- **사전 방어**: Sprint MVP M1-M3 6주 안에 SEO 1차 인덱싱 완료 + Branded Search "갓깨비 가이드" 시드. 인벤이 만들지 못하는 모바일 UX 차별점 강조.
- **사후 대응**: Battlecard §4.3 메시지 "인벤이 만들지 못하는 빌드 시뮬레이터 V2 예고" 강조 + 직업 진단/메타 빌드 같은 인터랙티브 페이지 우선.

### 8.4 시나리오 D: 운영자 번아웃으로 콘텐츠 작성 정체 (확률 중 40-50%)
- **증상**: Phase do 8주 진행 중 운영자 본업 부담 가중 → 콘텐츠 작성 시간 부족 → MVP 출시 12주 → 16-20주 지연 → SEO 인덱싱 시점 놓침.
- **근본 원인**: 1인 운영의 본질적 리스크 + D2 70% 직접 작성 부담 + 본업 외 시간 가용성 변동.
- **사전 방어**: Phase plan에서 주 5-15h SLA 명문화 + AI 보조 비중 50% 이상 + 콘텐츠 30%는 BlueStacks/디시 가공 인용으로 부담 분산.
- **사후 대응**: Phase do 12주 초과 시 PHASE_TIMEOUT 발동 → 스코프 축소 (직업 진단/검객 메타만 우선, 나머지 페이지는 stub).

### 8.5 시나리오 E: GA4 이벤트 발화 실패로 데이터 누적 0 (확률 저-중)
- **증상**: Phase qa 단계에서 GA4 DebugView 확인 시 `coupon_copy`, `class_diagnose_complete` 이벤트 미발화 → MVP 90일 동안 데이터 누적 0 → Sprint 0 검증한 스키마가 실측 데이터 0건 상태로 V1 진입.
- **근본 원인**: GA4 측정 ID 환경변수 누락(tene 시크릿 미설정) 또는 GTM/CSP 충돌.
- **사전 방어**: Phase design에서 GA4 이벤트 코드 7-layer dataFlowIntegrity 점검 (URL → 클라이언트 → GA4 → BigQuery export). Phase qa에서 5개 핵심 이벤트 발화 확인을 졸업 게이트로 명시.
- **사후 대응**: 즉시 환경변수 점검 + DebugView 검증 + 90일 데이터 손실 수용.

---

## 9. 의존성 (Sprint 0 입력 + V1 출력)

### 9.1 Sprint 0에서 받는 입력

| 입력 | 활용 위치 |
|------|---------|
| `sprint-0-virtual-reports/schema-validation.md` | Sprint MVP `design.md` §데이터 스키마 직접 인용 |
| Sprint 0 PASS 확인 (`.bkit/state/sprints/...sprint-0.json`) | Sprint MVP Phase plan 진입 게이트 |
| 가상 리포트 3종 (V3 호환 필드 식별) | Firestore 6 컬렉션 활성/비활성 결정 |
| 운영자 회고 메모 | Phase plan 리스크 인식 |

### 9.2 Sprint MVP가 전달하는 출력 (V1 입력)

| 출력 | V1에서 활용 |
|------|---------|
| Next.js 16 App Router 코드베이스 | V1 Auth/UGC 페이지 추가 시 베이스 |
| Firestore `coupons` + `events` 활성 컬렉션 | V1에서 `users`, `builds`, `tier_votes` 추가 활성화 |
| GA4 12개 이벤트 정의(MVP 9개 활성 + V1 3개 신규) | V1 `build_create`, `build_like`, `signup` 추가 |
| 디자인 시스템 컴포넌트 14종 | V1 댓글/빌드 UI에 재사용 |
| 90일 KPI 측정 결과 | V1 진입/보류/폐기 결정 입력 |
| 도메인 + Vercel 인프라 | V1 그대로 사용 (도메인 변경 없음) |
| `content-policy.md` | V1 UGC 모더레이션 정책의 기반 |

### 9.3 Sprint MVP 졸업 조건 (Master Plan §5.3)

```
PASS (V1 진입): DAU 500+ AND Lighthouse ≥90 AND SERP 상위 30위 (M6 시점)
보류: DAU 200-500 (M6): MVP 6개월 연장 + 톤 피벗
폐기: DAU <200 (M6): 프로젝트 폐기 + 후속작 도메인 재활용
```

---

## 10. 부록: Sprint MVP 핵심 가설 (R.A.T. 후속)

Sprint 0에서 V3 스키마를 검증했다면, Sprint MVP에서 검증해야 할 차순위 가설은:

| 가설 ID | 가설 내용 | 검증 방법 | I (영향) | R (리스크) |
|---------|--------|----------|------|------|
| H-MVP-1 | "정적 가이드 + 모바일 UX + 0광고만으로 디시·BlueStacks 사용자를 30%+ 끌어올 수 있다" | M3 시점 DAU 100+ 도달 여부 | 5 | 4 |
| H-MVP-2 | "검객 Beachhead 침투가 영매·전사 확산보다 30% 빠르다" | 검객 메타 빌드 페이지 PV 비중 20%+ | 4 | 3 |
| H-MVP-3 | "D2 70/30 콘텐츠 정책으로 운영자 12주 안에 9섹션 완성 가능하다" | Phase do 12주 안에 9/9 페이지 작성 | 4 | 4 |
| H-MVP-4 | "Lighthouse 모바일 ≥90 + SERP 30위 진입이 V1 UGC 활성화 직전 시드 트래픽 충분 조건" | M6 DAU 500+ 달성 | 5 | 3 |

---

## 11. Attribution

본 PRD는 다음 입력을 합성한다:

| 입력 | 위치 | 가중치 |
|------|------|------|
| Sprint Master Plan | `docs/sprint/00-master-plan.md` §1~§10 | Primary |
| 통합 PRD | `docs/01-pm/04-prd.md` §7 (User/Job Stories), §12 (MVP 범위) | Primary |
| 운영자 결정 4건 | `docs/01-pm/05-decisions.md` D1/D2/D3/D4 | Override |
| Sprint 0 산출물 | `docs/sprint/01-sprint-0/prd.md`, `design.md` | Dependency |
| Project Brief (SSOT) | `docs/00-context/project-brief.md` | Reference |
| Research (페르소나/시장) | `docs/01-pm/03-research.md` | Reference |
| 원본 HTML | `source/original-guide.html` (1444 lines) | 이식 대상 |

**프레임워크**:
- bkit Sprint Management v2.1.13 (8-phase + Quality Gates M1-M10 + 4 Auto-Pause Triggers)
- pm-skills (MIT, Pawel Huryn) User Story INVEST + Job Story 6-Part
- Gary Klein Pre-mortem

---

> **Status**: Draft v1.0 — pending review.
> 다음 산출물: `plan.md` (8 Phase WBS) → `design.md` (Next.js 페이지 구조 + Firestore 스키마 + 디자인 시스템).
