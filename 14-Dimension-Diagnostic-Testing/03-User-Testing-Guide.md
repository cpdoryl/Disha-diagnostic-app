# 14D Diagnostic Assessment — Guided User Testing Script

Do this in order. I (Claude) will validate the backend (Firestore + Cloud Functions) after
each step you complete — see `04-Test-Execution-Checklist.md` for what I'll be checking.

**Update:** static code review had found that Step 4 (submitting the survey) would fail
with "Access denied. The assessment link may have expired." — a real Firestore
`permission-denied` rejection, with your answers not saved anywhere. That bug (Defect #1)
has now been **fixed** in this session: the survey now saves to the same Firestore
location the admin dashboard and report engine already read from. Step 4 below should now
show the green "Thank You!" confirmation, and Step 5 should show your response in the live
counter. Please still report exactly what you see at each step — this is the live
confirmation that the fix actually works, not just a code-review claim.

Separately, `02-Critical-Defects-Found.md` Defect #2 found that the richer "reality metric
+ perception + root cause" survey style described in the framework reference doc lives in
the codebase (`src/components/Assessment14D/*`) but **isn't reachable from any link in the
running app** — so don't go looking for it; what you'll actually reach via the sidebar and
the survey link is the simpler flat 1–5 rating version.

---

### Step 1 — Log in and open the feature (Admin)
1. Log in to the app.
2. Register/select a school in the left sidebar if you haven't already ("Register Actual
   School").
3. Click **"14D Diagnostic Assessment"** in the left sidebar.
4. Tell me: does it land on an "Events" screen? Is it empty, or does it show past events?

### Step 2 — Create a new Assessment Event (Admin)
1. Click **"Create New Assessment Event"**.
2. Give it a name (e.g. "Test Round 1").
3. Set expected respondent counts for at least Teacher, Parent, and Student (e.g. 2 each)
   so we can generate links for all three roles.
4. Submit/continue.
5. Tell me: does it move you to a "Deploy" screen showing survey links / QR codes per
   role?

### Step 3 — Grab the survey link (Admin)
1. On the Deploy screen, copy the **Teacher** survey link (it should look like
   `https://<your-app-url>/survey/<assessmentId>/teacher`).
2. Send me that exact URL (the `assessmentId` in it is what I'll use to check Firestore).

### Step 4 — Fill out the survey as a respondent (User)
Open the link from Step 3 in a new tab (or incognito, to simulate a real respondent with
no admin session):
1. **Welcome screen** — click "Start Assessment".
2. **Your Information screen** — fill in all required fields for the Teacher role (name,
   email, phone, subject, class, teacher ID). Note the exact values you use — I'll check
   they match what's stored.
3. **Survey screen** — answer every question (1–5) for all 14 dimensions. You can pick any
   scores; note roughly what pattern you used (e.g. "all 4s", or "mixed").
4. **Review screen** — confirm all dimensions show ✓, then click **"Submit Survey"**.
5. Tell me exactly what screen appears next — expected now: the green "Thank You!"
   confirmation with a reference ID. If you instead see the red "Oops!" error screen,
   screenshot it plus the browser console (F12) so we can see the exact error — that would
   mean the fix needs another look.

### Step 5 — Check the admin dashboard updates (Admin)
1. Go back to the admin tab, on the Deploy screen for this event.
2. Look at the live respondent counter / "Teacher: x/y" breakdown.
3. Tell me: did it update to reflect your Step 4 submission, or does it still show 0 (or
   whatever it showed before)?
4. Also try the **"Simulate"** button next to Teachers (if present) and tell me if *that*
   updates the counter.

### Step 6 — Repeat for another role (User + Admin)
Repeat Steps 4–5 using the **Parent** survey link, so we have two respondent types'
worth of real data to check against the report.

### Step 7 — Objective data + report generation (Admin)
1. Still on the Deploy screen, open **"Operational Data"** in the sidebar and fill in
   whatever fields it asks for across the 14 dimensions (can be placeholder numbers for
   this test).
2. Proceed to **Analysis**. If the objective-data gate shows "complete", click
   **"Generate & View Report"**.
3. Tell me: does the report load? Do the per-dimension scores look like they reflect the
   answers you actually gave in Step 4/6, or do they look off (e.g. all zero, or clearly
   only reflecting simulated data)?

### Step 8 — Edge cases (once Steps 1–7 pass)
Once the core flow works end-to-end, we'll try:
- Submitting the survey twice with the same link (does it allow duplicates?).
- Opening the survey link after the admin **locks** the assessment (should show "window
  has closed").
- Submitting with an invalid email/phone format (should block with a validation message
  before allowing "Continue").
- Opening a survey link with a bogus/nonexistent `assessmentId` (should show the error
  page, not crash).

---

Report back after each step — I'll cross-check the corresponding Firestore path in
parallel and update `04-Test-Execution-Checklist.md` with pass/fail plus what I actually
found in the database.
