/**
 * /sources — 출처 모음 페이지 (100% 외부 출처 명시).
 * Phase 3 do.C-3 (3/4)
 *
 * 콘텐츠 정책 §3.5 분쟁 대응:
 *  - 모든 외부 인용 출처 통합 표시
 *  - 카테고리별 정리 (공식 / 가이드 / 커뮤니티)
 *  - rel="nofollow noopener noreferrer" 자동 적용
 */
import type { Metadata } from 'next';
import {
  Hero,
  DomainAlert,
  Footer,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '갓깨비 가이드 출처 — 인용 자료 + 공식 페이지 모음',
  description:
    '본 가이드가 참고한 모든 외부 출처를 카테고리별로 정리. 공식 페이지·외부 가이드·커뮤니티 출처 통합.',
  keywords: [
    '갓깨비 가이드 출처',
    '갓깨비 공식 페이지',
    '갓깨비 커뮤니티',
  ],
  alternates: { canonical: '/sources' },
  robots: { index: true, follow: true },
};

interface SourceItem {
  label: string;
  href: string;
  note?: string;
}

const OFFICIAL_SOURCES: readonly SourceItem[] = [
  {
    label: 'Google Play — 갓깨비 키우기 공식 스토어',
    href: 'https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi',
    note: '게임 운영사 공식 페이지 (Joy Nice Games / JOY MOBILE NETWORK PTE. LTD.)',
  },
  {
    label: 'App Store — 갓깨비 키우기 공식',
    href: 'https://apps.apple.com/kr/app/%EA%B0%93%EA%B9%A8%EB%B9%84-%ED%82%A4%EC%9A%B0%EA%B8%B0/id6745617040',
    note: 'iOS 공식 스토어',
  },
];

const GUIDE_SOURCES: readonly SourceItem[] = [
  {
    label: 'BlueStacks 한국어 가이드 블로그',
    href: 'https://www.bluestacks.com/ko/blog/',
    note: '운영자가 일부 가이드 콘텐츠를 인용하며 본 가이드만의 검증 결과를 추가하여 작성',
  },
];

const COMMUNITY_SOURCES: readonly SourceItem[] = [
  {
    label: '인벤 — 갓깨비 키우기 갤러리',
    href: 'https://www.inven.co.kr/',
    note: '커뮤니티 핫토픽 큐레이션 + 운영자 가공',
  },
  {
    label: '디시인사이드 — 갓깨비 키우기 마이너 갤러리',
    href: 'https://gall.dcinside.com/mgallery/board/lists/?id=gokkaebi',
    note: '커뮤니티 PvP 후기 + 메타 변화 추적',
  },
];

export default function SourcesPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
      <Hero
        iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
        iconAlt="갓깨비 키우기 가이드 출처"
        title="📚 출처 통합"
        subtitle="본 가이드가 참고한 모든 외부 출처"
        metaInfo="저작권자 요청 시 24시간 이내 대응 · 2026-05-15"
      />

      <div className="mt-6 space-y-3">
        <DomainAlert variant="warning" title="비공식 팬 가이드 안내">
          본 사이트는 비공식 팬 가이드입니다. Joy Nice Games / JOY MOBILE NETWORK PTE. LTD. /
          4399 / Kakao Games 등 저작권자의 요청 시 24시간 이내 해당 콘텐츠를 삭제하거나 수정합니다.
          문의는 <a href="mailto:kay@agentkay.it" className="text-accent-gold underline-offset-4 hover:underline">kay@agentkay.it</a>로 보내주세요.
        </DomainAlert>
        <DomainAlert variant="info" title="출처 표기 정책">
          본 가이드는 외부 인용 시 (1) 출처 URL + (2) 인용 단락 200자 이하 + (3) 운영자 가공·검증
          코멘트 1줄 이상 추가를 원칙으로 합니다. 100% 직접 작성한 페이지(/tips, /class-quiz 등)는
          외부 인용 없이 운영자 12주 플레이 데이터만 사용합니다.
        </DomainAlert>
      </div>

      <section className="mt-12" aria-labelledby="official-title">
        <h2 id="official-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
          1. 공식 출처
        </h2>
        <ul className="space-y-3">
          {OFFICIAL_SOURCES.map((s) => (
            <li key={s.href} className="rounded-card border border-border-soft bg-bg-card p-4">
              <a
                href={s.href}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-sm font-bold text-accent-gold underline-offset-4 hover:underline"
              >
                {s.label}
              </a>
              {s.note ? (
                <p className="mt-1 text-xs text-text-muted">{s.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="guide-title">
        <h2 id="guide-title" className="mb-3 text-xl font-bold text-accent-cyan sm:text-2xl">
          2. 외부 가이드 출처
        </h2>
        <ul className="space-y-3">
          {GUIDE_SOURCES.map((s) => (
            <li key={s.href} className="rounded-card border border-border-soft bg-bg-card p-4">
              <a
                href={s.href}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-sm font-bold text-accent-cyan underline-offset-4 hover:underline"
              >
                {s.label}
              </a>
              {s.note ? (
                <p className="mt-1 text-xs text-text-muted">{s.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="community-title">
        <h2 id="community-title" className="mb-3 text-xl font-bold text-accent-purple sm:text-2xl">
          3. 커뮤니티 출처
        </h2>
        <ul className="space-y-3">
          {COMMUNITY_SOURCES.map((s) => (
            <li key={s.href} className="rounded-card border border-border-soft bg-bg-card p-4">
              <a
                href={s.href}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-sm font-bold text-accent-purple underline-offset-4 hover:underline"
              >
                {s.label}
              </a>
              {s.note ? (
                <p className="mt-1 text-xs text-text-muted">{s.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <Footer lastUpdated="2026-05-15" />
    </main>
  );
}
