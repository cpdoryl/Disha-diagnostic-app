# Firestore Database Layer Audit

Scope: `src/`, `functions/src/`, `firebase.json`, `.firebaserc`, `firestore-security-rules.txt` (the file actually deployed, per `firebase.json`'s `"firestore": {"rules": "firestore-security-rules.txt"}` — `firestore.rules` also exists in the repo but is not deployed), `firestore.indexes.json`.

## Top-line critical finding (see also `02-Cloud-Functions-Audit.md` §3)

**Every Cloud Function reads/writes the wrong Firestore database.** `.firebaserc`/`firebase.json` pin the project to the named database `ai-studio-dishadiagnostice-63fe1b2b-...`. The client SDK correctly connects to it (`src/lib/firebase.ts:23`). Every Cloud Function instead calls bare `admin.firestore()` (`functions/src/index.ts:7-8` and every other function file), which always resolves to `(default)`. The only place a named-database awareness exists at all is the Gen2 trigger *matcher* config in `functions/src/firstOpinion/triggers.ts` — but even that file's own `getDb()` helper still returns the wrong database inside the handler. This is the root cause of one of the concrete mismatches below (`generate14DReport`) and of the First Opinion v3 trigger chain being a silent no-op.

Not confirmable against live Cloud Functions logs from this review (no runtime access) — certain as a matter of documented Admin SDK behavior given the code as written, not a confirmed production stack trace.

## 1. Collection inventory (by feature)

**14D Diagnostic Assessment**
- `assessments/{assessmentId}` (flat, top-level) + `.../responses`, `.../costRates`, `.../objectiveData`, `.../simulationScenario` — the live path (`src/lib/assessmentEventService.ts`, `src/pages/StakeholderSurvey.tsx:318`, `src/lib/dimensionScoring.ts:48`, `src/lib/objectiveDataService.ts`, `src/components/MultiUserAssessment/ResponseTracker.tsx:45`)
- `schools/{schoolId}/reports/{reportId}` — written by `generate14DReport` (`functions/src/index.ts:355-372`), read by `src/lib/reportService.ts`
- `schools/{schoolId}/auditLogs/{logId}` — `src/lib/auditService.ts`
- **Dead/parallel schemas**: `schools/{schoolId}/assessments/{id}/responses` (`src/lib/assessmentService.ts` — never called) and `schools/{schoolId}/assessments14D/{id}/responses` (`src/lib/14d/responseService14D.ts`, consumed by the orphaned `AssessmentWizard.tsx` and by a legacy Phase4 dashboard hook that as a result shows permanently empty widgets)
- `respondents/{respondentId}` — `src/services/firestore/multi-respondent-service.ts` (a separate, seemingly unused-by-the-live-UI multi-respondent tracking system)

**First Opinion Engine**
- `schools/{schoolId}/checkups/{checkupId}` + `.../analysis/current` + `.../checkupCounters/{dateKey}` — the actually-used system (`src/lib/checkupService.ts`)
- Dead v3 system: `schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses|multipliers|computed|firstOpinionReports` + global `multiplierDataCards`, `stakeholderVerifications` (`src/lib/firebase/firstOpinionSchema.ts`, `src/lib/firstOpinion/responseService.ts`, all of `functions/src/firstOpinion/*`)
- Adjacent EWISR sub-feature: `ewisr_assessments`, `assessment_reports` (`src/services/firestore/assessmentService.ts`)

**Reverse Simulation Engine**
- Client has zero direct Firestore access — only calls Cloud Functions and consumes their return value.
- Server side (all under the wrong database per the top finding): `schools/{userId}/reverseSimulations/{simulationId}/{step}/current` — keyed by Auth UID, not school ID (see Executive Summary #4).

**Shared / cross-feature**
- `users/{userId}`, `schools/{schoolId}`
- `dimensionsCatalog`, `challengesCatalog` — only writer (`src/lib/firebaseInit.ts`) is never imported by anything
- Legacy Phase1-3 collections still fetched on every login: `domains`, `dimensions`, `gaps`, `simulations`, `students`, `staff`, `attendance`, `communications` (`src/store.ts`) — see §3(a)
- Misc, no shared owner: `contact_requests`, `support_requests`, dynamically-named `surveys_*` collections, `deep_dive_assessments`, `analytics`, `systemSettings`

## 2. Read/write path consistency per feature

| Feature | Write | Read | Verdict |
|---|---|---|---|
| 14D — respondent submission | flat `assessments/{id}/responses` (`StakeholderSurvey.tsx:318`) | same path (`dimensionScoring.ts:48`, `ResponseTracker.tsx:45`) | **Consistent** |
| 14D — report generation | `generate14DReport` reads nested `schools/{schoolId}/assessments/{id}/responses` (`functions/src/index.ts:313-322`) | Real respondent writes go to the flat path — the nested path is written only by `assessmentService.ts`'s `saveAssessmentResponse`/`createAssessment`, which are **never called anywhere in `src/`** | **Mismatched — confirmed dead.** Every real invocation of `generate14DReport` finds `responses.empty === true` and throws. Compounded by, but independent of, the database mismatch above. |
| First Opinion — checkup save/read | `schools/{schoolId}/checkups/{id}` + `.../analysis/current` (`checkupService.ts`) | same paths, same file | **Consistent** — self-documented in the file's own comments confirming `analyzeCheckup` is dead and everything is client-computed |
| First Opinion — v3 challenge/cycle system | `assessmentCycles/{cycleId}/challengeResponses` via client SDK (`ChallengeResponseForm.tsx:100-118`) | same path, same subsystem | **Consistent internally**, but the assembling page (`FirstOpinionEngine.tsx`) is never routed — 100% unreachable in the running app |
| First Opinion — v3 Cloud Function `submitChallengeResponse` | writes `assessmentCycles/{cycleId}/challengeResponses` via `admin.firestore()` (wrong DB) | never called from anywhere | Dead write path, no reader — currently inert only because nothing invokes it |
| Reverse Simulation | `schools/{userId}/reverseSimulations/...` — auth UID as the "school" doc ID | client never reads Firestore for this feature at all | **No read path exists at all** for these writes; additionally conflates the `users`/`schools` ID spaces |
| First Opinion — v3 `generateFirstOpinionReport` | `assessmentCycles/{cycleId}/firstOpinionReports/latest` | never called from anywhere | Dead write path, no reader |

## 3. Security rules coverage

### (c) Custom claims — confirmed unsatisfiable
`setCustomUserClaims` is never called anywhere in `functions/src` or `src/` (only in a docs example). Every rule gated on `isAdmin()`/`isSchoolAdmin()`/`isTeacher()`/`isParent()`/`isStudent()` without an `OR request.auth != null` fallback is permanently denied for every real user:
- `schools/{schoolId}` create/update/delete
- `assessmentCycles` create/update/delete, `challengeResponses` delete (moot — dead feature)
- `dimensionsCatalog`/`challengesCatalog` writes (moot — only writer is unimported)
- `users/{userId}` delete — **real gap: no user can ever be deleted via client rules**
- `analytics/{analyticsId}` read/delete — and its create/update rule is **inverted** (`if request.auth == null`, requiring the caller to be *unauthenticated* — the opposite of every other rule in the file; very likely a typo, not intentional)
- `systemSettings/{settingId}` — fully admin-gated, so effectively unreachable by anyone
- `multiplierDataCards`, `stakeholderVerifications`, `challengeCatalog` writes (moot — no live writer)

Two spots already show a self-aware fix for exactly this problem: `checkups/{checkupId}` and its `analysis` subcollection were relaxed from `isAdmin()`/`isSchoolAdmin()` to plain `request.auth != null` (with an in-file comment explaining why) — which is why the live First Opinion checkup flow works today. The other rules above never received the same fix.

### (a) Code writes with no matching rule (falls to default-deny)
`contact_requests`, `support_requests`, `respondents/{id}`, the dynamically-named `surveys_*` collections (which a static rules file can't match without a `match /{document=**}` catch-all — this file has none), `deep_dive_assessments`, `ewisr_assessments`, `assessment_reports`, and — **confirmed live and currently hit** — the 8 legacy top-level collections (`domains`, `dimensions`, `gaps`, `simulations`, `students`, `staff`, `attendance`, `communications`) fetched by `store.ts`'s `fetchData()` on every login. The code's own comment acknowledges several of these are denied and falls back to hardcoded mock data (`MOCK_STUDENTS` etc.) — meaning any Dashboard widget still reading this data shows fabricated numbers with no visual indication. `schools/{userId}/reverseSimulations/...` also has no rule at all, harmless today only because all its writes are Admin-SDK-only (rules don't apply) and nothing reads it client-side.

### (b) Dead rules (path in rules, no code ever uses it)
- `challengeCatalog` (singular, in rules) vs. `challengesCatalog` (plural, in code) — naming drift, only the plural is actually used, and even that use is orphaned.
- `dimensionsCatalog`/`challengesCatalog` rules — only reader/writer (`firebaseInit.ts`) is never imported.
- `multiplierDataCards`, `stakeholderVerifications` rules — only referenced from the unreachable First Opinion v3 subsystem.
- `schools/{schoolId}/simulations/{simulationId}/results/{resultId}` rule — no code writes to this exact nested path (the live Reverse Simulation code uses the unrelated top-level `simulations` collection instead, which itself has no rule at all).

## 4. Firestore indexes

`firestore.indexes.json` defines only 3 composite indexes:
```
1. assessments (COLLECTION):            schoolId ASC, createdAt DESC
2. assessmentCycles (COLLECTION_GROUP): status ASC, createdAt DESC
3. challengeResponses (COLLECTION):     cycleId ASC, timestamp DESC
```

- **Index 1 matches a live query** (`src/lib/assessmentEventService.ts:81-85`). Consistent.
- **Index 2 doesn't match any query found** — the only code touching `assessmentCycles` (the dead v3 subsystem) actually queries `status`+`startDate`, at COLLECTION scope, not `status`+`createdAt` at COLLECTION_GROUP scope. Orphaned index entry, and the query it doesn't match is itself dead code.
- **Index 3 doesn't match any query found** — live query candidates on `challengeResponses` filter on `deleted`/`challengeId`/`role` and order by `submittedAt`, never `cycleId`+`timestamp`. Orphaned, again in dead code.
- **At least 6 live multi-field queries have no matching index defined anywhere in source control**: `multi-respondent-service.ts` (×2), `phase5/surveyService.ts` (`respondentType==` + `orderBy(submittedAt)`), `reportService.ts` (×2: `status==`/`assessmentId==` each + `orderBy(generatedAt)`), `auditService.ts` (×3: `entityType==`+`entityId==`, `action==`, `userId==`, each + `orderBy(timestamp)`), `assessmentService.ts`'s EWISR query. **`reportService.ts` and `auditService.ts` are both live and used directly by the 14D flow** — highest priority to check. If matching indexes weren't created out-of-band via the Firebase console, these throw "query requires an index" at runtime; if they were, they're undocumented and at risk of being dropped the next time `firestore:indexes` is deployed from this file.

## 5. Data model duplication

**First Opinion Engine has two entirely separate, competing implementations** — live `checkups`-based (`checkupService.ts`) vs. dead/orphaned `assessmentCycles`/`challengeResponses`-based "v3" (`firstOpinionSchema.ts`, `FirstOpinionEngine.tsx` and its component tree, the whole `functions/src/firstOpinion/*` v3 function set). The `checkupService.ts` file's own comment notes it replaces an even earlier interface shape tied to the (also dead) `analyzeCheckup` function — a third, now-removed schema generation for the same concept.

**14D has (at least) three distinct Firestore schemas for "assessment responses"**, confirming the exact pattern already found and fixed once in 14D recurs elsewhere too:
1. **Live**: flat `assessments/{id}/responses`.
2. **Dead**: nested `schools/{schoolId}/assessments/{id}/responses` (`assessmentService.ts`, never called) — and this is exactly the path `generate14DReport` reads from, so "report generation" is wired to the dead schema instead of the live one.
3. **Dead**: `schools/{schoolId}/assessments14D/{id}/responses` (`responseService14D.ts`), consumed only by the orphaned `AssessmentWizard.tsx`, and also independently read by the legacy Phase4 dashboard hook `useRealTimePhase3Data.ts` — meaning that dashboard's real-time widgets subscribe to a collection nothing ever writes to, showing permanently empty/loading state.

**Reverse Simulation** doesn't show the same multi-schema duplication (only one Firestore-facing schema exists, since the client never touches Firestore directly), but has the `schools/{userId}` ID-space conflation noted above — a related but distinct kind of schema inconsistency (wrong key semantics, not competing schemas).

## Caveats

- The database-mismatch finding is certain as written but not confirmed against live runtime logs (no deploy/runtime access in this review).
- Could not verify whether any of the flagged missing composite indexes were manually added to the live Firestore project outside of `firestore.indexes.json` — only that the source-controlled file doesn't define them, which is itself a source-of-truth risk regardless of whether they exist live.
- EWISR (`ewisr_assessments`) was only covered enough to classify it as an adjacent-but-separate schema; a full audit was out of scope.
