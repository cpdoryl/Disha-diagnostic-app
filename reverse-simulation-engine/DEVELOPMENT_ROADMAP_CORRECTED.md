# DISHA Stage 3: Corrected Development Roadmap
## Firebase Cloud Functions Implementation

**Effective Date:** August 27, 2026  
**Architecture:** Firebase Cloud Functions Gen 2 (NOT Express Backend)  
**Pattern:** Following 14D Framework & First Opinion Engine v3  
**Status:** ✅ Ready for Sprint 2

---

## 🎯 Project Timeline

```
PHASE 1: Foundation ✅ COMPLETE (Aug 27-Sep 3)
├── Architecture corrected
├── Documentation updated
├── CalculationEngine implemented
└── Cloud Functions pattern confirmed

PHASE 2: Cloud Functions Development (Sep 10-23)
├── Week 3: 6 Core functions + tests
├── Week 4: Integration + staging deploy
└── Ready: ~52 hours

PHASE 3: Frontend Integration (Sep 24-Oct 7)
├── React components & hooks
├── E2E tests
├── UAT
└── Ready: ~80 hours

PHASE 4: Production Deployment (Oct 8-14)
├── QA sign-off
├── Production deploy
├── Monitoring setup
└── Launch: Oct 15
```

---

## 📋 Sprint 2: Cloud Functions Development (Sep 10-23)

### Week 3 (Sep 10-16): Implement Core Functions

#### Day 1-2: Goal Setting & Reverse Calculation

| Function | File | Effort | Owner |
|----------|------|--------|-------|
| **setGoalSetting** | `goalSetting.ts` | 8h | Backend |
| **performReverseCalculation** | `calculations.ts` | 12h | Backend |
| Tests for both | `__tests__/` | 4h | QA |
| **Subtotal** | | **24h** | |

**Deliverables:**
- ✅ Goal setting saved to Firestore
- ✅ Reverse calculations computed & stored
- ✅ Full test coverage with emulator
- ✅ Functions ready to call from frontend

#### Day 3-4: Feasibility & Action Mapping

| Function | File | Effort | Owner |
|----------|------|--------|-------|
| **analyzeFeasibility** | `feasibility.ts` | 12h | Backend |
| **generateActionPlan** | `actionMapping.ts` | 12h | Backend |
| Tests for both | `__tests__/` | 4h | QA |
| **Subtotal** | | **28h** | |

**Deliverables:**
- ✅ Feasibility scores by dimension
- ✅ Risk identification & contingency plans
- ✅ Action plans with activities
- ✅ Full test coverage

#### Day 5: Resource Allocation

| Function | File | Effort | Owner |
|----------|------|--------|-------|
| **allocateResources** | `allocation.ts` | 12h | Backend |
| Tests | `__tests__/` | 3h | QA |
| Code review | (All functions) | 2h | Lead |
| **Week 3 Total** | | **45h** | |

**Deliverables:**
- ✅ Budget allocation by tier
- ✅ Cost-benefit analysis
- ✅ ROI calculations
- ✅ All Week 3 functions complete + tested

---

### Week 4 (Sep 17-23): Timeline & Deployment

#### Day 1-2: Timeline Function

| Task | File | Effort | Owner |
|------|------|--------|-------|
| **generateTimeline** | `timeline.ts` | 8h | Backend |
| Tests | `__tests__/` | 2h | QA |
| Integration tests | (All functions) | 6h | QA |
| **Subtotal** | | **16h** | |

**Deliverables:**
- ✅ 12-month phased plan
- ✅ Milestones & KPIs
- ✅ All functions working together
- ✅ Full integration test suite

#### Day 3-4: Staging & Optimization

| Task | Effort | Owner |
|------|--------|-------|
| Performance testing | 4h | DevOps |
| Deploy to staging | 2h | DevOps |
| Staging tests | 6h | QA |
| Bug fixes (if any) | 4h | Backend |
| **Subtotal** | **16h** | |

#### Day 5: Documentation & Handoff

| Task | Effort | Owner |
|------|--------|-------|
| Update API docs | 2h | Backend |
| Create deployment guide | 2h | DevOps |
| Team training | 2h | Lead |
| Code review sign-off | 2h | Lead |
| **Week 4 Total** | **40h** | |

**End of Sprint 2: All 6 Cloud Functions deployed to staging** ✅

---

## 📁 Implementation Structure

### Repository Layout

```
functions/
├── src/
│   ├── reverseSimulation/              ← NEW: Stage 3
│   │   ├── calculationEngine.ts        (Core logic - moved from reverseSimulation/src)
│   │   ├── goalSetting.ts              (HTTP Callable)
│   │   ├── calculations.ts             (HTTP Callable)
│   │   ├── feasibility.ts              (HTTP Callable)
│   │   ├── actionMapping.ts            (HTTP Callable)
│   │   ├── allocation.ts               (HTTP Callable)
│   │   ├── timeline.ts                 (HTTP Callable)
│   │   ├── index.ts                    (Export all functions)
│   │   └── __tests__/
│   │       ├── calculationEngine.test.ts
│   │       ├── goalSetting.test.ts
│   │       ├── calculations.test.ts
│   │       ├── feasibility.test.ts
│   │       ├── actionMapping.test.ts
│   │       ├── allocation.test.ts
│   │       └── timeline.test.ts
│   │
│   ├── 14d/                            (Existing)
│   ├── firstOpinion/                   (Existing)
│   ├── analysis/                       (Existing)
│   └── index.ts                        (Main entry - export all)
│
├── package.json                        (Shared dependencies)
├── tsconfig.json
└── vitest.config.ts
```

### Frontend Structure

```
src/
├── hooks/
│   └── useReverseSimulation.ts         (Call Cloud Functions)
│
├── services/
│   └── reverseSimulationService.ts     (API client for functions)
│
├── components/
│   ├── GoalSetting/
│   ├── Calculations/
│   ├── Feasibility/
│   ├── ActionMapping/
│   ├── ResourceAllocation/
│   └── Timeline/
│
└── pages/
    ├── GoalSettingPage.tsx
    ├── CalculationPage.tsx
    ├── FeasibilityPage.tsx
    ├── ActionMappingPage.tsx
    ├── ResourceAllocationPage.tsx
    └── TimelinePage.tsx
```

---

## 🔧 Key Patterns to Follow

### 1. Authentication Check
```typescript
if (!context.auth) {
  throw new functions.https.HttpsError(
    'unauthenticated',
    'User must be authenticated'
  );
}
```

### 2. Input Validation
```typescript
if (!data.simulationId || !data.goalData) {
  throw new functions.https.HttpsError(
    'invalid-argument',
    'Missing required fields'
  );
}
```

### 3. Firestore Write
```typescript
await db
  .collection('schools')
  .doc(context.auth.uid)
  .collection('reverseSimulations')
  .doc(data.simulationId)
  .collection('goalSetting')
  .doc('current')
  .set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
```

### 4. Error Handling & Logging
```typescript
try {
  // Function logic
  functions.logger.info('Operation completed', { userId });
  return { success: true, data };
} catch (error) {
  functions.logger.error('Operation failed', error);
  throw error;
}
```

### 5. Export in Index
```typescript
export { setGoalSetting, performReverseCalculation, ... } from './reverseSimulation';
```

---

## 📊 Sprint 2 Effort Breakdown

```
Total Sprint 2 Effort: ~85 hours

Backend Development:      52 hours
├─ 6 Cloud Functions     (56 hours theoretical)
├─ CalculationEngine     (already done, move it: 2h)
├─ Integration fixes     (4h)
└─ Lead review          (2h)

QA & Testing:           20 hours
├─ Unit tests           (10h)
├─ Integration tests    (6h)
├─ Staging tests        (4h)

DevOps & Deployment:    8 hours
├─ Setup staging        (2h)
├─ Performance testing  (4h)
├─ Monitoring setup     (2h)

Documentation:          5 hours
├─ API docs             (2h)
├─ Deployment guide     (2h)
├─ Team training        (1h)
```

---

## ✅ Phase 2 Definition of Done

**All 6 Functions Deployed to Staging:**
- [ ] goalSetting - saves goal data to Firestore
- [ ] calculations - runs reverse calculation, saves results
- [ ] feasibility - analyzes feasibility, identifies risks
- [ ] actionMapping - generates action plan with activities
- [ ] allocation - allocates budget by tier with ROI
- [ ] timeline - generates 12-month plan with milestones

**Testing Complete:**
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests with emulator
- [ ] End-to-end tests in staging
- [ ] Performance tests passed
- [ ] All error scenarios tested

**Documentation Complete:**
- [ ] API documentation updated
- [ ] Deployment guide ready
- [ ] Function signatures documented
- [ ] Firestore schema documented

**Ready for Phase 3:**
- [ ] Cloud Functions stable & tested
- [ ] Frontend developers ready to integrate
- [ ] Database schema finalized
- [ ] Staging environment validated

---

## 🚀 Sprint 3: Frontend Integration (Sep 24-Oct 7)

### Week 5: React Components

| Component | Effort | Owner |
|-----------|--------|-------|
| Goal Setting Wizard | 16h | Frontend |
| Calculation Dashboard | 16h | Frontend |
| Feasibility Assessment | 8h | Frontend |
| Integration testing | 8h | QA |
| **Week 5 Total** | **48h** | |

### Week 6: Complete & Test

| Task | Effort | Owner |
|------|--------|-------|
| Action Mapping UI | 6h | Frontend |
| Resource Allocation UI | 8h | Frontend |
| Timeline & Monitoring | 8h | Frontend |
| E2E tests | 12h | QA |
| UAT preparation | 4h | QA |
| **Week 6 Total** | **38h** | |

**End of Sprint 3: Complete app deployed to staging for UAT** ✅

---

## 🎯 Sprint 4: Production (Oct 8-14)

```
Oct 8:  QA sign-off
Oct 9:  Production code review
Oct 10: Deploy to production
Oct 11: Smoke tests & monitoring
Oct 12: User training
Oct 13: Final checks
Oct 14: Standby for issues
Oct 15: Launch! 🚀
```

---

## 📊 Resource Allocation

### Team (8 FTE)

| Role | FTE | Sprint 2 | Sprint 3 | Sprint 4 |
|------|-----|---------|---------|---------|
| Backend | 2.0 | 52h | 8h | 8h |
| Frontend | 2.0 | - | 48h | 8h |
| QA | 1.5 | 20h | 24h | 12h |
| DevOps | 0.5 | 8h | 4h | 12h |
| Lead | 1.0 | 5h | 8h | 8h |
| **Total** | **8.0** | **85h** | **92h** | **48h** |

---

## ✨ Key Differences from Original Plan

| Original | Corrected |
|----------|-----------|
| Express backend server | Cloud Functions Gen 2 |
| REST API endpoints | HTTP Callables |
| `src/backend/` folder | `functions/src/reverseSimulation/` |
| New backend package.json | Reuse `functions/package.json` |
| Custom middleware | Cloud Functions built-in |
| Deploy as Express app | `firebase deploy --only functions` |

---

## 🎉 Ready to Build!

**Phase 2 Starting:** September 10, 2026

**What's Needed:**
1. ✅ CalculationEngine.ts - move to `functions/src/reverseSimulation/`
2. ✅ Firebase emulator setup guide
3. ✅ Template Cloud Function for first implementation
4. ✅ Team readiness for serverless development

**First Task for Team:**
- Understand Cloud Functions HTTP Callable pattern
- Review existing 14D function implementation
- Set up Firebase emulator locally
- Begin implementing goalSetting.ts

---

**Status:** ✅ CORRECTED & READY  
**Next Milestone:** September 10, 2026 (Sprint 2 Kickoff)  
**Target Launch:** October 15, 2026

**LET'S BUILD WITH CLOUD FUNCTIONS! 🚀**
