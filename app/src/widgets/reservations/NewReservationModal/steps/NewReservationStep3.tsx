import { IconImage } from '../../../../shared/ui/IconImage'
import { formatMoney } from '../../CheckInProcessModal/utils'
import { useMemo } from 'react'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { Pencil } from 'lucide-react'
import { IconType } from "react-icons"
import type { ReservationDraft } from '../../../../features/reservations/draftSlice'
import { MdEmail, MdContactPhone, MdNotes, MdMeetingRoom, MdDateRange } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { BsTelephone } from "react-icons/bs";
import { LuIdCard } from "react-icons/lu";
import { useAppSelector } from '../../../../store/hooks'

countries.registerLocale(enLocale)

type Props = {
  value: ReservationDraft
}

function InfoRow({
  label,
  value,
  iconSrc,
  valueClassName,
}: {
  label: string
  value: string
  iconSrc?: string | IconType;
  valueClassName?: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      {iconSrc ? (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100">
          <IconImage src={iconSrc} alt="" className="h-3.5 w-3.5 opacity-80" />
        </div>
      ) : null}
      <div className="min-w-0">
        <div className="text-[12px] text-slate-500">{label}</div>
        <div
          className={[
            'min-w-0 text-[13px] font-medium text-slate-800',
            valueClassName ?? 'truncate',
          ]
            .filter(Boolean)
            .join(' ')}
          title={value || '—'}
        >
          {value || '—'}
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  children,
  onEdit,
  titleIconSrc,
  titleIconBgClassName,
}: {
  title: string
  children: React.ReactNode
  onEdit?: () => void
  titleIconSrc?: string | IconType
  titleIconBgClassName?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {titleIconSrc ? (
            <div
              className={[
                'grid h-7 w-7 place-items-center rounded-lg',
                titleIconBgClassName ?? 'bg-slate-100',
              ].join(' ')}
            >
              <IconImage src={titleIconSrc} alt="" className="h-4 w-4" />
            </div>
          ) : null}
          <div className="text-sm font-semibold text-slate-800">{title}</div>
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-50"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>
      {children}
    </div>
  )
}

function formatDateForDisplay(value: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })
}

export function NewReservationStep3({ value }: Props) {
  const localAriState = useAppSelector((state) => state.localAri)
  const fullName = [value.firstName, value.surName].filter(Boolean).join(' ')

  const nationalityLabel = useMemo(() => {
    if (!value.nationality) return ''
    return countries.getName(value.nationality, 'en', { select: 'official' }) ?? value.nationality
  }, [value.nationality])

  const mainRoom = value.rooms[0]
  const guestsTotal = value.adultCount + value.childCount

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          title="Guest Information"
          titleIconSrc={MdNotes}
          titleIconBgClassName="bg-blue-100"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoRow label="Full Name" value={fullName} iconSrc={IoMdPerson} />
            <InfoRow label="Phone Number" value={value.phone} iconSrc={BsTelephone} />
            <InfoRow
              label="Email Address"
              value={value.email}
              iconSrc={MdEmail}
              valueClassName="break-all"
            />
            <InfoRow label="ID Number" value={value.idNumber} iconSrc={LuIdCard} />
            <InfoRow label="Nationality" value={nationalityLabel} iconSrc={LuIdCard} />
            <InfoRow label="Booking source" value={value.bookingSource} iconSrc={MdContactPhone} />
          </div>
        </Card>

        <Card title="Room Information" titleIconSrc={MdMeetingRoom} titleIconBgClassName="bg-violet-100">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoRow label="Room count" value={mainRoom?.roomCount.toString() ?? ''} />
            <InfoRow label="Room Type" value={mainRoom?.roomType ?? ''} />
            <InfoRow label="Rate code" value={value.rateCode} />
            <InfoRow label="Maximum Guests" value={guestsTotal ? `${guestsTotal} guests` : ''} />
            <InfoRow
              label="Price per Night (Base)"
              value={(() => {
                const rate = localAriState.rates[0]
                return rate?.basePriceAfterTax ? formatMoney(rate.basePriceAfterTax, rate.currency) : '—'
              })()}
            />
            {localAriState.rates[0]?.extraAdultPriceAfterTax > 0 && value.adultCount > (localAriState.rates[0]?.numberOfGuests || 1) && (
              <InfoRow 
                label="Extra Adults / Night" 
                value={formatMoney((value.adultCount - (localAriState.rates[0]?.numberOfGuests || 1)) * localAriState.rates[0].extraAdultPriceAfterTax, localAriState.rates[0]?.currency || '$')} 
              />
            )}
            {value.childCount > 0 && (
              <InfoRow 
                label="Children / Night" 
                value={(() => {
                  const rate = localAriState.rates[0]
                  if (!rate) return '—'
                  let total = 0
                  for (let i = 0; i < value.childCount; i++) {
                    const age = value.childAges?.[i] || 0
                    const policy = (rate.childPolicies || []).find(p => age >= p.ageFrom && age <= p.ageTo)
                    total += policy ? policy.amountAfterTax : (rate.childrenPriceAfterTax || 0)
                  }
                  return formatMoney(total, rate.currency || '$')
                })()} 
              />
            )}
          </div>

          <div className="mt-4">
            <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-700">
              Occupied
            </div>
          </div>
        </Card>
      </div>

      <Card title="Stay Details" titleIconSrc={MdDateRange} titleIconBgClassName="bg-orange-100">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <InfoRow label="Check-in Date" value={formatDateForDisplay(value.checkInDate)} />
          <InfoRow label="Check-out Date" value={formatDateForDisplay(value.checkOutDate)} />
          <InfoRow label="Number of Nights" value={value.nights ? `${value.nights} nights` : ''} />
          <InfoRow label="Number of Guests" value={guestsTotal ? `${guestsTotal} guests` : ''} />
        </div>
      </Card>

      <Card title="Special Requests" titleIconSrc={MdNotes} titleIconBgClassName="bg-violet-100">
        <div className="rounded-xl bg-[#F7F4FF] p-4 text-sm text-slate-700">
          {value.specialRequests || '—'}
        </div>
      </Card>


    </div>
  )
}
