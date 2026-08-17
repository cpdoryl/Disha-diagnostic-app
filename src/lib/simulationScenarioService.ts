/**
 * Firestore persistence for the Simulate page's chosen target scenario -
 * the desired overall objective score plus whatever per-dimension targets
 * the user ended up with (auto-suggested by the cascade, then possibly
 * hand-edited). Lives at assessments/{eventId}/simulationScenario/current,
 * a sibling of objectiveData/{dimensionId} and costRates/{dimensionId} -
 * already covered by the existing open `assessments/{document=**}` rule,
 * no rules changes needed.
 *
 * Only one scenario is kept per event (saving overwrites the previous
 * one) - this is meant to be "where we last left the plan for this
 * assessment", not a library of alternate what-ifs.
 */
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

function scenarioDocRef(eventId: string) {
  return doc(db, 'assessments', eventId, 'simulationScenario', 'current');
}

export interface SimulationScenario {
  desiredOverall: number;
  dimensionTargets: Record<string, number>;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export async function loadSimulationScenario(eventId: string): Promise<SimulationScenario | null> {
  const snap = await getDoc(scenarioDocRef(eventId));
  if (!snap.exists()) return null;
  const data = snap.data();
  const desiredOverall = data.desiredOverall;
  if (typeof desiredOverall !== 'number') return null;
  const dimensionTargets: Record<string, number> = {};
  const rawTargets = (data.dimensionTargets || {}) as Record<string, number>;
  for (const [dimensionId, value] of Object.entries(rawTargets)) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      dimensionTargets[dimensionId] = value;
    }
  }
  return {
    desiredOverall,
    dimensionTargets,
    updatedAt: toDate(data.updatedAt),
    updatedBy: data.updatedBy || null,
  };
}

export async function saveSimulationScenario(
  eventId: string,
  desiredOverall: number,
  dimensionTargets: Record<string, number>
): Promise<void> {
  const updatedBy = auth.currentUser?.email || null;
  await setDoc(scenarioDocRef(eventId), {
    eventId,
    desiredOverall,
    dimensionTargets,
    updatedAt: serverTimestamp(),
    updatedBy,
  });
}
