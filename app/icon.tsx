/**
 * Next.js 16 metadata file — favicon (256×256).
 * Sprint V4 P3.A (M11) — source app-icon.webp 기반.
 *
 * Next.js가 빌드 시 자동으로 /icon에서 제공하며 <link rel="icon">을 모든 페이지에 inject.
 *
 * 본 파일은 ImageResponse로 동적 SVG 생성. webp 자체는 `<Image src>`로
 * 직접 표시 (예: TopBar, Hero).
 */
import { ImageResponse } from 'next/og';

export const size = { width: 256, height: 256 };
export const contentType = 'image/png';

export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(circle at 30% 30%, #c89968 0%, #8a6841 60%, #07070b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ece7dd',
          fontSize: 144,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          fontFamily: 'sans-serif',
          textShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        깨
      </div>
    ),
    size,
  );
}
