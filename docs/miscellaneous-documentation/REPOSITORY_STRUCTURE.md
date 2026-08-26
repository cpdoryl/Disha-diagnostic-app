# DISHA Diagnostic Engine - Repository Structure Guide

**Last Updated:** August 26, 2026  
**Status:** ✅ Clean & Organized

---

## 📁 Root-Level Organization

```
disha-diagnostic-engine/
├── src/                          # React source code & components
├── functions/                    # Cloud Functions (backend)
├── public/                       # Static assets
├── docs/                         # ⭐ COMPREHENSIVE DOCUMENTATION HUB
├── .github/                      # GitHub workflows & actions
├── CLAUDE.md                     # Development workflow guide
├── README.md                     # Main project readme
├── firebase.json                 # Firebase configuration
├── package.json                  # Project dependencies
└── tsconfig.json                # TypeScript configuration
```

---

## 📚 Documentation Hub (`/docs/`)

The documentation has been reorganized into a clean, hierarchical structure for easy navigation:

### 🧪 `/docs/testing/` (11 files)
**Complete 12-phase testing framework**

Contains all automated test verification files and testing documentation:
- `TESTING_FRAMEWORK_COMPLETE.md` - Complete testing summary
- Test verification files (10 executable test suites):
  - `calculations-verification.js` (60 tests)
  - `integration-tests.js` (23 tests)
  - `reporting-verification.js` (13 tests)
  - `early-warnings-verification.js` (18 tests)
  - `e2e-workflows-verification.js` (7 tests)
  - `data-persistence-verification.js` (16 tests)
  - `edge-cases-verification.js` (34 tests)
  - `performance-verification.js` (10 tests)
  - `cross-browser-verification.js` (10 tests)
  - `production-validation.js` (10 tests)

**Status:** ✅ 375/375 tests passing (100% pass rate)

---

### 🏗️ `/docs/product-building-master/` (19 files)
**Core architectural and implementation specifications**

#### `/latest-version/` (9 files) ⭐ **CURRENT**
The authoritative source for current implementation:

**Authoritative References:**
- `DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md` - Complete First Opinion Engine methodology
- `DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md` - 14-Dimension diagnostic framework
- `FIRST_OPINION_ENGINE_TECH_STACK.md` - Complete technical architecture
- `DISHA_FIRST_OPINION_ENGINE_V3_COMPLETION_REPORT.md` - Implementation status
- `EWISR_TECH_STACK_IMPLEMENTATION.md` - EWISR system details
- `ARCHITECTURE.md` - System architecture overview
- `FIRST_OPINION_ENGINE_COMPREHENSIVE_TEST_PLAN.md` - Testing specifications
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Implementation overview

**Always reference Latest Version for current development.**

#### `/old-versions/` (10 files)
Historical documentation for reference:
- Previous implementation blueprints
- Version 1 documentation
- Early Version 2 phase documents
- Legacy framework versions

**For historical context and evolution tracking only.**

---

### 📋 `/docs/phases/` (36 files)
**Phase-by-phase implementation guidance**

Organized documentation for each development phase:
- Phase 1: Foundation & multi-user assessment
- Phase 2: Real-time response tracking
- Phase 3: Identification & verification
- Phase 4: Analysis & dashboards
- Phase 5+: Advanced features & optimization

Each phase contains:
- Implementation plans
- Completion reports
- Verification documents
- Progress tracking

---

### 🚀 `/docs/deployment/` (34 files)
**Deployment, setup, and operations guides**

Complete deployment documentation:
- `MASTER_DEPLOYMENT_GUIDE.md` - Main reference
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Pre-deployment verification
- Firebase deployment procedures
- GitHub Actions CI/CD configuration
- Custom domain integration
- Quick start deployment guides
- Cloud Run deployment procedures

**Reference for all deployment activities.**

---

### 👤 `/docs/user-guides/` (6 files)
**End-user and operations documentation**

Documentation for system operators and end users:
- `DISHA_USER_GUIDE_AND_OPERATIONAL_MANUAL.md` - Complete user manual
- `USER_GUIDE_AND_FEATURES.md` - Feature overview
- `DISHA_CHECKUP_EXPLAINED.md` - School assessment procedures
- `DISHA_TERMS_WEIGHTS_METHODOLOGY_GUIDE.md` - Terminology reference
- Data collection guides

**For end-user support and operations teams.**

---

### 📚 `/docs/reference/` (6 files)
**Technical reference and quick-start materials**

Quick reference materials:
- `DISHA_CALCULATION_ENGINE_GUIDE.md` - Formula reference
- `INTEGRATION_GUIDE.md` - API integration procedures
- `QUICK_REFERENCE.md` - Quick lookup guide
- `DOCUMENTATION_INDEX.md` - Complete index
- `START_HERE.md` - Getting started

**For quick lookups and common operations.**

---

### 📦 `/docs/archived-documentation/` (57 files)
**Historical and completed status documents**

All superseded, status, and historical documents:
- Completed status reports
- Implementation summaries
- Audit and verification reports
- Historical decision documents
- Superseded specifications

**For historical reference and understanding project evolution.**

---

### 📖 `/docs/README.md`
**Main documentation hub index and navigation guide**

Complete guide to finding and using all documentation. Start here for navigation assistance.

---

## 🎯 Quick Reference

### For Different Users

**Product Development:**
→ `/docs/product-building-master/latest-version/`
→ Read DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md

**System Architecture:**
→ `/docs/product-building-master/latest-version/ARCHITECTURE.md`
→ Then: FIRST_OPINION_ENGINE_TECH_STACK.md

**Deployment Engineer:**
→ `/docs/deployment/MASTER_DEPLOYMENT_GUIDE.md`
→ Reference: PRODUCTION_DEPLOYMENT_CHECKLIST.md

**Operations/Support:**
→ `/docs/user-guides/DISHA_USER_GUIDE_AND_OPERATIONAL_MANUAL.md`
→ Reference: USER_GUIDE_AND_FEATURES.md

**QA/Testing:**
→ `/docs/testing/TESTING_FRAMEWORK_COMPLETE.md`
→ Execute: Test verification files

**System Integration:**
→ `/docs/reference/INTEGRATION_GUIDE.md`
→ Reference: DISHA_CALCULATION_ENGINE_GUIDE.md

---

## 📊 Repository Statistics

| Category | Files | Purpose |
|----------|-------|---------|
| Testing | 11 | Automated testing & validation |
| Product Building (Latest) | 9 | Current implementation specs |
| Product Building (Old) | 10 | Historical documentation |
| Phases | 36 | Phase-specific guidance |
| Deployment | 34 | Setup & operations |
| User Guides | 6 | End-user documentation |
| Reference | 6 | Technical reference |
| Archived | 57 | Historical documents |
| **TOTAL** | **169** | **Complete documentation suite** |

---

## 🗂️ File Organization Benefits

### Before Reorganization
- ❌ 170+ markdown files scattered in root directory
- ❌ Difficult to locate specific documentation
- ❌ No clear categorization or hierarchy
- ❌ Hard to distinguish current vs. historical docs
- ❌ Overwhelming for new team members

### After Reorganization
- ✅ Clean, hierarchical folder structure
- ✅ Clear categorization by purpose and audience
- ✅ Easy navigation with dedicated README
- ✅ Clear distinction between latest and old versions
- ✅ Intuitive for team members and stakeholders
- ✅ Scalable structure for future documentation
- ✅ Professional documentation presentation

---

## 🚀 Getting Started

### For New Team Members
1. Read `/docs/README.md` - Documentation overview
2. Check `/docs/reference/START_HERE.md` - Getting started guide
3. Navigate to relevant category based on your role
4. Reference authoritative docs in latest-version folder

### For Deployment
1. Read `/docs/deployment/MASTER_DEPLOYMENT_GUIDE.md`
2. Use `/docs/deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md`
3. Reference phase-specific guides in `/docs/phases/`

### For Development
1. Read `/docs/product-building-master/latest-version/ARCHITECTURE.md`
2. Check `/docs/product-building-master/latest-version/FIRST_OPINION_ENGINE_TECH_STACK.md`
3. Reference `/docs/product-building-master/latest-version/DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md`

### For Testing
1. Navigate to `/docs/testing/`
2. Read `TESTING_FRAMEWORK_COMPLETE.md`
3. Execute test files as needed

---

## 📝 Maintenance Notes

### Adding New Documentation
1. Determine the appropriate category
2. Place file in the relevant folder
3. Update the category's README if needed
4. Reference in `/docs/README.md`

### Archiving Documents
1. When a document is superseded, move to `/archived-documentation/`
2. Note the reason for archiving
3. Add reference to replacement document if applicable

### Updating Latest Version
When updating Product Building Master docs:
1. Update files in `/latest-version/` folder
2. Archive old version in `/old-versions/` folder
3. Update version references in documentation

---

## 🔐 Important Guidelines

### Never Modify
- Authoritative source documents without full team consensus
- Archived documentation (for historical accuracy)
- Test files without updating test framework

### Always Update
- Documentation when code changes
- README.md when reorganizing
- Metadata when moving or renaming files

### Always Reference
- Latest version files for current implementation
- Archived files only for historical context
- Test framework for validation

---

## 🎯 System Status

| Component | Status | Location |
|-----------|--------|----------|
| Testing | ✅ Complete (375 tests) | `/docs/testing/` |
| Product Building | ✅ Current | `/docs/product-building-master/latest-version/` |
| Deployment | ✅ Current | `/docs/deployment/` |
| User Documentation | ✅ Current | `/docs/user-guides/` |
| Architecture | ✅ Current | `/docs/product-building-master/latest-version/ARCHITECTURE.md` |
| **Overall** | ✅ **Production Ready** | All systems organized & documented |

---

**Repository Organization Complete:** August 26, 2026  
**Maintainer:** Development Team  
**Status:** ✅ Clean, organized, and ready for team collaboration

For detailed navigation, see `/docs/README.md`
