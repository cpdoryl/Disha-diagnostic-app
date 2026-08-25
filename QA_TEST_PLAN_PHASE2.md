# 🧪 PHASE 2 QA TEST PLAN - Comprehensive Testing

**Date:** 2026-08-25  
**Status:** TESTING IN PROGRESS  
**Test Engineer:** Claude Haiku 4.5  

---

## 📋 TEST SCOPE

### **Phase 2 Real-Time Calculation Pipeline Features**

✅ Real-time Firestore triggers  
✅ M_obj calculation from multipliers  
✅ S_sub calculation from challenge responses  
✅ Health Index calculation  
✅ Gap & Quadrant analysis  
✅ Fact-vs-perception validation  
✅ Dashboard real-time updates  
✅ Error handling & recovery  

---

## 🐛 **BUGS FOUND & FIXED**

### **Bug #1: FIXED ✅**
**Component:** `functions/src/firstOpinion/recalculate.ts`  
**Line:** 124  
**Severity:** CRITICAL  
**Status:** FIXED & DEPLOYED  

**Issue:**
```typescript
// BEFORE (WRONG):
const m_obj = validMultipliers.length > 0 ? calculateSsub([], {}) : 50

// AFTER (FIXED):
const m_obj = calculateMobj(multipliers)
```

**Impact:**
- M_obj calculation was completely broken
- Was calling S_sub function instead of M_obj function
- Health Index = S_sub × M_obj, so wrong M_obj broke everything

**Fix:** Use correct `calculateMobj(multipliers)` function

**Commit:** `58c4db6` ✅  
**Build Status:** ✅ PASSED  

---

## 🧪 TEST SCENARIOS

### **Test Scenario 1: Single Challenge Response Submission**

**Preconditions:**
- School exists: `school_001_delhi_premium`
- Assessment cycle exists and active
- No prior responses

**Test Steps:**
1. Submit challenge response via Firestore
   ```
   POST /schools/school_001/assessmentCycles/cycle_001/challengeResponses
   {
     "challengeId": "C1",
     "role": "TEACHER",
     "severity": 7,
     "impact": 8,
     "submitted_at": NOW,
     "deleted": false
   }
   ```

2. Wait 2-3 seconds for trigger to fire

3. Verify:
   - ✅ Trigger `onChallengeResponseWrite` fires
   - ✅ `recalculateAndPersistCycleScores` called
   - ✅ S_sub calculated
   - ✅ M_obj calculated (geometric mean of multipliers)
   - ✅ Health Index computed
   - ✅ Gap & Quadrant analysis done
   - ✅ Results persisted to `assessmentCycles/{cycleId}/scores`
   - ✅ `computed/latest` doc updated

**Expected Results:**
```
✅ scores.s_sub: number (0-100)
✅ scores.m_obj: number (0-100)
✅ scores.healthIndex: number (0-100)
✅ scores.gap: number (0-100)
✅ scores.quadrant: "ALIGNED" | "REALITY_BETTER" | "PERCEPTION_BETTER"
✅ respondentCount: 1
✅ respondentsByRole: { "TEACHER": 1 }
✅ updatedAt: Timestamp
```

**Pass Criteria:**
- All scores computed correctly
- Trigger completes within 5 seconds
- No errors in Cloud Function logs

---

### **Test Scenario 2: Multiple Responses & Aggregation**

**Preconditions:**
- Previous test completed successfully

**Test Steps:**
1. Submit 3 more challenge responses (different roles, different challenges)
2. Verify trigger fires 3 times
3. Check S_sub recalculates each time (weighted average)
4. Verify respondentCount increases: 1 → 2 → 3 → 4

**Expected:**
- respondentCount = 4
- respondentsByRole = { "TEACHER": 2, "PARENT": 1, "STUDENT": 1 }
- S_sub changes with each new response

---

### **Test Scenario 3: Multiplier Update & M_obj Recalculation**

**Preconditions:**
- 4 responses already submitted
- M_obj previously calculated (say, 60)

**Test Steps:**
1. Create multiplier document
   ```
   POST /schools/school_001/assessmentCycles/cycle_001/multipliers/m_leadership
   {
     "name": "Leadership",
     "value": 0.85,
     "validationStatus": "VALID"
   }
   ```

2. Wait for trigger `onMultiplierWrite`

3. Verify:
   - ✅ Trigger fires immediately
   - ✅ `calculateMobj(multipliers)` called
   - ✅ Geometric mean computed correctly
   - ✅ M_obj updated in scores
   - ✅ Health Index recalculated (depends on M_obj)

**Formula Verification:**
```
If multipliers = [0.85, 0.75, 0.80, ...]
M_obj = (0.85 × 0.75 × 0.80 × ...)^(1/n) × 100
```

---

### **Test Scenario 4: Health Index Calculation & Delusion Penalty**

**Preconditions:**
- S_sub = 90 (high perception)
- M_obj = 70 (lower reality)

**Test:**
1. Expected Health Index:
   ```
   raw_health = (90/100) × (70/100) × 100 = 63
   delusionPenalty = MAX(0, 90 - 80) = 10
   Health Index = 63 - 10 = 53
   ```

2. Verify in `computed/latest`:
   - ✅ healthIndex = 53
   - ✅ delusionPenalty = 10
   - ✅ blindSpotRisk = true (quadrant = PERCEPTION_BETTER)

---

### **Test Scenario 5: Gap & Quadrant Analysis**

**Test Cases:**

**Case A: ALIGNED (Gap 30-70)**
- S_sub = 75, M_obj = 78
- rawGap = -3
- gap_scaled = -3 + 50 = 47 ✅ ALIGNED
- interpretation = "perception aligns with reality"

**Case B: REALITY_BETTER (Gap < 30)**
- S_sub = 60, M_obj = 85
- rawGap = -25
- gap_scaled = -25 + 50 = 25 ✅ REALITY_BETTER
- interpretation = "operations strong, perception lags"

**Case C: PERCEPTION_BETTER (Gap > 70)**
- S_sub = 90, M_obj = 65
- rawGap = 25
- gap_scaled = 25 + 50 = 75 ✅ PERCEPTION_BETTER
- interpretation = "blind spot risk"

---

### **Test Scenario 6: Fact-vs-Perception Validation**

**Preconditions:**
- Multiple responses with varying severity scores

**Test:**
1. Verify `validateChallengeResponses()` analyzes:
   - ✅ isValid flag
   - ✅ score (validation confidence)
   - ✅ errors array (any critical issues)
   - ✅ warnings array (cautions)
   - ✅ factVsPerceptionBreakdown

2. Check `computed/latest.validation`:
   ```json
   {
     "isValid": true,
     "score": 0.87,
     "errors": [],
     "warnings": [],
     "factVsPerceptionBreakdown": { ... }
   }
   ```

---

### **Test Scenario 7: Challenge Severity Calculation**

**Test:**
1. For each challenge, verify severity calculated:
   ```
   severity = calculateChallengeSeverity(
     responses_for_challenge, 
     weight
   )
   ```

2. Check `computed/latest.challengeSeverity`:
   ```json
   {
     "C1": { "severity": 7.2, "impact": 8.1, ... },
     "C2": { "severity": 5.4, "impact": 6.2, ... },
     ...
   }
   ```

---

### **Test Scenario 8: Batch Recalculation Job**

**Preconditions:**
- Multiple assessment cycles with data

**Test:**
1. Trigger `batchRecalculateAllCycles` manually
   ```
   POST /admin/batch-recalculate
   ```

2. Verify:
   - ✅ Query finds all active cycles
   - ✅ Each cycle recalculated independently
   - ✅ One failure doesn't break others (try/catch)
   - ✅ All results persisted

---

### **Test Scenario 9: Deleted Response Handling**

**Test:**
1. Soft-delete a response:
   ```
   PATCH /schools/school_001/.../challengeResponses/resp_1
   { "deleted": true }
   ```

2. Verify:
   - ✅ Trigger fires
   - ✅ Deleted response excluded from S_sub (where 'deleted' == false)
   - ✅ S_sub recalculated without it
   - ✅ respondentCount stays same (deleted still counted as submitted)

---

### **Test Scenario 10: Error Handling & Retry Logic**

**Preconditions:**
- Network simulated to fail temporarily

**Test:**
1. Trigger fails (simulated error)
2. Verify GitHub Actions retry logic:
   - ✅ Auto-retry after 30 seconds
   - ✅ Up to 3 attempts
   - ✅ Detailed error logging
   - ✅ Auto-fix analysis

---

## 📊 TEST COVERAGE MATRIX

| Component | Test Case | Status | Notes |
|-----------|-----------|--------|-------|
| **Triggers** | onChallengeResponseWrite | ⏳ Ready | Scenario 1-2 |
| | onMultiplierWrite | ⏳ Ready | Scenario 3 |
| **S_sub** | Single response | ⏳ Ready | Scenario 1 |
| | Multiple responses | ⏳ Ready | Scenario 2 |
| **M_obj** | Fixed ✅ | ✅ FIXED | Bug #1 fixed |
| | Geometric mean | ⏳ Ready | Scenario 3 |
| **Health Index** | Delusion penalty | ⏳ Ready | Scenario 4 |
| | Clamping (0-100) | ⏳ Ready | Scenario 4 |
| **Gap/Quadrant** | ALIGNED | ⏳ Ready | Scenario 5 |
| | REALITY_BETTER | ⏳ Ready | Scenario 5 |
| | PERCEPTION_BETTER | ⏳ Ready | Scenario 5 |
| **Validation** | Fact-vs-perception | ⏳ Ready | Scenario 6 |
| **Severity** | Per-challenge | ⏳ Ready | Scenario 7 |
| **Batch Job** | Multi-cycle | ⏳ Ready | Scenario 8 |
| **Soft Delete** | Deleted flag handling | ⏳ Ready | Scenario 9 |
| **Error Handling** | Retry logic | ⏳ Ready | Scenario 10 |

---

## ✅ PASS CRITERIA

Test passes if:
1. ✅ All triggers fire within 5 seconds
2. ✅ All calculations produce correct values
3. ✅ Firestore updates within 2 seconds of trigger
4. ✅ No errors in Cloud Function logs
5. ✅ Dashboard reflects updates in real-time
6. ✅ Batch job completes without failures
7. ✅ Retry logic activates on errors

---

## 🚀 TEST EXECUTION PLAN

### **Phase 1: Local Testing (Today)**
1. Verify functions compile: ✅ DONE
2. Run unit tests (if available)
3. Check calculations manually

### **Phase 2: Live App Testing (Tomorrow)**
1. Go to: https://disha-diagnostics.web.app/
2. Create assessment cycle
3. Submit challenge responses
4. Monitor Firestore in real-time
5. Verify scores update automatically

### **Phase 3: Performance Testing (Next Week)**
1. Load test with 100+ responses
2. Measure trigger latency
3. Check for timeouts

---

## 📝 KNOWN ISSUES & RESOLUTIONS

### **Issue #1: FIXED ✅**
**Description:** M_obj calculation using wrong function  
**Severity:** CRITICAL  
**Status:** FIXED in commit `58c4db6`  
**Resolution:** Use `calculateMobj()` instead of `calculateSsub()`  

### **Issue #2: PENDING**
**Description:** No UI component for viewing real-time scores  
**Severity:** MEDIUM  
**Status:** Design phase  
**Action:** Phase 3 (Dashboard)  

---

## 📞 TEST CONTACTS

- **Test Engineer:** Claude Haiku 4.5
- **QA Repo:** GitHub Actions #214+
- **Live App:** https://disha-diagnostics.web.app/
- **Cloud Functions:** https://console.cloud.google.com/functions?project=disha-diagnostics

---

**Test Plan Status:** READY FOR EXECUTION  
**Last Updated:** 2026-08-25  
**Next Milestone:** Phase 2 Testing Complete

