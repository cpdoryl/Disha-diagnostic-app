"use strict";
/**
 * DISHA First Opinion Engine - Multiplier Sync API
 * Admin-gated Cloud Function to sync 8 multiplier values from external systems
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
exports.syncMultipliers = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Lazy initialization: get db inside the function, not at module load time
const getDb = () => admin.firestore();
/**
 * Known multiplier IDs and names
 * Must match the 8 defined in seed data
 */
const KNOWN_MULTIPLIERS = new Set([
    'M1',
    'M2',
    'M3',
    'M4',
    'M5',
    'M6',
    'M7',
    'M8' // Extracurricular Participation (EXPANDED)
]);
/**
 * Multiplier threshold ranges for validation
 * Maps M_id → {lower, upper} for OUTLIER detection
 */
const MULTIPLIER_RANGES = {
    M1: { lower: 0, upper: 60 },
    M2: { lower: 0, upper: 120 },
    M3: { lower: 0, upper: 500 },
    M4: { lower: 0, upper: 100 },
    M5: { lower: 0, upper: 100 },
    M6: { lower: 0, upper: 100 },
    M7: { lower: 0, upper: 100 },
    M8: { lower: 0, upper: 100 } // Extracurricular: 0-100%
};
/**
 * Cloud Function: Sync multiplier values from external systems
 * Only callable by admin-verified users (via Firebase Auth custom claims)
 *
 * Flow:
 * 1. Verify caller is school admin (token.schoolId matches + token.role in ['admin', 'principal'])
 * 2. Validate all 8 multiplier IDs present
 * 3. Compute validationStatus for each (VALID, OUTLIER, MISSING, PENDING)
 * 4. Write to Firestore subcollection
 * 5. Triggers fire → recalculate scores
 */
exports.syncMultipliers = functions
    .region('asia-south1')
    .https.onCall(async (data, context) => {
    try {
        // ===== AUTH GATE =====
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userId = context.auth.uid;
        const schoolId = data.schoolId;
        const cycleId = data.cycleId;
        const schoolIdFromToken = context.auth.token.schoolId;
        const roleFromToken = context.auth.token.role;
        // Verify admin + school match
        if (schoolIdFromToken !== schoolId) {
            throw new functions.https.HttpsError('permission-denied', `User schoolId (${schoolIdFromToken}) does not match request schoolId (${schoolId})`);
        }
        if (!['admin', 'principal'].includes(roleFromToken)) {
            throw new functions.https.HttpsError('permission-denied', `User role (${roleFromToken}) is not admin or principal`);
        }
        // ===== VALIDATION =====
        if (!data.multipliers || !Array.isArray(data.multipliers)) {
            throw new functions.https.HttpsError('invalid-argument', 'Payload must include "multipliers" array');
        }
        const errors = [];
        const warnings = [];
        let synced = 0;
        // Validate payload structure
        for (let i = 0; i < data.multipliers.length; i++) {
            const m = data.multipliers[i];
            if (!m.id)
                errors.push(`Multiplier ${i}: missing id`);
            if (m.value === undefined || m.value === null) {
                errors.push(`Multiplier ${i} (${m.id}): missing value`);
            }
            else if (typeof m.value !== 'number') {
                errors.push(`Multiplier ${i} (${m.id}): value must be number`);
            }
            else if (m.value < 0 || m.value > 1) {
                errors.push(`Multiplier ${i} (${m.id}): value out of range [0, 1]`);
            }
        }
        if (errors.length > 0) {
            console.warn(`[SyncMultipliers] Validation errors for ${schoolId}/${cycleId}:`, errors);
            return {
                success: false,
                message: `Validation failed: ${errors.length} error(s)`,
                errors
            };
        }
        // Check all 8 multipliers are present
        const providedIds = new Set(data.multipliers.map(m => m.id));
        for (const knownId of KNOWN_MULTIPLIERS) {
            if (!providedIds.has(knownId)) {
                errors.push(`Missing multiplier: ${knownId}`);
            }
        }
        if (errors.length > 0) {
            console.warn(`[SyncMultipliers] Missing multipliers for ${schoolId}/${cycleId}:`, errors);
            return {
                success: false,
                message: `Incomplete payload: ${errors.length} error(s)`,
                errors
            };
        }
        // ===== WRITE MULTIPLIERS =====
        const cycleRef = getDb()
            .collection('schools')
            .doc(schoolId)
            .collection('assessmentCycles')
            .doc(cycleId);
        for (const m of data.multipliers) {
            // Compute validation status based on range
            const range = MULTIPLIER_RANGES[m.id];
            let validationStatus = 'VALID';
            let validationError;
            if (!range) {
                validationStatus = 'PENDING';
                validationError = `Unknown multiplier ${m.id}`;
            }
            else if (m.value < range.lower || m.value > range.upper) {
                validationStatus = 'OUTLIER';
                validationError = `Value ${m.value} outside expected range [${range.lower}, ${range.upper}]`;
            }
            // Write multiplier doc
            const multiplierRef = cycleRef.collection('multipliers').doc(m.id);
            await multiplierRef.set({
                id: m.id,
                name: `Multiplier ${m.id}`,
                value: m.value,
                validationStatus,
                validationError: validationError || null,
                source: m.source || 'Manual',
                updatedAt: admin.firestore.Timestamp.now(),
                updatedBy: userId
            }, { merge: true });
            synced++;
            if (validationStatus !== 'VALID') {
                warnings.push(`${m.id}: ${validationStatus}${validationError ? ` - ${validationError}` : ''}`);
            }
        }
        // Audit log
        await getDb().collection('schools').doc(schoolId).collection('auditLogs').add({
            event: 'MULTIPLIERS_SYNCED',
            cycleId,
            syncedCount: synced,
            performedBy: userId,
            performedAt: admin.firestore.Timestamp.now(),
            source: 'Callable Function'
        });
        console.log(`[SyncMultipliers] Success: ${synced}/${data.multipliers.length} synced for ${schoolId}/${cycleId}`);
        return {
            success: true,
            message: `Successfully synced ${synced} multiplier(s)`,
            synced,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[SyncMultipliers] Error:', message);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', message);
    }
});
exports.default = { syncMultipliers: exports.syncMultipliers };
//# sourceMappingURL=multiplierSync.js.map