/**
 * Firestore persistence for per-metric cost rates entered by a school, used
 * by the Simulate page to turn a required metric change into an estimated
 * cost. Lives at assessments/{eventId}/costRates/{dimensionId}, a sibling
 * of objectiveData/{dimensionId} - already covered by the existing open
 * `assessments/{document=**}` rule, no rules changes needed.
 *
 * Every rate is the school's own entered figure, in ₹ per one unit of that
 * metric's own unit (e.g. ₹ per 1 percentage point of attendance, ₹ per 1
 * point of a ratio) - the platform never invents or infers a conversion
 * factor between a metric and a cost.
 */
import { collection, doc, getDocs, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

function costRateDocRef(eventId: string, dimensionId: string) {
  return doc(db, 'assessments', eventId, 'costRates', dimensionId);
}

export type CostRatesByDimension = Record<string, Record<string, number>>;

export async function loadCostRatesForEvent(eventId: string): Promise<CostRatesByDimension> {
  const snapshot = await getDocs(collection(db, 'assessments', eventId, 'costRates'));
  const result: CostRatesByDimension = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const rates: Record<string, number> = {};
    const rawRates = (data.rates || {}) as Record<string, number>;
    for (const [metricId, value] of Object.entries(rawRates)) {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        rates[metricId] = value;
      }
    }
    result[docSnap.id] = rates;
  });

  return result;
}

/**
 * Save/update a single metric's cost rate for a dimension. Merges into the
 * existing rate map for that dimension rather than overwriting it, so
 * saving one field doesn't drop rates already entered for other metrics in
 * the same dimension.
 */
export async function saveCostRate(
  eventId: string,
  dimensionId: string,
  metricId: string,
  rate: number
): Promise<void> {
  const updatedBy = auth.currentUser?.email || null;
  await setDoc(
    costRateDocRef(eventId, dimensionId),
    {
      dimensionId,
      eventId,
      rates: { [metricId]: rate },
      updatedAt: serverTimestamp(),
      updatedBy,
    },
    { merge: true }
  );
}
