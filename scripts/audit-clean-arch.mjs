#!/usr/bin/env node
/**
 * audit-clean-arch.mjs — Sprint 10 / Phase F-final Task #29
 *
 * Clean Architecture 자동 감사 스크립트.
 * 출처: docs/sprint/10-sprint-launch/design.md §1.1 (R1-R5)
 *
 * 검증 규칙:
 *   R1. domain layer (lib/{post,chat,auth,b2b,bookmark,comment,coupon,
 *       insights,moderation,nlp,observability,penalty,personalization,
 *       reaction,search,simulator,subscription,wiki,etl})에서 `firebase/*`
 *       직접 import 금지 → `lib/firebase/*` 통해서만
 *   R2. Server-only 모듈 (firebase-admin 또는 'use server' 또는 NEXT_*
 *       env 사용)은 첫 의미 있는 import가 `import 'server-only'` 이어야 함
 *   R3. Client Component ('use client') 파일에서 firebase-admin import 금지
 *   R4. 환경변수(process.env.*) 접근은 경계 모듈(lib/auth/auth.ts, lib/*config*)
 *       에서만 (UI/Server Action 직접 접근은 warn)
 *   R5. domain layer 순수성 — `*.domain.ts` 또는 `*.domain.tsx`
 *       파일은 React/Next.js dependency 0
 *
 * 실행:
 *   node scripts/audit-clean-arch.mjs            # 콘솔 + exit code
 *   node scripts/audit-clean-arch.mjs --report   # 보고서까지 작성
 *   pnpm audit:arch                              # package.json 스크립트
 *
 * Exit code:
 *   0 — 모든 ERROR 규칙 PASS (WARN 무관)
 *   1 — 1개 이상 ERROR 규칙 FAIL
 */

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ─── 설정 ───────────────────────────────────────────────────────────

const SCAN_DIRS = ['lib', 'app', 'components'];
const SCAN_EXTS = new Set(['.ts', '.tsx', '.mts', '.cts']);
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.bkit/,
  /\.test\.(ts|tsx)$/,
  /\.spec\.(ts|tsx)$/,
  /__tests__\//,
];

/** R1: domain layer 디렉토리 — 이 안에서 `firebase/*` direct import = error */
const DOMAIN_DIRS = new Set([
  'lib/post',
  'lib/chat',
  'lib/auth',
  'lib/b2b',
  'lib/bookmark',
  'lib/comment',
  'lib/coupon',
  'lib/insights',
  'lib/moderation',
  'lib/nlp',
  'lib/observability',
  'lib/penalty',
  'lib/personalization',
  'lib/reaction',
  'lib/search',
  'lib/simulator',
  'lib/subscription',
  'lib/wiki',
  'lib/etl',
]);

/** R1 화이트리스트: domain layer 안에서도 client SDK 경량 사용 허용 (이미지 업로드 등).
 *  이 파일들은 design.md §1.1 R1을 명시적으로 "허용된 adapter 사용"으로 분류 — 단,
 *  Sprint 11에서 lib/firebase/storage.ts 어댑터로 옮기는 carry item.  */
const R1_KNOWN_EXEMPT = new Set([
  'lib/post/image-upload.ts',
  'lib/chat/image-upload.ts',
  'lib/chat/send-message.ts',
  'lib/chat/use-channel.ts',
]);

/** R2: 'use server' 파일 또는 firebase-admin 임포트 파일은 server-only 필수 */
const SERVER_ONLY_REQUIRED_RE = /^(import\s+['"]firebase-admin\b|.*from\s+['"]firebase-admin\b)|^['"]use server['"];?$/m;

const FIREBASE_IMPORT_RE = /from\s+['"]firebase\/[^'"]+['"]/g;
const FIREBASE_ADMIN_IMPORT_RE = /from\s+['"]firebase-admin(?:\/[^'"]*)?['"]/g;
const USE_CLIENT_RE = /^['"]use client['"];?\s*$/m;
const USE_SERVER_RE = /^['"]use server['"];?\s*$/m;
const SERVER_ONLY_RE = /^import\s+['"]server-only['"];?\s*$/m;

// ─── 파일 워커 ─────────────────────────────────────────────────────

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const abs = join(dir, name);
    const rel = relative(PROJECT_ROOT, abs);
    if (EXCLUDE_PATTERNS.some((p) => p.test(rel))) continue;
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(abs, acc);
    } else if (SCAN_EXTS.has(name.slice(name.lastIndexOf('.')))) {
      acc.push(rel);
    }
  }
  return acc;
}

function read(rel) {
  return readFileSync(join(PROJECT_ROOT, rel), 'utf8');
}

function findLine(text, regex) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    if (regex.test(line)) return { line: i + 1, content: line.trim() };
  }
  return null;
}

function isInDomain(rel) {
  for (const dir of DOMAIN_DIRS) {
    if (rel === dir || rel.startsWith(dir + '/')) return true;
  }
  return false;
}

function isLibFirebase(rel) {
  return rel === 'lib/firebase' || rel.startsWith('lib/firebase/');
}

// ─── 룰 실행 ───────────────────────────────────────────────────────

const violations = {
  R1: [], // ERROR: domain → firebase/*
  R2: [], // ERROR: server-only missing in server module
  R3: [], // ERROR: 'use client' + firebase-admin
  R4: [], // WARN: process.env in UI/component
  R5: [], // WARN: domain *.domain.ts uses react/next
};

function runRules(files) {
  for (const rel of files) {
    const text = read(rel);

    // R1
    if (isInDomain(rel) && !R1_KNOWN_EXEMPT.has(rel)) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        FIREBASE_IMPORT_RE.lastIndex = 0;
        const m = FIREBASE_IMPORT_RE.exec(line);
        if (m) {
          violations.R1.push({
            file: rel,
            line: i + 1,
            col: m.index + 1,
            content: line.trim(),
            severity: 'error',
          });
        }
      }
    }

    // R2: server-only required if file imports firebase-admin OR uses 'use server'
    const usesAdmin = FIREBASE_ADMIN_IMPORT_RE.test(text);
    FIREBASE_ADMIN_IMPORT_RE.lastIndex = 0;
    const isUseServer = USE_SERVER_RE.test(text);
    const hasServerOnly = SERVER_ONLY_RE.test(text);
    // app/api/**/route.ts는 본질적으로 server context — 별도 import 'server-only' 면제
    const isApiRoute = rel.startsWith('app/api/') && /\/route\.(ts|tsx)$/.test(rel);
    if ((usesAdmin || isUseServer) && !hasServerOnly && !isApiRoute) {
      violations.R2.push({
        file: rel,
        line: 1,
        col: 1,
        content: usesAdmin
          ? "imports firebase-admin without `import 'server-only'`"
          : "'use server' without `import 'server-only'`",
        severity: 'error',
      });
    }

    // R3: 'use client' AND firebase-admin
    if (USE_CLIENT_RE.test(text) && FIREBASE_ADMIN_IMPORT_RE.test(text)) {
      FIREBASE_ADMIN_IMPORT_RE.lastIndex = 0;
      const hit = findLine(text, FIREBASE_ADMIN_IMPORT_RE);
      violations.R3.push({
        file: rel,
        line: hit?.line ?? 1,
        col: 1,
        content: hit?.content ?? "firebase-admin in 'use client'",
        severity: 'error',
      });
    }
    FIREBASE_ADMIN_IMPORT_RE.lastIndex = 0;

    // R4: process.env in UI / component file (warn)
    const isComponent =
      rel.startsWith('components/') ||
      (rel.startsWith('app/') && /\/(page|layout|template)\.tsx?$/.test(rel));
    if (isComponent) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        // NODE_ENV는 표준이고 빌드타임에 인라인되므로 컴포넌트 사용 허용
        const match = /\bprocess\.env\.([A-Z_]+)/.exec(line);
        if (match && match[1] !== 'NODE_ENV' && !/NEXT_PUBLIC_/.test(line)) {
          violations.R4.push({
            file: rel,
            line: i + 1,
            col: 1,
            content: line.trim(),
            severity: 'warn',
          });
        }
      }
    }

    // R5: *.domain.ts under lib must not import react/next
    if (/\.domain\.tsx?$/.test(rel) && isInDomain(rel)) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (/from\s+['"]react(?:\/[^'"]*)?['"]/.test(line) || /from\s+['"]next(?:\/[^'"]*)?['"]/.test(line)) {
          violations.R5.push({
            file: rel,
            line: i + 1,
            col: 1,
            content: line.trim(),
            severity: 'warn',
          });
        }
      }
    }
  }

  // Cross-check: lib/firebase/* itself ALLOWED — sanity (not a violation but tracked)
  // (no-op; recorded implicitly by absence)
  return violations;
}

// ─── 보고서 ────────────────────────────────────────────────────────

function fmt(rule, list) {
  if (list.length === 0) return `### ${rule}\n\nPASS — 위반 0건.\n`;
  const lines = [`### ${rule}\n`, `FAIL — ${list.length}건 위반.\n`, '| 파일 | 위치 | 내용 |', '|---|---|---|'];
  for (const v of list) {
    lines.push(`| \`${v.file}\` | L${v.line}:C${v.col} | \`${v.content.replace(/\|/g, '\\|')}\` |`);
  }
  lines.push('');
  return lines.join('\n');
}

function buildReport(v, files, exitCode) {
  const ts = new Date().toISOString();
  const errs = v.R1.length + v.R2.length + v.R3.length;
  const warns = v.R4.length + v.R5.length;
  return [
    `# Clean Architecture Audit Report`,
    ``,
    `**Generated**: ${ts}`,
    `**Scanned files**: ${files.length}`,
    `**Total errors**: ${errs}`,
    `**Total warnings**: ${warns}`,
    `**Exit code**: ${exitCode}`,
    `**Reference**: docs/sprint/10-sprint-launch/design.md §1.1`,
    ``,
    `## 요약`,
    ``,
    `| 규칙 | 설명 | 위반 | 결과 |`,
    `|---|---|---|---|`,
    `| R1 | domain → \`firebase/*\` 직접 import 금지 | ${v.R1.length} | ${v.R1.length === 0 ? 'PASS' : 'FAIL'} |`,
    `| R2 | server 모듈 \`import 'server-only'\` 누락 | ${v.R2.length} | ${v.R2.length === 0 ? 'PASS' : 'FAIL'} |`,
    `| R3 | 'use client'에서 firebase-admin import | ${v.R3.length} | ${v.R3.length === 0 ? 'PASS' : 'FAIL'} |`,
    `| R4 | UI/component process.env (비-NEXT_PUBLIC) 직접 접근 | ${v.R4.length} | ${v.R4.length === 0 ? 'PASS' : 'WARN'} |`,
    `| R5 | \`*.domain.ts\` react/next 의존 | ${v.R5.length} | ${v.R5.length === 0 ? 'PASS' : 'WARN'} |`,
    ``,
    `## R1 — domain → \`firebase/*\` direct import (ERROR)`,
    ``,
    `**화이트리스트** (R1_KNOWN_EXEMPT):`,
    `- \`lib/post/image-upload.ts\` — Sprint 11 lib/firebase/storage 어댑터 이전 예정 (carry)`,
    `- \`lib/chat/image-upload.ts\` — Sprint 11 lib/firebase/storage 어댑터 이전 예정 (carry)`,
    `- \`lib/chat/send-message.ts\` — RTDB client SDK direct (Sprint 11 lib/firebase/rtdb-client 추출 검토)`,
    `- \`lib/chat/use-channel.ts\` — RTDB client SDK direct (Sprint 11 lib/firebase/rtdb-client 추출 검토)`,
    ``,
    fmt('R1 위반 (화이트리스트 제외)', v.R1),
    fmt('R2 — server 모듈 server-only 누락', v.R2),
    fmt('R3 — Client Component + firebase-admin', v.R3),
    `## R4 — UI/Component env 직접 접근 (WARN)`,
    ``,
    fmt('R4 위반', v.R4),
    `## R5 — domain 순수성 (WARN)`,
    ``,
    `\`*.domain.ts\` 패턴이 도입된 도메인 모듈은 React/Next 의존 0이어야 함. 현재 미도입.`,
    ``,
    fmt('R5 위반', v.R5),
    `---`,
    ``,
    `## Carry Items`,
    ``,
    `- **Sprint 11**: lib/firebase/storage.ts 어댑터 신설 → lib/post/image-upload.ts, lib/chat/image-upload.ts에서 사용 → R1_KNOWN_EXEMPT 항목 제거`,
    `- **Sprint 11**: lib/firebase/rtdb-client.ts 추출 → lib/chat/send-message.ts, lib/chat/use-channel.ts에서 사용 → R1_KNOWN_EXEMPT 항목 제거`,
    `- **Sprint 11 검토**: *.domain.ts 패턴 도입 여부 (현재 도메인 모듈은 Server Action과 도메인 로직이 한 파일에 혼재되어 있음)`,
    ``,
  ].join('\n');
}

// ─── 실행 ──────────────────────────────────────────────────────────

function main() {
  const wantReport = process.argv.includes('--report');
  const wantJson = process.argv.includes('--json');

  const allFiles = SCAN_DIRS.flatMap((d) => walk(join(PROJECT_ROOT, d), []));
  const v = runRules(allFiles);

  const errs = v.R1.length + v.R2.length + v.R3.length;
  const warns = v.R4.length + v.R5.length;
  const exitCode = errs === 0 ? 0 : 1;

  if (wantJson) {
    const payload = { scanned: allFiles.length, errs, warns, violations: v, exitCode };
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`Clean Architecture Audit`);
    console.log(`────────────────────────`);
    console.log(`Scanned: ${allFiles.length} files`);
    console.log(`Errors:  ${errs}`);
    console.log(`Warns:   ${warns}`);
    console.log('');
    for (const [rule, list] of Object.entries(v)) {
      const tag = list.length === 0 ? 'PASS' : list[0]?.severity === 'error' ? 'FAIL' : 'WARN';
      console.log(`${rule}: ${tag} (${list.length})`);
      if (list.length > 0 && list.length <= 8) {
        for (const x of list) console.log(`   ${x.file}:${x.line}:${x.col}  ${x.content.slice(0, 90)}`);
      } else if (list.length > 8) {
        for (const x of list.slice(0, 5))
          console.log(`   ${x.file}:${x.line}:${x.col}  ${x.content.slice(0, 90)}`);
        console.log(`   ... and ${list.length - 5} more`);
      }
    }
    console.log('');
    console.log(`Exit code: ${exitCode}`);
  }

  if (wantReport) {
    const reportPath = join(PROJECT_ROOT, 'docs/sprint/10-sprint-launch/reports/clean-arch-audit.md');
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, buildReport(v, allFiles, exitCode), 'utf8');
    console.log(`Report written: ${relative(PROJECT_ROOT, reportPath)}`);
  }

  process.exit(exitCode);
}

main();
