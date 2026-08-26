# DISHA Custom Domain Integration Summary

**Status:** Ready for Domain Setup  
**Target Domain:** `https://disha.rylneuroacademy.com`  
**Current Deployment:** Google Cloud Run (asia-southeast1)  
**Estimated Setup Time:** 30-45 minutes  

---

## 📋 What You'll Get

After completing this setup:

```
✅ https://disha.rylneuroacademy.com live
✅ Automatic SSL/TLS certificate (free)
✅ HTTPS security with green padlock
✅ Professional domain-based access
✅ Multi-device accessibility
✅ No additional hosting costs
```

---

## 📚 Documentation Provided

| File | Purpose | Time |
|------|---------|------|
| **DOMAIN_SETUP_QUICK_START.md** | Fast 5-minute setup guide | 5 min |
| **CUSTOM_DOMAIN_INTEGRATION_GUIDE.md** | Comprehensive step-by-step guide | 30-45 min |
| **setup-custom-domain.sh** | Automated setup script | 15 min |
| **validate-domain.sh** | Verification & troubleshooting script | 2 min |

---

## 🚀 Quick Setup Path (Recommended)

### For Most Users: Automated Setup

```bash
# 1. Navigate to project
cd c:/disha-diagnostic-engine

# 2. Make script executable
chmod +x setup-custom-domain.sh

# 3. Run automated setup (it will guide you)
./setup-custom-domain.sh

# The script will:
# ✓ Verify Cloud Run service
# ✓ Show DNS records to add
# ✓ Wait for DNS propagation
# ✓ Configure Cloud Run
# ✓ Test HTTPS connection
```

### For Advanced Users: Manual Setup

```bash
# 1. Add DNS records manually at your registrar
#    (see DOMAIN_SETUP_QUICK_START.md)

# 2. Configure Cloud Run
gcloud run services update disha-diagnostics \
  --region asia-southeast1 \
  --update-env-vars DOMAIN=disha.rylneuroacademy.com

# 3. Validate setup
./validate-domain.sh
```

---

## 🔧 What Gets Configured

### 1. DNS Records (Your Registrar)
```
CNAME: disha → run.app
OR
A: disha → 199.36.153.8
```

### 2. Cloud Run (Google Cloud)
- Service: `disha-diagnostics`
- Region: `asia-southeast1`
- Domain mapping: `disha.rylneuroacademy.com`
- Environment variable: `DOMAIN=disha.rylneuroacademy.com`

### 3. Application Configuration (Server)
- CORS settings updated for custom domain
- HTTPS redirect enabled
- Security headers configured
- Firestore authentication mapped to custom domain

---

## 📊 Setup Timeline

| Phase | Action | Duration | Status |
|-------|--------|----------|--------|
| **Phase 1** | Add DNS records to registrar | 2 min | Manual |
| **Phase 2** | Run setup script / Configure Cloud Run | 3 min | Automated/Manual |
| **Phase 3** | Wait for DNS propagation | 5-30 min | Waiting |
| **Phase 4** | SSL certificate provisioning | 2-5 min | Automatic |
| **Phase 5** | Verify domain & app functionality | 5 min | Validation |
| **Total** | **Complete Setup** | **30-45 min** | ✅ |

---

## ✅ Pre-Setup Checklist

Before you start, make sure you have:

- [ ] Google Cloud Project with DISHA deployed
- [ ] Access to domain registrar (to add DNS records)
- [ ] gcloud CLI installed locally
- [ ] curl or browser (to test domain)
- [ ] The app running on Cloud Run (verify with `gcloud run services list`)

---

## 🎯 Step-by-Step Instructions

### Step 1: Prepare Your Domain Registrar
1. Log into your domain registrar (where rylneuroacademy.com is registered)
2. Navigate to DNS settings
3. Be ready to add a DNS record

### Step 2: Run Setup Script
```bash
cd c:/disha-diagnostic-engine
chmod +x setup-custom-domain.sh
./setup-custom-domain.sh
```

The script will:
1. ✅ Verify your Cloud Run service is active
2. ✅ Provision a static IP address
3. ✅ Guide you to add DNS records to your registrar
4. ✅ Wait for DNS propagation
5. ✅ Update Cloud Run configuration
6. ✅ Test HTTPS connectivity

### Step 3: Validate Setup (After 30 minutes)
```bash
./validate-domain.sh
```

This will test:
- ✓ DNS resolution
- ✓ HTTP/HTTPS connectivity
- ✓ SSL certificate validity
- ✓ Security headers
- ✓ Cloud Run service status
- ✓ Application functionality

### Step 4: Commit Changes
```bash
git add CUSTOM_DOMAIN_INTEGRATION_GUIDE.md \
        DOMAIN_SETUP_QUICK_START.md \
        DOMAIN_INTEGRATION_SUMMARY.md \
        setup-custom-domain.sh \
        validate-domain.sh \
        .env

git commit -m "Configure: custom domain disha.rylneuroacademy.com"
git push origin main
```

---

## 🔍 Troubleshooting Guide

### DNS Not Resolving

**Problem:** `nslookup disha.rylneuroacademy.com` returns "not found"

**Solutions:**
```bash
# 1. Clear local DNS cache
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # macOS

# 2. Check registrar DNS settings are correct
# Go to your domain registrar and verify:
# - disha CNAME run.app
# OR
# - disha A 199.36.153.8

# 3. Wait 10-30 minutes for DNS propagation
# Different registrars take different times

# 4. Use different DNS servers
nslookup disha.rylneuroacademy.com 8.8.8.8  # Google DNS
```

### HTTPS Still Pending After 30 Minutes

**Problem:** `curl -I https://disha.rylneuroacademy.com` returns timeout

**Solutions:**
```bash
# 1. Verify Cloud Run service is healthy
gcloud run services describe disha-diagnostics --region asia-southeast1

# 2. Check recent logs
gcloud run services logs read disha-diagnostics --region asia-southeast1 --limit 50

# 3. Redeploy if necessary
git push origin main
# This triggers automatic redeployment

# 4. Wait another 5-10 minutes (Google takes time to provision certs)
```

### 502 Bad Gateway

**Problem:** `https://disha.rylneuroacademy.com` returns 502 error

**Solutions:**
```bash
# 1. Check if Cloud Run service is running
gcloud run services list --region asia-southeast1

# 2. View error logs
gcloud run services logs read disha-diagnostics --region asia-southeast1 --limit 100

# 3. Redeploy the service
git push origin main

# 4. If still failing, check server.ts for config errors
# Verify CORS settings, Firebase config, etc.
```

### App Loads But Firebase Doesn't Work

**Problem:** App shows but forms don't submit or data doesn't save

**Solutions:**
```bash
# 1. Check browser console for errors (F12)
# Look for Firebase auth errors

# 2. Verify Firebase configuration in .env
# All VITE_FIREBASE_* variables must be set correctly

# 3. Check Firestore rules allow the custom domain
# Go to Firebase Console → Firestore → Rules
# Ensure auth.auth.uid != null is configured

# 4. Test Firebase connection
curl -X POST https://disha.rylneuroacademy.com/api/test-firebase
```

---

## 📈 Monitoring After Setup

### Daily Checks
```bash
# Monitor uptime
curl -I https://disha.rylneuroacademy.com

# Check recent errors
gcloud run services logs read disha-diagnostics --region asia-southeast1 --limit 10
```

### Weekly Checks
```bash
# Full domain validation
./validate-domain.sh

# Check Cloud Run metrics
gcloud run services describe disha-diagnostics --region asia-southeast1 --format=yaml | grep -A 5 traffic
```

### Monthly Checks
```bash
# Verify SSL certificate still valid
echo | openssl s_client -connect disha.rylneuroacademy.com:443 -servername disha.rylneuroacademy.com 2>/dev/null | openssl x509 -noout -dates

# Review audit logs in Cloud Console
# Check for any misconfigurations
```

---

## 🔐 Security Considerations

### What's Automatically Protected
- ✅ HTTPS with automatic Google-managed SSL certificate
- ✅ TLS 1.2+ enforced
- ✅ HSTS (HTTP Strict Transport Security) enabled
- ✅ Data encrypted in transit
- ✅ Cloud Run automatically patches infrastructure

### Additional Recommendations
- ✅ Enable Cloud Armor for DDoS protection (if high traffic)
- ✅ Set up VPC Service Controls for extra isolation
- ✅ Enable audit logging in Cloud Console
- ✅ Regularly update dependencies
- ✅ Monitor Cloud Run security advisories

---

## 📞 Support Resources

### Google Cloud Documentation
- [Cloud Run custom domains](https://cloud.google.com/run/docs/mapping-custom-domains)
- [Cloud Run authentication](https://cloud.google.com/run/docs/authenticating)
- [Cloud Run security](https://cloud.google.com/run/docs/securing)

### DISHA Resources
- See `CUSTOM_DOMAIN_INTEGRATION_GUIDE.md` for comprehensive details
- See `DOMAIN_SETUP_QUICK_START.md` for quick reference
- Run `./validate-domain.sh` to troubleshoot issues

### Testing Tools
```bash
# DNS testing
nslookup disha.rylneuroacademy.com
dig disha.rylneuroacademy.com
host disha.rylneuroacademy.com

# SSL testing
openssl s_client -connect disha.rylneuroacademy.com:443
curl -I https://disha.rylneuroacademy.com

# HTTP header testing
curl -I https://disha.rylneuroacademy.com
curl -v https://disha.rylneuroacademy.com
```

---

## 🎓 How This Works (Technical Overview)

### Architecture
```
User Browser
    ↓
https://disha.rylneuroacademy.com
    ↓
DNS Resolver
    ↓
CNAME: run.app → Google Cloud Anycast
    ↓
Google Cloud Load Balancer (anycast)
    ↓
Cloud Run Service: disha-diagnostics
    ↓
Node.js Server (port 3000)
    ↓
React Frontend + Firebase
```

### Traffic Flow
1. User types `disha.rylneuroacademy.com` in browser
2. Browser resolves DNS → `run.app` (Google's anycast network)
3. Google's load balancer routes to nearest Cloud Run instance
4. Cloud Run serves the DISHA app
5. App authenticates with Firebase
6. Data stored in Firestore

### Why This Is Reliable
- ✅ Anycast routing ensures low latency
- ✅ Automatic failover if one instance fails
- ✅ Google manages infrastructure & scaling
- ✅ Free SSL certificates auto-renew
- ✅ No additional costs for domain mapping

---

## ✨ Next Steps After Domain is Live

1. **Announce the domain** to your team/users
   ```
   DISHA is now live at: https://disha.rylneuroacademy.com
   ```

2. **Update all references**
   - Website links
   - Email newsletters
   - Social media
   - Marketing materials

3. **Set up monitoring**
   ```bash
   gcloud alpha monitoring policies create \
     --display-name="DISHA Uptime" \
     --metric-type=run.googleapis.com/request_count
   ```

4. **Create status page** (optional)
   - Add domain to status monitoring service
   - Set up alerts for downtime

5. **Test from different locations**
   - Mobile networks
   - Different countries
   - Various browsers
   - VPN connections

---

## 📝 Checklist: Ready to Launch

- [ ] All DNS records added to registrar
- [ ] Cloud Run service configured with domain
- [ ] `./validate-domain.sh` passes all tests
- [ ] HTTPS working with valid certificate
- [ ] App loads and functions correctly
- [ ] Firebase authentication working
- [ ] Can submit diagnostic forms
- [ ] Data persists to Firestore
- [ ] Mobile testing completed
- [ ] Team notified of new domain
- [ ] Old domain redirects set up (if applicable)
- [ ] Monitoring configured

---

## 🎉 You're All Set!

Your DISHA Diagnostic Engine will be live at:

```
🌐 https://disha.rylneuroacademy.com
```

**Estimated setup time:** 30-45 minutes  
**Downtime required:** None (Cloud Run handles it)  
**Additional cost:** $0 (domain mapping is free)  

Good luck! If you run into issues, check the troubleshooting guide or review the comprehensive setup guide.

---

*Last updated: August 2, 2026*  
*DISHA Diagnostic Engine v1.0*
