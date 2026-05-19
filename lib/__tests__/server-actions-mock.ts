/**
 * Server Actions test helper — Sprint 19 F19-A.
 *
 * Server Actions 단위 테스트를 위한 공용 mock 빌더.
 * vi.mock 은 module-level 에서 hoist 되므로 각 테스트 파일에서 직접 작성하되,
 * 본 helper 는 mock 의 인자/콜백 구성과 시나리오 헬퍼만 제공한다.
 *
 * 사용 예:
 *   import { buildFirestoreMock, buildTxMock } from '@/lib/__tests__/server-actions-mock';
 *
 *   vi.mock('@/lib/firebase/admin', () => ({
 *     getAdminFirestore: vi.fn(() => mockFirestore),
 *     hasAdminCredentials: vi.fn(() => true),
 *   }));
 *
 *   // test 내부:
 *   const tx = buildTxMock({
 *     gets: [{ exists: true, data: () => ({ authorUid: 'other', likeCount: 0 }) }],
 *   });
 *   mockFirestore.runTransaction.mockImplementation(async (fn) => fn(tx));
 */
import { vi, type Mock } from 'vitest';

// ─────────────────────────────────────────────────────────────────
// Firestore document/snapshot mock builders
// ─────────────────────────────────────────────────────────────────

export interface MockSnapshot {
  readonly exists: boolean;
  readonly id?: string;
  readonly ref?: MockDocRef;
  data(): Record<string, unknown> | undefined;
}

export function buildSnapshot(args: {
  exists?: boolean;
  id?: string;
  data?: Record<string, unknown>;
  ref?: MockDocRef;
}): MockSnapshot {
  return {
    exists: args.exists ?? true,
    ...(args.id !== undefined ? { id: args.id } : {}),
    ...(args.ref !== undefined ? { ref: args.ref } : {}),
    data: () => args.data,
  };
}

// ─────────────────────────────────────────────────────────────────
// Transaction mock
// ─────────────────────────────────────────────────────────────────

export interface MockTransaction {
  readonly get: Mock;
  readonly set: Mock;
  readonly update: Mock;
  readonly delete: Mock;
  readonly create: Mock;
}

export interface BuildTxOptions {
  readonly gets?: readonly MockSnapshot[];
  /** get() 이 throw 해야 하는 경우 */
  readonly getError?: Error;
}

export function buildTxMock(opts: BuildTxOptions = {}): MockTransaction {
  const gets = opts.gets ?? [];
  let callIdx = 0;
  const get = vi.fn(() => {
    if (opts.getError) throw opts.getError;
    const snap = gets[callIdx];
    callIdx++;
    return Promise.resolve(snap ?? buildSnapshot({ exists: false }));
  });
  return {
    get,
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
  };
}

// ─────────────────────────────────────────────────────────────────
// Document/Collection ref mocks
// ─────────────────────────────────────────────────────────────────

export interface MockDocRef {
  readonly id: string;
  readonly path: string;
  get: Mock;
  set: Mock;
  update: Mock;
  delete: Mock;
  collection: Mock;
}

export function buildDocRef(args: {
  id?: string;
  path?: string;
  snapshot?: MockSnapshot;
  /** key: subcollection name → MockCollectionRef */
  subcollections?: Record<string, MockCollectionRef>;
}): MockDocRef {
  const id = args.id ?? 'doc-id';
  const ref: Partial<MockDocRef> = {
    id,
    path: args.path ?? `mock/${id}`,
  };
  ref.get = vi.fn(() =>
    Promise.resolve(args.snapshot ?? buildSnapshot({ exists: false, id })),
  );
  ref.set = vi.fn(() => Promise.resolve());
  ref.update = vi.fn(() => Promise.resolve());
  ref.delete = vi.fn(() => Promise.resolve());
  ref.collection = vi.fn((name: string) => {
    const sub = args.subcollections?.[name];
    if (sub) return sub;
    return buildCollectionRef({});
  });
  return ref as MockDocRef;
}

export interface MockCollectionRef {
  doc: Mock;
  add: Mock;
  where: Mock;
  orderBy: Mock;
  limit: Mock;
  get: Mock;
}

export function buildCollectionRef(args: {
  docs?: Record<string, MockDocRef>;
  queryResult?: { docs: readonly MockSnapshot[]; empty?: boolean };
  addResult?: MockDocRef;
}): MockCollectionRef {
  const queryResult = args.queryResult ?? { docs: [], empty: true };
  const self: Partial<MockCollectionRef> = {};
  self.doc = vi.fn((id?: string) => {
    if (id && args.docs?.[id]) return args.docs[id];
    return buildDocRef({ id: id ?? 'auto-id' });
  });
  self.add = vi.fn(() => Promise.resolve(args.addResult ?? buildDocRef({ id: 'added' })));
  // where/orderBy/limit chainable — same object
  self.where = vi.fn(() => self as MockCollectionRef);
  self.orderBy = vi.fn(() => self as MockCollectionRef);
  self.limit = vi.fn(() => self as MockCollectionRef);
  self.get = vi.fn(() =>
    Promise.resolve({
      docs: queryResult.docs,
      empty: queryResult.empty ?? queryResult.docs.length === 0,
      size: queryResult.docs.length,
    }),
  );
  return self as MockCollectionRef;
}

// ─────────────────────────────────────────────────────────────────
// Firestore root mock
// ─────────────────────────────────────────────────────────────────

export interface MockFirestore {
  collection: Mock;
  runTransaction: Mock;
}

export function buildFirestoreMock(args: {
  collections?: Record<string, MockCollectionRef>;
  /** runTransaction 의 실행 결과 (성공) — 콜백 1회 실행 후 반환 */
  txGets?: readonly MockSnapshot[];
  /** runTransaction 자체가 throw 해야 할 때 */
  txError?: Error;
} = {}): { firestore: MockFirestore; tx: MockTransaction } {
  const tx = buildTxMock(args.txGets ? { gets: args.txGets } : {});
  const firestore: Partial<MockFirestore> = {};
  firestore.collection = vi.fn((name: string) => {
    if (args.collections?.[name]) return args.collections[name];
    return buildCollectionRef({});
  });
  firestore.runTransaction = vi.fn(async (cb: (t: MockTransaction) => Promise<void>) => {
    if (args.txError) throw args.txError;
    return cb(tx);
  });
  return { firestore: firestore as MockFirestore, tx };
}

// ─────────────────────────────────────────────────────────────────
// Auth session shapes
// ─────────────────────────────────────────────────────────────────

export interface MockSession {
  user?: {
    id?: string;
    registered?: boolean;
    role?: 'admin' | 'user' | 'banned';
    email?: string;
  };
}

export function buildSession(opts: {
  uid?: string;
  registered?: boolean;
  role?: 'admin' | 'user' | 'banned';
} = {}): MockSession {
  const uid = opts.uid ?? 'user-1';
  return {
    user: {
      id: uid,
      registered: opts.registered ?? true,
      ...(opts.role ? { role: opts.role } : { role: 'user' }),
      email: `${uid}@example.com`,
    },
  };
}

export const ANONYMOUS_SESSION: MockSession = {};
