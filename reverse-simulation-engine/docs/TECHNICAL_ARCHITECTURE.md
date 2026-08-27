# DISHA Stage 3: Technical Architecture & System Design

**Document Version:** 1.0  
**Created:** 2026-08-27  
**Architecture Lead:** Chief Product Development Officer (CPDO)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [Backend Services](#backend-services)
6. [Frontend Architecture](#frontend-architecture)
7. [API Gateway Design](#api-gateway-design)
8. [Data Flow](#data-flow)
9. [Security Architecture](#security-architecture)
10. [Scalability & Performance](#scalability--performance)
11. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Goal Setting │ │  Feasibility │ │   Timeline   │        │
│  │   Wizard     │ │   Dashboard  │ │   Manager    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Calculation │ │   Action     │ │  Resource    │        │
│  │   Dashboard  │ │   Mapping    │ │ Allocator    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└────────────────────────────┬─────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
    ┌────▼────────────┐              ┌──────────▼──────┐
    │  Firebase Auth  │              │  Firestore      │
    │  (Security)     │              │  Real-time DB   │
    └────────────────┘              └─────────┬────────┘
                                               │
        ┌──────────────────────────────────────┴──────────────────┐
        │                                                         │
┌───────▼─────────────────┐                    ┌────────────────▼─────┐
│  Cloud Functions Gen 2  │                    │  Data Pipeline      │
│  (Node.js 20 Runtime)   │                    ├─────────────────────┤
├──────────────────────────┤                    │ • Batch Processing  │
│ • reverseSimulation/     │                    │ • BigQuery Export   │
│   - goalSetting.ts       │                    │ • Analytics Sync    │
│   - calculations.ts      │                    │ • Report Generation │
│   - feasibility.ts       │                    └─────────────────────┘
│   - actionMapping.ts     │
│   - allocation.ts        │
│   - timeline.ts          │
├──────────────────────────┤
│ Deployed as HTTP Callables & Scheduled Functions
└──────────────────────────┘
         ↓
    ┌─────────────────┐
    │   Firestore     │
    │  (Real-time)    │
    └─────────────────┘
```

**Key Difference:** NO Express backend server. Instead, Firebase Cloud Functions handle all backend logic (HTTP callables invoked from frontend).

### Key Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Frontend** | User interface & interactions | React, TypeScript, Recharts |
| **API Gateway** | Request routing & auth | Firebase Auth |
| **Backend API** | Business logic & orchestration | Node.js, Express |
| **Cloud Functions** | Heavy computations | Firebase Cloud Functions |
| **Database** | Data persistence | Firestore (NoSQL) |
| **Analytics** | Data warehouse & reporting | BigQuery |
| **Storage** | Files & exports | Cloud Storage |

---

## Architecture Layers

### Layer 1: Presentation Layer (Frontend)

**Responsibility:** User interface, user interactions, data visualization

**Components:**
- Pages (Goal Setting, Calculation Dashboard, Feasibility, Action Mapping, Resource Allocation, Timeline)
- Reusable UI Components (Forms, Cards, Charts, Modals)
- State Management (React Query, Context API)
- API Client Services

**Technology:**
- React 18+ with TypeScript
- Recharts for visualizations
- Material-UI for components
- React Query for data fetching
- Zustand for state (if needed)

### Layer 2: API Gateway Layer

**Responsibility:** Request routing, authentication, rate limiting

**Components:**
- Firebase Authentication
- API Gateway routing
- Request validation middleware
- CORS handling

**Technology:**
- Firebase Auth
- Express middleware
- Helmet for security
- Validator.js for input validation

### Layer 3: Application/Business Logic Layer

**Responsibility:** Business logic, orchestration, calculations

**Services:**
- Goal Management Service
- Reverse Calculation Engine
- Feasibility Analysis Service
- Action Planning Service
- Resource Allocation Service
- Timeline Management Service

**Technology:**
- Node.js / Express
- Cloud Functions for heavy computation
- TypeScript for type safety

### Layer 4: Data Access Layer

**Responsibility:** Data persistence, queries, transactions

**Components:**
- Firestore repository layer
- Query builders
- Transaction managers
- Cache layer

**Technology:**
- Firestore (NoSQL)
- Redis (optional caching)
- Batch operations for performance

### Layer 5: External Integration Layer

**Responsibility:** Integration with other DISHA systems

**Components:**
- Stage 2 Assessment Service adapter
- School Profile adapter
- Analytics pipeline

**Technology:**
- REST APIs
- BigQuery integration
- Scheduled jobs (Cloud Scheduler)

---

## Technology Stack

### Frontend Stack

```yaml
Framework:
  - React 18.x
  - TypeScript 5.x
  - Vite (Build tool)

State Management:
  - React Query (Data fetching)
  - Context API (Local state)
  - Zustand (If complex state needed)

UI Libraries:
  - Material-UI 5.x
  - Recharts (Charts)
  - React Hook Form (Forms)
  - Framer Motion (Animations)

Backend Client:
  - Firebase SDK (Cloud Functions calls)
  - Firestore Real-time Listeners

Utilities:
  - date-fns (Date manipulation)
  - lodash-es (Utilities)
  - numeral.js (Number formatting)

Testing:
  - Jest (Unit testing)
  - React Testing Library (Component testing)
  - Cypress (E2E testing)

Dev Tools:
  - ESLint
  - Prettier
  - Husky (Git hooks)
```

### Backend Stack (Cloud Functions)

```yaml
Runtime:
  - Node.js 20 (Firebase Cloud Functions Gen 2)

Framework:
  - Firebase Cloud Functions
  - Firebase Admin SDK

Language:
  - TypeScript 5.x

Deployment:
  - Firebase CLI (firebasetools)
  - GitHub Actions (CI/CD)

Database:
  - Firestore (Primary)
  - Real-time Listeners

Analytics & Processing:
  - BigQuery (Data warehouse)
  - Scheduled Functions (Batch jobs)

Function Types:
  - HTTP Callables (invoked from frontend)
  - Scheduled Functions (background tasks)
  - Firestore Triggers (data processing)

Utilities:
  - firebase-functions (SDK)
  - firebase-admin (Admin SDK)
  - lodash (Utilities)
  - joi (Validation)

Testing:
  - Jest (Unit)
  - Firebase Emulator (Integration)
  - Vitest (Alternative test runner)

Dev Tools:
  - Firebase Emulator Suite
  - TypeScript Compiler
  - ESLint
  - Prettier
```

**Pattern:** Identical to existing 14D Framework & First Opinion Engine v3 implementations

### DevOps Stack

```yaml
Version Control:
  - GitHub

CI/CD:
  - GitHub Actions

Hosting:
  - Firebase Hosting (Frontend)
  - Cloud Run (Backend API)
  - Cloud Functions (Serverless tasks)

Monitoring:
  - Cloud Logging
  - Cloud Monitoring
  - Error Reporting

Deployment:
  - Firebase CLI
  - Cloud Build
```

---

## Database Design

### Firestore Structure

```
firestore
└── schools/{schoolId}
    ├── assessments/{assessmentId}
    │   ├── dimensions/{dimensionId}
    │   ├── scores (map)
    │   └── metadata
    │
    └── reverseSimulations/{simulationId}
        ├── goalSetting
        │   ├── currentHealth: number
        │   ├── currentDimensions: map
        │   ├── targetHealth: number
        │   ├── timeline: number
        │   ├── budget: number
        │   └── successCriteria: array
        │
        ├── reverseCalculations
        │   ├── requiredPoints: number
        │   ├── currentPoints: number
        │   ├── gap: number
        │   ├── dimensionTargets: map
        │   ├── allocationStrategy: string
        │   └── feasibilityAdjustments: map
        │
        ├── feasibilityAnalysis
        │   ├── overallFeasibility: number
        │   ├── dimensionFeasibilities: map
        │   ├── risks: array
        │   ├── assumptions: array
        │   └── contingencyPlans: array
        │
        ├── actionMapping
        │   ├── actions: array
        │   ├── sequencing: array
        │   └── dependencies: array
        │
        ├── resourceAllocation
        │   ├── totalBudget: number
        │   ├── tierAllocations: map
        │   ├── initiatives: array
        │   ├── costBenefitAnalysis: object
        │   └── roi: number
        │
        ├── timeline
        │   ├── phases: array
        │   ├── milestones: array
        │   └── kpis: array
        │
        └── metadata
            ├── createdAt: timestamp
            ├── updatedAt: timestamp
            ├── createdBy: string
            ├── status: string
            └── version: number
```

### Collection Indexing

**Required Indexes:**

```
Collections: reverseSimulations
  Composite Index 1:
    - schoolId (Ascending)
    - status (Ascending)
    - createdAt (Descending)
  
  Composite Index 2:
    - schoolId (Ascending)
    - updatedAt (Descending)
  
  Composite Index 3:
    - createdBy (Ascending)
    - status (Ascending)
    - createdAt (Descending)
```

### Data Validation Schema

```typescript
// Using Joi for validation
const goalSettingSchema = Joi.object({
  currentHealth: Joi.number().min(0).max(100).required(),
  currentDimensions: Joi.object().pattern(
    Joi.string().regex(/^D\d{2}$/),
    Joi.number().min(0).max(100)
  ).required(),
  targetHealth: Joi.number().min(0).max(100).required(),
  timeline: Joi.number().valid(3, 6, 12, 18, 24).required(),
  budget: Joi.number().min(0).required(),
  successCriteria: Joi.array().items(
    Joi.object({
      criterion: Joi.string().required(),
      target: Joi.string().required(),
      measurement: Joi.string().required()
    })
  )
});
```

---

## Backend Services

### 1. Goal Management Service

**File:** `src/backend/services/goalService.ts`

```typescript
class GoalService {
  // Create new goal setting
  async createGoalSetting(simulationId, goalData): Promise<GoalSetting>
  
  // Update goal setting
  async updateGoalSetting(simulationId, goalData): Promise<GoalSetting>
  
  // Get goal setting
  async getGoalSetting(simulationId): Promise<GoalSetting>
  
  // Validate goal feasibility
  async validateGoal(goalData): Promise<ValidationResult>
  
  // Get goal history
  async getGoalHistory(simulationId): Promise<GoalSetting[]>
}
```

### 2. Reverse Calculation Engine

**File:** `src/backend/services/calculationEngine.ts`

```typescript
class CalculationEngine {
  private weights = { /* 14D weights */ };
  
  // Main reverse calculation
  async performReverseCalculation(goal, current): Promise<ReverseCalculations>
  
  // Calculate required points
  private calculateRequiredPoints(targetIndex, weights): number
  
  // Calculate current points
  private calculateCurrentPoints(dimensions, weights): number
  
  // Strategic allocation
  private allocateDimensionTargets(gap, current, weights): Record<string, DimensionTarget>
  
  // Adjustment for feasibility
  async adjustForFeasibility(targets, timeline, budget): Promise<AdjustedTargets>
}
```

### 3. Feasibility Analysis Service

**File:** `src/backend/services/feasibilityService.ts`

```typescript
class FeasibilityService {
  // Calculate feasibility for single dimension
  async calculateDimensionFeasibility(dimension, target, timeline, budget): Promise<Feasibility>
  
  // Calculate overall feasibility
  async analyzeOverallFeasibility(targets, timeline, budget): Promise<FeasibilityAnalysis>
  
  // Identify risks
  async identifyRisks(targets, feasibilities): Promise<Risk[]>
  
  // Generate contingency plans
  async generateContingencyPlans(risks): Promise<ContingencyPlan[]>
  
  // Feasibility scoring algorithm
  private scoreFeasibility(gap, timeline, cost, difficulty): number
}
```

### 4. Action Planning Service

**File:** `src/backend/services/actionPlanService.ts`

```typescript
class ActionPlanService {
  // Generate action plan from targets
  async generateActionPlan(targets, allocation): Promise<ActionPlan[]>
  
  // Create action details
  private createActionDetails(dimension, target): ActionPlan
  
  // Define activities
  private defineActivities(rootCauses, solutions): Activity[]
  
  // Estimate costs
  private estimateActivityCosts(activities): number
  
  // Estimate timeline
  private estimateActivityTimeline(activities): Timeline
}
```

### 5. Resource Allocation Service

**File:** `src/backend/services/allocationService.ts`

```typescript
class AllocationService {
  // Allocate budget to tiers
  async allocateBudget(totalBudget, actions, priorities): Promise<ResourceAllocation>
  
  // Tier 1 allocation (40%)
  private allocateTier1(budget, highPriorityActions): TierAllocation
  
  // Tier 2 allocation (35%)
  private allocateTier2(budget, mediumPriorityActions): TierAllocation
  
  // Tier 3 allocation (15%)
  private allocateTier3(budget, lowPriorityActions): TierAllocation
  
  // Cost-benefit analysis
  async calculateCostBenefit(allocation): Promise<CostBenefitAnalysis>
  
  // ROI calculation
  private calculateROI(investment, expectedGain): number
}
```

### 6. Timeline Management Service

**File:** `src/backend/services/timelineService.ts`

```typescript
class TimelineService {
  // Generate phased timeline
  async generateTimeline(duration, actions): Promise<Timeline>
  
  // Create phases
  private createPhases(duration, actions): Phase[]
  
  // Define milestones
  private defineMilestones(phases): Milestone[]
  
  // Set KPIs
  private defineKPIs(targets, dimensions): KPI[]
  
  // Get milestone status
  async getMilestoneStatus(simulationId): Promise<MilestoneStatus[]>
  
  // Update progress
  async updateMilestoneProgress(milestoneId, status): Promise<void>
}
```

---

## Frontend Architecture

### Directory Structure

```
src/frontend/
├── components/
│   ├── GoalSetting/
│   │   ├── CurrentStateForm.tsx
│   │   ├── TargetGoalSelector.tsx
│   │   ├── TimelineBudgetForm.tsx
│   │   └── SuccessCriteriaBuilder.tsx
│   ├── Calculations/
│   │   ├── CalculationDashboard.tsx
│   │   ├── TargetBreakdown.tsx
│   │   ├── GapAnalysis.tsx
│   │   └── AllocationVisualization.tsx
│   ├── Feasibility/
│   │   ├── FeasibilityMatrix.tsx
│   │   ├── RiskIndicator.tsx
│   │   ├── ScenarioComparison.tsx
│   │   └── RecommendationPanel.tsx
│   ├── ActionMapping/
│   │   ├── ActionPlanList.tsx
│   │   ├── ActionTimeline.tsx
│   │   ├── ActivityBreakdown.tsx
│   │   └── DependencyGraph.tsx
│   ├── ResourceAllocation/
│   │   ├── BudgetBreakdown.tsx
│   │   ├── TierAllocationChart.tsx
│   │   ├── CostBenefitAnalysis.tsx
│   │   └── ROICalculator.tsx
│   ├── Timeline/
│   │   ├── GanttChart.tsx
│   │   ├── MilestoneTracker.tsx
│   │   ├── KPIMonitor.tsx
│   │   └── PhaseProgress.tsx
│   └── Shared/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Card.tsx
│       ├── Chart.tsx
│       └── Modal.tsx
├── pages/
│   ├── SimulationDashboard.tsx
│   ├── GoalSettingPage.tsx
│   ├── CalculationPage.tsx
│   ├── FeasibilityPage.tsx
│   ├── ActionMappingPage.tsx
│   ├── ResourceAllocationPage.tsx
│   ├── TimelinePage.tsx
│   └── ExecutionMonitoringPage.tsx
├── hooks/
│   ├── useSimulation.ts
│   ├── useCalculations.ts
│   ├── useFeasibility.ts
│   ├── useActionPlans.ts
│   ├── useResourceAllocation.ts
│   ├── useTimeline.ts
│   └── useNotifications.ts
├── services/
│   ├── api.ts
│   ├── simulationService.ts
│   ├── calculationService.ts
│   ├── feasibilityService.ts
│   ├── actionPlanService.ts
│   ├── resourceService.ts
│   └── timelineService.ts
├── utils/
│   ├── calculations.ts
│   ├── formatters.ts
│   ├── validators.ts
│   ├── charts.ts
│   └── export.ts
├── types/
│   ├── index.ts
│   ├── simulation.ts
│   ├── calculations.ts
│   ├── feasibility.ts
│   └── resource.ts
└── App.tsx
```

### State Management Strategy

**React Query for Server State:**
```typescript
// hooks/useSimulation.ts
export function useSimulation(simulationId: string) {
  return useQuery(
    ['simulation', simulationId],
    () => simulationService.getSimulation(simulationId),
    { staleTime: 5 * 60 * 1000 }
  );
}

export function useUpdateSimulation() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: SimulationData) => simulationService.updateSimulation(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['simulations']);
      }
    }
  );
}
```

**Context for UI State:**
```typescript
// contexts/SimulationContext.tsx
interface SimulationContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export const SimulationContext = createContext<SimulationContextType | null>(null);
```

---

## API Gateway Design

### Route Structure

```
/api/v1
├── /reverseSimulations
│   ├── GET      (list all)
│   ├── POST     (create new)
│   ├── /{id}
│   │   ├── GET     (get details)
│   │   ├── PUT     (update)
│   │   └── DELETE  (delete)
│   │
│   ├── /{id}/goalSetting
│   │   ├── GET     (get goal)
│   │   └── POST    (create/update)
│   │
│   ├── /{id}/calculate
│   │   ├── POST    (full calculation)
│   │   ├── /reverse (POST)
│   │   ├── /feasibility (POST)
│   │   └── /allocation (POST)
│   │
│   ├── /{id}/actions
│   │   ├── GET     (list actions)
│   │   ├── POST    (create)
│   │   ├── /{actionId}
│   │   │   ├── PUT     (update)
│   │   │   ├── DELETE  (delete)
│   │   │   └── /activities (GET, POST, PUT, DELETE)
│   │
│   ├── /{id}/timeline
│   │   ├── GET     (get timeline)
│   │   ├── POST    (create)
│   │   └── /milestones
│   │       ├── GET
│   │       └── /{milestoneId}/progress (PUT)
│   │
│   ├── /{id}/resources
│   │   ├── GET     (allocation)
│   │   └── PUT     (update)
│   │
│   └── /{id}/export
│       ├── /pdf (GET)
│       └── /excel (GET)
```

### Middleware Stack

```typescript
// Express middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(errorHandler);

// Authentication
app.use(authenticateToken);

// Validation
app.use(validateRequest);

// Rate limiting
app.use(rateLimiter);

// Request tracking
app.use(requestTracker);
```

---

## Data Flow

### Complete Workflow

```
1. User creates new simulation
   ↓
2. Input goal setting data
   ├─ Current health & dimensions
   ├─ Target goal & timeline
   ├─ Budget & resources
   └─ Success criteria
   ↓
3. System calculates reverse targets
   ├─ Calculate required points
   ├─ Strategic allocation
   └─ Feasibility adjustment
   ↓
4. Feasibility analysis
   ├─ Assess per-dimension feasibility
   ├─ Identify risks
   └─ Generate contingency plans
   ↓
5. Action mapping
   ├─ Root cause analysis
   ├─ Define solutions
   └─ Break into activities
   ↓
6. Resource allocation
   ├─ Allocate by tier
   ├─ Cost-benefit analysis
   └─ Calculate ROI
   ↓
7. Timeline generation
   ├─ Create phases
   ├─ Define milestones
   └─ Set KPIs
   ↓
8. Export & approve
   ├─ PDF/Excel export
   ├─ Stakeholder review
   └─ Finalize plan
   ↓
9. Execution & monitoring
   ├─ Track progress
   ├─ Monitor KPIs
   ├─ Manage risks
   └─ Course correction
```

---

## Security Architecture

### Authentication & Authorization

```typescript
// Firebase Auth integration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

// Custom claims for authorization
const getAdditionalClaims = async (userId) => {
  return {
    role: 'admin|principal|teacher',
    schoolId: 'school-uuid',
    permissions: ['read', 'write', 'delete']
  };
};
```

### Data Security

- Firestore Security Rules
- Field-level encryption for sensitive data
- Audit logging for all operations
- Rate limiting on sensitive endpoints

### Input Validation

```typescript
// Validate all inputs
const validateGoalSetting = (data) => {
  const schema = Joi.object({
    currentHealth: Joi.number().min(0).max(100).required(),
    targetHealth: Joi.number().min(0).max(100).required(),
    timeline: Joi.number().valid(3, 6, 12, 18, 24).required(),
    budget: Joi.number().min(0).max(10000000000).required(), // ₹100Cr max
  });
  
  return schema.validate(data);
};
```

---

## Scalability & Performance

### Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| Reverse calculation | < 1 second | TBD |
| Feasibility analysis | < 2 seconds | TBD |
| Action mapping generation | < 3 seconds | TBD |
| Timeline creation | < 1 second | TBD |
| Page load | < 2 seconds | TBD |
| Chart rendering | < 500ms | TBD |

### Optimization Strategies

1. **Database Optimization**
   - Composite indexing
   - Data denormalization where appropriate
   - Query optimization

2. **API Optimization**
   - Response pagination
   - Field selection (partial responses)
   - Caching with ETags

3. **Frontend Optimization**
   - Code splitting
   - Lazy loading
   - Memoization of calculations
   - Virtual scrolling for large lists

4. **Computation Optimization**
   - Use Cloud Functions for heavy tasks
   - Batch processing
   - Caching calculation results

---

## Deployment Architecture

### Development Environment

```
Frontend: localhost:3000 (Vite dev server)
Backend: localhost:3001 (Express)
Database: Firebase Emulator
Auth: Firebase Emulator
```

### Staging Environment

```
Frontend: https://staging-disha.web.app
Backend: https://staging-api.disha.cloud
Database: Firestore (staging project)
Auth: Firebase (staging)
```

### Production Environment

```
Frontend: https://disha-diagnostics.web.app (Firebase Hosting)
Backend: Cloud Run service
Database: Firestore (production project)
Auth: Firebase (production)
Analytics: BigQuery
```

### CI/CD Pipeline

```
GitHub Push
    ↓
GitHub Actions Trigger
    ├─ Lint & Format Check
    ├─ Unit Tests
    ├─ Build Frontend
    ├─ Build Backend
    └─ Integration Tests
    ↓
Deploy to Staging
    ├─ Firebase Hosting (Frontend)
    └─ Cloud Run (Backend)
    ↓
E2E Tests on Staging
    ↓
Manual Approval
    ↓
Deploy to Production
    ├─ Firebase Hosting (Frontend)
    ├─ Cloud Run (Backend)
    └─ Update indexes
    ↓
Smoke Tests
    ↓
Notify Team
```

---

## Monitoring & Observability

### Metrics to Monitor

```typescript
// Key metrics
metrics = {
  // API performance
  apiResponseTime: 'ms',
  apiErrorRate: '%',
  calculationTime: 'ms',
  
  // Database
  firestoreWriteLatency: 'ms',
  firestoreReadLatency: 'ms',
  firestoreOperationErrors: 'count',
  
  // Frontend
  pageLoadTime: 'ms',
  componentRenderTime: 'ms',
  javascriptErrors: 'count',
  
  // Business
  simulationsCreated: 'count',
  calculationsRun: 'count',
  usersActive: 'count'
};
```

### Logging Strategy

```typescript
// Structured logging
logger.info('Reverse calculation completed', {
  simulationId,
  duration: 1234,
  dimensionsCalculated: 14,
  status: 'success'
});

logger.error('Calculation failed', {
  simulationId,
  error: exception,
  timestamp: new Date()
});
```

---

**Document Status:** ✅ Ready for Implementation
**Last Updated:** 2026-08-27

