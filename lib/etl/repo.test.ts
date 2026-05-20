/**
 * lib/etl/repo.ts — Sprint 22 F22-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
  },
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));

import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { upsertSignal, upsertSignalsBatch, listSignals } from './repo';

const mockedFirestore = vi.mocked(getAdminFirestore);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

const sampleInput = {
  source: 'saramin' as const,
  signalType: 'job_posting' as const,
  payload: { id: 'j1' },
  period: '2026-W20',
  keywords: ['갓깨비'],
};

describe('upsertSignal', () => {
  it('admin creds 없으면 ok:false', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await upsertSignal(sampleInput);
    expect(r).toEqual({ ok: false, id: '' });
  });

  it('id 명시 → 같은 doc 에 merge', async () => {
    const setMock = vi.fn<(data: Record<string, unknown>, opts: { merge?: boolean }) => Promise<void>>(
      () => Promise.resolve(),
    );
    const docRef = { id: 'fixed-id', set: setMock };
    const collectionDocMock = vi.fn(() => docRef);
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: collectionDocMock })),
    } as never);
    const r = await upsertSignal({ ...sampleInput, id: 'fixed-id' });
    expect(r).toMatchObject({ ok: true, id: 'fixed-id' });
    expect(collectionDocMock).toHaveBeenCalledWith('fixed-id');
    const setArg = setMock.mock.calls[0]![1];
    expect(setArg).toMatchObject({ merge: true });
  });

  it('id 미지정 → auto-id', async () => {
    const setMock = vi.fn(() => Promise.resolve());
    const docRef = { id: 'auto-1', set: setMock };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => docRef) })),
    } as never);
    const r = await upsertSignal(sampleInput);
    expect(r).toMatchObject({ ok: true, id: 'auto-1' });
  });
});

describe('upsertSignalsBatch', () => {
  it('admin creds 없으면 zero', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const r = await upsertSignalsBatch([sampleInput]);
    expect(r).toEqual({ processed: 0, errors: 0 });
  });

  it('빈 inputs → zero', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(),
      batch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn(() => Promise.resolve()) })),
    } as never);
    const r = await upsertSignalsBatch([]);
    expect(r).toEqual({ processed: 0, errors: 0 });
  });

  it('happy: 다수 input 처리', async () => {
    const batch = {
      set: vi.fn(),
      commit: vi.fn(() => Promise.resolve()),
    };
    const docRef = { id: 'auto' };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => docRef) })),
      batch: vi.fn(() => batch),
    } as never);

    const r = await upsertSignalsBatch([sampleInput, sampleInput, sampleInput]);
    expect(r).toMatchObject({ processed: 3, errors: 0 });
    expect(batch.set).toHaveBeenCalledTimes(3);
  });

  it('batch commit 실패 → errors 카운트', async () => {
    const batch = {
      set: vi.fn(),
      commit: vi.fn(() => Promise.reject(new Error('boom'))),
    };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ({ id: 'x' })) })),
      batch: vi.fn(() => batch),
    } as never);
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await upsertSignalsBatch([sampleInput, sampleInput]);
    expect(r).toMatchObject({ processed: 0, errors: 2 });
    consoleErr.mockRestore();
  });
});

describe('listSignals', () => {
  it('admin creds 없으면 empty', async () => {
    mockedHasAdmin.mockReturnValue(false);
    expect(await listSignals()).toEqual([]);
  });

  it('source / signalType / period / keyword filter — where 호출', async () => {
    const whereMock = vi.fn(function (this: unknown) {
      return this;
    });
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        where: whereMock,
        get: vi.fn(() => Promise.resolve({ docs: [] })),
      })),
    } as never);
    await listSignals({
      source: 'saramin',
      signalType: 'job_posting',
      period: '2026-W20',
      keyword: '갓깨비',
    });
    expect(whereMock).toHaveBeenCalledWith('source', '==', 'saramin');
    expect(whereMock).toHaveBeenCalledWith('signalType', '==', 'job_posting');
    expect(whereMock).toHaveBeenCalledWith('period', '==', '2026-W20');
    expect(whereMock).toHaveBeenCalledWith('keywords', 'array-contains', '갓깨비');
  });

  it('limit clamp — 최소 1 / 최대 200', async () => {
    const limitMock = vi.fn(function (this: unknown) {
      return this;
    });
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: limitMock,
        get: vi.fn(() => Promise.resolve({ docs: [] })),
      })),
    } as never);
    await listSignals({ limit: 999 });
    expect(limitMock).toHaveBeenCalledWith(200);

    await listSignals({ limit: 0 });
    expect(limitMock).toHaveBeenCalledWith(1);
  });

  it('happy: docs 반환', async () => {
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        orderBy: vi.fn(function (this: unknown) {
          return this;
        }),
        limit: vi.fn(function (this: unknown) {
          return this;
        }),
        get: vi.fn(() =>
          Promise.resolve({
            docs: [
              { data: () => ({ id: 's1', source: 'saramin' }) },
            ],
          }),
        ),
      })),
    } as never);
    const r = await listSignals();
    expect(r.length).toBe(1);
  });

  it('Firestore throw → empty', async () => {
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await listSignals()).toEqual([]);
    consoleErr.mockRestore();
  });
});
