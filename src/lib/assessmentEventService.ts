/**
 * Firestore persistence layer for 14D Assessment Events.
 *
 * An "assessment event" is one named round of the 14-Dimension multilateral
 * assessment for a school (e.g. "14D Assessment - Term 1 2026"). Multiple
 * events can exist for the same school over time; each holds its own
 * cumulative respondent responses, and lock state is a real Firestore field
 * so it survives navigation, logout, and login from another device.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getCountFromServer,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { AssessmentConfiguration } from './multiUserAssessment';

const ASSESSMENTS_COLLECTION = 'assessments';

export interface AssessmentEventSummary {
  id: string;
  eventName: string;
  schoolId: string;
  schoolName: string;
  status: 'active' | 'locked' | 'analyzed';
  totalExpected: number;
  totalActual: number;
  createdAt: Date | null;
  lockedAt: Date | null;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

// Legacy docs created before this field existed were written with status: 'Active'
function normalizeStatus(raw: unknown): 'active' | 'locked' | 'analyzed' {
  const value = String(raw || '').toLowerCase();
  if (value === 'locked' || value === 'analyzed') return value;
  return 'active';
}

/**
 * Persist a newly-created assessment event to Firestore.
 */
export async function createAssessmentEventDoc(config: AssessmentConfiguration): Promise<void> {
  const assessmentRef = doc(db, ASSESSMENTS_COLLECTION, config.id);
  await setDoc(assessmentRef, {
    id: config.id,
    schoolId: config.schoolId,
    schoolName: config.schoolName,
    eventName: config.eventName,
    expectedRespondents: config.expectedRespondents,
    totalExpected: config.totalExpected,
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser?.email || null,
    status: 'active',
  });
}

/**
 * List every assessment event ever created for a school, newest first, each
 * with a real cumulative respondent count read straight from Firestore -
 * so past events and their numbers never disappear on reload or re-login.
 */
export async function listAssessmentEventsForSchool(schoolId: string): Promise<AssessmentEventSummary[]> {
  const eventsQuery = query(
    collection(db, ASSESSMENTS_COLLECTION),
    where('schoolId', '==', schoolId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(eventsQuery);

  return Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      let totalActual = 0;
      try {
        const countSnap = await getCountFromServer(collection(db, ASSESSMENTS_COLLECTION, docSnap.id, 'responses'));
        totalActual = countSnap.data().count;
      } catch (err) {
        console.error(`Failed to count responses for event ${docSnap.id}:`, err);
      }

      return {
        id: docSnap.id,
        eventName: data.eventName || 'Untitled Assessment',
        schoolId: data.schoolId,
        schoolName: data.schoolName,
        status: normalizeStatus(data.status),
        totalExpected: data.totalExpected || 0,
        totalActual,
        createdAt: toDate(data.createdAt),
        lockedAt: toDate(data.lockedAt),
      };
    })
  );
}

/**
 * Load a single assessment event and reconstruct its configuration, including
 * persisted lock state, for the Response Tracker dashboard.
 */
export async function getAssessmentEvent(eventId: string): Promise<{
  config: AssessmentConfiguration;
  isLocked: boolean;
  lockedAt: Date | null;
  lockedBy: string | null;
} | null> {
  const snap = await getDoc(doc(db, ASSESSMENTS_COLLECTION, eventId));
  if (!snap.exists()) return null;
  const data = snap.data();
  const status = normalizeStatus(data.status);

  const config: AssessmentConfiguration = {
    id: snap.id,
    schoolId: data.schoolId,
    schoolName: data.schoolName,
    eventName: data.eventName || 'Untitled Assessment',
    assessmentType: '14d-multilateral',
    createdAt: toDate(data.createdAt) || new Date(),
    expectedRespondents: data.expectedRespondents || { teacher: 0, parent: 0, student: 0, admin: 0, other: 0 },
    totalExpected: data.totalExpected || 0,
    status,
    configuredAt: toDate(data.createdAt) || new Date(),
    lockedAt: toDate(data.lockedAt) || undefined,
  };

  return {
    config,
    isLocked: status === 'locked' || status === 'analyzed',
    lockedAt: toDate(data.lockedAt),
    lockedBy: data.lockedBy || null,
  };
}

/**
 * Lock an event: persisted in Firestore so it survives reload/logout, and
 * blocks further stakeholder submissions for this event.
 */
export async function lockAssessmentEventDoc(eventId: string): Promise<Date> {
  const lockedBy = auth.currentUser?.email || 'admin';
  await updateDoc(doc(db, ASSESSMENTS_COLLECTION, eventId), {
    status: 'locked',
    lockedAt: serverTimestamp(),
    lockedBy,
  });
  return new Date();
}

/**
 * Unlock an event to allow more responses.
 */
export async function unlockAssessmentEventDoc(eventId: string): Promise<void> {
  await updateDoc(doc(db, ASSESSMENTS_COLLECTION, eventId), {
    status: 'active',
    lockedAt: null,
    lockedBy: null,
  });
}

/**
 * Mark an event as analyzed once its diagnostic report has been generated.
 */
export async function markAssessmentEventAnalyzed(eventId: string): Promise<void> {
  await updateDoc(doc(db, ASSESSMENTS_COLLECTION, eventId), {
    status: 'analyzed',
    analyzedAt: serverTimestamp(),
  });
}

/**
 * Lightweight check used by the public survey form to confirm an event is
 * still open before accepting a submission.
 */
export async function isAssessmentEventOpen(eventId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, ASSESSMENTS_COLLECTION, eventId));
  if (!snap.exists()) return false;
  return normalizeStatus(snap.data().status) === 'active';
}
