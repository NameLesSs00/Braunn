export function AccountingDashboardContent() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Accounting Overview</h1>
        <p className="mt-2 text-sm text-slate-500">
          Track financial performance, manage invoices, and review general ledger activities.
        </p>
      </div>

      {/* Main Content Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 min-h-[400px] rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center">
          <p className="text-slate-400">Financial Reports Placeholder</p>
        </div>
        <div className="min-h-[400px] rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center">
          <p className="text-slate-400">Pending Invoices Placeholder</p>
        </div>
      </div>
    </div>
  )
}
