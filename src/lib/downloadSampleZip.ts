import JSZip from 'jszip';

export const downloadTestingGuideTxt = () => {
  const guideText = `================================================================================
  PODAR INTERNATIONAL SCHOOL, RAIPUR (CBSE) - DISHA TESTING & DATASET GUIDE
================================================================================

WHERE & HOW TO USE EACH DATASET IN DISHA:

1. Dataset File Name: 01_Podar_Raipur_Operational_Ledger.csv
   Where to Upload in DISHA: Disha Checkup (Triage) Step 2 -> (Upload Supporting Data Document)
   What DISHA Analyzes & Displays: Calculates real-time 0–100 Overall Health Score, flags SLA response lags (e.g. parent inquiries), checks NEP 2020 teacher CPD hours, and detects remedial academic gaps.

2. Dataset File Name: 02_Podar_Raipur_14_Dimensions_Audit_Report.csv
   Where to Upload in DISHA: 14-Dimension Audit Section or Checkup Document Upload
   What DISHA Analyzes & Displays: Benchmarks Podar International School, Raipur against national EWISR / CBSE peer averages across all 14 core educational and governance dimensions.

3. Dataset File Name: 03_Podar_Raipur_360_Stakeholder_Feedback.csv
   Where to Upload in DISHA: 360° Perception Survey Module or Checkup Document Upload
   What DISHA Analyzes & Displays: Analyzes satisfaction scores and primary complaint areas from Parents (e.g. Parent App SLA), Teachers (administrative load), Students (lab access), and Staff.

4. Dataset File Name: 04_Podar_Raipur_Student_Absence_And_Risk_Logs.csv
   Where to Upload in DISHA: Retention & SLA Tracking or Checkup Document Upload
   What DISHA Analyzes & Displays: Identifies students with chronic absenteeism and fee delays to flag CRITICAL or HIGH dropout risks before mid-term.

5. Dataset File Name: 05_Podar_Raipur_Teacher_CPD_And_PIL_Training.csv
   Where to Upload in DISHA: NEP 2020 Teacher CPD Tracker or Checkup Document Upload
   What DISHA Analyzes & Displays: Evaluates faculty compliance against NEP 2020's mandatory 50-hour annual training requirement via Podar Innovation Lab (PIL) workshops.
================================================================================
`;

  const blob = new Blob([guideText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'DISHA_Podar_Raipur_Testing_Guide.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadSampleZip = async () => {
  try {
    const zip = new JSZip();

    // 1. Operational Ledger
    zip.file(
      '01_Podar_Raipur_Operational_Ledger.csv',
      `School_Name,Metric_Category,Metric_Name,Recorded_Value,Benchmark_Standard,Alert_Status,Notes
Podar International School Raipur,Operational_SLA,Parent_Query_Response_Time_Hours,24.5,4.0,CRITICAL_LAG,Podar Parent Portal inquiry response time needs automated escalation
Podar International School Raipur,Teacher_Development,Annual_CPD_Training_Hours_Per_Teacher,32.0,50.0,BELOW_NEP2020_BENCHMARK,Podar Innovation Lab (PIL) pedagogical workshops training compliance
Podar International School Raipur,Academic_Remedial,Students_Covered_In_Remedial_Program_Pct,45.0,85.0,MODERATE_GAP,Identified learning gaps from CBSE Term 1 assessment
Podar International School Raipur,Student_Retention,Unexcused_Absence_Rate_Pct,11.8,5.0,HIGH_RISK_FLAG,Early indicator for mid-term student dropouts in Raipur campus`
    );

    // 2. 14 Dimensions Audit
    zip.file(
      '02_Podar_Raipur_14_Dimensions_Audit_Report.csv',
      `Dimension_ID,Dimension_Name,Current_Score_Out_Of_100,Peer_Benchmark_Avg,Risk_Level,Recommended_Action
D01,Academic_Reputation_Rigour,82,85,Low,Strengthen CBSE Board exam prep with Podar Innovation Lab question banks
D02,Teacher_Welfare_Development,68,78,Medium,Increase mandatory PIL CPD workshops to meet NEP 2020 50-hour standard
D03,Leadership_Governance_Quality,76,80,Low,Weekly SLA monitoring for administrative heads
D04,Parent_Engagement_SLA,52,82,Critical,Upgrade Podar Parent App notification speed and ticket response
D05,Student_Safety_Wellness,91,88,Healthy,Robust CCTV, campus security, and counselor support in Raipur
D06,Infrastructure_Facilities,86,85,Healthy,Modern STEM labs, digital smart classrooms, and sports facilities
D07,CoCurricular_Education,84,80,Healthy,Active Podar World School sports, robotics, and debate clubs
D08,Individual_Attention_Ratio,65,78,Medium,Reduce student-teacher ratio in Grade 8-10 CBSE sections
D09,Value_For_Money_Parents,62,75,High,Improve transparency on fee breakdowns and parent communication
D10,Inclusive_Special_Needs,72,74,Low,Appoint additional certified special educator for learning support
D11,Community_Service_Social,88,82,Healthy,Promote student eco-clubs and Raipur community outreach
D12,Faculty_Competence_Retain,70,76,Medium,Establish performance incentives and professional growth tracks
D13,Internationalism_Culture,75,75,Low,Expand global exchange and inter-school collaborative events
D14,Management_Vision_Growth,84,82,Healthy,Strong Podar Education Network central management support`
    );

    // 3. Stakeholder Feedback
    zip.file(
      '03_Podar_Raipur_360_Stakeholder_Feedback.csv',
      `Stakeholder_Group,Respondent_Role,Satisfaction_Score_Out_Of_10,Primary_Complaint_Area,Key_Suggestion
Parent,Grade_7_CBSE_Parent,5.2,Parent_App_Communication,Faster responses on fee receipts & transport route updates
Teacher,Secondary_Science_Teacher,6.5,Non_Teaching_Admin_Tasks,Streamline digital attendance and lesson plan filing
Student,Grade_10_CBSE_Student,8.6,Sports_And_Lab_Access,Extend timing for robotics lab and outdoor sports grounds
Staff,Admin_Office_Raipur,6.2,Fee_Followup_Process,Automate SMS and WhatsApp reminders for overdue fees`
    );

    // 4. Student Dropout & Absence Logs
    zip.file(
      '04_Podar_Raipur_Student_Absence_And_Risk_Logs.csv',
      `Student_ID,Class_Section,Consecutive_Unexcused_Days,Fee_Due_Months,Academic_Performance_Band,Dropout_Risk_Level
PODAR_RP_102,Grade_9_A,9,2,Below_Average,HIGH
PODAR_RP_205,Grade_10_B,14,3,Average,CRITICAL
PODAR_RP_312,Grade_7_C,4,1,Above_Average,MODERATE
PODAR_RP_408,Grade_11_Science,1,0,Excellent,LOW`
    );

    // 5. Teacher CPD Training Records
    zip.file(
      '05_Podar_Raipur_Teacher_CPD_And_PIL_Training.csv',
      `Teacher_ID,Department,Annual_CPD_Hours_Completed,NEP2020_Mandate_50h_Status,Last_Podar_Innovation_Lab_Workshop
P_TCH_101,Mathematics,28,NON_COMPLIANT,Podar Math Pedagogy & Problem Solving (14h)
P_TCH_102,Science,46,NEAR_COMPLIANT,CBSE Science Experiential Learning (22h)
P_TCH_103,English,52,FULL_COMPLIANT,Podar Innovation Lab Digital Pedagogy (30h)
P_TCH_104,Social_Studies,20,NON_COMPLIANT,Interactive History & Civics Teaching (10h)`
    );

    // 6. README Guide
    zip.file(
      'README_Podar_Raipur_Sample_Datasets_Guide.txt',
      `========================================================================
    PODAR INTERNATIONAL SCHOOL, RAIPUR (CBSE) - DISHA SAMPLE DATASETS
========================================================================

These pre-formatted sample CSV datasets are created specifically for testing 
DISHA with Podar International School, Raipur parameters!

FILES INCLUDED IN THIS PACKAGE:
------------------------------------------------------------------------
1. 01_Podar_Raipur_Operational_Ledger.csv
   -> Upload in DISHA First Opinion Diagnostic -> Document Upload Step.
   -> Tests parent inquiry SLAs, NEP 2020 teacher CPD hours, and student attendance.

2. 02_Podar_Raipur_14_Dimensions_Audit_Report.csv
   -> Benchmarks Podar International School, Raipur against CBSE and national EWISR standards across 14 dimensions.

3. 03_Podar_Raipur_360_Stakeholder_Feedback.csv
   -> 360-degree survey data from Raipur Parents, Teachers, Students, and Staff.

4. 04_Podar_Raipur_Student_Absence_And_Risk_Logs.csv
   -> Attendance tracking and dropout risk identification log.

5. 05_Podar_Raipur_Teacher_CPD_And_PIL_Training.csv
   -> Podar Innovation Lab (PIL) teacher training compliance log against NEP 2020 mandates.

HOW TO TEST IN DISHA:
1. Copy or download these dataset CSV files.
2. Open DISHA Checkup / Triage, select your diagnostic symptoms, and click "Upload Supporting Data Document".
3. DISHA will analyze Podar Raipur's metrics and generate your tailored School Health Diagnostic Report!
`
    );

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Podar_International_School_Raipur_Sample_Datasets.zip');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error generating zip bundle:', err);
  }
};

export const downloadAllSampleDataAsZIP = downloadSampleZip;


