# Manual GitHub Actions Deployment Guide

**Problem**: GitHub Actions workflow not showing up  
**Reason**: Likely secrets not configured or workflow not enabled  
**Solution**: Manual trigger + Configure secrets

---

## ✅ Step 1: Check if Workflow is Enabled

1. Go to: https://github.com/cpdoryl/Disha-diagnostic-app/actions
2. Look at the left sidebar
3. You should see "Build & Deploy" workflow listed
4. If you don't see it:
   - Go to: Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is selected

---

## ✅ Step 2: Configure Required Secrets

GitHub Actions needs credentials to deploy to Firebase. You must add these secrets:

### Secret 1: FIREBASE_PROJECT_ID

1. Go to: https://github.com/cpdoryl/Disha-diagnostic-app/settings/secrets/actions
2. Click "New repository secret"
3. **Name**: `FIREBASE_PROJECT_ID`
4. **Value**: `disha-diagnostics`
5. Click "Add secret"

### Secret 2: FIREBASE_CI_TOKEN

1. Go to: https://github.com/cpdoryl/Disha-diagnostic-app/settings/secrets/actions
2. Click "New repository secret"
3. **Name**: `FIREBASE_CI_TOKEN`
4. **Value**: [You need to generate this from Firebase]

---

## ✅ Step 3: Generate Firebase CI Token

To get the Firebase CI Token:

### Option A: Using Firebase CLI (Recommended)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login:ci

# This will open a browser and ask for authorization
# After authorizing, it will generate a token
# Copy the token and paste it as FIREBASE_CI_TOKEN secret
```

### Option B: Manual Token Generation

1. Go to: https://console.firebase.google.com/project/disha-diagnostics/settings/serviceaccounts/adminsdk
2. Click "Generate New Private Key"
3. Download the JSON file
4. Copy the entire JSON content
5. Paste as `FIREBASE_CI_TOKEN`

---

## ✅ Step 4: Manually Trigger Workflow

Once secrets are configured:

1. Go to: https://github.com/cpdoryl/Disha-diagnostic-app/actions
2. Click "Build & Deploy" workflow on the left
3. Click "Run workflow" button (top right)
4. Select branch: `main`
5. Click "Run workflow"

**Status**: Workflow will start building and deploying

---

## ✅ Step 5: Monitor Deployment

1. Refresh the Actions page
2. You should see a yellow circle (in progress)
3. Click on it to see:
   - Build Job logs
   - Deploy Job logs
   - Error messages (if any)

**Timeline**:
- 5-10 min: Build job
- 2-5 min: Deploy job
- Total: ~15 minutes

---

## ✅ If Still Not Working

### Issue: "Permission denied" or "401 Unauthorized"

**Cause**: Firebase token is invalid or expired

**Fix**:
```bash
# Re-generate token
firebase login:ci --no-localhost
# Copy new token and update FIREBASE_CI_TOKEN secret
```

### Issue: Build fails with npm errors

**Cause**: Dependencies or Node version issue

**Fix**:
```bash
# Verify locally
npm install --legacy-peer-deps
npm run build
```

### Issue: "Deploy failed - no build artifacts"

**Cause**: Build directory not created

**Fix**:
- Check build logs for errors
- Verify `npm run build` works locally
- Check if vite.config.ts has correct output directory

---

## ✅ Manual Build & Deploy (Alternative)

If GitHub Actions fails, you can deploy manually:

```bash
# 1. Build locally
npm run build

# 2. Install Firebase CLI
npm install -g firebase-tools

# 3. Login to Firebase
firebase login

# 4. Deploy to Firebase
firebase deploy --project=disha-diagnostics

# Your app will be live at:
# https://disha-diagnostics.web.app/
```

---

## ✅ Verify Deployment Success

After workflow completes (or manual deploy):

1. Check Firebase Hosting:
   https://console.firebase.google.com/project/disha-diagnostics/hosting/sites

2. Visit your live app:
   https://disha-diagnostics.web.app/

3. Verify it loads and functions work

---

## 📞 Troubleshooting Checklist

- [ ] Workflow file exists: `.github/workflows/test-and-deploy.yml`
- [ ] GitHub Actions enabled in Settings
- [ ] FIREBASE_PROJECT_ID secret configured
- [ ] FIREBASE_CI_TOKEN secret configured
- [ ] Token is valid and not expired
- [ ] Local build works: `npm run build`
- [ ] Build directory created: `./build/`
- [ ] Firebase CLI installed globally
- [ ] Firebase project active: `disha-diagnostics`

---

## Quick Commands

```bash
# Check workflow file
cat .github/workflows/test-and-deploy.yml

# Test build locally
npm run build

# Test deploy locally (requires firebase login)
firebase deploy --project=disha-diagnostics

# Check Firebase project
firebase projects:list
```

---

**Once secrets are configured, GitHub Actions will automatically deploy on every push to main!**

---

Need help? Follow these steps and let me know what you see!
