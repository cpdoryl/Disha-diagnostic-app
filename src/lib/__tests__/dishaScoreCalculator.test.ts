/**
 * Regression suite for DISHAScoreCalculator - the actual engine
 * FirstOpinionPage.tsx runs on every submission (not the separate,
 * unused src/lib/firstOpinion/calculations.ts engine).
 *
 * Purpose: guard against silent drift in the First Opinion Score. Every
 * benchmark band boundary and every worked full-pipeline example below has
 * its expected value computed independently (see the commit that added
 * this file) rather than by calling the function and asserting on its own
 * output - a change that alters a formula, a rounding rule, or a band
 * threshold will fail here even though the code still "runs".
 */
import { describe, it, expect } from 'vitest';
import DISHAScoreCalculator from '../dishaScoreCalculator';

describe('DISHAScoreCalculator - multiplier band boundaries', () => {
  it('Student-Teacher Ratio bands (<=20 / <=28 / <=35 / >35)', () => {
    expect(DISHAScoreCalculator.getSTRMultiplier(20)).toBe(1.05);
    expect(DISHAScoreCalculator.getSTRMultiplier(20.01)).toBe(1.0);
    expect(DISHAScoreCalculator.getSTRMultiplier(28)).toBe(1.0);
    expect(DISHAScoreCalculator.getSTRMultiplier(28.01)).toBe(0.88);
    expect(DISHAScoreCalculator.getSTRMultiplier(35)).toBe(0.88);
    expect(DISHAScoreCalculator.getSTRMultiplier(35.01)).toBe(0.75);
  });

  it('Parent Response SLA bands (<=12h / <=24h / <=48h / >48h)', () => {
    expect(DISHAScoreCalculator.getSLAMultiplier(12)).toBe(1.0);
    expect(DISHAScoreCalculator.getSLAMultiplier(12.01)).toBe(0.95);
    expect(DISHAScoreCalculator.getSLAMultiplier(24)).toBe(0.95);
    expect(DISHAScoreCalculator.getSLAMultiplier(24.01)).toBe(0.7);
    expect(DISHAScoreCalculator.getSLAMultiplier(48)).toBe(0.7);
    expect(DISHAScoreCalculator.getSLAMultiplier(48.01)).toBe(0.5);
  });

  it('Annual Training Hours bands (>=25 / >=15 / <15)', () => {
    expect(DISHAScoreCalculator.getTrainingMultiplier(25)).toBe(1.0);
    expect(DISHAScoreCalculator.getTrainingMultiplier(24.99)).toBe(0.85);
    expect(DISHAScoreCalculator.getTrainingMultiplier(15)).toBe(0.85);
    expect(DISHAScoreCalculator.getTrainingMultiplier(14.99)).toBe(0.6);
  });

  it('Weekly Planning Time bands (>=5 / >=3 / <3)', () => {
    expect(DISHAScoreCalculator.getPlanningMultiplier(5)).toBe(1.0);
    expect(DISHAScoreCalculator.getPlanningMultiplier(4.99)).toBe(0.88);
    expect(DISHAScoreCalculator.getPlanningMultiplier(3)).toBe(0.88);
    expect(DISHAScoreCalculator.getPlanningMultiplier(2.99)).toBe(0.75);
  });

  it('M_obj is the product of all 4 multipliers, rounded to 3 decimals', () => {
    const result = DISHAScoreCalculator.calculateObjectiveMultiplier({
      studentTeacherRatio: 32,
      parentResponseSLA: 30,
      annualTrainingHours: 18,
      weeklyPlanningHours: 4
    });
    expect(result.m_str).toBe(0.88);
    expect(result.m_sla).toBe(0.7);
    expect(result.m_train).toBe(0.85);
    expect(result.m_plan).toBe(0.88);
    expect(result.m_obj).toBe(0.461); // 0.88*0.7*0.85*0.88 = 0.460768 -> 0.461
  });
});

describe('DISHAScoreCalculator - S_sub (Leadership Perception)', () => {
  it('formula: 100 - (sum of weights / max possible x 100), rounded to 2 decimals', () => {
    const s_sub = DISHAScoreCalculator.calculateSubjectiveScore(
      [
        { questionId: 'q1', weight: 6 },
        { questionId: 'q2', weight: 8 },
        { questionId: 'q3', weight: 5 }
      ],
      30 // 3 questions x 10
    );
    expect(s_sub).toBe(36.67); // 100 - (19/30*100) = 36.666... -> 36.67
  });

  it('returns exactly 50 (neutral) when no answers were given, rather than dividing by zero', () => {
    expect(DISHAScoreCalculator.calculateSubjectiveScore([], 0)).toBe(50);
  });
});

describe('DISHAScoreCalculator - Delusion Penalty', () => {
  it('applies S_sub - 80 only when S_sub >= 80 AND M_obj < 0.7', () => {
    expect(DISHAScoreCalculator.calculateDelusionPenalty(90, 0.169)).toBe(10);
    expect(DISHAScoreCalculator.calculateDelusionPenalty(79.99, 0.5)).toBe(0); // S_sub just under 80
    expect(DISHAScoreCalculator.calculateDelusionPenalty(85, 0.7)).toBe(0); // M_obj at (not under) 0.7
    expect(DISHAScoreCalculator.calculateDelusionPenalty(80, 0.69)).toBe(0); // boundary: S_sub=80 satisfies >=80
    expect(DISHAScoreCalculator.calculateDelusionPenalty(80, 0.699)).toBe(0);
  });
});

describe('DISHAScoreCalculator - Health Index', () => {
  it('is Scaled Score minus Delusion Penalty, clamped to [0, 100]', () => {
    expect(DISHAScoreCalculator.calculateHealthIndex(36.67, 0.461, 0)).toBe(16.9);
    expect(DISHAScoreCalculator.calculateHealthIndex(90, 0.169, 10)).toBe(5.21);
  });

  it('clamps to 0 and 100 rather than going negative or over 100', () => {
    expect(DISHAScoreCalculator.calculateHealthIndex(10, 0.1, 50)).toBe(0); // would be -49
    expect(DISHAScoreCalculator.calculateHealthIndex(100, 1.05, 0)).toBe(100); // would be 105
  });
});

describe('DISHAScoreCalculator - Risk Quadrant classification', () => {
  // Regression test for the 2026-08-31 fix: color/riskLevel must be driven
  // purely by healthIndex, using the exact same 70/50/30 bands the
  // dashboard's legend and getHealthIndexInterpretation() use - never by
  // s_sub/m_obj independently crossing their own separate thresholds.
  it('color/riskLevel is decided by healthIndex alone, matching the dashboard legend bands', () => {
    expect(DISHAScoreCalculator.classifyRiskQuadrant(61.1, 0.71, 43.5).quadrant).toBe('ORANGE');
    expect(DISHAScoreCalculator.classifyRiskQuadrant(61.1, 0.71, 43.5).riskLevel).toBe('AT_RISK');

    expect(DISHAScoreCalculator.classifyRiskQuadrant(90, 0.9, 70).quadrant).toBe('GREEN');
    expect(DISHAScoreCalculator.classifyRiskQuadrant(70, 0.9, 69.99).quadrant).toBe('YELLOW');
    expect(DISHAScoreCalculator.classifyRiskQuadrant(70, 0.9, 50).quadrant).toBe('YELLOW');
    expect(DISHAScoreCalculator.classifyRiskQuadrant(70, 0.9, 49.99).quadrant).toBe('ORANGE');
    expect(DISHAScoreCalculator.classifyRiskQuadrant(70, 0.9, 30).quadrant).toBe('ORANGE');
    expect(DISHAScoreCalculator.classifyRiskQuadrant(70, 0.9, 29.99).quadrant).toBe('RED');
  });

  it('quadrant NAME reflects the S_sub vs M_obj*100 gap, independent of healthIndex magnitude', () => {
    // gap > 10: leadership perceives better than the data shows
    expect(DISHAScoreCalculator.classifyRiskQuadrant(90, 0.169, 5.21).name).toBe('DELUSIONAL COMFORT');
    // gap < -10: the data shows better than leadership perceives
    expect(DISHAScoreCalculator.classifyRiskQuadrant(20, 0.9, 18).name).toBe('HIDDEN EXCELLENCE');
    // |gap| <= 10 and healthy: aligned AND genuinely healthy
    expect(DISHAScoreCalculator.classifyRiskQuadrant(90, 0.9, 81).name).toBe('ELITE EQUILIBRIUM');
    // |gap| <= 10 and critical: aligned AND genuinely critical
    expect(DISHAScoreCalculator.classifyRiskQuadrant(20, 0.15, 3).name).toBe('CRITICAL COLLAPSE');
    // |gap| <= 10 and mid-range: aligned but only fair/concerning
    expect(DISHAScoreCalculator.classifyRiskQuadrant(55, 0.6, 33).name).toBe('ALIGNED - MIXED HEALTH');
  });

  it('a large gap-based name (Delusional Comfort) overrides the magnitude-based name even at CRITICAL health', () => {
    // healthIndex=5.21 alone would suggest "CRITICAL COLLAPSE", but the gap
    // (73.1) says the school is aligned on nothing - the gap-based name wins.
    const result = DISHAScoreCalculator.classifyRiskQuadrant(90, 0.169, 5.21);
    expect(result.riskLevel).toBe('CRITICAL'); // magnitude still says critical...
    expect(result.name).toBe('DELUSIONAL COMFORT'); // ...but the character name is gap-driven
  });
});

describe('DISHAScoreCalculator - full pipeline (golden worked examples)', () => {
  it('worked example 1: mid-severity answers + poor-but-not-terrible metrics -> CRITICAL COLLAPSE', () => {
    const score = DISHAScoreCalculator.calculateCompleteScore(
      [
        { questionId: 'q1', weight: 6 },
        { questionId: 'q2', weight: 8 },
        { questionId: 'q3', weight: 5 }
      ],
      30,
      { studentTeacherRatio: 32, parentResponseSLA: 30, annualTrainingHours: 18, weeklyPlanningHours: 4 }
    );
    expect(score.s_sub).toBe(36.67);
    expect(score.m_obj).toBe(0.461);
    expect(score.delusionPenalty).toBe(0);
    expect(score.healthIndex).toBe(16.9);
    expect(score.scaledScore).toBe(16.9);
    expect(score.riskQuadrant).toBe('RED');
    expect(score.riskLevel).toBe('CRITICAL');
    expect(score.riskQuadrantName).toBe('CRITICAL COLLAPSE');
  });

  it('worked example 2: near-perfect answers + very poor metrics -> Delusion Penalty applies, DELUSIONAL COMFORT', () => {
    const score = DISHAScoreCalculator.calculateCompleteScore(
      [
        { questionId: 'q1', weight: 1 },
        { questionId: 'q2', weight: 1 }
      ],
      20,
      { studentTeacherRatio: 40, parentResponseSLA: 60, annualTrainingHours: 10, weeklyPlanningHours: 2 }
    );
    expect(score.s_sub).toBe(90);
    expect(score.m_obj).toBe(0.169);
    expect(score.delusionPenalty).toBe(10);
    expect(score.healthIndex).toBe(5.21);
    expect(score.riskQuadrant).toBe('RED');
    expect(score.riskLevel).toBe('CRITICAL');
    expect(score.riskQuadrantName).toBe('DELUSIONAL COMFORT');
  });

  it('is deterministic: identical input produces byte-identical output across repeated calls', () => {
    const input = {
      answers: [
        { questionId: 'q1', weight: 4 },
        { questionId: 'q2', weight: 7 }
      ],
      max: 20,
      metrics: { studentTeacherRatio: 24, parentResponseSLA: 20, annualTrainingHours: 22, weeklyPlanningHours: 5 }
    };
    const runs = Array.from({ length: 5 }, () =>
      DISHAScoreCalculator.calculateCompleteScore(input.answers, input.max, input.metrics)
    );
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i]).toEqual(runs[0]);
    }
  });
});
