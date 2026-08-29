# 🚀 HOW TO RUN PHASE 5 LOAD TESTS

**Ready to Execute:** August 29, 2026  
**Status:** ✅ **ALL TESTS READY TO RUN**

---

## 🎯 QUICK START

### Option 1: Automated Test Runner (Recommended)

```powershell
# Open PowerShell and run:
cd C:\disha-diagnostic-engine
.\run-load-tests.ps1
```

This will:
- ✅ Check prerequisites (Node.js, npm, k6)
- ✅ Display test schedule
- ✅ Ask for confirmation
- ✅ Run all 5 baseline & load tests sequentially
- ✅ Collect results
- ✅ Display summary

**Duration:** ~55 minutes

---

### Option 2: Manual Test Execution

#### Step 1: Install k6

**Windows (via Chocolatey):**
```powershell
choco install k6
```

**Windows (Manual Download):**
Download from: https://github.com/grafana/k6/releases
Extract and add to PATH

**Any OS (via npm - fallback):**
```bash
npm install -g k6
```

#### Step 2: Run Individual Tests

```bash
# Change to project directory
cd C:\disha-diagnostic-engine

# Test 1: Baseline (5 minutes)
k6 run k6/baseline.js

# Test 2: Light Load (12 minutes)
k6 run k6/load-light.js

# Test 3: Normal Load (15 minutes)
k6 run k6/load-normal.js

# Test 4: Heavy Load (18 minutes)
k6 run k6/load-heavy.js

# Test 5: Spike Test (5 minutes)
k6 run k6/spike-test.js
```

#### Step 3: Run All Tests Sequential
```bash
# Run all tests in sequence
for($i=1; $i -le 5; $i++) {
    $files = @('k6/baseline.js', 'k6/load-light.js', 'k6/load-normal.js', 'k6/load-heavy.js', 'k6/spike-test.js')
    k6 run $files[$i-1]
}
```

---

## 📊 UNDERSTANDING TEST OUTPUT

### Sample k6 Output
```
     data_received..................: 500 KB   10 KB/s
     data_sent.......................: 25 KB    500 B/s
     http_req_duration...............: avg=1.2s  min=200ms max=5s     p(95)=3s     p(99)=4.5s
     http_req_failed.................: 1%       ✓ 1000  ✗ 100
     http_req_receiving..............: avg=500ms min=100ms max=2s
     http_req_tls_handshaking........: avg=200ms min=50ms  max=1s
     http_req_waiting................: avg=650ms min=150ms max=3s
     iteration_duration..............: avg=2.5s  min=1.5s  max=6s     p(95)=4s
     iterations.......................: 1000
     vus.............................: 50
     vus_max..........................: 50
```

### Key Metrics to Watch
```
✅ http_req_duration (avg)     → Response time average
✅ http_req_duration (p95)     → 95th percentile (slower responses)
✅ http_req_failed             → % of failed requests
✅ iterations                   → Total requests completed
✅ vus/vus_max                  → Virtual users (current/max)
```

### Success Indicators ✅
```
✅ Error rate < 5%
✅ p95 response time within target
✅ No connection timeouts
✅ Consistent performance
✅ No system crashes
```

### Red Flags 🚨
```
❌ Error rate > 10%
❌ Response time degrading
❌ Timeout errors appearing
❌ Memory usage growing
❌ Connection drops
```

---

## 📈 TEST SCHEDULE

### All 5 Tests Combined: ~55 Minutes

```
Test 1: Baseline         →   5 min
Test 2: Light Load       →  12 min
Test 3: Normal Load      →  15 min
Test 4: Heavy Load       →  18 min
Test 5: Spike Test       →   5 min
────────────────────────────────
TOTAL:                   →  55 min
```

### Detailed Timeline
```
00:00 - Start Baseline test
00:05 - Baseline complete → Start Light Load
00:17 - Light Load complete → Start Normal Load
00:32 - Normal Load complete → Start Heavy Load
00:50 - Heavy Load complete → Start Spike Test
00:55 - All tests complete ✅
```

---

## 🔍 MONITORING DURING TESTS

### Watch These Values

**Response Time:**
- Good: < 3 seconds
- Acceptable: 3-10 seconds
- Problem: > 10 seconds

**Error Rate:**
- Good: 0-1%
- Acceptable: 1-5%
- Problem: > 5%

**Throughput (RPS):**
- For 50 users: 25-100 RPS expected
- For 200 users: 100-400 RPS expected
- For 500 users: 200-1000 RPS expected

**VUs (Virtual Users):**
- Should reach target value
- Should stay stable
- Should ramp up/down smoothly

---

## ⚠️ TROUBLESHOOTING

### k6 Command Not Found
```powershell
# Check installation
k6 version

# If not found, try npm installation
npm install -g k6

# Or run via npx
npx k6 run k6/baseline.js
```

### Tests Timing Out
**Cause:** Server is too slow or unreachable
**Solution:**
1. Verify app is running: https://disha-diagnostics.web.app/
2. Reduce load (edit test script)
3. Increase timeout values in script

### High Error Rate (>10%)
**Cause:** App can't handle load
**Solution:**
1. Check server logs
2. Stop current test (Ctrl+C)
3. Reduce user count
4. Restart test

### Connection Refused
**Cause:** Firewall, network, or app down
**Solution:**
1. Check if app is accessible
2. Verify URL in test script
3. Check firewall rules
4. Restart application

### Out of Memory / CPU Maxed
**Cause:** System overloaded
**Solution:**
1. Reduce VU count in script
2. Increase server resources
3. Optimize application code
4. Scale horizontally

---

## 📝 RECORDING RESULTS

### During Each Test

Take note of:
```
Test Name: [Baseline / Light / Normal / Heavy / Spike]
Start Time: [HH:MM:SS]
End Time: [HH:MM:SS]
Avg Response: [X.XXs]
p95 Response: [X.XXs]
Error Rate: [X%]
Success: [YES/NO]
Issues: [None / Details]
```

### After All Tests

Create summary:
```
Total Tests: 5/5 ✓
Total Time: 55 minutes
Avg Response Time: [X.XXs]
Peak Response Time: [X.XXs]
Error Rate: [X%]
Capacity Findings: [Details]
Bottlenecks: [List]
Recommendations: [List]
```

---

## 📊 EXPECTED RESULTS

### Conservative Estimate
```
Baseline:    <2s response ✓
Light Load:  <3s response ✓
Normal:      <5s response ✓
Heavy:       Responsive, <20s ✓
Spike:       Recovery <5s ✓
```

### Optimistic Estimate
```
Baseline:    <1s response ✓
Light Load:  <2s response ✓
Normal:      <2s response ✓
Heavy:       <5s response ✓
Spike:       Instant recovery ✓
```

---

## 🔗 NEXT TESTS (After Baseline & Load Tests Complete)

Once these 5 tests are done, continue with:

### Extended Tests (Day 2)
```bash
# Test 6: Endurance (60 minutes)
k6 run k6/endurance-test.js

# Test 7: Workflow (15 minutes)
k6 run k6/workflow-test.js

# Test 8: Survey (10 minutes)
k6 run k6/survey-test.js
```

---

## 📞 SUPPORT

### Documentation
- `PHASE_5_PERFORMANCE_TESTING_PLAN.md` - Full plan
- `PHASE_5_KICKOFF.md` - Quick reference
- `PHASE_5_SUMMARY.md` - Overview
- `PHASE_5_EXECUTION_LOG.md` - Results tracker

### Test Scripts
- `k6/baseline.js` - Baseline performance
- `k6/load-light.js` - Light load (50 users)
- `k6/load-normal.js` - Normal load (200 users)
- `k6/load-heavy.js` - Heavy load (500 users)
- `k6/spike-test.js` - Spike test
- `k6/endurance-test.js` - Endurance test
- `k6/workflow-test.js` - Workflow test
- `k6/survey-test.js` - Survey test

---

## ✅ READY TO START!

**You have everything needed to run Phase 5 load tests:**

- ✅ 8 test scripts created
- ✅ Test framework configured
- ✅ Automated runner ready
- ✅ Documentation complete
- ✅ Target app deployed

**Next Action:**
```powershell
# Option 1: Run automated tests
.\run-load-tests.ps1

# Option 2: Run individual test
k6 run k6/baseline.js
```

---

## 🎯 GOALS

After running tests, you should have:
- ✅ Baseline performance metrics
- ✅ Load capacity assessment
- ✅ Bottleneck identification
- ✅ Response time data
- ✅ Error rate analysis
- ✅ Capacity planning insights

---

**Let's go! 🚀**

**Time to start testing:** NOW

**Expected completion time:** 55 minutes (baseline & load tests only)

---

**Last Updated:** August 29, 2026  
**Status:** ✅ READY TO EXECUTE  
**Framework:** k6  
**App:** https://disha-diagnostics.web.app/
