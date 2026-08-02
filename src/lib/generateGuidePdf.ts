import { jsPDF } from 'jspdf';

export const generateUserGuidePDF = (schoolName?: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryNavy = [30, 41, 59];    // slate-800 (#1e293b)
  const brandBlue = [37, 99, 235];     // blue-600 (#2563eb)
  const accentTeal = [14, 165, 233];   // sky-500 (#0ea5e9)
  const darkText = [15, 23, 42];       // slate-900 (#0f172a)
  const bodyText = [51, 65, 85];       // slate-700 (#334155)
  const mutedText = [100, 116, 139];   // slate-500 (#64748b)
  const lightBg = [248, 250, 252];     // slate-50 (#f8fafc)
  const cardBorder = [226, 232, 240];  // slate-200 (#e2e8f0)

  let y = 15;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 275) {
      doc.addPage();
      y = 18;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.rect(0, 0, 210, 14, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('DISHA DIAGNOSTIC FRAMEWORK — STANDARD INSTITUTIONAL USER MANUAL', 14, 9.5);

    if (schoolName) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Active School: ${schoolName}`, 140, 9.5);
    }
  };

  // --- COVER BANNER ---
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.rect(0, 32, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DISHA DIAGNOSTIC FRAMEWORK', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Standard Institutional User Manual & Technical Operating Guide', 14, 22);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('A Data-Driven Diagnostic System for K-12 School Governance & Operational Transformation', 14, 28);

  y = 40;

  const addMainHeading = (title: string) => {
    checkPageBreak(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.text(title, 14, y);
    y += 2.5;

    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.4);
    doc.line(14, y, 196, y);
    y += 5;
  };

  const addSubHeading = (title: string) => {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(title, 14, y);
    y += 5;
  };

  const addParagraph = (text: string, boldPrefix?: string) => {
    doc.setFontSize(9);
    doc.setTextColor(bodyText[0], bodyText[1], bodyText[2]);

    let startX = 14;
    if (boldPrefix) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(boldPrefix, startX, y);
      startX += doc.getTextWidth(boldPrefix) + 1.5;
    }

    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, 196 - startX);
    checkPageBreak(lines.length * 4 + 3);

    doc.text(lines, startX, y);
    y += lines.length * 4 + 3;
  };

  const addInfoBox = (title: string, items: string[]) => {
    const boxWidth = 182;
    let contentHeight = 8;
    
    // Estimate height
    items.forEach(item => {
      const lines = doc.splitTextToSize(item, boxWidth - 10);
      contentHeight += lines.length * 4 + 2;
    });

    checkPageBreak(contentHeight + 6);

    // Box background
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, boxWidth, contentHeight, 2, 2, 'FD');

    // Title inside box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.text(title, 18, y + 5.5);

    let innerY = y + 10;
    items.forEach(item => {
      doc.setFillColor(accentTeal[0], accentTeal[1], accentTeal[2]);
      doc.circle(20, innerY - 1, 0.8, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(bodyText[0], bodyText[1], bodyText[2]);

      const lines = doc.splitTextToSize(item, boxWidth - 12);
      doc.text(lines, 23, innerY);
      innerY += lines.length * 4 + 2;
    });

    y += contentHeight + 5;
  };

  const addStepGuide = (steps: { name: string; desc: string }[]) => {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Step-by-Step Execution Guide:', 14, y);
    y += 5;

    steps.forEach((step, idx) => {
      const stepTitle = `Step ${idx + 1}: ${step.name}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);

      const titleWidth = doc.getTextWidth(stepTitle + ' - ');
      checkPageBreak(8);

      doc.text(stepTitle + ' - ', 16, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(bodyText[0], bodyText[1], bodyText[2]);

      const lines = doc.splitTextToSize(step.desc, 196 - (16 + titleWidth));
      if (lines.length > 0) {
        doc.text(lines[0], 16 + titleWidth, y);
        if (lines.length > 1) {
          y += 4;
          const remaining = lines.slice(1);
          doc.text(remaining, 16, y);
          y += (remaining.length - 1) * 4;
        }
      }
      y += 5;
    });
    y += 2;
  };

  // ==================== SECTION 1: INTRODUCTION ====================
  addMainHeading('1. Executive Introduction & Institutional Value Proposition');

  addParagraph(
    'The DISHA Diagnostic Framework is an advanced institutional evaluation and decision-support platform designed for K-12 school leadership, board trustees, and educators. It unifies voices across Leaders, Educators, Parents, and Students into an objective 14-dimension diagnostic engine.',
    'What is DISHA?'
  );

  addParagraph(
    'Traditional school evaluation relies heavily on anecdotal reviews. DISHA introduces structured quantitative benchmarking, gap variance analysis, and predictive strategy simulation to replace guesswork with evidence-based governance.',
    'How DISHA Helps Schools:'
  );

  addInfoBox('Deployment Roadmap & Onboarding Guide for Institutions', [
    'Phase 1 (Setup): Register official school credentials (Board, Location, Email) in the Context Switcher.',
    'Phase 2 (Capture): Dispatch Express or Deep-Dive diagnostic surveys to Leaders, Educators, Parents, and Students.',
    'Phase 3 (Benchmark): Analyze real-time participation rates and compare scores against CBSE/ICSE/National baselines.',
    'Phase 4 (Strategize): Use predictive simulation models to project 12–36 month growth curves and justify capital allocation.'
  ]);

  addParagraph(
    '1) Objective accreditation readiness (CBSE/ICSE/IB), 2) Data-driven governance for board reporting, 3) Early identification of student well-being and safety risks, 4) Optimized investment ROI by targeting critical deficit areas, 5) Complete DPDP compliance.',
    'Institutional Value Addition:'
  );

  y += 4;

  // ==================== SECTION 2: SCHOOL AUTH ====================
  addMainHeading('2. Exclusive School Authentication & Context Switcher');
  addParagraph('Guarantees strict institutional data isolation. All survey responses, student records, diagnostic scores, and database queries are attached exclusively to the logged-in institution profile.', 'Purpose:');

  addInfoBox('Required Data & Input Parameters', [
    'Official School Name: Full registered institutional name (e.g., Delhi Public School, Vasant Kunj).',
    'Board Affiliation: Select CBSE, ICSE, IB, State Board, International, or Other.',
    'City / Location: Primary city/district location of the school campus.',
    'Principal / Administrator Email: Official contact email address for administrative verification.'
  ]);

  addStepGuide([
    { name: 'Access Switcher', desc: 'Click on the School Profile Badge in the top navigation bar.' },
    { name: 'Enter School Metadata', desc: 'Click "Register New Institution" and fill in Official Name, Board Affiliation, City, and Email.' },
    { name: 'Confirm Active Context', desc: 'Click "Set as Active School". All app views will dynamically reload data strictly for this school.' }
  ]);

  // ==================== SECTION 3: DASHBOARD ====================
  addMainHeading('3. Dashboard & Annual Health Checkup');
  addParagraph('The central executive control panel presenting the school\'s overall health index (0-100), radar dimension breakdown, and flagged challenge domains.', 'Purpose:');

  addInfoBox('Required Data & Input Parameters', [
    'Active School Context (automatically inherited from Context Switcher).',
    'Optional Board Baseline Filter (CBSE / ICSE / IB / National) to adjust comparative metrics.'
  ]);

  addStepGuide([
    { name: 'Review Health Score', desc: 'Examine the overall institutional score badge (e.g., 78/100) and risk level status.' },
    { name: 'Analyze Dimension Radar', desc: 'Inspect the 14-dimension visual plot to evaluate balance across leadership, climate, and academics.' },
    { name: 'Trigger Disha Checkup', desc: 'Click "Launch Disha Checkup" to execute a rapid annual diagnostic health audit.' }
  ]);

  // ==================== SECTION 4: STAGE 1 CAPTURE ====================
  addMainHeading('4. Stage 1: Capture (Assess - 14 Diagnostic Dimensions)');
  addParagraph('Captures multi-stakeholder feedback across 14 core institutional dimensions using Express (5 Qs) and Deep-Dive (Full) assessment workflows.', 'Purpose:');

  addInfoBox('14 Diagnostic Dimensions & Required Fields', [
    'Dimensions: 1. Vision & Governance, 2. Curriculum, 3. Digital EdTech, 4. Culture & Safety, 5. CPD Training, 6. Inclusion & SEN, 7. Parent Engagement, 8. Student Well-being, 9. Academic Telemetry, 10. Operations & Hygiene, 11. Financial Sustainability, 12. Green Campus, 13. 21st Century Skills, 14. DPDP Privacy.',
    'Required Inputs: Stakeholder Role (Leader, Educator, Parent, Student), Class/Grade Level, Section/Department, 1-5 Likert Scores, Qualitative Comments, and DPDP Consent Checkbox.'
  ]);

  addStepGuide([
    { name: 'Open Capture Module', desc: 'Navigate to "Stage 1: Capture" from the main menu.' },
    { name: 'Launch Assessment Modal', desc: 'Click "Launch Stakeholder Assessment" and choose Express or Deep-Dive mode.' },
    { name: 'Input Metadata & Ratings', desc: 'Select Role, Class/Grade, and Section. Provide 1-5 Likert ratings across all prompts.' },
    { name: 'Submit with DPDP Consent', desc: 'Accept the DPDP compliance checkbox and click "Submit Assessment". Data updates instantly in cloud database.' }
  ]);

  // ==================== SECTION 5: STAGE 2 COMPARE ====================
  addMainHeading('5. Stage 2: Compare (Diagnose & Benchmark)');
  addParagraph('Pinpoints institutional strengths and deficit zones by benchmarking school scores against board baselines and national benchmarks.', 'Purpose:');

  addInfoBox('Required Data & Input Parameters', [
    'Target Comparison Baseline: Choose National Average, CBSE Baseline, ICSE Baseline, or IB Benchmark.'
  ]);

  addStepGuide([
    { name: 'Access Compare Module', desc: 'Click "Stage 2: Compare" in the sidebar menu.' },
    { name: 'Select Reference Baseline', desc: 'Use the dropdown filter to switch comparison targets (e.g., CBSE National Baseline).' },
    { name: 'Inspect Variance Matrix', desc: 'Analyze positive highlights (+1.2 variance) and vulnerability zones (-0.8 deficit).' },
    { name: 'Review Stakeholder Divergence', desc: 'Examine consensus charts to detect perception gaps between teachers, parents, and students.' }
  ]);

  // ==================== SECTION 6: STAGE 3 SIMULATE ====================
  addMainHeading('6. Stage 3: Simulate (Model & Strategize)');
  addParagraph('Enables school leaders to model predictive improvement trajectories and evaluate intervention feasibility prior to capital deployment.', 'Purpose:');

  addInfoBox('Required Data & Input Parameters', [
    'Target Diagnostic Domain: Select the dimension to optimize (e.g., Digital Infrastructure).',
    'Resource / Effort Allocation Slider: Set allocation percentage (0% to 100%).',
    'Time Horizon: Select projection duration (12, 24, or 36 months).'
  ]);

  addStepGuide([
    { name: 'Access Simulate Module', desc: 'Select "Stage 3: Simulate" from the navigation menu.' },
    { name: 'Choose Target Domain', desc: 'Select the focus area requiring intervention from the domain selector.' },
    { name: 'Adjust Allocation Sliders', desc: 'Drag the capital/effort allocation control slider to simulate resource deployment.' },
    { name: 'Evaluate Feasibility & Trajectory', desc: 'Observe projected score gains (+0.9) and review the algorithmic feasibility rating.' }
  ]);

  // ==================== SECTION 7: MONITORING ====================
  addMainHeading('7. Ongoing Monitoring & Privacy Telemetry');
  addParagraph('Provides real-time feedback on survey submission velocity, stakeholder representation ratios, and legal privacy consent compliance.', 'Purpose:');

  addInfoBox('Required Data & Input Parameters', [
    'Stakeholder Role Filter (Leaders, Teachers, Parents, Students) & Date Range Selection.'
  ]);

  addStepGuide([
    { name: 'Open Monitoring', desc: 'Click "Monitoring" in the left drawer.' },
    { name: 'Track Submission Velocity', desc: 'Monitor daily response rate graphs and total participation counters.' },
    { name: 'Audit Privacy Consent Logs', desc: 'Verify 100% DPDP consent acceptance timestamps for compliance audits.' }
  ]);

  // ==================== SECTION 8: DATA HUB ====================
  addMainHeading('8. Data Retrieval, Live Search & 1-Click Export Hub');
  addParagraph('Provides school leaders with instant search, multi-field filtering, and download capabilities for all stakeholder survey records.', 'Purpose:');

  addInfoBox('Required Data & Export Options', [
    'Search Keyword: Filter by Respondent Name, Phone, Email, Grade, Section, City, or Comment keyword.',
    'Export Option 1 (Export Selection CSV): Downloads spreadsheet containing visible filtered subset.',
    'Export Option 2 (Master School CSV): Downloads complete UTF-8 database for the institution.',
    'Export Option 3 (JSON Backup): Downloads structured raw JSON snapshot for cloud archives/MIS.'
  ]);

  addStepGuide([
    { name: 'Access Data Hub', desc: 'Navigate to the Data Hub section on the Dashboard or Monitoring page.' },
    { name: 'Apply Search & Filters', desc: 'Type search terms in the search bar or click stakeholder tabs (Parents, Staff, Students).' },
    { name: 'Trigger Download', desc: 'Click "Export Selection CSV", "Master School CSV", or "JSON Backup" to download files.' }
  ]);

  // ==================== SECTION 9: SAATHI AI ====================
  addMainHeading('9. Saathi AI Strategic Advisor');
  addParagraph('An integrated AI assistant trained on DISHA frameworks and educational policy guidelines to provide tailored strategic advice to school principals and administrators.', 'Purpose:');

  addInfoBox('Required Data & Input Parameters', [
    'Natural Language Query / Prompt regarding diagnostic scores, gap analysis, or policy implementation.'
  ]);

  addStepGuide([
    { name: 'Open Saathi Advisor', desc: 'Click the floating Saathi Chatbot icon in the bottom right corner.' },
    { name: 'Submit Query', desc: 'Type specific questions (e.g., "How do we bridge the teacher-parent trust gap in Grade 9?").' },
    { name: 'Apply Action Plans', desc: 'Review step-by-step strategic recommendations provided by the AI advisor.' }
  ]);

  // ==================== SECTION 10: DPDP PRIVACY ====================
  addMainHeading('10. Data Privacy & DPDP Compliance');
  addParagraph('Ensures strict alignment with India\'s Digital Personal Data Protection (DPDP) Act and global student data privacy standards.', 'Purpose:');
  addParagraph('1) Mandatory explicit consent on all forms, 2) Multi-tenant institutional field masking, 3) Full data portability & export capabilities.', 'Guarantees:');

  // PAGE NUMBERS & FOOTER ON ALL PAGES
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(14, 283, 196, 283);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text('DISHA Diagnostic Framework — Standard User Manual', 14, 288);
    doc.text(`Page ${i} of ${totalPages}`, 100, 288, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, 196, 288, { align: 'right' });
  }

  doc.save(`DISHA_User_Guide_And_Features_${schoolName ? schoolName.replace(/\s+/g, '_') : 'Standard'}.pdf`);
};
