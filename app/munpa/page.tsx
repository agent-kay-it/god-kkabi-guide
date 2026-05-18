/**
 * /munpa — 문파 가이드 (가입 이점 / 선택 기준 / 매너).
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §위키/문파 + source ADVANCED 문파 섹션
 *
 * V1+ 단계에서 서버별 실시간 문파 랭킹 + 가입 신청 추가 예정.
 */
import type { Metadata } from 'next';

import { WIKI_MUNPA_GUIDE_SEED } from '@/data/wiki/munpa-guide';
import {
  MunpaCard,
  Note,
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { WikiCardTracker } from '@/components/feature/wiki-card-tracker';

export const metadata: Metadata = {
  title: '문파 가이드 — 가입 이점 + 선택 기준',
  description:
    '갓깨비 키우기 문파 가이드. 문파 미션·상점·던전·출석 보너스. 활성 문파 선택 기준과 매너.',
  // Sprint 12 / F12-D-2 — robots 는 app/layout.tsx 에서 robotsConfig 로 cascade.
};

export default function MunpaPage(): React.JSX.Element {
  const byCategory = {
    benefit: WIKI_MUNPA_GUIDE_SEED.filter((m) => m.category === 'benefit'),
    criteria: WIKI_MUNPA_GUIDE_SEED.filter((m) => m.category === 'criteria'),
    etiquette: WIKI_MUNPA_GUIDE_SEED.filter((m) => m.category === 'etiquette'),
  };

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>위키 / 문파</HeroMetaBadge>
          <span className="font-mono">{WIKI_MUNPA_GUIDE_SEED.length} 항목</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow num="10" label="Munpa" />
          <SectionTitle as="h1">문파 가이드</SectionTitle>
          <SectionLead>
            무료 자원 최대 수익원. 개방 즉시 가입하고, 활성도 높은 문파를 고르세요.
          </SectionLead>
        </SectionHead>
      </header>

      <Note variant="success" title="개방 즉시 가입 권장" className="mb-8">
        문파는 시스템 개방 즉시 가입하는 것이 정답. 단순 가입만으로도 일일 출석·기부 보너스가
        누적됩니다. 솔로로는 접근 불가능한 비경/보스 레이드 콘텐츠도 함께 열립니다.
      </Note>

      <section className="mb-10 space-y-8">
        <MunpaSection
          title="가입 이점 — 무료 자원 4종"
          description="문파 가입만으로 얻을 수 있는 일일 무료 보상."
          guides={byCategory.benefit}
        />
        <MunpaSection
          title="활성 문파 선택 기준"
          description="가입할 문파를 고를 때 확인할 4가지."
          guides={byCategory.criteria}
        />
        <MunpaSection
          title="문파 매너"
          description="운영자가 권장하는 협동 매너."
          guides={byCategory.etiquette}
        />
      </section>

      <Note variant="info" title="V1+ — 서버별 실시간 랭킹 예정">
        등록 시 입력한 본인 서버 ID 기준 문파 랭킹과 가입 신청 기능이 V1+ 단계에서 추가됩니다.
      </Note>
    </main>
  );
}

function MunpaSection({
  title,
  description,
  guides,
}: {
  title: string;
  description: string;
  guides: ReadonlyArray<Parameters<typeof MunpaCard>[0]['data']>;
}): React.JSX.Element {
  return (
    <section aria-label={title} className="space-y-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-text">{title}</h2>
        <p className="text-sm text-text-soft">{description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {guides.map((g) => (
          <WikiCardTracker key={g.id} category="munpa" targetId={g.id}>
            <MunpaCard data={g} />
          </WikiCardTracker>
        ))}
      </div>
    </section>
  );
}
