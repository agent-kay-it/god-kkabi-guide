# Sprint 27 — Design

> 기술 설계 — V3 GA Operations 4 features.

**작성일**: 2026-05-20

---

## 1. F27-A — response.ts Infinity 헤더 수정

### 1.1 Root cause

```typescript
// 현재:
'X-RateLimit-Remaining': Number.isFinite(remaining) ? String(remaining) : '∞',
```

`'∞'` 는 U+221E (multi-byte UTF-8). Fetch API spec 의 Headers Map 은 ByteString 만 허용 → NextResponse.json 에서 throw.

### 1.2 수정 후

```typescript
// 수정:
// remaining = Infinity → '-1' (관례: -1 = 무제한)
'X-RateLimit-Remaining': Number.isFinite(remaining) ? String(remaining) : '-1',
```

### 1.3 envelope 일관성

`b2bOk` 의 body envelope.meta:
```typescript
rateLimitRemaining: Number.isFinite(auth.remaining) ? auth.remaining : -1,
```
(이미 -1 — 헤더와 일치 유지).

### 1.4 클라이언트 호환성

- B2B 클라이언트 SDK 가 `-1` 을 "무제한" 으로 해석하도록 docs/05-policy/slo-policy.md §4.5 추가 (Sprint 28 carry 가 아닌 본 sprint 에서 함께).

---

## 2. F27-B — lib/auth Server Action 통합 테스트

### 2.1 update-profile-photo.ts 패턴

```typescript
// lib/auth/update-profile-photo.test.ts
vi.mock('@/lib/auth/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: () => mockFirestore,
  hasAdminCredentials: () => true,
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// 시나리오:
// - UNAUTHENTICATED / NOT_REGISTERED / BANNED 가드
// - Zod URL 검증
// - Firestore set merge
// - revalidatePath
```

### 2.2 update-profile.ts 패턴

복잡한 시나리오:
- 닉네임 변경 시 30일 cooldown 검증
- gameUid unique 재검증 (다른 사용자가 같은 uid 등록 차단)
- Firestore transaction (users 업데이트 + servers/munpas 카운트 조정)

핵심 8-10 케이스만 우선 cover (전 분기 100% 는 Sprint 28+).

### 2.3 delete-account.ts 패턴

시나리오:
- 가드 (UNAUTH / BANNED)
- Firestore delete (users/{uid} + nicknameLocks/{uid} + munpas 카운트 감소)
- Firebase Admin Auth deleteUser
- revalidatePath 다중

---

## 3. F27-C — HowTo + FAQ schema 확장

### 3.1 HowToStructuredData 신규

```typescript
// components/feature/structured-data.tsx 추가
export interface HowToStep {
  readonly name: string;
  readonly text: string;
  readonly url?: string;
}

export function HowToStructuredData({
  name,
  description,
  steps,
}: {
  readonly name: string;
  readonly description: string;
  readonly steps: readonly HowToStep[];
}): React.JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  };
  return <JsonLdScript id="ld-howto" payload={data} />;
}
```

### 3.2 /skill 페이지 적용

```tsx
<HowToStructuredData
  name="갓깨비 키우기 스킬 운영 가이드"
  description="직업별 스킬 31종을 코어/액티브/패시브로 분류하여 운영"
  steps={[
    {
      name: '코어 스킬 1개 선택',
      text: '각 직업의 코어 스킬 1개를 메인 딜링 축으로 설정. 전사: 천탈창경 / 검객: 운소검경 / 영매: 핵심 스킬.',
    },
    {
      name: '액티브 스킬 3-4개 배치',
      text: '코어와 시너지 좋은 액티브 3-4개를 부 딜링 라인업으로 구성.',
    },
    {
      name: '패시브 스킬 4-5개 강화',
      text: '오도과로 패시브 품급을 향상시켜 효과 강화.',
    },
    {
      name: '스킬 트리 정착',
      text: '메타 변경 시 초기화 환급으로 새 스킬에 자원 재투자.',
    },
    {
      name: '진령 시너지 반영',
      text: '/jinryeong 페이지의 진영 시너지 매트릭스를 보고 스킬 조합 최종 조정.',
    },
  ]}
/>
```

### 3.3 /class FAQ 확장

3 직업 Q&A:
- Q: "전사는 어떤 강점이 있나요?" / A: "직접 타격 + 천탈창경 코어. 안정적 DPS."
- Q: "검객 추천 진령은?" / A: "검객은 광역 + 단일 모두 강함. 0티어 진령 호환."
- Q: "영매의 운영 방식은?" / A: "원거리 + 디버프 위주. 보조 진령과 시너지."

### 3.4 /jinryeong FAQ 확장

3 진영 Q&A:
- Q: "신 진영의 특징은?" / A: "음영귀, 명왕 등. 강력한 단일 + 천상 효과."
- Q: "요 진영 추천 조합은?" / A: "서해용왕 + 구미요호. 어둠+속성 시너지."
- Q: "인 진영의 운영은?" / A: "홍길동, 항아 등. 안정적 DPS + 균형 잡힌 효과."

---

## 4. 의존성 / 위험

| 항목 | 위험도 | 대응 |
|---|---|---|
| FAQ schema Google 위반 | Medium | 페이지 가시 콘텐츠와 1:1 매칭 + 명확한 Q&A 구조 |
| lib/auth Server Action 복잡 mock | Medium | Sprint 25 admin.test.ts + Sprint 26 update-owned-jinryeong.test.ts 패턴 재사용 |
| response.ts Infinity 수정 → 클라이언트 호환 | Low | -1 만 사용 (X-RateLimit-Remaining 표준 패턴) |

---

## 5. 통합 테스트

전체 Sprint 27 완료 시:
- typecheck/lint/test 0 fail
- Coverage 76%+
- /skill view-source `<script id="ld-howto">` 확인
- /class, /jinryeong view-source `<script id="ld-faq">` 확인
