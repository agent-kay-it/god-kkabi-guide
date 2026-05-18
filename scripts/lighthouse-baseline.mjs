#!/usr/bin/env node
/**
 * Sprint 12 / F12-A-3 — Lighthouse 5회 평균 측정 자동화.
 *
 * 측정 대상 (5 page × mobile + desktop = 10 run × 5 회 = 50 run):
 *  - / (홈)
 *  - /post/[id] (시드 post — F12-A-1 출력)
 *  - /post (목록)
 *  - /me
 *  - /chat
 *
 * 출력:
 *  - docs/sprint/12-sprint-perf/reports/baseline/run-{i}-{page}-{device}.{json,html}
 *  - docs/sprint/12-sprint-perf/reports/baseline.md (평균 표)
 *
 * 사용:
 *   node scripts/lighthouse-baseline.mjs                  # 모든 page × 5회
 *   node scripts/lighthouse-baseline.mjs --runs 3         # 3회로 단축
 *   node scripts/lighthouse-baseline.mjs --pages /,/post  # 일부 page 만
 *   E2E_BASE_URL=https://staging.kkaebizigi.com (default)
 *
 * 의존: lighthouse@13.3.0 (via npx)
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const BASE_URL = process.env.E2E_BASE_URL ?? 'https://staging.kkaebizigi.com';
const REPORTS_DIR = resolve(PROJECT_ROOT, 'docs/sprint/12-sprint-perf/reports/baseline');
const SUMMARY_PATH = resolve(PROJECT_ROOT, 'docs/sprint/12-sprint-perf/reports/baseline.md');
const SEED_POST_IDS_PATH = resolve(
  PROJECT_ROOT,
  'docs/sprint/12-sprint-perf/reports/seed-post-ids.json',
);

const args = process.argv.slice(2);
const runs = parseInt(getArg('--runs') ?? '5', 10);
const pagesArg = getArg('--pages');

function getArg(name) {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : undefined;
}

function getSeedPostId() {
  if (!existsSync(SEED_POST_IDS_PATH)) {
    console.warn(
      `⚠️  Seed post IDs missing: ${SEED_POST_IDS_PATH}. /post/[id] 측정 skip.`,
    );
    return null;
  }
  const data = JSON.parse(readFileSync(SEED_POST_IDS_PATH, 'utf8'));
  return data.items?.[0]?.id ?? null;
}

function buildPages() {
  if (pagesArg) return pagesArg.split(',');
  const seedId = getSeedPostId();
  return [
    '/',
    seedId ? `/post/${seedId}` : null,
    '/post',
    '/me',
    '/chat',
  ].filter(Boolean);
}

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function safeFileName(s) {
  return s.replace(/[^a-zA-Z0-9-_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function runLighthouse({ url, device, run }) {
  const tag = `${safeFileName(url)}-${device}-run${run}`;
  const outputPath = join(REPORTS_DIR, tag);
  console.log(`\n→ Run ${run} | ${device} | ${url}`);

  const preset = device === 'desktop' ? '--preset=desktop' : '';
  execSync(
    [
      'npx',
      '--yes',
      'lighthouse@13.3.0',
      `"${url}"`,
      preset,
      '--output=json --output=html',
      `--output-path="${outputPath}"`,
      '--chrome-flags="--headless=new --no-sandbox --disable-gpu"',
      '--quiet',
      '--max-wait-for-load=60000',
    ]
      .filter(Boolean)
      .join(' '),
    { stdio: 'inherit' },
  );
  return `${outputPath}.report.json`;
}

function parseRun(jsonPath) {
  const d = JSON.parse(readFileSync(jsonPath, 'utf8'));
  return {
    perf: d.categories?.performance?.score ?? 0,
    a11y: d.categories?.accessibility?.score ?? 0,
    bp: d.categories?.['best-practices']?.score ?? 0,
    seo: d.categories?.seo?.score ?? 0,
    fcp: d.audits?.['first-contentful-paint']?.numericValue ?? 0,
    lcp: d.audits?.['largest-contentful-paint']?.numericValue ?? 0,
    tbt: d.audits?.['total-blocking-time']?.numericValue ?? 0,
    cls: d.audits?.['cumulative-layout-shift']?.numericValue ?? 0,
    si: d.audits?.['speed-index']?.numericValue ?? 0,
    unusedJs: d.audits?.['unused-javascript']?.numericValue ?? 0,
  };
}

function average(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function fmtScore(s) {
  return Math.round(s * 100).toString();
}

function fmtMs(ms) {
  if (ms === 0) return '0';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

async function main() {
  ensureDir(REPORTS_DIR);
  const pages = buildPages();
  const devices = ['mobile', 'desktop'];

  console.log(`📊 Lighthouse baseline measurement`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Pages: ${pages.join(', ')}`);
  console.log(`   Devices: ${devices.join(', ')}`);
  console.log(`   Runs: ${runs}`);
  console.log(`   Total: ${pages.length * devices.length * runs} measurements\n`);

  const collected = {};

  for (const page of pages) {
    for (const device of devices) {
      const key = `${page}|${device}`;
      collected[key] = [];
      for (let i = 1; i <= runs; i++) {
        try {
          const jsonPath = runLighthouse({
            url: `${BASE_URL}${page}`,
            device,
            run: i,
          });
          collected[key].push(parseRun(jsonPath));
        } catch (err) {
          console.error(`Run ${i} failed for ${page} ${device}:`, err.message);
        }
      }
    }
  }

  // Markdown 보고서 생성
  const lines = [
    '# Sprint 12 / F12-A-3 — Lighthouse Baseline',
    '',
    `**측정일**: ${new Date().toISOString()}`,
    `**Base URL**: ${BASE_URL}`,
    `**Runs per measurement**: ${runs}`,
    '',
    '## Page × Device 평균',
    '',
    '| Page | Device | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | Unused JS |',
    '|------|--------|-----:|-----:|---:|----:|----:|----:|----:|----:|----:|----------:|',
  ];

  for (const page of pages) {
    for (const device of devices) {
      const key = `${page}|${device}`;
      const runsData = collected[key];
      if (!runsData || runsData.length === 0) {
        lines.push(`| ${page} | ${device} | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |`);
        continue;
      }
      const avg = {
        perf: average(runsData.map((r) => r.perf)),
        a11y: average(runsData.map((r) => r.a11y)),
        bp: average(runsData.map((r) => r.bp)),
        seo: average(runsData.map((r) => r.seo)),
        fcp: average(runsData.map((r) => r.fcp)),
        lcp: average(runsData.map((r) => r.lcp)),
        tbt: average(runsData.map((r) => r.tbt)),
        cls: average(runsData.map((r) => r.cls)),
        si: average(runsData.map((r) => r.si)),
        unusedJs: average(runsData.map((r) => r.unusedJs)),
      };
      lines.push(
        `| ${page} | ${device} | ${fmtScore(avg.perf)} | ${fmtScore(avg.a11y)} | ${fmtScore(avg.bp)} | ${fmtScore(avg.seo)} | ${fmtMs(avg.fcp)} | ${fmtMs(avg.lcp)} | ${fmtMs(avg.tbt)} | ${avg.cls.toFixed(2)} | ${fmtMs(avg.si)} | ${fmtMs(avg.unusedJs)} |`,
      );
    }
  }

  lines.push('');
  lines.push('## 합격선 (Sprint 12 DoD)');
  lines.push('');
  lines.push('- Mobile LCP < 4s on /');
  lines.push('- Mobile Performance >= 85');
  lines.push('- Desktop Performance >= 90');
  lines.push('- Real-post /post/[id] Mobile LCP < 3s');
  lines.push('- Unused JS savings < 300ms');
  lines.push('- CLS == 0 유지');
  lines.push('');
  lines.push('## 원본 데이터');
  lines.push('');
  lines.push(`측정 결과 JSON/HTML: \`${REPORTS_DIR.replace(PROJECT_ROOT + '/', '')}\``);
  lines.push('');

  writeFileSync(SUMMARY_PATH, lines.join('\n') + '\n');
  console.log(`\n✅ Summary: ${SUMMARY_PATH}`);
}

main().catch((err) => {
  console.error('Baseline measurement failed:', err);
  process.exit(1);
});
