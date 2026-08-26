# GitHub Secrets - Quick Setup Guide

## ⚠️ Why Workflows Are Failing

All 4 GitHub Actions workflows failed because **GitHub Secrets are not configured**. The workflows need authentication credentials to deploy to Firebase.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Go to GitHub Repository Settings

URL: https://github.com/cpdoryl/Disha-diagnostic-app/settings/secrets/actions

### Step 2: Add Required Secrets

Click **"New repository secret"** and add:

#### Secret 1: FIREBASE_PROJECT_ID
```
Name: FIREBASE_PROJECT_ID
Value: disha-diagnostics
```

#### Secret 2: FIREBASE_TOKEN (Required for deployment)
```
Name: FIREBASE_TOKEN
Value: (Generate using command below)
```

**To generate FIREBASE_TOKEN:**
```bash
firebase login:ci
```
Copy the token output and paste it here.

#### Secret 3: WIF_PROVIDER (Optional, for Workload Identity)
```
Name: WIF_PROVIDER
Value: (From Google Cloud Console - optional)
```

#### Secret 4: WIF_SERVICE_ACCOUNT (Optional, for Workload Identity)
```
Name: WIF_SERVICE_ACCOUNT
Value: (From Google Cloud - optional)
```

#### Secret 5: SLACK_WEBHOOK_URL (Optional, for notifications)
```
Name: SLACK_WEBHOOK_URL
Value: (Your Slack webhook URL - optional)
```

---

## 📸 Visual Steps

### Step 1: Open Settings Tab
```
GitHub Repository Page
  → Settings (top menu)
  → Secrets and variables (left sidebar)
  → Actions
```

### Step 2: Click "New repository secret"
Green button in top right

### Step 3: Add Each Secret
- Name: (exact names above)
- Value: (your values)
- Click "Add secret"

### Step 4: Repeat for all secrets

---

## 🔑 Getting Firebase Token

Run this in your terminal:

```bash
# Make sure you're logged into Firebase locally
firebase login:ci

# Copy the token from output
# It looks like: 1//0g...xyz...abc
```

Then paste that token as the FIREBASE_TOKEN secret value.

---

## ✨ After Adding Secrets

1. Go back to GitHub Actions tab
2. Make a test push to main branch
3. Workflows will automatically run
4. They should complete successfully now

**Test push command:**
```bash
git commit --allow-empty -m "Test: Verify GitHub Actions workflows"
git push origin main
```

---

## ⚠️ Common Issues

### "Workflow still failing after adding secrets"
- Make sure secret NAMES are EXACTLY as listed (case-sensitive)
- Try making a fresh commit after adding all secrets
- Check the "Actions" tab to see detailed error logs

### "Can't find firebase login:ci command"
- Install Firebase CLI: `npm install -g firebase-tools`
- Login: `firebase login`
- Then run: `firebase login:ci`

### "Workflows not running"
- Refresh the GitHub page
- Make a new commit: `git commit --allow-empty -m "Trigger workflows"`
- Push: `git push origin main`

---

## 📋 Verification Checklist

After adding secrets, verify:

- [ ] FIREBASE_PROJECT_ID is set
- [ ] FIREBASE_TOKEN is set
- [ ] At least one secret shows in the Secrets list
- [ ] Secrets are marked as "Updated recently"

Then make a test push and check if workflows pass.

---

## 🎯 Expected Behavior After Setup

**On next push to main:**
1. GitHub Actions automatically runs
2. Tests execute
3. Cloud Functions deploy
4. Frontend updates
5. Live app refreshed (5-10 minutes)
6. Team notified via Slack (if webhook added)

---

**Currently:**
- ✅ Code committed to GitHub
- ✅ Workflows configured
- ⏳ GitHub Secrets needed (THIS STEP)
- ⏳ Then workflows will run and deploy

---

## Quick Links

- GitHub Secrets: https://github.com/cpdoryl/Disha-diagnostic-app/settings/secrets/actions
- GitHub Actions: https://github.com/cpdoryl/Disha-diagnostic-app/actions
- Firebase CLI Docs: https://firebase.google.com/docs/cli

---

## Need Help?

Check these files for more details:
- `.github/GITHUB_ACTIONS_SETUP.md` - Complete setup guide
- `GITHUB_ACTIONS_DEPLOYMENT_SUMMARY.md` - Full overview
- `PUSH_TO_GIT_COMPLETE.txt` - What's been deployed

---

**Time to complete: 5 minutes**

Then workflows will deploy automatically! 🚀
