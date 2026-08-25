# DISHA FIRST OPINION DIAGNOSTIC ENGINE: COMPLETE EXCEL MODEL SPECIFICATION
## Step-by-Step Architecture, Sheet Layouts, Lookup Tables, and Exact Excel Formulas

This specification provides the complete, production-grade Excel / Google Sheets model for the **Disha First Opinion Diagnostic Engine**. You can build this directly in Microsoft Excel or Google Sheets. It includes all lookup tables, challenge mappings, dynamic screening question weightings, objective metric multiplier logic, divergence penalty formulas, and quadrant classification rules.

---

## 1. EXCEL WORKBOOK STRUCTURE & TAB SUMMARY

To ensure modularity and zero errors, the Excel workbook is organized into **5 core worksheets (tabs)**:

1. **`1_Dashboard_Inputs`**: The primary user interface where the school owner selects challenges, enters screening answers (1–5), inputs 4 objective operational metrics, and views the calculated First Opinion Score and Risk Quadrant.
2. **`2_Challenge_Catalog`**: The master lookup table of the 15 systemic challenges across 5 domains with their assigned weights.
3. **`3_Screening_Questions`**: The dynamic database of screening questions mapped to each challenge ID with response option values (1 to 5) converted to severity risk points.
4. **`4_Objective_Metrics_Rules`**: The lookup table for operational benchmarks (STR, SLA, Retraining, Planning) converting raw values into mathematical multipliers ($m_{STR}, m_{SLA}, m_{retrain}, m_{plan}$).
5. **`5_Engine_Calculations`**: The backend calculation tab where Excel formulas process inputs, calculate $S_{sub}$, $M_{obj}$, $P_{mismatch}$, divergence, and output the final Health Index ($H$).

---

## 2. TAB 1: `1_Dashboard_Inputs` (USER INTERFACE & READOUT)

### Layout & Cell Coordinates

```
Row  | Col A                        | Col B                      | Col C / Notes
─────┼──────────────────────────────┼────────────────────────────┼──────────────────────────────────────────────────
 1   | DISHA FIRST OPINION ENGINE   | INPUT & READOUT DASHBOARD  | 
 2   | School Name                  | Green Valley High          | [Text Input]
 3   | Board Affiliation            | CBSE                       | [Dropdown: CBSE, ICSE, IB, State]
 4   | Total Student Count          | 1200                       | [Number Input]
 5   |                              |                            |
 6   | SECTION A: CHALLENGE SELECTION (Max 3)                    |
 7   | Primary Challenge (C1)       | enrollment_decline         | [Dropdown from 2_Challenge_Catalog!A2:A16]
 8   | Secondary Challenge (C2)     | teacher_attrition          | [Dropdown or Blank]
 9   | Tertiary Challenge (C3)      | parent_dissatisfaction     | [Dropdown or Blank]
10   |                              |                            |
11   | SECTION B: SCREENING QUESTION RESPONSES (1 to 5 Rating)   |
12   | Q1 Score (C1 Probe 1)        | 2                          | [Integer 1 to 5]
13   | Q2 Score (C1 Probe 2)        | 2                          | [Integer 1 to 5]
14   | Q3 Score (C2 Probe 1)        | 1                          | [Integer 1 to 5]
15   | Q4 Score (C2 Probe 2)        | 2                          | [Integer 1 to 5]
16   | Q5 Score (C3 Probe 1)        | 2                          | [Integer 1 to 5]
17   | Q6 Score (C3 Probe 2)        | 2                          | [Integer 1 to 5]
18   |                              |                            |
19   | SECTION C: OBJECTIVE OPERATIONAL METRICS                  |
20   | Student-Teacher Ratio (STR)  | 34                         | [Number: Students per teacher]
21   | Parent Response SLA (Hours)  | 52                         | [Number: Average query turnaround hours]
22   | Retraining Hours (Hrs/Yr)    | 8                          | [Number: Annual PD hours per teacher]
23   | Lesson Planning (Hrs/Wk)     | 2                          | [Number: Weekly planning hours]
24   |                              |                            |
25   | SECTION D: ENGINE DIAGNOSTIC READOUT                      |
26   | Subjective Base Score (S_sub)| =5_Engine_Calculations!B7  | Formula link (e.g. 35.0)
27   | Objective Factor (M_obj)     | =5_Engine_Calculations!B14 | Formula link (e.g. 0.5236)
28   | Delusion Penalty (P_mismatch) | =5_Engine_Calculations!B17 | Formula link (e.g. 15.0)
29   | FINAL HEALTH INDEX SCORE (H) | =5_Engine_Calculations!B20 | Formula link (e.g. 3.0 or Clamped)
30   | DIAGNOSTIC RISK QUADRANT     | =5_Engine_Calculations!B23 | Formula link (e.g. DELUSIONAL COMFORT)
31   | ACTIONABLE RECOMMENDATION    | =5_Engine_Calculations!B25 | Formula link
```

---

## 3. TAB 2: `2_Challenge_Catalog` (LOOKUP TABLE)

Create this table starting at cell `A1`:

| Row | Col A (Challenge ID) | Col B (Domain Name) | Col C (Challenge Display Name) | Col D (Default Weight) |
|---|---|---|---|---|
| **1** | **Challenge_ID** | **Domain_Name** | **Display_Name** | **Weight** |
| **2** | `enrollment_decline` | Growth & Enrollment | Enrollment decline / admission shortfall | 0.50 |
| **3** | `student_attrition` | Growth & Enrollment | Student attrition / mid-year dropouts | 0.50 |
| **4** | `fee_default` | Growth & Enrollment | Fee collection default & delayed payments | 0.50 |
| **5** | `teacher_attrition` | People & Staffing | Teacher attrition / staff turnover | 0.30 |
| **6** | `staff_capability` | People & Staffing | Staff quality, training & skill gaps | 0.30 |
| **7** | `leadership_gap` | People & Staffing | Middle management & coordinator gap | 0.30 |
| **8** | `academic_decline` | Academic & Student | Academic performance drop / prep slip | 0.30 |
| **9** | `student_wellbeing` | Academic & Student | Student stress, discipline & mental health | 0.20 |
| **10**| `remedial_lag` | Academic & Student | Low-performer remedial gap | 0.20 |
| **11**| `parent_dissatisfaction` | Reputation & Competition | Parent complaints & poor communication | 0.20 |
| **12**| `competitor_pressure` | Reputation & Competition | Rival school marketing & feature loss | 0.20 |
| **13**| `brand_perception` | Reputation & Competition | Weak local reputation / word-of-mouth | 0.20 |
| **14**| `cost_inflation` | Operations & Finance | Rising operational costs / margin squeeze | 0.20 |
| **15**| `infra_deficits` | Operations & Finance | Aging facilities, safety & tech gaps | 0.20 |
| **16**| `compliance_stress` | Operations & Finance | Board compliance, RTE & audit stress | 0.20 |

---

## 4. TAB 3: `3_Screening_Questions` (QUESTIONS & SEVERITY WEIGHTS)

This sheet maps the rating scale (1 to 5) entered on Tab 1 to **Risk Penalty Points** (10 = Critical Risk, 0 = Optimal Practice).

| Row | Col A (Question ID) | Col B (Challenge ID) | Col C (Question Text) | Col D (Score 1 Risk) | Col E (Score 2 Risk) | Col F (Score 3 Risk) | Col G (Score 4 Risk) | Col H (Score 5 Risk) |
|---|---|---|---|---|---|---|---|---|
| **1** | **Q_ID** | **Challenge_ID** | **Question_Prompt** | **R_Val1** | **R_Val2** | **R_Val3** | **R_Val4** | **R_Val5** |
| **2** | `Q1` | `enrollment_decline` | Inquiry conversion rate efficiency | 10 | 8 | 5 | 2 | 0 |
| **3** | `Q2` | `enrollment_decline` | Parent drop-off stage in admission funnel | 10 | 8 | 6 | 3 | 0 |
| **4** | `Q3` | `teacher_attrition` | Annual teacher turnover percentage | 10 | 8 | 5 | 2 | 0 |
| **5** | `Q4` | `teacher_attrition` | Weekly teaching period workload overload | 10 | 8 | 6 | 3 | 0 |
| **6** | `Q5` | `parent_dissatisfaction` | Official grievance communication channel | 10 | 8 | 5 | 2 | 0 |
| **7** | `Q6` | `parent_dissatisfaction` | Parent query response turnaround SLA | 10 | 8 | 5 | 2 | 0 |

---

## 5. TAB 4: `4_Objective_Metrics_Rules` (MULTIPLIER LOOKUP TABLES)

This tab holds the benchmark thresholds for operational metrics.

### Table 1: Student-Teacher Ratio (STR) — Range: `A2:C5`
| Row | Min_STR | Max_STR | Multiplier ($m_{STR}$) |
|---|---|---|---|
| **2** | 0 | 20 | 1.05 |
| **3** | 20.01 | 28 | 1.00 |
| **4** | 28.01 | 35 | 0.88 |
| **5** | 35.01 | 999 | 0.75 |

### Table 2: Parent Response SLA (Hours) — Range: `E2:G5`
| Row | Min_SLA | Max_SLA | Multiplier ($m_{SLA}$) |
|---|---|---|---|
| **2** | 0 | 12 | 1.05 |
| **3** | 12.01 | 24 | 1.00 |
| **4** | 24.01 | 48 | 0.85 |
| **5** | 48.01 | 999 | 0.70 |

### Table 3: Teacher Retraining Hours (Hrs/Yr) — Range: `I2:K4`
| Row | Min_Hours | Max_Hours | Multiplier ($m_{retrain}$) |
|---|---|---|---|
| **2** | 25 | 999 | 1.05 |
| **3** | 15 | 24.99 | 1.00 |
| **4** | 0 | 14.99 | 0.85 |

### Table 4: Weekly Lesson Planning (Hrs/Wk) — Range: `M2:O4`
| Row | Min_Plan | Max_Plan | Multiplier ($m_{plan}$) |
|---|---|---|---|
| **2** | 5 | 999 | 1.05 |
| **3** | 3 | 4.99 | 1.00 |
| **4** | 0 | 2.99 | 0.88 |

---

## 6. TAB 5: `5_Engine_Calculations` (EXACT EXCEL FORMULAS)

This tab contains all logic. Here are the exact cell coordinates and formulas:

```
Row  | Col A (Calculation Metric Name)         | Col B (Excel Formula / Value)
─────┼─────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────
 1   | DISHA BACKEND ENGINE CALCULATIONS       | 
 2   |                                         | 
 3   | --- STAGE 1: SUBJECTIVE BASELINE ---    | 
 4   | Total Risk Points Selected (Q1 to Q6)  | =HLOOKUP('1_Dashboard_Inputs'!B12, '3_Screening_Questions'!D2:H2, 1, FALSE) + ... [See details below]
 5   | Average Risk Penalty (Avg_Penalty)      | =AVERAGE(B4_Q1_Penalty, B4_Q2_Penalty, B4_Q3_Penalty, B4_Q4_Penalty, B4_Q5_Penalty, B4_Q6_Penalty)
 6   | Subjective Score Unclamped              | =100 - (B5 * 10)
 7   | Subjective Base Score (S_sub)           | =MAX(0, MIN(100, B6))
 8   |                                         | 
 9   | --- STAGE 2: OBJECTIVE FACTOR ---       | 
10   | STR Multiplier (m_STR)                  | =IF('1_Dashboard_Inputs'!B20<=20, 1.05, IF('1_Dashboard_Inputs'!B20<=28, 1.00, IF('1_Dashboard_Inputs'!B20<=35, 0.88, 0.75)))
11   | SLA Multiplier (m_SLA)                  | =IF('1_Dashboard_Inputs'!B21<=12, 1.05, IF('1_Dashboard_Inputs'!B21<=24, 1.00, IF('1_Dashboard_Inputs'!B21<=48, 0.85, 0.70)))
12   | Retraining Multiplier (m_retrain)       | =IF('1_Dashboard_Inputs'!B22>=25, 1.05, IF('1_Dashboard_Inputs'!B22>=15, 1.00, 0.85))
13   | Planning Multiplier (m_plan)            | =IF('1_Dashboard_Inputs'!B23>=5, 1.05, IF('1_Dashboard_Inputs'!B23>=3, 1.00, 0.88))
14   | Master Objective Factor (M_obj)          | =B10 * B11 * B12 * B13
15   |                                         | 
16   | --- STAGE 3: MISMATCH & DIVERGENCE ---  | 
17   | Delusion Penalty (P_mismatch)           | =IF(AND(B7>=80, B14<=0.85), 15, IF(AND(B7>=70, B14<=0.78), 10, 0))
18   | Unclamped Health Index                  | =(B7 * B14) - B17
19   | Hard Operational Score Baseline         | =B14 * 100
20   | FINAL HEALTH INDEX (H)                  | =MAX(0, MIN(100, B18))
21   | Absolute Divergence                      | =ABS(B7 - B19)
22   |                                         | 
23   | RISK QUADRANT CLASSIFICATION            | =IF(AND(B7>=80, B14>=0.95), "ELITE EQUILIBRIUM", IF(AND(B7>=80, B14<0.85), "DELUSIONAL COMFORT", IF(AND(B7<60, B14>=0.95), "HIDDEN EXCELLENCE", "CRITICAL OPERATIONAL COLLAPSE")))
24   |                                         | 
25   | EXECUTIVE ACTION RECOMMENDATION         | =IF(B23="DELUSIONAL COMFORT", "CRITICAL MISMATCH: Management perception is disconnected from slow parent SLA (52 hrs). Enforce 24hr SLA immediately.", IF(B23="CRITICAL OPERATIONAL COLLAPSE", "HIGH SYSTEMIC RISK: Unlock Step 3 14-Dimension Deep Dive immediately.", "Maintain operational standards and monitor metrics."))
```

---

## 7. DETAILED BREAKDOWN OF INDIVIDUAL EXCEL FORMULAS

### Formula 1: Looking Up Risk Penalty Points for Screening Answers (Cell `B4_Q1` to `B4_Q6`)
For cell Q1 response entered in `'1_Dashboard_Inputs'!B12` (value 1, 2, 3, 4, or 5):
```excel
=INDEX('3_Screening_Questions'!D2:H2, 1, '1_Dashboard_Inputs'!B12)
```
* **Explanation**: If `'1_Dashboard_Inputs'!B12` = 2, this formula pulls the 2nd column of range `D2:H2` in sheet `3_Screening_Questions`, returning **8 risk penalty points**.

---

### Formula 2: Subjective Base Score ($S_{sub}$) (Cell `B7` in `5_Engine_Calculations`)
```excel
=MAX(0, MIN(100, 100 - (AVERAGE(B4_Q1:B4_Q6) * 10)))
```
* **Worked Calculation Example**:
  - Suppose inputs for Q1..Q6 are `2, 2, 1, 2, 2, 2`.
  - Risk penalty values pulled from sheet 3: `8, 8, 10, 8, 8, 8`.
  - Average Penalty = $(8+8+10+8+8+8)/6 = 50 / 6 = \mathbf{8.333}$.
  - Raw $S_{sub} = 100 - (8.333 \times 10) = 100 - 83.33 = \mathbf{16.67}$.

---

### Formula 3: Master Objective Scaling Factor ($M_{obj}$) (Cell `B14` in `5_Engine_Calculations`)
```excel
=IF('1_Dashboard_Inputs'!B20<=20, 1.05, IF('1_Dashboard_Inputs'!B20<=28, 1.00, IF('1_Dashboard_Inputs'!B20<=35, 0.88, 0.75)))
* IF('1_Dashboard_Inputs'!B21<=12, 1.05, IF('1_Dashboard_Inputs'!B21<=24, 1.00, IF('1_Dashboard_Inputs'!B21<=48, 0.85, 0.70)))
* IF('1_Dashboard_Inputs'!B22>=25, 1.05, IF('1_Dashboard_Inputs'!B22>=15, 1.00, 0.85))
* IF('1_Dashboard_Inputs'!B23>=5, 1.05, IF('1_Dashboard_Inputs'!B23>=3, 1.00, 0.88))
```
* **Worked Calculation Example**:
  - STR = 34 $\implies m_{STR} = 0.88$
  - SLA = 52 Hours $\implies m_{SLA} = 0.70$
  - Retraining = 8 Hours $\implies m_{retrain} = 0.85$
  - Planning = 2 Hours $\implies m_{plan} = 0.88$
  - **Master $M_{obj}$** = $0.88 \times 0.70 \times 0.85 \times 0.88 = \mathbf{0.4608}$.

---

### Formula 4: Delusion Penalty ($P_{mismatch}$) (Cell `B17` in `5_Engine_Calculations`)
```excel
=IF(AND(B7>=80, B14<=0.85), 15, IF(AND(B7>=70, B14<=0.78), 10, 0))
```
* **Logic**: If management rates the school at $\ge 80\%$ subjective confidence, but objective metrics produce $M_{obj} \le 0.85$, subtract 15 points immediately as a "Delusional Comfort" penalty.

---

### Formula 5: Final Health Index ($H$) (Cell `B20` in `5_Engine_Calculations`)
```excel
=MAX(0, MIN(100, (B7 * B14) - B17))
```
* **Worked Calculation Example**:
  - Case 1 ($S_{sub} = 82$, $M_{obj} = 0.5236$):
    - Scaled = $82 \times 0.5236 = 42.93$.
    - Penalty $P_{mismatch} = 15.0$ (since $82 \ge 80$ and $0.5236 \le 0.85$).
    - Final $H = \text{MAX}(0, \text{MIN}(100, 42.93 - 15.0)) = \mathbf{27.93 \implies 28 / 100}$.

---

### Formula 6: Risk Quadrant Classification (Cell `B23` in `5_Engine_Calculations`)
```excel
=IF(AND(B7>=80, B14>=0.95), "ELITE EQUILIBRIUM", 
  IF(AND(B7>=80, B14<0.85), "DELUSIONAL COMFORT", 
    IF(AND(B7<60, B14>=0.95), "HIDDEN EXCELLENCE", 
      "CRITICAL OPERATIONAL COLLAPSE")))
```

---

## 8. STEP-BY-STEP VERIFICATION & TEST BENCH

You can test your Excel model against these two verified test cases:

### Test Case 1: "Delusional Comfort" Scenario
* **Inputs**:
  - Screening Question Answers = `5, 5, 4, 5, 4, 5` (Management rates everything high).
  - Risk Penalties = `0, 0, 2, 0, 2, 0` $\implies$ Avg Penalty = `0.667`.
  - Subjective Score $S_{sub} = 100 - (0.667 \times 10) = \mathbf{93.33}$.
  - Objective Inputs: STR = `34` ($0.88$), SLA = `52 hrs` ($0.70$), Training = `8 hrs` ($0.85$), Planning = `2 hrs` ($0.88$).
  - Factor $M_{obj} = 0.88 \times 0.70 \times 0.85 \times 0.88 = \mathbf{0.4608}$.
* **Excel Calculation**:
  - Scaled Score = $93.33 \times 0.4608 = \mathbf{43.01}$.
  - Delusion Penalty $P_{mismatch} = \mathbf{15.0}$ (because $S_{sub} \ge 80$ and $M_{obj} \le 0.85$).
  - Final Health Index $H = 43.01 - 15.0 = \mathbf{28.01} \implies \mathbf{28 / 100}$.
  - Quadrant = **`DELUSIONAL COMFORT`**.

---

### Test Case 2: "Elite Equilibrium" Scenario
* **Inputs**:
  - Screening Question Answers = `5, 5, 5, 5, 5, 5` (Optimal rating).
  - Subjective Score $S_{sub} = \mathbf{100.0}$.
  - Objective Inputs: STR = `18` ($1.05$), SLA = `10 hrs` ($1.05$), Training = `30 hrs` ($1.05$), Planning = `6 hrs` ($1.05$).
  - Factor $M_{obj} = 1.05 \times 1.05 \times 1.05 \times 1.05 = \mathbf{1.2155}$.
* **Excel Calculation**:
  - Scaled Score = $100.0 \times 1.2155 = \mathbf{121.55}$.
  - Penalty $P_{mismatch} = \mathbf{0}$.
  - Final Health Index $H = \text{MIN}(100, 121.55) = \mathbf{100 / 100}$.
  - Quadrant = **`ELITE EQUILIBRIUM`**.

---

## 9. SUMMARY FOR EXCEL MODEL IMPLEMENTATION

By following this specification, you can build a fully operational, standalone Excel workbook that accurately mirrors the **Disha First Opinion Engine**. Every input cell connects through deterministic logic to deliver an objective diagnosis, unmask management delusion, and guide school leadership toward actionable operational improvements.
