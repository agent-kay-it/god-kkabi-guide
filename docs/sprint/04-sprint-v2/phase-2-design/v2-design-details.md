# Sprint V2 — Design Details (phase-2-design)

> **상위**: `docs/sprint/04-sprint-v2/design.md` (이미 719 lines, 통합 기술 설계)
> **본 문서**: phase-2-design 보강 — V1 carry-over 6건 + V2 7 features 핵심 정책 + 데이터 모델

---

## §0. Carry-over 정책 (V1 → V2)

### CA-m1: `lib/post/schema.ts` 헤더 주석 재작성

```typescript
/**
 * 게시물 입력 Zod schema — Sprint V1.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1 + types/post.ts POST_LIMITS
 *
 * 본 모듈은 'use server' 디렉티브가 없어 client/server 양쪽에서 import 가능 (form validation).
 * Server Action 파일 (lib/post/actions.ts)이 본 schema를 import하여 사용.
 */
```

### CA-m2: Server Action catch 표준 형식

```typescript
} catch (err) {
  console.error('[<module>] <action>:', err);
  return { ok: false, error: 'INTERNAL', message: err instanceof Error ? err.message : 'unknown' };
}
```

8 모듈 일괄: post/actions.ts, comment/actions.ts, reaction/actions.ts, penalty/actions.ts, moderation/actions.ts, moderation/dictionaries.ts, chat/report-action.ts, auth/register.ts

### CA-m3: `getMyReactionsForPosts` chunk 분할 방어

```typescript
const CHUNK_SIZE = 30; // Firestore in 제한
const chunks = Array.from(
  { length: Math.ceil(postIds.length / CHUNK_SIZE) },
  (_, i) => postIds.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
);
const snapsByChunk = await Promise.all(
  chunks.map((chunk) =>
    Promise.all(chunk.map((id) =>
      db.collection('posts').doc(id).collection('reactions').doc(uid).get()
    ))
  )
);
```

### CA-m4: Body Markdown 외부 이미지 정책

`rehype-sanitize` schema 보강:
```typescript
const SAFE_SCHEMA = {
  ...defaultSchema,
  protocols: { ...defaultSchema.protocols, src: ['https'] },
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), ['src', /* allowedDomains check via custom plugin */]],
  },
};
// 별도 rehype plugin으로 src 도메인 화이트리스트 (firebasestorage.googleapis.com만 허용)
```

### CA-M1: 태그 멤버십 Zod refine

```typescript
const PostInputSchema = z.object({
  // ...
  tags: z.array(z.string().regex(TAG_PREFIX_RE))
    .max(POST_LIMITS.tagsMax)
    .superRefine(async (tags, ctx) => {
      const wikiIds = await loadValidWikiIds(); // 5분 캐시
      for (const tag of tags) {
        const [prefix, id] = tag.split(':');
        if (!wikiIds[prefix]?.has(id)) {
          ctx.addIssue({ code: 'custom', message: `Unknown ${prefix}: ${id}` });
        }
      }
    }),
});
```

캐시 모듈: `lib/wiki/valid-ids-cache.ts` — 5분 TTL + class/jinryeong/skill/equipment/content/munpa Sets.

### GAP-M3: Admin pending 큐

**페이지**: `/admin/posts/pending`
**Server Actions**: `approvePendingEdit(postId)`, `rejectPendingEdit(postId)`

**데이터 흐름**:
1. 운영자 → list query: `where('status', '==', 'pending_edit')` orderBy('pendingEdit.requestedAt', 'desc')
2. Diff view: current `body` vs `pendingEdit.body` (side-by-side)
3. Approve: `pendingEdit.body → body`, `status='published'`, `pendingEdit=FieldValue.delete()`, audit log
4. Reject: `status='published'`, `pendingEdit=FieldValue.delete()`, audit log (reason)

**Firestore audit**: `post_edit_audits/{auditId}` { postId, adminUid, action: 'approve'|'reject', reason?, timestamp }

---

## §1. F3.1 빌드 시뮬레이터

### 1.1 데이터 모델

`types/simulator.ts`:
```typescript
export interface JinryeongSynergy {
  readonly comboId: string; // '{j1}_{j2}_{j3}' alpha-sorted
  readonly jinryeongIds: readonly [string, string, string];
  readonly synergyScore: number; // 0-100 (사전 정의 또는 통계)
  readonly tier: 'S' | 'A' | 'B' | 'C';
  readonly recommendedClass?: 'warrior' | 'swordsman' | 'medium';
  readonly description: string;
}

export interface SimulatorState {
  readonly selected: ReadonlyArray<string>; // max 3
  readonly classId?: 'warrior' | 'swordsman' | 'medium';
}
```

### 1.2 시너지 매트릭스

`lib/simulator/synergy-matrix.ts` — 하드코딩 시드 (Sprint V1 wiki 진령 11개 × 11 × 11 / 3! = 165 조합).

각 조합의 synergyScore + tier + recommendedClass + description은 게임 메타에 따라 운영자가 작성. V2 시작 시 ~20 핵심 조합 시드, 나머지는 점진 보강.

### 1.3 UI

`/simulator/page.tsx`:
- 진령 11 카드 그리드 (선택 토글)
- 3선 시 시너지 결과 표시 (S~C tier + score + description)
- "내 빌드로 저장" → `posts/new?prefill=simulator&combo=...`
- GA4: `simulator_run` { combo_id, tier, class_id }

`components/feature/simulator-canvas.tsx` (client component).

### 1.4 통계 모드

운영 후 1주 누적 — `simulator_runs/{runId}` Firestore 저장 (uid, comboId, classId, timestamp).
주간 채택률 → F3.2 차트와 통합.

---

## §2. F3.2 진령 채용률 차트

### 2.1 Firestore aggregation

`jinryeong_stats/weekly_{YYYY-WW}` (cron 또는 ondemand):
```typescript
{
  weekISO: '2026-W20',
  jinryeongId: 'j_xxx',
  className: 'warrior',
  count: 245,
  rank: 3,
  prevRank: 5,
  delta: +2,
}
```

집계 소스:
- `posts.tags` (예: `jinryeong:j_xxx` 포함 카운트)
- `simulator_runs.comboId` (예: 분해 후 카운트)

### 2.2 UI

`/insights/jinryeong-rate/page.tsx`:
- recharts `BarChart` + `LineChart` (rank delta)
- 직업별 필터 (전사/검객/영매)
- 주차 선택 (최근 4주)

### 2.3 cron job

`vercel.json` cron entry:
```json
{
  "crons": [{ "path": "/api/cron/aggregate-jinryeong", "schedule": "0 0 * * 1" }]
}
```

`/api/cron/aggregate-jinryeong/route.ts`: weekly aggregation Server Action.

---

## §3. F3.3 결투장 빌드 트렌드

게시물 카테고리 'build' 중 PvP 태그 (`tags: 'pvp'` 별도 추가) → 주간 직업×진령 조합 인기 순위.

`/insights/pvp-trend/page.tsx` — F3.2와 유사 패턴, source가 PvP-tagged posts.

---

## §4. F3.4 쿠폰 자동 검증

**TOS 회피**: 실 게임 쿠폰 자동 호출 X. 커뮤니티 제보 → admin 승인 워크플로.

`types/coupon.ts`:
```typescript
export interface CouponDoc {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly rewards: string;
  readonly expiresAt: number;
  readonly status: 'pending' | 'verified' | 'expired' | 'rejected';
  readonly submittedBy: string; // uid
  readonly verifiedBy?: string;
  readonly reportedAt: number;
  readonly verifiedAt?: number;
  readonly upvotes: number;
  readonly downvotes: number;
}
```

페이지: `/coupon`, `/admin/coupons` (verified 외에는 일반 비공개)
Server Actions: `submitCoupon`, `verifyCoupon` (admin), `voteCoupon` (작동 confirmed/expired)

---

## §5. F3.5 Pain Point NLP — 정규식 + 빈도

**LLM 미사용** (비용 회피).

### 5.1 키워드 사전

`lib/nlp/keyword-dict.ts`:
```typescript
export interface PainKeyword {
  readonly id: string;
  readonly term: string;
  readonly aliases: readonly string[];
  readonly category: 'bug' | 'balance' | 'monetization' | 'qol' | 'event' | 'class';
  readonly severity: 'minor' | 'major';
}
```

시드 ~50 keywords (게임 도메인 운영자 입력):
- bug: '버그', '오류', '에러', '안 됨', '튕김'...
- balance: '너프', '버프', 'OP', '약함', '강함'...
- monetization: '과금', '현질', '쿠폰', '결제', '비싸'...

### 5.2 처리

- 게시물/댓글 body → `extractPainKeywords(body)` → `{ keywordId, count }[]`
- Firestore `pain_topics/{topicId}` 주간 집계 + `pain_mentions/{mentionId}` 개별 매칭 (post/comment 참조)
- admin UI: `/admin/insights/pain` — top 키워드 + 추세 + 샘플 게시물

### 5.3 Cron

매주 월요일 00:00 KST — `/api/cron/aggregate-pain-topics`

---

## §6. F3.6 Toss Payments 프리미엄 (₩4,900/월)

### 6.1 데이터 모델

`types/subscription.ts`:
```typescript
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'pending';

export interface SubscriptionDoc {
  readonly id: string;
  readonly uid: string;
  readonly plan: 'premium_monthly';
  readonly status: SubscriptionStatus;
  readonly tossCustomerKey: string;
  readonly tossBillingKey?: string; // 자동결제용
  readonly startedAt: number;
  readonly currentPeriodStart: number;
  readonly currentPeriodEnd: number;
  readonly canceledAt?: number;
  readonly nextChargeAt?: number;
  readonly amount: number; // 4900
  readonly currency: 'KRW';
}
```

### 6.2 Server Actions

`lib/subscription/actions.ts`:
- `initiateSubscription()` → Toss 결제 widget URL
- `confirmSubscription(orderId, paymentKey, amount)` → Toss confirm API + Firestore subscriptions 생성 + setUserClaims `tier: 'premium'`
- `cancelSubscription()` → Firestore status='canceled', currentPeriodEnd까지 active 유지
- `recordPayment(orderId, paymentKey)` — webhook handler

### 6.3 Webhook

`/api/webhooks/toss/route.ts`: payment status 알림 처리.
- `payment.completed`: subscription extended
- `payment.failed`: subscription expired (3회 재시도 후)

### 6.4 UI

- `/premium/page.tsx`: 가격 + 혜택 (광고 제거 / 무제한 시뮬레이션 / 다중 북마크 / 우선 모더레이션) + "구독하기" CTA
- `/me/subscription/page.tsx`: 현재 상태 + 결제 내역 + 취소 버튼
- 상단 TopBar에 "프리미엄" 메뉴

### 6.5 권한 게이트

`session.user.tier === 'premium'` 체크 헬퍼:
- `lib/subscription/guards.ts isPremium(session)`
- AdSense 4-가드에 5번째 조건 추가: `!isPremium` (프리미엄은 광고 X)

### 6.6 운영자 게이트

1. Toss Payments 사업자 가입 (5-10일)
2. Vercel env 4건: TOSS_CLIENT_KEY, TOSS_SECRET_KEY, TOSS_WEBHOOK_SECRET, NEXT_PUBLIC_TOSS_CLIENT_KEY
3. PIPA 6번째 동의: "결제 정보 수집 동의" (이미 V1에서 5건, V2에서 1건 추가)

---

## §7. F3.7 next-intl JP/EN i18n

### 7.1 인프라

`pnpm add next-intl`

`i18n/config.ts`:
```typescript
export const locales = ['ko', 'ja', 'en'] as const;
export const defaultLocale = 'ko';
export type Locale = typeof locales[number];
```

`middleware.ts`: next-intl middleware 통합 (NextAuth 다음).

`app/[locale]/layout.tsx`: locale dynamic segment 도입 — 기존 app/* 페이지를 `app/[locale]/*`로 이동.

### 7.2 메시지 파일

- `messages/ko.json` (KO 추출 — 기존 페이지 텍스트 일괄)
- `messages/ja.json` (placeholder, 운영자 번역 게이트)
- `messages/en.json` (placeholder, 운영자 번역 게이트)

### 7.3 LocaleSwitcher

`components/feature/locale-switcher.tsx` — TopBar 우상단 드롭다운.

### 7.4 GA4

신규 이벤트 `locale_switch` { from, to }.

### 7.5 SEO

`<html lang={locale}>` + `hreflang` alternate links (next-intl 자동 처리).

### 7.6 운영자 게이트

- ja.json + en.json 번역 작성
- robots.txt + sitemap.xml locale-aware 갱신

---

## §8. V2 신규 Firestore 컬렉션 + Indexes

### 8.1 신규 컬렉션

| 컬렉션 | 용도 |
|--------|------|
| `simulator_runs` | F3.1 사용 통계 |
| `jinryeong_stats` | F3.2 weekly aggregation |
| `pvp_stats` | F3.3 weekly aggregation |
| `coupons` | F3.4 쿠폰 |
| `pain_topics` | F3.5 weekly clusters |
| `pain_mentions` | F3.5 개별 매칭 |
| `subscriptions` | F3.6 구독 |
| `payment_history` | F3.6 결제 내역 |
| `post_edit_audits` | GAP-M3 운영자 액션 감사 |

### 8.2 신규 indexes

- `posts (status=='pending_edit', pendingEdit.requestedAt desc)` — GAP-M3
- `simulator_runs (uid, timestamp desc)`
- `jinryeong_stats (weekISO, className, rank asc)`
- `coupons (status, expiresAt desc)`
- `pain_topics (weekISO, count desc)`
- `subscriptions (uid, status)`

### 8.3 Firestore Rules 확장

- `simulator_runs/{id}`: write if isOwner, read if true
- `coupons/{id}`: read if status='verified' || isAdmin, write if isRegistered (submit), update if isAdmin (verify/reject)
- `subscriptions/{id}`: read if isOwner || isAdmin, write if isOwner (initiate) || serverOnly (confirm/cancel)
- `pain_topics/{id}`: read if isAdmin only

---

## §9. V2 신규 GA4 이벤트

| 이벤트 | trigger | params |
|--------|---------|--------|
| `simulator_run` | 시뮬레이터 3선 완료 | combo_id, tier, class_id |
| `simulator_save_build` | 시뮬레이터 결과 → 게시물 작성 | combo_id, class_id |
| `coupon_submit` | 쿠폰 제보 | code |
| `coupon_verify` | admin 승인 | code |
| `pain_topic_click` | admin 인사이트 패널 클릭 | topic_id |
| `locale_switch` | 언어 변경 | from, to |
| `premium_subscribe` | 구독 시작 | amount, plan |
| `premium_cancel` | 구독 취소 | reason? |

총 V2 신규 8 이벤트. 누적 정의 26 + 8 = **34 이벤트**.

---

## §10. Quality Gates 확장 (M13-M15)

| Gate | 기준 | 검증 |
|:----:|------|------|
| M13 Payment PCI | Toss client/secret 키 분리 + webhook signature 검증 + Firestore subscriptions 무권한 쓰기 차단 | 정적 grep + Rules 검증 |
| M14 i18n Coverage | ko 100% / ja 운영자 게이트 / en 운영자 게이트 (placeholder) | messages 키 동기 확인 |
| M15 NLP Cost | LLM 미사용 + 정규식 + 빈도 — 월 추가 비용 $0 | 코드 검증 |

---

## §11. 7-Layer dataFlowIntegrity (V2 신규 8 흐름)

| Flow | 핵심 |
|------|------|
| F8 Simulator Run | client state → simulator_runs Firestore write |
| F9 Jinryeong Rate Aggregation | cron → posts/simulator_runs aggregation → jinryeong_stats |
| F10 Coupon Submit + Verify | user submit → admin verify → public list |
| F11 Pain Topic Cluster | extractPainKeywords → pain_mentions → weekly aggregation |
| F12 Toss Subscribe | initiate → Toss redirect → confirm + Firestore subscription + custom claim |
| F13 Toss Webhook | Toss event → signature verify → status update |
| F14 Locale Switch | LocaleSwitcher → middleware → /[locale]/* re-render |
| F15 Admin Pending Approve | list pending → diff view → approve/reject + audit log |
