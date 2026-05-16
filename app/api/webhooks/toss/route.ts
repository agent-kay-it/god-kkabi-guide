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
      // Sprint V2 P5 — CA2-C3 멱등성: payment_history doc id = orderId.
      // client confirm보다 webhook이 먼저 도착하는 race 케이스 대응 — set({merge: true})로
      // doc 존재 여부 관계없이 webhook 상태 보존, 이후 confirmSubscription이 같은 doc에 merge.
      const histRef = db.collection('payment_history').doc(body.data.orderId);
      await histRef.set(
        {
          id: body.data.orderId,
          orderId: body.data.orderId,
          ...(body.data.paymentKey ? { paymentKey: body.data.paymentKey } : {}),
          status:
            body.data.status === 'DONE'
              ? 'completed'
              : body.data.status === 'CANCELED'
                ? 'canceled'
                : 'failed',
          webhookEventType: body.eventType,
          webhookReceivedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/webhooks/toss]', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL' }, { status: 500 });
  }
}
