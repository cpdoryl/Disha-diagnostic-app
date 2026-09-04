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
  academic_performance: 80,
  curriculum_pedagogy: 75,
  teacher_quality: 78,
  student_wellbeing: 80,
  student_discipline: 75,
  infrastructure_facilities: 75,
  safety_security: 85,
  parent_engagement: 78,
  student_engagement: 75,
  leadership_governance: 75,
  financial_health: 70,
  admissions_market: 70,
  technology_digital: 72,
  cocurricular_holistic: 72,
};

interface DimensionLens {
  strength: string;
  risk: string;
  lever: string;
}

const DIMENSION_LENS: Record<string, DimensionLens> = {
  academic_performance: {
    strength: 'students are seen as genuinely learning and progressing against grade-level benchmarks',
    risk: 'academic results and learning depth are not seen as living up to the school\'s promise',
    lever: 'tightening formative assessment cycles, diagnostic testing, and targeted remedial support',
  },
  curriculum_pedagogy: {
    strength: 'teaching methods are seen as effective, engaging, and well-paced',
    risk: 'lessons are seen as lecture-heavy and not effectively engaging students',
    lever: 'expanding activity-based/project-based teaching and structured lesson observation',
  },
  teacher_quality: {
    strength: 'teachers are seen as well-qualified, stable, and genuinely improving their craft',
    risk: 'teacher retention, qualification, and continuity are seen as a weak spot',
    lever: 'investing in retention (mentorship, compensation benchmarking) and structured CPD',
  },
  student_wellbeing: {
    strength: 'students are seen as safe, supported, and cared for holistically',
    risk: 'student mental health and counselling support are seen as under-resourced',
    lever: 'expanding counselling capacity and formalizing SEL/wellbeing protocols',
  },
  student_discipline: {
    strength: 'discipline is seen as fair, consistent, and restorative rather than purely punitive',
    risk: 'discipline enforcement is seen as inconsistent or unfairly applied',
    lever: 'centralizing incident logging and running a consistency-of-enforcement audit',
  },
  infrastructure_facilities: {
    strength: 'facilities and learning resources are seen as well-maintained and adequate',
    risk: 'facilities and learning resources are seen as a visible gap in the day-to-day learning experience',
    lever: 'prioritizing facility upgrades and maintenance response time in the next budget cycle',
  },
  safety_security: {
    strength: 'campus and transport safety are seen as trustworthy and well-prepared',
    risk: 'campus security, drills, or transport safety are seen as a real concern',
    lever: 'closing CCTV coverage, drill compliance, and background-verification gaps immediately',
  },
  parent_engagement: {
    strength: 'parents are seen as genuinely engaged and satisfied partners',
    risk: 'parent communication and grievance handling are seen as thin or slow',
    lever: 'tightening the grievance-resolution SLA and building two-way communication channels',
  },
  student_engagement: {
    strength: 'students are seen as genuinely engaged and glad to be at school',
    risk: 'student sense of belonging and extracurricular access are seen as limited',
    lever: 'broadening extracurricular breadth and giving the student council real influence',
  },
  leadership_governance: {
    strength: 'school leadership and governance are seen as transparent, stable, and effective',
    risk: 'governance and decision-making are seen as inconsistent or opaque',
    lever: 'formalizing SMC minute-keeping, policy review cycles, and decision-tracking',
  },
  financial_health: {
    strength: 'the school\'s financial management is seen as transparent and sustainable',
    risk: 'financial transparency and sustainability are seen as unclear to stakeholders',
    lever: 'improving fee-process transparency and communicating financial planning to stakeholders',
  },
  admissions_market: {
    strength: 'the school is seen as growing, well-regarded, and a school families actively refer',
    risk: 'admissions momentum and brand reputation are seen as flat or declining',
    lever: 'tightening the admissions funnel and investing in alumni/referral engagement',
  },
  technology_digital: {
    strength: 'technology is seen as genuinely useful and reliably available for teaching and learning',
    risk: 'technology access or reliability is seen as a recurring frustration',
    lever: 'closing device-access gaps and speeding up IT-helpdesk resolution time',
  },
  cocurricular_holistic: {
    strength: 'co-curricular and holistic development opportunities are seen as genuine and accessible',
    risk: 'co-curricular opportunities are seen as an afterthought next to academics',
    lever: 'broadening co-curricular participation and better communicating achievements to parents',
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
    // Same +/-5 point margin used elsewhere in this report to classify a
    // perception-reality gap as "aligned" - reused here so "clearly above/
    // below benchmark" means the same thing everywhere in the app.
    const marginThreshold = 5;
    if (delta >= marginThreshold) {
      lines.push(
        `Because this clearly exceeds benchmark, a score in this range typically indicates ${lens.strength}. This reads as a genuine, evidenced strength rather than a gap to close - the priority is documenting what is working and sharing it as a best practice (with other dimensions, or with peer schools), while monitoring to sustain the current level.`
      );
    } else if (delta > -marginThreshold) {
      lines.push(
        index >= 60
          ? `This sits within the benchmark's normal range (neither clearly above nor below), and typically indicates ${lens.strength}. Performance here is on track with the target set for this dimension; ${lens.lever} would still be worth pursuing to move clearly ahead of benchmark rather than just meeting it.`
          : `This sits close to benchmark, but the benchmark itself is only a reference target, not a ceiling - a score in this range typically indicates ${lens.risk}. ${capitalize(lens.lever)} would raise both the absolute score and the margin above benchmark.`
      );
    } else {
      lines.push(
        index < 40
          ? `Because this sits clearly below benchmark and the absolute score is low, this usually warrants urgent attention - a score in this range typically indicates ${lens.risk}. ${capitalize(lens.lever)} is the priority this pattern points to.`
          : `Because this sits clearly below benchmark, a score in this range typically indicates ${lens.risk}. ${capitalize(lens.lever)} is the lever this pattern most directly points to for closing the gap.`
      );
    }
  }

  return lines;
}
