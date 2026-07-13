import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  MdPieChart,
  MdHotel,
  MdNightlight,
  MdEventAvailable,
  MdEventBusy,
  MdGridOn,
  MdPictureAsPdf,
  MdPrint,
} from 'react-icons/md'
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  occupancyKpiStats,
  forecastCalendarData,
  occupancyTrendData30,
  alosData30,
  losDistributionData,
  bookingWindowData,
} from '../dummyData'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  pie: MdPieChart,
  bed: MdHotel,
  moon: MdNightlight,
  calendar_check: MdEventAvailable,
  calendar_x: MdEventBusy,
}

function getCalendarColor(pct: number): { bg: string; text: string } {
  if (pct >= 86) return { bg: '#16A34A', text: '#ffffff' }
  if (pct >= 71) return { bg: '#DCFCE7', text: '#15803D' }
  if (pct >= 51) return { bg: '#FEF9C3', text: '#92400E' }
  return { bg: '#FEE2E2', text: '#B91C1C' }
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Section 1: KPI Stats Row ─────────────────────────────────────────────────

function OccupancyKpiCards() {
  return (
    <div className="flex items-stretch rounded-xl border border-slate-100 bg-white shadow-sm divide-x divide-slate-100">
      {occupancyKpiStats.map((stat) => {
        const Icon = iconMap[stat.icon] ?? MdPieChart
        return (
          <div key={stat.id} className="flex flex-1 items-center gap-4 px-6 py-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: stat.iconBg }}
            >
              <Icon size={22} style={{ color: stat.iconColor }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-500 leading-tight">{stat.label}</span>
              <span className="text-[26px] font-bold text-slate-800 leading-tight">{stat.value}</span>
              <div className="flex items-center gap-1 mt-0.5">
                {stat.trend != null ? (
                  <>
                    {stat.trendUp
                      ? <TrendingUp className="h-3 w-3 text-green-500" strokeWidth={2.5} />
                      : <TrendingDown className="h-3 w-3 text-red-400" strokeWidth={2.5} />
                    }
                    <span className={`text-[11px] font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-400'}`}>
                      {stat.trend}
                    </span>
                    <span className="text-[10px] text-slate-400">{stat.sub}</span>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400">{stat.sub}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Section 2a: Forecast Calendar ───────────────────────────────────────────

function ForecastCalendar() {
  const weeks: typeof forecastCalendarData[] = []
  for (let i = 0; i < forecastCalendarData.length; i += 7) {
    weeks.push(forecastCalendarData.slice(i, i + 7))
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm" style={{ flex: '0 0 45%', minWidth: 0 }}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800">Occupancy Forecast (Next 30 Days)</h3>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-slate-500 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar rows */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((cell, ci) => {
              const { bg, text } = getCalendarColor(cell.pct)
              return (
                <div
                  key={ci}
                  className="relative flex flex-col items-center justify-center rounded-lg py-2 px-1"
                  style={{ backgroundColor: bg }}
                >
                  <span className="absolute top-1 left-1.5 text-[9px] font-medium" style={{ color: text, opacity: 0.7 }}>
                    {cell.date.split(' ')[1]}
                  </span>
                  <span className="text-[14px] font-bold mt-2" style={{ color: text }}>
                    {cell.pct}%
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
        {[
          { label: '0 – 50%', color: '#FCA5A5' },
          { label: '51 – 70%', color: '#FDE68A' },
          { label: '71 – 85%', color: '#86EFAC' },
          { label: '86 – 100%', color: '#16A34A' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section 2b: Occupancy Trend Dual-line Chart ─────────────────────────────

function OccupancyTrendChart() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-slate-800">Occupancy Trend</h3>
        <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
          <option>Last 30 Days</option>
          <option>Last 14 Days</option>
          <option>This Month</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded bg-[#2563EB]" />
          <span className="text-[11px] text-slate-500">Occupancy (%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 2" /></svg>
          <span className="text-[11px] text-slate-500">Same Period Last Year (%)</span>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={occupancyTrendData30} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillOccTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              dy={6}
              interval={4}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              width={36}
            />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(value: number, name: string) => [`${value}%`, name === 'occupancy' ? 'Occupancy' : 'Last Year']}
            />
            {/* Solid blue area */}
            <Area type="monotone" dataKey="occupancy" stroke="#2563EB" strokeWidth={2} fill="url(#fillOccTrend)" fillOpacity={1} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            {/* Dashed gray line (no fill) */}
            <Area type="monotone" dataKey="lastYear" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5 3" fill="none" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-end mt-1">
        <span className="rounded px-2 py-0.5 text-[12px] font-bold text-white" style={{ backgroundColor: '#2563EB' }}>
          76%
        </span>
      </div>
    </div>
  )
}

// ─── Section 3a: ALOS Trend ───────────────────────────────────────────────────

function AlosChart() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-slate-800">Average Length of Stay Trend</h3>
        <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
          <option>Last 30 Days</option>
        </select>
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="h-0.5 w-5 rounded bg-[#2563EB]" />
        <span className="text-[11px] text-slate-500">ALOS</span>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={alosData30} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillAlosTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} dy={6} interval={4} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} width={28} />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(v: number) => [v.toFixed(1), 'ALOS']}
            />
            <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#fillAlosTrend)" fillOpacity={1} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Section 3b: LOS Distribution Donut ──────────────────────────────────────

const RADIAN = Math.PI / 180
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (value < 8) return null // skip tiny slices
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${value}%`}
    </text>
  )
}

function LosDistributionChart() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <h3 className="text-[14px] font-semibold text-slate-800 mb-3">Length of Stay Distribution</h3>

      {/* Large donut — centered, full width */}
      <div className="flex justify-center">
        <PieChart width={220} height={220}>
          <Pie
            data={losDistributionData}
            cx={105}
            cy={105}
            innerRadius={65}
            outerRadius={105}
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
            labelLine={false}
            label={renderCustomLabel}
          >
            {losDistributionData.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
            formatter={(v: number, _: any, p: any) => [`${v}%`, p.payload.name]}
          />
        </PieChart>
      </div>

      {/* Legend grid below chart */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
        {losDistributionData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-slate-600">{item.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-800">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}


// ─── Section 3c: Booking Window ───────────────────────────────────────────────

function BookingWindowChart() {
  const maxCount = Math.max(...bookingWindowData.map((d) => d.count))
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800">Booking Window <span className="text-slate-400 font-normal text-[12px]">(Days in Advance)</span></h3>
        <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
          <option>Last 30 Days</option>
        </select>
      </div>
      <div className="flex flex-col gap-3">
        {bookingWindowData.map((item) => {
          const pct = (item.count / maxCount) * 100
          return (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{item.label}</span>
                <span className="text-[11px] font-semibold text-slate-800">{item.count} <span className="text-slate-400 font-normal">({item.pct})</span></span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        {/* X-axis ticks */}
        <div className="flex items-center justify-between mt-1">
          {['0', '50', '100', '150', '200'].map((t) => (
            <span key={t} className="text-[9px] text-slate-400">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Export Row ───────────────────────────────────────────────────────────────

function ExportRow() {
  return (
    <div className="flex items-center justify-end gap-3">
      <button onClick={() => alert('Export Excel')} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:border-green-400 hover:bg-green-50 hover:text-green-600 transition">
        <MdGridOn size={18} className="text-green-600" /> Export Excel
      </button>
      <button onClick={() => alert('Export PDF')} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:border-red-400 hover:bg-red-50 hover:text-red-500 transition">
        <MdPictureAsPdf size={18} className="text-red-500" /> Export PDF
      </button>
      <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:border-[#0B4EA2] hover:bg-blue-50 hover:text-[#0B4EA2] transition">
        <MdPrint size={18} className="text-[#0B4EA2]" /> Print Report
      </button>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function OccupancyForecastTab() {
  return (
    <div className="flex flex-col gap-5">
      {/* 5 KPI stat cards */}
      <OccupancyKpiCards />

      {/* Forecast calendar + Occupancy Trend */}
      <div className="flex gap-4 items-stretch">
        <ForecastCalendar />
        <OccupancyTrendChart />
      </div>

      {/* Bottom 3-column row */}
      <div className="flex gap-4 items-stretch">
        <AlosChart />
        <LosDistributionChart />
        <BookingWindowChart />
      </div>

      {/* Export buttons */}
      <ExportRow />
    </div>
  )
}
