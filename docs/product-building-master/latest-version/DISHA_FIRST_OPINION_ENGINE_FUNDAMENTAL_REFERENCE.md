# DISHA First Opinion Engine — Fundamental Reference Document (As Deployed)

**Prepared:** 2026-09-01

**Status:** Canonical, ground-up specification of the engine actually running in production today

**Companion document:** `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` — the original v3 vision document plus a dated addendum history. That document is the historical/reconciliation record (what was originally proposed, what changed, when, and why). This document is the opposite: it describes only what exists today, written from the code itself, with no reference to what came before except where the difference matters to someone using the live system.

**Source of truth for every figure below:** `src/lib/dishaScoreCalculator.ts`, `src/lib/challengeObjectiveScoring.ts`, `src/lib/challengeDataRequirements.ts`, `src/lib/insightGenerator.ts`, `src/lib/fileAnalyzer.ts`, `src/lib/checkupService.ts`, `src/lib/reportIntegrity.ts`, `src/lib/firstOpinionReportPdf.ts`, `src/data/screeningQuestionsData.ts`, and their test suites — read directly for this document rather than summarized from memory.

## 1. Why This Document Exists

The original v3 specification described an aspirational engine — 8 objective multipliers combined by geometric mean, a per-challenge-weighted perception score, a 3-quadrant model, a multi-cycle predictive layer. What was actually built and shipped is deliberately simpler in the core formula (documented in full in Addendum 4 of the companion document) but has grown a much larger *data* surface than the original spec ever described: 34 named canonical metrics with individually documented benchmark bands and provenance, a full transparency PDF with a 4-part hand-calculation Annexure, cryptographic input checksums, an automated 10,920-scenario regression sweep, and a searchable history of past reports. "More data is involved" than the original abstract spec accounted for, and that data deserves its own canonical reference rather than being scattered across addenda written chronologically as each piece shipped. That is what this document is.

## 2. Architecture Overview

The entire engine runs client-side in the browser as plain TypeScript functions called directly from the page component — there is no server-side scoring API, no Cloud Function in the critical path, and no queue or batch job. A checkup is computed synchronously the moment its inputs are complete, then persisted to Firestore for later retrieval.

### 2.1 User-facing flow

1. **Step 0 — Select 3 Challenges.** The school picks exactly 3 of the 15 challenges below to investigate this cycle.

2. **Step 1 — Screening Questionnaire + Operational Metrics Upload.** The school answers every screening question for its 3 selected challenges, and uploads a canonical Operational Metrics CSV (or works through two optional interactive checklists — see §9) supplying the required numeric fields.

3. **Step 2 — First Opinion Report.** The DISHA Score Dashboard, Perception Gap Analysis, Data-Driven Insights, two charts, a downloadable PDF, an integrity-verification badge, and a searchable Past Reports browser (§10-§12).

### 2.2 Key files

| File | Responsibility |
|---|---|
| `dishaScoreCalculator.ts` | Layers 1-3: S_sub, M_obj, Health Index, Delusion Penalty, Risk Quadrant |
| `challengeDataRequirements.ts` | The 34-field canonical metric catalogue, the 2 checklist definitions, range validation |
| `challengeObjectiveScoring.ts` | Converts raw uploaded values to 1-10 severity; the Perception Gap engine |
| `screeningQuestionsData.ts` | The 15-challenge, 39-question screening question bank |
| `fileAnalyzer.ts` | Canonical CSV parsing, presence validation, range validation |
| `insightGenerator.ts` | Data-Driven Insights: findings, recommendations, overall assessment |
| `checkupService.ts` | Firestore persistence, human-readable reference IDs, Past Reports |
| `reportIntegrity.ts` | Input checksums, full-pipeline recompute, Verify Report Integrity |
| `firstOpinionReportPdf.ts` | The downloadable PDF report + 4-part Annexure |

A second, independently-built implementation of the original v3 spec's literal formulas (8 multipliers, geometric mean, weighted S_sub, multi-cycle trend/early-warning) exists in `src/lib/firstOpinion/` and `src/components/FirstOpinion/` but is **not reachable from any route** — see the companion document's Addendum 4 for the full comparison. Every section below describes only the reachable, live engine.

## 3. The Screening Question Bank

15 challenges across 5 domains, 39 total screening questions, each answered on a 1 (healthy) to 10 (severe) weighted ordinal scale with 5-6 options per question. A school selects exactly 3 challenges per checkup and answers only that subset (typically 6-9 questions).

| Domain | Challenge (id) | Questions |
|---|---|---|
| Growth & Enrollment | Enrollment Decline (`enrollment_decline`) | 3 |
| Growth & Enrollment | Student Attrition (`student_attrition`) | 3 |
| Growth & Enrollment | Fee Collection Challenges (`fee_collection_challenges`) | 3 |
| People & Staffing | Teacher Attrition (`teacher_attrition`) | 3 |
| People & Staffing | Staff Capability Gaps (`staff_capability_gaps`) | 3 |
| People & Staffing | Leadership Capability Gap (`leadership_capability_gap`) | 3 |
| Academic & Wellbeing | Academic Quality Decline (`academic_quality_decline`) | 3 |
| Academic & Wellbeing | Student Wellbeing Issues (`student_wellbeing_issues`) | 3 |
| Academic & Wellbeing | Remedial Lag (`remedial_lag`) | 3 |
| Reputation & Competition | Parent Communication Issues (`parent_communication_issues`) | 2 |
| Reputation & Competition | Competitive Pressure (`competitive_pressure`) | 2 |
| Reputation & Competition | Brand/Reputation Issues (`brand_reputation_issues`) | 2 |
| Operations & Finance | Cost Inflation (`cost_inflation`) | 2 |
| Operations & Finance | Infrastructure Deficits (`infrastructure_deficits`) | 2 |
| Operations & Finance | Compliance & Regulatory Stress (`compliance_regulatory_stress`) | 2 |

Question weights are fixed, hand-authored ordinal scales (not derived from any external psychometric instrument) — e.g. Enrollment Decline's first question offers 6 options from "Strong growth (>20% YoY)" (weight 1) to "Severe decline (<-20%)" (weight 10). These same per-option weights are what Layer 1 (S_sub, below) sums, and what the Perception Gap engine (§8) compares against uploaded data.

## 4. Layer 1 — Leadership Perception (S_sub)

**Formula** (`DISHAScoreCalculator.calculateSubjectiveScore`):

```
S_sub = 100 - ( (sum of every answered question's weight) / (number of answered questions x 10) x 100 )
```
Every answered question counts equally, regardless of which of the 3 selected challenges it belongs to — there is no per-challenge importance weighting. If no questions are answered, S_sub defaults to 50 (neutral) rather than dividing by zero. The result is rounded to 2 decimal places.

**Interpretation bands** (`getSubjectiveInterpretation`): >=80 "strong institutional health", >=60 "good health, some gaps", >=40 "moderate challenges", >=20 "significant challenges", else "critical systemic problems".

## 5. Layer 2 — Operational Reality (M_obj) and the 4 Core Operational Levers

**Formula** (`DISHAScoreCalculator.calculateObjectiveMultiplier`):

```
M_obj = m_str x m_sla x m_train x m_plan
```
A plain product of exactly 4 multipliers (rounded to 3 decimals) — not a geometric mean, and not expanded beyond these 4. Each multiplier is looked up from a fixed benchmark band against one Core Operational Lever, required on **every** checkup regardless of which challenges are selected:

| Core Lever | Field (CSV) | Ideal | Good | Acceptable | Poor |
|---|---|---|---|---|---|
| Student-Teacher Ratio | `students_per_classroom` | <=20 -> 1.05x | 21-28 -> 1.00x | 29-35 -> 0.88x | >35 -> 0.75x |
| Parent Response SLA | `parent_query_response_sla_hours` | <=12h -> 1.00x | 13-24h -> 0.95x | 25-48h -> 0.70x | >48h -> 0.50x |
| Annual Teacher Training | `annual_training_hours` | >=25h/yr -> 1.00x | 15-24h/yr -> 0.85x | - | <15h/yr -> 0.60x |
| Weekly Planning Time | `weekly_planning_hours` | >=5h/wk -> 1.00x | 3-5h/wk -> 0.88x | - | <3h/wk -> 0.75x |

These 4 fields' valid-value ranges (enforced by `validateMetricRanges()`, §9): Student-Teacher Ratio 1-100, Parent Response SLA 0-720 hours, Annual Training 0-500 hours, Weekly Planning 0-80 hours — generous bounds meant to catch data-entry errors (a negative ratio, a stray extra digit), never to reject a genuine outlier.

**Interpretation bands** (`getObjectiveInterpretation`): >=1.0 "Excellent", >=0.8 "Good", >=0.6 "Fair", >=0.4 "Concerning", else "Critical".

## 6. Layer 3 — Health Index and the Delusion Penalty

```
Delusion_Penalty = 0                  if S_sub < 80
Delusion_Penalty = S_sub - 80          if S_sub >= 80 AND M_obj < 0.7
Scaled_Score     = S_sub x M_obj
Health_Index (H) = MAX(0, MIN(100, Scaled_Score - Delusion_Penalty))
```
The Delusion Penalty only fires when leadership rates itself very highly (S_sub >= 80) while the operational data says otherwise (M_obj < 0.7) — a leadership team that is both self-critical (S_sub < 80) OR whose operations are already solid (M_obj >= 0.7) never incurs it.

**Interpretation bands** (`getHealthIndexInterpretation`, identical to the dashboard's own legend): >=70 "EXCELLENT: sustainable institutional excellence"; >=50 "FAIR: manageable with targeted action"; >=30 "POOR: requires significant intervention"; else "CRITICAL: emergency response required".

## 7. Risk Classification — Two Independent Axes

`DISHAScoreCalculator.classifyRiskQuadrant` computes two separate, independent outputs rather than one combined quadrant — a deliberate fix (2026-08-31) so the color badge can never contradict the Health Index number displayed right next to it.

### 7.1 Magnitude — color and risk level (driven only by Health Index)

| Health Index | Color | Risk Level |
|---|---|---|
| >= 70 | GREEN | EXCELLENT |
| 50 - 69.99 | YELLOW | CONCERNING |
| 30 - 49.99 | ORANGE | AT_RISK |
| < 30 | RED | CRITICAL |

### 7.2 Character — quadrant name (driven only by the Perception-Reality Gap)

`Gap = S_sub - (M_obj x 100)`. A large gap names a specific character regardless of the magnitude above; a small gap falls back to a magnitude-derived label:

| Condition | Quadrant Name | Meaning |
|---|---|---|
| Gap > 10 | DELUSIONAL COMFORT | Leadership perceives things as healthier than the data supports — blind-spot risk |
| Gap < -10 | HIDDEN EXCELLENCE | The data is better than leadership believes — a communication gap |
| \|Gap\| <= 10 and Risk Level = EXCELLENT | ELITE EQUILIBRIUM | Aligned, and genuinely healthy |
| \|Gap\| <= 10 and Risk Level = CRITICAL | CRITICAL COLLAPSE | Aligned, and genuinely critical |
| \|Gap\| <= 10, otherwise | ALIGNED - MIXED HEALTH | Aligned, but only fair/concerning |

A large Gap-based name always wins even when the magnitude alone would suggest a different label — e.g. a school with Health Index in the CRITICAL band but a Gap of +73 is named DELUSIONAL COMFORT, not CRITICAL COLLAPSE, because the character of the problem (leadership does not see it) is the more useful signal to lead the report with.

## 8. Perception Gap Analysis Engine

Additive to, and independent of, the S_sub/M_obj/Health Index formula above — this engine never changes the Health Index itself. For each of the 3 selected challenges, it compares what leadership self-reported (averaged across that challenge's answered questions, §3) against what the uploaded data shows (averaged across that challenge's 2 canonical metrics, §9), both on the same 1 (healthy) to 10 (severe) scale, concern threshold = 5:

| Self-Reported | Data-Derived | Verdict |
|---|---|---|
| <= 5 (not a concern) | <= 5 (not a concern) | ALIGNED |
| <= 5 (not a concern) | > 5 (a concern) | DELUSIONAL_COMFORT |
| > 5 (a concern) | <= 5 (not a concern) | HIDDEN_EXCELLENCE |
| > 5 (a concern) | > 5 (a concern) | CONFIRMED_CRISIS |
| either side has no data | — | INSUFFICIENT_DATA |

This 2x2 split is clean and mutually exclusive (`computePerceptionGapReport`) — an earlier gap-threshold-first version had a bug that mislabeled some ALIGNED cases as CONFIRMED_CRISIS, caught and fixed before reaching production (see companion document, Addendum 2).

## 9. The Canonical Operational Metrics Data Model — 34 Fields

This is the section that did not exist in any prior form of this documentation: every field the live engine can ingest, its unit, its plausible-value range (enforced at upload — §13), and its benchmark-band provenance (whether the severity thresholds are copied verbatim from a real survey question, or an authored analogous placeholder — see the companion document's Addenda 3 and 4 for the full reasoning behind every "Authored" entry). "Severity bands" convert a raw value into the same 1 (healthy) to 10 (severe) scale used everywhere else in this document.

**4 Core Operational Levers** (required on every checkup, feed M_obj directly — see §5) + **30 challenge-specific fields** (2 per challenge x 15 challenges, only the 6 fields for the 3 *selected* challenges are required per checkup) = **34 total canonical fields** this engine recognizes.

### 9.1 Growth & Enrollment

| Challenge | Field (CSV name) | Unit | Example | Valid Range | Severity Bands (value -> 1-10) | Provenance |
|---|---|---|---|---|---|---|
| Enrollment Decline | `new_student_intake_rate_pct` | percentage | -8 | -100 to 300 | <=-20 -> 10; <=-10 -> 8; <=-5 -> 6; <=10 -> 4; <=20 -> 2; >20 -> 1 | Exact |
| Enrollment Decline | `student_retention_rate_pct` | percentage | 78 | 0 to 100 | <=60 -> 10; <=70 -> 7; <=80 -> 5; <=90 -> 3; >90 -> 1 | Exact |
| Student Attrition | `midyear_dropout_rate_pct` | percentage | 6 | 0 to 100 | <=2 -> 1; <=5 -> 3; <=8 -> 5; <=12 -> 7; >12 -> 10 | Exact |
| Student Attrition | `outflow_to_competitors_pct` | percentage | 4 | 0 to 100 | <=2 -> 1; <=5 -> 3; <=10 -> 5; <=15 -> 8; >15 -> 10 | Exact |
| Fee Collection Challenges | `fee_realization_rate_pct` | percentage | 86 | 0 to 100 | <=75 -> 10; <=85 -> 7; <=90 -> 4; <=95 -> 2; >95 -> 1 | Exact |
| Fee Collection Challenges | `days_sales_outstanding` | days | 45 | 0 to 730 | <=0 -> 1; <=30 -> 2; <=60 -> 4; <=90 -> 7; >90 -> 10 | Authored |

### 9.2 People & Staffing

| Challenge | Field (CSV name) | Unit | Example | Valid Range | Severity Bands (value -> 1-10) | Provenance |
|---|---|---|---|---|---|---|
| Teacher Attrition | `teacher_turnover_rate_pct` | percentage | 22 | 0 to 100 | <=5 -> 1; <=10 -> 2; <=15 -> 4; <=25 -> 7; >25 -> 10 | Exact |
| Teacher Attrition | `avg_teacher_tenure_years` | years | 3.5 | 0 to 50 | <=3 -> 10; <=5 -> 7; <=7 -> 4; <=10 -> 2; >10 -> 1 | Exact |
| Staff Capability Gaps | `teacher_competency_score_pct` | percentage | 68 | 0 to 100 | <=50 -> 10; <=70 -> 6; <=80 -> 4; <=90 -> 2; >90 -> 1 | Authored |
| Staff Capability Gaps | `professional_qualification_pct` | percentage | 74 | 0 to 100 | <=50 -> 10; <=70 -> 6; <=80 -> 4; <=90 -> 2; >90 -> 1 | Exact |
| Leadership Capability Gap | `leadership_competency_score_pct` | percentage | 60 | 0 to 100 | <=50 -> 10; <=70 -> 7; <=80 -> 4; <=90 -> 2; >90 -> 1 | Authored |
| Leadership Capability Gap | `principal_vp_experience_years` | years | 5 | 0 to 60 | <=3 -> 10; <=7 -> 5; <=10 -> 3; <=15 -> 2; >15 -> 1 | Exact |

### 9.3 Academic & Wellbeing

| Challenge | Field (CSV name) | Unit | Example | Valid Range | Severity Bands (value -> 1-10) | Provenance |
|---|---|---|---|---|---|---|
| Academic Quality Decline | `board_exam_pass_rate_pct` | percentage | 87 | 0 to 100 | <=70 -> 10; <=85 -> 5; <=90 -> 3; <=95 -> 2; >95 -> 1 | Exact |
| Academic Quality Decline | `average_subject_score_pct` | percentage | 71 | 0 to 100 | <=30 -> 10; <=50 -> 7; <=70 -> 4; <=80 -> 2; >80 -> 1 | Authored |
| Student Wellbeing Issues | `mental_health_incidents_per_1000` | per 1000 students | 12 | 0 to 1000 | <=5 -> 1; <=15 -> 3; <=30 -> 5; <=50 -> 8; >50 -> 10 | Authored |
| Student Wellbeing Issues | `safety_violations_count_year` | count/year | 5 | 0 to 1000 | <=0 -> 1; <=2 -> 3; <=5 -> 5; <=10 -> 8; >10 -> 10 | Authored |
| Remedial Lag | `remedial_support_coverage_pct` | percentage | 35 | 0 to 100 | <=25 -> 10; <=50 -> 7; <=75 -> 4; <=90 -> 2; >90 -> 1 | Exact |
| Remedial Lag | `improvement_rate_pct` | percentage | 48 | 0 to 100 | <=10 -> 10; <=30 -> 7; <=50 -> 4; <=70 -> 2; >70 -> 1 | Exact |

### 9.4 Reputation & Competition

| Challenge | Field (CSV name) | Unit | Example | Valid Range | Severity Bands (value -> 1-10) | Provenance |
|---|---|---|---|---|---|---|
| Parent Communication Issues | `parent_satisfaction_score_pct` | percentage | 58 | 0 to 100 | <=25 -> 10; <=50 -> 7; <=75 -> 4; <=90 -> 2; >90 -> 1 | Exact |
| Parent Communication Issues | `parent_response_rate_pct` | percentage | 65 | 0 to 100 | <=25 -> 10; <=50 -> 7; <=75 -> 4; <=90 -> 2; >90 -> 1 | Authored |
| Competitive Pressure | `market_share_loss_pct` | percentage | 5 | -100 to 100 | <=0 -> 1; <=2 -> 2; <=5 -> 4; <=10 -> 7; >10 -> 10 | Exact |
| Competitive Pressure | `competitor_win_rate_pct` | percentage | 30 | 0 to 100 | <=10 -> 1; <=20 -> 3; <=30 -> 5; <=50 -> 8; >50 -> 10 | Authored |
| Brand/Reputation Issues | `brand_perception_score_pct` | percentage | 62 | 0 to 100 | <=25 -> 10; <=50 -> 7; <=75 -> 4; <=90 -> 2; >90 -> 1 | Authored |
| Brand/Reputation Issues | `media_sentiment_pct` | percentage | 55 | 0 to 100 | <=25 -> 10; <=50 -> 7; <=75 -> 4; <=90 -> 2; >90 -> 1 | Authored |

### 9.5 Operations & Finance

| Challenge | Field (CSV name) | Unit | Example | Valid Range | Severity Bands (value -> 1-10) | Provenance |
|---|---|---|---|---|---|---|
| Cost Inflation | `cost_increase_yoy_pct` | percentage | 14 | -100 to 300 | <=5 -> 1; <=10 -> 2; <=15 -> 4; <=25 -> 7; >25 -> 10 | Authored |
| Cost Inflation | `operating_margin_pct` | percentage | 6 | -200 to 100 | <=5 -> 10; <=10 -> 7; <=15 -> 4; <=20 -> 2; >20 -> 1 | Exact |
| Infrastructure Deficits | `infrastructure_quality_score_pct` | percentage | 70 | 0 to 100 | <=25 -> 10; <=50 -> 7; <=75 -> 4; <=90 -> 2; >90 -> 1 | Authored |
| Infrastructure Deficits | `maintenance_backlog_inr` | INR | 850000 | 0 to 100000000 | <=100000 -> 1; <=300000 -> 3; <=700000 -> 5; <=1500000 -> 8; >1500000 -> 10 | Authored |
| Compliance & Regulatory Stress | `compliance_score_pct` | percentage | 75 | 0 to 100 | <=50 -> 10; <=70 -> 7; <=85 -> 4; <=95 -> 2; >95 -> 1 | Authored |
| Compliance & Regulatory Stress | `regulatory_violations_count_year` | count/year | 1 | 0 to 1000 | <=0 -> 1; <=1 -> 3; <=3 -> 5; <=6 -> 8; >6 -> 10 | Authored |

### 9.6 Two fields are checklist-derived, not self-rated

`infrastructure_quality_score_pct` and `compliance_score_pct` are not typed in as a subjective number. The Screening Intake page renders two interactive checklists; the school ticks what applies and the app computes the percentage itself, overriding any CSV value for these two fields:

- **RTE Infrastructure Checklist** (10 items, RTE Act 2009 Schedule): All-weather school building with safe construction; One classroom per teacher (adequate classrooms for the Pupil-Teacher Ratio); An office-cum-store-cum-Head Teacher's room; Separate toilets for boys and girls; Safe drinking water facility for every child; A kitchen for cooking mid-day meal (where the scheme applies to the school); A playground; A library with newspapers, magazines, and story books; Barrier-free (ramp) access for Children With Special Needs (CWSN); Boundary wall/fencing for school safety and security.
- **Core Compliance Checklist** (8 items, centrally-mandated regulatory domains): Valid Fire Safety NOC/Certificate from the state Fire Services Department; Structural Safety/Stability Certificate for all school buildings; Currently valid RTE Act recognition certificate or board affiliation, not under show-cause; Functional Child Protection Policy / Internal Committee under the POCSO Act, 2012; Valid building/occupancy certificate from the local municipal authority; Drinking water and sanitation compliant with health department norms; School transport (if operated) compliant with Motor Vehicles Act school-bus safety norms; No pending regulatory show-cause notice or suspension from the affiliating board.

Both formulas are `(items currently met / checklist length) x 100`. The grading bands applied to the resulting percentage (25/50/75/90 for infrastructure, 50/70/85/95 for compliance) remain authored placeholders — no regulator publishes a quality-grade cutoff for how many items "should" be met — but the *input* itself is now independently reproducible by two different people walking the same campus.

### 9.7 Provenance summary

- **15/30** challenge-specific metrics use severity bands copied verbatim from that challenge's own real screening question — a raw uploaded value and a self-reported answer are directly comparable on the same scale.
- **15/30** use an authored, documented analogous band because no matching quantitative question exists in the question bank, no Indian reporting regime publishes a base rate, or the construct is inherently reputational/proprietary (full per-metric reasoning in the companion document's Addendum 3).
- Of those 15 authored entries, 2 (`infrastructure_quality_score_pct`, `compliance_score_pct`) have had their *input* converted to a real external-standard checklist even though their *grading bands* remain authored — see §9.6.
- 4 more (`days_sales_outstanding`, `cost_increase_yoy_pct`, `average_subject_score_pct`, `competitor_win_rate_pct`) had their descriptions tightened to precise, computable accounting/CRM formulas even though they remain flagged Authored at the band level in the table above (the input was never actually subjective; only the description was vague).
- No band was ever fabricated a citation it does not have — every Authored entry says so plainly, both in this document and inside the app's own downloadable PDF (§10).

## 10. Data-Driven Insights Engine

Independent of the scoring layers, `generateRealInsights` (`insightGenerator.ts`) turns every uploaded numeric field into a plain-language finding, ranked by severity so the most urgent issue always leads, regardless of which field happened to be uploaded first:

- Each recognized field gets a `status` (exceeds / meets / below its benchmark), a `priority` (high / medium / low, driven by status), and a specific `finding` + `recommendation` sentence.
- All findings are ranked by `rankBySeverity()` — priority first, then by how far off benchmark within the same priority — before the top 5 are shown as "Key Findings" and "Recommended Actions". Earlier versions let raw object key order put the 4 Core Operational Levers first regardless of actual severity; this was fixed and is now regression-tested (§13).
- **Overall Assessment** headline: "Critical" if more than half of scored fields are below benchmark; "Strong Performance" if more than half exceed benchmark; otherwise "Balanced Profile"; "Insufficient data" if nothing could be scored.
- **Data Quality** tile: completeness = fields found / 10 expected (the 4 Core Levers + 2 fields x 3 selected challenges) x 100; reliability High/Medium/Low at the 80%/50% completeness thresholds.
- An unrecognized field name or a non-numeric value is silently skipped, never guessed at or fabricated into a finding.

## 11. Reporting & Visualization

### 11.1 On-screen report (Step 2)

- DISHA Score Dashboard (Health Index, S_sub, M_obj, Risk Quadrant)
- Core Operational Levers bar chart — the 4 multipliers as a % of their "Ideal" threshold, color-coded, with a 100% reference line
- Perception vs. Reality radar chart — one axis per selected challenge, self-reported vs. data-derived severity overlaid
- Perception Gap Analysis cards (§8) and Data-Driven Insights panel (§10)

### 11.2 Downloadable PDF report

`firstOpinionReportPdf.ts` (jsPDF + jspdf-autotable) regenerates a letterhead-branded PDF on demand from the same persisted data (§12) — never stored as a rendered file, so it can never go stale relative to the underlying record. Two parts:

- **Part A** mirrors every on-screen section, with the exact benchmark band printed inline next to every figure (no number appears without the standard it is being judged against), plus both charts rasterized in.
- **Part B ("Annexure")**, 4 sections: (I) every raw input received — every answered question and every uploaded metric; (II) a complete hand-calculation walkthrough of every formula in §4-§8, including the full untruncated insights table; (III) a Benchmark Reference Library listing every band actually used in this report with its Exact/Authored provenance from §9; (IV) a methodology page.
- The PDF prints the report's input checksum (§12) on the letterhead and explains, in the Annexure, exactly how to independently recompute it.

## 12. Persistence, Traceability & Verification

- **Reference IDs**: `FO-YYYYMMDD-NN`, a per-school per-day sequence generated inside a Firestore transaction (`generateCheckupReferenceId`) — race-safe, with a timestamp-based fallback if generation ever fails.
- **Saved reports**: the full computed report (`dishaScore`, `realInsights`, `perceptionGap`) plus the exact raw inputs it came from are written to `schools/{schoolId}/checkups/{checkupId}/analysis/current` (`saveCheckupAnalysis`), and restored byte-for-byte by `loadPastCheckup` — downloading a past report's PDF or clicking Verify behaves identically to a freshly computed one.
- **Past Reports browser**: search by reference number, filter by challenge/status; backed by `getSchoolCheckups()` (no pagination yet — a scaling item for later, §14).
- **Input checksum**: SHA-256 of a canonical (sorted-key) JSON of the raw inputs only — never the computed outputs (`computeInputsChecksum`) — so a school can independently re-hash their own original submission and prove nothing was altered afterward.
- **Verify Report Integrity**: re-runs the entire pipeline (§4-§8) from nothing but the recorded raw inputs and diffs it, field by field, against the stored result (`verifyCheckupAnalysis`). A match proves genuine reproducibility; a mismatch names exactly what changed.

## 13. Data Governance & Validation

### 13.1 Presence validation

`validateFileForChallenges` / `validateDataForChallenges` confirm every required field for the 3 selected challenges was actually uploaded before a checkup can be analyzed, with a live "Required Data Fields" panel computed per the current challenge selection (never a fixed static list).

### 13.2 Range/sanity validation

Every one of the 34 fields in §9 carries the `validRange` shown in that section's tables, checked by `validateMetricRanges()` at the same two gates as presence validation. This is what actually rejects a negative Student-Teacher Ratio or a 250% Board Exam Pass Rate — presence checks alone never caught an implausible value, only a missing one.

### 13.3 File format

A canonical 2-column CSV, header `metric_field,value`, one row per field, using the exact field names in §9. Detected before any filename-based heuristic guessing. Leading `#`-prefixed comment lines are skipped. A genuinely unreadable/binary upload is diagnosed as a file-format problem, not misreported as "every field missing".

## 14. Quality Assurance

- **CI-gated regression suite**: 81 new tests this session (across `dishaScoreCalculator`, `challengeObjectiveScoring`, `insightGenerator`, `reportIntegrity`, and metric-range-validation test files — verified by actually running the suite, not estimated) plus the pre-existing suite (370 total, 360 passing + 10 pre-existing skips), run via `npm run test:run` as a required GitHub Actions step before every build — a broken calculation now blocks deployment instead of shipping silently.
- **Endurance test**: all 455 possible 3-challenge combinations x 8 severity/data-completeness archetypes x 3 repeated passes = 10,920 full-pipeline scenario runs. Result: 0 failures, no NaN/undefined leakage, every Health Index in [0,100], every risk-quadrant color agreeing with its own Health Index band, every checksum self-verifying, no performance or memory regression across passes.
- **Determinism**: every core module is tested to produce byte-identical output across 5 repeated calls with identical input — the formal proof behind "the app does not add anything of its own".

## 15. Known Gaps & Boundaries (stated plainly, not hidden in an appendix)

- **9/30** metrics remain fully authored placeholders at both the input and band level, pending real institutional benchmark data or a licensed instrument (full list and reasoning in the companion document's Addendum 3).
- **Predictive/trend analysis is not implemented** in this live engine — no multi-cycle storage, no early-warning flags, single-cycle only. A separate, unreached implementation of this exists (§2.2).
- **Past Reports has no pagination** — fine at today's volume, will need one once a school accumulates hundreds of checkups.
- **Binary file upload is not truly parsed** — the upload box's copy advertises PDF/XLS/DOC/JPG, but only plain-text CSV is ever meaningfully read.
- **No live browser end-to-end test has been completed** for the full login-to-PDF flow from an automated testing session (a network-proxy limitation in that testing environment, not a known application defect) — see the companion document's Addendum 7 for what was and wasn't verified.

## 16. References

- `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` — the original v3 vision document and its full addendum/reconciliation history
- `firestore-security-rules.txt` — the deployed Firestore access rules for every collection this engine reads or writes
- `src/data/screeningQuestionsData.ts` — the full, verbatim text of every screening question and answer option
- `USER_TESTING/first_opinion_testing_data/` — sample Operational Metrics CSVs, including one for every one of the 455 possible 3-challenge combinations