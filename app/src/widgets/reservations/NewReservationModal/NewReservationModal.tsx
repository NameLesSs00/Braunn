import { useMemo, useState, useEffect } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { updateDraft, resetDraft } from '../../../features/reservations/draftSlice'
import { addNotification } from '../../../features/notifications/notificationsSlice'
import { syncRTReservation, syncRTOps } from '../../../features/rt/rtSlice'
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
  onClose: () => void
}

type Step = 1 | 2 | 3 | 4

type Step4Page = 1 | 2

export function NewReservationModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const draft = useAppSelector((state) => state.reservationDraft)
  const ariState = useAppSelector((state) => state.ari)
  const rt = useAppSelector((state) => state.rt)
  const optionalReservations = useAppSelector((state) => state.optionalReservations)


  const [step, setStep] = useState<Step>(1)
  const [step4Page, setStep4Page] = useState<Step4Page>(1)

  const [checkInOpen, setCheckInOpen] = useState(false)
  const [extendStayOpen, setExtendStayOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [finalConfirmationOpen, setFinalConfirmationOpen] = useState(false)

  const handleUpdateDraft = (patch: any) => {
    dispatch(updateDraft(patch))
  }

  const handleClose = () => {
    // Only reset the draft if we've successfully finished the reservation process
    if (step === 4 && step4Page === 2) {
      dispatch(resetDraft())
      setStep(1)
      setStep4Page(1)
    } else {
      // Otherwise, save it as a notification and keep the state for resume
      if (draft.firstName || draft.surName) {
        dispatch(
          addNotification({
            type: 'reservation_draft',
            firstName: draft.firstName,
            surName: draft.surName,
            draft: draft,
          }),
        )
      }
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

  const canGoBack = step > 1
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

  const checkInPricing = useMemo(() => computePricing(draft, nightsForPricing), [draft, nightsForPricing])

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

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
            <div className="text-lg font-semibold text-white">{title}</div>
            <div className="flex items-center gap-4">
              {draft.isGroupReservation ? (
                <div className="inline-flex h-8 items-center rounded-full bg-emerald-100 px-5 text-sm font-semibold text-emerald-800">
                  Group
                </div>
              ) : null}

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
              <NewReservationStep1 value={draft} onChange={handleUpdateDraft} />
            ) : step === 2 ? (
              <NewReservationStep2 value={draft} onChange={handleUpdateDraft} />
            ) : step === 3 ? (
              <NewReservationStep3 value={draft} />
            ) : step === 4 ? (
              <NewReservationStep4
                value={draft}
                onChange={handleUpdateDraft}
                page={step4Page}
                onOpenCheckIn={openCheckInProcess}
                onOpenExtendStay={openExtendStay}
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
              {step === 3 && (
                <button
                  type="button"
                  className={[
                    "h-12 rounded-xl border border-[#0B4EA2] px-8 text-sm font-semibold text-[#0B4EA2] hover:bg-blue-50 transition-colors flex items-center gap-2",
                    optionalReservations.status === 'loading' ? 'opacity-80 cursor-not-allowed' : ''
                  ].join(' ')}
                  disabled={optionalReservations.status === 'loading'}
                  onClick={() => {
                    const payload = {
                      guestName: `${draft.firstName} ${draft.surName}`.trim() || 'Guest',
                      email: draft.email || '',
                      expectedCheckIn: draft.checkInDate ? new Date(draft.checkInDate).toISOString() : '',
                      expectedCheckOut: draft.checkOutDate ? new Date(draft.checkOutDate).toISOString() : '',
                      totalAmount: checkInPricing.totalAmount || 0,
                      expirationDate: draft.optionExpiryDate ? new Date(draft.optionExpiryDate).toISOString() : (draft.checkInDate ? new Date(draft.checkInDate).toISOString() : new Date().toISOString())
                    }

                    dispatch(createOptionalReservation(payload)).unwrap()
                      .then(() => {
                        setSuccessOpen(true)
                      })
                      .catch((err) => {
                        console.error('Optional reservation failed:', err)
                        alert('Failed to save optional reservation: ' + err)
                      })
                  }}
                >
                  {optionalReservations.status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save As Optional Reservation
                </button>

              )}

              <button
                type="button"
                className={[
                  'h-12 rounded-xl px-16 text-sm font-semibold flex items-center justify-center gap-2',
                  'bg-[#0B4EA2] text-white',
                  rt.status === 'loading' ? 'opacity-80 cursor-not-allowed' : '',
                ].join(' ')}
                disabled={rt.status === 'loading'}
                onClick={async () => {
                  if (step === 4) {
                    if (step4Page === 1) {
                      // Generate nightly rates for the payload
                      const nightlyRates = []
                      if (draft.checkInDate && draft.checkOutDate) {
                        const start = new Date(draft.checkInDate)
                        const end = new Date(draft.checkOutDate)
                        
                        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                          const dateStr = d.toISOString().split('T')[0]
                          const rateMatch = ariState.rates.find(r => {
                            if (!r.date) return false
                            const rDateStr = r.date.split(' ')[0]
                            return (
                              r.invTypeCode === draft.ratePlan &&
                              r.ratePlanCode === draft.rateCode &&
                              rDateStr === dateStr
                            )
                          })

                          const rate = rateMatch?.additionalGuestAmounts[0]?.amount ?? 0
                          const total = rateMatch?.baseGuestAmounts[0]?.amountAfterTax ?? 0
                          
                          const effectiveDate = new Date(d)
                          const expireDate = new Date(d)
                          expireDate.setDate(expireDate.getDate() + 1)

                          nightlyRates.push({
                            amountAfterTax: total,
                            amountBeforeTax: rate,
                            effectiveDate: effectiveDate.toISOString(),
                            expireDate: expireDate.toISOString()
                          })
                        }
                      }

                      const channelName = draft.bookingSource === 'OTA' ? (draft.otaSource || 'OTA') : (draft.bookingSource || 'Direct')

                      // Prepare RT Payload with full reservation structure
                      const totalAfterTax = nightlyRates.reduce((acc, curr) => acc + curr.amountAfterTax, 0)
                      const totalBeforeTax = nightlyRates.reduce((acc, curr) => acc + curr.amountBeforeTax, 0)

                      const rtPayload = {
                        hotelReservation: {
                          createDateTime: new Date().toISOString(),
                          creatorID: draft.creatorID || "system",
                          currency: "EUR",
                          hotelCode: "57928",
                          resStatus: draft.reservationStatus || 'commit',
                          timeStamp: new Date().toISOString(),
                          success: true,
                          error: {
                            type: "",
                            errorCode: ""
                          },
                          uniqueID: {
                            idValue: "0",
                            type: "14"
                          },
                          pos: {
                            channelCode: "12",
                            channelName: channelName,
                          },
                          guarantee: {
                            guaranteeCode: "",
                            guaranteeType: draft.paymentMethod || "None",
                            paymentCard: {
                              cardCode: draft.cardCode || "",
                              cardHolderName: draft.cardHolderName || "",
                              cardNo: draft.cardNo || "",
                              cardType: draft.cardType || "",
                              expire: draft.cardExpire || "",
                              seriesCode: draft.cardSeriesCode || ""
                            }
                          },
                          depositAmount: Number(draft.paidAmount) || 0,
                          guestDetails: [
                            {
                              personName: {
                                firstName: draft.firstName,
                                middleName: draft.middleName,
                                salutation: draft.salutation,
                                surName: draft.surName,
                              },
                              email: draft.email,
                              guestID: draft.creatorID || "1",
                              telePhone: {
                                phoneNo: draft.phone,
                                locationType: "Home",
                                phoneTechType: "Voice"
                              },
                              address: {
                                addressLine: draft.addressLine || "",
                                addressType: draft.addressType || "Home",
                                city: draft.city || "",
                                countryCode: draft.countryCode || draft.nationality || "",
                                postalCode: draft.postalCode || "",
                                state: draft.state || ""
                              },
                              profileType: "Guest"
                            },
                          ],
                          roomStays: [
                            {
                              roomStayID: "1",
                              isGuestPerRoom: "true",
                              mealCode: draft.mealPlan || "none",
                              mealPlanIndicator: draft.mealPlan ? "true" : "false",
                              comments: [
                                {
                                  guestViewable: "true",
                                  text: draft.specialRequests,
                                },
                              ],
                              specialRequests: [
                                {
                                  requestCode: "Note",
                                  text: draft.notes,
                                },
                              ],
                              roomRates: [
                                {
                                  invCode: draft.ratePlan,
                                  numberOfUnits: Number(draft.nights) || 1,


                                  ratePlanCode: draft.rateCode,
                                  rates: nightlyRates
                                }
                              ],
                              timeSpan: {
                                start: draft.checkInDate ? new Date(draft.checkInDate).toISOString() : '',
                                end: draft.checkOutDate ? new Date(draft.checkOutDate).toISOString() : '',
                              },
                              totalPrice: {
                                amountAfterTax: totalAfterTax,
                                amountBeforeTax: totalBeforeTax,
                                taxAmount: totalAfterTax - totalBeforeTax
                              },
                              guestCount: [
                                { ageQualifyingCode: '10', count: Number(draft.adultCount) || 0 },
                                { ageQualifyingCode: '8', count: Number(draft.childCount) || 0 }
                              ],
                              guestIDs: [draft.creatorID || "1"]
                            },
                          ],
                          resGlobalInfo: {
                            hotelReservationIDs: [
                              {
                                resIDType: "14",
                                resIDValue: "MM"
                              }
                            ]
                          }
                        },
                      }

                dispatch(syncRTOps(rtPayload)).unwrap()
                  .then(() => {
                    setFinalConfirmationOpen(true)
                    setStep4Page(2)
                  })
                  .catch((err) => {
                    console.error('Reservation sync failed:', err)
                    alert('Failed to confirm reservation: ' + err)
                  })
                return
              }

                    if (step4Page === 2) {
                      handleClose()
                      return
                    }
                  }

                  setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev))
                }}

              >
                {rt.status === 'loading' && step === 4 && step4Page === 1 ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                {nextLabel}
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
              onClose()
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
