# MANUAL TESTING GUIDE - DISHA 14D DIAGNOSTIC ASSESSMENT
## Complete Step-by-Step Testing for All Stages & Tech Stack

**Document Version**: 1.0  
**Date**: August 19, 2026  
**Purpose**: Comprehensive manual testing guide for QA and stakeholders

---

## TABLE OF CONTENTS

1. [Environment Setup & Prerequisites](#environment-setup)
2. [Stage 0: Dev Environment Testing](#stage-0)
3. [Stage 1: School Setup & Assessment Creation](#stage-1)
4. [Stage 2: Stakeholder Identification & Info Capture](#stage-2)
5. [Stage 3: 14D Survey Response](#stage-3)
6. [Stage 4: Real-Time Dashboard Tracking](#stage-4)
7. [Stage 5: Professional Report Generation](#stage-5)
8. [Stage 6: Data Export & Sharing](#stage-6)
9. [Tech Stack Component Testing](#tech-stack)
10. [Edge Cases & Error Handling](#edge-cases)
11. [Performance Testing](#performance)
12. [Cross-Browser Testing](#browsers)

---

## ENVIRONMENT SETUP & PREREQUISITES {#environment-setup}

### Pre-Testing Checklist

**Required Tools:**
- [ ] Web Browser (Chrome/Firefox/Safari/Edge)
- [ ] Node.js installed (v18+)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Internet connection (for Firebase)
- [ ] Test data (sample school info, emails, phone numbers)

**Development Server:**
```bash
# Terminal 1: Start dev server
cd c:/disha-diagnostic-engine
npm start

# Expected output:
# ✓ Compiled successfully
# ✓ Ready on http://localhost:3000

# Terminal 2: Keep open for monitoring
npm run dev
```

**Browser Console Preparation:**
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Go to Network tab (to monitor API calls)
4. Go to Application → Firestore to monitor data
5. Leave open during all testing

**Firebase Console:**
1. Open https://console.firebase.google.com/
2. Go to Project: disha-diagnostics
3. Open Firestore Database
4. Keep 4 collections visible:
   - schools
   - assessments
   - responses
   - (Optional) dimensions_catalog

---

## STAGE 0: DEV ENVIRONMENT TESTING {#stage-0}

### Test 0.1: Development Server Startup

**Steps:**
1. Open terminal in project root
2. Run `npm start`
3. Wait for "Ready on http://localhost:3000"

**What to Check:**
- [ ] Terminal shows no errors
- [ ] Dev server starts within 10 seconds
- [ ] No TypeScript compilation errors
- [ ] Vite bundler completes successfully

**Expected Output:**
```
➜  Local:   http://localhost:3000/
➜  press h to show help
✓ Built in 2.3s
```

**Verification:**
- Open browser DevTools → Console
- Should see NO red error messages
- May see warnings (acceptable)

---

### Test 0.2: Application Loading

**Steps:**
1. Open http://localhost:3000 in browser
2. Wait for page to fully load
3. Take screenshot

**What to Check:**
- [ ] Page loads without 404 errors
- [ ] React app mounts successfully
- [ ] No JavaScript errors in console
- [ ] Layout is visible (not blank)
- [ ] Colors and styling loaded (Tailwind working)

**Expected Result:**
- Landing page visible with:
  - Header/Logo area
  - "Create Assessment" or assessment list
  - Professional styling (not unstyled)
  - Responsive layout

**Console Check:**
```javascript
// In DevTools Console, type:
console.log(document.getElementById('root'))
// Should output: <div id="root">...</div>
```

---

### Test 0.3: Firebase Connection Verification

**Steps:**
1. Open DevTools → Application tab
2. Look for "firebase" in storage
3. Open browser console
4. Run Firebase test:

```javascript
// In browser console, run:
firebase.firestore()
// Should return Firestore instance (no errors)
```

**What to Check:**
- [ ] Firebase SDK loaded
- [ ] No authentication errors
- [ ] Firestore connection active
- [ ] Can access collections

**Expected Result:**
- No "Firebase not initialized" errors
- Firestore console shows connection status

---

### Test 0.4: React & TypeScript Verification

**Steps:**
1. Open DevTools → Console
2. Check for TypeScript errors:

```javascript
// Should see NO errors like:
// "TS2304: Cannot find name 'xyz'"
```

**What to Check:**
- [ ] No TypeScript compilation errors
- [ ] React component loads
- [ ] State management (Zustand) initialized
- [ ] No module import errors

**Expected Result:**
- Clean console with no red errors
- App fully interactive

---

## STAGE 1: SCHOOL SETUP & ASSESSMENT CREATION {#stage-1}

### Test 1.1: Home Page Display

**Steps:**
1. Refresh page (Ctrl+R)
2. Wait for full load
3. Observe home page elements

**What to Check:**
- [ ] Landing page displays
- [ ] "Create New Assessment" or similar button visible
- [ ] Assessment list visible (if any)
- [ ] Header/branding correct
- [ ] Responsive layout (open DevTools mobile view)

**Expected Layout:**
```
[Header: DISHA Diagnostic System]
[Create Assessment Button]
[List of Existing Assessments]
  - Assessment Name | Status | Responses | Actions
```

**Mobile Check (F12 → Toggle Device Toolbar):**
- [ ] Elements stack vertically
- [ ] Text readable
- [ ] Buttons touch-friendly (48px min)
- [ ] No horizontal scroll

---

### Test 1.2: Assessment Form Display

**Steps:**
1. Click "Create Assessment" button
2. Form should appear
3. Inspect form fields

**What to Check:**
- [ ] Form displays (not modal overlay)
- [ ] All input fields visible
- [ ] Field labels clear
- [ ] Form has submit button
- [ ] Form validation visible (required field indicators)

**Expected Form Fields:**
```
[ ] School Name (text input)
[ ] Board (CBSE / ICSE / IB dropdown)
[ ] City (text input)
[ ] State (dropdown)
[ ] Principal Name (text input)
[ ] Principal Email (email input)
[ ] Total Students (number input)
[ ] Total Teachers (number input)

Expected Respondents:
[ ] Teachers (number input)
[ ] Parents/Guardians (number input)
[ ] Students (number input)
[ ] Admin Staff (number input)
[ ] Other (number input)

[ ] Create Assessment (Submit Button)
[ ] Cancel (Cancel Button)
```

---

### Test 1.3: Form Input Validation

**Steps:**
1. Try to submit form WITHOUT filling fields
2. Observe validation messages

**What to Check:**
- [ ] Required fields show error (red highlight or message)
- [ ] Error message is clear ("This field is required")
- [ ] Submit button disabled or shows error state
- [ ] Form does NOT submit

**Expected Behavior:**
```
School Name: [RED BORDER] "This field is required"
Board: [RED BORDER] "Please select a board"
City: [RED BORDER] "This field is required"
```

**Console Check:**
- Should see validation logic in Console (no errors)

---

### Test 1.4: Valid School Creation

**Steps:**
1. Fill all required fields with valid data:

```
School Name:        "Demo Excellence Academy"
Board:              "CBSE"
City:               "Bangalore"
State:              "Karnataka"
Principal Name:     "Dr. Rajesh Kumar"
Principal Email:    "rajesh@demo.edu"
Total Students:     850
Total Teachers:     60

Expected Respondents:
Teachers:           45
Parents:            100
Students:           500
Admin:              8
Other:              0
```

2. Click "Create Assessment"
3. Wait 2-3 seconds

**What to Check:**
- [ ] Form submitted successfully
- [ ] No JavaScript errors
- [ ] Page redirects or form closes
- [ ] Success message appears (optional)
- [ ] Assessment appears in list

**Firebase Verification:**
1. Open Firebase Console → Firestore
2. Click "schools" collection
3. Look for new document with:
   - [ ] `schoolId` field
   - [ ] `name`: "Demo Excellence Academy"
   - [ ] `board`: "CBSE"
   - [ ] Other fields

**Expected Document:**
```json
{
  "schoolId": "auto-generated-id",
  "name": "Demo Excellence Academy",
  "board": "CBSE",
  "city": "Bangalore",
  "state": "Karnataka",
  "principalName": "Dr. Rajesh Kumar",
  "principalEmail": "rajesh@demo.edu",
  "totalStudents": 850,
  "totalTeachers": 60,
  "createdAt": "2026-08-19T10:30:00Z"
}
```

---

### Test 1.5: Assessment Created in Collections

**Steps:**
1. Go to Firebase Console
2. Click "assessments" collection
3. Look for new assessment

**What to Check:**
- [ ] Assessment document created
- [ ] `assessmentId` auto-generated
- [ ] `schoolId` linked correctly
- [ ] `status`: "ACTIVE" or "CREATED"
- [ ] `respondentCounts` object:
  ```json
  {
    "teacher": {"expected": 45, "received": 0},
    "parent": {"expected": 100, "received": 0},
    "student": {"expected": 500, "received": 0},
    "admin": {"expected": 8, "received": 0},
    "other": {"expected": 0, "received": 0}
  }
  ```

---

### Test 1.6: Assessment Display in Dashboard

**Steps:**
1. Go back to home page
2. Look at assessment list

**What to Check:**
- [ ] New assessment appears in list
- [ ] Shows assessment name
- [ ] Shows status badge
- [ ] Shows respondent count (0/150 or similar)
- [ ] Shows action buttons (View, Edit, Delete)

**Expected Row:**
```
Demo Excellence Academy | ACTIVE | 0/150 Respondents | [View] [Edit] [Delete]
```

---

## STAGE 2: STAKEHOLDER IDENTIFICATION & INFO CAPTURE {#stage-2}

### Test 2.1: Assessment Link Generation

**Steps:**
1. Click "View" on the assessment
2. Assessment detail page should show
3. Look for "Share" or "Assessment Link"

**What to Check:**
- [ ] Assessment details displayed
- [ ] Respondent status visible (0/150)
- [ ] Breakdown by stakeholder type:
  ```
  Teachers: 0/45
  Parents: 0/100
  Students: 0/500
  Admin: 0/8
  Other: 0/0
  ```
- [ ] Share/Link button visible
- [ ] Copy link functionality works

---

### Test 2.2: Stakeholder Selection (Teacher)

**Steps:**
1. Open assessment link in NEW TAB (simulate different user)
2. Should see stakeholder selection

**What to Check:**
- [ ] Stakeholder type buttons/dropdown visible
- [ ] Options: Teacher, Parent, Student, Admin, Other
- [ ] Each option is clickable
- [ ] Clear instructions

**Expected Screen:**
```
┌─────────────────────────────────────┐
│ Select Your Role                    │
│                                     │
│ [Teacher] [Parent] [Student]        │
│ [Admin]   [Other]                   │
│                                     │
│ "Please select your role to begin"  │
└─────────────────────────────────────┘
```

---

### Test 2.3: Teacher Stakeholder Form

**Steps:**
1. Click "Teacher" button
2. Form should appear with teacher-specific fields

**What to Check:**
- [ ] Form title: "Teacher Information"
- [ ] Email field visible
- [ ] Phone field visible
- [ ] Teacher ID field visible
- [ ] Submit button visible
- [ ] Required field indicators

**Expected Fields:**
```
[ ] Email Address *              (email input)
[ ] Phone Number *               (tel input)
[ ] Teacher ID *                 (text input)
[ ] Submit Button
```

**Input Validation Check:**
1. Try invalid email: "notanemail"
   - Should show: "Please enter a valid email"
2. Try invalid phone: "123"
   - Should show: "Please enter a 10-digit phone number"
3. Leave fields blank, click submit
   - Should show: "This field is required"

---

### Test 2.4: Valid Teacher Submission

**Steps:**
1. Fill teacher form with valid data:
```
Email:           teacher.1@demo.edu
Phone:           9876543210
Teacher ID:      TEACH001
```

2. Click "Submit"
3. Wait 1-2 seconds

**What to Check:**
- [ ] Form submits successfully
- [ ] No error messages
- [ ] Page progresses to survey
- [ ] Form data NOT visible (security)

**Firebase Verification:**
1. Go to Firebase Console
2. Go to "responses" collection
3. Click filter/search for assessment ID
4. Should see new document:

```json
{
  "assessmentId": "[id]",
  "respondentId": "auto-generated",
  "stakeholderType": "teacher",
  "email": "teacher.1@demo.edu",
  "phone": "9876543210",
  "teacherId": "TEACH001",
  "status": "INFO_CAPTURED",
  "createdAt": "2026-08-19T10:35:00Z"
}
```

**Dashboard Check:**
1. Go back to main assessment page
2. Refresh
3. Check if teacher count updated: "1/45" (was 0/45)

---

### Test 2.5: Parent Stakeholder Form

**Steps:**
1. Open assessment link in ANOTHER new tab
2. Click "Parent" button
3. Form should appear

**What to Check:**
- [ ] Form title: "Parent/Guardian Information"
- [ ] Email field
- [ ] Phone field
- [ ] Student selection dropdown (if students exist)
- [ ] "I don't see my child" option

**Expected Fields:**
```
[ ] Email Address *
[ ] Phone Number *
[ ] Select Your Child * (dropdown)
    - [Choose Student]
    - Student Name 1 (Grade X)
    - Student Name 2 (Grade Y)
    - I don't see my child
```

**Student Linking Test:**
1. Click dropdown
2. Should show list of students
3. Select one student
4. Fill other fields:
```
Email:       parent.1@email.com
Phone:       9876543211
Student:     [Select from dropdown]
```
5. Submit

**Firebase Check:**
```json
{
  "assessmentId": "[id]",
  "stakeholderType": "parent",
  "email": "parent.1@email.com",
  "phone": "9876543211",
  "linkedStudentId": "[student-id]"
}
```

---

### Test 2.6: Student Stakeholder Form

**Steps:**
1. Open assessment link in new tab
2. Click "Student" button

**What to Check:**
- [ ] Form title: "Student Information"
- [ ] Grade/Class selector
- [ ] Email optional (for students)
- [ ] Simple, age-appropriate form

**Expected Fields:**
```
[ ] Your Grade/Class * (dropdown)
    - Select Grade
    - Grade 1-12
    - College
[ ] Email (optional)
[ ] Submit Button
```

---

### Test 2.7: Admin Stakeholder Form

**Steps:**
1. Open assessment link in new tab
2. Click "Admin" button

**What to Check:**
- [ ] Form title: "Administrator Information"
- [ ] Email field
- [ ] Phone field
- [ ] Admin ID field
- [ ] Role field (optional)

**Fill & Submit:**
```
Email:       admin.1@demo.edu
Phone:       9876543212
Admin ID:    ADMIN001
Role:        Finance Manager (or optional)
```

---

### Test 2.8: Form Validation - Edge Cases

**Test Case 1: Special Characters in Email**
```
Email: test+teacher@demo.co.uk
Expected: Should accept (Gmail-style emails)
```

**Test Case 2: International Phone Numbers**
```
Phone: +91-98765-43210
Expected: Should normalize or accept
```

**Test Case 3: ID with Spaces**
```
Teacher ID: TEACH 001
Expected: Should accept or trim
```

**Test Case 4: Duplicate Submission**
```
1. Fill and submit form
2. Try submitting same form again
Expected: Should prevent duplicate or show warning
```

---

## STAGE 3: 14D SURVEY RESPONSE {#stage-3}

### Test 3.1: Survey Page Load

**Steps:**
1. After stakeholder info submitted
2. Survey page should load automatically

**What to Check:**
- [ ] Survey title visible
- [ ] 14 dimension tabs visible
- [ ] Progress bar visible
- [ ] First dimension active
- [ ] Questions displayed
- [ ] 5-point Likert scale visible

**Expected Layout:**
```
┌────────────────────────────────────────┐
│ 14D Assessment Survey                  │
│ "Demo Excellence Academy"              │
│ Progress: ▓▓░░░░░░░░ 10% (1/14)        │
├────────────────────────────────────────┤
│ [D1] [D2] [D3] [D4] [D5] [D6] [D7]    │
│ [D8] [D9][D10][D11][D12][D13][D14]    │
├────────────────────────────────────────┤
│ D1: Leadership & Governance            │
│                                        │
│ Question 1: School leaders have a      │
│ clear vision for the school.           │
│ [ ] Strongly Disagree                  │
│ [ ] Disagree                           │
│ [ ] Neutral                            │
│ [ ] Agree                              │
│ [✓] Strongly Agree                     │
│                                        │
│ Question 2: [next question...]         │
│                                        │
│ [Previous] [Next]                      │
└────────────────────────────────────────┘
```

---

### Test 3.2: 14 Dimensions Verification

**Steps:**
1. Click each tab from D1 to D14
2. Verify all dimensions present

**Expected Dimensions:**
```
✓ D1:  Leadership & Governance
✓ D2:  Academic Excellence
✓ D3:  Infrastructure & Facilities
✓ D4:  Student Well-being & Support
✓ D5:  Staff Development & Engagement
✓ D6:  Community & Stakeholder Engagement
✓ D7:  Innovation & Technology
✓ D8:  Financial Management & Sustainability
✓ D9:  Quality Assurance & Compliance
✓ D10: Inclusivity & Diversity
✓ D11: Curriculum & Learning Outcomes
✓ D12: Stakeholder Satisfaction & Reputation
✓ D13: Performance Management & Accountability
✓ D14: Organizational Culture & Values
```

**What to Check:**
- [ ] All 14 tabs visible
- [ ] Tab labels correct
- [ ] Clicking tab switches questions
- [ ] Previous responses remembered
- [ ] Progress bar updates

---

### Test 3.3: Question Display & Response Recording

**Steps for D1: Leadership & Governance:**
1. Click D1 tab
2. See 5-7 questions
3. Select "Strongly Agree" for first question
4. Click D2 tab
5. Click back to D1
6. Verify response is still selected

**Expected Questions (examples):**
```
D1: Leadership & Governance
1. School leaders have a clear vision for the school
2. Strategic decisions are made based on data
3. Leadership is transparent in communication
4. Resources are allocated fairly
5. School goals are communicated to all stakeholders
[+ 2-3 more questions]
```

**What to Check:**
- [ ] Questions load in D1
- [ ] Can click radio buttons (1-5 scale)
- [ ] Selected option highlights
- [ ] Response persists when switching tabs
- [ ] No errors in console

**Console Check:**
```javascript
// Should show response being saved
// Look for: POST to /assessments/[id]/responses
```

---

### Test 3.4: Response Storage (Real-Time)

**Steps:**
1. Open assessment in TWO browsers side-by-side
2. In Browser 1: Select responses in D1
3. Watch Browser 2 dashboard update in real-time

**What to Check:**
- [ ] Browser 2 shows updated count within 2-3 seconds
- [ ] No page refresh needed
- [ ] Response count increments

**Firebase Console Check:**
1. Open Firestore in 3rd tab
2. Go to "responses" collection
3. Should see new response documents as user responds

---

### Test 3.5: Completing Multiple Questions

**Steps:**
1. For each dimension (D1-D14):
   - Fill in all questions (2-7 questions per dimension)
   - Select different response values: 1, 2, 3, 4, 5
   - Mix responses (not all same)

**Response Pattern to Test:**
```
D1: Q1=5, Q2=4, Q3=3, Q4=5, Q5=2
D2: Q1=4, Q2=4, Q3=4, Q4=4
D3: Q1=3, Q2=2, Q3=4
... (continue for all 14)
```

**What to Check:**
- [ ] No errors during response entry
- [ ] Progress bar advances (15% → 30% → ... → 100%)
- [ ] Can navigate forward/backward
- [ ] Submit button appears when complete

---

### Test 3.6: Survey Completion

**Steps:**
1. Complete all 14 dimensions
2. Progress bar should show 100%
3. Look for "Submit Survey" or "Complete" button

**What to Check:**
- [ ] Submit button is prominent
- [ ] Button is enabled (not grayed out)
- [ ] Clear completion message
- [ ] Option to review before submitting

**Before Submit:**
1. Click "Review" or scroll through
2. Verify all responses present
3. Verify progress shows 100%

---

### Test 3.7: Survey Submission

**Steps:**
1. Click "Submit Survey" button
2. Wait 2-3 seconds

**What to Check:**
- [ ] No JavaScript errors
- [ ] Success message appears
- [ ] Page redirects or shows confirmation
- [ ] Response marked as complete

**Expected Message:**
```
"Thank you for completing the survey!
Your responses have been recorded.
You can now close this browser."
```

**Firebase Verification:**
1. Check "responses" collection in Firebase
2. Find this respondent's document
3. Should have:
   - `status`: "COMPLETED"
   - All 14 dimensions with responses
   - `submittedAt` timestamp

**Sample Response Document:**
```json
{
  "assessmentId": "[id]",
  "respondentId": "[id]",
  "stakeholderType": "teacher",
  "email": "teacher.1@demo.edu",
  "status": "COMPLETED",
  "responses": {
    "D1": {
      "questions": [5, 4, 3, 5, 2],
      "average": 3.8
    },
    "D2": {
      "questions": [4, 4, 4, 4],
      "average": 4.0
    },
    ... (D3-D14)
  },
  "submittedAt": "2026-08-19T10:45:00Z"
}
```

---

## STAGE 4: REAL-TIME DASHBOARD TRACKING {#stage-4}

### Test 4.1: Dashboard Auto-Refresh

**Steps:**
1. In MAIN browser tab, go to assessment view page
2. Refresh to see initial count: "1/150"
3. Open 2nd tab with assessment link
4. Submit as PARENT (fill form + survey)
5. Watch main tab WITHOUT refreshing

**What to Check:**
- [ ] Count updates to "2/150" within 3 seconds
- [ ] NO manual page refresh needed
- [ ] Firestore listener active (check Console)

**Console Check:**
```javascript
// Should see listener message or data update
// Watch Network tab: no page reload request
```

---

### Test 4.2: Respondent Breakdown

**Steps:**
1. Submit responses from 3 different stakeholder types:
   - 1 Teacher
   - 1 Parent
   - 1 Student

2. Check assessment page for breakdown

**Expected Display:**
```
Total Respondents: 3/150

Breakdown by Type:
├─ Teachers:  1/45  (▓░░░░░░░░░)  2%
├─ Parents:   1/100 (░░░░░░░░░░)  1%
├─ Students:  1/500 (░░░░░░░░░░)  <1%
├─ Admin:     0/8   (░░░░░░░░░░)  0%
└─ Other:     0/0   (N/A)          0%
```

**What to Check:**
- [ ] Total count correct (sum of all)
- [ ] Per-type counts correct
- [ ] Progress bars accurate
- [ ] Percentages calculated correctly

---

### Test 4.3: Live Updates with Multiple Users

**Steps:**
1. Open assessment page in 4 browser tabs
2. Tab 1: Assessment dashboard (main)
3. Tab 2: Teacher survey
4. Tab 3: Parent survey
5. Tab 4: Admin survey

**Sequence:**
1. In Tab 2 (Teacher): Fill D1-D3, Submit
2. Watch Tab 1: Should show "2/150"
3. In Tab 3 (Parent): Fill D1-D2, Submit
4. Watch Tab 1: Should show "3/150"
5. In Tab 4 (Admin): Fill all, Submit
6. Watch Tab 1: Should show "4/150"

**What to Check:**
- [ ] Each update within 2-3 seconds
- [ ] No race conditions (counts don't skip)
- [ ] Firestore listeners working
- [ ] No data loss

---

### Test 4.4: Real-Time Firestore Verification

**Steps:**
1. Open Firebase Console (separate tab)
2. Go to "assessments" collection
3. Find your assessment document
4. Look at `respondentCounts` field
5. Update it in real-time as users respond

**Expected Real-Time Updates:**
```
Time 0s:   respondentCounts: teacher=0, parent=0, student=0
Time 10s:  [Teacher submits] → teacher=1
Time 20s:  [Parent submits] → parent=1
Time 30s:  [Student submits] → student=1
Time 40s:  [Admin submits] → admin=1
```

**What to Check:**
- [ ] Firebase updates reflect in real-time
- [ ] No lag > 3 seconds
- [ ] Totals calculated correctly
- [ ] All fields present and accurate

---

## STAGE 5: PROFESSIONAL REPORT GENERATION {#stage-5}

### Test 5.1: Report Button Appearance

**Steps:**
1. Submit 10+ responses from different stakeholders
2. Go back to assessment page
3. Look for "View Report" button

**What to Check:**
- [ ] "View Report" button appears
- [ ] Button is prominent (not hidden)
- [ ] Button clickable
- [ ] (Optional) Minimum response threshold mentioned

**Expected:**
```
Total Responses: 10/150 (7%)
[Generate Report] button is ENABLED
```

---

### Test 5.2: Report Page Load

**Steps:**
1. Click "View Report" button
2. Wait 3-5 seconds for report generation

**What to Check:**
- [ ] Report page loads without errors
- [ ] No blank page or 500 error
- [ ] Professional styling applied
- [ ] All elements visible

**Expected Layout:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  [GRADIENT HEADER]                          │
│  Demo Excellence Academy                    │
│  14D Diagnostic Assessment Report           │
│  Assessment Date: Aug 19, 2026              │
│                                             │
├─────────────────────────────────────────────┤
│ [KPI Metric] [KPI Metric] [KPI Metric]     │
│   Overall Health   Assessment Date  Total   │
│        72/100      Aug 19, 2026    10 resp. │
├─────────────────────────────────────────────┤
│                                             │
│ [RADAR CHART - All 14 dimensions]           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ [BAR CHART - Subjective vs Objective]       │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ [GAP ANALYSIS CHART]                        │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ ▼ D1: Leadership & Governance        [EXPAND]
│ ▼ D2: Academic Excellence            [EXPAND]
│ ▼ D3: Infrastructure & Facilities    [EXPAND]
│ ... (all 14 dimensions)                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Test 5.3: KPI Cards Verification

**Steps:**
1. Look at 4 KPI cards at top

**What to Check for Each Card:**
```
Card 1: Overall Health Index
- [ ] Shows score (0-100)
- [ ] Color-coded: Red/Yellow/Green
- [ ] Calculation correct (average of all dimensions)

Card 2: Assessment Date
- [ ] Shows date assessment was created
- [ ] Format: MMM DD, YYYY

Card 3: Total Responses
- [ ] Shows count: "10 Responses"
- [ ] Shows target: "of 150 Expected"
- [ ] Percentage: "7% Response Rate"

Card 4: Dimensions Assessed
- [ ] Shows: "14 Dimensions"
- [ ] Icon/badge style
```

**Calculation Verification:**
```
If responses are:
D1: 72, D2: 68, D3: 75, D4: 70, D5: 71, D6: 69,
D7: 73, D8: 70, D9: 72, D10: 71, D11: 70, D12: 72,
D13: 71, D14: 70

Expected Overall: (sum / 14) = 71.14 ≈ 71
```

---

### Test 5.4: Radar Chart Testing

**Steps:**
1. Scroll to Radar chart
2. Observe visualization

**What to Check:**
- [ ] Chart renders without errors
- [ ] All 14 dimensions shown as vertices
- [ ] Two lines visible:
  - Blue line: School's scores
  - Amber line: Benchmark scores
- [ ] Chart is interactive
- [ ] Hover shows tooltips

**Radar Chart Details:**
```
Center: School name "Demo Excellence Academy"
Lines: 14 radius lines (one per dimension)
Data Lines:
  ├─ Blue: School average per dimension
  └─ Amber: Benchmark (80 for all)
Labels: D1, D2, D3, ... D14 around perimeter
```

**Interactive Test:**
1. Hover over data point
2. Should show:
   - Dimension name
   - School score
   - Benchmark score
3. Hover over dimension label
4. Should highlight that dimension

---

### Test 5.5: Bar Chart Testing

**Steps:**
1. Scroll to bar chart below radar
2. Observe 3-color comparison

**What to Check:**
- [ ] Chart shows 14 groups (one per dimension)
- [ ] Each group has 3 bars:
  - Blue bar: Subjective (survey score)
  - Green bar: Objective (data score, if available)
  - Amber bar: Benchmark (80)
- [ ] Bars proportional to scores
- [ ] Legend visible and clear
- [ ] Axis labels present

**Expected Bar Heights:**
```
D1: ▓▓▓ 72 (Blue) | ▓▓▓▓ 75 (Green) | ▓▓▓▓ 80 (Amber)
D2: ▓▓ 68 (Blue)  | ▓▓▓ 70 (Green) | ▓▓▓▓ 80 (Amber)
[... continue for all 14]
```

**Interactive Test:**
1. Hover over bar
2. Should show:
   - Dimension name
   - Score value
   - Type (Subjective/Objective/Benchmark)

---

### Test 5.6: Gap Analysis Chart

**Steps:**
1. Scroll to gap analysis chart
2. Observe horizontal bars

**What to Check:**
- [ ] Shows gap for each dimension
- [ ] Color-coded:
  - Green: Aligned (gap < 5)
  - Amber: Overestimation (school thinks better than data)
  - Blue: Underestimation (school thinks worse than data)
- [ ] Bar length represents gap magnitude
- [ ] Dimension labels on left

**Expected Pattern:**
```
D1: ├─────■───────┤ Gap: -3 (Underestimate, Blue)
D2: ├────────■────┤ Gap: -2 (Underestimate, Blue)
D3: ├──■─────────┤ Gap: +5 (Overestimate, Amber)
D4: ├──────■─────┤ Gap: ±0 (Aligned, Green)
```

**Interpretation:**
```
If Subjective (Survey) = 75 and Objective (Data) = 70:
Gap = 75 - 70 = +5 (Overestimation, Amber)
Meaning: Stakeholders think performance is better than actual data

If Subjective = 65 and Objective = 72:
Gap = 65 - 72 = -7 (Underestimation, Blue)
Meaning: Stakeholders underrate performance vs. actual data
```

---

### Test 5.7: Dimension Cards Expansion

**Steps:**
1. Scroll to dimension cards section
2. All 14 cards should be visible (collapsed)

**Card Layout (Collapsed):**
```
┌────────────────────────────────────┐
│ ▼ D1: Leadership & Governance   71 │
│   Status: Strong │ Benchmark: 80   │
│   Respondents: 10 │ Trend: ↑       │
└────────────────────────────────────┘
```

**Click to Expand:**
1. Click on card "D1"
2. Card should expand smoothly
3. Show detailed sections:

```
┌────────────────────────────────────────────┐
│ ▲ D1: Leadership & Governance          71 │
├────────────────────────────────────────────┤
│                                            │
│ SCORES COMPARISON                          │
│ ┌──────────────┬──────────────┬──────────┐│
│ │ Subjective   │ Benchmark    │ Objective││
│ │ 71/100       │ 80/100       │ 73/100   ││
│ │ ▓▓▓▓▓▓░░░░   │ ▓▓▓▓▓▓▓░░░░  │ ▓▓▓▓▓▓▓░ ││
│ └──────────────┴──────────────┴──────────┘│
│                                            │
│ DETAILED ANALYSIS                          │
│ School leaders have a clear vision...     │
│ Strategic decisions are data-driven...    │
│ [More professional interpretation text]   │
│                                            │
│ PERCEPTION-REALITY ANALYSIS                │
│ There is a gap of 2 points between what   │
│ stakeholders perceive and actual data...  │
│                                            │
│ ROOT CAUSE ANALYSIS                        │
│ • Systemic Factors: [Explanation]         │
│ • Resource Constraints: [Explanation]     │
│ • Leadership Practices: [Explanation]     │
│                                            │
│ ACTIONABLE RECOMMENDATIONS                 │
│ 1. [30-day priority action]               │
│ 2. [60-day strategic action]              │
│ 3. [90-day transformation action]         │
│                                            │
└────────────────────────────────────────────┘
```

---

### Test 5.8: Detailed Content Verification

**Steps:**
1. Expand D1: Leadership & Governance
2. Read and verify all sections

**Expected Content Check:**

**Scores Section:**
- [ ] Subjective score shows survey average
- [ ] Benchmark shows 80 (or configured value)
- [ ] Objective score shows (if data available)
- [ ] Progress bars match percentages
- [ ] All values 0-100 range

**Detailed Analysis Section:**
- [ ] Professional language (not generic)
- [ ] Specific to this dimension
- [ ] References actual scores
- [ ] 3-5 sentences explaining performance
- [ ] No dictionary-style definitions

**Example Good Analysis:**
```
"Leadership & Governance scores 71/100 (Strong) from 10 respondents,
9 points below the benchmark of 80. The school demonstrates clear
strategic vision with data-driven decision-making in most areas.
However, there's opportunity to strengthen transparency in budget
decisions and more actively involve department heads in strategic planning."
```

**Perception-Reality Analysis:**
- [ ] Explains gap between survey and objective data
- [ ] References both scores
- [ ] Suggests why gap exists
- [ ] Provides insight into stakeholder perception

**Example:**
```
"Stakeholders perceive Leadership slightly lower than operational
data suggests (71 vs 73). This 2-point gap indicates that visible
leadership communication may lag behind actual strategic initiatives.
Improvement would benefit from more frequent all-hands meetings and
transparent sharing of leadership decisions with staff."
```

**Root Cause Analysis:**
- [ ] Specific to Leadership dimension
- [ ] Lists 3-5 likely contributing factors
- [ ] Not generic checklist
- [ ] Actionable investigation points

**Example Factors:**
```
• Budget Transparency: Finance decisions made centrally without
  department head input
• Strategic Communication: Leadership vision not consistently
  communicated to all staff
• Decision-Making Process: Clear process exists but staff
  involvement varies by department
• Leadership Stability: Recent changes in VP Academic role
• External Pressures: Increasing regulatory compliance reduces
  focus on internal strategic planning
```

**Actionable Recommendations:**
- [ ] 3-5 specific actions
- [ ] Organized by timeframe (30/60/90 days)
- [ ] Each actionable and measurable
- [ ] Clear success metrics

**Example:**
```
30-DAYS (Urgent):
• Publish leadership decision-making process in staff handbook
• Schedule monthly all-hands meeting (3rd Friday)
• Create budget consultation cycle with department heads

60-DAYS (Important):
• Develop strategic plan dashboard for staff visibility
• Implement quarterly leadership townhalls
• Create mentorship program for emerging leaders

90-DAYS (Strategic):
• Establish leadership development program for middle managers
• Complete organizational assessment of leadership effectiveness
• Plan next year's strategic priorities with full team input
```

---

### Test 5.9: All 14 Dimensions Expandable

**Steps:**
1. Collapse D1
2. Click D2, D3, D4... through D14
3. Verify each has content

**What to Check:**
- [ ] All 14 cards present
- [ ] Each expands/collapses
- [ ] Each has scores
- [ ] Each has analysis text
- [ ] No duplicate content
- [ ] No cards missing analysis

**Quick Scan:**
```
✓ D1:  Leadership & Governance - [Analysis Present]
✓ D2:  Academic Excellence - [Analysis Present]
✓ D3:  Infrastructure & Facilities - [Analysis Present]
✓ D4:  Student Well-being & Support - [Analysis Present]
✓ D5:  Staff Development & Engagement - [Analysis Present]
✓ D6:  Community & Stakeholder Engagement - [Analysis Present]
✓ D7:  Innovation & Technology - [Analysis Present]
✓ D8:  Financial Management & Sustainability - [Analysis Present]
✓ D9:  Quality Assurance & Compliance - [Analysis Present]
✓ D10: Inclusivity & Diversity - [Analysis Present]
✓ D11: Curriculum & Learning Outcomes - [Analysis Present]
✓ D12: Stakeholder Satisfaction & Reputation - [Analysis Present]
✓ D13: Performance Management & Accountability - [Analysis Present]
✓ D14: Organizational Culture & Values - [Analysis Present]
```

---

### Test 5.10: Professional Styling Verification

**Steps:**
1. Look at overall report appearance
2. Check design consistency

**What to Check:**
- [ ] Colors are professional (not bright/harsh)
- [ ] Fonts are readable (not too small)
- [ ] Spacing is consistent
- [ ] Hierarchy is clear (headings vs. body)
- [ ] Icons/badges used appropriately
- [ ] Charts are labeled clearly
- [ ] No visual clutter

**Color Scheme Check:**
```
Status Badges:
✓ Strong:           Green (#16a34a or similar)
⚠ Adequate:         Blue (#2563eb or similar)
⚠ Needs Attention:  Amber (#d97706 or similar)
⚠ At Risk:          Red (#dc2626 or similar)

Chart Colors:
✓ School (Radar):   Blue
✓ Benchmark:        Amber
✓ Subjective (Bar): Blue
✓ Objective (Bar):  Green
✓ Gap Aligned:      Green
✓ Gap Overestimate: Amber
✓ Gap Underestimate: Blue
```

**Typography Check:**
```
Report Title:      Large, Bold (32-40px)
Dimension Title:   Large, Bold (20-24px)
Section Headers:   Medium, Bold (14-16px)
Body Text:         Regular (13-14px)
Labels:            Small (11-12px)
```

**Responsive Design:**
1. Open in mobile view (F12 → toggle device toolbar)
2. Check:
- [ ] Elements stack vertically
- [ ] Charts responsive
- [ ] Text readable
- [ ] No horizontal scroll
- [ ] Touch-friendly spacing

---

## STAGE 6: DATA EXPORT & SHARING {#stage-6}

### Test 6.1: Export Menu

**Steps:**
1. Look for export/download button
2. Should be near top-right of report
3. Click to open menu

**What to Check:**
- [ ] Download button visible
- [ ] Multiple format options shown:
  - [ ] PDF
  - [ ] Excel
  - [ ] CSV
  - [ ] PNG (for charts)
  - [ ] Email Share

**Expected Menu:**
```
[Download ▼]
├─ Generate PDF
├─ Export to Excel
├─ Export as CSV
├─ Save Charts as PNG
└─ Send via Email
```

---

### Test 6.2: PDF Export

**Steps:**
1. Click "Generate PDF"
2. Wait 2-3 seconds for download
3. Locate downloaded file
4. Open in PDF reader

**What to Check:**
- [ ] File downloads successfully
- [ ] File named sensibly (assessment_name_date.pdf)
- [ ] PDF opens without errors
- [ ] Contains all report elements:
  - [ ] Header with school info
  - [ ] All 4 KPI cards
  - [ ] Radar chart
  - [ ] Bar chart
  - [ ] Gap analysis chart
  - [ ] Dimension summaries
  - [ ] Page layout professional
  - [ ] Text readable
  - [ ] Charts visible

**PDF Quality Check:**
1. Zoom to 100%
2. Check text clarity
3. Check chart resolution
4. Check page breaks
5. Verify no cut-off content

---

### Test 6.3: Excel Export

**Steps:**
1. Click "Export to Excel"
2. Wait 1-2 seconds
3. Open downloaded Excel file

**What to Check:**
- [ ] File downloads
- [ ] Named appropriately
- [ ] Opens in Excel/LibreOffice
- [ ] Contains multiple sheets:
  - [ ] Sheet 1: Summary (School info, KPIs)
  - [ ] Sheet 2: Dimension Scores (all 14 with scores)
  - [ ] Sheet 3: Raw Responses (detailed survey data)
  - [ ] Sheet 4: Analysis (text data)

**Sheet 1 - Summary:**
```
School Name:              Demo Excellence Academy
Board:                    CBSE
Assessment Date:          Aug 19, 2026
Total Respondents:        10
Overall Health Score:     71
Response Rate:            7%
```

**Sheet 2 - Dimension Scores:**
```
Dimension                          Subjective  Benchmark  Objective  Gap   Status
D1: Leadership & Governance        71          80         73         -2    Strong
D2: Academic Excellence            68          80         70         +2    Adequate
D3: Infrastructure & Facilities    75          80         78         -3    Adequate
... (all 14)
```

**Sheet 3 - Raw Responses:**
```
Respondent ID  Stakeholder  D1Q1  D1Q2  D1Q3  D2Q1  D2Q2  ... D14Q7
RESP001        Teacher      5     4     3     4     5     ... 4
RESP002        Parent       4     4     4     3     3     ... 5
... (each respondent, all responses)
```

---

### Test 6.4: CSV Export

**Steps:**
1. Click "Export as CSV"
2. Open in spreadsheet or text editor

**What to Check:**
- [ ] File downloads
- [ ] CSV format (comma-separated)
- [ ] Contains raw data
- [ ] No formatting (just values)
- [ ] Can be imported to other tools

---

### Test 6.5: PNG Chart Export

**Steps:**
1. Click "Save Charts as PNG"
2. May download 3-4 files (one per chart type)

**What to Check:**
- [ ] Files download successfully
- [ ] Radar chart saved as image
- [ ] Bar chart saved as image
- [ ] Gap analysis chart saved as image
- [ ] Images are high-resolution (readable)
- [ ] Charts have titles/legends

**Image Quality Check:**
1. Open each PNG
2. Check:
- [ ] Chart clearly visible
- [ ] Axes and labels readable
- [ ] Colors accurate
- [ ] No watermarks or cutoffs

---

### Test 6.6: Email Share

**Steps:**
1. Click "Send via Email"
2. Email composer dialog should appear

**What to Check:**
- [ ] To: field (pre-populated or empty)
- [ ] Subject: pre-filled with assessment name
- [ ] Body: template email with key results
- [ ] Attach option: report attached or link provided

**Expected Email:**
```
To: [enter recipient]
Subject: 14D Assessment Report - Demo Excellence Academy

Dear [Principal Name],

Please find attached the comprehensive 14D Diagnostic Assessment 
Report for Demo Excellence Academy from August 19, 2026.

Key Findings:
• Overall Health Index: 71/100
• Total Respondents: 10 (7% response rate)
• Highest Performing Dimension: Infrastructure & Facilities (75)
• Needs Attention: Academic Excellence (68)

[Report attached as PDF]

Best regards,
DISHA Diagnostic System
```

**Send Test:**
1. Enter your email
2. Click Send
3. Check email inbox (may take 5-10 seconds)
4. Verify attachment received

---

## TECH STACK COMPONENT TESTING {#tech-stack}

### Test TS1: React Component Rendering

**Steps:**
1. Open DevTools → React tab (needs React DevTools extension)
2. Inspect component tree

**What to Check:**
- [ ] All components render without errors
- [ ] Props passed correctly
- [ ] State updated properly
- [ ] No console errors

**Key Components to Verify:**
```
<App>
├─ <HomePage>
│  ├─ <AssessmentList>
│  └─ <CreateAssessmentForm>
├─ <AssessmentPage>
│  ├─ <AssessmentDashboard>
│  ├─ <RespondentTracker>
│  └─ <ReportGenerator>
├─ <SurveyPage>
│  ├─ <DimensionTabs>
│  └─ <QuestionRenderer>
└─ <ReportPage>
   ├─ <ReportHeader>
   ├─ <KPICards>
   ├─ <RadarChart>
   ├─ <BarChart>
   ├─ <GapChart>
   └─ <DimensionCards>
```

---

### Test TS2: TypeScript Type Checking

**Steps:**
1. Open terminal
2. Run type check:
```bash
npx tsc --noEmit
```

**What to Check:**
- [ ] No TypeScript errors reported
- [ ] Build succeeds
- [ ] All types properly defined

**Expected Output:**
```
✓ No errors found
✓ [number] files checked
```

---

### Test TS3: Tailwind CSS Styling

**Steps:**
1. Open any page
2. Right-click → Inspect element
3. Check computed styles

**What to Check:**
- [ ] Colors applied correctly
- [ ] Spacing consistent (padding/margin)
- [ ] Responsive classes working (sm:, md:, lg:)
- [ ] No inline styles (only Tailwind classes)

**Example Check:**
```
Element: <h1 class="text-2xl font-bold text-gray-800">
Computed: 
  font-size: 24px ✓
  font-weight: 700 ✓
  color: rgb(31, 41, 55) ✓
```

**Responsive Test:**
1. Open DevTools mobile view
2. Adjust screen size: 375px, 768px, 1024px
3. Check:
- [ ] Layout adapts
- [ ] Text readable
- [ ] Images scale
- [ ] Buttons clickable

---

### Test TS4: Recharts Visualization

**Steps:**
1. Go to report page
2. Open DevTools → Network tab
3. Look for chart data requests

**What to Check:**
- [ ] Radar chart renders
- [ ] Bar chart renders
- [ ] Gap chart renders
- [ ] No chart library errors
- [ ] Charts responsive (resize browser)

**Interactive Testing:**
1. Hover over chart
2. Tooltip should appear with values
3. Click legend items
4. Should toggle series on/off (if applicable)

**Example Radar Hover:**
```
D1: Leadership & Governance
School: 71
Benchmark: 80
```

---

### Test TS5: Firebase Firestore Operations

**Steps:**
1. Open browser DevTools → Application → Storage
2. Expand "Firestore"

**What to Check:**

**Create Operation:**
- [ ] School document created in "schools" collection
- [ ] Assessment document created in "assessments" collection
- [ ] All fields present and correct types
- [ ] Timestamps auto-generated

**Read Operation:**
- [ ] Assessment data loaded on page
- [ ] Dashboard data fetches correctly
- [ ] Real-time listeners active
- [ ] No 404 or permission errors

**Update Operation:**
- [ ] Respondent counts update
- [ ] Response documents created
- [ ] Assessment status updates
- [ ] No write conflicts

**Delete Operation (if applicable):**
- [ ] Can delete assessment
- [ ] Associated responses handled
- [ ] Data removed from Firestore

**Firestore Console Check:**
1. Go to https://console.firebase.google.com/
2. Project: disha-diagnostics
3. Firestore Database
4. Verify collections exist:
```
✓ schools
✓ assessments
✓ responses
✓ dimensions_catalog
```

5. Click each collection
6. Verify documents with correct structure

---

### Test TS6: Real-Time Listeners (Firestore)

**Steps:**
1. Open Firestore console in separate tab
2. Open app in main tab
3. Submit a response in main tab
4. Watch Firestore console update

**What to Check:**
- [ ] New response document appears
- [ ] Update shows within 2-3 seconds
- [ ] Respondent count increments
- [ ] No stale data

**Console Monitoring:**
In browser console, check for listener logs:
```javascript
// Should see messages like:
// "Snapshot updated: assessments/123"
// "Respondent count: 5"
```

---

### Test TS7: State Management (Zustand)

**Steps:**
1. Open DevTools console
2. Check if store is accessible

```javascript
// In browser console:
console.log(window.__ZUSTAND_DEVTOOLS__)
// Or check app-specific store usage
```

**What to Check:**
- [ ] State updates trigger re-renders
- [ ] No memory leaks
- [ ] Previous responses remembered when navigating tabs
- [ ] Data persists during session

**Example State Test:**
1. Fill D1 questions
2. Navigate to D2
3. Go back to D1
4. Verify responses still there

---

### Test TS8: Validation & Error Handling

**Steps:**
1. Try invalid inputs
2. Check error messages

**Test Cases:**

**Invalid Email:**
```
Input: "notanemail"
Expected: "Please enter a valid email address"
Actual: [Check displayed message]
```

**Invalid Phone:**
```
Input: "123"
Expected: "Please enter a 10-digit phone number"
Actual: [Check displayed message]
```

**Missing Required Field:**
```
Input: Leave school name blank, try to submit
Expected: "This field is required"
Actual: [Check displayed message]
```

**Duplicate Submission:**
```
1. Submit form
2. Try submitting same data again
Expected: Warning or prevention of duplicate
Actual: [Check behavior]
```

**Firebase Error (simulate offline):**
```
1. Turn off internet
2. Try to submit response
Expected: "Connection error - please try again"
Actual: [Check error handling]
```

---

## EDGE CASES & ERROR HANDLING {#edge-cases}

### Test EC1: Empty Assessment (No Responses)

**Steps:**
1. Create assessment
2. Don't collect any responses
3. Try to view report

**Expected Behavior:**
- [ ] Show message: "Not enough responses to generate report"
- [ ] "Minimum required: X responses"
- [ ] Show current count: "0 of X"
- [ ] "Check back later" message

---

### Test EC2: Partial Response (Incomplete Survey)

**Steps:**
1. Fill D1-D5
2. Close browser (don't submit)
3. Reopen assessment link

**Expected Behavior:**
- [ ] Survey resumes where left off
- [ ] D1-D5 responses preserved
- [ ] Can continue from D6
- [ ] Option to start over

---

### Test EC3: Duplicate Respondent

**Steps:**
1. Fill teacher form with same email twice
2. Submit both surveys

**Expected Behavior:**
- [ ] Should prevent (check email uniqueness)
- OR
- [ ] Allow but mark as updates
- [ ] Should NOT double-count

**Verification:**
- Check respondent count
- Should show 1 teacher (not 2)
- Latest response should be recorded

---

### Test EC4: Invalid Gender/Special Characters

**Steps:**
1. Fill Teacher ID: "TEACH@001#"
2. Fill Email: "test@test.co.uk"
3. Fill Phone: "+91-98765-43210"

**Expected Behavior:**
- [ ] Accept valid email formats
- [ ] Accept international phone numbers (after normalization)
- [ ] Accept special characters in IDs if relevant
- [ ] OR provide clear error

---

### Test EC5: Large Data Volume

**Steps:**
1. Submit 50+ responses
2. Generate report
3. Check performance

**Expected Behavior:**
- [ ] Report generates within 5 seconds
- [ ] Charts render without lag
- [ ] No browser freezing
- [ ] All data accurate

**Performance Check:**
- Open DevTools → Performance tab
- Record while generating report
- Check CPU usage (should not exceed 30%)
- Check memory (should not exceed available)

---

### Test EC6: Network Latency Simulation

**Steps:**
1. Open DevTools → Network
2. Set throttling to "3G"
3. Submit a response

**Expected Behavior:**
- [ ] Request still completes (slower)
- [ ] No timeout errors
- [ ] UI shows loading state
- [ ] User doesn't submit twice

---

### Test EC7: Session Timeout

**Steps:**
1. Start survey
2. Wait 30+ minutes
3. Try to continue

**Expected Behavior:**
- [ ] Session maintained (should not expire)
- OR
- [ ] Clear message: "Session expired, please refresh"
- [ ] Option to resume

---

### Test EC8: Browser Tab Closing

**Steps:**
1. In Tab 1: Start survey (fill D1-D3)
2. In Tab 2: Submit responses from different stakeholder
3. Check if Tab 1 data lost

**Expected Behavior:**
- [ ] Tab 1 data preserved (not affected by Tab 2)
- [ ] Each respondent isolated
- [ ] Tab close doesn't delete responses

---

## PERFORMANCE TESTING {#performance}

### Test P1: Page Load Time

**Steps:**
1. Open DevTools → Network tab
2. Clear browser cache (Ctrl+Shift+Delete)
3. Load home page
4. Measure time to interactive

**Expected Metrics:**
- [ ] First Contentful Paint (FCP): < 2s
- [ ] Largest Contentful Paint (LCP): < 3s
- [ ] Time to Interactive (TTI): < 4s
- [ ] Total page load: < 5s

**DevTools Measurement:**
1. Reload page
2. Check "Performance" tab
3. Look for metrics:
```
FCP: 1.2s ✓
LCP: 2.1s ✓
TTI: 3.5s ✓
Total: 4.2s ✓
```

---

### Test P2: Report Generation Time

**Steps:**
1. Click "View Report"
2. Measure time from click to full render

**Expected Time:**
- [ ] < 3 seconds for data processing
- [ ] < 2 seconds for chart rendering
- [ ] Total < 5 seconds

**Measurement:**
```
Time 0s:    Click "View Report"
Time 1.2s:  Data fetched from Firestore
Time 2.0s:  Charts begin rendering
Time 2.8s:  All charts rendered
Time 3.0s:  Report fully interactive
```

---

### Test P3: Chart Interaction Performance

**Steps:**
1. Open report with 50+ responses
2. Interact with charts:
   - Hover over points
   - Click legend items
   - Zoom/pan (if supported)

**Expected Behavior:**
- [ ] Smooth interaction (no lag)
- [ ] Tooltips appear within 100ms
- [ ] No freezing
- [ ] FPS remains > 30

**DevTools Check:**
1. Open Performance profiler
2. Record while hovering over chart
3. Should see smooth frame rate

---

### Test P4: Real-Time Update Lag

**Steps:**
1. Submit response in one browser
2. Measure time to see update in another browser's dashboard

**Expected Lag:**
- [ ] < 2 seconds (acceptable)
- [ ] < 1 second (good)

**Measurement:**
```
Time 0s:    Submit button clicked
Time 0.5s:  Response sent to Firebase
Time 1.2s:  Dashboard counter updates
Total Lag:  1.2 seconds ✓
```

---

### Test P5: Memory Usage

**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Submit 10+ responses
4. Take another snapshot

**Expected Behavior:**
- [ ] Memory doesn't continuously grow
- [ ] < 100MB base memory
- [ ] < 150MB with open report
- [ ] No memory leaks

---

### Test P6: Bundle Size

**Steps:**
1. Run build:
```bash
npm run build
```

2. Check dist/ folder size

**Expected Size:**
- [ ] Main bundle: < 200KB
- [ ] Total JS: < 400KB
- [ ] Total (with CSS): < 500KB

**Measurement:**
```bash
# Check bundle size
du -sh dist/
# Expected: ~450KB
```

---

## CROSS-BROWSER TESTING {#browsers}

### Test B1: Chrome/Chromium

**Steps:**
1. Open app in Chrome
2. Go through complete flow

**What to Check:**
- [ ] All features work
- [ ] No errors in console
- [ ] Charts render correctly
- [ ] Responsive design working

**Console Check:**
- Should see no red errors
- May see warnings (acceptable)

---

### Test B2: Firefox

**Steps:**
1. Open app in Firefox
2. Repeat full flow

**What to Check:**
- [ ] All features work
- [ ] Charts render (may look slightly different)
- [ ] Form validation works
- [ ] Firestore operations work

**Firefox-Specific Checks:**
- [ ] CSS grid working
- [ ] Flexbox working
- [ ] SVG charts rendering

---

### Test B3: Safari

**Steps:**
1. Open app in Safari (Mac/iOS)
2. Test key features

**Safari-Specific Issues:**
- [ ] CSS custom properties working
- [ ] JavaScript ES6+ supported
- [ ] Fetch API working
- [ ] Storage APIs working

---

### Test B4: Edge

**Steps:**
1. Open app in Edge
2. Test features

**What to Check:**
- [ ] No IE-specific issues
- [ ] Modern CSS supported
- [ ] Charts working

---

### Test B5: Mobile Browsers

**Steps:**
1. Open on mobile device (iPhone/Android)
2. Test complete flow

**Mobile-Specific Checks:**
- [ ] Viewport correct
- [ ] Touch interactions work
- [ ] Forms usable
- [ ] No overflow
- [ ] Keyboard doesn't hide content

**Example Mobile Test:**
1. Open assessment link
2. Select stakeholder type
3. Fill form (check keyboard behavior)
4. Complete survey (check tab size)
5. View report (check scrolling)

---

## FINAL VERIFICATION CHECKLIST

### Before Production Launch

- [ ] All 10 stages tested
- [ ] All 14 dimensions working
- [ ] Real-time features verified
- [ ] Charts rendering correctly
- [ ] Export functionality working
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Performance acceptable
- [ ] Error handling in place
- [ ] Firebase integration solid
- [ ] No console errors
- [ ] Security rules verified
- [ ] Data validation working
- [ ] Edge cases handled
- [ ] Documentation complete

### Post-Launch Monitoring

- [ ] Monitor error logs
- [ ] Track performance metrics
- [ ] Collect user feedback
- [ ] Watch Firestore usage
- [ ] Monitor deployment logs
- [ ] Track response times

---

## QUICK REFERENCE CHECKLIST

### Stage 1 Quick Test
```
[ ] npm start works
[ ] App loads at localhost:3000
[ ] Create assessment form appears
[ ] Fill and submit successfully
[ ] Check Firestore for school/assessment documents
```

### Stage 2 Quick Test
```
[ ] Assessment link works
[ ] Stakeholder selection works
[ ] Teacher form with validation
[ ] Submit creates response document
[ ] Dashboard count updates
```

### Stage 3 Quick Test
```
[ ] Survey shows all 14 dimensions
[ ] Can select responses
[ ] Progress bar updates
[ ] Submit completes and stores responses
```

### Stage 4 Quick Test
```
[ ] Dashboard shows updated count
[ ] Real-time refresh (no manual refresh needed)
[ ] Breakdown by stakeholder accurate
```

### Stage 5 Quick Test
```
[ ] Report page loads
[ ] Radar chart visible
[ ] Bar chart visible
[ ] Gap analysis chart visible
[ ] All 14 dimension cards expandable
[ ] Content has analysis text
```

### Stage 6 Quick Test
```
[ ] Export menu appears
[ ] PDF downloads
[ ] Excel downloads
[ ] Email form works
```

---

**END OF MANUAL TESTING GUIDE**

**Document Complete**  
**Total Test Cases**: 100+  
**Estimated Time to Complete**: 4-6 hours  
**Status**: Ready for QA Team
