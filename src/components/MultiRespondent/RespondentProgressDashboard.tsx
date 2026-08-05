/**
 * Respondent Progress Dashboard
 * Displays completion status and progress for all respondents in an assessment
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
  completedCount: number;
  completionPercentage: number;
}

export const RespondentProgressDashboard: React.FC<Props> = ({ assessmentId, assessment }) => {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [statusGroups, setStatusGroups] = useState<RespondentStatusGroup[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRespondents();
    const interval = setInterval(loadRespondents, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [assessmentId]);

  const loadRespondents = async () => {
    try {
      const respondentsData = await MultiRespondentService.getAssessmentRespondents(assessmentId);
      setRespondents(respondentsData);

      // Group by stakeholder
      const groups: Record<StakeholderGroup, Respondent[]> = {
        management: [],
        teachers: [],
        parents_students: [],
        operational_metrics: []
      };

      respondentsData.forEach(r => {
        groups[r.stakeholderGroup].push(r);
      });

      // Create status groups
      const statusGroupsData: RespondentStatusGroup[] = (
        ['management', 'teachers', 'parents_students', 'operational_metrics'] as StakeholderGroup[]
      ).map(stakeholder => {
        const respondentsInGroup = groups[stakeholder];
        const completedCount = respondentsInGroup.filter(r => r.status === 'COMPLETE').length;
        const targetCount = assessment?.targetCounts[stakeholder] || respondentsInGroup.length;

        return {
          stakeholder,
          displayName: STAKEHOLDER_DISPLAY_NAMES[stakeholder],
          respondents: respondentsInGroup,
          targetCount,
          completedCount,
          completionPercentage:
            targetCount > 0 ? Math.round((completedCount / targetCount) * 100) : 0
        };
      });

      setStatusGroups(statusGroupsData);

      // Calculate overall progress
      const totalCompleted = statusGroupsData.reduce((sum, g) => sum + g.completedCount, 0);
      const totalTarget = statusGroupsData.reduce((sum, g) => sum + g.targetCount, 0);
      setOverallProgress(totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0);

      setLoading(false);
    } catch (error) {
      console.error('Error loading respondents:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading assessment progress...</div>;
  }

  return (
    <div className="respondent-progress-dashboard">
      <h2>Assessment Respondent Progress</h2>

      {/* Overall Progress */}
      <div className="overall-progress-section">
        <div className="progress-header">
          <h3>Overall Completion</h3>
          <span className="progress-percentage">{overallProgress}%</span>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="progress-stats">
          <div className="stat">
            <span className="stat-label">Total Respondents:</span>
            <span className="stat-value">
              {respondents.filter(r => r.status === 'COMPLETE').length} / {respondents.length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">
              {respondents.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length}
            </span>
          </div>
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
                <span className="completion-badge">
                  {group.completedCount}/{group.targetCount}
                </span>
              </div>

              <div className="progress-mini">
                <div className="progress-bar-small">
                  <div
                    className={`progress-fill-small status-${getStatusColor(group.completionPercentage)}`}
                    style={{ width: `${group.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="percentage">{group.completionPercentage}%</div>

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

      {/* Quick Actions */}
      <div className="actions-section">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => handleSendReminders()}>
            📧 Send Reminders to Incomplete
          </button>
          <button className="btn btn-secondary" onClick={() => handleViewDetails()}>
            👁️ View Detailed Status
          </button>
          <button className="btn btn-success" onClick={() => handleCompleteAssessment()}>
            ✓ Mark Assessment Complete
          </button>
        </div>
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

  // Helper functions
  function getStatusColor(percentage: number): string {
    if (percentage === 100) return 'complete';
    if (percentage > 50) return 'in-progress';
    return 'pending';
  }

  function handleSendReminders() {
    // TODO: Implement reminder sending
    const pendingRespondents = respondents.filter(r => r.status !== 'COMPLETE');
    console.log('Sending reminders to:', pendingRespondents.map(r => r.email));
    alert(`Reminders sent to ${pendingRespondents.length} respondents`);
  }

  function handleViewDetails() {
    // TODO: Navigate to detailed view
    console.log('View detailed status');
  }

  async function handleCompleteAssessment() {
    try {
      await MultiRespondentService.completeAssessment(assessmentId);
      alert('Assessment marked as complete!');
    } catch (error) {
      console.error('Error completing assessment:', error);
      alert('Error completing assessment');
    }
  }
};

export default RespondentProgressDashboard;
