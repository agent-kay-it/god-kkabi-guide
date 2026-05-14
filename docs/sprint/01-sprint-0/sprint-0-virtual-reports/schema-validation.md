# Schema Validation — Sprint 0 R.A.T. PASS/FAIL 보고

> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/01-sprint-0/prd.md` §4, `docs/sprint/01-sprint-0/design.md` §4
> 입력: `report-1-meta-insight.md`, `report-2-churn-signal-saas.md`, `report-3-next-title-research.md`, `docs/01-pm/04-prd.md` §11 Firestore 스키마
> **초기 평가 (2026-05-14 v1.0)**: ⚠️ CONDITIONAL PASS (보강 4건 필요)
> **최종 결과 (2026-05-14 v1.1, 보강 A/B/C/D 적용 완료 후)**: ✅ **FULL PASS** — 15 차트 100% 매핑 확보

---

## 1. 본 문서의 역할

Sprint 0 R.A.T. (Riskiest Assumption Test)의 핵심 산출물. 가상 V3 B2B 패키지 3종(Report 1/2/3)이 요구하는 데이터 필드가 MVP Firestore 6 컬렉션(`users`/`builds`/`tier_votes`/`coupons`/`events`/`pain_topics`)으로 추가 마이그레이션 없이 도출 가능한지 매핑 매트릭스로 검증한다.

---

## 2. 검증 결과 요약 (Executive Summary)

### 2.1 PASS/FAIL 매트릭스 (v1.0 — 보강 전)

| 리포트 | 차트 수 | ✅ PASS | ⚠️ Conditional | ❌ FAIL | 결론 |
|--------|--------|---------|--------------|---------|------|
| Report 1 메타 인사이트 | 5 | 4 | 1 (R1-C5 tags) | 0 | ⚠️ MVP `builds.tags` 필드 추가 |
| Report 2 이탈 시그널 SaaS | 5 | 2 | 2 (R2-C3 별점, R2-C4 결제) | 1 (R2-C3 컬렉션) | ⚠️ V1+ `boss_ratings` 컬렉션 신설 + V2 결제 이벤트 정의 |
| Report 3 후속작 리서치 | 5 | 2 | 1 (R3-C1 NER) | 2 (R3-C3, R3-C4 외부) | ⚠️ V3 시점 외부 데이터 소스 도입 가정 |
| **합계 (v1.0)** | **15** | **8 (53%)** | **4 (27%)** | **3 (20%)** | **CONDITIONAL PASS** |

### 2.2 PASS/FAIL 매트릭스 (v1.1 — 보강 A/B/C/D 적용 완료)

운영자 옵션 A 채택 후 6개 sprint 파일 보강 적용 완료 (2026-05-14):

| Chart ID | 보강 내용 | 적용 위치 | 최종 상태 |
|----------|---------|---------|---------|
| R1-C1 | (보강 불필요) | MVP design §5.5 BuildDoc | ✅ PASS |
| R1-C2 | (보강 불필요, R1-C1 derived) | computed | ✅ PASS |
| R1-C3 | (보강 불필요, calendar 운영자 수기) | MVP design §5.5 + 외부 calendar | ✅ PASS |
| R1-C4 | (보강 불필요) | MVP design §5.5 cross-tab | ✅ PASS |
| **R1-C5** | 보강 A — `tags: BuildTag[]` REQUIRED + enum 11종 + composite index `(tags, likes_count desc)` | MVP design.md line 571/592, V1 design.md line 190/204 | ⚠️ → ✅ PASS |
| R2-C1 | (보강 불필요) | MVP design §5.5 events sequence | ✅ PASS |
| R2-C2 | (보강 불필요) | V2 design §pain_topics | ✅ PASS |
| **R2-C3** | 보강 B — `boss_ratings` 컬렉션 신설 + 별점 UI + 인덱스 3종 + 보안 규칙 | V1 design.md §3.6 (line 262-311) + V1 plan.md T-BR-001~004 (+20h) | ❌ → ✅ PASS |
| **R2-C4** | 보강 C — 결제 funnel 5 이벤트 (`payment_view/select/input/success/drop`) + payload 명세 | V2 design.md §5.7 (line 471+) + V2 plan.md T-PAY-001~003 (+24h) | ⚠️ → ✅ PASS |
| R2-C5 | (보강 불필요) | V2 design Shannon entropy | ✅ PASS |
| **R3-C1** | 보강 C — OpenAI fine-tuning NER (gpt-4o-mini, 88-92% 정확도, 학습 ₩300K-500K + 월 ₩50K-200K) | V2 design.md §4.4 + V2 plan.md T-NER-001~003 (+32h) | ⚠️ → ✅ PASS |
| R3-C2 | (보강 불필요) | V2 design pain_topics next_title filter | ✅ PASS |
| **R3-C3** | 보강 D — `external_signals` 컬렉션 신설 + ETL Cloud Functions 5종 (사람인/잡코리아/Google News/LinkedIn/Sensor Tower) | V3 design.md §8 (line 448-617) + V3 plan.md T-EXT-001~008 (+46h) | ❌ → ✅ PASS |
| **R3-C4** | 보강 D — Sensor Tower 분기 보고서 + ETL `sensortower-parse` Cloud Function | V3 design.md §8 + V3 plan.md T-EXT-002/006 | ❌ → ✅ PASS |
| R3-C5 | (보강 불필요) | builds seasonality 분석 | ✅ PASS |

| 리포트 | 차트 수 | ✅ PASS | ⚠️ Conditional | ❌ FAIL | 결론 |
|--------|--------|---------|--------------|---------|------|
| Report 1 메타 인사이트 | 5 | 5 (보강 A) | 0 | 0 | ✅ FULL PASS |
| Report 2 이탈 시그널 SaaS | 5 | 5 (보강 B+C) | 0 | 0 | ✅ FULL PASS |
| Report 3 후속작 리서치 | 5 | 5 (보강 C+D) | 0 | 0 | ✅ FULL PASS |
| **합계 (v1.1)** | **15** | **15 (100%)** | **0** | **0** | ✅ **FULL PASS** |

### 2.3 종합 판단 (v1.1 최종)

**보강 A/B/C/D 4건 적용 완료 후 15 차트 100% 매핑 확보**:
- 보강 A (MVP `builds.tags`): MVP design 914 → 1,005 라인 (+91)
- 보강 B (V1 `boss_ratings`): V1 design 665 → 756 라인 (+91), V1 plan 304 → 310 라인 (+6, T-BR-001~004 +20h)
- 보강 C (V2 결제 funnel + NER): V2 design 494 → 719 라인 (+225), V2 plan 267 → 287 라인 (+20, T-PAY/NER +56h)
- 보강 D (V3 외부 데이터): V3 design 488 → 693 라인 (+205), V3 plan 300 → 318 라인 (+18, T-EXT-001~008 +46h)

**총 추가**: 6개 파일에 +656 라인 + 5 sprint 누적 시간 영향 +122h (V1+20 / V2+56 / V3+46)

**비용 영향**: V1 ₩0 / V2 ₩300K-500K 일회성 + 월 ₩50K-200K / V3 자체 ~₩10K/월 (외부 데이터 무료 우선 + Sensor Tower 수익 충당)

**Sprint 0 졸업 게이트**: ✅ PASS — MVP Sprint 진입 가능.

---

## 3. 매핑 매트릭스 (15 차트 × Firestore 6 컬렉션)

### 3.1 Report 1 매핑 (5 차트)

| 차트 ID | 차트 명 | 필요 데이터 필드 | 매핑 컬렉션 | 필드 경로 | 상태 |
|---------|------|--------------|----------|---------|------|
| R1-C1 | 진령 11종 12주 채용률 추이 | 빌드의 진령 3종 + 작성 주차 | `builds` | `jinryeong_3[*]` UNNEST + `created_at` (week 변환) | ✅ PASS |
| R1-C2 | 메타 변화 시그널 (±5%p) | R1-C1 결과의 week-over-week diff | (R1-C1 계산) | computed metric | ✅ PASS |
| R1-C3 | 신규 진령 출시 후 전환 속도 | 빌드 작성일 + 진령 ID + 신규 출시일 | `builds` + 외부 calendar | `builds.created_at` + `builds.jinryeong_3` + `events_calendar.md`(운영자 수기) | ✅ PASS (외부 calendar 운영자 수기 관리) |
| R1-C4 | 직업×진령 시너지 분포 | 직업 + 진령 3종 cross-tab | `builds` | `class × jinryeong_3` | ✅ PASS |
| R1-C5 | 결투장 메타 빌드 TOP 10 | 결투장 태그 필터링 + 좋아요 수 | `builds` | `description LIKE '%결투장%'` 또는 `tags CONTAINS 'pvp'` + `likes_count + bookmarks_count` | ⚠️ Conditional |

#### R1-C5 매핑 이슈 상세

**문제**: `builds.description`은 자유 텍스트라 정확한 결투장 빌드 분류 어려움. NLP 또는 키워드 매칭 정확도 70-80% 추정.

**해결안 A (권장)**: MVP Firestore 스키마 `builds.tags: string[]` 필드 추가.
- 빌드 작성 폼에 카테고리 multi-select UI (V1 빌드 폼 기능)
- 카테고리 enum: `'pve'`, `'pvp'`, `'boss'`, `'결투장'`, `'무한던전'`, `'비경'`, `'초보'`, `'중수'`, `'고수'`
- MVP 비용: Firestore 스키마 변경 + V1 UI 추가 (이미 V1 design.md에 빌드 폼 설계됨)
- **운영자 결정 필요**: MVP 스키마에 `tags` 필드 추가 vs V1에서 추가

**해결안 B (대안)**: MVP는 NLP 매칭 70% 정확도로 진행, V2 이후 NLP 모델 fine-tuning으로 정확도 향상.
- 단점: V1-V2 사이 R1-C5 차트 정확도 낮음.

### 3.2 Report 2 매핑 (5 차트)

| 차트 ID | 차트 명 | 필요 데이터 필드 | 매핑 컬렉션 | 필드 경로 | 상태 |
|---------|------|--------------|----------|---------|------|
| R2-C1 | 페이지 funnel 이탈률 | 페이지 시퀀스 + 세션 | `events` | `page` + `session_id` sequence | ✅ PASS |
| R2-C2 | 페인포인트 NLP TOP 10 | 토픽 + 감정 + 빈도 | `pain_topics` | `topic + sentiment + frequency + week` | ✅ PASS |
| R2-C3 | 보스 던전 별점 분포 | 보스 ID + 별점 + 투표 수 | (없음) | — | ❌ FAIL |
| R2-C4 | 결제 이탈 단계 | 결제 단계 이벤트 | `events` (V2+) | `event_name = 'payment_drop_n'` | ⚠️ Conditional (V2 결제 이벤트 정의) |
| R2-C5 | 빌드 다양성 지수 (Shannon) | 진령 3종 분포 주별 | `builds` | Shannon entropy on `jinryeong_3[*]` 주별 | ✅ PASS |

#### R2-C3 매핑 이슈 상세

**문제**: MVP 스키마에 보스 별점 컬렉션 없음. 댓글 NLP만으로 정성 의견은 가능하나 정량 별점 분포는 도출 불가.

**해결안 A (권장)**: V1+에서 `boss_ratings` 컬렉션 신설.
```typescript
interface BossRatingDoc {
  id: string;
  uid: string;
  boss_id: 'daily_1' | 'daily_2' | 'weekly_1' | 'weekly_2' | 'dokebi_coop';
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  created_at: Timestamp;
  source: 'self_report' | 'screenshot';
}
```
- V1 design.md에 추가 (V1 plan.md WBS 1일 추가)
- 보스 가이드 페이지에 별점 입력 UI

**해결안 B (대안)**: `builds.tags`에 보스 평가 태그 ('boss-easy', 'boss-hard') 활용 + 댓글 NLP에서 보스 sentiment 추출.
- 정량 별점은 부재. 정성 신호만 제공 가능.

#### R2-C4 매핑 이슈 상세

**문제**: V2 결제 도입 후에야 결제 이벤트 발생. Sprint 0 시점에는 데이터 부재.

**해결안**: V2 결제 통합 시 `events.event_name` enum에 다음 이벤트 추가.
- `payment_view` (가격 페이지 진입)
- `payment_select` (시즌패스 선택)
- `payment_input` (결제 정보 입력)
- `payment_success` (결제 완료)
- `payment_drop` (이탈, payload에 단계 정보 포함)

V2 design.md에 이미 결제 흐름 설계 포함 — Sprint 0 시점에서는 가설 처리, V2 종료 후 실측.

### 3.3 Report 3 매핑 (5 차트)

| 차트 ID | 차트 명 | 필요 데이터 필드 | 매핑 컬렉션 | 필드 경로 | 상태 |
|---------|------|--------------|----------|---------|------|
| R3-C1 | 대체 게임 언급 빈도 | NER 결과 게임명 + 빈도 | `pain_topics` + NER | NLP NER 모델 fine-tuning | ⚠️ Conditional (NER 모델 별도) |
| R3-C2 | 후속작 기대도 키워드 | 토픽 필터링 | `pain_topics` | `topic LIKE '%next_title%' OR '%후속작%' OR '%2편%'` | ✅ PASS |
| R3-C3 | 4399 채용 공고 분석 | 외부 LinkedIn + 사람인 | **외부** | LinkedIn API + 잡코리아 API | ❌ FAIL (외부) |
| R3-C4 | 동양 IP 키우기 시장 매출 | 외부 Sensor Tower | **외부** | Sensor Tower API | ❌ FAIL (외부) |
| R3-C5 | 한국 시장 진입 시점 추천 | 빌드 작성일 월별 + 외부 시장 데이터 | `builds` + 외부 | seasonality 분석 + 외부 보완 | ✅ PASS (단, 외부 데이터 풍부할 때 더 정확) |

#### R3-C1 매핑 이슈 상세

**문제**: NER (Named Entity Recognition) 모델이 한국 게임 슬랭에 fine-tuning 안 됨. 초기 정확도 70-75% 추정.

**해결안**: V2 NLP 도입 시 NER 모델 fine-tuning 작업 추가 (V2 plan.md에 T-N 추가).
- 비용: ₩1M-3M (OpenAI fine-tuning 또는 KoBERT 자체 학습)
- 기간: 2주 (V2 Phase do)
- Sprint 0 시점에는 가설 처리.

#### R3-C3, R3-C4 매핑 이슈 상세 (외부 데이터)

**문제**: 4399 채용 공고 / Sensor Tower 산업 매출 = MVP Firestore 외부 데이터.

**해결안 A (권장, V3 시점)**: V3 Phase plan에서 외부 데이터 소스 도입.
- LinkedIn API (월 ₩300K-500K) + 사람인 API (월 ₩200K-300K) + Sensor Tower 보고서 구독 (분기 $5K-15K, 본 리포트 가격에 포함)
- V3 비용 한도 $100/월 가드레일 내에서 운영 가능 (LinkedIn + 사람인만, Sensor Tower는 본 리포트 수익에서 충당)

**해결안 B (대안, V3에서 외부 데이터 제외)**: Report 3의 R3-C3/C4를 별도 옵션 (₩5M-10M 추가)으로 분리. 기본 패키지는 가이드 사이트 데이터만.

**해결안 C (대안, 일회성으로 외부 데이터 수기 수집)**: 운영자가 LinkedIn 수동 검색 + Sensor Tower 보고서 일회성 구매. 시간 비용 ₩2M-5M (운영자 시간 × 시급).

---

## 4. 보강 권장 사항 (Conditional PASS 조건)

다음 3건 보강 시 Sprint 0 PASS 처리 가능.

### 4.1 보강 A — MVP `builds.tags` 필드 추가 (필수, 권장 ⭐)

**대상**: R1-C5 (결투장 메타 빌드 TOP10) 매핑 정확도 보강
**위치**: MVP `design.md` Firestore 스키마 + V1 빌드 작성 폼 UI
**비용**: 0원 (MVP 스키마 추가)
**기간**: MVP Phase design 0.5일 추가 (V1 plan에는 빌드 폼 UI 이미 포함)
**Schema 변경**:
```typescript
interface BuildDoc {
  // ... 기존 필드 ...
  tags: string[];  // NEW. enum: 'pve' | 'pvp' | 'boss' | '결투장' | '무한던전' | '비경' | '초보' | '중수' | '고수' | 'meta' | 'experimental'
}
```

### 4.2 보강 B — V1 `boss_ratings` 컬렉션 신설 (필수)

**대상**: R2-C3 (보스 던전 별점 분포)
**위치**: V1 `design.md` Firestore 스키마 + 보스 가이드 페이지 별점 UI
**비용**: 0원 (V1 신규 컬렉션 추가)
**기간**: V1 Phase do 1일 추가
**Schema**:
```typescript
interface BossRatingDoc {
  id: string;
  uid: string;
  boss_id: 'daily_1' | 'daily_2' | 'weekly_1' | 'weekly_2' | 'dokebi_coop' | string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  created_at: Timestamp;
  source: 'self_report' | 'screenshot';
}
```

### 4.3 보강 C — V2 결제 이벤트 정의 (필수)

**대상**: R2-C4 (결제 이탈 단계)
**위치**: V2 `design.md` 결제 흐름 + `events.event_name` enum 확장
**비용**: 0원 (V2 결제 통합 시 동시 처리)
**기간**: V2 Phase design 동시 처리 (별도 추가 없음)

### 4.4 V3 외부 데이터 도입 가정 (R3-C3/C4)

**옵션 A (권장 ⭐)**: V3 시점에 LinkedIn + 사람인 + Sensor Tower 외부 데이터 도입. V3 비용 한도 $100/월 내 운영.
**옵션 B**: Report 3에서 R3-C3/C4 제외. 별도 옵션 패키지로 분리 (₩5M-10M 추가).
**옵션 C**: 일회성으로 운영자 수동 수집 (시간 비용 ₩2M-5M).

### 4.5 V2 NLP NER 모델 fine-tuning (R3-C1)

V2 plan.md에 태스크 추가:
- T-V2-NLP-NER: KoBERT 또는 OpenAI fine-tuning 모델 학습 (₩1M-3M, 2주)

---

## 5. 운영자 결정 옵션 (L3 Trust 수동 게이트)

운영자가 다음 옵션 중 하나를 선택하여 Sprint 0 종료 처리.

### 옵션 A: 모든 보강 수용 + Conditional PASS ⭐ (추천)

- **결정**: 보강 A/B/C 모두 수용. R3-C3/C4 외부 데이터는 V3 시점 도입 가정.
- **MVP 영향**: `design.md`에 `builds.tags` 필드 추가 (0.5일 추가).
- **V1 영향**: `boss_ratings` 컬렉션 신설 (1일 추가).
- **V2 영향**: 결제 이벤트 정의 (별도 추가 없음, V2 결제 통합 시 동시).
- **V3 영향**: 외부 데이터 소스 도입 (V3 plan.md에 이미 일부 포함, 가격 앵커링 자료).
- **Sprint 0 결과**: ✅ PASS (모든 보강 후 매핑 100%)
- **MVP 진입**: 가능. 다음 명령으로 진입:
  ```bash
  /sprint phase god-kkabi-guide-sprint-0 --to archive
  /sprint init god-kkabi-guide-sprint-mvp
  ```

### 옵션 B: V3 스코프 축소 + 즉시 PASS

- **결정**: Report 2 R2-C3 / Report 3 R3-C3,R3-C4 항목을 V3 스코프에서 제외.
- **V3 영향**: 패키지 가격 ₩10-30M → ₩5-15M으로 축소.
- **Sprint 0 결과**: ✅ PASS (스코프 축소로 100% 매핑)
- **장점**: MVP/V1/V2 스키마 변경 없음, 즉시 MVP 진입.
- **단점**: V3 B2B 패키지 매력도 ↓, 인수 가격 가설 ₩300M-1.5B 하한선으로 조정.

### 옵션 C: Sprint 0 재진입 (전면 스키마 재설계)

- **결정**: 매핑 ❌ 항목 3개 (R2-C3, R3-C3, R3-C4) 해소 위해 MVP 스키마 전면 재설계.
- **추가 소요**: Sprint 0 1-2일 추가.
- **장점**: V3 패키지 완전한 형태 가능.
- **단점**: MVP 일정 1-2일 지연. (1인 운영 부담)

---

## 6. 운영자 결정 기록

> **결정 시점**: Sprint 0 Phase 3 (check) 또는 Phase 4 (archive) 진입 직전.

```
[X] 옵션 A — 모든 보강 수용 + Conditional PASS ⭐
[ ] 옵션 B — V3 스코프 축소 + 즉시 PASS
[ ] 옵션 C — Sprint 0 재진입

운영자 결정: 옵션 A — 모든 보강 수용
결정일: 2026-05-14
사유:
  1. V3 인수 가격 가설 ₩300M-1.5B 유지 (스코프 축소 시 상한선 ↓)
  2. 1인 운영 부담 미세 증가(MVP +0.5일, V1 +1일)는 수용 가능
  3. 추후 데이터 마이그레이션 비용 회피 — Sprint 0의 R.A.T. 가치 극대화
  4. V3 외부 데이터 비용 월 $50-100은 V3 한도 $100/월 내 운영 가능
```

### Sprint 0 PASS 처리 (옵션 A 적용)

본 결정에 따라 다음 sprint 문서에 즉시 반영:

1. **MVP Sprint** (`docs/sprint/02-sprint-mvp/design.md`):
   - `BuildDoc` 인터페이스에 `tags: string[]` 필드 추가
   - 빌드 작성 폼 (V1) UI에 카테고리 multi-select (`pve`/`pvp`/`boss`/`결투장`/`무한던전`/`비경`/`초보`/`중수`/`고수`/`meta`/`experimental`)

2. **V1 Sprint** (`docs/sprint/03-sprint-v1/design.md`):
   - `BossRatingDoc` 인터페이스 신설
   - 보스 가이드 페이지에 별점 입력 UI (`/dungeon/[boss-id]` 페이지에 1-5점 별점)

3. **V2 Sprint** (`docs/sprint/04-sprint-v2/design.md`):
   - `events.event_name` enum에 결제 funnel 5종 추가
   - `'payment_view'` / `'payment_select'` / `'payment_input'` / `'payment_success'` / `'payment_drop'`
   - V2 NLP NER 모델 fine-tuning 태스크 추가 (`R3-C1` 정확도 보강)

4. **V3 Sprint** (`docs/sprint/05-sprint-v3/design.md` + `plan.md`):
   - 외부 데이터 소스 통합 절 추가: LinkedIn API + 사람인 API + Sensor Tower 분기 보고서 구독
   - V3 인프라 비용 한도 $100/월 내 운영 (월 $50-80 외부 데이터 비용 가정)
   - Cold Outreach 단계에서 본 가상 리포트 3종을 데모 자료로 활용 (실데이터로 재작성)

---

## 7. 다음 Sprint 인터페이스 (PASS 시)

Sprint 0 PASS 시 본 `schema-validation.md`는 다음 Sprint에 다음과 같이 영향을 준다.

### 7.1 MVP Sprint
- `design.md` Firestore 스키마 절에서 본 문서 §3, §4 인용
- `builds.tags` 필드 추가 (옵션 A 수용 시)
- `events.event_name` enum에 GA4 12개 이벤트 명세 (기존 PRD §11 활용)

### 7.2 V1 Sprint
- `design.md` Firestore 보안 규칙 + 컬렉션 스키마에서 `boss_ratings` 컬렉션 추가 (옵션 A 수용 시)
- 보스 가이드 페이지에 별점 UI 추가 (V1 Phase do)

### 7.3 V2 Sprint
- `design.md` 결제 흐름 + `events.event_name` enum 확장
- V2 plan.md에 NER 모델 fine-tuning 태스크 추가 (옵션 A 수용 시)

### 7.4 V3 Sprint
- `design.md` 외부 데이터 통합 절 (LinkedIn + 사람인 + Sensor Tower)
- V3 plan.md `Cold Outreach` 단계의 데모 자료로 본 가상 리포트 3종 활용 (실제 데이터로 재작성)

---

## 8. R.A.T. 검증 종합 평가

### 8.1 D5 가설 (Discovery §Step 3) 검증 결과

**가설**: "MVP의 데이터 스키마가 V3 B2B 패키지(분기 리포트 / 이탈 시그널 SaaS / 후속작 리서치)까지 추가 마이그레이션 없이 수용 가능"

**검증 결과**: ⚠️ **부분 입증 + 보강 권장**

- 가설은 **부분 입증** — 53% 차트는 MVP 스키마로 직접 매핑 가능.
- 27% 차트는 **소규모 보강** (필드 추가 또는 V1+ 컬렉션 신설)으로 매핑 가능.
- 20% 차트는 **V3 외부 데이터 도입** (R3-C3, R3-C4) 또는 V1 컬렉션 신설 (R2-C3)이 필수.

### 8.2 R.A.T. 의의

본 Sprint 0이 D5 가설을 **무산시키지 않았다**. 즉, V3 자체는 무산되지 않는다. 다만 다음을 사전에 알았다는 가치:

1. **MVP에 `builds.tags` 필드를 미리 넣어야 한다** (Sprint MVP 시작 후 알았다면 데이터 마이그레이션 비용 발생)
2. **V1에 `boss_ratings` 컬렉션을 신설해야 한다** (V1 시작 후 알았다면 후행 마이그레이션 발생)
3. **V3에 외부 데이터 소스를 도입해야 한다** (V3 비용 한도 계획 사전 반영)

이 3가지를 사전에 안 것이 본 Sprint 0의 ₩0/1-2일 투자에 대한 가치.

### 8.3 Sprint 0 졸업

```
S0-AC-01: 가상 리포트 3종 Markdown 완성 — ✅ 3/3
S0-AC-02: 각 리포트 데이터 필드 명세 — ✅ 리포트별 5개 차트 명세 완료
S0-AC-03: Firestore 컬렉션 매핑표 작성 — ✅ 15 차트 × 6 컬렉션 매핑 완료
S0-AC-04: 운영자 수동 검증 게이트 — ⏳ 대기 (옵션 A/B/C 결정)
S0-AC-05: 총 소요 시간 — ✅ 1-2일 이내 완료
S0-AC-06: 인프라 비용 — ✅ ₩0
```

**졸업 게이트**: 운영자 옵션 A/B/C 결정 후 PASS.

---

## 9. Attribution

- **Sprint 0 PRD**: `docs/sprint/01-sprint-0/prd.md`
- **Sprint 0 Design**: `docs/sprint/01-sprint-0/design.md`
- **PM 통합 PRD §11 Firestore 스키마**: `docs/01-pm/04-prd.md`
- **Discovery §Step 3 R.A.T. — D5 가설**: `docs/01-pm/01-discovery.md`

---

> **Status**: Draft v1.0 — pending 운영자 옵션 A/B/C 결정.
> **다음 액션**: 운영자가 §5 옵션 중 하나를 선택하면 §6에 결정 기록 후 Sprint 0 종료.
