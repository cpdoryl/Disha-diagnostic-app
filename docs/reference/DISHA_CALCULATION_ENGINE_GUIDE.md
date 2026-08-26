# DISHA First Opinion Calculation Engine
## Excel Implementation Guide & Formula Reference

**Purpose:** Step-by-step guide to build the calculation engine in Excel  
**Time Required:** 30 minutes to set up  
**Difficulty:** Intermediate (Excel formulas & data validation)

---

## Quick Start: Use This Template

Create a new Excel workbook with these sheets:

### Sheet 1: Input Dashboard

**Column A: Labels | Column B: Input Fields**

```
ROW 1:  DISHA FIRST OPINION ENGINE
ROW 2:  Real-Time Calculation Dashboard

ROW 4:  SCHOOL DETAILS
ROW 5:  School Name               | [INPUT TEXT]
ROW 6:  Board Affiliation         | [CBSE / ICSE / IB / State]
ROW 7:  Total Students            | [INPUT NUMBER]
ROW 8:  Annual Fee Tier          | [INPUT]
ROW 9:  City / District           | [INPUT TEXT]

ROW 11: CHALLENGE SELECTION (Max 3)
ROW 12: Primary Challenge (50%)   | [DROPDOWN - C1 to C15]
ROW 13: Secondary Challenge (30%) | [DROPDOWN - C1 to C15]
ROW 14: Tertiary Challenge (20%)  | [DROPDOWN - C1 to C15]

ROW 16: OPERATIONAL METRICS
ROW 17: Student-Teacher Ratio     | [INPUT NUMBER]      | Ideal: ≤20
ROW 18: Parent Response SLA (hrs)  | [INPUT NUMBER]      | Ideal: ≤12
ROW 19: Teacher Training Hours     | [INPUT NUMBER]      | Ideal: ≥25
ROW 20: Weekly Planning Hours      | [INPUT NUMBER]      | Ideal: ≥5
```

**Cell Formatting:**
- Input cells: Light blue background (RGB: 204, 251, 241)
- Labels: Bold, dark blue text
- Numbers: Number format, 1 decimal place

---

### Sheet 2: Questionnaire & Scoring

**This sheet stores all questions and their weights**

#### Challenge C1: Enrollment Decline

```
| Question ID | Challenge | Question | Option A | Weight A | Option B | Weight B | Option C | Weight C |
|-------------|-----------|----------|----------|----------|----------|----------|----------|----------|
| Q1.1 | C1 | Inquiry-to-admission rate | >25% | 2 | 10-25% | 6 | <10% | 10 |
| Q1.2 | C1 | Marketing channels | Digital | 3 | Print | 6 | None | 8 |
| Q1.3 | C1 | Parent drop-off | After inquiry | 9 | After tour | 7 | After offer | 8 |
```

**For all 15 Challenges:**

#### Challenge C2: Student Attrition
```
| Q2.1 | C2 | Annual dropout rate | <5% | 2 | 5-15% | 7 | >15% | 10 |
| Q2.2 | C2 | Dropout tracking system | Yes, formal | 2 | Partial tracking | 5 | No tracking | 9 |
| Q2.3 | C2 | Intervention programs | Robust | 2 | Basic | 6 | None | 10 |
```

#### Challenge C3: Fee Collection
```
| Q3.1 | C3 | Fee default rate | <5% | 2 | 5-15% | 6 | >15% | 10 |
| Q3.2 | C3 | Collection process | Automated | 2 | Manual | 6 | Ad-hoc | 9 |
| Q3.3 | C3 | Late fee penalties | Clear policy | 2 | Unclear | 5 | No policy | 8 |
```

#### Challenge C4: Teacher Attrition
```
| Q4.1 | C4 | Annual turnover rate | <10% | 2 | 10-25% | 6 | >25% | 10 |
| Q4.2 | C4 | Teaching load | 18-22 periods | 2 | 24-28 periods | 6 | 30+ periods | 9 |
| Q4.3 | C4 | Exit reason | Career gap | 5 | Better salary | 8 | Burnout | 9 |
```

#### Challenge C5: Staff Capability
```
| Q5.1 | C5 | Formal training/year | ≥25 hrs | 2 | 15-25 hrs | 6 | <15 hrs | 9 |
| Q5.2 | C5 | Skill gap assessment | Yes | 2 | Partial | 5 | No | 8 |
| Q5.3 | C5 | Mentoring program | Structured | 2 | Ad-hoc | 6 | None | 9 |
```

#### Challenge C6: Leadership Gap
```
| Q6.1 | C6 | Middle management pipeline | 3+ people | 2 | 1-2 people | 6 | None | 10 |
| Q6.2 | C6 | Leadership development | Formal program | 2 | Informal | 5 | None | 9 |
| Q6.3 | C6 | Succession plan | Documented | 2 | Verbal | 5 | None | 8 |
```

#### Challenge C7: Academic Performance
```
| Q7.1 | C7 | Board pass rate | >90% | 2 | 75-90% | 6 | <75% | 10 |
| Q7.2 | C7 | Trending (year-on-year) | Improving | 2 | Stable | 5 | Declining | 9 |
| Q7.3 | C7 | Subject-wise gaps | Identified & addressed | 2 | Identified only | 5 | Not analyzed | 8 |
```

#### Challenge C8: Student Wellbeing
```
| Q8.1 | C8 | Student stress (self-report) | Low | 2 | Moderate | 6 | High | 10 |
| Q8.2 | C8 | Mental health support | Counselor on-site | 2 | External access | 5 | None | 9 |
| Q8.3 | C8 | Discipline cases/month | <3 | 2 | 3-10 | 6 | >10 | 9 |
```

#### Challenge C9: Remedial Gap
```
| Q9.1 | C9 | Low-performer identification | Automated system | 2 | Manual | 5 | Ad-hoc | 8 |
| Q9.2 | C9 | Remedial program coverage | >90% at-risk | 2 | 50-90% | 6 | <50% | 10 |
| Q9.3 | C9 | Progress tracking | Weekly | 2 | Monthly | 5 | Irregular | 8 |
```

#### Challenge C10: Parent Communication
```
| Q10.1 | C10 | Communication channel | Formal portal/ticketing | 2 | Physical visits/notes | 6 | WhatsApp/calls | 9 |
| Q10.2 | C10 | Response time (SLA) | <12 hrs | 1 | 24-48 hrs | 5 | >48 hrs | 9 |
| Q10.3 | C10 | Parent satisfaction | High (NPS>50) | 1 | Medium (NPS 30-50) | 6 | Low (NPS<30) | 10 |
```

#### Challenge C11: Competitor Pressure
```
| Q11.1 | C11 | Competitive advantage | Clear differentiation | 2 | Some differences | 6 | Undifferentiated | 10 |
| Q11.2 | C11 | Market intelligence | Systematic monitoring | 2 | Ad-hoc awareness | 6 | No tracking | 9 |
| Q11.3 | C11 | Feature updates | Regular innovation | 2 | Occasional | 6 | Static offerings | 9 |
```

#### Challenge C12: Brand Perception
```
| Q12.1 | C12 | Net Promoter Score | >50 | 2 | 30-50 | 6 | <30 | 10 |
| Q12.2 | C12 | Local reputation | Strong positive | 2 | Mixed | 6 | Weak | 9 |
| Q12.3 | C12 | Word-of-mouth (qualitative) | Consistently positive | 2 | Variable | 6 | Often negative | 9 |
```

#### Challenge C13: Cost Inflation
```
| Q13.1 | C13 | Cost-to-revenue ratio | <65% | 2 | 65-75% | 6 | >75% | 10 |
| Q13.2 | C13 | Cost control measures | Systematic optimization | 2 | Periodic reviews | 6 | No formal process | 9 |
| Q13.3 | C13 | Margin trend | Improving | 2 | Stable | 5 | Declining | 9 |
```

#### Challenge C14: Infrastructure Deficits
```
| Q14.1 | C14 | Facilities condition | Excellent | 2 | Good | 5 | Poor/aging | 9 |
| Q14.2 | C14 | Safety audit compliance | 100% | 2 | 75-99% | 5 | <75% | 9 |
| Q14.3 | C14 | Tech infrastructure (LMS, labs) | Modern | 2 | Adequate | 5 | Outdated/absent | 9 |
```

#### Challenge C15: Compliance Stress
```
| Q15.1 | C15 | Last audit outcome | Passed | 2 | Passed with comments | 6 | Failed/pending | 10 |
| Q15.2 | C15 | Compliance documentation | Systematic | 2 | Ad-hoc | 6 | Reactive | 9 |
| Q15.3 | C15 | RTE/policy adherence | Full compliance | 2 | Minor issues | 5 | Significant gaps | 9 |
```

---

### Sheet 3: Calculation Engine

**Column A: Step | Column B: Formula | Column C: Result**

#### Inputs (Data Entry Section)

```
ROW 1:  CALCULATION ENGINE
ROW 2:  

ROW 4:  INPUT PARAMETERS
ROW 5:  Challenge Selection Weight | 50% | (Primary)
ROW 6:  Q1 Weight Selected | [VLOOKUP formula to get weight] | 
ROW 7:  Q2 Weight Selected | [VLOOKUP formula to get weight] | 
ROW 8:  Q3 Weight Selected | [VLOOKUP formula to get weight] |

ROW 10: STR Input | [Reference to Sheet1!B17] |
ROW 11: Parent SLA Input | [Reference to Sheet1!B18] |
ROW 12: Training Hours Input | [Reference to Sheet1!B19] |
ROW 13: Planning Hours Input | [Reference to Sheet1!B20] |
```

#### Calculation Steps

```
ROW 16: STEP 1: SUBJECTIVE BASE SCORE (S_sub)
ROW 17: Formula: =100 - ((SUM(B6:B8)/(3*10))*100)
ROW 18: Result: [CALCULATED VALUE]
ROW 19: Description: Perception-based severity score (0-100)

ROW 21: STEP 2: OBJECTIVE SCALING FACTORS

ROW 22: STR Multiplier (m_STR)
ROW 23: Formula: =IF(B10<=20,1.05,IF(B10<=28,1.00,IF(B10<=35,0.88,0.75)))
ROW 24: Result: [CALCULATED VALUE]

ROW 26: SLA Multiplier (m_SLA)
ROW 27: Formula: =IF(B11<=12,1.05,IF(B11<=24,1.00,IF(B11<=48,0.85,0.70)))
ROW 28: Result: [CALCULATED VALUE]

ROW 30: Training Multiplier (m_retrain)
ROW 31: Formula: =IF(B12>=25,1.05,IF(B12>=15,1.00,0.85))
ROW 32: Result: [CALCULATED VALUE]

ROW 34: Planning Multiplier (m_plan)
ROW 35: Formula: =IF(B13>=5,1.05,IF(B13>=3,1.00,0.88))
ROW 36: Result: [CALCULATED VALUE]

ROW 38: OBJECTIVE SCALING FACTOR (M_obj)
ROW 39: Formula: =B24*B28*B32*B36
ROW 40: Result: [CALCULATED VALUE]
ROW 41: Description: Combined operational metrics (0.60-1.15)

ROW 43: STEP 3: SCALED SCORE
ROW 44: Formula: =B18*B40
ROW 45: Result: [CALCULATED VALUE]
ROW 46: Description: S_sub multiplied by M_obj

ROW 48: STEP 4: DELUSION PENALTY (P_mismatch)
ROW 49: Formula: =IF(AND(B18>=80,B40<=0.85),15,IF(AND(B18>=70,B40<=0.78),10,0))
ROW 50: Result: [CALCULATED VALUE]
ROW 51: Description: Perception-reality gap penalty

ROW 53: FINAL HEALTH INDEX (H)
ROW 54: Formula: =MAX(0,MIN(100,B45-B50))
ROW 55: Result: [CALCULATED VALUE - FORMAT AS LARGE BOLD NUMBER]
ROW 56: Description: Final score (0-100)
```

#### Risk Quadrant Classification

```
ROW 58: RISK QUADRANT CLASSIFICATION
ROW 59: Formula: =IF(AND(B18>=80,B40>=0.95),"ELITE EQUILIBRIUM",
                    IF(AND(B18>=80,B40<0.85),"DELUSIONAL COMFORT - RED ALERT",
                    IF(AND(B18<60,B40>=0.95),"HIDDEN EXCELLENCE",
                    "CRITICAL COLLAPSE")))
ROW 60: Result: [CALCULATED QUADRANT]

ROW 62: Risk Level
ROW 63: Formula: =IF(B55>=80,"LOW RISK",IF(B55>=60,"MODERATE RISK","HIGH RISK"))
ROW 64: Result: [CALCULATED RISK LEVEL]

ROW 66: Action Required
ROW 67: Formula: =IF(B55<60,"MANDATORY STEP 3 DEEP AUDIT","Monitor & Track")
ROW 68: Result: [CALCULATED ACTION]
```

---

## Excel Implementation Checklist

- [ ] Sheet 1: Input Dashboard created
  - [ ] School details section (rows 4-9)
  - [ ] Challenge selection with dropdown (rows 11-14)
  - [ ] Operational metrics input (rows 16-20)
  - [ ] Input cells formatted with light blue background

- [ ] Sheet 2: Questionnaire Reference
  - [ ] All 15 challenges listed (C1-C15)
  - [ ] 3 questions per challenge
  - [ ] Weight values for each option
  - [ ] Lookup formulas working

- [ ] Sheet 3: Calculation Engine
  - [ ] Input parameter section (rows 4-13)
  - [ ] Step 1: S_sub formula (row 18)
  - [ ] Step 2: Individual multipliers (rows 23, 27, 31, 35)
  - [ ] Composite M_obj formula (row 40)
  - [ ] Step 3: Scaled score formula (row 45)
  - [ ] Step 4: Delusion penalty formula (row 50)
  - [ ] Final health index formula (row 55)
  - [ ] Risk quadrant classification (row 60)
  - [ ] Risk level classification (row 64)
  - [ ] Action recommendation (row 68)

- [ ] Formatting
  - [ ] Headers in blue with white text
  - [ ] Input cells in light blue
  - [ ] Result cells in yellow
  - [ ] Final score in large bold font
  - [ ] Color coding for risk levels (green/yellow/red)

- [ ] Testing
  - [ ] Enter test data and verify calculations
  - [ ] Test all formula paths
  - [ ] Verify risk quadrant classifications
  - [ ] Cross-check manual calculations

---

## Example Calculations

### Scenario 1: Delusional Comfort

**Inputs:**
- Primary Challenge: Enrollment Decline
- Q1: Below 10% conversion → weight 10
- Q2: No marketing budget → weight 8
- Q3: After initial inquiry drop-off → weight 9
- STR: 34:1
- Parent SLA: 52 hours
- Teacher Training: 8 hours/year
- Planning Time: 2 hours/week

**Calculations:**

```
S_sub = 100 - ((10+8+9)/(3*10))*100 = 100 - 90 = 10
(School rates itself poorly)

m_STR = 0.88 (STR > 35 causes overload)
m_SLA = 0.70 (SLA > 48 hours causes breakdown)
m_retrain = 0.85 (Training < 15 hrs/year)
m_plan = 0.88 (Planning < 3 hrs/week)

M_obj = 0.88 × 0.70 × 0.85 × 0.88 = 0.459
(Operations are only 46% of ideal)

S_scaled = 10 × 0.459 = 4.59

P_mismatch = 0 (S_sub not ≥80, so no delusion penalty)
(Actually, this school is being honest about poor enrollment)

H = MAX(0, MIN(100, 4.59 - 0)) = 4.59

Result: 5/100 (CRITICAL COLLAPSE)
Action: EMERGENCY intervention required
```

### Scenario 2: Hidden Excellence

**Inputs:**
- Primary Challenge: Teacher Attrition
- Q1: <10% turnover → weight 2
- Q2: 18-22 periods/week → weight 2
- Q3: Lack of career progression → weight 5
- STR: 18:1
- Parent SLA: 12 hours
- Teacher Training: 30 hours/year
- Planning Time: 5 hours/week

**Calculations:**

```
S_sub = 100 - ((2+2+5)/(3*10))*100 = 100 - 30 = 70
(School rates itself moderately)

m_STR = 1.05 (STR ≤ 20 - optimal)
m_SLA = 1.05 (SLA ≤ 12 hours - elite)
m_retrain = 1.05 (Training ≥ 25 hrs/year)
m_plan = 1.05 (Planning ≥ 5 hrs/week)

M_obj = 1.05 × 1.05 × 1.05 × 1.05 = 1.216
(Operations exceed ideal - top 10%)

S_scaled = 70 × 1.216 = 85.1

P_mismatch = 0 (S_sub not ≥80 and M_obj high, no mismatch)

H = MAX(0, MIN(100, 85.1 - 0)) = 85.1

Quadrant: HIDDEN EXCELLENCE
Result: 85/100 (LOW RISK)
Action: Implement PR/communication to align perception with reality
```

---

## Tips for Accurate Calculations

1. **Double-check data entry:** Verify STR, SLA, training hours are realistic
2. **Use consistent units:** SLA in hours, training in hours/year, planning in hours/week
3. **Test with known scenarios:** Verify formulas produce expected risk quadrants
4. **Document assumptions:** Note any data sources or estimations
5. **Version control:** Save different assessment versions (e.g., "School A - Aug 2026")

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| #DIV/0! | Formula dividing by zero | Check formula logic and data entry |
| #VALUE! | Text in numeric field | Ensure all metric inputs are numbers |
| Result = 0 | All weights are 1 | Verify question answers are selected |
| Result > 100 | Calculation error | Check MIN/MAX clamping formula |
| Quadrant wrong | Logic error | Verify IF formula conditions in order |

---

## Validation Checklist

After setup, validate with these test cases:

**Test Case 1: Perfect School**
- All metrics optimal
- All questions answered "best"
- Expected result: H > 85, Quadrant = ELITE EQUILIBRIUM

**Test Case 2: Struggling School**
- All metrics poor
- All questions answered "worst"
- Expected result: H < 30, Quadrant = CRITICAL COLLAPSE

**Test Case 3: Delusional School**
- S_sub = 85 (high confidence)
- M_obj = 0.70 (poor operations)
- Expected result: High penalty, H < 60, Quadrant = DELUSIONAL COMFORT

---

## Next Steps

1. ✅ Set up the 3 sheets with formulas
2. ✅ Test with sample data
3. ✅ Format for presentation
4. ✅ Train team on data entry
5. ✅ Use with real school assessments

---

*DISHA Calculation Engine Guide*  
*For Excel implementation support, refer to the Python script: generate-disha-calculator.py*
