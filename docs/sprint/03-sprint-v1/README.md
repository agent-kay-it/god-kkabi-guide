# Sprint V1 — UGC 커뮤니티 + 매출 시드 (Firebase Auth + 댓글 + 빌드 공유)

> **Sprint ID**: `god-kkabi-guide-sprint-v1`
> 기간: M4-M9 (24주, 약 168일, 2026-08-10 ~ 2027-02-07)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.3, §5.1
> 입력: Sprint MVP M6 졸업 (DAU 500+) + `docs/01-pm/04-prd.md` §7.3 + `docs/01-pm/05-decisions.md` 4건

---

## 한 줄 결론

**"MVP 시드 트래픽(DAU 500+) 위에 Firebase Auth(Google/Kakao) + 댓글(Firestore) + 빌드 공유(UGC) + AdSense 광고를 도입해 P2 공유러 페르소나를 활성화하고, M9 시점 DAU 2,000+ / 빌드 누적 1,000+ / 매출 ₩100K+/월의 V2 진입 졸업 KPI를 달성한다."**

---

## Sprint V1 7 Feature (Master Plan §2 매핑)

| Feature ID | 이름 | 우선순위 | Phase 매핑 |
|-----------|------|---------|----------|
| F2.1 | Firebase Auth (Google/Kakao 소셜 로그인) | P0 | design, do |
| F2.2 | 댓글 시스템 (Firestore comments) | P0 | design, do |
| F2.3 | 빌드 공유 (직업+진령3+스킬+제련, UGC) | P0 | design, do |
| F2.4 | 좋아요·북마크·신고 (denormalized counter) | P1 | do |
| F2.5 | 운영자 모더레이션 도구 (admin route) | P0 | design, do |
| F2.6 | AdSense 광고 (1-2 슬롯, 모바일 가독성 우선) | P1 | do (DAU 500+ 시점) |
| F2.7 | Pain Point 수집 (NLP는 V2, V1은 raw 누적) | P2 | do |

---

## 진입 게이트 (MVP M6 졸업)

- [x] Sprint MVP M6 시점 DAU 500+ 달성 (90일 누적)
- [x] Sprint MVP Lighthouse 모바일 ≥90 (5개 핵심 페이지)
- [x] Sprint MVP SERP "갓깨비 키우기 공략" 상위 30위 진입
- [x] Sprint MVP 쿠폰 페이지 PV 누적 1,000+ (90일)
- [x] Sprint MVP 5개 핵심 GA4 이벤트 정상 발화
- [x] Firestore 6 컬렉션 스키마 Sprint 0 검증 결과 + MVP 활성 2개(`coupons`, `events`) 확장 가능 상태
- [x] 운영자 결정: V1 진입 (수동 게이트, M6 시점)

## 졸업 게이트 (PASS 조건, M9 시점)

- [ ] **DAU 2,000+** (180일 누적 일평균)
- [ ] **빌드 누적 1,000+** (Firestore `builds` 컬렉션 count)
- [ ] **댓글 누적 5,000+** (Firestore `comments` 컬렉션 count)
- [ ] **매출 ₩100K+/월** (AdSense 대시보드)
- [ ] **신규 회원가입 100/주** (Firebase Auth + Firestore `users`)
- [ ] M3 securityScan PASS (Auth 보안 규칙 + CSRF 방어)
- [ ] M7 dataFlowIntegrity 7-layer PASS (URL → Auth → 댓글 → 빌드 → 좋아요)

---

## 폐기/피벗 트리거

| 시점 | 조건 | 액션 |
|------|------|------|
| M9 | DAU 2K+ AND 빌드 1K+ | V2 진입 (시뮬레이터 + 구독) |
| M9 | DAU 1K-2K (보류) | V1 6개월 연장 (M15까지) |
| M9 | DAU <1K | V2 보류, MVP 콘텐츠 깊이 강화 (Master Plan §5.3) |
| 모든 Phase | QUALITY_GATE_FAIL (Auth 보안 / 댓글 모더레이션 부하) | Phase act에서 iterate |
| 모든 Phase | BUDGET_EXCEEDED ($10/월 초과) | Firestore reads 분석 + 캐싱 강화 또는 Blaze 결정 |

---

## 산출물 (Sprint V1 종료 시 추가되는 코드/문서)

```
god-kkabi-guide/                          (GitHub repo, MVP에서 이어짐)
├── app/                                   (Next.js 16 App Router)
│   ├── (auth)/                           (V1 신규)
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   └── consent/page.tsx              (PIPA 동의)
│   ├── (admin)/                          (V1 신규, 운영자 전용)
│   │   ├── moderate/page.tsx             (신고 처리)
│   │   └── coupons/page.tsx              (쿠폰 관리)
│   ├── builds/
│   │   ├── new/page.tsx                  (V1 신규, 빌드 작성 폼)
│   │   ├── [slug]/page.tsx               (V1 신규, 빌드 상세 영구 URL)
│   │   └── meta-swordsman/page.tsx       (MVP 유지)
│   └── ...                               (MVP 페이지 유지)
├── components/
│   ├── auth/                             (V1 신규, AuthProvider, SignInButton)
│   ├── comments/                         (V1 신규, CommentList, CommentForm)
│   ├── builds/                           (V1 신규, BuildForm, BuildCard, LikeButton)
│   └── ...                               (MVP 컴포넌트 유지)
├── lib/
│   ├── firebase/                         (MVP 유지)
│   ├── auth/                             (V1 신규)
│   └── moderation/                       (V1 신규, 욕설 필터)
└── docs/sprint/03-sprint-v1/
    ├── prd.md
    ├── plan.md
    ├── design.md
    ├── check-report.md                   (Phase check)
    ├── qa-report.md                      (Phase qa)
    ├── report.md                         (Phase report)
    └── archive-notes.md                  (Phase archive)
```

---

## 다음 Sprint

V1 졸업 KPI 달성 시 (M9) → [Sprint V2](../04-sprint-v2/README.md) Phase plan 진입.
보류 시 → V1 6개월 연장.
폐기 시 → MVP 콘텐츠 깊이 강화 모드로 전환.
