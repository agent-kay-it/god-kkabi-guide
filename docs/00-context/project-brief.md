# 갓깨비 키우기 가이드 사이트 — 프로젝트 브리프

> PM Discovery / Strategy / Research / PRD 에이전트가 활용할 단일 진실 공급원(SSOT).
> 작성일: 2026-05-14 · 작성자: kay@agentkay.it
> **운영 주체: 1인 개인 프로젝트** (회사/조직 소속 없음. 모든 문서에 "팝업스튜디오" 등 회사명 표기 금지)

---

## 1. 프로젝트 한 줄 설명

**"갓깨비 키우기 비공식 팬 가이드"** — 정적 공략 HTML에서 출발하여, 한국 도깨비 IP 방치형 RPG 유저 커뮤니티 → 메타 인사이트 플랫폼 → 게임사 B2B 데이터/툴 서비스로 4단계 진화시키는 1인 운영 프로젝트.

---

## 2. 비전 (4단계)

| 단계 | 코드네임 | 목표 | 핵심 가치 | 매출 모델 |
|------|---------|------|-----------|-----------|
| **MVP** | 가이드 사이트 | 기존 HTML을 Next.js 반응형으로 이식, 공식 자산 활용 | 검색 유입 + SEO 노출 | (없음 — 트래픽 확보) |
| **V1** | 커뮤니티 | UGC 팁, 댓글, 빌드 공유, 즐겨찾기 | 체류시간 + 회귀율 | 애드센스, 제휴 마케팅 |
| **V2** | 인사이트 | 유저 빌드/진령 채용률/메타 트렌드 대시보드 | 데이터 기반 메타 가시화 | 프리미엄 구독 / 후원 |
| **V3 (Endgame)** | B2B 자산화 | Joy Nice Games / Juxin Network에 라이선싱하거나 매각 | 게임사가 못 보는 메타·이탈 시그널 제공 | B2B 라이선스 / 인수 |

> ⚠️ V3가 최종 목표. MVP부터 V3에서 가치 있는 **데이터 자산(유저 빌드 로그, 진령 시너지, 결투장 트렌드, 쿠폰 유효성, 이탈 신호)** 을 누적할 수 있도록 설계해야 함.

---

## 3. 타겟 게임 정보

| 항목 | 값 |
|------|-----|
| 게임명 | 갓깨비 키우기 — 999뽑기 증정 |
| 영문명 | Raising a Goblin |
| 개발사 | Joy Net Games (iOS) / Joy Nice Games (Android) — 4399(중국) 한국 사업부 |
| 앱 제공자(iOS) | JOY MOBILE NETWORK PTE. LTD. (싱가폴 법인, 홍콩 연락처 +852) |
| 퍼블리셔 | Juxin Network |
| 장르 | 동양 오컬트 판타지 방치형 RPG (캐주얼 12+) |
| **출시 지역** | **한국 단독** (글로벌 미출시 — iOS US/JP 스토어 404 실측) |
| **정식 출시일** | **2025-04-18 오전 11시** (전자신문, 베타뉴스) |
| 플랫폼 | Android (Google Play), iOS (App Store), Mac M1+, Apple Vision, Kakao Games |
| iOS 지원 언어 | 한국어 / 영어 / 중국어(간체) — 3개 (App Store 실측) |
| iOS 호환 OS | iOS 12+, iPadOS 12+, macOS 11.0+(M1), visionOS 1.0+ |
| 평점 | ⭐ 4.8 / 5 (리뷰 6.4만+) |
| 다운로드 | 500K+ (Google Play 표기) |
| Google Play | https://play.google.com/store/apps/details?id=com.zzsjkr.google |
| iOS App Store | https://apps.apple.com/kr/app/갓깨비-키우기/id6740621218 |
| Kakao Games | https://game.kakao.com/games/4QGX3Kyd |
| 연락처 | cskr@joynetgame.com |
| 최근 업데이트 | 2025-10-27 |

### 게임 핵심 시스템

- **직업 3종**: 전사(도깨비), 검객(무당), 영매(저승사자)
- **진령 11종**: 홍길동, 서해용왕, 음영귀, 명왕, 치우, 격투귀, 구미요호, 태양여신, 궁귀, 항아, 산신 (희귀SSR / SSR)
- **스킬 3계열**: 코어, 액티브, 패시브
- **제련(장비) 시스템**: 확률 뽑기 + 강화
- **던전**: 진령/무한/보스/비경
- **PvP**: 결투장
- **콜라보**: 카카오프렌즈 등

### 메타 (2026-05 기준)

- 0티어 진령: 홍길동, 서해용왕
- 1티어 진령: 음영귀, 명왕, 치우
- 메타 정석 조합: 홍길동 + 서해용왕 + 치우
- 폭딜 검객 빌드: 홍길동 + 서해용왕 + 음영귀
- 영매 안정 조합: 서해용왕 + 구미요호 + 항아

---

## 4. 기존 자산

- **원본 HTML**: `source/original-guide.html` (1444 lines, ~63KB)
  - 다크 테마 (퍼플/골드/시안 컬러), 한국 전통/오컬트 무드
  - 9개 섹션: 개요 / 직업 / 진령 / 스킬·제련 / 던전·PvP / 과금 전략 / 이벤트·쿠폰 / 실전 팁 / 출처
  - 모바일 미디어 쿼리 일부 적용 (≤600px)
  - 쿠폰 클릭 복사 + 맨 위로 버튼 인터랙션 존재
- **공식 자산 링크 (HTML 내 활용 중)**:
  - 앱 아이콘: `play-lh.googleusercontent.com/vre365L9Y_XIpaTg56Mqa3Oraobas7RMsHl52ZJuyyShZNWdPg8fbkQjWCHu1hTJ0TE4DaY_vbuDUkUi9u8P=w240-h240`
  - Google Play 스크린샷 6장
- **출처 레퍼런스**: BlueStacks 가이드 6편, LDPlayer 가이드, 디시 마이너 갤러리

---

## 5. 사용자(운영자) 제약사항

| 항목 | 제약 |
|------|------|
| 인력 | 1인 (개인 프로젝트) |
| 서버 비용 | **최소화 필수** — Vercel Hobby + Firebase Spark Plan 우선 |
| 운영 시간 | 본업 외 시간 (가용 시간 한정) |
| 인프라 | GitHub + Vercel + Firebase (사용자가 계정 준비) |
| 백엔드 | Firebase Storage 기반 (Firestore + Auth + Storage 가능) |
| 도메인 | 미정 (추후 결정) |

### 비용 가드레일

- 월간 인프라 비용 목표: **$0 ~ $5** (MVP 기간)
- DAU 1,000 도달 전까지 무료 티어 유지
- 이미지/CDN: Google Play CDN(공식) + Vercel Image Optimization (또는 직접 호스팅 회피)

---

## 6. 기능 요구사항 (사용자 발화 정리)

### MVP 필수
- [x] Next.js로 변환 (App Router)
- [x] 모바일 반응형 (HTML의 ≤600px 분기 이상으로 정교화)
- [x] 세련된 디자인 (다크 + 골드 액센트 유지, 현대화)
- [x] 직업/진령/스킬 이미지 자산 — 공식 링크 활용
- [x] HTML 원본 9개 섹션 콘텐츠 모두 포함

### V1 (커뮤니티)
- [ ] 유저 댓글 / 팁 작성 (UGC)
- [ ] 빌드 공유 (직업 + 진령 3조합 + 스킬 셋)
- [ ] 좋아요 / 신고
- [ ] 사용자 인증 (소셜 로그인)

### V2 (인사이트)
- [ ] 빌드/진령 채용률 대시보드
- [ ] 메타 변화 추적 (주간/월간)
- [ ] 쿠폰 유효성 검증 (만료/신규)
- [ ] 결투장 빌드 트렌드

### V3 (B2B 자산)
- [ ] 게임사용 어드민 대시보드 (이탈 시그널, 페인 포인트)
- [ ] 메타 리포트 자동 생성
- [ ] API 형태로 라이선싱 가능한 패키지

### 실시간 정보 (가능한 경우)
- 게임사 공식 사이트 / API 제공 시 연동
- 그 외에는 운영자 수동 업데이트 (또는 커뮤니티 제보)

---

## 7. 기술 스택 (확정/제안)

| 레이어 | 선택 | 근거 |
|--------|------|------|
| Framework | **Next.js 16 (App Router)** | SSR/ISR, SEO 친화적, Vercel 최적 |
| Hosting | **Vercel (Hobby)** | 무료 티어, 자동 배포, CDN 포함 |
| Backend | **Firebase Spark Plan** | Auth + Firestore + Storage 무료 한도 |
| DB | **Firestore** | 무료 1GB / 50K reads/day, 댓글/빌드 UGC |
| Storage | **Firebase Storage** | 이미지 업로드 (V1+) |
| Auth | **Firebase Auth** | Google/Kakao 소셜 로그인 |
| Image CDN | Google Play CDN (공식) → Next/Image 프록시 | 비용 0 |
| Analytics | Vercel Analytics + GA4 | 무료 |
| Comments (대안) | Giscus / Disqus | Firestore 비용 절감 시 옵션 |

### 환경 변수 관리
- 프로젝트 루트 CLAUDE.md에 따라 **tene** 사용
- Firebase 서비스 계정, NEXT_PUBLIC_FIREBASE_* 키 → `tene set` + `tene run -- next dev`

---

## 8. 디자인 방향성

- **분위기**: 한국 전통 + 오컬트 + 현대적 게임 UI
- **컬러**: 다크 베이스(#0a0612) + 골드 액센트(#e8b860) + 퍼플(#8b5cf6) + 시안(#38d9d9)
- **타이포**: Noto Sans KR (한국어), Apple SD Gothic Neo fallback
- **레퍼런스**: 인벤(inven.co.kr) 가이드 페이지, GameWith 한국 게임 가이드, 나무위키 게임 페이지의 정보 밀도
- **차별점**: 인벤/디시 대비 모바일 최적화 + 깔끔한 빌드 시뮬레이터 + 인사이트 차트

---

## 9. PM 에이전트에 요청하는 분석

### pm-discovery
- 한국 방치형 RPG 유저의 진짜 페인 포인트 (정보 산재, 메타 변화 추적 어려움, 쿠폰 유효성, 빌드 비교 부재)
- 5-Step Discovery Chain → OST 합성
- 가설 우선순위화

### pm-research
- 경쟁 사이트 심층 분석: **인벤(inven.co.kr), GameWith(gamewith.jp 한국 게임 섹션), 나무위키, 디시인사이드 마이너 갤러리, 네이버 카페, BlueStacks 블로그, LDPlayer 블로그**
- 페르소나 3종 이상 (무과금 라이트 / 소과금 메타 추종 / 중과금 정보 수집형)
- TAM/SAM/SOM: 한국 모바일 방치형 RPG 유저 풀, 갓깨비 키우기 DAU 추정
- 유사 사례 매출 사례: **퍼즐앤드래곤 GameWith, MapleStory 인벤, FGO 게임에잇** 등 매출/트래픽 데이터

### pm-strategy
- Value Proposition (JTBD 6-Part): "When ~ I want to ~ So that ~"
- Lean Canvas
- SWOT (1인 운영 / Firebase 무료 한도 / 비공식 사이트 한계)
- Pricing 전략: 무료 + 애드센스 / 후원 / 프리미엄 / B2B 라이선스

### pm-prd
- Beachhead: 검객 유저 + 메타 정석 조합 추종자
- GTM: 네이버 카페/디시 마이너 갤러리 시드 침투
- ICP: 한국 거주 25-40세 남성, 평일 30분 ~ 2시간 플레이, 쿠폰/빌드 자주 검색
- Battlecard vs 인벤, 디시, BlueStacks 블로그
- Growth Loops: 빌드 공유 → 댓글 유입 → 검색 노출 → 신규 가입
- Pre-mortem: Firebase 무료 한도 초과 / 게임 인기 하락 / 게임사 자체 가이드 운영
- 사용자 스토리, 잡 스토리, 테스트 시나리오
- Stakeholder Map: kay(운영자) / 유저 / Joy Nice Games / Vercel·Firebase / 광고주

---

## 10. 성공 지표 (SSOT)

### MVP (1-2주 내)
- 페이지 로드 < 2초 (모바일 3G)
- Lighthouse 모바일 ≥ 90
- 검색 노출: "갓깨비 키우기 공략", "갓깨비 진령 티어"

### V1 (1-2개월)
- DAU 100+
- 댓글 게시글 누적 50+
- 빌드 공유 30+

### V2 (3-6개월)
- DAU 1,000+
- 인사이트 대시보드 PV/MAU
- 광고 매출 월 10만원+

### V3 (6-12개월)
- 누적 빌드 데이터 10,000+
- 게임사 미팅 / 인수 제안 1건+

---

## 11. 리스크 & 가정

| 리스크 | 영향 | 완화책 |
|--------|------|--------|
| Joy Nice Games가 공식 가이드 출시 | 트래픽 -50% | 커뮤니티 + 인사이트 차별화 |
| 게임 인기 급락 (방치형 라이프사이클 짧음) | DAU 감소 | 후속 게임에 동일 플랫폼 재활용 가능한 구조 |
| Firebase 무료 한도 초과 | 비용 발생 | Firestore 캐싱 / Edge Config / 댓글은 Giscus 대안 |
| 비공식 사이트 법적 이슈 | 강제 폐쇄 | 출처 명시, 공식 자산만 핫링크, 게임사 협의 채널 사전 확보 |
| 1인 운영 번아웃 | 업데이트 지연 | UGC 활성화로 운영 부담 분산 |

---

## 12. 다음 단계

1. **본 브리프 → `/pdca pm` (pm-lead 에이전트)** → PRD 산출
2. **PRD → `/sprint master-plan`** → MVP/V1/V2/V3 sprint 분해
3. **MVP Sprint Start** → Next.js 스캐폴딩 + 콘텐츠 이식 + Vercel 배포
