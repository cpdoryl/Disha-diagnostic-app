# DISHA Stage 3: CORRECTED IMPLEMENTATION PLAN
## Firebase Cloud Functions Architecture (NOT Express Backend)

**Date:** August 27, 2026  
**Status:** ✅ CORRECTED - Ready for Development  
**Pattern:** Following existing 14D Framework & First Opinion Engine v3

---

## 🎯 IMPORTANT CORRECTION

### ❌ WRONG APPROACH (Previously Documented)
- Node.js Express server (`src/backend/`)
- Separate API layer
- Traditional REST endpoints
- Custom package.json for backend

### ✅ CORRECT APPROACH (Firebase Cloud Functions)
- Firebase Cloud Functions Gen 2 (`functions/src/reverseSimulation/`)
- HTTP Callables (not REST)
- Node.js 20 runtime
- Reuse `functions/package.json`
- Follow 14D Framework pattern

---

## 📁 CORRECTED FOLDER STRUCTURE

```
disha-diagnostic-engine/
├── functions/
│   ├── src/
│   │   ├── 14d/                    (Existing - 14D Framework)
│   │   ├── firstOpinion/           (Existing - First Opinion Engine)
│   │   │
│   │   └── reverseSimulation/      ← NEW: Stage 3 Cloud Functions
│   │       ├── calculationEngine.ts   (Core calculation logic)
│   │       ├── goalSetting.ts         (Goal management function)
│   │       ├── calculations.ts        (Reverse calculation function)
│   │       ├── feasibility.ts         (Feasibility analysis function)
│   │       ├── actionMapping.ts       (Action planning function)
│   │       ├── allocation.ts          (Resource allocation function)
│   │       ├── timeline.ts            (Timeline generation function)
│   │       ├── __tests__/
│   │       │   ├── calculations.test.ts
│   │       │   ├── feasibility.test.ts
│   │       │   ├── actionMapping.test.ts
│   │       │   └── ...
│   │       └── index.ts               (Function exports)
│   │
│   ├── package.json                (Shared for all functions)
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/index.ts                (Main Cloud Functions entry)
│
└── src/                            (Existing React Frontend)
    ├── pages/
    ├── components/
    ├── hooks/
    │   └── useReverseSimulation.ts (Calls Cloud Functions)
    └── services/
        └── reverseSimulationService.ts (API client)
```

**DELETE:** All files in `reverse-simulation-engine/src/backend/` are NOT NEEDED

---

## 🔧 CLOUD FUNCTION PATTERN

### Basic Structure (Template)

```typescript
// functions/src/reverseSimulation/goalSetting.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const logger = functions.logger;

/**
 * Set Goal for Reverse Simulation
 * HTTP Callable Cloud Function
 */
export const setGoalSetting = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      // 1. Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        );
      }

      const userId = context.auth.uid;

      // 2. Validate input
      if (!data.simulationId || !data.goalData) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Missing required fields'
        );
      }

      logger.info('Setting goal', { userId, simulationId: data.simulationId });

      // 3. Save to Firestore
      await db
        .collection('schools')
        .doc(userId)
        .collection('reverseSimulations')
        .doc(data.simulationId)
        .collection('goalSetting')
        .doc('current')
        .set({
          ...data.goalData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // 4. Return response
      return {
        success: true,
        message: 'Goal setting saved',
        goalSetting: data.goalData,
      };
    } catch (error) {
      logger.error('Error setting goal', error);
      throw error;
    }
  });
```

### Export in Main Index

```typescript
// functions/src/index.ts

// Existing imports
import * as admin from 'firebase-admin';

admin.initializeApp();

// Existing 14D functions
export { calculateMetrics, runGapAnalysis, generateRecommendations } from './14d';

// Existing First Opinion functions
export { submitChallengeResponse, generateFirstOpinionReport } from './firstOpinion';

// NEW: Stage 3 Reverse Simulation functions
export {
  setGoalSetting,
  performReverseCalculation,
  analyzeFeasibility,
  generateActionPlan,
  allocateResources,
  generateTimeline,
} from './reverseSimulation';
```

---

## 📋 CORRECTED IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Aug 27 - Sep 3) ✅

- [x] MASTER_FRAMEWORK.md (updated for Cloud Functions)
- [x] TECHNICAL_ARCHITECTURE.md (updated for Cloud Functions)
- [x] DATABASE_SCHEMA.md (still valid - no changes needed)
- [x] CalculationEngine.ts (already created)
- [x] This correction document

### Phase 2: Cloud Functions Development (Sep 10-23)

#### Week 3: Core Functions

**Days 1-2: Goal Setting & Calculations**
- [ ] goalSetting.ts - HTTP Callable (8h)
  - Input: current assessment, target, timeline, budget
  - Output: Saved goal setting in Firestore
  - Pattern: Use functions logger & error handling

- [ ] calculations.ts - HTTP Callable (12h)
  - Input: goal setting data
  - Output: Reverse calculations saved to Firestore
  - Reuse: CalculationEngine.ts (move to functions folder)

**Days 3-4: Feasibility & Actions**
- [ ] feasibility.ts - HTTP Callable (12h)
  - Input: calculated targets, timeline, budget
  - Output: Feasibility scores, risks, contingencies

- [ ] actionMapping.ts - HTTP Callable (12h)
  - Input: dimension targets
  - Output: Action plan with activities

**Days 5: Resource Allocation**
- [ ] allocation.ts - HTTP Callable (12h)
  - Input: actions, total budget
  - Output: Budget allocation by tier with ROI

#### Week 4: Timeline & APIs

**Days 1-2: Timeline Function**
- [ ] timeline.ts - HTTP Callable (8h)
  - Input: actions, duration
  - Output: 12-month plan with milestones & KPIs

**Days 3-4: Testing & Integration**
- [ ] Create __tests__/ directory structure (4h)
- [ ] Unit tests for each function (16h)
- [ ] Integration tests with Firestore emulator (8h)
- [ ] Deploy to staging (4h)

### Phase 3: Frontend Integration (Sep 24 - Oct 7)

- [ ] Update API client service to call Cloud Functions
- [ ] Build React components (Goal Setting Wizard, Dashboards, etc.)
- [ ] E2E tests with real Cloud Functions
- [ ] Staging deployment & UAT

### Phase 4: Production (Oct 8-14)

- [ ] QA sign-off
- [ ] Deploy to production (`firebase deploy --only functions`)
- [ ] Monitor Cloud Function performance
- [ ] User training & launch

---

## 🚀 HOW TO CALL CLOUD FUNCTIONS FROM FRONTEND

### From React Component

```typescript
// src/hooks/useReverseSimulation.ts

import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export function useReverseSimulation() {
  const performCalculation = async (data) => {
    const reverseCalculate = httpsCallable(
      functions,
      'performReverseCalculation'
    );
    
    const result = await reverseCalculate({
      simulationId: data.simulationId,
      currentHealth: data.currentHealth,
      currentDimensions: data.currentDimensions,
      targetHealth: data.targetHealth,
      timeline: data.timeline,
      budget: data.budget,
    });
    
    return result.data;
  };

  return { performCalculation };
}
```

### Usage in Component

```typescript
// src/pages/CalculationPage.tsx

export function CalculationPage() {
  const { performCalculation } = useReverseSimulation();

  const handleCalculate = async () => {
    try {
      const result = await performCalculation({
        simulationId: 'sim-123',
        currentHealth: 72,
        currentDimensions: { D01: 75, D02: 70, ... },
        targetHealth: 80,
        timeline: 12,
        budget: 5000000,
      });
      
      console.log('Calculations:', result.calculations);
    } catch (error) {
      console.error('Calculation failed:', error);
    }
  };

  return <button onClick={handleCalculate}>Calculate</button>;
}
```

---

## ⚙️ DEPLOYMENT

### Deploy Cloud Functions

```bash
cd disha-diagnostic-engine
firebase deploy --only functions

# Or deploy specific function:
firebase deploy --only functions:performReverseCalculation
```

### Test Locally

```bash
# Start emulator
firebase emulators:start

# In another terminal
firebase functions:shell

# Test function
> reverseSimulation.performReverseCalculation({
    simulationId: 'test-123',
    currentHealth: 72,
    ...
  })
```

---

## ✅ DELETE FROM NEW STRUCTURE

### Remove Unnecessary Files

```bash
# These are NOT needed:
rm -rf reverse-simulation-engine/src/backend/
rm reverse-simulation-engine/src/backend/utils/logger.ts
rm reverse-simulation-engine/package.json
rm reverse-simulation-engine/tsconfig.json
rm reverse-simulation-engine/DEVELOPMENT_SETUP.md
```

**Keep:** Documentation in `reverse-simulation-engine/docs/` (but update for Cloud Functions)

---

## 📊 SUMMARY TABLE

| Aspect | Before (Wrong) | After (Correct) |
|--------|---|---|
| **Backend** | Express.js server | Cloud Functions Gen 2 |
| **Location** | `src/backend/services/` | `functions/src/reverseSimulation/` |
| **API Type** | REST endpoints | HTTP Callables |
| **Package** | New `src/backend/package.json` | Reuse `functions/package.json` |
| **Runtime** | Node.js 18+ | Node.js 20 (Cloud Functions) |
| **Deployment** | Deploy express server | `firebase deploy --only functions` |
| **Pattern** | Custom | Identical to 14D & FOE v3 |
| **Database** | Firestore + custom APIs | Firestore directly from Cloud Functions |

---

## 🎯 WHAT'S READY TO BUILD

✅ **CalculationEngine.ts** - Already implemented (move to functions folder)
✅ **Database Schema** - Already defined (Firestore collections)
✅ **Frontend Components** - Ready to build (React components)
✅ **Documentation** - Corrected (Cloud Functions pattern)

❌ **NOT NEEDED:**
- Express.js server
- src/backend folder
- Traditional REST API layer
- New backend package.json

---

## ✨ NEXT STEPS

1. **Confirm understanding** - You and team understand Cloud Functions pattern
2. **Move files** - Move `calculationEngine.ts` to `functions/src/reverseSimulation/`
3. **Create functions** - Implement 6 Cloud Functions (goalSetting, calculations, etc.)
4. **Update frontend** - Build React components & API client service
5. **Deploy** - Use `firebase deploy --only functions`
6. **Test** - Use emulator & staging before production

---

**Status:** ✅ CORRECTED - Ready for Implementation  
**Next Milestone:** September 10, 2026 (Sprint 2 Kickoff)  
**Target Launch:** October 15, 2026

**LET'S BUILD WITH THE RIGHT ARCHITECTURE! 🚀**
