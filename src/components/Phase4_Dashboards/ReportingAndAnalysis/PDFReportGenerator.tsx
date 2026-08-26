/**
 * PDF Report Generator Component
 * Phase 4: Days 12-14
 *
 * Export assessment reports as PDF documents
 */

import React, { useState } from 'react';

interface ReportData {
  schoolName: string;
  assessmentDate: string;
  respondentCount: number;
  overallScore: number;
  dimensions: Array<{
    id: string;
    name: string;
    realityScore: number;
    perceptionScore: number;
    gap: number;
  }>;
  recommendations: string[];
  actionPlan: string[];
}

interface PDFReportGeneratorProps {
  reportData: ReportData;
  schoolId: string;
  assessmentId: string;
}

export const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
  reportData,
  schoolId,
  assessmentId,
}) => {
  const [generating, setGenerating] = useState(false);
  const [reportFormat, setReportFormat] = useState<'full' | 'executive' | 'detailed'>('full');

  const generatePDF = async () => {
    setGenerating(true);
    try {
      // Dynamically import jsPDF to avoid bundling if not available
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add a new page if needed
      const checkPageBreak = (spaceNeeded: number) => {
        if (yPosition + spaceNeeded > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // ===== COVER PAGE =====
      if (reportFormat === 'full' || reportFormat === 'executive') {
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('DISHA Diagnostic Report', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 20;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`${reportData.schoolName}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Assessment Date: ${reportData.assessmentDate}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;
        doc.text(`Respondents: ${reportData.respondentCount}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 30;
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', 20, yPosition);

        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryText = `This comprehensive diagnostic assessment evaluates your school across 14 key dimensions, comparing stakeholder perception with operational reality. The overall health index is ${reportData.overallScore.toFixed(1)}/100, indicating ${reportData.overallScore > 75 ? 'strong' : reportData.overallScore > 60 ? 'adequate' : 'needs improvement'} performance.`;
        doc.setTextColor(80);
        const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
        doc.text(splitSummary, 20, yPosition);
        yPosition += splitSummary.length * 5 + 15;

        doc.addPage();
        yPosition = 20;
      }

      // ===== DIMENSION SCORES TABLE =====
      checkPageBreak(80);
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Dimension Analysis', 20, yPosition);
      yPosition += 10;

      const tableData = reportData.dimensions.map((dim) => [
        dim.id,
        dim.name.substring(0, 25),
        dim.realityScore.toFixed(1),
        dim.perceptionScore.toFixed(1),
        dim.gap.toFixed(1),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['ID', 'Dimension', 'Reality', 'Perception', 'Gap']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [80, 80, 80],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 20, right: 20 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // ===== GAP ANALYSIS =====
      if (reportFormat === 'full' || reportFormat === 'detailed') {
        checkPageBreak(80);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Gap Analysis', 20, yPosition);
        yPosition += 10;

        const criticalGaps = reportData.dimensions.filter((d) => d.gap >= 25);
        const highGaps = reportData.dimensions.filter((d) => d.gap >= 15 && d.gap < 25);

        if (criticalGaps.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(211, 47, 47);
          doc.text('Critical Gaps (≥25):', 20, yPosition);
          yPosition += 7;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80);
          criticalGaps.forEach((gap) => {
            const gapText = `${gap.id}: ${gap.name} - Gap of ${gap.gap.toFixed(1)} points`;
            doc.text(gapText, 25, yPosition);
            yPosition += 6;
          });
          yPosition += 5;
        }

        if (highGaps.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(245, 124, 0);
          doc.text('High Gaps (15-24):', 20, yPosition);
          yPosition += 7;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80);
          highGaps.slice(0, 3).forEach((gap) => {
            const gapText = `${gap.id}: ${gap.name} - Gap of ${gap.gap.toFixed(1)} points`;
            doc.text(gapText, 25, yPosition);
            yPosition += 6;
          });
        }
      }

      // ===== RECOMMENDATIONS =====
      if (reportFormat === 'full') {
        checkPageBreak(100);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Key Recommendations', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        reportData.recommendations.slice(0, 5).forEach((rec, idx) => {
          checkPageBreak(15);
          const recText = `${idx + 1}. ${rec}`;
          const splitRec = doc.splitTextToSize(recText, pageWidth - 40);
          doc.text(splitRec, 25, yPosition);
          yPosition += splitRec.length * 5 + 3;
        });
      }

      // ===== 90-DAY ACTION PLAN =====
      checkPageBreak(100);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('90-Day Action Plan', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      reportData.actionPlan.slice(0, 6).forEach((action, idx) => {
        checkPageBreak(15);
        const actionText = `${idx + 1}. ${action}`;
        const splitAction = doc.splitTextToSize(actionText, pageWidth - 40);
        doc.text(splitAction, 25, yPosition);
        yPosition += splitAction.length * 5 + 3;
      });

      // ===== FOOTER =====
      const pageCount = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
      }

      // Save the PDF
      const filename = `DISHA-Report-${schoolId}-${assessmentId}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please ensure jsPDF is installed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">📄 Export Report</h2>

      {/* Report Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Report Format:</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="executive"
              checked={reportFormat === 'executive'}
              onChange={(e) => setReportFormat(e.target.value as any)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">
              <strong>Executive Summary</strong> - High-level overview (2-3 pages)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="detailed"
              checked={reportFormat === 'detailed'}
              onChange={(e) => setReportFormat(e.target.value as any)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">
              <strong>Detailed Analysis</strong> - Full dimension breakdown (4-5 pages)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="full"
              checked={reportFormat === 'full'}
              onChange={(e) => setReportFormat(e.target.value as any)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">
              <strong>Complete Report</strong> - All details + action plan (6-8 pages)
            </span>
          </label>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-gray-50 rounded p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Report Details:</h3>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
          <div>
            <p className="text-xs text-gray-600">SCHOOL</p>
            <p className="font-medium">{reportData.schoolName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">DATE</p>
            <p className="font-medium">{reportData.assessmentDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">RESPONDENTS</p>
            <p className="font-medium">{reportData.respondentCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">HEALTH INDEX</p>
            <p className="font-medium text-blue-600">{reportData.overallScore.toFixed(1)}/100</p>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={generatePDF}
        disabled={generating}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Generating PDF...
          </span>
        ) : (
          '📥 Download PDF Report'
        )}
      </button>

      {/* Footer Note */}
      <p className="text-xs text-gray-600 text-center mt-4">
        Report will be downloaded to your device. File format: PDF
      </p>
    </div>
  );
};

export default PDFReportGenerator;
