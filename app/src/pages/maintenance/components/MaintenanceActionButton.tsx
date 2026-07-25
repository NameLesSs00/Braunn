type Props = {
  variant?: 'primary' | 'outline'
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}

export function MaintenanceActionButton({ variant = 'primary', icon, children, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition',
        variant === 'primary'
          ? 'bg-[#0B4EA2] text-white hover:bg-[#0A3F8B]'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  )
}
