"use strict";
/**
 * DISHA First Opinion Engine - Phase 2
 * Challenge Response Submission API
 *
 * Handles submission of challenge responses from schools
 * Supports: Single response, batch responses, anonymous submissions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChallengeResponse = exports.submitBatchChallengeResponses = exports.submitChallengeResponse = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.submitChallengeResponse = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    try {
        const { schoolId, cycleId, challengeId, responderId, role, email, responses } = data;
        // Validate input
        if (!schoolId || !cycleId || !challengeId) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
        }
        // Create challenge response document
        const response = {
            schoolId,
            cycleId,
            challengeId,
            responderId: responderId || `anon_${Date.now()}`,
            role: role,
            email,
            responses: responses,
            challenge: {
                title: '',
                domain: '',
                weight: 0.08,
                description: ''
            },
            submittedAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            deleted: false
        };
        // Soft delete previous response from same respondent for this challenge
        const prevResponsesSnap = await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessmentCycles')
            .doc(cycleId)
            .collection('challengeResponses')
            .where('responderId', '==', response.responderId)
            .where('challengeId', '==', challengeId)
            .where('deleted', '==', false)
            .get();
        if (!prevResponsesSnap.empty) {
            for (const doc of prevResponsesSnap.docs) {
                await doc.ref.update({
                    deleted: true,
                    updatedAt: admin.firestore.Timestamp.now()
                });
            }
        }
        // Save new response
        const docRef = await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessmentCycles')
            .doc(cycleId)
            .collection('challengeResponses')
            .add(response);
        console.log(`[FirstOpinion] Response submitted: ${docRef.id}`);
        return {
            success: true,
            responseId: docRef.id,
            timestamp: admin.firestore.Timestamp.now()
        };
    }
    catch (error) {
        console.error('[FirstOpinion] Error submitting response:', error);
        throw error instanceof functions.https.HttpsError
            ? error
            : new functions.https.HttpsError('internal', 'Failed to submit response');
    }
});
/**
 * Batch submit multiple challenge responses
 * Used for data migration or bulk imports
 */
exports.submitBatchChallengeResponses = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    try {
        const { schoolId, cycleId, responses } = data;
        const batch = db.batch();
        let successCount = 0;
        for (const resp of responses) {
            const docRef = db
                .collection('schools')
                .doc(schoolId)
                .collection('assessmentCycles')
                .doc(cycleId)
                .collection('challengeResponses')
                .doc();
            const challengeResponse = {
                schoolId,
                cycleId,
                challengeId: resp.challengeId,
                responderId: resp.responderId,
                role: resp.role,
                email: resp.email,
                responses: resp.responses,
                challenge: {
                    title: '',
                    domain: '',
                    weight: 0.08,
                    description: ''
                },
                submittedAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
                deleted: false
            };
            batch.set(docRef, challengeResponse);
            successCount++;
        }
        await batch.commit();
        console.log(`[FirstOpinion] Batch submitted: ${successCount} responses`);
        return {
            success: true,
            submitted: successCount,
            timestamp: admin.firestore.Timestamp.now()
        };
    }
    catch (error) {
        console.error('[FirstOpinion] Batch submission error:', error);
        throw new functions.https.HttpsError('internal', 'Batch submission failed');
    }
});
/**
 * Delete/soft-delete a challenge response
 */
exports.deleteChallengeResponse = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    try {
        const { schoolId, cycleId, responseId } = data;
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessmentCycles')
            .doc(cycleId)
            .collection('challengeResponses')
            .doc(responseId)
            .update({
            deleted: true,
            updatedAt: admin.firestore.Timestamp.now()
        });
        console.log(`[FirstOpinion] Response deleted: ${responseId}`);
        return {
            success: true,
            deletedAt: admin.firestore.Timestamp.now()
        };
    }
    catch (error) {
        console.error('[FirstOpinion] Delete error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete response');
    }
});
exports.default = { submitChallengeResponse: exports.submitChallengeResponse, submitBatchChallengeResponses: exports.submitBatchChallengeResponses, deleteChallengeResponse: exports.deleteChallengeResponse };
//# sourceMappingURL=submitChallengeResponse.js.map