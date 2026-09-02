# 14-Dimension Diagnostic Assessment — Test Suite

This folder is the single home for all testing artifacts related to the **14-Dimension
Diagnostic Assessment** feature (left sidebar → "14D Diagnostic Assessment"). It is kept
separate from the many other `*_TEST*.md` files at the repo root, which belong to other
features/phases.

## Contents

| File | Purpose |
|---|---|
| `01-Architecture-and-Backend-Validation.md` | CTO/backend-engineer map of every route, component, Firestore collection, Cloud Function, and security rule this feature touches. The reference doc for *how it's supposed to work*. |
| `02-Critical-Defects-Found.md` | Defects found during static code validation, each with severity, exact file:line references, root cause, reproduction steps, and recommended fix. **Read this before testing** — it tells you what to expect. |
| `03-User-Testing-Guide.md` | Step-by-step script for testing the feature as an end-user (stakeholder filling the survey) and as the school admin (configuring, deploying, tracking, analyzing). |
| `04-Test-Execution-Checklist.md` | Live checklist to fill in while we test together — pass/fail per step, plus the exact Firebase Console checks to run alongside the UI to confirm the backend really persisted what the UI claims. |

## How this testing session will run

1. You test as a **respondent** (teacher/parent/student/admin) by filling out the actual
   public survey link the app generates — exactly as a real stakeholder would.
2. In parallel, I validate the **backend**: Firestore writes, Cloud Function invocation,
   security rules, and whether the admin dashboard/report actually reflects what you
   submitted.
3. We log results in `04-Test-Execution-Checklist.md` as we go.

## Headline findings before we start

Static code review (double-checked by an independent full-repo pass) surfaced two P0
issues:

1. **Every real stakeholder submission is rejected outright.** The public survey page is
   intentionally unauthenticated, but the function that saves its answers writes to a
   Firestore path whose deployed security rules require a signed-in user *and* a field the
   write never includes. The result: `permission-denied`, and the respondent sees
   "Access denied. The assessment link may have expired." — their answers are not saved
   anywhere. Full detail in `02-Critical-Defects-Found.md`, Defect #1.
2. **The feature the sidebar links to isn't the one the "authoritative" framework doc
   describes.** A full reality-metric + perception-score + root-cause-follow-up
   implementation exists in the codebase and matches the reference doc exactly, but it's
   wired into no route — it can't be reached by clicking anything in the app. What you can
   actually reach is a simpler flat 1–5 rating survey. Detail in Defect #2.

I recommend we confirm Defect #1 live in Step 4 of testing (it should reproduce
immediately), then fix it before further rounds — otherwise every later "does the admin
dashboard update" check fails for the same root cause. Defect #2 is a product decision for
you to weigh in on; I've flagged exactly what's built vs. reachable so you can decide.
