# 🚀 MANUAL DEPLOYMENT GUIDE

**Issue**: Latest code not deployed to Firebase Hosting  
**Solution**: Deploy manually using Firebase CLI or GitHub Actions

---

## Option 1: Deploy via GitHub Actions (Recommended) ✅

GitHub Actions has the Firebase credentials pre-configured. Follow these steps:

### Step 1: Go to GitHub Actions
```
https://github.com/cpdoryl/Disha-diagnostic-app/actions
```

### Step 2: Select "Build & Deploy" Workflow
- Look for the "Build & Deploy" workflow in the left sidebar
- Click on it

### Step 3: Manually Trigger Build
- Click **"Run workflow"** button (top right, usually a dropdown)
- Select branch: **main**
- Click **"Run workflow"** button

### Step 4: Monitor Deployment
- Yellow circle appears (building...)
- Wait 5-10 minutes for build job
- Wait 2-5 minutes for deploy job
- Green checkmark = Success ✅

### Step 5: Verify Live App
After success, visit:
```
https://disha-diagnostics.web.app/
```

Should show the latest version with new features!

---

## Option 2: Deploy via Firebase CLI (Manual)

If you prefer manual deployment:

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```
(Opens browser to authorize)

### Step 3: Build the App
```bash
npm run build
```

### Step 4: Deploy to Firebase
```bash
firebase deploy --project=disha-diagnostics
```

### Step 5: Verify
```
https://disha-diagnostics.web.app/
```

---

## What's Being Deployed

The latest build includes:

### ✅ New Features
- [x] Multi-user 14D assessment workflow (4-stage)
- [x] Configuration stage (set expected respondents)
- [x] Deployment stage (track responses)
- [x] Lock/unlock assessment button
- [x] Analysis stage (shows expected vs actual)

### ✅ Test Resources
- [x] Test data simulator (browser console)
- [x] Real-time response simulation
- [x] Testing guides and documentation

### ✅ Documentation
- [x] Workflow implementation verified
- [x] Testing with browser console
- [x] 5 test scenarios ready

---

## Expected Live App Changes

After deployment, you'll see:

### Stage 1: Select Assessment
```
✅ "Multi-User 14D Assessment" option
✅ "Configure expected respondent counts"
✅ "Track real-time response progress"
```

### Stage 2: Configure
```
✅ Teachers: [input field]
✅ Parents: [input field]
✅ Students: [input field]
✅ Admin: [input field]
✅ Other: [input field]
✅ "TOTAL EXPECTED: XX responses"
✅ "PROCEED TO DEPLOYMENT" button
```

### Stage 3: Deploy & Track
```
✅ Overall Progress: X/Y (Z%)
✅ Progress bar (animated)
✅ Per-stakeholder breakdown
✅ Status badges (✅ Complete | ⏳ In Progress | ○ Not Started)
✅ "LOCK ASSESSMENT" button
✅ "PROCEED TO ANALYSIS" button (enabled after lock)
```

### Stage 4: Analysis
```
✅ "Assessment Complete & Ready for Analysis"
✅ Response summary by stakeholder type
✅ Shows "X of Y responses"
✅ "Generate Diagnostic Report" button
✅ Note: "Differences from expected count will be noted"
```

---

## ⏱️ Deployment Timeline

### Via GitHub Actions
```
T+0min:   Click "Run workflow"
T+5min:   Build job starts
T+10min:  Build job completes
T+12min:  Deploy job starts
T+15min:  🎉 LIVE! (https://disha-diagnostics.web.app/)
```

### Via Firebase CLI
```
T+0min:   Run: firebase deploy
T+2min:   Upload build artifacts
T+4min:   🎉 LIVE! (https://disha-diagnostics.web.app/)
```

---

## 🔍 Verify Deployment Success

### Check 1: Visit Live App
```
https://disha-diagnostics.web.app/
```
Should load (not old cached version)

### Check 2: Open Console
Press F12 → Console tab

### Check 3: Test Workflow
1. Click "Multi-User 14D Assessment"
2. Set Teachers: 3, Parents: 4, Students: 5
3. Click "Proceed to Deployment"
4. Dashboard should show 0/12 (NEW FEATURE)
5. Click "Lock Assessment" (NEW FEATURE)
6. Verify lock status changes (NEW FEATURE)
7. Click "Proceed to Analysis" (NEW FEATURE)

### Check 4: Clear Cache (if needed)
If still seeing old version:
```
1. Press: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select: "All time"
3. Check: "Cache" and "Cookies"
4. Click: "Clear data"
5. Refresh: https://disha-diagnostics.web.app/
```

---

## ✅ Success Indicators

After deployment, you should see:

- [x] New 4-stage workflow (not old 3-stage)
- [x] Configuration screen with respondent inputs
- [x] Dashboard with progress tracking
- [x] Lock/Unlock button working
- [x] Analysis shows expected vs actual
- [x] No console errors
- [x] Real-time progress updates

---

## 🐛 If Deployment Fails

### GitHub Actions Failed
1. Click on the failed workflow run
2. Scroll down to see error message
3. Check "Build" job logs
4. Common issues:
   - Firebase token expired → regenerate with `firebase login:ci`
   - Build failed → check TypeScript errors locally with `npm run build`
   - Deploy failed → check Firebase project is active

### Firebase CLI Failed
1. Ensure Firebase CLI installed: `firebase --version`
2. Ensure logged in: `firebase login`
3. Ensure project exists: `firebase projects:list`
4. Check credentials: `firebase projects:list | grep disha-diagnostics`

---

## 📞 Next Steps

### Immediately After Deployment

1. ✅ Visit: https://disha-diagnostics.web.app/
2. ✅ Refresh page (Ctrl+F5 for hard refresh)
3. ✅ Test workflow from START_TESTING_NOW.md
4. ✅ Run browser console tests
5. ✅ Report findings

### If Everything Works
→ Proceed with testing from REAL_DATA_TESTING_PLAN.md

### If Issues Found
→ I'll debug and fix

---

## 🎯 YOUR ACTION ITEMS

### Right Now

**Choose ONE:**

**Option A: GitHub Actions (Recommended)**
1. Go to: https://github.com/cpdoryl/Disha-diagnostic-app/actions
2. Click: "Build & Deploy" workflow
3. Click: "Run workflow"
4. Select branch: "main"
5. Click: "Run workflow"
6. Wait 15 minutes
7. Then visit: https://disha-diagnostics.web.app/

**Option B: Firebase CLI (Quick)**
```bash
# Ensure logged in
firebase login

# Deploy
firebase deploy --project=disha-diagnostics

# Then visit: https://disha-diagnostics.web.app/
```

**Option C: Contact Me**
Let me know if you want me to handle deployment via a different method.

---

## ✨ Once Deployed

After confirming the new version is live:

1. Follow: `START_TESTING_NOW.md` (quick 5-min test)
2. Run browser console commands
3. Verify all features work
4. Report findings

---

**Ready to deploy? Choose your option above and let me know when it's done!** 🚀
