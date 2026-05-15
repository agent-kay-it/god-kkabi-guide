/**
 * /components — 개발 환경 전용 시각 검증 페이지.
 * 15 도메인 컴포넌트 + Magic UI motion 3종을 한 페이지에 mount.
 * 운영자/AI가 Chrome MCP로 mobile/tablet/desktop viewport 검증 시 사용.
 *
 * production 빌드에서는 notFound() 반환 (PR/배포 시 자동 제외).
 */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Hero,
  TOC,
  ClassCard,
  JinryeongCard,
  TierList,
  ComboCard,
  CouponCode,
  DomainAlert,
  PriorityFlow,
  PayTier,
  EventCard,
  TipCard,
  ScreenshotStrip,
  Footer,
  BuildTagBadge,
  type JinryeongCardProps,
} from '@/components/domain';
import { BUILD_TAGS } from '@/types';

export const metadata: Metadata = {
  title: '컴포넌트 시각 검증 (dev)',
  robots: { index: false, follow: false },
};

const TOC_ITEMS = [
  { href: '#hero', label: 'Hero', description: '앱 아이콘 + 타이틀' },
  { href: '#toc', label: 'TOC', description: '목차 그리드' },
  { href: '#class-card', label: 'ClassCard', description: '직업 3종' },
  { href: '#jinryeong-card', label: 'JinryeongCard', description: '진령 11종' },
  { href: '#tier-list', label: 'TierList', description: '0/1/2 티어' },
  { href: '#combo-card', label: 'ComboCard', description: '추천 조합' },
  { href: '#coupon-code', label: 'CouponCode', description: '쿠폰 복사' },
  { href: '#alert', label: 'Alert', description: '4 variant' },
  { href: '#priority-flow', label: 'PriorityFlow', description: '우선순위' },
  { href: '#pay-tier', label: 'PayTier', description: '과금 3종' },
  { href: '#event-card', label: 'EventCard', description: '이벤트' },
  { href: '#tip-card', label: 'TipCard', description: '실전 팁' },
  { href: '#screenshot-strip', label: 'ScreenshotStrip', description: 'PV 스크린샷' },
  { href: '#build-tag-badge', label: 'BuildTagBadge', description: '태그 11종' },
];

const SAMPLE_JINRYEONG: JinryeongCardProps[] = [
  {
    id: 'eumyeong_gwi',
    nameKo: '음영귀',
    rarity: 'SSR',
    tier: 0,
    recommendedClass: ['swordsman'],
    coreSkill: '치명타 시 추가 그림자 분신 소환. 검객 메타 핵심.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'baekho_su',
    nameKo: '백호수',
    rarity: 'SSR',
    tier: 0,
    recommendedClass: ['warrior'],
    coreSkill: '광역 도발 + 받는 피해 감소. 전사 탱딜 필수.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'cheonggu_yo',
    nameKo: '청구요',
    rarity: 'SR',
    tier: 1,
    recommendedClass: ['medium', 'swordsman'],
    coreSkill: '아군 회복 + 마법 증폭. 영매 유틸 강화.',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'gangrim_do',
    nameKo: '강림도',
    rarity: 'SR',
    tier: 2,
    recommendedClass: ['warrior', 'swordsman'],
    coreSkill: '단일 폭딜 스킬. 보스 전용 채용 권장.',
    lastUpdated: '2026-05-15',
  },
];

const TIER_ROWS = [
  { tier: 0 as const, label: '0티어 — 메타 핵심', cards: SAMPLE_JINRYEONG.slice(0, 2) },
  { tier: 1 as const, label: '1티어 — 서브', cards: SAMPLE_JINRYEONG.slice(2, 3) },
  { tier: 2 as const, label: '2티어 — 상황별', cards: SAMPLE_JINRYEONG.slice(3, 4) },
];

const PRIORITY_STEPS = [
  { rank: 1, label: '검객 1차 각성', reason: '메인 직업 기본 능력 해금' },
  { rank: 2, label: '음영귀 영혼 강화', reason: '0티어 진령 시너지 확보' },
  { rank: 3, label: '제련 +12', reason: '결투장 진입 라인' },
  { rank: 4, label: '백호수 영혼 합성', reason: '탱딜 보조 라인' },
];

const SCREENSHOTS = Array.from({ length: 6 }, (_, i) => ({
  src: `https://play-lh.googleusercontent.com/placeholder-${i}`,
  alt: `갓깨비 키우기 게임 스크린샷 ${i + 1}`,
}));

export default function ComponentsDevPage(): React.JSX.Element {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10 rounded-card border border-accent-red bg-bg-card p-5 text-sm">
        <p className="font-bold text-accent-red">⚠ DEV 전용 시각 검증 페이지</p>
        <p className="mt-1 text-text-secondary">
          본 페이지는 production 빌드에서 자동 제외됩니다. Chrome MCP로
          mobile 375px / tablet 768px / desktop 1280px viewport 시각 검증에 사용.
        </p>
      </div>

      <section id="hero" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.1 Hero</h2>
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/placeholder-icon"
          iconAlt="placeholder"
          title="갓깨비 키우기 비공식 팬 가이드"
          subtitle="2026.05 메타 기준 — 1인 운영, 매주 검증"
          metaInfo="최종 업데이트 2026-05-15"
        />
      </section>

      <section id="toc" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.2 TOC</h2>
        <TOC items={TOC_ITEMS.slice(0, 6)} />
      </section>

      <section id="class-card" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.3 ClassCard (3 variant)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ClassCard
            variant="warrior"
            emoji="⚔️"
            name="전사 (도깨비)"
            tag="탱딜"
            strengths={['높은 생존력', '광역 도발', 'PvP 안정']}
            recommendedJinryeong={['백호수', '구천명', '강림도']}
          />
          <ClassCard
            variant="swordsman"
            emoji="🗡️"
            name="검객 (무당)"
            tag="폭딜"
            strengths={['단일 폭딜', '치명타 메타', '결투장 강자']}
            recommendedJinryeong={['음영귀', '강림도', '백림명']}
            buildLinkHref="/builds/meta-swordsman"
          />
          <ClassCard
            variant="medium"
            emoji="🔮"
            name="영매 (저승사자)"
            tag="유틸"
            strengths={['아군 회복', '디버프', 'PvE 안정']}
            recommendedJinryeong={['청구요', '음양자', '왕귀를']}
          />
        </div>
      </section>

      <section id="jinryeong-card" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.4 JinryeongCard</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_JINRYEONG.map((j) => (
            <JinryeongCard key={j.id} {...j} />
          ))}
        </div>
      </section>

      <section id="tier-list" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.5 TierList</h2>
        <TierList tiers={TIER_ROWS} />
      </section>

      <section id="combo-card" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.6 ComboCard (3 type)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ComboCard
            type="meta"
            title="메타 정석 조합"
            jinryeong3={['음영귀', '백호수', '청구요']}
            description="검객 폭딜 + 전사 탱딜 + 영매 회복. 결투장 TOP10 70% 채용."
            recommendedFor={['swordsman', 'warrior']}
          />
          <ComboCard
            type="damage"
            title="폭딜 특화"
            jinryeong3={['음영귀', '강림도', '백림명']}
            description="단일 DPS 극대화. 보스 던전 전용."
            recommendedFor={['swordsman']}
          />
          <ComboCard
            type="stability"
            title="안정 운영"
            jinryeong3={['백호수', '청구요', '구천명']}
            description="장기 자동사냥 안정성. 무한던전 깊이 푸시."
            recommendedFor={['warrior', 'medium']}
          />
        </div>
      </section>

      <section id="coupon-code" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.7 CouponCode</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CouponCode
            code="GOKKAEBI2026"
            description="999뽑기 증정"
            reward="다이아 1000 + 진령 소환권 10"
            status="valid"
            expiresAt={tomorrow}
          />
          <CouponCode
            code="WELCOMEMAY"
            description="신규 가입 보상"
            reward="다이아 500"
            status="unknown"
          />
          <CouponCode
            code="EXPIRED2025"
            description="만료된 쿠폰"
            reward="(만료)"
            status="expired"
          />
        </div>
      </section>

      <section id="alert" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.8 Alert (4 variant)</h2>
        <div className="space-y-3">
          <DomainAlert variant="info" title="정보">
            본 페이지는 비공식 팬 가이드입니다.
          </DomainAlert>
          <DomainAlert variant="warning" title="주의">
            쿠폰 코드는 운영사 공식 발표만 사용하세요.
          </DomainAlert>
          <DomainAlert variant="success" title="검증 완료">
            본 쿠폰은 2026-05-15 운영자가 직접 사용해 정상 작동 확인했습니다.
          </DomainAlert>
          <DomainAlert variant="danger" title="만료">
            이 정보는 더 이상 유효하지 않을 수 있습니다.
          </DomainAlert>
        </div>
      </section>

      <section id="priority-flow" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.9 PriorityFlow</h2>
        <PriorityFlow title="검객 자원 투자 우선순위" steps={PRIORITY_STEPS} />
      </section>

      <section id="pay-tier" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.10 PayTier (3 variant)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <PayTier
            tier="free"
            label="무과금"
            recommendedFor="일일 30분 이내 캐주얼"
            strategy={['일일 자동사냥 풀가동', '쿠폰 100% 수령', '진령 1티어 우선']}
          />
          <PayTier
            tier="light"
            label="소과금 (월 ₩20K-50K)"
            recommendedFor="주 5-10시간 코어"
            strategy={['월간 다이아 패키지', '검객 1차 각성', '0티어 진령 1개 확보']}
          />
          <PayTier
            tier="medium"
            label="중과금 (월 ₩50K-200K)"
            recommendedFor="결투장 TOP100 목표"
            strategy={['시즌 패스 전체', '제련 +12 라인', '0티어 진령 2-3개']}
          />
        </div>
      </section>

      <section id="event-card" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.11 EventCard</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <EventCard
            type="limited"
            title="2026 5월 한정 이벤트"
            period={{ start: new Date('2026-05-01'), end: new Date('2026-05-31') }}
            rewards={['다이아 5000', '진령 소환권 30', '한정 칭호']}
          />
          <EventCard
            type="permanent"
            title="일일 출석"
            period={{ start: new Date('2025-04-18') }}
            rewards={['7일 누적 시 SSR 진령 1개']}
          />
          <EventCard
            type="collab"
            title="카카오프렌즈 콜라보"
            period={{ start: new Date('2026-06-01'), end: new Date('2026-07-15') }}
            rewards={['콜라보 스킨 4종', '한정 진령 1개']}
            notes="공식 발표 후 갱신"
          />
        </div>
      </section>

      <section id="tip-card" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.12 TipCard (4 variant)</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TipCard
            category="general"
            title="자동사냥 1.5배속 권장"
            content="배터리/발열 vs 시간 효율 균형. 2배속은 30% 더 빠르지만 발열 50% 증가."
          />
          <TipCard
            category="beginner"
            title="1주차 다이아 누적 보상"
            content="첫 7일간 다이아 1500 누적 보상 + 진령 소환권 5장. 일일 출석 + 자동사냥만으로 달성 가능."
          />
          <TipCard
            category="advanced"
            title="결투장 시즌 막바지 점수 푸시"
            content="시즌 종료 D-7부터 14시간대 매칭 풀 약화. 점수 푸시 최적 시간대."
          />
          <TipCard
            category="pvp"
            title="음영귀 + 강림도 콤보"
            content="치명타 발동 시 강림도 즉시 사용. 검객 단일 폭딜 라인 25% 상승."
          />
        </div>
      </section>

      <section id="screenshot-strip" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.13 ScreenshotStrip</h2>
        <ScreenshotStrip images={SCREENSHOTS} />
      </section>

      <section id="build-tag-badge" className="mb-12 scroll-mt-8">
        <h2 className="mb-3 text-2xl font-bold text-accent-gold">3.15 BuildTagBadge (11종 enum)</h2>
        <div className="flex flex-wrap gap-2">
          {BUILD_TAGS.map((tag) => (
            <BuildTagBadge key={tag} tag={tag} />
          ))}
        </div>
        <p className="mt-3 text-xs text-text-muted">크기 sm (V1+ 빌드 필터 UI에서 onClick 변형 시연):</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {BUILD_TAGS.slice(0, 5).map((tag) => (
            <BuildTagBadge key={`sm-${tag}`} tag={tag} size="sm" />
          ))}
        </div>
      </section>

      <Footer lastUpdated="2026-05-15" />
    </main>
  );
}
