# DISHA DIAGNOSTIC ENGINE - QUICK INTEGRATION GUIDE
## How to Use the New Database & Functions in Your React App

**Date**: August 19, 2026  
**Status**: All Systems Ready for Integration

---

## 📦 WHAT'S INCLUDED

### New Files Added
```
src/lib/firebaseInit.ts          ← Database initialization
functions/src/index.ts            ← Cloud Functions (updated)
firestore-security-rules.txt      ← New comprehensive rules
DEPLOYMENT_GUIDE.md               ← Full deployment instructions
```

### Cloud Functions Available
1. `initializeDISHADatabase()` - Initialize reference data
2. `getDeploymentStatus()` - Check deployment status
3. `analyzeCheckup()` - Stage 1: Analyze first opinion
4. `generate14DReport()` - Stage 2: Generate 14D report
5. `runSimulation()` - Stage 3: Run scenario simulation

---

## 🎯 QUICK START

### 1. Initialize Database (One-time)

**Add button to your app**:
```tsx
import { initializeAllReferenceData } from '@/lib/firebaseInit';

function AdminPanel() {
  const handleInit = async () => {
    const result = await initializeAllReferenceData();
    console.log('Initialization result:', result);
    // Shows: { dimensions: 14, challenges: 15 }
  };

  return (
    <button onClick={handleInit}>
      Initialize Database
    </button>
  );
}
```

---

### 2. Stage 1: First Opinion Checkup

**Call Cloud Function**:
```tsx
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// When user submits checkup
const analyzeCheckupFn = httpsCallable(functions, 'analyzeCheckup');

const handleCheckupSubmit = async (schoolId, checkupData) => {
  try {
    // Save to Firestore (triggers function automatically)
    await db.collection('schools')
      .doc(schoolId)
      .collection('checkups')
      .add({
        surveyInput: checkupData.survey,
        operationalMetricsUploaded: checkupData.metrics,
        status: 'SUBMITTED',
        checkupType: 'FirstOpinion',
        submittedAt: new Date(),
        submittedBy: userId
      });

    // Function automatically triggers on creation
    // Results appear in: /schools/{schoolId}/checkups/{checkupId}/analysis/current

    // Read results:
    const analysisSnap = await db.collection('schools')
      .doc(schoolId)
      .collection('checkups')
      .doc(checkupId)
      .collection('analysis')
      .doc('current')
      .get();

    const analysis = analysisSnap.data();
    console.log('Health Index:', analysis.layer3_HealthIndex);
    console.log('Recommendations:', analysis.recommendations);

  } catch (error) {
    console.error('Checkup failed:', error);
  }
};
```

---

### 3. Stage 2: 14D Assessment Report

**Call Cloud Function**:
```tsx
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const generate14DReportFn = httpsCallable(functions, 'generate14DReport');

const handleGenerateReport = async (schoolId, assessmentId) => {
  try {
    const result = await generate14DReportFn({
      schoolId: schoolId,
      assessmentId: assessmentId
    });

    console.log('Report generated:', result.data.reportId);
    console.log('Overall Health Index:', result.data.overallHealthIndex);

  } catch (error) {
    console.error('Report generation failed:', error);
  }
};
```

---

### 4. Stage 3: Reverse Simulation

**Call Cloud Function**:
```tsx
import { httpsCallable } from 'firebase/functions';

const runSimulationFn = httpsCallable(functions, 'runSimulation');

const handleRunSimulation = async (schoolId, scenario) => {
  const simRef = await db.collection('schools')
    .doc(schoolId)
    .collection('simulations')
    .add({
      scenario: scenario,
      baseline: { /* current 14D scores */ },
      status: 'PENDING',
      createdAt: new Date()
    });

  try {
    const result = await runSimulationFn({
      schoolId: schoolId,
      simulationId: simRef.id,
      scenario: scenario
    });

    console.log('Projected Index:', result.data.projectedHealthIndex);
  } catch (error) {
    console.error('Simulation failed:', error);
  }
};
```

---

## 📊 READING DATA IN REAL-TIME

### Subscribe to Checkup Analysis

```tsx
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

useEffect(() => {
  const analysisRef = doc(
    db,
    'schools',
    schoolId,
    'checkups',
    checkupId,
    'analysis',
    'current'
  );

  const unsubscribe = onSnapshot(analysisRef, (snapshot) => {
    if (snapshot.exists()) {
      const analysis = snapshot.data();
      setHealthIndex(analysis.layer3_HealthIndex.healthIndex);
      setRecommendations(analysis.recommendations);
    }
  });

  return unsubscribe;
}, [schoolId, checkupId]);
```

---

## 🔐 AUTHENTICATION SETUP

### Set Custom Claims on Users

**During user registration**:
```typescript
// Set admin user
await admin.auth().setCustomUserClaims(uid, {
  role: 'admin'
});

// Set school principal
await admin.auth().setCustomUserClaims(uid, {
  role: 'principal',
  schoolId: 'school_001'
});
```

### Check Permissions in App

```tsx
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

function AdminPanel() {
  const [user] = useAuthState(auth);
  const isAdmin = user?.getIdTokenResult()?.claims.role === 'admin';
  
  return isAdmin ? <div>Admin Panel</div> : <p>Access denied</p>;
}
```

---

## ✨ COMPLETE FEATURES

| Feature | Status | 
|---------|--------|
| Stage 1 Checkup | ✅ Ready |
| Stage 2 Report | ✅ Ready |
| Stage 3 Simulation | ✅ Ready |
| Real-time updates | ✅ Ready |
| Audit logging | ✅ Ready |
| Security rules | ✅ Ready |

---

## 🚀 NEXT STEPS

1. Follow `DEPLOYMENT_GUIDE.md` to deploy to Firebase
2. Initialize database reference data
3. Test each stage with sample data
4. Integrate with your UI components
5. Train users and go live!

---

**Ready to integrate!** 🎉
      respondentsCount: event.totalActual,
      expectedCount: event.totalExpected,
      school: schoolName,
    }))}
    schoolName={schoolName}
    onCreateNew={() => setStage('configuration')}
    onSelectEvent={(event) => {
      const selectedEvent = events.find(e => e.id === event.id);
      if (selectedEvent) handleOpenEvent(event.id);
    }}
  />
)}
```

**Required Import:**
```typescript
import { ProfessionalAssessmentEvents } from '../components/AssessmentEvents';
```

---

### Step 2: Update MultiUserAssessment.tsx - Analysis Page

**Current Code (Line 354-362):**
```typescript
{stage === 'analysis' && config && progress && showReport && (
  <DiagnosticReport
    assessmentId={config.id}
    eventName={config.eventName}
    schoolName={config.schoolName}
    onBack={() => setShowReport(false)}
  />
)}
```

**Replace With (You need to fetch dimension data from your database first):**
```typescript
{stage === 'analysis' && config && progress && showReport && (
  <ProfessionalDiagnosticDashboard
    schoolName={config.schoolName}
    assessmentDate={config.createdAt || new Date().toLocaleDateString()}
    dimensions={[
      // Fetch this from your Firestore database
      // For each dimension, map your data to:
      {
        id: 'dim-1',
        name: 'Academic Excellence',
        icon: BookOpen, // Import icon from lucide-react
        subjective: 82,
        benchmark: 80,
        objective: 78,
        gap: 4,
        status: 'good',
        perception: 'Aligned with reality',
        interpretation: 'Academic performance is strong...',
        rootCauses: ['Minor gaps in curriculum coverage'],
        actionablePoints: ['Strengthen advanced coursework'],
      },
      // ... repeat for all 14 dimensions
    ]}
    respondents={[
      {
        type: 'teacher',
        count: progress.actualRespondents.teacher,
        total: config.expectedRespondents.teacher,
        percentage: Math.round((progress.actualRespondents.teacher / config.expectedRespondents.teacher) * 100),
      },
      {
        type: 'parent',
        count: progress.actualRespondents.parent,
        total: config.expectedRespondents.parent,
        percentage: Math.round((progress.actualRespondents.parent / config.expectedRespondents.parent) * 100),
      },
      {
        type: 'student',
        count: progress.actualRespondents.student,
        total: config.expectedRespondents.student,
        percentage: Math.round((progress.actualRespondents.student / config.expectedRespondents.student) * 100),
      },
      {
        type: 'admin',
        count: progress.actualRespondents.admin,
        total: config.expectedRespondents.admin,
        percentage: Math.round((progress.actualRespondents.admin / config.expectedRespondents.admin) * 100),
      },
    ]}
  />
)}
```

**Required Imports:**
```typescript
import { ProfessionalDiagnosticDashboard } from '../components/DiagnosticDashboard';
import { BookOpen, Brain, Users, Zap } from 'lucide-react'; // Add other dimension icons
```

---

## 🔍 Data Mapping Guide

### Assessment Events Data Mapping

```typescript
// From Firestore Event Document
const event = {
  id: string;              // Firestore doc ID
  eventName: string;       // "Untitled Assessment"
  createdAt: Date;         // Event creation date
  status: string;          // "active" | "locked" | "analyzed"
  totalActual: number;     // Current response count
  totalExpected: number;   // Expected respondent count
}

// To ProfessionalAssessmentEvents Props
const mapped = {
  id: event.id,
  name: event.eventName,
  date: event.createdAt.toLocaleDateString(),
  status: event.status === 'active' ? 'active' : 'completed',
  respondentsCount: event.totalActual,
  expectedCount: event.totalExpected,
  school: schoolName,
}
```

### Dimension Data Mapping

```typescript
// Your Firestore dimension response data
const dimensionResponse = {
  dimensionId: string;
  name: string;
  subjectiveScore: number;     // 1-5 or 0-100
  objectiveMetrics: number[];
  benchmarkScore: number;
  responses: Array<{
    stakeholder: string;
    score: number;
  }>;
}

// To ProfessionalDimensionReport Props
const mapped = {
  id: dimensionResponse.dimensionId,
  name: dimensionResponse.name,
  subjective: dimensionResponse.subjectiveScore * 20, // If 1-5, convert to 0-100
  benchmark: dimensionResponse.benchmarkScore * 20,
  objective: Math.round(dimensionResponse.objectiveMetrics.reduce((a,b) => a+b) / dimensionResponse.objectiveMetrics.length),
  gap: Math.abs(subjective - objective),
  status: calculateStatus(subjective, benchmark), // Compare to determine status
  perception: determineSentiment(subjective, objective),
  interpretation: generateInsightText(/* dimensions */),
  rootCauses: extractRootCauses(/* from analysis */),
  actionablePoints: generateRecommendations(/* from analysis */),
}
```

---

## 📊 Status Calculation

```typescript
function calculateStatus(subjective: number, benchmark: number): 'excellent' | 'good' | 'adequate' | 'poor' {
  if (subjective >= benchmark * 0.95) return 'excellent';
  if (subjective >= benchmark * 0.90) return 'good';
  if (subjective >= benchmark * 0.75) return 'adequate';
  return 'poor';
}
```

---

## 🎨 Available Dimension Icons

```typescript
import {
  BookOpen,           // Academic Excellence
  Users,              // Leadership & Governance
  Heart,              // Student Well-being & Support
  Lightbulb,          // Teaching & Learning Pedagogy
  Target,             // Curriculum & Assessment Design
  Zap,                // Innovation & Technology Integration
  Users2,             // Inclusive Education & Diversity
  TrendingUp,         // Operational Efficiency & Resources
  Brain,              // Staff Professional Development
  Building2,          // Infrastructure & Facilities
  Globe,              // Community & Stakeholder Engagement
  TreePine,           // Environmental Sustainability
  Smile,              // Student Engagement & Participation
  Award,              // Achievement & Performance
} from 'lucide-react';
```

---

## 🔄 Testing Checklist

Before deploying:

- [ ] Assessment Events page displays correctly
  - [ ] Status badges show correct colors
  - [ ] Progress bars calculate correctly
  - [ ] Search functionality works
  - [ ] Status filter works
  - [ ] Clicking event opens details
  - [ ] "New Assessment Event" button works

- [ ] Diagnostic Dashboard loads
  - [ ] Header displays school name and date
  - [ ] KPI cards show correct values
  - [ ] Response rate section displays
  - [ ] Status distribution grid shows correct counts
  - [ ] Search filters work
  - [ ] Expandable cards expand/collapse
  - [ ] PDF download button works
  - [ ] All 14 dimensions display

- [ ] Dimension Cards display correctly
  - [ ] Three metric cards (Subjective/Benchmark/Objective) show
  - [ ] Progress bars display correctly
  - [ ] Gap analysis section shows correct severity
  - [ ] Root causes section displays
  - [ ] Actionable recommendations display
  - [ ] Color coding matches status
  - [ ] Icons display correctly

- [ ] Responsive Design
  - [ ] Desktop layout works
  - [ ] Tablet layout works
  - [ ] Mobile layout works
  - [ ] All text readable
  - [ ] Touch targets large enough

---

## 🚀 Deployment Plan

### Phase 1: Integrate Components (TODAY)
1. Add imports to MultiUserAssessment.tsx
2. Map data from Firestore to component props
3. Test locally
4. Push to GitHub

### Phase 2: Deploy (NEXT)
- GitHub Actions auto-deploys
- Monitor at: https://github.com/cpdoryl/Disha-diagnostic-app/actions
- App goes live at: https://disha-diagnostics.web.app/
- Expected time: ~15 minutes

### Phase 3: Verify Live (AFTER DEPLOY)
- Test all features on live app
- Verify styling matches design
- Test with real data
- Check mobile responsiveness

---

## 📝 Documentation Files

All created components have comprehensive documentation:

```
✅ PROFESSIONAL_DASHBOARD_REDESIGN.md      (547 lines)
   - Design system details
   - Color strategy
   - Component specifications
   - Usage examples

✅ ASSESSMENT_EVENTS_REDESIGN.md           (545 lines)
   - Event page design
   - Color coding
   - Status indicators
   - Integration guide

✅ Enhanced Visualizations Documentation  (614 lines)
   - Radar charts
   - SOB analysis
   - Gap analysis
```

---

## ❓ Troubleshooting

### Components Not Showing
**Check:**
1. Import statement is correct
2. Component props are properly mapped
3. Data is being passed from state/Firestore
4. No TypeScript errors in console

### Colors Not Displaying
**Check:**
1. Tailwind CSS is imported in parent component
2. Color values in `statusConfig` match Tailwind
3. Browser cache is cleared
4. No CSS conflicts from other styles

### Progress Bars Not Calculating
**Check:**
1. Respondent counts are numbers
2. Expected count > 0
3. Respondent count ≤ expected count
4. Percentage calculation: `(respondents / expected) * 100`

### Data Not Loading
**Check:**
1. Firestore query is correct
2. Data exists in Firestore
3. No permission errors in console
4. App has Firebase credentials

---

## 📞 Next Steps

1. **Review Design Documents**
   - Read PROFESSIONAL_DASHBOARD_REDESIGN.md
   - Read ASSESSMENT_EVENTS_REDESIGN.md

2. **Prepare Data Mapping**
   - Gather your Firestore schema
   - Map your data to component props
   - Test mapping with sample data

3. **Integrate Components**
   - Add imports
   - Map data
   - Test locally

4. **Deploy**
   - Commit changes
   - Push to GitHub
   - Monitor GitHub Actions
   - Test on live app

---

## ✅ Summary

**Status:** Components built and ready for integration  
**Next:** Integrate into MultiUserAssessment.tsx and other pages  
**Then:** Deploy and test on live app  

All 3 professional components are production-ready and waiting to make your app look amazing! 🎨🚀
