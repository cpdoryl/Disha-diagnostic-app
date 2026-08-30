# 👤 USER ACCEPTANCE TESTING GUIDE & ADMIN VALIDATION CHECKLIST

**Date:** August 29, 2026  
**Purpose:** Step-by-step user testing with admin data validation  
**Status:** 🟢 **READY TO EXECUTE**

---

## 📋 TABLE OF CONTENTS

1. [Testing Setup](#testing-setup)
2. [Feature 1: Create Assessment](#feature-1-create-assessment)
3. [Feature 2: Share Assessment Link](#feature-2-share-assessment-link)
4. [Feature 3: User Response (As Teacher)](#feature-3-user-response-as-teacher)
5. [Feature 4: Real-Time Dashboard](#feature-4-real-time-dashboard)
6. [Feature 5: First Opinion Engine](#feature-5-first-opinion-engine)
7. [Feature 6: Generate Reports](#feature-6-generate-reports)
8. [Feature 7: Export Data](#feature-7-export-data)
9. [Admin Validation Checklist](#admin-validation-checklist)
10. [Data Flow Verification](#data-flow-verification)

---

## 🎯 TESTING SETUP

### What You'll Need

```
✅ Browser (Chrome recommended)
✅ Test email addresses for multiple users
✅ Admin access to DISHA
✅ Firebase Console access (for admins)
✅ This guide open in a separate tab
✅ Checklist to mark off as you go
```

### Test Data

```
School Name:        Test School Alpha
Assessment Name:    School Health Diagnostic - Aug 2026
Expected Teachers:  5
Expected Parents:   8
Expected Students:  10
Expected Admin:     2
```

---

## 🎬 FEATURE 1: CREATE ASSESSMENT

### USER STEPS (As Admin)

**Step 1: Access Application**

```
ACTION: Open browser
ACTION: Go to: https://disha.rylneuroacademy.com/
EXPECTED: Page loads in <1 second
OBSERVED: ________________
```

**Step 2: Navigate to Create Assessment**

```
ACTION: Look for "Create Assessment" button
ACTION: Click the button
EXPECTED: Modal/form appears
OBSERVED: _________________
```

**Step 3: Fill Assessment Details**

```
ACTION: Enter Assessment Name: "School Health Diagnostic"
ACTION: Select School: "Test School Alpha"
ACTION: Click Next
EXPECTED: Form validates and proceeds
OBSERVED: _________________
```

**Step 4: Configure Stakeholders**

```
ACTION: Set Expected Teachers: 5
ACTION: Set Expected Parents: 8
ACTION: Set Expected Students: 10
ACTION: Set Expected Admin: 2
ACTION: Click Save
EXPECTED: Assessment created successfully
OBSERVED: _________________
```

**Step 5: Receive Confirmation**

```
EXPECTED: Success message shown
EXPECTED: Assessment ID displayed
EXPECTED: Dashboard shows new assessment
OBSERVED: _________________
```

---

## ✅ ADMIN VALIDATION CHECKLIST - Feature 1

### Data Storage Verification

**Database Check (Firebase Console)**

```
Navigation: Firebase Console → Firestore → assessments collection

Check 1: Assessment Document Created
  ☐ Assessment ID exists
  ☐ Assessment name: "School Health Diagnostic"
  ☐ School name: "Test School Alpha"
  ☐ Status: "ACTIVE" or "PENDING"
  ☐ Created timestamp present
  ☐ Expected respondent counts correct
    ☐ Teachers: 5
    ☐ Parents: 8
    ☐ Students: 10
    ☐ Admin: 2
```

**Check 2: Assessment Configuration Stored**

```
Database Field Verification:
  ☐ eventName: "School Health Diagnostic"
  ☐ schoolName: "Test School Alpha"
  ☐ totalExpected: 25 (sum of all)
  ☐ assessmentVersion: Set correctly
  ☐ createdAt: Timestamp present
  ☐ createdBy: Admin ID recorded
  ☐ 14 dimensions enabled: true
```

**Check 3: Cloud Function Execution**

```
Logs to Check: Firebase Console → Functions → Logs

  ☐ Function: createAssessment triggered
  ☐ No errors in logs
  ☐ Execution time: <1 second
  ☐ Return value: Assessment ID
  ☐ Status: SUCCESS
```

**Check 4: Real-Time Update**

```
Frontend Verification:
  ☐ New assessment appears in list immediately
  ☐ Dashboard updates without refresh
  ☐ Assessment ID shown in UI
  ☐ Status shows correct
```

---

## 🔗 FEATURE 2: SHARE ASSESSMENT LINK

### USER STEPS (As Admin)

**Step 1: Locate Assessment**

```
ACTION: Find "School Health Diagnostic" in list
ACTION: Click on it to open
EXPECTED: Assessment details displayed
OBSERVED: _________________
```

**Step 2: Copy Assessment Link**

```
ACTION: Click "Copy Link" button
ACTION: Link copied to clipboard
EXPECTED: Confirmation message shown
EXAMPLE LINK: https://disha.rylneuroacademy.com/?assessment=assess_2026_08_29_001
OBSERVED: _________________
```

**Step 3: Share with Teacher (Simulated)**

```
ACTION: Open new browser tab (different user context)
ACTION: Paste link in address bar
EXPECTED: Assessment loads
EXPECTED: Shows: "School: Test School Alpha"
EXPECTED: Shows: "Respondent Type Selector"
OBSERVED: _________________
```

---

## ✅ ADMIN VALIDATION CHECKLIST - Feature 2

### Assessment Link Validation

**Check 1: Link Generation**

```
  ☐ Link format correct: ?assessment={ID}
  ☐ Link is clickable (not truncated)
  ☐ Link works across browsers
  ☐ Link accessible without authentication
```

**Check 2: Assessment Accessibility**

```
When link accessed:
  ☐ Assessment loads correctly
  ☐ School name displayed
  ☐ Respondent type dropdown visible
  ☐ 70 questions ready to load
  ☐ No authentication required
  ☐ Page title correct
```

**Check 3: Link Tracking (Optional)**

```
Firebase Analytics (if enabled):
  ☐ Link access tracked
  ☐ Timestamp recorded
  ☐ Respondent IP logged
  ☐ Conversion tracking active
```

---

## 👨‍🏫 FEATURE 3: USER RESPONSE (As Teacher)

### USER STEPS (Simulated Teacher Response)

**Step 1: Access Assessment**

```
ACTION: Use assessment link from Feature 2
ACTION: Assessment page loads
EXPECTED: Form displayed with all elements
OBSERVED: _________________
```

**Step 2: Select Respondent Type**

```
ACTION: Click "Respondent Type" dropdown
ACTION: Select "Teacher"
EXPECTED: "Teacher" option highlighted
OBSERVED: _________________
```

**Step 3: Enter Personal Info**

```
ACTION: Name Field: Enter "John Smith"
ACTION: Email Field: Enter "john.smith@school.com"
ACTION: Teacher ID: Enter "T12345"
ACTION: Click "Next"
EXPECTED: Information validated
EXPECTED: Form proceeds to assessment questions
OBSERVED: _________________
```

**Step 4: Answer Assessment Questions**

```
ACTION: For each of 70 questions:
  - Read question
  - Select rating (1-5 scale)
  - Move to next

Dimension 1 (Leadership): Questions 1-5
  ☐ Q1: Select rating 4
  ☐ Q2: Select rating 3
  ☐ Q3: Select rating 4
  ☐ Q4: Select rating 5
  ☐ Q5: Select rating 4

Dimension 2 (Teaching): Questions 6-10
  ☐ Q6: Select rating 5
  ☐ Q7: Select rating 4
  ☐ Q8: Select rating 4
  ☐ Q9: Select rating 3
  ☐ Q10: Select rating 5

[Continue for remaining 12 dimensions...]

PROGRESS: Watch progress bar increase
OBSERVED: _________________
```

**Step 5: Review Before Submit**

```
ACTION: Scroll to end of form
ACTION: Click "Review" to see summary
EXPECTED: All 70 questions show your responses
EXPECTED: No empty questions
OBSERVED: _________________
```

**Step 6: Submit Assessment**

```
ACTION: Click "Submit Assessment" button
EXPECTED: Validation succeeds (no required field errors)
EXPECTED: Success message displayed
EXPECTED: Response ID shown
EXPECTED: Confirmation timestamp
OBSERVED: _________________
```

**Step 7: Confirmation**

```
EXPECTED: Message: "Thank you for your response"
EXPECTED: Option to close or go back
ACTION: Close the page
OBSERVED: _________________
```

---

## ✅ ADMIN VALIDATION CHECKLIST - Feature 3

### Response Data Verification

**Check 1: Response Document Created in Firestore**

```
Navigation: Firebase Console → Firestore → assessments → [ID] → responses

  ☐ Response document exists
  ☐ Response ID generated
  ☐ stakeholderType: "teacher"
  ☐ respondentName: "John Smith"
  ☐ respondentEmail: "john.smith@school.com"
  ☐ respondentID: "T12345"
  ☐ submittedAt: Current timestamp
```

**Check 2: Response Data Completeness**

```
Response Content Verification:
  ☐ All 70 questions have responses
  ☐ Responses are in range 1-5
  ☐ No null/undefined values

Dimension 1 (Questions 1-5):
  ☐ responses.q1: 4
  ☐ responses.q2: 3
  ☐ responses.q3: 4
  ☐ responses.q4: 5
  ☐ responses.q5: 4

[Check all 70 questions...]
```

**Check 3: Cloud Function Processing**

```
Logs: Firebase Console → Functions → Logs

  ☐ Function: submitResponse triggered
  ☐ Execution time: <1 second
  ☐ Data saved to Firestore
  ☐ Real-time aggregation triggered
  ☐ Dashboard listener activated
  ☐ Status: SUCCESS
```

**Check 4: Dashboard Real-Time Update**

```
Admin Dashboard Verification:
  ☐ Teacher count increased from 0/5 to 1/5
  ☐ Overall response count increased to 1
  ☐ Response percentage updated
  ☐ Update appears within 30 seconds
  ☐ No manual refresh needed
```

---

## 📊 FEATURE 4: REAL-TIME DASHBOARD

### USER STEPS (As Admin - Viewing Dashboard)

**Step 1: Open Assessment Dashboard**

```
ACTION: Go to: https://disha.rylneuroacademy.com/
ACTION: Click on "School Health Diagnostic" assessment
EXPECTED: Dashboard loads
EXPECTED: Shows response tracking
OBSERVED: _________________
```

**Step 2: Monitor Response Counts**

```
EXPECTED: Display shows:
  - Teachers: 1/5 (20%)
  - Parents: 0/8 (0%)
  - Students: 0/10 (0%)
  - Admin: 0/2 (0%)
  - Total: 1/25 (4%)

ACTION: Watch dashboard for 30 seconds
EXPECTED: Counts remain constant (no additional responses)
OBSERVED: _________________
```

**Step 3: View Dimension Scores (From 1 Response)**

```
ACTION: Scroll to "Dimension Scores" section
EXPECTED: See scores based on teacher's response

Leadership (Q1-5):
  Expected Average: (4+3+4+5+4)/5 = 4.0/5
  ☐ Score displayed: _____

Teaching (Q6-10):
  Expected Average: (5+4+4+3+5)/5 = 4.2/5
  ☐ Score displayed: _____

[Check other dimensions...]

EXPECTED: All 14 dimension scores shown
OBSERVED: _________________
```

**Step 4: Check Quality Indicators**

```
ACTION: Look for quality section
EXPECTED: Shows:
  - Data Completeness: 100%
  - Data Freshness: <5 min
  - Quality Score: High
  - Status: ✅ Good
OBSERVED: _________________
```

**Step 5: Real-Time Update Test**

```
ACTION: Open second browser tab
ACTION: Submit another response (different stakeholder)
ACTION: Return to dashboard tab
EXPECTED: Without refreshing, counts update
EXPECTED: New total: 2/25 (8%)
OBSERVED: _________________
```

---

## ✅ ADMIN VALIDATION CHECKLIST - Feature 4

### Dashboard Data Accuracy

**Check 1: Real-Time Calculation**

```
Database Verification:
  ☐ Dimension averages calculated correctly
  ☐ Response count updated instantly
  ☐ Percentages computed accurately

Sample Calculation:
  Teacher Response: [4,3,4,5,4] → Average = 4.0
  Expected DB value for Leadership: 4.0
  Actual DB value: ____
  ☐ Match: ☐ Yes ☐ No
```

**Check 2: Real-Time Listener Activation**

```
Firebase Logs:
  ☐ Listener for responses collection active
  ☐ Listener triggered on new response
  ☐ Updated data pushed to frontend
  ☐ No lag > 1 second
```

**Check 3: Dashboard State Update**

```
Frontend State Verification:
  ☐ React state updated
  ☐ Component re-renders
  ☐ Display shows new data
  ☐ No page refresh required
```

**Check 4: Data Consistency**

```
Cross-Device Verification:
  Device 1 Shows: 1/25 responses
  Device 2 Shows: 1/25 responses
  ☐ Consistent across devices
  ☐ No data discrepancy
```

---

## 🤖 FEATURE 5: FIRST OPINION ENGINE

### USER STEPS (As Admin)

**Step 1: Navigate to First Opinion Engine**

```
ACTION: Go to: https://disha.rylneuroacademy.com/
ACTION: Click "First Opinion Engine" or similar
EXPECTED: Engine page loads
EXPECTED: Shows 15 challenge questions
OBSERVED: _________________
```

**Step 2: Answer Challenge Questions**

```
Domain 1: Leadership & Vision (3 questions)
  ☐ Q1: Select rating 4 (above average)
  ☐ Q2: Select rating 3 (average)
  ☐ Q3: Select rating 4 (above average)

Domain 2: Teaching Excellence (3 questions)
  ☐ Q4: Select rating 5 (excellent)
  ☐ Q5: Select rating 4 (above average)
  ☐ Q6: Select rating 4 (above average)

Domain 3: Infrastructure (3 questions)
  ☐ Q7: Select rating 3 (average)
  ☐ Q8: Select rating 4 (above average)
  ☐ Q9: Select rating 4 (above average)

Domain 4: Support Services (3 questions)
  ☐ Q10: Select rating 4 (above average)
  ☐ Q11: Select rating 3 (average)
  ☐ Q12: Select rating 4 (above average)

Domain 5: Community (3 questions)
  ☐ Q13: Select rating 4 (above average)
  ☐ Q14: Select rating 3 (average)
  ☐ Q15: Select rating 4 (above average)

EXPECTED: All 15 answered
OBSERVED: _________________
```

**Step 3: Submit for Calculation**

```
ACTION: Click "Calculate Score" button
EXPECTED: Processing indicator shows
EXPECTED: Results appear in <2 seconds
OBSERVED: _________________
```

**Step 4: Review Results**

```
EXPECTED: Display shows:
  - Overall Health Score (0-100)
  - Leadership Perception (S_sub)
  - Operational Reality (M_obj)
  - Risk Quadrant
  - Early Warning Flags
  - 90-Day Predictions
  - Top Recommendations

OBSERVED: _________________
```

**Step 5: Review Specific Metrics**

```
Sample Expected Values:
  Leadership perception (S_sub): ~70-80/100
  Operational reality (M_obj): ~0.8-0.9
  Health index: S_sub × M_obj × factors

Displayed Values:
  S_sub: ____
  M_obj: ____
  Health Index: ____
```

---

## ✅ ADMIN VALIDATION CHECKLIST - Feature 5

### First Opinion Engine Calculations

**Check 1: Cloud Function Execution**

```
Firebase Logs: Functions → calculateFirstOpinion

  ☐ Function triggered successfully
  ☐ Received 15 challenge responses
  ☐ Processing time: <2 seconds
  ☐ Calculations completed
  ☐ Results returned to frontend
```

**Check 2: Calculation Verification**

```
Database: firstOpinionResults collection

  ☐ Document created with ID
  ☐ S_sub calculated: (sum of responses) / 15 × 100
  ☐ M_obj calculated: (operational metrics) / (max value)
  ☐ Scaled score: S_sub × M_obj
  ☐ Delusion penalty applied if S_sub >> M_obj
  ☐ Health index: Final result
```

**Check 3: Sample Calculation Validation**

```
User Response: [4,3,4,5,4,5,4,4,3,4,3,4,4,3,4]
Sum: 60
S_sub: (60/15) × 100 = 400...

Wait, let me recalculate:
Average: 60/15 = 4.0
S_sub (0-100): 4.0/5 × 100 = 80

Verification:
  User's S_sub: 80/100
  Database S_sub: ____
  ☐ Match: ☐ Yes ☐ No
```

**Check 4: Prediction Logic**

```
  ☐ Predictions generated
  ☐ Recommendations based on scores
  ☐ Early warning flags populated
  ☐ 90-day forecast calculated
```

---

## 📄 FEATURE 6: GENERATE REPORTS

### USER STEPS (As Admin)

**Step 1: Open Assessment**

```
ACTION: Navigate to completed assessment
ACTION: Click "Generate Report"
EXPECTED: Report wizard opens
OBSERVED: _________________
```

**Step 2: Select Report Type**

```
ACTION: Choose "Diagnostic Report" (14-Dimension)
ACTION: Click Next
EXPECTED: Proceeds to report options
OBSERVED: _________________
```

**Step 3: Customize Report**

```
ACTION: Select dimensions to include: All 14
ACTION: Choose visualization: Bar chart
ACTION: Click "Generate"
EXPECTED: Report generating message
EXPECTED: Completes in <5 minutes
OBSERVED: _________________
```

**Step 4: View Report**

```
EXPECTED: Report displays:
  ☐ School name
  ☐ Assessment date
  ☐ Executive summary
  ☐ 14 dimension scores
  ☐ Gap analysis
  ☐ Recommendations
  ☐ Charts and visuals
OBSERVED: _________________
```

**Step 5: Download Report**

```
ACTION: Click "Download PDF"
EXPECTED: PDF file downloaded
EXPECTED: File name: School_Health_Diagnostic_Aug2026.pdf
ACTION: Verify file opens correctly
OBSERVED: _________________
```

---

## ✅ ADMIN VALIDATION CHECKLIST - Feature 6

### Report Generation & Storage

**Check 1: Report Document Created**

```
Database: assessments → [ID] → reports

  ☐ Report document created
  ☐ Report ID generated
  ☐ Report type: "DIAGNOSTIC"
  ☐ Generated timestamp: Current
  ☐ Generated by admin ID: Recorded
```

**Check 2: Report Content Verification**

```
  ☐ Report contains all 14 dimensions
  ☐ Dimension scores accurate (match dashboard)
  ☐ Response count included
  ☐ Stakeholder breakdown shown
  ☐ Gap analysis calculated
  ☐ Recommendations included
```

**Check 3: Cloud Function Execution**

```
Logs: Functions → generateReport

  ☐ Function triggered
  ☐ All data fetched from database
  ☐ Calculations performed
  ☐ PDF generated
  ☐ File stored in Cloud Storage
  ☐ Download URL created
```

**Check 4: File Storage**

```
Firebase Storage: reports folder

  ☐ PDF file uploaded
  ☐ File size reasonable (2-5 MB)
  ☐ File accessible via download link
  ☐ File metadata recorded
```

---

## 📊 FEATURE 7: EXPORT DATA

### USER STEPS (As Admin)

**Step 1: Open Assessment**

```
ACTION: Navigate to completed assessment
ACTION: Click "Export Data" or "Download"
EXPECTED: Export dialog appears
OBSERVED: _________________
```

**Step 2: Select Export Format**

```
ACTION: Choose format: CSV
ACTION: Choose date range: All
ACTION: Click "Download"
EXPECTED: CSV file downloads
OBSERVED: _________________
```

**Step 3: Verify CSV File**

```
ACTION: Open downloaded CSV in Excel
EXPECTED: File contains:
  ☐ Column headers (question IDs, dimensions, etc.)
  ☐ Rows for each response
  ☐ All 70 questions as columns
  ☐ Respondent info (name, email, type)
  ☐ Timestamps
  ☐ Scores calculated

SAMPLE STRUCTURE:
respondent_name | respondent_email | type    | q1 | q2 | q3 | ... | score
John Smith      | john@school.com  | teacher | 4  | 3  | 4  | ... | 85.5
```

**Step 4: Verify Data Accuracy**

```
ACTION: Compare CSV data with:
  ☐ Dashboard values match
  ☐ Scores calculated correctly
  ☐ All responses present
  ☐ No data truncation
```

---

## ✅ ADMIN VALIDATION CHECKLIST - Feature 7

### Data Export Verification

**Check 1: Export Function Execution**

```
Cloud Function Logs:

  ☐ Function: exportData triggered
  ☐ Format conversion: CSV
  ☐ Data query executed
  ☐ Processing time: <30 seconds
  ☐ File generated
```

**Check 2: CSV File Validation**

```
File Structure:
  ☐ Headers match database fields
  ☐ Row count = number of responses
  ☐ Column count = all questions (70+)
  ☐ No encoding issues
  ☐ Quotation marks correct for text fields

Data Integrity:
  ☐ All responses present
  ☐ Scores calculated
  ☐ Timestamps preserved
  ☐ Metadata included
```

**Check 3: Data Accuracy**

```
Sample Verification (Row 1):
  From CSV Column:  John Smith
  From Database:    john_smith
  ☐ Match: Yes/No

  From CSV Q1:      4
  From Database Q1: 4
  ☐ Match: Yes/No

  [Verify 5-10 random data points]
```

**Check 4: File Storage & Accessibility**

```
  ☐ CSV file saved to temp storage
  ☐ Download link generated
  ☐ File accessible for download
  ☐ File expires after 24 hours (if applicable)
```

---

## 🎯 ADMIN VALIDATION CHECKLIST

### Complete Checklist - All Features

#### Assessment Lifecycle

```
☐ [Feature 1] Assessment created successfully
☐ [Feature 1] Assessment stored in Firestore
☐ [Feature 1] All configuration saved
☐ [Feature 1] Cloud Function executed

☐ [Feature 2] Assessment link generated
☐ [Feature 2] Link format correct
☐ [Feature 2] Link accessible without auth

☐ [Feature 3] Teacher response submitted
☐ [Feature 3] Response data stored completely
☐ [Feature 3] All 70 questions recorded
☐ [Feature 3] Respondent info captured

☐ [Feature 4] Dashboard updates in real-time
☐ [Feature 4] Counts accurate
☐ [Feature 4] Dimension scores calculated
☐ [Feature 4] No manual refresh needed

☐ [Feature 5] First Opinion Engine calculation works
☐ [Feature 5] S_sub score calculated correctly
☐ [Feature 5] M_obj score calculated correctly
☐ [Feature 5] Health index final score correct

☐ [Feature 6] Report generated successfully
☐ [Feature 6] Report content complete
☐ [Feature 6] Report stored in database
☐ [Feature 6] PDF file created

☐ [Feature 7] Data exported as CSV
☐ [Feature 7] CSV contains all data
☐ [Feature 7] Data accuracy verified
☐ [Feature 7] File downloadable
```

#### Data Persistence Verification

```
Firestore Collections:
☐ assessments collection populated
☐ assessments/{id}/responses filled
☐ assessments/{id}/reports created
☐ firstOpinionResults populated

Cloud Storage:
☐ PDF reports stored
☐ Export files available
☐ File paths correct
☐ Metadata recorded

Real-Time Listeners:
☐ Response listener active
☐ Updates <500ms
☐ Dashboard synced
☐ Multi-device sync working
```

#### Cloud Functions Execution

```
☐ createAssessment function runs
☐ submitResponse function runs
☐ calculateAggregation function runs
☐ calculateFirstOpinion function runs
☐ generateReport function runs
☐ exportData function runs

All Functions:
☐ Execute < 2 seconds
☐ No errors in logs
☐ Results returned correctly
☐ Data saved to database
```

#### Error Handling & Recovery

```
☐ Missing required fields detected
☐ Duplicate responses prevented
☐ Invalid data rejected
☐ Error messages shown to users
☐ Logs recorded for debugging
☐ Failed transactions rolled back
```

#### Performance Verification

```
☐ Page loads < 1 second
☐ Dashboard updates < 500ms
☐ API calls < 200ms
☐ Report generation < 5 minutes
☐ Export < 30 seconds
☐ Concurrent operations handled
```

---

## 📊 DATA FLOW VERIFICATION

### Complete Data Flow - Step by Step

#### Step 1: Assessment Creation

```
Flow:
User Input → Frontend React Component
  ↓
Validation (TypeScript)
  ↓
Firebase Cloud Function (createAssessment)
  ↓
Firestore Database (assessments collection)
  ↓
Real-time Listener Activated
  ↓
Dashboard Updated

ADMIN CHECKS:
☐ Check Firestore: assessments/{id} exists
☐ Check: All fields populated
☐ Check: Timestamps correct
☐ Check: Status = ACTIVE
```

#### Step 2: Response Submission

```
Flow:
User Selects Answers (1-5 scale)
  ↓
Frontend Validation (70 questions required)
  ↓
Submit Button Click
  ↓
Firebase Cloud Function (submitResponse)
  ↓
Firestore Save: assessments/{id}/responses/{responseId}
  ↓
Aggregation Function Triggered
  ↓
Dashboard Real-time Update

ADMIN CHECKS:
☐ Check Firestore: response document exists
☐ Check: responses.q1 through responses.q70 populated
☐ Check: submittedAt timestamp = current time
☐ Check: respondentType = "teacher" (or appropriate)
☐ Check: Dashboard updates within 30 seconds
```

#### Step 3: Dashboard Calculation

```
Flow:
New Response Arrives
  ↓
Real-time Listener Triggered
  ↓
Dimension Aggregation Calculation
  ☐ Sum all responses for dimension 1
  ☐ Divide by response count
  ☐ Store in database
  ↓
Response Count Updated
  ↓
Percentages Recalculated
  ↓
Frontend Updates Display

ADMIN CHECKS:
☐ Check: Dimension averages accurate
  Example: [4,3,4,5,4] → avg 4.0
☐ Check: Response count incremented
☐ Check: Percentages calculated (responses/expected)
☐ Check: Quality score updated
```

#### Step 4: First Opinion Engine

```
Flow:
15 Challenge Questions Answered
  ↓
Submit Button Clicked
  ↓
Cloud Function (calculateFirstOpinion) Triggered
  ↓
S_sub Calculation
  ☐ Average of 15 responses
  ☐ Scale to 0-100
  ↓
M_obj Calculation
  ☐ Fetch operational metrics
  ☐ Scale to 0-1.05
  ↓
Health Index Calculation
  ☐ Formula: (S_sub × M_obj) - Penalty
  ↓
Results Stored in Firestore
  ↓
Predictions Generated
  ↓
Frontend Displays Results

ADMIN CHECKS:
☐ Check Firestore: firstOpinionResults document
☐ Check: s_sub value = (sum of 15 responses)/15 × 100
☐ Check: m_obj value = operational metrics / max
☐ Check: health_index = s_sub × m_obj - penalty
☐ Check: predictions calculated
☐ Check: recommendations populated
```

#### Step 5: Report Generation

```
Flow:
Admin Clicks "Generate Report"
  ↓
Report Options Selected
  ↓
Cloud Function (generateReport) Triggered
  ↓
Data Collection
  ☐ Fetch assessment metadata
  ☐ Fetch all responses
  ☐ Calculate dimension averages
  ☐ Generate recommendations
  ↓
Report Rendering
  ☐ Create visual representations
  ☐ Format text content
  ☐ Apply styling
  ↓
PDF Generation (Cloud Function)
  ↓
Upload to Cloud Storage
  ↓
Generate Download Link
  ↓
Save Report Reference in Firestore
  ↓
Frontend Displays Download Option

ADMIN CHECKS:
☐ Check Firestore: assessments/{id}/reports
☐ Check: All report fields populated
☐ Check: Calculation accuracy
☐ Check Cloud Storage: PDF file present
☐ Check: File size reasonable (2-5 MB)
☐ Check: PDF opens correctly
```

#### Step 6: Data Export

```
Flow:
Admin Clicks "Export Data"
  ↓
Format Selection: CSV
  ↓
Cloud Function (exportData) Triggered
  ↓
Data Query
  ☐ Fetch all responses for assessment
  ☐ Fetch respondent metadata
  ☐ Calculate scores
  ↓
CSV Generation
  ☐ Create headers
  ☐ Populate rows with data
  ☐ Format numbers/text
  ↓
Compression (optional)
  ↓
Upload to Cloud Storage
  ↓
Generate Download Link
  ↓
Frontend Downloads File

ADMIN CHECKS:
☐ Check: CSV file downloads successfully
☐ Check: Column headers match database fields
☐ Check: Row count = response count
☐ Check: All questions represented as columns
☐ Check: Data accuracy (spot check 5-10 rows)
☐ Check: No truncation or corruption
```

---

## 📋 QUICK VERIFICATION CHECKLIST

### 5-Minute Spot Check

```
☐ Can create assessment? YES / NO
☐ Does assessment appear in list? YES / NO
☐ Can access via shared link? YES / NO
☐ Can submit response? YES / NO
☐ Does dashboard update? YES / NO (within __ seconds)
☐ Can generate report? YES / NO
☐ Does PDF download? YES / NO
☐ Can export data? YES / NO

☐ Check Firestore:
  ☐ assessments collection has data
  ☐ responses subcollection has data
  ☐ reports subcollection has data

☐ Check Cloud Functions:
  ☐ createAssessment: Last run successful
  ☐ submitResponse: Last run successful
  ☐ calculateFirstOpinion: Last run successful
  ☐ generateReport: Last run successful

RESULT: ✅ PASS / ❌ FAIL
```

---

## 🔧 DEBUGGING GUIDE

### If Dashboard Doesn't Update

```
Check 1: Real-time Listener Active?
  Navigate to: Firebase Console → Firestore → responses collection
  ☐ Listener should be monitoring this collection

Check 2: Response Saved?
  ☐ New response document visible in Firestore
  ☐ All 70 questions populated

Check 3: Cloud Function Logs
  ☐ submitResponse function runs
  ☐ No errors in logs

Solution: Refresh page manually, check network tab
```

### If Report Not Generating

```
Check 1: Cloud Function Logs
  Functions → generateReport
  ☐ Function triggered
  ☐ Check error messages

Check 2: Cloud Storage
  Check if PDF file uploaded
  ☐ Should be in reports/ folder

Check 3: Firestore
  Check if report document created
  ☐ Should have report metadata

Solution: Retry generation, check Cloud Function quota
```

### If Export File Corrupted

```
Check 1: Cloud Function Logs
  Functions → exportData
  ☐ Check for errors

Check 2: Data Integrity
  ☐ Verify source data in Firestore
  ☐ Check for special characters

Solution: Try different export format (JSON), check file encoding
```

---

## 🎯 TEST COMPLETION SUMMARY

### After completing all features:

```
✅ All 7 features tested
✅ All data verified in Firestore
✅ All Cloud Functions executed successfully
✅ Dashboard updates confirmed
✅ Reports generated
✅ Data exported correctly
✅ No critical issues found
✅ Performance acceptable

RESULT: Application is ready for production
```

---

**Testing Guide Created:** August 29, 2026  
**Ready for:** User Acceptance Testing  
**Admin Validation:** Complete Checklist Provided
