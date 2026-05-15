/**
 * Sprint MVP v2 — Coming Soon placeholder (v2 디자인 토큰 적용)
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md
 *
 * v1 정적 가이드는 archive/v1-static-guide 브랜치 + v1.0.0-mvp-archived 태그에 보존.
 * v2 위키 + 커뮤니티 + 채팅 + 인증 시스템으로 재구축 중.
 *
 * P3.A.6 단계에서 본 페이지는 TopBar + Hero + AuthButtons 가 추가된
 * 정식 랜딩으로 교체된다 (현 시점은 디자인 토큰 검증 placeholder).
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '갓깨비 키우기 가이드 — 준비 중',
  description: '갓깨비 키우기 비공식 팬 가이드 v2 (위키 + 커뮤니티) 준비 중.',
  robots: { index: false, follow: false },
};

export default function HomePage(): React.JSX.Element {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="glass relative max-w-2xl rounded-[var(--radius-card-lg)] px-8 py-16 sm:px-14">
        <div
          className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-ink-line-strong bg-[rgba(14,14,21,0.6)] py-1.5 pl-2 pr-3.5 text-[0.78rem] tracking-wide text-text-soft backdrop-blur-[10px]"
        >
          <span className="rounded-full bg-bronze/15 px-2 py-0.5 text-[0.72rem] font-semibold text-bronze-soft">
            Sprint MVP v2
          </span>
          <span className="font-mono text-text-soft">2026.05.15</span>
        </div>
        <h1 className="title-gradient text-4xl font-extrabold tracking-tight sm:text-5xl">
          갓깨비 키우기 가이드 v2
        </h1>
        <p className="mt-5 text-base text-text-soft sm:text-lg">
          위키 · 실시간 채팅 · 북마크 · 직업/진령 데이터베이스
        </p>
        <p className="mt-2 text-sm text-text-mute">
          1인 팬이 운영하는 비공식 커뮤니티 가이드를 재구축하고 있습니다.
        </p>
        <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-bronze/30 bg-bronze/10 px-4 py-2 text-sm text-bronze-soft">
          <span className="h-2 w-2 animate-pulse rounded-full bg-bronze" aria-hidden />
          P3.A 스캐폴딩 진행 중
        </div>
      </div>
    </main>
  );
}
