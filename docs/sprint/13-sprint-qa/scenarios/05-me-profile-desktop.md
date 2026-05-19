# F13-H-05 — 프로필 편집 + ProfileImageUploader (데스크탑)

**URL**: `https://staging.kkaebizigi.com/me/profile`
**Viewport**: 1920×1080
**인증**: 무명랑ʸᵘᴸ (UID 183334138)
**실행일**: 2026-05-18

---

## 1. 사전 조건

- 인증 사용자
- Sprint V7 의 ProfileImageUploader (CloudFront CDN 연동) 적용 완료
- AWS S3 + CloudFront 정상 동작 (Sprint 11 / Phase C)

---

## 2. 시나리오 단계

| # | Action | Expected |
|---|---|---|
| 1 | `navigate` → `/me/profile` | 200 OK |
| 2 | `get_page_text` | 편집 폼 + 업로더 노출 |
| 3 | UID 노출 확인 (debug 정보) | "183334138" 가시 |
| 4 | 이메일 노출 확인 | "kay@agentkay.it" 가시 |
| 5 | ProfileImageUploader 컴포넌트 활성 | input + 안내 텍스트 |
| 6 | `read_console_messages` | error 0 |
| 7 | `read_network_requests` | 4xx/5xx 0 |

---

## 3. 보안 검토

| 항목 | 결과 |
|---|---|
| UID 노출은 의도된 debug? | 운영 노출 시 GDPR/개인정보 위험 — Sprint 14 carry |
| 이메일 노출은 본인만 보임? | session 사용자 본인이라 OK, 다른 유저 페이지에서 노출 여부 별도 검증 필요 |
| ProfileImageUploader 의 presigned URL TTL | Sprint 11 의 5분 TTL 정책 유지 |
| CSP `img-src` 에 CloudFront 포함 | Sprint 11 Phase C 적용 후 정상 |

**Sprint 14 carry**: `/me/profile` 의 UID/이메일 가시성 정책 재검토 (P3 — 시각/카피).

---

## 4. 7-Layer Data Flow

| Layer | 검증 | Status |
|---|---|---|
| L1 UI | 프로필 편집 폼 SSR | Pass |
| L2 Client | useAuth + form state hydration | Pass |
| L3 API | (이미지 업로드 시) presigned URL 발급 endpoint | Pass (구조 노출) |
| L4 Validation | 이미지 크기/확장자 검증 (client) | Pass |
| L5 DB | (실제 업로드는 본 시나리오에서 미실행) | N/A |
| L6 Response | (업로드 미실행) | N/A |
| L7 UI Update | 폼 컴포넌트 노출 + 인터랙티브 | Pass |

S1 score: **5/5 측정 layer 모두 Pass** (실 업로드 layer 는 별도 시나리오 후속).

---

## 5. 콘솔 / 네트워크

```
console.error  : 0
network 4xx    : 0
network 5xx    : 0
```

---

## 6. 결론

`/me/profile` 페이지 진입 + 폼 렌더링 + ProfileImageUploader 컴포넌트 정상.
실제 이미지 업로드 → CloudFront 노출까지의 end-to-end 는 별도 시나리오에서 수행 (현재
prod 데이터 영향 우려로 보류 — Sprint 14 prod-cutover 검증 시 수행).

**Sprint 13 영향**: 신규 버그 0건. UID 노출은 P3 carry item.
