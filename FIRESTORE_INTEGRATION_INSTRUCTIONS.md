# FIRESTORE INTEGRATION INSTRUCTIONS
## How to Use the New Services in Your App Pages

**Date**: August 19, 2026  
**Created Services**: 4 core services  
**Status**: Ready to Integrate

---

## NEW SERVICES CREATED

### 1. checkupService.ts
Location: `src/lib/checkupService.ts`  
Handles: Stage 1 First Opinion Checkup data

**Functions**:
- `saveCheckupToFirestore()` - Save checkup data
- `getSchoolCheckups()` - Retrieve all checkups
- `subscribeToCheckupAnalysis()` - Real-time analysis updates
- `waitForCheckupAnalysis()` - Wait for Cloud Function results

---

### 2. assessmentService.ts
Location: `src/lib/assessmentService.ts`  
Handles: Stage 2 Assessment and multi-stakeholder responses

**Functions**:
- `createAssessment()` - Create new assessment
- `saveAssessmentResponse()` - Save respondent answer
- `getAssessmentResponses()` - Get all responses
- `subscribeToResponseUpdates()` - Real-time response tracking
- `triggerReportGeneration()` - Call Cloud Function to generate 14D report
- `getAssessmentStats()` - Get response statistics

---

### 3. auditService.ts
Location: `src/lib/auditService.ts`  
Handles: Compliance and audit logging

**Functions**:
- `logAuditEvent()` - Log any operation
- `getSchoolAuditLogs()` - Retrieve audit logs
- `generateAuditReport()` - Get audit summary
- `exportAuditLogs()` - Export as JSON/CSV
- `auditLoggers` - Pre-configured audit shortcuts

---

### 4. reportService.ts
Location: `src/lib/reportService.ts`  
Handles: Stage 2 Report storage and retrieval

**Functions**:
- `saveReportToFirestore()` - Save generated report
- `getReport()` - Get report by ID
- `getLatestReport()` - Get most recent report
- `subscribeToReport()` - Real-time report updates
- `compareReports()` - Compare two reports
- `exportReport()` - Export report as JSON/CSV

---

## INTEGRATION EXAMPLES

### INTEGRATION 1: Stage 1 Checkup (Checkup.tsx)

**Before** (Current Code):
```tsx
// Data only exists in local state
const [checkupResults, setCheckupResults] = useState(null);

const handleSubmit = () => {
  // Calculate locally
  const results = calculateAnalysis(answers, metrics);
  setCheckupResults(results);
  // Data lost on page refresh!
};
```

**After** (With Firestore):
```tsx
import { saveCheckupToFirestore, subscribeToCheckupAnalysis, waitForCheckupAnalysis } from '../lib/checkupService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';

function CheckupPage() {
  const [user] = useAuthState(auth);
  const [checkupResults, setCheckupResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckupSubmit = async (answers, metrics) => {
    try {
      setIsLoading(true);

      // Save to Firestore (triggers Cloud Function automatically)
      const checkupId = await saveCheckupToFirestore(
        schoolId,
        {
          surveyInput: answers,
          operationalMetricsUploaded: metrics,
          createdBy: user?.uid,
          schoolId: schoolId
        }
      );

      // Wait for Cloud Function to analyze
      const analysis = await waitForCheckupAnalysis(schoolId, checkupId);
      
      if (analysis) {
        setCheckupResults(analysis);
      } else {
        alert('Analysis generation timed out. Please try again.');
      }

    } catch (error) {
      console.error('Checkup submission failed:', error);
      alert('Failed to submit checkup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Your existing UI */}
      <button onClick={() => handleCheckupSubmit(answers, metrics)} disabled={isLoading}>
        {isLoading ? 'Generating Analysis...' : 'Submit Checkup'}
      </button>
      
      {checkupResults && <DisplayCheckupResults results={checkupResults} />}
    </div>
  );
}
```

---

### INTEGRATION 2: Assessment Setup (MultiUserAssessment.tsx)

**Before** (Current Code):
```tsx
// Assessment metadata not saved
const [assessment, setAssessment] = useState(null);

const handleCreateAssessment = (name, expectedRespondents) => {
  const newAssessment = {
    id: generateId(),
    name,
    expectedRespondents,
    createdAt: new Date()
  };
  setAssessment(newAssessment);
  // Data lost on refresh!
};
```

**After** (With Firestore):
```tsx
import { createAssessment, getAssessmentStats, closeAssessment } from '../lib/assessmentService';
import { useAuthState } from 'react-firebase-hooks/auth';

function AssessmentSetup() {
  const [user] = useAuthState(auth);
  const [assessment, setAssessment] = useState(null);
  const [stats, setStats] = useState(null);

  const handleCreateAssessment = async (name, expectedRespondents) => {
    try {
      // Save to Firestore
      const assessmentId = await createAssessment(schoolId, {
        assessmentName: name,
        description: '',
        createdBy: user?.uid,
        schoolId: schoolId,
        expectedRespondents: expectedRespondents,
        surveyEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      const assessmentData = await getAssessment(schoolId, assessmentId);
      setAssessment(assessmentData);

    } catch (error) {
      console.error('Failed to create assessment:', error);
    }
  };

  const handleTrackResponses = async () => {
    if (!assessment) return;
    
    const statistics = await getAssessmentStats(schoolId, assessment.id);
    setStats(statistics);
  };

  return (
    <div>
      {/* Assessment setup UI */}
      {assessment && (
        <>
          <p>Assessment Link: {assessment.surveyLink}</p>
          <button onClick={handleTrackResponses}>View Response Stats</button>
          {stats && <DisplayStats stats={stats} />}
        </>
      )}
    </div>
  );
}
```

---

### INTEGRATION 3: Real-time Response Tracking (Monitoring.tsx)

**Before** (Current Code):
```tsx
// Static data only
const [responses, setResponses] = useState([]);

useEffect(() => {
  // Fetch once
  fetchResponses().then(setResponses);
}, []);
```

**After** (With Firestore Real-time):
```tsx
import { subscribeToResponseUpdates } from '../lib/assessmentService';

function ResponseTracker() {
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!assessmentId) return;

    // Subscribe to real-time updates
    const unsubscribe = subscribeToResponseUpdates(
      schoolId,
      assessmentId,
      (latestResponses) => {
        setResponses(latestResponses);

        // Calculate stats
        const responsesByType = latestResponses.reduce((acc, r) => {
          acc[r.respondentType] = (acc[r.respondentType] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: latestResponses.length,
          byType: responsesByType
        });
      }
    );

    // Clean up on unmount
    return unsubscribe;
  }, [assessmentId]);

  return (
    <div>
      <h2>Response Tracking (Live)</h2>
      <p>Total Responses: {stats?.total || 0}</p>
      <div>
        {Object.entries(stats?.byType || {}).map(([type, count]) => (
          <p key={type}>{type}: {count}</p>
        ))}
      </div>
    </div>
  );
}
```

---

### INTEGRATION 4: Report Generation & Loading (MultiUserAssessment.tsx)

**Before** (Current Code):
```tsx
// No report persistence
const [report, setReport] = useState(null);

const handleGenerateReport = () => {
  // Calculate locally
  const calculatedReport = calculateReport(responses);
  setReport(calculatedReport);
  // Lost on refresh!
};
```

**After** (With Firestore):
```tsx
import { triggerReportGeneration } from '../lib/assessmentService';
import { getReport, subscribeToReport } from '../lib/reportService';

function ReportGeneration() {
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);

      // Call Cloud Function to generate 14D report
      const result = await triggerReportGeneration(schoolId, assessmentId);
      
      console.log('Report generated:', result.reportId);
      
      // Load the report
      const reportData = await getReport(schoolId, result.reportId);
      setReport(reportData);

    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateReport} disabled={isGenerating}>
        {isGenerating ? 'Generating Report...' : 'Generate 14D Report'}
      </button>

      {report && <DisplayReport report={report} />}
    </div>
  );
}
```

---

### INTEGRATION 5: Audit Logging (Wrap all operations)

**Before** (No audit trail):
```tsx
const handleDeleteCheckup = async (checkupId) => {
  await db.collection('checkups').doc(checkupId).delete();
  // No record of who deleted what!
};
```

**After** (With audit logging):
```tsx
import { auditLoggers } from '../lib/auditService';
import { useAuthState } from 'react-firebase-hooks/auth';

function CheckupList() {
  const [user] = useAuthState(auth);

  const handleDeleteCheckup = async (checkupId) => {
    try {
      // Delete the checkup
      await db.collection('schools', schoolId, 'checkups').doc(checkupId).delete();

      // Log the audit event
      await auditLoggers.checkupSubmitted(schoolId, checkupId, user?.uid);

      alert('Checkup deleted');
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
```

---

### INTEGRATION 6: Subscribe to Real-time Report Updates

```tsx
import { subscribeToReport } from '../lib/reportService';

function ReportViewer() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!reportId) return;

    // Subscribe to real-time report updates
    const unsubscribe = subscribeToReport(
      schoolId,
      reportId,
      (latestReport) => {
        setReport(latestReport);
        console.log('Report updated:', latestReport);
      }
    );

    return unsubscribe;
  }, [reportId]);

  return (
    <div>
      {report && <DisplayReport report={report} />}
    </div>
  );
}
```

---

## STEP-BY-STEP IMPLEMENTATION GUIDE

### Priority 1: Integrate Checkup Service (This Week)

**Step 1**: Update Checkup.tsx page
- [ ] Import `saveCheckupToFirestore`, `waitForCheckupAnalysis`
- [ ] Wrap submit button handler
- [ ] Save checkup data to Firestore
- [ ] Show loading state while analyzing
- [ ] Display results from Firestore

**Step 2**: Test checkup flow
- [ ] Submit checkup
- [ ] Verify data saved to Firestore
- [ ] Verify Cloud Function triggered
- [ ] Verify analysis results displayed

---

### Priority 2: Integrate Assessment Service (Next Week)

**Step 1**: Update MultiUserAssessment.tsx
- [ ] Import `createAssessment`, `saveAssessmentResponse`
- [ ] Save assessment metadata to Firestore
- [ ] Generate unique survey link
- [ ] Display survey link to admin

**Step 2**: Update StakeholderSurvey.tsx (public survey page)
- [ ] Import `saveAssessmentResponse`
- [ ] Parse assessment ID from URL
- [ ] Save responses to Firestore
- [ ] Show confirmation after submit

**Step 3**: Add real-time tracking
- [ ] Import `subscribeToResponseUpdates`
- [ ] Subscribe to response updates in Monitoring.tsx
- [ ] Display live response counts

---

### Priority 3: Integrate Report Service (Later)

**Step 1**: Add report generation
- [ ] Import `triggerReportGeneration`
- [ ] Add "Generate Report" button
- [ ] Call Cloud Function

**Step 2**: Display reports
- [ ] Import `getReport`, `subscribeToReport`
- [ ] Load and display saved reports
- [ ] Show report history

---

### Priority 4: Integrate Audit Logging (Throughout)

**Step 1**: Add audit logging to critical operations
- [ ] Import `auditLoggers` or `logAuditEvent`
- [ ] Log all checkup submissions
- [ ] Log all assessment operations
- [ ] Log all report generation

---

## COMMON PATTERNS

### Pattern 1: Save and Wait (Checkup)
```tsx
// Save data and wait for Cloud Function to complete
const checkupId = await saveCheckupToFirestore(schoolId, checkupData);
const analysis = await waitForCheckupAnalysis(schoolId, checkupId);
setResults(analysis);
```

### Pattern 2: Save and Subscribe (Assessment)
```tsx
// Save data and subscribe to real-time updates
const responseId = await saveAssessmentResponse(schoolId, assessmentId, response);
const unsubscribe = subscribeToResponseUpdates(schoolId, assessmentId, (responses) => {
  updateStats(responses);
});
return unsubscribe; // in useEffect cleanup
```

### Pattern 3: Fetch and Display (Report)
```tsx
// Get saved data from Firestore
const report = await getReport(schoolId, reportId);
setReport(report);
```

### Pattern 4: Log All Operations (Audit)
```tsx
// Log after every successful operation
await logAuditEvent(schoolId, 'OPERATION_NAME', 'entity_type', entityId, userId);
```

---

## TESTING CHECKLIST

### Stage 1: Checkup
- [ ] Can save checkup to Firestore
- [ ] Cloud Function triggers automatically
- [ ] Analysis results saved to `/analysis/current`
- [ ] Can read analysis from Firestore
- [ ] Real-time updates work

### Stage 2: Assessment
- [ ] Can create assessment with metadata
- [ ] Survey link generated correctly
- [ ] Can save responses to Firestore
- [ ] Response count updates in real-time
- [ ] Can generate report from Cloud Function
- [ ] Report saved to Firestore

### Stage 3: Simulation
- [ ] Can save simulation scenario
- [ ] Cloud Function triggered
- [ ] Results saved to `/results`
- [ ] Can read results from Firestore

### Audit
- [ ] All operations logged
- [ ] Can query audit logs
- [ ] Export to CSV/JSON works
- [ ] Only admins can read

---

## TROUBLESHOOTING

### "Cloud function not found" error
**Solution**: Make sure all 5 functions are deployed:
- `initializeDISHADatabase`
- `analyzeCheckup`
- `generate14DReport`
- `runSimulation`
- Plus audit logger

### "Permission denied" when saving
**Solution**: 
- User must be authenticated
- Check Firestore security rules
- Verify user has correct role/schoolId in custom claims

### "Analysis not ready" after checkup submit
**Solution**:
- Cloud Function may still be processing
- `waitForCheckupAnalysis()` waits up to 30 seconds
- Check Cloud Functions logs for errors

### Real-time updates not working
**Solution**:
- Check Firestore connectivity
- Verify `onSnapshot` subscription returned
- Check browser console for errors

---

## SUMMARY

| Component | Service | Status |
|-----------|---------|--------|
| Checkup (Stage 1) | checkupService.ts | ✅ Ready |
| Assessment (Stage 2) | assessmentService.ts | ✅ Ready |
| Reports (Stage 2) | reportService.ts | ✅ Ready |
| Audit Logging | auditService.ts | ✅ Ready |

**Next Action**: Start integrating into pages using examples above.

---

**Need Help?**: Refer to the COMPREHENSIVE_FIRESTORE_AUDIT.md for detailed database schema and architecture.

