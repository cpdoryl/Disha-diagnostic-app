"use strict";
/**
 * 14-Dimension Diagnostic Framework v2 — Metric Calculations Library
 * Pure functions for calculating all 60+ metrics (1-10 score normalization)
 * Synced with src/lib/14d/metricCalculations.ts
 * Phase 3: Cloud Functions & Analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalculator = exports.METRIC_CALCULATORS = exports.scaleMetricTo100 = exports.calculateTrend = exports.calculateGap = exports.aggregatePerceptionScore = exports.aggregateRealityScore = exports.calculateMetric4e = exports.calculateMetric4d = exports.calculateMetric4c = exports.calculateMetric4b = exports.calculateMetric4a = exports.calculateMetric3f = exports.calculateMetric3e = exports.calculateMetric3d = exports.calculateMetric3c = exports.calculateMetric3b = exports.calculateMetric3a = exports.calculateMetric2e = exports.calculateMetric2d = exports.calculateMetric2c = exports.calculateMetric2b = exports.calculateMetric2a = exports.calculateMetric1f = exports.calculateMetric1e = exports.calculateMetric1d = exports.calculateMetric1c = exports.calculateMetric1b = exports.calculateMetric1a = void 0;
// ============================================================================
// DIMENSION 1: Academic Performance & Learning Outcomes
// ============================================================================
const calculateMetric1a = (data) => {
    if (data.studentsAppeared === 0)
        return 0;
    return (data.studentsPassed / data.studentsAppeared) * 100;
};
exports.calculateMetric1a = calculateMetric1a;
const calculateMetric1b = (data) => {
    if (data.allFormativeScores.length === 0)
        return 0;
    const sum = data.allFormativeScores.reduce((a, b) => a + b, 0);
    return sum / data.allFormativeScores.length;
};
exports.calculateMetric1b = calculateMetric1b;
const calculateMetric1c = (data) => {
    if (data.totalTested === 0)
        return 0;
    return (data.studentsBelowBenchmark / data.totalTested) * 100;
};
exports.calculateMetric1c = calculateMetric1c;
const calculateMetric1d = (data) => {
    const linkedStudents = Object.keys(data.currentYearScores).filter(id => id in data.previousYearScores);
    if (linkedStudents.length === 0)
        return 0;
    const growthValues = linkedStudents.map(id => data.currentYearScores[id] - data.previousYearScores[id]);
    const sum = growthValues.reduce((a, b) => a + b, 0);
    return sum / growthValues.length;
};
exports.calculateMetric1d = calculateMetric1d;
const calculateMetric1e = (data) => {
    const resultByTopic = {};
    data.questionwiseResponses.forEach(q => {
        if (!resultByTopic[q.topic]) {
            resultByTopic[q.topic] = 0;
        }
        if (q.total > 0) {
            resultByTopic[q.topic] =
                (resultByTopic[q.topic] * (data.questionwiseResponses.length - 1) +
                    ((q.total - q.correct) / q.total) * 100) /
                    data.questionwiseResponses.length;
        }
    });
    return resultByTopic;
};
exports.calculateMetric1e = calculateMetric1e;
const calculateMetric1f = (data) => {
    if (data.assignmentsAssigned === 0)
        return 0;
    return (data.assignmentsSubmitted / data.assignmentsAssigned) * 100;
};
exports.calculateMetric1f = calculateMetric1f;
// ============================================================================
// DIMENSION 2: Curriculum & Pedagogy Quality
// ============================================================================
const calculateMetric2a = (data) => {
    if (data.lessonsObserved.length === 0)
        return 0;
    const effective = data.lessonsObserved.filter(l => l.rating === 'Effective').length;
    return (effective / data.lessonsObserved.length) * 100;
};
exports.calculateMetric2a = calculateMetric2a;
const calculateMetric2b = (data) => {
    if (data.numberOfTeachers === 0)
        return 0;
    return data.totalCPDHours / data.numberOfTeachers;
};
exports.calculateMetric2b = calculateMetric2b;
const calculateMetric2c = (data) => {
    const activityBased = data.lessonObservations.filter(l => l.primaryMode === 'Activity-based').length;
    const lectureBased = data.lessonObservations.filter(l => l.primaryMode === 'Lecture-based').length;
    if (lectureBased === 0)
        return activityBased > 0 ? 100 : 0;
    return Math.min(100, (activityBased / lectureBased) * 100);
};
exports.calculateMetric2c = calculateMetric2c;
const calculateMetric2d = (data) => {
    const checkpoints = Object.keys(data.topicsPlannedByCheckpoint);
    if (checkpoints.length === 0)
        return 0;
    const adherenceRates = checkpoints.map(cp => {
        const planned = data.topicsPlannedByCheckpoint[cp] || 0;
        const covered = data.topicsCoveredByCheckpoint[cp] || 0;
        if (planned === 0)
            return 100;
        return (covered / planned) * 100;
    });
    return adherenceRates.reduce((a, b) => a + b, 0) / adherenceRates.length;
};
exports.calculateMetric2d = calculateMetric2d;
const calculateMetric2e = (data) => {
    return data.projectsDocumented;
};
exports.calculateMetric2e = calculateMetric2e;
// ============================================================================
// DIMENSION 3: Teacher Quality, Development & Retention
// ============================================================================
const calculateMetric3a = (data) => {
    if (data.averageTeachersEmployed === 0)
        return 0;
    return (data.teachersLeft / data.averageTeachersEmployed) * 100;
};
exports.calculateMetric3a = calculateMetric3a;
const calculateMetric3b = (data) => {
    if (data.teacherTenures.length === 0)
        return 0;
    const sum = data.teacherTenures.reduce((a, b) => a + b, 0);
    return sum / data.teacherTenures.length;
};
exports.calculateMetric3b = calculateMetric3b;
const calculateMetric3c = (data) => {
    if (data.totalTeachers === 0)
        return 0;
    return (data.qualifiedTeachers / data.totalTeachers) * 100;
};
exports.calculateMetric3c = calculateMetric3c;
const calculateMetric3d = (data) => {
    if (data.totalPossibleDays === 0)
        return 0;
    return (data.teacherDaysAbsent / data.totalPossibleDays) * 100;
};
exports.calculateMetric3d = calculateMetric3d;
const calculateMetric3e = (data) => {
    if (data.totalTeachingStaffFTE === 0)
        return 0;
    return data.totalEnrolledStudents / data.totalTeachingStaffFTE;
};
exports.calculateMetric3e = calculateMetric3e;
const calculateMetric3f = (data) => {
    if (data.totalPeriods === 0)
        return 0;
    return (data.periodsWithSubstitutes / data.totalPeriods) * 100;
};
exports.calculateMetric3f = calculateMetric3f;
// ============================================================================
// DIMENSION 4: Student Wellbeing & Mental Health
// ============================================================================
const calculateMetric4a = (data) => {
    const avgSessions = data.monthsTracked > 0 ? data.counsellorSessions / data.monthsTracked : 0;
    const caseload = data.totalCounsellors > 0 ? data.distinctStudentsCounselled / data.totalCounsellors : 0;
    return { averageSessionsPerMonth: avgSessions, caseload };
};
exports.calculateMetric4a = calculateMetric4a;
const calculateMetric4b = (data) => {
    const resolvedIncidents = data.bullyingIncidents.filter(i => i.resolvedDate);
    if (resolvedIncidents.length === 0)
        return 0;
    const resolutionTimes = resolvedIncidents.map(i => {
        const time = (i.resolvedDate.getTime() - i.reportedDate.getTime()) / (1000 * 60 * 60 * 24);
        return time;
    });
    return resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
};
exports.calculateMetric4b = calculateMetric4b;
const calculateMetric4c = (data) => {
    if (data.totalAbsences === 0)
        return 0;
    return (data.absencesWithStressFlag / data.totalAbsences) * 100;
};
exports.calculateMetric4c = calculateMetric4c;
const calculateMetric4d = (data) => {
    if (data.totalEnrolled === 0)
        return 0;
    return (data.studentsAttendingSEL / data.totalEnrolled) * 100;
};
exports.calculateMetric4d = calculateMetric4d;
const calculateMetric4e = (data) => {
    if (data.totalInvited === 0)
        return 0;
    return (data.surveyResponses / data.totalInvited) * 100;
};
exports.calculateMetric4e = calculateMetric4e;
// ============================================================================
// AGGREGATION: Convert to 0-100 Scale
// ============================================================================
const aggregateRealityScore = (metricValues) => {
    if (metricValues.length === 0)
        return 0;
    const validValues = metricValues.filter(v => !isNaN(v) && isFinite(v));
    if (validValues.length === 0)
        return 0;
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
};
exports.aggregateRealityScore = aggregateRealityScore;
const aggregatePerceptionScore = (perceptionRatings) => {
    if (perceptionRatings.length === 0)
        return 0;
    const validRatings = perceptionRatings.filter(r => r >= 1 && r <= 10);
    if (validRatings.length === 0)
        return 0;
    // Convert 1-10 scale to 0-100 scale
    const normalized = validRatings.map(r => ((r - 1) / 9) * 100);
    return normalized.reduce((a, b) => a + b, 0) / normalized.length;
};
exports.aggregatePerceptionScore = aggregatePerceptionScore;
// ============================================================================
// GAP CALCULATION
// ============================================================================
const calculateGap = (realityScore, perceptionScore) => {
    const gap = Math.abs(realityScore - perceptionScore);
    const direction = realityScore > perceptionScore
        ? 'reality_higher'
        : perceptionScore > realityScore
            ? 'perception_higher'
            : 'aligned';
    let severity;
    if (gap >= 25)
        severity = 'CRITICAL';
    else if (gap >= 15)
        severity = 'HIGH';
    else if (gap >= 8)
        severity = 'MEDIUM';
    else
        severity = 'LOW';
    return { gap, direction, severity };
};
exports.calculateGap = calculateGap;
// ============================================================================
// TREND CALCULATION (YoY)
// ============================================================================
const calculateTrend = (currentScore, previousScore) => {
    if (previousScore === undefined) {
        return { trend: 'stable' };
    }
    const change = currentScore - previousScore;
    const percentChange = previousScore > 0 ? (change / previousScore) * 100 : 0;
    let trend;
    if (change > 2)
        trend = 'improving';
    else if (change < -2)
        trend = 'declining';
    else
        trend = 'stable';
    return { change, percentChange, trend };
};
exports.calculateTrend = calculateTrend;
// ============================================================================
// UTILITY: Scale any metric to 0-100
// ============================================================================
const scaleMetricTo100 = (value, minPossible, maxPossible) => {
    if (maxPossible === minPossible)
        return 50;
    const normalized = (value - minPossible) / (maxPossible - minPossible);
    return Math.min(100, Math.max(0, normalized * 100));
};
exports.scaleMetricTo100 = scaleMetricTo100;
// ============================================================================
// EXPORT ALL CALCULATORS
// ============================================================================
exports.METRIC_CALCULATORS = {
    '1a': exports.calculateMetric1a,
    '1b': exports.calculateMetric1b,
    '1c': exports.calculateMetric1c,
    '1d': exports.calculateMetric1d,
    '1e': exports.calculateMetric1e,
    '1f': exports.calculateMetric1f,
    '2a': exports.calculateMetric2a,
    '2b': exports.calculateMetric2b,
    '2c': exports.calculateMetric2c,
    '2d': exports.calculateMetric2d,
    '2e': exports.calculateMetric2e,
    '3a': exports.calculateMetric3a,
    '3b': exports.calculateMetric3b,
    '3c': exports.calculateMetric3c,
    '3d': exports.calculateMetric3d,
    '3e': exports.calculateMetric3e,
    '3f': exports.calculateMetric3f,
    '4a': exports.calculateMetric4a,
    '4b': exports.calculateMetric4b,
    '4c': exports.calculateMetric4c,
    '4d': exports.calculateMetric4d,
    '4e': exports.calculateMetric4e,
};
function getCalculator(metricId) {
    return exports.METRIC_CALCULATORS[metricId];
}
exports.getCalculator = getCalculator;
//# sourceMappingURL=metricCalculations.js.map