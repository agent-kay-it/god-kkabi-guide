# Sprint 25 — QA Summary

> Sprint 25 V3 — Coverage 70 + Metadata + feature RTL 15
> QA 단계 (DoD-5) 완료. 모든 검증 항목 PASS.

## QA Run

- 일시: 2026-05-20 (UTC)
- 환경: staging.kkaebizigi.com (Vercel + Next.js 16 + Turbopack)
- 방법: Chrome 자동화 (claude-in-chrome MCP) + 6 페이지 fetch + JSON-LD parse 검증

## Coverage / Tests

| 항목 | 수치 | DoD |
|---|---|---|
| Statements coverage | **70.86%** (6687/9436) | DoD-1 (70%+) ✅ |
| Branches coverage | 85.42% (1682/1969) | — |
| Functions coverage | 96.85% (277/286) | — |
| 전체 테스트 | 1372 pass / 0 fail | — |
| components/feature/ 파일 수 | **16** | DoD-2 (15+) ✅ |
| components/feature/ 테스트 수 | 118 | — |
| typecheck | 0 error | — |
| lint | 0 warning | — |

## metadata 강화 5 페이지 (DoD-3)

모든 페이지에서 다음 항목 확인:

| Page | title | canonical | keywords | og:title | og:type | twitter:card |
|---|---|---|---|---|---|---|
| / | 홈 — 위키·채팅·북마크 | https://staging.kkaebizigi.com | 8 | ✅ | website | summary_large_image |
| /skill | 스킬 가이드 — 코어·액티브·패시브 | /skill | 7 | 스킬 가이드 — 31종 운영 원리 | article | summary_large_image |
| /class | 직업 가이드 — 전사·검객·영매 | /class | 6 | 3종 비교 | article | summary_large_image |
| /jinryeong | 진령 — 등급보다 시너지 | /jinryeong | 6 | 진령 가이드 — 11종 시너지 | article | summary_large_image |
| /coupon | 쿠폰 — 커뮤니티 검증 | /coupon | 5 | 커뮤니티 검증 목록 | website | summary_large_image |
| /advanced | 고급 Tip 참고 — 메커니즘 디테일 | /advanced | 7 | 고급 Tip — 메커니즘 6선 | article | summary_large_image |

## Structured Data 2종 신규 (DoD-4)

### VideoGame (`/` 홈에 1회 주입)

검증 항목:
- `@type`: `VideoGame` ✅
- `name`: 갓깨비 키우기 ✅
- `genre`: ["Idle RPG", "방치형 RPG", "Korean Folklore"] ✅
- `publisher.name`: 조이시티 ✅
- `inLanguage`: ko-KR ✅
- `downloadUrl`: 2건 (Play Store + App Store) ✅
- Google 게임 카드 rich result 자격 충족

### FAQPage (`/advanced` 페이지에 주입)

검증 항목:
- `@type`: `FAQPage` ✅
- `mainEntity[].@type`: Question x6 ✅
- `acceptedAnswer.@type`: Answer x6 ✅
- 페이지 가시 콘텐츠(MECHANISMS 6 카드)와 1:1 매칭 → Google 가이드라인 준수
- Rich Results "Frequently asked questions" 자격

## QA 중 발견·수정 이슈

### Issue Q-1 (해결됨)

- **현상**: /advanced 페이지 title이 중복: `"고급 Tip 참고 — 메커니즘 디테일 | 갓깨비 키우기 가이드 | 갓깨비 키우기 가이드"`
- **원인**: page metadata가 fully-formed title을 가졌고 layout의 template `%s | 갓깨비 키우기 가이드`가 한 번 더 append.
- **수정**: PR #134 — page title을 `'고급 Tip 참고 — 메커니즘 디테일'`로 축소.
- **재검증**: deploy 후 `<title>고급 Tip 참고 — 메커니즘 디테일 | 갓깨비 키우기 가이드</title>` 단일 형태 확인 ✅

## DoD 최종 진행

- [x] DoD-1: Coverage lines 70%+ (70.86%)
- [x] DoD-2: components/feature/ test 15+ (16 파일 / 118 테스트)
- [x] DoD-3: 5+ 페이지 metadata 강화 (/skill /class /jinryeong /coupon /advanced)
- [x] DoD-4: structured data 2+ 신규 (VideoGame + FAQ)
- [x] DoD-5: Chrome QA 새 metadata view-source 검증 (이 문서)
- [ ] DoD-6: Sprint 25 종합 보고서 (report.md — 다음)
- [ ] DoD-7: Sprint 26 carry items (다음)

## 다음 단계

→ Report phase: `report.md` 작성 + Sprint 26 carry 정리
→ Archive phase: 사용자 명시 승인 후 sprint-25 archive 처리
