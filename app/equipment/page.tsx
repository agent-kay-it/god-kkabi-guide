/**
 * /equipment — 제련 시스템 + 강화 + 우선순위 12 카드.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §위키/장비 + source line 1800-1834
 */
import type { Metadata } from 'next';

import { listWikiEquipment } from '@/lib/wiki/equipment-adapter';
import { auth } from '@/lib/auth/auth';
import {
  EquipmentCard,
  PriorityFlow,
  Note,
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { BookmarkButton } from '@/components/feature/bookmark-button';
import { WikiCardTracker } from '@/components/feature/wiki-card-tracker';

export const metadata: Metadata = {
  title: '장비 가이드 — 제련 시스템 + 강화 + 우선순위',
  description:
    '갓깨비 키우기 제련 시스템과 자원 우선순위. 무기 → 스킬 → 진령 → 장비 → 코스튬 순. 강화 수치 자동 이전 룰.',
  robots: { index: false, follow: false },
};

export default async function EquipmentPage(): Promise<React.JSX.Element> {
  const allEquipment = await listWikiEquipment();
  const session = await auth();
  const canBookmark = Boolean(session?.user?.registered);

  const byTopic = {
    system: allEquipment.filter((e) => e.topic === 'system'),
    priority: allEquipment.filter((e) => e.topic === 'priority'),
    enchant: allEquipment.filter((e) => e.topic === 'enchant'),
    gacha: allEquipment.filter((e) => e.topic === 'gacha'),
    decompose: allEquipment.filter((e) => e.topic === 'decompose'),
  };

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>위키 / 장비</HeroMetaBadge>
          <span className="font-mono">{allEquipment.length} 카드</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow num="04b" label="Forging" />
          <SectionTitle as="h1">장비 가이드</SectionTitle>
          <SectionLead>
            제련 시스템 메커니즘 + 자원 우선순위 + 강화 룰. 개별 장비 데이터는 admin 콘솔에서
            큐레이션됩니다.
          </SectionLead>
        </SectionHead>
      </header>

      <section className="mb-10" aria-labelledby="resource-priority">
        <h2 id="resource-priority" className="mb-4 text-xl font-bold tracking-tight text-text">
          자원 투자 우선순위
        </h2>
        <PriorityFlow
          steps={[
            { rank: 1, label: '무기 강화', reason: '전투력 영향력 최상' },
            { rank: 2, label: '스킬 레벨업', reason: '직업 메인 화력' },
            { rank: 3, label: '진령 강화', reason: '서해용왕부터' },
            { rank: 4, label: '장비 제련', reason: '제련석 일괄 사용' },
            { rank: 5, label: '코스튬·탈것·펫', reason: '후순위 — 비용 큼' },
          ]}
        />
        <p className="mt-3 text-xs text-text-mute">
          ※ 코스튬·탈것·펫은 수치 증가 대비 비용이 매우 크므로 후순위. 무기·스킬에 먼저 투자.
        </p>
      </section>

      <section className="mb-10 space-y-8">
        <EquipmentSection
          title="시스템 기본"
          description="제련 메커니즘과 세트 효과 개요."
          equipment={byTopic.system}
          canBookmark={canBookmark}
        />
        <EquipmentSection
          title="우선순위"
          description="자원 5단계 투자 순서 — 위 차트 참고."
          equipment={byTopic.priority}
          canBookmark={canBookmark}
        />
        <EquipmentSection
          title="강화 룰"
          description="강화 수치 자동 이전 + 제련 레벨 점프 확률."
          equipment={byTopic.enchant}
          canBookmark={canBookmark}
        />
        <EquipmentSection
          title="뽑기 + 분해"
          description="999회 무료 뽑기 활용 + 분해 우선순위."
          equipment={[...byTopic.gacha, ...byTopic.decompose]}
          canBookmark={canBookmark}
        />
      </section>

      <Note variant="warn" title="개별 장비 데이터는 추후 추가">
        본 페이지는 제련 시스템 메커니즘 중심으로 구성됩니다. 개별 장비 (예: 진룡검 +10) 데이터는
        운영자 콘솔 (P3.D)에서 추가 시드 + 사용자 제보로 확장 예정입니다.
      </Note>
    </main>
  );
}

function EquipmentSection({
  title,
  description,
  equipment,
  canBookmark,
}: {
  title: string;
  description: string;
  equipment: ReadonlyArray<Parameters<typeof EquipmentCard>[0]['data']>;
  canBookmark: boolean;
}): React.JSX.Element {
  if (equipment.length === 0) return <></>;
  return (
    <section aria-label={title} className="space-y-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-text">{title}</h2>
        <p className="text-sm text-text-soft">{description}</p>
      </div>
      {/* V7 P5: 모바일/태블릿(<md)은 1열 stack — 시스템/우선순위/강화/뽑기 카드 가독성 보강. md+ 2열, lg+ 3열. */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {equipment.map((e) => (
          <WikiCardTracker key={e.id} category="equipment" targetId={e.id}>
            <EquipmentCard
              data={e}
              bookmarkSlot={
                <BookmarkButton
                  targetType="equipment"
                  targetId={e.id}
                  title={e.name}
                  href={`/equipment#${e.id}`}
                  canBookmark={canBookmark}
                />
              }
            />
          </WikiCardTracker>
        ))}
      </div>
    </section>
  );
}
