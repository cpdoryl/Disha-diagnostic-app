# 🚀 STEP 1: CUSTOM DOMAIN TESTING & VALIDATION GUIDE

**Date:** August 30, 2026  
**Custom Domain:** https://disha.rylneuroacademy.com/  
**Purpose:** Complete Step 1 testing on your custom domain  
**Status:** 🟢 **READY TO EXECUTE**

---

## 📋 STEP 1 OVERVIEW

### What is Step 1?
Step 1 is the **initial verification** that your application is accessible and functional on your custom domain before proceeding with full user acceptance testing.

### What You'll Verify
```
✅ Domain accessibility
✅ SSL/HTTPS connection
✅ Application loads successfully
✅ Basic UI functionality
✅ Navigation works
✅ No 404 errors
```

### Time Required
**5-10 minutes** (simple accessibility check)

---

## 🎯 STEP 1: ACCESS & BASIC VERIFICATION

### Prerequisites
```
✅ Custom domain registered: disha.rylneuroacademy.com
✅ DNS configured correctly
✅ SSL certificate installed
✅ Application deployed to domain
✅ Internet connection active
```

### Step 1.1: Open Your Browser

**ACTION:**
```
1. Open any web browser (Chrome recommended)
2. In address bar, type: https://disha.rylneuroacademy.com/
3. Press Enter
```

**EXPECTED RESULT:**
```
✅ Page loads without errors
✅ No SSL/certificate warning
✅ URL shows: https://disha.rylneuroacademy.com/
✅ Page completes loading in <2 seconds
```

**WHAT YOU SHOULD SEE:**
```
- Browser tab title: DISHA Diagnostic Engine
- Header with application logo/name
- Main dashboard or landing page
- No error messages
- No white screen of death
```

**OBSERVATION:**
```
Page loaded successfully?      ☐ Yes  ☐ No
Time to load:                  _______ seconds
Any errors displayed?          ☐ Yes  ☐ No
```

---

### Step 1.2: Verify SSL Certificate

**ACTION:**
```
1. Click the lock icon next to URL
2. Click "Certificate" or "Connection is secure"
3. Review certificate details
```

**EXPECTED RESULT:**
```
✅ Lock icon shows (not crossed out)
✅ Certificate is valid
✅ Certificate issued to: disha.rylneuroacademy.com
✅ Certificate not expired
✅ Connection is secure (green)
```

**OBSERVATION:**
```
Lock icon visible?             ☐ Yes  ☐ No
Certificate valid?             ☐ Yes  ☐ No
Domain matches URL?            ☐ Yes  ☐ No
```

---

### Step 1.3: Check Network Tab (Developer Tools)

**ACTION:**
```
1. Press F12 to open Developer Tools
2. Click "Network" tab
3. Refresh page (F5 or Ctrl+R)
4. Watch network requests complete
```

**EXPECTED RESULT:**
```
✅ All requests complete (green checkmarks)
✅ No 404 errors (red)
✅ No 500 errors (red)
✅ Main document: 200 OK
✅ CSS files: 200 OK
✅ JavaScript files: 200 OK
✅ Image files: 200 OK
```

**OBSERVATION:**
```
Total requests:                ________
Failed requests:               ________
404 errors:                    ________
500 errors:                    ________
Largest response time:         _______ ms
```

---

### Step 1.4: Verify Application Elements

**ACTION:**
```
1. Close Developer Tools (F12)
2. Scroll down the page
3. Look for these elements:
```

**CHECK EACH ELEMENT:**

```
Header Section:
  ☐ Application logo visible
  ☐ Application title visible
  ☐ Navigation menu present
  ☐ Menu items clickable

Main Content:
  ☐ Dashboard or landing content displayed
  ☐ No broken layouts
  ☐ Text readable
  ☐ Images load correctly

Buttons:
  ☐ "Create Assessment" button visible
  ☐ Buttons appear clickable
  ☐ No disabled buttons unexpectedly

Responsiveness:
  ☐ Content fits screen width
  ☐ No horizontal scrolling needed
  ☐ Mobile menu (if applicable) works
```

---

### Step 1.5: Test Basic Navigation

**ACTION:**
```
1. Click on any menu item
2. Observe page navigation
3. Click browser back button
4. Click another menu item
```

**EXPECTED RESULT:**
```
✅ Menu items are clickable
✅ Page changes when clicking
✅ Back button works
✅ No "Page not found" errors
✅ URLs update correctly
```

**OBSERVATION:**
```
Menu responsive?               ☐ Yes  ☐ No
Navigation working?            ☐ Yes  ☐ No
Back button functional?        ☐ Yes  ☐ No
URLs updating?                 ☐ Yes  ☐ No
```

---

### Step 1.6: Check Console for Errors

**ACTION:**
```
1. Press F12 to open Developer Tools
2. Click "Console" tab
3. Look for any red error messages
```

**EXPECTED RESULT:**
```
✅ No critical JavaScript errors (red)
✅ Warnings are acceptable (yellow)
✅ Info messages are fine (blue)
✅ Console is mostly clean
```

**OBSERVATION:**
```
Critical errors present?       ☐ Yes  ☐ No
Console warnings?              ☐ Yes  ☐ No
Application log messages?      ☐ Yes  ☐ No
Console overall status:        ________
```

---

## ✅ STEP 1 COMPLETION CHECKLIST

### Required Items (ALL Must Pass)

```
Domain Accessibility:
  ☐ Domain accessible at https://disha.rylneuroacademy.com/
  ☐ HTTPS connection working
  ☐ SSL certificate valid
  ☐ Page loads within 2 seconds

Application Functionality:
  ☐ Page displays content
  ☐ No 404/500 errors
  ☐ Navigation works
  ☐ Buttons are clickable
  ☐ Responsiveness working

Browser Health:
  ☐ No critical JavaScript errors
  ☐ No security warnings
  ☐ Network requests successful
  ☐ CSS/JS files load correctly
```

---

## 🎯 STEP 1 VALIDATION SUMMARY

### Checklist Results

```
✅ PASS: All items checked
☐ FAIL: One or more items failed
☐ PARTIAL: Some items need attention
```

### If ALL Checked ✅
```
🟢 STATUS: STEP 1 PASSED
Next Action: Proceed to STEP 2 - Feature Testing
Read: USER_ACCEPTANCE_TESTING_GUIDE.md for next steps
```

### If Any Failed ☐
```
🔴 STATUS: STEP 1 FAILED
Issue Identified: _________________________
Action Required:
  1. Note the specific error
  2. Check domain configuration
  3. Verify SSL certificate
  4. Check application logs
  5. Retry Step 1
```

---

## 🔧 TROUBLESHOOTING STEP 1

### Issue: Domain Not Accessible

**Error Message:** "Cannot reach server" or "ERR_NAME_NOT_RESOLVED"

**Solutions:**
```
1. Verify domain name spelling (check for typos)
2. Wait 5 minutes (DNS propagation may still be pending)
3. Try in incognito mode (clears cache)
4. Restart router/network
5. Ping domain: ping disha.rylneuroacademy.com
```

### Issue: SSL Certificate Error

**Error Message:** "Your connection is not private" or "NET::ERR_CERT_AUTHORITY_INVALID"

**Solutions:**
```
1. Verify SSL certificate is installed
2. Check certificate expiration date
3. Ensure domain matches certificate
4. Try clicking "Advanced" → "Proceed anyway" (temporary)
5. Contact hosting provider for certificate issues
```

### Issue: Page Loads Slowly (>5 seconds)

**Possible Causes:**
```
1. Network connection slow
2. Server processing slow
3. Application still initializing
4. Browser cache needs clearing
```

**Solutions:**
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Try different browser
3. Check internet speed
4. Wait for application to fully deploy
5. Check server logs
```

### Issue: Elements Not Displaying

**Possible Causes:**
```
1. CSS files not loading
2. Images failing to load
3. JavaScript not executing
4. Browser compatibility issue
```

**Solutions:**
```
1. Check Network tab for failed CSS/JS
2. Check console for errors
3. Try different browser
4. Hard refresh (Ctrl+Shift+R)
5. Check file paths in application
```

---

## 📊 STEP 1 TESTING REPORT

### Document Your Results

```
Test Date:                     ________________
Tester Name:                   ________________
Domain Tested:                 https://disha.rylneuroacademy.com/

ACCESSIBILITY:
  ☐ Domain accessible
  ☐ HTTPS working
  ☐ SSL valid
  ☐ Load time acceptable

FUNCTIONALITY:
  ☐ Content displayed
  ☐ No 404/500 errors
  ☐ Navigation works
  ☐ Buttons functional

BROWSER HEALTH:
  ☐ No JavaScript errors
  ☐ Network requests OK
  ☐ CSS/JS loaded
  ☐ Console clean

OVERALL RESULT:
  ☐ PASS - Ready for Step 2
  ☐ FAIL - Needs fixing
  ☐ PARTIAL - Some issues

Issues Found (if any):
  _________________________________
  _________________________________
  _________________________________

Resolution:
  _________________________________
  _________________________________
```

---

## 🚀 NEXT STEPS AFTER STEP 1

### If Step 1 Passed ✅

**Proceed to STEP 2:**
```
Read: USER_ACCEPTANCE_TESTING_GUIDE.md

Step 2 covers:
  ✅ Create Assessment
  ✅ Share Assessment Link
  ✅ User Response Testing
  ✅ Dashboard Verification
  ✅ First Opinion Engine
  ✅ Report Generation
  ✅ Data Export
```

### If Step 1 Failed ❌

**Before Proceeding:**
```
1. Fix the identified issue
2. Retry Step 1
3. Ensure all checklist items pass
4. Only then move to Step 2
```

---

## 📱 DEVICE TESTING

### Test on Multiple Devices

After Step 1 passes on desktop, test on:

```
Mobile Device (Phone):
  ☐ iPhone - Safari
  ☐ Android - Chrome
  ☐ Domain accessible
  ☐ Page responsive

Tablet:
  ☐ iPad - Safari
  ☐ Android Tablet - Chrome
  ☐ Domain accessible
  ☐ Layout responsive
```

---

## 💡 IMPORTANT NOTES

### DNS Propagation
```
- Domain changes can take up to 24 hours to propagate globally
- If not working immediately, wait and retry
- Use: https://www.whatsmydns.net to check propagation
```

### SSL Certificate
```
- Certificate must match domain name exactly
- Common issue: www.disha vs disha (with/without www)
- Let's Encrypt certificate auto-renews (usually fine)
```

### Caching Issues
```
- Browser cache can show old version
- Clear cache: Ctrl+Shift+Delete (Chromium)
- Try incognito mode for fresh load
- Hard refresh: Ctrl+Shift+R
```

---

## ✨ QUICK REFERENCE

### Step 1 in 30 Seconds

```
1. Open: https://disha.rylneuroacademy.com/
2. Wait for page to load
3. Check for lock icon (HTTPS)
4. Look for content
5. No errors?
   → ✅ PASS - Continue to Step 2
   → ❌ FAIL - Troubleshoot
```

---

## 🎊 STEP 1 COMPLETE!

Once all checklist items are checked ✅:

```
🟢 STEP 1 PASSED
Domain: https://disha.rylneuroacademy.com/
Status: Accessible and Functional
Next: USER_ACCEPTANCE_TESTING_GUIDE.md (Step 2)
```

---

**Guide Created:** August 30, 2026  
**Custom Domain:** https://disha.rylneuroacademy.com/  
**Status:** 🟢 **READY FOR TESTING**

