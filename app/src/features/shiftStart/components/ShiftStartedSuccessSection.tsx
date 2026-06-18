import { CheckCircle2 } from 'lucide-react'

type Props = {
  startedAt: string
  onContinue: () => void
}

export function ShiftStartedSuccessSection({ startedAt, onContinue }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h3 className="mt-5 text-[20px] font-bold text-slate-800">Shift Started Successfully!</h3>
      <p className="mt-1 text-[13px] text-slate-400">Shift started at {startedAt}</p>
      
      <div className="mt-10 grid w-full max-w-[400px] grid-cols-1 gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="flex h-12 items-center justify-center rounded-xl bg-emerald-600 font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  )
}
