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
  // The Firebase Auth uid of whoever registered this school. Set once, on
  // creation, and never overwritten by later edits. Scopes the regular
  // (non-admin) school list/switcher to only the schools a user created
  // themselves - the Admin console's School Management tab is the only place
  // that still lists every school regardless of ownerId.
  ownerId?: string;
}

export interface ChallengeDomain {
  id: string;
  title: string;
  description: string;
  score: number; // 0-100
  trend: 'up' | 'down' | 'flat';
}
