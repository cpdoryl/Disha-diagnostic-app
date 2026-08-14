import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { FileText, Calendar, CheckCircle2, Users } from 'lucide-react';
import { listAssessmentEventsForSchool, AssessmentEventSummary } from '../lib/assessmentEventService';
import { DiagnosticReport } from '../components/MultiUserAssessment';

export const SynthesizeStage = () => {
  const { activeSchool, setCurrentView } = useAppStore();
  const [events, setEvents] = useState<AssessmentEventSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AssessmentEventSummary | null>(null);

  useEffect(() => {
    if (!activeSchool) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAssessmentEventsForSchool(activeSchool.id)
      .then((allEvents) => {
        if (cancelled) return;
        const finalized = allEvents.filter((e) => e.status !== 'active' && e.totalActual > 0);
        setEvents(finalized);
        setSelectedEvent((prev) => prev ?? finalized[0] ?? null);
      })
      .catch((err) => {
        console.error('Failed to load assessment events:', err);
        if (!cancelled) setError('Could not load assessment events. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSchool?.id]);

  // The diagnostic report component already includes the executive summary,
  // radar/gap charts, prioritized recommendations, and the real PDF / Excel /
  // PNG / email export toolbar - Stage 4 uses the exact same real report
  // rather than a second, separate reimplementation of the same output.
  if (selectedEvent) {
    return (
      <DiagnosticReport
        assessmentId={selectedEvent.id}
        eventName={selectedEvent.eventName}
        schoolName={selectedEvent.schoolName}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Stage 4: Synthesize & Report</h2>
          <p className="text-gray-500 mt-1">
            Select a completed 14D Assessment event to generate and export its diagnostic report.
          </p>
        </div>
        {activeSchool && (
          <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-xs text-indigo-950 flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-indigo-950">{activeSchool.name}</span>
            <span className="text-indigo-300">|</span>
            <span className="font-bold">{activeSchool.board}</span>
            <span className="text-indigo-300">|</span>
            <span className="text-indigo-700">{activeSchool.city}</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500 font-medium">
          Loading assessment events...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl font-medium">{error}</div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-4">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <div>
            <p className="text-gray-700 font-bold">No completed assessment events yet.</p>
            <p className="text-gray-500 text-sm mt-1">
              Run and lock a 14D Assessment for this school to generate a report here.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('14D_ASSESSMENT')}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
          >
            Go to 14D Assessment
          </button>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Completed Assessment Events</h3>
            <p className="text-sm text-gray-500 mt-1">Choose one to generate and export its report.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-gray-900">{event.eventName}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.lockedAt
                        ? event.lockedAt.toLocaleDateString()
                        : event.createdAt?.toLocaleDateString() ?? 'Unknown date'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.totalActual} responses
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {event.status === 'analyzed' ? 'Analyzed' : 'Locked'}
                    </span>
                  </div>
                </div>
                <span className="text-indigo-600 font-bold text-sm">Open Report →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SynthesizeStage;
