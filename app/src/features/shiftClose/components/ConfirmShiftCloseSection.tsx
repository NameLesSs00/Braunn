import { Info, Download, Printer, FileText, CheckCircle } from 'lucide-react'

type SummaryRow = {
  label: string
  value: string
  highlight?: boolean
}

type Props = {
  cashierName: string
  totalCash: number
  totalTransactions: number
  totalRevenue: number
  paymentBalanced: boolean
  foliosActioned: number
}

export function ConfirmShiftCloseSection({
  cashierName,
  totalCash,
  totalTransactions,
  totalRevenue,
  paymentBalanced,
  foliosActioned,
}: Props) {
  const rows: SummaryRow[] = [
    { label: 'Cashier', value: cashierName },
    { label: 'Total Cash', value: `$${totalCash.toFixed(2)}` },
    { label: 'Total Transactions', value: String(totalTransactions) },
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
  ]

  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#EEF4FF]">
        <Info className="h-8 w-8 text-[#0B4EA2]" />
      </div>

      {/* Title */}
      <h3 className="mt-4 text-[18px] font-bold text-slate-800">Confirm Shift Close</h3>
      <p className="mt-1 max-w-sm text-center text-[13px] leading-relaxed text-slate-500">
        Please review the summary before closing your shift. This action will finalize all transactions.
      </p>

      {/* Summary table */}
      <div className="mt-6 w-full">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-slate-100 px-4 py-3"
          >
            <span className="text-[13px] text-slate-600">{row.label}</span>
            <span className="text-[13px] font-semibold text-slate-800">{row.value}</span>
          </div>
        ))}

        {/* Payment Status – highlighted green */}
        <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <span className="text-[13px] text-slate-600">Payment Status</span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            {paymentBalanced ? 'All Balanced' : 'Unbalanced'}
          </span>
        </div>

        {/* Open Folios – highlighted green */}
        <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <span className="text-[13px] text-slate-600">Open Folios</span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            {foliosActioned} Actioned
          </span>
        </div>
      </div>

      {/* Reports Preview */}
      <div className="mt-8 w-full">
        <h4 className="text-[16px] font-bold text-slate-800">Reports Preview</h4>
        <p className="mt-0.5 text-[13px] text-slate-500">Review and download shift reports</p>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100">
              <FileText className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Shift Report</p>
              <p className="text-[11px] text-slate-400">Complete shift activity summary</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <Download className="h-4 w-4" />
            </button>
            <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <Printer className="h-4 w-4" />
            </button>
            <button type="button" className="text-[13px] font-semibold text-[#0B4EA2] transition-colors hover:text-[#0a3f85]">
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
