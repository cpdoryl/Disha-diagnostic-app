# Live Testing Execution Guide

**Step-by-step testing procedure to perform RIGHT NOW**

**Test Date:** [Today's date]
**Tester:** [Your name]
**URLs to Test:**
- https://disha.rylneuroacademy.com
- https://disha-diagnostics.web.app/

---

## ⚙️ SETUP (5 minutes)

### Step 1: Prepare Your Browser
```
1. Open Chrome/Firefox/Safari
2. Press F12 to open Developer Tools
3. Go to Network tab
4. Clear all cookies/cache:
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Select "All time"
   - Check "Cookies and other site data"
   - Click "Clear data"
5. Close and reopen browser
```

### Step 2: Open First URL
```
1. Navigate to: https://disha.rylneuroacademy.com
2. Wait for page to fully load (should be <3 seconds)
3. Screenshot the login page
4. Check console (F12 > Console tab) for errors
5. Note any issues
```

---

## 🔐 PHASE 1: LOGIN PAGE (5 minutes)

### Checklist:
- [ ] **Visual Design**
  - [ ] Logo visible and correct
  - [ ] Login form centered
  - [ ] Email field present
  - [ ] Password field present
  - [ ] Login button visible
  - [ ] Modern, clean design (not outdated)
  - [ ] No old branding or deprecated elements

- [ ] **Functionality**
  - [ ] Email field accepts input
  - [ ] Password field masks input
  - [ ] Login button clickable
  - [ ] Form submits successfully

- [ ] **Responsiveness**
  - [ ] Mobile view (375px): Page readable
  - [ ] Tablet view (768px): Properly scaled
  - [ ] Desktop view (1920px): Full layout
  - [ ] No horizontal scrolling

- [ ] **Technical**
  - [ ] Page loads < 3 seconds
  - [ ] No console errors (F12 > Console)
  - [ ] No 404 errors
  - [ ] Secure connection (HTTPS)

### Action:
```
1. Enter your email address
2. Enter your password
3. Click Login button
4. Wait for redirect (should be quick)
5. Note redirect destination
```

### Screenshot Evidence:
📸 Take screenshot of login page

---

## 🏠 PHASE 2: LANDING PAGE / HOME (After Login) (10 minutes)

### First Look - Navigation Sidebar
```
IMPORTANT: Check sidebar for OLD vs NEW features
Open Developer Tools: F12 > Console
Paste this code to see console messages:
console.log("Starting sidebar audit...");
```

### Sidebar Audit Checklist:

**SHOULD BE PRESENT (New Features) ✅**
- [ ] "First Opinion Engine" (or "FOE v3")
- [ ] "14-Dimension Assessment" (or "14D v2")
- [ ] "Reverse Simulation" (or "Simulation Engine")
- [ ] "Analytics" or "Reports"
- [ ] "Settings" or "Profile"
- [ ] "Help"
- [ ] "Logout"

**SHOULD BE REMOVED (Old Features) ❌**
- [ ] ❌ "MultiUserAssessment" — IF PRESENT: MARK FOR REMOVAL
- [ ] ❌ "EWISR Assessment" — IF PRESENT: MARK FOR REMOVAL
- [ ] ❌ "Old First Opinion Engine"
- [ ] ❌ "Legacy Tools"
- [ ] ❌ Any deprecated assessment types
- [ ] ❌ "Archived Reports"

### Main Content Area
- [ ] Welcome message/dashboard title
- [ ] Key metrics displayed
- [ ] Quick action buttons
- [ ] Modern design (not outdated)
- [ ] Professional appearance

### Header/Navigation Bar
- [ ] Logo present
- [ ] User menu (profile icon)
- [ ] Search function (if available)
- [ ] Notifications (if available)
- [ ] Logout button accessible

### Actions to Perform:
```
1. Look at sidebar carefully
2. Screenshot entire sidebar
3. Hover over each menu item (check for old items)
4. Check console for errors
5. Note which OLD items are still present
6. Note which NEW items are missing
```

### Screenshot Evidence:
📸 Screenshot 1: Full dashboard
📸 Screenshot 2: Sidebar menu close-up
📸 Screenshot 3: Console (to check for errors)

---

## 🧪 PHASE 3: FIRST OPINION ENGINE v3 (15 minutes)

### Access FOE v3:
```
1. Click "First Opinion Engine" or "FOE v3" in sidebar
2. Wait for page to load
3. Check for errors (F12 > Console)
4. Screenshot the main page
```

### Visual Elements - MUST SEE:
- [ ] **Header/Title**
  - [ ] Page title: "First Opinion Engine v3" (or similar)
  - [ ] Clear navigation breadcrumbs

- [ ] **Challenge Questions (15 total)**
  - [ ] See challenges C1 through C15
  - [ ] Organized by domain (should see 5 domains)
  - [ ] Each challenge shows:
    - [ ] Challenge name
    - [ ] Domain indicator
    - [ ] Response/scoring interface
    - [ ] Modern styling

- [ ] **Objective Multipliers (8 total)**
  - [ ] STR (School Type Ranking)
  - [ ] Parent SLA
  - [ ] Teacher Training
  - [ ] Weekly Planning
  - [ ] Fee Realization
  - [ ] Safety & Compliance
  - [ ] Digital/LMS Usage
  - [ ] Extracurricular Participation
  - Each shows: Value, Threshold, Impact

- [ ] **Scores & Calculations**
  - [ ] S_sub (Subjective Score) displayed
  - [ ] M_obj (Objective Score) displayed
  - [ ] Health Index shown
  - [ ] All scores are numeric (0-100 range)

- [ ] **Visualizations**
  - [ ] Health Index gauge (shows as visual indicator)
  - [ ] Gap analysis chart
  - [ ] Trend line (if data available)
  - [ ] Professional, modern charts

### Actions to Perform:
```
1. Scroll through entire page
2. Look for all 15 challenges
3. Verify 8 multipliers visible
4. Check score displays
5. Click on elements to see interactions
6. Check console for errors
7. Take multiple screenshots
```

### Calculation Verification:
```
If you can submit data:
1. Enter test scores (e.g., 80 for multiple challenges)
2. Watch for S_sub calculation update
3. Change a multiplier value
4. Watch M_obj update
5. Verify Health Index recalculates
6. Note: Formula is (S_sub/100) × (M_obj/100) × 100
```

### Screenshot Evidence:
📸 Screenshot 1: Full FOE v3 page
📸 Screenshot 2: Challenges section close-up
📸 Screenshot 3: Multipliers section close-up
📸 Screenshot 4: Scores/calculations area
📸 Screenshot 5: Charts/visualizations

---

## 📊 PHASE 4: 14-DIMENSION ASSESSMENT v2 (15 minutes)

### Access 14D:
```
1. Click "14-Dimension Assessment" or "14D v2" in sidebar
2. Wait for page to load
3. Take screenshot
```

### Visual Elements - MUST SEE:
- [ ] **14 Dimensions**
  - [ ] All 14 dimensions visible (numbered or named)
  - [ ] Each dimension shows:
    - [ ] Dimension name/title
    - [ ] Current score (number)
    - [ ] Status indicator (color/icon)
    - [ ] Trend arrow (↑ up, ↓ down, → stable)

- [ ] **Stakeholder Data**
  - [ ] Teacher responses aggregated
  - [ ] Parent responses (if applicable)
  - [ ] Student responses (if applicable)
  - [ ] Admin responses (if applicable)
  - [ ] Shows consensus metrics

- [ ] **Questions & Responses**
  - [ ] 90+ perception questions mapped
  - [ ] Questions visible when clicking into dimension
  - [ ] Response scales shown (e.g., 1-5 rating)

- [ ] **Metrics**
  - [ ] 60+ operational metrics displayed
  - [ ] Metrics organized by dimension
  - [ ] Metric explanations provided

- [ ] **Visualizations**
  - [ ] Dimension scores chart/table
  - [ ] Status indicators for each dimension
  - [ ] Professional design

### Actions to Perform:
```
1. Scroll through all 14 dimensions
2. Count the dimensions (should be 14)
3. Click into a dimension to see details
4. Look for stakeholder aggregation
5. Check for trend data
6. Verify visualizations
7. Check for any errors
```

### Screenshot Evidence:
📸 Screenshot 1: All 14 dimensions view
📸 Screenshot 2: Individual dimension detail
📸 Screenshot 3: Stakeholder aggregation
📸 Screenshot 4: Metrics breakdown

---

## 🎮 PHASE 5: REVERSE SIMULATION ENGINE (15 minutes)

### Access Simulation:
```
1. Click "Reverse Simulation" or "Simulation Engine" in sidebar
2. Wait for page to load
3. Take screenshot
```

### Visual Elements - MUST SEE:
- [ ] **Current State Display**
  - [ ] Current scores shown
  - [ ] Current health index
  - [ ] Current status
  - [ ] Clear presentation

- [ ] **Parameter Controls**
  - [ ] Input fields or sliders for adjusting values
  - [ ] Clean, modern interface
  - [ ] Labels explain what each control does
  - [ ] Values constrain to valid ranges (0-100)

- [ ] **Real-Time Updates**
  - [ ] Adjusting a value updates calculations
  - [ ] Charts/visualizations refresh
  - [ ] No lag or delay
  - [ ] Smooth animations

- [ ] **Comparison Display**
  - [ ] Current state vs. simulated state shown
  - [ ] Differences highlighted
  - [ ] Clear before/after comparison

- [ ] **Recommendations**
  - [ ] New recommendations shown for simulation scenario
  - [ ] Actionable items listed
  - [ ] Priority levels indicated

### Actions to Perform:
```
1. Look at current state data
2. Take screenshot of baseline
3. Adjust a parameter (increase a score or multiplier)
4. Watch for real-time recalculation
5. Take screenshot showing changes
6. Adjust another parameter
7. Verify recommendation changes
8. Check for any errors
```

### Real-Time Test:
```
If adjustable:
1. Start with current score of 70
2. Change to 80
3. Observe Health Index change
4. Change back to 70
5. Observe Health Index revert
6. Note if updates are instant (< 1 second)
```

### Screenshot Evidence:
📸 Screenshot 1: Current state
📸 Screenshot 2: After adjusting values
📸 Screenshot 3: Before/after comparison
📸 Screenshot 4: New recommendations

---

## 📈 PHASE 6: REPORTS & ANALYTICS (10 minutes)

### Access Reports:
```
1. Click "Analytics" or "Reports" in sidebar
2. Wait for page to load
3. Take screenshot
```

### What to Look For:
- [ ] Dashboard overview
- [ ] Key metrics summary
- [ ] Trend charts
- [ ] Performance gauges
- [ ] Alert indicators
- [ ] Export options (PDF, Excel)

### Actions to Perform:
```
1. Look at report/analytics page
2. Verify data displays
3. Check charts are readable
4. Try export function (if available)
5. Check for any errors
```

### Screenshot Evidence:
📸 Screenshot 1: Reports/Analytics page
📸 Screenshot 2: Charts/visualizations
📸 Screenshot 3: Export options

---

## 🎨 PHASE 7: UI/UX QUALITY CHECK (10 minutes)

### Visual Design
- [ ] **Colors**: Professional color scheme (blues, greens, reds for alerts)
- [ ] **Typography**: Clear, readable fonts
- [ ] **Spacing**: Proper padding and margins
- [ ] **Icons**: Professional icons, not outdated
- [ ] **Layout**: Clean, organized, not cluttered
- [ ] **Consistency**: Same style across all pages

### User Experience
- [ ] **Navigation**: Intuitive, easy to find features
- [ ] **Clarity**: Page purposes are clear
- [ ] **Feedback**: Buttons show feedback when clicked
- [ ] **Loading**: Loading states shown (spinners, skeletons)
- [ ] **Errors**: Error messages are clear
- [ ] **Success**: Success confirmations shown

### Performance
- [ ] **Load Speed**: Pages load in < 3 seconds
- [ ] **Smoothness**: No lag or stuttering
- [ ] **Responsiveness**: Buttons respond instantly
- [ ] **Images**: No broken images
- [ ] **Videos**: Play smoothly (if any)

### Accessibility
- [ ] **Text Contrast**: Text is readable
- [ ] **Font Size**: Text is large enough
- [ ] **Alt Text**: Images have descriptions
- [ ] **Keyboard**: Can navigate with Tab key
- [ ] **Mobile**: Works on small screens

### Actions to Perform:
```
1. Look at overall design
2. Check colors are professional
3. Test keyboard navigation (press Tab)
4. Resize browser window (test responsiveness)
5. Check mobile view (F12 > Responsive Design Mode)
6. Note any design inconsistencies
```

### Screenshot Evidence:
📸 Screenshot 1: Desktop view
📸 Screenshot 2: Mobile view (375px)
📸 Screenshot 3: Tablet view (768px)

---

## 🔧 PHASE 8: TECHNICAL VERIFICATION (10 minutes)

### Browser Developer Tools (F12)

**Console Tab:**
```
1. Press F12
2. Click "Console" tab
3. Look for RED error messages ❌
4. Look for YELLOW warnings ⚠️
5. Note any errors you see
6. Type: console.log("Page loaded successfully")
7. You should see message printed
```

**Network Tab:**
```
1. Click "Network" tab
2. Refresh page (Ctrl+R)
3. Look at request list
4. Check for:
   - [ ] 404 errors (NOT FOUND)
   - [ ] 500 errors (SERVER ERROR)
   - [ ] Any RED status codes
5. All requests should be green (200 status)
```

**Application Tab:**
```
1. Click "Application" tab
2. Look at "LocalStorage"
3. Look at "Cookies"
4. Should see some data stored (normal)
5. Check for any authentication tokens
```

### Performance Check:
```
1. F12 > Performance tab
2. Click record button
3. Do some interactions (click, scroll, etc.)
4. Click stop
5. Look for:
   - [ ] Long tasks (should be short)
   - [ ] Smooth frame rate (should be 60fps)
   - [ ] Quick interactions
```

### Screenshot Evidence:
📸 Screenshot 1: Console tab (showing no errors)
📸 Screenshot 2: Network tab (showing successful requests)
📸 Screenshot 3: Application tab (showing storage)

---

## ✅ FINAL SUMMARY CHECKLIST

### URL: https://disha.rylneuroacademy.com

**Overall Assessment:**
- [ ] ✅ Working perfectly
- [ ] ⚠️ Working with minor issues
- [ ] ❌ Major issues present

**Feature Status:**
- [ ] First Opinion Engine v3: ✅ Live / ⚠️ Partial / ❌ Missing
- [ ] 14-Dimension v2: ✅ Live / ⚠️ Partial / ❌ Missing
- [ ] Reverse Simulation: ✅ Live / ⚠️ Partial / ❌ Missing
- [ ] Analytics/Reports: ✅ Live / ⚠️ Partial / ❌ Missing

**Old UI Status:**
- [ ] ✅ Completely removed
- [ ] ⚠️ Mostly removed, some old items visible
- [ ] ❌ Many old items still present

**Issues Found:**
1. [Issue description] - Severity: HIGH/MEDIUM/LOW
2. [Issue description] - Severity: HIGH/MEDIUM/LOW
3. [Issue description] - Severity: HIGH/MEDIUM/LOW

**Critical Issues (Block Deployment):**
- None found / List: [Issue 1, Issue 2]

**High Priority Issues (Fix Soon):**
- List: [Issue 1, Issue 2]

**Medium Priority Issues (Fix Later):**
- List: [Issue 1, Issue 2]

---

## 🔄 REPEAT FOR SECOND URL

After testing first URL, repeat ALL phases for:
**https://disha-diagnostics.web.app/**

Compare results between the two URLs.

---

## 📝 DOCUMENTATION

### Save These:
1. **Screenshots** - Collect all screenshots
2. **Console output** - Copy any error messages
3. **URLs tested** - Note which URLs
4. **Date/Time** - When testing occurred
5. **Browser/Device** - What you tested on

### Create Issue List:
```
Issue #1:
- Found on: [URL]
- Location: [Page]
- Description: [What's wrong]
- Severity: HIGH/MEDIUM/LOW
- Screenshot: [If applicable]

Issue #2:
[Repeat format]
```

---

## 🚀 AFTER TESTING

1. **Compile results** into UI_TESTING_REPORT_TEMPLATE.md
2. **List all issues** found
3. **Prioritize fixes**
4. **Document removed items**
5. **Note missing features**
6. **Record performance metrics**

---

## ⏱️ ESTIMATED TIME

- Phase 1 (Login): 5 minutes
- Phase 2 (Landing): 10 minutes
- Phase 3 (FOE v3): 15 minutes
- Phase 4 (14D v2): 15 minutes
- Phase 5 (Simulation): 15 minutes
- Phase 6 (Reports): 10 minutes
- Phase 7 (UI/UX): 10 minutes
- Phase 8 (Technical): 10 minutes
- **Total per URL: ~90 minutes**
- **Both URLs: ~180 minutes (3 hours)**

---

## 📋 QUICK REFERENCE

### What Should Be Live:
✅ FOE v3 (15 challenges, 8 multipliers)
✅ 14D v2 (14 dimensions, multi-stakeholder)
✅ Reverse Simulation (what-if scenarios)
✅ Analytics/Reports
✅ Modern UI design

### What Should Be Gone:
❌ MultiUserAssessment
❌ Old EWISR
❌ Legacy features
❌ Outdated design

### Quick Test Commands:
```javascript
// In browser console (F12 > Console):
console.log("Testing page...");
console.log("All systems go!");
```

---

**Ready to Test? Start with PHASE 1 now! 🚀**

Use this guide step-by-step and document all findings.
