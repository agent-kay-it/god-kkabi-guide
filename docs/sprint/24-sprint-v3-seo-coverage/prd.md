# Sprint 24 PRD — V3 Stabilization (SEO + Coverage + Sentry design)

> Sprint 24 — V3 두 번째 sprint. SEO + Coverage 70% + Sentry design.

**작성일**: 2026-05-20
**Sprint**: 24 (sprint-24-v3-seo-coverage)
**Trust Level**: L4 (Full-Auto)

---

## 1. Sprint Goal

1. **SEO 강화**: sitemap.ts + 메타 태그 + structured data 확대
2. **Coverage 70%+ 도달**
3. **feature RTL 15+ 도달**
4. **Sentry 통합 design 파일 준비** (실 secrets 등록은 사용자 작업)

---

## 2. Sprint Features (4건)

| ID | Feature | 카테고리 |
|---|---|---|
| F24-A | SEO 강화 (sitemap.ts + metadata 강화 + structured data 확대) | P1 V3 |
| F24-B | Coverage 67.02% → 70%+ | P0 |
| F24-C | components/feature/ test 8 → 15+ | P1 |
| F24-D | Sentry config 파일 design (secrets 사용자 carry) | P0 V3 |

### 보류 (Sprint 25+ carry)
- F23-F CI E2E 실 결과 (외부 queue)
- 운영자 입력 UI (users.ownedJinryeong)
- 시뮬레이터 placeholder 45 메타 검증
- S3 cutover / GA collect 503

---

## 3. Definition of Done (DoD)

| # | Gate | Target |
|---|---|---|
| DoD-1 | sitemap.xml + robots.txt 정상 | exists |
| DoD-2 | 5+ 페이지 metadata 강화 (description / keywords / og) | 5+ |
| DoD-3 | 신규 structured data 2+ (jinryeong / simulator / coupon) | 2+ |
| DoD-4 | Coverage lines 70%+ | 70% |
| DoD-5 | components/feature/ test 15+ | 15+ |
| DoD-6 | sentry config 파일 + 정책 문서 | exists |
| DoD-7 | Chrome QA sitemap.xml + robots.txt + meta 검증 | exists |
| DoD-8 | Sprint 24 종합 보고서 | exists |
| DoD-9 | Sprint 25 carry items | 명세 |

---

## 4. KPI

```json
{
  "tokenBudget": 3500000,
  "phaseTimeoutHours": 360,
  "minMatchRate": 90,
  "expectedPRs": 7,
  "expectedNewTests": 100,
  "targetCoverageLines": 70
}
```
