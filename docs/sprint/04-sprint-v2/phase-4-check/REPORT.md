# Sprint V2 — Phase 4 Check Report

> **분석 시점**: 2026-05-15
> **기준 commits**: P3.A~P3.F (single session)
> **사용자 요구 (verbatim)**: "꼼꼼하고 완벽하게 클린아키텍처, 코딩 컨벤션, 디자인시스템 준수 + 품질과 성능"
> **결론**: P5 Act iterate 필수 — Critical 3 (결제 멱등성) + GAP MAJ-1 처리 후 ≥90% 재달성

---

## §1. Executive Summary

| 지표 | 값 | Gate | 상태 |
|------|---:|:----:|:----:|
| Gap Match Rate | 87.5% | ≥90% | ⚠️ -2.5pp |
| Code Quality (5축 평균) | 85.4 | ≥85 | ✅ marginal |
| Security | 72 | ≥90 | ❌ Critical 3 |
| Clean Architecture | 95 | ≥95 | ✅ |
| TypeScript Strict | 92 | ≥90 | ✅ |
| Design System / a11y | 92 | ≥90 | ✅ |
| Performance | 80 | ≥85 | ⚠️ NLP aggregate |

**총 발견사항**: Critical 3 / Major 2 / Important 9 / Minor 7+4 = **25건**

---

## §2. Gap Analysis 요약 (87.5%)

| Axis | Score |
|------|------:|
| Structural Match | 95% |
| Functional Depth | 88% |
| API Contract | 92% |
| Intent Match | 90% |
| Behavioral Completeness | 82% |
| UX Fidelity | 78% |

### Feature 충실도

| ID | 충실도 | 비고 |
|----|------:|------|
| CA-m1 / CA-M1 / CA-m3 / CA-m4 / GAP-M3 | 100% | ✅ |
| CA-m2 (console.error) | 40% | ⚠️ 부분 적용 (P5 carry) |
| F3.1 시뮬레이터 | 95% | ⚠️ 165 시드 중 10 (운영자 보강) |
| F3.2 진령 채용률 | 100% | ✅ |
| F3.3 PvP 트렌드 | 100% | ✅ |
| F3.4 쿠폰 | 100% | ✅ |
| F3.5 NLP | 85% | ⚠️ design은 OpenAI 권장, 정규식+빈도로 다운그레이드 (비용 회피) |
| F3.6 프리미엄 | 90% | ⚠️ 7일 trial + 자동갱신 cron 미구현 (운영자 게이트) |
| F3.7 i18n | 40% (인프라 100%) | ⚠️ 페이지 마이그레이션 후속 |

### Major 2

| ID | 영향 | P5 액션 |
|----|------|---------|
| **GAP-MAJ-1** | payment funnel 5 GA4 (view/select/input/success/drop) 미정의 → V3 B2B 데모 BigQuery 쿼리 무효 | GA4EventName 5 추가 + 발화 4지점 (~2h) |
| **GAP-MAJ-2** | 7일 무료 체험 + 자동 갱신 cron 미구현 | Toss 사업자 게이트 후 carry (V2 후속) |

---

## §3. Code Analysis 요약

### 3.1 5축 점수

| 축 | 점수 | 비고 |
|----|----:|------|
| Clean Architecture | 95/100 | domain→feature 역참조 0건, Server Action 17/17 |
| Code Quality | 88/100 | typecheck 회귀 0, NLP aggregate 임계점 |
| Security | **72/100** | 결제 멱등성 + webhook signature + simulator anon write |
| Performance | 80/100 | NLP loop 직렬 await + maxDuration 위협 |
| Design System / a11y | 92/100 | LocaleSwitcher ARIA + recharts 토큰 + sanitize 회귀 0 |

### 3.2 Critical 3 (보안 — 즉시 처리)

| # | 이슈 | 파일 | 영향 |
|--:|------|------|------|
| **CA2-C1** | `confirmSubscription` 멱등성 부재 — orderId 중복 결제 시 subscription/payment_history 신규 doc 다중 생성 | `lib/subscription/actions.ts:94-134` | 결제 중복 청구 위험 |
| **CA2-C2** | Toss webhook signature 포맷 (base64 vs hex 미검증) — 모든 webhook 401 reject 가능 | `lib/subscription/toss-client.ts:128-153` | webhook 통합 실패 가능 |
| **CA2-C3** | webhook 멱등성 부재 + race (client confirm 이전 webhook 도착 시 상태 누락) | `app/api/webhooks/toss/route.ts:52-70` | 결제 상태 영구 불일치 |

**해결 방향**: `payment_history` doc id를 orderId로 통일 + `set({merge: true})` + webhook signature base64/hex 양쪽 검증.

### 3.3 Important 9

| # | 이슈 | P5 처리 |
|--:|------|---------|
| CA2-I1 | success page Server Component side-effect (GET 새로고침 시 재confirm) | client component + sessionStorage |
| CA2-I2 | simulator_runs 익명 write 무제한 (스팸 위험) | rule 강화 + value bounds |
| CA2-I3 | shouldShowAds banned/anonymous 분기 누락 (5-가드 → 3-가드) | guards.ts 분기 추가 |
| CA2-I4 | `pain_topic_click` 미발화 (admin page client wrapper 부재) | client wrapper 추가 |
| CA2-I5 | NLP aggregate 직렬 await — maxDuration 5분 위협 | batch set 또는 Promise.all chunked |
| CA2-I6 | keyword-dict RegExp module-scope state mutation 잠재 race | 매 호출 new RegExp |
| CA2-I7 | voteCoupon prev===direction no-op 비용 | 메타 메시지 추가 (Minor) |
| CA2-I8 | simulator_runs uid PII 저장 | 통계용이면 uid 제거 검토 |
| CA2-I9 | premium_subscribe 발화가 시도 시점 (실패에도 카운트) | success page로 이동 |

### 3.4 Minor 7

- premium-checkout Toss SDK 중복 삽입 가드
- jinryeong-rate weekISOValue 로직 단순화
- success page support email env 변수화
- LocaleSwitcher cookie `Secure; SameSite=Lax` 누락
- recharts useMemo 정렬 후 first row 사용
- setUserClaims 실패 시 retry queue
- coupon votes rule `if false` 또는 server-only

---

## §4. Quality Gates M0-M15

| Gate | 상태 | 비고 |
|:----:|:----:|------|
| M0 TypeScript strict | ✅ | 0 errors |
| M1 Firestore rules 신규 6 컬렉션 | ⚠️ | simulator_runs 강화 필요 (CA2-I2) |
| M2 Server Action 표준 | ✅ | 17/17 모듈 |
| M3 Markdown XSS | ✅ | 회귀 0 + 외부 이미지 차단 (CA-m4) |
| M4 Clean Arch 역참조 0건 | ✅ | grep 검증 |
| M5 Match Rate ≥90% | ❌ | 87.5% — P5 후 ≥90% 예상 |
| M6 Lighthouse Mobile ≥85 | ⏸️ | production CDN 측정 게이트 |
| M7 WCAG AA 정적 | ✅ | LocaleSwitcher ARIA + 신규 페이지 OK |
| M8 7-Layer Pass | ⚠️ | 결제 흐름 Critical 3 (CA2-C1~C3) |
| M9 GA4 34 이벤트 | ⚠️ | V2 신규 8 / pain_topic_click 미발화 + payment funnel 5 미정의 |
| M10 PIPA 5번째 동의 + 전파 | ✅ | V1 유지 |
| M11 AdSense 5-가드 | ⚠️ | shouldShowAds banned 분기 누락 (CA2-I3) |
| M12 Storage rules posts/chat | ✅ | V1 유지 |
| **M13 Payment PCI** | ❌ | Critical 3 미해결 |
| **M14 i18n Coverage** | ⏸️ | 인프라 100%, 마이그레이션 운영자 게이트 |
| **M15 NLP Cost** | ✅ | LLM 미사용, 정규식+빈도 |

**Pass**: 9/15 + 운영자 게이트 2 (M6, M14). P5 후 13/15 예상.

---

## §5. P5 Act 통합 우선순위

| # | ID | Severity | 작업 | 예상 |
|--:|----|----------|------|------|
| 1 | **CA2-C1+C3** | Critical | `payment_history` doc id = orderId + set({merge:true}) + confirmSubscription 멱등 분기 | ~45m |
| 2 | **CA2-C2** | Critical | Toss webhook signature base64/hex 양쪽 검증 + timing-safe `crypto.timingSafeEqual` Buffer 사용 | ~15m |
| 3 | **GAP-MAJ-1** | Major | payment_view/select/input/success/drop GA4 5 이벤트 + 발화 4지점 | ~30m |
| 4 | **CA2-I1+I9** | Important | `/premium/success` client 변환 + sessionStorage 1회 + `premium_subscribe` 발화 이동 | ~30m |
| 5 | **CA2-I3** | Important | `shouldShowAds` banned/anonymous 분기 | ~10m |
| 6 | **CA2-I4** | Important | admin pain page client wrapper + `pain_topic_click` 발화 | ~15m |
| 7 | **CA2-I2** | Important | firestore.rules simulator_runs value bounds + timestamp | ~10m |
| 8 | **CA2-I5+I6** | Important | NLP aggregate batch set + keyword-dict matchAll | ~30m |

**예상 결과**: P5 Act ~3h 후 Match Rate **≥92%**, 7-Layer 7/7, Security ≥90, Quality Gates 13/15.

**Carry-over (V2 후속 또는 V3)**:
- GAP-MAJ-2 (7일 trial cron) — Toss 운영자 게이트 후
- CA-m2 잔여 ~20 catch (reaction/comment/bookmark 등)
- Minor 7건

---

## §6. 다음 단계

1. **P5 Act iterate** — Critical 3 + Major 1 + Important 5 처리 (~3h)
2. **P5 검증** — typecheck + build + gap 재실행 → ≥90%
3. **P5 commit** + sprint state phase=p6_qa
4. **P6 QA** — gap-detector 재실행 + 7-Layer F8-F15 + E2E
5. **P7 Report** — Sprint V2 종합 + V3 인풋
6. **P8 Archive** — tag v2.0.0-v2-archived

---

**P4 Check 종료. Critical 3 + GAP MAJ-1 처리 위해 P5 Act 진입.**
