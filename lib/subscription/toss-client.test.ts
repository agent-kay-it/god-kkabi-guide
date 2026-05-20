/**
 * lib/subscription/toss-client.ts — Sprint 25 F25-A 단위 테스트.
 * Toss Payments API client + webhook signature 검증.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  tossConfirmPayment,
  tossIssueBillingKey,
  tossChargeBilling,
  verifyTossWebhookSignature,
} from './toss-client';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.unstubAllEnvs();
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
  vi.stubEnv('TOSS_SECRET_KEY', 'test_secret_key');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function mockOk(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

function mockFail(status: number, body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => body,
  });
}

describe('tossConfirmPayment', () => {
  it('happy: 200 응답 → 그대로 반환', async () => {
    mockOk({
      paymentKey: 'pk1',
      orderId: 'order-1',
      status: 'DONE',
      totalAmount: 1900,
    });
    const r = await tossConfirmPayment({
      paymentKey: 'pk1',
      orderId: 'order-1',
      amount: 1900,
    });
    expect(r.status).toBe('DONE');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tosspayments.com/v1/payments/confirm',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic '),
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('fail: 4xx → TOSS_CONFIRM_FAILED throw', async () => {
    mockFail(400, { code: 'PROVIDER_ERROR', message: 'bad' });
    await expect(
      tossConfirmPayment({
        paymentKey: 'pk1',
        orderId: 'order-1',
        amount: 1900,
      }),
    ).rejects.toThrow(/TOSS_CONFIRM_FAILED/);
  });

  it('fail: body json parse 실패 시에도 throw', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('bad json');
      },
    });
    await expect(
      tossConfirmPayment({
        paymentKey: 'pk1',
        orderId: 'order-1',
        amount: 1900,
      }),
    ).rejects.toThrow(/TOSS_CONFIRM_FAILED/);
  });

  it('TOSS_SECRET_KEY 누락 시 throw', async () => {
    vi.stubEnv('TOSS_SECRET_KEY', '');
    await expect(
      tossConfirmPayment({
        paymentKey: 'pk1',
        orderId: 'order-1',
        amount: 1900,
      }),
    ).rejects.toThrow(/TOSS_SECRET_KEY/);
  });
});

describe('tossIssueBillingKey', () => {
  it('happy: billingKey 발급', async () => {
    mockOk({
      billingKey: 'bk1',
      customerKey: 'ck1',
      authenticatedAt: '2026-05-19T00:00:00Z',
    });
    const r = await tossIssueBillingKey({ authKey: 'ak1', customerKey: 'ck1' });
    expect(r.billingKey).toBe('bk1');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tosspayments.com/v1/billing/authorizations/issue',
      expect.any(Object),
    );
  });

  it('fail: 4xx → TOSS_BILLING_ISSUE_FAILED', async () => {
    mockFail(400, { code: 'INVALID', message: 'bad auth' });
    await expect(
      tossIssueBillingKey({ authKey: 'ak1', customerKey: 'ck1' }),
    ).rejects.toThrow(/TOSS_BILLING_ISSUE_FAILED/);
  });
});

describe('tossChargeBilling', () => {
  it('happy: 자동결제 성공', async () => {
    mockOk({
      paymentKey: 'pk2',
      orderId: 'order-2',
      status: 'DONE',
      totalAmount: 1900,
    });
    const r = await tossChargeBilling({
      billingKey: 'bk1',
      customerKey: 'ck1',
      amount: 1900,
      orderId: 'order-2',
      orderName: 'GodKkabi Premium 월간',
    });
    expect(r.status).toBe('DONE');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tosspayments.com/v1/billing/bk1',
      expect.any(Object),
    );
  });

  it('fail: 5xx → TOSS_CHARGE_FAILED', async () => {
    mockFail(500, { code: 'TIMEOUT' });
    await expect(
      tossChargeBilling({
        billingKey: 'bk1',
        customerKey: 'ck1',
        amount: 1900,
        orderId: 'order-2',
        orderName: '구독',
      }),
    ).rejects.toThrow(/TOSS_CHARGE_FAILED/);
  });
});

describe('verifyTossWebhookSignature', () => {
  it('signature 누락 → false', async () => {
    vi.stubEnv('TOSS_WEBHOOK_SECRET', 'whsec');
    expect(await verifyTossWebhookSignature('body', null)).toBe(false);
  });

  it('TOSS_WEBHOOK_SECRET 누락 → false', async () => {
    vi.stubEnv('TOSS_WEBHOOK_SECRET', '');
    expect(await verifyTossWebhookSignature('body', 'sig')).toBe(false);
  });

  it('잘못된 signature → false', async () => {
    vi.stubEnv('TOSS_WEBHOOK_SECRET', 'whsec_test_123');
    expect(await verifyTossWebhookSignature('body', 'wrong-sig')).toBe(false);
  });

  it('올바른 hex signature → true', async () => {
    const secret = 'whsec_test_123';
    const body = '{"event":"PAYMENT_STATUS_CHANGED"}';
    vi.stubEnv('TOSS_WEBHOOK_SECRET', secret);
    // 실제 HMAC 계산해서 비교
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body));
    const hex = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    expect(await verifyTossWebhookSignature(body, hex)).toBe(true);
  });

  it('올바른 base64 signature → true', async () => {
    const secret = 'whsec_test_456';
    const body = 'event-body';
    vi.stubEnv('TOSS_WEBHOOK_SECRET', secret);
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body));
    const base64 = Buffer.from(new Uint8Array(sigBuf)).toString('base64');
    expect(await verifyTossWebhookSignature(body, base64)).toBe(true);
  });

  it('signature 길이 다르면 timing-safe 비교 false 즉시 종료', async () => {
    vi.stubEnv('TOSS_WEBHOOK_SECRET', 'whsec_test_789');
    expect(await verifyTossWebhookSignature('body', 'short')).toBe(false);
  });
});
