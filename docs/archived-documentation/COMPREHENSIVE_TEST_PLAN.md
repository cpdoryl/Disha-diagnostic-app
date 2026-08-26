# First Opinion Engine - Comprehensive Test Plan

## Test Objectives

✅ Verify real-time data analysis (scores change with different data)  
✅ Ensure proper data interpretation (insights match uploaded metrics)  
✅ Validate quality language (professional, school-owner friendly)  
✅ Test all DISHA 3-layer methodology (Leadership Perception, Operational Reality, Health Index)  
✅ Verify actionable recommendations (specific, not generic)  
✅ Check completeness of analysis (all aspects covered)

---

## Test Scenarios

### Scenario 1: Enrollment Decline Challenge
**File:** `test_data_scenario1_enrollment.csv`

**Data Profile:**
- Total Students: 850 (DOWN from healthy 1200)
- Enrollment Rate: -12% (Critical)
- Retention: 76% (Below 85% target)
- Reputation: 6.2/10 (Declining)

**Expected Behavior:**
- Layer 1: Should show leadership concern (lower S_sub)
- Layer 2: Should show operational gaps in recruitment
- Layer 3: Should flag enrollment as critical risk area
- Language: Should identify root causes (reputation, quality gaps)
- Recommendation: Should address reputation and academic quality first

**What to Verify:**
- [ ] Scores reflect enrollment crisis
- [ ] Insights mention student retention specifically
- [ ] Recommendations address root causes (not generic advice)
- [ ] Language is professional and specific

---

### Scenario 2: Staff Turnover Crisis
**File:** `test_data_scenario2_staff.csv`

**Data Profile:**
- Teacher Turnover: 28% (CRITICAL - over 2x target)
- Burnout Score: 75/100 (HIGH)
- Training Hours: 12 (BELOW 25 target)
- Tenure: 4.2 years (unstable workforce)
- Satisfaction: 5.1/10 (poor)

**Expected Behavior:**
- Layer 1: Should show leadership awareness of stress
- Layer 2: Should flag operational weakness in HR/culture
- Layer 3: Should rate as concerning/at-risk
- Language: Should diagnose burnout, poor compensation, lack of development
- Recommendation: Should focus on retention, compensation, professional development

**What to Verify:**
- [ ] System recognizes staff crisis signals
- [ ] Burnout + turnover correlation identified
- [ ] Recommendations address root causes (compensation, workload, development)
- [ ] Language is empathetic but actionable

---

### Scenario 3: Excellence Profile (Best Case)
**File:** `test_data_scenario3_excellent.csv`

**Data Profile:**
- All metrics ABOVE benchmarks
- Enrollment: Stable with excellent metrics
- Staff: Highly satisfied, low turnover
- Academic: Excellent pass rates
- Reputation: 8.7/10 (Strong)

**Expected Behavior:**
- Layer 1: Should show strong leadership confidence
- Layer 2: Should show operational excellence
- Layer 3: Should rate as EXCELLENT (70+)
- Language: Should celebrate achievements
- Recommendation: Should focus on innovation, sustainability, competitive advantage

**What to Verify:**
- [ ] System recognizes and celebrates excellence
- [ ] Doesn't show false warnings for strong schools
- [ ] Recommendations suggest growth, not remediation
- [ ] Language is encouraging and positive

---

### Scenario 4: Mixed Profile (Realistic)
**File:** `test_data_scenario4_mixed.csv`

**Data Profile:**
- Some areas strong (academics: 85%)
- Some areas weak (communication: 48h SLA, low satisfaction)
- Middle-ground performance overall
- Specific gaps in digital infrastructure, parent engagement

**Expected Behavior:**
- Layer 1: Should show realistic assessment (moderate concern)
- Layer 2: Should identify specific operational gaps
- Layer 3: Should rate as "manageable with targeted action"
- Language: Should prioritize which gaps to fix first
- Recommendation: Should provide sequenced action plan

**What to Verify:**
- [ ] System balances strengths and weaknesses
- [ ] Prioritization is logical (parent engagement affects enrollment)
- [ ] Recommendations are sequenced (quick wins first)
- [ ] Language is balanced and realistic

---

## Real-Time Analysis Tests

### Test A: Change One Metric
**Procedure:**
1. Upload Scenario 1 data (enrollment decline)
2. Check Layer 2 score
3. Modify SLA from 36h to 12h (simulating improved response)
4. Re-upload with modification
5. Check if Layer 2 changes

**Expected:** Layer 2 should INCREASE (better operational metric)

### Test B: Change All Metrics
**Procedure:**
1. Upload Scenario 2 (staff crisis)
2. Record all three layers
3. Upload Scenario 3 (excellent)
4. Record all three layers
5. Compare

**Expected:** All layers should show dramatic improvement

### Test C: Same Answers, Different Data
**Procedure:**
1. Answer screening questions same way for both scenarios
2. Layer 1 should be identical
3. Layer 2 & 3 should differ significantly

**Expected:** Shows that Layer 2 responds to data, Layer 1 to answers

---

## Language Quality Tests

### Test for Generic Language ❌
**Look for and REJECT:**
- "This school has some challenges"
- "Teachers need training"
- "Improve student engagement"
- "Focus on quality"
- "Better communication with parents"

### Test for Specific Language ✅
**Look for and ACCEPT:**
- "Enrollment down 12% YoY; retention at 76% vs 85% target; reputation at 6.2 vs 7.5 average"
- "Teachers working 22% overtime due to insufficient planning time (4h vs 5h target)"
- "28% annual teacher turnover (2.3x the 12% benchmark) indicates systemic retention crisis"
- "Parent response SLA at 48 hours vs 24-hour target; likely impacting satisfaction (NPS: 32)"

---

## Data Interpretation Tests

### Test D1: Correlation Recognition
**Check if system understands:**
- ✅ Low training → Low exam performance
- ✅ High turnover → Low retention → Enrollment decline
- ✅ Slow parent response → Low satisfaction → Low retention
- ✅ High burnout → High turnover

### Test D2: Root Cause Identification
**Check if recommendations go beyond symptoms:**

❌ Bad: "Improve student performance"  
✅ Good: "Current 78% pass rate vs 85% target suggests 2 root causes:
1. Insufficient teacher planning time (3h vs 5h target) → Limited lesson prep
2. Below-benchmark training (15h vs 25h) → Teaching methodology gaps
Recommendation: Allocate 1 hour/week per teacher for planning + quarterly pedagogy workshops"

### Test D3: School Context
**Check if language acknowledges:**
- Budget constraints (if reputation/compensation issues)
- Market competition (if enrollment declining)
- Infrastructure limitations (if digital metrics low)
- Community factors (if attendance/satisfaction low)

---

## Professional Language Standards

### For School Owners (Non-Technical)

✅ **DO:**
- Use percentages and comparisons to benchmarks
- Explain what numbers mean in school context
- Show "your school vs average school"
- Provide actionable steps
- Acknowledge both strengths and weaknesses
- Use encouraging but realistic tone

❌ **DON'T:**
- Use jargon (S_sub, M_obj, etc. - keep hidden)
- Use generic templates
- Provide vague advice
- Ignore what's working well
- Use alarmist language
- Make recommendations without evidence

### Example - Good Result Explanation

**For Enrollment Decline:**

"Your school's enrollment declined 12% this year, dropping from 1,200 to 850 students. This is below our 8% growth benchmark.

**Root Causes Identified:**

1. **Reputation Gap** (6.2/10 vs 7.5 average)
   - Community perception of your school is 13% below peers
   - Parents cite quality concerns and limited resources

2. **Retention Crisis** (76% vs 85% target)
   - 1 in 4 students leaving mid-year or not returning
   - Primarily due to: academic performance (78% pass rate vs 85% target)

3. **Slow Response to Parents** (48h vs 24h target)
   - Parent concerns not addressed quickly enough
   - Erodes trust and accelerates transfer to competitors

**Recommended Priority Actions:**

*Year 1 Focus:* Improve academic performance + parent communication
- Allocate 1 hour/week per teacher for lesson planning (currently only 3 hours)
- Launch teacher training program (20h/year → 28h/year)
- Implement same-day parent query response system

*Expected Impact:* Board pass rate should improve to 85%+, retention to 82%+, enrollment stabilization"

---

## Test Execution Checklist

### Before Testing
- [ ] Dev server running on localhost:3000
- [ ] Browser console open (F12)
- [ ] Clear browser cache
- [ ] Have all 4 test CSV files ready

### During Each Test
- [ ] Upload test data file
- [ ] Verify file validation passes (shows metrics found)
- [ ] Answer screening questions (vary answers between tests)
- [ ] Click "Generate First Opinion"
- [ ] Check console logs for Layer 1, 2, 3 values
- [ ] Read full diagnosis and recommendations
- [ ] Take screenshot of results

### After Each Test
- [ ] Verify scores changed from defaults (Layer 2 ≠ 0.71)
- [ ] Check if language is specific to scenario (not generic)
- [ ] Confirm recommendations match data findings
- [ ] Note any generic language that needs fixing
- [ ] Document actual vs expected scores

---

## Success Criteria

### For Real-Time Analysis ✅
- [ ] Layer 2 changes when operational metrics change
- [ ] Layer 3 changes when Layer 1 or Layer 2 change
- [ ] Scores differ between all 4 scenarios
- [ ] No scores show "default" values (0.71, 50, etc.) after file upload

### For Data Interpretation ✅
- [ ] Insights mention specific metric values (not generic "challenges")
- [ ] Recommendations reference actual data from uploaded file
- [ ] Root causes identified (not just symptoms listed)
- [ ] Correlations shown (e.g., turnover → retention decline)

### For Professional Language ✅
- [ ] No generic templates used
- [ ] Benchmarks referenced with percentages
- [ ] Comparisons shown ("your school vs average")
- [ ] Actionable steps provided
- [ ] School owner can understand without education background
- [ ] Results feel specific to their situation, not generic

### For Complete Analysis ✅
- [ ] All 3 DISHA layers clearly explained
- [ ] Scoring methodology transparent
- [ ] Risk classification clear (GREEN/ORANGE/YELLOW/RED)
- [ ] Both strengths and weaknesses acknowledged
- [ ] Next steps explicitly stated

---

## Known Issues to Watch For

❌ **Layer 2 still showing 0.71x after file upload**
- Indicates file metrics not being used
- Check console: "RAW EXTRACTED METRICS" should show uploaded values

❌ **Generic language like "improve quality"**
- Should be: "Improve exam pass rate from 78% to 85%"
- Indicates diagnosis engine needs refinement

❌ **Recommendations don't match data**
- Example: Recommending "hire more teachers" when turnover is the issue
- Should focus on retention, compensation, culture

❌ **All scenarios show similar results**
- Indicates system using defaults
- Check if challenges selected properly

---

## Test Data Files Created

1. **test_data_scenario1_enrollment.csv** - Enrollment decline crisis
2. **test_data_scenario2_staff.csv** - Staff turnover & burnout crisis  
3. **test_data_scenario3_excellent.csv** - Excellent performance profile
4. **test_data_scenario4_mixed.csv** - Realistic mixed performance

All files are in project root and ready to use.

---

## Expected Outcomes

After passing all tests, the First Opinion engine will:

✅ Provide real-time analysis that changes with uploaded data  
✅ Interpret data accurately in school context  
✅ Use professional, non-generic language  
✅ Provide actionable, evidence-based recommendations  
✅ Help school owners understand their situation clearly  
✅ Guide decision-making with specific data insights

---

**Test Status:** Ready to execute  
**Estimated Time:** 30-45 minutes  
**Tester:** Manual browser-based testing
