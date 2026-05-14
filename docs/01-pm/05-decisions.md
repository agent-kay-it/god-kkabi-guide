# 05. 운영자 의사결정 기록 (Decisions Log)

> 작성일: 2026-05-14 · 운영자: kay@agentkay.it
> PM Agent Team 산출물 검토 후 운영자 의사결정 4건. Sprint Master Plan에 반영 필수.

---

## D1. 도메인 전략 — 게임-specific

**선택**: `gokkaebi-guide.com` / `god-kkabi.kr` / `갓깨비공략.kr` 류 (게임명 직접 포함)

**근거**:
- 단기(M1-M9) SEO 부스트 극대화 — "갓깨비 키우기 공략" 직접 매칭
- 직관적 브랜딩 → 디시·네이버 카페 시드 침투 시 신뢰성 ↑
- Beachhead(검객 메타 추종자) 검색 의도와 정확히 일치
- MVP 30/90일 성공 기준(SERP "갓깨비 키우기 공략" 상위 30위) 달성 가능성 ↑

**리스크 수용**:
- ⚠️ 게임 인기 6-12개월 라이프사이클 종료 시 도메인 재활용 불가
- ⚠️ V3 인수 시 게임사(4399/Joy Nice Games)가 자체 브랜드 도메인 선호할 가능성
- ⚠️ Best Case 후속작 시리즈 확장 차단 (갓깨비 2, 다른 4399 키우기 시리즈에 재활용 불가)

**완화 전략**:
- V1 단계에서 콘텐츠 마이그레이션 가능성 검토 (예: 후속작 인기 시 게임-agnostic 서브도메인 신설)
- 도메인 등록 시 1년만 결제 (재활용 가치 검증 후 연장)
- 우선순위 도메인: `gokkaebi-guide.com` (영문 SEO) > `god-kkabi.kr` (한국 .kr) > `갓깨비공략.kr` (한글 도메인은 SNS 공유 시 깨질 수 있어 우선순위 ↓)

**Sprint Master Plan 반영**:
- Sprint 0 또는 MVP M0.5 단계에 "도메인 구매 및 Vercel 연결" 태스크 추가
- DNS 설정 후 `noindex` 제거하고 sitemap.xml 제출

---

## D2. 시드 콘텐츠 작성 방식 — 하이브리드 70/30

**선택**: 운영자 직접 작성 70% + UGC(디시·네이버 카페·BlueStacks 핫토픽) 가공 인용 30%

**근거**:
- 1인 운영 부담 분산 (운영자 100% 시 MVP 출시 2-4주 지연 가능성)
- SEO 차별점 유지 (인용 70% 시 중복 콘텐츠 페널티 위험)
- 법적 회색지대 최소화 (모든 외부 인용은 출처 명시 + 가공)
- Pre-mortem #3 (저작권 분쟁) 리스크 완화

**70/30 구성 가이드**:
| 비중 | 콘텐츠 영역 | 작성 방식 |
|------|-----------|---------|
| 70% (운영자 직접) | 직업 분석, 진령 11종 상세, 메타 빌드 추천, 쿠폰 체커, 직업 진단 | 운영자 게임 플레이 + 자체 분석 |
| 30% (가공 인용) | 시즌 이벤트, 패치 노트 요약, 디시 핫토픽, 신규 쿠폰 | 출처 명시 + 운영자 코멘트 추가 |

**인용 운영 규칙**:
1. **출처 명시 의무**: 인용 단락 직후 `(출처: [BlueStacks 가이드](URL), 2025-06)` 형식
2. **가공 30% 이상**: 원문 직역 금지, 운영자 관점 코멘트 / 검증 결과 / 추가 인사이트 추가
3. **이미지**: 공식 자산만 핫링크 (Google Play CDN). 외부 블로그 이미지 미러링 금지
4. **분쟁 대응**: 저작권자 요청 시 24시간 내 삭제 약속 디스클레이머

**Sprint Master Plan 반영**:
- Sprint MVP > Phase do > "콘텐츠 작성 가이드라인 문서" 산출물 추가
- `content-policy.md` 파일 (저작권 / 인용 / 이미지 정책)
- Firebase rules에서 댓글 작성 시 운영자 동의 체크박스 (V1)

---

## D3. Sprint 0 — V3 가상 리포트 3종 사전 작성 (R.A.T.)

**선택**: 예. MVP 시작 전 Sprint 0 (1-2일)에서 V3 가상 리포트 3종 PDF 작성

**근거**:
- **R.A.T. (Riskiest Assumption Test)**: D5 가설(MVP 데이터 스키마가 V3 B2B 패키지 추가 마이그레이션 없이 수용 가능)이 무산되면 V3 자체 무산 → 엔드게임 무산
- 가장 위험한 가정을 가장 먼저, 가장 저비용으로 검증
- B2B 영업 시 즉시 데모 자료로 활용 가능 → V3 영업 funnel 가속화
- 추후 재작업 방지 (MVP 출시 후 스키마 수정 시 데이터 마이그레이션 비용 발생)

**가상 리포트 3종**:

### Report 1: 분기 메타 인사이트 리포트
- 가설 콘텐츠: 직업/진령 채용률 추이 (12주), 메타 변화 시그널, 신규 진령 출시 후 빌드 전환 속도
- 데이터 소스 (가상): build_logs, tier_votes, meta_snapshots
- 목적: 4399 운영팀이 게임 밸런싱 의사결정에 활용
- 패키지 가설 가격: 분기당 ₩5M-15M

### Report 2: 이탈 시그널 SaaS 리포트
- 가설 콘텐츠: 페이지별 이탈률 + 페인포인트 NLP 클러스터 + 보스 던전 별점 분포 + 결제 이탈 단계
- 데이터 소스 (가상): page_funnels, comment_sentiments, build_drop_signals
- 목적: 4399 운영팀이 이탈 방지 패치 우선순위 결정
- 패키지 가설 가격: 월 ₩3M-8M SaaS

### Report 3: 후속작 사전 리서치 리포트
- 가설 콘텐츠: 커뮤니티 신호 (대체 게임 언급, 채용 공고 분석, 신규 IP 키워드 출현)
- 데이터 소스 (가상): community_mentions, churn_to_competitor, brand_signal_trends
- 목적: 4399 신작 기획 시 한국 시장 인사이트
- 패키지 가설 가격: 일회성 ₩30M-100M

**산출물 위치**: `docs/01-pm/sprint-0-virtual-reports/` 하위
- `report-1-meta-insight.pdf` (or markdown + PDF 빌드)
- `report-2-churn-signal-saas.pdf`
- `report-3-next-title-research.pdf`
- `schema-validation.md` — 각 리포트가 요구하는 데이터 필드를 MVP Firestore 스키마와 매핑

**검증 기준**:
- ✅ 3종 리포트 모든 데이터 필드가 MVP Firestore 스키마(6 컬렉션)로 도출 가능
- ❌ 만약 추가 컬렉션/필드 필요 시 → MVP 스키마 수정 후 Sprint MVP 진입

**Sprint Master Plan 반영**:
- Sprint 0 신설 (예상 1-2일)
- Sprint 0 결과물이 MVP Sprint Phase plan의 데이터 스키마 입력으로 전달
- Sprint 0 완료 시 운영자 확인 게이트 (L3 Trust Level)

---

## D4. Trust Level — L4 Aggressive (Sprint MVP 진입 직전 갱신, 2026-05-14 v2)

**초기 결정 (v1)**: L3 Balanced — 비용/배포/보안규칙 수동 확인
**갱신 결정 (v2)**: **L4 Aggressive — 완전 자동 모드 + Chrome 시각 검증**

### 갱신 사유 (v1 → v2)

운영자가 Sprint MVP 진입 직전 명시적으로 요청 (2026-05-14):
> "MVP 구현하고 공개하기 위한 sprint를 Task Management System에 등록해줘. 내가 /sprint start로 요청해서 각 sprint는 모든 pdca phase를 /control level 4로 완전 자동 모드로 구현하고 chrome 연결해서 꼼꼼하게 검증할거야."

→ 운영자가 Chrome 시각 검증(Claude in Chrome MCP)을 통한 꼼꼼한 검증을 자동화의 안전장치로 채택했으므로, 비용/배포 의사결정을 자동화해도 의도와 다른 결과 위험 ↓.

### L4 자동화 범위 (자동 진행)

- ✅ 코드 작성·수정·리팩토링
- ✅ 테스트 실행 (단위/통합/E2E)
- ✅ 문서 작성 (Plan/Design/Analysis/QA/Report)
- ✅ Git 커밋 (Co-Authored-By 명시) + push
- ✅ 로컬 빌드 + Vercel preview 배포 자동
- ✅ **Vercel production 배포 자동** (운영자 명시적 요청)
- ✅ **Sprint Phase 전환 자동** (plan → design → do → check → act → qa → report → archive)
- ✅ **npm 패키지 자동 설치** (package.json + lockfile 갱신)
- ✅ **Firebase Spark Plan 무료 한도 내 자동 사용** (Firestore/Auth/Storage)
- ✅ Firestore 보안 규칙 자동 작성·배포 (Sprint 0 검증 스키마 기반)
- ✅ **Chrome 자동 검증** (Claude in Chrome MCP — 컴포넌트 시각 검증 / 모바일 viewport / E2E 3 시나리오 / Lighthouse / GA4 DebugView)

### L4 잔여 수동 게이트 (운영자 직접 결정만 — 매우 제한적)

다음 4가지만 운영자 수동 결정 (자동화 불가능한 본질적 사항):

1. **유료 결제 행위**: 도메인 구매 결제, Firebase Blaze Plan 전환, Vercel Pro 전환, AdSense 가입, 외부 API 유료 구독 → 운영자가 카드 정보 입력해야 함
2. **계정 인증 행위**: GitHub OAuth, Vercel 로그인, Firebase 콘솔 로그인 → 브라우저 본인 인증
3. **법적 의사결정**: 인수/라이선스 계약 서명 (V3) — N/A in MVP
4. **사업 모델 폐기/피벗 결정**: M4.5/M6 폐기 트리거 발동 시 — N/A in MVP normal flow

### L4 안전장치 (자동화의 안전핀)

자동화 폭주를 막기 위한 안전핀 4종:

1. **Chrome 시각 검증 의무**: 모든 페이지 작성 후 Claude in Chrome MCP로 시각 확인 (mobile 320/375/414 + desktop)
2. **Lighthouse ≥90 강제 게이트**: M4 미달 시 production 배포 자동 차단 + iterate 강제
3. **비용 한도 자동 모니터링**: MVP $5/월 초과 감지 시 BUDGET_EXCEEDED Auto-Pause 트리거
4. **운영자 알림 의무**: 다음 5종 발생 시 운영자 즉시 알림 (자동 진행은 유지) — production 첫 배포 / 도메인 DNS 연결 / Firestore 보안 규칙 갱신 / 30일/90일 KPI 측정 / Auto-Pause 트리거 발동

### bkit 설정 반영

```bash
/control trust L4
# 또는
/control level 4
```

`.bkit/state/control.json` 갱신: `{ "trustLevel": 4, "sprintAutorunScope": "full", "stopAfter": "archived", "updatedAt": "2026-05-14T..." }`

### Chrome 자동 검증 통합 (Claude in Chrome MCP)

본 Sprint MVP 진입과 함께 Chrome 자동 검증을 다음 Phase에 활성화:

| Phase | Chrome 검증 활용 | MCP 도구 |
|-------|---------------|---------|
| Phase 3 do.B (컴포넌트 14종) | 컴포넌트별 `/dev/components` 페이지 시각 검증 | tabs_create, get_screenshot, find |
| Phase 3 do.C (페이지 15개) | 페이지별 모바일 viewport 4종 + 데스크톱 시각 검증 | navigate, resize_window, get_screenshot |
| Phase 3 do.D (SEO + 배포) | sitemap.xml + JSON-LD 콘솔 검증 | read_console_messages, get_page_text |
| Phase 4 check (Lighthouse) | Lighthouse CI 자동 측정 + Chrome DevTools 검증 | navigate, read_network_requests |
| Phase 6 qa (E2E 3 시나리오) | S-01/02/03 자동 실행 + GIF 기록 | form_input, find, gif_creator |

---

## 결정사항 적용 요약 (Sprint Master Plan 입력)

| 결정 | Sprint Master Plan 영향 |
|------|----------------------|
| D1: 도메인 게임-specific | Sprint MVP Phase plan에 "도메인 구매" 태스크 / 후속작 마이그레이션 옵션 V1+ 검토 |
| D2: 하이브리드 70/30 | MVP Phase do에 "콘텐츠 정책 문서" / 인용 규칙 / 디스클레이머 |
| D3: Sprint 0 신설 | **Sprint 0** (1-2일) → V3 가상 리포트 3종 → 스키마 검증 → MVP 진입 |
| D4: L3 Trust | Sprint 자동화 L3, 배포·비용·보안규칙은 수동 확인 |

다음 단계: **`/sprint master-plan`** → 5개 Sprint 분해 (Sprint 0, MVP, V1, V2, V3)
