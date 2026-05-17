# Design System Audit Report

**Generated**: 2026-05-17T11:39:36.427Z
**Scanned files**: 272
**Reference**: docs/sprint/10-sprint-launch/design.md §1.3
**Exit code**: 0

## 1. 토큰 인벤토리

| 카테고리 | 정의 개수 | 사용 종류 |
|---|---|---|
| color | 36 | 38 |
| radius | 4 | 2 |
| shadow | 3 | 3 |
| duration | 8 | 6 |
| font | 2 | 3 |
| breakpoint | 6 | 0 |

**총 var()/semantic 사용**: 1608회
**고유 토큰 사용 종류**: 52

## 2. D1 — Tailwind arbitrary value 분석

### D1-A. 하드코딩 색상 (`bg-[#hex]`, `bg-[rgb(...)]`, `bg-[linear-gradient(... color ...)]`)

PASS — 하드코딩 색상 0건.

### D1-B. 일반 arbitrary (size/other) — WARN

총 276건. (font-size rem/px, 단위가 토큰 scale 밖)

| 파일 | 위치 | 값 |
|---|---|---|
| `components/domain/class-card.tsx` | L143:C38 | `520px` |
| `components/domain/class-card.tsx` | L205:C65 | `10px` |
| `components/domain/class-card.tsx` | L254:C31 | `0.72rem` |
| `components/domain/class-card.tsx` | L268:C31 | `0.72rem` |
| `components/domain/class-card.tsx` | L296:C22 | `var(--radius-card)` |
| `components/domain/class-card.tsx` | L298:C31 | `0.72rem` |
| `components/domain/class-card.tsx` | L303:C58 | `0.72rem` |
| `components/domain/content-card.tsx` | L51:C42 | `0.7rem` |
| `components/domain/content-card.tsx` | L51:C56 | `0.08em` |
| `components/domain/content-card.tsx` | L55:C57 | `0.65rem` |
| `components/domain/content-card.tsx` | L58:C47 | `0.65rem` |
| `components/domain/content-card.tsx` | L84:C23 | `0.72rem` |
| `components/domain/equipment-card.tsx` | L57:C52 | `0.65rem` |
| `components/domain/event-card.tsx` | L15:C24 | `var(--radius-card)` |
| `components/domain/event-card.tsx` | L75:C48 | `11px` |
| `components/domain/featured-jinryeong.tsx` | L51:C37 | `14px` |
| `components/domain/featured-jinryeong.tsx` | L59:C85 | `180px` |
| `components/domain/featured-jinryeong.tsx` | L72:C43 | `18px_22px_20px` |
| `components/domain/featured-jinryeong.tsx` | L74:C38 | `0.7rem` |
| `components/domain/featured-jinryeong.tsx` | L74:C62 | `0.2em` |
| `components/domain/featured-jinryeong.tsx` | L82:C22 | `1.5rem` |
| `components/domain/featured-jinryeong.tsx` | L82:C46 | `-0.01em` |
| `components/domain/featured-jinryeong.tsx` | L90:C24 | `0.7rem` |
| `components/domain/featured-jinryeong.tsx` | L96:C24 | `0.7rem` |
| `components/domain/featured-jinryeong.tsx` | L100:C47 | `0.7rem` |
| `components/domain/featured-jinryeong.tsx` | L105:C31 | `1.75` |
| `components/domain/featured-jinryeong.tsx` | L110:C58 | `0.7rem` |
| `components/domain/footer.tsx` | L47:C51 | `var(--radius-card)` |
| `components/domain/hero-app-block.tsx` | L63:C21 | `70px` |
| `components/domain/hero-app-block.tsx` | L63:C30 | `70px` |
| ... | | ... and 246 more |

## 3. D2 — 컴포넌트 계층 의존 방향

PASS — ui→feature/domain, feature→domain 역방향 0건.

## 4. D3 — 토큰 사용률

- 정의된 토큰: **59**
- 코드 내 var() + semantic utility 사용: **1608회**
- 고유 토큰 종류 사용: **52**

**고유 사용률 (Coverage)**: 88% — (정의된 토큰 중 코드/CSS에서 한 번 이상 사용된 비율의 근사치)

## 5. D4 — globals.css 외 CSS 하드코딩 색상

PASS — 외부 .css 파일에 색상 리터럴 0건.

## 6. 결론

- ERROR: **0** (D1-A 하드코딩 색상 0 + D2 역방향 0)
- WARN: **276** (D1-B 일반 arbitrary 276 + D4 CSS 색상 0)

## 7. 화이트리스트 (Sprint 11 carry)

### D1-A 화이트리스트 (rgba/gradient overlays)

12건 — Sprint 11에서 opacity modifier 패턴(`bg-ink-elev/60`)으로 이전 예정.

- `components/domain/class-card.tsx` L129: `linear-gradient(90deg,transparent_0%,transparent_42%,rgba(12,12,20,0.55)_72%,rgb`
- `components/domain/class-card.tsx` L130: `linear-gradient(270deg,transparent_0%,transparent_42%,rgba(12,12,20,0.55)_72%,rg`
- `components/domain/class-card.tsx` L134: `linear-gradient(180deg,transparent_0%,transparent_50%,rgba(12,12,20,0.55)_78%,rg`
- `components/domain/hero-meta.tsx` L25: `rgba(14,14,21,0.6)`
- `components/domain/hero-stats.tsx` L52: `rgba(14,14,21,0.7)`
- `components/domain/hero-stats.tsx` L54: `rgba(28,28,40,0.8)`
- `components/domain/tier-stack.tsx` L127: `rgba(14,14,21,0.5)`
- `components/feature/ad-slot-sticky.tsx` L46: `rgba(7,7,11,0.92)`
- `components/feature/top-bar.tsx` L76: `rgba(7,7,11,0.72)`
- `components/ui/pill.tsx` L19: `rgba(14,14,21,0.6)`
- `app/page.tsx` L265: `rgba(14,14,21,0.85)`
- `app/page.tsx` L271: `rgba(28,28,40,0.92)`

### D2 화이트리스트 (잘못 분류된 컴포넌트)

- `components/feature/admin-penalty-table.tsx` → `@/components/domain/penalty-badge` (Sprint 11: components/ui/ 이전 검토)

## 8. Carry / 후속 액션

- **Sprint 11**: 8 파일에 분산된 12 rgba/gradient overlay → CSS opacity modifier(`/60`, `/85`) 또는 `--color-ink-mask-*` 토큰화
- **Sprint 11**: penalty-badge → components/ui/penalty-badge.tsx 위치 재배치 (D2 화이트리스트 제거)
- **검토**: font-size arbitrary (`text-[0.72rem]` 등) 276건 → Tailwind text-* scale 흡수 또는 토큰 추가
