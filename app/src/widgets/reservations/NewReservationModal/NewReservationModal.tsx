import { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { updateDraft, resetDraft } from '../../../features/reservations/draftSlice'
import { removeReservationDraftNotification, upsertReservationDraftNotification } from '../../../features/notifications/notificationsSlice'
import {
  hasMeaningfulReservationData,
  removeSavedReservationDraft,
  saveReservationDraft,
  type SavedReservationStep,
  type SavedReservationStep4Page,
} from '../../../features/reservations/reservationDraftStorage'
import { createLocalReservation } from '../../../features/localReservations/localReservationsSlice'
import type { CreateLocalReservationRequest } from '../../../models/LocalReservation'
import { createOptionalReservation } from '../../../features/reservations/optionalReservationsSlice'



import { Modal } from '../../../shared/ui/Modal'
import { NewReservationStep1 } from './steps/NewReservationStep1'
import { NewReservationStep2 } from './steps/NewReservationStep2'
import { NewReservationStep3 } from './steps/NewReservationStep3'
import { NewReservationStep4 } from './steps/NewReservationStep4'

import { CheckInProcessModal } from '../CheckInProcessModal/CheckInProcessModal'
import { ExtendStayModal } from '../ExtendStayModal/ExtendStayModal'
import { computePricing } from './steps/step4/pricing'

type Props = {
  open: boolean
  activeDraftId: string | null
  initialStep: SavedReservationStep
  initialStep4Page: SavedReservationStep4Page
  onActiveDraftIdChange: (draftId: string | null) => void
  onClose: () => void
}

type Step = 1 | 2 | 3 | 4

type Step4Page = 1 | 2

type ValidationErrors = Record<string, string>

function hasText(value?: string | null) {
  return Boolean(value && value.trim())
}

function isPositiveNumber(value: unknown) {
  return Number(value) > 0
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Operation failed'
}

function isPossiblyStillProcessingError(message: string) {
  return /timeout|timed out|failed to fetch|network|request failed \(408\)|request failed \(502\)|request failed \(503\)|request failed \(504\)/i.test(message)
}

export function NewReservationModal({
  open,
  activeDraftId,
  initialStep,
  initialStep4Page,
  onActiveDraftIdChange,
  onClose,
}: Props) {
  const dispatch = useAppDispatch()
  const draft = useAppSelector((state) => state.reservationDraft)
  const localAriState = useAppSelector((state) => state.localAri)
  const optionalReservations = useAppSelector((state) => state.optionalReservations)
  const financialSettings = useAppSelector((state) => state.financialSettings)


  const [step, setStep] = useState<Step>(1)
  const [step4Page, setStep4Page] = useState<Step4Page>(1)

  const [checkInOpen, setCheckInOpen] = useState(false)
  const [extendStayOpen, setExtendStayOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [finalConfirmationOpen, setFinalConfirmationOpen] = useState(false)
  const [creatingReservation, setCreatingReservation] = useState(false)
  const [creatingReservationResultUnknown, setCreatingReservationResultUnknown] = useState(false)
  const [savingOptionalReservation, setSavingOptionalReservation] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const creatingReservationRef = useRef(false)
  const savingOptionalReservationRef = useRef(false)

  useEffect(() => {
    if (!open) return
    setStep(initialStep)
    setStep4Page(initialStep4Page)
  }, [open, initialStep, initialStep4Page])

  useEffect(() => {
    if (!open) return

    if (!hasMeaningfulReservationData(draft)) {
      return
    }

    const savedDraft = saveReservationDraft({
      id: activeDraftId,
      draft,
      step,
      step4Page,
    })

    if (savedDraft.id !== activeDraftId) {
      onActiveDraftIdChange(savedDraft.id)
    }
  }, [activeDraftId, dispatch, draft, onActiveDraftIdChange, open, step, step4Page])

  const handleUpdateDraft = (patch: any) => {
    const nextErrors = { ...validationErrors }
    Object.keys(patch).forEach((key) => {
      delete nextErrors[key]
      if (key === 'rooms') delete nextErrors.rooms
      if (key === 'childAges' || key === 'childCount') delete nextErrors.childAges
    })
    setValidationErrors(nextErrors)
    dispatch(updateDraft(patch))
  }

  const resetSubmissionLocks = () => {
    creatingReservationRef.current = false
    savingOptionalReservationRef.current = false
    setCreatingReservation(false)
    setSavingOptionalReservation(false)
    setCreatingReservationResultUnknown(false)
  }

  const removeActiveSavedDraft = () => {
    if (!activeDraftId) return
    removeSavedReservationDraft(activeDraftId)
    dispatch(removeReservationDraftNotification(activeDraftId))
    onActiveDraftIdChange(null)
  }

  const resetModalProgress = () => {
    setStep(1)
    setStep4Page(1)
    resetSubmissionLocks()
  }

  const finishReservationDraft = () => {
    removeActiveSavedDraft()
    dispatch(resetDraft())
    resetModalProgress()
  }

  const restartReservationDraft = () => {
    removeActiveSavedDraft()
    dispatch(resetDraft())
    resetModalProgress()
  }

  const handleClose = (options?: { skipSave?: boolean }) => {
    if (options?.skipSave) {
      onClose()
      return
    }

    if (step === 4 && step4Page === 2) {
      finishReservationDraft()
    } else if (hasMeaningfulReservationData(draft)) {
      const savedDraft = saveReservationDraft({
        id: activeDraftId,
        draft,
        step,
        step4Page,
      })

      onActiveDraftIdChange(savedDraft.id)
      dispatch(upsertReservationDraftNotification(savedDraft))
    } else {
      removeActiveSavedDraft()
      dispatch(resetDraft())
      resetModalProgress()
    }

    onClose()
  }

  const steps = useMemo(() => [1, 2, 3, 4] as const, [])
  const title =
    step === 1
      ? 'New Reservation'
      : step === 2
        ? 'Stay Details'
        : step === 3
          ? 'Reservation Details'
          : step4Page === 1
            ? 'Payment'
            : 'Reservation Details'

  const nextLabel =
    step === 3
      ? 'continue to Payment'
      : step === 4
        ? step4Page === 1
          ? 'Confirm Reservation'
          : 'Finish'
        : 'Next'

  const showFooter = true

  const nightsForPricing = useMemo(() => {
    const n = Number.parseInt(draft.nights, 10)
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [draft.nights])

  const checkInPricing = useMemo(() => computePricing(draft, nightsForPricing, localAriState), [draft, nightsForPricing, localAriState])

  const openCheckInProcess = () => {
    setCheckInOpen(true)
    setStep(1)
    setStep4Page(1)
  }

  const openExtendStay = () => {
    setExtendStayOpen(true)
    onClose()
    setStep(1)
    setStep4Page(1)
  }

  const validateStep = (targetStep: Step, targetStep4Page: Step4Page = step4Page) => {
    const nextErrors: ValidationErrors = {}
    const addError = (key: string, label: string) => {
      nextErrors[key] = label
    }

    if (targetStep === 1) {
      if (!hasText(draft.bookingSource)) addError('bookingSource', 'Booking source')
      if (!hasText(draft.firstName)) addError('firstName', 'First Name')
      if (!hasText(draft.surName)) addError('surName', 'Last Name')
      if (!hasText(draft.email)) addError('email', 'Email Address')
      if (!hasText(draft.phone)) addError('phone', 'Phone Number')
      if (!hasText(draft.nationality)) addError('nationality', 'Nationality')
      if (!hasText(draft.idNumber)) addError('idNumber', 'ID / National ID')
      if (!hasText(draft.addressLine)) addError('addressLine', 'Address')
    }

    if (targetStep === 2) {
      const validRooms = draft.rooms.filter((room) => hasText(room.roomTypeId) && hasText(room.roomType) && isPositiveNumber(room.roomCount))
      const nights = Number.parseInt(draft.nights, 10)
      const checkIn = draft.checkInDate ? new Date(draft.checkInDate) : null
      const checkOut = draft.checkOutDate ? new Date(draft.checkOutDate) : null

      if (!hasText(draft.checkInDate)) addError('checkInDate', 'Check-in Date')
      if (!hasText(draft.checkOutDate)) addError('checkOutDate', 'Check-out Date')
      if (checkIn && checkOut && checkOut <= checkIn) addError('checkOutDate', 'Check-out Date must be after Check-in Date')
      if (!Number.isFinite(nights) || nights <= 0) addError('nights', 'Nights')
      if (validRooms.length !== draft.rooms.length || validRooms.length === 0) addError('rooms', 'Room Type and Room Count')
      if (!hasText(draft.rateCode)) addError('rateCode', 'Rate Code')
      if (!isPositiveNumber(draft.adultCount)) addError('adultCount', 'Adult Count')
      if (draft.childCount > 0 && (draft.childAges || []).length < draft.childCount) addError('childAges', 'Children Ages')
    }

    if (targetStep === 4 && targetStep4Page === 1) {
      if (!hasText(draft.paymentMethod)) addError('paymentMethod', 'Payment Method')
    }

    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors)
      return false
    }

    setValidationErrors({})
    return true
  }

  const validateThroughStep = (lastStep: Step) => {
    for (let currentStep = 1; currentStep <= lastStep; currentStep += 1) {
      if (!validateStep(currentStep as Step)) return false
    }
    return true
  }

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
            <div className="text-lg font-semibold text-white">{title}</div>
            <div className="flex items-center gap-4">
              {draft.bookingSource === 'GroupContract' ? (
                <div className="inline-flex h-8 items-center rounded-full bg-emerald-100 px-5 text-sm font-semibold text-emerald-800">
                  Group
                </div>
              ) : null}

              <button
                type="button"
                onClick={restartReservationDraft}
                disabled={creatingReservation || savingOptionalReservation}
                className="h-9 rounded-full border border-white/40 px-5 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => handleClose()}
                disabled={creatingReservation || savingOptionalReservation}
                className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
                aria-label="Close"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>
          </div>

        <div className="px-8 py-7">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s} className="flex flex-1 items-center">
                {s < step ? (
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                    ✓
                  </div>
                ) : (
                  <div
                    className={[
                      'grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold',
                      s === step ? 'bg-[#0B4EA2] text-white' : 'bg-slate-200 text-slate-700',
                    ].join(' ')}
                  >
                    {s}
                  </div>
                )}

                {idx < steps.length - 1 ? (
                  <div className="mx-3 h-[2px] w-full bg-slate-200" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

          <div className="flex-1 px-8 pb-8">
            {step === 1 ? (
              <NewReservationStep1 value={draft} onChange={handleUpdateDraft} validationErrors={validationErrors} />
            ) : step === 2 ? (
              <NewReservationStep2 value={draft} onChange={handleUpdateDraft} validationErrors={validationErrors} />
            ) : step === 3 ? (
              <NewReservationStep3 value={draft} />
            ) : step === 4 ? (
              <NewReservationStep4
                value={draft}
                onChange={handleUpdateDraft}
                page={step4Page}
                onOpenCheckIn={openCheckInProcess}
                onOpenExtendStay={openExtendStay}
                validationErrors={validationErrors}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">
                Step {step}
              </div>
            )}
          </div>

        {showFooter ? (
          <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-8 py-6">
            <button
              type="button"
              className={[
                'h-12 rounded-xl border px-12 text-sm font-semibold',
                'border-[#0B4EA2] text-[#0B4EA2]',
              ].join(' ')}
              onClick={() => {
                if (creatingReservation || savingOptionalReservation) return

                if (step === 4 && step4Page === 2) {
                  setStep4Page(1)
                  return
                }

                if (step > 1) {
                  if (step === 4) setStep4Page(1)
                  setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))
                  return
                }

                handleClose()
              }}
            >
              Back
            </button>

            <div className="flex items-center gap-4">
              {Object.keys(validationErrors).length > 0 ? (
                <div className="max-w-md rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                  Please enter the required highlighted fields.
                </div>
              ) : null}
              {step === 3 && (
                <button
                  type="button"
                  className={[
                    "h-12 rounded-xl border border-[#0B4EA2] px-8 text-sm font-semibold text-[#0B4EA2] hover:bg-blue-50 transition-colors flex items-center gap-2",
                    (optionalReservations.status === 'loading' || savingOptionalReservation) ? 'opacity-80 cursor-not-allowed' : ''
                  ].join(' ')}
                  disabled={optionalReservations.status === 'loading' || savingOptionalReservation || creatingReservation}
                  onClick={async () => {
                    if (savingOptionalReservationRef.current || creatingReservationRef.current) return
                    if (!validateThroughStep(2)) return

                    savingOptionalReservationRef.current = true
                    setSavingOptionalReservation(true)

                    const payload = {
                      guestName: `${draft.firstName} ${draft.surName}`.trim() || 'Guest',
                      email: draft.email || '',
                      expectedCheckIn: draft.checkInDate ? new Date(draft.checkInDate).toISOString() : '',
                      expectedCheckOut: draft.checkOutDate ? new Date(draft.checkOutDate).toISOString() : '',
                      totalAmount: checkInPricing.totalAmount || 0,
                      expirationDate: draft.checkInDate ? new Date(draft.checkInDate).toISOString() : new Date().toISOString()
                    }

                    try {
                      await dispatch(createOptionalReservation(payload)).unwrap()
                      removeActiveSavedDraft()
                      dispatch(resetDraft())
                      resetModalProgress()
                      setSuccessOpen(true)
                    } catch (err) {
                      const message = getErrorMessage(err)
                      console.error('Optional reservation failed:', err)
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to save optional reservation: ' + message,
                        confirmButtonColor: '#0B4EA2',
                      })
                    } finally {
                      savingOptionalReservationRef.current = false
                      setSavingOptionalReservation(false)
                    }
                  }}
                >
                  {(optionalReservations.status === 'loading' || savingOptionalReservation) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingOptionalReservation ? 'Saving...' : 'Save As Optional Reservation'}
                </button>

              )}

              <button
                type="button"
                className={[
                  'h-12 rounded-xl px-16 text-sm font-semibold flex items-center justify-center gap-2',
                  creatingReservation || savingOptionalReservation || creatingReservationResultUnknown
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-[#0B4EA2] text-white'
                ].join(' ')}
                disabled={creatingReservation || savingOptionalReservation || creatingReservationResultUnknown}
                onClick={async () => {
                  if (creatingReservationRef.current || savingOptionalReservationRef.current || creatingReservationResultUnknown) return

                  if (step === 4) {
                    if (step4Page === 1) {
                      if (!validateThroughStep(2) || !validateStep(4, 1)) return

                      creatingReservationRef.current = true
                      setCreatingReservation(true)


                      const localReservationPayload: CreateLocalReservationRequest = {
                        guest: {
                          firstName: draft.firstName || 'Unknown',
                          lastName: draft.surName || 'Unknown',
                          email: draft.email || '',
                          phone: draft.phone || '',
                          nationalId: draft.idNumber || '',
                          address: draft.addressLine || '',
                          streetName: draft.addressLine || '',
                          countryCode: draft.countryCode || draft.nationality || '',
                        },
                        checkInDate: draft.checkInDate || new Date().toISOString().split('T')[0],
                        checkOutDate: draft.checkOutDate || new Date().toISOString().split('T')[0],
                        status: draft.reservationStatus || 'Reserved',
                        bookingSource: draft.bookingSource || 'WalkIn',
                        reservationType: draft.isVip ? 'VIP' : 'Normal',
                        currency: draft.currency || 'USD',
                        roomRequests: draft.rooms
                          .filter((r) => r.roomTypeId && r.roomTypeId.trim() !== '')
                          .map((r) => ({
                            roomTypeId: r.roomTypeId,
                            roomQuantity: Number(r.roomCount) || 1,
                            adults: Number(draft.adultCount) || 1,
                            children: Number(draft.childCount) || 0,
                            childAges: draft.childAges || [],
                            ratePlanCode: draft.rateCode || 'STD',
                            pricePerNight: localAriState.rates[0]?.amountBeforeTax ?? localAriState.rates[0]?.basePriceBeforeTax ?? 0,
                          })),
                        selectedServices: draft.extras
                          .filter((extra) => extra.item && extra.item.trim() !== '' && financialSettings.services.find((s: { name: string; id: string }) => s.name === extra.item)?.id)
                          .map((extra) => ({
                            additionalServiceId: financialSettings.services.find((s: { name: string; id: string }) => s.name === extra.item)!.id,
                            price: extra.price || 0,
                            serviceDate: extra.serviceDate || draft.checkInDate || new Date().toISOString().split('T')[0],
                          })),
                        selectedMealPlans: draft.mealPlans
                          .filter((mp) => mp.mealPlanId && mp.mealPlanId.trim() !== '')
                          .map((mp) => {
                            const start = new Date(mp.serviceDateStart || draft.checkInDate || new Date().toISOString().split('T')[0]);
                            const end = new Date(mp.serviceDateEnd || draft.checkOutDate || new Date().toISOString().split('T')[0]);
                            const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                            return {
                              mealPlanId: mp.mealPlanId,
                              price: mp.price || 0,
                              serviceDateStart: mp.serviceDateStart || new Date().toISOString().split('T')[0],
                              numberOfDays: diffDays,
                            }
                          }),
                        companions: (draft.companions || [])
                          .filter((c) => c.firstName && c.firstName.trim() !== '')
                          .map((c) => ({
                            firstName: c.firstName,
                            lastName: c.lastName,
                            phoneNumber: c.phoneNumber,
                            email: c.email,
                            address: c.address,
                            nationalId: c.nationalId,
                          })),
                        specialRequests: draft.specialRequests || '',
                        comments: draft.notes || '',
                        discountPercentage: 0,
                        paymentMethod: draft.paymentMethod || 'Card',
                        guarantee: {
                          guaranteeType: draft.guaranteeType || '',
                          guaranteeCode: draft.guaranteeCode || '',
                          cardType: draft.cardType || '',
                          cardCode: draft.cardCode || '',
                          cardHolderName: draft.cardHolderName || '',
                          maskedCardNumber: draft.cardNo ? `****${draft.cardNo.slice(-4)}` : '',
                          tokenizedCardReference: '',
                          expirationDate: draft.cardExpire || '',
                          seriesCodeMasked: draft.cardSeriesCode ? '***' : '',
                          notes: ''
                        }
                      }

                try {
                  await dispatch(createLocalReservation(localReservationPayload)).unwrap()
                    setFinalConfirmationOpen(true)
                    setStep4Page(2)
                  creatingReservationRef.current = false
                  setCreatingReservation(false)
                  setCreatingReservationResultUnknown(false)
                } catch (err) {
                    const message = getErrorMessage(err)
                    console.error('Reservation creation failed:', err)
                    if (isPossiblyStillProcessingError(message)) {
                      setCreatingReservationResultUnknown(true)
                      setCreatingReservation(false)
                      Swal.fire({
                        icon: 'warning',
                        title: 'Reservation may still be processing',
                        text: 'The server did not confirm the result in time. Please check the Reservations list before trying again, so the same reservation is not created twice.',
                        confirmButtonColor: '#0B4EA2',
                      })
                    } else {
                      creatingReservationRef.current = false
                      setCreatingReservation(false)
                      setCreatingReservationResultUnknown(false)
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                        text: 'Failed to confirm reservation: ' + message,
                      confirmButtonColor: '#0B4EA2',
                    })
                    }
                }
                return
              }

                    if (step4Page === 2) {
                      handleClose()
                      return
                    }
                  }

                  if (step < 4 && !validateStep(step)) return
                  setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev))
                }}

              >
                {creatingReservation ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {creatingReservation ? 'Creating reservation...' : creatingReservationResultUnknown ? 'Check Reservations List' : nextLabel}
              </button>
            </div>
          </div>
        ) : null}
        </div>
      </Modal>

      <CheckInProcessModal
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        value={draft}
        onChange={handleUpdateDraft}
        pricing={checkInPricing}
      />

      <ExtendStayModal open={extendStayOpen} onClose={() => setExtendStayOpen(false)} value={draft} />

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <div className="flex w-[480px] flex-col items-center rounded-[32px] bg-white p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/50">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h3 className="mb-3 text-2xl font-bold text-slate-800">Optional Reservation Pending</h3>
          <p className="mb-10 max-w-[340px] text-sm leading-relaxed text-slate-500">
            Your optional reservation has been saved successfully. You can view and download all details in the file below.
          </p>
          
          <div className="mb-10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                  <svg className="h-6 w-6 text-[#0B4EA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-[15px] font-bold text-slate-800">Reservation_Details.pdf</div>
                  <div className="text-[12px] font-medium text-slate-400">2.4 MB • PDF File</div>
                </div>
              </div>
              
              <button 
                type="button"
                className="group flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-[#0B4EA2] hover:shadow-sm"
                onClick={() => alert("Downloading...")}
              >
                <svg className="h-5 w-5 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-2xl bg-[#0B4EA2] py-4 text-[15px] font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#093d81] hover:shadow-blue-900/30 active:scale-[0.98]"
            onClick={() => {
              setSuccessOpen(false)
              handleClose({ skipSave: true })
            }}
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Final Confirmation Success Modal */}
      <Modal open={finalConfirmationOpen} onClose={() => setFinalConfirmationOpen(false)}>
        <div className="flex w-[520px] flex-col items-center rounded-[32px] bg-white p-12 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-inner">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/50">
              <CheckCircle2 className="h-10 w-10" strokeWidth={2.5} />
            </div>
          </div>
          
          <h3 className="mb-4 text-3xl font-extrabold text-slate-800 tracking-tight">Reservation Confirmed!</h3>
          <p className="mb-10 max-w-[380px] text-[15px] leading-relaxed text-slate-500 font-medium">
            The reservation has been successfully processed and synchronized with the hotel system. A confirmation email will be sent to the guest shortly.
          </p>
          
          <div className="mb-10 w-full space-y-3">
            <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Reservation ID</span>
              <span className="text-sm font-extrabold text-[#0B4EA2]">#RES-94285-BRN</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Guest Name</span>
              <span className="text-sm font-extrabold text-slate-800">{draft.firstName} {draft.surName}</span>
            </div>
          </div>

          <div className="flex w-full gap-4">
            <button
              type="button"
              className="flex-1 rounded-2xl border-2 border-slate-100 bg-white py-4 text-[15px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
              onClick={() => setFinalConfirmationOpen(false)}
            >
              View Summary
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl bg-[#0B4EA2] py-4 text-[15px] font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#093d81] hover:shadow-blue-900/30 active:scale-[0.98]"
              onClick={() => {
                setFinalConfirmationOpen(false)
                handleClose()
              }}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
