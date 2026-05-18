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
import { cn } from '@/lib/utils';
import type { WikiClassId } from '@/types/wiki';

export const metadata: Metadata = {
  title: '스킬 가이드 — 코어 · 액티브 · 패시브',
  description:
    '갓깨비 키우기 직업별 스킬 31종. 전사 8 / 검객 14 / 영매 9. 코어 1 + 액티브 3~4 + 패시브 4~5 운영 원리.',
  // Sprint 12 / F12-D-2 — robots 는 app/layout.tsx 에서 robotsConfig 로 cascade.
};

const CLASS_LABEL: Record<WikiClassId, string> = {
  warrior: '전사',
  swordsman: '검객',
  medium: '영매',
};

// V7 P5: 탭 트리거는 작은 inline 영역 → emoji 제거, 텍스트만.
// (필요 시 향후 CLASS_ICON_URL을 16×16 inline Image로 추가 가능)

export default async function SkillPage(): Promise<React.JSX.Element> {
  const allSkills = await listWikiSkills();
  const byClass = {
    warrior: allSkills.filter((s) => s.classId === 'warrior'),
    swordsman: allSkills.filter((s) => s.classId === 'swordsman'),
    medium: allSkills.filter((s) => s.classId === 'medium'),
  };

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
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

      <Note variant="tip" title="스킬 운영 원리 (버전 무관)" className="mb-4">
        <ul className="ml-4 list-disc space-y-1">
          <li>별레벨이 높은 스킬을 우선 장착 — 효과 증폭이 큼</li>
          <li>코어 스킬은 직업 메인 화력에 매칭 (전사 창, 검객 검, 영매 뢰)</li>
          <li>액티브는 쿨타임이 겹치지 않게 분산 배치 — 화력 사이클 유지</li>
          <li>패시브는 스탯 비례 효과 우선 (예: 치명타·공격력 % 상승)</li>
        </ul>
      </Note>

      {/* source line 1779-1798: 스킬 티어 상승 — 스킬 교환(계승) 시스템 */}
      <Note variant="info" title="스킬 티어 상승 — 스킬 교환(계승) 시스템" className="mb-8">
        <p className="mb-2">
          스킬 카드는{' '}
          <strong className="text-indigo">보라색</strong> →{' '}
          <strong className="text-bronze-soft">금색</strong> →{' '}
          <strong className="text-vermilion-soft">빨강</strong>{' '}
          순으로 티어가 올라가며 효과가 강해집니다 (빨강이 최상위 등급). 최상위 티어 스킬을 얻는 정석 루트:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong className="text-text">① 스킬 메뉴 → 스킬 교환</strong> 진입
          </li>
          <li>
            <strong className="text-text">② 잔본 → 스킬 영옥 전환</strong> — 같은 티어에서 별 Lv 최고치까지 키운 스킬의 잔본을{' '}
            <strong className="text-text">스킬 영옥</strong>으로 환전
          </li>
          <li>
            <strong className="text-text">③ 매일 자정 갱신 확인</strong> — 스킬 교환 매장은 매일 새 라인업으로 갱신되므로, 원하는 상위 티어 스킬이 등장하는지 매일 점검
          </li>
          <li>
            <strong className="text-text">④ 계승 교환</strong> — 영옥으로 상위 티어 스킬과 교환(계승) → 티어 상승 완료
          </li>
          <li>
            <strong className="text-text">⑤ 영옥 비축 원칙</strong> — 매물이 마음에 들지 않으면 매일 갱신만 확인하고 영옥은 비축. 만족할 스킬이 등장한 날에만 사용
          </li>
        </ul>
      </Note>

      <Tabs defaultValue="warrior" className="space-y-6">
        {/* V7 P5 fix v2: 컨테이너 외곽선과 박스 외곽선이 같은 layer에서 충돌하던 문제를
            컨테이너 외곽선 자체를 없애 해결 (button toggle group 패턴).
            - TabsList: 단순 grid wrapper (border/bg/padding 모두 제거)
            - 박스 3개: 각각 독립 button 외형 (base border + active bronze)
            shadcn 기본 className 충돌점 모두 명시적 무력화:
              · TabsList: inline-flex/w-fit/h-9/p-[3px]/bg-muted/rounded-lg → grid/!h-auto/w-full/p-0/bg-transparent/rounded-none
              · TabsTrigger: h-[calc(100%-1px)]/inline-flex/shadow-sm/dark:border-input/dark:bg-input/30/dark:text-foreground 모두 override */}
        <TabsList
          className={cn(
            'grid !h-auto w-full grid-cols-3 gap-2',
            'rounded-none border-none bg-transparent p-0',
          )}
        >
          {(['warrior', 'swordsman', 'medium'] as const).map((classId) => (
            <TabsTrigger
              key={classId}
              value={classId}
              className={cn(
                // shadcn h-[calc(100%-1px)] 강제 무력화
                '!h-auto min-h-[56px]',
                // inline-flex → flex column (라벨 + 카운트 stack)
                'flex flex-col items-center justify-center gap-1',
                // 패딩 + 라디우스
                'rounded-[var(--radius-card)] px-3 py-3',
                // base button (모든 박스에 적용 — toggle 그룹 느낌)
                'border border-ink-line-strong bg-ink-elev/50',
                'text-sm font-semibold text-text-soft transition-colors',
                // hover (light + dark)
                'hover:border-bronze/35 hover:bg-ink-card-strong/60 hover:text-text',
                'dark:text-text-soft dark:hover:text-text',
                // active light
                'data-[state=active]:border-bronze/55 data-[state=active]:bg-bronze/15 data-[state=active]:text-bronze-soft',
                // active dark override (shadcn dark:border-input/bg-input/30/text-foreground 모두 무력화)
                'dark:data-[state=active]:border-bronze/55 dark:data-[state=active]:bg-bronze/15 dark:data-[state=active]:text-bronze-soft',
                // shadow + after underline 모두 무력화
                'data-[state=active]:shadow-none',
                'group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none',
                'after:hidden',
              )}
            >
              <span className="leading-tight">{CLASS_LABEL[classId]}</span>
              <span className="font-mono text-[0.7rem] tracking-wider opacity-70">
                {byClass[classId].length}종
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
      {/* V7 P5: 모바일/태블릿(<md)은 1열 stack — 코어/액티브/패시브 카드 가독성 보강. md+ 2열, lg+ 3열. */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((s) => (
          <WikiCardTracker key={s.id} category="skill" targetId={s.id}>
            <SkillCard data={s} />
          </WikiCardTracker>
        ))}
      </div>
    </section>
  );
}
