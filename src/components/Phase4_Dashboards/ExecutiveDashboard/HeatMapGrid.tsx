/**
 * HeatMap Grid Component
 * Phase 4: Executive Dashboard
 *
 * Displays 4×4 grid: Dimensions (rows) vs Severity (columns)
 * - Click to open dimension deep-dive
 * - Real-time updates from Firestore
 * - Color-coded severity levels
 */

import React, { useMemo } from 'react';
import { DimensionScore } from 'src/lib/phase4/useRealTimePhase3Data';

interface HeatMapGridProps {
  dimensionScores: DimensionScore[];
  onDimensionClick: (dimensionId: number) => void;
  loading?: boolean;
}

const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-600 hover:bg-red-700',
  HIGH: 'bg-orange-500 hover:bg-orange-600',
  MEDIUM: 'bg-yellow-400 hover:bg-yellow-500',
  LOW: 'bg-green-500 hover:bg-green-600',
} as const;

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const HeatMapGrid: React.FC<HeatMapGridProps> = ({
  dimensionScores,
  onDimensionClick,
  loading = false,
}) => {
  // Transform data for grid display
  const gridData = useMemo(() => {
    const grid: Record<number, Record<string, DimensionScore>> = {};

    // Initialize grid
    for (let i = 1; i <= 4; i++) {
      grid[i] = {
        CRITICAL: null,
        HIGH: null,
        MEDIUM: null,
        LOW: null,
      };
    }

    // Populate grid
    dimensionScores.forEach((score) => {
      if (score.dimensionId <= 4) {
        grid[score.dimensionId][score.gapSeverity] = score;
      }
    });

    return grid;
  }, [dimensionScores]);

  // Calculate statistics
  const stats = useMemo(() => {
    const counts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    dimensionScores.forEach((score) => {
      counts[score.gapSeverity]++;
    });

    return counts;
  }, [dimensionScores]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {(SEVERITY_ORDER).map((severity) => (
          <div
            key={severity}
            className={`${SEVERITY_COLORS[severity]} text-white p-4 rounded-lg shadow-md`}
          >
            <div className="text-2xl font-bold">{stats[severity]}</div>
            <div className="text-sm opacity-90">{severity}</div>
          </div>
        ))}
      </div>

      {/* Heat Map Grid */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dimension vs Severity</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-gray-600 font-semibold p-3 bg-gray-50">Dimension</th>
                {SEVERITY_ORDER.map((severity) => (
                  <th
                    key={severity}
                    className="text-center text-gray-600 font-semibold p-3 bg-gray-50"
                  >
                    {severity}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((dimensionId) => (
                <tr key={dimensionId} className="border-t hover:bg-gray-50">
                  <td className="text-left text-gray-800 font-medium p-3">
                    Dimension {dimensionId}
                  </td>
                  {SEVERITY_ORDER.map((severity) => {
                    const score = gridData[dimensionId]?.[severity];
                    return (
                      <td key={`${dimensionId}-${severity}`} className="text-center p-3">
                        {score ? (
                          <button
                            onClick={() => onDimensionClick(score.dimensionId)}
                            className={`${SEVERITY_COLORS[severity]} text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer w-full`}
                          >
                            Gap: {score.gap.toFixed(1)}
                          </button>
                        ) : (
                          <div className="text-gray-400 px-4 py-2">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          <p>
            <strong>How to read:</strong> Each cell shows gap score (Reality - Perception).
            Click any cell to view dimension details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeatMapGrid;
