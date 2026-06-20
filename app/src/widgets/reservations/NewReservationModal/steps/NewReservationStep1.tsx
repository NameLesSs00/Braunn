import { IconImage } from '../../../../shared/ui/IconImage'
import { useMemo } from 'react'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { IoSearchSharp } from "react-icons/io5";
import type { ReservationDraft } from '../../../../features/reservations/draftSlice'
import { IoMdPerson } from "react-icons/io";
import { IconType } from "react-icons";
import { MdEmail, MdContactPhone, MdNotes } from "react-icons/md";
import { BsTelephone } from "react-icons/bs";
import { LuIdCard } from "react-icons/lu";

countries.registerLocale(enLocale)

type FieldProps = {
  label: string
  required?: boolean
  placeholder?: string
  iconSrc?: string|IconType
  rightIconSrc?: string
  as?: 'input' | 'select' | 'textarea'
  type?: 'text' | 'date'
  options?: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
}

function Field({
  label,
  required,
  placeholder,
  iconSrc,
  rightIconSrc,
  as = 'input',
  type = 'text',
  options,
  value,
  onChange,
}: FieldProps) {
  const baseClassName =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]'

  const leftPaddingClassName = iconSrc ? 'pl-11' : ''
  const rightPaddingClassName = rightIconSrc || as === 'select' ? 'pr-11' : ''
  const controlClassName = [baseClassName, leftPaddingClassName, rightPaddingClassName]
    .filter(Boolean)
    .join(' ')

  const control =
    as === 'textarea' ? (
      <textarea
        className={[
          'min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]',
          leftPaddingClassName,
          rightPaddingClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    ) : as === 'select' ? (
      <select
        className={[controlClassName, 'appearance-none text-slate-500'].join(' ')}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="">select</option>
        {(options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        className={controlClassName}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={(e) => {
          if (type !== 'date') return
          if ('showPicker' in e.currentTarget) {
            ;(e.currentTarget as HTMLInputElement & { showPicker: () => void }).showPicker()
          }
        }}
      />
    )

  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </div>
      <div className="relative">
        {iconSrc ? (
          <IconImage
            src={iconSrc}
            alt=""
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
          />
        ) : null}
        {control}
        {rightIconSrc ? (
          <IconImage
            src={rightIconSrc}
            alt=""
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
          />
        ) : null}
        {as === 'select' ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        ) : null}
      </div>
    </label>
  )
}

interface SectionProps {
  title: string;
  iconSrc: IconType;
  iconBgClassName?: string;
  children: React.ReactNode;
}

function Section({ title, iconSrc, iconBgClassName, children }: SectionProps) {
  const IconComponent = iconSrc as React.ComponentType<any>;
  return (
    <div className="rounded-2xl bg-white">
      <div className="flex items-center gap-3 px-1">
        <div className={['grid h-9 w-9 place-items-center rounded-xl', iconBgClassName].join(' ')}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="text-[18px] font-semibold text-slate-800">{title}</div>
      </div>

      <div className="pt-4">{children}</div>
    </div>
  )
}

type Props = {
  value: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
}

export function NewReservationStep1({ value, onChange }: Props) {
  const nationalityOptions: { value: string; label: string }[] = useMemo(() => {
    return Object.entries(countries.getNames('en', { select: 'official' }))
      .map(([code, name]) => ({ value: code, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  return (
    <div className="space-y-7">
      <div className="relative">
        <input
          className="h-11 w-full rounded-full bg-[#F3F5FF] px-5 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Search by Guest ID"
        />
        <IconImage
          src={IoSearchSharp}
          alt="Search"
          className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 opacity-80"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 text-[12px] font-semibold text-slate-700">Booking source</div>
          <div className="relative">
            <select
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
              value={value.bookingSource}
              onChange={(e) => {
                const next = e.target.value
                onChange({ bookingSource: next })
              }}
            >
              <option value="">select</option>
              <option value="CorporateAccount">Corporate Account</option>
              <option value="GroupContract">Group Contract</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="WalkIn">Walk-in</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[12px] font-semibold text-slate-700">Reservation Status</div>
          <div className="relative">
            <select
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
              value={value.reservationStatus}
              onChange={(e) => {
                const next = e.target.value as ReservationDraft['reservationStatus']
                onChange({ reservationStatus: next })
              }}
            >
              <option value="">select</option>
              <option value="Reserved">Reserved</option>
              <option value="Confirmed">Confirmed</option>
              <option value="CheckedIn">Checked In</option>
              <option value="CheckedOut">Checked Out</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Tentative">Tentative</option>
              <option value="Definite">Definite</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
          </div>
        </div>
      </div>

      <Section
        title="Personal Information"
        iconSrc={IoMdPerson}
        iconBgClassName="bg-violet-100"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="First Name"
            required
            placeholder="John"
            value={value.firstName}
            onChange={(v) => onChange({ firstName: v })}
          />
          <Field
            label="Last Name"
            required
            placeholder="Doe"
            value={value.surName}
            onChange={(v) => onChange({ surName: v })}
          />
        </div>
      </Section>

      <Section
        title="Contact Information"
        iconSrc={MdContactPhone}
        iconBgClassName="bg-blue-100"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Email Address"
            required
            placeholder="john.doe@example.com"
            iconSrc={MdEmail}
            value={value.email}
            onChange={(v) => onChange({ email: v })}
          />
          <Field
            label="Phone Number"
            required
            placeholder="+1 (555) 123-4567"
            iconSrc={BsTelephone}
            value={value.phone}
            onChange={(v) => onChange({ phone: v })}
          />
        </div>
      </Section>

      <Section
        title="Identification"
        iconSrc={LuIdCard}
        iconBgClassName="bg-emerald-100"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Nationality"
            required
            as="select"
            options={nationalityOptions}
            value={value.nationality}
            onChange={(v) => onChange({ nationality: v, countryCode: v })}
          />
          <Field
            label="ID / National ID"
            required
            placeholder="123456789"
            value={value.idNumber}
            onChange={(v) => onChange({ idNumber: v })}
          />
        </div>
      </Section>

      <Section
        title="Address Information"
        iconSrc={IoMdPerson}
        iconBgClassName="bg-amber-100"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
          <Field
            label="Address"
            placeholder="123 Main St, New York, NY 10001"
            value={value.addressLine}
            onChange={(v) => onChange({ addressLine: v })}
          />
        </div>
      </Section>

      <Section
        title="Companions"
        iconSrc={IoMdPerson}
        iconBgClassName="bg-cyan-100"
      >
        <div className="space-y-4">
          {value.companions?.map((comp) => (
            <div key={comp.id} className="grid grid-cols-1 gap-5 md:grid-cols-2 rounded-xl border border-slate-200 p-4 relative pt-10">
              <button
                type="button"
                className="absolute top-2 right-3 text-rose-500 hover:text-rose-700 text-lg font-bold"
                onClick={() => onChange({ companions: value.companions.filter(c => c.id !== comp.id) })}
              >
                ×
              </button>
              <Field
                label="First Name"
                placeholder="First Name"
                value={comp.firstName}
                onChange={(v) => onChange({ companions: value.companions.map(c => c.id === comp.id ? { ...c, firstName: v } : c) })}
              />
              <Field
                label="Last Name"
                placeholder="Last Name"
                value={comp.lastName}
                onChange={(v) => onChange({ companions: value.companions.map(c => c.id === comp.id ? { ...c, lastName: v } : c) })}
              />
              <Field
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                value={comp.phoneNumber}
                onChange={(v) => onChange({ companions: value.companions.map(c => c.id === comp.id ? { ...c, phoneNumber: v } : c) })}
              />
              <Field
                label="Email"
                placeholder="companion@example.com"
                value={comp.email}
                onChange={(v) => onChange({ companions: value.companions.map(c => c.id === comp.id ? { ...c, email: v } : c) })}
              />
              <Field
                label="National ID"
                placeholder="ID Number"
                value={comp.nationalId}
                onChange={(v) => onChange({ companions: value.companions.map(c => c.id === comp.id ? { ...c, nationalId: v } : c) })}
              />
              <Field
                label="Address"
                placeholder="Address"
                value={comp.address}
                onChange={(v) => onChange({ companions: value.companions.map(c => c.id === comp.id ? { ...c, address: v } : c) })}
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              className="h-10 rounded-xl border border-[#0B4EA2] px-6 text-sm font-semibold text-[#0B4EA2] hover:bg-blue-50"
              onClick={() => onChange({ 
                companions: [...(value.companions || []), { id: Date.now(), firstName: '', lastName: '', phoneNumber: '', email: '', address: '', nationalId: '' }] 
              })}
            >
              Add Companion
            </button>
          </div>
        </div>
      </Section>

      <Section
        title="Preferences & Notes"
        iconSrc={MdNotes}
        iconBgClassName="bg-indigo-100"
      >
        <Field
          label="Special Requests"
          as="textarea"
          placeholder="Any additional requests for the stay."
          value={value.specialRequests}
          onChange={(v) => onChange({ specialRequests: v })}
        />
      </Section>
    </div>
  )
}
