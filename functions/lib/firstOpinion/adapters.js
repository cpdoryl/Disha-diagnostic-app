"use strict";
/**
 * DISHA First Opinion Engine - Data Adapters
 * Converts Firestore Admin SDK types (Timestamp) to calculation engine types (Date)
 * Cloud Functions layer boundary transformation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCalcMultipliers = exports.toCalcChallengeResponses = exports.toCalcMultiplier = exports.toCalcChallengeResponse = void 0;
/**
 * Convert Firestore-shaped challenge response (with Timestamp) to calculation-engine shape (with Date)
 * Admin SDK returns Timestamp objects; calculations expect plain Date
 */
function toCalcChallengeResponse(firestoreDoc) {
    return {
        id: firestoreDoc.id,
        challengeId: firestoreDoc.challengeId,
        responderId: firestoreDoc.responderId,
        role: firestoreDoc.role,
        email: firestoreDoc.email,
        schoolId: firestoreDoc.schoolId,
        cycleId: firestoreDoc.cycleId,
        responses: firestoreDoc.responses || {},
        challenge: firestoreDoc.challenge || {},
        submittedAt: firestoreDoc.submittedAt?.toDate?.() || new Date(),
        updatedAt: firestoreDoc.updatedAt?.toDate?.() || new Date(),
        deleted: firestoreDoc.deleted || false
    };
}
exports.toCalcChallengeResponse = toCalcChallengeResponse;
/**
 * Convert Firestore-shaped multiplier (with Timestamp) to calculation engine shape
 * Strips additional metadata fields (rawData, source, calculation) not needed by calculations
 */
function toCalcMultiplier(firestoreDoc) {
    return {
        id: firestoreDoc.id,
        name: firestoreDoc.name,
        category: firestoreDoc.category,
        value: firestoreDoc.value ?? 0,
        validationStatus: firestoreDoc.validationStatus || 'PENDING',
        validationError: firestoreDoc.validationError,
        updatedAt: firestoreDoc.updatedAt?.toDate?.() || new Date()
    };
}
exports.toCalcMultiplier = toCalcMultiplier;
/**
 * Bulk convert list of Firestore documents to calculation types
 */
function toCalcChallengeResponses(docs) {
    return docs.map(toCalcChallengeResponse);
}
exports.toCalcChallengeResponses = toCalcChallengeResponses;
function toCalcMultipliers(docs) {
    return docs.map(toCalcMultiplier);
}
exports.toCalcMultipliers = toCalcMultipliers;
//# sourceMappingURL=adapters.js.map