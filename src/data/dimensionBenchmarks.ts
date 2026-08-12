/**
 * Subjective-score benchmarks and plain-language interpretation for each of
 * the 14 live dimensions. Benchmarks are illustrative sector targets (0-100
 * index scale, same scale `dimensionScoring.ts` produces), not sourced from
 * an external dataset.
 */
import { getHealthStatus } from '../lib/dimensionScoring';
import { BenchmarkDatasetMeta } from './benchmarkMeta';

/**
 * Honest disclosure of what these benchmark numbers actually are: reference
 * targets set by the DISHA team, not (yet) derived from an aggregated
 * national survey of assessed schools. Update `version`/`lastUpdated`
 * whenever the SUBJECTIVE_INDEX_BENCHMARKS values below are revised.
 */
export const SUBJECTIVE_BENCHMARK_DATASET_META: BenchmarkDatasetMeta = {
  version: 'v1.0',
  methodology:
    'Illustrative sector-reference targets set by the DISHA team as improvement goals for each dimension - not yet derived from an aggregated multi-school survey dataset. Intended to be recalibrated against real cross-school data as more schools complete assessments on this platform.',
  lastUpdated: '2026-08-12',
};

export const SUBJECTIVE_INDEX_BENCHMARKS: Record<string, number> = {
  leadership: 75,
  academic: 80,
  infrastructure: 75,
  student_wellbeing: 80,
  staff_development: 75,
  community: 70,
  innovation: 65,
  finance: 75,
  quality: 80,
  inclusivity: 70,
  curriculum: 78,
  satisfaction: 75,
  performance: 72,
  culture: 75,
};

interface DimensionLens {
  strength: string;
  risk: string;
  lever: string;
}

const DIMENSION_LENS: Record<string, DimensionLens> = {
  leadership: {
    strength: 'governance and decision-making are seen as clear, transparent, and accountable',
    risk: 'governance and decision-making are seen as inconsistent rather than a clear source of institutional direction',
    lever: 'strengthening transparent, data-driven decision cycles and visible accountability tracking',
  },
  academic: {
    strength: 'teaching quality and learning outcomes are seen as a genuine strength',
    risk: 'teaching quality and learning outcomes are not seen as living up to the school\'s academic promise',
    lever: 'tightening curriculum delivery, assessment feedback loops, and targeted academic support',
  },
  infrastructure: {
    strength: 'facilities and learning resources are seen as well-maintained and adequate',
    risk: 'facilities and learning resources are seen as a visible gap in the day-to-day learning experience',
    lever: 'prioritizing facility upgrades and resource availability in the next budget cycle',
  },
  student_wellbeing: {
    strength: 'students are seen as safe, supported, and cared for holistically',
    risk: 'student safety, counseling, and holistic support are seen as under-resourced',
    lever: 'expanding counseling capacity and formalizing safety/wellbeing protocols',
  },
  staff_development: {
    strength: 'teachers are seen as well-supported, trained, and engaged',
    risk: 'teacher development and morale are seen as neglected',
    lever: 'investing in structured professional development and transparent performance support',
  },
  community: {
    strength: 'parents and the community are seen as genuinely engaged partners',
    risk: 'parent and community engagement is seen as thin or one-directional',
    lever: 'building regular, two-way communication channels and community touchpoints',
  },
  innovation: {
    strength: 'technology and innovative practice are seen as embedded in daily learning',
    risk: 'technology adoption and innovation are seen as lagging',
    lever: 'accelerating classroom technology integration and piloting new teaching methods',
  },
  finance: {
    strength: 'financial management is seen as transparent and well-governed',
    risk: 'financial transparency and planning are seen as unclear to stakeholders',
    lever: 'improving budget transparency and communicating financial planning to stakeholders',
  },
  quality: {
    strength: 'quality assurance and compliance are seen as rigorous and well-tracked',
    risk: 'quality assurance and regulatory compliance are seen as inconsistent',
    lever: 'formalizing internal audit cycles and closing compliance gaps proactively',
  },
  inclusivity: {
    strength: 'the school is seen as genuinely inclusive across backgrounds and needs',
    risk: 'inclusivity and support for diverse learners are seen as insufficient',
    lever: 'expanding targeted support programs and inclusion practices',
  },
  curriculum: {
    strength: 'the curriculum is seen as well-rounded and outcome-focused',
    risk: 'the curriculum is seen as narrow or misaligned with stated learning outcomes',
    lever: 'broadening experiential/interdisciplinary learning and tightening outcome tracking',
  },
  satisfaction: {
    strength: 'stakeholders are seen as genuinely satisfied and proud of the school',
    risk: 'stakeholder satisfaction and reputation are seen as fragile',
    lever: 'closing the loop on feedback and visibly acting on stakeholder concerns',
  },
  performance: {
    strength: 'performance management and accountability are seen as fair and consistent',
    risk: 'performance evaluation and accountability are seen as unclear or inconsistently applied',
    lever: 'standardizing appraisal cycles and making recognition/accountability more visible',
  },
  culture: {
    strength: 'organizational culture is seen as strong, collaborative, and values-driven',
    risk: 'organizational culture is seen as weak or misaligned with stated values',
    lever: 'reinforcing shared values through visible leadership modeling and team practices',
  },
};

export function getSubjectiveBenchmark(dimensionId: string): number {
  return SUBJECTIVE_INDEX_BENCHMARKS[dimensionId] ?? 75;
}

const STAKEHOLDER_LABELS: Record<string, string> = {
  teacher: 'Teachers',
  parent: 'Parents/Guardians',
  student: 'Students',
  admin: 'Admin Staff',
  other: 'Other',
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Builds a multi-paragraph, data-grounded detailed analysis for a
 * dimension's subjective (survey) score: the headline number with the exact
 * calculation behind it, a stakeholder-group breakdown when more than one
 * group responded (so the aggregate isn't presented as if it were uniform),
 * and a pattern-based reading of what that score range typically indicates -
 * framed as "this pattern typically indicates", not a flat verdict.
 */
export function buildDetailedAnalysis(
  dimensionId: string,
  dimensionName: string,
  index: number | null,
  average: number | null,
  responseCount: number,
  byStakeholder: Partial<Record<string, number | null>>
): string[] {
  if (index == null) {
    return [`No survey responses have been recorded yet for ${dimensionName}, so no detailed analysis can be generated.`];
  }

  const benchmark = getSubjectiveBenchmark(dimensionId);
  const status = getHealthStatus(index);
  const lens = DIMENSION_LENS[dimensionId];
  const delta = index - benchmark;
  const deltaText =
    delta === 0
      ? `exactly at the ${benchmark} benchmark set for this dimension`
      : delta > 0
        ? `${delta} point${delta === 1 ? '' : 's'} above the ${benchmark} benchmark set for this dimension`
        : `${Math.abs(delta)} point${Math.abs(delta) === 1 ? '' : 's'} below the ${benchmark} benchmark set for this dimension`;

  const lines: string[] = [];

  lines.push(
    `${dimensionName} scores ${index}/100 (${status.label}) from ${responseCount} respondent${responseCount === 1 ? '' : 's'}, ${deltaText}. This index is calculated by averaging each respondent's 1-5 Likert ratings across this dimension's questions to a group average of ${average != null ? average.toFixed(2) : 'N/A'}/5, then rescaling that average onto a 0-100 index (1 = 0, 5 = 100) so it can be compared directly against the benchmark.`
  );

  const stakeholderEntries = Object.entries(byStakeholder).filter(
    (entry): entry is [string, number] => entry[1] != null
  );
  if (stakeholderEntries.length >= 2) {
    const sorted = [...stakeholderEntries].sort((a, b) => b[1] - a[1]);
    const [highKey, highVal] = sorted[0];
    const [lowKey, lowVal] = sorted[sorted.length - 1];
    const spread = highVal - lowVal;
    const breakdown = sorted.map(([key, val]) => `${STAKEHOLDER_LABELS[key] || key} ${val.toFixed(2)}/5`).join(', ');
    lines.push(
      spread >= 1
        ? `Breakdown by stakeholder group: ${breakdown}. There is a notable ${spread.toFixed(2)}-point spread between ${STAKEHOLDER_LABELS[highKey] || highKey} (highest) and ${STAKEHOLDER_LABELS[lowKey] || lowKey} (lowest) - this dimension is not perceived uniformly, and the single aggregate score above may be masking a real difference in experience between groups worth investigating on its own.`
        : `Breakdown by stakeholder group: ${breakdown}. The spread between the highest- and lowest-rating groups is small (${spread.toFixed(2)} points), indicating fairly consistent perception across stakeholder groups.`
    );
  }

  if (lens) {
    if (index >= 80) {
      lines.push(`A score in this range typically indicates ${lens.strength}. Continuing current practices and monitoring to sustain this level is the reasonable path here.`);
    } else if (index >= 60) {
      lines.push(
        `A score in this range typically indicates ${lens.strength}, though there is room to close the gap to benchmark further. ${capitalize(lens.lever)} is a plausible next step suggested by this pattern.`
      );
    } else if (index >= 40) {
      lines.push(
        `A score in this range typically indicates ${lens.risk}. ${capitalize(lens.lever)} is the lever this pattern most directly points to for closing the gap.`
      );
    } else {
      lines.push(
        `A score in this range typically indicates ${lens.risk}, and scores this low usually warrant urgent attention. ${capitalize(lens.lever)} is the priority this pattern points to.`
      );
    }
  }

  return lines;
}
