/**
 * Phase 4 Dashboard Page
 * Displays Executive Summary Dashboard with real-time Phase 3 data
 *
 * Route: /dashboard/phase4/:schoolId/:assessmentId
 * Data: Real-time Firestore listeners from Phase 3
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DashboardExecutiveSummary } from 'src/components/Phase4_Dashboards/ExecutiveDashboard';

interface Phase4DashboardPageProps {
  schoolId?: string;
  assessmentId?: string;
}

export const Phase4DashboardPage: React.FC<Phase4DashboardPageProps> = ({
  schoolId: propSchoolId,
  assessmentId: propAssessmentId,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Get IDs from URL params or props
  const schoolId = propSchoolId || (router.query.schoolId as string);
  const assessmentId = propAssessmentId || (router.query.assessmentId as string);

  useEffect(() => {
    if (schoolId && assessmentId) {
      setLoading(false);
    }
  }, [schoolId, assessmentId]);

  const handleDimensionSelect = (dimensionId: number) => {
    // Navigate to dimension deep-dive
    router.push({
      pathname: '/dashboard/phase4/dimension',
      query: {
        schoolId,
        assessmentId,
        dimensionId,
      },
    });
  };

  if (loading || !schoolId || !assessmentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">14-Dimension Diagnostic Assessment Analysis</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                <strong>School ID:</strong> {schoolId?.slice(0, 8)}...
              </p>
              <p className="text-sm text-gray-600">
                <strong>Assessment ID:</strong> {assessmentId?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardExecutiveSummary
          schoolId={schoolId}
          assessmentId={assessmentId}
          onDimensionSelect={handleDimensionSelect}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About This Dashboard</h3>
              <p className="text-sm text-gray-600">
                Real-time analysis of school diagnostic assessments across 14 dimensions with
                gap analysis and recommended improvements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    User Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Dashboard Help
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-sm text-gray-600">
                Need help? Contact support or check our documentation for more information about
                dashboard features.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 flex items-center justify-between">
            <p className="text-sm text-gray-600">© 2026 DISHA Diagnostic Engine. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600">
                Privacy
              </a>
              <a href="#" className="hover:text-blue-600">
                Terms
              </a>
              <a href="#" className="hover:text-blue-600">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Export as default for Next.js
export default Phase4DashboardPage;
