import { IconImage } from '../../../../shared/ui/IconImage'
import { useMemo, useState } from 'react'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { IoSearchSharp } from "react-icons/io5";
import type { ReservationDraft } from '../../../../features/reservations/draftSlice'
import { IoMdPerson } from "react-icons/io";
import { IconType } from "react-icons";
import { MdDateRange, MdEmail, MdContactPhone, MdNotes } from "react-icons/md";
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
  const [resavedEmail, setResavedEmail] = useState(false)
  const groupReservation = value.isGroupReservation

  const onHold = value.reservationStatus === 'optional_on_hold'
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 text-[12px] font-semibold text-slate-700">Booking source</div>
              <div className="relative">
                <select
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
                  value={value.bookingSource}
                  onChange={(e) => {
                    const next = e.target.value
                    onChange({
                      bookingSource: next,
                      otaSource: next === 'OTA' ? value.otaSource : '',
                    })
                  }}
                >
                  <option value="">select</option>
                  <option value="phone">Phone</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="website">Website</option>
                  <option value="OTA">OTA</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
              </div>
            </div>

            {value.bookingSource === 'OTA' ? (
              <div>
                <div className="mb-2 text-[12px] font-semibold text-slate-700">OTA Source</div>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-800 outline-none focus:border-[#0B4EA2]"
                    value={value.otaSource}
                    onChange={(e) => onChange({ otaSource: e.target.value })}
                  >
                    <option value="">select OTA</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Expedia">Expedia</option>
                    <option value="Check24">Check24</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 text-[12px] font-semibold text-slate-700">Reservation Status</div>
              <div className="relative">
                <select
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
                  value={value.reservationStatus}
                  onChange={(e) => {
                    const next = e.target.value as ReservationDraft['reservationStatus']
                    onChange({
                      reservationStatus: next,
                      optionExpiryDate: next === 'optional_on_hold' ? value.optionExpiryDate : '',
                    })
                  }}
                >
                  <option value="">select</option>
                  <option value="commit">commit</option>
                  <option value="modify">modify</option>
                  <option value="cancelled">cancelled</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
              </div>
            </div>

            {onHold ? (
              <div>
                <div className="mb-2 text-[12px] font-semibold text-slate-700">Option Expiry Date</div>
                <div className="relative">
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder="MM/DD/YY"
                    type="date"
                    value={value.optionExpiryDate}
                    onChange={(e) => onChange({ optionExpiryDate: e.target.value })}
                    onFocus={(e) => {
                      if ('showPicker' in e.currentTarget) {
                        ;(e.currentTarget as HTMLInputElement & { showPicker: () => void }).showPicker()
                      }
                    }}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 md:pt-6">
          <div className="flex items-center justify-end gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-6 w-6 cursor-pointer appearance-none rounded-lg border-[1.5px] border-[#0B4EA2] bg-white bg-center bg-no-repeat checked:border-[#4F6EF7] checked:bg-[#4F6EF7] checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiLz48L3N2Zz4=')] checked:bg-[size:14px_14px]"
              checked={resavedEmail}
              onChange={(e) => setResavedEmail(e.target.checked)}
            />
            <span className="select-none">Resaved Email</span>
          </div>

          <div className="flex items-center justify-end gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-6 w-6 cursor-pointer appearance-none rounded-lg border-[1.5px] border-[#0B4EA2] bg-white bg-center bg-no-repeat checked:border-[#4F6EF7] checked:bg-[#4F6EF7] checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiLz48L3N2Zz4=')] checked:bg-[size:14px_14px]"
              checked={groupReservation}
              onChange={(e) => onChange({ isGroupReservation: e.target.checked })}
            />
            <span className="select-none">Group Reservation</span>

            {groupReservation ? (
              <span
                className="inline-flex h-14 w-11 items-start justify-center bg-emerald-100 pt-3 text-lg font-extrabold text-emerald-700"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                G
              </span>
            ) : null}
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
            label="Salutation"
            placeholder="Mr."
            value={value.salutation}
            onChange={(v) => onChange({ salutation: v })}
          />
          <Field
            label="First Name"
            required
            placeholder="John"
            value={value.firstName}
            onChange={(v) => onChange({ firstName: v })}
          />
          <Field
            label="Middle Name"
            placeholder="M."
            value={value.middleName}
            onChange={(v) => onChange({ middleName: v })}
          />
          <Field
            label="Last Name"
            required
            placeholder="Doe"
            value={value.surName}
            onChange={(v) => onChange({ surName: v })}
          />
          <Field
            label="Date of Birth"
            required
            placeholder="MM/DD/YY"
            iconSrc={MdDateRange}
            type="date"
            value={value.dateOfBirth}
            onChange={(v) => onChange({ dateOfBirth: v })}
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
            value={value.creatorID}
            onChange={(v) => onChange({ creatorID: v })}
          />
        </div>
      </Section>

      <Section
        title="Address Information"
        iconSrc={IoMdPerson}
        iconBgClassName="bg-amber-100"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Address Line"
            placeholder="123 Main St"
            value={value.addressLine}
            onChange={(v) => onChange({ addressLine: v })}
          />
          <Field
            label="Address Type"
            as="select"
            options={[
              { value: 'Home', label: 'Home' },
              { value: 'Office', label: 'Office' },
              { value: 'Other', label: 'Other' },
            ]}
            value={value.addressType}
            onChange={(v) => onChange({ addressType: v })}
          />
          <Field
            label="City"
            placeholder="New York"
            value={value.city}
            onChange={(v) => onChange({ city: v })}
          />
          <Field
            label="State / Province"
            placeholder="NY"
            value={value.state}
            onChange={(v) => onChange({ state: v })}
          />
          <Field
            label="Postal Code"
            placeholder="10001"
            value={value.postalCode}
            onChange={(v) => onChange({ postalCode: v })}
          />
        </div>
      </Section>

      <Section
        title="Preferences & Notes"
        iconSrc={MdNotes}
        iconBgClassName="bg-indigo-100"
      >
        <div className="space-y-4">
          <Field
            label="Notes / Preferences"
            as="textarea"
            placeholder="Room preferences, dietary restrictions, etc."
            value={value.notes}
            onChange={(v) => onChange({ notes: v })}
          />

          <Field
            label="Special Requests"
            as="textarea"
            placeholder="Any additional requests for the stay."
            value={value.specialRequests}
            onChange={(v) => onChange({ specialRequests: v })}
          />
        </div>
      </Section>
    </div>
  )
}
