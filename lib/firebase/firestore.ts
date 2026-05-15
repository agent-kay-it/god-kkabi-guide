/**
 * Firestore 클라이언트 싱글톤.
 * design.md §5 6개 컬렉션 접근 게이트.
 */
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebaseApp } from './client';

let firestoreInstance: Firestore | null = null;

export function getFirestoreClient(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  firestoreInstance = getFirestore(getFirebaseApp());
  return firestoreInstance;
}
