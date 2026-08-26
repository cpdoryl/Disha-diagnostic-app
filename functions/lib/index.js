"use strict";
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
exports.analyzeTrends = exports.analyzeDimensions = exports.generateDiagnosticReport = exports.onCycleCompletion = exports.generateRecommendations = exports.isBlindSpot = exports.runGapAnalysis = exports.calculateMetrics = exports.detectEarlyWarnings = exports.generateFirstOpinionReport = exports.onMultiplierWrite = exports.onChallengeResponseWrite = exports.batchRecalculateAllCycles = exports.recalculateCycleScores = exports.syncMultipliers = exports.deleteChallengeResponse = exports.submitBatchChallengeResponses = exports.submitChallengeResponse = exports.runSimulation = exports.generate14DReport = exports.analyzeCheckup = exports.getDeploymentStatus = exports.initializeDISHADatabase = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
exports.initializeDISHADatabase = functions.https.onCall(async (data, context) => {
    // Verify caller is authenticated
    if (!context.auth) {
        return {
            success: false,
            message: "Authentication required",
            error: "User must be authenticated"
        };
    }
    try {
        console.log("Starting DISHA database initialization...");
        // Create schools
        const schoolsData = [
            {
                schoolId: "school_001_delhi_premium",
                name: "Delhi Excellence Academy",
                board: "CBSE",
                tier: "Premium",
                city: "Delhi",
                state: "Delhi",
                totalStudents: 850,
                totalTeachers: 60,
                principalName: "Dr. Rajesh Kumar",
                principalEmail: "principal@delexcellence.edu",
                status: "Active",
                subscriptionPlan: "Enterprise",
                registrationDate: admin.firestore.Timestamp.now()
            },
            {
                schoolId: "school_002_mumbai_midmarket",
                name: "Mumbai Excellence Institute",
                board: "ICSE",
                tier: "Mid-Market",
                city: "Mumbai",
                state: "Maharashtra",
                totalStudents: 650,
                totalTeachers: 45,
                principalName: "Ms. Priya Sharma",
                status: "Active",
                subscriptionPlan: "Professional",
                registrationDate: admin.firestore.Timestamp.now()
            },
            {
                schoolId: "school_003_bangalore_budget",
                name: "Bangalore Public School",
                board: "CBSE",
                tier: "Budget",
                city: "Bangalore",
                state: "Karnataka",
                totalStudents: 500,
                totalTeachers: 35,
                principalName: "Mr. Ramesh V",
                status: "Active",
                subscriptionPlan: "Starter",
                registrationDate: admin.firestore.Timestamp.now()
            }
        ];
        let schoolsCreated = 0;
        for (const school of schoolsData) {
            await db.collection("schools").doc(school.schoolId).set(school);
            schoolsCreated++;
            console.log(`Created school: ${school.name}`);
        }
        // Create challenges catalog
        const challengesData = [
            { challengeId: "C1", name: "Enrollment Decline", domain: "Growth & Enrollment" },
            { challengeId: "C2", name: "Student Attrition", domain: "Growth & Enrollment" },
            { challengeId: "C3", name: "Fee Collection", domain: "Growth & Enrollment" },
            { challengeId: "C4", name: "Teacher Attrition", domain: "People & Staffing" },
            { challengeId: "C5", name: "Staff Capability", domain: "People & Staffing" },
            { challengeId: "C6", name: "Leadership Gap", domain: "People & Staffing" },
            { challengeId: "C7", name: "Academic Decline", domain: "Academic & Wellbeing" },
            { challengeId: "C8", name: "Student Wellbeing", domain: "Academic & Wellbeing" },
            { challengeId: "C9", name: "Remedial Lag", domain: "Academic & Wellbeing" },
            { challengeId: "C10", name: "Parent Communication", domain: "Reputation & Competition" },
            { challengeId: "C11", name: "Competitive Pressure", domain: "Reputation & Competition" },
            { challengeId: "C12", name: "Brand Issues", domain: "Reputation & Competition" },
            { challengeId: "C13", name: "Cost Inflation", domain: "Operations & Finance" },
            { challengeId: "C14", name: "Infrastructure Deficits", domain: "Operations & Finance" },
            { challengeId: "C15", name: "Compliance Stress", domain: "Operations & Finance" }
        ];
        let challengesCreated = 0;
        for (const challenge of challengesData) {
            await db.collection("challenges_catalog").doc(challenge.challengeId).set(challenge);
            challengesCreated++;
            console.log(`Created challenge: ${challenge.challengeId} - ${challenge.name}`);
        }
        // Create dimensions catalog
        const dimensionsData = [
            { dimensionId: "D01", name: "Academic Reputation & Rigour", weight: 7 },
            { dimensionId: "D02", name: "Teacher Welfare & Development", weight: 7 },
            { dimensionId: "D03", name: "Leadership & Governance", weight: 7 },
            { dimensionId: "D04", name: "Parent Engagement & SLA", weight: 7 },
            { dimensionId: "D05", name: "Student Safety & Wellness", weight: 7 },
            { dimensionId: "D06", name: "Infrastructure & Facilities", weight: 7 },
            { dimensionId: "D07", name: "Co-Curricular Education", weight: 7 },
            { dimensionId: "D08", name: "Individual Attention (PTR)", weight: 7 },
            { dimensionId: "D09", name: "Value for Money", weight: 7 },
            { dimensionId: "D10", name: "Special Needs Inclusivity", weight: 7 },
            { dimensionId: "D11", name: "Community Service & Responsibility", weight: 7 },
            { dimensionId: "D12", name: "Faculty Competence & Retention", weight: 7 },
            { dimensionId: "D13", name: "Internationalism & Cultural Diversity", weight: 7 },
            { dimensionId: "D14", name: "Management Vision & Growth Drive", weight: 7 }
        ];
        let dimensionsCreated = 0;
        for (const dimension of dimensionsData) {
            await db.collection("dimensions_catalog").doc(dimension.dimensionId).set(dimension);
            dimensionsCreated++;
            console.log(`Created dimension: ${dimension.dimensionId} - ${dimension.name}`);
        }
        const result = {
            success: true,
            message: "DISHA database initialization completed successfully",
            data: {
                schoolsCreated,
                challengesCreated,
                dimensionsCreated
            }
        };
        console.log("Deployment complete:", result);
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Deployment failed:", errorMessage);
        return {
            success: false,
            message: "Database initialization failed",
            error: errorMessage
        };
    }
});
exports.getDeploymentStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        return { success: false, error: "Authentication required" };
    }
    try {
        const schoolsSnap = await db.collection("schools").get();
        const challengesSnap = await db.collection("challenges_catalog").get();
        const dimensionsSnap = await db.collection("dimensions_catalog").get();
        return {
            success: true,
            status: {
                schools: schoolsSnap.size,
                challenges: challengesSnap.size,
                dimensions: dimensionsSnap.size,
                timestamp: new Date().toISOString()
            }
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            error: errorMessage
        };
    }
});
// ===== STAGE 1: CHECKUP ANALYZER FUNCTION =====
// Callable function - call with: checkupId, schoolId, checkupData
exports.analyzeCheckup = functions.https.onCall(async (data, context) => {
    try {
        // Validate required parameters
        if (!data.checkupId || !data.schoolId || !data.checkupData) {
            throw new Error('Missing required parameters: checkupId, schoolId, checkupData');
        }
        const checkupId = data.checkupId;
        const schoolId = data.schoolId;
        const checkupData = data.checkupData;
        if (!checkupData.surveyInput || !checkupData.operationalMetricsUploaded) {
            throw new Error('Invalid checkup data: missing survey or metrics');
        }
        // Calculate subjective scores
        const subjectiveScores = {};
        const questions = {
            D1_LeadershipGovernance: ['q9_leadershipGovernance'],
            D2_AcademicExcellence: ['q1_academicExcellence'],
            D3_InfrastructureFacilities: ['q2_infrastructureFacilities'],
            D4_StudentWellbeing: ['q3_studentWellbeing'],
            D5_StaffDevelopment: ['q4_staffDevelopment'],
            D6_CommunityEngagement: ['q5_parentEngagement'],
            D7_InnovationTechnology: ['q6_innovationTechnology'],
            D8_FinancialManagement: ['q7_financialManagement'],
            D9_QualityAssurance: ['q8_qualityAssurance']
        };
        for (const [dimension, qs] of Object.entries(questions)) {
            const answers = qs.map((q) => {
                const answer = checkupData.surveyInput[q];
                return parseInt(answer?.answer) || 0;
            });
            const avgScore = (answers.reduce((sum, a) => sum + a, 0) / answers.length) * 20;
            subjectiveScores[dimension] = {
                surveyScore: Math.round(avgScore * 100) / 100,
                questionsUsed: qs,
                confidence: 'High'
            };
        }
        const subjectiveAvg = Object.values(subjectiveScores).reduce((sum, s) => sum + s.surveyScore, 0) / Object.keys(subjectiveScores).length;
        // Calculate objective metrics
        const metrics = checkupData.operationalMetricsUploaded;
        const objectiveScore = 87.8; // Simplified calculation
        // Calculate health index
        const healthIndex = Math.sqrt(subjectiveAvg * objectiveScore);
        // Save analysis
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('checkups')
            .doc(checkupId)
            .collection('analysis')
            .doc('current')
            .set({
            layer1_SubjectiveScores: subjectiveScores,
            layer1_Summary: {
                averageSubjective: Math.round(subjectiveAvg * 100) / 100
            },
            layer2_ObjectiveMetrics: {
                objectiveScore: objectiveScore
            },
            layer3_HealthIndex: {
                healthIndex: Math.round(healthIndex * 100) / 100,
                status: healthIndex >= 75 ? 'Excellent' : healthIndex >= 60 ? 'Adequate' : 'Needs Attention'
            },
            generatedAt: admin.firestore.Timestamp.now(),
            version: '1.0'
        });
        // Log audit entry
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('auditLogs')
            .add({
            timestamp: admin.firestore.Timestamp.now(),
            action: 'CHECKUP_ANALYZED',
            entityType: 'checkup',
            entityId: checkupId,
            schoolId: schoolId,
            userId: null,
            metadata: {
                healthIndex: healthIndex,
                status: healthIndex >= 75 ? 'Excellent' : healthIndex >= 60 ? 'Adequate' : 'Needs Attention'
            }
        });
        console.log(`✓ Checkup ${checkupId} analyzed successfully with health index: ${healthIndex}`);
        return { success: true, checkupId, healthIndex };
    }
    catch (error) {
        console.error(`✗ Error analyzing checkup:`, error);
        throw error;
    }
});
// ===== STAGE 2: 14D REPORT GENERATOR FUNCTION =====
exports.generate14DReport = functions.https.onCall(async (data, context) => {
    try {
        const { schoolId, assessmentId } = data;
        if (!context.auth) {
            throw new Error('Authentication required');
        }
        // Fetch assessment and responses
        const assessment = await db
            .collection('schools').doc(schoolId)
            .collection('assessments').doc(assessmentId)
            .get();
        const responses = await db
            .collection('schools').doc(schoolId)
            .collection('assessments').doc(assessmentId)
            .collection('responses')
            .get();
        if (responses.empty) {
            throw new Error('No responses found for this assessment');
        }
        // Aggregate responses by dimension
        const dimensionAnalysis = {};
        for (let d = 1; d <= 14; d++) {
            const dimensionId = `D${String(d).padStart(2, '0')}`;
            const scores = responses.docs
                .map(doc => {
                const data = doc.data();
                return data.answers && data.answers[dimensionId] ? parseInt(data.answers[dimensionId]) : 0;
            })
                .filter((s) => s > 0);
            const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 20 : 0;
            dimensionAnalysis[dimensionId] = {
                dimensionName: `Dimension ${d}`,
                subjectiveAnalysis: {
                    averageScore: Math.round(avgScore * 100) / 100,
                    responseCount: scores.length
                },
                status: avgScore >= 75 ? 'Strong' : avgScore >= 60 ? 'Adequate' : 'Needs Attention'
            };
        }
        // Calculate overall health index
        const overallScore = Object.values(dimensionAnalysis).reduce((sum, d) => sum + d.subjectiveAnalysis.averageScore, 0) / 14;
        // Save report
        const reportRef = db
            .collection('schools').doc(schoolId)
            .collection('reports')
            .doc();
        await reportRef.set({
            reportType: 'Comprehensive14D',
            assessmentId: assessmentId,
            schoolId: schoolId,
            generatedAt: admin.firestore.Timestamp.now(),
            executiveSummary: {
                overallHealthIndex: Math.round(overallScore * 100) / 100,
                overallStatus: overallScore >= 75 ? 'Excellent' : overallScore >= 60 ? 'Adequate' : 'Needs Attention',
                respondentCount: responses.size
            },
            dimensionAnalysis: dimensionAnalysis,
            status: 'PUBLISHED'
        });
        // Log audit entry
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('auditLogs')
            .add({
            timestamp: admin.firestore.Timestamp.now(),
            action: 'REPORT_GENERATED',
            entityType: 'report',
            entityId: reportRef.id,
            schoolId: schoolId,
            userId: null,
            metadata: {
                assessmentId: assessmentId,
                responseCount: responses.size,
                overallHealthIndex: overallScore
            }
        });
        console.log(`✓ 14D Report generated: ${reportRef.id}`);
        return { success: true, reportId: reportRef.id, overallHealthIndex: Math.round(overallScore * 100) / 100 };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`✗ Error generating 14D report:`, errorMessage);
        throw error;
    }
});
// ===== STAGE 3: SIMULATION ENGINE FUNCTION =====
exports.runSimulation = functions.https.onCall(async (data, context) => {
    try {
        const { schoolId, simulationId, scenario } = data;
        if (!context.auth) {
            throw new Error('Authentication required');
        }
        // Fetch baseline scores
        const latestReport = await db
            .collection('schools').doc(schoolId)
            .collection('reports')
            .orderBy('generatedAt', 'desc')
            .limit(1)
            .get();
        if (latestReport.empty) {
            throw new Error('No baseline report found');
        }
        const baselineData = latestReport.docs[0].data();
        const baselineScores = baselineData.executiveSummary?.overallHealthIndex || 65.5;
        // Calculate projected improvement
        const totalInvestment = scenario.totalInvestment || 0;
        const timelineMonths = scenario.timelineMonths || 6;
        // Simplified simulation: estimate 1 point improvement per ₹100k invested
        const projectedImprovement = (totalInvestment / 100000) * 1;
        const projectedHealthIndex = Math.min(baselineScores + projectedImprovement, 100);
        // Save simulation results
        const resultsRef = db
            .collection('schools').doc(schoolId)
            .collection('simulations').doc(simulationId)
            .collection('results')
            .doc('current');
        await resultsRef.set({
            overallImpactSummary: {
                currentHealthIndex: baselineScores,
                projectedHealthIndex: Math.round(projectedHealthIndex * 100) / 100,
                expectedImprovement: Math.round((projectedHealthIndex - baselineScores) * 100) / 100,
                improvementPercentage: Math.round(((projectedHealthIndex - baselineScores) / baselineScores) * 100 * 100) / 100
            },
            resourceEfficiencyAnalysis: {
                totalInvestment: totalInvestment,
                roi: Math.round((projectedImprovement / (totalInvestment || 1)) * 1000) / 10
            },
            decisionSupport: {
                recommendation: 'Proceed with implementation',
                rationale: 'Cost-effective strategy with measurable ROI'
            },
            generatedAt: admin.firestore.Timestamp.now()
        });
        // Log audit entry
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('auditLogs')
            .add({
            timestamp: admin.firestore.Timestamp.now(),
            action: 'SIMULATION_COMPLETED',
            entityType: 'simulation',
            entityId: simulationId,
            schoolId: schoolId,
            userId: null,
            metadata: {
                projectedHealthIndex: projectedHealthIndex,
                totalInvestment: totalInvestment
            }
        });
        console.log(`✓ Simulation ${simulationId} completed with projected index: ${projectedHealthIndex}`);
        return {
            success: true,
            projectedHealthIndex: Math.round(projectedHealthIndex * 100) / 100,
            improvement: Math.round((projectedHealthIndex - baselineScores) * 100) / 100
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`✗ Error running simulation:`, errorMessage);
        throw error;
    }
});
// ====== DISHA First Opinion Engine v3 - Phase 1 ======
// Core calculation engines (S_sub, M_obj, Health Index, Gap/Quadrant)
// Implemented in: src/lib/firstOpinion/calculations.ts
// Tests: src/lib/firstOpinion/calculations.test.ts
// ====== DISHA First Opinion Engine v3 - Phase 2 Functions ======
// API & Calculation Layer: Challenge responses, multiplier sync, real-time recalculation
//
// NOTE: Gen 2 Firestore triggers exported directly from triggers.ts
// (not from index.ts to avoid Gen 1 conversion)
// See: functions/src/firstOpinion/triggers.ts
//
// CRITICAL FIX: Temporarily disabling these exports to prevent Firebase CLI
// from trying to create them in us-central1 (wrong region).
// These will be deployed via manual gcloud CLI commands to ensure asia-south1 region.
// See: .github/workflows/test-and-deploy.yml for manual deployment step
//
// TODO: Re-enable after Firebase CLI fixes region handling
// export { syncMultipliers } from './firstOpinion/multiplierSync';
// export { batchRecalculateAllCycles, recalculateCycleScores } from './firstOpinion/batch';
// Phase 2: Challenge Response Submission APIs
var submitChallengeResponse_1 = require("./firstOpinion/submitChallengeResponse");
Object.defineProperty(exports, "submitChallengeResponse", { enumerable: true, get: function () { return submitChallengeResponse_1.submitChallengeResponse; } });
Object.defineProperty(exports, "submitBatchChallengeResponses", { enumerable: true, get: function () { return submitChallengeResponse_1.submitBatchChallengeResponses; } });
Object.defineProperty(exports, "deleteChallengeResponse", { enumerable: true, get: function () { return submitChallengeResponse_1.deleteChallengeResponse; } });
// Phase 2: Multiplier Sync & Recalculation Orchestration
var multiplierSync_1 = require("./firstOpinion/multiplierSync");
Object.defineProperty(exports, "syncMultipliers", { enumerable: true, get: function () { return multiplierSync_1.syncMultipliers; } });
var recalculateOnDemand_1 = require("./firstOpinion/recalculateOnDemand");
Object.defineProperty(exports, "recalculateCycleScores", { enumerable: true, get: function () { return recalculateOnDemand_1.recalculateCycleScores; } });
var batch_1 = require("./firstOpinion/batch");
Object.defineProperty(exports, "batchRecalculateAllCycles", { enumerable: true, get: function () { return batch_1.batchRecalculateAllCycles; } });
// Phase 2: Firestore Triggers (Gen 1 style - automatic on response/multiplier changes)
var triggers_1 = require("./firstOpinion/triggers");
Object.defineProperty(exports, "onChallengeResponseWrite", { enumerable: true, get: function () { return triggers_1.onChallengeResponseWrite; } });
Object.defineProperty(exports, "onMultiplierWrite", { enumerable: true, get: function () { return triggers_1.onMultiplierWrite; } });
// ====== DISHA First Opinion Engine v3 - Phase 3 ======
// Reporting & Visualization: First Opinion Report generation
var generateFirstOpinionReport_1 = require("./firstOpinion/generateFirstOpinionReport");
Object.defineProperty(exports, "generateFirstOpinionReport", { enumerable: true, get: function () { return generateFirstOpinionReport_1.generateFirstOpinionReport; } });
// ====== DISHA First Opinion Engine v3 - Phase 4 ======
// Predictive & Trend Analysis: Early warning flags, trajectory prediction
var detectEarlyWarnings_1 = require("./firstOpinion/detectEarlyWarnings");
Object.defineProperty(exports, "detectEarlyWarnings", { enumerable: true, get: function () { return detectEarlyWarnings_1.detectEarlyWarnings; } });
// ====== DISHA Phase 3 - 14-Dimension Cloud Functions ======
// Metric calculation, gap analysis, and recommendations engine
var calculateMetrics_1 = require("./14d/calculateMetrics");
Object.defineProperty(exports, "calculateMetrics", { enumerable: true, get: function () { return calculateMetrics_1.calculateMetrics; } });
var gapAnalysis_1 = require("./14d/gapAnalysis");
Object.defineProperty(exports, "runGapAnalysis", { enumerable: true, get: function () { return gapAnalysis_1.runGapAnalysis; } });
Object.defineProperty(exports, "isBlindSpot", { enumerable: true, get: function () { return gapAnalysis_1.isBlindSpot; } });
var recommendations_1 = require("./14d/recommendations");
Object.defineProperty(exports, "generateRecommendations", { enumerable: true, get: function () { return recommendations_1.generateRecommendations; } });
// Phase 4: Firestore Triggers (automatic on cycle score updates)
var onCycleCompletion_1 = require("./firstOpinion/onCycleCompletion");
Object.defineProperty(exports, "onCycleCompletion", { enumerable: true, get: function () { return onCycleCompletion_1.onCycleCompletion; } });
// ====== DISHA Phase 4 - 14-Dimension Analysis & Reporting Functions ======
// Diagnostic reports, dimension analysis, and trend tracking (separate from First Opinion)
var generateReport_1 = require("./analysis/generateReport");
Object.defineProperty(exports, "generateDiagnosticReport", { enumerable: true, get: function () { return generateReport_1.generateDiagnosticReport; } });
var dimensionAnalysis_1 = require("./analysis/dimensionAnalysis");
Object.defineProperty(exports, "analyzeDimensions", { enumerable: true, get: function () { return dimensionAnalysis_1.analyzeDimensions; } });
var trendAnalysis_1 = require("./analysis/trendAnalysis");
Object.defineProperty(exports, "analyzeTrends", { enumerable: true, get: function () { return trendAnalysis_1.analyzeTrends; } });
//# sourceMappingURL=index.js.map