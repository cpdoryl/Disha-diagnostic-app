/**
 * Phase 5: Metrics Service
 * Firestore operations for reality metrics
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  FieldValue,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MetricValue, RealityMetricEntry } from './types';

// ============================================================================
// METRIC SUBMISSION
// ============================================================================

/**
 * Submit or update a batch of metrics for a dimension
 */
export const submitDimensionMetrics = async (
  schoolId: string,
  cycleId: string,
  dimensionId: number,
  metrics: Record<string, Omit<MetricValue, 'submittedAt'>>,
  submittedBy: string
): Promise<string> => {
  try {
    const metricsArray: MetricValue[] = Object.entries(metrics).map(([metricId, data]) => ({
      ...data,
      metricId,
      dimensionId,
      submittedBy,
      submittedAt: new Date(),
      isVerified: data.isVerified || false,
    }));

    const realityMetricsRef = collection(
      db,
      'schools',
      schoolId,
      'assessmentCycles',
      cycleId,
      'realityMetrics'
    );

    // Check if metrics for this dimension already exist
    const q = query(realityMetricsRef, where('dimensionId', '==', dimensionId));
    const snapshot = await getDocs(q);

    let docId: string;

    if (snapshot.empty) {
      // Create new document for dimension
      const docRef = await addDoc(realityMetricsRef, {
        dimensionId,
        metrics: metricsArray,
        lastUpdatedAt: serverTimestamp(),
        submittedBy,
        dataAuditFlags: [],
      });
      docId = docRef.id;
    } else {
      // Update existing document
      const existingDoc = snapshot.docs[0];
      docId = existingDoc.id;

      // Merge with existing metrics
      const existingMetrics = existingDoc.data().metrics || [];
      const updatedMetrics = mergeMetrics(existingMetrics, metricsArray);

      await updateDoc(doc(realityMetricsRef, docId), {
        metrics: updatedMetrics,
        lastUpdatedAt: serverTimestamp(),
        submittedBy,
      });
    }

    console.log('Metrics submitted:', docId);
    return docId;
  } catch (error) {
    console.error('Error submitting metrics:', error);
    throw error;
  }
};

/**
 * Merge new metrics with existing ones (prefer new values)
 */
const mergeMetrics = (existing: MetricValue[], updated: MetricValue[]): MetricValue[] => {
  const merged = [...existing];
  const metricIds = updated.map((m) => m.metricId);

  // Remove old values for metrics being updated
  const filtered = merged.filter((m) => !metricIds.includes(m.metricId));

  // Add new values
  return [...filtered, ...updated].sort((a, b) => a.metricId.localeCompare(b.metricId));
};

// ============================================================================
// METRIC RETRIEVAL
// ============================================================================

/**
 * Get all metrics for a cycle
 */
export const getCycleMetrics = async (schoolId: string, cycleId: string) => {
  try {
    const realityMetricsRef = collection(
      db,
      'schools',
      schoolId,
      'assessmentCycles',
      cycleId,
      'realityMetrics'
    );
    const q = query(realityMetricsRef, orderBy('dimensionId', 'asc'));

    const snapshot = await getDocs(q);
    const results: (RealityMetricEntry & { id: string })[] = [];

    snapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...(doc.data() as RealityMetricEntry),
      });
    });

    return results;
  } catch (error) {
    console.error('Error fetching cycle metrics:', error);
    throw error;
  }
};

/**
 * Get metrics for specific dimension
 */
export const getDimensionMetrics = async (
  schoolId: string,
  cycleId: string,
  dimensionId: number
) => {
  try {
    const realityMetricsRef = collection(
      db,
      'schools',
      schoolId,
      'assessmentCycles',
      cycleId,
      'realityMetrics'
    );
    const q = query(realityMetricsRef, where('dimensionId', '==', dimensionId));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        dimensionId,
        metrics: [],
        lastUpdatedAt: null,
      };
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as RealityMetricEntry),
    };
  } catch (error) {
    console.error('Error fetching dimension metrics:', error);
    throw error;
  }
};

/**
 * Get single metric value
 */
export const getMetricValue = async (
  schoolId: string,
  cycleId: string,
  metricId: string
): Promise<MetricValue | null> => {
  try {
    const allMetrics = await getCycleMetrics(schoolId, cycleId);

    for (const entry of allMetrics) {
      const metric = entry.metrics.find((m) => m.metricId === metricId);
      if (metric) {
        return metric;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching metric value:', error);
    throw error;
  }
};

// ============================================================================
// DATA QUALITY & AUDIT
// ============================================================================

/**
 * Check for outliers in metrics
 */
export const checkForOutliers = (metrics: MetricValue[]): string[] => {
  const flags: string[] = [];
  const numericMetrics = metrics.filter((m) => typeof m.value === 'number' && m.value !== 0);

  if (numericMetrics.length < 3) {
    return flags; // Not enough data for statistical analysis
  }

  const values = numericMetrics.map((m) => m.value as number);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Flag values > 3 standard deviations from mean
  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > 3) {
      flags.push(
        `Metric ${numericMetrics[index].metricId} has outlier value: ${value} (${zScore.toFixed(1)}σ)`
      );
    }
  });

  return flags;
};

/**
 * Calculate data quality score
 */
export const calculateDataQualityScore = (
  metrics: MetricValue[]
): { score: number; level: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' } => {
  let score = 0;

  // Full data (all metrics have values)
  const filledCount = metrics.filter((m) => m.value !== undefined && m.value !== '').length;
  const completeness = (filledCount / Math.max(metrics.length, 1)) * 25;
  score += completeness;

  // Verification (metrics verified by admin)
  const verifiedCount = metrics.filter((m) => m.isVerified).length;
  const verification = (verifiedCount / Math.max(metrics.length, 1)) * 25;
  score += verification;

  // Data source quality
  const sourceQuality = metrics.reduce((total, m) => {
    const sourceScores: Record<string, number> = {
      API: 25,
      LMS: 20,
      EXCEL: 18,
      MANUAL: 10,
      FALLBACK: 5,
    };
    return total + (sourceScores[m.dataSource] || 0);
  }, 0);
  score += sourceQuality / metrics.length;

  // Recency (recent data preferred)
  const now = new Date().getTime();
  const recencyScores = metrics.map((m) => {
    const age = now - new Date(m.submittedAt).getTime();
    const daysOld = age / (1000 * 60 * 60 * 24);

    if (daysOld <= 7) return 25;
    if (daysOld <= 30) return 20;
    if (daysOld <= 90) return 10;
    return 0;
  });
  score += recencyScores.reduce((a, b) => a + b, 0) / recencyScores.length;

  // Normalize to 0-100
  score = Math.min(100, Math.max(0, score));

  let level: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  if (score >= 80) level = 'EXCELLENT';
  else if (score >= 60) level = 'GOOD';
  else if (score >= 40) level = 'FAIR';
  else level = 'POOR';

  return { score: Math.round(score), level };
};

/**
 * Get data audit report for a cycle
 */
export const generateDataAuditReport = async (schoolId: string, cycleId: string) => {
  try {
    const allMetrics = await getCycleMetrics(schoolId, cycleId);

    const report = {
      schoolId,
      cycleId,
      generatedAt: new Date(),
      dimensionCoverage: [] as any[],
      dataQualityScore: 0,
      totalMetrics: 0,
      filledMetrics: 0,
      verifiedMetrics: 0,
      flags: [] as string[],
    };

    // Dimension-wise breakdown
    for (let i = 1; i <= 14; i++) {
      const dimMetrics = allMetrics.find((m) => m.dimensionId === i);
      const metrics = dimMetrics?.metrics || [];
      const filled = metrics.filter((m) => m.value !== undefined && m.value !== '').length;
      const verified = metrics.filter((m) => m.isVerified).length;

      report.dimensionCoverage.push({
        dimensionId: i,
        totalMetrics: metrics.length,
        filledMetrics: filled,
        verifiedMetrics: verified,
        coverage: Math.round((filled / Math.max(metrics.length, 1)) * 100),
      });

      report.totalMetrics += metrics.length;
      report.filledMetrics += filled;
      report.verifiedMetrics += verified;

      // Check for outliers
      const outliers = checkForOutliers(metrics);
      report.flags.push(...outliers);
    }

    // Calculate overall quality score
    const allMetricsFlat = allMetrics.flatMap((m) => m.metrics);
    const qualityResult = calculateDataQualityScore(allMetricsFlat);
    report.dataQualityScore = qualityResult.score;

    return report;
  } catch (error) {
    console.error('Error generating audit report:', error);
    throw error;
  }
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Mark all metrics for a dimension as verified
 */
export const verifyDimensionMetrics = async (
  schoolId: string,
  cycleId: string,
  dimensionId: number,
  verifiedBy: string
) => {
  try {
    const dimension = await getDimensionMetrics(schoolId, cycleId, dimensionId);

    if (!dimension || !dimension.id) {
      throw new Error('Dimension metrics not found');
    }

    const updatedMetrics = dimension.metrics.map((m) => ({
      ...m,
      isVerified: true,
    }));

    const realityMetricsRef = collection(
      db,
      'schools',
      schoolId,
      'assessmentCycles',
      cycleId,
      'realityMetrics'
    );

    await updateDoc(doc(realityMetricsRef, dimension.id), {
      metrics: updatedMetrics,
      verifiedAt: serverTimestamp(),
      verifiedBy,
    });

    console.log(`Dimension ${dimensionId} verified`);
  } catch (error) {
    console.error('Error verifying dimension metrics:', error);
    throw error;
  }
};

/**
 * Reset all metrics for a dimension (soft delete)
 */
export const resetDimensionMetrics = async (
  schoolId: string,
  cycleId: string,
  dimensionId: number
) => {
  try {
    const dimension = await getDimensionMetrics(schoolId, cycleId, dimensionId);

    if (!dimension || !dimension.id) {
      throw new Error('Dimension metrics not found');
    }

    const realityMetricsRef = collection(
      db,
      'schools',
      schoolId,
      'assessmentCycles',
      cycleId,
      'realityMetrics'
    );

    await updateDoc(doc(realityMetricsRef, dimension.id), {
      metrics: [],
      lastResetAt: serverTimestamp(),
    });

    console.log(`Dimension ${dimensionId} metrics reset`);
  } catch (error) {
    console.error('Error resetting dimension metrics:', error);
    throw error;
  }
};
