# Sprint V3 Plan — 8 Phase WBS (36주, M16-M24) + B2B Funnel 4단계

> **Sprint ID**: `god-kkabi-guide-sprint-v3`
> 기간: 2027-08-09 ~ 2028-05-15 (36주, 약 252일)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.5, §5.2 · PRD: `docs/sprint/05-sprint-v3/prd.md`

---

## 1. 표준 8 Phase + B2B Funnel 4단계 매핑

```
Phase 1: plan       (4주)  → B2B funnel 4단계 설계 + 가격 앵커링 자료 정리
Phase 2: design     (4주)  → API 라이선스 스펙 + 어드민 SaaS UI + 인수 패키지
Phase 3: do         (24주) → Cold Outreach 50건 → Demo → Pilot → 본 계약
   ├─ Sub do.A: API + 어드민 SaaS 구축 (Week 1-8)
   ├─ Sub do.B: Stage 1 Cold Outreach (Week 9-12)
   ├─ Sub do.C: Stage 2 Demo (Week 13-16)
   ├─ Sub do.D: Stage 3 Pilot (Week 17-22)
   └─ Sub do.E: Stage 4 License/Acquire 협상 (Week 21-24)
Phase 4: check      (2주)  → Pilot 결과 측정 + 인수 LOI 분석
Phase 5: act        (2주)  → 협상 전략 조정 (응답률 <10% 시 메시지 피벗)
Phase 6: qa         (1주)  → 계약서 법무 검토 + 데이터 이관 검증
Phase 7: report     (1주)  → 최종 회고 + 운영자 다음 단계
Phase 8: archive    (2주)  → 전체 프로젝트 아카이브 + 후속작 재활용 매뉴얼
```

> Sprint V3는 Master Plan §5.2 토큰 예산 80K 경계 → Phase do를 5개 sub-phase로 분할.

---

## 2. Phase 1: plan (4주 / Day 1-28)

### 2.1 산출물

- [ ] `docs/sprint/05-sprint-v3/cold-outreach-templates/linkedin-msg-{1,2,3}.md` (3 변형)
- [ ] `docs/sprint/05-sprint-v3/pricing-anchoring.md` (Game8/GameWith/Mihoyo/Sensor Tower 사례)
- [ ] `docs/sprint/05-sprint-v3/decision-maker-map.md` (의사결정자 5명 매핑)
- [ ] `docs/sprint/05-sprint-v3/funnel-stages.md` (4단계 KPI + 타임라인)
- [ ] `docs/sprint/05-sprint-v3/quarterly-report-1page.pdf` (분기 메타 인사이트 1page 샘플)
- [ ] `docs/sprint/05-sprint-v3/external-data-sources.md` (LinkedIn / 사람인 / 잡코리아 / Sensor Tower / Google News 라이선스 + API 키 명세) — [Sprint 0 보강 D — R3-C3/C4 매핑]

### 2.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P1.T-001 | B2B Funnel 4단계 설계 (Cold→Demo→Pilot→License/Acquire) + KPI 정의 | 운영자+AI | 4 | funnel-stages.md |
| V3.P1.T-002 | 의사결정자 매핑 (JOY MOBILE / Joy Net Games / 4399 / Juxin × 각 사 사업개발 리드) | 운영자 | 6 | decision-maker-map.md |
| V3.P1.T-003 | LinkedIn 검색 + 의사결정자 30명 후보 리스트 (Premium 검색) | 운영자 | 4 | linkedin-candidates.md |
| V3.P1.T-004 | Cold Outreach 메시지 3 변형 작성 (직접/간접/우회) | 운영자+AI | 6 | linkedin-msg-{1,2,3}.md |
| V3.P1.T-005 | 분기 메타 인사이트 1page 샘플 PDF 작성 (V2 NLP 실데이터 활용) | 운영자+AI | 8 | quarterly-report-1page.pdf |
| V3.P1.T-006 | 가격 앵커링 자료 작성 (Game8 ₩500M-2B / GameWith / Mihoyo / Sensor Tower) | 운영자+AI | 8 | pricing-anchoring.md |
| V3.P1.T-007 | LinkedIn Premium 결제 + Sales Navigator 활용 학습 | 운영자 | 4 | linkedin-premium |
| V3.P1.T-008 | 보도자료 초안 작성 (해외/한국 언론 5건+ 타겟) | 운영자+AI | 6 | press-release.md |
| V3.P1.T-009 | 가격 협상 시뮬레이션 (운영자 + 가상 의사결정자 역할극 5회+) | 운영자 | 5 | negotiation-sim.md |
| V3.P1.T-010 | NDA 템플릿 + Pilot 계약서 템플릿 초안 | 운영자+AI | 8 | nda-template.md + pilot-template.md |
| V3.P1.T-EXT-001 | 외부 데이터 소스 라이선스 검토 + 사람인/잡코리아 API 키 발급 + Google News API Key 등록 ([Sprint 0 보강 D — R3-C3 매핑]) | 운영자 | 4 | external-data-sources.md + API keys via tene |
| V3.P1.T-EXT-002 | Sensor Tower 분기 보고서 구독 결제 (분기당 $5K-15K, 첫 분기 Pilot 수익 도착 후 결제 또는 운영자 가용 예산) ([Sprint 0 보강 D — R3-C4 매핑]) | 운영자 | 2 | sensortower-subscription |
| V3.P1.T-EXT-003 | `external_signals` 컬렉션 스키마 + Firestore 보안 규칙 (admin-only read + service-account-only write) + 인덱스 3종 ([Sprint 0 보강 D — design.md §8.3]) | AI | 4 | external_signals collection + rules |
| V3.P1.T-011 | Phase 1 종료 게이트 운영자 승인 | 운영자 | 0.5 | `/sprint phase ... --to design` |

---

## 3. Phase 2: design (4주 / Day 29-56)

### 3.1 산출물

- [ ] `docs/sprint/05-sprint-v3/design.md` (API 라이선스 + 어드민 SaaS + 인수 패키지 + 외부 데이터 ETL §8)
- [ ] `docs/sprint/05-sprint-v3/api-license-spec.md` (REST + GraphQL 명세)
- [ ] `docs/sprint/05-sprint-v3/admin-saas-screens.md` (whitelabel UI)
- [ ] `docs/sprint/05-sprint-v3/acquisition-package.md` (가치평가 + 데이터 자산 평가)
- [ ] `docs/sprint/05-sprint-v3/data-migration-spec.md` (데이터 이관 기술 명세)
- [ ] `docs/sprint/05-sprint-v3/etl-cloud-functions-spec.md` (5종 Cloud Functions + Scheduler 명세) — [Sprint 0 보강 D]

### 3.2 WBS

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P2.T-012 | API 라이선스 스펙 (REST endpoint 5종 + GraphQL schema) | AI | 6 | api-license-spec.md |
| V3.P2.T-013 | API 인증 설계 (API Key + JWT, Rate Limiting 3 tier) | AI | 4 | api-auth |
| V3.P2.T-014 | API 사용량 대시보드 UI (게임사 self-service) | AI | 3 | api-usage-dash |
| V3.P2.T-015 | 어드민 SaaS whitelabel UI 디자인 (대시보드 + 리포트 + 알람) | AI | 8 | admin-saas-screens.md |
| V3.P2.T-016 | 게임사 테마 커스터마이즈 (로고 + 컬러 + 도메인) | AI | 3 | theme-customize |
| V3.P2.T-017 | 데이터 export 기능 (CSV/JSON/PDF) | AI | 4 | export |
| V3.P2.T-018 | Slack/이메일 알람 통합 (Pain Point 토픽 변화 시) | AI | 4 | alarms |
| V3.P2.T-019 | 인수 가치평가 자료 (DCF + Comparable Sales + Asset 3법 비교) | 운영자 | 6 | acquisition-package.md §평가 |
| V3.P2.T-020 | 데이터 자산 평가서 (빌드 10K × ₩XXX + NLP 토픽 × ₩XXX) | 운영자+AI | 4 | acquisition-package.md §자산 |
| V3.P2.T-021 | 인수 후 운영 매뉴얼 (운영자 → 인수자 인계) | 운영자 | 5 | acquisition-package.md §매뉴얼 |
| V3.P2.T-022 | 데이터 이관 기술 명세 (Firestore export + BigQuery + 인수자 인프라) | AI | 4 | data-migration-spec.md |
| V3.P2.T-023 | Firestore `api_clients` + `api_usage` 컬렉션 V3 스키마 | AI | 2 | schema |
| V3.P2.T-EXT-004 | ETL Cloud Functions 5종 설계 (`saramin-fetch` / `jobkorea-fetch` / `news-fetch` / `linkedin-ingest` / `sensortower-parse`) + 입출력 명세 + 에러 처리 ([Sprint 0 보강 D — design.md §8.4]) | AI | 6 | etl-cloud-functions-spec.md |
| V3.P2.T-EXT-005 | Cloud Scheduler 트리거 설계 (일일/주간/분기) + Firestore→BigQuery export 통합 + 비용 산정 ([Sprint 0 보강 D]) | AI | 2 | scheduler design + bq integration |
| V3.P2.T-024 | M1 designCompleteness ≥85 검증 | AI | 1 | M1 PASS |
| V3.P2.T-025 | Phase 2 종료 게이트 | 운영자 | 0.5 | `/sprint phase ... --to do` |

---

## 4. Phase 3: do (24주 / Day 57-224) — 5 Sub-Phase

### 4.1 Sub-Phase do.A: API + 어드민 SaaS 구축 (Week 1-8, Day 57-112)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P3.T-026 | `app/api/v1/builds/route.ts` REST endpoint | AI | 4 | api builds |
| V3.P3.T-027 | `app/api/v1/adoption-rate/route.ts` 채용률 endpoint | AI | 3 | api adoption-rate |
| V3.P3.T-028 | `app/api/v1/pain-points/route.ts` Pain Point endpoint | AI | 3 | api pain-points |
| V3.P3.T-029 | `app/api/v1/coupons-trend/route.ts` 쿠폰 트렌드 endpoint | AI | 2 | api coupons-trend |
| V3.P3.T-030 | `app/api/v1/simulator-results/route.ts` 시뮬레이션 endpoint | AI | 2 | api simulator-results |
| V3.P3.T-031 | `app/api/graphql/route.ts` GraphQL endpoint (Apollo Server) | AI | 5 | graphql |
| V3.P3.T-032 | API 인증 미들웨어 (`middleware.ts` API Key + JWT 검증) | AI | 4 | api auth |
| V3.P3.T-033 | Rate Limiting 미들웨어 (3 tier: Starter/Pro/Enterprise) | AI | 3 | rate-limit |
| V3.P3.T-034 | API Key 발급 흐름 (admin이 게임사별 발급) | AI | 3 | api-key |
| V3.P3.T-035 | `app/(admin-saas)/dashboard/page.tsx` 게임사 whitelabel 대시보드 | AI | 6 | admin-saas dashboard |
| V3.P3.T-036 | `app/(admin-saas)/reports/page.tsx` 리포트 페이지 | AI | 5 | admin-saas reports |
| V3.P3.T-037 | `app/(admin-saas)/api-usage/page.tsx` API 사용량 대시보드 | AI | 4 | api-usage |
| V3.P3.T-038 | 게임사 테마 커스터마이즈 (Firestore `tenant_themes` 컬렉션) | AI | 3 | theme |
| V3.P3.T-039 | 데이터 export (CSV/JSON/PDF) | AI | 4 | export |
| V3.P3.T-040 | Slack/이메일 알람 Cloud Functions | AI | 4 | alarms |
| V3.P3.T-EXT-006 | ETL Cloud Functions 5종 구현 (`saramin-fetch` / `jobkorea-fetch` / `news-fetch` / `linkedin-ingest` / `sensortower-parse`) + 단위 테스트 ([Sprint 0 보강 D]) | AI | 16 | 5 cloud functions deployed |
| V3.P3.T-EXT-007 | 가상 리포트 3종(`docs/sprint/01-sprint-0/sprint-0-virtual-reports/`) → 실데이터 리포트 v1 갱신 (V2 종료 직후 12주 실데이터 + `external_signals` 데이터 활용) ([Sprint 0 보강 D — design.md §8.6 가상→실데이터 전환]) | 운영자+AI | 8 | docs/sprint/05-sprint-v3/q1-real-reports/{1,2,3}.md |
| V3.P3.T-EXT-008 | R3-C3 (4399 채용 공고) + R3-C4 (산업 매출) BigQuery 쿼리 + 시각화 검증 + R3-C1 NER 결합 정확도 90%+ 검증 ([Sprint 0 보강 D — design.md §8.5]) | AI | 4 | R3-C3/C4/C1 charts validated |
| V3.P3.T-041 | M2 testCoverage ≥80 (API + admin SaaS + ETL Cloud Functions 단위 테스트) | AI | 8 | tests |
| V3.P3.T-042 | M8 ESLint + TypeScript 오류 0 (V3 신규 코드) | AI | 2 | lint |
| V3.P3.T-043 | 데모 환경 구축 (game-co.gokkaebi-guide.com whitelabel) | AI | 4 | demo env |

### 4.2 Sub-Phase do.B: Stage 1 Cold Outreach (Week 9-12, Day 113-140)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P3.T-044 | LinkedIn 의사결정자 50명 매핑 + 우선순위 정렬 | 운영자 | 8 | linkedin-50 |
| V3.P3.T-045 | LinkedIn 메시지 발송 (Week 1: 20건 변형 A) | 운영자 | 5 | week-1 |
| V3.P3.T-046 | LinkedIn 메시지 발송 (Week 2: 20건 변형 B) | 운영자 | 5 | week-2 |
| V3.P3.T-047 | LinkedIn 메시지 발송 (Week 3: 10건 변형 C) | 운영자 | 3 | week-3 |
| V3.P3.T-048 | 응답 추적 (Notion 또는 HubSpot 무료 plan) | 운영자 | 3 | tracking |
| V3.P3.T-049 | 보도자료 발송 (한국 5건, 해외 5건) | 운영자 | 4 | press |
| V3.P3.T-050 | cskr@joynetgame.com 우회 직접 이메일 (응답 0건 시) | 운영자 | 2 | direct-email |
| V3.P3.T-051 | Stage 1 KPI 측정 (응답률 10%+ 검증) | 운영자 | 2 | stage-1-kpi |

### 4.3 Sub-Phase do.C: Stage 2 Demo (Week 13-16, Day 141-168)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P3.T-052 | Demo deck 작성 (15분 발표용 슬라이드 + 데모 환경 화면 공유) | 운영자+AI | 8 | demo-deck.md |
| V3.P3.T-053 | Demo 1: 응답한 의사결정자 1-2명 (Google Meet 15분) | 운영자 | 2 | demo-1 |
| V3.P3.T-054 | Demo 2-5: 추가 Demo (Stage 1 응답 누적 시) | 운영자 | 8 | demos-2-5 |
| V3.P3.T-055 | NDA 서명 (Demo 후) | 운영자 | 3 | nda-signed |
| V3.P3.T-056 | Demo 피드백 정리 + 자료 보강 | 운영자 | 4 | demo-feedback |
| V3.P3.T-057 | Stage 2 KPI 측정 (Demo 5건+ / NDA 서명률 50%+) | 운영자 | 2 | stage-2-kpi |

### 4.4 Sub-Phase do.D: Stage 3 Pilot (Week 17-22, Day 169-210)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P3.T-058 | Pilot 가격 협상 (₩5M-10M / 1분기) | 운영자 | 6 | negotiation |
| V3.P3.T-059 | Pilot 계약서 작성 (법무 검토 후) | 운영자+법무 | 8 | pilot-contract |
| V3.P3.T-060 | Pilot 환경 셋업 (게임사 전용 whitelabel 대시보드 + API Key 발급) | AI | 6 | pilot-env |
| V3.P3.T-061 | Pilot 1분기 운영 (운영자 직접 PM/사업개발 협업) | 운영자 | 20 | pilot-ops |
| V3.P3.T-062 | Pilot 만족도 설문 (1분기 후) | 운영자 | 2 | pilot-survey |
| V3.P3.T-063 | Stage 3 KPI 측정 (Pilot 1건+ 클로징) | 운영자 | 2 | stage-3-kpi |

### 4.5 Sub-Phase do.E: Stage 4 License/Acquire 협상 (Week 21-24, Day 211-224)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P3.T-064 | 라이선스 vs 인수 전략 결정 (게임사 의향 확인) | 운영자 | 4 | strategy |
| V3.P3.T-065 | 인수 LOI 제안서 작성 (가치평가 + 데이터 자산 + 운영 매뉴얼) | 운영자 | 8 | acquisition-loi |
| V3.P3.T-066 | 라이선스 계약서 작성 (₩30M-100M/년) | 운영자+법무 | 6 | license-contract |
| V3.P3.T-067 | 가격 협상 (anchoring Game8 사례 활용) | 운영자 | 10 | price-nego |
| V3.P3.T-068 | NDA + 데이터 실사 (게임사 측 due diligence) | 운영자 | 8 | dd |
| V3.P3.T-069 | Stage 4 KPI 측정 (LOI 1건+ 또는 본 계약) | 운영자 | 2 | stage-4-kpi |

---

## 5. Phase 4: check (2주 / Day 225-238)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P4.T-070 | 4 Stage 전체 KPI 측정 (응답률/Demo/Pilot/LOI) | 운영자 | 4 | kpi-all |
| V3.P4.T-071 | Pilot 결과 분석 (만족도 + ROI 게임사 측면) | 운영자 | 3 | pilot-analysis |
| V3.P4.T-072 | 인수 LOI 분석 (가격 / 조건 / 타임라인) | 운영자 | 3 | loi-analysis |
| V3.P4.T-073 | Gap analysis (V3 6 Features × 산출물) | AI | 2 | gap |
| V3.P4.T-074 | `check-report.md` 종합 | AI | 2 | check-report |

---

## 6. Phase 5: act (2주 / Day 239-252)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P5.T-075 | iterate 1: 응답률 <10% 시 메시지 피벗 (보도자료 우선 모드) | 운영자 | 6 | iterate-1 |
| V3.P5.T-076 | iterate 2: Pilot 0건 시 가격 ₩2M 인하 후 재시도 | 운영자 | 4 | iterate-2 |
| V3.P5.T-077 | iterate 3: 인수 LOI 0건 시 라이선스만 추진 | 운영자 | 3 | iterate-3 |
| V3.P5.T-078 | ITERATION_EXHAUSTED 확인 + V3 24주 연장 또는 사업 종료 결정 | 운영자 | 1 | decision |

---

## 7. Phase 6: qa (1주 / Day 253-259)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P6.T-079 | 계약서 법무 검토 (Pilot + License + LOI) | 외부 법무 | 8 | legal-review |
| V3.P6.T-080 | 데이터 이관 검증 (Firestore export + BigQuery + 인수자 인프라) | AI | 4 | data-migration |
| V3.P6.T-081 | M3 securityScan PASS (B2B API 인증 + Rate Limiting) | AI | 3 | M3 PASS |
| V3.P6.T-082 | M7 dataFlowIntegrity (URL → B2B API → 게임사 환경) | AI | 3 | M7 PASS |
| V3.P6.T-083 | `qa-report.md` 종합 | AI | 2 | qa-report |

---

## 8. Phase 7: report (1주 / Day 260-266)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P7.T-084 | M24 클로징 KPI 측정 (Pilot 1건+ / LOI 1건+) | 운영자 | 4 | kpi-m24 |
| V3.P7.T-085 | 운영자 다음 단계 결정 (인수 클로징 / 라이선스 계약 / V4 후속작) | 운영자 | 4 | next-decision |
| V3.P7.T-086 | 22개월 전체 회고 (Sprint 0 ~ V3) | 운영자 | 4 | full-retrospective |
| V3.P7.T-087 | `report.md` 종합 + Master Plan §7.2 분기점 매핑 | AI+운영자 | 3 | report |

---

## 9. Phase 8: archive (2주 / Day 267-280)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V3.P8.T-088 | Sprint 상태 JSON 작성 (전체 22개월 결과) | AI | 1 | sprint-v3.json |
| V3.P8.T-089 | V3 회고 메모 (3페이지, 잘된 점 / 실패 / 교훈) | 운영자 | 4 | archive-notes |
| V3.P8.T-090 | 후속작 재활용 매뉴얼 (4399 다른 게임 마이그레이션 가이드) | 운영자+AI | 8 | post-acquisition/reusable-platform-manual.md |
| V3.P8.T-091 | 데이터 이관 실행 (인수 시) | AI+운영자 | 8 | data-migrated |
| V3.P8.T-092 | 운영 권한 양도 (인수 시) | 운영자 | 4 | ownership-transfer |
| V3.P8.T-093 | `/sprint phase ... --to archive` 호출 (Sprint V3 + 전체 프로젝트 종료) | 운영자 | 0.5 | 프로젝트 종료 |

---

## 10. Quality Gates (Master Plan §4 V3 매핑)

| Gate | V3 적용 | Phase |
|------|------|------|
| M1 designCompleteness ≥85 | ✅ | Phase 2 |
| M2 testCoverage ≥80 | ✅ (API + admin SaaS) | Phase 3 do.A |
| M3 securityScan PASS | ✅ B2B API 인증 + Rate Limiting | Phase 6 |
| M4 performanceLighthouse | ❌ N/A (B2B 환경, public site는 V2 유지) | - |
| M5 accessibility | ❌ N/A | - |
| M6 i18n | ❌ N/A (V2에서 PASS) | - |
| M7 dataFlowIntegrity 7-layer | ✅ + B2B API → 게임사 | Phase 6 |
| M8 codeQuality | ✅ Strict | Phase 3 |
| M9 documentationCompleteness | ✅ + 계약서 + SLA | Phase 7 |
| M10 budgetCompliance | ✅ ≤$100/월 | 전 Phase |

---

## 11. 4 Auto-Pause Triggers (V3 임계값)

| Trigger | V3 임계값 | 액션 |
|---------|---------|----|
| QUALITY_GATE_FAIL | M3 API 인증 FAIL | API 보안 재설계 |
| ITERATION_EXHAUSTED | Cold Outreach 메시지 피벗 3회 후 응답률 <5% | 가격 인하 또는 사업 모델 피벗 |
| BUDGET_EXCEEDED | 월 인프라 > $100 | 캐싱 강화 또는 게임사 분담 |
| PHASE_TIMEOUT | Phase do 48주 초과 (예상 24주의 2배) | V3 24주 추가 연장 또는 종료 결정 |

---

## 12. 운영자 수동 게이트

| Phase 전환 | 결정 |
|---------|----|
| Phase 1 → 2 | 의사결정자 50명 매핑 + 가격 협상 시뮬레이션 + LinkedIn Premium 결제 |
| Phase 2 → 3 | 가치평가 자료 + 데이터 자산 평가서 운영자 검수 + 외부 법무 자문 결정 |
| Phase 3 → 4 (sub-phase 별) | Stage 1 응답률 <10% / Stage 2 NDA 0건 / Stage 3 Pilot 0건 분기점 결정 |
| Phase 4 → 5 | iterate 또는 V3 24주 연장 결정 |
| Phase 5 → 6 | 메시지 피벗 / 가격 인하 / 라이선스만 추진 결정 |
| Phase 6 → 7 | 법무 검토 결과 + 데이터 이관 실행 결정 |
| Phase 7 → 8 | 인수 클로징 / 라이선스 / V4 / 사업 종료 결정 |
| Phase 8 종료 | 후속작 재활용 또는 운영 권한 양도 |

---

## 13. 작업 시간 추정

| Phase | 시간 (h) | 운영자 | AI/외부 | Sprint 0 보강 D 영향 |
|-------|---------|------|-----|------|
| Phase 1 plan | 75.5 | 57 | 18.5 | +10h (T-EXT-001/002/003) |
| Phase 2 design | 64 | 19 | 45 | +8h (T-EXT-004/005) |
| Phase 3 do | 298 | 133 | 165 | +28h (T-EXT-006/007/008) |
| Phase 4 check | 14 | 10 | 4 | — |
| Phase 5 act | 14 | 13 | 1 | — |
| Phase 6 qa | 20 | 0 | 20 (법무 8 + AI 12) | — |
| Phase 7 report | 15 | 12 | 3 | — |
| Phase 8 archive | 25.5 | 16 | 9.5 | — |
| **합계** | **526** | **260 (49%)** | **266 (51%)** | **+46h (Sprint 0 보강 D)** |

운영자 주 5-15h × 36주 = 180-540h 가용. 추정 260h는 SLA 중간값(360h)의 72% → V3는 가장 부담 큰 Sprint, 보강 D 적용 후에도 가용 범위 내. 외부 데이터 ETL은 AI 비중 높아 (28h 추가 중 22h가 AI), 운영자 부담 +14h(주 0.4h)는 36주에 걸쳐 흡수 가능.

> **Sprint 0 보강 D 적용 (2026-05-14)**: EXT 그룹 T-EXT-001~008 총 8 태스크 / +46h 추가. Phase 1 plan +10h(운영자 6+AI 4), Phase 2 design +8h(AI 전담), Phase 3 do +28h(운영자 8+AI 20). 본 보강은 Sprint 0 schema-validation §4.3 옵션 A 채택 결정의 직접 결과. R3-C3 (4399 채용 공고) + R3-C4 (산업 매출 추이) ❌ FAIL → ✅ PASS, R3-C1 (대체 게임 언급) ⚠️ Conditional → ✅ PASS 동시 해소.

---

## 14. 비용 모니터링 (M10 ≤$100/월)

| 항목 | V3 예상 | 비고 |
|------|------|------|
| Firebase Blaze | ~₩30K/월 (DAU 5K 유지) | Firestore + Auth |
| Cloud Functions (NLP + API alarm + ETL 5종) | ~₩20K/월 | Sprint 0 보강 D: ETL 5종 추가 (+₩10K) |
| OpenAI API (NER + NLP 클러스터링) | ~₩20K/월 | V2 NER 호출 포함 |
| Vercel Pro (DAU 10K+ 도달 시) | ₩28K/월 | |
| LinkedIn Premium (Sales Navigator) | ₩75K/월 ($55) | 영업 도구 + Sprint 0 보강 D 외부 데이터 소스 |
| 사람인 Open API | ₩0/월 | Sprint 0 보강 D — 무료 (rate-limited) |
| 잡코리아 RSS | ₩0/월 | Sprint 0 보강 D — 무료 |
| Google News API | ₩0/월 | Sprint 0 보강 D — Free tier |
| Sensor Tower 분기 보고서 | 분기 $5K-15K | Sprint 0 보강 D — Report 3 수익 (₩10-30M)에서 충당, 자체 비용 아님 |
| 법무 검토 (1회성) | ₩300K-1M (Phase 6) | |
| HubSpot 또는 Notion CRM | ₩0 (무료 plan) | |
| **합계 (월간 운영)** | **~$95-100/월** | 한도 $100/월 내 (margin 5-10%) |

> **Sprint 0 보강 D 비용 영향**: 무료 외부 데이터 소스(사람인/잡코리아/Google News) 우선 활용 + LinkedIn Premium은 기존 영업 도구로 외부 데이터 소스 겸용 + Sensor Tower는 수익 충당 → 자체 비용 증가 ~₩10K/월(Cloud Functions ETL)에 그침. V3 비용 한도 $100/월 ≈ ₩133K/월 내 운영 가능 (현재 ₩125K, margin 6%).

---

> **Status**: Draft v1.0 — pending review.
> 다음 산출물: `design.md` (API 라이선스 + 어드민 SaaS + 인수 패키지 + 데이터 이관).
