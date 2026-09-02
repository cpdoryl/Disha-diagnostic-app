# First Opinion Engine — Step 2: Operational Data Upload & Validation

**Feature area:** First Opinion Engine (`src/pages/FirstOpinionPage.tsx`, `src/lib/fileAnalyzer.ts`,
`src/lib/challengeDataRequirements.ts`, `src/lib/challengeObjectiveScoring.ts`), Step 2
("Screening Intake") — the "Share Supporting Information (Data Document)" upload box.
**Status:** ✅ PASS (after several rounds of real bugs found and fixed)
**Tested by:** User (rylneuroacademy@gmail.com), evaluated & fixed by Claude
**Test date:** 2026-08-31
**Environments:** https://disha-diagnostics.web.app/ and https://disha.rylneuroacademy.com/

---

## 1. What this covers

Whether the file upload for objective operational data (a) actually validates
the uploaded file against whichever 3 challenges are selected, (b) correctly
diagnoses *why* a file fails (wrong format vs. genuinely missing values) with
actionable guidance, (c) really supports the formats it claims to (CSV,
Excel, PDF), and (d) blocks progression to the next step until the data is
actually correct.

## 2. Issues found and fixed, in the order they surfaced

1. **Validation was silently a no-op.** `challengeDataRequirements.ts` was
   keyed by an unrelated id scheme, so every upload was reported "100%
   valid" regardless of content. Fixed by rekeying to the real challenge ids
   and adding a canonical `metric_field,value` CSV format.
2. **"Missing" list rendered empty even on failure**, due to an
   `Array.includes()` exact-match check against formatted strings. Fixed
   with a substring check.
3. **No hard block existed** — "Analyze & Get First Opinion" had no check
   against `fileValidation.isValid`, so an incomplete file could still
   proceed. Fixed: the button is now disabled and relabeled "Fix Data File
   First" whenever validation fails, with a detailed blocking error if
   clicked anyway.
4. **A real .xlsx upload was misdiagnosed as "all fields missing."** Root
   cause: the analyzer only ever read files as text; a genuine binary Excel
   file produces unparseable garbage, which looked identical to "0 fields
   found" (a data problem) rather than "wrong file type" (a format
   problem). Fixed by detecting binary file signatures before parsing and
   reporting the real cause.
5. **User then asked for real .xls/.pdf support**, not just a better error
   message. Added genuine binary parsing: `.xlsx`/`.xls` via the `xlsx`
   (SheetJS) library (real cell data), `.pdf` via `pdfjs-dist` (real text
   extraction, best-effort line parsing — works for text-based PDFs, not
   scanned images). Verified against real generated files of both types
   before shipping. Also fixed a smaller bug this surfaced: the 4 Core
   Operational Levers were being reported as "unrecognized fields."
6. **The "Missing" list showed each field's catalogue example value
   directly under it**, styled identically to a real captured value —
   several examples coincidentally matched numbers from this session's own
   sample files, making genuinely-missing fields look like they'd been
   found. Removed the example value from that list; added a separate
   "Exactly What We Read From Your File" table showing the literal
   field/value pairs the app actually parsed (including a "(blank value)"
   flag), so the user can directly cross-check against their source file.

## 3. Final verification

User re-tested with a real `.xlsx` file (values intentionally deleted) on
both live URLs and confirmed:
- The app correctly reads the real Excel file (not garbled binary).
- The "Missing" list names only the fields actually absent/blank — no
  invented values attached.
- The new "Exactly What We Read From Your File" table accurately reflects
  the file's real contents, letting the user self-verify the parse.
- Progression to Step 3 is blocked until the file is genuinely complete for
  the currently selected 3 challenges.

**Result: PASS.**

## 4. Related engine work verified in this same pass

- `challengeObjectiveScoring.ts` (Perception Gap Analysis): structural
  audit of all 30 metric bands (0 errors), a 455-combination determinism
  test, and an adversarial "rosy self-report" test (100% detection rate,
  0 false negatives) — see `8_ENGINE_ACCURACY_TESTING/ENGINE_ACCURACY_AND_TESTING.md`.
- Screening questionnaire completeness: all 15 challenges have complete,
  valid questionnaires (39 questions, 196 options, 0 structural errors),
  and the engine was exhaustively verified against all 1,300 possible
  per-challenge answer combinations and all 455 challenge combinations
  with randomized real-time answers — see `8_ENGINE_ACCURACY_TESTING/screening_questionnaire_and_realtime_audit.ts`.

## 5. Known, documented limitation (not a bug)

PDF parsing is best-effort text extraction — it will not work on scanned
image PDFs (no extractable text). This is reported to the user honestly
when encountered rather than silently failing. See the Addendum sections in
`docs/product-building-master/latest-version/DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md`.
