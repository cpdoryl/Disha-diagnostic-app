import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CalculationEngine } from './calculationEngine';

const db = admin.firestore();
const logger = functions.logger;
const engine = new CalculationEngine();

/**
 * Analyze Feasibility of Targets
 * HTTP Callable Cloud Function
 *
 * Input:
 * - simulationId: string
 * - currentDimensions: { D01: number, ... }
 * - targetDimensions: { D01: number, ... }
 * - timelineMonths: number
 * - budget: number
 *
 * Output:
 * - success: boolean
 * - feasibility: [
 *     {
 *       dimensionId, currentScore, targetScore, gap,
 *       feasibilityScore, feasibilityBand, riskLevel, recommendations
 *     },
 *     ...
 *   ]
 * - overallFeasibility: { score, band, riskLevel }
 */
export const analyzeFeasibility = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      // 1. Verify authentication
      if (!context.auth) {
        logger.warn('Unauthenticated analyzeFeasibility call');
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const userId = context.auth.uid;
      logger.info('analyzeFeasibility called', {
        userId,
        simulationId: data.simulationId,
      });

      // 2. Validate required fields
      const requiredFields = [
        'simulationId',
        'currentDimensions',
        'targetDimensions',
        'timelineMonths',
        'budget',
      ];

      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
          logger.error('Missing required field', { field });
          throw new functions.https.HttpsError(
            'invalid-argument',
            `Missing required field: ${field}`
          );
        }
      }

      // 3. Validate currentDimensions and targetDimensions
      const dimensions = engine.getAllDimensions();

      for (const dim of dimensions) {
        if (!(dim in data.currentDimensions)) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            `currentDimensions must include all 14 dimensions (missing ${dim})`
          );
        }
        if (!(dim in data.targetDimensions)) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            `targetDimensions must include all 14 dimensions (missing ${dim})`
          );
        }

        const currentScore = data.currentDimensions[dim];
        const targetScore = data.targetDimensions[dim];

        if (typeof currentScore !== 'number' || currentScore < 0 || currentScore > 100) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            `currentDimensions scores must be between 0-100 (${dim} = ${currentScore})`
          );
        }

        if (typeof targetScore !== 'number' || targetScore < 0 || targetScore > 100) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            `targetDimensions scores must be between 0-100 (${dim} = ${targetScore})`
          );
        }

        if (targetScore < currentScore) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            `Target must be >= current for all dimensions (${dim}: ${currentScore} -> ${targetScore})`
          );
        }
      }

      // 4. Validate other parameters
      if (typeof data.timelineMonths !== 'number' || data.timelineMonths < 3 || data.timelineMonths > 24) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'timelineMonths must be between 3 and 24'
        );
      }

      if (typeof data.budget !== 'number' || data.budget < 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'budget must be a positive number'
        );
      }

      // 5. Perform feasibility analysis
      logger.info('Starting feasibility analysis', {
        timelineMonths: data.timelineMonths,
        budget: data.budget,
      });

      const feasibilityResults = engine.analyzeFeasibility(
        data.currentDimensions,
        data.targetDimensions,
        data.timelineMonths,
        data.budget
      );

      logger.info('Feasibility analysis completed', {
        dimensionsAnalyzed: feasibilityResults.length,
      });

      // 6. Calculate overall feasibility
      const avgFeasibilityScore = Math.round(
        feasibilityResults.reduce((sum, r) => sum + r.feasibilityScore, 0) /
          feasibilityResults.length
      );

      let overallBand: string;
      let overallRiskLevel: string;

      if (avgFeasibilityScore >= 90) {
        overallBand = 'Highly Feasible';
        overallRiskLevel = 'Low';
      } else if (avgFeasibilityScore >= 70) {
        overallBand = 'Feasible';
        overallRiskLevel = 'Medium';
      } else if (avgFeasibilityScore >= 50) {
        overallBand = 'Challenging';
        overallRiskLevel = 'High';
      } else {
        overallBand = 'High Risk';
        overallRiskLevel = 'Very High';
      }

      // 7. Categorize dimensions by risk
      const categorized = {
        highlyFeasible: feasibilityResults.filter((r) => r.feasibilityScore >= 90),
        feasible: feasibilityResults.filter(
          (r) => r.feasibilityScore >= 70 && r.feasibilityScore < 90
        ),
        challenging: feasibilityResults.filter(
          (r) => r.feasibilityScore >= 50 && r.feasibilityScore < 70
        ),
        highRisk: feasibilityResults.filter((r) => r.feasibilityScore < 50),
      };

      // 8. Prepare feasibility object for storage
      const feasibilityData = {
        simulationId: data.simulationId,
        timelineMonths: data.timelineMonths,
        budget: data.budget,
        dimensionResults: feasibilityResults,
        overallFeasibilityScore: avgFeasibilityScore,
        overallFeasibilityBand: overallBand,
        overallRiskLevel: overallRiskLevel,
        categorizedDimensions: {
          highlyFeasible: categorized.highlyFeasible.map((r) => r.dimensionId),
          feasible: categorized.feasible.map((r) => r.dimensionId),
          challenging: categorized.challenging.map((r) => r.dimensionId),
          highRisk: categorized.highRisk.map((r) => r.dimensionId),
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed',
      };

      // 9. Save feasibility analysis to Firestore
      await db
        .collection('schools')
        .doc(userId)
        .collection('reverseSimulations')
        .doc(data.simulationId)
        .collection('feasibilityAnalysis')
        .doc('current')
        .set(feasibilityData);

      logger.info('Feasibility analysis saved successfully', {
        userId,
        simulationId: data.simulationId,
      });

      // 10. Return response
      return {
        success: true,
        message: 'Feasibility analysis completed successfully',
        feasibility: {
          dimensionResults: feasibilityResults,
          overallFeasibilityScore: avgFeasibilityScore,
          overallFeasibilityBand: overallBand,
          overallRiskLevel: overallRiskLevel,
          summary: {
            highlyFeasibleCount: categorized.highlyFeasible.length,
            feasibleCount: categorized.feasible.length,
            challengingCount: categorized.challenging.length,
            highRiskCount: categorized.highRisk.length,
          },
          categorizedDimensions: {
            highlyFeasible: categorized.highlyFeasible.map((r) => r.dimensionId),
            feasible: categorized.feasible.map((r) => r.dimensionId),
            challenging: categorized.challenging.map((r) => r.dimensionId),
            highRisk: categorized.highRisk.map((r) => r.dimensionId),
          },
          recommendations: [
            `Prioritize ${categorized.highlyFeasible.length} highly feasible dimensions immediately`,
            `Plan carefully for ${categorized.challenging.length} challenging dimensions`,
            categorized.highRisk.length > 0
              ? `Consider deferring ${categorized.highRisk.length} high-risk dimensions to Phase 2`
              : 'No high-risk dimensions identified',
          ],
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in analyzeFeasibility', error);
      throw error;
    }
  });
