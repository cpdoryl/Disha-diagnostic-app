/**
 * Aggregates a locked 14D assessment event's raw responses into per-dimension
 * scores for the diagnostic report. Nothing else in the codebase computes
 * scores against FOURTEEN_DIMENSIONS / the assessments/{id}/responses shape,
 * so this is a fresh, minimal aggregation rather than a reuse of any
 * existing (differently-shaped) scoring system.
 */
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { FOURTEEN_DIMENSIONS } from '../data/14DimensionsQuestions';
import type { StakeholderType } from './multiUserAssessment';

const STAKEHOLDER_TYPES: StakeholderType[] = ['teacher', 'parent', 'student', 'admin', 'other'];

export interface DimensionScoreRow {
  dimensionId: string;
  dimensionName: string;
  average: number | null; // 1-5 scale
  index: number | null; // normalized 0-100 scale
  responseCount: number;
  byStakeholder: Partial<Record<StakeholderType, number | null>>;
}

export interface DiagnosticReportData {
  assessmentId: string;
  totalResponses: number;
  responsesByStakeholder: Record<StakeholderType, number>;
  overallAverage: number | null;
  overallIndex: number | null;
  dimensions: DimensionScoreRow[];
  generatedAt: Date;
}

function toIndex(average: number | null): number | null {
  if (average == null) return null;
  return Math.round(((average - 1) / 4) * 100);
}

export function getHealthStatus(index: number | null): { label: string; className: string } {
  if (index == null) return { label: 'No Data', className: 'bg-gray-100 text-gray-600' };
  if (index >= 80) return { label: 'Strong', className: 'bg-green-100 text-green-700' };
  if (index >= 60) return { label: 'Adequate', className: 'bg-blue-100 text-blue-700' };
  if (index >= 40) return { label: 'Needs Attention', className: 'bg-amber-100 text-amber-700' };
  return { label: 'At Risk', className: 'bg-red-100 text-red-700' };
}

export async function computeDiagnosticReport(assessmentId: string): Promise<DiagnosticReportData> {
  const responsesRef = collection(db, 'assessments', assessmentId, 'responses');
  const snapshot = await getDocs(responsesRef);

  const responsesByStakeholder: Record<StakeholderType, number> = {
    teacher: 0,
    parent: 0,
    student: 0,
    admin: 0,
    other: 0,
  };

  const dimSum: Record<string, number> = {};
  const dimCount: Record<string, number> = {};
  const dimStakeholderSum: Record<string, Partial<Record<StakeholderType, number>>> = {};
  const dimStakeholderCount: Record<string, Partial<Record<StakeholderType, number>>> = {};

  let overallSum = 0;
  let overallCount = 0;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const type = data.stakeholderType as StakeholderType;
    if (type in responsesByStakeholder) {
      responsesByStakeholder[type]++;
    }

    const answers = data.responses as Record<string, Record<string, number>> | undefined;
    if (!answers) return;

    for (const dimension of FOURTEEN_DIMENSIONS) {
      const dimensionAnswers = answers[dimension.id];
      if (!dimensionAnswers) continue;

      const scores = Object.values(dimensionAnswers).filter((v) => typeof v === 'number');
      if (scores.length === 0) continue;

      const responseDimensionAverage = scores.reduce((a, b) => a + b, 0) / scores.length;

      dimSum[dimension.id] = (dimSum[dimension.id] || 0) + responseDimensionAverage;
      dimCount[dimension.id] = (dimCount[dimension.id] || 0) + 1;

      if (STAKEHOLDER_TYPES.includes(type)) {
        dimStakeholderSum[dimension.id] = dimStakeholderSum[dimension.id] || {};
        dimStakeholderCount[dimension.id] = dimStakeholderCount[dimension.id] || {};
        dimStakeholderSum[dimension.id]![type] = (dimStakeholderSum[dimension.id]![type] || 0) + responseDimensionAverage;
        dimStakeholderCount[dimension.id]![type] = (dimStakeholderCount[dimension.id]![type] || 0) + 1;
      }

      overallSum += responseDimensionAverage;
      overallCount++;
    }
  });

  const dimensions: DimensionScoreRow[] = FOURTEEN_DIMENSIONS.map((dimension) => {
    const count = dimCount[dimension.id] || 0;
    const average = count > 0 ? dimSum[dimension.id] / count : null;

    const byStakeholder: Partial<Record<StakeholderType, number | null>> = {};
    for (const type of STAKEHOLDER_TYPES) {
      const typeCount = dimStakeholderCount[dimension.id]?.[type] || 0;
      byStakeholder[type] = typeCount > 0 ? dimStakeholderSum[dimension.id]![type]! / typeCount : null;
    }

    return {
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      average,
      index: toIndex(average),
      responseCount: count,
      byStakeholder,
    };
  });

  const overallAverage = overallCount > 0 ? overallSum / overallCount : null;

  return {
    assessmentId,
    totalResponses: snapshot.size,
    responsesByStakeholder,
    overallAverage,
    overallIndex: toIndex(overallAverage),
    dimensions,
    generatedAt: new Date(),
  };
}
