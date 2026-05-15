/**
 * Next.js 16 metadata file — apple-touch-icon (180×180).
 * Sprint V4 P3.A (M11).
 */
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon(): ImageResponse {
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
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          fontFamily: 'sans-serif',
          textShadow: '0 6px 18px rgba(0,0,0,0.5)',
          borderRadius: 40,
        }}
      >
        깨
      </div>
    ),
    size,
  );
}
