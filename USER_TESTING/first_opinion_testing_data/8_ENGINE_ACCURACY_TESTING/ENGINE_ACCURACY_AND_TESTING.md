# First Opinion Engine — Accuracy & Testing Report

**Date:** 2026-08-31
**Scope:** the new Perception Gap Analysis engine (`src/lib/challengeObjectiveScoring.ts`)
added on top of the existing Health Index engine (`src/lib/dishaScoreCalculator.ts`).
**Test scripts:** `perception_gap_consistency_test.ts` and
`screening_questionnaire_and_realtime_audit.ts` in this folder — run either
any time with `npx tsx USER_TESTING/first_opinion_testing_data/8_ENGINE_ACCURACY_TESTING/<script>.ts`
from the repo root. Every number in this document came from one of those
scripts' actual output, re-run just before writing this — nothing here is
estimated.

---

## 0. The honest headline: there is no "% accuracy" number to give you

You asked what percentage accuracy the engine can give, and how to improve
it. The direct answer: **no statistically valid accuracy percentage exists
or can honestly be computed right now**, and any number presented as one
would be fabricated. Here's why, and what we did instead.

"Accuracy" requires comparing a prediction against a known, independently
verified ground truth (e.g. "the engine said RED risk, and 6 months later
the school's enrollment did in fact collapse — confirmed across N real
schools"). This app has:
- No historical dataset of real schools with both a completed First Opinion
  checkup **and** a later-confirmed real-world outcome.
- No third-party benchmark study behind 15 of the 30 objective-metric bands
  (they're reasoned analogies — see `DATA_SELECTION_RATIONALE.md` §2 — not
  externally validated thresholds).

Without that, there is nothing to be "accurate" against. What follows
instead is what we *can* honestly measure: whether the engine's math is
**internally correct, consistent, and behaves as designed** — a
correctness/calibration report, not a predictive-accuracy report. Read the
percentages below with that distinction in mind; §5 explains exactly what
it would take to produce a real accuracy number in the future.

---

## 1. Structural correctness: 30/30 metric definitions pass validation (100%)

Every one of the 30 canonical metric band definitions in
`challengeObjectiveScoring.ts` was programmatically checked for:
- Thresholds strictly ascending
- Weights monotonic in the correct direction for that metric's `higherIsBetter` flag
- Last band's upper bound is `Infinity` (no value can fall outside all bands)
- All weights within the valid 1-10 range

**Result: 0 errors across all 30 definitions.** This confirms the banding
table itself has no internal contradictions (e.g. a metric where a "worse"
raw value would incorrectly score as healthier than a "better" one — the
exact class of bug this check exists to catch).

## 2. Data grounding: 15/30 fields (50%) use exact real question bands, 15/30 (50%) are authored analogies

Counted directly from `bandSource`/`authored` on every entry:

- **15 fields ("exact")**: `new_student_intake_rate_pct`, `student_retention_rate_pct`,
  `midyear_dropout_rate_pct`, `outflow_to_competitors_pct`, `fee_realization_rate_pct`,
  `teacher_turnover_rate_pct`, `avg_teacher_tenure_years`, `professional_qualification_pct`,
  `principal_vp_experience_years`, `board_exam_pass_rate_pct`, `remedial_support_coverage_pct`,
  `improvement_rate_pct`, `parent_satisfaction_score_pct`, `market_share_loss_pct`,
  `operating_margin_pct`. A raw uploaded value here converts to the *identical*
  weight a self-reported survey answer in the same band would produce — these
  are the most trustworthy half of the catalogue.
- **15 fields ("authored")**: everything else. No matching quantitative
  question exists in the 15-challenge question bank, so these bands were
  constructed by analogy (same shape as sibling metrics) rather than sourced
  from an external benchmark. Treat their objective-severity output as a
  reasonable placeholder, not a validated threshold — see §5 for how to fix
  this properly.

## 3. Internal consistency test across all 455 combinations

Using `operational_metrics_master_ALL_15_CHALLENGES.csv`'s values as the
"objective" data, and, for each challenge, the self-reported survey option
whose weight is *closest available* to that challenge's objective severity
(i.e. simulating a leader who is trying to self-report accurately):

| Metric | Result |
|---|---|
| Combinations tested | 455 (all of them — full `15 choose 3`) |
| Challenge-instances evaluated | 1,365 (455 × 3) |
| Aligned | 819 (60.0%) |
| Confirmed Crisis (both sides correctly agree it's bad) | 364 (26.7%) |
| Delusional Comfort | 182 (13.3%) |
| Hidden Excellence | 0 (0%) |
| Average absolute gap | 0.489 points (on the 1-10 scale) |
| Maximum absolute gap observed | 1.500 points |

**What this shows:** the calculation is deterministic and well-behaved
across the entire combinatorial space — no crashes, no out-of-range
outputs, no NaNs, across all 455 possible combinations. The 13.3% Delusional
Comfort / 26.7% Confirmed Crisis split (rather than 100% Aligned) is
**expected, not an error**: it's an artifact of survey options being
discrete (5-6 fixed choices) while the objective input is continuous —
when a challenge's true severity sits near the boundary (5.0), the nearest
available survey option can land on the other side of that boundary from
the continuous objective value even though the numeric gap is small (this
is exactly why the max observed gap is 1.5, not larger — see §5 for how to
tighten this).

## 4. Adversarial test: does it actually catch self-deception?

The core value proposition of a "Perception Gap" feature is catching a
leader who under-reports real problems. We tested the worst case: every
single screening question answered with the *rosiest possible option*
(weight ≈ 1), regardless of what the uploaded data actually says, across
all 455 combinations.

Of the 15 challenges, 6 are objectively "a real concern" (severity > 5) in
the master dataset (`enrollment_decline`, `teacher_attrition`,
`leadership_capability_gap`, `remedial_lag`, `cost_inflation`,
`infrastructure_deficits`) — these appear in 546 of the 1,365
challenge-instances tested (6 challenges × 91 combinations each contain it).

**Result: all 546 of 546 truly-concerning instances were correctly flagged
as "Delusional Comfort" — a 100% detection rate, zero false negatives, in
this specific test scenario.** (The other 819 instances — challenges that
are genuinely fine in the master dataset — correctly came back "Aligned"
even though self-reporting was uniformly rosy, since there was nothing to
catch there.)

This is real, reproducible evidence that the mechanism works as designed on
synthetic data. It is **not** evidence about how often real school leaders
misjudge real problems, or how often the specific bands would classify a
real school correctly — that requires real data (§5).

## 4a. Screening questionnaire completeness (all 15 challenges)

Run via `screening_questionnaire_and_realtime_audit.ts`. This checks the
*input side* of the engine: is every challenge's questionnaire actually
built out, and does the engine handle literally every way a user could
answer it?

| Check | Result |
|---|---|
| Challenges in the question bank vs. the requirements table | 15 / 15, exact match both directions (no orphan challenge on either side) |
| Total screening questions across all 15 challenges | 39 (9 challenges have 3 questions, 6 have 2) |
| Total answer options across all 39 questions | 196 |
| Questions with missing/empty options | 0 |
| Options with an invalid or out-of-range (not 1-10) weight | 0 |
| Options with a missing label | 0 |
| Duplicate option values within a question | 0 |

**Every single one of the 15 challenges has a real, complete questionnaire
with valid, selectable options — none are stubbed out or partially built.**

## 4b. Real-time analysis across every possible answer, every possible combination

Two exhaustive (not sampled) tests, also from `screening_questionnaire_and_realtime_audit.ts`:

1. **Every possible way to answer each challenge's own questions.** For
   each of the 15 challenges, every combination of every option across
   every one of its questions was generated (a full Cartesian product) and
   run through the subjective-scoring function. **1,300 distinct
   answer-combinations tested across all 15 challenges, 0 produced an
   invalid or missing weight.**
2. **All 455 challenge combinations, with freshly randomized real-time
   answers each run** (not the same hand-picked example every time — this
   simulates an actual user answering differently on every run). **0
   crashes, 0 invalid verdicts across all 455 combinations.**

Together with §3-4's determinism and adversarial-detection tests, this
confirms the calculation engine has a real architecture capable of
performing the Perception Gap analysis for **any** answer a user could
possibly give, for **any** of the 455 possible challenge combinations, in
real time — not just the specific worked examples used elsewhere in this
document.

---

## 5. How to move from "internally correct" to "actually accurate"

In priority order:

1. **Collect real operational data from real schools that also complete a
   First Opinion checkup**, and track what actually happened 1-2 cycles
   later (enrollment change, teacher exits, etc.). This is the only way to
   produce a genuine accuracy/precision/recall number — there is no
   substitute for it, and no amount of further internal testing can create
   it.
2. **Replace the 15 "authored" metric bands with real benchmarks** as data
   becomes available (district/board-level statistics, peer-school
   surveys, or accreditation body standards for things like
   `mental_health_incidents_per_1000` or `maintenance_backlog_inr`, which
   are currently reasoned placeholders — see `DATA_SELECTION_RATIONALE.md`).
3. **Add more graduated survey options** for the questions currently backing
   the 15 "authored" fields, so leadership's self-report can land closer to
   the true continuous value — this directly reduces the boundary-crossing
   effect described in §3 (currently produces a max 1.5-point discretization
   gap even under perfect self-reporting effort).
4. **Track Perception Gap verdicts over multiple assessment cycles per
   school** (the master reference doc's "Predictive Extensions, Cycle 2+"
   section already anticipates this) — a single checkup can't validate
   itself, but a school whose "Delusional Comfort" flags on a challenge
   persist or worsen across 2-3 cycles, followed by a real negative outcome,
   is exactly the kind of evidence that would let you finally report a real
   accuracy number.
5. **Re-run `perception_gap_consistency_test.ts` whenever any band or
   threshold changes**, and update this document's numbers from its actual
   output — never hand-edit the numbers in this file without re-running the
   script, since that is what keeps this document honest.
