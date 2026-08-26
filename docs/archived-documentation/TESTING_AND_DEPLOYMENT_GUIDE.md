# DISHA v2.0 — Testing & Deployment Guide

This guide describes how to manually test all of DISHA's primary diagnostic features and school operations, explains the backend configuration, and outlines deployment routes.

---

## 🏗️ 1. Architecture Clarification (Where is the Backend?)

### How it is configured in this Preview Environment:
In this current running preview, **Firebase (Firestore & Authentication) operates directly as the secure, cloud-persisted backend**. 
* **Database & API Layer:** Firestore stores all seeded configurations, Indian national benchmarks, school demographics, and operations records (Students, Staff, Attendance, Communications). 
* **Auth Layer:** Firebase Auth handles signup, sign-in, and session states.
* **Why this approach?** This high-fidelity serverless architecture ensures that the application runs, persists data, and maintains responsive speed in real time within the container, without the overhead of booting separate multi-tier Docker containers (NestJS, Redis, PostgreSQL) in a single-port environment.

---

## 🧪 2. Manual Testing Guide (Step-by-Step)

Follow these scenarios to verify every visual feature and calculation engine inside DISHA v2.0.

### Scenario A: Authentication & One-Click Login
1. **Access Login:** Go to the development/shared URL. You should see the **Sign in to DISHA v2.0** form.
2. **One-Click Demo Access:** Click the blue **🚀 One-Click Demo Login** button. 
   * *Expected Result:* The system automatically authenticates you with a preconfigured credential (`demo@disha.edu`), seeds the Firestore database if empty, and redirects you to the main dashboard.
3. **Logout & Custom Account:** 
   * Click **Logout** at the bottom of the sidebar.
   * Toggle between "Sign in" and "Create your account". Register a new test school owner.
   * *Expected Result:* Successfully registers, creates a Firestore session, and logs in. If you enter an existing email during registration, it displays: *"An account with this email already exists. Please sign in instead."*

---

### Scenario B: School Operations & Core Records (New!)
To support diagnostic intelligence, school owners must feed operations data into DISHA.

#### 1. Student Directory
* Click **Student Directory** in the sidebar.
* **Observe Metrics:** Notice the high-contrast stats (Total Enrolled, Critical High-Risk, Average Attendance) calculated dynamically from student profiles.
* **Add a Student:** Click **+ Add Student**. Fill in the name (e.g., *Siddharth Sen*), select *Grade 10 - Section A*, choose *High Risk*, and input scores. Save.
* **Search:** Type *"Siddharth"* in the search bar.
* *Expected Result:* Roster updates, high-risk counter increments, and searches filter instantly.

#### 2. Faculty & Staff
* Click **Faculty & Staff** in the sidebar.
* **Add Faculty:** Click **+ Add Faculty Member**. Fill out the details (e.g., *Prof. Amit Sharma*, Math, 24 months tenure, 90% score).
* *Expected Result:* Total active faculty and average ratings calculate dynamically.

#### 3. Attendance Register
* Click **Attendance Register** in the sidebar.
* Select *Grade 10 - Section A* and a date.
* Mark students as **Present**, **Absent**, or **Late**.
* Click **Save Attendance Ledger**.
* *Expected Result:* The ledger is securely committed to Firestore, showing success notifications and populating the *Recent Logs* panel.

#### 4. Communications Hub
* Click **Communications** in the sidebar.
* Fill in a test broadcast title (e.g., *"Urgent Fee Compliance Notice"*), sender, target audience, and message body.
* Click **Send Broadcast**.
* *Expected Result:* Message logs to Firestore and renders instantly in the *Outgoing Broadcast Log* with distinct recipient badges.

---

### Scenario C: The Diagnostic Lifecycle (Stage 1 to 3)

This is the flagship diagnostic pipeline designed for school improvement.

#### 🚀 Stage 1: Capture (Assess)
1. Click **Capture (Assess)** in the sidebar.
2. **Select Challenges:** Check multiple options (e.g., *Enrollment Stress*, *Teacher Turn*).
3. **Take Rapid Assessment:** Answer the stakeholder questionnaire.
4. **Trigger Scan Intake (OCR simulation):** Click the **Simulate Smart Document Scan** button.
   * *Expected Result:* It runs an automated analysis on school compliance PDFs, extracts metadata, and populates the assessment scores.
5. Click **Calculate Gap Index**.
   * *Expected Result:* The system calculates diagnostic weightings and unlocks **Stage 2 (Compare)**.

#### 📊 Stage 2: Compare (Diagnose & Benchmark)
1. Click **Compare (Diagnose)** in the sidebar.
2. **Radar & Bar Charts:** Observe the comparative charts drawing real-time radar fields mapping *Your School* against *National Standard Models* (assembled from Indian school research).
3. **Local Benchmark Search:** Click **Search Nearby Districts**.
   * *Expected Result:* It triggers a mock web-scraper simulating an online search of nearby top-performing regional schools and outputs a comparison table.
4. **AI-Driven Action Plan:** Review the dynamic, context-aware suggestions generated for your specific critical gaps.

#### 📈 Stage 3: Simulate (Model Outcomes)
1. Click **Simulate (Model)** in the sidebar.
2. **Calibrate Slider:** Slide the *"Target Desired Outcome"* (e.g., target 95% efficiency).
3. **Observe Ground-Level Matrix Recalibration:** Notice how individual metrics (Teacher Retention, Fee Recovery, Student Attendance) dynamically adjust backwards to show *exactly* what ground-level numbers you must achieve to reach that macro outcome.
4. **Explain with AI:** Read the simplified action blueprints for each targeted metric.

---

## 🚢 3. Production Deployment Plan

Once you are done with testing and wish to migrate the application out of this preview sandbox, choose one of these production deployment methods:

### Option A: Serverless Firebase Hosting + Firestore (Recommended)
Since the app already runs completely client-side in React with a Firestore database layer, you can deploy it directly as a highly cost-efficient serverless SPA:
1. **Build the assets locally:**
   ```bash
   npm run build
   ```
2. **Install Firebase CLI & Initialize:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
   * Select *Hosting* and *Firestore*.
   * Set public directory to `dist` (Vite's build output).
3. **Deploy:**
   ```bash
   firebase deploy
   ```

### Option B: Deploying the Next.js / NestJS Split Production Blueprint
If you choose to assemble the separate Docker architecture described in your Architecture Guide:
1. **Containerize the layers:** Use the provided dockerfiles inside `backend/` and `frontend/` directories.
2. **Deploy to Google Cloud Run / AWS ECS:**
   * Create a PostgreSQL database instance (such as Cloud SQL).
   * Run NestJS API as one Cloud Run service (listening on port 3000, mapped to database env credentials).
   * Run the Next.js/React App as a separate frontend service or static CDN build.
   * Configure environment secrets (JWT secrets, PostgreSQL connection strings) in your deployment manager dashboard.
