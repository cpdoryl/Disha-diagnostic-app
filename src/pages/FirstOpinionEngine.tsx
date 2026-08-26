/**
 * First Opinion Engine v3 - Main Page
 * Complete assessment workflow and results dashboard
 */

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ChallengeResponseForm from '../components/FirstOpinion/ChallengeResponse/ChallengeResponseForm'
import FirstOpinionResultsDashboard from '../components/FirstOpinion/Dashboard/FirstOpinionResultsDashboard'
import TrendAnalysis from '../components/FirstOpinion/Reports/TrendAnalysis'
import MultiplierSync from '../components/FirstOpinion/Admin/MultiplierSync'

type PageView = 'assessment' | 'dashboard' | 'trends' | 'admin'

interface FirstOpinionEngineProps {
  userRole?: 'TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER'
  schoolId?: string
  cycleId?: string
}

export const FirstOpinionEngine: React.FC<FirstOpinionEngineProps> = ({
  userRole = 'OTHER',
  schoolId: propSchoolId,
  cycleId: propCycleId,
}) => {
  const [currentView, setCurrentView] = useState<PageView>('assessment')
  const [responderId, setResponderId] = useState('')
  const [respondentEmail, setRespondentEmail] = useState('')
  const navigate = useNavigate()

  // Get from URL params or props
  const params = useParams<{ schoolId?: string; cycleId?: string }>()
  const schoolId = propSchoolId || params.schoolId || 'school-001'
  const cycleId = propCycleId || params.cycleId || 'cycle-2026-01'

  const handleAssessmentStart = (id: string, email: string) => {
    setResponderId(id)
    setRespondentEmail(email)
  }

  const handleAssessmentComplete = () => {
    setCurrentView('dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">First Opinion Engine v3</h1>
              <p className="text-gray-600 text-sm mt-1">School Diagnostic Assessment & Analysis</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {['assessment', 'dashboard', 'trends', 'admin'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view as PageView)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === view
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {view === 'assessment' && '📝 Assessment'}
                {view === 'dashboard' && '📊 Results'}
                {view === 'trends' && '📈 Trends'}
                {view === 'admin' && '⚙️ Admin'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Context Info */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <div className="max-w-7xl mx-auto text-sm text-blue-900">
          <span className="font-semibold">School:</span> {schoolId} |
          <span className="font-semibold ml-4">Cycle:</span> {cycleId} |
          <span className="font-semibold ml-4">Role:</span> {userRole}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Assessment View */}
        {currentView === 'assessment' && (
          <div className="space-y-6">
            {!responderId ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Begin Assessment</h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.target as HTMLFormElement
                    const id = (form.elements.namedItem('responderId') as HTMLInputElement).value
                    const email = (form.elements.namedItem('email') as HTMLInputElement).value
                    handleAssessmentStart(id, email)
                  }}
                  className="max-w-md space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name/ID
                    </label>
                    <input
                      type="text"
                      name="responderId"
                      placeholder="e.g., teacher-001"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your.email@school.com"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Assessment →
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>What to expect:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Rate 15 challenges across 5 domains</li>
                    <li>✓ Indicate if ratings are fact-based or perception</li>
                    <li>✓ Add optional context/notes for each challenge</li>
                    <li>✓ Get instant diagnostic scores and insights</li>
                    <li>✓ Average time: 15-20 minutes</li>
                  </ul>
                </div>
              </div>
            ) : (
              <ChallengeResponseForm
                schoolId={schoolId}
                cycleId={cycleId}
                responderId={responderId}
                role={userRole}
                email={respondentEmail}
                onSubmitSuccess={handleAssessmentComplete}
                onSubmitError={(error) => {
                  alert(`Error submitting assessment: ${error.message}`)
                }}
              />
            )}
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <FirstOpinionResultsDashboard schoolId={schoolId} cycleId={cycleId} />
        )}

        {/* Trends View */}
        {currentView === 'trends' && (
          <TrendAnalysis schoolId={schoolId} />
        )}

        {/* Admin View */}
        {currentView === 'admin' && userRole === 'ADMIN' && (
          <MultiplierSync
            schoolId={schoolId}
            cycleId={cycleId}
            onSyncComplete={() => {
              alert('Multipliers synced successfully. Scores are being recalculated.')
              setCurrentView('dashboard')
            }}
          />
        )}

        {/* Admin View - Non-Admin Warning */}
        {currentView === 'admin' && userRole !== 'ADMIN' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h2>
            <p className="text-red-700">
              Only administrators can access the multiplier configuration. Your current role is: <strong>{userRole}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>First Opinion Engine v3 | School Diagnostic Assessment System</p>
            <p className="mt-2">
              <span className="font-semibold">Need help?</span> Contact your school administrator or review the assessment guide.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirstOpinionEngine
