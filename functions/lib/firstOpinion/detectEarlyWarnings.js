"use strict";
/**
 * DISHA First Opinion Engine - Phase 4
 * Early Warning Flag Detection
 *
 * Detects 4 predictive warning signs from multi-cycle data:
 * 1. Diverging Trend: S_sub ↑ while M_obj ↓
 * 2. Multiplier Freefall: Single multiplier drops >15 pts
 * 3. Compounding Weight: Highest-weighted challenge also worst score
 * 4. False Recovery: H improves but only from S_sub, M_obj flat/worse
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
exports.detectEarlyWarnings = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.detectEarlyWarnings = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    try {
        const { schoolId, limit = 10 } = data;
        console.log(`[FirstOpinion] Detecting early warnings for ${schoolId}`);
        // Fetch recent cycles with scores
        const cyclesSnap = await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessmentCycles')
            .orderBy('updatedAt', 'desc')
            .limit(limit)
            .get();
        const cycles = [];
        for (const doc of cyclesSnap.docs) {
            const data = doc.data();
            cycles.push({
                id: doc.id,
                s_sub: data.scores?.s_sub || 0,
                m_obj: data.scores?.m_obj || 0,
                healthIndex: data.scores?.healthIndex || 0,
                updatedAt: data.updatedAt || admin.firestore.Timestamp.now()
            });
        }
        cycles.reverse(); // Chronological order
        const flags = [];
        if (cycles.length < 2) {
            console.log(`[FirstOpinion] Insufficient cycles for trend analysis`);
            return {
                success: true,
                flags: [],
                message: 'Insufficient cycles for trend analysis (need 2+)'
            };
        }
        // FLAG 1: Diverging Trend (S_sub ↑ while M_obj ↓)
        if (cycles.length >= 2) {
            const prev = cycles[cycles.length - 2];
            const curr = cycles[cycles.length - 1];
            const s_sub_change = curr.s_sub - prev.s_sub;
            const m_obj_change = curr.m_obj - prev.m_obj;
            if (s_sub_change > 5 && m_obj_change < -5) {
                flags.push({
                    flag: 'DIVERGING_TREND',
                    severity: 'CRITICAL',
                    detected: true,
                    cycles: 2,
                    message: `Dangerous divergence detected: Perception improving (+${s_sub_change.toFixed(1)}) while operations deteriorating (${m_obj_change.toFixed(1)})`,
                    actionItems: [
                        'Investigate root cause of operational decline',
                        'Reality-check leadership perception',
                        'Increase monitoring frequency',
                        'Activate contingency plans'
                    ],
                    recommendation: 'This is a "Delusional Comfort" pattern. Leadership feels better while operations worsen. Highest priority risk.'
                });
            }
        }
        // FLAG 2: Multiplier Freefall (single multiplier drops >15 pts)
        if (cycles.length >= 2) {
            // Fetch multiplier data for recent cycles
            const prev_cycle = cycles[cycles.length - 2];
            const curr_cycle = cycles[cycles.length - 1];
            const prevMultipliers = await db
                .collection('schools')
                .doc(schoolId)
                .collection('assessmentCycles')
                .doc(prev_cycle.id)
                .collection('multipliers')
                .get();
            const currMultipliers = await db
                .collection('schools')
                .doc(schoolId)
                .collection('assessmentCycles')
                .doc(curr_cycle.id)
                .collection('multipliers')
                .get();
            const prevMap = new Map();
            const currMap = new Map();
            prevMultipliers.docs.forEach(doc => {
                prevMap.set(doc.id, (doc.data().value || 0) * 100);
            });
            currMultipliers.docs.forEach(doc => {
                currMap.set(doc.id, (doc.data().value || 0) * 100);
            });
            for (const [name, currValue] of currMap.entries()) {
                const prevValue = prevMap.get(name) || currValue;
                const change = currValue - prevValue;
                if (change < -15) {
                    flags.push({
                        flag: 'MULTIPLIER_FREEFALL',
                        severity: 'HIGH',
                        detected: true,
                        cycles: 2,
                        message: `Critical decline in ${name}: ${prevValue.toFixed(1)} → ${currValue.toFixed(1)} (${change.toFixed(1)} point drop)`,
                        actionItems: [
                            `Immediate investigation of ${name} metrics`,
                            'Identify triggering events',
                            'Review related processes',
                            'Create recovery action plan'
                        ],
                        recommendation: `Priority action needed on ${name}. Decline of ${Math.abs(change).toFixed(1)} points in one cycle is unsustainable.`
                    });
                }
            }
        }
        // FLAG 3: Compounding Weight (highest-weighted challenge also worst score)
        // Note: Would need challenge-level data, placeholder for Phase 4+ enhancement
        if (cycles.length >= 2) {
            // This flag requires detailed challenge data which would be added in implementation
            // Placeholder for now
        }
        // FLAG 4: False Recovery (H improves but only from S_sub)
        if (cycles.length >= 2) {
            const prev = cycles[cycles.length - 2];
            const curr = cycles[cycles.length - 1];
            const health_change = curr.healthIndex - prev.healthIndex;
            const s_sub_change = curr.s_sub - prev.s_sub;
            const m_obj_change = curr.m_obj - prev.m_obj;
            // Health improved, but M_obj flat or worse, and only S_sub improved
            if (health_change > 5 && s_sub_change > 0 && m_obj_change <= 0) {
                flags.push({
                    flag: 'FALSE_RECOVERY',
                    severity: 'MEDIUM',
                    detected: true,
                    cycles: 2,
                    message: `Health improved (+${health_change.toFixed(1)}) but only from perception (+${s_sub_change.toFixed(1)}), operations unchanged/worse (${m_obj_change.toFixed(1)})`,
                    actionItems: [
                        'Validate perception improvement is justified',
                        'Address operations stagnation',
                        'Increase focus on objective metrics',
                        'Regular reality checks'
                    ],
                    recommendation: 'Improvement is not sustainable if only perception changes. Fix underlying operations.'
                });
            }
        }
        // Calculate overall risk level
        const criticalCount = flags.filter(f => f.severity === 'CRITICAL').length;
        const highCount = flags.filter(f => f.severity === 'HIGH').length;
        let overall_risk = 'LOW';
        if (criticalCount > 0)
            overall_risk = 'CRITICAL';
        else if (highCount >= 2)
            overall_risk = 'HIGH';
        else if (highCount === 1 || flags.length > 2)
            overall_risk = 'MEDIUM';
        // Calculate trajectory
        const getTrajectory = (cycles) => {
            if (cycles.length < 2)
                return 'INSUFFICIENT_DATA';
            const first = cycles[0].healthIndex;
            const last = cycles[cycles.length - 1].healthIndex;
            const diff = last - first;
            if (diff > 10)
                return 'STRONG_IMPROVEMENT';
            if (diff > 0)
                return 'GRADUAL_IMPROVEMENT';
            if (diff > -10)
                return 'STABLE_WITH_SLIGHT_DECLINE';
            return 'SIGNIFICANT_DECLINE';
        };
        // Calculate forecast
        const forecast = () => {
            if (cycles.length < 2)
                return { predictedHealthIndex: 50, confidence: 'LOW' };
            const lastThree = cycles.slice(-3).map(c => c.healthIndex);
            const trend = lastThree.length >= 2 ? (lastThree[lastThree.length - 1] - lastThree[0]) / (lastThree.length - 1) : 0;
            const predicted = lastThree[lastThree.length - 1] + trend;
            return {
                predictedHealthIndex: Math.max(0, Math.min(100, Math.round(predicted * 10) / 10)),
                confidence: 'MEDIUM'
            };
        };
        const analysis = {
            cycles: cycles.length,
            timespan: `${cycles[0].id} to ${cycles[cycles.length - 1].id}`,
            flags,
            overall_risk,
            trajectory: getTrajectory(cycles),
            forecast: forecast()
        };
        // Save analysis
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('firstOpinionAnalysis')
            .doc('earlyWarnings')
            .set(analysis);
        console.log(`[FirstOpinion] Early warning analysis complete: ${flags.length} flags detected`);
        return {
            success: true,
            analysis
        };
    }
    catch (error) {
        console.error('[FirstOpinion] Early warning detection error:', error);
        throw new functions.https.HttpsError('internal', 'Early warning detection failed');
    }
});
exports.default = { detectEarlyWarnings: exports.detectEarlyWarnings };
//# sourceMappingURL=detectEarlyWarnings.js.map