# Clean Architecture Audit Report

**Generated**: 2026-05-17T11:35:49.213Z
**Scanned files**: 271
**Total errors**: 0
**Total warnings**: 0
**Exit code**: 0
**Reference**: docs/sprint/10-sprint-launch/design.md §1.1

## 요약

| 규칙 | 설명 | 위반 | 결과 |
|---|---|---|---|
| R1 | domain → `firebase/*` 직접 import 금지 | 0 | PASS |
| R2 | server 모듈 `import 'server-only'` 누락 | 0 | PASS |
| R3 | 'use client'에서 firebase-admin import | 0 | PASS |
| R4 | UI/component process.env (비-NEXT_PUBLIC) 직접 접근 | 0 | PASS |
| R5 | `*.domain.ts` react/next 의존 | 0 | PASS |

## R1 — domain → `firebase/*` direct import (ERROR)

**화이트리스트** (R1_KNOWN_EXEMPT):
- `lib/post/image-upload.ts` — Sprint 11 lib/firebase/storage 어댑터 이전 예정 (carry)
- `lib/chat/image-upload.ts` — Sprint 11 lib/firebase/storage 어댑터 이전 예정 (carry)
- `lib/chat/send-message.ts` — RTDB client SDK direct (Sprint 11 lib/firebase/rtdb-client 추출 검토)
- `lib/chat/use-channel.ts` — RTDB client SDK direct (Sprint 11 lib/firebase/rtdb-client 추출 검토)

### R1 위반 (화이트리스트 제외)

PASS — 위반 0건.

### R2 — server 모듈 server-only 누락

PASS — 위반 0건.

### R3 — Client Component + firebase-admin

PASS — 위반 0건.

## R4 — UI/Component env 직접 접근 (WARN)

### R4 위반

PASS — 위반 0건.

## R5 — domain 순수성 (WARN)

`*.domain.ts` 패턴이 도입된 도메인 모듈은 React/Next 의존 0이어야 함. 현재 미도입.

### R5 위반

PASS — 위반 0건.

---

## Carry Items

- **Sprint 11**: lib/firebase/storage.ts 어댑터 신설 → lib/post/image-upload.ts, lib/chat/image-upload.ts에서 사용 → R1_KNOWN_EXEMPT 항목 제거
- **Sprint 11**: lib/firebase/rtdb-client.ts 추출 → lib/chat/send-message.ts, lib/chat/use-channel.ts에서 사용 → R1_KNOWN_EXEMPT 항목 제거
- **Sprint 11 검토**: *.domain.ts 패턴 도입 여부 (현재 도메인 모듈은 Server Action과 도메인 로직이 한 파일에 혼재되어 있음)
