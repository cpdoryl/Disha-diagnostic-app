# Quick Start: Deploy DISHA with Cloud Functions

## TL;DR - Three Commands

```bash
# 1. Install dependencies
cd functions && npm install && cd ..

# 2. Build and deploy
npm run build && firebase deploy --only functions

# 3. Call the function from Firebase Console or CLI
firebase functions:call initializeDISHADatabase
```

---

## Step-by-Step (5 minutes)

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ Logged into Firebase (`firebase login`)
- ✅ Service account JSON downloaded

### Deployment

**Step 1: Prepare Functions**
```bash
cd c:\disha-diagnostic-engine
cd functions
npm install
cd ..
```

**Step 2: Build**
```bash
cd functions
npm run build
cd ..
```

**Step 3: Deploy**
```bash
firebase deploy --only functions
```

Wait for confirmation message: `✔ functions[initializeDISHADatabase]: Successful update operation.`

### Step 4: Initialize Database

**Option A: Firebase Console (Easiest)**
1. Go to: https://console.firebase.google.com/project/disha-diagnostics/functions
2. Click `initializeDISHADatabase`
3. Click Testing tab
4. Click "Call the function"
5. See result: "DISHA database initialization completed successfully"

**Option B: Command Line**
```bash
firebase functions:call initializeDISHADatabase
```

**Option C: From Your App**
```javascript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const initialize = httpsCallable(functions, "initializeDISHADatabase");
initialize().then(result => console.log(result.data));
```

### Step 5: Verify

Go to Firestore Console → Collections tab. You should see:
- `schools` (3 documents)
- `challenges_catalog` (15 documents)
- `dimensions_catalog` (14 documents)

---

## What Gets Created

### Schools (3)
| ID | Name | Board | City | Students |
|---|---|---|---|---|
| school_001 | Delhi Excellence Academy | CBSE | Delhi | 850 |
| school_002 | Mumbai Excellence Institute | ICSE | Mumbai | 650 |
| school_003 | Bangalore Public School | CBSE | Bangalore | 500 |

### Challenges (15)
**Growth & Enrollment (C1-C3)**
- C1: Enrollment Decline
- C2: Student Attrition
- C3: Fee Collection

**People & Staffing (C4-C6)**
- C4: Teacher Attrition
- C5: Staff Capability
- C6: Leadership Gap

**Academic & Wellbeing (C7-C9)**
- C7: Academic Decline
- C8: Student Wellbeing
- C9: Remedial Lag

**Reputation & Competition (C10-C12)**
- C10: Parent Communication
- C11: Competitive Pressure
- C12: Brand Issues

**Operations & Finance (C13-C15)**
- C13: Cost Inflation
- C14: Infrastructure Deficits
- C15: Compliance Stress

### Dimensions (14)
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

---

## Troubleshooting

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
firebase login
```

### "Permission denied" during deploy
```bash
firebase login  # Re-authenticate
firebase projects:list  # Verify project
```

### "npm ERR! code ERESOLVE"
```bash
cd functions
npm install --legacy-peer-deps
npm run build
cd ..
firebase deploy --only functions
```

### Function fails with 404 errors
- Ensure Firestore database exists
- Check Firestore security rules allow writes
- Verify service account has Firestore Admin permissions

### No data appears in Firestore
1. Call the function again
2. Wait 5-10 seconds
3. Refresh Firebase Console
4. Check Cloud Function logs: `firebase functions:log`

---

## What's Next

1. ✅ **Database initialized** with sample data
2. **Deploy Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Test the Application:**
   - Create assessments
   - Run Stage 1: First Opinion Engine
   - Run Stage 2: 14-D EWISR Assessment
   - Run Stage 3: Reverse Outcome Modeling

4. **Monitor in Firestore Console:**
   https://console.firebase.google.com/project/disha-diagnostics/firestore

---

## Files Created

- `functions/package.json` - Dependencies
- `functions/src/index.ts` - Cloud Function code
- `functions/tsconfig.json` - TypeScript config
- `firebase.json` - Firebase project config
- `.firebaserc` - Firebase CLI config

---

## References

- Cloud Functions: https://firebase.google.com/docs/functions
- Firestore: https://firebase.google.com/docs/firestore
- Firebase CLI: https://firebase.google.com/docs/cli

**Status:** Ready to deploy  
**Time estimate:** 5 minutes  
**Difficulty:** Easy
