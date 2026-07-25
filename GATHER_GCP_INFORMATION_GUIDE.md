# Step-by-Step Guide: Gathering Your Google Cloud Information

This guide shows you **exactly where and how** to find all the information needed to connect your local development to your existing Google Cloud deployment.

---

## SECTION 1: GCP Project ID

### Where to Find It:

**Method 1: From Google Cloud Console Dashboard**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Look at the **top left corner** of the page
3. You should see:
   ```
   [Google Cloud Logo] [Project Name] ▼
   ```
4. Click on the dropdown arrow (▼)
5. A panel will appear showing:
   ```
   ┌─────────────────────────────────┐
   │ Disha Diagnostic App             │
   │ ID: disha-diagnostic-app-12345   │  ← Copy this ID
   │ Number: 123456789                │
   └─────────────────────────────────┘
   ```

**Copy the ID value** (e.g., `disha-diagnostic-app-12345`)

---

**Method 2: From Project Settings**

1. In Google Cloud Console, click the **Settings icon** (⚙️) in the top right
2. Click **Project Settings**
3. Look for **Project ID** field
4. Copy the value

---

**✅ TASK 1: Write Down Your GCP Project ID:**
```
GCP Project ID: _______________________________
```

---

## SECTION 2: Cloud Run Service Name & Details

### Where to Find It:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. In the left sidebar, look for **Cloud Run** under the "Compute" section
   - If you don't see it, click the **≡ Menu** (hamburger icon) in top left
   - Search for "Cloud Run"

3. Click **Cloud Run**

4. You should see a list of services. Look for your app service:
   ```
   ┌────────────────────────────────────────────────┐
   │ Services                                       │
   ├────────────────────────────────────────────────┤
   │ disha-diagnostic-platform                      │  ← Your service
   │ Status: Deployed                               │
   │ Region: us-central1                            │
   │ URL: https://disha-diagnostic-platform-...     │
   └────────────────────────────────────────────────┘
   ```

5. Click on your service name to view details

### Information You'll See:

On the service details page, note:

**Service Name:**
- Displayed at the top (e.g., `disha-diagnostic-platform`)

**Service Region:**
- Shows in the service details (e.g., `us-central1`)
- Can also see it in the list next to "Region:"

**Service URL (Live Application URL):**
- Shows as "Service URL" on the service details page
- Format: `https://disha-diagnostic-platform-xxxxxx.run.app`
- This is your **live deployed application URL**

---

**✅ TASK 2: Write Down Cloud Run Information:**
```
Cloud Run Service Name: _______________________________
Cloud Run Service Region: ______________________________
Cloud Run Service URL: _________________________________
```

---

## SECTION 3: Firestore Database Information

### Where to Find It:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Click the **≡ Menu** (hamburger icon) in top left

3. Under "Analytics" section, look for **Firestore**

4. Click **Firestore**

5. You should see your database:
   ```
   ┌────────────────────────────────────────────────┐
   │ Databases                                      │
   ├────────────────────────────────────────────────┤
   │ (default)                    [details]          │
   │ Type: Cloud Firestore (Native mode)             │
   │ Region: us-central1                            │
   │ Status: Ready                                   │
   └────────────────────────────────────────────────┘
   ```

### Information You'll See:

**Database Name:**
- Usually called `(default)`
- Shows in the Databases list

**Database Region:**
- Shows next to "Region:" (e.g., `us-central1`, `europe-west1`)

**Database ID:**
- Usually the same as the project ID for the default database

---

**✅ TASK 3: Write Down Firestore Information:**
```
Firestore Database Name: _______________________________
Firestore Database Region: ______________________________
```

---

## SECTION 4: Service Account JSON Key

### Step 1: Check if Service Account Exists

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Click **≡ Menu** in top left

3. Go to **IAM & Admin → Service Accounts**

4. You should see a list of service accounts:
   ```
   ┌──────────────────────────────────────────────┐
   │ Service Accounts                             │
   ├──────────────────────────────────────────────┤
   │ github-actions-deployer@...  [✓ Default]    │
   │ terraform@...                                │
   │ firebase-adminsdk-...                        │
   └──────────────────────────────────────────────┘
   ```

5. Look for one named:
   - `github-actions-deployer`
   - `github-deployment`
   - `ci-cd-deployer`
   - Or any service account used for deployments

---

### Step 2: Get or Create the JSON Key

**If a service account already exists:**

1. Click on the service account name (e.g., `github-actions-deployer`)

2. Go to **KEYS** tab

3. You should see:
   ```
   ┌──────────────────────────────────────────────┐
   │ Keys                                         │
   │ [+ ADD KEY] [Create new key]                │
   ├──────────────────────────────────────────────┤
   │ Key ID          Type    Created   Actions   │
   │ a1b2c3d4e5f6    JSON    2024-01   [Delete]  │
   │ f6e5d4c3b2a1    JSON    2024-06   [Delete]  │
   └──────────────────────────────────────────────┘
   ```

4. If a JSON key exists, you can **download** it:
   - Click the **key ID** or the **⋮ menu** next to it
   - Click **Download** or **Create similar key**

5. If no JSON key exists, click **ADD KEY → Create new key**:
   - Select **JSON** format
   - Click **CREATE**
   - The file will automatically download

---

**If no service account exists, create one:**

1. In **IAM & Admin → Service Accounts**, click **CREATE SERVICE ACCOUNT**

2. Fill in:
   - **Service account name:** `github-actions-deployer`
   - **Service account ID:** (auto-fills)
   - **Description:** `Service account for GitHub Actions CI/CD`

3. Click **CREATE AND CONTINUE**

4. **Grant Roles:**
   - Click **+ ADD ANOTHER ROLE** for each role:
     - Cloud Run Admin
     - Firestore Admin (or Firebase Admin)
     - Service Account User
     - Artifact Registry Administrator
     - Container Registry Service Agent

5. Click **CONTINUE → DONE**

6. Go back to the service account, click **KEYS** tab

7. Click **ADD KEY → Create new key**

8. Select **JSON** format and click **CREATE**

9. The JSON file will download

---

### Step 3: Verify Service Account Roles

1. Back on the service account details page

2. Go to **PERMISSIONS** tab (or look for "Roles" section)

3. Verify these roles are listed:
   ```
   ✅ Cloud Run Admin
   ✅ Firestore Admin (or Firebase Admin)
   ✅ Service Account User
   ✅ Artifact Registry Administrator
   ✅ Container Registry Service Agent
   ```

4. If any role is missing:
   - Note down which ones are missing
   - You'll need to ask a GCP admin to add them, OR
   - Go to **IAM & Admin → IAM**, find your service account email, and add the missing roles

---

**✅ TASK 4: Regarding Service Account JSON Key:**
```
Do you have an existing service account JSON key? 
☐ Yes - I found and downloaded it (keep it safe!)
☐ No - I need to create one (follow steps above)

Service Account Email: _______________________________
(Format: github-actions-deployer@disha-diagnostic-app-12345.iam.gserviceaccount.com)

Service Account Roles Present:
☐ Cloud Run Admin
☐ Firestore Admin
☐ Service Account User
☐ Artifact Registry Administrator
☐ Container Registry Service Agent
```

---

## SECTION 5: Firebase Configuration

### Where to Find It:

1. Go to [Firebase Console](https://console.firebase.google.com/)

2. Click on your project (e.g., "Disha Diagnostic App")

3. You're now in your Firebase project

4. Click the **Settings icon** (⚙️) in the top right corner

5. Click **Project settings**

### In Project Settings Page:

You should see multiple tabs:
```
[General] [Service Accounts] [Usage and billing] [Integrations]
```

Make sure you're on the **General** tab.

---

### Scroll Down to "Your Apps" Section

You should see:
```
┌────────────────────────────────────────────────────┐
│ Your apps                                          │
├────────────────────────────────────────────────────┤
│ Web                                                │
│ 🌐 Disha Diagnostic App                           │
│ ┌─ Config ─────────────────────────────────────┐  │
│ │ const firebaseConfig = {                     │  │
│ │   apiKey: "AIzaSyD...",                      │  │
│ │   authDomain: "disha-diag...firebaseapp.com",│  │
│ │   projectId: "disha-diagnostic-app-12345",   │  │
│ │   storageBucket: "disha-diagnostic-app....", │  │
│ │   messagingSenderId: "123456789",            │  │
│ │   appId: "1:123456789:web:abc123def456"     │  │
│ │ }                                            │  │
│ └────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### Copy the Configuration:

1. Look for the **Web app configuration** box

2. You'll see a code snippet with these values:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```

3. **Copy each value:**

   - **API Key:** The value after `apiKey: "..."`
     - Example: `AIzaSyD7xr0mV1b2c3d4e5f6g7h8i9j0k1l2m3n`

   - **Auth Domain:** The value after `authDomain: "..."`
     - Example: `disha-diagnostic-app-12345.firebaseapp.com`

   - **Project ID:** The value after `projectId: "..."`
     - Example: `disha-diagnostic-app-12345`

   - **Storage Bucket:** The value after `storageBucket: "..."`
     - Example: `disha-diagnostic-app-12345.appspot.com`

   - **Messaging Sender ID:** The value after `messagingSenderId: "..."`
     - Example: `123456789`

   - **App ID:** The value after `appId: "..."`
     - Example: `1:123456789:web:abc123def456ghi789`

---

**✅ TASK 5: Write Down Firebase Configuration:**
```
API Key: _________________________________________________________________

Auth Domain: _____________________________________________________________

Project ID: ______________________________________________________________

Storage Bucket: __________________________________________________________

Messaging Sender ID: _____________________________________________________

App ID: __________________________________________________________________
```

---

## SUMMARY CHECKLIST

Copy and fill in this complete checklist with all the information you gathered:

```
╔════════════════════════════════════════════════════════════╗
║     COMPLETE GCP & FIREBASE INFORMATION CHECKLIST         ║
╚════════════════════════════════════════════════════════════╝

1. GCP Project Information:
   ─────────────────────────────────────────────────────────
   GCP Project ID:
   _________________________________________________________________

2. Cloud Run Service Information:
   ─────────────────────────────────────────────────────────
   Service Name:
   _________________________________________________________________
   
   Service Region:
   _________________________________________________________________
   
   Service URL (Live App):
   _________________________________________________________________

3. Firestore Database Information:
   ─────────────────────────────────────────────────────────
   Database Name:
   _________________________________________________________________
   
   Database Region:
   _________________________________________________________________

4. Service Account Information:
   ─────────────────────────────────────────────────────────
   Service Account Email:
   _________________________________________________________________
   
   Service Account has JSON Key?  ☐ Yes  ☐ No
   
   Roles Present:
   ☐ Cloud Run Admin
   ☐ Firestore Admin
   ☐ Service Account User
   ☐ Artifact Registry Administrator
   ☐ Container Registry Service Agent

5. Firebase Configuration:
   ─────────────────────────────────────────────────────────
   API Key:
   _________________________________________________________________
   
   Auth Domain:
   _________________________________________________________________
   
   Project ID:
   _________________________________________________________________
   
   Storage Bucket:
   _________________________________________________________________
   
   Messaging Sender ID:
   _________________________________________________________________
   
   App ID:
   _________________________________________________________________
```

---

## NEXT STEPS

Once you've gathered all this information:

1. **Copy this checklist and fill in your values**
2. **Share the completed checklist with me**
3. I'll help you:
   - Add GitHub secrets
   - Configure local Firebase connection
   - Set up GitHub Actions workflow
   - Test everything end-to-end

---

## IMPORTANT REMINDERS

⚠️ **SECURITY:**
- ✅ DO copy the API Key and Firebase config - they're public
- ✅ DO download the service account JSON key and keep it safe
- ❌ DON'T share the service account JSON key with anyone
- ❌ DON'T commit the JSON key to GitHub (only use in GitHub Secrets)
- ❌ DON'T post this information in public forums

---

## NEED HELP?

If you can't find something:

1. **Can't find Cloud Run?**
   - Make sure you're in the right GCP project
   - Use the search bar at the top to search for "Cloud Run"

2. **Can't find Firestore?**
   - Make sure it's enabled in your project
   - Go to APIs & Services to enable "Cloud Firestore API"

3. **Can't find Service Accounts?**
   - Go to IAM & Admin → Service Accounts
   - Make sure you have "Service Account Admin" role

4. **Still stuck?**
   - Take screenshots of the console
   - Share them so I can help guide you to the right location

---

**Good luck! Once you have all this information, we can complete the setup.** 🚀
