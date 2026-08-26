# Firebase Cloud Function Deployment Guide

## Overview
This guide deploys a Firebase Cloud Function that automatically initializes the DISHA Firestore database with:
- 3 sample schools
- 15 challenges catalog
- 14 dimensions catalog

## Prerequisites

### 1. Install Node.js and npm
```bash
# Download from: https://nodejs.org/
# Recommended: Node.js 18 LTS
node --version
npm --version
```

### 2. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase --version
```

### 3. Authenticate with Firebase
```bash
firebase login
```

## Deployment Steps

### Step 1: Navigate to Project Directory
```bash
cd c:\disha-diagnostic-engine
```

### Step 2: Install Dependencies
```bash
cd functions
npm install
cd ..
```

### Step 3: Build Cloud Functions
```bash
cd functions
npm run build
cd ..
```

### Step 4: Deploy Functions
```bash
firebase deploy --only functions
```

**Expected output:**
```
i  deploying functions
i  functions: ensuring necessary APIs are enabled...
i  functions: preparing functions directory for upload...
i  functions: packaged functions (XX.XX KB) for uploading
i  functions: functions directory upload complete
i  functions: updating Node.js 18 function initializeDISHADatabase...
i  functions: updating Node.js 18 function getDeploymentStatus...
✔  functions[initializeDISHADatabase]: Successful update operation.
✔  functions[getDeploymentStatus]: Successful update operation.

Deploy complete!
```

## Using the Cloud Functions

### Method 1: Using Firebase Console

1. Go to: https://console.firebase.google.com/project/disha-diagnostics
2. Click **Functions** (left sidebar)
3. Click **initializeDISHADatabase**
4. Click **Testing** tab
5. Click **Call the function**
6. See the result in the console

### Method 2: Using Firebase CLI

```bash
firebase functions:call initializeDISHADatabase
```

### Method 3: From Your Application

```javascript
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

const initializeDatabase = httpsCallable(functions, "initializeDISHADatabase");

initializeDatabase()
  .then((result) => {
    console.log("Database initialized:", result.data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### Method 4: Using REST API

```bash
curl -X POST \
  https://asia-south1-disha-diagnostics.cloudfunctions.net/initializeDISHADatabase \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Check Deployment Status

### Via Firebase Console

1. Go to: https://console.firebase.google.com/project/disha-diagnostics
2. Click **Firestore Database**
3. Verify collections exist:
   - `schools` (3 documents)
   - `challenges_catalog` (15 documents)
   - `dimensions_catalog` (14 documents)

### Via Cloud Function

Call `getDeploymentStatus` function to check data:

```bash
firebase functions:call getDeploymentStatus
```

Expected response:
```json
{
  "success": true,
  "status": {
    "schools": 3,
    "challenges": 15,
    "dimensions": 14,
    "timestamp": "2026-08-02T18:00:00Z"
  }
}
```

## Verify Data in Firestore

### Schools Collection
- school_001_delhi_premium: Delhi Excellence Academy (CBSE, 850 students)
- school_002_mumbai_midmarket: Mumbai Excellence Institute (ICSE, 650 students)
- school_003_bangalore_budget: Bangalore Public School (CBSE, 500 students)

### Challenges Catalog (15 total)
- C1-C3: Growth & Enrollment
- C4-C6: People & Staffing
- C7-C9: Academic & Wellbeing
- C10-C12: Reputation & Competition
- C13-C15: Operations & Finance

### Dimensions Catalog (14 total)
- D01: Academic Reputation & Rigour
- D02: Teacher Welfare & Development
- D03: Leadership & Governance
- D04: Parent Engagement & SLA
- D05: Student Safety & Wellness
- D06: Infrastructure & Facilities
- D07: Co-Curricular Education
- D08: Individual Attention (PTR)
- D09: Value for Money
- D10: Special Needs Inclusivity
- D11: Community Service & Responsibility
- D12: Faculty Competence & Retention
- D13: Internationalism & Cultural Diversity
- D14: Management Vision & Growth Drive

## Next Steps

1. ✅ Deploy Cloud Functions (this guide)
2. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Verify data in Firebase Console
4. Create web/mobile app to use the DISHA system

## Troubleshooting

### Error: "Permission denied" during deployment
**Solution:**
- Ensure Firebase CLI is authenticated: `firebase login`
- Check project ID: `firebase projects:list`
- Verify service account has Functions Admin role in Google Cloud Console

### Error: "Function failed with status code 403"
**Solution:**
- User must be authenticated in your app
- Check Firestore security rules allow writes

### Error: "npm ERR! code ERESOLVE"
**Solution:**
```bash
cd functions
npm install --legacy-peer-deps
cd ..
```

### Functions not updating
**Solution:**
```bash
firebase functions:delete initializeDISHADatabase
firebase deploy --only functions
```

## Architecture Diagram

```
Firebase Console / CLI / App
         |
         v
    Cloud Function
   (Node.js runtime)
         |
         ├─-> Create Schools
         ├─-> Create Challenges
         └─-> Create Dimensions
                 |
                 v
          Firestore Database
          (asia-south1)
```

## Pricing

**Cloud Functions:**
- 2M invocations/month: FREE (always free tier)
- Each invocation: $0.40 per million after free tier

**Firestore:**
- Reads: $0.06 per 100,000
- Writes: $0.18 per 100,000
- Deletes: $0.02 per 100,000

**Storage:**
- $2.75 per GB/month (India region)

For more details: https://firebase.google.com/pricing

## Support

For issues:
1. Check Cloud Function logs: `firebase functions:log`
2. View Firestore errors in Firebase Console
3. Verify security rules: Firebase Console → Firestore → Rules
4. Test with simple document: Create manually in Console first

---

**Created:** 2026-08-02  
**Status:** Ready for deployment  
**Project:** DISHA Diagnostics Engine
