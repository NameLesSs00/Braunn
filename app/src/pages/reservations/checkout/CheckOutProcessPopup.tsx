import { useState } from 'react'
import { Modal } from '../../../shared/ui/Modal'
import { Step1Verification } from './Step1Verification'
import { Step2Payment } from './Step2Payment'
import { Step3Confirm } from './Step3Confirm'
import type { PmsReservation } from '../../../models/PmsReservation'
import { CheckCircle2 } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  reservation: PmsReservation | null
}

export function CheckOutProcessPopup({ open, onClose, reservation }: Props) {
  const [step, setStep] = useState(1)
  const [paymentData, setPaymentData] = useState({ method: 'cash', amount: '' })
  const [showSuccess, setShowSuccess] = useState(false)

  const handleNext = () => {
    if (step === 3) {
      setShowSuccess(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      onClose()
    } else {
      setStep((s) => s - 1)
    }
  }

  if (!reservation) return null

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-4xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div>
            <div className="text-lg font-semibold text-white">Guest Check-Out</div>
            <div className="text-sm text-white/80">Room {reservation.roomNumber || '---'} - {reservation.guestName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-8">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-10">
            <StepIcon active={step === 1} completed={step > 1} label="Verification" icon="user" />
            <div className={["h-[2px] flex-1 mx-4 transition-colors duration-500", step > 1 ? "bg-emerald-500" : "bg-slate-100"].join(' ')} />
            <StepIcon active={step === 2} completed={step > 2} label="Payment" icon="credit-card" />
            <div className={["h-[2px] flex-1 mx-4 transition-colors duration-500", step > 2 ? "bg-emerald-500" : "bg-slate-100"].join(' ')} />
            <StepIcon active={step === 3} completed={step > 3} label="Confirm" icon="check" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 pb-8">
          {step === 1 && (
            <Step1Verification 
              reservation={reservation} 
              onNext={handleNext} 
              onBack={handleBack} 
            />
          )}
          {step === 2 && (
            <Step2Payment 
              reservation={reservation} 
              onNext={handleNext} 
              onBack={handleBack} 
              onPaymentChange={(data) => setPaymentData(prev => ({ ...prev, ...data }))}
            />
          )}
          {step === 3 && (
            <Step3Confirm 
              reservation={reservation} 
              paymentData={paymentData}
              onNext={handleNext} 
              onBack={handleBack} 
            />
          )}
        </div>
      </div>

      <Modal open={showSuccess} onClose={() => { setShowSuccess(false); onClose(); }}>
        <div className="flex w-[480px] flex-col items-center rounded-[32px] bg-white p-12 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/50">
              <CheckCircle2 className="h-10 w-10" strokeWidth={2.5} />
            </div>
          </div>
          
          <h3 className="mb-4 text-3xl font-extrabold text-slate-800 tracking-tight">Check-Out Complete!</h3>
          <p className="mb-10 max-w-[380px] text-[15px] leading-relaxed text-slate-500 font-medium">
            Guest <strong>{reservation.guestName}</strong> has been successfully checked out. The room <strong>{reservation.roomNumber}</strong> is now marked as "Cleaning".
          </p>
          
          <button
            type="button"
            className="w-full rounded-2xl bg-[#0B4EA2] py-4 text-[15px] font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#093d81] active:scale-[0.98]"
            onClick={() => {
              setShowSuccess(false)
              onClose()
            }}
          >
            Done
          </button>
        </div>
      </Modal>
    </Modal>
  )
}

function StepIcon({ active, completed, label, icon }: { active: boolean; completed: boolean; label: string; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={[
          "grid h-10 w-10 place-items-center rounded-full text-lg shadow-sm transition-all duration-300",
          completed ? "bg-emerald-500 text-white" : active ? "bg-[#0B4EA2] text-white scale-110" : "bg-slate-100 text-slate-400"
        ].join(' ')}
      >
        {completed ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        ) : icon === 'user' ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : icon === 'credit-card' ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={["text-[12px] font-bold", active ? "text-[#0B4EA2]" : "text-slate-400"].join(' ')}>{label}</span>
    </div>
  )
}
