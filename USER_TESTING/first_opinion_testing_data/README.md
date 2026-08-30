# 🧪 FIRST OPINION ENGINE - TESTING DATA SUITE

**Purpose:** Complete test data for First Opinion Engine v3 feature validation  
**Location:** `USER_TESTING/first_opinion_testing_data/`  
**Date Created:** August 30, 2026  
**Status:** 🟢 Ready for Testing

---

## 📁 **FOLDER STRUCTURE**

```
first_opinion_testing_data/
├── README.md (this file)
├── DEMO_SCENARIOS.md (demo walkthrough guide)
├── TEST_EXECUTION_LOG.md (track test runs)
│
├── 1_SCHOOL_PROFILES/
│   ├── school_profile_tier1_metro.json
│   ├── school_profile_tier2_capital.json
│   ├── school_profile_tier3_rural.json
│   └── school_profiles_batch.json
│
├── 2_CHALLENGE_RESPONSES/
│   ├── challenge_responses_scenario_1_healthy.json
│   ├── challenge_responses_scenario_2_struggling.json
│   ├── challenge_responses_scenario_3_critical.json
│   ├── challenge_responses_scenario_4_mixed.json
│   └── challenge_responses_batch_import.json
│
├── 3_MULTIPLIER_DATA/
│   ├── multipliers_scenario_1_strong.json
│   ├── multipliers_scenario_2_weak.json
│   ├── multipliers_scenario_3_mixed.json
│   └── multipliers_batch_import.csv
│
├── 4_COMPLETE_WORKFLOWS/
│   ├── workflow_scenario_1_high_performer.json
│   ├── workflow_scenario_2_turnaround.json
│   ├── workflow_scenario_3_delusional_comfort.json
│   └── workflow_scenario_4_blind_spot.json
│
└── 5_DATA_FORMATS/
    ├── FORMAT_GUIDE.md
    ├── json_schema_challenge_response.json
    ├── json_schema_multiplier.json
    └── csv_template_multiplier_data.csv
```

---

## 🎯 **QUICK START - 3 MINUTE TEST**

### **Option 1: Manual UI Testing (Recommended)**
```
1. Go to: https://disha.rylneuroacademy.com/
2. Click "First Opinion Check" → "Start First Opinion Checkup"
3. Use data from: 2_CHALLENGE_RESPONSES/challenge_responses_scenario_1_healthy.json
4. Fill 15 challenges with responses shown in that file
5. Submit and verify report
```

### **Option 2: Data-Driven Testing (Advanced)**
```
1. Use: 4_COMPLETE_WORKFLOWS/workflow_scenario_*.json
2. These include: school profile + all challenge responses + multipliers
3. Pre-built complete scenarios with expected results
4. Shows score calculations and report output
```

---

## 📋 **TEST SCENARIOS**

### **Scenario 1: Healthy School ✅**
```
File: 2_CHALLENGE_RESPONSES/challenge_responses_scenario_1_healthy.json
Description: School performing well across all domains
Expected Results:
  ✅ S_sub (Perception): 82-88 (high, confident leadership)
  ✅ M_obj (Reality): 78-85 (data supports perception)
  ✅ H (Health Index): 78-82 (GOOD status)
  ✅ Gap: 30-40 (ALIGNED quadrant)
  ✅ No early warnings
Use Case: Baseline validation, normal school operation
```

### **Scenario 2: Struggling School ⚠️**
```
File: 2_CHALLENGE_RESPONSES/challenge_responses_scenario_2_struggling.json
Description: School facing challenges in multiple domains
Expected Results:
  ✅ S_sub (Perception): 45-55 (leadership aware of issues)
  ✅ M_obj (Reality): 40-50 (data confirms struggles)
  ✅ H (Health Index): 35-42 (FAIR/POOR status)
  ✅ Gap: 45-55 (ALIGNED quadrant)
  ✅ Multiple recommendations
Use Case: Turnaround opportunity, action planning
```

### **Scenario 3: Critical Alert 🚨**
```
File: 2_CHALLENGE_RESPONSES/challenge_responses_scenario_3_critical.json
Description: School in crisis across most domains
Expected Results:
  ✅ S_sub (Perception): 25-35 (leadership aware)
  ✅ M_obj (Reality): 20-30 (severe operational issues)
  ✅ H (Health Index): 18-25 (CRITICAL status)
  ✅ Gap: 45-55 (ALIGNED - they know about it)
  ✅ Urgent recommendations
Use Case: Crisis intervention, immediate board alerts
```

### **Scenario 4: Delusional Comfort ⚠️ BLIND SPOT**
```
File: 2_CHALLENGE_RESPONSES/challenge_responses_scenario_4_mixed.json
Description: Leadership overconfident, operations declining
Expected Results:
  ✅ S_sub (Perception): 75-85 (leadership feels good)
  ✅ M_obj (Reality): 35-45 (operations actually struggling)
  ✅ H (Health Index): 22-35 (POOR - after delusion penalty)
  ✅ Gap: 75+ (PERCEPTION_BETTER - BLIND SPOT!)
  ✅ Delusional Comfort Penalty: 25-30 pts
  ✅ Critical early warning: DIVERGING TREND
Use Case: Most dangerous case, leadership needs wake-up call
```

---

## 📊 **DATA FILES OVERVIEW**

### **1. School Profiles** (`1_SCHOOL_PROFILES/`)
```
Each school profile includes:
  ✅ School name and basic info
  ✅ Board (CBSE, ICSE, IB, etc)
  ✅ School size (student count)
  ✅ Fee band (annual tuition)
  ✅ City tier (metro, capital, tier-2, tier-3, rural)

Usage:
  - Set these baseline parameters before filling challenges
  - Affects baseline expectations for scoring
  - Used for benchmarking against comparable schools
```

### **2. Challenge Responses** (`2_CHALLENGE_RESPONSES/`)
```
Each challenge response includes:
  ✅ Challenge ID (C1-C15)
  ✅ Challenge name
  ✅ Domain (Growth, People, Academic, Reputation, Operations)
  ✅ Response value (1-6 scale)
  ✅ Response label (No Impact → Significant Challenge)
  ✅ Weight for calculation

Usage:
  - Fill these responses in the web form
  - Or use for automated testing/data validation
  - One response per challenge (15 total)
```

### **3. Multiplier Data** (`3_MULTIPLIER_DATA/`)
```
Each multiplier includes:
  ✅ Multiplier name (STR, Parent SLA, Training Hours, etc)
  ✅ Multiplier value (0.0-1.0 scale)
  ✅ Category (CORE or EXPANDED)
  ✅ Validation status (VALID, MISSING, OUTLIER)
  ✅ Data source
  ✅ Updated timestamp

Usage:
  - Import via Firebase console or API
  - Or use to validate admin data entry
  - All 8 multipliers needed for accurate scoring
```

### **4. Complete Workflows** (`4_COMPLETE_WORKFLOWS/`)
```
Each complete workflow includes:
  ✅ Full school profile
  ✅ All 15 challenge responses
  ✅ All 8 multiplier values
  ✅ Expected calculated scores
  ✅ Expected report sections
  ✅ Expected early warnings

Usage:
  - Fastest way to test complete flow
  - Shows expected output for validation
  - Pre-built realistic scenarios
```

---

## 🚀 **TESTING WORKFLOW**

### **Test Flow 1: Manual UI Testing (Recommended)**
```
STEP 1: Open App
  $ Go to https://disha.rylneuroacademy.com/
  $ Login

STEP 2: Start First Opinion
  $ Click "First Opinion Check" in menu
  $ Click "Start First Opinion Checkup"

STEP 3: Fill School Profile
  $ Select Board: CBSE (or from profile file)
  $ Select School Size: Tier 1 Metro (or from profile file)
  $ Select Fee Band: Medium (or from profile file)

STEP 4: Answer Challenges
  $ Read file: 2_CHALLENGE_RESPONSES/challenge_responses_scenario_1_healthy.json
  $ For each challenge (C1-C15):
    - Click challenge
    - Select response option matching the file
    - Record response

STEP 5: Submit
  $ Scroll to bottom
  $ Click "Submit" / "Generate Report"
  $ Wait 5-10 seconds

STEP 6: Verify Report
  $ Compare report scores with 4_COMPLETE_WORKFLOWS/ file
  $ Verify all sections present
  $ Check for early warnings (if applicable)

STEP 7: Validate Database
  $ Open Firebase Console
  $ Check: schools → [school] → assessmentCycles
  $ Verify all 15 responses saved
  $ Verify scores calculated
```

### **Test Flow 2: Automated Testing (Data-Driven)**
```
STEP 1: Prepare Test Data
  $ Copy data from 4_COMPLETE_WORKFLOWS/workflow_scenario_1_high_performer.json

STEP 2: Use API or Batch Import
  $ Option A: Use Firebase Console to import data
  $ Option B: Use Cloud Function: submitBatchChallengeResponses()
  $ Option C: Manual entry via UI

STEP 3: Run Calculations
  $ System auto-calculates when responses submitted
  $ Or manually trigger: recalculateScores()

STEP 4: Compare Results
  $ Check actual vs expected scores
  $ Validate calculations match formula

STEP 5: Generate Report
  $ Call: generateFirstOpinionReport()
  $ Or view in dashboard

STEP 6: Verify Against Expected
  $ Compare report output with test scenario file
  $ Document any discrepancies
```

---

## 🔍 **VALIDATION CHECKLIST**

### **After Each Test, Verify:**

#### **UI Level**
```
☐ Form loads without errors
☐ All 15 challenges visible
☐ Challenges grouped by 5 domains
☐ Response options clearly labeled
☐ Submit button works
☐ Report page loads after submit
☐ NO "14D Deployment" step visible
```

#### **Data Level (Firebase)**
```
☐ 15 challengeResponses created
☐ 8 multipliers stored
☐ scores calculated (s_sub, m_obj, h, gap)
☐ quadrant determined (ALIGNED, REALITY_BETTER, PERCEPTION_BETTER)
☐ NO 14D Assessment data mixed in
☐ Data structure matches schema
```

#### **Report Level**
```
☐ Health Index displayed (0-100)
☐ S_sub score shown (0-100)
☐ M_obj score shown (0-100)
☐ Gap score shown (0-100)
☐ Quadrant analysis present
☐ Challenge drivers ranked
☐ 8 Multipliers listed
☐ Recommendations provided
☐ Expected early warnings (if applicable)
```

#### **Console Level (F12)**
```
☐ NO red errors
☐ NO "14D" references
☐ NO "DeepDiveAssessment" logs
☐ Clean, informational logs only
```

---

## 📝 **LOGGING TEST RESULTS**

### **Create Test Record**
```
1. Copy TEST_EXECUTION_LOG.md
2. Fill in:
   - Test Date & Time
   - Tester Name
   - Scenario Used
   - Expected Scores
   - Actual Scores
   - Pass/Fail Status
   - Issues Found
   - Admin Sign-Off
3. Save with timestamp: TEST_RESULTS_[DATE]_[SCENARIO].md
```

---

## 🎓 **HOW TO USE EACH FILE**

### **1. School Profiles**
```json
File: school_profile_tier1_metro.json

Usage in App:
  1. Note the "schoolSize" and "feeBand" values
  2. In app, select matching values from dropdowns
  3. This sets baseline expectations for scoring

Example:
  "schoolSize": "Large (1500+ students)"
  "feeBand": "Premium (₹75k+ per year)"
  "cityTier": "Tier 1 (Metro)"
  
  → Select these in app before filling challenges
```

### **2. Challenge Responses**
```json
File: challenge_responses_scenario_1_healthy.json

Usage in App:
  1. Open file and review all 15 responses
  2. For each challenge in app:
    - Find the challenge ID in the file (e.g., "C1")
    - Read the "response" value
    - Select that option in the web form
  3. Continue for all 15 challenges

Example:
  "challengeId": "C1",
  "response": 2,  ← Select "Minor Challenge" (if option 2)
  "label": "Enrollment Decline"
  
  → Click C1 in app, select the response matching value 2
```

### **3. Multiplier Data**
```json
File: multipliers_scenario_1_strong.json

Usage (Admin Only):
  1. Open Firebase Console
  2. Navigate to schools → [school] → assessmentCycles → [cycle] → multipliers
  3. For each of 8 multipliers:
    - Create/update document
    - Set fields from file: name, value, category, validationStatus
  4. Wait for auto-recalculation

Or via API:
  $ Call syncMultipliers() with this data array
```

### **4. Complete Workflows**
```json
File: workflow_scenario_1_high_performer.json

This is the GOLD STANDARD for comparison:
  ✅ Shows complete workflow
  ✅ Shows expected scores
  ✅ Shows expected report
  ✅ Shows expected early warnings

Usage:
  1. Run test (manually or automated)
  2. Open this file
  3. Compare your results with expected results
  4. Validate calculations match
  5. Document any differences
```

---

## 💾 **IMPORTING TEST DATA**

### **Method 1: Manual UI Entry (Recommended for Testing)**
```
1. Read file: challenge_responses_scenario_X.json
2. Go to app
3. Fill each challenge with response from file
4. Submit and verify
```

### **Method 2: Firebase Console Import**
```
1. Open Firebase Console
2. Go to Firestore Database
3. Manually create documents with data from JSON files
4. System auto-calculates
5. View results in app
```

### **Method 3: Cloud Function API (Batch)**
```
1. Use: 2_CHALLENGE_RESPONSES/challenge_responses_batch_import.json
2. Call: functions.httpsCallable('submitBatchChallengeResponses')
3. Pass data array from file
4. System processes all 15 at once
5. Returns results
```

### **Method 4: CSV Import (Multipliers)**
```
1. Use: 3_MULTIPLIER_DATA/multipliers_batch_import.csv
2. Parse CSV rows
3. Call: syncMultipliers() API
4. Pass array of multiplier objects
5. Validates against 8 known multiplier names
```

---

## ✅ **SUCCESS CRITERIA**

```
Test PASSES when:
  ✅ All 15 challenges submitted
  ✅ Report generates without errors
  ✅ Health Index calculated (0-100)
  ✅ All scores match formula
  ✅ Scores within expected range for scenario
  ✅ Early warnings detected correctly
  ✅ NO console errors
  ✅ Data persists in Firestore
  ✅ NO 14D Assessment interference

Test FAILS if:
  ❌ Form submission errors
  ❌ Scores out of expected range
  ❌ Missing challenge responses
  ❌ Console errors present
  ❌ 14D data mixed in
  ❌ Report doesn't generate
  ❌ Database writes fail
```

---

## 📞 **TROUBLESHOOTING**

### **Issue: "Could not submit form"**
```
Solution:
  1. Verify all 15 challenges answered
  2. Check browser console for error message
  3. Verify Firebase connection
  4. Try smaller test first (just 3 challenges)
```

### **Issue: "Scores don't match expected"**
```
Solution:
  1. Verify challenge responses match file exactly
  2. Check multiplier values in database
  3. Validate against formula in reference document
  4. Check for delusional comfort penalty (if H < expected)
```

### **Issue: "Early warnings not showing"**
```
Solution:
  1. Ensure scenario has multiple cycles (flags need cycle 2+)
  2. Check detection criteria in early warnings function
  3. Verify thresholds in code match reference doc
  4. Check calculation logs
```

---

## 📅 **TESTING SCHEDULE**

```
Week 1: Scenario 1 (Healthy) - Baseline validation
Week 2: Scenario 2 (Struggling) - Turnaround case
Week 3: Scenario 3 (Critical) - Crisis management
Week 4: Scenario 4 (Delusional) - Blind spot detection

Bonus: Multi-cycle trend analysis (after multiple test runs)
```

---

## 🔗 **RELATED DOCUMENTS**

- `DEMO_SCENARIOS.md` - Live walkthrough guide with screenshots
- `TEST_EXECUTION_LOG.md` - Record of all test runs
- `FIRST_OPINION_V3_MASTER_VERIFICATION_DOCUMENT.md` - Full testing procedures
- `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` - Technical reference

---

**Ready to Test?** → Start with `DEMO_SCENARIOS.md` for step-by-step walkthrough!
