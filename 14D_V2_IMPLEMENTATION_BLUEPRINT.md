# 14-Dimension Diagnostic Engine v2 — Implementation Blueprint

**CPDO Leadership Document**  
**Date:** August 25, 2026  
**Status:** READY FOR EXECUTION  
**Authority:** DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md (677 lines, authoritative)

---

## Executive Summary

We are implementing the **14-Dimension Diagnostic Framework v2** with:
- **60+ metrics** with exact calculation formulas
- **90+ perception questions** (1:1 metric-to-perception mapping)
- **5 stakeholder types** with role-specific questions
- **Multi-school support** with historical trend analysis
- **Real-time dashboard** for school leaders
- **Automated gap analysis** and recommendations

**Tech Stack:**
- Frontend: React + TypeScript (existing)
- Backend: Cloud Functions (Gen 2) + Firestore
- State Management: Zustand (existing)
- Data Analytics: Calculation engine + visualization
- Reporting: PDF export + interactive dashboards

---

## Phase Architecture

### Phase 1: Data Schema & Calculation Engine ✅ FOUNDATION
**Timeline:** Immediate (2-3 days)  
**Deliverables:**
- Firestore schema for 14D assessments
- Calculation engine for 60+ metrics
- Type definitions for all entities

### Phase 2: Frontend Assessment UI 🎯 CURRENT PHASE
**Timeline:** 3-4 days  
**Deliverables:**
- Multi-page assessment wizard
- Stakeholder-specific question routing
- Real-time response collection
- Progress tracking

### Phase 3: Cloud Functions & Analysis
**Timeline:** 3-4 days  
**Deliverables:**
- Metric calculation functions
- Gap analysis engine
- Report generation
- Real-time listeners

### Phase 4: Dashboards & Reporting
**Timeline:** 2-3 days  
**Deliverables:**
- School leader dashboard
- Metric-level gap visualizations
- Trend analysis charts
- PDF report export

---

## Part 1: Firestore Data Schema (Phase 1)

### Collection Structure

```
schools/{schoolId}/
  ├── assessments14D/{assessmentId}/
  │   ├── metadata (title, status, cycle, stakeholders)
  │   ├── configuration (weights, filters, custom questions)
  │   ├── responses/ (subcollection - all responses)
  │   │   └── {responseId}
  │   │       ├── stakeholderType (teacher, parent, student, admin, other)
  │   │       ├── respondentId (anonymous or identified)
  │   │       ├── dimension (1-14)
  │   │       ├── metricId (1a-14z)
  │   │       ├── metricAnswer (Reality value or Perception score)
  │   │       ├── followUp (root-cause text)
  │   │       ├── timestamp
  │   │       └── metadata (device, location, session)
  │   │
  │   └── calculatedScores/ (computed after responses close)
  │       ├── dimensionScores (14 x {realityScore, perceptionScore, gap})
  │       ├── metricDetails (60+ x {value, formula, dataQuality})
  │       ├── gapAnalysis (prioritized gaps with root causes)
  │       ├── recommendations (tier-1 actions)
  │       └── trends (YoY comparison if historical data available)
```

### Entity Definitions (TypeScript)

```typescript
// Assessment cycle
interface Assessment14D {
  id: string;
  schoolId: string;
  cycleYear: number;
  cycleTerms: 'Annual' | 'TermWise';
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ANALYZED';
  
  // Configuration
  stakeholderConfig: {
    teachers: boolean;
    parents: boolean;
    students: boolean;
    admin: boolean;
    other: boolean;
  };
  
  responseBudget: {
    expectedCount: number;
    collectedCount: number;
    targetedCount: number;
  };
  
  // Dates
  createdAt: Timestamp;
  activatedAt?: Timestamp;
  closedAt?: Timestamp;
  analyzedAt?: Timestamp;
}

// Response (1:1 metric answer per response doc)
interface MetricResponse {
  id: string;
  assessmentId: string;
  schoolId: string;
  
  // Who answered
  stakeholderType: 'teacher' | 'parent' | 'student' | 'admin' | 'other';
  respondentId?: string; // None if anonymous
  respondentName?: string;
  
  // What they answered
  dimension: number; // 1-14
  metricId: string; // e.g., '1a', '2c'
  
  // Reality vs Perception
  metricType: 'reality' | 'perception';
  metricValue: number | string; // Formula result or 1-10 rating
  
  // Root cause if perception
  followUpQuestion?: string;
  followUpResponse?: string;
  
  // Metadata
  timestamp: Timestamp;
  sessionId: string;
  deviceType?: string;
  isAnonymous: boolean;
}

// Calculated dimension-level score
interface DimensionScore {
  dimensionId: number; // 1-14
  dimensionName: string;
  
  realityMetrics: {
    metricId: string;
    value: number;
    dataQuality: 'High' | 'Medium' | 'Low'; // Based on data source
    dataSource: string; // e.g., "Board exam portal", "Teacher input"
  }[];
  
  realityScore: number; // Aggregate (0-100)
  
  perceptionMetrics: {
    metricId: string;
    score: number; // 1-10 scale
    respondentCount: number;
  }[];
  
  perceptionScore: number; // Aggregate (1-10 → 0-100 scale)
  
  gap: number; // |Reality - Perception| with direction
  gapDirection: 'reality_higher' | 'perception_higher' | 'aligned';
  
  rootCauses: string[]; // Top 3 themes from follow-up responses
  
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

// Gap Analysis Result
interface GapAnalysisResult {
  assessmentId: string;
  generatedAt: Timestamp;
  
  criticalGaps: {
    dimensionId: number;
    gap: number;
    severity: number;
    rootCauseTheme: string;
    affectedStakeholder: string; // "students", "teachers", etc.
  }[];
  
  trendComparison?: {
    dimensionId: number;
    previousYear: number;
    currentYear: number;
    change: number; // +5 or -8
    trend: 'improving' | 'declining' | 'stable';
  }[];
  
  recommendations: {
    priority: number; // 1-10
    dimensionId: number;
    actionTitle: string;
    actionDescription: string;
    estimatedImpact: string;
    ownerRole: string; // "Principal", "Academic Coordinator", etc.
  }[];
}
```

---

## Part 2: Frontend Assessment Wizard (Phase 2)

### Page Flow

```
Step 0: Assessment Overview
  ↓
Step 1: Stakeholder Selection
  ├→ I'm a Teacher
  ├→ I'm a Parent
  ├→ I'm a Student
  ├→ I'm an Administrator
  └→ Other
  
  ↓
Step 2-15: Dimension Questions (13 dimensions per flow)
  For each dimension:
    ├─ Reality Metric (varies by stakeholder)
    │   └─ "How many students passed the board exam?" (Teacher/Admin)
    │   └─ "What % of your homework do you submit?" (Student)
    │   └─ "How confident are you in my child's board results?" (Parent)
    │
    ├─ Perception Question (1-10 scale)
    │   └─ "I'm confident this metric is strong"
    │
    └─ Root-Cause Follow-Up
        └─ "What would improve this?"
  
  ↓
Step 16: Review & Submit
  ├─ Show progress (13/14 dimensions complete)
  ├─ Allow editing any response
  └─ Submit for analysis
```

### Component Structure

```
MultiUserAssessment14D/
  ├── AssessmentWizard.tsx (main orchestrator)
  │   ├── StakeholderSelector.tsx
  │   ├── DimensionStep.tsx (iterates 1-14)
  │   │   ├── MetricCard.tsx (reality question)
  │   │   ├── PerceptionScale.tsx (1-10 slider)
  │   │   └── RootCauseInput.tsx (open text)
  │   └── ReviewSubmit.tsx
  │
  ├── hooks/
  │   ├── useAssessmentWizard.ts (state management)
  │   ├── useMetricMapping.ts (stakeholder → questions)
  │   └── useResponseValidation.ts (client-side validation)
  │
  ├── data/
  │   ├── dimension14Metadata.ts (all 14D framework data)
  │   ├── metricToPerceptionMap.ts (1:1 matching)
  │   └── stakeholderQuestionRouter.ts
  │
  └── services/
      ├── assessmentService14D.ts (submit responses)
      └── progressTracker.ts (save drafts)
```

---

## Part 3: Cloud Functions (Phase 3)

### Function 1: `calculateMetrics`
**Trigger:** Firestore write (assessment closed)  
**Input:** Assessment ID, all responses  
**Output:** Calculated scores for all 60+ metrics

```typescript
// Pseudo-code structure
export const calculateMetrics = functions.firestore
  .document('schools/{schoolId}/assessments14D/{assessmentId}')
  .onUpdate(async (change) => {
    if (change.after.get('status') === 'ANALYZED_READY') {
      // Fetch all responses
      const responses = await getResponses(schoolId, assessmentId);
      
      // Calculate each metric
      for (let dim = 1; dim <= 14; dim++) {
        for (let metric in DIMENSION_METRICS[dim]) {
          const formula = METRIC_FORMULAS[metric];
          const value = formula(responses);
          
          await saveMetricScore(schoolId, assessmentId, metric, value);
        }
      }
      
      // Calculate dimension aggregates
      await calculateDimensionAggregates(schoolId, assessmentId);
      
      // Run gap analysis
      await runGapAnalysis(schoolId, assessmentId);
      
      // Generate recommendations
      await generateRecommendations(schoolId, assessmentId);
    }
  });
```

### Function 2: `runGapAnalysis`
**Trigger:** After metrics calculated  
**Input:** Dimension scores (reality + perception)  
**Output:** Prioritized gaps, root causes, trend

```typescript
export const runGapAnalysis = async (schoolId, assessmentId) => {
  const scores = await getDimensionScores(schoolId, assessmentId);
  const historicalScores = await getPreviousYearScores(schoolId);
  
  const gaps = [];
  
  scores.forEach(dimension => {
    const gap = Math.abs(dimension.realityScore - dimension.perceptionScore);
    
    // Determine severity
    const severity = calculateSeverity(gap, dimension);
    
    // Identify theme from follow-ups
    const theme = extractRootCauseTheme(dimension.followUpResponses);
    
    // Calculate trend
    const trend = calculateTrend(
      dimension.dimensionId,
      dimension.realityScore,
      historicalScores
    );
    
    gaps.push({
      dimensionId: dimension.dimensionId,
      gap,
      severity,
      rootCauseTheme: theme,
      trend
    });
  });
  
  // Prioritize by severity + trend
  const sorted = gaps.sort((a, b) => 
    (b.severity * 0.7 + (b.trend === 'declining' ? 1 : 0) * 0.3) -
    (a.severity * 0.7 + (a.trend === 'declining' ? 1 : 0) * 0.3)
  );
  
  await saveGapAnalysis(schoolId, assessmentId, sorted);
};
```

### Function 3: `generateRecommendations`
**Trigger:** After gap analysis  
**Input:** Prioritized gaps, dimension metadata  
**Output:** Tier-1 actionable recommendations

```typescript
export const generateRecommendations = async (schoolId, assessmentId) => {
  const gaps = await getGapAnalysis(schoolId, assessmentId);
  
  const recommendations = gaps
    .slice(0, 5) // Top 5 gaps
    .map(gap => {
      const dimension = DIMENSION_METADATA[gap.dimensionId];
      
      return {
        dimensionId: gap.dimensionId,
        actionTitle: ACTION_LIBRARY[dimension.name][gap.rootCauseTheme].title,
        actionDescription: ACTION_LIBRARY[...].description,
        estimatedImpact: ACTION_LIBRARY[...].impact,
        ownerRole: dimension.ownerRole,
        priority: gap.severity
      };
    });
  
  await saveRecommendations(schoolId, assessmentId, recommendations);
};
```

---

## Part 4: Dashboard & Reporting (Phase 4)

### Dashboard Views

**1. Executive Summary (School Leader)**
```
14-Dimension Overview
├─ Dimension heat-map (14 boxes, colored by gap severity)
├─ Top 3 Critical Gaps (with root causes)
├─ Stakeholder Sentiment Summary (by role)
└─ YoY Trend Comparison (14 trend lines)

Actionable Recommendations
├─ Tier-1 Actions (by owner role)
├─ Implementation Timeline
└─ Estimated Impact Forecast
```

**2. Dimension Deep-Dive**
```
Dimension: Academic Performance & Learning Outcomes
├─ Reality Metrics (6 cards)
│   ├─ Board Exam Pass %: 87% ✅
│   ├─ Formative Avg: 72/100 ⚠️
│   └─ ... (4 more)
│
├─ Perception Scores (stakeholder breakdowns)
│   ├─ Teachers: 8.2/10
│   ├─ Parents: 7.1/10
│   ├─ Students: 6.8/10
│   └─ Admin: 8.5/10
│
├─ Gap Analysis
│   └─ "Reality is strong but Parent Perception lags → Communication gap"
│
└─ Root-Cause Themes (from follow-ups)
    ├─ "Need better progress reporting" (12 mentions)
    ├─ "Unsure about remedial support" (8 mentions)
    └─ "Homework too heavy" (6 mentions)
```

**3. Trend Comparison (YoY)**
```
14 Dimension Trend Chart
├─ 2025: 6 dimensions ↑, 5 dimensions →, 3 dimensions ↓
├─ Priority Shifts: Academic Performance +8pts, Wellbeing -4pts
└─ Stability Index: 71% (dimensions unchanged ±5pts)
```

### Report Export (PDF)
- 20-page comprehensive report
- Metric-level detail tables
- Gap analysis narrative
- Recommendations with owner assignments
- Trend comparisons with visuals
- Appendix: Q&A response summary

---

## Part 5: Data Mapping (60+ Metrics)

### Dimension 1-6 Metrics (Example)

| Dim | Metric ID | Name | Formula | Data Source | Fallback |
|-----|-----------|------|---------|-------------|----------|
| 1 | 1a | Board Pass % | Pass ÷ Appeared × 100 | CBSE Portal | Request from exam cell |
| 1 | 1b | Formative Avg | Sum of scores ÷ N | Teacher gradebook | Audit mark registers |
| 1 | 1c | Below Benchmark % | Below cutoff ÷ Total × 100 | Diagnostic tests | NCERT diagnostic |
| 1 | 1d | YoY Growth | Current − Previous | Linked student scores | Cohort pass-rate change |
| 1 | 1e | Item Analysis | Incorrect ÷ Total × 100 | Question-wise marks | Topic tagging next term |
| 1 | 1f | HW Completion % | Submitted ÷ Assigned × 100 | LMS logs | Homework register |
| 2 | 2a | Effective Lessons % | Rated effective ÷ Total × 100 | Observation forms | Start observation cadence |
| 2 | 2b | CPD Hours/Teacher | Total CPD ÷ N teachers | Training registers | Reconstruct from certs |
| 2 | 2c | Activity Ratio | Activity ÷ Lecture tagged | Lesson plans | Add mode field |
| 2 | 2d | Pacing Adherence | Topics covered ÷ Planned × 100 | Curriculum map vs logs | Create curriculum map |
| 2 | 2e | Projects/Term | Count of documented projects | Activity logs | Shared log next term |
| 3 | 3a | Attrition Rate | Left ÷ Avg employed × 100 | HR records | Reconstruct from letters |
| 3 | 3b | Avg Tenure | Sum of tenure ÷ N | HR joining dates | Appointment letters |
| 3 | 3c | Qualified Teachers % | With qualification ÷ Total × 100 | HR documents | Verification drive |
| 3 | 3d | Absenteeism % | Days absent ÷ Total days × 100 | Attendance logs | Start sign-in sheet |
| 3 | 3e | Teacher:Student | Enrolled ÷ Teaching FTE | Enrollment + staffing | Manual count |
| 3 | 3f | Substitute Dependency % | Substitute periods ÷ Total × 100 | Sub register | Start immediately |

### Perception Question Mapping (60 questions → 1:1)

| Metric | Perception Question | Respondent | Scale |
|--------|-------------------|-----------|-------|
| 1a | "School's board exam results are strong" | Parent | 1-10 |
| 1b | "Assessments reflect real understanding" | Student | 1-10 |
| 1c | "Every student supported to grade level" | Teacher | 1-10 |
| 1d | "Child genuinely improving YoY" | Parent | 1-10 |
| 1e | "Teachers address topics I struggle with" | Student | 1-10 |
| 1f | "Homework load appropriately paced" | Student | 1-10 |
| 2a | "Classes are interesting and easy to follow" | Student | 1-10 |
| 2b | "I receive enough training/support" | Teacher | 1-10 |
| 2c | "Lessons include activities, not just lecture" | Student | 1-10 |
| 2d | "Pace matches what I can absorb" | Student | 1-10 |
| 2e | "Child gets meaningful project learning" | Parent | 1-10 |
| 3a | "I won't need to leave in 1-2 years" | Teacher | 1-10 |
| 3b | "Consistent, experienced teachers YoY" | Parent | 1-10 |
| 3c | "Teachers well-qualified, know subjects" | Parent | 1-10 |
| 3d | "Classes rarely cancelled due to absence" | Student | 1-10 |
| 3e | "Class sizes allow individual attention" | Parent | 1-10 |
| 3f | "Substitute classes still let me learn" | Student | 1-10 |

---

## Implementation Sequence

### Week 1: Foundation
- [ ] **Day 1-2:** Firestore schema + types
- [ ] **Day 3:** Calculation engine (60+ formulas)
- [ ] **Day 4-5:** Cloud Functions skeleton

### Week 2: Frontend
- [ ] **Day 1-2:** Assessment wizard UI
- [ ] **Day 3:** Stakeholder routing
- [ ] **Day 4-5:** Response collection + validation

### Week 3: Analysis
- [ ] **Day 1-2:** Metric calculation functions
- [ ] **Day 3:** Gap analysis engine
- [ ] **Day 4-5:** Recommendations generator

### Week 4: Dashboards
- [ ] **Day 1-2:** Executive dashboard
- [ ] **Day 3-4:** Dimension deep-dive + export
- [ ] **Day 5:** Testing + deployment

---

## Success Metrics

✅ **Implementation Complete When:**
- [ ] All 60+ metrics calculable from real/fallback data
- [ ] 90+ perception questions routed by stakeholder
- [ ] Gap analysis identifies root causes with >80% accuracy
- [ ] Dashboard renders in <2 seconds
- [ ] PDF report generates in <5 seconds
- [ ] Historical trends compare YoY
- [ ] Real-time response collection with progress tracking
- [ ] Export with no data-privacy leaks

---

**CPDO Approval:** Ready for tech team execution.  
**Next Step:** Immediate database schema implementation.

