# Dependency Protection Plan - Feature Consolidation

**Objective:** Remove non-core features while PROTECTING all tech stack integrations for the 3 core features

**Date:** August 25, 2026

---

## 🔒 PROTECTED DEPENDENCIES (DO NOT REMOVE)

### Tier 1: CRITICAL SHARED (Used by ALL 3 features)
✅ **MUST KEEP** - Used by First Opinion, 14D, and Reverse Simulation

**Frontend:**
- `src/lib/firebase.ts` - Firebase Auth & Firestore initialization
- `src/store.ts` - Zustand state management (currentView, schools, etc.)
- `src/lib/auditService.ts` - Audit event logging
- `src/lib/utils.ts` - Utility functions (cn, etc.)
- `src/components/layout/` - App layout components
- `src/lib/firebase/` - Firebase configuration
- `src/types.ts` - Type definitions

**Cloud Functions:**
- `functions/src/index.ts` - Main exports & initialization
- `initializeDISHADatabase()` - Core database setup
- `getDeploymentStatus()` - Deployment monitoring

---

### Tier 2: FEATURE-SPECIFIC (Exclusive to each feature)

#### 🎯 FIRST OPINION ENGINE - KEEP ALL
✅ Cloud Functions:
- `analyzeCheckup()` - Core diagnostic analysis

✅ Frontend Libraries:
- `src/lib/fileAnalyzer.ts` - File upload & validation
- `src/lib/dynamicDiagnosisGenerator.ts` - Diagnosis generation
- `src/lib/dishaScoreCalculator.ts` - Score calculations
- `src/lib/insightGenerator.ts` - Insight generation
- `src/lib/checkupService.ts` - Checkup data persistence

✅ Components:
- `src/components/DeepDiveAssessment.tsx` - Assessment UI
- `src/components/DISHAScoreDashboard.tsx` - Results display

✅ Data:
- `src/data/screeningQuestionsData.ts` - Question bank

---

#### 📊 14-DIMENSION DIAGNOSTIC - KEEP ALL
✅ Cloud Functions:
- `generate14DReport()` - Report generation

✅ Frontend Libraries:
- `src/lib/objectiveDataService.ts` - Objective data management
- `src/lib/assessmentService.ts` - Assessment workflow
- `src/lib/reportService.ts` - Report fetching

✅ Components (ENTIRE DIRECTORY):
- `src/components/MultiUserAssessment/` - Main assessment UI
- `src/components/AssessmentEvents/` - Event tracking
- `src/components/CaptureStage/` - Data capture

✅ Pages:
- `src/pages/MultiUserAssessment.tsx` - Assessment entry point
- `src/pages/StakeholderSurvey.tsx` - Survey entry point

---

#### 🔄 REVERSE SIMULATION - KEEP ALL
✅ Cloud Functions:
- `runSimulation()` - Simulation engine

✅ Pages (ALL THREE STAGES):
- `src/pages/CompareStage.tsx` - Stage 1: Analysis
- `src/pages/SimulateStage.tsx` - Stage 2: Modeling
- `src/pages/SynthesizeStage.tsx` - Stage 3: Synthesis

✅ Components:
- Any components imported by above pages

---

## ❌ SAFE TO DELETE (Exclusive to removed features)

### Pages to DELETE (EWISR/Monitoring/Admin-only):
```
❌ src/pages/Monitoring.tsx
❌ src/pages/Communications.tsx  
❌ src/pages/Staff.tsx
❌ src/pages/Students.tsx
❌ src/pages/Attendance.tsx
```

**Check Before Deletion:**
- [ ] Search codebase for imports of these pages
- [ ] Verify NOT imported by 3 core features
- [ ] Only imported by App.tsx switch statement

---

### Components to AUDIT Before Deletion:

#### ⚠️ These MAY be used by core features - VERIFY FIRST

**EWSIRAssessment folder:**
- [ ] Check if any 14D components import from here
- [ ] Check if any simulation pages import from here
- [ ] If ONLY used by Monitoring.tsx → DELETE
- [ ] If used by core features → KEEP

**Admin-only Components:**
- [ ] `src/components/ObjectiveDataImport.tsx` - Check if used by 14D (CaptureStage might use it)
- [ ] `src/components/CustomDomainModal.tsx` - Check if used by Admin flow
- [ ] `src/components/SchoolDataHub.tsx` - Admin-only data management → DELETE

**Non-core Components:**
- [ ] `src/components/SaathiChatbot.tsx` - Not used by core features → DELETE
- [ ] `src/components/AssessmentTrendViewer.tsx` - May be used by 14D reports → VERIFY
- [ ] `src/components/SubjectiveVsObjectiveView.tsx` - May be used by 14D → VERIFY

---

## 🔗 Tech Stack Integration Points (DO NOT BREAK)

### Firebase Integration:
```
✅ Authentication (Firebase Auth)
   └─ Used by: All 3 features
   └─ Keep: src/lib/firebase.ts, Auth middleware

✅ Firestore Databases:
   └─ Used by: All 3 features
   └─ Collections:
      • assessments/* (14D Diagnostic)
      • assessmentCycles/* (14D Diagnostic)
      • challengeResponses/* (First Opinion)
      • simulations/* (Reverse Simulation)

✅ Cloud Functions:
   └─ analyzeCheckup (First Opinion)
   └─ generate14DReport (14D Diagnostic)
   └─ runSimulation (Reverse Simulation)
```

### State Management Integration:
```
✅ Zustand Store (src/store.ts)
   └─ currentView → Used by App.tsx to route between features
   └─ activeSchool → Used by all 3 features
   └─ isAdmin → Used by access control
   └─ Keep ALL store code
```

### Services Integration:
```
✅ Audit Service (src/lib/auditService.ts)
   └─ Used by: Checkup, MultiUserAssessment, Simulation
   └─ Keep: Used by all 3 features

✅ Report Service (src/lib/reportService.ts)
   └─ Used by: 14D Diagnostic
   └─ Keep: Critical for 14D
```

---

## 🧪 Deletion Verification Checklist

Before deleting EACH page/component:

### Step 1: Search for all imports
```bash
grep -r "import.*ComponentName\|from.*componentPath" src/
grep -r "import.*ComponentName\|from.*componentPath" functions/
```

### Step 2: Identify all usage locations
```bash
grep -r "ComponentName\|from.*componentPath" src/pages/FirstOpinionPage.tsx
grep -r "ComponentName\|from.*componentPath" src/pages/MultiUserAssessment.tsx
grep -r "ComponentName\|from.*componentPath" src/pages/SimulateStage.tsx
```

### Step 3: Decision matrix
```
Is imported by 3 core features?      → KEEP (Critical)
Is imported by 1+ core features?     → KEEP (In use)
Is imported by 5 non-core features?  → DELETE (Safe)
Is imported by App.tsx only?         → DELETE (Safe, used in removed routes)
Is NOT imported anywhere?            → DELETE (Dead code)
```

---

## 📋 Safe Deletion Sequence

### Sequence 1: Remove Pages (SAFE - Clear imports)
1. [ ] Delete `src/pages/Monitoring.tsx`
   - Only imported by App.tsx case 'MONITORING'
   - Not used by any core feature
   - **SAFE TO DELETE**

2. [ ] Delete `src/pages/Communications.tsx`
   - Only imported by App.tsx case 'COMMUNICATIONS'
   - **SAFE TO DELETE**

3. [ ] Delete `src/pages/Staff.tsx`
   - Only imported by App.tsx case 'STAFF'
   - **SAFE TO DELETE**

4. [ ] Delete `src/pages/Students.tsx`
   - Only imported by App.tsx case 'STUDENTS'
   - **SAFE TO DELETE**

5. [ ] Delete `src/pages/Attendance.tsx`
   - Only imported by App.tsx case 'ATTENDANCE'
   - **SAFE TO DELETE**

### Sequence 2: Remove Component Directories (VERIFY FIRST)
1. [ ] Check `src/components/EWSIRAssessment/` imports
   - If only used by Monitoring.tsx → DELETE
   - If used elsewhere → KEEP

2. [ ] Check `src/components/MultiRespondent/` imports
   - If used by MultiUserAssessment → KEEP
   - If standalone → DELETE

### Sequence 3: Remove Individual Components (VERIFY EACH)
1. [ ] `src/components/SaathiChatbot.tsx`
   - Search for all imports
   - If zero imports → DELETE

2. [ ] `src/components/SchoolDataHub.tsx`
   - Search for all imports
   - If only admin use → DELETE

3. [ ] `src/components/CustomDomainModal.tsx`
   - Search for all imports
   - If only admin use → DELETE

---

## 🛡️ Integration Protection Strategy

### BEFORE ANY DELETION:
1. [ ] Run `npm run build` - Verify current build succeeds
2. [ ] Test all 3 features load in browser
3. [ ] Test Firebase connectivity
4. [ ] Test Cloud Functions calling

### DURING DELETION:
1. [ ] Delete ONE page/component at a time
2. [ ] Run `npm run build` after each deletion
3. [ ] If build fails → Restore file, investigate dependencies
4. [ ] Commit after each successful deletion group

### AFTER ALL DELETIONS:
1. [ ] Run full build: `npm run build`
2. [ ] Start dev server: `npm run dev`
3. [ ] Test First Opinion flow end-to-end
4. [ ] Test 14D flow end-to-end
5. [ ] Test Simulation flow end-to-end
6. [ ] Check browser console for no errors
7. [ ] Verify Firebase connectivity
8. [ ] Deploy to staging and test

---

## 🚨 RED FLAGS (Stop & Investigate)

If you encounter any of these, STOP and investigate:

🚩 **Build fails after deletion**
   → File is imported by a core feature
   → Restore file immediately
   → Trace all imports before retrying deletion

🚩 **Core feature page won't load**
   → A critical dependency was deleted
   → Restore from git commit
   → Re-examine dependency chain

🚩 **Firebase operations fail**
   → Core Firebase library was affected
   → Restore all files
   → Check src/lib/firebase.ts not modified

🚩 **State management error (currentView, etc.)**
   → Store.ts dependency was broken
   → Restore all files
   → Verify store.ts not modified

---

## ✅ Success Indicators

- [x] All 3 features load without errors
- [ ] All 3 features can use Firebase
- [ ] Cloud Functions calling works
- [ ] No console errors
- [ ] Build succeeds without warnings
- [ ] Dev server runs without issues
- [ ] Each feature works standalone
- [ ] No broken imports found

---

## 📝 Rollback Strategy

If anything breaks:

```bash
# View recent commits
git log --oneline -10

# Restore to last known good state
git reset --hard <COMMIT_BEFORE_DELETIONS>

# Re-analyze dependencies more carefully
# Then delete one item at a time with testing
```

---

**Critical Rule:** When in doubt, KEEP it. We can always clean up later. Breaking a feature's tech stack integration is worse than keeping unnecessary code.

