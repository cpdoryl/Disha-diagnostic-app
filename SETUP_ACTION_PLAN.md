# Setup Action Plan - Complete Steps to Enable Automatic Deployment

Your app is already deployed at: **https://disha-diagnostic-engine.ai.studio**

Now we'll connect your local development and GitHub to enable automatic deployment.

---

## 📊 Current Status

✅ **Already Done:**
- Firebase configuration is correct in `firebase-applet-config.json`
- App is deployed on Cloud Run
- Firestore database is ready
- Local development server is running

⏳ **Still Needed:**
1. Create Service Account JSON key for GitHub Actions
2. Add GitHub secrets (GCP_PROJECT_ID and GCP_SA_KEY)
3. Verify GitHub Actions workflow
4. Test automatic deployment

---

## PART 1: Create Service Account JSON Key for GitHub Actions

Since there's no existing JSON key, we need to create one. I recommend using the **firebase-adminsdk** service account because it already has Firebase permissions.

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in project: **disha-diagnostics**
3. Click **≡ Menu** (hamburger icon) in top left
4. Go to **IAM & Admin → Service Accounts**

### Step 2: Find the Firebase Admin Service Account

Look for: `firebase-adminsdk-fbsvc@disha-diagnostics.iam.gserviceaccount.com`

Click on it to open its details.

### Step 3: Add Additional Roles (if needed)

Before creating the key, make sure this service account has these roles:

Go to **IAM & Admin → IAM** and find the service account email. Check if it has:
- ✅ Cloud Run Admin
- ✅ Firebase Admin
- ✅ Service Account User
- ✅ Artifact Registry Administrator

If any role is missing, click **EDIT** and add it.

### Step 4: Create and Download JSON Key

1. Back on the service account page, go to **KEYS** tab

2. Click **ADD KEY → Create new key**

3. Select **JSON** format

4. Click **CREATE**

5. A JSON file will automatically download (e.g., `disha-diagnostics-abc123.json`)

6. **Keep this file safe!** You'll use it in the next step.

### Example of what the JSON key looks like:
```json
{
  "type": "service_account",
  "project_id": "disha-diagnostics",
  "private_key_id": "abc123def456",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@disha-diagnostics.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

---

## PART 2: Add GitHub Secrets

Now you'll tell GitHub your GCP credentials for automatic deployment.

### Step 1: Open Your GitHub Repository

Go to: https://github.com/cpdoryl/Disha-diagnostic-app

### Step 2: Go to Secrets Settings

1. Click **Settings** (top navigation bar)
2. In left sidebar, click **Secrets and variables → Actions**

### Step 3: Add First Secret - GCP_PROJECT_ID

1. Click **New repository secret** (green button)
2. **Name:** `GCP_PROJECT_ID`
3. **Value:** `disha-diagnostics`
4. Click **Add secret**

### Step 4: Add Second Secret - GCP_SA_KEY

1. Click **New repository secret** again
2. **Name:** `GCP_SA_KEY`
3. **Value:** Open the JSON key file you downloaded:
   - Open it in a text editor
   - **Copy the entire contents** (the whole JSON)
   - Paste it here
4. Click **Add secret**

### After Adding Both Secrets:

In **Settings → Secrets and variables → Actions**, you should see:
```
✓ GCP_PROJECT_ID
✓ GCP_SA_KEY
```

---

## PART 3: Verify GitHub Actions Workflow

Your repository already has a deployment workflow configured.

### Step 1: Check the Workflow File

In your VS Code terminal:

```bash
cat .github/workflows/deploy.yml
```

This file tells GitHub what to do when you push code.

### Step 2: Test Automatic Deployment

Now let's test that everything works!

1. **Make a small test change** to your code:
   ```bash
   # Edit a file (e.g., add a comment to README.md)
   echo "# Test deployment at $(date)" >> README.md
   ```

2. **Commit the change:**
   ```bash
   git add README.md
   git commit -m "Test: verify automatic deployment workflow"
   ```

3. **Push to GitHub:**
   ```bash
   git push origin main
   ```

4. **Monitor the deployment:**
   - Go to your GitHub repo
   - Click **Actions** tab (top navigation)
   - You should see a workflow running
   - Watch it progress through these stages:
     - ✅ Checkout code
     - ✅ Authenticate with GCP
     - ✅ Build Docker image
     - ✅ Push to Container Registry
     - ✅ Deploy to Cloud Run

5. **Wait for completion:**
   - When you see a ✅ green checkmark, deployment succeeded!
   - This usually takes 2-5 minutes

6. **Verify the change is live:**
   - Go to your live app: https://disha-diagnostic-engine.ai.studio
   - Hard refresh (Ctrl+Shift+R)
   - You should see your changes live!

---

## PART 4: Verify Firestore Connection in Development

Your local development is already connected to Firestore!

### Test Firestore Connection

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your app at `http://localhost:3000`

3. Open browser Developer Console (F12)

4. Try an action that saves to Firestore:
   - Fill out a survey
   - Create a school record
   - Submit assessment data

5. Check the console for messages:
   - You should NOT see Firebase errors
   - Data should save successfully

6. Verify data in Firestore:
   - Open [Google Cloud Console](https://console.cloud.google.com/)
   - Go to **Firestore**
   - Click on your database
   - Check the **Data** tab
   - You should see collections like `schools`, `surveys`, etc.
   - Your test data should appear there

---

## PART 5: Complete Development Workflow

Now you have everything set up! Here's how to work:

### Daily Development Cycle

```bash
# 1. Make changes to your code
# Edit files in src/ folder

# 2. Test locally
npm run dev
# App auto-refreshes at http://localhost:3000
# Data saves to real Firestore database

# 3. Verify changes work
# Test all features locally
# Check Firestore for saved data

# 4. When satisfied, push to GitHub

# 5. Stage your changes
git add .

# 6. Commit with descriptive message
git commit -m "Feat: add new assessment feature"

# 7. Push to GitHub
git push origin main

# 8. GitHub Actions automatically:
#    - Builds Docker image
#    - Deploys to Cloud Run
#    - Your app is live!

# 9. Monitor deployment
# Go to GitHub → Actions tab
# Wait for ✅ green checkmark
```

---

## PART 6: Troubleshooting

### Issue: GitHub Actions workflow doesn't start

**Solution:**
- Make sure both secrets are added correctly:
  - `GCP_PROJECT_ID` should be: `disha-diagnostics`
  - `GCP_SA_KEY` should be the complete JSON content
- Double-check the secrets in GitHub Settings

### Issue: Deployment fails with "Permission denied"

**Solution:**
- The service account might not have all required roles
- Check that `firebase-adminsdk-fbsvc@disha-diagnostics.iam.gserviceaccount.com` has:
  - ✅ Cloud Run Admin
  - ✅ Firebase Admin
  - ✅ Service Account User
  - ✅ Artifact Registry Administrator

### Issue: Changes don't appear on live app after deployment

**Solution:**
- Wait 2-5 minutes for deployment to complete
- Hard refresh your browser (Ctrl+Shift+R)
- Check GitHub Actions workflow completed with ✅
- Check Cloud Run for any error messages

### Issue: Firestore connection error in local development

**Solution:**
- Verify Firebase config is correct in `firebase-applet-config.json`
- Check browser console (F12) for specific Firebase errors
- Make sure Firestore security rules allow your operations
- Verify you're connected to the internet

### Issue: "No JSON key" when setting up service account

**Solution (What we're doing):**
- Go to the service account details
- Click **KEYS** tab
- Click **ADD KEY → Create new key**
- Select JSON format
- The file will automatically download

---

## SUMMARY CHECKLIST

Use this checklist to track your progress:

```
SETUP PROGRESS TRACKER
═══════════════════════════════════════════════════════

☐ Step 1: Create Service Account JSON Key
  └─ Open Google Cloud Console
  └─ Go to Service Accounts
  └─ Find: firebase-adminsdk-fbsvc@disha-diagnostics.iam.gserviceaccount.com
  └─ Go to KEYS tab
  └─ Create new JSON key
  └─ Download the JSON file

☐ Step 2: Add GitHub Secrets
  └─ Go to GitHub repository settings
  └─ Add secret: GCP_PROJECT_ID = disha-diagnostics
  └─ Add secret: GCP_SA_KEY = (entire JSON content)

☐ Step 3: Verify Workflow
  └─ Check .github/workflows/deploy.yml exists
  └─ Verify GitHub Actions tab shows the workflow

☐ Step 4: Test Automatic Deployment
  └─ Make a test change
  └─ Commit and push
  └─ Watch GitHub Actions workflow run
  └─ Verify deployment completed (✅)
  └─ Check live app for changes

☐ Step 5: Test Firestore Connection
  └─ Start dev server (npm run dev)
  └─ Test saving data in local app
  └─ Verify data appears in Firestore console

✅ Complete! Your app is now set up for automatic deployment!
```

---

## QUICK REFERENCE

| Item | Value |
|------|-------|
| GCP Project ID | disha-diagnostics |
| Cloud Run Service | disha-diagnostic-engine |
| Cloud Run Region | asia-south1 |
| Live App URL | https://disha-diagnostic-engine.ai.studio |
| Firestore DB | ai-studio-dishadiagnostice-63fe1b2b-7f23-4689-aa1a-cd41267d5918 |
| Firestore Region | asia-south1 |
| Firebase Project ID | disha-diagnostics |
| Service Account | firebase-adminsdk-fbsvc@disha-diagnostics.iam.gserviceaccount.com |
| Local Dev Server | http://localhost:3000 |

---

## NEXT STEPS

1. **Right now:** Create the Service Account JSON key (Part 1 above)
2. **Then:** Add GitHub secrets (Part 2 above)
3. **Then:** Test automatic deployment (Part 3 above)
4. **Finally:** Test Firestore connection (Part 4 above)

Once you complete these steps, reply with:
- ✅ Service Account JSON key created
- ✅ GitHub secrets added
- ✅ Test deployment successful

Then we'll verify everything is working! 🚀
