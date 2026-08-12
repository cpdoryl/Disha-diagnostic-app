import React, { useCallback, useEffect, useState } from 'react';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { FOURTEEN_DIMENSIONS } from '../../data/14DimensionsQuestions';
import { listAssessmentEventsForSchool, AssessmentEventSummary } from '../../lib/assessmentEventService';
import { loadObjectiveDataForEvent, RawObjectiveDataByDimension } from '../../lib/objectiveDataService';
import {
  computeAllObjectiveScores,
  computeObjectiveCompletenessSummary,
  ObjectiveCompletenessSummary,
  RawMetricEntry,
} from '../../lib/objectiveScoreEngine';
import { useAppStore } from '../../store';
import { ObjectiveDataEntryModal } from './ObjectiveDataEntryModal';
import { ObjectiveDataUploadModal } from './ObjectiveDataUploadModal';

interface ObjectiveDataCaptureProps {
  schoolId: string;
  schoolName: string;
  /**
   * When provided, skips auto-resolving/picking an assessment event and
   * captures data directly against this event - used when the caller
   * already has a specific event in scope (e.g. the deployment stage of
   * MultiUserAssessment.tsx). When omitted, the component resolves the
   * school's most recent event itself (used on Capture Stage, which has
   * no event in scope).
   */
  eventId?: string;
}

function statusForCompleteness(pct: number): { label: string; className: string } {
  if (pct === 0) return { label: 'No Data', className: 'bg-gray-100 text-gray-600' };
  if (pct >= 100) return { label: 'Complete', className: 'bg-emerald-100 text-emerald-700' };
  return { label: 'Partial', className: 'bg-amber-100 text-amber-700' };
}

export function ObjectiveDataCapture({ schoolId, eventId: explicitEventId }: ObjectiveDataCaptureProps) {
  const { setCurrentView } = useAppStore();
  const [events, setEvents] = useState<AssessmentEventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(explicitEventId || null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(!explicitEventId);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [rawData, setRawData] = useState<RawObjectiveDataByDimension>({});
  const [completeness, setCompleteness] = useState<ObjectiveCompletenessSummary | null>(null);
  const [entryDimensionId, setEntryDimensionId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (explicitEventId) {
      setSelectedEventId(explicitEventId);
      setIsLoadingEvents(false);
      return;
    }
    if (!schoolId) {
      setIsLoadingEvents(false);
      return;
    }
    let cancelled = false;
    setIsLoadingEvents(true);
    listAssessmentEventsForSchool(schoolId)
      .then((list) => {
        if (cancelled) return;
        setEvents(list);
        setSelectedEventId((prev) => prev || list[0]?.id || null);
      })
      .catch((err) => {
        console.error('Failed to load assessment events:', err);
        if (!cancelled) setLoadError('Could not load assessment events for this school.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEvents(false);
      });
    return () => {
      cancelled = true;
    };
  }, [schoolId, explicitEventId]);

  const refreshObjectiveData = useCallback(() => {
    if (!selectedEventId) return;
    setIsLoadingData(true);
    setLoadError('');
    loadObjectiveDataForEvent(selectedEventId)
      .then((raw) => {
        setRawData(raw);
        const rawByDimension: Record<string, Record<string, RawMetricEntry | undefined>> = {};
        for (const [dimId, data] of Object.entries(raw)) {
          rawByDimension[dimId] = data.metrics;
        }
        const scores = computeAllObjectiveScores(rawByDimension);
        setCompleteness(computeObjectiveCompletenessSummary(scores));
      })
      .catch((err) => {
        console.error('Failed to load objective data:', err);
        setLoadError('Could not load operational data for this event.');
      })
      .finally(() => setIsLoadingData(false));
  }, [selectedEventId]);

  useEffect(() => {
    refreshObjectiveData();
  }, [refreshObjectiveData]);

  if (isLoadingEvents) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-6">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading assessment events...
      </div>
    );
  }

  if (!explicitEventId && events.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 mb-4">
          No 14D assessment event exists yet for this school. Create one first, then come back here to capture
          operational data for it.
        </p>
        <button
          onClick={() => setCurrentView('14D_ASSESSMENT')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          Go to 14D Assessment
        </button>
      </div>
    );
  }

  const entryDimension = entryDimensionId ? FOURTEEN_DIMENSIONS.find((d) => d.id === entryDimensionId) : null;

  return (
    <div className="space-y-4">
      {events.length > 1 && (
        <select
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.eventName}
            </option>
          ))}
        </select>
      )}

      {loadError && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {loadError}
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
        <div>
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Objective Data Completeness</p>
          <p className="text-2xl font-bold text-indigo-900">
            {isLoadingData ? '—' : `${completeness?.overallCompleteness ?? 0}%`}
          </p>
        </div>
        <p className="text-xs text-indigo-700 text-right max-w-[45%]">
          {completeness?.dimensionsWithAnyData ?? 0}/14 dimensions have data,{' '}
          {completeness?.dimensionsFullyComplete ?? 0}/14 fully complete
        </p>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {FOURTEEN_DIMENSIONS.map((dim) => {
          const pct = completeness?.byDimension[dim.id]?.completeness ?? 0;
          const status = statusForCompleteness(pct);
          return (
            <div
              key={dim.id}
              className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{dim.name}</p>
                <p className="text-xs text-gray-500">{pct}% complete</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded ${status.className}`}>{status.label}</span>
                <button
                  onClick={() => setEntryDimensionId(dim.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  {pct > 0 ? 'Edit' : 'Add'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setIsUploadOpen(true)}
        disabled={!selectedEventId}
        className="w-full flex items-center justify-center gap-2 bg-white border border-dashed border-gray-300 hover:bg-gray-50 text-indigo-600 py-2.5 rounded-lg font-bold transition-colors text-sm disabled:opacity-50"
      >
        <UploadCloud className="w-4 h-4" />
        Upload Data File (CSV / Excel)
      </button>

      {entryDimension && selectedEventId && (
        <ObjectiveDataEntryModal
          dimensionId={entryDimension.id}
          dimensionName={entryDimension.name}
          eventId={selectedEventId}
          schoolId={schoolId}
          existingValues={rawData[entryDimension.id]?.metrics || {}}
          onSaved={() => {
            setEntryDimensionId(null);
            refreshObjectiveData();
          }}
          onClose={() => setEntryDimensionId(null)}
        />
      )}

      {isUploadOpen && selectedEventId && (
        <ObjectiveDataUploadModal
          eventId={selectedEventId}
          schoolId={schoolId}
          onSaved={() => {
            setIsUploadOpen(false);
            refreshObjectiveData();
          }}
          onClose={() => setIsUploadOpen(false)}
        />
      )}
    </div>
  );
}
