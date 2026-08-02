import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';

function generateWhitepaperPdf() {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Colors
  const primaryColor = '#1E3A8A'; // Deep Navy Blue
  const accentColor = '#0284C7'; // Sky Blue
  const textColor = '#1F2937'; // Dark Gray
  const lightBgColor = '#F3F4F6';

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      // Add running header / footer on new page
      doc.setFontSize(8);
      doc.setTextColor('#9CA3AF');
      doc.text('RYL NEUROACADEMY | DISHA Board Whitepaper', margin, 10);
      doc.setDrawColor('#E5E7EB');
      doc.line(margin, 12, pageWidth - margin, 12);

      // Footer
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 10, pageHeight - 10);
      y = 20;
    }
  };

  // COVER / TITLE HEADER BLOCK
  doc.setFillColor('#0F172A'); // Midnight Navy
  doc.rect(margin, y, contentWidth, 38, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RYL NEUROACADEMY', margin + 8, y + 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('STRATEGIC WHITEPAPER & BOARD PRESENTATION DOCUMENT', margin + 8, y + 19);

  doc.setFontSize(9);
  doc.setTextColor('#38BDF8');
  doc.text('DISHA: Diagnostic Inspection & Systemic Health Assessment Engine', margin + 8, y + 27);
  doc.text('Target Audience: RYL Board of Directors, School Trusts & Principals | Version 2.0', margin + 8, y + 33);

  y += 46;

  const addSectionTitle = (title: string) => {
    checkPageBreak(16);
    doc.setFillColor('#E0F2FE');
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor);
    doc.text(title, margin + 4, y + 5.5);
    y += 12;
  };

  const addSubSectionTitle = (title: string) => {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(accentColor);
    doc.text(title, margin, y);
    y += 6;
  };

  const addParagraph = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textColor);
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 4.5 + 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  };

  const addBullet = (boldPrefix: string, text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor);
    const prefixStr = `• ${boldPrefix}: `;
    const prefixWidth = doc.getTextWidth(prefixStr);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    const remainingWidth = contentWidth - prefixWidth - 4;
    const lines = doc.splitTextToSize(text, remainingWidth);

    checkPageBreak(lines.length * 4.2 + 2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text(prefixStr, margin + 2, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    if (lines.length > 0) {
      doc.text(lines[0], margin + 2 + prefixWidth, y);
      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], margin + 6, y + i * 4.2);
      }
    }
    y += lines.length * 4.2 + 2.5;
  };

  // 1. EXECUTIVE SUMMARY
  addSectionTitle('1. EXECUTIVE SUMMARY & CORE VISION');
  addParagraph(
    'DISHA (Diagnostic Inspection & Systemic Health Assessment) is a data-driven, clinical-grade school diagnostic platform engineered by RYL Neuroacademy. It transforms traditional, subjective school management into an evidence-based, SLA-driven operational ecosystem.'
  );
  addParagraph(
    'By synthesizing India’s two most authoritative educational frameworks—the EducationWorld India School Rankings (EWISR 14 Dimensions) and the National Education Policy (NEP 2020 / CBSE SQAAF)—DISHA provides school trusts, board members, and principals with a real-time 0–100 Institutional Health Index, automated root-cause triage, and operational treatment plans.'
  );

  addBullet('Evidence-Based Governance', 'Converts qualitative educational ideals into measurable daily operational SLAs.');
  addBullet('Stakeholder Perception Bridge', 'Aligns parent expectations, teacher workloads, and leadership vision.');
  addBullet('Risk Prevention Engine', 'Flags student dropouts, teacher attrition, and regulatory gaps before financial or reputational impact.');

  // 2. THE STRUCTURAL PROBLEM
  addSectionTitle('2. THE STRUCTURAL PROBLEM IN K-12 INSTITUTIONAL GOVERNANCE');
  addParagraph(
    'Most K-12 institutions operate under "Symptomatic Firefighting" rather than "Predictive Health Assessment". Common structural friction points include:'
  );
  addBullet('Subjective Decision-Making', 'School leadership relies on anecdotal feedback rather than quantifiable operational logs.');
  addBullet('The Parent Perception Gap', 'Schools invest in campus infrastructure, yet parents report low "Value for Money" due to unaddressed daily communication delays.');
  addBullet('NEP 2020 Compliance Lag', 'While NEP 2020 mandates 50 hours of Continuous Professional Development (CPD) per teacher annually, over 65% of schools lack tracking mechanisms.');
  addBullet('Undetected Student Attrition', 'High-risk dropouts and academic slippages are identified only AFTER parents submit TC applications, causing permanent fee loss.');

  // 3. THE FOUNDATIONAL STANDARDS
  addSectionTitle('3. FOUNDATIONAL STANDARDS: INTEGRATING EWISR & NEP 2020');
  addSubSectionTitle('3.1 The EWISR 14-Dimension Quality Framework (EducationWorld India School Rankings)');
  addParagraph(
    'Developed in partnership with C fore, EWISR assesses K-12 excellence across 14 holistic parameters: D01 Academic Reputation, D02 Teacher Welfare, D03 Leadership Quality, D04 Parent Engagement, D05 Student Safety & Wellness, D06 Infrastructure, D07 Co-Curricular, D08 Individual Attention (PTR), D09 Value for Money, D10 Special Needs Inclusivity, D11 Community Service, D12 Faculty Competence & Retention, D13 Internationalism, and D14 Management Vision.'
  );

  addSubSectionTitle('3.2 NEP 2020 Reform Pillars & CBSE SQAAF Standards');
  addParagraph(
    'NEP 2020 and CBSE’s School Quality Assessment & Accreditation Framework mandate mandatory teacher upskilling (50h CPD), competency-based assessments, early student retention, and transparent operational SLA auditing.'
  );

  // 4. DISHA DERIVED DIAGNOSTIC METHODOLOGY & APP FEATURE MAP
  addSectionTitle('4. DISHA DIAGNOSTIC METHODOLOGY & IN-APP FEATURE MAP');
  addBullet('First Opinion Diagnostic & Triage', 'Calculates 0-100 Health Score and maps operational evidence from raw school ledgers.');
  addBullet('14-Dimension Holistic Audit Engine', 'Benchmarks performance against national CBSE and EWISR peer standards across all 14 parameters.');
  addBullet('360° Perception Survey Module', 'Triangulates feedback across Parents, Teachers, Students, and Staff to locate perception gaps.');
  addBullet('Retention & Early Attrition Engine', 'Identifies chronic absenteeism and payment delays to flag HIGH or CRITICAL dropout risks.');
  addBullet('NEP 2020 Teacher CPD Tracker', 'Monitors teacher training hours against NEP 2020 50-hour mandates via Podar Innovation Lab workshops.');
  addBullet('Automated Treatment Plan Generator', 'Translates diagnostic gaps into prioritized Standard Operating Procedures (SOPs) with target deadlines.');

  // 5. REAL-WORLD PROBLEMS SOLVED & ROI FOR SCHOOLS
  addSectionTitle('5. REAL-WORLD PROBLEMS SOLVED & PRACTICAL ROI FOR SCHOOLS');
  addBullet('Revenue Protection & Zero Dropout Loss', 'Identifies at-risk students 60–90 days in advance, retaining 80%+ of vulnerable enrollments.');
  addBullet('EWISR Ranking Improvement', 'Systematically elevates weak dimension scores (e.g. Parent SLA, Teacher CPD), driving admissions growth.');
  addBullet('Automated CBSE SQAAF Readiness', 'Continuous digital logging makes the institution permanently inspection-ready without stress.');
  addBullet('70% Reduction in Parent Escalations', 'Strict SLA tracking (<4 hour response target) restores parent trust and perception of Value for Money.');

  // 6. BOARD RECOMMENDATION
  addSectionTitle('6. CONCLUSION & RYL NEUROACADEMY BOARD RECOMMENDATION');
  addParagraph(
    'DISHA provides RYL Neuroacademy and partner institutions with an unprecedented competitive advantage. By institutionalizing data-driven governance, DISHA transforms operational vulnerabilities into measurable strengths—ensuring academic rigor, regulatory compliance, parent trust, and sustained financial health.'
  );

  // Write file to public directory
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  const outputPath = path.join(publicDir, 'RYL_NEUROACADEMY_DISHA_Board_Whitepaper.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`PDF successfully generated at: ${outputPath}`);
}

generateWhitepaperPdf();
