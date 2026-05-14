# Sprint 0 PRD — V3 가상 리포트 3종을 통한 R.A.T. 검증

> **Sprint ID**: `god-kkabi-guide-sprint-0`
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` · 참조: `docs/01-pm/04-prd.md` §10, §11 + `docs/01-pm/05-decisions.md` D3

---

## 1. Sprint 0 미션

PM Agent Team이 PRD §11에서 정의한 Firestore 6 컬렉션 스키마(`users`, `builds`, `tier_votes`, `coupons`, `events`, `pain_topics`)가 V3 B2B 패키지 3종을 추가 마이그레이션 없이 수용 가능한지 **역방향(top-down)** 검증한다.

> "역방향 검증"이란 V3에서 판매할 가상 리포트를 먼저 작성하고, 각 리포트가 요구하는 데이터 필드를 MVP 스키마로 도출 가능한지 거꾸로 추적하는 방법이다. 이는 R.A.T.(Riskiest Assumption Test) 원칙에 따라 가장 위험한 가정을 가장 저비용으로 가장 먼저 검증한다.

---

## 2. Context Anchor (Sprint 0)

| Key | Value |
|-----|-------|
| **WHY** | D5 가설(I=5 R=5)이 무산되면 V3 자체 무산 → ₩300M-1.5B 인수 가능성 소실. 1-2일/₩0 비용으로 가장 큰 가설을 검증할 수 있는 유일한 기회. |
| **WHO** | 1인 운영자 (kay@agentkay.it) — 직접 작성 또는 AI 보조. 검토자는 운영자 본인 (L3 Trust 수동 게이트). |
| **RISK** | (1) 매핑 누락 시 MVP 스키마 보강 필요 → MVP 일정 1-3일 지연. (2) 운영자가 가상 리포트 작성을 100% 완성도 추구로 인해 일정 지연. |
| **SUCCESS** | 가상 리포트 3종 × 6 컬렉션 매핑표 100% PASS + 운영자 승인 + 1-2일 내 완료 |
| **SCOPE** | **In**: 가상 리포트 3종 outline + 데이터 필드 명세 + Firestore 매핑표 + 운영자 검증 게이트. **Out**: 실제 PDF 디자인, 실제 데이터 수집, V3 영업 자료 본격 작성 (V3 Sprint에서) |

---

## 3. V3 가상 리포트 3종 정의

### 3.1 Report 1: 분기 메타 인사이트 리포트

**가설 콘텐츠**:
- 진령 11종 12주 채용률 추이 (주간 시계열)
- 메타 변화 시그널 (전주 대비 채용률 변화 ±N% 임계 도달 횟수)
- 신규 진령 출시 후 빌드 전환 속도 (48시간/1주일/4주일)
- 직업×진령 시너지 분포 (검객+홍길동, 영매+서해용왕 등 조합 다양성)
- 결투장 메타 빌드 TOP 10

**가설 패키지 가격**: 분기당 ₩5M-15M (PRD §10.3 패키지 A 재확인)

**대상 고객**: JOY MOBILE NETWORK PTE. LTD. (싱가폴 법인 본사) / Joy Net Games (한국 사업부, iOS 개발자명) / Joy Nice Games (Android 표기) / 4399 (모회사) — 마케팅 PM·운영팀

**사용 시나리오**: 게임 분기 결산 회의 자료, 신규 진령 출시 후 채용률 모니터링

### 3.2 Report 2: 이탈 시그널 SaaS 리포트

**가설 콘텐츠**:
- 페이지별 이탈률 (페이지 funnel 분석)
- 페인포인트 NLP 클러스터 (TOP 10 부정 감정 토픽)
- 보스 던전 별점 분포 (사용자 자체 평가)
- 결제 이탈 단계 (시즌패스 / 999뽑기 / 누적 소비 이벤트)
- 빌드 다양성 지수 (Shannon 엔트로피 또는 Gini 계수)

**가설 패키지 가격**: 월 ₩3M-10M SaaS 구독 (PRD §10.3 패키지 B)

**대상 고객**: Joy Net Games (한국 사업부) 운영팀 / JOY MOBILE NETWORK PTE. LTD. 사업개발 임원 (싱가폴) / 4399 한국 지원조직

**사용 시나리오**: 주간 이탈 위험 알람 (Slack/이메일), 이탈 방지 패치 우선순위 결정

### 3.3 Report 3: 후속작 사전 리서치 리포트

**가설 콘텐츠**:
- 갓깨비 1 유저의 대체 게임 언급 빈도 (커뮤니티 멘션 분석)
- 후속작(갓깨비 2 또는 새 4399 키우기 IP) 기대도 시그널
- 4399 그룹 채용 공고 분석 (신작 개발 신호)
- 동양 IP 키우기 시장 경쟁 게임 매출 추이 (Sensor Tower 인용)
- 한국 시장 진입 시점 추천 (시즌별 매출 패턴)

**가설 패키지 가격**: 일회성 ₩10M-30M (PRD §10.3 패키지 A 변형) 또는 ₩30M-100M/년 API 라이선스 (PRD §10.3 패키지 C)

**대상 고객**: 4399 본사 / JOY MOBILE NETWORK PTE. LTD. 신규 IP 기획팀

**사용 시나리오**: 후속작 출시 6개월 전 시장 진입 전략 자료

---

## 4. 검증 기준 (스키마 매핑 PASS/FAIL)

### 4.1 PASS 조건

- ✅ 가상 리포트 3종이 요구하는 모든 데이터 필드를 PRD §11 Firestore 6 컬렉션(`users`/`builds`/`tier_votes`/`coupons`/`events`/`pain_topics`)으로 도출 가능
- ✅ 도출 방법은 SQL-equivalent BigQuery 쿼리로 표현 가능 (실제 작성 불필요, pseudo-code 수준)
- ✅ 추가 컬렉션 필요 시 명시적으로 식별 + MVP Firestore 스키마 보강 후 PASS

### 4.2 FAIL 조건 (Sprint 0 재진입 또는 V3 스코프 축소)

- ❌ 필수 필드 1개 이상이 어떤 컬렉션에서도 도출 불가
- ❌ 필요한 컬렉션 추가 비용이 MVP 일정 1주일 이상 지연 유발

### 4.3 운영자 수동 게이트 (L3 Trust)

운영자가 직접 `schema-validation.md` 검토 후 다음 명령으로 Sprint 0 종료:

```bash
/sprint phase god-kkabi-guide-sprint-0 --to archive
```

PASS 시 → Sprint MVP Phase plan 진입.
FAIL 시 → MVP Firestore 스키마 수정 후 Sprint 0 재진입.

---

## 5. Out of Scope (Sprint 0)

- ❌ 실제 PDF 디자인 (V3 Sprint Phase do에서 작성)
- ❌ 실제 데이터 수집 (Sprint V1+에서 누적)
- ❌ NLP 모델 학습 (V2에서)
- ❌ B2B 영업 자료 본격 작성 (V3 Phase do)
- ❌ 게임사 미팅 (V3 Stage 1 Cold outreach)
- ❌ 가격 협상 (V3 Stage 3 Pilot 이후)

---

## 6. Success Criteria (정량)

| ID | 항목 | 목표 |
|----|------|------|
| S0-AC-01 | 가상 리포트 3종 Markdown 완성 | 3/3 |
| S0-AC-02 | 각 리포트 데이터 필드 명세 | 리포트별 5-10개 필드 |
| S0-AC-03 | Firestore 컬렉션 매핑표 작성 | 100% 매핑 |
| S0-AC-04 | 운영자 수동 검증 게이트 | PASS 승인 |
| S0-AC-05 | 총 소요 시간 | 1-2일 (16시간 이하) |
| S0-AC-06 | 인프라 비용 | ₩0 |

---

## 7. 다음 Sprint 인터페이스

Sprint 0 산출물은 다음 형태로 Sprint MVP에 전달된다:

```
Sprint 0 archive 산출물
├── docs/sprint/01-sprint-0/sprint-0-virtual-reports/
│   ├── report-1-meta-insight.md
│   ├── report-2-churn-signal-saas.md
│   ├── report-3-next-title-research.md
│   └── schema-validation.md       ← Sprint MVP Phase design 입력
└── .bkit/state/sprints/god-kkabi-guide-sprint-0.json
                                     ↑
                              Sprint MVP가 참조 (스키마 확정 여부)
```

`schema-validation.md`는 Sprint MVP Phase design `design.md`의 §데이터 스키마 절에 직접 인용된다.

---

## 8. Attribution

본 PRD는 다음 입력을 합성한다:
- `docs/01-pm/04-prd.md` §10 B2B 자산화 로드맵 + §11 데이터 스키마 명세
- `docs/01-pm/05-decisions.md` D3 Sprint 0 결정
- `docs/01-pm/01-discovery.md` §Step 3 R.A.T. — D5 가설

> **Status**: Draft v1.0 — pending review.
