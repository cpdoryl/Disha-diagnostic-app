/**
 * Gap Analyzer
 * Compares subjective assessment data with objective operational metrics
 * Identifies perception-reality gaps and insight patterns
 */

import { DimensionObjectiveScore } from './objectiveMetricsCalculator';

export interface PerceptionRealityGap {
  dimensionId: string;
  dimensionName: string;
  subjectiveScore: number; // From multi-stakeholder assessment
  objectiveScore: number; // From operational data
  gap: number; // Subjective - Objective
  gapPercentage: number; // Gap as % of objective
  interpretation: 'overestimation' | 'underestimation' | 'alignment';
  insight: string;
  actionability: 'high' | 'medium' | 'low';
  recommendation: string;
  dataQuality: {
    subjectiveConfidence: number;
    objectiveConfidence: number;
    overallConfidence: number;
  };
}

export interface GapAnalysisResult {
  schoolName: string;
  analysisDate: Date;
  totalGaps: PerceptionRealityGap[];
  summary: {
    overestimatedDimensions: PerceptionRealityGap[];
    underestimatedDimensions: PerceptionRealityGap[];
    alignedDimensions: PerceptionRealityGap[];
    averageGap: number;
  };
  insights: string[];
  recommendations: string[];
  dataQuality: {
    subjectiveDataCompleteness: number;
    objectiveDataCompleteness: number;
    analysisReliability: 'high' | 'medium' | 'low';
  };
}

/**
 * Analyze perception-reality gaps
 */
export function analyzeGaps(
  subjectiveDimensions: Array<{ id: string; name: string; score: number }>,
  objectiveScores: DimensionObjectiveScore[],
  schoolName: string = 'School'
): GapAnalysisResult {
  const totalGaps: PerceptionRealityGap[] = [];
  let subjectiveCompleteness = 0;
  let objectiveCompleteness = 0;

  // Calculate gaps for each dimension
  subjectiveDimensions.forEach(subjDim => {
    const objData = objectiveScores.find(obj => obj.dimensionId === subjDim.id);

    if (objData) {
      const gap = subjDim.score - objData.objectiveScore;
      const gapPercentage = (gap / objData.objectiveScore) * 100;

      // Determine interpretation
      let interpretation: 'overestimation' | 'underestimation' | 'alignment';
      if (Math.abs(gap) <= 5) {
        interpretation = 'alignment';
      } else if (gap > 5) {
        interpretation = 'overestimation';
      } else {
        interpretation = 'underestimation';
      }

      // Generate insight based on gap pattern
      const insight = generateGapInsight(subjDim.name, gap, interpretation, subjDim.score, objData.objectiveScore);
      const recommendation = generateGapRecommendation(subjDim.name, interpretation, gap, subjDim.score, objData.objectiveScore);
      const actionability = determineActionability(Math.abs(gap), interpretation);

      totalGaps.push({
        dimensionId: subjDim.id,
        dimensionName: subjDim.name,
        subjectiveScore: subjDim.score,
        objectiveScore: objData.objectiveScore,
        gap,
        gapPercentage: Math.round(gapPercentage * 100) / 100,
        interpretation,
        insight,
        actionability,
        recommendation,
        dataQuality: {
          subjectiveConfidence: 90, // From assessment
          objectiveConfidence: objData.confidence,
          overallConfidence: (90 + objData.confidence) / 2,
        },
      });

      objectiveCompleteness += 1;
    }

    subjectiveCompleteness += 1;
  });

  // Categorize gaps
  const overestimated = totalGaps.filter(g => g.interpretation === 'overestimation');
  const underestimated = totalGaps.filter(g => g.interpretation === 'underestimation');
  const aligned = totalGaps.filter(g => g.interpretation === 'alignment');

  // Calculate average gap
  const avgGap =
    totalGaps.length > 0
      ? Math.round(
          (totalGaps.reduce((sum, g) => sum + Math.abs(g.gap), 0) / totalGaps.length) * 100
        ) / 100
      : 0;

  // Generate overall insights
  const insights = generateOverallInsights(overestimated, underestimated, aligned);
  const recommendations = generateOverallRecommendations(overestimated, underestimated, aligned);

  // Determine data quality
  const analysisReliability = determineReliability(objectiveCompleteness, subjectiveCompleteness);

  return {
    schoolName,
    analysisDate: new Date(),
    totalGaps,
    summary: {
      overestimatedDimensions: overestimated,
      underestimatedDimensions: underestimated,
      alignedDimensions: aligned,
      averageGap: avgGap,
    },
    insights,
    recommendations,
    dataQuality: {
      subjectiveDataCompleteness: Math.round((subjectiveCompleteness / 14) * 100),
      objectiveDataCompleteness: Math.round((objectiveCompleteness / 14) * 100),
      analysisReliability,
    },
  };
}

/**
 * Generate insight for a specific gap
 */
function generateGapInsight(
  dimensionName: string,
  gap: number,
  interpretation: 'overestimation' | 'underestimation' | 'alignment',
  subjScore: number,
  objScore: number
): string {
  if (interpretation === 'alignment') {
    return `${dimensionName} perception aligns with operational reality (subjective: ${subjScore}, objective: ${objScore})`;
  } else if (interpretation === 'overestimation') {
    return `Stakeholders rate ${dimensionName} higher (${subjScore}) than objective data suggests (${objScore}). This could indicate strong communication or optimism bias.`;
  } else {
    return `Stakeholders rate ${dimensionName} lower (${subjScore}) than objective data shows (${objScore}). This indicates undervalued strength or awareness gap.`;
  }
}

/**
 * Generate actionable recommendation based on gap
 */
function generateGapRecommendation(
  dimensionName: string,
  interpretation: 'overestimation' | 'underestimation' | 'alignment',
  gap: number,
  subjScore: number,
  objScore: number
): string {
  if (interpretation === 'alignment') {
    if (subjScore < 70) {
      return `Both perception and reality show ${dimensionName} needs improvement. Prioritize targeted interventions with clear metrics tracking.`;
    } else {
      return `Continue current practices in ${dimensionName} - both perception and performance are strong. Monitor to maintain excellence.`;
    }
  } else if (interpretation === 'overestimation') {
    return `${dimensionName} is overestimated by stakeholders. Realign expectations through transparent communication of actual metrics and improvement plans.`;
  } else {
    return `${dimensionName} is undervalued. Increase visibility of achievements - document and communicate actual performance metrics to stakeholders.`;
  }
}

/**
 * Determine if gap is actionable
 */
function determineActionability(
  gapSize: number,
  interpretation: 'overestimation' | 'underestimation' | 'alignment'
): 'high' | 'medium' | 'low' {
  if (gapSize <= 5) return 'low'; // Minor gap
  if (gapSize <= 15) return 'medium'; // Moderate gap
  return 'high'; // Large gap requiring action
}

/**
 * Generate overall insights from gap patterns
 */
function generateOverallInsights(
  overestimated: PerceptionRealityGap[],
  underestimated: PerceptionRealityGap[],
  aligned: PerceptionRealityGap[]
): string[] {
  const insights: string[] = [];

  // Pattern 1: Many overestimations
  if (overestimated.length > aligned.length) {
    insights.push(
      `⚠️ Perception Gap Detected: Stakeholders have higher perception (${overestimated.length} dimensions) than objective data suggests. ` +
        `This indicates potential optimism bias or strong marketing success. Manage expectations to ensure credibility.`
    );
  }

  // Pattern 2: Many underestimations
  if (underestimated.length > aligned.length) {
    insights.push(
      `💡 Marketing Opportunity: Your school is undervalued (${underestimated.length} dimensions underestimated). ` +
        `Strong objective performance isn't being recognized by stakeholders. Increase communication of achievements.`
    );
  }

  // Pattern 3: Good alignment
  if (aligned.length >= 8) {
    insights.push(
      `✓ Strong Alignment: Perception aligns well with operational reality across most dimensions. ` +
        `This indicates transparent communication and realistic stakeholder understanding.`
    );
  }

  // Pattern 4: Academic overestimation
  const academicOverest = overestimated.filter(g => g.dimensionName.includes('Academic'));
  if (academicOverest.length >= 2) {
    insights.push(
      `📚 Academic Expectations Gap: Stakeholders perceive academic excellence higher than metrics show. ` +
        `Conduct deeper analysis of actual vs perceived competency areas.`
    );
  }

  // Pattern 5: Welfare underestimation
  const welfareUnderest = underestimated.filter(g =>
    ['Welfare', 'Wellbeing', 'Infrastructure'].some(w => g.dimensionName.includes(w))
  );
  if (welfareUnderest.length >= 2) {
    insights.push(
      `🏢 Infrastructure Undervaluation: Actual welfare and infrastructure investments aren't being recognized. ` +
        `Increase student/parent tours and facility showcasing.`
    );
  }

  return insights;
}

/**
 * Generate overall recommendations
 */
function generateOverallRecommendations(
  overestimated: PerceptionRealityGap[],
  underestimated: PerceptionRealityGap[],
  aligned: PerceptionRealityGap[]
): string[] {
  const recommendations: string[] = [];

  // For overestimated areas
  if (overestimated.length > 0) {
    const topOverest = overestimated.sort((a, b) => b.gap - a.gap)[0];
    recommendations.push(
      `Priority 1: Address overestimation in ${topOverest.dimensionName}. ` +
        `Set realistic targets and track objective metrics to align perception with reality.`
    );
  }

  // For underestimated areas
  if (underestimated.length > 0) {
    const topUnderest = underestimated.sort((a, b) => b.gap - a.gap)[0];
    recommendations.push(
      `Priority 2: Highlight undervalued strengths in ${topUnderest.dimensionName}. ` +
        `Create case studies and testimonials documenting actual achievements.`
    );
  }

  // For low-performing areas (both subjective and objective low)
  const lowPerforming = overestimated
    .concat(underestimated)
    .filter(g => g.subjectiveScore < 60 && g.objectiveScore < 60);

  if (lowPerforming.length > 0) {
    const topLow = lowPerforming[0];
    recommendations.push(
      `Critical: ${topLow.dimensionName} is weak in both perception and reality (Score: ${topLow.objectiveScore}/100). ` +
        `Develop comprehensive improvement plan with quarterly milestones.`
    );
  }

  // Data quality recommendation
  if (underestimated.length + overestimated.length > 5) {
    recommendations.push(
      `Invest in transparent communication: Large perception gaps exist. Conduct quarterly stakeholder forums ` +
        `to share objective performance data and gather feedback.`
    );
  }

  return recommendations;
}

/**
 * Determine analysis reliability
 */
function determineReliability(
  objectiveDataCount: number,
  subjectiveDataCount: number
): 'high' | 'medium' | 'low' {
  if (objectiveDataCount >= 12 && subjectiveDataCount >= 14) return 'high';
  if (objectiveDataCount >= 8 && subjectiveDataCount >= 12) return 'medium';
  return 'low';
}

/**
 * Get top gaps to focus on (sorted by actionability)
 */
export function getTopActionableGaps(analysis: GapAnalysisResult, limit: number = 5): PerceptionRealityGap[] {
  return analysis.totalGaps
    .filter(g => g.actionability === 'high')
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, limit);
}

/**
 * Generate gap analysis summary for report
 */
export function generateGapAnalysisSummary(analysis: GapAnalysisResult): string {
  const { summary, dataQuality } = analysis;

  return `
PERCEPTION-REALITY GAP ANALYSIS
School: ${analysis.schoolName}
Analysis Date: ${analysis.analysisDate.toLocaleDateString()}
Data Reliability: ${dataQuality.analysisReliability.toUpperCase()}

SUMMARY:
• Aligned Dimensions: ${summary.alignedDimensions.length}/14 (Perception matches reality)
• Overestimated: ${summary.overestimatedDimensions.length} dimensions (Perceived better than actual)
• Underestimated: ${summary.underestimatedDimensions.length} dimensions (Perceived worse than actual)
• Average Gap: ${summary.averageGap} points

KEY INSIGHTS:
${analysis.insights.map((i) => `• ${i}`).join('\n')}

RECOMMENDED ACTIONS:
${analysis.recommendations.map((r) => `• ${r}`).join('\n')}

DATA QUALITY:
• Subjective Data (Assessments): ${dataQuality.subjectiveDataCompleteness}% complete
• Objective Data (Operations): ${dataQuality.objectiveDataCompleteness}% complete
• Overall Analysis Confidence: ${dataQuality.analysisReliability}
  `.trim();
}
