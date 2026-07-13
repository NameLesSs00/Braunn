import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  MdAttachMoney,
  MdHotel,
  MdRestaurant,
  MdSell,
  MdPercent,
  MdReceipt,
  MdGridOn,
  MdPictureAsPdf,
  MdPrint,
} from 'react-icons/md'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import {
  revenueKpiCards,
  revenueTrend14Days,
  revenueByRoomTypeData,
  revenueByRatePlanData,
  revenueByMarketSegmentData,
} from '../dummyData'

const iconMap: Record<string, React.ElementType> = {
  dollar: MdAttachMoney,
  bed: MdHotel,
  food: MdRestaurant,
  tag: MdSell,
  percent: MdPercent,
  receipt: MdReceipt,
}

function RevenueKpiCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {revenueKpiCards.map((card) => {
        const Icon = iconMap[card.icon] ?? MdAttachMoney
        return (
          <div
            key={card.id}
            className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                style={{ backgroundColor: card.iconBg }}
              >
                <Icon size={20} style={{ color: card.iconColor }} />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-500 mb-0.5">{card.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-[20px] font-bold leading-tight"
                style={{ color: card.trendUp ? '#1e293b' : '#EF4444' }}
              >
                {card.value}
              </span>
              <span className="text-[11px] font-medium text-slate-400">{card.suffix}</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              {card.trendUp ? (
                <TrendingUp className="h-3 w-3 text-green-500" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" strokeWidth={2.5} />
              )}
              <span className={`text-[11px] font-semibold ${card.trendUp ? 'text-green-600' : 'text-red-400'}`}>
                {card.trend}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">{card.sub}</span>
          </div>
        )
      })}
    </div>
  )
}

function RevenueTrendChart() {
  return (
    <div
      className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
      style={{ flex: '0 0 50%', minWidth: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800">Revenue Trend</h3>
        <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
          <option>Last 14 Days</option>
          <option>Last 30 Days</option>
          <option>This Month</option>
        </select>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueTrend14Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
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
              interval={1}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#64748B', fontWeight: 600 }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fillRevTrend)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Last value badge */}
      <div className="flex justify-end mt-1">
        <span className="rounded px-2 py-0.5 text-[12px] font-bold text-white" style={{ backgroundColor: '#2563EB' }}>
          14.8K
        </span>
      </div>
    </div>
  )
}

function RevenueByRoomTypeChart() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-slate-800">Revenue by Room Type</h3>
        <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: 160, height: 160 }}>
          <PieChart width={160} height={160}>
            <Pie
              data={revenueByRoomTypeData}
              cx={75}
              cy={75}
              innerRadius={52}
              outerRadius={75}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {revenueByRoomTypeData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[13px] font-bold text-slate-800 leading-tight">12,701.80</span>
            <span className="text-[9px] text-slate-400 font-medium">USD</span>
          </div>
        </div>
        <div className="w-full space-y-1.5">
          {revenueByRoomTypeData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-slate-600">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-800">
                  {item.value.toLocaleString('en', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">({item.percent})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RevenueByRatePlanChart() {
  const maxVal = Math.max(...revenueByRatePlanData.map((d) => d.value))
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800">Revenue by Rate Plan</h3>
        <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>
      <div className="flex flex-col gap-3">
        {revenueByRatePlanData.map((item) => {
          const pct = (item.value / maxVal) * 100
          return (
            <div key={item.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 truncate pr-2">{item.name}</span>
                <span className="text-[11px] font-semibold text-slate-800 shrink-0">
                  {item.value.toLocaleString('en', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
        <div className="flex items-center justify-between mt-1">
          {['0', '1K', '2K', '3K', '4K', '5K'].map((t) => (
            <span key={t} className="text-[9px] text-slate-400">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function RevenueMarketSegmentTable() {
  const headers = [
    'Market Segment', 'Room Revenue (USD)', 'F&B Revenue (USD)', 'Other Revenue (USD)',
    'Discounts (USD)', 'Taxes (USD)', 'Net Revenue (USD)', '% of Total', 'ADR (USD)', 'RevPAR (USD)',
  ]
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold text-slate-800">Revenue by Market Segment</h3>
          <select className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-600 outline-none">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0B4EA2] hover:underline">
          View Full Report <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100">
              {headers.map((h) => (
                <th key={h} className="pb-2.5 text-left font-medium text-slate-500 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {revenueByMarketSegmentData.map((row) => {
              const isTotal = 'isTotal' in row && row.isTotal
              const cellClass = isTotal ? 'font-bold text-[#0B4EA2]' : 'text-slate-700'
              return (
                <tr key={row.segment} className={isTotal ? '' : 'hover:bg-slate-50/50'}>
                  <td className={`py-2.5 pr-4 ${cellClass}`}>{row.segment}</td>
                  <td className={`py-2.5 pr-4 ${cellClass}`}>{row.roomRev.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-2.5 pr-4 ${cellClass}`}>{row.fnb.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-2.5 pr-4 ${cellClass}`}>{row.other.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 pr-4 font-semibold text-red-500">{row.discounts.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-2.5 pr-4 ${cellClass}`}>{row.taxes.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-2.5 pr-4 ${cellClass}`}>{row.net.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-2.5 pr-4 ${cellClass}`}>{row.pct}</td>
                  <td className={`py-2.5 pr-4 ${cellClass}`}>{row.adr.toFixed(2)}</td>
                  <td className={`py-2.5 ${cellClass}`}>{row.revpar.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RevenueExportRow() {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={() => alert('Export Excel')}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:border-green-400 hover:bg-green-50 hover:text-green-600 transition"
      >
        <MdGridOn size={18} className="text-green-600" />
        Export Excel
      </button>
      <button
        onClick={() => alert('Export PDF')}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:border-red-400 hover:bg-red-50 hover:text-red-500 transition"
      >
        <MdPictureAsPdf size={18} className="text-red-500" />
        Export PDF
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:border-[#0B4EA2] hover:bg-blue-50 hover:text-[#0B4EA2] transition"
      >
        <MdPrint size={18} className="text-[#0B4EA2]" />
        Print Report
      </button>
    </div>
  )
}

export function RevenueAnalyticsTab() {
  return (
    <div className="flex flex-col gap-5">
      <RevenueKpiCards />
      <div className="flex gap-4 items-stretch">
        <RevenueTrendChart />
        <RevenueByRoomTypeChart />
        <RevenueByRatePlanChart />
      </div>
      <RevenueMarketSegmentTable />
      <RevenueExportRow />
    </div>
  )
}
