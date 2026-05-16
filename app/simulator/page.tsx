/**
 * /simulator — 빌드 시뮬레이터 (F3.1).
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §1.3
 *
 * Server Component:
 *  - 진령 11 시드 로드 (Firestore 또는 fallback)
 *  - SimulatorCanvas client component 호출
 */
import type { Metadata } from 'next';

import { listWikiJinryeong } from '@/lib/wiki/jinryeong-adapter';
import { SimulatorCanvas } from '@/components/feature/simulator-canvas';
import {
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '빌드 시뮬레이터 — 진령 3선 시너지',
  description:
    '진령 3개를 선택해 시너지 점수와 추천 직업을 확인하세요. 결과를 게시판에 공유할 수 있습니다.',
};

export default async function SimulatorPage(): Promise<React.JSX.Element> {
  const jinryeong = await listWikiJinryeong();

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>시뮬레이터</HeroMetaBadge>
          <span className="font-mono">진령 11종</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Tools" />
          <SectionTitle as="h1">빌드 시뮬레이터</SectionTitle>
          <SectionLead>
            진령 3개를 선택해 시너지 점수 · Tier · 추천 직업을 즉시 확인하세요. 마음에 드는
            조합은 커뮤니티에 빌드 게시물로 저장할 수 있습니다.
          </SectionLead>
        </SectionHead>
      </header>

      {jinryeong.length === 0 ? (
        <Note variant="warn" title="진령 데이터를 불러올 수 없습니다">
          시드 데이터가 비어 있습니다. 잠시 후 다시 시도해주세요.
        </Note>
      ) : (
        <SimulatorCanvas jinryeong={jinryeong} />
      )}
    </main>
  );
}
