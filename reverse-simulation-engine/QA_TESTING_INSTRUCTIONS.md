# 🧪 QA TESTING INSTRUCTIONS - Reverse Simulation Engine

**Status:** Ready for Manual Testing  
**Start Date:** August 27, 2026  
**Target Launch:** September 10, 2026  
**Quality Gate:** Production Ready

---

## 📱 IMMEDIATE ACTIONS (Next 15 Minutes)

### Step 1: Monitor Deployment

```bash
# Check GitHub Actions build status
# Go to: https://github.com/cpdoryl/Disha-diagnostic-app/actions

# Expected:
# ✅ Latest workflow run: "feat: Integrate Reverse Simulation..."
# ✅ Status: In Progress → Success (5-10 minutes)
# ✅ All steps: Build → Deploy

# Or check via CLI:
gh run list --repo cpdoryl/Disha-diagnostic-app --limit 1

# Wait for status: COMPLETED
```

### Step 2: Test Live Site

**Open in Browser:**
```
https://disha-diagnostics.web.app/
```

**Verify:**
1. ✅ Page loads (no 404 errors)
2. ✅ Dashboard visible
3. ✅ No console errors (F12 → Console tab)
4. ✅ Styling looks correct
5. ✅ Firebase connected

### Step 3: Navigate to New Feature

**Steps:**
1. Look at left sidebar navigation
2. Find "Reverse Simulation Engine" or similar option
3. Click it
4. Verify page loads
5. Note any errors

---

## 🎯 PHASE 1: SMOKE TEST (Right Now)

### Quick Functionality Check

**Component 1: Page Loads**
- [ ] URL: https://disha-diagnostics.web.app/reverse-simulation
- [ ] Page renders without errors
- [ ] No 404 or 500 errors
- [ ] Styling displays correctly
- [ ] No console errors

**Component 2: Select School**
- [ ] Dashboard requires school selection
- [ ] Select a school from dropdown
- [ ] Verify selection works
- [ ] Page updates with school data

**Component 3: Goal Setting Wizard**
- [ ] Component renders
- [ ] All sliders visible and functional
- [ ] Can adjust current health (0-100)
- [ ] Can adjust target health (0-100)
- [ ] Timeline slider works (3-24 months)
- [ ] Budget input accepts numbers
- [ ] Priority dropdown works
- [ ] "Set Goal" button is clickable

**Component 4: Form Submission**
- [ ] Click "Set Goal & Calculate Challenge Level"
- [ ] Loading spinner appears
- [ ] API call to Cloud Function
- [ ] Success message or error message appears
- [ ] Step marked as complete (checkmark)
- [ ] Progress bar updates

**Component 5: Next Steps**
- [ ] Click shows calculation dashboard
- [ ] Data flows from Step 1
- [ ] No data loss
- [ ] Can continue to next step

---

## ✅ DETAILED TEST FLOWS

### TEST FLOW 1: Complete Goal Setting

**Time: 5 minutes**

```
1. Navigate to Reverse Simulation Engine
2. See 6-step workflow display
3. Step 1 highlighted (Goal Setting)
4. Form visible with:
   - Current Health slider
   - Target Health slider
   - Timeline slider
   - Budget input
   - Priority dropdown
   - "Set Goal" button
5. Fill in values:
   Current: 50
   Target: 85
   Timeline: 12
   Budget: 500000
   Priority: Balanced
6. Click "Set Goal & Calculate Challenge Level"
7. Wait for loading (should complete in 1-2 seconds)
8. Verify success message:
   ✓ Goal Setting Complete
   ✓ Challenge Level: XX/100
   ✓ Target Band: XXX
9. Click "Next Step" or Step 2 becomes active
10. Verify progress: 1/6 steps complete
```

**Expected Result:** ✅ PASS  
**Actual Result:** [To be filled during testing]  
**Notes:** [Any observations]

---

### TEST FLOW 2: Run Calculations

**Time: 5 minutes**

```
1. In Step 2: Calculation Dashboard
2. Select strategy: "Strategic"
3. Click "Run Calculation"
4. Wait for Cloud Function response (< 1 second)
5. Verify results display:
   - Estimated Outcome: X/100
   - ROI Estimate: X%
   - Dimension targets table
   - Budget allocation table
6. Verify data makes sense:
   - Targets > current values
   - ROI positive
   - Budget totals match input
7. Click "Next Step"
8. Verify progress: 2/6 steps complete
```

**Expected Result:** ✅ PASS  
**Actual Result:** [To be filled during testing]  
**Notes:** [Any observations]

---

### TEST FLOW 3: Feasibility Analysis

**Time: 5 minutes**

```
1. In Step 3: Feasibility Assessment
2. Click "Run Feasibility Analysis"
3. Wait for response (< 1 second)
4. Verify feasibility score (0-100) displayed
5. Verify 4-band classification:
   - Highly Feasible (90-100): Green
   - Feasible (70-89): Blue
   - Challenging (50-69): Yellow
   - High Risk (<50): Red
6. Verify risk level: Low/Medium/High/Critical
7. Verify dimension categories shown:
   - Highly Feasible dimensions
   - Feasible dimensions
   - Challenging dimensions
   - High Risk dimensions
8. Verify recommendations listed
9. Click "Next Step"
10. Verify progress: 3/6 steps complete
```

**Expected Result:** ✅ PASS  
**Actual Result:** [To be filled during testing]  
**Notes:** [Any observations]

---

### TEST FLOW 4: Action Plan Generation

**Time: 5 minutes**

```
1. In Step 4: Action Mapping
2. Click "Generate Action Plan"
3. Wait for response (< 1 second)
4. Verify total cost displays
5. Verify priority order list
6. For each dimension, verify:
   - Root cause shown
   - Interventions listed (3+ per dimension)
   - Success criteria displayed
   - KPI specified
7. Verify data is reasonable
8. Click "Next Step"
9. Verify progress: 4/6 steps complete
```

**Expected Result:** ✅ PASS  
**Actual Result:** [To be filled during testing]  
**Notes:** [Any observations]

---

### TEST FLOW 5: Resource Allocation

**Time: 5 minutes**

```
1. In Step 5: Resource Allocation View
2. Click "Run Resource Allocation"
3. Wait for response (< 1 second)
4. Verify tier breakdown:
   - Tier 1: 40% (high impact)
   - Tier 2: 35% (medium)
   - Tier 3: 15% (phased)
   - Contingency: 10% (buffer)
5. Verify total = input budget
6. Verify per-dimension allocation shown
7. Verify ROI rankings displayed
8. Click "Next Step"
9. Verify progress: 5/6 steps complete
```

**Expected Result:** ✅ PASS  
**Actual Result:** [To be filled during testing]  
**Notes:** [Any observations]

---

### TEST FLOW 6: Timeline Generation

**Time: 5 minutes**

```
1. In Step 6: Timeline Tracker
2. Click "Generate Timeline"
3. Wait for response (< 1 second)
4. Verify 3 phases shown:
   - Phase 1: Foundation (months 0-3)
   - Phase 2: Build (months 3-9)
   - Phase 3: Optimize (months 9-12)
5. Verify each phase has:
   - Deliverables list
   - KPIs
6. Verify milestones list with:
   - Month
   - Description
   - Success criteria
7. Verify risk management:
   - Risk identified
   - Probability level
   - Impact level
   - Mitigation strategy
8. Click button to mark complete
9. Verify final message displays
10. Verify all 6/6 steps complete
```

**Expected Result:** ✅ PASS  
**Actual Result:** [To be filled during testing]  
**Notes:** [Any observations]

---

## 🐛 ERROR TESTING

### Test: Invalid Input Handling

```
1. Go back to Step 1: Goal Setting
2. Try invalid inputs:
   a) Current = 80, Target = 60 (Target < Current)
      Expected: Error message "Target must be greater than current"
   b) Timeline = 2 months (< 3)
      Expected: Error message "Timeline must be 3-24 months"
   c) Budget = -100 (negative)
      Expected: Error message "Budget must be > 0"
3. Verify error messages are clear
4. Verify form doesn't submit
5. Verify can fix and retry
```

**Expected Result:** ✅ PASS (all errors handled)  
**Actual Result:** [To be filled during testing]  

---

### Test: Loading State

```
1. Click any button that calls Cloud Function
2. Verify loading spinner appears
3. Verify text changes to "Loading..."
4. Verify button disabled during load
5. Verify spinner stops when done
```

**Expected Result:** ✅ PASS  
**Actual Result:** [To be filled during testing]  

---

### Test: No School Selected

```
1. If no school selected, go to Reverse Simulation
2. Verify message appears: "Select a school first"
3. Click to select school
4. Verify page updates
5. Verify can proceed
```

**Expected Result:** ✅ PASS  
**Actual Result:** [To be filled during testing]  

---

## 📊 BROWSER TESTING

### Chrome
- [ ] Open https://disha-diagnostics.web.app/
- [ ] Go to Reverse Simulation Engine
- [ ] Run complete workflow (all 6 steps)
- [ ] Check DevTools Console for errors (F12)
- [ ] Check Network tab for failed requests
- [ ] **Expected:** No errors, all requests 200/201

### Firefox
- [ ] Open https://disha-diagnostics.web.app/
- [ ] Go to Reverse Simulation Engine
- [ ] Run complete workflow
- [ ] Check Console for errors (F12)
- [ ] **Expected:** No errors

### Safari (if available)
- [ ] Test on macOS
- [ ] Test on iPhone
- [ ] Run workflow
- [ ] **Expected:** No errors

### Edge
- [ ] Open https://disha-diagnostics.web.app/
- [ ] Go to Reverse Simulation Engine
- [ ] Run workflow
- [ ] **Expected:** No errors

---

## 📱 MOBILE TESTING

### iPhone (Safari)
```
1. Open https://disha-diagnostics.web.app/ on iPhone
2. Navigate to Reverse Simulation
3. Test on portrait mode
4. Test on landscape mode
5. Verify:
   - Page loads properly
   - Sliders work with touch
   - Buttons clickable
   - No overflow/scrolling issues
   - Text readable
```

**Expected:** ✅ PASS  
**Actual:** [To be filled]

### Android (Chrome)
```
1. Open URL on Android phone
2. Same tests as iPhone
3. Verify responsive layout
4. Check touch interactions
```

**Expected:** ✅ PASS  
**Actual:** [To be filled]

---

## ⚡ PERFORMANCE CHECKS

### Page Load Time
```
1. Open DevTools (F12)
2. Go to Performance tab
3. Reload page
4. Check:
   - First Contentful Paint: < 1.5s
   - Largest Contentful Paint: < 2.5s
   - Total Page Load: < 3s
```

**Expected:** All < target  
**Actual:** [Record times]

### Component Render Time
```
1. DevTools → Components tab
2. Click buttons to load each step
3. Check render time in DevTools
4. Expected: Each component < 200ms
```

**Expected:** < 200ms  
**Actual:** [Record times]

---

## ✅ SIGN-OFF CHECKLIST

Before marking Phase 1 complete, verify:

- [ ] Build deployed successfully
- [ ] Site loads (no 404 errors)
- [ ] Navigation works
- [ ] All 6 components render
- [ ] No console errors (F12)
- [ ] Form submissions work
- [ ] Cloud Functions respond
- [ ] Loading states display
- [ ] Error messages appear
- [ ] Success messages display
- [ ] Progress tracking works
- [ ] Mobile responsive
- [ ] Data persists across steps
- [ ] All browsers tested
- [ ] Performance acceptable

**Phase 1 Status:** [ ] PASS [ ] FAIL  
**Tester Name:** ________________  
**Date Tested:** ________________  
**Sign-off:** ________________  

---

## 📞 ISSUE REPORTING

When you find a bug:

1. **Record Details:**
   - Title: Clear 1-line summary
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce: Exact steps
   - Expected: What should happen
   - Actual: What actually happened
   - Screenshot: If visual issue

2. **Report to:** CPDO QA Lead

3. **Track in:** TEST_RESULTS.md

---

## 🎯 TODAY'S ACTION ITEMS

### NOW (Next 30 minutes):
1. [ ] Wait for GitHub Actions to complete
2. [ ] Open live site in browser
3. [ ] Run smoke test (all 6 steps)
4. [ ] Document any errors
5. [ ] Report critical issues

### After Initial Testing:
6. [ ] Run error tests (invalid inputs)
7. [ ] Test on multiple browsers
8. [ ] Test on mobile
9. [ ] Check performance
10. [ ] Document findings

### Before Phase 2:
11. [ ] Fix any critical bugs
12. [ ] Re-test broken features
13. [ ] Get sign-off
14. [ ] Proceed to Phase 2

---

**Testing Instructions Ready:** August 27, 2026  
**Status:** Ready for Immediate Execution  
**Next:** Begin Phase 1 Testing NOW

