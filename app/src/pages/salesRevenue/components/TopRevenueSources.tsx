import { Download } from 'lucide-react'
import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { AnimatedCounter } from './AnimatedCounter'

const topSourcesData = [
  { rank: 1, name: 'Tech Corp International', details: '145 room nights', amount: '$21,750', rankColor: 'bg-amber-100 text-amber-700' },
  { rank: 2, name: 'Global Finance Ltd', details: '98 room nights', amount: '$13,720', rankColor: 'bg-slate-100 text-slate-700' },
  { rank: 3, name: 'Direct Bookings', details: '125 room nights', amount: '$22,500', rankColor: 'bg-orange-100 text-orange-700' },
  { rank: 4, name: 'Booking.com', details: '72 room nights', amount: '$11,880', rankColor: 'bg-slate-100 text-slate-700' },
  { rank: 5, name: 'Walk-in Guests', details: '35 room nights', amount: '$5,950', rankColor: 'bg-slate-100 text-slate-700' },
]

export function TopRevenueSources() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(rootRef, { amount: 0.35, once: true })

  return (
    <div ref={rootRef} className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">Top Revenue Sources</h3>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {topSourcesData.map((source) => (
          <motion.div
            key={source.rank}
            className="flex items-center justify-between border border-slate-100 p-4 rounded-xl hover:shadow-sm transition-shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.35, delay: 0.05 * source.rank }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${source.rankColor}`}>
                {source.rank}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">{source.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{source.details}</p>
              </div>
            </div>
            <div className="font-bold text-sm text-[#004bb4]">
              <AnimatedCounter valueStr={source.amount} active={inView} durationMs={1400} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
