# First Opinion Engine & Reverse Simulation Engine — End-to-End Audit

The two main features not covered by the original 14D-focused audit, traced the same way: full user flow, exact Firestore paths touched, and any Cloud Functions called.

## 0. Routing ground truth

`src/App.tsx` renders `FirstOpinionPage` for `FIRST_OPINION` and `ReverseSimulationEngine` for `REVERSE_SIMULATION` — no react-router, a `currentView` switch.

There is a **second, fully-built "First Opinion Engine v3"** at `src/pages/FirstOpinionEngine.tsx` (imports `ChallengeResponseForm`, `FirstOpinionResultsDashboard`, `TrendAnalysis`, `MultiplierSync`, `EarlyWarningDashboard`) that is never imported by `App.tsx` and has zero route/reference anywhere in `src/` outside its own file. It is dead code — see `02-Cloud-Functions-Audit.md` §0 and `03-Firestore-Database-Audit.md` §5 for the full picture; this file focuses on the *live* path.

## 1. First Opinion Engine (live path: `src/pages/FirstOpinionPage.tsx`)

### Flow traced
1. User fills challenge selection + screening answers + uploads a CSV → `analyzeUploadedFile` parses it client-side via `FileAnalyzer.analyzeFile`, sets `realInsights` via `generateRealInsights` — runs before submit.
2. Click "Analyze & Get First Opinion" → `handleSaveCheckupToFirestore`.
3. **Write #1**: `saveCheckupToFirestore` → `src/lib/checkupService.ts` → `setDoc` at `schools/{schoolId}/checkups/{checkupId}`.
4. Immediately after: `runLocalDiagnosticCalculation` computes `DISHAScoreCalculator.calculateCompleteScore` **entirely client-side**, sets `dishaScore` state.
5. **Write #2**: `saveCheckupAnalysis` → `setDoc` at `schools/{schoolId}/checkups/{checkupId}/analysis/current`.
6. Results screen renders directly from React state — no re-fetch needed for the just-submitted report.
7. **Read (Past Reports)**: `loadPastCheckup` → `getCheckupAnalysisOnce` → `getDoc` at the **same** path written in step 5.

**Verdict: CONSISTENT.** Write and read paths are the exact same Firestore path, confirmed both by tracing the code and by the code's own inline comments documenting this was fixed by a prior audit.

### Cloud Function `analyzeCheckup` — is its output displayed?
`functions/src/index.ts`'s `analyzeCheckup` is a callable. Zero matches for `httpsCallable(functions, 'analyzeCheckup')` anywhere in `src/`. Deployed but never invoked — the DISHA Score always comes from the local calculation. **Matches the pattern flagged elsewhere; already effectively handled by a prior fix** (the code even removed a 30s dead-poll that used to block on this function — comment in-file explains why). Not a new bug, but confirms the pattern recurs.

### Security rules — do they actually permit these writes?
`firestore-security-rules.txt` is the deployed file (confirmed via `firebase.json`).
- Checkup `create` rule requires `request.auth != null && checkupType == 'FirstOpinion' && status == 'SUBMITTED'` — the write code sets both fields exactly, and `FirstOpinionPage` is only reachable post-auth. **Satisfied.**
- `analysis/{analysisId}` create/update requires `request.auth != null` — satisfied.
- `checkupCounters/{dateKey}` read/write requires `request.auth != null` — matches the reference-number-generation transaction.
- The rules file's own comment documents a historical "always failed with permission-denied" bug, fixed by relaxing the custom-claims-gated `isSchoolAdmin()`/`isAdmin()` checks down to plain `request.auth != null`.

**Verdict: CONFIRMED STILL FIXED** — independently re-derived by matching current write-code fields against current rule predicates, not by trusting the historical comment. Residual risk: `isSchoolAdmin()`/`isAdmin()` remain unsatisfiable dead functions (custom claims are never set anywhere) for every *other* rule in the file still depending on them — see `03-Firestore-Database-Audit.md` §3(c).

### Dead/orphaned code found in this file
- `runFirstOpinionDiagnostic` is defined in `FirstOpinionPage.tsx` but has zero references anywhere else in the file — not bound to any click handler, not exported. Harmless noise.
- **The entire "First Opinion Engine v3" stack is dead code, not just unreachable UI.** Live model: `CheckupData`/`CheckupAnalysis` at `schools/{schoolId}/checkups/{checkupId}`. Orphaned v3 model: `assessmentCycles/{cycleId}/challengeResponses/{responseId}`, backed by its own Cloud Functions and its own rules block (labeled "FIRST OPINION ENGINE v3 COLLECTIONS" in the rules file). The two models share the "First Opinion" name but are structurally incompatible (`checkupId`-scoped vs. `cycleId`+`responderId`-scoped) and neither reads the other's data. Since v3 is unrouted this isn't a live data-vanishing bug today, but it means the deployed security-rules file carries a whole security surface for a feature nobody can currently reach — worth a cleanup/removal decision.

## 2. Reverse Simulation Engine (`src/pages/ReverseSimulationEngine.tsx`)

### What it computes
A 6-step wizard (`GoalSettingWizard`, `CalculationDashboard`, `FeasibilityAssessment`, `ActionMappingUI`, `ResourceAllocationView`, `TimelineTracker`), each calling one Cloud Function through `src/hooks/useReverseSimulation.ts`.

### Is `runSimulation` reachable?
`functions/src/index.ts` exports a callable named `runSimulation` (a crude "investment/₹100k → +1 point" projection reading `schools/{schoolId}/reports`). The **only** occurrence of `runSimulation` anywhere in `src/` or `functions/src/` is its own declaration. It's deployed but never called — the dead-code twin of `analyzeCheckup`.

The functions actually called by the live UI are a completely different, newer set: `setGoalSetting`, `performReverseCalculation`, `analyzeFeasibility`, `generateActionPlan`, `allocateResources`, `generateTimeline` — all correctly deployed and reachable.

### Is the Cloud Function output what's displayed?
Yes — confirmed for `GoalSettingWizard.tsx`: it calls `setGoalSetting(...)`, stores the raw response in local state, renders `result.challengeLevel`/`result.targetBand`/`result.createdAt` directly. Grepped all 6 components for `onSnapshot`/`getDoc`/`getDocs`/`collection(` — zero matches. **None of the 6 steps ever reads Firestore**; every one renders straight from its own callable's return value. So on-screen, there's no read/write mismatch possible — but see the persistence bug below.

### Firestore write-path bug (new finding)
All 6 Cloud Functions persist their result under a "school" path keyed by **the caller's Firebase Auth UID, not the actual school ID**:
- `goalSetting.ts`: `.collection('schools').doc(userId).collection('reverseSimulations').doc(...).collection('goalSetting').doc('current')` — `userId = context.auth.uid`, not `data.schoolId`.
- Identical pattern in `calculations.ts`, `feasibility.ts`, `actionMapping.ts`, `allocation.ts`, `timeline.ts` — all six use `.doc(userId)`.
- `goalSetting.ts` even computes `schoolId: data.schoolId || userId` correctly as a *field value* inside the saved document, but the document's own Firestore **path** ignores that and always uses `userId`.
- Nothing in the client ever passes a real `schoolId` into these calls in the first place — the request types in `useReverseSimulation.ts` have no `schoolId` field at all, and `ReverseSimulationEngine.tsx` never reads `activeSchool.id` into the payload.
- Nothing anywhere in `src/` or `functions/src/` ever reads back from `reverseSimulations` (grepped both trees — only the 6 write sites). So today this is write-only, orphaned data: harmless to the current UI (which never re-reads it) but silently wrong, and would break any future "resume a saved simulation" or "list past simulations for this school" feature immediately.

**Verdict: MISMATCHED (latent).** No visible symptom today; would surface the moment a "past simulations" view is built.

### Security rules for this path
No rule at all matches `schools/{schoolId}/reverseSimulations/**` (zero occurrences in the rules file). Doesn't matter in practice because all 6 writes happen server-side via the Admin SDK (which bypasses security rules entirely) — no `permission-denied` risk, just an unreachable/unaddressable data model.

### Does it depend on 14D or First Opinion data?
No. `ReverseSimulationEngine.tsx` initializes `dimensions` to hardcoded defaults (`D01: 50, D02: 55, ...`) and `currentHealth`/`targetHealth` to `50`/`80` — no `useEffect`/`getDoc`/`onSnapshot` anywhere fetches a prior 14D score or First Opinion `dishaScore`. The `D01`-`D14` keys visually resemble 14D's dimension IDs, which could mislead a reviewer into assuming integration, but there is no code path connecting them. All 6 backing Cloud Functions are pure functions of their payload — zero Firestore reads.

**Verdict**: no dependency exists to degrade gracefully or not — it's simply absent. (One unverified, low-priority thread: the *dead* `runSimulation` function does read `schools/{schoolId}/reports` as a baseline — i.e. the abandoned implementation had the cross-feature dependency the live one lacks. Not traced further since it's unreachable dead code.)

### Are the `__tests__` files real integration tests?
No — confirmed by reading them directly:
- `Integration.test.tsx` (91 lines) — every test is a framework smoke-check with no reference to any Reverse Simulation component, hook, or Firestore/Cloud-Function call (e.g. `expect(true).toBe(true)`, `expect(1+1).toBe(2)`). Its own header comment says so: *"Smoke tests... Component files exist but may not be fully implemented yet."*
- `GoalSettingWizard.test.tsx` — renders `<GoalSettingWizard onNext={mockOnNext} />`, but the real component's props are `{ simulationId, onSuccess, onError }` — `onNext` isn't even a real prop. Every assertion is "renders without throwing" — no form submission is simulated, `useReverseSimulation`/`httpsCallable` is never mocked or invoked, no assertion touches a Firestore path.

**Verdict: these tests would not have caught the `userId`-vs-`schoolId` Firestore path bug above**, or any real Firestore-path mismatch — they never exercise the Firestore/Cloud-Function integration at all, only that the component mounts without crashing on default props.

## 3. Cross-feature dependencies

**No live cross-feature data dependency found.** Each of the three main features owns and reads only its own collection: 14D → top-level `assessments/{id}`; First Opinion (live) → `schools/{schoolId}/checkups/{id}`; Reverse Simulation → `schools/{userId}/reverseSimulations/...` (write-only, unread by anything including itself). The one place a cross-feature read would make architectural sense — Reverse Simulation seeding its starting health index from the school's latest 14D or First Opinion score — does not exist in code; it's a hardcoded default.

## Summary table

| # | Item | Verdict |
|---|---|---|
| 1 | First Opinion checkup save → results display | Consistent |
| 2 | First Opinion analysis save → past-report reopen | Consistent |
| 3 | `analyzeCheckup` CF vs. displayed score | Confirmed already-fixed dead CF, not a live bug |
| 4 | Firestore rules vs. First Opinion write code | Consistent / confirmed still fixed |
| 5 | First Opinion v3 vs. live checkup model | Orphaned competing data model — unreachable, real drift |
| 6 | `runSimulation` CF vs. live Reverse Simulation UI | Dead CF, confirmed unreachable |
| 7 | 6 live Reverse Simulation CFs → displayed result | Consistent (no read exists to mismatch) |
| 8 | 6 live Reverse Simulation CFs → Firestore persistence path | Mismatched/broken (latent — `userId` instead of `schoolId`) |
| 9 | Reverse Simulation dependency on 14D/First Opinion | None exists (not degraded gracefully — simply absent) |
| 10 | Reverse Simulation `__tests__` as integration coverage | Not real integration tests — would not catch Firestore-path bugs |
| 11 | Cross-feature data sharing among all three features | None found in live paths |
