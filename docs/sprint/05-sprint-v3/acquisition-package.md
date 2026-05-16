# 갓깨비 키우기 가이드 — 인수 제안 패키지 (F4.4)

> **목적**: JOY MOBILE NETWORK PTE. LTD. (싱가폴 본사) / Joy Net Games (한국) / 4399 (중국 모회사)에 본 사이트 + 22개월 누적 데이터 자산 일괄 매각.
> **작성**: 2026-05-16 (Sprint V3 P3.D) · 운영자: kay@agentkay.it
> **상태**: 템플릿 — 실제 협상 시점에 V3 실데이터로 갱신.

---

## 1. 회사 가치평가 — 3법 비교

### 1-A. DCF (Discounted Cash Flow)

가정:
- **2026 매출** (V2 졸업 시점): ₩1M/월 × 12 = ₩12M/년 (광고 + 구독)
- **2027 매출** (V3 + B2B): ₩30M-100M/년 (라이선스 1건+)
- **2028 이후**: 후속작 시리즈 확장 시 ₩100M-300M/년
- **WACC**: 10% (고위험 1인 운영 가중)
- **Terminal Growth**: 0% (방치형 게임 라이프사이클 종료 가정)

5년 누적 자유 현금흐름 NPV: **₩200M-500M**

### 1-B. Comparable Sales

| 사례 | 인수가 (가설) | 멀티플 | 비고 |
|------|-------------:|------:|------|
| Game8 (日, 2015 Gunosy 인수) | ₩500M-2B | 10-20x | 게임 가이드 + 미디어 |
| GameWith (日, 상장) | 시총 수십억엔 | 5-10x | 매출/멀티플 공개 |
| Mihoyo Honkai Wiki 인수 (가설) | ₩200M+ | - | 검증 필요 |

본 사이트 추정: **₩300M-1.5B** (Game8 30-50% 수준 anchor).

### 1-C. Asset 가치평가

| 자산 | 수량 | 단가 | 합계 |
|------|----:|-----:|-----:|
| UGC 빌드 (V2 누적) | 10,000건+ | ₩30,000 | ₩300M |
| NLP 토픽 (24주 × ~100) | 2,400 unit | ₩50,000 | ₩120M |
| 구독자 LTV | 200명+ | ₩50,000 | ₩10M |
| 도메인 + 코드베이스 + 운영 노하우 | - | - | ₩30M |
| **합계** | | | **~₩460M** |

### 1-D. 종합 제안가

- **하한**: ₩300M (DCF + Asset 보수적)
- **권고**: ₩500M (Comparable 30% anchor + Asset)
- **상한**: ₩1.5B (Game8 50%, V3 매출 ₩100M+/년 검증 시)

---

## 2. 데이터 자산 평가서 (2028 Q2 기준)

### 2-A. 정량 자산

| 자산 | 수량 | 데이터 출처 | 평가 |
|------|----:|------------|----:|
| UGC 빌드 | 10,000+ | Firestore `posts` (category=build) | ₩300M |
| 댓글 (NLP 처리됨) | 50,000+ | Firestore `comments` + V2 NLP 토픽 | ₩100M |
| Pain Point 토픽 | 100+ × 24주 | `pain_topics` + `pain_mentions` | ₩120M |
| 구독자 LTV | 200+ | `subscriptions` + `payment_history` | ₩10M |
| API 라이선스 잠재 (4399 후속작) | 옵션 | V3 `api_clients` 인프라 | ₩200M |

### 2-B. 정성 자산

- 22개월 누적 도메인 권위 (Branded Search "갓깨비 가이드" Share 40%+)
- 의사결정자 네트워크 (LinkedIn 50건+ Cold Outreach 응답)
- 운영 노하우 — 콘텐츠 D2 하이브리드 70/30 정책
- 후속작 재활용 가능 인프라 (Next.js + Firestore + NLP + i18n)
- B2B API + admin SaaS whitelabel 시스템 (V3 P3.B+C 완성)

---

## 3. 인수 후 운영 매뉴얼 — 운영자 → 인수자 인계 항목

### 3-A. 인프라 권한 양도

| 항목 | 절차 | 소요 |
|------|------|----:|
| Vercel 프로젝트 | Team 전환 (Vercel 표준 transfer flow) | 1일 |
| Firebase 프로젝트 | Google Cloud transfer (Owner 권한) | 3-5일 |
| 도메인 (Whois) | 등록업체 이관 | 5-7일 |
| GA4 propertyID | Google Analytics user role 전환 | 1일 |
| Toss Payments 가맹점 | Toss 콘솔 사업자 변경 (계약서 갱신 필요) | 7-14일 |
| Cloudflare/CDN (있을 경우) | account 이관 | 1-3일 |

### 3-B. 시크릿 이관

`.tene/` 디렉토리는 master password로 암호화되어 있으므로 인수자에게는 plaintext 시크릿을 안전한 채널 (Signal / 1Password Shared Vault)로 전달 후, 인수자 환경에 별도 vault 재구성.

### 3-C. 콘텐츠 정책 인계

- D2 하이브리드 70/30 (운영자 30% + UGC 70%)
- Pain Point NLP 키워드 사전 (`lib/nlp/keyword-dict.ts`)
- 모더레이션 SLA (24h 응답)
- 욕설/스팸 필터 운영 노하우

### 3-D. 게임 메타 변화 추적

- 진령 11종 시드 (`lib/wiki/jinryeong-seed.ts`)
- 시너지 매트릭스 (`lib/simulator/synergy-matrix.ts`) — 10/165 시드 (운영자 보강 중)
- 콜라보 진령 콘텐츠 정책 (카카오 IP 사전 검토)

### 3-E. 영업 채널 인수

- 디시 / 네이버 카페 시드 (V1 트래픽 sources)
- LinkedIn 의사결정자 매핑 (Sprint V3 P3.E)
- Cold Outreach 메시지 3 변형 응답 데이터

---

## 4. 후속작 재활용 매뉴얼

### 4-A. 갓깨비 2 (가설) 출시 6개월 전 — 마이그레이션 시나리오

1. 사이트 도메인 재할당: `gokkaebi-guide.com` → 후속작 도메인 (또는 sub-path)
2. 빌드 스키마 (`class` / `jinryeong_3`) game-agnostic — 후속작 직업/진령 ID만 교체 (시드 파일 교체)
3. NLP 토픽 모델 재학습 — keyword-dict.ts에 후속작 한국어 키워드 추가
4. 다국어 인프라 (next-intl + JP/EN) 그대로 활용
5. B2B API endpoint 유지 — tenant_id별 데이터 분리 (post category에 게임 ID 추가)

### 4-B. 다른 4399 게임 적용 (예: 버섯커 키우기 가이드)

1. Firestore 스키마 그대로 (`posts`, `comments`, `pain_topics`, `simulator_runs` 등)
2. UI 테마만 변경 — 디자인 토큰 22개 교체 (`app/globals.css` + Tailwind config)
3. 운영자 노하우 인계 — 콘텐츠 정책 + 모더레이션 + 영업 매뉴얼

### 4-C. Whitelabel 라이선스 모드 (인수 대신)

- `tenant_themes` 컬렉션 활용 (logo + primary/secondary 컬러 + custom_domain CNAME)
- 게임사별 API Key 발급 + 데이터 격리 (api_clients/api_usage)
- 운영자가 관리자 권한 유지하면서 라이선시에게 SaaS 형태 제공

---

## 5. 거래 구조 옵션 4종

| 옵션 | 거래 형태 | 가격 | 기간 | Trigger |
|------|----------|----:|-----:|---------|
| **A. 분기 리포트 일회성** | 데이터 매출 | ₩5M-15M | 1회 | PM 분기 결산 직전 |
| **B. SaaS 메타 인사이트 구독** | SaaS | ₩3M-10M/월 | 12+개월 | 사업개발 신규 패치 신호 |
| **C. API 라이선스 (raw data)** | License | ₩30M-100M/년 | 12-36개월 | 본사 데이터팀 후속작 사전 리서치 |
| **D. Whitelabel 대시보드** | License | ₩100M-300M/년 | 36+개월 | 후속작 출시 6개월 전 |
| **E. 완전 인수 (M&A)** | M&A | ₩300M-1.5B | 일시 | DAU 5K+ 빌드 10K+ 검증 |

각 옵션은 상호 배타가 아님 — A → B → C → D → E로 step-up 가능.

---

## 6. M&A 클로징 체크리스트

- [ ] LOI 서명 (가격 + 거래 구조 + 타임라인)
- [ ] NDA 서명 (양방향 + 6개월 비밀유지)
- [ ] Due Diligence (게임사 측 30일):
  - Firestore 데이터 export 검증 (record count + sample query)
  - 코드 baseline 검토 (clean architecture + 보안)
  - Vercel + Firebase 비용 확인 (₩30K/월 수준)
  - 매출 증빙 (광고 ₩100K+/월 + 구독 ₩50K-₩1M/월)
- [ ] 본 계약 (외부 법무 검토 — 한국 + 싱가폴 dual)
- [ ] 데이터 이관 14일 (Section 3 참조)
- [ ] 운영 인계 2주 (운영자 → 인수자 직원)
- [ ] 최종 잔금 지급 (Escrow 권장)

---

## 7. 가격 협상 anchoring 카드 (F4.6 별도 문서 참조)

> 상세는 `docs/sprint/05-sprint-v3/pricing-anchoring.md` 참고.

- Game8 (日) ₩500M-2B (Gunosy 인수, 2015) → 본 사이트 30-50% anchor
- GameWith (日) 상장사 매출 데이터
- Sensor Tower Enterprise $20K-100K/년
- Mobile Index INSIGHT (한국) ₩300K-1M/월
- 본 사이트 ₩500M 제안 → Game8 25% (방어선)
