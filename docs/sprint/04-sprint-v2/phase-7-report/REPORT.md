# Sprint V2 종합 보고서 — 메타 인사이트 + NLP + 프리미엄 + i18n

> **종료일**: 2026-05-15
> **시작일**: 2026-05-15 (단일 세션 L4 자동 모드 압축 실행)
> **결과**: Match Rate **93.5%** / 7-Layer **8/8 + 1 infra** / Quality Gates **13/15** Pass / Critical **0** / Major **0** / Build & TypeScript **clean**

---

## §1. 스코프 + 결과 요약

### 7 신규 features

| ID | 이름 | 범위 | 상태 | 충실도 |
|----|------|------|:----:|------:|
| F3.1 | 빌드 시뮬레이터 | 진령 3선 + 시너지 + 결과 기록 + GA4 | ✅ | 95% |
| F3.2 | 진령 채용률 차트 | 주간 cron + recharts BarChart + posts+simulator_runs 통합 | ✅ | 100% |
| F3.3 | PvP 빌드 트렌드 | 주간 cron + 결투장 빌드 카테고리 + recharts | ✅ | 100% |
| F3.4 | 쿠폰 자동 검증 | submit + admin verify + 만료 정책 + GA4 | ✅ | 100% |
| F3.5 | Pain Point NLP | LLM 미사용, 정규식 + 키워드 사전 + 빈도 클러스터링 + BatchedWriter | ✅ | 95% |
| F3.6 | 프리미엄 구독 | Toss Payments + 멱등성 트랜잭션 + webhook signature hex+base64 양쪽 + funnel 5 GA4 | ✅ | 97% |
| F3.7 | i18n JP/EN 인프라 | next-intl + 3 locales 메시지 + LocaleSwitcher + cookie | ⚠️ infra | 40% |

### V1 Carry-over 6건

| ID | 이름 | 상태 |
|----|------|:----:|
| GAP-M3 | post_edit_audits + listPending admin flow | ✅ |
| CA-M1 | wiki valid IDs cache + validateTagMembership | ✅ |
| CA-m1 | rehype img domain whitelist | ✅ |
| CA-m2 | Server Action try/catch 표준화 (8/8 핵심) | ⚠️ 잔여 ~20 carry |
| CA-m3 | reaction chunked queries (≤30) | ✅ |
| CA-m4 | bookmark count 통합 | ✅ |

---

## §2. KPI 추적 시작

V2 design.md §11.1 KPI **달성 측정 시작 시점** = production 배포 후 7일.

| KPI | Target | 측정 방법 | 측정 시작 |
|-----|--------|----------|----------|
| MAU | 50,000 → 80,000 (Q3) | GA4 active_users | production 배포 D+7 |
| Premium 전환율 | ≥1% (등록 사용자 대비) | subscriptions/users (GA4 premium_subscribe) | D+30 |
| AdSense ARPU | $0.15 (KR) | GA4 ad_impression + payout | D+30 |
| F3.5 NLP 효용 | weekly pain_topics 10+ verified | admin manual review | D+14 |
| F3.6 Toss 결제 성공률 | ≥95% (성공/시도) | payment_success/payment_select | D+14 |
| Lighthouse Mobile | ≥85 | production CDN 측정 | D+1 (P8 게이트) |

---

## §3. PDCA Phase 흐름 요약

| Phase | 활동 | commit | 결과 |
|-------|------|-------|------|
| P0 | V1 archive 확정 + V2 state 등록 | (V1 c2dc9a9) | V1 94.5% 종료 → V2 시작 |
| P1 | MASTER-PLAN + PRD + plan 통합 | 6934f2a | scope 확정 |
| P2 | design.md + phase-2-design 7건 | 6934f2a | carry-over 정책 + Firestore 신규 6 컬렉션 |
| P3.A | Carry-over 6건 | 90579d9 | GAP-M3 + CA-M1 + CA-m1~m4 |
| P3.B | F3.1 시뮬레이터 + F3.2 채용률 | 48c850c | recharts 3.8 도입 |
| P3.C | F3.3 PvP + F3.4 쿠폰 | b38e3de | admin verify flow |
| P3.D | F3.5 NLP | 10fcfe0 | LLM 회피 → 정규식 + matchAll |
| P3.E | F3.6 프리미엄 | 89998b0 | Toss Payments 인프라 |
| P3.F | F3.7 i18n | db9935c | next-intl + 3 locales (마이그 운영자 게이트) |
| P4 | Check | cbf1796 | Match Rate 87.5% + Critical 3 + Major 2 |
| P5 | Act iterate | 159aacc | Critical 3 + Major 1 + Minor 5 처리 → 91.5% |
| P6 | QA gap-detector 재실행 | 09cc53d | GAP-P6-MAJ-1 추가 발견 + 즉시 처리 → **93.5%** |
| P7 | Report (본 문서) | — | KPI + V3 carry 인풋 정리 |
| P8 | Archive + tag | — | sprint state 종료 |

---

## §4. 신규 도입 기술 / 패턴

### 패턴 1 — 결제 멱등성 (P5 CA2-C1+C3)

```typescript
// lib/subscription/actions.ts
const histRef = db.collection('payment_history').doc(input.orderId);
await db.runTransaction(async (tx) => {
  const histSnap = await tx.get(histRef);
  if (histSnap.exists) {
    const existingHist = histSnap.data() as { subscriptionId?: string };
    if (existingHist.subscriptionId) {
      subscriptionIdResult = existingHist.subscriptionId;
      return;
    }
  }
  // 정상 경로: Toss confirm + subscriptions + payment_history merge + users.tier
});
```

**핵심**:
- `payment_history` doc id = `orderId` (Firestore auto-id 미사용)
- `runTransaction` + `histSnap.exists` 체크 — race-free
- webhook + success page 양쪽이 동일 orderId로 충돌 안전

### 패턴 2 — webhook signature 다중 포맷 (P5 CA2-C2)

```typescript
// lib/subscription/toss-client.ts
const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
const sigBytes = new Uint8Array(sigBuf);
const expectedHex = Array.from(sigBytes).map(b => b.toString(16).padStart(2, '0')).join('');
const expectedBase64 = Buffer.from(sigBytes).toString('base64');
return (
  timingSafeStringEq(signature, expectedHex) ||
  timingSafeStringEq(signature, expectedBase64)
);
```

**핵심**: Toss 콘솔 설정에 따라 hex/base64 변동 → 양쪽 timing-safe 비교.

### 패턴 3 — Firestore BatchedWriter (P5 CA2-I5)

```typescript
// lib/nlp/aggregate.ts
function makeBatchedWriter(db) {
  let batch = db.batch();
  let count = 0;
  let chain = Promise.resolve();
  return {
    add: (refPath, data) => {
      batch.set(db.doc(refPath), data);
      if (++count >= 450) {
        const toCommit = batch;
        batch = db.batch();
        count = 0;
        chain = chain.then(() => toCommit.commit().then(() => undefined));
      }
      return chain;
    },
    flush: () => { /* ... */ },
  };
}
```

**핵심**: Firestore Admin SDK batch 500 op 한계 → 450 안전 여유 + chained Promise로 backpressure.

### 패턴 4 — shouldShowAds 5-가드 (P6 GAP-P6-MAJ-1)

```typescript
// lib/subscription/guards.ts
export function shouldShowAds(session): { show: boolean; reason?: AdsBlockReason } {
  if (!session?.user) return { show: false, reason: 'anonymous' };
  if (session.user.role === 'banned') return { show: false, reason: 'banned' };
  if (session.user.role === 'admin') return { show: false, reason: 'admin' };
  if (isPremium(session)) return { show: false, reason: 'premium' };
  if (!session.user.advertisingConsent) return { show: false, reason: 'no_consent' };
  return { show: true };
}
```

**핵심**: 5단계 분기 + AdsBlockReason export → log/analytics 활용.

---

## §5. V3 carry 인풋 (B2B 매각 자산 패키징)

### 우선순위 1 — V3 신규 features

| ID | 이름 | 출발점 |
|----|------|--------|
| V3-F1 | Premium MRR 자동 갱신 cron | F3.6 Toss billing key 인프라 활용 |
| V3-F2 | i18n 페이지 마이그레이션 | F3.7 next-intl 인프라 → `app/*` → `app/[locale]/*` 전체 |
| V3-F3 | NLP 보강 — LLM 옵션 | F3.5 정규식 사전 → Anthropic Haiku 4.5 backend (비용 가드 + 캐시) |
| V3-F4 | B2B 데이터 export | BigQuery + V3 매각 자산 (Joy Nice Games / 4399 / Kakao 협의) |
| V3-F5 | Premium 추가 feature | 다중 북마크 무제한 + 우선 모더레이션 + 시뮬레이션 영구 보관 |

### 우선순위 2 — V2 잔여 작업 carry

| ID | 항목 | 영향 |
|----|------|------|
| GAP-P6-IMP-1 | success page client 전환 또는 confirm fast-path | UX 노이즈 |
| CA2-I8 | LocaleSwitcher cookie `Secure; SameSite=Lax` | M14 게이트 |
| CA2-I7 | success page email env 변수화 | env hygiene |
| CA2-I10 | Toss SDK 중복 삽입 가드 | reliability |
| CA2-I11 | setUserClaims retry queue | reliability |
| CA-m2 잔여 | reaction/comment/bookmark catch 표준화 (~20개) | M2 carry |

### 우선순위 3 — 운영자 게이트

| ID | 항목 | 비고 |
|----|------|------|
| Op-1 | 프리미엄 가격 검증 + Toss 콘솔 운영 등록 | ₩4,900/월 |
| Op-2 | PIPA 5번째 advertising + 6번째 결제 동의 검토 | 법무 |
| Op-3 | i18n JA/EN 번역 (messages/ja.json + en.json) | 운영자 |
| Op-4 | 시뮬레이터 시너지 매트릭스 보강 (10/165 → 165) | 운영자 |
| Op-5 | NLP keyword-dict 보강 (26 → 50+) | 운영자 |

---

## §6. 학습 / 회고

### 잘 된 것 (Keep)

1. **L4 자동 모드 압축 실행** — 24주 분량 단일 세션에서 일관성 유지. Clean Architecture 4-레이어 / cva variants / Pretendard / glassmorphism 모두 일관 적용.
2. **결제 흐름 멱등성 우선 처리** — P4 Critical 3건 모두 결제 영역 → P5에서 양쪽 (트랜잭션 + webhook) 동시 처리로 race-free.
3. **NLP LLM 회피 결정** — 비용 폭증 시나리오 B 대응. 운영자 사전 보강만으로 효용 확보 가능 (V3에서 옵션 LLM).
4. **P6에서 wiring-only Major 추가 발견** — P5 코드는 작성됐으나 호출처 누락. gap-detector 재실행이 발견.

### 개선할 것 (Change)

1. **success page 흐름** — Server Component + Server Action GET-마다 호출 → log 노이즈 (데이터는 안전). V3에서 client 전환 또는 fast-path skip.
2. **i18n 페이지 마이그레이션 분리** — 인프라 + 페이지 마이그를 한 sprint에서 다 처리하기엔 단일 세션 컨텍스트 한계 → V3 carry 정상.
3. **시뮬레이터 시너지 매트릭스** — 165 조합 중 10 시드 → V3에서 운영자 입력 + UGC 데이터 기반 자동 추정 도입.

### 시도하지 않을 것 (Stop)

1. **L4 모드에서 새로운 기술 도입** — F3.6에서 Toss를 신규 도입했으나 충분히 검증된 SDK. 처음 보는 라이브러리는 P0에서 별도 검증 필요.
2. **운영자 게이트 작업 임의 처리** — 가격 정책, 번역, 시드 데이터, 법무 검토는 모두 사람 영역. AI가 임의 진행 시 비즈니스 리스크.

---

## §7. 최종 산출물 인벤토리

### 신규 파일 (P3-P6)

- `types/`: simulator.ts, insights.ts, coupon.ts, nlp.ts, subscription.ts, ga4.ts 확장
- `lib/simulator/`, `lib/insights/`, `lib/coupon/`, `lib/nlp/`, `lib/subscription/`, `i18n/`
- `app/simulator/`, `app/insights/jinryeong-rate/`, `app/insights/pvp-trend/`, `app/coupon/`, `app/admin/coupons/`, `app/admin/insights/pain/`, `app/premium/`, `app/me/subscription/`
- `app/api/cron/aggregate-jinryeong/`, `app/api/cron/aggregate-pvp/`, `app/api/cron/aggregate-pain-topics/`, `app/api/webhooks/toss/`
- `components/feature/`: simulator-canvas, jinryeong-rate-chart, coupon-submit-form, coupon-list, admin-coupon-table, premium-checkout-button, subscription-cancel-button, payment-view-tracker, payment-success-tracker, payment-drop-tracker, pain-topic-row, locale-switcher
- `messages/ko.json`, `ja.json`, `en.json`
- `vercel.json` (crons)

### 수정 파일

- `firestore.rules` — simulator_runs + jinryeong_stats + pvp_stats + coupons + subscriptions + payment_history + pain_topics + pain_mentions 신규 8 컬렉션
- `firestore.indexes.json` — posts(status, updatedAt) + post_edit_audits 등
- `types/next-auth.d.ts` — Session.user.tier
- `lib/auth/auth.ts` + `lib/auth/config.ts` — tier hydrate

### 종료 문서

- `docs/sprint/04-sprint-v2/MASTER-PLAN.md`
- `docs/sprint/04-sprint-v2/prd.md`
- `docs/sprint/04-sprint-v2/design.md`
- `docs/sprint/04-sprint-v2/plan.md`
- `docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md` (+ 6 sub-docs)
- `docs/sprint/04-sprint-v2/phase-3-do/P3.F-OPERATOR-GATES.md`
- `docs/sprint/04-sprint-v2/phase-4-check/REPORT.md`
- `docs/sprint/04-sprint-v2/phase-6-qa/REPORT.md`
- `docs/sprint/04-sprint-v2/phase-7-report/REPORT.md` (본 문서)

---

## §8. P8 Archive 진입 조건

- ✅ Match Rate ≥90% (93.5%)
- ✅ 7-Layer ≥7/8 (8/8 + 1 infra)
- ✅ Quality Gates ≥11/15 (13/15)
- ✅ Critical 0
- ✅ Major 0
- ✅ pnpm typecheck clean
- ✅ pnpm build clean
- ✅ V3 carry 항목 정리

**모두 충족** → Sprint V2 종료 가능. tag `v2.0.0-v2-archived`로 진입.
