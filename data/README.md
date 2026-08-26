# Data Files Hub

**Organized CSV data files for DISHA Diagnostic Engine**

---

## 📁 Data Folder Structure

```
data/
├── test-scenarios/           (4 CSV files)
│   ├── test_data_scenario1_enrollment.csv
│   ├── test_data_scenario2_staff.csv
│   ├── test_data_scenario3_excellent.csv
│   └── test_data_scenario4_mixed.csv
│
├── test-enrollment/          (1 CSV file)
│   └── test_enrollment_decline.csv
│
├── reference-data/           (5 CSV files)
│   ├── disha_challenge_catalog.csv
│   ├── disha_objective_metrics_rules.csv
│   ├── disha_screening_questions.csv
│   ├── disha_engine_calculations.csv
│   └── disha_first_opinion_dashboard.csv
│
├── sample-data/              (1 CSV file)
│   └── DISHA_Sample_Data.csv
│
└── README.md                 ← You are here
```

---

## 📊 Data Categories

### 🧪 Test Scenarios (`/test-scenarios/`)
**Complete test data sets for different school assessment scenarios**

- **test_data_scenario1_enrollment.csv**
  - Purpose: Test enrollment data processing
  - Use Case: Verify new school enrollment workflows
  - Rows: Complete enrollment records
  
- **test_data_scenario2_staff.csv**
  - Purpose: Test staff assessment scenarios
  - Use Case: Verify teacher/staff response data
  - Rows: Staff member responses and feedback
  
- **test_data_scenario3_excellent.csv**
  - Purpose: Test excellent school performance
  - Use Case: Verify metrics for high-performing schools
  - Rows: Strong response data across dimensions
  
- **test_data_scenario4_mixed.csv**
  - Purpose: Test mixed/moderate performance
  - Use Case: Verify typical school assessment data
  - Rows: Varied responses with realistic distributions

**Usage:** Load these files to test complete workflows with realistic data scenarios.

---

### 📝 Test Enrollment (`/test-enrollment/`)
**Enrollment-specific test data**

- **test_enrollment_decline.csv**
  - Purpose: Test enrollment decline scenarios
  - Use Case: Verify declining enrollment detection and analytics
  - Rows: Enrollment records showing decline pattern
  - Metrics: Historical enrollment trends

**Usage:** Test enrollment tracking, trend analysis, and decline detection algorithms.

---

### 📚 Reference Data (`/reference-data/`)
**Master data files for calculations, rules, and configurations**

- **disha_challenge_catalog.csv**
  - Purpose: Master catalog of all challenges
  - Content: Challenge IDs, names, domains, weights
  - Use: Reference for all challenge-related operations

- **disha_objective_metrics_rules.csv**
  - Purpose: Rules and thresholds for objective metrics
  - Content: Metric definitions, calculation rules, thresholds
  - Use: Configuration for objective score calculations

- **disha_screening_questions.csv**
  - Purpose: Master list of screening questions
  - Content: Question IDs, text, response options, scoring
  - Use: Question mapping and validation

- **disha_engine_calculations.csv**
  - Purpose: Calculation reference and formulas
  - Content: Calculation definitions, weights, multipliers
  - Use: Verification of calculation logic

- **disha_first_opinion_dashboard.csv**
  - Purpose: Dashboard configuration data
  - Content: Widget definitions, data mappings, display settings
  - Use: Dashboard layout and visualization configuration

**Usage:** Use for validation, configuration, and as reference data for testing.

---

### 🎯 Sample Data (`/sample-data/`)
**Complete sample assessment data**

- **DISHA_Sample_Data.csv**
  - Purpose: Comprehensive sample dataset
  - Content: Full assessment data with responses
  - Use: Demo, testing, and reference

**Usage:** Load for demonstrations or as baseline comparison data.

---

## 🔄 Data File Categories

| Category | Files | Purpose | Use Case |
|----------|-------|---------|----------|
| **Test Scenarios** | 4 | Complete test datasets | Testing workflows |
| **Test Enrollment** | 1 | Enrollment-specific data | Testing enrollment features |
| **Reference Data** | 5 | Master data & config | Configuration & validation |
| **Sample Data** | 1 | Complete sample set | Demo & comparison |

---

## 💾 CSV File Format Overview

### Test Data Files (Scenarios & Enrollment)
```
Typical Columns:
- ID / Identifier
- Assessment / Challenge data
- Response / Answer data
- Timestamp / Date
- Stakeholder type (teacher/parent/student)
- Ratings / Scores
- Comments (if applicable)
```

### Reference Data Files
```
Typical Columns:
- ID / Code
- Name / Description
- Category / Domain
- Configuration values
- Weights / Multipliers
- Thresholds / Rules
- Status / Notes
```

---

## 🚀 How to Use

### For Testing Workflows
1. Navigate to `/data/test-scenarios/`
2. Load scenario CSV into your test environment
3. Run workflow tests using the data
4. Verify results

### For Validation
1. Use `/data/reference-data/` files
2. Compare test outputs against reference data
3. Verify calculations and mappings
4. Ensure data consistency

### For Demonstrations
1. Use `/data/sample-data/DISHA_Sample_Data.csv`
2. Load into dashboard
3. Show analytics and reporting
4. Display to stakeholders

### For Development
1. Reference `/data/reference-data/` for configuration
2. Use test scenarios for integration testing
3. Load sample data for feature development
4. Validate against reference calculations

---

## 📋 Data File Specifications

### Row Counts (Approximate)
| File | Rows | Description |
|------|------|-------------|
| test_data_scenario1_enrollment.csv | Variable | Enrollment records |
| test_data_scenario2_staff.csv | Variable | Staff responses |
| test_data_scenario3_excellent.csv | Variable | High performance data |
| test_data_scenario4_mixed.csv | Variable | Mixed performance data |
| test_enrollment_decline.csv | Variable | Decline pattern data |
| DISHA_Sample_Data.csv | Variable | Complete sample set |
| disha_challenge_catalog.csv | 15+ | All challenges |
| disha_objective_metrics_rules.csv | 8+ | Metric rules |
| disha_screening_questions.csv | 15+ | Screening questions |
| disha_engine_calculations.csv | Variable | Calculation reference |
| disha_first_opinion_dashboard.csv | Variable | Dashboard config |

---

## ✅ Quality Assurance

### Data Validation Checklist
- [ ] All CSV files are well-formed (no syntax errors)
- [ ] Headers are present and descriptive
- [ ] Data types are consistent within columns
- [ ] No missing required fields
- [ ] Date formats are consistent
- [ ] Numerical values are within expected ranges
- [ ] Text fields don't contain line breaks
- [ ] File encoding is UTF-8

### Testing with Data Files
- [ ] Load all files without errors
- [ ] Parse all rows successfully
- [ ] Calculate expected metrics from data
- [ ] Verify results match reference values
- [ ] Test with different scenarios
- [ ] Validate edge cases

---

## 📍 Integration Points

### Where Test Data is Used
- **Testing Framework** → `/docs/testing/` uses test data
- **Sample Data** → For demos and presentations
- **Reference Data** → For validation and configuration
- **Calculations** → Verify engine calculations
- **Reports** → Generate sample reports

---

## 🔍 File Descriptions in Detail

### Test Scenarios (Individual Use Cases)

**Scenario 1 - Enrollment:**
- Fresh school enrollment
- Multiple teachers/staff members
- Initial assessment baseline
- Used for: New school setup verification

**Scenario 2 - Staff:**
- Established school with staff feedback
- Multiple stakeholder responses
- Realistic response distributions
- Used for: Multi-respondent testing

**Scenario 3 - Excellent:**
- High-performing school metrics
- Strong responses across dimensions
- Excellent status indicators
- Used for: High-performance scenario validation

**Scenario 4 - Mixed:**
- Typical school performance
- Varied responses (some good, some poor)
- Mixed dimension scores
- Used for: Realistic performance testing

**Enrollment Decline:**
- Historical enrollment trends
- Month-over-month decline patterns
- Performance correlation analysis
- Used for: Decline detection testing

---

## 🎯 Quick Reference

### Find Data For...
- **New workflow testing** → `/test-scenarios/scenario1_enrollment.csv`
- **Staff response validation** → `/test-scenarios/scenario2_staff.csv`
- **Performance benchmarking** → `/test-scenarios/scenario3_excellent.csv`
- **Realistic testing** → `/test-scenarios/scenario4_mixed.csv`
- **Enrollment tracking** → `/test-enrollment/test_enrollment_decline.csv`
- **Challenge definitions** → `/reference-data/disha_challenge_catalog.csv`
- **Calculation verification** → `/reference-data/disha_engine_calculations.csv`
- **Demo/presentation** → `/sample-data/DISHA_Sample_Data.csv`

---

## 📚 Related Documentation

- `/docs/testing/` - Testing framework using this data
- `/docs/user-guides/` - How to use data in workflows
- `/docs/reference-data/` - Data specifications
- `/docs/deployment/` - Data deployment procedures

---

## 🔒 Data Confidentiality

**Note:** Test data files contain sample/simulated data for testing purposes only. Do not use actual student or school data without proper authorization and encryption.

---

## ✨ Organization Benefits

✅ **Organized by Purpose** - Easy to find what you need
✅ **Categorized** - Clear separation of concerns
✅ **Documented** - Each folder has clear purpose
✅ **Searchable** - Quick reference guide
✅ **Scalable** - Easy to add new test data
✅ **Professional** - Enterprise data structure

---

**Last Updated:** August 26, 2026  
**Total Files:** 11 CSV files  
**Total Categories:** 4 folders  
**Status:** ✅ Organized & Ready

For the main repository structure, see `/docs/README.md`
