/**
 * 14-Dimension Diagnostic Framework v2 — Metric Calculations Library
 * Pure functions for calculating all 60+ metrics (1-10 score normalization)
 * Synced with src/lib/14d/metricCalculations.ts
 * Phase 3: Cloud Functions & Analysis
 */
export declare const calculateMetric1a: (data: {
    studentsPassed: number;
    studentsAppeared: number;
}) => number;
export declare const calculateMetric1b: (data: {
    allFormativeScores: number[];
}) => number;
export declare const calculateMetric1c: (data: {
    studentsBelowBenchmark: number;
    totalTested: number;
}) => number;
export declare const calculateMetric1d: (data: {
    currentYearScores: Record<string, number>;
    previousYearScores: Record<string, number>;
}) => number;
export declare const calculateMetric1e: (data: {
    questionwiseResponses: {
        questionId: string;
        topic: string;
        correct: number;
        total: number;
    }[];
}) => Record<string, number>;
export declare const calculateMetric1f: (data: {
    assignmentsSubmitted: number;
    assignmentsAssigned: number;
}) => number;
export declare const calculateMetric2a: (data: {
    lessonsObserved: {
        lessonId: string;
        rating: 'Effective' | 'Developing' | 'Needs Improvement';
    }[];
}) => number;
export declare const calculateMetric2b: (data: {
    totalCPDHours: number;
    numberOfTeachers: number;
}) => number;
export declare const calculateMetric2c: (data: {
    lessonObservations: {
        lessonId: string;
        primaryMode: 'Activity-based' | 'Lecture-based' | 'Hybrid';
    }[];
}) => number;
export declare const calculateMetric2d: (data: {
    topicsCoveredByCheckpoint: Record<string, number>;
    topicsPlannedByCheckpoint: Record<string, number>;
}) => number;
export declare const calculateMetric2e: (data: {
    projectsDocumented: number;
}) => number;
export declare const calculateMetric3a: (data: {
    teachersLeft: number;
    averageTeachersEmployed: number;
}) => number;
export declare const calculateMetric3b: (data: {
    teacherTenures: number[];
}) => number;
export declare const calculateMetric3c: (data: {
    qualifiedTeachers: number;
    totalTeachers: number;
}) => number;
export declare const calculateMetric3d: (data: {
    teacherDaysAbsent: number;
    totalPossibleDays: number;
}) => number;
export declare const calculateMetric3e: (data: {
    totalEnrolledStudents: number;
    totalTeachingStaffFTE: number;
}) => number;
export declare const calculateMetric3f: (data: {
    periodsWithSubstitutes: number;
    totalPeriods: number;
}) => number;
export declare const calculateMetric4a: (data: {
    counsellorSessions: number;
    monthsTracked: number;
    distinctStudentsCounselled: number;
    totalCounsellors: number;
}) => {
    averageSessionsPerMonth: number;
    caseload: number;
};
export declare const calculateMetric4b: (data: {
    bullyingIncidents: {
        reportedDate: Date;
        resolvedDate?: Date;
    }[];
}) => number;
export declare const calculateMetric4c: (data: {
    absencesWithStressFlag: number;
    totalAbsences: number;
}) => number;
export declare const calculateMetric4d: (data: {
    studentsAttendingSEL: number;
    totalEnrolled: number;
}) => number;
export declare const calculateMetric4e: (data: {
    surveyResponses: number;
    totalInvited: number;
}) => number;
export declare const aggregateRealityScore: (metricValues: number[]) => number;
export declare const aggregatePerceptionScore: (perceptionRatings: number[]) => number;
export declare const calculateGap: (realityScore: number, perceptionScore: number) => {
    gap: number;
    direction: 'reality_higher' | 'perception_higher' | 'aligned';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
};
export declare const calculateTrend: (currentScore: number, previousScore?: number) => {
    change?: number | undefined;
    percentChange?: number | undefined;
    trend: 'improving' | 'declining' | 'stable';
};
export declare const scaleMetricTo100: (value: number, minPossible: number, maxPossible: number) => number;
export declare const METRIC_CALCULATORS: {
    '1a': (data: {
        studentsPassed: number;
        studentsAppeared: number;
    }) => number;
    '1b': (data: {
        allFormativeScores: number[];
    }) => number;
    '1c': (data: {
        studentsBelowBenchmark: number;
        totalTested: number;
    }) => number;
    '1d': (data: {
        currentYearScores: Record<string, number>;
        previousYearScores: Record<string, number>;
    }) => number;
    '1e': (data: {
        questionwiseResponses: {
            questionId: string;
            topic: string;
            correct: number;
            total: number;
        }[];
    }) => Record<string, number>;
    '1f': (data: {
        assignmentsSubmitted: number;
        assignmentsAssigned: number;
    }) => number;
    '2a': (data: {
        lessonsObserved: {
            lessonId: string;
            rating: 'Effective' | 'Developing' | 'Needs Improvement';
        }[];
    }) => number;
    '2b': (data: {
        totalCPDHours: number;
        numberOfTeachers: number;
    }) => number;
    '2c': (data: {
        lessonObservations: {
            lessonId: string;
            primaryMode: 'Activity-based' | 'Lecture-based' | 'Hybrid';
        }[];
    }) => number;
    '2d': (data: {
        topicsCoveredByCheckpoint: Record<string, number>;
        topicsPlannedByCheckpoint: Record<string, number>;
    }) => number;
    '2e': (data: {
        projectsDocumented: number;
    }) => number;
    '3a': (data: {
        teachersLeft: number;
        averageTeachersEmployed: number;
    }) => number;
    '3b': (data: {
        teacherTenures: number[];
    }) => number;
    '3c': (data: {
        qualifiedTeachers: number;
        totalTeachers: number;
    }) => number;
    '3d': (data: {
        teacherDaysAbsent: number;
        totalPossibleDays: number;
    }) => number;
    '3e': (data: {
        totalEnrolledStudents: number;
        totalTeachingStaffFTE: number;
    }) => number;
    '3f': (data: {
        periodsWithSubstitutes: number;
        totalPeriods: number;
    }) => number;
    '4a': (data: {
        counsellorSessions: number;
        monthsTracked: number;
        distinctStudentsCounselled: number;
        totalCounsellors: number;
    }) => {
        averageSessionsPerMonth: number;
        caseload: number;
    };
    '4b': (data: {
        bullyingIncidents: {
            reportedDate: Date;
            resolvedDate?: Date;
        }[];
    }) => number;
    '4c': (data: {
        absencesWithStressFlag: number;
        totalAbsences: number;
    }) => number;
    '4d': (data: {
        studentsAttendingSEL: number;
        totalEnrolled: number;
    }) => number;
    '4e': (data: {
        surveyResponses: number;
        totalInvited: number;
    }) => number;
};
export declare function getCalculator(metricId: string): ((data: {
    studentsPassed: number;
    studentsAppeared: number;
}) => number) | ((data: {
    allFormativeScores: number[];
}) => number) | ((data: {
    studentsBelowBenchmark: number;
    totalTested: number;
}) => number) | ((data: {
    currentYearScores: Record<string, number>;
    previousYearScores: Record<string, number>;
}) => number) | ((data: {
    questionwiseResponses: {
        questionId: string;
        topic: string;
        correct: number;
        total: number;
    }[];
}) => Record<string, number>) | ((data: {
    assignmentsSubmitted: number;
    assignmentsAssigned: number;
}) => number) | ((data: {
    lessonsObserved: {
        lessonId: string;
        rating: "Effective" | "Developing" | "Needs Improvement";
    }[];
}) => number) | ((data: {
    totalCPDHours: number;
    numberOfTeachers: number;
}) => number) | ((data: {
    lessonObservations: {
        lessonId: string;
        primaryMode: "Activity-based" | "Lecture-based" | "Hybrid";
    }[];
}) => number) | ((data: {
    topicsCoveredByCheckpoint: Record<string, number>;
    topicsPlannedByCheckpoint: Record<string, number>;
}) => number) | ((data: {
    projectsDocumented: number;
}) => number) | ((data: {
    teachersLeft: number;
    averageTeachersEmployed: number;
}) => number) | ((data: {
    teacherTenures: number[];
}) => number) | ((data: {
    qualifiedTeachers: number;
    totalTeachers: number;
}) => number) | ((data: {
    teacherDaysAbsent: number;
    totalPossibleDays: number;
}) => number) | ((data: {
    totalEnrolledStudents: number;
    totalTeachingStaffFTE: number;
}) => number) | ((data: {
    periodsWithSubstitutes: number;
    totalPeriods: number;
}) => number) | ((data: {
    counsellorSessions: number;
    monthsTracked: number;
    distinctStudentsCounselled: number;
    totalCounsellors: number;
}) => {
    averageSessionsPerMonth: number;
    caseload: number;
}) | ((data: {
    bullyingIncidents: {
        reportedDate: Date;
        resolvedDate?: Date | undefined;
    }[];
}) => number) | ((data: {
    absencesWithStressFlag: number;
    totalAbsences: number;
}) => number) | ((data: {
    studentsAttendingSEL: number;
    totalEnrolled: number;
}) => number) | ((data: {
    surveyResponses: number;
    totalInvited: number;
}) => number);
