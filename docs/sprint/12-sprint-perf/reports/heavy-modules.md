# Sprint 12 / F12-C-1 — Heavy Modules 분석

**측정**: `ANALYZE=true pnpm next build --webpack` (Next.js 16.2.6 + bundle-analyzer 16.2.6)
**측정일**: 2026-05-18

> Note: Next.js 16 + Turbopack 빌드는 `@next/bundle-analyzer` 호환되지 않아
> `--webpack` 플래그 사용 (1회성 분석). 운영 빌드는 그대로 Turbopack 유지.

## 출력 파일

- `bundle-client.html` (1.3 MB) — 클라이언트 번들 treemap
- `bundle-nodejs.html` (2.2 MB) — Node SSR 번들 treemap
- `bundle-edge.html` (275 KB) — Edge runtime 번들 treemap

## 후속 조치 후보 (Sprint 12 F12-C-2~5)

### 이미 분리됨 (변경 불필요)
- `components/feature/chat-widget-loader.tsx` — Sprint 03 MVP-v2 에서 dynamic 처리 완료
  - `next/dynamic` + `ssr: false` 로 ChatWidget 본체 + Firebase RTDB SDK + browser-image-compression
    이 별도 chunk 로 격리됨

### 검토 후 보류 (분리 효과 한계)

| 후보 | 결정 | 근거 |
|---|---|---|
| `components/feature/post-form.tsx` | **분리 안함** | `/post/new` route 전용 client component. Next.js route-level code splitting 이 자동으로 별도 chunk 생성. 추가 dynamic wrap 은 redundant. |
| `components/feature/lightbox-provider.tsx` | **분리 안함** | Provider + Context Hook 패턴 — dynamic import 시 Context 가 root layout 진입 시점에 없어 hook null 반환 (현재 fallback 패턴 으로 안전) → 본체는 가벼움 (~3KB). 분리 cost > benefit. |
| `components/feature/simulator-canvas.tsx` | **route loading.tsx 추가** | F12-C-5 `app/simulator/loading.tsx` 신규 — streaming Suspense fallback. SimulatorCanvas 자체는 route segment 별도 chunk 로 이미 격리됨. |

### Sprint 12 Iterate Phase 추가 후보 (측정 후 결정)
- `next/image` 의 PostImage 가 본문에 많을 때 client bundle 영향 (현재 다이나믹 X)
- markdown sanitize pipeline 의 `rehype-sanitize` + `hast-util-to-html` — server-only 이므로 client 영향 없음 (확인 완료)
- `@sentry/nextjs` — F12-B-3 에서 동적 import 처리 완료
- `firebase/auth` + `firebase/firestore` + `firebase/database` — 인증된 사용자 한정 동적 init 패턴 (lib/firebase/client.ts) 이미 사용 중

## 분석 한계

- Turbopack production 빌드 결과의 chunk 분배는 webpack 분석과 일치하지 않을 수 있음
- 실제 prod LCP 영향은 F12-A baseline + F12-B/C/D 후 재측정 (Iterate Phase) 에서 확정
- bundle 크기 reduction 은 F12-B (font subset + 3rd-party defer) 가 dominant. F12-C 는
  보조 효과로 자리매김.

## Sprint 12 F12-C 결론

본 Phase 의 핵심 산출:
1. `app/simulator/loading.tsx` 신규 — Streaming Suspense fallback (perceived perf)
2. 번들 분석 결과 보존 (`bundle-{client,nodejs,edge}.html`) — Sprint 12 Iterate 및 후속 sprint reference
3. chat-widget-loader / post-form / lightbox-provider 의 dynamic 분리 검토 — 모두 "분리 안함" 결정 + 근거 기록

이미 적용된 분리 + F12-B 의 3rd-party defer 가 unused-javascript 680ms 절감의 dominant
contributor. F12-C-6 측정에서 추가 후보 식별 시 Iterate Phase 로 carry.
