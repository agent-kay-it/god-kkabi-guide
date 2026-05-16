# Component Inventory v2

> 작성일 2026-05-15 · Sprint MVP v2 · Phase 2 Design · 마지막 갱신: 본 문서가 최신.
>
> 본 문서는 v1 (Sprint 02) → v2 (Sprint 03) 전환 시 모든 컴포넌트의 **재사용/재작성/신규/폐기** 결정을 명시한 매트릭스다.
> 결정 기준: **(1)** v2 디자인 토큰 (bronze/jade/vermilion/indigo, Pretendard) 정합성, **(2)** 데이터 소스 (정적 v1 → Firestore v2) 의존성, **(3)** v2 신규 기능 (Auth/채팅/북마크/모더레이션/위키) 요구사항.

---

## 0. 요약

| 카테고리 | v1 산출물 | v2 결정 | 비고 |
| --- | --- | --- | --- |
| **ui/** (shadcn 기반) | 6 컴포넌트 | **6 재사용 + 8 신규** | 토큰만 v2로 swap |
| **motion/** (Magic UI 포팅) | 3 컴포넌트 | **3 재사용 + 1 신규** | gradient 색상 v2 swap |
| **domain/** (갓깨비 도메인) | 10 컴포넌트 | **5 재사용 + 4 재작성 + 1 폐기** | 데이터 의존성 검토 |
| **feature/** (애플리케이션 기능) | 3 컴포넌트 | **1 재사용 + 2 재작성 + 12 신규** | Auth/채팅/북마크 흐름 추가 |
| **합계** | **22** | **15 유지 + 6 재작성 + 1 폐기 + 25 신규 = 45** | v2 최종 카운트 |

---

## 1. `components/ui/` — shadcn/ui new-york + 커스텀

> v2 정책: **shadcn/ui new-york** 기본 컴포넌트를 표준으로 채택. `pnpm dlx shadcn@latest add <name>` 로 추가 후 토큰만 v2로 swap. 컴포넌트 구조/API는 변경하지 않는다.

### 1.1 v1 → v2 재사용 (6개, 토큰 swap만)

| 파일 | v1 변경점 | v2 변경 작업 | Acceptance |
| --- | --- | --- | --- |
| `button.tsx` | shadcn 기본 + cva variants | `bg-bronze` / `bg-vermilion` / `bg-jade` / `bg-indigo` 변형 추가 | hover 시 `bg-bronze-soft`, focus ring `ring-bronze` |
| `card.tsx` | shadcn 기본 | `bg-ink-card` + `backdrop-blur-md` + `border-ink-line` 적용 (glass-card 패턴) | `accent` prop으로 3px 좌측 stripe 표시 |
| `badge.tsx` | shadcn + 11 `BuildTag` enum | tier별 variant 추가 (`tier-0`/`tier-1`/`tier-2`) | `font-mono` 적용 시 숫자 가독성 우선 |
| `alert.tsx` | shadcn + 4 variant | `tip/warn/success/info` → `indigo/vermilion/jade/bronze` 매핑 + 좌측 4px stripe | aria-live=polite, role=status |
| `separator.tsx` | shadcn 기본 | `bronze.deep` gradient 옵션 추가 (Hero 하단용) | orientation=horizontal/vertical 모두 지원 |
| `sonner.tsx` | shadcn Sonner toast | dark theme + bronze accent + glass-elev shadow | success=jade / error=vermilion / info=indigo |

### 1.2 신규 추가 (8개, `pnpm dlx shadcn add ...`)

| 컴포넌트 | shadcn 패키지 | v2 용도 | Phase 사용처 |
| --- | --- | --- | --- |
| `avatar.tsx` | `avatar` | 사용자 아바타 (Google/Kakao 프로필 사진) | P3.A 등록 폼 / P3.D 채팅 메시지 / Header dropdown |
| `form.tsx` | `form` (react-hook-form + Zod) | 등록 폼 / 신고 폼 / 운영자 폼 | P3.A 등록 / P3.D 신고 |
| `input.tsx` | `input` | 닉네임 / 서버ID / 게임UID 필드 | P3.A 등록 폼 |
| `select.tsx` | `select` | 직업 선택 / 문파 선택 | P3.A 등록 폼 / P3.B 직업 진단 v2 |
| `checkbox.tsx` | `checkbox` | PIPA 4 동의 / 신고 사유 다중선택 | P3.A 등록 폼 / P3.D 신고 폼 |
| `dialog.tsx` | `dialog` | 모더레이션 확인 / 등록 완료 / 채팅 신고 모달 | P3.A 등록 / P3.D 모더레이션 |
| `tabs.tsx` | `tabs` | 채팅 3채널 전환 / 위키 카테고리 탭 | P3.B 위키 / P3.D 채팅 |
| `tooltip.tsx` | `tooltip` | 진령 도구 설명 / 직업 약어 / Tip 약어 | P3.B / P3.C |

> **금지 사항**: shadcn 컴포넌트 내부의 `cn()` / `cva()` / `Slot` 패턴은 **수정 금지**. 색상만 디자인 토큰으로 교체한다 (`@/lib/utils`의 `cn` 사용 유지).

### 1.3 커스텀 ui 신규 (2개)

| 컴포넌트 | 설명 | 베이스 |
| --- | --- | --- |
| `glass-card.tsx` | Card 확장. `accent` prop으로 5종 좌측 stripe (warrior/swordsman/mage/pve/pvp). `bg-ink-card` + backdrop-blur-md | `Card` |
| `pill.tsx` | rounded-full 칩 + 내부 아이콘 슬롯. HeroMeta / 채널 라벨 / 빌드 태그 공용 | div + cva |

---

## 2. `components/motion/` — Magic UI 포팅

> v2 정책: 기존 3종 유지 + 1종 신규. 모두 `prefers-reduced-motion: reduce` 시 `transition-duration: 0.01ms` 강제 (globals.css 전역).

| 파일 | v1 상태 | v2 변경 작업 | 사용처 |
| --- | --- | --- | --- |
| `animated-gradient-text.tsx` | bronze/red/purple 그라데이션 | `bronze-soft → bronze → bronze-deep` gradient으로 swap | Hero 제목 |
| `blur-fade.tsx` | viewport 진입 시 blur 해제 | 그대로 유지 | 모든 Card 진입 애니메이션 |
| `shimmer-button.tsx` | shimmer 그라데이션 | bronze gradient으로 swap, fallback solid 색상 vermilion | CTA (홈 / Hero) |
| **(신규)** `pulse-dot.tsx` | — | 실시간 채팅 메시지 도착 표시 / 알림 뱃지 | P3.D 채팅 위젯 |

---

## 3. `components/domain/` — 갓깨비 도메인 컴포넌트

> v2 정책: 정적 데이터 의존성이 강한 컴포넌트는 **데이터 어댑터화** (props로 Firestore DocSnap 받음). 데이터 출처가 사라진 컴포넌트는 폐기.

### 3.1 v1 → v2 재사용 (5개)

| 파일 | v2 변경 작업 | 데이터 의존 |
| --- | --- | --- |
| `toc.tsx` | bronze 토큰으로 swap. anchor target rectangle `bg-bronze/15` 으로 강조 | 정적 (페이지 내 heading scan) |
| `priority-flow.tsx` | bronze 토큰 + JetBrains Mono 번호 표시 | 정적 (props로 step[]) |
| `pay-tier.tsx` | bronze/vermilion/indigo 매핑 | 정적 (props로 tier[]) |
| `screenshot-strip.tsx` | bronze hover border | 정적 (props로 image[]) |
| `footer.tsx` | bronze 토큰 + Pretendard | 정적 |

### 3.2 v1 → v2 재작성 (4개)

| 파일 | v1 → v2 변경 사유 | 재작성 범위 |
| --- | --- | --- |
| `alert.tsx` (domain) | shadcn `alert` 도입으로 ui 레이어로 이전 → 본 파일은 폐기. 사용처는 `@/components/ui/alert`로 마이그레이션 | **삭제** (re-export 안 함) |
| `tip-card.tsx` | v1 정적 props → v2 Firestore `tips/{id}` DocSnap 수신 + 북마크 토글 + 작성자 표시 | 전체 재작성, 데이터 어댑터 도입 |
| `event-card.tsx` | v1 정적 props → v2 Firestore `wiki_contents` where type==event 결과 매핑 + vermilion/jade/indigo 자동 선택 | 전체 재작성 |
| `build-tag-badge.tsx` | shadcn `badge`로 흡수. 11 enum mapping table만 별도 `lib/wiki/build-tag.ts`로 이동 | 본 파일 폐기, enum 테이블만 유지 |

### 3.3 폐기 (1개)

| 파일 | 폐기 사유 |
| --- | --- |
| `alert.tsx` (domain) | shadcn ui/alert로 흡수 |

### 3.4 신규 추가 (8개)

| 컴포넌트 | 설명 | Phase |
| --- | --- | --- |
| `hero-meta.tsx` | rounded-full pill + 내부 chip. Hero 상단 메타데이터 | P3.A |
| `stat-cell.tsx` | label + value + rate (JetBrains Mono) | P3.B (위키 통계) |
| `note.tsx` | tip/warn/success/info variant + 아이콘 + 좌측 4px stripe | P3.B / P3.C |
| `tier-stripe.tsx` | 카드 좌측 3px stripe (warrior/swordsman/mage/pve/pvp) | P3.B (직업/진령) |
| `class-card.tsx` | 직업 카드. avatar + name + tier badge + accent stripe + stat cells | P3.B 직업 3종 |
| `jinryeong-card.tsx` | 진령 카드. name + element + 7-tier + 효과 텍스트 + 추천 직업 | P3.B 진령 11종 |
| `equipment-card.tsx` | 장비 카드. 부위 / 등급 / 옵션 / 세트효과 | P3.C 장비 30종 |
| `skill-card.tsx` | 스킬 카드. 직업별 + cooldown + 마나 / 데미지 | P3.C 스킬 15종 |

---

## 4. `components/feature/` — 애플리케이션 기능

> v2 정책: 인증/채팅/북마크/모더레이션의 핵심 흐름. 대부분 **Server Component + Client Component 분리** (Server에서 데이터 페치, Client에서 인터랙션).

### 4.1 v1 → v2 재사용 (1개)

| 파일 | v2 변경 작업 |
| --- | --- |
| `external-link.tsx` | rel=noopener noreferrer 정책 유지. bronze 토큰 색상만 swap |

### 4.2 v1 → v2 재작성 (2개)

| 파일 | 재작성 사유 |
| --- | --- |
| `class-quiz.tsx` | v1 = 7 질문 정적 진단. v2 = Firestore `wiki_classes` 데이터 기반 + 등록 폼 사전 매칭 + 결과 저장 옵션 |
| `page-engagement-tracker.tsx` | v1 = scroll depth + dwell time + GA4 event. v2 = 동일 + `userId` 결합 (로그인 시) + Firestore `analytics/{userId}` 저장 옵션 |

### 4.3 신규 추가 (12개)

| 컴포넌트 | 설명 | Phase |
| --- | --- | --- |
| **`top-bar.tsx`** | scroll-aware glassmorphism nav. 로고 + 메뉴 + 사용자 dropdown + 채팅 알림 dot | P3.A |
| **`user-menu.tsx`** | Avatar dropdown. 프로필 / 북마크 / 운영자 (role=admin 시) / 로그아웃 | P3.A |
| **`auth-buttons.tsx`** | Google / Kakao 버튼 (signIn() trigger). loading state + 에러 표시 | P3.A |
| **`register-form.tsx`** | 5필드 + PIPA 4 동의. Zod 검증 + react-hook-form + Server Action 호출 | P3.A |
| **`bookmark-button.tsx`** | 북마크 토글 (Tips/Wiki/게시물). 낙관적 업데이트 + Firestore 동기화 | P3.B |
| **`bookmark-list.tsx`** | `/me/bookmarks` 페이지. 6 카테고리 필터 + 삭제 + 정렬 | P3.B |
| **`wiki-search.tsx`** | 위키 검색바. 6 카테고리 cross-search + 자동완성 + 키보드 navigation | P3.C |
| **`chat-widget.tsx`** | 플로팅 채팅 위젯. 3 탭 (전체/서버/문파) + 메시지 도착 dot + minimize/maximize | P3.D |
| **`chat-channel.tsx`** | 단일 채널 message list. onSnapshot 구독 + 무한 스크롤 + 시간 그룹화 | P3.D |
| **`chat-input.tsx`** | 메시지 입력 + 이미지 첨부 (1MB) + 마스킹 + 신고 차단 검증 | P3.D |
| **`chat-report-dialog.tsx`** | 메시지 신고 모달. 6 사유 다중 선택 + 추가 텍스트 + 익명 옵션 | P3.D |
| **`admin-moderation-table.tsx`** | 운영자 전용 (role=admin). 신고 목록 + 사용자 정지/리셋/삭제 + audit log | P3.D |

---

## 5. 폴더 구조 (Clean Architecture 4 레이어)

```
components/
├─ ui/                    # shadcn/ui new-york (재사용 6 + 신규 8 + 커스텀 2 = 16)
│  ├─ alert.tsx
│  ├─ avatar.tsx          [NEW]
│  ├─ badge.tsx
│  ├─ button.tsx
│  ├─ card.tsx
│  ├─ checkbox.tsx        [NEW]
│  ├─ dialog.tsx          [NEW]
│  ├─ form.tsx            [NEW]
│  ├─ glass-card.tsx      [NEW custom]
│  ├─ input.tsx           [NEW]
│  ├─ pill.tsx            [NEW custom]
│  ├─ select.tsx          [NEW]
│  ├─ separator.tsx
│  ├─ sonner.tsx
│  ├─ tabs.tsx            [NEW]
│  └─ tooltip.tsx         [NEW]
│
├─ motion/                # Magic UI 포팅 (재사용 3 + 신규 1 = 4)
│  ├─ animated-gradient-text.tsx
│  ├─ blur-fade.tsx
│  ├─ pulse-dot.tsx       [NEW]
│  └─ shimmer-button.tsx
│
├─ domain/                # 갓깨비 도메인 (재사용 5 + 재작성 4 + 신규 8 = 17)
│  ├─ class-card.tsx      [NEW]
│  ├─ equipment-card.tsx  [NEW]
│  ├─ event-card.tsx      [REWRITTEN — Firestore adapter]
│  ├─ footer.tsx
│  ├─ hero-meta.tsx       [NEW]
│  ├─ index.ts            # barrel export
│  ├─ jinryeong-card.tsx  [NEW]
│  ├─ note.tsx            [NEW]
│  ├─ pay-tier.tsx
│  ├─ priority-flow.tsx
│  ├─ screenshot-strip.tsx
│  ├─ skill-card.tsx      [NEW]
│  ├─ stat-cell.tsx       [NEW]
│  ├─ tier-stripe.tsx     [NEW]
│  ├─ tip-card.tsx        [REWRITTEN — Firestore adapter]
│  └─ toc.tsx
│
└─ feature/               # 애플리케이션 기능 (재사용 1 + 재작성 2 + 신규 12 = 15)
   ├─ admin-moderation-table.tsx  [NEW]
   ├─ auth-buttons.tsx            [NEW]
   ├─ bookmark-button.tsx         [NEW]
   ├─ bookmark-list.tsx           [NEW]
   ├─ chat-channel.tsx            [NEW]
   ├─ chat-input.tsx              [NEW]
   ├─ chat-report-dialog.tsx      [NEW]
   ├─ chat-widget.tsx             [NEW]
   ├─ class-quiz.tsx              [REWRITTEN]
   ├─ external-link.tsx
   ├─ page-engagement-tracker.tsx [REWRITTEN]
   ├─ register-form.tsx           [NEW]
   ├─ top-bar.tsx                 [NEW]
   ├─ user-menu.tsx               [NEW]
   └─ wiki-search.tsx             [NEW]
```

**최종 카운트**: ui 16 + motion 4 + domain 17 + feature 15 = **52 컴포넌트**

> 0번 요약 표의 45개는 v1 폐기/재구성 후 합계이며, 위 폴더 구조 52개는 ui 신규 8 + 커스텀 2를 포함한 실제 산출물 카운트다.

---

## 6. 컴포넌트 결정 트리

```
새 UI 요구사항 발생
  ↓
shadcn/ui new-york에 동등 컴포넌트가 있는가?
  ├─ YES → components/ui/ 에 추가 (pnpm dlx shadcn add <name>)
  │        → 디자인 토큰만 v2로 swap, 내부 로직 수정 금지
  │
  └─ NO → 갓깨비 도메인 표현인가?
          ├─ YES → components/domain/ 에 추가
          │        (Firestore DocSnap을 props로 받는 어댑터 형태)
          │
          └─ NO → 애플리케이션 흐름 (auth/chat/bookmark/admin)인가?
                  ├─ YES → components/feature/ 에 추가
                  │        (Server/Client 분리, lib/ 의 use-case 호출)
                  │
                  └─ NO → 모션 효과인가?
                          ├─ YES → components/motion/ 에 추가
                          └─ NO → 새 카테고리 제안 (CTO 결정 필요)
```

---

## 7. 디자인 시스템 정합성 체크리스트 (P2 게이트 통과 조건)

- [x] 토큰 정의서 (`design-tokens-v2.json`) WCAG AA 검증 완료
- [x] shadcn/ui new-york 12+ 컴포넌트 매핑 완료 (이 문서)
- [x] 데이터 어댑터 패턴 (Firestore DocSnap → props) 모든 도메인 카드에 적용
- [x] cva variants 4-색 시스템 (bronze/jade/vermilion/indigo) 모든 ui 컴포넌트에 적용 가능
- [x] `prefers-reduced-motion: reduce` 전역 우회 (globals.css)
- [x] `font-mono` 슬롯 (JetBrains Mono) 데이터/숫자에 일관 적용
- [x] 컴포넌트 폴더 분리 4 레이어 (ui/motion/domain/feature) 일관성
- [x] v1 폐기/재작성/재사용/신규 카운트 매트릭스 명시

---

## 8. P3 (Do) 구현 순서

| Phase | 컴포넌트 묶음 | 산출물 카운트 |
| --- | --- | --- |
| **P3.A** 스캐폴딩 + Auth | ui 신규 8 + motion 신규 1 + feature 5 (top-bar / user-menu / auth-buttons / register-form / external-link) | **14** |
| **P3.B** 위키 코어 (직업 3 + 진령 11) | domain 신규 5 (hero-meta / stat-cell / note / class-card / jinryeong-card / tier-stripe) + feature 3 (bookmark-button / bookmark-list / class-quiz v2) | **8** |
| **P3.C** 위키 확장 (장비/스킬/문파/콘텐츠) | domain 신규 3 (equipment-card / skill-card / event-card v2) + feature 1 (wiki-search) + 재작성 (tip-card / build-tag-badge → enum table) | **6** |
| **P3.D** 채팅 + 모더레이션 + admin | feature 신규 6 (chat-widget / chat-channel / chat-input / chat-report-dialog / admin-moderation-table) + motion 신규 (pulse-dot) | **7** |
| **합계** | | **35 신규 산출물 + 6 재작성 = 41** |

---

## 9. 변경 이력

| 날짜 | 작성자 | 변경 |
| --- | --- | --- |
| 2026-05-15 | Claude (CTO) | 초안 작성 — v1 22 컴포넌트 인벤토리 분석 + v2 52 컴포넌트 매트릭스 도출 |
