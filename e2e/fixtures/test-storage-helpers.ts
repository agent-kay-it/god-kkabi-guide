/**
 * Sprint 15 / F15-F — Storage emulator 헬퍼.
 *
 * Firebase Storage emulator (localhost:9199) 의 putString / downloadURL / delete.
 */
import admin from 'firebase-admin';
import { ensureE2eAdmin } from '../emulator/admin-helper';

export const TEST_PREFIX = '[TEST-Sprint14]';
export const STORAGE_SEED_ID = 'sprint-15-f-storage';

// Sprint 28 F28-B 단계 2 — admin app race condition fix.
// 이전: 본 파일이 storageBucket 만 명시. auth-token-helper 가 먼저 init 하면
// storageBucket 없는 admin app 재사용 → admin.storage().bucket() 가 throw
// "Bucket name not specified or invalid" 12회 발생. 공유 helper 로 통합.
function ensureAdmin(): admin.app.App {
  return ensureE2eAdmin();
}

/**
 * Admin SDK 로 Storage emulator 에 파일 업로드.
 * @returns storage path (gs:// 경로의 object 부분)
 */
export async function uploadTestFile(
  path: string,
  content: string | Buffer,
  contentType = 'text/plain',
): Promise<string> {
  ensureAdmin();
  const bucket = admin.storage().bucket();
  const file = bucket.file(path);
  await file.save(typeof content === 'string' ? Buffer.from(content) : content, {
    metadata: { contentType, metadata: { e2eTestPrefix: TEST_PREFIX, e2eSeedId: STORAGE_SEED_ID } },
  });
  return path;
}

/**
 * downloadURL 발급 (emulator URL 직접 구성).
 *
 * Storage emulator 는 https URL 대신 http://localhost:9199/v0/b/.../o/... 형식.
 */
export function getEmulatorDownloadURL(path: string): string {
  const encoded = encodeURIComponent(path);
  return `http://localhost:9199/v0/b/demo-kkaebizigi-test.appspot.com/o/${encoded}?alt=media`;
}

/**
 * Storage emulator 의 [TEST-Sprint14] 객체 일괄 cleanup.
 */
export async function cleanupTestStorage(): Promise<number> {
  ensureAdmin();
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles();
  const toDelete = files.filter((f) => {
    const meta = f.metadata.metadata as { e2eSeedId?: string } | undefined;
    return meta?.e2eSeedId === STORAGE_SEED_ID;
  });
  await Promise.all(toDelete.map((f) => f.delete().catch(() => undefined)));
  return toDelete.length;
}
