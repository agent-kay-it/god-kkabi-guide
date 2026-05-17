#!/usr/bin/env node
/**
 * audit-design-system.mjs — Sprint 10 / Phase F-final Task #30
 *
 * 디자인 시스템 일관성 감사.
 * 출처: docs/sprint/10-sprint-launch/design.md §1.3 (Design Tokens + Component Layers)
 *
 * 검증 범위:
 *   D1. Tailwind arbitrary value 사용률 — `bg-[rgb(...)]`, `text-[#fff]` 등 토큰 우회 검출
 *   D2. 컴포넌트 계층 의존 방향 검증
 *     - components/ui/* (primitive): 외부 + clsx/cva만 (도메인 lib 의존 0)
 *     - components/feature/* (composite): ui/* + lib/* 의존 OK
 *     - components/domain/* (page-wide): feature/* + ui/* 조합
 *     - 역방향(ui → feature, ui → domain, feature → domain) 검출
 *   D3. 토큰 사용률 — globals.css @theme 토큰 개수 vs 코드 내 var(--color-*) 사용 개수
 *   D4. 하드코딩 색상 — #hex, rgb(), rgba(), hsl() 사용 검출 (CSS 파일 + Tailwind arbitrary 안)
 *
 * 실행:
 *   node scripts/audit-design-system.mjs
 *   node scripts/audit-design-system.mjs --report
 *   pnpm audit:design
 *
 * Exit code: 0 (ERROR 0) | 1 (ERROR 1+)
 */

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const SCAN_EXTS = new Set(['.ts', '.tsx', '.css']);
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.bkit/,
  /\.test\.(ts|tsx)$/,
  /\.spec\.(ts|tsx)$/,
  /__tests__\//,
];

// Allow some intentional values — gradients with transparent stops, ring-[3px], aspect-[16/9] etc.
const ARBITRARY_ALLOW_RE = /^(?:transparent|0|0px|auto|inherit|initial|unset|currentColor)$/i;
const SIZE_TOKENS = new Set([
  '1px',
  '2px',
  '3px', // ring/border edges
  '0.5px',
  '4px',
]);

/**
 * D1-A 화이트리스트 — Sprint 11에서 opacity-modifier 패턴(bg-ink-elev/60)으로 이전 예정.
 * 디자인 시스템 외 색상이 아니라, 토큰 색상 + 커스텀 알파인 glass/overlay 패턴.
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §3 (Editorial × Glassmorphism)
 */
const D1A_KNOWN_EXEMPT = new Set([
  'components/domain/class-card.tsx',
  'components/domain/hero-meta.tsx',
  'components/domain/hero-stats.tsx',
  'components/domain/tier-stack.tsx',
  'components/feature/ad-slot-sticky.tsx',
  'components/feature/top-bar.tsx',
  'components/ui/pill.tsx',
  'app/page.tsx',
]);

/**
 * D2 화이트리스트 — penalty-badge는 이름만 'domain'이지만 기능적으로 ui/* primitive.
 * Sprint 11에서 components/ui/penalty-badge.tsx로 이전 예정.
 */
const D2_KNOWN_EXEMPT = new Set([
  'components/feature/admin-penalty-table.tsx::@/components/domain/penalty-badge',
]);

// Arbitrary value extraction — captures the inside of `[...]`
const ARBITRARY_RE = /\b(?:bg|text|border|fill|stroke|ring|outline|shadow|from|to|via|placeholder|accent|caret|decoration|divide|font|leading|tracking|p|m|gap|w|h|min-w|min-h|max-w|max-h|inset|top|bottom|left|right|space-x|space-y|rounded|opacity|z|aspect)-\[([^\]]+)\]/g;

const HEX_COLOR_RE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;
const RGB_RE = /\brgba?\s*\(/;
const HSL_RE = /\bhsla?\s*\(/;
const COLOR_LIKE_RE = /(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()/;

// ─── 파일 워킹 ─────────────────────────────────────────────────────

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

// ─── 토큰 파싱 ─────────────────────────────────────────────────────

function parseTokens() {
  const text = read('app/globals.css');
  const tokens = { color: [], radius: [], shadow: [], duration: [], font: [], breakpoint: [] };
  const re = /^\s*--(color|radius|shadow|duration|font|breakpoint)-([a-z0-9-]+):/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const cat = m[1];
    const key = m[2];
    if (cat && key && tokens[cat]) tokens[cat].push(key);
  }
  return tokens;
}

// ─── 룰 ────────────────────────────────────────────────────────────

const findings = {
  D1_arbitrary: [], // warn
  D1_arbitrary_color: [], // error — 하드코딩 색상
  D1_arbitrary_color_exempt: [], // info — 화이트리스트 hit
  D2_layer: [], // error — 역방향 의존
  D2_layer_exempt: [], // info — 화이트리스트 hit
  D3_token: { used: new Set(), defined: 0, usage: 0 },
  D4_hardcoded_css: [], // warn — globals.css 외 css 파일의 색상 리터럴
};

function classifyArbitrary(value) {
  const v = value.trim();
  if (ARBITRARY_ALLOW_RE.test(v)) return 'allow';
  if (SIZE_TOKENS.has(v)) return 'size_ok';
  if (HEX_COLOR_RE.test(v) || RGB_RE.test(v) || HSL_RE.test(v)) return 'hardcoded_color';
  // gradient with stops — has commas + percentages
  if (/linear-gradient|radial-gradient|conic-gradient/.test(v)) {
    return COLOR_LIKE_RE.test(v) ? 'gradient_with_color' : 'gradient_ok';
  }
  // numeric size or fraction — allowed warn
  if (/^[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%|fr|vh|vw|dvh|dvw|svh|svw)?$/.test(v)) return 'size_warn';
  // calc()
  if (/^calc\(/.test(v)) return 'calc_ok';
  // aspect ratio (16/9)
  if (/^[0-9]+\/[0-9]+$/.test(v)) return 'aspect_ok';
  return 'other';
}

function checkD1(rel, text) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    ARBITRARY_RE.lastIndex = 0;
    let m;
    while ((m = ARBITRARY_RE.exec(line)) !== null) {
      const value = m[1] ?? '';
      const klass = classifyArbitrary(value);
      const entry = { file: rel, line: i + 1, col: m.index + 1, value, classification: klass };
      if (klass === 'hardcoded_color' || klass === 'gradient_with_color') {
        if (!D1A_KNOWN_EXEMPT.has(rel)) {
          findings.D1_arbitrary_color.push(entry);
        } else {
          findings.D1_arbitrary_color_exempt.push(entry);
        }
      } else if (klass === 'size_warn' || klass === 'other') {
        findings.D1_arbitrary.push(entry);
      }
    }
  }
}

function checkD2(rel, text) {
  // Only components/* matters for layers
  const isUi = rel.startsWith('components/ui/');
  const isFeature = rel.startsWith('components/feature/');
  const isDomain = rel.startsWith('components/domain/');
  const isMagic = rel.startsWith('components/magic-ui/') || rel.startsWith('components/motion/');

  if (!(isUi || isFeature || isDomain || isMagic)) return;

  const importRe = /from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRe.exec(text)) !== null) {
    const spec = m[1] ?? '';
    const resolved = spec.startsWith('@/') ? spec.slice(2) : spec;
    // Skip external
    if (!resolved.startsWith('components/') && !resolved.startsWith('lib/')) continue;

    if (isUi || isMagic) {
      // ui/magic must not depend on feature, domain, or lib/<domain>/*
      if (resolved.startsWith('components/feature/')) {
        findings.D2_layer.push({
          file: rel,
          import: spec,
          rule: 'ui→feature 금지',
        });
      } else if (resolved.startsWith('components/domain/')) {
        findings.D2_layer.push({
          file: rel,
          import: spec,
          rule: 'ui→domain 금지',
        });
      } else if (
        resolved.startsWith('lib/post/') ||
        resolved.startsWith('lib/chat/') ||
        resolved.startsWith('lib/auth/') ||
        resolved.startsWith('lib/comment/') ||
        resolved.startsWith('lib/bookmark/') ||
        resolved.startsWith('lib/b2b/') ||
        resolved.startsWith('lib/insights/') ||
        resolved.startsWith('lib/moderation/') ||
        resolved.startsWith('lib/personalization/') ||
        resolved.startsWith('lib/penalty/') ||
        resolved.startsWith('lib/reaction/') ||
        resolved.startsWith('lib/search/') ||
        resolved.startsWith('lib/simulator/') ||
        resolved.startsWith('lib/subscription/') ||
        resolved.startsWith('lib/coupon/') ||
        resolved.startsWith('lib/wiki/') ||
        resolved.startsWith('lib/nlp/') ||
        resolved.startsWith('lib/etl/')
      ) {
        findings.D2_layer.push({
          file: rel,
          import: spec,
          rule: 'ui→domain lib 금지',
        });
      }
    }

    if (isFeature) {
      // feature must not depend on domain components
      if (resolved.startsWith('components/domain/')) {
        const key = `${rel}::${spec}`;
        if (D2_KNOWN_EXEMPT.has(key)) {
          findings.D2_layer_exempt.push({ file: rel, import: spec, rule: 'feature→domain (allowlisted)' });
        } else {
          findings.D2_layer.push({
            file: rel,
            import: spec,
            rule: 'feature→domain 금지',
          });
        }
      }
    }
  }
}

function checkD3(rel, text) {
  // count var(--color-*) usage; track which tokens are touched
  const re = /var\(\s*--(color|radius|shadow|duration|font|breakpoint)-([a-z0-9-]+)\s*[,)]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    findings.D3_token.usage++;
    findings.D3_token.used.add(`${m[1]}-${m[2]}`);
  }
  // Also: utility class usage of slots — bg-primary, text-text etc count as token use
  const slotRe = /(?:bg|text|border|ring|fill|stroke|outline|from|to|via)-(bronze|jade|vermilion|indigo|ink-base|ink-elev|ink-card|ink-card-strong|ink-line|ink-line-strong|text|text-soft|text-mute|primary|secondary|destructive|accent|muted|popover|card|background|foreground|border|input|success|info)(?:-(soft|deep))?\b/g;
  let s;
  while ((s = slotRe.exec(text)) !== null) {
    findings.D3_token.usage++;
    findings.D3_token.used.add(`semantic:${s[1]}${s[2] ? '-' + s[2] : ''}`);
  }
}

function checkD4(rel, text) {
  // Only CSS files
  if (!rel.endsWith('.css')) return;
  if (rel === 'app/globals.css') return; // globals defines tokens, expected
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) continue;
    if (COLOR_LIKE_RE.test(trimmed)) {
      findings.D4_hardcoded_css.push({ file: rel, line: i + 1, content: trimmed });
    }
  }
}

// ─── 보고서 ────────────────────────────────────────────────────────

function buildReport(tokens, scanCount, exitCode) {
  const ts = new Date().toISOString();
  const tokenDefined =
    tokens.color.length +
    tokens.radius.length +
    tokens.shadow.length +
    tokens.duration.length +
    tokens.font.length +
    tokens.breakpoint.length;
  findings.D3_token.defined = tokenDefined;

  const lines = [];
  lines.push(`# Design System Audit Report`);
  lines.push('');
  lines.push(`**Generated**: ${ts}`);
  lines.push(`**Scanned files**: ${scanCount}`);
  lines.push(`**Reference**: docs/sprint/10-sprint-launch/design.md §1.3`);
  lines.push(`**Exit code**: ${exitCode}`);
  lines.push('');
  lines.push('## 1. 토큰 인벤토리');
  lines.push('');
  lines.push('| 카테고리 | 정의 개수 | 사용 종류 |');
  lines.push('|---|---|---|');
  for (const cat of Object.keys(tokens)) {
    const used = [...findings.D3_token.used].filter((u) => u.startsWith(cat + '-') || (cat === 'color' && u.startsWith('semantic:'))).length;
    lines.push(`| ${cat} | ${tokens[cat].length} | ${used} |`);
  }
  lines.push('');
  lines.push(`**총 var()/semantic 사용**: ${findings.D3_token.usage}회`);
  lines.push(`**고유 토큰 사용 종류**: ${findings.D3_token.used.size}`);
  lines.push('');
  lines.push('## 2. D1 — Tailwind arbitrary value 분석');
  lines.push('');
  lines.push('### D1-A. 하드코딩 색상 (`bg-[#hex]`, `bg-[rgb(...)]`, `bg-[linear-gradient(... color ...)]`)');
  lines.push('');
  if (findings.D1_arbitrary_color.length === 0) {
    lines.push('PASS — 하드코딩 색상 0건.');
  } else {
    lines.push(`총 ${findings.D1_arbitrary_color.length}건. (gradient 안의 색상 + 단순 색상 합산)`);
    lines.push('');
    lines.push('| 파일 | 위치 | 값 | 분류 |');
    lines.push('|---|---|---|---|');
    for (const v of findings.D1_arbitrary_color.slice(0, 30)) {
      lines.push(`| \`${v.file}\` | L${v.line}:C${v.col} | \`${v.value.slice(0, 60).replace(/\|/g, '\\|')}\` | ${v.classification} |`);
    }
    if (findings.D1_arbitrary_color.length > 30) {
      lines.push(`| ... | | ... and ${findings.D1_arbitrary_color.length - 30} more | |`);
    }
  }
  lines.push('');
  lines.push('### D1-B. 일반 arbitrary (size/other) — WARN');
  lines.push('');
  if (findings.D1_arbitrary.length === 0) {
    lines.push('PASS — 일반 arbitrary 0건.');
  } else {
    lines.push(`총 ${findings.D1_arbitrary.length}건. (font-size rem/px, 단위가 토큰 scale 밖)`);
    lines.push('');
    lines.push('| 파일 | 위치 | 값 |');
    lines.push('|---|---|---|');
    for (const v of findings.D1_arbitrary.slice(0, 30)) {
      lines.push(`| \`${v.file}\` | L${v.line}:C${v.col} | \`${v.value.slice(0, 60)}\` |`);
    }
    if (findings.D1_arbitrary.length > 30) {
      lines.push(`| ... | | ... and ${findings.D1_arbitrary.length - 30} more |`);
    }
  }
  lines.push('');
  lines.push('## 3. D2 — 컴포넌트 계층 의존 방향');
  lines.push('');
  if (findings.D2_layer.length === 0) {
    lines.push('PASS — ui→feature/domain, feature→domain 역방향 0건.');
  } else {
    lines.push(`FAIL — ${findings.D2_layer.length}건 역방향 의존.`);
    lines.push('');
    lines.push('| 파일 | 잘못된 import | 규칙 |');
    lines.push('|---|---|---|');
    for (const v of findings.D2_layer) {
      lines.push(`| \`${v.file}\` | \`${v.import}\` | ${v.rule} |`);
    }
  }
  lines.push('');
  lines.push('## 4. D3 — 토큰 사용률');
  lines.push('');
  lines.push(`- 정의된 토큰: **${tokenDefined}**`);
  lines.push(`- 코드 내 var() + semantic utility 사용: **${findings.D3_token.usage}회**`);
  lines.push(`- 고유 토큰 종류 사용: **${findings.D3_token.used.size}**`);
  lines.push('');
  const usageRate = tokenDefined === 0 ? 0 : Math.min(100, Math.round((findings.D3_token.used.size / tokenDefined) * 100));
  lines.push(`**고유 사용률 (Coverage)**: ${usageRate}% — (정의된 토큰 중 코드/CSS에서 한 번 이상 사용된 비율의 근사치)`);
  lines.push('');
  lines.push('## 5. D4 — globals.css 외 CSS 하드코딩 색상');
  lines.push('');
  if (findings.D4_hardcoded_css.length === 0) {
    lines.push('PASS — 외부 .css 파일에 색상 리터럴 0건.');
  } else {
    lines.push(`WARN — ${findings.D4_hardcoded_css.length}건.`);
    lines.push('');
    for (const v of findings.D4_hardcoded_css.slice(0, 20)) {
      lines.push(`- \`${v.file}\` L${v.line}: \`${v.content.slice(0, 100)}\``);
    }
  }
  lines.push('');
  lines.push('## 6. 결론');
  lines.push('');
  const errs = findings.D1_arbitrary_color.length + findings.D2_layer.length;
  const warns = findings.D1_arbitrary.length + findings.D4_hardcoded_css.length;
  lines.push(`- ERROR: **${errs}** (D1-A 하드코딩 색상 ${findings.D1_arbitrary_color.length} + D2 역방향 ${findings.D2_layer.length})`);
  lines.push(`- WARN: **${warns}** (D1-B 일반 arbitrary ${findings.D1_arbitrary.length} + D4 CSS 색상 ${findings.D4_hardcoded_css.length})`);
  lines.push('');
  lines.push('## 7. 화이트리스트 (Sprint 11 carry)');
  lines.push('');
  lines.push('### D1-A 화이트리스트 (rgba/gradient overlays)');
  lines.push('');
  if (findings.D1_arbitrary_color_exempt.length === 0) {
    lines.push('없음.');
  } else {
    lines.push(`${findings.D1_arbitrary_color_exempt.length}건 — Sprint 11에서 opacity modifier 패턴(\`bg-ink-elev/60\`)으로 이전 예정.`);
    lines.push('');
    for (const v of findings.D1_arbitrary_color_exempt) {
      lines.push(`- \`${v.file}\` L${v.line}: \`${v.value.slice(0, 80)}\``);
    }
  }
  lines.push('');
  lines.push('### D2 화이트리스트 (잘못 분류된 컴포넌트)');
  lines.push('');
  if (findings.D2_layer_exempt.length === 0) {
    lines.push('없음.');
  } else {
    for (const v of findings.D2_layer_exempt) {
      lines.push(`- \`${v.file}\` → \`${v.import}\` (Sprint 11: components/ui/ 이전 검토)`);
    }
  }
  lines.push('');
  lines.push('## 8. Carry / 후속 액션');
  lines.push('');
  lines.push('- **Sprint 11**: 8 파일에 분산된 12 rgba/gradient overlay → CSS opacity modifier(`/60`, `/85`) 또는 `--color-ink-mask-*` 토큰화');
  lines.push('- **Sprint 11**: penalty-badge → components/ui/penalty-badge.tsx 위치 재배치 (D2 화이트리스트 제거)');
  if (findings.D1_arbitrary.length > 0) {
    lines.push(`- **검토**: font-size arbitrary (\`text-[0.72rem]\` 등) ${findings.D1_arbitrary.length}건 → Tailwind text-* scale 흡수 또는 토큰 추가`);
  }
  lines.push('');

  return lines.join('\n');
}

// ─── 실행 ──────────────────────────────────────────────────────────

function main() {
  const wantReport = process.argv.includes('--report');
  const wantJson = process.argv.includes('--json');

  const tokens = parseTokens();
  const files = walk(join(PROJECT_ROOT, 'components'), [])
    .concat(walk(join(PROJECT_ROOT, 'app'), []))
    .concat(walk(join(PROJECT_ROOT, 'lib'), []));

  for (const rel of files) {
    const text = read(rel);
    if (rel.endsWith('.css')) {
      checkD4(rel, text);
      checkD3(rel, text);
      continue;
    }
    checkD1(rel, text);
    checkD2(rel, text);
    checkD3(rel, text);
  }

  const errs = findings.D1_arbitrary_color.length + findings.D2_layer.length;
  const warns = findings.D1_arbitrary.length + findings.D4_hardcoded_css.length;
  const exitCode = errs === 0 ? 0 : 1;

  if (wantJson) {
    console.log(
      JSON.stringify(
        {
          scanned: files.length,
          tokens,
          errs,
          warns,
          findings: {
            ...findings,
            D3_token: { ...findings.D3_token, used: [...findings.D3_token.used] },
          },
          exitCode,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`Design System Audit`);
    console.log(`───────────────────`);
    console.log(`Scanned: ${files.length} files`);
    console.log(`Tokens: color=${tokens.color.length} radius=${tokens.radius.length} shadow=${tokens.shadow.length} duration=${tokens.duration.length} font=${tokens.font.length} breakpoint=${tokens.breakpoint.length}`);
    console.log(`D1-A hardcoded color : ${findings.D1_arbitrary_color.length} (error)`);
    console.log(`D1-B size arbitrary  : ${findings.D1_arbitrary.length} (warn)`);
    console.log(`D2 layer reverse    : ${findings.D2_layer.length} (error)`);
    console.log(`D3 token unique used: ${findings.D3_token.used.size} / ${tokens.color.length + tokens.radius.length + tokens.shadow.length + tokens.duration.length + tokens.font.length + tokens.breakpoint.length}`);
    console.log(`D3 total usages     : ${findings.D3_token.usage}`);
    console.log(`D4 css hardcoded    : ${findings.D4_hardcoded_css.length} (warn)`);
    console.log('');
    console.log(`Errors: ${errs}`);
    console.log(`Warns:  ${warns}`);
    console.log(`Exit code: ${exitCode}`);
  }

  if (wantReport) {
    const reportPath = join(PROJECT_ROOT, 'docs/sprint/10-sprint-launch/reports/design-system-audit.md');
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, buildReport(tokens, files.length, exitCode), 'utf8');
    console.log(`Report written: ${relative(PROJECT_ROOT, reportPath)}`);
  }

  process.exit(exitCode);
}

main();
