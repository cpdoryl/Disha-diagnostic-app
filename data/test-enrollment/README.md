# Test Enrollment

**Enrollment-specific test data for enrollment tracking and trend analysis**

---

## 📋 Overview

This folder contains specialized test data for enrollment-related features including enrollment trends, decline detection, and enrollment analytics.

---

## 📊 Files

### test_enrollment_decline.csv

**Purpose:** Test enrollment decline scenarios and trend detection

**Use Case:**
- Historical enrollment tracking
- Enrollment decline detection
- Trend analysis and forecasting
- Correlation with performance metrics
- Enrollment-performance relationship

**Data Characteristics:**
- Month-over-month enrollment records
- Declining trend patterns
- Timestamp/date information
- School identifier
- Enrollment counts
- Historical baseline

**When to Use:**
- Testing trend detection algorithms
- Validating decline alerts
- Testing correlation analysis
- Forecasting future enrollment
- Performance impact analysis

**Expected Output:**
- Decline trend identified
- Rate of decline calculated
- Alert triggered for significant decline
- Forecast for future enrollment
- Recommendations generated

---

## 🎯 Enrollment Analytics

### Supported Analysis Types

1. **Trend Detection**
   - Upward trends
   - Downward trends
   - Stable periods
   - Seasonal patterns

2. **Decline Analysis**
   - Percentage decline
   - Absolute count decline
   - Rate of decline
   - Projected bottoming

3. **Forecasting**
   - Linear regression forecast
   - Seasonal adjustment
   - Confidence intervals
   - Best/worst case scenarios

4. **Correlation Analysis**
   - Enrollment vs. performance
   - Enrollment vs. satisfaction
   - Enrollment vs. outcomes
   - Leading indicators

---

## 📈 Data Structure

### Typical Columns
```
- Date / Month
- School ID
- Total Enrollment
- New Admissions
- Withdrawals
- Grade Level Distribution
- Previous Month Count
- Year-over-Year Change
```

### Typical Format
```
Date, SchoolID, Enrollment, Change, YoYChange
2024-01, SCHOOL001, 500, 0, 0
2024-02, SCHOOL001, 495, -5, -1%
2024-03, SCHOOL001, 488, -7, -1.4%
2024-04, SCHOOL001, 480, -8, -1.6%
2024-05, SCHOOL001, 471, -9, -1.9%
...
```

---

## 🚀 Use Cases

### Use Case 1: Decline Detection
```
Input: test_enrollment_decline.csv
Process: Analyze month-over-month trends
Output: Decline rate, alert threshold, forecast
Action: Trigger enrollment alert
```

### Use Case 2: Forecasting
```
Input: Historical enrollment data
Process: Apply trend analysis
Output: Enrollment forecast (3-6 months)
Action: Plan interventions
```

### Use Case 3: Performance Correlation
```
Input: Enrollment trends + Performance data
Process: Correlation analysis
Output: Enrollment-performance relationship
Action: Link enrollment to outcomes
```

### Use Case 4: Benchmarking
```
Input: School enrollment trends
Process: Compare against similar schools
Output: Benchmark analysis
Action: Identify improvement areas
```

---

## 📊 Analytics Metrics

### Calculated from Enrollment Data
| Metric | Formula | Purpose |
|--------|---------|---------|
| **Decline Rate** | (Current - Previous) / Previous × 100 | Percentage change |
| **Absolute Change** | Current - Previous | Raw change count |
| **3-Month Trend** | Average of 3-month changes | Trend strength |
| **Forecast** | Linear regression projection | Future prediction |
| **Stability Index** | Std Dev of changes | Volatility measure |

---

## 🎯 Testing Scenarios

### Test Scenario 1: Rapid Decline
```
Month 1: 500 students
Month 2: 480 students (-4%)
Month 3: 460 students (-4%)
Month 4: 440 students (-4%)
Expected: Alert triggered, decline pattern detected
```

### Test Scenario 2: Stabilization
```
Month 1-3: Declining
Month 4-6: Stable (no further decline)
Expected: Stabilization detected, alert cleared
```

### Test Scenario 3: Seasonal Pattern
```
Pattern: Decline in summer, recovery in fall
Expected: Seasonal pattern recognized, ignored in trend
```

### Test Scenario 4: Small Fluctuation
```
Month 1-12: ±1-2 student variation
Expected: No alert (within normal variation)
```

---

## ✅ Quality Checks

- [ ] All dates are in chronological order
- [ ] Enrollment values are non-negative integers
- [ ] No gaps in date sequence (if monthly data)
- [ ] School IDs are consistent
- [ ] Data is within realistic range
- [ ] No duplicate records for same date/school
- [ ] Trend direction is consistent with values
- [ ] Calculations can be verified manually

---

## 🔄 Integration with Other Systems

### Links to Performance Metrics
- Enrollment decline → School performance impact
- Enrollment loss → Alert to administration
- Enrollment trend → Dashboard indicator

### Links to Reporting
- Enrollment analytics → Management report
- Decline alerts → Administrator notification
- Forecast data → Strategic planning input

### Links to Recommendations
- Enrollment decline → Retention recommendations
- Forecast shortage → Recruitment recommendations
- Performance correlation → Root cause analysis

---

## 📈 Trend Analysis Examples

### Example 1: Continuous Decline
```
Months 1-6: Linear decline (-5 students/month)
Trend: Strong negative
Action: Investigate causes, plan interventions
```

### Example 2: Plateau Then Decline
```
Months 1-3: Stable (±1 student)
Months 4-6: Decline (-8 students/month)
Trend: Recent negative spike
Action: Quick response needed
```

### Example 3: Recovery Pattern
```
Months 1-3: Decline (-10 students/month)
Months 4-6: Recovery (+5 students/month)
Trend: Improvement underway
Action: Continue current initiatives
```

---

## 🎓 How to Use

### For Developers
1. Load CSV into data structure
2. Calculate trend metrics
3. Detect pattern type
4. Implement alerts
5. Test with this data

### For Data Analysts
1. Calculate descriptive statistics
2. Perform trend analysis
3. Identify patterns
4. Generate forecasts
5. Create visualizations

### For QA/Testing
1. Load enrollment data
2. Run trend detection
3. Verify calculations
4. Test alert thresholds
5. Validate forecasts

---

## 📚 Related Files

- `/test-scenarios/` - Other test scenarios
- `/reference-data/` - Reference calculations
- `/sample-data/` - Complete sample data
- `/docs/user-guides/` - User procedures

---

**Last Updated:** August 26, 2026  
**Files:** 1 (test_enrollment_decline.csv)  
**Status:** ✅ Ready for testing

For data hub overview, see `../README.md`
