/** Firebase 모듈 barrel — 외부에서는 본 파일을 통해서만 import (Ports & Adapters). */
export { getFirebaseApp } from './client';
export { getFirestoreClient } from './firestore';
export { getAnalyticsClient, logEvent, setAnalyticsConsent } from './analytics';
