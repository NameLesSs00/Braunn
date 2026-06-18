import { Download } from 'lucide-react'
import { useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { AnimatedCounter } from './AnimatedCounter'
import { RevenueSourceDetailsPopup } from '../popups/RevenueByBookingType/RevenueSourceDetailsPopup'

const revenueSources = [
  { name: 'Direct Bookings', amount: '€45,230', percentage: 35, color: 'bg-blue-600' },
  { name: 'Corporate Accounts', amount: '€38,450', percentage: 30, color: 'bg-emerald-500' },
  { name: 'OTA (Booking.com)', amount: '€24,180', percentage: 20, color: 'bg-amber-500' },
  { name: 'Walk-ins', amount: '€16,990', percentage: 15, color: 'bg-violet-500' },
]

export function RevenueByBookingType() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(rootRef, { amount: 0.35, once: true })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsSubtitle, setDetailsSubtitle] = useState('Direct Bookings – December 2025')
  const [detailsTab, setDetailsTab] = useState<string>('All')
  const [detailsAllowedTabs, setDetailsAllowedTabs] = useState<string[] | undefined>(undefined)

  const handleOpenDetails = (sourceName: string | 'All') => {
    if (sourceName === 'All') {
      setDetailsSubtitle('All Booking Types – December 2025')
      setDetailsTab('All')
      setDetailsAllowedTabs(undefined)
    } else {
      setDetailsSubtitle(`${sourceName} – December 2025`)
      if (sourceName === 'Direct Bookings') {
        setDetailsTab('Phone')
        setDetailsAllowedTabs(['Phone'])
      } else if (sourceName === 'Corporate Accounts') {
        setDetailsTab('Corporate')
        setDetailsAllowedTabs(['Corporate'])
      } else if (sourceName === 'OTA (Booking.com)') {
        setDetailsTab('OTA')
        setDetailsAllowedTabs(['OTA'])
      } else if (sourceName === 'Walk-ins') {
        setDetailsTab('Walk-in')
        setDetailsAllowedTabs(['Walk-in'])
      }
    }
    setDetailsOpen(true)
  }

  return (
    <>
      <div ref={rootRef} className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">Revenue by Booking Type</h3>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#0B4EA2] px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-[#093e82] hover:shadow-md active:scale-95"
            onClick={() => handleOpenDetails('All')}
          >
            All Types
          </button>
        </div>

        <div className="space-y-4">
          {revenueSources.map((source) => (
            <div key={source.name}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-slate-600">{source.name}</div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-800">
                    <AnimatedCounter valueStr={source.amount} active={inView} durationMs={1600} />
                  </span>
                  <button
                    type="button"
                    className="text-xs text-blue-600 underline hover:text-blue-700"
                    onClick={() => handleOpenDetails(source.name)}
                  >
                    view details
                  </button>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className={`h-full rounded-full ${source.color}`}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${source.percentage}%` } : { width: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <RevenueSourceDetailsPopup
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        subtitle={detailsSubtitle}
        initialTab={detailsTab as any}
        allowedTabs={detailsAllowedTabs as any}
      />
    </>
  )
}
