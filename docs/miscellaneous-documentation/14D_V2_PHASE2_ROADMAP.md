# 14-Dimension Diagnostic Framework v2 — Phase 2 Roadmap

**Date:** August 25, 2026  
**Status:** PHASE 2 FOUNDATION COMPLETE → COMPONENT BUILD STARTING  
**Timeline:** 3-4 Days  
**Authority:** CPDO Charter + 14D_V2_PHASE1_COMPLETE.md

---

## ✅ Phase 2 Foundation Complete

### What Was Built This Session:
1. **Assessment Wizard State Management** (assessmentWizardState.ts)
   - 16-step wizard navigation (0=stakeholder, 1-14=dimensions, 15=review)
   - Zustand store with full state tracking
   - Response collection with real-time progress
   - Auto-save status management
   - Draft tracking and recovery
   - Memoized selectors for component consumption

2. **Response Service Layer** (responseService14D.ts)
   - Save single/batch responses to Firestore
   - Load draft responses for resume functionality
   - Submit assessment and update response counts
   - Real-time progress listener (onSnapshot)
   - Response statistics and aggregation
   - Built-in validation framework
   - Anonymous response tracking via sessionId

### Code Statistics:
- **assessmentWizardState.ts:** 348 lines (Zustand store + selectors)
- **responseService14D.ts:** 356 lines (Firestore service layer)
- **Total new Phase 2 code:** 704 lines

### ✅ Build Status: PASSED
- TypeScript compiles without errors
- Both files integrated into main branch
- Ready for React component consumption

---

## 🔲 Phase 2 Component Build (Next)

### Component Architecture

```
src/components/Assessment14D/
├── AssessmentWizard.tsx          [MAIN ORCHESTRATOR]
│   ├── StakeholderSelector.tsx   [STEP 0: Stakeholder selection]
│   ├── DimensionStep.tsx         [STEPS 1-14: Dimension progression]
│   │   ├── MetricCard.tsx        [Reality question display]
│   │   ├── PerceptionScale.tsx   [1-10 slider rating]
│   │   ├── RootCauseInput.tsx    [Follow-up text input]
│   │   └── ValidationFeedback.tsx [Error display]
│   ├── ReviewSubmit.tsx          [STEP 15: Progress tracking + submit]
│   └── WizardHeader.tsx          [Progress bar + step counter]
```

### Component Specifications

#### 1. **AssessmentWizard.tsx** (Main Orchestrator)
**Purpose:** Coordinate all steps, manage navigation, trigger auto-save

**Props:**
```typescript
interface AssessmentWizardProps {
  schoolId: string;
  assessmentId: string;
  onSubmitComplete?: (sessionId: string) => void;
  autoSaveIntervalMs?: number; // default 10000
}
```

**Behavior:**
- Load assessment config and cached responses on mount
- Subscribe to wizard state via `useAssessmentWizard()`
- Render current step component conditionally (0-15)
- Debounce auto-save calls to responseService
- Show loading states during Firestore operations
- Handle submission and redirect after completion
- Persist unsaved work on beforeunload

**Dependencies:**
- useAssessmentWizard (state management)
- responseService (Firestore I/O)
- useResponseValidation (validation hook)

---

#### 2. **StakeholderSelector.tsx** (Step 0)
**Purpose:** Let respondent choose their stakeholder type

**Behavior:**
- Display 5 option cards (Teacher, Parent, Student, Admin, Other)
- Optional identity fields for identified stakeholders:
  - Teachers: Email + Teacher ID (text input)
  - Parents: Email + Student/Class (text input)
  - Admin: Email + Admin ID (text input)
  - Students: Optional name (text input)
  - Other: Optional name (text input)
- Toggle "Keep me anonymous" checkbox (default: true)
- Validate required fields before next button enabled
- Store stakeholder choice via `setStakeholder()`
- Auto-focus first input

**Validation Rules:**
- Stakeholder type is required
- If anonymous=false and stakeholder type requires ID:
  - Email format is validated
  - ID/Name field is required

**Component Tree:**
```
StakeholderSelector
├── StakeholderCard (×5) [reusable]
│   ├── Icon
│   ├── Label + Description
│   └── Checkbox (selected state)
├── IdentityForm (conditional, per stakeholder)
│   ├── TextInput (email)
│   ├── TextInput (ID/Name)
│   └── Checkbox (anonymous)
└── NavigationButtons
    ├── Cancel
    └── Next (conditionally enabled)
```

---

#### 3. **DimensionStep.tsx** (Steps 1-14)
**Purpose:** Collect metric responses for a single dimension

**Props:**
```typescript
interface DimensionStepProps {
  dimensionId: number; // 1-14
}
```

**Behavior:**
- Load dimension metadata via `getDimensionById()`
- Display dimension title + description
- Iterate through metrics for this dimension:
  - Show MetricCard (reality metric question)
  - Show PerceptionScale (1-10 rating)
  - Show RootCauseInput (open-text follow-up)
  - Show ValidationFeedback (if validation error)
- Track completion at dimension level
- Trigger auto-save after each response
- Show progress bar: X of Y metrics complete
- Next button disabled until all metrics answered
- Previous button enabled (go back to prior dimension)

**Data Flow:**
1. User answers reality metric → `setMetricResponse(..., 'reality')`
2. User rates perception 1-10 → `setMetricResponse(..., 'perception')`
3. User provides root cause text → `setFollowUpResponse()`
4. Component calls `markDimensionComplete(dimensionId)`
5. ResponseService auto-saves via debounced batch write

**Component Tree:**
```
DimensionStep
├── DimensionHeader
│   ├── Dimension Title
│   ├── Description
│   └── Progress (X of Y metrics)
├── MetricCard (×N per dimension)
│   ├── Metric Question
│   ├── Help Text
│   └── [Response collected]
├── PerceptionScale
│   ├── 1-10 Slider
│   ├── Label (Poor → Excellent)
│   └── [Response collected]
├── RootCauseInput
│   ├── Prompt: "Why did you rate..."
│   ├── TextArea
│   └── Character Count
├── ValidationFeedback (conditional)
└── NavigationButtons
    ├── Back
    └── Next (conditionally enabled)
```

---

#### 4. **MetricCard.tsx** (Reality Metric Display)
**Purpose:** Display a single reality metric question

**Props:**
```typescript
interface MetricCardProps {
  metric: Metric; // from dimensionMetadata
  dimensionId: number;
  stakeholderType: StakeholderType;
  value?: number | string; // current response
  onChange: (value: number | string) => void;
  error?: string;
}
```

**Behavior:**
- Display metric label (e.g., "1a: Board Pass %")
- Display question text (what data source)
- Display help text (formula, data source, fallback)
- Conditionally render input based on metric type:
  - Percentage → number input (0-100)
  - Count → number input
  - Ratio → number input
  - Text → text input
  - Enum → select dropdown
- Show validation error if provided
- Trigger onChange on value change

**Styling:**
- Card container with subtle border
- Left accent bar (dimension color)
- Hover effect on focus
- Error state: red border + red error text

---

#### 5. **PerceptionScale.tsx** (1-10 Rating)
**Purpose:** Collect perception score as 1-10 slider

**Props:**
```typescript
interface PerceptionScaleProps {
  metric: Metric;
  value?: number; // 1-10
  onChange: (value: number) => void;
  disabled?: boolean;
}
```

**Behavior:**
- Horizontal slider 1-10
- Large visible number display (centered, 2em)
- Labels at ends: "Poor (1)" → "Excellent (10)"
- Interactive: hovering shows tooltip with label
- Tracks onChange in real-time
- Accessible via keyboard (arrow keys)
- Visual feedback: slider thumb changes color based on value

**Labels by Range:**
- 1-2: Poor
- 3-4: Below Average
- 5-6: Average
- 7-8: Good
- 9-10: Excellent

---

#### 6. **RootCauseInput.tsx** (Follow-up Text)
**Purpose:** Collect open-text explanation for perception rating

**Props:**
```typescript
interface RootCauseInputProps {
  metric: Metric;
  perceptionValue: number;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

**Behavior:**
- TextArea with auto-expanding height
- Prompt: "Why did you rate [metric name] as [perception value]?"
- Character counter (0/500 max)
- Placeholder text: "Please explain your reasoning..."
- Optional (not validated for submit)
- Trigger onChange on text change
- Auto-save to draft on blur

**Styling:**
- TextArea with light border
- Focus state: blue border + shadow
- Character counter: gray, smaller type
- At 80% capacity: yellow warning
- At 100% capacity: red warning, cannot add more

---

#### 7. **ReviewSubmit.tsx** (Step 15)
**Purpose:** Final review and submission

**Behavior:**
- Display progress summary:
  - Total responses collected: X of 28 (14 dims × 2 per dim)
  - Completion percentage
  - Completed dimensions checklist
- Display stakeholder info (read-only):
  - Stakeholder type + respondent name/email (if provided)
  - Anonymous status
- Offer options:
  - **Review Responses** (button) → collapsible section showing all responses
  - **Save & Exit** (button) → save draft to Firestore, no submission
  - **Submit & Complete** (button) → final confirmation → submit → show success page
- Show loading state during submission
- Disable next/prev buttons during submission
- After success: show confirmation + offer return to home or new assessment

**Component Tree:**
```
ReviewSubmit
├── ProgressSummary
│   ├── Overall % Complete
│   ├── Response Count (X/28)
│   └── Dimension Checklist (14 items)
├── RespondentInfo (read-only)
│   ├── Stakeholder Type
│   ├── Name/Email/ID (if provided)
│   └── Anonymous Badge
├── ActionButtons
│   ├── Save & Exit
│   ├── Review Details (collapsible)
│   └── Submit & Complete (primary, disabled if incomplete)
├── SubmissionConfirm (conditional modal)
│   ├── "Are you sure?"
│   ├── "You can save & exit to finish later"
│   └── Cancel / Confirm buttons
└── SuccessPage (conditional, after submit)
    ├── Checkmark icon
    ├── "Assessment Submitted"
    ├── "Thank you for your response"
    └── Home link
```

---

#### 8. **Supporting Hooks**

**useResponseValidation.ts**
```typescript
function useResponseValidation() {
  return {
    validateResponse(response: MetricResponse): ValidationResult
    validateDimensionComplete(dimensionId: number): boolean
    validateAllComplete(): boolean
    getErrorMessage(error: ValidationError): string
  }
}
```

**useDimensionWizard.ts** (if component-level state needed)
```typescript
function useDimensionWizard(dimensionId: number) {
  const state = useAssessmentWizard();
  return {
    metrics: getDimensionMetrics(dimensionId),
    responses: state.responses.entries().filter(...),
    setMetricResponse: (metricId, value, followUp) => {...},
    isComplete: state.completedDimensions.has(dimensionId),
    markComplete: () => state.markDimensionComplete(dimensionId)
  }
}
```

---

## Build Sequence (Optimal Order)

### Day 1: Core Setup
- [ ] Create component directory: `src/components/Assessment14D/`
- [ ] Create `AssessmentWizard.tsx` (layout only, no logic)
- [ ] Create `WizardHeader.tsx` (progress bar + step counter)
- [ ] Create `StakeholderSelector.tsx` + test selection flow
- [ ] Verify TypeScript compiles

### Day 2: Metric Collection
- [ ] Create `MetricCard.tsx` (display + input)
- [ ] Create `PerceptionScale.tsx` (slider component)
- [ ] Create `RootCauseInput.tsx` (textarea)
- [ ] Create `DimensionStep.tsx` (orchestrates 1-3 above)
- [ ] Integrate with `responseService14D.ts` (save responses)
- [ ] Test single dimension flow

### Day 3: Review & Submission
- [ ] Create `ReviewSubmit.tsx` (progress + submit)
- [ ] Add submission flow to `responseService14D.ts`
- [ ] Create `AssessmentWizard.tsx` full logic (step routing, auto-save)
- [ ] Integrate all components into main wizard
- [ ] End-to-end test: stakeholder → dimension → review → submit

### Day 4: Polish & Integration
- [ ] Add error handling and retry logic
- [ ] Add loading states and skeletons
- [ ] Add keyboard navigation (Tab, Enter, Escape)
- [ ] Add accessibility labels (aria-label, aria-describedby)
- [ ] Test with real Firestore (not just emulator)
- [ ] Commit Phase 2 components to main

---

## Data Flow Diagram

```
User Input
    ↓
Component (MetricCard / PerceptionScale / RootCauseInput)
    ↓
useAssessmentWizard (state update)
    ↓
AssessmentWizard detects isDirty flag
    ↓
Debounce auto-save timer (10s idle)
    ↓
responseService.batchSaveResponses()
    ↓
Firestore write (schools/{id}/assessments14D/{id}/responses)
    ↓
setAutoSaveStatus('saved')
    ↓
Display "Saved" toast
```

---

## Success Criteria (Phase 2 Completion)

- [ ] All 16 step components render without errors
- [ ] Stakeholder selection works (all 5 types routable)
- [ ] Single dimension step collects all metrics + perception + follow-up
- [ ] Responses save to Firestore in real-time (auto-save)
- [ ] Draft recovery works (reload page → responses still there)
- [ ] Final submission updates cycle doc and shows success
- [ ] Progress bar updates as respondent moves through steps
- [ ] Validation prevents submission if incomplete
- [ ] Mobile-responsive layout (phone → tablet → desktop)
- [ ] Accessibility: keyboard navigation + screen readers supported
- [ ] TypeScript: zero `any` types

---

## Integration with Existing Code

### Connects To:
- **useAssessmentWizard** (state management) — already built
- **responseService14D** (Firestore operations) — already built
- **dimensionMetadata** (metric definitions) — already built from Phase 1
- **types14D** (TypeScript interfaces) — already built from Phase 1

### Does NOT Depend On:
- Cloud Functions (comes Phase 3)
- Dashboards (comes Phase 4)
- PDF export (comes Phase 4)
- Dimensions 5-14 content (can test with 1-4 for now)

### Firestore Collections Used:
- `schools/{schoolId}/assessments14D/{assessmentId}/responses/`
- Reads from assessment doc for config and expected respondent count
- Updates assessment doc with response counts

---

## Next Action: Component Build

**Start with:** `StakeholderSelector.tsx` (simplest, no dependencies)

**Estimated time to first working end-to-end flow:** 3-4 days

**Milestone:** Submit a complete response flow to Firestore and see it reflect in dashboard (Phase 3)

---

**Authority:** CPDO Charter  
**Previous Phase:** ✅ PHASE 1 (Types + Calculations + State)  
**Current Phase:** 🔲 PHASE 2 (Components + Submission)  
**Next Phase:** 🔲 PHASE 3 (Cloud Functions + Analysis)

