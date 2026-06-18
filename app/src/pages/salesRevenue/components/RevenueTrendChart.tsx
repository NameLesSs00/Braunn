import { useRef, useState } from 'react'
import { Download, ArrowUpRight } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { AnimatedCounter } from './AnimatedCounter'

const revenueData = [
  { date: 'Dec 01', value: 12500 },
  { date: 'Dec 05', value: 15200 },
  { date: 'Dec 10', value: 18200 },
  { date: 'Dec 15', value: 16800 },
  { date: 'Dec 20', value: 19500 },
  { date: 'Dec 25', value: 22800 },
  { date: 'Dec 30', value: 19800 },
]

const occupancyData = [
  { date: 'Dec 01', value: 75 },
  { date: 'Dec 05', value: 80 },
  { date: 'Dec 10', value: 88 },
  { date: 'Dec 15', value: 83 },
  { date: 'Dec 20', value: 92 },
  { date: 'Dec 25', value: 97 },
  { date: 'Dec 30', value: 91 },
]

type ViewMode = 'revenue' | 'occupancy'

export function RevenueTrendChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('revenue')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(rootRef, { amount: 0.35, once: true })

  const isRevenue = viewMode === 'revenue'
  const data = isRevenue ? revenueData : occupancyData
  const color = isRevenue ? '#0B4EA2' : '#16a34a'
  const bgColor = isRevenue ? 'bg-blue-50' : 'bg-emerald-50'

  const formatYAxis = (value: number) => {
    if (isRevenue) {
      return `$${(value / 1000).toFixed(0)}k`
    }
    return `${value}%`
  }

  return (
    <div ref={rootRef} className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('revenue')}
              className={[
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                isRevenue ? 'bg-[#0B4EA2] text-white' : 'text-slate-600 hover:bg-slate-100',
              ].join(' ')}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => setViewMode('occupancy')}
              className={[
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                !isRevenue ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100',
              ].join(' ')}
            >
              Occupancy
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className={`rounded-xl ${bgColor} p-5 mb-6`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-500">
              {isRevenue ? 'Current Month Revenue' : 'Current Occupancy Rate'}
            </div>
            <div className="mt-1 text-3xl font-bold text-slate-800">
              <AnimatedCounter valueStr={isRevenue ? '€124,850' : '84.3%'} active={inView} />
            </div>
            {!isRevenue && (
              <div className="mt-3 flex gap-8">
                <div>
                  <div className="text-xs text-slate-500">Rooms Sold</div>
                  <div className="text-lg font-semibold text-slate-800">
                    <AnimatedCounter valueStr="1,280" active={inView} durationMs={1800} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Available</div>
                  <div className="text-lg font-semibold text-slate-800">
                    <AnimatedCounter valueStr="1,520" active={inView} durationMs={1800} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span className="font-semibold">{isRevenue ? '+12.5%' : '+5.8%'}</span>
            </div>
            <div className="text-sm text-slate-500">vs last month</div>
          </div>
        </div>
      </div>

      <div className="h-64">
        {inView ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={formatYAxis}
                dx={-10}
                domain={isRevenue ? [0, 'auto'] : [0, 100]}
              />
              <Line
                isAnimationActive
                animationDuration={900}
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <motion.div
            className="h-full w-full rounded-xl bg-slate-50"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
