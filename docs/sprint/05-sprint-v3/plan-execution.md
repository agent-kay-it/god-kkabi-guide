# Sprint V3 실행 Plan — L4 자동 모드 단일 세션 압축

> **본 문서의 역할**: 36주 V3 plan을 단일 세션 L4 자동 모드로 압축 실행하기 위한 실제 작업 범위 정의.
> Cold Outreach / Demo / Pilot / LOI 협상은 운영자 영업 영역(사람만 가능) → 본 sprint는 **코드/문서/인프라 산출물**에 집중.
> 영업 도구는 templates + 자료 prefab만 작성. 실제 발송/협상은 운영자가 별도 진행.

---

## 1. 실행 범위 (단일 세션 압축 후)

### 1.1 V2 Carry-over 처리 (P3.A)

| ID | 항목 | 상태 |
|----|------|:----:|
| GAP-P6-IMP-1 | success page client 전환 (또는 confirm fast-path skip) | 처리 |
| CA2-I8 | LocaleSwitcher cookie `Secure; SameSite=Lax` | 처리 |
| CA2-I7 | success page support email env 변수화 | 처리 |
| CA2-I10 | Toss SDK 중복 삽입 가드 | 처리 |
| CA2-I11 | setUserClaims 실패 시 retry queue (Firestore) | 처리 |
| CA-m2 잔여 | reaction/comment/bookmark catch 표준화 | 처리 |

### 1.2 V3 신규 코드 (P3.B / P3.C / P3.D)

| Sub-Phase | Feature | 산출물 |
|----------|---------|--------|
| P3.B | F4.2 B2B API | api_clients/api_usage 컬렉션 + /api/v1/{builds,adoption-rate,pain-points,coupons-trend,simulator-results} REST + Bearer JWT + Rate Limit middleware + admin API Key 발급 |
| P3.C | F4.3 Admin SaaS | /(admin-saas)/* whitelabel + tenant_themes 컬렉션 + KPI dashboard + CSV/JSON export |
| P3.D | F4.1 외부 신호 ETL | external_signals 컬렉션 + adapter interface (사람인/Google News stub — API key 없이 인터페이스만) + Firestore rules + cron route |

### 1.3 V3 자료 산출물 (P3.E)

| 산출물 | 위치 |
|--------|------|
| Cold Outreach 메시지 3 변형 | docs/sprint/05-sprint-v3/cold-outreach-templates/ |
| 가격 앵커링 자료 | docs/sprint/05-sprint-v3/pricing-anchoring.md |
| 인수 패키지 (DCF + Comparable + Asset) | docs/sprint/05-sprint-v3/acquisition-package.md |
| 데이터 이관 spec | docs/sprint/05-sprint-v3/data-migration-spec.md |
| 의사결정자 매핑 템플릿 | docs/sprint/05-sprint-v3/decision-maker-map.md |

### 1.4 운영자 게이트 (코드 작성 외)

| 항목 | 운영자 |
|------|--------|
| LinkedIn Premium 결제 + 의사결정자 50명 실제 매핑 | ✓ |
| Cold Outreach 50건 발송 + 응답 추적 | ✓ |
| Demo 15분 발표 + NDA 서명 | ✓ |
| Pilot 가격 협상 + 계약서 법무 검토 | ✓ |
| 인수 LOI 또는 라이선스 협상 | ✓ |
| Sensor Tower 구독 결제 + PDF parse 검증 | ✓ |
| 사람인/Google News API 키 발급 + tene 등록 | ✓ |

---

## 2. PDCA 진행

```
P0 사전 (V2 carry 인풋 확정)
P1 Plan (본 문서)
P2 Design (B2B API 명세 + admin SaaS 라우트 + 컬렉션 7종 추가 검증)
P3.A V2 carry 6건 처리
P3.B B2B API
P3.C Admin SaaS
P3.D 외부 신호 ETL adapter + 인수 패키지 자료
P3.E Cold Outreach 자료 + 가격 앵커링
P4 Check (Gap + Code analysis — 특히 API 보안)
P5 Act (iterate)
P6 QA (gap re-validate + 7-Layer + E2E)
P7 Report (V3 종합 + endgame 마무리)
P8 Archive (tag v3.0.0-v3-archived)
```

---

## 3. Quality Gates (V3 적용)

| Gate | 적용 | 비고 |
|:----:|:----:|------|
| M0 TypeScript strict | ✅ | exactOptionalPropertyTypes |
| M1 Firestore rules — 신규 4 컬렉션 | ✅ | api_clients / api_usage / tenant_themes / external_signals |
| M2 Server Action 표준 | ✅ | V2 carry CA-m2 잔여 반영 |
| M3 securityScan (B2B API) | ✅ | API Key 32-char + JWT 1h + Rate Limit + CORS whitelist |
| M4 Clean Arch 역참조 0건 | ✅ | domain → feature 단방향 유지 |
| M5 Match Rate ≥90% | ✅ | gap-detector |
| M7 WCAG AA (admin-saas) | ✅ | dashboard a11y |
| M8 7-Layer Pass | ✅ | UI → API → Auth → Rate Limit → Firestore → Response → Client → UI |
| M9 GA4 신규 5 이벤트 | ✅ | b2b_api_call / b2b_tenant_login / b2b_export / external_signal_fetch / acquisition_loi_view |
| M10 Budget ≤$100/월 | ✅ | 본 sprint는 코드만, infra 비용 변동 0 |

---

## 4. Clean Architecture 4-레이어 준수

```
ui (UI primitives) → motion (animations) → domain (cards/charts) → feature (business logic + 4 layers)
```

V3 신규 코드도 동일 원칙:
- `lib/b2b/` (server-only, BaaS API)
- `lib/etl/` (external signals adapter, server-only)
- `components/feature/admin-saas-*` (whitelabel UI)
- `app/api/v1/*` (REST API routes)
- `app/(admin-saas)/*` (whitelabel routes)

---

## 5. 디자인 시스템 (V2와 동일)

- Pretendard Variable + JetBrains Mono
- shadcn/ui new-york + cva variants (bronze/jade/vermilion/indigo)
- Glassmorphism (GlassCard)
- 4 컬러 토큰 (text/text-soft/text-mute/text-on-bronze 등)

Admin SaaS는 tenant 테마 커스터마이즈 가능하나 V3 본 sprint는 기본 디자인 토큰 유지 (tenant 색상은 CSS variable로 over-ride).
