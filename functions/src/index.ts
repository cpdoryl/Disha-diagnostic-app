import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { calculateMetrics } from "./14d/calculateMetrics";
import { runGapAnalysis, isBlindSpot } from "./14d/gapAnalysis";
import { generateRecommendations } from "./14d/recommendations";
import { getDb } from "./lib/db";

admin.initializeApp();
const db = getDb();

interface DeploymentResult {
  success: boolean;
  message: string;
  data?: {
    schoolsCreated?: number;
    challengesCreated?: number;
    dimensionsCreated?: number;
  };
  error?: string;
}

export const initializeDISHADatabase = functions.https.onCall(
  async (data, context): Promise<DeploymentResult> => {
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

      const result: DeploymentResult = {
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Deployment failed:", errorMessage);
      return {
        success: false,
        message: "Database initialization failed",
        error: errorMessage
      };
    }
  }
);

export const getDeploymentStatus = functions.https.onCall(
  async (data, context): Promise<any> => {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
);

// ===== STAGE 1: CHECKUP ANALYZER FUNCTION =====
// Callable function - call with: checkupId, schoolId, checkupData

export const analyzeCheckup = functions.https.onCall(
  async (data, context) => {
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
      const subjectiveScores: any = {};
      const questions: any = {
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
        const answers = (qs as string[]).map((q: string) => {
          const answer = checkupData.surveyInput[q];
          return parseInt(answer?.answer) || 0;
        });
        const avgScore = (answers.reduce((sum: number, a: number) => sum + a, 0) / answers.length) * 20;
        subjectiveScores[dimension] = {
          surveyScore: Math.round(avgScore * 100) / 100,
          questionsUsed: qs,
          confidence: 'High'
        };
      }

      const subjectiveAvg = Object.values(subjectiveScores).reduce((sum: number, s: any) => sum + s.surveyScore, 0) / Object.keys(subjectiveScores).length;

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

    } catch (error) {
      console.error(`✗ Error analyzing checkup:`, error);
      throw error;
    }
  });

// ===== STAGE 2: 14D REPORT GENERATOR FUNCTION =====

// The 14 live dimension ids/names from src/data/14DimensionsQuestions.ts
// (FOURTEEN_DIMENSIONS). Cloud Functions can't import that frontend module
// directly (separate package/build), so the id/name pairs are mirrored here -
// keep in sync if dimensions are ever added/renamed there.
const REPORT_DIMENSIONS: Array<{ id: string; name: string }> = [
  { id: 'academic_performance', name: 'Academic Performance & Learning Outcomes' },
  { id: 'curriculum_pedagogy', name: 'Curriculum & Pedagogy Quality' },
  { id: 'teacher_quality', name: 'Teacher Quality, Development & Retention' },
  { id: 'student_wellbeing', name: 'Student Wellbeing & Mental Health' },
  { id: 'student_discipline', name: 'Student Discipline & Behavior' },
  { id: 'infrastructure_facilities', name: 'Infrastructure & Facilities' },
  { id: 'safety_security', name: 'Safety & Security' },
  { id: 'parent_engagement', name: 'Parent Satisfaction & Engagement' },
  { id: 'student_engagement', name: 'Student Satisfaction & Engagement' },
  { id: 'leadership_governance', name: 'Leadership & Governance' },
  { id: 'financial_health', name: 'Financial Health & Sustainability' },
  { id: 'admissions_market', name: 'Admissions, Enrollment & Market Position (Brand/Reputation)' },
  { id: 'technology_digital', name: 'Technology & Digital Readiness' },
  { id: 'cocurricular_holistic', name: 'Co-curricular, Extracurricular & Holistic Development' },
];

export const generate14DReport = functions.https.onCall(
  async (data: any, context: any) => {
    try {
      const { schoolId, assessmentId } = data;

      if (!context.auth) {
        throw new Error('Authentication required');
      }

      // Respondents submit to the flat top-level assessments/{assessmentId}/responses
      // collection (see src/pages/StakeholderSurvey.tsx) - not a schools/{schoolId}-nested
      // path. Each response document has a `responses[dimensionId][questionId]` shape,
      // scored on the app's 1-5 scale (see src/data/14DimensionsQuestions.ts).
      const responses = await db
        .collection('assessments').doc(assessmentId)
        .collection('responses')
        .get();

      if (responses.empty) {
        throw new Error('No responses found for this assessment');
      }

      // Aggregate responses by dimension
      const dimensionAnalysis: any = {};
      for (const dimension of REPORT_DIMENSIONS) {
        const scores: number[] = [];
        responses.docs.forEach(doc => {
          const docData = doc.data();
          const dimensionAnswers = docData.responses?.[dimension.id];
          if (!dimensionAnswers) return;
          const answerValues = Object.values(dimensionAnswers).filter(
            (v): v is number => typeof v === 'number'
          );
          if (answerValues.length === 0) return;
          scores.push(answerValues.reduce((a, b) => a + b, 0) / answerValues.length);
        });

        // Scores are on a 1-5 scale; normalize to a 0-100 index, matching
        // src/lib/dimensionScoring.ts's toIndex().
        const avgScore = scores.length > 0
          ? Math.round(((scores.reduce((a, b) => a + b, 0) / scores.length - 1) / 4) * 100 * 100) / 100
          : 0;

        dimensionAnalysis[dimension.id] = {
          dimensionName: dimension.name,
          subjectiveAnalysis: {
            averageScore: avgScore,
            responseCount: scores.length
          },
          status: avgScore >= 75 ? 'Strong' : avgScore >= 60 ? 'Adequate' : 'Needs Attention'
        };
      }

      // Calculate overall health index
      const overallScore = Object.values(dimensionAnalysis as any).reduce((sum: number, d: any) => sum + d.subjectiveAnalysis.averageScore, 0) / REPORT_DIMENSIONS.length;

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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ Error generating 14D report:`, errorMessage);
      throw error;
    }
  }
);

// ===== STAGE 3: SIMULATION ENGINE FUNCTION =====

export const runSimulation = functions.https.onCall(
  async (data: any, context: any) => {
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ Error running simulation:`, errorMessage);
      throw error;
    }
  }
);

// ====== DISHA Phase 3 - 14-Dimension Cloud Functions ======
// Metric calculation, gap analysis, and recommendations engine
export { calculateMetrics } from './14d/calculateMetrics';
export { runGapAnalysis, isBlindSpot } from './14d/gapAnalysis';
export { generateRecommendations } from './14d/recommendations';

// ====== DISHA Phase 4 - 14-Dimension Analysis & Reporting Functions ======
// Diagnostic reports, dimension analysis, and trend tracking (separate from First Opinion)
export { generateDiagnosticReport } from './analysis/generateReport';
export { analyzeDimensions } from './analysis/dimensionAnalysis';
export { analyzeTrends } from './analysis/trendAnalysis';

// ====== DISHA Stage 3 - Reverse Simulation Engine ======
// Complete reverse outcome modeling with 7-step process
// Goal Setting → Reverse Calculation → Feasibility → Action Mapping →
// Resource Allocation → Timeline → Execution & Monitoring
export {
  setGoalSetting,
  performReverseCalculation,
  analyzeFeasibility,
  generateActionPlan,
  allocateResources,
  generateTimeline,
} from './reverseSimulation';
