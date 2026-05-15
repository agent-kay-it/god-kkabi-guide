import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'play-lh.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "img-src 'self' https://play-lh.googleusercontent.com https://is1-ssl.mzstatic.com https://firebasestorage.googleapis.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net data: blob:",
              "connect-src 'self' https://firestore.googleapis.com https://*.firebaseio.com https://www.google-analytics.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://pagead2.googlesyndication.com",
              "font-src 'self' https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Turbopack은 next dev --turbopack으로 활성화 (dev script에 포함)
  // experimental.turbo 설정은 Next.js 15에서 불필요
};

export default nextConfig;
