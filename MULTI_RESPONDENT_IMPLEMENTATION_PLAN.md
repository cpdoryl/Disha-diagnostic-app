# 🎯 MULTI-RESPONDENT SYSTEM - COMPLETE IMPLEMENTATION PLAN

**Date:** 2026-08-05  
**Phase:** Full Production Implementation  
**Timeline:** 4-6 weeks  
**Complexity:** Medium-High  
**Team Size:** 1-2 developers

---

## 📋 IMPLEMENTATION ROADMAP

```
WEEK 1: Planning & Setup
├─ Day 1: Database Schema Design
├─ Day 2: Data Migration Planning
├─ Day 3: API Endpoint Planning
├─ Day 4: UI Component Scoping
└─ Day 5: Testing Strategy

WEEK 2: Database & Backend
├─ Day 1: Create Firestore collections
├─ Day 2: Build backend services
├─ Day 3: Implement Cloud Functions
├─ Day 4: Test CRUD operations
└─ Day 5: Set up security rules

WEEK 3: Frontend Components
├─ Day 1: Build respondent management UI
├─ Day 2: Create respondent tracking dashboard
├─ Day 3: Build invite link generation
├─ Day 4: Implement response collection
└─ Day 5: Test end-to-end

WEEK 4: Analytics Engine
├─ Day 1: Build aggregation functions
├─ Day 2: Create consensus calculation
├─ Day 3: Implement outlier detection
├─ Day 4: Build trend analysis
└─ Day 5: Create analytics dashboard

WEEK 5: Integration & Testing
├─ Day 1: End-to-end testing
├─ Day 2: Performance optimization
├─ Day 3: Security review
├─ Day 4: User acceptance testing
└─ Day 5: Bug fixes

WEEK 6: Deployment & Launch
├─ Day 1: Final QA
├─ Day 2: Production deployment
├─ Day 3: Monitoring setup
├─ Day 4: Documentation
└─ Day 5: Go-live & support

TOTAL: 4-6 weeks to full deployment
```

---

## 🔧 PHASE 1: DATABASE SCHEMA

### Firestore Collection Structure

```firestore
disha-diagnostic-engine/
│
├─ schools/
│  └─ SCHOOL_001/
│     ├─ name: "Golden Academy"
│     ├─ location: "Delhi"
│     ├─ principal: "John Doe"
│     ├─ email: "school@example.com"
│     ├─ createdAt: 2026-08-01
│     └─ activeAssessments: ["ASSESS_001", "ASSESS_002"]
│
├─ assessments/  ← UPDATED COLLECTION
│  └─ ASSESS_001/
│     ├─ schoolId: "SCHOOL_001"
│     ├─ schoolName: "Golden Academy"
│     ├─ assessmentStatus: "IN_PROGRESS"
│     ├─ assessmentType: "MULTI_RESPONDENT"
│     ├─ createdAt: 2026-08-05
│     ├─ updatedAt: 2026-08-05
│     │
│     ├─ targetCounts:  ← NEW
│     │  ├─ management: 5
│     │  ├─ teachers: 8
│     │  ├─ parents_students: 10
│     │  └─ operational_metrics: 5
│     │
│     ├─ respondentCounts:  ← NEW
│     │  ├─ management: 3
│     │  ├─ teachers: 5
│     │  ├─ parents_students: 6
│     │  ├─ operational_metrics: 2
│     │  └─ total: 16/28
│     │
│     ├─ completionPercentage: 57
│     ├─ respondentIds: ["RESP_M_001", "RESP_M_002", ...]  ← NEW
│     │
│     ├─ aggregatedData: {  ← NEW
│     │  "D01": {
│     │    "mean": 72.5,
│     │    "stdDev": 1.2,
│     │    "consensus": "HIGH",
│     │    "byStakeholder": {...}
│     │  },
│     │  ...
│     │}
│     │
│     └─ statistics: {  ← NEW
│        "totalRespondents": 16,
│        "completionRate": 57,
│        "divergentDimensions": ["D04", "D09"],
│        "strongAgreementDimensions": ["D01", "D05"]
│      }
│
├─ respondents/  ← NEW COLLECTION (Core)
│  └─ RESP_M_001/
│     ├─ assessmentId: "ASSESS_001"
│     ├─ respondentNumber: 1
│     ├─ name: "Principal John Doe"
│     ├─ email: "john@school.com"
│     ├─ role: "Principal"
│     ├─ department: "Administration"
│     │
│     ├─ stakeholderGroup: "management"
│     ├─ respondentLink: "link_a1b2c3d4e5f6g7h8"  ← Unique invite link
│     ├─ linkExpiresAt: 2026-08-12
│     ├─ linkStatus: "ACTIVE" | "EXPIRED" | "USED"
│     │
│     ├─ status: "PENDING" | "IN_PROGRESS" | "COMPLETE"
│     ├─ startedAt: null
│     ├─ completedAt: null
│     ├─ completionPercentage: 0
│     ├─ lastActivityAt: null
│     │
│     ├─ responses: [
│     │  { 
│     │    "dimensionId": "D01",
│     │    "questionId": "q1_m_1",
│     │    "selectedWeight": 2,
│     │    "timestamp": 2026-08-05T14:30:00Z
│     │  },
│     │  ...
│     │]
│     │
│     ├─ dimensionScores: {  ← Calculated per respondent
│     │  "D01": 72.5,
│     │  "D02": 68.3,
│     │  ...
│     │}
│     │
│     ├─ overallScore: 70.8
│     ├─ sentimentScore: "POSITIVE" | "NEUTRAL" | "NEGATIVE"
│     │
│     └─ metadata: {
│        "ipAddress": "192.168.1.100",
│        "userAgent": "Mozilla/5.0...",
│        "sessionDuration": 1800,
│        "deviceType": "DESKTOP" | "MOBILE" | "TABLET"
│      }
│
├─ respondent_responses/  ← NEW COLLECTION (Detailed responses)
│  └─ RESP_M_001_D01/
│     ├─ respondentId: "RESP_M_001"
│     ├─ assessmentId: "ASSESS_001"
│     ├─ dimensionId: "D01"
│     │
│     ├─ responses: [
│     │  {
│     │    "questionId": "q1_m_1",
│     │    "question": "What is your board exam pass rate...",
│     │    "selectedWeight": 2,
│     │    "selectedOption": "75-85% pass rate",
│     │    "timestamp": 2026-08-05T14:30:00Z
│     │  },
│     │  ...
│     │]
│     │
│     ├─ dimensionScore: 72.5
│     ├─ questionsAnswered: 12
│     ├─ completionTime: 600  ← seconds
│     ├─ averageTimePerQuestion: 50  ← seconds
│     │
│     └─ notes: "Quick assessment, straightforward answers"
│
├─ aggregated_results/  ← NEW COLLECTION (Computed analytics)
│  └─ ASSESS_001_AGGREGATED/
│     ├─ assessmentId: "ASSESS_001"
│     ├─ computedAt: 2026-08-05T15:45:00Z
│     │
│     ├─ dimensionMetrics: {
│     │  "D01": {
│     │    "mean": 72.5,
│     │    "median": 72.0,
│     │    "stdDev": 1.2,
│     │    "min": 70,
│     │    "max": 75,
│     │    "range": 5,
│     │    "sampleSize": 8,
│     │    "consensus": "HIGH",
│     │    "consensusLevel": 0.85,  ← 0-1 scale
│     │    "byStakeholder": {
│     │      "management": { mean: 75.2, stdDev: 0.8, n: 3 },
│     │      "teachers": { mean: 70.1, stdDev: 1.5, n: 5 },
│     │      "parents_students": { mean: 72.3, stdDev: 1.1, n: 6 },
│     │      "operational_metrics": { mean: 71.2, stdDev: 0.9, n: 2 }
│     │    }
│     │  },
│     │  ... (D02-D14)
│     │}
│     │
│     ├─ overallMetrics: {
│     │  "mean": 70.8,
│     │  "median": 71.2,
│     │  "stdDev": 2.1,
│     │  "healthStatus": "HEALTHY_SCHOOL",
│     │  "percentile": 65
│     │}
│     │
│     ├─ consensusAnalysis: {
│     │  "highConsensus": ["D01", "D03", "D05"],
│     │  "moderateConsensus": ["D02", "D06"],
│     │  "lowConsensus": ["D04", "D09"],
│     │  "highConflict": []
│     │}
│     │
│     ├─ divergentDimensions: {
│     │  "D04": {
│     │    "dimension": "Parent Engagement",
│     │    "stdDev": 2.8,
│     │    "consensusLevel": 0.45,
│     │    "gap": "LARGE_STAKEHOLDER_GAP",
│     │    "byStakeholder": {
│     │      "management": 72.1,
│     │      "teachers": 65.2,
│     │      "parents_students": 58.3,
│     │      "operational_metrics": 61.5
│     │    },
│     │    "maxGap": 13.8,  ← between management & parents
│     │    "recommendation": "URGENT_INVESTIGATION"
│     │  }
│     │}
│     │
│     └─ stakeholderComparison: {
│        "management": { mean: 76.4, stdDev: 1.5 },
│        "teachers": { mean: 68.9, stdDev: 2.3 },
│        "parents_students": { mean: 72.8, stdDev: 2.0 },
│        "operational_metrics": { mean: 67.1, stdDev: 1.8 }
│      }
│
├─ outlier_analysis/  ← NEW COLLECTION (Outliers & anomalies)
│  └─ ASSESS_001_OUTLIERS/
│     ├─ assessmentId: "ASSESS_001"
│     ├─ outliers: [
│     │  {
│     │    "respondentId": "RESP_T_003",
│     │    "name": "Teacher 3",
│     │    "stakeholderGroup": "teachers",
│     │    "overallScore": 85,
│     │    "groupAverage": 68,
│     │    "deviation": 17,
│     │    "percentile": 95,
│     │    "type": "HIGH_OUTLIER",
│     │    "anomalies": [
│     │      {
│     │        "dimensionId": "D01",
│     │        "theirScore": 85,
│     │        "groupAverage": 70,
│     │        "deviation": 15,
│     │        "zscore": 2.5
│     │      }
│     │    ],
│     │    "likelyReason": "NEW_TEACHER_ENTHUSIASM",
│     │    "recommendation": "MENTOR_OTHER_TEACHERS"
│     │  },
│     │  {
│     │    "respondentId": "RESP_T_008",
│     │    "name": "Teacher 8",
│     │    "overallScore": 45,
│     │    "groupAverage": 68,
│     │    "deviation": -23,
│     │    "percentile": 5,
│     │    "type": "LOW_OUTLIER",
│     │    "likelyReason": "DISENGAGEMENT_OR_ISSUES",
│     │    "recommendation": "INDIVIDUAL_COACHING_NEEDED"
│     │  }
│     │]
│     │
│     └─ outlierStatistics: {
│        "totalOutliers": 2,
│        "highOutliers": 1,
│        "lowOutliers": 1,
│        "outliersPercentage": 12.5
│      }
│
├─ assessment_history/  ← EXPANDED COLLECTION (Trends)
│  └─ SCHOOL_001/
│     ├─ assessmentIds: ["ASSESS_001", "ASSESS_002", "ASSESS_003"]
│     │
│     ├─ trends: [
│     │  {
│     │    "assessmentId": "ASSESS_001",
│     │    "date": 2026-06-01,
│     │    "D01": 68.5,
│     │    "D02": 65.2,
│     │    "overall": 68.0
│     │  },
│     │  {
│     │    "assessmentId": "ASSESS_002",
│     │    "date": 2026-07-01,
│     │    "D01": 70.1,
│     │    "D02": 67.8,
│     │    "overall": 69.5
│     │  },
│     │  {
│     │    "assessmentId": "ASSESS_003",
│     │    "date": 2026-08-05,
│     │    "D01": 72.5,
│     │    "D02": 70.3,
│     │    "overall": 70.8
│     │  }
│     │]
│     │
│     └─ improvements: {
│        "D01": { "trend": "UP", "improvement": 4.0 },
│        "D02": { "trend": "UP", "improvement": 5.1 },
│        "overall": { "trend": "UP", "improvement": 2.8 }
│      }
│
└─ assessment_reports/  ← EXPANDED COLLECTION
   └─ ASSESS_001_REPORT/
      ├─ assessmentId: "ASSESS_001"
      ├─ reportType: "MULTI_RESPONDENT"
      ├─ generatedAt: 2026-08-05T15:45:00Z
      │
      ├─ executiveSummary: {...}
      ├─ detailedAnalysis: {...}
      ├─ recommendedActions: {...}
      ├─ trendAnalysis: {...}
      │
      └─ distributionFiles: {
         "json_url": "gs://...",
         "pdf_url": "gs://...",
         "csv_url": "gs://..."
       }
```

---

## 📝 DATABASE SCHEMA CODE

### TypeScript Interfaces

```typescript
// src/types/multi-respondent.ts

// ============================================================================
// ASSESSMENT TYPES
// ============================================================================

export interface Assessment {
  // Existing fields
  assessmentId: string;
  schoolId: string;
  schoolName: string;
  createdAt: Date;
  updatedAt: Date;
  
  // New fields for multi-respondent
  assessmentType: 'SINGLE_RESPONDENT' | 'MULTI_RESPONDENT';
  assessmentStatus: 'IN_PROGRESS' | 'COMPLETE' | 'ARCHIVED';
  
  // Target respondent counts
  targetCounts: {
    management: number;
    teachers: number;
    parents_students: number;
    operational_metrics: number;
  };
  
  // Actual respondent counts
  respondentCounts: {
    management: number;
    teachers: number;
    parents_students: number;
    operational_metrics: number;
    total: number;
  };
  
  // Respondent tracking
  respondentIds: string[];
  completionPercentage: number;  // 0-100
  
  // Aggregated data
  aggregatedData?: AggregatedDimensionData;
  statistics?: AssessmentStatistics;
}

// ============================================================================
// RESPONDENT TYPES
// ============================================================================

export interface Respondent {
  // ID and assessment link
  respondentId: string;
  assessmentId: string;
  respondentNumber: number;  // 1st, 2nd, 3rd respondent
  
  // Personal info
  name: string;
  email?: string;
  role: string;  // e.g., "Principal", "Teacher", "Parent"
  department?: string;  // e.g., "Administration", "Science"
  
  // Classification
  stakeholderGroup: 'management' | 'teachers' | 'parents_students' | 'operational_metrics';
  
  // Access control
  respondentLink: string;  // Unique link for this person
  linkExpiresAt: Date;
  linkStatus: 'ACTIVE' | 'EXPIRED' | 'USED';
  
  // Status tracking
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE';
  startedAt?: Date;
  completedAt?: Date;
  completionPercentage: number;  // 0-100
  lastActivityAt?: Date;
  
  // Responses
  responses: DimensionResponse[];
  
  // Calculated scores
  dimensionScores: {
    [dimensionId: string]: number;  // D01: 72.5, D02: 68.3, etc.
  };
  overallScore?: number;
  
  // Additional metadata
  sentimentScore?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionDuration?: number;  // seconds
    deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET';
  };
}

export interface RespondentResponse {
  respondentId: string;
  assessmentId: string;
  dimensionId: string;
  
  questions: QuestionResponse[];
  dimensionScore: number;
  
  questionsAnswered: number;
  completionTime: number;  // seconds
  averageTimePerQuestion: number;  // seconds
  
  notes?: string;
}

export interface QuestionResponse {
  questionId: string;
  question: string;
  selectedWeight: number;  // 1-10
  selectedOption: string;
  timestamp: Date;
}

// ============================================================================
// AGGREGATED DATA TYPES
// ============================================================================

export interface AggregatedDimensionData {
  [dimensionId: string]: DimensionAggregation;
}

export interface DimensionAggregation {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;
  
  sampleSize: number;
  consensus: 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW' | 'HIGH_CONFLICT';
  consensusLevel: number;  // 0-1
  
  byStakeholder: {
    [stakeholder: string]: StakeholderMetrics;
  };
}

export interface StakeholderMetrics {
  mean: number;
  median?: number;
  stdDev: number;
  min?: number;
  max?: number;
  n: number;  // sample size
}

export interface AssessmentStatistics {
  totalRespondents: number;
  
  respondentsByCategory: {
    management: number;
    teachers: number;
    parents_students: number;
    operational_metrics: number;
  };
  
  completionRate: number;  // 0-100%
  
  consensusAnalysis: {
    highConsensus: string[];  // Dimension IDs
    moderateConsensus: string[];
    lowConsensus: string[];
    highConflict: string[];
  };
  
  divergentDimensions: {
    [dimensionId: string]: DivergenceSummary;
  };
  
  strongAgreementDimensions: string[];
  
  outliers: OutlierSummary[];
  
  stakeholderComparison: {
    [stakeholder: string]: StakeholderComparisonMetrics;
  };
}

export interface DivergenceSummary {
  dimension: string;
  stdDev: number;
  consensusLevel: number;
  gap: 'SMALL_GAP' | 'MODERATE_GAP' | 'LARGE_GAP';
  byStakeholder: {
    [stakeholder: string]: number;
  };
  maxGap: number;  // between highest and lowest stakeholder
  recommendation: string;
}

export interface OutlierSummary {
  respondentId: string;
  name: string;
  stakeholderGroup: string;
  overallScore: number;
  groupAverage: number;
  deviation: number;
  percentile: number;  // 0-100
  type: 'HIGH_OUTLIER' | 'LOW_OUTLIER';
  anomalies: OutlierAnomaly[];
  likelyReason?: string;
  recommendation?: string;
}

export interface OutlierAnomaly {
  dimensionId: string;
  theirScore: number;
  groupAverage: number;
  deviation: number;
  zScore: number;
}

export interface StakeholderComparisonMetrics {
  mean: number;
  median?: number;
  stdDev: number;
  n: number;
}

// ============================================================================
// RESPONSE TYPES (from original assessment)
// ============================================================================

export interface DimensionResponse {
  dimensionId: string;
  questionId: string;
  selectedOptionWeight: number;  // 1-10
}

export interface DimensionScore {
  dimensionId: string;
  label: string;
  weight: number;
  tier: string;
  averageWeight: number;
  score: number;  // 0-100
  benchmark: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  classification: string;
}
```

---

## 🔐 FIRESTORE SECURITY RULES

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ====================================================================
    // HELPER FUNCTIONS
    // ====================================================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isSchoolAdmin(schoolId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.schoolId == schoolId;
    }
    
    function isRespondent(respondentId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/respondents/$(respondentId)).data.userId == request.auth.uid;
    }
    
    // ====================================================================
    // ASSESSMENTS COLLECTION
    // ====================================================================
    
    match /assessments/{assessmentId} {
      // School admins can read/write their own assessments
      allow read: if isSchoolAdmin(resource.data.schoolId);
      allow write: if isSchoolAdmin(request.resource.data.schoolId);
      
      // Admins can do anything
      allow read, write: if isAdmin();
    }
    
    // ====================================================================
    // RESPONDENTS COLLECTION (NEW)
    // ====================================================================
    
    match /respondents/{respondentId} {
      // Respondents can read/write their own data
      allow read: if isRespondent(respondentId);
      allow write: if isRespondent(respondentId);
      
      // School admins can read all respondents for their school
      allow read: if isSchoolAdmin(
        get(/databases/$(database)/documents/assessments/$(resource.data.assessmentId)).data.schoolId
      );
      
      // School admins can create new respondents
      allow create: if isSchoolAdmin(
        get(/databases/$(database)/documents/assessments/$(request.resource.data.assessmentId)).data.schoolId
      );
      
      // Admins can do anything
      allow read, write: if isAdmin();
    }
    
    // ====================================================================
    // RESPONDENT RESPONSES COLLECTION (NEW)
    // ====================================================================
    
    match /respondent_responses/{docId} {
      // Respondents can write their own responses
      allow write: if isRespondent(resource.data.respondentId);
      
      // School admins can read responses for their school's assessments
      allow read: if isSchoolAdmin(
        get(/databases/$(database)/documents/assessments/$(resource.data.assessmentId)).data.schoolId
      );
      
      // Admins can do anything
      allow read, write: if isAdmin();
    }
    
    // ====================================================================
    // AGGREGATED RESULTS COLLECTION (NEW)
    // ====================================================================
    
    match /aggregated_results/{docId} {
      // School admins can read their school's aggregated results
      allow read: if isSchoolAdmin(
        get(/databases/$(database)/documents/assessments/$(resource.data.assessmentId)).data.schoolId
      );
      
      // Only Cloud Functions can write aggregated results
      allow write: if false;  // Server-only writes
      
      // Admins can do anything
      allow read: if isAdmin();
    }
    
    // ====================================================================
    // OUTLIER ANALYSIS COLLECTION (NEW)
    // ====================================================================
    
    match /outlier_analysis/{docId} {
      // School admins can read
      allow read: if isSchoolAdmin(
        get(/databases/$(database)/documents/assessments/$(resource.data.assessmentId)).data.schoolId
      );
      
      // Only Cloud Functions can write
      allow write: if false;
      
      // Admins can do anything
      allow read: if isAdmin();
    }
    
    // ====================================================================
    // ASSESSMENT HISTORY COLLECTION (EXPANDED)
    // ====================================================================
    
    match /assessment_history/{schoolId} {
      // School admins can read their school's history
      allow read: if isSchoolAdmin(schoolId);
      
      // Admins can read all
      allow read: if isAdmin();
    }
  }
}
```

---

## 📊 CLOUD FIRESTORE INDEXES REQUIRED

```
Collection: assessments
Query: (schoolId, createdAt descending)
Status: Create

Collection: respondents
Query: (assessmentId, stakeholderGroup, createdAt)
Status: Create

Collection: respondents
Query: (assessmentId, status)
Status: Create

Collection: assessment_history
Query: (schoolId, date descending)
Status: Create

Collection: aggregated_results
Query: (assessmentId, computedAt descending)
Status: Create
```

---

## 🔄 DATA MIGRATION STRATEGY

### For Existing Assessments

```typescript
// Migration function to convert single-respondent to multi-respondent format

async function migrateToMultiRespondent(assessmentId: string) {
  const assessment = await getAssessment(assessmentId);
  
  // If already single-respondent, create a "Default Respondent"
  if (!assessment.respondentIds) {
    const respondent: Respondent = {
      respondentId: `${assessmentId}_DEFAULT`,
      assessmentId,
      respondentNumber: 1,
      name: "Default Assessment",
      role: "System",
      stakeholderGroup: "management",
      respondentLink: `legacy_${assessmentId}`,
      linkExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      linkStatus: "USED",
      status: "COMPLETE",
      completedAt: assessment.assessmentDate,
      completionPercentage: 100,
      responses: assessment.responses,
      dimensionScores: assessment.scores.reduce((acc, score) => {
        acc[score.dimensionId] = score.score;
        return acc;
      }, {}),
      overallScore: assessment.overallHealthIndex
    };
    
    await createRespondent(respondent);
    await updateAssessment(assessmentId, {
      assessmentType: 'MULTI_RESPONDENT',
      respondentIds: [respondent.respondentId],
      respondentCounts: {
        management: 1,
        teachers: 0,
        parents_students: 0,
        operational_metrics: 0,
        total: 1
      }
    });
  }
}
```

---

## 📱 COMPONENT STRUCTURE

```
src/components/MultiRespondent/
├─ AssessmentSetup.tsx          (Create multi-respondent assessment)
├─ RespondentManagement.tsx      (Manage respondents)
├─ RespondentProgressDashboard.tsx (Track completion)
├─ RespondentInviteGenerator.tsx (Generate invite links)
├─ RespondentResponseForm.tsx    (Fill out assessment as respondent)
├─ AnalyticsDashboard.tsx        (View consensus, outliers, etc.)
├─ ConsensusAnalysis.tsx         (Detailed consensus view)
├─ StakeholderComparison.tsx     (Compare stakeholder views)
├─ OutlierDetection.tsx          (View anomalies)
├─ TrendAnalysis.tsx             (Historical comparison)
└─ MultiRespondentReport.tsx     (Full analysis report)

src/services/MultiRespondent/
├─ respondentService.ts          (CRUD operations)
├─ analyticsService.ts           (Aggregation & calculations)
├─ outlierService.ts             (Outlier detection)
├─ trendService.ts               (Historical analysis)
└─ reportService.ts              (Report generation)

src/hooks/
└─ useMultiRespondentAssessment.ts (State management)
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Week 1: Planning
- [ ] Review this plan with team
- [ ] Finalize database schema
- [ ] Plan data migration
- [ ] Design UI mockups
- [ ] Estimate resource needs

### Week 2: Backend
- [ ] Create Firestore collections
- [ ] Implement security rules
- [ ] Build respondent service
- [ ] Create analytics service
- [ ] Test CRUD operations

### Week 3: Frontend
- [ ] Build respondent management UI
- [ ] Create invite link generator
- [ ] Build response form
- [ ] Track progress
- [ ] Test end-to-end

### Week 4: Analytics
- [ ] Implement consensus calculation
- [ ] Build outlier detection
- [ ] Create trend analysis
- [ ] Build dashboard
- [ ] Test all analytics

### Week 5: Integration
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security review
- [ ] UAT
- [ ] Bug fixes

### Week 6: Deployment
- [ ] Final QA
- [ ] Deploy to production
- [ ] Monitor systems
- [ ] Create documentation
- [ ] Go-live support

---

## 📞 NEXT STEP

Ready to implement Phase 2: Database Schema & Services?

