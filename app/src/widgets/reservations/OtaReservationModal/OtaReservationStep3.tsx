import type { OtaReservationDraft, OtaGuestCount, OtaSpecialRequest } from '../../../features/reservations/otaReservationDraftSlice'
import { MdCreditCard, MdCheck } from 'react-icons/md'
import { LuShieldCheck } from 'react-icons/lu'
import { IconType } from 'react-icons'
import React from 'react'

/* ─────────────────── shared Field ─────────────────── */
type FieldProps = {
  label: string
  required?: boolean
  placeholder?: string
  as?: 'input' | 'select'
  type?: string
  options?: { value: string; label: string }[]
  value?: string | number
  onChange?: (value: string) => void
}

function Field({ label, required, placeholder, as = 'input', type = 'text', options, value, onChange }: FieldProps) {
  const base = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] transition-colors'

  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-semibold text-slate-700">
        {label}{required && <span className="text-rose-500"> *</span>}
      </div>
      {as === 'select' ? (
        <div className="relative">
          <select
            className={[base, 'appearance-none pr-9 text-slate-600'].join(' ')}
            value={value as string}
            onChange={(e) => onChange?.(e.target.value)}
          >
            <option value="">Select…</option>
            {(options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
        </div>
      ) : (
        <input
          className={base}
          type={type}
          placeholder={placeholder}
          value={value as string | number}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </label>
  )
}

/* ─────────────────── Section card ─────────────────── */
function Section({ title, icon, iconBg, children }: { title: string; icon: IconType; iconBg: string; children: React.ReactNode }) {
  const Icon = icon as React.ComponentType<any>
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className={['grid h-9 w-9 place-items-center rounded-xl', iconBg].join(' ')}>
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
        <span className="text-[15px] font-semibold text-slate-800">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}

/* ─────────────────── InfoRow (review) ─────────────────── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-[13px] font-semibold text-slate-800 truncate">{value || '—'}</div>
    </div>
  )
}

/* ─────────────────── Main Step ─────────────────── */
type Props = {
  value: OtaReservationDraft
  onChange: (patch: Partial<OtaReservationDraft>) => void
}

const guaranteeTypeOptions = [
  { value: 'CC', label: 'CC — Credit Card' },
  { value: 'GUA', label: 'GUA — Guarantee' },
  { value: 'DEPOSIT', label: 'Deposit' },
  { value: 'PREPAY', label: 'Prepay' },
]

const cardTypeOptions = [
  { value: 'VI', label: 'VI — Visa' },
  { value: 'MC', label: 'MC — MasterCard' },
  { value: 'AX', label: 'AX — American Express' },
  { value: 'DI', label: 'DI — Discover' },
  { value: 'JCB', label: 'JCB' },
]

export function OtaReservationStep3({ value, onChange }: Props) {
  const formatDate = (d: string) => {
    if (!d) return '—'
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString('en-US')
  }

  return (
    <div className="space-y-5">
      {/* ── Guarantee ── */}
      <Section title="Guarantee Information" icon={LuShieldCheck} iconBg="bg-blue-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Guarantee Type"
            as="select"
            options={guaranteeTypeOptions}
            value={value.guaranteeType}
            onChange={(v) => onChange({ guaranteeType: v })}
          />
          <Field
            label="Guarantee Code"
            placeholder="e.g. GUA001"
            value={value.guaranteeCode}
            onChange={(v) => onChange({ guaranteeCode: v })}
          />
        </div>
      </Section>

      {/* ── Payment Card ── */}
      <Section title="Payment Card" icon={MdCreditCard} iconBg="bg-emerald-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Card Type"
            as="select"
            options={cardTypeOptions}
            value={value.cardType}
            onChange={(v) => onChange({ cardType: v })}
          />
          <Field
            label="Card Code"
            placeholder="e.g. VI-001"
            value={value.cardCode}
            onChange={(v) => onChange({ cardCode: v })}
          />
          <Field
            label="Cardholder Name"
            required
            placeholder="John Doe"
            value={value.cardHolderName}
            onChange={(v) => onChange({ cardHolderName: v })}
          />
          <Field
            label="Card Number"
            placeholder="**** **** **** 4242"
            value={value.cardNo}
            onChange={(v) => onChange({ cardNo: v })}
          />
          <Field
            label="Expiry (MM/YY)"
            placeholder="03/26"
            value={value.expire}
            onChange={(v) => onChange({ expire: v })}
          />
          <Field
            label="Series Code (CVV)"
            placeholder="***"
            value={value.seriesCode}
            onChange={(v) => onChange({ seriesCode: v })}
          />
        </div>
      </Section>

      {/* ── Review Summary ── */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0B4EA2]">
            <MdCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-slate-800">Review Summary</span>
        </div>

        {/* Guest block */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-[#0B4EA2]">Guest & Booking</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <InfoRow label="Full Name" value={[value.salutation, value.firstName, value.middleName, value.surName].filter(Boolean).join(' ')} />
            <InfoRow label="Email" value={value.email} />
            <InfoRow label="Phone" value={value.phoneNo} />
            <InfoRow label="Hotel Code" value={value.hotelCode} />
            <InfoRow label="Channel" value={value.channelName || value.channelCode} />
            <InfoRow label="Status" value={value.resStatus} />
            <InfoRow label="Currency" value={value.currency} />
            <InfoRow label="Deposit" value={value.depositAmount ? `${value.currency} ${value.depositAmount}` : '—'} />
          </div>
        </div>

        {/* Stay block */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-[#0B4EA2]">Stay Details</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <InfoRow label="Check-in" value={formatDate(value.timeSpanStart)} />
            <InfoRow label="Check-out" value={formatDate(value.timeSpanEnd)} />
            <InfoRow label="Room Type" value={value.roomRates[0]?.invCode || '—'} />
            <InfoRow label="Rate Plan" value={value.roomRates[0]?.ratePlanCode || '—'} />
            <InfoRow label="Units" value={String(value.roomRates[0]?.numberOfUnits ?? '—')} />
            <InfoRow label="Total After Tax" value={value.totalAmountAfterTax ? `${value.currency} ${value.totalAmountAfterTax}` : '—'} />
            <InfoRow label="Total Before Tax" value={value.totalAmountBeforeTax ? `${value.currency} ${value.totalAmountBeforeTax}` : '—'} />
            <InfoRow label="Tax" value={value.totalTaxAmount ? `${value.currency} ${value.totalTaxAmount}` : '—'} />
          </div>
        </div>

        {/* Guarantee block */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-[#0B4EA2]">Guarantee</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <InfoRow label="Type" value={value.guaranteeType} />
            <InfoRow label="Code" value={value.guaranteeCode} />
            <InfoRow label="Card Type" value={value.cardType} />
            <InfoRow label="Cardholder" value={value.cardHolderName} />
            <InfoRow label="Card Number" value={value.cardNo ? `****${value.cardNo.slice(-4)}` : '—'} />
            <InfoRow label="Expiry" value={value.expire} />
          </div>
        </div>

        {/* Guest counts */}
        {value.guestCounts.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#0B4EA2]">Guest Counts</div>
            <div className="flex flex-wrap gap-3">
              {value.guestCounts.map((g: OtaGuestCount) => (
                <div key={g.id} className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-[#0B4EA2]">
                  Code {g.ageQualifyingCode}: {g.count} guest(s)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Requests */}
        {value.specialRequests.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#0B4EA2]">Special Requests</div>
            {value.specialRequests.map((sr: OtaSpecialRequest) => (
              <div key={sr.id} className="flex gap-2 text-sm text-slate-700">
                {sr.requestCode && <span className="font-semibold text-slate-500">[{sr.requestCode}]</span>}
                <span>{sr.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
