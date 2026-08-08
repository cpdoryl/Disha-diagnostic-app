# Validation Tier System - Complete Explanation

## What Are Validation Tiers?

Validation Tiers are **confidence levels** assigned to each piece of data in the DISHA diagnostic report. They indicate how reliable and direct the data source is.

**Purpose**: Help school leaders understand which findings are based on solid evidence vs. estimates, so they can prioritize actions accordingly.

---

## The Three Tiers

### Tier 1: Primary / Highest Confidence (95%+)

**Meaning**: Data comes directly from official school systems and records. This is the most reliable information.

**Examples**:
- ✅ Board exam pass rates (from CBSE/ICSE records)
- ✅ Teacher qualifications (from HR/principal database)
- ✅ Student enrollment numbers (from school admission system)
- ✅ Fee payment records (from accounts software)
- ✅ Attendance data (from attendance management system)
- ✅ Assessment responses (directly from multi-stakeholder survey)

**How it appears in reports**:
```
Board Exam Pass Rate: 82.5% [Tier 1 - Primary]
⭐⭐⭐ Highest confidence
```

**When to use these findings**:
- Base your major decisions on these
- Share confidently with stakeholders
- Use for benchmarking against national standards
- Foundation for strategic planning

---

### Tier 2: Secondary / Medium Confidence (85%)

**Meaning**: Data comes from official reports or audits, but may be compiled from multiple sources or have minor gaps.

**Examples**:
- ✅ Infrastructure audit scores (inspector's assessment)
- ✅ Safety compliance reports (annual audit report)
- ✅ Teacher training records (from principal's compiled data)
- ✅ Alumni placement data (collected post-graduation)
- ✅ Parental satisfaction surveys (survey responses)
- ✅ Committee meeting records (documented minutes)

**How it appears in reports**:
```
Infrastructure Condition Score: 82/100 [Tier 2 - Secondary]
⭐⭐ Medium confidence
```

**When to use these findings**:
- Use for detailed analysis and improvement plans
- Validate with Tier 1 data when possible
- Share with leadership but explain source
- Use for comparison over time (trend analysis)

---

### Tier 3: Tertiary / Lower Confidence (75%)

**Meaning**: Data is estimated, derived from limited samples, or based on partial information. Still useful but should be verified.

**Examples**:
- ⚠️ Estimated student-teacher interaction time (based on class size)
- ⚠️ Estimated co-curricular hours (based on time-table)
- ⚠️ Parent engagement estimates (based on limited sample)
- ⚠️ Industry benchmark comparisons (regional estimates)
- ⚠️ Peer school data (not verified directly)
- ⚠️ Historical trend projections (extrapolated data)

**How it appears in reports**:
```
Estimated Co-curricular Hours: 10 hrs/month [Tier 3 - Tertiary]
⭐ Lower confidence (Estimated)
```

**When to use these findings**:
- Use for directional insights only
- Verify with actual data before acting
- Use for long-term trends, not immediate decisions
- Good for identifying areas needing deeper investigation

---

## Real-World Example: Understanding Tiers

### School X Parental Satisfaction Analysis

| Data Point | Tier | Value | How It's Used |
|-----------|------|-------|---------------|
| Parents surveyed (Multi-stakeholder assessment) | Tier 1 | 150 parents | Primary evidence for satisfaction level |
| Survey satisfaction score | Tier 1 | 3.8/5 | Direct, measured satisfaction |
| % attending parent meetings | Tier 2 | 42% | From attendance records (official but compiled) |
| Estimated parent involvement hours | Tier 3 | 8 hrs/month | Based on meeting frequency estimate |
| Parent feedback on communication | Tier 1 | Positive | From survey responses |
| Estimated potential participants | Tier 3 | 500 parents | Estimate based on total enrollment |

**How to interpret this**:
- **High confidence** (Tier 1): We know satisfaction is 3.8/5 from direct survey
- **Medium confidence** (Tier 2): We have actual meeting attendance at 42%
- **Lower confidence** (Tier 3): Exact involvement hours are estimated

**Action**: Use Tier 1 data to make decisions, verify Tier 2 & 3 before acting.

---

## Tier System in DISHA Reports

### How It Appears in Your Report

#### CSV/Excel Export
Column: "Validation Tier"
```
Metric Name | Value | Benchmark | Gap | Tier | Confidence
Academic Reputation | 82 | 85 | -3 | 1 | High
Infrastructure | 82 | 85 | -3 | 2 | Medium
Co-curricular Hours | 10 | 10 | 0 | 3 | Lower (Est.)
```

#### Visual Report (PDF)
```
📊 DISHA Diagnostic Report

Academic Excellence Dimension Score: 78/100
├─ Board Exam Pass Rate: 82% ⭐⭐⭐ [Tier 1]
├─ Faculty Qualification: 85% ⭐⭐ [Tier 2]
└─ Curriculum Completion: 92% ⭐ [Tier 3 - Estimated]
```

#### Dashboard Display
Each metric badge shows:
- Metric name and value
- Tier indicator (colors: 🟢 Tier 1, 🟡 Tier 2, 🔴 Tier 3)
- Confidence percentage
- Hover tooltip: Explains data source

---

## Why Tiers Matter

### For School Leaders
- **Prioritize improvements** based on solid evidence (Tier 1)
- **Verify estimated data** before acting (Tier 3)
- **Build credibility** by being transparent about sources

### For Government/External Auditors
- **Distinguish** hard facts from estimates
- **Ask for verification** of Tier 3 data if decisions are based on it
- **Understand** data reliability

### For Report Sharing
- **Explain transparently** to parents why some findings are based on estimates
- **Show accountability** by clearly sourcing all claims
- **Justify decisions** with high-confidence data

---

## How Data Gets Tiered

### Automatic Tiering

The DISHA system automatically assigns tiers based on:

```typescript
function assignValidationTier(dataSource: string): Tier {
  // Tier 1: Direct system export
  if (dataSource === 'ERP_Direct' || dataSource === 'Official_Record')
    return 'Tier1';
  
  // Tier 2: Official compilation
  if (dataSource === 'Audit_Report' || dataSource === 'Admin_Record')
    return 'Tier2';
  
  // Tier 3: Estimate or indirect
  if (dataSource === 'Estimate' || dataSource === 'Survey_Sample')
    return 'Tier3';
}
```

### Manual Tiering

When importing data, you can specify:
- **Data Source**: Where is this from? (ERP, audit, estimate, etc.)
- **Confidence**: How confident are you? (%)
- **Last Updated**: When was this collected?
- **Notes**: Any caveats about this data?

---

## Common Questions About Tiers

### Q: Does Tier 3 mean the data is wrong?
**A**: No. Tier 3 means it's estimated or based on samples. It could be accurate, but should be verified. Example: Estimated co-curricular hours could be exactly right, but you should count actual hours to confirm.

### Q: Should I ignore Tier 3 data?
**A**: No, use it for directional insights and trend analysis. Just don't base major decisions solely on Tier 3 data. Example: Estimate shows low engagement - investigate further with surveys and meetings.

### Q: Can data move between tiers?
**A**: Yes! When you gather more direct evidence, Tier 3 data can become Tier 1. Example:
- Initial: "Estimated student-teacher ratio" (Tier 3)
- After: "Actual ratio from enrollment system" (Tier 1)

### Q: What if my school system gives conflicting data?
**A**: Use the Tier 1 source (most direct) as primary. Investigate why other sources differ:
- ERP says 85% pass rate (Tier 1)
- Board report says 82% (Tier 1 - but different count method)
- Result: Investigate count difference, align definitions

### Q: Can I change how tiers are assigned?
**A**: No, the tier assignment is standardized across all DISHA schools for consistency. But you can add notes explaining context.

---

## Examples by Category

### Academic Excellence Category

| Data | Source | Tier | Why |
|------|--------|------|-----|
| Board exam pass rate | Board records export | 1 | Direct official records |
| Average marks | ERP student records | 1 | Direct data entry |
| Teacher qualifications | HR records | 1 | Official employment records |
| Curriculum completion % | Teacher uploaded plans | 2 | Compiled from individual records |
| Estimated teaching hours | Calculated from time-table | 3 | Derived, not measured |

### Welfare Category

| Data | Source | Tier | Why |
|------|--------|------|-----|
| Teacher salary data | Payroll system export | 1 | Direct financial records |
| Audit compliance score | Annual safety audit | 2 | Official audit report |
| Estimated facility utilization | Survey-based estimate | 3 | Based on sample observations |
| Medical checkup record | School health records | 1 | Official medical logs |

---

## How to Read Your Report

### Low-Confidence Data Warning
```
⚠️ Note: Some metrics in this report are based on estimates or 
limited data samples (Tier 3). These are marked with 🟡 and should 
be verified with actual counts before using for major decisions.

To improve data confidence:
1. Export data directly from your ERP
2. Conduct formal audits for facilities
3. Collect baseline measurements
```

### High-Confidence Finding
```
✅ Finding: Board exam performance (82% pass rate) is based on 
direct government records (Tier 1). This is reliable data for 
benchmarking and strategic planning.
```

---

## Implementation Guide for Developers

### Assigning Tiers When Generating Insights

```typescript
interface DataPoint {
  metric: string;
  value: number;
  source: DataSource;
  validationTier: 'tier1' | 'tier2' | 'tier3';
  confidence: number; // 75-95%
  lastUpdated: Date;
}

// When creating insights:
const insight = {
  metric: 'Board Exam Pass Rate',
  value: 82,
  benchmark: 85,
  source: 'ERP Direct Export',
  validationTier: 'tier1', // Assign based on source
  confidence: 95,
  recommendation: '...'
};
```

### Display Rules

```typescript
function getTierBadgeColor(tier: Tier): string {
  switch(tier) {
    case 'tier1': return '🟢 Green' // High confidence
    case 'tier2': return '🟡 Yellow' // Medium confidence
    case 'tier3': return '🔴 Red' // Lower confidence (estimate)
  }
}

function getTierHoverText(tier: Tier): string {
  switch(tier) {
    case 'tier1': return 'Tier 1: Primary source (95% confidence)'
    case 'tier2': return 'Tier 2: Secondary source (85% confidence)'
    case 'tier3': return 'Tier 3: Tertiary/Estimate (75% confidence)'
  }
}
```

---

## Summary

| Tier | Confidence | Examples | Use For | Caution |
|------|-----------|----------|---------|---------|
| **Tier 1** | 95%+ | ERP exports, Board records | Primary decisions | None - trust it |
| **Tier 2** | 85% | Audit reports, compiled data | Detailed analysis | Verify with Tier 1 |
| **Tier 3** | 75% | Estimates, samples | Trends, investigation | Verify before acting |

---

**Document Version**: 1.0  
**Effective Date**: August 9, 2026  
**Audience**: School Leaders, Data Analysts, System Administrators

---

## Quick Reference Card

### Print This & Keep It Handy

```
┌─────────────────────────────────────────────┐
│     DISHA VALIDATION TIER QUICK GUIDE       │
├─────────────────────────────────────────────┤
│                                             │
│  ⭐⭐⭐ TIER 1: Direct System Data           │
│  → ERP exports, official records            │
│  → Confidence: 95%+                         │
│  → Use for: Major decisions ✓               │
│                                             │
│  ⭐⭐ TIER 2: Official Reports              │
│  → Audits, compiled admin records           │
│  → Confidence: 85%                          │
│  → Use for: Analysis (verify if acting)    │
│                                             │
│  ⭐ TIER 3: Estimates & Samples             │
│  → Calculations, limited data               │
│  → Confidence: 75%                          │
│  → Use for: Trends (verify before acting)   │
│                                             │
└─────────────────────────────────────────────┘
```

For detailed explanations of any metric's tier, refer to:
- `OBJECTIVE_METRICS_MAPPING.md` - By dimension
- CSV report "Validation Tier" column - By metric
