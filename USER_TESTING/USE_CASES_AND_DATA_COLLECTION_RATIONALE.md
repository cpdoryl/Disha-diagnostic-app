# 🎯 USE CASES & DATA COLLECTION RATIONALE - NEW SCHOOL CREATION

**Purpose:** Understand why schools are created and what data is collected  
**Audience:** Testing teams, admins, stakeholders  
**Date:** August 30, 2026  
**Document Type:** Knowledge & Understanding Guide

---

## 📌 **EXECUTIVE SUMMARY**

The **"Create New School"** feature in DISHA allows administrators to register new schools in the system. Each school represents a unique institution with its own:
- ✅ Assessment lifecycle
- ✅ Stakeholder groups
- ✅ Diagnostic data
- ✅ Performance metrics
- ✅ Institutional knowledge

This document explains **WHY** each data field is collected and **HOW** it's used.

---

## 🏢 **WHAT IS A SCHOOL IN DISHA?**

### **Definition**

```
A SCHOOL is a unique institutional entity in DISHA that:
  ✅ Represents a K-12 educational institution
  ✅ Has its own data storage & isolation
  ✅ Conducts independent diagnostic assessments
  ✅ Maintains separate stakeholder groups
  ✅ Generates independent institutional reports
  ✅ Tracks its own performance metrics
  ✅ Maintains historical trend data
```

### **School Types in DISHA**

```
📚 PRIMARY SCHOOL
   └─ Classes 1-5
   └─ Age: 6-11 years
   
📚 SECONDARY SCHOOL
   └─ Classes 6-10
   └─ Age: 11-16 years
   
📚 HIGHER SECONDARY SCHOOL
   └─ Classes 11-12
   └─ Age: 16-18 years
   
📚 COMPREHENSIVE/COMBINED SCHOOL
   └─ Classes 1-12
   └─ All student ages
```

---

## 🎯 **PRIMARY USE CASES**

### **USE CASE 1: Multi-School District/Organization**

```
SCENARIO:
  • Educational trust operates 5 schools
  • Each school is independent entity
  • Headquarters wants consolidated view

NEED:
  • Create separate school profiles
  • Each school conducts own assessment
  • Headquarters can compare schools
  • Track performance across schools

DATA USED:
  ✅ School Name (identify each school)
  ✅ Location (geographic differentiation)
  ✅ Principal Name (school leadership)
  ✅ Board (curriculum type)
  └─ All help distinguish between schools
```

### **USE CASE 2: Growth & Expansion**

```
SCENARIO:
  • School opens new branch/campus
  • Same organization, different location
  • Need separate assessments

NEED:
  • Register new branch as separate school
  • Conduct independent diagnostic
  • Track branch-specific performance
  • Compare with main campus

DATA USED:
  ✅ School Name (new branch name)
  ✅ Location (branch address)
  ✅ Contact Email (branch admin)
  ✅ Phone (branch direct line)
  └─ All enable branch-specific management
```

### **USE CASE 3: Assessment Deployment**

```
SCENARIO:
  • District wants to assess 50 schools
  • Each school needs own assessment cycle
  • Results must be comparable

NEED:
  • Register all 50 schools
  • Deploy assessments to each
  • Collect independent feedback
  • Compare performance across schools

DATA USED:
  ✅ School Code (unique identifier)
  ✅ Board (curriculum alignment)
  ✅ School Type (size/complexity)
  ✅ Email (assessment invitations)
  └─ Enable systematic assessment deployment
```

### **USE CASE 4: Performance Benchmarking**

```
SCENARIO:
  • School wants to compare with peers
  • Needs to track own progress
  • Must understand institutional health

NEED:
  • Create school profile with details
  • Run diagnostics
  • Compare against peer schools
  • Track improvements over time

DATA USED:
  ✅ School Name (peer identification)
  ✅ Location (geographic peers)
  ✅ Board (curriculum standards)
  ✅ School Type (size comparison)
  └─ All enable peer benchmarking
```

---

## 📊 **DETAILED FIELD ANALYSIS - WHY EACH DATA IS COLLECTED**

### **FIELD 1: School Name**

```
WHAT IT IS:
  Official name of the educational institution

WHY COLLECTED:
  ✅ Unique Identification
     └─ Distinguishes this school from others
     └─ Users need to identify their school
     
  ✅ Branding & Identity
     └─ Reflects official school name
     └─ Used in reports and communications
     
  ✅ Data Organization
     └─ Primary key for school identification
     └─ Used in dropdown selections

HOW USED:
  • Dashboard display: "Active School: [School Name]"
  • Reports header: School name on all reports
  • Communications: School name in emails
  • Comparisons: Name used for peer matching

DATA FORMAT:
  • String, 3-100 characters
  • Examples: 
    - "Delhi Public School, Bangalore"
    - "St. Xavier's High School"
    - "Government School No. 5"

VALUE TO ORGANIZATION:
  ⭐⭐⭐⭐⭐ CRITICAL
  └─ Cannot operate without this
```

### **FIELD 2: School Code**

```
WHAT IT IS:
  Internal identifier/code for the school

WHY COLLECTED:
  ✅ Unique Identifier
     └─ Differentiates schools with similar names
     └─ Useful for large organizations
     
  ✅ System Integration
     └─ Links with ERP/MIS systems
     └─ Enables data reconciliation
     
  ✅ Reporting & Analytics
     └─ Used in automated reports
     └─ Cleaner than full school name

HOW USED:
  • Database primary key
  • System-to-system communication
  • Analytics reports ("School: TSA-2026")
  • Historical tracking

DATA FORMAT:
  • Alphanumeric, 3-20 characters
  • Format: [ABBREVIATION]-[YEAR]-[SEQUENCE]
  • Examples:
    - TSA-2026-01
    - DPS-BNG-2026
    - STXAV-2026-KA

VALUE TO ORGANIZATION:
  ⭐⭐⭐⭐ HIGH
  └─ Very useful for large-scale deployments
```

### **FIELD 3: Location/City**

```
WHAT IT IS:
  City or geographic location where school operates

WHY COLLECTED:
  ✅ Geographic Contextualization
     └─ Understand regional performance
     └─ Identify location-based challenges
     
  ✅ Peer Benchmarking
     └─ Compare with schools in same city
     └─ Consider urban vs. rural differences
     
  ✅ Resource Allocation
     └─ Identify regional support needs
     └─ Plan targeted interventions
     
  ✅ Policy & Standards
     └─ Different states have different standards
     └─ Align with regional educational policies

HOW USED:
  • Filter schools by location
  • Regional performance dashboards
  • Peer comparison within same city
  • Resource planning
  • Regional workshops and training

DATA FORMAT:
  • String, 2-50 characters
  • Examples:
    - Bangalore
    - New Delhi
    - Mumbai Metropolitan Area

VALUE TO ORGANIZATION:
  ⭐⭐⭐⭐ HIGH
  └─ Important for regional comparisons
```

### **FIELD 4: State**

```
WHAT IT IS:
  Indian state where school is located

WHY COLLECTED:
  ✅ Regulatory Compliance
     └─ Different states have different regulations
     └─ Different boards operate by state
     
  ✅ Educational Standards
     └─ State-specific curriculum (State Board)
     └─ State-specific educational policies
     
  ✅ Performance Analysis
     └─ Compare state-level performance
     └─ Track state-specific trends
     
  ✅ Resource Planning
     └─ State-level educational support
     └─ Regional infrastructure needs

HOW USED:
  • Educational board alignment
  • State-level performance reports
  • Regulatory requirement documentation
  • Policy compliance verification

DATA FORMAT:
  • String, 2-30 characters
  • Examples:
    - Karnataka
    - Maharashtra
    - Tamil Nadu
    - Delhi

VALUE TO ORGANIZATION:
  ⭐⭐⭐⭐⭐ CRITICAL
  └─ Essential for compliance & policy
```

### **FIELD 5: Board/Curriculum**

```
WHAT IT IS:
  Educational board/curriculum system (CBSE, ICSE, State Board)

WHY COLLECTED:
  ✅ Curriculum Standardization
     └─ Different boards have different standards
     └─ Assessment questions aligned to board
     
  ✅ Operational Excellence
     └─ Board-specific teaching standards
     └─ Board-specific learning outcomes
     
  ✅ Metric Alignment
     └─ Assessment metrics match board expectations
     └─ Benchmarks aligned to board standards
     
  ✅ Stakeholder Communication
     └─ Parents recognize their board
     └─ Teachers follow board curriculum

HOW USED:
  • Assessment question selection (board-specific)
  • Performance metric calibration
  • Recommendation generation (board-aligned)
  • Peer benchmarking (same board comparison)
  • Reports and communications

DATA FORMAT:
  • Dropdown selection
  • Options:
    - CBSE (Central Board of Secondary Education)
    - ICSE (Indian Certificate of Secondary Education)
    - State Board
    - IB (International Baccalaureate)
    - Other

VALUE TO ORGANIZATION:
  ⭐⭐⭐⭐⭐ CRITICAL
  └─ Determines assessment approach
```

### **FIELD 6: School Type**

```
WHAT IT IS:
  Type of school (Private, Government, NGO)

WHY COLLECTED:
  ✅ Resource Differentiation
     └─ Government schools have different challenges
     └─ Private schools have different constraints
     └─ NGO schools have unique characteristics
     
  ✅ Benchmark Groups
     └─ Compare similar school types
     └─ Peer benchmarking within type
     
  ✅ Support & Intervention
     └─ Different schools need different support
     └─ Government schools may need different solutions
     
  ✅ Analysis & Reporting
     └─ Separate analysis by school type
     └─ Type-specific recommendations

HOW USED:
  • Create benchmark comparison groups
  • Type-specific analysis dashboards
  • Targeted intervention recommendations
  • Support resource allocation

DATA FORMAT:
  • Dropdown selection
  • Options:
    - Private
    - Government
    - NGO/Non-profit
    - Public-Private Partnership

VALUE TO ORGANIZATION:
  ⭐⭐⭐⭐ HIGH
  └─ Important for targeted analysis
```

### **FIELD 7: Principal Name**

```
WHAT IT IS:
  Name of school principal/head

WHY COLLECTED:
  ✅ School Leadership Identification
     └─ Know decision maker
     └─ Identify school head
     
  ✅ Stakeholder Communication
     └─ Report to school leadership
     └─ Maintain institutional relationship
     
  ✅ Accountability
     └─ Link assessments to leadership
     └─ Track leadership tenure
     
  ✅ Report Context
     └─ Formal reports include principal name
     └─ Professional documentation

HOW USED:
  • Report headers (professional documentation)
  • Communication records
  • Stakeholder meeting invitations
  • Leadership accountability tracking

DATA FORMAT:
  • String, 3-50 characters
  • Examples:
    - Dr. Rajesh Kumar
    - Ms. Priya Sharma
    - Mr. A.K. Desai

VALUE TO ORGANIZATION:
  ⭐⭐⭐ MEDIUM
  └─ Useful for communication & reports
```

### **FIELD 8: Email Address**

```
WHAT IT IS:
  Official school email address

WHY COLLECTED:
  ✅ Primary Communication Channel
     └─ Send assessment invitations
     └─ Share diagnostic reports
     └─ Update school on progress
     
  ✅ Authentication & Security
     └─ Verify school identity
     └─ Send account notifications
     
  ✅ Integration & Automation
     └─ Enable automated workflows
     └─ Link with email communications
     
  ✅ Data Verification
     └─ Valid institutional email
     └─ Professional communication record

HOW USED:
  • Assessment invitations and links
  • Report distribution
  • Account notifications
  • Password resets
  • Official communications

DATA FORMAT:
  • Email format (name@domain.com)
  • Validation: Must contain @ and domain
  • Examples:
    - admin@testschool.com
    - principal@school.ac.in

VALUE TO ORGANIZATION:
  ⭐⭐⭐⭐⭐ CRITICAL
  └─ Essential for communication & system access
```

### **FIELD 9: Phone Number**

```
WHAT IT IS:
  School's official contact phone number

WHY COLLECTED:
  ✅ Direct Communication
     └─ Reach school directly
     └─ Urgent communications
     
  ✅ Verification
     └─ Verify school identity
     └─ Validate institutional existence
     
  ✅ Support & Follow-up
     └─ Follow-up calls for assessments
     └─ Technical support
     └─ Implementation guidance
     
  ✅ Contact Directory
     └─ Maintain school contact records
     └─ Staff directory

HOW USED:
  • Direct outreach for assessments
  • Follow-up calls
  • Support contact
  • Institutional verification
  • Emergency communications

DATA FORMAT:
  • Phone number with country code
  • Format: +91-XXXXX-XXXXX
  • Examples:
    - +91-80-4444-5555
    - +91-98920-73660

VALUE TO ORGANIZATION:
  ⭐⭐⭐⭐ HIGH
  └─ Important for direct communication
```

### **FIELD 10: Address**

```
WHAT IT IS:
  Physical address of school location

WHY COLLECTED:
  ✅ Institutional Verification
     └─ Confirm school exists
     └─ Verify physical location
     
  ✅ Logistics & Planning
     └─ Visit planning
     └─ Training event location
     
  ✅ Documentation
     └─ Official school documentation
     └─ Records for compliance

HOW USED:
  • School verification database
  • Visit planning and coordination
  • Official document records
  • Address verification for compliance

DATA FORMAT:
  • String, up to 200 characters
  • Examples:
    - "123 Main Street, Bangalore, KA 560001"
    - "Plot 45, MG Road, New Delhi"

VALUE TO ORGANIZATION:
  ⭐⭐⭐ MEDIUM
  └─ Useful for verification & logistics
```

---

## 🔄 **DATA FLOW - HOW DATA IS USED**

### **After School Creation**

```
STEP 1: DATA STORAGE
  School data stored in Firestore
  └─ Path: schools/{schoolId}
  └─ All fields indexed for quick lookup

STEP 2: DASHBOARD DISPLAY
  School name shows in UI
  └─ Users see: "Active School: Test School Alpha"
  └─ Users can select different schools

STEP 3: ASSESSMENT DEPLOYMENT
  Email used to send assessment links
  └─ Assessment invitation sent to school email
  └─ Contains school-specific assessment ID
  └─ School name included in email

STEP 4: DATA COLLECTION
  School conducts assessment
  └─ Stakeholders answer questions
  └─ Responses linked to this school
  └─ Board-specific questions selected

STEP 5: ANALYSIS & REPORTING
  Collected data analyzed
  └─ Board-specific metrics calculated
  └─ School type determines benchmarks
  └─ Location used for peer comparison
  └─ Report generated with principal name

STEP 6: COMMUNICATION
  Results shared with school
  └─ Email sent to school contact
  └─ Phone call for follow-up
  └─ Principal receives formal report
```

---

## 💡 **KNOWLEDGE GAINED FROM SCHOOL DATA**

### **Institutional Understanding**

```
WHAT WE LEARN ABOUT SCHOOL:

1. IDENTITY & CONTEXT
   ✅ Who the school is
   ✅ Where they operate
   ✅ What board they follow
   ✅ What type they are
   └─ Enables personalized experience

2. OPERATIONAL INSIGHTS
   ✅ Leadership structure (principal)
   ✅ Primary contact method (email/phone)
   ✅ Geographic context (location/state)
   ✅ Institutional size (inferred from type)
   └─ Helps tailor support & recommendations

3. COMPARATIVE ANALYSIS
   ✅ Performance vs. same-type schools
   ✅ Performance vs. same-board schools
   ✅ Performance vs. same-location schools
   ✅ Performance vs. national benchmarks
   └─ Identifies improvement opportunities

4. TREND TRACKING
   ✅ School's progress over time
   ✅ Leadership changes impact
   ✅ Policy implementation success
   ✅ Intervention effectiveness
   └─ Shows improvement journey
```

### **System Knowledge**

```
WHAT DISHA LEARNS:

1. COVERAGE MAPPING
   ✅ Which schools are using DISHA
   ✅ Geographic distribution
   ✅ Board distribution
   ✅ School type distribution
   └─ Identify gaps and expansion areas

2. PERFORMANCE PATTERNS
   ✅ Average performance by location
   ✅ Average performance by board
   ✅ Average performance by type
   └─ Identify systemic issues

3. PEER GROUPS
   ✅ Schools with similar contexts
   ✅ Best performing in each category
   ✅ Struggling schools needing support
   └─ Enable targeted interventions
```

---

## 🎯 **WHY THIS DATA MATTERS - BUSINESS VALUE**

### **For Schools**

```
✅ SELF-AWARENESS
   └─ Understand institutional health
   └─ Identify strengths & weaknesses
   └─ Know where to improve

✅ BENCHMARKING
   └─ Compare with similar schools
   └─ Set performance targets
   └─ Track progress

✅ DECISION MAKING
   └─ Evidence-based improvements
   └─ Prioritize interventions
   └─ Measure impact

✅ STAKEHOLDER COMMUNICATION
   └─ Share data with board/parents
   └─ Demonstrate progress
   └─ Build trust through transparency
```

### **For DISHA**

```
✅ SYSTEM INTELLIGENCE
   └─ Understand school network
   └─ Track overall impact
   └─ Identify patterns

✅ SERVICE IMPROVEMENT
   └─ Tailor features to school types
   └─ Improve support systems
   └─ Better recommendations

✅ MARKET UNDERSTANDING
   └─ Know customer base
   └─ Identify expansion opportunities
   └─ Measure market penetration
```

### **For Educational Ecosystem**

```
✅ SYSTEM-LEVEL INSIGHTS
   └─ Understand education quality
   └─ Identify regional challenges
   └─ Support policy making

✅ RESOURCE ALLOCATION
   └─ Where support is most needed
   └─ Targeted interventions
   └─ Measurable impact

✅ KNOWLEDGE SHARING
   └─ Share best practices
   └─ Scale successful models
   └─ Build stronger system
```

---

## 📈 **DATA QUALITY & VALIDATION**

### **Why We Validate**

```
✅ DATA ACCURACY
   └─ School name must be accurate
   └─ Email must be deliverable
   └─ Phone must be reachable
   
✅ DATA COMPLETENESS
   └─ Required fields must not be null
   └─ Enables all workflows
   └─ No missing links in chain
   
✅ DATA CONSISTENCY
   └─ Board matches state standards
   └─ School type is valid category
   └─ Location matches state
   
✅ DATA SECURITY
   └─ Prevent duplicate schools
   └─ Validate institutional identity
   └─ Ensure authorized creation
```

---

## 🔐 **DATA PRIVACY & ETHICS**

### **How School Data is Protected**

```
✅ PRIVACY
   └─ School data is confidential
   └─ Not shared publicly
   └─ Only authorized staff access
   
✅ SECURITY
   └─ Data encrypted in transit
   └─ Data encrypted at rest
   └─ Access logs maintained
   
✅ COMPLIANCE
   └─ No misuse of school identity
   └─ No unauthorized access
   └─ GDPR-compliant where applicable
   
✅ TRANSPARENCY
   └─ Schools know their data
   └─ Clear terms of use
   └─ Can request data deletion
```

---

## 🎓 **LEARNING FROM NEW SCHOOL CREATION**

### **What Testers Learn**

```
✅ SYSTEM UNDERSTANDING
   └─ How school data flows through system
   └─ Why each field matters
   └─ How data enables features

✅ DATA QUALITY
   └─ What happens with good data
   └─ What happens with missing data
   └─ Impact on downstream processes

✅ WORKFLOW VALIDATION
   └─ School creation triggers downstream workflows
   └─ Database storage works correctly
   └─ UI reflects database changes

✅ USER EXPERIENCE
   └─ How users select & manage schools
   └─ How school context impacts experience
   └─ How data changes affect dashboards
```

### **What Admins Learn**

```
✅ INSTITUTIONAL SETUP
   └─ What information is needed
   └─ How to register schools
   └─ How data affects functionality

✅ DATA MANAGEMENT
   └─ School data governance
   └─ Data update procedures
   └─ Data security implications

✅ SYSTEM CAPABILITIES
   └─ Multi-school management
   └─ School-level isolation
   └─ Comparative analysis features
```

---

## 📊 **TESTING INSIGHTS - VALIDATE THE KNOWLEDGE**

### **When Testing School Creation, Verify**

```
DATA COLLECTION:
  ✅ All fields collect expected data
  ✅ Validation rules are applied
  ✅ Error messages are clear

DATA STORAGE:
  ✅ Data persists in database
  ✅ All fields stored correctly
  ✅ No data loss or truncation

DATA USAGE:
  ✅ School appears in dropdown
  ✅ Dashboard shows school name
  ✅ Assessment uses school context
  ✅ Reports include school data

WORKFLOW IMPACT:
  ✅ School creation triggers workflows
  ✅ Downstream systems receive data
  ✅ Email communications include school info
  ✅ Reports use school context
```

---

## 🎯 **SUMMARY - WHY CREATE NEW SCHOOLS**

| Field | Why Collected | What It Enables | Business Value |
|-------|---------------|-----------------|-----------------|
| School Name | Identity | School selection, reports | Critical |
| School Code | Unique ID | System integration | High |
| Location | Geography | Regional comparison | High |
| State | Regulation | Compliance, policy | Critical |
| Board | Curriculum | Assessment alignment | Critical |
| School Type | Context | Benchmarking | High |
| Principal Name | Leadership | Communication, reports | Medium |
| Email | Contact | Assessment invitations | Critical |
| Phone | Direct reach | Follow-up, support | High |
| Address | Verification | Logistics, compliance | Medium |

---

## 💼 **BUSINESS CONTINUITY THROUGH SCHOOL DATA**

```
SCHOOL REGISTRATION
    ↓
ASSESSMENT DEPLOYMENT
    ↓
DATA COLLECTION
    ↓
ANALYSIS & INSIGHTS
    ↓
RECOMMENDATIONS
    ↓
IMPLEMENTATION
    ↓
MEASUREMENT
    ↓
CONTINUOUS IMPROVEMENT

Each step depends on accurate school data
```

---

## ✅ **KNOWLEDGE VALIDATION**

### **After Reading This Document, You Should Understand**

```
✅ What a school represents in DISHA
✅ Why each data field is collected
✅ How data enables system functionality
✅ Why data accuracy matters
✅ How school creation impacts workflows
✅ What knowledge is gained from school data
✅ How data creates business value
✅ Why testing school creation is important
```

---

**Document Created:** August 30, 2026  
**Purpose:** Educational knowledge guide  
**Status:** 🟢 **COMPLETE**

**Next Steps:** Use this knowledge when testing school creation to understand:
- What data is important
- Why it matters
- How it impacts the system
- What to verify during testing

