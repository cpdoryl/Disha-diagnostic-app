import React from 'react';
import { DISHAScore } from '../lib/dishaScoreCalculator';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface DISHAScoreDashboardProps {
  score: DISHAScore;
}

export const DISHAScoreDashboard: React.FC<DISHAScoreDashboardProps> = ({ score }) => {
  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'GREEN':
        return 'bg-emerald-100 border-emerald-300';
      case 'ORANGE':
        return 'bg-amber-100 border-amber-300';
      case 'YELLOW':
        return 'bg-yellow-100 border-yellow-300';
      case 'RED':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getQuadrantBadgeColor = (quadrant: string) => {
    switch (quadrant) {
      case 'GREEN':
        return 'bg-emerald-600 text-white';
      case 'ORANGE':
        return 'bg-amber-600 text-white';
      case 'YELLOW':
        return 'bg-yellow-600 text-white';
      case 'RED':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getRiskIcon = (quadrant: string) => {
    switch (quadrant) {
      case 'GREEN':
        return <CheckCircle className="w-8 h-8 text-emerald-600" />;
      case 'RED':
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
      default:
        return <Activity className="w-8 h-8 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 rounded-3xl border border-slate-700 text-white">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black mb-2">DISHA First Opinion Score</h2>
        <p className="text-sm text-slate-300">Evidence-based institutional health analysis combining leadership perception with operational reality</p>
      </div>

      {/* Risk Quadrant */}
      <div className={`p-6 rounded-2xl border-2 ${getQuadrantColor(score.riskQuadrant)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{score.riskQuadrantName}</h3>
            <p className="text-sm text-gray-700 mt-1">Classification: <strong>{score.riskLevel}</strong></p>
          </div>
          {getRiskIcon(score.riskQuadrant)}
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getQuadrantBadgeColor(score.riskQuadrant)}`}>
          Quadrant {score.riskQuadrant === 'GREEN' ? '1' : score.riskQuadrant === 'ORANGE' ? '2' : score.riskQuadrant === 'YELLOW' ? '3' : '4'}
        </div>
      </div>

      {/* Three-Layer Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Layer 1: S_sub */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur">
          <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Layer 1: Leadership Perception</div>
          <div className="text-4xl font-black text-white mb-2">{score.s_sub}</div>
          <div className="text-xs text-slate-200 mb-3">{score.s_sub_interpretation}</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            Measures what your leadership team perceives about institutional health based on screening question responses
          </div>
        </div>

        {/* Layer 2: M_obj */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur">
          <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Layer 2: Operational Reality</div>
          <div className="text-4xl font-black text-white mb-2">{score.m_obj}</div>
          <div className="text-xs text-slate-200 mb-3">{score.m_obj_interpretation}</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            Measures what actual metrics show about how well your school is operating
          </div>
        </div>

        {/* Layer 3: Health Index */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur">
          <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">Layer 3: Health Index</div>
          <div className="text-4xl font-black text-white mb-2">{score.healthIndex}</div>
          <div className="text-xs text-slate-200 mb-3">Reality-Adjusted Score</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            {score.healthIndex_interpretation}
          </div>
        </div>
      </div>

      {/* Operational Metrics Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Operational Metrics Breakdown
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STR */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Student-Teacher Ratio</span>
              <span className="text-2xl font-bold text-white">{score.m_str.toFixed(2)}x</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${score.m_str > 1.0 ? 'bg-emerald-400' : score.m_str >= 0.88 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min((score.m_str / 1.05) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Impacts teaching effectiveness and student attention</p>
          </div>

          {/* SLA */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Parent Response SLA</span>
              <span className="text-2xl font-bold text-white">{score.m_sla.toFixed(2)}x</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${score.m_sla >= 0.95 ? 'bg-emerald-400' : score.m_sla >= 0.7 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min(score.m_sla * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Affects parent satisfaction and trust</p>
          </div>

          {/* Training */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Annual Teacher Training</span>
              <span className="text-2xl font-bold text-white">{score.m_train.toFixed(2)}x</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${score.m_train >= 0.85 ? 'bg-emerald-400' : score.m_train >= 0.6 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min((score.m_train / 1.0) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Drives teacher capability and classroom quality</p>
          </div>

          {/* Planning */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Weekly Planning Time</span>
              <span className="text-2xl font-bold text-white">{score.m_plan.toFixed(2)}x</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${score.m_plan >= 0.88 ? 'bg-emerald-400' : score.m_plan >= 0.75 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min((score.m_plan / 1.0) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Enables proper lesson preparation and quality</p>
          </div>
        </div>
      </div>

      {/* Score Calculation Info */}
      <div className="bg-blue-900/30 border border-blue-400/30 rounded-xl p-4">
        <div className="text-xs space-y-2 text-slate-300">
          <p><strong className="text-blue-200">Calculation:</strong></p>
          <p>• <strong>S_sub</strong> (Leadership Perception) = <strong>{score.s_sub}</strong></p>
          <p>• <strong>M_obj</strong> (Operational Reality) = <strong>{score.m_obj}</strong></p>
          <p>• <strong>Scaled Score</strong> = S_sub × M_obj = <strong>{score.scaledScore}</strong></p>
          {score.delusionPenalty > 0 && (
            <p>• <strong>Delusion Penalty</strong> = <strong>{score.delusionPenalty}</strong> (Leadership overconfidence detected)</p>
          )}
          <p>• <strong>Health Index (H)</strong> = Scaled Score - Penalty = <strong className="text-emerald-300">{score.healthIndex}</strong></p>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3">
          <div className="font-bold text-emerald-300 mb-1">✓ GREEN (Elite)</div>
          <div className="text-slate-300">Score: 70+<br/>Excellent, sustainable</div>
        </div>
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-3">
          <div className="font-bold text-amber-300 mb-1">⚠ ORANGE (At Risk)</div>
          <div className="text-slate-300">Score: 30-50<br/>Action needed</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
          <div className="font-bold text-yellow-300 mb-1">⚠ YELLOW (Concern)</div>
          <div className="text-slate-300">Score: 50-70<br/>Leverage strengths</div>
        </div>
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
          <div className="font-bold text-red-300 mb-1">❌ RED (Critical)</div>
          <div className="text-slate-300">Score: &lt;30<br/>Emergency response</div>
        </div>
      </div>
    </div>
  );
};
