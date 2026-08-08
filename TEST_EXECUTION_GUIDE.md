# First Opinion Engine - Test Execution Guide

## Quick Start

**Status:** ✅ Dev server running  
**URL:** http://localhost:3000  
**Test Data:** 4 scenarios ready in project root  

---

## Step-by-Step Test Guide

### SETUP (5 minutes)

#### 1. Open the Application
```
URL: http://localhost:3000
Navigate to: First Opinion → Checkup
```

#### 2. Open Browser Developer Console
```
Press: F12 (or Ctrl+Shift+I)
Go to: Console tab
Filter: Look for "Layer", "CRITICAL", "CALCULATED SCORE"
```

#### 3. Verify Dev Server Running
```
Console should show: [HMR] connected
(Hot Module Reloading = dev server ready)
```

---

## TEST 1: ENROLLMENT DECLINE (Real Crisis)

**File:** `test_data_scenario1_enrollment.csv`  
**Duration:** 5 minutes  
**Expected Result:** Enrollment crisis flagged with specific concerns

### Step 1: Upload Data
```
1. Go to Checkup page → "Upload Data" section
2. Click file upload → Select: test_data_scenario1_enrollment.csv
3. Wait for: "✅ Data VALID! All 4 metrics found" message
4. Console should show: "📊 RAW EXTRACTED METRICS: {students_per_classroom: 24, ...}"
```

**Verify in Console:**
```
✅ students_per_classroom: 24
✅ parent_query_response_sla_hours: 36
✅ annual_training_hours: 15
✅ weekly_planning_hours: 3
```

### Step 2: Select Challenge
```
1. Check: "Growth & Enrollment" section
2. Select: "Enrollment Decline" challenge
3. Verify: "Enrollment Decline - 1 challenge selected" shows
```

### Step 3: Answer Screening Questions
**Answer Pattern 1 (Leadership confident despite problems):**
```
Q1 "How do you rate your school's overall health?" → 
   Select: "Good - we acknowledge some gaps" (Weight: 6-7)

Q2 "What's your biggest concern?" → 
   Select: "Enrollment trends" (Weight: 7)

Q3 "How confident are you in current operations?" → 
   Select: "Somewhat confident" (Weight: 6)

Q4 "What's blocking growth?" → 
   Select: "Market competition" (Weight: 7)
```

### Step 4: Generate First Opinion
```
1. Click: "Generate First Opinion Diagnosis"
2. Console will show: "=== DISHA CALCULATION START ==="
3. Wait for calculation to complete
```

### Step 5: Check Console Output

**Look for this pattern:**

```
⚠️ CRITICAL: Current operationalMetrics at calculation time:
  ├─ studentTeacherRatio: 24 ✓ FROM FILE!
  ├─ parentResponseSLA: 36 ✓ FROM FILE!
  ├─ annualTrainingHours: 15 ✓ FROM FILE!
  └─ weeklyPlanningHours: 3 ✓ FROM FILE!

📊 CALCULATED SCORE:
  ├─ Layer 1 (S_sub): 33-37 (Leadership concerned, not overconfident)
  ├─ Layer 2 (M_obj): 0.45-0.55 (Weak operations - should be different from 0.71!)
  └─ Layer 3 (Health Index): 15-20 (CONCERNING - requires action)
```

**✅ PASS if:** Layer 2 shows ~0.5 (NOT 0.71)

### Step 6: Review Diagnosis Results

**Expected Quality Language:**

✅ **GOOD examples to see:**
```
"Enrollment declining 12% year-over-year with only 850 students vs 1,200 target.
This 29% shortfall is driven by:

1. Reputation deficit: Your school scores 6.2/10 vs 7.5 regional average (-17%)
2. Quality concerns: Board exam pass rate 78% vs 85% benchmark
3. Parent dissatisfaction: Response time 36 hours vs 24-hour target
4. Student retention crisis: Only 76% of students remain vs 85% target

These factors create a negative spiral: poor reputation → fewer new admissions → 
lower revenue → less investment in quality → further decline in reputation."
```

❌ **BAD examples (REJECT if you see these):**
```
"School has enrollment challenges"
"Need to improve student recruitment"
"Focus on market positioning"
"Enhance school reputation"
```

### Step 7: Check Recommendations

**Expected:**
```
PRIORITY 1: Stabilize academics (78% → 85% pass rate)
- Allocate 1 hour/week per teacher planning time (currently 3h → target 5h)
- Invest in teacher training: 15h → 25h annually
- Timeline: Next 2 terms (impact in 6 months)

PRIORITY 2: Restore parent trust (36h → 24h response)
- Implement dedicated communication channel
- Track and report response times weekly
- Timeline: Immediate (impact in 1-2 months)

PRIORITY 3: Rebuild reputation
- Showcase improved results in parent communications
- Share student success stories
- Timeline: As results improve (visible in 3-4 months)

Expected outcome: Stabilize enrollment, then grow 5-10% in Year 2
```

**✅ PASS if:**
- [ ] Recommendations are specific (not generic)
- [ ] Numbers are mentioned (hours, percentages)
- [ ] Root causes identified (not just symptoms)
- [ ] Timeline provided
- [ ] School owner can understand without education jargon

---

## TEST 2: STAFF CRISIS (Burnout & Turnover)

**File:** `test_data_scenario2_staff.csv`  
**Duration:** 5 minutes  
**Expected Result:** Staff retention crisis with burnout identified

### Quick Test (Skip file upload steps - same as Test 1)

1. **Upload file:** `test_data_scenario2_staff.csv`
2. **Select challenge:** "Staff Turnover"
3. **Answer questions differently** (show worry about staff):
```
Q1 → "Poor - many challenges" (Weight: 8)
Q2 → "Staff satisfaction & retention" (Weight: 9)
Q3 → "Not confident - losing staff" (Weight: 8)
Q4 → "Teacher burnout" (Weight: 9)
```

4. **Console check:**
```
⚠️ CRITICAL: Current operationalMetrics at calculation time:
  └─ annualTrainingHours: 12 ✓ FROM FILE!

📊 CALCULATED SCORE:
  ├─ Layer 1 (S_sub): 20-25 (Leadership very concerned - appropriate!)
  ├─ Layer 2 (M_obj): 0.35-0.42 (Operations weak - LOW score)
  └─ Layer 3 (Health Index): 7-10 (CRITICAL - immediate action needed)
```

**✅ PASS if:** Layer 2 shows 0.35-0.42 (significantly lower than 0.71)

### Expected Language Quality

**Look for SPECIFIC observations:**
```
"Teacher turnover at 28% annually (2.3x the healthy 12% benchmark) indicates 
systemic crisis, not normal attrition.

Root causes identified:

1. Burnout emergency (75/100 vs healthy <50)
   - Teachers overworked: only 2 hours/week planning vs 5-hour requirement
   - Insufficient development: 12 hours/year training vs 25 needed
   - Combined effect: Teacher exhaustion + skill gaps

2. Retention impossible
   - Average tenure only 4.2 years vs 7-year healthy level
   - Experienced teachers leaving (taking institutional knowledge)
   - Newer teachers undertrained and unsupported

3. Compensation uncompetitive
   - Salary at 35th percentile vs 50th regional average
   - Benefits/growth limited compared to competitors
   - Staff seeking better opportunities

CONSEQUENCE: Classroom instability from frequent teacher changes
- Student relationships disrupted
- Curriculum continuity broken
- Quality inconsistency"
```

### Recommendations Should Address Root Causes

**Priority 1: Immediate Relief (Next 3 months)**
- Reduce planning overload: Allocate 1 hour/week admin time per teacher
- Hire substitute/assistant teachers to reduce class size from 32 → 28
- Timeline: Implement within 2 weeks

**Priority 2: Development (Next 6 months)**
- Structured professional development: 12h → 24h annually
- Mentor program pairing experienced + new teachers
- Quarterly skill assessments with growth plans

**Priority 3: Compensation (Year 1)**
- Audit market salaries; raise to 45th-50th percentile
- Add performance bonuses tied to student outcomes
- Career progression clarity

**Monitoring:**
- Track monthly training hours, class sizes, staff satisfaction
- Monitor burnout score monthly (target: <50)
- Measure turnover: expect to drop to <15% by Year 2

---

## TEST 3: EXCELLENCE PROFILE (Best Case)

**File:** `test_data_scenario3_excellent.csv`  
**Duration:** 5 minutes  
**Expected Result:** Confidence validated, focus on innovation

### Quick Test

1. Upload: `test_data_scenario3_excellent.csv`
2. Select challenge: "Academic Performance"
3. Answer confidently:
```
Q1 → "Excellent - strong operations" (Weight: 2)
Q2 → "Innovation & growth" (Weight: 2)
Q3 → "Very confident" (Weight: 1-2)
Q4 → "Sustainability of gains" (Weight: 3)
```

4. **Console check:**
```
📊 CALCULATED SCORE:
  ├─ Layer 1 (S_sub): 78-85 (Leadership confident - justified!)
  ├─ Layer 2 (M_obj): 0.95-1.0 (EXCELLENT operations!)
  └─ Layer 3 (Health Index): 74-85 (EXCELLENT - GREEN ZONE!)
```

**✅ PASS if:** 
- Layer 2 shows 0.95-1.0
- Layer 3 shows 70+ (GREEN)
- Language celebrates achievements

### Expected Language

**Should NOT be false alarm:**
```
✅ "Your school is performing excellently across all key metrics:

STRENGTHS:
- Academic excellence: 92% board pass rate (7 points above benchmark)
- Student satisfaction: 96% attendance (1 point above target)
- Staff retention: 8% turnover (4 points below target, excellent)
- Operations: All metrics meeting or exceeding benchmarks

REPUTATION: 8.7/10 (15% above regional average)
- Strong community trust
- High demand (likely above capacity)
- Competitive advantage established"
```

**RECOMMENDATIONS should be growth-focused:**
```
OPPORTUNITY 1: Expand capacity
- Consider 2-3 additional sections based on demand
- This growth naturally increases revenue

OPPORTUNITY 2: Differentiation through innovation
- Implement STEAM programs (unique in region)
- Advanced placement courses
- International partnerships

OPPORTUNITY 3: Premium positioning
- Your metrics justify premium positioning
- Can support higher fees or exclusive programs
- Strengthen competitiveness further"
```

---

## TEST 4: MIXED PROFILE (Realistic)

**File:** `test_data_scenario4_mixed.csv`  
**Duration:** 5 minutes  
**Expected Result:** Balanced assessment with prioritized action

### Quick Test

1. Upload: `test_data_scenario4_mixed.csv`
2. Select challenge: "Financial Sustainability"
3. Answer realistically:
```
Q1 → "Moderate - some areas strong, some weak" (Weight: 5)
Q2 → "Cash flow & parent satisfaction" (Weight: 5)
Q3 → "Somewhat confident" (Weight: 5)
Q4 → "Tight finances, need growth" (Weight: 6)
```

4. **Console check:**
```
📊 CALCULATED SCORE:
  ├─ Layer 1 (S_sub): 50-55 (Realistic middle-ground concern)
  ├─ Layer 2 (M_obj): 0.60-0.70 (Fair - some gaps but stable)
  └─ Layer 3 (Health Index): 30-40 (FAIR - manageable with action)
```

**✅ PASS if:** Score shows realistic middle-ground (not extreme)

### Expected Language

**Balance strengths and weaknesses:**
```
"Your school is operating at a fair baseline - sustainable but needs targeted 
improvements in specific areas:

STRENGTHS:
- Academic performance: 85% pass rate (meets benchmark)
- Classroom efficiency: 28 students/teacher (standard)
- Staff tenure: 4-5 year average (reasonable stability)

GAPS REQUIRING ATTENTION:
- Parent response SLA: 48 hours vs 24 target (2x too slow)
  Impact: Parent satisfaction NPS 32 (27 points below target)
- Financial collection: 78% vs 90% target
  Impact: $60k annual shortfall
- Digital infrastructure: 45/100 vs 60 target
  Impact: Staff productivity, competitive positioning

CORRELATION: The 48-hour parent response delay is likely driving low satisfaction
(NPS 32), which then impacts fee collection (78%) and eventually enrollment
decisions. This is your PRIMARY leverage point."
```

**Action plan should be SEQUENCED:**
```
PHASE 1 - Quick Wins (Next 30 days): Parent communication
- Implement parent portal for tracking query status
- Assign staff for daily communication management (1 hour/day)
- Target: Reduce response to 24 hours

Expected impact: Satisfaction improves, fee collection increases to 82-85%
Revenue impact: +₹50-60k annually

PHASE 2 - Efficiency gains (Next 90 days): Fee collection
- Implement online payment system (reduce 48h response bottleneck)
- Automated reminders 3/7/14 days after due date
- Payment plans for financial hardship cases
- Expected collection: 85-88%

PHASE 3 - Infrastructure (Next 6 months): Digital foundation
- Upgrade internet bandwidth + classroom AV systems
- Staff training in technology tools
- Expected: Improve from 45 → 60/100

MONITORING:
- Week 1: Track response times daily
- Month 1: Survey parent satisfaction
- Month 3: Measure fee collection improvement
- Month 6: Assess overall financial impact"
```

---

## REAL-TIME ANALYSIS TEST

### Test Objective: Verify Layer 2 Changes with Data

**Procedure:**
1. Upload: `test_data_scenario3_excellent.csv` (all metrics strong)
2. Check console: Layer 2 should be 0.95-1.0
3. Now modify the file:
   - Change `annual_training_hours: 32` → `8`
   - Change `student_attendance_rate_pct: 96` → `75`
   - Save as: `test_modified.csv`
4. Upload modified file
5. Check console: Layer 2 should DROP to 0.60-0.70

**✅ PASS if:** Layer 2 changes significantly (from 0.95+ to 0.60-0.70)

**✅ PROOF OF:** Real-time, data-driven calculation (not cached defaults)

---

## Language Quality Checklist

### For EACH test result, verify:

#### ✅ SPECIFIC (Not Generic)
- [ ] Numbers mentioned (12%, 28 students, 24 hours, 78%)
- [ ] Your school vs benchmark comparison shown
- [ ] Actual metrics from uploaded file referenced
- [ ] Specific causes identified (not "challenges")

#### ✅ ACTIONABLE (Not Vague)
- [ ] Specific steps to take (what, how many, timeline)
- [ ] Expected impact quantified (12% → 85% by Q3)
- [ ] Who is responsible (teachers, admin, leadership)
- [ ] How to measure success (metrics to track)

#### ✅ PROFESSIONAL (For School Owners)
- [ ] No jargon (no S_sub, M_obj terminology)
- [ ] Comparisons to benchmarks (not just numbers)
- [ ] Context explained (why this matters)
- [ ] Both strengths and weaknesses acknowledged
- [ ] Recommendations logically sequenced

#### ❌ NOT Generic Templates
- [ ] No "This school faces challenges"
- [ ] No "Improve quality and student satisfaction"
- [ ] No "Better communication needed"
- [ ] No vague "focus on areas"

---

## Scoring Reference

### What You Should See

**Enrollment Decline (Test 1):**
- Layer 3: 15-25 (POOR - RED zone)
- Should mention: enrollment %, retention %, reputation, response time

**Staff Crisis (Test 2):**
- Layer 3: 7-15 (CRITICAL - RED zone)
- Should mention: turnover %, burnout, tenure, training hours

**Excellent (Test 3):**
- Layer 3: 74+ (EXCELLENT - GREEN zone)
- Should mention: strengths, competitive advantage, growth opportunities

**Mixed (Test 4):**
- Layer 3: 35-45 (FAIR - YELLOW zone)
- Should mention: balance of strengths/gaps, priorities, sequencing

### Layer 2 Expected Ranges

| Scenario | Metrics | Layer 2 | Status |
|----------|---------|---------|--------|
| Enrollment Decline | 24, 36h, 15h, 3h | 0.45-0.55 | Weak operations |
| Staff Crisis | 32, 20h, 12h, 2h | 0.35-0.42 | Very weak |
| Excellent | 22, 12h, 32h, 6h | 0.95-1.0 | Excellent |
| Mixed | 28, 48h, 18h, 4h | 0.60-0.70 | Fair |

**Critical Check:** If Layer 2 = 0.71 for ALL scenarios → File data NOT being used

---

## Troubleshooting

### Problem: Layer 2 always shows 0.71
**Diagnosis:** File metrics not being extracted  
**Check:**
```
Console should show: "📊 RAW EXTRACTED METRICS: {students_per_classroom: 24, ...}"
If showing: "{}" (empty) → File parsing failed
```
**Solution:** Verify CSV format:
```
MetricName,Value,Unit
students_per_classroom,24,students
parent_query_response_sla_hours,36,hours
```

### Problem: All scenarios show similar results
**Diagnosis:** System using default metrics  
**Check:** Console after file upload should show your values, not defaults (28, 24, 20, 4)
**Solution:** Ensure file validation says "✅ Data VALID" before proceeding

### Problem: Results look generic
**Diagnosis:** Diagnosis engine might be using templates  
**Expected:** Each scenario should mention specific values from uploaded file
**Solution:** Check if recommendations reference actual metrics or generic advice

---

## Expected Outcomes Summary

After all 4 tests:

✅ **Real-Time Analysis:** Layer 2 differs significantly across scenarios  
✅ **Data-Driven:** Console shows actual metrics being used  
✅ **Specific Language:** References uploaded file values, not generic templates  
✅ **Professional:** School owner can understand without education background  
✅ **Actionable:** Recommendations include specifics (who, what, when, impact)  
✅ **Balanced:** Acknowledges strengths AND weaknesses  
✅ **Prioritized:** Clear sequence of what to fix first  

---

**Test Duration:** 30-45 minutes  
**Files Ready:** 4 CSV scenarios in project root  
**Browser Ready:** F12 console for log verification  
**Next Step:** Follow test guide above
