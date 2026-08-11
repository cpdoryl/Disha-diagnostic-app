/**
 * Generates synthetic 14D survey responses for testing the respondent
 * dashboard, lock workflow, and downstream analysis without manually
 * filling out the public survey form dozens of times.
 *
 * Simulated docs are written through the exact same collection path a real
 * stakeholder submission uses, and are tagged isSimulated: true so they can
 * be told apart from real respondent data (and bulk-removed before an event
 * is used for a real school).
 */
import { collection, addDoc, deleteDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { FOURTEEN_DIMENSIONS } from '../data/14DimensionsQuestions';

export type StakeholderType = 'teacher' | 'parent' | 'student' | 'admin' | 'other';

const NAME_POOL: Record<StakeholderType, string[]> = {
  teacher: ['Priya Sharma', 'Rohan Mehta', 'Anita Desai', 'Vikram Rao', 'Sunita Iyer'],
  parent: ['Amit Kapoor', 'Neha Gupta', 'Rajesh Nair', 'Kavita Joshi', 'Sanjay Verma'],
  student: ['Aarav', 'Ishita', 'Kabir', 'Diya', 'Reyansh'],
  admin: ['Manoj Pillai', 'Ritu Bhatia', 'Deepak Menon', 'Sneha Kulkarni', 'Arjun Malhotra'],
  other: ['Test Respondent A', 'Test Respondent B', 'Test Respondent C'],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Skewed toward 3-5 so simulated data resembles realistic survey responses
// rather than uniform noise.
function randomScore(): number {
  const weighted = [2, 3, 3, 4, 4, 4, 5, 5];
  return pick(weighted);
}

function buildRandomResponses(): Record<string, Record<string, number>> {
  const responses: Record<string, Record<string, number>> = {};
  for (const dimension of FOURTEEN_DIMENSIONS) {
    responses[dimension.id] = {};
    for (const question of dimension.questions) {
      responses[dimension.id][question.id] = randomScore();
    }
  }
  return responses;
}

function buildRespondentFields(type: StakeholderType, index: number): Record<string, any> {
  const name = `${pick(NAME_POOL[type])} (Test ${index + 1})`;
  const base: Record<string, any> = {
    respondentName: name,
    respondentDepartment: type === 'student' ? `Grade ${8 + (index % 5)}` : 'Test Data',
  };

  switch (type) {
    case 'teacher':
      return {
        ...base,
        respondentEmail: `test.teacher${index + 1}@example.com`,
        respondentPhone: '9999900000',
        respondentSubject: 'Test Subject',
        respondentClass: `Grade ${9 + (index % 3)}`,
        respondentTeacherId: `SIM-T${index + 1}`,
      };
    case 'parent':
      return {
        ...base,
        respondentEmail: `test.parent${index + 1}@example.com`,
        respondentPhone: '9999900000',
        respondentStudentName: `Test Student ${index + 1}`,
        respondentStudentClass: `Grade ${8 + (index % 5)}`,
        respondentStudentSection: 'A',
      };
    case 'admin':
      return {
        ...base,
        respondentEmail: `test.admin${index + 1}@example.com`,
        respondentPhone: '9999900000',
        respondentAdminId: `SIM-A${index + 1}`,
      };
    default:
      return base;
  }
}

/**
 * Write `count` synthetic responses for a given stakeholder type into an
 * assessment event's responses subcollection.
 */
export async function simulateResponses(
  assessmentId: string,
  stakeholderType: StakeholderType,
  count: number
): Promise<number> {
  const responsesRef = collection(db, 'assessments', assessmentId, 'responses');
  let written = 0;

  for (let i = 0; i < count; i++) {
    const submissionData = {
      assessmentId,
      stakeholderType,
      responses: buildRandomResponses(),
      submittedAt: serverTimestamp(),
      submittedTimestamp: new Date().toISOString(),
      isSimulated: true,
      ...buildRespondentFields(stakeholderType, i),
    };

    // eslint-disable-next-line no-await-in-loop
    await addDoc(responsesRef, submissionData);
    written++;
  }

  return written;
}

/**
 * Remove every simulated response for an assessment event, so test data
 * never lingers into a real analysis run. Real (isSimulated !== true)
 * responses are untouched.
 */
export async function clearSimulatedResponses(assessmentId: string): Promise<number> {
  const responsesRef = collection(db, 'assessments', assessmentId, 'responses');
  const simulatedQuery = query(responsesRef, where('isSimulated', '==', true));
  const snapshot = await getDocs(simulatedQuery);

  let deleted = 0;
  for (const docSnap of snapshot.docs) {
    // eslint-disable-next-line no-await-in-loop
    await deleteDoc(docSnap.ref);
    deleted++;
  }

  return deleted;
}
