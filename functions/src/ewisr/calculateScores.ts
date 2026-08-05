/**
 * DISHA EWISR Calculate Scores Cloud Function
 * Server-side calculation of assessment scores
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ALL_DIMENSIONS, SCORING_FORMULAS } from '../data/dimensionalAssessmentData';

interface CalculateScoresRequest {
  assessmentId: string;
  responses: {
    [dimensionId: string]: {
      [questionId: string]: number;
    };
  };
}

interface DimensionScore {
  dimensionId: string;
  averageWeight: number;
  score: number;
  classification: string;
}

/**
 * Calculate dimension scores from assessment responses
 */
export const calculateDimensionScores = async (
  responses: { [dimensionId: string]: { [questionId: string]: number } }
): Promise<DimensionScore[]> => {
  const scores: DimensionScore[] = [];

  for (const dimension of ALL_DIMENSIONS) {
    const dimensionResponses = responses[dimension.dimensionId];

    if (!dimensionResponses || Object.keys(dimensionResponses).length === 0) {
      scores.push({
        dimensionId: dimension.dimensionId,
        averageWeight: 0,
        score: 0,
        classification: 'Critical'
      });
      continue;
    }

    // Calculate average weight
    const weights = Object.values(dimensionResponses);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const averageWeight = totalWeight / weights.length;

    // Convert to 0-100 scale
    const score = SCORING_FORMULAS.dimensionScore(averageWeight);

    // Classify based on benchmark
    let classification = 'Critical';
    if (score >= dimension.benchmarks.excellent) {
      classification = 'Excellent';
    } else if (score >= dimension.benchmarks.good) {
      classification = 'Good';
    } else if (score >= dimension.benchmarks.average) {
      classification = 'Average';
    } else if (score >= dimension.benchmarks.poor) {
      classification = 'Poor';
    } else {
      classification = 'Below Average';
    }

    scores.push({
      dimensionId: dimension.dimensionId,
      averageWeight,
      score,
      classification
    });
  }

  return scores;
};

/**
 * Calculate overall health index
 */
export const calculateOverallHealthIndex = async (
  dimensionScores: DimensionScore[]
): Promise<number> => {
  const weightedContributions = dimensionScores.map((ds) => {
    const dimension = ALL_DIMENSIONS.find((d) => d.dimensionId === ds.dimensionId);
    if (!dimension) return 0;

    return SCORING_FORMULAS.weightedContribution(ds.score, dimension.weight);
  });

  const totalWeight = ALL_DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
  const overallScore = SCORING_FORMULAS.overallHealthIndex(weightedContributions, totalWeight);

  return Math.min(100, Math.max(0, overallScore));
};

/**
 * HTTP Cloud Function to calculate scores
 */
export const calculateScores = functions.https.onCall(
  async (data: CalculateScoresRequest, context) => {
    try {
      // Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { assessmentId, responses } = data;

      if (!assessmentId || !responses) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'assessmentId and responses are required'
        );
      }

      // Calculate dimension scores
      const dimensionScores = await calculateDimensionScores(responses);

      // Calculate overall health index
      const overallHealthIndex = await calculateOverallHealthIndex(dimensionScores);

      // Determine health status
      let healthStatus = 'UNKNOWN';
      if (overallHealthIndex >= 90) {
        healthStatus = 'ELITE EXCELLENCE';
      } else if (overallHealthIndex >= 80) {
        healthStatus = 'STRONG PERFORMER';
      } else if (overallHealthIndex >= 70) {
        healthStatus = 'HEALTHY SCHOOL';
      } else if (overallHealthIndex >= 60) {
        healthStatus = 'AVERAGE PERFORMER';
      } else if (overallHealthIndex >= 50) {
        healthStatus = 'BELOW AVERAGE';
      } else {
        healthStatus = 'NEEDS SIGNIFICANT IMPROVEMENT';
      }

      // Update assessment document with calculated scores
      const db = admin.firestore();
      const assessmentRef = db.collection('ewisr_assessments').doc(assessmentId);

      const dimensionScoresObj = dimensionScores.reduce(
        (acc, ds) => ({
          ...acc,
          [ds.dimensionId]: {
            score: ds.score,
            classification: ds.classification,
            averageWeight: ds.averageWeight
          }
        }),
        {}
      );

      await assessmentRef.update({
        dimensionScores: dimensionScoresObj,
        overallHealthIndex,
        healthStatus,
        completionPercentage: calculateCompletionPercentage(responses),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        dimensionScores,
        overallHealthIndex,
        healthStatus
      };
    } catch (error) {
      console.error('Error calculating scores:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'Error calculating assessment scores: ' + (error as Error).message
      );
    }
  }
);

/**
 * Calculate completion percentage
 */
const calculateCompletionPercentage = (responses: {
  [dimensionId: string]: { [questionId: string]: number };
}): number => {
  const totalQuestions = ALL_DIMENSIONS.reduce((sum, d) => sum + d.questions.length, 0);

  let answeredCount = 0;
  for (const dimensionId in responses) {
    answeredCount += Object.keys(responses[dimensionId]).length;
  }

  return Math.round((answeredCount / totalQuestions) * 100);
};

/**
 * Batch process assessments (scheduled function)
 */
export const batchProcessAssessments = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    try {
      const db = admin.firestore();

      // Get all draft assessments that haven't been updated in the last 24 hours
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const draftAssessments = await db
        .collection('ewisr_assessments')
        .where('status', '==', 'draft')
        .where('updatedAt', '<', cutoffTime)
        .limit(100)
        .get();

      let processedCount = 0;

      for (const doc of draftAssessments.docs) {
        const assessment = doc.data();

        if (Object.keys(assessment.responses).length > 0) {
          const dimensionScores = await calculateDimensionScores(assessment.responses);
          const overallHealthIndex = await calculateOverallHealthIndex(dimensionScores);

          await doc.ref.update({
            dimensionScores: dimensionScores.reduce(
              (acc, ds) => ({
                ...acc,
                [ds.dimensionId]: {
                  score: ds.score,
                  classification: ds.classification
                }
              }),
              {}
            ),
            overallHealthIndex,
            completionPercentage: calculateCompletionPercentage(assessment.responses)
          });

          processedCount++;
        }
      }

      console.log(`Batch processed ${processedCount} assessments`);
      return { processedCount };
    } catch (error) {
      console.error('Error in batch process:', error);
      throw error;
    }
  });

export default {
  calculateScores,
  calculateDimensionScores,
  calculateOverallHealthIndex,
  batchProcessAssessments
};
