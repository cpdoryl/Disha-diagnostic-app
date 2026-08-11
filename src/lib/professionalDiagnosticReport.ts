import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DimensionData {
  name: string;
  subjective: number;
  objective: number;
  benchmark: number;
  gap: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  interpretation: string;
}

interface RespondentData {
  type: string;
  count: number;
  total: number;
  percentage: number;
}

interface ReportData {
  schoolName: string;
  assessmentDate: string;
  dimensions: DimensionData[];
  respondents: RespondentData[];
  objectives?: {
    academic?: number;
    enrollment?: number;
    qualifications?: number;
    infrastructure?: number;
    library?: number;
    labs?: number;
    wellbeing?: number;
    training?: number;
    engagement?: number;
    financial?: number;
  };
}

// Color Scheme
const COLORS = {
  primary: '#1F2937', // Dark gray
  secondary: '#3B82F6', // Blue
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  light: '#F9FAFB', // Light gray
  border: '#E5E7EB', // Border gray
  text: '#111827', // Dark text
  lightText: '#6B7280', // Light text
};

// Font configuration
const FONTS = {
  title: { size: 28, weight: 'bold' },
  heading1: { size: 18, weight: 'bold' },
  heading2: { size: 14, weight: 'bold' },
  heading3: { size: 12, weight: 'bold' },
  normal: { size: 10, weight: 'normal' },
  small: { size: 8, weight: 'normal' },
};

export function generateDiagnosticPDF(data: ReportData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yPosition = 20;

  // Set default font
  doc.setFont('helvetica', 'normal');

  // 1. Title Page
  generateTitlePage(doc, data);

  // 2. Executive Summary
  doc.addPage();
  yPosition = 20;
  yPosition = generateExecutiveSummary(doc, yPosition, data);

  // 3. Dimension Summary
  doc.addPage();
  yPosition = 20;
  yPosition = generateDimensionSummary(doc, yPosition, data);

  // 4. Subjective vs Objective vs Benchmark
  doc.addPage();
  yPosition = 20;
  yPosition = generateSOBAnalysis(doc, yPosition, data);

  // 5. Perception-Reality Mismatch
  doc.addPage();
  yPosition = 20;
  yPosition = generateMismatchAnalysis(doc, yPosition, data);

  // 6. Detailed Dimension Analysis
  const dimensionChunks = chunkArray(data.dimensions, 4); // 4 dimensions per page
  dimensionChunks.forEach((chunk, chunkIdx) => {
    if (chunkIdx > 0) {
      doc.addPage();
    } else {
      doc.addPage();
    }
    let pageY = 20;
    chunk.forEach(dim => {
      pageY = generateDimensionCard(doc, pageY, dim);
      if (pageY > 250) {
        doc.addPage();
        pageY = 20;
      }
    });
  });

  // 7. Insights & Recommendations
  doc.addPage();
  yPosition = 20;
  generateInsightsPage(doc, yPosition, data);

  // Save PDF
  doc.save(`Diagnostic_Report_${data.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function generateTitlePage(doc: jsPDF, data: ReportData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(31, 41, 55); // Primary color
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Logo/Header area
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONTS.title.size);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSTIC ASSESSMENT REPORT', pageWidth / 2, 60, { align: 'center' });

  // Divider
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.line(20, 75, pageWidth - 20, 75);

  // Main content
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.schoolName, pageWidth / 2, 110, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('14-Dimensional School Diagnostic Framework', pageWidth / 2, 125, { align: 'center' });

  // Assessment details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Assessment Date:', 20, 160);
  doc.setFont('helvetica', 'normal');
  doc.text(data.assessmentDate, 60, 160);

  const totalResponses = data.respondents.reduce((sum, r) => sum + r.count, 0);
  const totalExpected = data.respondents.reduce((sum, r) => sum + r.total, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Responses:', 20, 175);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalResponses}/${totalExpected} (${Math.round((totalResponses / totalExpected) * 100)}%)`, 60, 175);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
}

function generateExecutiveSummary(doc: jsPDF, yPos: number, data: ReportData): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONTS.heading1.size);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPos);
  yPos += 12;

  // Divider
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  // Calculate metrics
  const avgSubjective = Math.round(data.dimensions.reduce((sum, d) => sum + d.subjective, 0) / data.dimensions.length);
  const avgObjective = Math.round(data.dimensions.reduce((sum, d) => sum + d.objective, 0) / data.dimensions.length);
  const avgGap = Math.round(Math.abs(avgSubjective - avgObjective));

  const statusCounts = {
    excellent: data.dimensions.filter(d => d.status === 'excellent').length,
    good: data.dimensions.filter(d => d.status === 'good').length,
    average: data.dimensions.filter(d => d.status === 'average').length,
    poor: data.dimensions.filter(d => d.status === 'poor').length,
  };

  // Overview paragraph
  doc.setTextColor(COLORS.lightText);
  doc.setFontSize(FONTS.normal.size);
  doc.setFont('helvetica', 'normal');
  const summaryText = `This comprehensive diagnostic assessment evaluates ${data.schoolName} across 14 dimensions of educational excellence. The analysis combines stakeholder perceptions with objective operational data to identify strengths and areas requiring improvement.`;
  doc.text(summaryText, 20, yPos, { maxWidth: pageWidth - 40, align: 'left' });
  yPos += 25;

  // Key Metrics Box
  doc.setFillColor(249, 250, 251);
  doc.rect(20, yPos, pageWidth - 40, 50, 'F');
  doc.setDrawColor(COLORS.border);
  doc.rect(20, yPos, pageWidth - 40, 50);

  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  const metricsY = yPos + 8;
  doc.text(`Average Perception: ${avgSubjective}/100`, 30, metricsY);
  doc.text(`Average Reality: ${avgObjective}/100`, 30, metricsY + 8);
  doc.text(`Perception-Reality Gap: ${avgGap} points`, 30, metricsY + 16);
  doc.text(`Overall Completion: ${Math.round((data.respondents.reduce((sum, r) => sum + r.count, 0) / Math.max(data.respondents.reduce((sum, r) => sum + r.total, 0), 1)) * 100)}%`, 30, metricsY + 24);

  doc.text(`Excellent: ${statusCounts.excellent}`, 120, metricsY);
  doc.text(`Good: ${statusCounts.good}`, 120, metricsY + 8);
  doc.text(`Average: ${statusCounts.average}`, 120, metricsY + 16);
  doc.text(`Poor: ${statusCounts.poor}`, 120, metricsY + 24);

  yPos += 60;

  // Key Findings
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Key Findings:', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONTS.normal.size);
  doc.setTextColor(COLORS.lightText);

  const findings = [
    `${statusCounts.excellent} dimensions rated as Excellent, indicating strong performance areas`,
    `${statusCounts.poor} dimensions rated as Poor, requiring immediate attention and intervention`,
    `Average perception-reality gap of ${avgGap} points suggests ${avgGap > 15 ? 'significant' : 'moderate'} alignment issues`,
    `Response rate of ${Math.round((data.respondents.reduce((sum, r) => sum + r.count, 0) / Math.max(data.respondents.reduce((sum, r) => sum + r.total, 0), 1)) * 100)}% demonstrates good stakeholder engagement`,
  ];

  findings.forEach(finding => {
    doc.text(`• ${finding}`, 25, yPos, { maxWidth: pageWidth - 50 });
    yPos += 10;
  });

  return yPos + 10;
}

function generateDimensionSummary(doc: jsPDF, yPos: number, data: ReportData): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONTS.heading1.size);
  doc.setFont('helvetica', 'bold');
  doc.text('Dimension Summary', 20, yPos);
  yPos += 12;

  // Divider
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Create table
  const tableData = data.dimensions.map(dim => [
    dim.name,
    dim.subjective.toString(),
    dim.objective.toString(),
    dim.benchmark.toString(),
    dim.gap.toFixed(1),
    dim.status.charAt(0).toUpperCase() + dim.status.slice(1),
  ]);

  (doc as any).autoTable({
    startY: yPos,
    head: [['Dimension', 'Subjective', 'Objective', 'Benchmark', 'Gap', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
    },
    margin: { left: 20, right: 20 },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

function generateSOBAnalysis(doc: jsPDF, yPos: number, data: ReportData): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONTS.heading1.size);
  doc.setFont('helvetica', 'bold');
  doc.text('Subjective vs Objective vs Benchmark Analysis', 20, yPos);
  yPos += 12;

  // Divider
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Sort by gap
  const sortedDims = [...data.dimensions].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));

  // Top performers
  const top3 = [...data.dimensions].sort((a, b) => b.subjective - a.subjective).slice(0, 3);
  const bottom3 = [...data.dimensions].sort((a, b) => a.subjective - b.subjective).slice(0, 3);

  // Top Performers Section
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Top 3 Performers (By Subjective Score):', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONTS.normal.size);
  top3.forEach((dim, idx) => {
    doc.setTextColor(COLORS.success);
    doc.text(`${idx + 1}. ${dim.name}: ${dim.subjective}/100`, 25, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Bottom Performers Section
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Dimensions Needing Attention (By Subjective Score):', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONTS.normal.size);
  bottom3.forEach((dim, idx) => {
    doc.setTextColor(COLORS.danger);
    doc.text(`${idx + 1}. ${dim.name}: ${dim.subjective}/100`, 25, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Largest gaps
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Largest Perception-Reality Gaps:', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONTS.normal.size);
  const topGaps = sortedDims.slice(0, 5);
  topGaps.forEach((dim, idx) => {
    const gapColor = Math.abs(dim.gap) > 20 ? COLORS.danger : Math.abs(dim.gap) > 10 ? COLORS.warning : COLORS.success;
    doc.setTextColor(gapColor);
    const direction = dim.subjective > dim.objective ? '(Optimistic)' : '(Pessimistic)';
    doc.text(`${idx + 1}. ${dim.name}: ${Math.abs(dim.gap).toFixed(1)} points ${direction}`, 25, yPos);
    yPos += 6;
  });

  return yPos + 10;
}

function generateMismatchAnalysis(doc: jsPDF, yPos: number, data: ReportData): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONTS.heading1.size);
  doc.setFont('helvetica', 'bold');
  doc.text('Perception-Reality Mismatch Analysis', 20, yPos);
  yPos += 12;

  // Divider
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Count severities
  const critical = data.dimensions.filter(d => Math.abs(d.gap) > 20).length;
  const warning = data.dimensions.filter(d => Math.abs(d.gap) > 10 && Math.abs(d.gap) <= 20).length;
  const aligned = data.dimensions.filter(d => Math.abs(d.gap) <= 10).length;
  const optimistic = data.dimensions.filter(d => d.subjective > d.objective).length;
  const pessimistic = data.dimensions.filter(d => d.subjective < d.objective).length;

  // Summary boxes
  const boxHeight = 12;
  const boxWidth = (pageWidth - 40) / 3;

  // Critical
  doc.setFillColor(239, 68, 68);
  doc.rect(20, yPos, boxWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`CRITICAL: ${critical}`, 20 + boxWidth / 2, yPos + 8, { align: 'center' });

  // Warning
  doc.setFillColor(249, 115, 22);
  doc.rect(20 + boxWidth + 10, yPos, boxWidth, boxHeight, 'F');
  doc.text(`WARNING: ${warning}`, 20 + boxWidth + 10 + boxWidth / 2, yPos + 8, { align: 'center' });

  // Aligned
  doc.setFillColor(16, 185, 129);
  doc.rect(20 + (boxWidth + 10) * 2, yPos, boxWidth, boxHeight, 'F');
  doc.text(`ALIGNED: ${aligned}`, 20 + (boxWidth + 10) * 2 + boxWidth / 2, yPos + 8, { align: 'center' });

  yPos += 20;

  // Analysis text
  doc.setTextColor(COLORS.lightText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONTS.normal.size);

  const analysisText = `Analysis shows ${optimistic} dimensions with optimistic perceptions (stakeholders rate higher than reality) and ${pessimistic} with pessimistic perceptions (stakeholders rate lower than reality). ${critical} dimensions show critical misalignment requiring immediate attention.`;
  doc.text(analysisText, 20, yPos, { maxWidth: pageWidth - 40, align: 'left' });

  yPos += 25;

  // Critical dimensions
  if (critical > 0) {
    doc.setTextColor(COLORS.danger);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Critical Misalignment Dimensions:', 20, yPos);
    yPos += 7;

    const criticalDims = data.dimensions.filter(d => Math.abs(d.gap) > 20);
    doc.setTextColor(COLORS.lightText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONTS.normal.size);

    criticalDims.forEach(dim => {
      const direction = dim.subjective > dim.objective ? 'over' : 'under';
      doc.text(`• ${dim.name}: Gap of ${Math.abs(dim.gap).toFixed(1)} points (${direction}-estimated)`, 25, yPos);
      yPos += 6;
    });
  }

  return yPos + 10;
}

function generateDimensionCard(doc: jsPDF, yPos: number, dimension: DimensionData): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Background
  const statusColors: { [key: string]: string } = {
    excellent: '#D1FAE5',
    good: '#DBEAFE',
    average: '#FEF3C7',
    poor: '#FEE2E2',
  };

  doc.setFillColor(parseColor(statusColors[dimension.status]));
  doc.rect(20, yPos, pageWidth - 40, 45, 'F');

  // Border
  const borderColors: { [key: string]: string } = {
    excellent: '#10B981',
    good: '#3B82F6',
    average: '#F59E0B',
    poor: '#EF4444',
  };

  doc.setDrawColor(parseColor(borderColors[dimension.status]));
  doc.setLineWidth(1);
  doc.rect(20, yPos, pageWidth - 40, 45);

  // Content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(parseColorToRGB(borderColors[dimension.status]));
  doc.text(dimension.name, 25, yPos + 7);

  // Metrics
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightText);

  const metricsY = yPos + 12;
  doc.text(`Subjective: ${dimension.subjective}/100`, 25, metricsY);
  doc.text(`Objective: ${dimension.objective}/100`, 25, metricsY + 5);
  doc.text(`Benchmark: ${dimension.benchmark}/100`, 25, metricsY + 10);
  doc.text(`Gap: ${dimension.gap.toFixed(1)}`, 100, metricsY);
  doc.text(`Status: ${dimension.status.toUpperCase()}`, 100, metricsY + 5);

  // Interpretation
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text(dimension.interpretation, 25, yPos + 36, { maxWidth: pageWidth - 50 });

  return yPos + 50;
}

function generateInsightsPage(doc: jsPDF, yPos: number, data: ReportData): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONTS.heading1.size);
  doc.setFont('helvetica', 'bold');
  doc.text('Insights & Recommendations', 20, yPos);
  yPos += 12;

  // Divider
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Generate insights based on data
  const poorDims = data.dimensions.filter(d => d.status === 'poor');
  const excellentDims = data.dimensions.filter(d => d.status === 'excellent');
  const avgGap = Math.round(
    data.dimensions.reduce((sum, d) => sum + Math.abs(d.gap), 0) / data.dimensions.length
  );

  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Strategic Recommendations:', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONTS.normal.size);
  doc.setTextColor(COLORS.lightText);

  const recommendations = [
    {
      priority: 'HIGH',
      text: `Focus on improving ${poorDims.length} dimensions currently rated as Poor. These represent critical gaps that require immediate intervention.`,
      color: COLORS.danger,
    },
    {
      priority: 'MEDIUM',
      text: `Address perception-reality gaps. An average gap of ${avgGap} points suggests stakeholders have ${avgGap > 15 ? 'significantly' : 'moderately'} different views than operational reality.`,
      color: COLORS.warning,
    },
    {
      priority: 'LOW',
      text: `Leverage strengths in ${excellentDims.length} excellent dimensions to support improvement initiatives in weaker areas.`,
      color: COLORS.success,
    },
  ];

  recommendations.forEach(rec => {
    doc.setTextColor(parseColorToRGB(rec.color));
    doc.setFont('helvetica', 'bold');
    doc.text(`[${rec.priority}]`, 25, yPos);
    doc.setTextColor(COLORS.lightText);
    doc.setFont('helvetica', 'normal');
    doc.text(rec.text, 55, yPos, { maxWidth: pageWidth - 75 });
    yPos += 12;
  });

  yPos += 5;

  // Next Steps
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Next Steps:', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONTS.normal.size);
  doc.setTextColor(COLORS.lightText);

  const nextSteps = [
    '1. Share findings with school leadership and key stakeholders',
    '2. Establish task forces for each poorly-rated dimension',
    '3. Develop action plans with specific, measurable targets',
    '4. Implement interventions over the next 6-12 months',
    '5. Re-assess progress at 6-month intervals',
  ];

  nextSteps.forEach(step => {
    doc.text(step, 25, yPos);
    yPos += 6;
  });

  return yPos + 10;
}

// Helper Functions
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function parseColor(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

function parseColorToRGB(hex: string): string {
  const [r, g, b] = parseColor(hex);
  return `rgb(${r},${g},${b})`;
}

export { ReportData };
