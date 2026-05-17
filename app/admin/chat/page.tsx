/**
 * /admin/chat — 채팅 모더레이션 admin 페이지.
 * 출처: docs/sprint/10-sprint-launch/design.md §4 + §14 + Task #27
 *
 * 기능:
 *  - 신고 큐 카운트 (pending chat_reports)
 *  - rate limit 상위 사용자 (최근 갱신순)
 *  - 채널 빠른 이동 (전체 / 서버 / 문파 — admin은 모든 채널 접근)
 *  - 메시지 직접 모더레이션은 채팅 내 컨텍스트 메뉴에서 수행 (Task #25 이미 wiring 완료)
 *
 * 보호: proxy.ts authorized() — role=admin 외 접근 거부 + 본 페이지에서 redundancy check.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  Flag,
  Gauge,
  Globe2,
  Hash,
  MessageSquare,
  Users,
} from 'lucide-react';

import { auth } from '@/lib/auth/auth';
import {
  countPendingChatReports,
  listRecentChatRateLimitOffenders,
} from '@/lib/chat/moderation-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import {
  HeroMeta,
  HeroMetaBadge,
  SectionEyebrow,
  SectionHead,
  SectionLead,
  SectionTitle,
} from '@/components/domain';

export const metadata: Metadata = {
  title: '채팅 모더레이션',
  description: '신고 큐 + rate limit 모니터 + 채널 빠른 이동.',
  robots: { index: false, follow: false },
};

export default async function AdminChatPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const [pendingCount, offenders] = await Promise.all([
    countPendingChatReports(),
    listRecentChatRateLimitOffenders(10),
  ]);

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-20 pt-8 sm:px-[5vw]">
      <header>
        <HeroMeta className="mb-5">
          <HeroMetaBadge>Admin · Chat</HeroMetaBadge>
          <span className="font-mono">admin only</span>
        </HeroMeta>
        <SectionHead>
          <SectionEyebrow label="Sprint 10 Phase E" />
          <SectionTitle as="h1">채팅 모더레이션</SectionTitle>
          <SectionLead>
            신고 큐 + rate limit 모니터링. 개별 메시지 모더레이션은 채팅 채널 내 컨텍스트
            메뉴에서 직접 수행하세요 (3중 방어: SSR + UI + RTDB rules).
          </SectionLead>
        </SectionHead>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2 text-text-mute">
            <Flag aria-hidden className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">신고 대기</span>
          </div>
          <p className="text-3xl font-bold text-text">{pendingCount}</p>
          <Link href="/admin" className="mt-auto inline-flex items-center gap-1 text-sm text-bronze">
            전체 신고 큐 보기
            <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>

        <GlassCard className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2 text-text-mute">
            <Gauge aria-hidden className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Rate Limit 사용자</span>
          </div>
          <p className="text-3xl font-bold text-text">{offenders.length}</p>
          <p className="mt-auto text-xs text-text-mute">최근 1시간 송신 활동</p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2 text-text-mute">
            <MessageSquare aria-hidden className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">채널 바로가기</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Button asChild variant="outline" size="xs">
              <Link href="/chat/global" className="gap-1">
                <Globe2 className="h-3 w-3" aria-hidden /> 전체
              </Link>
            </Button>
            {session.user?.serverId ? (
              <Button asChild variant="outline" size="xs">
                <Link href={`/chat/server-${session.user.serverId}`} className="gap-1">
                  <Hash className="h-3 w-3" aria-hidden /> 서버
                </Link>
              </Button>
            ) : null}
            {session.user?.munpaId ? (
              <Button asChild variant="outline" size="xs">
                <Link href={`/chat/munpa-${session.user.munpaId}`} className="gap-1">
                  <Users className="h-3 w-3" aria-hidden /> 문파
                </Link>
              </Button>
            ) : null}
          </div>
        </GlassCard>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-text">Rate Limit 상위 사용자</h2>
        {offenders.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-text-mute">
            최근 채팅 활동이 없습니다.
          </GlassCard>
        ) : (
          <GlassCard className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-ink-card-strong/60 text-xs uppercase tracking-wider text-text-mute">
                <tr>
                  <th className="px-4 py-2 text-left">UID</th>
                  <th className="px-4 py-2 text-right">분당</th>
                  <th className="px-4 py-2 text-right">시간당</th>
                  <th className="px-4 py-2 text-right">최근 송신</th>
                </tr>
              </thead>
              <tbody>
                {offenders.map((o) => (
                  <tr key={o.uid} className="border-t border-ink-line text-text">
                    <td className="px-4 py-2 font-mono text-xs">{o.uid.slice(0, 10)}…</td>
                    <td className="px-4 py-2 text-right">
                      <Badge
                        variant={o.minuteCount >= 8 ? 'vermilion' : 'muted'}
                        className="text-[0.7rem]"
                      >
                        {o.minuteCount}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Badge
                        variant={o.hourCount >= 50 ? 'vermilion' : 'muted'}
                        className="text-[0.7rem]"
                      >
                        {o.hourCount}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-text-mute">
                      {o.updatedAtMs ? new Date(o.updatedAtMs).toLocaleString('ko-KR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        )}
      </section>
    </main>
  );
}
