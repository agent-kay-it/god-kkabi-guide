#!/usr/bin/env node
/**
 * Sprint 12 / F12-A-2 — Seed 이미지 S3 업로드 스크립트.
 *
 * 목적: Perf 측정용 시드 post 5개에 사용할 이미지 5장을 S3 staging bucket 에 업로드.
 * - 입력: public/seed/sprint12/*.webp (5장)
 * - 출력: docs/sprint/12-sprint-perf/reports/seed-cdn-urls.json
 * - bucket: kkaebizigi-staging
 * - prefix: posts/seed-sprint12/{ULID}.webp (CDN_URL_RE 통과)
 * - tag: 모든 객체에 kkaebizigi=true (사용자 mandate)
 *
 * 사용:
 *   node scripts/upload-seed-images.mjs
 *
 * AWS CLI profile `kkaebizigi` 필요.
 */
import { execSync } from 'node:child_process';
import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const SEED_DIR = resolve(PROJECT_ROOT, 'public/seed/sprint12');
const OUTPUT_PATH = resolve(
  PROJECT_ROOT,
  'docs/sprint/12-sprint-perf/reports/seed-cdn-urls.json',
);

const BUCKET = 'kkaebizigi-staging';
const PREFIX = 'posts/seed-sprint12';
const CDN_BASE = 'https://cdn-staging.kkaebizigi.com';
const PROFILE = 'kkaebizigi';

// Crockford Base32 ULID generation (presigned-url.ts 와 동일 alphabet)
const CROCKFORD = '0123456789abcdefghjkmnpqrstvwxyz';

function generateUlid() {
  const time = Date.now();
  let timeStr = '';
  let t = time;
  for (let i = 9; i >= 0; i--) {
    timeStr = CROCKFORD[t % 32] + timeStr;
    t = Math.floor(t / 32);
  }
  let randomStr = '';
  for (let i = 0; i < 16; i++) {
    randomStr += CROCKFORD[Math.floor(Math.random() * 32)];
  }
  return timeStr + randomStr;
}

function ensureDir(path) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function uploadOne(file) {
  const src = resolve(SEED_DIR, file);
  const ulid = generateUlid();
  const key = `${PREFIX}/${ulid}.webp`;
  console.log(`→ ${file} → s3://${BUCKET}/${key}`);

  // aws s3api put-object with kkaebizigi=true tag + Content-Type 명시
  execSync(
    [
      'aws',
      's3api',
      'put-object',
      '--bucket',
      BUCKET,
      '--key',
      key,
      '--body',
      `"${src}"`,
      '--content-type',
      'image/webp',
      '--tagging',
      '"kkaebizigi=true"',
      '--profile',
      PROFILE,
    ].join(' '),
    { stdio: 'inherit' },
  );

  return {
    file,
    objectKey: key,
    cdnUrl: `${CDN_BASE}/${key}`,
    sizeBytes: undefined,
    uploadedAt: new Date().toISOString(),
  };
}

function main() {
  if (!existsSync(SEED_DIR)) {
    console.error(`SEED_DIR 누락: ${SEED_DIR}`);
    process.exit(1);
  }
  const files = readdirSync(SEED_DIR).filter((f) => f.endsWith('.webp'));
  if (files.length === 0) {
    console.error(`SEED_DIR 에 .webp 파일이 없음: ${SEED_DIR}`);
    process.exit(1);
  }
  console.log(`Found ${files.length} seed images in ${SEED_DIR}\n`);

  const results = files.map(uploadOne);

  ensureDir(OUTPUT_PATH);
  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      {
        sprint: 'sprint-12-perf',
        feature: 'F12-A-2',
        bucket: BUCKET,
        prefix: PREFIX,
        cdnBase: CDN_BASE,
        uploadedAt: new Date().toISOString(),
        items: results,
      },
      null,
      2,
    ) + '\n',
  );

  console.log(`\n✅ Uploaded ${results.length} images`);
  console.log(`📝 CDN URLs saved: ${OUTPUT_PATH}`);
}

main();
