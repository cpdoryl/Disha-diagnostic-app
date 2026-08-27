import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CalculationEngine } from './calculationEngine';

const db = admin.firestore();
const logger = functions.logger;
const engine = new CalculationEngine();

/**
 * Perform Reverse Calculation
 * HTTP Callable Cloud Function
 *
 * Input:
 * - simulationId: string
 * - currentHealth: number
 * - currentDimensions: { D01: number, D02: number, ... }
 * - targetHealth: number
 * - timelineMonths: number
 * - budget: number
 * - allocationStrategy: 'uniform' | 'strategic' | 'aggressive'
 *
 * Output:
 * - success: boolean
 * - calculations: {
 *     requiredPoints, currentPoints, gap, dimensionTargets,
 *     allocationByDimension, estimatedOutcome
 *   }
 */
export const performReverseCalculation = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      // 1. Verify authentication
      if (!context.auth) {
        logger.warn('Unauthenticated performReverseCalculation call');
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const userId = context.auth.uid;
      logger.info('performReverseCalculation called', {
        userId,
        simulationId: data.simulationId,
      });

      // 2. Validate required fields
      const requiredFields = [
        'simulationId',
        'currentHealth',
        'currentDimensions',
        'targetHealth',
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

      // 3. Validate currentDimensions format
      if (typeof data.currentDimensions !== 'object' || Array.isArray(data.currentDimensions)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'currentDimensions must be an object with dimension IDs as keys'
        );
      }

      const dimensions = engine.getAllDimensions();
      for (const dim of dimensions) {
        if (!(dim in data.currentDimensions)) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            `currentDimensions must include all 14 dimensions (missing ${dim})`
          );
        }

        const score = data.currentDimensions[dim];
        if (typeof score !== 'number' || score < 0 || score > 100) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            `Each dimension score must be between 0 and 100 (${dim} = ${score})`
          );
        }
      }

      // 4. Validate other parameters
      if (typeof data.targetHealth !== 'number' || data.targetHealth < 0 || data.targetHealth > 100) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'targetHealth must be between 0 and 100'
        );
      }

      if (data.currentHealth >= data.targetHealth) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'targetHealth must be greater than currentHealth'
        );
      }

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

      const allocationStrategy = data.allocationStrategy || 'strategic';
      if (!['uniform', 'strategic', 'aggressive'].includes(allocationStrategy)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          "allocationStrategy must be 'uniform', 'strategic', or 'aggressive'"
        );
      }

      // 5. Perform reverse calculation
      logger.info('Starting reverse calculation engine', {
        currentHealth: data.currentHealth,
        targetHealth: data.targetHealth,
      });

      const result = engine.performReverseCalculation(
        data.currentHealth,
        data.currentDimensions,
        data.targetHealth,
        data.timelineMonths,
        data.budget,
        allocationStrategy
      );

      logger.info('Reverse calculation completed', {
        gap: result.gap,
        estimatedOutcome: result.estimatedOutcome,
      });

      // 6. Prepare calculation object for storage
      const calculationData = {
        simulationId: data.simulationId,
        currentHealth: data.currentHealth,
        targetHealth: data.targetHealth,
        requiredPoints: result.requiredPoints,
        currentPoints: result.currentPoints,
        gap: result.gap,
        gapPercentage: result.gapPercentage,
        timelineMonths: data.timelineMonths,
        budget: data.budget,
        allocationStrategy: allocationStrategy,
        dimensionTargets: result.dimensionTargets,
        allocationByDimension: result.allocationByDimension,
        estimatedOutcome: result.estimatedOutcome,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed',
      };

      // 7. Save calculations to Firestore
      await db
        .collection('schools')
        .doc(userId)
        .collection('reverseSimulations')
        .doc(data.simulationId)
        .collection('calculations')
        .doc('current')
        .set(calculationData);

      logger.info('Calculations saved successfully', {
        userId,
        simulationId: data.simulationId,
      });

      // 8. Return response
      return {
        success: true,
        message: 'Reverse calculations completed successfully',
        calculations: {
          currentHealth: result.currentPoints / engine.getTotalWeight() * 100,
          targetHealth: (result.currentPoints + result.gap) / engine.getTotalWeight() * 100,
          requiredPoints: result.requiredPoints,
          currentPoints: result.currentPoints,
          gap: result.gap,
          gapPercentage: parseFloat(result.gapPercentage.toFixed(2)),
          timelineMonths: data.timelineMonths,
          budget: data.budget,
          dimensionTargets: Object.entries(result.dimensionTargets).reduce(
            (acc, [key, value]) => ({
              ...acc,
              [key]: parseFloat((value as number).toFixed(2)),
            }),
            {}
          ),
          estimatedOutcome: result.estimatedOutcome,
          allocationStrategy: allocationStrategy,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in performReverseCalculation', error);
      throw error;
    }
  });
