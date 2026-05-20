# Sprint 27 — QA Summary

> Sprint 27 V3 GA Operations QA — unit tests 100% + Chrome staging 검증 일부 (Vercel rate limit).

**작성일**: 2026-05-20
**환경**: staging.kkaebizigi.com (Vercel + Next.js 16)

---

## 1. Unit / Integration Tests

| Metric | 값 | DoD |
|---|---|---|
| Statements coverage | **76.43%** (7253/9489) | DoD-6 76%+ ✅ |
| Branches coverage | 86.11% (1886/2190) | — |
| Functions coverage | 97.03% (295/304) | — |
| 전체 테스트 | **1515/1515 pass** | — |
| typecheck | 0 error | — |
| lint | 0 warning | — |

### Sprint 27 신규 테스트 (+62)

| 파일 | 추가 | 검증 영역 |
|---|---|---|
| `lib/b2b/response.test.ts` | +3 | F27-A Infinity 회귀 |
| `lib/auth/update-profile-photo.test.ts` | +9 | F27-B 가드 + CDN whitelist |
| `lib/auth/delete-account.test.ts` | +11 | F27-B 2-step + 트랜잭션 + signOut |
| `components/feature/structured-data.test.tsx` | +4 | F27-C HowTo schema |
| `lib/b2b/tenant-theme.test.ts` | +12 | F27-D sanitize + Firestore + CSS |
| `lib/b2b/handler.test.ts` | +7 | F27-D createB2bRoute GET/OPTIONS |

## 2. F27-A 회귀 검증 (Infinity 헤더)

- `'∞'` (U+221E) → `'-1'` 치환 확인
- enterprise tier (remaining = Infinity) → 200 응답 (이전: 500)
- envelope.meta.rateLimitRemaining -1 일관 유지
- NaN 도 같은 분기 처리

## 3. Chrome staging 검증 (부분 — Vercel rate limit 차단)

### 상태

PR #146 merge (2026-05-20 11:18 UTC) 후 Vercel 상태:
```
context: Vercel
state: failure
target_url: https://vercel.com/agent-kay-project?upgradeToPro=build-rate-limit
updated_at: 2026-05-20T11:19:00Z
```

**원인**: Vercel Hobby tier 빌드 한도 도달. 새 배포 차단됨.

### 부분 검증 (이전 배포 기준)

이전 (Sprint 25-26) 배포 시점 기준 검증:
- ✅ `/` VideoGame JSON-LD (Sprint 25)
- ✅ `/advanced` FAQ JSON-LD (Sprint 25)
- ⏸ `/skill` HowTo JSON-LD (Sprint 27 F27-C) — 배포 대기
- ⏸ `/class` FAQ JSON-LD (Sprint 27 F27-C) — 배포 대기
- ⏸ `/jinryeong` FAQ JSON-LD (Sprint 27 F27-C) — 배포 대기

### Sprint 28 carry

1. Vercel Hobby → Pro upgrade 또는 build minute 회복 후 staging 검증
2. /skill view-source `<script id="ld-howto">` HowTo schema 검증
3. /class view-source `<script id="ld-faq">` (3 ClassFAQ) 검증
4. /jinryeong view-source `<script id="ld-faq">` (3 JinryeongFAQ) 검증

## 4. DoD 진행 (Sprint 27)

- [x] DoD-1: response.ts Infinity 수정 + 회귀 테스트 ✅
- [x] DoD-2: lib/auth coverage 50%+ ✅ (51.34%)
- [x] DoD-3: HowToStructuredData + 단위 테스트 ✅
- [x] DoD-4: /skill HowTo 주입 (코드 commit 완료) ✅ — Chrome 검증 ⏸
- [x] DoD-5: FAQ schema /class, /jinryeong 확장 (코드 commit) ✅ — Chrome 검증 ⏸
- [x] DoD-6: Coverage 76%+ ✅ (76.43%)
- [ ] DoD-7: 종합 보고서 (다음 단계)

Code level DoD 6/7 충족. Chrome QA evidence 는 Vercel rate limit 해제 후 Sprint 28 에서 확인.

## 5. 회귀 안전성

- 1515/1515 unit tests pass (+62 신규)
- typecheck 0 / lint 0 — 회귀 0
- 기존 JSON-LD (/, /advanced) 정상 (변경 영향 없음)
