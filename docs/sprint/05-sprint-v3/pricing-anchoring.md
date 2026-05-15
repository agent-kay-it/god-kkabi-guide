# 가격 앵커링 자료 (F4.6)

> 가격 협상 시 운영자가 사용할 anchoring 카드 (인수 ₩300M-1.5B / 라이선스 ₩30M-100M/년 정당화).
> 작성: 2026-05-16 (Sprint V3 P3.E) · 운영자: kay@agentkay.it

---

## 1. Comparable Sales — 게임 가이드 / 미디어 인수

### 1-A. Game8 (日, 2015)

| 항목 | 값 |
|------|-----|
| 인수자 | Gunosy (上場社, 当時) |
| 인수가 | 추정 ₩500M-2B |
| 인수 시점 | 2015 |
| 운영 인원 | 수십 명 (정규직 + 외주) |
| 매출 | 광고 + 게임사 제휴 |
| 거래 구조 | 100% 인수 |

**anchor**: 본 사이트는 1인 운영 + 22개월 (Game8 vs 10년+ 격차) → Game8 25-30% (₩125M-600M) 방어선.

### 1-B. GameWith (日, 상장사)

| 항목 | 값 |
|------|-----|
| 거래 형태 | IPO (2017) |
| 시총 (피크) | 수십억엔 |
| 매출 (2024 기준) | 약 ¥3B/년 (≈₩30B) |
| 사업 모델 | 광고 + 게임 가이드 + 게임사 콜라보 |

**anchor**: GameWith 1% (₩300M) 가 본 사이트 25-50% 인수가의 정당화 근거.

### 1-C. Mihoyo Honkai Wiki (가설)

| 항목 | 값 |
|------|-----|
| 인수가 (가설) | ₩200M+ |
| 시점 | (검증 필요) |

> ⚠️ 운영자가 영업 시점에 실제 검증 필요.

---

## 2. SaaS Pricing Comparables — B2B 게임 데이터 SaaS

### 2-A. Sensor Tower Enterprise

| Plan | 연간 가격 |
|------|---------:|
| Standard | $5,000-10,000/년 |
| Premium | $20,000-50,000/년 |
| Enterprise | $50,000-100,000+/년 |

**anchor**: 본 사이트 라이선스 ₩30M-100M/년 ≈ Sensor Tower Standard~Premium 수준 → "한국 시장 특화 + 갓깨비 단일 IP 집중"으로 차별화.

### 2-B. Mobile Index INSIGHT (한국)

| Plan | 가격 |
|------|------:|
| Basic | ₩300K/월 (₩3.6M/년) |
| Pro | ₩1M/월 (₩12M/년) |
| Enterprise | ₩2M+/월 |

**anchor**: Mobile Index Enterprise 1년치 (₩24M+) = 본 사이트 API 라이선스 Starter tier 1년치와 동급. 단 본 사이트는 갓깨비 deep dive + UGC + NLP까지 포함.

### 2-C. data.ai (구 App Annie) Intelligence

| Plan | 연간 가격 |
|------|---------:|
| Enterprise | $30,000-80,000/년 |

**anchor**: data.ai은 글로벌 분석. 본 사이트는 갓깨비 deep dive — 다른 차원의 정확도.

---

## 3. 라이선스 + Whitelabel 패턴

### 3-A. Gamewith Whitelabel API (가설)

- 게임사가 외부 가이드 사이트의 데이터를 자사 admin SaaS 형태로 라이선스
- 추정 ₩100M-300M/년 (3년+ 계약 시 할인)

본 사이트 V3 admin SaaS demo (`/(admin-saas)/tenant`)는 이 패턴을 즉시 구현 가능.

### 3-B. Steam DB / Tracker.gg (서구권)

- 게임사가 직접 sponsor하는 외부 가이드 (Counter-Strike, Apex 등)
- 가격 비공개, 추정 $50K-500K/년

---

## 4. 본 사이트 가격 제안 — Step-up 사다리

| Stage | 거래 | 가격 | 트리거 |
|-------|------|-----:|--------|
| 1 | 분기 리포트 일회성 | ₩5M-15M | 첫 거래 (게임사 시범) |
| 2 | SaaS 메타 인사이트 구독 | ₩3M-10M/월 = ₩36M-120M/년 | 분기 만족 후 12개월 계약 |
| 3 | API 라이선스 (raw) | ₩30M-100M/년 | 본사 데이터팀 internal BI 통합 |
| 4 | Whitelabel 대시보드 | ₩100M-300M/년 | 후속작 출시 6개월 전 |
| 5 | 완전 인수 (M&A) | ₩300M-1.5B | DAU 5K+ 빌드 10K+ 검증 |

---

## 5. 협상 카드

### 5-A. 첫 제안 (high anchor)

> "Game8 사례 30-50%인 ₩500M-1.5B 일시 인수, 또는 Whitelabel ₩200M/년 3년 계약 (총 ₩600M)을 제안드립니다."

### 5-B. 카운터 대응 — 게임사 ₩100M 카운터 시

> "Whitelabel 대신 SaaS 구독 ₩5M/월 (₩60M/년) + 분기 리포트 별도 ₩10M × 4분기 = 1년 ₩100M로 step-down 가능합니다. 단 데이터 가공물만 제공하고 raw data 라이선스는 제외."

### 5-C. 최저 방어선 — ₩30M/년 미만 제안 시

> "이 가격은 운영 비용 ($100/월 인프라 + 운영자 시간 ₩X/시간 × Y h)을 회수하지 못합니다. 거래 보류하고 추가 데이터 누적 후 (2분기) 재논의 제안드립니다."

### 5-D. 멀티플 사다리

본 사이트 매출 멀티플 (Comparable):
- 데이터 가공물 (B2B SaaS): **5-15x** 매출 ($ARR × multiplier)
- M&A: **10-30x** 매출 (Strategic premium)

→ V3 매출 ₩100M/년 + B2B ₩100M/년 = ₩200M/년 → 10x = ₩2B (인수 상한 가설)

---

## 6. 협상 시뮬레이션 (운영자 self-roleplay)

### 시나리오 A: 게임사 PM "₩30M/년 너무 비쌈"

운영자: "이해합니다. ₩30M/년은 raw API + Pro tier + 분기 리포트 4건을 포함한 가격이고, Mobile Index Enterprise (₩24M/년) + Sensor Tower Standard ($10K = ₩13M) 합산보다 살짝 낮습니다. 갓깨비 deep dive + Korean NLP 차별점을 고려해주세요. 12개월 계약 시 ₩25M로 5% 할인 가능합니다."

### 시나리오 B: 게임사 "Pilot ₩1M 부터 해보자"

운영자: "Pilot ₩1M은 운영 비용에 미달하나, 신뢰 구축을 위해 ₩3M (1분기 + API Starter tier + 분기 리포트 1건)으로 진행하고, 1분기 후 만족도 4.0+ 시 ₩30M/년 전환 또는 SaaS 구독으로 step-up 옵션 명시 조건이면 가능합니다."

### 시나리오 C: 인수 협상에서 "₩200M offer"

운영자: "Game8 30% 가격인데 본 사이트는 1인 운영 22개월이라는 비대칭이 있어 합리적입니다. 다만 ₩200M은 Asset 평가 (₩460M)의 절반에 못 미칩니다. ₩350M + 운영자 12개월 운영 인계 계약 (별도 ₩50M)으로 합계 ₩400M 제안드립니다."

---

> Status: Draft v1.0 (Sprint V3 P3.E). 실제 협상 시 운영자 검수 + 외부 영업 컨설팅 1회성 권장.
