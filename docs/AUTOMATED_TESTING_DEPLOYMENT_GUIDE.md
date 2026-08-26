# Automated UI Testing & Deployment Guide

**Complete automation framework for testing, cleanup, and deployment**

---

## 🎯 Overview

This guide explains the **three automated testing and deployment systems** created to:
1. Automatically test new vs. old UI features
2. Verify both deployment URLs are working
3. Remove old UI components
4. Deploy cleaned version to production
5. Generate comprehensive reports

**No manual browser testing needed!** All testing is automated.

---

## 📦 What You Have

### 1. **Node.js Script**: `scripts/automated-ui-testing-deployment.js`
Automated testing framework with 8 phases

### 2. **GitHub Actions Workflow**: `.github/workflows/automated-ui-deployment.yml`
CI/CD pipeline that auto-triggers on push

### 3. **Shell Script**: `scripts/cleanup-old-ui.sh`
Interactive cleanup script for manual execution

---

## 🚀 OPTION 1: GitHub Actions (Recommended - Fully Automated)

### How It Works:
```
1. You push to main or remote-dev branch
   ↓
2. GitHub Actions automatically triggers
   ↓
3. Automated tests run on both URLs
   ↓
4. Verifies new features + old UI removal
   ↓
5. Deploys to Firebase (both URLs)
   ↓
6. Cleanup job removes old components
   ↓
7. Final verification job tests both URLs
   ↓
8. Deployment reports uploaded as artifacts
```

### Setup Required:

**Step 1: Add GitHub Secrets**
```
Settings → Secrets and variables → Actions → New repository secret

Add:
- FIREBASE_TOKEN: [Your Firebase token]
- FIREBASE_PROJECT_ID: [Your Firebase project ID]
```

**Get Firebase Token:**
```bash
firebase login:ci
# This outputs your CI token - copy and paste into GitHub secret
```

**Step 2: Trigger Workflow**
```bash
# Option A: Push to main (triggers immediately)
git push origin main

# Option B: Push to remote-dev (triggers immediately)
git push origin remote-dev

# Option C: Manual trigger
# Go to GitHub → Actions tab → Automated UI Testing & Deployment
# Click "Run workflow"

# Option D: Automatic (runs daily at 6 AM UTC)
# No action needed - happens automatically
```

**Step 3: Monitor Progress**
```
1. Go to GitHub repository
2. Click "Actions" tab
3. Click "Automated UI Testing & Deployment"
4. Watch workflow progress in real-time
```

**Step 4: Download Results**
```
Workflow completes → Click on workflow run → Artifacts section
Download: deployment-report.md
```

---

## 🛠️ OPTION 2: Manual Node.js Script

### Usage:

```bash
# Install dependencies (one time)
npm install puppeteer axios

# Run the automation framework
node scripts/automated-ui-testing-deployment.js
```

### What It Does:
```
1. Tests both URLs for new/old features
2. Analyzes results
3. Backs up old components
4. Validates new features
5. Generates detailed JSON report
6. Shows recommendations
```

### Output:
```
Reports saved to: test_reports/ui_deployment_[timestamp].json

Contains:
- Testing results per URL
- New features found
- Old features detected
- Recommended actions
```

---

## 🧹 OPTION 3: Manual Shell Script (Interactive Cleanup)

### Usage:

```bash
# Make script executable (one time)
chmod +x scripts/cleanup-old-ui.sh

# Run the cleanup script
bash scripts/cleanup-old-ui.sh
```

### What It Does:
```
1. Creates timestamped backups of old components
2. Removes old files
3. Updates routing and imports
4. Rebuilds application
5. Runs test suite
6. Asks you: Deploy? (yes/no)
7. Deploys if you confirm
8. Verifies both URLs
```

### Interactive Prompts:
```
Choose deployment option:
1) Deploy to both URLs (main + remote-dev)
2) Deploy to disha.rylneuroacademy.com only
3) Deploy to disha-diagnostics.web.app only
0) Skip deployment

Enter choice (0-3): [You select]
```

---

## 🧪 What Gets Tested Automatically

### New Features Verification ✅
- [ ] First Opinion Engine v3 detected
- [ ] 14-Dimension Assessment v2 detected
- [ ] Reverse Simulation Engine detected
- [ ] Analytics/Reports module detected

### Old Features Detection ❌
- [ ] MultiUserAssessment NOT found
- [ ] EWISR Assessment NOT found
- [ ] Legacy components NOT found
- [ ] Old dashboard NOT found

### Old Files Removal 🗑️
These files are automatically removed:
```
src/pages/MultiUserAssessment.tsx
src/pages/EWSIRAssessment.tsx
src/pages/OldDashboard.tsx
src/pages/LegacyReports.tsx
src/components/OldScoreCard.tsx
src/components/LegacyDashboard.tsx
src/components/DeprecatedCharts.tsx
src/components/OldNavigation.tsx
src/lib/oldAssessmentService.ts
src/lib/legacyCalculations.ts
```

### Deployment Verification ✔️
Both URLs tested after deployment:
```
✅ https://disha.rylneuroacademy.com
✅ https://disha-diagnostics.web.app/
```

---

## 📊 Automated Testing Phases

### Phase 1: Automated Browser Testing
- Tests both URLs simultaneously
- Checks page loads successfully
- Scans for new feature presence
- Detects old feature presence

### Phase 2: Analyze Results
- Compares against expected features
- Flags missing new features
- Flags remaining old features
- Determines if deployment needed

### Phase 3: Cleanup Old Components
- Backs up old files with timestamp
- Removes outdated components
- Logs what was removed

### Phase 4: Update Routing
- Removes old route imports
- Cleans up navigation menu
- Updates component references

### Phase 5: Validate New Features
- Verifies new components exist
- Checks file structure
- Confirms new feature implementation

### Phase 6: Build & Test
- Compiles TypeScript/React
- Runs test suite
- Validates code quality

### Phase 7: Deploy to Servers
- Builds final artifact
- Deploys to Firebase (both URLs)
- Handles deployment errors

### Phase 8: Post-Deployment Verification
- Tests both URLs after deploy
- Confirms pages load
- Verifies no deployment errors

---

## 📋 Success Criteria

### Deployment Successful When:
```
✅ Both URLs respond with HTTP 200
✅ New features detected in code
✅ Old features removed from code
✅ Build passes all tests
✅ No console errors on pages
✅ Deployment reports generated
```

### Issues Detected When:
```
❌ URL returns HTTP error
❌ New features not found
❌ Old features still present
❌ Build fails
❌ Tests fail
❌ Deployment fails
```

---

## 🔄 Automation Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ DEVELOPER PUSHES CODE TO main/remote-dev                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ GitHub Actions Triggered   │
        └────────┬───────────────────┘
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
  ┌─────────────┐   ┌─────────────────┐
  │ Test Job   │   │ Cleanup Job    │
  └──────┬──────┘   └────────┬────────┘
         │                   │
         │ (if tests pass)   │
         └─────────┬─────────┘
                   ▼
        ┌────────────────────────────┐
        │ Deploy to Firebase         │
        │ - disha.rylneuroacademy... │
        │ - disha-diagnostics...     │
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │ Verification Job           │
        │ - Test both URLs           │
        │ - Generate reports         │
        │ - Upload artifacts         │
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │ ✅ DEPLOYMENT COMPLETE    │
        │ Both URLs Live & Verified  │
        │ Reports Available          │
        └────────────────────────────┘
```

---

## 🚨 Common Issues & Solutions

### Issue: Tests Pass But Deployment Fails

**Cause:** Firebase credentials invalid or expired

**Solution:**
```bash
# Re-authenticate with Firebase
firebase login

# Or use a fresh CI token
firebase login:ci

# Update GitHub secret with new token
```

### Issue: Old Features Still Present After Cleanup

**Cause:** Files not properly removed or imports still exist

**Solution:**
```bash
# Manually verify old files
git status

# Check for remaining old imports
grep -r "MultiUserAssessment" src/
grep -r "EWISR" src/

# If still present, run cleanup again
bash scripts/cleanup-old-ui.sh
```

### Issue: New Features Not Detected

**Cause:** Components not deployed or named differently

**Solution:**
```bash
# Verify component exists
ls -la src/components/FirstOpinionEngineV3*

# Check if build includes new components
npm run build

# Review test output
npm run test:run
```

### Issue: URLs Fail Verification

**Cause:** Deployment incomplete or Firebase configuration issue

**Solution:**
```bash
# Verify deployment
firebase deploy --only hosting --dry-run

# Check Firebase status
firebase status

# Manual verification
curl -v https://disha.rylneuroacademy.com
curl -v https://disha-diagnostics.web.app/
```

---

## 📈 Monitoring Automation

### GitHub Actions Dashboard
```
1. Repository → Actions tab
2. Select "Automated UI Testing & Deployment"
3. View all workflow runs
4. Click any run to see details
```

### View Logs:
```
1. Click workflow run
2. Click job (test-and-deploy, cleanup-old-components, etc.)
3. Expand steps to see logs
4. Search logs for errors/warnings
```

### Download Artifacts:
```
1. Workflow run → Artifacts section
2. Download "deployment-report"
3. View markdown report
```

---

## ✅ Verification Checklist

After automation completes:

```
□ GitHub Actions workflow shows SUCCESS
□ Both URLs load successfully
□ Deployment report generated
□ No errors in workflow logs
□ New features visible in URLs
□ Old UI removed from URLs
□ Console (F12) shows no errors
□ All tests passed
□ Build succeeded
```

---

## 🎯 Next Steps

### 1. **Setup GitHub Secrets** (One-time)
```bash
firebase login:ci
# Copy token to GitHub secrets
```

### 2. **Push Code**
```bash
git add .
git commit -m "feat: Enable automated UI testing"
git push origin main
```

### 3. **Monitor Workflow**
- Go to GitHub Actions
- Watch progress in real-time
- Download final report

### 4. **Verify Live URLs**
- Visit https://disha.rylneuroacademy.com
- Visit https://disha-diagnostics.web.app/
- Confirm new features visible
- Confirm old UI removed

---

## 📚 File Reference

### Scripts Location:
```
scripts/
├── automated-ui-testing-deployment.js  ← Main testing framework
└── cleanup-old-ui.sh                   ← Interactive cleanup

.github/workflows/
└── automated-ui-deployment.yml         ← CI/CD pipeline
```

### Reports Location:
```
test_reports/
├── ui_deployment_[timestamp].json      ← Test results
└── deployment-report.md                ← Deployment summary

backups/
└── ui_cleanup_[timestamp]/             ← Old component backups
```

---

## 🚀 Running Automation

### Quick Start (3 choices):

**Option A: GitHub Actions (Automatic)**
```bash
git push origin main
# Workflow auto-triggers and runs all phases
```

**Option B: Manual Testing**
```bash
npm install puppeteer axios
node scripts/automated-ui-testing-deployment.js
```

**Option C: Interactive Cleanup**
```bash
bash scripts/cleanup-old-ui.sh
# Follow prompts
```

---

## 📞 Support

If automation fails:

1. **Check GitHub Actions logs**
   - GitHub → Actions → Workflow run → Job logs

2. **Verify Firebase credentials**
   - `firebase login`
   - `firebase login:ci`

3. **Check local build**
   - `npm run build`
   - `npm run test:run`

4. **Review deployment**
   - `firebase deploy --dry-run`

5. **Test URLs manually**
   - Open in browser
   - Check console (F12)
   - Verify features present

---

**Automation Framework Complete!** 🎉

All testing, cleanup, and deployment is now automated.
No manual browser testing needed.
Just push code and watch it deploy!
