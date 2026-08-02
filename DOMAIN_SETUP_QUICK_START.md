# DISHA Domain Setup - Quick Start (5 Minutes)

**Goal:** Get `https://disha.rylneuroacademy.com` live

---

## 🚀 Quick Setup (Choose One Option)

### Option A: Automated Setup (Recommended)

```bash
# Make script executable
chmod +x setup-custom-domain.sh

# Run the automated setup
./setup-custom-domain.sh

# Follow the prompts to add DNS records
```

### Option B: Manual Setup

#### 1️⃣ Get Your Project ID
```bash
gcloud config get-value project
# Output: your-gcp-project-id
```

#### 2️⃣ Add DNS Records to Your Domain Registrar

Go to your domain registrar's DNS settings and add:

**Option 1 (CNAME - Simpler):**
- **Host:** `disha`
- **Type:** CNAME
- **Value:** `run.app`
- **TTL:** 3600

**Option 2 (A Record):**
- **Host:** `disha`
- **Type:** A
- **Value:** `199.36.153.8`
- **TTL:** 3600

#### 3️⃣ Configure Cloud Run

```bash
# Set your project
gcloud config set project your-gcp-project-id

# Update Cloud Run service with domain
gcloud run services update disha-diagnostics \
  --region asia-southeast1 \
  --update-env-vars DOMAIN=disha.rylneuroacademy.com

# Verify it worked
gcloud run services describe disha-diagnostics \
  --region asia-southeast1 \
  --format='value(status.url)'
```

#### 4️⃣ Wait for DNS Propagation

```bash
# Check DNS resolution (may take 5-30 minutes)
nslookup disha.rylneuroacademy.com

# Keep trying until it resolves...
# Once resolved, move to Step 5
```

#### 5️⃣ Test HTTPS

```bash
# Test the domain (wait 2-5 minutes for SSL cert)
curl -I https://disha.rylneuroacademy.com

# Or open in browser:
# https://disha.rylneuroacademy.com
```

---

## ✅ Verification Checklist

- [ ] DNS records added to domain registrar
- [ ] DNS resolves: `nslookup disha.rylneuroacademy.com`
- [ ] HTTPS works: `curl -I https://disha.rylneuroacademy.com`
- [ ] App loads in browser: `https://disha.rylneuroacademy.com`
- [ ] Firebase auth working
- [ ] Can submit diagnostic forms
- [ ] Data persists to Firestore

---

## 🔍 Quick Diagnostics

### Check DNS
```bash
nslookup disha.rylneuroacademy.com
dig disha.rylneuroacademy.com

# Expected: should resolve to run.app or an IP
```

### Check SSL Certificate
```bash
curl -I https://disha.rylneuroacademy.com
# Look for: HTTP/2 200 and valid certificate headers
```

### Check Cloud Run Logs
```bash
gcloud run services logs read disha-diagnostics \
  --region asia-southeast1 \
  --limit 50
```

### Check Service Status
```bash
gcloud run services describe disha-diagnostics \
  --region asia-southeast1
```

---

## ⚡ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **DNS not resolving** | Wait 10-30 minutes for propagation. Check registrar settings. |
| **SSL certificate pending** | Wait 2-5 minutes. Google automatically provisions cert. |
| **CORS errors** | Update `ALLOWED_DOMAINS` in `server.ts` with the custom domain. |
| **502 Bad Gateway** | Redeploy service: `git push origin main` |
| **App not loading** | Check browser console for Firebase config errors. |

---

## 📋 Files to Know

- **Setup Guide:** `CUSTOM_DOMAIN_INTEGRATION_GUIDE.md` (comprehensive)
- **Quick Start:** `DOMAIN_SETUP_QUICK_START.md` (this file)
- **Setup Script:** `setup-custom-domain.sh` (automated)
- **Config Reference:** `.env.example` (environment variables)
- **Server Config:** `server.ts` (CORS & domain settings)

---

## 🎯 Final Result

After 30 minutes, you should have:

```
✅ https://disha.rylneuroacademy.com
   ↓
   Your DISHA Diagnostic Engine live on custom domain
   with automatic SSL/TLS certificate
```

---

## 📞 Need Help?

If something goes wrong:

1. **Check logs:** `gcloud run services logs read disha-diagnostics --region asia-southeast1`
2. **Verify DNS:** `nslookup disha.rylneuroacademy.com`
3. **Review guide:** `CUSTOM_DOMAIN_INTEGRATION_GUIDE.md`
4. **Check Cloud Console:** https://console.cloud.google.com/run

---

**Estimated Time:** 30-45 minutes (mostly waiting for DNS & SSL)  
**Difficulty:** ⭐⭐ (Medium - mostly configuration)  
**Prerequisites:** Google Cloud Project + Domain Registrar Access

Good luck! 🚀
