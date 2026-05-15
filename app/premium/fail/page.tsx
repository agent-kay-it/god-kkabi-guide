/**
 * /premium/fail — Toss 결제 실패 callback.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

import { HeroMeta, HeroMetaBadge, Note } from '@/components/domain';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '결제 실패',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ code?: string; message?: string }>;

export default async function PremiumFailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header className="mb-8 text-center">
        <HeroMeta className="mb-4 justify-center">
          <HeroMetaBadge>프리미엄 / 결제</HeroMetaBadge>
        </HeroMeta>
        <h1 className="title-gradient text-3xl font-extrabold tracking-tight">결제 실패</h1>
      </header>
      <Note variant="warn" title="결제가 완료되지 않았습니다">
        <p className="mt-2">
          오류 코드: {params.code ?? '알 수 없음'}
          {params.message ? <> · {params.message}</> : null}
        </p>
        <p className="mt-2 text-xs text-text-mute">
          결제 정보 입력 오류 또는 카드사 사정으로 결제가 중단되었습니다.
        </p>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="bronze" size="sm">
            <Link href="/premium">
              <XCircle className="mr-1 h-3 w-3" />
              다시 시도
            </Link>
          </Button>
        </div>
      </Note>
    </main>
  );
}
