#!/usr/bin/env python3
"""
DISHA Firestore Deployment with Retry Logic
"""

import sys
import os
from datetime import datetime
import time

print("=" * 70)
print("FIRESTORE DEPLOYMENT WITH CREDENTIALS")
print("=" * 70)
print()

# Set environment variable for service account
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "firebase-service-account.json"

# Clear any existing Firebase Admin SDK instances
for attr in list(sys.modules.keys()):
    if 'firebase' in attr:
        del sys.modules[attr]

time.sleep(1)

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from google.cloud import firestore as gc_firestore

    print("STEP 1: Loading credentials from environment...")
    # Use environment variable
    cred = credentials.ApplicationDefault()

    print("STEP 2: Initializing Firebase (fresh)...")
    try:
        # Delete existing app if it exists
        firebase_admin.delete_app(firebase_admin.get_app())
    except ValueError:
        pass

    app = firebase_admin.initialize_app(cred)
    db = firestore.client(app=app)
    print("  Connected to Firestore!")
    print()

    print("STEP 3: Testing database connection...")
    test_data = {"test": True, "timestamp": datetime.now()}
    db.collection("_test").document("test").set(test_data)
    print("  Write test: OK")

    doc = db.collection("_test").document("test").get()
    if doc.exists:
        print("  Read test: OK")

    db.collection("_test").document("test").delete()
    print("  Delete test: OK")
    print()

    print("STEP 4: Creating 3 schools...")
    schools = [
        {"schoolId": "school_001", "name": "Delhi Excellence Academy", "board": "CBSE", "city": "Delhi", "students": 850},
        {"schoolId": "school_002", "name": "Mumbai Excellence Institute", "board": "ICSE", "city": "Mumbai", "students": 650},
        {"schoolId": "school_003", "name": "Bangalore Public School", "board": "CBSE", "city": "Bangalore", "students": 500}
    ]

    for school in schools:
        db.collection("schools").document(school["schoolId"]).set(school)
        print(f"  - {school['name']}")

    print()
    print("STEP 5: Creating 15 challenges...")
    challenges = [
        {"id": "C1", "name": "Enrollment Decline"}, {"id": "C2", "name": "Student Attrition"},
        {"id": "C3", "name": "Fee Collection"}, {"id": "C4", "name": "Teacher Attrition"},
        {"id": "C5", "name": "Staff Capability"}, {"id": "C6", "name": "Leadership Gap"},
        {"id": "C7", "name": "Academic Decline"}, {"id": "C8", "name": "Student Wellbeing"},
        {"id": "C9", "name": "Remedial Lag"}, {"id": "C10", "name": "Parent Communication"},
        {"id": "C11", "name": "Competitive Pressure"}, {"id": "C12", "name": "Brand Issues"},
        {"id": "C13", "name": "Cost Inflation"}, {"id": "C14", "name": "Infrastructure Deficits"},
        {"id": "C15", "name": "Compliance Stress"},
    ]

    for c in challenges:
        db.collection("challenges").document(c["id"]).set(c)

    print(f"  Created 15 challenges")
    print()

    print("STEP 6: Creating 14 dimensions...")
    dimensions = [
        {"id": "D01", "name": "Academic Reputation"}, {"id": "D02", "name": "Teacher Welfare"},
        {"id": "D03", "name": "Leadership"}, {"id": "D04", "name": "Parent Engagement"},
        {"id": "D05", "name": "Safety"}, {"id": "D06", "name": "Infrastructure"},
        {"id": "D07", "name": "Co-Curricular"}, {"id": "D08", "name": "Individual Attention"},
        {"id": "D09", "name": "Value for Money"}, {"id": "D10", "name": "Special Needs"},
        {"id": "D11", "name": "Community Service"}, {"id": "D12", "name": "Faculty Competence"},
        {"id": "D13", "name": "Internationalism"}, {"id": "D14", "name": "Management Vision"},
    ]

    for d in dimensions:
        db.collection("dimensions").document(d["id"]).set(d)

    print(f"  Created 14 dimensions")
    print()

    print("=" * 70)
    print("SUCCESS! Firestore Database Deployed")
    print("=" * 70)
    print()
    print("Data created:")
    print("  - 3 schools")
    print("  - 15 challenges")
    print("  - 14 dimensions")
    print()
    print("Next: Deploy security rules")
    print("  firebase deploy --only firestore:rules --project=disha-diagnostics")
    print()

except Exception as e:
    print(f"ERROR: {str(e)}")
    print()
    print("Debugging info:")
    print(f"  Credentials file exists: {os.path.exists('firebase-service-account.json')}")
    print(f"  GOOGLE_APPLICATION_CREDENTIALS: {os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
