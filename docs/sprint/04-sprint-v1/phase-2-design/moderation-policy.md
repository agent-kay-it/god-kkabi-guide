# Moderation Policy V1

> **Sprint V1** — 자동 페널티 룰 + 모더레이션 사전 외부화

---

## 1. 자동 페널티 룰

### 1.1 임계값 + 액션

| 누적 신고 (`users.reportedTotal`) | 액션 | claim 변경 | 사용자 통지 |
|---|---|---|---|
| 5건 | 경고 (`warningCount++`) | — | 로그인 시 토스트 "5건 신고 누적 — 다시 신고 시 7일 정지" |
| 10건 | 7일 정지 (`banned=true` + `bannedUntil=now+7d`) | `role`는 유지 (claim에서 분리) | 로그인 차단 + bannedUntil 표시 |
| 20건 | 영구 정지 (`role='banned'`) | `setCustomUserClaims(uid, { role: 'banned' })` | 로그인 차단 |

### 1.2 트리거

`lib/penalty/actions.ts:recordReport(targetType, targetUid)`:
1. 신고 발생 시 호출 (chat / post / comment 신고 Server Action 끝에서)
2. Firestore 트랜잭션: `users.reportedTotal += 1`
3. 새 total 기준 `applyAutoPenalty(uid, total)` 호출

### 1.3 audit

`moderation_logs`에 자동 기록:
```ts
{
  actorUid: 'system',
  action: 'auto_penalty_warning' | 'auto_penalty_7d' | 'auto_penalty_permanent',
  targetUid: uid,
  metadata: { trigger: 'reported_total_threshold', threshold: 5 | 10 | 20, reportedTotal },
  createdAt: serverTimestamp(),
}
```

`penalties` 컬렉션에도 동일 기록 (admin 빠른 조회용).

### 1.4 운영자 우회 (recovery)

`recoverFromPenalty(uid, reason)`:
- admin 전용
- `users.reportedTotal -= 1` (false positive 결정 시)
- `penalties.{id}.revokedBy = adminUid + revokedAt = now`
- 정지된 사용자라면 unbanUser 별도 호출 (분리 처리)
- audit: `moderation_logs.action = 'penalty_revoked'`

### 1.5 ban_7d 자동 해제

만료 시 자동 해제 메커니즘:
- 매일 1회 Cloud Function 또는 cron (운영자 게이트 — V2에서 도입 가능)
- 또는 진입 시 lazy check: 사용자 로그인 시 `if (bannedUntil < now && banned === true) → unban + claim 갱신`

V1 MVP: lazy check (Cloud Function 없이)

---

## 2. 모더레이션 사전 외부화

### 2.1 기존 `lib/chat/masking.ts` 하드코딩 → Firestore

```ts
// 기존 (v2)
const KOREAN_BAD_WORDS = ['시발', '병신', ...11종];

// V1 변경
const dictionaries = await loadDictionaries();  // Firestore + seed fallback
const masked = applyDictionaries(content, dictionaries);
```

### 2.2 Firestore 로드 패턴

`lib/moderation/dictionaries.ts`:
```ts
'use server';
import 'server-only';

let cache: { data: ModerationDict[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;  // 5분 캐시

export async function loadDictionaries(): Promise<readonly ModerationDict[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  if (!hasAdminCredentials()) return SEED_DICTIONARIES;  // v2 11종 fallback

  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection('moderation_dictionaries')
      .where('active', '==', true)
      .get();
    const data = snap.docs.map((d) => d.data() as ModerationDict);
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch {
    return SEED_DICTIONARIES;
  }
}
```

### 2.3 클라이언트 마스킹

- 채팅 메시지: 기존 client-side maskBadWords 유지
- 클라이언트가 dictionaries를 fetch (Firestore client SDK + `where('active', '==', true)` 읽기)
- 5분 캐시 (localStorage + TTL)

### 2.4 admin 콘솔 CRUD

`/admin/dictionaries` 페이지:
- 리스트 (category 필터)
- 신규 추가 (pattern + isRegex + severity)
- 토글 active
- 삭제 (revertible — soft delete 권장 → active=false)

---

## 3. M12 Quality Gate

- 신고 5/10/20건 임계값 정확 발동 ✓
- audit log 100% ✓
- admin 수동 우회 가능 ✓
- recovery 후 reportedTotal 감소 ✓
- 자동 비율 (`auto_penalty / total_penalty`) ≥ 0.7

---

## 4. 결정

- 자동 페널티는 fail-safe하게: false positive 시 운영자 복구 가능
- 사용자에게 명확한 통지 (silent ban 금지)
- audit trail 영구 보존
- V1 MVP는 lazy check, Cloud Function은 V2
