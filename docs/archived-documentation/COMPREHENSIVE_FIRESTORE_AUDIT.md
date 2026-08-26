# COMPREHENSIVE FIRESTORE AUDIT & IMPLEMENTATION GUIDE
## Complete App Features to Database Mapping

**Date**: August 19, 2026  
**Status**: Complete Audit & Implementation Plan  
**Scope**: All 14 Pages + All Features + All Data Flows

---

## SECTION 1: APP PAGES & FEATURES AUDIT

### PAGE 1: LandingPage.tsx ✅
**Purpose**: Welcome/onboarding page  
**Features**:
- School registration form
- Login redirect
- Feature showcase
- Call-to-action buttons

**Firestore Data Needed**:
```
/schools collection
  ├─ Basic school info
  ├─ Contact details
  └─ Subscription plan
```

**Current Status**: ✅ Connected (saveSchoolToFirestore in schoolService.ts)

---

### PAGE 2: Login.tsx ✅
**Purpose**: Authentication and login  
**Features**:
- Email/password login
- Role-based redirect
- Session management
- Remember me option

**Firestore Data Needed**:
```
/users collection
  ├─ userId (Firebase Auth UID)
  ├─ email
  ├─ role (admin/principal/teacher/parent/student)
  ├─ schoolId
  ├─ lastLogin timestamp
  └─ status (active/inactive)
```

**Current Status**: ✅ Connected (Uses Firebase Auth)

**Needed Enhancement**:
- Track lastLogin timestamp on each login
- Update user status to "active"

---

### PAGE 3: Dashboard.tsx ✅
**Purpose**: Main dashboard with overview and navigation  
**Features**:
- School metrics display
- Quick access cards
- Recent activities
- Navigation to all features
- Custom domain setup

**Firestore Data Needed**:
```
/schools/{schoolId}
  ├─ schoolName
  ├─ totalStudents
  ├─ totalTeachers
  ├─ subscriptionPlan
  ├─ metrics (latest)
  └─ recentActivities
```

**Current Status**: ⚠️ Partially Connected  
**Missing**:
- Recent activities logging
- Real-time metrics updates
- Custom domain storage

---

### PAGE 4: Checkup.tsx (STAGE 1) ✅✅✅
**Purpose**: First Opinion Checkup (15 Challenges)  
**Features**:
- 15 challenge questions
- Subjective vs objective analysis
- Health scoring
- Gap analysis
- Root cause identification
- Recommendations
- Data upload

**Firestore Data Needed**:
```
/schools/{schoolId}/checkups/{checkupId}
  ├─ checkupType: "FirstOpinion"
  ├─ submittedAt: timestamp
  ├─ submittedBy: userId
  ├─ status: "SUBMITTED"
  │
  ├─ SURVEY INPUT:
  │  └─ challengeResponses {}
  │
  ├─ OPERATIONAL METRICS:
  │  ├─ studentTeacherRatio
  │  ├─ parentResponseSLA
  │  ├─ annualTrainingHours
  │  ├─ weeklyPlanningHours
  │  ├─ libraryBooksCount
  │  └─ computerLabComputers
  │
  ├─ ANALYSIS RESULTS:
  │  ├─ layer1_SubjectiveScores (15 challenges)
  │  ├─ layer2_ObjectiveMetrics
  │  ├─ layer3_HealthIndex
  │  ├─ gapAnalysis
  │  ├─ rootCauseAnalysis
  │  └─ recommendations
  │
  └─ /checkups/{checkupId}/analysis/current
     ├─ layer1_Summary
     ├─ layer2_Summary
     ├─ layer3_Summary
     └─ generatedAt
```

**Current Status**: ⚠️ Partially Implemented  
**What's Working**:
- UI for collecting survey data
- File upload for metrics
- Local calculation of scores
- PDF export

**Missing**:
- ✗ Save checkup data to Firestore
- ✗ Trigger analyzeCheckup Cloud Function
- ✗ Save analysis results to Firestore
- ✗ Read analysis from Firestore in real-time
- ✗ Audit logging

---

### PAGE 5: StakeholderSurvey.tsx (STAGE 2) ✅
**Purpose**: Multi-stakeholder 14D Assessment collection  
**Features**:
- Survey creation and distribution
- Multi-stakeholder responses (Teacher, Parent, Student, Admin, Other)
- Real-time response tracking
- Response aggregation
- Respondent management

**Firestore Data Needed**:
```
/schools/{schoolId}/assessments/{assessmentId}
  ├─ assessmentName: string
  ├─ description: string
  ├─ createdAt: timestamp
  ├─ createdBy: userId
  ├─ status: "ACTIVE" | "CLOSED" | "ANALYZED"
  ├─ expectedRespondents: {
  │  ├─ teacher: number
  │  ├─ parent: number
  │  ├─ student: number
  │  ├─ admin: number
  │  └─ other: number
  │}
  ├─ surveyStartDate: timestamp
  ├─ surveyEndDate: timestamp
  ├─ surveyLink: string
  ├─ responseDeadline: timestamp
  │
  └─ /assessments/{assessmentId}/responses/{responseId}
     ├─ respondentType: "teacher" | "parent" | "student" | "admin" | "other"
     ├─ respondentEmail: string
     ├─ respondentName: string
     ├─ respondentId: string (optional)
     ├─ answers: {
     │  ├─ D1_LeadershipGovernance: number (1-5)
     │  ├─ D2_AcademicExcellence: number
     │  ├─ ... (D3-D14)
     │  └─ feedback: string (optional)
     ├─ submittedAt: timestamp
     ├─ status: "SUBMITTED" | "PARTIAL"
     └─ ipAddress: string (optional)
```

**Current Status**: ⚠️ Partially Implemented  
**What's Working**:
- Survey form UI
- Response collection interface
- Real-time progress dashboard

**Missing**:
- ✗ Save assessment metadata to Firestore
- ✗ Generate unique survey link
- ✗ Save responses to Firestore
- ✗ Real-time response tracking
- ✗ Calculate respondent statistics
- ✗ Trigger generate14DReport Cloud Function

---

### PAGE 6: MultiUserAssessment.tsx (ALL STAGES)
**Purpose**: Central hub for multi-user assessment workflow  
**Features**:
- Assessment setup
- Response tracking
- Report generation
- Report viewing
- Export functionality

**Firestore Data Needed**:
```
/schools/{schoolId}
  ├─ /assessments/{assessmentId}
  │  ├─ Assessment configuration
  │  └─ /responses/{responseId} (Multi-respondent)
  │
  └─ /reports/{reportId}
     ├─ reportType: "Comprehensive14D"
     ├─ generatedAt: timestamp
     ├─ generatedBy: userId
     ├─ assessmentId: reference
     └─ Analysis data (14D)
```

**Current Status**: ⚠️ Partially Implemented  
**Missing**:
- ✗ Save report metadata
- ✗ Load report from Firestore
- ✗ Real-time updates
- ✗ Report versioning
- ✗ Archive old reports

---

### PAGE 7: SimulateStage.tsx (STAGE 3) ✅
**Purpose**: Reverse simulation engine  
**Features**:
- Scenario design
- Action impact modeling
- ROI calculation
- Risk assessment
- Timeline visualization
- Decision support

**Firestore Data Needed**:
```
/schools/{schoolId}/simulations/{simulationId}
  ├─ simulationType: "ActionImpact" | "ScenarioComparison"
  ├─ createdAt: timestamp
  ├─ createdBy: userId
  ├─ status: "DRAFT" | "COMPLETED"
  │
  ├─ scenario: {
  │  ├─ name: string
  │  ├─ description: string
  │  ├─ proposedActions: []
  │  ├─ totalInvestment: number
  │  └─ timelineMonths: number
  │}
  │
  ├─ baseline: {
  │  ├─ reportId: reference
  │  └─ baselineScores: {}
  │}
  │
  └─ /simulations/{simulationId}/results/{resultId}
     ├─ dimensionImpactAnalysis: {}
     ├─ overallImpactSummary: {}
     ├─ resourceEfficiencyAnalysis: {}
     ├─ riskAnalysis: {}
     └─ generatedAt: timestamp
```

**Current Status**: ⚠️ Partially Implemented  
**What's Working**:
- Simulation UI and design
- Impact calculation (local)
- Timeline visualization

**Missing**:
- ✗ Save simulation scenarios to Firestore
- ✗ Trigger runSimulation Cloud Function
- ✗ Save results to Firestore
- ✗ Real-time result updates
- ✗ Scenario comparison
- ✗ Export simulations

---

### PAGE 8: SynthesizeStage.tsx ✅
**Purpose**: Report synthesis and presentation  
**Features**:
- Report compilation
- Visualization
- Executive summary
- Recommendations

**Firestore Data Needed**:
```
/schools/{schoolId}/reports/{reportId}
  ├─ Complete 14D analysis
  ├─ Strategic roadmap
  ├─ Action plans
  └─ Visualizations data
```

**Current Status**: ⚠️ Partially Implemented

---

### PAGE 9: Monitoring.tsx ✅
**Purpose**: Progress tracking and monitoring  
**Features**:
- Assessment progress
- Response tracking
- Metrics dashboard
- Health index updates

**Firestore Data Needed**:
```
/schools/{schoolId}
  ├─ /assessments/{assessmentId}
  │  ├─ expectedRespondents
  │  ├─ actualResponses (calculated)
  │  ├─ responseRate (calculated)
  │  └─ lastResponseTime
  │
  └─ /analytics/{analyticsId}
     ├─ totalAssessments
     ├─ totalResponses
     ├─ responseRateByType
     └─ averageScores
```

**Current Status**: ⚠️ Partially Implemented  
**Missing**:
- ✗ Real-time response tracking
- ✗ Analytics aggregation
- ✗ Response rate calculations

---

### PAGE 10: CompareStage.tsx ✅
**Purpose**: Comparison between different time periods  
**Features**:
- Historical comparison
- Trend analysis
- Benchmarking
- Gap tracking

**Firestore Data Needed**:
```
/schools/{schoolId}
  ├─ /reports (all historical reports)
  │  ├─ reportId
  │  ├─ generatedAt
  │  ├─ scores
  │  └─ metrics
  │
  └─ /comparisons/{comparisonId}
     ├─ report1Id
     ├─ report2Id
     ├─ comparedAt
     └─ analysis
```

**Current Status**: ⚠️ Partially Implemented

---

### PAGE 11: Admin.tsx ✅
**Purpose**: Admin dashboard and management  
**Features**:
- School management
- User management
- System settings
- Audit logs

**Firestore Data Needed**:
```
/schools (all schools)
  ├─ Create/read/update/delete schools
  ├─ Manage subscriptions
  └─ View audit logs
  
/users (all users)
  ├─ Create/manage users
  ├─ Set roles
  └─ View activity
  
/systemSettings/config
  ├─ Global settings
  ├─ Feature flags
  └─ Audit configuration
  
/schools/{schoolId}/auditLogs
  ├─ All operations logged
  ├─ Before/after state
  └─ User tracking
```

**Current Status**: ⚠️ Partially Implemented  
**Missing**:
- ✗ Audit log collection
- ✗ Audit log queries
- ✗ System settings management

---

### PAGE 12: Staff.tsx
**Purpose**: Staff management  
**Features**:
- Staff directory
- Department assignment
- Performance tracking
- Development tracking

**Firestore Data Needed**:
```
/schools/{schoolId}/staff/{staffId}
  ├─ userId: reference
  ├─ name: string
  ├─ email: string
  ├─ department: string
  ├─ designation: string
  ├─ joinDate: timestamp
  ├─ qualifications: array
  ├─ yearsOfExperience: number
  ├─ performanceRating: number
  ├─ developmentNeeds: array
  └─ lastUpdated: timestamp
```

**Current Status**: ⚠️ Minimal Implementation  
**Missing**:
- ✗ Save staff data to Firestore
- ✗ Load staff from Firestore
- ✗ Update staff details
- ✗ Track performance

---

### PAGE 13: Students.tsx
**Purpose**: Student management  
**Features**:
- Student directory
- Grade/class assignment
- Performance tracking
- Attendance

**Firestore Data Needed**:
```
/schools/{schoolId}/students/{studentId}
  ├─ name: string
  ├─ email: string (if applicable)
  ├─ grade: string
  ├─ section: string
  ├─ parentId: reference
  ├─ enrollmentDate: timestamp
  ├─ status: "active" | "inactive"
  ├─ academicPerformance: number
  ├─ attendanceRate: number
  └─ lastUpdated: timestamp
```

**Current Status**: ⚠️ Minimal Implementation

---

### PAGE 14: Attendance.tsx
**Purpose**: Attendance tracking  
**Features**:
- Daily attendance marking
- Attendance reports
- Trend analysis
- Notifications

**Firestore Data Needed**:
```
/schools/{schoolId}/attendance/{attendanceId}
  ├─ date: timestamp
  ├─ studentId: reference
  ├─ status: "present" | "absent" | "leave"
  ├─ markedBy: userId
  ├─ markedAt: timestamp
  └─ notes: string (optional)
  
/schools/{schoolId}/students/{studentId}/attendanceStats
  ├─ totalDays: number
  ├─ presentDays: number
  ├─ attendanceRate: percentage
  └─ lastUpdated: timestamp
```

**Current Status**: ⚠️ Minimal Implementation

---

## SECTION 2: MISSING FIRESTORE IMPLEMENTATIONS

### CRITICAL (Must Implement Immediately)

#### 1. ✗ Checkup Data Persistence (Stage 1)
**Current**: Data calculated locally, not saved  
**Required**: Save to `/schools/{schoolId}/checkups/{checkupId}`

```typescript
// Missing Implementation
const saveCheckupToFirestore = async (schoolId: string, checkupData: CheckupData) => {
  const checkupRef = doc(collection(db, 'schools', schoolId, 'checkups'));
  await setDoc(checkupRef, {
    ...checkupData,
    createdAt: serverTimestamp(),
    status: 'SUBMITTED'
  });
  
  // Trigger Cloud Function: analyzeCheckup
  return checkupRef.id;
};
```

**Firestore Path**: `/schools/{schoolId}/checkups/{checkupId}`  
**Trigger**: `analyzeCheckup()` Cloud Function (automatic)  
**Results Saved To**: `/schools/{schoolId}/checkups/{checkupId}/analysis/current`

---

#### 2. ✗ Assessment Response Persistence (Stage 2)
**Current**: Responses not fully saved  
**Required**: Save to `/schools/{schoolId}/assessments/{assessmentId}/responses/{responseId}`

```typescript
// Missing Implementation
const saveAssessmentResponse = async (
  schoolId: string,
  assessmentId: string,
  respondentData: RespondentResponse
) => {
  const responseRef = doc(
    collection(db, 'schools', schoolId, 'assessments', assessmentId, 'responses')
  );
  await setDoc(responseRef, {
    ...respondentData,
    submittedAt: serverTimestamp(),
    status: 'SUBMITTED'
  });
  
  return responseRef.id;
};
```

**Firestore Path**: `/schools/{schoolId}/assessments/{assessmentId}/responses/{responseId}`  
**Trigger**: Manual save on form submit  
**Aggregate**: Count responses, calculate response rate

---

#### 3. ✗ Report Generation & Storage (Stage 2)
**Current**: Reports generated locally, not persisted  
**Required**: Save to `/schools/{schoolId}/reports/{reportId}`

```typescript
// Missing Implementation
const saveReportToFirestore = async (schoolId: string, reportData: ReportData) => {
  const reportRef = doc(collection(db, 'schools', schoolId, 'reports'));
  await setDoc(reportRef, {
    ...reportData,
    reportType: 'Comprehensive14D',
    generatedAt: serverTimestamp(),
    status: 'PUBLISHED'
  });
  
  // Trigger Cloud Function: generate14DReport
  return reportRef.id;
};
```

**Firestore Path**: `/schools/{schoolId}/reports/{reportId}`  
**Trigger**: Manual trigger (button click) or automatic after X responses  
**Cloud Function**: `generate14DReport()`

---

#### 4. ✗ Simulation Results Storage (Stage 3)
**Current**: Simulations saved but results not persisted  
**Required**: Save to `/schools/{schoolId}/simulations/{simulationId}/results/{resultId}`

```typescript
// Missing Implementation
const saveSimulationToFirestore = async (schoolId: string, simulationData: SimulationData) => {
  const simRef = doc(collection(db, 'schools', schoolId, 'simulations'));
  await setDoc(simRef, {
    ...simulationData,
    createdAt: serverTimestamp(),
    status: 'PENDING'
  });
  
  // Trigger Cloud Function: runSimulation
  const resultsRef = doc(collection(simRef, 'results'));
  
  return { simulationId: simRef.id, resultsId: resultsRef.id };
};
```

**Firestore Path**: `/schools/{schoolId}/simulations/{simulationId}` and `/results/{resultId}`

---

#### 5. ✗ Audit Logging
**Current**: No audit trail  
**Required**: Log all operations to `/schools/{schoolId}/auditLogs/{logId}`

```typescript
// Missing Implementation
const logAuditEvent = async (
  schoolId: string,
  action: string,
  entityType: string,
  entityId: string,
  userId: string,
  changes: any
) => {
  const auditRef = doc(collection(db, 'schools', schoolId, 'auditLogs'));
  await setDoc(auditRef, {
    timestamp: serverTimestamp(),
    action,
    entityType,
    entityId,
    userId,
    userRole: (await getCurrentUserRole()),
    changes,
    ipAddress: (await getIpAddress()),
    metadata: {}
  });
};
```

**Firestore Path**: `/schools/{schoolId}/auditLogs/{logId}`  
**Triggers**: Every create/update/delete operation  
**Protection**: Read-only for admins, write-only for Cloud Functions

---

#### 6. ✗ User Activity Tracking
**Current**: Limited tracking  
**Required**: Update user's lastLogin, loginCount, lastActivityDate

```typescript
// Missing Implementation
const trackUserActivity = async (userId: string, schoolId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    lastLogin: serverTimestamp(),
    lastActivityDate: serverTimestamp(),
    schoolId,
    loginCount: increment(1)
  });
};
```

**Firestore Path**: `/users/{userId}`

---

### HIGH PRIORITY (Important to Implement)

#### 7. ✗ Real-time Response Tracking
**Current**: Dashboard doesn't update in real-time  
**Required**: Use Firestore `onSnapshot` listeners

```typescript
// Missing Implementation
const subscribeToResponseUpdates = (schoolId: string, assessmentId: string) => {
  return onSnapshot(
    collection(db, 'schools', schoolId, 'assessments', assessmentId, 'responses'),
    (snapshot) => {
      const responses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update dashboard with real-time data
      updateResponseDashboard({
        totalResponses: responses.length,
        byType: groupResponsesByType(responses),
        responseRate: calculateResponseRate(responses)
      });
    }
  );
};
```

---

#### 8. ✗ Assessment Metadata Storage
**Current**: Assessment configuration not saved  
**Required**: Save to `/schools/{schoolId}/assessments/{assessmentId}`

```typescript
// Missing Implementation
const saveAssessmentMetadata = async (schoolId: string, assessmentConfig: AssessmentConfig) => {
  const assessmentRef = doc(collection(db, 'schools', schoolId, 'assessments'));
  await setDoc(assessmentRef, {
    assessmentName: assessmentConfig.name,
    description: assessmentConfig.description,
    createdBy: getCurrentUserId(),
    createdAt: serverTimestamp(),
    status: 'ACTIVE',
    expectedRespondents: assessmentConfig.expectedRespondents,
    surveyEndDate: assessmentConfig.deadline,
    surveyLink: generateUniqueLink(assessmentRef.id)
  });
  
  return assessmentRef.id;
};
```

---

#### 9. ✗ Real-time Notification System
**Current**: No notifications  
**Required**: Firestore + Cloud Messaging

```typescript
// Missing Implementation
const createNotification = async (
  userId: string,
  type: 'response_needed' | 'report_ready' | 'simulation_complete',
  data: any
) => {
  const notifRef = doc(collection(db, 'users', userId, 'notifications'));
  await setDoc(notifRef, {
    type,
    data,
    createdAt: serverTimestamp(),
    read: false,
    metadata: {}
  });
};
```

---

#### 10. ✗ Report History & Versioning
**Current**: Only latest report available  
**Required**: Archive and version reports

```typescript
// Missing Implementation
const archiveOldReport = async (schoolId: string, reportId: string) => {
  const reportRef = doc(db, 'schools', schoolId, 'reports', reportId);
  await updateDoc(reportRef, {
    status: 'ARCHIVED',
    archivedAt: serverTimestamp()
  });
};
```

---

### MEDIUM PRIORITY (Nice to Have)

#### 11. Analytics & Aggregations
- Response rate by dimension
- Trend tracking
- Benchmark comparisons
- Score distributions

#### 12. Data Export Features
- PDF export
- Excel export
- CSV export
- Custom reports

#### 13. Advanced Filtering
- Filter assessments by date
- Filter responses by type
- Filter reports by status

---

## SECTION 3: IMPLEMENTATION ROADMAP

### PHASE 1: CRITICAL FIXES (This Week)

**Priority 1.1**: Checkup Data Persistence
- [ ] Create `saveCheckupToFirestore()` function
- [ ] Wire into Checkup.tsx submit button
- [ ] Verify data saves to `/schools/{schoolId}/checkups/{checkupId}`
- [ ] Verify Cloud Function triggers automatically
- [ ] Test analysis results saved to `/analysis/current`

**Priority 1.2**: Assessment Response Persistence
- [ ] Create `saveAssessmentResponse()` function
- [ ] Wire into StakeholderSurvey.tsx submit
- [ ] Save to `/schools/{schoolId}/assessments/{assessmentId}/responses/{responseId}`
- [ ] Calculate and update response count

**Priority 1.3**: Report Generation & Storage
- [ ] Create `saveReportToFirestore()` function
- [ ] Wire generate button in MultiUserAssessment.tsx
- [ ] Trigger Cloud Function and wait for results
- [ ] Display report from Firestore

**Priority 1.4**: Simulation Results
- [ ] Ensure simulation scenarios saved to Firestore
- [ ] Trigger Cloud Function
- [ ] Save results to `/results/{resultId}`

**Priority 1.5**: Audit Logging
- [ ] Create `logAuditEvent()` wrapper function
- [ ] Wrap all Firestore write operations
- [ ] Verify logs saved to `/auditLogs/{logId}`

---

### PHASE 2: HIGH PRIORITY (Next Week)

- [ ] Real-time response tracking
- [ ] Assessment metadata storage
- [ ] User activity tracking
- [ ] Notification system
- [ ] Report history & versioning

---

### PHASE 3: MEDIUM PRIORITY (Later)

- [ ] Analytics & aggregations
- [ ] Data export features
- [ ] Advanced filtering
- [ ] Performance optimization

---

## SECTION 4: IMPLEMENTATION CODE TEMPLATES

### Template 1: Save Checkup Data

```typescript
// File: src/lib/checkupService.ts

import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface CheckupData {
  surveyInput: Record<string, any>;
  operationalMetricsUploaded: Record<string, any>;
  createdBy: string;
}

export const saveCheckupToFirestore = async (
  schoolId: string,
  checkupData: CheckupData
): Promise<string> => {
  try {
    const checkupRef = doc(collection(db, 'schools', schoolId, 'checkups'));
    
    await setDoc(checkupRef, {
      ...checkupData,
      checkupType: 'FirstOpinion',
      status: 'SUBMITTED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✓ Checkup saved: ${checkupRef.id}`);
    
    // Audit log
    await logAuditEvent(schoolId, 'CHECKUP_SUBMITTED', 'checkup', checkupRef.id, checkupData.createdBy);
    
    return checkupRef.id;
  } catch (error) {
    console.error('Error saving checkup:', error);
    throw error;
  }
};

// Subscribe to analysis results (real-time)
export const subscribeToCheckupAnalysis = (
  schoolId: string,
  checkupId: string,
  callback: (analysis: any) => void
) => {
  const analysisRef = doc(db, 'schools', schoolId, 'checkups', checkupId, 'analysis', 'current');
  
  return onSnapshot(analysisRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
};
```

### Template 2: Save Assessment Response

```typescript
// File: src/lib/assessmentService.ts

interface RespondentResponse {
  respondentType: 'teacher' | 'parent' | 'student' | 'admin' | 'other';
  respondentEmail: string;
  respondentName: string;
  answers: Record<string, number>; // D1-D14 scores
  feedback?: string;
}

export const saveAssessmentResponse = async (
  schoolId: string,
  assessmentId: string,
  response: RespondentResponse
): Promise<string> => {
  try {
    const responseRef = doc(
      collection(db, 'schools', schoolId, 'assessments', assessmentId, 'responses')
    );
    
    await setDoc(responseRef, {
      ...response,
      submittedAt: serverTimestamp(),
      status: 'SUBMITTED'
    });
    
    // Update assessment response count
    await updateAssessmentResponseCount(schoolId, assessmentId);
    
    return responseRef.id;
  } catch (error) {
    console.error('Error saving response:', error);
    throw error;
  }
};
```

### Template 3: Audit Logging

```typescript
// File: src/lib/auditService.ts

export const logAuditEvent = async (
  schoolId: string,
  action: string,
  entityType: string,
  entityId: string,
  userId: string,
  changes?: Record<string, any>
): Promise<void> => {
  try {
    const auditRef = doc(collection(db, 'schools', schoolId, 'auditLogs'));
    
    await setDoc(auditRef, {
      timestamp: serverTimestamp(),
      action,
      entityType,
      entityId,
      userId,
      changes: changes || {},
      metadata: {
        ipAddress: await getIpAddress(),
        userAgent: navigator.userAgent
      }
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw - audit logging shouldn't break main flow
  }
};
```

---

## SECTION 5: FIRESTORE SCHEMA UPDATES NEEDED

### Add These Collections:

#### 1. `/schools/{schoolId}/checkups/{checkupId}`
```json
{
  "checkupType": "string (FirstOpinion)",
  "status": "string (SUBMITTED|ANALYZED|PUBLISHED)",
  "surveyInput": "object",
  "operationalMetricsUploaded": "object",
  "createdBy": "string (userId)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### 2. `/schools/{schoolId}/checkups/{checkupId}/analysis/current`
```json
{
  "layer1_SubjectiveScores": "object",
  "layer2_ObjectiveMetrics": "object",
  "layer3_HealthIndex": "object",
  "gapAnalysis": "object",
  "rootCauseAnalysis": "object",
  "recommendations": "object",
  "generatedAt": "timestamp"
}
```

#### 3. `/schools/{schoolId}/assessments/{assessmentId}`
```json
{
  "assessmentName": "string",
  "description": "string",
  "createdBy": "string",
  "createdAt": "timestamp",
  "status": "string (ACTIVE|CLOSED|ANALYZED)",
  "expectedRespondents": "object",
  "surveyLink": "string",
  "surveyEndDate": "timestamp"
}
```

#### 4. `/schools/{schoolId}/assessments/{assessmentId}/responses/{responseId}`
```json
{
  "respondentType": "string",
  "respondentEmail": "string",
  "respondentName": "string",
  "answers": "object (D1-D14)",
  "submittedAt": "timestamp",
  "status": "string (SUBMITTED|PARTIAL)"
}
```

#### 5. `/schools/{schoolId}/reports/{reportId}`
```json
{
  "reportType": "string (Comprehensive14D)",
  "assessmentId": "string",
  "generatedBy": "string",
  "generatedAt": "timestamp",
  "executiveSummary": "object",
  "dimensionAnalysis": "object",
  "status": "string (PUBLISHED|ARCHIVED)"
}
```

#### 6. `/schools/{schoolId}/simulations/{simulationId}`
```json
{
  "scenario": "object",
  "baseline": "object",
  "createdBy": "string",
  "createdAt": "timestamp",
  "status": "string (DRAFT|COMPLETED)"
}
```

#### 7. `/schools/{schoolId}/simulations/{simulationId}/results/{resultId}`
```json
{
  "dimensionImpactAnalysis": "object",
  "overallImpactSummary": "object",
  "resourceEfficiencyAnalysis": "object",
  "riskAnalysis": "object",
  "generatedAt": "timestamp"
}
```

#### 8. `/schools/{schoolId}/auditLogs/{logId}`
```json
{
  "timestamp": "timestamp",
  "action": "string",
  "entityType": "string",
  "entityId": "string",
  "userId": "string",
  "changes": "object",
  "metadata": "object"
}
```

---

## SECTION 6: TESTING CHECKLIST

### Checkup Flow (Stage 1)
- [ ] Submit checkup with survey answers
- [ ] Verify data saved to Firestore
- [ ] Verify Cloud Function triggered
- [ ] Verify analysis results saved
- [ ] Verify real-time update in UI
- [ ] Verify audit log created

### Assessment Flow (Stage 2)
- [ ] Create assessment
- [ ] Save assessment metadata to Firestore
- [ ] Submit response as different user type
- [ ] Verify response saved to Firestore
- [ ] Verify response count updated
- [ ] Trigger report generation
- [ ] Verify report saved to Firestore
- [ ] Load report from Firestore

### Simulation Flow (Stage 3)
- [ ] Save simulation scenario
- [ ] Trigger simulation
- [ ] Verify results saved to Firestore
- [ ] Load results from Firestore
- [ ] Compare with baseline

### Audit Trail
- [ ] Verify all operations logged
- [ ] Check audit logs in Firestore
- [ ] Verify only admins can read

---

## SUMMARY: CRITICAL ITEMS TO IMPLEMENT

| Priority | Feature | Firestore Path | Status |
|----------|---------|-----------------|--------|
| **P0** | Checkup persistence | `/checkups/{id}` | ✗ |
| **P0** | Assessment response | `/assessments/{id}/responses` | ✗ |
| **P0** | Report storage | `/reports/{id}` | ✗ |
| **P0** | Simulation results | `/simulations/{id}/results` | ✗ |
| **P0** | Audit logging | `/auditLogs/{id}` | ✗ |
| **P1** | Real-time tracking | All collections | ✗ |
| **P1** | User activity | `/users/{id}` | ⚠️ |
| **P2** | Analytics | Global | ✗ |
| **P2** | Notifications | `/users/{id}/notifications` | ✗ |

---

**Status**: Ready for Implementation  
**Timeline**: Phase 1 (Critical) = 2-3 days  
**Next Step**: Start with Priority P0 items

