# Sprint 27 — PRD (V3 GA Operations)

> Sprint 27 V3 GA 운영 단계 — 버그 수정 + lib/auth 보강 + HowTo/FAQ 확장.

**작성일**: 2026-05-20
**작성자**: kay@agentkay.it (Sprint 26 carry-forward 기반)

---

## 1. 배경

Sprint 26 에서 V3 GA Readiness 본 단계 완료 (Coverage 73.52% / Sentry 실 통합 / 운영자 입력 UI). Sprint 27 은 운영 단계 안정성 향상에 집중:

- F26-C 에서 발견된 `lib/b2b/response.ts` Infinity headers 버그 수정 (P0)
- lib/auth (33.29%) 핵심 server actions 통합 테스트 보강
- Sprint 25 carry 신규 schema (HowTo + FAQ 확장)

SENTRY_DSN production 등록 + Sentry dashboard 알람 운영은 사용자 명시 action 이 필요하므로 본 Sprint 에서는 docs 만 제공, 실 등록은 사용자 작업.

---

## 2. Goal & Non-Goal

### Goal

- **G1**: `lib/b2b/response.ts` Infinity remaining → '-1' 치환 + 회귀 테스트
- **G2**: lib/auth coverage 33.29% → 50%+ (update-profile / delete-account / update-profile-photo)
- **G3**: HowTo schema 신규 + FAQ schema 확장 (/class, /jinryeong)
- **G4**: Coverage 73.52% → 76%+

### Non-Goal

- SENTRY_DSN production 실 등록 (사용자 action — docs 만 제공)
- Sentry dashboard 알람 규칙 운영 (사용자 dashboard action)
- Coverage 80%+ (Sprint 28+ 목표)
- B2B API 핵심 endpoint 통합 테스트 (Sprint 28 별도)

---

## 3. 사용자 시나리오

### Scenario A — Infinity headers 버그 수정 (G1)

1. Enterprise tier 사용자 B2B API 호출 → ratelimit Infinite
2. 이전: `'∞'` 헤더 → NextResponse ByteString 실패 → 500 에러
3. 수정 후: `'-1'` 헤더 → 정상 응답 + body envelope.meta.rateLimitRemaining = -1

### Scenario B — HowTo schema (G3)

1. Google 검색 "갓깨비 스킬 운영" → /skill 페이지가 HowTo rich result 후보로 노출
2. View-source `<script id="ld-howto" type="application/ld+json">` 정상
3. Steps 가 실제 페이지 콘텐츠와 1:1 매칭 (Google 가이드라인)

---

## 4. 성공 기준 (DoD)

- **DoD-1**: response.ts Infinity 버그 수정 + 회귀 테스트 통과
- **DoD-2**: lib/auth coverage 50%+ (현 33.29% → 50%+)
- **DoD-3**: HowToStructuredData 컴포넌트 신규 + 단위 테스트
- **DoD-4**: /skill 페이지에 HowTo 주입 + Chrome view-source 검증
- **DoD-5**: FAQ schema /class, /jinryeong 확장
- **DoD-6**: Coverage 73.52% → 76%+
- **DoD-7**: 종합 보고서 + Sprint 28 carry

---

## 5. 위험 / 의존성

- **R1**: HowTo schema는 페이지 실 콘텐츠와 1:1 매칭 필요 — Google 가이드라인 위반 시 페널티
- **R2**: lib/auth server actions 는 NextAuth + Firestore admin SDK 의존 — 복잡한 mock 필요
- **R3**: response.ts 수정이 기존 B2B 클라이언트 호환성 영향 — '-1' = '무제한' 의미로 문서화 필요

---

## 6. 측정 지표

- Coverage Lines: 73.52% → 76%+ (2.48pt+ 증가)
- 신규 structured data 종류: 5 → 6 (HowTo 추가)
- 신규 FAQ 적용 페이지: 1 (/advanced) → 3 (+/class, /jinryeong)
- 신규 테스트: +40+

---

## 7. 참고

- Sprint 26 report.md §4 carry items
- Sprint 25 design.md F25-C JSON-LD 패턴
- @sentry/nextjs production deployment guide (Sprint 28 carry)
