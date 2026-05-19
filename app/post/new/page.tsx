/**
 * /post/new — 게시물 작성 페이지.
 * 출처: docs/sprint/04-sprint-v1/design.md §3.1
 *
 * Server Component → 권한 검증 후 PostForm (client) 마운트.
 *
 * Sprint 19 F19-G: 시뮬레이터 prefill 지원.
 *   /post/new?prefill=simulator&combo=A_B_C&class=warrior&score=95&tier=S
 *   → PostForm 의 initial 에 시뮬레이션 컨텍스트 자동 채움.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { PostForm } from '@/components/feature/post-form';
import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { parsePrefillUrl } from '@/lib/simulator/prefill-url';
import type { PostInput } from '@/types/post';

export const metadata: Metadata = {
  title: '새 게시물 — 빌드 · 공략 · 후기',
  robots: { index: false, follow: false },
};

interface NewPostPageProps {
  readonly searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildPrefillInitial(
  raw: Record<string, string | string[] | undefined>,
): PostInput | undefined {
  // URL search params 정규화 (string[] → first / undefined → skip)
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined) continue;
    search.set(k, Array.isArray(v) ? (v[0] ?? '') : v);
  }
  const prefill = parsePrefillUrl(search);
  if (!prefill) return undefined;

  // 시뮬레이션 컨텍스트 → 자동 title + tags + 카테고리
  const tierLabel = prefill.tier ?? '';
  const classLabel = prefill.classId ?? '';
  const title = `시뮬레이터 빌드 — ${prefill.combo}${tierLabel ? ` (${tierLabel} tier)` : ''}`;
  const tags = ['simulator', prefill.combo];
  if (classLabel) tags.push(classLabel);
  if (tierLabel) tags.push(`tier-${tierLabel}`);

  const scoreInfo = prefill.score !== undefined ? `시너지 점수: ${prefill.score}\n` : '';
  const tierInfo = tierLabel ? `시너지 등급: ${tierLabel}\n` : '';
  const classInfo = classLabel ? `추천 직업: ${classLabel}\n` : '';

  return {
    title,
    body: `> 시뮬레이터에서 생성된 빌드입니다.\n\n${scoreInfo}${tierInfo}${classInfo}진령 조합: ${prefill.combo}\n\n## 빌드 설명\n\n(여기에 빌드 운영 팁을 자유롭게 작성해주세요)\n`,
    category: 'build',
    tags,
    imageUrls: [],
  };
}

export default async function NewPostPage({
  searchParams,
}: NewPostPageProps): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/post/new');
  }
  if (!session.user.registered) {
    redirect('/register?callbackUrl=/post/new');
  }
  if (session.user.role === 'banned') {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-[5vw]">
        <Note variant="warn" title="정지된 사용자">
          정지된 사용자는 게시물을 작성할 수 없습니다. 운영자에게 문의해주세요.
        </Note>
      </main>
    );
  }
  const rawParams = (await searchParams) ?? {};
  const prefillInitial = buildPrefillInitial(rawParams);
  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8">
        <HeroMeta className="mb-4">
          <HeroMetaBadge>커뮤니티 / 작성</HeroMetaBadge>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
          새 게시물
        </h1>
        <p className="mt-3 text-text-soft">
          본인 빌드 / 공략 / 후기를 공유해주세요. 작성 24시간 이내 자유 수정 가능.
        </p>
        {prefillInitial ? (
          <p className="mt-2 text-xs text-bronze">
            시뮬레이터에서 가져온 컨텍스트가 자동 입력되었습니다. 자유 수정 가능.
          </p>
        ) : null}
      </header>
      <PostForm
        authorUid={session.user.id}
        mode="create"
        {...(prefillInitial ? { initial: prefillInitial } : {})}
      />
    </main>
  );
}
