const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.utils.book_new();

// Sheet 1: Dashboard_and_Results
const ws1_data = [
  ["DISHA 14-DIMENSION EWISR: MASTER DASHBOARD", "", "", ""],
  ["School Name", "Green Valley High", "", ""],
  ["Date of Audit", "2026-10-15", "", ""],
  ["", "", "", ""],
  ["--- FINAL DIAGNOSTIC READOUT ---", "", "", ""],
  ["Dimension", "Final Score (0-5)", "Status Classification", "Required Action"],
  ["D1. Curriculum Efficacy & Execution", {t:'n', f:"'Engine_Calculations'!F4"}, {t:'s', f:"'Engine_Calculations'!G4"}, {t:'s', f:"'Engine_Calculations'!H4"}],
  ["D2. Remedial Support & Inclusion", {t:'n', f:"'Engine_Calculations'!F5"}, {t:'s', f:"'Engine_Calculations'!G5"}, {t:'s', f:"'Engine_Calculations'!H5"}],
  ["D3. Assessment & Feedback Loop", {t:'n', f:"'Engine_Calculations'!F6"}, {t:'s', f:"'Engine_Calculations'!G6"}, {t:'s', f:"'Engine_Calculations'!H6"}],
  ["D4. Emotional & Psychological Safety", {t:'n', f:"'Engine_Calculations'!F7"}, {t:'s', f:"'Engine_Calculations'!G7"}, {t:'s', f:"'Engine_Calculations'!H7"}],
  ["D5. Disciplinary Ecosystem", {t:'n', f:"'Engine_Calculations'!F8"}, {t:'s', f:"'Engine_Calculations'!G8"}, {t:'s', f:"'Engine_Calculations'!H8"}],
  ["D6. Student Agency & Engagement", {t:'n', f:"'Engine_Calculations'!F9"}, {t:'s', f:"'Engine_Calculations'!G9"}, {t:'s', f:"'Engine_Calculations'!H9"}],
  ["D7. Workload & Burnout Index", {t:'n', f:"'Engine_Calculations'!F10"}, {t:'s', f:"'Engine_Calculations'!G10"}, {t:'s', f:"'Engine_Calculations'!H10"}],
  ["D8. Professional Growth & Autonomy", {t:'n', f:"'Engine_Calculations'!F11"}, {t:'s', f:"'Engine_Calculations'!G11"}, {t:'s', f:"'Engine_Calculations'!H11"}],
  ["D9. Leadership Support & Transparency", {t:'n', f:"'Engine_Calculations'!F12"}, {t:'s', f:"'Engine_Calculations'!G12"}, {t:'s', f:"'Engine_Calculations'!H12"}],
  ["D10. Communication Velocity & Clarity", {t:'n', f:"'Engine_Calculations'!F13"}, {t:'s', f:"'Engine_Calculations'!G13"}, {t:'s', f:"'Engine_Calculations'!H13"}],
  ["D11. Value Perception & ROI", {t:'n', f:"'Engine_Calculations'!F14"}, {t:'s', f:"'Engine_Calculations'!G14"}, {t:'s', f:"'Engine_Calculations'!H14"}],
  ["D12. Parent Engagement Depth", {t:'n', f:"'Engine_Calculations'!F15"}, {t:'s', f:"'Engine_Calculations'!G15"}, {t:'s', f:"'Engine_Calculations'!H15"}],
  ["D13. Infrastructure & Resource Adequacy", {t:'n', f:"'Engine_Calculations'!F16"}, {t:'s', f:"'Engine_Calculations'!G16"}, {t:'s', f:"'Engine_Calculations'!H16"}],
  ["D14. Financial & Compliance Governance", {t:'n', f:"'Engine_Calculations'!F17"}, {t:'s', f:"'Engine_Calculations'!G17"}, {t:'s', f:"'Engine_Calculations'!H17"}],
  ["", "", "", ""],
  ["OVERALL INSTITUTIONAL HEALTH INDEX", {t:'n', f:"AVERAGE(B7:B20)"}, "", ""]
];

const ws1 = XLSX.utils.aoa_to_sheet(ws1_data);
ws1['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 25 }, { wch: 50 }];


// Sheet 2: Stakeholder_Survey_Inputs
// Where raw data from stakeholders are entered (average scores 1-5)
const ws2_data = [
  ["STAKEHOLDER SURVEY RAW SCORES (1=High Risk, 5=Optimal)", "", "", "", ""],
  ["Dimension ID", "Dimension Name", "Management Score", "Teacher Score", "Parent Score", "Student Score"],
  ["D1", "Curriculum Efficacy & Execution", 4.5, 3.2, 4.0, 3.5],
  ["D2", "Remedial Support & Inclusion", 4.0, 2.5, 3.0, 2.8],
  ["D3", "Assessment & Feedback Loop", 4.8, 3.5, 3.2, 3.0],
  ["D4", "Emotional & Psychological Safety", 4.2, 4.0, 3.5, 2.5],
  ["D5", "Disciplinary Ecosystem", 4.5, 3.8, 3.5, 3.0],
  ["D6", "Student Agency & Engagement", 3.8, 3.0, 3.2, 2.0],
  ["D7", "Workload & Burnout Index", 4.8, 1.5, null, null],
  ["D8", "Professional Growth & Autonomy", 4.0, 2.2, null, null],
  ["D9", "Leadership Support & Transparency", 4.5, 2.0, null, null],
  ["D10", "Communication Velocity & Clarity", 4.5, 3.5, 2.2, null],
  ["D11", "Value Perception & ROI", 4.2, null, 3.0, null],
  ["D12", "Parent Engagement Depth", 4.0, 3.5, 2.5, null],
  ["D13", "Infrastructure & Resource Adequacy", 4.5, 3.0, 3.5, 3.2],
  ["D14", "Financial & Compliance Governance", 4.0, null, null, null]
];

const ws2 = XLSX.utils.aoa_to_sheet(ws2_data);
ws2['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];


// Sheet 3: Ext_Data_Crawling
// Web crawling, sentiment analysis, reviews
const ws3_data = [
  ["EXTERNAL DATA & CRAWLING SENTIMENT (1 to 5 scale)", "", ""],
  ["Source", "Data Point", "Converted Score (1-5)"],
  ["Google Reviews", "Average Rating (last 12 months)", 3.2],
  ["Social Media (Twitter/FB)", "Parent Sentiment Analysis Score", 2.8],
  ["Job Portals (Glassdoor)", "Teacher Satisfaction Rating", 1.9],
  ["Local Forum/Groups", "Discipline & Safety Mentions", 2.5]
];

const ws3 = XLSX.utils.aoa_to_sheet(ws3_data);
ws3['!cols'] = [{ wch: 25 }, { wch: 45 }, { wch: 25 }];


// Sheet 4: Engine_Calculations
// Triangulation formulas and divergence penalties
const ws4_data = [
  ["EWISR TRIANGULATION CALCULATIONS", "", "", "", "", "", "", ""],
  ["Dim ID", "Max Score", "Min Score", "Delta (Max-Min)", "Divergence Penalty (P_div)", "Final Dimension Health Score (H_n)", "Classification", "Recommendation"],
  // Row 4: D1
  ["D1", "", "", "", "", "", "", ""],
  ["D2", "", "", "", "", "", "", ""],
  ["D3", "", "", "", "", "", "", ""],
  ["D4", "", "", "", "", "", "", ""],
  ["D5", "", "", "", "", "", "", ""],
  ["D6", "", "", "", "", "", "", ""],
  ["D7", "", "", "", "", "", "", ""],
  ["D8", "", "", "", "", "", "", ""],
  ["D9", "", "", "", "", "", "", ""],
  ["D10", "", "", "", "", "", "", ""],
  ["D11", "", "", "", "", "", "", ""],
  ["D12", "", "", "", "", "", "", ""],
  ["D13", "", "", "", "", "", "", ""],
  ["D14", "", "", "", "", "", "", ""]
];

const ws4 = XLSX.utils.aoa_to_sheet(ws4_data);

for (let r = 4; r <= 17; r++) {
  // Max score across stakeholders
  ws4[`B${r}`] = { t: 'n', f: `MAX('Stakeholder_Survey_Inputs'!C${r-1}:F${r-1})` };
  // Min score across stakeholders
  ws4[`C${r}`] = { t: 'n', f: `MIN('Stakeholder_Survey_Inputs'!C${r-1}:F${r-1})` };
  // Delta
  ws4[`D${r}`] = { t: 'n', f: `B${r}-C${r}` };
  // Penalty: <1 = 0, >=1 and <2 = 0.5, >=2 = 1.5
  ws4[`E${r}`] = { t: 'n', f: `IF(D${r}>=2, 1.5, IF(D${r}>=1, 0.5, 0))` };
  // Final Score: Average of all non-empty stakeholders MINUS Penalty, Clamped to 0 min
  ws4[`F${r}`] = { t: 'n', f: `MAX(0, AVERAGE('Stakeholder_Survey_Inputs'!C${r-1}:F${r-1}) - E${r})` };
  
  // Classification
  ws4[`G${r}`] = { t: 's', f: `IF(F${r}>=4.2, "Elite Equilibrium", IF(F${r}>=3.2, "Operational Stable", IF(F${r}>=2.2, "Frictional Attrition", "Systemic Collapse")))` };
  // Recommendation
  ws4[`H${r}`] = { t: 's', f: `IF(F${r}>=4.2, "Sustain & Benchmark", IF(F${r}>=3.2, "Monitor & Tweak", IF(F${r}>=2.2, "Targeted Intervention Required", "Immediate Crisis Protocol!")))` };
}

ws4['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 25 }, { wch: 35 }, { wch: 25 }, { wch: 30 }];


// Sheet 5: Challenge_Mapping
// Maps the 14 dimensions to the overarching challenges
const ws5_data = [
  ["OVERARCHING CHALLENGE", "PRIMARY IMPACT DIMENSIONS", "SECONDARY IMPACT DIMENSIONS", "EXTERNAL DATA CONFIRMATION"],
  ["Teacher Attrition / Staff Turnover", "D7, D9", "D8", "Glassdoor Rating (Sheet 3)"],
  ["Enrollment Decline", "D11", "D10, D1", "Google Reviews Sentiment"],
  ["Parent Dissatisfaction", "D10, D12", "D5, D13", "Social Media Sentiment"],
  ["Academic Performance Drop", "D1, D3", "D2, D8", "Board Exam Results"],
  ["Student Stress & Discipline", "D4, D5", "D6, D2", "Local Forums"]
];

const ws5 = XLSX.utils.aoa_to_sheet(ws5_data);
ws5['!cols'] = [{ wch: 35 }, { wch: 30 }, { wch: 30 }, { wch: 30 }];


// Append sheets to workbook
XLSX.utils.book_append_sheet(wb, ws1, "Dashboard_and_Results");
XLSX.utils.book_append_sheet(wb, ws2, "Stakeholder_Survey_Inputs");
XLSX.utils.book_append_sheet(wb, ws3, "Ext_Data_Crawling");
XLSX.utils.book_append_sheet(wb, ws4, "Engine_Calculations");
XLSX.utils.book_append_sheet(wb, ws5, "Challenge_Mapping");

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'Disha_14D_EWISR_Master_Engine.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`[Success] Workbook successfully generated at ${outputPath}`);
