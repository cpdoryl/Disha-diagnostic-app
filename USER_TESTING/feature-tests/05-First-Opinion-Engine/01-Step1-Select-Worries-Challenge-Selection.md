# First Opinion Engine — Step 1: "Select Worries" (Challenge Selection)

**Feature area:** First Opinion Engine (`src/pages/FirstOpinionPage.tsx`), Step 1 of 3 ("Select Worries" / Challenge-First Entry Portal)
**Status:** ✅ PASS (after fix)
**Tested by:** User (rylneuroacademy@gmail.com), evaluated & fixed by Claude
**Test date:** 2026-08-31
**Environments tested:** https://disha-diagnostics.web.app/ and https://disha.rylneuroacademy.com/ (custom domain, same Firebase Hosting site — confirmed both update together on every deploy)

---

## 1. Pre-requisite state

A real school profile had already been created and verified against Firestore in a prior session (Admin/School Management area):

- School name: `Vidya Vihar Government School`
- City / Board: `Nashik • State Board`

This school was selected as the "Active School Profile" before running the First Opinion Engine.

## 2. Test data used

On the "What is worrying you most right now?" screen, the following 3 challenges were selected (one from each of 3 different categories):

| Category | Challenge selected |
|---|---|
| Growth & Enrollment | Enrollment Decline |
| People & Staffing | Teacher Attrition |
| Reputation & Competition | Parent Communication Issues |

## 3. Steps performed

1. Logged into the app and selected the active school (`Vidya Vihar Government School`).
2. Opened **First Opinion Check** from the left sidebar.
3. On Step 1 ("Select Worries"), selected the 3 challenges listed above by clicking each card.
4. Reviewed every category section for correctness (Growth & Enrollment, People & Staffing, Academic & Student Wellbeing, Reputation & Competition, Operations & Finance) via full-page screenshots.
5. Attempted to proceed to Step 2 with only 2 challenges selected, to check whether the "3 challenges" rule shown in the on-screen copy was actually enforced.
6. After the fix was deployed, repeated step 5 and confirmed the corrected behavior on both URLs.

## 4. Issues found during first pass (FAIL)

### Issue 1 — Challenge count was not enforced (functional bug)
The page copy states *"Select up to 3 challenges keeping you up at night"* and the entire downstream scoring/diagnostic engine is built around exactly 3 selected challenges (used to build the questionnaire, the root-cause mapping, and the final report). However, the **"Assemble Diagnostic Screening"** button had no minimum-selection check — it was clickable and would proceed to Step 2 with only 1 or 2 challenges selected. This risked generating an incomplete/incorrect diagnostic for any user who forgot to pick a third challenge.

- **File:** `src/pages/FirstOpinionPage.tsx`
- **Root cause:** the `toggleChallenge` handler capped selection at a max of 3 but had no minimum requirement, and the "Assemble Diagnostic Screening" button had no `disabled` condition tied to selection count.

### Issue 2 — Every challenge card showed a duplicated title as its description (content bug)
Reviewing the screenshots of all 5 categories, every single challenge card's subtitle text was identical to its title, e.g.:
- "Remedial Lag" / "Remedial Lag"
- "Cost Inflation" / "Cost Inflation"
- "Enrollment Decline" / "Enrollment Decline"

- **Root cause:** in `transformChallenges()`, the code set `description: challenge.label` — i.e. it copied the title into the description field instead of using real descriptive text. This affected all 15 challenges across all 5 categories (Growth & Enrollment, People & Staffing, Academic & Student Wellbeing, Reputation & Competition, Operations & Finance).

## 5. Fix applied

Commit: `0f880ca` — *"Require exactly 3 challenges in First Opinion Engine, fix duplicate descriptions"* (merged to `main`, deployed via GitHub Actions to both `disha-diagnostics.web.app` and `disha.rylneuroacademy.com`).

1. The "Assemble Diagnostic Screening" button is now `disabled` unless exactly 3 challenges are selected, with a live inline hint (e.g. *"Select 1 more challenge (2/3)"*) so the requirement is impossible to miss.
2. Added a distinct, real one-line description for all 15 challenges (`CHALLENGE_DESCRIPTIONS` map) so no card repeats its title as its subtitle.
3. Verified with a clean production build (`npm run build`) before pushing — no TypeScript or build errors introduced.

## 6. Retest results (PASS)

Verified by user on **both** live URLs after deployment:

| Check | Result |
|---|---|
| Selecting only 2 challenges keeps "Assemble Diagnostic Screening" disabled, with "X/3 selected" hint | ✅ Pass |
| Selecting a 3rd challenge enables the button and allows proceeding to Step 2 | ✅ Pass |
| All challenge cards across all 5 categories show a distinct, meaningful description instead of a repeated title | ✅ Pass |
| Fix live on https://disha-diagnostics.web.app/ | ✅ Confirmed by user |
| Fix live on https://disha.rylneuroacademy.com/ | ✅ Confirmed by user |

## 7. Notes / follow-ups

- Screenshots for this test were reviewed inline during the session (not saved as separate image files in this repo).
- This report covers **Step 1 only** of the 3-step First Opinion Engine flow. Step 2 (Screening Intake questions) and Step 3 (First Opinion Report / scoring output) still need to be tested and will get their own report(s) in this same folder.
