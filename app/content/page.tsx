/**
 * /content — 던전 4 + PvP 1 + 이벤트 6 + 메커니즘 6 + 메타 운영 5.
 * 출처: docs/sprint/03-sprint-mvp-v2/MASTER-PLAN.md §위키/콘텐츠 + source SECTION DUNGEON/EVENT/ADVANCED
 */
import type { Metadata } from 'next';

import { listWikiContents } from '@/lib/wiki/content-adapter';
import { auth } from '@/lib/auth/auth';
import {
  ContentCard,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CONTENT_KIND_LABEL } from '@/types/wiki';
import type { WikiContentDoc } from '@/types/wiki';

function ContentBookmarkSlot({
  data,
  canBookmark,
}: {
  data: Omit<WikiContentDoc, 'updatedAt'>;
  canBookmark: boolean;
}): React.JSX.Element {
  return (
    <BookmarkButton
      targetType="content"
      targetId={data.id}
      title={data.name}
      href={`/content#${data.id}`}
      canBookmark={canBookmark}
    />
  );
}

export const metadata: Metadata = {
  title: '콘텐츠 가이드 — 던전 · PvP · 이벤트 · 메커니즘',
  description:
    '갓깨비 키우기 콘텐츠 22종. 진령/무한/보스/비경 던전, 결투장 PvP, 이벤트 6종, 진령 시스템 메커니즘 6, 자동사냥 메타 5.',
  robots: { index: false, follow: false },
};

export default async function ContentPage(): Promise<React.JSX.Element> {
  const all = await listWikiContents();
  const session = await auth();
  const canBookmark = Boolean(session?.user?.registered);

  const byKind = {
    dungeon: all.filter((c) => c.kind === 'dungeon'),
    pvp: all.filter((c) => c.kind === 'pvp'),
    event: all.filter((c) => c.kind === 'event'),
    mechanic: all.filter((c) => c.kind === 'mechanic'),
    meta: all.filter((c) => c.kind === 'meta'),
  };

  return (
    <main className="mx-auto max-w-screen-xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>위키 / 콘텐츠</HeroMetaBadge>
          <span className="font-mono">{all.length}종</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow num="05" label="Dungeon · PvP" />
          <SectionTitle as="h1">콘텐츠 가이드</SectionTitle>
          <SectionLead>
            던전 · PvP · 이벤트 + 진령 시스템 메커니즘과 자동사냥 메타 운영 룰. 오전 시간대
            일일 콘텐츠 클리어가 누적 효율의 핵심입니다.
          </SectionLead>
        </SectionHead>
      </header>

      <Tabs defaultValue="dungeon" className="space-y-6">
        <TabsList className="flex w-full flex-wrap gap-1">
          {(['dungeon', 'pvp', 'event', 'mechanic', 'meta'] as const).map((kind) => (
            <TabsTrigger key={kind} value={kind} className="gap-1.5">
              {CONTENT_KIND_LABEL[kind]}
              <span className="font-mono text-[0.65rem] text-text-mute">
                {byKind[kind].length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dungeon" className="space-y-4">
          <Note variant="info" title="던전 운영 원칙">
            일일 보스는 매일 필수. 진령 던전은 오전 우선. 비경은 문파 가입 후 협동.
          </Note>
          <div className="grid gap-4 md:grid-cols-2">
            {byKind.dungeon.map((c) => (
              <WikiCardTracker key={c.id} category="content" targetId={c.id}>
                <ContentCard data={c} bookmarkSlot={<ContentBookmarkSlot data={c} canBookmark={canBookmark} />} />
              </WikiCardTracker>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pvp" className="space-y-4">
          <Note variant="warn" title="결투장 핵심 원칙">
            "무조건 참여"가 아니라 "이길 수 있는 상대만 골라서"가 정답.
            자동 매칭 무시 → 수동 매칭으로 상대 직접 선택 → 전투 로그로 상성 분석.
          </Note>
          <div className="grid gap-4">
            {byKind.pvp.map((c) => (
              <WikiCardTracker key={c.id} category="content" targetId={c.id}>
                <ContentCard data={c} bookmarkSlot={<ContentBookmarkSlot data={c} canBookmark={canBookmark} />} />
              </WikiCardTracker>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="event" className="space-y-4">
          <Note variant="tip" title="이벤트 결제 타이밍">
            누적 소비 이벤트의 홍길동 확정 라인이 결제·다이아 사용의 기준점. 분산 결제는 비효율.
          </Note>
          <div className="grid gap-3 md:grid-cols-2">
            {byKind.event.map((c) => (
              <WikiCardTracker key={c.id} category="content" targetId={c.id}>
                <ContentCard data={c} bookmarkSlot={<ContentBookmarkSlot data={c} canBookmark={canBookmark} />} />
              </WikiCardTracker>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mechanic" className="space-y-4">
          <Note variant="info" title="진령 시스템 심층">
            소환풀 레벨업과 10회 천장, 원신 변환, 초기화 환급 등 진령 시스템의 핵심 메커니즘.
          </Note>
          <div className="grid gap-3 md:grid-cols-2">
            {byKind.mechanic.map((c) => (
              <WikiCardTracker key={c.id} category="content" targetId={c.id}>
                <ContentCard data={c} bookmarkSlot={<ContentBookmarkSlot data={c} canBookmark={canBookmark} />} />
              </WikiCardTracker>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          <Note variant="warn" title="자동사냥 함정 + 제련 룰">
            "강한 장비 = 빠른 클리어"는 오해. 한 번에 정확히 처치할 수 있는 최저 난이도가 최고 수익률.
          </Note>
          <div className="grid gap-3 md:grid-cols-2">
            {byKind.meta.map((c) => (
              <WikiCardTracker key={c.id} category="content" targetId={c.id}>
                <ContentCard data={c} bookmarkSlot={<ContentBookmarkSlot data={c} canBookmark={canBookmark} />} />
              </WikiCardTracker>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
