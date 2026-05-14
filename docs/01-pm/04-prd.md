# 04. PRD — 갓깨비 키우기 비공식 팬 가이드

> Agent: `pm-prd` (통합 PRD)
> 작성일: 2026-05-14 · 입력: `01-discovery.md`, `02-strategy.md`, `03-research.md` · SSOT: `docs/00-context/project-brief.md`
> 작성자: kay@agentkay.it · 검토 상태: Draft v1 (운영자 의사결정 대기)
> 목표: MVP→V3 B2B 자산화의 4단계 진화 PRD를 완결시키고, sprint master-planner가 곧바로 sprint 분해 가능한 수준까지 구체화한다.

---

## Executive Summary (1페이지)

| 4-Perspective | 내용 |
|---------------|------|
| **Problem** | 한국 방치형 RPG 유저(67% 남성, 25-44세, 일평균 49분 플레이)는 갓깨비 키우기 정보(메타·쿠폰·빌드)를 디시·BlueStacks·나무위키에 분산 검색해야 하며 모바일 UX·신선도·신뢰성이 모두 부족. 게임사는 정성 데이터(이탈 사유·메타 인식)를 못 본다. |
| **Solution** | (MVP) Next.js 16 모바일 first 정적 가이드 + 쿠폰 자동 체커 + 한국 오컬트 무드 → (V1) UGC 댓글/빌드 공유 → (V2) 빌드 시뮬레이터 + 채용률 인사이트 차트 → (V3) 4399/Joy Games 한국 사업부에 B2B 데이터 패키지 라이선싱 또는 인수 |
| **Function UX Effect** | 30초 안에 신뢰 가능한 정보 도달. Lighthouse 모바일 ≥90. 광고 미니멀(MVP 0개, V1 1-2개). 다크+골드 한국 오컬트 무드. 빌드 시뮬레이터(V1+)는 진령 3개 시너지 시각화. |
| **Core Value** | "디시 노이즈와 BlueStacks 광고지옥을 모두 우회하는, 1인 운영자의 24h SLA 한국어 모바일 first 가이드. 누적 데이터 자산은 4399 그룹 후속작 전체에 재활용 가능한 B2B 패키지로 진화한다." |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 한국 방치형 RPG 시장 (₩9,300억/년, 16% 비중, 2024) 성장 + 갓깨비 키우기(다운로드 500K+, 4.8 평점)의 가이드 인프라 부재. 4399 그룹 후속작 잠재력 (버섯커 키우기 $270M 매출 전례). |
| **WHO** | Beachhead: 검객 메타 추종 25-40세 남성 소-중과금 유저 (페르소나 P1 "검투호"). Expansion: P2 "공유러", P3 "정보수집형". V3 고객: 4399 한국 사업부 / Joy Nice Games / Juxin Network 사업개발팀. |
| **RISK** | (Top) Joy Games 공식 가이드 출시, 인벤 갓깨비 페이지 신설, 게임 인기 6-12개월 라이프사이클, Firebase 무료 한도 초과, 1인 번아웃, 비공식 사이트 법적 압박 |
| **SUCCESS** | MVP(3M): DAU 100+, Lighthouse ≥90 / V1(6M): DAU 500+, 빌드 30+ / V2(12M): DAU 2K+, 빌드 1K+, 매출 ₩300K+/월 / V3(18M): DAU 5K+, 빌드 1만+, 4399 영업 미팅 1건+ |
| **SCOPE (MVP)** | In: 정적 SSOT 페이지(9섹션), 쿠폰 체커, 직업 진단(단순), 모바일+다크 디자인, GA4 + 데이터 스키마 사전 설계. Out: 댓글, 로그인, 빌드 시뮬레이터, 광고, 결제, 모바일 앱 |

---

## 1. Beachhead 시장 정의

### 1.1 Beachhead Segment 선정 (Geoffrey Moore "Crossing the Chasm" 기준)

**선택**: **검객 직업 + 메타 정석 추종 + 디시·네이버 카페 활용 25-40세 남성 소-중과금 유저**

### 1.2 4-criteria scoring

| 기준 | 점수 | 근거 |
|------|------|------|
| **Target Customer 명확성** | 9/10 | 직업/연령/플레이 패턴 명확, 디시 갤러리 직접 관찰 가능 |
| **Compelling Reason to Buy** | 9/10 | 쿠폰 만료·메타 변화 매주 발생, 정보 산재 페인 강함 |
| **Whole Product 가능 (1인)** | 8/10 | MVP 정적 페이지로 90% 가치 전달 가능, V1 시뮬레이터부터 1인 부담 가중 |
| **Reference Customer (네트워크 효과)** | 9/10 | 디시·카톡 단톡방에서 사이트 공유 → 동일 페르소나 내 빠른 확산 |
| **Total** | **35/40 (87%)** | Beachhead 적합 |

### 1.3 Beachhead 외 세그먼트는 명시적으로 Out of Scope (MVP)

- 영매·전사 직업 단독 유저 (콘텐츠 작성 시 검객 우선 + 영매·전사는 V1+)
- 무과금 라이트 유저 (체류시간 짧음 → 광고 매출 기여 낮음)
- 일본·영어권 유저 (V2 후반 검토)

---

## 2. ICP (Ideal Customer Profile)

### 2.1 ICP — Tier 1 (운영자 시간 우선순위 1순위)

| 항목 | 값 |
|------|-----|
| **세그먼트** | P1 검투호 (페르소나 03-research §2.2) |
| **연령** | 25-40세 |
| **성별** | 남성 (95%+) |
| **거주** | 수도권 + 광역시 |
| **소득** | 월 250-500만원 |
| **과금** | 월 ₩20K-100K (소-중과금) |
| **플레이 패턴** | 평일 30-60분 + 주말 1-2시간, 직업 = 검객 |
| **정보 채널** | 디시 갓깨비 마이너 갤러리 (주 5+) / 카톡 친구 / 가끔 BlueStacks |
| **결정 트리거** | 메타 패치 발생 / 999뽑기 분배 / 쿠폰 발급 / 신규 진령 출시 |
| **반응 시점** | 메타 변화 → 24-48시간 내 검색 |
| **이탈 트리거** | 페이지 로딩 3초+ / 광고 5개+ / 정보 부정확 / 디자인 조잡 |

### 2.2 ICP — Tier 2 (V1+ 확장)

| 세그먼트 | 활성화 시점 | 행동 |
|---------|-----------|------|
| P2 공유러 | V1 (UGC 댓글/빌드 공유) | 빌드 작성·좋아요 받음 |
| P3 정보수집형 | V2 (시즌패스 계산기, 채용률 차트) | 깊은 데이터 분석 |
| B2B 고객 (4399 한국 사업부) | V3 후반 | 분기 리포트 구매 → 라이선스 |

---

## 3. GTM (Go-To-Market) Strategy

### 3.1 GTM 단계 (3-phase, 12개월)

#### Phase 1 (M1-M3): Seed 침투
- **채널 1**: 디시 갓깨비 마이너 갤러리 (up999) — 운영자 본인 계정으로 가치 있는 글 직접 작성 + 우리 사이트 링크 자연스럽게 포함
- **채널 2**: 네이버 갓깨비 카페 5곳 검색 + 가치 글 시드
- **채널 3**: 카톡 갓깨비 단톡방 검색 (검투호 단톡 가입)
- **목표**: 사이트 노출 1,000 / DAU 50-100

#### Phase 2 (M3-M6): SEO 클러스터 빌딩
- **롱테일 키워드 50개** (예시):
  - 갓깨비 키우기 공략, 갓깨비 진령 티어, 갓깨비 쿠폰, 갓깨비 직업 추천
  - 갓깨비 검객 빌드, 갓깨비 홍길동 추천, 갓깨비 서해용왕 시너지
  - 갓깨비 999뽑기 분배, 갓깨비 스킬 우선순위, 갓깨비 제련 계산
  - 갓깨비 결투장 빌드, 갓깨비 비경 클리어, 갓깨비 진령전투
- Google Search Console + Ahrefs/SEMrush 무료 트라이얼로 키워드 추적
- **목표**: Google "갓깨비 키우기 공략" 1페이지 진입, DAU 300-500

#### Phase 3 (M6-M12): Branded Search + UGC 활성화
- "갓깨비 가이드" 자체 브랜드명 검색 트래픽 확보
- V1 진입: 댓글/빌드 공유 → 유저가 자발적으로 카톡/디시에 우리 사이트 공유
- **목표**: Branded Search Share 40%+, DAU 1,000-2,000, 광고 매출 ₩100K+/월

### 3.2 GTM 채널별 비용/효과

| 채널 | 비용 | 운영자 시간 | 기대 효과 (12M) |
|------|------|-----------|----------------|
| SEO (콘텐츠 + 메타데이터) | ₩0 | 주 3-5h | 트래픽의 70-80% |
| 디시 시드 | ₩0 | 주 1-2h | 첫 6개월 트래픽의 30% |
| 네이버 카페 | ₩0 | 주 0.5h | 트래픽의 5-10% |
| 카톡 단톡방 시드 | ₩0 | 주 0.5h | 초기 시드 100-300명 |
| 유튜브 (V1+) | ₩0 (자체 제작) | 주 2-3h | V1 진입 후 30% 추가 |
| 광고 (제외) | ₩0 (MVP-V1 미사용) | - | - |

---

## 4. Battlecard

### 4.1 vs BlueStacks 갓깨비 가이드 시리즈

| 항목 | 우리 | BlueStacks |
|------|------|-----------|
| 광고 슬롯 | 0개 (MVP) / 1-2개 (V1) | **5-7개** |
| 모바일 최적화 | Lighthouse ≥90 | Lighthouse ~60-70 (광고 영향) |
| 업데이트 SLA | 24h (메타) / 12h (쿠폰) | 7일+ |
| 톤매너 | 한국 오컬트/도깨비 무드 | 영문 번역체 |
| 빌드 시뮬레이터 | V1+ ✅ | ❌ |
| 채용률 차트 | V2+ ✅ | ❌ |
| 에뮬레이터 광고 강제 | ❌ | ✅ (제품 광고) |

**우리 메시지**: "BlueStacks의 광고지옥 없이, 모바일에서 30초 안에 검객 메타 + 쿠폰 + 진령 정보."

### 4.2 vs 디시 마이너 갤러리 (up999)

| 항목 | 우리 | 디시 |
|------|------|------|
| 정리/검색 | ✅ SEO + 카테고리 | ❌ 시간순 흘러내림 |
| 트롤·욕설 | ❌ (모더레이션) | ✅ 빈번 |
| 실시간 메타 변화 | 24h SLA | <12h (유저 작성) |
| 빌드 시뮬레이터 | V1+ | ❌ |
| 익명 자유 게시 | 회원가입 시 (V1+) | ✅ |
| 정보 신뢰성 | 운영자 검증 | 유저별 편차 큼 |

**우리 메시지**: "디시 노이즈를 가공·정리한 신뢰 가능한 가이드. 디시는 흘러가지만 우리는 누적된다."

### 4.3 vs 인벤 (잠재 위협)

| 항목 | 우리 | 인벤 (현재) | 인벤 (가상 갓깨비 페이지) |
|------|------|----------|-------------------------|
| 갓깨비 전용 페이지 | ✅ | ❌ | ✅ |
| 일 PV | (성장 중) | 1억-1.2억 (전체) | (도메인 부여 시 즉시 수만 PV) |
| 모바일 UX | Lighthouse ≥90 | 보통 | 보통 |
| 빌드 시뮬레이터 | V1+ | ❌ | (구축 어려움, 인벤 일반 게시판 한계) |
| 인터랙티브 차트 | V2+ | ❌ | (외주 비용 발생) |

**우리 메시지** (인벤 진입 시): "인벤이 만들지 못하는 빌드 시뮬레이터·채용률 차트 + 모바일 first."

### 4.4 vs 나무위키 r4판

| 항목 | 우리 | 나무위키 |
|------|------|---------|
| 모바일 가독성 | 카드형 + 시각화 | 텍스트 wall |
| 업데이트 책임 | 운영자 단일 책임 | 편집자 다수 분산 |
| 인터랙티브 | ✅ V1+ | ❌ |
| 백과사전 깊이 | (보충) | ✅ |

---

## 5. Growth Loops

### 5.1 Loop A: SEO Compound Loop (Always-On)

```
양질 콘텐츠 작성 → Google 인덱싱 → 검색 트래픽
        ^                                  |
        |                                  v
   다른 사이트 백링크 (디시·블로그) ←──── 가치 인식 → 공유
```

**측정**: Google Search Console (검색 노출/클릭), Branded Search Share

### 5.2 Loop B: UGC Network Loop (V1+)

```
유저 빌드 공유 → 다른 유저 좋아요/댓글 → 작성자 자존감 충족
        ^                                  |
        |                                  v
   더 많은 빌드 작성 ←─── 사이트 가치 ↑ ← 신규 유저 유입
```

**측정**: 빌드 수, 빌드당 평균 좋아요, 빌드 작성자 회귀율

### 5.3 Loop C: Coupon Freshness Viral Loop (MVP-V1)

```
유저가 쿠폰 입력 → 만료/유효 자동 표시 → 신뢰 ↑
        ^                                |
        |                                v
   카톡/디시 공유 (단톡방 메타 추종) ← "이 사이트 빠르네"
```

**측정**: 쿠폰 페이지 PV/share, Direct/Referral 비율

### 5.4 Loop D: Data Compound Loop (V2-V3 직결, B2B 자산화 백본)

```
유저 빌드 로그 → 진령 채용률 차트 → 인사이트 가치 ↑
        ^                                |
        |                                v
   더 많은 빌드 입력 ←─── 사이트 정보 가치 ↑ → V3 B2B 패키지 가치 ↑
```

**측정**: 빌드 로그 수, 데이터 다양성 지수(직업×진령×레벨 조합 커버리지)

---

## 6. Pre-mortem (Top 4 리스크 + 완화)

> **방법**: "1년 뒤 이 프로젝트가 실패했다. 왜 실패했나?" 가상 사후분석.

### Risk-1: 🔴 Joy Nice Games / 4399 가 공식 가이드 사이트 출시
- **확률**: 중 (30-40%) — 버섯커도 공식 가이드 부재로 패턴 동일
- **영향**: 트래픽 -30~50% (단, 공식은 자기 메타 비판 불가 → 우리 차별점 유지)
- **선행 신호**: 공식 카페/페이지 신설 발표
- **완화**: 
  - MVP부터 UGC 커뮤니티(V1) 차별점 빠르게 구축
  - 공식 사이트와 다른 인사이트 차트(V2) — 공식이 못 보는 정성 데이터
  - V3에서 오히려 공식이 우리 데이터를 사가는 "협업" 시나리오로 피봇

### Risk-2: 🔴 인벤이 갓깨비 전용 도메인 신설 (pad.inven.co.kr 패턴)
- **확률**: 중 (30%) — 매출/MAU 임계 도달 시 자동 발생
- **영향**: SEO 1페이지 경쟁 격화, 트래픽 -20~40%
- **선행 신호**: 인벤 게이머 토론장 갓깨비 글 폭증, 인벤 신규 도메인 트래픽 패턴
- **완화**:
  - **선점 윈도우 6-12개월** 안에 Branded Search Share 30%+ 확보
  - 빌드 시뮬레이터·채용률 차트 같은 인벤이 만들지 못하는 인터랙티브 차별점
  - 인벤과 보완관계 (예: 인벤이 뉴스/일반 게시판, 우리는 가이드/시뮬레이터)

### Risk-3: 🟡 게임 인기 6-12개월 라이프사이클 (방치형 일반 특성)
- **확률**: 높음 (60%+) — 방치형 RPG 평균 매출 곡선
- **영향**: 가이드 사이트 트래픽 동반 하락 -50~80%
- **선행 신호**: Sensor Tower 게임 매출 순위 30위 밖, 디시 갤러리 게시글 -50%
- **완화**:
  - **데이터 스키마를 게임-agnostic하게 설계** → 후속작(갓깨비 2, 또 다른 4399 키우기) 동일 플랫폼 재활용
  - V3 B2B 자산화는 게임 인기 하락 직전이 오히려 협상 가치 최대 시점 (게임사 위기감)

### Risk-4: 🟡 Firebase 무료 한도 초과 → 비용 충격
- **확률**: 중 (40% — DAU 2,000+ 시점)
- **영향**: 월 ₩50K-200K 비용 발생, 운영자 부담 ↑
- **선행 신호**: Firestore reads 일 40K 도달, Auth signup 50/day 도달
- **완화**:
  - ISR + 정적 캐싱으로 Firestore reads 최소화
  - 댓글은 Giscus (GitHub Discussions) 사용 → Firestore 비용 0
  - V2 진입 시 광고 매출로 Firebase Blaze 비용 ≤ 매출 ¼ 유지

### Risk-5: 🟡 비공식 사이트 법적 압박 (cease & desist)
- **확률**: 낮음 (10-15%)
- **영향**: 사이트 폐쇄, 운영자 책임
- **완화**:
  - 홈/푸터에 "비공식 팬 가이드, Joy Nice Games / Juxin Network와 무관" 명시
  - 공식 이미지는 Google Play CDN 핫링크만 사용 (미러링/변형 X)
  - V2 진입 시 게임사에 사전 소개 메일 발송 (협력 관계 시작)

### Risk-6: 🟡 1인 운영자 번아웃 / 본업 부담 증가
- **확률**: 중 (40-50%) — 1인 운영의 본질적 리스크
- **영향**: 업데이트 지연 → 신뢰 하락 → DAU 하락
- **완화**:
  - V1에서 UGC 활성화 → 운영자 업데이트 부담 분산
  - V2에서 LLM 자동 요약 (디시 RSS → 큐레이션)
  - 운영 시간 SLA 명문화 (주 5-10시간 한도)

### Risk-7: 🟢 카카오프렌즈 IP 콜라보 권리 침해
- **확률**: 낮음 (5%)
- **영향**: 콜라보 진령 페이지만 영향
- **완화**: 콜라보 진령은 텍스트 설명 위주, 이미지는 게임 공식 스크린샷 핫링크만

---

## 7. User Stories + Job Stories (MVP/V1/V2/V3)

### 7.1 MVP User Stories (INVEST 적용)

**Story 1: 첫 진입 직업 선택**
- As a 새로운 갓깨비 유저 (P1), I want to 단순 진단으로 직업(전사/검객/영매)을 선택하고 싶다, So that 되돌리기 어려운 결정에 확신을 갖는다.
- 수용 기준:
  - [ ] 홈에서 "직업 진단" CTA 30초 내 발견
  - [ ] 3-5문항으로 직업 추천 결과 도달
  - [ ] 추천 결과 페이지에서 해당 직업 빌드/시너지 즉시 확인 가능
- INVEST 체크: ✅ Independent ✅ Negotiable ✅ Valuable ✅ Estimable ✅ Small ✅ Testable

**Story 2: 진령 티어 확인**
- As a 검투호 P1, I want to 메타 진령 11종의 티어를 한 페이지에서 보고 싶다, So that 뽑기 우선순위를 정한다.
- 수용 기준:
  - [ ] 모바일에서 진령 11종 카드 리스트로 스크롤 가능
  - [ ] 각 카드에 등급(SS/S/A/B), 추천 직업, 핵심 스킬 표시
  - [ ] 마지막 업데이트 일자 명시 (신뢰성)
  - [ ] Lighthouse 모바일 ≥90

**Story 3: 쿠폰 자동 만료 확인**
- As a P1, I want to 현재 유효한 쿠폰만 보고 싶다, So that 만료된 쿠폰을 입력하는 시간 낭비 없다.
- 수용 기준:
  - [ ] /coupon 페이지에서 유효/만료 쿠폰 분리 표시
  - [ ] 쿠폰 클릭 시 자동 복사 + Toast "복사됨" 안내
  - [ ] 만료 일자가 있는 쿠폰은 D-day 카운트다운 표시
  - [ ] 운영자가 12시간 SLA로 업데이트

**Story 4: 검객 메타 빌드 검색**
- As a P1, I want to "검객 메타 빌드"를 검색해 한 페이지에서 진령 3개 + 스킬 + 제련 추천을 보고 싶다, So that 결투장 메타 따라잡기.
- 수용 기준:
  - [ ] /class/swordsman/meta 페이지 존재
  - [ ] 추천 진령 3선택(홍길동/서해용왕/치우) + 시너지 설명
  - [ ] 코어/액티브/패시브 스킬 우선순위 표시
  - [ ] 제련 추천 (장비별 우선 강화 부위)

**Story 5: 모바일 다크 무드**
- As a 모든 페르소나, I want to 모바일에서 한국 오컬트/도깨비 무드의 다크 디자인을 보고 싶다, So that 게임 분위기와 일관성 + 야간 가독성.
- 수용 기준:
  - [ ] 모바일 320px-414px 모두 깨짐 없음
  - [ ] 다크 베이스 + 골드 액센트 + 퍼플 + 시안 컬러 일관 적용
  - [ ] 시스템 다크모드와 매핑 (강제 다크 옵션도 제공)

### 7.2 MVP Job Stories (Bob Moesta 6-Part)

**JS-MVP-1 (쿠폰)**:
> "When 게임 내 쿠폰 입력 화면을 열 때, I want to 한 페이지에서 유효 쿠폰만 빠르게 복사하고 싶다, So that 만료 쿠폰 입력 실패 → 짜증 → 게임 이탈을 막을 수 있다."

**JS-MVP-2 (메타)**:
> "When 메타 패치가 떴거나 결투장에서 메타 빌드 유저에게 패했을 때, I want to 24시간 안에 업데이트된 메타 빌드 정보를 모바일에서 확인하고 싶다, So that 결투장 자존감을 유지하고 게임을 계속할 동기가 생긴다."

**JS-MVP-3 (직업)**:
> "When 게임 시작 첫 30분 직업 선택 화면 직전, I want to 디시 노이즈 없이 검증된 직업 추천을 받고 싶다, So that 되돌리기 어려운 결정에 후회가 없다."

### 7.3 V1 User Stories

**Story V1-1: 빌드 공유**
- As a P2 공유러, I want to 내가 만든 검객+홍길동/서해용왕/치우 빌드를 표준 포맷으로 공유하고 싶다, So that 디시처럼 묻히지 않고 자료로 남는다.
- 수용 기준:
  - [ ] 빌드 작성 폼: 직업 + 진령 3개 + 스킬 + 제련 + 코멘트
  - [ ] 빌드 페이지 URL 영구 보존
  - [ ] 좋아요/북마크 가능
  - [ ] 모더레이션 도구 (운영자)

**Story V1-2: 댓글**
- As a P1·P2, I want to 빌드/가이드 페이지에서 질문/감사를 남기고 싶다, So that 트롤 없는 토론 가능.
- 수용 기준:
  - [ ] Giscus (GitHub Discussions) 또는 Firestore 댓글
  - [ ] 신고 기능
  - [ ] 자동 차단 (욕설 필터)

### 7.4 V2 User Stories

**Story V2-1: 빌드 시뮬레이터**
- As a P1·P3, I want to 진령 3개를 클릭으로 선택하면 시너지를 시각화로 보고 싶다, So that 텍스트 가이드보다 직관적이다.

**Story V2-2: 진령 채용률 차트**
- As a P3, I want to 신규 진령 출시 48시간 채용률을 차트로 보고 싶다, So that "써볼만한가?" 빠른 판단.

**Story V2-3: 시즌패스 가성비 계산기**
- As a P3, I want to 시즌패스 가격 + 보상을 입력하면 ROI를 보고 싶다, So that 과금 의사결정.

### 7.5 V3 Job Stories (B2B)

**JS-V3-1 (4399 한국 사업부)**:
> "When 갓깨비 키우기 분기 결산 직전 또는 DAU 30% 하락 신호 감지 시, I want to 외부 정성 데이터 (메타 인식, 이탈 사유, 빌드 채용률, 결투장 봇 의심)를 한 패키지로 받고 싶다, So that 후속 패치/콜라보/후속작 의사결정 근거가 된다."

**JS-V3-2 (4399 본사)**:
> "When 후속작(갓깨비 2 또는 다른 키우기 시리즈) 출시 6개월 전, I want to 동일한 가이드/인사이트 플랫폼을 whitelabel로 라이선스하고 싶다, So that 신작 출시 첫날부터 가이드 인프라가 준비돼 유저 LTV 향상."

---

## 8. Test Scenarios (수용 기준)

### 8.1 MVP 수용 기준 (정량)

| ID | 항목 | 측정 방법 | 목표 |
|----|------|----------|------|
| AC-01 | 페이지 로딩 시간 | Lighthouse 모바일 3G | < 2초 (FCP) |
| AC-02 | Lighthouse 점수 (모바일) | Lighthouse CI | ≥ 90 |
| AC-03 | SEO 점수 | Lighthouse SEO | ≥ 95 |
| AC-04 | 모바일 가독성 | 모바일 320px-414px 깨짐 0 | 0건 |
| AC-05 | 콘텐츠 9섹션 모두 포함 | 페이지 존재 검증 | 9/9 |
| AC-06 | 쿠폰 페이지 유효/만료 분리 | UI 검증 | ✅ |
| AC-07 | 다크 모드 일관성 | 시각 검증 | ✅ |
| AC-08 | 광고 슬롯 | 페이지 검증 | 0개 |
| AC-09 | 외부 링크 작동 | E2E 테스트 | 100% |
| AC-10 | GA4 이벤트 발화 | 콘솔 확인 | 5개 핵심 이벤트 |

### 8.2 MVP 검증 시나리오 (E2E)

**S-01: 첫 진입 → 쿠폰 페이지 → 복사 (P1 검투호)**
1. 모바일 Chrome으로 우리 사이트 진입
2. 홈에서 "쿠폰 확인" CTA 30초 내 발견
3. /coupon 클릭 → 유효 쿠폰 5개 + 만료 쿠폰 3개 확인
4. 첫 번째 유효 쿠폰 클릭 → Toast "복사됨" 확인
5. (검증) 클립보드에 코드 복사 확인

**S-02: 첫 진입 → 직업 진단 → 검객 추천 (P1)**
1. 홈에서 "직업 진단" CTA 클릭
2. 3-5문항 답변
3. 결과 페이지 도달 → "검객 추천" + 빌드 링크 표시
4. (검증) 페이지 로딩 2초 이내

**S-03: 진령 티어 페이지 (P3 정보수집형)**
1. /jinryeong 페이지 진입
2. 11종 진령 카드 스크롤
3. 각 카드 클릭 → 상세 페이지 진입
4. (검증) 마지막 업데이트 일자 명시 + Lighthouse ≥ 90

### 8.3 V1 수용 기준

| ID | 항목 | 목표 |
|----|------|------|
| V1-AC-01 | 댓글 작동 | Giscus 또는 Firestore |
| V1-AC-02 | 빌드 공유 표준 포맷 | 직업+진령3+스킬+제련 필드 |
| V1-AC-03 | 빌드 영구 URL | /build/{id} 형식 |
| V1-AC-04 | 좋아요/북마크 | 로그인 후 가능 |
| V1-AC-05 | 광고 슬롯 | 1-2개 (모바일 가독성 유지) |
| V1-AC-06 | 빌드 수 (30일) | 30+ |
| V1-AC-07 | DAU | 500+ |

### 8.4 V2 수용 기준

| ID | 항목 | 목표 |
|----|------|------|
| V2-AC-01 | 빌드 시뮬레이터 작동 | 진령 3선택 → 시너지 시각화 |
| V2-AC-02 | 채용률 차트 | 11종 진령 주간 채용률 그래프 |
| V2-AC-03 | 시즌패스 계산기 | 가격/보상 입력 → ROI 출력 |
| V2-AC-04 | 프리미엄 구독 | ₩2,900/월 결제 작동 |
| V2-AC-05 | DAU | 2,000+ |
| V2-AC-06 | 빌드 누적 | 1,000+ |
| V2-AC-07 | 매출 | ₩300K+/월 |

---

## 9. Stakeholder Map

| Stakeholder | 역할 | 관심사 | 영향력 | 우리 대응 |
|------------|------|-------|--------|----------|
| **kay (운영자)** | Owner | 4단계 진화 달성, ROI, 시간 효율 | 절대 | (본 PRD) |
| **유저 P1 검투호** | Primary Customer | 메타 정보, 쿠폰, 신선도 | 직접 | MVP 핵심 페이지 우선순위 |
| **유저 P2 공유러** | UGC Contributor | 빌드 공유, 좋아요 | 직접 (V1+) | V1 댓글/빌드 공유 |
| **유저 P3 정보수집형** | Premium Candidate | 깊은 데이터, 시즌패스 분석 | 매출 (V2+) | V2 시뮬레이터/차트 |
| **Joy Nice Games** | Game Publisher | 게임 흥행, 유저 LTV | 매우 큼 (Risk + Opportunity) | 디스클레이머 + V2 후반 소개 메일 |
| **4399 Network (모회사)** | Parent Company | 그룹 전체 게임 ROI | 매우 큼 (V3 영업) | V3 영업 핵심 타겟 |
| **Juxin Network** | Publisher (Korea) | 한국 시장 KPI | 큼 | 4399 본사와 동일 그룹 영업 |
| **Vercel** | Infra Provider | 무료 한도 준수 | 중간 | Hobby 한도 모니터링 |
| **Firebase / Google** | Infra + Auth + Analytics | 무료 한도 준수, GA4 정책 준수 | 중간 | Spark Plan 한도, 캐싱 |
| **광고주 (V1+)** | Revenue Source | 노출 효율, CTR | V1+ 중간 | AdSense, 직접 광고 거부 (게임 광고만) |
| **카카오 게임즈** | 콜라보 파트너 | IP 보호 (카카오프렌즈) | 중간 (Risk) | 콜라보 진령 페이지 신중 |
| **GameWith / Game8 / 인벤** | Competitor | 시장 점유율 | 중-큼 | Battlecard (§4) |

---

## 10. B2B 자산화 로드맵 (V3 Endgame)

### 10.1 데이터 자산 누적 타임라인

```
M1-M3 (MVP)
  └─ 페이지 funnel + 쿠폰 클릭 이벤트 로깅 시작
  └─ 데이터 스키마 사전 설계 (V3 호환)

M4-M9 (V1)
  └─ User Build 로그 누적 (목표 300건)
  └─ Tier Vote (좋아요/북마크) 누적
  └─ 페인포인트 NLP (댓글 분석) 시드

M10-M15 (V2)
  └─ Build 누적 1,000-10,000건
  └─ 진령 채용률 주간 차트 자동 생성
  └─ 매주 디시 핫토픽 큐레이션 → 토픽 클러스터
  └─ "가상 분기 리포트 Q1" 운영자가 직접 작성 → V3 영업 시드

M16-M24 (V3)
  └─ 4399 한국 사업부 콜드 메일 발송 (LinkedIn 사업개발 담당자 50건)
  └─ Demo → Pilot ₩5M-10M
  └─ 본 계약: B2B SaaS ₩30M-100M/년 또는 인수 ₩300M-1.5B
```

### 10.2 V3 가상 리포트 3종 (D5 검증 — 데이터 스키마 역방향 도출용)

#### 리포트 1: 분기 메타 인사이트
> "갓깨비 키우기 2026 Q1 분기 리포트: 진령 채용률 변화 / 메타 빌드 TOP 10 / 결투장 봇 의심 패턴 / 콜라보 ROI"
- 분량: 80페이지 PDF + 인터랙티브 대시보드 액세스
- 가격: ₩5M-15M / 회

#### 리포트 2: 이탈 시그널 알람 SaaS
> "주간 디시 핫토픽 + 페인포인트 NLP + 빌드 다양성 지수 → 이탈 위험 알람"
- 형식: 슬랙/이메일 주간 알람 + 웹 대시보드
- 가격: ₩3M-10M / 월

#### 리포트 3: 후속작 사전 리서치
> "갓깨비 2(가상) 출시 6개월 전 리서치: 갓깨비 1 유저 잔존/이탈 패턴 / 후속작 기대도 / 동양 IP 키우기 시장 경쟁"
- 분량: 50페이지 + Excel raw data
- 가격: ₩10M-30M / 회

### 10.3 V3 패키지 5종 + 가격대 (재정리)

| 패키지 | 가격 (가설) | 대상 | 트리거 |
|--------|----------|------|--------|
| A. 분기 리포트 1회성 | ₩5M-15M | PM/마케팅 | 분기 결산 직전 |
| B. SaaS 메타 인사이트 구독 | ₩3M-10M/월 | 사업개발 | DAU 30% 하락 등 |
| C. API 라이선스 (raw data) | ₩30M-100M/년 | 본사 데이터팀 | 후속작 사전 리서치 |
| D. Whitelabel 대시보드 (그룹 게임 전체 재활용) | ₩100M-300M/년 | 4399 본사 | 후속작 출시 6개월 전 |
| E. 완전 인수 (M&A) | ₩300M-1.5B (일시) | 4399 또는 카카오 게임즈 | 트래픽 MAU 5K+ 빌드 1만 도달 |

### 10.4 V3 영업 4단계 Funnel (Strategy §4.4 재요약)

```
Stage 1 — Cold Outreach (M16-M18)
  타겟: 4399 한국 사업부 BD, Joy Games 마케팅, Juxin Network 임원
  도구: LinkedIn 검색 + 이메일 50건
  첨부: "갓깨비 키우기 분기 메타 인사이트 1page 샘플" PDF
  목표 응답률: 10%+

Stage 2 — Demo (M18-M20)
  형식: Google Meet 15분 + 실시간 대시보드 화면 공유
  목표 Demo → Pilot 전환율: 30%+

Stage 3 — Pilot (M20-M24)
  Paid Pilot ₩5M-10M / 1분기
  운영자가 직접 PM/사업개발 담당자와 협업

Stage 4 — License / Acquire
  연 라이선스 ₩30M-100M 또는 인수 ₩300M-1.5B
  법무 검토 + 데이터 이관 + 운영 권한 양도
```

### 10.5 가격 앵커링 근거 (가설 — 검증 필요)

- Game8 (日, 1인→2015 Gunosy 인수): 추정 ₩500M-2B
- Sensor Tower Enterprise (글로벌): $20K-100K/년
- Mobile Index INSIGHT (한국): ₩300K-1M/월
- 우리는 위 비교군의 30-50% 가격 책정 (입찰 우위)

---

## 11. 데이터 스키마 명세 (MVP 시작, V3 직결)

> **원칙**: MVP 첫 줄 코드부터 V3 B2B 패키지에 활용 가능한 스키마로 누적. 추가 마이그레이션 비용 ₩0 목표.

### 11.1 Firestore 컬렉션 설계

#### `users` (Firebase Auth uid 매핑)
```typescript
interface UserDoc {
  uid: string;              // Firebase Auth uid
  display_name?: string;    // V1+
  email_hash?: string;      // PIPA 대응 (해시만)
  created_at: Timestamp;
  last_login_at: Timestamp;
  signed_up_via: 'google' | 'kakao' | 'anonymous';
  consent: { 
    analytics: boolean; 
    profile_public: boolean;
    consented_at: Timestamp;
  };
}
```

#### `builds` (V1+ UGC)
```typescript
interface BuildDoc {
  id: string;
  uid: string;               // 작성자
  class: 'warrior' | 'swordsman' | 'medium';
  jinryeong_3: string[];     // 진령 ID 3개
  skill_set: { core: string; active: string; passive: string };
  equipment_grade: number;   // 0-10
  description?: string;
  is_public: boolean;
  likes_count: number;       // denormalized counter
  bookmarks_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  source: 'self_report' | 'screenshot' | 'manual_admin';
}
```

#### `tier_votes` (V1+)
```typescript
interface TierVoteDoc {
  id: string;                // uid + jinryeong_id + week (unique)
  uid: string;
  jinryeong_id: string;
  vote: 'S' | 'A' | 'B' | 'C' | 'D';
  voter_class?: string;
  voter_level_estimate?: number;
  week: string;              // 'YYYY-Wnn'
  created_at: Timestamp;
}
```

#### `coupons` (MVP 시작 — 운영자 입력)
```typescript
interface CouponDoc {
  id: string;
  code: string;
  description: string;
  reward: string;
  status: 'valid' | 'expired' | 'unknown';
  starts_at: Timestamp;
  expires_at?: Timestamp;
  reported_invalid_count: number;  // V1+ 유저 신고
  last_verified_at: Timestamp;
  source: 'official' | 'community' | 'admin';
}
```

#### `events` (모든 GA4 이벤트 백업 + V3 분석용)
```typescript
interface EventDoc {
  id: string;
  event_name: string;        // 'page_view' | 'coupon_copy' | 'build_create' | ...
  uid?: string;              // anonymous 가능
  session_id: string;
  page: string;
  payload: Record<string, any>;
  timestamp: Timestamp;
  user_agent_hash: string;   // PIPA 대응
  referrer_source?: string;  // 'organic' | 'dc' | 'naver_cafe' | ...
}
```

#### `pain_topics` (V2+ NLP 추출, 댓글 기반)
```typescript
interface PainTopicDoc {
  id: string;
  topic: string;
  sentiment: -1 | 0 | 1;
  frequency: number;
  week: string;              // 'YYYY-Wnn'
  source: 'comment' | 'dc_curation';
  sample_quotes: string[];
}
```

### 11.2 GA4 이벤트 명세 (MVP 첫날부터 발화)

| 이벤트명 | 발화 시점 | 파라미터 |
|---------|----------|---------|
| `page_view` | 모든 페이지 진입 | page, referrer |
| `coupon_copy` | 쿠폰 클릭 시 | code, status (valid/expired) |
| `class_diagnose_complete` | 직업 진단 완료 | result_class |
| `jinryeong_card_click` | 진령 카드 클릭 | jinryeong_id |
| `tier_view` | 진령 티어 페이지 진입 | (none) |
| `meta_build_view` | 메타 빌드 페이지 진입 | class, build_id |
| `external_link_click` | 외부 링크 클릭 | url, source |
| `scroll_depth_75` | 페이지 75% 스크롤 | page |
| `dwell_60` | 페이지 60초 체류 | page |
| `build_create` (V1) | 빌드 작성 완료 | build_id, class |
| `build_like` (V1) | 빌드 좋아요 | build_id |
| `signup` (V1) | 회원가입 | method |

### 11.3 BigQuery Export (V2+ 분석용)

- Firestore → BigQuery 일간 export (Firebase Extensions)
- 비용: Firestore reads 한도 내 무료
- 분석 쿼리 예시 (V3 가상 리포트용):
  ```sql
  -- 진령 채용률 (주간)
  SELECT jinryeong_id, COUNT(*) / total AS adoption_rate, week
  FROM builds_unnested
  GROUP BY jinryeong_id, week
  ORDER BY week DESC, adoption_rate DESC;
  ```

### 11.4 PIPA (개인정보보호법) 대응

- Firebase Auth 사용 시 이메일은 해시만 저장
- 동의 절차: 회원가입 시 분석/공개 프로필 동의 체크박스
- 데이터 삭제 요청 처리: `/delete-account` 페이지 (V1+)

---

## 12. MVP 범위 정의 (In Scope / Out of Scope)

### 12.1 ✅ MVP In Scope

1. **콘텐츠 9섹션** (원본 HTML 이식 + 정교화)
   - 개요 / 직업 / 진령 / 스킬·제련 / 던전·PvP / 과금 전략 / 이벤트·쿠폰 / 실전 팁 / 출처
2. **모바일 first 반응형** (320px-414px 모두 최적화)
3. **다크 + 골드 한국 오컬트 무드** (원본 컬러 팔레트 유지)
4. **쿠폰 자동 체커** (운영자 입력 + 클릭 복사 + 만료 D-day)
5. **직업 진단** (단순 3-5문항)
6. **진령 11종 카드** (등급 + 추천 직업 + 핵심 스킬)
7. **검객 메타 빌드 페이지** (Beachhead 핵심)
8. **공식 이미지 핫링크** (Google Play CDN)
9. **법적 디스클레이머** (홈/푸터)
10. **GA4 + 데이터 스키마 사전 설계** (Firestore 컬렉션 + 이벤트 명세)
11. **SEO 기본** (메타 태그, sitemap.xml, robots.txt, 롱테일 50개 키워드)
12. **Vercel 배포 + 도메인** (tene 환경변수)

### 12.2 ❌ MVP Out of Scope (V1+)

- 사용자 인증 / 회원가입 / 로그인
- 댓글 (V1: Giscus 또는 Firestore)
- 빌드 공유 / 좋아요 / 북마크 (V1)
- UGC 작성 (V1)
- 광고 (V1: AdSense)
- 후원 위젯 (V1)
- 빌드 시뮬레이터 (V2)
- 채용률 차트 (V2)
- 시즌패스 계산기 (V2)
- 프리미엄 구독 결제 (V2)
- 모바일 앱 (PWA로도 충분)
- 다국어 i18n (V2 후반)
- LLM Q&A (V2)
- API 라이선스 (V3)
- B2B 대시보드 (V3)

### 12.3 MVP 성공/실패 기준 (정량, 30일 + 90일)

#### 30일차 (배포 후)
| 항목 | 성공 | 미달 시 액션 |
|------|------|------------|
| Lighthouse 모바일 점수 | ≥ 90 | 이미지 최적화·CSS 정리 |
| 5개 핵심 키워드 인덱싱 | Google Search Console 등록 | sitemap 재제출 |
| GA4 작동 | 5개 핵심 이벤트 발화 | 디버그 |
| 페이지 로딩 시간 | < 2초 | Vercel ISR/캐싱 보강 |
| 시드 트래픽 | DAU 30+ | 디시 시드 강화 |

#### 90일차 (M3)
| 항목 | 성공 | 미달 시 액션 |
|------|------|------------|
| DAU | 100+ | 콘텐츠 톤 피벗 검토 (Strategy §5.4 결정 트리) |
| "갓깨비 키우기 공략" SERP | 상위 30위 이내 | 백링크 / 콘텐츠 보강 |
| 평균 체류시간 | 60초+ | UX 개선 |
| 이탈률 | < 70% | 첫 페이지 가치 강화 |
| 쿠폰 페이지 PV | 30일 누적 500+ | 디시 시드 강화 |

### 12.4 MVP 폐기 / V1 전환 결정 트리거 (4.5/6개월차)

```
4.5개월차 (M4.5):
  DAU 100 미만 + 쿠폰 페이지 PV 누적 500 미만
  → 톤 피벗 또는 콘텐츠 깊이 강화 (V1 진입 보류)

6개월차 (M6):
  DAU 500 도달 → V1 진입 (광고 + UGC)
  DAU 200-500 → V1 보류, MVP 콘텐츠 깊이 강화 6개월 연장
  DAU 200 미만 → MVP 폐기 검토, 후속 4399 게임으로 도메인 재활용
```

---

## 13. 의사결정 대기 항목 (운영자 Top 3 질문)

### Q1. 🔴 도메인 선정 — 게임 명 직접 사용 vs 우회
- **옵션 A**: `godkkaebi-guide.com` 또는 `gokkaebi-guide.com` (게임명 직접)
- **옵션 B**: `gokkaebi.kr` / `gokkaebi.gg` (단순 게임명)
- **옵션 C**: `metaguide.kr` 등 게임-agnostic (4399 그룹 후속작 재활용 용이)
- **추천**: 옵션 C — 게임-agnostic 도메인 (Risk-3 대응, V3 후속작 재활용)
- **결정 필요 시점**: MVP 배포 직전 (M0)

### Q2. 🔴 V0 시드 콘텐츠 작성자 결정
- **옵션 A**: 운영자 본인이 모든 콘텐츠 + 빌드 시드 30개 직접 작성 (시간 부담 ↑, 신뢰성 ↑)
- **옵션 B**: BlueStacks/디시 콘텐츠 가공 인용 (시간 부담 ↓, 법적 회색지대)
- **옵션 C**: 운영자 작성 70% + 디시 핫토픽 인용 30% (하이브리드)
- **추천**: 옵션 C
- **결정 필요 시점**: MVP 콘텐츠 작성 시작 시 (M0.5)

### Q3. 🟡 데이터 스키마 사전 검증 — 가상 V3 리포트 3종 작성 일정
- **옵션 A**: MVP 배포 전 (Sprint 0)에 가상 리포트 작성 → 스키마 역검증 (1-2일 추가 소요)
- **옵션 B**: MVP 배포 후 (V1 시작 전)에 작성 (지연 리스크: 스키마 재설계 시 마이그레이션 비용)
- **추천**: 옵션 A — D5 가설(Discovery §Step 3 R.A.T.)이 무산되면 V3 자체가 무산
- **결정 필요 시점**: 다음 sprint 시작 직전

---

## 14. Attribution & Sources

본 PRD는 [pm-skills](https://github.com/phuryn/pm-skills) by Pawel Huryn (MIT License)의 PRD 8-section + Beachhead (Geoffrey Moore) + Pre-mortem (Gary Klein) + Stakeholder Map 프레임워크를 적용했다.

**Sources (실측 정리)**:
- 모든 시장 데이터, 경쟁사 트래픽, 페르소나 인구통계는 `03-research.md §Attribution` 참조
- 데이터 스키마 설계는 Firebase 공식 베스트프랙티스 + GA4 이벤트 명세 가이드 기반
- B2B 가격 앵커링 [가설 — 검증 필요]: Game8(日) Gunosy 인수 사례, Sensor Tower Enterprise 가격, Mobile Index INSIGHT 가격
- 법적 디스클레이머 톤매너: 한국 저작권법 / 부정경쟁방지법 / 게임산업법 검토 (§01-discovery F-05)

**연관 문서**:
- `00-context/project-brief.md` (SSOT)
- `01-pm/01-discovery.md` (5-Step Discovery + OST)
- `01-pm/02-strategy.md` (VP + Lean Canvas + Pricing)
- `01-pm/03-research.md` (시장·경쟁사·페르소나·Journey Map)
- `01-pm/00-summary.md` (5분 요약)
