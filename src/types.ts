export type ViewState = 'DASHBOARD' | 'FIRST_OPINION' | 'COMPARE' | 'SYNTHESIZE' | 'ADMIN' | '14D_ASSESSMENT' | 'REVERSE_SIMULATION' | 'MONITORING';

export interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  classSection: string;
  gender: string;
  attendanceRate: number;
  riskProfile: 'Low' | 'Medium' | 'High';
  academicPerformance: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  subject: string;
  tenureMonths: number;
  performanceScore: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface CommunicationMessage {
  id: string;
  title: string;
  content: string;
  sender: string;
  timestamp: string;
  recipientGroup: string;
}

export interface School {
  id: string;
  name: string;
  schoolCode?: string;
  city: string;
  state?: string;
  board: string;
  schoolType?: string;
  tier: string;
  feeBand?: string;
  studentCount?: string;
  principalName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface ChallengeDomain {
  id: string;
  title: string;
  description: string;
  score: number; // 0-100
  trend: 'up' | 'down' | 'flat';
}

export interface Dimension {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  score: number;
  benchmark: number;
}

export interface GapPrediction {
  id: string;
  domainId: string;
  domainName: string;
  gapVsStandard: number;
  gapVsPeer: number;
  priorityRank: number;
  rootCause: string;
  recommendation: string;
}

export interface SimulationModel {
  id: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  confidenceTier: 'A' | 'B' | 'C';
  districtPrecedent: string;
  requiredChanges: {
    factor: string;
    current: string;
    required: string;
    impact: number;
  }[];
}
