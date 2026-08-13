# Firebase Dual Deployment Setup Guide
## Deploy to Both URLs Automatically from GitHub Actions

---

## 🎯 What Was Fixed

✅ GitHub Actions workflow now deploys to **BOTH URLs simultaneously**:
- disha-diagnostics.web.app
- disha.rylneuroacademy.com

### Before (❌ Only one URL updated):
```
git push → GitHub Actions → Firebase → Only disha-diagnostics.web.app updated
```

### After (✅ Both URLs updated):
```
git push → GitHub Actions → Firebase → BOTH URLs updated at same time
```

---

## 🔧 Firebase Configuration Changes Made

### 1. Updated `.firebaserc` 
Added dual hosting targets:
- `default`: Links to disha-diagnostics.web.app
- `custom`: Links to disha.rylneuroacademy.com

### 2. Updated `firebase.json`
Now deploys same build to both targets:
- Both targets use same `build/` directory
- Both targets have identical configuration
- Both targets get identical cache headers

### 3. Updated GitHub Actions Workflow
Changed deployment command:
```bash
# Old (only one site):
firebase deploy --only hosting --project disha-diagnostics

# New (both sites simultaneously):
firebase deploy --only hosting:default,hosting:custom --project disha-diagnostics
```

---

## ✅ Setup Required in Firebase Console (One Time Only)

### Step 1: Link Custom Domain Target to Custom URL

1. **Go to Firebase Console**
   ```
   https://console.firebase.google.com/project/disha-diagnostics/hosting
   ```

2. **You should see two sites/targets:**
   - ✅ `disha-diagnostics-web` → disha-diagnostics.web.app (already active)
   - ⏳ `disha-ryl-custom` → needs setup

3. **Click on `disha-ryl-custom` site**

4. **Click "Add Custom Domain" button**
   - Enter domain: `disha.rylneuroacademy.com`
   - Click "Continue"

5. **Verify Domain Ownership**
   - Firebase shows a TXT record to add
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the TXT record for verification
   - Wait for verification (usually 10-30 minutes)

6. **Add CNAME Record**
   - Firebase provides the CNAME value
   - Add to your registrar pointing to Firebase
   - Wait for DNS propagation (up to 24 hours)

7. **SSL Certificate**
   - Firebase provisions automatically
   - Takes up to 24 hours

---

## 📋 Step-by-Step Firebase Console Setup

### Accessing Hosting Sites:

```
Firebase Console
    ↓
Project: disha-diagnostics
    ↓
Hosting (left sidebar)
    ↓
You see sites list:
    • disha-diagnostics-web     [Default Site]
    • disha-ryl-custom          [Custom Domain Site - NEEDS SETUP]
```

### For `disha-ryl-custom` site:

1. Click the site name
2. Click "Connect domain" button
3. Enter: `disha.rylneuroacademy.com`
4. Add TXT record from registrar
5. Add CNAME record from registrar
6. Wait for SSL (24 hours)
7. Done! ✅

---

## 🚀 How It Works After Setup

```
Local Repository
    ↓
git push origin main
    ↓
GitHub Actions Triggered
    ↓
npm install & npm run build
    ↓
firebase deploy --only hosting:default,hosting:custom
    ↓
┌─────────────────────────────────────┐
│  BOTH SITES DEPLOY SIMULTANEOUSLY:  │
│  • disha-diagnostics.web.app        │
│  • disha.rylneuroacademy.com        │
└─────────────────────────────────────┘
    ↓
Changes LIVE in 1-2 minutes
    ↓
✅ Both URLs perfectly synced
```

---

## ⏱️ Timeline After Setup

```
Action                                    Time
────────────────────────────────────────────────
1. Push to main branch                   Immediate
2. GitHub Actions starts                 Immediate
3. npm install & build                   3-5 min
4. Deploy to both targets                2-3 min
   • disha-diagnostics.web.app ✓
   • disha.rylneuroacademy.com ✓
5. Both URLs live & synced               Total: ~8-10 min
```

---

## ✨ What Gets Updated

Every push to `main` now updates:

✅ React Application  
✅ All UI/UX Improvements  
✅ Professional Dashboards  
✅ Diagnostic Reports  
✅ Gap Analysis  
✅ Action Plans  
✅ Excel/PNG Export  
✅ Email Share  
✅ 30-60-90 Plans  
✅ All CSS & Styling  
✅ Cache Headers  

**TO BOTH URLS SIMULTANEOUSLY** ✅

---

## 🔍 Verification After Setup

### Check Default Site (Automatic):
```bash
curl -I https://disha-diagnostics.web.app/
# Should return: HTTP 200 ✓
```

### Check Custom Domain (After DNS setup):
```bash
curl -I https://disha.rylneuroacademy.com/
# Should return: HTTP 200 ✓ (once DNS propagates)
```

### Verify Both Sites Identical:
```bash
curl https://disha-diagnostics.web.app/ | md5sum
curl https://disha.rylneuroacademy.com/ | md5sum
# Checksums should match ✓
```

---

## 📊 Deployment Flow Diagram

```
CODE CHANGES
    ↓
git commit & git push origin main
    ↓
GitHub Repository Updated
    ↓
GitHub Actions Workflow Triggered
    ↓
┌──────────────────────────────────────────┐
│ Step 1: Checkout Code                    │
│ Step 2: Setup Node.js                    │
│ Step 3: Install Dependencies              │
│ Step 4: Type Check (lint)                 │
│ Step 5: Build React App (npm run build)   │
│ Step 6: Verify Build Output               │
│ Step 7: Upload Build Artifacts            │
└──────────────────────────────────────────┘
    ↓
Deploy Job Starts
    ↓
┌──────────────────────────────────────────┐
│ Download Build Artifacts                 │
│ Install Firebase CLI                     │
│ Verify Firebase Config                   │
│ Deploy to BOTH targets:                  │
│   • hosting:default  ✓                   │
│   • hosting:custom   ✓                   │
│ Deploy Firestore Rules                   │
└──────────────────────────────────────────┘
    ↓
Firebase Processes Deployment
    ↓
Both Sites Updated:
├─ disha-diagnostics.web.app ✅ LIVE
└─ disha.rylneuroacademy.com ✅ LIVE
    ↓
Changes Visible Within 1-2 Minutes ✨
```

---

## ⚠️ Important Notes

### DNS Propagation:
- TXT record verification: 10-30 minutes
- CNAME record propagation: Up to 24 hours
- SSL certificate provisioning: Up to 24 hours

### First Deploy After Setup:
- First deploy with custom domain goes to BOTH URLs
- Both sites already have the same build
- No delay or manual intervention needed

### SSL Certificate:
- Firebase handles automatically
- No additional configuration needed
- Both URLs get HTTPS automatically

---

## 🎯 Summary

### What You Did Today:
✅ Updated GitHub Actions to deploy to both targets  
✅ Updated firebase.json for dual deployment  
✅ Updated .firebaserc with hosting targets  

### What You Need to Do (One Time):
1. Open Firebase Console
2. Add custom domain to `disha-ryl-custom` site
3. Add TXT record for verification
4. Add CNAME record for routing
5. Wait 24 hours for DNS & SSL

### Result:
🎉 Every `git push` to `main` automatically updates **BOTH URLs**  
🎉 No manual deployment needed  
🎉 Perfect sync between both URLs  
🎉 Changes live in ~10 minutes  

---

## 📞 Quick Commands

```bash
# Test deployment
git push origin main

# Monitor GitHub Actions
https://github.com/cpdoryl/Disha-diagnostic-app/actions

# Check Firebase Console
https://console.firebase.google.com/project/disha-diagnostics/hosting

# View both targets configured
cat .firebaserc
cat firebase.json | grep -A 5 '"hosting"'
```

---

## 🆘 Troubleshooting

### Problem: Still only seeing one URL update
**Solution:** Wait for custom domain setup in Firebase Console (Step 1 above)

### Problem: Custom domain DNS not working
**Solution:** Check your registrar DNS settings for:
- TXT record for verification
- CNAME record pointing to Firebase

### Problem: GitHub Actions shows error
**Solution:** 
1. Check Firebase token is valid
2. Check .firebaserc and firebase.json are correct
3. Review logs at: https://github.com/cpdoryl/Disha-diagnostic-app/actions

---

**Status: ✅ DUAL DEPLOYMENT CONFIGURED**

Once you complete Firebase Console setup, all pushes to `main` will automatically update both URLs! 🚀
