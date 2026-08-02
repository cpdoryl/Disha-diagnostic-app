# DISHA First Opinion Diagnostic Engine
## Complete Technical Guide & Data Collection Framework

**Version:** 2.0  
**Date:** August 2, 2026  
**Audience:** Technical Teams, School Administrators, Data Scientists  
**Purpose:** Complete understanding of data collection, assessment methodology, and calculation logic

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [15 Institutional Challenges Framework](#15-institutional-challenges-framework)
3. [Data Collection Strategy](#data-collection-strategy)
4. [Complete Questionnaire](#complete-questionnaire)
5. [Calculation Methodology](#calculation-methodology)
6. [Real-Time Assessment Flow](#real-time-assessment-flow)
7. [Technical Implementation](#technical-implementation)

---

## Executive Overview

The DISHA First Opinion Engine is a **20-minute institutional diagnostic** that transforms subjective leadership perceptions into mathematically rigorous health indices through:

- **Dual-layer scoring:** Subjective confidence vs. objective operational metrics
- **Perception-reality gap detection:** Identifies "Delusional Comfort" scenarios
- **Risk quadrant classification:** Elite Equilibrium, Hidden Excellence, Delusional Comfort, Critical Collapse
- **Transparent formulas:** 100% traceable to inputs and mathematical operations

### Core Formula

```
Health Index (H) = [ (S_sub × M_obj) - P_mismatch ]

Where:
  S_sub = Subjective Base Score (0-100)
  M_obj = Objective Scaling Factor (0.60-1.15)
  P_mismatch = Delusion Penalty (0, 10, or 15)
  H = Final Institutional Health Index (0-100)
```

---

## 15 Institutional Challenges Framework

### Challenge Catalog Matrix

The DISHA engine evaluates schools across **15 systemic challenges** organized into **5 strategic domains**:

| Domain | Challenge ID | Challenge Name | Primary Metric |
|--------|-------------|----------------|-----------------|
| **Growth & Enrollment** | C1 | Enrollment decline / admission shortfall | Inquiry-to-admission conversion rate |
| | C2 | Student attrition / mid-year dropout | Annual dropout rate % |
| | C3 | Fee collection default & delayed payments | Fee default rate % |
| **People & Staffing** | C4 | Teacher attrition / staff turnover | Annual teacher turnover rate % |
| | C5 | Staff quality, training & skill gaps | Teacher training hours/year |
| | C6 | Middle management & coordinator gap | Leadership pipeline ratio |
| **Academic & Student Wellbeing** | C7 | Academic performance drop / prep slip | Board result pass rate % |
| | C8 | Student stress, discipline, mental health | Student wellness index score |
| | C9 | Low-performer remedial gap | Remedial coverage % of at-risk students |
| **Reputation & Competition** | C10 | Parent complaints & poor communication | Parent query response time (hours) |
| | C11 | Rival school marketing & feature loss | Competitive positioning score |
| | C12 | Weak local reputation / word-of-mouth | Net Promoter Score (NPS) |
| **Operations & Finance** | C13 | Rising operational costs / margin squeeze | Cost-to-revenue ratio |
| | C14 | Aging facilities, safety & tech gaps | Infrastructure quality score |
| | C15 | Board compliance, RTE & audit stress | Compliance audit pass rate % |

---

## Data Collection Strategy

### Layer 1: Leadership Perception Inputs

**Who Provides:** School Principal, Head of Operations, Board Member (1-3 people)  
**Duration:** 20 minutes  
**Format:** Digital questionnaire with dynamic routing  
**Data Type:** Ordinal ratings (1-10 severity scale)

### Layer 2: Objective Operational Metrics

**Who Provides:** School Finance Officer, HR Manager, Academic Coordinator  
**Duration:** 10 minutes (data already exists in school records)  
**Format:** Structured data entry or CSV upload  
**Data Type:** Quantitative metrics from operational logs

### Layer 3: Evidence Artifacts (Optional)

**Who Provides:** Finance, HR, Academic teams  
**Duration:** 5 minutes (file upload)  
**Format:** CSV/Excel snapshots  
**Data Type:** Anonymized attendance, fee, staff roster samples

---

## Complete Questionnaire

### Step 1: Institutional Context (Baseline Data)

**Q1.1: Official School Name**
- Input: Text field
- Usage: Context & record identification
- Required: Yes

**Q1.2: Board Affiliation**
- Options: CBSE, ICSE, IB, State Board, Cambridge, Other
- Input: Single select
- Usage: Benchmark standards selection
- Required: Yes

**Q1.3: Total Enrolled Students**
- Input: Numeric
- Range: 1-5000
- Usage: School size normalization
- Required: Yes

**Q1.4: Annual Fee Tier (Highest Class)**
- Options: <₹1L, ₹1-2L, ₹2-3L, ₹3-5L, ₹5-10L, >₹10L
- Input: Single select
- Usage: Socioeconomic segment
- Required: Yes

**Q1.5: City / District Location**
- Input: Text field
- Usage: Geographic benchmarking
- Required: Yes

---

### Step 2: Challenge Selection (Maximum 3)

**Q2.1: Primary Challenge**
- Display: All 15 challenges with brief descriptions
- User Action: Select 1 challenge
- Weight: 50% of diagnostic weight
- Required: Yes

**Q2.2: Secondary Challenge (Optional)**
- Display: All 15 challenges except selected primary
- User Action: Select 0 or 1 challenge
- Weight: 30% of diagnostic weight (if selected)
- Required: No

**Q2.3: Tertiary Challenge (Optional)**
- Display: All 15 challenges except selected primary & secondary
- User Action: Select 0 or 1 challenge
- Weight: 20% of diagnostic weight (if selected)
- Required: No

---

### Step 3: Dynamic Screening Questions (Challenge-Specific)

#### Challenge C1: Enrollment Decline / Admission Shortfall

**Q3.1.1: Inquiry-to-Admission Conversion Rate (This Season)**

*Probe Focus:* Marketing effectiveness and conversion funnel quality

- **Option A (Weight: 2):** Above 25% conversion
  - Interpretation: Healthy conversion indicating strong brand pull
  - Healthy: Strong market position, consistent inquiry-to-admission pipeline
  
- **Option B (Weight: 6):** 10-25% conversion
  - Interpretation: Suboptimal but manageable conversion
  - Action needed: Improve inquiry follow-up or selection criteria
  
- **Option C (Weight: 10):** Below 10% conversion
  - Interpretation: Critical deficit in conversion (major drop-off)
  - Action needed: Immediate inquiry desk and follow-up process review

**Data Source:** Inquiry tracking system, admission register  
**Evidence:** Last 3 years inquiry logs and enrollment data  
**Calculation:** (Final admissions this season / Total inquiries) × 100

---

**Q3.1.2: Primary Channels for Marketing Spend**

*Probe Focus:* Marketing channel efficiency and ROI

- **Option A (Weight: 3):** Digital marketing (WhatsApp bots, Google Ads, Meta Ads, Instagram)
  - Interpretation: Modern, trackable marketing with data insights
  - Advantage: Measurable ROI, targetable demographics, real-time optimization
  
- **Option B (Weight: 6):** Traditional print (Newspaper, flyers, hoardings)
  - Interpretation: Legacy marketing with limited ROI tracking
  - Challenge: High cost, difficult ROI measurement, slow reach
  
- **Option C (Weight: 8):** No formal marketing budget (Word-of-mouth only)
  - Interpretation: Entirely dependent on reputation (risky)
  - Risk: No controlled growth, vulnerable to competitive pressure

**Data Source:** Marketing budget allocation, campaign tracking  
**Evidence:** Last 2 years marketing spend breakdown by channel  
**Calculation:** Categorize largest spend channel

---

**Q3.1.3: At Which Stage Do Parents Drop Off Most?**

*Probe Focus:* Funnel stage with highest abandonment

- **Option A (Weight: 9):** After initial inquiry / Never visit school
  - Interpretation: Inquiry conversion failure (likely communication SLA issue)
  - Root Cause: Slow response time, poor inquiry handling
  
- **Option B (Weight: 7):** After touring school / Feeling fees are too high
  - Interpretation: Value perception mismatch
  - Root Cause: Fee structure doesn't align with perceived value
  
- **Option C (Weight: 8):** After final offer / Opting for competitor instead
  - Interpretation: Competitive loss at final stage
  - Root Cause: Better offer elsewhere, last-minute doubts

**Data Source:** Inquiry tracking notes, parent feedback surveys  
**Evidence:** Sample of 20-30 lost inquiries from last 3 months  
**Calculation:** Categorize most frequent drop-off stage

---

#### Challenge C4: Teacher Attrition / Staff Turnover

**Q3.4.1: Annual Teacher Turnover Rate (Last Year)**

*Probe Focus:* Staff retention and stability

- **Option A (Weight: 2):** Under 10% turnover
  - Interpretation: Stable, healthy staff retention
  - Benchmark: Industry best practice (<10% is excellent)
  
- **Option B (Weight: 6):** 10-25% turnover
  - Interpretation: Moderate churn (concerning)
  - Benchmark: Industry average is 15-20% for schools
  
- **Option C (Weight: 10):** Above 25% turnover
  - Interpretation: Severe staff instability
  - Risk: Disrupted pedagogy, student learning impact, institutional knowledge loss

**Data Source:** HR records, payroll system, employment history  
**Evidence:** Staff roster with tenure dates for last 3 years  
**Calculation:** (Teachers who left in last 12 months / Average staff count) × 100

---

**Q3.4.2: Average Teaching Periods Per Week Per Teacher**

*Probe Focus:* Teacher workload and burnout risk

- **Option A (Weight: 2):** 18-22 periods/week
  - Interpretation: Standard, sustainable teaching load
  - Benchmark: Optimal for pedagogical quality
  
- **Option B (Weight: 6):** 24-28 periods/week
  - Interpretation: Heavy load but manageable
  - Risk: Teacher fatigue, reduced prep time quality
  
- **Option C (Weight: 9):** 30+ periods/week + mandatory substitution
  - Interpretation: Severe overload (burnout risk)
  - Risk: Teacher health, retention, quality of instruction

**Data Source:** Timetable data, attendance management system  
**Evidence:** Current semester timetable and period allocation  
**Calculation:** Sum all teaching periods per teacher / Number of teaching days per week

---

**Q3.4.3: Primary Reason Teachers Cite in Exit Interviews**

*Probe Focus:* Root cause of attrition (structural vs. personal)

- **Option A (Weight: 9):** Workplace stress, administrative fatigue & burnout
  - Interpretation: Systemic workload/culture issue
  - Root Cause: Unsustainable conditions
  
- **Option B (Weight: 8):** Better salary or benefits elsewhere
  - Interpretation: Competitive compensation gap
  - Root Cause: Market positioning
  
- **Option C (Weight: 5):** Lack of career progression & growth tracks
  - Interpretation: Limited advancement opportunity
  - Root Cause: Leadership pipeline, recognition systems

**Data Source:** HR exit interview records  
**Evidence:** Exit interviews from last 5 teachers who left  
**Calculation:** Categorize most frequently cited reason

---

#### Challenge C10: Parent Complaints & Poor Communication

**Q3.10.1: Primary Channel for Parent Grievances & Routine Communication**

*Probe Focus:* Communication infrastructure and SLA tracking

- **Option A (Weight: 2):** Formal parent portal / Ticketing system / Designated SLA desk
  - Interpretation: Structured, trackable communication
  - Advantage: Documented response times, SLA enforcement, audit trail
  
- **Option B (Weight: 6):** Physical visits / Written diary notes
  - Interpretation: Semi-formal communication with limited tracking
  - Challenge: No SLA, response time varies
  
- **Option C (Weight: 9):** Unstructured WhatsApp groups / Direct teacher calls
  - Interpretation: Chaotic, undocumented communication
  - Risk: Missed messages, inconsistent responses, no accountability

**Data Source:** IT systems, parent communication audit  
**Evidence:** Screenshots/samples of communication channels  
**Calculation:** Identify primary communication channel in use

---

**Q3.10.2: Average Response Time for Parent Queries or Complaints**

*Probe Focus:* Service level agreement (SLA) performance

- **Option A (Weight: 1):** Under 24 hours (< 1 day)
  - Interpretation: Rapid response culture
  - Benchmark: Best practice (elite schools achieve this)
  
- **Option B (Weight: 5):** 24-48 hours (1-2 days)
  - Interpretation: Acceptable but slow
  - Benchmark: Industry standard
  
- **Option C (Weight: 9):** Over 48 hours (> 2 days)
  - Interpretation: Severe communication delay
  - Risk: Parent frustration, perception of neglect, mid-year withdrawals

**Data Source:** Ticketing system logs, parent communication records  
**Evidence:** Sample of 20 recent parent queries with response timestamps  
**Calculation:** Average (Latest response time - Initial query time)

---

### Step 4: Objective Operational Metrics (Quantitative Input)

These are **measured directly from school records**, not perceptions.

#### Metric 1: Student-Teacher Ratio (STR)

**Definition:** Total enrolled students ÷ Full-time teaching staff

**Data Source:** Enrollment register + HR payroll  
**Formula:** STR = Total Students / FTE Teachers

**Example Calculation:**
```
School A:
  Total Students = 450
  Full-Time Teachers = 20
  STR = 450 / 20 = 22.5:1

School B:
  Total Students = 480
  Full-Time Teachers = 12
  STR = 480 / 12 = 40:1
```

**Multiplier Application:**
```
If STR ≤ 20        → m_STR = 1.05 (Optimal individual attention)
If 20 < STR ≤ 28   → m_STR = 1.00 (Standard operating range)
If 28 < STR ≤ 35   → m_STR = 0.88 (Overcrowded classrooms)
If STR > 35        → m_STR = 0.75 (Severe classroom overload)
```

---

#### Metric 2: Parent Query Response SLA (Hours)

**Definition:** Average time to resolve a formal parent query (in hours)

**Data Source:** Ticketing system, communication logs  
**Formula:** SLA = Average(Resolution time - Query submitted time)

**Example Calculation:**
```
Query 1: Submitted 9:00 AM Monday → Resolved 4:00 PM Monday = 7 hours
Query 2: Submitted 10:00 AM Monday → Resolved 11:00 AM Tuesday = 25 hours
Query 3: Submitted 2:00 PM Monday → Resolved 10:00 AM Wednesday = 40 hours

Average SLA = (7 + 25 + 40) / 3 = 24 hours
```

**Multiplier Application:**
```
If SLA ≤ 12 hours        → m_SLA = 1.05 (Rapid response elite)
If 12 < SLA ≤ 24 hours   → m_SLA = 1.00 (Standard acceptable SLA)
If 24 < SLA ≤ 48 hours   → m_SLA = 0.85 (Delayed friction range)
If SLA > 48 hours        → m_SLA = 0.70 (Severe communication breakdown)
```

---

#### Metric 3: Teacher Retraining Hours (Annual CPD)

**Definition:** Average annual hours of formal Professional Development per teacher

**Data Source:** CPD attendance logs, training certificates  
**Formula:** CPD_hours = Total annual CPD hours / Number of teachers

**Example Calculation:**
```
School with 20 teachers:
  Teacher 1: 30 hours CPD
  Teacher 2: 22 hours CPD
  Teacher 3: 18 hours CPD
  ... (20 teachers total)
  Total CPD hours = 420 hours
  
Average = 420 / 20 = 21 hours/teacher/year
```

**Multiplier Application:**
```
If CPD ≥ 25 hrs/year     → m_retrain = 1.05 (Continuous upskilling)
If 15 ≤ CPD < 25 hrs/yr  → m_retrain = 1.00 (Standard training)
If CPD < 15 hrs/year     → m_retrain = 0.85 (Stagnant pedagogy)

NEP 2020 Mandate: Minimum 50 hours/year
```

---

#### Metric 4: Weekly Lesson Planning Time (Hours)

**Definition:** Average hours dedicated per teacher per week for lesson prep and curriculum alignment

**Data Source:** Timetable, staff schedule, teacher surveys  
**Formula:** Planning_hours = Total planning hours per week / Number of teachers

**Example Calculation:**
```
School schedule:
  Friday afternoon: 2 hours designated for planning (all 20 teachers)
  Total planning hours/week = 2 × 20 = 40 hours
  Per teacher = 40 / 20 = 2 hours/week

OR

Survey-based:
  Teachers report: 3-5 hours/week spent on planning (on average)
  Average = 4 hours/week
```

**Multiplier Application:**
```
If Planning ≥ 5 hrs/week  → m_plan = 1.05 (Structured curriculum prep)
If 3 ≤ Planning < 5 hrs   → m_plan = 1.00 (Standard prep)
If Planning < 3 hrs/week  → m_plan = 0.88 (Ad-hoc classroom delivery)
```

---

## Calculation Methodology

### Step 1: Calculate Subjective Base Score (S_sub)

**Input:** Answers to all dynamic screening questions  
**Scoring:** Each answer option has a weight (w_k) from 1-10, where:
- 1 = Optimal practice
- 10 = Critical risk

**Formula:**
```
S_sub = 100 - [ (Σ w_k / (N × 10)) × 100 ]

Where:
  Σ w_k = Sum of all severity weights selected
  N = Number of questions answered
  (w_k / 10) = Normalized weight per question
```

**Example Calculation:**

```
Challenge: Teacher Attrition (3 questions selected)

Q3.4.1 (Turnover rate): Selected "10-25%" → w_1 = 6
Q3.4.2 (Teaching load): Selected "30+ periods + substitution" → w_2 = 9
Q3.4.3 (Exit reason): Selected "Workplace stress" → w_3 = 9

Calculation:
  Σ w_k = 6 + 9 + 9 = 24
  N = 3 questions
  Normalized = 24 / (3 × 10) = 24 / 30 = 0.80
  S_sub = 100 - (0.80 × 100) = 100 - 80 = 20/100

Result: Subjective Base Score = 20
(Interpretation: School rates itself very poorly on teacher attrition)
```

---

### Step 2: Calculate Objective Scaling Factor (M_obj)

**Input:** 4 operational metrics  
**Method:** Multiply individual metric multipliers

**Formula:**
```
M_obj = m_STR × m_SLA × m_retrain × m_plan

Each multiplier ranges from 0.60 to 1.15
```

**Example Calculation:**

```
School metrics:
  STR = 32:1 → m_STR = 0.88 (overcrowded)
  Parent SLA = 36 hours → m_SLA = 0.85 (delayed)
  CPD = 18 hrs/year → m_retrain = 1.00 (standard)
  Planning = 3.5 hrs/week → m_plan = 1.00 (standard)

Calculation:
  M_obj = 0.88 × 0.85 × 1.00 × 1.00 = 0.748

Result: Objective Scaling Factor = 0.748
(Interpretation: Objective reality is 75% of ideal conditions)
```

---

### Step 3: Apply Challenge Weights

If multiple challenges selected:

```
Weighted S_sub = (S_sub_1 × 0.50) + (S_sub_2 × 0.30) + (S_sub_3 × 0.20)

Where:
  S_sub_1 = Primary challenge score (50% weight)
  S_sub_2 = Secondary challenge score (30% weight)
  S_sub_3 = Tertiary challenge score (20% weight)
```

**Example:**
```
Challenge 1 (Primary - Enrollment): S_sub = 45
Challenge 2 (Secondary - Parent Comm): S_sub = 30
Challenge 3 (Tertiary - Teacher Training): S_sub = 60

Weighted = (45 × 0.50) + (30 × 0.30) + (60 × 0.20)
Weighted = 22.5 + 9 + 12 = 43.5
```

---

### Step 4: Calculate Scaled Score

**Formula:**
```
S_scaled = Weighted S_sub × M_obj
```

**Example:**
```
S_scaled = 43.5 × 0.748 = 32.54
```

---

### Step 5: Calculate Delusion Penalty (P_mismatch)

**Logic:** Detect when leadership confidence doesn't match operational reality

**Formula:**
```
IF (S_sub ≥ 80) AND (M_obj ≤ 0.85)
  THEN P_mismatch = 15.0  (Delusional Comfort detected)

ELSE IF (S_sub ≥ 70) AND (M_obj ≤ 0.78)
  THEN P_mismatch = 10.0  (Moderate perception gap)

ELSE
  P_mismatch = 0.0
```

**Example Scenarios:**

```
Scenario A: "Delusional Comfort"
  S_sub = 82 (leadership thinks all is well)
  M_obj = 0.70 (but operational metrics are poor)
  Condition: S_sub ≥ 80 AND M_obj ≤ 0.85 → TRUE
  P_mismatch = 15.0
  
  Interpretation: School board is overconfident despite poor operations

Scenario B: "Hidden Excellence"
  S_sub = 45 (leadership underrates themselves)
  M_obj = 0.95 (but operational metrics are strong)
  Condition: S_sub ≥ 80 AND M_obj ≤ 0.85 → FALSE
  P_mismatch = 0.0
  
  Interpretation: No penalty; strong operations underappreciated

Scenario C: "Elite Equilibrium"
  S_sub = 82 (leadership confident)
  M_obj = 0.98 (operations match confidence)
  Condition: S_sub ≥ 80 AND M_obj ≤ 0.85 → FALSE
  P_mismatch = 0.0
  
  Interpretation: No mismatch; confidence is justified
```

---

### Step 6: Calculate Final Health Index

**Master Formula:**
```
H = Clamp[ (S_scaled) - P_mismatch, 0, 100 ]

Where:
  Clamp = Ensures result stays between 0 and 100
```

**Example (Full Workflow):**

```
Input:
  Primary Challenge: Enrollment Decline
  S_sub (perception) = 65
  M_obj (operations) = 0.82
  P_mismatch = 0 (no major gap detected)

Calculation:
  S_scaled = 65 × 0.82 = 53.3
  H = Clamp(53.3 - 0, 0, 100) = 53.3
  
Result: Health Index = 53 / 100 (Amber Zone - Moderate Risk)
```

---

## Real-Time Assessment Flow

### Workflow Diagram

```
Step 1: School Registration (2 min)
  ↓
  School details, board affiliation, location
  ↓
Step 2: Challenge Selection (2 min)
  ↓
  Select 1-3 primary operational challenges
  ↓
Step 3: Dynamic Questionnaire (10 min)
  ↓
  Answer challenge-specific screening questions
  ↓
Step 4: Operational Metrics Input (3 min)
  ↓
  Enter or upload STR, SLA, CPD, Planning hours
  ↓
Step 5: Real-Time Calculation (1 sec)
  ↓
  Calculate S_sub, M_obj, P_mismatch, H
  ↓
Step 6: Diagnosis & Risk Quadrant (Instant)
  ↓
  Display health index, risk level, quadrant
  ↓
Step 7: Prescriptive Actions (Instant)
  ↓
  Generate prioritized treatment plan
```

---

## Technical Implementation

### Data Storage Schema

```yaml
FirstOpinionSession:
  sessionId: UUID
  schoolId: UUID
  createdAt: ISO 8601 timestamp
  
  schoolDetails:
    schoolName: String
    boardAffiliation: Enum[CBSE|ICSE|IB|State|Cambridge|Other]
    studentCount: Integer
    feeTierPerAnnum: String
    cityDistrict: String
  
  selectedChallengeIds: Array[String] (max 3)
  
  screeningAnswers:
    [challengeId]:
      [questionId]: String (selected option value)
  
  operationalMetrics:
    studentTeacherRatio: Float
    parentSlaHours: Float
    teacherRetrainingHours: Float
    weeklyPlanningHours: Float
  
  diagnosticResults:
    subjectiveBaseScore: Float (0-100)
    objectiveScalingFactor: Float (0.60-1.15)
    delusionPenalty: Float (0|10|15)
    finalHealthIndex: Float (0-100)
    riskQuadrant: Enum[ELITE|HIDDEN|DELUSIONAL|CRITICAL]
    prescriptiveActions: Array[Object]
```

---

## Risk Quadrant Interpretation

### Quadrant 1: Elite Equilibrium (S_sub ≥ 80, M_obj ≥ 0.95)

**Diagnosis:** Operations and management perception fully aligned at world-class standards

**Institutional Profile:**
- High parent retention (>90%)
- Rapid query resolution (<12 hrs)
- Low teacher turnover (<10%)
- Well-trained faculty (30+ hrs CPD/year)
- Strong STR (18:1 or better)

**Recommended Strategy:**
- Preserve operational standards
- Focus on institutional brand expansion
- Regional thought leadership positioning

---

### Quadrant 2: Delusional Comfort (S_sub ≥ 80, M_obj < 0.85)

**Diagnosis:** Management believes excellent performance but objective metrics show hidden deficits

**Institutional Profile:**
- High principal confidence
- Poor parent response times (>48 hrs) - creating silent dissatisfaction
- Teacher overloading (30+ periods/week)
- Lack of formal training structure
- Overcrowded classrooms (STR > 35:1)

**System Action:** **RED ALERT FLAG**
- Automatic escalation to board
- Immediate intervention recommended
- Silent student attrition likely

**Example Red Flag Message:**
> "You rated parent satisfaction as high (80/100), but your parent query response time is 52 hours (28 hours slower than district benchmark). Prospective parents are silently abandoning inquiries due to slow follow-up, not high fees. Before spending money on marketing, deploy an automated parent inquiry desk."

---

### Quadrant 3: Hidden Excellence (S_sub < 60, M_obj ≥ 0.95)

**Diagnosis:** Strong operational fundamentals but management lacks confidence

**Institutional Profile:**
- Low STR (18:1)
- High teacher training (30 hrs/year)
- Rapid response SLA (12 hrs)
- Management feels overwhelmed by vocal complaints
- Lacks structured communication/PR channels

**Recommended Strategy:**
- Implement formal parent ticketing/communication system
- Structured PR showcases highlighting strengths
- Align perception with strong operational reality

---

### Quadrant 4: Critical Operational Collapse (S_sub < 60, M_obj < 0.85)

**Diagnosis:** Both subjective sentiment and objective metrics confirm systemic breakdown

**Institutional Profile:**
- High teacher turnover (>25%)
- Severe fee defaults
- Failing board prep metrics
- Slow parent response SLAs
- Overcrowded classrooms

**System Action:** **MANDATORY ESCALATION**
- Emergency intervention required
- Unlock detailed Step 3 (14-Dimension Deep Audit)
- Board oversight essential

---

## Appendix: Complete Question Bank

### All 15 Challenges - Complete Question Sets

*(See Excel calculation engine for interactive questionnaire with all options and weights)*

---

## References & Standards

**Frameworks Used:**
- EWISR 14-Dimension Ranking Matrix (EducationWorld)
- NEP 2020 & CBSE SQAAF Standards
- DPDP Act 2023 (Data Protection)

**Benchmarks:**
- Industry Standard STR: ≤25:1
- Industry Standard Parent SLA: ≤24 hours
- NEP 2020 CPD Mandate: ≥50 hours/year/teacher
- Industry Standard Teacher Turnover: <15%/year

---

*Document prepared for DISHA Diagnostic Engine implementation teams*  
*For technical support: contact DISHA development team*  
*Last Updated: August 2, 2026*
