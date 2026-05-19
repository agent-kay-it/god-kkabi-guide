# S3 Staging Cutover Dry-Run 결과 보고서 — Sprint 17 / F17-G

> Sprint 16 F16-G 의 체크리스트를 실 환경에서 검증 가능한 자동화 script 도입.
> 실 mutation 없음 — 점검만 수행.

**작성일**: 2026-05-19
**Script**: `scripts/s3-cutover-dryrun.mjs`

---

## 1. Script 사용

```bash
# tene 시크릿 주입 + dry-run 실행
tene run -- node scripts/s3-cutover-dryrun.mjs

# 결과 저장
tene run -- node scripts/s3-cutover-dryrun.mjs > /tmp/s3-dryrun-$(date +%Y%m%d).json

# CI 통합 시 exit code 활용
tene run -- node scripts/s3-cutover-dryrun.mjs
echo "exit code: $?"
# 0 = all pass / 1 = fail / 2 = warn
```

## 2. 점검 항목

### 2.1 ENV presence (시크릿 값 노출 X, boolean 만)

| 변수 | 필수 | 검증 방식 |
|---|---|---|
| AWS_REGION | ✅ | typeof string && length > 0 |
| AWS_ACCESS_KEY_ID | ✅ | typeof string && length > 0 |
| AWS_SECRET_ACCESS_KEY | ✅ | typeof string && length > 0 (값 X) |
| AWS_S3_BUCKET_POSTS | ✅ | typeof string && length > 0 |
| AWS_S3_BUCKET_CHAT | ✅ | typeof string && length > 0 |
| AWS_S3_BUCKET_PROFILES | ✅ | typeof string && length > 0 |

### 2.2 Bucket 별 점검 (3 bucket × 4 항목 = 12 점검)

| 항목 | 검증 | API |
|---|---|---|
| Bucket existence + access | bucket 존재 + 권한 | HeadBucketCommand |
| CORS rule 존재 | CORSRules.length > 0 | GetBucketCorsCommand |
| Lifecycle rule 존재 | Rules.length > 0 | GetBucketLifecycleConfigurationCommand |
| Tag "project=kkaebizigi" | TagSet 에 일치 항목 | GetBucketTaggingCommand |

---

## 3. 결과 출력 형식

```json
{
  "timestamp": "2026-05-19T...",
  "mode": "dryrun",
  "env": {
    "presence": {
      "AWS_REGION": true,
      "AWS_ACCESS_KEY_ID": true,
      ...
    },
    "missing": []
  },
  "buckets": {
    "posts": {
      "bucketName": "<masked>",
      "label": "posts",
      "exists": true,
      "cors": { "exists": true, "rules": 1 },
      "lifecycle": { "exists": false, "error": "none" },
      "tag": { "exists": true, "hasKkaebizigi": true }
    },
    "chat": { ... },
    "profiles": { ... }
  },
  "summary": {
    "pass": 18,
    "fail": 0,
    "warn": 0
  }
}
```

---

## 4. 보안 규칙 준수

본 script 는 CLAUDE.md 의 tene 관리 규칙 모두 준수:

- ✅ 시크릿 값 **stdout 출력 X** — presence boolean 만
- ✅ `tene run -- node ...` 형식만 사용 — env 주입은 wrapper 가
- ✅ `tene get` / `tene export` 호출 X
- ✅ `.tene/` 디렉토리 접근 X
- ✅ AWS_SECRET_ACCESS_KEY 가 stack trace 에 leak 안 됨 — error.message 만 출력

---

## 5. CI 통합 예시

```yaml
# .github/workflows/s3-health.yml (예시 — 본 sprint 미적용)
- name: S3 staging health check
  env:
    AWS_REGION: ${{ secrets.AWS_REGION }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_S3_BUCKET_POSTS: ${{ secrets.AWS_S3_BUCKET_POSTS }}
    AWS_S3_BUCKET_CHAT: ${{ secrets.AWS_S3_BUCKET_CHAT }}
    AWS_S3_BUCKET_PROFILES: ${{ secrets.AWS_S3_BUCKET_PROFILES }}
  run: node scripts/s3-cutover-dryrun.mjs
```

---

## 6. 본 sprint 의 실측 결과

본 sprint 에서는 script 작성 만 진행 — 실 AWS staging 에서의 dry-run 은
사용자 (kay@popupstudio.ai) 의 명시적 승인 후 별도 진행.

실측 단계 (사용자 직접 실행):

```bash
# 1. tene env staging
# 2. tene run -- node scripts/s3-cutover-dryrun.mjs
# 3. 결과 검토 + 미달 항목 확인 + 실 cutover 결정
```

---

## 7. Sprint 18 carry items

- 실측 결과 회수 (사용자 승인 후)
- 미달 항목 (예: lifecycle rule 없음) 의 IAM/CORS 등 보강
- 실 cutover 진행 (사용자 명시 승인 후)
- CloudFront distribution 검증 항목 추가 (현재 script 는 S3 만)
- ETag / object count 의 sanity check (실 데이터 검증)
