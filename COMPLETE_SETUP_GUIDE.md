# Complete Development & Deployment Guide for Disha Diagnostic Platform

---

## PART 1: LOCAL DEVELOPMENT WORKFLOW

### Step 1: Making Changes in the `src/` Folder

The source code is organized in the `src/` folder:

```
src/
├── App.tsx                 # Main application component
├── main.tsx               # Entry point
├── pages/                 # Page components (Dashboard, Login, etc.)
├── components/            # Reusable UI components
├── lib/                   # Utility functions and services
├── types.ts              # TypeScript type definitions
├── store.ts              # State management (Zustand)
└── index.css             # Global styles
```

**To make changes:**

1. Open any file in the `src/` folder using VS Code
2. Edit the file (e.g., update a component, add a new feature)
3. **Save the file** (Ctrl+S)
4. The dev server will automatically reload your changes in the browser

**Example: Editing a Component**

Let's say you want to modify the Dashboard page:

```bash
# Open the file in VS Code
src/pages/Dashboard.tsx
```

Change something (e.g., update a title or add a button), save it, and you'll see the changes instantly in `http://localhost:3000`

---

### Step 2: Understanding Auto-Reload (Hot Module Replacement)

**What Happens:**
- When you save a file in `src/`, Vite detects the change
- The dev server instantly reloads only the changed component
- Your browser automatically updates without full page refresh

**Why This Matters:**
- You keep your application state while developing
- Faster feedback loop for testing
- No need to manually refresh the browser

---

### Step 3: Testing Diagnostic Features, Assessments & Dashboards

The Disha Platform includes several key features to test:

#### A. Public Survey / Checkup
- Navigate to the **Public Survey** page
- Fill out the diagnostic questions
- Verify the survey works and stores responses

#### B. Deep Dive Assessment
- Access the deeper assessment module
- Test multi-step assessment flow
- Verify data calculations and scoring

#### C. Dashboard
- View aggregated results
- Check charts and data visualization
- Verify school statistics and metrics

#### D. Admin Panel
- Test user management
- Review collected survey data
- Test communications features

**Testing Checklist:**
- [ ] Navigate between different pages
- [ ] Submit form data
- [ ] Check browser console for errors (F12)
- [ ] Test on different screen sizes (responsive design)
- [ ] Verify all calculations are correct
- [ ] Test Firebase data persistence (if configured)

---

## PART 2: PRODUCTION DEPLOYMENT SETUP (Google Cloud Run + GitHub Actions)

This section enables automatic deployment when you push code to GitHub.

---

### Step 1: Create Google Cloud Project (If Not Already Done)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project dropdown** at the top
3. Click **"NEW PROJECT"**
4. Enter project name: `Disha-Diagnostic-App`
5. Click **"CREATE"**
6. Wait for the project to be created (1-2 minutes)

**Save your Project ID** (you'll need it later):
- Look for the **Project ID** displayed in the console (e.g., `disha-diagnostic-app-12345`)

---

### Step 2: Enable Required APIs

You need to enable specific Google Cloud APIs:

1. In Google Cloud Console, go to **APIs & Services → Library**
2. Search for and enable these APIs:
   - **Cloud Run API**
   - **Artifact Registry API**
   - **Container Registry API**
   - **Service Networking API**

**Steps to enable an API:**
1. Search for the API name
2. Click on it
3. Click **ENABLE**
4. Wait for it to finish (you'll see a checkmark)

---

### Step 3: Create a Service Account for GitHub Actions

A Service Account is like a special user account that GitHub Actions will use to deploy your app.

**Steps:**

1. In Google Cloud Console, go to **IAM & Admin → Service Accounts**

2. Click **CREATE SERVICE ACCOUNT**

3. Fill in these details:
   - **Service account name:** `github-actions-deployer`
   - **Service account ID:** (auto-fills from name)
   - **Description:** `Service account for GitHub Actions CI/CD deployment`

4. Click **CREATE AND CONTINUE**

5. **Grant Roles to the Service Account:**
   
   Click **+ ADD ANOTHER ROLE** and add these roles:
   - `Cloud Run Admin`
   - `Storage Admin`
   - `Service Account User`
   - `Artifact Registry Administrator`
   - `Container Registry Service Agent`

6. Click **CONTINUE** → **DONE**

---

### Step 4: Create and Download Service Account JSON Key

This JSON file contains credentials that GitHub Actions will use.

**Steps:**

1. In **IAM & Admin → Service Accounts**, find your newly created service account `github-actions-deployer`

2. Click on it to open its details

3. Go to the **KEYS** tab

4. Click **ADD KEY → Create new key**

5. Choose **JSON** format

6. Click **CREATE**

7. A JSON file will **automatically download** to your computer (usually in `Downloads` folder)

8. **Save this file somewhere safe** - you'll need its contents for GitHub

**What the file looks like:**
```json
{
  "type": "service_account",
  "project_id": "disha-diagnostic-app-12345",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "github-actions-deployer@disha-diagnostic-app-12345.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  ...
}
```

---

### Step 5: Add Secrets to Your GitHub Repository

Now you'll tell GitHub your Google Cloud credentials.

**Steps:**

1. Go to your GitHub repository:
   ```
   https://github.com/cpdoryl/Disha-diagnostic-app
   ```

2. Click **Settings** (top navigation bar)

3. In the left sidebar, click **Secrets and variables → Actions**

4. Click **New repository secret** (green button)

5. **Add First Secret: GCP_PROJECT_ID**
   - **Name:** `GCP_PROJECT_ID`
   - **Value:** Your Google Cloud Project ID (e.g., `disha-diagnostic-app-12345`)
   - Click **Add secret**

6. **Add Second Secret: GCP_SA_KEY**
   - Click **New repository secret** again
   - **Name:** `GCP_SA_KEY`
   - **Value:** Open the JSON key file you downloaded earlier, copy its **entire contents**, and paste it here
   - Click **Add secret**

**After adding secrets, you should see:**
```
✓ GCP_PROJECT_ID
✓ GCP_SA_KEY
```

---

### Step 6: Verify GitHub Actions Workflow

GitHub Actions is already configured in your repo at `.github/workflows/deploy.yml`

**To verify it's set up:**

1. In your GitHub repo, click **Actions** (top navigation)

2. You should see a workflow file listed

3. The workflow will automatically trigger when you push to `main` branch

---

## PART 3: GIT WORKFLOW - Committing and Pushing Changes

This is how you save your work and deploy it.

---

### Step 1: Check What Changed

Before committing, see what files you've modified:

```bash
git status
```

**You'll see output like:**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/pages/Dashboard.tsx
        modified:   src/components/Chart.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        src/components/NewFeature.tsx
```

---

### Step 2: Stage Your Changes

"Staging" means marking which files to include in your next commit:

```bash
# Option A: Add all changed files
git add .

# Option B: Add specific files
git add src/pages/Dashboard.tsx src/components/Chart.tsx

# Option C: Interactive staging (choose files one by one)
git add -i
```

**Verify staging:**
```bash
git status
```

You should see "Changes to be committed" section with your files.

---

### Step 3: Create a Commit

A commit is a snapshot of your changes with a message explaining what changed:

```bash
git commit -m "Add new dashboard features and fix chart calculations"
```

**Good commit message examples:**
```bash
git commit -m "Feat: add real-time assessment scoring"
git commit -m "Fix: correct calculation bug in score aggregation"
git commit -m "Refactor: simplify Firebase data fetching"
git commit -m "Docs: update setup guide with deployment steps"
git commit -m "Chore: update dependencies"
```

**Format: `<Type>: <Description>`**
- `Feat:` - New feature
- `Fix:` - Bug fix
- `Refactor:` - Code restructuring (no functionality change)
- `Docs:` - Documentation changes
- `Chore:` - Maintenance, dependencies

---

### Step 4: Push to GitHub

Push your commits to the remote repository:

```bash
git push origin main
```

**What happens next:**
1. Your code is uploaded to GitHub
2. GitHub Actions automatically detects the push
3. A deployment workflow starts automatically
4. Your app is built into a Docker image
5. The image is pushed to Google Container Registry
6. Cloud Run automatically deploys the new version
7. Your app updates live (within 2-5 minutes)

**Check deployment status:**
1. Go to your GitHub repo
2. Click **Actions** tab
3. You'll see a workflow running
4. Wait for the green checkmark ✅

---

## COMPLETE EXAMPLE: Making a Change End-to-End

Let's say you want to update the Dashboard title:

### 1. Make the Change
```bash
# Open VS Code and edit src/pages/Dashboard.tsx
# Change the title from "School Dashboard" to "Disha Diagnostic Dashboard"
# Save the file (Ctrl+S)
```

The browser auto-refreshes and you see the change immediately!

### 2. Check the Change
```bash
git status
# Output shows: src/pages/Dashboard.tsx modified
```

### 3. Stage the Change
```bash
git add src/pages/Dashboard.tsx
```

### 4. Commit the Change
```bash
git commit -m "Feat: update dashboard title"
```

### 5. Push to GitHub (Triggers Deployment!)
```bash
git push origin main
```

### 6. Monitor Deployment
- Go to GitHub → Actions tab
- Watch the workflow run
- Once complete (✅), your live app is updated!

---

## Common Git Commands Reference

```bash
# View commit history
git log --oneline

# View what's different from GitHub
git diff origin/main

# Undo unstaged changes in a file
git restore src/pages/Dashboard.tsx

# Undo staged changes
git restore --staged src/pages/Dashboard.tsx

# Create a new branch for experimental work
git checkout -b feature/my-new-feature

# Switch back to main
git checkout main

# Delete a branch
git branch -d feature/my-new-feature
```

---

## Troubleshooting

### Issue: Auto-reload not working
**Solution:** 
- Make sure you're editing files in the `src/` folder
- Check that the dev server is still running
- Try refreshing the browser manually (F5)

### Issue: Changes don't appear after push
**Solution:**
- Wait 2-5 minutes for GitHub Actions to complete
- Check the Actions tab for deployment errors
- Refresh your browser (Ctrl+Shift+R for hard refresh)

### Issue: Deployment fails in GitHub Actions
**Solution:**
- Go to GitHub → Actions → View the failed workflow
- Read the error message in the logs
- Common issues: Missing GCP secrets, invalid JSON key format
- Verify your GCP_SA_KEY secret is the entire JSON content (not just part of it)

### Issue: "fatal: refusing to merge unrelated histories"
**Solution:**
```bash
# This shouldn't happen, but if it does:
git pull origin main --allow-unrelated-histories
git push origin main
```

---

## Security Best Practices

1. **Never commit secrets** (API keys, passwords, tokens)
2. **Use environment variables** for sensitive data
3. **Keep GCP key safe** - don't share it
4. **Rotate service account keys** periodically
5. **Review code changes** before pushing
6. **Don't force push to main** unless absolutely necessary

---

## Next Steps

✅ You now have:
- Local development environment working
- Hot-reload for instant feedback
- Automated deployment to Google Cloud Run
- Git-based workflow for changes

**What to do next:**
1. Start making changes to your application
2. Test features locally
3. Commit and push when ready
4. Watch automatic deployments happen

**For questions:**
- Check GitHub Issues for bug reports
- Review the main README.md for project overview
- Check the ARCHITECTURE.md for codebase structure

Happy coding! 🚀
