# Connecting to Existing Google Cloud Deployment & Firestore Database

This guide is for connecting your local development environment to an **already deployed** application on Google Cloud Run and Firestore.

---

## PART 1: Gather Existing GCP Information

First, you need to collect information about your existing deployment.

### Step 1: Find Your GCP Project ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project dropdown** at the top
3. You'll see your project name and ID (e.g., `disha-diagnostic-app-12345`)
4. **Copy and save this Project ID**

Alternatively, if you know the project name:
1. In Google Cloud Console, go to **Home**
2. Look for "Project ID" under the project name

---

### Step 2: Find Your Existing Cloud Run Service

1. In Google Cloud Console, go to **Cloud Run**
2. You should see your deployed service (e.g., `disha-diagnostic-platform`)
3. Click on it to view details
4. **Note the Service Name** (you'll need this)

**Important Details to Save:**
- **Service Name:** (e.g., `disha-diagnostic-platform`)
- **Region:** (e.g., `us-central1`, `europe-west1`)
- **Service URL:** (e.g., `https://disha-diagnostic-platform-abc123.run.app`)

---

### Step 3: Find Your Existing Firestore Database

1. In Google Cloud Console, go to **Firestore**
2. You should see your database (usually named `(default)`)
3. Note the **Database ID** and **Region**

**Important Details to Save:**
- **Database Name:** (e.g., `(default)`)
- **Region:** (e.g., `us-central1`)
- **Database URL:** (e.g., `https://firestore.googleapis.com/google.firestore.v1.Firestore/disha-diagnostic-app-12345`)

---

## PART 2: Set Up Service Account with Existing Permissions

You need a service account that can deploy to your existing Cloud Run service and access Firestore.

### Option A: Use Existing Service Account (Recommended if available)

If you already have a service account used for deployment:

1. Go to **IAM & Admin → Service Accounts**
2. Find the service account (e.g., `github-actions-deployer` or similar)
3. Click on it
4. Go to **KEYS** tab
5. If a JSON key exists, you can reuse it
6. If no keys exist, click **ADD KEY → Create new key (JSON)**
7. Download the JSON file

**Verify the service account has these roles:**
- ✅ Cloud Run Admin
- ✅ Firestore Admin (or Editor)
- ✅ Service Account User
- ✅ Artifact Registry Administrator

If any role is missing, ask your GCP admin to add them.

---

### Option B: Create New Service Account (If None Exists)

If you don't have a service account:

1. Go to **IAM & Admin → Service Accounts**
2. Click **CREATE SERVICE ACCOUNT**
3. **Service account name:** `github-actions-deployer`
4. Click **CREATE AND CONTINUE**
5. **Add Roles:**
   - Cloud Run Admin
   - Firestore Admin
   - Service Account User
   - Artifact Registry Administrator
   - Container Registry Service Agent
6. Click **CONTINUE → DONE**
7. Go back to the service account, click **KEYS** tab
8. Click **ADD KEY → Create new key (JSON)**
9. Download the JSON file

---

## PART 3: Add GCP Secrets to GitHub Repository

Now you'll connect your GitHub repo to the existing GCP project.

### Step 1: Go to GitHub Repository Settings

1. Go to your repository: `https://github.com/cpdoryl/Disha-diagnostic-app`
2. Click **Settings** (top navigation)
3. In left sidebar, click **Secrets and variables → Actions**

---

### Step 2: Add GCP_PROJECT_ID Secret

1. Click **New repository secret**
2. **Name:** `GCP_PROJECT_ID`
3. **Value:** Your GCP Project ID (e.g., `disha-diagnostic-app-12345`)
4. Click **Add secret**

---

### Step 3: Add GCP_SA_KEY Secret

1. Click **New repository secret** again
2. **Name:** `GCP_SA_KEY`
3. **Value:** Open the JSON key file you downloaded, copy the **entire contents**, and paste it here

   **Example of what it looks like:**
   ```json
   {
     "type": "service_account",
     "project_id": "disha-diagnostic-app-12345",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "github-actions-deployer@disha-diagnostic-app-12345.iam.gserviceaccount.com",
     "client_id": "123456789",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
   }
   ```

4. Click **Add secret**

---

### Step 4: Verify Secrets are Added

After adding both secrets, you should see in Settings → Secrets:
```
✓ GCP_PROJECT_ID
✓ GCP_SA_KEY
```

---

## PART 4: Verify GitHub Actions Workflow

The deployment workflow should already exist in your repository.

### Step 1: Check the Workflow File

```bash
cat .github/workflows/deploy.yml
```

It should contain something like:
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v0
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
      
      - name: Build Docker image
        run: |
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/disha-app:${{ github.sha }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy disha-diagnostic-platform \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/disha-app:${{ github.sha }} \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
```

---

### Step 2: Verify Workflow Triggers

The workflow should automatically trigger when you push to `main` branch.

**To test it:**
1. Make a small change to the code
2. Commit and push: `git push origin main`
3. Go to your GitHub repo → **Actions** tab
4. You should see a workflow running
5. Wait for it to complete (✅ green checkmark means success)

---

## PART 5: Connect to Firestore Database in Code

Now you need to ensure your local code connects to the existing Firestore database.

### Step 1: Check Firebase Configuration

Open the Firebase configuration file:

```bash
cat src/lib/firebase.ts
```

It should look something like:
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "disha-diagnostic-app-12345.firebaseapp.com",
  projectId: "disha-diagnostic-app-12345",
  storageBucket: "disha-diagnostic-app-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

### Step 2: Verify Firebase Configuration Matches GCP Project

**Important:** The `projectId` in your Firebase config must match your GCP Project ID:
- `projectId: "disha-diagnostic-app-12345"` should match your GCP Project ID

**If it doesn't match:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project
3. Go to **Project Settings** (bottom left)
4. Copy the correct config
5. Update `src/lib/firebase.ts` with the correct values

---

### Step 3: Ensure Firestore Rules Allow Development Access

1. Go to Google Cloud Console → **Firestore**
2. Click on your database
3. Go to **Rules** tab
4. You should see firestore security rules

**For development, you might have:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ For development only!
    }
  }
}
```

**For production, this should be more restrictive:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /schools/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /surveys/{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## PART 6: Set Up Local Environment Variables

### Step 1: Create .env File for Firebase/Firestore

If you don't have a `.env` file yet:

```bash
cp .env.example .env
```

### Step 2: Add Firebase Configuration to .env

Add these variables to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=disha-diagnostic-app-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=disha-diagnostic-app-12345
VITE_FIREBASE_STORAGE_BUCKET=disha-diagnostic-app-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Important:** Get these values from Firebase Console → Project Settings

---

## PART 7: Start Local Development with Firestore Connection

### Step 1: Restart Development Server

```bash
# Stop the current server (Ctrl+C if running)

# Start the dev server
npm run dev
```

### Step 2: Test Firestore Connection

1. Open your app at `http://localhost:3000`
2. Open browser **Developer Console** (F12)
3. Check for any Firebase errors
4. Try performing an action that writes to Firestore:
   - Fill out a survey
   - Create a school record
   - Submit data

**In the console, you should see:**
```
✓ Firebase initialized
✓ Connected to Firestore
```

**If you see errors:**
- Check Firebase configuration in `src/lib/firebase.ts`
- Verify `.env` file has correct values
- Check Firestore security rules allow the operation

---

## PART 8: Complete Development Workflow

Now that everything is connected, here's your development workflow:

### Local Development

```bash
# 1. Make changes to your code
# Edit files in src/ folder

# 2. Test locally
# Changes auto-reload at http://localhost:3000
# Test with the real Firestore database

# 3. Check the changes
git status

# 4. Stage changes
git add .

# 5. Commit changes
git commit -m "Feat: add new assessment feature"

# 6. Push to GitHub (Automatically deploys to Cloud Run!)
git push origin main

# 7. Monitor deployment
# Go to GitHub → Actions tab
# Wait for workflow to complete (✅)

# 8. Your live app is updated!
```

---

## PART 9: Verify Everything is Connected

### Checklist:

**GitHub:**
- ✅ Repository cloned locally
- ✅ GCP_PROJECT_ID secret added
- ✅ GCP_SA_KEY secret added

**Google Cloud:**
- ✅ Cloud Run service exists and is running
- ✅ Firestore database exists
- ✅ Service account has correct permissions
- ✅ APIs enabled (Cloud Run, Firestore, Artifact Registry, Container Registry)

**Local Setup:**
- ✅ Dependencies installed (`npm install`)
- ✅ Firebase config correct in `src/lib/firebase.ts`
- ✅ `.env` file has Firebase variables
- ✅ Dev server running (`npm run dev`)
- ✅ Can access app at `http://localhost:3000`
- ✅ Can connect to Firestore from local app

**GitHub Actions:**
- ✅ Workflow file exists (`.github/workflows/deploy.yml`)
- ✅ Workflow runs when you push to main
- ✅ Workflow deploys to existing Cloud Run service

---

## PART 10: Troubleshooting

### Issue: "Failed to initialize Firebase"
**Solution:**
- Verify Firebase config in `src/lib/firebase.ts`
- Check `.env` file has `VITE_FIREBASE_*` variables
- Ensure Project ID matches between GCP and Firebase

### Issue: "Permission denied when accessing Firestore"
**Solution:**
- Check Firestore security rules allow your operation
- Verify service account has Firestore Admin role
- Check if authentication is required but user is not logged in

### Issue: "GitHub Actions deployment fails"
**Solution:**
- Check GCP_SA_KEY secret is the complete JSON (not truncated)
- Verify GCP_PROJECT_ID is correct
- Check that service account has Cloud Run Admin role
- Review the workflow logs in GitHub Actions tab

### Issue: "Cloud Run service doesn't update after push"
**Solution:**
- Wait 2-5 minutes for deployment to complete
- Check GitHub Actions workflow status
- Verify the new image was built and pushed to Container Registry
- Hard refresh your browser (Ctrl+Shift+R)

### Issue: "Local app can't connect to existing Firestore"
**Solution:**
- Verify Firebase config Project ID matches GCP Project ID
- Check Firestore security rules allow read/write from web
- Check browser console (F12) for specific Firebase errors
- Ensure `.env` file is not in `.gitignore` (if needed for CI/CD)

---

## PART 11: Security Best Practices

1. **Never commit secrets to Git:**
   - Don't add Firebase keys to code
   - Use environment variables (`.env` file)
   - Add `.env` to `.gitignore`

2. **Keep GCP Service Account Key Safe:**
   - Don't share the JSON key file
   - Rotate keys periodically
   - Only store in GitHub Secrets (encrypted)

3. **Firestore Security Rules:**
   - Don't use `allow read, write: if true;` in production
   - Implement proper authentication checks
   - Validate data before writing

4. **GitHub Repository:**
   - Keep the repo private
   - Review secrets regularly
   - Limit who has access to settings

---

## PART 12: Next Steps

You now have:
- ✅ Local VS Code connected to existing GCP deployment
- ✅ GitHub Actions set up for automatic deployment
- ✅ Firestore database connected for real-time development
- ✅ Complete development workflow configured

**You can now:**
1. Make changes locally
2. Test with real Firestore data
3. Push to GitHub
4. Automatic deployment to existing Cloud Run service
5. See changes live on your deployed app

---

## Quick Reference Commands

```bash
# Check status of changes
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub (triggers deployment)
git push origin main

# View commit history
git log --oneline

# Start development server
npm run dev

# Build for production
npm build

# Check for errors
npm run lint
```

**Happy developing! 🚀**
