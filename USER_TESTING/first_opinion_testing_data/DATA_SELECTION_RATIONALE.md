# First Opinion Engine — Data Selection Rationale

**What this document answers:** why each of the 30 objective metric fields was
chosen for its challenge, how it relates to that challenge, and how the 455
possible 3-challenge combinations actually work together. Written after
building and testing the real validation/scoring code (`challengeDataRequirements.ts`,
`challengeObjectiveScoring.ts`, `fileAnalyzer.ts`, `screeningQuestionsData.ts`)
— every claim below is traceable to a specific file and line, not invented.

---

## 1. How combinations actually work (read this first)

**Important, and stated plainly: the app has no combination-specific logic.**
There is no code anywhere that changes behavior because you picked, say,
"Enrollment Decline + Teacher Attrition + Parent Communication" versus any
other trio. Each of the 15 challenges is scored **independently** — its own
2 objective metrics compared against its own screening-question answers.
A "combination" is simply the **union** of whichever 3 independent
challenge-diagnoses you selected. There are 455 = `15 choose 3` possible
unions, but there are only **15 underlying relationships to understand** —
once you understand why a metric relates to its own challenge, you
understand it for every combination that challenge appears in (91 of the
455 combinations, since each challenge appears alongside every possible
pair of the other 14).

This is a deliberate, honest design choice reflected in the code
(`getRequiredMetricsForChallenges` in `challengeDataRequirements.ts` simply
concatenates and de-duplicates each selected challenge's own 2 fields — see
lines 380-398). We did **not** invent 455 different fabricated "combination
interaction effects" that don't exist in the calculation engine, because
that would be describing behavior the app doesn't actually have — exactly
the kind of hallucinated documentation this testing effort was set up to
avoid (see `6_OPERATIONAL_METRICS_CSV/README.md`'s note on the old,
never-implemented `5_DATA_FORMATS/` guide).

**What *does* vary per combination:** which fields are required (union of
the 3 challenges' fields), and the Perception Gap verdict computed per
challenge (see §3) — because that depends on the specific self-reported
answers and uploaded data for that run, not on which other 2 challenges
happen to be selected alongside it.

---

## 2. Why each metric was chosen (all 15 challenges)

Each challenge in `screeningQuestionsData.ts` already declares a `metrics: [...]`
array naming 2 real-world measurements it wants to reason about (this
existed before this fix — we did not invent the *names*, only the
`fieldName` keys, bands, and validation wiring around them). Below, for
each challenge: what the 2 metrics measure, why they matter for that
challenge, and whether the severity-scoring bands (§3) are copied exactly
from that challenge's own survey question or authored by analogy (see
`challengeObjectiveScoring.ts` for the `bandSource` on every field).

| Challenge | Metric 1 | Why it matters | Metric 2 | Why it matters |
|---|---|---|---|---|
| Enrollment Decline | `new_student_intake_rate_pct` — YoY change in new admissions | Direct measure of the challenge's own name: is enrollment actually declining? | `student_retention_rate_pct` — Grade 1→12 retention | Distinguishes "can't attract new students" from "can't keep existing ones," both roll into the same enrollment trend |
| Student Attrition | `midyear_dropout_rate_pct` | Mid-year exits are the sharpest signal of acute dissatisfaction (a planned non-renewal looks different from a mid-year pullout) | `outflow_to_competitors_pct` | Distinguishes "leaving education" from "leaving *to a rival school*" — the latter is a competitive/reputation signal, not just a retention one |
| Fee Collection Challenges | `fee_realization_rate_pct` — % of billed fees actually collected | The core financial symptom of the challenge | `days_sales_outstanding` — collection delay in days | A school can have 100% eventual realization but still be cash-flow-starved by slow collection; this catches that case realization % alone misses |
| Teacher Attrition | `teacher_turnover_rate_pct` | Direct measure of the challenge | `avg_teacher_tenure_years` | Turnover rate alone hides *whether it's your best/longest-serving staff leaving*; low average tenure means even people who stay aren't staying long |
| Staff Capability Gaps | `teacher_competency_score_pct` | Direct competency signal | `professional_qualification_pct` | Formal qualification and demonstrated competency are not the same thing — a school can have high paper-qualification rates and still have a competency gap, or vice versa |
| Leadership Capability Gap | `leadership_competency_score_pct` | Direct leadership-quality signal | `principal_vp_experience_years` | Experience is an input, competency is an outcome — tracking both separates "under-experienced but capable" leaders from "experienced but ineffective" ones |
| Academic Quality Decline | `board_exam_pass_rate_pct` | The headline academic outcome parents/regulators look at | `average_subject_score_pct` | Pass rate can mask decline at the top (a school can maintain a high pass rate while average scores erode among mid- and high-performers) |
| Student Wellbeing Issues | `mental_health_incidents_per_1000` | Normalizes incident counts by school size so schools of different sizes are comparable | `safety_violations_count_year` | Separates *psychological* wellbeing signals from *physical safety* incidents — different root causes, different remedial actions |
| Remedial Lag | `remedial_support_coverage_pct` — % of students needing help who receive it | Measures access to the intervention | `improvement_rate_pct` — % of those in the program who actually improve | Coverage without effectiveness (or vice versa) point to two completely different fixes: expand the program, or fix the program |
| Parent Communication Issues | `parent_satisfaction_score_pct` | Direct outcome measure | `parent_response_rate_pct` — % of queries answered within SLA | Satisfaction is the lagging outcome; response rate is the leading operational driver a school can actually act on this week |
| Competitive Pressure | `market_share_loss_pct` | Direct measure of competitive erosion | `competitor_win_rate_pct` — % of contested admissions lost to a named rival | Distinguishes "shrinking overall market" from "specific competitor beating us head-to-head" — different strategic responses |
| Brand/Reputation Issues | `brand_perception_score_pct` | Direct reputation signal | `media_sentiment_pct` | Perception among people who already know the school vs. sentiment in public/media channels shaping people who don't — different audiences, different levers |
| Cost Inflation | `cost_increase_yoy_pct` | Direct measure of the challenge | `operating_margin_pct` | Cost inflation is only a crisis if margin can't absorb it — a school with rising costs *and* healthy margin is in a very different position than one with both deteriorating |
| Infrastructure Deficits | `infrastructure_quality_score_pct` | Current-state signal | `maintenance_backlog_inr` | Quality score is a snapshot; backlog value is the forward-looking liability — a school can look fine today with a backlog about to surface |
| Compliance & Regulatory Stress | `compliance_score_pct` | Current-state signal | `regulatory_violations_count_year` | Score can be high while a small number of *serious* violations are pending — count of live violations is the more urgent operational signal |

**Provenance note (do not skip this):** 15 of the 30 fields above use
severity bands copied verbatim from that challenge's own real survey
question (`bandSource` = "(exact)" in `challengeObjectiveScoring.ts`) — a
raw uploaded value and a self-reported answer are directly, exactly
comparable for those 15. The other 15 have no matching quantitative
question in the bank at all (the existing question is qualitative, e.g.
"How aligned is teacher competency to curriculum needs?" has no % figure to
copy), so their bands are **authored by analogy** to sibling metrics in the
same challenge/domain — reasonable, but not derived from an external study
or benchmark, and should be recalibrated once real school data is
available. The full list of which is which is in
`challengeObjectiveScoring.ts`'s `bandSource` field for every metric, and in
`8_ENGINE_ACCURACY_TESTING/ENGINE_ACCURACY_AND_TESTING.md` §2.

**Update (2026-08-31):** `infrastructure_quality_score_pct` moved out of
the "authored, no external anchor" group — its *input* (not its grading
bands) is now defined as an RTE Act 2009 Schedule infrastructure-norms
checklist compliance rate (`RTE_INFRASTRUCTURE_NORMS_CHECKLIST` in
`challengeDataRequirements.ts`), a real external standard every Indian
school is already subject to, replacing what was previously an unexplained
self-rating. See `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` Addendum 3
for the full analysis of why each of the remaining 14 authored fields
lacks an external anchor (three distinct structural reasons, documented
per metric) and why one candidate (`parent_response_rate_pct`) was
considered and deliberately *not* converted rather than given a fabricated
benchmark citation.

**Second update (2026-08-31, same day):** `compliance_score_pct` was
converted the same way, against 8 core board/state-agnostic regulatory
domains (`CORE_COMPLIANCE_DOMAINS_CHECKLIST`). Four more fields
(`days_sales_outstanding`, `cost_increase_yoy_pct`,
`average_subject_score_pct`, `competitor_win_rate_pct`) had their vague
descriptions tightened into precise, standard formulas from the school's
own real records — they were never actually self-ratings, just
under-specified. `maintenance_backlog_inr`'s size-normalization was
analyzed and explicitly declined for now (see Addendum 3's "Analyzed and
explicitly declined" section for why). Current count: **17/30** externally
grounded or checklist/formula-defined, **9/30** remain fully authored
placeholders with no available real anchor.

---

## 3. How a combination's data is actually used (the Perception Gap)

For each of your 3 selected challenges, the engine now computes (see
`src/lib/challengeObjectiveScoring.ts::computePerceptionGapReport`):

1. **Subjective severity** (1=healthy, 10=severe): the average weight of
   whichever of that challenge's own screening questions you answered —
   this already existed before this fix (`screeningQuestionsData.ts`
   question option weights).
2. **Objective severity** (1=healthy, 10=severe): the average of that
   challenge's 2 uploaded metrics, converted through the bands in §2.
3. **Verdict**, using the exact same high/low split pattern the app's core
   Health Index already uses in `DISHAScoreCalculator.classifyRiskQuadrant`
   (adapted to this 1-10 scale, concern threshold = 5):

   | Subjective | Objective | Verdict |
   |---|---|---|
   | ≤5 (fine) | ≤5 (fine) | **Aligned** |
   | ≤5 (fine) | >5 (concern) | **Delusional Comfort** — blind-spot risk, matches the master reference doc's "Perception Better Than Reality" quadrant |
   | >5 (concern) | ≤5 (fine) | **Hidden Excellence** — matches "Reality Better Than Perception" |
   | >5 (concern) | >5 (concern) | **Confirmed Crisis** — both sides agree |

This is **additive** to, not a replacement for, the core S_sub/M_obj/Health
Index formula, which remains driven by the 4 Core Operational Levers
(Student-Teacher Ratio, Parent SLA, Training Hours, Planning Hours) exactly
as documented in `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md`. The
Perception Gap panel is a per-challenge diagnostic layer shown alongside
the Health Index on the First Opinion Report step, not a change to how the
headline score is calculated.

See `8_ENGINE_ACCURACY_TESTING/ENGINE_ACCURACY_AND_TESTING.md` for how this
was tested across all 455 combinations and what it actually measures (and
does not measure).
