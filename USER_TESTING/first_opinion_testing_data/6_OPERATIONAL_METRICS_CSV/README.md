# Operational Metrics CSV — First Opinion Engine File Upload

**Status:** Verified against the actual live code as of 2026-08-31 (`src/lib/fileAnalyzer.ts`,
`src/lib/challengeDataRequirements.ts`, `src/pages/FirstOpinionPage.tsx`).

**⚠️ This folder supersedes `5_DATA_FORMATS/` for the First Opinion checkup's file-upload step.**
`5_DATA_FORMATS/` describes a CSV/JSON/XLSX/ZIP/Firestore-import system (8 named
multipliers `m1`-`m8`, 15 challenge-response JSON objects, Excel sheets, etc.)
that does **not** exist anywhere in the deployed First Opinion Engine code. The
real upload box on the "Screening Intake" step only accepts a single file and
parses it with `FileAnalyzer.analyzeFile`. Use the format documented here for
that specific upload box; treat `5_DATA_FORMATS/` as describing an
unimplemented/aspirational format, not the live feature.

---

## The real format: a 2-column CSV

Header row must be exactly `metric_field,value` (case-insensitive). One data
row per metric. Example:

```csv
metric_field,value
students_per_classroom,28
teacher_turnover_rate_pct,22
```

This is parsed directly into exact key/value pairs — no keyword-guessing, no
filename-based routing. It is validated against:

1. **4 Core Operational Levers** — required on every checkup, regardless of
   which challenges you selected (they drive the DISHA Health Score itself):

   | metric_field | What it is | Example |
   |---|---|---|
   | `students_per_classroom` | Student-Teacher Ratio | 28 |
   | `parent_query_response_sla_hours` | Parent Query Response SLA (hours) | 24 |
   | `annual_training_hours` | Annual Teacher Training Hours | 20 |
   | `weekly_planning_hours` | Weekly Lesson Planning Hours | 4 |

2. **Challenge-specific metrics** — exactly 2 required fields per challenge,
   only for the 3 challenges you selected on Step 1. Full catalogue (all 15
   challenges, so any combination of 3 draws from this table):

   | Challenge (id used in the app) | metric_field | Example |
   |---|---|---|
   | enrollment_decline | `new_student_intake_rate_pct` | -8 |
   | enrollment_decline | `student_retention_rate_pct` | 78 |
   | student_attrition | `midyear_dropout_rate_pct` | 6 |
   | student_attrition | `outflow_to_competitors_pct` | 4 |
   | fee_collection_challenges | `fee_realization_rate_pct` | 86 |
   | fee_collection_challenges | `days_sales_outstanding` | 45 |
   | teacher_attrition | `teacher_turnover_rate_pct` | 22 |
   | teacher_attrition | `avg_teacher_tenure_years` | 3.5 |
   | staff_capability_gaps | `teacher_competency_score_pct` | 68 |
   | staff_capability_gaps | `professional_qualification_pct` | 74 |
   | leadership_capability_gap | `leadership_competency_score_pct` | 60 |
   | leadership_capability_gap | `principal_vp_experience_years` | 5 |
   | academic_quality_decline | `board_exam_pass_rate_pct` | 87 |
   | academic_quality_decline | `average_subject_score_pct` | 71 |
   | student_wellbeing_issues | `mental_health_incidents_per_1000` | 12 |
   | student_wellbeing_issues | `safety_violations_count_year` | 5 |
   | remedial_lag | `remedial_support_coverage_pct` | 35 |
   | remedial_lag | `improvement_rate_pct` | 48 |
   | parent_communication_issues | `parent_satisfaction_score_pct` | 58 |
   | parent_communication_issues | `parent_response_rate_pct` | 65 |
   | competitive_pressure | `market_share_loss_pct` | 5 |
   | competitive_pressure | `competitor_win_rate_pct` | 30 |
   | brand_reputation_issues | `brand_perception_score_pct` | 62 |
   | brand_reputation_issues | `media_sentiment_pct` | 55 |
   | cost_inflation | `cost_increase_yoy_pct` | 14 |
   | cost_inflation | `operating_margin_pct` | 6 |
   | infrastructure_deficits | `infrastructure_quality_score_pct` | 70 (= 7 of 10 RTE Schedule norms met, see below) |
   | infrastructure_deficits | `maintenance_backlog_inr` | 850000 |
   | compliance_regulatory_stress | `compliance_score_pct` | 80 |
   | compliance_regulatory_stress | `regulatory_violations_count_year` | 1 |

The app itself now shows this same table live, filtered to whichever 3
challenges you picked, in a "Required Data Fields for This Checkup" panel on
the Screening Intake step — so you never have to guess or cross-reference
this README while testing.

Source of truth for this table: `src/lib/challengeDataRequirements.ts`
(`CORE_OPERATIONAL_METRICS`, `CHALLENGE_DATA_REQUIREMENTS`).

**Note on `infrastructure_quality_score_pct` (2026-08-31):** this is a
checklist compliance rate against the RTE Act 2009 Schedule's 10
infrastructure norms (`RTE_INFRASTRUCTURE_NORMS_CHECKLIST` in
`challengeDataRequirements.ts`), not a free-floating self-rating — compute
it as `(norms met / 10) x 100`, so only multiples of 10 are meaningful
values. See `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` Addendum 3.

## Files in this folder

| File | Use |
|---|---|
| `operational_metrics_master_ALL_15_CHALLENGES.csv` | All 4 core + all 30 challenge fields. Passes validation for **any** combination of 3 challenges — use this as your default "just works" test file. |
| `combo_1_enrollment_teacherattrition_parentcomm.csv` | Minimal file for exactly: Enrollment Decline + Teacher Attrition + Parent Communication Issues |
| `combo_2_enrollment_teacherattrition_academicquality.csv` | Minimal file for exactly: Enrollment Decline + Teacher Attrition + Academic Quality Decline |
| `combo_3_costinflation_infrastructure_brandreputation.csv` | Minimal file for exactly: Cost Inflation + Infrastructure Deficits + Brand/Reputation Issues |
| `combo_4_staffcapability_leadershipgap_studentwellbeing.csv` | Minimal file for exactly: Staff Capability Gaps + Leadership Capability Gap + Student Wellbeing Issues |
| `combo_5_feecollection_competitivepressure_compliance.csv` | Minimal file for exactly: Fee Collection Challenges + Competitive Pressure + Compliance & Regulatory Stress |

The 5 combo files are deliberately minimal (core 4 + only the 6 fields the
selected 3 challenges need) to demonstrate that **different challenge
combinations require different data** — uploading `combo_1...csv` while you
have Cost Inflation / Infrastructure / Brand selected on-screen will
correctly show as INCOMPLETE, because it's missing those challenges' fields.

## Full matrix: all 455 combinations

`15 choose 3 = 455` possible 3-challenge combinations exist. Every single one
now has its own ready-to-upload file in
`../7_ALL_455_COMBINATIONS/` (`combo_001_...csv` through `combo_455_...csv`,
plus `INDEX.csv` mapping combo number → filename → the 3 challenge names).
Each file starts with a `# Challenge Combination: ...` comment line naming
the exact combination it's for — the app's file parser skips `#`-prefixed
lines automatically, so this doesn't affect validation.

To test any combination you've selected in the app: open `INDEX.csv`, find
the row whose 3 challenge names match your current selection, and upload
that row's `filename`.

## Uploading

1. Do not rename the files — filename no longer matters for this format (the
   header `metric_field,value` is what routes it to the correct parser).
2. Drag & drop or browse to the file on the Screening Intake step.
3. The "Data VALID" / "Data INCOMPLETE" panel should now report exact matches
   against whichever 3 challenges are selected, with a real found/missing
   field list.
