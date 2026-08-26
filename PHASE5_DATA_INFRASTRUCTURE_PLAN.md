# PHASE 5: DATA INFRASTRUCTURE & PERCEPTION SURVEYS
## 14-Dimension Assessment System

**Status:** ⏳ IN PLANNING  
**Date:** August 26, 2026  
**Duration:** 4-5 weeks  
**Priority:** Critical for operational diagnostic cycles

---

## 🎯 PHASE 5 OBJECTIVES

### Primary Goals:
1. ✅ Build Reality Metric data collection system (60+ metrics)
2. ✅ Implement Perception Survey UI (90+ questions)
3. ✅ Setup data ingestion connectors (LMS, Excel, APIs)
4. ✅ Establish fallback procedures for unavailable metrics
5. ✅ Create Data Audit dashboard (metric coverage tracking)

### Success Criteria:
- [ ] All 60+ Reality metrics mapped to data sources
- [ ] 90+ Perception questions organized by stakeholder
- [ ] 3+ data source connectors working
- [ ] Fallback UI for manual data entry
- [ ] First complete diagnostic cycle possible

---

## 📊 PHASE 5 ARCHITECTURE

### System Components:

```
┌─────────────────────────────────────────────────┐
│          PERCEPTION SURVEY UI                   │
│  - 90+ Questions (by dimension & stakeholder)   │
│  - 1:1 Metric Mapping                           │
│  - Root-Cause Follow-up Questions               │
│  - Response Validation & Deduplication          │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│       REALITY METRIC DATA COLLECTION            │
│  ┌──────────────────────────────────────────┐   │
│  │ Manual Entry (Fallback)                  │   │
│  │ - Data Entry Form per Dimension          │   │
│  │ - Validation Rules                       │   │
│  │ - Evidence Upload (supporting docs)      │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ Data Source Connectors                   │   │
│  │ - LMS/Gradebook API                      │   │
│  │ - Excel/CSV Import                       │   │
│  │ - Board Exam Portal                      │   │
│  │ - Finance System API                     │   │
│  │ - HR System API                          │   │
│  └──────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│       DATA AUDIT DASHBOARD                      │
│  - Metric Coverage (% of 60 metrics)            │
│  - Data Freshness (last update per metric)      │
│  - Fallback Alerts (missing metrics)            │
│  - Quality Indicators (duplicates, outliers)    │
└─────────────────────────────────────────────────┘
```

---

## 📋 DETAILED COMPONENT BREAKDOWN

### 1. PERCEPTION SURVEY SYSTEM

#### 1.1 Survey Question Bank (90+ Questions)

**Data Structure:**
```typescript
interface SurveyQuestion {
  id: string;                           // Q1, Q2, ... Q90+
  dimensionId: number;                  // 1-14
  metricId: string;                     // 1a, 1b, 1c, etc
  question: string;                     // The question text
  respondentType: 'TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER';
  scale: 'LIKERT_1_10';                // Always 1-10 for phase 5
  rootCauseFollowUp: string;            // "What would improve [metric]?"
  category: 'REALITY' | 'PERCEPTION';
  createdAt: Date;
  order: number;                        // Display order in survey
}
```

**Dimensions & Question Count:**
- Dimension 1 (Academic): 6 metrics × 1 Q = 6 questions
- Dimension 2 (Curriculum): 5 metrics × 1 Q = 5 questions
- Dimension 3 (Teachers): 6 metrics × 1 Q = 6 questions
- Dimension 4 (Wellbeing): 5 metrics × 1 Q = 5 questions
- Dimension 5 (Discipline): 5 metrics × 1 Q = 5 questions
- Dimension 6 (Infrastructure): 4 metrics × 1 Q = 4 questions
- Dimension 7 (Safety): 5 metrics × 1 Q = 5 questions
- Dimension 8 (Parent Engagement): 5 metrics × 1 Q = 5 questions
- Dimension 9 (Student Engagement): 5 metrics × 1 Q = 5 questions
- Dimension 10 (Leadership): 5 metrics × 1 Q = 5 questions
- Dimension 11 (Finance): 4 metrics × 1 Q = 4 questions
- Dimension 12 (Admissions): 5 metrics × 1 Q = 5 questions
- Dimension 13 (Technology): 5 metrics × 1 Q = 5 questions
- Dimension 14 (Extracurricular): 4 metrics × 1 Q = 4 questions

**Total: 79 perception questions** (mapped 1:1 to metrics)

#### 1.2 Survey Form Builder UI
- Component: `PerceptionSurveyBuilder.tsx`
- Features:
  - Add/edit/delete questions
  - Tag by dimension + respondent type
  - Preview survey by respondent type
  - Bulk import from CSV
  - Localization support

#### 1.3 Survey Response Collection UI
- Component: `PerceptionSurveyForm.tsx`
- Features:
  - Dynamic form (questions filtered by respondent type)
  - 1-10 Likert scale slider
  - Root-cause text input (optional)
  - Progress bar
  - Save draft / submit
  - Duplicate detection (by email/phone)

---

### 2. REALITY METRIC DATA COLLECTION

#### 2.1 Manual Data Entry Forms (Fallback)

**Form per Dimension:**
```
Dimension 1: Academic Performance
├── Metric 1a: Board exam pass % (by subject)
├── Metric 1b: Formative assessment average
├── Metric 1c: % students below benchmark
├── Metric 1d: Year-on-year growth
├── Metric 1e: Topic-wise item analysis
└── Metric 1f: Homework completion rate
```

**Component Structure:**
- `MetricEntryForm.tsx` - Generic form for metric input
- `DimensionMetricEditor.tsx` - All metrics for one dimension
- `MetricValidationRules.ts` - Type-specific validation
- `EvidenceUpload.tsx` - Attach supporting documents

#### 2.2 Data Ingestion Connectors

**Connector 1: LMS/Gradebook**
- `LMSImportModal.tsx`
- Supports: Google Classroom, Canvas, Blackboard, local Excel
- Fetches: Formative scores (1b), homework completion (1f)
- Mapping: LMS student ID → School student ID

**Connector 2: Excel/CSV Import**
- `BulkDataImporter.tsx`
- Template: Pre-built Excel templates per dimension
- Validation: Row-level checks before import
- Deduplication: Prevent duplicate metric entries

**Connector 3: Board Exam API** (Placeholder)
- `BoardExamConnector.ts`
- Integration: CBSE portal API (when available)
- Metrics: Board pass % (1a), subject-wise scores

**Connector 4: Diagnostic Test Results**
- `DiagnosticTestImporter.tsx`
- Format: CSV with student responses
- Calculation: % below benchmark (metric 1c)

**Connector 5: Finance System** (Future)
- `FinanceMetricsConnector.ts`
- Metrics: Fee realization (11a), teacher payroll (11b)

---

### 3. DATA AUDIT DASHBOARD

#### 3.1 Metric Coverage Dashboard
- Component: `DataAuditDashboard.tsx`
- Shows:
  - Coverage % (N metrics with data / 60 total)
  - Dimension-wise breakdown
  - Last updated timestamp per metric
  - Data quality flags (outliers, missing values)

#### 3.2 Data Freshness Alerts
- Component: `DataQualityAlerts.tsx`
- Tracks:
  - Metrics not updated in 30+ days
  - Conflicting data (same metric, different sources)
  - Outlier detection (value > 3σ from mean)

#### 3.3 Fallback Status Tracker
- Component: `FallbackStatusTracker.tsx`
- Shows:
  - Which metrics are using fallback procedures
  - Which are pending baseline
  - Next actions needed

---

### 4. STAKEHOLDER PORTALS (Phase 5 Extension)

#### 4.1 Admin Data Management Portal
- Route: `/admin/data-management`
- Features:
  - Metric entry forms (all dimensions)
  - Data source connectors
  - Quality audit dashboard
  - Cycle scheduling

#### 4.2 Teacher Metric Entry Interface
- Route: `/teacher/metrics`
- Features:
  - Only their class's metrics (formative scores, attendance)
  - Bulk upload for homework completion
  - View their dimension scores
  - Compare to school average

#### 4.3 Survey Administration Panel
- Route: `/admin/surveys`
- Features:
  - Distribute surveys by respondent type
  - Monitor response rates
  - Send reminders
  - View response timeline

---

## 🗂️ FIRESTORE SCHEMA (Phase 5 Collections)

```firestore
schools/{schoolId}/
  ├── assessmentCycles/{cycleId}/
  │   ├── perceptionSurveys/{surveyId}/
  │   │   ├── questions/{questionId}/
  │   │   │   └── (SurveyQuestion data)
  │   │   └── responses/{responseId}/
  │   │       └── (PerceptionResponse data)
  │   │
  │   └── realityMetrics/{metricId}/
  │       ├── (MetricData structure)
  │       └── sources/ (one doc per data source)
  │
  ├── metricDataTemplates/ (Shared question bank)
  │   └── {dimensionId}/
  │       └── {metricId}/
  │           └── (SurveyQuestion template)
  │
  └── dataConnectors/ (API credentials, mapping)
      ├── lmsIntegration/
      ├── excelImport/
      └── boardExamAPI/
```

---

## 🛠️ TECHNOLOGY STACK (Phase 5)

### Frontend Components:
- **React 18** (existing)
- **TypeScript** (strict mode)
- **Tailwind CSS** (responsive)
- **React Hook Form** (form management)
- **Zod** (validation)
- **React Query** (data fetching)
- **Recharts** (data visualization)

### Backend (Cloud Functions):
- **Firebase Cloud Functions Gen 2**
- **TypeScript**
- **Firebase Admin SDK**

### External Integrations:
- **LMS APIs** (Google Classroom, Canvas)
- **Excel/CSV parsing** (xlsx library)
- **File storage** (Firebase Storage for evidence)

---

## 📅 PHASE 5 IMPLEMENTATION TIMELINE

### **WEEK 1: Survey Infrastructure**

**Day 1-2: Survey Question Bank**
- [ ] Create SurveyQuestion data model
- [ ] Build Firestore schema
- [ ] Create 79 perception questions from reference doc
- [ ] Tag by dimension, stakeholder, metric

**Day 3-4: Survey Form Builder**
- [ ] `PerceptionSurveyBuilder.tsx` (add/edit/preview)
- [ ] Bulk import CSV functionality
- [ ] Question ordering/sorting

**Day 5: Survey Response Collection**
- [ ] `PerceptionSurveyForm.tsx` (respondent view)
- [ ] 1-10 Likert scale input
- [ ] Root-cause text field
- [ ] Duplicate detection (email/phone based)

**Tests:**
- [ ] Unit: Question validation, duplicate detection
- [ ] Integration: Save survey response, trigger calculations

---

### **WEEK 2: Reality Metric Data Entry**

**Day 6-7: Metric Entry Forms**
- [ ] Data model: MetricData interface (per metric type)
- [ ] Generic form: `MetricEntryForm.tsx`
- [ ] Dimension-specific editors (all 14 dimensions)
- [ ] Validation rules (per metric formula)

**Day 8-9: Evidence Upload**
- [ ] `EvidenceUpload.tsx` (attach supporting docs)
- [ ] Firebase Storage integration
- [ ] File type validation (PDF, Excel, PNG)

**Day 10: Manual Entry Testing**
- [ ] Test metric entry for all 60 metrics
- [ ] Verify validation rules work
- [ ] Check data persists correctly

---

### **WEEK 3: Data Source Connectors**

**Day 11-12: LMS Integration**
- [ ] `LMSImportModal.tsx`
- [ ] Google Classroom connector (OAuth)
- [ ] Map LMS gradebook → Metric 1b (formative scores)
- [ ] Test import workflow

**Day 13-14: Excel/CSV Importer**
- [ ] `BulkDataImporter.tsx`
- [ ] Pre-built templates (per dimension)
- [ ] Row validation before import
- [ ] Handle duplicates, errors gracefully

**Day 15: Data Quality Checks**
- [ ] Deduplication logic
- [ ] Outlier detection (flag values > 3σ)
- [ ] Data type validation

---

### **WEEK 4: Data Audit & Dashboard**

**Day 16-17: Audit Dashboard**
- [ ] `DataAuditDashboard.tsx`
- [ ] Coverage % calculation (N metrics with data / 60)
- [ ] Dimension-wise breakdown
- [ ] Last updated timestamps

**Day 18-19: Quality Alerts**
- [ ] `DataQualityAlerts.tsx`
- [ ] Stale metric alerts (>30 days)
- [ ] Conflicting data detection
- [ ] Outlier flags

**Day 20: Fallback Status**
- [ ] `FallbackStatusTracker.tsx`
- [ ] Show which metrics using fallback
- [ ] Pending baseline list
- [ ] Action items for missing data

---

### **WEEK 5: Integration & Testing**

**Day 21-22: End-to-End Workflows**
- [ ] Survey → Perception Score calculation
- [ ] Metric Entry → Reality Score calculation
- [ ] Combined gap analysis (Reality vs Perception)
- [ ] Test full diagnostic cycle

**Day 23: Admin Portal**
- [ ] Create `/admin/data-management` route
- [ ] Wire all components together
- [ ] Add navigation, breadcrumbs

**Day 24: Deployment & Documentation**
- [ ] Fix any bugs found in testing
- [ ] Write deployment guide
- [ ] Create user manual (admin, teacher, parent)
- [ ] Commit & push to GitHub
- [ ] Deploy to Firebase

---

## 🔗 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────┐
│        PERCEPTION SURVEY (90+ Questions)            │
│  Teachers, Parents, Students, Admins submit via UI  │
│  ↓ Validation ↓ Deduplication ↓ Firestore Store    │
└──────────────────────────┬──────────────────────────┘
                           │
                    ┌──────▼────────┐
                    │ aggregatePerc │
                    │eptionScore()  │
                    │ (1-10 → 0-100)│
                    └──────┬────────┘
                           │
                ┌──────────▼──────────┐
                │   Perception Scores │
                │  Per Dimension (0-100)
                └──────────┬──────────┘
                           │
┌──────────────────────────────────────────────────────┐
│    REALITY METRICS (60+ Metrics) - Multiple Sources  │
│  Manual Entry + LMS Import + Excel + APIs           │
│  ↓ Validation ↓ Deduplication ↓ Firestore Store    │
└──────────────────────────┬───────────────────────────┘
                           │
                    ┌──────▼────────┐
                    │ aggregateReal │
                    │ ityScore()    │
                    │ (0-100 format)│
                    └──────┬────────┘
                           │
                ┌──────────▼──────────┐
                │   Reality Scores    │
                │ Per Dimension (0-100)
                └──────────┬──────────┘
                           │
                    ┌──────▼──────────┐
                    │  calculateGap() │
                    │ Direction+Severity
                    └──────┬──────────┘
                           │
                  ┌────────▼────────┐
                  │ DIMENSION GAPS  │
                  │ Severity Color  │
                  │ Red/Orange/Yellow/Green
                  └────────┬────────┘
                           │
          ┌────────────────▼────────────────┐
          │  14-DIMENSION HEALTH SCORECARD  │
          │  Ready for Board Presentation   │
          └────────────────────────────────┘
```

---

## ✅ ACCEPTANCE CRITERIA

### Minimum Viable Phase 5:
- [ ] Perception survey UI operational (collect 79 Q responses)
- [ ] Manual data entry for all 60 metrics working
- [ ] LMS import connector (Google Classroom) functional
- [ ] Data audit dashboard showing coverage %
- [ ] Real diagnostic cycle possible (Perception + Reality → Gaps)

### Quality Gates:
- [ ] TypeScript strict mode - zero errors
- [ ] All critical functions have unit tests
- [ ] UI responsive on mobile/tablet/desktop
- [ ] Firestore security rules enforce data permissions
- [ ] Performance: Page load < 2s, metric entry < 1s

---

## 🚀 GO-LIVE CHECKLIST

Before deploying Phase 5 to production:

- [ ] All TypeScript tests passing
- [ ] Firebase security rules updated
- [ ] Firestore indexes created
- [ ] Admin portal documented
- [ ] Teacher guide for metric entry
- [ ] Parent guide for surveys
- [ ] Support email/contact setup
- [ ] Data backup procedures tested
- [ ] GitHub Actions deployment tested
- [ ] Live URL tested: https://disha-diagnostics.web.app/

---

## 📊 SUCCESS METRICS

After Phase 5 launch:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Data Coverage | 80%+ metrics collected | Audit dashboard |
| Survey Response Rate | >60% for first cycle | Response tracking |
| Data Entry Time | <5 min per metric | User feedback |
| System Uptime | 99.5% | Firebase monitoring |
| Load Time | <2 sec | Lighthouse audit |
| Dimension Gap Accuracy | Validated by admin | Manual spot-check |

---

**Next Step:** ✅ Ready to start Week 1 development

🚀 **Let's build Phase 5!**
