import React from 'react';
import { TrendingUp, TrendingDown, Zap, AlertCircle } from 'lucide-react';
import { SubjectiveVsObjective, compareSubjectiveVsObjective } from '../lib/objectiveDataCalculator';
import { cn } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface SubjectiveVsObjectiveViewProps {
  dimensionName: string;
  subjectiveScore: number;
  objectiveScore: number;
  benchmarkScore: number;
  dimensionId?: string;
}

export const SubjectiveVsObjectiveView: React.FC<SubjectiveVsObjectiveViewProps> = ({
  dimensionName,
  subjectiveScore,
  objectiveScore,
  benchmarkScore,
  dimensionId
}) => {
  const comparison = compareSubjectiveVsObjective(subjectiveScore, objectiveScore, dimensionName);

  const chartData = [
    {
      name: 'Subjective\n(Survey)',
      score: subjectiveScore,
      fill: '#3b82f6'
    },
    {
      name: 'Objective\n(Data)',
      score: objectiveScore,
      fill: '#8b5cf6'
    },
    {
      name: 'National\nBenchmark',
      score: benchmarkScore,
      fill: '#10b981'
    }
  ];

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'aligned':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'overestimated':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'underestimated':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getAlignmentIcon = (alignment: string) => {
    switch (alignment) {
      case 'aligned':
        return '✓';
      case 'overestimated':
        return '⚠️';
      case 'underestimated':
        return '⭐';
      default:
        return '?';
    }
  };

  const getGapInterpretation = () => {
    const gap = comparison.gap;
    if (Math.abs(gap) <= 5) {
      return 'Perception aligns with reality';
    } else if (gap > 5) {
      return `Leadership overestimating by ${gap.toFixed(1)} points`;
    } else {
      return `Leadership underestimating by ${Math.abs(gap).toFixed(1)} points`;
    }
  };

  const isAboveBenchmark = objectiveScore >= benchmarkScore;

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{dimensionName}</h3>
        <p className="text-sm text-gray-600 mt-1">Subjective Assessment vs Objective Data Comparison</p>
      </div>

      {/* Score Comparison Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : value}`}
              />
              <Bar dataKey="score" isAnimationActive={true}>
                {chartData.map((entry: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subjective Score */}
        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Subjective (Survey)</p>
          </div>
          <div className="text-4xl font-black text-blue-600">{subjectiveScore.toFixed(1)}</div>
          <p className="text-xs text-gray-600 mt-2">What leadership perceives</p>
        </div>

        {/* Objective Score */}
        <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Objective (Data)</p>
          </div>
          <div className="text-4xl font-black text-purple-600">{objectiveScore.toFixed(1)}</div>
          <p className="text-xs text-gray-600 mt-2">What operational data shows</p>
        </div>

        {/* National Benchmark */}
        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Benchmark</p>
          </div>
          <div className="text-4xl font-black text-emerald-600">{benchmarkScore.toFixed(1)}</div>
          <p className="text-xs text-gray-600 mt-2">National target score</p>
        </div>
      </div>

      {/* Alignment Analysis */}
      <div className={cn('p-6 rounded-xl border-2', getAlignmentColor(comparison.alignment))}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl flex-shrink-0">{getAlignmentIcon(comparison.alignment)}</span>
          <div className="flex-1">
            <p className="font-bold text-lg mb-1">
              {comparison.alignment === 'aligned'
                ? 'Perception & Reality Aligned'
                : comparison.alignment === 'overestimated'
                ? 'Delusional Comfort Zone'
                : 'Hidden Excellence Detected'}
            </p>
            <p className="text-sm leading-relaxed">{comparison.interpretation}</p>
          </div>
        </div>

        {/* Gap Details */}
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Gap Analysis:</span>
            <span className="text-lg font-bold">
              {comparison.gap > 0 ? '+' : ''}{comparison.gap.toFixed(1)} points
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Interpretation:</span>
            <span className="text-sm font-medium">{getGapInterpretation()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Confidence:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-current transition-all"
                  style={{ width: `${comparison.confidence}%` }}
                />
              </div>
              <span className="text-sm font-bold w-12">{comparison.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Comparison with Benchmark */}
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            {isAboveBenchmark ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <p className="font-bold text-gray-900">vs National Benchmark</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Objective Score:</span>
              <span className="text-lg font-bold text-gray-900">{objectiveScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Benchmark:</span>
              <span className="text-lg font-bold text-emerald-600">{benchmarkScore.toFixed(1)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">Gap:</span>
              <span
                className={cn(
                  'text-lg font-bold',
                  isAboveBenchmark ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {isAboveBenchmark ? '+' : ''}{(objectiveScore - benchmarkScore).toFixed(1)} points
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-700">
              <strong>{isAboveBenchmark ? '✓ Exceeds Standard: ' : '⚠️ Below Standard: '}</strong>
              {isAboveBenchmark
                ? 'Your objective performance meets or exceeds national standards. Focus on maintaining excellence and innovation.'
                : 'Your objective performance is below national standards. Prioritize improvement initiatives in this area.'}
            </p>
          </div>
        </div>

        {/* Perception vs Reality */}
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-600" />
            <p className="font-bold text-gray-900">Perception vs Reality</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">What leaders think:</span>
              <span className="text-lg font-bold text-blue-600">{subjectiveScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">What data shows:</span>
              <span className="text-lg font-bold text-purple-600">{objectiveScore.toFixed(1)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">Difference:</span>
              <span
                className={cn(
                  'text-lg font-bold',
                  comparison.alignment === 'aligned' ? 'text-emerald-600' : 'text-amber-600'
                )}
              >
                {comparison.gap > 0 ? '+' : ''}{comparison.gap.toFixed(1)} points
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-700">
              {comparison.alignment === 'aligned' && (
                <>
                  <strong>✓ Aligned: </strong>Leadership perception matches reality. This indicates good institutional awareness.
                </>
              )}
              {comparison.alignment === 'overestimated' && (
                <>
                  <strong>⚠️ Overestimated: </strong>Leadership may be overconfident. Use data to recalibrate expectations and focus on actual gaps.
                </>
              )}
              {comparison.alignment === 'underestimated' && (
                <>
                  <strong>⭐ Underestimated: </strong>You have hidden strengths! Data shows better performance than perceived. Build on these.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Data Quality Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">How this works:</p>
            <p>
              Subjective score comes from your leadership survey responses. Objective score is calculated from uploaded school data (attendance, fees, qualifications, etc.). When they differ significantly, it indicates either optimism bias, data gaps, or hidden strengths waiting to be leveraged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectiveVsObjectiveView;
