/**
 * 14-Dimension Diagnostic Framework v2 — Metric Calculation
 * Cloud Function: Calculate all metrics and scores for closed assessments
 * Phase 3: Cloud Functions & Analysis
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  aggregateRealityScore,
  aggregatePerceptionScore,
  calculateGap,
  calculateTrend,
  METRIC_CALCULATORS,
} from '../lib/metricCalculations';

const db = admin.firestore();

interface MetricResponse {
  id: string;
  assessmentId: string;
  schoolId: string;
  stakeholderType: string;
  dimension: number;
  metricId: string;
  metricType: 'reality' | 'perception';
  metricValue: number | string;
  followUpResponse?: string;
  timestamp: admin.firestore.Timestamp;
}

interface DimensionScore {
  dimensionId: number;
  dimensionName: string;
  realityScore: number;
  perceptionScore: number;
  gap: number;
  gapDirection: 'reality_higher' | 'perception_higher' | 'aligned';
  gapSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  metricCount: number;
  respondentCount: number;
  trend?: {
    change: number;
    percentChange: number;
    direction: 'improving' | 'declining' | 'stable';
  };
}

interface CalculationResult {
  assessmentId: string;
  schoolId: string;
  calculatedAt: admin.firestore.Timestamp;
  dimensionScores: DimensionScore[];
  overallRealityScore: number;
  overallPerceptionScore: number;
  overallGap: number;
  respondentCount: number;
  responseCount: number;
  metricsCovered: number;
  analysisReady: boolean;
}

/**
 * Calculate all metrics for a closed assessment
 * Triggered when assessment status changes to CLOSED
 */
export const calculateMetrics = functions
  .region('us-central1')
  .firestore.document('schools/{schoolId}/assessments14D/{assessmentId}')
  .onUpdate(async change => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Only process if status changed to CLOSED
      if (before?.status === after?.status || after?.status !== 'CLOSED') {
        return;
      }

      const { schoolId, assessmentId } = change.after.ref.parent.parent!.id;

      console.log(`🔄 Calculating metrics for assessment ${assessmentId}...`);

      // Fetch all responses for this assessment
      const responsesSnapshot = await db
        .collection('schools')
        .doc(schoolId)
        .collection('assessments14D')
        .doc(assessmentId)
        .collection('responses')
        .get();

      if (responsesSnapshot.empty) {
        console.warn(`⚠️ No responses found for assessment ${assessmentId}`);
        return;
      }

      const responses = responsesSnapshot.docs.map(doc => doc.data() as MetricResponse);

      // Group responses by dimension and metric
      const responsesByDimension = new Map<number, MetricResponse[]>();
      const realityByMetric = new Map<string, number[]>();
      const perceptionByMetric = new Map<string, number[]>();

      responses.forEach(response => {
        // Group by dimension
        if (!responsesByDimension.has(response.dimension)) {
          responsesByDimension.set(response.dimension, []);
        }
        responsesByDimension.get(response.dimension)!.push(response);

        // Separate reality and perception
        const key = `${response.dimension}_${response.metricId}`;
        if (response.metricType === 'reality') {
          if (!realityByMetric.has(key)) realityByMetric.set(key, []);
          realityByMetric.get(key)!.push(Number(response.metricValue));
        } else {
          if (!perceptionByMetric.has(key)) perceptionByMetric.set(key, []);
          perceptionByMetric.get(key)!.push(Number(response.metricValue));
        }
      });

      // Calculate dimension scores
      const dimensionScores: DimensionScore[] = [];
      const realityScores: number[] = [];
      const perceptionScores: number[] = [];

      for (let dimensionId = 1; dimensionId <= 14; dimensionId++) {
        const dimensionResponses = responsesByDimension.get(dimensionId) || [];
        if (dimensionResponses.length === 0) continue;

        // Get reality metrics for this dimension
        const realityMetrics = Array.from(realityByMetric.entries())
          .filter(([key]) => key.startsWith(`${dimensionId}_`))
          .map(([, values]) => aggregateRealityScore(values));

        // Get perception ratings for this dimension
        const perceptionMetrics = Array.from(perceptionByMetric.entries())
          .filter(([key]) => key.startsWith(`${dimensionId}_`))
          .map(([, values]) => aggregatePerceptionScore(values));

        const realityScore = aggregateRealityScore(realityMetrics);
        const perceptionScore = aggregatePerceptionScore(perceptionMetrics);

        const { gap, direction, severity } = calculateGap(realityScore, perceptionScore);

        dimensionScores.push({
          dimensionId,
          dimensionName: getDimensionName(dimensionId),
          realityScore: Math.round(realityScore * 100) / 100,
          perceptionScore: Math.round(perceptionScore * 100) / 100,
          gap: Math.round(gap * 100) / 100,
          gapDirection: direction,
          gapSeverity: severity,
          metricCount: realityMetrics.length,
          respondentCount: new Set(dimensionResponses.map(r => r.respondentId)).size,
        });

        realityScores.push(realityScore);
        perceptionScores.push(perceptionScore);
      }

      // Calculate overall scores
      const overallRealityScore = Math.round(aggregateRealityScore(realityScores) * 100) / 100;
      const overallPerceptionScore = Math.round(aggregatePerceptionScore(perceptionScores) * 100) / 100;
      const { gap: overallGap } = calculateGap(overallRealityScore, overallPerceptionScore);

      const uniqueRespondents = new Set(responses.map(r => r.respondentId)).size;

      const calculationResult: CalculationResult = {
        assessmentId,
        schoolId,
        calculatedAt: admin.firestore.Timestamp.now(),
        dimensionScores,
        overallRealityScore,
        overallPerceptionScore,
        overallGap: Math.round(overallGap * 100) / 100,
        respondentCount: uniqueRespondents,
        responseCount: responses.length,
        metricsCovered: dimensionScores.length,
        analysisReady: true,
      };

      // Save calculation result
      await db
        .collection('schools')
        .doc(schoolId)
        .collection('assessments14D')
        .doc(assessmentId)
        .collection('calculatedScores')
        .doc('latest')
        .set(calculationResult, { merge: true });

      // Update assessment status to ANALYZED
      await db
        .collection('schools')
        .doc(schoolId)
        .collection('assessments14D')
        .doc(assessmentId)
        .update({
          status: 'ANALYZED',
          analyzedAt: admin.firestore.Timestamp.now(),
          'scores.overall': {
            reality: overallRealityScore,
            perception: overallPerceptionScore,
            gap: overallGap,
          },
        });

      console.log(`✅ Metrics calculated for assessment ${assessmentId}`);
      console.log(`   Dimensions: ${dimensionScores.length}`);
      console.log(`   Reality Score: ${overallRealityScore}`);
      console.log(`   Perception Score: ${overallPerceptionScore}`);
      console.log(`   Gap: ${overallGap}`);
    } catch (error) {
      console.error('❌ Metric calculation failed:', error);
      throw error;
    }
  });

/**
 * Helper: Get dimension name by ID
 */
function getDimensionName(id: number): string {
  const names: Record<number, string> = {
    1: 'Academic Performance & Learning',
    2: 'Curriculum & Pedagogy',
    3: 'Teacher Quality & Retention',
    4: 'Student Wellbeing',
    5: 'School Infrastructure',
    6: 'Technology Integration',
    7: 'Parental Engagement',
    8: 'Financial Health',
    9: 'Leadership & Governance',
    10: 'Admissions & Enrollment',
    11: 'Alumni Engagement',
    12: 'Operational Efficiency',
    13: 'Diversity & Inclusion',
    14: 'Innovation & Future Readiness',
  };
  return names[id] || `Dimension ${id}`;
}
