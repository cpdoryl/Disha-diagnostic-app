import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const logger = functions.logger;

/**
 * Set Goal Setting for Reverse Simulation
 * HTTP Callable Cloud Function
 *
 * Input:
 * - simulationId: string (unique identifier)
 * - schoolId: string (school context)
 * - currentHealth: number (0-100)
 * - targetHealth: number (0-100)
 * - timelineMonths: number (3-24)
 * - budget: number (in rupees)
 * - priority: string (academic/holistic/custom)
 *
 * Output:
 * - success: boolean
 * - goalSetting: { currentHealth, targetHealth, timelineMonths, budget, priority }
 * - estimatedChallenge: percentage (difficulty level)
 */
export const setGoalSetting = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      // 1. Verify authentication
      if (!context.auth) {
        logger.warn('Unauthenticated setGoalSetting call');
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const userId = context.auth.uid;
      logger.info('setGoalSetting called', {
        userId,
        simulationId: data.simulationId,
      });

      // 2. Validate required fields
      const requiredFields = [
        'simulationId',
        'currentHealth',
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

      // 3. Validate data types and ranges
      if (typeof data.currentHealth !== 'number' || data.currentHealth < 0 || data.currentHealth > 100) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'currentHealth must be between 0 and 100'
        );
      }

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

      // 4. Calculate challenge level (estimated difficulty)
      const gap = data.targetHealth - data.currentHealth;
      const gapPercentage = (gap / data.currentHealth) * 100;
      const timelineScore = Math.max(0, 1 - data.timelineMonths / 24);
      const budgetScore = Math.max(0, 1 - (data.budget / 10000000) * 0.1);
      const estimatedChallenge = Math.round(
        (gapPercentage / 100 * 0.4 + timelineScore * 0.3 + budgetScore * 0.3) * 100
      );

      // 5. Prepare goal setting object
      const goalSetting = {
        simulationId: data.simulationId,
        schoolId: data.schoolId || userId,
        currentHealth: data.currentHealth,
        targetHealth: data.targetHealth,
        gap: gap,
        gapPercentage: parseFloat(gapPercentage.toFixed(2)),
        timelineMonths: data.timelineMonths,
        budget: data.budget,
        priority: data.priority || 'holistic',
        estimatedChallenge: estimatedChallenge,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
      };

      // 6. Save to Firestore
      await db
        .collection('schools')
        .doc(userId)
        .collection('reverseSimulations')
        .doc(data.simulationId)
        .collection('goalSetting')
        .doc('current')
        .set(goalSetting);

      logger.info('Goal setting saved successfully', {
        userId,
        simulationId: data.simulationId,
      });

      // 7. Return response
      return {
        success: true,
        message: 'Goal setting saved successfully',
        goalSetting: {
          currentHealth: goalSetting.currentHealth,
          targetHealth: goalSetting.targetHealth,
          gap: goalSetting.gap,
          gapPercentage: goalSetting.gapPercentage,
          timelineMonths: goalSetting.timelineMonths,
          budget: goalSetting.budget,
          priority: goalSetting.priority,
          estimatedChallenge: goalSetting.estimatedChallenge,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in setGoalSetting', error);
      throw error;
    }
  });
