import React from 'react'
import { dummyKpiCards } from '../dummyData'
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
import { TrendingUp, TrendingDown } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  pie: MdPieChart,
  tag: MdSell,
  trending: MdTrendingUp,
  clock: MdAccessTime,
  dollar: MdAttachMoney,
  bed: MdHotel,
  building: MdApartment,
  xCircle: MdCancelPresentation,
  userX: MdPersonOff,
}

export function ReportCards() {
  // First 4 in row 1, next 4 in row 2, last 1 in its own row
  const row1 = dummyKpiCards.slice(0, 4)
  const row2 = dummyKpiCards.slice(4, 8)
  const row3 = dummyKpiCards.slice(8)

  const Card = ({ card }: { card: (typeof dummyKpiCards)[0] }) => {
    const Icon = iconMap[card.icon]
    return (
      <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: card.iconBg }}
          >
            {Icon && <Icon size={20} style={{ color: card.iconColor }} />}
          </div>
        </div>
        <span className="text-[12px] font-medium text-slate-500 mb-0.5">{card.label}</span>
        <span className="text-[26px] font-bold text-slate-800 leading-tight">
          {card.prefix ?? ''}{card.value}
        </span>
        <div className="flex items-center gap-1.5 mt-2">
          {card.trendUp ? (
            <TrendingUp className="h-3.5 w-3.5 text-green-500" strokeWidth={2.5} />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" strokeWidth={2.5} />
          )}
          <span
            className={`text-[12px] font-semibold ${card.trendUp ? 'text-green-600' : 'text-red-400'}`}
          >
            {card.trend}
          </span>
          <span className="text-[11px] text-slate-400">{card.comparison}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1 - 4 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {row1.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      {/* Row 2 - 4 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {row2.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      {/* Row 3 - 1 card (No Show %) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {row3.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
