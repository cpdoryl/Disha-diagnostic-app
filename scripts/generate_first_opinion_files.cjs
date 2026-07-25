const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. disha_first_opinion_dashboard.csv
const dashboardCsv = `SECTION,FIELD,VALUE,NOTES
Management Info,School Name,Acme High School,Enter school name
Management Info,Date of Assessment,2026-10-15,YYYY-MM-DD
Subjective Input,Q1: Which operational issue currently causes the most friction?,2,1-5 scale (1=Worst)
Subjective Input,Q2: How frequent are parent complaints?,3,1-5 scale
Subjective Input,Q3: How would you rate teacher morale?,4,1-5 scale
Subjective Input,Q4: Rate curriculum execution consistency.,3,1-5 scale
Subjective Input,Q5: How effective is your disciplinary system?,4,1-5 scale
Subjective Input,Q6: Rate financial stability perception.,5,1-5 scale
Objective Metric,Average Student-Teacher Ratio (STR),25,Target: <=20
Objective Metric,Parent Query SLA (Hours),24,Target: <=12
Objective Metric,Teacher Retraining (Hours/Year),20,Target: >=25
Objective Metric,Lesson Planning Time (Hours/Week),4,Target: >=5
`;
fs.writeFileSync(path.join(publicDir, 'disha_first_opinion_dashboard.csv'), dashboardCsv);

// 2. disha_challenge_catalog.csv
const challengeCsv = `CHALLENGE_ID,CHALLENGE_NAME,PRIMARY_DIMENSIONS,SECONDARY_DIMENSIONS,SYMPTOMS,RECOMMENDED_ACTION
C01,Teacher Attrition / Staff Turnover,"D7, D9",D8,"High turnover, complaints about workload","Conduct workload audit, improve leadership support channels"
C02,Enrollment Decline,D11,"D10, D1","Fewer admissions, negative word-of-mouth","Enhance value proposition communication, curriculum review"
C03,Parent Dissatisfaction,"D10, D12","D5, D13","Frequent complaints, slow SLA response","Implement 24hr SLA for parent queries, open feedback loops"
C04,Academic Performance Drop,"D1, D3","D2, D8","Lower test scores, poor lesson planning","Increase lesson planning time, implement formative assessments"
C05,Student Stress & Discipline,"D4, D5","D6, D2","Bullying reports, high disciplinary actions","Shift to restorative discipline, increase counseling"
`;
fs.writeFileSync(path.join(publicDir, 'disha_challenge_catalog.csv'), challengeCsv);

// 3. disha_screening_questions.csv
const screeningCsv = `Q_ID,QUESTION,RATING_1_PENALTY,RATING_2_PENALTY,RATING_3_PENALTY,RATING_4_PENALTY,RATING_5_PENALTY
Q1,Which operational issue currently causes the most friction?,10,8,4,2,0
Q2,How frequent are parent complaints?,10,8,4,2,0
Q3,How would you rate teacher morale?,10,8,4,2,0
Q4,Rate curriculum execution consistency.,10,8,4,2,0
Q5,How effective is your disciplinary system?,10,8,4,2,0
Q6,Rate financial stability perception.,10,8,4,2,0
`;
fs.writeFileSync(path.join(publicDir, 'disha_screening_questions.csv'), screeningCsv);

// 4. disha_objective_metrics_rules.csv
const objectiveCsv = `METRIC_ID,METRIC_NAME,RANGE_MIN,RANGE_MAX,MULTIPLIER,NOTES
M01,Student-Teacher Ratio (STR),0,20,1.05,Optimal
M01,Student-Teacher Ratio (STR),20.01,28,1.00,Standard
M01,Student-Teacher Ratio (STR),28.01,35,0.88,Frictional
M01,Student-Teacher Ratio (STR),35.01,999,0.75,Critical
M02,Parent SLA (Hours),0,12,1.05,Optimal
M02,Parent SLA (Hours),12.01,24,1.00,Standard
M02,Parent SLA (Hours),24.01,48,0.85,Frictional
M02,Parent SLA (Hours),48.01,999,0.70,Critical
M03,Teacher Retraining (Hrs/Yr),25,999,1.05,Optimal
M03,Teacher Retraining (Hrs/Yr),15,24.99,1.00,Standard
M03,Teacher Retraining (Hrs/Yr),0,14.99,0.85,Frictional
M04,Lesson Planning (Hrs/Wk),5,999,1.05,Optimal
M04,Lesson Planning (Hrs/Wk),3,4.99,1.00,Standard
M04,Lesson Planning (Hrs/Wk),0,2.99,0.88,Frictional
`;
fs.writeFileSync(path.join(publicDir, 'disha_objective_metrics_rules.csv'), objectiveCsv);

// 5. disha_engine_calculations.csv
const calcCsv = `CALCULATION_STEP,DESCRIPTION,FORMULA / METHOD,EXAMPLE_VALUE
Step 1: Subjective Baseline,Calculate average risk penalty from Q1-Q6,"Avg(Q1_Penalty ... Q6_Penalty)",5.33
Step 1: Subjective Baseline,Calculate Unclamped Subjective Score,"100 - (Avg_Penalty * 10)",46.7
Step 1: Subjective Baseline,Calculate Subjective Base Score (S_sub),"MAX(0, MIN(100, Unclamped_Score))",46.7
Step 2: Objective Factor,Master Objective Factor (M_obj),"m_STR * m_SLA * m_retrain * m_plan",0.88
Step 3: Mismatch & Divergence,Delusion Penalty (P_mismatch),"IF(S_sub>=80 AND M_obj<=0.85, 15, IF(...))",0
Step 3: Mismatch & Divergence,Unclamped Health Index,"(S_sub * M_obj) - P_mismatch",41.09
Step 3: Mismatch & Divergence,FINAL HEALTH INDEX (H),"MAX(0, MIN(100, Unclamped_Health_Index))",41.09
Step 3: Mismatch & Divergence,Hard Operational Score Baseline,"M_obj * 100",88.00
Step 3: Mismatch & Divergence,Absolute Divergence,"ABS(S_sub - Hard_Operational_Score)",41.3
`;
fs.writeFileSync(path.join(publicDir, 'disha_engine_calculations.csv'), calcCsv);

// 6. Disha_First_Opinion_Engine.xlsx
const wb = XLSX.utils.book_new();

// Sheet 1: Dashboard_Inputs
const ws1_data = [
  ["DISHA FIRST OPINION ENGINE: MASTER DASHBOARD"],
  [],
  ["--- MANAGEMENT INFO ---"],
  ["School Name", "Acme High School"],
  ["Date", "2026-10-15"],
  [],
  ["--- SUBJECTIVE INPUTS (1=Worst, 5=Best) ---"],
  ["Q1: Operational friction", 2],
  ["Q2: Parent complaints", 3],
  ["Q3: Teacher morale", 4],
  ["Q4: Curriculum execution", 3],
  ["Q5: Disciplinary system", 4],
  ["Q6: Financial stability", 5],
  [],
  ["--- OBJECTIVE METRICS ---"],
  ["Average Student-Teacher Ratio (STR)", 25],
  ["Parent Query SLA (Hours)", 24],
  ["Teacher Retraining (Hours/Year)", 20],
  ["Lesson Planning Time (Hours/Week)", 4],
];
const ws1 = XLSX.utils.aoa_to_sheet(ws1_data);
ws1['!cols'] = [{wch:40}, {wch:20}];
XLSX.utils.book_append_sheet(wb, ws1, "1_Dashboard_Inputs");

// Sheet 2: Screening_Questions
const ws2_data = [
  ["Q_ID", "Question", "Rating 1 Penalty", "Rating 2 Penalty", "Rating 3 Penalty", "Rating 4 Penalty", "Rating 5 Penalty"],
  ["Q1", "Operational friction", 10, 8, 4, 2, 0],
  ["Q2", "Parent complaints", 10, 8, 4, 2, 0],
  ["Q3", "Teacher morale", 10, 8, 4, 2, 0],
  ["Q4", "Curriculum execution", 10, 8, 4, 2, 0],
  ["Q5", "Disciplinary system", 10, 8, 4, 2, 0],
  ["Q6", "Financial stability", 10, 8, 4, 2, 0]
];
const ws2 = XLSX.utils.aoa_to_sheet(ws2_data);
XLSX.utils.book_append_sheet(wb, ws2, "3_Screening_Questions"); // named 3_Screening_Questions as referenced in formula

// Sheet 3: Engine_Calculations
const ws3_data = [
  ["DISHA BACKEND ENGINE CALCULATIONS"],
  [],
  ["--- STAGE 1: SUBJECTIVE BASELINE ---"],
  ["Avg Penalty", {t:'n', f:"AVERAGE(INDEX('3_Screening_Questions'!C2:G2, 1, '1_Dashboard_Inputs'!B8), INDEX('3_Screening_Questions'!C3:G3, 1, '1_Dashboard_Inputs'!B9), INDEX('3_Screening_Questions'!C4:G4, 1, '1_Dashboard_Inputs'!B10), INDEX('3_Screening_Questions'!C5:G5, 1, '1_Dashboard_Inputs'!B11), INDEX('3_Screening_Questions'!C6:G6, 1, '1_Dashboard_Inputs'!B12), INDEX('3_Screening_Questions'!C7:G7, 1, '1_Dashboard_Inputs'!B13))"}],
  ["Subjective Base Score (S_sub)", {t:'n', f:"MAX(0, MIN(100, 100 - (B4 * 10)))"}],
  [],
  ["--- STAGE 2: OBJECTIVE FACTOR ---"],
  ["STR Multiplier (m_STR)", {t:'n', f:"IF('1_Dashboard_Inputs'!B16<=20, 1.05, IF('1_Dashboard_Inputs'!B16<=28, 1.00, IF('1_Dashboard_Inputs'!B16<=35, 0.88, 0.75)))"}],
  ["SLA Multiplier (m_SLA)", {t:'n', f:"IF('1_Dashboard_Inputs'!B17<=12, 1.05, IF('1_Dashboard_Inputs'!B17<=24, 1.00, IF('1_Dashboard_Inputs'!B17<=48, 0.85, 0.70)))"}],
  ["Retraining Multiplier (m_retrain)", {t:'n', f:"IF('1_Dashboard_Inputs'!B18>=25, 1.05, IF('1_Dashboard_Inputs'!B18>=15, 1.00, 0.85))"}],
  ["Planning Multiplier (m_plan)", {t:'n', f:"IF('1_Dashboard_Inputs'!B19>=5, 1.05, IF('1_Dashboard_Inputs'!B19>=3, 1.00, 0.88))"}],
  ["Master Objective Factor (M_obj)", {t:'n', f:"B8 * B9 * B10 * B11"}],
  [],
  ["--- STAGE 3: MISMATCH & DIVERGENCE ---"],
  ["Delusion Penalty (P_mismatch)", {t:'n', f:"IF(AND(B5>=80, B12<=0.85), 15, IF(AND(B5>=70, B12<=0.78), 10, 0))"}],
  ["FINAL HEALTH INDEX (H)", {t:'n', f:"MAX(0, MIN(100, (B5 * B12) - B15))"}],
  ["Hard Operational Score Baseline", {t:'n', f:"B12 * 100"}],
  ["Absolute Divergence", {t:'n', f:"ABS(B5 - B17)"}],
  [],
  ["RISK QUADRANT CLASSIFICATION", {t:'s', f:"IF(AND(B5>=80, B12>=0.95), \"ELITE EQUILIBRIUM\", IF(AND(B5>=80, B12<0.85), \"DELUSIONAL COMFORT\", IF(AND(B5<60, B12>=0.95), \"HIDDEN EXCELLENCE\", \"CRITICAL OPERATIONAL COLLAPSE\")))"}]
];
const ws3 = XLSX.utils.aoa_to_sheet(ws3_data);
ws3['!cols'] = [{wch:40}, {wch:25}];
XLSX.utils.book_append_sheet(wb, ws3, "5_Engine_Calculations");

const outputPath = path.join(publicDir, 'Disha_First_Opinion_Engine.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`[Success] Generated files in public directory`);
