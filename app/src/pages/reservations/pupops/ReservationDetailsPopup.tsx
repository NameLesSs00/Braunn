import { useEffect, useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'

import { getPmsReservationFolio } from '../../../shared/apis/PmsReservation'

import type { PmsReservationFolio } from '../../../models/PmsReservation'

import { IconImage } from '../../../shared/ui/IconImage'
import { InfoRow } from '../../../widgets/reservations/CheckInProcessModal/InfoRow'
import { Step4Card } from '../../../widgets/reservations/NewReservationModal/steps/step4/Step4Card'
import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'
import { MdMeetingRoom, MdDateRange } from 'react-icons/md'
import { LuClock, LuIdCard, LuReceipt, LuCreditCard, LuTag, LuUtensilsCrossed, LuConciergeBell } from 'react-icons/lu'
import { FiLogIn } from 'react-icons/fi'

type Props = {
  open: boolean
  onClose: () => void
  reservationId: string | null
  onOpenExtendStay: (reservationId: string) => void
}

function formatDisplayDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US')
}

function PaymentStatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase()
  const cls =
    s === 'paid' || s === 'fullypaid' || s === 'fully paid'
      ? 'bg-emerald-50 text-emerald-700'
      : s === 'overdue'
        ? 'bg-rose-50 text-rose-600'
        : 'bg-orange-50 text-orange-600'
  return (
    <span className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold ${cls}`}>
      {status || 'Pending'}
    </span>
  )
}

export function ReservationDetailsPopup({ open, onClose, reservationId, onOpenExtendStay }: Props) {
  const [folio, setFolio] = useState<PmsReservationFolio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !reservationId) return

    const controller = new AbortController()

    setLoading(true)
    setError(null)
    setFolio(null)

    void getPmsReservationFolio(reservationId, controller.signal)
      .then((res) => {
        setFolio(res)
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Failed to load reservation details')
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoading(false)
      })

    return () => controller.abort()
  }, [open, reservationId])

  const currency = folio?.currency || '€'

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold text-white">Reservation Details</div>
            {folio && (
              <PaymentStatusBadge status={folio.paymentStatus} />
            )}
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

        {/* ── Body ── */}
        <div className="flex-1 px-8 pb-8 pt-7">
          {loading ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">Loading…</div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
          ) : !folio ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">No reservation selected</div>
          ) : (
            <div className="space-y-6">

              {/* ── Guest + Status header row ── */}
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-slate-800">{folio.guestName}</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-[#0B4EA2]">
                    {folio.roomTypeName}
                  </span>
                  <PaymentStatusBadge status={folio.paymentStatus} />
                </div>
              </div>

              {/* ── Row 1: Stay Details + Room & Channel ── */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Step4Card title="Stay Details" titleIconSrc={MdDateRange} titleIconBgClassName="bg-orange-100">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Check-in Date" value={formatDisplayDate(folio.checkInDate)} />
                    <InfoRow label="Check-out Date" value={formatDisplayDate(folio.checkOutDate)} />
                    <InfoRow label="Number of Nights" value={`${folio.numberOfNights} night(s)`} />
                    <InfoRow label="Room Number" value={folio.roomNumber || '—'} />
                  </div>
                </Step4Card>

                <Step4Card title="Room & Channel" titleIconSrc={MdMeetingRoom} titleIconBgClassName="bg-violet-100">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Room Type" value={folio.roomTypeName || '—'} />
                    <InfoRow label="Booking Channel" value={folio.channelName || '—'} />
                    {folio.externalReservationId && (
                      <InfoRow label="External Ref." value={folio.externalReservationId} />
                    )}
                    {folio.rateTigerConfirmedId && (
                      <InfoRow label="RateTiger ID" value={folio.rateTigerConfirmedId} />
                    )}
                    {folio.roomNumbers && folio.roomNumbers.length > 0 && (
                      <InfoRow label="Assigned Rooms" value={folio.roomNumbers.join(', ')} />
                    )}
                  </div>
                </Step4Card>
              </div>

              {/* ── Room Rate Lines ── */}
              {folio.roomRateLines && folio.roomRateLines.length > 0 && (
                <Step4Card title="Room Rate Breakdown" titleIconSrc={LuIdCard} titleIconBgClassName="bg-slate-100">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-[12px] text-slate-700">
                      <thead>
                        <tr className="bg-[#EAF2FF] text-[11px] font-semibold text-slate-600">
                          <th className="px-4 py-2 text-left">Rate Plan</th>
                          <th className="px-4 py-2 text-left">Start</th>
                          <th className="px-4 py-2 text-left">End</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {folio.roomRateLines.map((line, i) => (
                          <tr key={i} className={i % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white'}>
                            <td className="px-4 py-2 font-medium">{line.ratePlanCode}</td>
                            <td className="px-4 py-2">{formatDisplayDate(line.startDate)}</td>
                            <td className="px-4 py-2">{formatDisplayDate(line.endDate)}</td>
                            <td className="px-4 py-2 text-right font-semibold text-slate-800">
                              {formatMoney(line.amountAfterTax, currency)}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td colSpan={3} className="px-4 py-2 font-semibold text-slate-700">Total Room Rate</td>
                          <td className="px-4 py-2 text-right font-bold text-slate-900">
                            {formatMoney(folio.totalRoomRate, currency)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Step4Card>
              )}

              {/* ── Charges ── */}
              {folio.charges && folio.charges.length > 0 && (
                <Step4Card title="Charges" titleIconSrc={LuReceipt} titleIconBgClassName="bg-blue-100">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-[12px] text-slate-700">
                      <thead>
                        <tr className="bg-[#EAF2FF] text-[11px] font-semibold text-slate-600">
                          <th className="px-4 py-2 text-left">Department</th>
                          <th className="px-4 py-2 text-left">Description</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-center">Qty</th>
                          <th className="px-4 py-2 text-right">Unit</th>
                          <th className="px-4 py-2 text-right">Tax</th>
                          <th className="px-4 py-2 text-right">Total</th>
                          <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {folio.charges.map((charge, i) => (
                          <tr
                            key={i}
                            className={[
                              i % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                              charge.isVoided ? 'opacity-50' : '',
                            ].join(' ')}
                          >
                            <td className="px-4 py-2 font-medium">{charge.department}</td>
                            <td className="px-4 py-2">{charge.description}</td>
                            <td className="px-4 py-2 text-slate-500">{formatDisplayDate(charge.postingDate)}</td>
                            <td className="px-4 py-2 text-center">{charge.quantity}</td>
                            <td className="px-4 py-2 text-right">{formatMoney(charge.unitAmount, currency)}</td>
                            <td className="px-4 py-2 text-right">{formatMoney(charge.taxAmount, currency)}</td>
                            <td className="px-4 py-2 text-right font-semibold text-slate-800">
                              {formatMoney(charge.amountAfterTax, currency)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {charge.isVoided ? (
                                <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                                  Voided
                                </span>
                              ) : charge.isPostedToFolio ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Posted
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Step4Card>
              )}

              {/* ── Payments ── */}
              <Step4Card title="Payments" titleIconSrc={LuCreditCard} titleIconBgClassName="bg-emerald-100">
                {folio.payments && folio.payments.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-[12px] text-slate-700">
                      <thead>
                        <tr className="bg-[#EAF2FF] text-[11px] font-semibold text-slate-600">
                          <th className="px-4 py-2 text-left">Method</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Reference</th>
                          <th className="px-4 py-2 text-center">Status</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {folio.payments.map((pay, i) => (
                          <tr key={i} className={i % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white'}>
                            <td className="px-4 py-2 font-medium">{pay.paymentMethod}</td>
                            <td className="px-4 py-2 text-slate-500">{formatDisplayDate(pay.paymentDate)}</td>
                            <td className="px-4 py-2 text-slate-500">{pay.reference || '—'}</td>
                            <td className="px-4 py-2 text-center">
                              <PaymentStatusBadge status={pay.status} />
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-emerald-700">
                              {formatMoney(pay.amount, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    <LuCreditCard className="h-4 w-4 shrink-0 opacity-40" />
                    No payments recorded
                  </div>
                )}
              </Step4Card>

              {/* ── Meal Plans ── */}
              {folio.mealPlans && folio.mealPlans.length > 0 && (
                <Step4Card title="Meal Plans" titleIconSrc={LuUtensilsCrossed} titleIconBgClassName="bg-teal-100">
                  <div className="space-y-3">
                    {folio.mealPlans.map((mp, i) => (
                      <div key={i} className="flex items-start justify-between rounded-xl bg-slate-50 px-4 py-3 text-[12px] text-slate-700">
                        <div>
                          <div className="font-semibold text-slate-800">{mp.mealPlanName || mp.mealPlanCode}</div>
                          <div className="mt-1 text-slate-500">
                            {formatDisplayDate(mp.serviceDateStart)} → {formatDisplayDate(mp.serviceDateEnd)}
                            {mp.numberOfNights ? ` · ${mp.numberOfNights} night(s)` : ''}
                            {mp.pricePerDay ? ` · ${formatMoney(mp.pricePerDay, currency)}/night` : ''}
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">{formatMoney(mp.totalCost, currency)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2 text-[12px] font-semibold text-slate-700">
                      <span>Total Meal Plans</span>
                      <span>{formatMoney(folio.totalMealPlanCost, currency)}</span>
                    </div>
                  </div>
                </Step4Card>
              )}

              {/* ── Additional Services ── */}
              {folio.services && folio.services.length > 0 && (
                <Step4Card title="Additional Services" titleIconSrc={LuConciergeBell} titleIconBgClassName="bg-purple-100">
                  <div className="space-y-3">
                    {folio.services.map((svc, i) => (
                      <div key={i} className="flex items-start justify-between rounded-xl bg-slate-50 px-4 py-3 text-[12px] text-slate-700">
                        <div>
                          <div className="font-semibold text-slate-800">{svc.serviceName}</div>
                          <div className="mt-1 text-slate-500">
                            Qty: {svc.quantity} · {formatDisplayDate(svc.serviceDate)}
                            {svc.unitPrice ? ` · ${formatMoney(svc.unitPrice, currency)} each` : ''}
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">{formatMoney(svc.totalPrice, currency)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2 text-[12px] font-semibold text-slate-700">
                      <span>Total Services</span>
                      <span>{formatMoney(folio.totalAdditionalServices, currency)}</span>
                    </div>
                  </div>
                </Step4Card>
              )}

              {/* ── Discounts ── */}
              {folio.discounts && folio.discounts.length > 0 && (
                <Step4Card title="Discounts" titleIconSrc={LuTag} titleIconBgClassName="bg-rose-100">
                  <div className="space-y-3">
                    {folio.discounts.map((disc, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-[12px] text-slate-700">
                        <span className="font-semibold text-slate-800">{disc.discountName}</span>
                        <span className="font-bold text-emerald-600">-{formatMoney(disc.calculatedAmount, currency)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2 text-[12px] font-semibold text-slate-700">
                      <span>Total Discounts</span>
                      <span className="text-emerald-600">-{formatMoney(folio.totalDiscounts, currency)}</span>
                    </div>
                  </div>
                </Step4Card>
              )}

              {/* ── Financial Summary ── */}
              <Step4Card title="Financial Summary" titleIconBgClassName="bg-emerald-100">
                <div className="flex flex-col gap-4">
                  {/* Charge breakdown from totals */}
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="space-y-2 text-[12px] text-slate-600">
                      {folio.totals.roomChargesTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Room Charges</span>
                          <span className="font-semibold text-slate-800">{formatMoney(folio.totals.roomChargesTotal, currency)}</span>
                        </div>
                      )}
                      {folio.totals.serviceChargesTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Service Charges</span>
                          <span className="font-semibold text-slate-800">{formatMoney(folio.totals.serviceChargesTotal, currency)}</span>
                        </div>
                      )}
                      {folio.totals.mealChargesTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Meal Charges</span>
                          <span className="font-semibold text-slate-800">{formatMoney(folio.totals.mealChargesTotal, currency)}</span>
                        </div>
                      )}
                      {folio.totals.packageChargesTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Package Charges</span>
                          <span className="font-semibold text-slate-800">{formatMoney(folio.totals.packageChargesTotal, currency)}</span>
                        </div>
                      )}
                      {folio.totals.manualChargesTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Manual Charges</span>
                          <span className="font-semibold text-slate-800">{formatMoney(folio.totals.manualChargesTotal, currency)}</span>
                        </div>
                      )}
                      {folio.totals.taxTotal > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Tax</span>
                          <span className="font-semibold text-slate-800">{formatMoney(folio.totals.taxTotal, currency)}</span>
                        </div>
                      )}
                      {folio.totalDiscounts > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Discounts</span>
                          <span className="font-semibold text-emerald-600">-{formatMoney(folio.totalDiscounts, currency)}</span>
                        </div>
                      )}

                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">Grand Total</span>
                          <span className="text-base font-bold text-slate-900">{formatMoney(folio.grandTotal, currency)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span>Amount Paid</span>
                          <span className="font-semibold text-emerald-600">{formatMoney(folio.paidAmount, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Remaining Balance</span>
                          <span className="font-semibold text-orange-600">{formatMoney(folio.remainingBalance, currency)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span>Payment Status</span>
                          <PaymentStatusBadge status={folio.paymentStatus} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Step4Card>

              {/* ── Footer Actions ── */}
              <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  className="h-12 rounded-xl border border-slate-300 px-16 text-sm font-semibold text-slate-700"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <div className="flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    className="h-12 rounded-xl border border-[#0B4EA2] px-12 text-sm font-semibold text-[#0B4EA2]"
                    onClick={() => {
                      if (!reservationId) return
                      onOpenExtendStay(reservationId)
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <IconImage src={LuClock} alt="" className="h-4 w-4 opacity-80" />
                      Extend Stay
                    </span>
                  </button>

                  <button
                    type="button"
                    className="h-12 rounded-xl bg-[#0B4EA2] px-12 text-sm font-semibold text-white"
                    onClick={() => {}}
                  >
                    <span className="inline-flex items-center gap-2">
                      <IconImage src={FiLogIn} alt="" className="h-4 w-4 opacity-95" />
                      Check-in Guest
                    </span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
