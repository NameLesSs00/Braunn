type Props = {
  tone?: 'red' | 'amber' | 'blue' | 'green' | 'slate'
  children: React.ReactNode
}

const tones = {
  red: 'bg-[#FCE7EA] text-[#9F0712]',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-[#EAF2FF] text-[#0B4EA2]',
  green: 'bg-emerald-100 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
}

export function StatusPill({ tone = 'slate', children }: Props) {
  return <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', tones[tone]].join(' ')}>{children}</span>
}
