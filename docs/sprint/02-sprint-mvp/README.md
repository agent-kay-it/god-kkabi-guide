# Sprint MVP — 정적 가이드 사이트 출시 (Beachhead 침투)

> **Sprint ID**: `god-kkabi-guide-sprint-mvp`
> 기간: M1-M3 (12주, 약 84일)
> 작성일: 2026-05-14 · 운영자: kay@agentkay.it (1인 개인 프로젝트)
> 상위 문서: `docs/sprint/00-master-plan.md` §3.2, §5.1
> 입력: Sprint 0 PASS + `docs/01-pm/04-prd.md` §12 + `docs/01-pm/05-decisions.md` 4건

---

## 한 줄 결론

**"원본 HTML 1444 lines × 9 섹션을 Next.js 16 App Router로 이식하고, 다크/골드 한국 오컬트 무드와 모바일 first 반응형으로 검객 Beachhead(P1 검투호)에 침투해 DAU 100+ / Lighthouse ≥90 / SERP 상위 30위를 달성한다."**

---

## Sprint MVP 9 Feature

| Feature ID | 이름 | 우선순위 | Phase 매핑 |
|-----------|------|---------|----------|
| F1.1 | 콘텐츠 9섹션 이식 | P0 | do |
| F1.2 | 디자인 시스템 (다크/골드/Noto Sans KR) | P0 | design, do |
| F1.3 | 쿠폰 자동 체커 (클릭 복사 + D-day) | P0 | do |
| F1.4 | 직업 진단 3-5문항 | P1 | do |
| F1.5 | 진령 11종 카드 + 검객 메타 빌드 | P0 | do |
| F1.6 | GA4 + Firestore 스키마 (Sprint 0 검증 적용) | P0 | design, do |
| F1.7 | SEO 롱테일 50개 키워드 | P0 | do |
| F1.8 | 콘텐츠 정책 문서 (D2 70/30) | P1 | plan |
| F1.9 | 도메인 + Vercel 배포 (D1 게임-specific) | P0 | do |

---

## 진입 게이트

- [x] Sprint 0 PASS (스키마 매핑 100% 또는 보강 결정)
- [x] 운영자 사전 준비 체크리스트 (Master Plan §10.1) 완료
  - GitHub repo 생성 / Vercel 연동 / Firebase 프로젝트 / 도메인 후보 3개 / tene 시크릿 11개

## 졸업 게이트 (PASS 조건, M3 시점)

- [ ] DAU 100+ (90일 누적, GA4 측정)
- [ ] Lighthouse 모바일 ≥90 (5개 핵심 페이지: /, /coupon, /class, /jinryeong, /class/swordsman/meta)
- [ ] SERP "갓깨비 키우기 공략" 상위 30위 진입 (Google Search Console)
- [ ] 쿠폰 페이지 PV 누적 1,000+ (90일)
- [ ] 5개 핵심 GA4 이벤트 정상 발화 (page_view, coupon_copy, class_diagnose_complete, jinryeong_card_click, meta_build_view)

---

## 폐기/피벗 트리거

| 시점 | 조건 | 액션 |
|------|------|------|
| M4.5 | DAU 100 미만 AND 쿠폰 PV 500 미만 | 톤 피벗 (콘텐츠 깊이 강화) |
| M6 | DAU 500+ | V1 진입 (광고 + UGC) |
| M6 | DAU 200-500 | V1 보류, MVP 콘텐츠 깊이 강화 6개월 연장 |
| M6 | DAU 200 미만 | **MVP 폐기 검토**, 후속 4399 게임으로 도메인 재활용 |

---

## 산출물 (Sprint MVP 종료 시)

```
god-kkabi-guide/                       (GitHub repo)
├── app/                                (Next.js 16 App Router)
│   ├── layout.tsx                      (다크 모드 + Noto Sans KR)
│   ├── page.tsx                        (홈 — 직업 진단 CTA + 쿠폰 CTA)
│   ├── coupon/page.tsx                 (F1.3)
│   ├── class/page.tsx                  (직업 개요)
│   ├── class/swordsman/meta/page.tsx   (F1.5 Beachhead)
│   ├── jinryeong/page.tsx              (F1.5)
│   ├── class/diagnose/page.tsx         (F1.4)
│   └── ...
├── components/                         (디자인 시스템 컴포넌트)
├── lib/firebase/                       (Firestore 클라이언트)
├── public/                             (favicon, manifest)
└── docs/sprint/02-sprint-mvp/
    ├── prd.md
    ├── plan.md
    ├── design.md
    ├── check-report.md                 (Phase check 산출)
    ├── qa-report.md                    (Phase qa)
    ├── report.md                       (Phase report — 운영자 보고서)
    └── archive-notes.md                (Phase archive)
```

---

## 다음 Sprint

MVP 졸업 KPI 달성 시 (M6) → [Sprint V1](../03-sprint-v1/README.md) Phase plan 진입.
