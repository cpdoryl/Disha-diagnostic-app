# 🤖 PHASE 5 PLAN - Advanced ML-Based Anomaly Detection

**Start Date:** 2026-08-26  
**Estimated Duration:** 3-4 hours (4 weeks of development)  
**Status:** 🟡 PLANNED  
**Build on:** Phase 4 (Early Warnings foundation)

---

## Overview

Phase 5 elevates early warning detection from threshold-based rules to ML-driven anomaly detection with predictive analytics. Builds directly on Phase 4's infrastructure, adding:

- **Statistical Anomaly Detection** — Isolation Forests, Local Outlier Factor (LOF)
- **Pattern Recognition** — Trend decomposition, seasonality analysis
- **Predictive Risk Scoring** — Time-series forecasting with uncertainty quantification
- **Adaptive Thresholds** — Learn from historical data, adjust dynamically
- **Root Cause Analysis** — Multi-factor attribution for anomalies

---

## Architecture Overview

```
Phase 4 Foundation (Thresholds)
    ↓
Phase 5 ML Layer (Predictive)
    ├─ Historical Data Analysis
    ├─ Feature Engineering
    ├─ Anomaly Detection Models
    ├─ Risk Prediction
    └─ Adaptive Learning

Real-Time Pipeline:
User Submission
    ↓
Phase 4 Triggers (real-time)
    ↓
Phase 5 ML Detection (background)
    ↓
Enhanced Dashboard with ML Insights
    ↓
Predictive Alerts 2-3 cycles ahead
```

---

## Week 1: ML Infrastructure & Feature Engineering (1,000 LOC)

### Files to Create

**1. `src/lib/firstOpinion/mlFeatures.ts` (300 LOC)**
```typescript
// Feature Engineering for ML models
interface HistoricalMetrics {
  cycle: number
  timestamp: Date
  healthIndex: number
  gap: number
  s_sub: number
  m_obj: number
  respondentCount: number
  quadrant: string
  severity: number[]  // per-challenge
}

interface Features {
  // Trend features
  trend_direction: number        // -1, 0, 1
  trend_magnitude: number        // 0-100
  trend_acceleration: number     // rate of change
  
  // Volatility features
  volatility: number             // std dev of recent values
  volatility_trend: number       // increasing/decreasing
  
  // Seasonality features
  seasonal_component: number     // cyclic pattern strength
  seasonal_phase: number         // position in cycle
  
  // Gap features
  gap_trend: number              // gap widening/narrowing
  gap_quadrant_drift: number     // movement between quadrants
  
  // Response features
  respondent_consistency: number // variance in respondent count
  respondent_trend: number       // growth/decline
  
  // Correlation features
  s_sub_m_obj_correlation: number
  health_gap_correlation: number
  
  // Composite features
  stress_index: number           // combined risk score
  change_intensity: number       // magnitude of recent changes
}

export function engineerFeatures(
  historicalMetrics: HistoricalMetrics[]
): Features

export function normalizeFeatures(
  features: Features
): number[]  // normalized to [-1, 1]
```

**2. `src/lib/firstOpinion/mlModels.ts` (400 LOC)**
```typescript
// ML anomaly detection models

interface AnomalyScore {
  score: number              // 0-1 (0=normal, 1=anomalous)
  confidence: number         // 0-1
  type: string              // 'outlier' | 'pattern' | 'drift' | 'sudden'
  severity: 'LOW' | 'MED' | 'HIGH'
  interpretation: string
}

// 1. Isolation Forest (for multi-dimensional outliers)
export class IsolationForest {
  train(features: number[][]): void
  predict(features: number[]): AnomalyScore
  explainAnomalies(features: number[]): FeatureImportance[]
}

// 2. Local Outlier Factor (for contextual anomalies)
export class LocalOutlierFactor {
  train(features: number[][]): void
  predict(features: number[]): AnomalyScore
  getNeighborContext(features: number[]): number[][]
}

// 3. Exponential Weighted Moving Average (EWMA) for drift
export class DriftDetector {
  train(timeSeries: number[]): void
  predict(value: number): AnomalyScore
  getControlLimits(): { upper: number; lower: number }
}

// 4. Seasonal Decomposition with anomaly detection
export class SeasonalAnomalyDetector {
  train(timeSeries: number[]): void
  predict(value: number): AnomalyScore
  getSeasonalForecast(steps: number): number[]
  getSeasonalStrength(): number
}

// Ensemble: combine all models
export function ensembleAnomalyDetection(
  metrics: HistoricalMetrics[],
  features: Features
): {
  overallScore: AnomalyScore
  modelScores: Map<string, AnomalyScore>
  reasoning: string[]
}
```

**3. `src/lib/firstOpinion/mlTests.test.ts` (300 LOC)**
```typescript
// Unit tests for ML models
describe('Feature Engineering', () => {
  test('normalizes features to [-1, 1] range')
  test('computes trend correctly for increasing data')
  test('computes trend correctly for decreasing data')
  test('detects seasonality in cyclic data')
  test('handles edge cases (single cycle, no history)')
})

describe('Isolation Forest', () => {
  test('identifies clear outliers')
  test('maintains normal score for in-distribution data')
  test('provides confidence scores')
  test('explains feature contributions')
})

describe('Local Outlier Factor', () => {
  test('detects contextual anomalies')
  test('provides neighbor context')
  test('handles high-dimensional features')
})

describe('Drift Detector', () => {
  test('detects gradual concept drift')
  test('calculates control limits correctly')
  test('adapts to new baseline')
})

describe('Ensemble Detection', () => {
  test('combines model scores reasonably')
  test('prioritizes high-confidence anomalies')
  test('explains ensemble reasoning')
})
```

### Output

- ✅ 1,000 LOC of ML feature engineering + models
- ✅ 40+ unit tests (80%+ coverage)
- ✅ 0 external ML library dependencies (pure TS math)
- ✅ Build: <7s, 0 errors

---

## Week 2: Advanced Anomaly Detection & Root Cause (1,200 LOC)

### Files to Create

**1. `src/lib/firstOpinion/advancedAnomalyDetection.ts` (500 LOC)**
```typescript
// Advanced anomaly detection combining Phase 4 + Phase 5

interface DetectionResult {
  anomalyScore: number           // 0-100
  confidence: number             // 0-100
  type: 'STATISTICAL' | 'PATTERN' | 'DRIFT' | 'SUDDEN_CHANGE'
  severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL'
  
  // Root cause analysis
  rootCauses: RootCause[]
  contributingFactors: Factor[]
  
  // Predictive insight
  predictedTrend: 'IMPROVING' | 'STABLE' | 'DECLINING'
  riskEscalation: number         // cycles until critical (if declining)
  
  // Recommendation
  recommendedAction: string
  actionUrgency: 'IMMEDIATE' | 'THIS_WEEK' | 'THIS_MONTH'
}

interface RootCause {
  factor: string                 // e.g., 'perception_driven_gap'
  confidence: number             // 0-1
  evidence: string[]
  historicalPattern?: string
}

interface Factor {
  name: string
  contribution: number           // -100 to 100
  trend: 'WORSENING' | 'STABLE' | 'IMPROVING'
}

export function detectAdvancedAnomalies(
  currentCycle: CycleMetrics,
  historicalCycles: CycleMetrics[],
  modelEnsemble: MLModels
): DetectionResult

export function rootCauseAnalysis(
  detectionResult: DetectionResult,
  challengeSeverities: ChallengeSeverity[]
): RootCauseAnalysis

export function interactiveInvestigation(
  detectionResult: DetectionResult,
  userQuestions: string[]
): InvestigationInsights
```

**2. `src/lib/firstOpinion/riskEscalation.ts` (400 LOC)**
```typescript
// Predict when/if system will enter critical state

interface RiskTrajectory {
  currentLevel: number           // 0-100
  forecast30Day: ForecastPoint[]
  
  criticalityProbability: number // % chance of reaching CRITICAL in 30 days
  daysUntilCritical?: number    // if CRITICAL likely
  
  interventionPoint: number      // cycles until action required
  interventionType: string       // what type of action
  interventionCost: string       // effort estimate
  
  recoveryPotential: number      // likelihood of improvement if no action
}

export function predictRiskTrajectory(
  historicalCycles: CycleMetrics[],
  mlEnsemble: MLModels,
  interventionHistory?: Intervention[]
): RiskTrajectory

export function scoreInterventionOptions(
  trajectory: RiskTrajectory,
  availableInterventions: Intervention[]
): InterventionScore[]

export function simulateInterventionOutcome(
  trajectory: RiskTrajectory,
  intervention: Intervention
): {
  expectedOutcome: number        // health index after intervention
  confidence: number
  timeToEffect: number           // cycles
  risks: string[]
}
```

**3. `src/lib/firstOpinion/advancedTests.test.ts` (300 LOC)**
```typescript
// Tests for advanced detection and risk prediction

describe('Advanced Anomaly Detection', () => {
  test('identifies complex multi-factor anomalies')
  test('distinguishes anomaly types correctly')
  test('assigns realistic confidence scores')
  test('extracts root causes accurately')
})

describe('Risk Escalation Prediction', () => {
  test('predicts critical state accurately on historical data')
  test('identifies intervention windows')
  test('scores intervention options reasonably')
  test('simulates outcomes with realistic uncertainty')
})

describe('Integration with Phase 4', () => {
  test('enhances Phase 4 threshold-based detection')
  test('provides additional confidence when agreeing')
  test('flags Phase 4 false positives with evidence')
})
```

### Output

- ✅ 1,200 LOC advanced detection + escalation logic
- ✅ 50+ unit tests
- ✅ Root cause analysis framework
- ✅ Risk trajectory prediction
- ✅ Build: <7s, 0 errors

---

## Week 3: Frontend ML Dashboard & Integration (900 LOC)

### Files to Create

**1. `src/components/FirstOpinion/ML/MLAnomalyDashboard.tsx` (350 LOC)**
```typescript
// Frontend dashboard for ML anomaly insights

interface MLDashboardProps {
  schoolId: string
  cycleId: string
  detectionResult: DetectionResult
  riskTrajectory: RiskTrajectory
  historicalCycles: CycleMetrics[]
}

// Components:
// - Anomaly Score Visualization (gauge + trend)
// - Root Cause Breakdown (interactive treemap)
// - Risk Trajectory Chart (forecast with confidence)
// - Intervention Simulator (what-if scenarios)
// - Evidence Timeline (supporting data)

export const MLAnomalyDashboard: React.FC<MLDashboardProps>
```

**2. `src/components/FirstOpinion/ML/RiskTrajectoryChart.tsx` (250 LOC)**
```typescript
// Recharts visualization of risk trajectory

// Features:
// - 30-day forecast with uncertainty bands
// - Intervention point markers
// - Historical trend line
// - Critical threshold line
// - Interactive tooltip with probabilities
// - Scenario comparison (action vs. no action)

export const RiskTrajectoryChart: React.FC<RiskTrajectoryChartProps>
```

**3. `src/components/FirstOpinion/ML/InterventionSimulator.tsx` (300 LOC)**
```typescript
// Interactive what-if analysis for interventions

// Features:
// - Dropdown to select intervention type
// - Simulate button (shows expected outcome)
// - Comparison: with vs. without intervention
// - Risk/benefit analysis
// - Cost estimation
// - Timeline to effect

export const InterventionSimulator: React.FC<InterventionSimulatorProps>
```

**4. Update `FirstOpinionEngine.tsx`**
```typescript
// Add 6th tab: "🤖 ML Insights" (Phase 5)

// Tab structure:
// 📝 Assessment
// 📊 Results
// 📈 Trends
// 🔔 Early Warnings (Phase 4)
// 🤖 ML Insights (Phase 5 NEW)
// ⚙️ Admin
```

### Output

- ✅ 900 LOC new frontend components
- ✅ 6th tab "🤖 ML Insights" integrated
- ✅ Real-time ML detection wired to UI
- ✅ Interactive what-if scenarios
- ✅ Build: <7s, 0 errors

---

## Week 4: Cloud Functions & ML Pipeline (700 LOC)

### Files to Create

**1. `functions/src/firstOpinion/mlDetection.ts` (200 LOC)**
```typescript
// HTTP onCall Cloud Function for ML detection

export const mlDetectAnomalies = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // Input: { schoolId, cycleId }
    // Output: { anomalies, riskTrajectory, recommendations }
    
    // 1. Fetch historical cycles
    // 2. Engineer features
    // 3. Run ML ensemble
    // 4. Perform root cause analysis
    // 5. Predict risk trajectory
    // 6. Store to Firestore (mlDetections/latest)
    // 7. Return results
  })
```

**2. `functions/src/firstOpinion/mlTriggers.ts` (200 LOC)**
```typescript
// Firestore triggers for ML detection

// Trigger: onWrite to assessmentCycles/{cycleId}
// When Phase 4 completes warning detection:
// 1. Enqueue ML detection task (Pub/Sub)
// 2. Run in background (non-blocking)
// 3. Store ML results when complete

export const onCycleCompletionRunML = functions
  .region('asia-south1')
  .firestore.document('schools/{schoolId}/assessmentCycles/{cycleId}')
  .onWrite(async (change, context) => {
    // Enqueue ML detection via Pub/Sub
    // Don't block the response
  })
```

**3. `functions/src/firstOpinion/mlBatch.ts` (150 LOC)**
```typescript
// Scheduled function: retrain models daily

export const dailyMLRetraining = functions
  .region('us-central1')
  .pubsub.schedule('every 24 hours')
  .onRun(async (context) => {
    // 1. Fetch all active cycles
    // 2. Aggregate historical data
    // 3. Retrain ML ensemble models
    // 4. Store model metadata
    // 5. Update feature statistics
  })
```

**4. `functions/src/firstOpinion/mlUtils.ts` (150 LOC)**
```typescript
// Utility functions for Cloud Functions

// - Model serialization/deserialization
// - Feature computation (shared with frontend)
// - Firestore storage helpers
// - Error handling & logging
// - Performance monitoring
```

**5. Update `functions/src/index.ts`**
```typescript
export * from './firstOpinion/mlDetection'
export * from './firstOpinion/mlTriggers'
export * from './firstOpinion/mlBatch'
```

### Output

- ✅ 700 LOC Cloud Functions
- ✅ On-demand ML detection
- ✅ Automatic ML triggers
- ✅ Daily model retraining
- ✅ Firestore integration
- ✅ Build: <7s, 0 errors

---

## Implementation Timeline

```
┌─────────────────────────────────────────┐
│ Week 1: ML Infrastructure      1,000 LOC │
│ ├─ Feature engineering                  │
│ ├─ Model implementations                │
│ ├─ Unit tests (80%+ coverage)           │
│ └─ ✅ Ready for Week 2                  │
├─────────────────────────────────────────┤
│ Week 2: Advanced Detection     1,200 LOC │
│ ├─ Anomaly detection ensemble           │
│ ├─ Root cause analysis                  │
│ ├─ Risk escalation prediction           │
│ └─ ✅ Ready for frontend                │
├─────────────────────────────────────────┤
│ Week 3: Frontend Integration    900 LOC  │
│ ├─ ML dashboard components              │
│ ├─ Risk trajectory visualization        │
│ ├─ Intervention simulator               │
│ └─ ✅ Ready for deployment              │
├─────────────────────────────────────────┤
│ Week 4: Cloud Functions         700 LOC  │
│ ├─ On-call ML detection                 │
│ ├─ Firestore triggers                   │
│ ├─ Model retraining                     │
│ └─ ✅ PRODUCTION READY                  │
└─────────────────────────────────────────┘

TOTAL: 3,800+ LOC | 200+ tests | ~3-4 hours
```

---

## Key Features by End of Phase 5

### Detection Capabilities
- ✅ Statistical anomaly detection (Isolation Forest, LOF)
- ✅ Drift detection (EWMA)
- ✅ Seasonal pattern analysis
- ✅ Multi-dimensional feature analysis
- ✅ Ensemble confidence scoring

### Predictive Capabilities
- ✅ 30-day health trajectory forecast
- ✅ Criticality probability estimation
- ✅ Intervention window identification
- ✅ Recovery potential assessment
- ✅ Outcome simulation

### Root Cause Analysis
- ✅ Multi-factor attribution
- ✅ Historical pattern matching
- ✅ Contributing factor ranking
- ✅ Evidence extraction
- ✅ Interactive investigation mode

### User Experience
- ✅ 6th "🤖 ML Insights" dashboard tab
- ✅ Real-time anomaly visualization
- ✅ Risk trajectory charts
- ✅ What-if intervention simulator
- ✅ Evidence timeline view

---

## Quality Metrics

| Metric | Target |
|--------|--------|
| **Code Coverage** | 85%+ |
| **Build Time** | <7s |
| **Build Errors** | 0 |
| **Unit Tests** | 200+ |
| **Test Pass Rate** | 100% |
| **Type Safety** | No `any` types |
| **Real-Time Latency** | <2s for ML scoring |

---

## Integration Points

### Phase 4 Integration
- Uses Phase 4's early warning framework
- Enhances threshold-based detection
- Provides confidence multipliers
- Flags false positives

### Firestore Storage
```
schools/{schoolId}/assessmentCycles/{cycleId}/
├─ warnings/latest (Phase 4)
├─ mlDetections/latest (Phase 5 NEW)
│  ├─ anomalyScore
│  ├─ rootCauses[]
│  ├─ riskTrajectory
│  └─ timestamp
└─ mlModels/
   ├─ featureStats
   ├─ modelMetadata
   └─ lastRetrained
```

### Real-Time Pipeline
```
User Submission
    ↓ (Phase 2 trigger)
Score Calculation
    ↓ (Phase 4 trigger)
Early Warning Detection
    ↓ (Phase 5 NEW - async via Pub/Sub)
ML Anomaly Detection
    ↓
Store to mlDetections/latest
    ↓ (Frontend listener)
Dashboard Updates
```

---

## Dependencies & Libraries

**No External ML Libraries** — All algorithms implemented from scratch in TypeScript:
- ✅ Linear algebra (matrix operations)
- ✅ Statistical functions (mean, std dev, correlation)
- ✅ Distance metrics (Euclidean, Mahalanobis)
- ✅ Tree algorithms (decision trees for IF)
- ✅ Clustering (k-NN for LOF)

**Rationale:** 
- Keep deployment lightweight
- Full control over algorithms
- No compatibility issues
- Easier to debug & explain

---

## Success Criteria

**Phase 5 is complete when:**

1. ✅ All 200+ tests passing
2. ✅ 0 TypeScript errors
3. ✅ 3,800+ LOC deployed
4. ✅ 6th tab live on app
5. ✅ ML detection runs <2s
6. ✅ Root cause analysis accurate on 95%+ of test cases
7. ✅ Risk prediction validated against historical data
8. ✅ Firebase deployment successful
9. ✅ Real-time updates working (<500ms)
10. ✅ Documentation complete

---

## What's After Phase 5?

**Phase 6: Multi-School Benchmarking**
- Comparative analytics across schools
- Peer group analysis
- Best practice extraction
- Collaborative learning

**Phase 7: Autonomous Interventions**
- Auto-trigger recommended actions
- Integration with external systems
- Workflow automation
- Impact tracking

---

## Status

- **Start Date:** Ready (Phase 4 complete)
- **Estimated Duration:** 3-4 hours
- **Complexity:** Medium-High (ML algorithms)
- **Risk Level:** Low (Phase 4 foundation solid)
- **Go-Live Ready:** Yes (after Phase 5 complete)

---

**Ready to start Week 1?** ✅
