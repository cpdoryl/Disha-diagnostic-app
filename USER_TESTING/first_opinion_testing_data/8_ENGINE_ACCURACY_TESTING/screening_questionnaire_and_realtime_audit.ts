// Run from the repo root:
//   npx tsx USER_TESTING/first_opinion_testing_data/8_ENGINE_ACCURACY_TESTING/screening_questionnaire_and_realtime_audit.ts
//
// Verifies:
// 1. Every one of the 15 challenges has a complete screening questionnaire
//    built (every question has options, every option has a valid label +
//    weight, no duplicates), and the question bank exactly matches the 15
//    challenges in challengeDataRequirements.ts (no orphans either side).
// 2. The Perception Gap engine's subjective-scoring never fails or produces
//    an invalid weight for ANY possible way a user could answer a
//    challenge's own questions - tested exhaustively (every combination of
//    every option, for every question, for every challenge), not sampled.
// 3. The full engine (computePerceptionGapReport) never crashes and always
//    returns a valid verdict for all 455 possible 3-challenge combinations,
//    each exercised with freshly randomized (not hand-picked) answers each
//    run, simulating real-time use.
import { COMPLETE_SCREENING_QUESTIONS } from '../../../src/data/screeningQuestionsData';
import { CHALLENGE_DATA_REQUIREMENTS, getRequiredMetricsForChallenges } from '../../../src/lib/challengeDataRequirements';
import { getChallengeSubjectiveWeight, getChallengeObjectiveWeight, computePerceptionGapReport } from '../../../src/lib/challengeObjectiveScoring';

const errors: string[] = [];
const warnings: string[] = [];

console.log('=== PART 1: Structural audit of screeningQuestionsData.ts ===\n');

const reqKeys = Object.keys(CHALLENGE_DATA_REQUIREMENTS);
const bankKeys = COMPLETE_SCREENING_QUESTIONS.map(c => c.id);
console.log('Challenges in requirements table:', reqKeys.length);
console.log('Challenges in question bank:', bankKeys.length);

const missingFromBank = reqKeys.filter(k => !bankKeys.includes(k));
const missingFromReq = bankKeys.filter(k => !reqKeys.includes(k));
if (missingFromBank.length) errors.push('In requirements but missing from question bank: ' + missingFromBank.join(', '));
if (missingFromReq.length) errors.push('In question bank but missing from requirements: ' + missingFromReq.join(', '));

let totalQuestions = 0;
let totalOptions = 0;
for (const challenge of COMPLETE_SCREENING_QUESTIONS) {
  if (!challenge.questions || challenge.questions.length === 0) {
    errors.push(`${challenge.id}: has NO questions at all`);
    continue;
  }
  totalQuestions += challenge.questions.length;
  for (const q of challenge.questions) {
    if (!q.options || q.options.length === 0) {
      errors.push(`${challenge.id} / ${q.id}: has NO options`);
      continue;
    }
    totalOptions += q.options.length;
    if (q.options.length < 4) warnings.push(`${challenge.id} / ${q.id}: only ${q.options.length} options (< 4, thin coverage)`);
    const values = q.options.map(o => o.value);
    if (new Set(values).size !== values.length) errors.push(`${challenge.id} / ${q.id}: duplicate option values`);
    for (const opt of q.options) {
      if (typeof opt.weight !== 'number' || isNaN(opt.weight)) errors.push(`${challenge.id} / ${q.id} / ${opt.value}: weight is not a valid number (${opt.weight})`);
      if (opt.weight < 1 || opt.weight > 10) errors.push(`${challenge.id} / ${q.id} / ${opt.value}: weight ${opt.weight} out of 1-10 range`);
      if (!opt.label || opt.label.trim() === '') errors.push(`${challenge.id} / ${q.id} / ${opt.value}: missing label`);
    }
    // Check weights are monotonic across options in declared order (should read low->high severity)
    const weights = q.options.map(o => o.weight);
    for (let i = 1; i < weights.length; i++) {
      if (weights[i] < weights[i - 1]) warnings.push(`${challenge.id} / ${q.id}: option weights not monotonically non-decreasing in declared order (${weights.join(',')})`);
    }
  }
}
console.log('Total questions across all 15 challenges:', totalQuestions);
console.log('Total answer options across all questions:', totalOptions);
console.log('Questions per challenge:', COMPLETE_SCREENING_QUESTIONS.map(c => `${c.id}=${c.questions.length}`).join(', '));

console.log('\n=== PART 2: Exhaustive per-challenge subjective-answer coverage ===\n');

function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>((acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])), [[]]);
}

let totalCombosTested = 0;
let subjectiveErrors = 0;
for (const challenge of COMPLETE_SCREENING_QUESTIONS) {
  const optionSets = challenge.questions.map(q => q.options!.map(o => o.value));
  const allAnswerCombos = cartesian(optionSets);
  totalCombosTested += allAnswerCombos.length;

  for (const combo of allAnswerCombos) {
    const answers: Record<string, string> = {};
    challenge.questions.forEach((q, i) => { answers[q.id] = combo[i]; });
    const result = getChallengeSubjectiveWeight(challenge.id, answers);
    if (!result || isNaN(result.weight) || result.weight < 1 || result.weight > 10) {
      subjectiveErrors++;
      if (subjectiveErrors <= 5) errors.push(`${challenge.id}: invalid subjective weight for answers ${JSON.stringify(answers)} -> ${JSON.stringify(result)}`);
    }
  }
  console.log(`${challenge.id}: ${allAnswerCombos.length} possible answer combinations, all produced valid weights: ${subjectiveErrors === 0}`);
}
console.log('\nTotal distinct answer-combinations exhaustively tested across all 15 challenges:', totalCombosTested);
console.log('Subjective scoring errors found:', subjectiveErrors);

console.log('\n=== PART 3: Full combination x exhaustive-answer perception gap smoke test ===\n');

// For a stress test, run computePerceptionGapReport for every one of the 455
// combinations, using a RANDOM valid answer combo per challenge each time
// (not just the master-matched one), against the master objective dataset.
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

function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  function helper(start: number, combo: T[]) {
    if (combo.length === k) { result.push([...combo]); return; }
    for (let i = start; i < arr.length; i++) { combo.push(arr[i]); helper(i + 1, combo); combo.pop(); }
  }
  helper(0, []);
  return result;
}

function randomAnswersForChallenge(challengeId: string): Record<string, string> {
  const challenge = COMPLETE_SCREENING_QUESTIONS.find(c => c.id === challengeId)!;
  const answers: Record<string, string> = {};
  challenge.questions.forEach(q => {
    const opts = q.options!;
    answers[q.id] = opts[Math.floor(Math.random() * opts.length)].value;
  });
  return answers;
}

const ids = Object.keys(CHALLENGE_DATA_REQUIREMENTS);
const allCombos = combinations(ids, 3);
let crashCount = 0;
let invalidVerdictCount = 0;
const validVerdicts = new Set(['ALIGNED', 'DELUSIONAL_COMFORT', 'HIDDEN_EXCELLENCE', 'CONFIRMED_CRISIS', 'INSUFFICIENT_DATA']);

for (const combo of allCombos) {
  let answers: Record<string, string> = {};
  combo.forEach(id => { answers = { ...answers, ...randomAnswersForChallenge(id) }; });
  try {
    const report = computePerceptionGapReport(combo, answers, masterMetrics);
    if (report.length !== 3) invalidVerdictCount++;
    for (const entry of report) {
      if (!validVerdicts.has(entry.verdict)) invalidVerdictCount++;
    }
  } catch (e) {
    crashCount++;
    if (crashCount <= 3) errors.push(`computePerceptionGapReport crashed for combo ${combo.join('+')}: ${e}`);
  }
}
console.log('Combinations tested with randomized real-time answers:', allCombos.length);
console.log('Crashes:', crashCount);
console.log('Invalid/unexpected verdicts:', invalidVerdictCount);

console.log('\n=== SUMMARY ===');
console.log('Errors found:', errors.length);
errors.forEach(e => console.log(' - ERROR:', e));
console.log('Warnings found:', warnings.length);
warnings.slice(0, 20).forEach(w => console.log(' - WARNING:', w));
if (warnings.length > 20) console.log(`  ...and ${warnings.length - 20} more warnings`);
