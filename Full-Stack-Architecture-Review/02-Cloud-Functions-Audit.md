# Cloud Functions Layer Audit

Scope: `functions/src/` (29 exported Cloud Functions across 8 files) cross-referenced against every invocation site in `src/`, both GitHub Actions workflows, and the app's routing tree.

## 0. Headline finding

**The entire "First Opinion Engine v3" subsystem — 9 of the 29 Cloud Functions, 2 of 3 Firestore triggers, and ~6 React components — is a fully-built, tested, orphaned parallel system that is never reached from the live app.**

- The live app only routes to `src/pages/FirstOpinionPage.tsx` for First Opinion (`src/App.tsx:10,112`). That page runs a "checkup"-based flow (`schools/{schoolId}/checkups/...`) using a client-side `DISHAScoreCalculator` and client-side PDF generation. It imports none of the v3 machinery.
- The v3 machinery — `submitChallengeResponse`, `submitBatchChallengeResponses`, `deleteChallengeResponse`, `syncMultipliers`, `recalculateCycleScores`, `batchRecalculateAllCycles`, `generateFirstOpinionReport`, `detectEarlyWarnings`, `onChallengeResponseWrite`, `onMultiplierWrite`, plus client components `ChallengeResponseForm.tsx`, `MultiplierSync.tsx`, `FirstOpinionResultsDashboard.tsx`, `Reports/TrendAnalysis.tsx`, `FirstOpinionDashboard.tsx`, `DetailedAnalysisView.tsx` — is wired together only inside `src/pages/FirstOpinionEngine.tsx`.
- `src/pages/FirstOpinionEngine.tsx` is never imported anywhere (`grep -rln "FirstOpinionEngine" src` returns only the file itself). It's not in `App.tsx`'s view switch.
- `FirstOpinionDashboard.tsx` and `DetailedAnalysisView.tsx` consequently have zero importers anywhere, not even from the orphaned page.

Independent of reachability, this pipeline is *also* broken by the database-ID mismatch in §3.

## 1. Full inventory

Client Firestore instance targets a named database (`ai-studio-dishadiagnostice-63fe1b2b-...`, `src/lib/firebase.ts:23`). Client Functions instance (`src/lib/firebase.ts:25`) has no region argument → defaults to `us-central1`. Both facts matter below.

| # | Function | Feature | Trigger | Region (as coded) | File:line |
|---|---|---|---|---|---|
| 1 | `initializeDISHADatabase` | Other | onCall | us-central1 (default) | `functions/src/index.ts:21` |
| 2 | `getDeploymentStatus` | Other | onCall | us-central1 | `functions/src/index.ts:165` |
| 3 | `analyzeCheckup` | First Opinion (legacy) | onCall | us-central1 | `functions/src/index.ts:198` |
| 4 | `generate14DReport` | 14D | onCall | us-central1 | `functions/src/index.ts:303` |
| 5 | `runSimulation` | Reverse Sim (legacy) | onCall | us-central1 | `functions/src/index.ts:406` |
| 6 | `submitChallengeResponse` | First Opinion v3 | onCall | us-central1 | `functions/src/firstOpinion/submitChallengeResponse.ts:13` |
| 7 | `submitBatchChallengeResponses` | First Opinion v3 | onCall | us-central1 | `functions/src/firstOpinion/submitChallengeResponse.ts:107` |
| 8 | `deleteChallengeResponse` | First Opinion v3 | onCall | us-central1 | `functions/src/firstOpinion/submitChallengeResponse.ts:184` |
| 9 | `syncMultipliers` | First Opinion v3 | onCall | **asia-south1** | `functions/src/firstOpinion/multiplierSync.ts:71-72` |
| 10 | `recalculateCycleScores` (deployed copy) | First Opinion v3 | onCall | us-central1 | `functions/src/firstOpinion/recalculateOnDemand.ts:19-20` |
| 10b | `recalculateCycleScores` (dup, dead source) | First Opinion v3 | onCall | asia-south1 | `functions/src/firstOpinion/batch.ts:142-143` — not exported from `index.ts`, never deployed |
| 11 | `batchRecalculateAllCycles` | First Opinion v3 | Pub/Sub schedule (every 6h) | asia-south1 | `functions/src/firstOpinion/batch.ts:32-34` |
| 12 | `onChallengeResponseWrite` | First Opinion v3 | Firestore onWrite (Gen2) | asia-south1, `database: DB_ID` | `functions/src/firstOpinion/triggers.ts:24-29` |
| 13 | `onMultiplierWrite` | First Opinion v3 | Firestore onWrite (Gen2) | asia-south1, `database: DB_ID` | `functions/src/firstOpinion/triggers.ts:65-70` |
| 14 | `generateFirstOpinionReport` | First Opinion v3 | onCall | us-central1 | `functions/src/firstOpinion/generateFirstOpinionReport.ts:74` |
| 15 | `detectEarlyWarnings` | First Opinion v3 | onCall | us-central1 | `functions/src/firstOpinion/detectEarlyWarnings.ts:25` |
| 16 | `onCycleCompletion` | First Opinion v3 | Firestore onWrite (Gen1) | us-central1, **default DB only** | `functions/src/firstOpinion/onCycleCompletion.ts:21-23` |
| 17 | `calculateMetrics` | 14D | Firestore onUpdate (Gen1) | us-central1, default DB only | `functions/src/14d/calculateMetrics.ts:66-68` |
| 18 | `runGapAnalysis` | 14D | Firestore trigger (Gen1) | us-central1 | `functions/src/14d/gapAnalysis.ts:70-71` |
| 19 | `generateRecommendations` | 14D | Firestore trigger (Gen1) | us-central1 | `functions/src/14d/recommendations.ts:66-67` |
| 20 | `generateDiagnosticReport` | 14D (Phase 4) | onCall | us-central1 | `functions/src/analysis/generateReport.ts:27` |
| 21 | `analyzeDimensions` | 14D (Phase 4) | onCall | us-central1 | `functions/src/analysis/dimensionAnalysis.ts:9` |
| 22 | `analyzeTrends` | 14D (Phase 4) | onCall | us-central1 | `functions/src/analysis/trendAnalysis.ts:9` |
| 23 | `setGoalSetting` | Reverse Simulation | onCall | us-central1 | `functions/src/reverseSimulation/goalSetting.ts:25-26` |
| 24 | `performReverseCalculation` | Reverse Simulation | onCall | us-central1 | `functions/src/reverseSimulation/calculations.ts:29-30` |
| 25 | `analyzeFeasibility` | Reverse Simulation | onCall | us-central1 | `functions/src/reverseSimulation/feasibility.ts:31-32` |
| 26 | `generateActionPlan` | Reverse Simulation | onCall | us-central1 | `functions/src/reverseSimulation/actionMapping.ts:64-65` |
| 27 | `allocateResources` | Reverse Simulation | onCall | us-central1 | `functions/src/reverseSimulation/allocation.ts:27-28` |
| 28 | `generateTimeline` | Reverse Simulation | onCall | us-central1 | `functions/src/reverseSimulation/timeline.ts:29-30` |
| — | `calculateScores`, `batchProcessAssessments` | Other (EWISR, legacy) | onCall / Pub/Sub | **not deployed** | `functions/src/ewisr/calculateScores.ts:114,217` — never imported/re-exported from `index.ts`, dead at the source level |

## 2 & 5. Reachability + duplicate report generators

| Function | Reachable from live app? | Evidence |
|---|---|---|
| `generate14DReport` | Called, but dead round-trip | `src/lib/assessmentService.ts:268` calls it; output never rendered; broken 3 ways (see Executive Summary #2) |
| `syncMultipliers` | Called, but only from the orphaned `FirstOpinionEngine.tsx` page | `MultiplierSync.tsx:85` calls it; page is never routed |
| `setGoalSetting`, `performReverseCalculation`, `analyzeFeasibility`, `generateActionPlan`, `allocateResources`, `generateTimeline` | **Yes — genuinely reachable** | Called via `callCloudFunction(functionName, ...)` in `src/hooks/useReverseSimulation.ts:130-201`, consumed by all 6 routed Reverse Simulation components |
| `analyzeCheckup` | No — dead | Explicit dev comment in `FirstOpinionPage.tsx:1238-1250` confirms no caller exists; local `runLocalDiagnosticCalculation` used instead |
| `runSimulation` | No — 0 references | — |
| `initializeDISHADatabase`, `getDeploymentStatus` | No — 0 references | Seed/ops utilities |
| `submitChallengeResponse`, `submitBatchChallengeResponses`, `deleteChallengeResponse` | No — reimplemented client-side instead | `src/lib/firstOpinion/responseService.ts:30` writes directly via client SDK to the same path, bypassing the Cloud Function |
| `generateFirstOpinionReport` | No — 0 references | Superseded by client `generateFirstOpinionReportPdf` (`src/lib/firstOpinionReportPdf.ts:129`) |
| `detectEarlyWarnings` | No — 0 references | Also gated behind an admin-role Firestore lookup nothing triggers |
| `recalculateCycleScores`, `batchRecalculateAllCycles` | No — 0 references (latter is schedule-only by design) | — |
| `calculateMetrics`, `runGapAnalysis`, `generateRecommendations` | No (structurally unreachable — Firestore trigger chain gated on a status write the app never makes) | Original 14D-audit finding, re-confirmed |
| `generateDiagnosticReport`, `analyzeDimensions`, `analyzeTrends` | No — 0 references | Phase4 dashboards use local/sample data (`src/lib/phase4/samplePhase3Data.ts`) instead |

**Report-generator map**, consolidated:

| Feature | "Live" report path | Dead Cloud Function(s) |
|---|---|---|
| First Opinion (checkup flow) | Client-side `DISHAScoreCalculator` + `generateFirstOpinionReportPdf` | `analyzeCheckup` |
| 14D Assessment | Client-side calc feeds UI; `generate14DReport` is called but discarded | `generate14DReport` (dead round-trip), `generateDiagnosticReport` (unrelated duplicate, never called) |
| First Opinion v3 | N/A — flow unrouted | `generateFirstOpinionReport` |
| Phase 4 dashboards | Client-side sample/local data | `analyzeDimensions`, `analyzeTrends` |

**No server-side report-generation Cloud Function in this codebase is confirmed to be both called by the live UI and to produce output that reaches the user.**

## 3. Firestore trigger functions — exact paths and reachability

| Trigger | Watched path | Gates on | Reachable? |
|---|---|---|---|
| `calculateMetrics` | `schools/{schoolId}/assessments14D/{assessmentId}` (onUpdate, Gen1, default DB) | `before.status !== after.status && after.status === 'CLOSED'` | No — nothing writes this status |
| `runGapAnalysis`, `generateRecommendations` | Downstream of `calculateMetrics` | Depend on it having run | No — dormant |
| `onChallengeResponseWrite` | `schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{id}` (Gen2, `database: DB_ID`) | any write | Fires correctly in isolation (the trigger *matcher* is correctly scoped to the named DB) — but see the DB-mismatch bug below: what it does once fired is broken |
| `onMultiplierWrite` | `schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{id}` (Gen2, `database: DB_ID`) | any write | Only reachable if `syncMultipliers` runs — which requires the orphaned page (§0) |
| `onCycleCompletion` | `schools/{schoolId}/assessmentCycles/{cycleId}` (Gen1 `.onWrite`, **default database only** — Gen1 triggers cannot target a named database) | `after.scores` must be present | Structurally unreachable — all real writes land in the named database, never `(default)` |

### Critical bug: Firestore multi-database ID mismatch

- Client Firestore instance always uses the named database (`src/lib/firebase.ts:23`, `firebase.json`).
- Every Cloud Function calls bare `admin.firestore()` — no database argument (confirmed across 20+ call sites in `index.ts`, `submitChallengeResponse.ts`, `batch.ts`, `multiplierSync.ts`, `recalculateOnDemand.ts`, `triggers.ts`, `14d/*`, `reverseSimulation/*`, `analysis/*`). The namespaced `admin.firestore()` API always resolves to `(default)`.
- `firebase-admin@^13.0.0` does support named databases via the modular `getFirestore(app, databaseId)` — never used anywhere in `functions/src`.
- Concretely: `onChallengeResponseWrite` is correctly scoped to fire on the real write path (`database: DB_ID`), but its handler body calls `getDb()` → `admin.firestore()` (`functions/src/firstOpinion/triggers.ts:14-16`, the **default** database), passed into `recalculateAndPersistCycleScores`. That fetcher queries the default database, finds nothing, hits an empty-guard, and returns without writing anything.
- Same pattern in `syncMultipliers` (`functions/src/firstOpinion/multiplierSync.ts:10,156-190`) — even if reachable, its writes would land in a database the `onMultiplierWrite` trigger (scoped to `DB_ID`) never sees.
- **Net effect: the entire "real-time recalculation" pipeline for First Opinion v3 is a silent no-op in production**, independent of and in addition to the reachability problem in §0.
- Not confirmed against live Cloud Functions logs (no deploy/runtime access in this review) — this is certain as a matter of what the SDK calls do as written, per documented Admin SDK behavior, not a confirmed production stack trace.

## 4. CI/CD deployment config

Two workflows touch deployment: `.github/workflows/test-and-deploy.yml` (functions + hosting + firestore) and `.github/workflows/automated-ui-deployment.yml` (hosting only).

**`test-and-deploy.yml` findings:**

1. **Deploy failures are allowed to silently continue.** Every functions-related step has `continue-on-error: true`: type-check (line 82), "delete orphaned functions" (line 151), Firebase CLI functions deploy (line 170), and the manual `asia-south1` gcloud deploy (line 215, with each individual `gcloud functions deploy` also having its own `|| echo "...continuing..."` fallback). Only Firestore rules/indexes and Hosting lack this. The "Deployment Summary" step then unconditionally prints "✅ Cloud Functions deployed (3 functions)" — a hardcoded, unverified message.
2. **The "delete orphaned functions" list is backwards.** The list at lines 115-127 (`analyzeDimensions, analyzeTrends, batchRecalculateAllCycles, deleteChallengeResponse, detectEarlyWarnings, generateDiagnosticReport, generateFirstOpinionReport, recalculateCycleScores, submitBatchChallengeResponses, submitChallengeResponse, syncMultipliers`) is exactly the set of functions **still actively exported from `functions/src/index.ts` today**. This step deletes currently-live-in-source functions immediately before redeploying most of them — a forced hard-reset, not real orphan cleanup, and it provides no protection against functions genuinely removed from source in the past.
3. **Redundant dual deployment** of `syncMultipliers`, `batchRecalculateAllCycles`, `recalculateCycleScores` — once via `firebase deploy --only functions` (honoring in-code region annotations) and again via raw `gcloud functions deploy ... --allow-unauthenticated`. Appears to be a historical workaround for a Firebase CLI region-handling issue that may or may not still be necessary — not confirmable from static analysis.
4. **Client/function region mismatch is never reconciled.** Client Functions SDK defaults to `us-central1`; 3 functions deploy to `asia-south1`. No code or workflow step addresses this.

**`automated-ui-deployment.yml` findings:** deploys Hosting only, on the same triggers as `test-and-deploy.yml` (push to `main`/`remote-dev` plus a daily cron) — two workflows independently deploying Hosting on the same push. Its "success" steps print hardcoded claims ("✅ Old UI Removed", "✅ New features deployed") not verified by any actual check.

## 6. Auth / input-validation / error-handling spot check

Checked the 6 confirmed-reachable Reverse Simulation functions plus `generate14DReport` and `syncMultipliers`.

- **`setGoalSetting`** and the other 5 Reverse Simulation functions: consistently good — `context.auth` checked first, required-field presence and type/range validation before use, wrapped in try/catch. Best-quality code in the Functions layer. One smell: `schoolId: data.schoolId || userId` (`goalSetting.ts:111`) silently falls back to the caller's UID if `schoolId` is omitted — the same defect class as Executive Summary #4, just as a fallback rather than the only path.
- **`generate14DReport`**: checks `context.auth` but never validates the shape of `data` before destructuring `{ schoolId, assessmentId }` — a missing/malformed field would surface as a raw Firestore SDK error rather than a curated `HttpsError`.
- **`syncMultipliers`**: best-in-class authorization — checks `context.auth`, verifies `context.auth.token.schoolId === data.schoolId` and role via custom claims, plus thorough per-item payload validation. Only issue is reachability/region, not internal robustness.
- **Inconsistency worth flagging**: admin-role checks are implemented three different ways with no shared helper — `context.auth.token.role !== 'admin'` (`batch.ts:155`), `context.auth.token.admin` truthy (`recalculateOnDemand.ts:23`), and a Firestore `users/{uid}.role` lookup (`detectEarlyWarnings.ts:32-33`). Latent authorization-drift risk if any of this currently-unreachable code is ever wired up.
