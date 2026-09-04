# Executive Summary — Ranked Findings

Legend: **P0** = production-breaking or silent data loss, affects real users
today. **P1** = real, verified risk that hasn't manifested as a visible
failure yet (often because nothing exercises the broken path). **P2** =
dead code, cleanup, or process/consistency debt — no user-facing symptom.

Each item names which detailed doc has the full file:line evidence.

---

## P0 — Production-breaking or silent data loss

### 1. Every Cloud Function talks to the wrong Firestore database
The app is pinned to a **named** Firestore database
(`ai-studio-dishadiagnostice-...`, set in `.firebaserc`/`firebase.json`,
correctly consumed by the client SDK at `src/lib/firebase.ts:23`). Every
single Cloud Function calls the bare `admin.firestore()` with no database
ID — which always resolves to the **`(default)`** database. This is true
across all ~20 files in `functions/src` (confirmed by grep, zero uses of
the named-database-aware `getFirestore(app, databaseId)` API anywhere in
`functions/src`). Concretely, this kills the First Opinion v3 real-time
recalculation trigger chain (`onChallengeResponseWrite` fires on the
correct path but reads from the wrong DB, finds nothing, silently no-ops)
and is a second, independent reason `generate14DReport` can never produce
real data. → `02-Cloud-Functions-Audit.md` §"Top-line finding", `03-Firestore-Database-Audit.md` top section.

### 2. `generate14DReport` is triggered by the UI but cannot ever work — three independent, stacked reasons
This was already flagged as broken (D01-D14 key mismatch) in the original
14D audit. The full-stack review found it's broken on *three separate
axes simultaneously*: (a) it reads `schools/{schoolId}/assessments/{id}/responses`
(nested), but the only real respondent write path is the flat
`assessments/{id}/responses` — the nested path is written only by
`src/lib/assessmentService.ts`'s `saveAssessmentResponse`/`createAssessment`,
which are **never called anywhere in `src/`** (dead code); (b) even if that
path had data, `admin.firestore()` would read the wrong database (finding
#1); (c) even if it found data, the `D01`-style key lookup never matches
the real answer keys. **Net effect: this function has thrown or returned
empty every single time it's ever been invoked in production.** It doesn't
affect what users see (the client independently recomputes the real
report), but every "Generate & View Report" click wastes a function
invocation and, per finding #7, its failure is invisible to CI. → `02-Cloud-Functions-Audit.md`, `03-Firestore-Database-Audit.md` §2.

### 3. The entire "First Opinion Engine v3" subsystem is fully built and 100% unreachable
9 Cloud Functions (`submitChallengeResponse`, `submitBatchChallengeResponses`,
`deleteChallengeResponse`, `syncMultipliers`, `recalculateCycleScores`,
`batchRecalculateAllCycles`, `generateFirstOpinionReport`,
`detectEarlyWarnings`, plus the `onChallengeResponseWrite`/`onMultiplierWrite`
triggers), its own Firestore schema (`assessmentCycles`/`challengeResponses`/
`multipliers`), and ~6 React components (`ChallengeResponseForm`,
`MultiplierSync`, `FirstOpinionResultsDashboard`, etc.) are all fully coded
and even have their own security-rules block — but the page that wires them
together, `src/pages/FirstOpinionEngine.tsx`, is **never imported by
`App.tsx` or any routed component** (confirmed by repo-wide grep, zero
references outside the file itself). The live First Opinion feature runs
on a completely different, simpler `checkups`-based system instead. This
is the same "two competing implementations, only one reachable" pattern
found and fixed in 14D — just never fixed here. → `02-Cloud-Functions-Audit.md` §0, `03-Firestore-Database-Audit.md` §5, `05-First-Opinion-and-Reverse-Simulation-Audit.md` §1.

### 4. Reverse Simulation's Cloud Functions save results under the wrong ID space
All 6 Reverse Simulation Cloud Functions (`goalSetting.ts`,
`calculations.ts`, `feasibility.ts`, `actionMapping.ts`, `allocation.ts`,
`timeline.ts`) persist their output to
`schools/{userId}/reverseSimulations/{simulationId}/...` — keyed by the
caller's **Firebase Auth UID**, not the actual school ID (`schoolId` is
computed correctly as a *field value* inside the doc in one file, but the
document's own Firestore *path* still uses `userId` in all six). Nothing
in the app ever reads this data back today, so it's currently harmless —
but it means the data model is wrong at the source, and any future "view
past simulations for this school" feature would silently return nothing
or the wrong school's data. → `05-First-Opinion-and-Reverse-Simulation-Audit.md` §2, `03-Firestore-Database-Audit.md` §2.

### 5. The respondent-facing 14D survey has zero draft persistence
`src/pages/StakeholderSurvey.tsx` — the actual page a teacher/parent/student
fills out from a shared link — holds all wizard state (`currentStep`,
`currentDimensionIndex`, `responses`, `rootCauses`) in plain `useState`
with no `localStorage`/`sessionStorage` anywhere and exactly one Firestore
write, at final submit. **Refreshing the page, losing connectivity, or
navigating away at any point before the final "Submit Survey" click
discards 100% of the respondent's answers**, with no autosave and no
warning. (A `beforeunload` guard and autosave concept exist in the
*orphaned* `Assessment14D` wizard tree, but that code is never rendered —
see P2 #14.) → `04-Frontend-Architecture-Audit.md` §1.

### 6. Parts of the Dashboard silently show mock data instead of real data
`src/store.ts`'s `fetchData()` fetches 8 legacy top-level collections
(`domains`, `dimensions`, `gaps`, `simulations`, `students`, `staff`,
`attendance`, `communications`) on every login. The code's own comment
acknowledges several of these are denied by the deployed Firestore rules
(confirmed — no rule exists for them at all, default-deny applies) and
falls back to hardcoded `MOCK_STUDENTS`/`MOCK_STAFF`/etc. **This means any
Dashboard widget still reading this data is showing fabricated numbers to
real users with no visual indication it isn't real** — a genuine trust
issue if any such widget is still visible in the live Dashboard UI (not
independently confirmed in this pass which specific widgets are affected
— flagged as a follow-up). → `03-Firestore-Database-Audit.md` §3(a), `04-Frontend-Architecture-Audit.md` §2(a).

---

## P1 — Real, verified risk not yet visibly manifesting

### 7. CI/CD lets Cloud Functions deploy failures pass silently
Every Cloud-Functions-related step in `.github/workflows/test-and-deploy.yml`
(`tsc --noEmit`, the "delete orphaned functions" step, both the Firebase CLI
deploy and the manual `gcloud` deploy for `asia-south1`) has
`continue-on-error: true`. Only the Firestore rules/indexes and Hosting
deploy steps can actually fail the build. The pipeline then unconditionally
prints "✅ Cloud Functions deployed (3 functions)" regardless of what
actually happened. **A completely broken Cloud Functions deploy would ship
green.** Separately, the "delete orphaned functions" list
(`test-and-deploy.yml:115-127`) is backwards — it lists functions that are
still actively exported from `functions/src/index.ts` today, so it forces
a delete-and-redeploy of live functions rather than cleaning up anything
actually orphaned. → `02-Cloud-Functions-Audit.md` §4.

### 8. Custom-claims-gated Firestore rules are permanently unsatisfiable
`setCustomUserClaims` is never called anywhere in `functions/src` or
`src/` (confirmed by repo-wide grep — the only hits are in a docs example
file). Every rule gated on `isAdmin()`/`isSchoolAdmin()`/`isTeacher()`/
`isParent()`/`isStudent()` without an `OR request.auth != null` fallback is
permanently denied for every real user, including the app's own admin
account. This has already caused one confirmed historical outage (the
First Opinion checkup save, documented and fixed in-file), but several
other rules still have this exact defect and haven't needed fixing yet
only because nothing currently exercises them: `schools/{id}` create/
update/delete, `assessmentCycles` create/update/delete (moot — dead
feature), `users/{id}` delete (real gap — no user can ever be deleted via
client rules), `systemSettings` (nobody can ever read or write it), plus
one rule (`analytics` create/update) that's inverted — it requires the
caller to be **unauthenticated**, the opposite of every other rule in the
file, which is very likely a typo rather than intentional. → `03-Firestore-Database-Audit.md` §3(c).

### 9. Missing Firestore composite indexes for at least 6 live multi-field queries
Only 3 composite indexes are defined in `firestore.indexes.json`, and 2 of
those 3 don't even match any query in the live code (they target the dead
First Opinion v3 schema, and even there the fields don't match what the
code actually queries). Meanwhile at least 6 **live** queries need a
composite index and have none defined in source control:
`reportService.ts` (×2), `auditService.ts` (×3), plus
`multi-respondent-service.ts` and `phase5/surveyService.ts`. If matching
indexes weren't created out-of-band via the Firebase console, these throw
a "query requires an index" error at runtime; if they *were* created via
the console, they're undocumented and at risk of being silently dropped
the next time indexes are deployed from this file. `reportService.ts` and
`auditService.ts` are both live, used directly by the 14D flow — the
highest-priority pair to check. → `03-Firestore-Database-Audit.md` §4.

### 10. No compile-time safety net anywhere in the pipeline
`tsconfig.json`: `"strict": false`, `"noImplicitAny": false`. `package.json`'s
`"lint"` script is a no-op (`echo '...'`) that always exits 0, and
`"build-no-lint"` is byte-identical to `"build"` — lint was fully stripped
from the pipeline, not just skipped for one command. Combined with P1 #7
(deploy failures also silenced), there is effectively no automated check
in this codebase that would catch a broken build before it ships, beyond
the (currently sparse — see P2 #22, #23) test suite. This is very plausibly
the single biggest reason findings like #1-#6 above accumulated undetected.
→ `04-Frontend-Architecture-Audit.md` §3.

### 11. No route-level code-splitting
`App.tsx` statically imports every top-level page (all 8 views plus
`Login`/`LandingPage`/`PublicSurvey`/`StakeholderSurvey`). No
`chunkSizeWarningLimit`/`manualChunks` configuration in `vite.config.ts`.
The whole app ships as one JS bundle regardless of which view a user
actually opens. (A handful of heavy libraries — jsPDF, html2canvas,
pdfjs-dist — *are* dynamically imported at point of use, which helps, but
that's not route-splitting.) → `04-Frontend-Architecture-Audit.md` §3.

### 12. No consistent error-surfacing strategy
A global `ErrorBoundary` exists and is correctly mounted at the app root
(`src/main.tsx`), catching render-time crashes with a generic "Something
went wrong" + reload button. But the dominant pattern across `src/lib`
(109 catch blocks across 25 files, sampled representatively) is silent
`console.error` with no user feedback at all; a smaller set does
log-then-rethrow (helpful only if every caller actually renders the
error — not verified end-to-end); and at least one flow uses a blocking
native `alert()`. There's no toast/notification system and no single
deliberate strategy. → `04-Frontend-Architecture-Audit.md` §5.

### 13. Region mismatch for 3 First Opinion v3 Cloud Functions
`syncMultipliers`, `batchRecalculateAllCycles`, and `recalculateCycleScores`
deploy to `asia-south1`; the client's Functions SDK instance
(`src/lib/firebase.ts:25`) never sets a region and defaults to
`us-central1`. Even setting aside that these functions are unreachable
(P0 #3), a call to them from the live client would target the wrong
regional endpoint. → `02-Cloud-Functions-Audit.md` §4.

---

## P2 — Dead code, cleanup, and consistency debt (no live user-facing symptom)

14. **Three competing 14D Firestore schemas** for "assessment responses" — the live flat `assessments/{id}/responses`, plus two dead ones (`schools/{schoolId}/assessments/{id}/responses` via `assessmentService.ts`, and `schools/{schoolId}/assessments14D/{id}/responses` via the orphaned `Assessment14D` wizard + `responseService14D.ts`). The second dead schema is also independently read by a legacy Phase4 dashboard hook, which as a result shows permanently empty widgets.
15. **At least 6 duplicate/dead report-generator Cloud Functions** across features with zero callers: `generateDiagnosticReport`, `analyzeDimensions`, `analyzeTrends`, `generateFirstOpinionReport`, `analyzeCheckup`, `runSimulation`.
16. **Duplicate function export**: `recalculateCycleScores` is defined twice (`batch.ts` and `recalculateOnDemand.ts`, different admin-claim checks) — only one is actually exported from `index.ts`; confusing for future maintainers who might edit the wrong copy.
17. **Three different admin-role-check implementations** across Cloud Functions (`context.auth.token.role`, `context.auth.token.admin`, a Firestore `users/{uid}.role` lookup) with no shared helper — a latent authorization-drift risk if any of this currently-unreachable code is ever wired up.
18. **Dead/mismatched Firestore rules**: `challengeCatalog` (singular, in rules) vs. `challengesCatalog` (plural, in code) naming drift; `dimensionsCatalog`/`challengesCatalog` rules whose only writer (`firebaseInit.ts`) is never imported by anything; a `schools/{id}/simulations/{id}/results` rule with no live writer at that exact path.
19. **6 of 9 fields in the global Zustand store's `fetchData()`** (`dimensions`, `gaps`, `simulations`, `students`, `staff`, `attendance` + their mutation actions) have zero consumers anywhere in the app — pure wasted Firestore reads on every login, no product value today.
20. **`package.json` dependency issues**: `vite` listed in both `dependencies` and `devDependencies`; `react-table` v7 present alongside `@tanstack/react-table` v8 with zero imports of the old one; `firebase-admin`/`firebase-functions` listed in the frontend's `package.json` (they belong only in `functions/package.json`, and aren't imported anywhere in `src/`); `react@^19` paired with `react-is@^18` (version-mismatched pair).
21. **Two separate deploy workflows both deploy Hosting on the same push trigger** (`test-and-deploy.yml` and `automated-ui-deployment.yml`) — a minor race-condition risk, and the second one's "success" report also prints hardcoded claims not actually verified by any check in that workflow.
22. **Reverse Simulation's `__tests__` files are placeholder smoke tests**, not real integration tests — e.g. literally `expect(true).toBe(true)`, and one test renders a component with a prop (`onNext`) that doesn't even exist on the real component's interface. They would not have caught the real Firestore-path bug in finding #4, despite superficially looking like coverage for exactly that kind of issue.
23. **The 14D Assessment feature — the flagship feature — has no test coverage at all** at the component or integration level, unlike Reverse Simulation (which has real RTL component tests, if shallow ones) and First Opinion (which has solid pure-logic unit tests).

---

## Recommended fix order

Given everything above was found via static analysis in one review pass
(none of it has been fixed yet, unlike the 14D-specific defects which
were fixed and deployed earlier this session), a sensible sequence:

1. **Fix the Cloud Functions database mismatch** (P0 #1) — one targeted
   change (`getFirestore(admin.app(), DB_ID)` instead of bare
   `admin.firestore()`) that unblocks or clarifies the true status of
   several other findings at once (#2, #3's trigger chain, #4's write
   target).
2. **Decide the fate of First Opinion v3** (P0 #3) the same way Defect #2
   was resolved for 14D: either wire it in, or formally retire it and
   delete the dead code/functions/rules. Either answer resolves a large
   fraction of the P0/P1/P2 list above (findings #2 partially, #3, #7's
   "orphaned functions" confusion, #13, #15 partially, #16, #17 partially).
3. **Fix Reverse Simulation's `userId`-vs-`schoolId` write path** (P0 #4)
   — small, contained change, prevents a bug from being inherited by
   whatever "view past simulations" feature gets built next.
4. **Add draft persistence to `StakeholderSurvey.tsx`** (P0 #5) — directly
   protects real respondent data, the same class of concern as the
   original Defect #1 fix.
5. **Re-enable real type-checking and lint in CI, and stop silencing
   Cloud Functions deploy failures** (P1 #7, #10) — this is what should
   have caught most of the above before it shipped; fixing it doesn't
   remove existing debt but stops new debt of the same shape.
6. Everything else (P1 #8/#9/#11/#12/#13, all of P2) can be scheduled as
   ordinary backlog work — none of it is actively misleading a real user
   today the way #1-#6 are.
