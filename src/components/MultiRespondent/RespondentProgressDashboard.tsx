/**
 * Respondent Progress Dashboard
 * Displays completion status with target vs actual respondent counts and lock functionality
 */

import React, { useEffect, useState } from 'react';
import { Assessment, Respondent, StakeholderGroup, STAKEHOLDER_DISPLAY_NAMES } from '@/types/multi-respondent';
import MultiRespondentService from '@/services/firestore/multi-respondent-service';
import '../styles/multi-respondent.css';

interface Props {
  assessmentId: string;
  assessment?: Assessment;
}

interface RespondentStatusGroup {
  stakeholder: StakeholderGroup;
  displayName: string;
  respondents: Respondent[];
  targetCount: number;
  actualCount: number;
  completedCount: number;
  completionPercentage: number;
  discrepancy: number;
}

export const RespondentProgressDashboard: React.FC<Props> = ({ assessmentId, assessment }) => {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [statusGroups, setStatusGroups] = useState<RespondentStatusGroup[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [isLocked, setIsLocked] = useState(assessment?.lockStatus === 'LOCKED');

  useEffect(() => {
    loadRespondents();
    const interval = setInterval(loadRespondents, 10000);
    return () => clearInterval(interval);
  }, [assessmentId]);

  const loadRespondents = async () => {
    try {
      const respondentsData = await MultiRespondentService.getAssessmentRespondents(assessmentId);
      setRespondents(respondentsData);

      const groups: Record<StakeholderGroup, Respondent[]> = {
        management: [],
        teachers: [],
        parents_students: [],
        operational_metrics: []
      };

      respondentsData.forEach(r => {
        groups[r.stakeholderGroup].push(r);
      });

      const statusGroupsData: RespondentStatusGroup[] = (
        ['management', 'teachers', 'parents_students', 'operational_metrics'] as StakeholderGroup[]
      ).map(stakeholder => {
        const respondentsInGroup = groups[stakeholder];
        const completedCount = respondentsInGroup.filter(r => r.status === 'COMPLETE').length;
        const targetCount = assessment?.targetCounts[stakeholder] || 0;
        const actualCount = respondentsInGroup.length;
        const discrepancy = targetCount - actualCount;

        return {
          stakeholder,
          displayName: STAKEHOLDER_DISPLAY_NAMES[stakeholder],
          respondents: respondentsInGroup,
          targetCount,
          actualCount,
          completedCount,
          completionPercentage: actualCount > 0 ? Math.round((completedCount / actualCount) * 100) : 0,
          discrepancy
        };
      });

      setStatusGroups(statusGroupsData);

      const totalCompleted = statusGroupsData.reduce((sum, g) => sum + g.completedCount, 0);
      const totalActual = statusGroupsData.reduce((sum, g) => sum + g.actualCount, 0);
      setOverallProgress(totalActual > 0 ? Math.round((totalCompleted / totalActual) * 100) : 0);

      setLoading(false);
    } catch (error) {
      console.error('Error loading respondents:', error);
      setLoading(false);
    }
  };

  const handleLockAssessment = async () => {
    if (!confirm('Lock this assessment? This finalizes the respondent count and you can proceed with analytics.')) {
      return;
    }

    setLocking(true);
    try {
      await MultiRespondentService.lockAssessment(assessmentId, statusGroups);
      setIsLocked(true);
      alert('✓ Assessment locked! You can now generate analytics based on actual respondent counts.');
    } catch (error) {
      console.error('Error locking assessment:', error);
      alert('Error locking assessment');
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading assessment progress...</div>;
  }

  const totalTarget = statusGroups.reduce((sum, g) => sum + g.targetCount, 0);
  const totalActual = statusGroups.reduce((sum, g) => sum + g.actualCount, 0);
  const totalCompleted = statusGroups.reduce((sum, g) => sum + g.completedCount, 0);

  return (
    <div className="respondent-progress-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Assessment Respondent Progress</h2>
          <p className="header-subtitle">Track responses and finalize assessment when ready</p>
        </div>
        {isLocked && (
          <div className="lock-badge">
            <span className="lock-icon">🔒</span>
            <span className="lock-text">Locked</span>
          </div>
        )}
      </div>

      {/* Target vs Actual Comparison */}
      <div className="target-vs-actual-section">
        <h3>Target vs Actual Respondents</h3>
        <div className="comparison-cards">
          <div className="comparison-card">
            <div className="card-label">Target Total</div>
            <div className="card-value">{totalTarget}</div>
          </div>
          <div className="comparison-card">
            <div className="card-label">Actual Respondents</div>
            <div className="card-value">{totalActual}</div>
          </div>
          <div className="comparison-card">
            <div className="card-label">Completed</div>
            <div className="card-value">{totalCompleted}</div>
          </div>
          <div className="comparison-card discrepancy">
            <div className="card-label">Difference</div>
            <div className="card-value">{totalTarget - totalActual}</div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="overall-progress-section">
        <div className="progress-header">
          <h3>Completion Rate (of Actual Respondents)</h3>
          <span className="progress-percentage">{overallProgress}%</span>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>

        <div className="progress-note">
          <strong>{totalCompleted}</strong> of <strong>{totalActual}</strong> actual respondents have completed
        </div>
      </div>

      {/* Progress by Stakeholder Group */}
      <div className="stakeholder-progress-section">
        <h3>Progress by Stakeholder Group</h3>

        <div className="stakeholder-grid">
          {statusGroups.map(group => (
            <div key={group.stakeholder} className="stakeholder-progress-card">
              <div className="card-header">
                <h4>{group.displayName}</h4>
                <span className="count-badges">
                  <span className="badge target" title="Target">T: {group.targetCount}</span>
                  <span className="badge actual" title="Actual">A: {group.actualCount}</span>
                  <span className="badge completed" title="Completed">C: {group.completedCount}</span>
                </span>
              </div>

              {group.discrepancy !== 0 && (
                <div className={`discrepancy-warning ${group.discrepancy > 0 ? 'shortage' : 'overflow'}`}>
                  <span className="warning-icon">⚠️</span>
                  <span className="warning-text">
                    {group.discrepancy > 0 ? `${group.discrepancy} fewer` : `${Math.abs(group.discrepancy)} more`} than target
                  </span>
                </div>
              )}

              <div className="progress-mini">
                <div className="progress-bar-small">
                  <div
                    className={`progress-fill-small status-${getStatusColor(group.completionPercentage)}`}
                    style={{ width: `${group.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="percentage">{group.completionPercentage}% Completed</div>

              {/* Individual Respondents in Group */}
              <div className="respondents-list">
                {group.respondents.map(respondent => (
                  <div key={respondent.respondentId} className={`respondent-item status-${respondent.status.toLowerCase()}`}>
                    <div className="respondent-info">
                      <span className="name">{respondent.name}</span>
                      <span className="role">{respondent.role}</span>
                    </div>
                    <div className="respondent-status">
                      <span className={`status-badge ${respondent.status.toLowerCase()}`}>
                        {respondent.status === 'COMPLETE' ? '✓ Complete' : respondent.completionPercentage > 0 ? `${respondent.completionPercentage}%` : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lock Assessment Button */}
      <div className="lock-section">
        <div className="lock-info">
          <p>
            {isLocked
              ? '✓ This assessment is locked. Analytics are based on the actual respondent counts above.'
              : 'When ready, lock this assessment to finalize the respondent count and proceed with analytics.'}
          </p>
          {totalActual === 0 && <p className="error-message">At least 1 respondent must have provided input before locking.</p>}
        </div>
        {!isLocked && (
          <button
            className="btn btn-lock"
            onClick={handleLockAssessment}
            disabled={locking || totalActual === 0}
          >
            {locking ? 'Locking...' : '🔒 Lock Assessment with Actual Counts'}
          </button>
        )}
      </div>

      {/* Status Legend */}
      <div className="status-legend">
        <div className="legend-item">
          <span className="legend-color pending"></span>
          <span>Pending - Not Started</span>
        </div>
        <div className="legend-item">
          <span className="legend-color in-progress"></span>
          <span>In Progress - Partially Complete</span>
        </div>
        <div className="legend-item">
          <span className="legend-color complete"></span>
          <span>Complete - All Questions Answered</span>
        </div>
      </div>
    </div>
  );

  function getStatusColor(percentage: number): string {
    if (percentage === 100) return 'complete';
    if (percentage > 50) return 'in-progress';
    return 'pending';
  }
};

export default RespondentProgressDashboard;
