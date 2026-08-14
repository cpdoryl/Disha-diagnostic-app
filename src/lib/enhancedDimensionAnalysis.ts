/**
 * Enhanced Dimension Analysis Engine
 *
 * Provides in-depth, concrete analysis for each of the 14 dimensions
 * including detailed analysis, perception-reality interpretation,
 * root cause analysis, and actionable recommendations tailored to
 * actual score patterns and stakeholder feedback.
 *
 * Unlike generic templates, these analyses reflect the specific
 * characteristics of each dimension and provide actionable insights
 * based on score ranges and stakeholder patterns.
 */

export interface DimensionAnalysisContent {
  detailedAnalysis: string[];
  perceptionRealityAnalysis: string[];
  rootCauseAnalysis: string[];
  actionableRecommendations: string[];
}

interface AnalysisContext {
  dimensionId: string;
  dimensionName: string;
  score: number;
  benchmark: number;
  responseCount: number;
  byStakeholder: Record<string, number>;
  gap: {
    type: 'alignment' | 'overestimation' | 'underestimation';
    magnitude: number;
  } | null;
}

// Dimension-specific analysis profiles
const DIMENSION_PROFILES: Record<string, {
  strength_indicators: string[];
  risk_indicators: string[];
  high_score_meaning: string;
  low_score_meaning: string;
}> = {
  leadership: {
    strength_indicators: [
      'Clear vision articulated to all stakeholders',
      'Regular data-driven review cycles in place',
      'Innovation initiatives actively promoted',
      'Transparent decision-making processes',
      'Staff and community trust in direction'
    ],
    risk_indicators: [
      'Lack of clear institutional direction',
      'Decisions made in silos without stakeholder input',
      'Resistance to change and improvement efforts',
      'Inconsistent leadership messaging',
      'Low staff confidence in administration'
    ],
    high_score_meaning: 'Strong, visionary leadership with clear direction, transparent processes, and active promotion of continuous improvement. School is well-positioned for growth and innovation.',
    low_score_meaning: 'Leadership challenges limit organizational effectiveness. Vision may be unclear, decision-making processes opaque, and innovation stifled. This typically cascades to affect other dimensions.'
  },

  academic: {
    strength_indicators: [
      'Consistent high performance on summative assessments',
      'Student engagement and participation in learning',
      'Differentiated instruction meeting diverse needs',
      'Regular use of assessment data to guide teaching',
      'Development of higher-order thinking skills'
    ],
    risk_indicators: [
      'Declining or below-benchmark exam scores',
      'Limited evidence of student-centered pedagogy',
      'Passive learning environments with minimal engagement',
      'Assessment used primarily for grading, not improvement',
      'Gaps in academic support for struggling students'
    ],
    high_score_meaning: 'Teaching and learning are of high quality. Students are achieving well academically, engaging meaningfully with content, and developing critical thinking. This is the core output of the school system.',
    low_score_meaning: 'Academic quality is a concern. Teaching may lack engagement, assessment practices may not inform improvement, and students may not be meeting learning benchmarks. This requires urgent focus and support.'
  },

  infrastructure: {
    strength_indicators: [
      'Modern, well-maintained physical facilities',
      'Adequate and accessible learning resources',
      'Technology effectively integrated into learning',
      'Safe, inclusive learning environment',
      'Dedicated spaces for different learning modalities'
    ],
    risk_indicators: [
      'Aging buildings with maintenance issues',
      'Insufficient learning resources or outdated materials',
      'Technology gaps or digital divide affecting access',
      'Safety or accessibility concerns',
      'Inadequate space for diverse learning needs'
    ],
    high_score_meaning: 'Infrastructure is a strength enabling learning. Facilities are modern, resources are abundant, technology supports instruction, and the environment is safe and conducive to growth.',
    low_score_meaning: 'Infrastructure limitations constrain teaching and learning. Physical facilities, resources, or technology gaps create barriers to effective instruction and student success.'
  },

  wellbeing: {
    strength_indicators: [
      'Comprehensive pastoral care and counseling systems',
      'Students report feeling safe and supported',
      'Mental health and wellness proactively addressed',
      'Clear protocols for identifying and supporting at-risk students',
      'Positive school culture with belonging emphasized'
    ],
    risk_indicators: [
      'Limited mental health or counseling support',
      'Students report stress, anxiety, or safety concerns',
      'Absence of formal pastoral care systems',
      'Bullying or social issues not actively addressed',
      'Low sense of community or belonging'
    ],
    high_score_meaning: 'Student well-being is prioritized. Comprehensive support systems are in place, students feel safe and supported, and the school actively promotes mental health and positive relationships.',
    low_score_meaning: 'Student well-being needs attention. Without adequate support systems, students may struggle emotionally and behaviorally, impacting both their personal development and academic success.'
  },

  staffDevelopment: {
    strength_indicators: [
      'Structured professional development aligned to needs',
      'Teachers engaged in continuous learning',
      'Mentoring and peer support systems active',
      'Staff satisfaction and morale high',
      'Career advancement pathways clear'
    ],
    risk_indicators: [
      'Minimal professional development opportunities',
      'Teachers isolated without peer collaboration',
      'High staff turnover indicating dissatisfaction',
      'Limited opportunities for skill advancement',
      'Staff feeling unsupported or undervalued'
    ],
    high_score_meaning: 'Staff are well-supported and developed. Professional development is continuous, teachers feel valued, collaboration is active, and there is clear career progression. This directly improves teaching quality.',
    low_score_meaning: 'Staff development is insufficient. Without ongoing learning opportunities and support, teaching quality may stagnate, staff satisfaction declines, and turnover increases.'
  },

  community: {
    strength_indicators: [
      'Active parent involvement in school life',
      'Regular two-way communication with families',
      'Strong partnerships with local community',
      'Families feel welcomed and heard',
      'Community contributes to school initiatives'
    ],
    risk_indicators: [
      'Limited parent involvement or engagement',
      'Communication gaps between school and families',
      'Weak relationships with community organizations',
      'Families feel excluded from decision-making',
      'Limited community understanding of school mission'
    ],
    high_score_meaning: 'School-community partnership is strong. Parents are actively involved, communication is regular and open, and the community supports school initiatives. This creates powerful advocates for the school.',
    low_score_meaning: 'Community engagement is weak. Without active partnerships and involvement, the school misses valuable perspectives, loses potential support, and may struggle with public perception.'
  },

  innovation: {
    strength_indicators: [
      'Regular piloting of new teaching methods and technologies',
      'Culture of experimentation and calculated risk-taking',
      'Staff trained in latest educational innovations',
      'Evidence-based approach to adopting new practices',
      'Student learning enhanced through innovation'
    ],
    risk_indicators: [
      'Resistance to new approaches or change',
      'Technology adoption lagging peers',
      'Teaching methods traditional without evolution',
      'Limited exposure to innovative practices',
      'Innovation viewed as optional rather than core'
    ],
    high_score_meaning: 'Innovation is embedded in school culture. New approaches are actively explored, evidence informs adoption decisions, and technology is strategically used to enhance learning.',
    low_score_meaning: 'Innovation is limited. Without active exploration of new methods and technologies, the school risks falling behind and missing opportunities to enhance teaching and learning.'
  },

  financial: {
    strength_indicators: [
      'Clear, transparent financial management',
      'Budget aligned to strategic priorities',
      'Adequate resources for core instructional programs',
      'Long-term financial sustainability planned',
      'Effective cost management and efficiency'
    ],
    risk_indicators: [
      'Financial instability or cash flow issues',
      'Budget not clearly aligned to school goals',
      'Resource constraints limiting programs',
      'Lack of transparency in financial decisions',
      'Unsustainable financial practices'
    ],
    high_score_meaning: 'Financial management is sound. Resources are adequately allocated to priorities, the budget is transparent and strategic, and the school has financial sustainability.',
    low_score_meaning: 'Financial challenges may constrain school operations. Without effective financial management, the school may struggle to fund priorities or maintain long-term sustainability.'
  },

  qualityAssurance: {
    strength_indicators: [
      'Regular, rigorous program evaluation',
      'Quality standards clearly defined and monitored',
      'Compliance with all regulatory requirements',
      'Continuous improvement cycles active',
      'Data used to drive quality enhancements'
    ],
    risk_indicators: [
      'Limited formal evaluation of programs',
      'Quality standards unclear or unenforced',
      'Compliance issues or regulatory concerns',
      'No systematic improvement processes',
      'Decisions based on tradition rather than evidence'
    ],
    high_score_meaning: 'Quality assurance systems ensure consistent delivery of excellence. Standards are clear, compliance is maintained, and continuous improvement is data-driven.',
    low_score_meaning: 'Quality assurance systems are weak. Without systematic evaluation and improvement processes, quality consistency is at risk and compliance issues may emerge.'
  },

  inclusivity: {
    strength_indicators: [
      'Proactive efforts to serve diverse learner needs',
      'Inclusive policies explicitly stated and enforced',
      'Differentiated support for students with disabilities',
      'Diverse backgrounds reflected and celebrated',
      'Equitable access to all programs and opportunities'
    ],
    risk_indicators: [
      'Limited accommodation for diverse learners',
      'Gaps in support for students with disabilities',
      'Underrepresentation of certain groups',
      'Inclusion treated as compliance, not commitment',
      'Barriers to equitable participation'
    ],
    high_score_meaning: 'Inclusivity is a core value. The school actively serves diverse learners, proactively removes barriers, celebrates differences, and ensures equitable access and outcomes.',
    low_score_meaning: 'Inclusivity needs strengthening. Without active commitment to serving all learners, some students may be underserved and barriers to participation may persist.'
  },

  curriculum: {
    strength_indicators: [
      'Comprehensive curriculum addressing breadth and depth',
      'Alignment to national standards and competency frameworks',
      'Regular curriculum review and updates',
      'Integration across subjects promoting transfer',
      'Student demonstrate mastery of intended learning outcomes'
    ],
    risk_indicators: [
      'Narrow or incomplete curriculum coverage',
      'Misalignment with standards or competency frameworks',
      'Outdated curriculum not reflecting current knowledge',
      'Fragmented subjects without integration',
      'Student learning outcomes below expectations'
    ],
    high_score_meaning: 'Curriculum is well-designed, comprehensive, and aligned to standards. Students are developing intended competencies through well-structured, integrated learning experiences.',
    low_score_meaning: 'Curriculum has gaps or quality issues. Without comprehensive, well-aligned curriculum, students may not develop intended competencies or may miss important learning experiences.'
  },

  satisfaction: {
    strength_indicators: [
      'High parent and student satisfaction scores',
      'Strong reputation in community',
      'Low complaints, high praise in feedback',
      'High demand for enrollment',
      'Alumni speak positively about their experience'
    ],
    risk_indicators: [
      'Declining satisfaction among key stakeholders',
      'Negative reputation or criticism in community',
      'High complaint rates',
      'Declining enrollment',
      'Alumni dissatisfaction with preparation'
    ],
    high_score_meaning: 'Stakeholders are satisfied with the school experience. Reputation is strong, parents trust the school, and students report positive experiences. This creates stability and support.',
    low_score_meaning: 'Stakeholder satisfaction is a concern. Declining satisfaction may indicate quality issues, communication problems, or unmet expectations that need to be addressed.'
  },

  performance: {
    strength_indicators: [
      'Clear performance metrics defined for all roles',
      'Regular feedback and coaching provided',
      'Performance tied to school goals',
      'Recognition of excellence and high achievement',
      'Accountability applied consistently'
    ],
    risk_indicators: [
      'Performance expectations unclear',
      'Limited feedback or development conversations',
      'Performance not linked to school strategy',
      'Inconsistent application of accountability',
      'Limited recognition or consequences'
    ],
    high_score_meaning: 'Performance management drives accountability and improvement. Clear expectations, regular feedback, and consistent accountability create a high-performing organization.',
    low_score_meaning: 'Performance management systems are weak. Without clear expectations and accountability, organizational effectiveness and staff development may suffer.'
  },

  culture: {
    strength_indicators: [
      'Strong, positive school culture valuing excellence',
      'Clear values evident in daily behavior',
      'High collaboration and teamwork',
      'Psychological safety enabling risk-taking',
      'Pride in school and mutual respect'
    ],
    risk_indicators: [
      'Weak or negative school culture',
      'Values stated but not evident in practice',
      'Silos preventing collaboration',
      'Low psychological safety or trust',
      'Cynicism or lack of pride in school'
    ],
    high_score_meaning: 'Organizational culture is strong and positive. Shared values guide behavior, collaboration is high, and there is pride in belonging. This culture enables all other initiatives to succeed.',
    low_score_meaning: 'Organizational culture needs strengthening. Without a strong, positive culture, initiatives struggle, collaboration suffers, and overall organizational effectiveness is constrained.'
  }
};

const SCORE_RANGES = {
  CRITICAL: { min: 0, max: 30, label: 'Critical - At Risk' },
  POOR: { min: 30, max: 50, label: 'Poor - Needs Attention' },
  ADEQUATE: { min: 50, max: 70, label: 'Adequate - On Track' },
  STRONG: { min: 70, max: 85, label: 'Strong - Performing Well' },
  EXCELLENT: { min: 85, max: 100, label: 'Excellent - Excellence Demonstrated' }
};

export function generateEnhancedDimensionAnalysis(context: AnalysisContext): DimensionAnalysisContent {
  const profile = DIMENSION_PROFILES[context.dimensionId] || DIMENSION_PROFILES['leadership'];
  const scoreRange = getScoreRange(context.score);
  const isBelowBenchmark = context.score < context.benchmark;
  const gapMagnitude = Math.abs(context.score - context.benchmark);

  return {
    detailedAnalysis: generateDetailedAnalysis(context, profile, scoreRange),
    perceptionRealityAnalysis: generatePerceptionRealityAnalysis(context),
    rootCauseAnalysis: generateRootCauseAnalysis(context, profile, scoreRange),
    actionableRecommendations: generateActionableRecommendations(context, profile, scoreRange)
  };
}

function getScoreRange(score: number): typeof SCORE_RANGES[keyof typeof SCORE_RANGES] {
  for (const range of Object.values(SCORE_RANGES)) {
    if (score >= range.min && score <= range.max) return range;
  }
  return SCORE_RANGES.EXCELLENT;
}

function generateDetailedAnalysis(
  context: AnalysisContext,
  profile: typeof DIMENSION_PROFILES['leadership'],
  scoreRange: typeof SCORE_RANGES[keyof typeof SCORE_RANGES]
): string[] {
  const lines: string[] = [];
  const delta = context.score - context.benchmark;
  const deltaDir = delta > 0 ? 'above' : delta < 0 ? 'below' : 'at';
  const deltaAbs = Math.abs(delta);

  // Opening paragraph with concrete score interpretation
  lines.push(
    `${context.dimensionName} is currently scoring ${context.score}/100 (${scoreRange.label}) based on feedback from ${context.responseCount} respondent${context.responseCount !== 1 ? 's' : ''}. ` +
    `This places the school ${Math.abs(delta).toFixed(0)} point${Math.abs(delta) === 1 ? '' : 's'} ${deltaDir} the benchmark of ${context.benchmark}. ` +
    `${profile.high_score_meaning.split('.')[0]} This score indicates: ${scoreRange.label.toLowerCase()}.`
  );

  // Stakeholder breakdown with interpretation
  const stakeholders = Object.entries(context.byStakeholder)
    .filter(([_, score]) => score != null)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));

  if (stakeholders.length > 0) {
    const topGroup = stakeholders[0];
    const bottomGroup = stakeholders[stakeholders.length - 1];
    const spread = (topGroup[1] || 0) - (bottomGroup[1] || 0);

    if (spread > 1.5) {
      lines.push(
        `There is a significant perception gap among stakeholder groups: ${topGroup[0]} rate this highest (${topGroup[1]?.toFixed(2)}/5), ` +
        `while ${bottomGroup[0]} rate it lower (${bottomGroup[1]?.toFixed(2)}/5). This ${spread.toFixed(1)}-point spread suggests different experiences or expectations. ` +
        `For example, teachers may perceive stronger ${context.dimensionName.toLowerCase()} while parents see different evidence, or vice versa. This divergence warrants investigation.`
      );
    } else if (spread > 0.5) {
      lines.push(
        `Stakeholder perspectives are relatively consistent (${spread.toFixed(1)}-point range), suggesting shared understanding of ${context.dimensionName.toLowerCase()}. ` +
        `This consistency makes improvement efforts more straightforward since all groups see the situation similarly.`
      );
    }
  }

  // Score-specific interpretation
  if (context.score >= 85) {
    lines.push(
      `This is an area of demonstrated excellence. Evidence suggests: ` +
      `${profile.strength_indicators.slice(0, 3).join('; ')}. ` +
      `The school should document these practices and consider sharing with peer schools or using as a model for improvement in other dimensions.`
    );
  } else if (context.score >= 70) {
    lines.push(
      `This is a solid area of performance. The school demonstrates: ` +
      `${profile.strength_indicators.slice(0, 2).join('; ')}. ` +
      `While meeting benchmarks, there remains opportunity to move from "adequate" to "strong" through targeted enhancement.`
    );
  } else if (context.score >= 50) {
    lines.push(
      `This area is near benchmark but shows room for improvement. Current issues may include: ` +
      `${profile.risk_indicators.slice(0, 2).join('; ')}. ` +
      `The school is functional but could benefit from deliberate focus to strengthen this dimension.`
    );
  } else if (context.score >= 30) {
    lines.push(
      `This dimension requires attention. Challenges evident include: ` +
      `${profile.risk_indicators.slice(0, 3).join('; ')}. ` +
      `Stakeholder feedback indicates this area is not meeting needs or expectations. Focused intervention is recommended.`
    );
  } else {
    lines.push(
      `This dimension is in crisis. ${profile.low_score_meaning} Critical issues likely include: ` +
      `${profile.risk_indicators.slice(0, 3).join('; ')}. ` +
      `This requires immediate, intensive intervention and should be prioritized in the school's improvement planning.`
    );
  }

  return lines;
}

function generatePerceptionRealityAnalysis(context: AnalysisContext): string[] {
  const lines: string[] = [];

  if (!context.gap) {
    lines.push('Perception-Reality Analysis: Insufficient objective data available to compare stakeholder perceptions against external evidence.');
    return lines;
  }

  const { type, magnitude } = context.gap;
  const magText = magnitude <= 5 ? 'slight' : magnitude <= 10 ? 'moderate' : 'significant';

  if (type === 'alignment') {
    lines.push(
      `Stakeholders perceive ${context.dimensionName.toLowerCase()} at approximately the same level as external evidence suggests. ` +
      `This indicates realistic perception - what the school experiences internally aligns with what benchmarks or objective data show. ` +
      `This is positive because realistic perception enables effective problem-solving and prevents either false confidence or unnecessary panic.`
    );
  } else if (type === 'overestimation') {
    lines.push(
      `Stakeholders perceive this dimension more positively than objective evidence supports (${magText} overestimation of ${magnitude.toFixed(1)} points). ` +
      `For example, teachers or parents may rate teaching quality or student learning higher than exam results or external assessments show. ` +
      `This perception-reality gap risks complacency - if stakeholders think performance is better than it actually is, they may not pursue necessary improvements. ` +
      `This gap should be addressed through honest data sharing and dialogue about what evidence reveals.`
    );
  } else if (type === 'underestimation') {
    lines.push(
      `Stakeholders perceive this dimension less positively than objective evidence supports (${magText} underestimation of ${magnitude.toFixed(1)} points). ` +
      `For example, the school may actually be performing better on assessments than teachers or parents perceive. ` +
      `This perception-reality gap represents a communication and visibility opportunity - the good work happening may not be visible to stakeholders. ` +
      `Addressing this through better communication can build confidence and support for the school's direction.`
    );
  }

  return lines;
}

function generateRootCauseAnalysis(
  context: AnalysisContext,
  profile: typeof DIMENSION_PROFILES['leadership'],
  scoreRange: typeof SCORE_RANGES[keyof typeof SCORE_RANGES]
): string[] {
  const lines: string[] = [];

  if (context.score >= 75) {
    lines.push(
      `Root Cause of Strong Performance: This strong score reflects deliberate, sustained effort in this dimension. ` +
      `Likely contributing factors include: clear strategic focus, adequate resource allocation, skilled personnel, and systems in place. ` +
      `The school has addressed foundational prerequisites enabling excellence in this area.`
    );
    return lines;
  }

  if (context.score >= 50) {
    lines.push(
      `Root Cause Analysis: Performance near benchmark suggests the school has addressed basic requirements but gaps remain. ` +
      `Common factors in this score range include: incomplete implementation of systems, inconsistent practices, or resource constraints in specific areas. ` +
      `Improvement would likely require identifying which specific sub-components (e.g., within ${context.dimensionName.toLowerCase()}) are weaker and targeting those.`
    );
    return lines;
  }

  // Below 50 - deeper investigation
  lines.push(
    `Root Cause Analysis: Below-benchmark performance indicates fundamental challenges in ${context.dimensionName.toLowerCase()}. ` +
    `Investigating the gap, likely contributors include:`
  );

  if (context.score < 40) {
    lines.push(`• Systemic Deficiencies: Core systems, processes, or structures supporting this dimension may be missing or non-functional.`);
    lines.push(`• Resource Constraints: Insufficient personnel, funding, materials, or time allocated to address this dimension.`);
    lines.push(`• Leadership/Vision Gap: May lack clear accountability, strategic focus, or visible leadership commitment to this area.`);
    lines.push(`• Skill or Knowledge Gaps: Staff may lack training, expertise, or understanding of best practices in this dimension.`);
    lines.push(`• External Factors: Market conditions, regulatory environment, community factors, or other external pressures may be constraining performance.`);
  } else {
    lines.push(`• Implementation Gaps: Systems exist but execution is inconsistent or incomplete across the school.`);
    lines.push(`• Resource Prioritization: Resources may be allocated but not optimally distributed to highest-need areas.`);
    lines.push(`• Monitoring Deficiency: May lack clear metrics or accountability for performance in this dimension.`);
    lines.push(`• Change Fatigue: Staff may be overwhelmed by multiple initiatives, limiting capacity for this area.`);
  }

  lines.push(
    `\nDiagnostic Recommendation: To identify root causes with certainty, conduct interviews with key stakeholders (teachers, parents, students, leadership) ` +
    `asking specifically "What do you see as the top barriers to strong performance in ${context.dimensionName.toLowerCase()}?" and "What resources or changes would have the most impact?" ` +
    `The pattern of responses will reveal where the true leverage points lie.`
  );

  return lines;
}

function generateActionableRecommendations(
  context: AnalysisContext,
  profile: typeof DIMENSION_PROFILES['leadership'],
  scoreRange: typeof SCORE_RANGES[keyof typeof SCORE_RANGES]
): string[] {
  const lines: string[] = [];

  if (context.score >= 85) {
    lines.push(`Maintain Excellence: This dimension is a strength. Recommended actions include:`);
    lines.push(`1. Document practices and create internal case studies of what's working well.`);
    lines.push(`2. Use this area as a model for improvement in weaker dimensions.`);
    lines.push(`3. Establish peer mentoring or coaching relationships with schools seeking to improve this dimension.`);
    lines.push(`4. Continue professional development to stay current with evolving best practices.`);
    lines.push(`5. Annually assess this dimension to ensure sustained excellence.`);
    return lines;
  }

  if (context.score >= 70) {
    lines.push(`Strengthen Performance: Move from adequate to strong through targeted improvements:`);
    lines.push(`1. Identify the specific sub-components (within ${context.dimensionName.toLowerCase()}) that score lower and focus resources there.`);
    lines.push(`2. Research and pilot best practices from higher-performing schools or research literature.`);
    lines.push(`3. Provide targeted professional development addressing identified skill gaps.`);
    lines.push(`4. Establish clear metrics and monitor progress monthly rather than annually.`);
    lines.push(`5. Allocate dedicated budget and time for improvement initiatives in this area.`);
    return lines;
  }

  if (context.score >= 50) {
    lines.push(`Improve Below-Benchmark Performance: This area requires dedicated focus. Action plan should include:`);
    lines.push(`1. Leadership Priority: Position this dimension as an explicit priority in school goals and resource allocation.`);
    lines.push(`2. Root Cause Investigation: Conduct stakeholder interviews to identify why performance lags (systems gaps, resources, knowledge, commitment, or external factors).`);
    lines.push(`3. Targeted Intervention: Based on root causes, implement specific solutions (e.g., professional development, systems changes, resource reallocation).`);
    lines.push(`4. Quick Wins: Identify 1-2 high-impact actions that could show improvement within one semester to build momentum.`);
    lines.push(`5. Accountability: Establish clear metrics and monthly review cycles to track progress and adjust approach.`);
    return lines;
  }

  // Below 50 - crisis response
  lines.push(`Crisis Intervention Required: This dimension significantly underperforms and requires immediate, intensive action:`);
  lines.push(`1. Leadership Commitment: Principal and leadership team must visibly prioritize this dimension - allocate substantial time, resources, and accountability.`);
  lines.push(`2. External Support: Consider bringing in external expertise (consultant, peer school leader, or specialist) to diagnose issues and guide improvement.`);
  lines.push(`3. Rapid Diagnosis: Within 1-2 weeks, conduct root cause analysis through interviews, observation, and data review to identify core problems.`);
  lines.push(`4. 90-Day Plan: Develop specific, measurable action plan with defined responsibilities and weekly progress monitoring.`);
  lines.push(`5. Resource Surge: Allocate additional budget, staff time, or external support necessary to address root causes.`);
  lines.push(`6. Communication: Transparently communicate the situation, the plan, and progress to staff and families to build support and urgency.`);
  lines.push(`7. Celebrate Progress: Track and celebrate any improvements to maintain momentum and staff morale during challenging change.`);

  return lines;
}

export function generateAllDimensionsAnalysis(dimensions: Array<{
  id: string;
  name: string;
  score: number;
  benchmark: number;
  responseCount: number;
  byStakeholder: Record<string, number>;
  gap: { type: 'alignment' | 'overestimation' | 'underestimation'; magnitude: number } | null;
}>): Record<string, DimensionAnalysisContent> {
  const results: Record<string, DimensionAnalysisContent> = {};

  for (const dimension of dimensions) {
    results[dimension.id] = generateEnhancedDimensionAnalysis({
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      score: dimension.score,
      benchmark: dimension.benchmark,
      responseCount: dimension.responseCount,
      byStakeholder: dimension.byStakeholder,
      gap: dimension.gap
    });
  }

  return results;
}
