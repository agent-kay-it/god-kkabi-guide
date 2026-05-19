# Sprint 13 → Prod Cutover Checklist

> Sprint 13 종료 시 prod 배포 전 사용자가 수동으로 확인할 항목.
> Sprint 14 진입 게이트로도 활용.

**현재 staging 상태**: `staging.kkaebizigi.com` — Sprint 12 + Sprint 13 hotfix 모두 반영
**prod URL**: `kkaebizigi.com`
**Vercel 배포 트리거**: `main` 브랜치 push 시 자동

---

## 1. 사전 점검 (배포 전 30분)

| # | 항목 | 검증 방법 | 책임 |
|---|---|---|---|
| 1 | staging.kkaebizigi.com 정상 동작 | `scenarios/01-home...md` 재실행 | dev |
| 2 | `next.config.ts` CSP 최신 | `git log next.config.ts` | dev |
| 3 | Sentry DSN env 설정 (prod) | Vercel project env 확인 | dev |
| 4 | GA measurement ID 설정 (prod) | Vercel project env 확인 | dev |
| 5 | AdSense client ID 설정 (prod) | Vercel project env 확인 | dev |
| 6 | `NEXT_PUBLIC_ROBOTS_INDEX=true` (prod only) | Vercel project env 확인 | dev |
| 7 | CloudFront CDN 도메인 정상 | `cdn.kkaebizigi.com` 핑 | dev |
| 8 | S3 bucket 정책 (tag: kkaebizigi) | AWS console | dev |
| 9 | Firebase 단일 prod 프로젝트 (god-kkabi-guide) 백업 | console snapshot | dev |
| 10 | Speed Insights production-only gate | code review | dev |

---

## 2. 배포 직후 (smoke test 10분)

배포 후 즉시 prod 에서 다음 페이지를 사용자 실 세션으로 확인:

| # | URL | 핵심 확인 |
|---|---|---|
| 1 | `https://kkaebizigi.com/` | 홈 노출 + console 0 + 4xx/5xx 0 |
| 2 | `https://kkaebizigi.com/me` | 사용자 카드 정상 |
| 3 | `https://kkaebizigi.com/post` | 게시판 진입 |
| 4 | `https://kkaebizigi.com/chat` | 채팅 자동 채널 선택 |
| 5 | `https://kkaebizigi.com/search` | 검색 색인 hydration |
| 6 | `https://kkaebizigi.com/robots.txt` | `Allow: /` 노출 (prod only) |
| 7 | `https://kkaebizigi.com/sitemap.xml` | 동적 sitemap 노출 |
| 8 | Rich Results Test (Google) — `/post/{id}` | Article schema 인식 |
| 9 | Sentry dashboard | 신규 error 0 |
| 10 | Vercel Analytics dashboard | LCP/CLS 정상 범위 |

---

## 3. 배포 후 24h 모니터링

| # | 메트릭 | 임계값 | 대응 |
|---|---|---|---|
| 1 | Sentry error rate | < 0.1% | 0.5% 초과 시 rollback |
| 2 | LCP (mobile) p75 | < 2.5s | 4s 초과 시 조사 |
| 3 | CLS p75 | < 0.1 | 0.25 초과 시 조사 |
| 4 | TBT p75 | < 200ms | 600ms 초과 시 조사 |
| 5 | AdSense impression | 정상 | 0 지속 시 lazy mount 점검 |
| 6 | Firebase Auth 성공률 | > 99% | 95% 미만 시 OAuth 설정 점검 |
| 7 | Firestore read latency | < 500ms | 2s 초과 시 인덱스 점검 |

---

## 4. Rollback 절차

문제 발견 시:

1. Vercel dashboard → kkaebizigi 프로젝트 → Deployments
2. 직전 안정 배포 선택 → "Promote to Production"
3. Sentry 에서 rollback 시점 marker 등록
4. `.bkit/state/sprints/sprint-13-qa.json` 에 incident note 추가
5. Sprint 14 진입 전 incident postmortem 작성

---

## 5. Sprint 14 진입 게이트

다음 조건이 모두 만족되면 Sprint 14 진입:

- [ ] prod 배포 후 24h 모니터링 통과
- [ ] BUG-13-003 (P3) 의 Sprint 14 plan 에 등재
- [ ] F13-B~G Playwright spec carry-forward 의 우선순위 결정
- [ ] Firebase emulator 분리 가능성 조사 완료
- [ ] Sprint 14 PRD/Plan 초안 작성

---

## 6. 비상 연락처

- **운영 책임**: kay@popupstudio.ai (사용자 본인)
- **Vercel 알림 채널**: Vercel project notification (Vercel toolbar)
- **Sentry 알림 채널**: Sentry alert rules (project: kkaebizigi)
- **Firebase 알림 채널**: Firebase console (god-kkabi-guide)

---

## 7. 체크리스트 사용 방법

본 문서는 prod 배포 시점에 사용자가 직접 수행. 각 항목은 GitHub issue 의 task list 로
복사하여 진행 추적 가능. 완료 후 본 파일 갱신 (commit history 가 prod 배포 audit log).
