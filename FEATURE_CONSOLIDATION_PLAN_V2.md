# DISHA Diagnostic Engine - Feature Consolidation Plan v2

**Date:** August 25, 2026  
**Approach:** Keep & Rebrand (All 3 features already built, just cleanup required)

---

## ✅ 3 FEATURES - ALREADY BUILT

### 1. **First Opinion Engine** ✅ BUILT
- **Current Name:** "DISHA Checkup"
- **File:** src/pages/Checkup.tsx
- **Status:** Fully functional with challenge-based diagnostic
- **Action:** Rename to FirstOpinionPage.tsx
- **View:** Rename 'CHECKUP' → 'FIRST_OPINION'
- **Code:** Keep ALL functionality intact

### 2. **14-Dimension Diagnostic Analysis** ✅ BUILT
- **File:** src/pages/MultiUserAssessment.tsx (+ StakeholderSurvey.tsx)
- **Status:** Fully functional multi-stakeholder assessment
- **Action:** Keep as-is, will update to v2 methodology later
- **View:** Keep '14D_ASSESSMENT'
- **Code:** Keep ALL functionality intact

### 3. **Reverse Simulation Engine** ✅ BUILT
- **Files:** 
  - src/pages/CompareStage.tsx (Stage 1)
  - src/pages/SimulateStage.tsx (Stage 2)
  - src/pages/SynthesizeStage.tsx (Stage 3)
- **Status:** Fully functional scenario modeling
- **Action:** Keep as-is, will update to latest version later
- **Views:** Keep 'COMPARE', 'SIMULATE', 'SYNTHESIZE'
- **Code:** Keep ALL functionality intact

---

## ❌ FEATURES TO REMOVE (NOT CORE)

### Pages to Delete:
- [ ] src/pages/Monitoring.tsx (MONITORING view)
- [ ] src/pages/Communications.tsx (COMMUNICATIONS view)
- [ ] src/pages/Staff.tsx (STAFF view)
- [ ] src/pages/Students.tsx (STUDENTS view)
- [ ] src/pages/Attendance.tsx (ATTENDANCE view)

### Views to Remove from ViewState:
```typescript
// REMOVE THESE:
'MONITORING' | 'COMMUNICATIONS' | 'STAFF' | 'STUDENTS' | 'ATTENDANCE'
```

### Components to Delete (Non-Core):
- [ ] src/components/EWSIRAssessment/ (if separate from checkup features)
- [ ] src/components/SchoolDataHub.tsx
- [ ] src/components/SaathiChatbot.tsx
- [ ] src/components/ObjectiveDataImport.tsx (admin-only)
- [ ] src/components/CustomDomainModal.tsx (admin-only)
- [ ] Other admin-only management components

---

## 📋 Changes Required

### 1. Rename Checkup → First Opinion (Priority 1)
```bash
# Step 1: Rename file
mv src/pages/Checkup.tsx src/pages/FirstOpinionPage.tsx

# Step 2: Update view type
# In src/types.ts: Change 'CHECKUP' → 'FIRST_OPINION'

# Step 3: Update imports in App.tsx
# Change: import { Checkup } from './pages/Checkup'
# To:     import { FirstOpinionPage } from './pages/FirstOpinionPage'

# Step 4: Update switch case
# Change: case 'CHECKUP': return <Checkup />
# To:     case 'FIRST_OPINION': return <FirstOpinionPage />

# Step 5: Export component name
# In FirstOpinionPage.tsx: export function FirstOpinionPage() { ... }
```

### 2. Update Navigation Menu
- Dashboard tile → "First Opinion Engine"
- Keep: 14-Dimension Diagnostic
- Keep: Reverse Simulation Engine
- Remove: All other tiles

### 3. Update ViewState Type
**File:** src/types.ts

```typescript
// OLD:
type ViewState = 'DASHBOARD' | 'CHECKUP' | 'COMPARE' | 'SIMULATE' | 'SYNTHESIZE' | 
                'MONITORING' | 'STUDENTS' | 'STAFF' | 'ATTENDANCE' | 'COMMUNICATIONS' | 
                'ADMIN' | '14D_ASSESSMENT';

// NEW:
type ViewState = 'DASHBOARD' | 'FIRST_OPINION' | 'COMPARE' | 'SIMULATE' | 'SYNTHESIZE' | 
                'ADMIN' | '14D_ASSESSMENT';
```

### 4. Update App.tsx

**Remove imports:**
```typescript
// DELETE:
import { Monitoring } from './pages/Monitoring';
import { Communications } from './pages/Communications';
import { Staff } from './pages/Staff';
import { Students } from './pages/Students';
import { Attendance } from './pages/Attendance';
```

**Update import:**
```typescript
// CHANGE FROM:
import { Checkup } from './pages/Checkup';

// CHANGE TO:
import { FirstOpinionPage } from './pages/FirstOpinionPage';
```

**Update switch statement:**
```typescript
const renderView = () => {
  switch (currentView) {
    case 'DASHBOARD':
      return <Dashboard />;
    case 'FIRST_OPINION':           // RENAMED from CHECKUP
      return <FirstOpinionPage />;
    case 'COMPARE':
      return <CompareStage />;
    case 'SIMULATE':
      return <SimulateStage />;
    case 'SYNTHESIZE':
      return <SynthesizeStage />;
    case '14D_ASSESSMENT':
      return <MultiUserAssessmentPage />;
    case 'ADMIN':
      return <Admin />;
    // DELETE: MONITORING, COMMUNICATIONS, STAFF, STUDENTS, ATTENDANCE cases
    default:
      return <Dashboard />;
  }
};
```

### 5. Update Dashboard Navigation
**File:** src/pages/Dashboard.tsx

Update menu to show only 3 features:
- First Opinion Engine
- 14-Dimension Diagnostic
- Reverse Simulation Engine

---

## 🗑️ Deletion Checklist

### Pages to Delete:
- [ ] src/pages/Monitoring.tsx
- [ ] src/pages/Communications.tsx
- [ ] src/pages/Staff.tsx
- [ ] src/pages/Students.tsx
- [ ] src/pages/Attendance.tsx

### Components to Audit & Delete:
- [ ] src/components/EWSIRAssessment/ (if not shared)
- [ ] src/components/SchoolDataHub.tsx
- [ ] src/components/SaathiChatbot.tsx
- [ ] src/components/ObjectiveDataImport.tsx
- [ ] src/components/CustomDomainModal.tsx

### Verify No Broken Imports:
- [ ] Check all pages for removed component imports
- [ ] Check store for removed feature references
- [ ] Check navigation for removed routes

---

## 🧹 Cleanup Order

### Phase 1: Rename First Opinion (CRITICAL)
1. Rename Checkup.tsx → FirstOpinionPage.tsx
2. Update types.ts ViewState
3. Update App.tsx imports & switch
4. Test: FIRST_OPINION view works
5. **Commit:** "refactor: Rename Checkup to FirstOpinionPage"

### Phase 2: Update Navigation
1. Update Dashboard.tsx menu
2. Update AppLayout.tsx navigation
3. Remove menu items for deleted features
4. Test: Navigation shows only 3 features
5. **Commit:** "refactor: Update navigation for 3-feature standalone app"

### Phase 3: Delete Non-Core Pages
1. Delete Monitoring.tsx, Communications.tsx, etc.
2. Remove from App.tsx (already done in Phase 1)
3. Update store if needed
4. **Commit:** "refactor: Remove non-core feature pages"

### Phase 4: Delete Non-Core Components
1. Identify which components are admin-only
2. Delete SchoolDataHub.tsx, SaathiChatbot.tsx, etc.
3. Check for broken imports
4. **Commit:** "refactor: Remove non-core admin components"

### Phase 5: Verify & Test
1. Build: `npm run build` - No errors
2. Test: All 3 features load
3. Test: Navigation works
4. Test: No console errors
5. **Commit:** "test: Verify 3-feature consolidation"

### Phase 6: Deploy
1. Push to main
2. GitHub Actions deploys
3. Verify: https://disha-diagnostics.web.app/
4. **Status:** ✅ Consolidated

---

## 📝 Standalone Feature Pipelines

### Feature 1: First Opinion Engine Pipeline
```
User uploads data
    ↓
File validation (FileAnalyzer)
    ↓
Score calculation (DISHAScoreCalculator)
    ↓
Insight generation (DiagnosisGenerator)
    ↓
First Opinion Report generated
    ↓
Results displayed in dashboard
```

### Feature 2: 14-Dimension Diagnostic Pipeline
```
School configures assessment
    ↓
Stakeholders invited (Teachers, Parents, Students)
    ↓
Responses collected (MultiUserAssessment)
    ↓
Real-time analysis
    ↓
14-Dimension scores calculated
    ↓
Gap analysis & recommendations
```

### Feature 3: Reverse Simulation Engine Pipeline
```
Compare: Analyze current state
    ↓
Simulate: Model different scenarios
    ↓
Synthesize: Generate recommendations
    ↓
Results displayed with visualizations
```

---

## ✅ Success Criteria

- [x] All 3 features identified and confirmed built
- [ ] First Opinion renamed and working
- [ ] Navigation shows only 3 features
- [ ] All 5 non-core pages deleted
- [ ] No broken imports in codebase
- [ ] Build succeeds: `npm run build`
- [ ] App deploys successfully
- [ ] All 3 features accessible from Dashboard
- [ ] No console errors in browser
- [ ] Ready for v2/latest version implementations

---

**Estimated Time:** 30-45 minutes  
**Risk Level:** LOW (Simple rename + deletion, all features already work)  
**Impact:** Cleaner, focused 3-feature app

---

## Next Steps After Consolidation

1. **First Opinion Engine** - Update to latest Cloud Functions implementation
2. **14-Dimension Diagnostic** - Implement v2 methodology (60+ metrics, 1:1 matching)
3. **Reverse Simulation** - Update to latest version with new features

