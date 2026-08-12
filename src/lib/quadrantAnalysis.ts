/**
 * 2x2 perception-vs-reality quadrant classification: Excellence,
 * Hidden Potential, Blind Spot, Crisis. Distinct from gapAnalyzer's
 * over/under/aligned classification, which only measures the *closeness*
 * of perception to reality - two dimensions can both be "aligned" by that
 * measure while one is aligned-and-thriving and the other is
 * aligned-and-failing. The quadrant here instead looks at the absolute
 * *level* of each score, so it can tell those two apart.
 *
 * Only dimensions with both a subjective index and a captured objective
 * score are classified - there is nothing to plot on a 2-axis quadrant
 * for a dimension missing one axis.
 */
import { DimensionReportCard } from './fullDiagnosticReport';

export type QuadrantId = 'excellence' | 'hidden_potential' | 'blind_spot' | 'crisis';

export interface QuadrantDefinition {
  id: QuadrantId;
  label: string;
  axisDescription: string;
  explanation: string;
}

export interface QuadrantEntry {
  dimensionId: string;
  dimensionName: string;
  subjectiveScore: number;
  objectiveScore: number;
  quadrant: QuadrantId;
}

export interface QuadrantAnalysisResult {
  threshold: number;
  eligibleCount: number;
  excludedCount: number;
  entries: QuadrantEntry[];
  byQuadrant: Record<QuadrantId, QuadrantEntry[]>;
  summary: string[];
}

/**
 * Split point for "high" vs "low" on both axes, on the shared 0-100 scale.
 * Set to 60 to match `getHealthStatus`'s own Adequate/Needs-Attention
 * boundary elsewhere in this app, so "high" here means the same thing as
 * "Adequate or better" everywhere else a score is shown.
 */
export const QUADRANT_THRESHOLD = 60;

export const QUADRANT_DEFINITIONS: Record<QuadrantId, QuadrantDefinition> = {
  excellence: {
    id: 'excellence',
    label: 'Excellence',
    axisDescription: `Perception >= ${QUADRANT_THRESHOLD} and reality >= ${QUADRANT_THRESHOLD}`,
    explanation:
      'Stakeholders rate this dimension highly, and the operational data backs that up - this is an evidenced strength, not just a perceived one. The data-simulated options in the dimension deep-dive above can still show what it would take to push further.',
  },
  hidden_potential: {
    id: 'hidden_potential',
    label: 'Hidden Potential',
    axisDescription: `Perception < ${QUADRANT_THRESHOLD} but reality >= ${QUADRANT_THRESHOLD}`,
    explanation:
      'The operational data shows solid performance here, but stakeholders are rating it lower than the data supports. The likely lever is visibility and communication of what is already being done well, not an operational change.',
  },
  blind_spot: {
    id: 'blind_spot',
    label: 'Blind Spot',
    axisDescription: `Perception >= ${QUADRANT_THRESHOLD} but reality < ${QUADRANT_THRESHOLD}`,
    explanation:
      'Stakeholders rate this dimension highly, but the operational data does not yet support that confidence. This is the highest-risk quadrant to leave unaddressed, since the gap between confidence and reality is not currently visible to anyone relying on perception alone.',
  },
  crisis: {
    id: 'crisis',
    label: 'Crisis',
    axisDescription: `Perception < ${QUADRANT_THRESHOLD} and reality < ${QUADRANT_THRESHOLD}`,
    explanation:
      'Both stakeholder perception and the operational data agree this dimension is underperforming. There is no visibility gap here - it is a genuine, mutually-recognized priority, and the actionable recommendations in the dimension deep-dive above are the most directly relevant starting point.',
  },
};

/** Shared display order for the four quadrants, used by both the on-screen report and the PDF export. */
export const QUADRANT_DISPLAY_ORDER: QuadrantId[] = ['excellence', 'hidden_potential', 'blind_spot', 'crisis'];

function classifyOne(subjectiveScore: number, objectiveScore: number): QuadrantId {
  const perceptionHigh = subjectiveScore >= QUADRANT_THRESHOLD;
  const realityHigh = objectiveScore >= QUADRANT_THRESHOLD;
  if (perceptionHigh && realityHigh) return 'excellence';
  if (perceptionHigh && !realityHigh) return 'blind_spot';
  if (!perceptionHigh && realityHigh) return 'hidden_potential';
  return 'crisis';
}

function buildQuadrantSummary(
  entries: QuadrantEntry[],
  byQuadrant: Record<QuadrantId, QuadrantEntry[]>,
  excludedCount: number
): string[] {
  const summary: string[] = [];

  if (entries.length === 0) {
    summary.push(
      `No dimension has both a survey score and captured operational data yet, so no dimension can be placed on the perception-reality quadrant. Capture operational data for at least one dimension to enable this analysis.`
    );
    return summary;
  }

  summary.push(
    `${entries.length} of 14 dimensions have both a survey score and captured operational data and are placed on the quadrant below (threshold: ${QUADRANT_THRESHOLD}/100 on each axis, matching the Adequate/Needs-Attention boundary used elsewhere in this report). ${excludedCount} dimension${excludedCount === 1 ? '' : 's'} lack one or both scores and are excluded until operational data is captured for them.`
  );

  const order: QuadrantId[] = ['blind_spot', 'crisis', 'hidden_potential', 'excellence'];
  for (const q of order) {
    const list = byQuadrant[q];
    if (list.length === 0) continue;
    const def = QUADRANT_DEFINITIONS[q];
    const names = list.map((e) => `${e.dimensionName} (perceived ${e.subjectiveScore}, data ${e.objectiveScore})`).join('; ');
    summary.push(`${def.label} (${list.length}): ${names}.`);
  }

  return summary;
}

export function classifyQuadrants(dimensionCards: DimensionReportCard[]): QuadrantAnalysisResult {
  const entries: QuadrantEntry[] = [];

  for (const card of dimensionCards) {
    if (!card.gap) continue;
    entries.push({
      dimensionId: card.dimensionId,
      dimensionName: card.dimensionName,
      subjectiveScore: card.gap.subjectiveScore,
      objectiveScore: card.gap.objectiveScore,
      quadrant: classifyOne(card.gap.subjectiveScore, card.gap.objectiveScore),
    });
  }

  const byQuadrant: Record<QuadrantId, QuadrantEntry[]> = {
    excellence: [],
    hidden_potential: [],
    blind_spot: [],
    crisis: [],
  };
  for (const entry of entries) byQuadrant[entry.quadrant].push(entry);

  const excludedCount = dimensionCards.length - entries.length;

  return {
    threshold: QUADRANT_THRESHOLD,
    eligibleCount: entries.length,
    excludedCount,
    entries,
    byQuadrant,
    summary: buildQuadrantSummary(entries, byQuadrant, excludedCount),
  };
}
