# Sprint 18 Design — 기술 구현 가이드

> Sprint 18 PRD + Plan 의 feature 구현 시 따라야 할 기술적 표준.

**작성일**: 2026-05-19
**의존**: prd.md, plan.md

---

## 1. F18-A — vitest config coverage scope 확장

### 1.1 변경 전

```typescript
coverage: {
  include: ['lib/**/*.ts', 'hooks/**/*.ts'],
  // components/ 미포함
}
```

### 1.2 변경 후

```typescript
coverage: {
  include: ['lib/**/*.ts', 'hooks/**/*.ts', 'components/**/*.tsx'],
  exclude: [
    'lib/**/*.test.ts',
    'lib/**/__tests__/**',
    'hooks/**/*.test.ts',
    'components/**/*.test.tsx',
    'components/**/__tests__/**',
    'lib/**/*.d.ts',
    'components/**/*.d.ts',
    'lib/firebase/admin.ts',
  ],
}
```

### 1.3 thresholds 보수적 조정

```typescript
thresholds: {
  lines: 25,       // 25 baseline (Sprint 17)
  branches: 80,    // 87 from Sprint 17
  functions: 85,   // 92 from Sprint 17
  statements: 25,
}
```

Sprint 18+ 에서 점진 강화.

---

## 2. F18-B — playwright.config webServer 조건 (이미 적용)

### 2.1 변경 후

```typescript
// BASE_URL 이 localhost 이면 항상 webServer 기동 (CI/local 동일).
const SHOULD_START_WEB_SERVER = BASE_URL.startsWith('http://localhost');
```

### 2.2 효과

- CI 환경 + `E2E_BASE_URL=http://localhost:3000` 시 webServer 자동 기동
- CI 환경 + staging URL 시 webServer 미기동 (deployed 사용)
- Local dev 동작 유지 (변경 없음)

---

## 3. F18-D — 시너지 매트릭스 30+ seed 작성 기준

### 3.1 11 진령 목록 (lib/simulator/synergy-matrix.ts 의 J)

| ID | 이름 |
|---|---|
| hongGildong | 홍길동 |
| seohaeyongwang | 서해용왕 |
| eumyeonggwi | 음명귀 |
| myeongwang | 명왕 |
| chiwoo | 치우 |
| hangah | 항아 |
| gyeoktugwi | 격투귀 |
| gumiyoho | 구미요호 |
| taeyangyeosin | 태양여신 |
| gunggwi | 궁귀 |
| sansin | 산신 |

### 3.2 30 조합 선정 기준

| 직업 | 갯수 | 우선순위 |
|---|---|---|
| warrior (전사) | 8 | PvP / 결투장 / 탱커 |
| swordsman (검객) | 8 | PvE / 자동사냥 / 단일딜 |
| medium (영매) | 8 | 힐러 / 광역 / 디버프 |
| balanced | 6 | 무직업 시 가장 안전 |

각 진령의 effect 설명 + 직업 호환성 + 게임 메타 기반 score (50-95) 부여.

### 3.3 회귀 보호

기존 11 seed 의 score 유지 (변경 X). 새 seed 만 추가.

---

## 4. F18-E — simulator a11y 패턴

### 4.1 진령 카드 (선택 가능)

```tsx
<button
  type="button"
  role="checkbox"  // toggle role
  aria-pressed={isSelected}
  aria-label={`${jinryeong.name} ${isSelected ? '선택됨' : '선택 안 됨'}`}
  onClick={() => toggle(jinryeong.id)}
  onKeyDown={(e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle(jinryeong.id);
    }
  }}
  tabIndex={0}
>
  ...
</button>
```

### 4.2 결과 영역

```tsx
<div aria-live="polite" aria-atomic="true">
  {selected.length === 3 ? (
    <p>시너지 점수 {synergy.score}점, {tier} 등급, 추천 {className}</p>
  ) : null}
</div>
```

### 4.3 회귀 보호

기존 click 동작 + 디자인 유지.

---

## 5. F18-G — components/ RTL 테스트 패턴

### 5.1 file convention

`components/{path}/{name}.tsx` → `components/{path}/{name}.test.tsx`

### 5.2 표준 imports

```tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ComponentName } from './component-name';

afterEach(() => {
  cleanup();
});
```

### 5.3 file 디렉티브

```tsx
// @vitest-environment jsdom
```

### 5.4 assertion 우선순위

1. `screen.getByRole(...)` (a11y 부합)
2. `screen.getByText(...)`
3. `container.firstElementChild.className.contains(...)`

---

## 6. F18-H — 진령 채용률 차트 첫 구현

### 6.1 데이터 소스

- `lib/insights/jinryeong-rate.ts` (이미 존재)
- Firestore `jinryeong_stats/{weekISO_jinryeongId_className?}` weekly docs
- `aggregateJinryeongWeek()` cron 으로 누적

### 6.2 chart library 선정

본 sprint 에서는 **의존성 추가 없이 SVG 직접 작성** — 다음 이유:
- bundle size 영향 0
- 단순 horizontal bar chart 로 충분
- 향후 chart library 도입 시 마이그레이션 용이

### 6.3 컴포넌트 구조

```tsx
// components/feature/jinryeong-rate-chart.tsx (이미 존재 — 점검)

import type { JinryeongRateRow } from '@/types/insights';

export interface JinryeongRateChartProps {
  readonly rows: readonly JinryeongRateRow[];
  readonly title?: string;
}

export function JinryeongRateChart({
  rows,
  title = '진령 채용률 (지난 주)',
}: JinryeongRateChartProps): React.JSX.Element {
  if (rows.length === 0) return <p>데이터 부족</p>;

  const maxRate = Math.max(...rows.map((r) => r.rate));
  return (
    <section>
      <h2>{title}</h2>
      <ul role="list">
        {rows.map((row) => (
          <li key={row.jinryeongId}>
            <span>{row.jinryeongId}</span>
            <svg width="200" height="20" role="presentation">
              <rect
                x="0" y="0"
                width={(row.rate / maxRate) * 200}
                height="20"
                fill="currentColor"
              />
            </svg>
            <span>{row.rate.toFixed(1)}%</span>
            {row.deltaRank !== null ? (
              <span>{row.deltaRank > 0 ? '↑' : row.deltaRank < 0 ? '↓' : '='}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### 6.4 단위 테스트

- 빈 rows → "데이터 부족" 표시
- 1+ rows → SVG bar 렌더링
- delta 표시 분기 (↑/↓/=)
- 최대값 정규화 (maxRate 기준)

---

## 7. 공통 규칙

### 7.1 typecheck / lint

- 모든 PR 머지 전 `pnpm typecheck && pnpm lint` 통과
- 0 errors

### 7.2 commit message

- 형식: `feat(F18-X): {description}` 또는 `docs(F18-X)`, `test(F18-X)`
- file-based heredoc 사용

### 7.3 PR 명명

- branch: `feature/sprint-18-{a~h}-{slug}`
- title: `feat(F18-X): {description}`
- base: `staging`
