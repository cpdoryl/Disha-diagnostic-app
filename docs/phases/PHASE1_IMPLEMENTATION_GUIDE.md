# Phase 1 Implementation Guide - Core Engine & Data Model

**CPDO Development Phase**
**Created: 2026-08-22**
**Duration: Weeks 1-4**
**Status: Ready to Execute**

---

## Overview

Phase 1 focuses on building the foundational engine for DISHA First Opinion:
1. Database schema setup
2. Core calculation engines (S_sub, M_obj, Health Index, Gap)
3. Data validation layer
4. Real-time listeners foundation
5. Admin dashboard scaffolding

---

## File Structure (New Components)

```
src/
├── components/
│   ├── FirstOpinion/
│   │   ├── ChallengeForm.tsx          # 15-challenge form builder
│   │   ├── ResponseAggregator.tsx     # Real-time response display
│   │   ├── HealthIndexGauge.tsx       # Visual gauge component
│   │   ├── MultiplierCard.tsx         # Individual multiplier display
│   │   ├── QuadrantChart.tsx          # Gap-based quadrant viz
│   │   └── DriverRanking.tsx          # Challenge severity ranking
│   │
│   └── Dashboard/
│       ├── FirstOpinionDashboard.tsx  # Main dashboard
│       ├── ExecutiveHeadline.tsx      # Health Index + Trend
│       └── CycleManagement.tsx        # Create/manage cycles
│
├── lib/
│   ├── firstOpinion/
│   │   ├── calculations.ts
│   │   │   ├── calculateSsub()        # Corrected weighted formula
│   │   │   ├── calculateMobj()        # Geometric mean
│   │   │   ├── calculateHealthIndex() # H = (S_sub × M_obj) - penalty
│   │   │   ├── calculateGap()         # Gap-based quadrant
│   │   │   └── validateResponses()    # Fact vs Perception validation
│   │   │
│   │   ├── dataCards.ts               # 8 multiplier definitions
│   │   ├── challengeBank.ts           # 15-challenge specs
│   │   └── formulas.ts                # All calculation formulas
│   │
│   └── firebase/
│       ├── firstOpinionSchema.ts      # Firestore collection refs
│       ├── realtime.ts                # Listeners setup
│       └── operations.ts              # Read/write operations
│
├── data/
│   ├── firstOpinion/
│   │   ├── challenges.json            # 15 challenges (C1-C15)
│   │   ├── multipliers.json           # 8 multiplier specs
│   │   ├── benchmarks.json            # Threshold ranges
│   │   └── domains.json               # Domain definitions
│   │
│   └── questions/
│       ├── c1_admission_trend.json    # C1 screening Qs
│       ├── c2_retention.json          # C2 screening Qs
│       └── ... (15 challenge files)
│
├── pages/
│   ├── FirstOpinionAssessment.tsx     # Assessment entry
│   ├── FirstOpinionDashboard.tsx      # Real-time tracking
│   └── FirstOpinionReport.tsx         # Report viewer
│
└── store/
    ├── firstOpinionStore.ts           # Zustand: cycle + response state
    └── multiplierStore.ts             # Zustand: multiplier cache
```

---

## Week 1-2: Database Schema & Data Models

### Task 1.1: Create Firestore Collections

**File: `lib/firebase/firstOpinionSchema.ts`**

```typescript
import { collection, CollectionReference } from 'firebase/firestore'
import { db } from './firebaseConfig'

// Collection references with proper typing
export const getSchoolsRef = () => collection(db, 'schools')
export const getAssessmentCyclesRef = (schoolId: string) =>
  collection(db, `assessmentCycles/${schoolId}`)
export const getChallengeResponsesRef = (schoolId: string, cycleId: string) =>
  collection(db, `assessmentCycles/${schoolId}/${cycleId}/challengeResponses`)
export const getMultipliersRef = (schoolId: string, cycleId: string) =>
  collection(db, `assessmentCycles/${schoolId}/${cycleId}/multipliers`)
export const getReportSnapshotRef = (schoolId: string, cycleId: string) =>
  doc(db, `assessmentCycles/${schoolId}/${cycleId}/reportSnapshot`)
export const getTrendHistoryRef = (schoolId: string) =>
  collection(db, `trendHistory/${schoolId}/cycles`)

// Type definitions
export interface School {
  id: string
  name: string
  domain: string
  established: Timestamp
  board: string
  region: string
  studentCount: number
  teacherCount: number
  principalEmail: string
  apiKey: string
  config: {
    selectedChallenges: string[]
    respondentRoles: ('TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER')[]
    expectedRespondents: Record<string, number>
    multiplierSources: Record<string, string[]>
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface AssessmentCycle {
  id: string
  schoolId: string
  cycleNumber: number
  year: string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  startDate: Timestamp
  endDate: Timestamp
  respondentDeadline: Timestamp
  submittedAt?: Timestamp
  config: {
    selectedChallenges: string[]
    expectedRespondents: Record<string, number>
    weights: Record<string, number>
  }
  scores: {
    s_sub: number | null
    m_obj: number | null
    healthIndex: number | null
    gap: number | null
    quadrant: string | null
  }
  respondentCount: Record<string, number>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ChallengeResponse {
  id: string
  challengeId: string
  responderId: string
  role: 'TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER'
  email: string
  schoolId: string
  cycleId: string
  responses: {
    [key: string]: {
      text: string
      selectedOption: number
      maxOption: number
      isFact: boolean
      factSource?: string
    }
  }
  challenge: {
    title: string
    domain: string
    weight: number
    description: string
  }
  submittedAt: Timestamp
  updatedAt: Timestamp
  deleted: boolean
}

export interface Multiplier {
  id: string
  name: string
  category: 'CORE' | 'EXPANDED'
  value: number
  rawData: {
    value: number
    unit: string
    threshold: Record<string, { min: number; max: number }>
  }
  source: {
    system: string
    extractedAt: Timestamp
    dataCard: string
  }
  calculation: {
    formula: string
    inputs: string[]
    appliedFormula: string
  }
  validationStatus: 'VALID' | 'MISSING' | 'OUTLIER' | 'PENDING'
  validationError?: string
  updatedAt: Timestamp
}
```

### Task 1.2: Load Challenge & Multiplier Data

**File: `data/firstOpinion/challenges.json`**

```json
{
  "challenges": [
    {
      "id": "C1",
      "domain": "Growth & Enrollment",
      "title": "Admission Trend & Sustainability",
      "weight": 0.10,
      "description": "Sustainability of admission pipeline and enrollment growth",
      "questions": [
        {
          "qId": "Q1",
          "text": "Admission trend (year-on-year % growth or decline)",
          "isFact": true,
          "factSource": "admissions_system",
          "options": [
            { "value": 1, "label": "Declining >10%", "score": 1 },
            { "value": 2, "label": "Declining 5-10%", "score": 2 },
            { "value": 3, "label": "Stable ±5%", "score": 7 },
            { "value": 4, "label": "Growing 5-10%", "score": 8 },
            { "value": 5, "label": "Growing >10%", "score": 9 }
          ]
        },
        {
          "qId": "Q2",
          "text": "Waitlist size relative to intake capacity",
          "isFact": true,
          "factSource": "admissions_system",
          "options": [
            { "value": 1, "label": "No waitlist", "score": 3 },
            { "value": 2, "label": "Minimal (<10%)", "score": 6 },
            { "value": 3, "label": "Moderate (10-25%)", "score": 8 },
            { "value": 4, "label": "Strong (25-50%)", "score": 9 },
            { "value": 5, "label": "Very strong (>50%)", "score": 10 }
          ]
        }
      ]
    },
    {
      "id": "C2",
      "domain": "Growth & Enrollment",
      "title": "Retention & Continuity",
      "weight": 0.12,
      "description": "Student retention across years and class continuity"
    },
    // ... remaining 13 challenges (C3-C15)
  ]
}
```

**File: `data/firstOpinion/multipliers.json`**

```json
{
  "multipliers": [
    {
      "id": "STR",
      "name": "Student-Teacher Ratio",
      "category": "CORE",
      "dataUnit": "ratio",
      "sourceSystem": "HR_SYSTEM + ENROLLMENT",
      "thresholds": {
        "excellent": { "min": 0, "max": 25, "score": 1.0 },
        "good": { "min": 25, "max": 30, "score": 0.85 },
        "average": { "min": 30, "max": 35, "score": 0.6 },
        "poor": { "min": 35, "max": 40, "score": 0.3 },
        "critical": { "min": 40, "max": 200, "score": 0.0 }
      },
      "benchmark": { "national": 30, "cbse": 30 },
      "calculation": "Total Students / Teaching Staff (FTE)"
    },
    {
      "id": "ParentSLA",
      "name": "Parent Response SLA",
      "category": "CORE",
      "dataUnit": "hours",
      "sourceSystem": "COMMUNICATION_LOG",
      "thresholds": {
        "excellent": { "min": 0, "max": 4, "score": 1.0 },
        "good": { "min": 4, "max": 8, "score": 0.85 },
        "average": { "min": 8, "max": 24, "score": 0.6 },
        "poor": { "min": 24, "max": 48, "score": 0.3 },
        "critical": { "min": 48, "max": 999, "score": 0.0 }
      }
    }
    // ... 6 more multipliers
  ]
}
```

---

## Week 2-3: Core Calculation Engines

### Task 2.1: Implement S_sub (Subjective Score) Engine

**File: `lib/firstOpinion/calculations.ts`**

```typescript
import { ChallengeResponse } from '../firebase/firstOpinionSchema'

/**
 * Calculate S_sub (Subjective/Perception Score)
 * Refinement 2 (Corrected Weighted Formula)
 *
 * Formula:
 * 1. For each challenge: severity = Σ(selected) / Σ(max)
 * 2. health = 1 - severity
 * 3. S_sub = 100 × Σ(weight × health)
 */
export function calculateSsub(
  responses: ChallengeResponse[],
  weights: Record<string, number>
): number {
  const challengeScores: Record<string, { health: number; weight: number }> = {}

  // Group responses by challenge
  const byChallenge = responses.reduce(
    (acc, resp) => {
      if (!acc[resp.challengeId]) acc[resp.challengeId] = []
      acc[resp.challengeId].push(resp)
      return acc
    },
    {} as Record<string, ChallengeResponse[]>
  )

  // Calculate health for each challenge
  for (const [challengeId, respList] of Object.entries(byChallenge)) {
    if (respList.length === 0) continue

    // Aggregate responses for this challenge
    let totalSelected = 0
    let totalMax = 0

    respList.forEach(resp => {
      Object.values(resp.responses).forEach(q => {
        totalSelected += q.selectedOption
        totalMax += q.maxOption
      })
    })

    // Calculate severity and health
    const severity = totalMax > 0 ? totalSelected / totalMax : 0.5
    const health = 1 - severity

    // Store with weight
    challengeScores[challengeId] = {
      health,
      weight: weights[challengeId] || 0.08
    }
  }

  // Calculate weighted sum
  let weightedSum = 0
  let totalWeight = 0

  for (const { health, weight } of Object.values(challengeScores)) {
    weightedSum += weight * health
    totalWeight += weight
  }

  // Normalize to 0-100
  const s_sub = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50

  return Math.round(s_sub * 10) / 10 // Round to 1 decimal
}
```

### Task 2.2: Implement M_obj (Objective Score) with Geometric Mean

**File: `lib/firstOpinion/calculations.ts` (continued)**

```typescript
import { Multiplier } from '../firebase/firstOpinionSchema'

/**
 * Calculate M_obj (Objective/Reality Score)
 * Refinement 3 (Geometric Mean Fix)
 *
 * Formula: M_obj = (m1 × m2 × ... × mn) ^ (1/n)
 * Prevents score compounding when adding multipliers
 */
export function calculateMobj(multipliers: Multiplier[]): number {
  // Validate we have multipliers
  if (multipliers.length === 0) {
    console.warn('No multipliers provided for M_obj calculation')
    return 0.5 // Default midpoint if missing
  }

  // Filter valid multipliers
  const validMultipliers = multipliers.filter(
    m => m.validationStatus === 'VALID' && m.value >= 0 && m.value <= 1.0
  )

  if (validMultipliers.length === 0) {
    console.warn('No valid multipliers found')
    return 0.5
  }

  // Calculate geometric mean
  const product = validMultipliers.reduce((acc, m) => acc * m.value, 1)
  const geometricMean = Math.pow(product, 1 / validMultipliers.length)

  // Convert to 0-100 scale for reporting
  const m_obj = geometricMean * 100

  return Math.round(m_obj * 10) / 10
}
```

### Task 2.3: Implement Health Index & Delusion Penalty

**File: `lib/firstOpinion/calculations.ts` (continued)**

```typescript
/**
 * Calculate Health Index (H)
 * Refinement 1 (Core Metric)
 *
 * Formula:
 * 1. raw_health = (S_sub / 100) × (M_obj / 100) × 100
 * 2. delusion_penalty = MAX(0, S_sub - 80)
 * 3. H = MAX(0, MIN(100, raw_health - delusion_penalty))
 */
export function calculateHealthIndex(s_sub: number, m_obj: number): number {
  // Convert M_obj from 0-100 back to 0-1 scale for calculation
  const m_obj_normalized = m_obj / 100

  // Calculate raw health as product
  const raw_health = (s_sub / 100) * m_obj_normalized * 100

  // Calculate delusion penalty (only if S_sub > 80)
  const delusion_penalty = Math.max(0, s_sub - 80)

  // Apply penalty and clamp to 0-100
  const healthIndex = Math.max(0, Math.min(100, raw_health - delusion_penalty))

  return Math.round(healthIndex * 10) / 10
}

/**
 * Get Health Status & Color
 */
export function getHealthStatus(
  healthIndex: number
): { status: string; color: string; description: string } {
  if (healthIndex >= 80) {
    return { status: 'EXCELLENT', color: 'green', description: 'School is in excellent health' }
  }
  if (healthIndex >= 60) {
    return { status: 'GOOD', color: 'lime', description: 'School is in good health' }
  }
  if (healthIndex >= 40) {
    return { status: 'FAIR', color: 'yellow', description: 'School needs attention' }
  }
  if (healthIndex >= 20) {
    return { status: 'POOR', color: 'orange', description: 'School requires significant intervention' }
  }
  return { status: 'CRITICAL', color: 'red', description: 'School is in critical condition' }
}
```

### Task 2.4: Implement Gap-Based Quadrant Logic

**File: `lib/firstOpinion/calculations.ts` (continued)**

```typescript
/**
 * Calculate Gap & Determine Quadrant
 * Refinement 11 (Gap-Based Quadrant)
 *
 * Gap = S_sub - M_obj (perception vs reality)
 * Quadrants:
 * - Negative: Reality Better (solid operations, communication gap)
 * - Near Zero: Aligned (credible read)
 * - Positive: Perception Better (blind spot risk)
 */
export function calculateGapAndQuadrant(
  s_sub: number,
  m_obj: number
): { gap: number; quadrant: string; interpretation: string } {
  // Raw gap
  const rawGap = s_sub - m_obj

  // Scale to 0-100 range (center at 50 = aligned)
  const gap = Math.max(0, Math.min(100, rawGap + 50))

  let quadrant: string
  let interpretation: string

  if (gap < 30) {
    quadrant = 'REALITY_BETTER'
    interpretation =
      'Operations are solid but perception lags. Focus on communication and visibility of achievements.'
  } else if (gap > 70) {
    quadrant = 'PERCEPTION_BETTER'
    interpretation =
      'Leadership perceives things well, but operations may be deteriorating. Risk of blind spots. Validate with hard data.'
  } else {
    quadrant = 'ALIGNED'
    interpretation =
      'Perception aligns with reality. The school has an accurate read of its situation. Credible diagnosis.'
  }

  return {
    gap: Math.round(gap * 10) / 10,
    quadrant,
    interpretation
  }
}
```

---

## Week 3: Data Validation & Fact-vs-Perception Tagging

### Task 3.1: Implement Response Validation

**File: `lib/firstOpinion/calculations.ts` (continued)**

```typescript
/**
 * Validate Response Quality
 * Refinement 4 (Fact-vs-Perception Tagging)
 */
export interface ValidationResult {
  isValid: boolean
  score: number
  errors: string[]
  warnings: string[]
  factVsPerceptionBreakdown: {
    factBased: number
    perceptionBased: number
  }
}

export function validateChallengeResponses(
  responses: ChallengeResponse[],
  challengeId: string
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let factCount = 0
  let perceptionCount = 0

  if (responses.length === 0) {
    errors.push('No responses provided')
    return {
      isValid: false,
      score: 0,
      errors,
      warnings,
      factVsPerceptionBreakdown: { factBased: 0, perceptionBased: 0 }
    }
  }

  // Validate each response
  responses.forEach(resp => {
    // Count fact vs perception questions
    Object.values(resp.responses).forEach(q => {
      if (q.isFact) {
        factCount++
        // Validate fact-based answer has a source
        if (!q.factSource) {
          warnings.push(`Fact-based question missing data source: ${q.text}`)
        }
      } else {
        perceptionCount++
      }

      // Validate option is within range
      if (q.selectedOption < 1 || q.selectedOption > q.maxOption) {
        errors.push(
          `Invalid response option: ${q.selectedOption} (range: 1-${q.maxOption})`
        )
      }
    })

    // Check for missing mandatory fields
    if (!resp.responderId) errors.push('Missing responderId')
    if (!resp.role) errors.push('Missing respondent role')
    if (!resp.email) errors.push('Missing respondent email')
  })

  const isValid = errors.length === 0

  return {
    isValid,
    score: isValid ? 100 : Math.max(0, 100 - errors.length * 10),
    errors,
    warnings,
    factVsPerceptionBreakdown: {
      factBased: factCount,
      perceptionBased: perceptionCount
    }
  }
}
```

---

## Week 4: Real-time Listeners & Dashboard Components

### Task 4.1: Setup Real-time Challenge Response Listener

**File: `lib/firebase/realtime.ts`**

```typescript
import { onSnapshot, collection, query, where } from 'firebase/firestore'
import { db } from './firebaseConfig'
import { getChallengeResponsesRef } from './firstOpinionSchema'

/**
 * Listen for challenge responses in real-time
 * Triggers S_sub recalculation and dashboard update
 */
export function setupChallengeResponseListener(
  schoolId: string,
  cycleId: string,
  onUpdate: (responses: ChallengeResponse[], stats: ResponseStats) => void
) {
  const ref = getChallengeResponsesRef(schoolId, cycleId)
  const q = query(ref, where('deleted', '==', false))

  return onSnapshot(q, snapshot => {
    const responses = snapshot.docs.map(doc => doc.data() as ChallengeResponse)

    // Calculate response statistics
    const stats = calculateResponseStats(responses)

    // Trigger update
    onUpdate(responses, stats)
  })
}

interface ResponseStats {
  totalResponses: number
  byRole: Record<string, number>
  completionPercentage: number
  lastUpdate: Date
}

function calculateResponseStats(responses: ChallengeResponse[]): ResponseStats {
  const byRole: Record<string, number> = {}

  responses.forEach(r => {
    byRole[r.role] = (byRole[r.role] || 0) + 1
  })

  return {
    totalResponses: responses.length,
    byRole,
    completionPercentage: 75, // Placeholder - calculate based on expected
    lastUpdate: new Date()
  }
}
```

### Task 4.2: Create Dashboard Components

**File: `components/FirstOpinion/HealthIndexGauge.tsx`**

```typescript
import React from 'react'
import { getHealthStatus } from '@/lib/firstOpinion/calculations'

interface HealthIndexGaugeProps {
  healthIndex: number
  trend?: number
}

export function HealthIndexGauge({ healthIndex, trend }: HealthIndexGaugeProps) {
  const { status, color, description } = getHealthStatus(healthIndex)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">School Health Index</div>

        {/* Gauge Display */}
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 20 50 A 30 30 0 0 1 80 50"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />

            {/* Health arc (colored based on score)*/}
            <path
              d={`M 20 50 A 30 30 0 0 1 ${20 + (60 * healthIndex) / 100} 50`}
              stroke={color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : '#ef4444'}
              strokeWidth="8"
              fill="none"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold">{healthIndex}</div>
              <div className="text-xs text-gray-600">/100</div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-900`}>
          {status}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-3">{description}</p>

        {/* Trend */}
        {trend !== undefined && (
          <div className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)} pts
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Deliverables Checklist

### Week 1-2: Database & Models
- [ ] Firestore collections created
- [ ] TypeScript interfaces defined
- [ ] Challenge & multiplier data loaded
- [ ] Security rules in place

### Week 2-3: Calculation Engines
- [ ] S_sub engine implemented & tested
- [ ] M_obj engine (geometric mean) implemented
- [ ] Health Index calculation with Delusion Penalty
- [ ] Gap-based quadrant logic

### Week 3: Validation
- [ ] Response validation engine
- [ ] Fact-vs-perception tagging working
- [ ] Error handling & logging

### Week 4: Real-time & UI
- [ ] Real-time listeners setup
- [ ] Health Index gauge component
- [ ] Challenge response form
- [ ] Dashboard scaffold
- [ ] All unit tests passing

---

## Testing Strategy

### Unit Tests (Week 4)
```bash
npm test -- calculations.test.ts
npm test -- validation.test.ts
npm test -- firestore.test.ts
```

### Integration Tests
- Challenge response submission
- S_sub + M_obj calculation
- Real-time listener updates

### Manual Testing
1. Create assessment cycle
2. Submit 5 challenge responses (mixed fact/perception)
3. Verify S_sub, M_obj, H calculations
4. Check dashboard updates in real-time
5. Validate quadrant classification

---

## Success Criteria

✅ All 15 challenges configured with weights
✅ S_sub calculation matches worked example from doc
✅ M_obj geometric mean prevents score compounding
✅ Health Index formula correctly applies Delusion Penalty
✅ Gap-based quadrant correctly classifies perception vs reality
✅ Dashboard updates in real-time (< 2sec lag)
✅ Fact-vs-perception tagging working
✅ 100% test coverage on calculation engines

---

**Ready to Begin Phase 1**
**Estimated Cost:** ~40-60 hours (2-3 weeks at 20 hrs/week)
**Next Review:** End of Week 4
