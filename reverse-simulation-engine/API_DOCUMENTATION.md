# DISHA Stage 3: Reverse Simulation Engine - API Documentation

**Document Version:** 1.0  
**Date:** August 27, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Implementation Examples](#implementation-examples)
6. [Best Practices](#best-practices)

---

## Overview

The DISHA Stage 3 Reverse Simulation Engine provides 6 HTTP Callable Cloud Functions that implement a complete 7-step reverse outcome modeling process.

### Architecture
- **Runtime:** Firebase Cloud Functions Gen 2 (Node.js 20)
- **Language:** TypeScript
- **Database:** Google Cloud Firestore
- **Auth:** Firebase Authentication

### 6 Functions

| # | Function | Purpose | Input | Output |
|---|----------|---------|-------|--------|
| 1 | `setGoalSetting` | Define target goals and timeline | Current/target health, budget, timeline | Goal with challenge score |
| 2 | `performReverseCalculation` | Calculate dimension targets | Current dimensions, target health, budget | Dimension targets, budget allocation |
| 3 | `analyzeFeasibility` | Assess achievability | Current/target dimensions, timeline, budget | Feasibility scores, risk levels |
| 4 | `generateActionPlan` | Define interventions | Dimension targets, current dims, budget | Action plan with activities |
| 5 | `allocateResources` | Allocate budget by tier | Feasibility results, budget | Tier allocation, ROI analysis |
| 6 | `generateTimeline` | Create implementation schedule | Action plan, dimensions, timeline | 12-month phased plan |

---

## Authentication

All functions require Firebase Authentication.

### Required Headers
```javascript
// Automatically handled by Firebase SDK
Authorization: Bearer <idToken>
```

### Error: Unauthenticated
```json
{
  "code": "unauthenticated",
  "message": "User must be authenticated"
}
```

---

## API Endpoints

### 1. SET GOAL SETTING

**Function Name:** `setGoalSetting`

**Purpose:** Save and validate goal setting with challenge scoring

**URL:** `https://us-central1-{project-id}.cloudfunctions.net/setGoalSetting`

#### Request

```typescript
interface SetGoalSettingRequest {
  simulationId: string;           // Unique simulation identifier
  schoolId?: string;              // Optional: defaults to authenticated userId
  currentHealth: number;          // 0-100
  targetHealth: number;           // Must be > currentHealth
  timelineMonths: number;         // 3-24 months
  budget: number;                 // In rupees, must be positive
  priority?: string;              // 'academic' | 'holistic' | 'custom' (default: 'holistic')
}
```

#### Response

```typescript
{
  success: true,
  message: "Goal setting saved successfully",
  goalSetting: {
    currentHealth: 72,
    targetHealth: 80,
    gap: 8,
    gapPercentage: 11.11,
    timelineMonths: 12,
    budget: 5000000,
    priority: "holistic",
    estimatedChallenge: 45,  // 0-100 difficulty score
  },
  timestamp: "2026-08-27T10:30:00Z"
}
```

#### Example Usage

```javascript
// React Hook
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-config';

export function useReverseSimulation() {
  const setGoal = async (data) => {
    const setGoalFn = httpsCallable(functions, 'setGoalSetting');
    const result = await setGoalFn({
      simulationId: 'sim-001',
      currentHealth: 72,
      targetHealth: 80,
      timelineMonths: 12,
      budget: 5000000
    });
    return result.data;
  };

  return { setGoal };
}
```

---

### 2. PERFORM REVERSE CALCULATION

**Function Name:** `performReverseCalculation`

**Purpose:** Calculate dimension-specific targets and budget allocation

**URL:** `https://us-central1-{project-id}.cloudfunctions.net/performReverseCalculation`

#### Request

```typescript
interface PerformReverseCalculationRequest {
  simulationId: string;
  currentHealth: number;          // 0-100
  currentDimensions: {            // All 14 required
    D01: number, D02: number, ... D14: number
  };
  targetHealth: number;           // > currentHealth
  timelineMonths: number;         // 3-24
  budget: number;                 // Positive
  allocationStrategy?: string;    // 'uniform' | 'strategic' | 'aggressive'
}
```

#### Response

```typescript
{
  success: true,
  message: "Reverse calculations completed successfully",
  calculations: {
    currentHealth: 69,
    targetHealth: 78,
    requiredPoints: 85.02,
    currentPoints: 75.21,
    gap: 9.81,
    gapPercentage: 13.06,
    dimensionTargets: {
      D01: 78, D02: 73, D03: 82, ...
    },
    estimatedOutcome: 77,
    allocationStrategy: "strategic"
  },
  timestamp: "2026-08-27T10:31:00Z"
}
```

#### 14 Dimensions

```
D01: Academic Excellence (weight: 10%)
D02: Teacher Welfare (weight: 9%)
D03: Leadership Quality (weight: 10%)
D04: Parent Engagement (weight: 8%)
D05: Student Safety (weight: 10%)
D06: Infrastructure (weight: 7%)
D07: Co-Curricular (weight: 6%)
D08: Individual Attention (weight: 9%)
D09: Value for Money (weight: 7%)
D10: Special Needs (weight: 6%)
D11: Community Service (weight: 5%)
D12: Faculty Competence (weight: 9%)
D13: Internationalism (weight: 6%)
D14: Management Vision (weight: 8%)
```

#### Example Usage

```javascript
const result = await performReverseCalculation({
  simulationId: 'sim-001',
  currentHealth: 72,
  currentDimensions: {
    D01: 70, D02: 65, D03: 75, D04: 60, D05: 80,
    D06: 55, D07: 72, D08: 68, D09: 70, D10: 62,
    D11: 68, D12: 75, D13: 58, D14: 70
  },
  targetHealth: 80,
  timelineMonths: 12,
  budget: 5000000,
  allocationStrategy: 'strategic'
});
```

---

### 3. ANALYZE FEASIBILITY

**Function Name:** `analyzeFeasibility`

**Purpose:** Assess achievability of targets with risk analysis

**URL:** `https://us-central1-{project-id}.cloudfunctions.net/analyzeFeasibility`

#### Request

```typescript
interface AnalyzeFeasibilityRequest {
  simulationId: string;
  currentDimensions: { D01: number, ... D14: number };
  targetDimensions: { D01: number, ... D14: number };
  timelineMonths: number;
  budget: number;
}
```

#### Response

```typescript
{
  success: true,
  message: "Feasibility analysis completed successfully",
  feasibility: {
    dimensionResults: [
      {
        dimensionId: "D01",
        currentScore: 70,
        targetScore: 78,
        gap: 8,
        gapPercentage: 11.43,
        feasibilityScore: 85,
        feasibilityBand: "Feasible",
        riskLevel: "Medium",
        recommendations: ["Implement with strategic planning"]
      },
      // ... 13 more dimensions
    ],
    overallFeasibilityScore: 72,
    overallFeasibilityBand: "Feasible",
    overallRiskLevel: "Medium",
    summary: {
      highlyFeasibleCount: 4,    // Score >= 90
      feasibleCount: 5,          // Score >= 70
      challengingCount: 3,       // Score >= 50
      highRiskCount: 2           // Score < 50
    },
    categorizedDimensions: {
      highlyFeasible: ["D01", "D03", "D05"],
      feasible: ["D02", "D04", "D07"],
      challenging: ["D06", "D08"],
      highRisk: ["D13"]
    },
    recommendations: [
      "Prioritize 4 highly feasible dimensions immediately",
      "Plan carefully for 3 challenging dimensions",
      "Consider deferring 2 high-risk dimensions to Phase 2"
    ]
  },
  timestamp: "2026-08-27T10:32:00Z"
}
```

#### Feasibility Bands

| Score | Band | Status | Recommendation |
|-------|------|--------|-----------------|
| 90-100 | Highly Feasible | Low Risk | Implement immediately |
| 70-89 | Feasible | Medium Risk | Implement with planning |
| 50-69 | Challenging | High Risk | Requires focused effort |
| <50 | High Risk | Very High Risk | Consider deferring to Phase 2 |

---

### 4. GENERATE ACTION PLAN

**Function Name:** `generateActionPlan`

**Purpose:** Create detailed action plan with dimension-specific interventions

**URL:** `https://us-central1-{project-id}.cloudfunctions.net/generateActionPlan`

#### Request

```typescript
interface GenerateActionPlanRequest {
  simulationId: string;
  dimensionTargets: { D01: number, ... D14: number };
  currentDimensions: { D01: number, ... D14: number };
  budget: number;
}
```

#### Response

```typescript
{
  success: true,
  message: "Action plan generated successfully",
  actionPlan: {
    totalDimensions: 14,
    plan: [
      {
        dimensionId: "D01",
        dimensionName: "Academic Excellence",
        currentScore: 70,
        targetScore: 78,
        gap: 8,
        gapPercentage: 11.43,
        rootCauses: ["Teaching methodology", "Curriculum gaps"],
        interventions: [
          {
            activity: "Teacher training in active learning",
            duration: "6 weeks",
            estimatedCost: 100000,
            owner: "TBD",
            status: "planned"
          },
          // ... more interventions
        ],
        totalEstimatedCost: 450000,
        implementationWeeks: 32,
        successCriteria: [
          "Achieve target score of 78/100",
          "Implement all planned interventions",
          "Complete within 32 weeks"
        ],
        keyPerformanceIndicators: [
          { metric: "Target Score Achievement", target: "78/100" },
          { metric: "Implementation Progress", target: "100%" },
          { metric: "Budget Adherence", target: "±5%" }
        ]
      },
      // ... 13 more dimensions
    ],
    summary: {
      totalEstimatedCost: 5000000,
      budgetAvailable: 5000000,
      budgetUtilization: 100,
      overBudget: false
    },
    recommendations: [
      "Prioritize 6 dimensions with highest gaps",
      "Total cost: ₹5000000 (100% of budget)",
      "Budget fully utilized, no buffer remaining"
    ]
  },
  timestamp: "2026-08-27T10:33:00Z"
}
```

---

### 5. ALLOCATE RESOURCES

**Function Name:** `allocateResources`

**Purpose:** Distribute budget using tiered strategy

**URL:** `https://us-central1-{project-id}.cloudfunctions.net/allocateResources`

#### Request

```typescript
interface AllocateResourcesRequest {
  simulationId: string;
  feasibilityResults: [
    {
      dimensionId: string;
      feasibilityScore: number;  // 0-100
      gap: number;               // Improvement points
      riskLevel: string;
    }
  ];
  totalBudget: number;
}
```

#### Response

```typescript
{
  success: true,
  message: "Resource allocation completed successfully",
  allocation: {
    totalBudget: 5000000,
    tier1: {                           // High Impact, High Priority
      amount: 2000000,                 // 40%
      percentage: 40,
      dimensionCount: 5,
      dimensions: ["D01", "D03", ...],
      description: "Quick wins and critical interventions"
    },
    tier2: {                           // Medium Impact
      amount: 1750000,                 // 35%
      percentage: 35,
      dimensionCount: 5,
      dimensions: ["D02", "D04", ...],
      description: "Important but not blocking"
    },
    tier3: {                           // Lower Priority, Phased
      amount: 750000,                  // 15%
      percentage: 15,
      dimensionCount: 3,
      dimensions: ["D06", "D13"],
      description: "Deferred or phased approach"
    },
    buffer: {                          // Contingency
      amount: 500000,                  // 10%
      percentage: 10,
      description: "Unexpected costs and course corrections"
    },
    costBenefitAnalysis: [
      {
        dimensionId: "D01",
        allocatedBudget: 400000,
        expectedImprovement: 8,
        roi: 0.0004,                   // Points per rupee
        costPerPoint: 50000             // Rupees per point
      },
      // ... top 5 by ROI
    ],
    summary: {
      tier1DimsWithBudget: 5,
      tier2DimsWithBudget: 5,
      tier3DimsWithBudget: 3,
      totalAllocated: 4500000,
      contingencyBuffer: 500000
    }
  },
  timestamp: "2026-08-27T10:34:00Z"
}
```

#### Budget Tier Allocation

```
Tier 1 (40%): ₹2,000,000
├─ Highest gap dimensions
├─ Highest feasibility
└─ Best ROI potential

Tier 2 (35%): ₹1,750,000
├─ Medium gap dimensions
├─ Good feasibility
└─ Important initiatives

Tier 3 (15%): ₹750,000
├─ Lower priority
├─ Phased approach
└─ Longer implementation

Contingency (10%): ₹500,000
├─ Unexpected costs
├─ Course corrections
└─ Opportunities
```

---

### 6. GENERATE TIMELINE

**Function Name:** `generateTimeline`

**Purpose:** Create 12-month implementation plan with milestones

**URL:** `https://us-central1-{project-id}.cloudfunctions.net/generateTimeline`

#### Request

```typescript
interface GenerateTimelineRequest {
  simulationId: string;
  actionPlan: [{ dimensionId: string, interventions: [] }];
  currentDimensions: { D01: number, ... D14: number };
  targetDimensions: { D01: number, ... D14: number };
  timelineMonths: number;          // 3-24
}
```

#### Response

```typescript
{
  success: true,
  message: "12-month timeline generated successfully",
  timeline: {
    totalMonths: 12,
    phases: [
      {
        phase: 1,
        name: "Foundation: Quick Wins & Setup",
        duration: 3,
        description: "Quick wins, team alignment, process setup",
        deliverables: [
          "Kick-off workshop completed",
          "Core team identified and trained",
          "Project management system set up",
          "Quick win initiatives launched (2-3)"
        ],
        kpis: [
          { metric: "Quick wins delivered", target: "2-3" },
          { metric: "Team alignment score", target: ">80%" },
          { metric: "Implementation progress", target: "25% complete" }
        ]
      },
      {
        phase: 2,
        name: "Build: Major Implementations",
        duration: 6,
        description: "Major initiatives, sustained effort, midcourse corrections",
        deliverables: [
          "Core improvement initiatives on track",
          "Quarterly review completed",
          "50% of annual targets achieved",
          "Team morale and engagement high"
        ],
        kpis: [
          { metric: "Initiatives on track", target: ">90%" },
          { metric: "Budget adherence", target: "±5%" },
          { metric: "Implementation progress", target: "75% complete" },
          { metric: "Quality of implementation", target: ">80%" }
        ]
      },
      {
        phase: 3,
        name: "Optimize: Fine-Tuning & Assessment",
        duration: 3,
        description: "Refinements, final push, sustainability planning",
        deliverables: [
          "All planned initiatives completed",
          "Target health score achieved",
          "Sustainability plan documented",
          "Success stories documented"
        ],
        kpis: [
          { metric: "Target achievement", target: "100%" },
          { metric: "Sustainability readiness", target: ">85%" },
          { metric: "Stakeholder satisfaction", target: ">90%" }
        ]
      }
    ],
    milestones: [
      { month: 0, name: "🎯 Kickoff", description: "Project approved, goals aligned, team mobilized" },
      { month: 1, name: "⚡ Quick Wins Visible", description: "First quick win initiatives showing results" },
      { month: 3, name: "✅ Phase 1 Complete", description: "Foundation phase complete, ready to scale" },
      { month: 6, name: "📊 Mid-Year Review", description: "Halfway through - major initiatives 50% complete" },
      { month: 9, name: "🏆 Phase 2 Complete", description: "Major improvements realized" },
      { month: 12, name: "🎊 Target Achieved", description: "Final assessment complete, goals achieved" }
    ],
    riskFactors: [
      {
        risk: "Key personnel turnover",
        probability: "Medium",
        impact: "High",
        mitigation: "Succession planning, cross-training"
      },
      // ... more risks
    ],
    summary: {
      totalPhases: 3,
      totalMilestones: 6,
      keyDeliverables: 25,
      riskCount: 4
    }
  },
  timestamp: "2026-08-27T10:35:00Z"
}
```

---

## Error Handling

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| `unauthenticated` | User must be authenticated | Sign in before calling function |
| `invalid-argument` | Missing/invalid required fields | Check request payload structure |
| `internal` | Server error | Retry with exponential backoff |
| `permission-denied` | Insufficient permissions | Check Firestore rules |

### Error Response Format

```json
{
  "code": "invalid-argument",
  "message": "currentHealth must be between 0 and 100",
  "details": {}
}
```

### Handling Errors in React

```javascript
try {
  const result = await setGoalFn(data);
  console.log('Success:', result);
} catch (error) {
  if (error.code === 'unauthenticated') {
    // Handle auth error
  } else if (error.code === 'invalid-argument') {
    // Handle validation error - show user message
    console.error('Validation error:', error.message);
  } else {
    // Handle generic error
    console.error('Error:', error);
  }
}
```

---

## Implementation Examples

### Complete Workflow

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-config';

export async function runCompleteSimulation() {
  const simulationId = 'sim-' + Date.now();

  // Step 1: Set Goal
  console.log('Step 1: Setting goal...');
  const setGoalFn = httpsCallable(functions, 'setGoalSetting');
  const goalResult = await setGoalFn({
    simulationId,
    currentHealth: 72,
    targetHealth: 80,
    timelineMonths: 12,
    budget: 5000000
  });
  console.log('Goal set:', goalResult.data.goalSetting);

  // Step 2: Perform Calculations
  console.log('Step 2: Performing reverse calculations...');
  const calcFn = httpsCallable(functions, 'performReverseCalculation');
  const calcResult = await calcFn({
    simulationId,
    currentHealth: 72,
    currentDimensions: {
      D01: 70, D02: 65, D03: 75, D04: 60, D05: 80,
      D06: 55, D07: 72, D08: 68, D09: 70, D10: 62,
      D11: 68, D12: 75, D13: 58, D14: 70
    },
    targetHealth: 80,
    timelineMonths: 12,
    budget: 5000000,
    allocationStrategy: 'strategic'
  });
  console.log('Targets calculated:', calcResult.data.calculations.dimensionTargets);

  // Step 3: Analyze Feasibility
  console.log('Step 3: Analyzing feasibility...');
  const feasFn = httpsCallable(functions, 'analyzeFeasibility');
  const feasResult = await feasFn({
    simulationId,
    currentDimensions: calcResult.data.calculations.dimensionTargets,
    targetDimensions: calcResult.data.calculations.dimensionTargets,
    timelineMonths: 12,
    budget: 5000000
  });
  console.log('Feasibility analysis:', feasResult.data.feasibility.overallFeasibilityScore);

  // Step 4: Generate Action Plan
  console.log('Step 4: Generating action plan...');
  const actionFn = httpsCallable(functions, 'generateActionPlan');
  const actionResult = await actionFn({
    simulationId,
    dimensionTargets: calcResult.data.calculations.dimensionTargets,
    currentDimensions: calcResult.data.calculations.currentPoints,
    budget: 5000000
  });
  console.log('Action plan generated for', actionResult.data.actionPlan.plan.length, 'dimensions');

  // Step 5: Allocate Resources
  console.log('Step 5: Allocating resources...');
  const allocFn = httpsCallable(functions, 'allocateResources');
  const allocResult = await allocFn({
    simulationId,
    feasibilityResults: feasResult.data.feasibility.dimensionResults,
    totalBudget: 5000000
  });
  console.log('Budget allocation:', allocResult.data.allocation);

  // Step 6: Generate Timeline
  console.log('Step 6: Generating timeline...');
  const timelineFn = httpsCallable(functions, 'generateTimeline');
  const timelineResult = await timelineFn({
    simulationId,
    actionPlan: actionResult.data.actionPlan.plan,
    currentDimensions: calcResult.data.calculations.dimensionTargets,
    targetDimensions: calcResult.data.calculations.dimensionTargets,
    timelineMonths: 12
  });
  console.log('Timeline generated with', timelineResult.data.timeline.phases.length, 'phases');

  return {
    goal: goalResult.data.goalSetting,
    calculations: calcResult.data.calculations,
    feasibility: feasResult.data.feasibility,
    actionPlan: actionResult.data.actionPlan,
    allocation: allocResult.data.allocation,
    timeline: timelineResult.data.timeline
  };
}
```

### Error Handling with Retry

```javascript
async function callCloudFunctionWithRetry(fn, data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn(data);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      if (error.code === 'internal' || error.code === 'unavailable') {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Don't retry validation errors
      }
    }
  }
}
```

---

## Best Practices

### 1. Data Validation Before Calling

```javascript
// Validate before calling
if (currentHealth >= targetHealth) {
  throw new Error('Target must be greater than current');
}

if (timelineMonths < 3 || timelineMonths > 24) {
  throw new Error('Timeline must be 3-24 months');
}

if (budget < 0) {
  throw new Error('Budget must be positive');
}
```

### 2. Sequential Calling

Always follow the order: Goal → Calc → Feasibility → Action → Allocation → Timeline

```javascript
// ✅ Correct order
const goal = await setGoalSetting(...);
const calc = await performReverseCalculation(...);
const feas = await analyzeFeasibility(...);
const action = await generateActionPlan(...);
const alloc = await allocateResources(...);
const timeline = await generateTimeline(...);

// ❌ Wrong - calling out of order
const action = await generateActionPlan(...); // May not have targets
```

### 3. Error Handling

```javascript
try {
  const result = await httpsCallable(functions, 'functionName')(data);
  return result.data;
} catch (error) {
  console.error('Function call failed:', {
    code: error.code,
    message: error.message,
    details: error.customData
  });
  // Re-throw or handle appropriately
  throw error;
}
```

### 4. Logging

```javascript
console.log('Starting simulation:', { simulationId, currentHealth, targetHealth });
console.log('Step completed:', { step: 'setGoalSetting', duration: 234 });
console.log('Simulation complete:', { resultSummary });
```

### 5. Caching Results

```javascript
// Store results in local state/database for reuse
const [simulationResults, setSimulationResults] = useState(null);

useEffect(() => {
  const runSim = async () => {
    const results = await runCompleteSimulation();
    setSimulationResults(results);
    // Save to Firestore for persistence
    await saveToFirestore(results);
  };
  runSim();
}, []);
```

---

## Deployment

### Deploy to Cloud Functions

```bash
cd disha-diagnostic-engine

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:setGoalSetting

# Deploy with specific region
firebase deploy --only functions --region us-central1
```

### View Logs

```bash
firebase functions:log
firebase functions:log --limit 50
firebase functions:log --region us-central1
```

---

## Support

For issues or questions:
1. Check this API documentation
2. Review [IMPLEMENTATION_CORRECTED.md](IMPLEMENTATION_CORRECTED.md)
3. Check Cloud Function logs
4. Review test cases in `__tests__/` directory

---

**Last Updated:** August 27, 2026  
**Status:** Production Ready  
**All 6 Functions:** ✅ Deployed & Documented
