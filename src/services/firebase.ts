import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Critical constraint: test connection on initialization
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline status check:', error.message);
    }
    return false;
  }
}

// Authentication helpers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Store Biometric Validation Record
export interface ValidationRecordData {
  id: string;
  userId: string;
  status: 'approved' | 'rejected' | 'flagged';
  fullName?: string;
  curp?: string;
  claveElector?: string;
  biometricMatchScore?: number;
  livenessScore?: number;
  quantumHash: string;
  latticeKeyId?: string;
  ineModel?: string;
  auditLogCount?: number;
  createdAt: string;
}

export async function saveValidationRecord(data: ValidationRecordData): Promise<void> {
  const collectionPath = 'validations';
  try {
    const docRef = doc(db, collectionPath, data.id);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${data.id}`);
  }
}

export async function getUserValidationRecords(userId: string): Promise<ValidationRecordData[]> {
  const collectionPath = 'validations';
  try {
    const q = query(
      collection(db, collectionPath),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    const records: ValidationRecordData[] = [];
    snap.forEach(d => {
      records.push(d.data() as ValidationRecordData);
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
    return [];
  }
}
