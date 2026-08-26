# Phase 1 Domain Expert Charter

**Phase 1 Execution Team**
**Duration: Weeks 1-4 (28 days)**
**Start Date: 2026-08-22**
**Status: ACTIVE**

---

## Team Structure & Responsibilities

### 1. Frontend Expert (React/TypeScript)
**Role:** Build UI components and real-time dashboard
**Responsibilities:**
- Create 6 React components (HealthIndexGauge, MultiplierCard, etc.)
- Implement real-time Firestore listeners
- Dashboard state management (Zustand)
- Challenge response form builder
- Integration testing with calculation engine

**Deliverables (Week 4):**
- ✅ ChallengeForm.tsx - Assessment entry interface
- ✅ HealthIndexGauge.tsx - Visual dashboard display
- ✅ ResponseAggregator.tsx - Live response tracking
- ✅ MultiplierCard.tsx - Individual metric display
- ✅ DriverRanking.tsx - Challenge severity ranking
- ✅ QuadrantChart.tsx - Perception vs reality visualization

**Success Metric:** Dashboard updates in <2 seconds of new responses

---

### 2. Backend Engineer (Node.js/Firebase)
**Role:** Database schema, APIs, and calculation engines
**Responsibilities:**
- Firestore collection design and implementation
- TypeScript type definitions
- Cloud Function setup (if needed for calculations)
- Real-time listener architecture
- API endpoint specifications (Phase 2 prep)

**Deliverables (Week 4):**
- ✅ firstOpinionSchema.ts - All TypeScript interfaces
- ✅ Firestore collections (8 total) created and indexed
- ✅ Security rules configured
- ✅ Seed data loaded (15 challenges, 8 multipliers)
- ✅ Real-time listener functions

**Success Metric:** All Firestore writes/reads <200ms latency

---

### 3. Algorithm/Calculation Expert
**Role:** Implement core diagnostic engines
**Responsibilities:**
- S_sub calculation (weighted challenge responses)
- M_obj calculation (geometric mean of multipliers)
- Health Index formula (with Delusion Penalty)
- Gap-based quadrant logic
- Response validation and fact-vs-perception tagging
- Unit tests (40+ test cases)

**Deliverables (Week 3-4):**
- ✅ calculations.ts - All 4 engines fully implemented
- ✅ validation.ts - Response quality checks
- ✅ formulas.ts - Calculation references
- ✅ 40+ unit tests passing
- ✅ All calculations match worked examples from spec

**Success Metric:** S_sub = 78.5, M_obj = 82.0, H = 64.3 (exact match to worked example)

---

### 4. Data Architect
**Role:** Database design and data mapping
**Responsibilities:**
- Design 8-collection schema (schools, cycles, responses, multipliers, etc.)
- Data mapping: 15 challenges → database fields
- Data mapping: 8 multipliers → threshold ranges
- Multiplier data card specifications
- Multi-cycle storage and archival strategy

**Deliverables (Week 2):**
- ✅ Complete database schema diagram
- ✅ JSON data cards for all 8 multipliers
- ✅ Challenge metadata (weights, domains, questions)
- ✅ Benchmark threshold definitions
- ✅ Data import script for seed data

**Success Metric:** Schema supports 1000 schools × 4 cycles with <100ms query time

---

### 5. QA/Testing Engineer
**Role:** Quality assurance and test automation
**Responsibilities:**
- Unit test specifications (40+ tests)
- Integration test scenarios
- Test data generation (realistic responses)
- Manual test cases (14-point checklist)
- Regression test suite

**Deliverables (Week 4):**
- ✅ calculations.test.ts - Unit tests for all engines
- ✅ validation.test.ts - Validation logic tests
- ✅ integration.test.ts - End-to-end flow tests
- ✅ Manual test plan (14 scenarios)
- ✅ Test data factory (random responses)

**Success Metric:** 95%+ code coverage on calculation engines, zero calculation errors

---

### 6. Technical Writer (Documentation)
**Role:** Maintain and expand documentation
**Responsibilities:**
- Keep PHASE1_IMPLEMENTATION_GUIDE.md updated daily
- Document decisions and blockers
- Create code comments and docstrings
- Generate daily status reports
- Update PHASE1_QUICK_START.md with real timelines

**Deliverables (Ongoing):**
- ✅ Daily progress updates in git commits
- ✅ Code documentation (JSDoc comments)
- ✅ Weekly summary report
- ✅ Blocker/risk log

---

## Weekly Responsibilities Matrix

### Week 1: Database & Models
| Expert | Tasks | Status |
|--------|-------|--------|
| Data Architect | Design schema, create data cards | ⏳ |
| Backend Engineer | Implement Firestore collections, types | ⏳ |
| QA Engineer | Create test data factory | ⏳ |
| Tech Writer | Document schema design | ⏳ |
| Algorithm Expert | Prepare test cases | ⏳ |
| Frontend Expert | Plan component structure | ⏳ |

### Week 2: Calculation Engines
| Expert | Tasks | Status |
|--------|-------|--------|
| Algorithm Expert | Implement S_sub, M_obj, H engines | ⏳ |
| QA Engineer | Write unit tests for engines | ⏳ |
| Backend Engineer | Integrate with Firestore | ⏳ |
| Tech Writer | Document calculation logic | ⏳ |
| Frontend Expert | Prepare calculation hooks | ⏳ |

### Week 3: Validation & Integration
| Expert | Tasks | Status |
|--------|-------|--------|
| Algorithm Expert | Response validation, fact-vs-perception | ⏳ |
| QA Engineer | Integration testing | ⏳ |
| Backend Engineer | Real-time listeners | ⏳ |
| Tech Writer | Update troubleshooting guide | ⏳ |
| Frontend Expert | Component development | ⏳ |

### Week 4: Components & Testing
| Expert | Tasks | Status |
|--------|-------|--------|
| Frontend Expert | 6 components complete | ⏳ |
| QA Engineer | Full test suite passing | ⏳ |
| Backend Engineer | Performance optimization | ⏳ |
| Algorithm Expert | Edge case handling | ⏳ |
| Tech Writer | Final documentation | ⏳ |
| Data Architect | Schema validation | ⏳ |

---

## Daily Standup Template (15 mins)

**Time:** 10:00 AM IST (Monday-Friday)

**Agenda:**
1. What was completed yesterday? (1 min per expert)
2. What's planned for today? (1 min per expert)
3. Blockers and risks? (3 mins)
4. Updated timelines? (2 mins)

**Status Board Location:** GitHub Projects (or shared sheet)

---

## Communication Channels

**Daily Sync:** Zoom/Google Meet (10 AM IST)
**Async Updates:** GitHub commit messages + PR descriptions
**Blocker Escalation:** Slack #phase1-execution channel
**Weekly Report:** Email to CPDO (Friday 5 PM IST)

---

## Phase 1 Acceptance Criteria

### Database ✅
- [ ] All 8 Firestore collections created
- [ ] All TypeScript interfaces defined
- [ ] Security rules implemented
- [ ] Seed data loaded (100% of challenges & multipliers)
- [ ] Real-time listeners working

### Calculation Engines ✅
- [ ] S_sub implementation matches worked example (78.5)
- [ ] M_obj geometric mean prevents compounding
- [ ] Health Index applies Delusion Penalty correctly
- [ ] Gap quadrant classifies correctly (3 zones)
- [ ] Response validation identifies fact vs perception

### Components ✅
- [ ] 6 React components rendering correctly
- [ ] Dashboard updates <2 seconds from new responses
- [ ] Challenge form submits responses to Firestore
- [ ] No console errors or warnings

### Testing ✅
- [ ] 40+ unit tests passing
- [ ] 95%+ code coverage on engines
- [ ] Integration tests passing (end-to-end flows)
- [ ] Manual test checklist complete (14/14)

### Documentation ✅
- [ ] Code fully commented (JSDoc)
- [ ] PHASE1_IMPLEMENTATION_GUIDE.md updated
- [ ] PHASE1_QUICK_START.md reflects actual timelines
- [ ] Troubleshooting guide comprehensive

---

## Risk Management

### Critical Risks

**Risk 1: Calculation Formula Mismatch**
- **Impact:** High (wrong diagnostic number)
- **Probability:** Medium (complex formula)
- **Mitigation:** Daily verification against worked examples
- **Owner:** Algorithm Expert

**Risk 2: Real-time Listener Performance**
- **Impact:** Medium (user experience)
- **Probability:** Low (Firebase is stable)
- **Mitigation:** Load testing with 100+ concurrent responses
- **Owner:** Backend Engineer

**Risk 3: Multiplier Data Sourcing**
- **Impact:** Medium (incomplete diagnosis)
- **Probability:** Medium (depends on schools)
- **Mitigation:** Plan manual entry UI for Phase 1, API for Phase 2
- **Owner:** Data Architect

**Risk 4: Test Data Complexity**
- **Impact:** Low (delays testing)
- **Probability:** Medium (15 challenges is complex)
- **Mitigation:** Create data factory early (Week 1)
- **Owner:** QA Engineer

---

## Success Celebrations

**When Each Milestone Completes:**

**Week 1 Complete:** 🎉
- Database is bulletproof
- All data loaded
- Team confident in schema

**Week 2 Complete:** 🎉
- Calculations proven correct
- Unit tests all passing
- Formula verified against examples

**Week 3 Complete:** 🎉
- Full integration working
- Real-time listeners operational
- No calculation errors found

**Week 4 Complete:** 🎉
- All components built
- Dashboard live and fast
- Ready for Phase 2 APIs

---

## Transition to Phase 2

**Phase 1 → Phase 2 Handoff Criteria:**
- ✅ All Phase 1 deliverables complete
- ✅ Zero known bugs (critical only in Phase 2)
- ✅ Code committed and reviewed
- ✅ Documentation updated
- ✅ Team confident in engine accuracy

**Phase 2 Scope (Week 5):**
- API layer (challenge responses, multiplier sync)
- Multi-school batch processing
- Performance optimization
- Data ingestion from 11 source systems

---

## Expert Availability & Escalation

**CPDO (Overall Lead):**
- Email: rylneuroacademy@gmail.com
- Escalation: Blockers that impact timeline

**Frontend Expert:**
- Focus Area: React components, real-time updates
- Backup: [TBD]

**Backend Engineer:**
- Focus Area: Firestore, Cloud Functions
- Backup: [TBD]

**Algorithm Expert:**
- Focus Area: Calculation accuracy, validation
- Backup: [TBD]

**Data Architect:**
- Focus Area: Schema, data mapping
- Backup: [TBD]

**QA Engineer:**
- Focus Area: Testing, quality assurance
- Backup: [TBD]

**Technical Writer:**
- Focus Area: Documentation, communication
- Backup: [TBD]

---

## Go/No-Go Decision

**Status:** ✅ **GO FOR PHASE 1 EXECUTION**

**Team Confirmation Required:**
- [ ] Frontend Expert - Confirms component plan
- [ ] Backend Engineer - Confirms DB schema feasibility
- [ ] Algorithm Expert - Confirms can implement in timeline
- [ ] Data Architect - Confirms data model soundness
- [ ] QA Engineer - Confirms test strategy viable
- [ ] Technical Writer - Confirms documentation approach

**Approved By:** CPDO (rylneuroacademy@gmail.com)
**Approval Date:** 2026-08-22
**Phase 1 Start Date:** 2026-08-22
**Phase 1 End Date:** 2026-09-19 (4 weeks)

---

**Domain Expert Charter Active**
**Ready to Begin Phase 1 Implementation**
**Let's Build! 🚀**
