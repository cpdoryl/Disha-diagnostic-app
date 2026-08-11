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

interface EnhancedReportData {
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

// Color Palette
const COLORS = {
  primary: '#1E40AF',
  excellent: '#059669',
  good: '#3B82F6',
  adequate: '#F59E0B',
  poor: '#DC2626',
  dark: '#1F2937',
  light: '#F3F4F6',
  text: '#374151',
  border: '#E5E7EB',
};

const PRIORITY_COLORS = {
  critical: '#DC2626',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
};

// Helper: Get status color
function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    excellent: COLORS.excellent,
    good: COLORS.good,
    adequate: COLORS.adequate,
    poor: COLORS.poor,
  };
  return statusColors[status] || COLORS.text;
}

// Helper: Create radar chart canvas
function createRadarChart(dimensions: DimensionData[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 150;
  const numDimensions = dimensions.length;
  const angleSlice = (Math.PI * 2) / numDimensions;

  // Draw grid circles
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / 5) * (i + 1), 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;
  for (let i = 0; i < numDimensions; i++) {
    const angle = angleSlice * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // Draw data polygon
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < numDimensions; i++) {
    const angle = angleSlice * i - Math.PI / 2;
    const score = dimensions[i].avgScore / 100;
    const x = centerX + (radius * score) * Math.cos(angle);
    const y = centerY + (radius * score) * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw benchmark circle (80)
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, (radius / 100) * 80, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw data points
  for (let i = 0; i < numDimensions; i++) {
    const angle = angleSlice * i - Math.PI / 2;
    const score = dimensions[i].avgScore / 100;
    const x = centerX + (radius * score) * Math.cos(angle);
    const y = centerY + (radius * score) * Math.sin(angle);

    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

// Helper: Create comparison bars chart
function createComparisonChart(dimensions: DimensionData[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const barWidth = 20;
  const groupGap = 60;
  const startX = 40;
  const startY = 250;
  const maxHeight = 200;

  dimensions.slice(0, 6).forEach((dim, index) => {
    const x = startX + index * groupGap;

    // Subjective bar
    const subHeight = (dim.subjectiveScore / 100) * maxHeight;
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(x, startY - subHeight, barWidth - 2, subHeight);

    // Objective bar
    const objHeight = (dim.objectiveScore / 100) * maxHeight;
    ctx.fillStyle = '#10B981';
    ctx.fillRect(x + barWidth, startY - objHeight, barWidth - 2, objHeight);

    // Benchmark bar
    const benchHeight = (dim.benchmarkScore / 100) * maxHeight;
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + barWidth * 2, startY - benchHeight, barWidth - 2, benchHeight);

    // Label
    ctx.fillStyle = COLORS.text;
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(dim.dimensionName.substring(0, 8), x + barWidth, startY + 20);
  });

  // Legend
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(50, 20, 12, 12);
  ctx.fillStyle = COLORS.text;
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Subjective', 70, 28);

  ctx.fillStyle = '#10B981';
  ctx.fillRect(230, 20, 12, 12);
  ctx.fillStyle = COLORS.text;
  ctx.fillText('Objective', 250, 28);

  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(380, 20, 12, 12);
  ctx.fillStyle = COLORS.text;
  ctx.fillText('Benchmark', 400, 28);

  return canvas;
}

export function generateEnhancedDiagnosticReport(data: EnhancedReportData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  let pageNumber = 1;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Utility: Add page footer
  const addPageFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 8);
    pageNumber++;
  };

  // Utility: Add header
  const addHeader = (title: string, subtitle?: string) => {
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, 12);

    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 220, 255);
      doc.text(subtitle, 15, 22);
    }
  };

  // ===== PAGE 1: TITLE PAGE =====
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('14-Dimension', pageWidth / 2, 40, { align: 'center' });
  doc.text('Diagnostic Assessment', pageWidth / 2, 55, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional School Diagnostic Report', pageWidth / 2, 75, { align: 'center' });

  // School info box
  doc.setFillColor(255, 255, 255);
  doc.rect(20, 95, 170, 60, 'F');

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.schoolName}`, 25, 107);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Board: ${data.schoolBoard}`, 25, 118);
  doc.text(`Assessment Date: ${data.assessmentDate}`, 25, 128);
  doc.text(`Total Respondents: ${data.respondents.reduce((sum, r) => sum + r.responses, 0)}`, 25, 138);
  doc.text(`Response Completion: ${Math.round((data.respondents.reduce((sum, r) => sum + r.responses, 0) / data.respondents.reduce((sum, r) => sum + r.expected, 0)) * 100)}%`, 25, 148);

  // Health Index - Large Display
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 165, 170, 50, 'F');

  const healthColor = data.overallHealthIndex >= 80 ? COLORS.excellent : data.overallHealthIndex >= 65 ? COLORS.good : data.overallHealthIndex >= 50 ? COLORS.adequate : COLORS.poor;
  doc.setTextColor(healthColor.substring(1));
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text(data.overallHealthIndex.toString(), pageWidth / 2, 195, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('INSTITUTIONAL HEALTH INDEX (0-100)', pageWidth / 2, 212, { align: 'center' });

  addPageFooter();

  // ===== PAGE 2: EXECUTIVE SUMMARY =====
  doc.addPage();
  addHeader('Executive Summary & Key Insights', 'Quick overview for decision makers');
  let yPos = 35;

  // Health status card
  const statusLabel = data.overallHealthIndex >= 80 ? 'EXCELLENT' : data.overallHealthIndex >= 65 ? 'GOOD' : data.overallHealthIndex >= 50 ? 'ADEQUATE' : 'NEEDS IMPROVEMENT';
  const statusColor = getStatusColor(statusLabel.toLowerCase());

  doc.setFillColor(parseInt(statusColor.slice(1, 3), 16), parseInt(statusColor.slice(3, 5), 16), parseInt(statusColor.slice(5, 7), 16));
  doc.rect(15, yPos, 25, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabel, 27.5, yPos + 5.5, { align: 'center' });

  doc.setTextColor(COLORS.text);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Institution Status: Overall Health Index ' + data.overallHealthIndex, 45, yPos + 5.5);
  yPos += 15;

  // Key insights
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('🎯 Key Insights:', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text);
  data.executiveSummary.keyInsights.slice(0, 4).forEach(insight => {
    doc.text(`• ${insight}`, 18, yPos, { maxWidth: 165 });
    yPos += 6;
  });
  yPos += 3;

  // Strengths
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 102, 105);
  doc.text('✓ Key Strengths:', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text);
  data.executiveSummary.strengths.slice(0, 3).forEach(strength => {
    doc.text(`• ${strength}`, 18, yPos, { maxWidth: 165 });
    yPos += 6;
  });
  yPos += 3;

  // Critical areas
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('⚠ Critical Focus Areas:', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text);
  data.executiveSummary.criticalAreas.slice(0, 3).forEach(area => {
    doc.text(`• ${area}`, 18, yPos, { maxWidth: 165 });
    yPos += 6;
  });

  addPageFooter();

  // ===== PAGE 3: RADAR CHART & OVERVIEW =====
  doc.addPage();
  addHeader('14-Dimension Performance Profile', 'Visual representation of all dimensions');

  try {
    const radarCanvas = createRadarChart(data.dimensions);
    const radarImage = radarCanvas.toDataURL('image/png');
    doc.addImage(radarImage, 'PNG', 15, 35, 90, 90);

    // Legend and scores table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Dimension Scores:', 110, 35);

    yPos = 42;
    data.dimensions.slice(0, 7).forEach(dim => {
      const statusColor = getStatusColor(dim.status);
      doc.setFillColor(parseInt(statusColor.slice(1, 3), 16), parseInt(statusColor.slice(3, 5), 16), parseInt(statusColor.slice(5, 7), 16));
      doc.rect(110, yPos - 2, 3, 3, 'F');

      doc.setTextColor(COLORS.text);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${dim.dimensionName}`, 115, yPos);
      doc.text(dim.avgScore.toFixed(1), 185, yPos);
      yPos += 5;
    });

    // Chart legend
    yPos = 140;
    doc.setFillColor(59, 130, 246);
    doc.rect(15, yPos, 5, 3, 'F');
    doc.setTextColor(COLORS.text);
    doc.setFontSize(8);
    doc.text('Actual Performance', 22, yPos + 2.5);

    doc.setFillColor(245, 158, 11);
    doc.rect(15, yPos + 8, 5, 3, 'F');
    doc.text('Benchmark (80)', 22, yPos + 10.5);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('The radar chart shows your institution\'s performance across all 14 dimensions. The amber dashed circle indicates the benchmark level (80/100).', 15, yPos + 20, { maxWidth: 170 });
  } catch (error) {
    console.error('Error adding radar chart:', error);
  }

  addPageFooter();

  // ===== PAGE 4: COMPARISON CHARTS =====
  doc.addPage();
  addHeader('Subjective vs Objective vs Benchmark Analysis', 'Compare perception with reality');

  try {
    const comparisonCanvas = createComparisonChart(data.dimensions);
    const comparisonImage = comparisonCanvas.toDataURL('image/png');
    doc.addImage(comparisonImage, 'PNG', 10, 35, 190, 80);

    yPos = 125;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('What This Shows:', 15, yPos);

    yPos += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    doc.text('• Blue bars (Subjective): How stakeholders perceive performance', 18, yPos, { maxWidth: 165 });
    yPos += 5;
    doc.text('• Green bars (Objective): Measurable data from school operations', 18, yPos, { maxWidth: 165 });
    yPos += 5;
    doc.text('• Yellow bars (Benchmark): Target performance level (80/100)', 18, yPos, { maxWidth: 165 });
    yPos += 5;

    // Gap analysis
    const gapDimensions = data.dimensions.filter(d => Math.abs(d.subjectiveScore - d.objectiveScore) > 5);
    if (gapDimensions.length > 0) {
      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('⚠ Perception-Reality Gaps Detected:', 15, yPos);

      yPos += 6;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.text);
      gapDimensions.slice(0, 3).forEach(dim => {
        const gap = Math.abs(dim.subjectiveScore - dim.objectiveScore);
        const type = dim.subjectiveScore > dim.objectiveScore ? 'overestimated' : 'underestimated';
        doc.text(`${dim.dimensionName}: ${gap}% ${type}`, 18, yPos, { maxWidth: 165 });
        yPos += 5;
      });
    }
  } catch (error) {
    console.error('Error adding comparison chart:', error);
  }

  addPageFooter();

  // ===== PAGE 5-7: DIMENSION DEEP DIVES =====
  const dimensionsPerPage = 3;
  for (let i = 0; i < data.dimensions.length; i += dimensionsPerPage) {
    doc.addPage();
    addHeader('Dimension Analysis - Part ' + Math.ceil((i + 1) / dimensionsPerPage), 'Detailed insights for each dimension');

    yPos = 35;
    const dimensionChunk = data.dimensions.slice(i, i + dimensionsPerPage);

    dimensionChunk.forEach((dim, idx) => {
      if (idx > 0) yPos += 8;

      // Dimension header with color
      const statusColor = getStatusColor(dim.status);
      doc.setFillColor(parseInt(statusColor.slice(1, 3), 16), parseInt(statusColor.slice(3, 5), 16), parseInt(statusColor.slice(5, 7), 16));
      doc.rect(15, yPos, 3, 22, 'F');

      doc.setTextColor(COLORS.dark);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(dim.dimensionName, 20, yPos + 5);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);

      // Scores in one line
      doc.text(`Subjective: ${dim.subjectiveScore}  |  Objective: ${dim.objectiveScore}  |  Benchmark: ${dim.benchmarkScore}  |  Status: ${dim.status.toUpperCase()}`, 20, yPos + 12);

      yPos += 22;

      // Interpretation
      doc.setTextColor(COLORS.text);
      doc.setFontSize(8);
      doc.text(dim.interpretation, 15, yPos, { maxWidth: 170 });
      yPos += dim.interpretation.split('\n').length * 4 + 3;

      // Root causes (pink background)
      doc.setFillColor(254, 226, 226);
      doc.rect(15, yPos, 170, 0.5, 'F');
      doc.setTextColor(153, 27, 27);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      yPos += 3;
      doc.text('Root Causes:', 15, yPos);
      yPos += 4;

      doc.setTextColor(COLORS.text);
      doc.setFont('helvetica', 'normal');
      dim.rootCauses.forEach(cause => {
        doc.text(`• ${cause}`, 18, yPos, { maxWidth: 160 });
        yPos += 4;
      });

      // Actionable points (blue background)
      yPos += 2;
      doc.setFillColor(219, 234, 254);
      doc.rect(15, yPos, 170, 0.5, 'F');
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      yPos += 3;
      doc.text('Recommended Actions:', 15, yPos);
      yPos += 4;

      doc.setTextColor(COLORS.text);
      doc.setFont('helvetica', 'normal');
      dim.actionablePoints.forEach(point => {
        doc.text(`→ ${point}`, 18, yPos, { maxWidth: 160 });
        yPos += 4;
      });
    });

    addPageFooter();
  }

  // ===== FINAL PAGE: STRATEGIC ACTION PLAN =====
  doc.addPage();
  addHeader('Strategic Action Plan', 'Prioritized implementation roadmap');

  yPos = 35;

  // Priority legend
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  const priorities = ['critical', 'high', 'medium', 'low'] as const;
  let xPos = 15;
  priorities.forEach(priority => {
    doc.setFillColor(parseInt(PRIORITY_COLORS[priority].slice(1, 3), 16), parseInt(PRIORITY_COLORS[priority].slice(3, 5), 16), parseInt(PRIORITY_COLORS[priority].slice(5, 7), 16));
    doc.rect(xPos, yPos, 5, 4, 'F');
    doc.setTextColor(COLORS.text);
    doc.text(priority.charAt(0).toUpperCase() + priority.slice(1), xPos + 8, yPos + 3);
    xPos += 50;
  });

  yPos += 12;

  // Recommended actions
  data.recommendedActions.slice(0, 5).forEach((action, idx) => {
    // Priority badge
    doc.setFillColor(parseInt(PRIORITY_COLORS[action.priority].slice(1, 3), 16), parseInt(PRIORITY_COLORS[action.priority].slice(3, 5), 16), parseInt(PRIORITY_COLORS[action.priority].slice(5, 7), 16));
    doc.rect(15, yPos, 8, 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(action.priority.charAt(0).toUpperCase(), 19, yPos + 4.5, { align: 'center' });

    // Action text
    doc.setTextColor(COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(action.action, 26, yPos + 3);

    // Details
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    doc.text(`Timeline: ${action.timeline}`, 26, yPos + 6);
    doc.text(`Impact: ${action.expectedImpact}`, 26, yPos + 8.5);
    doc.text(`Resources: ${action.resourcesRequired.join(', ')}`, 26, yPos + 11, { maxWidth: 155 });

    yPos += 18;
  });

  // Next steps box
  yPos += 5;
  doc.setFillColor(240, 253, 244);
  doc.rect(15, yPos, 170, 25, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.rect(15, yPos, 170, 25);

  doc.setTextColor(5, 102, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ Next Steps:', 20, yPos + 6);

  doc.setTextColor(COLORS.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Share this report with key stakeholders', 20, yPos + 11);
  doc.text('2. Form action teams for critical and high-priority areas', 20, yPos + 14);
  doc.text('3. Develop detailed implementation timelines', 20, yPos + 17);
  doc.text('4. Schedule quarterly review meetings to track progress', 20, yPos + 20);

  addPageFooter();

  // Save
  doc.save(`${data.schoolName}_Enhanced_Diagnostic_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export { EnhancedReportData };
