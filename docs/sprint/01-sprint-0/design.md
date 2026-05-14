# Sprint 0 Design — 가상 리포트 3종 구조 + Firestore 매핑표 설계

> **Sprint ID**: `god-kkabi-guide-sprint-0`
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md`
> PRD: `docs/sprint/01-sprint-0/prd.md` · Plan: `docs/sprint/01-sprint-0/plan.md`

---

## 1. 본 Design 문서의 역할

Sprint 0는 단축 4 Phase 사이클이지만, 가상 리포트 3종 작성 시 일관된 구조와 매핑 형식이 필요하므로 본 design.md를 작성한다. 본 문서는 Phase 1(plan)의 산출물로, Phase 2(do)에서 운영자/AI가 가상 리포트를 작성할 때 템플릿으로 사용한다.

---

## 2. 가상 리포트 3종 공통 구조

각 리포트는 다음 9 섹션 구조로 작성한다.

```
1. Executive Summary (1 페이지)
   - 한 줄 결론
   - 4-Perspective Value (Problem / Solution / Function UX / Core Value)
   - Top 3 발견

2. 메서드론
   - 데이터 수집 기간
   - 샘플 크기
   - 가공 방법 (SQL/NLP/통계)
   - 한계 (가설 — 검증 필요 표기)

3. 핵심 분석 (5-10 차트/표)
   - 각 차트마다 데이터 출처 (Firestore 컬렉션·필드) 명시

4. 인사이트 도출
   - 패턴 식별
   - 시장/유저 행동 해석

5. 권고사항 (Recommendation)
   - 4399/Joy Games에 직접 적용 가능한 액션 5-10개

6. 부록 — 데이터 필드 명세
   - 본 리포트가 사용한 모든 데이터 필드 표
   - Firestore 컬렉션 매핑

7. 가격 정당화 (Pricing Justification)
   - 비교군 (Sensor Tower, Mobile Index, GameWith)
   - ROI 계산 (게임사 관점)

8. 라이선스 / 데이터 사용 권한

9. Contact / Next Steps
```

### 2.1 분량 가이드

| 리포트 | 분량 (Markdown) | 가상 PDF 환산 |
|--------|--------------|---------------|
| Report 1 메타 인사이트 | 2,500-3,500 자 | 약 30-40 페이지 |
| Report 2 이탈 시그널 SaaS | 2,000-3,000 자 | 주간 알람 + 대시보드 mock |
| Report 3 후속작 리서치 | 3,000-4,000 자 | 약 50 페이지 |

> Phase 2(do)에서 실제 작성 시 분량 가이드는 가이드일 뿐, 운영자 시간 가용성에 따라 조정 가능.

---

## 3. Firestore 6 컬렉션 필드 인벤토리 (PRD §11 재정리)

### 3.1 `users` 컬렉션

```typescript
interface UserDoc {
  uid: string;
  display_name?: string;     // V1+
  email_hash?: string;
  created_at: Timestamp;
  last_login_at: Timestamp;
  signed_up_via: 'google' | 'kakao' | 'anonymous';
  consent: {
    analytics: boolean;
    profile_public: boolean;
    consented_at: Timestamp;
  };
}
```

**V3 활용**: 신규 가입 추이, 회원 코호트 분석, PIPA 동의률 추적.

### 3.2 `builds` 컬렉션

```typescript
interface BuildDoc {
  id: string;
  uid: string;
  class: 'warrior' | 'swordsman' | 'medium';
  jinryeong_3: string[];          // 진령 ID 3개
  skill_set: { core: string; active: string; passive: string };
  equipment_grade: number;        // 0-10
  description?: string;
  is_public: boolean;
  likes_count: number;
  bookmarks_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  source: 'self_report' | 'screenshot' | 'manual_admin';
}
```

**V3 활용**: 진령 채용률 (jinryeong_3 unnest), 직업×진령 시너지, 빌드 다양성 지수.

### 3.3 `tier_votes` 컬렉션

```typescript
interface TierVoteDoc {
  id: string;                     // uid + jinryeong_id + week
  uid: string;
  jinryeong_id: string;
  vote: 'S' | 'A' | 'B' | 'C' | 'D';
  voter_class?: string;
  voter_level_estimate?: number;
  week: string;                   // 'YYYY-Wnn'
  created_at: Timestamp;
}
```

**V3 활용**: 주간 티어 변화, 직업별 진령 인식 차이.

### 3.4 `coupons` 컬렉션

```typescript
interface CouponDoc {
  id: string;
  code: string;
  description: string;
  reward: string;
  status: 'valid' | 'expired' | 'unknown';
  starts_at: Timestamp;
  expires_at?: Timestamp;
  reported_invalid_count: number;
  last_verified_at: Timestamp;
  source: 'official' | 'community' | 'admin';
}
```

**V3 활용**: 쿠폰 만료 후 이탈, 쿠폰별 유효성 신뢰도 (커뮤니티 제보).

### 3.5 `events` 컬렉션 (GA4 백업)

```typescript
interface EventDoc {
  id: string;
  event_name: string;             // 'page_view' | 'coupon_copy' | 'build_create' | ...
  uid?: string;
  session_id: string;
  page: string;
  payload: Record<string, any>;
  timestamp: Timestamp;
  user_agent_hash: string;
  referrer_source?: string;
}
```

**V3 활용**: 페이지 funnel 분석, 이탈 시그널, 외부 referer 패턴.

### 3.6 `pain_topics` 컬렉션 (V2+ NLP)

```typescript
interface PainTopicDoc {
  id: string;
  topic: string;
  sentiment: -1 | 0 | 1;
  frequency: number;
  week: string;                   // 'YYYY-Wnn'
  source: 'comment' | 'dc_curation';
  sample_quotes: string[];
}
```

**V3 활용**: 페인포인트 NLP 클러스터, 주간 부정 감정 토픽 추이.

---

## 4. 매핑표 템플릿 (`schema-validation.md` 구조)

Phase 2.T07에서 작성할 `schema-validation.md`의 구조를 미리 설계한다.

### 4.1 헤더

```markdown
# Schema Validation — Sprint 0 R.A.T. PASS/FAIL 보고

> 작성일: 2026-05-XX · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 입력: report-1/2/3 + PRD §11 Firestore 스키마
> 결과: PASS / FAIL (운영자 최종 판단)
```

### 4.2 매핑 매트릭스 (3 리포트 × 6 컬렉션)

```markdown
| Report | 필요 데이터 필드 | 매핑 컬렉션 | 필드 경로 | PASS/FAIL |
|--------|-------------|----------|---------|----------|
| Report 1 | 진령 채용률 (주간) | builds | jinryeong_3 (unnest) + created_at (week) | ✅ |
| Report 1 | 메타 변화 시그널 | builds + tier_votes | weekly aggregation | ✅ |
| Report 1 | 신규 진령 빌드 전환 속도 | builds | created_at + jinryeong_3 시계열 | ✅ |
| Report 1 | 직업×진령 시너지 분포 | builds | class × jinryeong_3 cross-tab | ✅ |
| Report 1 | 결투장 메타 빌드 TOP 10 | builds + events | filter description contains '결투장' OR class+meta tags | ⚠️ (description 필드 NLP 필요 또는 별도 tag 필드 추가) |
| Report 2 | 페이지별 이탈률 | events | page + session_id sequence | ✅ |
| Report 2 | 페인포인트 NLP 클러스터 | pain_topics | topic + sentiment + frequency | ✅ |
| Report 2 | 보스 던전 별점 분포 | (없음) | ❌ MVP 스키마에 별점 컬렉션 없음 | ❌ FAIL — V1+ rating 컬렉션 추가 필요 |
| Report 2 | 결제 이탈 단계 | events | event_name = 'payment_drop' (V2 결제 도입 시) | ⚠️ V2 이벤트 추가 필요 |
| Report 2 | 빌드 다양성 지수 | builds | Shannon entropy on jinryeong_3 | ✅ |
| Report 3 | 갓깨비 1 → 대체 게임 언급 | pain_topics + events | comment NLP + referrer_source 'naver' | ⚠️ (NLP 토픽 모델 별도) |
| Report 3 | 후속작 기대도 시그널 | pain_topics | topic 'next_title' filter | ✅ |
| Report 3 | 4399 채용 공고 분석 | (외부 데이터) | LinkedIn API + 운영자 수동 | ❌ MVP 스키마 외부 — V3 외부 데이터 소스 추가 |
| Report 3 | 동양 IP 키우기 시장 매출 | (외부 데이터) | Sensor Tower API | ❌ 외부 |
| Report 3 | 한국 시장 진입 시점 추천 | builds + events | seasonality 분석 (월별 빌드 작성 수) | ✅ |
```

### 4.3 종합 PASS/FAIL 판단

```markdown
| 리포트 | 매핑 PASS | 매핑 FAIL/⚠️ | 결론 |
|--------|---------|-------------|------|
| Report 1 | 4/5 | 1/5 (description NLP) | ⚠️ description 필드에 `tags: string[]` 보강 권장 |
| Report 2 | 2/5 | 3/5 (별점/결제/외부) | ⚠️ V1에서 ratings 컬렉션 추가, V2 결제 이벤트 정의 |
| Report 3 | 2/5 | 3/5 (외부 데이터 + NLP) | ⚠️ MVP 스키마 외 외부 데이터 소스 V3 시점 결정 |
```

### 4.4 운영자 결정 옵션

```markdown
**옵션 A**: 매핑 ⚠️ 항목을 MVP 스키마 보강으로 해결 → Sprint 0 1일 추가, MVP 진입 PASS
**옵션 B**: V3 리포트 스코프 축소 → ⚠️ 항목 제거, MVP 진입 PASS
**옵션 C**: V3 시점 외부 데이터 소스 도입 가정 → MVP 스키마 변경 없음, MVP 진입 PASS

운영자 결정: [Phase 3에서 기록]
```

---

## 5. 가상 리포트 3종 차트/표 명세 (Phase 2 산출물 가이드)

### 5.1 Report 1 메타 인사이트 차트 명세 (5종)

| 차트 ID | 차트 명 | X축 | Y축 | 데이터 소스 |
|---------|------|----|----|----------|
| R1-C1 | 진령 11종 12주 채용률 추이 | 주(week) | 채용률 (%) | `builds.jinryeong_3` 주별 group |
| R1-C2 | 메타 변화 시그널 (±N% 임계 도달) | 주(week) | 변화율 (%) | R1-C1 delta |
| R1-C3 | 신규 진령 출시 후 전환 속도 | 출시 후 시간 (h) | 채용률 (%) | `builds.created_at` + 출시 일자 |
| R1-C4 | 직업×진령 시너지 분포 | 진령 ID | 직업 비율 | `builds.class × builds.jinryeong_3` cross-tab |
| R1-C5 | 결투장 메타 빌드 TOP 10 | 빌드 ID | 좋아요 수 | `builds.likes_count` + tag/description filter |

### 5.2 Report 2 이탈 시그널 SaaS 차트 명세 (5종)

| 차트 ID | 차트 명 | X축 | Y축 | 데이터 소스 |
|---------|------|----|----|----------|
| R2-C1 | 페이지 funnel 이탈률 | 페이지 순서 | 이탈률 (%) | `events.page` sequence |
| R2-C2 | 페인포인트 TOP 10 부정 토픽 | 토픽 | 빈도 | `pain_topics.topic + sentiment=-1` |
| R2-C3 | 보스 던전 별점 분포 | 보스 ID | 평균 별점 | (V1+ ratings 컬렉션 신설 후) |
| R2-C4 | 결제 이탈 단계 | 결제 단계 | 이탈률 | (V2 결제 이벤트 신설 후) |
| R2-C5 | 빌드 다양성 지수 추이 | 주(week) | Shannon entropy | `builds.jinryeong_3` 주별 |

### 5.3 Report 3 후속작 리서치 차트 명세 (5종)

| 차트 ID | 차트 명 | 데이터 소스 |
|---------|------|----------|
| R3-C1 | 대체 게임 언급 빈도 | `pain_topics` + 외부 NLP |
| R3-C2 | 후속작 기대도 시그널 | `pain_topics` 'next_title' |
| R3-C3 | 4399 채용 공고 분석 | 외부 LinkedIn (V3 별도 수집) |
| R3-C4 | 동양 IP 키우기 시장 매출 | 외부 Sensor Tower |
| R3-C5 | 한국 시장 진입 시점 추천 | `builds.created_at` 월별 |

---

## 6. 본 Sprint Design의 한계

본 design.md는 **가상** 리포트 작성을 위한 가이드일 뿐, 실제 데이터 분석은 V2+ 시점부터 누적된 실데이터로 가능하다. 따라서 본 Sprint 0에서 산출하는 가상 리포트는 다음 가정 위에서 작성한다:

| 가정 | 값 |
|------|-----|
| 가상 데이터 기간 | 12주 (분기) |
| 가상 빌드 수 | 1,000건 (V1 졸업 KPI) |
| 가상 댓글 수 | 5,000건 (V1 졸업 KPI) |
| 가상 DAU | 2,000명 (V1 졸업 KPI) |
| 가상 직업 분포 | 검객 50% / 전사 30% / 영매 20% (Beachhead 가설) |

이 가정은 Phase 2 가상 리포트 작성 시 차트 데이터의 mock 값으로 사용된다 (실제 수치는 V1 종료 후 측정).

---

## 7. 다음 Phase 인터페이스

Phase 1(plan) 산출물(본 design.md) → Phase 2(do) 입력으로 전달.

Phase 2에서 운영자/AI가 본 design.md §4 매핑표 템플릿과 §5 차트 명세를 사용해 `sprint-0-virtual-reports/` 하위에 가상 리포트 3종 + schema-validation.md를 작성한다.

> **Status**: Draft v1.0 — pending review.
