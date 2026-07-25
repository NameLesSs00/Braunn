type Props = {
  tone?: 'yellow' | 'green' | 'red' | 'darkRed' | 'blue' | 'orange' | 'purple'
  children: React.ReactNode
}

const tones = {
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  darkRed: 'bg-[#F7D6DA] text-[#9F0712]',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-violet-100 text-violet-700',
}

export function PriorityPill({ tone = 'yellow', children }: Props) {
  return <span className={['inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', tones[tone]].join(' ')}>{children}</span>
}
