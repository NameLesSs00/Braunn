import { useState } from 'react'
import { X } from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch } from '../../../shared/apis/hooks'
import { endShift } from '../../shift/shiftSlice'
import { ShiftOverviewSection } from './ShiftOverviewSection'
import { OperationsReviewSection } from './OperationsReviewSection'
import { PaymentOverviewSection } from './PaymentOverviewSection'
import { OpenFoliosReviewSection } from './OpenFoliosReviewSection'
import { ConfirmShiftCloseSection } from './ConfirmShiftCloseSection'
import { ShiftClosedSuccessSection } from './ShiftClosedSuccessSection'
import { MOCK_SHIFT_OVERVIEW, MOCK_OPERATIONS, MOCK_PAYMENT, MOCK_INVOICES } from '../mockData'
import type { PaymentOverview } from '../types'

type Step = 1 | 2 | 3 | 4

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

export function ShiftCloseModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<Step>(1)
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState<PaymentOverview>({ ...MOCK_PAYMENT })
  const [transferred, setTransferred] = useState(false)
  const [closedAt, setClosedAt] = useState('')

  function handleCountedAmountChange(value: number) {
    setPayment((prev) => ({
      ...prev,
      countedAmount: value,
      balanced: value === prev.systemTotal,
    }))
  }

  function handleTransferAll() {
    setTransferred(true)
  }

  function handlePrimaryAction() {
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) {
      setStep(3)
      return
    }
    if (step === 3) {
      // Confirm & close → go to success screen
      setClosedAt(formatTime())
      dispatch(endShift())
      setStep(4)
      return
    }
  }

  function handleBack() {
    if (step === 3) {
      setStep(2)
    } else if (step === 2) {
      setStep(1)
    } else {
      resetAndClose()
    }
  }

  function handleCancel() {
    resetAndClose()
  }

  function handleLogout() {
    // TODO: wire up actual logout
    resetAndClose()
  }

  function handleReturnToDashboard() {
    resetAndClose()
  }

  function resetAndClose() {
    onClose()
    setStep(1)
    setNotes('')
    setPayment({ ...MOCK_PAYMENT })
    setTransferred(false)
    setClosedAt('')
  }

  // Disable the primary button in step 2 until transfer is done
  const isPrimaryDisabled = step === 2 && !transferred

  // Button labels per step
  const leftLabel = step === 1 ? 'cancel' : 'Back'
  const rightLabel = step === 3 ? 'Confirm & Close Shift' : 'shift close'

  return (
    <Modal open={open} onClose={step === 4 ? handleReturnToDashboard : handleCancel} closeOnBackdrop={false}>
      <div className="flex w-[869px] max-w-full flex-col rounded-2xl bg-[#F8F9FB] shadow-2xl">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between rounded-t-2xl bg-[#0B4EA2] px-8 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-white">Shift Close</h2>
            <p className="mt-0.5 text-[13px] text-blue-200">Complete your shift closing process</p>
          </div>
          <button
            type="button"
            onClick={step === 4 ? handleReturnToDashboard : handleCancel}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <div className="flex-1 space-y-8 overflow-y-auto px-8 py-6" style={{ maxHeight: 'calc(90vh - 160px)' }}>

          {/* ─── Steps 1 & 2: full form ──────────────────────────── */}
          {(step === 1 || step === 2) && (
            <>
              <ShiftOverviewSection data={MOCK_SHIFT_OVERVIEW} />
              <OperationsReviewSection items={MOCK_OPERATIONS} />
              <PaymentOverviewSection data={payment} onCountedAmountChange={handleCountedAmountChange} />

              {/* Step 2: Open Folios Review */}
              {step === 2 && (
                <OpenFoliosReviewSection
                  invoices={MOCK_INVOICES}
                  onTransferAll={handleTransferAll}
                  transferred={transferred}
                />
              )}

              {/* Notes */}
              <section>
                <h3 className="text-[16px] font-bold text-slate-800">Notes (Optional)</h3>
                <textarea
                  rows={3}
                  className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
                  placeholder="add additional details"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </section>
            </>
          )}

          {/* ─── Step 3: Confirm summary ─────────────────────────── */}
          {step === 3 && (
            <ConfirmShiftCloseSection
              cashierName={MOCK_SHIFT_OVERVIEW.name}
              totalCash={payment.systemTotal}
              totalTransactions={0}
              totalRevenue={MOCK_SHIFT_OVERVIEW.revenue}
              paymentBalanced={payment.balanced}
              foliosActioned={MOCK_INVOICES.length}
            />
          )}

          {/* ─── Step 4: Success ──────────────────────────────────── */}
          {step === 4 && (
            <ShiftClosedSuccessSection
              closedAt={closedAt}
              onLogout={handleLogout}
              onReturnToDashboard={handleReturnToDashboard}
            />
          )}
        </div>

        {/* ── Footer (hidden on step 4 — buttons are inline) ──────── */}
        {step !== 4 && (
          <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-8 py-4">
            <button
              type="button"
              onClick={handleBack}
              className="h-11 rounded-xl border border-slate-200 px-8 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              {leftLabel}
            </button>
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isPrimaryDisabled}
              className={[
                'h-11 rounded-xl px-8 text-[14px] font-semibold transition-colors',
                isPrimaryDisabled
                  ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                  : 'bg-[#0B4EA2] text-white hover:bg-[#0a3f85]',
              ].join(' ')}
            >
              {rightLabel}
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
