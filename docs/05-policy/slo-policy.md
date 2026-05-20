# SLO (Service Level Objective) Policy

> kkaebizigi V3 운영 안정성 기준선.

**작성일**: 2026-05-20
**Sprint**: 24 F24-D
**적용**: V3 (Production GA) 부터

---

## 1. 4 Golden Signals

Google SRE 의 4가지 핵심 시그널을 추적:

| Signal | 측정 | 목표 |
|---|---|---|
| **Latency** (지연) | p50 / p95 / p99 응답 시간 | p95 < 1500ms / p99 < 3000ms |
| **Traffic** (트래픽) | RPS (Requests Per Second) | 모니터링 기반 |
| **Errors** (에러) | 5xx 비율 + Exception rate | 5xx < 0.5% / Exception < 0.1% |
| **Saturation** (포화) | CPU / Memory / Function exec time | < 80% 평균 |

---

## 2. SLO 임계값

### 2.1 Availability (가용성)
- **Target**: 99.5% / month
- **Error budget**: 0.5% (월 약 3.6시간)
- **측정**: Vercel uptime + Firebase emulator + Sentry error rate

### 2.2 Latency
- **p95 < 1500ms** (Server Component + Server Action 평균)
- **p99 < 3000ms** (이상값 catch)
- **측정**: Sentry Performance Tracing (sampleRate 10%)

### 2.3 Error Rate
- **5xx HTTP < 0.5%** (운영 시간 평균)
- **Unhandled Exception < 0.1%** (Server + Client)
- **측정**: Sentry Issues

---

## 3. 알람 정책

### 3.1 Critical (즉시 대응)
| 조건 | 액션 |
|---|---|
| 5xx > 1% over 5min | Sentry alert → email |
| p95 > 3000ms over 10min | Sentry alert → email |
| Sentry new issue (critical) | email |

### 3.2 Warning (24시간 내 점검)
| 조건 | 액션 |
|---|---|
| 5xx > 0.5% over 1hr | Slack 알람 (V4) |
| p95 > 1500ms over 1hr | Slack 알람 |

---

## 4. Sentry 통합 (Sprint 24-26)

### 4.0 실 통합 완료 (Sprint 26 F26-A)
- `@sentry/nextjs` v10 설치 ✅
- `instrumentation.ts` Next.js 16 register hook + `onRequestError` 노출 ✅
- `sentry.client.config.ts` (Sprint 26 신규) + `sentry.server.config.ts` + `sentry.edge.config.ts` ✅
- 16 통합 테스트 (instrumentation 10 + client-config 6) ✅
- SENTRY_DSN secret 주입 후 production/preview 환경에서 자동 캡처


### 4.1 환경변수 (tene secret)
- `NEXT_PUBLIC_SENTRY_DSN` — client SDK
- `SENTRY_DSN` — server SDK
- `SENTRY_AUTH_TOKEN` — source map upload (build only)
- `SENTRY_ORG` / `SENTRY_PROJECT` — Sentry CLI 호환

### 4.2 활성 환경
- Production only (`NODE_ENV === 'production'`)
- Development / Test: disabled (noise 방지)

### 4.3 Sampling
- `tracesSampleRate: 0.1` (10% transactions)
- `replaysSessionSampleRate: 0` (자동 녹화 X)
- `replaysOnErrorSampleRate: 1.0` (에러 발생 시 100% 녹화)

### 4.4 PII 정책
- 이메일 / 닉네임 → Sentry sendDefaultPii: false
- 사용자 ID → Sentry.setUser({ id: uid }) 만 (이메일 X)

---

## 5. 사용자 영향 분류

| Level | 정의 | SLO 영향 |
|---|---|---|
| **P0** | 핵심 페이지 (/, /post, /jinryeong) 5xx | 즉시 대응 |
| **P1** | Server Action 실패 (좋아요/북마크/댓글) | 24h 내 점검 |
| **P2** | 부가 기능 (시뮬레이터 결과 기록) | 주간 점검 |
| **P3** | UI 폴리시 (애니메이션 / hover) | 분기 점검 |

---

## 6. Sprint 25+ 진척 계획

- ✅ Sprint 26: @sentry/nextjs 실 통합 + sentry.client.config.ts 작성 + 16 통합 테스트
- Sprint 27: SENTRY_DSN production 등록 + Sentry dashboard 알람 정책 운영
- Sprint 27+: Sentry Slack integration
- Sprint 28+: 사용자 segment 별 SLO 분리 (premium vs free)
- Sprint 29+: Sentry → Datadog 또는 Grafana 이전 검토

---

## 7. 책임자 (RACI)

- **Responsible**: 백엔드 / 인프라 담당
- **Accountable**: kay@agentkay.it
- **Consulted**: Sentry support
- **Informed**: 운영자

본 정책은 Sprint 28+ V4 단계에서 재검토 예정.
