# Sprint V2 Plan — 8 Phase WBS (24주, M10-M15)

> **Sprint ID**: `god-kkabi-guide-sprint-v2`
> 기간: 2027-02-08 ~ 2027-08-08 (24주, 약 168일)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.4 · PRD: `docs/sprint/04-sprint-v2/prd.md`

---

## 1. 표준 8 Phase 시퀀스 (Master Plan §3.4)

```
Phase 1: plan       (2주)  → 시뮬레이터 인터랙션 설계 + Stripe/토스 결제 + i18n 전략
Phase 2: design     (2주)  → 시뮬레이터 UI + 차트 라이브러리 + 구독 페이지
Phase 3: do         (16주) → 시뮬레이터 → 차트 → NLP → 결제 → 다국어
Phase 4: check      (1주)  → NLP 정확도 + 결제 전환율 + 다국어 SEO
Phase 5: act        (1주)  → 개선 iterate (DAU <2K 시)
Phase 6: qa         (0.5주) → 7-layer + 결제 PCI-DSS lite 검증
Phase 7: report     (0.5주) → 운영자 보고서 + V3 진입 결정
Phase 8: archive    (1주)  → .bkit/state + 회고
```

---

## 2. Phase 1: plan (2주 / Day 1-14)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P1.T-001 | 시뮬레이터 시너지 매트릭스 11×11 작성 (운영자 게임 플레이 검증) | 운영자 | 12 | synergy-matrix.json |
| V2.P1.T-002 | 시뮬레이터 알고리즘 설계 (점수 = 직업×진령 + 진령간 시너지) | 운영자+AI | 4 | algorithm-spec.md |
| V2.P1.T-003 | Stripe vs 토스페이먼츠 비교 (수수료/UX/PG 인증) | 운영자+AI | 4 | payment-comparison.md |
| V2.P1.T-004 | 결제 흐름 설계 (7일 체험 + 자동 갱신 + 만료 알림) | AI | 4 | payment-flow.md |
| V2.P1.T-005 | NLP 옵션 비교 (OpenAI gpt-4o-mini vs KoBERT 자체) | AI | 3 | nlp-comparison.md |
| V2.P1.T-006 | NLP 토픽 추출 알고리즘 명세 (topic modeling + sentiment) | AI | 4 | nlp-spec.md |
| V2.P1.T-007 | i18n 전략 (next-intl + JP/EN 콘텐츠 우선순위) | 운영자+AI | 4 | i18n-strategy.md |
| V2.P1.T-008 | 차트 라이브러리 선정 (Chart.js vs Recharts Lighthouse 영향) | AI | 2 | chart-selection.md |
| V2.P1.T-009 | 프리미엄 혜택 5종 가치 검증 (사용자 인터뷰 5건+) | 운영자 | 6 | premium-validation.md |
| V2.P1.T-010 | Firebase Blaze plan 비용 분석 + 결제 승인 | 운영자 | 2 | blaze-decision.md |
| V2.P1.T-011 | Cloud Functions 도입 결정 (NLP 일간 배치) | 운영자+AI | 2 | cloud-functions-plan.md |
| V2.P1.T-012 | Phase 1 종료 게이트 운영자 승인 | 운영자 | 0.5 | `/sprint phase ... --to design` |

---

## 3. Phase 2: design (2주 / Day 15-28)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P2.T-013 | 빌드 시뮬레이터 UI 디자인 (진령 11종 카드 + 시너지 시각화) | AI | 5 | `design.md` §시뮬레이터 |
| V2.P2.T-014 | 채용률 차트 UI (Recharts 또는 Chart.js) | AI | 3 | `design.md` §차트 |
| V2.P2.T-015 | 결투장 트렌드 페이지 UI | AI | 3 | `design.md` §PvP |
| V2.P2.T-016 | Pain Point 토픽 페이지 UI | AI | 3 | `design.md` §NLP |
| V2.P2.T-017 | 구독 플랜 페이지 UI (무료 vs 프리미엄 비교 표) | AI | 4 | `design.md` §구독 |
| V2.P2.T-018 | 결제 흐름 UI (Stripe Elements 또는 토스 SDK) | AI | 4 | `design.md` §결제 |
| V2.P2.T-019 | 구독 관리 페이지 UI (해지/재구독/결제 카드 변경) | AI | 3 | `design.md` §구독 관리 |
| V2.P2.T-020 | 다국어 페이지 구조 (`/jp/*` `/en/*`) + 번역 키 설계 | AI | 3 | `design.md` §i18n |
| V2.P2.T-021 | Cloud Functions 함수 명세 (nlp-cluster, subscription-renew, coupon-validate) | AI | 4 | `design.md` §Cloud Functions |
| V2.P2.T-022 | Firestore `subscriptions` + `simulations` + `coupon_reports` 컬렉션 V2 신규 스키마 | AI | 3 | `design.md` §스키마 |
| V2.P2.T-PAY-001 | 결제 funnel 이벤트 5종 정의 (`payment_view/select/input/success/drop`) + payload 스키마 + GA4/Firestore 동기화 설계 ([Sprint 0 보강 C — R2-C4 매핑]) | AI | 4 | `design.md` §5.7 events enum + payload spec |
| V2.P2.T-NER-001 | OpenAI fine-tuning 데이터셋 라벨 가이드 작성 + 라벨 카테고리 7종 (`GAME_NAME/JINRYEONG/SKILL/CLASS/ITEM/EVENT/FEELING`) 정의 ([Sprint 0 보강 C — R3-C1 매핑]) | 운영자+AI | 4 | ner-label-guide.md |
| V2.P2.T-023 | M1 designCompleteness ≥85 검증 | AI | 1 | M1 PASS |
| V2.P2.T-024 | Phase 2 종료 게이트 | 운영자 | 0.5 | `/sprint phase ... --to do` |

---

## 4. Phase 3: do (16주 / Day 29-140) — 핵심 작업

### 4.1 Sub-Phase do.A: 빌드 시뮬레이터 (Week 1-4, Day 29-56)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P3.T-025 | `app/simulator/page.tsx` 시뮬레이터 페이지 (진령 11종 카드 인터랙티브) | AI | 6 | simulator page |
| V2.P3.T-026 | 시너지 계산 lib (`lib/simulator/synergy-calc.ts`) | AI | 5 | synergy lib |
| V2.P3.T-027 | 점수 시각화 컴포넌트 (Radar chart 또는 progress bars) | AI | 4 | visualization |
| V2.P3.T-028 | `app/simulator/result/[id]/page.tsx` 결과 공유 페이지 | AI | 4 | result page |
| V2.P3.T-029 | Firestore `simulations` 컬렉션 (영구 저장) | AI | 2 | simulations |
| V2.P3.T-030 | 일 5회 한도 제한 (무료 유저) | AI | 3 | rate limit |
| V2.P3.T-031 | "이 빌드로 작성하기" 1-click 전환 | AI | 3 | conversion |
| V2.P3.T-032 | 시뮬레이터 SEO (메타 + OG 동적 생성) | AI | 3 | seo |
| V2.P3.T-033 | GA4 `simulator_run`, `simulator_result_share` 이벤트 | AI | 1 | events |

### 4.2 Sub-Phase do.B: 인사이트 차트 + NLP (Week 5-8, Day 57-84)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P3.T-034 | Cloud Functions 초기화 + `nlp-cluster.ts` 일간 배치 (gpt-4o-mini API) | AI | 6 | cloud function |
| V2.P3.T-035 | `pain_topics` V2 활성 (raw → topic/sentiment/frequency 업데이트) | AI | 3 | nlp output |
| V2.P3.T-036 | `app/insights/pain-points/page.tsx` Pain Point 페이지 | AI | 5 | pain points page |
| V2.P3.T-037 | `app/insights/adoption-rate/page.tsx` 진령 채용률 차트 (Recharts) | AI | 6 | adoption rate |
| V2.P3.T-038 | `app/insights/pvp-trends/page.tsx` 결투장 빌드 트렌드 | AI | 4 | pvp trends |
| V2.P3.T-039 | BigQuery 쿼리 라이브러리 (`lib/bigquery/queries.ts`) — 채용률 + 토픽 집계 | AI | 5 | bq queries |
| V2.P3.T-040 | 인사이트 페이지 SEO + JSON-LD Dataset | AI | 2 | seo |
| V2.P3.T-041 | NLP 정확도 검증 (운영자 sample 100건 검수) | 운영자 | 5 | nlp-accuracy.md |
| V2.P3.T-BR-V2-001 | V1 `boss_ratings` 데이터 기반 R2-C3 보스 별점 분포 도넛 차트 페이지 (`app/insights/boss-ratings/page.tsx` + Recharts `<PieChart>`) ([Sprint 0 보강 C — R2-C3 시각화 실데이터 전환]) | AI | 4 | boss-ratings chart page |
| V2.P3.T-NER-002 | 댓글 500-1,000건 수동 라벨링 (운영자 직접, NER 학습 데이터셋 작성) ([Sprint 0 보강 C — R3-C1 매핑]) | 운영자 | 16 | ner-dataset.jsonl |
| V2.P3.T-NER-003 | OpenAI fine-tuning job 실행 + 검증 데이터셋 200건 평가 + `nlp-cluster.ts` 통합 + tene 시크릿 `OPENAI_NER_MODEL_ID` 등록 ([Sprint 0 보강 C — R3-C1 매핑]) | AI+운영자 | 12 | NER API ready + accuracy ≥88% |

### 4.3 Sub-Phase do.C: 결제 + 구독 (Week 9-12, Day 85-112)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P3.T-042 | Stripe 계정 + Webhook URL 설정 | 운영자 | 2 | stripe account |
| V2.P3.T-043 | 토스페이먼츠 계정 + PG 인증 신청 | 운영자 | 4 | toss account |
| V2.P3.T-044 | `app/(subscription)/plans/page.tsx` 구독 플랜 비교 | AI | 3 | plans page |
| V2.P3.T-045 | `app/(subscription)/checkout/page.tsx` 결제 페이지 (Stripe Elements 또는 토스) | AI | 6 | checkout page |
| V2.P3.T-046 | `app/(subscription)/manage/page.tsx` 구독 관리 | AI | 4 | manage page |
| V2.P3.T-047 | Cloud Functions `subscription-webhook.ts` (결제 이벤트 처리) | AI | 5 | webhook |
| V2.P3.T-048 | Firestore `subscriptions` 컬렉션 (구독 상태 추적) | AI | 3 | subscriptions |
| V2.P3.T-049 | 7일 무료 체험 로직 + 만료 7일 전 이메일 알림 | AI | 4 | trial flow |
| V2.P3.T-050 | 프리미엄 혜택 게이팅 (시뮬레이터 무제한, 광고 제거, Pain Point 상세) | AI | 4 | premium gating |
| V2.P3.T-PAY-002 | Stripe Elements / 토스 SDK 결제 통합 + 결제 funnel 5종 emit 로직 (`payment_view/select/input/success/drop` GA4 + Firestore `events` 동기화) ([Sprint 0 보강 C — R2-C4 매핑]) | AI | 16 | payment integration with funnel events |
| V2.P3.T-PAY-003 | GA4 funnel 리포트 활성화 + Firestore `events` → BigQuery 일간 export 검증 + R2-C4 차트 BigQuery 쿼리 작성 ([Sprint 0 보강 C — R2-C4 매핑]) | AI | 4 | funnel report ready + R2-C4 query |
| V2.P3.T-051 | GA4 `subscription_start`, `subscription_cancel` 이벤트 (`payment_success`는 T-PAY-002에서 통합 처리) | AI | 1 | events |
| V2.P3.T-052 | PCI-DSS lite 검증 (카드 정보 직접 수집 0건 확인) | 운영자+AI | 2 | pci-lite |

### 4.4 Sub-Phase do.D: 다국어 + 쿠폰 자동 검증 (Week 13-16, Day 113-140)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P3.T-053 | next-intl 라이브러리 도입 + 미들웨어 설정 | AI | 3 | i18n setup |
| V2.P3.T-054 | UI 텍스트 i18n 키 추출 (`messages/ko.json`, `jp.json`, `en.json`) | AI | 5 | i18n keys |
| V2.P3.T-055 | 콘텐츠 9섹션 + 진령 11종 → JP 번역 (AI 초벌 + 운영자 검수) | 운영자+AI | 12 | jp content |
| V2.P3.T-056 | 콘텐츠 9섹션 + 진령 11종 → EN 번역 (AI 초벌 + 운영자 검수) | 운영자+AI | 12 | en content |
| V2.P3.T-057 | `app/jp/*` 라우트 + 다국어 sitemap | AI | 3 | jp routes |
| V2.P3.T-058 | `app/en/*` 라우트 + 다국어 sitemap | AI | 3 | en routes |
| V2.P3.T-059 | 쿠폰 자동 검증 Cloud Functions (`coupon-validate.ts`) — `reported_invalid_count >= 3` 자동 status 변경 | AI | 3 | coupon validate |
| V2.P3.T-060 | M6 i18nReadiness 게이트 검증 | AI | 1 | M6 PASS |
| V2.P3.T-061 | M8 ESLint + TypeScript 오류 0 (V2 신규 코드) | AI | 2 | lint |
| V2.P3.T-062 | M2 testCoverage ≥80 (시뮬레이터/결제 단위 테스트 + PAY funnel 5종 emit 단위 테스트 + NER 라벨링 데이터셋 정합성 테스트) | AI | 8 | tests |

> **Sprint 0 보강 C 적용 (2026-05-14)**: 본 보강은 Sprint 0 schema-validation §4.3 + §4.5 옵션 A 채택 결정의 직접 결과.
>
> - **PAY 그룹** (`T-PAY-001`/`T-PAY-002`/`T-PAY-003`): Phase 2 design 4h + Sub do.C 16h + 4h = **총 24h 추가**. R2-C4 결제 이탈 단계 funnel 매핑 ⚠️ Conditional → ✅ PASS.
> - **NER 그룹** (`T-NER-001`/`T-NER-002`/`T-NER-003`): Phase 2 design 4h + Sub do.B 16h + 12h = **총 32h 추가**. R3-C1 대체 게임 언급 빈도 매핑 ⚠️ Conditional → ✅ PASS.
> - **R2-C3 시각화** (`T-BR-V2-001`): Sub do.B 4h. V1 신설 `boss_ratings`를 V2 도넛 차트로 시각화하여 가상 리포트 R2-C3 매핑이 V2 종료 후 (M15+) 실데이터로 자동 전환.
> - **합계**: PAY 24h + NER 32h + BR-V2 4h = **60h 추가**. V2 Phase 3 do 16주(640h SLA) 일정 내 흡수 가능 (기존 buffer + Phase 2 design 8h 흡수).
> - **비용 영향**: OpenAI fine-tuning 일회성 ₩300K-500K (운영자 가용 예산 별도) + 월 NER 호출 ₩50K-200K (V2 한도 $50/월 내 운영 시 하한선 유지). 결제 funnel 이벤트는 ₩0 (GA4 + Firestore 무료 한도 내).
> - **운영자 직접 시간**: NER 라벨링 16h (V2.P3.T-NER-002) — 본 시간은 운영자 SLA 주 5-15h × 24주 = 120-360h 가용 중 흡수.

---

## 5. Phase 4: check (1주 / Day 141-147)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P4.T-063 | NLP 토픽 정확도 측정 (운영자 sample 100건 검수) | 운영자 | 5 | nlp-accuracy.md |
| V2.P4.T-064 | 시뮬레이터 → 빌드 작성 전환율 측정 | 운영자 | 2 | conversion-rate |
| V2.P4.T-065 | 구독 전환율 (7일 체험 → 결제) | 운영자 | 2 | sub-conversion |
| V2.P4.T-066 | Lighthouse 모바일 ≥80 (시뮬레이터 영향 검증) | AI | 2 | lighthouse-v2 |
| V2.P4.T-067 | 다국어 SEO 인덱싱 (GSC JP/EN 트래픽 측정) | 운영자 | 2 | i18n-seo |
| V2.P4.T-068 | M4 게이트 ≥80 검증 + M6 i18nReadiness PASS | AI | 1 | gates |
| V2.P4.T-069 | Gap analysis (V2 7 Features × 산출물) | AI | 2 | gap |
| V2.P4.T-070 | `check-report.md` 종합 | AI | 2 | check-report |

---

## 6. Phase 5: act (1주 / Day 148-154)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P5.T-071 | iterate 1: 시뮬레이터 정확도 미달 시 시너지 매트릭스 보강 | 운영자 | 5 | iterate-1 |
| V2.P5.T-072 | iterate 2: 구독 전환율 <2% 시 가격 인하 또는 혜택 추가 | 운영자+AI | 5 | iterate-2 |
| V2.P5.T-073 | iterate 3: 다국어 트래픽 <2% 시 다국어 비활성 결정 | 운영자 | 1 | iterate-3 |
| V2.P5.T-074 | ITERATION_EXHAUSTED 확인 + 결정 | 운영자 | 1 | decision |

---

## 7. Phase 6: qa (0.5주 / Day 155-158)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P6.T-075 | 7-layer dataFlowIntegrity (URL → 결제 → 구독 갱신 → 사용자 권한) | AI+운영자 | 4 | qa-layers |
| V2.P6.T-076 | 결제 PCI-DSS lite 검증 (카드 정보 직접 0건, Stripe/토스 Token 사용만) | 운영자 | 2 | pci-lite |
| V2.P6.T-077 | 결제 이중 청구 검증 (Webhook idempotency) | AI | 2 | idempotency |
| V2.P6.T-078 | 구독 자동 갱신 시나리오 테스트 (Stripe Test mode) | AI | 3 | renew-test |
| V2.P6.T-079 | NLP 토픽 KO 한국어 정확도 80%+ 검증 | 운영자 | 2 | nlp-validation |
| V2.P6.T-080 | M3 securityScan PASS + M7 dataFlowIntegrity PASS | AI | 2 | M3+M7 |
| V2.P6.T-081 | `qa-report.md` 종합 | AI | 2 | qa-report |

---

## 8. Phase 7: report (0.5주 / Day 159-162)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P7.T-082 | 180일차 졸업 KPI 측정 (DAU 5K+ / 빌드 10K+ / 매출 ₩700K+ / 구독자 200+) | 운영자 | 5 | kpi-180d |
| V2.P7.T-083 | V3 진입 결정 (PASS/보류/폐기) + Cold outreach 준비 | 운영자 | 3 | v3 decision |
| V2.P7.T-084 | NLP 토픽 클러스터링 결과 → V3 가상 리포트 실데이터 전환 자료 | 운영자 | 3 | v3-input |
| V2.P7.T-085 | `report.md` 종합 + Master Plan §7.2 분기점 매핑 | AI+운영자 | 3 | report |

---

## 9. Phase 8: archive (1주 / Day 163-168)

| Task ID | 태스크 | Owner | Estimate (h) | Output |
|---------|------|-------|---------|--------|
| V2.P8.T-086 | Sprint 상태 JSON 작성 | AI | 1 | sprint-v2.json |
| V2.P8.T-087 | V2 회고 메모 (1페이지) | 운영자 | 2 | archive-notes |
| V2.P8.T-088 | V3 입력 파일 정리 (Auth + UGC 10K + NLP 결과 + 구독 매출 baseline + 다국어 인프라) | AI | 2 | v3-handoff |
| V2.P8.T-089 | `/sprint phase ... --to archive` 호출 | 운영자 | 0.5 | Sprint V2 종료 |

---

## 10. Quality Gates (Master Plan §4 V2 매핑)

| Gate | V2 적용 | Phase |
|------|------|------|
| M1 designCompleteness ≥85 | ✅ | Phase 2 |
| M2 testCoverage ≥80 | ✅ (시뮬레이터/결제 단위 테스트) | Phase 3 |
| M3 securityScan PASS | ✅ (결제 PCI-DSS lite) | Phase 6 |
| M4 performanceLighthouse ≥80 | ✅ (시뮬레이터 영향으로 ≥85 → ≥80 완화) | Phase 4 |
| M5 accessibilityWCAG AA | ✅ | Phase 4 |
| M6 i18nReadiness | ✅ JP/EN | Phase 3 do.D 출구 |
| M7 dataFlowIntegrity 7-layer | ✅ + 결제 → 구독 | Phase 6 |
| M8 codeQuality | ✅ Strict | Phase 3 |
| M9 documentationCompleteness | ✅ + 결제 흐름 문서 | Phase 7 |
| M10 budgetCompliance | ✅ ≤$50/월 | 전 Phase |

---

## 11. 4 Auto-Pause Triggers (V2 임계값)

| Trigger | V2 임계값 | 액션 |
|---------|---------|----|
| QUALITY_GATE_FAIL | M3 결제 / M4 Lighthouse <80 | iterate |
| ITERATION_EXHAUSTED | iterate 3회 | 스코프 축소 (다국어 제외 등) |
| BUDGET_EXCEEDED | 월 인프라 > $50 | Cloud Run 도입 또는 캐싱 강화 |
| PHASE_TIMEOUT | Phase do 32주 초과 | 시간 재평가 |

---

## 12. 운영자 수동 게이트

| Phase 전환 | 결정 |
|---------|----|
| Phase 1 → 2 | 시너지 매트릭스 12h 작성 + Stripe vs 토스 선정 + 가격 ₩4,900 검증 |
| Phase 2 → 3 | NLP API key 등록 + Stripe/토스 Webhook URL 설정 |
| Phase 3 → 4 | Firebase Blaze plan 결제 승인 (필요 시) |
| Phase 4 → 5 | 다국어 트래픽 <2% 시 비활성 결정 |
| Phase 5 → 6 | 구독 전환율 <2% 시 가격 인하 결정 |
| Phase 6 → 7 | 결제 PCI-DSS lite waive 여부 결정 |
| Phase 7 → 8 | M15 V3 진입 / V2 6개월 연장 / V3 보류 결정 |
| Phase 8 → V3 | `/sprint init god-kkabi-guide-sprint-v3` |

---

## 13. 작업 시간 추정

| Phase | 시간 (h) | 운영자 | AI |
|-------|---------|------|-----|
| Phase 1 plan | 47 | 28 | 19 |
| Phase 2 design | 44 (Sprint 0 보강 C: +8) | 3 (+2 NER 라벨 가이드 협업) | 41 (+6 PAY-001 + NER-001) |
| Phase 3 do | 242 (Sprint 0 보강 C: +52) | 66 (+16 NER 라벨링) | 176 (+36 PAY-002/003 + NER-003 + BR-V2) |
| Phase 4 check | 16 | 12 | 4 |
| Phase 5 act | 12 | 4 | 8 |
| Phase 6 qa | 17 | 6 | 11 |
| Phase 7 report | 14 | 11 | 3 |
| Phase 8 archive | 5.5 | 2.5 | 3 |
| **합계** | **397.5** (Sprint 0 보강 C: +60) | **132.5 (33%)** | **265 (67%)** |

운영자 주 5-15h × 24주 = 120-360h 가용. 추정 132.5h는 SLA 중간값(240h)의 55% → 안전 (Sprint 0 보강 C 적용 후 +18h 증가, 여전히 SLA 안전권).

---

## 14. 비용 모니터링 (M10 ≤$50/월)

| 항목 | 한도 | V2 예상 |
|------|----|------|
| Firebase Blaze Firestore reads | 가변 (₩0.06/100K) | DAU 5K × 30일 × 평균 20 reads ≈ 3M reads/월 → ₩1,800/월 |
| Cloud Functions 호출 | 가변 | NLP 일간 배치 30회 + Webhook 호출 1,000회 + 결제 funnel events 동기화 → ₩500/월 |
| OpenAI API (gpt-4o-mini) — 토픽 추출 | 가변 | 일간 NLP 1K건 입력 → 월 ₩10K-30K |
| OpenAI API fine-tuned NER (Sprint 0 보강 C — §4.4) | 가변 | 일간 NER 호출 → 월 ₩50K-200K (하한선 운영 목표) |
| OpenAI fine-tuning 일회성 (Sprint 0 보강 C — §4.4) | 일회성 | ₩300K-500K (Phase 3 do.B Week 7, 운영자 가용 예산 별도) |
| BigQuery export | 가변 | 일간 export ~₩0 (무료 한도) + 결제 funnel events 백업 |
| Cloud Run NLP (옵션) | 가변 | 미사용 |
| Vercel Hobby | 100GB | ~70GB/월 (DAU 5K) — Pro plan ₩28K/월 검토 가능 |
| Stripe 수수료 | 매출의 3.4% + ₩30 | 매출 ₩500K → ₩17K |
| 토스 수수료 | 매출의 2.8-3.5% | 매출 ₩500K → ₩17K |
| **합계 (월간 운영)** | ≤$50 (₩70K) | ~₩50K-60K/월 (Sprint 0 보강 C NER 하한선 유지 시) → 안전 마진 적음 |

> V2 진입 후 1개월 모니터링 후 비용 폭증 시 BUDGET_EXCEEDED 발동.
>
> **Sprint 0 보강 C NER 비용 한도 임계값** (운영자 주의): NER fine-tuned API 월 호출 비용이 ₩66K 초과 시 (V2 한도 $50/월 = ₩66K/월의 100% 도달) — 토큰 절감 조치(샘플링 일 1K→500건) 또는 V3 한도 $100/월 조기 전환 결정. L3 Trust 운영자 수동 게이트 §12 Phase 3 → 4 시점에서 점검.

---

> **Status**: Draft v1.0 — pending review.
> 다음 산출물: `design.md` (시뮬레이터 + NLP + 결제 흐름).
