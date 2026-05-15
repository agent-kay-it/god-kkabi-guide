# 데이터 이관 기술 명세 (V3 P3.D)

> 인수 / 라이선스 계약 시 운영자가 인수자에게 인계할 데이터 이관 절차.
> 작성: 2026-05-16 · 운영자: kay@agentkay.it

---

## 1. 이관 대상 Firestore 컬렉션 (V3 종료 시점)

| 컬렉션 | 용도 | 보안 등급 |
|--------|------|----------|
| `users` | 사용자 프로필 (PIPA 5필드 + 동의) | 🔴 PII |
| `user_settings` | UI 설정 (북마크 등) | 🟡 사용자 |
| `posts` | UGC 빌드/가이드/리뷰 | 🟢 공개 |
| `posts/{id}/comments` | 댓글 (collection-group) | 🟢 공개 |
| `post_edit_audits` | 24h 편집 감사 로그 | 🟡 admin |
| `reports` | 신고 + 페널티 audit | 🔴 PII |
| `coupons` | 쿠폰 코드 + 검증 status | 🟢 공개 |
| `events` | GA4 Firestore 백업 (3 core events) | 🟡 분석 |
| `pain_topics` | NLP 토픽 (주별) | 🟢 인사이트 |
| `pain_mentions` | NLP 매칭 인스턴스 | 🟢 인사이트 |
| `subscriptions` | 프리미엄 구독 (Toss) | 🔴 결제 |
| `payment_history` | 결제 내역 (idempotent orderId) | 🔴 결제 |
| `simulator_runs` | 진령 3선 시뮬레이션 결과 | 🟢 분석 |
| `jinryeong_stats` | 채용률 주간 aggregation | 🟢 분석 |
| `pvp_stats` | PvP 빌드 트렌드 주간 | 🟢 분석 |
| `wiki_*` (class/jinryeong/skill/equipment/content/munpa) | 위키 시드 + 운영자 보강 | 🟢 공개 |
| `api_clients` (V3 신규) | B2B API tenant 정보 + Key hash | 🔴 보안 |
| `api_usage` (V3 신규) | 일일 API 호출 카운트 | 🟡 분석 |
| `tenant_themes` (V3 신규) | whitelabel 테마 | 🟡 게임사 |
| `external_signals` (V3 신규) | 사람인/Google News 등 외부 신호 | 🟡 인사이트 |
| `user_claims_retry_queue` (V3 신규) | setUserClaims 재시도 큐 | 🟡 admin |

---

## 2. 이관 단계 (총 14일)

```
Day 1-2  : Firebase Admin SDK export (전 컬렉션 JSON)
Day 3-5  : BigQuery export (인수자 클라우드)
Day 6-8  : 인수자 Firebase / 다른 클라우드 import
Day 9-10 : Vercel project + GitHub repo transfer
Day 11-12: 도메인 DNS 이관 (Whois)
Day 13   : Toss Payments 가맹점 변경 (계약 재서명 필요)
Day 14   : 1주 무손실 운영 검증
```

---

## 3. Step 1: Firestore export (Firebase Admin SDK)

```bash
# 운영자 시점 — Firebase CLI + gcloud
firebase auth:export users.json --project god-kkabi-guide
gcloud firestore export gs://god-kkabi-guide-backup/$(date +%Y-%m-%d)/ \
  --collection-ids=users,user_settings,posts,reports,coupons,events,pain_topics,pain_mentions,subscriptions,payment_history,simulator_runs,jinryeong_stats,pvp_stats,api_clients,api_usage,tenant_themes,external_signals,user_claims_retry_queue \
  --project god-kkabi-guide
# wiki_* 6 컬렉션 별도 (cardinality 작음)
gcloud firestore export gs://god-kkabi-guide-backup/$(date +%Y-%m-%d)/wiki/ \
  --collection-ids=wiki_class,wiki_jinryeong,wiki_skill,wiki_equipment,wiki_content,wiki_munpa
```

**검증**: export 직후 BigQuery 임시 데이터셋으로 import → record count 비교.

---

## 4. Step 2: BigQuery 인계 (인수자 클라우드)

인수자가 자신의 GCP project에서 import:

```bash
gcloud firestore import gs://god-kkabi-guide-backup/2028-Q2/ \
  --project <acquirer-project-id>
```

**검증 쿼리 (인수자 측)**:

```sql
SELECT
  '__collection__' AS collection,
  COUNT(*) AS record_count
FROM `<acquirer-project>.firestore_export.users`
UNION ALL
SELECT 'posts', COUNT(*) FROM `<acquirer-project>.firestore_export.posts`
-- 전 컬렉션 동일 패턴
```

---

## 5. Step 3: Vercel + GitHub 이관

### 5-A. Vercel team transfer

운영자 → 인수자 team으로 project 이관. Vercel 표준 flow:

1. 운영자: Vercel Dashboard → project Settings → Transfer
2. 인수자 team email 입력
3. 인수자: 수락 알림 클릭 → team 권한 inherit

> ⚠️ 환경변수는 새 project에서 다시 설정 필요. tene vault에서 인수자 환경으로 별도 import.

### 5-B. GitHub repository

- 운영자 → 인수자 organization으로 transfer (또는 fork 후 운영자 archive)
- branch protection rules 인수자 측 재설정 필요

---

## 6. Step 4: 도메인 + DNS

- 운영자 등록업체 (예: Cloudflare / Namecheap) → 인수자 등록업체 transfer
- AUTH-code 전달 (안전한 채널)
- 5-7일 transfer 대기
- DNS records 이관 후 Vercel에서 도메인 verify

---

## 7. Step 5: Toss Payments 가맹점 변경

- Toss 콘솔에서 사업자 정보 변경 신청 (운영자 → 인수자 사업자)
- Toss 측 검토 7-14일
- 변경 완료 후 `TOSS_SECRET_KEY` / `TOSS_WEBHOOK_SECRET` 재발급 → 인수자 환경 설정
- 구독자 (200+) billing key는 customerKey 단위로 유지 — 가맹점 변경 후에도 자동 갱신 정상

---

## 8. Step 6: 시크릿 이관 (tene)

운영자가 인수자에게 plaintext 시크릿을 안전한 채널 (Signal / 1Password Shared Vault)로 전달 후, 인수자 환경에서 tene vault 별도 구성.

**전달 대상 시크릿**:

| 시크릿 | 환경 | 용도 |
|--------|------|------|
| FIREBASE_SERVICE_ACCOUNT_JSON | server | Admin SDK |
| TOSS_SECRET_KEY | server | 결제 confirm |
| TOSS_WEBHOOK_SECRET | server | webhook HMAC |
| NEXTAUTH_SECRET | server | JWT 서명 |
| KAKAO_CLIENT_ID / SECRET | server | OAuth |
| GOOGLE_CLIENT_ID / SECRET | server | OAuth |
| NEXT_PUBLIC_FIREBASE_* | client | Firebase Web SDK |
| NEXT_PUBLIC_TOSS_CLIENT_KEY | client | Toss widget |
| NEXT_PUBLIC_ADSENSE_PUBLISHER | client | AdSense |
| CRON_SECRET | server | Vercel cron |
| SARAMIN_API_KEY (V3 신규) | server | ETL |
| NEWS_API_KEY (V3 신규) | server | ETL |
| B2B_API_CORS_ORIGINS (V3 신규) | server | CORS |

운영자는 시크릿 전달 후 본인 환경의 시크릿을 회전 (rotate) 또는 폐기.

---

## 9. Step 7: 검증 (1주 무손실 운영)

- 인수자 환경에서 1주 운영
- 매일 record count 비교 (인수자 vs 운영자 백업)
- 결제 정기갱신 5건+ 정상 작동 검증
- API 호출 패턴 정상 (api_usage 일별 카운트)
- GA4 / AdSense / Firebase Console 모두 인수자 권한으로 접근 가능

---

## 10. 데이터 손실 0건 보장 SLA

운영자는 본 절차에 따라 이관 시 데이터 손실 0건을 SLA로 보장. 손실 발생 시:

1. 운영자가 보관한 backup (`gs://god-kkabi-guide-backup/` 90일 보존)에서 복원
2. 인수자 환경에 incremental import
3. record count diff 보고서 제공
4. 30일 무상 운영 지원 포함 (인수 계약 조항)
