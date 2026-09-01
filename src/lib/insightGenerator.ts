/**
 * Real Data-Driven Insight Generator
 * Analyzes extracted metrics and generates actionable insights
 * based on actual data vs benchmarks and national standards
 */

import { ParsedData } from './fileParser';
import { ALL_14_DIMENSIONS, calculateObjectiveScore } from './objectiveDataCalculator';
import { CORE_OPERATIONAL_METRICS, CHALLENGE_DATA_REQUIREMENTS, MetricRequirement } from './challengeDataRequirements';
import { METRIC_BAND_DEFINITIONS, scoreRawValueToWeight } from './challengeObjectiveScoring';

/**
 * Lookup of every one of the 34 real canonical Operational Metrics CSV
 * fields (4 Core Operational Levers + 30 challenge-specific fields across
 * all 15 challenges) to its display metadata, so the generic scoring path
 * below (see analyzeExtractedMetrics) can produce a real finding for
 * whichever fields were actually uploaded, for any of the 455 possible
 * 3-challenge combinations - not just the 12 legacy field names in
 * metricBenchmarks below.
 */
const ALL_CANONICAL_METRIC_DEFS: Record<string, MetricRequirement> = (() => {
  const map: Record<string, MetricRequirement> = {};
  CORE_OPERATIONAL_METRICS.forEach((m) => { map[m.fieldName] = m; });
  Object.values(CHALLENGE_DATA_REQUIREMENTS).forEach((req) => {
    req.requiredMetrics.forEach((m) => { map[m.fieldName] = m; });
  });
  return map;
})();

/** Render a raw metric value with its unit for display (e.g. "78%", "24 hours", "28"). */
function formatMetricValue(value: number, unit: string): string {
  if (unit === 'percentage') return `${value}%`;
  if (unit === 'number' || unit === 'ratio') return `${value}`;
  return `${value} ${unit}`;
}

/**
 * Derive a representative "acceptable" benchmark value for a
 * METRIC_BAND_DEFINITIONS field, from the band data itself: the raw-value
 * boundary at which the metric's own 1-10 severity weight crosses the same
 * "concern" threshold (>5) used by the Perception Gap Analysis. Returns
 * null if no such boundary exists (all bands the same side of the threshold).
 */
function getBenchmarkThreshold(fieldName: string): number | null {
  const def = METRIC_BAND_DEFINITIONS[fieldName];
  if (!def) return null;
  const acceptableBands = def.bands.filter((b) => b.weight <= 5 && isFinite(b.max));
  if (acceptableBands.length === 0) return null;
  return def.higherIsBetter
    ? acceptableBands[0].max
    : acceptableBands[acceptableBands.length - 1].max;
}

/**
 * Rank insights by severity: highest priority first, then by how far off
 * benchmark within the same priority. Used everywhere a report surfaces a
 * short "most urgent" list (Key Findings, Recommended Actions, and the
 * overall assessment headline) so they always agree with each other,
 * instead of each independently picking from the raw metrics-object
 * insertion order (which always puts the 4 Core Operational Levers first,
 * regardless of actual severity).
 */
function rankBySeverity(insights: RealInsight[]): RealInsight[] {
  const priorityRank: Record<RealInsight['priority'], number> = { high: 0, medium: 1, low: 2 };
  return [...insights].sort((a, b) => {
    const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
    if (byPriority !== 0) return byPriority;
    return b.gap - a.gap;
  });
}

function genericFinding(
  displayName: string,
  value: number,
  unit: string,
  status: 'exceeds' | 'meets' | 'below',
  weight: number
): string {
  const shown = formatMetricValue(value, unit);
  if (status === 'exceeds') {
    return `${displayName} is at ${shown} - a strong, healthy result (severity ${weight}/10).`;
  }
  if (status === 'meets') {
    return `${displayName} is at ${shown} - within an acceptable range but worth monitoring (severity ${weight}/10).`;
  }
  return `${displayName} is at ${shown} - a genuine concern flagged by the uploaded data (severity ${weight}/10).`;
}

function genericRecommendation(
  displayName: string,
  status: 'exceeds' | 'meets' | 'below',
  description: string
): string {
  if (status === 'exceeds') {
    return `${displayName} is performing well. Maintain current practices and document them as a replicable process.`;
  }
  if (status === 'meets') {
    return `${displayName} is acceptable but has room to improve. ${description}.`;
  }
  return `${displayName} needs attention: ${description}. Treat this as a priority area based on the uploaded operational data.`;
}

export interface RealInsight {
  metric: string;
  currentValue: number | string;
  benchmark: number;
  status: 'exceeds' | 'meets' | 'below';
  gap: number;
  finding: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  interpretation: 'maintain' | 'improve'; // NEW: How to interpret this score
}

export interface DataAnalysisResult {
  overallAssessment: string;
  keyFindings: string[];
  recommendations: string[];
  insights: RealInsight[];
  strongAreas: string[];
  concernAreas: string[];
  dataQuality: {
    metricsFound: number;
    metricsExpected: number;
    completeness: number;
    reliability: 'high' | 'medium' | 'low';
  };
}

/**
 * Generate real insights from extracted metrics
 */
export function generateRealInsights(parsedData: ParsedData): DataAnalysisResult {
  const insights: RealInsight[] = [];
  const keyFindings: string[] = [];
  const recommendations: string[] = [];
  const strongAreas: string[] = [];
  const concernAreas: string[] = [];

  // Analyze each extracted metric
  const metricAnalysis = analyzeExtractedMetrics(parsedData.extractedMetrics);

  insights.push(...metricAnalysis.insights);

  // Generate findings based on analysis
  keyFindings.push(...metricAnalysis.findings);

  // Generate specific recommendations
  recommendations.push(...metricAnalysis.actionItems);

  // Categorize areas
  metricAnalysis.insights.forEach((insight) => {
    if (insight.status === 'exceeds' || insight.status === 'meets') {
      strongAreas.push(`${insight.metric}: ${insight.currentValue} (Target: ${insight.benchmark})`);
    } else {
      concernAreas.push(`${insight.metric}: ${insight.currentValue} (Target: ${insight.benchmark}, Gap: ${Math.abs(insight.gap)})`);
    }
  });

  // Calculate data quality metrics
  const dataQuality = assessDataQuality(parsedData);

  // Generate overall assessment
  const overallAssessment = generateOverallAssessment(metricAnalysis, dataQuality);

  return {
    overallAssessment,
    keyFindings: keyFindings.slice(0, 5), // Top 5 findings
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    insights,
    strongAreas,
    concernAreas,
    dataQuality
  };
}

/**
 * Determine interpretation type based on score vs benchmark
 * NEW: When score > benchmark, recommend maintaining/complementing excellence
 * When score <= benchmark, recommend improvement
 */
export function getScoreInterpretation(score: number, benchmark: number): 'maintain' | 'improve' {
  return score > benchmark ? 'maintain' : 'improve';
}

/**
 * Generate recommendation message based on score vs benchmark
 * NEW: Different messaging for maintaining vs improving
 */
export function getScoreRecommendation(
  metric: string,
  score: number,
  benchmark: number,
  gap: number,
  status: 'exceeds' | 'meets' | 'below'
): string {
  if (score > benchmark) {
    // Score exceeds benchmark - recommend maintaining excellence
    return `${metric} is performing above national standards (+${gap} points). Focus on maintaining these excellent practices and documenting them as case studies for your institution.`;
  } else if (score === benchmark) {
    // Score meets benchmark - recommend monitoring
    return `${metric} meets national standards. Monitor consistently to ensure these standards are sustained across all areas.`;
  } else {
    // Score below benchmark - recommend improvement
    return `${metric} is ${Math.abs(gap)} points below national benchmark. Consider targeted interventions to improve performance in this area.`;
  }
}

/**
 * Analyze extracted metrics against benchmarks
 */
function analyzeExtractedMetrics(metrics: Record<string, number | string>) {
  const insights: RealInsight[] = [];

  // Map of metric keys to benchmark values and interpretations
  const metricBenchmarks: Record<string, { benchmark: number; name: string; interpretation: (val: number, bench: number) => string }> = {
    'board_exam_pass_rate': {
      benchmark: 80,
      name: 'Board Exam Pass Rate',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (gap >= 0) {
          return `Exceeding national benchmark by ${gap.toFixed(1)}% - strong academic performance`;
        } else {
          return `${Math.abs(gap).toFixed(1)}% below benchmark - requires focus on exam preparation`;
        }
      }
    },
    'avg_exam_score': {
      benchmark: 75,
      name: 'Average Exam Score',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (gap >= 0) {
          return `Students performing above average - focus on maintaining quality`;
        } else {
          return `${Math.abs(gap).toFixed(1)} points below target - intervention needed in core subjects`;
        }
      }
    },
    'curriculum_coverage': {
      benchmark: 90,
      name: 'Curriculum Coverage',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (val === 100) {
          return `Complete curriculum delivery - excellent planning and execution`;
        } else if (gap >= 0) {
          return `${val}% coverage meets expectations - ensure topic depth`;
        } else {
          return `${val}% coverage - ${Math.abs(gap).toFixed(1)}% shortfall detected, increase pace or extend timeline`;
        }
      }
    },
    'attendance_rate_pct': {
      benchmark: 85,
      name: 'Student Attendance Rate',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (gap >= 0) {
          return `Attendance at ${val}% - excellent engagement, maintain systems`;
        } else {
          return `Attendance ${val}% - ${Math.abs(gap).toFixed(1)}% below target, investigate absenteeism patterns`;
        }
      }
    },
    'fee_payment_rate_pct': {
      benchmark: 90,
      name: 'Fee Payment Rate',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (gap >= 0) {
          return `${val}% fee collection - strong financial health`;
        } else {
          return `${val}% collection rate - ${Math.abs(gap).toFixed(1)}% gap, implement recovery strategy`;
        }
      }
    },
    'certified_teachers_pct': {
      benchmark: 85,
      name: 'Certified Teachers',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (gap >= 0) {
          return `${val}% certified teachers - strong faculty quality`;
        } else {
          return `${val}% certified - focus on professional development and recruitment`;
        }
      }
    },
    'annual_training_hours': {
      benchmark: 25,
      name: 'Annual Training Hours per Teacher',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (gap >= 0) {
          return `${val} hours CPD per teacher - meets professional development requirements`;
        } else {
          return `${val} hours - ${Math.abs(gap).toFixed(1)} hours short of recommended ${bench}h annually`;
        }
      }
    },
    'students_per_classroom': {
      benchmark: 30,
      name: 'Student-Teacher Ratio',
      interpretation: (val, bench) => {
        const gap = bench - val; // Reversed: lower is better
        if (val <= 25) {
          return `${val} students per class - excellent class size for personalized attention`;
        } else if (val <= 35) {
          return `${val} students per class - acceptable but consider splitting larger sections`;
        } else {
          return `${val} students per class - overcrowded, affects learning quality`;
        }
      }
    },
    'parent_query_response_sla_hours': {
      benchmark: 24,
      name: 'Parent Query Response Time',
      interpretation: (val, bench) => {
        const gap = bench - val; // Reversed: lower is better
        if (val <= 12) {
          return `${val}h response time - excellent parent communication`;
        } else if (val <= 24) {
          return `${val}h response time - acceptable`;
        } else {
          return `${val}h response time - too slow, parents frustrated (target: ${bench}h)`;
        }
      }
    },
    'sqaaf_compliance_pct': {
      benchmark: 85,
      name: 'SQAAF Compliance',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (gap >= 0) {
          return `${val}% SQAAF compliant - strong governance`;
        } else {
          return `${val}% compliance - ${Math.abs(gap).toFixed(1)}% gap, audit findings need resolution`;
        }
      }
    },
    'budget_execution_pct': {
      benchmark: 90,
      name: 'Budget Execution Rate',
      interpretation: (val, bench) => {
        const gap = Math.abs(val - 95); // Ideal is ~95%, not 100%
        if (gap <= 5) {
          return `${val}% execution - efficient budget management`;
        } else {
          return `${val}% execution - consider adjusting budget allocations`;
        }
      }
    },
    'dropout_rate_pct': {
      benchmark: 5,
      name: 'Student Dropout Rate',
      interpretation: (val, bench) => {
        const gap = bench - val; // Reversed: lower is better
        if (val <= 2) {
          return `${val}% dropout - excellent student retention`;
        } else if (val <= 5) {
          return `${val}% dropout - acceptable but monitor at-risk students`;
        } else {
          return `${val}% dropout - concerning, implement intervention programs`;
        }
      }
    },
    'weekly_planning_hours': {
      benchmark: 5,
      name: 'Weekly Planning Time',
      interpretation: (val, bench) => {
        const gap = val - bench;
        if (gap >= 0) {
          return `${val}h/week planning time - meets recommended lesson-preparation time`;
        } else {
          return `${val}h/week - ${Math.abs(gap).toFixed(1)}h short of the recommended ${bench}h weekly planning time`;
        }
      }
    }
  };

  // Process each extracted metric
  Object.entries(metrics).forEach(([key, value]) => {
    const benchmarkInfo = metricBenchmarks[key];
    if (benchmarkInfo && typeof value === 'number') {
      const numValue = value;
      const benchmark = benchmarkInfo.benchmark;

      // Determine status
      let status: 'exceeds' | 'meets' | 'below';
      let gap: number;

      if (key.includes('dropout') || key.includes('ratio') || key.includes('sla')) {
        // For metrics where lower is better
        gap = benchmark - numValue;
        status = numValue <= benchmark * 0.9 ? 'exceeds' : numValue <= benchmark ? 'meets' : 'below';
      } else {
        // For metrics where higher is better
        gap = numValue - benchmark;
        status = numValue >= benchmark * 1.05 ? 'exceeds' : numValue >= benchmark * 0.95 ? 'meets' : 'below';
      }

      const interpretation = benchmarkInfo.interpretation(numValue, benchmark);
      const scoreInterpretation = getScoreInterpretation(numValue, benchmark);

      insights.push({
        metric: benchmarkInfo.name,
        currentValue: numValue,
        benchmark,
        status,
        gap: Math.abs(gap),
        finding: interpretation,
        recommendation: getScoreRecommendation(benchmarkInfo.name, numValue, benchmark, gap, status),
        priority: determinePriority(status),
        interpretation: scoreInterpretation
      });
      return;
    }

    // Generic path: any of the 30 real challenge-specific canonical fields
    // (see METRIC_BAND_DEFINITIONS in challengeObjectiveScoring.ts) that
    // aren't covered by the legacy metricBenchmarks map above. This is what
    // makes Key Findings/Recommended Actions actually react to whichever of
    // the 455 possible 3-challenge combinations was uploaded, instead of
    // only ever discussing the 3 fields that happen to overlap with the old
    // 12-field naming scheme.
    const def = ALL_CANONICAL_METRIC_DEFS[key];
    const weight = scoreRawValueToWeight(key, value as number | string);
    if (!def || weight === null) return; // unrecognized or non-numeric field - skip silently, never fabricate

    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    const bandDef = METRIC_BAND_DEFINITIONS[key];
    const benchmark = getBenchmarkThreshold(key);
    const status: 'exceeds' | 'meets' | 'below' = weight <= 2 ? 'exceeds' : weight <= 5 ? 'meets' : 'below';
    const gap = benchmark === null
      ? 0
      : (bandDef.higherIsBetter ? numValue - benchmark : benchmark - numValue);

    const finding = genericFinding(def.displayName, numValue, def.unit, status, weight);

    insights.push({
      metric: def.displayName,
      currentValue: numValue,
      benchmark: benchmark ?? numValue,
      status,
      gap: Math.abs(gap),
      finding,
      recommendation: genericRecommendation(def.displayName, status, def.description),
      priority: determinePriority(status),
      interpretation: status === 'exceeds' ? 'maintain' : 'improve'
    });
  });

  // Findings and action items are ranked by priority (and, within the same
  // priority, by how far off benchmark the metric is) rather than the raw
  // object key order metrics happened to be inserted in. Without this, the
  // 4 Core Operational Levers - always the first 4 keys in every uploaded
  // metrics object - permanently occupied 4 of the "Top 5" findings slots
  // for every one of the 455 possible challenge combinations, regardless of
  // severity, crowding out the challenge-specific metrics the school
  // actually selected these 3 worries to investigate.
  const ranked = rankBySeverity(insights);

  const findings = ranked.map((insight) => `${insight.metric}: ${insight.finding}`);
  const actionItems = ranked
    .filter((insight) => insight.priority === 'high' || insight.priority === 'medium')
    .map((insight) => insight.priority === 'high'
      ? `URGENT: ${insight.metric} - ${insight.recommendation}`
      : `Important: ${insight.metric} - ${insight.recommendation}`);

  return {
    insights,
    findings,
    actionItems
  };
}

/**
 * Generate specific recommendation for each metric
 */
function generateRecommendation(metricKey: string, currentValue: number, benchmark: number): string {
  const recommendations: Record<string, (val: number, bench: number) => string> = {
    'board_exam_pass_rate': (val, bench) =>
      val < bench ? 'Strengthen core subject teaching, conduct mock exams, provide targeted support' : 'Maintain quality, consider advanced tracks',
    'avg_exam_score': (val, bench) =>
      val < bench ? 'Implement peer tutoring, identify weak topics, increase practice tests' : 'Focus on maintaining standards while helping slower learners',
    'curriculum_coverage': (val, bench) =>
      val < 90 ? 'Accelerate pace, reduce extra activities, focus on critical topics' : 'Ensure depth over speed, integrate practical applications',
    'attendance_rate_pct': (val, bench) =>
      val < bench ? 'Investigate causes, contact absent students, implement reward programs' : 'Recognize and maintain high attendance culture',
    'fee_payment_rate_pct': (val, bench) =>
      val < bench ? 'Send reminders, establish payment plans, identify financial hardship cases' : 'Continue efficient collection, monitor arrears',
    'certified_teachers_pct': (val, bench) =>
      val < bench ? 'Sponsor certification programs, recruit qualified teachers' : 'Maintain standards through continuous training',
    'annual_training_hours': (val, bench) =>
      val < bench ? `Increase CPD budget, conduct 2-3 more training sessions, target ${bench - val}h additional hours` : 'Maintain current training programs',
    'students_per_classroom': (val, bench) =>
      val > 35 ? 'Consider multi-section classes, hire additional teachers' : 'Monitor class dynamics, ensure engagement',
    'parent_query_response_sla_hours': (val, bench) =>
      val > 24 ? 'Designate response team, create FAQ, improve communication channels' : 'Maintain systems, train staff on quick response',
    'sqaaf_compliance_pct': (val, bench) =>
      val < bench ? 'Address audit findings urgently, assign compliance officer' : 'Maintain compliance calendars, regular audits',
    'budget_execution_pct': (val, bench) =>
      val > 100 ? 'Review overspending, tighten controls' : 'Adjust budget forecasts, improve allocation',
    'dropout_rate_pct': (val, bench) =>
      val > 5 ? 'Launch retention program, identify at-risk students, provide counseling' : 'Continue current retention strategies'
  };

  return recommendations[metricKey]?.(currentValue, benchmark) || 'Monitor this metric and compare trends over time';
}

/**
 * Determine priority based on status
 */
function determinePriority(status: string): 'high' | 'medium' | 'low' {
  if (status === 'below') return 'high';
  if (status === 'meets') return 'medium';
  return 'low';
}

/**
 * Assess overall data quality
 */
function assessDataQuality(parsedData: ParsedData): DataAnalysisResult['dataQuality'] {
  const metricsFound = Object.keys(parsedData.extractedMetrics).length;
  // A complete First Opinion checkup always uploads exactly 4 Core
  // Operational Levers + 2 metrics per selected challenge x 3 challenges =
  // 10 canonical fields (see CORE_OPERATIONAL_METRICS / CHALLENGE_DATA_REQUIREMENTS).
  const metricsExpected = 10;
  const completeness = Math.round((metricsFound / metricsExpected) * 100);

  let reliability: 'high' | 'medium' | 'low';
  if (completeness >= 80) {
    reliability = 'high';
  } else if (completeness >= 50) {
    reliability = 'medium';
  } else {
    reliability = 'low';
  }

  return {
    metricsFound,
    metricsExpected,
    completeness,
    reliability
  };
}

/**
 * Generate overall assessment summary
 */
function generateOverallAssessment(
  analysis: { insights: RealInsight[] },
  dataQuality: DataAnalysisResult['dataQuality']
): string {
  const exceedingCount = analysis.insights.filter(i => i.status === 'exceeds').length;
  const belowCount = analysis.insights.filter(i => i.status === 'below').length;
  const totalInsights = analysis.insights.length;

  if (totalInsights === 0) {
    return 'Insufficient data for analysis. Upload operational data files for deeper insights.';
  }

  // Ranked the same way as Key Findings/Recommended Actions (priority, then
  // gap size) so the headline names the SAME top-priority metrics those
  // panels lead with, instead of independently picking the first 2 "below"
  // items in raw metrics-object order (which always meant the 4 Core
  // Operational Levers, never the challenge-specific metrics actually
  // driving the worst severity).
  const ranked = rankBySeverity(analysis.insights);

  if (belowCount > totalInsights / 2) {
    return `⚠️ Critical: ${belowCount} areas below target. Immediate action required on ${ranked.filter(i => i.status === 'below').map(i => i.metric).slice(0, 2).join(', ')}.`;
  }

  if (exceedingCount > totalInsights / 2) {
    return `✅ Strong Performance: ${exceedingCount} areas exceeding benchmarks. Focus on ${ranked.filter(i => i.status === 'below').map(i => i.metric).join(', ') || 'maintaining excellence'}.`;
  }

  return `⚖️ Balanced Profile: ${exceedingCount} areas strong, ${belowCount} areas needing attention. Strategic focus on identified gaps recommended.`;
}

export default {
  generateRealInsights,
  analyzeExtractedMetrics
};
