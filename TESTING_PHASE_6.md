# Phase 6: Integration Testing Suite Documentation

**Date:** 2026-08-26
**Status:** Ready for Testing
**Framework:** Vitest
**Coverage Target:** 75%+

---

## Overview

The Phase 6 Integration Testing Suite provides comprehensive test coverage for all 4 analytics dashboards:

1. **Data Audit Dashboard** — Metric collection progress monitoring
2. **Response Rate Tracker** — Survey completion by respondent type
3. **Trend Analysis** — Year-over-year metric comparisons
4. **Quality Monitoring** — Real-time alerts and anomalies

---

## Test Structure

### Test Files

```
src/lib/phase5/__tests__/
├── testUtils.ts                          # Mock data generators & helpers
└── dashboardIntegration.test.ts          # 5 test suites (50+ tests)

src/components/Phase5_DataInfrastructure/__tests__/
└── DataAuditDashboard.integration.test.ts # Component-specific tests (40+ tests)
```

### Total Test Coverage

- **Unit Tests:** 50+ tests for calculations and data processing
- **Integration Tests:** 40+ component-level tests
- **Cross-Component Tests:** 10+ integration tests
- **Total:** 100+ tests

---

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

### Run Specific Test Suite

```bash
npm run test -- dashboardIntegration.test.ts
npm run test -- DataAuditDashboard.integration.test.ts
```

---

## Test Suites

### Suite 1: Data Audit Dashboard Integration (10 tests)

**File:** `dashboardIntegration.test.ts`

Tests for metric collection progress monitoring:

- ✅ Coverage calculation (0-100%)
- ✅ Quality score calculation (completeness × 0.5 + verification × 0.5)
- ✅ All 14 dimensions tracking
- ✅ Cross-dimension coverage aggregation
- ✅ Coverage warnings (<50%)
- ✅ Quality warnings (<60%)
- ✅ Last-updated timestamp tracking
- ✅ Filled vs verified metric differentiation

**Key Assertions:**
```typescript
assertCoverageCalculation(filled, total, expected);
assertQualityScoreFormula(completeness, verification, expected);
```

### Suite 2: Response Rate Tracker Integration (10 tests)

**File:** `dashboardIntegration.test.ts`

Tests for survey response monitoring:

- ✅ Response counting per respondent type (TEACHER, PARENT, STUDENT, ADMIN, OTHER)
- ✅ Response rate percentage calculation
- ✅ Overall response rate aggregation
- ✅ Status classification (On Target ≥75%, In Progress 50-75%, Below Target <50%)
- ✅ Timestamp tracking
- ✅ Duplicate response detection by email

**Key Assertions:**
```typescript
assertResponseRateCalculation(actual, expected, tolerance);
```

### Suite 3: Trend Analysis Integration (10 tests)

**File:** `dashboardIntegration.test.ts`

Tests for year-over-year metric comparison:

- ✅ 12-month trend data generation
- ✅ Trend direction calculation (IMPROVING/STABLE/DECLINING)
- ✅ Change percentage calculation
- ✅ Linear forecasting for next period
- ✅ All 14 dimensions tracking
- ✅ Most improved dimension identification
- ✅ Most declining dimension identification

**Key Assertions:**
```typescript
assertTrendDirection(current, previous, expected);
```

**Trend Classification:**
- `IMPROVING`: Current > Previous + 5
- `STABLE`: Current within ±5 of Previous
- `DECLINING`: Current < Previous - 5

### Suite 4: Quality Monitoring Integration (10 tests)

**File:** `dashboardIntegration.test.ts`

Tests for real-time quality detection:

- ✅ Outlier alert detection
- ✅ Stale data alert detection (>7 days)
- ✅ Missing data alert detection
- ✅ Inconsistent data alert detection
- ✅ Anomaly alert detection
- ✅ Severity assignment (CRITICAL/WARNING/INFO)
- ✅ Alert status tracking (ACTIVE/ACKNOWLEDGED/RESOLVED)
- ✅ Overall quality score calculation (0-100)
- ✅ Quality factor identification (completeness, recency, consistency)
- ✅ Quality recommendations generation

**Alert Types:**
```
OUTLIER: 2.5σ deviation from historical average
STALE: Data not updated for >7 days
MISSING: Required data source not specified
INCONSISTENT: Significant change from previous period
ANOMALY: Sudden spikes/drops in values
```

### Suite 5: Cross-Component Integration (5 tests)

**File:** `dashboardIntegration.test.ts`

Tests for dashboard interconnection:

- ✅ School context passing through all dashboards
- ✅ Multi-source data aggregation
- ✅ Data consistency across refreshes
- ✅ Concurrent update handling
- ✅ Dashboard sync within refresh interval

### Suite 6: Data Audit Dashboard Component Tests (40+ tests)

**File:** `DataAuditDashboard.integration.test.ts`

Comprehensive component-level testing:

#### Data Calculations (8 tests)
- Coverage percentage (0-100)
- Quality score calculation
- Verification rate tracking
- Color-coding by status
- Warning generation for low coverage/quality
- Stale data detection
- Warning count aggregation

#### Dimension Coverage Grid (5 tests)
- All 14 dimensions rendering
- Overall coverage calculation
- Quality score aggregation
- Verified metric counting
- Dimensions requiring attention identification

#### Quality Metrics (5 tests)
- Completeness/verification weighting (50/50)
- Quality as 0 when no metrics
- Quality as 100 when all verified
- Data freshness tracking

#### Warning System (6 tests)
- Coverage <50% warning
- Coverage <25% critical alert
- Quality <60% warning
- Quality <40% critical alert
- Stale data (>7 days) alert
- Warning count aggregation

#### Audit Report (4 tests)
- Audit report generation
- Dimension-wise breakdown
- Top 3 dimensions by coverage
- Bottom 3 dimensions by quality

#### Real-time Updates (3 tests)
- Update on new metrics
- Last-updated timestamp refresh
- Metric verification recalculation
- 30-second refresh interval validation

---

## Mock Data Generators

### `generateMockMetrics(dimensionId, count)`

Generates mock metrics with:
- Random values (0-100)
- Data sources (MANUAL, LMS, EXCEL)
- Verification status
- Timestamps (last 7 days)

**Usage:**
```typescript
const metrics = generateMockMetrics(1, 6);
// Returns: {
//   "1a": { value: 75, dataSource: 'LMS', isVerified: true, lastUpdated: Date },
//   "1b": { value: 82, dataSource: 'MANUAL', isVerified: false, lastUpdated: Date },
//   ...
// }
```

### `generateMockSurveyResponses(respondentType, count)`

Generates mock survey responses with:
- Respondent type (TEACHER, PARENT, STUDENT, ADMIN, OTHER)
- Dimension scores (1-10 Likert)
- Email addresses (for duplicate detection)
- Timestamps

**Usage:**
```typescript
const responses = generateMockSurveyResponses('TEACHER', 5);
// Returns: [
//   { id, respondentType, schoolId, cycleId, dimensionScores, timestamp, email },
//   ...
// ]
```

### `generateMockDimensionData(dimensionId)`

Generates complete dimension data including:
- All metrics for the dimension
- Coverage percentage
- Quality score
- Verification rate
- Stats breakdown

**Usage:**
```typescript
const data = generateMockDimensionData(1);
// Returns: {
//   dimensionId: 1,
//   metrics: { ... },
//   stats: { totalMetrics, filledMetrics, coverage, quality, ... }
// }
```

### `generateMockQualityAlerts(dimensionId, count)`

Generates mock quality alerts with:
- Alert type (OUTLIER, STALE, MISSING, INCONSISTENT, ANOMALY)
- Severity (CRITICAL, WARNING, INFO)
- Message and metric reference
- Timestamp and status

### `generateMockTrendData(dimensionId)`

Generates 12-month trend data with:
- Previous cycle values
- Current cycle values
- Forecast values
- Realistic trend simulation

### `TestDataBuilder` Class

Fluent builder for complex test data:

```typescript
const data = new TestDataBuilder()
  .withMetrics(1, 6)
  .withMetrics(2, 5)
  .withSurveys('TEACHER', 10)
  .withSurveys('PARENT', 15)
  .withTrends(1)
  .build();
```

---

## Assertion Helpers

### `assertCoverageCalculation(filled, total, expected)`

Validates coverage percentage calculation.

```typescript
assertCoverageCalculation(45, 60, 75); // (45/60)*100 = 75%
```

### `assertQualityScoreFormula(completeness, verification, expected)`

Validates quality score formula: (completeness × 0.5) + (verification × 0.5)

```typescript
assertQualityScoreFormula(80, 60, 70); // (80*0.5 + 60*0.5) = 70
```

### `assertResponseRateCalculation(actual, expected, tolerance)`

Validates response rate with tolerance.

```typescript
assertResponseRateCalculation(52, 50, 2); // Within ±2%
```

### `assertTrendDirection(current, previous, expected)`

Validates trend classification (IMPROVING/STABLE/DECLINING).

```typescript
assertTrendDirection(75, 65, 'IMPROVING'); // Change > 5
assertTrendDirection(68, 65, 'STABLE');    // Change within ±5
assertTrendDirection(55, 65, 'DECLINING'); // Change < -5
```

### `assertAlertSeverity(value, expectedRange, expected)`

Validates alert severity assignment.

```typescript
assertAlertSeverity(95, { min: 70, max: 85 }, 'CRITICAL');
```

---

## Integration Test Scenarios

### Scenario 1: Complete Data Audit Flow

1. Load 14 dimensions with metrics
2. Calculate coverage for each dimension
3. Aggregate overall coverage
4. Calculate quality scores
5. Generate warnings for low coverage/quality
6. Verify last-updated timestamps

**Expected Results:**
- Overall coverage: 0-100%
- All dimensions tracked
- Warnings generated correctly
- Timestamps within reasonable range

### Scenario 2: Survey Response Collection

1. Submit responses from 5 respondent types
2. Count responses per type
3. Calculate response rates
4. Detect status (On Target/In Progress/Below Target)
5. Generate next steps

**Expected Results:**
- All respondent types counted
- Response rates accurate
- Status classifications correct
- Recommendations generated

### Scenario 3: Trend Analysis

1. Load 12 months of trend data
2. Classify trend direction (IMPROVING/STABLE/DECLINING)
3. Calculate change percentage
4. Generate forecast
5. Compare all 14 dimensions
6. Identify most improved/declining

**Expected Results:**
- Trend classification accurate
- Change calculations correct
- Forecasts reasonable
- All dimensions compared

### Scenario 4: Quality Monitoring

1. Generate 5 alert types
2. Assign severity levels
3. Calculate overall quality score
4. Identify dimensions requiring attention
5. Generate recommendations
6. Track alert status

**Expected Results:**
- All alert types detected
- Severity assignments correct
- Quality scores 0-100
- Recommendations generated

---

## Coverage Requirements

### Target Coverage: 75%+

```
Lines:       75%
Functions:   75%
Branches:    70%
Statements:  75%
```

### Coverage Report

Run to generate HTML coverage report:

```bash
npm run test:coverage
```

Report available at: `coverage/index.html`

---

## Performance Benchmarks

### Test Execution Time

- **Full Suite:** < 10 seconds
- **Data Calculations:** < 2 seconds
- **Component Integration:** < 5 seconds
- **Cross-Component:** < 1 second

### Mock Data Generation

- **Single Metric Set:** < 10ms
- **Survey Responses:** < 20ms
- **Dimension Data:** < 50ms
- **Quality Alerts:** < 30ms

---

## Continuous Integration

### GitHub Actions

Tests automatically run on:
- Push to `main`
- Push to `remote-dev`
- Pull request creation

### Test Pipeline

```
1. Install dependencies
2. Run linting
3. Run type checking (tsc)
4. Run test suite
5. Generate coverage report
6. Upload to CI dashboard
```

---

## Debugging Tests

### Enable Debug Logging

Set environment variable:

```bash
DEBUG=true npm run test
```

### Run Single Test

```bash
npm run test -- --grep "should calculate coverage percentage"
```

### Watch Specific File

```bash
npm run test -- --watch DataAuditDashboard.integration.test.ts
```

### UI Mode (Vitest Preview)

```bash
npm run test -- --ui
```

---

## Common Issues & Solutions

### Issue: Tests timing out

**Solution:** Increase timeout in vitest.config.ts

```typescript
test: {
  testTimeout: 10000, // 10 seconds
}
```

### Issue: Mock data not generating

**Solution:** Ensure TestDataBuilder imports are correct

```typescript
import { TestDataBuilder } from '@/lib/phase5/__tests__/testUtils';
```

### Issue: Coverage reports missing

**Solution:** Install coverage provider

```bash
npm install -D @vitest/coverage-v8
```

---

## Next Steps

### Phase 7: Production Hardening

After integration tests pass:

1. **Performance Optimization**
   - Profile test execution
   - Optimize mock data generation
   - Cache expensive calculations

2. **Error Handling**
   - Test error states
   - Validate error messages
   - Test recovery flows

3. **Security Testing**
   - Validate data isolation
   - Test authentication/authorization
   - Check XSS/injection vulnerabilities

4. **E2E Tests** (with Firestore Emulator)
   - Full data flow from Firestore
   - Real-time listener integration
   - Multi-user concurrent scenarios

---

## References

- **Vitest Documentation:** https://vitest.dev
- **React Testing Best Practices:** https://testing-library.com/react
- **Phase 6 Components:** `src/components/Phase5_DataInfrastructure/`
- **Phase 5 Services:** `src/lib/phase5/`

---

## Test Ownership

- **Test Suite:** @CPDO (Chief Product Development Officer)
- **Component Tests:** @Development Team
- **Maintenance:** Ongoing with each feature update

---

**Last Updated:** 2026-08-26
**Status:** READY FOR EXECUTION
