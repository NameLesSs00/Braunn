import React, { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  MdWorkOutline,
  MdAttachMoney,
  MdBarChart,
  MdAccessTime,
  MdOutlinePercent,
  MdPersonOff,
  MdGridOn,
  MdPictureAsPdf,
  MdPrint,
} from 'react-icons/md'
import { ArrowRight, Globe, MoreHorizontal, Briefcase, MapPin, User, Building, AlertCircle } from 'lucide-react'
import type { ChannelPerformanceData, ChannelSummary, ChannelData } from '../../../models/Report'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const kpiIconMap: Record<string, React.ElementType> = {
  briefcase: MdWorkOutline,
  dollar: MdAttachMoney,
  chart: MdBarChart,
  clock: MdAccessTime,
  percent: MdOutlinePercent,
  person_x: MdPersonOff,
}

const channelIconMap: Record<string, React.ElementType> = {
  'Booking.com': Building, 
  'Direct Website': Globe,
  'Expedia': Briefcase, 
  'Agoda': MapPin, 
  'Walk-in': User,
  'Others': MoreHorizontal,
  'Corporate': Briefcase,
  'Direct': Globe,
  'Email': User,
  'Group': User,
  'Phone': User,
}

const channelColors: string[] = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#8B5CF6', '#F97316']

function getChannelColor(index: number) {
  return channelColors[index % channelColors.length]
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="h-3 w-16 bg-slate-200 rounded" />
      </div>
      <div className="h-6 w-12 bg-slate-200 rounded mt-1" />
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

function ChannelKpiCards({ summary, status }: { summary?: ChannelSummary; status: string }) {
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const cards = [
    {
      id: 'bookings',
      label: 'Total Bookings',
      value: summary?.totalBookings.toLocaleString() ?? '-',
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
      icon: 'briefcase',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: summary?.totalRevenue != null ? summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-',
      unit: summary?.currency ?? '',
      iconBg: '#F0FDF4',
      iconColor: '#22C55E',
      icon: 'dollar',
    },
    {
      id: 'adr',
      label: 'ADR',
      value: summary?.adr != null ? summary.adr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-',
      unit: summary?.currency ?? '',
      iconBg: '#F5F3FF',
      iconColor: '#8B5CF6',
      icon: 'chart',
    },
    {
      id: 'alos',
      label: 'Avg Length of Stay',
      value: summary?.averageLengthOfStay != null ? summary.averageLengthOfStay.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '-',
      unit: 'Days',
      iconBg: '#FFF7ED',
      iconColor: '#F97316',
      icon: 'clock',
    },
    {
      id: 'cancel',
      label: 'Cancellation Rate',
      value: summary?.cancellationRate != null && summary?.cancellationRateAvailable ? `${summary.cancellationRate}%` : '-',
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
      icon: 'percent',
    },
    {
      id: 'noshow',
      label: 'No Show Rate',
      value: summary?.noShowRate != null && summary?.noShowRateAvailable ? `${summary.noShowRate}%` : '-',
      iconBg: '#F1F5F9',
      iconColor: '#64748B',
      icon: 'person_x',
    },
  ]

  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((stat) => {
        const Icon = kpiIconMap[stat.icon] ?? MdWorkOutline
        return (
          <div key={stat.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: stat.iconBg }}
              >
                <Icon size={20} style={{ color: stat.iconColor }} />
              </div>
              <span className="text-[11px] font-medium text-slate-500 leading-tight">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[22px] font-bold text-slate-800 leading-none">{stat.value}</span>
              {stat.unit && <span className="text-[11px] font-medium text-slate-400">{stat.unit}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Section 2: Charts Row ────────────────────────────────────────────────────

function DonutChartCard({ title, data, centerValue, centerLabel, status }: { title: string; data: any[]; centerValue: string; centerLabel: string; status: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0 relative">
      <h3 className="text-[14px] font-semibold text-slate-800 mb-4">{title}</h3>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="text-slate-400 text-sm">Loading...</div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: 150, height: 150 }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
            <span className="text-[14px] font-bold text-slate-800 leading-tight">{centerValue}</span>
            <span className="text-[10px] text-slate-500">{centerLabel}</span>
          </div>
          <PieChart width={150} height={150}>
            <Pie data={data} cx={75} cy={75} innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={2} stroke="#fff">
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(v: any, _: any, p: any) => [`${Number(v).toLocaleString()} (${p.payload.pct}%)`, p.payload.name]}
            />
          </PieChart>
        </div>
        <div className="flex flex-col gap-2 flex-1 ml-4 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
          {data.length === 0 && status === 'succeeded' && <span className="text-slate-400 text-[11px]">No data</span>}
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-slate-600 truncate">{item.name}</span>
              </div>
              <span className="text-[10px] text-slate-800 tabular-nums shrink-0 ml-2">
                {item.value.toLocaleString()} <span className="text-slate-400">({item.pct}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdrBarChart({ data, status }: { data: any[]; status: string }) {
  // Find max ADR to scale X-Axis correctly. We want some padding.
  const maxAdr = data.length > 0 ? Math.max(...data.map(d => d.value)) : 100
  const maxDomain = Math.ceil(maxAdr / 50) * 50

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0 relative">
      <h3 className="text-[14px] font-semibold text-slate-800 mb-6">ADR by Channel (USD)</h3>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="text-slate-400 text-sm">Loading...</div>
        </div>
      )}
      <div className="h-[150px]">
        {data.length === 0 && status === 'succeeded' ? (
           <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }} barSize={8}>
              <XAxis type="number" hide domain={[0, maxDomain]} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 10 }}
                width={80}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'ADR']}
              />
              <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex items-center justify-between mt-2 pl-[90px] pr-4">
        {[0, maxDomain/4, maxDomain/2, (maxDomain/4)*3, maxDomain].map((t) => (
          <span key={t} className="text-[10px] text-slate-400">{t}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Section 3: Overview Table ────────────────────────────────────────────────

function ChannelOverviewTable({ channels, summary, status }: { channels?: ChannelData[]; summary?: ChannelSummary; status: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <h3 className="text-[14px] font-semibold text-slate-800">Channel Performance Overview</h3>
        <button className="flex items-center gap-1.5 text-[12px] font-medium text-[#0B4EA2] hover:underline">
          View Channel Details <ArrowRight size={14} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-3 px-5 text-left font-medium text-slate-500 text-[11px] w-[180px]">Channel</th>
              <th className="py-3 px-3 text-right font-medium text-slate-500 text-[11px]">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-slate-400 mb-0.5">Bookings</span>
                  Count
                </div>
              </th>
              <th className="py-3 px-3 text-right font-medium text-slate-500 text-[11px]">%</th>
              <th className="py-3 px-3 text-right font-medium text-slate-500 text-[11px]">Room Nights</th>
              <th className="py-3 px-3 text-right font-medium text-slate-500 text-[11px]">Revenue (USD)</th>
              <th className="py-3 px-3 text-right font-medium text-slate-500 text-[11px]">ADR (USD)</th>
              <th className="py-3 px-3 text-right font-medium text-slate-500 text-[11px]">RevPAR (USD)</th>
              <th className="py-3 px-3 text-right font-medium text-slate-500 text-[11px]">Cancellation Rate</th>
              <th className="py-3 px-3 text-right font-medium text-slate-500 text-[11px]">No Show Rate</th>
              <th className="py-3 px-5 text-right font-medium text-slate-500 text-[11px]">Conversion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {status === 'loading' && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400">Loading data...</td>
              </tr>
            )}
            {status === 'succeeded' && (!channels || channels.length === 0) && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400">No data available for this period.</td>
              </tr>
            )}
            {status === 'succeeded' && channels?.map((row) => {
              const Icon = channelIconMap[row.channelName] || Globe
              return (
                <tr key={row.channelKey} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-5 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500">
                        <Icon size={12} />
                      </div>
                      {row.channelName}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-800">{row.bookingCount.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#0B4EA2]">{row.bookingPercentage}%</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.roomNights.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-medium text-slate-800">{row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.adr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.revPar.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.cancellationRateAvailable ? `${row.cancellationRate}%` : '-'}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.noShowRateAvailable ? `${row.noShowRate}%` : '-'}</td>
                  <td className="py-3 px-5 text-right tabular-nums text-slate-700">{row.conversionRateAvailable && row.conversionRate != null ? `${row.conversionRate}%` : '-'}</td>
                </tr>
              )
            })}
            
            {/* Total Row */}
            {status === 'succeeded' && summary && (
              <tr className="bg-slate-50/30 border-t-2 border-slate-200">
                <td className="py-3 px-5 font-bold text-[#0B4EA2]">Total</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B4EA2]">{summary.totalBookings.toLocaleString()}</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B4EA2]">100%</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B4EA2]">{channels?.reduce((a, b) => a + b.roomNights, 0).toLocaleString()}</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B4EA2]">{summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B4EA2]">{summary.adr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B4EA2]">-</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B4EA2]">{summary.cancellationRateAvailable ? `${summary.cancellationRate}%` : '-'}</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B4EA2]">{summary.noShowRateAvailable ? `${summary.noShowRate}%` : '-'}</td>
                <td className="py-3 px-5 text-right tabular-nums font-bold text-[#0B4EA2]">-</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Export Row ───────────────────────────────────────────────────────────────

function ChannelExportRow() {
  return (
    <div className="flex items-center justify-end gap-3 mt-1">
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

interface ChannelPerformanceTabProps {
  data?: ChannelPerformanceData
  status: string
  error?: string
}

export function ChannelPerformanceTab({ data, status, error }: ChannelPerformanceTabProps) {
  
  // Transform API data for charts
  const bookingsDonutData = useMemo(() => {
    if (!data?.channels) return []
    return data.channels
      .filter((c) => c.bookingCount > 0)
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .map((c, idx) => ({
        name: c.channelName,
        value: c.bookingCount,
        pct: c.bookingPercentage,
        color: getChannelColor(idx),
      }))
  }, [data?.channels])

  const revenueDonutData = useMemo(() => {
    if (!data?.channels) return []
    return data.channels
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .map((c, idx) => ({
        name: c.channelName,
        value: c.revenue,
        pct: c.revenuePercentage,
        color: getChannelColor(idx),
      }))
  }, [data?.channels])

  const adrBarData = useMemo(() => {
    if (!data?.channels) return []
    return data.channels
      .filter((c) => c.adr > 0)
      .sort((a, b) => b.adr - a.adr)
      .map((c, idx) => ({
        name: c.channelName,
        value: c.adr,
        color: getChannelColor(idx),
      }))
  }, [data?.channels])

  return (
    <div className="flex flex-col gap-5">
      {error && <ErrorMessage error={error} />}

      <ChannelKpiCards summary={data?.summary} status={status} />

      <div className="flex gap-4 items-stretch">
        <DonutChartCard 
          title="Bookings by Channel" 
          data={bookingsDonutData} 
          centerValue={data?.summary.totalBookings.toLocaleString() ?? '-'} 
          centerLabel="Total Bookings" 
          status={status}
        />
        <DonutChartCard 
          title="Revenue by Channel" 
          data={revenueDonutData} 
          centerValue={data?.summary.totalRevenue != null ? data.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-'} 
          centerLabel={data?.summary.currency ?? 'USD'} 
          status={status}
        />
        <AdrBarChart data={adrBarData} status={status} />
      </div>

      <ChannelOverviewTable channels={data?.channels} summary={data?.summary} status={status} />
      
      <ChannelExportRow />
    </div>
  )
}
