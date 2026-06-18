import { SummaryCards } from '../components/SummaryCards'
import { RequestTypesChart } from '../components/RequestTypesChart'
import { RecentActivityList } from '../components/RecentActivityList'

export function LaundryOverviewPage() {
  return (
    <div className="py-6 space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Overview</h2>
        <p className="mt-1 text-[13px] text-slate-400">Monitor your laundry operations in real-time</p>
      </div>

      {/* 4 stat cards */}
      <SummaryCards />

      {/* Chart + Activity side by side */}
      <div className="grid grid-cols-[1fr_1.6fr] gap-4" style={{ minHeight: '460px' }}>
        <RequestTypesChart />
        <RecentActivityList />
      </div>
    </div>
  )
}
