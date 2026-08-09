/**
 * QR Code Generator
 * Generates unique QR codes for stakeholder assessment access
 * Replaces bulk campaign system with direct scanning to assessment portal
 */

export type StakeholderType = 'teacher' | 'parent' | 'student' | 'admin' | 'other';

export interface QRCodeData {
  assessmentId: string;
  stakeholderType: StakeholderType;
  schoolId: string;
  schoolName: string;
  portalUrl: string; // Where QR leads to
  generatedDate: Date;
  expiresAt?: Date;
  maxScans?: number;
  currentScans: number;
}

export interface QRCodeSet {
  assessmentId: string;
  schoolName: string;
  generatedDate: Date;
  codes: Record<StakeholderType, QRCodeData>;
  printableSheet: string; // HTML for printing all QR codes
}

/**
 * Generate QR code data for a specific stakeholder type
 */
export function generateQRCode(
  assessmentId: string,
  stakeholderType: StakeholderType,
  schoolId: string,
  schoolName: string,
  basePortalUrl: string = 'https://disha-diagnostic.com/assess'
): QRCodeData {
  // Create unique portal link for this stakeholder type
  const portalUrl = `${basePortalUrl}/${assessmentId}/${stakeholderType}`;

  return {
    assessmentId,
    stakeholderType,
    schoolId,
    schoolName,
    portalUrl,
    generatedDate: new Date(),
    currentScans: 0,
  };
}

/**
 * Generate complete QR code set for all stakeholder types
 */
export function generateQRCodeSet(
  assessmentId: string,
  schoolId: string,
  schoolName: string,
  basePortalUrl?: string
): QRCodeSet {
  const stakeholderTypes: StakeholderType[] = ['teacher', 'parent', 'student', 'admin', 'other'];

  const codes: Record<StakeholderType, QRCodeData> = {} as Record<StakeholderType, QRCodeData>;

  stakeholderTypes.forEach(type => {
    codes[type] = generateQRCode(assessmentId, type, schoolId, schoolName, basePortalUrl);
  });

  return {
    assessmentId,
    schoolName,
    generatedDate: new Date(),
    codes,
    printableSheet: generatePrintableQRSheet(codes, schoolName),
  };
}

/**
 * Generate HTML for printable QR code sheet
 */
function generatePrintableQRSheet(codes: Record<StakeholderType, QRCodeData>, schoolName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>QR Code Dispatch Sheet - ${schoolName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          background: white;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #667eea;
        }
        .header h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .instructions {
          background: #f0f4ff;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin-bottom: 30px;
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.6;
        }
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          margin-bottom: 60px;
        }
        .qr-card {
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          background: white;
          page-break-inside: avoid;
        }
        .qr-card.teacher { border-color: #2196f3; }
        .qr-card.parent { border-color: #4caf50; }
        .qr-card.student { border-color: #9c27b0; }
        .qr-card.admin { border-color: #ff9800; }
        .qr-card.other { border-color: #607d8b; }

        .stakeholder-label {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 10px;
          padding: 5px;
          border-radius: 4px;
        }
        .qr-card.teacher .stakeholder-label { background: #e3f2fd; color: #1976d2; }
        .qr-card.parent .stakeholder-label { background: #e8f5e9; color: #388e3c; }
        .qr-card.student .stakeholder-label { background: #f3e5f5; color: #7b1fa2; }
        .qr-card.admin .stakeholder-label { background: #fff3e0; color: #e65100; }
        .qr-card.other .stakeholder-label { background: #eceff1; color: #455a64; }

        .qr-placeholder {
          width: 200px;
          height: 200px;
          margin: 15px auto;
          background: #f5f5f5;
          border: 2px dashed #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 12px;
          border-radius: 4px;
        }
        .qr-title {
          font-size: 16px;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 10px;
          color: #333;
        }
        .qr-description {
          font-size: 12px;
          color: #666;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        .access-link {
          font-size: 10px;
          color: #999;
          word-break: break-all;
          background: #f9f9f9;
          padding: 8px;
          border-radius: 4px;
          margin-top: 10px;
          font-family: monospace;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #999;
        }
        @media print {
          body { padding: 0; }
          .qr-grid { gap: 20px; }
          .page-break { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>DISHA Assessment QR Code Sheet</h1>
          <p>${schoolName}</p>
          <p style="font-size: 12px; margin-top: 10px;">Generated: ${new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <!-- Instructions -->
        <div class="instructions">
          <strong>📋 Distribution Instructions:</strong>
          <ul style="margin-left: 20px; margin-top: 10px;">
            <li>Print this sheet and distribute physical copies to stakeholders</li>
            <li>Each QR code is specific to a stakeholder type (Teachers, Parents, Students, Admin, Other)</li>
            <li>Stakeholders scan the appropriate QR code for their role</li>
            <li>QR code leads to assessment portal where they select name/class/section</li>
            <li>Students: Name, Class, Section (no email/phone for privacy)</li>
            <li>Teachers: Name (no personal details required)</li>
            <li>Parents: Can use email or phone for contact (optional)</li>
            <li>Keep a copy for tracking scan counts and responses</li>
          </ul>
        </div>

        <!-- QR Codes Grid -->
        <div class="qr-grid">
          ${generateQRCardHTML('teacher', 'Teachers', codes.teacher)}
          ${generateQRCardHTML('parent', 'Parents / Guardians', codes.parent)}
          ${generateQRCardHTML('student', 'Students (Grade 8+)', codes.student)}
          ${generateQRCardHTML('admin', 'Admin Staff', codes.admin)}
        </div>

        <!-- Other stakeholders -->
        <div style="page-break-inside: avoid;">
          ${generateQRCardHTML('other', 'Other Stakeholders', codes.other)}
        </div>

        <!-- Tracking Table -->
        <div style="margin-top: 60px; page-break-inside: avoid;">
          <h2 style="font-size: 18px; margin-bottom: 15px; color: #333;">Response Tracking Sheet</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Stakeholder Type</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 12px;">Expected</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 12px;">Actual Responses</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 12px;">% Complete</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px;">Teachers</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px;"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px;">Parents</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px;"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px;">Students</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px;"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px;">Admin</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px;"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px;">Other</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">_____</td>
                <td style="border: 1px solid #ddd; padding: 10px;"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>DISHA Assessment Portal | QR Code Dispatch Sheet</p>
          <p>For support: assessments@disha-framework.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate individual QR card HTML
 */
function generateQRCardHTML(type: StakeholderType, label: string, qrData: QRCodeData): string {
  return `
    <div class="qr-card ${type}">
      <div class="stakeholder-label">${label}</div>
      <div class="qr-placeholder">
        QR Code<br/>(html2canvas renders here)
      </div>
      <div class="qr-title">${label}</div>
      <div class="qr-description">
        Scan this QR code to access the ${label.toLowerCase()} assessment form.
      </div>
      <div class="access-link">${qrData.portalUrl}</div>
    </div>
  `;
}

/**
 * Export QR code set as printable HTML file
 */
export function downloadQRCodeSheet(qrSet: QRCodeSet): void {
  const blob = new Blob([qrSet.printableSheet], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${qrSet.schoolName}_QR_Code_Dispatch_${formatDate(qrSet.generatedDate)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Track QR code scans
 */
export function trackQRScan(qrCode: QRCodeData): void {
  qrCode.currentScans++;
  console.log(`QR Code scanned for ${qrCode.stakeholderType}: ${qrCode.currentScans} total scans`);
}

/**
 * Get QR code status/analytics
 */
export function getQRCodeAnalytics(qrSet: QRCodeSet): Record<string, any> {
  const analytics: Record<string, any> = {
    assessmentId: qrSet.assessmentId,
    schoolName: qrSet.schoolName,
    generatedDate: qrSet.generatedDate,
    byType: {},
  };

  Object.entries(qrSet.codes).forEach(([type, code]) => {
    analytics.byType[type] = {
      scans: code.currentScans,
      url: code.portalUrl,
      generated: code.generatedDate,
    };
  });

  const totalScans = Object.values(qrSet.codes).reduce((sum, code) => sum + code.currentScans, 0);
  analytics.totalScans = totalScans;

  return analytics;
}

/**
 * Helper: Format date
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Generate secure unique assessment ID
 */
export function generateAssessmentId(): string {
  return `asm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate QR code portal URL
 */
export function validatePortalUrl(url: string): boolean {
  try {
    new URL(url);
    return url.includes('/assess/');
  } catch {
    return false;
  }
}
