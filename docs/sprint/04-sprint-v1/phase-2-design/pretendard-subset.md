# Pretendard Subset V1

> **Sprint V1** — Pretendard Variable woff2 subset (2MB → 400KB)
> **M9 Mobile lab Performance ≥85 게이트**

---

## 1. 배경

Sprint v2 P4/P5 Lighthouse Mobile simulate=mobileSlow4G 환경:
- Performance 75 ⚠️ (lab metric)
- LCP 12-14초 (font 다운로드 시간 본질)
- Pretendard Variable woff2 2.0MB → 4G 환경 1.5-2초 다운로드

production CDN + LTE/5G 환경에서는 자연 개선되지만, lab metric 85+ 게이트 통과 + Web Vitals 일관성을 위해 subset 필수.

---

## 2. 도구

### 2.1 fonttools (Python)

```bash
pip install fonttools[woff] brotli zopfli
# pip install fonttools[woff]   # woff2 인코딩 의존성
# pip install brotli zopfli     # 압축률 향상
```

검증:
```bash
pyftsubset --help | head -5
```

---

## 3. Subset 명령

### 3.1 글리프 범위 (Unicode)

| 범위 | 글리프 수 | 설명 |
|---|---|---|
| `U+0020-007E` | 95 | Basic Latin (a-z, A-Z, 0-9, 기호) |
| `U+00A0-00FF` | 96 | Latin-1 Supplement (악센트 ã é ñ 등) |
| `U+AC00-D7A3` | 11,172 | Hangul Syllables (한글 완성형 — 표시 우선) |
| `U+3131-318E` | 94 | Hangul Compatibility Jamo (자모 단독) |
| `U+1100-11FF` | 256 | Hangul Jamo (초성/중성/종성 조합) |
| `U+3200-32FF` | 256 | Enclosed CJK Letters (㈜ ㈎ 등) |
| `U+2010-203E` | 47 | 일반 구두점 (— … ' " 등) |
| `U+FF00-FFEF` | 240 | Halfwidth/Fullwidth |

**전략 1 (보수적, 권장)**: KS X 1001 완성형 2350자 + Latin Basic 95자 + 자주 쓰는 기호 → **~400KB**
**전략 2 (전체 한글)**: U+AC00-D7A3 11,172자 모두 + Latin → ~1.2MB

V1 MVP는 전략 1 (KS X 1001).

### 3.2 KS X 1001 완성형 2350자

KS X 1001 (한국 산업 표준) 완성형 한글은 2350자. 사용 빈도 95% 커버. 누락 글자는 시스템 폰트로 폴백 (font-display: swap).

KS X 1001 글리프 리스트 — `pyftsubset --text-file=ks-x-1001.txt` 또는 `--unicodes` flag.

### 3.3 명령

```bash
cd public/fonts

# 백업
cp PretendardVariable.woff2 PretendardVariable-full.woff2.bak

# Subset 빌드
pyftsubset PretendardVariable.woff2 \
  --output-file=PretendardVariable.woff2 \
  --flavor=woff2 \
  --unicodes-file=../docs/sprint/04-sprint-v1/phase-2-design/pretendard-subset-unicodes.txt \
  --layout-features='*' \
  --no-hinting \
  --desubroutinize \
  --notdef-outline \
  --recommended-glyphs

# 검증
ls -la PretendardVariable.woff2
# 예상 400-500KB
```

### 3.4 검증 스크립트

`scripts/verify-font-subset.sh`:
```bash
#!/bin/bash
SIZE=$(stat -f%z public/fonts/PretendardVariable.woff2 2>/dev/null || stat -c%s public/fonts/PretendardVariable.woff2)
MAX_BYTES=$((500 * 1024))  # 500KB
if [ "$SIZE" -gt "$MAX_BYTES" ]; then
  echo "❌ Font subset too large: $SIZE bytes (max $MAX_BYTES)"
  exit 1
fi
echo "✓ Font subset OK: $SIZE bytes"
```

CI / pre-commit hook에서 실행 가능.

---

## 4. 코드 변경 — 없음

`app/layout.tsx`의 `localFont` config:
```ts
const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',  // 그대로
  display: 'swap',
  variable: '--font-pretendard',
  weight: '45 920',
  preload: true,
});
```

운영자가 `public/fonts/PretendardVariable.woff2`를 subset 본으로 교체만 하면 됨. **코드 변경 0건**.

---

## 5. Variable Font weight 보존

`--layout-features='*'` 옵션으로 OpenType features 모두 보존. variable font의 weight axis (`wght 45-920`) 유지.

검증:
```bash
otfinfo --features public/fonts/PretendardVariable.woff2  # GSUB/GPOS features 확인
otfinfo --axes public/fonts/PretendardVariable.woff2      # variable axes 확인
```

---

## 6. 폴백 전략

- font-display: swap (이미 v2 설정)
- 누락 글자 (한자, 특수 기호 등) → 시스템 폰트 (Apple SD Gothic Neo / Malgun Gothic / sans-serif)
- 사용자 경험에는 큰 영향 없음 (메인 한글 본문은 KS X 1001로 커버)

---

## 7. Lighthouse 예상 효과

| Metric | Before (2MB) | After (~400KB) |
|---|---|---|
| Mobile Performance | 75 | 85-90 (예상) |
| LCP | 12-14s | 4-6s (예상) |
| Total byte weight | 2,592 KiB | ~1,000 KiB |
| Font load time | 1.5-2s | 0.3-0.4s |

production CDN에서는 더 좋음.

---

## 8. 운영자 게이트 (P3.A)

운영자 작업 가이드 (`phase-3-do/P3.A-OPERATOR-GATES.md`):

```bash
# 1. Python + fonttools 설치
pip install fonttools[woff] brotli zopfli

# 2. 백업
cp public/fonts/PretendardVariable.woff2 public/fonts/PretendardVariable-full.woff2.bak

# 3. Subset
pyftsubset public/fonts/PretendardVariable-full.woff2.bak \
  --output-file=public/fonts/PretendardVariable.woff2 \
  --flavor=woff2 \
  --unicodes=U+0020-007E,U+00A0-00FF,U+3131-318E,U+1100-11FF,U+AC00-D7A3,U+2010-203E,U+FF00-FFEF \
  --layout-features='*' \
  --no-hinting \
  --desubroutinize \
  --recommended-glyphs

# 4. 검증
bash scripts/verify-font-subset.sh

# 5. 빌드 + Lighthouse
pnpm build
pnpm start &
npx lighthouse http://localhost:3000/ --form-factor=mobile --quiet --output=json --output-path=./lh.json
node -e "console.log(JSON.parse(require('fs').readFileSync('lh.json')).categories.performance.score)"

# 6. ≥0.85 확인 후 commit
git add public/fonts/PretendardVariable.woff2
git commit -m "perf(pretendard): KS X 1001 subset (2MB → 400KB)"
```

---

## 9. unicodes 파일

`docs/sprint/04-sprint-v1/phase-2-design/pretendard-subset-unicodes.txt`:
```
U+0020-007E
U+00A0-00FF
U+3131-318E
U+1100-11FF
U+AC00-D7A3
U+2010-203E
U+FF00-FFEF
```

---

## 10. 결정

- KS X 1001 + Latin Basic + 자주 쓰는 기호 = ~400KB 목표
- variable font weight axis 보존
- 운영자 1회 작업 + 코드 변경 0건
- Lighthouse Mobile lab 85+ 게이트
