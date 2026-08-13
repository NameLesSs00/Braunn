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
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import type { RevenueAnalyticsData, KpiMetric } from '../../../models/Report'
import { revenueTrend14Days, revenueByRatePlanData, revenueByMarketSegmentData } from '../dummyData'

// ─── Types ────────────────────────────────────────────────────────────────────

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface RevenueAnalyticsTabProps {
  data?: RevenueAnalyticsData
  status: AsyncStatus
  error?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function trendBadge(metric: KpiMetric): string {
  if (metric.changePercentage != null) {
    const sign = metric.changePercentage > 0 ? '+' : ''
    return `${sign}${metric.changePercentage.toFixed(1)}%`
  }
  if (metric.changeValue !== 0) {
    const sign = metric.changeValue > 0 ? '+' : ''
    return `${sign}${metric.changeValue.toFixed(1)}`
  }
  return '—'
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-10 w-10 rounded-full bg-slate-100 mb-3" />
      <div className="h-3 w-20 rounded bg-slate-100 mb-1.5" />
      <div className="h-6 w-28 rounded bg-slate-100 mb-2" />
      <div className="h-3 w-16 rounded bg-slate-100" />
    </div>
  )
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

interface KpiCardDef {
  id: string
  label: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  metric: KpiMetric
  isDeduction?: boolean
  currency: string
}

function RevenueKpiCard({ card }: { card: KpiCardDef }) {
  const { icon: Icon, metric, isDeduction, currency } = card
  const trendUp = metric.trend === 'Up'
  const trendNeutral = metric.trend === 'Neutral'
  const TrendIcon = trendNeutral ? Minus : trendUp ? TrendingUp : TrendingDown
  const trendColor = trendNeutral
    ? 'text-slate-400'
    : metric.positiveChange === true
      ? 'text-green-600'
      : metric.positiveChange === false
        ? 'text-red-400'
        : 'text-slate-400'
  const iconColor = trendNeutral
    ? 'text-slate-400'
    : metric.positiveChange === true
      ? 'text-green-500'
      : 'text-red-400'

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
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
          style={{ color: isDeduction ? '#EF4444' : '#1e293b' }}
        >
          {isDeduction ? '-' : ''}{currency} {fmtCurrency(metric.currentValue)}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1.5">
        <TrendIcon className={`h-3 w-3 ${iconColor}`} strokeWidth={2.5} />
        <span className={`text-[11px] font-semibold ${trendColor}`}>{trendBadge(metric)}</span>
        <span className="text-[10px] text-slate-400">vs prev. period</span>
      </div>
    </div>
  )
}

function buildKpiCards(data: RevenueAnalyticsData): KpiCardDef[] {
  const c = data.currency
  return [
    { id: 'net', label: 'Net Revenue', icon: MdAttachMoney, iconColor: '#22C55E', iconBg: '#DCFCE7', metric: data.netRevenue, currency: c },
    { id: 'room', label: 'Room Revenue', icon: MdHotel, iconColor: '#3B82F6', iconBg: '#DBEAFE', metric: data.roomRevenue, currency: c },
    { id: 'fnb', label: 'F&B Revenue', icon: MdRestaurant, iconColor: '#8B5CF6', iconBg: '#EDE9FE', metric: data.foodAndBeverageRevenue, currency: c },
    { id: 'other', label: 'Other Revenue', icon: MdSell, iconColor: '#F59E0B', iconBg: '#FEF3C7', metric: data.otherRevenue, currency: c },
    { id: 'discounts', label: 'Discounts', icon: MdPercent, iconColor: '#EF4444', iconBg: '#FEE2E2', metric: data.discounts, isDeduction: true, currency: c },
    { id: 'taxes', label: 'Taxes', icon: MdReceipt, iconColor: '#64748B', iconBg: '#F1F5F9', metric: data.taxes, currency: c },
  ]
}

function RevenueKpiCards({ data, status }: { data?: RevenueAnalyticsData; status: AsyncStatus }) {
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }
  if (!data) return null
  const cards = buildKpiCards(data)
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => <RevenueKpiCard key={card.id} card={card} />)}
    </div>
  )
}

// ─── Revenue Trend Chart (stays on dummy — no time-series in endpoint) ────────

function RevenueTrendChart() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm" style={{ flex: '0 0 50%', minWidth: 0 }}>
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
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} dy={6} interval={1} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} width={40} />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              labelStyle={{ color: '#64748B', fontWeight: 600 }}
              formatter={(value: any) => [`${value.toLocaleString()}`, 'Total Revenue']}
            />
            <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#fillRevTrend)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-end mt-1">
        <span className="rounded px-2 py-0.5 text-[12px] font-bold text-white" style={{ backgroundColor: '#2563EB' }}>14.8K</span>
      </div>
    </div>
  )
}

// ─── Revenue Breakdown Pie (LIVE — driven by percentageOfTotal) ───────────────

const PIE_COLORS = ['#2563EB', '#8B5CF6', '#F59E0B']
const PIE_LABELS = ['Room Revenue', 'F&B Revenue', 'Other Revenue']

function RevenueBreakdownPie({ data }: { data?: RevenueAnalyticsData }) {
  const pieData = data
    ? [
        { name: 'Room Revenue', value: data.roomRevenue.percentageOfTotal ?? 0, amount: data.roomRevenue.currentValue },
        { name: 'F&B Revenue', value: data.foodAndBeverageRevenue.percentageOfTotal ?? 0, amount: data.foodAndBeverageRevenue.currentValue },
        { name: 'Other Revenue', value: data.otherRevenue.percentageOfTotal ?? 0, amount: data.otherRevenue.currentValue },
      ]
    : PIE_LABELS.map((name) => ({ name, value: 33.3, amount: 0 }))

  const totalAmount = data ? data.netRevenue.currentValue : 0
  const currency = data?.currency ?? ''

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-slate-800">Revenue Breakdown</h3>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: 160, height: 160 }}>
          <PieChart width={160} height={160}>
            <Pie
              data={pieData}
              cx={75} cy={75}
              innerRadius={52} outerRadius={75}
              dataKey="value"
              strokeWidth={2} stroke="#fff"
            >
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[13px] font-bold text-slate-800 leading-tight">{fmtCurrency(totalAmount)}</span>
            <span className="text-[9px] text-slate-400 font-medium">{currency}</span>
          </div>
        </div>
        <div className="w-full space-y-1.5">
          {pieData.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[11px] text-slate-600">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-800">{fmtCurrency(item.amount)}</span>
                <span className="text-[10px] text-slate-400">({item.value.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Rate Plan chart (stays dummy) ───────────────────────────────────────────

function RevenueByRatePlanChart() {
  const maxVal = Math.max(...revenueByRatePlanData.map((d) => d.value))
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800">Revenue by Rate Plan</h3>
      </div>
      <div className="flex flex-col gap-3">
        {revenueByRatePlanData.map((item) => {
          const pct = (item.value / maxVal) * 100
          return (
            <div key={item.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 truncate pr-2">{item.name}</span>
                <span className="text-[11px] font-semibold text-slate-800 shrink-0">{item.value.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
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

// ─── Market segment table (stays dummy) ──────────────────────────────────────

function RevenueMarketSegmentTable() {
  const headers = [
    'Market Segment', 'Room Revenue', 'F&B Revenue', 'Other Revenue',
    'Discounts', 'Taxes', 'Net Revenue', '% of Total', 'ADR', 'RevPAR',
  ]
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-slate-800">Revenue by Market Segment</h3>
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

// ─── Export Row ───────────────────────────────────────────────────────────────

function RevenueExportRow() {
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

export function RevenueAnalyticsTab({ data, status, error }: RevenueAnalyticsTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Error banner */}
      {status === 'failed' && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-[13px] font-medium">{error ?? 'Failed to load revenue analytics. Please try again.'}</span>
        </div>
      )}

      {/* KPI Cards — live data */}
      <RevenueKpiCards data={data} status={status} />

      {/* Charts row */}
      <div className="flex gap-4 items-stretch">
        {/* Revenue trend — dummy (no time-series in endpoint) */}
        <RevenueTrendChart />
        {/* Breakdown pie — live data */}
        <RevenueBreakdownPie data={data} />
        {/* Rate plan — dummy */}
        <RevenueByRatePlanChart />
      </div>

      {/* Market segment table — dummy */}
      <RevenueMarketSegmentTable />

      <RevenueExportRow />
    </div>
  )
}
