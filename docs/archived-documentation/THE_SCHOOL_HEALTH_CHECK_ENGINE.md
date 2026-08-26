# THE SCHOOL HEALTH CHECK ENGINE
Benchmark-Gap Diagnosis and Reverse Outcome Simulation

This document specifies the analytical core of Disha: taking a school's operational data, measuring it against dual benchmarks (National Ideal School ranges & Local District Best Performers), explaining "why" gaps exist, and offering a Reverse Outcome Simulation Engine.

## 1. Engine Architecture (3-Stage Flow)
The engine runs as three connected stages, each building on the last:

### Stage 1: Capture
- **Inputs**: Admissions, fee collection, staff workloads, attendance records, compliance items, plus multi-stakeholder assessment responses (Leaders, Teachers, Parents, Students).
- **Benchmarks**: 
  - *Standard Range*: Built from the Ideal School Model parameters (e.g. 11:1 ratio, 8 hours weekly planning time, <24 hr parent query response).
  - *District Best Performers*: Gathered from anonymized opted-in network schools or crawled digital footprint signals (Google Business rating, sentiment analysis, mobile latency, page load speed).

### Stage 2: Compare & Diagnose
- **Dual Benchmarks**: Displays gaps against BOTH (a) National Ideal Standards and (b) Local District Best Performers separately.
- **"Why" Narrative**: Generates plain-language diagnoses by tracing gaps back to root operational drivers (e.g., low Parent Satisfaction linked specifically to a 34-hour message response time and split communication channels).

### Stage 3: Simulate (The Reverse Outcome Engine)
- **Concept**: The user sets a target outcome (e.g., "Parent NPS at 8.5" or "Dropout rate under 5%"), and the engine runs a constrained optimization (goal-seek) model backward.
- **Reverse Solver**: Identifies the exact input factors (e.g. response time, lesson planning hours, class size) that need to move, specifying required ranges instead of false single-point numbers.
- **Reality Bounds**: Validates whether local district schools have actually achieved this target, and labels the scenario's confidence level (Tier A/B/C).

## 2. Keeping the Engine Honest
To prevent over-selling and ensure true accuracy:
- **Ranges and Labels**: Every simulated output is shown as a range with an explicit confidence label, never a bare single number.
- **Disconfirming Cases**: The engine actively looks for and flags nearby cases where matching inputs did NOT yield the expected positive outcome to ensure complete realism.
- **Language**: Employs terms like "likely," "based on schools with a similar profile," and "worth testing"—never "guaranteed."
- **Data Compliance**: Ensures complete alignment with the DPDP Act 2023 for data protection and safe stakeholder distribution.
