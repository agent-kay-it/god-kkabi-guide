# Sprint V3 — B2B 영업/인수 (Endgame)

> **Sprint ID**: `god-kkabi-guide-sprint-v3`
> 기간: M16-M24 (36주, 약 252일, 2027-08-09 ~ 2028-05-15)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.5, §5.3
> 입력: Sprint V2 M15 졸업 (DAU 5K+ / 빌드 10K+) + `docs/01-pm/04-prd.md` §10 B2B 자산화

---

## 한 줄 결론

**"V2까지 누적된 DAU 5,000+ / 빌드 10,000+ / 구독 매출 ₩1M/월 + NLP 인사이트 자산을 기반으로 JOY MOBILE NETWORK PTE. LTD. (싱가폴) / Joy Net Games (한국) / 4399 (중국 모회사)에 B2B Funnel 4단계(Cold Outreach → Demo → Pilot → License/Acquire)를 실행해, M24 시점 Pilot 1건+ AND 인수 LOI 1건+ 또는 라이선스 ₩30M+/년 계약을 클로징한다."**

---

## Sprint V3 6 Feature (Master Plan §2)

| Feature ID | 이름 | 우선순위 | Phase 매핑 |
|-----------|------|---------|----------|
| F4.1 | B2B funnel 자료 (분기 메타 리포트 실데이터) | P0 | plan, do |
| F4.2 | API 라이선스 패키지 (REST + GraphQL + 인증) | P0 | design, do |
| F4.3 | 어드민 대시보드 SaaS (게임사 전용 whitelabel) | P1 | design, do |
| F4.4 | 인수 제안 패키지 (가치평가 + 데이터 자산 평가) | P0 | do |
| F4.5 | Cold Outreach (LinkedIn 50건+, 보도자료) | P0 | do |
| F4.6 | 가격 앵커링 자료 (Game8/GameWith/Mihoyo 사례) | P1 | plan |

---

## 진입 게이트 (V2 M15 졸업)

- [x] Sprint V2 M15 시점 DAU 5,000+
- [x] Sprint V2 빌드 누적 10,000+
- [x] Sprint V2 매출 ₩700K-1M/월 (광고 + 구독)
- [x] Sprint V2 프리미엄 구독자 200+ (전환율 2%+)
- [x] Sprint V2 NLP Pain Point 토픽 클러스터링 운영 6개월+
- [x] Sprint V2 다국어 JP/EN 인프라 구축 완료
- [x] 운영자 결정: V3 영업 본격 시작 + Cold Outreach 작성 + LinkedIn Premium 결제

## 졸업 게이트 (PASS 조건, M24 시점)

- [ ] **Cold Outreach 응답률 10%+** (LinkedIn 50건 → 5건+)
- [ ] **Demo 5건+**
- [ ] **Pilot 1건+** (₩5M-10M / 1분기)
- [ ] **인수 LOI 1건+** 또는 **라이선스 계약 ₩30M+/년**
- [ ] M3 securityScan PASS (B2B API 인증)
- [ ] M7 dataFlowIntegrity PASS (URL → B2B API → 게임사)
- [ ] M9 documentationCompleteness ≥80 (계약서/SLA 포함)

---

## 폐기/피벗 트리거

| 시점 | 조건 | 액션 |
|------|------|------|
| M19 (Stage 1 종료) | 응답률 <10% | Cold Outreach 메시지 피벗 (가격 인하 또는 메시지 톤 변경) |
| M20 (Stage 2 종료) | Demo → Pilot 전환 <30% | Demo 자료 강화 또는 가격 협상 카드 추가 |
| M24 (졸업) | Pilot 1건+ AND LOI 1건+ | 인수 클로징 또는 V4 후속작 마이그레이션 |
| M24 (실패) | Pilot 0건 + LOI 0건 | 사업 모델 피벗 (라이선스 ₩10M/년 또는 후원 모델) |

---

## B2B Funnel 4단계 (Master Plan §3.5 매핑)

```
Stage 1: Cold Outreach (M16-M18, 8주)
  타겟: JOY MOBILE NETWORK PTE. LTD. (싱가폴 본사) + Joy Net Games (한국) + 4399 (중국) + Juxin Network
  도구: LinkedIn 검색 + 이메일 50건
  첨부: 분기 메타 인사이트 1page 샘플 PDF (V2 NLP 결과 실데이터)
  KPI: 응답률 10%+, Demo 예약 5건+

Stage 2: Demo (M18-M20, 8주)
  형식: Google Meet 15분 + 실시간 대시보드 화면 공유
  자료: V3 어드민 대시보드 SaaS demo 환경
  KPI: Demo 5건+, Pilot 전환 30%+

Stage 3: Pilot (M20-M24, 16주)
  Paid Pilot ₩5M-10M / 1분기
  운영자가 직접 PM/사업개발 담당자와 협업
  KPI: Pilot 1건+ 클로징

Stage 4: License / Acquire (M22-M24, 8주)
  연 라이선스 ₩30M-100M 또는 인수 ₩300M-1.5B
  법무 검토 + 데이터 이관 + 운영 권한 양도
  KPI: LOI 1건+ 또는 본 계약 1건+
```

---

## 산출물 (Sprint V3 종료 시 추가)

```
god-kkabi-guide/                          (V2에서 이어짐)
├── app/
│   ├── api/v1/                           (V3 신규, B2B API REST)
│   │   ├── builds/route.ts               (빌드 데이터)
│   │   ├── adoption-rate/route.ts        (채용률 데이터)
│   │   └── pain-points/route.ts          (Pain Point 토픽)
│   ├── api/graphql/route.ts              (V3 신규, GraphQL)
│   └── (admin-saas)/                     (V3 신규, 게임사 whitelabel)
│       ├── dashboard/page.tsx
│       └── reports/page.tsx
├── docs/sprint/05-sprint-v3/
│   ├── prd.md
│   ├── plan.md
│   ├── design.md
│   ├── cold-outreach-templates/          (Phase do 산출)
│   │   ├── linkedin-msg-1.md
│   │   ├── linkedin-msg-2.md
│   │   └── linkedin-msg-3.md
│   ├── demo-deck.md
│   ├── acquisition-package.md
│   ├── api-license-spec.md
│   ├── contracts/                        (법무 검토 후)
│   │   ├── pilot-template.md
│   │   ├── license-template.md
│   │   └── acquisition-loi-template.md
│   └── report/qa/archive
└── post-acquisition/                     (인수 클로징 시)
    └── reusable-platform-manual.md       (후속작 재활용 매뉴얼)
```

---

## 다음 단계 (V3 클로징 후)

| 시나리오 | 다음 단계 |
|---------|---------|
| 인수 클로징 | 운영자는 인수자 측 컨설팅 또는 V4 후속작 |
| 라이선스 계약 | 운영자는 사이트 계속 운영 + V4 후속작 마이그레이션 |
| Pilot 1건 + 본 계약 미달 | V3 6개월 연장 (M30까지) |
| 모두 실패 | 사업 모델 피벗 또는 사이트 매각 검토 |
