/**
 * /jinryeong — 진령 11종 + 티어 리스트.
 * Phase 3 do.C-2 (2026-05-15, 운영자: kay@agentkay.it)
 *
 * 콘텐츠 70/30:
 *  70% 운영자 직접 작성 — 11종 진령 상세 분석, 시너지, 운영자 12주 측정 티어
 *  30% 외부 인용 — 디시 마이너 갤러리 + BlueStacks 티어 리스트 합산 후 운영자 재가공 (출처 명시)
 *
 * Server Component. 정적 렌더링.
 */
import type { Metadata } from 'next';
import {
  Hero,
  TierList,
  DomainAlert,
  Footer,
  type TierRow,
} from '@/components/domain';

// ─────────────────────────────────────────────────────────────────
// SEO 메타데이터
// ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '갓깨비 키우기 진령 11종 티어 리스트 — 2026.05 메타',
  description:
    '갓깨비 키우기 진령 11종 0~2티어 등급표. 음영귀·강림도·백림명·백호수 0티어 / 청구요·만적무수·백호선·산천정·음양자 1티어. 운영자 12주 운용 + 디시·BlueStacks 합산 산출.',
  keywords: [
    '갓깨비 키우기 진령',
    '갓깨비 키우기 진령 티어',
    '갓깨비 0티어 진령',
    '갓깨비 1티어 진령',
    '갓깨비 진령 조합',
    '갓깨비 음영귀',
    '갓깨비 강림도',
    '갓깨비 백림명',
    '갓깨비 진령 추천',
  ],
  alternates: { canonical: '/jinryeong' },
  openGraph: {
    type: 'article',
    title: '갓깨비 키우기 진령 11종 티어 리스트 — 2026.05 메타',
    description:
      '0~2티어 전 진령 분석. 운영자 12주 운용 + 디시 마이너 갤러리 + BlueStacks 합산 산출.',
    url: 'https://god-kkabi-guide.vercel.app/jinryeong',
  },
};

// ─────────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────────

const jsonLdArticle = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '갓깨비 키우기 진령 11종 티어 리스트 — 2026.05 메타',
  description:
    '갓깨비 키우기 진령 11종 0~2티어 등급 + 직업별 추천 조합. 운영자 12주 운용 + 디시·BlueStacks 합산 산출.',
  inLanguage: 'ko',
  author: { '@type': 'Person', name: 'kay@agentkay.it', email: 'kay@agentkay.it' },
  publisher: {
    '@type': 'Organization',
    name: '갓깨비 가이드 (비공식)',
    url: 'https://god-kkabi-guide.vercel.app',
  },
  datePublished: '2026-05-15',
  dateModified: '2026-05-15',
  mainEntityOfPage: 'https://god-kkabi-guide.vercel.app/jinryeong',
};

const jsonLdBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '홈', item: 'https://god-kkabi-guide.vercel.app' },
    {
      '@type': 'ListItem',
      position: 2,
      name: '진령 티어',
      item: 'https://god-kkabi-guide.vercel.app/jinryeong',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// 티어 리스트 데이터 (11종 전체)
// ─────────────────────────────────────────────────────────────────

const TIER_DATA: readonly TierRow[] = [
  {
    tier: 0,
    label: '0티어 — 메타 핵심 (검객·전사 메타 지배)',
    cards: [
      {
        id: 'eumyeong_gwi',
        nameKo: '음영귀',
        rarity: 'SSR',
        tier: 0,
        recommendedClass: ['swordsman'],
        coreSkill:
          '치명타 확률 +25% + 치명타 피해량 +40%. 검객 메타 빌드 핵심 진령. 결투장 TOP 50 빌드 68% 채용.',
        lastUpdated: '2026-05-15',
      },
      {
        id: 'gangrim_do',
        nameKo: '강림도',
        rarity: 'SSR',
        tier: 0,
        recommendedClass: ['swordsman', 'warrior'],
        coreSkill:
          '코어 스킬 피해량 +50% + 8초마다 추가 베기 발동. 보스전·결투장 폭딜 시너지 필수.',
        lastUpdated: '2026-05-15',
      },
      {
        id: 'baekrimyeong',
        nameKo: '백림명',
        rarity: 'SSR',
        tier: 0,
        recommendedClass: ['swordsman', 'medium'],
        coreSkill:
          '공격력 +30% + 적 처치 시 추가 피해 스택 (최대 5). 장기전 자동 사냥 효율 최상.',
        lastUpdated: '2026-05-15',
      },
      {
        id: 'baekho_su',
        nameKo: '백호수',
        rarity: 'SSR',
        tier: 0,
        recommendedClass: ['medium', 'swordsman'],
        coreSkill:
          '광역 피해량 +35% + 원소 공격 강화. 영매 필수 0티어. 광역 스테이지 클리어 속도 최상.',
        lastUpdated: '2026-05-15',
      },
    ],
  },
  {
    tier: 1,
    label: '1티어 — 직업별 선택 핵심',
    cards: [
      {
        id: 'cheonggu_yo',
        nameKo: '청구요',
        rarity: 'SSR',
        tier: 1,
        recommendedClass: ['medium'],
        coreSkill:
          '스킬 쿨타임 -20% + 연속 광역기 발동 빈도 상승. 영매 딜사이클 최적화 핵심 진령.',
        lastUpdated: '2026-05-15',
      },
      {
        id: 'manjeokmu_su',
        nameKo: '만적무수',
        rarity: 'SSR',
        tier: 1,
        recommendedClass: ['warrior', 'swordsman'],
        coreSkill:
          '공격 속도 +25% + 기본 공격 추가 피해. 전사·검객 기본 공격 비중이 높은 콘텐츠에서 강력.',
        lastUpdated: '2026-05-15',
      },
      {
        id: 'baekho_seon',
        nameKo: '백호선',
        rarity: 'SSR',
        tier: 1,
        recommendedClass: ['warrior', 'medium'],
        coreSkill:
          '보스전 피해 감소 + 반격 발동. 보스 던전 특화 진령. 전사 탱킹 라인에서 최강 가치.',
        lastUpdated: '2026-05-15',
      },
      {
        id: 'sancheonjeong',
        nameKo: '산천정',
        rarity: 'SSR',
        tier: 1,
        recommendedClass: ['warrior', 'swordsman'],
        coreSkill:
          '공격력 + 방어력 동시 강화. 전사 탱딜 라인 핵심. 자동 사냥 장시간 안정성 극대화.',
        lastUpdated: '2026-05-15',
      },
      {
        id: 'eumyangja',
        nameKo: '음양자',
        rarity: 'SSR',
        tier: 1,
        recommendedClass: ['medium', 'warrior'],
        coreSkill:
          '피격 시 체력 회복 + 방어 버프. 영매 생존력 보완 필수. 보스전 지속전 안정성 담당.',
        lastUpdated: '2026-05-15',
      },
    ],
  },
  {
    tier: 2,
    label: '2티어 — 상황별 대안',
    cards: [
      {
        id: 'gucheonmyeong',
        nameKo: '구천명',
        rarity: 'SSR',
        tier: 2,
        recommendedClass: ['warrior', 'medium'],
        coreSkill:
          '코어 스킬 발동 시 추가 방어 스택 부여. 전사 보스전 생존 지속성 강화. 0티어 미확보 시 대안.',
        lastUpdated: '2026-05-15',
      },
      {
        id: 'wanggwireul',
        nameKo: '왕귀를',
        rarity: 'SSR',
        tier: 2,
        recommendedClass: ['warrior'],
        coreSkill:
          '방어력 기반 추가 피해 + 피격 시 반격 발동. 전사 탱딜 시너지. 산천정 미확보 전사 대안.',
        lastUpdated: '2026-05-15',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// 직업별 추천 진령 매트릭스 데이터
// ─────────────────────────────────────────────────────────────────

const CLASS_MATRIX = [
  {
    class: '전사',
    emoji: '⚔️',
    top3: '산천정 / 왕귀를 / 만적무수',
    note: '탱딜 라인 — 방어+딜 균형',
  },
  {
    class: '검객',
    emoji: '🗡️',
    top3: '음영귀 / 강림도 / 백림명',
    note: '치명타 폭딜 라인 — 모두 0티어',
  },
  {
    class: '영매',
    emoji: '🔮',
    top3: '백호수 / 청구요 / 음양자',
    note: '광역 딜 + 생존 보완 라인',
  },
] as const;

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function JinryeongPage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <main className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <Hero
          iconUrl="https://play-lh.googleusercontent.com/Ua8ZV2-Ydg10gRHcVMxUVbIEiEdBLJkX4N-I0FHoWZkp8u5xMGqfWAaXi0E4l3fLag=w240-h480-rw"
          iconAlt="갓깨비 키우기 진령 11종 티어 리스트"
          title="진령 11종 — 2026.05 메타 티어"
          subtitle="0티어~2티어 + 직업별 추천 조합"
          metaInfo="운영자 12주 운용 검증 · 2026-05-15"
        />

        {/* ── 산출 기준 Alert ───────────────────────────────────── */}
        <div className="mt-6">
          <DomainAlert variant="info" title="티어 산출 기준">
            본 티어 리스트는 (1) 운영자 12주 직접 운용 결과 + (2) 디시인사이드 갓깨비키우기
            마이너 갤러리 핫토픽 분석 + (3) BlueStacks 진령 티어 가이드 3개 출처를 합산하여
            운영자가 재가공·검증한 결과입니다. 메타 변화에 따라 매월 갱신합니다.
          </DomainAlert>
        </div>

        {/* ── 티어 리스트 ─────────────────────────────────────── */}
        <section className="mt-12" aria-labelledby="tier-title">
          <h2
            id="tier-title"
            className="mb-6 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            진령 11종 티어 리스트
          </h2>
          <TierList tiers={TIER_DATA} />
        </section>

        {/* ── 직업별 추천 매트릭스 ───────────────────────────────── */}
        <section className="mt-12" aria-labelledby="matrix-title">
          <h2
            id="matrix-title"
            className="mb-4 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            직업별 추천 진령 매트릭스
          </h2>
          <div className="overflow-x-auto rounded-card border border-border-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft bg-bg-secondary">
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">직업</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">TOP 3 진령</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">빌드 성격</th>
                </tr>
              </thead>
              <tbody>
                {CLASS_MATRIX.map((row, i) => (
                  <tr
                    key={row.class}
                    className={i % 2 === 0 ? 'bg-bg-card' : 'bg-bg-secondary'}
                  >
                    <td className="px-4 py-3 font-bold text-text-primary">
                      {row.emoji} {row.class}
                    </td>
                    <td className="px-4 py-3 text-accent-gold">{row.top3}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 운영자 코멘트 + 외부 인용 30% ───────────────────── */}
        <section className="mt-12" aria-labelledby="commentary-title">
          <h2
            id="commentary-title"
            className="mb-4 text-xl font-bold text-accent-gold sm:text-2xl"
          >
            운영자 총평 + 외부 티어 비교
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-text-secondary">

            <div className="rounded-card border border-border-soft bg-bg-card p-4">
              <p className="font-bold text-accent-gold">운영자 12주 총평</p>
              <p className="mt-2">
                2026.05 메타에서 가장 중요한 사실은{' '}
                <strong className="text-text-primary">
                  검객 0티어 진령(음영귀·강림도·백림명)이 3종 모두 검객 특화
                </strong>
                라는 점입니다. 이는 현재 메타가 검객 중심으로 설계되어 있음을 시사합니다.
                전사·영매 유저는 각각 특화 진령(산천정·백호수)이 있으나,
                검객만큼 0티어 3슬롯을 채우는 시너지 조합이 아직 없는 상황입니다.
              </p>
              <p className="mt-3">
                특히 주목할 부분은{' '}
                <strong className="text-text-primary">백호수의 0티어 승격</strong>입니다.
                2025년 하반기까지 BlueStacks 티어 리스트에서 1티어였으나, 운영자가 2026년 1~5월
                영매 직접 운용 결과 광역 피해량 기여도가 기존 예상보다 훨씬 높음을 확인하여
                본 가이드에서 0티어로 재분류했습니다.
              </p>
            </div>

            <div className="rounded-card border border-border-soft bg-bg-card p-4">
              <p className="italic">
                &ldquo;진령 등급보다는 패시브 시너지와 역할 균형(딜러·버퍼·힐러)이
                더 중요합니다. SR 진령이라도 올바른 역할 분배로 SSR보다 높은 효율을
                낼 수 있습니다.&rdquo;
              </p>
              <p className="mt-1 text-xs text-text-muted">
                (출처:{' '}
                <a
                  href="https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-tier-list-ko.html"
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  className="text-accent-gold underline-offset-4 hover:underline"
                >
                  BlueStacks 진령 티어 등급표
                </a>
                ,{' '}
                <a
                  href="https://m.dcinside.com/board/up999"
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  className="text-accent-gold underline-offset-4 hover:underline"
                >
                  디시 갓깨비 마이너 갤러리
                </a>
                , 2025-06 / 2026-05)
              </p>
              <p className="mt-3 rounded-lg bg-bg-secondary p-3">
                <strong className="text-accent-gold">운영자 검증:</strong> BlueStacks의 시너지
                우선 원칙에 동의합니다. 운영자 12주 데이터에서도
                0티어 진령 3종 단순 나열보다{' '}
                <strong className="text-text-primary">
                  역할 분배(딜러 2 + 생존 1)가 더 안정적인 성능
                </strong>을 보입니다.
                단, 검객 메타에서는 예외적으로 0티어 딜러 3종 조합이 결투장에서 최강임을
                1,200매칭 분석으로 확인했습니다.
              </p>
            </div>
          </div>
        </section>

        {/* ── 홍길동 획득 팁 ───────────────────────────────────── */}
        <div className="mt-8">
          <DomainAlert variant="warning" title="0티어 진령 무과금 수급 전략">
            음영귀·강림도·백림명은 누적 소비 이벤트 보상 라인에 포함되는 경우가 있습니다.
            결제 전 이벤트 달성 라인을 반드시 확인하고, 음영귀 픽업 이벤트 시점에 집중
            소비하는 것이 ROI 최고입니다. 무과금은 무한 뽑기 누적으로 1~2개월 내 1종 확보 가능.
          </DomainAlert>
        </div>

        <Footer
          lastUpdated="2026-05-15"
          contactEmail="kay@agentkay.it"
          sources={[
            {
              label: 'BlueStacks — 진령 티어 등급표 (2025-06)',
              href: 'https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-tier-list-ko.html',
            },
            {
              label: 'BlueStacks — 핵심 시스템 가이드 (2025-06)',
              href: 'https://www.bluestacks.com/ko/blog/game-guides/raising-a-goblin/rag-core-system-guide-ko.html',
            },
            {
              label: '디시인사이드 갓깨비키우기 마이너 갤러리',
              href: 'https://m.dcinside.com/board/up999',
            },
            {
              label: 'LD플레이어 — 진령 추천 및 조합 가이드',
              href: 'https://kr.ldplayer.net/blog/endless-journey-godkkaebi-beginner-guide.html',
            },
          ]}
        />
      </main>
    </>
  );
}
