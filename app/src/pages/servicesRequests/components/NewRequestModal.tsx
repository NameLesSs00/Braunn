import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import {
  Department,
  Priority,
  Request,
  RequestType,
  ALL_DEPARTMENTS,
  REQUEST_TYPES,
  genId,
  now,
  ModalPortal,
} from '../shared'

type NewRequestModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (req: Request) => void
}

const EMPTY_FORM = {
  roomNumber: '',
  department: '' as Department | '',
  requestType: '' as RequestType | '',
  priority: 'Normal' as Priority,
  notes: '',
}

export function NewRequestModal({ open, onClose, onSubmit }: NewRequestModalProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.roomNumber.trim())  e.roomNumber  = 'Room Number is required'
    if (!form.department)         e.department  = 'Department is required'
    if (!form.requestType)        e.requestType = 'Request Type is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const { date, dateTime } = now()
    const req: Request = {
      id: genId(),
      guestName: 'N/A',
      roomNumber: form.roomNumber.trim(),
      department: form.department as Department,
      requestType: form.requestType as RequestType,
      priority: form.priority,
      date,
      dateTime,
      quantity: 1,
      status: 'Pending',
      notes: form.notes.trim(),
    }
    onSubmit(req)
    setForm({ ...EMPTY_FORM })
    setErrors({})
  }

  function handleClose() {
    onClose()
    setForm({ ...EMPTY_FORM })
    setErrors({})
  }

  const inp = 'h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:ring-2'
  const inputClass  = (k: string) => `${inp} ${errors[k] ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-[#0B4EA2] focus:ring-[#0B4EA2]/10'}`
  const selectClass = (k: string) => `${inp} appearance-none pr-9 ${errors[k] ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-[#0B4EA2] focus:ring-[#0B4EA2]/10'}`

  return (
    <ModalPortal open={open} onClose={handleClose}>
      <div className="w-[480px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">New Request</h2>
          <button type="button" onClick={handleClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Room Number */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
              Room Number <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass('roomNumber')}
              placeholder="Enter Number"
              value={form.roomNumber}
              onChange={(e) => set('roomNumber', e.target.value)}
            />
            {errors.roomNumber && <p className="mt-1 text-[11px] text-red-500">{errors.roomNumber}</p>}
          </div>

          {/* Department + Request Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                Select Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className={selectClass('department')}
                  value={form.department}
                  onChange={(e) => set('department', e.target.value as Department)}
                >
                  <option value="">select</option>
                  {ALL_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              {errors.department && <p className="mt-1 text-[11px] text-red-500">{errors.department}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                Request Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className={selectClass('requestType')}
                  value={form.requestType}
                  onChange={(e) => set('requestType', e.target.value as RequestType)}
                >
                  <option value="">select</option>
                  {REQUEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              {errors.requestType && <p className="mt-1 text-[11px] text-red-500">{errors.requestType}</p>}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">Priority <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {(['Normal', 'Urgent'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className={[
                    'h-11 flex-1 rounded-xl border text-sm font-semibold transition-colors',
                    form.priority === p
                      ? p === 'Urgent'
                        ? 'border-red-400 bg-red-50 text-red-600'
                        : 'border-[#0B4EA2] bg-[#F3F5FF] text-[#0B4EA2]'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time (readonly) */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">Date &amp; Time</label>
            <input
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
              value={now().dateTime}
            />
            <p className="mt-1 text-[11px] text-slate-400">Automatically set to current time</p>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">Notes (Optional)</label>
            <textarea
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 transition-all"
              placeholder="add additional details"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="h-10 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white hover:bg-[#0a3f85] transition-colors"
          >
            Submit Request
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}
