/**
 * Sprint 11 Phase B — Presigned upload URL endpoint.
 * 출처: docs/sprint/11-sprint-images/design.md §4.5
 *
 * POST /api/storage/presign
 *   body: { kind, contentType, sizeBytes, channelId? }
 *   200:  { presignedUrl, cdnUrl, expiresInSeconds }
 *   400:  VALIDATION_FAILED / INVALID_JSON
 *   401:  UNAUTHENTICATED
 *   403:  NOT_REGISTERED / BANNED / CHANNEL_FORBIDDEN
 *   429:  RATE_LIMIT_EXCEEDED (retryAfterMs in body)
 *   500:  PRESIGN_FAILED
 *
 * 검증 순서 (실패 시 즉시 응답 — fail fast):
 *  1. auth() session 확인
 *  2. registered + role 확인
 *  3. JSON body parse + Zod 검증
 *  4. chat kind일 때 channel 접근 권한
 *  5. Rate limit
 *  6. presign 발급
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth/auth';
import { canAccessChannel } from '@/lib/chat/channel-permission';
import { createPresignedUploadUrl } from '@/lib/storage/presigned-url';
import { enforceUploadRateLimit } from '@/lib/storage/upload-rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  kind: z.enum(['posts', 'chat']),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  sizeBytes: z.number().int().positive().max(5 * 1024 * 1024),
  channelId: z.string().min(1).max(128).optional(),
});

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  if (!session.user.registered) {
    return NextResponse.json({ error: 'NOT_REGISTERED' }, { status: 403 });
  }
  if (session.user.role === 'banned') {
    return NextResponse.json({ error: 'BANNED' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_FAILED', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (parsed.data.kind === 'chat') {
    if (!parsed.data.channelId) {
      return NextResponse.json({ error: 'CHANNEL_ID_REQUIRED' }, { status: 400 });
    }
    const access = canAccessChannel(parsed.data.channelId, {
      uid: session.user.id,
      role: session.user.role,
      registered: session.user.registered,
      serverId: session.user.serverId,
      munpaId: session.user.munpaId,
    });
    if (!access.ok) {
      return NextResponse.json(
        { error: 'CHANNEL_FORBIDDEN', reason: access.reason },
        { status: 403 },
      );
    }
  }

  const rate = await enforceUploadRateLimit(session.user.id);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'RATE_LIMIT_EXCEEDED', retryAfterMs: rate.retryAfterMs, reason: rate.reason },
      { status: 429 },
    );
  }

  try {
    const result = await createPresignedUploadUrl({
      kind: parsed.data.kind,
      uid: session.user.id,
      contentType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
      ...(parsed.data.channelId ? { channelId: parsed.data.channelId } : {}),
    });
    return NextResponse.json({
      presignedUrl: result.presignedUrl,
      cdnUrl: result.cdnUrl,
      expiresInSeconds: result.expiresInSeconds,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'PRESIGN_FAILED', message: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}
