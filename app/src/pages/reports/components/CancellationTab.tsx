import React from 'react'
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
import {
  cancellationKpiStats,
  cancellationTrendData,
  cancellationReasonsData,
  noShowTrendData,
  cancellationByChannelData,
  noShowByChannelData,
  cancellationSummaryData,
} from '../dummyData'

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
}

// ─── Section 1: KPI Stat Cards ────────────────────────────────────────────────

function CancellationKpiCards() {
  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
      {cancellationKpiStats.map((stat) => {
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
            <div className="flex items-center gap-1 mt-1">
              {stat.trend != null && (
                <>
                  <span className="text-[10px] text-slate-400">vs Previous Period</span>
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
      <div className="bg-white p-3 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-[12px] border-none">
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
  leftAxisDomain,
  rightAxisDomain,
  lineName,
  barName
}: any) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800 flex items-center gap-1">
          {title} <span className="text-slate-400 text-[10px] cursor-pointer">ⓘ</span>
        </h3>
        <select className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded px-2 py-1 outline-none">
          <option>Last 30 Days</option>
          <option>This Month</option>
        </select>
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

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} dy={10} interval={4} />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10 }} 
              domain={leftAxisDomain} 
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10 }} 
              domain={rightAxisDomain}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar yAxisId="right" dataKey={barKey} name={barName} fill={barColor} radius={[2, 2, 0, 0]} barSize={8} />
            <Line yAxisId="left" type="monotone" dataKey={lineKey} name={lineName} stroke={lineColor} strokeWidth={2} dot={{ r: 3, fill: lineColor, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function DonutChartCard({ title, data, centerValue, centerLabel }: { title: string, data: any[], centerValue: string, centerLabel: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <h3 className="text-[14px] font-semibold text-slate-800 mb-6 flex items-center gap-1">
        {title} <span className="text-slate-400 text-[10px] cursor-pointer">ⓘ</span>
      </h3>
      <div className="flex items-center gap-2 mt-4">
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: 140, height: 140 }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
            <span className="text-[16px] font-bold text-slate-800 leading-tight">{centerValue}</span>
            <span className="text-[11px] font-medium text-slate-500">{centerLabel}</span>
          </div>
          <PieChart width={140} height={140}>
            <Pie data={data} cx={70} cy={70} innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#fff">
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <RechartsTooltip
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(v: any, _: any, p: any) => [`${Number(v).toLocaleString()} (${p.payload.pct})`, p.payload.name]}
            />
          </PieChart>
        </div>
        <div className="flex flex-col gap-2.5 flex-1 ml-6">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-slate-600 truncate">{item.name}</span>
              </div>
              <span className="text-[11px] text-slate-800 tabular-nums shrink-0 ml-2">
                {item.value} <span className="text-slate-400">({item.pct})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section 3: Data Tables Row ───────────────────────────────────────────────

function ChannelTableCard({ title, columns, data, totalColorCls }: any) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm flex-1 min-w-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-[14px] font-semibold text-slate-800 flex items-center gap-1">
          {title} <span className="text-slate-400 text-[10px] cursor-pointer">ⓘ</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
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
            {data.map((row: any) => {
              const isTotal = row.isTotal
              const Icon = channelIconMap[row.channel] || Globe
              
              return (
                <tr key={row.channel} className={isTotal ? 'bg-slate-50/30' : 'hover:bg-slate-50/80 transition-colors'}>
                  <td className={`py-3 px-5 ${isTotal ? `font-bold ${totalColorCls}` : 'font-medium text-slate-700'}`}>
                    {isTotal ? (
                      row.channel
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-500">
                          <Icon size={11} />
                        </div>
                        {row.channel}
                      </div>
                    )}
                  </td>
                  {columns.slice(1).map((col: any) => (
                    <td key={col.key} className={`py-3 px-4 text-center tabular-nums ${isTotal ? `font-bold ${totalColorCls}` : 'font-semibold text-slate-800'}`}>
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm flex-1 min-w-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-[14px] font-semibold text-slate-800 flex items-center gap-1">
          Cancellation & No Show Summary <span className="text-slate-400 text-[10px] cursor-pointer">ⓘ</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-3 px-5 text-left font-medium text-slate-500 text-[11px]">Metric</th>
              <th className="py-3 px-4 text-center font-medium text-slate-500 text-[11px]">Cancelled</th>
              <th className="py-3 px-4 text-center font-medium text-slate-500 text-[11px]">No Show</th>
              <th className="py-3 px-5 text-center font-bold text-slate-700 text-[11px]">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {cancellationSummaryData.map((row: any) => (
              <tr key={row.metric} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-5 font-medium text-slate-700">{row.metric}</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-800">{row.cancelled}</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-800">{row.noShow}</td>
                <td className="py-3 px-5 text-center font-bold text-slate-800">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Alert Box */}
      <div className="m-4 mt-auto rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <p className="text-[12px] font-medium text-red-600 leading-snug">
          Total Lost Revenue due to cancellations & no shows is <span className="font-bold">4.2%</span> of total revenue.
        </p>
      </div>
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

export function CancellationTab() {
  return (
    <div className="flex flex-col gap-5">
      <CancellationKpiCards />

      <div className="flex gap-4 items-stretch">
        <TrendChartCard 
          title="Cancellation Trend"
          data={cancellationTrendData}
          lineKey="rate"
          barKey="bookings"
          lineColor="#EF4444"
          barColor="#FECACA"
          leftAxisDomain={[0, 10]}
          rightAxisDomain={[0, 50]}
          lineName="Cancellation Rate (%)"
          barName="Cancelled Bookings"
        />
        <DonutChartCard 
          title="Cancellation Reasons" 
          data={cancellationReasonsData} 
          centerValue="56" 
          centerLabel="Total" 
        />
        <TrendChartCard 
          title="No Show Trend"
          data={noShowTrendData}
          lineKey="rate"
          barKey="bookings"
          lineColor="#8B5CF6"
          barColor="#DDD6FE"
          leftAxisDomain={[0, 5]}
          rightAxisDomain={[0, 50]}
          lineName="No Show Rate (%)"
          barName="No Show Bookings"
        />
      </div>

      <div className="flex gap-4 items-stretch">
        <ChannelTableCard 
          title="Cancellation by Channel"
          columns={[
            { key: 'channel', label: 'Channel' },
            { key: 'bookings', label: 'Cancelled Bookings' },
            { key: 'rate', label: 'Cancellation Rate' },
            { key: 'revenue', label: 'Lost Revenue (USD)' },
          ]}
          data={cancellationByChannelData}
          totalColorCls="text-red-500"
        />
        <ChannelTableCard 
          title="No Show by Channel"
          columns={[
            { key: 'channel', label: 'Channel' },
            { key: 'bookings', label: 'No Show Bookings' },
            { key: 'rate', label: 'No Show Rate' },
            { key: 'revenue', label: 'Lost Revenue (USD)' },
          ]}
          data={noShowByChannelData}
          totalColorCls="text-purple-600"
        />
        <SummaryCard />
      </div>

      <ExportRow />
    </div>
  )
}
