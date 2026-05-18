# AWS Bootstrap — Sprint 11 Phase A

CLI-driven bootstrap of AWS infrastructure for kkaebizigi image hosting (S3 + CloudFront CDN).
All resources tagged `Project=kkaebizigi` per organizational mandate.

## Account

| Field | Value |
|-------|-------|
| Account ID | `715398629040` |
| Account alias | `agent-kay` |
| Region (primary) | `ap-northeast-2` (Seoul) |
| Region (ACM) | `us-east-1` (CloudFront requires) |
| AWS CLI profile (admin) | `kkaebizigi` |

## IAM

| User | Purpose | Policy | Access Key |
|------|---------|--------|------------|
| `kkaebizigi-admin` | Console + CLI admin | `AdministratorAccess` + `IAMUserChangePassword` | local `~/.aws/credentials` (profile `kkaebizigi`) |
| `kkaebizigi-app` | Runtime (Vercel + Server Actions) | `kkaebizigi-app-s3-cloudfront` (inline, see `policies/app-user-policy.json`) | `~/.aws/secrets/kkaebizigi-app-keys.json` (chmod 600), pushed to Vercel env vars |

`kkaebizigi-app` policy scope:
- `s3:PutObject/PutObjectAcl/GetObject/DeleteObject/GetObjectAttributes` on `posts/*`, `chat/*`, `tmp/*` prefixes only
- `s3:ListBucket` with prefix condition
- `cloudfront:CreateInvalidation/GetInvalidation/ListInvalidations` (all distributions)

## S3 Buckets

| Bucket | Environment | Region | Versioning | Public Access Block |
|--------|-------------|--------|------------|---------------------|
| `kkaebizigi-prod` | Production | ap-northeast-2 | Enabled | All 4 (BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, RestrictPublicBuckets) |
| `kkaebizigi-staging` | Preview/Dev | ap-northeast-2 | Enabled | All 4 |

**Configurations (both buckets):**
- CORS: `policies/bucket-cors.json` — allows kkaebizigi.com, www, staging, localhost:3000
- Lifecycle: `policies/bucket-lifecycle.json`
  - `tmp/` → expire after 1 day
  - `chat/` → IA at 30d, Glacier IR at 180d
  - `posts/` → IA at 30d, Glacier IR at 365d
  - Incomplete multipart uploads → abort at 7d
- Bucket Policy: `policies/bucket-policy-{env}.json` — CloudFront OAC service principal only (S3 direct access blocked)

## ACM Certificates (us-east-1)

| Domain | Certificate ARN | Status |
|--------|-----------------|--------|
| `cdn.kkaebizigi.com` | `arn:aws:acm:us-east-1:715398629040:certificate/11e7900a-bbb2-452d-bb92-0c74edd6221a` | ISSUED |
| `cdn-staging.kkaebizigi.com` | `arn:aws:acm:us-east-1:715398629040:certificate/bf3efc4b-bd8a-4239-996f-aceb96e24677` | ISSUED |

DNS validation CNAMEs added via Vercel DNS. CAA record added: `amazon.com` (Vercel DNS, kkaebizigi.com).

## CloudFront

| Environment | Distribution ID | DomainName | OAC ID | Alternate Domain |
|-------------|-----------------|------------|--------|------------------|
| Production | `EOX82ZTW7OCX8` | `d3oe9ijai24sy8.cloudfront.net` | `E2R8V38PG0NO0B` | `cdn.kkaebizigi.com` |
| Staging | `E38BK72T4JND71` | `d2adyitwbjog2r.cloudfront.net` | `E1936ZHXPNIQCZ` | `cdn-staging.kkaebizigi.com` |

**Common config:**
- Price Class: `PriceClass_200` (US/EU/Asia)
- HTTP versions: HTTP/2 + HTTP/3
- IPv6: enabled
- Compression: enabled
- Viewer Protocol: redirect-to-https
- Allowed methods: GET, HEAD
- Cache Policy: `658327ea-f89d-4fab-a63d-7e88639e58f6` (CachingOptimized — managed)
- Response Headers Policy: `60669652-455b-4ae9-85a4-c4c02393f86c` (SecurityHeadersPolicy — managed)
- TLS: TLSv1.2_2021 (SNI only)

## Vercel DNS Records (kkaebizigi.com)

| Record | Type | Value | Purpose |
|--------|------|-------|---------|
| `_<acm-token>.cdn` | CNAME | `_<acm-validation>.acm-validations.aws.` | ACM validation (prod) |
| `_<acm-token>.cdn-staging` | CNAME | `_<acm-validation>.acm-validations.aws.` | ACM validation (staging) |
| `@` | CAA | `0 issue "amazon.com"` | Allow AWS ACM cert issuance |
| `cdn` | CNAME | `d3oe9ijai24sy8.cloudfront.net` | Prod CDN public hostname |
| `cdn-staging` | CNAME | `d2adyitwbjog2r.cloudfront.net` | Staging CDN public hostname |

## Vercel Environment Variables

6 keys × 3 environments (Production, Preview/staging branch, Development) — 18 variables total.

| Key | Production | Preview (staging) | Development |
|-----|-----------|-------------------|-------------|
| `AWS_REGION` | `ap-northeast-2` | `ap-northeast-2` | `ap-northeast-2` |
| `AWS_ACCESS_KEY_ID` | kkaebizigi-app | kkaebizigi-app | kkaebizigi-app |
| `AWS_SECRET_ACCESS_KEY` | kkaebizigi-app | kkaebizigi-app | kkaebizigi-app |
| `S3_BUCKET_NAME` | `kkaebizigi-prod` | `kkaebizigi-staging` | `kkaebizigi-staging` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `EOX82ZTW7OCX8` | `E38BK72T4JND71` | `E38BK72T4JND71` |
| `NEXT_PUBLIC_CDN_DOMAIN` | `https://cdn.kkaebizigi.com` | `https://cdn-staging.kkaebizigi.com` | `https://cdn-staging.kkaebizigi.com` |

## AWS Budget

| Name | Limit | Alerts |
|------|-------|--------|
| `kkaebizigi-monthly-20usd` | $20 USD/month | 50% / 80% / 100% actual + 100% forecast → kay@popupstudio.ai |

Cost filter: `user:Project$kkaebizigi` (tag-scoped).

## Tagging Policy

All AWS resources MUST carry `Project=kkaebizigi`. Additional tags:
- `Environment` = `prod` | `staging`
- `ManagedBy` = `cli-bootstrap` (vs. `terraform`, `cdk` for future migrations)
- `Component` = `storage` | `cdn` | `iam`

## Local Secrets (NOT committed)

- `~/.aws/credentials` profile `kkaebizigi` — admin keys
- `~/.aws/secrets/kkaebizigi-app-keys.json` (chmod 600) — runtime keys

Both excluded from git via OS-level placement.

## Verification

```bash
# IAM
aws iam list-users --profile kkaebizigi
aws iam list-attached-user-policies --user-name kkaebizigi-admin --profile kkaebizigi

# S3
aws s3 ls --profile kkaebizigi
aws s3api get-bucket-policy --bucket kkaebizigi-prod --profile kkaebizigi
aws s3api get-bucket-cors --bucket kkaebizigi-prod --profile kkaebizigi

# CloudFront
aws cloudfront list-distributions --profile kkaebizigi

# ACM
aws acm list-certificates --region us-east-1 --profile kkaebizigi

# Budget
aws budgets describe-budgets --account-id 715398629040 --profile kkaebizigi
```
