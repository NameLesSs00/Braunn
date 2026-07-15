import { useMemo, useState } from 'react'
import { appAlert } from '../../../shared/ui/AppAlert'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { updateOtaDraft, resetOtaDraft } from '../../../features/reservations/otaReservationDraftSlice'
import { Modal } from '../../../shared/ui/Modal'
import { OtaReservationStep1 } from './OtaReservationStep1'
import { OtaReservationStep2 } from './OtaReservationStep2'
import { OtaReservationStep3 } from './OtaReservationStep3'

type Step = 1 | 2 | 3

type Props = {
  open: boolean
  onClose: () => void
}

const STEP_LABELS = ['Guest & Booking', 'Room Stay', 'Guarantee & Review']

export function OtaReservationModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const draft = useAppSelector((state) => state.otaReservationDraft)
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (patch: any) => {
    dispatch(updateOtaDraft(patch))
  }

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  const handleReset = () => {
    dispatch(resetOtaDraft())
    setStep(1)
  }

  const steps = useMemo(() => [1, 2, 3] as const, [])

  const title =
    step === 1 ? 'OTA Reservation — Guest & Booking'
    : step === 2 ? 'OTA Reservation — Room Stay Details'
    : 'OTA Reservation — Guarantee & Review'

  const nextLabel =
    step === 3 ? 'Submit Reservation' : 'Next'

  const handleNext = async () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as Step)
      return
    }

    // Step 3 = submit
    setSubmitting(true)
    try {
      // Build the OTA payload
      const payload = {
        hotelReservation: {
          createDateTime: draft.createDateTime ? new Date(draft.createDateTime).toISOString() : new Date().toISOString(),
          creatorID: draft.creatorID,
          currency: draft.currency,
          guarantee: {
            guaranteeCode: draft.guaranteeCode,
            guaranteeType: draft.guaranteeType,
            paymentCard: {
              cardCode: draft.cardCode,
              cardHolderName: draft.cardHolderName,
              cardNo: draft.cardNo,
              cardType: draft.cardType,
              expire: draft.expire,
              seriesCode: draft.seriesCode,
            },
          },
          depositAmount: draft.depositAmount,
          guestDetails: [
            {
              address: {
                addressLine: draft.addressLine,
                addressType: draft.addressType,
                city: draft.city,
                countryCode: draft.countryCode,
                postalCode: draft.postalCode,
                state: draft.state,
              },
              email: draft.email,
              guestID: draft.guestID,
              personName: {
                firstName: draft.firstName,
                middleName: draft.middleName,
                salutation: draft.salutation,
                surName: draft.surName,
              },
              profileType: draft.profileType,
              telePhone: {
                locationType: draft.phoneLocationType,
                phoneNo: draft.phoneNo,
                phoneTechType: draft.phoneTechType,
              },
            },
          ],
          hotelCode: draft.hotelCode,
          pos: {
            channelCode: draft.channelCode,
            channelName: draft.channelName,
          },
          resGlobalInfo: {
            hotelReservationIDs: [
              { resIDType: draft.resIDType, resIDValue: draft.resIDValue },
            ],
          },
          resStatus: draft.resStatus,
          roomStays: [
            {
              comments: draft.comments.map((c) => ({ guestViewable: c.guestViewable, text: c.text })),
              guestCount: draft.guestCounts.map((g) => ({ ageQualifyingCode: g.ageQualifyingCode, count: g.count })),
              guestIDs: draft.guestIDs ? draft.guestIDs.split(',').map((s) => s.trim()).filter(Boolean) : [],
              isGuestPerRoom: draft.isGuestPerRoom,
              mealCode: draft.mealCode,
              mealPlanIndicator: draft.mealPlanIndicator,
              memberShipInfo: {
                accountID: draft.membershipAccountID,
                bonusCode: draft.membershipBonusCode,
                programCode: draft.membershipProgramCode,
              },
              roomRates: draft.roomRates.map((r) => ({
                invCode: r.invCode,
                numberOfUnits: r.numberOfUnits,
                ratePlanCode: r.ratePlanCode,
                rates: r.rates.map((e) => ({
                  amountAfterTax: e.amountAfterTax,
                  amountBeforeTax: e.amountBeforeTax,
                  effectiveDate: e.effectiveDate ? new Date(e.effectiveDate).toISOString() : new Date().toISOString(),
                  expireDate: e.expireDate ? new Date(e.expireDate).toISOString() : new Date().toISOString(),
                })),
              })),
              roomStayID: draft.roomStayID,
              specialRequests: draft.specialRequests.map((s) => ({ requestCode: s.requestCode, text: s.text })),
              timeSpan: {
                start: draft.timeSpanStart ? new Date(draft.timeSpanStart).toISOString() : new Date().toISOString(),
                end: draft.timeSpanEnd ? new Date(draft.timeSpanEnd).toISOString() : new Date().toISOString(),
              },
              totalPrice: {
                amountAfterTax: draft.totalAmountAfterTax,
                amountBeforeTax: draft.totalAmountBeforeTax,
                taxAmount: draft.totalTaxAmount,
              },
            },
          ],
          timeStamp: new Date().toISOString(),
          uniqueID: {
            idValue: draft.resIDValue,
            type: draft.resIDType,
          },
        },
      }

      // Log payload (no endpoint yet)
      console.log('[OTA Reservation] Payload:', JSON.stringify(payload, null, 2))

      // TODO: Replace with real API call when endpoint is available
      // await api.createOtaReservation(payload)

      // Simulate success
      await new Promise((res) => setTimeout(res, 800))

      await appAlert.fire({
        icon: 'success',
        title: 'OTA Reservation Submitted!',
        html: `<div style="color:#475569;font-size:14px">The reservation payload has been prepared successfully.<br/>Connect to the backend endpoint when ready.</div>`,
        confirmButtonColor: '#0B4EA2',
        confirmButtonText: 'Done',
      })

      dispatch(resetOtaDraft())
      setStep(1)
      onClose()
    } catch (err) {
      console.error('[OTA Reservation] Error:', err)
      appAlert.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err instanceof Error ? err.message : 'An unexpected error occurred.',
        confirmButtonColor: '#0B4EA2',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step)
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-5xl flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5 shrink-0">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-blue-200">OTA Reservation</div>
            <div className="mt-0.5 text-lg font-bold text-white">{title.split('—')[1]?.trim()}</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="hidden rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 md:block"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
              aria-label="Close"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>
        </div>

        {/* ── Stepper ── */}
        <div className="shrink-0 bg-white px-8 pt-6 pb-4 border-b border-slate-100">
          <div className="mx-auto flex w-full max-w-lg items-center">
            {steps.map((s, idx) => (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  {s < step ? (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-sm">✓</div>
                  ) : (
                    <div
                      className={[
                        'grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold shadow-sm transition-colors',
                        s === step ? 'bg-[#0B4EA2] text-white' : 'bg-slate-100 text-slate-500',
                      ].join(' ')}
                    >
                      {s}
                    </div>
                  )}
                  <span className={['text-[10px] font-semibold hidden md:block', s === step ? 'text-[#0B4EA2]' : s < step ? 'text-emerald-500' : 'text-slate-400'].join(' ')}>
                    {STEP_LABELS[idx]}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={['mx-3 mb-4 h-[2px] w-full transition-colors', s < step ? 'bg-emerald-400' : 'bg-slate-200'].join(' ')} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step Content ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {step === 1 ? (
            <OtaReservationStep1 value={draft} onChange={handleChange} />
          ) : step === 2 ? (
            <OtaReservationStep2 value={draft} onChange={handleChange} />
          ) : (
            <OtaReservationStep3 value={draft} onChange={handleChange} />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-8 py-5">
          <button
            type="button"
            disabled={step === 1}
            onClick={handleBack}
            className={[
              'h-12 rounded-xl border px-10 text-sm font-semibold transition-colors',
              step === 1
                ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                : 'border-[#0B4EA2] text-[#0B4EA2] hover:bg-blue-50',
            ].join(' ')}
          >
            Back
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            Step {step} of {steps.length}
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleNext}
            className={[
              'h-12 rounded-xl px-10 text-sm font-semibold text-white transition-colors flex items-center gap-2',
              submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#0B4EA2] hover:bg-[#093d82]',
            ].join(' ')}
          >
            {submitting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {nextLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
