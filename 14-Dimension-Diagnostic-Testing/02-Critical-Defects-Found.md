# 14D Diagnostic Assessment — Defects Found (Static Code Validation)

Found by reading the code end-to-end (verified twice, independently) before any UI
testing. Each is reproducible from the code alone; live testing
(`04-Test-Execution-Checklist.md`) should confirm the user-visible symptoms below.

---

## Defect #1 — P0 / Blocker: Every real stakeholder submission is rejected and the answers are lost — ✅ FIXED

**Fix applied** (`src/pages/StakeholderSurvey.tsx`, this session): `handleSubmitSurvey` no
longer calls `assessmentService.ts`'s `saveAssessmentResponse`/`getAssessmentStats`
(the nested, rules-blocked, unread `schools/{schoolId}/assessments/...` path). It now
writes directly via `addDoc` to the top-level `assessments/{assessmentId}/responses`
collection with the exact field shape (`stakeholderType`, nested
`responses[dimensionId][questionId]`) that `ResponseTracker.tsx`'s live counter,
`simulateResponses.ts`, and `dimensionScoring.ts`'s report engine already read — the same
collection the deployed Firestore rules already leave open for anonymous respondents
(confirmed by the in-file comment in `firestore-security-rules.txt`, §7 of the
architecture doc). Verified: `tsc --noEmit` clean, `vite build` succeeds, all 360 existing
tests still pass. Live end-to-end confirmation (submit → admin counter → report) is the
first item in `04-Test-Execution-Checklist.md`.

Original finding, kept for reference:

**Root cause, in the order it actually happens:**

1. `/survey/{assessmentId}/{stakeholderType}` (`App.tsx:37-41`) renders
   `StakeholderSurvey.tsx` **before the app's login/auth check runs at all** — by design,
   so anonymous stakeholders can respond. `request.auth` is therefore `null` for this
   entire session.
2. On submit, `handleSubmitSurvey` (`StakeholderSurvey.tsx:243`) calls
   `saveAssessmentResponse(schoolId, assessmentId, {...})`
   (`assessmentService.ts:130-171`), which `setDoc`s to
   `schools/{schoolId}/assessments/{assessmentId}/responses/{id}` with fields
   `respondentType, respondentEmail, respondentName, respondentId, answers, feedback,
   schoolId, submittedAt, status` — **no `assessmentId` field is ever included in the
   document.**
3. The **deployed** Firestore rules (`firestore-security-rules.txt`, referenced by
   `firebase.json:94` — a different, stricter file than the also-present but *unused*
   `firestore.rules`) require, for exactly this path:
   ```
   allow create: if request.auth != null
     && request.resource.data.assessmentId == assessmentId
     && request.resource.data.schoolId == schoolId;
   ```
   Both conditions fail: `request.auth` is `null` (step 1), and
   `request.resource.data.assessmentId` doesn't exist on the document at all (step 2).
4. The `setDoc` call throws `FirebaseError: permission-denied`. **The response is never
   written anywhere** — this is not a silent-data-loss bug, it's an outright rejected
   write, so no residual data exists to reconcile later.
5. `StakeholderSurvey.tsx`'s catch block (line 315-338) has a specific branch for this:
   `error.code === 'permission-denied' → 'Access denied. The assessment link may have
   expired.'` (line 328-329). **This is the exact message a real respondent will see** —
   which is actively misleading, since the link hasn't expired; the write was rejected by
   rules the app's own save function doesn't satisfy.

**Compounding issue, in case the rules were fixed:** even if the write succeeded, it would
land in `schools/{schoolId}/assessments/{assessmentId}/responses` — a path nothing else in
the app reads. The admin's live counter (`ResponseTracker.tsx:45`), the "Simulate" test
button, and the actual report engine (`dimensionScoring.ts:47`) all read/write a
*different*, top-level path: `assessments/{assessmentId}/responses`. So fixing the rules
alone would trade a hard error for a silent one (real data saved, but invisible to the
admin dashboard and report — see `01-Architecture-and-Backend-Validation.md` §4).

**Fix recommendation:**
- Short-term/correct fix: make `StakeholderSurvey.tsx`'s save path use the same top-level
  `assessments/{assessmentId}/responses` collection and field names (`stakeholderType`,
  nested `responses[dim][question]`) that `ResponseTracker`, `simulateResponses`, and
  `dimensionScoring.ts` already agree on — i.e., stop routing real submissions through
  `assessmentService.ts` (`schools/{schoolId}/assessments/...`) entirely for this flow.
- Then no rules change is needed for this path, since the top-level `assessments/**` tree
  is already intentionally open for anonymous respondents (confirmed by the in-file
  comment in `firestore-security-rules.txt`).
- Add a regression test (emulator-backed) that actually calls `saveAssessmentResponse`-
  equivalent code as an anonymous user and asserts the write succeeds **and** shows up in
  `ResponseTracker`'s query — this specific gap (write path ≠ read path, plus a hard rules
  rejection) went undetected because zero automated tests exist for this feature.

**Severity: P0.** No real assessment data can ever be collected today through the only
survey-taking screen the app exposes. Admin-side "Simulate" testing will look completely
fine and mask this, because simulated data happens to use the correct (different) path.

---

## Defect #2 — P0 / Product: The shipped feature does not implement the "authoritative" reference framework — and a full, spec-compliant implementation exists but is disconnected from the app

**Root cause:** Two entirely separate implementations of "14-Dimension Diagnostic
Assessment" exist in this codebase:

- **Reachable from the sidebar** (`StakeholderSurvey.tsx` + `src/data/14DimensionsQuestions.ts`):
  a flat 1–5 Likert survey, 14 dimensions, 57 questions, no reality-data capture, no
  perception-vs-reality comparison, no root-cause follow-up.
- **Not reachable from anywhere** (`src/components/Assessment14D/*` +
  `src/lib/14d/dimensionMetadata.ts` + `functions/src/14d/*`): a full reality-metric →
  1–10 perception-question → root-cause-followup pipeline, 14 dimensions, 75 metrics —
  this one's dimension names and metric names match
  `DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md`
  (`docs/product-building-master/latest-version/`, marked "Authoritative Reference
  Document", "PRODUCTION READY") **exactly**, 1:1. `AssessmentWizard.tsx` (the entry point
  to this pipeline) is imported by no page, route, or component anywhere in the repo — it
  cannot be reached by a user no matter what they click.
- A dedicated, otherwise-idle Cloud Function trigger chain also exists only for this
  second pipeline (`calculateMetrics` → `runGapAnalysis` → `generateRecommendations`,
  `functions/src/14d/*`), gated on a Firestore document (`schools/{schoolId}/
  assessments14D/{id}`) that nothing in the live app ever writes to or closes — so it's
  deployed but permanently dormant.

**Why this matters for testing:** if you test only what's reachable from the sidebar
(as `03-User-Testing-Guide.md` walks through), you are testing an implementation that
diverges materially from the documented spec — no reality metrics, no perception gap
analysis at the metric level, no root-cause capture, less than half the metric count (57
vs. 75). CLAUDE.md and the reference doc describe this feature as "PRODUCTION READY" and
matching the framework; the live, shipped version does not.

**Fix recommendation:** This is a product decision, not a code fix — get an explicit
answer from whoever owns the roadmap on which pipeline is meant to ship:
(a) wire `AssessmentWizard` into the route currently occupied by `StakeholderSurvey.tsx`
and retire the flat-Likert version, or (b) formally treat the flat-Likert version as the
intended v1 and update/retire the reference doc and the orphaned code so they stop
describing a different product. Either way, the current state — two disagreeing
implementations, only one of which is reachable, and it's not the one matching the
"authoritative" spec — should not persist silently.

**Severity: P0 (product/scope), not a runtime crash.** Flagging as equally urgent to
Defect #1 because it affects what "the feature is working correctly" even means for this
test pass.

---

## Defect #3 — Medium: `generate14DReport` Cloud Function is reachable but broken, and its output is discarded

**Root cause:** "Generate & View Report" (`MultiUserAssessment.tsx:153-195`) calls
`triggerReportGeneration` → the `generate14DReport` callable
(`functions/src/index.ts:303-402`), then fetches and subscribes to its result — but the
component actually rendered, `DiagnosticReport.tsx`, only accepts
`assessmentId/eventName/schoolName/onBack` as props (`DiagnosticReport.tsx:51-56`) and
independently recomputes the whole report client-side via `assembleFullDiagnosticReport` →
`computeDiagnosticReport` (`dimensionScoring.ts:47`). The Cloud Function's `reportData` is
fetched into React state and never passed to anything that renders it.

Separately, even on its own terms the function is broken: it loops `d = 1..14` building
`dimensionId = "D01".."D14"` (line 330-331) and reads `data.answers[dimensionId]`
(line 335) — but real response documents (when/if the write path is fixed per Defect #1)
store answers keyed by the dimension slugs from §3 of the architecture doc (`leadership`,
`academic`, …), never `D01`-style keys. Every lookup misses, so every dimension's
`averageScore` computes to `0` regardless of actual input. It also uses `parseInt` on what
would be decimal averages — a secondary rounding bug, moot given the key mismatch.

**Fix recommendation:** Delete this function and the round-trip entirely (the client-side
engine already does the real work and doesn't need it), or fix the key lookup and actually
wire its output into `DiagnosticReport.tsx` if a server-computed, tamper-evident report is
wanted. Also consider deleting `functions/src/analysis/generateReport.ts`
(`generateDiagnosticReport`) — a third, unused schema/report generator found during review
with no caller in the current 14D UI.

**Severity: Medium.** Wastes a Cloud Function invocation and writes a bogus all-zero
report document on every click, but doesn't affect what the admin actually sees (that
comes from the client-side engine).

---

## Defect #4 — Low / Process: No safety net caught any of the above

- `package.json:15` — `"lint": "echo 'Type checking disabled for deployment'"`. CI runs
  this no-op instead of real type-checking before every deploy.
- Zero automated tests (`*.test.ts(x)`/`*.spec.ts(x)`) touch any file in this feature's
  path (`StakeholderSurvey`, `assessmentService`, `assessmentEventService`,
  `dimensionScoring`, `Assessment14D/*`, `14DimensionsQuestions`). The only e2e spec
  covers an unrelated feature.
- CI (`.github/workflows/test-and-deploy.yml`) would report green through all of the
  defects above.

**Fix recommendation:** Re-enable real type-checking, and add at minimum one integration
test that round-trips an anonymous `StakeholderSurvey` submission through to
`ResponseTracker`'s counter and the rendered `DiagnosticReport` — this single test would
have caught Defect #1 immediately.
