# Deploy Cloud Function via Firebase Console (No CLI Required)

## Why This Approach?
Deploying via the console is the simplest method and doesn't require additional authentication setup.

---

## Step 1: Access Firebase Cloud Functions

1. Go to: https://console.firebase.google.com/project/disha-diagnostics
2. Click **Functions** in the left sidebar
3. You should see Cloud Functions dashboard

---

## Step 2: Create Cloud Function via Console

### Using Cloud Run-based Functions (Recommended)

1. In the Functions page, click **Create Function**
2. Set the following:
   - **Environment:** Node.js 18
   - **Function name:** `initializeDISHADatabase`
   - **Trigger type:** HTTPS
   - **Authentication:** Require authentication
   - **Memory:** 256 MB
   - **Timeout:** 60 seconds

3. In the code editor:

   **index.js:**
   ```javascript
   const functions = require("firebase-functions");
   const admin = require("firebase-admin");

   admin.initializeApp();
   const db = admin.firestore();

   exports.initializeDISHADatabase = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
       return { success: false, error: "Authentication required" };
     }

     try {
       console.log("Creating sample data...");

       // Schools
       const schools = [
         {
           schoolId: "school_001_delhi_premium",
           name: "Delhi Excellence Academy",
           board: "CBSE",
           tier: "Premium",
           city: "Delhi",
           totalStudents: 850
         },
         {
           schoolId: "school_002_mumbai_midmarket",
           name: "Mumbai Excellence Institute",
           board: "ICSE",
           tier: "Mid-Market",
           city: "Mumbai",
           totalStudents: 650
         },
         {
           schoolId: "school_003_bangalore_budget",
           name: "Bangalore Public School",
           board: "CBSE",
           tier: "Budget",
           city: "Bangalore",
           totalStudents: 500
         }
       ];

       for (const school of schools) {
         await db.collection("schools").doc(school.schoolId).set(school);
       }
       console.log("Created 3 schools");

       // Challenges
       const challenges = [
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

       for (const challenge of challenges) {
         await db.collection("challenges_catalog").doc(challenge.challengeId).set(challenge);
       }
       console.log("Created 15 challenges");

       // Dimensions
       const dimensions = [
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

       for (const dimension of dimensions) {
         await db.collection("dimensions_catalog").doc(dimension.dimensionId).set(dimension);
       }
       console.log("Created 14 dimensions");

       return {
         success: true,
         message: "DISHA database initialized successfully",
         data: {
           schoolsCreated: 3,
           challengesCreated: 15,
           dimensionsCreated: 14
         }
       };

     } catch (error) {
       console.error("Error:", error);
       return {
         success: false,
         error: error.message
       };
     }
   });
   ```

   **package.json:**
   ```json
   {
     "name": "disha-setup",
     "version": "1.0.0",
     "dependencies": {
       "firebase-admin": "^12.0.0",
       "firebase-functions": "^5.0.0"
     }
   }
   ```

4. Click **Deploy**

Wait 2-3 minutes for the function to deploy.

---

## Step 3: Test the Function

1. After deployment, the function will appear in the Functions list
2. Click **initializeDISHADatabase**
3. Click **Testing** tab
4. Click **Call the function**

**Expected result:**
```json
{
  "result": {
    "success": true,
    "message": "DISHA database initialized successfully",
    "data": {
      "schoolsCreated": 3,
      "challengesCreated": 15,
      "dimensionsCreated": 14
    }
  }
}
```

---

## Step 4: Verify Data in Firestore

1. Go to **Firestore Database**
2. Click **Collections** tab
3. You should see:
   - `schools` collection (3 documents)
   - `challenges_catalog` collection (15 documents)
   - `dimensions_catalog` collection (14 documents)

---

## Alternative: Simple Python Script (No Firebase CLI)

If you prefer a simpler approach, use this Python script:

```python
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase
cred = credentials.Certificate("firebase-service-account.json")
app = firebase_admin.initialize_app(cred)
db = firestore.client(app=app)

print("Creating sample data...")

# Schools
schools = [
    {"schoolId": "school_001", "name": "Delhi Excellence Academy", "board": "CBSE", "city": "Delhi", "students": 850},
    {"schoolId": "school_002", "name": "Mumbai Excellence Institute", "board": "ICSE", "city": "Mumbai", "students": 650},
    {"schoolId": "school_003", "name": "Bangalore Public School", "board": "CBSE", "city": "Bangalore", "students": 500}
]

for school in schools:
    db.collection("schools").document(school["schoolId"]).set(school)
    print(f"Created: {school['name']}")

print("Sample data created successfully!")
```

---

## Troubleshooting

### Function deploy fails
- Check Cloud Functions API is enabled in Google Cloud
- Verify your account has Editor role on the project

### Function fails when called
- Check function logs in Firebase Console
- Verify Firestore database exists and is accessible
- Check security rules allow writes to collections

### Data not appearing in Firestore
- Wait 5-10 seconds after calling function
- Refresh Firestore console
- Check function logs for errors

---

## Next Steps

1. ✅ Deploy Cloud Function
2. Deploy Firestore Security Rules:
   - Go to Firestore → Rules tab
   - Copy from: `firestore-security-rules.txt`
   - Publish
3. Test the application workflows

---

**Time estimate:** 10-15 minutes  
**Difficulty:** Easy  
**No CLI authentication required:** ✅
