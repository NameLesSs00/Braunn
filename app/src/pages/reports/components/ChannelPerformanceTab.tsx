import React from 'react'
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
import { TrendingUp, TrendingDown, ArrowRight, Globe, MoreHorizontal, Briefcase, MapPin, User, Building } from 'lucide-react'
import {
  channelKpiStats,
  bookingsByChannelData,
  revenueByChannelData,
  adrByChannelData,
  channelOverviewData,
} from '../dummyData'

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
  'Booking.com': Building, // B icon stand-in
  'Direct Website': Globe,
  'Expedia': Briefcase, // Airplane stand-in
  'Agoda': MapPin, // 'a' stand-in
  'Walk-in': User,
  'Others': MoreHorizontal,
}

// ─── Section 1: KPI Stat Cards ────────────────────────────────────────────────

function ChannelKpiCards() {
  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
      {channelKpiStats.map((stat) => {
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
            <div className="flex items-center gap-1 mt-1">
              {stat.trend != null && (
                <>
                  <span className="text-[10px] text-slate-400">{stat.sub}</span>
                  {stat.trendUp
                    ? <TrendingUp className="h-3 w-3 text-green-500 ml-auto" strokeWidth={2.5} />
                    : <TrendingDown className="h-3 w-3 text-red-400 ml-auto" strokeWidth={2.5} />
                  }
                  <span className={`text-[10px] font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-400'}`}>
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

function DonutChartCard({ title, data, centerValue, centerLabel }: { title: string, data: any[], centerValue: string, centerLabel: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <h3 className="text-[14px] font-semibold text-slate-800 mb-4">{title}</h3>
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
              formatter={(v: any, _: any, p: any) => [`${Number(v).toLocaleString()} (${p.payload.pct})`, p.payload.name]}
            />
          </PieChart>
        </div>
        <div className="flex flex-col gap-2 flex-1 ml-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-slate-600 truncate">{item.name}</span>
              </div>
              <span className="text-[10px] text-slate-800 tabular-nums shrink-0 ml-2">
                {item.value.toLocaleString()} <span className="text-slate-400">({item.pct})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdrBarChart() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <h3 className="text-[14px] font-semibold text-slate-800 mb-6">ADR by Channel (USD)</h3>
      <div className="h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={adrByChannelData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }} barSize={8}>
            <XAxis type="number" hide domain={[0, 160]} />
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
              {/* Custom label for right-side value */}
              {adrByChannelData.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#2563EB" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-2 pl-[90px] pr-4">
        {[0, 30, 60, 90, 120, 150].map((t) => (
          <span key={t} className="text-[10px] text-slate-400">{t}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Section 3: Overview Table ────────────────────────────────────────────────

function ChannelOverviewTable() {
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
              {/* Group headers for Bookings */}
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
            {channelOverviewData.map((row) => {
              const isTotal = row.isTotal
              const cls = isTotal ? 'font-bold text-[#0B4EA2]' : 'text-slate-700'
              const Icon = channelIconMap[row.channel] || Globe
              
              return (
                <tr key={row.channel} className={isTotal ? 'bg-slate-50/30' : 'hover:bg-slate-50/80 transition-colors'}>
                  <td className={`py-3 px-5 ${isTotal ? 'font-bold text-[#0B4EA2]' : 'font-medium text-slate-700'}`}>
                    {isTotal ? (
                      row.channel
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500">
                          <Icon size={12} />
                        </div>
                        {row.channel}
                      </div>
                    )}
                  </td>
                  <td className={`py-3 px-3 text-right tabular-nums ${isTotal ? 'font-bold text-[#0B4EA2]' : 'font-semibold text-slate-800'}`}>{row.count.toLocaleString()}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${isTotal ? 'font-bold text-[#0B4EA2]' : 'font-semibold text-[#0B4EA2]'}`}>{row.pct}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${cls}`}>{row.roomNights.toLocaleString()}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${isTotal ? 'font-bold text-[#0B4EA2]' : 'font-medium text-slate-800'}`}>{row.revenue}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${cls}`}>{row.adr}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${cls}`}>{row.revpar}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${cls}`}>{row.canc}</td>
                  <td className={`py-3 px-3 text-right tabular-nums ${cls}`}>{row.noShow}</td>
                  <td className={`py-3 px-5 text-right tabular-nums ${isTotal ? 'font-bold text-[#0B4EA2]' : 'font-semibold text-slate-700'}`}>{row.conv}</td>
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

export function ChannelPerformanceTab() {
  return (
    <div className="flex flex-col gap-5">
      <ChannelKpiCards />

      <div className="flex gap-4 items-stretch">
        <DonutChartCard title="Bookings by Channel" data={bookingsByChannelData} centerValue="401" centerLabel="Total Bookings" />
        <DonutChartCard title="Revenue by Channel" data={revenueByChannelData} centerValue="12,701.80" centerLabel="USD" />
        <AdrBarChart />
      </div>

      <ChannelOverviewTable />
      <ChannelExportRow />
    </div>
  )
}
