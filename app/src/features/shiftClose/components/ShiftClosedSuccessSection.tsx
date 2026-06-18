import { CheckCircle, LogOut } from 'lucide-react'

type Props = {
  closedAt: string
  onLogout: () => void
  onReturnToDashboard: () => void
}

export function ShiftClosedSuccessSection({ closedAt, onLogout, onReturnToDashboard }: Props) {
  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Success icon */}
      <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50">
        <CheckCircle className="h-8 w-8 text-emerald-500" />
      </div>

      {/* Title */}
      <h3 className="mt-5 text-[20px] font-bold text-slate-800">Shift Closed Successfully!</h3>
      <p className="mt-2 text-center text-[14px] text-slate-500">
        Your shift has been closed and all reports have been generated
      </p>
      <p className="mt-1 text-[13px] text-slate-400">Shift closed at {closedAt}</p>

      {/* Action buttons */}
      <div className="mt-8 flex w-full max-w-md flex-col gap-3">
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Logout
          <LogOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onReturnToDashboard}
          className="h-12 w-full rounded-xl bg-[#0B4EA2] text-[14px] font-semibold text-white transition-colors hover:bg-[#0a3f85]"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  )
}
