#!/usr/bin/env python3
"""
Direct Firestore Deployment - No Unicode Issues
"""

import os
import sys
from datetime import datetime

print("=" * 80)
print("DISHA FIRESTORE DEPLOYMENT - STARTING")
print("=" * 80)
print()

# Step 1: Check files
print("STEP 1: Validating Files")
print("-" * 80)

files_needed = {
    "firebase-service-account.json": os.path.exists("firebase-service-account.json"),
    "firestore-complete-schema.json": os.path.exists("firestore-complete-schema.json"),
    "firestore-security-rules.txt": os.path.exists("firestore-security-rules.txt"),
}

all_good = True
for filename, exists in files_needed.items():
    status = "YES" if exists else "NO"
    print(f"  {filename}: {status}")
    if not exists:
        all_good = False

if not all_good:
    print("\nERROR: Missing required files!")
    sys.exit(1)

print("\n  All files present. Proceeding with deployment...")
print()

# Step 2: Initialize Firebase
print("STEP 2: Initializing Firebase")
print("-" * 80)

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from datetime import timedelta

    print("  Loading service account credentials...")
    cred = credentials.Certificate("firebase-service-account.json")

    print("  Initializing Firebase app...")
    try:
        app = firebase_admin.get_app()
    except ValueError:
        app = firebase_admin.initialize_app(cred)

    db = firestore.client(app=app)
    print("  CONNECTED to Firestore!")
    print()

except Exception as e:
    print(f"  ERROR: {str(e)}")
    print("\n  Make sure:")
    print("    1. Service account JSON is valid")
    print("    2. Firestore database exists in Firebase Console")
    print("    3. Project ID matches: disha-diagnostics")
    sys.exit(1)

# Step 3: Test Connection
print("STEP 3: Testing Database Connection")
print("-" * 80)

try:
    # Create test document
    test_doc = {"test": True, "timestamp": datetime.now()}
    db.collection("_deployment_test").document("test").set(test_doc)
    print("  Write test: OK")

    # Read test document
    doc = db.collection("_deployment_test").document("test").get()
    if doc.exists:
        print("  Read test: OK")

    # Delete test document
    db.collection("_deployment_test").document("test").delete()
    print("  Delete test: OK")
    print()
    print("  Database connection verified!")
    print()

except Exception as e:
    print(f"  ERROR: {str(e)}")
    sys.exit(1)

# Step 4: Create Schools
print("STEP 4: Creating Sample Schools")
print("-" * 80)

schools = [
    {
        "schoolId": "school_001_delhi_premium",
        "name": "Delhi Excellence Academy",
        "board": "CBSE",
        "tier": "Premium",
        "city": "Delhi",
        "totalStudents": 850,
        "status": "Active"
    },
    {
        "schoolId": "school_002_mumbai_midmarket",
        "name": "Mumbai Excellence Institute",
        "board": "ICSE",
        "tier": "Mid-Market",
        "city": "Mumbai",
        "totalStudents": 650,
        "status": "Active"
    },
    {
        "schoolId": "school_003_bangalore_budget",
        "name": "Bangalore Public School",
        "board": "CBSE",
        "tier": "Budget",
        "city": "Bangalore",
        "totalStudents": 500,
        "status": "Active"
    }
]

schools_created = 0
for school in schools:
    try:
        db.collection("schools").document(school["schoolId"]).set(school)
        schools_created += 1
        print(f"  Created: {school['name']}")
    except Exception as e:
        print(f"  Failed to create {school['name']}: {str(e)}")

print(f"\n  Schools created: {schools_created}/3")
print()

# Step 5: Create Challenges
print("STEP 5: Creating 15 Challenges")
print("-" * 80)

challenges = [
    ("C1", "Enrollment Decline", "Growth & Enrollment"),
    ("C2", "Student Attrition", "Growth & Enrollment"),
    ("C3", "Fee Collection", "Growth & Enrollment"),
    ("C4", "Teacher Attrition", "People & Staffing"),
    ("C5", "Staff Capability", "People & Staffing"),
    ("C6", "Leadership Gap", "People & Staffing"),
    ("C7", "Academic Decline", "Academic & Wellbeing"),
    ("C8", "Student Wellbeing", "Academic & Wellbeing"),
    ("C9", "Remedial Lag", "Academic & Wellbeing"),
    ("C10", "Parent Communication", "Reputation & Competition"),
    ("C11", "Competitive Pressure", "Reputation & Competition"),
    ("C12", "Brand Issues", "Reputation & Competition"),
    ("C13", "Cost Inflation", "Operations & Finance"),
    ("C14", "Infrastructure Deficits", "Operations & Finance"),
    ("C15", "Compliance Stress", "Operations & Finance"),
]

challenges_created = 0
for cid, cname, cdomain in challenges:
    try:
        db.collection("challenges_catalog").document(cid).set({
            "challengeId": cid,
            "name": cname,
            "domain": cdomain
        })
        challenges_created += 1
    except Exception as e:
        print(f"  Failed to create {cid}: {str(e)}")

print(f"  Challenges created: {challenges_created}/15")
print()

# Step 6: Create Dimensions
print("STEP 6: Creating 14 Dimensions")
print("-" * 80)

dimensions = [
    ("D01", "Academic Reputation"),
    ("D02", "Teacher Welfare"),
    ("D03", "Leadership & Governance"),
    ("D04", "Parent Engagement"),
    ("D05", "Student Safety"),
    ("D06", "Infrastructure"),
    ("D07", "Co-Curricular"),
    ("D08", "Individual Attention"),
    ("D09", "Value for Money"),
    ("D10", "Special Needs"),
    ("D11", "Community Service"),
    ("D12", "Faculty Competence"),
    ("D13", "Internationalism"),
    ("D14", "Management Vision"),
]

dimensions_created = 0
for dim_id, dim_name in dimensions:
    try:
        db.collection("dimensions_catalog").document(dim_id).set({
            "dimensionId": dim_id,
            "name": dim_name,
            "weight": 7
        })
        dimensions_created += 1
    except Exception as e:
        print(f"  Failed to create {dim_id}: {str(e)}")

print(f"  Dimensions created: {dimensions_created}/14")
print()

# Summary
print("=" * 80)
print("DEPLOYMENT COMPLETE!")
print("=" * 80)
print()
print("Created:")
print(f"  - Schools: {schools_created}/3")
print(f"  - Challenges: {challenges_created}/15")
print(f"  - Dimensions: {dimensions_created}/14")
print()
print("Next: Deploy security rules")
print("  Command: firebase deploy --only firestore:rules --project=disha-diagnostics")
print()
print("Then: Verify in Firebase Console")
print("  URL: https://console.firebase.google.com/project/disha-diagnostics")
print()
