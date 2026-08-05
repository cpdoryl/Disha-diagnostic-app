/**
 * Analytics Dashboard
 * Displays consensus analysis, outlier detection, and stakeholder comparison
 */

import React, { useEffect, useState } from 'react';
import {
  Assessment,
  Respondent,
  AssessmentStatistics,
  AggregatedDimensionData,
  STAKEHOLDER_DISPLAY_NAMES
} from '@/types/multi-respondent';
import MultiRespondentService from '@/services/firestore/multi-respondent-service';
import MultiRespondentAnalytics from '@/services/analytics/multi-respondent-analytics';
import '../styles/analytics-dashboard.css';

interface Props {
  assessmentId: string;
  assessment?: Assessment;
}

interface DashboardData {
  aggregated: AggregatedDimensionData;
  statistics: AssessmentStatistics;
  respondents: Respondent[];
}

export const AnalyticsDashboard: React.FC<Props> = ({ assessmentId, assessment }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'consensus' | 'outliers' | 'stakeholders'>('consensus');

  useEffect(() => {
    loadAnalytics();
  }, [assessmentId]);

  const loadAnalytics = async () => {
    try {
      const respondents = await MultiRespondentService.getAssessmentRespondents(assessmentId);

      if (respondents.length === 0) {
        setLoading(false);
        return;
      }

      // Get all dimension IDs (14 dimensions)
      const dimensions = Array.from(
        { length: 14 },
        (_, i) => `D${String(i + 1).padStart(2, '0')}`
      );

      const { aggregated, statistics } = MultiRespondentAnalytics.calculateAggregatedScores(
        respondents,
        dimensions
      );

      setData({ aggregated, statistics, respondents });
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h2>Multi-Respondent Analytics</h2>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'consensus' ? 'active' : ''}`}
          onClick={() => setActiveTab('consensus')}
        >
          🤝 Consensus Analysis
        </button>
        <button
          className={`tab-button ${activeTab === 'outliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('outliers')}
        >
          ⚠️ Outlier Detection ({data.statistics.outliers.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'stakeholders' ? 'active' : ''}`}
          onClick={() => setActiveTab('stakeholders')}
        >
          👥 Stakeholder Comparison
        </button>
      </div>

      {/* Consensus Analysis Tab */}
      {activeTab === 'consensus' && (
        <div className="tab-content consensus-analysis">
          <h3>Consensus Analysis</h3>

          {/* High Consensus Dimensions */}
          <div className="consensus-group">
            <h4 className="high-consensus">✅ High Consensus Dimensions</h4>
            <div className="dimensions-grid">
              {data.statistics.consensusAnalysis.highConsensus.map(dimensionId => (
                <DimensionConsensusCard
                  key={dimensionId}
                  dimensionId={dimensionId}
                  aggregation={data.aggregated[dimensionId]}
                  level="HIGH"
                />
              ))}
            </div>
            {data.statistics.consensusAnalysis.highConsensus.length === 0 && (
              <p className="empty">No dimensions with high consensus</p>
            )}
          </div>

          {/* Moderate Consensus Dimensions */}
          <div className="consensus-group">
            <h4 className="moderate-consensus">⚖️ Moderate Consensus Dimensions</h4>
            <div className="dimensions-grid">
              {data.statistics.consensusAnalysis.moderateConsensus.map(dimensionId => (
                <DimensionConsensusCard
                  key={dimensionId}
                  dimensionId={dimensionId}
                  aggregation={data.aggregated[dimensionId]}
                  level="MODERATE"
                />
              ))}
            </div>
            {data.statistics.consensusAnalysis.moderateConsensus.length === 0 && (
              <p className="empty">No dimensions with moderate consensus</p>
            )}
          </div>

          {/* Low Consensus / Conflict Dimensions */}
          <div className="consensus-group">
            <h4 className="low-consensus">⚠️ Low Consensus / Conflict Dimensions</h4>
            <div className="dimensions-grid">
              {[
                ...data.statistics.consensusAnalysis.lowConsensus,
                ...data.statistics.consensusAnalysis.highConflict
              ].map(dimensionId => (
                <DimensionConsensusCard
                  key={dimensionId}
                  dimensionId={dimensionId}
                  aggregation={data.aggregated[dimensionId]}
                  level="LOW"
                  divergence={data.statistics.divergentDimensions[dimensionId]}
                />
              ))}
            </div>
            {data.statistics.consensusAnalysis.lowConsensus.length === 0 &&
              data.statistics.consensusAnalysis.highConflict.length === 0 && (
                <p className="empty">All dimensions show good consensus</p>
              )}
          </div>
        </div>
      )}

      {/* Outlier Detection Tab */}
      {activeTab === 'outliers' && (
        <div className="tab-content outlier-detection">
          <h3>Outlier Detection</h3>

          {data.statistics.outliers.length === 0 ? (
            <p className="no-outliers">✓ No significant outliers detected. All respondents follow similar patterns.</p>
          ) : (
            <div className="outliers-list">
              {data.statistics.outliers.map(outlier => (
                <div key={outlier.respondentId} className={`outlier-card ${outlier.type.toLowerCase()}`}>
                  <div className="card-header">
                    <div className="respondent-info">
                      <h4>{outlier.name}</h4>
                      <p className="role">{outlier.stakeholderGroup} - {STAKEHOLDER_DISPLAY_NAMES[outlier.stakeholderGroup]}</p>
                    </div>
                    <div className="outlier-badge">
                      {outlier.type === 'HIGH_OUTLIER' ? '🔝 High Outlier' : '⬇️ Low Outlier'}
                      <span className="percentile">P{outlier.percentile}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="score-comparison">
                      <div className="their-score">
                        <span className="label">Their Score</span>
                        <span className="value">{outlier.overallScore.toFixed(1)}</span>
                      </div>
                      <div className="group-average">
                        <span className="label">Group Average</span>
                        <span className="value">{outlier.groupAverage.toFixed(1)}</span>
                      </div>
                      <div className="deviation">
                        <span className="label">Deviation</span>
                        <span className={`value ${outlier.deviation > 0 ? 'positive' : 'negative'}`}>
                          {outlier.deviation > 0 ? '+' : ''}{outlier.deviation.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {outlier.anomalies.length > 0 && (
                      <div className="anomalies">
                        <h5>Anomalies in Dimensions:</h5>
                        <ul>
                          {outlier.anomalies.map((anomaly, idx) => (
                            <li key={idx}>
                              <strong>{anomaly.dimensionId}:</strong> Their {anomaly.theirScore.toFixed(1)} vs Group {anomaly.groupAverage.toFixed(1)} (Deviation: {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {outlier.likelyReason && (
                      <div className="likely-reason">
                        <span className="label">Likely Reason:</span>
                        <span className="reason">{outlier.likelyReason}</span>
                      </div>
                    )}

                    {outlier.recommendation && (
                      <div className="recommendation">
                        <span className="label">Recommended Action:</span>
                        <span className="action">{outlier.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stakeholder Comparison Tab */}
      {activeTab === 'stakeholders' && (
        <div className="tab-content stakeholder-comparison">
          <h3>Stakeholder Comparison</h3>

          <div className="comparison-grid">
            {Object.entries(data.statistics.stakeholderComparison).map(([stakeholder, metrics]) => (
              <div key={stakeholder} className="stakeholder-card">
                <div className="card-header">
                  <h4>{STAKEHOLDER_DISPLAY_NAMES[stakeholder as any]}</h4>
                  <span className="respondent-count">n={metrics.n}</span>
                </div>

                <div className="metrics">
                  <div className="metric">
                    <span className="label">Average Score</span>
                    <span className="value">{metrics.mean.toFixed(1)}/100</span>
                    <div className="score-bar">
                      <div className="bar-fill" style={{ width: `${metrics.mean}%` }}></div>
                    </div>
                  </div>

                  {metrics.median !== undefined && (
                    <div className="metric">
                      <span className="label">Median</span>
                      <span className="value">{metrics.median.toFixed(1)}</span>
                    </div>
                  )}

                  <div className="metric">
                    <span className="label">Std Deviation</span>
                    <span className={`value ${metrics.stdDev < 1 ? 'low' : metrics.stdDev < 2 ? 'medium' : 'high'}`}>
                      {metrics.stdDev.toFixed(2)}
                    </span>
                    <span className="note">
                      {metrics.stdDev < 1 ? '✓ Good internal agreement' : metrics.stdDev < 2 ? '⚖️ Moderate variation' : '⚠️ High variation'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stakeholder Divergence Analysis */}
          {Object.entries(data.statistics.divergentDimensions).length > 0 && (
            <div className="divergence-analysis">
              <h4>Key Areas of Divergence</h4>
              <div className="divergence-list">
                {Object.entries(data.statistics.divergentDimensions).map(([dimensionId, divergence]) => (
                  <div key={dimensionId} className={`divergence-item gap-${divergence.gap.toLowerCase()}`}>
                    <div className="dimension-label">{dimensionId}</div>
                    <div className="divergence-details">
                      <p className="recommendation">{divergence.recommendation}</p>
                      <div className="stakeholder-scores">
                        {Object.entries(divergence.byStakeholder).map(([stakeholder, score]) => (
                          score > 0 && (
                            <div key={stakeholder} className="score">
                              <span className="name">{STAKEHOLDER_DISPLAY_NAMES[stakeholder as any]}</span>
                              <span className="value">{score.toFixed(1)}</span>
                            </div>
                          )
                        ))}
                      </div>
                      <div className="max-gap">
                        <strong>Max Gap:</strong> {divergence.maxGap.toFixed(1)} points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DIMENSION CONSENSUS CARD COMPONENT
// ============================================================================

interface DimensionConsensusCardProps {
  dimensionId: string;
  aggregation: any;
  level: 'HIGH' | 'MODERATE' | 'LOW';
  divergence?: any;
}

const DimensionConsensusCard: React.FC<DimensionConsensusCardProps> = ({
  dimensionId,
  aggregation,
  level,
  divergence
}) => {
  return (
    <div className={`dimension-card consensus-${level.toLowerCase()}`}>
      <div className="card-header">
        <h5>{dimensionId}</h5>
        <span className={`consensus-badge ${level.toLowerCase()}`}>{level}</span>
      </div>

      <div className="card-body">
        <div className="stats">
          <div className="stat">
            <span className="label">Mean</span>
            <span className="value">{aggregation.mean.toFixed(1)}</span>
          </div>
          <div className="stat">
            <span className="label">Std Dev</span>
            <span className="value">{aggregation.stdDev.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">n</span>
            <span className="value">{aggregation.sampleSize}</span>
          </div>
        </div>

        {divergence && (
          <div className="divergence-warning">
            <p>{divergence.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
