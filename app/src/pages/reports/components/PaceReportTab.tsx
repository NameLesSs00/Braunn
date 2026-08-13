
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import {
  MdCalendarToday,
  MdEventAvailable,
  MdTrendingUp,
  MdPieChart,
  MdHourglassEmpty,
  MdGridOn,
  MdPictureAsPdf,
  MdPrint,
} from 'react-icons/md'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import {
  bookingPaceByDateData,
  paceByRoomTypeData,
} from '../dummyData'
import type { PaceReportData, PaceSummary, WeeklyPace, PickupTrendPoint } from '../../../models/Report'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-1 items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-5 shadow-sm animate-pulse">
      <div className="h-12 w-12 rounded-full bg-slate-200" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-6 w-12 bg-slate-200 rounded" />
      </div>
    </div>
  )
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600 text-[13px]">
      <AlertCircle size={18} />
      <span>{error}</span>
    </div>
  )
}

// ─── Section 1: KPI Stat Cards ────────────────────────────────────────────────

function PaceKpiCards({ summary, status }: { summary?: PaceSummary; status: string }) {
  if (status === 'loading') {
    return (
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  // Map summary to 5 cards
  const cards = [
    {
      id: 'onbooks',
      label: 'On Books Room Nights',
      value: summary?.currentOnBooksRoomNights.toLocaleString() ?? '-',
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
      icon: MdCalendarToday,
      trendUp: (summary?.paceVarianceRoomNights ?? 0) >= 0,
      trend: summary?.paceVarianceRoomNights != null ? `${summary.paceVarianceRoomNights > 0 ? '+' : ''}${summary.paceVarianceRoomNights}` : null,
      sub: 'vs Last Year'
    },
    {
      id: 'variancePct',
      label: 'Pace Variance',
      value: summary?.paceVariancePercentage != null ? `${summary.paceVariancePercentage}%` : '-',
      iconBg: '#F0FDF4',
      iconColor: '#22C55E',
      icon: MdTrendingUp,
    },
    {
      id: 'leadtime',
      label: 'Avg Lead Time',
      value: summary?.averageLeadTimeDays.toLocaleString() ?? '-',
      unit: 'Days',
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
      icon: MdHourglassEmpty,
    },
    {
      id: 'reservations',
      label: 'Total Reservations',
      value: summary?.reservationCount.toLocaleString() ?? '-',
      iconBg: '#FFF7ED',
      iconColor: '#F97316',
      icon: MdEventAvailable,
    },
    {
      id: 'onbooksPct',
      label: 'On Books %',
      value: summary?.onBooksPercentage != null ? `${summary.onBooksPercentage}%` : '-',
      iconBg: '#F5F3FF',
      iconColor: '#8B5CF6',
      icon: MdPieChart,
    }
  ]

  return (
    <div className="flex gap-4">
      {cards.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.id} className="flex flex-1 items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-5 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: stat.iconBg }}
            >
              <Icon size={22} style={{ color: stat.iconColor }} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-medium text-slate-500 leading-tight truncate">{stat.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[24px] font-bold text-slate-800 leading-tight">{stat.value}</span>
                {stat.unit && <span className="text-[11px] text-slate-400 font-medium">{stat.unit}</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                {stat.trend != null && (
                  <>
                    {stat.trendUp
                      ? <TrendingUp className="h-3 w-3 text-green-500 shrink-0" strokeWidth={2.5} />
                      : <TrendingDown className="h-3 w-3 text-red-400 shrink-0" strokeWidth={2.5} />
                    }
                    <span className={`text-[11px] font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-400'}`}>
                      {stat.trend}
                    </span>
                  </>
                )}
                {stat.sub && (
                  <span className="text-[10px] text-slate-400">{stat.sub}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Section 2a: Pace Comparison Table ───────────────────────────────────────

function PaceComparisonTable({ weeklyPace, summary, status }: { weeklyPace?: WeeklyPace[]; summary?: PaceSummary; status: string }) {
  return (
    <div
      className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
      style={{ flex: '0 0 45%', minWidth: 0 }}
    >
      <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Pace Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100">
              {['Stay Date', 'This Year\nRooms', 'Last Year\nRooms', 'Variance\nRooms', '% Variance', 'On Books %'].map((h) => (
                <th key={h} className="pb-2.5 text-left font-medium text-slate-500 pr-3 whitespace-pre-line text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {status === 'loading' && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">Loading data...</td>
              </tr>
            )}
            {status === 'succeeded' && (!weeklyPace || weeklyPace.length === 0) && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">No data available for this period.</td>
              </tr>
            )}
            {status === 'succeeded' && weeklyPace?.map((row, i) => {
              const varianceStr = row.varianceRoomNights != null 
                ? (row.varianceRoomNights > 0 ? `+${row.varianceRoomNights}` : row.varianceRoomNights.toString())
                : '-'
              const varianceColor = (row.varianceRoomNights ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'

              return (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 pr-3 font-medium text-slate-800">{row.startDate} - {row.endDate.slice(5)}</td>
                  <td className="py-2.5 pr-3 font-semibold text-slate-800">{row.currentOnBooksRoomNights.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-slate-500">{row.previousYearOnBooksRoomNights?.toLocaleString() ?? '-'}</td>
                  <td className={`py-2.5 pr-3 font-semibold ${varianceColor}`}>{varianceStr}</td>
                  <td className={`py-2.5 pr-3 font-semibold ${varianceColor}`}>{row.variancePercentage != null ? `${row.variancePercentage}%` : '-'}</td>
                  <td className="py-2.5 text-slate-700">{row.onBooksPercentage}%</td>
                </tr>
              )
            })}
            
            {/* Total Row */}
            {status === 'succeeded' && summary && (
              <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                <td className="py-2.5 pr-3 font-bold text-[#0B4EA2]">Total</td>
                <td className="py-2.5 pr-3 font-bold text-[#0B4EA2]">{summary.currentOnBooksRoomNights.toLocaleString()}</td>
                <td className="py-2.5 pr-3 font-bold text-[#0B4EA2]">{summary.previousYearOnBooksRoomNights?.toLocaleString() ?? '-'}</td>
                <td className="py-2.5 pr-3 font-bold text-[#0B4EA2]">{summary.paceVarianceRoomNights != null ? (summary.paceVarianceRoomNights > 0 ? `+${summary.paceVarianceRoomNights}` : summary.paceVarianceRoomNights) : '-'}</td>
                <td className="py-2.5 pr-3 font-bold text-[#0B4EA2]">{summary.paceVariancePercentage != null ? `${summary.paceVariancePercentage}%` : '-'}</td>
                <td className="py-2.5 font-bold text-[#0B4EA2]">{summary.onBooksPercentage}%</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Section 2b: Pickup Trend Chart ──────────────────────────────────────────

function PickupTrendChart({ 
  trendPoints, 
  trendDays, 
  onTrendDaysChange,
  status 
}: { 
  trendPoints?: PickupTrendPoint[]; 
  trendDays: number;
  onTrendDaysChange: (d: number) => void;
  status: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-slate-800">Pickup Trend <span className="text-slate-400 font-normal text-[12px]">(Rooms)</span></h3>
        <select 
          className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none cursor-pointer hover:border-slate-300"
          value={trendDays}
          onChange={(e) => onTrendDaysChange(Number(e.target.value))}
        >
          <option value={7}>Last 7 Days</option>
          <option value={14}>Last 14 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={60}>Last 60 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded bg-[#2563EB]" />
          <span className="text-[11px] text-slate-500">This Year Pickup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 2" /></svg>
          <span className="text-[11px] text-slate-500">Last Year Pickup</span>
        </div>
      </div>

      <div className="h-[240px] relative">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <div className="text-slate-400 text-sm">Loading chart data...</div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trendPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} dy={6} minTickGap={20} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              width={36}
            />
            <ReferenceLine y={0} stroke="#CBD5E1" strokeWidth={1.5} />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(v: any, name: any) => [v, name === 'pickupRoomNights' ? 'This Year' : 'Last Year']}
            />
            <Line
              type="monotone"
              dataKey="pickupRoomNights"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: '#2563EB', r: 3.5, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0, fill: '#2563EB' }}
            />
            <Line
              type="monotone"
              dataKey="previousYearPickupRoomNights"
              stroke="#CBD5E1"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: '#CBD5E1' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Section 3a: Booking Pace Bar Chart ──────────────────────────────────────

function BookingPaceBarChart() {
  return (
    <div
      className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
      style={{ flex: '0 0 45%', minWidth: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-slate-800">Booking Pace by Stay Date</h3>
        <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
          <option>Next 60 Days</option>
          <option>Next 30 Days</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-[#2563EB]" />
          <span className="text-[11px] text-slate-500">This Year</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-[#CBD5E1]" />
          <span className="text-[11px] text-slate-500">Last Year</span>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={bookingPaceByDateData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} dy={6} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} width={36} />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(v: any, name: any) => [v, name === 'thisYear' ? 'This Year' : 'Last Year']}
            />
            <Bar dataKey="thisYear" fill="#2563EB" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="lastYear" fill="#CBD5E1" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Section 3b: Pace by Room Type Table ─────────────────────────────────────

function PaceByRoomTypeTable() {
  const headers = ['Room Type', 'This Year\nRooms', 'Last Year\nRooms', 'Variance\nRooms', '% Variance', 'On Books %']
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800">Pace by Room Type</h3>
        <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
          <option>Next 60 Days</option>
          <option>Next 30 Days</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100">
              {headers.map((h) => (
                <th key={h} className="pb-2.5 text-left font-medium text-slate-500 pr-4 whitespace-pre-line text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paceByRoomTypeData.map((row) => {
              const isTotal = row.isTotal
              return (
                <tr key={row.roomType} className={isTotal ? 'border-t border-slate-200' : 'hover:bg-slate-50/50'}>
                  <td className={`py-2.5 pr-4 ${isTotal ? 'font-bold text-[#0B4EA2]' : 'font-medium text-slate-800'}`}>{row.roomType}</td>
                  <td className={`py-2.5 pr-4 ${isTotal ? 'font-bold text-[#0B4EA2]' : 'font-semibold text-slate-800'}`}>{row.thisYear.toLocaleString()}</td>
                  <td className={`py-2.5 pr-4 ${isTotal ? 'font-bold text-[#0B4EA2]' : 'text-slate-500'}`}>{row.lastYear.toLocaleString()}</td>
                  <td className={`py-2.5 pr-4 font-semibold ${isTotal ? 'text-[#0B4EA2]' : 'text-emerald-600'}`}>+{row.variance}</td>
                  <td className={`py-2.5 pr-4 font-semibold ${isTotal ? 'text-[#0B4EA2]' : 'text-emerald-600'}`}>{row.pctVariance}</td>
                  <td className={`py-2.5 ${isTotal ? 'font-bold text-[#0B4EA2]' : 'text-slate-700'}`}>{row.onBooks}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Export Row ───────────────────────────────────────────────────────────────

function PaceExportRow() {
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

interface PaceReportTabProps {
  data?: PaceReportData
  status: string
  error?: string
  trendDays: number
  onTrendDaysChange: (d: number) => void
}

export function PaceReportTab({ data, status, error, trendDays, onTrendDaysChange }: PaceReportTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {error && <ErrorMessage error={error} />}

      {/* 5 KPI stat cards */}
      <PaceKpiCards summary={data?.summary} status={status} />

      {/* Pace Comparison table + Pickup Trend chart */}
      <div className="flex gap-4 items-stretch">
        <PaceComparisonTable 
          weeklyPace={data?.weeklyPace} 
          summary={data?.summary} 
          status={status} 
        />
        <PickupTrendChart 
          trendPoints={data?.pickupTrend} 
          trendDays={trendDays} 
          onTrendDaysChange={onTrendDaysChange} 
          status={status} 
        />
      </div>

      {/* Booking Pace bar chart + Pace by Room Type table (Static Dummy Data) */}
      <div className="flex gap-4 items-stretch">
        <BookingPaceBarChart />
        <PaceByRoomTypeTable />
      </div>

      {/* Export buttons */}
      <PaceExportRow />
    </div>
  )
}
