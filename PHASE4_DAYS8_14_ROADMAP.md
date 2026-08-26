# Phase 4 Days 8-14: Gap Analysis & Action Plan Components

**Status:** Ready to Build
**Location:** Week 2 of Phase 4 (24-day comprehensive timeline)
**Timeline:** 7 days (Days 8-14)
**Architecture:** Component-based, Recharts + react-table

---

## Overview

Week 2 builds upon Days 1-7's foundation:
- **Days 1-4** ✅ Complete: Executive Dashboard (4 components)
- **Days 5-7** ✅ Complete: Dimension Deep-Dive (6 components)
- **Days 8-14** 🔄 In Progress: Gap Analysis & Action Plans (6 components)

This week focuses on:
1. **Gap Analysis Dashboard** - Identify and visualize perception-reality gaps
2. **Action Plan Generator** - Convert gaps into actionable recommendations
3. **Scoring & Prioritization** - Help schools focus on highest-impact areas

---

## Day 8-9: Gap Analysis Components (3 components)

### 1. **GapAnalysisDashboard.tsx** (250 LOC)
**Main wrapper for gap analysis view**
- Displays gaps grouped by severity: CRITICAL, HIGH, MEDIUM, LOW
- Cards showing top 5 critical gaps
- Dimension comparison (which dimensions have highest gaps)
- Gap trend over time (if multiple assessment cycles available)
- Drill-down capability to view per-dimension gaps
- Summary statistics: Total gaps detected, % critical, avg gap score

**Imports:**
- GapSeverityFilter (filter by severity)
- GapComparisonChart (bar chart comparing dimensions)
- GapTrendChart (line chart over time)
- TopGapsTable (sorted list of largest gaps)

**Data source:** useGapAnalysis() from Firestore

---

### 2. **GapComparisonChart.tsx** (110 LOC)
**Recharts BarChart comparing gaps across dimensions**
- X-axis: Dimension names (D1-D14)
- Y-axis: Average gap score (0-100)
- Color-coded bars by severity:
  - Red: CRITICAL gaps (≥25)
  - Orange: HIGH gaps (15-24)
  - Yellow: MEDIUM gaps (8-14)
  - Green: LOW gaps (<8)
- Tooltip shows dimension ID, name, average gap, count of gaps
- Interactive: Click dimension to drill into DimensionDeepDive
- Legend showing severity ranges

---

### 3. **TopGapsTable.tsx** (140 LOC)
**Sortable react-table showing largest perception-reality gaps**
- Columns: Dimension, Metric, Gap Score, Severity, Respondent Type, Recommendation
- Sortable by any column (default: Gap Score descending)
- Row highlighting: Red/Orange/Yellow/Green based on severity
- Inline recommendation snippets (expandable)
- Pagination support (25 rows per page, showing first 100 gaps)
- Search/filter by dimension or metric name
- Export to CSV button

---

## Day 10-11: Action Plan Components (3 components)

### 4. **ActionPlanDashboard.tsx** (280 LOC)
**Main action plan view with 30-60-90 day roadmap**
- Header with assessment info and action plan summary
- Timeline view: 30-Day, 60-Day, 90-Day columns
- Each day phase shows:
  - Assigned actions (drag/drop to reorder)
  - Responsible roles (Teacher, Admin, Parent)
  - Priority level (URGENT, HIGH, NORMAL)
  - Estimated effort (hours)
  - Dependencies on other actions
- Progress tracking: X of Y actions completed
- Milestone badges for milestones at day 30, 60, 90
- Filters: By priority, by owner, by dimension

**Imports:**
- ActionCard (individual action item)
- ActionTimeline (30-60-90 day view)
- ActionProgressTracker (completion status)
- ResourceAllocationChart (effort distribution)

**Data source:** useActionPlan() + useRecommendations()

---

### 5. **ActionCard.tsx** (90 LOC)
**Individual action item card**
- Title and description (2-3 lines)
- Severity badge (CRITICAL/HIGH/MEDIUM/LOW)
- Owner avatar + name (Teacher, Admin, etc.)
- Estimated hours (with progress indicator)
- Dependency indicator (if depends on other actions)
- Start date and due date
- Status dropdown: Not Started, In Progress, Completed, Blocked
- Click to expand full details (dialog modal)

---

### 6. **ActionTimeline.tsx** (160 LOC)
**30-60-90 day action timeline view**
- Three columns: 0-30 Days, 30-60 Days, 60-90 Days
- Vertical stacking of ActionCards within each phase
- Progress bars at column header showing % complete for phase
- Milestone markers at 30, 60, 90 day marks
- Drag-and-drop support (reorder actions between phases)
- Quick add button in each phase (+)
- Metrics: Total actions, completed, in progress, blocked

---

## Day 12-14: Comparison & Recommendations (Continuation)

These components extend existing functionality:

### 7. **ComparisonView.tsx** (200 LOC)
**Compare current assessment vs. previous assessment**
- Side-by-side comparison of scores (Reality/Perception)
- Dimension progress indicators (up/down/stable)
- Gap trend analysis (which gaps closed, which widened)
- Respondent comparison (if respondent mix changed)
- Top improvements vs. top regressions
- Export comparison report

### 8. **RecommendationEngine.tsx** (180 LOC)
**AI-powered recommendation display**
- Tier-based recommendations:
  - Tier 1: Immediate action (CRITICAL gaps)
  - Tier 2: High priority (HIGH gaps + dependencies)
  - Tier 3: Medium priority (MEDIUM gaps)
- Each recommendation includes:
  - Problem statement (gap description)
  - Root causes (perception-reality analysis)
  - Suggested actions (3-5 options)
  - Success metrics
  - Expected impact (estimated improvement)
  - Implementation timeline
- Print-friendly format (PDF export)

---

## Data Integration

### Input from Phase 3 (Cloud Functions)

```typescript
// GapAnalysisResult (from useGapAnalysis)
{
  gaps: [
    {
      dimensionId: "D1",
      dimensionName: "...",
      metricId: "M1.1",
      metricName: "...",
      gapScore: 22.5,
      gapSeverity: "HIGH",
      gapDirection: "perception_higher",
      respondentType: "Teacher",
      insight: "Teachers perceive higher quality than reality",
      rootCause: "..."
    }
  ]
}

// RecommendationResult (from useRecommendations)
{
  recommendations: [
    {
      dimensionId: "D1",
      gapId: "gap-001",
      tier: 1,
      recommendation: "Implement weekly planning process",
      rationale: "Gap analysis shows perception-reality mismatch in planning",
      actions: ["Action 1", "Action 2", ...],
      successMetrics: ["Metric 1", ...],
      timelineWeeks: 4,
      estimatedImpact: 15
    }
  ]
}
```

### Real-time Updates

- Subscribe to assessment cycles in progress
- Auto-refresh when new responses submitted
- Live gap recalculation via Cloud Function triggers
- Action plan tracking via Firestore updates

---

## Styling & Responsive Design

- **Mobile:** Stack all columns vertically, single-column layout
- **Tablet:** 2-column layout for gap analysis, simplified timeline
- **Desktop:** Full 3-column timeline, side-by-side comparisons
- **Large Desktop:** Multi-pane layout with details sidebar

**Color Palette:**
- Critical: #D32F2F (Red)
- High: #F57C00 (Orange)
- Medium: #FBC02D (Yellow)
- Low: #388E3C (Green)
- Neutral: #9CA3AF (Gray)

---

## Dependencies

### NPM Packages (Already Installed)
- recharts (charts)
- react-table (tables)
- tailwindcss (styling)
- react (core)

### Potential Additional
- react-beautiful-dnd (drag/drop - optional)
- react-dialog or radix UI (modals - optional)

---

## Testing Strategy

For each component:
1. **Unit Tests:** Vitest with mock data (samplePhase3Data.ts)
2. **Integration Tests:** Firebase Emulator with real Firestore reads
3. **Visual Tests:** Manual verification across breakpoints
4. **E2E Tests:** Full flow from assessment submission to action plan generation

---

## Completion Criteria

✅ All 6 components built and exported
✅ Zero TypeScript compilation errors
✅ All components responsive (mobile/tablet/desktop)
✅ Sample data displays correctly in all components
✅ Charts render without errors
✅ Tables sortable and interactive
✅ Real-time Firestore listeners integrated
✅ Committed to phase-4-dashboards branch
✅ Ready for Week 3 (Days 15-21): PDF Reports & Export

---

## Next: Week 3 (Days 15-21)

Week 3 will add:
- **PDF Report Generator** - Export assessment reports
- **Multi-assessment Comparison** - Compare schools or years
- **Trend Analysis** - Historical performance tracking
- **Export Formats** - CSV, Excel, PDF downloads

---

## Build Order

1. **Day 8:** GapAnalysisDashboard + GapComparisonChart
2. **Day 9:** TopGapsTable + testing
3. **Day 10:** ActionPlanDashboard + ActionCard
4. **Day 11:** ActionTimeline + integration testing
5. **Day 12-13:** ComparisonView + RecommendationEngine
6. **Day 14:** Polish, responsive refinement, commit

---

Ready to begin Days 8-14 implementation when approved.
