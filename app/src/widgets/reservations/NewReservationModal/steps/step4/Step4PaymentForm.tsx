import { Minus, Plus } from 'lucide-react'

import { IconImage } from '../../../../../shared/ui/IconImage'

import type { ReservationDraft } from '../../../../../features/reservations/draftSlice'

import type { Pricing } from '../../../CheckInProcessModal/types'
import { Step4Card } from './Step4Card'
import { formatMoney, parseNumberOrZero } from '../../../CheckInProcessModal/utils'
import { IoMdPerson } from "react-icons/io";
import { LuIdCard } from "react-icons/lu";

type Props = {
  value: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
  nights: number
  guestsTotal: number
  pricing: Pricing
}

export function Step4PaymentForm({ value, onChange, nights, guestsTotal, pricing }: Props) {
  const depositReceived = parseNumberOrZero(value.paidAmount)
  const remainingBalance = Math.max(0, pricing.totalAmount - depositReceived)

  const addOtherPaymentRow = () => {
    const nextRow = { id: Date.now(), paymentMethod: '', paidAmount: '' }
    onChange({ otherPayments: [...value.otherPayments, nextRow] })
  }

  const updateOtherPaymentRow = (id: number, patch: Partial<{ paymentMethod: string; paidAmount: string }>) => {
    onChange({
      otherPayments: value.otherPayments.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    })
  }

  const removeOtherPaymentRow = (id: number) => {
    onChange({ otherPayments: value.otherPayments.filter((row) => row.id !== id) })
  }

  const summaryDepositPaid = pricing.requiredDeposit
  const summaryRemainingBalance = Math.max(0, pricing.totalAmount - pricing.requiredDeposit)

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
              <span className="font-semibold text-slate-800">{nights || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Number of Guest</span>
              <span className="font-semibold text-slate-800">{guestsTotal || '—'}</span>
            </div>
          </div>

          <div className="space-y-2 text-[12px] text-slate-600">
            {pricing.baseTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Base Rate:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.baseTotal)}</span>
              </div>
            )}
            {pricing.extraAdultTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Extra Adults:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.extraAdultTotal)}</span>
              </div>
            )}
            {pricing.childTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Children:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.childTotal)}</span>
              </div>
            )}
            {pricing.mealPlansTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Meal Plans:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.mealPlansTotal)}</span>
              </div>
            )}
            {pricing.extrasTotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Additional Services:</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.extrasTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Taxes & Fees:</span>
              <span className="font-semibold text-slate-800">{formatMoney(pricing.taxesAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount:</span>
              <span className="font-semibold text-slate-800">
                {pricing.discountValue ? `-${formatMoney(pricing.discountValue)}` : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#0B4EA2]">
              <span>Total Amount:</span>
              <span className="font-semibold">{formatMoney(pricing.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-[#0B4EA2]">
              <span>Required Deposit (25%):</span>
              <span className="font-semibold">{formatMoney(pricing.requiredDeposit)}</span>
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
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
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
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
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
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
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
            <div className="text-[12px] font-semibold text-slate-700">Series Code (CVV)</div>
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

      <div className="space-y-5">

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Deposit amount received</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="Enter deposit amount"
              type="number"
              value={value.depositAmountReceived}
              onChange={(e) => onChange({ depositAmountReceived: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Paid amount</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="Enter paid amount"
              type="number"
              value={value.paidAmount}
              onChange={(e) => onChange({ paidAmount: e.target.value })}
            />
            <div className="text-[11px] text-slate-500">Remaining: {formatMoney(remainingBalance)}</div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Payment Method (optional)</div>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
                value={value.paymentMethod}
                onChange={(e) => onChange({ paymentMethod: e.target.value })}
              >
                <option value="">Select Payment</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank-transfer">Bank transfer</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Payment Reference</div>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="Enter reference ID"
              value={value.paymentReference}
              onChange={(e) => onChange({ paymentReference: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Payment Date</div>
            <input
              type="date"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              value={value.paymentDate}
              onChange={(e) => onChange({ paymentDate: e.target.value })}
            />
          </div>
        </div>

        {value.otherPayments.length > 0 ? (
          <div className="space-y-4">
            {value.otherPayments.map((row) => (
              <div key={row.id} className="grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_1fr_44px]">
                <div className="space-y-2">
                  <div className="text-[12px] font-semibold text-slate-700">Payment Method (optional)</div>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
                      value={row.paymentMethod}
                      onChange={(e) => updateOtherPaymentRow(row.id, { paymentMethod: e.target.value })}
                    >
                      <option value="">Select Payment</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank-transfer">Bank transfer</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[12px] font-semibold text-slate-700">Paid amount</div>
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder="Enter amount"
                    value={row.paidAmount}
                    onChange={(e) => updateOtherPaymentRow(row.id, { paidAmount: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-xl text-slate-500 hover:bg-slate-50"
                  aria-label="Remove"
                  onClick={() => removeOtherPaymentRow(row.id)}
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 border-b border-[#0B4EA2] pb-0.5 text-sm font-medium text-[#0B4EA2]"
            onClick={addOtherPaymentRow}
          >
            <Plus className="h-5 w-5" />
            Add Other Payment Method
          </button>
        </div>
      </div>

      <Step4Card title="Coupon" titleIconBgClassName="bg-slate-100">
        <div className="flex gap-3">
          <input
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
            placeholder="Enter coupon Number"
            value={value.coupon}
            onChange={(e) => onChange({ coupon: e.target.value })}
          />
          <button type="button" className="h-11 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white">
            Apply
          </button>
        </div>
      </Step4Card>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center justify-between text-sm">
          <div className="space-y-1 text-slate-700">
            <div>Deposit Paid</div>
            <div>Remaining Balance</div>
          </div>
          <div className="space-y-1 text-right font-semibold">
            <div className="text-emerald-600">{formatMoney(summaryDepositPaid)}</div>
            <div className="text-slate-800">{formatMoney(summaryRemainingBalance)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
