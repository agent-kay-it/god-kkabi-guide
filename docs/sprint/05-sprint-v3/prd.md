# Sprint V3 PRD — B2B 영업/인수 (Endgame)

> **Sprint ID**: `god-kkabi-guide-sprint-v3`
> 기간: M16-M24 (36주, 약 252일, 2027-08-09 ~ 2028-05-15)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.5, §5.3 · 입력: Sprint V2 M15 졸업 + `docs/01-pm/04-prd.md` §10 B2B 자산화

---

## 1. Mission (한 줄 결론)

**"V2까지 누적된 DAU 5,000+ / 빌드 10,000+ / 구독 매출 ₩1M/월 + NLP 인사이트 자산을 기반으로 JOY MOBILE NETWORK PTE. LTD. (싱가폴) / Joy Net Games (한국) / 4399 (중국 모회사)에 B2B Funnel 4단계(Cold Outreach → Demo → Pilot → License/Acquire)를 실행해, M24 시점 Pilot 1건+ AND 인수 LOI 1건+ 또는 라이선스 ₩30M+/년 계약을 클로징한다."**

본 Sprint는 22개월 누적 데이터 자산을 매각 가능한 B2B 패키지로 변환한다. Sprint 0에서 검증한 가상 리포트 3종은 V3에서 실데이터 리포트로 전환되며, V2에서 누적된 NLP 토픽은 분기 메타 인사이트 리포트의 핵심 콘텐츠가 된다.

---

## 2. Target (B2B 고객)

### 2.1 Primary Target 매핑 (Master Plan §1 WHO V3 고객)

> 실측 검증: iOS App Store에서 앱 제공자는 "JOY MOBILE NETWORK PTE. LTD." (싱가폴 법인, 홍콩 연락처 +852). 한국 개발자 표기는 iOS "Joy Net Games" / Android "Joy Nice Games". 4399는 모회사(중국).

| 고객 | 역할 | 의사결정 권한 | 영업 우선순위 |
|------|------|----------|----------|
| **JOY MOBILE NETWORK PTE. LTD.** | 싱가폴 본사 (앱 제공자) | M&A·예산 결정 | P0 — 인수 LOI 타겟 |
| **Joy Net Games / Joy Nice Games** | 한국 사업부 (iOS/Android 표기) | 한국 시장 운영·마케팅 | P0 — Pilot 클로징 타겟 |
| **4399 (모회사, 중국)** | 그룹 전체 의사결정 | 후속작 IP·예산 | P1 — 후속작 라이선스 |
| **Juxin Network** | 한국 퍼블리셔 | 게임 운영 일상 | P1 — Pilot 협력 |

### 2.2 의사결정자 매핑 (Phase 1 T-002)

| 타겟 회사 | 의사결정자 후보 | LinkedIn 검색 키워드 |
|---------|--------------|--------------|
| JOY MOBILE NETWORK | CEO, COO, Head of Business Development | "JOY MOBILE NETWORK" OR "JoyNet" + "Business" |
| Joy Net Games (한국) | 한국 지사장, 사업개발 리드, 마케팅 디렉터 | "Joy Nice Games" OR "Joy Net Games" + "Korea" |
| 4399 | 글로벌 사업본부, 한국 사업 리드 | "4399 Network" + "Korea" OR "Global" |
| Juxin Network | 운영팀 PM, 마케팅 PM | "Juxin" + "Game" |

연락처: cskr@joynetgame.com (공식 CS) — 비공식 영업 채널로는 LinkedIn 우선.

---

## 3. In Scope (Master Plan §1 SCOPE(V3))

### 3.1 B2B Funnel 자료 (F4.1)
- Sprint 0 가상 리포트 3종 → V3 실데이터 리포트 3종으로 전환
- Report 1: 분기 메타 인사이트 (V2 NLP + 채용률 차트 실데이터)
- Report 2: 이탈 시그널 SaaS (V2 Pain Point + 페이지 funnel)
- Report 3: 후속작 사전 리서치 (V2 다국어 트래픽 + 외부 데이터 보강)

### 3.2 API 라이선스 패키지 (F4.2)
- REST API (`/api/v1/builds`, `/api/v1/adoption-rate`, `/api/v1/pain-points`)
- GraphQL endpoint (`/api/graphql`) — Sensor Tower 패턴 참고
- 인증: API Key + JWT (`Authorization: Bearer ...`)
- Rate Limiting (구독 등급별: Starter / Pro / Enterprise)
- API 사용량 대시보드 (게임사 자체 SaaS UI)

### 3.3 어드민 대시보드 SaaS (F4.3)
- 게임사 전용 whitelabel 화면 (`/(admin-saas)/dashboard`)
- 게임사 로고 + 컬러 테마 커스터마이즈
- KPI: 채용률 + Pain Point + 빌드 트렌드 + 결제 funnel
- 데이터 export (CSV/JSON/PDF)
- 알람 설정 (Slack/이메일)

### 3.4 인수 제안 패키지 (F4.4)
- 회사 가치평가 자료 (DCF + Comparable Sales + Asset)
- 데이터 자산 평가서 (빌드 10K+ × ₩XXX/건 + NLP 토픽 × ₩XXX/토픽)
- 인수 후 운영 매뉴얼 (운영자 인수자에게 인계)
- 후속작 재활용 가이드 (4399 다른 게임 마이그레이션)

### 3.5 Cold Outreach (F4.5)
- LinkedIn 메시지 3-5 변형 (Phase 1 T-007)
- 보도자료 (해외/한국 언론 5건+ — 게임 관련 매체)
- 직접 이메일 (cskr@joynetgame.com 우회 채널 확보 시)
- 응답률 추적 (Notion 또는 HubSpot 무료 plan)

### 3.6 가격 앵커링 자료 (F4.6)
- Game8 (日, Gunosy 인수 추정 ₩500M-2B) 사례
- GameWith (日, 상장사) 매출 데이터
- Mihoyo Honkai Wiki 인수 (가설, 검증 필요)
- Sensor Tower Enterprise 가격 ($20K-100K/년)
- Mobile Index INSIGHT (한국) 가격 (₩300K-1M/월)

### 3.7 V3 패키지 5종 가격대 (PRD 04 §10.3 재인용)

| 패키지 | 가격 (가설) | 대상 | 트리거 |
|--------|----------|------|------|
| A. 분기 리포트 1회성 | ₩5M-15M | PM/마케팅 | 분기 결산 직전 |
| B. SaaS 메타 인사이트 구독 | ₩3M-10M/월 | 사업개발 | DAU 30% 하락 신호 |
| C. API 라이선스 (raw data) | ₩30M-100M/년 | 본사 데이터팀 | 후속작 사전 리서치 |
| D. Whitelabel 대시보드 | ₩100M-300M/년 | 4399 본사 | 후속작 출시 6개월 전 |
| E. 완전 인수 (M&A) | ₩300M-1.5B (일시) | 4399 또는 카카오 게임즈 | DAU 5K+ 빌드 1만+ 도달 |

---

## 4. Out of Scope (영구 또는 V4+)

- 운영자 1인 외 추가 채용 (Sprint V3 한정에서도 1인 운영 유지)
- 외부 투자 유치 (인수는 V3 종료 시점만 검토)
- 다른 게임 가이드 동시 운영 (인수 후 후속작 마이그레이션은 별도 컨설팅 계약)
- 글로벌 시장 확장 (V2 다국어 인프라는 후속작용)
- 모바일 네이티브 앱

---

## 5. Success Metrics (V3 졸업 KPI, M24)

### 5.1 Master Plan §8.1 졸업 KPI

| ID | 항목 | PASS | 보류 | 폐기 |
|----|------|------|------|------|
| V3-FN-01 | Cold Outreach 응답률 (Stage 1) | 10%+ (50건 → 5건+) | 5-10% | <5%: 메시지 피벗 |
| V3-FN-02 | Demo 건수 (Stage 2) | 5건+ | 2-5건 | <2건 |
| V3-FN-03 | Demo → Pilot 전환율 (Stage 3) | 30%+ | 15-30% | <15% |
| V3-FN-04 | Pilot 클로징 (Stage 3) | 1건+ (₩5M-10M) | 0건 + 진행 중 | 0건 + 진행 0건 |
| V3-FN-05 | License/Acquire (Stage 4) | LOI 1건+ 또는 라이선스 ₩30M+/년 | NDA 1건+ | 모두 실패 |

### 5.2 V3 특화 KPI

| ID | 항목 | 목표 |
|----|------|------|
| V3-SF-01 | LinkedIn 메시지 도달률 (read) | 60%+ |
| V3-SF-02 | 분기 메타 리포트 1page 샘플 다운로드율 | 30%+ |
| V3-SF-03 | Demo 후 NDA 서명률 | 50%+ |
| V3-SF-04 | Pilot 만족도 (1분기 후 설문) | 4.0+/5.0 |
| V3-SF-05 | 가격 협상 시 anchoring 성공률 (Game8 사례 활용) | 60%+ |
| V3-SF-06 | M3 securityScan PASS (B2B API) | ✅ |

---

## 6. Risk → Mitigation

### 6.1 V3 특화 리스크

| Risk | 확률 | 영향 | 완화 |
|------|------|------|----|
| **R1 공식 가이드 출시 → 자체 데이터 가치 ↓** | 중 30% | LOI 협상력 -50% | UGC 차별점 + Pain Point NLP 토픽이 공식이 못 만드는 데이터 강조 |
| **R8 법적 압박** (V3 시점 인지도↑) | 저 15% | 사이트 폐쇄 + 데이터 자산 무가치 | V2 후반 게임사 사전 소개 메일 + Pilot 단계에서 정식 라이선스 협의 |
| **R9 Cold Outreach 응답률 0%** | 중 30% | V3 자체 무산 | Stage 1 M19 보류 분기 → 메시지/가격 피벗 |
| **R10 게임 인기 급락** | 중 40% | LOI 가격 -70% | 라이프사이클 종료 직전이 오히려 매각 기회 (게임사 위기감 활용) |
| **R11 운영자 영업 경험 부족** | 고 60% | Pilot 클로징 실패 | LinkedIn 메시지 AI 보조 + 가격 협상 사전 시뮬레이션 |
| **R12 인수 후 데이터 이관 부담** | 중 50% | 인수 무산 | 데이터 이관 기술 명세 사전 작성 (Phase design) |
| **R13 4399 중국 본사 의사결정 지연** | 고 70% | 24개월 안에 클로징 어려움 | JOY MOBILE NETWORK 싱가폴 본사 우선 + 4399는 보조 |

### 6.2 V3 Auto-Pause Triggers

| Trigger | V3 임계값 | 액션 |
|---------|---------|----|
| QUALITY_GATE_FAIL | M3 API 인증 FAIL | API 보안 재설계 |
| ITERATION_EXHAUSTED | Cold Outreach 메시지 피벗 3회 후 응답률 <5% | 가격 인하 또는 사업 모델 피벗 |
| BUDGET_EXCEEDED | 월 인프라 > $100 | API 캐싱 강화 또는 게임사 분담 |
| PHASE_TIMEOUT | Phase do 48주 초과 (예상 24주의 2배) | V3 24주 추가 연장 또는 사업 종료 결정 |

---

## 7. User Stories / Job Stories (PRD 04 §7.5 매핑)

### 7.1 JS-V3-1 (4399 한국 사업부 PM)
> "When 갓깨비 키우기 분기 결산 직전 또는 DAU 30% 하락 신호 감지 시, I want to 외부 정성 데이터 (메타 인식, 이탈 사유, 빌드 채용률, 결투장 봇 의심)를 한 패키지로 받고 싶다, So that 후속 패치/콜라보/후속작 의사결정 근거가 된다."

수용 기준:
- [ ] 분기 메타 리포트 1page 샘플 PDF (3분 안에 핵심 인사이트 파악)
- [ ] 풀 리포트 ₩5M-15M 가격대
- [ ] 데이터 출처 명시 (빌드 10K+ × NLP 토픽 X종)
- [ ] 보도자료 또는 신뢰 가능한 매체에 언급 (V2 후반)

### 7.2 JS-V3-2 (4399 본사 사업개발)
> "When 후속작(갓깨비 2 또는 다른 키우기 시리즈) 출시 6개월 전, I want to 동일한 가이드/인사이트 플랫폼을 whitelabel로 라이선스하고 싶다, So that 신작 출시 첫날부터 가이드 인프라가 준비돼 유저 LTV 향상."

수용 기준:
- [ ] Whitelabel 대시보드 SaaS demo 환경 제공
- [ ] 가격 ₩100M-300M/년 (PRD §10.3 패키지 D)
- [ ] 인수 옵션 ₩300M-1.5B (PRD §10.3 패키지 E)

### 7.3 V3-Story-3: API 라이선스 (F4.2)
- As a 4399 본사 데이터팀, I want to REST/GraphQL API로 raw 데이터 (빌드/채용률/Pain Point)를 받고 싶다, So that 내부 BI 도구에 직접 통합.
- 수용 기준:
  - [ ] REST API endpoint 5종 (builds/adoption-rate/pain-points/coupons-trend/simulator-results)
  - [ ] GraphQL endpoint (`/api/graphql`)
  - [ ] API Key + JWT 인증
  - [ ] Rate Limiting (등급별: Starter 1K/일 / Pro 10K/일 / Enterprise 무제한)
  - [ ] API 사용량 대시보드 (게임사 self-service)
  - [ ] PCI-DSS lite (결제 카드 정보 0건)

### 7.4 V3-Story-4: 인수 LOI (F4.4)
- As a JOY MOBILE NETWORK 본사 M&A, I want to 갓깨비 키우기 가이드 사이트 + 22개월 누적 데이터 자산을 한 번에 매수하고 싶다, So that 한국 시장 운영 인사이트 + 후속작 IP 확장에 활용.
- 수용 기준:
  - [ ] 회사 가치평가 자료 (DCF + Comparable)
  - [ ] 데이터 자산 평가서 (빌드 + NLP + 구독자)
  - [ ] 인수 후 운영 매뉴얼 (운영자 → 인수자 인계)
  - [ ] 법무 검토 PASS (계약서)
  - [ ] LOI 1건+ 또는 본 계약 1건+

---

## 8. Pre-mortem (5종)

### 8.1 시나리오 A: Cold Outreach 응답률 0% (확률 중 30%)
- **증상**: LinkedIn 50건 보냈으나 응답 0건 → Stage 1 무산
- **근본 원인**: 메시지 톤이 너무 영업적, 의사결정자 매핑 부정확, 1page 샘플 매력도 부족
- **사전 방어**: Phase 1에서 의사결정자 5명 매핑 + 메시지 3 변형 A/B/C 테스트 사전 준비. 1page 샘플 PDF 운영자 디자인 검수
- **사후 대응**: M19 보류 분기 → 메시지/가격 피벗 (보도자료 부터 시작)

### 8.2 시나리오 B: Demo 후 모두 침묵 (확률 중)
- **증상**: Demo 5건 진행했으나 NDA 서명 0건 → Stage 2 무산
- **근본 원인**: Demo 자료가 게임사 내부 BI 도구 대비 약함, 가격 협상 사전 시뮬레이션 부족
- **사전 방어**: Phase 1 T-009 가격 협상 시뮬레이션 (운영자 + 가상 의사결정자 역할극 5회+)
- **사후 대응**: Demo 자료 강화 (특히 NLP 토픽 차별점) + 가격 ₩2M-5M로 인하 시도

### 8.3 시나리오 C: Pilot 진행 중 게임 인기 급락 (확률 중 40%)
- **증상**: Pilot 시작 3개월 후 갓깨비 키우기 DAU 50% 하락 → 게임사 Pilot 중단
- **근본 원인**: 방치형 RPG 6-12개월 라이프사이클 리스크 (R3)
- **사전 방어**: Pilot 계약 조건에 게임 DAU 하락 시 자동 종료 조항 명시
- **사후 대응**: 운영자가 후속작(가설: 갓깨비 2) 마이그레이션 패키지 즉시 제안

### 8.4 시나리오 D: 카카오프렌즈 IP 콜라보 권리 침해 통지 (확률 저 5%)
- **증상**: 카카오 게임즈가 콜라보 진령 페이지 콘텐츠에 cease & desist 발송
- **근본 원인**: V1+에서 콜라보 진령 페이지 UGC 빌드에 카카오 IP 자산이 포함된 경우
- **사전 방어**: V1 단계에서 카카오 콜라보 진령은 텍스트만, V3 시점에 카카오 게임즈 사전 소개 메일
- **사후 대응**: 콜라보 진령 페이지 즉시 비활성 + 카카오와 별도 협의

### 8.5 시나리오 E: 운영자 영업 경험 부족 → 가격 협상 실패 (확률 고 60%)
- **증상**: Pilot ₩5M-10M 제안 → 게임사 ₩1M 카운터 → 협상 break down
- **근본 원인**: 운영자가 B2B 영업 첫 경험, anchoring 미숙
- **사전 방어**: Phase 1 T-006 가격 앵커링 자료 작성 (Game8 / GameWith / Mihoyo 사례 정리) + 가격 협상 시뮬레이션
- **사후 대응**: 외부 영업 컨설팅 (1회성) 또는 가격 ₩3M로 인하 후 재시도

---

## 9. 의존성

### 9.1 V2에서 받는 입력
- DAU 5,000+ / 빌드 10,000+ / 구독자 200+ / NLP 토픽 24주+ 누적
- Firestore 컬렉션 6+신규 (subscriptions, simulations, pain_topics V2 처리됨)
- BigQuery export 일간 (V2에서 활성)
- 다국어 JP/EN 인프라 (후속작 글로벌 출시 시 재활용)
- 구독 매출 ₩1M/월 (V3 가격 협상 anchor)

### 9.2 V3 클로징 산출물 (운영자에게 전달)
- Pilot 계약서 1건+ (₩5M-10M 매출)
- 인수 LOI 또는 라이선스 계약 (₩30M+/년 또는 ₩300M+/일시)
- 데이터 이관 매뉴얼 (인수자 또는 라이선시에게)
- 후속작 재활용 매뉴얼 (운영자 자신 또는 후속작 마이그레이션)

---

## 10. Attribution

| 입력 | 위치 |
|------|------|
| Sprint Master Plan | `docs/sprint/00-master-plan.md` §2 V3, §3.5, §5.3 |
| 통합 PRD | `docs/01-pm/04-prd.md` §10 B2B 자산화, §7.5 V3 Job Stories |
| Sprint 0 가상 리포트 3종 | `docs/sprint/01-sprint-0/sprint-0-virtual-reports/` |
| Sprint V2 NLP 결과 | (V2 종료 후 산출) |

> **Status**: Draft v1.0 — pending review.
> 다음 산출물: `plan.md` (8 Phase WBS + B2B Funnel 4단계) → `design.md` (API 라이선스 + 어드민 SaaS + 인수 패키지).
