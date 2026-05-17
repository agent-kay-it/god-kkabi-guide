/**
 * /me/delete-account — 회원 탈퇴 확인 페이지.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.5 + PIPA 30일 cooldown
 *
 * Server Component:
 *  - 세션 + 등록 상태 검증
 *  - Firestore에서 닉네임 + 영향 범위 (게시물 수 / 북마크 수) 조회
 *  - DeleteAccountForm 으로 전달
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { DeleteAccountForm } from '@/components/feature/delete-account-form';
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
  title: '회원 탈퇴',
  description: '계정을 삭제합니다. 30일 cooldown 후 영구 삭제됩니다.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/me/delete-account' },
};

export default async function DeleteAccountPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/me/delete-account');
  if (!session.user.registered) redirect('/register?callbackUrl=/me');
  const uid = session.user.id;

  if (!hasAdminCredentials()) {
    return (
      <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
        <Note variant="warn" title="서비스 점검 중">
          Firebase Admin SDK 자격증명이 설정되지 않았습니다. 운영자에게 문의해주세요.
        </Note>
      </main>
    );
  }

  const db = getAdminFirestore();
  const userSnap = await db.collection('users').doc(uid).get();
  const data = userSnap.data() ?? {};
  const currentNickname = (data.nickname as string | undefined) ?? '사용자';
  const postCount = Number(data.postCount ?? 0);
  const bookmarkCount = Array.isArray(data.bookmarkIds) ? data.bookmarkIds.length : 0;

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>내 정보</HeroMetaBadge>
          <span className="font-mono text-vermilion-soft">탈퇴</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Account · Delete" />
          <SectionTitle as="h1">회원 탈퇴</SectionTitle>
          <SectionLead>
            계정 삭제 전 영향 범위를 확인하고 2단계 확인을 진행해주세요.
          </SectionLead>
        </SectionHead>
      </header>

      <div className="mx-auto mt-10 max-w-3xl space-y-6">
        <Note variant="warn" title="탈퇴 전 알아두실 점">
          <ul className="ml-4 list-disc space-y-1 text-sm">
            <li>탈퇴 후 30일 동안 데이터가 보관되며, 같은 Google 계정으로 재가입 시 복구 가능합니다.</li>
            <li>30일 경과 후 모든 데이터(게시물 메타데이터, 북마크, 채팅 메시지)가 영구 삭제됩니다.</li>
            <li>작성한 게시물과 댓글은 익명화된 상태로 커뮤니티에 남습니다.</li>
            <li>탈퇴 즉시 NextAuth 세션이 종료되어 자동 로그아웃됩니다.</li>
          </ul>
        </Note>

        <DeleteAccountForm
          currentNickname={currentNickname}
          impact={{ postCount, bookmarkCount }}
        />

        <p className="text-center text-xs text-text-mute">
          잠시만요. <Link href="/me/profile" className="text-bronze underline-offset-4 hover:underline">프로필을 먼저 수정</Link>해보거나{' '}
          <Link href="/me/subscription" className="text-bronze underline-offset-4 hover:underline">구독 관리</Link>를 확인해보세요.
        </p>
      </div>
    </main>
  );
}
