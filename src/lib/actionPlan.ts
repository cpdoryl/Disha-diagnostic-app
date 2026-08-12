/**
 * 30-60-90 day action plan with a suggested responsibility matrix.
 *
 * Timeframe placement is deterministic and derived entirely from data
 * already computed elsewhere in the report (subjective status label and
 * quadrant classification) - never a fabricated judgment call - and the
 * action text for each item reuses the highest-impact data-simulated
 * option already computed in `card.actionablePoints` when one exists,
 * rather than inventing new recommendations.
 *
 * The owner-role-per-dimension mapping is a generic, editable default
 * (Principal / Academic Head / etc.) - the app has no data model for real
 * staff names or roles, so this is disclosed as a suggested starting
 * point for the school to fill in with actual names, not a claim about
 * who is actually responsible.
 */
import { DimensionReportCard } from './fullDiagnosticReport';
import { QuadrantAnalysisResult, QuadrantId } from './quadrantAnalysis';

export type ActionTimeframe = '30' | '60' | '90';

export const TIMEFRAME_LABELS: Record<ActionTimeframe, string> = {
  '30': 'Next 30 Days',
  '60': 'Next 60 Days',
  '90': 'Next 90 Days',
};

export interface ActionPlanItem {
  dimensionId: string;
  dimensionName: string;
  timeframe: ActionTimeframe;
  priorityReason: string;
  action: string;
  ownerRole: string;
}

export interface ActionPlanResult {
  items: ActionPlanItem[];
  byTimeframe: Record<ActionTimeframe, ActionPlanItem[]>;
  byOwnerRole: Record<string, ActionPlanItem[]>;
  roleDisclosure: string;
}

const DIMENSION_OWNER_ROLES: Record<string, string> = {
  leadership: 'Principal / Head of School',
  academic: 'Academic Head / HOD',
  infrastructure: 'Administrative Officer / Facilities Manager',
  student_wellbeing: 'Counselor / Student Wellbeing Coordinator',
  staff_development: 'HR Head / Principal',
  community: 'Community Relations Coordinator',
  innovation: 'IT Coordinator / Innovation Lead',
  finance: 'Finance Head / Accounts Manager',
  quality: 'Vice Principal / Quality Assurance Officer',
  inclusivity: 'Inclusion Coordinator',
  curriculum: 'Curriculum Coordinator / Academic Head',
  satisfaction: 'Principal / Parent Relations Officer',
  performance: 'HR Head / Vice Principal',
  culture: 'Principal / Leadership Team',
};

export const ROLE_DISCLOSURE =
  'Owner roles below are a generic suggested starting point based on typical school org structure, not a record of actual staff assignments - this app has no data on your real staff names or roles. Replace these with the actual responsible person before distributing this plan.';

function getOwnerRole(dimensionId: string): string {
  return DIMENSION_OWNER_ROLES[dimensionId] ?? 'School Leadership Team';
}

function determineTimeframe(
  card: DimensionReportCard,
  quadrant: QuadrantId | null
): { timeframe: ActionTimeframe; reason: string } {
  const status = card.subjective.status.label;
  const index = card.subjective.index;

  if (status === 'At Risk') {
    return { timeframe: '30', reason: `subjective status is At Risk (${index}/100)` };
  }
  if (quadrant === 'crisis') {
    return {
      timeframe: '30',
      reason: `this dimension falls in the Crisis quadrant, where both perception and operational data agree it is underperforming`,
    };
  }
  if (status === 'Needs Attention') {
    return { timeframe: '60', reason: `subjective status is Needs Attention (${index}/100)` };
  }
  if (quadrant === 'blind_spot') {
    return {
      timeframe: '60',
      reason: `this dimension falls in the Blind Spot quadrant - stakeholders rate it highly but the operational data does not yet support that confidence`,
    };
  }
  if (status === 'No Data') {
    return { timeframe: '90', reason: `no survey responses have been recorded yet for this dimension, so it cannot yet be prioritized with data` };
  }
  if (quadrant === 'hidden_potential') {
    return {
      timeframe: '90',
      reason: `this dimension falls in the Hidden Potential quadrant - the data supports it, but stakeholder perception is lower, making this a visibility/communication opportunity rather than an operational fix`,
    };
  }
  if (quadrant === 'excellence' || status === 'Strong') {
    return { timeframe: '90', reason: `this dimension is already Strong/Excellence - the plan here is to sustain and monitor, not to fix` };
  }
  return { timeframe: '90', reason: `subjective status is Adequate (${index}/100) with no urgent trigger from status or quadrant - a longer-horizon item` };
}

function buildAction(card: DimensionReportCard, quadrant: QuadrantId | null): string {
  const topOption = card.actionablePoints.find((line) => line.startsWith('Option:'));
  if (topOption) {
    return topOption.replace(/^Option:\s*/, '');
  }

  const status = card.subjective.status.label;
  const index = card.subjective.index;

  if (status === 'No Data') {
    return `Deploy the survey to gather stakeholder perception for ${card.dimensionName} - no responses have been recorded yet, so no action can be prioritized with data.`;
  }
  if (!card.objective) {
    return `Capture operational data for ${card.dimensionName} to enable a data-grounded action plan; currently only stakeholder perception (${index}/100) is available.`;
  }
  if (quadrant === 'hidden_potential' && card.gap) {
    return `Share the operational data behind ${card.dimensionName} with stakeholders directly - the data shows ${card.gap.objectiveScore}/100 but perception sits at ${card.gap.subjectiveScore}/100.`;
  }
  if (quadrant === 'blind_spot' && card.gap) {
    return `Close the gap between perceived confidence (${card.gap.subjectiveScore}/100) and operational reality (${card.gap.objectiveScore}/100) in ${card.dimensionName} before further promoting it - all captured metrics already meet or exceed benchmark, so continued monitoring plus targeted communication is the main lever here.`;
  }
  return `Maintain current practices in ${card.dimensionName} (${index}/100, all captured metrics at or above benchmark) and monitor periodically to sustain this level.`;
}

export function buildActionPlan(
  dimensionCards: DimensionReportCard[],
  quadrantAnalysis: QuadrantAnalysisResult
): ActionPlanResult {
  const quadrantByDim = new Map(quadrantAnalysis.entries.map((e) => [e.dimensionId, e.quadrant]));

  const items: ActionPlanItem[] = dimensionCards.map((card) => {
    const quadrant = quadrantByDim.get(card.dimensionId) ?? null;
    const { timeframe, reason } = determineTimeframe(card, quadrant);
    return {
      dimensionId: card.dimensionId,
      dimensionName: card.dimensionName,
      timeframe,
      priorityReason: reason,
      action: buildAction(card, quadrant),
      ownerRole: getOwnerRole(card.dimensionId),
    };
  });

  const timeframeSeverity: Record<ActionTimeframe, number> = { '30': 0, '60': 1, '90': 2 };
  items.sort((a, b) => {
    const bucketDiff = timeframeSeverity[a.timeframe] - timeframeSeverity[b.timeframe];
    if (bucketDiff !== 0) return bucketDiff;
    const aIndex = dimensionCards.find((c) => c.dimensionId === a.dimensionId)?.subjective.index ?? 100;
    const bIndex = dimensionCards.find((c) => c.dimensionId === b.dimensionId)?.subjective.index ?? 100;
    return aIndex - bIndex;
  });

  const byTimeframe: Record<ActionTimeframe, ActionPlanItem[]> = { '30': [], '60': [], '90': [] };
  const byOwnerRole: Record<string, ActionPlanItem[]> = {};
  for (const item of items) {
    byTimeframe[item.timeframe].push(item);
    if (!byOwnerRole[item.ownerRole]) byOwnerRole[item.ownerRole] = [];
    byOwnerRole[item.ownerRole].push(item);
  }

  return { items, byTimeframe, byOwnerRole, roleDisclosure: ROLE_DISCLOSURE };
}
