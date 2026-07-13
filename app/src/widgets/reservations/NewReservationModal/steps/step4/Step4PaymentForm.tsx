import { IconImage } from '../../../../../shared/ui/IconImage'

import type { ReservationDraft } from '../../../../../features/reservations/draftSlice'

import type { Pricing } from '../../../CheckInProcessModal/types'
import { Step4Card } from './Step4Card'
import { formatMoney } from '../../../CheckInProcessModal/utils'
import { IoMdPerson } from 'react-icons/io'
import { LuIdCard } from 'react-icons/lu'

type Props = {
  value: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
  nights: number
  guestsTotal: number
  pricing: Pricing
  validationErrors?: Record<string, string>
}

export function Step4PaymentForm({ value, onChange, nights, guestsTotal, pricing, validationErrors = {} }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-[#F2F8FF] p-5">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-100">
            <IconImage src={LuIdCard} alt="" className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-slate-800">Payment Summary</div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 text-[12px] text-slate-600">
            <div className="flex items-center justify-between">
              <span>Number of nights</span>
              <span className="font-semibold text-slate-800">{nights || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Number of Guest</span>
              <span className="font-semibold text-slate-800">{guestsTotal || '-'}</span>
            </div>
          </div>

          <div className="space-y-2 text-[12px] text-slate-600">
            {pricing.baseTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Base Rate:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.baseTotal, pricing.currency)}</span>
              </div>
            )}
            {pricing.extraAdultTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Extra Adults:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.extraAdultTotal, pricing.currency)}</span>
              </div>
            )}
            {pricing.childTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Children:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.childTotal, pricing.currency)}</span>
              </div>
            )}
            {pricing.mealPlansTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Meal Plans:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.mealPlansTotal, pricing.currency)}</span>
              </div>
            )}
            {pricing.extrasTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Additional Services:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.extrasTotal, pricing.currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Taxes & Fees:</span>
              <span className="font-semibold text-slate-800">{formatMoney(pricing.taxesAmount, pricing.currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount:</span>
              <span className="font-semibold text-slate-800">
                {pricing.discountValue ? `-${formatMoney(pricing.discountValue, pricing.currency)}` : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#0B4EA2]">
              <span>Total Amount:</span>
              <span className="font-semibold">{formatMoney(pricing.totalAmount, pricing.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-[#0B4EA2]">
              <span>Required Deposit (25%):</span>
              <span className="font-semibold">{formatMoney(pricing.requiredDeposit, pricing.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      <Step4Card title="Guarantee & Payment Card" titleIconSrc={IoMdPerson}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Guarantee Type</div>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-800 outline-none focus:border-[#0B4EA2]"
                value={value.guaranteeType}
                onChange={(e) => onChange({ guaranteeType: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="GUA">Guarantee</option>
                <option value="CCARD">Credit Card</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">v</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Guarantee Code</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="Enter Code"
              value={value.guaranteeCode}
              onChange={(e) => onChange({ guaranteeCode: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Currency</div>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-800 outline-none focus:border-[#0B4EA2]"
                value={value.currency}
                onChange={(e) => onChange({ currency: e.target.value })}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="EGP">EGP</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">v</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Card Type</div>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-800 outline-none focus:border-[#0B4EA2]"
                value={value.cardType}
                onChange={(e) => onChange({ cardType: e.target.value })}
              >
                <option value="">Select Card</option>
                <option value="AX">American Express</option>
                <option value="MC">MasterCard</option>
                <option value="VI">Visa</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">v</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Card Code</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="Enter Card Code"
              value={value.cardCode}
              onChange={(e) => onChange({ cardCode: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Card Holder Name</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="Name on card"
              value={value.cardHolderName}
              onChange={(e) => onChange({ cardHolderName: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Card Number</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="XXXX XXXX XXXX XXXX"
              value={value.cardNo}
              onChange={(e) => onChange({ cardNo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Expiration Date</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="MM/YY"
              value={value.cardExpire}
              onChange={(e) => onChange({ cardExpire: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Series Code</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="XXX"
              type="password"
              maxLength={4}
              value={value.cardSeriesCode}
              onChange={(e) => onChange({ cardSeriesCode: e.target.value })}
            />
          </div>
        </div>
      </Step4Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-[12px] font-semibold text-slate-700">Payment Method</div>
          <div className="relative">
            <select
              className={[
                'h-11 w-full appearance-none rounded-xl border bg-white px-4 pr-11 text-sm text-slate-500 outline-none',
                validationErrors.paymentMethod ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#0B4EA2]',
              ].join(' ')}
              value={value.paymentMethod}
              onChange={(e) => onChange({ paymentMethod: e.target.value })}
            >
              <option value="">Select Payment</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank-transfer">Bank transfer</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">v</span>
          </div>
          {validationErrors.paymentMethod ? <div className="mt-1 text-[11px] font-semibold text-rose-600">Please select Payment Method.</div> : null}
        </div>
      </div>
    </div>
  )
}
