# DISHA 14-Dimension Diagnostic Framework — v2

**Authoritative Reference Document**  
**Metric Formulas, Data Fallbacks & Root-Cause Perception Surveys**

**Institution:** Podar International School, Raipur (CBSE)  
**Edition:** August 2026 — Deployable Edition  
**Status:** ✅ PRODUCTION READY

---

## Overview

This document is the **single authoritative source for all 14-Dimension diagnostic implementation, deployment, and analysis**. It defines:

- ✅ Complete 14 dimensions with operational levers
- ✅ 60+ metrics with exact calculation formulas
- ✅ 1:1 metric-to-perception matching (90+ perception questions)
- ✅ Raw data sources & fallback procedures for every metric
- ✅ Root-cause paired follow-up questions
- ✅ Analytical & predictive use cases (5 categories, 25+ scenarios)
- ✅ Visual analytics examples (8 chart types)

**Old versions (v1) are archived at `/_ARCHIVED/14DimensionalDiagnosticOldVersions/` — do not use for new work.**

---

## Key Innovation: 1:1 Metric-to-Perception Matching

### Why This Matters

**Problem with v1 approach:**
- Perception questions were separate from Reality metrics
- Led to statistical noise and gap misalignment
- Couldn't pinpoint which metric was driving a dimension-level gap

**v2 solution:**
- **Every Reality metric has exactly ONE perception question**
- Enables metric-level gap analysis ("Is the pass-rate perception misaligned, or is it the homework-load perception?")
- Keeps individual respondent surveys short (questions tagged to relevant stakeholders)
- Prevents perception side from being statistically noisier than Reality

### Implementation Pattern

For each dimension's metric:

```
Reality Metric
  ↓ (1:1 mapping)
Perception Question (rated 1-10)
  ↓ (always paired with)
Root-Cause Follow-up (open text)
  → "What would improve [this specific metric]?"
```

**Stakeholder Specificity:** A student never answers about reserve fund; a parent never answers about lesson-plan tagging. Each question is tagged to the stakeholder genuinely positioned to answer it.

---

## The 14 Dimensions

### **Dimension 1: Academic Performance & Learning Outcomes**

**Definition:** Whether students are genuinely learning and progressing against grade-level benchmarks — not just pass percentages, but depth of understanding and year-on-year growth per student.

**Control Processes:**
- Curriculum pacing charts with mid-term checkpoints against NCERT/NCF learning outcomes
- Regular formative (not just summative) assessment cycles with item-level analysis
- Differentiated/remedial instruction pathway for students below grade-level benchmark, tracked individually
- Teacher Professional Learning Communities (PLCs) reviewing exam data by subject/section each term

**Reality Metrics (6 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 1a | Board exam pass % and average grade, by subject/section | Pass % = (Students passed ÷ Students appeared) × 100, per subject/section | Board exam result sheets / CBSE portal | Request from exam cell (3-year history); mandate digital capture going forward |
| 1b | Internal formative assessment average, term-on-term | Avg = Sum of all students' formative scores ÷ Number assessed | Teacher gradebooks (LMS or paper) | Audit mark registers; introduce shared digital template next term |
| 1c | % students below grade-level benchmark on diagnostics | % = (Students below cutoff ÷ Total tested) × 100 | Diagnostic test results (school or third-party) | Run low-cost NCERT diagnostic in next cycle; use % below 50% internal formative as proxy until then |
| 1d | Year-on-year value-added growth per student | Growth (per student) = Current-year score − Previous-year score; School avg = Sum of growth ÷ Students with both years | Two consecutive years of same student's scores (linked by ID) | Tag all assessments with student ID this year; next year compute it; substitute with cohort pass-rate change until ready |
| 1e | Subject/topic-wise item analysis (most-failed concepts) | % incorrect = Incorrect responses ÷ Total × 100, ranked by topic | Question-wise marks from exam sheets or OMR | Ask subject teachers to tag marks by topic during next correction cycle |
| 1f | Homework/assignment completion rate | % = (Submitted ÷ Assigned) × 100, per term | LMS submission logs or homework register | Start simple homework register per class next term |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 1a | Overall, I would rate the school's academic/board exam results as strong | Parent | What specific change would most improve your confidence in academic results? |
| 1b | Regular class tests/assessments reflect real understanding, not just rote memorization | Student | What would make class assessments feel more meaningful to you? |
| 1c | I am confident every student, not just top performers, is supported to reach grade-level expectations | Teacher | What additional support would help you reach students below grade level? |
| 1d | My child is genuinely improving year over year, not just staying the same | Parent | What evidence would convince you of real year-on-year improvement? |
| 1e | Teachers identify and address the specific topics/concepts I personally struggle with | Student | Which topic or concept do you wish got more follow-up attention? |
| 1f | The homework/assignment load feels appropriately paced — not overwhelming, not too light | Student | What would make the homework load feel better calibrated? |

**Gap Reading Note:**
- If Reality shows strong/improving scores but Parent Perception is lukewarm → communication gap (report cards lack context)
- If Perception is high but diagnostic data shows declining achievement → blind spot, typically surfaces suddenly at board-exam time → PRIORITIZE IMMEDIATELY

---

### **Dimension 2: Curriculum & Pedagogy Quality**

**Definition:** Whether teaching methods are effective, engaging, and aligned to NEP 2020/NCF — not just whether the syllabus gets 'covered.'

**Control Processes:**
- Structured lesson-observation cycles (peer + admin) using a shared rubric
- Annual curriculum audit against NCF/NEP 2020 requirements
- CPD calendar tied to observed pedagogy gaps, not generic training

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 2a | % of observed lessons rated 'effective' on shared rubric | % = (Lessons rated 'effective'+) ÷ Total observed) × 100 | Lesson observation forms (academic coordinators/HODs) | Start minimum cadence (1 observed lesson/teacher/month) using simple rubric this term |
| 2b | CPD hours completed per teacher per year | Average = Total CPD hours ÷ Number of teachers | Training attendance registers/HR logs | Reconstruct from certificates/attendance of past workshops; mandate sign-in log for all future |
| 2c | Ratio of activity-based to lecture-based sessions | Ratio = Activity-tagged lessons ÷ Lecture-tagged lessons, from sample | Lesson plans/observation tags | Add 'primary mode' field to lesson-plan template; retroactively use one-time observation sample |
| 2d | Curriculum pacing adherence | % = (Topics covered by checkpoint ÷ Topics planned by checkpoint) × 100, per map | Curriculum map vs. actual teacher progress logs | Create term-wise curriculum map per subject before next cycle (one-time setup, high value) |
| 2e | Project-based learning instances per term, per grade | Count = Documented cross-curricular/project-based activities per term/grade | Academic calendar/event records, teacher logs | Start shared log (even spreadsheet) where teachers record project activities next term |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 2a | Classes are interesting and easy to follow | Student | What would make classes more engaging for you specifically? |
| 2b | I receive enough training/support to keep improving my teaching | Teacher | What specific training would most improve your ability to teach the current syllabus? |
| 2c | Lessons include activities and discussion, not just lecture and copying notes | Student | What kind of activity would make a lesson click better for you? |
| 2d | The pace of teaching matches what I can actually absorb — not rushed, not too slow | Student | Which subject/topic feels most rushed or most dragged-out to you? |
| 2e | My child gets meaningful project/hands-on learning, not just textbook work | Parent | What kind of project or hands-on activity would you like to see more of? |

**Gap Reading Note:**
- Common pattern: Teacher Perception high ("I do plenty of activity-based teaching") while lesson-observation data shows mostly lecture format → cross-check self-report against actual observation specifically for this dimension

---

### **Dimension 3: Teacher Quality, Development & Retention**

**Definition:** Teacher effectiveness, professional growth, and whether the school is retaining its good teachers — often the single biggest predictor of long-term school quality.

**Control Processes:**
- Structured induction and mentorship pairing for every new teacher
- Annual appraisal linking classroom observation data with student outcome trends
- Periodic compensation benchmarking against comparable schools in Raipur

**Reality Metrics (6 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 3a | Annual teacher attrition rate | % = (Teachers left ÷ Avg teachers employed during year) × 100 | HR employee master records (joining/exit dates) | Reconstruct from payroll or appointment/relieving letters; maintain HR tracker going forward |
| 3b | Average teacher tenure | Average = Sum of (Current date − Joining date) ÷ Number of current teachers | HR joining-date records | Approximate from appointment letters/service certificates; mandate accurate record-keeping |
| 3c | % teachers with required qualifications/certifications | % = (Teachers with verified qualification ÷ Total teachers) × 100 | HR personnel files/qualification documents | One-time verification drive collecting copies; mandate qualification documentation in onboarding |
| 3d | Teacher absenteeism rate | % = (Total teacher-days absent ÷ Total possible teacher-days) × 100 | Staff attendance/biometric logs | Use manual registers if no system; start simple sign-in sheet immediately if inconsistent |
| 3e | Teacher:student ratio, by grade/section | Ratio = Total enrolled students ÷ Total teaching staff (FTE), by grade/section | Enrollment records + staffing records | Both usually available; if not centralized, one-time manual count resolves it |
| 3f | Substitute-teacher dependency rate | % = (Periods covered by substitutes ÷ Total periods) × 100 | Daily substitution/arrangement register | Most schools keep this; start immediately if not — simple and operationally useful too |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 3a | I don't see myself needing to leave this school in the next 1-2 years | Teacher | What would most reduce any urge you have to consider leaving? |
| 3b | My child has consistent, experienced teachers year over year, not constant change | Parent | What would improve teacher continuity for your child? |
| 3c | I'm confident my child's teachers are well-qualified and know their subjects deeply | Parent | What would increase your confidence in teacher qualifications? |
| 3d | My classes are rarely cancelled or disrupted because a teacher is absent | Student | How often has teacher absence disrupted your learning, and what would help? |
| 3e | Class sizes are small enough for me/my child to get individual attention | Parent | What class-size change would most benefit your child's learning? |
| 3f | When my regular teacher is absent, the substitute arrangement still lets me learn well | Student | What would make substitute-covered classes more effective for you? |

**Gap Reading Note:**
- **Dangerous blind spot:** Leadership perceives teacher morale as fine right up until attrition spikes
- **Solution:** Track attrition + exit-interview themes as leading indicators (not just annual satisfaction survey)

---

### **Dimension 4: Student Wellbeing & Mental Health**

**Definition:** The emotional, psychological, and social wellbeing of students — increasingly as important to families as academic results.

**Control Processes:**
- Maintain adequate counsellor-to-student ratio with regular sessions
- Structured Social-Emotional Learning (SEL) curriculum embedded in timetable
- Confidential, anonymous check-in mechanism accessible to every student

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 4a | Counsellor caseload and average session frequency | Avg sessions/month = Total sessions ÷ Months; Caseload = Distinct students ÷ Counsellors | Counsellor session-count log (aggregate only, privacy-protected) | Introduce simple confidential log immediately — protects privacy while enabling capacity tracking |
| 4b | Documented bullying/harassment incidents & resolution time | Avg resolution time = Sum of (Closed date − Reported date) ÷ Number of cases | Anti-bullying committee incident register | PRIORITY GAP (child-safety implications) — institute confidential register immediately, regardless of timing |
| 4c | Absenteeism patterns linked to stress | % = (Absences with health-office/counsellor-flagged stress reason ÷ Total absences) × 100 | Health office/nurse visit log cross-referenced with attendance | Add reason-category field to visit log going forward; use overall absenteeism rate as proxy until then |
| 4d | SEL program participation rate | % = (Students attending scheduled SEL ÷ Total enrolled) × 100 | SEL session attendance records | If no SEL program exists, this is program-design gap — pilot basic SEL curriculum before measuring |
| 4e | Anonymous wellbeing pulse-survey completion rate | % = (Responses received ÷ Total invited) × 100 | Survey platform response logs | If no prior survey, this is simply the first data point — launch first cycle as part of assessment |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 4a | If I needed to see the counsellor, I could get an appointment without a long wait | Student | What would make counselling more accessible to you? |
| 4b | When bullying or conflict is reported, it gets resolved reasonably quickly | Student | Describe a case where resolution felt too slow, and what would have sped it up |
| 4c | I don't believe my child avoids school due to stress or anxiety | Parent | What signs of school-related stress have you noticed, and what would help address them? |
| 4d | The SEL/life-skills sessions genuinely help me manage emotions and relationships | Student | What would make these sessions more useful to you? |
| 4e | I feel comfortable honestly answering wellbeing surveys/check-ins at school | Student | What would make you more willing to answer honestly? |

**⚠️ Data Handling:** Always report in aggregate. Never report in a way that could identify an individual student, even to the Board.

---

### **Dimension 5: Student Discipline & Behavior**

**Definition:** How consistently and fairly the school manages student conduct — a restorative, well-understood system rather than purely punitive or inconsistent.

**Control Processes:**
- Clear, published code of conduct, reviewed annually with student/parent input
- Restorative-justice-oriented disciplinary process, not purely punitive
- Centralized incident-logging so patterns can be tracked across sections and teachers

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 5a | Disciplinary incidents by type, severity, and section | Count and categorize incidents, tabulated by type/severity/section | Discipline/incident register (class teachers or in-charge) | Institute standard incident-report form immediately if only handled verbally — needed for consistency |
| 5b | Repeat-offender rate | % = (Students with 2+ incidents ÷ Students with ≥1 incident) × 100 | Incident register linked by student ID | Requires incident register to exist and be linked — build alongside the register |
| 5c | Suspension/expulsion count | Simple count from administrative records for the period | Formal suspension/expulsion order records | Usually well-documented for compliance; if not centralized, pull from principal's files |
| 5d | Average time-to-resolution for incidents | Average = Sum of (Resolved date − Reported date) ÷ Number of incidents | Incident register with both dates | Add 'date closed' field to form going forward if not logged |
| 5e | Consistency-of-enforcement audit | Qualitative comparison of how similar-severity incidents were handled across teachers/sections | Incident register, cross-tabulated by handling teacher/section | Requires incident register + designated reviewer (e.g., academic coordinator) to compare periodically |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 5a | I can rely on a clear, consistent process when a discipline incident occurs in my class | Teacher | What part of the incident-handling process feels unclear or inconsistent? |
| 5b | Our disciplinary approach actually helps repeat behavior issues improve, not just punishes them | Teacher | What would help address repeat behavior issues more effectively? |
| 5c | Suspension/expulsion is used fairly, as a last resort, not overused | Parent | What would make you trust this process is used fairly? |
| 5d | When I report or am involved in a discipline issue, it gets resolved in reasonable time | Student | What delayed resolution the most in your experience? |
| 5e | Rules are applied the same way regardless of which teacher or section is involved | Student | Where have you seen inconsistent enforcement, and what would fix it? |

**Gap Reading Note:**
- Common pattern: Teacher Perception of 'fair enforcement' high, but student surveys report perceived favoritism → consistency audit is the Reality check that resolves this

---

### **Dimension 6: Infrastructure & Facilities**

**Definition:** The physical assets of the school — classrooms, labs, library, sports facilities, sanitation, and IT hardware — covered heavily under CBSE SQAA's Infrastructure domain.

**Control Processes:**
- Annual infrastructure audit checklist aligned to CBSE SQAA benchmarking
- Preventive (not just reactive) maintenance schedule with logged ticket resolution times
- Facility-utilization tracking (are labs/library/sports facilities actually being used?)

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 6a | Facility condition audit score | Score = Average of standardized checklist ratings (1-5) across all facility categories | Physical inspection checklist (facilities/admin staff) | If no audit done, conduct one-time baseline using CBSE-SQAA checklist; repeat annually |
| 6b | Maintenance ticket resolution time | Average = Sum of (Resolved − Logged) ÷ Number of tickets | Facilities/maintenance request log | If handled informally, institute simple ticket log immediately — even shared register |
| 6c | Lab/library utilization hours per week | Hours/week = Sum of booked/used hours across all sessions in a week | Lab/library booking or sign-in register | If no booking system, add simple sign-in sheet at each facility from next term |
| 6d | Student:facility ratios vs. CBSE norms | Ratio = Total students ÷ Facility units (toilets, water points), vs. CBSE prescribed norm | Facility count (infrastructure records) + enrollment | Facility counts typically countable on walkthrough — one-time count resolves immediately |
| 6e | IT device:student ratio; internet uptime % | Device ratio = Functional devices ÷ Students; Uptime % = (Hours functional ÷ Total hours) × 100 | IT asset inventory + network monitoring logs (or manual outage log) | If no formal inventory, conduct one-time device count; start manual outage log if no monitoring tool |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 6a | Overall, school facilities are well-maintained and in good condition | Parent | Which specific facility, if improved, would most change your impression of the school? |
| 6b | When I report a classroom/facility issue, it gets fixed in reasonable time | Teacher | Describe a slow repair and what would speed up the process |
| 6c | I get enough access time to labs/library when I need them | Student | What access limitation frustrates you most? |
| 6d | Basic facilities (toilets, drinking water) are sufficient and clean | Student | What specific facility feels insufficient? |
| 6e | I have reliable access to working devices/internet when I need them for teaching | Teacher | What tech reliability issue disrupts your teaching most? |

**Gap Reading Note:**
- Common pattern: Infrastructure Perception gap is about visibility, not quality — a well-equipped but rarely-shown facility scores lower than its Reality condition warrants

---

### **Dimension 7: Safety & Security**

**Definition:** Physical safety on campus and during transport — campus security, emergency preparedness, transport safety, and child-protection compliance.

**Control Processes:**
- CCTV coverage audit against defined campus-coverage standard
- GPS-tracked transport with defined attendant policy on every route
- Active, trained Child Protection/POCSO committee with documented meeting cadence

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 7a | Safety-drill frequency and compliance % | % = (Drills conducted as scheduled ÷ Drills planned per policy) × 100 | Drill schedule vs. completion log | COMPLIANCE PRIORITY — create mandatory drill calendar and logging process immediately |
| 7b | CCTV coverage % of campus | % = (Campus area under coverage ÷ Total campus area) × 100, estimated from coverage map | CCTV system layout/coverage map | If no map exists, request from security vendor or conduct walkthrough marking covered/uncovered zones |
| 7c | Transport safety incident count | Simple count of logged transport incidents (accidents, near-misses, complaints) | Transport department incident log | SAFETY CRITICAL — institute simple incident-reporting process immediately if not centrally logged |
| 7d | Security-staff:student ratio | Ratio = Total enrolled students ÷ Total security staff on duty | Enrollment + security staffing records | Both typically readily available; if not centralized, one-time manual count resolves |
| 7e | Background-check completion rate for staff/vendors | % = (Staff/vendors with verified background check ÷ Total staff/vendors) × 100 | HR/vendor-management verification records | SERIOUS COMPLIANCE GAP if not tracked — conduct one-time audit/verification drive and mandate going forward |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 7a | I know what to do in a fire/earthquake/lockdown drill because we practice regularly | Student | What part of drill preparedness feels unclear to you? |
| 7b | I'm confident the campus has adequate security camera coverage | Parent | Which campus area concerns you most regarding surveillance/safety? |
| 7c | I trust the school transport (bus) is safe and well-supervised | Parent | What transport safety concern, if any, would you raise? |
| 7d | There is adequate security presence on campus at all times | Parent | When/where do you feel security presence is lacking? |
| 7e | I trust that all staff and vendors interacting with my child are properly vetted | Parent | What would increase your confidence in staff/vendor vetting? |

**⚠️ CRITICAL Gap Reading Note:**
- **Dangerous blind spot:** Large Perception-greater-than-Reality gap is especially dangerous here
- Parents trusting a system with real gaps is exactly the pattern most likely to produce a severe incident
- **Treat any gap here as URGENT regardless of numerical size**

---

### **Dimension 8: Parent Satisfaction & Engagement**

**Definition:** How satisfied parents are and how genuinely involved they are in school life — a major driver of retention, referrals, and reputation.

**Control Processes:**
- Structured PTM calendar with systematic feedback capture
- Parent portal/app giving real-time visibility into academics and communication
- Defined grievance-redressal SLA (e.g., acknowledge within 24 hrs, resolve within 7 days)

**Reality Metrics (7 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 8a | PTM attendance rate | % = (Parents attended ÷ Parents invited) × 100, per PTM cycle | PTM sign-in sheets/attendance records | If not logged, add simple sign-in sheet at next PTM — trivial, immediate fix |
| 8b | Parent-portal/app active engagement rate | % = (Parents with ≥1 login/action in period ÷ Total registered accounts) × 100 | Portal/app analytics/backend logs | If no portal exists, substitute with response rate to physical circulars/newsletters; treat as signal to evaluate portal adoption |
| 8c | Grievance count and resolution time | Average = Sum of (Resolved − Raised) ÷ Number of grievances | Grievance/complaint register | If handled informally, institute simple register immediately — also useful for governance/compliance |
| 8d | Parent-committee participation rate | % = (Parents actively participating ÷ Total committee members) × 100 | Committee attendance/activity records | If not tracked, start logging attendance at committee meetings from next cycle |
| 8e | Fee-payment delinquency rate | % = (Students with overdue payments ÷ Total enrolled) × 100 | Finance/accounts fee-ledger records | Almost always already tracked in accounting systems; if not, one-time ledger pull resolves |
| 8f | Re-enrollment/renewal rate | % = (Students re-enrolled next year ÷ Total eligible, excluding graduates) × 100 | Admissions/enrollment records across two consecutive years | If year-on-year records aren't linked by ID, one-time manual cross-check between years resolves (even retroactively) |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 8a | PTMs are scheduled and structured in a way that makes it easy for me to attend | Parent | What would make PTMs easier for you to attend or more valuable? |
| 8b | The parent portal/app gives me the real-time information I need about my child | Parent | What information or feature is missing from the portal? |
| 8c | My grievances/concerns get resolved satisfactorily | Parent | Describe a concern that wasn't resolved to your satisfaction, and what resolution you expected |
| 8d | I feel welcome and able to participate in parent committees/school activities | Parent | What barrier stops you from participating more? |
| 8e | The fee payment process and schedule work well for my family | Parent | What would make fee payment more manageable for you? |
| 8f | I plan to continue my child's education at this school next year | Parent | What, if anything, makes you hesitate about continuing here? |

**Key Metrics:**
- Re-enrollment INTENT (D8f Perception) is this dimension's closest analogue to standard NPS
- Re-enrollment RATE (Reality metric 8f) is the strongest proxy — a "revealed preference," harder to game than survey response
- **Red flag:** If stated intent is high but actual re-enrollment is quietly slipping → INVESTIGATE IMMEDIATELY

---

### **Dimension 9: Student Satisfaction & Engagement**

**Definition:** The lived student experience and sense of belonging — distinct from academic performance or wellbeing, this is about whether students actively want to be there.

**Control Processes:**
- Functioning student council with real influence on decisions
- Regular short 'pulse surveys' rather than one long annual survey
- Deliberate tracking of extracurricular breadth so engagement isn't concentrated in small group

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 9a | % students participating in at least one extracurricular activity | % = (Students enrolled in ≥1 activity ÷ Total enrolled) × 100 | Activity/club enrollment records | If only per-activity lists exist, consolidate into master list — one-time administrative task |
| 9b | Overall attendance rate | % = (Total student-days present ÷ Total possible student-days) × 100 | Daily attendance registers/biometric system | Virtually all schools track this; if only paper registers, manual tally for period resolves |
| 9c | Student council activity frequency | Count = Documented council initiatives/meetings held in the period | Student council records/minutes | If no council exists/isn't documented, this is program-design gap — establish structured council first |
| 9d | Inter-house/inter-school competition participation breadth | % = (Unique students participating in ≥1 competition ÷ Total enrolled) × 100 | Competition participation/registration records | If only winners are recorded, start capturing full participant rosters from next event |
| 9e | Library book-issue rate per student | Rate = Total books issued in period ÷ Total enrolled students | Library issue/return register or library management system | If manual/incomplete, simple issue register (even notebook log) resolves going forward |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 9a | I'm involved in at least one club/activity that I genuinely enjoy | Student | What activity would you join if it were offered or more accessible? |
| 9b | I look forward to coming to school most days | Student | What would make you more excited to come to school? |
| 9c | The student council/student voice mechanism represents my interests | Student | What issue do you wish the student council addressed? |
| 9d | I have a genuine chance to compete/participate in inter-house or inter-school events, not just watch | Student | What's stopping you from participating more in competitions? |
| 9e | I use the library regularly and find the books/resources I want | Student | What would make you use the library more? |

**⚠️ Segmentation Note:**
- Watch for extracurricular participation being dominated by small, repeat group of students
- Segment this data by student, not just report overall percentage

---

### **Dimension 10: Leadership & Governance**

**Definition:** The quality, transparency, and effectiveness of school management and decision-making — CBSE SQAA's Leadership and Governance domain.

**Control Processes:**
- Regular School Management Committee meetings with documented minutes
- Defined policy-review cycle, not ad hoc reactive changes
- Structured 360-degree feedback process for leadership

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 10a | SMC meeting frequency and quorum rate | Frequency = Meetings held ÷ Required per policy; Quorum = Meetings with quorum ÷ Total | SMC meeting minutes/attendance records | GOVERNANCE COMPLIANCE GAP if minutes aren't formally kept — start immediately, independent of timing |
| 10b | Policy review/update frequency | Count = Policies formally reviewed/updated ÷ Total active policies | Policy register with review-date tracking | If no register exists, create one listing all current policies with last-reviewed dates — one-time exercise |
| 10c | Leadership-role turnover rate | % = (Leadership roles vacated in period ÷ Total leadership roles) × 100 | HR records for leadership positions specifically | Reconstruct from appointment records if not separately tracked |
| 10d | Decision-implementation lag time | Average = Sum of (Implemented − Decided) ÷ Number of decisions | Meeting minutes (decision date) + implementation records/circulars | If not formally dated/tracked, start simple decision log (decision, owner, target date, actual date) from next SMC |
| 10e | Audit/compliance finding closure rate | % = (Findings closed in period ÷ Total findings raised) × 100 | Internal/external audit reports with finding-status tracking | If findings aren't tracked to closure, institute simple tracker immediately — critical for governance/regulatory risk |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 10a | I'm confident the School Management Committee meets regularly and functions well | Parent | What would increase your confidence in SMC functioning? |
| 10b | School policies are kept up to date and relevant, not outdated | Teacher/Staff | Which policy feels outdated or unclear to you? |
| 10c | Leadership positions here are stable, not constantly changing | Teacher/Staff | How has any leadership turnover affected you or your work? |
| 10d | When leadership makes a decision, it gets implemented in reasonable time | Teacher/Staff | Describe a decision that took too long to implement, and why |
| 10e | I trust the school takes audit/compliance findings seriously and resolves them | Teacher/Staff | What would increase your trust in how compliance issues are handled? |

**Gap Reading Note:**
- Common pattern: Management perceives its own transparency as high, but staff/parents experience it differently
- 360-feedback mechanism exists specifically to surface this gap objectively

---

### **Dimension 11: Financial Health & Sustainability**

**Definition:** The school's underlying financial stability — critical for a private institution, and directly connected to staff confidence, infrastructure investment, and fee-setting decisions.

**Control Processes:**
- Quarterly budget-vs-actual variance review, shared with Board/management committee
- Periodic fee-structure benchmarking against comparable Raipur schools
- Defined reserve-fund policy (minimum operating-cost coverage)

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 11a | Fee collection rate/delinquency % | % = (Fee amount collected ÷ Fee amount billed) × 100 | Finance/accounts ledger | Always available in any functioning system; if manual, one-time reconciliation resolves |
| 11b | Operating margin, trended over years | Margin % = [(Revenue − Operating cost) ÷ Revenue] × 100, year-on-year | Annual financial statements/income-expenditure records | If formal statements aren't prepared, engage accountant to prepare at least simple income-expenditure statement |
| 11c | Cost-per-student trend | Cost/student = Total operating cost ÷ Total enrolled, year-on-year | Financial statements + enrollment records | Requires financial statement preparation — same fallback as 11b |
| 11d | Reserve-fund-to-operating-cost ratio | Ratio = Reserve fund balance ÷ Average monthly operating cost (gives 'months covered') | Balance sheet/reserve fund records | If no formal reserve fund is maintained, this reveals genuine policy gap — recommend establishing policy going forward |
| 11e | Scholarship disbursement vs. budget | % = (Actual scholarship disbursed ÷ Budgeted scholarship) × 100 | Finance records + scholarship program budget | If no formal scholarship budget exists, this is policy gap — recommend formalizing budget and tracking process |

**Perception Questions (1:1 matched) — Internal/Board Only:**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 11a | The fee payment/collection process feels fair and consistently applied to all families | Parent | What about the fee process feels unfair or inconsistent? |
| 11b | I'm confident in the school's financial trajectory over the next 3 years | Management/Board | What financial risk worries you most? |
| 11c | The school's cost structure is efficient relative to the value delivered to students | Management/Board | Where do you see the biggest opportunity to improve cost efficiency? |
| 11d | The school has an adequate financial safety buffer for unexpected events | Management/Board | What would you do to strengthen the school's financial buffer? |
| 11e | Scholarship/financial-aid support is accessible and fairly distributed to families who need it | Parent | What would improve access to financial aid at this school? |

**⚠️ Note:** Much of this dimension's Reality data is appropriately internal-only, but Board and senior management MUST track this gap closely — financial blind spots are often the slowest to surface and most damaging once they do.

---

### **Dimension 12: Admissions, Enrollment & Market Position (Brand/Reputation)**

**Definition:** How the school is perceived externally, and how that perception translates into actual enrollment health and competitive standing.

**Control Processes:**
- Structured admissions-inquiry-to-enrollment funnel tracked in a CRM
- Active alumni engagement program
- Systematic tracking of referral sources for new admissions

**Reality Metrics (6 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 12a | Inquiry-to-admission conversion rate | % = (Admissions confirmed ÷ Total inquiries) × 100 | Admissions CRM/inquiry log | If inquiries aren't logged, start logging every inquiry from next cycle — without this, only totals available |
| 12b | Year-on-year enrollment trend, by grade | % change = [(Current − Previous) ÷ Previous] × 100, per grade | Enrollment records across years | Almost always available (core admin record); if not organized by year/grade, one-time reorganization resolves |
| 12c | Waitlist length, by grade | Simple count of students on waitlist per grade at a point in time | Admissions waitlist records | If no formal waitlist maintained, start simple waitlist register from next admission cycle |
| 12d | Mid-year withdrawal/attrition rate | % = (Mid-year withdrawals ÷ Total enrolled at year start) × 100 | Admissions/enrollment withdrawal records | If not logged, reconstruct from Transfer Certificate (TC) issuance records, which schools must maintain |
| 12e | Source of new admissions (referral % vs. marketing % vs. walk-in) | % breakdown = Count per source ÷ Total new admissions, by category | Admissions inquiry form (with 'how did you hear' field) | If form doesn't capture source, add this single field immediately — trivial change, high analytical value |
| 12f | Alumni engagement participation rate | % = (Alumni participating in ≥1 activity ÷ Total contactable alumni) × 100 | Alumni database + event participation records | If no alumni database exists, foundational gap — start building from old admission records/yearbooks |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 12a | The admissions process was smooth and informative from inquiry to decision | Prospective parent | What part of the admissions process could be improved? |
| 12b | I sense this school is growing and thriving, not shrinking | Parent | What gives you that impression, positive or negative? |
| 12c | The waitlist/admission-decision process was communicated clearly and on time | Prospective parent | What communication gap did you experience during the waitlist process? |
| 12d | I don't know of other families leaving mid-year for concerning reasons | Parent | What reasons, if any, have you heard for families leaving? |
| 12e | I would confidently refer other families to this school | Parent | What would make you refer more actively? |
| 12f | I stay connected with and feel positive about my school after graduating | Alumni | What would increase your engagement with the school as an alum? |

**⚠️ Critical Metric:**
- Referral source data is one of most underused Reality metrics available
- **Red flag:** If referral-driven admissions are declining even while survey-based satisfaction stays flat → early leading indicator of enrollment decline
- Worth investigating well before enrollment numbers themselves drop

---

### **Dimension 13: Technology & Digital Readiness**

**Definition:** How effectively the school uses technology for teaching, administration, and communication — increasingly a differentiator parents actively evaluate.

**Control Processes:**
- Structured EdTech adoption training calendar for teachers
- Clear LMS usage policy with defined minimum expectations
- Documented cybersecurity and student-data-privacy policy

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 13a | LMS/portal active-usage rate | % = (Users with ≥1 login/activity in period ÷ Total registered users) × 100, by role | LMS/portal backend analytics | If no LMS exists, flag as foundational technology gap (not just data gap) |
| 13b | Device:student ratio | Ratio = Total functional student-accessible devices ÷ Total enrolled students | IT asset inventory | If no formal inventory, conduct one-time physical count/audit |
| 13c | IT-helpdesk ticket resolution time | Average = Sum of (Resolved − Logged) ÷ Number of tickets | IT helpdesk ticketing system or manual log | If handled informally, institute simple ticket log (even email-based) immediately |
| 13d | % of lessons using digital tools | % = (Observed/logged lessons using digital tools ÷ Total observed) × 100 | Lesson observation records (same source as D2) | Same fallback as D2's observation metric — requires observation program to exist |
| 13e | Cybersecurity incident count | Simple count of logged cybersecurity/data-privacy incidents in period | IT security incident log | If not tracked, institute simple log immediately — rising data-privacy obligations for student data |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 13a | I actively and regularly use the school's LMS/digital tools | Teacher | What barrier stops you from using it more? |
| 13b | I have adequate access to a working device when I need one for schoolwork | Student | When have you lacked device access, and what would help? |
| 13c | When I report a tech issue, it gets resolved quickly | Teacher | Describe a slow IT resolution and what would speed it up |
| 13d | Technology is used well in my learning, not just for its own sake | Student | Describe a time technology genuinely helped (or didn't help) you learn |
| 13e | I trust the school protects my child's personal/academic data appropriately | Parent | What would increase your trust in how the school handles data privacy? |

**Gap Reading Note:**
- Common pattern: High portal 'registration' numbers (weak metric) mask low actual active-usage rates (better metric)
- Always measure engagement, not just enrollment, on any digital platform

---

### **Dimension 14: Co-curricular, Extracurricular & Holistic Development**

**Definition:** Sports, arts, life-skills, and values education — the 'beyond academics' development that CBSE SQAA treats as a full co-scholastic domain, and that increasingly drives parent choice.

**Control Processes:**
- Structured co-curricular calendar with defined minimum participation expectation
- Planned inter-school competition calendar, not opportunistic entry
- Life-skills/values curriculum genuinely integrated into the timetable

**Reality Metrics (5 total):**

| # | Metric | Formula | Raw Data | Fallback |
|---|--------|---------|----------|----------|
| 14a | % students participating in at least one co-curricular activity | % = (Students enrolled in ≥1 activity ÷ Total enrolled) × 100 | Activity enrollment records | Consolidate per-activity rosters into master list — one-time administrative task |
| 14b | Inter-school competition participation and results count | Count = Competitions entered + Results (wins/placements) achieved, per term | Competition participation/results records | If not centrally compiled, reconstruct from certificates/trophies + teacher-in-charge records |
| 14c | Sports/arts infrastructure utilization hours per week | Hours/week = Sum of booked/used hours across all facilities in a week | Facility booking/usage register | If no booking system, add simple sign-in sheet at each facility from next term |
| 14d | Life-skills curriculum completion rate | % = (Sessions actually conducted ÷ Sessions planned per calendar) × 100 | Academic calendar vs. actual session logs | If not tracked separately from regular classes, add simple session log immediately |
| 14e | House-system participation metrics | % = (Students participating in ≥1 house event ÷ Total enrolled) × 100 | House event participation records | If not tracked, start logging participation at house events from next cycle |

**Perception Questions (1:1 matched):**

| Metric | Question | Respondent | Root-Cause Follow-Up |
|--------|----------|-----------|----------------------|
| 14a | My child has genuine opportunities in sports/arts/co-curricular areas, not just academics | Parent | What co-curricular opportunity is missing for your child? |
| 14b | I have real opportunities to represent the school in competitions if I want to | Student | What's stopping you from competing more? |
| 14c | I get enough access/time to use sports/arts facilities | Student | What access limitation frustrates you most? |
| 14d | Life-skills/values sessions are actually happening regularly, not skipped | Student | How often do these sessions get skipped, and why? |
| 14e | I feel meaningfully involved in house-system events and competitions | Student | What would increase your engagement with the house system? |

**Gap Reading Note:**
- Strong candidate for Reality-greater-than-Perception ('communication gap') pattern in many schools
- Genuinely good programs often go under-communicated to parents focused on academic updates
- **Quick win:** Include co-curricular achievement summaries in same report-card cycle as academics

---

## Raw Data Requirements — Master Input Table

The 14 dimensions draw on ~60 distinct metrics, but far fewer distinct **raw data sources** — most school records feed several dimensions at once.

**Deployment Shortcut:** The Financial, HR, and Enrollment record groups alone feed the largest number of dimensions (D3, D6-D9, D11, D12). Prioritize digitizing/consolidating these three groups first if starting from scratch.

[See PDF pages 20-21 for complete master table of 50+ raw data sources organized by category]

---

## Analytical & Predictive Use Cases

Once raw data flows consistently, five categories of analysis become possible — moving from 'what happened' to 'what should we do about it.'

### **A. Descriptive & Diagnostic Analytics** — 'What is happening, and why?'

- **14-dimension health scorecard** — Single-glance radar view of Perception vs. Reality across all 14 dimensions
- **Trend analysis over time** — Term-on-term / year-on-year tracking to distinguish one-off blips from structural trends
- **Cross-dimension correlation analysis** — Which dimensions move together? (Does teacher attrition correlate with declining pass rates?)
- **Segment/cohort analysis** — Break any metric down by grade, section, or stakeholder group to find where problems concentrate
- **Root-cause theme analysis** — Aggregate and cluster the open-ended 'what would improve this' responses to surface dominant themes per METRIC

### **B. Predictive Analytics** — 'What is likely to happen next?'

- **Enrollment forecasting** — Project next 1-2 years' enrollment from YoY trend, inquiry-conversion rate, competitor-count data
- **Financial sustainability projection** — Project operating margin and reserve-fund runway forward; flag point at which school would breach safety margin
- **Fee-collection cash-flow forecasting** — Project future collection timing from historical payment-delay patterns
- **Cohort-level early-warning segmentation** — Combine attendance decline + fee delinquency + academic decline to flag grades at elevated attrition risk

### **C. Prescriptive & Optimization Analytics** — 'What should we actually do?'

- **Strategic priority quadrant** — Plot all 14 dimensions by Gap (urgency) vs. Importance (weight) to rank where leadership attention should go
- **Resource allocation optimization** — E.g., direct counsellor capacity to the grade where wellbeing risk concentrates
- **Cost-per-outcome efficiency analysis** — Compare ROI of different interventions (teacher CPD vs. facility upgrades?)
- **Facility utilization optimization** — Avoid further investment in underused facilities; justify investment in capacity-constrained ones

### **D. Brand & Market Presence Analytics** — 'How are we perceived, and is it growing?'

- **NPS & referral-rate trend tracking** — Two strongest "revealed trust" indicators, tracked together as core brand-health dashboard
- **Admissions funnel & source-channel ROI** — Measure conversion at each stage (inquiry → visit → application → offer → confirmed), broken down by source
- **Competitive benchmarking radar** — Overlay school's 14-dimension scores against peer-school data to identify genuine differentiators

### **E. Efficiency & Operational Analytics** — 'Are we running lean and well?'

- **Teacher:student ratio vs. outcome efficiency** — Test whether smaller class sizes in this school actually correlate with better outcomes
- **Digital/LMS adoption efficiency** — Compare technology spend against actual active-usage rates
- **Governance cycle-time efficiency** — Track decision-implementation lag time as proxy for organizational agility

---

## Deployment Principles

### Three Consistent Fallback Patterns

**Reconstructable from existing records:**  
Most 'missing' metrics (attrition, fee collection, enrollment trends) aren't actually missing — just unconsolidated. One-time pull from registers, ledgers, or certificates almost always resolves.

**Fixable with trivial process change:**  
Many metrics (source-of-admission tagging, ticket logging, sign-in sheets) need one new field or one new register started from next cycle, at essentially zero cost.

**Genuine program gaps, not data gaps:**  
Small number of metrics (SEL participation, alumni database, formal reserve fund) reveal that the underlying program or policy doesn't exist yet. Flagged explicitly rather than papered over with a proxy, since building the metric requires building the program first.

### Recommended First-Deployment Sequence

1. Run assessment with whatever Reality data is already available
2. Mark any ungathered metric clearly as 'baseline pending' (not left blank)
3. Use fallback column as direct action list for closing each specific gap before next cycle
4. Prioritize Financial + HR + Enrollment record groups (unlock broadest coverage per effort)
5. Capture ALL stakeholder perception data (90+ questions tagged by role/grade)

---

## Key Metrics for Continuous Monitoring

| Dimension | Primary KPI | Secondary KPI | Review Frequency |
|-----------|------------|---------------|--------------------|
| **D1** | Board pass rate trend | Formative assessment average | Quarterly |
| **D2** | % lessons effective | CPD hours/teacher | Quarterly |
| **D3** | Teacher attrition rate | Avg teacher tenure | Annually (with exit-interview themes monitored continuously) |
| **D4** | Counsellor caseload | Bullying resolution time | Ongoing |
| **D5** | Repeat-offender rate | Incident resolution time | Quarterly |
| **D6** | Maintenance ticket resolution time | Facility utilization hours | Quarterly |
| **D7** | Drill compliance % | Background-check completion % | Ongoing/Annually |
| **D8** | Re-enrollment rate (revealed preference) | Parent NPS (stated intent) | Annually |
| **D9** | Extracurricular participation % | Overall attendance rate | Quarterly |
| **D10** | SMC quorum & decision-implementation lag | Audit finding closure rate | Quarterly/Annually |
| **D11** | Fee collection rate & operating margin | Reserve fund ratio | Quarterly |
| **D12** | Inquiry-to-conversion rate | Referral-driven admissions % | Monthly/Quarterly |
| **D13** | LMS active-usage rate | Tech incident count | Monthly |
| **D14** | Co-curricular participation % | Competition participation % | Quarterly |

---

## Implementation Checklist for This School Year

- [ ] Print or bookmark this reference document (it is the authoritative source going forward)
- [ ] Audit current data infrastructure against "Raw Data Requirements" master table
- [ ] Prioritize Financial, HR, and Enrollment record digitization/consolidation
- [ ] Set up 90+ perception survey questions (tagged by stakeholder group)
- [ ] Establish baseline for all 60+ Reality metrics (mark as "pending baseline" if data unavailable)
- [ ] Implement fallback procedures for any metric without existing data source
- [ ] Schedule first diagnostic cycle with available Reality data
- [ ] Prepare board presentation using 14-dimension health scorecard (Fig. 1 template)
- [ ] Identify quick-win process changes (e.g., add 'source' field to admissions form)
- [ ] Plan one major program gap closure (e.g., establish alumni database)

---

## Addendum: Live Implementation (September 2026)

Prior to this addendum, this document's 14-dimension taxonomy, reality metrics,
and metric-linked perception questions existed in the codebase only as an
orphaned, unreachable component tree (`src/components/Assessment14D/*` +
`src/lib/14d/dimensionMetadata.ts`, only 4 of 14 dimensions ever completed)
— the actual sidebar-reachable "14D Diagnostic Assessment" feature ran on a
completely different, older ad hoc dimension list (`leadership`, `academic`,
`community`, `culture`, …) with generic flat Likert questions, no reality
metrics, and no root-cause capture. This is documented in
`14-Dimension-Diagnostic-Testing/02-Critical-Defects-Found.md`, Defect #2.

That gap is now closed:

- **`src/data/14DimensionsQuestions.ts`** is the live source of truth for all
  14 dimensions, matching this document's dimension names, reality metrics
  (formula/raw data/fallback), and 1:1-matched perception questions
  (respondent-tagged, with the root-cause/expectation follow-up) verbatim.
- **`src/data/objectiveMetricsSchema.ts`** captures every reality metric as
  admin-enterable operational data ("Operational Data" panel during the
  Deploy stage), keyed by the same metric id (e.g. `1a`) as its linked
  perception question, so the two stay traceable to each other.
- **The live stakeholder survey** (`/survey/:assessmentId/:stakeholderType`)
  now shows only the dimensions/questions tagged to that respondent — a
  student is never shown a reserve-fund question — and captures the
  open-ended root-cause follow-up alongside each rating.
- **One deliberate deviation from this document's "rated 1-10" framing**
  (in the Implementation Pattern section above): perception questions are
  rated 1-5 ("Strongly Disagree" → "Strongly Agree"), not 1-10. This matches
  the scale the app's respondent UI, dimension scoring
  (`src/lib/dimensionScoring.ts`), and existing survey infrastructure
  already used before this rebuild, and this document's own perception
  question tables never specify a scale for the graded question — a
  10-point scale can be adopted later as a deliberate, separately-scoped UI
  and scoring-engine change if wanted, but was out of scope for wiring the
  existing 1-5 survey to the correct dimensions/metrics/questions.
- **Benchmark/target numbers in `objectiveMetricsSchema.ts` are
  provisional**, since this document intentionally specifies formula/raw
  data/fallback per metric but no numeric target. They are reasonable
  illustrative defaults pending review by an actual school/board data
  owner — see the disclaimer at the top of that file.
- **Not yet built in this pass**: the Raw Data Requirements master input
  table, the Analytical & Predictive Use Cases, and the Visual Analytics
  chart types above are fully specified in this document but not yet
  surfaced as dedicated UI (the existing report — gap analysis, radar/bar
  charts, ranked action plan — already covers a meaningful subset). Treat
  these as a scoped follow-up, not as implemented.

## Status Summary

**Document Version:** v2.0 (Authoritative)  
**Updated:** September 2026 — live implementation addendum added  
**Source:** School Diagnostic 14 Dimension Framework v2 PDF (Podar International School, Raipur)  
**Implementation Status:** Core framework (14 dimensions, reality metrics, metric-linked perception + root-cause survey) is live in the running app. Raw Data Requirements UI, Analytical & Predictive Use Cases, and Visual Analytics chart types remain a scoped follow-up.  
**Compliance:** Aligned with CBSE SQAA domains and NEP 2020 principles

**This document supersedes all previous 14-D versions (v1, variants, and related implementations).**

For updated implementation and deployment guidance, refer to this document exclusively.
