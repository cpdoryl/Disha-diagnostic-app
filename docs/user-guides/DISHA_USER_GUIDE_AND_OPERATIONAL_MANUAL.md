# DISHA Diagnostic Platform — Complete User Guide & Operational Manual

**Platform:** DISHA School Diagnostic & Operational Intelligence Engine  
**Version:** 3.0 Production Edition  
**Target Audience:** School Owners, Board Chairs, Trustees, Principals, Administrators, & Operations Teams  

---

## Executive Overview & Introduction

### 1. What is the DISHA Diagnostic Platform?
The **DISHA Diagnostic Platform** is a 360-degree institutional health and operational intelligence engine designed specifically for K-12 schools (CBSE, ICSE, IB, Cambridge, and State Boards). 

Just as a modern hospital uses clinical diagnostics (ECG, Blood Panels, MRI) before prescribing treatment, DISHA provides school leaders with an **evidence-based, objective, algorithmic diagnostic system**. It moves school leadership away from "gut feel" decision-making and subjective opinions into **data-driven institutional governance**.

---

### 2. What Problem Does DISHA Solve?
Traditional school management consulting and audits suffer from four major failures:
1. **Slow & Expensive**: Traditional audits take 3–6 weeks of costly on-site interviews and yield lengthy written reports that sit on shelves.
2. **Subjective & Biased**: Leadership feedback is often skewed by vocal parents, aggressive staff, or defensive middle managers.
3. **Symptom Reactivity**: Schools routinely spend large sums fixing *symptoms* rather than root causes (e.g., spending heavily on billboard advertising when the real issue is a 48-hour delay in answering parent inquiry calls).
4. **The "Delusional Comfort" Trap**: School boards often assume parent satisfaction is high simply because no one complains at Parent-Teacher Meetings—unaware of silent student dropouts and mid-year withdrawals.

**DISHA solves this by providing:**
* **Instant First Opinion Diagnosis**: A 20-minute, multi-lens screening that pinpoints immediate operational friction points.
* **Perception vs. Data Alignment**: An automated engine that compares what leadership *thinks* against *actual operational metrics* (e.g., Student-Teacher Ratios, Parent Query SLA response times, Teacher Training Hours).
* **360-Degree Multilateral Ingestion**: Direct data capture from Students, Teachers, Parents, and Operations Staff.
* **Predictive What-If Simulation**: A sandbox allowing directors to model budget decisions before spending money.

---

### 3. Frameworks & Benchmark Standards Used
DISHA’s underlying methodology and scoring formulas are aligned with global and national educational standards:
* **NEP 2020 (National Education Policy)**: Continuous Professional Development (CPD) hours for teachers, holistic progress tracking, and experiential learning metrics.
* **NCF 2023 (National Curriculum Framework)**: Foundational Literacy & Numeracy (FLN), competency-based assessments, and multidisciplinary pedagogy.
* **CBSE SQAAF (School Quality Assessment & Assurance Framework)**: Quality domains spanning Governance, Curriculum, Staffing, Infrastructure, and Beneficiary Satisfaction.
* **EWISR 14-Dimension Framework (EducationWorld India School Rankings)**: Academic Reputation, Teacher Welfare & Development, Co-Curricular Education, Parent Involvement, Infrastructure, Leadership Quality, Life Skills, Special Needs Inclusivity, and Value for Money.
* **Harvard & Cambridge Educational Leadership Models**: Distributed leadership, SLA-based administrative turnarounds, and feedback-loop mechanics.
* **WHO & UNICEF Adolescent Health Guidelines**: Digital wellness, socio-emotional safety, and anti-bullying protocols.

---

## Architectural System Flow & User Journey Diagram

Below is the simple step-by-step journey of a school through the DISHA platform:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                DISHA USER JOURNEY FLOW                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 1: SCHOOL REGISTRATION & DEMOGRAPHICS                                           │
 │ • Input Board, City Tier, Fee Band, Student Count, & Leadership Details              │
 └──────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 2: DISHA HEALTH CHECKUP (FIRST OPINION ENGINE)                                  │
 │ • Select 1-3 Primary Institutional Challenges (Growth, Staff, Academic, Brand, etc.) │
 │ • Enter Operational Vitals (Student-Teacher Ratio, Parent SLA, Teacher CPD Hours)    │
 │ • Complete Adaptive 12-Lens Screening Questionnaire                                  │
 └──────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 3: FIRST OPINION DIAGNOSTIC REPORT                                              │
 │ • Instant Health Index (0-100) & Risk Level                                          │
 │ • Perception vs. Data Alignment Check ("Delusional Comfort" vs. "High Alignment")    │
 │ • Differential Diagnostic Doctor Metaphor & Immediate Action Plan                    │
 └──────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 4: MULTILATERAL DATA CAPTURE (STAGE 2 MULTI-STAKEHOLDER SURVEYS)                │
 │ • Generate QR Codes & Share Web Links with Parents, Teachers, Students & Staff       │
 │ • Real-time survey response tracking across all 4 cohorts                             │
 └──────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 5: WHAT-IF SIMULATOR & PREDICTIVE SCENARIO MODELING                             │
 │ • Adjust budget sliders (Teacher Training, SLA Response, Remedial Coverage)          │
 │ • Project expected score improvements, ROI, and risk reduction before investing      │
 └──────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 6: PEER BENCHMARKING & COMPARATIVE AUDIT                                        │
 │ • Benchmark your school against City-Tier peers, Fee-Band rivals, and National norms │
 └──────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 7: LIVE OPERATIONAL MONITORING & AI SAATHI COPILOT                               │
 │ • Daily tracking of Attendance, Parent Communications SLA, and Attrition Risks       │
 │ • Consult AI Saathi Copilot for customized policy drafting & leadership guidance      │
 └──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Feature-by-Feature User Manual

Below is the step-by-step operational guide for every module and feature in the DISHA application.

---

### Feature 1: School Profile Registration & Multi-School Switcher
* **Location**: Top Navigation Bar -> "Register New School" Modal / Active School Dropdown.
* **What It Is & Significance**: Allows management groups, educational trusts, or franchise owners running multiple campuses to register and seamlessly switch between different school branches.
* **Step-by-Step How to Test**:
  1. Click on the top navigation bar school name or click **"Register New School"**.
  2. Fill in the institutional details:
     * **School Name**: e.g., *Delhi Public Academy - North Campus*
     * **Affiliation Board**: Select CBSE, ICSE, IB, Cambridge, or State Board.
     * **City Tier**: Select Metro (Tier 1), Urban (Tier 2), or Semi-Urban (Tier 3).
     * **Fee Band**: Select Economy, Mid-Market, Premium, or Ultra-Luxury.
     * **Total Students**: e.g., *1200*
     * **Principal / Chair Name**: e.g., *Dr. S. K. Sharma*
  3. Click **"Save & Register School"**.
  4. Notice the active header updates immediately. All diagnostic data, dashboard widgets, and scores now update specifically for the selected campus.
* **Underlying Methodology**: Automatically sets baseline reference benchmarks based on the combination of Board + City Tier + Fee Band.

---

### Feature 2: The DISHA First Opinion Health Checkup (`Checkup.tsx`)
* **Location**: Left Navigation Bar -> **Checkup** (or Main Dashboard "Start Checkup").
* **What It Is & Significance**: The flagship 20-minute triage protocol. It diagnoses root operational problems before committing resources to full audits.
* **Step-by-Step How to Test**:
  * **Phase 1: Select Primary Challenges**:
    1. Select **1 to 3 primary worries** from the 15 Institutional Challenges catalog (e.g., *Enrollment Decline*, *Teacher Attrition*, *Parent Dissatisfaction*).
    2. Click **"Continue to Operational Vitals"**.
  * **Phase 2: Input Operational Vitals**:
    1. Fill in real operational metrics:
       * **Student-Teacher Ratio**: e.g., *25:1*
       * **Parent Query SLA**: Average hours to respond to parent inquiries (e.g., *24 hours*).
       * **Teacher Training Hours**: Annual CPD hours per teacher (e.g., *30 hours*).
       * **Remedial Coverage**: Percentage of low-performing students receiving structured help (e.g., *60%*).
    2. Click **"Continue to Matrix Screening"**.
  * **Phase 3: Adaptive Matrix Screening**:
    1. Answer targeted screening questions across the 12 operational lenses (Rate from 1 to 5 stars).
    2. Click **"Generate First Opinion Diagnosis"**.
  * **Phase 4: Review Your First Opinion Diagnosis**:
    * **Overall Health Index (0-100)**: Visual color-coded gauge (Green = Healthy, Yellow = Vulnerable, Red = Critical).
    * **Perception vs. Data Alignment**: Detects whether your stated concerns match your operational metrics, highlighting cases of **"Delusional Comfort"** or **"High Structural Alignment"**.
    * **Doctor Metaphor Diagnosis**: Generates a clear medical analogy (e.g., *"Your school displays Acute Circulation Bottlenecks—high intake inquiry, but severe operational arterial blockage in parent communication."*)
    * **Priority Action Plan**: Provides immediate 30-day, 60-day, and 90-day action items.

---

### Feature 3: Multilateral Data Capture Stage (`CaptureStage.tsx`)
* **Location**: Navigation Menu -> **Capture Stage** / **Public Surveys**.
* **What It Is & Significance**: Ingests direct feedback from 4 key school stakeholder groups: Students, Teachers, Parents, and Non-Teaching Staff.
* **Step-by-Step How to Test**:
  1. Open **Capture Stage**.
  2. View the 4 Stakeholder Cards (**Parents**, **Teachers**, **Students**, **Staff**).
  3. Click **"Generate Survey QR Code / Web Link"** for any cohort (e.g., Parents).
  4. Copy the public link or open it in a new browser tab to test the **Public Survey Interface (`PublicSurvey.tsx`)**.
  5. Submit a sample survey response as a parent or teacher.
  6. Return to DISHA: Notice the live response counter increases and the 360-degree alignment index updates automatically!
* **Underlying Methodology**: Cross-validates leadership ratings against beneficiary responses to calculate true operational trust gaps.

---

### Feature 4: The Predictive What-If Simulator (`SimulateStage.tsx`)
* **Location**: Navigation Menu -> **Simulate Stage**.
* **What It Is & Significance**: Allows board members and principals to run financial and operational simulations *before* making costly budget allocations.
* **Step-by-Step How to Test**:
  1. Open **Simulate Stage**.
  2. Drag the interactive decision sliders:
     * Increase **Teacher Training Hours** from 15 hrs -> 45 hrs/year.
     * Reduce **Parent Query Response Time** from 48 hrs -> 4 hrs.
     * Increase **Remedial Coverage** from 40% -> 85%.
  3. Observe real-time updates:
     * **Projected Health Index**: Shows score increase (e.g., *+14 points*).
     * **Estimated Financial ROI**: Calculates expected tuition retention gains.
     * **Risk Score Reduction**: Displays reduced risk of teacher and student attrition.

---

### Feature 5: Peer Benchmarking & Comparative Audit (`CompareStage.tsx`)
* **Location**: Navigation Menu -> **Compare Stage**.
* **What It Is & Significance**: Evaluates your school's performance against top-tier peer institutions in the same city, fee bracket, and board affiliation.
* **Step-by-Step How to Test**:
  1. Open **Compare Stage**.
  2. Select Benchmark Group (e.g., *Tier-1 Metro CBSE Schools* or *Mid-Market Fee Band*).
  3. View the comparative radar chart and percentile ranking table.
  4. Identify domains where your school leads (e.g., *Infrastructure*) versus domains where it trails peers (e.g., *Digital Wellness* or *Teacher Development*).

---

### Feature 6: Operational Modules & Daily Management
DISHA provides live management tracking across key operational pillars:

1. **Executive Dashboard (`Dashboard.tsx`)**:
   * Displays instant score card, radar breakdown across 12 lenses, urgent alert banners, and high-impact action recommendations.
2. **Real-Time Monitoring (`Monitoring.tsx`)**:
   * Tracks SLA compliance, unresolved parent queries, staff attrition flags, and critical operational risk alerts in real time.
3. **Student Management (`Students.tsx`)**:
   * Classifies students into risk bands (Green, Yellow, Red) based on academic performance, attendance drops, and socio-emotional indicators.
4. **Staff & Faculty Hub (`Staff.tsx`)**:
   * Logs teacher CPD hours, subject performance ratings, workload distribution, and retention risk alerts.
5. **Attendance Log (`Attendance.tsx`)**:
   * Real-time daily tracking for student and staff attendance with automated unexcused absence alerts.
6. **Communication Hub (`Communications.tsx`)**:
   * SLA timer tracking for parent tickets, emergency broadcasts, and resolution logs.

---

### Feature 7: AI Saathi Intelligence Copilot (`SaathiChatbot.tsx`)
* **Location**: Floating Chat Button (Bottom Right) / **Saathi AI** tab.
* **What It Is & Significance**: An AI-powered school leadership assistant that ingests your active school profile and diagnostic gaps to provide context-aware policies, action plans, and leadership counsel.
* **Step-by-Step How to Test**:
  1. Click the **Saathi AI** chat icon in the bottom right corner.
  2. Select one of the quick prompt suggestions:
     * *"How can I reduce teacher attrition in my CBSE school?"*
     * *"Draft a parent communication strategy for resolving fee collection delays."*
     * *"Provide a 30-day action plan for improving remedial math coverage."*
  3. Saathi analyzes your active campus profile and responds with a tailored strategy.

---

## Marketing & Stakeholder Pitching Sequence

When presenting DISHA to different school stakeholders, use the structured messaging sequence below:

### 1. Pitching to School Owners, Trustees, & Board Chairs
* **Core Value Proposition**: *Institutional Oversight & Risk Prevention.*
* **Key Pitch Points**:
  * "DISHA provides an objective dashboard to monitor campus performance across all operational domains without relying purely on verbal reports."
  * "Prevent student attrition and teacher turn-over before revenue is impacted."
  * "Test budget decisions in the What-If Simulator before spending capital."

### 2. Pitching to Principals, Directors, & Academic Heads
* **Core Value Proposition**: *Operational Efficiency & Teacher Development.*
* **Key Pitch Points**:
  * "Identify exact bottlenecks in parent query response times and remedial coverage."
  * "Automate teacher CPD logging aligned with NEP 2020 standards."
  * "Use Saathi AI Copilot to draft institutional policies and communication strategies in seconds."

### 3. Pitching to Parents & Advisory Councils
* **Core Value Proposition**: *Transparency, Safety, & Continuous Quality Improvement.*
* **Key Pitch Points**:
  * "Our school uses an advanced 360-degree diagnostic engine to continuously benchmark academic quality, digital wellness, and student wellbeing."
  * "Parent feedback directly drives institutional priority decisions."

---

## Summary Checklist for End-to-End User Testing

To perform a complete test sweep of the DISHA app, follow this 5-minute checklist:

- [x] **Step 1**: Register a test school profile in **School Register Modal**.
- [x] **Step 2**: Complete the 3-step **Checkup** workflow and review the First Opinion Diagnosis.
- [x] **Step 3**: Open **Capture Stage**, copy the public link, and submit a test **Public Survey**.
- [x] **Step 4**: Test interactive decision sliders in the **Simulate Stage**.
- [x] **Step 5**: Review comparative rankings in **Compare Stage**.
- [x] **Step 6**: Test daily operational logs (**Students**, **Staff**, **Attendance**, **Communications**).
- [x] **Step 7**: Ask **Saathi AI Copilot** for a 30-day action plan.

---
*End of Operational Manual — DISHA School Diagnostic Platform v3.0*
