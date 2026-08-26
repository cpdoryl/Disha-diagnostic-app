/**
 * Top Gaps Table
 * Phase 4: Days 8-9
 *
 * Sortable react-table showing largest perception-reality gaps
 */

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { GapAnalysisResult, GapItem } from 'src/lib/phase4/useRealTimePhase3Data';

interface TopGapsTableProps {
  gapAnalysis?: GapAnalysisResult;
  pageSize?: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#D32F2F',
  HIGH: '#F57C00',
  MEDIUM: '#FBC02D',
  LOW: '#388E3C',
};

export const TopGapsTable: React.FC<TopGapsTableProps> = ({
  gapAnalysis,
  pageSize = 25,
}) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'gapScore', desc: true },
  ]);

  const data = useMemo(() => {
    if (!gapAnalysis?.gaps) return [];
    return (gapAnalysis.gaps || [])
      .sort((a, b) => (b.gapScore || 0) - (a.gapScore || 0))
      .slice(0, 100);
  }, [gapAnalysis]);

  const columns = useMemo<ColumnDef<GapItem>[]>(
    () => [
      {
        accessorKey: 'dimensionId',
        header: 'Dimension',
        cell: (info) => (
          <span className="font-mono text-sm font-semibold text-blue-600">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'dimensionName',
        header: 'Dimension Name',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      },
      {
        accessorKey: 'metricName',
        header: 'Metric',
        cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
      },
      {
        accessorKey: 'gapScore',
        header: 'Gap Score',
        cell: (info) => {
          const score = (info.getValue() as number) || 0;
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{score.toFixed(1)}</span>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, score)}%` }}
                ></div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'gapSeverity',
        header: 'Severity',
        cell: (info) => {
          const severity = info.getValue() as string;
          return (
            <span
              className="px-2 py-1 rounded text-xs font-semibold text-white"
              style={{ backgroundColor: SEVERITY_COLORS[severity] || '#999' }}
            >
              {severity}
            </span>
          );
        },
      },
      {
        accessorKey: 'respondentType',
        header: 'Respondent Type',
        cell: (info) => (
          <span className="text-sm text-gray-600">{info.getValue()}</span>
        ),
      },
      {
        id: 'direction',
        header: 'Direction',
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="text-xs text-gray-600">
              {row.gapDirection === 'perception_higher'
                ? '📈 P > R'
                : '📉 R > P'}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b-2 border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold text-gray-900 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span className="text-xs text-gray-400">
                        {header.column.getIsSorted()
                          ? header.column.getIsSorted() === 'desc'
                            ? '↓'
                            : '↑'
                          : '↕'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-gray-200 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>No gaps detected. Excellent perception-reality alignment!</p>
        </div>
      )}

      {/* Footer Summary */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
        <span className="font-medium">Showing {data.length} gaps</span>
        {data.length > 0 && (
          <>
            {' '}• Highest gap:{' '}
            <span className="font-semibold text-gray-900">
              {data[0].gapScore?.toFixed(1)}
            </span>
            {' '}• Average:{' '}
            <span className="font-semibold text-gray-900">
              {(
                data.reduce((sum, g) => sum + (g.gapScore || 0), 0) / data.length
              ).toFixed(1)}
            </span>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="bg-blue-50 rounded p-4 text-sm text-gray-700">
        <p className="font-semibold mb-2">📌 Legend</p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>P &gt; R:</strong> Perception higher than Reality (stakeholders expect more than delivered)</li>
          <li>• <strong>R &gt; P:</strong> Reality higher than Perception (actual performance exceeds expectations)</li>
          <li>• <strong>Gap Score:</strong> Absolute difference between Perception and Reality (0-100 scale)</li>
        </ul>
      </div>
    </div>
  );
};

export default TopGapsTable;
