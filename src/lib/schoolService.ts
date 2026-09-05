import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, limit } from 'firebase/firestore';
import { db, auth } from './firebase';
import { School } from '../types';

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const SCHOOLS_COLLECTION = 'schools';

/**
 * Real-time listener for school registrations from Firestore
 */
export function subscribeToSchools(onData: (schools: School[]) => void, onError?: (err: any) => void) {
  const colRef = collection(db, SCHOOLS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      onData(snapshot.docs.map(schoolFromDoc));
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, SCHOOLS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

function schoolFromDoc(docSnap: { id: string; data: () => any }): School {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || '',
    schoolCode: data.schoolCode || '',
    city: data.city || '',
    state: data.state || '',
    board: data.board || '',
    schoolType: data.schoolType || '',
    tier: data.tier || '',
    feeBand: data.feeBand || '',
    studentCount: data.studentCount || '',
    principalName: data.principalName || '',
    contactEmail: data.contactEmail || '',
    contactPhone: data.contactPhone || '',
    address: data.address || '',
    ownerId: data.ownerId || undefined,
  };
}

/**
 * Fetch every registered school, regardless of who created it. Only the
 * Admin console's School Management tab should call this - anything a
 * regular (non-admin) user sees must go through fetchOwnSchoolsFromFirestore
 * instead, or every user would see every other user's schools.
 */
export async function fetchSchoolsFromFirestore(): Promise<School[]> {
  try {
    const snapshot = await getDocs(collection(db, SCHOOLS_COLLECTION));
    return snapshot.docs.map(schoolFromDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SCHOOLS_COLLECTION);
    return [];
  }
}

/**
 * Fetch only the schools a given user created themselves (ownerId ==
 * their uid). This is what a regular user's sidebar/switcher should be
 * populated from - schools registered before ownerId existed won't match
 * any uid and so won't appear for anyone via this path (they still show up
 * for admins via fetchSchoolsFromFirestore).
 */
export async function fetchOwnSchoolsFromFirestore(ownerId: string): Promise<School[]> {
  if (!ownerId) return [];
  try {
    const q = query(collection(db, SCHOOLS_COLLECTION), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(schoolFromDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `${SCHOOLS_COLLECTION}?ownerId=${ownerId}`);
    return [];
  }
}

/**
 * Add or register a new actual school in Firestore. `ownerId` should only
 * ever be passed when creating a brand-new school (see addSchool in
 * store.ts) - omitting it on a later edit leaves the original owner intact
 * since this write uses { merge: true }.
 */
export async function saveSchoolToFirestore(school: School, ownerId?: string): Promise<void> {
  const path = `${SCHOOLS_COLLECTION}/${school.id}`;
  try {
    const schoolDocRef = doc(db, SCHOOLS_COLLECTION, school.id);
    await setDoc(schoolDocRef, {
      id: school.id,
      name: school.name,
      nameLower: school.name.trim().toLowerCase(),
      schoolCode: school.schoolCode || '',
      city: school.city,
      state: school.state || '',
      board: school.board,
      schoolType: school.schoolType || '',
      tier: school.tier,
      feeBand: school.feeBand || '',
      studentCount: school.studentCount || '',
      principalName: school.principalName || '',
      contactEmail: school.contactEmail || '',
      contactPhone: school.contactPhone || '',
      address: school.address || '',
      createdAt: new Date().toISOString(),
      ...(ownerId ? { ownerId } : {}),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Look up an existing school by (normalized) name, scoped to schools the
 * given user owns themselves, so re-registering the same name never
 * creates a duplicate FOR THAT USER - but also never matches (and silently
 * reuses) a different user's same-named school.
 */
export async function findSchoolByName(name: string, ownerId: string): Promise<School | null> {
  const nameLower = name.trim().toLowerCase();
  if (!nameLower || !ownerId) return null;
  try {
    const q = query(
      collection(db, SCHOOLS_COLLECTION),
      where('nameLower', '==', nameLower),
      where('ownerId', '==', ownerId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return schoolFromDoc(snapshot.docs[0]);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${SCHOOLS_COLLECTION}?nameLower=${nameLower}&ownerId=${ownerId}`);
    return null;
  }
}

/**
 * Delete a school registration record from Firestore
 */
export async function deleteSchoolFromFirestore(schoolId: string): Promise<void> {
  const path = `${SCHOOLS_COLLECTION}/${schoolId}`;
  try {
    await deleteDoc(doc(db, SCHOOLS_COLLECTION, schoolId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
