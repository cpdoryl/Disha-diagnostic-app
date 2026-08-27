/**
 * Stage 3: Reverse Outcome Modeling.
 *
 * Every figure on this page is either read directly from the school's real
 * 14D diagnostic report, or computed by re-running the actual objective
 * scoring engine (`computeDimensionObjectiveScore`) - the same engine that
 * produces the report's real scores. There is no invented "confidence
 * tier", no fictional district precedent, and no made-up per-dimension
 * weighting: the overall Health Index in this app is a plain equal-weighted
 * average across the 14 dimensions, so the target cascade below is built on
 * that same plain average, and metric-level moves reuse the exact
 * required/optional weighting already defined in the live scoring schema.
 *
 * Workflow:
 *  1. Pick an analyzed 14D assessment event to simulate against.
 *  2. Set one desired overall objective score; it auto-splits into 14
 *     per-dimension targets proportional to each dimension's own gap to
 *     100 - then each target is freely editable by hand.
 *  3. Run the simulation: for every dimension with a target above its
 *     current score, the engine greedily finds the minimum ordered set of
 *     real captured metrics that need to move to reach it, re-scoring with
 *     the real engine at every step.
 *  4. Each required move is shown with a suggested owner (reusing the same
 *     generic role mapping already disclosed on the Action Plan) and, if
 *     the school enters a ₹-per-unit rate for that metric, an estimated
 *     cost - cost = |required change| × the rate the school entered, never
 *     an invented conversion factor.
 */
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import {
  Target,
  RefreshCw,
  AlertCircle,
  Info,
  IndianRupee,
  Zap,
  CheckCircle2,
  Save,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { AssessmentEventSummary, listAssessmentEventsForSchool } from '../lib/assessmentEventService';
import { assembleFullDiagnosticReport, FullDiagnosticReportData } from '../lib/fullDiagnosticReport';
import {
  computeDimensionTargetCascade,
  simulateReverseOutcome,
  DimensionTargetCascade,
  ReverseSimulationResult,
} from '../lib/reverseOutcomeEngine';
import { getOwnerRole } from '../lib/actionPlan';
import { CostRatesByDimension, loadCostRatesForEvent, saveCostRate } from '../lib/costRateService';
import { loadSimulationScenario, saveSimulationScenario } from '../lib/simulationScenarioService';
import { generateSimulationPlanPdf } from '../lib/simulationPlanPdf';
import { downloadSimulationPlanCsv } from '../lib/simulationPlanCsv';

export const SimulateStage = () => {
  const { activeSchool } = useAppStore();

  const [events, setEvents] = useState<AssessmentEventSummary[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  const [report, setReport] = useState<FullDiagnosticReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  const [costRates, setCostRates] = useState<CostRatesByDimension>({});
  const [desiredOverall, setDesiredOverall] = useState<number>(80);
  const [cascade, setCascade] = useState<DimensionTargetCascade | null>(null);
  const [dimensionTargets, setDimensionTargets] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, ReverseSimulationResult>>({});
  const [hasRun, setHasRun] = useState(false);
  const [savingRateKey, setSavingRateKey] = useState<string | null>(null);
  const [isSavingScenario, setIsSavingScenario] = useState(false);
  const [scenarioSavedAt, setScenarioSavedAt] = useState<Date | null>(null);
  const [restoredScenario, setRestoredScenario] = useState(false);

  useEffect(() => {
    if (!activeSchool) {
      setIsLoadingEvents(false);
      return;
    }
    setIsLoadingEvents(true);
    setEventsError('');
    listAssessmentEventsForSchool(activeSchool.id)
      .then((list) => {
        const analyzed = list.filter((e) => e.status === 'analyzed');
        setEvents(analyzed);
        if (analyzed.length > 0) setSelectedEventId(analyzed[0].id);
      })
      .catch((err) => {
        console.error('Failed to load assessment events:', err);
        setEventsError('Could not load assessment events. Please try again.');
      })
      .finally(() => setIsLoadingEvents(false));
  }, [activeSchool]);

  useEffect(() => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) {
      setReport(null);
      return;
    }
    setIsLoadingReport(true);
    setReportError('');
    setHasRun(false);
    setResults({});
    setCascade(null);
    setRestoredScenario(false);
    setScenarioSavedAt(null);
    Promise.all([
      assembleFullDiagnosticReport(event.id, event.schoolName, event.eventName),
      loadCostRatesForEvent(event.id),
      loadSimulationScenario(event.id),
    ])
      .then(([reportData, rates, scenario]) => {
        setReport(reportData);
        setCostRates(rates);

        if (scenario) {
          setDesiredOverall(scenario.desiredOverall);
          setDimensionTargets(scenario.dimensionTargets);
          setCascade(computeDimensionTargetCascade(reportData.dimensionCards, scenario.desiredOverall));
          setResults(runSimulation(reportData, scenario.dimensionTargets));
          setHasRun(true);
          setRestoredScenario(true);
          setScenarioSavedAt(scenario.updatedAt);
          return;
        }

        const withData = reportData.dimensionCards.filter((c) => c.objective);
        const currentOverall =
          withData.length > 0
            ? Math.round((withData.reduce((sum, c) => sum + c.objective!.objectiveScore, 0) / withData.length) * 10) / 10
            : 80;
        setDesiredOverall(Math.min(100, Math.round(currentOverall + 5)));
        setDimensionTargets({});
      })
      .catch((err) => {
        console.error('Failed to compute report for simulation:', err);
        setReportError('Could not load the diagnostic report for this event. Please try again.');
      })
      .finally(() => setIsLoadingReport(false));
  }, [selectedEventId, events]);

  function runSimulation(
    reportData: FullDiagnosticReportData,
    targets: Record<string, number>
  ): Record<string, ReverseSimulationResult> {
    const nextResults: Record<string, ReverseSimulationResult> = {};
    for (const card of reportData.dimensionCards) {
      const target = targets[card.dimensionId];
      if (!card.objective || target == null || target <= card.objective.objectiveScore) continue;
      const result = simulateReverseOutcome(card.dimensionId, card.objectiveRawValues, target);
      if (result) nextResults[card.dimensionId] = result;
    }
    return nextResults;
  }

  const handleApplyCascade = () => {
    if (!report) return;
    const result = computeDimensionTargetCascade(report.dimensionCards, desiredOverall);
    setCascade(result);
    const nextTargets: Record<string, number> = {};
    for (const entry of result.entries) {
      if (entry.hasObjectiveData && entry.suggestedTarget != null) {
        nextTargets[entry.dimensionId] = entry.suggestedTarget;
      }
    }
    setDimensionTargets(nextTargets);
    setHasRun(false);
    setResults({});
    setRestoredScenario(false);
  };

  const handleTargetChange = (dimensionId: string, value: number) => {
    setDimensionTargets((prev) => ({ ...prev, [dimensionId]: value }));
    setHasRun(false);
    setRestoredScenario(false);
  };

  const handleRunSimulation = () => {
    if (!report) return;
    setResults(runSimulation(report, dimensionTargets));
    setHasRun(true);
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    const doc = generateSimulationPlanPdf(report, results, costRates, desiredOverall, cascade?.currentOverallObjective ?? null, achievedOverall);
    const safeSchool = report.schoolName.replace(/[^a-z0-9]+/gi, '-');
    const safeEvent = report.eventName.replace(/[^a-z0-9]+/gi, '-');
    doc.save(`14D-Simulation-Plan-${safeSchool}-${safeEvent}.pdf`);
  };

  const handleDownloadCsv = () => {
    if (!report) return;
    downloadSimulationPlanCsv(report, results, costRates);
  };

  const handleSaveScenario = async () => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) return;
    setIsSavingScenario(true);
    try {
      await saveSimulationScenario(event.id, desiredOverall, dimensionTargets);
      setScenarioSavedAt(new Date());
    } catch (err) {
      console.error('Failed to save scenario:', err);
    } finally {
      setIsSavingScenario(false);
    }
  };

  const handleRateChange = async (dimensionId: string, metricId: string, rateText: string) => {
    const rate = Number(rateText);
    if (rateText.trim() === '' || Number.isNaN(rate) || rate < 0) return;
    setCostRates((prev) => ({
      ...prev,
      [dimensionId]: { ...(prev[dimensionId] || {}), [metricId]: rate },
    }));
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) return;
    const key = `${dimensionId}:${metricId}`;
    setSavingRateKey(key);
    try {
      await saveCostRate(event.id, dimensionId, metricId, rate);
    } catch (err) {
      console.error('Failed to save cost rate:', err);
    } finally {
      setSavingRateKey((cur) => (cur === key ? null : cur));
    }
  };

  const achievedOverall = (() => {
    if (!report) return null;
    const withData = report.dimensionCards.filter((c) => c.objective);
    if (withData.length === 0) return null;
    const sum = withData.reduce((acc, c) => {
      const target = dimensionTargets[c.dimensionId];
      return acc + (target != null ? target : c.objective!.objectiveScore);
    }, 0);
    return Math.round((sum / withData.length) * 10) / 10;
  })();

  let totalCost = 0;
  let pricedItems = 0;
  let totalItems = 0;
  for (const [dimensionId, result] of Object.entries(results) as [string, ReverseSimulationResult][]) {
    for (const step of result.steps) {
      totalItems += 1;
      const rate = costRates[dimensionId]?.[step.metricId];
      if (rate != null) {
        pricedItems += 1;
        totalCost += Math.abs(step.toValue - step.fromValue) * rate;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Stage 3: Simulate (Reverse Outcome Modeling)</h2>
        <p className="text-gray-500 mt-1">
          Set a target score, see exactly which real operational metrics need to move to reach it, who owns each move,
          and - if you enter your own cost rates - what it's likely to cost.
        </p>
      </div>

      {!activeSchool && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Select a school first to see its assessment events.
        </div>
      )}

      {activeSchool && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment event to simulate against</label>
          {isLoadingEvents ? (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading events...
            </p>
          ) : eventsError ? (
            <p className="text-sm text-red-600">{eventsError}</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">
              No analyzed 14D assessment events yet for {activeSchool.name}. Run and lock an assessment in the 14D
              Assessment flow first, then come back here to simulate against it.
            </p>
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 font-medium focus:ring-blue-500 focus:border-blue-500"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.eventName}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {isLoadingReport && (
        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading diagnostic report...
        </div>
      )}
      {reportError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{reportError}</p>
        </div>
      )}

      {report && (
        <>
          {restoredScenario && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              Restored the scenario you last saved for this event
              {scenarioSavedAt ? ` (${scenarioSavedAt.toLocaleString()})` : ''}. Edit anything below and save again to
              update it.
            </div>
          )}

          {report.objectiveCompleteness.dimensionsWithAnyData === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              No dimension in this event has captured objective operational data yet, so there is nothing to
              reverse-solve from. Capture operational data in the Deploy stage first.
            </div>
          ) : (
            <>
              {/* Step 1: overall target */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Step 1 - Set an Overall Target</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Current Overall Objective Score
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {cascade?.currentOverallObjective ?? '—'}
                      <span className="text-sm font-normal text-gray-400">/100</span>
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Desired Overall Target</p>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={desiredOverall}
                      onChange={(e) => setDesiredOverall(Number(e.target.value))}
                      className="w-full bg-transparent text-2xl font-bold text-blue-900 border-none focus:ring-0 p-0"
                    />
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                      Achieved Overall (from targets below)
                    </p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {achievedOverall ?? '—'}
                      <span className="text-sm font-normal text-emerald-500">/100</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleApplyCascade}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Apply to All 14 Dimensions
                </button>
                {cascade && <p className="text-xs text-gray-500 mt-3 leading-relaxed">{cascade.note}</p>}
              </div>

              {/* Step 2: dimension targets */}
              {cascade && (
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Step 2 - Fine-Tune Each Dimension</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Each target below was auto-suggested by the split above. Edit any of them directly - the "Achieved
                    Overall" figure recalculates from whatever is in these boxes.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                          <th className="py-2 pr-3">Dimension</th>
                          <th className="py-2 pr-3">Current</th>
                          <th className="py-2 pr-3">Target</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cascade.entries.map((entry) => (
                          <tr key={entry.dimensionId} className="border-b border-gray-50 last:border-0">
                            <td className="py-2 pr-3 font-medium text-gray-800">{entry.dimensionName}</td>
                            <td className="py-2 pr-3 text-gray-600">
                              {entry.hasObjectiveData ? `${entry.currentScore}/100` : 'No data'}
                            </td>
                            <td className="py-2 pr-3">
                              {entry.hasObjectiveData ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={dimensionTargets[entry.dimensionId] ?? entry.suggestedTarget ?? 0}
                                  onChange={(e) => handleTargetChange(entry.dimensionId, Number(e.target.value))}
                                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-5 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={handleRunSimulation}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      Run Simulation
                    </button>
                    <button
                      onClick={handleSaveScenario}
                      disabled={isSavingScenario}
                      className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-60"
                    >
                      {isSavingScenario ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSavingScenario ? 'Saving...' : 'Save Scenario'}
                    </button>
                    {scenarioSavedAt && !isSavingScenario && (
                      <span className="text-xs text-gray-400">Saved {scenarioSavedAt.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 & 4: results */}
              {hasRun && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Step 3 - Required Actions, Owners & Cost</h3>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                          Each row below moves one real captured metric to its documented benchmark, re-scored with the
                          same engine that computes your report. Owner roles reuse the same generic suggested mapping
                          shown on the Action Plan - replace with your real staff assignments. Cost only appears once
                          you enter a ₹-per-unit rate; it is never estimated for you.
                        </p>
                      </div>
                      {Object.keys(results).length > 0 && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={handleDownloadPdf}
                            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                          <button
                            onClick={handleDownloadCsv}
                            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            CSV
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {Object.keys(results).length === 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                      No dimension has a target above its current score, so there is nothing to simulate. Raise a
                      target in Step 2 and run the simulation again.
                    </div>
                  )}

                  {report.dimensionCards
                    .filter((card) => results[card.dimensionId])
                    .map((card) => {
                      const result = results[card.dimensionId];
                      const owner = getOwnerRole(card.dimensionId);
                      return (
                        <div key={card.dimensionId} className="bg-white rounded-lg border border-gray-200 p-5">
                          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900">{card.dimensionName}</h4>
                              <p className="text-xs text-gray-500">
                                {result.currentScore}/100 → target {result.targetScore}/100 · Owner: {owner}
                              </p>
                            </div>
                            {result.achievable ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" /> Achievable
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                <AlertCircle className="w-3 h-3" /> Not fully achievable
                              </span>
                            )}
                          </div>

                          {!result.achievable && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded p-2 mb-3">
                              Even pushing every currently captured metric to its benchmark caps this dimension at{' '}
                              {result.maxAchievableScore}/100, reaching {result.finalScore}/100 with the moves below.
                              Closing the rest of the gap needs additional metrics captured or operational change
                              beyond what's tracked here.
                            </p>
                          )}

                          {result.steps.length === 0 ? (
                            <p className="text-xs text-gray-500">
                              Target is already at or below the current score - no metric needs to move.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {result.steps.map((step, idx) => {
                                const rateKey = `${card.dimensionId}:${step.metricId}`;
                                const currentRate = costRates[card.dimensionId]?.[step.metricId];
                                const stepCost = currentRate != null ? Math.abs(step.toValue - step.fromValue) * currentRate : null;
                                return (
                                  <div
                                    key={step.metricId}
                                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50"
                                  >
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900 text-sm">
                                        {idx + 1}. {step.label}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {step.fromValue}
                                        {step.unit} → {step.toValue}
                                        {step.unit} (benchmark) · score {step.scoreBefore} → {step.scoreAfter}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <IndianRupee className="w-3 h-3" />
                                        <span>per {step.unit}</span>
                                      </div>
                                      <input
                                        type="number"
                                        min={0}
                                        placeholder="rate"
                                        defaultValue={currentRate ?? ''}
                                        onBlur={(e) => handleRateChange(card.dimensionId, step.metricId, e.target.value)}
                                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                      />
                                      {savingRateKey === rateKey && <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />}
                                      <span className="text-sm font-semibold text-gray-800 w-28 text-right">
                                        {stepCost != null ? `₹${stepCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'Not priced'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {totalItems > 0 && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-indigo-700" />
                        <p className="font-bold text-indigo-900">Step 4 - Estimated Cost Rollup</p>
                      </div>
                      <p className="text-2xl font-bold text-indigo-800">
                        ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-indigo-700 mt-1">
                        {pricedItems} of {totalItems} required metric moves have a ₹ rate entered
                        {pricedItems < totalItems
                          ? ' - this total is a partial estimate until every row above has a rate.'
                          : ' - every required move is priced.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
