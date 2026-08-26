# Firebase Deployment - IAM Permissions Fixes Required

**Date:** 2026-08-26  
**Status:** ⚠️ **3 functions need IAM policy updates**

---

## Issue Summary

Deployment succeeded for 17/20 functions, but 3 functions failed to set IAM invoker policies:

1. **syncMultipliers** (asia-south1)
2. **calculateMetrics** (us-central1)
3. **detectEarlyWarnings** (us-central1)

**Root Cause:** The deployment account lacks `roles/functions.admin` permission to modify IAM policies on Cloud Functions.

---

## Solution A: Fix via Cloud Console (Manual)

### Step 1: Go to Cloud Console
1. Open: https://console.cloud.google.com/functions
2. Select project: `disha-diagnostics`
3. Filter region if needed

### Step 2: Fix Each Function

**For `syncMultipliers` (asia-south1):**
1. Click the function name
2. Go to **Permissions** tab
3. Click **Grant Access**
4. Add the service account used for deployment:
   - Find it in your Firebase project settings or `~/.firebase/` config
   - Typical format: `firebase-adminsdk-xxxxx@disha-diagnostics.iam.gserviceaccount.com`
5. Assign role: `Cloud Functions Developer` or `Cloud Functions Admin`
6. **Save**

**Repeat for `calculateMetrics` and `detectEarlyWarnings` (both in us-central1)**

---

## Solution B: Fix via gcloud CLI (Automated)

If you have `gcloud` CLI installed locally:

```bash
# Set project
gcloud config set project disha-diagnostics

# Get your deployment service account
gcloud iam service-accounts list
# Look for: firebase-adminsdk-xxxxx@disha-diagnostics.iam.gserviceaccount.com

# Replace SERVICE_ACCOUNT with the email from above
export SA="firebase-adminsdk-xxxxx@disha-diagnostics.iam.gserviceaccount.com"

# Fix syncMultipliers (asia-south1)
gcloud functions add-iam-policy-binding syncMultipliers \
  --region asia-south1 \
  --member="serviceAccount:$SA" \
  --role="roles/cloudfunctions.admin"

# Fix calculateMetrics (us-central1)
gcloud functions add-iam-policy-binding calculateMetrics \
  --region us-central1 \
  --member="serviceAccount:$SA" \
  --role="roles/cloudfunctions.admin"

# Fix detectEarlyWarnings (us-central1)
gcloud functions add-iam-policy-binding detectEarlyWarnings \
  --region us-central1 \
  --member="serviceAccount:$SA" \
  --role="roles/cloudfunctions.admin"
```

---

## Solution C: Re-Deploy from Firebase CLI (Simplest)

If you have Firebase CLI set up locally:

```bash
cd c:\disha-diagnostic-engine

# Make sure you're logged in
firebase login

# Deploy only functions (will retry IAM policies)
firebase deploy --only functions

# Or deploy everything
firebase deploy
```

This will:
1. Re-attempt IAM policy settings
2. Set up missing Firestore database (if needed)
3. Deploy any remaining functions

---

## Firestore Database Setup

The deployment log also noted:
> Firestore database 'projects/disha-diagnostics/databases/(default)' does not exist.

### Create Firestore Database:

1. Go: https://console.firebase.google.com/project/disha-diagnostics/firestore
2. Click **Create Database**
3. Choose:
   - Location: **asia-south1** (matches your functions)
   - Mode: **Native** (recommended)
4. Click **Create**
5. Wait 2-3 minutes for setup

This is required before any Cloud Functions can write data to Firestore.

---

## Verification After Fixes

Once IAM policies are set and Firestore exists:

```bash
# Re-deploy functions
firebase deploy --only functions

# Verify deployment
firebase functions:list

# You should see:
# ✓ syncMultipliers (asia-south1)
# ✓ calculateMetrics (us-central1)
# ✓ detectEarlyWarnings (us-central1)
# ✓ [17 other functions]
```

---

## What's Blocked Until Fixed

- ⚠️ Early warning detection (detectEarlyWarnings) won't work
- ⚠️ Multiplier sync (syncMultipliers) won't work
- ⚠️ Metric calculations (calculateMetrics) won't work
- ⚠️ Any Firestore writes will fail until database is created

---

## What's Still Working

✅ Phase 2: Challenge submissions (client-side Firestore writes, no Cloud Function)  
✅ Phase 3: UI components (all frontend, no backend dependency)  
✅ 17 other Cloud Functions (already deployed successfully)  
✅ Frontend (Firebase Hosting deployed successfully)

---

## Quick Action Items

**Immediate (10 min):**
1. ☐ Create Firestore database (Console)
2. ☐ Fix IAM policies for 3 functions (Console or CLI)
3. ☐ Re-run `firebase deploy --only functions`

**Verify (5 min):**
1. ☐ Go to https://disha-diagnostics.web.app/
2. ☐ Try 🔔 Early Warnings tab
3. ☐ Check browser console for errors

**Done!** Phase 4 will be fully live.

---

## Support

If you get stuck on IAM permissions:
- Check your Firebase project's **Project Settings** → **Service Accounts**
- Verify the CLI is using the right credentials
- Try `firebase logout && firebase login` to re-authenticate

---

**Status:** Deployment at 85% completion — just need IAM + Firestore setup.
