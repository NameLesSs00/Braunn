import { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import { ShiftStartOverviewSection } from './ShiftStartOverviewSection'
import { ShiftStartedSuccessSection } from './ShiftStartedSuccessSection'
import { MOCK_SHIFT_START_INFO, MOCK_SHIFT_OPTIONS } from '../mockData'
import { useAppDispatch } from '../../../shared/apis/hooks'
import { startShift } from '../../shift/shiftSlice'

type Step = 1 | 2

type Props = {
  open: boolean
  onClose: () => void
}

function formatTime(): string {
  return new Date().toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function ShiftStartModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<Step>(1)
  const [openingBalance, setOpeningBalance] = useState<number>(MOCK_SHIFT_START_INFO.openingBalance)
  const [selectedShift, setSelectedShift] = useState(MOCK_SHIFT_OPTIONS[0].id)
  const [startedAt, setStartedAt] = useState('')

  function handleStartShift() {
    setStartedAt(formatTime())
    dispatch(startShift())
    setStep(2)
  }

  function handleCancel() {
    resetAndClose()
  }

  function handleContinue() {
    resetAndClose()
  }

  function resetAndClose() {
    onClose()
    setStep(1)
    setOpeningBalance(MOCK_SHIFT_START_INFO.openingBalance)
    setSelectedShift(MOCK_SHIFT_OPTIONS[0].id)
    setStartedAt('')
  }

  return (
    <Modal open={open} onClose={step === 2 ? handleContinue : handleCancel} closeOnBackdrop={false}>
      <div className="flex w-[869px] max-w-full flex-col rounded-2xl bg-[#F8F9FB] shadow-2xl">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between rounded-t-2xl bg-emerald-600 px-8 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-white">Start New Shift</h2>
            <p className="mt-0.5 text-[13px] text-emerald-100">Initialize your daily operations</p>
          </div>
          <button
            type="button"
            onClick={step === 2 ? handleContinue : handleCancel}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────── */}
        <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {step === 1 && (
            <>
              <ShiftStartOverviewSection data={MOCK_SHIFT_START_INFO} />

              <div className="grid grid-cols-[1.3fr_1fr] gap-8">
                {/* Shift Selection */}
                <section>
                  <h3 className="text-[15px] font-bold text-slate-800">Select Shift</h3>
                  <div className="mt-3 space-y-3">
                    {MOCK_SHIFT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedShift(option.id)}
                        className={[
                          'w-full rounded-2xl border-2 p-5 text-left transition-all',
                          selectedShift === option.id
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-200',
                        ].join(' ')}
                      >
                        <div className="text-[16px] font-bold text-slate-800">{option.label}</div>
                        <div className="mt-1 text-[13px] text-slate-500">{option.timeRange}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Opening Balance */}
                <section>
                  <h3 className="text-[15px] font-bold text-slate-800">Opening Cash Balance</h3>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-400">
                      <Wallet className="h-5 w-5" />
                      <span className="text-[13px] font-bold uppercase tracking-wider">DRAWER FUND</span>
                    </div>
                    
                    <div className="mt-4 rounded-xl bg-slate-50/80 p-6">
                      <div className="relative flex items-center">
                        <span className="text-[32px] font-bold text-slate-400">$</span>
                        <input
                          type="number"
                          className="w-full border-0 bg-transparent px-3 text-[32px] font-bold text-slate-800 outline-none focus:ring-0"
                          value={openingBalance}
                          onChange={(e) => setOpeningBalance(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <p className="mt-4 text-[13px] leading-relaxed text-slate-500 italic">
                      Verify the physical cash in your drawer matches this amount before starting.
                    </p>
                  </div>
                </section>
              </div>

              {/* Notes */}
              <section>
                <h3 className="text-[15px] font-bold text-slate-800">Notes (Optional)</h3>
                <textarea
                  rows={2}
                  className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                  placeholder="any specific notes for this shift..."
                />
              </section>
            </>
          )}

          {step === 2 && (
            <ShiftStartedSuccessSection startedAt={startedAt} onContinue={handleContinue} />
          )}
        </div>

        {/* ── Footer ──────── */}
        {step === 1 && (
          <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-8 py-4">
            <button
              type="button"
              onClick={handleCancel}
              className="h-11 rounded-xl border border-slate-200 px-8 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartShift}
              className="h-11 rounded-xl bg-emerald-600 px-8 text-[14px] font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Start Shift
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
