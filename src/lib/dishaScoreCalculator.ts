/**
 * DISHA First Opinion Engine - Score Calculator
 * Implements complete 3-layer methodology:
 * 1. S_sub (Subjective Base Score) - Leadership perception
 * 2. M_obj (Objective Multiplier) - Operational metrics
 * 3. H (Health Index) - Reality-adjusted health score
 */

export interface ScreeningAnswer {
  questionId: string;
  weight: number;
}

export interface OperationalMetrics {
  studentTeacherRatio: number;
  parentResponseSLA: number;
  annualTrainingHours: number;
  weeklyPlanningHours: number;
}

export interface DISHAScore {
  // Layer 1: Subjective
  s_sub: number;
  s_sub_interpretation: string;

  // Layer 2: Objective
  m_obj: number;
  m_str: number;
  m_sla: number;
  m_train: number;
  m_plan: number;
  m_obj_interpretation: string;

  // Layer 3: Final Health
  scaledScore: number;
  delusionPenalty: number;
  healthIndex: number;
  healthIndex_interpretation: string;

  // Risk Classification
  riskQuadrant: 'GREEN' | 'ORANGE' | 'YELLOW' | 'RED';
  riskQuadrantName: string;
  riskLevel: 'EXCELLENT' | 'AT_RISK' | 'CONCERNING' | 'CRITICAL';
}

export class DISHAScoreCalculator {
  /**
   * Calculate S_sub (Subjective Base Score)
   * Formula: S_sub = 100 - ((Total Response Sum / Maximum Possible) × 100)
   */
  static calculateSubjectiveScore(
    answers: ScreeningAnswer[],
    maxPossibleScore: number
  ): number {
    if (answers.length === 0) return 50;

    const totalSum = answers.reduce((sum, answer) => sum + answer.weight, 0);
    const percentage = (totalSum / maxPossibleScore) * 100;
    const s_sub = 100 - percentage;

    return Math.round(s_sub * 100) / 100;
  }

  /**
   * Get multiplier for Student-Teacher Ratio
   */
  static getSTRMultiplier(str: number): number {
    if (str <= 20) return 1.05; // Excellent
    if (str <= 28) return 1.0; // Good (industry standard)
    if (str <= 35) return 0.88; // Acceptable but taxing
    return 0.75; // Poor - overcrowded
  }

  /**
   * Get multiplier for Parent Response SLA (hours)
   */
  static getSLAMultiplier(slaHours: number): number {
    if (slaHours <= 12) return 1.0; // Excellent - same day
    if (slaHours <= 24) return 0.95; // Good - next day
    if (slaHours <= 48) return 0.7; // Acceptable but slow
    return 0.5; // Poor - unresponsive
  }

  /**
   * Get multiplier for Annual Training Hours
   */
  static getTrainingMultiplier(hours: number): number {
    if (hours >= 25) return 1.0; // Excellent (2+ hours/month)
    if (hours >= 15) return 0.85; // Acceptable (~2 hours/month)
    return 0.6; // Poor - insufficient
  }

  /**
   * Get multiplier for Weekly Planning Time
   */
  static getPlanningMultiplier(hoursPerWeek: number): number {
    if (hoursPerWeek >= 5) return 1.0; // Excellent
    if (hoursPerWeek >= 3) return 0.88; // Acceptable
    return 0.75; // Poor - insufficient
  }

  /**
   * Calculate M_obj (Objective Multiplier)
   * Formula: M_obj = m_STR × m_SLA × m_train × m_plan
   */
  static calculateObjectiveMultiplier(metrics: OperationalMetrics): {
    m_obj: number;
    m_str: number;
    m_sla: number;
    m_train: number;
    m_plan: number;
  } {
    const m_str = this.getSTRMultiplier(metrics.studentTeacherRatio);
    const m_sla = this.getSLAMultiplier(metrics.parentResponseSLA);
    const m_train = this.getTrainingMultiplier(metrics.annualTrainingHours);
    const m_plan = this.getPlanningMultiplier(metrics.weeklyPlanningHours);

    const m_obj = m_str * m_sla * m_train * m_plan;

    return {
      m_obj: Math.round(m_obj * 1000) / 1000,
      m_str,
      m_sla,
      m_train,
      m_plan
    };
  }

  /**
   * Calculate Delusion Penalty
   * IF S_sub >= 80 AND M_obj < 0.7: Penalty = S_sub - 80
   * ELSE: Penalty = 0
   */
  static calculateDelusionPenalty(s_sub: number, m_obj: number): number {
    if (s_sub >= 80 && m_obj < 0.7) {
      return s_sub - 80;
    }
    return 0;
  }

  /**
   * Calculate Health Index (H)
   * Formula: H = MAX(0, MIN(100, Scaled Score - Delusion Penalty))
   * Where Scaled Score = S_sub × M_obj
   */
  static calculateHealthIndex(
    s_sub: number,
    m_obj: number,
    delusionPenalty: number
  ): number {
    const scaledScore = s_sub * m_obj;
    const h = scaledScore - delusionPenalty;
    return Math.max(0, Math.min(100, Math.round(h * 100) / 100));
  }

  /**
   * Classify into Risk Quadrant.
   *
   * FIXED (2026-08-31): the color/badge (quadrant, riskLevel) used to be
   * decided from S_sub and M_obj each independently crossing their own
   * threshold (s_sub >= 60, m_obj >= 0.7), completely ignoring the
   * healthIndex parameter this function already received. Since
   * healthIndex = s_sub * m_obj (roughly), a school could clear BOTH
   * individual thresholds while its product/healthIndex still landed well
   * below the dashboard's own displayed legend for that color (e.g.
   * s_sub=61.1, m_obj=0.71 -> both "high" -> badge said GREEN/"ELITE
   * EQUILIBRIUM"/EXCELLENT, while healthIndex=43.5 falls in the legend's
   * ORANGE 30-50 band and getHealthIndexInterpretation() simultaneously
   * printed "POOR: Requires significant intervention" on the same report).
   * The color/riskLevel badge is now driven directly by healthIndex, using
   * the exact same 70/50/30 bands as getHealthIndexInterpretation() and the
   * dashboard's own legend, so it can never again contradict the Health
   * Index score shown right next to it.
   *
   * The quadrant NAME (Elite Equilibrium / Delusional Comfort / Hidden
   * Excellence / Critical Collapse) still describes the separate
   * perception-vs-reality "Character" question from the reference doc's
   * gap-based quadrant (Gap = S_sub - M_obj, scaled to 0-100): a large
   * positive gap means leadership perceives things as healthier than the
   * objective data supports (Delusional Comfort / blind-spot risk); a large
   * negative gap means the reverse (Hidden Excellence). This is independent
   * of the health magnitude, so it's computed separately from the color.
   */
  static classifyRiskQuadrant(
    s_sub: number,
    m_obj: number,
    healthIndex: number
  ): {
    quadrant: 'GREEN' | 'ORANGE' | 'YELLOW' | 'RED';
    name: string;
    riskLevel: 'EXCELLENT' | 'AT_RISK' | 'CONCERNING' | 'CRITICAL';
  } {
    // Magnitude: how healthy is the school overall (matches
    // getHealthIndexInterpretation()'s bands and the dashboard's own legend).
    let quadrant: 'GREEN' | 'ORANGE' | 'YELLOW' | 'RED';
    let riskLevel: 'EXCELLENT' | 'AT_RISK' | 'CONCERNING' | 'CRITICAL';
    if (healthIndex >= 70) {
      quadrant = 'GREEN';
      riskLevel = 'EXCELLENT';
    } else if (healthIndex >= 50) {
      quadrant = 'YELLOW';
      riskLevel = 'CONCERNING';
    } else if (healthIndex >= 30) {
      quadrant = 'ORANGE';
      riskLevel = 'AT_RISK';
    } else {
      quadrant = 'RED';
      riskLevel = 'CRITICAL';
    }

    // Character: does leadership's perception match the objective reality?
    // Gap = S_sub - M_obj, both scaled to a comparable 0-100 range.
    const gap = s_sub - m_obj * 100;
    let name: string;
    if (gap > 10) {
      name = 'DELUSIONAL COMFORT'; // perceives better than reality shows - blind-spot risk
    } else if (gap < -10) {
      name = 'HIDDEN EXCELLENCE'; // reality is better than perceived - communication gap
    } else if (riskLevel === 'EXCELLENT') {
      name = 'ELITE EQUILIBRIUM'; // aligned, and genuinely healthy
    } else if (riskLevel === 'CRITICAL') {
      name = 'CRITICAL COLLAPSE'; // aligned, and genuinely critical
    } else {
      name = 'ALIGNED - MIXED HEALTH'; // aligned, but the health itself is only fair/concerning
    }

    return { quadrant, name, riskLevel };
  }

  /**
   * Get interpretation of S_sub with strategic language
   */
  static getSubjectiveInterpretation(s_sub: number): string {
    if (isNaN(s_sub)) return 'Assessment pending';
    if (s_sub >= 80) return 'Leadership perceives strong institutional health (minor concerns only)';
    if (s_sub >= 60) return 'Leadership perceives good health with acknowledgment of some operational gaps';
    if (s_sub >= 40) return 'Leadership recognizes moderate challenges across multiple areas';
    if (s_sub >= 20) return 'Leadership acknowledges significant challenges requiring attention';
    return 'Leadership acknowledges critical systemic problems demanding urgent action';
  }

  /**
   * Get interpretation of M_obj with strategic language
   */
  static getObjectiveInterpretation(m_obj: number): string {
    if (isNaN(m_obj)) return 'Metrics assessment pending';
    if (m_obj >= 1.0)
      return 'Excellent: School exceeds standards in all operational metrics';
    if (m_obj >= 0.8)
      return 'Good: School meets most industry standards with minor gaps';
    if (m_obj >= 0.6)
      return 'Fair: School has moderate gaps in 1-2 operational areas';
    if (m_obj >= 0.4)
      return 'Concerning: School has significant issues in multiple operational areas';
    return 'Critical: School operations are severely below industry standards across multiple areas';
  }

  /**
   * Get interpretation of Health Index with strategic recommendations
   */
  static getHealthIndexInterpretation(h: number): string {
    if (isNaN(h)) return 'Health assessment pending';
    if (h >= 70) return '✓ EXCELLENT: Sustainable institutional excellence - focus on innovation & differentiation';
    if (h >= 50)
      return '⚠ FAIR: Manageable with targeted action - prioritize operational metric improvements';
    if (h >= 30) return '⚠ POOR: Requires significant intervention - address top 3 operational gaps immediately';
    return '❌ CRITICAL: Emergency response required - stabilize operations before growth initiatives';
  }

  /**
   * Calculate complete DISHA score
   */
  static calculateCompleteScore(
    answers: ScreeningAnswer[],
    maxPossibleScore: number,
    metrics: OperationalMetrics
  ): DISHAScore {
    // Layer 1: Subjective
    const s_sub = this.calculateSubjectiveScore(answers, maxPossibleScore);

    // Layer 2: Objective
    const objMultipliers = this.calculateObjectiveMultiplier(metrics);

    // Layer 3: Final Health
    const delusionPenalty = this.calculateDelusionPenalty(
      s_sub,
      objMultipliers.m_obj
    );
    const scaledScore = s_sub * objMultipliers.m_obj;
    const healthIndex = this.calculateHealthIndex(
      s_sub,
      objMultipliers.m_obj,
      delusionPenalty
    );

    // Risk Classification
    const riskClass = this.classifyRiskQuadrant(s_sub, objMultipliers.m_obj, healthIndex);

    return {
      s_sub,
      s_sub_interpretation: this.getSubjectiveInterpretation(s_sub),

      m_obj: objMultipliers.m_obj,
      m_str: objMultipliers.m_str,
      m_sla: objMultipliers.m_sla,
      m_train: objMultipliers.m_train,
      m_plan: objMultipliers.m_plan,
      m_obj_interpretation: this.getObjectiveInterpretation(
        objMultipliers.m_obj
      ),

      scaledScore: Math.round(scaledScore * 100) / 100,
      delusionPenalty,
      healthIndex,
      healthIndex_interpretation: this.getHealthIndexInterpretation(healthIndex),

      riskQuadrant: riskClass.quadrant,
      riskQuadrantName: riskClass.name,
      riskLevel: riskClass.riskLevel
    };
  }
}

export default DISHAScoreCalculator;
