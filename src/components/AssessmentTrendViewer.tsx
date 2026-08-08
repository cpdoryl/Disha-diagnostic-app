import React, { useState } from 'react';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Archive
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  AssessmentVersion,
  AssessmentHistory,
  compareVersions
} from '../lib/assessmentVersioning';

interface AssessmentTrendViewerProps {
  history: AssessmentHistory;
  onSelectVersion?: (version: AssessmentVersion) => void;
  onExport?: (history: AssessmentHistory) => void;
}

export const AssessmentTrendViewer: React.FC<AssessmentTrendViewerProps> = ({
  history,
  onSelectVersion,
  onExport
}) => {
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | '3months' | '6months' | '1year'>('all');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<AssessmentVersion[]>([]);

  // Filter versions by date range
  const filteredVersions = history.versions;

  // Prepare chart data for trends
  const chartData = history.trends.map(trend => ({
    name: trend.dimensionName,
    trend: trend.overallTrend,
    improvement: trend.scoreImprovement,
    improvementPct: trend.improvementPercentage,
    versions: trend.versions.length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Assessment Trends & History</h3>
          <p className="text-sm text-gray-600 mt-1">{history.totalAssessments} assessments over time</p>
        </div>
        <button
          onClick={() => onExport?.(history)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Overall Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-600 uppercase mb-2">Total Assessments</p>
          <p className="text-3xl font-bold text-gray-900">{history.totalAssessments}</p>
          <p className="text-xs text-gray-500 mt-2">
            From {history.overallProgress.startDate} to {history.overallProgress.endDate}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-600 uppercase mb-2">Avg Score Improvement</p>
          <p className="text-3xl font-bold text-emerald-600">
            +{history.overallProgress.averageScoreImprovement.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-2">points across dimensions</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-600 uppercase mb-2">Improving Areas</p>
          <p className="text-3xl font-bold text-emerald-600">{history.overallProgress.dimensionsImproving}</p>
          <p className="text-xs text-gray-500 mt-2">positive trends</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-600 uppercase mb-2">Areas of Concern</p>
          <p className="text-3xl font-bold text-red-600">{history.overallProgress.dimensionsDeclining}</p>
          <p className="text-xs text-gray-500 mt-2">declining trends</p>
        </div>
      </div>

      {/* Trend Chart */}
      {history.trends.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4">Dimension Trends</h4>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis label={{ value: 'Score Improvement (points)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [value?.toFixed(1), 'Change']}
                />
                <Bar
                  dataKey="improvement"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Assessment History Timeline */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900">Assessment History</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-semibold transition-colors',
                comparisonMode
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {comparisonMode ? '✓ Comparing' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredVersions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No assessments found</p>
            </div>
          ) : (
            filteredVersions
              .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
              .map((version, idx) => {
                const nextVersion = filteredVersions[idx - 1];
                const comparison = nextVersion ? compareVersions(version, nextVersion) : null;
                const isSelected = selectedVersions.some(v => v.id === version.id);

                return (
                  <div key={version.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      {comparisonMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedVersions(selectedVersions.filter(v => v.id !== version.id));
                            } else {
                              setSelectedVersions([...selectedVersions, version]);
                            }
                          }}
                          className="mt-1 w-4 h-4 cursor-pointer"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-900">
                            Assessment #{version.versionNumber}
                          </span>
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-bold',
                            version.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            version.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-100 text-blue-700'
                          )}>
                            {version.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {version.dateFormatted}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {version.totalRespondents} respondents
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {version.completionPercentage}% complete
                          </span>
                        </div>

                        {/* Comparison info if available */}
                        {comparison && (
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            {comparison.dimensionChanges.slice(0, 3).map(change => (
                              <span
                                key={change.dimensionId}
                                className={cn(
                                  'px-2 py-1 rounded-full font-semibold',
                                  change.trend === 'improved' ? 'bg-emerald-50 text-emerald-700' :
                                  change.trend === 'declined' ? 'bg-red-50 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                )}
                              >
                                {change.dimensionName}: {change.trend === 'improved' ? '↑' : change.trend === 'declined' ? '↓' : '→'} {Math.abs(change.change).toFixed(1)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onSelectVersion?.(version)}
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-xs whitespace-nowrap"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonMode && selectedVersions.length === 2 && (
        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl space-y-4">
          <h4 className="font-bold text-gray-900">
            Comparing Assessment #{selectedVersions[0].versionNumber} vs #{selectedVersions[1].versionNumber}
          </h4>

          {(() => {
            const comp = compareVersions(selectedVersions[0], selectedVersions[1]);
            return (
              <div className="space-y-4">
                {/* Overall changes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Respondent Change</p>
                    <p className={cn(
                      'text-2xl font-bold',
                      comp.respondentChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {comp.respondentChange >= 0 ? '+' : ''}{comp.respondentChange}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Completion Change</p>
                    <p className={cn(
                      'text-2xl font-bold',
                      comp.completionChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {comp.completionChange >= 0 ? '+' : ''}{comp.completionChange}%
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Improved Dimensions</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {comp.dimensionChanges.filter(d => d.trend === 'improved').length}
                    </p>
                  </div>
                </div>

                {/* Dimension comparisons */}
                <div className="bg-white rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold text-gray-900">Dimension</th>
                        <th className="px-4 py-2 text-right font-bold text-gray-900">Before</th>
                        <th className="px-4 py-2 text-right font-bold text-gray-900">After</th>
                        <th className="px-4 py-2 text-right font-bold text-gray-900">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comp.dimensionChanges.map(change => (
                        <tr key={change.dimensionId} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold text-gray-900">{change.dimensionName}</td>
                          <td className="px-4 py-2 text-right text-gray-700">{change.version1Score.toFixed(1)}</td>
                          <td className="px-4 py-2 text-right text-gray-700">{change.version2Score.toFixed(1)}</td>
                          <td className={cn(
                            'px-4 py-2 text-right font-bold',
                            change.trend === 'improved' ? 'text-emerald-600' :
                            change.trend === 'declined' ? 'text-red-600' :
                            'text-gray-600'
                          )}>
                            {change.trend === 'improved' ? '↑' : change.trend === 'declined' ? '↓' : '→'} {Math.abs(change.change).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {comparisonMode && selectedVersions.length !== 2 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-900">
          Select exactly 2 assessments to compare them
        </div>
      )}
    </div>
  );
};

export default AssessmentTrendViewer;
