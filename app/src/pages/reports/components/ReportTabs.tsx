import React from 'react'
import { dummyTabs } from '../dummyData'
import {
  MdDashboard,
  MdShowChart,
  MdApartment,
  MdSpeed,
  MdCellTower,
  MdCancel,
} from 'react-icons/md'

const tabIcons: Record<string, React.ElementType> = {
  kpi: MdDashboard,
  revenue: MdShowChart,
  occupancy: MdApartment,
  pace: MdSpeed,
  channel: MdCellTower,
  cancellation: MdCancel,
}

interface ReportTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function ReportTabs({ activeTab, onTabChange }: ReportTabsProps) {
  return (
    <div className="flex w-full items-center justify-between border-b border-slate-200 overflow-x-auto bg-slate-50/50 rounded-t-xl">
      {dummyTabs.map((tab) => {
        const Icon = tabIcons[tab.id]
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-[14px] font-semibold transition-colors relative ${
              isActive ? 'bg-white text-[#0B4EA2] border-b-[3px] border-[#0B4EA2] shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-b-[3px] border-transparent'
            }`}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
