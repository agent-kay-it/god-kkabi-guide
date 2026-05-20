/**
 * 닉네임 변경 cooldown 계산 helper — Sprint 23 F23-A.
 *
 * 사용 예: Server Component (/me 페이지) 에서 사용자 lastChangedAtMs
 * 를 읽은 후 본 함수로 남은 시간 계산.
 *
 * Note: change-nickname.ts 는 'use server' (Server Action only) 라 client/test
 * 환경 import 시 next-auth 가 의존 chain 으로 끌려오는 부작용 있음.
 * 본 helper 는 pure constant + function — change-nickname.ts 의 단일 출처 동결값을
 * 재선언 (변경 시 두 곳 동기화 필요).
 */

/** change-nickname.ts 의 NICKNAME_COOLDOWN_MS 와 동일한 값 (30일 = 2,592,000,000ms) */
export const NICKNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * 닉네임 변경 cooldown 남은 시간 (ms).
 *
 * @param lastChangedAtMs - users.nicknameChangedAtMs (없으면 undefined 또는 0)
 * @returns 0 이상 NICKNAME_COOLDOWN_MS 이하의 ms
 */
export function calcNicknameCooldownRemainingMs(
  lastChangedAtMs: number | undefined | null,
): number {
  if (!lastChangedAtMs || lastChangedAtMs <= 0) return 0;
  const elapsed = Date.now() - lastChangedAtMs;
  return Math.max(0, NICKNAME_COOLDOWN_MS - elapsed);
}
