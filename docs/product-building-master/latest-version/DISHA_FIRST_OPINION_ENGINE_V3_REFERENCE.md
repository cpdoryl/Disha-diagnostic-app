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

---

## Addendum (2026-08-31): Operational Data Upload & Validation — As Implemented

This addendum documents the **actual, verified behavior of the deployed
Screening Intake file-upload step** (`src/pages/FirstOpinionPage.tsx`,
`src/lib/fileAnalyzer.ts`, `src/lib/challengeDataRequirements.ts`), found and
fixed during live QA testing. It supersedes any prior format documentation
for this specific feature — in particular, `USER_TESTING/first_opinion_testing_data/5_DATA_FORMATS/`
describes a CSV/JSON/XLSX/ZIP/Firestore-import system (8 named multipliers,
15-record challenge-response JSON, Excel workbooks) that was **never actually
implemented** in the live upload box. Do not use that folder as a reference
for this feature; use `USER_TESTING/first_opinion_testing_data/6_OPERATIONAL_METRICS_CSV/`
instead, which matches the real code.

### Bugs found and fixed (2026-08-31)

1. **Challenge-ID taxonomy mismatch.** `challengeDataRequirements.ts` keyed
   its 15 entries by strings like `C3_STAFF_TURNOVER`, `C4_ACADEMIC_PERFORMANCE`,
   describing challenges that do not correspond 1:1 with the real 15-challenge
   question bank in `screeningQuestionsData.ts` (which is what
   `selectedChallenges` actually contains, e.g. `enrollment_decline`,
   `teacher_attrition`). Past `C2`, the two challenge lists diverge entirely.
   Because of this, per-challenge metric lookups always missed, and
   `validateFileForChallenges` silently returned `isValid: true` with 0%
   completeness for every upload, regardless of content. **Fixed:**
   `challengeDataRequirements.ts` is now keyed by the exact same ids as
   `screeningQuestionsData.ts`, with 2 required metrics per challenge derived
   directly from that file's own `metrics` array (so the objective data
   requested always matches the metric named in that challenge's own
   questions).
2. **No real upload format existed.** `FileAnalyzer.analyzeFile` only
   guessed file type from the filename (e.g. "attendance", "staff", "fee")
   and parsed loosely with regexes — there was no way to reliably supply
   exact values for arbitrary metric fields, and it could never actually
   satisfy the (broken) per-challenge validation above even if fixed.
   **Fixed:** added a canonical **Operational Metrics CSV** format — a
   2-column CSV, header `metric_field,value`, one row per metric, using the
   exact `fieldName`s from `challengeDataRequirements.ts`. This format is
   detected before any filename-based guessing and produces exact,
   unambiguous key/value metrics.
3. **Missing-fields UI would never render its list.** The "Data INCOMPLETE"
   panel filtered `missingMetrics` (formatted strings like `"❌ Board Exam
   Pass Rate (board_exam_pass_rate_pct)"`) with `Array.includes(fieldName)`,
   which requires exact equality and therefore never matched. **Fixed** to
   use a substring check (`missingMetrics.some(mm => mm.includes(fieldName))`).
4. **No visibility into what data was actually required.** The upload box
   said only "attendance, fee collection, staff records, academic results,
   etc." with no field-level specification, and — since the challenge
   combination changes every run — a fixed static list would have been
   wrong for most combinations anyway. **Fixed:** the Screening Intake page
   now renders a live "Required Data Fields for This Checkup" panel, split
   into the 4 Core Operational Levers (required on every checkup) and the
   challenge-specific fields computed dynamically from whichever 3
   challenges are currently selected.

### Canonical Operational Metrics CSV format

```csv
metric_field,value
students_per_classroom,28
parent_query_response_sla_hours,24
annual_training_hours,20
weekly_planning_hours,4
teacher_turnover_rate_pct,22
avg_teacher_tenure_years,3.5
```

- **4 Core Operational Levers** (`CORE_OPERATIONAL_METRICS` in
  `challengeDataRequirements.ts`) are required on every checkup regardless of
  challenge selection: `students_per_classroom`, `parent_query_response_sla_hours`,
  `annual_training_hours`, `weekly_planning_hours`. These directly feed the
  DISHA Health Score's objective multiplier calculation.
- **2 challenge-specific fields per challenge** (30 fields across all 15
  challenges) are additionally required for whichever 3 challenges the user
  selected on Step 1 — see `USER_TESTING/first_opinion_testing_data/6_OPERATIONAL_METRICS_CSV/README.md`
  for the full field catalogue and example sample files covering 5
  representative 3-challenge combinations plus one master file containing
  all 34 fields (valid for any of the 455 possible 3-challenge combinations).

### Known remaining gap (not yet fixed)

The upload box's copy still advertises "PDF, XLS, DOC, or Phone Camera JPG"
as accepted formats, but `FileAnalyzer` only ever reads the file as plain
text (`FileReader.readAsText`) — a genuine binary PDF/XLS/JPG upload will not
be meaningfully parsed into real metrics. Until real binary parsing is added
(or the accepted-formats copy is corrected to say CSV/plain text only), use
the canonical CSV format above for any test that needs the validation or
DISHA Score to reflect real data.

---

## Addendum 2 (2026-08-31): Full 455-Combination Test Matrix & Perception Gap Engine

### Full combination test data

`15 choose 3 = 455` possible 3-challenge combinations exist. Every one now
has a ready-to-upload Operational Metrics CSV in
`USER_TESTING/first_opinion_testing_data/7_ALL_455_COMBINATIONS/`
(`combo_001...csv` – `combo_455...csv`, plus `INDEX.csv` mapping combo
number → filename → the 3 challenge names). Each file begins with a
`# Challenge Combination: ...` comment line naming what it's for (the
canonical CSV parser in `fileAnalyzer.ts` skips `#`-prefixed lines before
locating the `metric_field,value` header, so this doesn't affect parsing).

The rationale for why each of the 30 underlying metrics was chosen, and how
combinations relate to each other (short answer: they're independent
unions — see that document for the full explanation, including why we did
**not** fabricate 455 different "combination-specific" relationships that
don't exist in the code), is in
`USER_TESTING/first_opinion_testing_data/DATA_SELECTION_RATIONALE.md`.

### Perception Gap Analysis engine (new)

Prior to this addendum, uploaded challenge-specific metrics were validated
(is the data complete?) but never actually **used** anywhere in scoring or
diagnosis — `DiagnosisGenerator.generateDataDrivenDiagnosis` only recognized
the legacy heuristic `fileType`s (`'Attendance Register'`, `'Staff Data'`,
etc.) and fell through to a generic Q&A-only diagnosis for the new canonical
CSV format, silently discarding all the real uploaded values. This
directly undercut the product's own core pitch (the landing page's
"Perception Gap Detected" callout, and this document's own §4 Risk Quadrant
section) — the mechanism that promise depends on didn't exist in code for
the canonical upload path.

Added `src/lib/challengeObjectiveScoring.ts`:
- Converts each of the 30 canonical metrics into the same 1-10 severity
  weight scale already used by `screeningQuestionsData.ts` survey answers
  (15 of the 30 use bands copied verbatim from that challenge's own
  question; the other 15 are documented analogous placeholders — see
  `DATA_SELECTION_RATIONALE.md` §2 for which is which).
- `computePerceptionGapReport()` compares, per selected challenge, the
  self-reported severity against the objective severity, and classifies the
  result using the same high/low split pattern `DISHAScoreCalculator.classifyRiskQuadrant`
  already uses for S_sub/M_obj (adapted to this 1-10 scale, concern
  threshold = 5): **Aligned**, **Delusional Comfort** (Blind-Spot Risk /
  Positive Gap in this doc's §4 terms), **Hidden Excellence** (Reality
  Better Than Perception / Negative Gap), or **Confirmed Crisis** (both
  sides agree).
- This is rendered as a new "Perception Gap Analysis" panel on the First
  Opinion Report step, additive to the existing DISHA Score Dashboard. It
  does **not** change the S_sub/M_obj/Health Index formula itself, which
  remains driven only by the 4 Core Operational Levers as originally
  specified above.

**Bug caught and fixed during this build**, worth recording: the first
version of this verdict logic used a gap-threshold check as the first
branch and only then split by "which side is worse," which left the case
"both sides agree it's fine, but the numeric gap between them is still >1.5"
falling through to a mislabeled `CONFIRMED_CRISIS`. Verified via the
combinatorial test in Addendum 2's testing report before this reached
production; fixed by switching to a clean, non-overlapping 2×2 split
(mirrors `classifyRiskQuadrant`'s own pattern) instead of a threshold-then-branch
scheme. See `8_ENGINE_ACCURACY_TESTING/ENGINE_ACCURACY_AND_TESTING.md` for
the full before/after test output.

### Accuracy & testing

**There is no valid "% accuracy" figure for this engine against real-world
outcomes** — no historical dataset exists linking a completed First Opinion
checkup to a later-confirmed real school outcome, so nothing exists to
measure predictive accuracy against. Fabricating one would violate this
project's explicit no-hallucination requirement. What was measured instead
(full detail, full methodology, and the exact re-runnable script, in
`USER_TESTING/first_opinion_testing_data/8_ENGINE_ACCURACY_TESTING/ENGINE_ACCURACY_AND_TESTING.md`):

- **100%** of the 30 metric band definitions pass automated structural
  validation (monotonic direction, valid range, no gaps in coverage).
- **50%** (15/30) of metric bands are copied verbatim from a real survey
  question's own weights; the other 50% are documented analogous
  placeholders pending real-world calibration.
- Across all 455 combinations with closely-matched self-reporting: **60%**
  Aligned, 26.7% Confirmed Crisis, 13.3% Delusional Comfort, with an average
  discretization gap of 0.49 points (max 1.5) — expected behavior given
  discrete survey options vs. continuous uploaded data, not an error.
- Adversarial test (leadership always self-reports the rosiest possible
  answer): **100%** of the objectively-concerning challenge instances (546
  of 546) were correctly flagged as Delusional Comfort — zero false
  negatives in this scenario.
- See that document's §5 for the concrete steps required to turn this into
  a genuine, defensible accuracy percentage (primarily: real school outcome
  data over multiple assessment cycles — there is no shortcut around this).

## Addendum 3 (2026-08-31): Why 15/30 Objective Metrics Are Authored, and the First Real-Benchmark Conversion

### Why the 30 metrics split roughly 50/50 into "exact" vs "authored"

This is not inconsistent effort — it splits cleanly along three structural
lines, and each of the 15 "authored" metrics fails for one of them:

1. **No one collects this as a number, anywhere, for Indian schools.**
   `mental_health_incidents_per_1000`, `safety_violations_count_year`,
   `regulatory_violations_count_year` — there is no mandatory reporting
   regime for any of these at a system level in Indian K-12. There is no
   national base rate published to band against.

2. **The construct is inherently reputational/qualitative, not naturally
   numeric.** `brand_perception_score_pct`, `media_sentiment_pct`,
   `parent_response_rate_pct`, `teacher_competency_score_pct`,
   `leadership_competency_score_pct` — validated instruments exist for some
   of these (360-degree leadership assessments, NPS-style surveys,
   social-listening tools), but they are proprietary, paid, normed on
   different populations (usually corporate, not Indian school leadership),
   and the schools using this app have almost certainly never administered
   one. Even a perfect external benchmark would be unusable here, because
   the school could not self-report a comparable number.

3. **The data is real but privately held, not disclosed.**
   `maintenance_backlog_inr`, `cost_increase_yoy_pct`,
   `days_sales_outstanding` — Indian private schools, especially the
   state-board/mid-fee-tier segment this app targets, do not publish
   audited financials in a standardized, comparable way. There is no
   RTI-equivalent disclosure obligation, so no dataset exists to mine
   percentile bands from, even though the underlying fact is perfectly
   real and knowable to that one school.

Two metrics compound this further: `compliance_score_pct` and
`maintenance_backlog_inr` are not naturally single numbers at all. Real RTE
compliance is a checklist of binary pass/fail certificates (fire NOC,
structural safety, affiliation renewal), not a published 0-100 scale, so
collapsing it into one percentage is itself an invented aggregation, prior
to banding it. `maintenance_backlog_inr` uses raw INR thresholds that are
not size-normalized (₹3 lakh is trivial for a 2,000-student school and
severe for a 200-student one) — a true fix needs backlog-per-student or
backlog-as-%-of-budget, which requires a school budget figure this app does
not currently collect at all. Both remain open, documented gaps.

### What was actually converted this pass: `infrastructure_quality_score_pct`

Of the three groups above, group 3's `infrastructure_quality_score_pct` was
the one closest to fixable, because Indian schools *are* subject to a real,
publicly known external standard here: the **RTE Act 2009 Schedule**'s
physical-infrastructure norms, the same checklist referenced on state RTE
recognition/compliance forms.

**Before:** `description: 'Composite score of classroom, lab and campus
facility quality'` — a school entered a number with no defined method for
arriving at it. Two people rating the same campus could reasonably produce
very different numbers.

**After:** the field is redefined as a checklist compliance rate, not a
self-rating. `challengeDataRequirements.ts` now exports
`RTE_INFRASTRUCTURE_NORMS_CHECKLIST`, a 10-item list (all-weather building;
one classroom per teacher for an adequate Pupil-Teacher Ratio; an
office-cum-store-cum-Head Teacher's room; separate toilets for boys and
girls; safe drinking water for every child; a mid-day-meal kitchen where the
scheme applies; a playground; a library with reading materials;
barrier-free/ramp access for Children With Special Needs; a boundary
wall/fence). Some states add 1-2 local items to their own RTE recognition
checklist — a school should defer to that where it differs from this base
list.

```
infrastructure_quality_score_pct = (RTE norms currently met / 10) x 100
```

The field name, unit (`percentage`), CSV format, and existing sample data
files are all unchanged — only the *definition* of the number changed, from
an unexplained self-rating to a checklist count anyone can independently
re-derive by walking the same campus with the same list. `MetricRequirement.description`
for this field (`challengeDataRequirements.ts`) now spells out the formula
and checklist inline, so it surfaces automatically in the app's own
validation/missing-field guidance.

The severity *bands* (25/50/75/90 thresholds in
`challengeObjectiveScoring.ts`'s `METRIC_BAND_DEFINITIONS`) remain
`authored: true` and unchanged — RTE publishes the norms themselves but not
a quality-grade cutoff for how many of them "should" be met, so grading
75% compliance as "fair" vs. "poor" is still a product judgment, documented
as such in that entry's `bandSource`. What changed is the *input*: it is now
externally grounded and independently auditable, which was the actual gap.

### Considered but not converted: `parent_response_rate_pct`

Cross-industry customer-service SLA benchmarks (e.g. published
contact-center/CRM response-time studies) were considered as an external
anchor for this metric. They were **not** adopted here: doing so would mean
citing a specific published figure this session has no way to verify, and
this project's standing rule is to never fabricate a number presented as
externally sourced. `parent_response_rate_pct` therefore remains an
authored placeholder (banded like other satisfaction percentages), flagged
honestly rather than given a synthetic benchmark citation. A future pass
could instead anchor its bands to the SLA windows this app's own
`DISHAScoreCalculator.getSLAMultiplier` already uses for
`parent_query_response_sla_hours` (≤12h excellent, ≤24h good, ≤48h
acceptable, >48h poor) — internally consistent with the rest of the app,
even though it would still not be an externally published national
benchmark.

### Remaining gap count

With this change: **16/30** metrics now have an externally grounded or
question-derived input (15 "exact" + `infrastructure_quality_score_pct`),
**14/30** remain authored placeholders pending either real institutional
benchmark data, a licensed instrument, or a defined internal proxy. This
addendum documents exactly which are which and why, per metric, so future
work always starts from a specific, named gap rather than a general
"needs calibration" note.
