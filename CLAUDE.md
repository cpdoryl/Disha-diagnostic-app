# DISHA Diagnostic Engine - Development Guide

## Overview

This project is a comprehensive 14-Dimension School Diagnostic Assessment system with multi-stakeholder feedback, real-time response tracking, and automated deployment.

---

## Remote Development Workflow

### 🌐 Working from Claude Code Browser (Remote)

**For remote/cloud-based development when you can't access local VS Code:**

#### Step 1: Access Remote Repository
```bash
# The code is already set up in this repository
# You'll work on the 'remote-dev' branch
git branch -a  # See all branches
git checkout remote-dev  # Switch to remote branch if needed
```

#### Step 2: Make Changes
1. Edit files directly in Claude Code browser
2. Claude Code will auto-save changes
3. Changes are tracked by git

#### Step 3: Commit and Push
```bash
# Stage changes
git add -A

# Commit with descriptive message
git commit -m "feat: Your feature description here"

# Push to remote-dev branch
git push origin remote-dev
```

#### Step 4: Automatic Deployment
- ✅ **GitHub Actions automatically detects the push**
- ✅ **Builds and tests the code**
- ✅ **Deploys to Firebase Hosting**
- ✅ **You can monitor at:** https://github.com/cpdoryl/Disha-diagnostic-app/actions

#### Step 5: View Live Changes
- App URL: https://disha-diagnostics.web.app/
- Changes should appear within 10-15 minutes of push

---

## Local Development Workflow

### 💻 Working from Local VS Code

**For local development when you have access to your laptop:**

```bash
# Switch to main branch
git checkout main

# Pull latest changes from remote-dev
git pull origin remote-dev

# Make changes locally
# ... edit files ...

# Commit and push
git add -A
git commit -m "feat: Your feature"
git push origin main
```

---

## Branch Strategy

### Main Branches:

| Branch | Purpose | Who | Auto-Deploy |
|--------|---------|-----|-------------|
| `main` | Production code | Local dev | ✅ Yes |
| `remote-dev` | Remote browser dev | Claude Code | ✅ Yes |

### How It Works:

```
remote-dev (Claude Code)          main (Local VS Code)
    ↓                                  ↓
    └─→ Commit & Push             ← Pull from remote-dev
        ↓                             ↓
        GitHub Actions Build      GitHub Actions Build
        ↓                             ↓
        Firebase Deploy           Firebase Deploy
        ↓                             ↓
        🌐 LIVE                   🌐 LIVE
```

---

## Merging Remote to Local (When Ready)

### Option A: Simple Merge (Recommended)

When you switch back to local and want to merge remote changes:

```bash
# On local machine
git checkout main
git fetch origin
git merge origin/remote-dev
git push origin main
```

### Option B: Create Pull Request

For safer review:

1. Go to GitHub: https://github.com/cpdoryl/Disha-diagnostic-app
2. Click "Pull Requests"
3. Click "New Pull Request"
4. Set:
   - Base: `main`
   - Compare: `remote-dev`
5. Click "Create Pull Request"
6. Review changes
7. Click "Merge Pull Request"

### Option C: Keep Branches Separate (Advanced)

If you want to maintain separate development:

```bash
# Work on both branches independently
# Merge selectively based on what's needed
# Use pull requests for each merge
```

---

## Daily Workflow Examples

### Remote Session (Claude Code Browser)

```bash
# Start work
git checkout remote-dev
git pull origin remote-dev

# Make changes
# ... edit code in browser ...

# After changes
git status                    # See what changed
git add -A                    # Stage all changes
git commit -m "feat: Add feature"  # Commit
git push origin remote-dev    # Push to server

# Monitor deployment
# Go to GitHub Actions → Watch build complete
# After ~10 min: Check https://disha-diagnostics.web.app/
```

### Local Session (Local VS Code)

```bash
# Start work
git checkout main
git pull origin main          # Get latest
git pull origin remote-dev    # Get remote changes too

# Make changes
# ... edit code locally ...

# After changes
git add -A
git commit -m "fix: Bug fix"
git push origin main

# Monitor deployment (same as above)
```

---

## File Structure

```
disha-diagnostic-engine/
├── src/
│   ├── pages/              # React pages
│   │   ├── MultiUserAssessment.tsx
│   │   ├── StakeholderSurvey.tsx
│   │   └── ...
│   ├── components/         # React components
│   ├── lib/                # Utilities & Firebase
│   ├── data/               # Assessment questions
│   └── store/              # App state
├── public/                 # Static files
├── firebase.json           # Firebase config
├── .github/
│   └── workflows/          # GitHub Actions
└── package.json            # Dependencies
```

---

## Key Features Implemented

### ✅ Phase 1: Multi-User Assessment
- [x] 14-Dimension diagnostic framework
- [x] Multi-stakeholder support (Teacher, Parent, Student, Admin, Other)
- [x] Configurable expected respondents per school
- [x] Assessment deployment dashboard

### ✅ Phase 2: Real-Time Response Tracking (14-Dimension Assessment)
- [x] Firestore real-time listeners
- [x] Auto-update dashboard without page refresh
- [x] Respondent count tracking
- [x] Per-stakeholder response aggregation

**Note:** This Phase 2 refers to the 14-Dimension multi-stakeholder assessment system.
For the First Opinion Engine v3 (separate system), Phase 2 is "API & Calculation Layer" — see `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` for details.

### ✅ Phase 3: Identification & Verification
- [x] Email capture for Teachers, Parents, Admin
- [x] Phone number capture (validated)
- [x] Teacher ID / Admin ID verification
- [x] Student/Class linking for Parents
- [x] Assessment persistence per school

### ⏳ Phase 4: Analysis (Coming)
- [ ] AI-powered diagnostic reports
- [ ] Dimension-wise scoring
- [ ] Trend analysis
- [ ] Recommendation engine

---

## Troubleshooting

### Issue: Changes not deploying

**Solution:**
```bash
# Make sure you're on correct branch
git branch  # Should show * remote-dev or * main

# Verify commit was pushed
git log --oneline -5

# Check GitHub Actions
# https://github.com/cpdoryl/Disha-diagnostic-app/actions
```

### Issue: Merge conflicts between remote-dev and main

**Solution:**
```bash
# If pulling from remote-dev into main
git checkout main
git fetch origin
git merge origin/remote-dev

# If conflicts occur:
# - Edit the conflicting files
# - Resolve conflicts manually
# - Stage changes: git add -A
# - Complete merge: git commit -m "Merge remote-dev into main"
# - Push: git push origin main
```

### Issue: Want to revert a commit

**Solution:**
```bash
# See recent commits
git log --oneline -10

# Revert a specific commit (safe, creates new commit)
git revert <commit-hash>

# Or reset to previous state (destructive, local only)
git reset --hard HEAD~1  # Go back 1 commit

# Then push
git push origin <branch-name>
```

---

## Firebase Deployment

### Configuration Files:
- `firebase.json` - Defines what to deploy (Hosting only)
- `firestore-security-rules.txt` - Firestore access rules
- `.github/workflows/test-and-deploy.yml` - Auto-deployment pipeline

### Firestore Rules (Current):
```firestore
match /assessments/{document=**} {
  allow read, write: if true;  // Allows anonymous submission
}
```

### Deployment Pipeline:
1. Push to `remote-dev` or `main`
2. GitHub Actions triggers
3. Code builds (npm run build)
4. Firebase Hosting updated
5. Site deployed to: https://disha-diagnostics.web.app/

---

## Important Notes

### ⚠️ For Remote Development:
- Always commit frequently (every 30-60 min)
- Use clear commit messages
- Push to `remote-dev` branch
- Check GitHub Actions after each push

### ⚠️ For Local Development:
- Pull from `remote-dev` regularly to stay in sync
- Merge with `remote-dev` when returning to local work
- Use `main` branch for stable deployments

### ⚠️ Merging Strategy:
- `remote-dev` → `main` when feature is stable
- Both branches auto-deploy independently
- No risk of conflicts if you follow the workflow

---

## Quick Commands

```bash
# See current branch
git branch

# See all branches
git branch -a

# Switch to remote-dev
git checkout remote-dev

# Switch to main
git checkout main

# See recent commits
git log --oneline -5

# See what changed
git status

# Push changes
git push origin <branch-name>

# Pull changes
git pull origin <branch-name>

# Merge branches
git merge origin/<source-branch>

# See GitHub Actions
https://github.com/cpdoryl/Disha-diagnostic-app/actions
```

---

## Support

For issues or questions:
1. Check GitHub Actions logs: https://github.com/cpdoryl/Disha-diagnostic-app/actions
2. Check Firebase Console: https://console.firebase.google.com/
3. Review this CLAUDE.md for troubleshooting

---

## Last Updated
- Created: August 11, 2026
- Phase 1-3 features implemented
- Remote/Local development workflow established
- Auto-deployment configured
