import { useMemo } from 'react'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { IconImage } from '../../../shared/ui/IconImage'
import type { OtaReservationDraft } from '../../../features/reservations/otaReservationDraftSlice'
import { IoMdPerson } from 'react-icons/io'
import { MdEmail, MdContactPhone, MdBusiness, MdLocationOn } from 'react-icons/md'
import { BsTelephone } from 'react-icons/bs'
import { LuIdCard, LuBuilding2 } from 'react-icons/lu'
import { IconType } from 'react-icons'
import React from 'react'

countries.registerLocale(enLocale)

/* ─────────────────── shared Field ─────────────────── */
type FieldProps = {
  label: string
  required?: boolean
  placeholder?: string
  iconSrc?: IconType
  as?: 'input' | 'select' | 'textarea'
  type?: string
  options?: { value: string; label: string }[]
  value?: string | number
  onChange?: (value: string) => void
}

function Field({ label, required, placeholder, iconSrc, as = 'input', type = 'text', options, value, onChange }: FieldProps) {
  const base = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] transition-colors'
  const withIcon = iconSrc ? 'pl-11' : ''
  const cls = [base, withIcon].filter(Boolean).join(' ')

  const ctrl =
    as === 'select' ? (
      <div className="relative">
        <select
          className={[cls, 'appearance-none text-slate-500 pr-9'].join(' ')}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
        >
          <option value="">Select…</option>
          {(options ?? []).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
      </div>
    ) : as === 'textarea' ? (
      <textarea
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] resize-none transition-colors"
        placeholder={placeholder}
        value={value as string}
        onChange={(e) => onChange?.(e.target.value)}
      />
    ) : (
      <div className="relative">
        {iconSrc && (
          <IconImage
            src={iconSrc}
            alt=""
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-50"
          />
        )}
        <input
          className={cls}
          type={type}
          placeholder={placeholder}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={(e) => {
            if (type === 'date' && 'showPicker' in e.currentTarget) {
              (e.currentTarget as HTMLInputElement & { showPicker: () => void }).showPicker()
            }
          }}
        />
      </div>
    )

  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-semibold text-slate-700">
        {label}{required && <span className="text-rose-500"> *</span>}
      </div>
      {ctrl}
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

/* ─────────────────── Main Step ─────────────────── */
type Props = {
  value: OtaReservationDraft
  onChange: (patch: Partial<OtaReservationDraft>) => void
}

const salutationOptions = [
  { value: 'Mr', label: 'Mr.' },
  { value: 'Mrs', label: 'Mrs.' },
  { value: 'Ms', label: 'Ms.' },
  { value: 'Dr', label: 'Dr.' },
  { value: 'Prof', label: 'Prof.' },
]

const profileTypeOptions = [
  { value: 'Guest', label: 'Guest' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'TravelAgent', label: 'Travel Agent' },
  { value: 'Group', label: 'Group' },
]

const phoneTechOptions = [
  { value: 'Voice', label: 'Voice' },
  { value: 'Fax', label: 'Fax' },
  { value: 'Mobile', label: 'Mobile' },
]

const phoneLocOptions = [
  { value: 'Home', label: 'Home' },
  { value: 'Office', label: 'Office' },
  { value: 'Mobile', label: 'Mobile' },
]

const addressTypeOptions = [
  { value: 'Home', label: 'Home' },
  { value: 'Business', label: 'Business' },
  { value: 'Billing', label: 'Billing' },
]

const resStatusOptions = [
  { value: 'Reserved', label: 'Reserved' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Tentative', label: 'Tentative' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const resIDTypeOptions = [
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'PMS', label: 'PMS' },
  { value: 'OTA', label: 'OTA' },
  { value: 'CRS', label: 'CRS' },
]

export function OtaReservationStep1({ value, onChange }: Props) {
  const countryOptions = useMemo(
    () =>
      Object.entries(countries.getNames('en', { select: 'official' }))
        .map(([code, name]) => ({ value: code, label: name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  )

  return (
    <div className="space-y-5">
      {/* ── Booking Metadata ── */}
      <Section title="Booking Information" icon={LuBuilding2} iconBg="bg-blue-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Hotel Code" required placeholder="e.g. HBR01" value={value.hotelCode} onChange={(v) => onChange({ hotelCode: v })} />
          <Field label="Creator ID" placeholder="Staff ID" value={value.creatorID} onChange={(v) => onChange({ creatorID: v })} />
          <Field label="Create Date" type="date" value={value.createDateTime} onChange={(v) => onChange({ createDateTime: v })} />
          <Field label="Reservation Status" as="select" options={resStatusOptions} value={value.resStatus} onChange={(v) => onChange({ resStatus: v })} />
          <Field label="Reservation ID Value" placeholder="e.g. 20260704-001" value={value.resIDValue} onChange={(v) => onChange({ resIDValue: v })} />
          <Field label="Reservation ID Type" as="select" options={resIDTypeOptions} value={value.resIDType} onChange={(v) => onChange({ resIDType: v })} />
        </div>
      </Section>

      {/* ── Point of Sale ── */}
      <Section title="Point of Sale (Channel)" icon={MdBusiness} iconBg="bg-violet-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Channel Code" required placeholder="e.g. DIRECT" value={value.channelCode} onChange={(v) => onChange({ channelCode: v })} />
          <Field label="Channel Name" placeholder="e.g. Direct Booking" value={value.channelName} onChange={(v) => onChange({ channelName: v })} />
        </div>
      </Section>

      {/* ── Guest Personal Info ── */}
      <Section title="Guest Information" icon={IoMdPerson} iconBg="bg-emerald-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Salutation" as="select" options={salutationOptions} value={value.salutation} onChange={(v) => onChange({ salutation: v })} />
          <Field label="First Name" required placeholder="John" value={value.firstName} onChange={(v) => onChange({ firstName: v })} />
          <Field label="Middle Name" placeholder="(optional)" value={value.middleName} onChange={(v) => onChange({ middleName: v })} />
          <Field label="Last Name" required placeholder="Doe" value={value.surName} onChange={(v) => onChange({ surName: v })} />
          <Field label="Guest ID" placeholder="External ID" value={value.guestID} onChange={(v) => onChange({ guestID: v })} />
          <Field label="Profile Type" as="select" options={profileTypeOptions} value={value.profileType} onChange={(v) => onChange({ profileType: v })} />
        </div>
      </Section>

      {/* ── Contact ── */}
      <Section title="Contact Information" icon={MdContactPhone} iconBg="bg-amber-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Email" placeholder="john@example.com" iconSrc={MdEmail} value={value.email} onChange={(v) => onChange({ email: v })} />
          <Field label="Phone Number" placeholder="+1 555 000 0000" iconSrc={BsTelephone} value={value.phoneNo} onChange={(v) => onChange({ phoneNo: v })} />
          <Field label="Phone Type" as="select" options={phoneTechOptions} value={value.phoneTechType} onChange={(v) => onChange({ phoneTechType: v })} />
          <Field label="Phone Location" as="select" options={phoneLocOptions} value={value.phoneLocationType} onChange={(v) => onChange({ phoneLocationType: v })} />
        </div>
      </Section>

      {/* ── Address ── */}
      <Section title="Guest Address" icon={MdLocationOn} iconBg="bg-rose-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <Field label="Address Line" placeholder="123 Main Street" value={value.addressLine} onChange={(v) => onChange({ addressLine: v })} />
          </div>
          <Field label="City" placeholder="New York" value={value.city} onChange={(v) => onChange({ city: v })} />
          <Field label="State / Province" placeholder="NY" value={value.state} onChange={(v) => onChange({ state: v })} />
          <Field label="Postal Code" placeholder="10001" value={value.postalCode} onChange={(v) => onChange({ postalCode: v })} />
          <Field label="Country" as="select" options={countryOptions} value={value.countryCode} onChange={(v) => onChange({ countryCode: v })} />
          <Field label="Address Type" as="select" options={addressTypeOptions} value={value.addressType} onChange={(v) => onChange({ addressType: v })} />
        </div>
      </Section>

      {/* ── Currency & Deposit ── */}
      <Section title="Financial Settings" icon={LuIdCard} iconBg="bg-teal-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="Currency"
            as="select"
            options={[
              { value: 'USD', label: 'USD — US Dollar' },
              { value: 'EUR', label: 'EUR — Euro' },
              { value: 'GBP', label: 'GBP — British Pound' },
              { value: 'AED', label: 'AED — UAE Dirham' },
              { value: 'SAR', label: 'SAR — Saudi Riyal' },
            ]}
            value={value.currency}
            onChange={(v) => onChange({ currency: v })}
          />
          <Field
            label="Deposit Amount"
            type="number"
            placeholder="0.00"
            value={value.depositAmount}
            onChange={(v) => onChange({ depositAmount: Number(v) || 0 })}
          />
        </div>
      </Section>
    </div>
  )
}
