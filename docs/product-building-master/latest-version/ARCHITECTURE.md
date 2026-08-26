# RYLA / DISHA School Diagnostic Platform: Architecture Guide

This document outlines the core system design, stakeholder triangulation pipelines, and the reverse-parameter simulation engine implemented in this repository. It provides developers and architects with a precise view of how raw inputs are processed to predict school health, locate perception gaps, and calculate reverse outcome targets.

---

## 1. System Topology & Codebase Mapping

The architecture is built on a modern **full-stack React SPA (Single-Page Application)** model with local and durable cloud persistence (Google Firebase Firestore) synchronized through an active **Zustand store** layout.

### File & Directory Manifest
```text
├── /src
│   ├── /components
│   │   └── /layout
│   │       └── AppLayout.tsx      # Main application frame & navigation lifecycle
│   ├── /lib
│   │   ├── firebase.ts            # Client-side Firebase SDK configuration
│   │   ├── seed.ts                # Seeding engine for mock baseline data
│   │   └── utils.ts               # Component design helper classes (cn utility)
│   ├── /pages
│   │   ├── Dashboard.tsx          # Real-time high-level diagnostic analytics panel
│   │   ├── Checkup.tsx            # Annual Health Checkup (12-Lens analysis)
│   │   ├── CaptureStage.tsx       # Stage 1: Triangulated stakeholder data collection
│   │   ├── CompareStage.tsx       # Stage 2: Peer-to-peer and benchmark positioning
│   │   ├── SimulateStage.tsx      # Stage 3: Reverse modeling & parameter projection
│   │   ├── Monitoring.tsx         # Active target monitoring & warning tracking
│   │   ├── Attendance.tsx         # ERP-synced student attendance logger
│   │   ├── Staff.tsx              # HR roster and tenure/burnout tracking
│   │   └── Students.tsx           # Student academic-risk profile repository
│   ├── store.ts                   # Zustand unified client-side state engine
│   ├── types.ts                   # Unified TypeScript definitions and interfaces
│   └── main.tsx                   # Main SPA compilation entry point
├── firestore.rules                # Strict cloud-level role security rules
├── package.json                   # Dependency management (React 18, Zustand, Firebase, Lucide, Recharts)
└── metadata.json                  # Application capabilities descriptor
```

---

## 2. Global Core Data Flow Architecture

This diagram illustrates how raw stakeholder surveys and ERP metrics are captured, synchronized through Zustand, saved in Firestore, and leveraged by the Diagnostic and Simulation Engines.

```text
                                 [ DATA SOURCES ]
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  STAKEHOLDER SURVEYS   │  │   ERP OPERATIONAL SYNC │  │   UPLOAD FILES/DOCS    │
│  • School Owner        │  │   • Admissions & Fees  │  │   • Attendance Sheets  │
│  • Teaching Staff      │  │   • Staff Attendance   │  │   • Statutory Certs    │
│  • Parents & Students  │  │   • Academic Scores    │  │   • Photo Registers    │
└───────────┬────────────┘  └───────────┬────────────┘  └───────────┬────────────┘
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │   Zustand Store (store.ts)  │◄───┐
                         │   • In-memory State Cache   │    │
                         │   • Action Dispatchers      │    │ Sync / Seeding
                         └──────────────┬──────────────┘    │
                                        │                   │
                                        ▼                   │
                         ┌─────────────────────────────┐    │
                         │  Firebase Firestore (db)    │────┘
                         │  • "domains"    • "students"│
                         │  • "dimensions" • "staff"   │
                         │  • "gaps"       • "sims"    │
                         └──────────────┬──────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
  ┌─────────────────────────────┐               ┌─────────────────────────────┐
  │   DIAGNOSTIC ENGINE         │               │  SIMULATION SCENARIO ENGINE │
  │   (Checkup.tsx)             │               │  (SimulateStage.tsx)        │
  │  • Multi-Lens Calculation   │               │  • Target Outcome Input     │
  │  • Gap Analysis Generation  │               │  • Reverse Sensitivity Math │
  │  • Perception Triangulation │               │  • Feasibility Indexing     │
  └─────────────────────────────┘               └─────────────────────────────┘
```

---

## 3. Stakeholder Triangulation & Health Prediction

To avoid "isolated self-reporting bias" (where administrators believe the school is performing perfectly while teachers and parents face severe friction), the platform implements an **Objective Triangulation Pipeline**. 

The system maps indicators from four distinct user-roles alongside actual quantitative ERP logs to produce an objective health score.

### Multi-Lens Triangulation Logic

```text
 ┌──────────────────────┐        ┌──────────────────────┐
 │  School Leader Lens  │        │   Teaching Staff     │
 │ (High-level vision,  │        │ (Workload, burnout,  │
 │ perception of fees)  │        │ pedagogy challenges) │
 └──────────┬───────────┘        └──────────┬───────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
                    [ TRIANGULATION ]
                    [    ENGINE     ] ◄─── ERP Raw Audits (Attendance, Fees, Attrition)
                            ▲
            ┌───────────────┴───────────────┐
            │                               │
 ┌──────────┴───────────┐        ┌──────────┴───────────┐
 │     Parent Lens      │        │     Student Lens     │
 │ (Value perception,   │        │ (Stress, engagement, │
 │ NPS, fee compliance) │        │ safety, co-curricular)
 └──────────────────────┘        └──────────────────────┘
```

### Triangulation Formula Pattern

Let $S_{domain}$ be the predicted score for a specific challenge domain (e.g., *Parental Satisfaction* or *Teacher Retention*). Instead of relying on a single questionnaire, the system calculates a weighted composite:

$$S_{domain} = w_{leader} \cdot X_{leader} + w_{staff} \cdot X_{staff} + w_{parent} \cdot X_{parent} + w_{student} \cdot X_{student} + w_{erp} \cdot X_{erp}$$

Where:
* $w_i$ represents the confidence weight assigned to stakeholder $i$ (sum of all $w_i = 1.0$).
* $X_i$ represents the normalized score generated from stakeholder $i$'s questionnaires.
* $X_{erp}$ represents actual factual data pulled from system databases (e.g., actual fee-collection delay rate, staff turnover rate, or standard student absenteeism logs).

### Contextual Mismatch Detection

If there is a severe deviation between the administrator's perceived performance and the factual ground-truth (e.g., $X_{leader} > 80$ but $X_{erp} < 40$), the engine flags a **Perception-vs-Reality Mismatch**.

* **Example Case**: The owner believes that teacher turnover is driven by minor salary discrepancies at competing academies ($X_{leader}$). However, exit logs ($X_{erp}$) and staff surveys ($X_{staff}$) indicate that 70% of departing teachers cite administrative fatigue and manual daily paperwork over pay bands. The platform maps this as a "Perceived Wage Complaints vs. Workplace Burnout" mismatch and recommends administrative automation.

---

## 4. The Reverse-Parameter Simulation Engine

The core modeling module of the platform is the **Reverse Outcome Scenario Engine** (implemented in `/src/pages/SimulateStage.tsx`). Rather than projecting forward ("If we do X, what might happen?"), it models backward: **"We want to achieve Outcome Y. What exact input variables must be modified, and by how much, to reach this goal?"**

```text
  [ DIRECT / FORWARD MODELING (Guess and Test) ]
  Inputs (e.g., Increase Tutoring) ─────────► Outcome Prediction (e.g., +2% Pass Rate)

  [ REVERSE MODELING (Our Engine) ]
  Desired Target Outcome (e.g., 95% Pass Rate) ───► Calculates Required Inputs:
                                                       • Remedial Attendance: 90%
                                                       • Weekly Mock Tests: 2
                                                       • Teacher-Student Ratio: 1:30
```

### Mathematical Simulation Model

For any selected priority target outcome metric $T$ (with desired target value $T_{target}$ and current baseline value $T_{base}$), the system defines an array of $n$ key input factors ($F_1, F_2, \dots, F_n$). Each factor $F_k$ has an impact sensitivity weight $I_k$, where:

$$\sum_{k=1}^{n} I_k = 100\%$$

When the user inputs a target value change:

$$\Delta T = T_{target} - T_{base}$$

The engine calculates the required adjustment $\Delta F_k$ for each factor using its impact sensitivity weight and the factor's operational limits:

$$\Delta F_k = \frac{\Delta T \cdot I_k}{\omega_k}$$

Where:
* $I_k$ is the relative impact of factor $k$.
* $\omega_k$ is the factor's scalability coefficient (defined by regional precedents).
* $\Delta F_k$ translates directly to actionable operational targets in the output interface.

### Active Simulation Configuration (Example: Board Exam Pass Rate)

For target model `s1` (*Board Exam Pass Rate*), the relationship maps as follows:

| Input Factor ($F_k$) | Current Baseline ($F_{current}$) | Required Target ($F_{required}$) | Sensitivity Weight ($I_k$) | Practical Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Remedial Class Attendance** | `65%` | `90%` | **45%** | Run active WhatsApp warning triggers to parents for student absenteeism. |
| **Weekly Mock Tests** | `1 per week` | `2 per week` | **35%** | Schedule automated practice test generators. |
| **Teacher-Student Ratio** | `1:40` | `1:30` | **20%** | Adjust core sections or hire support facilitators. |

### Feasibility Indexing & Precedents

To ensure the computed reverse targets are realistic and achievable, the engine runs a dual validation check:
1. **Feasibility Confidence Tiering**: Evaluates the required rate of change. If $\Delta T$ is too steep (e.g., trying to raise pass rates from 50% to 100% in 30 days), the confidence drops from **Tier A (High Feasibility)** to **Tier C (Skeptical/High Risk)**.
2. **District Precedent Match**: Cross-references local historical data from neighboring peer academies to prove physical possibility. (e.g., *"St. Xavier High School successfully completed this exact operational trajectory in 2024 by maintaining 90% remedial attendance"*).

---

## 5. Developer Trace Guide: Executing a Scenario Save

When a school leader runs a simulation and clicks **"Commit to Target & Monitor"**, the data flows through the application components sequentially:

1. **User Interaction (`SimulateStage.tsx`)**:
   * User selects target outcome metric (`s1`).
   * User inputs target value (e.g., `95%`) on the sliders/inputs.
   * Clicking **"Run Reverse Model"** activates local state spinners and calculates sensitivity outputs using the configured sensitivity ratios.

2. **State Updates (`store.ts`)**:
   * The page dispatches `updateSimulationTarget(simId, targetVal)`.
   * The Zustand action `updateSimulationTarget` is triggered.

3. **Cloud Synchronization (`firebase.ts`)**:
   * A Firestore document reference is generated: `doc(db, 'simulations', simId)`.
   * An asynchronous write updates the persistent database: `await updateDoc(simRef, { targetValue })`.
   * On success, the in-memory Zustand cache updates `simulations: state.simulations.map(...)`.

4. **Monitoring & Triggers (`Monitoring.tsx`)**:
   * The application updates the view status to `MONITORING`.
   * The monitoring dashboard pulls the updated target value from the store.
   * Real-time telemetry evaluates the difference between daily logs (such as actual student attendance records) and the newly committed target requirements (e.g., `90%` required remedial attendance).
   * If attendance rates slip below the simulation's required path, a notification trigger is created in the alerts log.

---

## 6. Framework Alignment & Diagnostics Architecture

The platform's 14-Dimension model is aligned with the **Education World India School Rankings (EWISR)** framework, divided across four thematic quadrants:

```text
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                       14-DIMENSION EWISR MODEL                          │
 ├────────────────────────────────────────┬────────────────────────────────┤
 │   1. ACADEMIC EXCELLENCE               │   2. WELFARE                   │
 │   • Competence of Faculty              │   • Teacher Welfare            │
 │   • Curriculum & Pedagogy              │   • Student Wellbeing Services │
 │   • Academic Reputation                │   • Campus Infrastructure      │
 │   • Quality of Alumni                  │                                │
 ├────────────────────────────────────────┼────────────────────────────────┤
 │   3. INDIVIDUAL ATTENTION              │   4. SOCIAL RESPONSIBILITY     │
 │   • Individualized Attention           │   • Community Service          │
 │   • Co-curricular Activities           │   • Parental Involvement       │
 │   • Sports Education                   │   • Leadership Quality         │
 │   │                                    │   • Value for Money            │
 └────────────────────────────────────────┴────────────────────────────────┘
```

This structural mapping ensures that any weakness detected during diagnostic surveys immediately correlates to a highly specific, standardized school evaluation vector, enabling leaders to target their resources where they will yield the greatest impact.
