import React from 'react'

interface PillProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

export function Pill({ active, onClick, children }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors',
        active
          ? 'bg-[#0B4EA2] text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
