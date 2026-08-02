#!/usr/bin/env python3
"""
DISHA Firestore Database Initialization Script
Initializes all collections, schemas, and sample data for all three stages
and all stakeholder types (Admin, Principal, Teacher, Parent, Student)
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import json
import os

# Initialize Firebase
def initialize_firebase():
    """Initialize Firebase with credentials"""
    try:
        # Try to use existing app
        app = firebase_admin.get_app()
    except ValueError:
        # Initialize new app if not exists
        cred = credentials.Certificate('firebase-applet-config.json')
        app = firebase_admin.initialize_app(cred)

    return firestore.client(app=app)

def create_schools_collection(db):
    """Create sample schools for different contexts"""
    print("Creating schools collection...")

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
            'principalPhone': '9876543210',
            'contactEmail': 'admin@delexcellence.edu',
            'contactPhone': '9876543210',
            'website': 'www.delexcellence.edu',
            'established': 2005,
            'grades': ['Nursery', 'LKG', 'UKG', '1-5', '6-8', '9-10', '11-12'],
            'features': ['Co-ed', 'Day-boarding', 'Sports Complex', 'STEM Lab'],
            'registrationDate': datetime.now(),
            'status': 'Active',
            'creditBalance': 50000,
            'subscriptionPlan': 'Enterprise',
            'subscriptionExpiry': datetime.now() + timedelta(days=365)
        },
        {
            'schoolId': 'school_002_mumbai_midmarket',
            'name': 'Mumbai Excellence Institute',
            'board': 'ICSE',
            'tier': 'Mid-Market',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'address': '456 Central Road, Mumbai',
            'pincode': '400001',
            'totalStudents': 650,
            'totalTeachers': 45,
            'principalName': 'Ms. Priya Sharma',
            'principalEmail': 'principal@mumbaiexcel.edu',
            'principalPhone': '9876543211',
            'contactEmail': 'admin@mumbaiexcel.edu',
            'contactPhone': '9876543211',
            'website': 'www.mumbaiexcel.edu',
            'established': 2010,
            'grades': ['1-5', '6-8', '9-10', '11-12'],
            'features': ['Co-ed', 'Science Labs'],
            'registrationDate': datetime.now(),
            'status': 'Active',
            'creditBalance': 30000,
            'subscriptionPlan': 'Professional',
            'subscriptionExpiry': datetime.now() + timedelta(days=180)
        },
        {
            'schoolId': 'school_003_bangalore_budget',
            'name': 'Bangalore Public School',
            'board': 'CBSE',
            'tier': 'Budget',
            'city': 'Bangalore',
            'state': 'Karnataka',
            'address': '789 Main Street, Bangalore',
            'pincode': '560001',
            'totalStudents': 500,
            'totalTeachers': 35,
            'principalName': 'Mr. Ramesh V',
            'principalEmail': 'principal@bangaloreps.edu',
            'principalPhone': '9876543212',
            'contactEmail': 'admin@bangaloreps.edu',
            'contactPhone': '9876543212',
            'website': 'www.bangaloreps.edu',
            'established': 2015,
            'grades': ['1-5', '6-8', '9-10'],
            'features': ['Co-ed'],
            'registrationDate': datetime.now(),
            'status': 'Active',
            'creditBalance': 15000,
            'subscriptionPlan': 'Starter',
            'subscriptionExpiry': datetime.now() + timedelta(days=90)
        }
    ]

    for school in schools:
        db.collection('schools').document(school['schoolId']).set(school)
        print(f"  ✓ Created school: {school['name']}")

    return schools

def create_users_collection(db, schools):
    """Create sample users for all stakeholder types"""
    print("\nCreating users collection...")

    users = [
        # SuperAdmin
        {
            'userId': 'user_super_admin',
            'email': 'admin@disha.io',
            'displayName': 'System Administrator',
            'phone': '9999999999',
            'role': 'SuperAdmin',
            'schoolId': None,
            'department': 'System',
            'designation': 'System Admin',
            'joinDate': datetime.now() - timedelta(days=365),
            'lastLogin': datetime.now(),
            'status': 'Active'
        },
        # School 1 - Premium
        {
            'userId': 'user_principal_delhi',
            'email': 'principal@delexcellence.edu',
            'displayName': 'Dr. Rajesh Kumar',
            'phone': '9876543210',
            'role': 'Principal',
            'schoolId': 'school_001_delhi_premium',
            'department': 'Administration',
            'designation': 'Principal',
            'qualifications': ['M.A.', 'B.Ed'],
            'yearsOfExperience': 15,
            'joinDate': datetime.now() - timedelta(days=365*10),
            'lastLogin': datetime.now(),
            'status': 'Active'
        },
        {
            'userId': 'user_teacher_delhi_1',
            'email': 'teacher1@delexcellence.edu',
            'displayName': 'Ms. Anjali Singh',
            'phone': '9876543213',
            'role': 'Teacher',
            'schoolId': 'school_001_delhi_premium',
            'department': 'Academic',
            'designation': 'Mathematics Teacher',
            'qualifications': ['B.Sc', 'B.Ed'],
            'yearsOfExperience': 8,
            'joinDate': datetime.now() - timedelta(days=365*5),
            'lastLogin': datetime.now() - timedelta(days=1),
            'status': 'Active'
        },
        {
            'userId': 'user_parent_delhi_1',
            'email': 'parent1@gmail.com',
            'displayName': 'Mr. Arjun Verma',
            'phone': '9876543214',
            'role': 'Parent',
            'schoolId': 'school_001_delhi_premium',
            'department': 'Parent',
            'designation': 'Parent',
            'joinDate': datetime.now() - timedelta(days=180),
            'lastLogin': datetime.now() - timedelta(days=2),
            'status': 'Active'
        },
        # School 2 - Mid-Market
        {
            'userId': 'user_principal_mumbai',
            'email': 'principal@mumbaiexcel.edu',
            'displayName': 'Ms. Priya Sharma',
            'phone': '9876543211',
            'role': 'Principal',
            'schoolId': 'school_002_mumbai_midmarket',
            'department': 'Administration',
            'designation': 'Principal',
            'qualifications': ['M.Sc', 'B.Ed'],
            'yearsOfExperience': 12,
            'joinDate': datetime.now() - timedelta(days=365*8),
            'lastLogin': datetime.now() - timedelta(hours=2),
            'status': 'Active'
        },
        # School 3 - Budget
        {
            'userId': 'user_principal_bangalore',
            'email': 'principal@bangaloreps.edu',
            'displayName': 'Mr. Ramesh V',
            'phone': '9876543212',
            'role': 'Principal',
            'schoolId': 'school_003_bangalore_budget',
            'department': 'Administration',
            'designation': 'Principal',
            'qualifications': ['M.A.', 'B.Ed'],
            'yearsOfExperience': 10,
            'joinDate': datetime.now() - timedelta(days=365*7),
            'lastLogin': datetime.now() - timedelta(days=5),
            'status': 'Active'
        }
    ]

    for user in users:
        db.collection('users').document(user['userId']).set(user)
        print(f"  ✓ Created user: {user['displayName']} ({user['role']})")

def create_challenges_catalog(db):
    """Create the 15 challenges master data"""
    print("\nCreating challenges catalog...")

    challenges = [
        {
            'challengeId': 'C1',
            'domain': 'Growth & Enrollment',
            'name': 'Enrollment Decline',
            'weight': 50,
            'primaryMetric': 'New Student Intake Rate (%)',
            'benchmark': {'excellent': 85, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C2',
            'domain': 'Growth & Enrollment',
            'name': 'Student Attrition',
            'weight': 40,
            'primaryMetric': 'Mid-Year Dropout Rate (%)',
            'benchmark': {'excellent': 85, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C3',
            'domain': 'Growth & Enrollment',
            'name': 'Fee Collection Challenges',
            'weight': 35,
            'primaryMetric': 'Fee Realization Rate (%)',
            'benchmark': {'excellent': 85, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C4',
            'domain': 'People & Staffing',
            'name': 'Teacher Attrition',
            'weight': 45,
            'primaryMetric': 'Teacher Turnover Rate (%)',
            'benchmark': {'excellent': 80, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C5',
            'domain': 'People & Staffing',
            'name': 'Staff Capability Gaps',
            'weight': 40,
            'primaryMetric': 'Teacher Competency Score (%)',
            'benchmark': {'excellent': 85, 'good': 65, 'average': 45, 'poor': 25}
        },
        {
            'challengeId': 'C6',
            'domain': 'People & Staffing',
            'name': 'Leadership Capability Gap',
            'weight': 45,
            'primaryMetric': 'Leadership Competency Score (%)',
            'benchmark': {'excellent': 85, 'good': 65, 'average': 45, 'poor': 25}
        },
        {
            'challengeId': 'C7',
            'domain': 'Academic & Wellbeing',
            'name': 'Academic Quality Decline',
            'weight': 50,
            'primaryMetric': 'Board Exam Pass Rate (%)',
            'benchmark': {'excellent': 85, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C8',
            'domain': 'Academic & Wellbeing',
            'name': 'Student Wellbeing Issues',
            'weight': 45,
            'primaryMetric': 'Mental Health Incidents (per 1000)',
            'benchmark': {'excellent': 85, 'good': 65, 'average': 45, 'poor': 25}
        },
        {
            'challengeId': 'C9',
            'domain': 'Academic & Wellbeing',
            'name': 'Remedial Lag',
            'weight': 40,
            'primaryMetric': 'Remedial Support Coverage (%)',
            'benchmark': {'excellent': 80, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C10',
            'domain': 'Reputation & Competition',
            'name': 'Parent Communication Issues',
            'weight': 35,
            'primaryMetric': 'Parent Satisfaction Score (%)',
            'benchmark': {'excellent': 80, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C11',
            'domain': 'Reputation & Competition',
            'name': 'Competitive Pressure',
            'weight': 40,
            'primaryMetric': 'Market Share Loss (%)',
            'benchmark': {'excellent': 85, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C12',
            'domain': 'Reputation & Competition',
            'name': 'Brand/Reputation Issues',
            'weight': 35,
            'primaryMetric': 'Brand Perception Score (%)',
            'benchmark': {'excellent': 80, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C13',
            'domain': 'Operations & Finance',
            'name': 'Cost Inflation',
            'weight': 35,
            'primaryMetric': 'Cost Increase YoY (%)',
            'benchmark': {'excellent': 75, 'good': 55, 'average': 35, 'poor': 15}
        },
        {
            'challengeId': 'C14',
            'domain': 'Operations & Finance',
            'name': 'Infrastructure Deficits',
            'weight': 40,
            'primaryMetric': 'Infrastructure Quality Score (%)',
            'benchmark': {'excellent': 80, 'good': 60, 'average': 40, 'poor': 20}
        },
        {
            'challengeId': 'C15',
            'domain': 'Operations & Finance',
            'name': 'Compliance & Regulatory Stress',
            'weight': 35,
            'primaryMetric': 'Compliance Score (%)',
            'benchmark': {'excellent': 85, 'good': 65, 'average': 45, 'poor': 25}
        }
    ]

    for challenge in challenges:
        db.collection('challenges_catalog').document(challenge['challengeId']).set(challenge)
        print(f"  ✓ Created challenge: {challenge['challengeId']} - {challenge['name']}")

def create_dimensions_catalog(db):
    """Create the 14 dimensions master data"""
    print("\nCreating dimensions catalog...")

    dimensions = [
        {'D': 'D01', 'name': 'Academic Reputation & Rigour', 'category': 'Academic Excellence', 'weight': 10, 'difficulty': 7},
        {'D': 'D02', 'name': 'Teacher Welfare & Development', 'category': 'Staff Development', 'weight': 9, 'difficulty': 6},
        {'D': 'D03', 'name': 'Leadership & Governance Quality', 'category': 'Institutional Governance', 'weight': 10, 'difficulty': 5},
        {'D': 'D04', 'name': 'Parent Engagement & SLA', 'category': 'Stakeholder Relations', 'weight': 8, 'difficulty': 4},
        {'D': 'D05', 'name': 'Student Safety & Wellness', 'category': 'Student Wellbeing', 'weight': 10, 'difficulty': 6},
        {'D': 'D06', 'name': 'Infrastructure & Facilities', 'category': 'Physical Resources', 'weight': 7, 'difficulty': 8},
        {'D': 'D07', 'name': 'Co-Curricular Education', 'category': 'Holistic Development', 'weight': 6, 'difficulty': 5},
        {'D': 'D08', 'name': 'Individual Attention (PTR)', 'category': 'Class Size & Personal Care', 'weight': 9, 'difficulty': 9},
        {'D': 'D09', 'name': 'Value for Money', 'category': 'Financial Viability', 'weight': 7, 'difficulty': 7},
        {'D': 'D10', 'name': 'Special Needs Inclusivity', 'category': 'Inclusive Education', 'weight': 6, 'difficulty': 7},
        {'D': 'D11', 'name': 'Community Service & Social Responsibility', 'category': 'Social Impact', 'weight': 5, 'difficulty': 4},
        {'D': 'D12', 'name': 'Faculty Competence & Retention', 'category': 'Staff Quality', 'weight': 9, 'difficulty': 6},
        {'D': 'D13', 'name': 'Internationalism & Cultural Diversity', 'category': 'Global Outlook', 'weight': 6, 'difficulty': 7},
        {'D': 'D14', 'name': 'Management Vision & Growth Drive', 'category': 'Strategic Direction', 'weight': 8, 'difficulty': 4}
    ]

    for dim in dimensions:
        doc_data = {
            'dimensionId': dim['D'],
            'name': dim['name'],
            'category': dim['category'],
            'weight': dim['weight'],
            'improvementDifficulty': dim['difficulty'],
            'benchmark': {'excellent': 85, 'good': 65, 'average': 45, 'poor': 25}
        }
        db.collection('dimensions_catalog').document(dim['D']).set(doc_data)
        print(f"  ✓ Created dimension: {dim['D']} - {dim['name']}")

def create_sample_stage1_assessment(db):
    """Create sample Stage 1 assessment"""
    print("\nCreating sample Stage 1 assessment...")

    assessment = {
        'assessmentId': 'assess_stage1_delhi_001',
        'schoolId': 'school_001_delhi_premium',
        'createdBy': 'user_principal_delhi',
        'createdAt': datetime.now(),
        'status': 'Submitted',
        'schoolDetails': {
            'name': 'Delhi Excellence Academy',
            'board': 'CBSE',
            'totalStudents': 850,
            'city': 'Delhi',
            'feeTier': 'Premium'
        },
        'selectedChallenges': ['C1', 'C4', 'C10'],
        'challengeWeights': {'C1': 0.50, 'C4': 0.30, 'C10': 0.20},
        'operationalMetrics': {
            'str': 28,
            'parentSLA': 24,
            'trainingHours': 15,
            'planningTime': 4
        },
        'calculations': {
            'sSubScore': 52.22,
            'objectiveMultiplier': 0.748,
            'scaledScore': 39.06,
            'delisionPenalty': 0,
            'healthIndex': 39.06,
            'riskQuadrant': 'Delusional Comfort'
        }
    }

    db.collection('stage1_firstOpinionAssessments').document('assess_stage1_delhi_001').set(assessment)
    print(f"  ✓ Created Stage 1 assessment for {assessment['schoolDetails']['name']}")

def create_sample_stage2_assessment(db):
    """Create sample Stage 2 assessment"""
    print("\nCreating sample Stage 2 assessment...")

    assessment = {
        'assessmentId': 'assess_stage2_mumbai_001',
        'schoolId': 'school_002_mumbai_midmarket',
        'createdBy': 'user_principal_mumbai',
        'createdAt': datetime.now(),
        'status': 'Submitted',
        'dimensionScores': {
            'D01': 88, 'D02': 82, 'D03': 85, 'D04': 80, 'D05': 82,
            'D06': 75, 'D07': 70, 'D08': 78, 'D09': 72, 'D10': 65,
            'D11': 68, 'D12': 86, 'D13': 72, 'D14': 80
        },
        'overallHealthIndex': 77.9,
        'healthStatus': 'Healthy School',
        'strengths': ['D01', 'D02', 'D03', 'D05', 'D12'],
        'weaknesses': ['D10', 'D07', 'D11']
    }

    db.collection('stage2_14dAssessments').document('assess_stage2_mumbai_001').set(assessment)
    print(f"  ✓ Created Stage 2 assessment for Mumbai school")

def create_sample_stage3_plan(db):
    """Create sample Stage 3 improvement plan"""
    print("\nCreating sample Stage 3 improvement plan...")

    plan = {
        'planId': 'plan_stage3_bangalore_001',
        'schoolId': 'school_003_bangalore_budget',
        'createdBy': 'user_principal_bangalore',
        'createdAt': datetime.now(),
        'planName': 'Bangalore 2026 Excellence Drive',
        'status': 'Active',
        'goalSetting': {
            'currentHealthIndex': 72,
            'targetHealthIndex': 80,
            'gap': 8,
            'timelineMonths': 12,
            'availableBudget': 5000000,
            'priorityFocus': 'Academic',
            'riskTolerance': 'Medium'
        },
        'reverseCalculation': {
            'requiredPoints': 87.2,
            'currentPoints': 78.48,
            'pointsToGain': 8.72
        },
        'feasibilityAssessment': {
            'overallFeasibility': 75,
            'riskLevel': 'Medium',
            'adjustedTarget': 78
        },
        'timeline': {
            'phase1': {'name': 'Foundation', 'months': '1-3', 'budget': 1000000},
            'phase2': {'name': 'Build', 'months': '4-9', 'budget': 2500000},
            'phase3': {'name': 'Optimize', 'months': '10-12', 'budget': 1500000}
        }
    }

    db.collection('stage3_improvementPlans').document('plan_stage3_bangalore_001').set(plan)
    print(f"  ✓ Created Stage 3 improvement plan for Bangalore school")

def main():
    """Main initialization function"""
    print("=" * 70)
    print("DISHA FIRESTORE DATABASE INITIALIZATION")
    print("=" * 70)

    try:
        db = initialize_firebase()
        print("✓ Firebase initialized successfully\n")

        # Create all collections
        schools = create_schools_collection(db)
        create_users_collection(db, schools)
        create_challenges_catalog(db)
        create_dimensions_catalog(db)
        create_sample_stage1_assessment(db)
        create_sample_stage2_assessment(db)
        create_sample_stage3_plan(db)

        print("\n" + "=" * 70)
        print("SUCCESS! FIRESTORE DATABASE INITIALIZED")
        print("=" * 70)
        print("\nInitialized Collections:")
        print("  ✓ schools (3 sample schools)")
        print("  ✓ users (6 sample users across roles)")
        print("  ✓ challenges_catalog (15 challenges)")
        print("  ✓ dimensions_catalog (14 dimensions)")
        print("  ✓ stage1_firstOpinionAssessments (1 sample)")
        print("  ✓ stage2_14dAssessments (1 sample)")
        print("  ✓ stage3_improvementPlans (1 sample)")
        print("\nReady for production use!")

    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        print("Please ensure:")
        print("  1. firebase-applet-config.json exists")
        print("  2. Firebase Admin SDK is installed: pip install firebase-admin")
        print("  3. Firestore database is created in Firebase Console")

if __name__ == "__main__":
    main()
