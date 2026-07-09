import { useEffect, useMemo, useState } from 'react'
import { CalendarRange, Download, X } from 'lucide-react'

import { Modal } from '../../shared/ui/Modal'

interface Props {
  open: boolean
  initialFrom: string
  initialTo: string
  onClose: () => void
  onExport: (from: string, to: string) => Promise<void>
  title?: string
  subject?: string
}

function formatDate(date: string) {
  if (!date) return '-----'
  const value = new Date(`${date}T00:00:00`)
  if (Number.isNaN(value.getTime())) return date
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ExportInHouseListPopup({
  open,
  initialFrom,
  initialTo,
  onClose,
  onExport,
  title = 'Export In-House List',
  subject = 'in-house list',
}: Props) {
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setFrom(initialFrom)
    setTo(initialTo)
    setError('')
  }, [initialFrom, initialTo, open])

  const validationError = useMemo(() => {
    if (!from || !to) return 'Please select both From and To dates.'
    if (from > to) return 'The From date cannot be after the To date.'
    return ''
  }, [from, to])

  const handleExport = async () => {
    if (validationError || isExporting) return

    setIsExporting(true)
    setError('')
    try {
      await onExport(from, to)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to export the ${subject}.`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} closeOnBackdrop>
      <div className="w-[520px] max-w-[95vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF2FF] text-[#0B4EA2]">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <p className="text-xs text-slate-500">Choose the date range for your PDF.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">From</span>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                disabled={isExporting}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">To</span>
              <input
                type="date"
                min={from}
                value={to}
                onChange={(event) => setTo(event.target.value)}
                disabled={isExporting}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              />
            </label>
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-[#F4F9FF] p-4">
            <div className="flex items-start gap-3">
              <CalendarRange className="mt-0.5 h-5 w-5 shrink-0 text-[#0B4EA2]" />
              <p className="text-sm leading-6 text-slate-700">
                Are you sure you want to export the {subject} for the dates from{' '}
                <span className="font-bold text-slate-900">{formatDate(from)}</span> to{' '}
                <span className="font-bold text-slate-900">{formatDate(to)}</span>?
              </p>
            </div>
          </div>

          {(validationError || error) && (
            <p className="mt-3 text-sm font-medium text-rose-600">{validationError || error}</p>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              No, cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={Boolean(validationError) || isExporting}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#093d81] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Yes, export'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
