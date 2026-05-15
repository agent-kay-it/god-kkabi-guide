/**
 * 홈 페이지 (Scaffolding 단계 — Phase 3 do.C에서 본격 콘텐츠 작성).
 *
 * 현재 상태: 디자인 토큰 검증용 placeholder.
 * Phase 3 do.B에서 Hero / TOC / 컴포넌트 15종 도입 후
 * Phase 3 do.C에서 본 페이지를 완성한다.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="title-gradient text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          갓깨비 키우기 가이드
        </h1>
        <p className="mt-4 text-base text-text-secondary sm:text-lg">
          비공식 팬 가이드 — 1인 운영, 매주 검증
        </p>
      </header>

      <section className="rounded-card glow-card border border-border-gold bg-bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-accent-gold">스캐폴딩 단계</h2>
        <p className="mt-3 text-text-primary">
          본 페이지는 Phase 3 do.A 스캐폴딩 검증용입니다. 디자인 시스템 22 토큰이
          정상 로드되면 카드 보더가 골드, 배경이 짙은 퍼플-블랙으로 표시됩니다.
        </p>
        <ul className="mt-4 space-y-2 text-text-secondary">
          <li>• Phase 3 do.B: 컴포넌트 15종 작성 + Chrome 시각 검증</li>
          <li>• Phase 3 do.C: 페이지 15개 + 콘텐츠 70/30</li>
          <li>• Phase 3 do.D: SEO + Firestore seed + Production 배포</li>
        </ul>
      </section>

      <footer className="mt-12 text-center text-sm text-text-muted">
        <p>
          비공식 팬 가이드 · 문의 <a href="mailto:kay@agentkay.it">kay@agentkay.it</a>
        </p>
      </footer>
    </main>
  );
}
