import React, { useState } from 'react';
import { ProfessionalDimensionReport } from './ProfessionalDimensionReport';
import { ChevronDown, Search, Filter, Download } from 'lucide-react';
import { generateDiagnosticPDF } from '../../lib/professionalDiagnosticReport';

interface DimensionData {
  id: string;
  name: string;
  icon?: React.ElementType;
  subjective: number;
  benchmark: number;
  objective: number;
  gap: number;
  status: 'excellent' | 'good' | 'adequate' | 'poor';
  perception: string;
  interpretation: string;
  rootCauses: string[];
  actionablePoints: string[];
  metrics?: Array<{ name: string; current: number; benchmark: number }>;
}

interface ProfessionalDashboardProps {
  schoolName: string;
  assessmentDate: string;
  dimensions: DimensionData[];
  respondents?: Array<{ type: string; count: number; total: number }>;
}

export function ProfessionalDiagnosticDashboard({
  schoolName,
  assessmentDate,
  dimensions,
  respondents,
}: ProfessionalDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'excellent' | 'good' | 'adequate' | 'poor'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter dimensions
  const filteredDimensions = dimensions.filter(dim => {
    const matchesSearch = dim.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dim.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalResponses = respondents?.reduce((sum, r) => sum + r.count, 0) || 0;
  const totalExpected = respondents?.reduce((sum, r) => sum + r.total, 0) || 0;
  const avgSubjective = Math.round(dimensions.reduce((sum, d) => sum + d.subjective, 0) / dimensions.length);
  const avgObjective = Math.round(dimensions.reduce((sum, d) => sum + d.objective, 0) / dimensions.length);
  const avgGap = Math.round(Math.abs(avgSubjective - avgObjective));

  const statusCounts = {
    excellent: dimensions.filter(d => d.status === 'excellent').length,
    good: dimensions.filter(d => d.status === 'good').length,
    adequate: dimensions.filter(d => d.status === 'adequate').length,
    poor: dimensions.filter(d => d.status === 'poor').length,
  };

  const handleDownloadReport = () => {
    generateDiagnosticPDF({
      schoolName,
      assessmentDate,
      dimensions: dimensions as any,
      respondents: respondents?.map(r => ({ ...r, percentage: Math.round((r.count / r.total) * 100) })) || [],
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">Diagnostic Assessment Report</h1>
          <p className="text-blue-100 text-lg mb-4">{schoolName}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Assessment Date</p>
              <p className="text-xl font-bold">{assessmentDate}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Avg Perception</p>
              <p className="text-xl font-bold">{avgSubjective}/100</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Avg Reality</p>
              <p className="text-xl font-bold">{avgObjective}/100</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Overall Gap</p>
              <p className="text-xl font-bold">{avgGap} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Response Rate Section */}
      {respondents && totalExpected > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Response Rate</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {respondents.map(resp => {
              const percentage = Math.round((resp.count / resp.total) * 100);
              const colors: { [key: string]: { bar: string; bg: string; text: string } } = {
                teacher: { bar: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-700' },
                parent: { bar: '#10B981', bg: 'bg-green-50', text: 'text-green-700' },
                student: { bar: '#8B5CF6', bg: 'bg-purple-50', text: 'text-purple-700' },
                admin: { bar: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700' },
                other: { bar: '#6B7280', bg: 'bg-gray-50', text: 'text-gray-700' },
              };
              const color = colors[resp.type] || colors.other;

              return (
                <div key={resp.type} className={`${color.bg} rounded-lg p-4 border-l-4`} style={{ borderColor: color.bar }}>
                  <p className="text-sm font-bold text-gray-600 capitalize mb-2">{resp.type}s</p>
                  <p className="text-3xl font-bold" style={{ color: color.bar }}>
                    {resp.count}/{resp.total}
                  </p>
                  <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%`, backgroundColor: color.bar }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{percentage}% completed</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dimension Status Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{statusCounts.excellent}</p>
            <p className="text-sm font-semibold text-emerald-700 mt-1">Excellent</p>
          </div>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{statusCounts.good}</p>
            <p className="text-sm font-semibold text-blue-700 mt-1">Good</p>
          </div>
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{statusCounts.adequate}</p>
            <p className="text-sm font-semibold text-amber-700 mt-1">Adequate</p>
          </div>
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{statusCounts.poor}</p>
            <p className="text-sm font-semibold text-red-700 mt-1">Poor</p>
          </div>
        </div>
      </div>

      {/* Download Report Button */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Generate Comprehensive Report</h3>
          <p className="text-sm text-gray-600 mt-1">Download a detailed 9-page PDF report with all analysis</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
          Download PDF Report
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dimension by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="excellent">Excellent Only</option>
              <option value="good">Good Only</option>
              <option value="adequate">Adequate Only</option>
              <option value="poor">Poor Only</option>
            </select>
            <Filter className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {filteredDimensions.length > 0 && (
          <p className="text-sm text-gray-600 mt-3">
            Showing <strong>{filteredDimensions.length}</strong> of <strong>{dimensions.length}</strong> dimensions
          </p>
        )}
      </div>

      {/* Dimensions List */}
      <div className="space-y-6">
        {filteredDimensions.length > 0 ? (
          filteredDimensions.map(dimension => (
            <div
              key={dimension.id}
              className="cursor-pointer transition-all"
              onClick={() => setExpandedId(expandedId === dimension.id ? null : dimension.id)}
            >
              {expandedId === dimension.id ? (
                <ProfessionalDimensionReport {...dimension} />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{dimension.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{dimension.perception}</p>
                        </div>
                      </div>

                      {/* Mini metrics display */}
                      <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-600">Subjective:</span>
                          <span className="text-lg font-bold text-blue-600">{dimension.subjective}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-600">Benchmark:</span>
                          <span className="text-lg font-bold text-amber-600">{dimension.benchmark}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-600">Objective:</span>
                          <span className="text-lg font-bold text-green-600">{dimension.objective}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs font-bold text-gray-600">Gap:</span>
                          <span
                            className="text-lg font-bold px-2 py-1 rounded"
                            style={{
                              color:
                                Math.abs(dimension.gap) > 20
                                  ? '#DC2626'
                                  : Math.abs(dimension.gap) > 10
                                  ? '#F97316'
                                  : '#10B981',
                              backgroundColor:
                                Math.abs(dimension.gap) > 20
                                  ? '#FEE2E2'
                                  : Math.abs(dimension.gap) > 10
                                  ? '#FEF3C7'
                                  : '#D1FAE5',
                            }}
                          >
                            {Math.abs(dimension.gap).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge and Expand Icon */}
                    <div className="flex flex-col items-end gap-3">
                      <div
                        className="px-4 py-2 rounded-full font-bold text-sm text-white"
                        style={{
                          backgroundColor:
                            dimension.status === 'excellent'
                              ? '#059669'
                              : dimension.status === 'good'
                              ? '#0284C7'
                              : dimension.status === 'adequate'
                              ? '#F59E0B'
                              : '#DC2626',
                        }}
                      >
                        {dimension.status.charAt(0).toUpperCase() + dimension.status.slice(1)}
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-gray-200 text-center">
            <p className="text-lg text-gray-600">No dimensions match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Click on any dimension to view detailed analysis including root causes, actionable recommendations, and metric breakdowns.
        </p>
      </div>
    </div>
  );
}

export default ProfessionalDiagnosticDashboard;
