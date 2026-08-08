# DISHA Diagnostic Engine - Data Requirements Guide

## Overview

The DISHA 14-Dimensional Diagnostic Engine requires operational data from schools to perform objective analysis of their challenges. This guide specifies the exact data metrics required for each of the 15 challenges.

---

## Challenge Categories & Data Requirements

### 1. GROWTH & ENROLLMENT CHALLENGES

#### Challenge C1: Enrollment Decline

**Business Context:** School experiencing declining student enrollment year-over-year

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| new_enrollment_rate | New Enrollment Rate | % | +5% to +10% | 2% (or -5% for decline) | ⭐⭐⭐ |
| total_current_students | Total Current Students | count | 1200+ | 1260 | ⭐⭐⭐ |
| retention_rate_pct | Student Retention Rate (Gr1-12) | % | 85%+ | 82% | ⭐⭐⭐ |

**Optional Enhancements:**
- 3-year enrollment trend
- Competitive positioning score (how school ranks vs competitors)
- Fee comparison vs competitors

**Data Collection:**
- Source: Student Management System (SMS) or Excel registry
- Format: One row per year, showing enrollment numbers
- Sample CSV:
  ```
  Year,Total_Students,New_Enrollment,Retention_Rate
  2023,1350,150,85%
  2024,1300,100,83%
  2025,1260,95,82%
  ```

**Why This Data Matters:**
- **New Enrollment Rate:** Shows market competitiveness and brand strength
- **Retention Rate:** Reveals student satisfaction and academic quality
- **Trend Analysis:** Enables early intervention before crisis point

---

#### Challenge C2: Student Attrition

**Business Context:** High rates of students leaving mid-year or switching to competitors

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| midyear_dropout_rate_pct | Mid-Year Dropout Rate | % | <3% | 5% | ⭐⭐⭐ |
| outflow_to_competitors_pct | Outflow to Competitors | % | <2% | 3% | ⭐⭐⭐ |
| primary_attrition_reasons | Attrition Reason Categories | text | — | Affordability: 45%, Quality: 30%, Safety: 25% | ⭐⭐⭐ |

**Data Collection Format:**
```
Student_ID, Exit_Date, Grade_Level, Reason_For_Exit
S101, 2025-04-15, 7, Affordability
S102, 2025-05-20, 9, Quality of Education
S103, 2025-03-10, 5, Safety Concerns
```

**Analysis Output:**
- Identifies which grades/reasons are critical
- Forecasts enrollment impact if trend continues
- Prioritizes intervention by reason type

---

### 2. PEOPLE & STAFFING CHALLENGES

#### Challenge C3: Staff Turnover

**Business Context:** High rates of teacher/admin departures disrupting continuity

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| teacher_turnover_rate_pct | Teacher Turnover Rate | % | <10% | 18% | ⭐⭐⭐ |
| admin_turnover_rate_pct | Admin Staff Turnover | % | <8% | 12% | ⭐⭐⭐ |
| average_teacher_tenure_yrs | Average Teacher Tenure | years | 7+ | 6.5 | ⭐⭐⭐ |
| teacher_burnout_score | Teacher Burnout Index | score (0-100) | <50 | 62 | ⭐⭐⭐ |

**Data Collection:**
```
Teacher_ID, Name, Joining_Year, Departure_Year, Reason_For_Leaving, Burnout_Survey_Score
T001, Mrs. Sharma, 2015, —, —, 45
T002, Mr. Patel, 2018, 2025, Better Salary Offer, —
T003, Ms. Gupta, 2012, 2024, Workload & Health, 72
```

**Burnout Survey Format (Simple 5-question assessment):**
- Emotional exhaustion (1-10)
- Depersonalization (1-10)
- Personal accomplishment (1-10)
- Work-life balance satisfaction (1-10)
- Intent to stay (1-10)

---

#### Challenge C7: Inadequate Teacher Development

**Business Context:** Teachers lack ongoing professional development and pedagogical training

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| annual_training_hours | Annual Training Hours (CPD) | hrs/teacher/year | 25+ | 20 | ⭐⭐⭐ |
| certified_teachers_pct | Certified Teachers | % | 85%+ | 85% | ⭐⭐⭐ |
| weekly_planning_hours | Weekly Lesson Planning Time | hrs/week | 5+ | 4 | ⭐⭐⭐ |
| pedagogical_training_coverage_pct | Teachers Trained in Modern Pedagogy | % | 75%+ | 62% | ⭐⭐⭐ |

**Data Collection:**
```
Teacher_ID, Name, Annual_Training_Hours_2024, Certified_Yes_No, Weekly_Planning_Hours, Modern_Pedagogy_Trained
T001, Mrs. Sharma, 24, Yes, 5, Yes
T002, Mr. Patel, 20, Yes, 4, No
T003, Ms. Gupta, 22, Yes, 5, Yes
```

**Training Hours Log Format:**
```
Date, Teacher_Name, Training_Type, Duration_Hours, Topic
2025-01-15, Mrs. Sharma, Workshop, 2, Literacy Instruction
2025-02-10, Mr. Patel, Online Course, 3, Mathematics Problem-Solving
2025-03-05, Ms. Gupta, Conference, 8, STEAM Integration
```

---

### 3. ACADEMIC & STUDENT WELLBEING CHALLENGES

#### Challenge C4: Academic Performance Gap

**Business Context:** Student learning outcomes below expected levels; achievement gaps between groups

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| board_exam_pass_rate_pct | Board Exam Pass Rate | % | 80%+ | 82% | ⭐⭐⭐ |
| average_exam_score | Average Exam Score | score/100 | 75+ | 76 | ⭐⭐⭐ |
| curriculum_coverage_pct | Curriculum Completion | % | 90%+ | 88% | ⭐⭐⭐ |
| subject_wise_performance | Performance by Subject | score/100 | — | Math: 78, Sci: 80, Eng: 75 | ⭐⭐⭐ |

**Data Collection:**
```
Student_ID, Grade, Subject, Internal_Score, Board_Score, Pass_Fail
S001, 10, Mathematics, 82, 85, Pass
S002, 10, Mathematics, 35, 38, Fail
S001, 10, English, 78, 76, Pass
S003, 10, Science, 88, 92, Pass
```

---

#### Challenge C5: Student Wellbeing Issues

**Business Context:** Students facing mental health, safety, or behavioral concerns

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| student_attendance_rate_pct | Attendance Rate | % | 95%+ | 91% | ⭐⭐⭐ |
| dropout_rate_pct | Annual Dropout Rate | % | <2% | 3% | ⭐⭐⭐ |
| mental_health_support_available | Counselors/Mental Health Staff | count | 1 per 200 | 2 | ⭐⭐⭐ |
| bullying_complaint_rate | Bullying Complaints | per 100 students | <1 | 2.5 | ⭐⭐⭐ |

**Data Collection:**
```
Student_ID, Grade, Attendance_Percentage, Counseling_Sessions_2024, Complaints_Received
S001, 9, 94, 2, 0
S002, 8, 87, 4, 1 (bullying)
S003, 10, 96, 0, 0
```

---

#### Challenge C14: Student Safety & DPDP Compliance

**Business Context:** Data privacy compliance and physical/cybersecurity concerns

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| dpdp_compliance_pct | DPDP Act 2023 Compliance | % | 90%+ | 68% | ⭐⭐⭐ |
| data_breach_incidents_yoy | Data Breach Incidents (YoY) | count | 0 | 0 | ⭐⭐⭐ |
| cybersecurity_audit_rating | Cybersecurity Assessment Rating | score/10 | 7+ | 4.2 | ⭐⭐⭐ |
| physical_safety_incidents_yoy | Physical Safety Incidents | count | <2 | 2 | ⭐⭐⭐ |

---

#### Challenge C15: Innovation & Continuous Improvement

**Business Context:** School lacking innovation culture and evidence-based practices

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| innovation_initiatives_active | Active Innovation Projects | count | 3+ | 5 | ⭐⭐⭐ |
| research_based_pedagogy_adoption_pct | Evidence-Based Teaching Methods | % | 60%+ | 52% | ⭐⭐⭐ |
| innovation_investment_percentage | Budget Allocated to Innovation | % | 5-10% | 8% | ⭐⭐⭐ |
| success_rate_of_initiatives_pct | Initiative Success Rate | % | 70%+ | 65% | ⭐⭐⭐ |

---

### 4. REPUTATION & COMPETITION CHALLENGES

#### Challenge C8: Low Parent Engagement

**Business Context:** Parents not actively involved in school activities or decision-making

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| parent_query_response_sla_hours | Parent Query Response Time | hours | 12-24h | 24 | ⭐⭐⭐ |
| parent_meeting_attendance_pct | Parent Meeting Attendance | % | 50%+ | 42% | ⭐⭐⭐ |
| parent_satisfaction_nps | Parent NPS Score | -100 to +100 | 40+ | 35 | ⭐⭐⭐ |
| parent_volunteer_participation_pct | Parent Volunteer Participation | % | 30%+ | 28% | ⭐⭐⭐ |

**Data Collection:**
```
Date, Parent_Meeting_Type, Invited, Attended, Reason_For_Absence
2025-01-20, PTM, 250, 105, —
2025-02-10, School Assembly, 250, 62, Work commitments
2025-03-05, PTA Meeting, 50, 22, Lack of interest
```

**Parent Satisfaction Survey (Quick NPS):**
```
"How likely are you to recommend this school to a friend?"
Score: 0-10 (0=Not likely, 10=Highly likely)
Calculate NPS: % Promoters (9-10) - % Detractors (0-6)
```

---

#### Challenge C12: Reputation & Brand Issues

**Business Context:** Negative perception in community; damaged brand credibility

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| school_reputation_score | Community Reputation (Perception) | score/10 | 7+ | 6.8 | ⭐⭐⭐ |
| online_review_rating_avg | Online Platform Rating | score/5 | 4+ | 3.8 | ⭐⭐⭐ |
| negative_press_incidents_yoy | Negative Press Mentions (YoY) | count | <1 | 3 | ⭐⭐⭐ |
| social_media_sentiment_score | Social Media Sentiment Analysis | -100 to +100 | 50+ | 35 | ⭐⭐⭐ |

**Data Collection:**
- Google Reviews/Facebook ratings (aggregate monthly)
- Sentiment analysis of social media posts (text processing)
- Press coverage monitoring (news archives)

---

#### Challenge C13: Competitive Positioning

**Business Context:** School losing market share to competitors; unclear differentiation

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| market_share_percentage | Local Market Share | % | 10-15% | 12% | ⭐⭐⭐ |
| competitor_comparison_score | Performance vs Competitors | score/10 | 6+ | 6 | ⭐⭐⭐ |
| unique_value_proposition_strength | UVP Clarity & Strength | score/10 | 6+ | 5.5 | ⭐⭐⭐ |
| price_competitiveness_percentile | Fee Comparison (Percentile) | % | 40-60th | 45th | ⭐⭐⭐ |

**Data Collection (Competitive Audit):**
```
Metric, Our_School, Competitor_A, Competitor_B, Competitor_C
Board_Pass_Rate, 82%, 85%, 80%, 88%
Average_Fees, 50000, 48000, 55000, 52000
Avg_Class_Size, 28, 25, 30, 26
Modern_Infrastructure, Yes, Yes, Yes, Yes
Special_Programs, 3, 5, 2, 4
```

---

### 5. OPERATIONS & FINANCE CHALLENGES

#### Challenge C6: Infrastructure Gaps

**Business Context:** Physical facilities and learning environment below standards

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| students_per_classroom | Student-Classroom Ratio | students | 25-30 | 28 | ⭐⭐⭐ |
| sanitation_facilities_per_100 | Toilets & Sanitation | per 100 students | 3-5 | 3 | ⭐⭐⭐ |
| classroom_quality_index | Infrastructure Quality Score | score/100 | 75+ | 72 | ⭐⭐⭐ |
| digital_infrastructure_status | Digital Equipment & Connectivity | mixed | — | 50Mbps, 40 computers, 15 smart boards | ⭐⭐⭐ |

**Data Collection (Infrastructure Audit):**
```
Facility, Total, Quality_Status, Last_Maintenance, Repair_Needed
Classroom_101, 1, Good, 2024-09-01, No
Classroom_102, 1, Fair, 2024-06-15, Ceiling leak
Lab_Computer, 40, Good, 2024-08-20, Yes (5 units non-functional)
Smart_Board, 15, Good, 2024-10-01, No
Toilet_Block_A, 6, Fair, 2024-07-10, Yes (Plumbing issue)
```

---

#### Challenge C9: Financial Sustainability

**Business Context:** Cash flow issues; insufficient revenue to cover operations

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| fee_collection_rate_pct | Fee Collection Rate | % | 90%+ | 88% | ⭐⭐⭐ |
| budget_execution_pct | Budget Spend Rate | % | 85-95% | 92% | ⭐⭐⭐ |
| fee_default_rate_pct | Fee Default Rate | % | <5% | 12% | ⭐⭐⭐ |
| operational_cost_per_student | Cost per Student (Annual) | amount | — | 15000 | ⭐⭐⭐ |

**Data Collection (Financial Records):**
```
Month, Fee_Due, Fee_Collected, Defaults, Budget_Amount, Budget_Spent
January_2025, 2500000, 2200000, 300000, 850000, 825000
February_2025, 2500000, 2300000, 200000, 850000, 870000
March_2025, 2500000, 2150000, 350000, 850000, 790000
```

**Financial Analysis:**
- Collect 12 months of data minimum
- Include breakdown by grade/section
- Track trend in defaults

---

#### Challenge C10: Digital Transformation Lag

**Business Context:** Limited use of technology in teaching and administration

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| smart_classroom_coverage_pct | Smart Classrooms | % | 60%+ | 45% | ⭐⭐⭐ |
| learning_management_system_active | LMS in Use | Yes/No | Yes | No | ⭐⭐⭐ |
| teacher_digital_literacy_pct | Teachers Tech-Comfortable | % | 70%+ | 58% | ⭐⭐⭐ |
| internet_bandwidth_mbps | Internet Speed | Mbps | 50+ | 50 | ⭐⭐⭐ |

**Data Collection (Technology Audit):**
```
Metric, Status, Count/Percentage, Last_Updated
Classrooms_with_Projector, Yes, 28/35 (80%), 2025-03-01
Classrooms_with_Interactive_Board, Yes, 15/35 (43%), 2025-03-01
Tablets_for_Students, Yes, 200 devices (15%), 2025-03-01
WiFi_Coverage, Yes, 100% classrooms, 2025-03-01
Internet_Speed_Test, 50 Mbps, Consistent, 2025-03-15
Learning_Platform, No LMS active, —, —
```

---

#### Challenge C11: Compliance & Governance Gaps

**Business Context:** Non-compliance with regulatory standards; governance weaknesses

**Required Data Fields:**

| Field Name | Display Name | Unit | Benchmark | Example | Priority |
|---|---|---|---|---|---|
| sqaaf_compliance_pct | SQAAF Standards Met | % | 80%+ | 76% | ⭐⭐⭐ |
| audit_findings_count | Pending Audit Items | count | <5 | 8 | ⭐⭐⭐ |
| regulation_compliance_audit_rating | Compliance Assessment | score/10 | 7+ | 6.5 | ⭐⭐⭐ |
| policy_documentation_completeness_pct | Required Policies Documented | % | 90%+ | 82% | ⭐⭐⭐ |

**Data Collection (Compliance Audit):**
```
Standard, Requirement, Status, Evidence_Document, Due_Date
SQAAF_01, Annual Safety Audit, Pending, Fire_Audit_2024.pdf, 2025-04-01
Regulation_02, Child Protection Policy, Completed, CP_Policy_v2.pdf, —
Governance_01, Board Meeting Minutes, Partial (11/12 months), Minutes_2024.zip, —
Financial_01, Audit Report, Completed, Audit_2024.pdf, 2025-03-31
```

---

## Data Collection Best Practices

### 1. **Data Quality Standards**

✅ **DO:**
- Use actual operational data, not estimates or manual surveys
- Include date ranges for time-based metrics
- Document data sources and collection methods
- Validate numbers against transaction records
- Update data monthly for trend analysis

❌ **DON'T:**
- Mix historical and current-year data
- Round numbers without precision
- Use outdated information (>3 months old)
- Guess or estimate metrics
- Use only partial data for calculations

### 2. **File Format Requirements**

**Supported Formats:**
- CSV (Plain text, UTF-8 encoding)
- Excel (.xlsx) - MetricName/Value table format

**Recommended CSV Structure:**
```
MetricName, Value, Unit, Benchmark, Status
students_per_classroom, 28, students per class, 25, Fair
parent_query_response_sla_hours, 24, hours, 12, Good
annual_training_hours, 20, hours per teacher per year, 25, Acceptable
weekly_planning_hours, 4, hours per week, 5, Acceptable
attendance_rate_pct, 91, percentage, 95, Good
fee_collection_rate_pct, 88, percentage, 90, Good
```

**Excel Format:**
- Sheet name: "Metrics" or "Data"
- First row: Column headers (MetricName, Value, Unit, etc.)
- Subsequent rows: Metric data, one per row
- No merged cells or formatting

### 3. **Data Validation Checklist**

Before uploading:

- [ ] All required metrics for selected challenges are present
- [ ] Numbers are accurate and not rounded excessively
- [ ] Units match specification (hours, percentage, count, etc.)
- [ ] Data is current (within last 3 months for point-in-time metrics)
- [ ] File format is CSV or Excel
- [ ] No sensitive personal information included
- [ ] Source documentation is available for audit

---

## Troubleshooting

### "Missing Required Fields" Error

**Check:**
1. Is the metric name spelled correctly?
2. Is the value present (not blank)?
3. Is the value numeric (not text)?
4. For percentages, is the format correct (e.g., "88" or "88%" not "0.88")?

**Example Fix:**
```
❌ Wrong:  students_per_class, 28 (field name mismatch)
✅ Right:  students_per_classroom, 28

❌ Wrong:  attendance_rate, "91%" (stored as text)
✅ Right:  attendance_rate_pct, 91
```

### "Data Quality Below Threshold"

If completeness < 100%:
- Check all required metrics are included
- Verify no data is missing for selected challenges
- Add optional metrics to improve analysis depth

---

## Sample Data Files

### Minimal Viable Dataset (All 4 Core Metrics)

```csv
MetricName,Value,Unit,Benchmark,Status
students_per_classroom,28,students,25,Fair
parent_query_response_sla_hours,24,hours,12,Good
annual_training_hours,20,hours per year,25,Acceptable
weekly_planning_hours,4,hours per week,5,Acceptable
```

### Comprehensive Dataset (Growth & Enrollment Focus)

```csv
MetricName,Value,Unit,Benchmark,Status
new_enrollment_rate,-5,percentage,5,Critical
total_current_students,1260,count,1300,Fair
retention_rate_pct,82,percentage,85,Fair
midyear_dropout_rate_pct,5,percentage,3,High
outflow_to_competitors_pct,3,percentage,2,High
```

---

## Questions?

For support on:
- **Data collection:** Contact your School Management System vendor
- **Format issues:** Check examples in the Data Collection sections above
- **Specific challenges:** Refer to the challenge-specific data requirements table

---

**Document Version:** 1.0  
**Last Updated:** August 2025  
**Next Review:** February 2026
