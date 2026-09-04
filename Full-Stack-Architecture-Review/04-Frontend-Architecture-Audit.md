# Frontend Architecture Audit

Scope: routing, global state management, build configuration, auth/session handling, error handling, and test coverage across the whole app.

## 1. Routing architecture

`src/App.tsx` uses a hand-rolled `switch` on a `currentView` string (`App.tsx:108-128`) — no react-router. All 8 `ViewState` members are handled; the `default` case falls back to `Dashboard`, which is currently unreachable dead-code-in-effect since every valid state is covered — but there's no exhaustiveness check (no `const _exhaustive: never = ...` pattern), so a future `ViewState` added without a matching `case` would silently render `Dashboard` with zero error or warning.

Two hardcoded pathname/query checks bypass the switch entirely, evaluated on every render before any hooks run: the `?survey=&aid=` query-param check (`App.tsx:28-34`) and the `/survey/:id/:type` regex (`App.tsx:37-41`). The `useEffect` auth listener is declared *after* these early returns — a Rules-of-Hooks violation that doesn't crash today only because `window.location` is stable for the life of a mounted `App` instance, but is fragile.

**Browser back/forward is non-functional for in-app navigation.** No `pushState`/`replaceState`/`popstate` handling exists anywhere tied to `setCurrentView` (confirmed by grep). Clicking a sidebar item never touches the URL/history.

**Deep-linking is unsupported** except the two hardcoded survey routes — there's no route→URL mapping for any other view, so a bookmark or shared link always lands on `DASHBOARD` (or login).

**Refresh mid-flow loses in-progress state, and there are actually two/three separate "14D assessment" implementations to consider:**
1. The live admin flow (`MultiUserAssessmentPage`) — `stage`/`config`/`progress` are plain `useState`, reset unconditionally on every mount. Refresh during configuration/deployment discards in-progress config.
2. **The respondent-facing public survey** (`StakeholderSurvey.tsx`) — see finding below, the highest-impact one.
3. A third, fully-built but orphaned 14D wizard (`Assessment14D/AssessmentWizard.tsx` + its own Zustand store `useAssessmentWizard` + `responseService14D.ts`) — confirmed never rendered from any routed page. It *does* have a `beforeunload` guard and autosave concept, but neither protection applies to the code path that's actually live.

**`currentView` persistence: purely in-memory.** `store.ts` initializes `currentView: 'DASHBOARD'` with no `localStorage` read, and Zustand's `persist` middleware isn't used anywhere in the store (only `customDomain`, `schools`, and `activeSchool` are manually synced to `localStorage` via ad hoc calls). A hard refresh always resets to `DASHBOARD`.

## 2. Zustand store audit (`src/store.ts`, 412 lines)

**(a) Dead state — verified by listing every actual `useAppStore()` call site, not just grepping field names.** `dimensions`, `gaps`, `simulations`, `students`, `staff`, `attendance` are fetched from Firestore on every login (6 of 9 parallel `Promise.allSettled` calls in `fetchData()`) but **no component anywhere destructures them from `useAppStore()`**. Actions `updateSimulationTarget`, `addStudent`, `addStaff`, `addAttendanceRecords` are likewise never called anywhere. Only `domains` is read (by `Dashboard.tsx`) and only `addCommunication` is called (by `DeepDiveAssessment.tsx`). **6 of 9 parallel Firestore reads on every login fetch data nothing in the app renders** — pure cost, no product value, likely leftover from an earlier product iteration before the pivot to the current 3-feature structure.

**(b) One real bug found nearby**: `src/lib/schoolService.ts`'s `handleFirestoreError` unconditionally `throw`s, so the `return []`/`return null` fallback lines written immediately after calling it (in `fetchSchoolsFromFirestore` and `findSchoolByName`) are dead/unreachable code — the function signature implies a graceful fallback that never actually executes. Doesn't break today only because both call sites happen to be wrapped defensively by their own callers.

**(c) `activeSchool`/`schools` single source of truth — confirmed yes.** One other independent `collection(db, 'schools')` accessor exists (`src/lib/firebase/firstOpinionSchema.ts`'s `getSchoolsRef()`) but it's exported and never called anywhere — dead code, not an actual second live data path. No component uses Zustand selectors either — every consumer destructures the full store, so there's exactly one live read path and no drift risk in practice.

## 3. Build configuration

- **TypeScript strict mode is off** (`tsconfig.json`: `"strict": false`, `"noImplicitAny": false`, `skipLibCheck: true`).
- **No real lint step.** `package.json`'s `"lint"` script is `echo '...'`, always exits 0. `"build-no-lint"` is byte-identical to `"build"` — lint was fully stripped from the pipeline, not merely skipped for one command.
- **No route-level code-splitting.** `App.tsx` statically imports every top-level page. `vite.config.ts` sets no `chunkSizeWarningLimit`/`manualChunks`. The whole app ships as one JS bundle regardless of which view a user opens. (Heavy libraries — jsPDF, html2canvas, pdfjs-dist — *are* dynamically imported at point of use, which helps but isn't route-splitting.) Actual production bundle size wasn't verified in this pass (would require running a build).
- **Dependency issues worth flagging**: `vite` listed in both `dependencies` and `devDependencies`; `react-table` v7 present alongside `@tanstack/react-table` v8 with zero imports of the old one anywhere; `react@^19` paired with `react-is@^18` (version-mismatched pair); `firebase-admin`/`firebase-functions` listed in the **frontend's** `package.json` (they belong only in `functions/package.json`, and aren't imported anywhere in `src/`).

## 4. Auth/session architecture

`onAuthStateChanged` (`App.tsx:43-90`) drives the whole gate: hardcoded admin/demo check, then a `users/{uid}` lookup + `isApproved` check, with unapproved users force-signed-out and shown a "pending approval" screen.

- **No token-expiry/network-loss handling.** No `onIdTokenChanged`, no `setPersistence`, no explicit refresh-token/session-timeout handling anywhere. If a refresh token is actually revoked, `onAuthStateChanged` doesn't re-fire — the next Firestore call simply fails, typically only `console.error`'d (see §5), leaving the user looking at a stale/broken UI with no explanation.
- **Admin-email string is a literal, repeated three times within `App.tsx` itself** (`user.email === 'rylneuroacademy@gmail.com'` at 3 separate comparisons) rather than a single named constant — small but real drift risk within one file. Two more occurrences exist in `LandingPage.tsx` but are purely display text (contact info), not logic.

## 5. Error handling / resilience

- **A global `ErrorBoundary` exists and is correctly mounted** at the true root (`src/main.tsx`, wrapping `<App />`). Catches any render-time exception, logs to console with component stack, renders a generic "Something went wrong" + reload button. No error-reporting/telemetry service wired in.
- **Silent-swallow `catch` is the dominant pattern across `src/lib`** — 109 occurrences across 25 files (grepped). Sampled representatively:
  - `store.ts`'s dead `add*`/`update*` actions: `console.error` only, no re-throw, no user feedback (moot today since they're unreachable per §2, but the pattern is what would be inherited if ever wired up).
  - `schoolService.ts`: routes through `handleFirestoreError`, which logs rich context before throwing — better than plain `console.error`, though its declared fallback-return contract is dead code (§2b).
  - `reportService.ts`: consistent `console.error(...); throw error;` — logs then re-throws, useful only if every caller actually surfaces it (not verified end-to-end for every call site).
  - `MultiUserAssessment.tsx` is a rare case that *does* surface an error via a blocking native `alert()`.
- **Net assessment**: no consistent, centralized error-surfacing strategy — a mix of silent console-only, log-then-rethrow, and occasional `alert()`, with no toast/notification system anywhere in the codebase.

## 6. Testing infrastructure

`vitest.config.ts`: `happy-dom` environment, coverage thresholds set at 75/75/70/75 (lines/functions/branches/statements) scoped to `src/lib/**` and `src/components/**` — **not verified as actually met** in this review (would require running `vitest run --coverage`).

21 test files total:
- **Reverse Simulation — the only feature with real component-level (React Testing Library) coverage**: 7 files under `src/components/ReverseSimulation/__tests__/` plus one hook test, confirmed to actually `render(...)` real components.
- **First Opinion Engine — logic-only coverage, no component tests**: 6 files, all pure business-logic unit tests under `src/lib/firstOpinion/`. No `__tests__` directory exists under `src/components/FirstOpinion/`.
- **14D Assessment — no dedicated test coverage found at all.** No test files under `Assessment14D/`, `MultiUserAssessment/`, anywhere near `StakeholderSurvey`, or `src/lib/14d/`. The 5 files in `src/lib/__tests__/` test general scoring/reporting utilities, not the 14D wizard or survey flow specifically. **Of the three flagship features, 14D — the one most recently rebuilt — has the weakest verified test coverage.**

## Summary of highest-priority items

1. Respondent-facing 14D survey has no draft persistence — highest real-world impact of anything found in this pass (see Executive Summary #5).
2. A fully-built, unused parallel 14D wizard implementation exists with its own state store — dead code actively misleading to future maintainers.
3. 6 of 9 fields fetched by the global store on every login are dead — wasted Firestore reads, no consumer.
4. Lint/type-check fully disabled in the deploy pipeline; `strict: false` — no compile-time safety net at all.
5. No route-level code-splitting.
6. Inconsistent, mostly-silent error handling.

Not independently verified in this review: actual production bundle size/gzip numbers, whether Vitest coverage thresholds are currently met, full end-to-end tracing of every one of the 109 catch-block call sites' downstream UI behavior (sampled representatively, not exhaustively).
