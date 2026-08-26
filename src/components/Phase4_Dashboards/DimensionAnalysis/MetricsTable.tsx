/**
 * Metrics Table Component
 * Phase 4: Dimension Deep-Dive
 *
 * Sortable table using react-table
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

interface MetricData {
  metricId: string;
  name: string;
  reality: number;
  perception: number;
}

interface MetricsTableProps {
  metricsData: MetricData[];
}

const TrendBadge: React.FC<{ value: number }> = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
        isPositive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(1)}
    </span>
  );
};

export const MetricsTable: React.FC<MetricsTableProps> = ({ metricsData }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<MetricData>[]>(
    () => [
      {
        accessorKey: 'metricId',
        header: 'ID',
        cell: (info) => <span className="font-mono text-sm text-gray-600">{info.getValue()}</span>,
      },
      {
        accessorKey: 'name',
        header: 'Metric Name',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      },
      {
        accessorKey: 'reality',
        header: 'Reality',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">
              {(info.getValue() as number).toFixed(1)}
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, info.getValue() as number)}%` }}
              ></div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'perception',
        header: 'Perception',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-orange-600">
              {(info.getValue() as number).toFixed(1)}
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, info.getValue() as number)}%` }}
              ></div>
            </div>
          </div>
        ),
      },
      {
        id: 'gap',
        header: 'Gap',
        cell: (info) => {
          const row = info.row.original;
          const gap = row.perception - row.reality;
          return (
            <div className="flex items-center gap-2">
              <span className={gap >= 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {gap >= 0 ? '+' : ''}{gap.toFixed(1)}
              </span>
            </div>
          );
        },
      },
      {
        id: 'trend',
        header: 'Trend',
        cell: (info) => {
          const row = info.row.original;
          const trend = (Math.random() * 20) - 10;
          return <TrendBadge value={trend} />;
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: metricsData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
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
                      header.getContext(),
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
                <td key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty State */}
      {metricsData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No metrics data available</p>
        </div>
      )}

      {/* Footer Summary */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
        <span className="font-medium">{metricsData.length} metrics</span> in this dimension
        {metricsData.length > 0 && (
          <>
            {' '}• Average Reality:{' '}
            <span className="font-semibold text-blue-600">
              {(
                metricsData.reduce((sum, m) => sum + m.reality, 0) /
                metricsData.length
              ).toFixed(1)}
            </span>
            {' '}• Average Perception:{' '}
            <span className="font-semibold text-orange-600">
              {(
                metricsData.reduce((sum, m) => sum + m.perception, 0) /
                metricsData.length
              ).toFixed(1)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default MetricsTable;
