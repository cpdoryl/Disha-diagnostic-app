# DISHA First Opinion Engine v3 - Complete Tech Stack

**CPDO Architecture & Implementation**
**Created: 2026-08-22**
**Status: Phase 1 - Core Engine Specification**

---

## Overview

Complete technology stack for implementing the DISHA First Opinion Engine supporting:
- 15 Challenges across 6 Domains
- 8 Objective Multipliers (4 core + 4 expanded)
- Multi-stakeholder (5 roles) response aggregation
- Real-time calculation and reporting
- Multi-cycle trend analysis and predictive warnings
- 11 integrated data sources

---

## 1. Technology Stack

### Frontend Layer

**Framework:** React 18.2 (TypeScript)
- Status: ✅ Existing in codebase

**Routing:** React Router v7
- Assessment entry flow
- Real-time dashboard
- Report viewer
- Multi-cycle comparison

**State Management:** Zustand + TanStack Query
- Real-time response listening
- Challenge state management
- Multiplier calculations cache

**UI Components:** Shadcn/ui + Tailwind CSS
- Form builders for challenge questions
- Charts (Recharts for multiplier visualization)
- Report layout components
- Dashboard gauges and cards

**Real-time Data:** Firestore Listeners
- Challenge response stream
- Multiplier data updates
- Multi-stakeholder aggregation
- WebSocket push notifications

### Backend Layer

**Runtime:** Google Cloud Functions (Node.js 20)
- Status: ✅ Existing, configured for upgrade

**API Gateway:** Firebase Functions + Restful API
- HTTP triggers for challenge submission
- Challenge response aggregation
- Multiplier calculation pipeline
- Report generation

**Database:** Cloud Firestore (NoSQL)
- Real-time listeners configured
- Document-based structure
- Security rules for role-based access
- Batch writes for performance

**Database Cache:** Redis (optional, added in Phase 2)
- Pre-calculated multiplier results
- Challenge score cache
- Trend line caching
- 15-minute TTL

### Data Integration Layer

**ETL Pipeline:** Cloud Pub/Sub + Cloud Dataflow
- Connection to 11 source systems
- Scheduled data ingestion (daily)
- Data validation and transformation
- Error handling and retry logic

**Analytics & Storage:** BigQuery
- Historical cycle data
- Trend analysis datasets
- Predictive model training data
- Board reporting aggregates

**Data Warehouse:** Firestore Collections + Archive Buckets
- All first opinion submissions (versioned)
- Multi-cycle aggregates
- Audit trail (who submitted what, when)
- Deleted/archived cycles

### Security Layer

**Authentication:** Firebase Auth + Custom Claims
- Email + password for stakeholders
- Teacher ID verification
- Admin verification via email domain
- Phone verification for parents (OTP)

**Authorization:** Firestore Security Rules + Custom Middleware
- Role-based access (Teacher, Parent, Student, Admin, Other)
- School-scoped data access
- Challenge-level permissions
- Read/write separation

**Secrets Management:** Google Secret Manager
- API keys (11 source systems)
- Database credentials
- OAuth tokens
- Webhook signing keys

---

## 2. Database Schema Design

### Core Collections

#### `schools` Collection
```firestore
schools/{schoolId}
  - name: string
  - domain: string (e.g., "rylneuroacademy.com")
  - established: timestamp
  - board: string (CBSE, ICSE, IB, etc.)
  - region: string
  - studentCount: number
  - teacherCount: number
  - principalEmail: string
  - apiKey: string (for data ingestion)
  - config: {
      selectedChallenges: string[], // C1-C15 selected
      respondentRoles: string[], // [Teacher, Parent, Student, Admin, Other]
      expectedRespondents: { [role]: number },
      multiplierSources: { [multiplier]: string[] } // source systems
    }
  - createdAt: timestamp
  - updatedAt: timestamp
```

#### `assessmentCycles` Collection
```firestore
assessmentCycles/{schoolId}/{cycleId}
  - schoolId: string
  - cycleNumber: integer (1, 2, 3, ...)
  - year: string (e.g., "2026")
  - status: enum ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]
  - startDate: timestamp
  - endDate: timestamp
  - respondentDeadline: timestamp
  - submittedAt: timestamp (when locked/closed)
  - config: {
      selectedChallenges: string[],
      expectedRespondents: { [role]: number },
      weights: { [challenge]: number } // for S_sub calculation
    }
  - scores: {
      s_sub: number | null,
      m_obj: number | null,
      healthIndex: number | null,
      gap: number | null,
      quadrant: string | null // "REALITY_BETTER", "ALIGNED", "PERCEPTION_BETTER"
    }
  - respondentCount: { [role]: number },
  - createdAt: timestamp
  - updatedAt: timestamp
```

#### `challengeResponses` Collection
```firestore
assessmentCycles/{schoolId}/{cycleId}/challengeResponses/{responseId}
  - challengeId: string (C1-C15)
  - responderId: string
  - role: enum ["TEACHER", "PARENT", "STUDENT", "ADMIN", "OTHER"]
  - email: string
  - schoolId: string
  - cycleId: string
  
  // Screening questions for this challenge (2-3 questions)
  - responses: {
      q1: {
        text: string,
        selectedOption: number (1-10 ordinal),
        maxOption: number (max response value for denominator),
        isFact: boolean, // Refinement 4
        factSource: string | null (if isFact: "enrollment_system", etc.)
      },
      q2: { ... },
      q3: { ... }
    }
  
  - challenge: {
      title: string,
      domain: string,
      weight: number (0.05-0.15),
      description: string
    }
  
  - submittedAt: timestamp
  - updatedAt: timestamp
  - deleted: boolean (soft delete)
```

#### `multipliers` Collection (Per Cycle)
```firestore
assessmentCycles/{schoolId}/{cycleId}/multipliers/{multiplierId}
  - name: string (STR, ParentSLA, Training, PlanningTime, etc.)
  - category: enum ["CORE", "EXPANDED"]
  - value: number (0.0-1.0)
  - rawData: {
      value: number,
      unit: string,
      threshold: {
        excellent: { min, max },
        good: { min, max },
        average: { min, max },
        poor: { min, max },
        critical: { min, max }
      }
    }
  - source: {
      system: string (HR, Finance, Timetable, etc.),
      extractedAt: timestamp,
      dataCard: string (reference to multiplier data card)
    }
  - calculation: {
      formula: string,
      inputs: string[],
      appliedFormula: string (the actual formula used)
    }
  - validationStatus: enum ["VALID", "MISSING", "OUTLIER", "PENDING"]
  - validationError: string | null
  - updatedAt: timestamp
```

#### `multiplierDataCards` Collection
```firestore
multiplierDataCards/{multiplierId}
  - name: string
  - title: string
  - domain: string
  - description: string
  - dataUnit: string (ratio, %, hours, etc.)
  - thresholds: {
      excellent: { min: 0.9, max: 1.0 },
      good: { min: 0.7, max: 0.9 },
      average: { min: 0.5, max: 0.7 },
      poor: { min: 0.2, max: 0.5 },
      critical: { min: 0.0, max: 0.2 }
    }
  - sourceSystem: string
  - sourceMapping: {
      table: string,
      fields: string[],
      joinCondition: string
    }
  - calculationFormula: string (how raw data → 0-1.0)
  - benchmarks: {
      national: number,
      state: number,
      region: number,
      category: number // school type benchmark
    }
  - benchmarkYear: string
  - createdAt: timestamp
```

#### `reportSnapshots` Collection
```firestore
assessmentCycles/{schoolId}/{cycleId}/reportSnapshot
  - cycleId: string
  - schoolId: string
  
  // Headline Section
  - headline: {
      healthIndex: number (0-100),
      trend: string ("IMPROVING", "STABLE", "DECLINING"),
      trendValue: number (cycle-over-cycle change)
    }
  
  // Driver Section
  - driverAnalysis: {
      challenges: [{
        challengeId: string,
        rank: number (1-15),
        severityScore: number (0-100),
        weight: number,
        contribution: number (% to overall concern),
        domain: string,
        topQuestion: string (which screening q was critical)
      }]
    }
  
  // Character Section (Gap-based quadrant)
  - character: {
      gap: number (S_sub - M_obj, 0-100),
      quadrant: string ("REALITY_BETTER", "ALIGNED", "PERCEPTION_BETTER"),
      interpretation: string,
      communicationGap: boolean,
      blindSpotRisk: boolean
    }
  
  // Engine Room Section
  - engineRoom: {
      multipliers: [{
        name: string,
        value: number (0-100),
        trend: string,
        benchmark: {
          national: number,
          regional: number
        },
        status: enum ["CRITICAL", "POOR", "AVERAGE", "GOOD", "EXCELLENT"]
      }],
      geometricMean: number
    }
  
  // Trajectory Section (Cycle 2+)
  - trajectory: {
      cycles: [{
        cycleNumber: number,
        dateRange: { start: timestamp, end: timestamp },
        scores: { s_sub, m_obj, h },
        highlights: string[]
      }],
      trends: {
        s_sub_trend: string,
        m_obj_trend: string,
        h_trend: string
      }
    }
  
  // Recommendation Section
  - recommendations: {
      domain: string,
      challenges: string[],
      mapped14Dimensions: string[], // references to 14D framework
      actionPriority: enum ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      actionItems: string[]
    }
  
  // Early Warning Flags (Cycle 2+)
  - earlyWarnings: {
      flags: [{
        flagId: string, // "DIVERGING_TREND", "MULTIPLIER_FREEFALL", etc.
        severity: enum ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        description: string,
        evidenceChallenge: string,
        recommendedAction: string
      }]
    }
  
  - generatedAt: timestamp
  - generatedBy: string (admin email)
```

#### `stakeholderVerifications` Collection
```firestore
stakeholderVerifications/{schoolId}/{verificationId}
  - schoolId: string
  - email: string
  - role: enum ["TEACHER", "PARENT", "ADMIN", "OTHER"]
  - phone: string (for parents)
  - status: enum ["PENDING", "VERIFIED", "REJECTED"]
  
  // Role-specific verification
  - verification: {
      teacherId: string | null,
      parentName: string | null,
      studentId: string | null,
      adminVerificationCode: string | null,
      verifiedAt: timestamp | null,
      verifiedBy: string | null
    }
  
  - invitedAt: timestamp
  - expiresAt: timestamp
  - respondedAt: timestamp | null
  - deletedAt: timestamp | null
```

#### `trendHistory` Collection (Multi-Cycle Archive)
```firestore
trendHistory/{schoolId}/cycles
  - schoolId: string
  - cycleId: string
  - cycleNumber: integer
  - year: string
  - scores: {
      s_sub: number,
      m_obj: number,
      healthIndex: number,
      gap: number
    }
  - multipliers: { [name]: number },
  - respondentCount: { [role]: number },
  - createdAt: timestamp
```

---

## 3. Data Mapping Specification

### 15 Challenges - Screening Questions Mapping

#### **Domain 1: Growth & Enrollment**

**C1: Admission Trend & Sustainability**
- Q1: Admission trend (%), multi-year source: Admissions System
- Q2: Waitlist size (%), source: Admissions System
- Q3: Target vs actual enrollment, source: Admissions System

**C2: Retention & Continuity**
- Q1: Year-on-year retention rate (%), source: Finance/Admissions
- Q2: Attrition rate by class (%), source: Enrollment
- Q3: Mid-year joiners/leavers, source: Admissions

**C3: Applicant Quality & Selectivity**
- Q1: Applications received vs seats offered, source: Admissions
- Q2: Entry exam success rate (%), source: Assessments
- Q3: Applicant geographic spread, source: Admissions

#### **Domain 2: People & Staffing**

**C4: Teacher Stability & Turnover**
- Q1: Annual teacher turnover (%), source: HR System
- Q2: Average teacher tenure (years), source: HR System
- Q3: Ratio of experienced vs new staff, source: HR System

**C5: Teacher Development & Capability**
- Q1: Annual training hours per teacher, source: HR System
- Q2: % teachers with active certifications, source: HR System
- Q3: Internal promotion rate (%), source: HR System

**C6: Educational Leadership**
- Q1: Principal tenure (years), source: HR System
- Q2: Academic coordinator continuity, source: HR System
- Q3: Leadership team development spend, source: Finance

#### **Domain 3: Academic & Wellbeing**

**C7: Learning Outcomes**
- Q1: Board exam pass rate (%), source: Academic Records
- Q2: Average score trend, source: Academic Records
- Q3: Learning outcomes per subject, source: Academic Records

**C8: Student Wellbeing & Engagement**
- Q1: Counselor availability (hours/week), source: Timetable
- Q2: Extracurricular participation rate (%), source: Activity Rosters
- Q3: Student satisfaction score, source: Survey Data

**C9: Curriculum & Program Innovation**
- Q1: Curriculum updates (frequency), source: Academic Records
- Q2: Skill-based programs offered (#), source: Program Inventory
- Q3: Tech integration level (%), source: LMS Analytics

#### **Domain 4: Reputation & Competition**

**C10: Brand Positioning & Differentiation**
- Q1: School's unique value proposition clarity (perception), source: Leadership Survey
- Q2: Competitive advantage sustainability, source: Market Research
- Q3: Brand recall in market (%), source: Parent Survey

**C11: Parent & Community Satisfaction**
- Q1: Parent communication response SLA (hours), source: Communication Log
- Q2: Complaint resolution time (days), source: Helpdesk
- Q3: Parent recommendation likelihood (%), source: NPS Survey

**C12: Market Perception & Recognition**
- Q1: Media mentions (frequency), source: PR Monitoring
- Q2: Awards/recognitions received, source: PR Records
- Q3: Competitor online sentiment differential, source: Social Monitoring

#### **Domain 5: Operations & Finance**

**C13: Financial Health & Sustainability**
- Q1: Fee realization rate (%), source: Finance/Accounts
- Q2: Cost per student trend (%), source: Finance
- Q3: Debt-to-revenue ratio, source: Finance

**C14: Operational Efficiency**
- Q1: Teacher-student ratio, source: HR + Enrollment
- Q2: Facility utilization rate (%), source: Facilities
- Q3: Administrative overhead (%), source: Finance

**C15: Compliance & Risk Management**
- Q1: Safety audit score (%), source: Facilities + Compliance
- Q2: Regulatory compliance status, source: Legal/Compliance
- Q3: Insurance/incident history, source: Compliance Records

---

## 4. Eight Objective Multipliers - Data Specifications

### Core Multipliers (Mandatory)

#### M1: Student-Teacher Ratio (STR)
- **Source:** HR System + Enrollment
- **Calculation:** Total Students / Teaching Staff (FTE)
- **Thresholds:**
  - Excellent (0.9-1.0): STR ≤ 25
  - Good (0.7-0.9): 25 < STR ≤ 30
  - Average (0.5-0.7): 30 < STR ≤ 35
  - Poor (0.2-0.5): 35 < STR ≤ 40
  - Critical (0.0-0.2): STR > 40
- **Update Frequency:** Monthly (from enrollment + HR)
- **Benchmark:** CBSE guideline = 1:30 (70 in 2026)

#### M2: Parent Response SLA
- **Source:** Communication Log (tickets, messages)
- **Calculation:** Median response time (hours) to parent queries
- **Thresholds:**
  - Excellent: ≤ 4 hours → 1.0
  - Good: 4-8 hours → 0.85
  - Average: 8-24 hours → 0.6
  - Poor: 24-48 hours → 0.3
  - Critical: > 48 hours → 0.0
- **Update Frequency:** Weekly
- **Industry Standard:** <12 hour response

#### M3: Annual Teacher Training (Hours)
- **Source:** HR System (training log)
- **Calculation:** Sum of training hours per teacher / # teachers
- **Thresholds:**
  - Excellent: ≥ 40 hours → 1.0
  - Good: 30-40 hours → 0.85
  - Average: 20-30 hours → 0.6
  - Poor: 10-20 hours → 0.3
  - Critical: < 10 hours → 0.0
- **Update Frequency:** Yearly (post-cycle audit)
- **NITI Aayog Target:** 40 hours/teacher/year

#### M4: Weekly Planning Time
- **Source:** Timetable System (prep periods allocated)
- **Calculation:** % of teachers with ≥ 2 prep periods/week
- **Thresholds:**
  - Excellent: 95-100% → 1.0
  - Good: 80-95% → 0.85
  - Average: 60-80% → 0.6
  - Poor: 40-60% → 0.3
  - Critical: < 40% → 0.0
- **Update Frequency:** Semester (at timetable creation)
- **Best Practice:** 2 prep periods minimum

### Expanded Multipliers (New)

#### M5: Fee Realization Rate
- **Source:** Finance/Accounts (collections vs billed)
- **Calculation:** (Fees Collected / Fees Billed) × 100%
- **Thresholds:**
  - Excellent: 98-100% → 1.0
  - Good: 95-98% → 0.85
  - Average: 90-95% → 0.6
  - Poor: 85-90% → 0.3
  - Critical: < 85% → 0.0
- **Update Frequency:** Monthly
- **Industry Benchmark:** 95%+ in premium schools

#### M6: Safety & Compliance Score
- **Source:** Facilities audit + Compliance records
- **Calculation:** Weighted score from:
  - Building safety inspection (40%)
  - Fire safety compliance (20%)
  - Health & hygiene standards (20%)
  - Legal/labor compliance (20%)
- **Thresholds:**
  - Excellent: 95-100% → 1.0
  - Good: 85-95% → 0.85
  - Average: 70-85% → 0.6
  - Poor: 50-70% → 0.3
  - Critical: < 50% → 0.0
- **Update Frequency:** Annual audit

#### M7: Digital/LMS Active Usage
- **Source:** LMS analytics + IT asset inventory
- **Calculation:** (Active LMS users in last 30 days / Total teaching staff) × 100%
- **Thresholds:**
  - Excellent: 85-100% → 1.0
  - Good: 70-85% → 0.85
  - Average: 50-70% → 0.6
  - Poor: 30-50% → 0.3
  - Critical: < 30% → 0.0
- **Update Frequency:** Monthly
- **Post-COVID Expectation:** 80%+ adoption

#### M8: Extracurricular Participation
- **Source:** Activity rosters + Student records
- **Calculation:** (Students enrolled in ≥ 1 co-curricular / Total students) × 100%
- **Thresholds:**
  - Excellent: 70-100% → 1.0
  - Good: 60-70% → 0.85
  - Average: 45-60% → 0.6
  - Poor: 30-45% → 0.3
  - Critical: < 30% → 0.0
- **Update Frequency:** Semester
- **Best Practice:** 70%+ engagement

---

## 5. API Specifications

### Core Endpoints

#### POST `/api/assessment/{schoolId}/cycles`
**Create Assessment Cycle**
```json
{
  "year": "2026",
  "selectedChallenges": ["C1", "C3", "C5", "C7", "C9", "C11", "C13", "C15"],
  "weights": { "C1": 0.10, "C3": 0.12, ... },
  "respondentDeadline": "2026-09-30",
  "expectedRespondents": {
    "TEACHER": 25,
    "PARENT": 100,
    "STUDENT": 150,
    "ADMIN": 5
  }
}
```

#### POST `/api/assessment/{schoolId}/cycles/{cycleId}/responses`
**Submit Challenge Response**
```json
{
  "challengeId": "C1",
  "role": "TEACHER",
  "responderId": "user123",
  "email": "teacher@school.com",
  "responses": {
    "q1": { "selectedOption": 7, "maxOption": 10, "isFact": true, "factSource": "admissions_system" },
    "q2": { "selectedOption": 6, "maxOption": 10, "isFact": false }
  }
}
```

#### POST `/api/assessment/{schoolId}/cycles/{cycleId}/multipliers/sync`
**Sync Multiplier Data from Source Systems**
```json
{
  "multipliers": ["STR", "ParentSLA", "Training", "PlanningTime", "FeeRealization", "Safety", "Digital", "Extracurricular"],
  "sourceSystem": "HR_SYSTEM",
  "dataCards": { "STR": {...}, "Training": {...} }
}
```

#### GET `/api/assessment/{schoolId}/cycles/{cycleId}/scores`
**Get Real-Time Calculated Scores**
Response:
```json
{
  "s_sub": 78.5,
  "m_obj": 82.0,
  "healthIndex": 64.3,
  "gap": -3.5,
  "quadrant": "ALIGNED",
  "respondentCount": { "TEACHER": 23, "PARENT": 87, ...},
  "updateTimestamp": 1693478400
}
```

#### POST `/api/assessment/{schoolId}/cycles/{cycleId}/generate-report`
**Generate First Opinion Report**
Returns PDF URL + JSON report snapshot

#### GET `/api/assessment/{schoolId}/trend-analysis`
**Multi-Cycle Trend Analysis** (Cycle 2+)
Returns trend lines, early-warning flags, trajectory

---

## 6. Real-Time Firestore Listeners

### Challenge Response Listener
```typescript
onSnapshot(
  collection(db, `assessmentCycles/${schoolId}/${cycleId}/challengeResponses`),
  (snapshot) => {
    // Trigger S_sub recalculation
    // Update respondent count
    // Refresh dashboard
  }
)
```

### Multiplier Update Listener
```typescript
onSnapshot(
  collection(db, `assessmentCycles/${schoolId}/${cycleId}/multipliers`),
  (snapshot) => {
    // Trigger M_obj recalculation (geometric mean)
    // Update Health Index
    // Flag any missing/outlier multipliers
  }
)
```

---

## 7. Calculation Engine Specifications

### S_sub (Subjective Score) Calculation Engine

**Input:** Challenge responses + weights
**Processing:**
1. For each challenge i:
   - `severity_i = Σ(responses[j].selectedOption) / Σ(responses[j].maxOption)`
   - `health_i = 1 - severity_i`
2. Aggregate across all responses per challenge
3. `S_sub = 100 × Σ(weight_i × health_i)`

**Output:** 0-100 score

### M_obj (Objective Score) Calculation Engine

**Input:** 8 multiplier values (0-1.0 scale)
**Processing:**
- `M_obj = (m1 × m2 × ... × m8) ^ (1/8)` (geometric mean)
- Validates each multiplier is within acceptable range
- Flags any missing or outlier values

**Output:** 0-1.0 scale, converted to 0-100 for reporting

### Health Index Calculation Engine

**Input:** S_sub, M_obj
**Processing:**
1. `raw_health = S_sub × M_obj`
2. `delusion_penalty = MAX(0, S_sub - 80)`
3. `H = MAX(0, MIN(100, raw_health - delusion_penalty))`

**Output:** 0-100 score, color-coded (red/yellow/green)

### Gap-Based Quadrant Engine

**Input:** S_sub, M_obj
**Processing:**
1. `raw_gap = S_sub - M_obj`
2. Scale to 0-100: `gap = MAX(0, MIN(100, raw_gap + 50))`
3. Classify:
   - Gap < 30: "REALITY_BETTER" (communication gap)
   - Gap 30-70: "ALIGNED" (credible)
   - Gap > 70: "PERCEPTION_BETTER" (blind spot risk)

**Output:** Quadrant + interpretation text

---

## 8. Deployment Architecture

### Cloud Infrastructure

```
┌─────────────────────────────────────────────────────┐
│           Firebase Hosting (React App)              │
│   https://disha-diagnostics.web.app/                │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼─────────┐      ┌───────▼──────────┐
│ Cloud Functions │      │  Firestore       │
│ (Node.js 20)    │◄────►│  (NoSQL DB)      │
│                 │      │  Collections:    │
│ - Calculations  │      │  - schools       │
│ - Report Gen    │      │  - cycles        │
│ - Data ETL      │      │  - responses     │
│ - Validations   │      │  - multipliers   │
└────────┬────────┘      │  - reports       │
         │               │  - trends        │
         │               └──────────────────┘
         │
┌────────▼──────────────────────────────────┐
│    11 Data Source Systems (via Pub/Sub)   │
│ - Admissions • Finance • HR • Timetable   │
│ - Communications • Academic • Counseling  │
│ - Activities • Marketing • Research       │
│ - Facilities • IT/LMS                     │
└───────────────────────────────────────────┘
         │
┌────────▼──────────────────────┐
│  BigQuery (Data Warehouse)    │
│  - Historical analysis         │
│  - Trend datasets              │
│  - Predictive models           │
└───────────────────────────────┘
```

### Security & Access Control

**Firestore Rules (Summary)**
```
match /schools/{schoolId} {
  // Admins can read/write own school
  // Stakeholders can read their submitted data
  allow read: if request.auth.customClaims.role in ["ADMIN", "TEACHER"]
  allow write: if request.auth.customClaims.schoolId == schoolId
}

match /assessmentCycles/{schoolId}/{cycleId}/challengeResponses/{responseId} {
  // Only the respondent can write
  allow write: if request.auth.uid == resource.data.responderId
  allow read: if request.auth.customClaims.role == "ADMIN"
}
```

---

## 9. Implementation Phases

### Phase 1: Core Engine & Data Model (Weeks 1-4)
- [x] Database schema design
- [ ] Core Firestore collections creation
- [ ] S_sub calculation engine
- [ ] M_obj calculation (geometric mean)
- [ ] Health Index formula implementation
- [ ] Gap-based quadrant logic
- [ ] Data validation layer (fact vs perception tagging)

### Phase 2: API & Real-time Layer (Weeks 5-8)
- [ ] Challenge response API
- [ ] Multiplier sync API
- [ ] Real-time Firestore listeners
- [ ] Score calculation pipeline
- [ ] Batch processing for multi-school
- [ ] WebSocket push for live updates

### Phase 3: Reporting & Visualization (Weeks 9-12)
- [ ] Report PDF generation
- [ ] Dashboard components
- [ ] Challenge driver visualization
- [ ] Multiplier profile charts
- [ ] 14D mapping engine

### Phase 4: Predictive & Trends (Weeks 13+)
- [ ] Multi-cycle trend storage
- [ ] Early-warning flag detection
- [ ] Trajectory prediction
- [ ] Alert system

---

## 10. Success Metrics & KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Data Accuracy | 100% | School can reproduce all scores |
| Response Rate | 80%+ | Assigned challenges answered |
| Calculation Speed | <2s | S_sub + M_obj + H computed |
| Report Generation | <30s | First Opinion PDF generated |
| System Uptime | 99.9% | Firestore + Functions SLA |
| Multiplier Sync | Daily | All 8 multipliers current |

---

**Status:** Ready for Phase 1 implementation
**Next:** Database schema migration to Firestore
