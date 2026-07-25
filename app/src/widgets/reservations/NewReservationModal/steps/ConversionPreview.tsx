import type { ConversionPreviewResponse } from '../../../../models/OptionalReservation'
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'

type Props = {
  preview: ConversionPreviewResponse | null
}

export function ConversionPreview({ preview }: Props) {
  if (!preview) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <p>No preview data available.</p>
      </div>
    )
  }

  const { availability, pricing, warnings, errors, canConvert } = preview

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Conversion Preview</h2>
        <p className="mt-2 text-sm text-slate-500">
          Review the authoritative availability and pricing before finalizing the conversion.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Availability Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${availability.isAvailable ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {availability.isAvailable ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Availability</h3>
              <p className={`text-sm font-medium ${availability.isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                {availability.isAvailable ? 'Rooms Available' : 'Shortages Detected'}
              </p>
            </div>
          </div>
          <div className="pt-4">
            {availability.shortages && availability.shortages.length > 0 ? (
              <div className="space-y-3">
                {availability.shortages.map((s, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                    <span className="font-semibold">{s.roomTypeName}</span>
                    <span className="text-rose-600">
                      Date: {s.date.split('T')[0]} · Requested: {s.requestedRooms} · Available: {s.availableRooms}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">All requested rooms are currently available.</p>
            )}
          </div>
        </div>

        {/* Pricing Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-[#0B4EA2]">
              <span className="font-bold text-lg">$</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Pricing</h3>
              <p className="text-sm text-slate-500">Quoted vs Current</p>
            </div>
          </div>
          <div className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Quoted Total</span>
              <span className="font-semibold">{pricing.currency} {pricing.quotedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Current Total</span>
              <span className="font-semibold">{pricing.currency} {pricing.currentTotal.toFixed(2)}</span>
            </div>
            {pricing.discountAmount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Discount ({pricing.discountPercentage}%)</span>
                <span className="font-semibold text-emerald-600">- {pricing.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {pricing.taxAmount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold">+ {pricing.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 mt-1">
              <span className="font-bold text-slate-700">Price Difference</span>
              <span className={`font-bold ${pricing.difference > 0 ? 'text-amber-600' : pricing.difference < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {pricing.difference > 0 ? '+' : ''}{pricing.difference.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings & Errors */}
      {(warnings.length > 0 || errors.length > 0) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Server Messages</h3>
          <div className="space-y-3">
            {errors.map((err, i) => (
              <div key={`err-${i}`} className="flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                <p>{err}</p>
              </div>
            ))}
            {warnings.map((warn, i) => (
              <div key={`warn-${i}`} className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                <p>{warn}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!canConvert && (
        <div className="rounded-xl bg-rose-100 border border-rose-200 p-4 text-center text-sm font-bold text-rose-700">
          This reservation cannot be converted. Please resolve the errors above.
        </div>
      )}
    </div>
  )
}
