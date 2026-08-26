/**
 * 14-Dimension Diagnostic Framework v2 — Gap Analysis Engine
 * Cloud Function: Analyze perception-reality gaps and identify blind spots
 * Phase 3: Cloud Functions & Analysis
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface DimensionScore {
  dimensionId: number;
  dimensionName: string;
  realityScore: number;
  perceptionScore: number;
  gap: number;
  gapDirection: 'reality_higher' | 'perception_higher' | 'aligned';
  gapSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface GapAnalysis {
  dimensionId: number;
  dimensionName: string;
  realityScore: number;
  perceptionScore: number;
  gap: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'perception_inflated' | 'reality_lagging' | 'blind_spot' | 'aligned';
  priority: number; // 1 = highest priority
  rootCauses: string[];
  recommendation: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface GapAnalysisResult {
  assessmentId: string;
  schoolId: string;
  analyzedAt: admin.firestore.Timestamp;
  totalGaps: number;
  criticalGaps: number;
  blindSpots: number;
  allGaps: GapAnalysis[];
  topPriorities: GapAnalysis[];
  blindSpotsList: GapAnalysis[];
  summary: {
    bestPerformingDimensions: Array<{ dimension: string; score: number }>;
    worstPerformingDimensions: Array<{ dimension: string; score: number }>;
    biggestGaps: Array<{ dimension: string; gap: number }>;
  };
}

/**
 * Analyze gaps between reality and perception scores
 * Triggered after metric calculation
 */
export const runGapAnalysis = functions
  .region('us-central1')
  .https.onCall(
    async (
      data: { schoolId: string; assessmentId: string },
      context
    ): Promise<GapAnalysisResult> => {
      try {
        const { schoolId, assessmentId } = data;

        console.log(`🔍 Running gap analysis for ${assessmentId}...`);

        // Fetch calculated scores
        const scoresDoc = await db
          .collection('schools')
          .doc(schoolId)
          .collection('assessments14D')
          .doc(assessmentId)
          .collection('calculatedScores')
          .doc('latest')
          .get();

        if (!scoresDoc.exists) {
          throw new Error('Calculated scores not found. Run calculateMetrics first.');
        }

        const scores = scoresDoc.data() as any;
        const dimensionScores = scores.dimensionScores as DimensionScore[];

        // Analyze each gap
        const allGaps: GapAnalysis[] = [];

        dimensionScores.forEach((dimension: DimensionScore) => {
          const gap = analyzeGap(dimension);
          allGaps.push(gap);
        });

        // Sort by priority
        const sorted = allGaps.sort((a, b) => a.priority - b.priority);
        const topPriorities = sorted.slice(0, 5);
        const blindSpots = allGaps.filter(g => g.type === 'blind_spot');
        const criticalCount = allGaps.filter(g => g.severity === 'CRITICAL').length;

        // Get best and worst performing
        const byReality = [...dimensionScores].sort((a, b) => b.realityScore - a.realityScore);
        const bestPerforming = byReality.slice(0, 3).map(d => ({
          dimension: d.dimensionName,
          score: d.realityScore,
        }));
        const worstPerforming = byReality.slice(-3).map(d => ({
          dimension: d.dimensionName,
          score: d.realityScore,
        }));

        const biggestGaps = sorted
          .slice(0, 5)
          .map(g => ({
            dimension: g.dimensionName,
            gap: g.gap,
          }));

        const result: GapAnalysisResult = {
          assessmentId,
          schoolId,
          analyzedAt: admin.firestore.Timestamp.now(),
          totalGaps: allGaps.length,
          criticalGaps: criticalCount,
          blindSpots: blindSpots.length,
          allGaps: sorted,
          topPriorities,
          blindSpotsList: blindSpots,
          summary: {
            bestPerformingDimensions: bestPerforming,
            worstPerformingDimensions: worstPerforming,
            biggestGaps,
          },
        };

        // Save gap analysis
        await db
          .collection('schools')
          .doc(schoolId)
          .collection('assessments14D')
          .doc(assessmentId)
          .collection('analysis')
          .doc('gaps')
          .set(result, { merge: true });

        console.log(`✅ Gap analysis complete`);
        console.log(`   Total gaps: ${allGaps.length}`);
        console.log(`   Critical: ${criticalCount}`);
        console.log(`   Blind spots: ${blindSpots.length}`);

        return result;
      } catch (error) {
        console.error('❌ Gap analysis failed:', error);
        throw error;
      }
    }
  );

/**
 * Analyze a single dimension's gap
 */
function analyzeGap(dimension: DimensionScore): GapAnalysis {
  const gap = dimension.gap;
  const direction = dimension.gapDirection;
  const severity = dimension.gapSeverity;

  let type: 'perception_inflated' | 'reality_lagging' | 'blind_spot' | 'aligned';
  let rootCauses: string[] = [];
  let recommendation: string;
  let priority: number;
  let urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';

  if (gap < 5) {
    // Aligned
    type = 'aligned';
    priority = 100;
    urgency = 'LOW';
    recommendation = 'Continue current approach - perception and reality are aligned.';
    rootCauses = ['Strong perception-reality alignment'];
  } else if (direction === 'perception_higher') {
    // Perception inflated (people think it's better than it actually is)
    type = 'perception_inflated';

    if (severity === 'CRITICAL') {
      priority = 1;
      urgency = 'IMMEDIATE';
    } else if (severity === 'HIGH') {
      priority = 5;
      urgency = 'HIGH';
    } else {
      priority = 10;
      urgency = 'MEDIUM';
    }

    rootCauses = [
      'Stakeholder perceptions may not reflect actual performance',
      'Communication gap between implementation and perception',
      'Possible satisfaction bias or survey response bias',
    ];

    recommendation =
      'Bridge perception-reality gap through: (1) Transparent communication about actual performance metrics, (2) Stakeholder education on real data, (3) Address discrepancy drivers.';
  } else {
    // Reality lagging (performance is worse than perceived)
    type = 'blind_spot';

    if (severity === 'CRITICAL') {
      priority = 2;
      urgency = 'IMMEDIATE';
    } else if (severity === 'HIGH') {
      priority = 4;
      urgency = 'HIGH';
    } else {
      priority = 8;
      urgency = 'MEDIUM';
    }

    rootCauses = [
      'Performance not matching stakeholder expectations',
      'Implementation gaps between planned and executed',
      'Resource constraints limiting performance',
      'Capability/skill gaps in execution',
    ];

    recommendation =
      'Urgent improvement needed: (1) Investigate root causes of underperformance, (2) Allocate resources for improvement, (3) Set measurable improvement targets, (4) Monitor progress closely.';
  }

  return {
    dimensionId: dimension.dimensionId,
    dimensionName: dimension.dimensionName,
    realityScore: dimension.realityScore,
    perceptionScore: dimension.perceptionScore,
    gap: Math.round(gap * 100) / 100,
    severity,
    type,
    priority,
    rootCauses,
    recommendation,
    urgency,
  };
}

/**
 * Determine if a gap is a "blind spot"
 * Blind spot = Perception HIGH but Reality DECLINING (from historical data)
 */
export function isBlindSpot(
  currentReality: number,
  previousReality: number | undefined,
  perception: number
): boolean {
  if (!previousReality) return false;

  const isPerceptionHigh = perception > 70;
  const isDeclining = currentReality < previousReality;

  return isPerceptionHigh && isDeclining;
}
