# Sprint 26 — PRD (V3 GA Readiness — Sentry + 운영자 입력 + Admin QA)

> Sprint 26 V3 GA 본 단계 진입 — Sentry 실 통합 + 운영자 입력 UI + admin Chrome QA.

**작성일**: 2026-05-20
**작성자**: kay@agentkay.it (Sprint 25 carry-forward 기반)

---

## 1. 배경

Sprint 25에서 V3 GA Readiness 70% 임계점(Coverage 70%+) 돌파. 이제 GA 본 단계로 진입하기 위한 운영 인프라(에러 추적)와 사용자 입력 UI 완성이 필요.

Sprint 24에서 design 단계만 완료된 Sentry SLO 정책을 Sprint 26에서 실 통합으로 전환. Sprint 23에서 design 단계만 완료된 `users.ownedJinryeong` 필드를 운영자 입력 UI로 구현해서 recommendBuilds Sprint V3 GA 완성.

---

## 2. Goal & Non-Goal

### 2.1 Goal

- **G1**: Sentry 실 통합 — `@sentry/nextjs` 설치 + `sentry.client.config.ts` + `sentry.server.config.ts` + `sentry.edge.config.ts` + 실제 에러 캡처 검증
- **G2**: 운영자 입력 UI — `/me` 페이지에 진령 11종 토글 + Firestore `users.ownedJinryeong` 저장 + recommendBuilds 와 연동
- **G3**: Coverage 70.86% → 73%+ — 저커버리지 모듈(lib/auth / lib/b2b / lib/post) 추가 테스트
- **G4**: admin/* Chrome QA — Sprint 24 carry, 7+ admin 페이지 view-source + 인증 흐름 검증

### 2.2 Non-Goal

- Sentry 알람 정책 운영 (별도 Sprint 27+ 검토 후 도입)
- 진령 입력 UI 외 추가 운영자 필드 (서버 ID, 직업 등은 기존 흐름 유지)
- Coverage 80%+ 목표 (V3 GA 1차 75% 목표는 Sprint 27)
- admin SaaS B2B 페이지 — Sprint 27 별도

---

## 3. 사용자 시나리오

### Scenario A — 운영자가 보유 진령 등록 (G2)

1. 사용자가 로그인 + 등록 완료 상태로 `/me` 진입
2. "보유 진령" 섹션에서 진령 11종 카드(체크박스) 노출
3. 보유 진령 토글 → Server Action `updateOwnedJinryeong(uids[])` 호출
4. Firestore `users/{uid}.ownedJinryeong` 배열 업데이트
5. `/simulator` 진입 시 `getUserOwnedJinryeong()` 가 실제 데이터 반환 → 추천 빌드의 `missingFromOwned` 정확 계산

### Scenario B — 운영 중 에러 자동 추적 (G1)

1. production/staging 에서 server action 또는 client 에서 예외 발생
2. Sentry SDK 가 자동 캡처 → Sentry dashboard 에 trace 노출
3. `lib/observability/slo.ts` 의 SLO_THRESHOLDS 와 alarm 정책 연동 가능

---

## 4. 성공 기준

- **DoD-1**: Sentry 통합 완료 — `@sentry/nextjs` 설치, 3개 config 파일 작성, SENTRY_DSN env 설정
- **DoD-2**: Sentry 실 에러 캡처 검증 — `/api/dev/throw-test` (dev only) 또는 Sentry test event로 확인
- **DoD-3**: /me 진령 토글 UI 동작 — 11종 모두 토글 가능, Firestore 저장 확인
- **DoD-4**: recommendBuilds 와 통합 — ownedJinryeong 변경 시 추천 결과 변동 확인
- **DoD-5**: Coverage 70.86% → 73%+ (벡터 lib/auth + lib/b2b 또는 lib/post)
- **DoD-6**: admin/* Chrome QA — 5+ admin 페이지 status code 200 + metadata 확인
- **DoD-7**: 종합 보고서 + Sprint 27 carry

---

## 5. 위험 / 의존성

- **R1**: `@sentry/nextjs` 패키지가 Next.js 16 + Turbopack 호환성 — 공식 docs 확인 필요
- **R2**: SENTRY_DSN secret 관리 — tene env 활용
- **R3**: Firestore users 컬렉션 schema 호환성 — 기존 필드 보존 확인
- **R4**: admin Chrome QA 인증 — agent-kay-it@gmail.com 등 admin 사용자 로그인 필요

---

## 6. 측정 지표

- Coverage Lines: 70.86% → 73%+ (3+ pt 증가)
- Sentry 캡처 가능 에러 종류: 0 → 3+ (client/server/edge)
- 신규 admin 페이지 Chrome QA: 0 → 5+
- 신규 테스트: +30+ unit/integration

---

## 7. 참고

- Sprint 24 design.md §3 Sentry SLO 4 Golden Signals
- Sprint 23 design.md §F23-A recommendBuilds + users.ownedJinryeong
- Sprint 25 report.md §6 carry items
- @sentry/nextjs 공식 문서 (Next 16 호환 가이드)
