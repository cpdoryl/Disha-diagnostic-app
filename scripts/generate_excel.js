const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.utils.book_new();

// Sheet 1: 1_Dashboard_Inputs
const ws1_data = [
  ["DISHA FIRST OPINION ENGINE", "INPUT & READOUT DASHBOARD", ""],
  ["School Name", "Green Valley High", "[Text Input]"],
  ["Board Affiliation", "CBSE", "[Dropdown: CBSE, ICSE, IB, State]"],
  ["Total Student Count", 1200, "[Number Input]"],
  ["", "", ""],
  ["SECTION A: CHALLENGE SELECTION (Max 3)", "", ""],
  ["Primary Challenge (C1)", "enrollment_decline", "[Dropdown from Challenge Catalog]"],
  ["Secondary Challenge (C2)", "teacher_attrition", "[Dropdown or Blank]"],
  ["Tertiary Challenge (C3)", "parent_dissatisfaction", "[Dropdown or Blank]"],
  ["", "", ""],
  ["SECTION B: SCREENING QUESTION RESPONSES (1 to 5 Rating)", "", ""],
  ["Q1 Score (C1 Probe 1)", 2, "[Integer 1 to 5]"],
  ["Q2 Score (C1 Probe 2)", 2, "[Integer 1 to 5]"],
  ["Q3 Score (C2 Probe 1)", 1, "[Integer 1 to 5]"],
  ["Q4 Score (C2 Probe 2)", 2, "[Integer 1 to 5]"],
  ["Q5 Score (C3 Probe 1)", 2, "[Integer 1 to 5]"],
  ["Q6 Score (C3 Probe 2)", 2, "[Integer 1 to 5]"],
  ["", "", ""],
  ["SECTION C: OBJECTIVE OPERATIONAL METRICS", "", ""],
  ["Student-Teacher Ratio (STR)", 34, "[Number: Enrolled students per teacher]"],
  ["Parent Response SLA (Hours)", 52, "[Number: Average query turnaround hours]"],
  ["Retraining Hours (Hrs/Yr)", 8, "[Number: Annual PD hours per teacher]"],
  ["Lesson Planning (Hrs/Wk)", 2, "[Number: Weekly planning hours]"],
  ["", "", ""],
  ["SECTION D: ENGINE DIAGNOSTIC READOUT", "", ""]
];

const ws1 = XLSX.utils.aoa_to_sheet(ws1_data);

// Add formula cells to Sheet 1
ws1['B26'] = { t: 'n', f: "'5_Engine_Calculations'!B11" };
ws1['A26'] = { t: 's', v: "Subjective Base Score (S_sub)" };
ws1['C26'] = { t: 's', v: "Formula link (e.g. 16.67)" };

ws1['B27'] = { t: 'n', f: "'5_Engine_Calculations'!B18" };
ws1['A27'] = { t: 's', v: "Master Objective Factor (M_obj)" };
ws1['C27'] = { t: 's', v: "Formula link (e.g. 0.4608)" };

ws1['B28'] = { t: 'n', f: "'5_Engine_Calculations'!B21" };
ws1['A28'] = { t: 's', v: "Delusion Penalty (P_mismatch)" };
ws1['C28'] = { t: 's', v: "Formula link (e.g. 0)" };

ws1['B29'] = { t: 'n', f: "'5_Engine_Calculations'!B23" };
ws1['A29'] = { t: 's', v: "FINAL HEALTH INDEX SCORE (H)" };
ws1['C29'] = { t: 's', v: "Formula link (e.g. 7.68)" };

ws1['B30'] = { t: 's', f: "'5_Engine_Calculations'!B25" };
ws1['A30'] = { t: 's', v: "DIAGNOSTIC RISK QUADRANT" };
ws1['C30'] = { t: 's', v: "Formula link (e.g. CRITICAL OPERATIONAL COLLAPSE)" };

ws1['B31'] = { t: 's', f: "'5_Engine_Calculations'!B26" };
ws1['A31'] = { t: 's', v: "ACTIONABLE RECOMMENDATION" };
ws1['C31'] = { t: 's', v: "Formula link" };

ws1['!ref'] = "A1:C31";
ws1['!cols'] = [{ wch: 38 }, { wch: 30 }, { wch: 50 }];


// Sheet 2: 2_Challenge_Catalog
const ws2_data = [
  ["Challenge_ID", "Domain_Name", "Display_Name", "Default_Weight"],
  ["enrollment_decline", "Growth & Enrollment", "Enrollment decline / admission shortfall", 0.50],
  ["student_attrition", "Growth & Enrollment", "Student attrition / mid-year dropouts", 0.50],
  ["fee_default", "Growth & Enrollment", "Fee collection default & delayed payments", 0.50],
  ["teacher_attrition", "People & Staffing", "Teacher attrition / staff turnover", 0.30],
  ["staff_capability", "People & Staffing", "Staff quality, training & skill gaps", 0.30],
  ["leadership_gap", "People & Staffing", "Middle management & coordinator gap", 0.30],
  ["academic_decline", "Academic & Student", "Academic performance drop / prep slip", 0.30],
  ["student_wellbeing", "Academic & Student", "Student stress, discipline & mental health", 0.20],
  ["remedial_lag", "Academic & Student", "Low-performer remedial gap", 0.20],
  ["parent_dissatisfaction", "Reputation & Competition", "Parent complaints & poor communication", 0.20],
  ["competitor_pressure", "Reputation & Competition", "Rival school marketing & feature loss", 0.20],
  ["brand_perception", "Reputation & Competition", "Weak local reputation / word-of-mouth", 0.20],
  ["cost_inflation", "Operations & Finance", "Rising operational costs / margin squeeze", 0.20],
  ["infra_deficits", "Operations & Finance", "Aging facilities, safety & tech gaps", 0.20],
  ["compliance_stress", "Operations & Finance", "Board compliance, RTE & audit stress", 0.20]
];

const ws2 = XLSX.utils.aoa_to_sheet(ws2_data);
ws2['!cols'] = [{ wch: 25 }, { wch: 28 }, { wch: 45 }, { wch: 15 }];


// Sheet 3: 3_Screening_Questions
const ws3_data = [
  ["Q_ID", "Challenge_ID", "Question_Prompt", "R_Val1", "R_Val2", "R_Val3", "R_Val4", "R_Val5"],
  ["Q1", "enrollment_decline", "Inquiry conversion rate efficiency", 10, 8, 5, 2, 0],
  ["Q2", "enrollment_decline", "Parent drop-off stage in admission funnel", 10, 8, 6, 3, 0],
  ["Q3", "teacher_attrition", "Annual teacher turnover percentage", 10, 8, 5, 2, 0],
  ["Q4", "teacher_attrition", "Weekly teaching period workload overload", 10, 8, 6, 3, 0],
  ["Q5", "parent_dissatisfaction", "Official grievance communication channel", 10, 8, 5, 2, 0],
  ["Q6", "parent_dissatisfaction", "Parent query response turnaround SLA", 10, 8, 5, 2, 0]
];

const ws3 = XLSX.utils.aoa_to_sheet(ws3_data);
ws3['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 45 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }];


// Sheet 4: 4_Objective_Metrics_Rules
const ws4_data = [
  ["Metric_Category", "Min_Value", "Max_Value", "Multiplier_Factor", "Benchmark_Description"],
  ["Student-Teacher Ratio (STR)", 0, 20, 1.05, "Optimal individual attention standard"],
  ["Student-Teacher Ratio (STR)", 20.01, 28, 1.00, "Standard operating ratio range"],
  ["Student-Teacher Ratio (STR)", 28.01, 35, 0.88, "Overcrowded classroom friction"],
  ["Student-Teacher Ratio (STR)", 35.01, 999, 0.75, "Severe classroom overload deficit"],
  ["Parent Response SLA (Hours)", 0, 12, 1.05, "Rapid response elite benchmark"],
  ["Parent Response SLA (Hours)", 12.01, 24, 1.00, "Standard acceptable SLA threshold"],
  ["Parent Response SLA (Hours)", 24.01, 48, 0.85, "Delayed communication friction"],
  ["Parent Response SLA (Hours)", 48.01, 999, 0.70, "Severe response breakdown penalty"],
  ["Teacher Retraining (Hrs/Yr)", 25, 999, 1.05, "Continuous professional development"],
  ["Teacher Retraining (Hrs/Yr)", 15, 24.99, 1.00, "Standard annual training credit"],
  ["Teacher Retraining (Hrs/Yr)", 0, 14.99, 0.85, "Stagnant pedagogy deficit"],
  ["Weekly Lesson Prep (Hrs/Wk)", 5, 999, 1.05, "Structured curriculum prep standard"],
  ["Weekly Lesson Prep (Hrs/Wk)", 3, 4.99, 1.00, "Standard lesson preparation"],
  ["Weekly Lesson Prep (Hrs/Wk)", 0, 2.99, 0.88, "Ad-hoc delivery penalty"]
];

const ws4 = XLSX.utils.aoa_to_sheet(ws4_data);
ws4['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 45 }];


// Sheet 5: 5_Engine_Calculations
const ws5_data = [
  ["DISHA BACKEND ENGINE CALCULATIONS", ""],
  ["", ""],
  ["--- STAGE 1: SUBJECTIVE BASELINE ---", ""],
  ["Penalty Q1", ""],
  ["Penalty Q2", ""],
  ["Penalty Q3", ""],
  ["Penalty Q4", ""],
  ["Penalty Q5", ""],
  ["Penalty Q6", ""],
  ["Average Risk Penalty", ""],
  ["Subjective Base Score (S_sub)", ""],
  ["", ""],
  ["--- STAGE 2: OBJECTIVE FACTOR ---", ""],
  ["STR Multiplier (m_STR)", ""],
  ["SLA Multiplier (m_SLA)", ""],
  ["Retraining Multiplier (m_retrain)", ""],
  ["Planning Multiplier (m_plan)", ""],
  ["Master Objective Factor (M_obj)", ""],
  ["", ""],
  ["--- STAGE 3: MISMATCH & DIVERGENCE ---", ""],
  ["Delusion Penalty (P_mismatch)", ""],
  ["Hard Operational Score Baseline", ""],
  ["FINAL HEALTH INDEX (H)", ""],
  ["Absolute Divergence", ""],
  ["RISK QUADRANT CLASSIFICATION", ""],
  ["EXECUTIVE ACTION RECOMMENDATION", ""]
];

const ws5 = XLSX.utils.aoa_to_sheet(ws5_data);

// Attach exact Excel formulas to Sheet 5
ws5['B4'] = { t: 'n', f: "INDEX('3_Screening_Questions'!D2:H2, 1, '1_Dashboard_Inputs'!B12)" };
ws5['B5'] = { t: 'n', f: "INDEX('3_Screening_Questions'!D3:H3, 1, '1_Dashboard_Inputs'!B13)" };
ws5['B6'] = { t: 'n', f: "INDEX('3_Screening_Questions'!D4:H4, 1, '1_Dashboard_Inputs'!B14)" };
ws5['B7'] = { t: 'n', f: "INDEX('3_Screening_Questions'!D5:H5, 1, '1_Dashboard_Inputs'!B15)" };
ws5['B8'] = { t: 'n', f: "INDEX('3_Screening_Questions'!D6:H6, 1, '1_Dashboard_Inputs'!B16)" };
ws5['B9'] = { t: 'n', f: "INDEX('3_Screening_Questions'!D7:H7, 1, '1_Dashboard_Inputs'!B17)" };

ws5['B10'] = { t: 'n', f: "AVERAGE(B4:B9)" };
ws5['B11'] = { t: 'n', f: "MAX(0, MIN(100, 100 - (B10 * 10)))" };

ws5['B14'] = { t: 'n', f: "IF('1_Dashboard_Inputs'!B20<=20, 1.05, IF('1_Dashboard_Inputs'!B20<=28, 1.00, IF('1_Dashboard_Inputs'!B20<=35, 0.88, 0.75)))" };
ws5['B15'] = { t: 'n', f: "IF('1_Dashboard_Inputs'!B21<=12, 1.05, IF('1_Dashboard_Inputs'!B21<=24, 1.00, IF('1_Dashboard_Inputs'!B21<=48, 0.85, 0.70)))" };
ws5['B16'] = { t: 'n', f: "IF('1_Dashboard_Inputs'!B22>=25, 1.05, IF('1_Dashboard_Inputs'!B22>=15, 1.00, 0.85))" };
ws5['B17'] = { t: 'n', f: "IF('1_Dashboard_Inputs'!B23>=5, 1.05, IF('1_Dashboard_Inputs'!B23>=3, 1.00, 0.88))" };
ws5['B18'] = { t: 'n', f: "B14 * B15 * B16 * B17" };

ws5['B21'] = { t: 'n', f: "IF(AND(B11>=80, B18<=0.85), 15, IF(AND(B11>=70, B18<=0.78), 10, 0))" };
ws5['B22'] = { t: 'n', f: "B18 * 100" };
ws5['B23'] = { t: 'n', f: "MAX(0, MIN(100, (B11 * B18) - B21))" };
ws5['B24'] = { t: 'n', f: "ABS(B11 - B22)" };
ws5['B25'] = { t: 's', f: "IF(AND(B11>=80, B18>=0.95), \"ELITE EQUILIBRIUM\", IF(AND(B11>=80, B18<0.85), \"DELUSIONAL COMFORT\", IF(AND(B11<60, B18>=0.95), \"HIDDEN EXCELLENCE\", \"CRITICAL OPERATIONAL COLLAPSE\")))" };
ws5['B26'] = { t: 's', f: "IF(B25=\"DELUSIONAL COMFORT\", \"CRITICAL MISMATCH: Management perception is disconnected from slow parent SLA (52 hrs). Enforce 24hr SLA immediately.\", IF(B25=\"CRITICAL OPERATIONAL COLLAPSE\", \"HIGH SYSTEMIC RISK: Unlock Step 3 14-Dimension Deep Dive immediately.\", \"Maintain operational standards and monitor metrics.\"))" };

ws5['!cols'] = [{ wch: 38 }, { wch: 75 }];

// Append sheets to workbook
XLSX.utils.book_append_sheet(wb, ws1, "1_Dashboard_Inputs");
XLSX.utils.book_append_sheet(wb, ws2, "2_Challenge_Catalog");
XLSX.utils.book_append_sheet(wb, ws3, "3_Screening_Questions");
XLSX.utils.book_append_sheet(wb, ws4, "4_Objective_Metrics_Rules");
XLSX.utils.book_append_sheet(wb, ws5, "5_Engine_Calculations");

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'Disha_First_Opinion_Engine.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`[Success] Workbook successfully generated at ${outputPath}`);
