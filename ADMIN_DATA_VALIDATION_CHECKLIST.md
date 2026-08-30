# 🔍 ADMIN DATA VALIDATION CHECKLIST

**Quick Reference Guide for Admins**  
**Use during user testing to validate all data is stored correctly**

---

## 📱 QUICK ACCESS GUIDE

### What to Check & Where to Find It

```
Assessment Created?
  Check: Firebase Console → Firestore → assessments collection
  Expected: Document with your assessment ID

Response Submitted?
  Check: Firebase Console → Firestore → assessments/{id}/responses
  Expected: New response document with all 70 questions answered

Dashboard Updated?
  Check: Your application dashboard
  Expected: Response count increased, scores updated

Report Generated?
  Check: Firebase Console → Firestore → assessments/{id}/reports
  Expected: Report document with PDF link

Data Exported?
  Check: Firebase Console → Cloud Storage → reports folder
  Expected: CSV file downloaded successfully
```

---

## 🎯 FEATURE 1: ASSESSMENT CREATION

### ✅ Quick Checklist

```
☐ Assessment Name: "School Health Diagnostic" appears in list
☐ School: "Test School Alpha" correctly saved
☐ Expected counts: Teachers 5, Parents 8, Students 10, Admin 2
☐ Status: Shows ACTIVE or PENDING

🔍 WHERE TO VERIFY (Firebase Console)
Path: Firestore → Collections → assessments

Click on your assessment ID document and verify:
☐ eventName: "School Health Diagnostic"
☐ schoolName: "Test School Alpha"
☐ expectedRespondents:
  ☐ teacher: 5
  ☐ parent: 8
  ☐ student: 10
  ☐ admin: 2
☐ totalExpected: 25
☐ createdAt: [Current timestamp]
☐ status: "ACTIVE"

✅ PASS if all fields correct
❌ FAIL if any field missing or incorrect
```

---

## 🔗 FEATURE 2: ASSESSMENT LINK

### ✅ Quick Checklist

```
☐ Link format: https://disha-diagnostics.web.app/?assessment=[ID]
☐ Link is clickable (not truncated)
☐ Link works in new browser/incognito
☐ Assessment loads without login

🔍 WHERE TO VERIFY
1. Copy the link from application
2. Open in new browser tab/incognito
3. Expected: Assessment form loads with respondent selector

✅ PASS if link accessible and assessment loads
❌ FAIL if page doesn't load or requires login
```

---

## 👨‍🏫 FEATURE 3: TEACHER RESPONSE

### ✅ Quick Checklist

```
☐ User can select "Teacher" as respondent type
☐ Can enter name: "John Smith"
☐ Can enter email: "john.smith@school.com"
☐ Can enter Teacher ID: "T12345"
☐ Can answer all 70 questions (1-5 scale)
☐ Can submit successfully
☐ Receives success confirmation

🔍 WHERE TO VERIFY (Firebase Console)
Path: Firestore → assessments → [ID] → responses

Click the response document (look for latest timestamp) and verify:

Respondent Info:
☐ stakeholderType: "teacher"
☐ respondentName: "John Smith"
☐ respondentEmail: "john.smith@school.com"
☐ respondentID: "T12345"
☐ submittedAt: [Current time]

Response Data (Sample - check all 70):
☐ q1: 4 (or your selected value)
☐ q2: 3 (or your selected value)
☐ q3: 4 (or your selected value)
... [check all 70 questions]
☐ Total questions answered: 70

Calculations:
☐ responseDimensions: Has all 14 dimensions
☐ Dimension 1 average: Calculated from q1-5
☐ Dimension 2 average: Calculated from q6-10
... [verify all 14]

✅ PASS if response complete with all 70 questions
❌ FAIL if any question missing or data incomplete
```

### 🔍 Quick Data Verification Script

```
Calculation Check:
If responses: [q1:4, q2:3, q3:4, q4:5, q5:4]
Expected Dimension 1 Average: (4+3+4+5+4)/5 = 4.0

Database value:
Firestore → responses.responses.dimension1.average: ____
Should equal: 4.0
☐ Match: Yes/No
```

---

## 📊 FEATURE 4: DASHBOARD UPDATE

### ✅ Quick Checklist

```
🔍 WHERE TO VERIFY
Application URL: https://disha-diagnostics.web.app/

Dashboard Display:
☐ Teachers count: 1/5 (20%)
☐ Parents count: 0/8 (0%)
☐ Students count: 0/10 (0%)
☐ Admin count: 0/2 (0%)
☐ Total: 1/25 (4%)

☐ Progress bar shows 4% complete
☐ Response list shows new teacher response
☐ Overall progress updated

Dimension Scores Section:
☐ Leadership dimension shows: 4.0/5 (or calculated average)
☐ Teaching dimension shows: 4.2/5 (or calculated average)
[Check all 14 dimensions]

Quality Indicators:
☐ Data Freshness: <5 minutes
☐ Completeness: 100%
☐ Quality Score: High/Good
☐ Status: ✅ Green

Real-Time Test:
☐ Open dashboard in 2 browser tabs
☐ Submit another response in Tab 2
☐ Tab 1 updates WITHOUT refresh
☐ Counts should update within 30 seconds

✅ PASS if all counts accurate and real-time
❌ FAIL if counts wrong or manual refresh needed
```

### 🔍 Data Accuracy Verification

```
Verify Response Aggregation:
Database: Firestore → assessments → [ID] → aggregatedData

Expected Calculations:
Dimension 1 Score: (4+3+4+5+4)/5 = 4.0

Database Values:
☐ dimension1.average: 4.0
☐ dimension1.respondentCount: 1
☐ dimension1.dataFreshness: <5 min

✅ All calculations correct
❌ Any calculation wrong or field missing
```

---

## 🤖 FEATURE 5: FIRST OPINION ENGINE

### ✅ Quick Checklist

```
🔍 WHERE TO VERIFY (Firebase Console)
Path: Firestore → Collections → firstOpinionResults

Look for latest document (sorted by timestamp desc)

Verify These Fields:
☐ answers: Array of 15 values (1-5 scale)
☐ s_sub: Leadership perception score (0-100)
☐ m_obj: Operational reality multiplier (0.2-1.05)
☐ scaledScore: s_sub × m_obj
☐ delusionPenalty: Amount deducted for delusion
☐ healthIndex: Final score (0-100)
☐ riskQuadrant: GREEN/ORANGE/YELLOW/RED
☐ predictions: Array of predicted improvements
☐ recommendedActions: Array of 5+ recommendations
☐ earlyWarnings: Array of warning flags
☐ createdAt: Timestamp
```

### 🔍 Calculation Verification

```
Sample Response to Check:
User answered 15 questions: [4,3,4,5,4,5,4,4,3,4,3,4,4,3,4]

Step 1: Calculate S_sub (Leadership Perception)
  Sum: 4+3+4+5+4+5+4+4+3+4+3+4+4+3+4 = 60
  Average: 60/15 = 4.0
  S_sub (0-100): 4.0/5.0 × 100 = 80

Step 2: Get M_obj (Operational Reality)
  This comes from school metrics
  Expected range: 0.2 to 1.05
  Example: 0.85 (85% of operational capacity)

Step 3: Calculate Health Index
  Formula: (S_sub × M_obj) - Delusion Penalty
  Calculation: (80 × 0.85) - 0 = 68
  Health Index: 68/100

VERIFY IN DATABASE:
☐ s_sub: 80 (matches calculation above)
☐ m_obj: 0.85 (operational metrics)
☐ healthIndex: 68 (or close to it)

✅ PASS if calculations match
❌ FAIL if calculations don't match
```

---

## 📄 FEATURE 6: GENERATE REPORTS

### ✅ Quick Checklist

```
🔍 WHERE TO VERIFY (Firebase Console)
Path: Firestore → assessments → [ID] → reports

Verify Report Document:
☐ reportId: Unique ID generated
☐ reportType: "DIAGNOSTIC" or "FIRST_OPINION"
☐ schoolName: "Test School Alpha"
☐ assessmentName: "School Health Diagnostic"
☐ generatedAt: Current timestamp
☐ generatedBy: Admin email/ID
☐ pdfUrl: Link to PDF file
☐ status: "COMPLETED" or "READY"

Report Content (in PDF):
☐ Title page with school name
☐ Executive summary
☐ All 14 dimension scores
☐ Response breakdown
☐ Gap analysis
☐ Recommendations
☐ Charts/visualizations
☐ Page numbers
☐ Generated date

PDF File Location:
Path: Cloud Storage → reports → [reportId].pdf
☐ File exists
☐ File size: 2-5 MB (reasonable)
☐ File can be downloaded
☐ File opens correctly in PDF reader

✅ PASS if report complete and PDF valid
❌ FAIL if report missing content or PDF corrupted
```

---

## 📊 FEATURE 7: EXPORT DATA

### ✅ Quick Checklist

```
🔍 WHERE TO VERIFY
1. Check Downloaded File: School_Health_Diagnostic.csv

CSV File Structure:
Headers (First Row):
☐ respondent_name
☐ respondent_email
☐ respondent_type (teacher/parent/student/admin)
☐ q1, q2, q3, ... q70 (70 question columns)
☐ dimension_1_score through dimension_14_score
☐ overall_score
☐ submitted_at

Data Rows:
☐ Row 1 (Teacher): John Smith, john.smith@school.com, teacher, [70 values]
☐ Additional rows for more responses
☐ All values populated (no empty cells)
☐ Scores calculated correctly

Data Accuracy:
☐ Q1-Q5 match teacher's responses
☐ Dimension 1 score matches dashboard
☐ Overall score calculated correctly
☐ Timestamps match response times

✅ PASS if CSV complete and accurate
❌ FAIL if CSV has missing data or errors
```

### 🔍 Spot Check Data

```
SAMPLE VERIFICATION
Line 1 (Teacher John Smith):
Responses should match what he submitted:
  q1: 4 ✓
  q2: 3 ✓
  q3: 4 ✓
  ... (check all 70)
  Dimension 1 avg: 4.0 ✓
  Dimension 2 avg: 4.2 ✓

Compare CSV values to:
  Database values: Firestore → responses
  Dashboard values: Live dashboard display

✅ All match = Data integrity verified
❌ Any mismatch = Data corruption detected
```

---

## 🔐 CLOUD FUNCTION EXECUTION VERIFICATION

### ✅ Monitor All Functions

```
🔍 WHERE TO VERIFY
Firebase Console → Functions → Logs

Check Each Function:

1. createAssessment
   ☐ Last run: < 1 hour ago
   ☐ Status: SUCCESS
   ☐ Execution time: < 1 second
   ☐ Errors: None
   ☐ Return value: Assessment ID

2. submitResponse
   ☐ Last run: < 30 min ago
   ☐ Status: SUCCESS
   ☐ Execution time: < 1 second
   ☐ Errors: None
   ☐ Data saved to Firestore

3. calculateAggregation
   ☐ Last run: < 30 min ago
   ☐ Status: SUCCESS
   ☐ Execution time: < 2 seconds
   ☐ Errors: None
   ☐ Dimension averages calculated

4. calculateFirstOpinion
   ☐ Last run: < 1 hour ago
   ☐ Status: SUCCESS
   ☐ Execution time: < 2 seconds
   ☐ Errors: None
   ☐ All calculations completed

5. generateReport
   ☐ Last run: < 1 hour ago
   ☐ Status: SUCCESS
   ☐ Execution time: < 5 seconds
   ☐ Errors: None
   ☐ PDF generated

6. exportData
   ☐ Last run: Recent
   ☐ Status: SUCCESS
   ☐ Execution time: < 30 seconds
   ☐ Errors: None
   ☐ CSV file created

✅ PASS if all functions SUCCESS status
❌ FAIL if any function shows ERROR
```

---

## 📈 REAL-TIME LISTENER VERIFICATION

### ✅ Check Data Synchronization

```
🔍 WHERE TO VERIFY
1. Application Dashboard
2. Firebase Console Firestore

Test Real-Time Sync:
☐ Step 1: Note current response count (e.g., 1/25)
☐ Step 2: Open another browser/device
☐ Step 3: Submit another response
☐ Step 4: Check first browser WITHOUT refreshing
☐ Step 5: Count should update to 2/25

Expected Time: Within 30 seconds

☐ Dashboard updated WITHOUT page refresh
☐ No delay > 1 second
☐ Multiple browsers sync correctly
☐ Count accurate across devices

✅ PASS if real-time sync working
❌ FAIL if manual refresh required or delay > 1 sec
```

---

## 🎯 COMPLETE VALIDATION CHECKLIST

### Final Verification Before Launch

```
ASSESSMENT LIFECYCLE
☐ Assessment created
☐ Assessment stored in Firestore
☐ Assessment link works
☐ Link accessible without authentication

RESPONSE SUBMISSION
☐ Response form loads
☐ All 70 questions answerable
☐ Response data saved to Firestore
☐ All fields populated correctly
☐ Timestamps recorded

DASHBOARD UPDATES
☐ Response count increased
☐ Percentage calculated correctly
☐ Dimension scores updated
☐ Updates within 30 seconds
☐ No manual refresh needed

FIRST OPINION ENGINE
☐ Challenge questions answer-able
☐ S_sub calculated correctly
☐ M_obj calculated correctly
☐ Health index calculated correctly
☐ Predictions generated
☐ Recommendations provided

REPORT GENERATION
☐ Report option available
☐ Report generated successfully
☐ Report stored in Firestore
☐ PDF file created
☐ PDF downloadable and readable

DATA EXPORT
☐ Export option available
☐ CSV file generated
☐ All 70 questions in columns
☐ Data accuracy verified
☐ File downloadable

CLOUD FUNCTIONS
☐ All functions execute successfully
☐ No errors in logs
☐ Execution times acceptable (<2 sec)
☐ Data persistence verified

REAL-TIME SYNC
☐ Dashboard updates in real-time
☐ Multi-device sync working
☐ No manual refresh needed
☐ Listeners active and responding

DATA INTEGRITY
☐ All responses stored completely
☐ No data truncation
☐ Calculations accurate
☐ No duplicate submissions
☐ Timestamps correct

FINAL STATUS: ✅ PASS / ❌ FAIL
```

---

## 🔧 TROUBLESHOOTING QUICK REFERENCE

### Issue: Dashboard Not Updating

```
Quick Checks:
1. Refresh page manually
2. Check Firebase console → functions logs for errors
3. Verify response saved in Firestore
4. Check network tab in browser dev tools

Solution: If no errors, try:
  - Clear browser cache (Ctrl+Shift+Delete)
  - Try different browser
  - Wait 30 seconds and check again
```

### Issue: Response Not Saving

```
Quick Checks:
1. Check internet connection
2. Verify all 70 questions answered
3. Check browser console for errors (F12)
4. Check Firebase functions logs

Solution:
  - Reload page and try again
  - Use different browser
  - Contact support if persists
```

### Issue: Report Not Generating

```
Quick Checks:
1. Check Firebase Cloud Storage → reports folder
2. Check functions logs for generateReport errors
3. Verify assessment has responses
4. Check available disk space

Solution:
  - Retry report generation
  - Check Cloud Function quotas
  - Contact support if error persists
```

### Issue: CSV File Corrupted

```
Quick Checks:
1. Redownload the file
2. Try opening in different application (Excel, Google Sheets)
3. Check file size (should be > 5 KB)
4. Check functions logs for exportData errors

Solution:
  - Regenerate export
  - Try different export format
  - Contact support if issue continues
```

---

## 📋 ADMIN SIGN-OFF FORM

### After Complete Testing

```
Date Tested: ________________
Tested By (Admin Name): ________________
School: Test School Alpha
Assessment: School Health Diagnostic

TESTING RESULTS:

Overall Status: ☐ PASS ☐ FAIL

Critical Issues Found: ☐ YES ☐ NO
If yes, describe: _________________________________

Feature Status:
  ☐ Assessment Creation: PASS
  ☐ Share Link: PASS
  ☐ User Response: PASS
  ☐ Dashboard: PASS
  ☐ First Opinion: PASS
  ☐ Reports: PASS
  ☐ Export: PASS

Data Integrity: ☐ VERIFIED ☐ ISSUES

Cloud Functions: ☐ ALL WORKING ☐ ISSUES
If issues, which functions: _________________________________

Real-Time Sync: ☐ WORKING ☐ ISSUES

Performance: ☐ ACCEPTABLE ☐ SLOW

Recommendation for Production:
  ☐ APPROVED - Ready to launch
  ☐ APPROVED with minor issues
  ☐ NOT APPROVED - Issues to fix

Comments: _________________________________


Admin Signature: ________________  Date: ________________
```

---

## 🎉 SUCCESS CRITERIA

### ✅ Ready for Production If:

```
☐ All 7 features working
☐ No critical issues
☐ All data verified in Firestore
☐ All Cloud Functions executing
☐ Dashboard updating in real-time
☐ Reports generating correctly
☐ Data exporting accurately
☐ Performance acceptable
☐ No security issues
☐ All workflows complete end-to-end

RESULT: 🟢 APPLICATION IS PRODUCTION READY
```

---

**Checklist Created:** August 29, 2026  
**Ready for:** Admin Testing  
**Easy Reference:** ✅ Yes - Print this page for quick checks!

