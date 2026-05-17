# Sprint 10 / Phase D — PDCA Report

**Phase**: D (Posts Enrichment — YouTube + Link Preview + Form UX)
**Status**: ✅ Completed
**Duration**: 2026-05-17 16:30 → 17:20 KST (~50분)
**Trust Level**: L4 Full-Auto (push 시점만 L3로 강등)
**PR**: [#7](https://github.com/agent-kay-it/kkaebizigi/pull/7) — squash merged
**Merge commit**: `b9301809fc7c738fae3b179c4429bcbceb13258f`

---

## 1. Tasks Completed (4/4)

| Task | Commit | 변경 | Tests |
|------|--------|------|-------|
| **#19** rehype YouTube + Link Preview plugins | `4a485a7` | 5 files (rehype-youtube-embed + rehype-link-preview + remark-autolink-bare-urls + markdown.ts 통합 + vitest config) | 26 |
| **#20** OG Preview API + SSRF defense + Firestore 캐시 | `eb47488` | 7 files (ssrf-guard + og-parser + og-preview + 캐시 rules + server-only stub) | 38 |
| **#21** YoutubeEmbed + LinkPreview 컴포넌트 | `36c7863` | 5 files (youtube-embed + link-preview + markdown-render + MarkdownView 통합) | 8 |
| **#22** post form UX (autosave + live preview + URL preview) | `6d07bb2` | 9 files (use-autosave + use-debounced-value + live-preview + url-preview-inline + og-preview API + post-form 통합) | 19 |
| **합계** | 4 commits | 26 files (신규 17 + 수정 9) | **91 pass / 0 fail** |

---

## 2. Quality Gates

| Gate | Status | Note |
|------|--------|------|
| M1 Typecheck | ✅ pass | `tsc --noEmit` 0 errors |
| M2 Lint | ✅ pass | `eslint .` 0 errors (수정 1건: setState in effect 패턴 회피) |
| M3 Unit Test | ✅ pass | vitest 91/91 (632ms duration) |
| M4 Match Rate | ⏳ pending | gap-detector 미실행 (design.md §6 vs 구현) |
| M5 Clean Architecture | ✅ pass | R1-R5 준수 (server-only 경계, lib/firebase 격리) |
| M6 Design System | ⏳ pending | 토큰 자동 감사 미실행 (Task #30) |
| M7 E2E 7-Layer | ⏳ pending | Chrome 검증 진행 중 (Task #43) |
| M8 Lighthouse | ⏳ pending | Task #31에서 측정 |
| M9 Security | ✅ pass | SSRF 25 tests + DNS rebinding 방어 + private IP 6종 차단 |
| M10 Launch Checklist | ⏳ pending | Task #9 |

---

## 3. 보안 노트 (SSRF Defense)

### 거부 케이스 (25 unit tests로 검증)
- protocol ≠ https
- IPv4 private/reserved: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `0.0.0.0/8`, `169.254.0.0/16` (link-local), `224.0.0.0/4` (multicast)
- IPv6 private/reserved: `::1` (loopback), `fc00::/7` (ULA), `fe80::/10` (link-local), `ff00::/8` (multicast)
- DNS rebinding: fetch 직전 IP 재검증 (실제 connection 시점)
- Redirect chain: 각 hop에서 재검증

### Resource limits
- timeout: 5초
- HTML body size: 2MB
- User-Agent 명시: `kkaebizigi-link-preview/1.0`

### 캐시 보안
- Firestore `linkPreviewCache/{urlHash}` — admin SDK only 쓰기 (`firestore.rules` 강제)
- urlHash = sha256(url).slice(0, 32) — collision 방어 + URL 노출 없음
- TTL 7일 자동 만료

---

## 4. 디자인 시스템 준수

신규 컴포넌트 4종 모두 기존 토큰만 사용:
- `rounded-[var(--radius-card)]`, `bg-ink-card-strong`, `border-ink-line`, `bg-ink-elev`
- `text-text`, `text-text-soft`, `text-text-mute`, `text-vermilion-soft`, `text-bronze-soft`
- `aspect-video`, `line-clamp-1`, `line-clamp-2`, `truncate`
- `hover:bg-ink-elev`, `focus-visible:outline-bronze`

**신규 토큰 추가**: 0건 (Phase F 검증에서 추가한 14개 shadcn slot tokens가 재사용됨)

---

## 5. 모바일 반응형

- `live-preview`: `md:` split view, `sm` 이하는 토글 버튼
- `url-preview-inline`: 1열 stack (모바일/데스크톱 동일, 카드 width 컨테이너 fit)
- `youtube-embed`: `aspect-video` 비율 유지
- `link-preview`: `flex gap-3` (썸네일 + 텍스트), 모바일에서도 유지
- 폼 전체 `max-w-screen-2xl` (콘텐츠 폭 일관성)

---

## 6. Clean Architecture 검증

| 규칙 | 검증 |
|------|------|
| R1: `lib/firebase/*` 외부에서 SDK import 금지 | ✅ `lib/post/og-preview.ts`는 `lib/firebase/admin`만 사용 |
| R2: server-only 모듈 `import 'server-only'` 첫 줄 | ✅ ssrf-guard / og-parser / og-preview 모두 적용 |
| R3: Client Component에서 Admin SDK 금지 | ✅ url-preview-inline / live-preview는 `'use client'` + fetch API만 |
| R4: env 접근은 `lib/*/config.ts`에서만 | ✅ 신규 모듈에서 env 직접 접근 0건 |
| R5: domain layer React dependency 0 | ✅ `lib/post/rehype-*` / `og-*` / `ssrf-guard` 모두 pure |

---

## 7. 발견된 이슈 + 후속 작업

### 작업 중 해결된 이슈
1. **remark 기본 autolink 미지원** → `remark-autolink-bare-urls.ts` 추가 (custom remark plugin)
2. **server-only 모듈이 vitest 환경에서 실행 불가** → `lib/__tests__/server-only.stub.ts` + vitest alias
3. **lint rule react-hooks/set-state-in-effect** → 비동기 콜백으로 setState 이동 + render-time skeleton 패턴

### 후속 작업 (Phase E / F)
- Phase E (Chat) `LinkPreviewInMessage`에서 `lib/post/og-preview` 재사용
- gap-detector 실행 (M4_match_rate) — Task #33에서 종합
- Lighthouse 측정 (M8) — Task #31
- design system 자동 감사 (M6) — Task #30
- linkPreviewCache 모니터링 (캐시 hit rate, evict 빈도) — Task #32 Sentry

---

## 8. KPI Snapshot

- Phase D estimated: 1 day (8h)
- Phase D actual: ~50분 (sprint-orchestrator 자동화 + main session orchestration)
- Tasks completed: 23/30 (Phase A/B/C/D/F-UI all done)
- Phases completed: 5/6 (E + F-final 남음)
- Quality gates passed: 5/10 (M1, M2, M3, M5, M9)

---

## 9. Lessons Learned

1. **L4 full-auto + push guard 인터플레이**: L4 push는 ENH-298 가드로 차단됨 → L3 강등 후 push → L4 복귀 패턴. 사용자 명시 승인 시에도 가드는 적용 (이중 안전망).
2. **setState in effect 패턴**: react-hooks lint rule이 effect body의 동기 setState 거부 → render-time computed state로 우회 (skeleton fallback).
3. **server-only 모듈 테스트**: vitest 환경에서 `server-only` package는 throw → alias로 stub 주입.
4. **rehype plugin 통합 순서**: `sanitize → autolink-bare-urls → youtube-embed → link-preview → stringify` 순서가 중요 (autolink가 sanitize 후, embed/preview는 autolink 후).

---

**Next**: Task #43 (staging 시각/기능 검증) 완료 후 Phase E 진입 검토.
