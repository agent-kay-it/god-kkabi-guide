/**
 * lib/simulator/actions.ts — recordSimulatorRun 단위 테스트.
 * Sprint 19 F19-A.
 */
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/auth', () => ({ auth: vi.fn() }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => ({ __fv: 'timestamp' })),
  },
}));
vi.mock('@/lib/firebase/admin', () => ({
  getAdminFirestore: vi.fn(),
  hasAdminCredentials: vi.fn(() => true),
}));

import { auth } from '@/lib/auth/auth';
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase/admin';
import { recordSimulatorRun } from './actions';
import type { WikiJinryeongId } from '@/types/wiki';

const mockedAuth = vi.mocked(auth);
const mockedHasAdmin = vi.mocked(hasAdminCredentials);
const mockedFirestore = vi.mocked(getAdminFirestore);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasAdmin.mockReturnValue(true);
});

const validIds: readonly WikiJinryeongId[] = ['j-001', 'j-002', 'j-003'] as never;

describe('recordSimulatorRun', () => {
  it('jinryeongIds 3개 미만이면 ok:false', async () => {
    const result = await recordSimulatorRun({
      jinryeongIds: ['j-001', 'j-002'] as never,
      synergyScore: 80,
      tier: 'A',
    });
    expect(result).toEqual({ ok: false });
  });

  it('admin creds 없으면 ok:false', async () => {
    mockedHasAdmin.mockReturnValue(false);
    const result = await recordSimulatorRun({
      jinryeongIds: validIds,
      synergyScore: 80,
      tier: 'A',
    });
    expect(result).toEqual({ ok: false });
  });

  it('익명 사용자도 기록 (uid 없음)', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const setMock = vi.fn<(data: Record<string, unknown>) => Promise<void>>(
      () => Promise.resolve(),
    );
    const ref = { id: 'run-1', set: setMock };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ref) })),
    } as never);

    const result = await recordSimulatorRun({
      jinryeongIds: validIds,
      synergyScore: 88,
      tier: 'S',
    });

    expect(result).toMatchObject({ ok: true, id: 'run-1' });
    const setArg = setMock.mock.calls[0]![0];
    expect(setArg.uid).toBeUndefined();
    expect(setArg.synergyScore).toBe(88);
    expect(setArg.tier).toBe('S');
    expect(setArg.comboId).toBeDefined();
  });

  it('로그인 사용자 — uid 저장', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1' },
    } as never);
    const setMock = vi.fn<(data: Record<string, unknown>) => Promise<void>>(
      () => Promise.resolve(),
    );
    const ref = { id: 'run-2', set: setMock };
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ref) })),
    } as never);

    const result = await recordSimulatorRun({
      jinryeongIds: validIds,
      synergyScore: 70,
      tier: 'B',
      classId: 'warrior',
    });

    expect(result).toMatchObject({ ok: true });
    const setArg = setMock.mock.calls[0]![0];
    expect(setArg.uid).toBe('u1');
    expect(setArg.classId).toBe('warrior');
  });

  it('firestore throw 시 ok:false (silent)', async () => {
    mockedAuth.mockResolvedValue(null as never);
    mockedFirestore.mockImplementation(() => {
      throw new Error('boom');
    });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await recordSimulatorRun({
      jinryeongIds: validIds,
      synergyScore: 80,
      tier: 'A',
    });
    expect(result).toEqual({ ok: false });
    consoleErr.mockRestore();
  });

  it('classId 없을 때 필드 누락 (undefined 저장 X)', async () => {
    mockedAuth.mockResolvedValue(null as never);
    const setMock = vi.fn<(data: Record<string, unknown>) => Promise<void>>(
      () => Promise.resolve(),
    );
    mockedFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({ id: 'r1', set: setMock })),
      })),
    } as never);

    await recordSimulatorRun({
      jinryeongIds: validIds,
      synergyScore: 60,
      tier: 'C',
    });

    const setArg = setMock.mock.calls[0]![0];
    expect('classId' in setArg).toBe(false);
  });
});
