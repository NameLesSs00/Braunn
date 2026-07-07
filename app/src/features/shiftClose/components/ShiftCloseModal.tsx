import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { closeCashierShift } from '../../shift/shiftSlice'
import { ShiftOverviewSection } from './ShiftOverviewSection'
import { PaymentOverviewSection } from './PaymentOverviewSection'
import { ConfirmShiftCloseSection } from './ConfirmShiftCloseSection'
import { ShiftClosedSuccessSection } from './ShiftClosedSuccessSection'
import type { PaymentOverview, ShiftOverview } from '../types'

type Step = 1 | 2 | 3

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
  const user = useAppSelector((state) => state.auth.user)
  const currentShift = useAppSelector((state) => state.shift.currentShift)
  const closeStatus = useAppSelector((state) => state.shift.closeStatus)
  
  const [step, setStep] = useState<Step>(1)
  const [notes, setNotes] = useState('')
  const [countedAmount, setCountedAmount] = useState(0)
  const [closedAt, setClosedAt] = useState('')

  useEffect(() => {
     if (open && currentShift) {
        setCountedAmount(currentShift.expectedCashAmount || 0)
     }
  }, [open, currentShift])

  function handleCountedAmountChange(value: number) {
    setCountedAmount(value)
  }

  async function handlePrimaryAction() {
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) {
      // Confirm & close → go to success screen
      if (currentShift?.id) {
        const result = await dispatch(
          closeCashierShift({
            shiftId: currentShift.id,
            payload: {
              actualCashAmount: countedAmount,
              notes: notes.trim() || undefined,
            },
          })
        )
        if (closeCashierShift.fulfilled.match(result)) {
          setClosedAt(formatTime())
          setStep(3)
        }
      }
      return
    }
  }

  function handleBack() {
    if (step === 2) {
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
    setClosedAt('')
  }

  const isPrimaryDisabled = closeStatus === 'loading'

  const leftLabel = step === 1 ? 'cancel' : 'Back'
  const rightLabel = step === 2 ? 'Confirm & Close Shift' : 'shift close'

  const expectedAmount = currentShift?.expectedCashAmount || 0
  const openedTime = currentShift ? new Date(currentShift.openedAtUtc + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
  const shiftOverviewData: ShiftOverview = {
    name: user?.name || 'Cashier',
    role: user?.role || 'Front Desk',
    startTime: openedTime,
    endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    reservations: 0,
    checkIns: 0,
    checkOuts: 0,
    revenue: expectedAmount,
  }
  
  const paymentData: PaymentOverview = {
    systemTotal: expectedAmount,
    countedAmount: countedAmount,
    balanced: countedAmount === expectedAmount,
    methods: [
      { label: 'Cash', amount: expectedAmount }
    ],
    total: expectedAmount
  }

  return (
    <Modal open={open} onClose={step === 3 ? handleReturnToDashboard : handleCancel} closeOnBackdrop={false}>
      <div className="flex w-[869px] max-w-full flex-col rounded-2xl bg-[#F8F9FB] shadow-2xl">
        <div className="flex items-start justify-between rounded-t-2xl bg-[#0B4EA2] px-8 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-white">Shift Close</h2>
            <p className="mt-0.5 text-[13px] text-blue-200">Complete your shift closing process</p>
          </div>
          <button
            type="button"
            onClick={step === 3 ? handleReturnToDashboard : handleCancel}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-8 py-6" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {step === 1 && (
            <>
              <ShiftOverviewSection data={shiftOverviewData} />
              <PaymentOverviewSection data={paymentData} onCountedAmountChange={handleCountedAmountChange} />

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

          {step === 2 && (
            <ConfirmShiftCloseSection
              cashierName={shiftOverviewData.name}
              openingCash={currentShift?.openingCashAmount || 0}
              totalCash={paymentData.systemTotal}
              countedCash={paymentData.countedAmount}
              paymentBalanced={paymentData.balanced}
            />
          )}

          {step === 3 && (
            <ShiftClosedSuccessSection
              closedAt={closedAt}
              onLogout={handleLogout}
              onReturnToDashboard={handleReturnToDashboard}
            />
          )}
        </div>

        {step !== 3 && (
          <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-8 py-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={isPrimaryDisabled}
              className="h-11 rounded-xl border border-slate-200 px-8 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {leftLabel}
            </button>
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isPrimaryDisabled}
              className={[
                'h-11 min-w-[140px] rounded-xl px-8 text-[14px] font-semibold transition-colors',
                isPrimaryDisabled
                  ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                  : 'bg-[#0B4EA2] text-white hover:bg-[#0a3f85]',
              ].join(' ')}
            >
              {closeStatus === 'loading' && step === 2 ? 'Closing...' : rightLabel}
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
