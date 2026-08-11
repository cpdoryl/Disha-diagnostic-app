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
      const schoolsList: School[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        schoolsList.push({
          id: docSnap.id,
          name: data.name || '',
          city: data.city || '',
          board: data.board || '',
          tier: data.tier || '',
          feeBand: data.feeBand || '',
          studentCount: data.studentCount || '',
          principalName: data.principalName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || '',
        });
      });
      onData(schoolsList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, SCHOOLS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetch all registered schools once
 */
export async function fetchSchoolsFromFirestore(): Promise<School[]> {
  try {
    const snapshot = await getDocs(collection(db, SCHOOLS_COLLECTION));
    const schoolsList: School[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      schoolsList.push({
        id: docSnap.id,
        name: data.name || '',
        city: data.city || '',
        board: data.board || '',
        tier: data.tier || '',
        feeBand: data.feeBand || '',
        studentCount: data.studentCount || '',
        principalName: data.principalName || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
      });
    });
    return schoolsList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SCHOOLS_COLLECTION);
    return [];
  }
}

/**
 * Add or register a new actual school in Firestore
 */
export async function saveSchoolToFirestore(school: School): Promise<void> {
  const path = `${SCHOOLS_COLLECTION}/${school.id}`;
  try {
    const schoolDocRef = doc(db, SCHOOLS_COLLECTION, school.id);
    await setDoc(schoolDocRef, {
      id: school.id,
      name: school.name,
      nameLower: school.name.trim().toLowerCase(),
      city: school.city,
      board: school.board,
      tier: school.tier,
      feeBand: school.feeBand || '',
      studentCount: school.studentCount || '',
      principalName: school.principalName || '',
      contactEmail: school.contactEmail || '',
      contactPhone: school.contactPhone || '',
      address: school.address || '',
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Look up an existing school by (normalized) name so re-registering the same
 * school never creates a duplicate, orphaning past assessment data.
 */
export async function findSchoolByName(name: string): Promise<School | null> {
  const nameLower = name.trim().toLowerCase();
  if (!nameLower) return null;
  try {
    const q = query(collection(db, SCHOOLS_COLLECTION), where('nameLower', '==', nameLower), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || '',
      city: data.city || '',
      board: data.board || '',
      tier: data.tier || '',
      feeBand: data.feeBand || '',
      studentCount: data.studentCount || '',
      principalName: data.principalName || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      address: data.address || '',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${SCHOOLS_COLLECTION}?nameLower=${nameLower}`);
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
