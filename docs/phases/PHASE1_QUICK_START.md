# Phase 1 Quick Start - First Opinion Engine v3

**CPDO Development Sprint**
**Duration: 4 Weeks**
**Start Date: 2026-08-22**

---

## What We're Building

The DISHA First Opinion Engine - a comprehensive school diagnostic that combines:
- **15 Leadership Challenges** (C1-C15) across 6 domains
- **8 Objective Multipliers** (operational health metrics)
- **3 Composite Scores** (S_sub, M_obj, Health Index)
- **Real-time Response Tracking** for 5 stakeholder roles

**Result:** Single diagnostic number (0-100) + 6-section report revealing school health

---

## Before You Start

### Required Reading (20 mins)
1. `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` - The spec
2. `FIRST_OPINION_ENGINE_TECH_STACK.md` - Architecture
3. `PHASE1_IMPLEMENTATION_GUIDE.md` - Step-by-step

### Environment Setup
```bash
# Clone the repo
git clone https://github.com/cpdoryl/Disha-diagnostic-app.git
cd disha-diagnostic-engine

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start dev server
npm run dev
```

### Firebase Already Configured
- ✅ Project: `disha-diagnostics`
- ✅ Firestore database ready
- ✅ Cloud Functions deployed
- ✅ Authentication enabled

---

## Phase 1 Execution (4 Weeks)

### Week 1-2: Database Schema & Data Models

**Day 1-2: Create Firestore Types**
```bash
# Create the file
touch src/lib/firebase/firstOpinionSchema.ts

# Add all TypeScript interfaces:
# - School
# - AssessmentCycle
# - ChallengeResponse
# - Multiplier
# - ReportSnapshot
```

**Day 3: Load Challenge Data**
```bash
# Create challenge definitions
mkdir -p src/data/firstOpinion
touch src/data/firstOpinion/challenges.json
touch src/data/firstOpinion/multipliers.json
touch src/data/firstOpinion/domains.json

# Use structure from PHASE1_IMPLEMENTATION_GUIDE.md
# Copy the JSON examples for:
# - All 15 challenges (C1-C15)
# - All 8 multipliers with thresholds
# - Domain definitions
```

**Day 4-5: Create Firestore Collections**
```bash
# In Firebase Console:
# 1. Create collection: schools
# 2. Create collection: assessmentCycles
# 3. Add subcollection structure:
#    - assessmentCycles/{schoolId}/challengeResponses
#    - assessmentCycles/{schoolId}/multipliers
#    - assessmentCycles/{schoolId}/reportSnapshot
# 4. Create collection: multiplierDataCards
# 5. Create collection: trendHistory
```

**Day 6: Add Security Rules**
```bash
# Update firebase.json firestore rules section
# Use role-based access:
# - ADMIN can write/read all
# - TEACHER can write own responses
# - PARENT can write own responses
# - Students can read own reports only
```

**Day 7: Test Data Ingestion**
```bash
# Create seed data script
npm run seed:firstOpinion

# Verify in Firebase Console:
# - schools collection has test school
# - assessmentCycles has 1 draft cycle
# - multiplierDataCards populated
```

### Week 2-3: Core Calculation Engines

**Day 8-9: Implement S_sub Engine**
```bash
# Create calculations file
touch src/lib/firstOpinion/calculations.ts

# Implement function:
export function calculateSsub(
  responses: ChallengeResponse[],
  weights: Record<string, number>
): number
```

**Test S_sub with worked example:**
- Input: Teacher responses to C1 screening Qs
- Expected S_sub: 78.5 (from doc example)
- Verify with unit test

**Day 10: Implement M_obj Engine (Geometric Mean)**
```typescript
export function calculateMobj(multipliers: Multiplier[]): number {
  // Geometric mean: (m1 × m2 × ... × m8)^(1/8)
  // Input: 8 multipliers (0-1.0 scale)
  // Output: 0-100 scale
}
```

**Test M_obj:**
- All 8 multipliers at 0.8 → M_obj = 80
- Multiplier dropout handled gracefully
- Verification: M_obj doesn't exceed 100

**Day 11: Implement Health Index + Delusion Penalty**
```typescript
export function calculateHealthIndex(s_sub: number, m_obj: number): number {
  // H = MAX(0, MIN(100, (S_sub × M_obj) - Delusion_Penalty))
  // If S_sub ≥ 80: penalty = S_sub - 80
  // Else: penalty = 0
}
```

**Test Health Index:**
- S_sub=78, M_obj=82 → H = 64.3 ✓
- S_sub=90, M_obj=80 → H = 72 - 10 = 62 ✓
- Delusion penalty prevents false positives

**Day 12: Implement Gap & Quadrant Logic**
```typescript
export function calculateGapAndQuadrant(s_sub: number, m_obj: number) {
  // Gap = S_sub - M_obj (scaled to 0-100)
  // Quadrants:
  // - Gap < 30: REALITY_BETTER (communication gap)
  // - 30-70: ALIGNED (credible)
  // - Gap > 70: PERCEPTION_BETTER (blind spot)
}
```

**Test all 4 engines together:**
```bash
npm test -- calculations.test.ts

# Expected: All tests pass
# - S_sub matches worked example
# - M_obj prevents compounding
# - H formula correct
# - Gap quadrant classification accurate
```

**Day 13-14: Challenge Severity & Driver Analysis**
```typescript
export function calculateChallengeDrivers(
  responses: ChallengeResponse[],
  weights: Record<string, number>
) {
  // Rank challenges by severity
  // Calculate % contribution to overall concern
  // Identify top 3 drivers
}
```

### Week 3: Data Validation & Response Handling

**Day 15: Implement Response Validation**
```typescript
export function validateChallengeResponses(
  responses: ChallengeResponse[],
  challengeId: string
): ValidationResult {
  // Check for:
  // - Required fields (responderId, role, email)
  // - Option ranges (1 ≤ option ≤ max)
  // - Fact-based answers have data source
  // - No duplicate submissions per respondent
}
```

**Day 16-17: Fact-vs-Perception Tagging**
```typescript
interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  factVsPerceptionBreakdown: {
    factBased: number
    perceptionBased: number
  }
}

// For each question in challenge:
// - Identify if FACT-BASED (checkable number)
// - Identify if PERCEPTION-BASED (judgment)
// - Tag with source system if fact
// - Provide audit trail
```

**Day 18: Data Quality Audit Trail**
```typescript
interface DataAuditTrail {
  responderId: string
  submittedAt: timestamp
  source: string // "web_form", "api", "import"
  validationStatus: "VALID" | "FLAGGED" | "REJECTED"
  issues: string[]
  facts: { system: string; extractedAt: timestamp }[]
}

// Store with every response
```

**Day 19-21: Integration Testing**
```bash
# Test full flow:
# 1. Submit 10 challenge responses
# 2. Trigger S_sub calculation
# 3. Sync 8 multipliers
# 4. Calculate M_obj + H
# 5. Generate quadrant
# 6. Verify dashboard updates

npm test -- integration/firstOpinion.test.ts
```

### Week 4: Real-time Listeners & Dashboard

**Day 22: Real-time Challenge Response Listener**
```typescript
// lib/firebase/realtime.ts
export function setupChallengeResponseListener(
  schoolId: string,
  cycleId: string,
  onUpdate: (responses: ChallengeResponse[], stats) => void
) {
  onSnapshot(
    query(
      getChallengeResponsesRef(schoolId, cycleId),
      where('deleted', '==', false)
    ),
    snapshot => {
      const responses = snapshot.docs.map(doc => doc.data())
      const stats = calculateResponseStats(responses)
      onUpdate(responses, stats)
    }
  )
}
```

**Day 23: Real-time Multiplier Updates**
```typescript
export function setupMultiplierListener(
  schoolId: string,
  cycleId: string,
  onUpdate: (multipliers: Multiplier[]) => void
) {
  onSnapshot(
    getMultipliersRef(schoolId, cycleId),
    snapshot => {
      const multipliers = snapshot.docs.map(doc => doc.data())
      onUpdate(multipliers)
    }
  )
}
```

**Day 24-25: Build Dashboard Components**

```bash
mkdir -p src/components/FirstOpinion

# Create:
# HealthIndexGauge.tsx - Visual gauge (0-100)
# MultiplierCard.tsx - Individual multiplier card
# DriverRanking.tsx - Challenge severity ranking
# QuadrantChart.tsx - Gap-based quadrant visualization
# ResponseAggregator.tsx - Live response counts
```

**Health Index Gauge Example:**
```typescript
// Green (80+), Yellow (60-80), Orange (40-60), Red (<40)
// Shows trend arrow (↑↓→)
// Real-time updates as responses arrive
```

**Driver Ranking Example:**
```typescript
// List all 15 challenges
// Sort by severity (highest concern first)
// Show % contribution to overall S_sub
// Highlight top 3 (if 61%+ of concern)
```

**Day 26-27: Assessment Flow Components**

```bash
# Create:
# ChallengeForm.tsx - 15-challenge form entry
# ResponseSummary.tsx - Submitted responses view
# CycleManagement.tsx - Create/close cycles

# Features:
# - Per-challenge question rendering
# - Multi-question aggregation
# - Submit validation
# - Role-based access
```

**Day 28: Testing & Verification**

```bash
# Run full test suite
npm test -- src/components/FirstOpinion
npm test -- src/lib/firstOpinion
npm test -- src/lib/firebase

# Manual testing checklist:
✓ Create assessment cycle
✓ Add 10+ respondents
✓ Submit challenge responses
✓ Verify S_sub calculation matches worked example
✓ Sync multipliers from Firebase
✓ Verify M_obj geometric mean
✓ Check Health Index with Delusion Penalty
✓ Confirm gap quadrant classification
✓ Dashboard updates in real-time (<2sec)
✓ PDF report generates (Phase 2)
```

---

## Critical Code Paths to Implement

### Path 1: Challenge Response → S_sub
```
ChallengeForm.tsx
  ↓
POST /api/challenges/{cycleId}/responses
  ↓
Cloud Function: validate + store in Firestore
  ↓
Listener triggers: calculateSsub()
  ↓
Dashboard updates
```

### Path 2: Source System Data → M_obj
```
External API (HR, Finance, etc.)
  ↓
POST /api/multipliers/{cycleId}/sync
  ↓
Cloud Function: transform + store
  ↓
Listener triggers: calculateMobj()
  ↓
Health Index recalculated
```

### Path 3: Scores → Report
```
S_sub + M_obj ready
  ↓
calculateHealthIndex()
  ↓
calculateGap()
  ↓
Cloud Function: generateReport()
  ↓
PDF created + stored
  ↓
Dashboard displays "Report Ready"
```

---

## Key Decision Points

**Q1: How are multipliers populated initially?**
A: Manual entry form (Phase 2) or API from source system (Phase 2 integration)

**Q2: What if a school hasn't submitted all challenge responses?**
A: Use partial S_sub (weighted average of submitted challenges only). Flag missing.

**Q3: How to handle multi-stakeholder aggregation?**
A: Weight by role (e.g., 40% teacher, 30% parent, 20% student, 10% admin)

**Q4: Can respondents change their answers?**
A: Yes (Phase 2 - edit window). Version all responses with update timestamps.

---

## Troubleshooting

### S_sub calculation doesn't match doc example (78.5)
- [ ] Check challenge weights sum to 1.0
- [ ] Verify severity calculation: selected / max
- [ ] Confirm health = 1 - severity
- [ ] Validate weighted sum formula

### M_obj exceeds 100
- [ ] Geometric mean should output 0-1.0 scale
- [ ] Convert to 0-100 ONLY for reporting
- [ ] Check for invalid multiplier values (>1.0)

### Dashboard not updating in real-time
- [ ] Verify Firestore listener is attached
- [ ] Check browser console for errors
- [ ] Ensure Firestore rules allow read access
- [ ] Test with manual Firestore write

### Quadrant classification incorrect
- [ ] Gap calculation: (S_sub - M_obj) + 50
- [ ] Test with known values (e.g., S_sub=70, M_obj=80 → gap=40 → ALIGNED)
- [ ] Check threshold values (<30, 30-70, >70)

---

## Deliverables Checklist (End of Phase 1)

- [ ] All 15 challenges configured with weights in Firestore
- [ ] All 8 multipliers defined with thresholds
- [ ] S_sub calculation engine passes all unit tests
- [ ] M_obj geometric mean prevents score compounding
- [ ] Health Index formula correctly applies Delusion Penalty
- [ ] Gap-based quadrant accurately classifies perception vs reality
- [ ] Real-time listeners working (responses + multipliers)
- [ ] Dashboard components rendering correctly
- [ ] All calculation results match worked examples from v3 doc
- [ ] 95%+ test coverage on calculation engines
- [ ] Firestore security rules implemented
- [ ] Challenge response form fully functional
- [ ] Response aggregator showing live counts

---

## Success = Schema + Engines Ready for API (Phase 2)

When Phase 1 is complete:
1. **Database is bulletproof** - All 15 challenges + 8 multipliers stored & versioned
2. **Engines are verified** - S_sub, M_obj, H, Gap all tested against worked examples
3. **Real-time works** - Dashboard updates within 2 seconds of new response
4. **Quality gates active** - Fact-vs-perception tagging, validation, audit trail

**Phase 2 begins:** Build APIs to feed multiplier data from 11 source systems.

---

## Questions?

Reference Documents:
- `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` - The specification
- `FIRST_OPINION_ENGINE_TECH_STACK.md` - Architecture & database schema
- `PHASE1_IMPLEMENTATION_GUIDE.md` - Detailed step-by-step with code

Deploy Status: https://github.com/cpdoryl/Disha-diagnostic-app/actions
Live App: https://disha-diagnostics.web.app/

---

**Ready to build. Let's go.** 🚀
