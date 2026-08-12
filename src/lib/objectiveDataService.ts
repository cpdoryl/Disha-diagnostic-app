/**
 * Firestore persistence for objective (operational) data captured per
 * 14D assessment event, at assessments/{eventId}/objectiveData/{dimensionId}.
 * Already covered by the existing open `assessments/{document=**}` rule -
 * no rules changes needed.
 */
import { collection, doc, getDoc, getDocs, setDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { getDimensionMetricSchema, ObjectiveDataSource } from '../data/objectiveMetricsSchema';
import { FOURTEEN_DIMENSIONS } from '../data/14DimensionsQuestions';
import { computeAllObjectiveScores, computeObjectiveCompletenessSummary, RawMetricEntry } from './objectiveScoreEngine';

export type { ObjectiveDataSource };

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export interface ObjectiveDataDoc {
  dimensionId: string;
  eventId: string;
  schoolId: string;
  metrics: Record<string, { value: number; source: ObjectiveDataSource; enteredBy: string | null }>;
  completeness: number;
  sourceFileName: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface RawObjectiveDataByDimension {
  [dimensionId: string]: {
    metrics: Record<string, RawMetricEntry>;
    completeness: number;
    updatedAt: Date | null;
    sourceFileName: string | null;
  };
}

function objectiveDataDocRef(eventId: string, dimensionId: string) {
  return doc(db, 'assessments', eventId, 'objectiveData', dimensionId);
}

function computeCompleteness(dimensionId: string, metricValues: Record<string, number>): number {
  const schema = getDimensionMetricSchema(dimensionId);
  if (!schema || schema.metrics.length === 0) return 0;
  const provided = schema.metrics.filter(
    (def) => metricValues[def.id] != null && !Number.isNaN(metricValues[def.id])
  ).length;
  return Math.round((provided / schema.metrics.length) * 100);
}

function buildMetricsPayload(
  metricValues: Record<string, number>,
  source: ObjectiveDataSource,
  enteredBy: string | null
): Record<string, { value: number; source: ObjectiveDataSource; enteredBy: string | null }> {
  const metrics: Record<string, { value: number; source: ObjectiveDataSource; enteredBy: string | null }> = {};
  for (const [metricId, value] of Object.entries(metricValues)) {
    metrics[metricId] = { value, source, enteredBy };
  }
  return metrics;
}

/**
 * Save/update the objective data captured for a single dimension, with a
 * source recorded per metric (not one blanket source for the whole save) -
 * so re-opening the entry form and saving without touching an
 * upload-sourced field doesn't silently reclassify it as manually entered.
 */
export async function saveDimensionObjectiveData(
  eventId: string,
  schoolId: string,
  dimensionId: string,
  metricValues: Record<string, { value: number; source: ObjectiveDataSource }>,
  meta: { sourceFileName?: string } = {}
): Promise<void> {
  const enteredBy = auth.currentUser?.email || null;
  const metrics: Record<string, { value: number; source: ObjectiveDataSource; enteredBy: string | null }> = {};
  const plainValues: Record<string, number> = {};
  for (const [metricId, entry] of Object.entries(metricValues)) {
    metrics[metricId] = { value: entry.value, source: entry.source, enteredBy };
    plainValues[metricId] = entry.value;
  }

  await setDoc(
    objectiveDataDocRef(eventId, dimensionId),
    {
      dimensionId,
      eventId,
      schoolId,
      metrics,
      completeness: computeCompleteness(dimensionId, plainValues),
      sourceFileName: meta.sourceFileName || null,
      updatedAt: serverTimestamp(),
      updatedBy: enteredBy,
    },
    { merge: true }
  );
}

/**
 * Batch-save objective data for several dimensions at once (used by the
 * upload-review flow, where one file typically prefills many dimensions).
 */
export async function saveMultipleDimensionsObjectiveData(
  eventId: string,
  schoolId: string,
  byDimension: Record<string, Record<string, number>>,
  meta: { source: ObjectiveDataSource; sourceFileName?: string }
): Promise<void> {
  const enteredBy = auth.currentUser?.email || null;
  const batch = writeBatch(db);

  for (const [dimensionId, metricValues] of Object.entries(byDimension)) {
    if (Object.keys(metricValues).length === 0) continue;
    batch.set(
      objectiveDataDocRef(eventId, dimensionId),
      {
        dimensionId,
        eventId,
        schoolId,
        metrics: buildMetricsPayload(metricValues, meta.source, enteredBy),
        completeness: computeCompleteness(dimensionId, metricValues),
        sourceFileName: meta.sourceFileName || null,
        updatedAt: serverTimestamp(),
        updatedBy: enteredBy,
      },
      { merge: true }
    );
  }

  await batch.commit();
}

/**
 * Load every dimension's objective data for an assessment event, keyed by
 * dimension id, as {value, source} entries ready for the scoring engine -
 * source is what lets the engine assign a real data-confidence tier instead
 * of a hardcoded one.
 */
export async function loadObjectiveDataForEvent(eventId: string): Promise<RawObjectiveDataByDimension> {
  const snapshot = await getDocs(collection(db, 'assessments', eventId, 'objectiveData'));
  const result: RawObjectiveDataByDimension = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const metrics: Record<string, RawMetricEntry> = {};
    const rawMetrics = (data.metrics || {}) as Record<string, { value: number; source?: ObjectiveDataSource }>;
    for (const [metricId, entry] of Object.entries(rawMetrics)) {
      if (typeof entry?.value === 'number') {
        metrics[metricId] = { value: entry.value, source: entry.source === 'upload' ? 'upload' : 'manual' };
      }
    }
    result[docSnap.id] = {
      metrics,
      completeness: data.completeness || 0,
      updatedAt: toDate(data.updatedAt),
      sourceFileName: data.sourceFileName || null,
    };
  });

  return result;
}

/**
 * Load a single dimension's objective data doc, including entry metadata.
 */
export async function loadDimensionObjectiveData(
  eventId: string,
  dimensionId: string
): Promise<ObjectiveDataDoc | null> {
  const snap = await getDoc(objectiveDataDocRef(eventId, dimensionId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    dimensionId,
    eventId,
    schoolId: data.schoolId,
    metrics: data.metrics || {},
    completeness: data.completeness || 0,
    sourceFileName: data.sourceFileName || null,
    updatedAt: toDate(data.updatedAt),
    updatedBy: data.updatedBy || null,
  };
}

export interface ObjectiveReadiness {
  isReady: boolean;
  completeness: number;
  missingByDimension: { dimensionId: string; dimensionName: string; missing: string[] }[];
}

/**
 * Whether an event has captured all *required* objective metrics for every
 * one of the 14 dimensions - the gate applied before a diagnostic report can
 * be generated. Optional metrics don't block readiness, only completeness %.
 */
export async function checkObjectiveDataReadiness(eventId: string): Promise<ObjectiveReadiness> {
  const raw = await loadObjectiveDataForEvent(eventId);
  const rawByDimension: Record<string, Record<string, RawMetricEntry | undefined>> = {};
  for (const [dimId, data] of Object.entries(raw)) {
    rawByDimension[dimId] = data.metrics;
  }
  const scores = computeAllObjectiveScores(rawByDimension);
  const summary = computeObjectiveCompletenessSummary(scores);

  const missingByDimension = FOURTEEN_DIMENSIONS.map((dim) => ({
    dimensionId: dim.id,
    dimensionName: dim.name,
    missing: summary.byDimension[dim.id]?.requiredMissing || [],
  })).filter((d) => d.missing.length > 0);

  return {
    isReady: missingByDimension.length === 0,
    completeness: summary.overallCompleteness,
    missingByDimension,
  };
}
