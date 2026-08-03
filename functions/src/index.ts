import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

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
