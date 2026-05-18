# Sprint 12 / Perf Reports

이 디렉토리는 Sprint 12 Performance 측정 결과를 보관합니다.

## 파일 구조

```
reports/
├── README.md                    (본 문서)
├── seed-cdn-urls.json           F12-A-2 — S3 업로드된 5개 시드 이미지 CDN URL
├── seed-post-ids.json           F12-A-1 — Firestore 시드 post 5개 ID + URL
├── baseline.md                  F12-A-3 — Lighthouse baseline 평균 표
├── baseline/                    F12-A-3 — 원본 json/html (run-1-2-3-4-5 × page × device)
├── after-b.md                   F12-B-6 — Phase B 후 측정 + diff
├── after-c.md                   F12-C-6 — Phase C 후 측정 + diff
├── bundle-baseline.html         F12-A-4 — bundle analyzer (client.html, nodejs.html)
└── rich-results.md              F12-D-8 — Google Rich Results Test 결과
```

## 실행 순서

```bash
# 1. 시드 이미지 S3 업로드 (1회)
pnpm seed:upload-images

# 2. 시드 post Firestore 생성 (tene 필요)
pnpm seed:staging-posts

# 3. Lighthouse baseline 측정 (5회 평균)
pnpm perf:baseline

# 4. Bundle analyzer
pnpm perf:analyze
# → .next/analyze/{client,nodejs}.html 생성

# 5. Phase B/C 변경 후 재측정
pnpm perf:baseline
# → 결과를 reports/after-b.md / after-c.md 에 수동 정리
```

## 환경변수

| 변수 | 용도 | 필수 |
|---|---|:--:|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | seed:staging-posts | ✅ (tene-injected) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Admin App 초기화 | ✅ |
| `SEED_AUTHOR_UID` | 시드 post 작성자 UID (default: `seed-perf-sprint-12`) | optional |
| `E2E_BASE_URL` | Lighthouse 측정 대상 (default: `https://staging.kkaebizigi.com`) | optional |
| `ANALYZE` | `true` 면 bundle-analyzer 활성 (perf:analyze 자동 set) | optional |

## Idempotency

- `seed-staging-posts.mjs` 는 `seedSprintId: 'sprint-12-perf'` 가 이미 있으면 skip
- 강제 재생성: `pnpm seed:staging-posts -- --force`

## Cleanup (Sprint 12 archive 시)

```bash
# Firestore 시드 post 삭제 (seedSprintId='sprint-12-perf' 매칭)
# scripts/cleanup-seed-posts.mjs 별도 작성 또는 Firebase 콘솔 수동
```

S3 객체는 `posts/seed-sprint12/*` 경로에 있으며, ULID 기반이므로 영구 보관 가능 (1년 후
lifecycle 자동 IA → Glacier). 강제 삭제는 `aws s3 rm --recursive` 사용.
