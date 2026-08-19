/**
 * Report Service - Stage 2: Comprehensive 14D Reports
 * Handles all Firestore operations for reports and analysis
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  Unsubscribe,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { logAuditEvent } from './auditService';

export interface ReportData {
  reportType: 'Comprehensive14D';
  assessmentId: string;
  createdBy: string;
  schoolId: string;
  executiveSummary: any;
  dimensionAnalysis: Record<string, any>;
  comparativeAnalysis?: any;
  strategicInsights?: any;
  strategicRoadmap?: any;
  impactProjections?: any;
}

/**
 * Save report to Firestore
 * Typically called by Cloud Function: generate14DReport
 */
export const saveReportToFirestore = async (
  schoolId: string,
  reportData: ReportData
): Promise<string> => {
  try {
    const reportRef = doc(collection(db, 'schools', schoolId, 'reports'));

    await setDoc(reportRef, {
      reportType: reportData.reportType,
      assessmentId: reportData.assessmentId,
      createdBy: reportData.createdBy,
      generatedAt: serverTimestamp(),
      status: 'PUBLISHED',
      executiveSummary: reportData.executiveSummary,
      dimensionAnalysis: reportData.dimensionAnalysis,
      comparativeAnalysis: reportData.comparativeAnalysis || {},
      strategicInsights: reportData.strategicInsights || {},
      strategicRoadmap: reportData.strategicRoadmap || {},
      impactProjections: reportData.impactProjections || {},
      updatedAt: serverTimestamp()
    });

    console.log(`✓ Report saved: ${reportRef.id}`);

    // Log audit event
    await logAuditEvent(
      schoolId,
      'REPORT_GENERATED',
      'report',
      reportRef.id,
      reportData.createdBy
    );

    return reportRef.id;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

/**
 * Get report by ID
 */
export const getReport = async (
  schoolId: string,
  reportId: string
): Promise<any> => {
  try {
    const reportRef = doc(db, 'schools', schoolId, 'reports', reportId);
    const snapshot = await getDoc(reportRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
};

/**
 * Get all reports for a school
 */
export const getSchoolReports = async (
  schoolId: string,
  status: 'PUBLISHED' | 'ARCHIVED' | 'ALL' = 'PUBLISHED'
): Promise<any[]> => {
  try {
    let reportsRef = collection(db, 'schools', schoolId, 'reports');
    let q;

    if (status === 'ALL') {
      q = query(reportsRef, orderBy('generatedAt', 'desc'));
    } else {
      q = query(
        reportsRef,
        where('status', '==', status),
        orderBy('generatedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Get latest report for a school
 */
export const getLatestReport = async (schoolId: string): Promise<any> => {
  try {
    const reports = await getSchoolReports(schoolId, 'PUBLISHED');
    return reports.length > 0 ? reports[0] : null;
  } catch (error) {
    console.error('Error fetching latest report:', error);
    throw error;
  }
};

/**
 * Get reports for specific assessment
 */
export const getAssessmentReports = async (
  schoolId: string,
  assessmentId: string
): Promise<any[]> => {
  try {
    const reportsRef = collection(db, 'schools', schoolId, 'reports');
    const q = query(
      reportsRef,
      where('assessmentId', '==', assessmentId),
      orderBy('generatedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching assessment reports:', error);
    throw error;
  }
};

/**
 * Subscribe to report updates (real-time)
 */
export const subscribeToReport = (
  schoolId: string,
  reportId: string,
  callback: (report: any) => void
): Unsubscribe => {
  try {
    const reportRef = doc(db, 'schools', schoolId, 'reports', reportId);

    return onSnapshot(reportRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data()
        });
      }
    });
  } catch (error) {
    console.error('Error subscribing to report:', error);
    throw error;
  }
};

/**
 * Update report (add notes, mark as archived, etc.)
 */
export const updateReport = async (
  schoolId: string,
  reportId: string,
  updates: Record<string, any>
): Promise<void> => {
  try {
    const reportRef = doc(db, 'schools', schoolId, 'reports', reportId);

    await updateDoc(reportRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    console.log(`✓ Report ${reportId} updated`);

    // Log audit event
    await logAuditEvent(
      schoolId,
      'REPORT_UPDATED',
      'report',
      reportId,
      undefined,
      updates
    );
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

/**
 * Archive report (move to archived status)
 */
export const archiveReport = async (
  schoolId: string,
  reportId: string,
  userId: string
): Promise<void> => {
  try {
    const reportRef = doc(db, 'schools', schoolId, 'reports', reportId);

    await updateDoc(reportRef, {
      status: 'ARCHIVED',
      archivedAt: serverTimestamp(),
      archivedBy: userId
    });

    console.log(`✓ Report ${reportId} archived`);

    // Log audit event
    await logAuditEvent(
      schoolId,
      'REPORT_ARCHIVED',
      'report',
      reportId,
      userId
    );
  } catch (error) {
    console.error('Error archiving report:', error);
    throw error;
  }
};

/**
 * Delete report (soft delete)
 */
export const deleteReport = async (
  schoolId: string,
  reportId: string,
  userId: string
): Promise<void> => {
  try {
    const reportRef = doc(db, 'schools', schoolId, 'reports', reportId);

    await updateDoc(reportRef, {
      status: 'DELETED',
      deletedAt: serverTimestamp(),
      deletedBy: userId
    });

    console.log(`✓ Report ${reportId} deleted`);

    // Log audit event
    await logAuditEvent(
      schoolId,
      'REPORT_DELETED',
      'report',
      reportId,
      userId
    );
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

/**
 * Get report comparison (compare two reports)
 */
export const compareReports = async (
  schoolId: string,
  reportId1: string,
  reportId2: string
): Promise<any> => {
  try {
    const report1 = await getReport(schoolId, reportId1);
    const report2 = await getReport(schoolId, reportId2);

    if (!report1 || !report2) {
      throw new Error('One or both reports not found');
    }

    const comparison: any = {
      report1Id: reportId1,
      report2Id: reportId2,
      generatedAt: new Date(),
      dimensionComparison: {}
    };

    // Compare each dimension
    const dimensions = Object.keys(report1.dimensionAnalysis || {});
    for (const dim of dimensions) {
      const score1 = report1.dimensionAnalysis[dim]?.subjectiveAnalysis?.averageScore || 0;
      const score2 = report2.dimensionAnalysis[dim]?.subjectiveAnalysis?.averageScore || 0;

      comparison.dimensionComparison[dim] = {
        report1Score: score1,
        report2Score: score2,
        change: score2 - score1,
        percentChange: score1 > 0 ? ((score2 - score1) / score1) * 100 : 0
      };
    }

    return comparison;
  } catch (error) {
    console.error('Error comparing reports:', error);
    throw error;
  }
};

/**
 * Export report (as JSON or PDF)
 */
export const exportReport = async (
  schoolId: string,
  reportId: string,
  format: 'json' | 'csv' = 'json'
): Promise<string> => {
  try {
    const report = await getReport(schoolId, reportId);

    if (!report) {
      throw new Error('Report not found');
    }

    if (format === 'csv') {
      return convertReportToCSV(report);
    } else {
      return JSON.stringify(report, null, 2);
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};

/**
 * Convert report to CSV format
 */
const convertReportToCSV = (report: any): string => {
  const rows: string[] = [];

  rows.push('COMPREHENSIVE 14D ASSESSMENT REPORT');
  rows.push(`Generated: ${report.generatedAt?.toDate?.().toLocaleString?.()}`);
  rows.push(`Assessment ID: ${report.assessmentId}`);
  rows.push('');

  rows.push('EXECUTIVE SUMMARY');
  rows.push(`Overall Health Index, ${report.executiveSummary?.overallHealthIndex}`);
  rows.push(`Status, ${report.executiveSummary?.overallStatus}`);
  rows.push('');

  rows.push('DIMENSION ANALYSIS');
  rows.push('Dimension,Score,Status');

  const dims = report.dimensionAnalysis || {};
  for (const [dim, data] of Object.entries(dims)) {
    const score = (data as any)?.subjectiveAnalysis?.averageScore || 0;
    const status = (data as any)?.status || 'Unknown';
    rows.push(`${dim},${score},${status}`);
  }

  return rows.join('\n');
};
