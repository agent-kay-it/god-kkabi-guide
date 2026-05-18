/**
 * /me/profile — 프로필 수정 페이지.
 * 출처: docs/sprint/10-sprint-launch/prd.md §F1.4
 *
 * Server Component: 세션 + Firestore users/{uid} 읽어서 initialValues로 전달.
 * Client: ProfileEditForm (react-hook-form + Server Action).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { ProfileEditForm } from '@/components/feature/profile-edit-form';
import { ProfileImageUploader } from '@/components/feature/profile-image-uploader';
import type { ProfileEditInput } from '@/lib/auth/profile-schema';
import {
  HeroMeta,
  HeroMetaBadge,
  Note,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '프로필 수정',
  description: '서버, 문파, 닉네임, 직업을 수정합니다. 게임 UID는 변경할 수 없습니다.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/me/profile' },
};

interface UserDocData {
  readonly serverId?: string;
  readonly gameUid?: string;
  readonly munpa?: string;
  readonly nickname?: string;
  readonly classId?: ProfileEditInput['classId'];
  readonly email?: string;
  /** Sprint 11 Phase E — Google OAuth 사진 (변경 불가). */
  readonly photoURL?: string;
  /** Sprint 11 Phase E — 사용자 직접 업로드 사진 (CDN URL). */
  readonly customPhotoURL?: string;
}

export default async function ProfileEditPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/me/profile');
  if (!session.user.registered) redirect('/register?callbackUrl=/me/profile');
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
  const snap = await db.collection('users').doc(uid).get();
  const data = (snap.data() ?? {}) as UserDocData;

  const initialValues: ProfileEditInput = {
    serverId: data.serverId ?? '',
    munpa: data.munpa ?? '',
    nickname: data.nickname ?? '',
    classId: data.classId ?? 'warrior',
  };
  const gameUid = data.gameUid ?? '';
  const email = data.email ?? session.user?.email ?? '';
  const nickname = data.nickname ?? session.user?.name ?? '사용자';

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>내 정보</HeroMetaBadge>
          <span className="font-mono">{nickname}</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Profile · Edit" />
          <SectionTitle as="h1">프로필 수정</SectionTitle>
          <SectionLead>
            등록 정보를 업데이트하세요. 서버·문파 변경 시 채팅 채널이 자동 이동됩니다.
          </SectionLead>
        </SectionHead>
      </header>

      <div className="mx-auto mt-10 max-w-3xl space-y-6">
        <ProfileImageUploader
          nickname={nickname}
          customPhotoURL={data.customPhotoURL ?? null}
          googlePhotoURL={data.photoURL ?? session.user?.image ?? null}
        />

        <ProfileEditForm
          initialValues={initialValues}
          readonlyGameUid={gameUid}
          readonlyEmail={email}
        />

        <div className="rounded-[var(--radius-card)] border border-ink-line p-4 text-sm text-text-soft">
          <h2 className="mb-2 text-sm font-semibold text-text">계정 관리</h2>
          <ul className="space-y-1.5">
            <li>
              <Link
                href="/me/subscription"
                className="text-bronze-soft underline-offset-4 hover:underline"
              >
                구독 관리 →
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-bronze-soft underline-offset-4 hover:underline"
              >
                이용약관 →
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-bronze-soft underline-offset-4 hover:underline"
              >
                개인정보처리방침 →
              </Link>
            </li>
            <li className="pt-2">
              <Button asChild variant="ghost" size="sm" className="px-0 text-vermilion-soft hover:bg-vermilion/10">
                <Link href="/me/delete-account">회원 탈퇴 →</Link>
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
