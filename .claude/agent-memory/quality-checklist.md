# kkaebizigi — Quality Checklist (per-task)

> 모든 implementation 작업 시 체크해야 하는 7개 항목.
> 출처: 사용자 명시 요청 (Sprint 10 Phase A/B/C 반복) + Phase F 회귀 발견.

## 1. Clean Architecture
- [ ] Server/Client 컴포넌트 경계 명확 (`'use client'` 최소화)
- [ ] Port↔Adapter 분리 (lib/firebase/* admin vs client SDK)
- [ ] Server Action 트랜잭션 (read → validate → write 한 흐름)
- [ ] 책임 단일성 (한 컴포넌트 한 책임)

## 2. 코딩 컨벤션
- [ ] TypeScript strict + `exactOptionalPropertyTypes`
- [ ] JSDoc 헤더 (책임/출처/디자인 출처 명시)
- [ ] 기존 패턴 따름 (`RegisterFormReturn = ReturnType<typeof useForm<T>>` 등)
- [ ] `pnpm typecheck` + `pnpm lint` 0 errors

## 3. 디자인 시스템
- [ ] `@theme` 토큰 사용 (`text-bronze-soft`, `bg-ink-card-strong` 등)
- [ ] shadcn slot이 필요한 경우 `@theme` 안에 `--color-*` 정의 후 사용
- [ ] GlassCard / Pill / Button variant 일관 사용
- [ ] **콘텐츠 폭 일관성** — 홈/직업/진령 패턴 (`max-w-6xl mx-auto` or 유사)

## 4. 모바일/태블릿 반응형
- [ ] Tailwind v4 breakpoints (xs=320, sm=375, md=414, lg=768, xl=1024, 2xl=1280)
- [ ] 모바일 우선 (mobile-first CSS)
- [ ] iPhone SE (375px) ~ iPad (768px) ~ Desktop (1280+) 모두 검증
- [ ] Touch target ≥ 44px

## 5. UX 디테일
- [ ] Loading state (skeleton / spinner / pending)
- [ ] Error boundary + 사용자 친화적 메시지
- [ ] 접근성 (aria-label, role, focus visible)
- [ ] Optimistic UI (가능한 곳)

## 6. 보안 + 개인정보
- [ ] Firestore rules 검증 (writer 본인만 update)
- [ ] PIPA/GDPR 준수 (개인정보 수집/처리)
- [ ] Server Action 권한 체크 (auth + role)
- [ ] CSRF (NextAuth 기본 처리)

## 7. 검증
- [ ] `pnpm typecheck` 0
- [ ] `pnpm lint` 0
- [ ] localhost:3000 Chrome 시각 검증 (Desktop)
- [ ] localhost:3000 Chrome DevTools mobile emulation (iPhone SE, iPad)
- [ ] Console errors / Network 4xx-5xx 0

## 추가 — 사용자 반복 요청 (Phase F 시점 정리)

- "빠르게 아닌 꼼꼼하게"
- "토큰과 시간 비용 신경 쓰지 말고 품질 완성도 높게 기술부채 없도록"
- "모든 페이지 콘텐츠 요소 폭 일관 조정" — 홈/직업/진령 스타일 기준
- "내정보 CRUD 완전 (UID 제외 모두 수정 가능)"
- "회원 탈퇴 + 이용약관 + 개인정보처리방침"
- "localhost:3000 Chrome으로 꼼꼼하게 동작 검증"
