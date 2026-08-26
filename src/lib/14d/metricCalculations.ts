/**
 * 14-Dimension Diagnostic Framework v2 — Metric Calculation Engine
 * Pure functions for calculating all 60+ metrics
 * No external dependencies - works with raw data or fallbacks
 */

// ============================================================================
// DIMENSION 1: Academic Performance & Learning Outcomes
// ============================================================================

export const calculateMetric1a = (data: {
  studentsPassed: number;
  studentsAppeared: number;
}): number => {
  if (data.studentsAppeared === 0) return 0;
  return (data.studentsPassed / data.studentsAppeared) * 100;
};

export const calculateMetric1b = (data: {
  allFormativeScores: number[]; // All scores across all students
}): number => {
  if (data.allFormativeScores.length === 0) return 0;
  const sum = data.allFormativeScores.reduce((a, b) => a + b, 0);
  return sum / data.allFormativeScores.length;
};

export const calculateMetric1c = (data: {
  studentsBelowBenchmark: number;
  totalTested: number;
}): number => {
  if (data.totalTested === 0) return 0;
  return (data.studentsBelowBenchmark / data.totalTested) * 100;
};

export const calculateMetric1d = (data: {
  currentYearScores: Record<string, number>; // studentId → score
  previousYearScores: Record<string, number>; // studentId → score
}): number => {
  const linkedStudents = Object.keys(data.currentYearScores).filter(
    id => id in data.previousYearScores
  );

  if (linkedStudents.length === 0) return 0;

  const growthValues = linkedStudents.map(id =>
    data.currentYearScores[id] - data.previousYearScores[id]
  );

  const sum = growthValues.reduce((a, b) => a + b, 0);
  return sum / growthValues.length;
};

export const calculateMetric1e = (data: {
  questionwiseResponses: {
    questionId: string;
    topic: string;
    correct: number;
    total: number;
  }[];
}): Record<string, number> => {
  const resultByTopic: Record<string, number> = {};

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

export const calculateMetric1f = (data: {
  assignmentsSubmitted: number;
  assignmentsAssigned: number;
}): number => {
  if (data.assignmentsAssigned === 0) return 0;
  return (data.assignmentsSubmitted / data.assignmentsAssigned) * 100;
};

// ============================================================================
// DIMENSION 2: Curriculum & Pedagogy Quality
// ============================================================================

export const calculateMetric2a = (data: {
  lessonsObserved: {
    lessonId: string;
    rating: 'Effective' | 'Developing' | 'Needs Improvement';
  }[];
}): number => {
  if (data.lessonsObserved.length === 0) return 0;
  const effective = data.lessonsObserved.filter(
    l => l.rating === 'Effective'
  ).length;
  return (effective / data.lessonsObserved.length) * 100;
};

export const calculateMetric2b = (data: {
  totalCPDHours: number;
  numberOfTeachers: number;
}): number => {
  if (data.numberOfTeachers === 0) return 0;
  return data.totalCPDHours / data.numberOfTeachers;
};

export const calculateMetric2c = (data: {
  lessonObservations: {
    lessonId: string;
    primaryMode: 'Activity-based' | 'Lecture-based' | 'Hybrid';
  }[];
}): number => {
  const activityBased = data.lessonObservations.filter(
    l => l.primaryMode === 'Activity-based'
  ).length;
  const lectureBased = data.lessonObservations.filter(
    l => l.primaryMode === 'Lecture-based'
  ).length;

  if (lectureBased === 0) return activityBased > 0 ? 999 : 0; // Infinity representation
  return activityBased / lectureBased;
};

export const calculateMetric2d = (data: {
  topicsCoveredByCheckpoint: Record<string, number>; // checkpoint → count
  topicsPlannedByCheckpoint: Record<string, number>; // checkpoint → count
}): number => {
  const checkpoints = Object.keys(data.topicsPlannedByCheckpoint);
  if (checkpoints.length === 0) return 0;

  const adherenceRates = checkpoints.map(cp => {
    const planned = data.topicsPlannedByCheckpoint[cp] || 0;
    const covered = data.topicsCoveredByCheckpoint[cp] || 0;
    if (planned === 0) return 100;
    return (covered / planned) * 100;
  });

  return adherenceRates.reduce((a, b) => a + b, 0) / adherenceRates.length;
};

export const calculateMetric2e = (data: {
  projectsDocumented: number;
}): number => {
  return data.projectsDocumented;
};

// ============================================================================
// DIMENSION 3: Teacher Quality, Development & Retention
// ============================================================================

export const calculateMetric3a = (data: {
  teachersLeft: number;
  averageTeachersEmployed: number;
}): number => {
  if (data.averageTeachersEmployed === 0) return 0;
  return (data.teachersLeft / data.averageTeachersEmployed) * 100;
};

export const calculateMetric3b = (data: {
  teacherTenures: number[]; // in years
}): number => {
  if (data.teacherTenures.length === 0) return 0;
  const sum = data.teacherTenures.reduce((a, b) => a + b, 0);
  return sum / data.teacherTenures.length;
};

export const calculateMetric3c = (data: {
  qualifiedTeachers: number;
  totalTeachers: number;
}): number => {
  if (data.totalTeachers === 0) return 0;
  return (data.qualifiedTeachers / data.totalTeachers) * 100;
};

export const calculateMetric3d = (data: {
  teacherDaysAbsent: number;
  totalPossibleDays: number;
}): number => {
  if (data.totalPossibleDays === 0) return 0;
  return (data.teacherDaysAbsent / data.totalPossibleDays) * 100;
};

export const calculateMetric3e = (data: {
  totalEnrolledStudents: number;
  totalTeachingStaffFTE: number;
}): number => {
  if (data.totalTeachingStaffFTE === 0) return 0;
  return data.totalEnrolledStudents / data.totalTeachingStaffFTE;
};

export const calculateMetric3f = (data: {
  periodsWithSubstitutes: number;
  totalPeriods: number;
}): number => {
  if (data.totalPeriods === 0) return 0;
  return (data.periodsWithSubstitutes / data.totalPeriods) * 100;
};

// ============================================================================
// DIMENSION 4: Student Wellbeing & Mental Health
// ============================================================================

export const calculateMetric4a = (data: {
  counsellorSessions: number;
  monthsTracked: number;
  distinctStudentsCounselled: number;
  totalCounsellors: number;
}): { averageSessionsPerMonth: number; caseload: number } => {
  const avgSessions = data.monthsTracked > 0 ? data.counsellorSessions / data.monthsTracked : 0;
  const caseload = data.totalCounsellors > 0 ? data.distinctStudentsCounselled / data.totalCounsellors : 0;

  return { averageSessionsPerMonth: avgSessions, caseload };
};

export const calculateMetric4b = (data: {
  bullyingIncidents: {
    reportedDate: Date;
    resolvedDate?: Date;
  }[];
}): number => {
  const resolvedIncidents = data.bullyingIncidents.filter(i => i.resolvedDate);
  if (resolvedIncidents.length === 0) return 0;

  const resolutionTimes = resolvedIncidents.map(i => {
    const time = (i.resolvedDate!.getTime() - i.reportedDate.getTime()) / (1000 * 60 * 60 * 24);
    return time;
  });

  return resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
};

export const calculateMetric4c = (data: {
  absencesWithStressFlag: number;
  totalAbsences: number;
}): number => {
  if (data.totalAbsences === 0) return 0;
  return (data.absencesWithStressFlag / data.totalAbsences) * 100;
};

export const calculateMetric4d = (data: {
  studentsAttendingSEL: number;
  totalEnrolled: number;
}): number => {
  if (data.totalEnrolled === 0) return 0;
  return (data.studentsAttendingSEL / data.totalEnrolled) * 100;
};

export const calculateMetric4e = (data: {
  surveyResponses: number;
  totalInvited: number;
}): number => {
  if (data.totalInvited === 0) return 0;
  return (data.surveyResponses / data.totalInvited) * 100;
};

// ============================================================================
// AGGREGATION: Convert 0-100 to 0-100 for Reality Metrics
// ============================================================================

export const aggregateRealityScore = (metricValues: number[]): number => {
  if (metricValues.length === 0) return 0;
  const validValues = metricValues.filter(v => !isNaN(v) && isFinite(v));
  if (validValues.length === 0) return 0;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
};

// ============================================================================
// AGGREGATION: Convert 1-10 Perception Scores to 0-100
// ============================================================================

export const aggregatePerceptionScore = (perceptionRatings: number[]): number => {
  if (perceptionRatings.length === 0) return 0;

  const validRatings = perceptionRatings.filter(r => r >= 1 && r <= 10);
  if (validRatings.length === 0) return 0;

  // Convert 1-10 scale to 0-100 scale
  const normalized = validRatings.map(r => ((r - 1) / 9) * 100);
  return normalized.reduce((a, b) => a + b, 0) / normalized.length;
};

// ============================================================================
// GAP CALCULATION
// ============================================================================

export const calculateGap = (
  realityScore: number,
  perceptionScore: number
): {
  gap: number;
  direction: 'reality_higher' | 'perception_higher' | 'aligned';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
} => {
  const gap = Math.abs(realityScore - perceptionScore);
  const direction =
    realityScore > perceptionScore ? 'reality_higher' :
    perceptionScore > realityScore ? 'perception_higher' :
    'aligned';

  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  if (gap >= 25) severity = 'CRITICAL';
  else if (gap >= 15) severity = 'HIGH';
  else if (gap >= 8) severity = 'MEDIUM';
  else severity = 'LOW';

  return { gap, direction, severity };
};

// ============================================================================
// TREND CALCULATION (YoY)
// ============================================================================

export const calculateTrend = (
  currentScore: number,
  previousScore?: number
): {
  change?: number;
  percentChange?: number;
  trend: 'improving' | 'declining' | 'stable';
} => {
  if (previousScore === undefined) {
    return { trend: 'stable' };
  }

  const change = currentScore - previousScore;
  const percentChange = previousScore > 0 ? (change / previousScore) * 100 : 0;

  let trend: 'improving' | 'declining' | 'stable';
  if (change > 2) trend = 'improving';
  else if (change < -2) trend = 'declining';
  else trend = 'stable';

  return { change, percentChange, trend };
};

// ============================================================================
// UTILITY: Scale any metric to 0-100
// ============================================================================

export const scaleMetricTo100 = (
  value: number,
  minPossible: number,
  maxPossible: number
): number => {
  if (maxPossible === minPossible) return 50; // Default to middle if range is 0
  const normalized = (value - minPossible) / (maxPossible - minPossible);
  return Math.min(100, Math.max(0, normalized * 100)); // Clamp 0-100
};

// ============================================================================
// EXPORT ALL CALCULATORS
// ============================================================================

export const METRIC_CALCULATORS = {
  '1a': calculateMetric1a,
  '1b': calculateMetric1b,
  '1c': calculateMetric1c,
  '1d': calculateMetric1d,
  '1e': calculateMetric1e,
  '1f': calculateMetric1f,
  '2a': calculateMetric2a,
  '2b': calculateMetric2b,
  '2c': calculateMetric2c,
  '2d': calculateMetric2d,
  '2e': calculateMetric2e,
  '3a': calculateMetric3a,
  '3b': calculateMetric3b,
  '3c': calculateMetric3c,
  '3d': calculateMetric3d,
  '3e': calculateMetric3e,
  '3f': calculateMetric3f,
  '4a': calculateMetric4a,
  '4b': calculateMetric4b,
  '4c': calculateMetric4c,
  '4d': calculateMetric4d,
  '4e': calculateMetric4e,
};

export function getCalculator(metricId: string) {
  return METRIC_CALCULATORS[metricId as keyof typeof METRIC_CALCULATORS];
}
