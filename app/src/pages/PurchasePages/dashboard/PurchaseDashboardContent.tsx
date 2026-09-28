export function PurchaseDashboardContent() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Purchase Overview</h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor your purchasing activities, supplier orders, and inventory status here.
        </p>
      </div>

      {/* Main Content Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 min-h-[400px] rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center">
          <p className="text-slate-400">Activity Chart Placeholder</p>
        </div>
        <div className="min-h-[400px] rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center">
          <p className="text-slate-400">Recent Orders Placeholder</p>
        </div>
      </div>
    </div>
  )
}
