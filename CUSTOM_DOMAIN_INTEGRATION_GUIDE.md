# DISHA Custom Domain Integration Guide
## Setting up disha.rylneuroacademy.com

**Last Updated:** August 2, 2026  
**Domain:** http://disha.rylneuroacademy.com  
**Cloud Run Service:** disha-diagnostics  
**Region:** asia-southeast1  

---

## Overview

This guide walks through mapping your custom domain `disha.rylneuroacademy.com` to your Google Cloud Run deployment of the DISHA Diagnostic Engine.

### What You'll Need
- ✅ Google Cloud Project with Cloud Run service deployed
- ✅ Domain registered (rylneuroacademy.com)
- ✅ Access to domain DNS settings
- ✅ Google Cloud Console access
- ✅ gcloud CLI installed locally

---

## Step 1: Verify Cloud Run Service Deployment

First, confirm your Cloud Run service is running and get its default URL:

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# List your Cloud Run services
gcloud run services list --region asia-southeast1

# Get the service details (especially the default URL)
gcloud run services describe disha-diagnostics --region asia-southeast1
```

**Expected Output:**
```
Service: disha-diagnostics
Status: Active
URL: https://disha-diagnostics-xxxxx-xxxxxxxxx.run.app
Region: asia-southeast1
```

Note down the **default Cloud Run URL** — you'll need this.

---

## Step 2: Update Cloud Run Service Configuration

Map your custom domain to the Cloud Run service:

```bash
# Add custom domain mapping to Cloud Run
gcloud run services update disha-diagnostics \
  --region asia-southeast1 \
  --update-env-vars DOMAIN=disha.rylneuroacademy.com

# Verify domain configuration
gcloud run services describe disha-diagnostics \
  --region asia-southeast1 \
  --format='value(metadata.annotations."run.googleapis.com/custom-domains")'
```

---

## Step 3: Configure DNS Records

You need to point your domain to Google Cloud Run's static IP address.

### Option A: Using Google Cloud Managed Certificate (Recommended)

If your domain is registered with Google Domains or managed via Cloud DNS:

#### 3a. Create Cloud Armor / Cloud Load Balancer

Google Cloud Run recommends using Cloud Load Balancer with a managed SSL certificate:

```bash
# Create a static IP address
gcloud compute addresses create disha-ip \
  --global

# Get the static IP
STATIC_IP=$(gcloud compute addresses describe disha-ip --global --format="value(address)")
echo "Static IP: $STATIC_IP"
```

#### 3b. Create Load Balancer (Advanced Setup)

If you want HTTPS and advanced features:

```bash
# Create a backend service pointing to Cloud Run
gcloud compute backend-services create disha-backend \
  --global \
  --protocol=HTTP2 \
  --load-balancing-scheme=EXTERNAL

# Add Cloud Run service as backend
gcloud compute backend-services add-backends disha-backend \
  --global \
  --instance-group=cloud-run \
  --instance-group-zone=global

# Create URL map
gcloud compute url-maps create disha-urlmap \
  --default-service=disha-backend

# Create HTTPS proxy with managed certificate
gcloud compute ssl-certificates create disha-cert \
  --domains=disha.rylneuroacademy.com

gcloud compute target-https-proxies create disha-proxy \
  --url-map=disha-urlmap \
  --ssl-certificates=disha-cert

# Create forwarding rule
gcloud compute forwarding-rules create disha-https \
  --global \
  --target-https-proxy=disha-proxy \
  --address=disha-ip \
  --ports=443
```

### Option B: Simple DNS Mapping (Faster Setup)

If you want a quicker setup without Load Balancer:

```bash
# Get the Cloud Run service's IP (it uses anycast)
# Cloud Run uses these DNS records:
# - CNAME to: run.app
# - A record to: Google's anycast IP (in asia-southeast1)

# For asia-southeast1 region, use:
CLOUD_RUN_IP="199.36.153.8"  # Or get the latest from GCP docs
```

---

## Step 4: Update DNS Records at Your Domain Registrar

Log into your domain registrar (where rylneuroacademy.com is registered) and add:

### Option A: CNAME Record (Recommended for Cloud Run)

```
Host:  disha
Type:  CNAME
Value: run.app
TTL:   3600 (1 hour) or 300 (5 minutes for testing)
```

**Example DNS entry:**
```
disha.rylneuroacademy.com CNAME run.app
```

### Option B: A Record (If CNAME not available)

```
Host:  disha
Type:  A
Value: 199.36.153.8 (or latest Google Cloud Run IP)
TTL:   3600
```

### Option C: HTTPS with Custom Certificate

If using Cloud Load Balancer setup above:

```
Host:  disha
Type:  A
Value: <STATIC_IP_FROM_STEP_3>
TTL:   3600

TXT:   acme-challenge records (for SSL cert validation)
```

---

## Step 5: Configure Google Cloud to Route Domain Traffic

### Via Cloud Run Console

1. Go to [Google Cloud Console → Cloud Run](https://console.cloud.google.com/run)
2. Select **disha-diagnostics** service
3. Click **Manage Custom Domains**
4. Click **Add Mapping**
5. Enter: `disha.rylneuroacademy.com`
6. Select verification method (DNS TXT record)
7. Follow verification steps

### Via gcloud CLI

```bash
# Update Cloud Run service with domain association
gcloud run services update disha-diagnostics \
  --region asia-southeast1 \
  --set-cloudsql-instances="" \
  --labels=domain=disha.rylneuroacademy.com

# Note: Cloud Run will handle SSL certificate automatically via Google-managed cert
```

---

## Step 6: Verify Domain Mapping

### Test DNS Resolution

```bash
# Test DNS resolution
nslookup disha.rylneuroacademy.com

# Expected output:
# Name: disha.rylneuroacademy.com
# Address: <Google Cloud IP or run.app>
```

### Test HTTP/HTTPS Access

```bash
# Test the domain
curl -I https://disha.rylneuroacademy.com/

# Expected response:
# HTTP/2 200
# content-type: text/html
```

### Browser Test

Navigate to: `https://disha.rylneuroacademy.com`

You should see your DISHA Diagnostic Engine app load successfully.

---

## Step 7: Environment Configuration

Update your application environment variables to recognize the custom domain:

### `.env` File

```env
# Custom Domain Configuration
DOMAIN=disha.rylneuroacademy.com
NODE_ENV=production
FORCE_HTTPS=true

# Firebase Configuration
VITE_FIREBASE_API_KEY=<your_key>
VITE_FIREBASE_PROJECT_ID=<your_project>
VITE_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
VITE_FIREBASE_DATABASE_URL=<your_db_url>
VITE_FIREBASE_STORAGE_BUCKET=<your_bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>

# Server Configuration
PORT=3000
```

### server.ts Configuration

Ensure your server is configured to handle the custom domain:

```typescript
import express from 'express';

const app = express();
const ALLOWED_DOMAINS = [
  'disha.rylneuroacademy.com',
  'localhost:3000',
  'http://localhost:3000'
];

// CORS Configuration
app.use(cors({
  origin: ALLOWED_DOMAINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.get('host')}${req.url}`);
    }
    next();
  });
}
```

---

## Step 8: SSL/TLS Certificates

Google Cloud Run automatically provisions **free SSL/TLS certificates** for your domain via Google-managed certificates. No additional configuration needed.

### Verify SSL Certificate

```bash
# Check SSL certificate validity
openssl s_client -connect disha.rylneuroacademy.com:443 -servername disha.rylneuroacademy.com

# Or use curl for a quick test
curl -I https://disha.rylneuroacademy.com/

# Expected headers:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Content-Type-Options: nosniff
```

---

## Step 9: Deploy and Test

### Redeploy the Application

```bash
# Push changes to main branch
git add .
git commit -m "Configure: custom domain disha.rylneuroacademy.com"
git push origin main

# GitHub Actions will automatically:
# 1. Build Docker image
# 2. Push to Google Container Registry
# 3. Deploy to Cloud Run
# 4. Update service configuration
```

### Verify Deployment

```bash
# Check deployment status
gcloud run services describe disha-diagnostics --region asia-southeast1

# Check recent revisions
gcloud run revisions list --region asia-southeast1
```

### Full End-to-End Test

1. **DNS Propagation:** Allow 5-30 minutes for DNS to propagate globally
2. **Test HTTPS:** Navigate to `https://disha.rylneuroacademy.com`
3. **Check SSL:** Look for green padlock in browser
4. **Functional Test:** Run through the DISHA diagnostic workflow
5. **Mobile Test:** Test on mobile device to ensure responsive design

---

## Troubleshooting

### Issue: Domain Resolves to Wrong IP

**Solution:**
```bash
# Clear local DNS cache
# On Windows:
ipconfig /flushdns

# On macOS:
sudo dscacheutil -flushcache

# On Linux:
sudo systemctl restart systemd-resolved

# Re-test DNS
nslookup disha.rylneuroacademy.com
```

### Issue: Certificate Not Found / SSL Error

**Solution:**
```bash
# Verify Cloud Run service configuration
gcloud run services describe disha-diagnostics --region asia-southeast1

# Recreate managed certificate if needed
gcloud compute ssl-certificates delete disha-cert
gcloud compute ssl-certificates create disha-cert \
  --domains=disha.rylneuroacademy.com

# Wait 15-30 minutes for certificate provisioning
```

### Issue: CORS Errors in Browser Console

**Solution:**
Update `ALLOWED_DOMAINS` in server.ts to include your custom domain:

```typescript
const ALLOWED_DOMAINS = [
  'https://disha.rylneuroacademy.com',
  'https://www.disha.rylneuroacademy.com',
  'localhost:3000'
];
```

### Issue: 502 Bad Gateway

**Solution:**
```bash
# Check Cloud Run service health
gcloud run services describe disha-diagnostics \
  --region asia-southeast1 \
  --format='value(status.conditions[].message)'

# View recent logs
gcloud run services logs read disha-diagnostics \
  --region asia-southeast1 \
  --limit 50

# Redeploy the service
gcloud run deploy disha-diagnostics \
  --region asia-southeast1 \
  --allow-unauthenticated
```

---

## Monitoring & Maintenance

### Set Up Monitoring

```bash
# Create Cloud Monitoring alert for 5xx errors
gcloud alpha monitoring policies create \
  --notification-channels=<CHANNEL_ID> \
  --display-name="DISHA Domain 5xx Errors" \
  --condition-display-name="Cloud Run 5xx Rate" \
  --metric-type=run.googleapis.com/request_count \
  --condition-threshold-value=10

# View real-time metrics
gcloud run services describe disha-diagnostics \
  --region asia-southeast1 \
  --format='value(status.traffic)'
```

### Regular Checks

- **Weekly:** Check uptime and SSL certificate status
- **Monthly:** Review Cloud Run logs for errors
- **Quarterly:** Audit domain and DNS configuration

---

## DNS Configuration Summary

| Record Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | disha | run.app | 3600 |
| OR A | disha | 199.36.153.8 | 3600 |
| TXT | (for SSL verification) | (auto-generated) | 300 |

---

## Files to Commit

After completing this setup, commit these changes:

```bash
git add .env server.ts CUSTOM_DOMAIN_INTEGRATION_GUIDE.md
git commit -m "Configure: custom domain integration for disha.rylneuroacademy.com"
git push origin main
```

---

## Support & Documentation

**Google Cloud Run Documentation:**
- [Mapping custom domains](https://cloud.google.com/run/docs/mapping-custom-domains)
- [Using Cloud Load Balancer with Cloud Run](https://cloud.google.com/load-balancing/docs/https)
- [SSL certificate management](https://cloud.google.com/docs/authentication/production#getting_started_with_authentication)

**DISHA Diagnostic Engine:**
- Deployed Service: `disha-diagnostics`
- Region: `asia-southeast1`
- Docker Registry: `gcr.io/<PROJECT_ID>/disha-diagnostics`

---

**Next Steps:**
1. ✅ Configure DNS records at your domain registrar
2. ✅ Wait for DNS propagation (5-30 minutes)
3. ✅ Verify domain mapping in Cloud Console
4. ✅ Test HTTPS access
5. ✅ Monitor logs for errors
6. ✅ Update any hardcoded URLs in the application

Your DISHA Diagnostic Engine will be live at **https://disha.rylneuroacademy.com** within the next 30 minutes!
