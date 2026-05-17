/**
 * NextAuth Session → ChatUserContext 변환 헬퍼.
 * 출처: docs/sprint/10-sprint-launch/design.md §7.4
 *
 * 본 모듈은 server + client 양쪽에서 import 가능 (외부 의존성 0).
 * Session 객체에서 chat 도메인에 필요한 필드만 추출하여 unstable한 NextAuth
 * 타입 augmentation으로부터 본 도메인을 격리한다.
 */
import type { Session } from 'next-auth';

import type { ChatUserContext } from './types';

/** NextAuth session.user → ChatUserContext. null이면 anonymous. */
export function chatUserFromSession(
  session: Session | null | undefined,
): ChatUserContext | null {
  const u = session?.user;
  if (!u?.id) return null;
  return {
    uid: u.id,
    role: u.role,
    registered: u.registered,
    serverId: u.serverId,
    munpaId: u.munpaId,
  };
}
