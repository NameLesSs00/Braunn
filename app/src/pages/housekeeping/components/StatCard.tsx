import React from 'react'

interface StatCardProps {
  count: number
  label: string
  sub: string
  bg: string
  iconBg: string
  icon: React.ReactNode
  textColor: string
  subColor: string
}

export function StatCard({ count, label, sub, bg, iconBg, icon, textColor, subColor }: StatCardProps) {
  return (
    <div className={`flex items-start justify-between rounded-2xl border p-4 ${bg}`}>
      <div>
        <div className={`text-2xl font-bold ${textColor}`}>{count}</div>
        <div className={`mt-1 text-[13px] font-semibold ${textColor}`}>{label}</div>
        <div className={`mt-0.5 text-[11px] font-medium ${subColor}`}>{sub}</div>
      </div>
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
    </div>
  )
}
