/**
 * 14-Dimension Diagnostic Framework v2 — Dimensions, Reality Metrics &
 * Perception Questions
 *
 * Source of truth: "School Diagnostic Framework — v2, Deployable Edition"
 * (docs/product-building-master/latest-version/
 * DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md and the source PDF).
 *
 * Every dimension carries: a definition, the control processes a school can
 * pull, its Reality metrics (each with the exact formula, the raw data it
 * needs, and a fallback if that data isn't currently maintained), and
 * exactly one Perception question per Reality metric (1:1 matched),
 * directed at the stakeholder genuinely positioned to answer it and paired
 * with an open-ended root-cause/expectation follow-up. A question's `id`
 * equals its linked metric's `id` (e.g. question '1a' is linked to reality
 * metric '1a') since the framework's whole point is 1:1 metric-to-question
 * matching, not a separately numbered question bank.
 *
 * Each question is answered by exactly one stakeholder type (`respondent`)
 * per the source document — a student is never asked about the reserve
 * fund, a parent is never asked about lesson-plan tagging. Consumers that
 * render a dimension's questions to a specific respondent must filter by
 * `question.respondent` (see getQuestionsForRespondent /
 * getDimensionForRespondent below) — some dimensions have zero questions
 * for a given respondent type and should be skipped entirely for them
 * (e.g. Dimension 9 is 100% student-answered; Dimension 8 is 100%
 * parent-answered).
 */

export type StakeholderType = 'teacher' | 'parent' | 'student' | 'admin' | 'other';

export interface RealityMetric {
  id: string; // e.g. '1a' — dimension number + letter, matches the linked question's id
  name: string;
  formula: string;
  rawDataRequired: string;
  fallback: string;
}

export interface Question {
  id: string; // = metricId
  metricId: string;
  text: string;
  hint?: string;
  respondent: StakeholderType;
  followUp: string; // open-ended root-cause / expectation follow-up
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  controlProcesses: string[];
  realityMetrics: RealityMetric[];
  questions: Question[];
  gapNote: string;
}

export const FOURTEEN_DIMENSIONS: Dimension[] = [
  {
    id: 'academic_performance',
    name: 'Academic Performance & Learning Outcomes',
    description:
      "Whether students are genuinely learning and progressing against grade-level benchmarks — not just pass percentages, but depth of understanding and year-on-year growth per student.",
    controlProcesses: [
      'Curriculum pacing charts with mid-term checkpoints against NCERT/NCF learning outcomes',
      'Regular formative (not just summative) assessment cycles with item-level analysis of what topics students consistently miss',
      'Differentiated/remedial instruction pathway for students below grade-level benchmark, tracked individually',
      'Teacher Professional Learning Communities (PLCs) reviewing exam data by subject/section each term',
    ],
    realityMetrics: [
      {
        id: '1a',
        name: 'Board exam pass % and average grade, by subject/section',
        formula: 'Pass % = (Students who passed ÷ Students appeared) × 100, computed per subject and per section',
        rawDataRequired: 'Board exam result sheets / CBSE result portal export, per student per subject',
        fallback:
          "Request the last 3 years' result sheets from the exam cell or CBSE portal (schools must retain these for compliance) and digitize into a spreadsheet; mandate digital capture of every future result cycle as policy.",
      },
      {
        id: '1b',
        name: 'Internal formative assessment average, term-on-term',
        formula: "Average = Sum of all students' formative scores in a term ÷ Number of students assessed",
        rawDataRequired: 'Teacher gradebooks (digital LMS or paper mark registers)',
        fallback:
          "Collect each teacher's term mark register in a one-time audit and centralize into a shared tracker; introduce a standard shared gradebook template from the next term.",
      },
      {
        id: '1c',
        name: '% students below grade-level benchmark on diagnostic tests',
        formula: '% = (Students scoring below the defined cutoff on a standardized diagnostic ÷ Total students tested) × 100',
        rawDataRequired: 'Diagnostic/baseline test results (school-administered or third-party tool)',
        fallback:
          "If no diagnostic exists yet, this can't be calculated retroactively — run a low-cost standardized diagnostic (e.g., NCERT learning-outcome checklists) in the next cycle; until then substitute with the % scoring below 50% on internal formative assessments as a rough proxy.",
      },
      {
        id: '1d',
        name: "Year-on-year 'value-added' growth per student",
        formula:
          'Growth (per student) = Current-year score − Previous-year score; School average = Sum of individual growth ÷ Students with both years\' data',
        rawDataRequired: "Two consecutive years of the same student's scores, linked by a unique student ID",
        fallback:
          "Requires student-ID-linked records across years — if not linked, start tagging all assessments with a unique student ID this year so next year's cycle can compute it; until then substitute with the cohort-level year-on-year pass-rate change.",
      },
      {
        id: '1e',
        name: 'Subject/topic-wise item analysis (most-failed concepts)',
        formula: '% incorrect (per question/topic) = Incorrect responses ÷ Total responses × 100, ranked to find weakest topics',
        rawDataRequired: 'Question-wise marks breakdown from exam answer sheets or OMR data',
        fallback:
          'If only total scores are recorded, ask subject teachers to tag marks by topic/question during the next correction cycle using a simple spreadsheet template.',
      },
      {
        id: '1f',
        name: 'Homework/assignment completion rate',
        formula: '% = (Assignments submitted ÷ Assignments assigned) × 100, aggregated per term',
        rawDataRequired: 'LMS submission logs, or a teacher-maintained homework register',
        fallback: 'If no LMS exists, start a simple homework register per class from the next term — low-cost, immediate fix.',
      },
    ],
    questions: [
      {
        id: '1a',
        metricId: '1a',
        text: "Overall, I would rate the school's academic/board exam results as strong",
        respondent: 'parent',
        followUp: 'What specific change would most improve your confidence in academic results?',
      },
      {
        id: '1b',
        metricId: '1b',
        text: 'Regular class tests/assessments reflect real understanding, not just rote memorization',
        respondent: 'student',
        followUp: 'What would make class assessments feel more meaningful to you?',
      },
      {
        id: '1c',
        metricId: '1c',
        text: 'I am confident every student, not just top performers, is supported to reach grade-level expectations',
        respondent: 'teacher',
        followUp: 'What additional support would help you reach students below grade level?',
      },
      {
        id: '1d',
        metricId: '1d',
        text: 'My child is genuinely improving year over year, not just staying the same',
        respondent: 'parent',
        followUp: 'What evidence would convince you of real year-on-year improvement?',
      },
      {
        id: '1e',
        metricId: '1e',
        text: 'Teachers identify and address the specific topics/concepts I personally struggle with',
        respondent: 'student',
        followUp: 'Which topic or concept do you wish got more follow-up attention?',
      },
      {
        id: '1f',
        metricId: '1f',
        text: 'The homework/assignment load feels appropriately paced — not overwhelming, not too light',
        respondent: 'student',
        followUp: 'What would make the homework load feel better calibrated?',
      },
    ],
    gapNote:
      'If Reality shows strong/improving scores but Parent Perception is lukewarm, this is usually a communication gap — report cards likely lack context. If Perception is confidently high but diagnostic data shows declining learning-outcome achievement, this is a blind spot that typically surfaces suddenly at board-exam time — prioritize this pattern immediately.',
  },
  {
    id: 'curriculum_pedagogy',
    name: 'Curriculum & Pedagogy Quality',
    description: "Whether teaching methods are effective, engaging, and aligned to NEP 2020/NCF — not just whether the syllabus gets 'covered.'",
    controlProcesses: [
      'Structured lesson-observation cycles (peer + admin) using a shared rubric',
      'Annual curriculum audit against NCF/NEP 2020 requirements',
      'CPD calendar tied to observed pedagogy gaps, not generic training',
    ],
    realityMetrics: [
      {
        id: '2a',
        name: "% of observed lessons rated 'effective' on a shared rubric",
        formula: "% = (Lessons rated 'effective' or above ÷ Total lessons observed) × 100",
        rawDataRequired: 'Lesson observation forms/rubric scores completed by academic coordinators/HODs',
        fallback:
          "If no structured observation program exists, this can't be measured yet — start a minimum cadence (1 observed lesson per teacher per month) this term using a simple rubric; use a one-time baseline sample of teachers before the first assessment.",
      },
      {
        id: '2b',
        name: 'CPD hours completed per teacher per year',
        formula: 'Average = Total CPD hours logged across all teachers ÷ Number of teachers',
        rawDataRequired: 'Training attendance registers/HR training logs',
        fallback:
          'Reconstruct from certificates/attendance sheets of past workshops for the current year; mandate a simple sign-in log for all future CPD sessions.',
      },
      {
        id: '2c',
        name: 'Ratio of activity-based to lecture-based sessions',
        formula: "Ratio = Lesson plans/observations tagged 'activity-based' ÷ those tagged 'lecture-based,' from a sample",
        rawDataRequired: 'Lesson plan submissions or observation tags',
        fallback:
          "Add a single 'primary mode' field (activity/lecture/mixed) to the lesson-plan template going forward; retroactively use a one-time observation-based sample.",
      },
      {
        id: '2d',
        name: 'Curriculum pacing adherence',
        formula: '% = (Topics actually covered by checkpoint date ÷ Topics planned by that date, per curriculum map) × 100',
        rawDataRequired: 'Curriculum/pacing chart vs. actual teacher progress logs',
        fallback:
          'If no pacing chart exists, this is a foundational gap — create a term-wise curriculum map per subject before the next cycle; a one-time setup with high long-term value.',
      },
      {
        id: '2e',
        name: 'Project-based learning instances per term, per grade',
        formula: 'Count = Number of documented cross-curricular/project-based activities conducted per term, per grade',
        rawDataRequired: 'Academic calendar/event records, teacher activity logs',
        fallback: 'If untracked, start a shared log (even a spreadsheet) where teachers record project-based activity from the next term.',
      },
    ],
    questions: [
      {
        id: '2a',
        metricId: '2a',
        text: 'Classes are interesting and easy to follow',
        respondent: 'student',
        followUp: 'What would make classes more engaging for you specifically?',
      },
      {
        id: '2b',
        metricId: '2b',
        text: 'I receive enough training/support to keep improving my teaching',
        respondent: 'teacher',
        followUp: 'What specific training would most improve your ability to teach the current syllabus?',
      },
      {
        id: '2c',
        metricId: '2c',
        text: 'Lessons include activities and discussion, not just lecture and copying notes',
        respondent: 'student',
        followUp: 'What kind of activity would make a lesson click better for you?',
      },
      {
        id: '2d',
        metricId: '2d',
        text: 'The pace of teaching matches what I can actually absorb — not rushed, not too slow',
        respondent: 'student',
        followUp: 'Which subject/topic feels most rushed or most dragged-out to you?',
      },
      {
        id: '2e',
        metricId: '2e',
        text: 'My child gets meaningful project/hands-on learning, not just textbook work',
        respondent: 'parent',
        followUp: 'What kind of project or hands-on activity would you like to see more of?',
      },
    ],
    gapNote:
      "A common pattern here is Teacher Perception being high ('I do plenty of activity-based teaching') while lesson-observation data shows mostly lecture-format sessions — cross-check self-report against actual observation data specifically for this dimension.",
  },
  {
    id: 'teacher_quality',
    name: 'Teacher Quality, Development & Retention',
    description:
      'Teacher effectiveness, professional growth, and whether the school is retaining its good teachers — often the single biggest predictor of long-term school quality.',
    controlProcesses: [
      'Structured induction and mentorship pairing for every new teacher',
      'Annual appraisal linking classroom observation data with student outcome trends',
      'Periodic compensation benchmarking against comparable schools in the region',
    ],
    realityMetrics: [
      {
        id: '3a',
        name: 'Annual teacher attrition rate',
        formula: '% = (Teachers who left during the year ÷ Average number of teachers employed during the year) × 100',
        rawDataRequired: 'HR employee master records (joining/exit dates)',
        fallback:
          "If HR records aren't digitized, reconstruct from payroll records or appointment/relieving letters for the past year; maintain a simple HR tracker going forward.",
      },
      {
        id: '3b',
        name: 'Average teacher tenure',
        formula: 'Average = Sum of (Current date − Joining date) for all current teachers ÷ Number of current teachers',
        rawDataRequired: 'HR joining-date records',
        fallback:
          "If joining dates aren't recorded for older staff, approximate using appointment letters or service certificates; mandate accurate record-keeping going forward.",
      },
      {
        id: '3c',
        name: '% teachers with required qualifications/certifications',
        formula: '% = (Teachers with verified required qualification on file ÷ Total teachers) × 100',
        rawDataRequired: 'HR personnel files/qualification documents',
        fallback:
          'Conduct a one-time verification drive collecting copies from all teachers; mandate qualification documentation as part of onboarding going forward.',
      },
      {
        id: '3d',
        name: 'Teacher absenteeism rate',
        formula: '% = (Total teacher-days absent ÷ Total possible teacher-days in the period) × 100',
        rawDataRequired: 'Staff attendance/biometric system logs',
        fallback:
          "If no biometric/digital system exists, use manual attendance registers; if even these are inconsistent, start a simple daily sign-in sheet immediately.",
      },
      {
        id: '3e',
        name: 'Teacher:student ratio, by grade/section',
        formula: 'Ratio = Total enrolled students ÷ Total teaching staff (full-time equivalent), by grade/section',
        rawDataRequired: 'Enrollment records + staffing records',
        fallback: 'Both inputs are almost always available; if not centralized, a one-time manual count from class registers and staff lists resolves this.',
      },
      {
        id: '3f',
        name: 'Substitute-teacher dependency rate',
        formula: '% = (Class-periods covered by substitutes ÷ Total class-periods in the period) × 100',
        rawDataRequired: 'Daily substitution/arrangement register',
        fallback: 'Most schools already keep a substitution register; if not, start one immediately — simple, low-cost, and useful operationally too.',
      },
    ],
    questions: [
      {
        id: '3a',
        metricId: '3a',
        text: "I don't see myself needing to leave this school in the next 1-2 years",
        respondent: 'teacher',
        followUp: 'What would most reduce any urge you have to consider leaving?',
      },
      {
        id: '3b',
        metricId: '3b',
        text: 'My child has consistent, experienced teachers year over year, not constant change',
        respondent: 'parent',
        followUp: 'What would improve teacher continuity for your child?',
      },
      {
        id: '3c',
        metricId: '3c',
        text: "I'm confident my child's teachers are well-qualified and know their subjects deeply",
        respondent: 'parent',
        followUp: 'What would increase your confidence in teacher qualifications?',
      },
      {
        id: '3d',
        metricId: '3d',
        text: 'My classes are rarely cancelled or disrupted because a teacher is absent',
        respondent: 'student',
        followUp: 'How often has teacher absence disrupted your learning, and what would help?',
      },
      {
        id: '3e',
        metricId: '3e',
        text: 'Class sizes are small enough for me/my child to get individual attention',
        respondent: 'parent',
        followUp: "What class-size change would most benefit your child's learning?",
      },
      {
        id: '3f',
        metricId: '3f',
        text: 'When my regular teacher is absent, the substitute arrangement still lets me learn well',
        respondent: 'student',
        followUp: 'What would make substitute-covered classes more effective for you?',
      },
    ],
    gapNote:
      'This is the dimension most prone to a dangerous blind spot — leadership often perceives teacher morale as fine right up until attrition data shows a spike. Track attrition and exit-interview themes as leading indicators, not just the annual satisfaction survey.',
  },
  {
    id: 'student_wellbeing',
    name: 'Student Wellbeing & Mental Health',
    description: 'The emotional, psychological, and social wellbeing of students — increasingly as important to families as academic results.',
    controlProcesses: [
      'Maintain an adequate counsellor-to-student ratio with regular sessions',
      'Structured Social-Emotional Learning (SEL) curriculum embedded in the timetable',
      'A confidential, anonymous check-in mechanism accessible to every student',
    ],
    realityMetrics: [
      {
        id: '4a',
        name: 'Counsellor caseload and average session frequency',
        formula: 'Avg. sessions/month = Total sessions ÷ Number of months; Caseload = Distinct students seen ÷ Number of counsellors',
        rawDataRequired: "Counsellor's session-count log (aggregate only, never case details)",
        fallback:
          'If no formal logging exists, introduce a simple confidential session-count log immediately — protects privacy while enabling capacity tracking.',
      },
      {
        id: '4b',
        name: 'Documented bullying/harassment incidents & resolution time',
        formula: 'Avg. resolution time = Sum of (Date closed − Date reported) across cases ÷ Number of cases',
        rawDataRequired: 'Anti-bullying committee incident register',
        fallback:
          'If no register exists, this is a priority gap given child-safety implications — institute a confidential incident-logging register from today, regardless of assessment timing.',
      },
      {
        id: '4c',
        name: 'Absenteeism patterns linked to stress',
        formula: '% = (Absences with a health-office/counsellor-flagged stress-related reason ÷ Total absences) × 100',
        rawDataRequired: 'Health office/nurse visit log cross-referenced with attendance',
        fallback:
          "If reasons for visits aren't tagged, add a simple reason-category field to the visit log going forward; until then use overall absenteeism rate as a rough proxy.",
      },
      {
        id: '4d',
        name: 'SEL program participation rate',
        formula: '% = (Students attending scheduled SEL sessions ÷ Total enrolled students) × 100',
        rawDataRequired: 'SEL session attendance records',
        fallback: "If no SEL program exists yet, this is a program-design gap, not just a data gap — pilot a basic SEL curriculum before it can be measured.",
      },
      {
        id: '4e',
        name: 'Anonymous wellbeing pulse-survey completion rate',
        formula: '% = (Survey responses received ÷ Total students invited) × 100',
        rawDataRequired: 'Survey platform response logs',
        fallback: 'If no prior survey exists, this is simply the first data point — launch the first cycle as part of this assessment, no reconstruction needed.',
      },
    ],
    questions: [
      {
        id: '4a',
        metricId: '4a',
        text: 'If I needed to see the counsellor, I could get an appointment without a long wait',
        respondent: 'student',
        followUp: 'What would make counselling more accessible to you?',
      },
      {
        id: '4b',
        metricId: '4b',
        text: 'When bullying or conflict is reported, it gets resolved reasonably quickly',
        respondent: 'student',
        followUp: 'Describe a case where resolution felt too slow, and what would have sped it up.',
      },
      {
        id: '4c',
        metricId: '4c',
        text: "I don't believe my child avoids school due to stress or anxiety",
        respondent: 'parent',
        followUp: 'What signs of school-related stress have you noticed, and what would help address them?',
      },
      {
        id: '4d',
        metricId: '4d',
        text: 'The SEL/life-skills sessions genuinely help me manage emotions and relationships',
        respondent: 'student',
        followUp: 'What would make these sessions more useful to you?',
      },
      {
        id: '4e',
        metricId: '4e',
        text: 'I feel comfortable honestly answering wellbeing surveys/check-ins at school',
        respondent: 'student',
        followUp: 'What would make you more willing to answer honestly?',
      },
    ],
    gapNote:
      "Handle this dimension's data with strict confidentiality — always report in aggregate, never in a way that could identify an individual student, even to the Board.",
  },
  {
    id: 'student_discipline',
    name: 'Student Discipline & Behavior',
    description:
      'How consistently and fairly the school manages student conduct — a restorative, well-understood system rather than a purely punitive or inconsistent one.',
    controlProcesses: [
      'A clear, published code of conduct, reviewed annually with student/parent input',
      'A restorative-justice-oriented disciplinary process, not purely punitive',
      'Centralized incident-logging so patterns can be tracked across sections and teachers',
    ],
    realityMetrics: [
      {
        id: '5a',
        name: 'Disciplinary incidents by type, severity, and section',
        formula: 'Count and categorize incidents from the discipline log, tabulated by type/severity/section',
        rawDataRequired: 'Discipline/incident register maintained by class teachers or discipline in-charge',
        fallback:
          'If incidents are only handled verbally without logging, institute a standard incident-report form immediately — needed for consistent enforcement regardless.',
      },
      {
        id: '5b',
        name: 'Repeat-offender rate',
        formula: '% = (Students with 2+ logged incidents in the period ÷ Students with at least 1 incident) × 100',
        rawDataRequired: 'Discipline register, linked by student ID',
        fallback: 'Requires the incident register above to exist and be linked by student — build this in alongside the register itself.',
      },
      {
        id: '5c',
        name: 'Suspension/expulsion count',
        formula: 'Simple count from administrative records for the period',
        rawDataRequired: 'Formal suspension/expulsion order records',
        fallback: "Usually already well-documented for compliance; if not centrally compiled, a quick pull from the principal's office files resolves it.",
      },
      {
        id: '5d',
        name: 'Average time-to-resolution for incidents',
        formula: 'Average = Sum of (Date resolved − Date reported) across incidents ÷ Number of incidents',
        rawDataRequired: 'Discipline register with both reported and resolved dates',
        fallback: "If resolution dates aren't logged, add a 'date closed' field to the incident form going forward.",
      },
      {
        id: '5e',
        name: 'Consistency-of-enforcement audit',
        formula: 'Periodic qualitative comparison of how similar-severity incidents were handled across teachers/sections',
        rawDataRequired: 'Discipline register, cross-tabulated by handling teacher/section',
        fallback: 'Requires the incident register plus a designated reviewer (e.g., academic coordinator) to conduct the comparison periodically.',
      },
    ],
    questions: [
      {
        id: '5a',
        metricId: '5a',
        text: 'I can rely on a clear, consistent process when a discipline incident occurs in my class',
        respondent: 'teacher',
        followUp: 'What part of the incident-handling process feels unclear or inconsistent?',
      },
      {
        id: '5b',
        metricId: '5b',
        text: 'Our disciplinary approach actually helps repeat behavior issues improve, not just punishes them',
        respondent: 'teacher',
        followUp: 'What would help address repeat behavior issues more effectively?',
      },
      {
        id: '5c',
        metricId: '5c',
        text: 'Suspension/expulsion is used fairly, as a last resort, not overused',
        respondent: 'parent',
        followUp: 'What would make you trust this process is used fairly?',
      },
      {
        id: '5d',
        metricId: '5d',
        text: 'When I report or am involved in a discipline issue, it gets resolved in reasonable time',
        respondent: 'student',
        followUp: 'What delayed resolution the most in your experience?',
      },
      {
        id: '5e',
        metricId: '5e',
        text: 'Rules are applied the same way regardless of which teacher or section is involved',
        respondent: 'student',
        followUp: 'Where have you seen inconsistent enforcement, and what would fix it?',
      },
    ],
    gapNote:
      'A common pattern is Teacher Perception of "fair enforcement" being high while student surveys report perceived favoritism — the consistency audit is the Reality-side check that resolves this.',
  },
  {
    id: 'infrastructure_facilities',
    name: 'Infrastructure & Facilities',
    description:
      "The physical assets of the school — classrooms, labs, library, sports facilities, sanitation, and IT hardware — covered heavily under CBSE SQAA's Infrastructure domain.",
    controlProcesses: [
      'Annual infrastructure audit checklist aligned to CBSE SQAA benchmarking statements',
      'A preventive (not just reactive) maintenance schedule with logged ticket resolution times',
      'Facility-utilization tracking (are labs/library/sports facilities actually being used?)',
    ],
    realityMetrics: [
      {
        id: '6a',
        name: 'Facility condition audit score',
        formula: 'Score = Average of standardized checklist ratings (e.g., 1-5) across all inspected facility categories',
        rawDataRequired: 'Physical inspection checklist, completed by facilities/admin staff',
        fallback:
          'If no audit has been done, conduct a one-time baseline walkthrough using a CBSE-SQAA-style checklist before the assessment; repeat annually going forward.',
      },
      {
        id: '6b',
        name: 'Maintenance ticket resolution time',
        formula: 'Average = Sum of (Date resolved − Date logged) across tickets ÷ Number of tickets',
        rawDataRequired: 'Facilities/maintenance request log',
        fallback: 'If requests are handled informally (verbal only), institute a simple ticket log — even a shared register — immediately.',
      },
      {
        id: '6c',
        name: 'Lab/library utilization hours per week',
        formula: 'Hours/week = Sum of booked/used hours across all lab & library sessions in a week',
        rawDataRequired: 'Lab/library booking or sign-in register',
        fallback: 'If no booking system exists, add a simple sign-in sheet at each facility from the next term.',
      },
      {
        id: '6d',
        name: 'Student:facility ratios vs. CBSE norms',
        formula: "Ratio = Total enrolled students ÷ Number of facility units (toilets, drinking-water points), vs. CBSE's prescribed norm",
        rawDataRequired: 'Facility count (infrastructure records) + enrollment count',
        fallback:
          'Facility counts are typically countable on a walkthrough even without formal records — a one-time physical count resolves this immediately.',
      },
      {
        id: '6e',
        name: 'IT device:student ratio; internet uptime %',
        formula: 'Device ratio = Functional devices ÷ Students; Uptime % = (Hours functional ÷ Total hours monitored) × 100',
        rawDataRequired: 'IT asset inventory + network monitoring logs (or manual outage log)',
        fallback:
          'If no formal inventory exists, conduct a one-time device count; for uptime, start a manual outage log (date/time/duration) if no monitoring tool is used — free tools are also readily available.',
      },
    ],
    questions: [
      {
        id: '6a',
        metricId: '6a',
        text: 'Overall, school facilities are well-maintained and in good condition',
        respondent: 'parent',
        followUp: 'Which specific facility, if improved, would most change your impression of the school?',
      },
      {
        id: '6b',
        metricId: '6b',
        text: 'When I report a classroom/facility issue, it gets fixed in reasonable time',
        respondent: 'teacher',
        followUp: 'Describe a slow repair and what would speed up the process.',
      },
      {
        id: '6c',
        metricId: '6c',
        text: 'I get enough access time to labs/library when I need them',
        respondent: 'student',
        followUp: 'What access limitation frustrates you most?',
      },
      {
        id: '6d',
        metricId: '6d',
        text: 'Basic facilities (toilets, drinking water) are sufficient and clean',
        respondent: 'student',
        followUp: 'What specific facility feels insufficient?',
      },
      {
        id: '6e',
        metricId: '6e',
        text: 'I have reliable access to working devices/internet when I need them for teaching',
        respondent: 'teacher',
        followUp: 'What tech reliability issue disrupts your teaching most?',
      },
    ],
    gapNote:
      'Infrastructure perception gaps are often about visibility, not quality — a well-equipped but rarely-shown facility scores lower on Perception than its Reality condition warrants.',
  },
  {
    id: 'safety_security',
    name: 'Safety & Security',
    description: 'Physical safety on campus and during transport — campus security, emergency preparedness, transport safety, and child-protection compliance.',
    controlProcesses: [
      'CCTV coverage audit against a defined campus-coverage standard',
      'GPS-tracked transport with a defined attendant policy on every route',
      'An active, trained Child Protection/POCSO committee with documented meeting cadence',
    ],
    realityMetrics: [
      {
        id: '7a',
        name: 'Safety-drill frequency and compliance %',
        formula: '% = (Drills actually conducted as scheduled ÷ Drills planned per policy) × 100',
        rawDataRequired: 'Drill schedule vs. drill completion log',
        fallback:
          "If no drill schedule/log exists, this is a compliance priority — create a mandatory drill calendar and logging process immediately, independent of assessment timing.",
      },
      {
        id: '7b',
        name: 'CCTV coverage % of campus',
        formula: '% = (Campus area under camera coverage ÷ Total campus area) × 100, estimated from a coverage map',
        rawDataRequired: 'CCTV system layout/coverage map',
        fallback:
          'If no coverage map exists, request one from the security vendor, or conduct a walkthrough marking covered vs. uncovered zones on a campus map.',
      },
      {
        id: '7c',
        name: 'Transport safety incident count',
        formula: 'Simple count of logged transport-related incidents (accidents, near-misses, complaints) in the period',
        rawDataRequired: 'Transport department incident log',
        fallback:
          'If not centrally logged, institute a simple incident-reporting process for transport staff/attendants immediately, given safety criticality.',
      },
      {
        id: '7d',
        name: 'Security-staff:student ratio',
        formula: 'Ratio = Total enrolled students ÷ Total security staff on duty',
        rawDataRequired: 'Enrollment + security staffing records',
        fallback: 'Both are typically readily available; if not centralized, a quick manual count resolves this.',
      },
      {
        id: '7e',
        name: 'Background-check completion rate for staff/vendors',
        formula: '% = (Staff/vendors with verified background check on file ÷ Total staff/vendors) × 100',
        rawDataRequired: 'HR/vendor-management verification records',
        fallback:
          'If not tracked, conduct a one-time audit/verification drive and file results; mandate as part of onboarding going forward — a serious compliance gap if missing.',
      },
    ],
    questions: [
      {
        id: '7a',
        metricId: '7a',
        text: 'I know what to do in a fire/earthquake/lockdown drill because we practice regularly',
        respondent: 'student',
        followUp: 'What part of drill preparedness feels unclear to you?',
      },
      {
        id: '7b',
        metricId: '7b',
        text: "I'm confident the campus has adequate security camera coverage",
        respondent: 'parent',
        followUp: 'Which campus area concerns you most regarding surveillance/safety?',
      },
      {
        id: '7c',
        metricId: '7c',
        text: 'I trust the school transport (bus) is safe and well-supervised',
        respondent: 'parent',
        followUp: 'What transport safety concern, if any, would you raise?',
      },
      {
        id: '7d',
        metricId: '7d',
        text: 'There is adequate security presence on campus at all times',
        respondent: 'parent',
        followUp: 'When/where do you feel security presence is lacking?',
      },
      {
        id: '7e',
        metricId: '7e',
        text: 'I trust that all staff and vendors interacting with my child are properly vetted',
        respondent: 'parent',
        followUp: 'What would increase your confidence in staff/vendor vetting?',
      },
    ],
    gapNote:
      'Safety is a dimension where a large Perception-greater-than-Reality gap is especially dangerous — parents trusting a system with real gaps is exactly the blind-spot pattern most likely to produce a severe incident. Treat any gap here as urgent regardless of its numerical size.',
  },
  {
    id: 'parent_engagement',
    name: 'Parent Satisfaction & Engagement',
    description: 'How satisfied parents are and how genuinely involved they are in school life — a major driver of retention, referrals, and reputation.',
    controlProcesses: [
      'A structured PTM calendar with systematic feedback capture',
      "A parent portal/app giving real-time visibility into academics and communication",
      'A defined grievance-redressal SLA (e.g., acknowledge within 24 hrs, resolve within 7 days)',
    ],
    realityMetrics: [
      {
        id: '8a',
        name: 'PTM attendance rate',
        formula: '% = (Parents who attended ÷ Total parents invited) × 100, per PTM cycle',
        rawDataRequired: 'PTM sign-in sheets/attendance records',
        fallback: 'If not currently logged, add a simple sign-in sheet at the next PTM — a trivial, immediate fix.',
      },
      {
        id: '8b',
        name: 'Parent-portal/app active engagement rate',
        formula: '% = (Parents with ≥1 login/action in the period ÷ Total registered parent accounts) × 100',
        rawDataRequired: 'Portal/app analytics/backend logs',
        fallback:
          "If the school has no digital portal yet, this doesn't apply — substitute with response rate to physical circulars/newsletters, and treat this as a signal to evaluate adopting one.",
      },
      {
        id: '8c',
        name: 'Grievance count and resolution time',
        formula: 'Average = Sum of (Date resolved − Date raised) across grievances ÷ Number of grievances',
        rawDataRequired: 'Grievance/complaint register',
        fallback:
          'If grievances are handled informally without logging, institute a simple register immediately — also useful for governance/compliance.',
      },
      {
        id: '8d',
        name: 'Parent-committee participation rate',
        formula: '% = (Parents actively participating ÷ Total committee members) × 100',
        rawDataRequired: 'Committee attendance/activity records',
        fallback: 'If not tracked, start logging attendance at committee meetings from the next cycle.',
      },
      {
        id: '8e',
        name: 'Fee-payment delinquency rate',
        formula: '% = (Students with overdue fee payments ÷ Total enrolled students) × 100',
        rawDataRequired: 'Finance/accounts fee-ledger records',
        fallback: 'Almost always already tracked in accounting systems; if not, a one-time pull from the fee ledger resolves it.',
      },
      {
        id: '8f',
        name: 'Re-enrollment/renewal rate',
        formula: '% = (Students re-enrolled for next year ÷ Total eligible students, excluding graduates) × 100',
        rawDataRequired: 'Admissions/enrollment records across two consecutive years',
        fallback:
          "If year-on-year records aren't linked by ID, a one-time manual cross-check between two years' enrollment lists resolves this, even retroactively.",
      },
    ],
    questions: [
      {
        id: '8a',
        metricId: '8a',
        text: 'PTMs are scheduled and structured in a way that makes it easy for me to attend',
        respondent: 'parent',
        followUp: 'What would make PTMs easier for you to attend or more valuable?',
      },
      {
        id: '8b',
        metricId: '8b',
        text: 'The parent portal/app gives me the real-time information I need about my child',
        respondent: 'parent',
        followUp: 'What information or feature is missing from the portal?',
      },
      {
        id: '8c',
        metricId: '8c',
        text: 'My grievances/concerns get resolved satisfactorily',
        respondent: 'parent',
        followUp: "Describe a concern that wasn't resolved to your satisfaction, and what resolution you expected.",
      },
      {
        id: '8d',
        metricId: '8d',
        text: 'I feel welcome and able to participate in parent committees/school activities',
        respondent: 'parent',
        followUp: 'What barrier stops you from participating more?',
      },
      {
        id: '8e',
        metricId: '8e',
        text: 'The fee payment process and schedule work well for my family',
        respondent: 'parent',
        followUp: 'What would make fee payment more manageable for you?',
      },
      {
        id: '8f',
        metricId: '8f',
        text: "I plan to continue my child's education at this school next year",
        respondent: 'parent',
        followUp: 'What, if anything, makes you hesitate about continuing here?',
      },
    ],
    gapNote:
      "Re-enrollment intent (the last question above) is this dimension's closest analogue to a standard NPS score and should be tracked as the core loyalty indicator over time. Re-enrollment RATE (the Reality metric) remains the strongest proxy — a 'revealed preference,' harder to game than a survey response. If stated intent is high but actual re-enrollment is quietly slipping, investigate immediately.",
  },
  {
    id: 'student_engagement',
    name: 'Student Satisfaction & Engagement',
    description:
      'The lived student experience and sense of belonging — distinct from academic performance or wellbeing, this is about whether students actively want to be there.',
    controlProcesses: [
      'A functioning student council with real influence on decisions',
      "Regular short 'pulse surveys' rather than one long annual survey",
      "Deliberate tracking of extracurricular breadth so engagement isn't concentrated in a small group",
    ],
    realityMetrics: [
      {
        id: '9a',
        name: '% students participating in at least one extracurricular activity',
        formula: '% = (Students enrolled in ≥1 activity ÷ Total enrolled students) × 100',
        rawDataRequired: 'Activity/club enrollment records',
        fallback: 'If only per-activity lists exist, consolidate into one master list — a one-time administrative task.',
      },
      {
        id: '9b',
        name: 'Overall attendance rate',
        formula: '% = (Total student-days present ÷ Total possible student-days) × 100',
        rawDataRequired: 'Daily attendance registers/biometric system',
        fallback: 'Virtually all schools already track this; if only paper registers exist, a manual tally for the period resolves it.',
      },
      {
        id: '9c',
        name: 'Student council activity frequency',
        formula: 'Count = Number of documented council initiatives/meetings held in the period',
        rawDataRequired: 'Student council records/minutes',
        fallback:
          "If no council exists or isn't documented, this is a program-design gap — consider establishing a structured council before it can be meaningfully measured.",
      },
      {
        id: '9d',
        name: 'Inter-house/inter-school competition participation breadth',
        formula: '% = (Unique students participating in ≥1 competition ÷ Total enrolled students) × 100',
        rawDataRequired: 'Competition participation/registration records',
        fallback: 'If only winners are recorded, start capturing full participant rosters from the next event.',
      },
      {
        id: '9e',
        name: 'Library book-issue rate per student',
        formula: 'Rate = Total books issued in the period ÷ Total enrolled students',
        rawDataRequired: 'Library issue/return register or library management system',
        fallback: 'If records are manual/incomplete, a simple issue register (even a notebook log) resolves this going forward.',
      },
    ],
    questions: [
      {
        id: '9a',
        metricId: '9a',
        text: "I'm involved in at least one club/activity that I genuinely enjoy",
        respondent: 'student',
        followUp: 'What activity would you join if it were offered or more accessible?',
      },
      {
        id: '9b',
        metricId: '9b',
        text: 'I look forward to coming to school most days',
        respondent: 'student',
        followUp: 'What would make you more excited to come to school?',
      },
      {
        id: '9c',
        metricId: '9c',
        text: 'The student council/student voice mechanism represents my interests',
        respondent: 'student',
        followUp: 'What issue do you wish the student council addressed?',
      },
      {
        id: '9d',
        metricId: '9d',
        text: 'I have a genuine chance to compete/participate in inter-house or inter-school events, not just watch',
        respondent: 'student',
        followUp: "What's stopping you from participating more in competitions?",
      },
      {
        id: '9e',
        metricId: '9e',
        text: 'I use the library regularly and find the books/resources I want',
        respondent: 'student',
        followUp: 'What would make you use the library more?',
      },
    ],
    gapNote:
      'Watch for extracurricular participation being dominated by a small, repeat group of students — segment this data by student, not just report the overall percentage.',
  },
  {
    id: 'leadership_governance',
    name: 'Leadership & Governance',
    description:
      "The quality, transparency, and effectiveness of school management and decision-making — CBSE SQAA's Leadership and Governance domain.",
    controlProcesses: [
      'Regular School Management Committee meetings with documented minutes',
      'A defined policy-review cycle, not ad hoc reactive changes',
      'A structured 360-degree feedback process for leadership',
    ],
    realityMetrics: [
      {
        id: '10a',
        name: 'SMC meeting frequency and quorum rate',
        formula:
          'Frequency = Meetings held ÷ Meetings required per policy; Quorum rate = Meetings with quorum ÷ Total meetings',
        rawDataRequired: 'SMC meeting minutes/attendance records',
        fallback:
          "If minutes aren't formally kept, this is a governance compliance gap — start formal minute-keeping immediately, independent of assessment timing.",
      },
      {
        id: '10b',
        name: 'Policy review/update frequency',
        formula: 'Count = Policies formally reviewed/updated in the period ÷ Total active policies',
        rawDataRequired: 'Policy register with review-date tracking',
        fallback:
          'If no policy register exists, create one listing all current policies with last-reviewed dates — a one-time documentation exercise.',
      },
      {
        id: '10c',
        name: 'Leadership-role turnover rate',
        formula: '% = (Leadership roles vacated in the period ÷ Total leadership roles) × 100',
        rawDataRequired: 'HR records for leadership positions specifically',
        fallback: 'Reconstruct from appointment records if not separately tracked, same as the general HR fallback.',
      },
      {
        id: '10d',
        name: 'Decision-implementation lag time',
        formula: 'Average = Sum of (Date implemented − Date decided) across tracked decisions ÷ Number of decisions',
        rawDataRequired: 'Meeting minutes (decision date) + implementation records/circulars (implementation date)',
        fallback:
          "If decisions aren't formally dated/tracked, start a simple decision log (decision, owner, target date, actual date) from the next SMC meeting.",
      },
      {
        id: '10e',
        name: 'Audit/compliance finding closure rate',
        formula: '% = (Findings closed within the period ÷ Total findings raised) × 100',
        rawDataRequired: 'Internal/external audit reports with finding-status tracking',
        fallback: "If findings aren't tracked to closure, institute a simple tracker immediately — critical for governance and regulatory risk.",
      },
    ],
    questions: [
      {
        id: '10a',
        metricId: '10a',
        text: 'I\'m confident the School Management Committee meets regularly and functions well',
        respondent: 'parent',
        followUp: 'What would increase your confidence in SMC functioning?',
      },
      {
        id: '10b',
        metricId: '10b',
        text: 'School policies are kept up to date and relevant, not outdated',
        respondent: 'teacher',
        followUp: 'Which policy feels outdated or unclear to you?',
      },
      {
        id: '10c',
        metricId: '10c',
        text: 'Leadership positions here are stable, not constantly changing',
        respondent: 'teacher',
        followUp: 'How has any leadership turnover affected you or your work?',
      },
      {
        id: '10d',
        metricId: '10d',
        text: 'When leadership makes a decision, it gets implemented in reasonable time',
        respondent: 'teacher',
        followUp: 'Describe a decision that took too long to implement, and why.',
      },
      {
        id: '10e',
        metricId: '10e',
        text: 'I trust the school takes audit/compliance findings seriously and resolves them',
        respondent: 'teacher',
        followUp: 'What would increase your trust in how compliance issues are handled?',
      },
    ],
    gapNote:
      'This dimension often shows a gap between how management perceives its own transparency and how staff/parents actually experience it — the 360-feedback mechanism exists specifically to surface this gap objectively.',
  },
  {
    id: 'financial_health',
    name: 'Financial Health & Sustainability',
    description:
      "The school's underlying financial stability — critical for a private institution, and directly connected to staff confidence, infrastructure investment, and fee-setting decisions.",
    controlProcesses: [
      'Quarterly budget-vs-actual variance review, shared with the Board/management committee',
      'Periodic fee-structure benchmarking against comparable regional schools',
      'A defined reserve-fund policy (minimum operating-cost coverage)',
    ],
    realityMetrics: [
      {
        id: '11a',
        name: 'Fee collection rate/delinquency %',
        formula: '% = (Fee amount collected ÷ Fee amount billed) × 100',
        rawDataRequired: 'Finance/accounts ledger',
        fallback: 'Always available in any functioning accounting system; if manual, a one-time reconciliation resolves it.',
      },
      {
        id: '11b',
        name: 'Operating margin, trended over years',
        formula: 'Margin % = [(Total revenue − Total operating cost) ÷ Total revenue] × 100, tracked year-on-year',
        rawDataRequired: 'Annual financial statements/income-expenditure records',
        fallback:
          "If formal financial statements aren't prepared, engage an accountant to prepare at least a simple income-expenditure statement before this can be tracked.",
      },
      {
        id: '11c',
        name: 'Cost-per-student trend',
        formula: 'Cost/student = Total operating cost ÷ Total enrolled students, tracked year-on-year',
        rawDataRequired: 'Financial statements + enrollment records',
        fallback: 'Requires basic financial statement preparation as a prerequisite — same fallback as operating margin above.',
      },
      {
        id: '11d',
        name: 'Reserve-fund-to-operating-cost ratio',
        formula: "Ratio = Reserve/contingency fund balance ÷ Average monthly operating cost (gives 'months covered')",
        rawDataRequired: 'Balance sheet/reserve fund records',
        fallback:
          'If no formal reserve fund is maintained, this reveals a genuine policy gap, not a data problem — recommend establishing a reserve-fund policy going forward.',
      },
      {
        id: '11e',
        name: 'Scholarship disbursement vs. budget',
        formula: '% = (Actual scholarship amount disbursed ÷ Budgeted scholarship amount) × 100',
        rawDataRequired: 'Finance records + scholarship program budget',
        fallback:
          'If no formal scholarship budget exists, this is a policy gap — recommend formalizing a scholarship budget and tracking process.',
      },
    ],
    questions: [
      {
        id: '11a',
        metricId: '11a',
        text: 'The fee payment/collection process feels fair and consistently applied to all families',
        respondent: 'parent',
        followUp: 'What about the fee process feels unfair or inconsistent?',
      },
      {
        id: '11b',
        metricId: '11b',
        text: "I'm confident in the school's financial trajectory over the next 3 years",
        respondent: 'admin',
        followUp: 'What financial risk worries you most?',
      },
      {
        id: '11c',
        metricId: '11c',
        text: "The school's cost structure is efficient relative to the value delivered to students",
        respondent: 'admin',
        followUp: 'Where do you see the biggest opportunity to improve cost efficiency?',
      },
      {
        id: '11d',
        metricId: '11d',
        text: 'The school has an adequate financial safety buffer for unexpected events',
        respondent: 'admin',
        followUp: "What would you do to strengthen the school's financial buffer?",
      },
      {
        id: '11e',
        metricId: '11e',
        text: 'Scholarship/financial-aid support is accessible and fairly distributed to families who need it',
        respondent: 'parent',
        followUp: 'What would improve access to financial aid at this school?',
      },
    ],
    gapNote:
      "Much of this dimension's Reality data is appropriately internal-only, but the Board and senior management need this gap tracked closely — financial blind spots are often the slowest to surface and the most damaging once they do.",
  },
  {
    id: 'admissions_market',
    name: 'Admissions, Enrollment & Market Position (Brand/Reputation)',
    description: 'How the school is perceived externally, and how that perception translates into actual enrollment health and competitive standing.',
    controlProcesses: [
      'A structured admissions-inquiry-to-enrollment funnel tracked in a CRM',
      'An active alumni engagement program',
      'Systematic tracking of referral sources for new admissions',
    ],
    realityMetrics: [
      {
        id: '12a',
        name: 'Inquiry-to-admission conversion rate',
        formula: '% = (Admissions confirmed ÷ Total inquiries received) × 100',
        rawDataRequired: 'Admissions CRM/inquiry log',
        fallback:
          "If inquiries aren't logged (only final admissions recorded), start logging every inquiry from the next cycle — without this, conversion rate can't be calculated at all, only totals.",
      },
      {
        id: '12b',
        name: 'Year-on-year enrollment trend, by grade',
        formula: '% change = [(Current year enrollment − Previous year) ÷ Previous year] × 100, per grade',
        rawDataRequired: 'Enrollment records across years',
        fallback:
          "Almost always available since enrollment is a core administrative record; if not organized by year/grade, a one-time reorganization resolves it.",
      },
      {
        id: '12c',
        name: 'Waitlist length, by grade',
        formula: 'Simple count of students on the waitlist per grade at a point in time',
        rawDataRequired: 'Admissions waitlist records',
        fallback: 'If no formal waitlist is maintained, start a simple waitlist register from the next admission cycle.',
      },
      {
        id: '12d',
        name: 'Mid-year withdrawal/attrition rate',
        formula: '% = (Mid-year withdrawals ÷ Total enrolled at year start) × 100',
        rawDataRequired: 'Admissions/enrollment withdrawal records',
        fallback: 'If not logged, reconstruct from Transfer Certificate (TC) issuance records, which schools are required to maintain.',
      },
      {
        id: '12e',
        name: 'Source of new admissions (referral % vs. marketing % vs. walk-in)',
        formula: '% breakdown = Count of admissions per source ÷ Total new admissions, by category',
        rawDataRequired: "Admissions inquiry form (with a 'how did you hear about us' field)",
        fallback:
          "If the inquiry form doesn't capture source, add this single field immediately — a trivial change with high analytical value.",
      },
      {
        id: '12f',
        name: 'Alumni engagement participation rate',
        formula: '% = (Alumni participating in ≥1 engagement activity ÷ Total contactable alumni) × 100',
        rawDataRequired: 'Alumni database + event participation records',
        fallback:
          'If no alumni database exists, this is a foundational gap — start building one (even from old admission records/yearbooks) as a prerequisite.',
      },
    ],
    questions: [
      {
        id: '12a',
        metricId: '12a',
        text: 'The admissions process was smooth and informative from inquiry to decision',
        respondent: 'other',
        followUp: 'What part of the admissions process could be improved?',
      },
      {
        id: '12b',
        metricId: '12b',
        text: 'I sense this school is growing and thriving, not shrinking',
        respondent: 'parent',
        followUp: 'What gives you that impression, positive or negative?',
      },
      {
        id: '12c',
        metricId: '12c',
        text: 'The waitlist/admission-decision process was communicated clearly and on time',
        respondent: 'other',
        followUp: 'What communication gap did you experience during the waitlist process?',
      },
      {
        id: '12d',
        metricId: '12d',
        text: "I don't know of other families leaving mid-year for concerning reasons",
        respondent: 'parent',
        followUp: 'What reasons, if any, have you heard for families leaving?',
      },
      {
        id: '12e',
        metricId: '12e',
        text: 'I would confidently refer other families to this school',
        respondent: 'parent',
        followUp: 'What would make you refer more actively?',
      },
      {
        id: '12f',
        metricId: '12f',
        text: 'I stay connected with and feel positive about my school after graduating',
        respondent: 'other',
        followUp: 'What would increase your engagement with the school as an alum?',
      },
    ],
    gapNote:
      'Referral source data is one of the most underused Reality metrics available — if referral-driven admissions are declining even while survey-based satisfaction stays flat, that\'s an early leading indicator worth investigating well before enrollment numbers themselves drop.',
  },
  {
    id: 'technology_digital',
    name: 'Technology & Digital Readiness',
    description: 'How effectively the school uses technology for teaching, administration, and communication — increasingly a differentiator parents actively evaluate.',
    controlProcesses: [
      'A structured EdTech adoption training calendar for teachers',
      'A clear LMS usage policy with defined minimum expectations',
      'A documented cybersecurity and student-data-privacy policy',
    ],
    realityMetrics: [
      {
        id: '13a',
        name: 'LMS/portal active-usage rate',
        formula:
          '% = (Users with ≥1 login/activity in the period ÷ Total registered users) × 100, separately for teachers and students',
        rawDataRequired: 'LMS/portal backend analytics',
        fallback: "If no LMS exists, this doesn't apply yet — flag as a foundational technology gap rather than a data gap.",
      },
      {
        id: '13b',
        name: 'Device:student ratio',
        formula: 'Ratio = Total functional student-accessible devices ÷ Total enrolled students',
        rawDataRequired: 'IT asset inventory',
        fallback: 'If no formal inventory exists, conduct a one-time physical count/audit.',
      },
      {
        id: '13c',
        name: 'IT-helpdesk ticket resolution time',
        formula: 'Average = Sum of (Date resolved − Date logged) across tickets ÷ Number of tickets',
        rawDataRequired: 'IT helpdesk ticketing system or manual request log',
        fallback: 'If requests are handled informally, institute a simple ticket log (even email-based) immediately.',
      },
      {
        id: '13d',
        name: '% of lessons using digital tools',
        formula: '% = (Observed/logged lessons using digital tools ÷ Total lessons observed) × 100',
        rawDataRequired: 'Lesson observation records (same source as Curriculum & Pedagogy Quality)',
        fallback: "Same fallback as the Curriculum dimension's observation metric — requires an observation program to exist.",
      },
      {
        id: '13e',
        name: 'Cybersecurity incident count',
        formula: 'Simple count of logged cybersecurity/data-privacy incidents in the period',
        rawDataRequired: 'IT security incident log',
        fallback: 'If not tracked, institute a simple incident log immediately, given rising data-privacy obligations for student data.',
      },
    ],
    questions: [
      {
        id: '13a',
        metricId: '13a',
        text: "I actively and regularly use the school's LMS/digital tools",
        respondent: 'teacher',
        followUp: 'What barrier stops you from using it more?',
      },
      {
        id: '13b',
        metricId: '13b',
        text: 'I have adequate access to a working device when I need one for schoolwork',
        respondent: 'student',
        followUp: 'When have you lacked device access, and what would help?',
      },
      {
        id: '13c',
        metricId: '13c',
        text: 'When I report a tech issue, it gets resolved quickly',
        respondent: 'teacher',
        followUp: 'Describe a slow IT resolution and what would speed it up.',
      },
      {
        id: '13d',
        metricId: '13d',
        text: 'Technology is used well in my learning, not just for its own sake',
        respondent: 'student',
        followUp: "Describe a time technology genuinely helped (or didn't help) you learn.",
      },
      {
        id: '13e',
        metricId: '13e',
        text: "I trust the school protects my child's personal/academic data appropriately",
        respondent: 'parent',
        followUp: 'What would increase your trust in how the school handles data privacy?',
      },
    ],
    gapNote:
      "A common pattern: high portal 'registration' numbers (a weak metric) mask low actual active-usage rates (a better metric) — always measure engagement, not just enrollment, on any digital platform.",
  },
  {
    id: 'cocurricular_holistic',
    name: 'Co-curricular, Extracurricular & Holistic Development',
    description:
      "Sports, arts, life-skills, and values education — the 'beyond academics' development that CBSE SQAA treats as a full co-scholastic domain, and that increasingly drives parent choice.",
    controlProcesses: [
      'A structured co-curricular calendar with a defined minimum participation expectation',
      'A planned inter-school competition calendar, not opportunistic entry',
      'Life-skills/values curriculum genuinely integrated into the timetable',
    ],
    realityMetrics: [
      {
        id: '14a',
        name: '% students participating in at least one co-curricular activity',
        formula: '% = (Students enrolled in ≥1 co-curricular activity ÷ Total enrolled students) × 100',
        rawDataRequired: 'Activity enrollment records',
        fallback: 'Consolidate per-activity rosters into one master list — a one-time administrative task.',
      },
      {
        id: '14b',
        name: 'Inter-school competition participation and results count',
        formula: 'Count = Competitions entered + Results (wins/placements) achieved, per term',
        rawDataRequired: 'Competition participation/results records',
        fallback:
          'If not centrally compiled, reconstruct from certificates/trophies awarded and teacher-in-charge records — usually recoverable even retroactively.',
      },
      {
        id: '14c',
        name: 'Sports/arts infrastructure utilization hours per week',
        formula: 'Hours/week = Sum of booked/used hours across all sports & arts facilities in a week',
        rawDataRequired: 'Facility booking/usage register',
        fallback: 'If no booking system exists, add a simple sign-in sheet at each facility from the next term.',
      },
      {
        id: '14d',
        name: 'Life-skills curriculum completion rate',
        formula: '% = (Life-skills sessions actually conducted ÷ Sessions planned per the academic calendar) × 100',
        rawDataRequired: 'Academic calendar vs. actual session logs',
        fallback: "If not tracked separately from regular classes, add a simple session log immediately.",
      },
      {
        id: '14e',
        name: 'House-system participation metrics',
        formula: '% = (Students participating in ≥1 house-system event ÷ Total enrolled students) × 100',
        rawDataRequired: 'House event participation records',
        fallback: 'If not tracked, start logging participation at house events from the next cycle.',
      },
    ],
    questions: [
      {
        id: '14a',
        metricId: '14a',
        text: 'My child has genuine opportunities in sports/arts/co-curricular areas, not just academics',
        respondent: 'parent',
        followUp: 'What co-curricular opportunity is missing for your child?',
      },
      {
        id: '14b',
        metricId: '14b',
        text: 'I have real opportunities to represent the school in competitions if I want to',
        respondent: 'student',
        followUp: "What's stopping you from competing more?",
      },
      {
        id: '14c',
        metricId: '14c',
        text: 'I get enough access/time to use sports/arts facilities',
        respondent: 'student',
        followUp: 'What access limitation frustrates you most?',
      },
      {
        id: '14d',
        metricId: '14d',
        text: 'Life-skills/values sessions are actually happening regularly, not skipped',
        respondent: 'student',
        followUp: 'How often do these sessions get skipped, and why?',
      },
      {
        id: '14e',
        metricId: '14e',
        text: 'I feel meaningfully involved in house-system events and competitions',
        respondent: 'student',
        followUp: 'What would increase your engagement with the house system?',
      },
    ],
    gapNote:
      "This dimension is a strong candidate for a Reality-greater-than-Perception ('communication gap') pattern in many schools — genuinely good programs often go under-communicated to parents focused on academic updates. Quick win: include co-curricular achievement summaries in the same report-card cycle as academics.",
  },
];

/**
 * Get dimension by ID
 */
export function getDimensionById(id: string): Dimension | undefined {
  return FOURTEEN_DIMENSIONS.find(d => d.id === id);
}

/**
 * Get all dimension IDs
 */
export function getDimensionIds(): string[] {
  return FOURTEEN_DIMENSIONS.map(d => d.id);
}

/**
 * Get dimension by index
 */
export function getDimensionByIndex(index: number): Dimension | undefined {
  return FOURTEEN_DIMENSIONS[index];
}

/**
 * Get total number of dimensions
 */
export function getTotalDimensions(): number {
  return FOURTEEN_DIMENSIONS.length;
}

/**
 * Calculate total questions (= total reality metrics, 1:1 matched) across
 * all dimensions.
 */
export function getTotalQuestions(): number {
  return FOURTEEN_DIMENSIONS.reduce((sum, dim) => sum + dim.questions.length, 0);
}

/**
 * Only the questions in a dimension answered by a given stakeholder type -
 * every consumer that renders questions to a specific respondent (the
 * survey UI, the "simulate" test-data generator) must filter through this
 * rather than rendering dimension.questions directly, since each question
 * targets exactly one stakeholder type.
 */
export function getQuestionsForRespondent(dimension: Dimension, respondent: StakeholderType): Question[] {
  return dimension.questions.filter(q => q.respondent === respondent);
}

/**
 * Dimensions that have at least one question for a given stakeholder type,
 * in framework order - the sequence an individual respondent's survey
 * should actually step through (some dimensions, e.g. Parent Satisfaction &
 * Engagement, have zero Student questions and should be skipped entirely
 * for that respondent).
 */
export function getDimensionsForRespondent(respondent: StakeholderType): Dimension[] {
  return FOURTEEN_DIMENSIONS.filter(dim => getQuestionsForRespondent(dim, respondent).length > 0);
}
