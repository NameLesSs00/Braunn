
import type {
  OtaReservationDraft,
  OtaRoomRate,
  OtaRateEntry,
  OtaGuestCount,
  OtaSpecialRequest,
  OtaComment,
} from '../../../features/reservations/otaReservationDraftSlice'
import { MdMeetingRoom, MdDateRange, MdNotes, MdPeople } from 'react-icons/md'
import { LuPlus, LuTrash2 } from 'react-icons/lu'
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
  const base = 'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] transition-colors'

  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </div>
      {as === 'select' ? (
        <div className="relative">
          <select
            className={[base, 'appearance-none pr-8 text-slate-600'].join(' ')}
            value={value as string}
            onChange={(e) => onChange?.(e.target.value)}
          >
            <option value="">Select…</option>
            {(options ?? []).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
        </div>
      ) : (
        <input
          className={base}
          type={type}
          placeholder={placeholder}
          value={value as string | number}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={(e) => {
            if (type === 'date' && 'showPicker' in e.currentTarget) {
              (e.currentTarget as HTMLInputElement & { showPicker: () => void }).showPicker()
            }
          }}
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
      {children}
    </div>
  )
}

/* ─────────────────── Add Row Button ─────────────────── */
function AddRowBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-dashed border-[#0B4EA2] px-4 py-2 text-sm font-semibold text-[#0B4EA2] hover:bg-blue-50 transition-colors"
    >
      <LuPlus className="h-4 w-4" />
      {label}
    </button>
  )
}

/* ─────────────────── Remove Button ─────────────────── */
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
      aria-label="Remove"
    >
      <LuTrash2 className="h-4 w-4" />
    </button>
  )
}

/* ─────────────────── Main Step ─────────────────── */
type Props = {
  value: OtaReservationDraft
  onChange: (patch: Partial<OtaReservationDraft>) => void
}

const ageQualCodes = [
  { value: '10', label: '10 — Adult' },
  { value: '8', label: '8 — Child' },
  { value: '7', label: '7 — Infant' },
]

export function OtaReservationStep2({ value, onChange }: Props) {
  /* ── Room Rate helpers ── */
  const updateRoomRate = (id: number, patch: Partial<OtaRoomRate>) => {
    onChange({ roomRates: value.roomRates.map((r: OtaRoomRate) => (r.id === id ? { ...r, ...patch } : r)) })
  }

  const addRateEntry = (roomId: number) => {
    const today = new Date().toISOString().split('T')[0]
    const newEntry: OtaRateEntry = { id: Date.now(), amountAfterTax: 0, amountBeforeTax: 0, effectiveDate: today, expireDate: today }
    onChange({
      roomRates: value.roomRates.map((r: OtaRoomRate) =>
        r.id === roomId ? { ...r, rates: [...r.rates, newEntry] } : r
      ),
    })
  }

  const removeRateEntry = (roomId: number, entryId: number) => {
    onChange({
      roomRates: value.roomRates.map((r: OtaRoomRate) =>
        r.id === roomId ? { ...r, rates: r.rates.filter((e: OtaRateEntry) => e.id !== entryId) } : r
      ),
    })
  }

  const updateRateEntry = (roomId: number, entryId: number, patch: Partial<OtaRateEntry>) => {
    onChange({
      roomRates: value.roomRates.map((r: OtaRoomRate) =>
        r.id === roomId
          ? { ...r, rates: r.rates.map((e: OtaRateEntry) => (e.id === entryId ? { ...e, ...patch } : e)) }
          : r
      ),
    })
  }

  const addRoomRate = () => {
    const today = new Date().toISOString().split('T')[0]
    const newRate: OtaRoomRate = {
      id: Date.now(),
      invCode: '',
      numberOfUnits: 1,
      ratePlanCode: '',
      rates: [{ id: Date.now() + 1, amountAfterTax: 0, amountBeforeTax: 0, effectiveDate: today, expireDate: today }],
    }
    onChange({ roomRates: [...value.roomRates, newRate] })
  }

  const removeRoomRate = (id: number) => {
    if (value.roomRates.length <= 1) return
    onChange({ roomRates: value.roomRates.filter((r: OtaRoomRate) => r.id !== id) })
  }

  /* ── Guest Count helpers ── */
  const updateGuestCount = (id: number, patch: Partial<OtaGuestCount>) => {
    onChange({ guestCounts: value.guestCounts.map((g: OtaGuestCount) => (g.id === id ? { ...g, ...patch } : g)) })
  }

  const addGuestCount = () => {
    onChange({ guestCounts: [...value.guestCounts, { id: Date.now(), ageQualifyingCode: '10', count: 1 }] })
  }

  const removeGuestCount = (id: number) => {
    if (value.guestCounts.length <= 1) return
    onChange({ guestCounts: value.guestCounts.filter((g: OtaGuestCount) => g.id !== id) })
  }

  /* ── Special Requests helpers ── */
  const addSpecialRequest = () => {
    onChange({ specialRequests: [...value.specialRequests, { id: Date.now(), requestCode: '', text: '' }] })
  }

  const updateSpecialRequest = (id: number, patch: Partial<OtaSpecialRequest>) => {
    onChange({ specialRequests: value.specialRequests.map((s: OtaSpecialRequest) => (s.id === id ? { ...s, ...patch } : s)) })
  }

  const removeSpecialRequest = (id: number) => {
    onChange({ specialRequests: value.specialRequests.filter((s: OtaSpecialRequest) => s.id !== id) })
  }

  /* ── Comment helpers ── */
  const addComment = () => {
    onChange({ comments: [...value.comments, { id: Date.now(), guestViewable: 'true', text: '' }] })
  }

  const updateComment = (id: number, patch: Partial<OtaComment>) => {
    onChange({ comments: value.comments.map((c: OtaComment) => (c.id === id ? { ...c, ...patch } : c)) })
  }

  const removeComment = (id: number) => {
    onChange({ comments: value.comments.filter((c: OtaComment) => c.id !== id) })
  }

  return (
    <div className="space-y-5">
      {/* ── Time Span ── */}
      <Section title="Stay Duration" icon={MdDateRange} iconBg="bg-blue-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Check-in Date" required type="date" value={value.timeSpanStart} onChange={(v) => onChange({ timeSpanStart: v })} />
          <Field label="Check-out Date" required type="date" value={value.timeSpanEnd} onChange={(v) => onChange({ timeSpanEnd: v })} />
        </div>
      </Section>

      {/* ── Room Rates ── */}
      <Section title="Room Rates" icon={MdMeetingRoom} iconBg="bg-violet-100">
        <div className="space-y-4">
          {value.roomRates.map((room: OtaRoomRate, roomIdx: number) => (
            <div key={room.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              {/* Room Rate Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Room Rate #{roomIdx + 1}</span>
                {value.roomRates.length > 1 && <RemoveBtn onClick={() => removeRoomRate(room.id)} />}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label="Room Type Code (invCode)" required placeholder="e.g. DBL" value={room.invCode} onChange={(v) => updateRoomRate(room.id, { invCode: v })} />
                <Field label="Number of Units" type="number" value={room.numberOfUnits} onChange={(v) => updateRoomRate(room.id, { numberOfUnits: Number(v) || 1 })} />
                <Field label="Rate Plan Code" placeholder="e.g. BAR" value={room.ratePlanCode} onChange={(v) => updateRoomRate(room.id, { ratePlanCode: v })} />
              </div>

              {/* Rate Entries */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Rate Entries</div>
                {room.rates.map((entry: OtaRateEntry, entryIdx: number) => (
                  <div key={entry.id} className="grid grid-cols-1 gap-3 md:grid-cols-4 rounded-xl border border-slate-100 bg-white p-3">
                    <div className="md:col-span-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Entry #{entryIdx + 1}</span>
                      {room.rates.length > 1 && <RemoveBtn onClick={() => removeRateEntry(room.id, entry.id)} />}
                    </div>
                    <Field label="Amount After Tax" type="number" placeholder="0.00" value={entry.amountAfterTax} onChange={(v) => updateRateEntry(room.id, entry.id, { amountAfterTax: Number(v) || 0 })} />
                    <Field label="Amount Before Tax" type="number" placeholder="0.00" value={entry.amountBeforeTax} onChange={(v) => updateRateEntry(room.id, entry.id, { amountBeforeTax: Number(v) || 0 })} />
                    <Field label="Effective Date" type="date" value={entry.effectiveDate} onChange={(v) => updateRateEntry(room.id, entry.id, { effectiveDate: v })} />
                    <Field label="Expire Date" type="date" value={entry.expireDate} onChange={(v) => updateRateEntry(room.id, entry.id, { expireDate: v })} />
                  </div>
                ))}
                <AddRowBtn label="Add Rate Entry" onClick={() => addRateEntry(room.id)} />
              </div>
            </div>
          ))}
          <AddRowBtn label="Add Room Rate" onClick={addRoomRate} />
        </div>
      </Section>

      {/* ── Guest Count ── */}
      <Section title="Guest Count" icon={MdPeople} iconBg="bg-amber-100">
        <div className="space-y-3">
          {value.guestCounts.map((g: OtaGuestCount, idx: number) => (
            <div key={g.id} className="flex items-end gap-3">
              <div className="flex-1">
                <Field
                  label={`Guest Type #${idx + 1}`}
                  as="select"
                  options={ageQualCodes}
                  value={g.ageQualifyingCode}
                  onChange={(v) => updateGuestCount(g.id, { ageQualifyingCode: v })}
                />
              </div>
              <div className="w-28">
                <Field
                  label="Count"
                  type="number"
                  value={g.count}
                  onChange={(v) => updateGuestCount(g.id, { count: Number(v) || 0 })}
                />
              </div>
              {value.guestCounts.length > 1 && (
                <RemoveBtn onClick={() => removeGuestCount(g.id)} />
              )}
            </div>
          ))}
          <AddRowBtn label="Add Guest Type" onClick={addGuestCount} />
        </div>
      </Section>

      {/* ── Room Stay Details ── */}
      <Section title="Room Stay Details" icon={MdMeetingRoom} iconBg="bg-emerald-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Room Stay ID" placeholder="e.g. RS-001" value={value.roomStayID} onChange={(v) => onChange({ roomStayID: v })} />
          <Field label="Meal Code" placeholder="e.g. BB" value={value.mealCode} onChange={(v) => onChange({ mealCode: v })} />
          <Field label="Meal Plan Indicator" placeholder="e.g. true / false" value={value.mealPlanIndicator} onChange={(v) => onChange({ mealPlanIndicator: v })} />
          <Field label="Is Guest Per Room" placeholder="e.g. true / false" value={value.isGuestPerRoom} onChange={(v) => onChange({ isGuestPerRoom: v })} />
          <div className="md:col-span-2">
            <Field label="Guest IDs (comma-separated)" placeholder="e.g. G-001, G-002" value={value.guestIDs} onChange={(v) => onChange({ guestIDs: v })} />
          </div>
        </div>
      </Section>

      {/* ── Membership ── */}
      <Section title="Membership Info" icon={MdPeople} iconBg="bg-cyan-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Account ID" placeholder="MEM-12345" value={value.membershipAccountID} onChange={(v) => onChange({ membershipAccountID: v })} />
          <Field label="Bonus Code" placeholder="GOLD" value={value.membershipBonusCode} onChange={(v) => onChange({ membershipBonusCode: v })} />
          <Field label="Program Code" placeholder="REWARDS" value={value.membershipProgramCode} onChange={(v) => onChange({ membershipProgramCode: v })} />
        </div>
      </Section>

      {/* ── Total Price ── */}
      <Section title="Total Price" icon={MdDateRange} iconBg="bg-rose-100">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Amount After Tax" type="number" placeholder="0.00" value={value.totalAmountAfterTax} onChange={(v) => onChange({ totalAmountAfterTax: Number(v) || 0 })} />
          <Field label="Amount Before Tax" type="number" placeholder="0.00" value={value.totalAmountBeforeTax} onChange={(v) => onChange({ totalAmountBeforeTax: Number(v) || 0 })} />
          <Field label="Tax Amount" type="number" placeholder="0.00" value={value.totalTaxAmount} onChange={(v) => onChange({ totalTaxAmount: Number(v) || 0 })} />
        </div>
      </Section>

      {/* ── Special Requests ── */}
      <Section title="Special Requests" icon={MdNotes} iconBg="bg-indigo-100">
        <div className="space-y-3">
          {value.specialRequests.map((sr: OtaSpecialRequest, idx: number) => (
            <div key={sr.id} className="grid grid-cols-1 gap-3 md:grid-cols-3 items-end rounded-xl border border-slate-100 bg-slate-50 p-3">
              <Field label={`Request #${idx + 1} Code`} placeholder="e.g. NONSMOKING" value={sr.requestCode} onChange={(v) => updateSpecialRequest(sr.id, { requestCode: v })} />
              <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Text" placeholder="Describe the request" value={sr.text} onChange={(v) => updateSpecialRequest(sr.id, { text: v })} />
                </div>
                <RemoveBtn onClick={() => removeSpecialRequest(sr.id)} />
              </div>
            </div>
          ))}
          <AddRowBtn label="Add Special Request" onClick={addSpecialRequest} />
        </div>
      </Section>

      {/* ── Comments ── */}
      <Section title="Comments" icon={MdNotes} iconBg="bg-slate-100">
        <div className="space-y-3">
          {value.comments.map((c: OtaComment, idx: number) => (
            <div key={c.id} className="grid grid-cols-1 gap-3 md:grid-cols-3 items-end rounded-xl border border-slate-100 bg-slate-50 p-3">
              <Field
                label={`Comment #${idx + 1} Guest Viewable`}
                as="select"
                options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                value={c.guestViewable}
                onChange={(v) => updateComment(c.id, { guestViewable: v })}
              />
              <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Text" placeholder="Comment text" value={c.text} onChange={(v) => updateComment(c.id, { text: v })} />
                </div>
                <RemoveBtn onClick={() => removeComment(c.id)} />
              </div>
            </div>
          ))}
          <AddRowBtn label="Add Comment" onClick={addComment} />
        </div>
      </Section>
    </div>
  )
}
