/**
 * File Analyzer - Extracts metrics from uploaded CSV/Excel files
 * Generates real data-driven insights for First Opinion diagnosis
 */

export interface ExtractedMetrics {
  fileType: string;
  metricsFound: Record<string, number | string>;
  insights: string[];
  affectedDomains: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class FileAnalyzer {
  /**
   * Analyze uploaded file and extract metrics
   */
  static async analyzeFile(file: File): Promise<ExtractedMetrics> {
    const fileName = file.name.toLowerCase();
    const content = await this.readFile(file);

    // Detect file type and parse accordingly
    if (fileName.includes('attendance') || fileName.includes('register') || fileName.includes('roster')) {
      return this.analyzeAttendance(content, fileName);
    }

    if (fileName.includes('fee') || fileName.includes('payment') || fileName.includes('ledger') || fileName.includes('collection')) {
      return this.analyzeFees(content, fileName);
    }

    if (fileName.includes('mark') || fileName.includes('exam') || fileName.includes('result') || fileName.includes('academic')) {
      return this.analyzeAcademics(content, fileName);
    }

    if (fileName.includes('staff') || fileName.includes('teacher') || fileName.includes('employee')) {
      return this.analyzeStaff(content, fileName);
    }

    if (fileName.includes('complaint') || fileName.includes('feedback') || fileName.includes('parent')) {
      return this.analyzeComplaints(content, fileName);
    }

    if (fileName.includes('inquiry') || fileName.includes('admission') || fileName.includes('enrollment')) {
      return this.analyzeInquiries(content, fileName);
    }

    if (fileName.includes('audit') || fileName.includes('cert') || fileName.includes('compliance') || fileName.includes('safety')) {
      return this.analyzeCompliance(content, fileName);
    }

    // Generic analysis if type not detected
    return this.genericAnalysis(content, fileName);
  }

  /**
   * Read file as text
   */
  private static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Parse CSV content into rows and columns
   */
  private static parseCSV(content: string): string[][] {
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.split(',').map(cell => cell.trim()));
  }

  /**
   * Analyze attendance data
   */
  private static analyzeAttendance(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Attendance Register' };
    const insights: string[] = [];

    // Look for attendance percentage
    let totalDays = 0;
    let presentDays = 0;
    let studentCount = 0;

    rows.forEach((row, idx) => {
      if (idx === 0) return; // Skip header

      // Try to extract attendance info
      const lastCell = row[row.length - 1];
      if (lastCell && !isNaN(parseFloat(lastCell))) {
        const attendance = parseFloat(lastCell);
        if (attendance >= 0 && attendance <= 100) {
          metrics['avgAttendance'] = attendance;
        }
      }

      // Count present markers (common formats: 'P', 'Y', '1', or positive numbers)
      row.forEach(cell => {
        if (cell === 'P' || cell === 'Y' || cell === '1') {
          presentDays++;
        } else if (cell === 'A' || cell === 'N' || cell === '0') {
          totalDays++;
        }
      });
    });

    const avgAttendance = metrics['avgAttendance'] || (totalDays > 0 ? Math.round((presentDays / (presentDays + totalDays)) * 100) : null);
    studentCount = rows.length - 1;

    if (avgAttendance) {
      metrics['avgAttendance'] = avgAttendance;
      if (avgAttendance < 75) {
        insights.push(`Critical: Average attendance is only ${avgAttendance}% - well below 85% district benchmark`);
        insights.push('High absenteeism correlates with lower academic outcomes and higher student stress');
      } else if (avgAttendance < 85) {
        insights.push(`Moderate concern: Attendance at ${avgAttendance}% is below ideal 85% threshold`);
        insights.push('Regular monitoring and intervention programs needed');
      } else {
        insights.push(`Strong attendance at ${avgAttendance}% - exceeds district benchmark`);
      }
    }

    metrics['studentCount'] = studentCount;

    return {
      fileType: 'Attendance Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Staff & HR', 'Academic Excellence', 'Emotional Wellbeing'],
      confidence: avgAttendance ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze fee collection data
   */
  private static analyzeFees(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Fee Collection Data' };
    const insights: string[] = [];

    let totalFee = 0;
    let collectedFee = 0;
    let defaultCount = 0;
    let studentCount = 0;

    rows.forEach((row, idx) => {
      if (idx === 0) return; // Skip header

      // Look for fee amounts (typically numeric columns)
      row.forEach((cell, colIdx) => {
        const value = parseFloat(cell);
        if (!isNaN(value) && value > 0) {
          // If it's a large number, likely fee-related
          if (value > 1000) {
            if (colIdx % 3 === 0) totalFee += value; // Assume pattern: Due, Paid, Default
            else if (colIdx % 3 === 1) collectedFee += value;
            else defaultCount += 1;
          }
        }
      });
    });

    studentCount = Math.max(1, rows.length - 1);
    const collectionRate = totalFee > 0 ? Math.round((collectedFee / totalFee) * 100) : null;
    const defaultRate = totalFee > 0 ? Math.round(((totalFee - collectedFee) / totalFee) * 100) : null;

    if (collectionRate !== null) {
      metrics['collectionRate'] = collectionRate;
      metrics['defaultRate'] = defaultRate;
      metrics['totalFeeExpected'] = totalFee;
      metrics['totalFeeCollected'] = collectedFee;

      if (defaultRate! > 15) {
        insights.push(`Critical: Fee default rate of ${defaultRate}% - severe liquidity impact`);
        insights.push('Automated reminders and flexible payment options urgently needed');
      } else if (defaultRate! > 8) {
        insights.push(`Moderate concern: ${defaultRate}% fee defaults - above healthy 5% threshold`);
        insights.push('Manual follow-up processes creating cash flow delays');
      } else {
        insights.push(`Healthy fee collection at ${collectionRate}% - strong financial discipline`);
      }
    }

    return {
      fileType: 'Fee Collection Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Finance & Fees', 'Admissions & Enrollment'],
      confidence: collectionRate ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze academic performance data
   */
  private static analyzeAcademics(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Academic Performance' };
    const insights: string[] = [];

    let totalMarks = 0;
    let passCount = 0;
    let studentCount = 0;
    const subjectMarks: Record<string, number[]> = {};

    rows.forEach((row, idx) => {
      if (idx === 0) return;

      studentCount++;
      let studentTotal = 0;
      let subjectCount = 0;

      row.forEach((cell, colIdx) => {
        const marks = parseFloat(cell);
        if (!isNaN(marks) && marks >= 0 && marks <= 100) {
          studentTotal += marks;
          totalMarks += marks;
          subjectCount++;
          if (marks >= 40) passCount++;
        }
      });
    });

    const avgMarks = studentCount > 0 ? Math.round(totalMarks / (studentCount * Math.max(1, rows[0]?.length || 5))) : null;
    const passRate = studentCount > 0 ? Math.round((passCount / (studentCount * Math.max(1, rows[0]?.length || 5))) * 100) : null;

    if (avgMarks !== null) {
      metrics['avgMarks'] = avgMarks;
      metrics['passRate'] = passRate;
      metrics['studentCount'] = studentCount;

      if (passRate! < 60) {
        insights.push(`Critical: Only ${passRate}% of students passing - significant learning gaps`);
        insights.push('Diagnostic remedial tracking and early intervention programs needed immediately');
      } else if (passRate! < 75) {
        insights.push(`Concern: ${passRate}% pass rate is below district benchmark of 80%`);
        insights.push('Structured diagnostic assessment and targeted support required');
      } else if (passRate! >= 90) {
        insights.push(`Excellent: ${passRate}% pass rate exceeds district benchmarks`);
        insights.push('Strong academic foundation - focus on extension and enrichment');
      } else {
        insights.push(`Acceptable performance at ${passRate}% pass rate`);
      }
    }

    return {
      fileType: 'Academic Results',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Academic Excellence', 'Teacher Effectiveness', 'Emotional Wellbeing'],
      confidence: avgMarks ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze staff/teacher data
   */
  private static analyzeStaff(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Staff Data' };
    const insights: string[] = [];

    let staffCount = rows.length - 1;
    let retirementCount = 0;
    let experiencedCount = 0;
    let trainingCount = 0;

    rows.forEach((row, idx) => {
      if (idx === 0) return;

      const rowContent = row.join(' ').toLowerCase();
      if (rowContent.includes('left') || rowContent.includes('exit') || rowContent.includes('resign')) {
        retirementCount++;
      }
      if (rowContent.includes('year') || rowContent.includes('exp')) {
        experiencedCount++;
      }
      if (rowContent.includes('train') || rowContent.includes('cert') || rowContent.includes('qualified')) {
        trainingCount++;
      }
    });

    metrics['staffCount'] = staffCount;

    if (staffCount > 0) {
      const turnoverRate = Math.round((retirementCount / staffCount) * 100);
      const trainingRate = Math.round((trainingCount / staffCount) * 100);

      metrics['estimatedTurnover'] = turnoverRate;
      metrics['estimatedTrainingRate'] = trainingRate;

      if (turnoverRate > 20) {
        insights.push(`High staff turnover detected: ~${turnoverRate}% - classroom instability likely`);
        insights.push('Exit interview analysis and workload assessment critical');
      }

      if (trainingRate < 40) {
        insights.push(`Low training uptake: Only ${trainingRate}% with recorded professional development`);
        insights.push('Structured pedagogical training program needed');
      }
    }

    return {
      fileType: 'Staff Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Staff & HR', 'Teacher Effectiveness', 'Academic Excellence'],
      confidence: staffCount > 10 ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze parent complaints/feedback
   */
  private static analyzeComplaints(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Parent Feedback' };
    const insights: string[] = [];

    let complaintCount = rows.length - 1;
    let resolvedCount = 0;
    let resolutionDays = 0;
    const categories: Record<string, number> = {};

    rows.forEach((row, idx) => {
      if (idx === 0) return;

      const rowContent = row.join(' ').toLowerCase();

      // Count categories
      if (rowContent.includes('academic')) categories['academic'] = (categories['academic'] || 0) + 1;
      if (rowContent.includes('fee') || rowContent.includes('payment')) categories['finance'] = (categories['finance'] || 0) + 1;
      if (rowContent.includes('staff') || rowContent.includes('teacher')) categories['staff'] = (categories['staff'] || 0) + 1;
      if (rowContent.includes('resolved') || rowContent.includes('closed')) resolvedCount++;

      // Extract resolution time if present
      row.forEach(cell => {
        const days = parseInt(cell);
        if (!isNaN(days) && days > 0 && days < 30) {
          resolutionDays += days;
        }
      });
    });

    metrics['complaintCount'] = complaintCount;
    metrics['resolutionRate'] = complaintCount > 0 ? Math.round((resolvedCount / complaintCount) * 100) : 0;
    metrics['avgResolutionDays'] = complaintCount > 0 ? Math.round(resolutionDays / complaintCount) : null;

    if (complaintCount > 20) {
      insights.push(`High complaint volume: ${complaintCount} recorded issues`);
      insights.push('Structured grievance resolution SLA and communication protocol needed');
    }

    const avgDays = metrics['avgResolutionDays'];
    if (avgDays && avgDays > 5) {
      insights.push(`Slow resolution: Average ${avgDays} days - eroding parent trust`);
      insights.push('Implement parent portal and automated escalation for faster resolution');
    }

    return {
      fileType: 'Parent Feedback',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Family Support', 'Communication Hub', 'Emotional Wellbeing'],
      confidence: complaintCount > 5 ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze inquiry/admission data
   */
  private static analyzeInquiries(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Inquiry Data' };
    const insights: string[] = [];

    let inquiryCount = rows.length - 1;
    let convertedCount = 0;
    let followupCount = 0;

    rows.forEach((row, idx) => {
      if (idx === 0) return;

      const rowContent = row.join(' ').toLowerCase();
      if (rowContent.includes('converted') || rowContent.includes('enrolled') || rowContent.includes('yes')) {
        convertedCount++;
      }
      if (rowContent.includes('follow') || rowContent.includes('contacted')) {
        followupCount++;
      }
    });

    metrics['inquiryCount'] = inquiryCount;

    if (inquiryCount > 0) {
      const conversionRate = Math.round((convertedCount / inquiryCount) * 100);
      const followupRate = Math.round((followupCount / inquiryCount) * 100);

      metrics['conversionRate'] = conversionRate;
      metrics['followupRate'] = followupRate;

      if (conversionRate < 15) {
        insights.push(`Critical conversion issue: Only ${conversionRate}% of inquiries converting to admissions`);
        insights.push('Parent follow-up workflow and inquiry resolution timing need urgent optimization');
      } else if (conversionRate < 25) {
        insights.push(`Conversion concern: ${conversionRate}% is below benchmark of 30%`);
        insights.push('Fee transparency and payment options likely friction points');
      }

      if (followupRate < 60) {
        insights.push(`Low follow-up rate: Only ${followupRate}% of inquiries being actively pursued`);
        insights.push('Automated inquiry routing and CRM implementation recommended');
      }
    }

    return {
      fileType: 'Inquiry Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Admissions & Enrollment', 'Communication Hub'],
      confidence: inquiryCount > 20 ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze compliance/audit data
   */
  private static analyzeCompliance(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Compliance Audit' };
    const insights: string[] = [];

    const auditPoints = rows.map(r => r.join(' ').toLowerCase());
    let openItems = 0;
    let closedItems = 0;

    auditPoints.forEach(point => {
      if (point.includes('pending') || point.includes('open') || point.includes('due')) {
        openItems++;
      }
      if (point.includes('closed') || point.includes('completed')) {
        closedItems++;
      }
    });

    metrics['totalAuditItems'] = auditPoints.length - 1;
    metrics['pendingItems'] = openItems;

    if (openItems > 5) {
      insights.push(`Compliance concern: ${openItems} pending audit items`);
      insights.push('Regulatory documentation and safety certificates require immediate attention');
    } else if (openItems > 0) {
      insights.push(`${openItems} outstanding compliance items - follow-up needed`);
    } else {
      insights.push('Compliance status appears current - strong governance');
    }

    return {
      fileType: 'Compliance Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Regulatory Compliance', 'Infrastructure & Assets'],
      confidence: 'MEDIUM'
    };
  }

  /**
   * Generic analysis for unknown file types
   * Enhanced to extract DISHA-required metrics
   */
  private static genericAnalysis(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = {
      fileType: 'Operational Data'
    };

    // Enhanced: Try to extract metrics from column headers
    if (rows.length > 0) {
      const headers = rows[0].map(h => h.toLowerCase().trim());
      const dataRow = rows[1] || []; // Get first data row

      // Map of possible column header variations for DISHA metrics
      const metricMappings: Record<string, string[]> = {
        'students_per_classroom': ['students_per_classroom', 'student teacher ratio', 'str', 'students per classroom'],
        'parent_query_response_sla_hours': ['parent_query_response_sla_hours', 'parent response sla', 'parent sla', 'response hours', 'sla hours'],
        'annual_training_hours': ['annual_training_hours', 'training hours', 'cpd hours', 'annual training', 'hours per year'],
        'weekly_planning_hours': ['weekly_planning_hours', 'planning hours', 'weekly planning', 'lesson planning hours']
      };

      // Try to extract each metric
      Object.entries(metricMappings).forEach(([metricKey, variations]) => {
        const headerIndex = headers.findIndex(h =>
          variations.some(variation => h.includes(variation))
        );

        if (headerIndex >= 0 && dataRow[headerIndex]) {
          const value = parseFloat(dataRow[headerIndex]);
          if (!isNaN(value)) {
            metrics[metricKey] = value;
          }
        }
      });

      // Add other useful metrics
      metrics['rowCount'] = rows.length - 1;
      metrics['columnCount'] = rows[0]?.length || 0;
    }

    // Determine confidence based on metrics found
    const metricsCount = Object.keys(metrics).filter(k =>
      k.includes('students_per_classroom') ||
      k.includes('parent_query_response') ||
      k.includes('annual_training') ||
      k.includes('weekly_planning')
    ).length;

    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (metricsCount >= 4) confidence = 'HIGH';
    else if (metricsCount >= 2) confidence = 'MEDIUM';

    return {
      fileType: 'Operational Data',
      metricsFound: metrics,
      insights: [
        metricsCount > 0 ? `✅ Extracted ${metricsCount} DISHA metrics from uploaded file` : 'Uploaded data file detected',
        metricsCount < 4 ? `Note: Some expected metrics may not be in standard format` : 'All DISHA metrics found!'
      ],
      affectedDomains: metricsCount > 0 ? ['Operations', 'Staff', 'Infrastructure'] : [],
      confidence
    };
  }
}

export interface ValidationResult {
  isValid: boolean;
  missingMetrics: string[];
  foundMetrics: string[];
  errorMessage: string;
  requiredMetrics: Array<{
    fieldName: string;
    description: string;
    example: string;
  }>;
}

/**
 * Validate if uploaded file contains required DISHA metrics
 */
export function validateFileMetrics(extractedMetrics: ExtractedMetrics): ValidationResult {
  const requiredMetrics = [
    {
      fieldName: 'students_per_classroom',
      description: 'Student-Teacher Ratio',
      example: '28 (students per classroom)'
    },
    {
      fieldName: 'parent_query_response_sla_hours',
      description: 'Parent Response SLA',
      example: '24 (hours to respond to parent queries)'
    },
    {
      fieldName: 'annual_training_hours',
      description: 'Annual Teacher Training Hours',
      example: '20 (hours per teacher per year)'
    },
    {
      fieldName: 'weekly_planning_hours',
      description: 'Weekly Planning Time',
      example: '4 (hours per week for lesson planning)'
    }
  ];

  const metricsFound = extractedMetrics.metricsFound;
  const missingMetrics: string[] = [];
  const foundMetricsNames: string[] = [];

  // Check for each required metric
  requiredMetrics.forEach(required => {
    if (metricsFound[required.fieldName] !== undefined && metricsFound[required.fieldName] !== null) {
      foundMetricsNames.push(`✅ ${required.description}: ${metricsFound[required.fieldName]}`);
    } else {
      missingMetrics.push(required.fieldName);
    }
  });

  const isValid = missingMetrics.length === 0;

  let errorMessage = '';
  if (!isValid) {
    errorMessage = `❌ Missing ${missingMetrics.length} required data field(s). Your file must include:\n\n`;
    missingMetrics.forEach(metric => {
      const required = requiredMetrics.find(r => r.fieldName === metric);
      if (required) {
        errorMessage += `• ${required.description} - ${required.example}\n`;
      }
    });
    errorMessage += `\nPlease upload a file containing these operational metrics.`;
  }

  return {
    isValid,
    missingMetrics,
    foundMetrics: foundMetricsNames,
    errorMessage,
    requiredMetrics
  };
}

export default FileAnalyzer;
