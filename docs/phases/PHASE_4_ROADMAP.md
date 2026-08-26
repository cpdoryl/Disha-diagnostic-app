# 🚀 PHASE 4: Early Warnings & Predictive Analytics

## Overview

Phase 4 extends the First Opinion Engine v3 with **predictive early warning detection** and **anomaly identification**. Based on historical data, challenge response patterns, and Health Index trends, the system will automatically flag schools at risk and predict required interventions.

**Duration:** 3-4 weeks  
**Team:** CPDO  
**Status:** 🟡 READY TO START

---

## Phase 4 Architecture

### Core Components

#### 1. Early Warning Detector (Cloud Function)
- **Trigger:** On new challenge response or cycle completion
- **Input:** Current cycle scores, historical cycles, multipliers
- **Processing:**
  - Compare Health Index against thresholds
  - Detect trend direction (improving/stable/declining)
  - Identify critical metric drops
  - Score anomaly risk (1-10 scale)
- **Output:** Warning level (GREEN/YELLOW/RED/CRITICAL)

#### 2. Predictive Scoring Engine
- **Model:** Linear regression on Health Index history
- **Input:** Last 6-12 cycles of data
- **Predictions:**
  - 30-day Health Index forecast
  - Probability of further decline
  - Recommended action timeline
- **Output:** Forecast scores + confidence intervals

#### 3. Early Warning Dashboard
- **Real-time visualization** of warning status
- **4 key sections:**
  1. Current warning level (GREEN/YELLOW/RED/CRITICAL)
  2. Risk factors breakdown
  3. Historical trend + 30-day forecast
  4. Recommended immediate actions
- **Alert notifications** (email, in-app toast)

#### 4. Anomaly Detection Engine
- **Identify unusual patterns:**
  - Challenge responses with suspicious severity patterns
  - Rapid changes in multiplier values
  - Outlier respondent feedback
  - Inconsistent stakeholder perspectives
- **Scoring:** 0-100 anomaly likelihood
- **Output:** Flagged responses + recommendations

---

## Implementation Plan

### Phase 4a: Backend Infrastructure (Week 1)

#### Step 1: Historical Data Analysis Engine
```typescript
// src/lib/firstOpinion/historicalAnalysis.ts
- calculateHealthTrend(cycles[]) → trend_direction (IMPROVING|STABLE|DECLINING)
- predictHealthIndex(cycles[], forecast_days=30) → [predictions with confidence]
- detectCyclicPatterns(cycles[]) → seasonal_factors
- identifyOutliers(cycle_data) → [outlier_scores]
```

**Tests needed:** 12+ unit tests covering trend calculation, forecasting accuracy

#### Step 2: Early Warning Rules Engine
```typescript
// src/lib/firstOpinion/earlyWarningRules.ts
- evaluateHealthThresholds(health_index, threshold_config) → warning_level
- scoreAnomalyRisk(cycle_scores, history, multipliers) → risk_score (1-10)
- generateWarningAlert(warning_level, factors) → AlertMessage
- recommendActions(warning_level, factors) → Action[]
```

**Rules:**
- Health < 40: CRITICAL (immediate intervention)
- Health 40-50: RED (urgent improvement needed)
- Health 50-65: YELLOW (monitoring required)
- Health >= 75: GREEN (on track)
- Declining trend: escalate by 1 level
- Gap > 25: add "Address Gap" to actions

#### Step 3: Cloud Functions for Detection
```typescript
// functions/src/firstOpinion/detectEarlyWarnings.ts (onCall)
- Admin-gated callable function
- Input: schoolId, cycleId
- Processing: historical data + current scores + rules engine
- Output: Warning details + forecast

// functions/src/firstOpinion/triggers/onCycleCompletion.ts (new)
- Auto-trigger when cycle scores calculated
- Auto-generate and persist warning doc
- Send alert notifications
```

**Tests:** Emulator-based integration tests

---

### Phase 4b: Frontend Components (Week 2)

#### Step 1: Early Warning Dashboard Component
```typescript
// src/components/FirstOpinion/EarlyWarning/EarlyWarningDashboard.tsx (350+ LOC)
- Real-time listener on warning doc
- 4-section layout:
  1. Warning status card (GREEN/YELLOW/RED/CRITICAL)
  2. Risk factors grid (Health, Gap, Trend, Anomaly)
  3. 30-day forecast chart (Recharts AreaChart)
  4. Recommended actions (prioritized list)
- Color-coded severity indicators
- Trend sparklines for each metric
```

#### Step 2: Anomaly Report Component
```typescript
// src/components/FirstOpinion/Reports/AnomalyReport.tsx (280+ LOC)
- List of flagged responses + scores
- Anomaly type breakdown (pattern-based, outlier, inconsistent)
- Detail view for each anomaly
- Override/dismiss functionality
- Audit trail
```

#### Step 3: Forecast Visualization
```typescript
// src/components/FirstOpinion/Charts/HealthForecast.tsx (220+ LOC)
- 30-day forecast chart
- Historical line (last 12 cycles)
- Forecast line (next 30 days)
- Confidence bands (upper/lower bounds)
- Threshold indicators (75/65/50/40)
- Interactive tooltip
```

#### Step 4: Alert Notification System
```typescript
// src/components/FirstOpinion/Alerts/AlertNotification.tsx (150+ LOC)
- Toast notifications for warnings
- Email alert templates
- In-app notification history
- Dismiss/snooze functionality
- Redirect to dashboard on click
```

---

### Phase 4c: Integration & Deployment (Week 3)

#### Step 1: Wire into Main Hub
```typescript
// src/pages/FirstOpinionEngine.tsx (updated)
- Add 5th tab: "Early Warnings"
- Route to EarlyWarningDashboard
- Show warning badge on tab (if RED/CRITICAL)
- Real-time status in header
```

#### Step 2: Integrate Alerts
```typescript
// src/components/FirstOpinion/Dashboard/FirstOpinionResultsDashboard.tsx (updated)
- Show warning banner if status not GREEN
- Link to warnings dashboard
- Display immediate actions
```

#### Step 3: Cloud Function Deployment
```bash
firebase deploy --only functions:detectEarlyWarnings,functions:onCycleCompletion
```

#### Step 4: Database Schema Updates
```typescript
// Add to Firestore:
schools/{schoolId}/assessmentCycles/{cycleId}/warnings/
  - warningLevel: 'GREEN'|'YELLOW'|'RED'|'CRITICAL'
  - factors: {health, gap, trend, anomaly}
  - forecast: {predictions[], confidence}
  - actions: Action[]
  - createdAt, updatedAt

schools/{schoolId}/assessmentCycles/{cycleId}/anomalies/
  - responseId, anomalyScore, anomalyType
  - details, confidence
  - reviewed, action
```

---

### Phase 4d: Testing & Refinement (Week 4)

#### Step 1: Unit Tests (Backend)
- Historical analysis: 12+ tests
- Rules engine: 15+ tests
- Cloud functions: 8+ tests
- Target: 100% coverage for prediction logic

#### Step 2: Integration Tests
- End-to-end: submit challenge → auto-detect warning → dashboard updates
- Forecast accuracy: compare predictions vs actuals (historical backtesting)
- Multi-school: batch warning detection

#### Step 3: Performance Testing
- Detection latency: < 500ms
- Forecast calculation: < 1s
- Dashboard load: < 800ms

#### Step 4: Smoke Testing
- Warning triggered correctly at each threshold
- Alerts sent as expected
- Dashboard displays forecast + actions
- No false positives on stable schools

---

## Feature Details

### Early Warning Levels

| Level | Health | Criteria | Action Timeline |
|-------|--------|----------|-----------------|
| 🟢 GREEN | 75+ | On track, no concerns | Continue monitoring |
| 🟡 YELLOW | 65-74 | Minor dips, review trends | 1-2 week action |
| 🔴 RED | 50-64 | Significant issues | 1-3 day response |
| 🔴 CRITICAL | <50 | Emergency intervention | Immediate action |

**Modifiers:**
- **Declining Trend:** Escalate by 1 level
- **Gap > 25:** Add "Address Reality Gap" action
- **Multiple Low Scores:** Escalate by 1 level

### Anomaly Types

```
1. Pattern Anomaly
   - Unusual severity distribution (e.g., all 10s or all 1s)
   - Inconsistent with respondent role
   - Confidence: 0-100

2. Statistical Outlier
   - Response severity > 2σ from mean
   - Unexpected multiplier value
   - Confidence: 0-100

3. Consistency Anomaly
   - Contradictory responses (e.g., "very bad" but "no problems")
   - Inconsistent role ratings
   - Confidence: 0-100

4. Trend Anomaly
   - Sudden unexplained score changes
   - Reversal of pattern
   - Confidence: 0-100
```

### 30-Day Forecast Calculation

```
Input: Last 6-12 cycles of Health Index
Model: Linear regression (y = mx + b)
Output: 30 daily predictions + confidence bands

Confidence Bands:
- Lower: y - 1.96 * σ
- Upper: y + 1.96 * σ

Displayed on chart as shaded area
```

---

## File Structure

```
src/
├── lib/firstOpinion/
│   ├── historicalAnalysis.ts (200 LOC)
│   └── earlyWarningRules.ts (200 LOC)
├── components/FirstOpinion/
│   ├── EarlyWarning/
│   │   ├── EarlyWarningDashboard.tsx (350 LOC)
│   │   └── AlertNotification.tsx (150 LOC)
│   ├── Reports/
│   │   └── AnomalyReport.tsx (280 LOC)
│   └── Charts/
│       └── HealthForecast.tsx (220 LOC)
└── pages/
    └── FirstOpinionEngine.tsx (updated +50 LOC)

functions/src/firstOpinion/
├── historicalAnalysis.ts (200 LOC)
├── earlyWarningRules.ts (200 LOC)
├── detectEarlyWarnings.ts (onCall, 150 LOC)
└── triggers/
    └── onCycleCompletion.ts (Firestore trigger, 100 LOC)
```

---

## Success Criteria

✅ **Functional:**
- Early warning detection works on all threshold levels
- Forecast accuracy: R² > 0.75 on test data
- Anomaly detection: precision > 0.80 (< 20% false positives)
- All components render without errors

✅ **Performance:**
- Detection latency: < 500ms
- Dashboard load: < 800ms
- Forecast calculation: < 1s
- No memory leaks in 10-min session

✅ **Quality:**
- Unit tests: 35+ tests, 100% pass
- Integration tests: 8+ end-to-end scenarios
- TypeScript: Zero errors, strict mode
- Accessibility: WCAG 2.1 AA

✅ **Deployment:**
- All functions deployed successfully
- Live on Firebase Hosting
- Firestore collections created
- Security rules updated

---

## Timeline

| Week | Deliverable | Status |
|------|-------------|--------|
| 1 | Backend: History analysis, rules engine, Cloud Functions | 🟡 Ready |
| 2 | Frontend: 4 components, dashboard, charts | 🟡 Ready |
| 3 | Integration, routing, deployment | 🟡 Ready |
| 4 | Testing, refinement, sign-off | 🟡 Ready |

**Total:** 3-4 weeks  
**Start:** After Phase 3 sign-off ✅

---

## Known Constraints

1. **Data availability:** Requires 3+ historical cycles for trend analysis (default to threshold-only for new schools)
2. **Forecast accuracy:** Limited by data volume; improves with more cycles
3. **Anomaly FP rate:** May flag unusual-but-valid patterns; require manual review process
4. **Real-time:** Alerts sent on cycle completion (not continuous monitoring)

---

## Next Steps

1. ✅ Phase 3 complete & deployed → YOU ARE HERE
2. 🟡 Begin Phase 4 implementation (Week 1: Backend)
3. 🟡 Deploy Phase 4 (Week 4: Testing & go-live)
4. 🟡 Phase 5: Advanced Analytics & Visualization (post-Phase 4)

---

**Ready to proceed with Phase 4? Use:** `yes go ahead` to start Week 1 backend implementation.
