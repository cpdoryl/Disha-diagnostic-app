# 14D Diagnostic Assessment — Test Execution Checklist

Filled in live as we go through `03-User-Testing-Guide.md` together. Status legend:
✅ Pass · ❌ Fail · ⚠️ Pass with issue · ⏳ Not yet run

| # | Step | Expected | Actual | Firestore check | Status |
|---|---|---|---|---|---|
| 1 | Open 14D Assessment nav item | Loads Events screen | | — | ⏳ |
| 2 | Create assessment event | Config saved, moves to Deploy screen | | `assessments/{id}` doc created with `status: 'active'`, correct `expectedRespondents` | ⏳ |
| 3 | Copy survey link | Link format `/survey/{assessmentId}/teacher` | | — | ⏳ |
| 4 | Submit survey as Teacher | "Thank You" confirmation | | Expect: `permission-denied` on the `setDoc` write — the response is rejected by Firestore rules and never saved anywhere. UI should show "Access denied. The assessment link may have expired." (Defect #1) | ⏳ |
| 5 | Admin dashboard reflects Step 4 | Counter increments | | Expect: counter stays unchanged — nothing was saved to write about (Defect #1) | ⏳ |
| 5b | "Simulate" button | Counter increments | | Expect: this one *does* work, writes to Schema A | ⏳ |
| 6 | Submit survey as Parent | Same as Step 4 | | Same check as Step 4 | ⏳ |
| 7 | Generate & view report | Report reflects real answers | | Expect: report reflects only simulated data (if any), not the real Teacher/Parent submissions from Steps 4/6, since `computeDiagnosticReport` also reads Schema A only | ⏳ |
| 8a | Duplicate submission | (TBD once root cause fixed) | | | ⏳ |
| 8b | Locked assessment link | "window has closed" message | | `assessments/{id}.status === 'locked'` | ⏳ |
| 8c | Invalid email/phone | Blocked with validation message | | — | ⏳ |
| 8d | Bogus assessmentId in URL | Error page, no crash | | — | ⏳ |

## Notes / running log

- _(add dated notes here as we test)_

## Defects confirmed live vs. static-analysis-only

| Defect | Static analysis said | Confirmed live? |
|---|---|---|
| #1 — Real submissions rejected (`permission-denied`) | Firestore rules require auth + an `assessmentId` field the write never sends; response is never saved | ⏳ |
| #2 — Shipped feature ≠ authoritative spec | `Assessment14D/*` reality+perception+root-cause wizard is unreachable from any route; live flow is a simpler flat-Likert survey | ⏳ (confirm by trying to navigate to it / grepping for a link — expect none) |
| #3 — Dead/broken Cloud Function report | `generate14DReport` output never shown, and would be all-zero anyway (`D01`..`D14` key mismatch) | ⏳ |
