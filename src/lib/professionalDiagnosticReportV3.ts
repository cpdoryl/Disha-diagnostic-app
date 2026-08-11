import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DimensionData {
  dimensionName: string;
  subjectiveScore: number;
  objectiveScore: number;
  benchmarkScore: number;
  avgScore: number;
  status: 'excellent' | 'good' | 'adequate' | 'poor';
  gapAnalysis: string;
  rootCauses: string[];
  actionablePoints: string[];
  interpretation: string;
}

interface RespondentBreakdown {
  type: 'teacher' | 'parent' | 'student' | 'admin' | 'other';
  responses: number;
  expected: number;
  percentage: number;
}

interface ProfessionalReportData {
  schoolName: string;
  schoolBoard: string;
  assessmentDate: string;
  respondents: RespondentBreakdown[];
  dimensions: DimensionData[];
  overallHealthIndex: number;
  executiveSummary: {
    keyInsights: string[];
    strengths: string[];
    criticalAreas: string[];
    opportunities: string[];
  };
  recommendedActions: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    timeline: string;
    expectedImpact: string;
    resourcesRequired: string[];
  }>;
}

// Professional Color Palette
const PALETTE = {
  primary: { r: 30, g: 64, b: 175 },      // Deep Blue
  secondary: { r: 59, g: 130, b: 246 },   // Sky Blue
  accent: { r: 5, g: 102, b: 105 },       // Teal
  excellent: { r: 5, g: 150, b: 105 },    // Emerald Green
  good: { r: 59, g: 130, b: 246 },        // Blue
  adequate: { r: 245, g: 158, b: 11 },    // Amber
  poor: { r: 220, g: 38, b: 38 },         // Red
  text: { r: 31, g: 41, b: 55 },          // Dark Slate
  lightText: { r: 107, g: 114, b: 128 },  // Gray
  border: { r: 229, g: 231, b: 235 },     // Light Border
  bg: { r: 249, g: 250, b: 251 },         // Off White
};

function rgb(color: { r: number; g: number; b: number }) {
  return [color.r, color.g, color.b];
}

function getStatusColor(status: string): { r: number; g: number; b: number } {
  switch (status) {
    case 'excellent':
      return PALETTE.excellent;
    case 'good':
      return PALETTE.good;
    case 'adequate':
      return PALETTE.adequate;
    case 'poor':
      return PALETTE.poor;
    default:
      return PALETTE.text;
  }
}

export function generateProfessionalDiagnosticReportV3(data: ProfessionalReportData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let pageNumber = 1;

  // Utility Functions
  const addPageFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(PALETTE.lightText));
    const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    doc.text(`${data.schoolName} • Diagnostic Report • ${timestamp}`, 15, pageHeight - 8);
    doc.setTextColor(...rgb(PALETTE.lightText));
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 8);
    pageNumber++;
  };

  const addHeaderBox = (title: string, subtitle?: string) => {
    doc.setFillColor(...rgb(PALETTE.primary));
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 15);

    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 220, 255);
      doc.text(subtitle, 20, 26);
    }
  };

  const addSectionTitle = (title: string, yPos: number) => {
    doc.setFillColor(...rgb(PALETTE.secondary));
    doc.rect(15, yPos, 170, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPos + 5);
    return yPos + 10;
  };

  const addHighlightBox = (content: string[], yPos: number, bgColor: { r: number; g: number; b: number }, borderColor: { r: number; g: number; b: number }) => {
    doc.setFillColor(...rgb(bgColor));
    doc.setDrawColor(...rgb(borderColor));
    doc.setLineWidth(1);
    doc.rect(15, yPos, 170, content.length * 6 + 4, 'FD');

    doc.setTextColor(...rgb(PALETTE.text));
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    content.forEach((line, idx) => {
      doc.text(`• ${line}`, 20, yPos + 5 + idx * 6, { maxWidth: 160 });
    });

    return yPos + content.length * 6 + 8;
  };

  const addMetricBox = (label: string, value: string, xPos: number, yPos: number, width: number, color: { r: number; g: number; b: number }) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...rgb(color));
    doc.setLineWidth(2);
    doc.rect(xPos, yPos, width, 20, 'FD');

    doc.setTextColor(...rgb(PALETTE.lightText));
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), xPos + 3, yPos + 4);

    doc.setTextColor(...rgb(color));
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(value, xPos + width / 2, yPos + 14, { align: 'center' });
  };

  // ===== PAGE 1: PROFESSIONAL TITLE PAGE =====
  addHeaderBox('DIAGNOSTIC ASSESSMENT REPORT', '14-Dimension School Diagnostic Framework');

  let yPos = 50;

  // School Info Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...rgb(PALETTE.border));
  doc.setLineWidth(1.5);
  doc.rect(20, yPos, 160, 45, 'FD');

  doc.setTextColor(...rgb(PALETTE.primary));
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.schoolName, 30, yPos + 10);

  doc.setTextColor(...rgb(PALETTE.text));
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Board: ${data.schoolBoard}`, 30, yPos + 20);
  doc.text(`Assessment Date: ${data.assessmentDate}`, 30, yPos + 28);
  doc.text(`Total Respondents: ${data.respondents.reduce((sum, r) => sum + r.responses, 0)} | Response Rate: ${Math.round((data.respondents.reduce((sum, r) => sum + r.responses, 0) / data.respondents.reduce((sum, r) => sum + r.expected, 0)) * 100)}%`, 30, yPos + 36);

  yPos += 55;

  // Health Index - Premium Display
  const healthColor = data.overallHealthIndex >= 80 ? PALETTE.excellent : data.overallHealthIndex >= 65 ? PALETTE.good : data.overallHealthIndex >= 50 ? PALETTE.adequate : PALETTE.poor;
  const healthLabel = data.overallHealthIndex >= 80 ? 'EXCELLENT' : data.overallHealthIndex >= 65 ? 'GOOD' : data.overallHealthIndex >= 50 ? 'ADEQUATE' : 'NEEDS IMPROVEMENT';

  doc.setFillColor(...rgb(PALETTE.bg));
  doc.setDrawColor(...rgb(healthColor));
  doc.setLineWidth(3);
  doc.rect(30, yPos, 140, 50, 'FD');

  doc.setTextColor(...rgb(PALETTE.lightText));
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTIONAL HEALTH INDEX', pageWidth / 2, yPos + 8, { align: 'center' });

  doc.setTextColor(...rgb(healthColor));
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text(data.overallHealthIndex.toString(), pageWidth / 2, yPos + 32, { align: 'center' });

  doc.setTextColor(...rgb(healthColor));
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(healthLabel, pageWidth / 2, yPos + 45, { align: 'center' });

  addPageFooter();

  // ===== PAGE 2: EXECUTIVE SUMMARY =====
  doc.addPage();
  addHeaderBox('Executive Summary', 'Strategic Insights & Opportunities');

  yPos = 40;

  // Status Overview
  doc.setFillColor(...rgb(healthColor));
  doc.rect(15, yPos, 170, 1, 'F');
  yPos += 4;

  doc.setTextColor(...rgb(healthColor));
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Institution Status: ${healthLabel} Performance Level (${data.overallHealthIndex}/100)`, 20, yPos);
  yPos += 10;

  // Key Insights Section
  yPos = addSectionTitle('📊 Key Findings & Analysis', yPos);
  doc.setTextColor(...rgb(PALETTE.text));
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  data.executiveSummary.keyInsights.slice(0, 4).forEach(insight => {
    doc.text(`▸ ${insight}`, 20, yPos, { maxWidth: 165 });
    yPos += 6;
  });
  yPos += 4;

  // Strengths Section
  yPos = addSectionTitle('✓ Institutional Strengths', yPos);
  doc.setFillColor(240, 255, 240);
  const strengthContent = data.executiveSummary.strengths.slice(0, 3);
  yPos = addHighlightBox(strengthContent, yPos, { r: 240, g: 255, b: 240 }, PALETTE.excellent);

  // Critical Areas Section
  yPos = addSectionTitle('⚠ Critical Focus Areas', yPos + 2);
  doc.setFillColor(255, 245, 240);
  const criticalContent = data.executiveSummary.criticalAreas.slice(0, 3);
  yPos = addHighlightBox(criticalContent, yPos, { r: 255, g: 245, b: 240 }, PALETTE.poor);

  // Opportunities Section
  yPos = addSectionTitle('💡 Growth Opportunities', yPos + 2);
  doc.setFillColor(245, 245, 250);
  const opportContent = data.executiveSummary.opportunities.slice(0, 3);
  yPos = addHighlightBox(opportContent, yPos, { r: 245, g: 245, b: 250 }, PALETTE.secondary);

  addPageFooter();

  // ===== PAGE 3: DIMENSION OVERVIEW =====
  doc.addPage();
  addHeaderBox('Dimension Performance Summary', 'All 14 Dimensions at a Glance');

  yPos = 40;

  const tableData = data.dimensions.map(dim => {
    const status = dim.status.charAt(0).toUpperCase() + dim.status.slice(1);
    return [
      dim.dimensionName,
      dim.avgScore.toFixed(1),
      status,
      dim.subjectiveScore.toString(),
      dim.objectiveScore.toString(),
    ];
  });

  (doc as any).autoTable({
    startY: yPos,
    head: [['Dimension', 'Score', 'Status', 'Subjective', 'Objective']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: rgb(PALETTE.primary),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: rgb(PALETTE.text),
    },
    alternateRowStyles: {
      fillColor: rgb(PALETTE.bg),
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
  });

  addPageFooter();

  // ===== PAGES 4-6: DETAILED DIMENSION ANALYSIS =====
  const dimensionsPerPage = 3;
  for (let i = 0; i < data.dimensions.length; i += dimensionsPerPage) {
    doc.addPage();
    addHeaderBox(`Detailed Analysis - Part ${Math.ceil((i + 1) / dimensionsPerPage)}`, 'Deep Dive into Dimensional Performance');

    yPos = 40;
    const dimensionChunk = data.dimensions.slice(i, i + dimensionsPerPage);

    dimensionChunk.forEach((dim, idx) => {
      if (idx > 0) yPos += 3;

      const statusColor = getStatusColor(dim.status);
      const statusLabel = dim.status.toUpperCase();

      // Dimension Header
      doc.setFillColor(...rgb(statusColor));
      doc.rect(15, yPos, 170, 6, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${dim.dimensionName} [${statusLabel}]`, 20, yPos + 4.5);
      yPos += 9;

      // Metrics Row
      const metricBoxWidth = 50;
      addMetricBox('Subj', dim.subjectiveScore.toString(), 15, yPos, metricBoxWidth, statusColor);
      addMetricBox('Obj', dim.objectiveScore.toString(), 70, yPos, metricBoxWidth, statusColor);
      addMetricBox('Bench', dim.benchmarkScore.toString(), 125, yPos, metricBoxWidth, statusColor);
      yPos += 25;

      // Professional Content Sections
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...rgb(PALETTE.border));
      doc.setLineWidth(0.5);
      doc.rect(15, yPos, 170, 3, 'F');

      // Interpretation
      doc.setTextColor(...rgb(PALETTE.primary));
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      yPos += 5;
      doc.text('Analysis & Interpretation', 20, yPos);
      yPos += 5;

      doc.setTextColor(...rgb(PALETTE.text));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(dim.interpretation, 20, yPos, { maxWidth: 160 });
      yPos += 10;

      // Root Causes
      doc.setFillColor(254, 243, 224);
      doc.setDrawColor(...rgb(PALETTE.adequate));
      doc.setLineWidth(1);
      doc.rect(15, yPos, 170, 1, 'F');
      yPos += 3;

      doc.setTextColor(...rgb(PALETTE.adequate));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Root Causes & Contributing Factors:', 20, yPos);
      yPos += 4;

      doc.setTextColor(...rgb(PALETTE.text));
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      dim.rootCauses.forEach(cause => {
        doc.text(`✓ ${cause}`, 22, yPos, { maxWidth: 160 });
        yPos += 4;
      });

      yPos += 2;

      // Actionable Points
      doc.setFillColor(219, 234, 254);
      doc.setDrawColor(...rgb(PALETTE.secondary));
      doc.setLineWidth(1);
      doc.rect(15, yPos, 170, 1, 'F');
      yPos += 3;

      doc.setTextColor(...rgb(PALETTE.primary));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Strategic Recommendations & Actions:', 20, yPos);
      yPos += 4;

      doc.setTextColor(...rgb(PALETTE.text));
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      dim.actionablePoints.forEach(point => {
        doc.text(`→ ${point}`, 22, yPos, { maxWidth: 160 });
        yPos += 4;
      });

      yPos += 6;
    });

    addPageFooter();
  }

  // ===== FINAL PAGE: STRATEGIC ACTION PLAN =====
  doc.addPage();
  addHeaderBox('Strategic Implementation Plan', 'Prioritized Action Roadmap');

  yPos = 40;

  const priorityConfig = {
    critical: { color: PALETTE.poor, label: '🔴 CRITICAL', bg: { r: 255, g: 245, b: 245 } },
    high: { color: PALETTE.adequate, label: '🟠 HIGH', bg: { r: 255, g: 250, b: 240 } },
    medium: { color: PALETTE.good, label: '🟡 MEDIUM', bg: { r: 255, g: 250, b: 245 } },
    low: { color: PALETTE.excellent, label: '🟢 LOW', bg: { r: 245, g: 255, b: 250 } },
  };

  data.recommendedActions.forEach((action, idx) => {
    const priority = priorityConfig[action.priority];

    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 40;
      addHeaderBox('Strategic Implementation Plan (Continued)', '');
    }

    // Action Card
    doc.setFillColor(...rgb(priority.bg));
    doc.setDrawColor(...rgb(priority.color));
    doc.setLineWidth(2);
    doc.rect(15, yPos, 170, 1, 'F');

    yPos += 3;
    doc.setTextColor(...rgb(priority.color));
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(priority.label, 20, yPos);

    doc.setTextColor(...rgb(PALETTE.text));
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(action.action, 80, yPos, { maxWidth: 100 });
    yPos += 7;

    // Details Grid
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...rgb(PALETTE.lightText));

    doc.text(`Timeline: ${action.timeline}`, 20, yPos);
    doc.text(`Impact: ${action.expectedImpact}`, 100, yPos);
    yPos += 5;

    doc.text(`Resources: ${action.resourcesRequired.join(' | ')}`, 20, yPos, { maxWidth: 165 });
    yPos += 8;
  });

  // Next Steps Footer
  yPos += 5;
  doc.setFillColor(...rgb(PALETTE.excellent));
  doc.rect(15, yPos, 170, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ Next Steps for Implementation', 25, yPos + 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Share this report with key stakeholders  •  2. Establish action teams  •  3. Develop detailed timelines  •  4. Schedule quarterly reviews', 25, yPos + 11, { maxWidth: 150 });

  addPageFooter();

  // Save PDF
  doc.save(`${data.schoolName}_Diagnostic_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export { ProfessionalReportData };
