/**
 * /skill — 직업별 스킬 31종 (탭으로 직업 전환).
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §위키/스킬 + source line 1727-2229
 */
import type { Metadata } from 'next';

import { listWikiSkills } from '@/lib/wiki/skill-adapter';
import {
  SkillCard,
  Note,
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { WikiCardTracker } from '@/components/feature/wiki-card-tracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WikiClassId } from '@/types/wiki';

export const metadata: Metadata = {
  title: '스킬 가이드 — 코어 · 액티브 · 패시브',
  description:
    '갓깨비 키우기 직업별 스킬 31종. 전사 8 / 검객 14 / 영매 9. 코어 1 + 액티브 3~4 + 패시브 4~5 운영 원리.',
  robots: { index: false, follow: false },
};

const CLASS_LABEL: Record<WikiClassId, string> = {
  warrior: '전사',
  swordsman: '검객',
  medium: '영매',
};

const CLASS_EMOJI: Record<WikiClassId, string> = {
  warrior: '⚔️',
  swordsman: '🗡️',
  medium: '🔮',
};

export default async function SkillPage(): Promise<React.JSX.Element> {
  const allSkills = await listWikiSkills();
  const byClass = {
    warrior: allSkills.filter((s) => s.classId === 'warrior'),
    swordsman: allSkills.filter((s) => s.classId === 'swordsman'),
    medium: allSkills.filter((s) => s.classId === 'medium'),
  };

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>위키 / 스킬</HeroMetaBadge>
          <span className="font-mono">{allSkills.length}종 · 2026.05</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow num="04a" label="Skills" />
          <SectionTitle as="h1">스킬 가이드</SectionTitle>
          <SectionLead>
            코어 1 + 액티브 3~4 + 패시브 4~5 운영 원리. 스킬명은 업데이트로 변경될 수 있으나
            구성 원리는 동일하게 통용됩니다.
          </SectionLead>
        </SectionHead>
      </header>

      <Note variant="tip" title="스킬 운영 원리 (버전 무관)" className="mb-8">
        <ul className="ml-4 list-disc space-y-1">
          <li>별레벨이 높은 스킬을 우선 장착 — 효과 증폭이 큼</li>
          <li>코어 스킬은 직업 메인 화력에 매칭 (전사 창, 검객 검, 영매 뢰)</li>
          <li>액티브는 쿨타임이 겹치지 않게 분산 배치 — 화력 사이클 유지</li>
          <li>패시브는 스탯 비례 효과 우선 (예: 치명타·공격력 % 상승)</li>
        </ul>
      </Note>

      <Tabs defaultValue="warrior" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {(['warrior', 'swordsman', 'medium'] as const).map((classId) => (
            <TabsTrigger key={classId} value={classId} className="gap-2">
              <span aria-hidden>{CLASS_EMOJI[classId]}</span>
              {CLASS_LABEL[classId]}
              <span className="font-mono text-[0.7rem] text-text-mute">
                {byClass[classId].length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(['warrior', 'swordsman', 'medium'] as const).map((classId) => (
          <TabsContent key={classId} value={classId} className="space-y-6">
            <SkillGroupSection
              title="코어 스킬"
              skills={byClass[classId].filter((s) => s.kind === 'core')}
              description="캐릭터의 메인 화력. 보스전에서 결정타 역할."
            />
            <SkillGroupSection
              title="액티브 스킬"
              skills={byClass[classId].filter((s) => s.kind === 'active')}
              description="능동 발동형. 쿨타임 분산 배치가 핵심."
            />
            <SkillGroupSection
              title="패시브 스킬"
              skills={byClass[classId].filter((s) => s.kind === 'passive')}
              description="상시 효과. 별레벨/품급 강화로 스탯 비례 증폭."
            />
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}

function SkillGroupSection({
  title,
  description,
  skills,
}: {
  title: string;
  description: string;
  skills: ReadonlyArray<Parameters<typeof SkillCard>[0]['data']>;
}): React.JSX.Element {
  return (
    <section aria-label={title} className="space-y-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-text">{title}</h2>
        <p className="text-sm text-text-soft">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((s) => (
          <WikiCardTracker key={s.id} category="skill" targetId={s.id}>
            <SkillCard data={s} />
          </WikiCardTracker>
        ))}
      </div>
    </section>
  );
}
