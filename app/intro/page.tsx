/**
 * /intro — 비공식 가이드 소개 페이지.
 * Phase 3 do.C-3 (4/4)
 *
 * 게임 기본 정보 + 핵심 시스템 5가지 + 가이드 소개.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Hero,
  DomainAlert,
  Footer,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '갓깨비 키우기 소개 — 게임 기본 + 본 가이드 소개',
  description:
    '갓깨비 키우기 게임 기본 정보 + 핵심 시스템 5가지 + 본 비공식 팬 가이드 소개.',
  keywords: [
    '갓깨비 키우기 소개',
    '갓깨비 키우기 게임',
    '갓깨비 시스템',
    '갓깨비 가이드 소개',
  ],
  alternates: { canonical: '/intro' },
  openGraph: {
    type: 'article',
    title: '갓깨비 키우기 소개 + 본 가이드 소개',
    description: '게임 기본 + 핵심 시스템 5 + 가이드 운영 방침.',
    url: 'https://god-kkabi-guide.vercel.app/intro',
  },
};

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 소개 + 본 가이드 운영 방침',
  author: { '@type': 'Person', name: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  inLanguage: 'ko',
};

export default function IntroPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 소개"
          title="🏯 갓깨비 키우기 소개"
          subtitle="한국 단독 출시 모바일 RPG · 비공식 팬 가이드"
          metaInfo="2025-04-18 한국 출시 · 본 가이드 시작 2026-05-15"
        />

        <div className="mt-6">
          <DomainAlert variant="info" title="본 가이드 운영 방침">
            본 사이트는 1인 운영자(kay@agentkay.it)가 직접 게임을 12주간 플레이하며 작성한 비공식
            팬 가이드입니다. Joy Nice Games / JOY MOBILE NETWORK PTE. LTD. 공식 자료가 아닙니다.
            매주 1회 갱신 · 모든 데이터 운영자 직접 측정 · 외부 인용 시 출처 명시.
          </DomainAlert>
        </div>

        <section className="mt-12" aria-labelledby="game-title">
          <h2 id="game-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            1. 게임 기본 정보
          </h2>
          <div className="space-y-2 rounded-card border border-border-soft bg-bg-card p-5 text-sm">
            <p>
              <strong className="text-text-primary">개발사</strong>:{' '}
              <span className="text-text-secondary">JOY MOBILE NETWORK PTE. LTD. (Joy Nice Games)</span>
            </p>
            <p>
              <strong className="text-text-primary">출시일</strong>:{' '}
              <span className="text-text-secondary">2025-04-18 (한국 단독)</span>
            </p>
            <p>
              <strong className="text-text-primary">플랫폼</strong>:{' '}
              <span className="text-text-secondary">
                Google Play · App Store · Mac (M1+) · Vision Pro · Kakao Games 통합
              </span>
            </p>
            <p>
              <strong className="text-text-primary">장르</strong>:{' '}
              <span className="text-text-secondary">방치형 RPG · 한국 토속 신앙 모티프</span>
            </p>
            <p>
              <strong className="text-text-primary">과금 모델</strong>:{' '}
              <span className="text-text-secondary">
                F2P + 인앱 구매 (시즌 패스 / 진령 소환권 / 패키지)
              </span>
            </p>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="system-title">
          <h2 id="system-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            2. 핵심 시스템 5가지
          </h2>
          <div className="space-y-3">
            <div className="rounded-card border border-accent-gold bg-bg-card p-4">
              <h3 className="text-base font-bold text-accent-gold">① 직업 3종 — 전사 · 검객 · 영매</h3>
              <p className="mt-2 text-sm text-text-secondary">
                초반 캐릭터 생성 시 1회 선택. 자동사냥 효율 · 결투장 채용률 · 보스 DPS가 직업별로
                다름.{' '}
                <Link href="/class-quiz" className="text-accent-gold underline-offset-4 hover:underline">
                  직업 진단으로 나에게 맞는 직업 찾기 →
                </Link>
              </p>
            </div>
            <div className="rounded-card border border-accent-cyan bg-bg-card p-4">
              <h3 className="text-base font-bold text-accent-cyan">② 진령 11종 — 한국 신화 모티프</h3>
              <p className="mt-2 text-sm text-text-secondary">
                홍길동·서해용왕·청구요 등 11종 진령 시스템. 3슬롯 장착 + 영혼 강화 라인 메타 결정 변수.{' '}
                <Link href="/jinryeong" className="text-accent-gold underline-offset-4 hover:underline">
                  진령 11종 티어 →
                </Link>
              </p>
            </div>
            <div className="rounded-card border border-accent-purple bg-bg-card p-4">
              <h3 className="text-base font-bold text-accent-purple">③ 스킬 트리 + 제련</h3>
              <p className="mt-2 text-sm text-text-secondary">
                core · active · passive 3종 스킬 + 무기·방어구 제련. +12 라인이 결투장 진입선.{' '}
                <Link href="/skill-equip" className="text-accent-gold underline-offset-4 hover:underline">
                  자원 우선순위 →
                </Link>
              </p>
            </div>
            <div className="rounded-card border border-accent-red bg-bg-card p-4">
              <h3 className="text-base font-bold text-accent-red">④ 5 콘텐츠 — 메인/무한/비경/보스/결투장</h3>
              <p className="mt-2 text-sm text-text-secondary">
                일일 운영 5 콘텐츠. 본인 라인에 맞는 콘텐츠 우선순위 결정.{' '}
                <Link href="/dungeon" className="text-accent-gold underline-offset-4 hover:underline">
                  던전·PvP 전략 →
                </Link>
              </p>
            </div>
            <div className="rounded-card border border-accent-green bg-bg-card p-4">
              <h3 className="text-base font-bold text-accent-green">⑤ 시즌제 결투장 (PvP)</h3>
              <p className="mt-2 text-sm text-text-secondary">
                시즌별 보상 라인. 검객 채용률 68% · TOP 50 빌드 음영귀+강림도+백림명 68% 채용.{' '}
                <Link href="/builds/meta-swordsman" className="text-accent-gold underline-offset-4 hover:underline">
                  검객 메타 빌드 →
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="guide-title">
          <h2 id="guide-title" className="mb-3 text-xl font-bold text-accent-gold sm:text-2xl">
            3. 본 가이드 소개
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              본 가이드는 운영자가 2026년 2월 1일부터 5월 15일까지 12주간 본인 계정으로 직접
              플레이하며 수집한 데이터를 기반으로 작성되었습니다. 결투장 TOP 50 도달 · 무한 던전
              287층 · 일일 다이아 누적 약 30,000개 측정 기록을 첨부합니다.
            </p>
            <p>
              <strong className="text-text-primary">콘텐츠 정책 (70/30 하이브리드)</strong>: 운영자
              직접 작성 70% (12주 플레이 데이터 + 분석 + 검증 결과) + 외부 인용 30% (BlueStacks /
              인벤 / 디시 등 출처 명시 + 운영자 가공 + 검증 코멘트 의무).
            </p>
            <p>
              <strong className="text-text-primary">갱신 주기</strong>: 매주 1회 운영자 직접 검증 ·
              쿠폰 자동 만료 처리 · 메타 변동 시 즉시 갱신.
            </p>
            <p>
              <strong className="text-text-primary">문의</strong>:{' '}
              <a href="mailto:kay@agentkay.it" className="text-accent-gold underline-offset-4 hover:underline">
                kay@agentkay.it
              </a>
              . 저작권자 요청 시 24시간 이내 대응합니다.
            </p>
          </div>
        </section>

        <Footer
          lastUpdated="2026-05-15"
          sources={[
            {
              label: 'Google Play — 갓깨비 키우기 공식',
              href: 'https://play.google.com/store/apps/details?id=com.joynicegames.gokkaebi',
            },
          ]}
        />
      </main>
    </>
  );
}
