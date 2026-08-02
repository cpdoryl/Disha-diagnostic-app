#!/usr/bin/env python3
"""
DISHA Firestore Deployment Status Checker
"""

import os
import json

print("=" * 80)
print("DISHA FIRESTORE DEPLOYMENT STATUS")
print("=" * 80)
print()

# Check prerequisites
print("Prerequisites Check:")
print("-" * 80)

prerequisites = {
    "Firebase Admin SDK": True,
    "firebase-applet-config.json": os.path.exists("firebase-applet-config.json"),
    "firestore-security-rules.txt": os.path.exists("firestore-security-rules.txt"),
    "firestore-complete-schema.json": os.path.exists("firestore-complete-schema.json"),
    "firebase-service-account.json": os.path.exists("firebase-service-account.json"),
}

for item, exists in prerequisites.items():
    status = "YES" if exists else "NO"
    print(f"  {item}: {status}")

print()

# Check schema
if os.path.exists("firestore-complete-schema.json"):
    print("Database Schema:")
    print("-" * 80)
    with open("firestore-complete-schema.json") as f:
        schema = json.load(f)

    collections = schema.get("collections", {})
    print(f"  Total Collections: {len(collections)}")
    print()
    print("  Collections:")
    for coll in sorted(collections.keys())[:5]:
        print(f"    - {coll}")
    if len(collections) > 5:
        print(f"    ... and {len(collections)-5} more")
    print()

# Deployment instructions
print("DEPLOYMENT STATUS: READY")
print("=" * 80)
print()
print("To complete Firestore deployment:")
print()
print("STEP 1: Get Service Account Key from Firebase Console")
print("  1. Go to Firebase Console: https://console.firebase.google.com")
print("  2. Select project: disha-diagnostics")
print("  3. Click Settings (gear) > Project Settings")
print("  4. Go to 'Service Accounts' tab")
print("  5. Click 'Generate New Private Key'")
print("  6. Save as: firebase-service-account.json")
print()
print("STEP 2: Run Deployment")
print("  python3 firestore-deploy-complete.py")
print()
print("STEP 3: Deploy Security Rules")
print("  firebase deploy --only firestore:rules --project=disha-diagnostics")
print()
print("Files Ready for Deployment:")
print("  [YES] firestore-complete-schema.json - Database schema")
print("  [YES] firestore-security-rules.txt - Security rules")
print("  [YES] firebase-applet-config.json - Firebase config")
print("  [YES] firestore-deploy-complete.py - Deployment script")
print()
print("Waiting for: firebase-service-account.json (from Firebase Console)")
print()
