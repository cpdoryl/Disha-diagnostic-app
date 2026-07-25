# Custom Domain Setup Guide - disha.rylneuroacademy.com

This guide will help you point your custom domain `disha.rylneuroacademy.com` to your Cloud Run application.

---

## PART 1: Get Cloud Run Service IP Address

First, we need to get the IP address or hostname of your Cloud Run service.

### Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in project: **disha-diagnostics**
3. Go to **Cloud Run**

### Step 2: Find Your Service

Look for: `disha-diagnostic-engine`

Click on it to view details.

### Step 3: Note the Service URL

You should see:
```
Service URL: https://disha-diagnostic-engine.ai.studio
```

Also note:
```
Region: asia-south1
```

### Step 4: Get the Ingress IP Address

The Cloud Run service uses a load balancer. To find the IP:

```bash
# Run this command in terminal/Cloud Shell:
gcloud compute forwarding-rules list --global
```

Or in the Cloud Run console, the IP should be listed under "Networking" or "Details".

**Look for the IP associated with Cloud Run in asia-south1 region**

**Copy this IP address** (e.g., `34.102.xxx.xxx`)

---

## PART 2: Update DNS Records

You need to point your domain to the Cloud Run service using DNS records.

### Where to Update DNS

You need to update DNS records at your domain registrar (where you registered `rylneuroacademy.com`).

Common registrars:
- GoDaddy
- Namecheap
- Google Domains
- Hostinger
- CloudFlare
- etc.

### Step 1: Log in to Your Domain Registrar

Go to your domain registrar's website and log in.

### Step 2: Find DNS Settings

Look for:
- **DNS Management**
- **DNS Settings**
- **Manage DNS Records**
- **Advanced DNS**

### Step 3: Add/Update DNS Record

You have two options:

#### **Option A: A Record (Recommended)**

```
Type:     A
Name:     disha
TTL:      3600 (or default)
Value:    <Cloud Run IP Address>
```

**Example:**
```
Type:     A
Name:     disha
TTL:      3600
Value:    34.102.123.456
```

#### **Option B: CNAME Record (Alternative)**

If A record doesn't work, use:

```
Type:     CNAME
Name:     disha
TTL:      3600
Value:    disha-diagnostic-engine.ai.studio
```

### Step 4: Save DNS Records

Click **Save** or **Update**

**⏱️ Important:** DNS changes can take 5-30 minutes to propagate globally. Be patient!

---

## PART 3: Set Up SSL Certificate

Your custom domain needs an SSL certificate for HTTPS.

### Option A: Using Google Cloud Certificate (Recommended)

#### Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **Compute Engine → SSL certificates**

#### Step 2: Create New Certificate

Click **CREATE CERTIFICATE**

Fill in:
```
Name:                 disha-rylneuroacademy
Type:                 Managed certificate
Domains:              disha.rylneuroacademy.com
```

Click **CREATE**

**⏠ Wait 15-30 minutes** for the certificate to be provisioned and verified.

#### Step 3: Verify Certificate Status

In SSL certificates list, check the status:
- 🟢 **Active** = Ready to use
- 🟡 **Provisioning** = Still being set up
- 🔴 **Failed** = Check DNS or domain validation

---

### Option B: Using Certbot/Let's Encrypt (Alternative)

If you prefer free certificates, you can use Let's Encrypt, but this requires more manual setup.

---

## PART 4: Configure Cloud Run for Custom Domain

### Step 1: Open Cloud Run Service

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **Cloud Run**
3. Click on: `disha-diagnostic-engine`

### Step 2: Go to Networking

Click on the **Networking** tab or **Edit & Deploy New Revision**

### Step 3: Configure HTTPS and Custom Domains

Look for options:
- **Ingress settings**: Should be set to allow all traffic
- **Authentication**: Should be set to allow unauthenticated
- **HTTP/HTTPS**: Make sure HTTPS is enabled

### Step 4: Map Custom Domain

In Cloud Run, you might see an option like:
- **Add Custom Domain**
- **Domain Mapping**

If available:
1. Click **Add Custom Domain**
2. Enter: `disha.rylneuroacademy.com`
3. Select your SSL certificate
4. Click **Map**

---

## PART 5: Test Your Custom Domain

### Wait for DNS to Propagate

After updating DNS:
1. **Wait 5-30 minutes** for changes to propagate
2. You can check propagation here: https://www.whatsmydns.net/

### Test the Domain

1. Open your browser
2. Visit: `https://disha.rylneuroacademy.com`
3. You should see your Disha app!

### Verify HTTPS Works

You should see:
- 🔒 **Green lock** in browser (HTTPS working)
- Your Disha app loading

### If It Doesn't Work

**Common issues:**

1. **DNS not propagated yet**
   - Wait another 10-15 minutes
   - Clear browser cache (Ctrl+Shift+Delete)
   - Try from a different device

2. **SSL certificate not ready**
   - Check certificate status in Google Cloud Console
   - Wait for it to show "Active"

3. **Wrong IP address in DNS**
   - Double-check the IP address you used
   - Get the latest IP from Cloud Run console
   - Update DNS records again

4. **DNS record not saved**
   - Log into domain registrar
   - Verify the DNS record is there
   - Check the values are correct

---

## PART 6: Update Application Configuration (If Needed)

If your app has any hardcoded URLs, update them:

### Check These Files:

1. **firebase-applet-config.json**
   ```json
   {
     "authDomain": "disha-diagnostics.firebaseapp.com",
     ...
   }
   ```
   This is fine as-is (Firebase domain)

2. **src/lib/firebase.ts**
   Check the Firebase config - should be fine

3. **server.ts**
   Check if there are any hardcoded URLs - update if needed

4. **.env / .env.example**
   Check for hardcoded URLs

### Update if Needed:

If you find hardcoded URLs like `https://disha-diagnostic-engine.ai.studio`, replace with:
```
https://disha.rylneuroacademy.com
```

Then commit and push:
```bash
git add .
git commit -m "Config: update domain to disha.rylneuroacademy.com"
git push origin main
```

---

## PART 7: Configure Cloud Run Ingress (Final Step)

Make sure Cloud Run accepts traffic from your custom domain:

### Step 1: Open Cloud Run Service

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **Cloud Run**
3. Click: `disha-diagnostic-engine`

### Step 2: Check Ingress Settings

Click **EDIT & DEPLOY NEW REVISION** or **Edit**

Look for **Ingress settings**:
```
☑️ Allow all traffic (should be checked)
```

If it's set to "Cloud Load Balancing only" or "Internal only", change it to "Allow all traffic"

Click **DEPLOY**

---

## PART 8: Redirect Old Domain (Optional)

If you want to redirect old URL to new domain:

In `.github/workflows/deploy.yml`, you can add a step to handle redirects, but Cloud Run doesn't do automatic redirects. 

**Alternative:** Set up a simple redirect in your server.ts:

```typescript
// In server.ts, add this middleware
app.use((req, res, next) => {
  if (req.hostname === 'disha-diagnostic-engine.ai.studio') {
    return res.redirect(301, `https://disha.rylneuroacademy.com${req.originalUrl}`);
  }
  next();
});
```

Then commit and push:
```bash
git add server.ts
git commit -m "Feature: redirect old domain to custom domain"
git push origin main
```

---

## QUICK REFERENCE CHECKLIST

```
☐ Step 1: Get Cloud Run IP address
  └─ IP Address: ___________________________

☐ Step 2: Update DNS Records
  └─ DNS Type: A Record
  └─ Name: disha
  └─ Value: (IP address from Step 1)
  └─ TTL: 3600
  └─ Status: ✅ Updated

☐ Step 3: Set Up SSL Certificate
  └─ Certificate Name: disha-rylneuroacademy
  └─ Domain: disha.rylneuroacademy.com
  └─ Status: ✅ Active (wait 15-30 min)

☐ Step 4: Configure Cloud Run
  └─ Ingress: Allow all traffic
  └─ Status: ✅ Configured

☐ Step 5: Test Custom Domain
  └─ Wait for DNS propagation (5-30 min)
  └─ Visit: https://disha.rylneuroacademy.com
  └─ Status: ✅ Working!

☐ Step 6: Update Application (if needed)
  └─ Check for hardcoded URLs
  └─ Update to: disha.rylneuroacademy.com

☐ Step 7: Set Up Redirects (optional)
  └─ Old domain redirects to new domain
```

---

## TROUBLESHOOTING

### Issue: Domain shows "Connection Refused"

**Solution:**
1. DNS hasn't propagated yet - wait 10-15 minutes
2. Check your DNS record is correct
3. Verify the IP address is correct from Cloud Run

### Issue: "Certificate Mismatch" or "Not Secure"

**Solution:**
1. SSL certificate might not be ready yet - wait 15-30 minutes
2. Make sure certificate status is "Active"
3. Clear browser cache

### Issue: "Cannot find server"

**Solution:**
1. DNS still propagating - wait 5-30 minutes
2. Verify DNS record was saved in your domain registrar
3. Check the record using: https://www.whatsmydns.net/

### Issue: App loads but shows old content

**Solution:**
1. Hard refresh browser: Ctrl+Shift+R
2. Clear cache
3. Wait for Cloud Run deployment (5-7 minutes)

---

## MONITORING

After setup, monitor your custom domain:

### Check SSL Certificate Status
- Go to **Compute Engine → SSL certificates**
- Look for `disha-rylneuroacademy`
- Status should be **Active** 🟢

### Check Cloud Run Service
- Go to **Cloud Run**
- Click `disha-diagnostic-engine`
- Verify traffic is being received

### Check Application Logs
- Go to **Cloud Run → Logs**
- Look for requests to your custom domain

---

## IMPORTANT NOTES

1. **DNS propagation takes time** - Be patient! 5-30 minutes is normal
2. **SSL certificate needs to be verified** - This is automatic with Google-managed certificates
3. **Update any links in your app** - If hardcoded URLs exist
4. **Keep the old URL** - It might be used by other systems, consider adding redirects
5. **Monitor your app** - Check logs after switching domains

---

## NEXT STEPS

1. **Get Cloud Run IP address** (Step 1)
2. **Update DNS records** at your domain registrar (Step 2)
3. **Create SSL certificate** in Google Cloud (Step 3)
4. **Configure Cloud Run** (Step 4)
5. **Test your custom domain** (Step 5)
6. **Update app configuration** if needed (Step 6)
7. **Monitor** everything is working correctly

Once done, your app will be accessible at:
```
✅ https://disha.rylneuroacademy.com
```

---

## GETTING HELP

If you get stuck:

1. **Check the troubleshooting section** above
2. **Verify DNS propagation:** https://www.whatsmydns.net/
3. **Check SSL certificate status** in Google Cloud Console
4. **Review Cloud Run logs** for errors
5. **Check browser console** (F12) for any errors

---

**You're almost done! Let's get your custom domain working!** 🚀
