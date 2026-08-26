# DISHA Diagnostic Engine - Feature Consolidation Plan

**Date:** August 25, 2026  
**Objective:** Consolidate app to 3 standalone features only

---

## ✅ Features to KEEP

### 1. **First Opinion Engine**
- **Status:** Needs UI page creation
- **Backend:** Complete (Cloud Functions deployed)
- **Components:** FirstOpinionDashboard.tsx (in src/components/FirstOpinion/)
- **View:** NEW - Add 'FIRST_OPINION' to ViewState
- **Action:** Create src/pages/FirstOpinionPage.tsx with dashboard integration

### 2. **14-Dimension Diagnostic Analysis**
- **Status:** Functional
- **Pages:** 
  - src/pages/MultiUserAssessment.tsx (14D_ASSESSMENT view)
  - src/pages/StakeholderSurvey.tsx (public survey route)
- **Components:** src/components/MultiUserAssessment/
- **Action:** Keep all related code

### 3. **Reverse Engine Simulation**
- **Status:** Functional
- **Pages:**
  - src/pages/CompareStage.tsx (COMPARE view)
  - src/pages/SimulateStage.tsx (SIMULATE view)
  - src/pages/SynthesizeStage.tsx (SYNTHESIZE view)
- **Components:** Various simulation-related components
- **Action:** Keep all related code, remove EWISR-only logic

---

## ❌ Features to REMOVE

### Pages (Complete Removal)

| Page | View | Reason |
|------|------|--------|
| src/pages/Checkup.tsx | CHECKUP | EWISR Assessment |
| src/pages/Monitoring.tsx | MONITORING | EWISR Monitoring |
| src/pages/Communications.tsx | COMMUNICATIONS | Standalone feature |
| src/pages/Staff.tsx | STAFF | Staff management (not core feature) |
| src/pages/Students.tsx | STUDENTS | Student management (not core feature) |
| src/pages/Attendance.tsx | ATTENDANCE | Attendance tracking (not core feature) |

### Components (Complete Removal)

| Component | Location | Reason |
|-----------|----------|--------|
| EWSIRAssessment | src/components/EWSIRAssessment/ | EWISR specific |
| MultiRespondent | src/components/MultiRespondent/ | If separate from MultiUserAssessment |
| SchoolDataHub.tsx | src/components/ | Data hub (admin-only) |
| SaathiChatbot.tsx | src/components/ | Chatbot feature |
| ObjectiveDataImport.tsx | src/components/ | Admin-only import |
| CustomDomainModal.tsx | src/components/ | Admin-only feature |
| AssessmentTrendViewer.tsx | src/components/ | Analysis tool (not core) |
| SubjectiveVsObjectiveView.tsx | src/components/ | Analysis tool |

### Pages to Simplify

| Page | Action |
|------|--------|
| src/pages/Dashboard.tsx | Keep but simplify - only show 3 feature tiles |
| src/pages/Admin.tsx | Simplify - keep only access control, remove data management |
| src/pages/LandingPage.tsx | Keep - authentication entry point |
| src/pages/Login.tsx | Keep - authentication |

---

## 📋 ViewState Changes Required

### Current ViewState:
```typescript
type ViewState = 'DASHBOARD' | 'CHECKUP' | 'COMPARE' | 'SIMULATE' | 'SYNTHESIZE' | 
                'MONITORING' | 'STUDENTS' | 'STAFF' | 'ATTENDANCE' | 'COMMUNICATIONS' | 
                'ADMIN' | '14D_ASSESSMENT';
```

### New ViewState:
```typescript
type ViewState = 'DASHBOARD' | 'COMPARE' | 'SIMULATE' | 'SYNTHESIZE' | 
                'ADMIN' | '14D_ASSESSMENT' | 'FIRST_OPINION';
```

---

## 🔄 App.tsx Changes

### Views to Remove from Switch Statement:
- case 'CHECKUP'
- case 'MONITORING'
- case 'COMMUNICATIONS'
- case 'STUDENTS'
- case 'STAFF'
- case 'ATTENDANCE'

### Views to Keep/Add:
- case 'DASHBOARD' - Keep (simplified)
- case 'COMPARE' - Keep (Reverse Engine)
- case 'SIMULATE' - Keep (Reverse Engine)
- case 'SYNTHESIZE' - Keep (Reverse Engine)
- case '14D_ASSESSMENT' - Keep (14D)
- case 'ADMIN' - Keep (access control)
- case 'FIRST_OPINION' - ADD (First Opinion Engine)

---

## 🗂️ Component Cleanup

### Keep:
- src/components/layout/
- src/components/MultiUserAssessment/
- src/components/PublicSurvey.tsx
- src/components/FirstOpinion/ (Dashboard only)
- src/components/Phase4/ (if exists, for 14D analysis)
- src/components/CaptureStage/ (if used by simulation)

### Remove:
- src/components/EWSIRAssessment/
- src/components/MultiRespondent/ (unless used by 14D)
- src/components/SaathiChatbot.tsx
- src/components/SchoolDataHub.tsx
- src/components/ObjectiveDataImport.tsx
- src/components/CustomDomainModal.tsx
- src/components/AssessmentTrendViewer.tsx
- src/components/SubjectiveVsObjectiveView.tsx

---

## 🔧 Implementation Steps

### Phase 1: Create First Opinion Engine Page
1. Create src/pages/FirstOpinionPage.tsx
2. Add FIRST_OPINION to ViewState
3. Import and wire in App.tsx
4. Add navigation to Dashboard

### Phase 2: Update Dashboard
1. Simplify Dashboard.tsx to show only 3 feature tiles
2. Remove references to removed features
3. Update navigation menu

### Phase 3: Remove Pages
1. Delete unnecessary page files
2. Remove view imports from App.tsx
3. Remove cases from switch statement

### Phase 4: Remove Components
1. Delete unnecessary component directories
2. Update imports throughout codebase
3. Fix any broken imports

### Phase 5: Update Types
1. Update ViewState in src/types.ts
2. Update AppState in src/store.ts
3. Remove unused data structures

### Phase 6: Clean Up Services & Libraries
1. Remove EWISR-specific services
2. Remove unused utility functions
3. Keep only services needed by 3 features

### Phase 7: Update Cloud Functions
1. Keep: First Opinion Engine functions
2. Keep: 14D functions
3. Keep: Simulation functions
4. Remove: EWISR functions
5. Update: functions/src/index.ts exports

---

## 📝 Testing Checklist

- [ ] All 3 features load without errors
- [ ] Dashboard shows only 3 feature options
- [ ] First Opinion Engine page loads
- [ ] 14D Assessment workflow works end-to-end
- [ ] Reverse Engine Simulation (Compare/Simulate/Synthesize) works
- [ ] Navigation menu updated correctly
- [ ] No console errors from missing imports
- [ ] Build completes successfully
- [ ] Firebase deployment successful

---

## 🎯 Success Criteria

✅ App contains only 3 standalone features:
1. First Opinion Engine (Health diagnostic)
2. 14-Dimension Diagnostic Analysis (Multi-stakeholder assessment)
3. Reverse Engine Simulation (Scenario modeling)

✅ All other features removed from UI and code

✅ No broken imports or references

✅ App builds and deploys successfully

---

**Status:** Ready for implementation  
**Estimated Time:** 2-3 hours  
**Risk Level:** Medium (requires careful import cleanup)
