/**
 * Toss Payments webhook — 결제 상태 변화 알림.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6.3
 *
 * 이벤트:
 *  - PAYMENT_STATUS_CHANGED: status DONE / CANCELED / FAILED
 *  - BILLING_KEY_ISSUED: SuperPay 자동결제 키 발급
 *
 * 보안: TOSS_WEBHOOK_SECRET HMAC-SHA256 signature 검증.
 */
import { NextResponse } from 'next/server';

import { verifyTossWebhookSignature } from '@/lib/subscription/toss-client';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface TossWebhookBody {
  readonly eventType?: string;
  readonly data?: {
    readonly orderId?: string;
    readonly paymentKey?: string;
    readonly status?: string;
    readonly customerKey?: string;
    readonly billingKey?: string;
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get('TossPayments-Signature');
  const valid = await verifyTossWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'INVALID_SIGNATURE' }, { status: 401 });
  }

  let body: TossWebhookBody;
  try {
    body = JSON.parse(rawBody) as TossWebhookBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!hasAdminCredentials()) {
    return NextResponse.json({ ok: false, error: 'ADMIN_NOT_CONFIGURED' }, { status: 500 });
  }

  const db = getAdminFirestore();
  try {
    if (body.eventType === 'PAYMENT_STATUS_CHANGED' && body.data?.orderId) {
      // 결제 history 업데이트만 — 활성화는 client confirm에서 처리
      const histSnap = await db
        .collection('payment_history')
        .where('orderId', '==', body.data.orderId)
        .limit(1)
        .get();
      if (!histSnap.empty) {
        await histSnap.docs[0]!.ref.update({
          status:
            body.data.status === 'DONE'
              ? 'completed'
              : body.data.status === 'CANCELED'
                ? 'canceled'
                : 'failed',
          webhookReceivedAt: FieldValue.serverTimestamp(),
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/webhooks/toss]', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL' }, { status: 500 });
  }
}
