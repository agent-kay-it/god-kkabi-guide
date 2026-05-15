/**
 * ChatWidget — 우하단 플로팅 채팅 위젯 (3 탭).
 * 출처: docs/sprint/03-sprint-mvp-v2/design.md §6 + component-inventory-v2.md §4.3
 *
 * 동작:
 *  - 로그인 + 등록 완료 사용자에게만 표시
 *  - minimize/maximize 토글
 *  - 3 탭: 전체 (global) / 서버 (server:{serverId}) / 문파 (munpa:{serverId}:{munpaName})
 *  - 본인 서버/문파 없으면 해당 탭 비활성
 */
'use client';

import { useState } from 'react';
import { MessageSquare, Minimize2, X } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatChannel } from './chat-channel';
import { ChatInput } from './chat-input';
import { channelId, type ChatChannelKey } from '@/types/chat';
import { cn } from '@/lib/utils';

export interface ChatWidgetSession {
  readonly uid: string;
  readonly nickname: string;
  readonly classId?: 'warrior' | 'swordsman' | 'medium';
  readonly role?: 'admin' | 'user';
  readonly serverId?: string;
  readonly munpa?: string;
}

export interface ChatWidgetProps {
  readonly session: ChatWidgetSession;
}

export function ChatWidget({ session }: ChatWidgetProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'server' | 'munpa'>('global');

  const globalKey: ChatChannelKey = { kind: 'global' };
  const serverKey: ChatChannelKey | null = session.serverId
    ? { kind: 'server', serverId: session.serverId }
    : null;
  const munpaKey: ChatChannelKey | null =
    session.serverId && session.munpa
      ? { kind: 'munpa', serverId: session.serverId, munpaName: session.munpa }
      : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="채팅 열기"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-bronze text-ink-base shadow-glow-bronze transition-transform hover:scale-105"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    );
  }

  const isAdmin = session.role === 'admin';
  const isBanned = (session.role as string) === 'banned';

  return (
    <div
      role="dialog"
      aria-label="채팅"
      className={cn(
        'fixed bottom-5 right-5 z-40 flex h-[min(72vh,560px)] w-[min(92vw,360px)] flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-ink-line shadow-glass-elev',
        'bg-ink-base/95 backdrop-blur-md',
      )}
    >
      <header className="flex items-center justify-between border-b border-ink-line bg-ink-card-strong px-3 py-2">
        <h2 className="text-sm font-bold text-text">채팅</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="채팅 최소화"
            className="rounded-md p-1 text-text-mute hover:bg-ink-elev hover:text-text"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="채팅 닫기"
            className="rounded-md p-1 text-text-mute hover:bg-vermilion/10 hover:text-vermilion"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'global' | 'server' | 'munpa')}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-none bg-ink-card-strong">
          <TabsTrigger value="global" className="text-xs">
            전체
          </TabsTrigger>
          <TabsTrigger value="server" disabled={!serverKey} className="text-xs">
            {serverKey ? `서버 ${session.serverId}` : '서버'}
          </TabsTrigger>
          <TabsTrigger value="munpa" disabled={!munpaKey} className="text-xs">
            {munpaKey ? `문파` : '문파'}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="global"
          className="flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          forceMount
        >
          <ChatChannel
            channelId={channelId(globalKey)}
            currentUid={session.uid}
            canReport={!isBanned}
            isAdmin={isAdmin}
          />
          <ChatInput channelId={channelId(globalKey)} author={session} disabled={isBanned} />
        </TabsContent>

        {serverKey ? (
          <TabsContent
            value="server"
            className="flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
            forceMount
          >
            <ChatChannel
              channelId={channelId(serverKey)}
              currentUid={session.uid}
              canReport={!isBanned}
              isAdmin={isAdmin}
            />
            <ChatInput channelId={channelId(serverKey)} author={session} disabled={isBanned} />
          </TabsContent>
        ) : null}

        {munpaKey ? (
          <TabsContent
            value="munpa"
            className="flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
            forceMount
          >
            <ChatChannel
              channelId={channelId(munpaKey)}
              currentUid={session.uid}
              canReport={!isBanned}
              isAdmin={isAdmin}
            />
            <ChatInput channelId={channelId(munpaKey)} author={session} disabled={isBanned} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
