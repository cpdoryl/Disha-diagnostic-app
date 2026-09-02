# 14D Diagnostic Assessment — Test Execution Checklist

Filled in live as we go through `03-User-Testing-Guide.md` together. Status legend:
✅ Pass · ❌ Fail · ⚠️ Pass with issue · ⏳ Not yet run

| # | Step | Expected | Actual | Firestore check | Status |
|---|---|---|---|---|---|
| 1 | Open 14D Assessment nav item | Loads Events screen | | — | ⏳ |
| 2 | Create assessment event | Config saved, moves to Deploy screen | | `assessments/{id}` doc created with `status: 'active'`, correct `expectedRespondents` | ⏳ |
| 3 | Copy survey link | Link format `/survey/{assessmentId}/teacher` | | — | ⏳ |
| 4 | Submit survey as Teacher | "Thank You" confirmation | | Defect #1 fix: expect a new doc at `assessments/{assessmentId}/responses/{id}` with `stakeholderType: 'teacher'` and nested `responses[dim][q]` matching what you entered | ⏳ |
| 5 | Admin dashboard reflects Step 4 | Counter increments | | Expect: Teacher counter goes from 0 → 1, live, no refresh needed | ⏳ |
| 5b | "Simulate" button | Counter increments | | Expect: this one *does* work, writes to Schema A | ⏳ |
| 6 | Submit survey as Parent | Same as Step 4 | | Same check as Step 4 | ⏳ |
| 7 | Generate & view report | Report reflects real answers | | Expect: report now includes the real Teacher/Parent submissions from Steps 4/6 (plus any simulated data), since they all land in the same collection `computeDiagnosticReport` reads | ⏳ |
| 8a | Duplicate submission | (TBD once root cause fixed) | | | ⏳ |
| 8b | Locked assessment link | "window has closed" message | | `assessments/{id}.status === 'locked'` | ⏳ |
| 8c | Invalid email/phone | Blocked with validation message | | — | ⏳ |
| 8d | Bogus assessmentId in URL | Error page, no crash | | — | ⏳ |

## Notes / running log

- _(add dated notes here as we test)_

## Defects confirmed live vs. static-analysis-only

| Defect | Static analysis said | Confirmed live? |
|---|---|---|
| #1 — Real submissions rejected (`permission-denied`) | Firestore rules require auth + an `assessmentId` field the write never sends; response is never saved | ✅ Fixed this session (code + build + tests verified); live confirmation pending Step 4 |
| #2 — Shipped feature ≠ authoritative spec | `Assessment14D/*` reality+perception+root-cause wizard is unreachable from any route; live flow is a simpler flat-Likert survey | ⏳ (confirm by trying to navigate to it / grepping for a link — expect none) |
| #3 — Dead/broken Cloud Function report | `generate14DReport` output never shown, and would be all-zero anyway (`D01`..`D14` key mismatch) | ⏳ |
