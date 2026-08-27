import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CalculationEngine } from './calculationEngine';

const db = admin.firestore();
const logger = functions.logger;
const engine = new CalculationEngine();

/**
 * Allocate Resources by Tier
 * HTTP Callable Cloud Function
 *
 * Input:
 * - simulationId: string
 * - feasibilityResults: [{ dimensionId, feasibilityScore, gap, riskLevel }]
 * - totalBudget: number
 *
 * Output:
 * - success: boolean
 * - allocation: {
 *     tier1: { amount, percentage, dimensions },
 *     tier2: { amount, percentage, dimensions },
 *     tier3: { amount, percentage, dimensions },
 *     buffer: { amount, percentage, description }
 *   }
 */
export const allocateResources = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      // 1. Verify authentication
      if (!context.auth) {
        logger.warn('Unauthenticated allocateResources call');
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const userId = context.auth.uid;
      logger.info('allocateResources called', {
        userId,
        simulationId: data.simulationId,
      });

      // 2. Validate required fields
      const requiredFields = ['simulationId', 'feasibilityResults', 'totalBudget'];

      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
          logger.error('Missing required field', { field });
          throw new functions.https.HttpsError(
            'invalid-argument',
            `Missing required field: ${field}`
          );
        }
      }

      // 3. Validate feasibilityResults array
      if (!Array.isArray(data.feasibilityResults)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'feasibilityResults must be an array'
        );
      }

      if (data.feasibilityResults.length === 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'feasibilityResults cannot be empty'
        );
      }

      // Validate each result
      for (const result of data.feasibilityResults) {
        if (
          !result.dimensionId ||
          typeof result.feasibilityScore !== 'number' ||
          typeof result.gap !== 'number'
        ) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Each feasibility result must have dimensionId, feasibilityScore, and gap'
          );
        }
      }

      // 4. Validate budget
      if (typeof data.totalBudget !== 'number' || data.totalBudget < 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'totalBudget must be a positive number'
        );
      }

      logger.info('Starting resource allocation', {
        dimensionsCount: data.feasibilityResults.length,
        totalBudget: data.totalBudget,
      });

      // 5. Categorize dimensions by feasibility and priority
      const sortedByFeasibility = [...data.feasibilityResults].sort(
        (a, b) => b.gap - a.gap
      );

      const tier1Dims = sortedByFeasibility.filter((r) => r.feasibilityScore >= 70).slice(0, 5);
      const tier2Dims = sortedByFeasibility
        .filter((r) => r.feasibilityScore >= 50 && r.feasibilityScore < 70)
        .slice(0, 5);
      const tier3Dims = sortedByFeasibility.filter((r) => r.feasibilityScore < 50);

      // 6. Calculate budget allocation
      const tier1Amount = data.totalBudget * 0.4;
      const tier2Amount = data.totalBudget * 0.35;
      const tier3Amount = data.totalBudget * 0.15;
      const bufferAmount = data.totalBudget * 0.1;

      // 7. Distribute tier budgets to specific dimensions
      const distributeTierBudget = (
        dimensions: any[],
        tierBudget: number
      ) => {
        if (dimensions.length === 0) {
          return {};
        }

        const distribution: { [key: string]: number } = {};
        const totalGap = dimensions.reduce((sum, d) => sum + d.gap, 0);

        dimensions.forEach((dim) => {
          const proportion = (dim.gap / totalGap) * tierBudget;
          distribution[dim.dimensionId] = Math.round(proportion);
        });

        return distribution;
      };

      const tier1Distribution = distributeTierBudget(tier1Dims, tier1Amount);
      const tier2Distribution = distributeTierBudget(tier2Dims, tier2Amount);
      const tier3Distribution = distributeTierBudget(tier3Dims, tier3Amount);

      // 8. Calculate cost-benefit metrics
      const costBenefitAnalysis = sortedByFeasibility.map((dim) => {
        const allocatedBudget =
          tier1Distribution[dim.dimensionId] ||
          tier2Distribution[dim.dimensionId] ||
          tier3Distribution[dim.dimensionId] ||
          0;

        const roi = allocatedBudget > 0 ? ((dim.gap * 10) / allocatedBudget) * 100 : 0; // Points per rupee spent

        return {
          dimensionId: dim.dimensionId,
          allocatedBudget: allocatedBudget,
          expectedImprovement: Math.round(dim.gap),
          roi: parseFloat(roi.toFixed(4)), // Points gained per 1 lakh spent
          costPerPoint: allocatedBudget > 0 ? Math.round(allocatedBudget / dim.gap) : 0,
          feasibilityScore: dim.feasibilityScore,
        };
      });

      // 9. Prepare allocation object for storage
      const allocationData = {
        simulationId: data.simulationId,
        totalBudget: data.totalBudget,
        tier1: {
          amount: tier1Amount,
          percentage: 40,
          dimensionCount: tier1Dims.length,
          dimensions: tier1Dims.map((d) => d.dimensionId),
          distribution: tier1Distribution,
          description: 'High Impact, High Priority - Quick wins and critical interventions',
        },
        tier2: {
          amount: tier2Amount,
          percentage: 35,
          dimensionCount: tier2Dims.length,
          dimensions: tier2Dims.map((d) => d.dimensionId),
          distribution: tier2Distribution,
          description: 'Medium Impact, Medium Priority - Important but not blocking',
        },
        tier3: {
          amount: tier3Amount,
          percentage: 15,
          dimensionCount: tier3Dims.length,
          dimensions: tier3Dims.map((d) => d.dimensionId),
          distribution: tier3Distribution,
          description: 'Lower Priority, Phased - Deferred or phased approach',
        },
        buffer: {
          amount: bufferAmount,
          percentage: 10,
          description: 'Contingency for unexpected costs and course corrections',
        },
        costBenefitAnalysis: costBenefitAnalysis,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed',
      };

      // 10. Save allocation to Firestore
      await db
        .collection('schools')
        .doc(userId)
        .collection('reverseSimulations')
        .doc(data.simulationId)
        .collection('resourceAllocation')
        .doc('current')
        .set(allocationData);

      logger.info('Resource allocation saved successfully', {
        userId,
        simulationId: data.simulationId,
      });

      // 11. Return response
      return {
        success: true,
        message: 'Resource allocation completed successfully',
        allocation: {
          totalBudget: data.totalBudget,
          tier1: {
            amount: Math.round(tier1Amount),
            percentage: 40,
            dimensionCount: tier1Dims.length,
            dimensions: tier1Dims.map((d) => d.dimensionId),
            description: 'High Impact, High Priority - Quick wins and critical interventions',
          },
          tier2: {
            amount: Math.round(tier2Amount),
            percentage: 35,
            dimensionCount: tier2Dims.length,
            dimensions: tier2Dims.map((d) => d.dimensionId),
            description: 'Medium Impact, Medium Priority - Important but not blocking',
          },
          tier3: {
            amount: Math.round(tier3Amount),
            percentage: 15,
            dimensionCount: tier3Dims.length,
            dimensions: tier3Dims.map((d) => d.dimensionId),
            description: 'Lower Priority, Phased - Deferred or phased approach',
          },
          buffer: {
            amount: Math.round(bufferAmount),
            percentage: 10,
            description: 'Contingency for unexpected costs and course corrections',
          },
          costBenefitAnalysis: costBenefitAnalysis.slice(0, 5), // Top 5 by ROI
          summary: {
            tier1DimsWithBudget: Object.keys(tier1Distribution).length,
            tier2DimsWithBudget: Object.keys(tier2Distribution).length,
            tier3DimsWithBudget: Object.keys(tier3Distribution).length,
            totalAllocated:
              Math.round(tier1Amount + tier2Amount + tier3Amount),
            contingencyBuffer: Math.round(bufferAmount),
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in allocateResources', error);
      throw error;
    }
  });
