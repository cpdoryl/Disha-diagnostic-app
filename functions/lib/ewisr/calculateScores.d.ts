/**
 * DISHA EWISR Calculate Scores Cloud Function
 * Server-side calculation of assessment scores
 */
import * as functions from 'firebase-functions';
interface DimensionScore {
    dimensionId: string;
    averageWeight: number;
    score: number;
    classification: string;
}
/**
 * Calculate dimension scores from assessment responses
 */
export declare const calculateDimensionScores: (responses: {
    [dimensionId: string]: {
        [questionId: string]: number;
    };
}) => Promise<DimensionScore[]>;
/**
 * Calculate overall health index
 */
export declare const calculateOverallHealthIndex: (dimensionScores: DimensionScore[]) => Promise<number>;
/**
 * HTTP Cloud Function to calculate scores
 */
export declare const calculateScores: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Batch process assessments (scheduled function)
 */
export declare const batchProcessAssessments: functions.CloudFunction<unknown>;
declare const _default: {
    calculateScores: functions.HttpsFunction & functions.Runnable<any>;
    calculateDimensionScores: (responses: {
        [dimensionId: string]: {
            [questionId: string]: number;
        };
    }) => Promise<DimensionScore[]>;
    calculateOverallHealthIndex: (dimensionScores: DimensionScore[]) => Promise<number>;
    batchProcessAssessments: functions.CloudFunction<unknown>;
};
export default _default;
