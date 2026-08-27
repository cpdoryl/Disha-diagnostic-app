import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const logger = functions.logger;

// Dimension-specific action templates
const actionTemplates: { [key: string]: any } = {
  D01: {
    name: 'Academic Excellence',
    rootCauses: ['Teaching methodology', 'Curriculum gaps', 'Assessment practices'],
    interventions: [
      { activity: 'Teacher training in active learning', duration: '6 weeks', cost: 100000 },
      { activity: 'Curriculum review and update', duration: '2 months', cost: 150000 },
      { activity: 'Implement formative assessments', duration: '4 weeks', cost: 50000 },
    ],
  },
  D02: {
    name: 'Teacher Welfare',
    rootCauses: ['Compensation', 'Work environment', 'Professional development'],
    interventions: [
      { activity: 'Salary benchmarking and adjustment', duration: '2 months', cost: 500000 },
      { activity: 'Teacher wellness program', duration: '3 months', cost: 100000 },
      { activity: 'Professional development opportunities', duration: '6 months', cost: 150000 },
    ],
  },
  D03: {
    name: 'Leadership Quality',
    rootCauses: ['Leadership skills', 'Strategic vision', 'Decision-making processes'],
    interventions: [
      { activity: 'Leadership training program', duration: '3 months', cost: 200000 },
      { activity: 'Strategic planning workshop', duration: '2 weeks', cost: 100000 },
      { activity: 'Mentorship from external leaders', duration: '6 months', cost: 150000 },
    ],
  },
  D04: {
    name: 'Parent Engagement',
    rootCauses: ['Communication gaps', 'Limited involvement', 'Misaligned expectations'],
    interventions: [
      { activity: 'Parent communication plan', duration: '1 month', cost: 50000 },
      { activity: 'Parent-teacher collaboration events', duration: '3 months', cost: 100000 },
      { activity: 'Digital parent portal implementation', duration: '2 months', cost: 200000 },
    ],
  },
};

/**
 * Generate Action Plan Mapping
 * HTTP Callable Cloud Function
 *
 * Input:
 * - simulationId: string
 * - dimensionTargets: { D01: number, ... }
 * - currentDimensions: { D01: number, ... }
 * - budget: number
 *
 * Output:
 * - success: boolean
 * - actionPlan: {
 *     dimensionId, targetScore, gap, rootCauses,
 *     interventions, estimatedCost, implementationWeeks
 *   }[]
 */
export const generateActionPlan = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      // 1. Verify authentication
      if (!context.auth) {
        logger.warn('Unauthenticated generateActionPlan call');
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const userId = context.auth.uid;
      logger.info('generateActionPlan called', {
        userId,
        simulationId: data.simulationId,
      });

      // 2. Validate required fields
      const requiredFields = ['simulationId', 'dimensionTargets', 'currentDimensions', 'budget'];

      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
          logger.error('Missing required field', { field });
          throw new functions.https.HttpsError(
            'invalid-argument',
            `Missing required field: ${field}`
          );
        }
      }

      // 3. Validate dimensions
      const dimensions = Object.keys(data.dimensionTargets);
      if (dimensions.length === 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'dimensionTargets cannot be empty'
        );
      }

      // 4. Generate action plan for each dimension
      logger.info('Generating action plan', { dimensionsCount: dimensions.length });

      const actionPlan = dimensions.map((dimId) => {
        const currentScore = data.currentDimensions[dimId] || 0;
        const targetScore = data.dimensionTargets[dimId];
        const gap = targetScore - currentScore;

        // Get template or create generic action
        const template = actionTemplates[dimId] || {
          name: `${dimId} Improvement`,
          rootCauses: ['Performance gap identified'],
          interventions: [
            {
              activity: `Targeted intervention for ${dimId}`,
              duration: '3 months',
              cost: Math.round((gap / 100) * 300000),
            },
          ],
        };

        // Calculate cost based on gap
        const baseCost = template.interventions.reduce((sum: number, i: any) => sum + i.cost, 0);
        const scaledCost = Math.round((baseCost * gap) / 20); // Scale by gap size
        const implementationWeeks = Math.ceil(gap * 4); // 4 weeks per 5-point gap

        return {
          dimensionId: dimId,
          dimensionName: template.name,
          currentScore: currentScore,
          targetScore: targetScore,
          gap: gap,
          gapPercentage: parseFloat(((gap / currentScore) * 100).toFixed(2)),
          rootCauses: template.rootCauses,
          interventions: template.interventions.map((i: any) => ({
            activity: i.activity,
            duration: i.duration,
            estimatedCost: i.cost,
            owner: 'TBD',
            status: 'planned',
          })),
          totalEstimatedCost: scaledCost,
          implementationWeeks: implementationWeeks,
          successCriteria: [
            `Achieve target score of ${targetScore}/100`,
            `Implement all planned interventions`,
            `Complete within ${implementationWeeks} weeks`,
          ],
          keyPerformanceIndicators: [
            { metric: 'Target Score Achievement', target: `${targetScore}/100` },
            { metric: 'Implementation Progress', target: '100%' },
            { metric: 'Budget Adherence', target: '±5%' },
          ],
        };
      });

      // 5. Calculate total cost
      const totalCost = actionPlan.reduce((sum) => sum + Math.round(data.budget / dimensions.length), 0);

      // 6. Sort by priority (gap size)
      const sortedPlan = actionPlan.sort((a, b) => b.gap - a.gap);

      // 7. Prepare action plan object for storage
      const actionPlanData = {
        simulationId: data.simulationId,
        totalDimensions: dimensions.length,
        actionPlan: sortedPlan,
        totalEstimatedCost: totalCost,
        totalBudgetAvailable: data.budget,
        budgetUtilization: parseFloat(((totalCost / data.budget) * 100).toFixed(2)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed',
      };

      // 8. Save action plan to Firestore
      await db
        .collection('schools')
        .doc(userId)
        .collection('reverseSimulations')
        .doc(data.simulationId)
        .collection('actionMapping')
        .doc('current')
        .set(actionPlanData);

      logger.info('Action plan saved successfully', {
        userId,
        simulationId: data.simulationId,
        dimensionsCount: dimensions.length,
      });

      // 9. Return response
      return {
        success: true,
        message: 'Action plan generated successfully',
        actionPlan: {
          totalDimensions: dimensions.length,
          plan: sortedPlan,
          summary: {
            totalEstimatedCost: totalCost,
            budgetAvailable: data.budget,
            budgetUtilization: parseFloat(((totalCost / data.budget) * 100).toFixed(2)),
            overBudget: totalCost > data.budget,
          },
          recommendations: [
            `Prioritize ${Math.ceil(dimensions.length * 0.4)} dimensions with highest gaps`,
            `Total cost: ₹${totalCost.toLocaleString('en-IN')} (${((totalCost / data.budget) * 100).toFixed(1)}% of budget)`,
            totalCost > data.budget
              ? `Over budget by ₹${(totalCost - data.budget).toLocaleString('en-IN')}`
              : `Budget buffer: ₹${(data.budget - totalCost).toLocaleString('en-IN')}`,
          ],
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in generateActionPlan', error);
      throw error;
    }
  });
