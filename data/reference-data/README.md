# Reference Data

**Master data and configuration files for system calculations and validations**

---

## 📋 Overview

This folder contains reference data files that define the system's core data structures, calculation rules, and configuration settings. These files serve as the authoritative source for data validation and system behavior.

---

## 📊 Reference Files

### 1. disha_challenge_catalog.csv
**Master catalog of all assessment challenges**

**Purpose:** Define all challenges in the system

**Content:**
- Challenge ID (C1-C15)
- Challenge name
- Challenge domain
- Domain category
- Default weight
- Description
- Question bank reference

**Usage:**
- Challenge validation
- Weight assignment
- Domain mapping
- Question selection
- Report generation

**Key Information:**
- 15 total challenges
- 5 domains
- Weighted scoring
- Cross-domain relationships

---

### 2. disha_objective_metrics_rules.csv
**Rules and thresholds for objective metrics**

**Purpose:** Define calculation rules for objective scores

**Content:**
- Metric ID
- Metric name
- Calculation formula
- Data sources
- Threshold levels
- Alert conditions
- Target ranges

**Usage:**
- Objective score calculation (M_obj)
- Threshold verification
- Rule validation
- Alert triggering
- Performance benchmarking

**Key Information:**
- 8 primary multipliers
- Control levers for each
- Threshold definitions
- Alert rules

---

### 3. disha_screening_questions.csv
**Master list of screening/questionnaire questions**

**Purpose:** Define all questions in the survey

**Content:**
- Question ID
- Question text
- Challenge mapping
- Domain mapping
- Response scale
- Scoring logic
- Required/optional
- Comments

**Usage:**
- Question validation
- Survey generation
- Response scoring
- Data validation
- Report cross-reference

**Key Information:**
- 90+ perception questions
- Multi-scale responses
- Challenge alignment
- Scoring mappings

---

### 4. disha_engine_calculations.csv
**Calculation formulas and references**

**Purpose:** Define and verify calculation logic

**Content:**
- Calculation ID
- Calculation name
- Formula definition
- Input parameters
- Output definition
- Examples
- Validation rules

**Usage:**
- Calculation verification
- Formula reference
- Edge case testing
- Debugging calculations
- Performance validation

**Key Calculations:**
- S_sub (Subjective Score)
- M_obj (Objective Score)
- Health Index
- Gap calculation
- Quadrant assignment

---

### 5. disha_first_opinion_dashboard.csv
**Dashboard configuration and widget definitions**

**Purpose:** Configure dashboard display and widgets

**Content:**
- Widget ID
- Widget type
- Data source
- Display settings
- Refresh rate
- Alert settings
- User permissions

**Usage:**
- Dashboard configuration
- Widget rendering
- Data mapping
- Display verification
- Performance optimization

**Key Widgets:**
- Summary cards
- Trend charts
- Performance gauges
- Comparison tables
- Alert panels

---

## 🎯 Data Relationships

```
Challenge Catalog
    ↓
Screening Questions
    ↓
Response Data
    ↓
Calculations (Engine)
    ↓
Objective Metrics (Rules)
    ↓
Dashboard (Display)
```

---

## ✅ How to Use Reference Data

### For Validation
```
1. Load reference CSV
2. Get expected value/rule
3. Compare against calculation
4. Verify correctness
```

### For Configuration
```
1. Read reference file
2. Apply settings to system
3. Configure widgets/rules
4. Verify against reference
```

### For Testing
```
1. Use reference values
2. Create test case
3. Run against system
4. Verify results match reference
```

---

## 📋 Reference Data Verification

### Challenge Catalog Checks
- [ ] 15 challenges defined
- [ ] 5 domains represented
- [ ] Weights sum correctly
- [ ] IDs are unique
- [ ] No duplicate names

### Questions Checks
- [ ] 90+ questions present
- [ ] All challenges referenced
- [ ] Response scales defined
- [ ] Scoring logic clear
- [ ] No orphaned questions

### Rules Checks
- [ ] All thresholds defined
- [ ] Formulas are correct
- [ ] Edge cases covered
- [ ] No conflicting rules
- [ ] Examples verify

### Calculation Checks
- [ ] All formulas present
- [ ] Parameters defined
- [ ] Examples calculate correctly
- [ ] Edge cases handled
- [ ] Cross-references valid

### Dashboard Checks
- [ ] All widgets defined
- [ ] Data sources exist
- [ ] Settings are valid
- [ ] Permissions clear
- [ ] Responsive layouts

---

## 🔄 Data Flow

### From Reference → Operations
1. Load reference files at startup
2. Validate system configuration
3. Initialize calculation engine
4. Configure display widgets
5. Set alert thresholds

### During Operations
1. Validate responses against questions
2. Calculate using engine formulas
3. Check against metrics rules
4. Display via dashboard config
5. Trigger alerts via rules

---

## 📊 Data Accuracy

### How to Verify Accuracy
1. Manual calculation of samples
2. Cross-check formulas
3. Verify against examples
4. Compare with historical data
5. Test edge cases

### Calculation Verification Example
```
Reference: Formula for S_sub
Σ(weight_i × health_i) / Σ(weight_i)

Test:
Challenges: C1 (80), C2 (70), C3 (90)
Weights: 0.3, 0.4, 0.3
Calculation: (0.3×80 + 0.4×70 + 0.3×90) / (0.3+0.4+0.3) = 79
```

---

## 🎓 Using Reference Data

### For Developers
1. Load files at system startup
2. Store in configuration object
3. Reference during calculations
4. Validate user input against reference
5. Use for testing

### For QA Engineers
1. Compare test results to reference
2. Verify calculation accuracy
3. Validate configuration settings
4. Check alert thresholds
5. Test edge cases

### For Data Analysts
1. Understand data structure
2. Verify data quality
3. Analyze distributions
4. Cross-reference mappings
5. Identify discrepancies

---

## 📚 Integration Points

### Challenge Catalog Usage
- Survey generation
- Response validation
- Score calculation
- Report generation

### Questions Usage
- Form rendering
- Response collection
- Data validation
- Scoring application

### Metrics Rules Usage
- Objective calculation
- Threshold checking
- Alert triggering
- Report generation

### Engine Calculations
- Formula application
- Score calculation
- Gap determination
- Quadrant assignment

### Dashboard Configuration
- Widget rendering
- Data display
- Refresh scheduling
- Alert display

---

## 🔍 Data Consistency Checks

### Cross-File Validation
- [ ] All challenges in catalog appear in questions
- [ ] All questions have valid challenge mapping
- [ ] All metrics in rules are defined
- [ ] All widgets reference valid data
- [ ] Calculations use defined metrics

### Calculation Validation
- [ ] Sample calculations match reference
- [ ] Formulas are mathematically correct
- [ ] Edge cases handled properly
- [ ] Threshold boundaries are consistent
- [ ] No circular dependencies

---

## 📈 Performance Considerations

### Caching
- Load reference data once at startup
- Cache in memory
- Invalidate only on updates
- Use for fast lookups

### Optimization
- Index by ID for quick access
- Pre-calculate common values
- Minimize file I/O
- Use efficient data structures

---

## 🔐 Data Integrity

### Backup Strategy
- Regular backups of reference files
- Version control for tracking changes
- Audit trail for modifications
- Disaster recovery procedure

### Change Management
- Document all changes
- Notify affected systems
- Test before deployment
- Rollback procedure

---

## 📚 Related Documentation

- `../README.md` - Data hub overview
- `/docs/reference/` - System references
- `/docs/product-building-master/latest-version/` - System specifications
- `/docs/user-guides/` - User procedures

---

**Last Updated:** August 26, 2026  
**Files:** 5 reference data CSVs  
**Status:** ✅ Ready for system operation

For data hub overview, see `../README.md`
