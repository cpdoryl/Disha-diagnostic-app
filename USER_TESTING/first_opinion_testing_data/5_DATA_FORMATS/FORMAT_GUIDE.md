# 📤 FIRST OPINION ENGINE - DATA UPLOAD FORMAT GUIDE

**Purpose:** Define upload-ready data formats for First Opinion Engine testing  
**Date:** August 30, 2026  
**Version:** 1.0

---

## 📋 **SUPPORTED UPLOAD FORMATS**

The First Opinion Engine supports multiple data upload formats for flexibility:

| Format | Use Case | Complexity | File Size | Support |
|--------|----------|-----------|-----------|---------|
| **CSV** | Multiplier data, bulk responses | Simple | Small | ✅ Yes |
| **JSON** | Complete workflows, batch imports | Medium | Medium | ✅ Yes |
| **XLSX/Excel** | User-friendly spreadsheet entry | Simple | Small | ✅ Yes |
| **ZIP Bundle** | Complete test package (all data) | Complex | Large | ✅ Yes |
| **Firestore Import** | Direct database import | Advanced | Any | ✅ Yes |

---

## 📊 **FORMAT 1: CSV (COMMA-SEPARATED VALUES)**

### **Use Case**
Best for: Multiplier data, bulk spreadsheet entry, simple data import

### **File Format**
```csv
name,value,category,validationStatus,dataSource,updatedAt
STR,0.82,CORE,VALID,HR System,2026-08-30T10:00:00Z
Parent SLA,0.90,CORE,VALID,Helpdesk,2026-08-30T10:00:00Z
Training Hours,0.85,CORE,VALID,HR Records,2026-08-30T10:00:00Z
Planning Time,0.88,CORE,VALID,Timetable,2026-08-30T10:00:00Z
Fee Realization,0.98,EXPANDED,VALID,Finance,2026-08-30T10:00:00Z
Safety Score,1.0,EXPANDED,VALID,Audit,2026-08-30T10:00:00Z
LMS Usage,0.92,EXPANDED,VALID,Analytics,2026-08-30T10:00:00Z
Co-Curricular,0.88,EXPANDED,VALID,Rosters,2026-08-30T10:00:00Z
```

### **Schema Requirements**

```
Column 1: name (Required)
  Type: String
  Values: STR, Parent SLA, Training Hours, Planning Time, 
          Fee Realization, Safety Score, LMS Usage, Co-Curricular
  Length: Max 50 characters
  Example: "STR"

Column 2: value (Required)
  Type: Number (Float)
  Range: 0.0 to 1.0
  Decimal: 2 places recommended
  Example: 0.82

Column 3: category (Required)
  Type: String
  Values: CORE or EXPANDED
  Example: "CORE"

Column 4: validationStatus (Required)
  Type: String
  Values: VALID, MISSING, OUTLIER, PENDING
  Example: "VALID"

Column 5: dataSource (Optional)
  Type: String
  Description: Where data came from
  Example: "HR System - Teacher Roster"

Column 6: updatedAt (Recommended)
  Type: ISO 8601 Timestamp
  Format: YYYY-MM-DDTHH:MM:SSZ
  Example: "2026-08-30T10:00:00Z"
```

### **Validation Rules**
```
✅ MUST have exactly 8 multipliers
✅ MUST include all mandatory multipliers (STR, Parent SLA, Training, Planning)
✅ MUST include all expanded multipliers (Fee, Safety, LMS, Co-Curricular)
✅ Each value MUST be between 0.0 and 1.0
✅ NO duplicate multiplier names
✅ Column headers MUST match exactly
✅ Values MUST be valid (no "N/A" or text)
```

### **How to Use**
```
1. Download: csv_template_multiplier_data.csv
2. Open: Excel, Google Sheets, or text editor
3. Fill: All 8 multiplier rows with your data
4. Save: As CSV format (.csv)
5. Upload: Via app's data import feature
```

---

## 🔗 **FORMAT 2: JSON (JAVASCRIPT OBJECT NOTATION)**

### **Use Case**
Best for: Complete workflows, API integration, batch imports

### **Challenge Responses JSON Structure**

```json
{
  "metadata": {
    "type": "challenge_responses_batch",
    "version": "1.0",
    "totalRecords": 15,
    "timestamp": "2026-08-30T15:00:00Z",
    "schoolId": "test_school_001"
  },
  "responses": [
    {
      "challengeId": "C1",
      "challengeName": "Enrollment Decline",
      "domain": "Growth & Enrollment",
      "responseValue": 1,
      "responseLabel": "No Impact",
      "weight": 0.20,
      "responderId": "principal_001",
      "respondentRole": "Principal",
      "respondentEmail": "principal@school.com",
      "timestamp": "2026-08-30T15:05:00Z"
    },
    {
      "challengeId": "C2",
      "challengeName": "Student Retention",
      "domain": "Growth & Enrollment",
      "responseValue": 1,
      "responseLabel": "No Impact",
      "weight": 0.20,
      "responderId": "principal_001",
      "respondentRole": "Principal",
      "respondentEmail": "principal@school.com",
      "timestamp": "2026-08-30T15:05:00Z"
    }
    // ... 13 more responses (C3-C15)
  ]
}
```

### **Schema Requirements - Challenge Response**

```json
{
  "challengeId": {
    "type": "String",
    "required": true,
    "pattern": "C[0-9]|C1[0-5]",
    "description": "Challenge ID C1 through C15",
    "example": "C1"
  },
  "challengeName": {
    "type": "String",
    "required": true,
    "description": "Human-readable challenge name",
    "example": "Enrollment Decline"
  },
  "domain": {
    "type": "String",
    "required": true,
    "values": [
      "Growth & Enrollment",
      "People & Staffing",
      "Academic & Student Wellbeing",
      "Reputation & Competition",
      "Operations & Finance"
    ],
    "description": "Domain classification",
    "example": "Growth & Enrollment"
  },
  "responseValue": {
    "type": "Number",
    "required": true,
    "range": [1, 6],
    "description": "Response option number (1=No Impact to 6=Major Crisis)",
    "example": 1
  },
  "responseLabel": {
    "type": "String",
    "required": true,
    "values": [
      "No Impact",
      "Minor Challenge",
      "Significant Challenge",
      "Major Crisis"
    ],
    "example": "No Impact"
  },
  "weight": {
    "type": "Number",
    "required": false,
    "range": [0.0, 1.0],
    "description": "Domain weight for calculation",
    "example": 0.20
  },
  "responderId": {
    "type": "String",
    "required": false,
    "description": "Unique respondent identifier",
    "example": "principal_001"
  },
  "respondentRole": {
    "type": "String",
    "required": false,
    "values": ["Principal", "Teacher", "Parent", "Student", "Admin", "Other"],
    "example": "Principal"
  },
  "respondentEmail": {
    "type": "String",
    "required": false,
    "format": "email",
    "example": "principal@school.com"
  },
  "timestamp": {
    "type": "ISO 8601",
    "required": false,
    "format": "YYYY-MM-DDTHH:MM:SSZ",
    "example": "2026-08-30T15:05:00Z"
  }
}
```

### **Multiplier Data JSON Structure**

```json
{
  "metadata": {
    "type": "multiplier_data_batch",
    "version": "1.0",
    "totalRecords": 8,
    "timestamp": "2026-08-30T15:00:00Z",
    "cycleId": "cycle_2026_08"
  },
  "multipliers": [
    {
      "id": "m1",
      "name": "STR",
      "fullName": "Student-Teacher Ratio",
      "category": "CORE",
      "value": 0.82,
      "scaledValue": 82,
      "validationStatus": "VALID",
      "dataSource": "HR System",
      "updatedAt": "2026-08-30T10:00:00Z"
    },
    {
      "id": "m2",
      "name": "Parent SLA",
      "fullName": "Parent Response SLA",
      "category": "CORE",
      "value": 0.90,
      "scaledValue": 90,
      "validationStatus": "VALID",
      "dataSource": "Helpdesk",
      "updatedAt": "2026-08-30T10:00:00Z"
    }
    // ... 6 more multipliers
  ]
}
```

### **Multiplier Schema**

```json
{
  "id": {
    "type": "String",
    "required": true,
    "pattern": "m[1-8]",
    "example": "m1"
  },
  "name": {
    "type": "String",
    "required": true,
    "values": ["STR", "Parent SLA", "Training Hours", "Planning Time", 
               "Fee Realization", "Safety Score", "LMS Usage", "Co-Curricular"],
    "example": "STR"
  },
  "value": {
    "type": "Number",
    "required": true,
    "range": [0.0, 1.0],
    "description": "Objective multiplier value (0=worst, 1=best)",
    "example": 0.82
  },
  "category": {
    "type": "String",
    "required": true,
    "values": ["CORE", "EXPANDED"],
    "example": "CORE"
  },
  "validationStatus": {
    "type": "String",
    "required": true,
    "values": ["VALID", "MISSING", "OUTLIER", "PENDING"],
    "example": "VALID"
  },
  "dataSource": {
    "type": "String",
    "required": false,
    "example": "HR System - Teacher Roster"
  }
}
```

### **How to Use**
```
1. Download: json_sample_challenge_responses.json or json_sample_multipliers.json
2. Open: Text editor or JSON validator
3. Modify: Replace with your own data
4. Validate: Use JSON schema validator
5. Upload: Via app's API or import function
```

---

## 📊 **FORMAT 3: EXCEL/XLSX (SPREADSHEET)**

### **Use Case**
Best for: User-friendly entry, non-technical users, group data entry

### **Sheet 1: Challenge Responses**

```
Excel Headers:
A: Challenge ID
B: Challenge Name
C: Domain
D: Response Value (1-6)
E: Response Label
F: Responder Role
G: Responder Email
H: Timestamp

Row 1: C1 | Enrollment Decline | Growth & Enrollment | 1 | No Impact | Principal | principal@school.com | 2026-08-30T15:05:00Z
Row 2: C2 | Student Retention | Growth & Enrollment | 1 | No Impact | Principal | principal@school.com | 2026-08-30T15:05:00Z
Row 3: C3 | Admission Quality | Growth & Enrollment | 2 | Minor Challenge | Principal | principal@school.com | 2026-08-30T15:05:00Z
... (rows 4-15 for C4-C15)
```

### **Sheet 2: Multipliers**

```
Excel Headers:
A: Multiplier ID
B: Multiplier Name
C: Category (CORE/EXPANDED)
D: Value (0.0-1.0)
E: Scaled Value (0-100)
F: Validation Status
G: Data Source
H: Updated Timestamp

Row 1: m1 | STR | CORE | 0.82 | 82 | VALID | HR System | 2026-08-30T10:00:00Z
Row 2: m2 | Parent SLA | CORE | 0.90 | 90 | VALID | Helpdesk | 2026-08-30T10:00:00Z
Row 3: m3 | Training Hours | CORE | 0.85 | 85 | VALID | HR Records | 2026-08-30T10:00:00Z
... (rows 4-8 for m4-m8)
```

### **Sheet 3: School Profile**

```
Label | Value
School Name | Sterling International School
School ID | test_tier1_metro_001
Board | CBSE
School Size | Large (1500+ students)
Fee Band | Premium (₹75k+ per year)
City Tier | Tier 1 (Metro)
School Type | Private
Location | Mumbai, Maharashtra
Principal Name | Dr. Rajesh Kumar
Contact Email | principal@school.com
Contact Phone | +91-9876543210
Assessment Date | 2026-08-30
Respondent Role | Principal
Respondent Name | Dr. Rajesh Kumar
```

### **How to Use**
```
1. Download: xlsx_template_first_opinion_data.xlsx
2. Open: Microsoft Excel, Google Sheets, or LibreOffice
3. Fill: 
   - Sheet 1: Challenge responses (15 rows, C1-C15)
   - Sheet 2: Multiplier data (8 rows, m1-m8)
   - Sheet 3: School profile (meta information)
4. Validate: Check data types and ranges
5. Export: As XLSX or CSV
6. Upload: Via app's import feature
```

### **Data Validation Rules (Excel)**

```
Challenge Response Sheet:
  ✅ Column D (Response Value): Dropdown list 1-6
  ✅ Column E (Response Label): Dropdown list (No Impact, Minor Challenge, etc.)
  ✅ Column C (Domain): Dropdown list (5 domains)
  ✅ Rows 1-15 required (no blank rows)

Multiplier Sheet:
  ✅ Column D (Value): Number between 0.0-1.0
  ✅ Column B (Name): Only 8 specific multipliers allowed
  ✅ Column C (Category): CORE or EXPANDED
  ✅ Column F (Status): VALID, MISSING, OUTLIER, PENDING
  ✅ Rows 1-8 required (exactly 8 multipliers)
```

---

## 📦 **FORMAT 4: ZIP BUNDLE**

### **Use Case**
Best for: Complete test package, distribution, backup

### **ZIP Structure**

```
test_data_scenario_1.zip
├── school_profile.json
├── challenge_responses.json
├── multiplier_data.json
├── metadata.json
└── README.txt
```

### **Contents**

```
school_profile.json
  └─ Complete school information
  └─ 8-12 KB

challenge_responses.json
  └─ All 15 challenge responses
  └─ 12-15 KB

multiplier_data.json
  └─ All 8 multiplier values
  └─ 10-12 KB

metadata.json
  └─ Test scenario metadata
  └─ Expected results
  └─ 5-8 KB

README.txt
  └─ Import instructions
  └─ Schema documentation
  └─ 2-3 KB
```

### **How to Use**
```
1. Download: test_data_scenario_1.zip
2. Extract: All files to local directory
3. Review: README.txt for instructions
4. Import: Each file as needed via app
5. Verify: All data loaded correctly
```

---

## 🔄 **FORMAT 5: FIRESTORE IMPORT (ADVANCED)**

### **Use Case**
Best for: Direct database import, advanced users, DevOps

### **Import via Firebase Console**

```
Path: schools/{schoolId}/assessmentCycles/{cycleId}/
Import Type: JSON
File Format: Firestore JSON export

File Structure:
{
  "schools": {
    "test_school_001": {
      "assessmentCycles": {
        "cycle_2026_08": {
          "challengeResponses": { ... },
          "multipliers": { ... },
          "scores": { ... }
        }
      }
    }
  }
}
```

### **How to Use**
```
1. Go to: Firebase Console → Firestore Database
2. Click: Start Collection
3. Collection ID: schools
4. Document ID: test_school_001
5. Click: Import (if available)
6. Select: firestore_import.json
7. Wait: For import to complete
8. Verify: Data appears in console
```

---

## 📋 **DATA VALIDATION CHECKLIST**

### **Before Uploading Any Format**

```
Challenge Responses (All Formats):
  ☐ Exactly 15 responses (C1-C15)
  ☐ Each response has value 1-6
  ☐ Each response has domain label
  ☐ No missing or blank rows
  ☐ No duplicate challenge IDs
  ☐ Timestamps in ISO 8601 format
  ☐ Email addresses valid (if included)

Multiplier Data (All Formats):
  ☐ Exactly 8 multipliers
  ☐ All 4 core multipliers present
  ☐ All 4 expanded multipliers present
  ☐ Each value between 0.0-1.0
  ☐ Validation status is VALID (or other valid status)
  ☐ No duplicate multiplier names
  ☐ No null or blank values

School Profile (All Formats):
  ☐ School name provided
  ☐ Board specified (CBSE, ICSE, etc.)
  ☐ School size category selected
  ☐ Fee band category selected
  ☐ City tier specified
  ☐ Contact information present
  ☐ Assessment date in ISO 8601 format

File Format:
  ☐ Correct file extension (.csv, .json, .xlsx, .zip)
  ☐ Valid syntax (no encoding issues)
  ☐ Schema matches requirements
  ☐ File size < 10 MB
  ☐ No special characters in numeric fields
  ☐ No line breaks within fields (CSV)
```

---

## 🎯 **CHOOSING THE RIGHT FORMAT**

### **Decision Tree**

```
Are you a technical user?
  ├─ YES → Use JSON or Firestore Import
  │   ├─ API integration? → JSON
  │   └─ Direct database? → Firestore Import
  │
  └─ NO → Use XLSX or CSV
      ├─ Need all data at once? → XLSX (complete package)
      └─ Only multipliers? → CSV (simple)
```

### **Format Comparison**

| Aspect | CSV | JSON | XLSX | ZIP | Firestore |
|--------|-----|------|------|-----|-----------|
| Ease | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Speed | Fast | Medium | Fast | Medium | Fast |
| Complete Data | No (Multipliers) | Yes | Yes | Yes | Yes |
| Validation | Basic | Advanced | Good | Advanced | Advanced |
| File Size | Small | Medium | Small | Medium | Large |
| Non-Technical | Yes | No | Yes | Partially | No |

---

## 📤 **UPLOAD WORKFLOW**

### **Step 1: Prepare Data**
```
Select appropriate format for your data type
Download template from 5_DATA_FORMATS/ folder
Fill with your data
Validate against schema
```

### **Step 2: Validate Data**
```
Check all required fields
Verify numeric ranges
Confirm no duplicates
Ensure proper formatting
Test on sample data first
```

### **Step 3: Upload**
```
Go to app's import/upload feature
Select file to upload
Choose data type (challenges, multipliers, school profile)
Confirm upload
Wait for processing (5-30 seconds)
```

### **Step 4: Verify**
```
Check Firebase console
Verify all records created
Confirm scores calculated
Review report generation
Validate no errors in console
```

---

## 🛠️ **TOOLS FOR DATA PREPARATION**

### **Recommended Tools by Format**

**CSV:**
- Microsoft Excel
- Google Sheets
- LibreOffice Calc
- VS Code (with CSV extension)

**JSON:**
- VS Code
- Sublime Text
- JSON Formatter Online
- Postman (for API testing)

**XLSX:**
- Microsoft Excel
- Google Sheets
- LibreOffice Calc

**ZIP:**
- 7-Zip
- WinRAR
- macOS Archive Utility
- Linux unzip command

**Firestore:**
- Firebase Console (web)
- Firebase CLI
- Google Cloud Console

---

## ✅ **VALIDATION TOOLS**

### **Online Validators**

```
CSV Validator:
  https://csvlint.io/
  
JSON Validator:
  https://jsonlint.com/
  
Schema Validator:
  https://www.jsonschemavalidator.net/

Excel Validator:
  Use built-in data validation features
```

---

## 📝 **SAMPLE FILES PROVIDED**

In `5_DATA_FORMATS/` folder:

```
✅ csv_template_multiplier_data.csv
   → Ready to download and fill
   → 8 rows with headers
   → Pre-formatted columns

✅ json_sample_challenge_responses.json
   → Complete example
   → All 15 challenges
   → Copy and modify

✅ json_sample_multipliers.json
   → All 8 multipliers
   → Properly formatted
   → Ready to use

✅ xlsx_template_first_opinion_data.xlsx
   → 3 sheets (profiles, challenges, multipliers)
   → Data validation rules applied
   → Drop-down lists for categorical data

✅ firestore_import.json
   → Firestore-compatible format
   → Ready for Firebase import
   → Complete data structure
```

---

## 🚀 **QUICK START UPLOAD**

### **Fastest Way to Upload Data**

```
1. Download: csv_template_multiplier_data.csv
2. Open: Excel or Google Sheets
3. Fill: 8 multiplier rows with your values
4. Save: As CSV
5. Upload: Via app's multiplier import
6. Done!

Time: 5 minutes
Complexity: Minimal
Results: 8 multipliers in database
```

---

**Format Guide Version:** 1.0  
**Last Updated:** August 30, 2026  
**Next Update:** When new formats added

Ready to use? → Start with format that best fits your needs!
