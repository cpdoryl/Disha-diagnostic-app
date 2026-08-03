# GitHub Actions Setup Guide

## Overview

This guide explains how to set up GitHub Actions for automated deployment of the DISHA Diagnostic Engine to Firebase.

---

## Required Secrets

You need to configure the following secrets in your GitHub repository:

### 1. Firebase Configuration

**FIREBASE_PROJECT_ID**
- Value: `disha-diagnostics`
- Description: Your Firebase project ID
- Where to find: Firebase Console → Project Settings

**FIREBASE_TOKEN**
- Value: Generate using Firebase CLI
- How to generate:
  ```bash
  firebase login:ci
  ```
- Description: CI token for Firebase authentication
- Store in: GitHub Secrets

### 2. Google Cloud Workload Identity Federation

**WIF_PROVIDER**
- Value: Workload Identity Federation provider ID
- Description: GCP identity provider for GitHub Actions
- Format: `projects/{project-number}/locations/global/workloadIdentityPools/{pool-id}/providers/{provider-id}`

**WIF_SERVICE_ACCOUNT**
- Value: Service account email
- Description: GCP service account for deployment
- Format: `{name}@{project}.iam.gserviceaccount.com`

### 3. Notifications (Optional)

**SLACK_WEBHOOK_URL**
- Value: Your Slack incoming webhook URL
- Description: For deployment notifications
- Where to find: Slack App → Incoming Webhooks
- Optional: If not set, Slack notifications will be skipped

---

## Setup Instructions

### Step 1: Create GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret from the list above

### Step 2: Generate Firebase Token

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login:ci

# This will generate a token - copy it
# Store it as FIREBASE_TOKEN secret in GitHub
```

### Step 3: Set Up Workload Identity Federation (Optional but Recommended)

For more secure authentication without storing tokens:

```bash
# Follow Google Cloud documentation:
# https://cloud.google.com/docs/authentication/workload-identity-federation

# Create a service account:
gcloud iam service-accounts create github-actions \
  --project=disha-diagnostics

# Grant necessary permissions:
gcloud projects add-iam-policy-binding disha-diagnostics \
  --member="serviceAccount:github-actions@disha-diagnostics.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"
```

### Step 4: Configure Slack Notifications (Optional)

1. Create a Slack incoming webhook:
   - Go to Slack App Directory → Incoming Webhooks
   - Click "Add to Slack"
   - Choose your workspace and channel
   - Copy the webhook URL

2. Add as secret:
   - GitHub Settings → Secrets → New repository secret
   - Name: `SLACK_WEBHOOK_URL`
   - Value: Your webhook URL

---

## Workflows

### 1. CI/CD Pipeline (`ci-cd-pipeline.yml`)

Runs on every push and pull request:
- ✅ Code quality checks (linting, security audit)
- ✅ Build verification
- ✅ Tests execution
- ✅ Staging deployment (develop branch)
- ✅ Production deployment (main branch)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Manual trigger via GitHub Actions

**Steps:**
1. Code quality checks
2. Build verification
3. Run tests
4. Deploy to staging (if develop)
5. Deploy to production (if main)
6. Slack notifications

### 2. Firebase Deployment (`deploy-firebase.yml`)

Dedicated Firebase deployment workflow:
- ✅ Deploy Cloud Functions
- ✅ Deploy Firestore security rules
- ✅ Verification

**Triggers:**
- Push to `main`
- Manual trigger

### 3. Hosting Deployment (`deploy-hosting.yml`)

Dedicated Firebase Hosting deployment:
- ✅ Build application
- ✅ Run tests
- ✅ Deploy to hosting
- ✅ Preview URLs for PRs

**Triggers:**
- Push to `main`
- Pull requests
- Manual trigger

---

## Deployment Flow

```
GitHub Push (main branch)
        ↓
Quality Checks (Lint, Security)
        ↓
Build & Tests
        ↓
Deploy to Firebase Hosting
        ↓
Deploy Cloud Functions
        ↓
Deploy Security Rules
        ↓
Slack Notification
        ↓
Production Live ✅
```

---

## Environment Variables

### GitHub Environment Variables

Variables are set automatically in workflows:

```yaml
NODE_VERSION: '18'
FIREBASE_PROJECT_ID: disha-diagnostics
```

### Firebase Configuration

- `.firebaserc`: Contains project ID
- `firebase.json`: Contains deployment targets

---

## Manual Deployment

If needed, you can manually trigger workflows:

1. Go to GitHub repository
2. Click **Actions**
3. Select workflow (CI/CD Pipeline, Deploy Firebase, etc.)
4. Click **Run workflow**

---

## Troubleshooting

### Workflow Fails with "Permission Denied"

**Solution:**
1. Verify secrets are correctly set
2. Check service account has necessary permissions
3. Regenerate Firebase token:
   ```bash
   firebase logout
   firebase login:ci
   ```

### Firebase Deployment Times Out

**Solution:**
1. Increase workflow timeout (default: 360 minutes)
2. Check Firebase Cloud Functions build logs
3. Verify functions compile correctly locally

### Slack Notifications Not Received

**Solution:**
1. Verify `SLACK_WEBHOOK_URL` is set
2. Check webhook is active in Slack
3. Verify channel still exists

### Build Fails

**Solution:**
1. Run `npm run build` locally to reproduce
2. Check for TypeScript errors: `npm run type-check`
3. Run linter: `npm run lint`

---

## Security Best Practices

✅ **Do:**
- Rotate Firebase tokens periodically
- Use Workload Identity Federation instead of tokens when possible
- Review secrets access regularly
- Enable branch protection rules
- Require status checks before merge

❌ **Don't:**
- Commit secrets to repository
- Share secrets across repositories
- Use same credentials for multiple environments
- Disable security checks for convenience

---

## Monitoring Deployments

### GitHub Actions Dashboard

1. Go to **Actions** tab in repository
2. View workflow runs
3. Click run to see details
4. Check logs for any issues

### Firebase Console

Monitor deployments:
1. Firebase Console → Functions
2. Firebase Console → Hosting
3. Firebase Console → Firestore

### Slack Notifications

Receive alerts when:
- ✅ Deployment succeeds
- ❌ Deployment fails
- ⚠️ Tests fail

---

## Production Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan passed
- [ ] Branch protection enabled
- [ ] Slack notifications configured
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Team notified

---

## Rollback

If production deployment has issues:

1. **Immediate rollback:**
   - Revert commit: `git revert <commit-hash>`
   - Push to main
   - GitHub Actions automatically redeploys previous version

2. **Manual rollback:**
   - Firebase Console → Hosting → Versions
   - Select previous version
   - Click "Promote"

---

## Cost Optimization

**GitHub Actions:**
- Free tier: 2,000 minutes/month
- Our typical build: ~5-10 minutes
- Budget: ~200-400 builds/month (plenty!)

**Firebase:**
- Free tier includes hosting
- Cloud Functions on Blaze plan (pay-as-you-go)
- Typical cost: $10-30/month

---

## Next Steps

1. ✅ Set up all required secrets
2. ✅ Test workflows manually
3. ✅ Monitor first few deployments
4. ✅ Adjust as needed
5. ✅ Document team procedures

---

## Support

For issues:
1. Check GitHub Actions logs
2. Verify secrets are set
3. Test locally: `npm run build`
4. Contact platform team

---

**Deployment automation is now ready! 🚀**

All changes to `main` branch will automatically:
- ✅ Run tests
- ✅ Deploy to Firebase
- ✅ Update live app
- ✅ Notify team on Slack

No manual deployment steps needed!
