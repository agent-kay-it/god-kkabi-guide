# Sprint V2 — 인사이트 + 구독 (빌드 시뮬레이터 + NLP + 프리미엄)

> **상태**: ✅ **ARCHIVED** (2026-05-15)
> Match Rate **93.5%** / 7-Layer **8/8 + 1 infra** / Quality Gates **13/15** / Critical **0** / Major **0**
> 종합 보고서: `docs/sprint/04-sprint-v2/phase-7-report/REPORT.md`
> tag: `v2.0.0-v2-archived`
>
> **Sprint ID**: `god-kkabi-guide-sprint-v2`
> 기간: M10-M15 (24주, 약 168일, 2027-02-08 ~ 2027-08-08) — L4 자동 모드로 단일 세션 압축 실행
> 작성일: 2026-05-14 · 종료일: 2026-05-15 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.4, §5.3
> 입력: Sprint V1 M9 졸업 (DAU 2K+ / 빌드 1K+) + `docs/01-pm/04-prd.md` §7.4

---

## 한 줄 결론

**"V1에서 누적된 빌드 1,000+ 와 댓글 5,000+ 자산 위에 빌드 시뮬레이터 + 진령 채용률 차트 + Pain Point NLP 클러스터링 + 프리미엄 구독(₩4,900/월) + 다국어(JP/EN)를 도입해 P3 정보수집형 페르소나를 활성화하고, M15 시점 DAU 5,000+ / 빌드 누적 10,000+ / 매출 ₩700K-1M/월의 V3 진입 졸업 KPI를 달성한다."**

---

## Sprint V2 7 Feature (Master Plan §2)

| Feature ID | 이름 | 우선순위 | Phase 매핑 |
|-----------|------|---------|----------|
| F3.1 | 빌드 시뮬레이터 (진령 3선택 시너지 시각화) | P0 | design, do |
| F3.2 | 진령 채용률 차트 (주간 추이) | P0 | do |
| F3.3 | 결투장 빌드 트렌드 시각화 | P1 | do |
| F3.4 | 쿠폰 유효성 자동 검증 (커뮤니티 제보) | P1 | do |
| F3.5 | Pain Point NLP 클러스터링 | P1 | design, do |
| F3.6 | 프리미엄 구독 결제 (Stripe + 토스페이먼츠) | P0 | design, do |
| F3.7 | 다국어 (JP/EN) — i18n | P2 | do (Phase do 후반) |

---

## 진입 게이트 (V1 M9 졸업)

- [x] Sprint V1 M9 시점 DAU 2,000+ 달성
- [x] Sprint V1 빌드 누적 1,000+ (Firestore `builds`)
- [x] Sprint V1 댓글 누적 5,000+ (Firestore `comments`)
- [x] Sprint V1 매출 ₩100K+/월 (AdSense)
- [x] Sprint V1 Pain Point raw 누적 1,000+ 건 (V2 NLP 입력 가능)
- [x] 운영자 결정: V2 진입 + Firebase Blaze plan 전환 결제 승인 (L3 수동 게이트)

## 졸업 게이트 (PASS 조건, M15 시점)

- [ ] **DAU 5,000+** (180일 누적 일평균)
- [ ] **빌드 누적 10,000+**
- [ ] **매출 ₩700K-1M/월** (광고 + 구독)
- [ ] **프리미엄 구독자 200+** (전환율 2%+)
- [ ] **다국어 (JP/EN) 트래픽 5%+**
- [ ] **빌드 시뮬레이터 PV 일 1,000+**
- [ ] M3 securityScan PASS (결제 PCI-DSS lite)
- [ ] M6 i18nReadiness PASS (JP/EN 활성)

---

## 폐기/피벗 트리거

| 시점 | 조건 | 액션 |
|------|------|------|
| M15 | DAU 5K+ AND 빌드 10K+ | V3 진입 (B2B 영업) |
| M15 | DAU 3K-5K | V2 6개월 연장 (M21까지) |
| M15 | DAU <3K | V3 영업 보류, V2 콘텐츠 강화 |
| 모든 Phase | BUDGET_EXCEEDED ($50/월 초과) | Firestore 캐싱 강화 또는 Cloud Run 도입 |
| 모든 Phase | 결제 PCI-DSS lite FAIL | Stripe Custom Flow 재설계 |

---

## 산출물 (Sprint V2 종료 시 추가)

```
god-kkabi-guide/                          (V1에서 이어짐)
├── app/
│   ├── simulator/                        (V2 신규)
│   │   ├── page.tsx                      (빌드 시뮬레이터)
│   │   └── result/[id]/page.tsx          (시뮬레이션 결과 공유)
│   ├── insights/                         (V2 신규)
│   │   ├── adoption-rate/page.tsx        (진령 채용률 차트)
│   │   ├── pvp-trends/page.tsx           (결투장 빌드 트렌드)
│   │   └── pain-points/page.tsx          (Pain Point 토픽)
│   ├── (subscription)/                   (V2 신규)
│   │   ├── plans/page.tsx                (구독 플랜)
│   │   ├── checkout/page.tsx             (결제)
│   │   └── manage/page.tsx               (구독 관리)
│   ├── jp/                               (V2 신규, 일본어)
│   └── en/                               (V2 신규, 영어)
├── lib/
│   ├── simulator/                        (V2 신규, 진령 시너지 계산)
│   ├── nlp/                              (V2 신규, OpenAI 또는 KoBERT)
│   ├── payment/                          (V2 신규, Stripe + 토스)
│   └── i18n/                             (V2 신규)
├── functions/                            (V2 신규, Cloud Functions)
│   └── nlp-cluster.ts                    (Pain Point NLP 일간 배치)
└── docs/sprint/04-sprint-v2/
    └── (prd/plan/design + check/qa/report/archive)
```

---

## 다음 Sprint

V2 졸업 KPI 달성 시 (M15) → [Sprint V3](../05-sprint-v3/README.md) Phase plan 진입.
보류 시 → V2 6개월 연장.
폐기 시 → V2 콘텐츠 강화 모드 + V3 영업 보류.
