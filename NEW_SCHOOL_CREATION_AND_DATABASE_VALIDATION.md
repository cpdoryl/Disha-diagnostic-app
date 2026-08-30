# 🏢 NEW SCHOOL CREATION & DATABASE VALIDATION GUIDE

**Purpose:** Create new school and verify database storage  
**Domain:** https://disha.rylneuroacademy.com/  
**Date:** August 30, 2026  
**Type:** Step-by-Step Testing Guide with Database Validation

---

## 📍 **CURRENT STATUS**

```
✅ Logged in to dashboard
✅ Active School: Podar International School, Raipur
✅ Ready to create new school
```

---

## 🎯 **TESTING OBJECTIVES**

```
✅ Objective 1: Find "Create New School" option
✅ Objective 2: Create new school with test data
✅ Objective 3: Verify school created in database
✅ Objective 4: Confirm all data saved correctly
✅ Objective 5: Validate database fields and values
✅ Objective 6: Test in both UI and database
```

---

## 🔍 **STEP 1: FIND "CREATE NEW SCHOOL" OPTION**

### **Location 1: School Profile Dropdown**

```
LOCATION: Top of left sidebar
CURRENT: Shows "Podar International S..."
         "RAIPUR • CBSE"

ACTION:
  1. Look for dropdown arrow (▼) next to school name
  2. Click the dropdown to expand
  3. Look for options:
     • "Add New School"
     • "Create School"
     • "New School"
     • "Switch School"
     • "Manage Schools"

EXPECTED:
  ✅ Dropdown menu appears
  ✅ Shows existing school
  ✅ Shows option to add/create new
```

### **Location 2: Sidebar Menu**

```
LOCATION: Left navigation menu
LOOK FOR: 
  • "Add School" link
  • "New School" link
  • "School Management"
  • "Settings" → School section

EXPECTED:
  ✅ Link or menu item visible
  ✅ Clickable element
  ✅ Takes to school creation form
```

### **Location 3: Edit Button or Nearby**

```
CURRENT: "Edit" button visible next to school name
LOOK FOR:
  • "+" button near Edit
  • "Add" button near Edit
  • "New School" button near Edit
  • Icon to add school

EXPECTED:
  ✅ Button or link visible
  ✅ Allows creating new school
```

---

## 📋 **STEP 2: CLICK TO CREATE NEW SCHOOL**

### **Finding the Create Button**

```
FIRST: Look at school dropdown or menu
THEN: Find "Add School" or "Create New School" option
CLICK: The button/link to create new school

EXPECTED RESULT:
  ✅ New page loads
  ✅ Form appears with fields
  ✅ School creation form visible
```

### **Expected Form Fields**

```
TYPICAL FIELDS YOU'LL SEE:

1. School Name (Required)
   Example: "Test School Alpha"
   
2. School Code (Optional)
   Example: "TSA-2026"
   
3. Location / City (Required)
   Example: "Bangalore"
   
4. State (Required)
   Example: "Karnataka"
   
5. Board / Curriculum (Required)
   Example: "CBSE" or "ICSE"
   
6. School Type (Optional)
   Example: "Private" or "Public"
   
7. Principal Name (Optional)
   Example: "Dr. John Smith"
   
8. Email (Required)
   Example: "admin@testschool.com"
   
9. Phone (Required)
   Example: "+91-98920-73660"
   
10. Address (Optional)
    Example: "123 Main Street"

BUTTONS:
  • Save / Create button (Blue)
  • Cancel button
```

---

## ✏️ **STEP 3: FILL SCHOOL CREATION FORM**

### **Test Data to Enter**

```
FIELD 1: School Name
  VALUE: "Test School Alpha"
  ACTION: Click field, type name
  VALIDATION: Accept text input
  
FIELD 2: School Code (if exists)
  VALUE: "TSA-2026-08"
  ACTION: Click field, type code
  
FIELD 3: Location/City
  VALUE: "Bangalore"
  ACTION: Click field, type city
  
FIELD 4: State
  VALUE: "Karnataka"
  ACTION: Click dropdown or type
  
FIELD 5: Board
  VALUE: "CBSE"
  ACTION: Click dropdown, select CBSE
  
FIELD 6: School Type (if exists)
  VALUE: "Private"
  ACTION: Click dropdown, select type
  
FIELD 7: Principal Name
  VALUE: "Mr. Testing Principal"
  ACTION: Click field, type name
  
FIELD 8: Email
  VALUE: "testadmin@testschool.com"
  ACTION: Click field, enter email
  VALIDATION: Valid email format required
  
FIELD 9: Phone
  VALUE: "+91-98920-73661"
  ACTION: Click field, enter phone
  VALIDATION: Valid phone format required
  
FIELD 10: Address (if exists)
  VALUE: "123 Testing Street, Bangalore"
  ACTION: Click field, type address

NOTES:
  • Fill all REQUIRED fields (marked with *)
  • Optional fields can be skipped
  • Use realistic test data
  • Keep data consistent
```

### **Step-by-Step Form Filling**

```
STEP 1: School Name
  ☐ Click "School Name" field
  ☐ Clear any existing text
  ☐ Type: "Test School Alpha"
  ☐ Verify text appears correctly

STEP 2: Location
  ☐ Click "Location/City" field
  ☐ Type: "Bangalore"
  ☐ Verify text appears

STEP 3: State
  ☐ Click "State" dropdown/field
  ☐ Select: "Karnataka"
  ☐ Verify selection shows

STEP 4: Board
  ☐ Click "Board" dropdown
  ☐ Select: "CBSE"
  ☐ Verify CBSE is selected

STEP 5: Email
  ☐ Click "Email" field
  ☐ Type: "testadmin@testschool.com"
  ☐ Verify email format accepted

STEP 6: Phone
  ☐ Click "Phone" field
  ☐ Type: "+91-98920-73661"
  ☐ Verify phone format accepted

STEP 7: Other Fields
  ☐ Fill any remaining required fields
  ☐ Verify all data entered correctly
  ☐ Check for validation errors

STEP 8: Review
  ☐ Look at all entered data
  ☐ Verify accuracy
  ☐ Check no fields are empty (if required)
```

---

## 💾 **STEP 4: SUBMIT/SAVE NEW SCHOOL**

### **Click Save Button**

```
ACTION: Click "Save" or "Create School" button
LOCATION: Bottom of form
COLOR: Blue (usually)
WAIT: 2-3 seconds for processing

EXPECTED RESULT:
  ✅ Form submits successfully
  ✅ Success message appears
  ✅ Redirects to dashboard
  ✅ New school becomes active
```

### **Expected Success Indicators**

```
✅ Success message appears
   Example: "School created successfully"
   Or: "New school added"
   
✅ School appears in dropdown
   Example: "Test School Alpha" now selectable
   
✅ Dashboard updates
   Example: New school name shown in header
   
✅ Confirmation visible
   School name changed from "Podar International"
   to "Test School Alpha"
```

---

## 🔐 **STEP 5: DATABASE VALIDATION - VERIFY DATA SAVED**

### **Where to Check Database**

```
FIREBASE CONSOLE ACCESS:
  URL: https://console.firebase.google.com/
  
NAVIGATION:
  1. Select your project (DISHA)
  2. Go to: Firestore Database
  3. Look for: "schools" collection
  4. Find: Your new school document
```

### **Expected Database Structure**

```
COLLECTION: "schools"
DOCUMENT: "school_[ID]" or "Test School Alpha"

EXPECTED FIELDS:

✅ schoolName: "Test School Alpha"
✅ schoolCode: "TSA-2026-08"
✅ location: "Bangalore"
✅ state: "Karnataka"
✅ board: "CBSE"
✅ schoolType: "Private"
✅ principalName: "Mr. Testing Principal"
✅ email: "testadmin@testschool.com"
✅ phone: "+91-98920-73661"
✅ address: "123 Testing Street, Bangalore"
✅ createdAt: [Timestamp]
✅ createdBy: [Admin ID]
✅ status: "ACTIVE"
✅ schoolId: [Generated ID]
```

---

## ✅ **STEP 6: DETAILED DATABASE VALIDATION CHECKLIST**

### **Document Existence**

```
☐ School document exists in Firestore
☐ Document ID is generated correctly
☐ Document path shows "schools/[schoolId]"
☐ Document is not empty
☐ Document is readable (no access issues)
```

### **Field Validation**

```
BASIC FIELDS:
☐ schoolName field exists
  └─ Value: "Test School Alpha"
  └─ Type: String
  └─ Length: < 100 characters
  
☐ schoolCode field exists
  └─ Value: "TSA-2026-08"
  └─ Type: String
  └─ Format correct

☐ location field exists
  └─ Value: "Bangalore"
  └─ Type: String
  └─ Not empty

☐ state field exists
  └─ Value: "Karnataka"
  └─ Type: String
  └─ Valid state name

CONTACT FIELDS:
☐ email field exists
  └─ Value: "testadmin@testschool.com"
  └─ Type: String
  └─ Valid email format (contains @)
  
☐ phone field exists
  └─ Value: "+91-98920-73661"
  └─ Type: String
  └─ Valid phone format

METADATA FIELDS:
☐ createdAt timestamp exists
  └─ Type: Timestamp
  └─ Value: Recent (today's date)
  └─ Format: ISO 8601 or Firebase timestamp

☐ status field exists
  └─ Value: "ACTIVE" or similar
  └─ Type: String

☐ schoolId field exists
  └─ Type: String
  └─ Value: Unique identifier
  └─ Format: Valid ID format
```

### **Data Integrity Checks**

```
☐ No null values in required fields
☐ No undefined values
☐ All required fields present (not missing)
☐ Email format is valid (contains @, domain)
☐ Phone format is valid (starts with +91 or country code)
☐ No trailing/leading spaces in text fields
☐ Timestamps are valid and recent
☐ No duplicate schoolId exists
```

### **Cross-Reference Validation**

```
☐ School name matches across UI and database
☐ School code matches database record
☐ Location/state consistent
☐ Board matches database
☐ Contact info identical in both places
☐ Creation timestamp matches UI
```

---

## 📊 **STEP 7: UI VERIFICATION**

### **Dashboard Should Show**

```
AFTER CREATING NEW SCHOOL:

✅ School Profile Section Updated
   Old: "Podar International S..."
   New: "Test School Alpha"
   
✅ Location Shows
   "Bangalore" (or city entered)
   
✅ Board Shows
   "CBSE"
   
✅ School dropdown includes new school
   Can switch between schools
   
✅ All metrics reset for new school
   OR
   Shows blank/no data yet
   
✅ Navigation menu updates
   Shows new school context
```

### **Data Consistency**

```
☐ UI shows same data as database
☐ School name matches exactly
☐ Location matches exactly
☐ Board selection matches
☐ All displayed data verified in Firestore
```

---

## 🔄 **STEP 8: END-TO-END VALIDATION WORKFLOW**

### **Complete Testing Sequence**

```
PHASE 1: CREATION
  1. ☐ Find "Create New School" option
  2. ☐ Click to open form
  3. ☐ Fill all required fields
  4. ☐ Review data entered
  5. ☐ Click Save/Create button
  6. ☐ See success message
  
PHASE 2: UI VERIFICATION
  7. ☐ New school appears in dropdown
  8. ☐ Dashboard updates with new school
  9. ☐ School name shows correctly
  10. ☐ All UI elements update
  
PHASE 3: DATABASE VERIFICATION
  11. ☐ Open Firebase Firestore
  12. ☐ Navigate to "schools" collection
  13. ☐ Find new school document
  14. ☐ Verify all fields exist
  15. ☐ Verify all data matches
  
PHASE 4: DATA INTEGRITY
  16. ☐ Check field types correct
  17. ☐ Verify no null values
  18. ☐ Confirm timestamps
  19. ☐ Validate email format
  20. ☐ Validate phone format
  
PHASE 5: CROSS-VALIDATION
  21. ☐ UI data = Database data
  22. ☐ No discrepancies
  23. ☐ All systems in sync
  24. ☐ Ready for assessments
```

---

## 📋 **OBSERVATION CHECKLIST**

### **Record Your Findings**

```
CREATION PHASE:
  ☐ Found "Create New School" at: ________________
  ☐ Form fields visible: ________________
  ☐ Form submission success: Yes / No
  ☐ Success message: ________________
  
UI VERIFICATION:
  ☐ School appears in dropdown: Yes / No
  ☐ Dashboard updated: Yes / No
  ☐ School name shows as: ________________
  ☐ Location shows as: ________________
  
DATABASE VERIFICATION:
  ☐ Document created in Firestore: Yes / No
  ☐ Collection path: ________________
  ☐ Document ID: ________________
  ☐ All required fields present: Yes / No
  
DATA VALUES:
  ☐ School Name: ________________
  ☐ Location: ________________
  ☐ Board: ________________
  ☐ Email: ________________
  ☐ Phone: ________________
  ☐ Created Timestamp: ________________
  
VALIDATION RESULT:
  ☐ All data matches UI and DB: Yes / No
  ☐ No missing fields: Yes / No
  ☐ No null/undefined values: Yes / No
  ☐ Email format valid: Yes / No
  ☐ Phone format valid: Yes / No
  
OVERALL STATUS:
  ☐ ✅ PASS - School created successfully
  ☐ ⚠️ PARTIAL - Some issues found
  ☐ ❌ FAIL - Critical issues found
  
Issues Found:
  _________________________________
  _________________________________
  _________________________________
```

---

## 🎯 **NEXT STEPS AFTER VALIDATION**

### **If Validation PASSES ✅**

```
PROCEED TO:
  1. Create assessment for new school
  2. Add respondents
  3. Submit responses
  4. Verify data storage
  5. Generate reports
```

### **If Issues Found ❌**

```
INVESTIGATE:
  1. Screenshot error messages
  2. Check Firestore for incomplete data
  3. Verify all form validations
  4. Test with different data
  5. Report issues
```

---

## 📸 **SCREENSHOTS TO CAPTURE**

```
1. School creation form (before filling)
2. School creation form (after filling)
3. Success message after creation
4. Dashboard with new school active
5. School dropdown showing new school
6. Firebase Firestore document view
7. All database fields visible
```

---

## ✅ **VALIDATION COMPLETE WHEN**

```
✅ New school created in UI
✅ New school appears in dropdown
✅ Dashboard updated with new school
✅ Firestore document exists
✅ All required fields present in database
✅ All data values correct and matching
✅ No null or undefined values
✅ Email and phone formats valid
✅ Timestamps recorded correctly
✅ School ready for assessment creation
```

---

## 🚀 **YOUR ACTION ITEMS**

```
IMMEDIATE:
  1. ☐ Go to dashboard
  2. ☐ Look for "Add School" or create option
  3. ☐ Click to open form
  4. ☐ Fill form with test data:
     • Name: "Test School Alpha"
     • Location: "Bangalore"
     • Board: "CBSE"
     • Email: "testadmin@testschool.com"
     • Phone: "+91-98920-73661"
  5. ☐ Click Save

AFTER CREATION:
  6. ☐ Take screenshot of dashboard
  7. ☐ Note new school name
  8. ☐ Open Firebase Firestore
  9. ☐ Navigate to schools collection
  10. ☐ Find new school document
  11. ☐ Take screenshot of database fields
  12. ☐ Verify all data matches
  
REPORT BACK:
  13. ☐ Screenshot of form
  14. ☐ Screenshot of dashboard
  15. ☐ Screenshot of Firestore document
  16. ☐ Confirmation all data saved correctly
```

---

**Guide Created:** August 30, 2026  
**Purpose:** Step-by-step new school creation with database validation  
**Status:** 🟢 Ready for testing  
**Next Action:** Find and click "Create New School" option

