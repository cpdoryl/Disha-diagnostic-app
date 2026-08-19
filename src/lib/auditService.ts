/**
 * Audit Service - Compliance & Audit Logging
 * Handles all audit trail operations for regulatory compliance
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface AuditEvent {
  action: string; // e.g., CHECKUP_SUBMITTED, ASSESSMENT_CREATED, REPORT_GENERATED
  entityType: string; // e.g., checkup, assessment, report, simulation
  entityId: string; // ID of the entity
  schoolId: string;
  userId?: string; // Who performed the action
  userRole?: string;
  changes?: Record<string, any>; // Before/after state
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
  };
}

/**
 * Log an audit event
 * This function is called after every significant operation
 */
export const logAuditEvent = async (
  schoolId: string,
  action: string,
  entityType: string,
  entityId: string,
  userId?: string,
  changes?: Record<string, any>
): Promise<void> => {
  try {
    const auditRef = doc(collection(db, 'schools', schoolId, 'auditLogs'));

    // Get current user info if available
    const currentUser = auth.currentUser;
    const userEmail = userId || currentUser?.email || 'system';

    await setDoc(auditRef, {
      timestamp: serverTimestamp(),
      action: action,
      entityType: entityType,
      entityId: entityId,
      schoolId: schoolId,
      userId: userId || currentUser?.uid || 'system',
      userEmail: userEmail,
      userRole: currentUser?.customClaims?.role || 'unknown',
      changes: changes || {},
      metadata: {
        ipAddress: await getIpAddress(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });

    console.log(
      `✓ Audit logged: ${action} on ${entityType} ${entityId} by ${userEmail}`
    );
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw - audit logging shouldn't break main flow
  }
};

/**
 * Get audit logs for a school
 */
export const getSchoolAuditLogs = async (
  schoolId: string,
  limitCount: number = 100
): Promise<any[]> => {
  try {
    const auditRef = collection(db, 'schools', schoolId, 'auditLogs');
    const q = query(
      auditRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Get audit logs for specific entity
 */
export const getEntityAuditTrail = async (
  schoolId: string,
  entityType: string,
  entityId: string
): Promise<any[]> => {
  try {
    const auditRef = collection(db, 'schools', schoolId, 'auditLogs');
    const q = query(
      auditRef,
      where('entityType', '==', entityType),
      where('entityId', '==', entityId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching entity audit trail:', error);
    throw error;
  }
};

/**
 * Get audit logs by action
 */
export const getAuditLogsByAction = async (
  schoolId: string,
  action: string,
  limitCount: number = 50
): Promise<any[]> => {
  try {
    const auditRef = collection(db, 'schools', schoolId, 'auditLogs');
    const q = query(
      auditRef,
      where('action', '==', action),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching audit logs by action:', error);
    throw error;
  }
};

/**
 * Get audit logs by user
 */
export const getAuditLogsByUser = async (
  schoolId: string,
  userId: string,
  limitCount: number = 50
): Promise<any[]> => {
  try {
    const auditRef = collection(db, 'schools', schoolId, 'auditLogs');
    const q = query(
      auditRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching audit logs by user:', error);
    throw error;
  }
};

/**
 * Get user's IP address (best effort)
 */
const getIpAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    // If fetch fails, return null - it's okay
    return null;
  }
};

/**
 * Audit log wrapper for common operations
 * Use these pre-configured loggers for consistency
 */

export const auditLoggers = {
  checkupSubmitted: (schoolId: string, checkupId: string, userId: string) =>
    logAuditEvent(schoolId, 'CHECKUP_SUBMITTED', 'checkup', checkupId, userId),

  assessmentCreated: (schoolId: string, assessmentId: string, userId: string) =>
    logAuditEvent(schoolId, 'ASSESSMENT_CREATED', 'assessment', assessmentId, userId),

  responseSubmitted: (schoolId: string, responseId: string, userId: string) =>
    logAuditEvent(schoolId, 'RESPONSE_SUBMITTED', 'response', responseId, userId),

  reportGenerated: (schoolId: string, reportId: string, userId: string) =>
    logAuditEvent(schoolId, 'REPORT_GENERATED', 'report', reportId, userId),

  simulationCreated: (schoolId: string, simulationId: string, userId: string) =>
    logAuditEvent(schoolId, 'SIMULATION_CREATED', 'simulation', simulationId, userId),

  userUpdated: (schoolId: string, userId: string, changes: any) =>
    logAuditEvent(schoolId, 'USER_UPDATED', 'user', userId, userId, changes),

  schoolUpdated: (schoolId: string, changes: any) =>
    logAuditEvent(schoolId, 'SCHOOL_UPDATED', 'school', schoolId, undefined, changes)
};

/**
 * Export audit data (compliance/reporting)
 */
export const exportAuditLogs = async (
  schoolId: string,
  format: 'json' | 'csv' = 'json'
): Promise<string> => {
  try {
    const logs = await getSchoolAuditLogs(schoolId, 1000);

    if (format === 'csv') {
      return convertAuditLogsToCSV(logs);
    } else {
      return JSON.stringify(logs, null, 2);
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
};

/**
 * Convert audit logs to CSV format
 */
const convertAuditLogsToCSV = (logs: any[]): string => {
  const headers = [
    'Timestamp',
    'Action',
    'EntityType',
    'EntityId',
    'UserId',
    'UserEmail',
    'UserRole',
    'Changes',
    'IPAddress'
  ];

  const rows = logs.map((log) => [
    new Date(log.timestamp?.toDate?.()).toISOString(),
    log.action,
    log.entityType,
    log.entityId,
    log.userId,
    log.userEmail,
    log.userRole,
    JSON.stringify(log.changes || {}),
    log.metadata?.ipAddress || 'N/A'
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
};

/**
 * Generate audit report
 */
export const generateAuditReport = async (schoolId: string): Promise<any> => {
  try {
    const allLogs = await getSchoolAuditLogs(schoolId, 1000);

    const report = {
      schoolId,
      generatedAt: new Date().toISOString(),
      totalEvents: allLogs.length,
      eventsByAction: groupEventsByAction(allLogs),
      eventsByUser: groupEventsByUser(allLogs),
      eventsByType: groupEventsByType(allLogs),
      eventsByDay: groupEventsByDay(allLogs),
      summaryStats: {
        lastEvent: allLogs[0]?.timestamp,
        firstEvent: allLogs[allLogs.length - 1]?.timestamp,
        uniqueUsers: new Set(allLogs.map((log) => log.userId)).size
      }
    };

    return report;
  } catch (error) {
    console.error('Error generating audit report:', error);
    throw error;
  }
};

/**
 * Helper functions for audit analysis
 */

const groupEventsByAction = (logs: any[]): Record<string, number> => {
  const grouped: Record<string, number> = {};
  logs.forEach((log) => {
    grouped[log.action] = (grouped[log.action] || 0) + 1;
  });
  return grouped;
};

const groupEventsByUser = (logs: any[]): Record<string, number> => {
  const grouped: Record<string, number> = {};
  logs.forEach((log) => {
    const email = log.userEmail || 'unknown';
    grouped[email] = (grouped[email] || 0) + 1;
  });
  return grouped;
};

const groupEventsByType = (logs: any[]): Record<string, number> => {
  const grouped: Record<string, number> = {};
  logs.forEach((log) => {
    grouped[log.entityType] = (grouped[log.entityType] || 0) + 1;
  });
  return grouped;
};

const groupEventsByDay = (logs: any[]): Record<string, number> => {
  const grouped: Record<string, number> = {};
  logs.forEach((log) => {
    const date = log.timestamp?.toDate?.()?.toLocaleDateString?.() || 'unknown';
    grouped[date] = (grouped[date] || 0) + 1;
  });
  return grouped;
};
