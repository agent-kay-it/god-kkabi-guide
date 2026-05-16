/**
 * Next.js 16 metadata file — Open Graph image (1200×630).
 * Sprint V4 P3.A (M11) — LinkedIn / Twitter / Slack 미리보기.
 */
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '갓깨비 키우기 비공식 팬 가이드 — 위키 · 채팅 · 북마크';

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(200,153,104,0.18) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(126,182,168,0.10) 0%, transparent 50%), #07070b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          color: '#ece7dd',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 22,
            color: '#b8b1a4',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          <span
            style={{
              background: 'rgba(200,153,104,0.18)',
              color: '#e8c79a',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            v2026.05
          </span>
          <span>갓깨비 키우기 비공식 팬 가이드</span>
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: 30,
            background: 'linear-gradient(135deg, #e8c79a 0%, #c89968 60%, #8a6841 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
          }}
        >
          효율로 풀어쓴
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: 36,
            color: '#ece7dd',
            display: 'flex',
          }}
        >
          공략 가이드.
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#b8b1a4',
            lineHeight: 1.5,
            maxWidth: 880,
            display: 'flex',
          }}
        >
          직업 · 진령 · 과금 · 이벤트 · 고급 메커니즘까지 한 페이지에 정리한
          비공식 팬 커뮤니티 가이드.
        </div>
      </div>
    ),
    size,
  );
}
