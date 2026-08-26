/**
 * First Opinion Engine v3 - Detailed Analysis View
 * Drill-down analysis of challenges, drivers, and stakeholder breakdown
 */

import React, { useState, useEffect } from 'react'
import { db } from '../../../lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface ChallengeDriver {
  challengeId: string
  title: string
  domain: string
  severity: number
  weight: number
  contribution: number // % contribution to overall gap
  respondentCount: number
}

interface DetailedAnalysisViewProps {
  schoolId: string
  cycleId: string
  s_sub: number
  m_obj: number
  gap: number
}

const DOMAIN_COLORS: Record<string, string> = {
  'Teaching & Learning': '#3b82f6',
  'Infrastructure & Resources': '#10b981',
  'Staffing & HR': '#f59e0b',
  'Finance & Operations': '#8b5cf6',
  'Governance & Community': '#ef4444',
}

export const DetailedAnalysisView: React.FC<DetailedAnalysisViewProps> = ({
  schoolId,
  cycleId,
  s_sub,
  m_obj,
  gap,
}) => {
  const [drivers, setDrivers] = useState<ChallengeDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [respondentBreakdown, setRespondentBreakdown] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)

        // Fetch all responses for this cycle
        const responsesRef = collection(
          db,
          'schools',
          schoolId,
          'assessmentCycles',
          cycleId,
          'challengeResponses'
        )

        const responsesSnapshot = await getDocs(query(responsesRef, where('deleted', '==', false)))

        // Calculate challenge drivers
        const challengeMap = new Map<string, any>()
        const roleMap = new Map<string, number>()

        responsesSnapshot.docs.forEach((doc) => {
          const data = doc.data()
          const challengeId = data.challengeId
          const role = data.role

          // Track respondent breakdown
          roleMap.set(role, (roleMap.get(role) || 0) + 1)

          // Aggregate challenge data
          if (!challengeMap.has(challengeId)) {
            challengeMap.set(challengeId, {
              id: challengeId,
              title: data.challenge?.title || challengeId,
              domain: data.challenge?.domain || 'Unknown',
              severities: [],
              count: 0,
            })
          }

          const challenge = challengeMap.get(challengeId)
          challenge.severities.push(data.responses?.severity?.selectedOption || 5)
          challenge.count++
        })

        // Calculate severity and contribution
        const totalResponses = responsesSnapshot.size
        const driverArray: ChallengeDriver[] = Array.from(challengeMap.values())
          .map((c) => {
            const avgSeverity = c.severities.reduce((a: number, b: number) => a + b, 0) / c.severities.length
            const contribution = (c.count / totalResponses) * (avgSeverity / 10) * 100

            return {
              challengeId: c.id,
              title: c.title,
              domain: c.domain,
              severity: avgSeverity,
              weight: 1 / 15, // Standard challenge weight
              contribution,
              respondentCount: c.count,
            }
          })
          .sort((a, b) => b.severity - a.severity)

        setDrivers(driverArray)
        setRespondentBreakdown(Object.fromEntries(roleMap))
        setError(null)
      } catch (err) {
        console.error('Error fetching analysis:', err)
        setError('Failed to load detailed analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [schoolId, cycleId])

  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing challenge drivers...</p>
        </div>
      </div>
    )
  }

  if (error || drivers.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">{error || 'No challenge data available'}</p>
      </div>
    )
  }

  const filteredDrivers = selectedDomain
    ? drivers.filter((d) => d.domain === selectedDomain)
    : drivers

  const domainGroups = Array.from(new Set(drivers.map((d) => d.domain)))
  const topDrivers = drivers.slice(0, 5)
  const totalSeverity = drivers.reduce((sum, d) => sum + d.severity, 0)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Detailed Challenge Analysis</h2>
        <p className="text-gray-600">Challenge-by-challenge breakdown and driver identification</p>
      </div>

      {/* Top Drivers Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Challenge Drivers</h3>
        <div className="space-y-2">
          {topDrivers.map((driver, index) => (
            <div key={driver.challengeId} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-400 w-8">{index + 1}.</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{driver.title}</h4>
                <p className="text-sm text-gray-600">{driver.domain}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-orange-600">{driver.severity.toFixed(1)}/10</p>
                <p className="text-xs text-gray-500">{driver.contribution.toFixed(1)}% of gap</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Domain</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDomain(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDomain === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Domains
          </button>
          {domainGroups.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDomain === domain
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              style={{
                backgroundColor:
                  selectedDomain === domain ? DOMAIN_COLORS[domain] : undefined,
              }}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Severity Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Challenge Severity Ranking</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={filteredDrivers.sort((a, b) => b.severity - a.severity)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="title"
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[0, 10]} />
            <Tooltip
              formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Bar
              dataKey="severity"
              fill="#f59e0b"
              name="Severity Score (1-10)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Respondent Breakdown */}
      {Object.keys(respondentBreakdown).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Respondent Composition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(respondentBreakdown).map(([role, count]) => ({
                    name: role,
                    value: count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(respondentBreakdown).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div>
              <div className="space-y-3">
                {Object.entries(respondentBreakdown).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{role}</span>
                    <span className="text-lg font-bold text-blue-600">{count}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Total respondents: {Object.values(respondentBreakdown).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Detail Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Challenges - Detailed View</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-semibold">Challenge</th>
                <th className="px-4 py-3 text-left font-semibold">Domain</th>
                <th className="px-4 py-3 text-center font-semibold">Severity</th>
                <th className="px-4 py-3 text-center font-semibold">Respondents</th>
                <th className="px-4 py-3 text-right font-semibold">Gap Contribution</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.challengeId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{driver.title}</td>
                  <td className="px-4 py-3 text-gray-600">{driver.domain}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded font-bold">
                      {driver.severity.toFixed(1)}/10
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{driver.respondentCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                        style={{ width: `${Math.min(driver.contribution, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{driver.contribution.toFixed(1)}%</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Key Insights</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {drivers.length} total challenges assessed</li>
          <li>• Average severity: {(totalSeverity / drivers.length).toFixed(1)}/10</li>
          <li>• Top domain: {domainGroups.sort((a, b) => {
            const aCount = drivers.filter(d => d.domain === a).length
            const bCount = drivers.filter(d => d.domain === b).length
            return bCount - aCount
          })[0]}</li>
          <li>• Highest severity challenge: {topDrivers[0].title} ({topDrivers[0].severity.toFixed(1)}/10)</li>
        </ul>
      </div>
    </div>
  )
}

export default DetailedAnalysisView
