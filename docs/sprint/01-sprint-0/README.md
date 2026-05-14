# Sprint 0 — R.A.T. (Riskiest Assumption Test)

> **Sprint ID**: `god-kkabi-guide-sprint-0`
> 기간: 1-2일 (2026-05-15 ~ 2026-05-17)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.1, §5.1
> 입력: `docs/01-pm/05-decisions.md` D3 결정

---

## 한 줄 결론

**"MVP→V3까지 추가 마이그레이션 없이 V3 B2B 패키지 3종을 수용 가능한 Firestore 6 컬렉션 스키마인지, 가상 V3 리포트 3종 작성을 통해 역방향 검증한다."**

---

## 왜 Sprint 0인가 (R.A.T. 근거)

| 항목 | 내용 |
|------|------|
| **검증 가설** | D5 (Discovery §Step 3, I=5 R=5 가장 위험한 가정) — "MVP의 데이터 스키마가 V3 B2B 패키지(분기 리포트 / 이탈 시그널 SaaS / 후속작 리서치)까지 추가 마이그레이션 없이 수용 가능" |
| **실패 결과** | MVP 진입 후 데이터 마이그레이션 비용 발생 → V3 자체 무산 → ₩300M-1.5B 인수 가능성 소실 |
| **검증 비용** | 1-2일 × 0원 (운영자 직접 작성 또는 AI 보조) |
| **성공 시 가치** | MVP 첫 줄 코드부터 V3에 직접 활용되는 데이터 누적 → 22개월 후 B2B 영업 시 즉시 데모 자료로 활용 |

---

## 산출물 4종

| 파일 | 목적 |
|------|------|
| `prd.md` | Sprint 0 PRD — 가상 리포트 3종 정의 + 스키마 매핑 검증 기준 |
| `plan.md` | 4 Phase 단축 사이클 WBS (plan → do → check → archive) |
| `design.md` | 가상 리포트 3종 구조 + Firestore 6 컬렉션 매핑표 설계 |
| `sprint-0-virtual-reports/` | 실제 가상 리포트 3종 + schema-validation.md (Phase do 산출) |

---

## 진입 게이트

- [x] PM Agent Team 5종 산출물 작성 완료 (00~04)
- [x] 운영자 결정 4건 기록 완료 (05-decisions.md)
- [x] 본 Plan §10 사전 준비 사항 8개 카테고리 운영자 확인

## 졸업 게이트 (PASS 조건)

- [ ] 가상 리포트 3종 작성 완료 (Markdown)
- [ ] `schema-validation.md` 매핑표 작성 완료
- [ ] **각 리포트의 데이터 필드 100%가 MVP Firestore 6 컬렉션으로 도출 가능**
- [ ] 운영자 수동 게이트 (L3 Trust) — 검증 결과 승인

**FAIL 시 액션**: 누락된 필드/컬렉션 식별 → MVP Firestore 스키마 수정 → Sprint 0 재진입 (또는 V3 패키지 스코프 축소).

---

## 다음 Sprint

Sprint 0 PASS 시 → [Sprint MVP](../02-sprint-mvp/README.md) Phase plan 진입.
