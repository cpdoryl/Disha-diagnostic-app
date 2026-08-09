# 🧪 TESTING WITH BROWSER CONSOLE

Quick guide to test the workflow using browser developer tools.

---

## 🚀 QUICK START (5 minutes)

### 1. Open Live App
```
https://disha-diagnostics.web.app/
```

### 2. Open Browser Console
**Windows/Linux**: `F12` or `Ctrl+Shift+J`  
**Mac**: `Cmd+Option+J`

### 3. Go through workflow
- Click "Multi-User 14D Assessment"
- Set: Teachers 3, Parents 4, Students 5
- Click "Proceed to Deployment"
- Dashboard should show 0/12

### 4. Paste Commands in Console

Now you can simulate responses instantly!

---

## 📝 AVAILABLE COMMANDS

### Command 1: Add Single Response
```javascript
simulateSingleResponse('unknown', 'teacher')
```
**Result**: Adds 1 teacher response. Dashboard updates to show 1/12

### Command 2: Add Multiple Responses at Once
```javascript
simulateMultipleResponses('unknown', {
  teacher: 2,
  parent: 3,
  student: 2,
  admin: 1
})
```
**Result**: Adds 8 responses total. Dashboard updates to 8/12

### Command 3: Simulate Responses Over Time
```javascript
simulateResponsesOverTime('unknown', 4, 1000)
```
**Result**: Adds 4 responses, one every 1 second. Watch dashboard update in real-time.

### Command 4: Check Current Status
```javascript
getSimulationStatus('unknown')
```
**Result**: Shows:
```
{
  expected: 12,
  actual: 8,
  percentage: 67,
  breakdown: {
    teacher: { actual: 2, expected: 3 },
    parent: { actual: 3, expected: 4 },
    student: { actual: 2, expected: 5 },
    admin: { actual: 1, expected: 2 },
    other: { actual: 0, expected: 0 }
  }
}
```

### Command 5: Print Dashboard
```javascript
printDashboard('unknown')
```
**Result**: Clears console and prints a nice dashboard:
```
 📊 ASSESSMENT DASHBOARD 📊 

Overall Progress
8/12 responses (67%)

Breakdown by Stakeholder Type
✅ teacher: 2/3 (67%)
⏳ parent: 3/4 (75%)
⏳ student: 2/5 (40%)
⏳ admin: 1/2 (50%)
○ other: 0/0 (0%)
```

### Command 6: Reset Responses
```javascript
resetResponses('unknown')
```
**Result**: Clears all responses but keeps configuration. Dashboard goes back to 0/12.

### Command 7: Clear Everything
```javascript
clearAllData('unknown')
```
**Result**: Deletes assessment config and data. Start completely fresh.

### Command 8: Export Data
```javascript
exportTestData('unknown')
```
**Result**: Shows all assessment data as JSON:
```javascript
{
  config: { ... },
  progress: { ... },
  exportedAt: "2026-08-09T10:30:45.123Z"
}
```

---

## 📋 TEST SCENARIOS

### Scenario 1: Early Closure (0 Responses)
```javascript
// 1. Create assessment with 12 expected
// 2. Don't add any responses
// 3. Click "Lock Assessment" → Should work
// 4. Click "Proceed to Analysis" → Analysis shows 0/12
```

**Commands**: None needed - test the button directly

---

### Scenario 2: Partial Response
```javascript
// 1. Create assessment with 12 expected
simulateMultipleResponses('unknown', {
  teacher: 2,
  parent: 3,
  student: 1
})
// Dashboard shows 6/12 (50%)

// 2. Click "Lock Assessment" → Should work
// 3. Click "Proceed to Analysis" → Analysis shows 6/12 (6 missing)
```

**Step-by-step**:
1. Run: `simulateMultipleResponses('unknown', { teacher: 2, parent: 3, student: 1 })`
2. Dashboard updates to 6/12
3. Click "Lock Assessment" in UI
4. Click "Proceed to Diagnostic Report"
5. Verify analysis shows "6 of 12 responses"

---

### Scenario 3: Full Response
```javascript
// 1. Create assessment with 12 expected
simulateMultipleResponses('unknown', {
  teacher: 3,
  parent: 4,
  student: 5
})
// Dashboard shows 12/12 (100%)

// 2. Click "Lock Assessment" → Should work
// 3. Click "Proceed to Analysis" → Analysis shows 12/12 (all received)
```

**Step-by-step**:
1. Run: `simulateMultipleResponses('unknown', { teacher: 3, parent: 4, student: 5 })`
2. Dashboard updates to 12/12 (100%)
3. Click "Lock Assessment"
4. Click "Proceed to Diagnostic Report"
5. Verify analysis shows "12 of 12 responses"
6. Verify NO missing respondent note

---

### Scenario 4: Real-Time Updates
```javascript
// Watch responses arrive in real-time every 2 seconds

simulateResponsesOverTime('unknown', 12, 2000)
// Waits 2 seconds, adds 1 response
// Waits 2 seconds, adds 1 response
// ... continues until 12 responses
```

**How to watch**:
1. Run: `simulateResponsesOverTime('unknown', 12, 2000)`
2. Watch dashboard update every 2 seconds
3. Progress bar animates
4. Counter increments
5. Status badges update (⏳ In Progress → ✅ Complete)

**Timing Check**:
- Observe how long it takes for each update to appear
- Should be < 500ms (good response time)

---

### Scenario 5: Multiple Assessments
```javascript
// Create first assessment
// Set: Teachers 5, Parents 5 (Total: 10)
// Proceed to dashboard

// Simulate some responses
simulateMultipleResponses('unknown', {
  teacher: 3,
  parent: 2
})
// Shows 5/10

// Check status
getSimulationStatus('unknown')

// Reset and try different numbers
resetResponses('unknown')
// Back to 0/10

// Add different responses
simulateMultipleResponses('unknown', {
  teacher: 5,
  parent: 4
})
// Shows 9/10
```

---

## 🎬 STEP-BY-STEP TEST FLOW

### Test 1: Configuration → Immediate Close (10 min)

```javascript
// 1. Visit: https://disha-diagnostics.web.app/
// 2. Click: "Multi-User 14D Assessment"
// 3. Set: Teachers: 3, Parents: 4, Students: 5, Admin: 2
// 4. Click: "Proceed to Deployment"
// Dashboard shows 0/14

// 5. Click: "Lock Assessment" (close with 0 responses)
// Shows: "Assessment locked"

// 6. Click: "Proceed to Diagnostic Report"
// Analysis shows: "0 of 14 responses"

✅ TEST PASSED: Early closure works
```

---

### Test 2: Partial Response + Close (15 min)

```javascript
// 1. Click: "Start New Assessment"
// 2. Set: Teachers: 5, Parents: 5, Students: 5
// 3. Click: "Proceed to Deployment"
// Dashboard shows 0/15

// 4. Simulate partial responses:
simulateMultipleResponses('unknown', {
  teacher: 3,
  parent: 4,
  student: 2
})
// Dashboard shows 9/15 (60%)

// 5. Verify dashboard:
printDashboard('unknown')
// Shows 9/15

// 6. Click: "Lock Assessment"
// 7. Click: "Proceed to Diagnostic Report"
// Analysis shows: "9 of 15 responses"

✅ TEST PASSED: Partial closure works
```

---

### Test 3: Full Response + Close (15 min)

```javascript
// 1. Click: "Start New Assessment"
// 2. Set: Teachers: 3, Parents: 4, Students: 5
// 3. Click: "Proceed to Deployment"
// Dashboard shows 0/12

// 4. Simulate all responses:
simulateMultipleResponses('unknown', {
  teacher: 3,
  parent: 4,
  student: 5
})
// Dashboard shows 12/12 (100%)

// 5. Verify all complete:
printDashboard('unknown')
// Shows all ✅ Complete

// 6. Click: "Lock Assessment"
// 7. Click: "Proceed to Diagnostic Report"
// Analysis shows: "12 of 12 responses"
// Shows: "Analysis based on 12 responses"

✅ TEST PASSED: Full collection & closure works
```

---

### Test 4: Real-Time Sync (15 min)

```javascript
// 1. Click: "Multi-User 14D Assessment"
// 2. Set: Teachers: 5, Parents: 5, Students: 5
// 3. Click: "Proceed to Deployment"

// 4. Start auto-simulation:
simulateResponsesOverTime('unknown', 15, 3000)
// Adds 15 responses, one every 3 seconds

// 5. WATCH THE DASHBOARD
// Should update every 3 seconds:
// - Progress bar animates
// - Counter changes: 1/15 → 2/15 → 3/15 → ...
// - Status badges update: ⏳ → ✅ when complete
// - Last response timestamp updates

// 6. Measure timing (in console):
console.time('response-delay')
// Watch dashboard update
console.timeEnd('response-delay')
// Should show < 500ms

✅ TEST PASSED: Real-time updates work
```

---

## 🔍 DEBUGGING

### Issue: Console shows "No assessment progress found"

**Cause**: Assessment hasn't been created yet

**Fix**:
```javascript
// 1. Visit the app
// 2. Click "Multi-User 14D Assessment"
// 3. Set respondent counts
// 4. Click "Proceed to Deployment"
// 5. Then run test commands
```

---

### Issue: Dashboard doesn't update after simulation

**Cause**: Browser cache, need to refresh

**Fix**:
```javascript
// Refresh page
location.reload()

// Or check if data was saved
getSimulationStatus('unknown')
// If null, assess needs to be recreated
```

---

### Issue: Progress shows wrong numbers

**Cause**: localStorage might have old data

**Fix**:
```javascript
// Clear all data
clearAllData('unknown')

// Recreate assessment
// Set new respondent counts
// Run test again
```

---

## ✅ VALIDATION CHECKLIST

After each test, verify:

- [ ] Dashboard shows correct received/expected
- [ ] All stakeholder type breakdowns are accurate
- [ ] Progress bars match percentages
- [ ] Status badges are correct (✅/⏳/○)
- [ ] "Lock Assessment" button works
- [ ] "Proceed to Analysis" enabled after lock
- [ ] Analysis page shows actual responses
- [ ] Expected vs actual noted

---

## 📞 WHEN YOU'RE DONE

Run this to export all test data:
```javascript
const testData = exportTestData('unknown')
console.log(JSON.stringify(testData, null, 2))
```

Then let me know:
1. ✅ Which tests passed?
2. ❌ Which tests failed?
3. 🐛 Any bugs found?
4. ⏱️ Real-time update speed?
5. 🎯 Any UX improvements needed?

---

**Happy Testing!** 🚀
