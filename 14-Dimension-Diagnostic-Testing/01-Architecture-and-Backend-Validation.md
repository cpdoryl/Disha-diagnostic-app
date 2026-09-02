# 14D Diagnostic Assessment — Architecture Map

Verified by direct code reading on branch `claude/14-dimension-diagnostic-testing-qotvlt`,
commit `060f09d`, 2026-09-02. Cross-checked by an independent full-repo scan; both passes
agree on the findings below (the scan additionally caught the deployed-rules-file mixup
in §7, corrected here).

## 1. Entry points / routing

- Sidebar item "14D Diagnostic Assessment" (`AppLayout.tsx:48`) sets
  `currentView = '14D_ASSESSMENT'`. `App.tsx:119-120` renders `MultiUserAssessmentPage`
  (`src/pages/MultiUserAssessment.tsx`) — the **admin-facing** console, requires login.
- The **respondent-facing** public survey is matched directly on `window.location.pathname`
  *before* the auth gate (`App.tsx:37-41`): `/survey/:assessmentId/:stakeholderType` →
  `src/pages/StakeholderSurvey.tsx`. No login — this is the page real stakeholders open.
- A second, older public-survey mechanism exists (`?survey=&aid=` → `PublicSurvey`
  component) — not part of the current 14D flow.

## 2. Two competing implementations of "the survey" — only one is reachable

This is the single most important architectural fact for testing this feature.

### 2a. Live / reachable: `StakeholderSurvey.tsx`
Flat Likert survey: `welcome → info → survey → summary → confirmation | error`. One
dimension per screen, every question a plain 1–5 "Strongly Disagree ↔ Strongly Agree"
scale (`StakeholderSurvey.tsx:611-641`). No reality-data input, no perception-vs-reality
split, no root-cause follow-up.

### 2b. Built but **orphaned / unreachable**: `src/components/Assessment14D/*`
`AssessmentWizard.tsx`, `DimensionStep.tsx`, `MetricCard.tsx`, `PerceptionScale.tsx`,
`RootCauseInput.tsx`, `StakeholderSelector.tsx`, `ReviewSubmit.tsx`, `WizardHeader.tsx`
implement the *actually spec-compliant* flow: for every metric, a "Reality" data input
(`MetricCard`), then a 1–10 perception rating (`PerceptionScale`, disabled until reality is
filled), then a conditional root-cause free-text follow-up (`RootCauseInput`) — matching
`DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md`'s 1:1 reality-metric ↔ perception-question
design exactly (dimension names and metric names in `src/lib/14d/dimensionMetadata.ts`
line up 1:1 with the reference doc).

**`AssessmentWizard` is not imported by any page, route, or other component anywhere in
the repo.** It is fully built, dead code. `ValidationFeedback.tsx` is dead within this
already-dead subtree (imported by nothing, not even by its siblings).

**Testing implication:** don't test `Assessment14D/*` expecting to find it in the running
app — you can't reach it from the sidebar or any link. If it's supposed to be the real
feature, that itself is the finding to raise with the product owner (see Defect #2).

## 3. Data model — three disagreeing "14 dimensions" definitions

| Source | Used by | Structure |
|---|---|---|
| `src/data/14DimensionsQuestions.ts` (`FOURTEEN_DIMENSIONS`) | **Live**: `StakeholderSurvey.tsx`, `dimensionScoring.ts`, `simulateResponses.ts` | 14 dims, ids `leadership, academic, infrastructure, student_wellbeing, staff_development, community, innovation, finance, quality, inclusivity, curriculum, satisfaction, performance, culture` — **57 Likert (1–5) questions total**, no reality/perception split. |
| `src/lib/14d/dimensionMetadata.ts` + `functions/src/14d/*` | **Orphaned** wizard (§2b) — matches the reference doc verbatim | 14 dims (different names: Academic Performance & Learning Outcomes, Curriculum & Pedagogy Quality, Teacher Quality/Development/Retention, …), **75 reality metrics total**, each with one matched 1–10 perception question + root-cause follow-up. |
| `functions/src/index.ts` `initializeDISHADatabase` seed data | Only itself — seeds `dimensions_catalog`/`dimensionsCatalog`, read by nothing in the 14D UI | `D01`–`D14`, e.g. "Academic Reputation & Rigour", "Teacher Welfare & Development" — a third naming scheme. |

`DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md` lives at
`docs/product-building-master/latest-version/` (not repo root). It documents row 2 above
— i.e. **the "authoritative" reference doc describes the orphaned wizard, not the feature
that's actually reachable from the sidebar.** See Defect #2.

## 4. Firestore collections in use — write path vs. every read path disagree

| What | File:line | Path | Field names |
|---|---|---|---|
| Event config, lock state | `assessmentEventService.ts:61,124,157,169,180,191` | `assessments/{id}` (top-level) | `status`, `expectedRespondents`, … |
| Live respondent counter (admin dashboard) | `ResponseTracker.tsx:45` | `assessments/{id}/responses` (top-level, `onSnapshot`) | expects `stakeholderType` |
| "Simulate" test-data button | `simulateResponses.ts:94,122` | `assessments/{id}/responses` (top-level) | writes `stakeholderType`, nested `responses[dim][q]` |
| Actual report engine rendered on screen | `dimensionScoring.ts:47-78` | reads `assessments/{id}/responses` (top-level) | expects `stakeholderType` + nested `responses[dim][q]` |
| Objective operational data | `objectiveDataService.ts:45,147` | `assessments/{eventId}/objectiveData` (top-level) | — |
| **Real survey response save** — `saveAssessmentResponse`, the only function `StakeholderSurvey.tsx` actually calls to persist a response | `assessmentService.ts:130-171` | `schools/{schoolId}/assessments/{assessmentId}/responses/{id}` (**nested**, different tree) | writes `respondentType` (not `stakeholderType`) + flat `answers[dim] = avg` (not nested `responses[dim][q]`) |
| Cloud Function `generate14DReport` | `functions/src/index.ts:303-402` | reads the same nested `schools/{schoolId}/assessments/{assessmentId}/responses` | reads `answers['D01'..'D14']` — doesn't match real keys either (see Defect #3) |

**Net effect:** the one and only write a real respondent triggers goes to a Firestore
location and field shape that literally nothing else in the app reads. See Defect #1 for
why the write doesn't even succeed in the first place.

## 5. Cloud Functions (`functions/src/index.ts` unless noted; Node 20, Firebase Functions v6)

| Function | Trigger | Purpose | Status |
|---|---|---|---|
| `generate14DReport` | `onCall` | Aggregates nested-path responses into `schools/{schoolId}/reports/*` | Reachable, but broken (Defect #3) and its output is never rendered — `DiagnosticReport.tsx` ignores the fetched `reportData` and recomputes everything itself via `dimensionScoring.ts`. |
| `calculateMetrics` (`functions/src/14d/calculateMetrics.ts:66`) | Firestore `onUpdate` trigger on `schools/{schoolId}/assessments14D/{id}` when `status → 'CLOSED'` | Aggregates reality-vs-perception gap scores for the orphaned wizard's schema | **Dormant**: nothing in the live app ever writes to `assessments14D/{id}` or sets that status, so this trigger never fires in production. |
| `runGapAnalysis`, `generateRecommendations` (`functions/src/14d/*`) | `onCall` | Consume `calculateMetrics`' output | Reachable in principle, but have no real data to act on (upstream trigger never fires). |
| `generateDiagnosticReport` (`functions/src/analysis/generateReport.ts:27`) | `onCall` | Yet another schema again: `schools/{schoolId}/assessmentCycles/{cycleId}` | Belongs to the separate First Opinion Engine feature; not called anywhere in the 14D UI. |
| `initializeDISHADatabase`, `getDeploymentStatus`, `analyzeCheckup`, `runSimulation` | `onCall` | Other DISHA features | Out of scope. |

## 6. Reference document cross-check

`DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md` (677 lines, "PRODUCTION READY", dated
August 2026): 14 dimensions, **75 reality metrics total** (per-dimension counts: 6, 5, 6,
5, 5, 5, 5, 7, 5, 5, 5, 6, 5, 5), each with one matched 1–10 perception question and a
root-cause follow-up, plus a documented raw-data-source/fallback for every metric. This
spec is implemented by the orphaned `Assessment14D`/`functions/src/14d` pipeline (§2b/§5),
**not** by the live, sidebar-reachable `StakeholderSurvey.tsx` flow, which has no reality
metrics and no root-cause capture at all.

## 7. Firestore security rules — **which file is actually deployed matters**

`firebase.json:94`: `"rules": "firestore-security-rules.txt"`. **This is the deployed
rules file.** A second file, `firestore.rules`, also exists in the repo but is **not**
referenced by `firebase.json` and is not live — ignore it for testing purposes.

Relevant excerpt from the deployed `firestore-security-rules.txt`:

```
match /schools/{schoolId} {
  match /assessments/{assessmentId} {
    allow read: if true;
    allow create: if isSchoolAdmin(schoolId) && ...   // custom-claim based
    match /responses/{responseId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.assessmentId == assessmentId
        && request.resource.data.schoolId == schoolId;
      ...
    }
  }
}

// Separate top-level collection, explicitly commented as intentionally open:
// "backs the 14D Multi-User Assessment / Events feature, where respondents
//  submit without authentication, so access stays open like it was before."
match /assessments/{document=**} {
  allow read, write: if true;
}
```

- The **nested** path (`schools/{schoolId}/assessments/{assessmentId}/responses`) — which
  is exactly what `saveAssessmentResponse` writes to — requires `request.auth != null`
  **and** a `request.resource.data.assessmentId` field equal to the URL's assessmentId.
  The real write (§4) supplies **neither**: `StakeholderSurvey.tsx` is rendered with zero
  authentication by design (it bypasses the login gate in `App.tsx`), and the document
  `saveAssessmentResponse` builds (`assessmentService.ts:140-150`) never includes an
  `assessmentId` field at all. **This write is rejected by the security rules on every
  attempt.** See Defect #1.
- The **top-level** `assessments/{document=**}` tree is deliberately wide open (comment in
  the rules file itself confirms this is intentional, for anonymous respondent access) —
  this is what `ResponseTracker`, `computeDiagnosticReport`, and `simulateResponses` all
  correctly use.
- Custom-claim-based helpers (`isSchoolAdmin`, `isTeacher`, etc.) are noted in-file
  (line 74-87) as **permanently unsatisfiable** — this app never calls
  `setCustomUserClaims` anywhere, so any rule gated on them always denies every real user,
  admin included. Several other collections in this same file were already relaxed to
  "any signed-in user" for this reason (per in-file dated comments); the nested
  `assessments/{id}` doc's own `create` rule (`isSchoolAdmin(schoolId)`, line 52) has the
  same defect but wasn't relaxed — irrelevant to end-respondent testing since the survey
  page isn't authenticated in the first place, but relevant if you test admin-side
  assessment-event creation against this nested path specifically.

## 8. CI / build

- `.github/workflows/test-and-deploy.yml`: `npm run test:run` (vitest), `npm run lint`,
  `vite build`, then deploys Functions, Firestore rules/indexes, and Hosting.
- **`lint` is a no-op**: `package.json:15` → `"lint": "echo 'Type checking disabled for
  deployment'"`. No TypeScript type-checking gates CI.
- **Zero automated test coverage of this feature**: repo-wide search for `*.test.ts(x)`/
  `*.spec.ts(x)` touching `Assessment14D`, `MultiUserAssessment`, `StakeholderSurvey`,
  `14DimensionsQuestions`, `assessmentEventService`, `assessmentService`, or
  `dimensionScoring` returns nothing. The only e2e spec (`e2e/tests/workflow.spec.ts`,
  Playwright) smoke-tests the unrelated Reverse Simulation Engine. A pipeline in this
  state would report green even if the entire 14D response pipeline were broken — which,
  per Defect #1, it currently is.
