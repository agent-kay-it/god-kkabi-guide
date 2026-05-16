/**
 * Toss Payments API client — Sprint V2 P3.E.
 * 출처: docs/sprint/04-sprint-v2/phase-2-design/v2-design-details.md §6
 *
 * Toss Payments API v1 (https://docs.tosspayments.com/reference)
 *
 * 보안:
 *  - secret key는 서버 사이드만 사용 (TOSS_SECRET_KEY env)
 *  - client key는 NEXT_PUBLIC_TOSS_CLIENT_KEY (브라우저 widget)
 */
import 'server-only';

const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

function getSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) throw new Error('TOSS_SECRET_KEY env 누락');
  return key;
}

function getAuthHeader(): string {
  // Toss API basic auth: secretKey + ':' base64-encoded
  const key = `${getSecretKey()}:`;
  return `Basic ${Buffer.from(key, 'utf-8').toString('base64')}`;
}

export interface TossPaymentConfirmRequest {
  readonly paymentKey: string;
  readonly orderId: string;
  readonly amount: number;
}

export interface TossPaymentConfirmResponse {
  readonly paymentKey: string;
  readonly orderId: string;
  readonly status: 'READY' | 'IN_PROGRESS' | 'WAITING_FOR_DEPOSIT' | 'DONE' | 'CANCELED' | 'PARTIAL_CANCELED' | 'ABORTED' | 'EXPIRED';
  readonly totalAmount: number;
  readonly method?: string;
  readonly approvedAt?: string;
  readonly failure?: { code: string; message: string };
}

export async function tossConfirmPayment(
  req: TossPaymentConfirmRequest,
): Promise<TossPaymentConfirmResponse> {
  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(`TOSS_CONFIRM_FAILED: ${res.status} ${JSON.stringify(errBody)}`);
  }
  return (await res.json()) as TossPaymentConfirmResponse;
}

export interface TossBillingKeyIssueRequest {
  readonly authKey: string;
  readonly customerKey: string;
}

export interface TossBillingKeyIssueResponse {
  readonly billingKey: string;
  readonly customerKey: string;
  readonly authenticatedAt: string;
}

export async function tossIssueBillingKey(
  req: TossBillingKeyIssueRequest,
): Promise<TossBillingKeyIssueResponse> {
  const res = await fetch(`${TOSS_API_BASE}/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(`TOSS_BILLING_ISSUE_FAILED: ${res.status} ${JSON.stringify(errBody)}`);
  }
  return (await res.json()) as TossBillingKeyIssueResponse;
}

export interface TossBillingChargeRequest {
  readonly billingKey: string;
  readonly customerKey: string;
  readonly amount: number;
  readonly orderId: string;
  readonly orderName: string;
}

export async function tossChargeBilling(
  req: TossBillingChargeRequest,
): Promise<TossPaymentConfirmResponse> {
  const res = await fetch(`${TOSS_API_BASE}/billing/${req.billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerKey: req.customerKey,
      amount: req.amount,
      orderId: req.orderId,
      orderName: req.orderName,
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(`TOSS_CHARGE_FAILED: ${res.status} ${JSON.stringify(errBody)}`);
  }
  return (await res.json()) as TossPaymentConfirmResponse;
}

/**
 * Toss webhook signature 검증 — Sprint V2 P5 (CA2-C2).
 * Toss 콘솔 webhook signature는 base64 인코딩이 표준이지만, 콘솔 설정에 따라 hex일 수도.
 * 양쪽 모두 검증 + Node.js Buffer 기반 timing-safe compare.
 */
export async function verifyTossWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;
  const secret = process.env.TOSS_WEBHOOK_SECRET;
  if (!secret) return false;

  // HMAC-SHA256 계산
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const sigBytes = new Uint8Array(sigBuf);
  const expectedHex = Array.from(sigBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const expectedBase64 = Buffer.from(sigBytes).toString('base64');

  // Toss signature는 콘솔 설정에 따라 hex 또는 base64. 양쪽 검증.
  return (
    timingSafeStringEq(signature, expectedHex) ||
    timingSafeStringEq(signature, expectedBase64)
  );
}

function timingSafeStringEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
