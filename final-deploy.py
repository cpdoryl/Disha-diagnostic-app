#!/usr/bin/env python3
"""
DISHA Firestore Final Deployment
"""

import sys
import json
from datetime import datetime

print("=" * 70)
print("FIRESTORE DEPLOYMENT - FINAL")
print("=" * 70)
print()

try:
    import firebase_admin
    from firebase_admin import credentials, firestore

    print("STEP 1: Loading credentials...")
    cred = credentials.Certificate("firebase-service-account.json")

    print("STEP 2: Initializing Firebase...")
    try:
        app = firebase_admin.get_app()
    except ValueError:
        app = firebase_admin.initialize_app(cred)

    db = firestore.client(app=app)
    print("  CONNECTED to Firestore!")
    print()

    print("STEP 3: Testing database...")
    test_doc = {"test": True, "timestamp": datetime.now()}
    db.collection("_test").document("test").set(test_doc)
    print("  Write test: OK")

    doc = db.collection("_test").document("test").get()
    if doc.exists:
        print("  Read test: OK")

    db.collection("_test").document("test").delete()
    print("  Delete test: OK")
    print()

    print("STEP 4: Creating schools...")
    schools = [
        {"schoolId": "school_001", "name": "Delhi Excellence Academy", "board": "CBSE", "city": "Delhi", "totalStudents": 850},
        {"schoolId": "school_002", "name": "Mumbai Excellence Institute", "board": "ICSE", "city": "Mumbai", "totalStudents": 650},
        {"schoolId": "school_003", "name": "Bangalore Public School", "board": "CBSE", "city": "Bangalore", "totalStudents": 500}
    ]

    for school in schools:
        db.collection("schools").document(school["schoolId"]).set(school)
        print(f"  Created: {school['name']}")

    print()
    print("STEP 5: Creating challenges...")
    challenges = [
        ("C1", "Enrollment Decline"), ("C2", "Student Attrition"), ("C3", "Fee Collection"),
        ("C4", "Teacher Attrition"), ("C5", "Staff Capability"), ("C6", "Leadership Gap"),
        ("C7", "Academic Decline"), ("C8", "Student Wellbeing"), ("C9", "Remedial Lag"),
        ("C10", "Parent Communication"), ("C11", "Competitive Pressure"), ("C12", "Brand Issues"),
        ("C13", "Cost Inflation"), ("C14", "Infrastructure Deficits"), ("C15", "Compliance Stress"),
    ]

    for cid, cname in challenges:
        db.collection("challenges_catalog").document(cid).set({"challengeId": cid, "name": cname})

    print(f"  Created 15 challenges")
    print()

    print("STEP 6: Creating dimensions...")
    dimensions = [
        ("D01", "Academic Reputation"), ("D02", "Teacher Welfare"), ("D03", "Leadership"),
        ("D04", "Parent Engagement"), ("D05", "Student Safety"), ("D06", "Infrastructure"),
        ("D07", "Co-Curricular"), ("D08", "Individual Attention"), ("D09", "Value for Money"),
        ("D10", "Special Needs"), ("D11", "Community Service"), ("D12", "Faculty Competence"),
        ("D13", "Internationalism"), ("D14", "Management Vision"),
    ]

    for dim_id, dim_name in dimensions:
        db.collection("dimensions_catalog").document(dim_id).set({"dimensionId": dim_id, "name": dim_name})

    print(f"  Created 14 dimensions")
    print()

    print("=" * 70)
    print("SUCCESS! Database deployed")
    print("=" * 70)
    print()
    print("Deployed:")
    print("  - 3 schools")
    print("  - 15 challenges")
    print("  - 14 dimensions")
    print()

except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
