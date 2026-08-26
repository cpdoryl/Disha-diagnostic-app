# Custom Domain Deployment Configuration

## 📋 Overview

This application is configured to deploy to the default Firebase Hosting URL automatically with every push to the `main` branch. The custom domain can be configured to point to the same Firebase Hosting site.

---

## 🌐 Deployment URLs

### **Default Firebase Hosting (Automatic)**
```
https://disha-diagnostics.web.app/
Status: ✅ Auto-deploys on every push to main
```

### **Custom Domain (Manual Setup Required)**
```
https://disha.rylneuroacademy.com/
Status: ⏳ Requires manual Firebase Console configuration
```

**Once custom domain is configured in Firebase, both URLs will point to the same site and receive identical updates automatically.**

---

## 🔧 How to Setup Custom Domain

### **Step 1: Open Firebase Console**
```
https://console.firebase.google.com/project/disha-diagnostics/hosting
```

### **Step 2: Add Custom Domain**
1. Click "Add Custom Domain"
2. Enter: `disha.rylneuroacademy.com`
3. Click "Continue"

### **Step 3: Verify Domain Ownership**
Firebase will show DNS records to add:
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add the provided DNS TXT record
3. Wait for DNS to propagate (can take 24 hours)
4. Click "Verify" in Firebase Console

### **Step 4: Wait for SSL Certificate**
- Firebase automatically provisions SSL certificate
- Can take 24 hours
- Both HTTP and HTTPS will work once ready

### **Step 5: Automatic Updates Begin**
Once domain is verified and SSL is active:
- Every push to `main` automatically updates both URLs
- Both URLs receive identical code
- No manual sync needed

---

## 🔧 Configuration Files

### 1. `.firebaserc` - Project & Site Configuration
```json
{
  "projects": {
    "default": "disha-diagnostics"
  },
  "targets": {
    "disha-diagnostics": {
      "hosting": {
        "default": ["disha-diagnostics"],
        "custom": ["disha-ryl"]
      }
    }
  }
}
```

**What it does:**
- Maps `default` target to Firebase default site `disha-diagnostics`
- Maps `custom` target to custom domain site `disha-ryl`
- Allows deployment to both sites simultaneously

### 2. `firebase.json` - Hosting Configuration
```json
{
  "hosting": [
    {
      "target": "default",
      "public": "build",
      "rewrites": [{ "source": "**", "destination": "/index.html" }],
      "headers": [...]
    },
    {
      "target": "custom",
      "public": "build",
      "rewrites": [{ "source": "**", "destination": "/index.html" }],
      "headers": [...]
    }
  ]
}
```

**What it does:**
- Defines two hosting targets (default and custom)
- Both use the same `build/` directory
- Both have identical configurations (same rewrites, headers, caching rules)
- Allows single build output to deploy to both sites

### 3. `.github/workflows/test-and-deploy.yml` - GitHub Actions
```yaml
- name: Deploy to Firebase Hosting (Default + Custom Domain)
  run: |
    firebase deploy --only hosting:default,hosting:custom,firestore \
      --project=${{ secrets.FIREBASE_PROJECT_ID }} \
      --token=${{ secrets.FIREBASE_CI_TOKEN }}
```

**What it does:**
- Deploys to both `hosting:default` and `hosting:custom` targets
- Includes `firestore` deployment for database updates
- Runs on every push to `main` branch
- Uses Firebase CI token for authentication

---

## 🚀 Deployment Workflow

```
Developer pushes to main branch
        ↓
GitHub Actions triggers
        ↓
Build step (npm run build)
        ↓
Verify build output
        ↓
Deploy step:
  ├─ Deploy to disha-diagnostics (Firebase default)
  ├─ Deploy to disha-ryl (Custom domain)
  └─ Deploy Firestore rules
        ↓
Both URLs updated simultaneously (~2-5 minutes)
        ↓
✅ Users see changes on BOTH sites
```

---

## ✅ How to Ensure Custom Domain Updates

### **Automatic (Every Push to Main)**
1. Make changes in VS Code or Claude Code
2. Commit: `git commit -m "feat: Your feature"`
3. Push: `git push origin main`
4. GitHub Actions automatically builds and deploys to BOTH URLs
5. Within 2-5 minutes, both sites are updated

### **Manual Deployment (If Needed)**
```bash
# Deploy to both default and custom sites
firebase deploy --only hosting:default,hosting:custom --project=disha-diagnostics

# Deploy only to custom domain
firebase deploy --only hosting:custom --project=disha-diagnostics

# Deploy only to default
firebase deploy --only hosting:default --project=disha-diagnostics

# Full deployment (including Firestore)
firebase deploy --project=disha-diagnostics
```

---

## 📊 Deployment Status Monitoring

### **GitHub Actions**
Monitor deployments at:
```
https://github.com/cpdoryl/Disha-diagnostic-app/actions
```

Each workflow run shows:
- ✅ Build step status
- ✅ Deploy step status
- ✅ Success message with both URLs

### **Firebase Console**
```
https://console.firebase.google.com/project/disha-diagnostics/hosting
```

View:
- Deployment history for both sites
- Active versions
- Custom domain configuration
- SSL certificate status

---

## 🔍 Verification Steps

After pushing changes, verify both URLs are updated:

### **Step 1: Check GitHub Actions**
1. Go to: https://github.com/cpdoryl/Disha-diagnostic-app/actions
2. Look for the latest workflow run
3. Confirm both builds and deployments succeeded

### **Step 2: Verify Both URLs**
```bash
# Check default Firebase URL
curl -I https://disha-diagnostics.web.app/

# Check custom domain
curl -I https://disha.rylneuroacademy.com/

# Both should return HTTP 200
```

### **Step 3: Visual Verification**
1. Open https://disha-diagnostics.web.app/ in browser
2. Open https://disha.rylneuroacademy.com/ in another tab
3. Both should show identical content
4. Check browser cache (Ctrl+Shift+Delete) if seeing old content

---

## ⚠️ Troubleshooting

### **Custom Domain Not Updating**
**Check:**
1. `.firebaserc` includes custom site configuration
2. `firebase.json` has two hosting targets
3. GitHub Actions workflow deploys to both sites
4. Firestore rules are properly configured

**Fix:**
```bash
# Clear cache and redeploy
firebase deploy --only hosting:custom --force --project=disha-diagnostics
```

### **404 Errors on Custom Domain**
**Check:**
1. Custom domain is registered and DNS is configured
2. SSL certificate is active in Firebase Console
3. Firebase has processed the domain (wait 24 hours on first setup)

**Status:**
https://console.firebase.google.com/project/disha-diagnostics/hosting/custom-domains

### **Both Sites Out of Sync**
**Fix:**
```bash
# Redeploy to both sites
firebase deploy --only hosting:default,hosting:custom --project=disha-diagnostics
```

### **Build Failures**
**Check:**
1. Local build works: `npm run build`
2. All dependencies installed: `npm install --legacy-peer-deps`
3. TypeScript errors: `npm run lint`

**View logs:**
https://github.com/cpdoryl/Disha-diagnostic-app/actions

---

## 🔑 Required Secrets (GitHub Actions)

The following secrets must be configured in GitHub Actions:

```
FIREBASE_PROJECT_ID = "disha-diagnostics"
FIREBASE_CI_TOKEN = "..." (generated from Firebase CLI)
```

**Generate CI Token:**
```bash
firebase login:ci
# Follow prompts, copy token to GitHub Secrets
```

---

## 📝 Summary

| Aspect | Configuration |
|--------|--------------|
| **Default Site** | disha-diagnostics.web.app |
| **Custom Domain** | disha.rylneuroacademy.com |
| **Build Directory** | build/ (shared) |
| **Deployment Trigger** | Push to main branch |
| **Deployment Method** | GitHub Actions |
| **Update Frequency** | Every push (2-5 min delay) |
| **Both Sites Sync** | Yes, always identical |

---

## ✨ Key Benefits

✅ **Single Push Updates Both URLs**  
✅ **No Manual Sync Required**  
✅ **Same Content on Both Sites**  
✅ **Automated CI/CD Pipeline**  
✅ **Easy Rollback Capability**  
✅ **Historical Version Tracking**  

---

## 📞 Next Steps

1. ✅ Configuration complete (done)
2. ✅ Push changes to main
3. ✅ Monitor GitHub Actions
4. ✅ Verify both URLs updated
5. ✅ Share with team/stakeholders

Both URLs will now be kept in perfect sync automatically!
