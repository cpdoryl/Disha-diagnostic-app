# Complete Guide: GitHub Sync, Local VS Code Setup, & Automated Cloud Run Deployment (GitHub Actions)

This guide provides a step-by-step walkthrough to connect the **DISHA Diagnostic Platform** codebase to your GitHub repository, sync and run locally in VS Code, and set up continuous deployment to Google Cloud Run via GitHub Actions.

---

## Part 1: Connecting AI Studio Application to Your GitHub Repository

### Option A: Using AI Studio Export Menu (Recommended & Easiest)
1. In the top toolbar/header menu of **AI Studio Build**, click on the **Settings / Share / Export** icon (or top-right project options menu).
2. Click **Export to GitHub** or **Download ZIP**.
3. If using **Export to GitHub**: Select your GitHub account and target repository (`rylneuroacademy/...`).
4. If using **Download ZIP**: Extract the ZIP file into a local folder on your computer.

---

## Part 2: Local VS Code Setup & Synchronisation

### Step 1: Open Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File -> Open Folder...** and select your extracted/cloned project folder.
3. Open the built-in terminal in VS Code:
   * **Keyboard Shortcut:** `Ctrl + ~` (Windows/Linux) or `Cmd + ~` (Mac).

### Step 2: Initialize Git & Link Remote Repository (If not already cloned)
Run these commands in your VS Code terminal:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "Initial commit: DISHA Diagnostic Platform with Cloud Run & Firestore"

# 4. Set main branch name
git branch -M main

# 5. Connect to your GitHub repository URL (Replace with your actual GitHub repo URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main --force
```

### Step 3: Install Dependencies & Run Locally
```bash
# Install Node.js dependencies
npm install

# Start local development server
npm run dev
```
Your application will be live locally at `http://localhost:3000`.

---

## Part 3: Daily VS Code Development Workflow

Whenever you make changes locally in VS Code:

```bash
# 1. Check changed files
git status

# 2. Stage all changes
git add .

# 3. Commit changes with a descriptive message
git commit -m "Feat: updated diagnostic dashboard and report styles"

# 4. Push changes to GitHub (Triggers automatic Cloud Run deployment!)
git push origin main
```

---

## Part 4: Automated Deployment to Google Cloud Run via GitHub Actions

This repository includes a pre-configured GitHub Actions workflow located at `.github/workflows/deploy.yml` and a production `Dockerfile`.

### Step 1: Create a Service Account in Google Cloud Console
1. Go to [Google Cloud IAM & Admin -> Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts).
2. Click **Create Service Account**:
   * Name: `github-actions-deployer`
3. Grant the following Roles to this Service Account:
   * **Cloud Run Admin**
   * **Storage Admin**
   * **Service Account User**
   * **Artifact Registry Administrator** / **Container Registry Admin**
4. Click on the created Service Account -> Go to **Keys** tab -> Click **Add Key -> Create New Key (JSON)**.
5. Download the JSON key file to your computer.

### Step 2: Add Secrets to Your GitHub Repository
1. Go to your repository on GitHub (`https://github.com/YOUR_USERNAME/YOUR_REPO`).
2. Navigate to **Settings -> Secrets and variables -> Actions**.
3. Click **New repository secret**:

| Secret Name | Value |
| :--- | :--- |
| `GCP_PROJECT_ID` | Your Google Cloud Project ID (e.g. `ai-studio-dishadiagnostice-63fe1b2b-7f23-4689-aa1a-cd41267d5918`) |
| `GCP_SA_KEY` | Paste the **entire raw JSON content** of the key file downloaded in Step 1 |

### Step 3: Verify Automated Deployment
Every time you push new code to the `main` branch (`git push origin main`), GitHub Actions will:
1. Automatically build the production Docker image.
2. Push the image to Google Container Registry (GCR).
3. Deploy the new image to Google Cloud Run seamlessly!
