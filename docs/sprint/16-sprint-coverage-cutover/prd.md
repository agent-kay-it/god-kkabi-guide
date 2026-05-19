# Sprint 16 — Coverage Expansion + Cutover Prep (PRD)

> Sprint 15 의 coverage baseline (12.79%) 를 단계적으로 50% 로 끌어올리고, prod-cutover
> 전 필수 항목 (Lighthouse warn fix / visual baseline capture / S3 cutover 체크리스트)
> 을 정리. 향후 prod 배포의 안전망 강화 마지막 단계.

**Sprint 명**: Coverage Expansion + Cutover Prep
**기간**: 2026-05-19 ~ 2026-06-02 (2주, phaseTimeoutHours 240)
**Trust Level**: L4 (full-auto)
**의존**: Sprint 15 archived

---

## 1. WHY

Sprint 15 가 coverage baseline (12.79%) 을 측정했지만 70% 목표 는 단일 sprint 에서 도달
불가. Sprint 16 은 **중간 목표 50%** 설정 + **lib/ 의 핵심 untested 모듈** 우선 테스트 +
prod-cutover 의 lighthouse/visual/i18n/S3 사전 정리.

핵심 목표:
- coverage lines 12.79% → **35%+** (subscription, sentry, search, reaction, wiki 등 추가)
- Lighthouse performance / best-practices warn 사전 fix
- Visual baseline 첫 capture 가이드 + CI 자동 생성 흐름
- escapeJsonLd refactor (component → lib import)
- i18n Option C (next-intl) PoC
- Storage emulator → S3 staging cutover 체크리스트

---

## 2. WHO

- **개발자 (Claude / 사용자)** — 추가 test 작성 + cutover 안전 강화
- **운영자** — prod 배포 시 신뢰도 + 회귀 자동 차단
- **End user** — a11y / perf 안정성 향상

---

## 3. SUCCESS

| 영역 | 목표 |
|---|---|
| Coverage | lines 12.79% → 35%+ (Sprint 17 에서 70% 도달) |
| Lighthouse | performance ≥ 0.8 / best-practices ≥ 0.9 actual 통과 |
| Visual | baseline 첫 capture + diff workflow 검증 |
| escapeJsonLd | component → lib import refactor + 회귀 spec |
| i18n PoC | next-intl 도입 검토 + 1 page PoC |
| S3 cutover | 체크리스트 + staging 검증 단계 |
| CI iterate | flake 사전 강화 (wait helper 활용) |

---

## 4. RISK

| Risk | 영향 | 대응 |
|---|---|---|
| Coverage 35% 도달 위해 너무 많은 test 작성 | High | high-value 모듈 우선 (subscription/sentry/reaction/search/wiki) |
| Lighthouse warn 의 build / perf 회귀 유발 | Medium | 각 fix 마다 vercel-build 검증 |
| next-intl 도입 시 SSR 라우팅 변경 | Medium | PoC 만 (1 page), 실제 마이그레이션은 Sprint 17+ |
| S3 cutover 의 production 영향 | High | 체크리스트만, 실제 cutover 는 prod 배포 시점 |
| visual baseline 첫 capture 의 stabilize 실패 | Medium | Sprint 15 F15-C 의 강화 + retries 3 |

---

## 5. SCOPE

**포함**:
- F16-A: lib/ unit test 확대 part 1 (5+ 모듈)
- F16-B: lib/ unit test 확대 part 2 (5+ 모듈)
- F16-C: escapeJsonLd refactor
- F16-D: Lighthouse / a11y best-practices warn fix
- F16-E: Visual baseline 첫 capture 자동화 가이드
- F16-F: i18n Option C (next-intl) PoC
- F16-G: Storage emulator → S3 staging cutover 체크리스트
- F16-H: CI emulator selector tuning + wait-helper 사용 확대

**제외** (Sprint 17+):
- prod 배포 자동화
- 다국어 실 번역 콘텐츠
- 결제 자동화 회귀
- Mobile native

---

## 6. ASSUMPTIONS

1. lib/ 의 high-value 모듈은 외부 의존성 (Firebase, AWS, Toss) mock 가능
2. next-intl 도입은 RSC 호환
3. visual baseline 의 첫 capture 시 stabilize() 가 일관 결과
4. Lighthouse warn 항목이 즉시 fix 가능 (구조적 변경 없이)

---

## 7. DEPENDENCIES

- `next-intl` (devDep — PoC 만)
- 기존 vitest + @vitest/coverage-v8 (Sprint 15 F15-E)
- 기존 lighthouserc.json (Sprint 15 F15-H)

---

## 8. NON-FUNCTIONAL REQUIREMENTS

- coverage lines: 12.79% → **35%+** (목표) / **30%+** (최소)
- 신규 unit test 파일: **10+**
- Lighthouse fail 시 즉시 fix (PR 별 검증)
- visual baseline의 stabilize 검증: 2회 실행 시 diff < 0.1%
