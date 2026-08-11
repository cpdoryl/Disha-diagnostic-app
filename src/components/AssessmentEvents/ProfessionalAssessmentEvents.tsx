import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Zap,
  ChevronRight,
  Search,
  Filter,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface AssessmentEvent {
  id: string;
  name: string;
  date: string;
  status: 'active' | 'completed' | 'scheduled';
  respondentsCount: number;
  expectedCount: number;
  school: string;
}

interface ProfessionalAssessmentEventsProps {
  events: AssessmentEvent[];
  schoolName: string;
  onCreateNew?: () => void;
  onSelectEvent?: (event: AssessmentEvent) => void;
}

const statusConfig = {
  active: {
    label: 'Active',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    icon: Zap,
    dotColor: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    icon: CheckCircle,
    dotColor: 'bg-green-500',
  },
  scheduled: {
    label: 'Scheduled',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    icon: Clock,
    dotColor: 'bg-amber-500',
  },
};

export function ProfessionalAssessmentEvents({
  events,
  schoolName,
  onCreateNew,
  onSelectEvent,
}: ProfessionalAssessmentEventsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'scheduled'>('all');

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const activeCount = events.filter(e => e.status === 'active').length;
  const completedCount = events.filter(e => e.status === 'completed').length;
  const scheduledCount = events.filter(e => e.status === 'scheduled').length;
  const totalResponses = events.reduce((sum, e) => sum + e.respondentsCount, 0);
  const totalExpected = events.reduce((sum, e) => sum + e.expectedCount, 0);
  const completionRate = totalExpected > 0 ? Math.round((totalResponses / totalExpected) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Assessment Events</h1>
            <p className="text-blue-100 text-lg">
              All past and current 14D assessment rounds for {schoolName}
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            New Assessment Event
          </button>
        </div>

        <p className="text-blue-100 text-sm leading-relaxed">
          Every past and current 14D assessment round for {schoolName}. Cumulative respondent counts are read directly
          from the database, so they never disappear on logout or across devices.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Events"
          value={activeCount}
          icon={Zap}
          bgGradient="from-blue-400 to-blue-600"
          color="#3B82F6"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle}
          bgGradient="from-green-400 to-green-600"
          color="#10B981"
        />
        <StatCard
          label="Scheduled"
          value={scheduledCount}
          icon={Clock}
          bgGradient="from-amber-400 to-amber-600"
          color="#F59E0B"
        />
        <StatCard
          label="Overall Response Rate"
          value={`${completionRate}%`}
          icon={TrendingUp}
          bgGradient="from-purple-400 to-purple-600"
          color="#8B5CF6"
          subtitle={`${totalResponses}/${totalExpected} responses`}
        />
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessment by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="relative md:w-48">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer pr-10"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
              <option value="scheduled">Scheduled Only</option>
            </select>
            <Filter className="absolute right-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {filteredEvents.length > 0 && (
          <p className="text-sm text-gray-600 mt-4">
            Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> assessment events
          </p>
        )}
      </div>

      {/* Assessment Events List */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, idx) => (
            <AssessmentEventCard
              key={event.id}
              event={event}
              isHighlighted={idx === 3} // Highlight 4th item like in screenshot
              onClick={() => onSelectEvent?.(event)}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-gray-200 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No assessment events match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Click on any assessment event to view detailed response tracking, manage respondents, and access analytics.
        </p>
      </div>
    </div>
  );
}

// Assessment Event Card Component
function AssessmentEventCard({
  event,
  isHighlighted,
  onClick,
}: {
  event: AssessmentEvent;
  isHighlighted?: boolean;
  onClick?: () => void;
}) {
  const statusInfo = statusConfig[event.status];
  const StatusIcon = statusInfo.icon;
  const percentage = Math.round((event.respondentsCount / event.expectedCount) * 100);
  const isComplete = event.respondentsCount === event.expectedCount;

  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer transition-all duration-300
        rounded-2xl border-2 shadow-lg hover:shadow-xl
        ${
          isHighlighted
            ? `${statusInfo.bgColor} ${statusInfo.borderColor} ring-2 ring-blue-400`
            : `bg-white border-gray-200 hover:border-blue-300`
        }
      `}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Status */}
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <h3 className="text-2xl font-bold text-gray-900 truncate">{event.name}</h3>
              <div className={`${statusInfo.badgeBg} ${statusInfo.badgeText} px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 shrink-0`}>
                <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor} animate-pulse`} />
                {statusInfo.label}
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{event.date}</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Response Progress</p>
                <span className="text-sm font-bold text-gray-900">
                  {percentage}% ({event.respondentsCount}/{event.expectedCount})
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 flex items-center justify-center"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor:
                      percentage === 100
                        ? '#10B981'
                        : percentage >= 75
                        ? '#3B82F6'
                        : percentage >= 50
                        ? '#F59E0B'
                        : '#EF4444',
                  }}
                >
                  {percentage > 10 && <span className="text-xs font-bold text-white">{percentage}%</span>}
                </div>
              </div>
            </div>

            {/* Status Text */}
            <p className={`text-xs font-semibold ${statusInfo.textColor}`}>
              {event.respondentsCount === 0
                ? 'Waiting for responses'
                : isComplete
                ? '✓ All responses collected'
                : `${event.expectedCount - event.respondentsCount} more responses needed`}
            </p>
          </div>

          {/* Right Content - Response Count */}
          <div className="flex flex-col items-end justify-between h-full shrink-0">
            <div className="flex items-center gap-2 text-right">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-3xl font-bold text-gray-900">{event.respondentsCount}</p>
                <p className="text-xs text-gray-600">of {event.expectedCount} expected</p>
              </div>
            </div>

            {/* Arrow Icon */}
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* Progress Status Bar at Bottom */}
        {isHighlighted && (
          <div className="mt-4 pt-4 border-t border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Current Status</p>
                  <p className={`text-sm font-bold ${statusInfo.textColor}`}>{statusInfo.label}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">School</p>
                  <p className="text-sm font-bold text-gray-900">{event.school}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors">
                View Details →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  bgGradient,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  bgGradient: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-4xl font-bold">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-2">{subtitle}</p>}
        </div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  );
}

export default ProfessionalAssessmentEvents;
