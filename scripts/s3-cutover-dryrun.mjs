#!/usr/bin/env node
/**
 * S3 staging cutover dry-run — Sprint 17 / F17-G.
 *
 * 실 mutation 없이 IAM / CORS / Lifecycle / Tag / Bucket existence 점검.
 * 결과는 JSON 으로 stdout 출력 (CI / 운영자 시각화 가능).
 *
 * 사용:
 *   tene run -- node scripts/s3-cutover-dryrun.mjs
 *
 * 점검 항목:
 *   - tene 시크릿 존재 여부 (env presence)
 *   - 각 bucket (posts / chat / profiles) 존재
 *   - 각 bucket 의 CORS rule 존재
 *   - 각 bucket 의 Lifecycle rule 존재
 *   - 각 bucket 의 tag "project=kkaebizigi" 부착
 *
 * 보안 규칙 (CLAUDE.md):
 *   - tene 시크릿 값 절대 stdout 출력 X — 마스킹 처리
 *   - 결과 JSON 의 ARN / Bucket name 은 출력 가능 (public identifier)
 *   - AWS_SECRET_ACCESS_KEY 가 envp 로 들어와도 출력하지 않음
 */
import {
  S3Client,
  HeadBucketCommand,
  GetBucketCorsCommand,
  GetBucketLifecycleConfigurationCommand,
  GetBucketTaggingCommand,
} from '@aws-sdk/client-s3';

const REQUIRED_ENV = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_POSTS',
  'AWS_S3_BUCKET_CHAT',
  'AWS_S3_BUCKET_PROFILES',
];

const REQUIRED_TAG_KEY = 'project';
const REQUIRED_TAG_VALUE = 'kkaebizigi';

/** 결과 객체 (stdout JSON 출력용). */
const result = {
  timestamp: new Date().toISOString(),
  mode: 'dryrun',
  env: { presence: {}, missing: [] },
  buckets: {},
  summary: { pass: 0, fail: 0, warn: 0 },
};

/** ENV 점검 — 시크릿 값 X, 존재 여부만 boolean 출력. */
function checkEnv() {
  for (const key of REQUIRED_ENV) {
    const present = Boolean(process.env[key]);
    result.env.presence[key] = present;
    if (!present) result.env.missing.push(key);
  }
}

/** S3 bucket 단위 점검. */
async function checkBucket(s3, bucketName, label) {
  const out = {
    bucketName,
    label,
    exists: false,
    cors: { exists: false, rules: 0 },
    lifecycle: { exists: false, rules: 0 },
    tag: { exists: false, hasKkaebizigi: false },
  };

  // 1. HeadBucket — 존재 + 접근 권한
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    out.exists = true;
  } catch (e) {
    out.error = `HeadBucket: ${e.name}`;
    return out;
  }

  // 2. CORS
  try {
    const cors = await s3.send(new GetBucketCorsCommand({ Bucket: bucketName }));
    out.cors.exists = true;
    out.cors.rules = cors.CORSRules?.length ?? 0;
  } catch (e) {
    out.cors.error = e.name === 'NoSuchCORSConfiguration' ? 'none' : e.name;
  }

  // 3. Lifecycle
  try {
    const lc = await s3.send(
      new GetBucketLifecycleConfigurationCommand({ Bucket: bucketName }),
    );
    out.lifecycle.exists = true;
    out.lifecycle.rules = lc.Rules?.length ?? 0;
  } catch (e) {
    out.lifecycle.error = e.name === 'NoSuchLifecycleConfiguration' ? 'none' : e.name;
  }

  // 4. Tag
  try {
    const tag = await s3.send(new GetBucketTaggingCommand({ Bucket: bucketName }));
    out.tag.exists = true;
    out.tag.hasKkaebizigi = (tag.TagSet ?? []).some(
      (t) => t.Key === REQUIRED_TAG_KEY && t.Value === REQUIRED_TAG_VALUE,
    );
  } catch (e) {
    out.tag.error = e.name === 'NoSuchTagSet' ? 'none' : e.name;
  }

  return out;
}

/** 요약 점수 계산. */
function summarize() {
  // env presence — pass/fail per env
  for (const key of REQUIRED_ENV) {
    if (result.env.presence[key]) result.summary.pass++;
    else result.summary.fail++;
  }

  // bucket 점검
  for (const label of ['posts', 'chat', 'profiles']) {
    const b = result.buckets[label];
    if (!b) continue;
    if (b.exists) result.summary.pass++;
    else result.summary.fail++;
    if (b.cors.exists) result.summary.pass++;
    else result.summary.fail++;
    if (b.lifecycle.exists) result.summary.pass++;
    else result.summary.warn++; // lifecycle 은 정책상 optional
    if (b.tag.hasKkaebizigi) result.summary.pass++;
    else result.summary.fail++;
  }
}

async function main() {
  checkEnv();

  if (result.env.missing.length > 0) {
    result.error = `Missing env: ${result.env.missing.join(', ')}`;
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const buckets = [
    { name: process.env.AWS_S3_BUCKET_POSTS, label: 'posts' },
    { name: process.env.AWS_S3_BUCKET_CHAT, label: 'chat' },
    { name: process.env.AWS_S3_BUCKET_PROFILES, label: 'profiles' },
  ];

  for (const b of buckets) {
    result.buckets[b.label] = await checkBucket(s3, b.name, b.label);
  }

  summarize();
  console.log(JSON.stringify(result, null, 2));

  // exit code 0 = all pass / 1 = fail / 2 = warn
  if (result.summary.fail > 0) process.exit(1);
  if (result.summary.warn > 0) process.exit(2);
  process.exit(0);
}

main().catch((e) => {
  console.error(JSON.stringify({ error: e.message, name: e.name }, null, 2));
  process.exit(1);
});
