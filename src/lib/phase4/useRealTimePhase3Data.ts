/**
 * Real-Time Firestore Listener Hook for Phase 3 Data
 * Phase 4: Dashboards & Reporting
 *
 * Subscribes to Phase 3 outputs in real-time:
 * - DimensionScore documents (metric calculations)
 * - GapAnalysis documents (gap analysis)
 * - Recommendation documents (action items)
 * - ActionPlan documents (30-60-90 timeline)
 */

import { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';

// Type definitions
export interface DimensionScore {
  dimensionId: number;
  dimensionName: string;
  realityScore: number;
  perceptionScore: number;
  gap: number;
  gapDirection: 'reality_higher' | 'perception_higher' | 'aligned';
  gapSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  metricCount: number;
  respondentCount: number;
  respondentBreakdown?: {
    Teacher: number;
    Parent: number;
    Student: number;
    Admin: number;
    Other: number;
  };
}

export interface CalculationResult {
  assessmentId: string;
  schoolId: string;
  calculatedAt: any; // Timestamp
  dimensionScores: DimensionScore[];
  overallRealityScore: number;
  overallPerceptionScore: number;
  overallGap: number;
  respondentCount: number;
  responseCount: number;
  metricsCovered: number;
  analysisReady: boolean;
}

export interface GapAnalysis {
  dimensionId: number;
  dimensionName: string;
  realityScore: number;
  perceptionScore: number;
  gap: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'perception_inflated' | 'reality_lagging' | 'blind_spot' | 'aligned';
  priority: number;
  rootCauses: string[];
  recommendation: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GapAnalysisResult {
  assessmentId: string;
  schoolId: string;
  analyzedAt: any; // Timestamp
  totalGaps: number;
  criticalGaps: number;
  blindSpots: number;
  allGaps: GapAnalysis[];
  topPriorities: GapAnalysis[];
  blindSpotsList: GapAnalysis[];
}

export interface Recommendation {
  id: string;
  dimensionId: number;
  dimensionName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actionTitle: string;
  actionDescription: string;
  expectedOutcome: string;
  successMetrics: string[];
  owner: 'Principal' | 'Academic Lead' | 'Student Support' | 'Admin' | 'Coordinator';
  timeline: {
    start: string;
    duration: string;
    expectedCompletion: string;
  };
  resources: string[];
  dependencies: string[];
  riskFactors: string[];
  estimatedEffort: 'Low' | 'Medium' | 'High';
}

/**
 * Hook: Fetch DimensionScore documents in real-time
 */
export function useCalculatedScores(
  schoolId: string,
  assessmentId: string
) {
  const [data, setData] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId || !assessmentId) {
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe;

    try {
      const docRef = `schools/${schoolId}/assessments14D/${assessmentId}/calculatedScores/latest`;

      unsubscribe = onSnapshot(
        collection(db, 'schools', schoolId, 'assessments14D', assessmentId, 'calculatedScores'),
        (snapshot) => {
          const doc = snapshot.docs.find(d => d.id === 'latest');
          if (doc) {
            setData(doc.data() as CalculationResult);
            setError(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching calculated scores:', err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Error setting up listener:', err);
      setError(err.message);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [schoolId, assessmentId]);

  return { data, loading, error };
}

/**
 * Hook: Fetch GapAnalysis documents in real-time
 */
export function useGapAnalysis(
  schoolId: string,
  assessmentId: string
) {
  const [data, setData] = useState<GapAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId || !assessmentId) {
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(
        collection(db, 'schools', schoolId, 'assessments14D', assessmentId, 'analysis'),
        (snapshot) => {
          const doc = snapshot.docs.find(d => d.id === 'gaps');
          if (doc) {
            setData(doc.data() as GapAnalysisResult);
            setError(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching gap analysis:', err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Error setting up listener:', err);
      setError(err.message);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [schoolId, assessmentId]);

  return { data, loading, error };
}

/**
 * Hook: Fetch Recommendation documents in real-time
 */
export function useRecommendations(
  schoolId: string,
  assessmentId: string
) {
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId || !assessmentId) {
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(
        collection(db, 'schools', schoolId, 'assessments14D', assessmentId, 'analysis'),
        (snapshot) => {
          const doc = snapshot.docs.find(d => d.id === 'recommendations');
          if (doc) {
            const result = doc.data();
            setData([
              ...result.tier1Recommendations,
              ...result.tier2Recommendations,
              ...result.tier3Recommendations,
            ]);
            setError(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching recommendations:', err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Error setting up listener:', err);
      setError(err.message);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [schoolId, assessmentId]);

  return { data, loading, error };
}

/**
 * Hook: Fetch ActionPlan document in real-time
 */
export function useActionPlan(
  schoolId: string,
  assessmentId: string
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId || !assessmentId) {
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(
        collection(db, 'schools', schoolId, 'assessments14D', assessmentId, 'analysis'),
        (snapshot) => {
          const doc = snapshot.docs.find(d => d.id === 'actionPlan');
          if (doc) {
            setData(doc.data());
            setError(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching action plan:', err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Error setting up listener:', err);
      setError(err.message);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [schoolId, assessmentId]);

  return { data, loading, error };
}

/**
 * Hook: Fetch all Phase 3 data together
 */
export function usePhase3Dashboard(
  schoolId: string,
  assessmentId: string
) {
  const scores = useCalculatedScores(schoolId, assessmentId);
  const gaps = useGapAnalysis(schoolId, assessmentId);
  const recommendations = useRecommendations(schoolId, assessmentId);
  const actionPlan = useActionPlan(schoolId, assessmentId);

  const loading = scores.loading || gaps.loading || recommendations.loading || actionPlan.loading;
  const error = scores.error || gaps.error || recommendations.error || actionPlan.error;

  return {
    scores: scores.data,
    gaps: gaps.data,
    recommendations: recommendations.data,
    actionPlan: actionPlan.data,
    loading,
    error,
  };
}
