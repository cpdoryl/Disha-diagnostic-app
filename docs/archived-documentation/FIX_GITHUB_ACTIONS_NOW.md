# 🔧 FIX GITHUB ACTIONS - STEP BY STEP

**Problem**: Recent pushes not triggering GitHub Actions builds  
**Solution**: Enable GitHub Actions + Configure + Manually trigger

---

## ✅ STEP 1: Enable GitHub Actions

1. Go to your repo: https://github.com/cpdoryl/Disha-diagnostic-app

2. Click **Settings** (top menu)

3. Click **Actions** (left sidebar) → **General**

4. Under "Actions permissions", select:
   - ✅ **"Allow all actions and reusable workflows"**

5. Click **Save**

---

## ✅ STEP 2: Verify Workflow File is on Main Branch

Run these commands to verify:

```bash
# Check if file exists locally
ls -la .github/workflows/test-and-deploy.yml

# Verify it's on main branch
git branch -a
git log --oneline -3

# Make sure your recent commits are on main
git status
```

Expected output:
```
On branch main
Your branch is up to date with 'origin/main'.
```

---

## ✅ STEP 3: Force Push Workflow File

Sometimes GitHub doesn't pick up the workflow file. Force it:

```bash
# Add the workflow file
git add .github/workflows/test-and-deploy.yml

# Commit it
git commit -m "chore: Ensure GitHub Actions workflow is active"

# Push to main
git push origin main -u
```

This ensures the workflow file is definitely on GitHub.

---

## ✅ STEP 4: Manually Trigger Workflow

Once Actions is enabled:

1. Go to: **https://github.com/cpdoryl/Disha-diagnostic-app/actions**

2. You should now see **"Build & Deploy"** workflow in the left sidebar

3. Click **"Build & Deploy"**

4. Click **"Run workflow"** (right side, top)

5. Select branch: **main**

6. Click **"Run workflow"** button

**You should see**: Yellow circle (building) → Green checkmark (success)

---

## ✅ STEP 5: Check Build Progress

1. Refresh the Actions page: F5

2. You should see a new workflow run for your latest commit

3. Click on it to see:
   - ⏳ Build job (5-10 min)
   - ⏳ Deploy job (2-5 min)

4. Click "Build" to see logs

---

## 🚨 If Still No Build Appears

Try this:

```bash
# Verify workflow syntax
cat .github/workflows/test-and-deploy.yml

# Make a test commit
echo "# Test" >> README.md
git add README.md
git commit -m "test: Trigger GitHub Actions"
git push origin main
```

This should definitely trigger a workflow run.

---

## ⚙️ Configure Firebase Secrets (Required for Deploy)

Once build triggers, you'll need these secrets for deployment to work:

1. Go to: **https://github.com/cpdoryl/Disha-diagnostic-app/settings/secrets/actions**

2. Click **"New repository secret"** and add:

```
Name: FIREBASE_PROJECT_ID
Value: disha-diagnostics
```

3. Click **"New repository secret"** again:

```
Name: FIREBASE_CI_TOKEN
Value: [Generate this]
```

To generate FIREBASE_CI_TOKEN:

```bash
npm install -g firebase-tools
firebase login:ci
# Follow browser prompt, copy token
```

---

## ✅ Complete Workflow

Once everything is set up:

```
Push to main
    ↓
GitHub Actions triggered (within 1 min)
    ↓
Build job runs (5-10 min)
    ├─ npm install
    ├─ npm run build
    └─ Upload artifacts
    ↓
Deploy job runs (2-5 min)
    ├─ Download artifacts
    ├─ firebase deploy
    └─ Deploy complete
    ↓
🎉 App live at https://disha-diagnostics.web.app/
```

---

## 🔍 Troubleshooting

### Problem: Workflow doesn't appear in Actions tab

**Solution**:
```bash
# Ensure workflow file is committed
git log --all -- .github/workflows/test-and-deploy.yml

# If not in log, add and commit it
git add .github/workflows/test-and-deploy.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

### Problem: Build fails with "Cannot find module"

**Solution**:
```bash
# Verify build works locally
npm install --legacy-peer-deps
npm run build

# If it works locally, issue is in Actions environment
# Check Node version in workflow (should be 18)
```

### Problem: Deploy fails with "401 Unauthorized"

**Solution**: 
- Firebase token is invalid/expired
- Regenerate with: `firebase login:ci`
- Update FIREBASE_CI_TOKEN secret

### Problem: No GitHub Actions at all

**Solution**:
1. Go to Settings → Actions → General
2. Make sure "Allow all actions" is selected
3. Commit and push a file
4. GitHub Actions should trigger within 1 minute

---

## 🎯 Quick Checklist

- [ ] GitHub Actions enabled in Settings
- [ ] Workflow file exists: `.github/workflows/test-and-deploy.yml`
- [ ] Recent commits are on main branch
- [ ] Pushed to GitHub: `git push origin main`
- [ ] Manually triggered workflow (or pushed a test commit)
- [ ] Build job started (see yellow circle in Actions)
- [ ] Build completed successfully (see green checkmark)
- [ ] Firebase secrets configured (if deploying)
- [ ] App deployed to Firebase Hosting

---

## 📞 How to Check Status

**Option 1: Check GitHub Actions**
```
https://github.com/cpdoryl/Disha-diagnostic-app/actions
```

**Option 2: Check Firebase Hosting**
```
https://console.firebase.google.com/project/disha-diagnostics/hosting
```

**Option 3: Visit Live App**
```
https://disha-diagnostics.web.app/
```

---

## ✅ Expected Outcomes

After following these steps:

- ✅ New workflow runs appear in Actions tab
- ✅ Build job runs and shows "Build React App"
- ✅ Deploy job shows "Deploy to Firebase Hosting"
- ✅ Both jobs complete with green checkmarks
- ✅ App is live at disha-diagnostics.web.app

---

**Try these steps and let me know:**

1. Did you enable GitHub Actions in Settings?
2. Do you see "Build & Deploy" workflow in Actions tab?
3. Can you manually trigger a run?
4. What status do you see (building/failed/success)?

Let me know and I'll help debug further! 🚀
