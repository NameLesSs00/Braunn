import { useMemo } from 'react'
import { Step4Card } from '../../widgets/reservations/NewReservationModal/steps/step4/Step4Card'

import { MdMeetingRoom, MdNotes } from "react-icons/md";
import { LuClock, LuIdCard } from "react-icons/lu";
import { FiLogIn } from "react-icons/fi";
import { InfoRow } from '../../widgets/reservations/CheckInProcessModal/InfoRow'
import { IconImage } from '../../shared/ui/IconImage'
import { Modal } from '../../shared/ui/Modal'
import { formatMoney } from '../../widgets/reservations/CheckInProcessModal/utils'
import { MdDateRange } from "react-icons/md";
import { useEffect, useState } from 'react'
import { getPmsReservationById } from '../../shared/apis/PmsReservation'
import type { PmsReservationDetails } from '../../models/PmsReservation'

type InHouseRowData = {
  resId: string
  guestName: string
  roomNo: string
  roomType: string
  floor: string
  checkIn: string
  checkOut: string
  guests: number
  status: 'In house' | 'Checked out' | 'Cancelled'
  payment: string
  source: string
}

type Props = {
  open: boolean
  onClose: () => void
  data: InHouseRowData | null
}

function calcNights(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 1
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diff)
}

function formatDisplayDate(value?: string) {
  if (!value) return '-----'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US')
}

export function InHouseReservationDetailsPopup({ open, onClose, data }: Props) {
  const [reservation, setReservation] = useState<PmsReservationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !data?.resId) return

    const controller = new AbortController()

    setLoading(true)
    setError(null)
    setReservation(null)

    getPmsReservationById(data.resId, controller.signal)
      .then((res) => setReservation(res))
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Failed to load reservation')
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoading(false)
      })

    return () => controller.abort()
  }, [open, data?.resId])

  const nights = useMemo(() => {
    if (!data) return 1
    return calcNights(data.checkIn, data.checkOut)
  }, [data])

  const paymentStatusLabel = useMemo(() => {
    if (reservation?.finance?.paymentStatus) return reservation.finance.paymentStatus
    if (!data) return '-----'
    return data.payment === 'deposit paid' ? 'DEPOSIT PAID' : data.payment
  }, [data, reservation])

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
          {!data ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">No reservation selected</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-[#0B4EA2]">
                    In house
                  </span>
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600">
                    {paymentStatusLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Step4Card title="Guest Information" titleIconBgClassName="bg-blue-100">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Full Name" value={reservation?.guest?.fullName || data.guestName || '-----'} />
                    <InfoRow label="Phone Number" value={reservation?.guest?.phone || '-----'} />
                    <InfoRow label="Email Address" value={reservation?.guest?.email || '-----'} />
                    <InfoRow label="ID Number" value={reservation?.guest?.idNumber || '-----'} />
                    <InfoRow label="Nationality" value={reservation?.guest?.nationality || '-----'} />
                    <InfoRow label="Booking source" value={reservation?.bookingSource || data.source || '-----'} />
                  </div>
                </Step4Card>

                <Step4Card title="Room Information" titleIconSrc={MdMeetingRoom} titleIconBgClassName="bg-violet-100">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Room Number" value={data.roomNo || '-----'} />
                    <InfoRow label="Room Type" value={reservation?.roomTypeName || data.roomType || '-----'} />
                    <InfoRow label="Floor" value={data.floor || '-----'} />
                    <InfoRow label="Maximum Guests" value={`${data.guests} guests`} />
                  </div>
                </Step4Card>
              </div>

              <Step4Card title="Stay Details" titleIconSrc={MdDateRange} titleIconBgClassName="bg-orange-100">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                  <InfoRow label="Check-in Date" value={formatDisplayDate(data.checkIn)} />
                  <InfoRow label="Check-out Date" value={formatDisplayDate(data.checkOut)} />
                  <InfoRow label="Number of Nights" value={`${nights} nights`} />
                  <InfoRow label="Number of Guests" value={`${data.guests}`} />
                </div>
              </Step4Card>

              <Step4Card title="Payment Information" titleIconBgClassName="bg-emerald-100">
                <div className="flex flex-col gap-4">
                  {loading && <div className="text-sm text-slate-500">Loading payment details...</div>}
                  {error && <div className="text-sm text-rose-500">{error}</div>}
                  {reservation && (
                    <>
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
                          <div className="flex items-center justify-between">
                            <span>Total Amount</span>
                            <span className="font-semibold text-slate-800">{formatMoney(reservation.finance.grandTotal)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Deposit Required</span>
                            <span className="font-semibold text-slate-800">{formatMoney(reservation.finance.depositAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Amount Paid</span>
                            <span className="font-semibold text-emerald-600">{formatMoney(reservation.finance.paidAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Remaining Balance</span>
                            <span className="font-semibold text-orange-600">{formatMoney(reservation.finance.remainingBalance)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {!loading && !error && !reservation && (
                    <div className="text-sm text-slate-500">No payment details available</div>
                  )}
                  </div>
                </div>
              </Step4Card>

              <Step4Card title="Special Requests" titleIconSrc={MdNotes} titleIconBgClassName="bg-violet-100">
                <div className="rounded-xl bg-[#F7F4FF] p-4 text-sm text-slate-700">-----</div>
              </Step4Card>

              <Step4Card title="Booking Information" titleIconSrc={LuIdCard} titleIconBgClassName="bg-slate-100">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <InfoRow label="Created On" value="-----" />
                  <InfoRow label="Reservation ID" value={data.resId} />
                  <InfoRow label="Created By" value="-----" />
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
                  >
                    <span className="inline-flex items-center gap-2">
                      <IconImage src={LuClock} alt="" className="h-4 w-4 opacity-80" />
                      Extend stay
                    </span>
                  </button>

                  <button
                    type="button"
                    className="h-12 rounded-xl bg-[#0B4EA2] px-12 text-sm font-semibold text-white"
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
