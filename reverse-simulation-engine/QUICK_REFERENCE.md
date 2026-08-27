# DISHA Stage 3: Quick Reference Guide

**Quick lookup for the 7-step reverse outcome modeling process**

## 📑 Table of Contents

1. [7-Step Process](#7-step-process)
2. [Key Formulas](#key-formulas)
3. [Dimension Weights & Difficulty](#dimension-weights--difficulty)
4. [Feasibility Bands](#feasibility-bands)
5. [API Endpoints](#api-endpoints)
6. [UI Components](#ui-components)
7. [Database Collections](#database-collections)
8. [Common Tasks](#common-tasks)

---

## 7-Step Process

### Step 1: GOAL SETTING
**Input:** School context, current assessment, budget, timeline
**Output:** Goal definition, timeline, success criteria

**Key Data:**
- Current Health Index (0-100)
- All 14 Dimension Scores (D01-D14)
- Target Health Index (0-100)
- Timeline: 3, 6, 12, 18, or 24 months
- Budget: ₹ (Rupees)
- Success Criteria: 5-10 specific criteria

**Example:**
```
Current: 72/100
Target: 80/100
Timeline: 12 months
Budget: ₹50L
Success Criteria:
  - Overall: 80 ± 2 points
  - All D01-D14: minimum 70
  - Tier 1 dimensions: 82+
  - Budget variance: ±10%
```

---

### Step 2: REVERSE CALCULATION
**Input:** Goal setting data
**Output:** Target scores for each dimension

**Formulas:**

| Formula | Calculation |
|---------|-----------|
| **Required Points** | (Target_Index / 100) × 109 |
| **Current Points** | (Current_Index / 100) × 109 |
| **Gap** | Required - Current |
| **Per-Dimension Target** | Based on strategic allocation |

**Example Calculation:**
```
Required = (80/100) × 109 = 87.2 points
Current = (72/100) × 109 = 78.48 points
Gap = 87.2 - 78.48 = 8.72 points to gain
```

**Strategic Allocation Tiers:**
```
Weak dimensions (<70): Allocate 50% of gap
Medium dimensions (70-80): Allocate 40% of gap
Strong dimensions (>80): Allocate 10% of gap
```

---

### Step 3: FEASIBILITY ANALYSIS
**Input:** Dimension targets, timeline, budget
**Output:** Feasibility scores, risks, recommendations

**Feasibility Formula:**
```
Feasibility(%) = 100 - [0.3×Gap% + 0.2×Timeline% + 0.2×Cost% + 0.3×Difficulty%]
```

**Feasibility Bands:**

| Band | Score | Action | Examples |
|------|-------|--------|----------|
| Highly Feasible | 90-100% | Implement immediately | D03, D04, D14 |
| Feasible | 70-89% | Implement with planning | D02, D07, D12 |
| Challenging | 50-69% | Requires strategic focus | D01, D05, D09 |
| High Risk | <50% | May defer to phase 2 | D06, D08 |

---

### Step 4: ACTION MAPPING
**Input:** Dimension targets, feasibility analysis
**Output:** Action plans with activities

**Action Structure:**
```
Action = {
  Dimension: D01-D14
  Root Cause: Why current score is low
  Solution: Core intervention
  Activities: [activity1, activity2, ...]
  Timeline: 3-12 months
  Budget: ₹X
  Owner: Responsible person
  Expected Impact: +Y points
}

Activity = {
  Name: Specific task
  Timeline: Weeks to complete
  Cost: Budget
  Owner: Responsible person
  Deliverables: What's produced
  Dependencies: Other activities it depends on
}
```

**Example:**
```
Action: Improve D02 (Teacher Welfare) from 70 to 78

Root Causes:
  - Inadequate compensation (market lag)
  - Limited PD budget (₹2L vs needed ₹8L)
  - No career advancement path

Solutions:
  - Salary adjustment to market rate
  - Professional development expansion
  - Career ladder creation

Activities:
  1. Market salary study (1 month, ₹2L)
  2. Board proposal (1 month)
  3. Salary rollout (3 months)
  4. PD program launch (3 months)
  
Timeline: 6 months
Budget: ₹12.5L
Owner: CFO + HR
Expected Impact: +8 points
```

---

### Step 5: RESOURCE ALLOCATION
**Input:** Actions, budget, priorities
**Output:** Budget allocation plan with ROI

**Allocation Model:**

```
Tier 1: High Impact, High Priority
  └─ Budget: 40% of total
  └─ Focus: Highest gap dimensions
  └─ Example: Teacher Welfare, Academic, Leadership

Tier 2: Medium Impact, Medium Priority
  └─ Budget: 35% of total
  └─ Focus: Important but manageable
  └─ Example: Co-Curricular, Safety

Tier 3: Lower Priority, Phased
  └─ Budget: 15% of total
  └─ Focus: Deferred to phase 2
  └─ Example: Infrastructure, Special Needs

Buffer: Contingency
  └─ Budget: 10% of total
  └─ Use: Unexpected costs, opportunities
```

**Cost-Benefit Metrics:**
```
Total Investment: ₹50L
Expected Gain: 8.72 points (11.1% improvement)
Cost per Point: ₹5.73L
ROI: 1.7% health improvement per ₹1L
```

---

### Step 6: TIMELINE & MILESTONE PLANNING
**Input:** Actions, resources, constraints
**Output:** 12-month phased plan with milestones

**Phase Structure:**

| Phase | Duration | Budget | Health Gain | Focus |
|-------|----------|--------|------------|-------|
| Phase 1: Foundation | Months 1-3 | ₹12L | +1-2 pts | Quick wins + setup |
| Phase 2: Build | Months 4-9 | ₹30L | +5-6 pts | Major implementations |
| Phase 3: Optimize | Months 10-12 | ₹8L | +2-3 pts | Fine-tune & assess |

**Milestones:**
```
Month 0: Kickoff
  └─ Plan approved, team aligned

Month 3: Phase 1 Complete
  └─ Quick wins visible
  └─ Target Health: 73-74

Month 6: Mid-Year Review
  └─ Major projects 50% done
  └─ Target Health: 76

Month 9: Phase 2 Complete
  └─ Major implementations done
  └─ Target Health: 78-79

Month 12: Final Assessment
  └─ All targets achieved
  └─ Target Health: 80 ✓
```

**KPI Tracking:**
```
For each milestone:
  - Key Deliverables: What must be delivered
  - Success Metrics: How to measure
  - Budget Spent: $ vs Plan
  - Timeline: On schedule?
  - Risks: Any issues?
```

---

### Step 7: EXECUTION & MONITORING
**Input:** Timeline & milestones
**Output:** Progress tracking, alerts, course corrections

**Monitoring Framework:**
```
Monthly Review:
  ✓ Milestone health check
  ✓ KPI tracking
  ✓ Budget vs actual
  ✓ Risk assessment
  ✓ Stakeholder update

Course Correction Triggers:
  ⚠ Milestone <80% on track
  ⚠ Budget overrun >10%
  ⚠ Key staff departure
  ⚠ External market changes
```

---

## Key Formulas

### Points Calculation

```
Total_Weight = 109%

Required_Points = (Target_Index / 100) × 109
Current_Points = (Current_Index / 100) × 109
Points_Gap = Required - Current

Per_Dimension_Points = (Dimension_Score / 100) × Dimension_Weight
```

### Health Index

```
Health_Index = (Total_Points / Total_Weight) × 100
            = (Total_Points / 109) × 100
```

### Feasibility Score

```
Feasibility(%) = 100 - [
  0.3 × Gap_Percentage +
  0.2 × Timeline_Percentage +
  0.2 × Cost_Percentage +
  0.3 × Difficulty_Percentage
]
```

### ROI Calculation

```
ROI(%) = (Gain / Investment) × 100
      = (Health_Points_Gained / Budget_Rupees) × 100

Cost_Per_Point = Budget / Points_Gained
```

---

## Dimension Weights & Difficulty

### Weights (Total: 109%)

| Dimension | Code | Weight | Notes |
|-----------|------|--------|-------|
| Academic | D01 | 10% | Curriculum & results |
| Teacher Welfare | D02 | 9% | Salary, benefits, morale |
| Leadership | D03 | 10% | Vision, strategy, execution |
| Parent Engagement | D04 | 8% | Communication, feedback |
| Safety | D05 | 10% | Physical & mental health |
| Infrastructure | D06 | 7% | Facilities & technology |
| Co-Curricular | D07 | 6% | Sports, arts, activities |
| Individual Attention | D08 | 9% | Student-teacher ratio |
| Value for Money | D09 | 7% | Fees vs quality |
| Special Needs | D10 | 6% | Inclusive education |
| Community Service | D11 | 5% | Social responsibility |
| Faculty Competence | D12 | 9% | Teacher skills |
| Internationalism | D13 | 6% | Global perspective |
| Management Vision | D14 | 8% | Planning & innovation |

**Total:** 109% ✓

### Difficulty Ratings (1=Easy, 10=Hard)

| Dimension | Difficulty | Reason | Feasibility |
|-----------|-----------|--------|-------------|
| D01 | 7 | Curriculum change required | 75% |
| D02 | 6 | Salary commitment | 70% |
| D03 | 5 | Process change | 95% |
| D04 | 2 | Communication system | 95% |
| D05 | 7 | Infrastructure + training | 75% |
| D06 | 9 | Capital intensive | 60% |
| D07 | 3 | Program launch | 85% |
| D08 | 9 | Class size constraint | 50% |
| D09 | 5 | Pricing perception | 65% |
| D10 | 7 | Staff + facilities | 70% |
| D11 | 2 | Partnership-based | 90% |
| D12 | 6 | Hiring + training | 75% |
| D13 | 7 | Curriculum + training | 70% |
| D14 | 1 | Planning process | 98% |

---

## Feasibility Bands

### 90-100%: HIGHLY FEASIBLE
**Action:** Implement immediately
**Timeline:** 3-6 months
**Resources:** Minimal to moderate
**Examples:** D03, D04, D11, D14

### 70-89%: FEASIBLE
**Action:** Implement with careful planning
**Timeline:** 6-12 months
**Resources:** Moderate to high
**Examples:** D02, D07, D12

### 50-69%: CHALLENGING
**Action:** Requires strategic focus & resources
**Timeline:** 9-12 months
**Resources:** High
**Examples:** D01, D05, D09, D13

### <50%: HIGH RISK
**Action:** May not achieve in timeframe
**Timeline:** 12-18+ months
**Resources:** Very high
**Examples:** D06, D08
**Recommendation:** Defer to phase 2

---

## API Endpoints

### Goal Setting
```
POST   /api/reverseSimulations                  # Create
GET    /api/reverseSimulations/{id}             # Fetch
PUT    /api/reverseSimulations/{id}             # Update
DELETE /api/reverseSimulations/{id}             # Delete

POST   /api/reverseSimulations/{id}/goalSetting  # Set goal
PUT    /api/reverseSimulations/{id}/goalSetting  # Update goal
GET    /api/reverseSimulations/{id}/goalSetting  # Get goal
```

### Calculations
```
POST   /api/reverseSimulations/{id}/calculate           # Full calc
POST   /api/reverseSimulations/{id}/calculate/reverse   # Reverse calc
POST   /api/reverseSimulations/{id}/calculate/feasibility
POST   /api/reverseSimulations/{id}/calculate/allocation

GET    /api/reverseSimulations/{id}/calculations        # Results
GET    /api/reverseSimulations/{id}/calculations/summary
```

### Action Mapping
```
GET    /api/reverseSimulations/{id}/actionMapping       # Get all
POST   /api/reverseSimulations/{id}/actionMapping       # Create
PUT    /api/reverseSimulations/{id}/actionMapping/{id}  # Update
DELETE /api/reverseSimulations/{id}/actionMapping/{id}  # Delete

POST   /api/reverseSimulations/{id}/actionMapping/{id}/activities
```

### Timeline
```
GET    /api/reverseSimulations/{id}/timeline           # Get timeline
POST   /api/reverseSimulations/{id}/timeline           # Create
PUT    /api/reverseSimulations/{id}/timeline           # Update
GET    /api/reverseSimulations/{id}/milestones         # Get milestones
PUT    /api/reverseSimulations/{id}/milestones/{id}    # Update milestone
```

### Export
```
GET    /api/reverseSimulations/{id}/export/pdf         # Export PDF
GET    /api/reverseSimulations/{id}/export/excel       # Export Excel
```

---

## UI Components

### Pages

| Page | Purpose | Route |
|------|---------|-------|
| Simulation Dashboard | List & manage simulations | `/simulations` |
| Goal Setting Page | Define goals & success criteria | `/simulations/{id}/goals` |
| Calculation Page | View reverse calculations | `/simulations/{id}/calculations` |
| Feasibility Page | Assess achievability | `/simulations/{id}/feasibility` |
| Action Mapping Page | View action plans | `/simulations/{id}/actions` |
| Resource Allocation Page | View budget allocation | `/simulations/{id}/resources` |
| Timeline Page | View milestones & KPIs | `/simulations/{id}/timeline` |
| Monitoring Page | Track execution progress | `/simulations/{id}/monitoring` |

### Key Components

| Component | Purpose | Data |
|-----------|---------|------|
| GoalSettingWizard | Multi-step goal input | GoalSetting |
| CalculationDashboard | Show calculated targets | ReverseCalculations |
| FeasibilityMatrix | Show feasibility by dimension | FeasibilityAnalysis |
| ActionTimeline | Gantt chart of actions | ActionMapping |
| BudgetBreakdown | Pie chart of allocation | ResourceAllocation |
| MilestoneTracker | Progress vs milestones | Timeline |

---

## Database Collections

### Main Collections

```
/schools/{schoolId}
  /reverseSimulations/{simulationId}
    /goalSetting
    /reverseCalculations
    /feasibilityAnalysis
    /actionMapping
    /resourceAllocation
    /timeline
```

### Key Fields in Each

**GoalSetting:**
- currentHealth, currentDimensions, targetHealth, timeline, budget
- successCriteria[], schoolContext

**ReverseCalculations:**
- requiredPoints, currentPoints, gap
- dimensionTargets (map of DimensionTarget)
- allocationStrategy

**FeasibilityAnalysis:**
- overallFeasibility, dimensionFeasibilities
- risks[], assumptions[], recommendations[]
- alternativeScenarios

**ActionMapping:**
- actions[], sequencing[], dependencies[]
- totalActions, totalBudget, expectedTotalGain

**ResourceAllocation:**
- totalBudget, tiers (tier1, tier2, tier3, buffer)
- initiatives[], costBenefitAnalysis, roi

**Timeline:**
- startDate, endDate, phases[], milestones[], kpis[]
- overall (progress tracking)

---

## Common Tasks

### How To: Calculate Reverse Targets

```typescript
const result = await calculationEngine.performReverseCalculation(
  72,              // currentHealth
  currentDimensions, // D01-D14 scores
  80,              // targetHealth
  12,              // timeline (months)
  5000000,         // budget (rupees)
  'strategic'      // allocation strategy
);

// Result contains:
// - requiredPoints: 87.2
// - currentPoints: 78.48
// - gap: 8.72
// - dimensionTargets: {...}
// - feasibilityAdjustments: {...}
```

### How To: Assess Feasibility

```typescript
const feasibility = await feasibilityService.analyzeOverallFeasibility(
  dimensionTargets,
  12,              // timeline
  5000000          // budget
);

// Result contains:
// - overallFeasibility: 75%
// - feasibilityBands: {feasible: [...], challenging: [...], ...}
// - risks: [{...}, {...}]
// - contingencyPlans: [{...}]
```

### How To: Create Action Plan

```typescript
const actionPlan = await actionPlanService.generateActionPlan(
  dimensionTargets,
  resourceAllocation
);

// Result contains:
// - actions: [action1, action2, ...]
// - sequencing: [...]
// - dependencies: [...]
// - totalBudget, totalTimeline, expectedGain
```

### How To: Allocate Budget

```typescript
const allocation = await allocationService.allocateBudget(
  50000000,        // total budget (₹50L)
  actions,         // action plans
  priorities       // tier assignments
);

// Result contains:
// - tiers: {tier1: {...}, tier2: {...}, tier3: {...}}
// - initiatives: [...]
// - costBenefitAnalysis: {...}
// - roi: 1.7%
```

### How To: Generate Timeline

```typescript
const timeline = await timelineService.generateTimeline(
  12,              // duration (months)
  actions          // action plans
);

// Result contains:
// - phases: [phase1, phase2, phase3]
// - milestones: [milestone1, milestone2, ...]
// - kpis: [kpi1, kpi2, ...]
```

---

## 🔗 Quick Links

- **Master Framework:** [docs/MASTER_FRAMEWORK.md](docs/MASTER_FRAMEWORK.md)
- **Technical Architecture:** [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md)
- **Database Schema:** [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- **Development Roadmap:** [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)
- **Example Walkthrough:** [examples/delhi-excellence-academy/](examples/delhi-excellence-academy/)

---

**Last Updated:** August 27, 2026
**Status:** ✅ Ready for Reference

