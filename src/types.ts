export type ViewState = 'DASHBOARD' | 'FIRST_OPINION' | 'COMPARE' | 'SYNTHESIZE' | 'ADMIN' | '14D_ASSESSMENT' | 'REVERSE_SIMULATION' | 'MONITORING';

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
