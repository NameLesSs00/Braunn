import { useEffect, useMemo, useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'

import { getPmsReservationById } from '../../../shared/apis/PmsReservation'
import { getRoomTypeById } from '../../../shared/apis/roomTypesApi'

// import removed

import type { PmsReservationDetails } from '../../../models/PmsReservation'
import type { RoomType } from '../../../models/RoomType'

import { IconImage } from '../../../shared/ui/IconImage'
import { InfoRow } from '../../../widgets/reservations/CheckInProcessModal/InfoRow'
import { Step4Card } from '../../../widgets/reservations/NewReservationModal/steps/step4/Step4Card'
import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'
import { MdMeetingRoom, MdNotes, MdDateRange } from "react-icons/md";
import { LuClock, LuIdCard } from "react-icons/lu";
import { FiLogIn } from "react-icons/fi";

type Props = {
  open: boolean
  onClose: () => void
  reservationId: string | null
  onOpenExtendStay: (reservationId: string) => void
}

function calcNights(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 1

  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1

  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diff)
}

function viewTypeLabel(viewType?: number) {
  if (viewType === 0) return 'SeaView'
  if (viewType === 1) return 'CityView'
  return '-----'
}

function formatDisplayDate(value?: string) {
  if (!value) return '-----'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US')
}

export function ReservationDetailsPopup({ open, onClose, reservationId, onOpenExtendStay }: Props) {
  const [reservation, setReservation] = useState<PmsReservationDetails | null>(null)
  const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (!reservationId) return

    const controller = new AbortController()

    setLoading(true)
    setError(null)
    setReservation(null)
    setRoomType(null)

    void getPmsReservationById(reservationId, controller.signal)
      .then((res) => {
        setReservation(res)
        const roomTypeId = res.reservationRooms?.[0]?.roomTypeId
        if (!roomTypeId) return null
        return getRoomTypeById(roomTypeId, controller.signal)
      })
      .then((rt) => {
        if (rt) setRoomType(rt)
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Failed to load reservation')
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoading(false)
      })

    return () => controller.abort()
  }, [open, reservationId])

  const paymentStatusLabel = useMemo(() => {
    if (!reservation) return '-----'
    return reservation.finance.paymentStatus || 'Pending'
  }, [reservation])

  const confirmedLabel = useMemo(() => {
    if (!reservation) return '-----'
    return reservation.status || '-----'
  }, [reservation])

  const nights = useMemo(() => {
    if (!reservation) return 1
    return calcNights(reservation.checkInDate, reservation.checkOutDate)
  }, [reservation])

  const currency = reservation?.finance?.currency || '$'

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div className="text-lg font-semibold text-white">Reservation Details</div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 px-8 pb-8 pt-7">
          {loading ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">Loading...</div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
          ) : !reservation ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">No reservation selected</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-[#0B4EA2]">
                    {confirmedLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600">
                    {paymentStatusLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Step4Card title="Guest Information" titleIconBgClassName="bg-blue-100">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Full Name" value={reservation.guest.fullName || '-----'} />
                    <InfoRow label="Phone Number" value={reservation.guest.phone || '-----'} />
                    <InfoRow label="Email Address" value={reservation.guest.email || '-----'} />
                    <InfoRow label="ID Number" value={reservation.guest.idNumber || '-----'} />
                    <InfoRow label="Nationality" value={reservation.guest.nationality || '-----'} />
                    <InfoRow label="Booking source" value={reservation.channelName || '-----'} />
                  </div>
                </Step4Card>

                <Step4Card title="Room Information" titleIconSrc={MdMeetingRoom} titleIconBgClassName="bg-violet-100">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Room count" value={reservation.reservationRooms?.length.toString() || '-----'} />
                    <InfoRow label="Room view" value={viewTypeLabel(roomType?.viewType)} />
                    <InfoRow label="Room Type" value={reservation.roomTypeName ?? '-----'} />
                    <InfoRow label="Maximum Guests" value={roomType ? `${roomType.maxGuests} guests` : '-----'} />
                    <InfoRow label="Price per Night" value={reservation.reservationRooms?.[0]?.pricePerNight ? formatMoney(reservation.reservationRooms[0].pricePerNight, currency) : '-----'} />
                  </div>
                </Step4Card>
              </div>

              <Step4Card title="Stay Details" titleIconSrc={MdDateRange} titleIconBgClassName="bg-orange-100">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                  <InfoRow label="Check-in Date" value={formatDisplayDate(reservation.checkInDate)} />
                  <InfoRow label="Check-out Date" value={formatDisplayDate(reservation.checkOutDate)} />
                  <InfoRow label="Number of Nights" value={nights ? `${nights} nights` : '-----'} />
                  <InfoRow label="Number of Guests" value={reservation.companions ? `${reservation.companions.length + 1}` : '1'} />
                </div>
              </Step4Card>

              <Step4Card title="Payment Information" titleIconBgClassName="bg-emerald-100">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-[12px] text-slate-500">Payment Method</div>
                      <div className="text-[13px] font-semibold text-slate-800">
                        {reservation.finance.lastPaymentMethod || '-----'}
                      </div>
                    </div>

                    <div className="space-y-1 md:text-right">
                      <div className="text-[12px] text-slate-500">Payment Status</div>
                      <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600">
                        {paymentStatusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="grid grid-cols-1 gap-2 text-[12px] text-slate-600 md:grid-cols-2">
                      {reservation.finance.baseRoomAmount > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Base Room Amount</span>
                          <span className="font-semibold text-slate-800">{formatMoney(reservation.finance.baseRoomAmount, currency)}</span>
                        </div>
                      )}
                      {reservation.finance.totalMealPlanCost > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Meal Plans</span>
                          <span className="font-semibold text-slate-800">{formatMoney(reservation.finance.totalMealPlanCost, currency)}</span>
                        </div>
                      )}
                      {reservation.finance.totalAdditionalServices > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Additional Services</span>
                          <span className="font-semibold text-slate-800">{formatMoney(reservation.finance.totalAdditionalServices, currency)}</span>
                        </div>
                      )}
                      {reservation.finance.taxAmount > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Taxes</span>
                          <span className="font-semibold text-slate-800">{formatMoney(reservation.finance.taxAmount, currency)}</span>
                        </div>
                      )}
                      {reservation.finance.discountAmount > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Discount</span>
                          <span className="font-semibold text-emerald-600">-{formatMoney(reservation.finance.discountAmount, currency)}</span>
                        </div>
                      )}
                      <div className="col-span-2 mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                        <span className="font-semibold text-slate-700">Grand Total</span>
                        <span className="font-bold text-slate-900">{formatMoney(reservation.finance.grandTotal, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Deposit Required</span>
                        <span className="font-semibold text-slate-800">{formatMoney(reservation.finance.depositAmount, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Amount Paid</span>
                        <span className="font-semibold text-emerald-600">{formatMoney(reservation.finance.paidAmount, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Remaining Balance</span>
                        <span className="font-semibold text-orange-600">{formatMoney(reservation.finance.remainingBalance, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Step4Card>

              {reservation.mealPlans && reservation.mealPlans.length > 0 && (
                <Step4Card title="Meal Plans" titleIconBgClassName="bg-teal-100">
                  <div className="space-y-3">
                    {reservation.mealPlans.map((mp: any, i: number) => (
                      <div key={i} className="flex items-start justify-between rounded-xl bg-slate-50 px-4 py-3 text-[12px] text-slate-700">
                        <div>
                          <div className="font-semibold text-slate-800">{mp.mealPlanName || mp.mealPlanCode}</div>
                          <div className="mt-1 text-slate-500">
                            {formatDisplayDate(mp.serviceDateStart)} → {formatDisplayDate(mp.serviceDateEnd)}
                            {mp.numberOfNights ? ` · ${mp.numberOfNights} night(s)` : ''}
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">{formatMoney(mp.totalCost, currency)}</span>
                      </div>
                    ))}
                  </div>
                </Step4Card>
              )}

              {reservation.additionalServices && reservation.additionalServices.length > 0 && (
                <Step4Card title="Additional Services" titleIconBgClassName="bg-purple-100">
                  <div className="space-y-3">
                    {reservation.additionalServices.map((svc: any, i: number) => (
                      <div key={i} className="flex items-start justify-between rounded-xl bg-slate-50 px-4 py-3 text-[12px] text-slate-700">
                        <div>
                          <div className="font-semibold text-slate-800">{svc.serviceName}</div>
                          <div className="mt-1 text-slate-500">
                            Qty: {svc.quantity} · {formatDisplayDate(svc.serviceDate)}
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">{formatMoney(svc.totalPrice, currency)}</span>
                      </div>
                    ))}
                  </div>
                </Step4Card>
              )}

              {(reservation.specialRequests || reservation.comments) && (
                <Step4Card title="Special Requests" titleIconSrc={MdNotes} titleIconBgClassName="bg-violet-100">
                  <div className="rounded-xl bg-[#F7F4FF] p-4 text-sm text-slate-700">
                    {reservation.specialRequests}
                    {reservation.specialRequests && reservation.comments && <br />}
                    {reservation.comments}
                  </div>
                </Step4Card>
              )}

              <Step4Card title="Booking Information" titleIconSrc={LuIdCard} titleIconBgClassName="bg-slate-100">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <InfoRow label="Created On" value={formatDisplayDate(reservation.guest.createdAt || reservation.createdAt)} />
                  <InfoRow label="Reservation ID" value={reservation.bookingReference || reservation.id} />
                  <InfoRow label="Created By" value="System" />
                </div>
              </Step4Card>

              <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  className="h-12 rounded-xl border border-slate-300 px-16 text-sm font-semibold text-slate-700"
                  onClick={onClose}
                >
                  cancel
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
                      Extend stay
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
