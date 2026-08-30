# 📤 DATA UPLOAD INSTRUCTIONS

**Purpose:** Complete guide for uploading First Opinion Engine test data  
**Date:** August 30, 2026  
**Formats:** CSV, JSON, XLSX, ZIP, Firestore

---

## 🚀 **QUICK START - UPLOAD IN 5 MINUTES**

### **Option 1: CSV Upload (Fastest)**

**For: Multiplier data only**

```bash
STEP 1: Download File
  File: csv_template_multiplier_data.csv
  Location: 5_DATA_FORMATS/ folder
  Size: ~1 KB

STEP 2: Open in Excel or Google Sheets
  - Open the CSV file
  - Review the 8 multiplier rows
  - Edit values if needed

STEP 3: Upload via App
  - Go to: https://disha.rylneuroacademy.com/
  - Navigate to: Settings or Data Import
  - Select: "Multiplier Data" upload
  - Choose: csv_template_multiplier_data.csv
  - Click: Upload

STEP 4: Verify
  - Check: Firebase Console
  - Path: schools/[schoolId]/assessmentCycles/[cycleId]/multipliers/
  - Count: 8 multipliers should appear
  - Status: All should be VALID
  
Time: ~5 minutes
Success Rate: 95%+
```

### **Option 2: JSON Upload (Complete)**

**For: Challenge responses + Multipliers**

```bash
STEP 1: Download File
  File: json_sample_challenge_responses.json
         OR json_sample_multipliers.json
  Location: 5_DATA_FORMATS/ folder

STEP 2: Use Text Editor
  - Open: VS Code, Sublime Text, or Notepad++
  - Review: JSON structure
  - Modify: Data as needed

STEP 3: Validate
  - Use: https://jsonlint.com/
  - Paste: JSON content
  - Check: Syntax is valid

STEP 4: Upload via App or API
  Option A: App Upload
    - Go to: Data Import section
    - Select: JSON file
    - Upload: json_sample_challenge_responses.json
  
  Option B: API Upload (Advanced)
    - Endpoint: POST /api/importData
    - Body: JSON data
    - Header: Content-Type: application/json

STEP 5: Verify
  - Firebase: Check collections created
  - App: Run report generation
  - Report: Verify scores calculated
  
Time: ~10 minutes
Success Rate: 90%
```

### **Option 3: XLSX Upload (User-Friendly)**

**For: Non-technical users, group data entry**

```bash
STEP 1: Download File
  File: xlsx_template_first_opinion_data.xlsx
  Location: 5_DATA_FORMATS/ folder
  Size: ~50 KB

STEP 2: Open in Excel/Google Sheets
  - Download file
  - Open in Excel or Google Sheets
  - Review 3 sheets:
    • Sheet 1: School Profile
    • Sheet 2: Challenge Responses
    • Sheet 3: Multiplier Data

STEP 3: Fill Data
  Sheet 1 - School Profile:
    - Enter school name, board, size, location
    - Update contact information
    - Set assessment date
  
  Sheet 2 - Challenge Responses:
    - Rows 1-15 for C1-C15 challenges
    - Column D: Response value (1-6)
    - Column E: Response label (dropdown)
    - Column F: Responder role (dropdown)
  
  Sheet 3 - Multiplier Data:
    - Rows 1-8 for m1-m8 multipliers
    - Column D: Value (0.0-1.0)
    - Column F: Validation status

STEP 4: Data Validation
  - Check: Dropdown menus (constraints applied)
  - Verify: All required fields filled
  - Confirm: No error messages

STEP 5: Export
  - Save: As XLSX (Excel format)
  - Or: Export as CSV (if needed)
  - Note: Keep original file for backup

STEP 6: Upload
  - Option A: Upload XLSX file directly
    - If app supports XLSX
    - Simpler process
  
  - Option B: Export as CSV
    - Convert each sheet to CSV
    - Upload separately

STEP 7: Verify
  - Check: All data imported
  - Confirm: No missing records
  - Validate: Scores calculated
  
Time: ~15 minutes
Success Rate: 98%
Recommended: Yes (most user-friendly)
```

---

## 📋 **FORMAT-SPECIFIC INSTRUCTIONS**

### **CSV FORMAT**

**What:** Comma-Separated Values file for spreadsheet data

**Best For:** Multiplier data (8 records)

**File Size:** ~1-2 KB

**Steps:**

```
1. Open: csv_template_multiplier_data.csv
   └─ 8 rows of multiplier data
   └─ 6 columns: name, value, category, status, source, timestamp

2. Edit: Each row represents one multiplier
   └─ Row 1: STR (0.82)
   └─ Row 2: Parent SLA (0.90)
   └─ ... through Row 8: Co-Curricular (0.88)

3. Modify: Only column 2 (value) if needed
   └─ Keep format: 0.XX (2 decimal places)
   └─ Range: 0.0 to 1.0
   └─ Leave other columns unchanged

4. Save: As CSV
   └─ File → Save As
   └─ Format: CSV (Comma-Separated)
   └─ Name: multipliers_[DATE].csv

5. Upload: Via app
   └─ Settings → Data Import
   └─ Type: Multiplier Data
   └─ File: Select your CSV
   └─ Click: Upload
   └─ Wait: 5-10 seconds

6. Verify: Firebase Console
   └─ Path: schools/[schoolId]/assessmentCycles/[cycleId]/multipliers/
   └─ Count: 8 documents
   └─ Fields: name, value, status all present
```

**Validation Rules:**
```
✅ Exactly 8 rows (one per multiplier)
✅ Multiplier names exactly match:
   STR, Parent SLA, Training Hours, Planning Time,
   Fee Realization, Safety Score, LMS Usage, Co-Curricular
✅ Values between 0.0 and 1.0
✅ Status in: VALID, MISSING, OUTLIER, PENDING
✅ No empty cells in required columns
✅ Timestamps in ISO 8601 format (or leave blank)
```

---

### **JSON FORMAT**

**What:** JavaScript Object Notation for structured data

**Best For:** Complete data packages, API integration

**File Sizes:**
- Challenge responses: ~15-20 KB
- Multiplier data: ~8-12 KB

**Steps:**

```
1. Download: json_sample_challenge_responses.json
             or json_sample_multipliers.json

2. Open: In text editor (VS Code recommended)
   └─ File → Open
   └─ Select JSON file
   └─ View complete structure

3. Validate: Syntax
   └─ If using VS Code: Auto-validated
   └─ Or use: https://jsonlint.com/
   └─ Paste: JSON content
   └─ Check: "Valid JSON" message

4. Modify: Data (optional)
   └─ Keep: Structure intact
   └─ Change: Values only (not keys)
   └─ Example: Change "value": 0.82 → 0.85
   └─ Save changes

5. Upload: Via App or API
   
   METHOD A: Web Upload
   ├─ Go to: App's Import section
   ├─ Select: "JSON Data"
   ├─ Choose: Your JSON file
   ├─ Click: Upload
   └─ Wait: 10-30 seconds
   
   METHOD B: API Call (Advanced)
   ├─ Endpoint: POST /api/firstOpinion/import
   ├─ Headers: Content-Type: application/json
   ├─ Body: Paste JSON content
   ├─ Authentication: Use auth token
   └─ Response: Confirmation message

6. Verify: Database
   └─ Firebase Console
   └─ Collections created:
      • schools/[schoolId]/assessmentCycles/[cycleId]/challengeResponses/ (15 docs)
      • schools/[schoolId]/assessmentCycles/[cycleId]/multipliers/ (8 docs)
   └─ Scores calculated (check scores field)
```

**Validation Rules:**
```
✅ Valid JSON syntax (no parsing errors)
✅ Metadata section present with type and version
✅ Array of responses/multipliers (not individual)
✅ All required fields present
✅ Field types match schema (string, number, etc.)
✅ Enum values match allowed lists
✅ No null or undefined values
✅ Timestamps in ISO 8601 format
```

---

### **XLSX (EXCEL) FORMAT**

**What:** Excel spreadsheet with multiple sheets

**Best For:** User-friendly data entry, group collaboration

**File Size:** ~50-100 KB

**Steps:**

```
1. Download: xlsx_template_first_opinion_data.xlsx

2. Open: Microsoft Excel or Google Sheets
   └─ File → Open
   └─ Select: XLSX template

3. Review: Sheet Structure
   └─ Sheet 1: "School Profile"
      • School name, board, size, location
      • Contact info and assessment date
   └─ Sheet 2: "Challenge Responses"
      • 15 rows (C1-C15 challenges)
      • Columns A-H (ID, name, domain, response, etc.)
   └─ Sheet 3: "Multiplier Data"
      • 8 rows (m1-m8 multipliers)
      • Columns A-H (ID, name, value, status, etc.)

4. Fill Data: Each sheet
   
   SHEET 1: School Profile
   ├─ A1: School Name → Enter: "Sterling International School"
   ├─ A2: Board → Select: CBSE from dropdown
   ├─ A3: School Size → Select: Large (1500+) from dropdown
   ├─ A4: Fee Band → Select: Premium (₹75k+) from dropdown
   ├─ A5: Location → Enter: Mumbai, Maharashtra
   └─ Continue: Fill all rows
   
   SHEET 2: Challenge Responses
   ├─ Row 1: C1, Enrollment Decline, ...
   ├─ Column D: Select response (1-6 dropdown)
   ├─ Column E: Label auto-fills
   ├─ Column F: Responder role (dropdown)
   ├─ Continue: Rows 2-15 (C2-C15)
   └─ Validate: All rows filled
   
   SHEET 3: Multiplier Data
   ├─ Row 1: m1, STR, CORE, 0.82, ...
   ├─ Column D: Value (0.0-1.0 with validation)
   ├─ Column E: Scaled value (auto-calculates)
   ├─ Column F: Status dropdown (VALID, MISSING, etc.)
   ├─ Continue: Rows 2-8 (m2-m8)
   └─ Validate: All 8 multipliers present

5. Validate: Data Types
   └─ Numbers: Column D (response value or multiplier value)
   └─ Dropdowns: Columns B, C, E, F (selections only)
   └─ Text: Name, email, source columns
   └─ No blanks in required columns

6. Save: File
   └─ File → Save
   └─ Format: Excel (.xlsx)
   └─ Name: first_opinion_data_[DATE].xlsx
   └─ Location: Save to desktop or documents

7. Export: If needed as CSV
   └─ File → Save As
   └─ Format: CSV (.csv)
   └─ Process: Repeats for each sheet separately
   └─ Note: Creates 3 separate CSV files

8. Upload: Via App
   
   OPTION A: Upload XLSX directly
   ├─ Settings → Data Import
   ├─ File Type: Excel / XLSX
   ├─ Select: first_opinion_data_[DATE].xlsx
   ├─ Click: Upload
   └─ App processes all 3 sheets
   
   OPTION B: Upload as CSV
   ├─ Export each sheet as CSV separately
   ├─ Upload each CSV individually
   ├─ Schools first, then challenges, then multipliers
   └─ Follow CSV upload process above

9. Verify: Database
   └─ Firebase Console
   └─ Check: All three data types imported
   └─ Schools: 1 record
   └─ Challenges: 15 records
   └─ Multipliers: 8 records
```

**Excel Validation Features:**
```
Data Validation Applied:
✅ Column B (Board): CBSE, ICSE, IB, Other
✅ Column C (School Size): Large, Medium, Small, etc.
✅ Column D (Fee Band): Premium, Medium, Budget
✅ Response columns (D in Sheet 2): 1-6 only
✅ Response labels (E in Sheet 2): Auto-populate
✅ Multiplier values (D in Sheet 3): 0.0-1.0 range
✅ Status (F in Sheet 3): VALID, MISSING, OUTLIER

Can't Edit Without Breaking:
❌ Don't change column headers
❌ Don't add/remove rows beyond required
❌ Don't modify formula cells
❌ Don't change data types
✅ Safe to: Fill empty cells, modify values only
```

---

### **ZIP BUNDLE**

**What:** Compressed package with all data files

**Best For:** Complete backup, distribution, transfer

**File Size:** ~30-50 KB

**Steps:**

```
1. Download: test_data_scenario_1.zip

2. Extract: Files
   └─ Windows: Right-click → Extract All
   └─ Mac: Double-click (auto-extracts)
   └─ Linux: unzip test_data_scenario_1.zip

3. Review: Contents
   ├─ school_profile.json (school information)
   ├─ challenge_responses.json (15 challenges)
   ├─ multiplier_data.json (8 multipliers)
   ├─ metadata.json (scenario info)
   └─ README.txt (instructions)

4. Read: README.txt
   └─ Contains: Import order and tips
   └─ Estimated time: 5 minutes
   └─ Prerequisites: None

5. Upload: Each file
   
   STEP 1: School Profile
   ├─ File: school_profile.json
   ├─ Type: School Profile Data
   ├─ Upload: Via app
   ├─ Wait: 5 seconds
   
   STEP 2: Challenge Responses
   ├─ File: challenge_responses.json
   ├─ Type: Challenge Responses
   ├─ Upload: Via app
   ├─ Wait: 10 seconds (15 records)
   
   STEP 3: Multiplier Data
   ├─ File: multiplier_data.json
   ├─ Type: Multiplier Data
   ├─ Upload: Via app
   ├─ Wait: 5 seconds (8 records)
   
   STEP 4: Verify
   ├─ Firebase: Check collections
   ├─ App: Generate report
   ├─ Results: Verify scores

6. Verify: Complete Import
   └─ Firebase Console
   └─ Path: schools/[schoolId]/assessmentCycles/[cycleId]/
   └─ Check: 3 subcollections
      • challengeResponses (15 documents)
      • multipliers (8 documents)
      • scores (calculated values)
```

---

## ✅ **UPLOAD VERIFICATION CHECKLIST**

### **After Any Upload**

```
Step 1: UI Verification
  ☐ Upload completed without errors
  ☐ Success message displayed
  ☐ No error notifications
  ☐ Page remains responsive

Step 2: Firebase Verification
  ☐ New documents appear in Firestore
  ☐ All required fields present
  ☐ Data types correct (string, number, etc.)
  ☐ Values within expected ranges
  ☐ Timestamps recorded

Step 3: Data Count Verification
  Challenge Responses:
    ☐ Exactly 15 documents (C1-C15)
  Multipliers:
    ☐ Exactly 8 documents (m1-m8)
  School Profile:
    ☐ 1 document with all fields

Step 4: Calculation Verification
  ☐ S_sub calculated (if responses uploaded)
  ☐ M_obj calculated (if multipliers uploaded)
  ☐ Health Index computed
  ☐ Scores within 0-100 range

Step 5: No Errors in Console
  ☐ F12 → Console tab
  ☐ NO red error messages
  ☐ NO "undefined" references
  ☐ NO "14D" or unwanted logs
  ☐ Clean upload logs only
```

---

## 🆘 **TROUBLESHOOTING**

### **Issue: "File Upload Failed"**

```
Possible Causes:
  ❌ File size too large (>10MB)
  ❌ Invalid file format
  ❌ Corrupted file
  ❌ Network timeout
  ❌ Insufficient permissions

Solutions:
  1. Check file size (right-click → Properties)
  2. Verify file format (.csv, .json, .xlsx)
  3. Try uploading smaller subset first
  4. Check browser console for error details
  5. Try different browser or clear cache
  6. Contact admin if permission error
```

### **Issue: "Invalid Data Format"**

```
Possible Causes:
  ❌ JSON syntax error
  ❌ CSV delimiter mismatch
  ❌ Required fields missing
  ❌ Field values out of range
  ❌ Data types don't match schema

Solutions:
  1. Validate JSON: https://jsonlint.com/
  2. Validate CSV: https://csvlint.io/
  3. Check schema requirements above
  4. Verify all required fields filled
  5. Check number ranges (0.0-1.0, 1-6, etc.)
  6. Look for hidden characters or extra spaces
  7. Try sample file first (known good data)
```

### **Issue: "Data Not Appearing in Firebase"**

```
Possible Causes:
  ❌ Upload completed but data not saved
  ❌ Permission issues
  ❌ Database connection problem
  ❌ Data validation failed silently
  ❌ Wrong collection path

Solutions:
  1. Refresh Firebase Console (F5)
  2. Check if documents exist (look harder)
  3. Check browser console for error messages
  4. Verify Firebase database connection
  5. Try uploading different data
  6. Check user permissions in Firebase
  7. Test with admin account
```

### **Issue: "Scores Not Calculating"**

```
Possible Causes:
  ❌ Not all 15 challenges uploaded
  ❌ Not all 8 multipliers uploaded
  ❌ Invalid field values
  ❌ Calculation engine error
  ❌ Missing multiplier data

Solutions:
  1. Verify 15 challenge responses present
  2. Verify 8 multipliers present
  3. Check values are numbers (not text)
  4. Check ranges (0-100, 0.0-1.0, etc.)
  5. Wait 30 seconds for auto-calculation
  6. Manually trigger recalculateScores() if available
  7. Check console for calculation errors
```

---

## 📊 **QUICK REFERENCE TABLE**

| Scenario | Format | Time | Difficulty | Best For |
|----------|--------|------|-----------|----------|
| **Multipliers Only** | CSV | 5 min | ⭐ Easy | Quick test |
| **Complete Workflow** | JSON | 10 min | ⭐⭐ Medium | API testing |
| **User Entry** | XLSX | 15 min | ⭐ Easy | Group work |
| **Complete Backup** | ZIP | 15 min | ⭐⭐ Medium | Transfer |
| **Direct Database** | Firestore | 10 min | ⭐⭐⭐ Hard | Advanced |

---

## 🎯 **RECOMMENDED FLOW**

```
FIRST TIME:
  1. Download: xlsx_template_first_opinion_data.xlsx
  2. Open: Excel or Google Sheets
  3. Fill: School profile + challenges + multipliers
  4. Upload: XLSX file
  5. Verify: Firebase Console
  ✅ Result: Complete data set in database

SUBSEQUENT TIMES:
  1. Use: CSV for just multiplier updates
  2. Or: JSON for batch imports
  3. Or: XLSX for full re-entry
  ✅ Result: Fresh data for next test cycle
```

---

**Upload Guide Version:** 1.0  
**Last Updated:** August 30, 2026

Ready to upload? Choose your format and follow the steps! 🚀
