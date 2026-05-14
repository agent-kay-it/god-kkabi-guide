# Sprint 0 Plan — 4 Phase 단축 사이클 WBS

> **Sprint ID**: `god-kkabi-guide-sprint-0`
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.1
> PRD: `docs/sprint/01-sprint-0/prd.md`

---

## 1. 단축 4 Phase 시퀀스

표준 8 Phase가 아닌 단축 4 Phase를 적용한다(plan → do → check → archive). `design`/`act`/`qa`/`report` 단계는 본 Sprint의 본질(가상 문서 검증)에 불필요하므로 생략.

```
Phase 1: plan      (0.25일)  → R.A.T. 가설 명문화 + 리포트 outline 작성
Phase 2: do        (1.0일)   → 가상 리포트 3종 + schema-validation.md 작성
Phase 3: check     (0.25일)  → 매핑 PASS/FAIL 자가 검증
Phase 4: archive   (0.1일)   → .bkit/state 기록 + L3 운영자 게이트 + MVP 진입
```

**총 1-2일 (실 작업 시간 8-16시간, 운영자 시간 가용성에 따라 분할 가능)**

---

## 2. Phase 1: plan (0.25일 / 2시간)

### 2.1 산출물

- [x] `prd.md` (이미 완성)
- [ ] `design.md` 초안 (가상 리포트 3종 구조 + Firestore 컬렉션 매핑표 템플릿)

### 2.2 WBS

| Task ID | 태스크 | Owner | Estimate | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| S0.P1.T01 | PRD §3 가상 리포트 3종 outline 확정 | 운영자 | 30분 | (없음) | `prd.md` §3 확정 |
| S0.P1.T02 | Firestore 6 컬렉션 필드 인벤토리 작성 | 운영자 + AI | 60분 | PRD §11 | `design.md` §3 |
| S0.P1.T03 | 매핑표 빈 템플릿 생성 (리포트×컬렉션 매트릭스) | AI | 30분 | T02 | `design.md` §4 |

### 2.3 Phase 1 종료 게이트

- [ ] PRD §3 가상 리포트 3종 outline 운영자 확인
- [ ] `design.md` Firestore 컬렉션 필드 인벤토리 완성
- [ ] 매핑표 빈 템플릿 준비

---

## 3. Phase 2: do (1일 / 8시간)

### 3.1 산출물

- [ ] `sprint-0-virtual-reports/report-1-meta-insight.md`
- [ ] `sprint-0-virtual-reports/report-2-churn-signal-saas.md`
- [ ] `sprint-0-virtual-reports/report-3-next-title-research.md`
- [ ] `sprint-0-virtual-reports/schema-validation.md`

### 3.2 WBS

| Task ID | 태스크 | Owner | Estimate | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| S0.P2.T01 | Report 1 메타 인사이트 가상 작성 (5-10 페이지 분량 Markdown) | 운영자 + AI | 2시간 | Phase 1 | `report-1-meta-insight.md` |
| S0.P2.T02 | Report 1 데이터 필드 명세 표 (5-10개 필드) | AI | 30분 | T01 | `report-1.md` §데이터 출처 |
| S0.P2.T03 | Report 2 이탈 시그널 SaaS 가상 작성 (주간 알람 + 대시보드 Mock) | 운영자 + AI | 2시간 | Phase 1 | `report-2-churn-signal-saas.md` |
| S0.P2.T04 | Report 2 데이터 필드 명세 표 | AI | 30분 | T03 | `report-2.md` §데이터 출처 |
| S0.P2.T05 | Report 3 후속작 리서치 가상 작성 (50 페이지 outline) | 운영자 + AI | 2시간 | Phase 1 | `report-3-next-title-research.md` |
| S0.P2.T06 | Report 3 데이터 필드 명세 표 | AI | 30분 | T05 | `report-3.md` §데이터 출처 |
| S0.P2.T07 | schema-validation.md 매핑표 작성 (3종 × 6 컬렉션) | AI | 60분 | T02, T04, T06 | `schema-validation.md` |

### 3.3 Phase 2 종료 게이트

- [ ] 가상 리포트 3종 Markdown 작성 완료
- [ ] 데이터 필드 명세 표 3종 작성 완료
- [ ] schema-validation.md 매핑표 완성 (PASS/FAIL 컬럼 채워짐)

---

## 4. Phase 3: check (0.25일 / 2시간)

### 4.1 산출물

- [ ] `check-report.md` (자가 검증 결과 보고서)

### 4.2 WBS

| Task ID | 태스크 | Owner | Estimate | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| S0.P3.T01 | 매핑표 PASS/FAIL 자가 검증 (리포트별) | 운영자 | 60분 | Phase 2 | `check-report.md` §1 |
| S0.P3.T02 | FAIL 항목 식별 + 보강 컬렉션/필드 제안 | AI | 30분 | T01 | `check-report.md` §2 |
| S0.P3.T03 | 운영자 검토 코멘트 추가 | 운영자 | 30분 | T02 | `check-report.md` §3 |

### 4.3 Phase 3 종료 게이트

- [ ] 매핑표 100% PASS 또는 보강 컬렉션 식별 완료
- [ ] 운영자 검토 코멘트 작성

**FAIL 분기 액션** (매핑 누락 시):
1. 누락 필드 → MVP Firestore 스키마(`docs/sprint/02-sprint-mvp/design.md` §데이터 스키마)에 추가
2. 추가 컬렉션 검토 → 비용/복잡도 평가
3. 보강 완료 후 Sprint 0 Phase 2.T07 재실행

---

## 5. Phase 4: archive (0.1일 / 1시간)

### 5.1 산출물

- [ ] `.bkit/state/sprints/god-kkabi-guide-sprint-0.json` (Sprint 상태 기록)
- [ ] 운영자 수동 승인 (L3 Trust 게이트)

### 5.2 WBS

| Task ID | 태스크 | Owner | Estimate | Dependencies | Output |
|---------|------|-------|---------|------------|--------|
| S0.P4.T01 | Sprint 상태 JSON 작성 (PASS 여부 + 시작/종료 시각) | AI | 15분 | Phase 3 | `.bkit/state/sprints/...json` |
| S0.P4.T02 | Sprint 0 회고 메모 (1 페이지) | 운영자 | 30분 | T01 | `archive-notes.md` |
| S0.P4.T03 | 운영자 수동 승인 (L3 Trust) | 운영자 | 15분 | T02 | `/sprint phase ... --to archive` |
| S0.P4.T04 | MVP Sprint 진입 신호 | 운영자 | 즉시 | T03 | `/sprint init god-kkabi-guide-sprint-mvp` |

### 5.3 Phase 4 종료 게이트 (Sprint 0 종료 = MVP 진입)

- [ ] `.bkit/state/sprints/god-kkabi-guide-sprint-0.json` 작성됨
- [ ] 운영자 승인 (L3 Trust)
- [ ] Sprint MVP Phase plan 진입 가능 상태

---

## 6. 4 Auto-Pause Triggers 적용

Sprint 0에서 활성화되는 Auto-Pause Triggers:

| Trigger | 조건 | 적용 여부 |
|---------|------|--------|
| QUALITY_GATE_FAIL | Phase 3 매핑 검증 FAIL | ✅ 활성 (Phase 3 → 2 재진입) |
| ITERATION_EXHAUSTED | Phase 2 재작성 3회 이상 | ✅ 활성 (운영자 보고) |
| BUDGET_EXCEEDED | ₩0 한도 초과 | ❌ N/A (Sprint 0 비용 ₩0) |
| PHASE_TIMEOUT | Phase 1개당 2배 시간 초과 (Phase 2 = 16시간 초과) | ✅ 활성 (운영자 시간 가용성 재평가) |

---

## 7. 운영자 수동 게이트 (L3 Trust)

다음 시점에서 운영자 직접 결정 필요:

| 시점 | 결정 |
|------|------|
| Phase 1 → Phase 2 진입 | outline 합의 후 작성 시작 승인 |
| Phase 2 → Phase 3 진입 | 가상 리포트 3종 완성 확인 |
| Phase 3 → Phase 4 진입 | 매핑 PASS/FAIL 최종 판단 |
| Phase 4 → MVP 진입 | Sprint 0 PASS 승인 (`/sprint phase ... --to archive`) |

---

## 8. 이슈 발생 시 컨틴전시

| 이슈 | 컨틴전시 |
|------|-------|
| 가상 리포트 작성 1일 초과 | AI 보조 비중 ↑, 운영자 검토만 수행 |
| 매핑 80-99% PASS | 누락 필드 1-2개 보강 후 PASS (Phase 2.T07 재실행) |
| 매핑 <80% PASS | MVP 스키마 전면 재설계 → Sprint 0 1주일 연장 |
| 운영자 시간 부족 | Phase 2 작업을 2일에 걸쳐 분할 |

---

## 9. 다음 Phase 인터페이스

Sprint 0 archive 완료 시 다음 산출물이 Sprint MVP에 전달된다:

- `sprint-0-virtual-reports/schema-validation.md` → Sprint MVP `design.md` §데이터 스키마 직접 인용
- `.bkit/state/sprints/god-kkabi-guide-sprint-0.json` → Sprint MVP plan 입력
- 운영자 회고 메모 → Sprint MVP Phase plan 리스크 인식

> **Status**: Draft v1.0 — pending review.
