/**
 * GA4 이벤트 이름 타입 — 12개 정의 (MVP 9개 활성 + V1+ 3개 stub)
 * 출처: design.md §6 GA4 12개 이벤트 명세
 * 주의: 이 타입은 lib/firebase/analytics.ts의 logEvent 함수 시그니처와 1:1 일치해야 함
 */

export type GA4EventName =
  // ─── v1 활성 9개 (carry-over) ───
  | 'page_view'              // 모든 페이지 진입 (Firebase Analytics 자동 발화)
  | 'coupon_copy'            // 쿠폰 클릭 복사 + Firestore 백업 (v2에서 폐기 — 호환 유지)
  | 'class_diagnose_complete' // 직업 진단 완료 + Firestore 백업
  | 'meta_build_view'        // 검객 메타 빌드 페이지 dwell ≥5s + Firestore 백업
  | 'jinryeong_card_click'   // 진령 카드 클릭
  | 'tier_view'              // 진령 티어 리스트 스크롤 노출
  | 'external_link_click'    // 출처 외부 링크 클릭
  | 'scroll_depth_75'        // 75% 스크롤 도달
  | 'dwell_60'               // 60초 이상 체류
  // ─── v2 신규 8개 ───
  | 'login'                  // Google/Kakao 로그인 성공 (V1에서 STUB → ACTIVE)
  | 'register_complete'      // 등록 폼 완료 (PIPA 4 동의 + 5필드)
  | 'chat_send'              // 채팅 메시지 전송 (마스킹 후)
  | 'chat_image_upload'      // 채팅 이미지 첨부 업로드 (압축 후)
  | 'chat_report'            // 채팅 메시지 신고
  | 'bookmark_add'           // 북마크 추가
  | 'bookmark_remove'        // 북마크 제거
  | 'wiki_card_click'        // 위키 카드 클릭 (V1에서 STUB → ACTIVE)
  // ─── V1 신규 6개 (UGC) ───
  | 'post_create'            // 게시물 작성 완료
  | 'post_view'              // 게시물 상세 진입 (디바운스)
  | 'post_like'              // 게시물 좋아요 토글 ON
  | 'comment_create'         // 댓글 작성 완료
  | 'comment_like'           // 댓글 좋아요 토글 ON
  | 'penalty_applied'        // 페널티 자동 적용 (admin view 트래커)
  // ─── V2+ stub ───
  | 'build_create'           // (V1 post_create로 통합 — 호환 유지)
  | 'build_like'             // (V1 post_like로 통합 — 호환 유지)
  | 'signup'                 // (v1 호환 — v2부터 register_complete)
  | 'ad_impression'          // AdSense impression (자동 — AdSense ↔ GA4 연동)
  | 'ad_click'               // AdSense click
  // ─── V2 신규 (Sprint V2 P3.B-P3.F) ───
  | 'simulator_run'          // F3.1 시뮬레이션 3선 완료 + 결과 기록
  | 'simulator_save_build'   // F3.1 결과 → 게시물 작성으로 이동
  | 'coupon_submit'          // F3.4 쿠폰 제보
  | 'coupon_verify'          // F3.4 운영자 승인
  | 'pain_topic_click'       // F3.5 admin 인사이트 패널 클릭
  | 'locale_switch'          // F3.7 언어 변경
  | 'premium_subscribe'      // F3.6 구독 시작
  | 'premium_cancel';        // F3.6 구독 취소

/** Firestore 백업 대상 이벤트 3개 (전체 12개 이벤트 중) */
export const CORE_BACKUP_EVENTS = ['coupon_copy', 'class_diagnose_complete', 'meta_build_view'] as const;

export type CoreBackupEvent = (typeof CORE_BACKUP_EVENTS)[number];

export function isCoreBackupEvent(name: GA4EventName): name is CoreBackupEvent {
  return (CORE_BACKUP_EVENTS as readonly string[]).includes(name);
}

/** GA4 이벤트 파라미터 타입 (이벤트별 필드) */
export interface GA4EventParams {
  coupon_copy: {
    code: string;
    status: 'valid' | 'expired' | 'unknown';
    days_to_expire?: number;
  };
  class_diagnose_complete: {
    result_class: 'warrior' | 'swordsman' | 'medium';
    answer_count: number;
  };
  meta_build_view: {
    class: 'warrior' | 'swordsman' | 'medium';
    build_id: string;
    dwell_seconds?: number;
  };
  jinryeong_card_click: {
    jinryeong_id: string;
    jinryeong_name: string;
    tier: 0 | 1 | 2;
  };
  tier_view: Record<string, never>;
  external_link_click: {
    url: string;
    source: string;
  };
  scroll_depth_75: {
    page: string;
  };
  dwell_60: {
    page: string;
    dwell_seconds: number;
  };
  build_create: {
    build_id: string;
    class: 'warrior' | 'swordsman' | 'medium';
  };
  build_like: {
    build_id: string;
  };
  signup: {
    method: 'google' | 'kakao';
  };
  page_view: {
    page_title?: string;
    page_location?: string;
    page_path?: string;
  };
  login: {
    method: 'google' | 'kakao';
  };
  register_complete: {
    class_id: 'warrior' | 'swordsman' | 'medium';
    server_id: string;
    analytics_consent: boolean;
  };
  chat_send: {
    channel_kind: 'global' | 'server' | 'munpa';
    has_image: boolean;
    masked_count: number;
  };
  chat_image_upload: {
    channel_kind: 'global' | 'server' | 'munpa';
    compressed_size_kb: number;
  };
  chat_report: {
    channel_kind: 'global' | 'server' | 'munpa';
    /** ReportReason의 comma-join (GA4 primitive 제약) */
    reasons: string;
    auto_hidden: boolean;
  };
  bookmark_add: {
    target_type: string;
    target_id: string;
  };
  bookmark_remove: {
    target_type: string;
    target_id: string;
  };
  wiki_card_click: {
    category: 'class' | 'jinryeong' | 'skill' | 'equipment' | 'content' | 'munpa';
    target_id: string;
  };
  // ─── V1 신규 6 ───
  post_create: {
    category: 'build' | 'guide' | 'review';
    tags_count: number;
    has_image: boolean;
    body_length: number;
  };
  post_view: {
    post_id: string;
    category: 'build' | 'guide' | 'review';
  };
  post_like: {
    post_id: string;
    category: 'build' | 'guide' | 'review';
  };
  comment_create: {
    post_id: string;
    has_parent: boolean;
    body_length: number;
  };
  comment_like: {
    comment_id: string;
    post_id: string;
  };
  penalty_applied: {
    target_uid: string;
    level: 'warning' | 'ban_7d' | 'ban_permanent';
    trigger: 'auto_threshold' | 'manual_admin';
  };
  ad_impression: {
    slot: 'sticky' | 'infeed';
  };
  ad_click: {
    slot: 'sticky' | 'infeed';
  };
}
