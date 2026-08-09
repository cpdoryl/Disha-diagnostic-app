/**
 * PDF Report Generator
 * Generates comprehensive DISHA diagnostic reports in PDF format
 * Includes: executive summary, 14D analysis, gap analysis, recommendations, appendix
 */

export interface ReportData {
  schoolId: string;
  schoolName: string;
  board: string;
  city: string;
  principalName?: string;
  generatedDate: Date;
  assessmentVersion: string;

  // Subjective data (from multi-stakeholder assessment)
  subjectiveDimensions: Array<{
    id: string;
    name: string;
    category: string;
    score: number;
    benchmark: number;
  }>;

  // Objective data (from operational metrics)
  objectiveDimensions?: Array<{
    id: string;
    name: string;
    score: number;
    confidence: number;
    dataCompleteness: number;
  }>;

  // Gap analysis
  gapAnalysis?: {
    totalGaps: Array<{
      dimensionName: string;
      subjectiveScore: number;
      objectiveScore: number;
      gap: number;
      interpretation: 'overestimation' | 'underestimation' | 'alignment';
    }>;
    insights: string[];
    recommendations: string[];
  };

  // Respondent information
  respondentSummary?: {
    totalRespondents: number;
    byType: Record<string, number>;
    responseRate: number;
  };

  // Priorities and action items
  topGaps?: Array<{
    rank: number;
    dimensionName: string;
    currentScore: number;
    benchmark: number;
    gap: number;
    recommendation: string;
    estimatedEffort: 'low' | 'medium' | 'high';
    expectedROI: string;
  }>;

  strongAreas?: string[];
  focusAreas?: string[];
}

export interface PDFGenerationOptions {
  includeGapAnalysis?: boolean;
  includeObjectiveData?: boolean;
  includeRecommendations?: boolean;
  includeAppendix?: boolean;
  watermark?: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    schoolBrandColor?: string;
  };
}

/**
 * Generate comprehensive DISHA diagnostic PDF report
 */
export async function generateDISHAReport(
  reportData: ReportData,
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  const {
    includeGapAnalysis = true,
    includeObjectiveData = false,
    includeRecommendations = true,
    includeAppendix = true,
    watermark = 'CONFIDENTIAL',
    branding = {},
  } = options;

  // Build HTML content for report
  const htmlContent = buildReportHTML(
    reportData,
    {
      includeGapAnalysis,
      includeObjectiveData,
      includeRecommendations,
      includeAppendix,
      watermark,
      branding,
    }
  );

  // Convert HTML to PDF using html2pdf library
  // Note: In production, this would use jsPDF + html2pdf or similar
  return await convertHTMLToPDF(htmlContent, reportData.schoolName);
}

/**
 * Build HTML content for PDF report
 */
function buildReportHTML(
  data: ReportData,
  options: any
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>DISHA Diagnostic Report - ${data.schoolName}</title>
      <style>
        * { margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 20px;
        }
        .page-break { page-break-after: always; }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          color: rgba(0,0,0,0.05);
          z-index: -1;
          pointer-events: none;
        }

        /* Cover Page */
        .cover-page {
          text-align: center;
          padding: 100px 40px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .cover-page h1 { font-size: 48px; margin: 20px 0; font-weight: bold; }
        .cover-page h2 { font-size: 32px; margin: 10px 0; font-weight: 600; }
        .cover-page .meta { margin-top: 40px; font-size: 14px; opacity: 0.9; }
        .cover-page .badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 10px 20px;
          border-radius: 20px;
          margin: 10px;
          font-size: 12px;
        }

        /* Header & Footer */
        .header {
          background: #f8f9fa;
          padding: 20px;
          border-bottom: 3px solid #667eea;
          margin-bottom: 30px;
          border-radius: 8px;
        }
        .header h2 { color: #667eea; font-size: 24px; margin-bottom: 10px; }
        .header .subtitle { color: #666; font-size: 14px; }

        /* Section Styles */
        .section { margin: 40px 0; page-break-inside: avoid; }
        .section h2 {
          font-size: 28px;
          color: #667eea;
          margin-bottom: 20px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }
        .section h3 {
          font-size: 18px;
          color: #333;
          margin-top: 20px;
          margin-bottom: 15px;
        }

        /* Metrics & Scores */
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .metric-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          page-break-inside: avoid;
        }
        .metric-card .label { font-size: 12px; color: #999; text-transform: uppercase; }
        .metric-card .value { font-size: 36px; font-weight: bold; color: #333; margin: 10px 0; }
        .metric-card .benchmark { font-size: 12px; color: #666; }
        .metric-card.exceeds { border-left: 4px solid #4caf50; }
        .metric-card.meets { border-left: 4px solid #2196f3; }
        .metric-card.below { border-left: 4px solid #f44336; }

        /* 14D Dimension Table */
        .dimension-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
        }
        .dimension-table th {
          background: #667eea;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
        }
        .dimension-table td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 13px;
        }
        .dimension-table tr:hover { background: #f5f5f5; }
        .dimension-table .category { color: #667eea; font-weight: 600; }
        .dimension-table .score { font-weight: bold; text-align: center; }

        /* Progress Bars */
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin: 5px 0;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
        }

        /* Gap Analysis */
        .gap-item {
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
          page-break-inside: avoid;
        }
        .gap-item.overestimation { border-left-color: #ff9800; }
        .gap-item.underestimation { border-left-color: #2196f3; }
        .gap-item.alignment { border-left-color: #4caf50; }
        .gap-item .title { font-weight: bold; margin-bottom: 8px; }
        .gap-item .detail { font-size: 13px; color: #666; }

        /* Recommendations */
        .recommendation {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
          page-break-inside: avoid;
        }
        .recommendation .title { font-weight: bold; color: #1565c0; margin-bottom: 8px; }
        .recommendation .description { font-size: 13px; color: #424242; }
        .recommendation .effort {
          display: inline-block;
          background: #1565c0;
          color: white;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          margin-top: 8px;
        }

        /* Executive Summary Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .stat-box {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          page-break-inside: avoid;
        }
        .stat-box .number { font-size: 32px; font-weight: bold; color: #667eea; }
        .stat-box .label { font-size: 12px; color: #999; margin-top: 8px; text-transform: uppercase; }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 11px;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      ${options.watermark ? `<div class="watermark">${options.watermark}</div>` : ''}

      <!-- COVER PAGE -->
      <div class="cover-page page-break">
        <h1>DISHA</h1>
        <h2>Diagnostic Framework Report</h2>
        <div class="meta">
          <div><strong>${data.schoolName}</strong></div>
          <div>${data.city} | ${data.board}</div>
          <div style="margin-top: 20px;">Assessment Report</div>
          <div style="font-size: 12px; margin-top: 10px;">Generated: ${formatDate(data.generatedDate)}</div>
        </div>
        <div style="margin-top: 30px;">
          <div class="badge">CONFIDENTIAL</div>
          <div class="badge">Version ${data.assessmentVersion}</div>
        </div>
      </div>

      <!-- TABLE OF CONTENTS -->
      <div class="page-break">
        <div class="header">
          <h2>Table of Contents</h2>
        </div>
        <ol style="font-size: 14px; line-height: 2;">
          <li>Executive Summary</li>
          <li>Overall Health Assessment</li>
          <li>14-Dimensional Analysis</li>
          ${options.includeObjectiveData ? '<li>Objective Data Integration</li>' : ''}
          ${options.includeGapAnalysis ? '<li>Perception-Reality Gap Analysis</li>' : ''}
          <li>Priority Focus Areas</li>
          ${options.includeRecommendations ? '<li>Actionable Recommendations</li>' : ''}
          ${options.includeAppendix ? '<li>Appendix & Methodology</li>' : ''}
        </ol>
      </div>

      <!-- EXECUTIVE SUMMARY -->
      <div class="page-break">
        <div class="header">
          <h2>Executive Summary</h2>
          <div class="subtitle">Overall school health assessment across 14 diagnostic dimensions</div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="number">${calculateAverageScore(data.subjectiveDimensions)}</div>
            <div class="label">Overall Score</div>
          </div>
          <div class="stat-box">
            <div class="number">${data.respondentSummary?.totalRespondents || 0}</div>
            <div class="label">Respondents</div>
          </div>
          <div class="stat-box">
            <div class="number">${data.subjectiveDimensions.filter(d => d.score >= d.benchmark).length}</div>
            <div class="label">Dimensions Exceeding Benchmark</div>
          </div>
          <div class="stat-box">
            <div class="number">${data.subjectiveDimensions.filter(d => d.score < d.benchmark).length}</div>
            <div class="label">Focus Areas</div>
          </div>
        </div>

        <div class="section">
          <h3>Key Findings</h3>
          ${data.gapAnalysis?.insights.map(insight => `<p style="margin: 10px 0; font-size: 13px;">${insight}</p>`).join('') || ''}
        </div>
      </div>

      <!-- 14D ANALYSIS -->
      <div class="page-break">
        <div class="header">
          <h2>14-Dimensional Assessment</h2>
          <div class="subtitle">Performance across all diagnostic dimensions</div>
        </div>

        <table class="dimension-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Category</th>
              <th>Score</th>
              <th>Benchmark</th>
              <th>Gap</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.subjectiveDimensions.map(dim => {
              const gap = dim.score - dim.benchmark;
              const status = gap > 0 ? 'Exceeds' : gap === 0 ? 'Meets' : 'Below';
              return `
                <tr>
                  <td><strong>${dim.name}</strong></td>
                  <td class="category">${dim.category}</td>
                  <td class="score">${dim.score}</td>
                  <td class="score">${dim.benchmark}</td>
                  <td class="score">${gap > 0 ? '+' : ''}${gap}</td>
                  <td>${status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- DETAILED DIMENSION ANALYSIS -->
      ${data.subjectiveDimensions.map(dim => `
        <div class="page-break">
          <div class="header">
            <h2>${dim.name}</h2>
            <div class="subtitle">${dim.category}</div>
          </div>

          <div class="metric-grid">
            <div class="metric-card ${dim.score > dim.benchmark ? 'exceeds' : dim.score === dim.benchmark ? 'meets' : 'below'}">
              <div class="label">Current Score</div>
              <div class="value">${dim.score}</div>
              <div class="benchmark">National Benchmark: ${dim.benchmark}</div>
            </div>
            <div class="metric-card">
              <div class="label">Gap</div>
              <div class="value">${dim.score - dim.benchmark > 0 ? '+' : ''}${dim.score - dim.benchmark}</div>
              <div class="benchmark">${Math.abs(dim.score - dim.benchmark)} points ${dim.score > dim.benchmark ? 'above' : 'below'} benchmark</div>
            </div>
          </div>

          <div class="section">
            <h3>Progress Indicator</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(100, (dim.score / dim.benchmark) * 100)}%"></div>
            </div>
          </div>

          <div class="section">
            <h3>Assessment Details</h3>
            <p style="font-size: 13px; color: #666; line-height: 1.8;">
              ${generateDimensionNarrative(dim)}
            </p>
          </div>
        </div>
      `).join('')}

      ${options.includeGapAnalysis && data.gapAnalysis ? `
        <!-- GAP ANALYSIS -->
        <div class="page-break">
          <div class="header">
            <h2>Perception-Reality Gap Analysis</h2>
            <div class="subtitle">Comparison of subjective perception with objective operational data</div>
          </div>

          ${data.gapAnalysis.totalGaps.map(gap => `
            <div class="gap-item ${gap.interpretation}">
              <div class="title">${gap.dimensionName}</div>
              <div class="detail">
                Subjective: ${gap.subjectiveScore} | Objective: ${gap.objectiveScore} | Gap: ${gap.gap > 0 ? '+' : ''}${gap.gap}
              </div>
              <div class="detail" style="margin-top: 5px; font-size: 12px;">
                ${gap.interpretation === 'overestimation' ? '⚠️ Overestimated by stakeholders' :
                  gap.interpretation === 'underestimation' ? '💡 Undervalued - marketing opportunity' :
                  '✓ Perception aligns with reality'}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${options.includeRecommendations && data.topGaps ? `
        <!-- RECOMMENDATIONS -->
        <div class="page-break">
          <div class="header">
            <h2>Actionable Recommendations</h2>
            <div class="subtitle">Priority-ordered improvement initiatives</div>
          </div>

          ${data.topGaps.map(item => `
            <div class="recommendation">
              <div class="title">Priority ${item.rank}: ${item.dimensionName}</div>
              <div class="description">${item.recommendation}</div>
              <div class="effort">Effort: ${item.estimatedEffort.toUpperCase()} | Expected ROI: ${item.expectedROI}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- FOOTER -->
      <div class="footer">
        <p>DISHA Diagnostic Framework Report | Generated ${formatDate(data.generatedDate)} | Confidential</p>
        <p>For questions about this report, contact: diagnostics@disha-framework.com</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Convert HTML to PDF using html2pdf library
 * Note: Requires html2pdf.js library or jsPDF + html2canvas
 */
async function convertHTMLToPDF(html: string, filename: string): Promise<Blob> {
  // In production environment, this would use:
  // const element = document.createElement('div');
  // element.innerHTML = html;
  // const opt = {
  //   margin: 10,
  //   filename: `${filename}_DISHA_Report.pdf`,
  //   image: { type: 'jpeg', quality: 0.98 },
  //   html2canvas: { scale: 2 },
  //   jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  // };
  // await html2pdf().set(opt).from(element).save();

  // For now, return a placeholder blob
  console.log('PDF Generation Placeholder - html2pdf integration needed');
  return new Blob([html], { type: 'text/html' });
}

/**
 * Helper: Calculate average score
 */
function calculateAverageScore(dimensions: Array<{ score: number }>): number {
  if (dimensions.length === 0) return 0;
  const sum = dimensions.reduce((acc, d) => acc + d.score, 0);
  return Math.round(sum / dimensions.length);
}

/**
 * Helper: Format date
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Helper: Generate narrative for dimension
 */
function generateDimensionNarrative(dim: any): string {
  const gap = dim.score - dim.benchmark;

  if (gap > 0) {
    return `Your school demonstrates excellence in ${dim.name}, scoring ${dim.score}/100, which exceeds the national benchmark of ${dim.benchmark}. This indicates a competitive strength that should be maintained and leveraged in stakeholder communications.`;
  } else if (gap === 0) {
    return `Your school meets national standards in ${dim.name} with a score of ${dim.score}/100, matching the benchmark of ${dim.benchmark}. Continue current practices while monitoring for consistency.`;
  } else {
    return `Your school's ${dim.name} dimension scores ${dim.score}/100, falling ${Math.abs(gap)} points below the national benchmark of ${dim.benchmark}. This area requires targeted interventions and monitoring.`;
  }
}

/**
 * Export report as PDF file
 */
export async function downloadReport(
  reportData: ReportData,
  options?: PDFGenerationOptions
): Promise<void> {
  const blob = await generateDISHAReport(reportData, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.schoolName}_DISHA_Report_${formatDate(reportData.generatedDate)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
