# 빌드 시뮬레이터 점검 보고서 — Sprint 17 / F17-D

> 마스터 plan §2 F3.1 (V2 P0) 빌드 시뮬레이터의 현재 상태 + 개선 백로그.

**작성일**: 2026-05-19
**점검 대상**:
- `/simulator` 페이지 (`app/simulator/page.tsx`)
- `<SimulatorCanvas>` 클라이언트 컴포넌트 (`components/feature/simulator-canvas.tsx`)
- `lib/simulator/synergy-matrix.ts` (시너지 매트릭스 시드)
- `lib/simulator/actions.ts` (recordSimulatorRun Server Action)

---

## 1. 현재 구조

### 1.1 데이터 흐름

```
[Server Component] /simulator/page.tsx
    │ await listWikiJinryeong()  (Firestore + fallback seed)
    ▼
[Client Component] <SimulatorCanvas>
    │ useState<선택된 진령 3개>
    │ useMemo(() => getSynergy(selected))
    │ "내 빌드 저장" → /post/new?prefill=simulator&combo=...
    │ "결과 기록" → recordSimulatorRun (Firestore stats)
    │ GA4 simulator_run / simulator_save_build
    ▼
[Output]
- 시너지 점수 (0-100)
- Tier (S/A/B/C)
- 추천 직업 (warrior/swordsman/medium)
- description + note
```

### 1.2 시너지 매트릭스 시드 현황

총 **11 개** seed 정의 / 가능 조합 **165 개** = **6.67%** 데이터 커버리지.

| Score | Tier | 직업 | 갯수 |
|---|---|---|---|
| 95 | S | warrior | 1 (치우+항아+홍길동) |
| 92 | S | swordsman | 1 (격투귀+태양여신+명왕) |
| 90 | S | medium | 1 (구미요호+음명귀+산신) |
| 88 | A | warrior | 1 |
| 86, 85 | A | medium | 2 |
| 80 | A | swordsman | 1 |
| 78 | A | medium | 1 |
| 72 | B | (mixed) | 1 |
| 70 | B | (mixed) | 1 |
| 50 | B | (fallback) | default — 매칭 안 되는 모든 조합 |

### 1.3 시너지 결과 표시 (현재)

`<SimulatorCanvas>` 의 결과 영역:

1. **synergyScore** (0-100) — 단일 숫자
2. **tier badge** (S/A/B/C) — `SYNERGY_TIER_COLOR` 적용
3. **추천 직업** — 텍스트 "전사/검객/영매"
4. **description** — 한 줄 설명
5. **note** — 추가 메모 (선택적)

---

## 2. 점검 결과

### 2.1 pass 항목

- ✅ Server / Client 분리 명확
- ✅ Firestore + fallback seed 안정 (jinryeong 0 case → Note variant=warn)
- ✅ 11 진령 모두 선택 가능 (시드 데이터 완비)
- ✅ 3 선택 제한 enforce (4번째 클릭 시 무시)
- ✅ GA4 이벤트 발화 (simulator_run / simulator_save_build)
- ✅ recordSimulatorRun → Firestore 통계 누적 (F3.2 채용률 차트의 입력)
- ✅ "내 빌드 저장" CTA → /post/new?prefill 으로 깊은 연동
- ✅ Sprint 16 F16-A 의 synergy-matrix unit test 12 tests pass

### 2.2 warning 항목

- ⚠️ **시너지 데이터 커버리지 6.67%** — 165 조합 중 11 seed 만 정의
- ⚠️ **default B-tier fallback (score 50)** — 매칭 안 되는 154 조합 모두 동일 표시
- ⚠️ **결과 시각화가 텍스트 위주** — chart / visualization 없음
- ⚠️ **모바일 viewport** 미점검 (320px 너비에서 11 카드 그리드 layout)
- ⚠️ **keyboard navigation** 미점검 (tab order / Enter 토글)
- ⚠️ **a11y aria-pressed** 같은 toggle role 미적용 여부 확인 필요

### 2.3 fail 항목

- ❌ 없음 (critical 결함 없음)

---

## 3. 개선 백로그 (Sprint 18+)

### 3.1 P0 (Sprint 18 우선)

**3.1.1 시너지 매트릭스 데이터 보강**

- 현재 11 seed → 30+ 로 확대
- 운영자 (kay@agentkay.it) 의 게임 메타 입력 필요
- 우선순위: PvP 빌드 (warrior) 5+ / PvE 빌드 (swordsman) 5+ / 힐러 (medium) 5+

**3.1.2 a11y 보강**

- 진령 카드의 `aria-pressed` 추가 (toggle role 명시)
- keyboard navigation: tab으로 카드 이동 + Space/Enter 로 toggle
- 결과 영역의 aria-live=polite (3 선택 시 자동 announce)

### 3.2 P1 (Sprint 19-20)

**3.2.1 결과 시각화 강화**

- synergyScore 0-100 → progress bar (현재 숫자만)
- tier S/A/B/C 의 색상 강화 (vermilion/bronze/jade/indigo)
- "유사 조합 추천" 섹션 (현재 조합 ±5 점 차 조합 3개 표시)

**3.2.2 모바일 UX 최적화**

- 320px 너비에서 11 카드 그리드 → 2 col 또는 horizontal scroll
- 진령 선택 시 sticky bottom bar (3 선택 진행 상태 + 결과 toggle)

### 3.3 P2 (Sprint 21+)

**3.3.1 시너지 매트릭스 자동 채점**

- 현재: 11 seed 외 fallback 50 점
- 향후: ML 또는 운영자 입력 ruleset 기반 자동 score (기반 데이터 누적 후)

**3.3.2 빌드 공유 강화**

- 현재: /post/new 의 prefill
- 향후: 공유 가능한 영구 URL (`/simulator?combo=A,B,C`) — 외부 SNS 공유 가능

**3.3.3 추천 직업 다중화**

- 현재: 단일 recommendedClass
- 향후: warrior 80% / swordsman 15% / medium 5% 같은 분포 표시

---

## 4. 본 sprint 의 변경 사항

Sprint 17 / F17-D 는 **점검 + 보고서 작성**으로 한정.

- ❌ 신규 feature 추가 X (out of scope)
- ❌ 코드 변경 X
- ✅ 본 보고서 작성 → Sprint 18+ carry item 으로 이전

---

## 5. 검증 가능한 작업 (코드 변경 없이)

본 보고서로 인해 식별된 작업 중 **즉시 검증 가능** 한 것:

- Sprint 16 F16-A 의 lib/simulator/synergy-matrix unit test 12 tests pass 확인
- `getSynergy(selected)` 의 default B-tier fallback 정상 동작
- `/simulator` 페이지 로딩 + Firestore listWikiJinryeong fallback 안정

---

## 6. 결론

빌드 시뮬레이터는 **기능적으로 정상 작동** 하나, **시너지 데이터 깊이가 부족** 하여
사용자가 매번 fallback 50 점만 보게 될 가능성이 높음. Sprint 18 P0 에서
**시너지 매트릭스 30+ 보강** 이 가장 중요한 후속 작업.
