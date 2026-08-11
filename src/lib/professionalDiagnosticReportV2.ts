import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DimensionMetrics {
  dimensionName: string;
  subjectiveScore: number;  // 1-5 scale or 0-100
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

interface GapAnalysis {
  alignedDimensions: number;
  overestimatedDimensions: number;
  underestimatedDimensions: number;
  averageGap: number;
}

interface ExecutiveSummary {
  overallHealthIndex: number;
  status: 'excellent' | 'good' | 'adequate' | 'poor';
  keyInsights: string[];
  marketingOpportunities: string[];
  criticalAreas: string[];
  strengths: string[];
}

interface ComprehensiveDiagnosticReportData {
  schoolName: string;
  schoolBoard: string;
  assessmentDate: string;
  respondents: RespondentBreakdown[];
  dimensions: DimensionMetrics[];
  gapAnalysis: GapAnalysis;
  executiveSummary: ExecutiveSummary;
  objectiveDataCompleteness: number;
  recommendedActions: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    timeline: string;
    expectedImpact: string;
    resourcesRequired: string[];
  }>;
}

// Color Scheme
const COLORS = {
  primary: '#1F2937',
  secondary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  light: '#F9FAFB',
  border: '#E5E7EB',
  text: '#111827',
  lightText: '#6B7280',
};

const STATUS_COLORS = {
  excellent: { bg: '#D1FAE5', border: '#10B981', text: '#059669' },
  good: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
  adequate: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  poor: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
};

export function generateComprehensiveDiagnosticReport(data: ComprehensiveDiagnosticReportData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  let pageNumber = 1;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Helper: Add page number footer
  const addPageFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10);
  };

  // Page 1: Title Page & Executive Summary
  doc.setFillColor(31, 41, 55);
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSTIC ASSESSMENT REPORT', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('14-Dimension School Diagnostic Framework', pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(10);
  doc.text('Based on Multi-Stakeholder Feedback & Operational Data', pageWidth / 2, 40, { align: 'center' });

  // School Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`School: ${data.schoolName}`, 20, 75);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Board: ${data.schoolBoard}`, 20, 85);
  doc.text(`Assessment Date: ${data.assessmentDate}`, 20, 95);

  // Overall Health Index
  doc.setFillColor(249, 250, 251);
  doc.rect(20, 110, 170, 50, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(20, 110, 170, 50);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 110, 240);
  doc.text('Overall Institutional Health Index', 30, 125);

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.executiveSummary.overallHealthIndex}`, 85, 145, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('out of 100', 85, 155, { align: 'center' });

  // Status Badge
  const statusColor = STATUS_COLORS[data.executiveSummary.status];
  doc.setFillColor(
    parseInt(statusColor.border.slice(1, 3), 16),
    parseInt(statusColor.border.slice(3, 5), 16),
    parseInt(statusColor.border.slice(5, 7), 16)
  );
  doc.rect(70, 165, 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(data.executiveSummary.status.toUpperCase(), 85, 169, { align: 'center' });

  // Respondents Summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Respondent Participation', 20, 185);

  const respondentY = 195;
  data.respondents.forEach((resp, idx) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const label = resp.type.charAt(0).toUpperCase() + resp.type.slice(1) + 's';
    doc.text(`${label}: ${resp.responses}/${resp.expected} (${resp.percentage}%)`, 20 + idx * 40, respondentY);
  });

  addPageFooter();
  pageNumber++;

  // Page 2: Key Insights & Strategic Recommendations
  doc.addPage();
  let yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Executive Summary & Key Insights', 20, yPos);
  yPos += 15;

  // Key Insights
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Findings', 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  data.executiveSummary.keyInsights.forEach(insight => {
    doc.text(`• ${insight}`, 25, yPos, { maxWidth: 165 });
    yPos += 8;
  });

  yPos += 5;

  // Marketing Opportunities
  doc.setFillColor(219, 234, 254);
  doc.rect(20, yPos, 170, 5, 'F');

  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('💡 Marketing Opportunities', 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(17, 24, 39);
  data.executiveSummary.marketingOpportunities.forEach(opp => {
    doc.text(`• ${opp}`, 25, yPos, { maxWidth: 165 });
    yPos += 8;
  });

  yPos += 5;

  // Strengths
  doc.setFillColor(220, 252, 231);
  doc.rect(20, yPos, 170, 5, 'F');

  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 102, 105);
  doc.text('✓ Existing Strengths', 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(17, 24, 39);
  data.executiveSummary.strengths.forEach(strength => {
    doc.text(`• ${strength}`, 25, yPos, { maxWidth: 165 });
    yPos += 8;
  });

  addPageFooter();
  pageNumber++;

  // Page 3: Dimension Summary Table
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Dimension Summary - Complete 14D Analysis', 20, yPos);
  yPos += 12;

  const tableData = data.dimensions.map(dim => [
    dim.dimensionName,
    `${dim.avgScore.toFixed(1)}/5`,
    dim.status.charAt(0).toUpperCase() + dim.status.slice(1),
    dim.subjectiveScore.toString(),
    dim.objectiveScore.toString(),
    dim.benchmarkScore.toString(),
  ]);

  (doc as any).autoTable({
    startY: yPos,
    head: [['Dimension', 'Avg Score', 'Status', 'Subjective', 'Objective', 'Benchmark']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [17, 24, 39],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 20, right: 20 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
    },
  });

  addPageFooter();
  pageNumber++;

  // Pages 4-6: Detailed Dimension Analysis (4-5 dimensions per page)
  const dimensionsPerPage = 4;
  for (let i = 0; i < data.dimensions.length; i += dimensionsPerPage) {
    if (i > 0) {
      doc.addPage();
    }

    yPos = 20;
    const dimensionChunk = data.dimensions.slice(i, i + dimensionsPerPage);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Detailed Dimension Analysis - Part ${Math.floor(i / dimensionsPerPage) + 1}`, 20, yPos);
    yPos += 15;

    dimensionChunk.forEach((dim, idx) => {
      if (idx > 0) yPos += 8;

      const statusInfo = STATUS_COLORS[dim.status];

      // Dimension Header
      doc.setFillColor(
        parseInt(statusInfo.bg.slice(1, 3), 16),
        parseInt(statusInfo.bg.slice(3, 5), 16),
        parseInt(statusInfo.bg.slice(5, 7), 16)
      );
      doc.rect(20, yPos, 170, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(
        parseInt(statusInfo.text.slice(1, 3), 16),
        parseInt(statusInfo.text.slice(3, 5), 16),
        parseInt(statusInfo.text.slice(5, 7), 16)
      );
      doc.text(dim.dimensionName, 25, yPos + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Status: ${dim.status}`, 140, yPos + 5.5);

      yPos += 12;

      // Metrics
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text('Scores:', 20, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        `Subjective: ${dim.subjectiveScore}/100 | Objective: ${dim.objectiveScore}/100 | Benchmark: ${dim.benchmarkScore}/100`,
        25,
        yPos + 5
      );

      yPos += 10;

      // Interpretation
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(55, 65, 81);
      doc.text(dim.interpretation, 20, yPos, { maxWidth: 170 });
      yPos += 12;

      // Root Causes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(17, 24, 39);
      doc.text('Root Causes:', 20, yPos);

      yPos += 5;
      doc.setFont('helvetica', 'normal');
      dim.rootCauses.forEach(cause => {
        doc.text(`  • ${cause}`, 22, yPos, { maxWidth: 165 });
        yPos += 5;
      });

      yPos += 2;

      // Actionable Points
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(17, 24, 39);
      doc.text('Recommended Actions:', 20, yPos);

      yPos += 5;
      doc.setFont('helvetica', 'normal');
      dim.actionablePoints.forEach(point => {
        doc.text(`  → ${point}`, 22, yPos, { maxWidth: 165 });
        yPos += 5;
      });
    });

    addPageFooter();
    pageNumber++;
  }

  // Final Page: Recommended Strategic Actions
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Strategic Action Plan & Recommendations', 20, yPos);
  yPos += 15;

  data.recommendedActions.forEach((action, idx) => {
    const priorityColors = {
      critical: { color: '#EF4444', label: 'CRITICAL' },
      high: { color: '#F97316', label: 'HIGH' },
      medium: { color: '#F59E0B', label: 'MEDIUM' },
      low: { color: '#10B981', label: 'LOW' },
    };

    const pColor = priorityColors[action.priority];

    // Priority Badge
    doc.setFillColor(
      parseInt(pColor.color.slice(1, 3), 16),
      parseInt(pColor.color.slice(3, 5), 16),
      parseInt(pColor.color.slice(5, 7), 16)
    );
    doc.rect(20, yPos, 15, 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(pColor.label, 27.5, yPos + 4, { align: 'center' });

    // Action
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(action.action, 40, yPos + 4, { maxWidth: 140 });

    yPos += 10;

    // Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.text(`Timeline: ${action.timeline}`, 25, yPos);
    yPos += 5;
    doc.text(`Expected Impact: ${action.expectedImpact}`, 25, yPos);
    yPos += 5;
    doc.text(`Resources: ${action.resourcesRequired.join(', ')}`, 25, yPos, { maxWidth: 160 });
    yPos += 8;
  });

  addPageFooter();

  // Save PDF
  doc.save(`${data.schoolName}_Diagnostic_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export { ComprehensiveDiagnosticReportData };
