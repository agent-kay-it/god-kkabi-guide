/**
 * Firebase Analytics — SSR 가드 + 12 이벤트 표준 발화 래퍼.
 * 출처: docs/sprint/02-sprint-mvp/design.md §10.2.2
 *
 * 설계 결정 (D2):
 *  - 직접 gtag.js 미사용. Firebase Analytics SDK 통합 (measurementId G-PBS54YVK5F).
 *  - `isSupported()` 가드로 SSR / Safari Private / IE 등 비지원 환경 안전.
 *  - 3개 핵심 이벤트(coupon_copy / class_diagnose_complete / meta_build_view)는
 *    Firestore `events` 컬렉션에 백업.
 */
'use client';

import {
  getAnalytics,
  isSupported,
  logEvent as fbLogEvent,
  setUserProperties,
  type Analytics,
} from 'firebase/analytics';
import { isCoreBackupEvent, type GA4EventName } from '@/types/ga4';
import { getFirebaseApp, isFirebaseEmulator } from './client';

let analyticsInstance: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

/**
 * SSR 환경 + 비지원 브라우저(Safari Private mode, IE 등)를 모두 가드.
 * 첫 호출 시점에 자동 page_view 이벤트가 발화된다 (Firebase 기본 동작).
 *
 * Sprint 28 F28-B — emulator 모드 가드 추가:
 *   E2E 환경의 client SDK 는 demo API key (resolveFirebaseConfig() 의 'demo-api-key')
 *   로 초기화되는데 Analytics 가 이 dummy key 로 실제 Google API 호출 시도 →
 *   "400 INVALID_ARGUMENT: API key not valid" 121회 발생 + Firebase Installations
 *   까지 cascade 60회 추가 발생.
 *   emulator 모드에서는 Analytics 초기화 자체 차단 (page_view 추적도 불필요).
 */
export async function getAnalyticsClient(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (isFirebaseEmulator()) return null;
  if (analyticsInstance) return analyticsInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const supported = await isSupported();
    if (!supported) return null;
    analyticsInstance = getAnalytics(getFirebaseApp());
    return analyticsInstance;
  })();
  return initPromise;
}

/**
 * 표준 발화 래퍼 — 모든 페이지/컴포넌트는 이 함수만 호출.
 * Firestore 백업 대상 이벤트는 본 함수가 자동 분기.
 */
export async function logEvent(
  name: GA4EventName,
  params?: Record<string, string | number | boolean | null>,
): Promise<void> {
  const analytics = await getAnalyticsClient();
  if (analytics) {
    // Firebase logEvent의 specific-name 오버로드는 'page_view' 등 일부 표준 이벤트를
    // 포함하지 않으므로 string 오버로드를 사용 (런타임 안전 — 본 union으로 컴파일 보장).
    fbLogEvent(analytics, name as string, params ?? {});
  }

  if (isCoreBackupEvent(name)) {
    void backupToFirestore(name, params);
  }
}

/**
 * Firestore 백업 — `events` 컬렉션 anonymous create.
 * Firestore 보안 규칙: `allow create: if true; update/delete: false` (immutable).
 */
async function backupToFirestore(
  name: GA4EventName,
  params?: Record<string, string | number | boolean | null>,
): Promise<void> {
  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    const { getFirestoreClient } = await import('./firestore');
    const db = getFirestoreClient();
    await addDoc(collection(db, 'events'), {
      event_name: name,
      session_id: getSessionId(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      payload: params ?? {},
      timestamp: serverTimestamp(),
      user_agent_hash: typeof window !== 'undefined' ? hashUserAgent(navigator.userAgent) : '',
    });
  } catch (error) {
    // Firestore 백업 실패는 사용자 흐름을 막지 않는다 (GA4가 SSOT).
    console.warn('[analytics] Firestore backup failed:', error);
  }
}

/**
 * 세션 ID — sessionStorage 기반 (GA4 client_id 대용).
 * V1+ Firebase Auth 도입 시 uid로 보강.
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'gkg_session_id';
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

/** PIPA 대응 — UA는 해시만 저장 (raw 저장 금지) */
function hashUserAgent(ua: string): string {
  let hash = 0;
  for (let i = 0; i < ua.length; i++) {
    hash = (hash << 5) - hash + ua.charCodeAt(i);
    hash |= 0;
  }
  return `ua_${Math.abs(hash).toString(36)}`;
}

/**
 * PIPA 동의 설정 — V1 Auth + consent 화면 도입 시 호출.
 * MVP는 기본 동의 (운영자 디스클레이머로 고지).
 */
export async function setAnalyticsConsent(consent: { analytics: boolean }): Promise<void> {
  const analytics = await getAnalyticsClient();
  if (!analytics) return;
  setUserProperties(analytics, {
    consent_analytics: consent.analytics ? 'granted' : 'denied',
  });
}
