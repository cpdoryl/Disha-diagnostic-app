# DISHA First Opinion Engine - Version 3 Reference Document

**Saved: 2026-08-22**
**Source:** DISHA First Opinion Engine version 3.pdf
**Status:** Complete Implementation Guide

## Document Overview

This is the authoritative reference document for the DISHA First Opinion Engine (First Opinion Report). It contains 11 refinements to the original methodology covering:

- Complete 15-Challenge Question Bank
- Corrected Weighted S_sub Formula (Refinement 2)
- Expanded Objective Multipliers (4→8 metrics) with Geometric Mean Fix (Refinement 3)
- Fact-vs-Perception Tagging & Data Validation (Refinement 4)
- Fully Worked End-to-End Example (Refinement 5)
- Objective Multiplier Data Cards (Refinement 6)
- Objective Data Sourcing for Every Question (Refinement 7)
- Predictive Extensions & Early Warning System (Refinement 8)
- Worked Calculation Walkthroughs (Refinement 9)
- Master Data Requirement Checklist (Refinement 10)
- Methodology Fix: Gap-Based Quadrant (Refinement 11)
- Part 2: The First Opinion Report Design for Principals & Boards

## Implementation Status

- ✅ Document saved and indexed
- ⏳ Phase 1: Core Engine & Data Model (In Progress)
- ⏳ Phase 2: API & Calculation Layer
- ⏳ Phase 3: Reporting & Visualization
- ⏳ Phase 4: Predictive & Trend Analysis

## Key Deliverables from v3

### 1. Complete 15-Challenge Question Bank
**Domains:**
- Growth & Enrollment: C1-C3 (3 challenges)
- People & Staffing: C4-C6 (3 challenges)
- Academic & Wellbeing: C7-C9 (3 challenges)
- Reputation & Competition: C10-C12 (3 challenges)
- Operations & Finance: C13-C15 (3 challenges)

**Each Challenge Includes:**
- 2-3 screening questions
- 5-6 weighted options (1-10 ordinal scale)
- Benchmarking basis (CBSE, industry standards)

### 2. Core Formulas

#### S_sub (Subjective/Perception Score) - CORRECTED
```
For each selected challenge Ci with weight Wi and responses Ri/Mi:
1. severity_i = R_i / M_i (0=perfect, 1=fully critical)
2. health_i = 1 - severity_i (0=fully critical, 1=perfect)
3. S_sub = 100 × sum(W_i × health_i) for all selected challenges
```

#### M_obj (Objective/Reality Score) - GEOMETRIC MEAN
```
M_obj = (m1 × m2 × ... × mn)^(1/n)

Where n = number of multipliers (originally 4, expanded to 8)
Prevents score compounding when adding multipliers
```

#### H (Health Index) - PRIMARY METRIC
```
H = MAX(0, MIN(100, (S_sub × M_obj) - Delusion_Penalty))

Delusion_Penalty:
- 0 if S_sub < 80
- S_sub - 80 if S_sub ≥ 80
```

### 3. Eight Objective Multipliers

**Original 4 (Mandatory):**
1. Student-Teacher Ratio (STR)
2. Parent Response SLA
3. Annual Teacher Training Hours
4. Weekly Planning Time

**New 4 (Expanded):**
5. Fee Realization Rate
6. Safety & Compliance Score
7. Digital/LMS Active Usage Rate
8. Extracurricular Participation Rate

**All multipliers:** 0.0-1.0 scale with defined threshold ranges

### 4. Risk Quadrant (Gap-Based, Corrected)

Gap = S_sub - M_obj (scaled to 0-100 range)

**Quadrants:**
- **Reality Better Than Perception (Negative Gap):** Communication gap - operations solid
- **Aligned (Gap ≈ 0):** Credible read - perception matches reality
- **Perception Better Than Reality (Positive Gap):** Blind-spot risk - operations deteriorating

### 5. Data Sourcing Requirements

**11 Core Source Systems:**
1. Admissions/Enrollment System
2. Finance/Accounts Ledger
3. HR System
4. Timetable/Scheduling System
5. Communication Log/Helpdesk
6. Board Exam & Academic Records
7. Counseling & Wellbeing Records
8. Activity/Co-Curricular Rosters
9. Marketing/PR & Social Monitoring
10. Market Research/Competitor Scan
11. Facilities & Safety Audit Records
12. IT Asset Inventory & LMS Analytics
13. Compliance/Audit/Legal Records

**Deployment Priority (3 largest gaps):**
- Communication Log/Helpdesk
- Timetable Prep-Period Tracking
- Market Research/Competitor Scan

### 6. First Opinion Report Sections

1. **Headline:** Health Index Gauge (single number, color-coded)
2. **Driver:** Weighted severity contribution by challenge
3. **Character:** Gap-based quadrant (perception vs reality)
4. **Engine Room:** All 8 objective multipliers ranked
5. **Trajectory:** Multi-cycle trend analysis (cycle 2+)
6. **Recommendation:** Domain-to-dimension mapping to 14-Dimension Framework

### 7. Predictive Extensions (Cycle 2+)

**Four Early-Warning Flags:**
1. Diverging Trend: S_sub ↑ while M_obj ↓ (Delusional Comfort emerging)
2. Multiplier Freefall: Single multiplier drops >15 pts in one cycle
3. Compounding-Weight: Highest-weighted challenge also worst score (2 cycles)
4. False Recovery: H improves but only from S_sub, M_obj flat/worse

## Implementation Roadmap

### Phase 1: Core Engine & Data Model (Weeks 1-4)
- [ ] Database schema for 15 challenges × question responses
- [ ] S_sub calculation engine (weighted formula)
- [ ] M_obj calculation (8 multipliers, geometric mean)
- [ ] H calculation with Delusion Penalty
- [ ] Data validation layer (fact vs perception tagging)
- [ ] Master data ingestion from 11 source systems

### Phase 2: API & Calculation Layer (Weeks 5-8)
- [ ] GraphQL/REST APIs for challenge responses
- [ ] Real-time multiplier calculation
- [ ] Gap-based quadrant determination
- [ ] Validation engine for FACT vs PERCEPTION questions
- [ ] Batch processing for multi-school deployments

### Phase 3: Reporting & Visualization (Weeks 9-12)
- [ ] First Opinion Report PDF generation
- [ ] Executive Dashboard (Health Index gauge)
- [ ] Challenge Driver ranking visualization
- [ ] Multiplier profile charts
- [ ] Recommendation engine with 14D mapping

### Phase 4: Predictive & Trend (Weeks 13+)
- [ ] Multi-cycle storage and trend calculation
- [ ] Early-warning flag detection
- [ ] Trajectory visualization
- [ ] Predictive analytics (schools at risk)
- [ ] Alert system for Boards

## Data Governance

### Question Classification (Refinement 4)

**FACT-BASED** (Checkable numbers):
- Enrollment trend %, teacher turnover %, fee realization %
- Retention rate, board exam pass rate, safety incidents, etc.
- Can be auto-validated against uploaded data

**PERCEPTION-BASED** (Genuine judgment):
- Competitive position, brand perception, differentiation clarity
- Culture/management issue attribution
- Grounded in documented, repeatable instruments (not unaided impression)

### Data Audit Trail

**Every number is traceable to:**
- Named raw-data source (Refinement 6 data cards)
- Explicit calculation formula
- Published threshold ranges
- Reproducible by school staff in ~1 afternoon

## Success Metrics

1. **Accuracy:** Every school can reproduce every score from their own data
2. **Adoption:** 80%+ of assigned challenges answered per cycle
3. **Actionability:** Top-driving challenge unambiguous (61%+ of concern concentrated)
4. **Trust:** Board approval of First Opinion finding 3 out of 3 cycles
5. **Prediction:** Early-warning flags (cycle 2+) catch emerging issues 2-3 cycles early

## References

- Original DISHA First Opinion Engine (Foundation)
- 14-Dimension School Diagnostic Framework (Deep dive)
- EWISR Calculation Engine (Scoring predecessor)
- Firestore Security Rules & Cloud Functions (Deployment)

---

**CPDO Implementation Status:** Document archived and indexed for all future development.
**Next Step:** Execute Phase 1 implementation (database + core engine).
