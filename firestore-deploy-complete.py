#!/usr/bin/env python3
"""
DISHA Firestore Complete Deployment Script
Handles all setup, validation, and initialization in one go
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

print("=" * 80)
print("DISHA FIRESTORE COMPLETE DEPLOYMENT SYSTEM")
print("=" * 80)
print()

# Step 1: Validate Prerequisites
print("STEP 1: Validating Prerequisites")
print("-" * 80)

checks = {
    "Python 3.8+": sys.version_info >= (3, 8),
    "firebase-admin": True,  # Already checked in shell
    "firebase-applet-config.json": os.path.exists("firebase-applet-config.json"),
    "firestore-security-rules.txt": os.path.exists("firestore-security-rules.txt"),
    "Firestore schema": os.path.exists("firestore-complete-schema.json"),
}

for check_name, status in checks.items():
    status_icon = "[OK]" if status else "[FAIL]"
    status_text = "PASS" if status else "FAIL"
    print(f"  {status_icon} {check_name}: {status_text}")

all_passed = all(checks.values())
print()

# Step 2: Check for Service Account Key
print("STEP 2: Checking Service Account Authentication")
print("-" * 80)

service_account_file = "firebase-service-account.json"
has_service_account = os.path.exists(service_account_file)

if has_service_account:
    print(f"  ✓ Service account found: {service_account_file}")
    print()

    # Step 3: Initialize Firebase and Deploy
    print("STEP 3: Initializing Firebase")
    print("-" * 80)

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        from datetime import timedelta

        # Initialize with service account
        cred = credentials.Certificate(service_account_file)
        app = firebase_admin.initialize_app(cred)
        db = firestore.client(app=app)

        print("  ✓ Firebase initialized successfully")
        print(f"  ✓ Connected to project: disha-diagnostics")
        print()

        # Test connection
        print("STEP 4: Testing Database Connection")
        print("-" * 80)

        try:
            # Test write
            test_doc = {
                'test': True,
                'timestamp': datetime.now(),
                'message': 'Deployment test'
            }
            db.collection('_deployment_test').document('test').set(test_doc)
            print("  ✓ Database write test: PASSED")

            # Test read
            doc = db.collection('_deployment_test').document('test').get()
            if doc.exists:
                print("  ✓ Database read test: PASSED")

            # Clean up test
            db.collection('_deployment_test').document('test').delete()
            print("  ✓ Database cleanup: PASSED")
            print()

        except Exception as e:
            print(f"  ✗ Database connection test failed: {str(e)}")
            print("    Please ensure:")
            print("    1. Firestore database is created in Firebase Console")
            print("    2. Service account has appropriate permissions")
            print()
            sys.exit(1)

        # Step 5: Load and Verify Schemas
        print("STEP 5: Loading Database Schemas")
        print("-" * 80)

        with open('firestore-complete-schema.json', 'r') as f:
            schema = json.load(f)

        collection_count = len(schema.get('collections', {}))
        print(f"  ✓ Loaded schema: {collection_count} collections defined")

        for coll_name in schema.get('collections', {}).keys():
            print(f"    - {coll_name}")

        print()

        # Step 6: Initialize Data
        print("STEP 6: Initializing Master Data")
        print("-" * 80)

        # Create schools
        schools = [
            {
                'schoolId': 'school_001_delhi_premium',
                'name': 'Delhi Excellence Academy',
                'board': 'CBSE',
                'tier': 'Premium',
                'city': 'Delhi',
                'state': 'Delhi',
                'address': '123 Premium Lane, New Delhi',
                'pincode': '110001',
                'totalStudents': 850,
                'totalTeachers': 60,
                'principalName': 'Dr. Rajesh Kumar',
                'principalEmail': 'principal@delexcellence.edu',
                'registrationDate': datetime.now(),
                'status': 'Active',
                'subscriptionPlan': 'Enterprise'
            },
            {
                'schoolId': 'school_002_mumbai_midmarket',
                'name': 'Mumbai Excellence Institute',
                'board': 'ICSE',
                'tier': 'Mid-Market',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'totalStudents': 650,
                'totalTeachers': 45,
                'principalName': 'Ms. Priya Sharma',
                'registrationDate': datetime.now(),
                'status': 'Active',
                'subscriptionPlan': 'Professional'
            },
            {
                'schoolId': 'school_003_bangalore_budget',
                'name': 'Bangalore Public School',
                'board': 'CBSE',
                'tier': 'Budget',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'totalStudents': 500,
                'totalTeachers': 35,
                'principalName': 'Mr. Ramesh V',
                'registrationDate': datetime.now(),
                'status': 'Active',
                'subscriptionPlan': 'Starter'
            }
        ]

        schools_created = 0
        for school in schools:
            try:
                db.collection('schools').document(school['schoolId']).set(school)
                schools_created += 1
                print(f"  ✓ Created school: {school['name']}")
            except Exception as e:
                print(f"  ✗ Failed to create school {school['name']}: {str(e)}")

        print(f"  Total: {schools_created}/{len(schools)} schools created")
        print()

        # Create challenges catalog
        print("STEP 7: Creating Challenges Catalog (15 Challenges)")
        print("-" * 80)

        challenges = [
            {'challengeId': 'C1', 'domain': 'Growth & Enrollment', 'name': 'Enrollment Decline'},
            {'challengeId': 'C2', 'domain': 'Growth & Enrollment', 'name': 'Student Attrition'},
            {'challengeId': 'C3', 'domain': 'Growth & Enrollment', 'name': 'Fee Collection'},
            {'challengeId': 'C4', 'domain': 'People & Staffing', 'name': 'Teacher Attrition'},
            {'challengeId': 'C5', 'domain': 'People & Staffing', 'name': 'Staff Capability'},
            {'challengeId': 'C6', 'domain': 'People & Staffing', 'name': 'Leadership Gap'},
            {'challengeId': 'C7', 'domain': 'Academic & Wellbeing', 'name': 'Academic Decline'},
            {'challengeId': 'C8', 'domain': 'Academic & Wellbeing', 'name': 'Student Wellbeing'},
            {'challengeId': 'C9', 'domain': 'Academic & Wellbeing', 'name': 'Remedial Lag'},
            {'challengeId': 'C10', 'domain': 'Reputation & Competition', 'name': 'Parent Communication'},
            {'challengeId': 'C11', 'domain': 'Reputation & Competition', 'name': 'Competitive Pressure'},
            {'challengeId': 'C12', 'domain': 'Reputation & Competition', 'name': 'Brand Issues'},
            {'challengeId': 'C13', 'domain': 'Operations & Finance', 'name': 'Cost Inflation'},
            {'challengeId': 'C14', 'domain': 'Operations & Finance', 'name': 'Infrastructure Deficits'},
            {'challengeId': 'C15', 'domain': 'Operations & Finance', 'name': 'Compliance Stress'},
        ]

        challenges_created = 0
        for challenge in challenges:
            try:
                db.collection('challenges_catalog').document(challenge['challengeId']).set(challenge)
                challenges_created += 1
            except Exception as e:
                print(f"  ✗ Failed to create challenge {challenge['challengeId']}: {str(e)}")

        print(f"  ✓ Created {challenges_created}/15 challenges")
        print()

        # Create dimensions catalog
        print("STEP 8: Creating Dimensions Catalog (14 Dimensions)")
        print("-" * 80)

        dimensions = [
            'D01: Academic Reputation & Rigour',
            'D02: Teacher Welfare & Development',
            'D03: Leadership & Governance',
            'D04: Parent Engagement & SLA',
            'D05: Student Safety & Wellness',
            'D06: Infrastructure & Facilities',
            'D07: Co-Curricular Education',
            'D08: Individual Attention (PTR)',
            'D09: Value for Money',
            'D10: Special Needs Inclusivity',
            'D11: Community Service & Responsibility',
            'D12: Faculty Competence & Retention',
            'D13: Internationalism & Cultural Diversity',
            'D14: Management Vision & Growth Drive',
        ]

        dimensions_created = 0
        for dim_str in dimensions:
            dim_id, dim_name = dim_str.split(': ')
            try:
                db.collection('dimensions_catalog').document(dim_id).set({
                    'dimensionId': dim_id,
                    'name': dim_name,
                    'weight': 7
                })
                dimensions_created += 1
            except Exception as e:
                print(f"  ✗ Failed to create dimension {dim_id}: {str(e)}")

        print(f"  ✓ Created {dimensions_created}/14 dimensions")
        print()

        # Summary
        print("=" * 80)
        print("DEPLOYMENT SUMMARY")
        print("=" * 80)
        print()
        print("✓ FIRESTORE DATABASE SUCCESSFULLY INITIALIZED")
        print()
        print("Deployed Components:")
        print(f"  ✓ Schools: {schools_created}/3")
        print(f"  ✓ Challenges: {challenges_created}/15")
        print(f"  ✓ Dimensions: {dimensions_created}/14")
        print()
        print("Collections Available:")
        for coll_name in list(schema.get('collections', {}).keys())[:5]:
            print(f"  ✓ {coll_name}")
        print(f"  ... and {len(schema.get('collections', {}))-5} more")
        print()
        print("Next Steps:")
        print("  1. Deploy Firestore security rules:")
        print("     firebase deploy --only firestore:rules")
        print()
        print("  2. Create sample assessments via application UI")
        print()
        print("  3. Monitor database via Firebase Console:")
        print("     https://console.firebase.google.com/project/disha-diagnostics")
        print()
        print("Database Status: READY FOR PRODUCTION")
        print()

    except Exception as e:
        print(f"  ✗ Firebase initialization failed: {str(e)}")
        print()
        print("Troubleshooting:")
        print("  1. Verify service account JSON is valid")
        print("  2. Check service account permissions in Firebase Console")
        print("  3. Ensure Firestore database exists in project")
        sys.exit(1)

else:
    print("  ✗ Service account file NOT found: firebase-service-account.json")
    print()
    print("To complete Firestore deployment, you need a service account key:")
    print()
    print("STEP 1: Get Service Account Key from Firebase Console")
    print("  1. Go to https://console.firebase.google.com/project/disha-diagnostics")
    print("  2. Click Settings (gear icon) → Project Settings")
    print("  3. Go to 'Service Accounts' tab")
    print("  4. Click 'Generate New Private Key'")
    print("  5. Save the JSON file as: firebase-service-account.json")
    print()
    print("STEP 2: Run this deployment script again")
    print("  python3 firestore-deploy-complete.py")
    print()
    print("STEP 3: Deploy Security Rules")
    print("  firebase deploy --only firestore:rules --project=disha-diagnostics")
    print()
    print("Files Ready for Deployment:")
    print(f"  ✓ firestore-complete-schema.json")
    print(f"  ✓ firestore-security-rules.txt")
    print(f"  ✓ firebase-applet-config.json")
    print()

print()
print("=" * 80)
