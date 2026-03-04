import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import type { MarginProjections } from '@/utils/module3/damodaranFramework';

interface MarginCompressionChartProps {
  projections: MarginProjections;
  className?: string;
}

export function MarginCompressionChart({ projections, className }: MarginCompressionChartProps) {
  // Combine data for the chart
  const chartData = projections.currentPath.map((point, index) => ({
    month: point.month,
    currentPath: point.margin,
    aiAdopted: projections.aiAdopted[index]?.margin,
    competitorFirst: projections.competitorFirst[index]?.margin,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-900 mb-2">Month {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-6', className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Margin Compression Analysis</h3>
        <p className="text-sm text-slate-500 mt-1">
          24-month EBITDA margin trajectory under different AI scenarios
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              {/* Gradient for the value gap shading */}
              <linearGradient id="valueGapGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#E11D48" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={{ stroke: '#CBD5E1' }}
              axisLine={{ stroke: '#CBD5E1' }}
              label={{ value: 'Months', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#64748B' }}
            />

            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={{ stroke: '#CBD5E1' }}
              axisLine={{ stroke: '#CBD5E1' }}
              label={{ value: 'EBITDA Margin %', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748B' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
            />

            {/* Decision Point annotation */}
            <ReferenceLine
              x={12}
              stroke="#B8860B"
              strokeDasharray="5 5"
              label={{
                value: 'Decision Point',
                position: 'top',
                fill: '#B8860B',
                fontSize: 11,
                fontWeight: 600,
              }}
            />

            {/* Zero line */}
            <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1} />

            {/* Area between AI-adopted and competitor-first to show value gap */}
            <Area
              type="monotone"
              dataKey="aiAdopted"
              stroke="none"
              fill="url(#valueGapGradient)"
              fillOpacity={0.3}
            />

            {/* Current path line */}
            <Line
              type="monotone"
              dataKey="currentPath"
              name="Current Path"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#3B82F6' }}
              activeDot={{ r: 5 }}
            />

            {/* AI-adopted line */}
            <Line
              type="monotone"
              dataKey="aiAdopted"
              name="AI-Adopted"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 3, fill: '#059669' }}
              activeDot={{ r: 5 }}
            />

            {/* Competitor-first line */}
            <Line
              type="monotone"
              dataKey="competitorFirst"
              name="Competitor-First"
              stroke="#E11D48"
              strokeWidth={3}
              dot={{ r: 3, fill: '#E11D48' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend explanation */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-4 h-0.5 mt-2 bg-blue-500" style={{ borderTop: '2px dashed #3B82F6' }} />
            <div>
              <span className="font-medium text-slate-700">Current Path</span>
              <p className="text-xs text-slate-500">Status quo trajectory without AI investment</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-1 mt-1.5 bg-emerald-500 rounded" />
            <div>
              <span className="font-medium text-slate-700">AI-Adopted</span>
              <p className="text-xs text-slate-500">Proactive AI integration drives margin expansion</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-1 mt-1.5 bg-rose-500 rounded" />
            <div>
              <span className="font-medium text-slate-700">Competitor-First</span>
              <p className="text-xs text-slate-500">AI-enabled competitors erode pricing power</p>
            </div>
          </div>
        </div>
      </div>

      {/* Value Gap callout */}
      <div className="mt-4 bg-gradient-to-r from-emerald-50 to-rose-50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-b from-emerald-400 to-rose-400" />
          <span className="text-sm font-medium text-slate-700">Value Gap Zone</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          The shaded area represents the margin differential between AI leadership and AI laggard scenarios.
          This gap typically accelerates after Month 12 as network effects compound.
        </p>
      </div>
    </div>
  );
}

export default MarginCompressionChart;
