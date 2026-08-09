/**
 * Test Data Simulator
 * Simulates multi-user responses for testing the assessment workflow
 * Use in browser console for development/testing only
 */

import { AssessmentProgress, StakeholderType } from './multiUserAssessment';

export interface SimulationConfig {
  expectedTotal: number;
  responses: {
    teacher: number;
    parent: number;
    student: number;
    admin: number;
    other: number;
  };
}

/**
 * Simulate a single response being added
 * Updates localStorage immediately
 */
export function simulateSingleResponse(
  schoolId: string,
  stakeholderType: StakeholderType
): AssessmentProgress | null {
  const progressKey = `assessment_progress_${schoolId}`;
  const progressJson = localStorage.getItem(progressKey);

  if (!progressJson) {
    console.error('No assessment progress found. Create assessment first.');
    return null;
  }

  try {
    const progress = JSON.parse(progressJson) as AssessmentProgress;

    // Increment the stakeholder count
    progress.actualRespondents[stakeholderType]++;
    progress.totalActual++;

    // Update timestamp
    const now = new Date();
    progress.lastResponseTime = now;

    // Save back to localStorage
    localStorage.setItem(progressKey, JSON.stringify(progress));

    console.log(`✅ Simulated response from ${stakeholderType}. Total now: ${progress.totalActual}`);
    return progress;
  } catch (error) {
    console.error('Error simulating response:', error);
    return null;
  }
}

/**
 * Simulate multiple responses at once
 * Useful for testing with different scenarios
 */
export function simulateMultipleResponses(
  schoolId: string,
  responses: {
    teacher?: number;
    parent?: number;
    student?: number;
    admin?: number;
    other?: number;
  }
): AssessmentProgress | null {
  const progressKey = `assessment_progress_${schoolId}`;
  const progressJson = localStorage.getItem(progressKey);

  if (!progressJson) {
    console.error('No assessment progress found. Create assessment first.');
    return null;
  }

  try {
    const progress = JSON.parse(progressJson) as AssessmentProgress;

    // Add responses for each type
    if (responses.teacher) progress.actualRespondents.teacher += responses.teacher;
    if (responses.parent) progress.actualRespondents.parent += responses.parent;
    if (responses.student) progress.actualRespondents.student += responses.student;
    if (responses.admin) progress.actualRespondents.admin += responses.admin;
    if (responses.other) progress.actualRespondents.other += responses.other;

    // Recalculate total
    progress.totalActual =
      progress.actualRespondents.teacher +
      progress.actualRespondents.parent +
      progress.actualRespondents.student +
      progress.actualRespondents.admin +
      progress.actualRespondents.other;

    // Update timestamp
    const now = new Date();
    progress.lastResponseTime = now;

    // Save back to localStorage
    localStorage.setItem(progressKey, JSON.stringify(progress));

    const summary = Object.entries(responses)
      .filter(([, count]) => count && count > 0)
      .map(([type, count]) => `${type}: +${count}`)
      .join(', ');

    console.log(`✅ Simulated multiple responses: ${summary}`);
    console.log(`   Total now: ${progress.totalActual}/${
      localStorage.getItem(`assessment_config_${schoolId}`)
        ? JSON.parse(localStorage.getItem(`assessment_config_${schoolId}`)!).totalExpected
        : '?'
    }`);

    return progress;
  } catch (error) {
    console.error('Error simulating responses:', error);
    return null;
  }
}

/**
 * Simulate responses at specific intervals
 * Useful for testing real-time dashboard updates
 */
export function simulateResponsesOverTime(
  schoolId: string,
  totalResponses: number,
  intervalMs: number = 2000
): void {
  let count = 0;
  const stakeholderTypes: StakeholderType[] = ['teacher', 'parent', 'student', 'admin', 'other'];
  let currentTypeIndex = 0;

  const interval = setInterval(() => {
    if (count >= totalResponses) {
      clearInterval(interval);
      console.log(`✅ Simulation complete: ${totalResponses} responses added`);
      return;
    }

    const type = stakeholderTypes[currentTypeIndex % stakeholderTypes.length];
    simulateSingleResponse(schoolId, type);

    count++;
    currentTypeIndex++;
  }, intervalMs);

  console.log(`🔄 Starting simulation: ${totalResponses} responses over ${(totalResponses * intervalMs) / 1000}s`);
}

/**
 * Get current progress summary
 */
export function getSimulationStatus(schoolId: string): {
  expected: number;
  actual: number;
  percentage: number;
  breakdown: Record<StakeholderType, { actual: number; expected: number }>;
} | null {
  const configKey = `assessment_config_${schoolId}`;
  const progressKey = `assessment_progress_${schoolId}`;

  const configJson = localStorage.getItem(configKey);
  const progressJson = localStorage.getItem(progressKey);

  if (!configJson || !progressJson) {
    console.error('Assessment data not found. Create assessment first.');
    return null;
  }

  try {
    const config = JSON.parse(configJson);
    const progress = JSON.parse(progressJson) as AssessmentProgress;

    return {
      expected: config.totalExpected,
      actual: progress.totalActual,
      percentage: Math.round((progress.totalActual / config.totalExpected) * 100),
      breakdown: {
        teacher: {
          actual: progress.actualRespondents.teacher,
          expected: config.expectedRespondents.teacher,
        },
        parent: {
          actual: progress.actualRespondents.parent,
          expected: config.expectedRespondents.parent,
        },
        student: {
          actual: progress.actualRespondents.student,
          expected: config.expectedRespondents.student,
        },
        admin: {
          actual: progress.actualRespondents.admin,
          expected: config.expectedRespondents.admin,
        },
        other: {
          actual: progress.actualRespondents.other,
          expected: config.expectedRespondents.other,
        },
      },
    };
  } catch (error) {
    console.error('Error getting simulation status:', error);
    return null;
  }
}

/**
 * Reset responses to zero (keep configuration)
 */
export function resetResponses(schoolId: string): AssessmentProgress | null {
  const progressKey = `assessment_progress_${schoolId}`;
  const progressJson = localStorage.getItem(progressKey);

  if (!progressJson) {
    console.error('No assessment progress found.');
    return null;
  }

  try {
    const progress = JSON.parse(progressJson) as AssessmentProgress;

    // Reset all respondent counts to zero
    progress.actualRespondents.teacher = 0;
    progress.actualRespondents.parent = 0;
    progress.actualRespondents.student = 0;
    progress.actualRespondents.admin = 0;
    progress.actualRespondents.other = 0;
    progress.totalActual = 0;
    progress.isLocked = false;

    // Save back to localStorage
    localStorage.setItem(progressKey, JSON.stringify(progress));

    console.log('✅ All responses reset to 0. Assessment unlocked.');
    return progress;
  } catch (error) {
    console.error('Error resetting responses:', error);
    return null;
  }
}

/**
 * Clear all assessment data
 */
export function clearAllData(schoolId: string): void {
  localStorage.removeItem(`assessment_config_${schoolId}`);
  localStorage.removeItem(`assessment_progress_${schoolId}`);
  console.log('✅ All assessment data cleared.');
}

/**
 * Print a nice dashboard to console
 */
export function printDashboard(schoolId: string): void {
  const status = getSimulationStatus(schoolId);

  if (!status) {
    console.log('No assessment found.');
    return;
  }

  console.clear();
  console.log(
    '%c 📊 ASSESSMENT DASHBOARD 📊 ',
    'background: #007bff; color: white; font-size: 16px; font-weight: bold; padding: 10px;'
  );
  console.log('');

  console.log('%c Overall Progress', 'font-size: 14px; font-weight: bold; color: #007bff;');
  console.log(`${status.actual}/${status.expected} responses (${status.percentage}%)`);
  console.log('');

  console.log('%c Breakdown by Stakeholder Type', 'font-size: 14px; font-weight: bold; color: #007bff;');
  Object.entries(status.breakdown).forEach(([type, data]) => {
    const pct = Math.round((data.actual / data.expected) * 100);
    const status_icon = data.actual === data.expected ? '✅' : data.actual > 0 ? '⏳' : '○';
    console.log(`${status_icon} ${type}: ${data.actual}/${data.expected} (${pct}%)`);
  });
  console.log('');
}

/**
 * Export test data (for analytics or debugging)
 */
export function exportTestData(schoolId: string): object | null {
  const configJson = localStorage.getItem(`assessment_config_${schoolId}`);
  const progressJson = localStorage.getItem(`assessment_progress_${schoolId}`);

  if (!configJson || !progressJson) {
    console.error('Assessment data not found.');
    return null;
  }

  return {
    config: JSON.parse(configJson),
    progress: JSON.parse(progressJson),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Usage Guide
 */
export const USAGE_GUIDE = `
╔════════════════════════════════════════════════════════════════╗
║           TEST DATA SIMULATOR - USAGE GUIDE                    ║
╚════════════════════════════════════════════════════════════════╝

1. CREATE AN ASSESSMENT FIRST
   - Visit: https://disha-diagnostics.web.app/
   - Click "Multi-User 14D Assessment"
   - Set respondent counts (e.g., Teachers: 3, Parents: 4)
   - Click "Proceed to Deployment"

2. THEN USE THESE COMMANDS IN BROWSER CONSOLE (F12)

📌 SIMULATE SINGLE RESPONSE:
   simulateSingleResponse('unknown', 'teacher')
   → Adds 1 teacher response

📌 SIMULATE MULTIPLE RESPONSES:
   simulateMultipleResponses('unknown', {
     teacher: 2,
     parent: 3,
     student: 1,
     admin: 1
   })
   → Adds 2 teacher + 3 parent + 1 student + 1 admin responses

📌 SIMULATE RESPONSES OVER TIME:
   simulateResponsesOverTime('unknown', 10, 2000)
   → Adds 10 responses, one every 2 seconds

📌 CHECK CURRENT STATUS:
   getSimulationStatus('unknown')
   → Shows current dashboard data

📌 PRINT DASHBOARD:
   printDashboard('unknown')
   → Pretty-prints dashboard to console

📌 RESET RESPONSES:
   resetResponses('unknown')
   → Clears all responses (keeps config)

📌 CLEAR ALL DATA:
   clearAllData('unknown')
   → Deletes everything (start fresh)

📌 EXPORT DATA:
   exportTestData('unknown')
   → Shows all data as JSON

═════════════════════════════════════════════════════════════════

EXAMPLE WORKFLOW:
─────────────────────────────────────────────────────────────────
1. Create assessment (Teachers: 3, Parents: 4, Students: 5)
2. Run: simulateMultipleResponses('unknown', { teacher: 2, parent: 2 })
3. Check: getSimulationStatus('unknown')
4. Watch: Dashboard updates on page (refresh if needed)
5. Run: simulateMultipleResponses('unknown', { teacher: 1, parent: 2, student: 5 })
6. Verify: Total shows 12/12 (100%)
7. Click: "Lock Assessment"
8. Click: "Proceed to Diagnostic Report"
9. Check: Analysis shows "12 of 12 responses"

═════════════════════════════════════════════════════════════════
`;

// Make functions globally available in development
if (typeof window !== 'undefined') {
  (window as any).testSimulator = {
    simulateSingleResponse,
    simulateMultipleResponses,
    simulateResponsesOverTime,
    getSimulationStatus,
    resetResponses,
    clearAllData,
    printDashboard,
    exportTestData,
    USAGE_GUIDE,
  };

  // Auto-print guide on development
  if (process.env.NODE_ENV === 'development') {
    console.log((window as any).testSimulator.USAGE_GUIDE);
  }
}

export default {
  simulateSingleResponse,
  simulateMultipleResponses,
  simulateResponsesOverTime,
  getSimulationStatus,
  resetResponses,
  clearAllData,
  printDashboard,
  exportTestData,
  USAGE_GUIDE,
};
