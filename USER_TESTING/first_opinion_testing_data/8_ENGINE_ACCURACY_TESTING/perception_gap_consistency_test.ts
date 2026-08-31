// Run from the repo root: npx tsx USER_TESTING/first_opinion_testing_data/8_ENGINE_ACCURACY_TESTING/perception_gap_consistency_test.ts
import { CHALLENGE_DATA_REQUIREMENTS } from '../../../src/lib/challengeDataRequirements';
import { COMPLETE_SCREENING_QUESTIONS } from '../../../src/data/screeningQuestionsData';
import { computePerceptionGapReport, getChallengeObjectiveWeight } from '../../../src/lib/challengeObjectiveScoring';

// Master dataset values (same as operational_metrics_master_ALL_15_CHALLENGES.csv)
const masterMetrics: Record<string, number> = {
  students_per_classroom: 28, parent_query_response_sla_hours: 24, annual_training_hours: 20, weekly_planning_hours: 4,
  new_student_intake_rate_pct: -8, student_retention_rate_pct: 78,
  midyear_dropout_rate_pct: 6, outflow_to_competitors_pct: 4,
  fee_realization_rate_pct: 86, days_sales_outstanding: 45,
  teacher_turnover_rate_pct: 22, avg_teacher_tenure_years: 3.5,
  teacher_competency_score_pct: 68, professional_qualification_pct: 74,
  leadership_competency_score_pct: 60, principal_vp_experience_years: 5,
  board_exam_pass_rate_pct: 87, average_subject_score_pct: 71,
  mental_health_incidents_per_1000: 12, safety_violations_count_year: 5,
  remedial_support_coverage_pct: 35, improvement_rate_pct: 48,
  parent_satisfaction_score_pct: 58, parent_response_rate_pct: 65,
  market_share_loss_pct: 5, competitor_win_rate_pct: 30,
  brand_perception_score_pct: 62, media_sentiment_pct: 55,
  cost_increase_yoy_pct: 14, operating_margin_pct: 6,
  infrastructure_quality_score_pct: 70, maintenance_backlog_inr: 850000,
  compliance_score_pct: 80, regulatory_violations_count_year: 1
};

const ids = Object.keys(CHALLENGE_DATA_REQUIREMENTS);

// Build "matched" subjective answers: for each challenge, for each question,
// pick the option whose weight is closest to that challenge's objective weight.
function buildMatchedAnswers(): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const id of ids) {
    const objResult = getChallengeObjectiveWeight(id, masterMetrics);
    if (!objResult) continue;
    const targetWeight = objResult.weight;
    const challenge = COMPLETE_SCREENING_QUESTIONS.find(c => c.id === id);
    if (!challenge) continue;
    challenge.questions.forEach(q => {
      let best = q.options![0];
      let bestDiff = Math.abs(best.weight - targetWeight);
      for (const opt of q.options!) {
        const diff = Math.abs(opt.weight - targetWeight);
        if (diff < bestDiff) { best = opt; bestDiff = diff; }
      }
      answers[q.id] = best.value;
    });
  }
  return answers;
}

const matchedAnswers = buildMatchedAnswers();

// Generate all C(15,3) = 455 combinations
function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  function helper(start: number, combo: T[]) {
    if (combo.length === k) { result.push([...combo]); return; }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return result;
}

const allCombos = combinations(ids, 3);
console.log('Total combinations tested:', allCombos.length);

const verdictCounts: Record<string, number> = {};
let totalChallengeEntries = 0;
const gaps: number[] = [];

for (const combo of allCombos) {
  const report = computePerceptionGapReport(combo, matchedAnswers, masterMetrics);
  for (const entry of report) {
    totalChallengeEntries++;
    verdictCounts[entry.verdict] = (verdictCounts[entry.verdict] || 0) + 1;
    if (entry.gap !== null) gaps.push(Math.abs(entry.gap));
  }
}

console.log('Total challenge-entries evaluated:', totalChallengeEntries, '(455 combos x 3 challenges)');
console.log('Verdict distribution:', verdictCounts);
console.log('Aligned %:', ((verdictCounts['ALIGNED'] || 0) / totalChallengeEntries * 100).toFixed(2) + '%');
const avgGap = gaps.reduce((a,b)=>a+b,0) / gaps.length;
const maxGap = Math.max(...gaps);
console.log('Average |gap| (points on 1-10 scale):', avgGap.toFixed(3));
console.log('Max |gap| observed:', maxGap.toFixed(3));

// --- Adversarial test: leadership always picks the rosiest (weight-1) option
// regardless of actual objective data, simulating "delusional" self-reporting ---
function buildRosyAnswers(): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const id of ids) {
    const challenge = COMPLETE_SCREENING_QUESTIONS.find(c => c.id === id);
    if (!challenge) continue;
    challenge.questions.forEach(q => {
      const best = q.options!.reduce((a, b) => (a.weight < b.weight ? a : b));
      answers[q.id] = best.value;
    });
  }
  return answers;
}

const rosyAnswers = buildRosyAnswers();
const rosyVerdictCounts: Record<string, number> = {};
let rosyEntries = 0;
for (const combo of allCombos) {
  const report = computePerceptionGapReport(combo, rosyAnswers, masterMetrics);
  for (const entry of report) {
    rosyEntries++;
    rosyVerdictCounts[entry.verdict] = (rosyVerdictCounts[entry.verdict] || 0) + 1;
  }
}
console.log('\n--- Adversarial test: leadership always self-reports the best possible answer ---');
console.log('Total challenge-entries:', rosyEntries);
console.log('Verdict distribution:', rosyVerdictCounts);
// Ground truth here = the master dataset's own objective severity per challenge.
// A challenge is "truly concerning" if getChallengeObjectiveWeight(...) > 5.
const trulyConcerningEntries = allCombos.flatMap(combo => combo)
  .filter(id => (getChallengeObjectiveWeight(id, masterMetrics)?.weight ?? 0) > 5).length;
console.log('Truly-concerning challenge-instances (objective weight > 5) in this run:', trulyConcerningEntries);
console.log(
  'Detection rate (of truly-concerning instances correctly flagged DELUSIONAL_COMFORT despite rosy self-report):',
  (((rosyVerdictCounts['DELUSIONAL_COMFORT'] || 0) / trulyConcerningEntries) * 100).toFixed(2) + '%'
);
console.log(
  '(as a share of ALL challenge-instances, not just the concerning ones):',
  ((rosyVerdictCounts['DELUSIONAL_COMFORT'] || 0) / rosyEntries * 100).toFixed(2) + '%'
);

console.log('\n--- Objective severity per challenge (master dataset) ---');
for (const id of ids) {
  const r = getChallengeObjectiveWeight(id, masterMetrics);
  console.log(id, '->', r?.weight, r && r.weight > 5 ? '[CONCERN]' : '[fine]');
}
