import React, { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  MdOutlineCancel,
  MdEventBusy,
  MdAttachMoney,
  MdPersonOff,
  MdGridOn,
  MdPictureAsPdf,
  MdPrint,
} from 'react-icons/md'
import {
  TrendingUp,
  TrendingDown,
  Globe,
  MoreHorizontal,
  Briefcase,
  MapPin,
  User,
  Building,
  AlertCircle
} from 'lucide-react'
import type { 
  CancellationReportData, 
  CancellationSummaryCards,
  CancellationReason,
  CombinedSummaryData
} from '../../../models/Report'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const kpiIconMap: Record<string, React.ElementType> = {
  x_circle: MdOutlineCancel,
  calendar_x: MdEventBusy,
  dollar: MdAttachMoney,
  person_clock: MdPersonOff,
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

const donutColors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#64748B']

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

function CancellationKpiCards({ summary, status }: { summary?: CancellationSummaryCards; status: string }) {
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const mapMetric = (metric: any, label: string, icon: string, iconBg: string, iconColor: string, unit: string = '') => ({
    id: label,
    label,
    value: metric?.currentValue != null ? metric.currentValue.toLocaleString(undefined, { minimumFractionDigits: unit === '%' ? 1 : 0 }) : '-',
    unit,
    icon,
    iconBg,
    iconColor,
    trend: metric?.changeValue != null ? `${metric.changeValue > 0 ? '+' : ''}${metric.changeValue}` : null,
    trendUp: (metric?.changeValue ?? 0) > 0,
    goodIsDown: true, // For cancellations, going UP is BAD
    available: metric?.available ?? true,
  })

  const cards = [
    mapMetric(summary?.cancellationRate, 'Cancellation Rate', 'x_circle', '#FEF2F2', '#EF4444', '%'),
    mapMetric(summary?.cancelledBookings, 'Cancelled Bookings', 'calendar_x', '#FFF7ED', '#F97316', ''),
    mapMetric(summary?.cancelledLostRevenue, 'Lost Rev (Cancelled)', 'dollar', '#F1F5F9', '#64748B', ''),
    mapMetric(summary?.noShowRate, 'No Show Rate', 'person_x', '#F5F3FF', '#8B5CF6', '%'),
    mapMetric(summary?.noShowBookings, 'No Show Bookings', 'person_clock', '#EFF6FF', '#3B82F6', ''),
    mapMetric(summary?.noShowLostRevenue, 'Lost Rev (No Show)', 'dollar', '#F1F5F9', '#64748B', ''),
  ].filter(c => c.available)

  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((stat) => {
        const Icon = kpiIconMap[stat.icon] ?? MdOutlineCancel
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
            <div className="flex items-center gap-1 mt-1 min-h-[16px]">
              {stat.trend != null && stat.value !== '-' && (
                <>
                  <span className="text-[10px] text-slate-400">vs Prev</span>
                  {stat.trendUp
                    ? <TrendingUp className={`h-3 w-3 shrink-0 ml-auto ${stat.goodIsDown ? 'text-red-400' : 'text-green-500'}`} strokeWidth={2.5} />
                    : <TrendingDown className={`h-3 w-3 shrink-0 ml-auto ${stat.goodIsDown ? 'text-green-500' : 'text-red-400'}`} strokeWidth={2.5} />
                  }
                  <span className={`text-[10px] font-semibold ${stat.goodIsDown ? (stat.trendUp ? 'text-red-500' : 'text-green-600') : (stat.trendUp ? 'text-green-600' : 'text-red-500')}`}>
                    {stat.trend}
                  </span>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Section 2: Charts Row ────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-[12px] border-none z-50 relative">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-medium text-slate-800">
              {entry.name.includes('Rate') ? `${entry.value.toFixed(1)}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function TrendChartCard({ 
  title, 
  data, 
  lineKey, 
  barKey, 
  lineColor, 
  barColor, 
  lineName,
  barName,
  trendDays,
  onTrendDaysChange,
  status
}: any) {
  
  // Calculate dynamic max domains for better scaling
  const maxLine = data ? Math.max(...data.map((d: any) => d[lineKey] || 0), 10) : 10
  const maxBar = data ? Math.max(...data.map((d: any) => d[barKey] || 0), 10) : 10
  const leftDomain = [0, Math.ceil(maxLine * 1.2)]
  const rightDomain = [0, Math.ceil(maxBar * 1.2)]

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800 flex items-center gap-1">
          {title} <span className="text-slate-400 text-[10px] cursor-pointer" title="Based on stay dates">ⓘ</span>
        </h3>
        {onTrendDaysChange && (
          <select 
            className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded px-2 py-1 outline-none cursor-pointer"
            value={trendDays}
            onChange={(e) => onTrendDaysChange(Number(e.target.value))}
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lineColor }} />
          <span className="text-[10px] font-medium text-slate-500">{lineName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: barColor }} />
          <span className="text-[10px] font-medium text-slate-500">{barName}</span>
        </div>
      </div>

      <div className="h-[200px] relative">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <div className="text-slate-400 text-sm">Loading...</div>
          </div>
        )}
        {!data || data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-0 text-slate-400 text-[12px]">
            No trend data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} dy={10} minTickGap={20} />
              <YAxis 
                yAxisId="left" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10 }} 
                domain={leftDomain} 
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10 }} 
                domain={rightDomain}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar yAxisId="right" dataKey={barKey} name={barName} fill={barColor} radius={[2, 2, 0, 0]} barSize={8} />
              <Line yAxisId="left" type="monotone" dataKey={lineKey} name={lineName} stroke={lineColor} strokeWidth={2} dot={{ r: 3, fill: lineColor, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function DonutChartCard({ title, data, status }: { title: string, data: CancellationReason[], status: string }) {
  const pieData = useMemo(() => {
    return data.map((d, i) => ({
      name: d.reason || 'Unknown',
      value: d.count,
      pct: `${d.percentage.toFixed(1)}%`,
      color: donutColors[i % donutColors.length]
    }))
  }, [data])

  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0 relative">
      <h3 className="text-[14px] font-semibold text-slate-800 mb-6 flex items-center gap-1">
        {title}
      </h3>
      
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="text-slate-400 text-sm">Loading...</div>
        </div>
      )}

      {!data || data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-[12px]">
          No reason data.
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-4">
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
              <span className="text-[16px] font-bold text-slate-800 leading-tight">{total}</span>
              <span className="text-[11px] font-medium text-slate-500">Total</span>
            </div>
            <PieChart width={140} height={140}>
              <Pie data={pieData} cx={70} cy={70} innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#fff">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <RechartsTooltip
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(v: any, _: any, p: any) => [`${Number(v).toLocaleString()} (${p.payload.pct})`, p.payload.name]}
              />
            </PieChart>
          </div>
          <div className="flex flex-col gap-2.5 flex-1 ml-6 overflow-y-auto max-h-[140px] pr-2 custom-scrollbar">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-slate-600 truncate" title={item.name}>{item.name}</span>
                </div>
                <span className="text-[11px] text-slate-800 tabular-nums shrink-0 ml-2">
                  {item.value} <span className="text-slate-400">({item.pct})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section 3: Data Tables Row ───────────────────────────────────────────────

function ChannelTableCard({ title, columns, data, status }: any) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm flex-1 min-w-0 overflow-hidden relative">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-[14px] font-semibold text-slate-800 flex items-center gap-1">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto min-h-[150px]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col: any, i: number) => (
                <th key={col.key} className={`py-3 ${i === 0 ? 'px-5 text-left' : 'px-4 text-center'} font-medium text-slate-500 text-[11px]`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {status === 'loading' && (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-slate-400">Loading...</td>
              </tr>
            )}
            {status === 'succeeded' && (!data || data.length === 0) && (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-slate-400">No channel data.</td>
              </tr>
            )}
            {status === 'succeeded' && data?.map((row: any) => {
              const Icon = channelIconMap[row.channelName] || Globe
              
              return (
                <tr key={row.channelKey} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-5 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-500">
                        <Icon size={11} />
                      </div>
                      {row.channelName}
                    </div>
                  </td>
                  {columns.slice(1).map((col: any) => {
                    let val = row[col.key]
                    if (val == null && !row[`${col.key}Available`]) val = '-'
                    else if (col.isCurrency) val = val?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '-'
                    else if (col.isPercent) val = `${val}%`
                    
                    return (
                      <td key={col.key} className="py-3 px-4 text-center tabular-nums font-semibold text-slate-800">
                        {val}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({ summary, status }: { summary?: CombinedSummaryData; status: string }) {
  const rows = [
    { metric: 'Cancelled', ...summary?.cancelled },
    { metric: 'No Show', ...summary?.noShow },
  ]
  const combined = summary?.combined

  const alertAvailable = combined?.lostRevenueAvailable && combined?.lostRevenuePercentageOfTotalRevenue != null

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm flex-1 min-w-0 overflow-hidden relative">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-[14px] font-semibold text-slate-800 flex items-center gap-1">
          Cancellation & No Show Summary
        </h3>
      </div>
      <div className="overflow-x-auto min-h-[150px]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-3 px-5 text-left font-medium text-slate-500 text-[11px]">Metric</th>
              <th className="py-3 px-4 text-center font-medium text-slate-500 text-[11px]">Bookings</th>
              <th className="py-3 px-4 text-center font-medium text-slate-500 text-[11px]">Rate</th>
              <th className="py-3 px-5 text-center font-bold text-slate-700 text-[11px]">Lost Rev (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {status === 'loading' && (
              <tr><td colSpan={4} className="py-6 text-center text-slate-400">Loading...</td></tr>
            )}
            {status === 'succeeded' && rows.map((row: any) => (
              <tr key={row.metric} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-5 font-medium text-slate-700">{row.metric}</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-800">{row.bookingCount ?? '-'}</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-800">{row.rate != null ? `${row.rate}%` : '-'}</td>
                <td className="py-3 px-5 text-center font-medium text-slate-600">{row.lostRevenueAvailable && row.lostRevenue != null ? row.lostRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
              </tr>
            ))}
            {/* Total Row */}
            {status === 'succeeded' && combined && (
              <tr className="bg-slate-50/30 border-t-2 border-slate-200">
                 <td className="py-3 px-5 font-bold text-[#0B4EA2]">Total</td>
                 <td className="py-3 px-4 text-center font-bold text-[#0B4EA2]">{combined.bookingCount ?? '-'}</td>
                 <td className="py-3 px-4 text-center font-bold text-[#0B4EA2]">{combined.rate != null ? `${combined.rate}%` : '-'}</td>
                 <td className="py-3 px-5 text-center font-bold text-[#0B4EA2]">{combined.lostRevenueAvailable && combined.lostRevenue != null ? combined.lostRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Alert Box */}
      {status === 'succeeded' && alertAvailable && (
        <div className="m-4 mt-auto rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[12px] font-medium text-red-600 leading-snug">
            Total Lost Revenue due to cancellations & no shows is <span className="font-bold">{combined.lostRevenuePercentageOfTotalRevenue}%</span> of total revenue.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Export Row ───────────────────────────────────────────────────────────────

function ExportRow() {
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

interface CancellationTabProps {
  data?: CancellationReportData
  status: string
  error?: string
  trendDays: number
  onTrendDaysChange: (d: number) => void
}

export function CancellationTab({ data, status, error, trendDays, onTrendDaysChange }: CancellationTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {error && <ErrorMessage error={error} />}

      <CancellationKpiCards summary={data?.summaryCards} status={status} />

      <div className="flex gap-4 items-stretch">
        <TrendChartCard 
          title="Cancellation Trend"
          data={data?.cancellationTrend}
          lineKey="cancellationRate"
          barKey="cancelledBookings"
          lineColor="#EF4444"
          barColor="#FECACA"
          lineName="Cancellation Rate (%)"
          barName="Cancelled Bookings"
          trendDays={trendDays}
          onTrendDaysChange={onTrendDaysChange}
          status={status}
        />
        {data?.capabilities?.cancellationReasonsAvailable && (
          <DonutChartCard 
            title="Cancellation Reasons" 
            data={data?.cancellationReasons || []} 
            status={status}
          />
        )}
        {(data?.capabilities?.noShowTrendAvailable || data?.noShowTrend) && (
          <TrendChartCard 
            title="No Show Trend"
            data={data?.noShowTrend}
            lineKey="noShowRate"
            barKey="noShowBookings"
            lineColor="#8B5CF6"
            barColor="#DDD6FE"
            lineName="No Show Rate (%)"
            barName="No Show Bookings"
            trendDays={trendDays}
            // only the first chart controls the master trend filter
            onTrendDaysChange={undefined}
            status={status}
          />
        )}
      </div>

      <div className="flex gap-4 items-stretch">
        <ChannelTableCard 
          title="Cancellation by Channel"
          columns={[
            { key: 'channelName', label: 'Channel' },
            { key: 'cancelledBookings', label: 'Cancelled Bookings' },
            { key: 'cancellationRate', label: 'Cancellation Rate', isPercent: true },
            { key: 'lostRevenue', label: 'Lost Revenue (USD)', isCurrency: true },
          ]}
          data={data?.cancellationByChannel}
          status={status}
        />
        {data?.capabilities?.noShowAvailable && (
          <ChannelTableCard 
            title="No Show by Channel"
            columns={[
              { key: 'channelName', label: 'Channel' },
              { key: 'noShowBookings', label: 'No Show Bookings' },
              { key: 'noShowRate', label: 'No Show Rate', isPercent: true },
              { key: 'lostRevenue', label: 'Lost Revenue (USD)', isCurrency: true },
            ]}
            data={data?.noShowByChannel}
            status={status}
          />
        )}
        <SummaryCard summary={data?.combinedSummary} status={status} />
      </div>

      <ExportRow />
    </div>
  )
}

