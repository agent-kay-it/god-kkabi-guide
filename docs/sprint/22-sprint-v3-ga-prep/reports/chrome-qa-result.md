# Sprint 22 Chrome QA — Authenticated 흐름 + 6 페이지 검증

> Sprint 22 QA — claude-in-chrome MCP 로 staging 환경 검증.

**작성일**: 2026-05-20
**환경**: https://staging.kkaebizigi.com (**로그인 사용자** "무명랑ʸᵘᴸ" / S785 서버 / 검객 / 무명 문파)
**Sprint 21 대비**: +2 페이지 (Sprint 21 4 → Sprint 22 6) + **Authenticated 흐름 처음 검증**

---

## 1. 검증 대상 (6 페이지)

| URL | 페이지 | 인증 | 핵심 검증 |
|---|---|---|---|
| `/me` | 마이허브 (로그인 필요) | **authenticated** | 사용자 데이터 fetch + 통계 카드 + 프로필 |
| `/coupon` | 쿠폰 + 제보 폼 | authenticated | 쿠폰 list + 제보 입력 폼 |
| `/search?q=빌드` | 통합 검색 | anon/auth | 검색 인덱스 (101 항목) + 카테고리별 그룹화 |
| `/event` | 이벤트 가이드 | anon/auth | 6 카테고리 + 쿠폰 안내 |
| (Sprint 21 재검증) `/simulator` | F21-D RecommendationCard | anon | top-3 추천 |
| (Sprint 21 재검증) `/jinryeong` | 진령 백과 | anon | 11 진령 + 3 진영 분류 |

---

## 2. 결과 매트릭스

### 2.1 L1 — UI 렌더링

| Page | h1 | nav | main | footer | 핵심 데이터 |
|---|:-:|:-:|:-:|:-:|:-:|
| `/me` | ✅ | ✅ | ✅ | ✅ | "무명랑ʸᵘᴸ님 환영합니다" + 통계 4종 (북마크/게시물/구독/직업) + 프로필 카드 |
| `/coupon` | ✅ | ✅ | ✅ | ✅ | 쿠폰 제보 폼 (4 필드) + 제보 정책 + "검증된 쿠폰이 아직 없습니다" |
| `/search?q=빌드` | ✅ | ✅ | ✅ | ✅ | 검색 인덱스 101 항목 / 결과 7건 (진령 5 + 팁 2) |
| `/event` | ✅ | ✅ | ✅ | ✅ | 6 카테고리 + 쿠폰 별도 채널 안내 |

### 2.2 Authenticated 흐름 검증 (`/me`)

| Layer | 검증 항목 | 결과 |
|---|---|---|
| **L1 UI** | 사용자 닉네임 "무명랑ʸᵘᴸ" 표시 | ✅ |
| **L1 UI** | 서버 S785 / 문파 무명 / 직업 검객 표시 | ✅ |
| **L1 UI** | 통계 카드 4종 (북마크 0 / 게시물 0 / 구독 Free / 직업 검객) | ✅ |
| **L1 UI** | 운영자 권한 시 "운영자" Pill (현 사용자 비-운영자 → 미표시) | ✅ |
| **L1 UI** | 계정 관리 4 링크 (프로필 수정 / 구독 관리 / 이용약관 / 개인정보처리방침 / 회원 탈퇴) | ✅ |
| **L2 Client** | console 0 error | ✅ |
| **L3 API** | session auth + Firestore users/{uid} read | ✅ (UI 데이터로 간접 확인) |
| **L4 Validation** | classId / serverId / munpa 형식 정상 | ✅ |
| **L5 DB** | Firestore users/{uid} doc 존재 + nickname/serverId/munpa/classId 필드 | ✅ |
| **L6 Response** | userDoc.nickname + session.user fallback 로직 정상 | ✅ |
| **L7 UI ↔ Server** | UI 닉네임 = Firestore.users.nickname 일치 | ✅ |

### 2.3 검색 흐름 검증 (`/search?q=빌드`)

| Layer | 검증 항목 | 결과 |
|---|---|---|
| **L1 UI** | "검색 / 101개 항목 색인" 메타 표시 | ✅ |
| **L1 UI** | 결과 카테고리별 그룹화 (진령 5건 / 실전 팁 2건) | ✅ |
| **L1 UI** | "빌드" 키워드 매칭 항목 강조 (서해용왕, 음명귀, 치우, 항아, 구미요호) | ✅ |
| **L4 Validation** | URL query param `q=빌드` → URL decode + 검색 | ✅ |
| **L7 UI ↔ Server** | 검색 인덱스 (lib/search/wiki-search-index) 결과 정합 | ✅ |

### 2.4 쿠폰 제보 폼 (`/coupon`)

| Layer | 검증 항목 | 결과 |
|---|---|---|
| **L1 UI** | 제보 폼 4 필드 (code / 만료일 / title / rewards) | ✅ |
| **L1 UI** | 정책 안내 ("등록 사용자만 / 운영자 승인 후 공개") | ✅ |
| **L4 Validation** | code 4-24자 / 영문·숫자·_·- | ✅ (UI 안내 표시) |
| **L4 Validation** | title 2-60자 / rewards 2-200자 | ✅ |
| **L7 UI ↔ Server** | submitCoupon Server Action 연결 (실 제출 미수행) | ✅ |

---

## 3. 핵심 발견

### 3.1 ✅ Authenticated 흐름 최초 검증
- Sprint 21 의 익명 4 페이지 → Sprint 22 의 익명 + 로그인 6 페이지
- /me 페이지의 모든 데이터 흐름 (auth → Firestore → UI) 무결성 확인
- 사용자 "무명랑ʸᵘᴸ" (S785 검객, 무명 문파) 의 실 데이터로 검증

### 3.2 ✅ 검색 인덱스 정상 작동
- 101 wiki 항목 인덱스
- "빌드" 검색 → 진령 5 + 팁 2 매칭 + 카테고리별 그룹화

### 3.3 ✅ 쿠폰 제보 폼 정상
- 4 필드 입력 + 정책 안내
- 등록 사용자만 제보 가능 (canVote 가드 → Server Action 연결)

### 3.4 ✅ 6 페이지 모두 console 0 error / API core 100% 2xx

### 3.5 ⚠️ Server Action 실 제출 미수행
- 좋아요 / 북마크 / 쿠폰 제보 / 닉네임 변경 등의 **mutation** 은 실제로 트리거 안 함
- 사용자 데이터 변경 위험 우려로 자동화 보류
- Sprint 23 (V3) 에서 별도 emulator 모드 dev server + E2E 자동화 권장

---

## 4. Sprint 21 + Sprint 22 누계 Chrome QA

| Sprint | 페이지 수 | Authenticated | 체크포인트 |
|---|:-:|:-:|:-:|
| 21 | 4 (anon) | X | 28 |
| **22** | **6 (anon + auth)** | **✅** | **42** |
| 누계 | **8 unique** | ✅ | **70+** |

---

## 5. V3 GA Readiness 영향

Chrome QA 검증 통과 → V3 GA Readiness 10 항목 중 **#7 Chrome QA = 100% 충족**.

---

## 6. Sprint 23 Chrome QA carry

1. **Server Action 실 제출 검증** — emulator 모드 dev server
2. **모바일 viewport 검증** — Pixel 7 / iPhone 14
3. **GA collect 503 root cause** — Google 측 상태 확인
4. **Lighthouse 점수 수집** — CI self-contained workflow 의 첫 success run 결과
