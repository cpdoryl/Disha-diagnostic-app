# 🔧 FIX: Create (default) Firestore Database

## ✅ QUICK FIX (3 minutes)

### Step 1: Go to Firebase Console
```
https://console.firebase.google.com/project/disha-diagnostics/firestore/databases
```

### Step 2: Click "Create Database"

### Step 3: Configure Database
```
Name: (default)
Location: asia-south1 (India)
Security Rules: Start in test mode
  (We'll update rules after)
```

### Step 4: Click "Create"

Wait 2-3 minutes for database to be created.

### Step 5: Verify
You should now see:
```
✅ (default) - asia-south1
✅ ai-studio-dishadiagnostice-63fe1b2b-7f23-4689-aa1a-cd41267d5918 - asia-south1
```

---

## Why Both Databases?

| Database | Purpose | Gen |
|----------|---------|-----|
| (default) | Gen 1 HTTP callable functions | 1 |
| Custom ID | Gen 2 Firestore triggers | 2 |

**Gen 1 Firestore triggers can ONLY use (default) database.**

---

## After Creating Database

1. Create the (default) database (steps above)
2. Wait 2-3 minutes
3. GitHub Actions will automatically retry (via the retry mechanism)
4. Deployment will succeed ✅

---

## Full URL Path

Firebase Console → Firestore Database:
```
https://console.firebase.google.com/project/disha-diagnostics/firestore/databases
```

Click the button or link to create a new database.

---

**Status: Ready for you to create (default) database**

Once created, let me know and I'll verify everything deploys correctly!
