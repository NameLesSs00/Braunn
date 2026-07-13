import React from 'react'
import { ChevronDown } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { occupancyTrendData, adrTrendData, revenueTrendData } from '../dummyData'

interface TrendChartProps {
  title: string
  data: { date: string; value: number }[]
  color: string
  fillId: string
  yFormatter?: (v: number) => string
  lastValue: string
  lastValueBg: string
}

function TrendChart({ title, data, color, fillId, yFormatter, lastValue, lastValueBg }: TrendChartProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800">{title}</h3>
        <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[12px] text-slate-600 hover:bg-slate-50">
          Last 7 Days <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={yFormatter}
              width={40}
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#64748B', fontWeight: 600 }}
              formatter={(value: any) => [yFormatter ? yFormatter(value) : value, '']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${fillId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Last value badge */}
      <div className="flex justify-end mt-1">
        <span
          className="rounded px-2 py-0.5 text-[12px] font-bold text-white"
          style={{ backgroundColor: lastValueBg }}
        >
          {lastValue}
        </span>
      </div>
    </div>
  )
}

export function ReportCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <TrendChart
        title="Occupancy Trend"
        data={occupancyTrendData}
        color="#2563EB"
        fillId="fillOccupancy"
        yFormatter={(v) => `${v}%`}
        lastValue="72.5%"
        lastValueBg="#2563EB"
      />
      <TrendChart
        title="ADR Trend"
        data={adrTrendData}
        color="#10B981"
        fillId="fillAdr"
        yFormatter={(v) => `${v}`}
        lastValue="135.60"
        lastValueBg="#10B981"
      />
      <TrendChart
        title="Revenue Trend"
        data={revenueTrendData}
        color="#8B5CF6"
        fillId="fillRevenue"
        yFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
        lastValue="12.70K"
        lastValueBg="#8B5CF6"
      />
    </div>
  )
}
