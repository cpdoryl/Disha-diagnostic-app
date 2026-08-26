# Quick Testing Reference Card

**Keep this handy while testing! Print or keep in browser tab.**

---

## 🎯 TODAY'S TESTING GOAL

✅ Verify new features are LIVE  
✅ Confirm old UI is REMOVED  
✅ Ensure app is CLEAN & MODERN

---

## 📍 URLS TO TEST

```
1. https://disha.rylneuroacademy.com
2. https://disha-diagnostics.web.app/
```

---

## ⚙️ BROWSER SETUP (Do This First!)

```
1. Open Chrome/Firefox/Safari
2. Press F12 (open Developer Tools)
3. Press Ctrl+Shift+Delete (clear cache)
   - Select "All time"
   - Check "Cookies and other site data"
   - Click "Clear data"
4. Close browser
5. Reopen
6. Paste URL
```

---

## ✅ NEW FEATURES - MUST BE LIVE

```
✅ First Opinion Engine v3
   - 15 challenges (C1-C15)
   - 8 multipliers
   - Real-time calculations
   
✅ 14-Dimension Assessment v2
   - All 14 dimensions
   - Multi-stakeholder data
   - 90+ questions

✅ Reverse Simulation Engine
   - What-if scenarios
   - Real-time updates
   
✅ Modern UI Design
   - Professional colors
   - Clean layout
```

---

## ❌ OLD UI - MUST BE REMOVED

```
❌ MultiUserAssessment
❌ EWISR Assessment (old)
❌ Legacy features
❌ Outdated sidebar items
❌ Deprecated components
```

---

## 🧪 8-PHASE QUICK TEST

### Phase 1: LOGIN (5 min)
```
□ Modern design
□ Form works
□ No console errors
□ Responsive
```

### Phase 2: DASHBOARD (10 min)
```
□ Sidebar has NEW items
□ OLD items REMOVED
□ Modern layout
□ No errors
```

### Phase 3: FOE v3 (15 min)
```
□ 15 challenges visible
□ 8 multipliers present
□ Calculations show
□ Charts display
□ Real-time updates
```

### Phase 4: 14D v2 (15 min)
```
□ 14 dimensions shown
□ Stakeholder data
□ 90+ questions mapped
□ Professional display
```

### Phase 5: SIMULATION (15 min)
```
□ Parameter controls
□ Real-time updates
□ Comparison shown
□ Recommendations generated
```

### Phase 6: REPORTS (10 min)
```
□ Dashboard works
□ Charts display
□ Export option
```

### Phase 7: UI QUALITY (10 min)
```
□ Colors professional
□ Layout clean
□ Mobile friendly
□ Keyboard nav works
```

### Phase 8: TECHNICAL (10 min)
```
□ Console: No RED errors
□ Network: All GREEN (200 status)
□ Page loads < 3 sec
□ No 404s
```

---

## 📸 WHAT TO SCREENSHOT

```
At minimum, capture:
1. Login page
2. Dashboard/home
3. FOE v3 main page
4. 14D main page
5. Simulation main page
6. Sidebar close-up
7. Any issues found
8. Console (F12 > Console)
```

---

## 🔍 SIDEBAR AUDIT (CRITICAL!)

### SHOULD SEE (✅)
```
✅ First Opinion Engine v3
✅ 14-Dimension Assessment v2
✅ Reverse Simulation
✅ Analytics/Reports
✅ Settings/Profile
✅ Help
✅ Logout
```

### SHOULD NOT SEE (❌)
```
❌ MultiUserAssessment
❌ EWISR Assessment
❌ Old Assessment Types
❌ Legacy Tools
```

**If you see any ❌ items → FLAG FOR REMOVAL**

---

## 🛠️ DEVELOPER TOOLS CHECKLIST

### Console (F12 > Console tab)
```
Look for:
❌ RED ERROR messages → Note them
⚠️ Yellow warnings → Note them
✅ Should be mostly BLUE info messages

If RED errors found:
- Screenshot it
- Copy error text
- Note which page
```

### Network (F12 > Network tab)
```
1. Refresh page (Ctrl+R)
2. Check request list
3. Look for RED status codes
4. Should all be 200/301 (GREEN)

If you see RED (404, 500):
- Screenshot it
- Note the URL
- Note what failed
```

---

## ⚡ QUICK TESTS

### Real-Time Calculation Test
```
IF you can enter data on FOE v3:
1. Change a score value
2. Watch S_sub update instantly
3. Change a multiplier
4. Watch M_obj update
5. Health Index should recalculate
6. Should all happen < 1 second
```

### Responsiveness Test
```
1. Press F12
2. Click responsive design icon
3. Set viewport to 375px (mobile)
4. Scroll and test
5. Set viewport to 768px (tablet)
6. Scroll and test
7. Should all work smoothly
```

### Performance Check
```
Page should load:
✅ < 3 seconds (fast)
✅ < 5 seconds (acceptable)
❌ > 5 seconds (slow - FLAG IT)

Note load time for each page.
```

---

## 📝 QUICK ISSUE TEMPLATE

When you find an issue:
```
Issue: [What's wrong]
URL: [Which URL]
Page: [Which page]
Severity: HIGH / MEDIUM / LOW
Evidence: [Screenshot name]
Details: [What should happen vs what happens]
```

---

## ✅ FINAL CHECKLIST

### After Testing URL 1
```
□ All 8 phases completed
□ Screenshots collected
□ Issues documented
□ Notes taken
```

### Before Testing URL 2
```
□ Clear cache/cookies again
□ Open new browser tab
□ Open Developer Tools
□ Ready for Phase 1
```

### After Testing Both URLs
```
□ Compare results
□ List all issues
□ Prioritize fixes
□ Document old UI found
□ Note missing features
```

---

## 🚨 CRITICAL ISSUES (Stop Testing If Found)

```
❌ Login doesn't work
❌ 404 error on core pages
❌ No FOE v3 or 14D v2
❌ Calculations completely wrong
❌ Multiple RED console errors
❌ Page won't load at all
```

---

## ⏱️ TIME BREAKDOWN

```
Setup:              5 min
Phase 1 (Login):    5 min
Phase 2 (Home):    10 min
Phase 3 (FOE v3):  15 min
Phase 4 (14D v2):  15 min
Phase 5 (Sim):     15 min
Phase 6 (Reports): 10 min
Phase 7 (UI/UX):   10 min
Phase 8 (Tech):    10 min
─────────────────────────
Per URL:          ~95 min
Both URLs:       ~190 min (3+ hours)
```

---

## 🎯 SUCCESS CRITERIA

✅ Testing SUCCESS when:
```
□ All new features working
□ No old UI visible
□ No critical errors
□ Calculations accurate
□ Real-time updates work
□ Mobile responsive
□ Professional design
□ All 8 phases pass
```

❌ Testing FAILED when:
```
□ Core features missing
□ Many old UI items visible
□ Critical errors in console
□ Calculations wrong
□ Pages won't load
□ Major UI issues
```

---

## 💡 HELPFUL SHORTCUTS

```
F12 ..................... Open Developer Tools
Ctrl+Shift+Delete ........ Clear browser data
Ctrl+R ................... Refresh page
Ctrl+Shift+R ............. Hard refresh (skip cache)
Tab ...................... Navigate with keyboard
Alt+Left Arrow ........... Go back
Alt+Right Arrow .......... Go forward
```

---

## 📞 IF STUCK

1. **Page won't load?**
   - Check internet connection
   - Try different browser
   - Clear cache again
   - Check URL spelling

2. **Too many errors?**
   - Screenshot everything
   - Note exact error messages
   - Try other URL
   - Come back later

3. **Not sure if working?**
   - Compare to checklist
   - Look for error indicators
   - Check console (F12)
   - Screenshot for evidence

---

## 🚀 START TESTING NOW!

```
1. Copy first URL
2. Paste in browser
3. Follow Phase 1-8
4. Use checklist
5. Document findings
6. Repeat for URL 2
```

**You've got this! 🎯**

---

**Last Updated:** August 26, 2026  
**Print this page** and keep it handy while testing!
