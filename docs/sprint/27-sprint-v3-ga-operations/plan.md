# Sprint 27 — Plan

> V3 GA Operations — 4 features F27-A..D 순차 진행.

**작성일**: 2026-05-20

---

## 1. Feature 분할

| ID | 제목 | 우선순위 | 추정 PR |
|---|---|---|---|
| F27-A | response.ts Infinity 헤더 버그 수정 | P0 | 1 |
| F27-B | lib/auth coverage 50%+ | P1 | 1-2 |
| F27-C | HowTo schema + FAQ 확장 | P1 | 1 |
| F27-D | Coverage 76%+ (누적) | P1 | 검증 PR |

---

## 2. F27-A — response.ts Infinity 헤더 버그 수정

### 현 상태
```typescript
'X-RateLimit-Remaining': Number.isFinite(remaining) ? String(remaining) : '∞',
```
`'∞'` (U+221E)는 ASCII가 아니라 NextResponse.json 의 headers Map 에 들어갈 때 ByteString 변환 실패.

### 수정
```typescript
'X-RateLimit-Remaining': Number.isFinite(remaining) ? String(remaining) : '-1',
```
`-1` = "무제한" 의미. body envelope.meta.rateLimitRemaining 도 `-1`.

### 회귀 테스트
- enterprise tier (remaining = Infinity) → 200 응답 + headers['X-RateLimit-Remaining'] = '-1'
- body.meta.rateLimitRemaining = -1
- 기존 finite 값 동작 회귀 없음

### Deliverable
- lib/b2b/response.ts 1-line 수정
- lib/b2b/response.test.ts Infinity 케이스 복원 + 추가 케이스

---

## 3. F27-B — lib/auth coverage 50%+

### 대상
- `lib/auth/update-profile-photo.ts` (2.8KB, 작아서 우선)
- `lib/auth/update-profile.ts` (9.7KB)
- `lib/auth/delete-account.ts` (6KB)

### 전략
- Sprint 25 패턴 재사용 (firebase-admin/app 등 mock + auth() mock)
- 가드(UNAUTH/BANNED/NOT_REGISTERED) + Zod + Firestore 시나리오 분기

### 신규 테스트
- update-profile-photo.test.ts (~10 tests)
- update-profile.test.ts (~12 tests)
- delete-account.test.ts (~10 tests)

총 +30+ tests.

---

## 4. F27-C — HowTo schema + FAQ 확장

### HowToStructuredData 신규
- `components/feature/structured-data.tsx` 에 `HowToStructuredData` export 추가
- Schema: `@type: HowTo` / `step: HowToStep[]`
- 적용 페이지: `/skill` (스킬 운영 원리 5 step)
- 단위 테스트: 4-5 cases

### FAQ schema 확장
- `/class` 페이지에 3 카드 Q&A → FAQ schema 주입
- `/jinryeong` 페이지에 진영 3 시너지 Q&A → FAQ schema 주입
- 페이지 실 콘텐츠와 1:1 매칭 (Google 가이드라인)

### Deliverables
- HowToStructuredData export + 5 tests
- /skill, /class, /jinryeong 페이지 JSON-LD 주입
- Chrome view-source 검증 (QA phase)

---

## 5. F27-D — Coverage 76%+ (누적 검증)

F27-A + F27-B + F27-C 누적 효과로 자동 도달 예상:
- F27-B: lib/auth +1.5pt
- F27-C: structured-data +0.5pt
- F27-A: 회귀 0pt

목표: 73.52% → **76%+** (+2.5pt+)

---

## 6. PR 흐름

| PR | Branch | Feature |
|---|---|---|
| 143 | feature/sprint-27-prd-plan-design | PRD + Plan + Design |
| 144 | feature/sprint-27-a-response-infinity-fix | F27-A |
| 145 | feature/sprint-27-b-auth-coverage | F27-B |
| 146 | feature/sprint-27-c-howto-faq-schema | F27-C |
| 147 | feature/sprint-27-d-report | Report |
| 148 | feature/sprint-27-archive | Archive |

---

## 7. 시간 추정

| Phase | 추정 |
|---|---|
| PRD/Plan/Design | 20 min |
| F27-A | 20 min |
| F27-B | 90 min |
| F27-C | 60 min |
| Iterate + Report | 30 min |
| **총** | **~3.5 hr** |
