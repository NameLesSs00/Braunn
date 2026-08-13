import React from 'react'
import {
  MdPieChart,
  MdSell,
  MdTrendingUp,
  MdAccessTime,
  MdAttachMoney,
  MdHotel,
  MdApartment,
  MdCancelPresentation,
  MdPersonOff,
} from 'react-icons/md'
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import type { KpiDashboardData, KpiMetric } from '../../../models/Report'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface ReportCardsProps {
  data?: KpiDashboardData
  status: AsyncStatus
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatValue(value: number, type: 'percent' | 'currency' | 'number' | 'nights'): string {
  if (type === 'percent') return `${value.toFixed(2)}%`
  if (type === 'nights') return value.toFixed(2)
  if (type === 'currency') return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return Math.round(value).toLocaleString('en-US')
}

function formatTrendBadge(metric: KpiMetric): string {
  if (metric.changePercentage != null) {
    const sign = metric.changePercentage > 0 ? '+' : ''
    return `${sign}${metric.changePercentage.toFixed(1)}%`
  }
  // changePercentage is null when previous period is 0 — show raw change
  if (metric.changeValue !== 0) {
    const sign = metric.changeValue > 0 ? '+' : ''
    return `${sign}${metric.changeValue.toFixed(1)}`
  }
  return '—'
}

// ─── Card config ─────────────────────────────────────────────────────────────

interface CardConfig {
  id: string
  label: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  prefix?: string
  metric: KpiMetric
  valueType: 'percent' | 'currency' | 'number' | 'nights'
}

function buildCards(data: KpiDashboardData): CardConfig[] {
  const currency = data.currency
  return [
    {
      id: 'occupancy',
      label: 'Occupancy Rate',
      icon: MdPieChart,
      iconColor: '#22C55E',
      iconBg: '#DCFCE7',
      metric: data.occupancy,
      valueType: 'percent',
    },
    {
      id: 'adr',
      label: 'ADR',
      icon: MdSell,
      iconColor: '#3B82F6',
      iconBg: '#DBEAFE',
      prefix: currency + ' ',
      metric: data.adr,
      valueType: 'currency',
    },
    {
      id: 'revpar',
      label: 'RevPAR',
      icon: MdTrendingUp,
      iconColor: '#3B82F6',
      iconBg: '#DBEAFE',
      prefix: currency + ' ',
      metric: data.revPar,
      valueType: 'currency',
    },
    {
      id: 'los',
      label: 'Average LOS',
      icon: MdAccessTime,
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
      metric: data.averageLos,
      valueType: 'nights',
    },
    {
      id: 'revenue',
      label: 'Room Revenue',
      icon: MdAttachMoney,
      iconColor: '#22C55E',
      iconBg: '#DCFCE7',
      prefix: currency + ' ',
      metric: data.roomRevenue,
      valueType: 'currency',
    },
    {
      id: 'roomsSold',
      label: 'Rooms Sold',
      icon: MdHotel,
      iconColor: '#3B82F6',
      iconBg: '#DBEAFE',
      metric: data.roomNightsSold,
      valueType: 'number',
    },
    {
      id: 'availableRooms',
      label: 'Available Rooms',
      icon: MdApartment,
      iconColor: '#F59E0B',
      iconBg: '#FEF3C7',
      metric: data.availableRoomNights,
      valueType: 'number',
    },
    {
      id: 'cancellation',
      label: 'Cancellation %',
      icon: MdCancelPresentation,
      iconColor: '#EF4444',
      iconBg: '#FEE2E2',
      metric: data.cancellationRate,
      valueType: 'percent',
    },
    {
      id: 'noShow',
      label: 'No Show %',
      icon: MdPersonOff,
      iconColor: '#EF4444',
      iconBg: '#FEE2E2',
      metric: data.noShowRate,
      valueType: 'percent',
    },
  ]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-full bg-slate-100" />
      </div>
      <div className="h-3 w-24 rounded bg-slate-100 mb-2" />
      <div className="h-7 w-32 rounded bg-slate-100 mb-3" />
      <div className="h-3 w-20 rounded bg-slate-100" />
    </div>
  )
}

function KpiCard({ card }: { card: CardConfig }) {
  const { icon: Icon, metric, valueType } = card
  const trendUp = metric.trend === 'Up'
  const trendNeutral = metric.trend === 'Neutral'

  const trendColor =
    metric.positiveChange === true
      ? 'text-green-600'
      : metric.positiveChange === false
        ? 'text-red-400'
        : 'text-slate-400'

  const TrendIcon = trendNeutral ? Minus : trendUp ? TrendingUp : TrendingDown
  const trendIconColor =
    metric.positiveChange === true
      ? 'text-green-500'
      : metric.positiveChange === false
        ? 'text-red-400'
        : 'text-slate-400'

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: card.iconBg }}
        >
          <Icon size={20} style={{ color: card.iconColor }} />
        </div>
      </div>
      <span className="text-[12px] font-medium text-slate-500 mb-0.5">{card.label}</span>
      <span className="text-[26px] font-bold text-slate-800 leading-tight">
        {card.prefix ?? ''}{formatValue(metric.currentValue, valueType)}
      </span>
      <div className="flex items-center gap-1.5 mt-2">
        <TrendIcon className={`h-3.5 w-3.5 ${trendIconColor}`} strokeWidth={2.5} />
        <span className={`text-[12px] font-semibold ${trendColor}`}>
          {formatTrendBadge(metric)}
        </span>
        <span className="text-[11px] text-slate-400">vs prev. period</span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReportCards({ data, status, error }: ReportCardsProps) {
  // Loading skeleton — 9 cards in same grid layout
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i + 4} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-600">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-[13px] font-medium">{error ?? 'Failed to load KPI data. Please try again.'}</span>
      </div>
    )
  }

  if (!data) return null

  const cards = buildCards(data)
  const row1 = cards.slice(0, 4)
  const row2 = cards.slice(4, 8)
  const row3 = cards.slice(8)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {row1.map((card) => <KpiCard key={card.id} card={card} />)}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {row2.map((card) => <KpiCard key={card.id} card={card} />)}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {row3.map((card) => <KpiCard key={card.id} card={card} />)}
      </div>
    </div>
  )
}
