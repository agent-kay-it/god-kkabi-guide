/**
 * Sprint MVP v2 — Coming Soon placeholder
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md
 *
 * v1 정적 가이드는 archive/v1-static-guide 브랜치 + v1.0.0-mvp-archived 태그에 보존.
 * v2 위키 + 커뮤니티 + 채팅 + 인증 시스템으로 재구축 중.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '갓깨비 키우기 가이드 — 준비 중',
  description: '갓깨비 키우기 비공식 팬 가이드 v2 (위키 + 커뮤니티) 준비 중. 곧 오픈됩니다.',
  robots: { index: false, follow: false },
};

export default function HomePage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-accent-gold sm:text-4xl">
        갓깨비 키우기 가이드 v2 준비 중
      </h1>
      <p className="mt-4 text-text-secondary">
        위키 · 커뮤니티 · 실시간 채팅이 포함된 새 플랫폼으로 재구축 중입니다.
      </p>
      <p className="mt-6 text-sm text-text-muted">2026.05.15</p>
    </main>
  );
}
