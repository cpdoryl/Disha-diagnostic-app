/**
 * Subjective-score benchmarks and plain-language interpretation for each of
 * the 14 live dimensions. Benchmarks are illustrative sector targets (0-100
 * index scale, same scale `dimensionScoring.ts` produces), not sourced from
 * an external dataset.
 */
import { getHealthStatus } from '../lib/dimensionScoring';

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

/**
 * Composes dimension-specific interpretation prose from the status bucket
 * (via `getHealthStatus`) plus this dimension's strength/risk framing and
 * its numeric gap to benchmark.
 */
export function generateSubjectiveInterpretation(
  dimensionId: string,
  dimensionName: string,
  index: number | null
): string {
  if (index == null) {
    return `No survey responses have been recorded yet for ${dimensionName}, so no interpretation can be generated.`;
  }

  const benchmark = getSubjectiveBenchmark(dimensionId);
  const status = getHealthStatus(index);
  const lens = DIMENSION_LENS[dimensionId];
  const delta = index - benchmark;
  const deltaText =
    delta === 0
      ? `exactly at the ${benchmark} benchmark for this dimension`
      : delta > 0
        ? `${delta} point${delta === 1 ? '' : 's'} above the ${benchmark} benchmark for this dimension`
        : `${Math.abs(delta)} point${Math.abs(delta) === 1 ? '' : 's'} below the ${benchmark} benchmark for this dimension`;

  const base = `${dimensionName} is scoring ${index}/100 (${status.label}), ${deltaText}.`;

  if (!lens) {
    return base;
  }

  if (index >= 80) {
    return `${base} Stakeholders feel ${lens.strength}. Continue current practices and monitor to sustain this level.`;
  }
  if (index >= 60) {
    return `${base} Stakeholders feel ${lens.strength}, though there is room to close the gap further. Focus on ${lens.lever}.`;
  }
  if (index >= 40) {
    return `${base} Stakeholders feel ${lens.risk}. Focus on ${lens.lever} is the fastest lever to close this gap.`;
  }
  return `${base} Stakeholders feel ${lens.risk}, and this dimension needs urgent attention. Prioritize ${lens.lever}.`;
}
