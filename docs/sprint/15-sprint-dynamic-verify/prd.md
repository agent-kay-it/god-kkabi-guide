# Sprint 15 — Dynamic Verification + Coverage + Lighthouse + Webkit (PRD)

> Sprint 14 의 정적 인프라 (53 spec + emulator + a11y + visual) 를 dynamic 검증으로
> 확정하고, 향후 prod-cutover 의 회귀 안전망을 코드 커버리지 + Lighthouse + Webkit
> matrix 로 확장.

**Sprint 명**: Dynamic Verification + Coverage + Lighthouse Integration
**기간**: 2026-05-19 ~ 2026-06-02 (2주, scope 큰 만큼 phaseTimeout 240h)
**Trust Level**: L4 (full-auto, 사용자 명시 요청 — "토큰/시간 제한 없음")
**의존**: Sprint 14 archived

---

## 1. WHY — 왜 이 Sprint 가 필요한가

Sprint 14 는 53 spec + emulator 인프라를 정적 검증으로 완비했지만, **실제 CI emulator
run 의 dynamic 결과** 는 아직 없다. Sprint 15 의 목표는:

1. **방어적 강화**: spec selector / a11y / visual 의 dynamic 안정성을 사전 강화 (CI fail 사전 방지)
2. **신규 자산 확장**: coverage / Lighthouse e2e / webkit matrix / Storage 실 업로드
3. **prod-cutover 준비도 강화**: M6 (axe critical 0) + M7 (visual diff < 1%) 의 actual 확정

---

## 2. WHO — 영향받는 사용자

- **개발자 (Claude / 사용자)** — CI 안정성 + coverage 가시화
- **운영자** — Lighthouse 자동 회귀 + prod-cutover 신뢰도
- **End user** — a11y + visual 회귀 0 보장

---

## 3. SUCCESS — 성공 정의

| 영역 | 목표 |
|---|---|
| Spec 안정성 | retries 3 후 flake < 5%, selector 견고화 |
| a11y | 홈/post/chat axe critical 0 (사전 fix 포함) |
| Visual | baseline 안정화 (font-display, RSC streaming, animation 0s 확장) |
| Webkit | webkit-mobile (iPhone 14) project CI matrix 활성화 |
| Coverage | lib/ 70%+ (vitest + c8 도입) |
| Storage e2e | presigned URL → S3 emulator → CDN 끝-끝 |
| i18n 기초 | ko-KR 단일이지만 라우팅 정책 명문화 |
| Lighthouse e2e | preview URL 자동 측정 + PR comment |
| PR 자동화 | CI 실패 시 artifact + screenshot 인라인 |
| 회귀 monitoring | spec 결과 trend chart (artifact-based) |

---

## 4. RISK — 위험 요소

| Risk | 영향 | 대응 |
|---|---|---|
| webkit-mobile 의 emulator 호환성 이슈 | Medium | webkit 의 Firebase emulator 연결 사전 검증 → 실패 시 spec skip 조건부 |
| vitest 도입으로 build 시간 증가 | Low | dev-only devDep + CI 별도 job |
| Storage emulator 의 presigned URL 미지원 | Medium | mock S3 endpoint 또는 emulator URL 직접 사용 |
| Lighthouse CI 의 LCP/CLS 임계 초과 | Medium | Sprint 12 baseline 활용, 새 임계 PR comment |
| i18n 라우팅 변경의 SSR 영향 | Low | Sprint 15 는 정책만, 구현은 Sprint 16+ |
| a11y 사전 fix 가 시각 회귀 유발 | Medium | 각 fix 마다 visual baseline 동시 갱신 |

---

## 5. SCOPE — Sprint 15 가 포함/제외

**포함**:
- F15-A: Spec selector 견고화 + retries 정책 강화
- F15-B: a11y 사전 fix (홈/post/chat) — keyboard nav, ARIA, contrast
- F15-C: Visual baseline 안정화 + 첫 capture
- F15-D: webkit-mobile project 활성화 + CI matrix
- F15-E: Coverage 측정 (vitest + c8)
- F15-F: Storage emulator + 실 업로드 e2e
- F15-G: i18n 라우팅 정책 문서화
- F15-H: Lighthouse e2e CI 통합 + PR comment
- F15-I: lib/ 의 핵심 unit test (5+ 모듈)
- F15-J: CI 실패 시 artifact + screenshot PR comment 강화

**제외** (Sprint 16+):
- prod 배포 자동화
- 다국어 (한/영) 실제 번역 콘텐츠
- 펜테스트
- A/B 테스트 인프라
- Mobile native (React Native)
- 결제 + 구독 자동화 회귀

---

## 6. ASSUMPTIONS — 가정

1. CI emulator workflow 가 안정적으로 동작 (Sprint 14 의 F14-A 의 e2e.yml 기반)
2. vitest 의 ESM/CJS 호환성이 현 프로젝트 (Next.js 16 + bundler) 와 충돌 없음
3. webkit-mobile 의 Playwright 의존성이 ubuntu-latest 에서 설치 가능
4. Lighthouse CI 의 `@lhci/cli` 가 Vercel preview URL 인식
5. Storage emulator 의 `gs://` URL 이 Playwright page 의 fetch 로 접근 가능

---

## 7. DEPENDENCIES — 외부 의존

- `vitest` + `@vitest/coverage-v8` (devDep)
- `@lhci/cli` (devDep) — Sprint 12 lighthouse-baseline 대체
- webkit Playwright runtime (이미 1.60 에 포함)
- pixelmatch + pngjs (이미 Playwright 내장)

---

## 8. NON-FUNCTIONAL REQUIREMENTS

- **테스트 실행 시간**: 53 spec + a11y + visual + coverage + lighthouse 전체 < 45분 (병렬)
- **flake rate**: < 3% (Sprint 14 의 < 5% 보다 엄격)
- **coverage**: lib/ 70%+ (Sprint 14 carry → Sprint 15 P0)
- **a11y**: 홈/post/chat critical/serious 0 (Sprint 14 의 spec → Sprint 15 의 actual)
- **visual diff**: < 1% (모든 50+ baseline)

---

## 9. STAKEHOLDER

| Role | Person | 책임 |
|---|---|---|
| Owner | kay | Sprint 승인, prod cutover 결정 |
| Tech Lead | Claude (AI) | 구현 + 검증 |
| QA | Claude (AI) + 사용자 | 시나리오 검토, bug triage |
| Operator | kay@agentkay.it | prod 배포 |
